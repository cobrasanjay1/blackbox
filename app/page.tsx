"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchTeam } from "@/lib/teamClient";

const CLUE_01_COMMENT =
  "<!-- CLUE_01: You're already looking in the right place. The archive is waiting. Try visiting /archive -->";

export default function HomePage() {
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"intro" | "register">("intro");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [titleText, setTitleText] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const fullTitle = "THE LOST FILE";

  // Typewriter effect for title
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, i + 1));
      i++;
      if (i >= fullTitle.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Existing session on this device? Offer to continue instead of forcing it.
  useEffect(() => {
    fetchTeam(1).then((r) => {
      if (r.status === "ok") setResumeName(r.team.name);
    });
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    if (needsCode && !/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit team code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(needsCode ? "/api/team/login" : "/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          needsCode
            ? { name: teamName.trim(), code: code.trim() }
            : { name: teamName.trim() }
        ),
      });
      const data = await res.json();

      if (res.status === 409 && data.taken) {
        setNeedsCode(true);
        setError(data.error);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Failed to register team");
        return;
      }

      localStorage.setItem("team_token", data.token);
      localStorage.setItem("team_name", data.name);

      if (data.code) {
        setIssuedCode(data.code);
        return;
      }

      router.push("/game");
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (!issuedCode) return;
    try {
      await navigator.clipboard.writeText(issuedCode);
      setCopied(true);
    } catch {}
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(124, 58, 237, 0.08) 0%, transparent 50%)",
      }}
    >
      {/* Stage 1 clue: real HTML comment visible in page source */}
      <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: CLUE_01_COMMENT }} />

      {/* Corner decorations */
      <CornerDecor />

      <div style={{ maxWidth: "640px", width: "100%", textAlign: "center" }}>
        {/* Association tag */}
        <div
          className="mono"
          style={{
            color: "var(--text-muted)",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "40px",
            opacity: 0.8,
          }}
        >
          BLACK BOX ASSOCIATION · INVESTIGATION SYSTEM v1.0
        </div>

        {/* Main title with glitch */}
        <div style={{ marginBottom: "12px", position: "relative" }}>
          <div
            className="glitch-text"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: "'JetBrains Mono', monospace",
              color: "var(--text-primary)",
              lineHeight: 1,
            }}
          >
            {titleText}
            {titleText.length < fullTitle.length && (
              <span style={{ color: "var(--accent-cyan)", animation: "typing-cursor 1s infinite" }}>█</span>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginBottom: "48px",
          }}
        >
          <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, transparent, var(--border-dim))" }} />
          <span
            className="mono"
            style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
          >
            DIGITAL INVESTIGATION
          </span>
          <div style={{ height: "1px", width: "60px", background: "linear-gradient(90deg, var(--border-dim), transparent)" }} />
        </div>

        {/* Story text */}
        <div
          className="card card-glow animate-fade-in"
          style={{ marginBottom: "32px", textAlign: "left" }}
        >
          {/* Incident log header */}
          <div
            className="mono"
            style={{
              color: "var(--accent-red)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-red)", display: "inline-block", animation: "pulse-glow 2s infinite" }} />
            INCIDENT LOG · 02:13:47 AM
          </div>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "16px" }}>
            At 02:13 AM, someone accessed the{" "}
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
              Black Box Association Archive
            </span>
            . One file disappeared. The only thing left behind was this website.
          </p>

          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "16px" }}>
            The entity known only as{" "}
            <span className="mono" style={{ color: "var(--accent-cyan)" }}>NULL</span>{" "}
            left a trail. Nobody knows whether it's an invitation, a warning, or a trap.
          </p>

          <p style={{ color: "var(--text-primary)", lineHeight: 1.8, fontStyle: "italic" }}>
            "If you're reading this... perhaps the file wasn't deleted. Perhaps it was{" "}
            <span style={{ color: "var(--accent-purple)" }}>hidden</span>."
          </p>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-dim)",
              color: "var(--accent-green)",
              fontSize: "0.8rem",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            ✓ No cybersecurity experience required.
            <br />
            ✓ Everything you need is somewhere on this website.
          </div>
        </div>

        {/* Continue an existing session on this device */}
        {resumeName && !issuedCode && (
          <div className="card card-glow animate-fade-in" style={{ marginBottom: "24px" }}>
            <div
              className="mono"
              style={{ color: "var(--accent-cyan)", fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "16px" }}
            >
              SESSION FOUND
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>
              Continue as <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{resumeName}</span>?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" className="btn-primary" onClick={() => router.push("/game")}>
                [ CONTINUE ]
              </button>
              <button type="button" className="btn-ghost" onClick={() => setResumeName(null)}>
                [ USE A DIFFERENT TEAM ]
              </button>
            </div>
          </div>
        )}

        {/* One-time team code after registering */}
        {issuedCode && (
          <div className="card card-glow animate-fade-in" style={{ marginBottom: "24px" }}>
            <div
              className="mono"
              style={{ color: "var(--accent-cyan)", fontSize: "0.65rem", letterSpacing: "0.2em", marginBottom: "16px" }}
            >
              TEAM REGISTERED · SAVE YOUR CODE
            </div>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>
              Use this 6-digit code with your team name to rejoin from another device or after clearing your browser. Share it only with your teammates.
            </p>
            <div className="mono" style={{ fontSize: "2.4rem", letterSpacing: "0.4em", color: "var(--text-primary)", marginBottom: "16px" }}>
              {issuedCode}
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" className="btn-ghost" onClick={copyCode}>
                {copied ? "[ COPIED ]" : "[ COPY CODE ]"}
              </button>
              <button type="button" className="btn-primary" onClick={() => router.push("/game")}>
                [ CONTINUE ]
              </button>
            </div>
          </div>
        )}

        {/* Team Registration */}
        {!issuedCode && !resumeName && (
        <div className="card animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div
            className="mono"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              marginBottom: "20px",
            }}
          >
            TEAM REGISTRATION
          </div>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label
                htmlFor="teamName"
                className="mono"
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.75rem",
                  marginBottom: "8px",
                  letterSpacing: "0.1em",
                }}
              >
                TEAM NAME
              </label>
              <input
                id="teamName"
                ref={inputRef}
                type="text"
                className="input-cyber"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name..."
                maxLength={50}
                disabled={loading}
                autoComplete="off"
                style={{ fontSize: "1rem" }}
              />
            </div>

            {needsCode && (
              <div>
                <label
                  htmlFor="teamCode"
                  className="mono"
                  style={{
                    display: "block",
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                    marginBottom: "8px",
                    letterSpacing: "0.1em",
                  }}
                >
                  6-DIGIT TEAM CODE
                </label>
                <input
                  id="teamCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="input-cyber"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter your team code..."
                  disabled={loading}
                  autoComplete="off"
                  style={{ fontSize: "1rem" }}
                />
              </div>
            )}

            {error && (
              <div
                className="mono"
                style={{
                  color: "var(--accent-red)",
                  fontSize: "0.8rem",
                  padding: "8px 12px",
                  background: "rgba(255, 71, 87, 0.08)",
                  border: "1px solid rgba(255, 71, 87, 0.2)",
                }}
              >
                ✕ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !teamName.trim()}
              style={{
                marginTop: "8px",
                opacity: loading || !teamName.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "CONNECTING..." : "[ BEGIN INVESTIGATION ]"}
            </button>
          </form>
        </div>
        )}

        {/* Leaderboard link */}
        <div style={{ marginTop: "24px" }}>
          <a
            href="/leaderboard"
            className="mono"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            VIEW LEADERBOARD →
          </a>
        </div>

        {/* Footer */}
        <div
          className="mono"
          style={{
            marginTop: "48px",
            color: "var(--text-muted)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            opacity: 0.5,
          }}
        >
          BLACK BOX ASSOCIATION · CYBERSECURITY EVENT · {new Date().getFullYear()}
        </div>
      </div>
    </main>
  );
}

