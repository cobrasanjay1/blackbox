"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CHALLENGES, TOTAL_CHALLENGES } from "@/lib/challenges";
import { fetchTeam } from "@/lib/teamClient";

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stageParam = searchParams.get("stage");
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    const r = await fetchTeam();
    if (r.status === "unauth") { router.push("/"); return; }
    if (r.status === "offline") { setOffline(true); setLoading(false); return; }

    setOffline(false);
    const data = r.team;
    setTeamName(data.name);

    if (stageParam) {
      const target = CHALLENGES.find((c) => c.id === stageParam);
      if (target) { router.push(getStageUrl(stageParam)); return; }
    }

    const completed = data.completedChallenges;
    if (completed.length >= TOTAL_CHALLENGES) { router.push("/victory"); return; }

    const nextChallenge = CHALLENGES.find((c) => !completed.includes(c.id));
    router.push(nextChallenge ? getStageUrl(nextChallenge.id) : "/victory");
  }, [router, stageParam]);

  useEffect(() => {
    load();
    window.addEventListener("online", load);
    return () => window.removeEventListener("online", load);
  }, [load]);

  if (offline) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div className="mono" style={{ color: "var(--accent-red)", fontSize: "0.9rem", letterSpacing: "0.15em" }}>
          CONNECTION LOST. YOUR PROGRESS IS SAFE.
        </div>
        <button className="btn-ghost" onClick={() => { setOffline(false); setLoading(true); load(); }}>
          [ RETRY ]
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div className="mono" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", letterSpacing: "0.15em" }}>
          ACCESSING INVESTIGATION FILES...
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {[0,1,2].map((i) => (
            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-cyan)", animation: `pulse-glow 1s ${i * 0.2}s infinite` }} />
          ))}
        </div>
        {teamName && <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>AGENT: {teamName}</div>}
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
    "the-message": "/archive",
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
