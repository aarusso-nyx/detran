// R-0014 TASK-0008 (Inspector). Critérios transversais aos 14 schemas + `form-gate.ts` +
// `attachments.ts` (16 arquivos novos de `forms/`, contrato CTG-0003a §6, ainda inexistentes —
// TASK-0009). C-3a-93 (parte cruzada): `required` de cada forma com corpo do schema JSON
// (`docs/framework/schemas/portal-request-draft.schema.json`) ⊆ campos obrigatórios do zod
// correspondente, para as 8 formas com título compartilhado entre o schema JSON e `forms/*`
// (`defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`,
// `adesao_sne`, `junta_medica`, `lgpd_declaracao`/`meus-dados`); `cancelamento_sne` e as leituras
// (`consulta_*`, `emissao_crlv`) do schema JSON não têm arquivo correspondente em `forms/` (fora
// do escopo do par 1, §1). C-3a-98: varredura de código-fonte (os 16 arquivos ainda não existem;
// o teste falha ao ler o diretório — estado esperado até TASK-0009 — e relata a lista de
// arquivos ausentes em vez de um ENOENT opaco); guardas existentes (`core/guards/*.guard.ts`,
// já em produção) verificados de verdade.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DefesaPreviaSchema } from './defesa-previa.schema';
import { RecursoJariSchema } from './recurso-jari.schema';
import { RecursoCetranSchema } from './recurso-cetran.schema';
import { IndicacaoCondutorSchema } from './indicacao-condutor.schema';
import { PagamentoSchema } from './pagamento.schema';
import { AdesaoSneSchema } from './adesao-sne.schema';
import { JuntaMedicaSchema } from './junta-medica.schema';
import { MeusDadosSchema } from './meus-dados.schema';

const formsDir = dirname(fileURLToPath(import.meta.url));
const coreGuardsDir = join(formsDir, '..', 'core', 'guards');
const repoRoot = join(formsDir, '..', '..', '..', '..', '..', '..');
const draftSchemaPath = join(
  repoRoot,
  'docs/framework/schemas/portal-request-draft.schema.json',
);

type ZodLikeSchema = { safeParse: (value: unknown) => { success: boolean } };

const SCHEMA_BY_TITLE: Record<string, ZodLikeSchema> = {
  defesa_previa: DefesaPreviaSchema,
  recurso_jari: RecursoJariSchema,
  recurso_cetran: RecursoCetranSchema,
  indicacao_condutor: IndicacaoCondutorSchema,
  pagamento: PagamentoSchema,
  adesao_sne: AdesaoSneSchema,
  junta_medica: JuntaMedicaSchema,
  lgpd_declaracao: MeusDadosSchema,
};

// Corpos canônicos completos (mesmos das specs individuais) usados só para "apagar" um campo por
// vez e checar que a ausência de um `required` do schema JSON também falha no zod.
const CANONICAL_BODY: Record<string, Record<string, unknown>> = {
  defesa_previa: {
    facts: 'x',
    grounds: 'y',
    attachmentIds: ['00000000-0000-7000-8000-0000bb000001'],
    requestType: 'outro',
  },
  recurso_jari: { grounds: 'x', attachmentIds: [] },
  recurso_cetran: { attachmentIds: [] },
  indicacao_condutor: {
    driver: {
      cpf: '11144477735',
      cnhNumber: '1',
      cnhUf: 'AM',
      category: 'B',
      name: 'x',
    },
    signatures: { owner: 'govbr', driver: 'govbr' },
    consequenceAck: {
      textVersion: 'v1',
      acceptedAt: '2026-09-14T12:00:00-04:00',
    },
  },
  pagamento: { tier: 'desconto_80', method: 'pix' },
  adesao_sne: {
    email: 'x@fixtures.invalid',
    phone: '92991234567',
    consent: {
      textVersion: 'v1',
      effectsAck: [
        'ciencia_ficta',
        'canal_exclusivo',
        'desconto_60',
        'cancelamento',
      ],
    },
  },
  junta_medica: {
    examId: '00000000-0000-7000-8000-00007ff00002',
    reason: 'x',
    attachmentIds: [],
  },
  lgpd_declaracao: { scope: 'confirmacao' },
};

interface DraftSchemaOneOf {
  readonly title: string;
  readonly required?: readonly string[];
}

describe('forms/* — required do schema JSON ⊆ required do zod (C-3a-93, parte cruzada)', () => {
  const draftSchema = JSON.parse(readFileSync(draftSchemaPath, 'utf8')) as {
    oneOf: readonly DraftSchemaOneOf[];
  };
  const oneOf = draftSchema.oneOf;

  it.each(Object.keys(SCHEMA_BY_TITLE))('dado o título %s', (title) => {
    const jsonEntry = oneOf.find((entry) => entry.title === title);
    expect(
      jsonEntry,
      `título ${title} não encontrado no schema JSON`,
    ).toBeDefined();
    const required = jsonEntry?.required ?? [];
    const schema = SCHEMA_BY_TITLE[title];
    const canonicalBody = CANONICAL_BODY[title];
    for (const field of required) {
      const { [field]: _omit, ...rest } = canonicalBody;
      const result = schema.safeParse(rest);
      expect(
        result.success,
        `${title}: campo obrigatório '${field}' do schema JSON não é obrigatório no zod`,
      ).toBe(false);
    }
  });
});

describe('forms/* — fronteiras de import (C-3a-98)', () => {
  it('dado os 16 arquivos de forms/ então nenhum importa core/session.facade, core/guards ou usa Date', () => {
    let entries: string[];
    try {
      entries = readdirSync(formsDir).filter(
        (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'),
      );
    } catch (error) {
      throw new Error(
        `forms/ ainda não existe (TASK-0009): ${(error as Error).message}`,
      );
    }
    expect(
      entries.length,
      'forms/ deveria ter 16 arquivos (14 schemas + form-gate.ts + attachments.ts)',
    ).toBe(16);
    const offenders: string[] = [];
    for (const name of entries) {
      const text = readFileSync(join(formsDir, name), 'utf8');
      if (/session\.facade/.test(text))
        offenders.push(`${name}: importa session.facade`);
      if (/core\/guards/.test(text))
        offenders.push(`${name}: importa core/guards`);
      if (/\bDate\b/.test(text)) offenders.push(`${name}: usa Date`);
    }
    expect(offenders).toEqual([]);
  });

  it('dado os guardas existentes (core/guards/*.guard.ts) então nenhum importa forms/ (gates nunca decidem permissão)', () => {
    const guardFiles = readdirSync(coreGuardsDir).filter((name) =>
      name.endsWith('.guard.ts'),
    );
    expect(guardFiles.length).toBeGreaterThan(0);
    const offenders = guardFiles.filter((name) =>
      /from ['"].*\/forms\//.test(
        readFileSync(join(coreGuardsDir, name), 'utf8'),
      ),
    );
    expect(offenders).toEqual([]);
  });
});
