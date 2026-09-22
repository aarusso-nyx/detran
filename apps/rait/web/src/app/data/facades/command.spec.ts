// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.1, §8 (C-2B-20) — `data/facades/command.ts`
// ainda não existe (TASK-0009): falha de módulo esperada.
import { createCommandRunner } from './command';
import { RaitCommandUnavailableError } from '../../core/error-boundary';

describe('createCommandRunner (C-2B-20)', () => {
  it('dado run("rait-case:admit", () => Promise.reject(new RaitCommandUnavailableError("rait-case:admit"))) então resolve { ok: false, error: { kind: "unavailable", command: "rait-case:admit", messageKey: "rait.common.unavailable" } }, status "error", error() igual; NUNCA rejeita', async () => {
    const runner = createCommandRunner();
    const outcome = await runner.run('rait-case:admit' as never, () =>
      Promise.reject(new RaitCommandUnavailableError('rait-case:admit')),
    );
    expect(outcome).toMatchObject({
      ok: false,
      error: {
        kind: 'unavailable',
        command: 'rait-case:admit',
        messageKey: 'rait.common.unavailable',
      },
    });
    expect(runner.status()).toBe('error');
    expect(runner.error()).toEqual((outcome as { error: unknown }).error);
  });

  it('dado exec que resolve { body, etag } então { ok: true, body, etag }, status "done"', async () => {
    const runner = createCommandRunner();
    const outcome = await runner.run('rait-case:admit' as never, async () => ({
      body: { id: '1' },
      etag: '"1"',
    }));
    expect(outcome).toEqual({ ok: true, body: { id: '1' }, etag: '"1"' });
    expect(runner.status()).toBe('done');
  });

  it('dado status "error" quando clearError() então error() null', async () => {
    const runner = createCommandRunner();
    await runner.run('rait-case:admit' as never, () =>
      Promise.reject(new RaitCommandUnavailableError('rait-case:admit')),
    );
    runner.clearError();
    expect(runner.error()).toBeNull();
  });
});
