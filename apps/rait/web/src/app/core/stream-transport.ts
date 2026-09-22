// Transporte do SSE (contrato CTG-0002a §6; `rait-events-sse-contract.md` §3; M10; padrão
// `apps/portal/web/src/app/core/realtime.service.ts`): abstração injetável, substituível por
// `useValue` nos testes. A implementação padrão usa o `HttpClient` de `provideStynxDefaults`
// (bearer, tenant, request-id) com `observe: 'events'`, `reportProgress` e `responseType: 'text'`,
// lendo `partialText`, porque o `EventSource` nativo não envia o bearer da sessão STYNX
// (DIVERGE-1 do Portal). Emite um frame por bloco SSE; `: heartbeat` vira frame vazio
// (`{ id: null, event: null, data: '' }`); completa quando o servidor fecha (204 = sem frames);
// erra com `HttpErrorResponse`. Único uso de `HttpClient` no núcleo (§4 do guia).
import {
  HttpClient,
  HttpEventType,
  type HttpDownloadProgressEvent,
  type HttpEvent,
} from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Tópicos do contrato §3 (sem `outbox`, reservado a consumidores externos). */
export const RAIT_STREAM_TOPICS = [
  'case',
  'assignment',
  'clock',
  'session',
  'agenda-item',
  'batch',
] as const;

export type RaitStreamTopic = (typeof RAIT_STREAM_TOPICS)[number];

export interface RaitStreamFrame {
  readonly id: string | null;
  readonly event: string | null;
  /** JSON cru do envelope (`rait-events-sse-contract.md` §1); `''` no heartbeat. */
  readonly data: string;
}

export interface RaitStreamOpenOptions {
  readonly lastEventId: string | null;
  readonly topics: readonly RaitStreamTopic[];
  readonly caseId?: string;
  readonly sessionId?: string;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => new HttpRaitStreamTransport(inject(Injector)),
})
export abstract class RaitStreamTransport {
  abstract open(
    url: string,
    options: RaitStreamOpenOptions,
  ): Observable<RaitStreamFrame>;
}

const LAST_EVENT_ID_HEADER = 'Last-Event-ID';
const ACCEPT = 'text/event-stream';
const TOPICS_PARAM = 'topics';
const CASE_PARAM = 'caseId';
const SESSION_PARAM = 'sessionId';
const HEARTBEAT_COMMENT = 'heartbeat';

export const HEARTBEAT_FRAME: RaitStreamFrame = Object.freeze({
  id: null,
  event: null,
  data: '',
});

/** Parser incremental de `text/event-stream`: blocos separados por linha vazia. */
export class StreamFrameParser {
  private buffer = '';
  private pending = '';
  private id: string | null = null;
  private event: string | null = null;
  private data: string[] = [];

  /** Consome o texto acumulado até aqui (`partialText`) e devolve os frames completos novos. */
  push(partialText: string): readonly RaitStreamFrame[] {
    const chunk = partialText.slice(this.buffer.length);
    this.buffer = partialText;
    const frames: RaitStreamFrame[] = [];
    let text = this.pending + chunk;
    let newline = text.indexOf('\n');
    while (newline >= 0) {
      const line = text.slice(0, newline).replace(/\r$/, '');
      text = text.slice(newline + 1);
      const frame = this.line(line);
      if (frame) frames.push(frame);
      newline = text.indexOf('\n');
    }
    this.pending = text;
    return frames;
  }

  private line(line: string): RaitStreamFrame | null {
    if (line === '') return this.flush();
    if (line.startsWith(':')) {
      // `: heartbeat` (contrato §3) mantém a conexão viva sem emitir evento.
      return line.slice(1).trim() === HEARTBEAT_COMMENT
        ? HEARTBEAT_FRAME
        : null;
    }
    const colon = line.indexOf(':');
    const field = colon >= 0 ? line.slice(0, colon) : line;
    let value = colon >= 0 ? line.slice(colon + 1) : '';
    if (value.startsWith(' ')) value = value.slice(1);
    switch (field) {
      case 'id':
        this.id = value;
        return null;
      case 'event':
        this.event = value;
        return null;
      case 'data':
        this.data.push(value);
        return null;
      default:
        // `retry:` e campos desconhecidos: a política de reconexão é a do contrato.
        return null;
    }
  }

  private flush(): RaitStreamFrame | null {
    if (this.id === null && this.event === null && this.data.length === 0) {
      return null;
    }
    const frame: RaitStreamFrame = {
      id: this.id,
      event: this.event,
      data: this.data.join('\n'),
    };
    this.id = null;
    this.event = null;
    this.data = [];
    return frame;
  }
}

/** Implementação padrão: `HttpClient` STYNX com `observe: 'events'` + `partialText`. */
export class HttpRaitStreamTransport extends RaitStreamTransport {
  private httpClient: HttpClient | null = null;

  constructor(private readonly injector: Injector) {
    super();
  }

  private get http(): HttpClient {
    this.httpClient ??= this.injector.get(HttpClient);
    return this.httpClient;
  }

  open(
    url: string,
    options: RaitStreamOpenOptions,
  ): Observable<RaitStreamFrame> {
    return new Observable<RaitStreamFrame>((subscriber) => {
      const parser = new StreamFrameParser();
      const headers: Record<string, string> = { Accept: ACCEPT };
      if (options.lastEventId !== null) {
        headers[LAST_EVENT_ID_HEADER] = options.lastEventId;
      }
      const params: Record<string, string> = {
        [TOPICS_PARAM]: options.topics.join(','),
      };
      if (options.caseId) params[CASE_PARAM] = options.caseId;
      if (options.sessionId) params[SESSION_PARAM] = options.sessionId;
      const subscription = this.http
        .get(url, {
          headers,
          params,
          observe: 'events',
          reportProgress: true,
          responseType: 'text',
        })
        .subscribe({
          next: (event: HttpEvent<string>) => {
            if (event.type === HttpEventType.DownloadProgress) {
              const partial =
                (event as HttpDownloadProgressEvent).partialText ?? '';
              for (const frame of parser.push(partial)) subscriber.next(frame);
              return;
            }
            if (event.type === HttpEventType.Response) {
              const body = event.body ?? '';
              for (const frame of parser.push(`${body}\n\n`)) {
                subscriber.next(frame);
              }
              subscriber.complete();
            }
          },
          error: (error: unknown) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      return () => subscription.unsubscribe();
    });
  }
}
