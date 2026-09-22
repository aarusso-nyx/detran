// `If-Match` do DASHBOARD (CTG-0002 §1.3 regra 5, §14.1; OD-D56). Espelha a
// gramática de `backend/domains/shared/src/errors/if-match.ts` (inteiro nu,
// inteiro entre aspas ou ETag fraco `W/"n"`; qualquer outra forma conta como
// ausente, nunca como conflito) — `assertIfMatch` de `@detran/shared` só
// admite os prefixos `TEAT|RAIT|PORTAL`, por isso o helper local com os
// códigos `DASH.IF_MATCH_REQUIRED` (428) e `DASH.VERSION_CONFLICT` (412,
// `context.expected/received`) do catálogo.
import { DetranError } from '@detran/shared';

function normalizeIfMatch(
  header: string | string[] | undefined,
): number | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return undefined;
  const match = /^(?:W\/)?"?(\d+)"?$/u.exec(value.trim());
  if (!match) return undefined;
  return Number(match[1]);
}

/**
 * Lança `DASH.IF_MATCH_REQUIRED` (428) quando o cabeçalho está ausente ou
 * malformado e `DASH.VERSION_CONFLICT` (412, `expected`, `received`) quando
 * não casa com `version`. Nunca lança quando casa.
 */
export function assertDashIfMatch(
  header: string | string[] | undefined,
  version: number,
): void {
  const received = normalizeIfMatch(header);
  if (received === undefined) {
    throw new DetranError('DASH.IF_MATCH_REQUIRED', { status: 428 });
  }
  if (received !== version) {
    throw new DetranError('DASH.VERSION_CONFLICT', {
      status: 412,
      context: { expected: version, received },
    });
  }
}
