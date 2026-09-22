// R-0012 TASK-0005 (Inspector). Critérios C-2A-51…55 do contrato `CTG-0002a.md` §11/§9 sobre
// `src/app/i18n/rait.pt-BR.json` (catálogo do app, produção — TASK-0006) e `core/i18n-token-key.ts`.
// Falha esperada nesta entrega: o catálogo do app e `core/i18n-token-key.ts` ainda não existem.
import { readFileSync } from 'node:fs';
import type {
  BpInfRaitCase001,
  BpInfRaitSession001,
  BpInfRaitWorklist001,
} from '@detran/api-clients';
import { describe, expect, it } from 'vitest';
import {
  readSeedCatalog,
  readAppCatalog,
  listAppSourceFiles,
  listSheetFiles,
  readSheet,
} from '../../testing/kb';
import { RAIT_ALL_ROLES } from '../../testing/route-manifest.fixture';
// Produção (TASK-0006): ainda não existe.
import { RAIT_ERROR_CODES } from '../core/error-codes';
import {
  RAIT_TOKEN_NAMESPACES,
  tokenKey,
  type RaitTokenNamespace,
} from '../core/i18n-token-key';

describe('C-2A-51 — catálogo semente ⊆ catálogo do app', () => {
  it('dado readSeedCatalog() (349) quando comparado a readAppCatalog() então toda chave existe com valor idêntico', () => {
    const seed = readSeedCatalog();
    const app = readAppCatalog();
    expect(Object.keys(seed)).toHaveLength(349);
    for (const [key, value] of Object.entries(seed)) {
      expect(app[key], `chave ausente ou divergente: ${key}`).toBe(value);
    }
  });
});

const CORE_KEYS = [
  'rait.errors.forbidden',
  'rait.errors.unknown',
  'rait.states.loading',
  'rait.states.empty',
  'rait.states.error',
  'rait.states.unavailable_in_version',
  'rait.states.stream_unavailable',
  'rait.states.offline',
  'rait.states.forbidden',
  'rait.states.not_found',
  'rait.shell.app_name',
  'rait.shell.title_suffix',
  'rait.shell.search',
  'rait.shell.search_placeholder',
  'rait.shell.theme_toggle',
  'rait.shell.shortcuts_title',
  'rait.shell.shortcut_claim_next',
  'rait.shell.shortcut_go_queue',
  'rait.shell.shortcut_go_dashboard',
  'rait.shell.shortcut_help',
  'rait.shell.shortcut_list_next',
  'rait.shell.shortcut_list_prev',
  'rait.shell.shortcut_open',
  'rait.shell.shortcut_triage',
  'rait.shell.shortcut_inquiry',
  'rait.shell.shortcut_vote',
  'rait.a11y.skip_to_content',
  'rait.a11y.main_navigation',
  'rait.a11y.close',
  'rait.a11y.loading',
] as const;

describe('C-2A-52 — as 30 chaves novas do §9', () => {
  it('dado a lista de 30 chaves quando lida então 30 (2 errors + 8 states + 16 shell + 4 a11y)', () => {
    expect(CORE_KEYS).toHaveLength(30);
  });

  CORE_KEYS.forEach((key) => {
    it(`dado a chave ${key} quando lida então existe, sem "{{" e placeholders na sintaxe STYNX`, () => {
      const app = readAppCatalog();
      expect(Object.prototype.hasOwnProperty.call(app, key)).toBe(true);
      const value = app[key];
      expect(value).not.toContain('{{');
      const placeholders = value.match(/\{[^}]*\}/g) ?? [];
      for (const placeholder of placeholders) {
        expect(placeholder).toMatch(/^\{[a-z][a-zA-Z0-9_]*(,[^}]*)?\}$/);
      }
    });
  });
});

