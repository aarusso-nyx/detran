// Generated from docs/framework/contracts/BP-INF-INFRACTION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/infraction/infractions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Infraction (most recent first, capped at 500) */
    get: operations['listInfraction'];
    put?: never;
    post: operations['createInfraction'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/infraction/infractions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getInfraction'];
    put?: never;
    post?: never;
    delete: operations['removeInfraction'];
    options?: never;
    head?: never;
    patch: operations['updateInfraction'];
    trace?: never;
  };
  '/v1/inf/infraction/timers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List InfractionTimer (most recent first, capped at 500) */
    get: operations['listInfractionTimer'];
    put?: never;
    post: operations['createInfractionTimer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/infraction/timers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getInfractionTimer'];
    put?: never;
    post?: never;
    delete: operations['removeInfractionTimer'];
    options?: never;
    head?: never;
    patch: operations['updateInfractionTimer'];
    trace?: never;
  };
  '/v1/inf/infraction/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List InfractionEvent (most recent first, capped at 500) */
    get: operations['listInfractionEvent'];
    put?: never;
    post: operations['createInfractionEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/infraction/events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getInfractionEvent'];
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
    /** @description Agregado da infracao — unico escritor do estado legal (ADR-0016 Decision 1; [WF-INF-003] secao 1 estados, secao 4 atributos ortogonais, secao 5 invariantes). Uma infracao por AIT integrado; state e substate por FK ao vocabulario de 14-inf-lifecycle-vocabulary.sql. */
    Infraction: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /**
       * @default 'AIT_LAVRADO'
       * @enum {string}
       */
      state: 'INSTANCIA_ENCERRADA' | 'ARQUIVADO';
      /** @enum {string|null} */
      substate?:
        | 'PRAZO_DEFESA_ABERTO'
        | 'INDICACAO_EM_PROCESSAMENTO'
        | 'EM_ADMISSIBILIDADE_1A'
        | 'EM_REMESSA_JARI'
        | 'EM_JULGAMENTO_JARI'
        | 'PROVIDO_1A'
        | 'NEGADO_1A'
        | 'EM_ADMISSIBILIDADE_2A'
        | 'EM_JULGAMENTO_CETRAN'
        | 'PENDENTE_PAGAMENTO'
        | 'QUITADA'
        | 'EM_COBRANCA'
        | null;
      /**
       * @default 'proprietario'
       * @enum {string}
       */
      subject_kind:
        | 'proprietario'
        | 'principal_condutor'
        | 'condutor_identificado'
        | 'possuidor_equiparado'
        | 'embarcador'
        | 'transportador';
      /** @default false */
      suspensive_effect: boolean;
      /** @default false */
      paid: boolean;
      /**
       * @default 'nenhum'
       * @enum {string}
       */
      payment_tier:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido';
      /** @default false */
      points_registered: boolean;
      /** @enum {string|null} */
      closure_motive?:
        | 'nao_interposicao_1a'
        | 'nao_interposicao_2a'
        | 'julgamento_2a'
        | 'reconhecimento'
        | 'desistencia'
        | 'nao_conhecimento_intempestivo'
        | 'na_nao_expedida'
        | 'insubsistente'
        | null;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      risk_flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /** Format: date */
      committed_on: string;
      flagrant: boolean;
      /** Format: date */
      known_on?: string | null;
      /** Format: date-time */
      state_changed_at: string;
      last_transition_id?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInfractionDto: {
      /** Format: uuid */
      ait_id: string;
      /**
       * @default 'AIT_LAVRADO'
       * @enum {string}
       */
      state: 'INSTANCIA_ENCERRADA' | 'ARQUIVADO';
      /** @enum {string|null} */
      substate?:
        | 'PRAZO_DEFESA_ABERTO'
        | 'INDICACAO_EM_PROCESSAMENTO'
        | 'EM_ADMISSIBILIDADE_1A'
        | 'EM_REMESSA_JARI'
        | 'EM_JULGAMENTO_JARI'
        | 'PROVIDO_1A'
        | 'NEGADO_1A'
        | 'EM_ADMISSIBILIDADE_2A'
        | 'EM_JULGAMENTO_CETRAN'
        | 'PENDENTE_PAGAMENTO'
        | 'QUITADA'
        | 'EM_COBRANCA'
        | null;
      /**
       * @default 'proprietario'
       * @enum {string}
       */
      subject_kind:
        | 'proprietario'
        | 'principal_condutor'
        | 'condutor_identificado'
        | 'possuidor_equiparado'
        | 'embarcador'
        | 'transportador';
      /** @default false */
      suspensive_effect: boolean;
      /** @default false */
      paid: boolean;
      /**
       * @default 'nenhum'
       * @enum {string}
       */
      payment_tier:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido';
      /** @default false */
      points_registered: boolean;
      /** @enum {string|null} */
      closure_motive?:
        | 'nao_interposicao_1a'
        | 'nao_interposicao_2a'
        | 'julgamento_2a'
        | 'reconhecimento'
        | 'desistencia'
        | 'nao_conhecimento_intempestivo'
        | 'na_nao_expedida'
        | 'insubsistente'
        | null;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      risk_flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /** Format: date */
      committed_on: string;
      flagrant: boolean;
      /** Format: date */
      known_on?: string | null;
      /** Format: date-time */
      state_changed_at: string;
      last_transition_id?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Relogio legal da infracao ([WF-INF-003] secao 3; [WF-INF-002] secao 9.2). due_on ja vem prorrogado ao 1o dia util e nunca antecipa (rait-deadline-engine secao 2). Um relogio T-JUL-24M por instance (jari|cetran). suspended_by_act_id referencia inf.rait_suspension_act (DDL 39) sem FK — ordem lexicografica de apply.sh, como rait_deadline. */
    InfractionTimer: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      infraction_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-NA'
        | 'T-SNE-CIENCIA'
        | 'T-DEF'
        | 'T-IND'
        | 'T-NA-IND'
        | 'T-DEC'
        | 'T-NP-VENC'
        | 'T-REM10'
        | 'T-JUL-24M'
        | 'T-DIL'
        | 'T-R2'
        | 'T-PAR-3A'
        | 'T-PRESC-5A'
        | 'T-VOTO'
        | 'T-CONV'
        | 'T-ASS'
        | 'T-CLAIM'
        | 'SLA-30';
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | null;
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** Format: date */
      ceiling_on?: string | null;
      /** @default false */
      business_days: boolean;
      /** @enum {string} */
      status: 'armado' | 'satisfeito' | 'cancelado' | 'vencido';
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: date-time */
      expired_at?: string | null;
      cancel_reason?: string | null;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
      /** @default 0 */
      suspended_days: number;
      /** @default 0 */
      extension_count: number;
      legal_basis: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInfractionTimerDto: {
      /** Format: uuid */
      infraction_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-NA'
        | 'T-SNE-CIENCIA'
        | 'T-DEF'
        | 'T-IND'
        | 'T-NA-IND'
        | 'T-DEC'
        | 'T-NP-VENC'
        | 'T-REM10'
        | 'T-JUL-24M'
        | 'T-DIL'
        | 'T-R2'
        | 'T-PAR-3A'
        | 'T-PRESC-5A'
        | 'T-VOTO'
        | 'T-CONV'
        | 'T-ASS'
        | 'T-CLAIM'
        | 'SLA-30';
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | null;
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** Format: date */
      ceiling_on?: string | null;
      /** @default false */
      business_days: boolean;
      /** @enum {string} */
      status: 'armado' | 'satisfeito' | 'cancelado' | 'vencido';
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: date-time */
      expired_at?: string | null;
      cancel_reason?: string | null;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
      /** @default 0 */
      suspended_days: number;
      /** @default 0 */
      extension_count: number;
      legal_basis: string;
    };
    /** @description Trilha append-only de transicoes e eventos publicados ([WF-INF-003] secao 6; rait-events-sse-contract secao 2.4). Nunca atualizada: updated_at existe por construcao do gerador e nao tem semantica. transition_id/rule_ref ligam a linha a inf.infraction_transition_ref; outbox_id liga ao envelope da integration.outbox. */
    InfractionEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      infraction_id: string;
      transition_id?: string | null;
      rule_ref?: string | null;
      from_state?: string | null;
      to_state?: string | null;
      from_substate?: string | null;
      to_substate?: string | null;
      /** @enum {string} */
      trigger_kind: 'evento' | 'timer' | 'ato' | 'sistema';
      trigger_code: string;
      /** @enum {string} */
      event_code:
        | 'INFRACAO_ESTADO_ALTERADO'
        | 'PENALIDADE_DEFINITIVA'
        | 'RESTITUICAO_DEVIDA'
        | 'TIMER_VENCIDO'
        | 'RISCO_PRESCRICAO_ALTERADO';
      /** Format: date-time */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
      /** @enum {string} */
      actor_kind: 'user' | 'system';
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      outbox_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInfractionEventDto: {
      /** Format: uuid */
      infraction_id: string;
      transition_id?: string | null;
      rule_ref?: string | null;
      from_state?: string | null;
      to_state?: string | null;
      from_substate?: string | null;
      to_substate?: string | null;
      /** @enum {string} */
      trigger_kind: 'evento' | 'timer' | 'ato' | 'sistema';
      trigger_code: string;
      /** @enum {string} */
      event_code:
        | 'INFRACAO_ESTADO_ALTERADO'
        | 'PENALIDADE_DEFINITIVA'
        | 'RESTITUICAO_DEVIDA'
        | 'TIMER_VENCIDO'
        | 'RISCO_PRESCRICAO_ALTERADO';
      /** Format: date-time */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
      /** @enum {string} */
      actor_kind: 'user' | 'system';
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      outbox_id?: string | null;
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
  listInfraction: {
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
          'application/json': components['schemas']['Infraction'][];
        };
      };
    };
  };
  createInfraction: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateInfractionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Infraction'];
        };
      };
    };
  };
  getInfraction: {
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
          'application/json': components['schemas']['Infraction'];
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
  removeInfraction: {
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
  updateInfraction: {
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
        'application/json': components['schemas']['CreateInfractionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Infraction'];
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
  listInfractionTimer: {
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
          'application/json': components['schemas']['InfractionTimer'][];
        };
      };
    };
  };
  createInfractionTimer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateInfractionTimerDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['InfractionTimer'];
        };
      };
    };
  };
  getInfractionTimer: {
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
          'application/json': components['schemas']['InfractionTimer'];
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
  removeInfractionTimer: {
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
  updateInfractionTimer: {
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
        'application/json': components['schemas']['CreateInfractionTimerDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['InfractionTimer'];
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
  listInfractionEvent: {
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
          'application/json': components['schemas']['InfractionEvent'][];
        };
      };
    };
  };
  createInfractionEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateInfractionEventDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['InfractionEvent'];
        };
      };
    };
  };
  getInfractionEvent: {
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
          'application/json': components['schemas']['InfractionEvent'];
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
