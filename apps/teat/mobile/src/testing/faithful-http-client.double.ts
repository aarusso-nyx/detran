import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

export interface RecordedHttpCall {
  readonly method: 'GET' | 'POST';
  readonly path: string;
  readonly body?: unknown;
  readonly options?: Record<string, unknown>;
}

/** An HttpClient-shaped double: it records the actual client call and returns an Observable. */
export class FaithfulHttpClientDouble {
  readonly calls: RecordedHttpCall[] = [];
  private response: unknown = { ok: true };
  readonly get = vi.fn((path: string, options?: Record<string, unknown>) => {
    this.calls.push({ method: 'GET', path, options });
    return of(this.response);
  });
  readonly post = vi.fn(
    (path: string, body?: unknown, options?: Record<string, unknown>) => {
      this.calls.push({ method: 'POST', path, body, options });
      return of(this.response);
    },
  );

  respond(value: unknown): void {
    this.response = value;
  }

  fail(error: unknown): void {
    this.get.mockImplementationOnce(() => throwError(() => error));
    this.post.mockImplementationOnce(() => throwError(() => error));
  }
}