describe('C-2A-53 — rait.screens.<slug>.title', () => {
  const sheetIds = listSheetFiles().map((file) => file.replace(/\.md$/, ''));

  sheetIds.forEach((id) => {
    it(`dado a ficha ${id} quando lida então rait.screens.<slug>.title do catálogo tem o mesmo texto`, () => {
      const sheet = readSheet(id);
      const titleKey = sheet.i18nKeys.find((key) => key.endsWith('.title'));
      expect(titleKey, `ficha ${id} sem chave .title`).toBeDefined();
      const app = readAppCatalog();
      expect(app[titleKey as string]).toBe(sheet.title);
    });
  });
});

function exhaustive<T extends string>(record: Record<T, true>): readonly T[] {
  return Object.keys(record) as T[];
}

type CaseState = BpInfRaitCase001.components['schemas']['RaitCase']['state'];
const CASE_STATES = exhaustive<CaseState>({
  PROTOCOLADO: true,
  TRIAGEM_ADMISSIBILIDADE: true,
  NAO_CONHECIDO: true,
  ADMITIDO: true,
  AGUARDANDO_REMESSA_JARI: true,
  DISTRIBUIDO: true,
  EM_INSTRUCAO: true,
  DILIGENCIA: true,
  PRONTO_P_DECISAO: true,
  DECIDIDO_AUTORIDADE: true,
  PAUTADO: true,
  JULGADO_SESSAO: true,
  COMUNICADO: true,
  TRANSITADO: true,
  REMETIDO_2A_INSTANCIA: true,
  ENCERRADO_DESISTENCIA: true,
});

type SessionState =
  BpInfRaitSession001.components['schemas']['RaitSession']['state'];
const SESSION_STATES = exhaustive<SessionState>({
  FORMANDO_PAUTA: true,
  PAUTA_FECHADA: true,
  CONVOCACAO_ENVIADA: true,
  SESSAO_ABERTA: true,
  SESSAO_ADIADA: true,
  RELATORIA_LIDA: true,
  SUSTENTACAO_ORAL: true,
  VOTACAO: true,
  DESEMPATE_PRESIDENTE: true,
  DECISAO_PROCLAMADA: true,
  ATA_LAVRADA: true,
  ATA_ASSINADA: true,
});

type TimerCode =
  BpInfRaitCase001.components['schemas']['RaitDeadline']['timer_code'];
const TIMER_CODES = exhaustive<TimerCode>({
  'T-REM10': true,
  'T-DIL': true,
  'T-R2': true,
  'T-JUL-24M': true,
  'T-PAR-3A': true,
  'T-DEC': true,
  'T-VOTO': true,
  'T-CONV': true,
});

type ClockFlag =
  BpInfRaitWorklist001.components['schemas']['RaitClock']['flag'];
const CLOCK_FLAGS = exhaustive<ClockFlag>({
  SEM_RISCO: true,
  ALERTA_N1: true,
  ALERTA_N2: true,
  ALERTA_N3: true,
  CRITICO: true,
  PRESCRITO_OPERACIONAL: true,
});

type CaseInstance =
  BpInfRaitCase001.components['schemas']['RaitCase']['instance'];
const CASE_INSTANCES = exhaustive<CaseInstance>({
  defesa_previa: true,
  jari: true,
  cetran: true,
});

type DecisionKind =
  BpInfRaitCase001.components['schemas']['RaitDecision']['decision_kind'];
const DECISION_KINDS = exhaustive<DecisionKind>({
  acolhida: true,
  indeferida: true,
  provido: true,
  negado: true,
  nao_conhecido: true,
});

type AgendaOutcome = NonNullable<
  BpInfRaitSession001.components['schemas']['RaitAgendaItem']['outcome']
>;
const AGENDA_OUTCOMES = exhaustive<AgendaOutcome>({
  provido: true,
  negado: true,
  nao_conhecido: true,
});

type OpinionVote = NonNullable<
  BpInfRaitSession001.components['schemas']['RaitAgendaItem']['opinion_vote']
>;
const OPINION_VOTES = exhaustive<OpinionVote>({
  provimento: true,
  nao_provimento: true,
  nao_conhecimento: true,
});

