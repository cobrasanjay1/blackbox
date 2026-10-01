"use client";

// Stage 11: THE KEY — first letters of the Stage 1-6 answers (mirror, index, static,
// unlock, node, anchor) -> m i s u n a, grouped 3-1-2 -> "mis-u-na"

import ChallengeFrame from "@/components/ChallengeFrame";

export default function VaultFinalPage() {
  return (
    <ChallengeFrame challengeId="the-key">
      <FinalContent />
    </ChallengeFrame>
  );
}

function FinalContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Dramatic final lock */}
      <div
        className="card"
        style={{
          textAlign: "center",
          borderColor: "rgba(124, 58, 237, 0.4)",
          background: "rgba(124, 58, 237, 0.04)",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            fontSize: "3rem",
            marginBottom: "16px",
            animation: "pulse-glow 3s infinite",
          }}
        >
          🔐
        </div>
        <div
          className="mono"
          style={{
            fontSize: "1.2rem",
            color: "var(--accent-purple)",
            letterSpacing: "0.15em",
            marginBottom: "20px",
          }}
        >
          FINAL LOCK
        </div>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: "480px", margin: "0 auto" }}>
          Every investigation ends with a conclusion. NULL left one final lock on the archive.
          The key is made of everything you&apos;ve discovered — six fragments, combined into one truth.
        </p>
      </div>

      {/* Fragment reminders */}
      <div className="card">
        <div
          className="mono"
          style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}
        >
          EVIDENCE FRAGMENTS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <FragmentCard
            stage="STAGES 01 · 02 · 03"
            hint="Take the first letter of the word you submitted in each of the first three stages, in order. These form the first group."
            color="var(--accent-cyan)"
          />
          <FragmentCard
            stage="STAGE 04 — THE SIGNAL"
            hint="Take the first letter of the word you submitted here. It stands alone as the second group."
            color="var(--accent-purple)"
          />
          <FragmentCard
            stage="STAGES 05 · 06"
            hint="Take the first letter of the word you submitted in each of these two stages, in order. These form the last group."
            color="var(--accent-amber)"
          />
        </div>
      </div>

      {/* Format instruction */}
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.8rem",
        }}
      >
        <div style={{ color: "var(--text-muted)", marginBottom: "8px" }}>// Key format:</div>
        <div style={{ color: "var(--text-secondary)" }}>
          [3 letters]<span style={{ color: "var(--accent-amber)" }}>-</span>[1 letter]<span style={{ color: "var(--accent-amber)" }}>-</span>[2 letters]
        </div>
        <div style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.75rem" }}>// All lowercase, hyphens between the groups, no spaces</div>
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: "rgba(0, 255, 135, 0.04)",
          border: "1px solid rgba(0, 255, 135, 0.15)",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
        }}
      >
        "You found what was never lost. The file was here all along — waiting for someone
        curious enough to look."
      </div>
    </div>
  );
}

function FragmentCard({
  stage,
  hint,
  color,
}: {
  stage: string;
  hint: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--bg-elevated)",
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        className="mono"
        style={{ color, fontSize: "0.65rem", letterSpacing: "0.15em", marginBottom: "8px" }}
      >
        {stage}
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
        {hint}
      </p>
    </div>
  );
}
