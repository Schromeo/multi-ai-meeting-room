import {
  emptyUsage,
  finalizeInterruptedTurns,
  legacyMeetingHistoryKey,
  MeetingRecord,
  meetingHistoryLimit,
  parseMeetingRecord,
  ParticipantSnapshot,
  TranscriptItem,
} from "./meeting-record";
import { UsageSummary } from "./discuss-protocol";
import { MeetingState } from "./meeting-state";

const databaseName = "multi-ai-meeting-room";
const databaseVersion = 1;
const migrationMarker = "legacy-history-v1";

const stores = {
  rooms: "rooms",
  participants: "participants",
  events: "events",
  snapshots: "stateSnapshots",
  artifacts: "artifacts",
  usage: "usage",
  metadata: "metadata",
} as const;

type RoomRow = {
  id: string;
  objective: string;
  stage: MeetingRecord["stage"];
  createdAt: string;
  updatedAt: string;
};

type ParticipantRow = ParticipantSnapshot & {
  id: string;
  roomId: string;
  position: number;
};

type EventRow = {
  id: string;
  roomId: string;
  sequence: number;
  type:
    | "agenda.published"
    | "turn.completed"
    | "turn.failed"
    | "turn.format_failed"
    | "turn.reduction_failed";
  createdAt: string;
  payload: TranscriptItem;
};

type SnapshotRow = {
  roomId: string;
  version: 1;
  stage: MeetingRecord["stage"];
  decision: MeetingRecord["decision"];
  iteration: number;
  lastEventSequence: number;
  createdAt: string;
  updatedAt: string;
  canonicalState?: MeetingState;
};

type ArtifactRow = {
  id: string;
  roomId: string;
  type: "decision.memo";
  version: number;
  content: string;
  createdAt: string;
};

type UsageRow = UsageSummary & {
  id: string;
  roomId: string;
  iteration: number;
  updatedAt: string;
};

type MetadataRow = {
  key: string;
  completedAt: string;
  migratedRecords: number;
};

export type RoomStoreInitialization = {
  records: MeetingRecord[];
  migratedRecords: number;
};

export interface RoomStore {
  initialize(): Promise<RoomStoreInitialization>;
  listRooms(): Promise<MeetingRecord[]>;
  putRoom(record: MeetingRecord): Promise<void>;
  deleteRoom(roomId: string): Promise<void>;
}

export function createBrowserRoomStore(): RoomStore {
  return new IndexedDbRoomStore();
}

class IndexedDbRoomStore implements RoomStore {
  private readonly database = openDatabase();
  private writeQueue: Promise<void> = Promise.resolve();

  async initialize(): Promise<RoomStoreInitialization> {
    const db = await this.database;
    const migratedRecords = await migrateLegacyHistory(db);
    return { records: await listRoomRecords(db), migratedRecords };
  }

  async listRooms() {
    return listRoomRecords(await this.database);
  }

  putRoom(record: MeetingRecord) {
    const parsed = parseMeetingRecord(record);
    if (!parsed) return Promise.reject(new Error("The meeting record is invalid."));
    return this.enqueue(async () => {
      const db = await this.database;
      await writeRoomRecord(Promise.resolve(db), parsed);
      await pruneOldRooms(db);
    });
  }

  deleteRoom(roomId: string) {
    if (!roomId) return Promise.reject(new Error("A room id is required."));
    return this.enqueue(() => deleteRoomRecord(this.database, roomId));
  }

  private enqueue(operation: () => Promise<void>) {
    const next = this.writeQueue.then(operation, operation);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      const rooms = db.createObjectStore(stores.rooms, { keyPath: "id" });
      rooms.createIndex("updatedAt", "updatedAt");

      const participants = db.createObjectStore(stores.participants, { keyPath: "id" });
      participants.createIndex("roomId", "roomId");

      const events = db.createObjectStore(stores.events, { keyPath: "id" });
      events.createIndex("roomId", "roomId");

      db.createObjectStore(stores.snapshots, { keyPath: "roomId" });

      const artifacts = db.createObjectStore(stores.artifacts, { keyPath: "id" });
      artifacts.createIndex("roomId", "roomId");

      const usage = db.createObjectStore(stores.usage, { keyPath: "id" });
      usage.createIndex("roomId", "roomId");

      db.createObjectStore(stores.metadata, { keyPath: "key" });
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error ?? new Error("Could not open the meeting database."));
    request.onblocked = () => reject(new Error("The meeting database upgrade is blocked by another tab."));
  });
}