type Vote = BpInfRaitSession001.components['schemas']['RaitVote']['vote'];
const VOTES = exhaustive<Vote>({
  provimento: true,
  nao_provimento: true,
  nao_conhecimento: true,
  abstencao: true,
});

type Channel =
  BpInfRaitCase001.components['schemas']['RaitCommunication']['channel'];
const CHANNELS = exhaustive<Channel>({
  sne: true,
  postal: true,
  pessoal: true,
  edital: true,
  portal: true,
  balcao: true,
});

describe('C-2A-54 — tokens dos enums gerados compostos por tokenKey existem no catálogo', () => {
  it('dado RAIT_TOKEN_NAMESPACES quando lido então os 9 namespaces de token', () => {
    expect([...RAIT_TOKEN_NAMESPACES].sort()).toEqual(
      [
        'caseState',
        'sessionState',
        'infractionState',
        'infractionSubstate',
        'riskFlag',
        'memberStatus',
        'orgState',
        'closureMotive',
        'timer',
      ].sort(),
    );
  });

  const groups: readonly {
    readonly namespace: string;
    readonly tokens: readonly string[];
  }[] = [
    { namespace: 'caseState', tokens: CASE_STATES },
    { namespace: 'sessionState', tokens: SESSION_STATES },
    { namespace: 'timer', tokens: TIMER_CODES },
    { namespace: 'riskFlag', tokens: CLOCK_FLAGS },
  ];

  groups.forEach(({ namespace, tokens }) => {
    tokens.forEach((token) => {
      it(`dado tokenKey('${namespace}', '${token}') quando composta então existe no catálogo`, () => {
        const app = readAppCatalog();
        const key = tokenKey(namespace as RaitTokenNamespace, token);
        expect(key).toBe(`rait.${namespace}.${token}`);
        expect(Object.prototype.hasOwnProperty.call(app, key)).toBe(true);
      });
    });
  });

  CASE_INSTANCES.forEach((instance) => {
    it(`dado 'rait.instance.${instance}' quando lida então existe`, () => {
      const app = readAppCatalog();
      expect(
        Object.prototype.hasOwnProperty.call(app, `rait.instance.${instance}`),
      ).toBe(true);
    });
  });

  const decisionTokens = new Set<string>([
    ...DECISION_KINDS,
    ...AGENDA_OUTCOMES,
    ...OPINION_VOTES,
    ...VOTES,
  ]);
  decisionTokens.forEach((token) => {
    it(`dado 'rait.decision.${token}' quando lida então existe`, () => {
      const app = readAppCatalog();
      expect(
        Object.prototype.hasOwnProperty.call(app, `rait.decision.${token}`),
      ).toBe(true);
    });
  });

  CHANNELS.forEach((channel) => {
    it(`dado 'rait.channel.${channel}' quando lida então existe`, () => {
      const app = readAppCatalog();
      expect(
        Object.prototype.hasOwnProperty.call(app, `rait.channel.${channel}`),
      ).toBe(true);
    });
  });

  RAIT_ALL_ROLES.forEach((role) => {
    it(`dado 'rait.role.${role}' quando lida então existe`, () => {
      const app = readAppCatalog();
      expect(
        Object.prototype.hasOwnProperty.call(app, `rait.role.${role}`),
      ).toBe(true);
    });
  });

  it('dado os 15 módulos quando lido "rait.nav.<m>" então todos existem (chaves da semente)', () => {
    const seed = readSeedCatalog();
    const navKeys = Object.keys(seed).filter((key) =>
      key.startsWith('rait.nav.'),
    );
    expect(navKeys).toHaveLength(15);
  });

  it('dado RAIT_ERROR_CODES quando compostos "rait.errors.<code>" então todos existem', () => {
    const app = readAppCatalog();
    for (const code of RAIT_ERROR_CODES) {
      const key = `rait.errors.${code.replace(/^RAIT\./, '').toLowerCase()}`;
      expect(Object.prototype.hasOwnProperty.call(app, key), key).toBe(true);
    }
  });
});

