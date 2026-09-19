// R-0009 CTG-0002 §3.3 e §13 (TASK-0006) — C-0002-07/08: número de protocolo
// (`<SLUG>-<AAAA>-<7 dígitos>` por `portal.protocol_seq`, colisão → repete
// `nextval` até 20 vezes → `PORTAL.INTERNAL { requestId }`) e recibo canônico
// (chaves em ordem `channel, issuedAt, number, requestId, serviceKey`; hash
// sha256 hex de 64 caracteres — check do DDL 62). Fica vermelho até TASK-0007
// criar `protocol.ts` (§14: `protocolNumber(tx, slug, today)`, `receiptOf`,
// `receiptHash`).
//
// Forma esperada (constrangimento do Inspector, não do contrato): o quarto
// argumento opcional de `protocolNumber` é o `requestId` que o contrato manda
// devolver em `PORTAL.INTERNAL { requestId }`; a colisão é detectada pela
// existência do número em `portal.protocol`/`portal.manifestation` (mesma
// sequência, A2(c)) — a tx falsa registra o unique dos dois lados e responde
// `23505` a um insert repetido, então tanto "consultar antes" quanto "inserir
// e capturar 23505" passam.
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { FakeSqlDatabase } from '../../tests/support/fake-sql.js';
import {
  FIXED_TODAY,
  TENANT_ID,
  TENANT_SLUG,
} from '../../tests/support/portal-fixtures.js';
import { canonicalJson } from './idempotency.service.js';
import { protocolNumber, receiptHash, receiptOf } from './protocol.js';

const REQUEST_ID = '00000000-0000-7000-8000-000070400005';

function protocolRow(number: string, index: number) {
  return {
    request_id: `00000000-0000-7000-8000-0000704f00${index.toString(16).padStart(2, '0')}`,
    number,
    issued_at: new Date('2026-09-01T12:00:00-04:00'),
    receipt_hash: 'f'.repeat(64),
  };
}

describe('CTG-0002 §3.3 — número de protocolo (C-0002-07)', () => {
  it("C-0002-07 — dado slug 'am-fixtures', today 2026-09-14 e nextval 15 então número 'AM-FIXTURES-2026-0000015'", async () => {
    const db = new FakeSqlDatabase({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
      sequences: { 'portal.protocol_seq': 14 },
    });
    const number = await protocolNumber(
      db.tx,
      TENANT_SLUG,
      FIXED_TODAY,
      REQUEST_ID,
    );
    expect(number).toBe('AM-FIXTURES-2026-0000015');
    expect(db.sequenceValue('portal.protocol_seq')).toBe(15);
  });

  it("C-0002-07 — dado slug 'local-e2e' então prefixo 'LOCAL-E2E' e o ano vem de today", async () => {
    const db = new FakeSqlDatabase({
      tenantId: TENANT_ID,
      tenant: { slug: 'local-e2e' },
      sequences: { 'portal.protocol_seq': 0 },
    });
    const number = await protocolNumber(
      db.tx,
      'local-e2e',
      '2027-01-02',
      REQUEST_ID,
    );
    expect(number).toBe('LOCAL-E2E-2027-0000001');
  });

  it('C-0002-07 — dado 23505 na primeira tentativa (número 15 já existe em portal.protocol) então repete nextval e devolve 0000016', async () => {
    const db = new FakeSqlDatabase({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
      sequences: { 'portal.protocol_seq': 14 },
    });
    db.seed('portal.protocol', [protocolRow('AM-FIXTURES-2026-0000015', 1)]);
    const number = await protocolNumber(
      db.tx,
      TENANT_SLUG,
      FIXED_TODAY,
      REQUEST_ID,
    );
    expect(number).toBe('AM-FIXTURES-2026-0000016');
    expect(db.sequenceValue('portal.protocol_seq')).toBe(16);
  });

  it('C-0002-07 — dado colisão com portal.manifestation.protocol (sequência compartilhada, A2(c)) então também repete nextval', async () => {
    const db = new FakeSqlDatabase({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
      sequences: { 'portal.protocol_seq': 14 },
    });
    db.seed('portal.manifestation', [
      {
        state: 'COMPROVANTE_EMITIDO',
        kind: 'elogio',
        confidential: false,
        anonymous: true,
        subject_id: null,
        text: '',
        protocol: 'AM-FIXTURES-2026-0000015',
        received_at: new Date('2026-09-01T12:00:00-04:00'),
        agency_due_on: '2026-10-01',
      },
    ]);
    const number = await protocolNumber(
      db.tx,
      TENANT_SLUG,
      FIXED_TODAY,
      REQUEST_ID,
    );
    expect(number).toBe('AM-FIXTURES-2026-0000016');
  });

  it('C-0002-07 — dado 20 colisões então PORTAL.INTERNAL { requestId }', async () => {
    const db = new FakeSqlDatabase({
      tenantId: TENANT_ID,
      tenant: { slug: TENANT_SLUG },
      sequences: { 'portal.protocol_seq': 14 },
    });
    db.seed(
      'portal.protocol',
      Array.from({ length: 20 }, (_, index) =>
        protocolRow(
          `AM-FIXTURES-2026-${String(15 + index).padStart(7, '0')}`,
          index + 1,
        ),
      ),
    );
    await expect(
      protocolNumber(db.tx, TENANT_SLUG, FIXED_TODAY, REQUEST_ID),
    ).rejects.toMatchObject({
      code: 'PORTAL.INTERNAL',
      status: 500,
      context: { requestId: REQUEST_ID },
    });
    // exatamente 20 tentativas (14 + 20 = 34), nunca a 21ª
    expect(db.sequenceValue('portal.protocol_seq')).toBe(34);
  });
});

describe('CTG-0002 §3.3 — recibo canônico (C-0002-08)', () => {
  it('C-0002-08 — dado recibo { channel, issuedAt, number, requestId, serviceKey } então JSON canônico em ordem de chaves e receipt_hash = sha256 hex de 64 caracteres', () => {
    const issuedAt = new Date('2026-09-14T16:00:00.000Z');
    const receipt = receiptOf({
      serviceKey: 'consulta_multas',
      requestId: REQUEST_ID,
      number: 'AM-FIXTURES-2026-0000015',
      issuedAt,
      channel: 'portal',
    });
    const canonical =
      '{"channel":"portal","issuedAt":"2026-09-14T16:00:00.000Z",' +
      `"number":"AM-FIXTURES-2026-0000015","requestId":"${REQUEST_ID}","serviceKey":"consulta_multas"}`;
    // `receiptOf` pode devolver o objeto ou já a string canônica: os dois casam com o §3.3
    const text = typeof receipt === 'string' ? receipt : canonicalJson(receipt);
    expect(text).toBe(canonical);
    expect(
      Object.keys(typeof receipt === 'string' ? JSON.parse(receipt) : receipt),
    ).toEqual(['channel', 'issuedAt', 'number', 'requestId', 'serviceKey']);

    const hash = receiptHash(receipt);
    expect(hash).toBe(createHash('sha256').update(canonical).digest('hex'));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
