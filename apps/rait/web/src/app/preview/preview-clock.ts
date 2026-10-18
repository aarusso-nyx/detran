// Relógio fixo da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, D-05): `today` das
// fixtures canônicas (`rait-fixtures.json` `today` = 2026-09-14, `tenant.timezone`
// `America/Manaus`, UTC−04:00) ao meio-dia. Constante: o TTL de `createReadStore` nunca vence
// dentro de um documento; nenhum prazo é calculado no cliente ([RN-RAIT-005]).
import { Injectable } from '@angular/core';
import { RaitClock } from '../data/clock';

export const PREVIEW_NOW_ISO = '2026-09-14T12:00:00-04:00';

const PREVIEW_NOW_MS = Date.parse(PREVIEW_NOW_ISO);

@Injectable({ providedIn: 'root' })
export class PreviewClock extends RaitClock {
  override now(): number {
    return PREVIEW_NOW_MS;
  }
}
