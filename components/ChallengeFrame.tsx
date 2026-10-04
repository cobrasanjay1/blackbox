"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CHALLENGES, TOTAL_CHALLENGES, type Challenge } from "@/lib/challenges";
import { fetchTeam, getToken, type TeamState } from "@/lib/teamClient";

interface ChallengeFrameProps {
  challengeId: string;
  children: React.ReactNode;
  customAnswer?: boolean; // If true, child handles submission
  onAnswerSubmit?: (answer: string) => Promise<{ correct: boolean; message?: string }>;
}

export default function ChallengeFrame({
  challengeId,
  children,
  customAnswer = false,
  onAnswerSubmit,
}: ChallengeFrameProps) {
  const [team, setTeam] = useState<TeamState | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState(() => {
    try {
      return typeof window === "undefined" ? "" : sessionStorage.getItem(`bb_draft_${challengeId}`) ?? "";
    } catch { return ""; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    type: "correct" | "wrong" | null;
    message: string;
  }>({ type: null, message: "" });
  const [hints, setHints] = useState<string[]>([]);
  const [hintLoading, setHintLoading] = useState(false);
  const [allHintsRevealed, setAllHintsRevealed] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const router = useRouter();
  const [offline, setOffline] = useState(false);
  const draftKey = `bb_draft_${challengeId}`;

token  const loadTeam = useCallback(async () => {
    const r = await fetchTeam();
    if (r.status === "unauth") {
      router.push("/");
      return;
    }
    if (r.status === "offline") {
      setOffline(true);
      return;
    }
    setOffline(false);
    const data = r.team;
    setTeam(data);

    if (data.completedChallenges.includes(challengeId)) {
      setAlreadyCompleted(true);
      setResult({ type: "correct", message: "This stage is already complete. Continue your investigation." });
    }

    const usedHintIndexes: number[] = data.hints[challengeId] || [];
    if (usedHintIndexes.length > 0) {
      const challengeData = CHALLENGES.find((c) => c.id === challengeId);
      if (challengeData) {
        const usedHints = usedHintIndexes.sort((a,b)=>a-b).map((i)=>challengeData.hints[i]).filter(Boolean);
        setHints(usedHints);
        setAllHintsRevealed(usedHintIndexes.length >= challengeData.hints.length);
      }
    }
  }, [challengeId, router]);

  useEffect(() => {
    const c = CHALLENGES.find((ch) => ch.id === challengeId);
    setChallenge(c || null);
    loadTeam();
    window.addEventListener("online", loadTeam);
    return () => window.removeEventListener("online", loadTeam);
  }, [challengeId, loadTeam]);

  useEffect(() => {
    try { sessionStorage.setItem(draftKey, answer); } catch {}
  }, [answer, draftKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    setResult({ type: null, message: "" });

    try {
      if (customAnswer && onAnswerSubmit) {
        const res = await onAnswerSubmit(answer.trim());
        if (res.correct) {
          setResult({ type: "correct", message: res.message || "CLUE ACCEPTED. The trail continues..." });
          setAlreadyCompleted(true);
          setTimeout(() => {
            const nextChallenge = CHALLENGES.find((c) => c.order === (challenge?.order ?? 0) + 1);
            if (nextChallenge) {
              router.push(`/game?stage=${nextChallenge.id}`);
            } else {
              router.push("/victory");
            }
          }, 2000);
        } else {
          setResult({ type: "wrong", message: res.message || "That's not it. Look closer." });
        }
        return;
      }

      const token = getToken();
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "x-team-token": token } : {}),
        },
        body: JSON.stringify({ challengeId, answer: answer.trim() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setResult({ type: "wrong", message: data.error });
        return;
      }

      if (data.correct) {
        setResult({ type: "correct", message: "✓ CLUE ACCEPTED — The trail continues..." });
        setAlreadyCompleted(true);
        setTimeout(() => {
          if (data.gameComplete) {
            router.push("/victory");
          } else if (data.nextChallengeId) {
            router.push(`/game?stage=${data.nextChallengeId}`);
          } else {
            router.push("/game");
          }
        }, 2000);
      } else {
        setResult({
          type: "wrong",
          message: data.message || "✕ That's not it. Look closer.",
        });
      }
    } catch {
      setResult({ type: "wrong", message: "Connection error. Your answer is kept, try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHint = async () => {
    if (hintLoading || allHintsRevealed) return;
    setHintLoading(true);

    try {
      const token = getToken();
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-team-token": token,
        },
        body: JSON.stringify({ challengeId }),
      });

      const data = await res.json();
      if (data.hints) {
        setHints(data.hints);
        setAllHintsRevealed(data.allRevealed);
      }
    } catch {
      //
    } finally {
      setHintLoading(false);
    }
  };

  if (offline && !team) {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",gap:"16px",alignItems:"center",justifyContent:"center"}}>
        <div className="mono" style={{color:"var(--accent-red)",fontSize:"0.9rem",letterSpacing:"0.1em"}}>CONNECTION LOST. YOUR PROGRESS IS SAFE.</div>
        <button className="btn-ghost" onClick={loadTeam}>[ RETRY ]</button>
      </div>
    );
  }

  if (!challenge || !team) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", letterSpacing: "0.1em" }}>
          LOADING INVESTIGATION...
        </div>
      </div>
    );
  }

  const completedCount = team.completedChallenges.length;
  const progressPercent = (completedCount / TOTAL_CHALLENGES) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(124, 58, 237, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(0, 212, 255, 0.04) 0%, transparent 50%)",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(8, 13, 24, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div className="mono" style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", letterSpacing: "0.15em" }}>
          BLACK BOX · <span style={{ color: "var(--text-muted)" }}>INVESTIGATION</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="mono"
              style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}
            >
              {completedCount}/{TOTAL_CHALLENGES}
            </div>
            <div className="progress-track" style={{ width: "100px" }}>
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Team name */}
          <div
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
              maxWidth: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {team.name}
          </div>

          {team.code && (
            <div className="mono" title="Share this code with teammates so they can rejoin" style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.12em" }}>
              CODE {team.code}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: "32px 24px", maxWidth: "720px", margin: "0 auto", width: "100%" }}>
        {/* Stage header */}
        <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
          <div
            className="mono"
            style={{
              color: "var(--accent-purple)",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              marginBottom: "8px",
            }}
          >
            STAGE {challenge.order.toString().padStart(2, "0")} / {TOTAL_CHALLENGES.toString().padStart(2, "0")}
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.06em",
              color: "var(--text-primary)",
            }}
          >
            {challenge.title}
          </h1>
        </div>

        {/* Story fragment */}
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: "24px",
            borderLeft: "2px solid var(--accent-purple)",
            animationDelay: "0.1s",
          }}
        >
          <div
            className="mono"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "10px" }}
          >
            TRANSMISSION RECEIVED
          </div>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontStyle: "italic" }}>
            {challenge.storyFragment}
          </p>
        </div>

        {/* Challenge description */}
        <div
          className="card card-glow animate-fade-in"
          style={{ marginBottom: "24px", animationDelay: "0.2s" }}
        >
          <div
            className="mono"
            style={{ color: "var(--accent-cyan)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "12px" }}
          >
            ◈ OBJECTIVE
          </div>
          <p style={{ color: "var(--text-primary)", lineHeight: 1.8 }}>
            {challenge.description}
          </p>
        </div>

        {/* Challenge-specific content (injected by parent) */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {children}
        </div>

        {/* Answer input */}
        {!alreadyCompleted && (
          <div
            className="card animate-fade-in"
            style={{ marginTop: "24px", animationDelay: "0.4s" }}
          >
            <div
              className="mono"
              style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "14px" }}
            >
              ENTER CLUE
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                id={`answer-${challengeId}`}
                type="text"
                className="input-cyber"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                disabled={submitting}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              {result.type && (
                <div
                  className="mono"
                  style={{
                    fontSize: "0.8rem",
                    padding: "10px 14px",
                    background:
                      result.type === "correct"
                        ? "rgba(0, 255, 135, 0.08)"
                        : "rgba(255, 71, 87, 0.08)",
                    border: `1px solid ${result.type === "correct" ? "rgba(0, 255, 135, 0.25)" : "rgba(255, 71, 87, 0.25)"}`,
                    color: result.type === "correct" ? "var(--accent-green)" : "var(--accent-red)",
                  }}
                >
                  {result.message}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !answer.trim()}
                style={{ opacity: submitting || !answer.trim() ? 0.6 : 1 }}
              >
                {submitting ? "VERIFYING..." : "[ SUBMIT ]"}
              </button>
            </form>
          </div>
        )}

        {/* Already completed state */}
        {alreadyCompleted && result.type === "correct" && (
          <div
            className="card animate-fade-in"
            style={{
              marginTop: "24px",
              border: "1px solid rgba(0, 255, 135, 0.25)",
              background: "rgba(0, 255, 135, 0.03)",
            }}
          >
            <div
              className="mono"
              style={{ color: "var(--accent-green)", fontSize: "0.85rem", marginBottom: "12px" }}
            >
              ✓ STAGE COMPLETE
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {result.message}
            </p>
          </div>
        )}

        {/* Hint system */}
        <div
          className="animate-fade-in"
          style={{ marginTop: "32px", animationDelay: "0.5s" }}
        >
          {hints.length > 0 && (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {hints.map((hint, i) => (
                <div
                  key={i}
                  className="hint-reveal"
                  style={{
                    padding: "12px 14px",
                    background: "rgba(124, 58, 237, 0.06)",
                    border: "1px solid rgba(124, 58, 237, 0.2)",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    className="mono"
                    style={{ color: "var(--accent-purple)", fontSize: "0.7rem", marginRight: "8px" }}
                  >
                    HINT {i + 1}
                  </span>
                  {hint}
                </div>
              ))}
            </div>
          )}

          {!allHintsRevealed && !alreadyCompleted && (
            <button
              onClick={handleHint}
              className="btn-ghost"
              disabled={hintLoading}
              style={{ fontSize: "0.75rem" }}
            >
              {hintLoading ? "LOADING..." : hints.length === 0 ? "[ NEED A HINT? ]" : "[ REVEAL NEXT HINT ]"}
            </button>
          )}

          {allHintsRevealed && (
            <div
              className="mono"
              style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.1em" }}
            >
              ALL HINTS REVEALED. KEEP LOOKING.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
