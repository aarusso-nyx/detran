// R-0022 TASK-0026 (Inspector). Transporte do fluxo SSE do TEAT web para specs de app, só com
// símbolos publicados de STYNX 1.5.0: o `FakeStynxEventStreamTransport`
// (`@stynx-nyx/angular/testing`) recebe as requisições do fluxo que o
// `HttpStynxEventStreamTransport` publicado faz pelo `HttpClient` (marcadas com
// `STYNX_SSE_REQUEST`); todas as outras requisições seguem ao `HttpTestingController`. Assim, as
// páginas continuam lendo recursos pelo backend de teste e os `GET fallbackUrl` do _polling_
// (OD-R22-61 (c)) são contados sem as reaberturas do fluxo.
import type { HttpInterceptorFn } from '@angular/common/http';
import { STYNX_SSE_REQUEST } from '@stynx-nyx/angular';
import { FakeStynxEventStreamTransport } from '@stynx-nyx/angular/testing';
import { expect, vi } from 'vitest';

export class TeatEventStreamFixture {
  readonly transport = new FakeStynxEventStreamTransport();
  private frames = 0;

  /** Interceptor para `provideHttpClient(withInterceptors([...]))`. */
  readonly interceptor: HttpInterceptorFn = (request, next) =>
    request.context.get(STYNX_SSE_REQUEST)
      ? this.transport.connect({
          url: request.urlWithParams,
          lastEventId: request.headers.get('Last-Event-ID'),
          context: request.context,
        })
      : next(request);

  get connections(): readonly Readonly<{
    request: Readonly<{ url: string }>;
    cancelled: boolean;
  }>[] {
    return this.transport.connections;
  }

  /** URLs das conexões do fluxo, na ordem em que foram abertas. */
  urls(): string[] {
    return this.transport.connections.map(
      (connection) => connection.request.url,
    );
  }

  /** Emite um frame nomeado na conexão corrente, com `id` único para não ser deduplicado. */
  emitNamed(type: string, value: unknown): void {
    this.frames += 1;
    this.transport.emitProgress(
      `id: teat-web-frame-${this.frames}\nevent: ${type}\ndata: ${JSON.stringify(value)}\n\n`,
    );
  }

  /**
   * Derruba o fluxo até o cliente publicado entrar em _polling_: a cada queda, uma reabertura
   * imediata significa _polling_; senão avança ao próximo timer (o _backoff_ publicado) e derruba
   * a nova conexão. Sai no instante da entrada em _polling_, que é a origem do primeiro `tick$`.
   */
  async failUntilPolling(): Promise<void> {
    for (;;) {
      const opened = this.transport.connections.length;
      expect(opened, 'conexão do fluxo aberta antes da queda').toBeGreaterThan(
        0,
      );
      this.transport.close();
      await vi.advanceTimersByTimeAsync(0);
      if (this.transport.connections.length > opened) return;
      await vi.advanceTimersToNextTimerAsync();
      expect(
        this.transport.connections.length,
        'reabertura do fluxo depois do backoff',
      ).toBe(opened + 1);
    }
  }
}
