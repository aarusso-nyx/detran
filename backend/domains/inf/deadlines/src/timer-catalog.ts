// Espelho tipado de `inf.infraction_timer_ref` — os 18 timers do bloco INSERT de
// backend/database/ddl/14-inf-lifecycle-vocabulary.sql, na mesma ordem e com os
// mesmos valores (CTG-0001 §5 nota 2). Nenhum prazo é definido aqui: este
// arquivo só transcreve o vocabulário canônico.
import { DeadlineError } from './errors.js';
import type { TimerCatalog, TimerCode, TimerDefinition } from './types.js';

export const INFRACTION_TIMER_DEFINITIONS: readonly TimerDefinition[] = [
  {
    code: 'T-NA',
    owner: 'infracao',
    durationValue: 30,
    durationUnit: 'dias_corridos',
    startMark:
      'cometimento (não flagrante: conhecimento pelo órgão — contagem pendente)',
    armedIn: 'AIT_LAVRADO',
    expiryKind: 'transicao',
    expiryTarget: 'ARQUIVADO',
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'Res. 918/2022 art. 4º §1º; CTB art. 281 §1º II',
  },
  {
    code: 'T-SNE-CIENCIA',
    owner: 'infracao',
    durationValue: 30,
    durationUnit: 'dias_corridos',
    startMark: 'disponibilização no SNE + envio da mensagem',
    armedIn: 'qualquer notificação por SNE',
    expiryKind: 'marco',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'CTB art. 282-A §2º; Res. 931/2022 art. 4º §6º',
  },
  {
    code: 'T-DEF',
    owner: 'infracao',
    durationValue: null,
    durationUnit: 'data_impressa',
    startMark: 'expedição da NA / ciência conforme canal (piso 30 dias)',
    armedIn: 'NOTIFICADO_AUTUACAO',
    expiryKind: 'transicao',
    expiryTarget: 'PENALIDADE_A_APLICAR',
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'Res. 918/2022 art. 4º §2º; CTB art. 281-A; RN-RAIT-101',
  },
  {
    code: 'T-IND',
    owner: 'infracao',
    durationValue: 30,
    durationUnit: 'dias_corridos',
    startMark: 'notificação da autuação',
    armedIn: 'NOTIFICADO_AUTUACAO',
    expiryKind: 'regra',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'CTB art. 257 §§7º-8º',
  },
  {
    code: 'T-NA-IND',
    owner: 'infracao',
    durationValue: 30,
    durationUnit: 'dias_corridos',
    startMark: 'protocolo da indicação de condutor',
    armedIn: 'INDICACAO_EM_PROCESSAMENTO',
    expiryKind: 'transicao',
    expiryTarget: 'ARQUIVADO',
    alertLadder: null,
    status: 'a_confirmar',
    legalBasis: 'Res. 918/2022 art. 5º §3º',
  },
  {
    code: 'T-DEC',
    owner: 'infracao',
    durationValue: 180,
    durationUnit: 'dias_corridos',
    startMark: 'cometimento; 360 dias se defesa tempestiva',
    armedIn: 'AIT_LAVRADO … PENALIDADE_A_APLICAR',
    expiryKind: 'transicao',
    expiryTarget: 'EXTINTO_DECADENCIA',
    alertLadder: null,
    status: 'vigente',
    legalBasis:
      'CTB art. 282 §§6º-7º; Res. 918/2022 art. 9º §§2º-3º; RN-RAIT-114',
  },
  {
    code: 'T-NP-VENC',
    owner: 'infracao',
    durationValue: null,
    durationUnit: 'data_impressa',
    startMark:
      'notificação da penalidade (ciência conforme canal; piso 30 dias)',
    armedIn: 'NOTIFICADO_PENALIDADE',
    expiryKind: 'transicao',
    expiryTarget: 'INSTANCIA_ENCERRADA',
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'CTB art. 282 §§4º-5º e 290 II; Res. 918/2022 art. 12 IV',
  },
  {
    code: 'T-REM10',
    owner: 'infracao',
    durationValue: 10,
    durationUnit: 'dias_corridos',
    startMark: 'interposição do recurso à JARI',
    armedIn: 'EM_REMESSA_JARI',
    expiryKind: 'alerta',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'CTB art. 285 §2º; RN-RAIT-107',
  },
  {
    code: 'T-JUL-24M',
    owner: 'infracao',
    durationValue: 24,
    durationUnit: 'meses',
    startMark:
      'recebimento do recurso pelo órgão julgador (um relógio por instância)',
    armedIn: 'EM_JULGAMENTO_JARI; EM_JULGAMENTO_CETRAN',
    expiryKind: 'transicao',
    expiryTarget: 'EXTINTO_PRESCRICAO',
    alertLadder: '12/18/21/23 meses (WF-RAIT-002 §4.1)',
    status: 'vigente',
    legalBasis: 'CTB arts. 285 §6º, 289, 289-A; RN-RAIT-110…112',
  },
  {
    code: 'T-DIL',
    owner: 'caso',
    durationValue: 15,
    durationUnit: 'dias_uteis',
    startMark: 'abertura da diligência (prorrogável uma vez)',
    armedIn: 'caso RAIT em DILIGENCIA',
    expiryKind: 'transicao',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'Res. 900/2022 art. 9º p.ú.; RN-RAIT-004',
  },
  {
    code: 'T-R2',
    owner: 'infracao',
    durationValue: 30,
    durationUnit: 'dias_corridos',
    startMark: 'publicação da decisão da JARI (Owner C.24)',
    armedIn: 'AGUARDANDO_RECURSO_2A',
    expiryKind: 'transicao',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'CTB art. 288; RN-RAIT-103, RN-RAIT-130',
  },
  {
    code: 'T-PAR-3A',
    owner: 'infracao',
    durationValue: 3,
    durationUnit: 'anos',
    startMark: 'último ato registrado (reinicia a cada movimentação)',
    armedIn: 'qualquer estado pendente de julgamento',
    expiryKind: 'transicao',
    expiryTarget: 'EXTINTO_PRESCRICAO',
    alertLadder: null,
    status: 'a_confirmar',
    legalBasis: 'Lei 9.873/1999 art. 1º §1º; RN-RAIT-113',
  },
  {
    code: 'T-PRESC-5A',
    owner: 'infracao',
    durationValue: 5,
    durationUnit: 'anos',
    startMark:
      'prática do ato; interrompido só pelas hipóteses do art. 2º da Lei 9.873 (sem auto-reset na NP)',
    armedIn: 'todo o ciclo até o encerramento',
    expiryKind: 'transicao',
    expiryTarget: 'EXTINTO_PRESCRICAO',
    alertLadder: '30/45/54/60 meses',
    status: 'a_confirmar',
    legalBasis:
      'Lei 9.873/1999 arts. 1º-2º; Res. 918/2022 art. 36; RN-RAIT-113',
  },
  {
    code: 'T-VOTO',
    owner: 'caso',
    durationValue: 20,
    durationUnit: 'dias_corridos',
    startMark: 'distribuição ao relator (aceite do lote)',
    armedIn: 'caso RAIT em EM_INSTRUCAO (2º circuito)',
    expiryKind: 'alerta',
    expiryTarget: null,
    alertLadder: null,
    status: 'proposta',
    legalBasis: 'WF-RAIT-003 (pendente regimento)',
  },
  {
    code: 'T-CONV',
    owner: 'sessao',
    durationValue: 5,
    durationUnit: 'dias_uteis',
    startMark: 'fechamento da pauta',
    armedIn: 'sessão em PAUTA_FECHADA',
    expiryKind: 'guarda',
    expiryTarget: null,
    alertLadder: null,
    status: 'proposta',
    legalBasis: 'WF-RAIT-003 (pendente regimento)',
  },
  {
    code: 'T-ASS',
    owner: 'caso',
    durationValue: 5,
    durationUnit: 'dias_uteis',
    startMark: 'minuta enviada para assinatura',
    armedIn: 'caso RAIT em PRONTO_P_DECISAO (1º circuito)',
    expiryKind: 'alerta',
    expiryTarget: null,
    alertLadder: null,
    status: 'proposta',
    legalBasis: 'WF-RAIT-004 §2 (meta operacional)',
  },
  {
    code: 'T-CLAIM',
    owner: 'caso',
    durationValue: 2,
    durationUnit: 'dias_uteis',
    startMark: 'homologação do lote de sorteio',
    armedIn: 'lote LOTE_SORTEADO',
    expiryKind: 'regra',
    expiryTarget: null,
    alertLadder: null,
    status: 'proposta',
    legalBasis: 'WF-RAIT-004 §5',
  },
  {
    code: 'SLA-30',
    owner: 'indicador',
    durationValue: 30,
    durationUnit: 'meta',
    startMark: 'protocolo (defesa) / entrada na JARI (dias úteis)',
    armedIn: '1º e 2º circuitos',
    expiryKind: 'indicador',
    expiryTarget: null,
    alertLadder: null,
    status: 'vigente',
    legalBasis: 'REF-DETRANAM-SERVICOS; WF-RAIT-002 §4.4',
  },
];

/**
 * Catálogo estático: sem argumento é o espelho do DDL 14; com `definitions` as
 * entradas informadas sobrescrevem o espelho por `code` — é o gancho de
 * `deadline.<codigo>.expiry_kind_override` e dos testes (CTG-0001 §5 nota 2).
 */
export class StaticTimerCatalog implements TimerCatalog {
  private readonly byCode: Map<TimerCode, TimerDefinition>;

  constructor(definitions?: readonly TimerDefinition[]) {
    this.byCode = new Map(
      INFRACTION_TIMER_DEFINITIONS.map((definition) => [
        definition.code,
        definition,
      ]),
    );
    for (const definition of definitions ?? []) {
      this.byCode.set(definition.code, definition);
    }
  }

  get(code: TimerCode): TimerDefinition {
    const definition = this.byCode.get(code);
    if (!definition) {
      throw new DeadlineError('RAIT.INTERNAL', {
        status: 500,
        context: { timerCode: code },
        message: 'Timer fora de inf.infraction_timer_ref.',
      });
    }
    return definition;
  }
}
