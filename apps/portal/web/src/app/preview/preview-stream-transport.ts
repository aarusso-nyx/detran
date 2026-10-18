// No frame, completion, polling fallback or network is synthesized in preview.
import { Injectable } from '@angular/core';
import { NEVER, type Observable } from 'rxjs';
import {
  PortalStreamTransport,
  type StreamFrame,
} from '../core/realtime.service';
@Injectable()
export class PreviewStreamTransport extends PortalStreamTransport {
  override open(): Observable<StreamFrame> {
    return NEVER;
  }
}
