/**
 * Sleep for `ms` milliseconds. Awaitable. Cancellable via AbortSignal.
 */
export const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });

export interface RetryOptions {
  /** Number of attempts (including the first). Default 3. */
  attempts?: number;
  /** Base delay in ms; doubles each attempt. Default 200. */
  baseDelayMs?: number;
  /** Max delay between attempts. Default 5000. */
  maxDelayMs?: number;
  /** Add 0–25% jitter to avoid thundering-herd. Default true. */
  jitter?: boolean;
  /**
   * Decide whether to retry a given error. Default: retry everything.
   * Return `false` to abort immediately (e.g. on 4xx errors from upstream).
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Cancel mid-flight. */
  signal?: AbortSignal;
}

/**
 * Retry an async function with exponential backoff and optional jitter.
 *
 * Always-on safety properties:
 *  - Won't retry on AbortError.
 *  - `shouldRetry` lets the caller distinguish transient vs permanent failures.
 *  - Last error is re-thrown after all attempts are exhausted.
 */
export const retry = async <T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const {
    attempts = 3,
    baseDelayMs = 200,
    maxDelayMs = 5000,
    jitter = true,
    shouldRetry = () => true,
    signal,
  } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      if (isAbort || attempt === attempts || !shouldRetry(error, attempt)) {
        throw error;
      }
      const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delay = jitter ? exp * (0.75 + Math.random() * 0.25) : exp;
      await sleep(delay, signal);
    }
  }
  throw lastError;
};
