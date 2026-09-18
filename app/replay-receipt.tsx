"use client";

import { useRef, useState } from "react";

export async function copyReceiptText(text: string, writeText?: (text: string) => Promise<void>) {
  try {
    if (!writeText) return false;
    await writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ReplayReceipt({ receipt }: { receipt: object }) {
  const text = JSON.stringify(receipt, null, 2);
  const field = useRef<HTMLTextAreaElement>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "manual">("idle");

  async function copy() {
    const copied = await copyReceiptText(text, navigator.clipboard?.writeText.bind(navigator.clipboard));
    setCopyStatus(copied ? "copied" : "manual");
    if (!copied) {
      field.current?.focus();
      field.current?.select();
    }
  }

  return (
    <details className="replay-receipt">
      <summary>Evidence receipt</summary>
      <button type="button" className="text-button" onClick={() => void copy()}>Copy receipt</button>
      <span role="status">{copyStatus === "copied" ? "Copied" : copyStatus === "manual" ? "Clipboard unavailable. Receipt selected for manual copy." : ""}</span>
      <textarea ref={field} aria-label="Evidence receipt JSON" readOnly value={text} spellCheck={false} />
    </details>
  );
}
