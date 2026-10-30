import type { ApiResponse } from "../types/pos";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<{
  ok: boolean;
  status: number;
  body: ApiResponse<T>;
}> {
  const csrfToken = document.querySelector<HTMLMetaElement>(
    'meta[name="csrf-token"]',
  )?.content;

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (csrfToken) {
    headers.set("X-CSRF-TOKEN", csrfToken);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}
