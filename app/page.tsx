"use client";

import { FormEvent, useMemo, useState } from "react";

type Mode = "brainstorm" | "review" | "decision";
type AgentKey = "gpt" | "claude" | "gemini" | "builder";
type Message = {
  id: number;
  agent: AgentKey | "host";
  role: string;
  text: string;
  tag: string;
};

const modes: Array<{ key: Mode; label: string; intent: string }> = [
  {
    key: "brainstorm",
    label: "Brainstorm",
    intent: "Open the option space and generate angles.",
  },
  {
    key: "review",
    label: "Review",
    intent: "Attack assumptions, risks, and missing evidence.",
  },
  {
    key: "decision",
    label: "Decision",
    intent: "Converge into a recommendation and next actions.",
  },
];

const agents: Array<{
  key: AgentKey;
  name: string;
  model: string;
  specialty: string;
  color: string;
}> = [
  {
    key: "gpt",
    name: "GPT Strategist",
    model: "OpenAI",
    specialty: "Product framing, synthesis, tradeoffs",
    color: "mint",
  },
  {
    key: "claude",
    name: "Claude Critic",
    model: "Anthropic",
    specialty: "Writing quality, risk review, objections",
    color: "coral",
  },
  {
    key: "gemini",
    name: "Gemini Scout",
    model: "Google",
    specialty: "Research lens, market scan, factual gaps",
    color: "blue",
  },
  {
    key: "builder",
    name: "Builder Agent",
    model: "Local role",
    specialty: "MVP scope, system design, execution plan",
    color: "gold",
  },
];

const agentCopy: Record<
  AgentKey,
  Record<Mode, (topic: string, round: number) => string>
> = {
  gpt: {
    brainstorm: (topic) =>
      `I would frame "${topic}" as a hosted deliberation workflow, not a many-chatbots page. The first user win is asking one hard question and watching specialists expose options, blind spots, and a usable conclusion.`,
    review: () =>
      "The main risk is false confidence. Multiple models can agree on a wrong premise, so the room needs evidence labels, uncertainty, and a way to send claims into fact-check instead of treating consensus as truth.",
    decision: () =>
      "Recommendation: ship a narrow product-planning room first. Optimize for agenda, role prompts, critique rounds, decision log, and exportable next steps before adding every model provider.",
  },
  claude: {
    brainstorm: () =>
      "The emotional hook matters: users should feel like they are chairing a serious conversation, not watching four answer boxes compete. Give each AI a voice, a mandate, and permission to disagree.",
    review: () =>
      "I would challenge the meeting metaphor if it becomes slow or performative. The product should preserve momentum: short turns, interrupt controls, and a visible path toward synthesis.",
    decision: () =>
      "Keep the default room small: Strategist, Critic, Researcher, Builder. More agents should be opt-in because cognitive load grows faster than model count.",
  },
  gemini: {
    brainstorm: () =>
      "A useful research pattern is separating claims from opinions. The room can maintain a live queue of facts to verify, sources needed, market references, and assumptions that are still unresolved.",
    review: () =>
      "The competitive set already covers side-by-side model comparison. Differentiation needs structured artifacts: agenda, disputes, evidence gaps, owner decisions, and reusable meeting templates.",
    decision: () =>
      "The most defensible wedge is product and strategy work, where users naturally want PM, engineering, market, and critic perspectives in one controllable session.",
  },
  builder: {
    brainstorm: () =>
      "MVP architecture can start provider-agnostic: one Room object, Agent profiles, Turn events, Insight extraction, and a Synthesis pass. Real model adapters can plug in after the UX proves itself.",
    review: () =>
      "Do not start with autonomous agents running forever. Use bounded rounds and explicit host controls so cost, context, and attention stay predictable.",
    decision: (_topic, round) =>
      `Round ${round} should end with an artifact: a decision memo, PRD outline, or task plan. That artifact is the value users keep after the discussion scroll disappears.`,
  },
};

const seedMessages: Message[] = [
  {
    id: 1,
    agent: "host",
    role: "Host",
    tag: "Agenda",
    text: "Room opened for: should we build a multi-AI meeting room for product thinking and planning?",
  },
  {
    id: 2,
    agent: "gpt",
    role: "GPT Strategist",
    tag: "Frame",
    text: "The opportunity is not model comparison. It is structured deliberation: roles, critique, evidence, and synthesis.",
  },
  {
    id: 3,
    agent: "claude",
    role: "Claude Critic",
    tag: "Concern",
    text: "The product has to avoid theater. Every AI turn should move a decision forward or reveal a meaningful gap.",
  },
  {
    id: 4,
    agent: "builder",
    role: "Builder Agent",
    tag: "MVP",
    text: "Start local, simulate agents, prove the meeting mechanics, then connect real providers through adapters.",
  },
];

const insightTemplates = {
  assumptions: [
    "Users want disagreement, not just more answers.",
    "A small set of strong roles beats a large crowd of generic agents.",
    "The host needs control over round length, who speaks, and when to synthesize.",
  ],
  risks: [
    "Consensus can still hallucinate without evidence checks.",
    "Too many turns can feel expensive and noisy.",
    "Provider API differences may complicate context and streaming behavior.",
  ],
  decisions: [
    "Build the first wedge around product planning and strategy review.",
    "Use role-based prompts before adding autonomous agent loops.",
    "Make the final artifact the primary output of every room.",
  ],
};

