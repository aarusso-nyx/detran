// Transporte do stream (CTG-0002.md §6): abstração injetável sobre `GET /v1/dashboard/stream`
// (`text/event-stream`). A implementação padrão usa o `HttpClient` de `provideStynxDefaults`
// (`observe: 'events'`, `reportProgress`, `partialText`) porque o `EventSource` nativo não envia
// o bearer da sessão STYNX (DIVERGE-1 do Portal). Um frame por bloco SSE; `: heartbeat` vira
// `{ id: null, event: null, data: '' }`; `204` completa sem frames.
import {
  HttpClient,
  HttpEventType,
  type HttpDownloadProgressEvent,
  type HttpEvent,
} from '@angular/common/http';
import { Injectable, Injector, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStreamFrame {
  readonly id: string | null;
  readonly event: string | null;
  readonly data: string;
}

export interface DashboardStreamOpenOptions {
  readonly lastEventId: string | null;
}

@Injectable({
  providedIn: 'root',
  useFactory: () => new HttpDashboardStreamTransport(inject(Injector)),
})
export abstract class DashboardStreamTransport {
  abstract open(
    url: string,
    options: DashboardStreamOpenOptions,
  ): Observable<DashboardStreamFrame>;
}

const LAST_EVENT_ID_HEADER = 'Last-Event-ID';

/** Parser incremental do formato SSE (blocos separados por linha vazia). */
export class StreamFrameParser {
  private buffer = '';
  private pending = '';
  private id: string | null = null;
  private event: string | null = null;
  private data: string[] = [];

  /** Consome o texto acumulado (`partialText`) e devolve os frames completos novos. */
  push(partialText: string): readonly DashboardStreamFrame[] {
    const chunk = partialText.slice(this.buffer.length);
    this.buffer = partialText;
    const frames: DashboardStreamFrame[] = [];
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

  private line(line: string): DashboardStreamFrame | null {
    if (line === '') return this.flush();
    // Comentário (`: heartbeat`): mantém a conexão viva sem virar evento.
    if (line.startsWith(':')) return { id: null, event: null, data: '' };
    const colon = line.indexOf(':');
    const field = colon >= 0 ? line.slice(0, colon) : line;
    let value = colon >= 0 ? line.slice(colon + 1) : '';
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'id') this.id = value;
    else if (field === 'event') this.event = value;
    else if (field === 'data') this.data.push(value);
    // `retry:` e campos desconhecidos: a política de reconexão é a do contrato.
    return null;
  }

  private flush(): DashboardStreamFrame | null {
    if (this.id === null && this.event === null && this.data.length === 0) {
      return null;
    }
    const frame: DashboardStreamFrame = {
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

export class HttpDashboardStreamTransport extends DashboardStreamTransport {
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
    options: DashboardStreamOpenOptions,
  ): Observable<DashboardStreamFrame> {
    return new Observable<DashboardStreamFrame>((subscriber) => {
      const parser = new StreamFrameParser();
      const headers: Record<string, string> = { Accept: 'text/event-stream' };
      if (options.lastEventId !== null) {
        headers[LAST_EVENT_ID_HEADER] = options.lastEventId;
      }
      const subscription = this.http
        .get(url, {
          headers,
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
