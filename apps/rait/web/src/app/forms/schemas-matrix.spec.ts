// R-0012 TASK-0011 (Inspector). Critérios transversais aos 17 arquivos de `forms/` (contrato
// CTG-0002c §8 C-2C-76…81) e a lista fechada das 152 chaves `rait.forms.*` do §7 (C-2C-100).
// Os 17 arquivos ainda não existem (TASK-0012): as importações falham com "Cannot find module"
// (estado esperado, contrato §1). Nada aqui importa `forms/` para decidir permissão — o gate é
// documentação verificável (§2.1).
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIT_COMMANDS } from '../data/models/commands';
import { RAIT_ERROR_CODES } from '../core/error-codes';
import { RAIT_ALL_ROLES } from '../app.route-manifest';
import { readAppCatalog } from '../../testing/kb';
import { IntakeFisicoSchema, INTAKE_FISICO_GATE } from './intake-fisico.schema';
import {
  TriagemSchema,
  TRIAGEM_GATE,
  TRIAGEM_ADMIT_GATE,
  TRIAGEM_REJECT_GATE,
} from './triagem.schema';
import {
  DiligenciaSchema,
  DILIGENCIA_GATE,
  DILIGENCIA_ANSWER_GATE,
  DILIGENCIA_EXTEND_GATE,
} from './diligencia.schema';
import { MinutaSchema, MINUTA_GATE } from './minuta.schema';
import {
  DecisaoAutoridadeSchema,
  DECISAO_AUTORIDADE_GATE,
  DECISAO_AUTORIDADE_RETURN_GATE,
} from './decisao-autoridade.schema';
import { ParecerVotoSchema, PARECER_VOTO_GATE } from './parecer-voto.schema';
import {
  LoteSorteioSchema,
  LOTE_SORTEIO_GATE,
  LOTE_SORTEIO_DRAW_GATE,
  LOTE_SORTEIO_APPROVE_GATE,
} from './lote-sorteio.schema';
import { PautaSchema, PAUTA_GATE } from './pauta.schema';
import {
  SessaoAoVivoSchema,
  SESSAO_AO_VIVO_GATE,
  SESSAO_AO_VIVO_CASTING_VOTE_GATE,
  SESSAO_AO_VIVO_OPEN_GATE,
} from './sessao-ao-vivo.schema';
import { DesistenciaSchema, DESISTENCIA_GATE } from './desistencia.schema';
import { EscalaSchema, ESCALA_GATE } from './escala.schema';
import { MandatoSchema, MANDATO_GATE } from './mandato.schema';
import { ReatribuicaoSchema, REATRIBUICAO_GATE } from './reatribuicao.schema';
import { AtoSuspensaoSchema, ATO_SUSPENSAO_GATE } from './ato-suspensao.schema';
import { ParametroSchema, PARAMETRO_GATE } from './parametro.schema';
import { ExportacaoSchema, EXPORTACAO_GATE } from './exportacao.schema';

const formsDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(formsDir, '..');
const guardsDir = join(appDir, 'core', 'guards');
const facadesDir = join(appDir, 'data', 'facades');

/** Os 16 nomes kebab do M11 (plan.md), na ordem do contrato §1. */
const SCHEMA_NAMES = [
  'intake-fisico',
  'triagem',
  'diligencia',
  'minuta',
  'decisao-autoridade',
  'parecer-voto',
  'lote-sorteio',
  'pauta',
  'sessao-ao-vivo',
  'desistencia',
  'escala',
  'mandato',
  'reatribuicao',
  'ato-suspensao',
  'parametro',
  'exportacao',
] as const;

interface ZodLike {
  readonly safeParse: (value: unknown) => unknown;
}
interface GateLike {
  readonly preState: readonly string[] | null;
  readonly roles: readonly string[];
  readonly preconditions: readonly { note: string; source: string }[];
  readonly command: string;
  readonly postState: string | null;
  readonly errorCodes: readonly string[];
}

/** Nome kebab → { schema, gates exportados } (§5.1: 25 gates em 16 arquivos). */
const MODULES: Readonly<
  Record<string, { schema: ZodLike; gates: Readonly<Record<string, GateLike>> }>
