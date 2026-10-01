"use client";

// Stage 4: THE SIGNAL — Base64 decode
// Stage 5: THE PARAMETER — URL query parameter manipulation
// The encoded string decodes to: "Unlock the next door. Ask the server for a file named node."
// Stage 4 answer: unlock (first word). Then the player must change ?file=missing to ?file=node (Stage 5 answer: node)

import ChallengeFrame from "@/components/ChallengeFrame";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ENCODED_MESSAGE =
  "VW5sb2NrIHRoZSBuZXh0IGRvb3IuIEFzayB0aGUgc2VydmVyIGZvciBhIGZpbGUgbmFtZWQgbm9kZS4=";
// Decoded: "Unlock the next door. Ask the server for a file named node."

function SignalContent() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file");
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

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
        if (!completed.includes("the-signal")) {
          setCurrentStage("the-signal");
        } else {
          setCurrentStage("the-parameter");
        }
      });
  }, []);

  if (!currentStage) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)" }}>INTERCEPTING SIGNAL...</div>
      </div>
    );
  }

  return (
    <ChallengeFrame challengeId={currentStage}>
      {currentStage === "the-signal" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Encoded message display */}
          <div className="card">
            <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
              INTERCEPTED TRANSMISSION
            </div>
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                padding: "20px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(0.75rem, 2vw, 1rem)",
                color: "var(--accent-amber)",
                letterSpacing: "0.05em",
                wordBreak: "break-all",
                lineHeight: 1.8,
              }}
            >
              {ENCODED_MESSAGE}
            </div>
            <div
              style={{
                marginTop: "16px",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                fontStyle: "italic",
                lineHeight: 1.7,
              }}
            >
              "The message looks strange. Perhaps it was encoded, not encrypted.
              Encoded means it can be reversed — you just need the right tool."
            </div>
          </div>

          {/* Decoder tool hint */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(0, 212, 255, 0.04)",
              border: "1px solid rgba(0, 212, 255, 0.1)",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: "var(--accent-cyan)" }}>TIP:</span> The encoded string contains only letters, numbers,
            and possibly = at the end. This pattern has a name. Searching for it online will
            reveal a free decoder.
          </div>

          {/* Reveal decoded button (optional helper) */}
          <div>
            <button
              onClick={() => setRevealed(!revealed)}
              className="btn-ghost"
              style={{ fontSize: "0.75rem" }}
            >
              {revealed ? "[ HIDE DECODED MESSAGE ]" : "[ ALREADY DECODED? CONFIRM IT HERE ]"}
            </button>
            {revealed && (
              <div
                className="hint-reveal mono"
                style={{
                  marginTop: "10px",
                  padding: "12px 16px",
                  background: "rgba(0, 255, 135, 0.05)",
                  border: "1px solid rgba(0, 255, 135, 0.15)",
                  fontSize: "0.85rem",
                  color: "var(--accent-green)",
                }}
              >
                DECODED: &quot;Unlock the next door. Ask the server for a file named node.&quot;
                <br />
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  Now submit the first word of this message.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stage 5: THE PARAMETER */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
              FILE REQUEST SYSTEM
            </div>

            {/* URL display */}
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-dim)",
                padding: "12px 16px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>🔒</span>
              <span style={{ color: "var(--text-muted)" }}>
                /signal<span style={{ color: "var(--accent-amber)" }}>?file=</span>
                <span style={{ color: fileParam === "node" ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {fileParam || "missing"}
                </span>
              </span>
            </div>

            {fileParam === "node" ? (
              <div>
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(0, 255, 135, 0.06)",
                    border: "1px solid rgba(0, 255, 135, 0.2)",
                    marginBottom: "16px",
                  }}
                >
                  <div className="mono" style={{ color: "var(--accent-green)", marginBottom: "10px", fontSize: "0.8rem" }}>
                    ✓ FILE LOCATED
                  </div>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                    The file was never truly missing. It was waiting for the right request.
                    <br />
                    <span className="mono" style={{ color: "var(--accent-cyan)" }}>null_report_2024.txt</span> — RECOVERED
                  </p>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  The parameter changed everything. Submit what you changed it to.
                </p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: "16px",
                    background: "rgba(255, 71, 87, 0.06)",
                    border: "1px solid rgba(255, 71, 87, 0.2)",
                    marginBottom: "16px",
                  }}
                >
                  <div className="mono" style={{ color: "var(--accent-red)", marginBottom: "10px", fontSize: "0.8rem" }}>
                    ✕ FILE NOT FOUND
                  </div>
                  <p style={{ color: "var(--text-secondary)" }}>
                    The file marked as &quot;missing&quot; cannot be retrieved.
                    <br />
                    But what if it&apos;s not actually missing?
                  </p>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  "URLs aren&apos;t just addresses — they&apos;re conversations. 
                  Try changing what comes after ?file= in your browser&apos;s address bar."
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </ChallengeFrame>
  );
}

export default function SignalPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)" }}>INTERCEPTING SIGNAL...</div>
      </div>
    }>
      <SignalContent />
    </Suspense>
  );
}
