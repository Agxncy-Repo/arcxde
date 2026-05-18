/**
 * Typed API client.
 *
 * Wraps fetch with:
 *   - JSON in / JSON out
 *   - The standard response envelope ({ data, pagination? })
 *   - The standard error envelope ({ error: { code, message, requestId } }) thrown as ApiError
 *   - Credentials included (so HTTP-only auth cookies are sent on cross-origin requests in dev)
 *
 * Works in both Server Components (uses INTERNAL_API_URL if set) and Client
 * Components (uses NEXT_PUBLIC_API_URL).
 *
 * For real apps, you'll wrap this in TanStack Query on the client. This
 * primitive is what those queries call.
 */
import type { ErrorEnvelope } from '@app/contracts';

// ---------- URL resolution ----------
const PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const INTERNAL_URL = process.env.INTERNAL_API_URL ?? PUBLIC_URL;

const baseUrl = (): string => (typeof window === 'undefined' ? INTERNAL_URL : PUBLIC_URL);

// ---------- Error type ----------
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------- Core request ----------
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** AbortSignal — wire up TanStack Query's signal here. */
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — no body to parse
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const envelope = payload as ErrorEnvelope | null;
    throw new ApiError(
      response.status,
      envelope?.error?.code ?? 'UNKNOWN_ERROR',
      envelope?.error?.message ?? `Request failed with status ${response.status}`,
      envelope?.error?.requestId,
      envelope?.error?.details,
    );
  }

  return payload as T;
}

// ---------- Verb helpers ----------
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

// ---------- Health probe (used by the landing page demo) ----------
// /health is mounted at the API root, NOT under /api/v1, so we hit it directly.
export async function fetchApiHealth(): Promise<{ status: string; uptime: number }> {
  const root = baseUrl().replace(/\/api\/v\d+\/?$/, '');
  const res = await fetch(`${root}/health`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json() as Promise<{ status: string; uptime: number }>;
}