> = {
  'intake-fisico': {
    schema: IntakeFisicoSchema,
    gates: { INTAKE_FISICO_GATE },
  },
  triagem: {
    schema: TriagemSchema,
    gates: { TRIAGEM_GATE, TRIAGEM_ADMIT_GATE, TRIAGEM_REJECT_GATE },
  },
  diligencia: {
    schema: DiligenciaSchema,
    gates: { DILIGENCIA_GATE, DILIGENCIA_ANSWER_GATE, DILIGENCIA_EXTEND_GATE },
  },
  minuta: { schema: MinutaSchema, gates: { MINUTA_GATE } },
  'decisao-autoridade': {
    schema: DecisaoAutoridadeSchema,
    gates: { DECISAO_AUTORIDADE_GATE, DECISAO_AUTORIDADE_RETURN_GATE },
  },
  'parecer-voto': {
    schema: ParecerVotoSchema,
    gates: { PARECER_VOTO_GATE },
  },
  'lote-sorteio': {
    schema: LoteSorteioSchema,
    gates: {
      LOTE_SORTEIO_GATE,
      LOTE_SORTEIO_DRAW_GATE,
      LOTE_SORTEIO_APPROVE_GATE,
    },
  },
  pauta: { schema: PautaSchema, gates: { PAUTA_GATE } },
  'sessao-ao-vivo': {
    schema: SessaoAoVivoSchema,
    gates: {
      SESSAO_AO_VIVO_GATE,
      SESSAO_AO_VIVO_CASTING_VOTE_GATE,
      SESSAO_AO_VIVO_OPEN_GATE,
    },
  },
  desistencia: { schema: DesistenciaSchema, gates: { DESISTENCIA_GATE } },
  escala: { schema: EscalaSchema, gates: { ESCALA_GATE } },
  mandato: { schema: MandatoSchema, gates: { MANDATO_GATE } },
  reatribuicao: { schema: ReatribuicaoSchema, gates: { REATRIBUICAO_GATE } },
  'ato-suspensao': {
    schema: AtoSuspensaoSchema,
    gates: { ATO_SUSPENSAO_GATE },
  },
  parametro: { schema: ParametroSchema, gates: { PARAMETRO_GATE } },
  exportacao: { schema: ExportacaoSchema, gates: { EXPORTACAO_GATE } },
};

