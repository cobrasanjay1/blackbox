import { NextRequest, NextResponse } from "next/server";

export function getAdminToken(req: NextRequest): string | null {
  return req.headers.get("x-admin-token");
}

export function validateAdminToken(token: string | null): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !token) return false;
  return token === adminPassword;
}

export function getTeamToken(req: NextRequest): string | null {
  return (
    req.headers.get("x-team-token") ||
    req.cookies.get("team_token")?.value ||
    null
  );
}

export function setTeamCookie(
  res: NextResponse,
  token: string,
  req: NextRequest
): NextResponse {
  const https =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto")?.split(",")[0].trim() === "https";
  res.cookies.set("team_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: https,
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
