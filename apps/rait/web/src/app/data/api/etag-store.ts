// Guarda o `ETag` por recurso/id (contrato CTG-0002b §3.2; M9 "ETag guardado por id para
// If-Match"; build-pack §0.2). Só o valor que o servidor enviou: ausente → `null`, nunca
// inventado. Os comandos de R-0007 CTG-0004 lerão `If-Match` daqui.
import { Injectable } from '@angular/core';

/** Segmento de coleção de cada `paths` gerado (49); `infraction-events` nomeia
 * `/v1/inf/infraction/events` para não colidir com `events` do RAIT. */
export type RaitCollection =
  | 'cases'
  | 'parties'
  | 'documents'
  | 'pending-contents'
  | 'redirects'
  | 'admissibility'
  | 'deadlines'
  | 'inquiries'
  | 'drafts'
  | 'decisions'
  | 'communications'
  | 'events'
  | 'units'
  | 'pools'
  | 'pool-members'
  | 'schedules'
  | 'schedule-slots'
  | 'batches'
  | 'batch-items'
  | 'assignments'
  | 'impediments'
  | 'substitute-duties'
  | 'benches'
  | 'clocks'
  | 'clock-alerts'
  | 'sessions'
  | 'agenda-items'
  | 'attendance'
  | 'votes'
  | 'minutes'
  | 'holidays'
  | 'suspension-acts'
  | 'jeton-sheets'
  | 'jeton-lines'
  | 'incidents'
  | 'quality-samples'
  | 'capacity-plans'
  | 'exports'
  | 'reconciliations'
  | 'infractions'
  | 'timers'
  | 'infraction-events'
  | 'collection-documents'
  | 'payments'
  | 'refund-orders'
  | 'debt-handoffs'
  | 'notices'
  | 'acknowledgements'
  | 'delivery-attempts';

const KEY_SEPARATOR = ':';

@Injectable({ providedIn: 'root' })
export class EtagStore {
  private readonly etags = new Map<string, string>();

  get(collection: RaitCollection, id: string): string | null {
    return this.etags.get(keyOf(collection, id)) ?? null;
  }

  /** `null` apaga a entrada. */
  set(collection: RaitCollection, id: string, etag: string | null): void {
    const key = keyOf(collection, id);
    if (etag === null) this.etags.delete(key);
    else this.etags.set(key, etag);
  }

  clear(collection?: RaitCollection): void {
    if (collection === undefined) {
      this.etags.clear();
      return;
    }
    const prefix = `${collection}${KEY_SEPARATOR}`;
    for (const key of [...this.etags.keys()]) {
      if (key.startsWith(prefix)) this.etags.delete(key);
    }
  }
}

function keyOf(collection: RaitCollection, id: string): string {
  return `${collection}${KEY_SEPARATOR}${id}`;
}