// R-0012 TASK-0014 (Inspector). CTG-0002b.md §8 C-2B-82 / §9.2: as chaves (P) que o Engineer
// acrescenta ao catálogo do app para o CTG-0002b (namespaces já allowlistados `rait.common`,
// `rait.screens`; nenhum namespace novo) devem existir com texto não vazio; a semente continua
// intacta (glossário §2.2 — mesma verificação de C-2A-51, repetida aqui como C-2B-82 [negativo]).
const NEW_COMMON_KEYS = [
  'rait.common.clock',
  'rait.common.ceilingOn',
  'rait.common.clockAbsent',
  'rait.common.suspensiveEffect',
  'rait.common.originRequester',
  'rait.common.originOfficial',
  'rait.common.digitised',
  'rait.common.documentKind',
  'rait.common.file',
  'rait.common.attach',
  'rait.common.yes',
  'rait.common.no',
  'rait.common.addressee',
  'rait.common.addressee_requerente',
  'rait.common.addressee_orgao_autuador',
  'rait.common.subject',
  'rait.common.dueOn',
  'rait.common.extensions',
  'rait.common.inquiry_respondida',
  'rait.common.inquiry_expirada',
  'rait.common.facts',
  'rait.common.grounds',
  'rait.common.ruling',
  'rait.common.author',
  'rait.common.draft_rascunho',
  'rait.common.draft_submetida',
  'rait.common.draft_devolvida',
  'rait.common.draft_assinada',
  'rait.common.signatureUnavailable',
  'rait.common.registeredAt',
  'rait.common.quorum',
  'rait.common.chairPresent',
  'rait.common.chairAbsent',
  'rait.common.parity',
  'rait.common.priority',
  'rait.common.activeRow',
  'rait.common.seed',
  'rait.common.batch_semanal',
  'rait.common.batch_extraordinario',
  'rait.common.accepted',
  'rait.common.declined',
  'rait.common.decline_impedimento',
  'rait.common.decline_suspeicao',
  'rait.common.impediment_impedimento',
  'rait.common.impediment_suspeicao',
  'rait.common.basis',
  'rait.common.wipLimit',
  'rait.common.absence_ferias',
  'rait.common.absence_licenca',
  'rait.common.absence_curso',
  'rait.common.absence_sessao_externa',
  'rait.common.transition',
  'rait.common.actor',
  'rait.common.retry',
  'rait.common.list_capped',
  'rait.common.extraordinary',
  'rait.common.viewDueOn',
  'rait.common.party_requerente',
  'rait.common.party_procurador',
  'rait.common.party_autoridade',
  'rait.common.strategy_pull',
  'rait.common.strategy_round_robin',
  'rait.common.strategy_load_balanced',
  'rait.screens.gestao-producao.kpi.loaded',
  'rait.screens.gestao-capacidade.kpi.loaded',
] as const;

/** §9.2: 45 chaves `rait.screens.<slug>.confirm.<x>` (texto da coluna "Confirmação" da ficha
 * §6); acrescentadas ao catálogo por TASK-0016 em paralelo a esta tarefa. */
