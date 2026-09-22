// Parâmetro `:id` do layout `/casos/:id` (contrato CTG-0002a §3), lido pelas 11 abas (filhas do
// layout, sem herança de parâmetros na estratégia padrão do router) e o mapa das abas na ordem do
// manifesto (`rait-web-frontend.md` §4; `rait.screens.casos-id.tab.*`).
import type { ActivatedRoute } from '@angular/router';
import { manifestEntriesOf } from '../../app.route-manifest';
import { routeParam } from '../route-params';

const CASE_ID_PARAM = 'id';
const LAYOUT_PATH = 'casos/:id';
const TAB_KEY_PREFIX = 'rait.screens.casos-id.tab.';

export function caseIdOf(route: ActivatedRoute): string {
  return routeParam(route, CASE_ID_PARAM);
}

export interface CaseTab {
  /** Segmento relativo ao layout (`resumo`, `triagem`, …). */
  readonly path: string;
  readonly labelKey: string;
}

/** As 11 abas de `/casos/:id`, na ordem do manifesto (M3). */
export const CASE_TABS: readonly CaseTab[] = manifestEntriesOf('caso')
  .filter(
    (entry) =>
      entry.kind === 'page' && entry.path.startsWith(`${LAYOUT_PATH}/`),
  )
  .map((entry) => {
    const path = entry.path.slice(LAYOUT_PATH.length + 1);
    return { path, labelKey: `${TAB_KEY_PREFIX}${path}` };
  });
