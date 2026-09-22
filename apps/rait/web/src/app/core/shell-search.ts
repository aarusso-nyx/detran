// Busca do shell por protocolo/AIT (spec §5.1; contrato CTG-0002a §5): abstração injetável.
// Nesta CTG não há cliente de dados (M8/§13): `PendingShellSearch` resolve sempre
// `{ kind: 'unavailable' }` — nunca simula um acerto. O CTG-0002b substitui por busca via
// `CaseClient` (`GET /v1/inf/rait/cases`, `protocol_number`/`ait`).
import { Injectable, inject } from '@angular/core';

export type RaitShellSearchResult =
  | { readonly kind: 'case'; readonly caseId: string }
  | { readonly kind: 'none' }
  | { readonly kind: 'unavailable' };

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(PendingShellSearch),
})
export abstract class RaitShellSearch {
  abstract search(query: string): Promise<RaitShellSearchResult>;
}

@Injectable({ providedIn: 'root' })
export class PendingShellSearch extends RaitShellSearch {
  // todo(CTG-0002b): busca via CaseClient; até lá a busca está indisponível nesta versão.
  async search(_query: string): Promise<RaitShellSearchResult> {
    return { kind: 'unavailable' };
  }
}
