"use client";

// Stage 1: THE MESSAGE — players discover the page from the HTML comment on homepage
// Stage 2: THE ARCHIVE — hidden text (white on white / invisible span)
// Stage 3: THE SOURCE — JS comment in source revealing "static" and /signal

import ChallengeFrame from "@/components/ChallengeFrame";
import { useEffect, useState } from "react";

// Stage selector based on team progress
export default function ArchivePage() {
  const [currentStage, setCurrentStage] = useState<string | null>(null);

  useEffect(() => {
    const getToken = () => {
      const cookie = document.cookie
        .split("; ")
        .find((r) => r.startsWith("team_token="))
        ?.split("=")[1];
      return cookie || localStorage.getItem("team_token") || "";
    };

    const token = getToken();
    if (!token) return;

    fetch("/api/team", { headers: { "x-team-token": token } })
      .then((r) => r.json())
      .then((data) => {
        const completed: string[] = data.completedChallenges || [];
        if (!completed.includes("the-message")) {
          setCurrentStage("the-message");
        } else if (!completed.includes("the-archive")) {
          setCurrentStage("the-archive");
        } else {
          setCurrentStage("the-source");
        }
      });
  }, []);

  if (!currentStage) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)" }}>ACCESSING ARCHIVE...</div>
      </div>
    );
  }

  return (
    <ChallengeFrame challengeId={currentStage}>
      <ArchiveContent stage={currentStage} />
    </ChallengeFrame>
  );
}

function ArchiveContent({ stage }: { stage: string }) {
  // Stage 2: Hidden text puzzle — white text on white background
  // Stage 3: JS comment in source

  if (stage === "the-message") {
    return (
      <div
        className="card"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.85rem",
          lineHeight: 2,
          color: "var(--text-secondary)",
        }}
      >
        <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
          ARCHIVE TERMINAL
        </div>
        <p style={{ marginBottom: "12px" }}>
          You&apos;ve found the archive. But what were you looking for?
        </p>
        <p style={{ color: "var(--text-muted)" }}>
          The page you came from held the first clue. 
          If you found it, you know where to go next.
        </p>
        <p style={{ marginTop: "16px", color: "var(--accent-cyan)", fontSize: "0.8rem" }}>
          Enter what you found in the homepage source...
        </p>
      </div>
    );
  }

  if (stage === "the-archive") {
    return (
      <div className="card" style={{ position: "relative" }}>
        <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
          ARCHIVE CONTENT — FILE INDEX
        </div>
        
        <div style={{ lineHeight: 2, color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "16px" }}>
          <p>FILE: null_report_2024.txt — <span style={{ color: "var(--accent-red)" }}>MISSING</span></p>
          <p>FILE: access_log.csv — <span style={{ color: "var(--accent-green)" }}>FOUND</span></p>
          <p>FILE: transmission_alpha.enc — <span style={{ color: "var(--accent-amber)" }}>ENCRYPTED</span></p>
          <p>FILE: _______.________ — 
            {/* Hidden text — same color as background. Try selecting all text! */}
            <span style={{ color: "#050810", userSelect: "text" }} aria-hidden="true">index</span>
            <span style={{ color: "var(--text-muted)" }}> [REDACTED]</span>
          </p>
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "12px 14px",
            background: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.15)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            fontStyle: "italic",
          }}
        >
          "Sometimes text can hide in plain sight — invisible, but present. 
          Try selecting everything on this page."
        </div>
      </div>
    );
  }

  // Stage 3: THE SOURCE
  // The JS comment below is intentionally left in the source code
  return (
    <div className="card">
      <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
        NULL&apos;S LAST KNOWN TRANSMISSION
      </div>
      
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-dim)",
          padding: "16px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.8rem",
          lineHeight: 2,
          color: "var(--text-secondary)",
          marginBottom: "16px",
          overflowX: "auto",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>// Archive access log</p>
        <p style={{ color: "var(--text-muted)" }}>// Date: [REDACTED]</p>
        <p style={{ color: "var(--text-muted)" }}>// Operator: NULL</p>
        <p>&nbsp;</p>
        <p><span style={{ color: "var(--accent-purple)" }}>const</span> <span style={{ color: "var(--accent-cyan)" }}>status</span> = <span style={{ color: "var(--accent-green)" }}>&quot;transmission_active&quot;</span>;</p>
        <p>&nbsp;</p>
        <p style={{ color: "var(--text-muted)" }}>// I was never meant to be seen.</p>
        <p style={{ color: "var(--text-muted)" }}>// But you looked. Good.</p>
        <p style={{ color: "var(--text-muted)" }}>// The encoded message is waiting.</p>
      </div>

      <div
        style={{
          padding: "12px 14px",
          background: "rgba(124, 58, 237, 0.06)",
          border: "1px solid rgba(124, 58, 237, 0.2)",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
        }}
      >
        "You looked at the page. Did you look at the page <em>itself</em>? 
        The source code tells a different story."
      </div>

      {/* Hidden JS comment in source — visible only in page source */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
// NULL left a message encoded in the signal
// The page is quiet. Nothing moves. The word you need is: static
// Hint: try visiting /signal for the encoded transmission
`,
        }}
      />
    </div>
  );
}
