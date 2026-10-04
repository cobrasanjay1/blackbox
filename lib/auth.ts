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

export function setTeamCookie(res: NextResponse, token: string): NextResponse {
  res.cookies.set("team_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
