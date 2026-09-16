// Generated from docs/framework/contracts/BP-INF-RAIT-ORG-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/holidays': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitHoliday (most recent first, capped at 500) */
    get: operations['listRaitHoliday'];
    put?: never;
    post: operations['createRaitHoliday'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/holidays/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitHoliday'];
    put?: never;
    post?: never;
    delete: operations['removeRaitHoliday'];
    options?: never;
    head?: never;
    patch: operations['updateRaitHoliday'];
    trace?: never;
  };
  '/v1/inf/rait/suspension-acts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitSuspensionAct (most recent first, capped at 500) */
    get: operations['listRaitSuspensionAct'];
    put?: never;
    post: operations['createRaitSuspensionAct'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/suspension-acts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitSuspensionAct'];
    put?: never;
    post?: never;
    delete: operations['removeRaitSuspensionAct'];
    options?: never;
    head?: never;
    patch: operations['updateRaitSuspensionAct'];
    trace?: never;
  };
  '/v1/inf/rait/jeton-sheets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitJetonSheet (most recent first, capped at 500) */
    get: operations['listRaitJetonSheet'];
    put?: never;
    post: operations['createRaitJetonSheet'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/jeton-sheets/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitJetonSheet'];
    put?: never;
    post?: never;
    delete: operations['removeRaitJetonSheet'];
    options?: never;
    head?: never;
    patch: operations['updateRaitJetonSheet'];
    trace?: never;
  };
  '/v1/inf/rait/jeton-lines': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitJetonLine (most recent first, capped at 500) */
    get: operations['listRaitJetonLine'];
    put?: never;
    post: operations['createRaitJetonLine'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/jeton-lines/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitJetonLine'];
    put?: never;
    post?: never;
    delete: operations['removeRaitJetonLine'];
    options?: never;
    head?: never;
    patch: operations['updateRaitJetonLine'];
    trace?: never;
  };
  '/v1/inf/rait/incidents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitIncident (most recent first, capped at 500) */
    get: operations['listRaitIncident'];
    put?: never;
    post: operations['createRaitIncident'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/incidents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitIncident'];
    put?: never;
    post?: never;
    delete: operations['removeRaitIncident'];
    options?: never;
    head?: never;
    patch: operations['updateRaitIncident'];
    trace?: never;
  };
  '/v1/inf/rait/quality-samples': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitQualitySample (most recent first, capped at 500) */
    get: operations['listRaitQualitySample'];
    put?: never;
    post: operations['createRaitQualitySample'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/quality-samples/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitQualitySample'];
    put?: never;
    post?: never;
    delete: operations['removeRaitQualitySample'];
    options?: never;
    head?: never;
    patch: operations['updateRaitQualitySample'];
    trace?: never;
  };
  '/v1/inf/rait/capacity-plans': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitCapacityPlan (most recent first, capped at 500) */
    get: operations['listRaitCapacityPlan'];
    put?: never;
    post: operations['createRaitCapacityPlan'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/capacity-plans/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitCapacityPlan'];
    put?: never;
    post?: never;
    delete: operations['removeRaitCapacityPlan'];
    options?: never;
    head?: never;
    patch: operations['updateRaitCapacityPlan'];
    trace?: never;
  };
  '/v1/inf/rait/exports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitExport (most recent first, capped at 500) */
    get: operations['listRaitExport'];
    put?: never;
    post: operations['createRaitExport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/exports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitExport'];
    put?: never;
    post?: never;
    delete: operations['removeRaitExport'];
    options?: never;
    head?: never;
    patch: operations['updateRaitExport'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Feriado ou ponto facultativo do calendario do orgao — [WF-RAIT-002] secao 7 (calendario nacional + estadual do AM, decisao do Owner A.6) e UC-RAIT-043 fluxo 1 e AC-RAIT-043-3. Porta de calendario do motor de prazos; unicidade por data e escopo levanta RAIT.CALENDAR_OVERLAP (catalogo de erros secao 3.9). */
    RaitHoliday: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      /** Format: date */
      holiday_on: string;
      /** @enum {string} */
      scope: 'nacional' | 'estadual' | 'municipal';
      /** @default false */
      optional: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitHolidayDto: {
      name: string;
      /** Format: date */
      holiday_on: string;
      /** @enum {string} */
      scope: 'nacional' | 'estadual' | 'municipal';
      /** @default false */
      optional: boolean;
    };
    /** @description Ato motivado de suspensao de prazo por forca maior — UC-RAIT-022 (fluxo 1 a 4, fluxos 1a e 2a) e [WF-RAIT-002] secao 7. Prova obrigatoria (evidence_document_id; RAIT.SUSPENSION_EVIDENCE_REQUIRED) e ato assinado (signed_by); prazos de extincao nao podem ser suspensos (RAIT.SUSPENSION_LEGAL_TIMER, guarda de comando porque depende do codigo do timer). Os timers e casos alcancados apontam para o ato por inf.infraction_timer.suspended_by_act_id e inf.rait_deadline.suspended_by_act_id (decisao M5). */
    RaitSuspensionAct: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      reason: string;
      legal_basis?: string | null;
      /** Format: date */
      starts_on: string;
      /** Format: date */
      ends_on: string;
      /** @default '[]'::jsonb */
      timer_codes: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      evidence_document_id: string;
      /** Format: uuid */
      signed_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      signed_at: string;
      /**
       * @default 'vigente'
       * @enum {string}
       */
      state: 'vigente' | 'revogado' | 'encerrado';
      /** Format: date-time */
      reviewed_at?: string | null;
      /** Format: uuid */
      reviewed_by?: string | null;
      /** Format: date-time */
      revoked_at?: string | null;
      revoked_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitSuspensionActDto: {
      reason: string;
      legal_basis?: string | null;
      /** Format: date */
      starts_on: string;
      /** Format: date */
      ends_on: string;
      /** @default '[]'::jsonb */
      timer_codes: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      evidence_document_id: string;
      /** Format: uuid */
      signed_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      signed_at: string;
      /**
       * @default 'vigente'
       * @enum {string}
       */
      state: 'vigente' | 'revogado' | 'encerrado';
      /** Format: date-time */
      reviewed_at?: string | null;
      /** Format: uuid */
      reviewed_by?: string | null;
      /** Format: date-time */
      revoked_at?: string | null;
      revoked_reason?: string | null;
    };
    /** @description Folha de remuneracao por sessao (jeton) por periodo e orgao colegiado — UC-RAIT-036 fluxo 1 a 4 e fluxo 3a. Estados minusculos derivados do proprio UC (decisao M12): gerada, conferida pela secretaria, homologada pelo presidente, enviada ao RH/financeiro; RAIT.JETON_ALREADY_APPROVED barra a reaprovacao e RAIT.JETON_MINUTES_UNSIGNED a sessao sem ata assinada. source_pending marca que rait.jeton.value e rait.jeton.monthly_cap seguem pendentes de fonte (steering H.54 e H.57; ADR-0021 Decision 2, RAIT.PARAMETER_SOURCE_PENDING). */
    RaitJetonSheet: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'gerada'
       * @enum {string}
       */
      state: 'gerada' | 'conferida' | 'homologada' | 'enviada';
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      /** Format: uuid */
      generated_by?: string | null;
      /** Format: date-time */
      reviewed_at?: string | null;
      /** Format: uuid */
      reviewed_by?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** @default true */
      source_pending: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitJetonSheetDto: {
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'gerada'
       * @enum {string}
       */
      state: 'gerada' | 'conferida' | 'homologada' | 'enviada';
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      /** Format: uuid */
      generated_by?: string | null;
      /** Format: date-time */
      reviewed_at?: string | null;
      /** Format: uuid */
      reviewed_by?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** @default true */
      source_pending: boolean;
    };
    /** @description Linha da folha de jeton: um membro em uma sessao com ata assinada — UC-RAIT-036 fluxo 1 (presenca valida, itens relatados, votos, faltas justificadas e injustificadas), fluxo 2 e 2a (teto mensal, sessao excedente nao remunerada) e AC-RAIT-036-1 a AC-RAIT-036-3. unit_value e amount existem e ficam nulos enquanto source_pending for verdadeiro, porque rait.jeton.value nao tem fonte (steering H.54 e H.57). */
    RaitJetonLine: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      sheet_id: string;
      /** Format: uuid */
      member_id: string;
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      minutes_id?: string | null;
      /** @default false */
      attendance_valid: boolean;
      /** @default 0 */
      items_reported: number;
      /** @default 0 */
      votes_cast: number;
      /** @enum {string|null} */
      absence_kind?: 'justificada' | 'injustificada' | null;
      /** @default false */
      remunerated: boolean;
      /** @default false */
      over_cap: boolean;
      unit_value?: number | null;
      amount?: number | null;
      /** @default true */
      source_pending: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitJetonLineDto: {
      /** Format: uuid */
      sheet_id: string;
      /** Format: uuid */
      member_id: string;
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      minutes_id?: string | null;
      /** @default false */
      attendance_valid: boolean;
      /** @default 0 */
      items_reported: number;
      /** @default 0 */
      votes_cast: number;
      /** @enum {string|null} */
      absence_kind?: 'justificada' | 'injustificada' | null;
      /** @default false */
      remunerated: boolean;
      /** @default false */
      over_cap: boolean;
      unit_value?: number | null;
      amount?: number | null;
      /** @default true */
      source_pending: boolean;
    };
    /** @description Incidente de prescricao operacional — [WF-RAIT-002] secao 4.1 e 4.2 (nivel PRESCRITO_OPERACIONAL: registro de incidente, apuracao de causa, comunicacao ao LEGAL/auditoria) e AC-RAIT-010-4. incident_ref no formato INC-AAAA-NNNN, o mesmo de inf.rait_clock_alert.incident_ref (fixture INC-2026-0007, rait-fixtures.md secao 3). outcome e texto livre porque nenhuma fonte fixa vocabulario de desfecho (mesmo tratamento de rait_pool_member.jurisdiction). */
    RaitIncident: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      incident_ref: string;
      /** Format: uuid */
      clock_id?: string | null;
      /** Format: uuid */
      case_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: uuid */
      responsible_id?: string | null;
      cause_analysis?: string | null;
      outcome?: string | null;
      /** Format: date-time */
      legal_notified_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitIncidentDto: {
      incident_ref: string;
      /** Format: uuid */
      clock_id?: string | null;
      /** Format: uuid */
      case_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: uuid */
      responsible_id?: string | null;
      cause_analysis?: string | null;
      outcome?: string | null;
      /** Format: date-time */
      legal_notified_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
    };
    /** @description Item da amostra de qualidade das decisoes do periodo — UC-RAIT-025 (fluxo 1 sorteio estratificado, fluxo 2 checklist com achados tipados, fluxo 3 achados sistematicos ao TEAT e a JARI, fluxo 2a sem reabrir decisao) e [WF-RAIT-004] secao 2.1 fila F-DP-Q. O percentual da amostra e o parametro rait.quality.sample_pct (ops.parameter, ADR-0021): nenhuma coluna o guarda. Os tokens de finding_kind sao os quatro itens do checklist do fluxo 2 (decisao de modelagem M12). */
    RaitQualitySample: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** Format: uuid */
      reviewer_member_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      sampled_at: string;
      /** Format: date-time */
      reviewed_at?: string | null;
      /** @enum {string|null} */
      finding_kind?: 'fundamento' | 'prova' | 'coerencia' | 'linguagem' | null;
      finding_note?: string | null;
      /** @default false */
      systemic: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitQualitySampleDto: {
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** Format: uuid */
      reviewer_member_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      sampled_at: string;
      /** Format: date-time */
      reviewed_at?: string | null;
      /** @enum {string|null} */
      finding_kind?: 'fundamento' | 'prova' | 'coerencia' | 'linguagem' | null;
      finding_note?: string | null;
      /** @default false */
      systemic: boolean;
    };
    /** @description Plano de capacidade por pool e periodo — [WF-RAIT-004] secao 8 (chegada, capacidade escalada, fila e gatilho de nova turma) e UC-RAIT-038 (fluxo 1 a 4, AC-RAIT-038-1 e AC-RAIT-038-2). months_over_capacity registra os meses observados de fila acima da capacidade; o limiar e o parametro rait.unit.queue_over_capacity_months (ops.parameter) e a guarda de constituicao de turma e de comando (RAIT.UNIT_TRIGGER_NOT_MET, catalogo secao 3.10). */
    RaitCapacityPlan: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      arrival_estimate?: number | null;
      capacity_estimate?: number | null;
      queue_observed?: number | null;
      /** @default 0 */
      months_over_capacity: number;
      measures?: string | null;
      /** @default false */
      reinforcement_requested: boolean;
      /** @default false */
      unit_proposed: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      registered_at: string;
      /** Format: uuid */
      registered_by?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCapacityPlanDto: {
      /** Format: uuid */
      pool_id: string;
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      arrival_estimate?: number | null;
      capacity_estimate?: number | null;
      queue_observed?: number | null;
      /** @default 0 */
      months_over_capacity: number;
      measures?: string | null;
      /** @default false */
      reinforcement_requested: boolean;
      /** @default false */
      unit_proposed: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      registered_at: string;
      /** Format: uuid */
      registered_by?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
    };
    /** @description Exportacao de decisoes e estatisticas com controle LGPD — UC-RAIT-042 fluxo 3, fluxo 3a e AC-RAIT-042-2 (finalidade, escopo, solicitante e hash registrados; aprovacao do DPO na exportacao nominal em massa). purpose nao admite nulo (RAIT.EXPORT_PURPOSE_REQUIRED) e o limiar de linhas que exige o DPO e o parametro rait.export.dpo_threshold_rows (ops.parameter; RAIT.EXPORT_DPO_APPROVAL_REQUIRED, catalogo secao 3.11). Estados minusculos derivados do proprio UC (decisao M12). */
    RaitExport: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      purpose: string;
      /** @default '{}'::jsonb */
      scope: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      requested_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      row_count?: number | null;
      /**
       * @default 'solicitada'
       * @enum {string}
       */
      status: 'solicitada' | 'aguardando_dpo' | 'gerada';
      /** Format: uuid */
      dpo_approved_by?: string | null;
      /** Format: date-time */
      dpo_approved_at?: string | null;
      /** Format: date-time */
      generated_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      content_hash?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitExportDto: {
      purpose: string;
      /** @default '{}'::jsonb */
      scope: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      requested_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      row_count?: number | null;
      /**
       * @default 'solicitada'
       * @enum {string}
       */
      status: 'solicitada' | 'aguardando_dpo' | 'gerada';
      /** Format: uuid */
      dpo_approved_by?: string | null;
      /** Format: date-time */
      dpo_approved_at?: string | null;
      /** Format: date-time */
      generated_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      content_hash?: string | null;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  listRaitHoliday: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitHoliday'][];
        };
      };
    };
  };
  createRaitHoliday: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitHolidayDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitHoliday'];
        };
      };
    };
  };
  getRaitHoliday: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitHoliday'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitHoliday: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitHoliday: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitHolidayDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitHoliday'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitSuspensionAct: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSuspensionAct'][];
        };
      };
    };
  };
  createRaitSuspensionAct: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitSuspensionActDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSuspensionAct'];
        };
      };
    };
  };
  getRaitSuspensionAct: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSuspensionAct'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitSuspensionAct: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitSuspensionAct: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitSuspensionActDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSuspensionAct'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitJetonSheet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonSheet'][];
        };
      };
    };
  };
  createRaitJetonSheet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitJetonSheetDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonSheet'];
        };
      };
    };
  };
  getRaitJetonSheet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonSheet'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitJetonSheet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitJetonSheet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitJetonSheetDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonSheet'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitJetonLine: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonLine'][];
        };
      };
    };
  };
  createRaitJetonLine: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitJetonLineDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonLine'];
        };
      };
    };
  };
  getRaitJetonLine: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonLine'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitJetonLine: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitJetonLine: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitJetonLineDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitJetonLine'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitIncident: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitIncident'][];
        };
      };
    };
  };
  createRaitIncident: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitIncidentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitIncident'];
        };
      };
    };
  };
  getRaitIncident: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitIncident'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitIncident: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitIncident: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitIncidentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitIncident'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitQualitySample: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitQualitySample'][];
        };
      };
    };
  };
  createRaitQualitySample: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitQualitySampleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitQualitySample'];
        };
      };
    };
  };
  getRaitQualitySample: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitQualitySample'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitQualitySample: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitQualitySample: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitQualitySampleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitQualitySample'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitCapacityPlan: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitCapacityPlan'][];
        };
      };
    };
  };
  createRaitCapacityPlan: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitCapacityPlanDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitCapacityPlan'];
        };
      };
    };
  };
  getRaitCapacityPlan: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitCapacityPlan'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitCapacityPlan: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitCapacityPlan: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitCapacityPlanDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitCapacityPlan'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitExport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitExport'][];
        };
      };
    };
  };
  createRaitExport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitExportDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitExport'];
        };
      };
    };
  };
  getRaitExport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitExport'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitExport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitExport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitExportDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitExport'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
