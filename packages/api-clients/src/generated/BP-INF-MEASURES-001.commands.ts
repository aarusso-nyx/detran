// Generated from docs/framework/contracts/BP-INF-MEASURES-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/measures/administrative-measures/{id}/start': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Marca o início da medida administrativa (RETIDO). */
    post: operations['teatAdministrativeMeasureStart'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/retentions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra a retenção do veículo (CTB art. 270). */
    post: operations['teatAdministrativeMeasureRegisterRetention'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/removals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra a remoção do veículo (CTB art. 271). */
    post: operations['teatAdministrativeMeasureRegisterRemoval'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/inventories': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra o inventário do veículo removido. */
    post: operations['teatAdministrativeMeasureInventoryVehicle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/terms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Emite um termo administrativo (retenção ou remoção). */
    post: operations['teatAdministrativeMeasureApplyTerm'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/retentions/{id}/release': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Libera a retenção (RETIDO/LIBERADO_COM_PRAZO → LIBERADO_LOCAL/REGULARIZADO). */
    post: operations['teatAdministrativeMeasureRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/conclude': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Conclui a medida (LIBERADO_COM_PRAZO → REGULARIZADO). */
    post: operations['teatAdministrativeMeasureConclude'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}/cancel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancela a medida — sem estado de destino em WF-TEAT-004; sempre reprova. */
    post: operations['teatAdministrativeMeasureCancel'];
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
    StartMeasureCommandDto: {
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    RecordRetentionCommandDto: {
      /** Format: uuid */
      vehicle_snapshot_id: string;
      retention_reason: string;
      /** @description CTB art. 270 §2º (RN-TEAT-124); > 30 → 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED. */
      regularization_deadline_days?: number;
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    RecordRemovalCommandDto: {
      /** Format: uuid */
      vehicle_snapshot_id: string;
      /** Format: uuid */
      tow_provider_id?: string;
      /** Format: uuid */
      yard_id?: string;
      /** Format: date-time */
      requested_at?: string;
      destination_description?: string;
      /** @description CTB art. 271 §9º-A (RN-TEAT-125); > 15 → 422 TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED. */
      regularization_deadline_days?: number;
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    RecordVehicleInventoryCommandDto: {
      /** Format: uuid */
      vehicle_snapshot_id: string;
      /** @description Res. 1.025/2026 art. 14 §1º: objects_left, missing_mandatory_equipment, body_condition, withdrawal_deadline_notice (RN-TEAT-126). */
      inventory_json: {
        [key: string]: unknown;
      };
      damage_description?: string;
      /** Format: uuid */
      signed_by_person_id?: string;
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    IssueAdministrativeTermCommandDto: {
      term_type: string;
      term_number: string;
      content_hash?: string;
      /** Format: uuid */
      file_evidence_id?: string;
      /** Format: date-time */
      issued_at?: string;
      /** Format: uuid */
      signed_by_person_id?: string;
      /**
       * Format: date-time
       * @description Res. 1.025/2026 art. 14 §1º (OD-T05); obrigatório quando term_type=removal.
       */
      withdrawal_deadline_at?: string;
      /** @description term_type=removal exige agency, vehicle, ait_or_order_ref, place_datetime, legal_basis, custody_place, owner_and_driver (art. 14 caput). */
      field_details_json?: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    ReleaseRetentionCommandDto: {
      /** Format: date-time */
      released_at?: string;
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    ConcludeMeasureCommandDto: {
      /** Format: date-time */
      ended_at?: string;
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    CancelMeasureCommandDto: {
      reason: string;
      /** Format: uuid */
      user_ref?: string;
      details_json?: {
        [key: string]: unknown;
      };
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
  teatAdministrativeMeasureStart: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['StartMeasureCommandDto'];
      };
    };
    responses: {
      /** @description Início registrado. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000ed000001",
           *       "current_status": "RETIDO",
           *       "started_at": "2026-09-14T12:00:00.000Z"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            current_status: string;
            /** Format: date-time */
            started_at: string;
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
      /** @description Medida fora de RETIDO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
      /** @description measure_type_id fora do catálogo ativo, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_TYPE_NOT_IN_CATALOG';
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
  teatAdministrativeMeasureRegisterRetention: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RecordRetentionCommandDto'];
      };
    };
    responses: {
      /** @description Retenção registrada. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            measure_id: string;
            /** Format: uuid */
            vehicle_snapshot_id: string;
            /** Format: date-time */
            regularization_deadline_at: string | null;
            regularization_deadline_days: number | null;
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
      /** @description Medida fora de RETIDO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
      /** @description Prazo de regularização acima de 30 dias, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED';
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
  teatAdministrativeMeasureRegisterRemoval: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RecordRemovalCommandDto'];
      };
    };
    responses: {
      /** @description Remoção registrada. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            measure_id: string;
            current_status: string;
            /** Format: date-time */
            regularization_deadline_at: string | null;
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
      /** @description Medida fora de RETIDO/LIBERADO_COM_PRAZO/CONVERTIDO_REMOCAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
      /** @description Prazo acima de 15 dias, guarda monitorada desligada, ou prestador/pátio inativo, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.MEASURE_MONITORED_CUSTODY_DISABLED'
              | 'TEAT.MEASURE_RETENTION_LIMIT_EXCEEDED'
              | 'TEAT.MEASURE_TOW_PROVIDER_INACTIVE'
              | 'TEAT.MEASURE_YARD_INACTIVE';
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
  teatAdministrativeMeasureInventoryVehicle: {
    parameters: {
      query?: never;
      header?: {
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
         *       "inventory_json": {
         *         "objects_left": [],
         *         "missing_mandatory_equipment": [],
         *         "body_condition": "regular",
         *         "withdrawal_deadline_notice": true
         *       }
         *     }
         */
        'application/json': components['schemas']['RecordVehicleInventoryCommandDto'];
      };
    };
    responses: {
      /** @description Inventário registrado. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            measure_id: string;
            /** Format: uuid */
            vehicle_snapshot_id: string;
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
      /** @description Medida fora de REMOVIDO/EM_DEPOSITO/GUARDA_MONITORADA/VIOLACAO_MONITORAMENTO/NOTIFICADO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
      /** @description inventory_json sem os quatro elementos do §1º do art. 14, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_TERM_MINIMUM_CONTENT';
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
  teatAdministrativeMeasureApplyTerm: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['IssueAdministrativeTermCommandDto'];
      };
    };
    responses: {
      /** @description Termo emitido. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            measure_id: string;
            term_type: string;
            term_number: string;
            content_hash: string;
            /** Format: date-time */
            withdrawal_deadline_at: string | null;
            /** Format: date-time */
            ctb_deadline_at: string | null;
            /** @constant */
            status: 'issued';
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
      /** @description term_number repetido no tenant, ou medida fora do pré-estado do comando. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IDEMPOTENCY_REPLAY' | 'TEAT.MEASURE_STATE_INVALID';
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
      /** @description Prazo de retirada ausente (term_type=removal), ou field_details_json incompleto, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.MEASURE_TERM_DEADLINE_MISSING'
              | 'TEAT.MEASURE_TERM_MINIMUM_CONTENT';
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
  teatAdministrativeMeasureRelease: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['ReleaseRetentionCommandDto'];
      };
    };
    responses: {
      /** @description Retenção liberada. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000ed100001",
           *       "measure_id": "00000000-0000-7000-8000-0000ed000001",
           *       "released_at": "2026-09-14T12:00:00.000Z",
           *       "current_status": "LIBERADO_LOCAL"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            measure_id: string;
            /** Format: date-time */
            released_at: string;
            current_status: string;
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
      /** @description Papel sem a chave inf:administrative-measure:release. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.FORBIDDEN_ACTION' | 'TEAT.MEASURE_RELEASE_NOT_ALLOWED';
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
      /** @description Retenção já liberada, ou medida fora de RETIDO/LIBERADO_COM_PRAZO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
  teatAdministrativeMeasureConclude: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['ConcludeMeasureCommandDto'];
      };
    };
    responses: {
      /** @description Medida concluída. */
      200: {
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
            current_status: 'REGULARIZADO';
            /** Format: date-time */
            ended_at: string;
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
      /** @description Medida fora de LIBERADO_COM_PRAZO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
  teatAdministrativeMeasureCancel: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CancelMeasureCommandDto'];
      };
    };
    responses: {
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
      /** @description [WF-TEAT-004] não tem estado de cancelamento: o comando responde sempre 409 (source_pending, OD-T37). */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.MEASURE_STATE_INVALID';
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
}
