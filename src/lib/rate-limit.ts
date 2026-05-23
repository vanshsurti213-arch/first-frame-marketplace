// ============================================================
// Firstframe V2 — In-Memory Rate Limiter
// ============================================================
//
// Simple sliding-window rate limiter keyed by IP address.
// For single-instance deployments (Vercel serverless functions
// share no memory across invocations, so this is best-effort).
// For production multi-instance, replace with Redis-based limiter.

const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check whether a given IP address is within rate limits.
 * @param ip      - Client IP address
 * @param limit   - Maximum allowed requests within the window (default 5)
 * @param windowMs - Window duration in milliseconds (default 15 minutes)
 * @returns `true` if the request is allowed, `false` if rate-limited
 */
export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
