// Marca do modo prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §4, §5; decisão M4):
// a string `DETRAN_PREVIEW_MARK` só aparece no DOM como valor do atributo
// `data-detran-preview-mark` da faixa (`preview-bar.component.ts`) e por isso sobrevive à
// minificação — é o gate positivo sobre `dist/preview` e o negativo sobre `dist/browser`. O texto
// visível vem das chaves abaixo, sobrepostas ao catálogo do app por `preview.pt-BR.json` (M1).

import { previewKey } from './preview-i18n';

export const DETRAN_PREVIEW_MARK_ATTR = 'data-detran-preview-mark';
export const DETRAN_PREVIEW_MARK_VALUE = 'DETRAN_PREVIEW_MARK';
/** "PRÉVIA — DADOS FICTÍCIOS" (contrato §4). */
export const PREVIEW_MARK_KEY = previewKey('states', 'mark');
/** "Não funcional na prévia: {command} não foi executado." (contrato §4, §6). */
export const PREVIEW_NOT_FUNCTIONAL_KEY = previewKey(
  'states',
  'not_functional',
);
