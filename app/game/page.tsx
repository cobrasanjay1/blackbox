"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CHALLENGES, TOTAL_CHALLENGES } from "@/lib/challenges";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageParam = searchParams.get("stage");

  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");

  const getToken = () => {
    const cookie = document.cookie
      .split("; ")
      .find((r) => r.startsWith("team_token="))
      ?.split("=")[1];
    return cookie || localStorage.getItem("team_token") || "";
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    fetch("/api/team", { headers: { "x-team-token": token } })
      .then((r) => r.json())
      .then((data) => {
        if (!data.id) {
          router.push("/");
          return;
        }

        setTeamName(data.name);

        // If a specific stage is requested via param, go there
        if (stageParam) {
          const target = CHALLENGES.find((c) => c.id === stageParam);
          if (target) {
            router.push(getStageUrl(stageParam));
            return;
          }
        }

        // Determine current stage
        const completed = data.completedChallenges as string[];
        if (completed.length >= TOTAL_CHALLENGES) {
          router.push("/victory");
          return;
        }

        // Find next incomplete challenge
        const nextChallenge = CHALLENGES.find((c) => !completed.includes(c.id));
        if (nextChallenge) {
          router.push(getStageUrl(nextChallenge.id));
        } else {
          router.push("/victory");
        }
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [router, stageParam]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div
          className="mono"
          style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", letterSpacing: "0.15em" }}
        >
          ACCESSING INVESTIGATION FILES...
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--accent-cyan)",
                animation: `pulse-glow 1s ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        {teamName && (
          <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            AGENT: {teamName}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function GamePage() {
  return (
    <Suspense>
      <GameContent />
    </Suspense>
  );
}

function getStageUrl(challengeId: string): string {
  const stageRoutes: Record<string, string> = {
    "the-message": "/archive",      // First hint found, now go to archive
    "the-archive": "/archive",
    "the-source": "/archive",
    "the-signal": "/signal",
    "the-parameter": "/signal",
    "the-memory": "/trace",
    "the-script": "/trace",
    "the-image": "/vault/gate",
    "the-cipher": "/vault",
    "the-cookie": "/cookie",
    "the-key": "/vault/final",
  };
  return stageRoutes[challengeId] ?? "/";
}
