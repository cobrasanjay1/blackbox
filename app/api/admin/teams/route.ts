import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAdminToken } from "@/lib/auth";
import { TOTAL_CHALLENGES } from "@/lib/challenges";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (!validateAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await prisma.team.findMany({
      include: {
        progress: { orderBy: { completedAt: "asc" } },
        hintUsages: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = teams.map((team: any) => {
      const completedChallenges = team.progress.length;
      const isComplete = completedChallenges >= TOTAL_CHALLENGES && !!team.completedAt;
      let durationSeconds: number | null = null;
      if (isComplete && team.completedAt) {
        durationSeconds = Math.floor(
          (team.completedAt.getTime() - team.createdAt.getTime()) / 1000
        );
      }

      return {
        id: team.id,
        name: team.name,
        code: team.code,
        completedChallenges,
        totalChallenges: TOTAL_CHALLENGES,
        isComplete,
        completedAt: team.completedAt,
        durationSeconds,
        startedAt: team.createdAt,
        hintsUsed: team.hintUsages.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        progress: team.progress.map((p: any) => ({
          challengeId: p.challengeId,
          completedAt: p.completedAt,
        })),
      };
    });

    return NextResponse.json({ teams: result });
  } catch (error) {
    console.error("[admin/teams/GET]", error);
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}
