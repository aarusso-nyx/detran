// ReadStatus (contrato CTG-0003b §3.1): estado de uma leitura de tela, derivado SÓ da
// apresentação que o `ErrorBoundary` já classificou (`presentError`, CTG-0003a §3). Nenhuma
// facade lê `navigator` nem decide prazo aqui: o `ErrorBoundary` reconhece o `status 0` sem rede
// e devolve `OFFLINE_KEY`; este módulo apenas mapeia a apresentação ao estado da tela (tabela
// §2.4 do contrato). Nunca lança.
import { OFFLINE_KEY, type ErrorPresentation } from '../core/error-boundary';

export type ReadStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'empty' // lista sem itens; T-10 sem decisão
  | 'not_found' // NOT_FOUND{kind: ait|request} → link "por que não vejo isto"
  | 'error' // recuperável: portal.states.error + retry, ou portal.errors.<code>
  | 'unavailable' // SERVICE_UNAVAILABLE | *_UNAVAILABLE (503) | SERVICE_PARTIALLY_AVAILABLE
  | 'offline'; // portal.states.offline

/** Códigos do catálogo que a tabela §2.4 apresenta como "indisponível" (banner + canal). */
const UNAVAILABLE_CODES: ReadonlySet<string> = new Set([
  'PORTAL.SERVICE_UNAVAILABLE',
  'PORTAL.SERVICE_PARTIALLY_AVAILABLE',
  'PORTAL.NATIONAL_READ_UNAVAILABLE',
  'PORTAL.PAYMENT_PROVIDER_UNAVAILABLE',
  'PORTAL.SNE_UPSTREAM_UNAVAILABLE',
]);

const NOT_FOUND_CODE = 'PORTAL.NOT_FOUND';

/** Mapeia a apresentação de `presentError` ao estado da tela (tabela §2.4); nunca lança. */
export function readStatusFor(presentation: ErrorPresentation): ReadStatus {
  if (presentation.messageKey === OFFLINE_KEY) return 'offline';
  if (presentation.code === NOT_FOUND_CODE) return 'not_found';
  if (presentation.code !== null && UNAVAILABLE_CODES.has(presentation.code)) {
    return 'unavailable';
  }
  return 'error';
}
