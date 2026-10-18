// Transporte SSE da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, D-04): nenhuma rede.
// `open()` emite o frame de heartbeat (`HEARTBEAT_FRAME` = `{ id: null, event: null, data: '' }`)
// ao abrir e a cada `HEARTBEAT_MS` até o cancelamento, nunca erra e nunca sintetiza evento — o
// `SseService` fica `live` sem oscilar para `reconnecting` por silêncio.
import { Injectable } from '@angular/core';
import { map, timer, type Observable } from 'rxjs';
import { HEARTBEAT_MS } from '../core/sse.service';
import {
  HEARTBEAT_FRAME,
  RaitStreamTransport,
  type RaitStreamFrame,
  type RaitStreamOpenOptions,
} from '../core/stream-transport';

@Injectable({ providedIn: 'root' })
export class PreviewStreamTransport extends RaitStreamTransport {
  override open(
    _url: string,
    _options: RaitStreamOpenOptions,
  ): Observable<RaitStreamFrame> {
    return timer(0, HEARTBEAT_MS).pipe(map(() => HEARTBEAT_FRAME));
  }
}
