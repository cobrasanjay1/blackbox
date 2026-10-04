"use client";

// Stage 6: THE MEMORY — cookie + localStorage clue
// Stage 7: THE SCRIPT — JS variable in console/source

import ChallengeFrame from "@/components/ChallengeFrame";
import { fetchTeam } from "@/lib/teamClient";
import { useEffect, useState } from "react";

export default function TracePage() {
  const [currentStage, setCurrentStage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      document.cookie = "clue=look_deeper; path=/; SameSite=Strict";
      localStorage.setItem("null_message", "the_trace");
      localStorage.setItem(
        "_null_note",
        "The trace you're looking for is right here. Key: null_message"
      );
      return fetchTeam().then((r) => {
        if (cancelled) return;
        if (r.status === "unauth") {
          window.location.href = "/";
          return;
        }
        if (r.status !== "ok") return;
        const data = r.team;
        const completed: string[] = data.completedChallenges || [];
        if (!completed.includes("the-memory")) {
          setCurrentStage("the-memory");
        } else {
          setCurrentStage("the-script");
        }
      });
    };
    run();
    window.addEventListener("online", run);
    return () => {
      cancelled = true;
      window.removeEventListener("online", run);
    };
  }, []);

  // Stage 7 JS variable — exposed on window
  useEffect(() => {
    if (currentStage === "the-script") {
      // This variable is intentionally set on window for the puzzle
      // Players can read it via DevTools console
      (window as unknown as Record<string, unknown>)["next_clue"] = "vault";
    }
  }, [currentStage]);

  if (!currentStage) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)" }}>TRACING SIGNAL...</div>
      </div>
    );
  }

  return (
    <ChallengeFrame challengeId={currentStage}>
      <TraceContent stage={currentStage} />
    </ChallengeFrame>
  );
}

function TraceContent({ stage }: { stage: string }) {
  const [showDevtoolsGuide, setShowDevtoolsGuide] = useState(false);

  if (stage === "the-memory") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="card">
          <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
            BROWSER MEMORY ANALYSIS
          </div>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "16px" }}>
            Browsers remember things. Even after you close a tab, 
            evidence can remain — stored silently in what browsers call{" "}
            <span style={{ color: "var(--accent-cyan)" }}>local storage</span> and{" "}
            <span style={{ color: "var(--accent-cyan)" }}>cookies</span>.
          </p>

          <div
            style={{
              padding: "16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-dim)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.8rem",
              lineHeight: 2,
              marginBottom: "16px",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: "8px" }}>// Cookie trace detected:</div>
            <div>
              <span style={{ color: "var(--accent-purple)" }}>clue</span>
              <span style={{ color: "var(--text-muted)" }}>=</span>
              <span style={{ color: "var(--accent-amber)" }}>look_deeper</span>
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              background: "rgba(124, 58, 237, 0.05)",
              border: "1px solid rgba(124, 58, 237, 0.15)",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              fontStyle: "italic",
            }}
          >
            "The browser remembers what happened here. But cookies aren&apos;t the only memory."
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowDevtoolsGuide(!showDevtoolsGuide)}
            className="btn-secondary"
            style={{ fontSize: "0.75rem" }}
          >
            {showDevtoolsGuide ? "[ HIDE GUIDE ]" : "[ HOW TO OPEN DEVTOOLS ]"}
          </button>

          {showDevtoolsGuide && (
            <div
              className="hint-reveal card"
              style={{ marginTop: "12px" }}
            >
              <div className="mono" style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "12px" }}>
                OPENING DEVELOPER TOOLS
              </div>
              <ol
                style={{
                  color: "var(--text-secondary)",
                  paddingLeft: "20px",
                  lineHeight: 2.2,
                  fontSize: "0.85rem",
                }}
              >
                <li>Press <kbd style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace" }}>F12</kbd> or right-click the page → &quot;Inspect&quot;</li>
                <li>Click the <strong style={{ color: "var(--text-primary)" }}>Application</strong> tab (Chrome) or <strong style={{ color: "var(--text-primary)" }}>Storage</strong> tab (Firefox)</li>
                <li>Expand <strong style={{ color: "var(--text-primary)" }}>Local Storage</strong> → click this site&apos;s URL</li>
                <li>You should see key-value pairs stored there</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Stage 7: THE SCRIPT
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card">
        <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
          SCRIPT ANALYSIS
        </div>

        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "16px" }}>
          NULL wrote something in this page&apos;s JavaScript. Not to display it — to hide it.
          Pages run invisible instructions called scripts, and those scripts can store values
          you can read from the console.
        </p>

        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-dim)",
            padding: "16px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.8rem",
            lineHeight: 2,
            marginBottom: "16px",
            overflowX: "auto",
          }}
        >
          <div style={{ color: "var(--text-muted)" }}>// NULL&apos;s hidden instruction</div>
          <div>
            <span style={{ color: "var(--accent-purple)" }}>window</span>
            <span style={{ color: "var(--text-muted)" }}>.</span>
            <span style={{ color: "var(--accent-cyan)" }}>next_clue</span>
            <span style={{ color: "var(--text-muted)" }}> = </span>
            <span style={{ color: "var(--accent-amber)" }}>&quot;[?]&quot;</span>
            <span style={{ color: "var(--text-muted)" }}>;</span>
          </div>
          <div style={{ color: "var(--text-muted)", marginTop: "8px" }}>// Open the browser console to read it.</div>
          <div style={{ color: "var(--text-muted)" }}>// Type: next_clue</div>
        </div>

        <div
          style={{
            padding: "12px 14px",
            background: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.1)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ color: "var(--accent-cyan)", fontFamily: "monospace" }}>HOW:</span>{" "}
          Press F12 → click &quot;Console&quot; tab → type{" "}
          <code
            style={{
              background: "var(--bg-elevated)",
              padding: "2px 6px",
              fontFamily: "monospace",
              color: "var(--accent-cyan)",
            }}
          >
            next_clue
          </code>{" "}
          and press Enter.
        </div>
      </div>

      {/* Script tag that sets the variable — this IS the puzzle */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
// NULL's trace: the next destination is encoded here
window.next_clue = "vault";
// If you're reading this in the source... you already know.
`,
        }}
      />
    </div>
  );
}
