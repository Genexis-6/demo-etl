/**
 * Backend & WebSocket configuration for ETL Pipeline Studio.
 * Defaults to the hosted Vercel backend and can be overridden via environment variables.
 */

export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://demo-etl-tawny.vercel.app"
).replace(/\/+$/, "");

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (BACKEND_URL.startsWith("https://")
    ? BACKEND_URL.replace(/^https:\/\//, "wss://") + "/ws/etl"
    : BACKEND_URL.replace(/^http:\/\//, "ws://") + "/ws/etl");
