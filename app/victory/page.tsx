"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTeam } from "@/lib/teamClient";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

interface TeamData {
  name: string;
  completedAt: string | null;
  startedAt?: string;
  durationSeconds?: number;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }
  return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
}

export default function VictoryPage() {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [particles, setParticles] = useState<{ x: number; y: number; delay: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTeam()
      .then((r) => {
        if (r.status === "unauth") {
          router.push("/");
          return;
        }
        if (r.status === "ok") {
          setTeam({ name: r.team.name, completedAt: r.team.completedAt ?? null });
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="mono" style={{ color: "var(--accent-green)" }}>DECRYPTING FINAL RESULT...</div>
      </div>
    );
  }

  const teamName = team?.name || localStorage.getItem("team_name") || "Unknown Team";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        background:
          "radial-gradient(ellipse at 50% 50%, rgba(0, 255, 135, 0.08) 0%, transparent 60%)",
        overflow: "hidden",
      }}
    >
      {/* Ambient particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: "var(--accent-green)",
            opacity: 0.4,
            animation: `pulse-glow ${2 + p.delay}s ${p.delay}s infinite`,
          }}
        />
      ))}

      <div style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
        {/* Status badge */}
        <div
          className="mono animate-fade-in"
          style={{
            color: "var(--accent-green)",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            marginBottom: "24px",
            padding: "8px 20px",
            border: "1px solid rgba(0, 255, 135, 0.3)",
            display: "inline-block",
            background: "rgba(0, 255, 135, 0.06)",
            animation: "pulse-glow 3s infinite",
          }}
        >
          ✓ ACCESS GRANTED
        </div>

        {/* Main title */}
        <h1
          className="animate-fade-in"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.06em",
            color: "var(--text-primary)",
            marginBottom: "12px",
            animationDelay: "0.2s",
          }}
        >
          THE FILE HAS BEEN
          <br />
          <span style={{ color: "var(--accent-green)" }}>RECOVERED</span>
        </h1>

        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, var(--accent-green), transparent)",
            margin: "24px 0",
          }}
        />

        {/* Team stats */}
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: "24px",
            borderColor: "rgba(0, 255, 135, 0.2)",
            background: "rgba(0, 255, 135, 0.03)",
            animationDelay: "0.4s",
          }}
        >
          <div
            className="mono"
            style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}
          >
            INVESTIGATION COMPLETE
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <StatRow label="TEAM" value={teamName} color="var(--text-primary)" />
            <StatRow
              label="STATUS"
              value={`ALL ${TOTAL_CHALLENGES} STAGES CLEARED`}
              color="var(--accent-green)"
            />
          </div>
        </div>

        {/* The message */}
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: "32px",
            animationDelay: "0.6s",
            borderLeft: "2px solid var(--accent-cyan)",
          }}
        >
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 2,
              fontStyle: "italic",
              fontSize: "1rem",
            }}
          >
            "You didn&apos;t hack the system.
            <br />
            You simply learned how to{" "}
            <span style={{ color: "var(--text-primary)", fontStyle: "normal", fontWeight: 600 }}>
              look at it
            </span>
            ."
          </p>
          <div
            className="mono"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              marginTop: "12px",
            }}
          >
            — NULL
          </div>
        </div>

        {/* What you learned */}
        <div className="card animate-fade-in" style={{ marginBottom: "32px", animationDelay: "0.8s", textAlign: "left" }}>
          <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "14px" }}>
            SKILLS ACQUIRED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              "HTML Comments",
              "Hidden Text",
              "Page Source",
              "Base64 Encoding",
              "URL Parameters",
              "Cookies & Local Storage",
              "JavaScript Console",
              "File Metadata",
              "Caesar Cipher",
              "Investigative Thinking",
            ].map((skill) => (
              <div
                key={skill}
                className="mono"
                style={{
                  fontSize: "0.7rem",
                  color: "var(--accent-green)",
                  padding: "6px 10px",
                  background: "rgba(0, 255, 135, 0.06)",
                  border: "1px solid rgba(0, 255, 135, 0.15)",
                }}
              >
                ✓ {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          className="animate-fade-in"
          style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", animationDelay: "1s" }}
        >
          <a
            href="/leaderboard"
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            [ VIEW LEADERBOARD ]
          </a>
          <a
            href="/"
            className="btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            START OVER
          </a>
        </div>

        <div
          className="mono animate-fade-in"
          style={{
            marginTop: "48px",
            color: "var(--text-muted)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            opacity: 0.5,
            animationDelay: "1.2s",
          }}
        >
          BLACK BOX ASSOCIATION · INVESTIGATION SYSTEM · CASE CLOSED
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid var(--border-dim)",
      }}
    >
      <span className="mono" style={{ color: "var(--text-muted)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span className="mono" style={{ color, fontSize: "0.85rem", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