/** Fronteira do §2: nada de facade, guarda, relógio, HTTP ou `Date` em `forms/`. */
const FORBIDDEN_IMPORTS =
  /session\.facade|core\/guards|data\/clock|data\/api|data\/facades|HttpClient|\bDate\b|Date\.now|inject\(/;

/** Contrato §7: as 152 chaves `rait.forms.*` (lista fechada, literal). */
const FORMS_I18N_KEYS: readonly string[] = [
  'rait.forms.common.required',
  'rait.forms.common.too_long',
  'rait.forms.common.format_invalid',
  'rait.forms.common.enum_invalid',
  'rait.forms.common.unknown_field',
  'rait.forms.common.invalid',
  'rait.forms.common.document_invalid',
  'rait.forms.common.plate_invalid',
  'rait.forms.common.ait_single',
  'rait.forms.common.date_future',
  'rait.forms.common.date_past',
  'rait.forms.common.period_invalid',
  'rait.forms.common.file_type',
  'rait.forms.common.state_invalid',
  'rait.forms.intake-fisico.channel',
  'rait.forms.intake-fisico.markOn',
  'rait.forms.intake-fisico.plate',
  'rait.forms.intake-fisico.aitNumber',
  'rait.forms.intake-fisico.applicant.name',
  'rait.forms.intake-fisico.applicant.document',
  'rait.forms.intake-fisico.applicant.address',
  'rait.forms.intake-fisico.applicant.legitimacyBasis',
  'rait.forms.intake-fisico.signaturePresent',
  'rait.forms.intake-fisico.documents',
  'rait.forms.intake-fisico.documents.kind',
  'rait.forms.intake-fisico.documents.file',
  'rait.forms.triagem.verdicts.legitimidade',
  'rait.forms.triagem.verdicts.assinatura',
  'rait.forms.triagem.verdicts.pedido_compativel',
  'rait.forms.triagem.verdicts.verdict',
  'rait.forms.triagem.verdicts.reason',
  'rait.forms.triagem.tempestividade',
  'rait.forms.triagem.outcome',
  'rait.forms.triagem.nonAdmissionReason',
  'rait.forms.triagem.nonAdmissionGrounds',
  'rait.forms.triagem.verdicts.incomplete',
  'rait.forms.triagem.verdicts.reason_required',
  'rait.forms.triagem.nonAdmissionReason.required',
  'rait.forms.triagem.nonAdmissionReason.mismatch',
  'rait.forms.triagem.nonAdmissionGrounds.cite_art4',
  'rait.forms.triagem.outcome.admit_blocked',
  'rait.forms.diligencia.addressee',
  'rait.forms.diligencia.subject',
  'rait.forms.diligencia.dueOn',
  'rait.forms.diligencia.officialDocument',
  'rait.forms.diligencia.extension.reason',
  'rait.forms.diligencia.addressee.official_document',
  'rait.forms.diligencia.extension.limit',
  'rait.forms.diligencia.extension.closed',
  'rait.forms.minuta.facts',
  'rait.forms.minuta.grounds',
  'rait.forms.minuta.ruling',
  'rait.forms.minuta.ruling.acolher',
  'rait.forms.minuta.ruling.indeferir',
  'rait.forms.decisao-autoridade.kind',
  'rait.forms.decisao-autoridade.grounds',
  'rait.forms.decisao-autoridade.signature',
  'rait.forms.decisao-autoridade.returnGuidance',
  'rait.forms.decisao-autoridade.context.jurisdiction',
  'rait.forms.decisao-autoridade.context.not_on_duty',
  'rait.forms.decisao-autoridade.context.draft_author',
  'rait.forms.decisao-autoridade.context.instance',
  'rait.forms.decisao-autoridade.signature.required',
  'rait.forms.decisao-autoridade.returnGuidance.limit',
  'rait.forms.parecer-voto.summary',
  'rait.forms.parecer-voto.analysis',
  'rait.forms.parecer-voto.vote',
  'rait.forms.parecer-voto.vote.impeded',
  'rait.forms.lote-sorteio.poolId',
  'rait.forms.lote-sorteio.kind',
  'rait.forms.lote-sorteio.weekStart',
  'rait.forms.lote-sorteio.manualExclusions',
  'rait.forms.lote-sorteio.manualExclusions.memberId',
  'rait.forms.lote-sorteio.manualExclusions.reason',
  'rait.forms.lote-sorteio.manualExclusions.duplicate',
  'rait.forms.pauta.sessionId',
  'rait.forms.pauta.items',
  'rait.forms.pauta.shortNoticeAck',
  'rait.forms.pauta.items.without_opinion',
  'rait.forms.pauta.items.critical_missing',
  'rait.forms.pauta.items.duplicate',
  'rait.forms.pauta.shortNoticeAck.required',
  'rait.forms.sessao-ao-vivo.vote',
  'rait.forms.sessao-ao-vivo.castingVote',
  'rait.forms.sessao-ao-vivo.vote.impeded',
  'rait.forms.sessao-ao-vivo.vote.item_not_open',
  'rait.forms.sessao-ao-vivo.vote.duplicate',
  'rait.forms.sessao-ao-vivo.castingVote.not_tied',
  'rait.forms.sessao-ao-vivo.castingVote.not_chair',
  'rait.forms.sessao-ao-vivo.abertura.quorum',
  'rait.forms.sessao-ao-vivo.abertura.chair',
  'rait.forms.sessao-ao-vivo.abertura.parity',
  'rait.forms.desistencia.protocolNumber',
  'rait.forms.desistencia.caseId',
  'rait.forms.desistencia.termDocumentId',
  'rait.forms.desistencia.signerPartyId',
  'rait.forms.desistencia.legitimacyConfirmed',
  'rait.forms.desistencia.caseId.after_decision',
  'rait.forms.desistencia.signerPartyId.illegitimate',
  'rait.forms.escala.poolId',
  'rait.forms.escala.kind',
  'rait.forms.escala.periodStart',
  'rait.forms.escala.periodEnd',
  'rait.forms.escala.entries',
  'rait.forms.escala.entries.memberId',
  'rait.forms.escala.entries.wipLimit',
  'rait.forms.escala.slots.slotOn',
  'rait.forms.escala.slots.availability',
  'rait.forms.escala.slots.absenceReason',
  'rait.forms.escala.entries.duty_missing',
  'rait.forms.escala.entries.duplicate',
  'rait.forms.escala.periodStart.locked',
  'rait.forms.escala.slots.absenceReason.required',
  'rait.forms.escala.slots.slotOn.outside_period',
  'rait.forms.mandato.poolId',
  'rait.forms.mandato.personId',
  'rait.forms.mandato.memberRole',
  'rait.forms.mandato.appointmentActRef',
  'rait.forms.mandato.representationBlock',
  'rait.forms.mandato.isSubstitute',
  'rait.forms.mandato.mandateStartsOn',
  'rait.forms.mandato.mandateEndsOn',
  'rait.forms.mandato.personId.dual_body',
  'rait.forms.mandato.mandateStartsOn.overlap',
  'rait.forms.mandato.representationBlock.required',
  'rait.forms.reatribuicao.memberId',
  'rait.forms.reatribuicao.releaseReason',
  'rait.forms.reatribuicao.memberId.same',
  'rait.forms.reatribuicao.memberId.impeded',
  'rait.forms.reatribuicao.memberId.unavailable',
  'rait.forms.ato-suspensao.caseIds',
  'rait.forms.ato-suspensao.startsOn',
  'rait.forms.ato-suspensao.endsOn',
  'rait.forms.ato-suspensao.reason',
  'rait.forms.ato-suspensao.legalBasis',
  'rait.forms.ato-suspensao.timerCodes',
  'rait.forms.ato-suspensao.evidenceDocumentId',
  'rait.forms.ato-suspensao.timerCodes.legal',
  'rait.forms.parametro.key',
  'rait.forms.parametro.value',
  'rait.forms.parametro.reason',
  'rait.forms.parametro.effectiveFrom',
  'rait.forms.parametro.key.legal_readonly',
  'rait.forms.parametro.value.required',
  'rait.forms.parametro.value.type_invalid',
  'rait.forms.parametro.value.json_invalid',
  'rait.forms.exportacao.purpose',
  'rait.forms.exportacao.scope.periodStart',
  'rait.forms.exportacao.scope.periodEnd',
  'rait.forms.exportacao.scope.nominal',
  'rait.forms.exportacao.dpoApprovalRequested',
  'rait.forms.exportacao.dpoApprovalRequested.required',
];

describe('forms/ — inventário de arquivos (C-2C-76)', () => {
  it('dado readdirSync(forms/) filtrando *.ts não-spec então exatamente 17 arquivos = form-gate.ts + os 16 nomes do M11 com sufixo .schema.ts', () => {
    // C-2C-76
    const files = readdirSync(formsDir)
      .filter((name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'))
      .sort();
    const expected = [
      'form-gate.ts',
      ...SCHEMA_NAMES.map((name) => `${name}.schema.ts`),
    ].sort();
    expect(files).toEqual(expected);
    expect(files).toHaveLength(17);
  });
});

describe('forms/ — exports de cada schema (C-2C-77)', () => {
  it.each(SCHEMA_NAMES)(
    'dado o módulo %s então exporta <Nome>Schema com safeParse e <NOME>_GATE com as 6 chaves do FormGate',
    (name) => {
      // C-2C-77
      const module = MODULES[name];
      expect(typeof module.schema.safeParse).toBe('function');
      const gateNames = Object.keys(module.gates);
      expect(gateNames.length).toBeGreaterThan(0);
      for (const gateName of gateNames) {
        expect(Object.keys(module.gates[gateName]).sort()).toEqual(
          [
            'command',
            'errorCodes',
            'postState',
            'preState',
            'preconditions',
            'roles',
          ].sort(),
        );
      }
    },
  );
});

describe('forms/ — fronteira de imports e cabeçalho do gate (C-2C-78, C-2C-79)', () => {
  it.each(['form-gate', ...SCHEMA_NAMES])(
    'dado o texto de %s então não importa facade, guarda, relógio, cliente HTTP nem usa Date [negativo]',
    (name) => {
      // C-2C-78
      const file = join(
        formsDir,
        name === 'form-gate' ? 'form-gate.ts' : `${name}.schema.ts`,
      );
      const text = readFileSync(file, 'utf8');
      expect(FORBIDDEN_IMPORTS.test(text)).toBe(false);
    },
  );

  it.each(SCHEMA_NAMES)(
    'dado o texto de %s.schema.ts então o cabeçalho-tabela do gate cita pré-estado, papéis, comando, pós-estado e errorCodes',
    (name) => {
      // C-2C-79
      const text = readFileSync(join(formsDir, `${name}.schema.ts`), 'utf8');
      const header = text
        .split('\n')
        .filter((line) => line.trimStart().startsWith('//'))
        .join('\n');
      for (const word of [
        'pré-estado',
        'papéis',
        'comando',
        'pós-estado',
        'errorCodes',
      ]) {
        expect(header).toContain(word);
      }
    },
  );
});

describe('forms/ — os 25 gates contra os catálogos (C-2C-80)', () => {
  const gates = Object.values(MODULES).flatMap((module) =>
    Object.entries(module.gates),
  );

  it('dado os 25 gates exportados então a lista tem exatamente 25 entradas', () => {
    // C-2C-80 (parte 1)
    expect(gates).toHaveLength(25);
  });

  it.each(gates.map(([name]) => name))(
    'dado o gate %s então command ∈ RAIT_COMMANDS, errorCodes ⊆ RAIT_ERROR_CODES, roles ⊆ RAIT_ALL_ROLES e sem repetição',
    (gateName) => {
      // C-2C-80 (parte 2)
      const gate = gates.find(([name]) => name === gateName)?.[1] as GateLike;
      expect((RAIT_COMMANDS as readonly string[]).includes(gate.command)).toBe(
        true,
      );
      for (const code of gate.errorCodes) {
        expect((RAIT_ERROR_CODES as readonly string[]).includes(code)).toBe(
          true,
        );
      }
      for (const role of gate.roles) {
        expect((RAIT_ALL_ROLES as readonly string[]).includes(role)).toBe(true);
      }
      expect(new Set(gate.errorCodes).size).toBe(gate.errorCodes.length);
      expect(new Set(gate.roles).size).toBe(gate.roles.length);
      if (gate.preState !== null) {
        expect(new Set(gate.preState).size).toBe(gate.preState.length);
      }
    },
  );
});

describe('forms/ — guardas e facades não importam forms/ (C-2C-81)', () => {
  it('dado core/guards/*.guard.ts e data/facades/*.facade.ts então nenhum importa de /forms/ (gates nunca decidem permissão) [negativo]', () => {
    // C-2C-81
    const files = [
      ...readdirSync(guardsDir)
        .filter((name) => name.endsWith('.guard.ts'))
        .map((name) => join(guardsDir, name)),
      ...readdirSync(facadesDir)
        .filter((name) => name.endsWith('.facade.ts'))
        .map((name) => join(facadesDir, name)),
    ];
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.filter((file) =>
      /from ['"][^'"]*\/forms\//.test(readFileSync(file, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});

describe('i18n — as 152 chaves rait.forms.* (C-2C-100)', () => {
  it('dado o catálogo do app então contém exatamente as 152 chaves rait.forms.* do §7 e nenhuma fora dela', () => {
    // C-2C-100 (parte do catálogo; os comandos `pnpm check`/`format:check` ficam no relatório)
    expect(FORMS_I18N_KEYS).toHaveLength(152);
    expect(new Set(FORMS_I18N_KEYS).size).toBe(152);

    const catalog = readAppCatalog();
    const present = Object.keys(catalog)
      .filter((key) => key.startsWith('rait.forms.'))
      .sort();
    expect(present).toEqual([...FORMS_I18N_KEYS].sort());
    for (const key of FORMS_I18N_KEYS) {
      expect(catalog[key]?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
