// CTG-0001 §2 (M3) — parsing das claims de identidade federada. Fica vermelho até
// TASK-0004 criar backend/domains/portal/identity/src/handwritten/identity.service.ts
// (e o index.ts que o re-exporta, §12 Layout). Regras fail-closed: qualquer falha
// devolve `null` inteiro (nunca lança, nunca degrada para 'simples' — §2.1 regra 0).
import { describe, expect, it } from 'vitest';

import {
  portalClaimNames,
  portalIdentityClaims,
  PORTAL_ASSURANCE_LEVELS,
  PORTAL_GOVBR_LEVELS,
} from './index.js';

describe('portalClaimNames (§2.2)', () => {
  it('dado ambiente sem STYNX_COGNITO_*_CLAIM quando portalClaimNames então usa os nomes default custom:assurance_level e custom:cpf', () => {
    const names = portalClaimNames({});
    expect(names).toEqual({
      assuranceClaim: 'custom:assurance_level',
      cpfClaim: 'custom:cpf',
    });
  });

  it('dado STYNX_COGNITO_ASSURANCE_CLAIM e STYNX_COGNITO_CPF_CLAIM configurados quando portalClaimNames então usa os nomes configurados', () => {
    const names = portalClaimNames({
      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
    });
    expect(names).toEqual({
      assuranceClaim: 'custom:x_assurance',
      cpfClaim: 'custom:x_cpf',
    });
  });
});

