// Generated from docs/framework/contracts/BP-INF-AIT-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/ait/aits/{id}/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Anexa um veículo ao AIT (RASCUNHO_OFFLINE). */
    post: operations['teatAitVehicleAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/people': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Anexa uma pessoa ao AIT (RASCUNHO_OFFLINE). */
    post: operations['teatAitPersonAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/science': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra a ciência do condutor/infrator (assinatura, recusa ou impossibilidade). */
    post: operations['teatAitScience'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/finalize': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Finaliza o AIT (RASCUNHO_OFFLINE → FINALIZADO_LOCAL). */
    post: operations['teatAitFinalize'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/print-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra um evento de impressão do AIT. */
    post: operations['teatAitPrintEventAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/queue-transmission': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Enfileira o AIT para transmissão (FINALIZADO_LOCAL → ENFILEIRADO). */
    post: operations['teatAitQueueTransmission'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/receive-protocol': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra o protocolo de recebimento do AIT (ENFILEIRADO/TRANSMITIDO → RECEBIDO). */
    post: operations['teatAitReceiveProtocol'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/concurrency-review': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Decide a apuração de concorrência (SUSPEITO_CONCORRENCIA → RECEBIDO ou REJEITADO). */
    post: operations['teatAitReviewConcurrency'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/request-correction': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Solicita correção do AIT (VALIDANDO/REJEITADO → PENDENTE_CORRECAO). */
    post: operations['teatAitRequestCorrection'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/corrections': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra uma correção do AIT (PENDENTE_CORRECAO). */
    post: operations['teatAitCorrectionAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/corrections/{correctionId}/approve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Aprova a correção do AIT (PENDENTE_CORRECAO → CORRIGIDO). */
    post: operations['teatAitCorrectionApprove'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/accept': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Aceita o AIT (RECEBIDO/VALIDANDO/CORRIGIDO → ACEITO → INTEGRADO). */
    post: operations['teatAitAccept'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/reject': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rejeita o AIT (RECEBIDO/VALIDANDO/PENDENTE_CORRECAO → REJEITADO). */
    post: operations['teatAitReject'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}/archive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Arquiva o AIT (PROCESSADO → ARQUIVADO). */
    post: operations['teatAitArchive'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cria um pedido de cancelamento de rascunho ou pós-final. */
    post: operations['teatAitCancelRequestCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests/{id}/review': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Move o pedido de cancelamento para under_review. */
    post: operations['teatAitCancelRequestReview'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests/{id}/decide': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Decide o pedido de cancelamento (approve/deny). */
    post: operations['teatAitCancelRequestDecide'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests/outcomes/{targetLocalActId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista o desfecho dos pedidos de cancelamento de um ato local. */
    get: operations['teatAitCancelRequestOutcomes'];
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
    CreateAitVehicleDto: {
      /** Format: uuid */
      vehicle_snapshot_id: string;
      role: string;
      /** @default false */
      visually_confirmed_by_agent: boolean;
      observed_divergence?: string;
    };
    CreateAitPersonDto: {
      /** Format: uuid */
      person_id: string;
      role: string;
      identified_by: string;
      /** Format: uuid */
      external_query_id?: string;
      /** @default false */
      signed: boolean;
      /** @default false */
      refused_signature: boolean;
      notes?: string;
    };
    AitScienceCommandDto: {
      /** Format: uuid */
      person_id?: string;
      /** @enum {string} */
      signature_type: 'signed' | 'refused' | 'impossibility';
      /** Format: uuid */
      signature_evidence_id?: string;
      /** Format: date-time */
      signed_at?: string;
      location_json?: {
        [key: string]: unknown;
      };
      refusal_or_impossibility_reason?: string;
    };
    FinalizeAitCommandDto: {
      /** Format: uuid */
      user_ref?: string;
      system_signature_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    CreateAitPrintEventDto: {
      /**
       * @description Vocabulário de modelagem fixado em CTG-0001 §4.5 — não é token canônico.
       * @enum {string}
       */
      event_type: 'impressao' | 'reimpressao' | 'falha';
      /** Format: uuid */
      device_id?: string;
      printer_identifier?: string;
      receipt_hash?: string;
      failure_reason?: string;
    };
    AitCommandDto: {
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    AitProtocolCommandDto: {
      receipt_protocol: string;
      /** Format: uuid */
      user_ref?: string;
    };
    ReviewAitConcurrencyCommandDto: {
      /** @enum {string} */
      decision: 'release' | 'reject';
      reason: string;
      legal_basis?: string;
      /** Format: uuid */
      user_ref?: string;
    };
    AitCorrectionRequestCommandDto: {
      reason: string;
      /** Format: uuid */
      user_ref?: string;
    };
    CreateAitCorrectionDto: {
      /** Format: uuid */
      operator_user_ref: string;
      correction_type: string;
      /** @description Nunca um fato essencial (RN-TEAT-119): proibidos ait_number, series, framing_id, catalog_id, infraction_at, content_hash, agent_id, device_id, uf. */
      changed_field?: string;
      previous_value?: string;
      new_value?: string;
      justification: string;
    };
    ApproveAitCorrectionCommandDto: {
      /** Format: uuid */
      approved_by_user_ref: string;
    };
    RejectAitCommandDto: {
      reason: string;
      /**
       * @deprecated
       * @description Ignorado: não há transição reject → CANCELADO_* em WF-TEAT-001 (M4). Mantido só por compatibilidade do cliente móvel.
       */
      cancelled?: boolean;
      legal_basis?: string;
      /** Format: uuid */
      user_ref?: string;
    };
    ArchiveAitCommandDto: {
      reason: string;
      legal_basis?: string;
      /** Format: uuid */
      user_ref?: string;
    };
    CreateAitCancelRequestDto: {
      localId?: string;
      /** @enum {string} */
      entityType: 'ait-cancel-request' | 'ait-cancel-posfinal-request';
      /** Format: uuid */
      trafficAgencyId: string;
      /** Format: uuid */
      agentId?: string;
      /** Format: uuid */
      deviceId?: string;
      /** Format: uuid */
      shiftId?: string;
      idempotencyKey: string;
      targetLocalActId: string;
      /** Format: uuid */
      targetAitId?: string;
      targetReservedNumber?: number;
      targetContentHash?: string;
      /** @description Um dos 17 tokens de inf.ait_state_ref (CTG-0001 §3); fora do conjunto → 400 TEAT.ENUM_INVALID. */
      originStatus: string;
      justification: string;
      /** Format: date-time */
      requestedAt?: string;
      /** Format: uuid */
      requestedBy: string;
      /** @enum {string} */
      addressedTo?: 'traffic-authority' | 'diretoria-fiscalizacao';
      legalBasisNote?: string;
      location?: {
        latitude?: number;
        longitude?: number;
        accuracyMeters?: number;
        /** Format: date-time */
        capturedAt?: string;
        source?: string;
        manualJustification?: string;
      };
      /**
       * Format: uuid
       * @deprecated
       * @description ignorado; tenant vem do contexto
       */
      tenantId?: string;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      updatedAt?: string;
    };
    DecideAitCancelRequestDto: {
      /** @enum {string} */
      decision: 'approve' | 'deny';
      decision_note: string;
      /** @enum {string} */
      decision_body?: 'traffic-authority' | 'diretoria-fiscalizacao';
      /** Format: uuid */
      decided_by?: string;
      /** Format: date-time */
      decided_at?: string;
      decision_legal_basis?: string;
      actor_role?: string;
      linked_measure_decision?: string;
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
  teatAitVehicleAdd: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "vehicle_snapshot_id": "00000000-0000-7000-8000-0000ef600001",
         *       "role": "envolvido",
         *       "visually_confirmed_by_agent": true
         *     }
         */
        'application/json': components['schemas']['CreateAitVehicleDto'];
      };
    };
    responses: {
      /** @description Veículo anexado. */
      201: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ait_id: string;
            /** Format: uuid */
            vehicle_snapshot_id: string;
            role: string;
            visually_confirmed_by_agent?: boolean;
            observed_divergence?: string;
            /** Format: date-time */
            created_at?: string;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de RASCUNHO_OFFLINE, ou conteúdo legal já finalizado. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_IMMUTABLE' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitPersonAdd: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitPersonDto'];
      };
    };
    responses: {
      /** @description Pessoa anexada. */
      201: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ait_id: string;
            /** Format: uuid */
            person_id: string;
            role: string;
            identified_by?: string;
            signed?: boolean;
            refused_signature?: boolean;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de RASCUNHO_OFFLINE, ou conteúdo legal já finalizado. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_IMMUTABLE' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitScience: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitScienceCommandDto'];
      };
    };
    responses: {
      /** @description Ciência registrada. */
      201: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ait_id: string;
            /** Format: uuid */
            person_id?: string;
            signature_type: string;
            /** Format: date-time */
            signed_at?: string;
          };
        };
      };
      /** @description Assinatura com recusa e impossibilidade ao mesmo tempo, ou motivo ausente. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.AIT_SIGNATURE_OUTCOME_INVALID'
              | 'TEAT.ENUM_INVALID'
              | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de RASCUNHO_OFFLINE ou FINALIZADO_LOCAL. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitFinalize: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "user_ref": "00000000-0000-4000-8000-0000b0000001",
         *       "reason": "lavratura concluída"
         *     }
         */
        'application/json': components['schemas']['FinalizeAitCommandDto'];
      };
    };
    responses: {
      /** @description AIT finalizado. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000f0000001",
           *       "current_status": "FINALIZADO_LOCAL",
           *       "content_hash": "sha256:fixture01",
           *       "finalized_at": "2026-09-14T12:00:00.000Z",
           *       "version": 2
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'FINALIZADO_LOCAL';
            content_hash: string;
            /** Format: date-time */
            finalized_at?: string;
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de RASCUNHO_OFFLINE. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Regra bloqueante da lavratura, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.AIT_EQUIPMENT_REQUIRED'
              | 'TEAT.AIT_FINALIZE_NUMBER_MISSING'
              | 'TEAT.AIT_FINALIZE_VALIDATION_BLOCKED'
              | 'TEAT.AIT_FRAMING_INACTIVE'
              | 'TEAT.AIT_FRAMING_NOT_IN_PACKAGE'
              | 'TEAT.AIT_MINIMUM_CONTENT'
              | 'TEAT.AIT_NO_APPROACH_JUSTIFICATION_REQUIRED'
              | 'TEAT.AIT_NO_APPROACH_NOT_ALLOWED'
              | 'TEAT.AIT_OBSERVATION_REQUIRED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitPrintEventAdd: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitPrintEventDto'];
      };
    };
    responses: {
      /** @description Evento de impressão registrado. */
      201: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ait_id: string;
            event_type: string;
            /** Format: date-time */
            event_at?: string;
            printer_identifier?: string;
            receipt_hash?: string;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de FINALIZADO_LOCAL ou ENFILEIRADO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Reimpressão fora do dia da lavratura, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_PRINT_REPRINT_WINDOW_EXCEEDED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitQueueTransmission: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitCommandDto'];
      };
    };
    responses: {
      /** @description AIT enfileirado. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'ENFILEIRADO';
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de FINALIZADO_LOCAL. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitReceiveProtocol: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitProtocolCommandDto'];
      };
    };
    responses: {
      /** @description Protocolo recebido. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'RECEBIDO';
            receipt_protocol: string;
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Protocolo já usado no tenant, ou AIT fora de ENFILEIRADO/TRANSMITIDO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.AIT_RECEIPT_PROTOCOL_DUPLICATE' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitReviewConcurrency: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReviewAitConcurrencyCommandDto'];
      };
    };
    responses: {
      /** @description Apuração decidida. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            current_status: string;
            version: number;
            /** Format: uuid */
            conflict_id?: string;
            /** @constant */
            conflict_status?: 'resolved';
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de SUSPEITO_CONCORRENCIA. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Motivo da decisão ausente, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitRequestCorrection: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitCorrectionRequestCommandDto'];
      };
    };
    responses: {
      /** @description Correção solicitada. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'PENDENTE_CORRECAO';
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de VALIDANDO/REJEITADO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Solicitação sem justificativa, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_CORRECTION_JUSTIFICATION_REQUIRED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCorrectionAdd: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitCorrectionDto'];
      };
    };
    responses: {
      /** @description Correção registrada. */
      201: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            ait_id: string;
            correction_type: string;
            changed_field?: string;
            /** Format: date-time */
            corrected_at?: string;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de PENDENTE_CORRECAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Campo não saneável, ou correção sem justificativa, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.AIT_CORRECTION_FIELD_FORBIDDEN'
              | 'TEAT.AIT_CORRECTION_JUSTIFICATION_REQUIRED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCorrectionApprove: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
        correctionId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ApproveAitCorrectionCommandDto'];
      };
    };
    responses: {
      /** @description Correção aprovada. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'CORRIGIDO';
            /** Format: uuid */
            correction_id: string;
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Correção de outro AIT, ou AIT de outro tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT' | 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de PENDENTE_CORRECAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitAccept: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitCommandDto'];
      };
    };
    responses: {
      /** @description AIT aceito e integrado. */
      200: {
        headers: {
          /** @description "<version pós-transição>" (+2, ACEITO e INTEGRADO na mesma transação). */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'INTEGRADO';
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT em apuração de concorrência, ou fora de RECEBIDO/VALIDANDO/CORRIGIDO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.AIT_CONCURRENCY_PENDING_REVIEW' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitReject: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RejectAitCommandDto'];
      };
    };
    responses: {
      /** @description AIT rejeitado. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'REJEITADO';
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT em apuração de concorrência, ou fora de RECEBIDO/VALIDANDO/PENDENTE_CORRECAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.AIT_CONCURRENCY_PENDING_REVIEW' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Rejeição sem motivo, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_REJECT_REASON_REQUIRED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitArchive: {
    parameters: {
      query?: never;
      header: {
        /** @description "<inf.ait_ait.version>"; ausente → 428 TEAT.IF_MATCH_REQUIRED, divergente → 412 TEAT.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ArchiveAitCommandDto'];
      };
    };
    responses: {
      /** @description AIT arquivado. */
      200: {
        headers: {
          /** @description "<version pós-transição>". */
          ETag?: string;
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            current_status: 'ARQUIVADO';
            version: number;
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora de PROCESSADO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versão atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Motivo do arquivamento ausente, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCancelRequestCreate: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
        /** @description Obrigatório apenas quando `targetAitId` é informado e o pedido é pós-final (a transição muda o AIT); "<inf.ait_ait.version>". */
        'If-Match'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitCancelRequestDto'];
      };
    };
    responses: {
      /** @description AIT já existe no servidor e a transição ocorreu. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          /** @description "<inf.ait_ait.version pós-transição>", só quando targetAitId e kind=post_final. */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            status: string;
            /** @enum {string} */
            kind: 'draft' | 'post_final';
            addressed_to?: string;
          };
        };
      };
      /** @description targetAitId ausente: o pedido fica requested. */
      202: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            status: 'requested';
            /** @enum {string} */
            kind: 'draft' | 'post_final';
            addressed_to?: string;
            context?: {
              targetLocalActId?: string;
            };
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description AIT fora do pré-estado do kind, ou idempotencyKey do corpo já usada com payload diferente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_STATE_INVALID' | 'TEAT.IDEMPOTENCY_REPLAY';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Forma do payload inválida, ou addressedTo divergente do kind, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCancelRequestReview: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
        /** @description Versão de ait_ait quando o pedido tem AIT vinculado; de ait_cancel_request quando não (CTG-0001 §12/§13 item 2). */
        'If-Match'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AitCommandDto'];
      };
    };
    responses: {
      /** @description Pedido em análise. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          /** @description "<version pós-transição>" de ait_ait (com AIT vinculado) ou de ait_cancel_request (sem). */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            status: 'under_review';
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Pedido já decidido, ou fora de requested. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            code: string;
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCancelRequestDecide: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
        /** @description Versão de ait_ait quando o pedido tem AIT vinculado; de ait_cancel_request quando não. */
        'If-Match'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DecideAitCancelRequestDto'];
      };
    };
    responses: {
      /** @description Pedido decidido. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          /** @description "<version pós-transição>" de ait_ait (com AIT vinculado) ou de ait_cancel_request (sem). */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            status: string;
            /** Format: date-time */
            decided_at: string;
            ait?: {
              /** Format: uuid */
              id?: string;
              current_status?: string;
              version?: number;
            };
          };
        };
      };
      /** @description Erro de forma do payload. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Decisor sem competência para o addressed_to do pedido. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.AIT_CANCEL_ADDRESSEE_FORBIDDEN' | 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso de outro tenant ou inexistente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Pedido já decidido, ou fora de requested/under_review. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_CANCEL_ALREADY_DECIDED' | 'TEAT.AIT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description decision_note ausente, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.VALIDATION_FAILED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  teatAitCancelRequestOutcomes: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description Id local do ato no dispositivo. */
        targetLocalActId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Desfechos do ato local. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            targetLocalActId: string;
            requests: {
              /** Format: uuid */
              id?: string;
              kind?: string;
              status?: string;
              addressedTo?: string;
              originStatus?: string;
              /** Format: date-time */
              requestedAt?: string;
              /** Format: date-time */
              decidedAt?: string;
              decision?: string;
              /** Format: uuid */
              aitId?: string;
              aitCurrentStatus?: string;
            }[];
          };
        };
      };
      /** @description Sem autenticação. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Papel sem a chave de política exigida. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Nenhum pedido para o ato local informado. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.AIT_CANCEL_TARGET_NOT_FOUND' | 'TEAT.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
}
