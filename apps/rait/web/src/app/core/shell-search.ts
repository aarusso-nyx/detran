// Busca do shell por protocolo (spec §5.1; contrato CTG-0002a §5; CTG-0002b §3.6): abstração
// injetável cuja implementação é `CaseShellSearch` (`data/shell-search/case-shell-search.ts`,
// `GET /v1/inf/rait/cases` por `CaseClient`; busca por AIT fora desta CTG — OD-R12-030). A
// fábrica padrão aponta para ela (o `main.ts` também a registra explicitamente,
// `{ provide: RaitShellSearch, useClass: CaseShellSearch }`, OD-R12-030 b); os specs do shell
// substituem por `useValue`.
import { Injectable, inject } from '@angular/core';
import { CaseShellSearch } from '../data/shell-search/case-shell-search';

export type RaitShellSearchResult =
  | { readonly kind: 'case'; readonly caseId: string }
  | { readonly kind: 'none' }
  | { readonly kind: 'unavailable' };

@Injectable({
  providedIn: 'root',
  useFactory: () => inject(CaseShellSearch),
})
export abstract class RaitShellSearch {
  abstract search(query: string): Promise<RaitShellSearchResult>;
}