describe('portalIdentityClaims (§2.1) — fail-closed: qualquer falha devolve null', () => {
  it('dado principal undefined quando portalIdentityClaims então null (regra 1)', () => {
    expect(portalIdentityClaims(undefined)).toBeNull();
  });

  it('dado principal sem a propriedade claims quando portalIdentityClaims então null (regra 1)', () => {
    expect(portalIdentityClaims({} as never)).toBeNull();
  });

  it('dado claims não-objeto (string) quando portalIdentityClaims então null (regra 1)', () => {
    expect(
      portalIdentityClaims({ claims: 'not-an-object' } as never),
    ).toBeNull();
  });

  it('dado claims sem assurance_level quando portalIdentityClaims então null (regra 2)', () => {
    expect(
      portalIdentityClaims({ claims: { cpf: '11111111111' } } as never),
    ).toBeNull();
  });

  it('dado assurance_level não-string (number) quando portalIdentityClaims então null (regra 2)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 2, cpf: '11111111111' },
      } as never),
    ).toBeNull();
  });

  it('dado assurance_level em caixa alta ("AVANCADA") quando portalIdentityClaims então null — comparação exata, sem lower-case (regra 2)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'AVANCADA', cpf: '11111111111' },
      } as never),
    ).toBeNull();
  });

  it('dado assurance_level com acentuação divergente ("avançada") quando portalIdentityClaims então null — comparação exata, sem trim/normalização (regra 2)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'avançada', cpf: '11111111111' },
      } as never),
    ).toBeNull();
  });

  for (const level of PORTAL_ASSURANCE_LEVELS) {
    it(`dado assurance_level=${level} (token canônico) e cpf válido quando portalIdentityClaims então assuranceLevel=${level}`, () => {
      const result = portalIdentityClaims({
        claims: { assurance_level: level, cpf: '11111111111' },
      } as never);
      expect(result?.assuranceLevel).toBe(level);
    });
  }

  it('dado claims sem cpf quando portalIdentityClaims então null (regra 3)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'simples' },
      } as never),
    ).toBeNull();
  });

  it('dado cpf não-string (number) quando portalIdentityClaims então null (regra 3)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'simples', cpf: 11111111111 },
      } as never),
    ).toBeNull();
  });

  it('dado cpf com máscara "111.111.111-11" quando portalIdentityClaims então normaliza para "11111111111" (regra 3, /\\D/g)', () => {
    const result = portalIdentityClaims({
      claims: { assurance_level: 'simples', cpf: '111.111.111-11' },
    } as never);
    expect(result?.cpf).toBe('11111111111');
  });

  it('dado cpf com 10 dígitos quando portalIdentityClaims então null (regra 3, comprimento ≠ 11)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'simples', cpf: '1111111111' },
      } as never),
    ).toBeNull();
  });

  it('dado cpf com 12 dígitos quando portalIdentityClaims então null (regra 3, comprimento ≠ 11)', () => {
    expect(
      portalIdentityClaims({
        claims: { assurance_level: 'simples', cpf: '111111111111' },
      } as never),
    ).toBeNull();
  });

  it('dado cpf de dígitos repetidos (sem DV válido) quando portalIdentityClaims então aceita — regra 3 não valida dígito verificador nesta rodada (OD-P25)', () => {
    const result = portalIdentityClaims({
      claims: { assurance_level: 'simples', cpf: '11111111111' },
    } as never);
    expect(result?.cpf).toBe('11111111111');
  });

  it('dado govbr_level fora de PORTAL_GOVBR_LEVELS ("platina") quando portalIdentityClaims então claims sem govbrLevel — omitido, não é o resultado inteiro que vira null (regra 4)', () => {
    const result = portalIdentityClaims({
      claims: {
        assurance_level: 'simples',
        cpf: '11111111111',
        govbr_level: 'platina',
      },
    } as never);
    expect(result).not.toBeNull();
    expect(result?.govbrLevel).toBeUndefined();
  });

  for (const level of PORTAL_GOVBR_LEVELS) {
    it(`dado govbr_level=${level} (token canônico) quando portalIdentityClaims então govbrLevel=${level}`, () => {
      const result = portalIdentityClaims({
        claims: {
          assurance_level: 'simples',
          cpf: '11111111111',
          govbr_level: level,
        },
      } as never);
      expect(result?.govbrLevel).toBe(level);
    });
  }

  it('dado claims completas e válidas quando portalIdentityClaims então devolve exatamente { cpf, assuranceLevel } sem govbrLevel quando ausente', () => {
    const result = portalIdentityClaims({
      claims: { assurance_level: 'avancada', cpf: '22222222222' },
    } as never);
    expect(result).toEqual({ cpf: '22222222222', assuranceLevel: 'avancada' });
  });

  it('C-0001-10a — dado claims só sob os nomes configurados (STYNX_COGNITO_ASSURANCE_CLAIM/STYNX_COGNITO_CPF_CLAIM) quando portalIdentityClaims então lê por eles', () => {
    const names = portalClaimNames({
      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
    });
    const result = portalIdentityClaims(
      {
        claims: {
          'custom:x_assurance': 'avancada',
          'custom:x_cpf': '22222222222',
        },
      } as never,
      names,
    );
    expect(result).toEqual({ cpf: '22222222222', assuranceLevel: 'avancada' });
  });

  it('C-0001-10b — dado claims com o nome curto E o nome configurado presentes então o nome curto vence (ordem de leitura §2.1)', () => {
    const names = portalClaimNames({
      STYNX_COGNITO_ASSURANCE_CLAIM: 'custom:x_assurance',
      STYNX_COGNITO_CPF_CLAIM: 'custom:x_cpf',
    });
    const result = portalIdentityClaims(
      {
        claims: {
          assurance_level: 'simples',
          'custom:x_assurance': 'avancada',
          cpf: '11111111111',
          'custom:x_cpf': '22222222222',
        },
      } as never,
      names,
    );
    expect(result).toEqual({ cpf: '11111111111', assuranceLevel: 'simples' });
  });

  it('C-0001-11 — dado govbr_level "platina" quando portalIdentityClaims então devolve claims sem govbrLevel (não null o conjunto todo)', () => {
    const result = portalIdentityClaims({
      claims: {
        assurance_level: 'simples',
        cpf: '11111111111',
        govbr_level: 'platina',
      },
    } as never);
    expect(result).not.toBeNull();
    expect(result).toEqual({ cpf: '11111111111', assuranceLevel: 'simples' });
  });
});
