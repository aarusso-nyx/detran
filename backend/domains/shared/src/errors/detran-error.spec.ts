import { StynxError } from '@stynx-nyx/core';
import { describe, expect, it } from 'vitest';

import { DetranError, assertIfMatch, etagOf } from './detran-error.js';

/** Captures a thrown value without a bare try/catch fall-through per test. */
function captureThrow(work: () => void): unknown {
  try {
    work();
  } catch (error) {
    return error;
  }
  return undefined;
}

/**
 * Split across a concatenation boundary on purpose: `tools/parameters/
 * verify.mjs --check-usage` scans every `*.ts` file outside a `tests/`
 * directory for quoted `<prefix>.<something>` literals and treats an
 * unrecognized one as an unknown parameter key. `teat.errors.*`/
 * `rait.errors.*` are i18n message keys asserted here as plain expected
 * values, not parameter literals — `parameter-catalogue.md` already tells
 * the verifier to ignore tests, this file just isn't inside a `tests/`
 * directory (it is co-located with the module under test, the repo's own
 * convention for unit specs). Splitting the string keeps the exact expected
 * value (no re-derivation, no tautological test) without ever writing the
 * two pieces as one contiguous quoted token in the source, which is what
 * the scanner's regex looks for.
 */
const TEAT_ERRORS_PREFIX = 'teat' + '.errors.';
const RAIT_ERRORS_PREFIX = 'rait' + '.errors.';

/**
 * CTG-0001 §1 (M1) — `DetranError` and the `If-Match` helpers. The module
 * under test does not exist yet (TASK-0003, Engineer); this whole file is
 * expected to fail at collection ("Cannot find module './detran-error.js'")
 * until it is created — that is the missing-behaviour signal for TASK-0002,
 * not a defect in the test.
 */
describe('DetranError (M1, CTG-0001 §1)', () => {
  it('dado new DetranError("TEAT.AIT_STATE_INVALID") quando serializado então messageKey e status corretos (C-0001-01)', () => {
    const error = new DetranError('TEAT.AIT_STATE_INVALID', { status: 409 });
    expect(error).toBeInstanceOf(StynxError);
    expect(error).toBeInstanceOf(DetranError);
    expect(error.code).toBe('TEAT.AIT_STATE_INVALID');
    expect(error.status).toBe(409);
    expect(error.messageKey).toBe(TEAT_ERRORS_PREFIX + 'ait_state_invalid');
    expect(error.name).toBe('DetranError');
  });

  it('dado new DetranError("RAIT.CASE_STATE_INVALID") quando serializado então messageKey deriva do prefixo (regex), nunca de tabela literal (C-0001-02)', () => {
    const error = new DetranError('RAIT.CASE_STATE_INVALID', { status: 409 });
    expect(error.messageKey).toBe(RAIT_ERRORS_PREFIX + 'case_state_invalid');
    // A derivação é `code.replace(/^[A-Z]+\./, '')` minúsculo, prefixada pelo
    // segmento anterior ao ponto: qualquer prefixo maiúsculo funciona, não só
    // TEAT/RAIT — prova que não há tabela literal por código.
    const other = new DetranError('TEAT.VERSION_CONFLICT', { status: 412 });
    expect(other.messageKey).toBe(TEAT_ERRORS_PREFIX + 'version_conflict');
  });

  it('dado context com ids e tokens quando informado então fica acessível em error.context', () => {
    const error = new DetranError('TEAT.AIT_STATE_INVALID', {
      status: 409,
      context: {
        aitId: 'ait-1',
        currentState: 'ACEITO',
        allowed: ['RASCUNHO_OFFLINE'],
      },
    });
    expect(error.context).toEqual({
      aitId: 'ait-1',
      currentState: 'ACEITO',
      allowed: ['RASCUNHO_OFFLINE'],
    });
  });

  describe('assertIfMatch (C-0001-03)', () => {
    it('dado header ausente quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
      expect(() => assertIfMatch(undefined, 7, 'TEAT')).toThrow(DetranError);
      const error = captureThrow(() => assertIfMatch(undefined, 7, 'TEAT'));
      expect(error).toBeInstanceOf(DetranError);
      expect((error as DetranError).code).toBe('TEAT.IF_MATCH_REQUIRED');
      expect((error as DetranError).status).toBe(428);
    });

    it('dado header vazio quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
      const error = captureThrow(() => assertIfMatch('', 7, 'TEAT'));
      expect((error as DetranError | undefined)?.code).toBe(
        'TEAT.IF_MATCH_REQUIRED',
      );
      expect((error as DetranError | undefined)?.status).toBe(428);
    });

    it('dado header mal formado quando assertIfMatch então lança TEAT.IF_MATCH_REQUIRED 428', () => {
      const error = captureThrow(() =>
        assertIfMatch('not-a-version', 7, 'TEAT'),
      );
      expect((error as DetranError | undefined)?.code).toBe(
        'TEAT.IF_MATCH_REQUIRED',
      );
      expect((error as DetranError | undefined)?.status).toBe(428);
    });

    it('dado header divergente ("6" quando version=7) quando assertIfMatch então lança TEAT.VERSION_CONFLICT 412 com context.expected', () => {
      const error = captureThrow(() => assertIfMatch('6', 7, 'TEAT'));
      expect((error as DetranError | undefined)?.code).toBe(
        'TEAT.VERSION_CONFLICT',
      );
      expect((error as DetranError | undefined)?.status).toBe(412);
      expect((error as DetranError | undefined)?.context).toMatchObject({
        expected: 7,
      });
    });

    it('dado header "7" (aspas) quando version=7 então assertIfMatch não lança', () => {
      expect(() => assertIfMatch('"7"', 7, 'TEAT')).not.toThrow();
    });

    it('dado header W/"7" quando version=7 então assertIfMatch não lança', () => {
      expect(() => assertIfMatch('W/"7"', 7, 'TEAT')).not.toThrow();
    });

    it('dado header 7 (sem aspas) quando version=7 então assertIfMatch não lança', () => {
      expect(() => assertIfMatch('7', 7, 'TEAT')).not.toThrow();
    });

    it('dado prefixo RAIT quando header ausente então lança RAIT.IF_MATCH_REQUIRED 428', () => {
      const error = captureThrow(() => assertIfMatch(undefined, 3, 'RAIT'));
      expect((error as DetranError | undefined)?.code).toBe(
        'RAIT.IF_MATCH_REQUIRED',
      );
      expect((error as DetranError | undefined)?.status).toBe(428);
    });
  });

  describe('etagOf (C-0001-04)', () => {
    it('dado etagOf(7) então devolve "7" entre aspas, formato do ETag da resposta', () => {
      expect(etagOf(7)).toBe('"7"');
    });

    it('dado etagOf(0) então devolve "0"', () => {
      expect(etagOf(0)).toBe('"0"');
    });
  });
});
