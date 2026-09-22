// Busca do shell por protocolo (contrato CTG-0002b §3.6; substitui `PendingShellSearch` do
// CTG-0002a §5): `listRaitCase({ q })` e acerto só quando `protocol_number` é igual à consulta
// (case-insensitive). Busca por número do AIT não é possível (`RaitCase.ait_id` é uuid; o
// contrato do AIT está fora desta CTG) → `{ kind: 'none' }` (OD-R12-030). Erro HTTP propaga: o
// shell classifica. `implements` (não `extends`) `RaitShellSearch`: o tipo é importado só como
// tipo para que `core/shell-search.ts` possa apontar sua fábrica padrão para esta classe sem
// ciclo de módulos em runtime.
import { Injectable, inject } from '@angular/core';
import type {
  RaitShellSearch,
  RaitShellSearchResult,
} from '../../core/shell-search';
import { CaseClient } from '../api/case.client';

@Injectable({ providedIn: 'root' })
export class CaseShellSearch implements RaitShellSearch {
  private readonly cases = inject(CaseClient);

  async search(query: string): Promise<RaitShellSearchResult> {
    const q = query.trim();
    if (q.length === 0) return { kind: 'none' };
    const page = await this.cases.listRaitCase({ q });
    const needle = q.toLocaleLowerCase();
    const match = page.items.find(
      (item) => item.protocol_number.toLocaleLowerCase() === needle,
    );
    return match ? { kind: 'case', caseId: match.id } : { kind: 'none' };
  }
}