async function migrateLegacyHistory(db: IDBDatabase) {
  const marker = await getMetadata(db, migrationMarker);
  if (marker) return 0;

  const records = readLegacyRecords();
  for (const record of records) await writeRoomRecord(Promise.resolve(db), record);

  const transaction = db.transaction(stores.metadata, "readwrite");
  const done = transactionDone(transaction);
  transaction.objectStore(stores.metadata).put({
    key: migrationMarker,
    completedAt: new Date().toISOString(),
    migratedRecords: records.length,
  } satisfies MetadataRow);
  await done;

  try {
    window.localStorage.removeItem(legacyMeetingHistoryKey);
  } catch {
    // Migration is already committed; blocked cleanup must not roll it back.
  }
  return records.length;
}

function readLegacyRecords() {
  try {
    const value = window.localStorage.getItem(legacyMeetingHistoryKey);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(parseMeetingRecord)
      .filter((record): record is MeetingRecord => Boolean(record))
      .map(finalizeInterruptedTurns)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, meetingHistoryLimit);
  } catch {
    return [];
  }
}

async function getMetadata(db: IDBDatabase, key: string) {
  const transaction = db.transaction(stores.metadata, "readonly");
  const done = transactionDone(transaction);
  const result = await requestResult<MetadataRow | undefined>(
    transaction.objectStore(stores.metadata).get(key),
  );
  await done;
  return result;
}

async function writeRoomRecord(database: Promise<IDBDatabase>, record: MeetingRecord) {
  const db = await database;
  const storeNames = Object.values(stores).filter((name) => name !== stores.metadata);
  const transaction = db.transaction(storeNames, "readwrite");
  const done = transactionDone(transaction);

  transaction.objectStore(stores.rooms).put({
    id: record.id,
    objective: record.objective,
    stage: record.stage,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  } satisfies RoomRow);

  const participantStore = transaction.objectStore(stores.participants);
  for (let position = 0; position < 20; position += 1) {
    participantStore.delete(`${record.id}:participant:${position}`);
  }
  record.participants.forEach((participant, position) => {
    participantStore.put({
      id: `${record.id}:participant:${position}`,
      roomId: record.id,
      position,
      ...participant,
    } satisfies ParticipantRow);
  });

  const eventStore = transaction.objectStore(stores.events);
  record.transcript.forEach((item, sequence) => {
    if (item.status === "streaming") return;
    const request = eventStore.add({
      id: `${record.id}:event:${item.id}`,
      roomId: record.id,
      sequence,
      type: item.provider === "host"
        ? "agenda.published"
        : item.formatError
          ? "turn.format_failed"
          : item.reductionError
            ? "turn.reduction_failed"
            : item.status === "error" ? "turn.failed" : "turn.completed",
      createdAt: record.updatedAt,
      payload: item,
    } satisfies EventRow);
    request.onerror = (event) => {
      if (request.error?.name !== "ConstraintError") return;
      event.preventDefault();
      event.stopPropagation();
    };
  });

  transaction.objectStore(stores.snapshots).put({
    roomId: record.id,
    version: 1,
    stage: record.stage,
    decision: record.decision,
    iteration: record.iteration,
    lastEventSequence: record.transcript.reduce(
      (latest, item, sequence) => item.status === "streaming" ? latest : sequence,
      -1,
    ),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    ...(record.meetingState ? { canonicalState: record.meetingState } : {}),
  } satisfies SnapshotRow);

  if (record.memo) {
    transaction.objectStore(stores.artifacts).put({
      id: `${record.id}:decision.memo:${record.iteration}`,
      roomId: record.id,
      type: "decision.memo",
      version: record.iteration,
      content: record.memo,
      createdAt: record.updatedAt,
    } satisfies ArtifactRow);
  }

  transaction.objectStore(stores.usage).put({
    id: `${record.id}:usage:${record.iteration}`,
    roomId: record.id,
    iteration: record.iteration,
    updatedAt: record.updatedAt,
    ...record.usage,
  } satisfies UsageRow);

  await done;
}

