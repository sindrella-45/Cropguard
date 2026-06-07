/**
 * Pings the Render backend every 10 minutes
 * to prevent it from sleeping on the free tier.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let started = false;

export function startKeepAlive(): void {
  if (started) return; // only start once
  started = true;

  // Ping immediately
  fetch(`${BACKEND}/health`).catch(() => {});

  // Then every 10 minutes
  setInterval(() => {
    fetch(`${BACKEND}/health`).catch(() => {});
  }, 10 * 60 * 1000);
}