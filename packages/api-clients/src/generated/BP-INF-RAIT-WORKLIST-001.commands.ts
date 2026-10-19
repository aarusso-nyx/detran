// Generated from docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/schedules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitSchedule'];
    put?: never;
    post: operations['raitScheduleCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/schedules/{id}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitSchedulePublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitBatch'];
    put?: never;
    post: operations['raitBatchCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches/{id}/approve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitBatchApprove'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches/{id}/items/{caseId}/accept': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitBatchItemAccept'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches/{id}/items/{caseId}/impediment': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitBatchItemImpediment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batches/{id}/commands/draw': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitBatchDraw'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/assignments/{id}/commands/reassign': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitAssignmentReassign'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/units': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitUnit'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitUnit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pools': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitPool'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitPool'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pool-members': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitPoolMember'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitPoolMember'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitSchedule'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/schedule-slots': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitScheduleSlot'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitScheduleSlot'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitBatch'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/batch-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitBatchItem'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitBatchItem'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/assignments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitAssignment'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitAssignment'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/impediments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitImpediment'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitImpediment'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/substitute-duties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitSubstituteDuty'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitSubstituteDuty'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/benches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitBench'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitBench'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/clocks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitClock'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitClock'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/clock-alerts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitClockAlert'];
    put?: never;
    post?: never;
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
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitClockAlert'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitUnitFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitPoolFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitPoolMemberFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      person_id: string;
      /** @enum {string} */
      member_role:
        | 'analista'
        | 'relator'
        | 'presidente'
        | 'coordenador'
        | 'secretaria'
        | 'autoridade';
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
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @enum {string|null} */
      representation_block?:
        | 'executivo_estadual'
        | 'municipal_rodoviario'
        | 'sociedade_civil'
        | null;
      institutional_seat_ref?: string | null;
      appointment_act_ref?: string | null;
      /** Format: date */
      institutional_valid_from?: string | null;
      /** Format: date */
      institutional_valid_to?: string | null;
      institutional_identity_hash?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitScheduleFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitScheduleSlotFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitBatchFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** @default 1 */
      version: number;
      approval_signature_ref?: string | null;
      approval_receipt_hash?: string | null;
      /** Format: date-time */
      approval_verified_at?: string | null;
      /** Format: uuid */
      approval_signer_person_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitBatchItemSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      member_id?: string | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitBatchItemORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      member_id?: string | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitBatchItemMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      member_id?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitBatchItemJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      member_id?: string | null;
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAssignmentSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      released_at?: string | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAssignmentORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      released_at?: string | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAssignmentMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      released_at?: string | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
      /** Format: uuid */
      assigned_by?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAssignmentJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      released_at?: string | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
      /** Format: uuid */
      assigned_by?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
    };
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitImpedimentFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitSubstituteDutyFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description Existing functional organization/personnel/impediment contract only; scoped relation and effective action permission remain required; no inferred case-merits grant. */
    RaitBenchFunctionalRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockAlertSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      acknowledged_at?: string | null;
      incident_ref?: string | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockAlertORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      acknowledged_at?: string | null;
      incident_ref?: string | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockAlertMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      acknowledged_at?: string | null;
      incident_ref?: string | null;
      notified_role: string;
      /** Format: uuid */
      acknowledged_by?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitClockAlertJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: date-time */
      acknowledged_at?: string | null;
      incident_ref?: string | null;
      notified_role: string;
      /** Format: uuid */
      acknowledged_by?: string | null;
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
  listRaitSchedule: {
    parameters: {
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitScheduleCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Escala criada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitSchedulePublish: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Escala publicada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitBatch: {
    parameters: {
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatchFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitBatchCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lote criado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitBatchApprove: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lote aprovado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitBatchItemAccept: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Item aceito */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitBatchItemImpediment: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Impedimento registrado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitBatchDraw: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lote sorteado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitAssignmentReassign: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Caso reatribuído */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitUnit: {
    parameters: {
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitUnitFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitUnitFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolMemberFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitPoolMemberFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleSlotFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitScheduleSlotFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBatchFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        case_id?: string;
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitBatchItemSRead']
            | components['schemas']['RaitBatchItemORead']
            | components['schemas']['RaitBatchItemMRead']
            | components['schemas']['RaitBatchItemJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitBatchItemSRead']
            | components['schemas']['RaitBatchItemORead']
            | components['schemas']['RaitBatchItemMRead']
            | components['schemas']['RaitBatchItemJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        case_id?: string;
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitAssignmentSRead']
            | components['schemas']['RaitAssignmentORead']
            | components['schemas']['RaitAssignmentMRead']
            | components['schemas']['RaitAssignmentJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitAssignmentSRead']
            | components['schemas']['RaitAssignmentORead']
            | components['schemas']['RaitAssignmentMRead']
            | components['schemas']['RaitAssignmentJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitImpedimentFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitImpedimentFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSubstituteDutyFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSubstituteDutyFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBenchFunctionalRead'][];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitBenchFunctionalRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        case_id?: string;
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitClockSRead']
            | components['schemas']['RaitClockORead']
            | components['schemas']['RaitClockMRead']
            | components['schemas']['RaitClockJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitClockSRead']
            | components['schemas']['RaitClockORead']
            | components['schemas']['RaitClockMRead']
            | components['schemas']['RaitClockJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
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
      query?: {
        case_id?: string;
        pool_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitClockAlertSRead']
            | components['schemas']['RaitClockAlertORead']
            | components['schemas']['RaitClockAlertMRead']
            | components['schemas']['RaitClockAlertJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitClockAlertSRead']
            | components['schemas']['RaitClockAlertORead']
            | components['schemas']['RaitClockAlertMRead']
            | components['schemas']['RaitClockAlertJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
