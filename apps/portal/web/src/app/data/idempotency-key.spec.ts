// R-0014 TASK-0008 (Inspector). `data/idempotency-key.ts` (novo, contrato CTG-0003a §2.2, M17
// do plan.md): `canonicalJson`, `sha256Hex`, `idempotencyKey`. O módulo ainda não existe
// (TASK-0009, Engineer) — a importação falha com "Cannot find module" (estado esperado, §9 do
// contrato); os tipos abaixo tipam a chamada contra a assinatura do contrato.
import {
  canonicalJson,
  sha256Hex,
  idempotencyKey,
} from '../../app/data/idempotency-key';
import { AIT_ID } from '../../testing/http-fixtures';

describe('canonicalJson (M17: chaves ordenadas recursivamente, undefined omitido, sem espaços)', () => {
  it('dado { b: 1, a: { d: [2, 1], c: undefined, e: null } } quando canonicalJson então \'{"a":{"d":[2,1],"e":null},"b":1}\'', () => {
    // C-3a-01
    const value = { b: 1, a: { d: [2, 1], c: undefined, e: null } };
    expect(canonicalJson(value)).toBe('{"a":{"d":[2,1],"e":null},"b":1}');
  });
});

describe('sha256Hex', () => {
  it("dado '' quando sha256Hex então o hex minúsculo de 64 caracteres do SHA-256 vazio", async () => {
    // C-3a-02
    const hash = await sha256Hex('');
    // B4 (iteração 2): o hex de SHA-256 tem 64 caracteres (a versão anterior tinha 63 por
    // transcrição incorreta) — valor real, verificável independentemente (SHA-256 de '').
    expect(hash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('idempotencyKey (forma <ato>:<alvo>:<fingerprint>, M17)', () => {
  it('dado (defesa_previa, aitId, body) quando idempotencyKey então corresponde ao padrão; mesmo corpo → mesma chave; corpo diferente → fingerprint diferente', async () => {
    // C-3a-03
    const body = { facts: 'x', grounds: 'y', attachmentIds: [] };
    const key = await idempotencyKey('defesa_previa', AIT_ID, body);
    expect(key).toMatch(new RegExp(`^defesa_previa:${AIT_ID}:[0-9a-f]{64}$`));
    const sameBodyKey = await idempotencyKey('defesa_previa', AIT_ID, body);
    expect(sameBodyKey).toBe(key);
    const differentBodyKey = await idempotencyKey('defesa_previa', AIT_ID, {
      ...body,
      facts: 'z',
    });
    expect(differentBodyKey).not.toBe(key);
  });

  it('dado { a: 1, b: 2 } e { b: 2, a: 1 } quando idempotencyKey então chaves iguais (canonicalização ordena as chaves)', async () => {
    // C-3a-04
    const keyA = await idempotencyKey('withdraw', AIT_ID, { a: 1, b: 2 });
    const keyB = await idempotencyKey('withdraw', AIT_ID, { b: 2, a: 1 });
    expect(keyA).toBe(keyB);
  });
});
