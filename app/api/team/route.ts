import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setTeamCookie } from "@/lib/auth";
import { generateTeamCode, nameKeyOf, normalizeName } from "@/lib/teamCode";

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }
    const sanitized = normalizeName(name);
    if (sanitized.length < 2) {
      return NextResponse.json({ error: "Team name must be at least 2 characters" }, { status: 400 });
    }
    const nameKey = nameKeyOf(sanitized);
    const taken = NextResponse.json({
      error: "That team name is already taken. If it's your team, enter your 6-digit team code to rejoin.",
      taken: true,
    }, { status: 409 });
    const existing = await prisma.team.findFirst({
      where: { OR: [{ nameKey }, { name: { equals: sanitized, mode: "insensitive" } }] },
      select: { id: true },
    });
    if (existing) return taken;
    let team;
    try {
      team = await prisma.team.create({ data: { name: sanitized, nameKey, code: generateTeamCode() } });
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") return taken;
      throw e;
    }
    return setTeamCookie(NextResponse.json({
      id: team.id,
      name: team.name,
      token: team.token,
      code: team.code,
      message: "Team registered. The investigation begins.",
    }), team.token, req);
  } catch (error) {
    console.error("[team/POST]", error);
    return NextResponse.json({ error: "Failed to register team" }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("x-team-token") || req.cookies.get("team_token")?.value;
    if (!token) return NextResponse.json({ error: "No team token" }, { status: 401 });
    const team = await prisma.team.findUnique({
      where: { token },
      include: { progress: { orderBy: { completedAt: "asc" } }, hintUsages: true },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedIds = team.progress.map((p: any) => p.challengeId);
    const hintMap: Record<string, number[]> = {};
    for (const h of team.hintUsages) {
      if (!hintMap[h.challengeId]) hintMap[h.challengeId] = [];
      hintMap[h.challengeId].push(h.hintIndex);
    }
    return NextResponse.json({
      id: team.id,
      name: team.name,
      code: team.code,
      completedChallenges: completedIds,
      completedAt: team.completedAt,
      hints: hintMap,
    });
  } catch (error) {
    console.error("[team/GET]", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}
