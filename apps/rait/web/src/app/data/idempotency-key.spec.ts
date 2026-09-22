// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.2, §8 (C-2B-16) — `data/idempotency-key.ts`
// = cópia de `apps/portal/web/src/app/data/idempotency-key.ts` (M17); ainda não existe
// (TASK-0009): falha de módulo esperada. Transcrição dos critérios C-3a-01…04 do Portal.
import { canonicalJson, sha256Hex, idempotencyKey } from './idempotency-key';
import { CASE_IDS } from '../../testing/http-fixtures';

describe('canonicalJson (M17: chaves ordenadas recursivamente, undefined omitido, sem espaços)', () => {
  it('dado { b: 1, a: { d: [2, 1], c: undefined, e: null } } quando canonicalJson então \'{"a":{"d":[2,1],"e":null},"b":1}\'', () => {
    // C-2B-16 (= C-3a-01)
    const value = { b: 1, a: { d: [2, 1], c: undefined, e: null } };
    expect(canonicalJson(value)).toBe('{"a":{"d":[2,1],"e":null},"b":1}');
  });
});

describe('sha256Hex', () => {
  it("dado '' quando sha256Hex então o hex minúsculo de 64 caracteres do SHA-256 vazio (e3b0c442…b855)", async () => {
    // C-2B-16 (= C-3a-02)
    const hash = await sha256Hex('');
    expect(hash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('idempotencyKey (forma <ato>:<alvo>:<fingerprint>, M17)', () => {
  it('dado ("admit", CASE_IDS.TRIAGEM_ADMISSIBILIDADE, body) quando idempotencyKey então casa /^admit:<id>:[0-9a-f]{64}$/; mesmo corpo → mesma chave; corpo diferente → fingerprint diferente', async () => {
    // C-2B-16 (= C-3a-03)
    const id = CASE_IDS.TRIAGEM_ADMISSIBILIDADE;
    const body = { reason: 'x' };
    const key = await idempotencyKey('admit', id, body);
    expect(key).toMatch(new RegExp(`^admit:${id}:[0-9a-f]{64}$`));
    const sameBodyKey = await idempotencyKey('admit', id, body);
    expect(sameBodyKey).toBe(key);
    const differentBodyKey = await idempotencyKey('admit', id, { reason: 'y' });
    expect(differentBodyKey).not.toBe(key);
  });

  it('dado { a: 1, b: 2 } e { b: 2, a: 1 } quando idempotencyKey então chaves iguais (canonicalização ordena as chaves)', async () => {
    // C-2B-16 (= C-3a-04)
    const id = CASE_IDS.TRIAGEM_ADMISSIBILIDADE;
    const keyA = await idempotencyKey('admit', id, { a: 1, b: 2 });
    const keyB = await idempotencyKey('admit', id, { b: 2, a: 1 });
    expect(keyA).toBe(keyB);
  });
});
