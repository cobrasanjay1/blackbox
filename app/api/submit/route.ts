import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAnswer } from "@/lib/answers.server";
import { checkRateLimit } from "@/lib/rateLimit";
import { CHALLENGES, TOTAL_CHALLENGES } from "@/lib/challenges";

export async function POST(req: NextRequest) {
  try {
    const token =
      req.headers.get("x-team-token") ||
      req.cookies.get("team_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const team = await prisma.team.findUnique({ where: { token } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { challengeId, answer } = await req.json();

    if (!challengeId || !answer || typeof answer !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Rate limit: 5 attempts per minute per team+challenge
    const rateLimitKey = `${team.id}:${challengeId}`;
    const rl = checkRateLimit(rateLimitKey);
    if (!rl.allowed) {
      const resetIn = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${resetIn} seconds.` },
        { status: 429 }
      );
    }

    // Check challenge exists
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Check if already completed
    const alreadyDone = await prisma.progress.findUnique({
      where: { teamId_challengeId: { teamId: team.id, challengeId } },
    });

    if (alreadyDone) {
      return NextResponse.json({ correct: true, alreadyCompleted: true });
    }

    // Validate answer server-side
    const correct = validateAnswer(challengeId, answer.trim());

    if (!correct) {
      return NextResponse.json({
        correct: false,
        message: "That's not it. Look closer.",
      });
    }

    // Mark as complete
    // upsert: safe against double-submits / retries after a timeout
    await prisma.progress.upsert({
      where: { teamId_challengeId: { teamId: team.id, challengeId } },
      update: {},
      create: { teamId: team.id, challengeId },
    });

    // Check if this was the last challenge
    const completedCount = await prisma.progress.count({
      where: { teamId: team.id },
    });

    let gameComplete = false;
    if (completedCount >= TOTAL_CHALLENGES) {
      await prisma.team.update({
        where: { id: team.id },
        data: { completedAt: new Date() },
      });
      gameComplete = true;
    }

    // Get next challenge
    const nextOrder = challenge.order + 1;
    const nextChallenge = CHALLENGES.find((c) => c.order === nextOrder);

    return NextResponse.json({
      correct: true,
      message: "CLUE ACCEPTED. The trail continues...",
      gameComplete,
      nextChallengeId: nextChallenge?.id ?? null,
      storyFragment: nextChallenge?.storyFragment ?? null,
    });
  } catch (error) {
    console.error("[submit/POST]", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