export default function Home() {
  const [topic, setTopic] = useState(
    "Design an AI meeting room for product strategy and MVP planning",
  );
  const [mode, setMode] = useState<Mode>("brainstorm");
  const [round, setRound] = useState(1);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [activeAgents, setActiveAgents] = useState<AgentKey[]>(
    agents.map((agent) => agent.key),
  );
  const [isThinking, setIsThinking] = useState(false);

  const activeAgentData = useMemo(
    () => agents.filter((agent) => activeAgents.includes(agent.key)),
    [activeAgents],
  );

  function toggleAgent(agent: AgentKey) {
    setActiveAgents((current) => {
      if (current.includes(agent)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== agent);
      }
      return [...current, agent];
    });
  }

  function runRound(nextMode = mode) {
    setIsThinking(true);
    window.setTimeout(() => {
      const nextRound = round + 1;
      const nextMessages: Message[] = activeAgentData.map((agent, index) => ({
        id: Date.now() + index,
        agent: agent.key,
        role: agent.name,
        tag: modes.find((item) => item.key === nextMode)?.label ?? "Round",
        text: agentCopy[agent.key][nextMode](topic, nextRound),
      }));
      setMessages((current) => [...current, ...nextMessages]);
      setRound(nextRound);
      setIsThinking(false);
    }, 520);
  }

  function synthesize() {
    setIsThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          agent: "host",
          role: "Synthesizer",
          tag: "Memo",
          text:
            "Decision memo: build a focused product-planning room with four default roles, bounded critique rounds, a fact-check queue, and an exportable plan. Delay full autonomy until the hosted meeting loop feels excellent.",
        },
      ]);
      setMode("decision");
      setIsThinking(false);
    }, 420);
  }

  function submitAgenda(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        agent: "host",
        role: "Host",
        tag: "Agenda",
        text: `New agenda: ${topic}`,
      },
    ]);
    runRound("brainstorm");
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Deliberation Room</p>
            <h1>Multi-AI Meeting Room</h1>
          </div>
          <div className="room-stats" aria-label="Room status">
            <span>{activeAgents.length} agents</span>
            <span>Round {round}</span>
            <span>{mode}</span>
          </div>
        </header>

        <form className="agenda" onSubmit={submitAgenda}>
          <label htmlFor="topic">Meeting agenda</label>
          <div className="agenda-row">
            <input
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What should the AI room decide?"
            />
            <button type="submit">Ask Room</button>
          </div>
        </form>

        <div className="mode-strip" role="tablist" aria-label="Meeting mode">
          {modes.map((item) => (
            <button
              className={mode === item.key ? "mode active" : "mode"}
              key={item.key}
              onClick={() => setMode(item.key)}
              type="button"
            >
              <span>{item.label}</span>
              <small>{item.intent}</small>
            </button>
          ))}
        </div>

        <section className="meeting-grid" aria-label="Meeting room">
          <aside className="agent-rail" aria-label="Participants">
            {agents.map((agent) => (
              <button
                type="button"
                className={
                  activeAgents.includes(agent.key)
                    ? `agent-seat ${agent.color} active`
                    : `agent-seat ${agent.color}`
                }
                key={agent.key}
                onClick={() => toggleAgent(agent.key)}
              >
                <span className="avatar">{agent.name.slice(0, 1)}</span>
                <span>
                  <strong>{agent.name}</strong>
                  <small>{agent.specialty}</small>
                </span>
              </button>
            ))}
          </aside>

          <section className="transcript" aria-label="Meeting transcript">
            <div className="transcript-head">
              <div>
                <p className="eyebrow">Live discussion</p>
                <h2>{modes.find((item) => item.key === mode)?.label} round</h2>
              </div>
              <div className={isThinking ? "pulse on" : "pulse"}>
                {isThinking ? "thinking" : "ready"}
              </div>
            </div>

            <div className="messages">
              {messages.map((message) => (
                <article
                  className={
                    message.agent === "host"
                      ? "message host-message"
                      : `message ${message.agent}`
                  }
                  key={message.id}
                >
                  <div className="message-meta">
                    <strong>{message.role}</strong>
                    <span>{message.tag}</span>
                  </div>
                  <p>{message.text}</p>
                </article>
              ))}
            </div>

            <div className="controls" aria-label="Meeting controls">
              <button type="button" onClick={() => runRound()} disabled={isThinking}>
                Run Next Round
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("review");
                  runRound("review");
                }}
                disabled={isThinking}
              >
                Challenge Assumptions
              </button>
              <button type="button" onClick={synthesize} disabled={isThinking}>
                Synthesize
              </button>
            </div>
          </section>

          <aside className="insights" aria-label="Meeting artifacts">
            <section>
              <p className="eyebrow">Artifacts</p>
              <h2>Decision Surface</h2>
            </section>

            <div className="artifact-block">
              <h3>Assumptions</h3>
              {insightTemplates.assumptions.map((item) => (
                <label key={item} className="check-row">
                  <input type="checkbox" defaultChecked />
                  <span>{item}</span>
                </label>
              ))}
            </div>

            <div className="artifact-block">
              <h3>Risks to review</h3>
              <ul>
                {insightTemplates.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="artifact-block">
              <h3>Current decisions</h3>
              <ol>
                {insightTemplates.decisions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <button className="export-button" type="button" onClick={synthesize}>
              Generate Decision Memo
            </button>
          </aside>
        </section>
      </section>
    </main>
  );
}
