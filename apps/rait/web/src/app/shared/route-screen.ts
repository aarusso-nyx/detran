// Tela (`T-nn`) da rota ativa, lida do `data.screen` do manifesto (contrato CTG-0002a §3;
// CTG-0002b §1 item 1): `''` quando a rota não tem tela — mesma regra do placeholder
// (C-2A-11/56). Extraído de `placeholder-page.component.ts`, que passa a importá-lo; as páginas
// L1/L2 (par 2) usam `host: { '[attr.data-screen]': 'screen' }` com `screen = screenOf(route)`.
import type { ActivatedRoute } from '@angular/router';

export function screenOf(route: ActivatedRoute): string {
  const screen: unknown = route.snapshot?.data?.['screen'];
  return typeof screen === 'string' ? screen : '';
}
