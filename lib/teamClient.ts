export type TeamState = {
  id: string;
  name: string;
  code?: string | null;
  completedChallenges: string[];
  hints: Record<string, number[]>;
};

export type TeamResult =
  | { status: "ok"; team: TeamState }
  | { status: "unauth" }
  | { status: "offline" };

export const getToken = () =>
  typeof window === "undefined" ? "" : localStorage.getItem("team_token") || "";

export async function fetchTeam(retries = 3): Promise<TeamResult> {
  const token = getToken();
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch("/api/team", {
        headers: token ? { "x-team-token": token } : {},
        credentials: "same-origin",
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 404) return { status: "unauth" };
      if (res.ok) return { status: "ok", team: await res.json() };
    } catch {}
    if (i < retries) await new Promise((r) => setTimeout(r, 500 * 2 ** i));
  }
  return { status: "offline" };
}
