/**
 * A discriminated-union Result type for operations that can fail in expected ways.
 *
 * Use this for domain operations where the caller must handle the failure path
 * explicitly (e.g. "create user" failing because the email is already taken).
 *
 * For unexpected failures — DB unreachable, network blew up, programmer bug —
 * throw a `DomainError` instead. Don't use Result to suppress errors you don't
 * understand. See docs/conventions/coding-standards.md.
 */
export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}
export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => !r.ok;

/**
 * Map the success value while preserving the error type.
 */
export const mapResult = <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  r.ok ? ok(fn(r.value)) : r;

/**
 * Unwrap, throwing if it's an Err. Use sparingly — prefer pattern-matching.
 */
export const unwrap = <T, E>(r: Result<T, E>): T => {
  if (!r.ok) {
    throw new Error(`unwrap() called on Err: ${String(r.error)}`);
  }
  return r.value;
};
