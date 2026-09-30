import { HttpClient } from '@angular/common/http';
import {
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import {
  provideStynxEventStream,
  StynxEventStreamService,
} from '@stynx-nyx/angular';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { catchError, defer, EMPTY, Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TEAT_WEB_HOMOLOGATION } from '../shared/homologation-http.interceptor.js';
import { TEAT_WEB_HOMOLOGATION_EVENTS } from '../shared/homologation-events.port.js';

const STREAM_URL = '/v1/ops/stream';
const POLLING_INTERVAL_MS = 15_000;

export interface SseStreamOptions {
  readonly topics?: readonly string[];
  /** Lido a cada `tick$` do _polling_ (OD-R22-61 (c)); padrão: o próprio fluxo. */
  readonly fallbackUrl?: string;
}

function streamUrl(topics: readonly string[]): string {
  return topics.length === 0
    ? STREAM_URL
    : `${STREAM_URL}?topics=${encodeURIComponent(topics.join(','))}`;
}

/**
 * Serviço fino do TEAT web sobre `provideStynxEventStream` (CTG-0005): transporte pelo
 * `HttpClient` (bearer e `X-Tenant-Id` dos interceptores), reconexão, _polling_, troca de
 * tenant e fim de sessão são da plataforma, com os padrões publicados (OD-R22-57). Em
 * _polling_, cada `tick$` lê `fallbackUrl` e emite o resultado, como em 1.4.0 (OD-R22-61 (c)).
 * Um injetor filho por assinatura, porque a URL do fluxo é fixa por injetor.
 */
@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(EnvironmentInjector);
  private readonly homologation = inject(TEAT_WEB_HOMOLOGATION, {
    optional: true,
  });
  private readonly homologationEvents = inject(TEAT_WEB_HOMOLOGATION_EVENTS, {
    optional: true,
  });
  private readonly fallbackActive = signal(false);
  readonly homologationFallbackActive = this.fallbackActive.asReadonly();

  stream(options: SseStreamOptions = {}): Observable<unknown> {
    if (this.homologation === true) {
      const events = this.homologationEvents;
      if (events === null) return EMPTY;
      return defer(() => events.stream(options)).pipe(
        catchError(() => {
          this.fallbackActive.set(true);
          return timer(POLLING_INTERVAL_MS, POLLING_INTERVAL_MS).pipe(
            switchMap(() => events.fallback?.(options) ?? EMPTY),
          );
        }),
      );
    }
    return new Observable<unknown>((observer) => {
      const streamInjector = createEnvironmentInjector(
        [
          provideStynxEventStream({
            url: streamUrl(options.topics ?? []),
            pollingIntervalMs: POLLING_INTERVAL_MS,
            sessionActive: this.injector.get(StynxSessionService).active,
          }),
        ],
        this.injector,
      );
      const platform = streamInjector.get(StynxEventStreamService);
      const fallbackUrl = options.fallbackUrl ?? STREAM_URL;
      const subscription = platform.events$.subscribe((event) =>
        observer.next(event.data),
      );
      subscription.add(
        platform.tick$
          .pipe(
            switchMap(() =>
              this.http.get(fallbackUrl).pipe(catchError(() => EMPTY)),
            ),
          )
          .subscribe((value) => observer.next(value)),
      );
      platform.start();
      return () => {
        subscription.unsubscribe();
        streamInjector.destroy();
      };
    });
  }
}
