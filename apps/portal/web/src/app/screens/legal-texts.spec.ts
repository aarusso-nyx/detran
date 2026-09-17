// R-0014 TASK-0007 (Inspector). Contrato dos textos jurídicos versionados (plan.md M9;
// prompts/TASK-0007.md §Tarefa item 4).
//
// `efeitos_sne.v1`: os quatro efeitos da adesão ao SNE são os de [RN-PORTAL-123] como TASK-0006
// os transcreveu — `ciencia_ficta`, `substituicao`, `responsabilidade`, `cancelamento` — e não a
// paráfrase do prompt de TASK-0006/0007 ("canal exclusivo, desconto de 60%, cancelamento a
// qualquer tempo"), que não corresponde à tabela normativa da regra e misturaria adesão com
// decisão de pagamento. Fixado por adenda do maestro (plan.md §Adendas A5, 2026-09-17,
// delivery-review-CTG-0002): o teste fixa as quatro chaves por nome, nunca só por contagem.
import { readCatalog } from '../../testing/kb';

const MIN_LEGAL_TEXT_LENGTH = 40;

const VERSIONED_DOCS = [
  'consequencias_desistencia',
  'consequencias_indicacao',
  'efeitos_sne',
  'renuncia_40',
] as const;

// Os quatro efeitos de [RN-PORTAL-123], nomeados exatamente como TASK-0006 os transcreveu
// (plan.md §Adendas A5).
const SNE_EFFECTS = [
  'ciencia_ficta',
  'substituicao',
  'responsabilidade',
  'cancelamento',
] as const;

describe('contrato dos textos jurídicos versionados (M9)', () => {
  const catalog = readCatalog();

  for (const doc of VERSIONED_DOCS) {
    it(`dado o catálogo quando portal.legal.${doc}.v1 é lido então existe, tem ≥ 40 caracteres e tem …v1.source não vazio`, () => {
      const key = `portal.legal.${doc}.v1`;
      expect(catalog[key], `chave ausente: ${key}`).toBeDefined();
      expect(
        catalog[key].length,
        `texto de ${key} tem menos de ${MIN_LEGAL_TEXT_LENGTH} caracteres`,
      ).toBeGreaterThanOrEqual(MIN_LEGAL_TEXT_LENGTH);

      const sourceKey = `${key}.source`;
      expect(
        catalog[sourceKey]?.length ?? 0,
        `chave ausente ou vazia: ${sourceKey}`,
      ).toBeGreaterThan(0);
    });
  }

  it('dado o catálogo quando portal.legal.efeitos_sne.v1.* é lido então tem exatamente as 4 chaves nomeadas de [RN-PORTAL-123], além de .source', () => {
    const prefix = 'portal.legal.efeitos_sne.v1.';
    const children = Object.keys(catalog)
      .filter((key) => key.startsWith(prefix))
      .filter((key) => key !== `${prefix}source`)
      .map((key) => key.slice(prefix.length))
      .sort();
    expect(children).toEqual([...SNE_EFFECTS].sort());
    for (const effect of SNE_EFFECTS) {
      const key = `${prefix}${effect}`;
      expect(catalog[key], `chave ausente: ${key}`).toBeDefined();
      expect(
        catalog[key].length,
        `texto de ${key} tem menos de ${MIN_LEGAL_TEXT_LENGTH} caracteres`,
      ).toBeGreaterThanOrEqual(MIN_LEGAL_TEXT_LENGTH);
    }
  });

  it('dado todo texto jurídico (portal.legal.*, exceto .source) quando inspecionado então não está vazio nem tem menos de 40 caracteres', () => {
    const offenders = Object.entries(catalog)
      .filter(([key]) => key.startsWith('portal.legal.'))
      .filter(([key]) => !key.endsWith('.source'))
      .filter(([, value]) => value.length < MIN_LEGAL_TEXT_LENGTH)
      .map(([key]) => key);
    expect(
      offenders,
      `textos jurídicos curtos ou vazios: ${offenders.join(', ')}`,
    ).toEqual([]);
  });
});
