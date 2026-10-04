import { randomInt, timingSafeEqual } from "crypto";

export const generateTeamCode = () =>
  String(randomInt(0, 1_000_000)).padStart(6, "0");

export const normalizeName = (name: string) =>
  name.trim().replace(/\s+/g, " ").slice(0, 50);

export const nameKeyOf = (name: string) => normalizeName(name).toLowerCase();

export function codesMatch(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