async function listRoomRecords(db: IDBDatabase): Promise<MeetingRecord[]> {
  const storeNames = Object.values(stores).filter((name) => name !== stores.metadata);
  const transaction = db.transaction(storeNames, "readonly");
  const done = transactionDone(transaction);
  const [roomRows, participantRows, eventRows, snapshotRows, artifactRows, usageRows] =
    await Promise.all([
      requestResult<RoomRow[]>(transaction.objectStore(stores.rooms).getAll()),
      requestResult<ParticipantRow[]>(transaction.objectStore(stores.participants).getAll()),
      requestResult<EventRow[]>(transaction.objectStore(stores.events).getAll()),
      requestResult<SnapshotRow[]>(transaction.objectStore(stores.snapshots).getAll()),
      requestResult<ArtifactRow[]>(transaction.objectStore(stores.artifacts).getAll()),
      requestResult<UsageRow[]>(transaction.objectStore(stores.usage).getAll()),
    ]);
  await done;

  const records = roomRows.flatMap((room): MeetingRecord[] => {
    const snapshot = snapshotRows.find((item) => item.roomId === room.id);
    if (!snapshot) return [];
    const participants = participantRows
      .filter((item) => item.roomId === room.id)
      .sort((a, b) => a.position - b.position)
      .map(({ provider, providerName, model, role }) => ({ provider, providerName, model, role }));
    const transcript = eventRows
      .filter((item) => item.roomId === room.id)
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => item.payload);
    const artifact = artifactRows
      .filter((item) => item.roomId === room.id)
      .sort((a, b) => b.version - a.version)[0];
    const usage = usageRows
      .filter((item) => item.roomId === room.id)
      .sort((a, b) => b.iteration - a.iteration)[0];
    const parsed = parseMeetingRecord({
      version: 1,
      id: room.id,
      objective: room.objective,
      stage: snapshot.stage,
      transcript,
      memo: artifact?.content ?? "",
      decision: snapshot.decision,
      usage: usage
        ? {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            estimatedUsd: usage.estimatedUsd,
            latencyMs: usage.latencyMs,
          }
        : emptyUsage,
      iteration: snapshot.iteration,
      participants,
      ...(snapshot.canonicalState ? { meetingState: snapshot.canonicalState } : {}),
      createdAt: room.createdAt,
      updatedAt: snapshot.updatedAt,
    });
    return parsed ? [parsed] : [];
  });

  return records
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, meetingHistoryLimit);
}

async function deleteRoomRecord(database: Promise<IDBDatabase>, roomId: string) {
  const db = await database;
  const storeNames = Object.values(stores).filter((name) => name !== stores.metadata);
  const transaction = db.transaction(storeNames, "readwrite");
  const done = transactionDone(transaction);
  transaction.objectStore(stores.rooms).delete(roomId);
  transaction.objectStore(stores.snapshots).delete(roomId);
  deleteRowsByRoom(transaction.objectStore(stores.participants), roomId);
  deleteRowsByRoom(transaction.objectStore(stores.events), roomId);
  deleteRowsByRoom(transaction.objectStore(stores.artifacts), roomId);
  deleteRowsByRoom(transaction.objectStore(stores.usage), roomId);
  await done;
}

async function pruneOldRooms(db: IDBDatabase) {
  const transaction = db.transaction(stores.rooms, "readonly");
  const done = transactionDone(transaction);
  const rooms = await requestResult<RoomRow[]>(transaction.objectStore(stores.rooms).getAll());
  await done;
  const expired = rooms
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(meetingHistoryLimit);
  for (const room of expired) await deleteRoomRecord(Promise.resolve(db), room.id);
}

function deleteRowsByRoom(store: IDBObjectStore, roomId: string) {
  const request = store.index("roomId").openKeyCursor(IDBKeyRange.only(roomId));
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return;
    store.delete(cursor.primaryKey);
    cursor.continue();
  };
}

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("The meeting database request failed."));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("The meeting database transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("The meeting database transaction was aborted."));
  });
}