const CONFIRM_KEYS = [
  'rait.screens.fila-defesa.confirm.claim-next',
  'rait.screens.casos-id-triagem.confirm.admit',
  'rait.screens.casos-id-triagem.confirm.reject',
  'rait.screens.casos-id-diligencias.confirm.open',
  'rait.screens.casos-id-diligencias.confirm.extend',
  'rait.screens.casos-id-minuta.confirm.submit',
  'rait.screens.casos-id-decisao.confirm.accept',
  'rait.screens.casos-id-decisao.confirm.reject',
  'rait.screens.casos-id-decisao.confirm.return-draft',
  'rait.screens.casos-id-decisao.confirm.declare-impediment',
  'rait.screens.casos-id-impedimentos.confirm.declare',
  'rait.screens.protocolo-novo.confirm.protocol',
  'rait.screens.protocolo-pendencias.confirm.resolve',
  'rait.screens.protocolo-remessas.confirm.remit',
  'rait.screens.protocolo-remessas.confirm.receive',
  'rait.screens.protocolo-redirecionamentos.confirm.redirect',
  'rait.screens.protocolo-desistencias.confirm.withdraw',
  'rait.screens.assinatura-caseId.confirm.sign',
  'rait.screens.assinatura-caseId.confirm.return_draft',
  'rait.screens.assinatura-caseId.confirm.declare_impediment',
  'rait.screens.autoridade-provimentos.confirm.appeal',
  'rait.screens.autoridade-provimentos.confirm.waive',
  'rait.screens.colegiado-orgao-distribuicao.confirm.open',
  'rait.screens.colegiado-orgao-distribuicao.confirm.draw',
  'rait.screens.colegiado-orgao-distribuicao.confirm.approve',
  'rait.screens.colegiado-orgao-distribuicao-loteId.confirm.approve',
  'rait.screens.colegiado-orgao-relatoria.confirm.accept',
  'rait.screens.colegiado-orgao-relatoria.confirm.impede',
  'rait.screens.colegiado-orgao-relatoria-caseId-voto.confirm.register',
  'rait.screens.colegiado-orgao-pauta.confirm.close',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.open',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.adjourn',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.vote',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.casting_vote',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.view_request',
  'rait.screens.colegiado-orgao-sessoes-id.confirm.proclaim',
  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.confirm',
  'rait.screens.colegiado-orgao-sessoes-id-banca.confirm.summon_substitute',
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.generate',
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.sign',
  'rait.screens.colegiado-orgao-sessoes-id-ata.confirm.publish',
  'rait.screens.colegiado-orgao-vistas.confirm.register_view_vote',
  'rait.screens.colegiado-orgao-extraordinaria.confirm.convene',
  'rait.screens.gestao-radar-caseId.confirm.reassign',
  'rait.screens.gestao-incidentes.confirm.declare-extinction',
] as const;

describe('C-2B-82 — chaves (P) do §9.2 existem com texto não vazio', () => {
  it('dado a lista de chaves (P) quando lida então nenhum namespace novo (só rait.common/rait.screens)', () => {
    for (const key of [...NEW_COMMON_KEYS, ...CONFIRM_KEYS]) {
      expect(
        key.startsWith('rait.common.') || key.startsWith('rait.screens.'),
      ).toBe(true);
    }
  });

  [...NEW_COMMON_KEYS, ...CONFIRM_KEYS].forEach((key) => {
    it(`dado a chave ${key} quando lida em readAppCatalog() então existe com texto não vazio`, () => {
      const app = readAppCatalog();
      expect(Object.prototype.hasOwnProperty.call(app, key), key).toBe(true);
      expect((app[key] ?? '').length, key).toBeGreaterThan(0);
    });
  });
});

describe('C-2B-82 — semente intacta (glossário §2.2) [negativo]', () => {
  it('dado readSeedCatalog() quando comparado a readAppCatalog() então nenhuma chave da semente foi renomeada ou removida', () => {
    const seed = readSeedCatalog();
    const app = readAppCatalog();
    for (const [key, value] of Object.entries(seed)) {
      expect(app[key], `chave da semente ausente ou alterada: ${key}`).toBe(
        value,
      );
    }
  });
});

describe('C-2A-55 — nenhum literal estático dos 9 namespaces de token', () => {
  const forbidden =
    /['"`]rait\.(caseState|sessionState|infractionState|infractionSubstate|riskFlag|memberStatus|orgState|closureMotive|timer)\./;

  listAppSourceFiles().forEach((file) => {
    it(`dado ${file.split('/apps/rait/web/src/').pop()} quando lido então nenhum literal estático dos namespaces de token`, () => {
      const text = readFileSync(file, 'utf8');
      expect(forbidden.test(text)).toBe(false);
    });
  });
});