function CornerDecor() {
  const style = {
    position: "fixed" as const,
    width: "80px",
    height: "80px",
    opacity: 0.3,
  };

  const lineStyle = {
    position: "absolute" as const,
    background: "var(--accent-cyan)",
  };

  return (
    <>
      {/* Top left */}
      <div style={{ ...style, top: 20, left: 20 }}>
        <div style={{ ...lineStyle, top: 0, left: 0, width: "30px", height: "1px" }} />
        <div style={{ ...lineStyle, top: 0, left: 0, width: "1px", height: "30px" }} />
      </div>
      {/* Top right */}
      <div style={{ ...style, top: 20, right: 20 }}>
        <div style={{ ...lineStyle, top: 0, right: 0, width: "30px", height: "1px" }} />
        <div style={{ ...lineStyle, top: 0, right: 0, width: "1px", height: "30px" }} />
      </div>
      {/* Bottom left */}
      <div style={{ ...style, bottom: 20, left: 20 }}>
        <div style={{ ...lineStyle, bottom: 0, left: 0, width: "30px", height: "1px" }} />
        <div style={{ ...lineStyle, bottom: 0, left: 0, width: "1px", height: "30px" }} />
      </div>
      {/* Bottom right */}
      <div style={{ ...style, bottom: 20, right: 20 }}>
        <div style={{ ...lineStyle, bottom: 0, right: 0, width: "30px", height: "1px" }} />
        <div style={{ ...lineStyle, bottom: 0, right: 0, width: "1px", height: "30px" }} />
      </div>
    </>
  );
}
