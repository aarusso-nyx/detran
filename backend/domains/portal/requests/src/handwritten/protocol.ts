// Número de protocolo e recibo canônico (work/rounds/R-0009/contracts/
// CTG-0002.md §3.3; plan R-0009 M8, adenda A2(c)). Número
// `<SLUG-UPPER>-<AAAA>-<sequencial 7 dígitos>` por `portal.protocol_seq` (DDL
// manuscrito 19, sequência compartilhada com `portal.manifestation.protocol`);
// colisão com número já existente (fixtures literais sem `setval`) → repete
// `nextval` até 20 vezes → `PORTAL.INTERNAL { requestId }`. A colisão é
// detectada antes do insert: dentro da transação do comando um 23505
// abortaria a transação inteira. Recibo: JSON canônico das cinco chaves em
// ordem (`channel, issuedAt, number, requestId, serviceKey`) e `receipt_hash`
// = sha256 hex (check do DDL 62).
import {
  PortalError,
  type PortalSqlTransaction,
} from '@detran/portal-identity';

import { canonicalJson, sha256Hex } from './idempotency.service.js';

/** Tentativas de `nextval` admitidas por número (§3.3). */
export const PROTOCOL_NUMBER_MAX_ATTEMPTS = 20;

const PROTOCOL_SEQUENCE = 'portal.protocol_seq';

const NEXTVAL_SQL = `select nextval('${PROTOCOL_SEQUENCE}')::text as seq`;

const PROTOCOL_EXISTS_SQL = `select id from portal.protocol where number = $1 limit 1`;

const MANIFESTATION_EXISTS_SQL = `select id from portal.manifestation where protocol = $1 limit 1`;

/** `${slugUpper}-${yyyy}-${seq.padStart(7, '0')}` (§3.3). */
export function formatProtocolNumber(
  slug: string,
  today: string,
  sequence: number | string,
): string {
  return `${slug.toUpperCase()}-${today.slice(0, 4)}-${String(sequence).padStart(7, '0')}`;
}

/**
 * Próximo número livre para o tenant da transação. `slug` é
 * `auth.tenants.slug`; `today` é a data civil no fuso do tenant; `requestId`
 * só entra no `context` do `PORTAL.INTERNAL` após 20 colisões.
 */
export async function protocolNumber(
  tx: PortalSqlTransaction,
  slug: string,
  today: string,
  requestId?: string,
): Promise<string> {
  for (let attempt = 0; attempt < PROTOCOL_NUMBER_MAX_ATTEMPTS; attempt += 1) {
    const next = await tx.query<{ seq: string }>(NEXTVAL_SQL);
    const seq = next.rows[0]?.seq;
    if (seq === undefined) break;
    const candidate = formatProtocolNumber(slug, today, seq);
    const inProtocol = await tx.query(PROTOCOL_EXISTS_SQL, [candidate]);
    if (inProtocol.rows.length > 0) continue;
    const inManifestation = await tx.query(MANIFESTATION_EXISTS_SQL, [
      candidate,
    ]);
    if (inManifestation.rows.length > 0) continue;
    return candidate;
  }
  throw new PortalError('PORTAL.INTERNAL', {
    status: 500,
    context: requestId ? { requestId } : {},
  });
}

export interface ProtocolReceiptInput {
  serviceKey: string;
  requestId: string;
  number: string;
  issuedAt: Date;
  channel: 'portal';
}

/** Recibo com as chaves na ordem canônica (§3.3). */
export interface ProtocolReceipt {
  channel: 'portal';
  issuedAt: string;
  number: string;
  requestId: string;
  serviceKey: string;
}

export function receiptOf(input: ProtocolReceiptInput): ProtocolReceipt {
  return {
    channel: input.channel,
    issuedAt: input.issuedAt.toISOString(),
    number: input.number,
    requestId: input.requestId,
    serviceKey: input.serviceKey,
  };
}

/** sha256 hex minúsculo do recibo canônico (objeto ou já a string). */
export function receiptHash(receipt: ProtocolReceipt | string): string {
  return sha256Hex(
    typeof receipt === 'string' ? receipt : canonicalJson(receipt),
  );
}
