// Counts only FAILED rejoin attempts. Successful logins never consume the budget.
// In-memory: suitable for a single-instance event server.
type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const WINDOW_MS = 10 * 60 * 1000;

export const MAX_FAILS_PER_NAME = 10;
export const MAX_FAILS_PER_IP = 60;

export function throttleState(key: string, max: number) {
  const e = store.get(key);
  if (!e || Date.now() > e.resetAt) return { blocked: false, resetAt: 0 };
  return { blocked: e.count >= max, resetAt: e.resetAt };
}

export function recordFailure(key: string) {
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  }
  const e = store.get(key);
  if (!e || now > e.resetAt) store.set(key, { count: 1, resetAt: now + WINDOW_MS });
  else e.count += 1;
}

export function clearFailures(key: string) {
  store.delete(key);
}
