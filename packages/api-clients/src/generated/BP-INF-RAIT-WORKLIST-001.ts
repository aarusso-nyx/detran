// Generated from docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/units': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitUnit (most recent first, capped at 500) */
    get: operations['listRaitUnit'];
    put?: never;
    post: operations['createRaitUnit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/units/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitUnit'];
    put?: never;
    post?: never;
    delete: operations['removeRaitUnit'];
    options?: never;
    head?: never;
    patch: operations['updateRaitUnit'];
    trace?: never;
  };
  '/v1/inf/rait/pools': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitPool (most recent first, capped at 500) */
    get: operations['listRaitPool'];
    put?: never;
    post: operations['createRaitPool'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pools/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitPool'];
    put?: never;
    post?: never;
    delete: operations['removeRaitPool'];
    options?: never;
    head?: never;
    patch: operations['updateRaitPool'];
    trace?: never;
  };
  '/v1/inf/rait/pool-members': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitPoolMember (most recent first, capped at 500) */
    get: operations['listRaitPoolMember'];
    put?: never;
    post: operations['createRaitPoolMember'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pool-members/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitPoolMember'];
    put?: never;
    post?: never;
    delete: operations['removeRaitPoolMember'];
    options?: never;
    head?: never;
    patch: operations['updateRaitPoolMember'];
    trace?: never;
  };
  '/v1/inf/rait/schedules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitSchedule (most recent first, capped at 500) */
    get: operations['listRaitSchedule'];
    put?: never;
    post: operations['createRaitSchedule'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/schedules/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitSchedule'];
    put?: never;
    post?: never;
    delete: operations['removeRaitSchedule'];
    options?: never;
    head?: never;
    patch: operations['updateRaitSchedule'];
    trace?: never;
  };
  '/v1/inf/rait/schedule-slots': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitScheduleSlot (most recent first, capped at 500) */
    get: operations['listRaitScheduleSlot'];
    put?: never;
    post: operations['createRaitScheduleSlot'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/schedule-slots/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitScheduleSlot'];
    put?: never;
    post?: never;
    delete: operations['removeRaitScheduleSlot'];
    options?: never;
    head?: never;
    patch: operations['updateRaitScheduleSlot'];
    trace?: never;
  };
  '/v1/inf/rait/batches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitBatch (most recent first, capped at 500) */
    get: operations['listRaitBatch'];
    put?: never;
    post: operations['createRaitBatch'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitBatch'];
    put?: never;
    post?: never;
    delete: operations['removeRaitBatch'];
    options?: never;
    head?: never;
    patch: operations['updateRaitBatch'];
    trace?: never;
  };
  '/v1/inf/rait/batch-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitBatchItem (most recent first, capped at 500) */
    get: operations['listRaitBatchItem'];
    put?: never;
    post: operations['createRaitBatchItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batch-items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitBatchItem'];
    put?: never;
    post?: never;
    delete: operations['removeRaitBatchItem'];
    options?: never;
    head?: never;
    patch: operations['updateRaitBatchItem'];
    trace?: never;
  };
  '/v1/inf/rait/assignments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitAssignment (most recent first, capped at 500) */
    get: operations['listRaitAssignment'];
    put?: never;
    post: operations['createRaitAssignment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/assignments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitAssignment'];
    put?: never;
    post?: never;
    delete: operations['removeRaitAssignment'];
    options?: never;
    head?: never;
    patch: operations['updateRaitAssignment'];
    trace?: never;
  };
  '/v1/inf/rait/impediments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitImpediment (most recent first, capped at 500) */
    get: operations['listRaitImpediment'];
    put?: never;
    post: operations['createRaitImpediment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/impediments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitImpediment'];
    put?: never;
    post?: never;
    delete: operations['removeRaitImpediment'];
    options?: never;
    head?: never;
    patch: operations['updateRaitImpediment'];
    trace?: never;
  };
  '/v1/inf/rait/substitute-duties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitSubstituteDuty (most recent first, capped at 500) */
    get: operations['listRaitSubstituteDuty'];
    put?: never;
    post: operations['createRaitSubstituteDuty'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/substitute-duties/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitSubstituteDuty'];
    put?: never;
    post?: never;
    delete: operations['removeRaitSubstituteDuty'];
    options?: never;
    head?: never;
    patch: operations['updateRaitSubstituteDuty'];
    trace?: never;
  };
  '/v1/inf/rait/benches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitBench (most recent first, capped at 500) */
    get: operations['listRaitBench'];
    put?: never;
    post: operations['createRaitBench'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/benches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitBench'];
    put?: never;
    post?: never;
    delete: operations['removeRaitBench'];
    options?: never;
    head?: never;
    patch: operations['updateRaitBench'];
    trace?: never;
  };
  '/v1/inf/rait/clocks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitClock (most recent first, capped at 500) */
    get: operations['listRaitClock'];
    put?: never;
    post: operations['createRaitClock'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/clocks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitClock'];
    put?: never;
    post?: never;
    delete: operations['removeRaitClock'];
    options?: never;
    head?: never;
    patch: operations['updateRaitClock'];
    trace?: never;
  };
  '/v1/inf/rait/clock-alerts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitClockAlert (most recent first, capped at 500) */
    get: operations['listRaitClockAlert'];
    put?: never;
    post: operations['createRaitClockAlert'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/clock-alerts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitClockAlert'];
    put?: never;
    post?: never;
    delete: operations['removeRaitClockAlert'];
    options?: never;
    head?: never;
    patch: operations['updateRaitClockAlert'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Unidade de julgamento (turma / JARI) — WF-RAIT-004 secao 7 e secao 10. Estados TURMA_* da secao 9; hoje uma unica JARI-AM (steering B.9) e coordenador exigido apenas quando houver mais de uma (Res. 357 itens 2.2-2.3). */
    RaitUnit: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'TURMA_ATIVA'
       * @enum {string}
       */
      state: 'TURMA_ATIVA' | 'TURMA_EM_CONSTITUICAO' | 'TURMA_SUSPENSA';
      /** Format: uuid */
      coordinator_member_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitUnitDto: {
      name: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'TURMA_ATIVA'
       * @enum {string}
       */
      state: 'TURMA_ATIVA' | 'TURMA_EM_CONSTITUICAO' | 'TURMA_SUSPENSA';
      /** Format: uuid */
      coordinator_member_id?: string | null;
    };
    /** @description Pool de trabalho por instancia. Owner fixou os 3 pools base, sem segmentacao adicional (steering A.2). v1.1.0: unit_id liga o pool a uma turma/JARI (WF-RAIT-004 secao 10) e priority_policy registra a ordem unica de consumo das filas (secao 2, RN-RAIT-141). */
    RaitPool: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /** @enum {string} */
      strategy: 'pull' | 'round_robin' | 'load_balanced';
      /** @default true */
      active: boolean;
      /** Format: uuid */
      unit_id?: string | null;
      /**
       * @default 'ordem_unica'
       * @enum {string}
       */
      priority_policy: 'ordem_unica';
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPoolDto: {
      name: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /** @enum {string} */
      strategy: 'pull' | 'round_robin' | 'load_balanced';
      /** @default true */
      active: boolean;
      /** Format: uuid */
      unit_id?: string | null;
      /**
       * @default 'ordem_unica'
       * @enum {string}
       */
      priority_policy: 'ordem_unica';
    };
    /** @description Membro do pool e sua situacao (WF-RAIT-002 secao 5). Mandato de 1-2 anos na JARI (RN-RAIT-116). v1.1.0: is_substitute marca o suplente (Res. 357 item 4.1.b.3, RN-RAIT-142) e jurisdiction a circunscricao da autoridade signataria (CTB art. 281; relacao das 55 autoridades pendente, steering H.48). */
    RaitPoolMember: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      person_id: string;
      /** @enum {string} */
      member_role:
        'analista' | 'relator' | 'presidente' | 'coordenador' | 'secretaria';
      /**
       * @default 'ATIVO'
       * @enum {string}
       */
      status:
        | 'ATIVO'
        | 'IMPEDIDO'
        | 'ADVERTIDO'
        | 'AFASTADO_TEMP'
        | 'MANDATO_ENCERRADO';
      /** Format: date */
      mandate_starts_on?: string | null;
      /** Format: date */
      mandate_ends_on?: string | null;
      /** @default 0 */
      late_opinion_count: number;
      /** @default 0 */
      unjustified_absence_count: number;
      /** @default false */
      is_substitute: boolean;
      jurisdiction?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPoolMemberDto: {
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      person_id: string;
      /** @enum {string} */
      member_role:
        'analista' | 'relator' | 'presidente' | 'coordenador' | 'secretaria';
      /**
       * @default 'ATIVO'
       * @enum {string}
       */
      status:
        | 'ATIVO'
        | 'IMPEDIDO'
        | 'ADVERTIDO'
        | 'AFASTADO_TEMP'
        | 'MANDATO_ENCERRADO';
      /** Format: date */
      mandate_starts_on?: string | null;
      /** Format: date */
      mandate_ends_on?: string | null;
      /** @default 0 */
      late_opinion_count: number;
      /** @default 0 */
      unjustified_absence_count: number;
      /** @default false */
      is_substitute: boolean;
      jurisdiction?: string | null;
    };
    /** @description Escala e plantao do membro — WF-RAIT-004 secao 3 e secao 10. Disponibilidade DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO (secao 9); wip_limit nulo usa o parametro rait.wip.limit (ops.parameter, ADR-0021) e ausencia programada rebaixa o limite a zero. */
    RaitSchedule: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      kind:
        | 'escala_semanal'
        | 'plantao_risco'
        | 'escala_assinatura'
        | 'escala_balcao';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      wip_limit?: number | null;
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitScheduleDto: {
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      kind:
        | 'escala_semanal'
        | 'plantao_risco'
        | 'escala_assinatura'
        | 'escala_balcao';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      wip_limit?: number | null;
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
    };
    /** @description Dia coberto pela escala — WF-RAIT-004 secao 3. Disponibilidade efetiva por dia (base de RAIT.SCHEDULE_NO_DUTY_MEMBER, que informa a data); o turno nao tem vocabulario fixado por fonte e fica como OD, por isso o grao e o dia. */
    RaitScheduleSlot: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      schedule_id: string;
      /** Format: date */
      slot_on: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitScheduleSlotDto: {
      /** Format: uuid */
      schedule_id: string;
      /** Format: date */
      slot_on: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
    };
    /** @description Lote de sorteio de relator — WF-RAIT-004 secao 5 e secao 10. Estados LOTE_* da secao 9; semente e ordem auditaveis, ata do sorteio assinada pelo presidente (PAdES+TSA, steering A.8); lote semanal ou extraordinario (passos 1 e 7). */
    RaitBatch: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /**
       * @default 'semanal'
       * @enum {string}
       */
      kind: 'semanal' | 'extraordinario';
      /** Format: date */
      week_start: string;
      /**
       * @default 'LOTE_ABERTO'
       * @enum {string}
       */
      state: 'LOTE_ABERTO' | 'LOTE_SORTEADO' | 'LOTE_ACEITO';
      seed?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: date-time */
      drawn_at?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: uuid */
      minutes_document_id?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchDto: {
      /** Format: uuid */
      pool_id: string;
      /**
       * @default 'semanal'
       * @enum {string}
       */
      kind: 'semanal' | 'extraordinario';
      /** Format: date */
      week_start: string;
      /**
       * @default 'LOTE_ABERTO'
       * @enum {string}
       */
      state: 'LOTE_ABERTO' | 'LOTE_SORTEADO' | 'LOTE_ACEITO';
      seed?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: date-time */
      drawn_at?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: uuid */
      minutes_document_id?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
    };
    /** @description Item do lote de sorteio — WF-RAIT-004 secao 5 passos 4-5. Posicao na ordem sorteada, relator designado, claim_due_on do T-CLAIM (rait.timer.T-CLAIM, 2 dias uteis) e recusa por impedimento ou suspeicao, que redistribui ao proximo da ordem no mesmo lote. */
    RaitBatchItem: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      case_id: string;
      position: number;
      /** Format: uuid */
      member_id?: string | null;
      /** Format: date */
      claim_due_on?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: date-time */
      declined_at?: string | null;
      /** @enum {string|null} */
      decline_kind?: 'impedimento' | 'suspeicao' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchItemDto: {
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      case_id: string;
      position: number;
      /** Format: uuid */
      member_id?: string | null;
      /** Format: date */
      claim_due_on?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: date-time */
      declined_at?: string | null;
      /** @enum {string|null} */
      decline_kind?: 'impedimento' | 'suspeicao' | null;
    };
    /** @description Atribuicao de caso a membro. Reatribuir preserva estado e dossie (AC-RAIT-011-1); motivo e obrigatorio e tipado (AC-RAIT-011-2). v1.1.0: claim_due_at e o vencimento do T-CLAIM e batch_id liga a atribuicao ao lote de sorteio (WF-RAIT-004 secao 5 e secao 10). */
    RaitAssignment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      assigned_at: string;
      /** Format: uuid */
      assigned_by?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitAssignmentDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      assigned_at: string;
      /** Format: uuid */
      assigned_by?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
    };
    /** @description Impedimento declarado por caso (RN-RAIT-116; CONTRAN-357 5.1.c). Impede redistribuicao ao mesmo membro (AC-RAIT-011-3). v1.1.0: kind distingue impedimento de suspeicao e legal_basis registra o artigo (Lei 9.784 arts. 18-20), com decided_by de quem decidiu a declaracao (WF-RAIT-004 secao 10). */
    RaitImpediment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      member_id: string;
      basis: string;
      /**
       * Format: date-time
       * @default now()
       */
      declared_at: string;
      /**
       * @default 'impedimento'
       * @enum {string}
       */
      kind: 'impedimento' | 'suspeicao';
      legal_basis?: string | null;
      /** Format: uuid */
      decided_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitImpedimentDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      member_id: string;
      basis: string;
      /**
       * Format: date-time
       * @default now()
       */
      declared_at: string;
      /**
       * @default 'impedimento'
       * @enum {string}
       */
      kind: 'impedimento' | 'suspeicao';
      legal_basis?: string | null;
      /** Format: uuid */
      decided_by?: string | null;
    };
    /** @description Plantao de suplencia por sessao — WF-RAIT-004 secao 3 (linha "Plantao de suplencia") e secao 6 regra (a): o suplente de plantao e convocado antes de qualquer outro quando a banca fica BANCA_INSUFICIENTE (RN-RAIT-142). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35. */
    RaitSubstituteDuty: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      designated_at: string;
      /** Format: uuid */
      designated_by?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitSubstituteDutyDto: {
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      designated_at: string;
      /** Format: uuid */
      designated_by?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
    };
    /** @description Banca da sessao — WF-RAIT-004 secao 6. Estados BANCA_* da secao 9, contagem de confirmacoes contra o quorum e paridade observada do CETRAN (parametro session.quorum.cetran_parity, ops.parameter). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35. */
    RaitBench: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      session_id: string;
      /**
       * @default 'BANCA_PREVISTA'
       * @enum {string}
       */
      state: 'BANCA_PREVISTA' | 'BANCA_CONFIRMADA' | 'BANCA_INSUFICIENTE';
      /** @default 0 */
      confirmed_count: number;
      parity_observed?: boolean | null;
      /** Format: date-time */
      confirmed_at?: string | null;
      /** Format: date-time */
      insufficient_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBenchDto: {
      /** Format: uuid */
      session_id: string;
      /**
       * @default 'BANCA_PREVISTA'
       * @enum {string}
       */
      state: 'BANCA_PREVISTA' | 'BANCA_CONFIRMADA' | 'BANCA_INSUFICIENTE';
      /** @default 0 */
      confirmed_count: number;
      parity_observed?: boolean | null;
      /** Format: date-time */
      confirmed_at?: string | null;
      /** Format: date-time */
      insufficient_at?: string | null;
    };
    /** @description Relogio de extincao de punibilidade. A=decadencia 180/360d (RN-RAIT-114); B=inercia 24 meses (RN-RAIT-110/111/112); C=paralisacao 3 anos (RN-RAIT-113); D=prescricao quinquenal 60 meses, nao reinicia por movimentacao — so pelas hipoteses do art.2 da Lei 9.873/1999 (RN-RAIT-113 caput, WF-RAIT-002 4.4, Decisao do Owner DT-030 2026-08-28). Uma bandeira POR RELOGIO — nunca agregada (AC-RAIT-010-3). */
    RaitClock: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      clock_code: 'A' | 'B' | 'C' | 'D';
      /** Format: date */
      started_on: string;
      /** Format: date */
      ceiling_on: string;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      flag_changed_at: string;
      /** Format: date-time */
      last_reset_at?: string | null;
      legal_basis: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitClockDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      clock_code: 'A' | 'B' | 'C' | 'D';
      /** Format: date */
      started_on: string;
      /** Format: date */
      ceiling_on: string;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      flag_changed_at: string;
      /** Format: date-time */
      last_reset_at?: string | null;
      legal_basis: string;
    };
    /** @description Degrau da escada de alertas (WF-RAIT-002 secao 4/6). PRESCRITO_OPERACIONAL exige incidente documentado (AC-RAIT-010-4). */
    RaitClockAlert: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clock_id: string;
      /** @enum {string} */
      level:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      raised_at: string;
      notified_role: string;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: uuid */
      acknowledged_by?: string | null;
      incident_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitClockAlertDto: {
      /** Format: uuid */
      clock_id: string;
      /** @enum {string} */
      level:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      raised_at: string;
      notified_role: string;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: uuid */
      acknowledged_by?: string | null;
      incident_ref?: string | null;
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
  listRaitUnit: {
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
          'application/json': components['schemas']['RaitUnit'][];
        };
      };
    };
  };
  createRaitUnit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitUnitDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitUnit'];
        };
      };
    };
  };
  getRaitUnit: {
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
          'application/json': components['schemas']['RaitUnit'];
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
  removeRaitUnit: {
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
  updateRaitUnit: {
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
        'application/json': components['schemas']['CreateRaitUnitDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitUnit'];
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
  listRaitPool: {
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
          'application/json': components['schemas']['RaitPool'][];
        };
      };
    };
  };
  createRaitPool: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitPoolDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPool'];
        };
      };
    };
  };
  getRaitPool: {
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
          'application/json': components['schemas']['RaitPool'];
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
  removeRaitPool: {
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
  updateRaitPool: {
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
        'application/json': components['schemas']['CreateRaitPoolDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPool'];
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
  listRaitPoolMember: {
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
          'application/json': components['schemas']['RaitPoolMember'][];
        };
      };
    };
  };
  createRaitPoolMember: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitPoolMemberDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolMember'];
        };
      };
    };
  };
  getRaitPoolMember: {
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
          'application/json': components['schemas']['RaitPoolMember'];
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
  removeRaitPoolMember: {
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
  updateRaitPoolMember: {
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
        'application/json': components['schemas']['CreateRaitPoolMemberDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolMember'];
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
  listRaitSchedule: {
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
          'application/json': components['schemas']['RaitSchedule'][];
        };
      };
    };
  };
  createRaitSchedule: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitScheduleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSchedule'];
        };
      };
    };
  };
  getRaitSchedule: {
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
          'application/json': components['schemas']['RaitSchedule'];
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
  removeRaitSchedule: {
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
  updateRaitSchedule: {
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
        'application/json': components['schemas']['CreateRaitScheduleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSchedule'];
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
  listRaitScheduleSlot: {
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
          'application/json': components['schemas']['RaitScheduleSlot'][];
        };
      };
    };
  };
  createRaitScheduleSlot: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitScheduleSlotDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleSlot'];
        };
      };
    };
  };
  getRaitScheduleSlot: {
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
          'application/json': components['schemas']['RaitScheduleSlot'];
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
  removeRaitScheduleSlot: {
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
  updateRaitScheduleSlot: {
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
        'application/json': components['schemas']['CreateRaitScheduleSlotDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleSlot'];
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
  listRaitBatch: {
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
          'application/json': components['schemas']['RaitBatch'][];
        };
      };
    };
  };
  createRaitBatch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitBatchDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatch'];
        };
      };
    };
  };
  getRaitBatch: {
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
          'application/json': components['schemas']['RaitBatch'];
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
  removeRaitBatch: {
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
  updateRaitBatch: {
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
        'application/json': components['schemas']['CreateRaitBatchDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatch'];
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
  listRaitBatchItem: {
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
          'application/json': components['schemas']['RaitBatchItem'][];
        };
      };
    };
  };
  createRaitBatchItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitBatchItemDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatchItem'];
        };
      };
    };
  };
  getRaitBatchItem: {
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
          'application/json': components['schemas']['RaitBatchItem'];
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
  removeRaitBatchItem: {
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
  updateRaitBatchItem: {
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
        'application/json': components['schemas']['CreateRaitBatchItemDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatchItem'];
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
  listRaitAssignment: {
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
          'application/json': components['schemas']['RaitAssignment'][];
        };
      };
    };
  };
  createRaitAssignment: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitAssignmentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAssignment'];
        };
      };
    };
  };
  getRaitAssignment: {
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
          'application/json': components['schemas']['RaitAssignment'];
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
  removeRaitAssignment: {
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
  updateRaitAssignment: {
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
        'application/json': components['schemas']['CreateRaitAssignmentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAssignment'];
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
  listRaitImpediment: {
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
          'application/json': components['schemas']['RaitImpediment'][];
        };
      };
    };
  };
  createRaitImpediment: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitImpedimentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitImpediment'];
        };
      };
    };
  };
  getRaitImpediment: {
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
          'application/json': components['schemas']['RaitImpediment'];
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
  removeRaitImpediment: {
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
  updateRaitImpediment: {
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
        'application/json': components['schemas']['CreateRaitImpedimentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitImpediment'];
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
  listRaitSubstituteDuty: {
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
          'application/json': components['schemas']['RaitSubstituteDuty'][];
        };
      };
    };
  };
  createRaitSubstituteDuty: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitSubstituteDutyDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSubstituteDuty'];
        };
      };
    };
  };
  getRaitSubstituteDuty: {
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
          'application/json': components['schemas']['RaitSubstituteDuty'];
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
  removeRaitSubstituteDuty: {
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
  updateRaitSubstituteDuty: {
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
        'application/json': components['schemas']['CreateRaitSubstituteDutyDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSubstituteDuty'];
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
  listRaitBench: {
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
          'application/json': components['schemas']['RaitBench'][];
        };
      };
    };
  };
  createRaitBench: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitBenchDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBench'];
        };
      };
    };
  };
  getRaitBench: {
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
          'application/json': components['schemas']['RaitBench'];
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
  removeRaitBench: {
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
  updateRaitBench: {
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
        'application/json': components['schemas']['CreateRaitBenchDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBench'];
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
  listRaitClock: {
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
          'application/json': components['schemas']['RaitClock'][];
        };
      };
    };
  };
  createRaitClock: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitClockDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitClock'];
        };
      };
    };
  };
  getRaitClock: {
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
          'application/json': components['schemas']['RaitClock'];
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
  removeRaitClock: {
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
  updateRaitClock: {
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
        'application/json': components['schemas']['CreateRaitClockDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitClock'];
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
  listRaitClockAlert: {
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
          'application/json': components['schemas']['RaitClockAlert'][];
        };
      };
    };
  };
  createRaitClockAlert: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitClockAlertDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitClockAlert'];
        };
      };
    };
  };
  getRaitClockAlert: {
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
          'application/json': components['schemas']['RaitClockAlert'];
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
  removeRaitClockAlert: {
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
  updateRaitClockAlert: {
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
        'application/json': components['schemas']['CreateRaitClockAlertDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitClockAlert'];
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
