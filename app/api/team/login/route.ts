import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setTeamCookie } from "@/lib/auth";
import {
  MAX_FAILS_PER_IP,
  MAX_FAILS_PER_NAME,
  clearFailures,
  recordFailure,
  throttleState,
} from "@/lib/loginThrottle";
import { codesMatch, nameKeyOf, normalizeName } from "@/lib/teamCode";

export async function POST(req: NextRequest) {
  try {
    const { name, code } = await req.json();
    if (typeof name !== "string" || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json({ error: "Enter your team name and 6-digit code" }, { status: 400 });
    }
    const sanitized = normalizeName(name);
    const nameKey = nameKeyOf(sanitized);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const nameKeyId = `name:${nameKey}`;
    const ipKeyId = `ip:${ip}`;
    const byName = throttleState(nameKeyId, MAX_FAILS_PER_NAME);
    const byIp = throttleState(ipKeyId, MAX_FAILS_PER_IP);
    if (byName.blocked || byIp.blocked) {
      const resetAt = Math.max(byName.resetAt, byIp.resetAt);
      const secs = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
      return NextResponse.json(
        { error: `Too many wrong attempts. Try again in ${Math.ceil(secs / 60)} min.` },
        { status: 429 }
      );
    }

    const team = await prisma.team.findFirst({
      where: { OR: [{ nameKey }, { name: { equals: sanitized, mode: "insensitive" } }] },
    });

    if (team && !team.code) {
      return NextResponse.json({ error: "This team has no code yet. Ask an organizer to issue one." }, { status: 403 });
    }
    if (!team || !team.code || !codesMatch(team.code, code.trim())) {
      recordFailure(nameKeyId);
      recordFailure(ipKeyId);
      return NextResponse.json({ error: "Invalid team name or code" }, { status: 401 });
    }

    clearFailures(nameKeyId);
    return setTeamCookie(NextResponse.json({
      id: team.id,
      name: team.name,
      token: team.token,
      message: "Welcome back! Resuming your investigation.",
    }), team.token, req);
  } catch (error) {
    console.error("[team/login/POST]", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
