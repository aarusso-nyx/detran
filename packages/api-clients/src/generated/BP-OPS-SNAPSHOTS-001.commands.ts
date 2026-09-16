// Generated from docs/framework/contracts/BP-OPS-SNAPSHOTS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/snapshots/external-queries': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista consultas externas para auditoria (sem parâmetros pessoais). */
    get: operations['teatExternalQueryList'];
    put?: never;
    /** Registra uma consulta externa (WSDENATRAN/RENACH) e congela o snapshot. */
    post: operations['teatExternalQueryCreate'];
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
    CreateExternalQueryCommandDto: {
      /** @enum {string} */
      query_type: 'vehicle_by_plate' | 'driver_by_cpf' | 'driver_by_license';
      /** @description vehicle_by_plate: { plate }; driver_by_cpf: { cpf }; driver_by_license: { license_number } — a forma varia por query_type (CTG-0003 §5.1). */
      parameters: {
        [key: string]: unknown;
      };
      purpose: string;
      /** Format: uuid */
      agent_id?: string;
      /** Format: uuid */
      device_id?: string;
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
  teatExternalQueryList: {
    parameters: {
      query?: {
        query_type?: 'vehicle_by_plate' | 'driver_by_cpf' | 'driver_by_license';
        purpose?: string;
        agent_id?: string;
        from?: string;
        to?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Consultas do tenant, sem os parâmetros de entrada (dado pessoal de terceiro). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: {
              /** Format: uuid */
              id?: string;
              query_type?: string;
              purpose?: string;
              /** Format: date-time */
              queried_at?: string;
              status?: string;
              parameters_hash?: string;
              /** Format: uuid */
              user_ref?: string;
              /** Format: uuid */
              agent_id?: string | null;
              /** Format: uuid */
              device_id?: string | null;
            }[];
            nextCursor?: string | null;
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
  teatExternalQueryCreate: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "query_type": "vehicle_by_plate",
         *       "parameters": {
         *         "plate": "ABC1D23"
         *       },
         *       "purpose": "confirmação de placa em campo"
         *     }
         */
        'application/json': components['schemas']['CreateExternalQueryCommandDto'];
      };
    };
    responses: {
      /** @description Consulta registrada e snapshot congelado. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            snapshot_id: string;
            source: string;
            /** Format: date-time */
            queried_at: string;
            result: {
              [key: string]: unknown;
            };
            divergence_recorded: boolean;
          };
        };
      };
      /** @description purpose ausente, ou parameters não casa com query_type. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.ENUM_INVALID'
              | 'TEAT.QUERY_PURPOSE_REQUIRED'
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
      /** @description Placa/CPF inexistente na base nacional. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.QUERY_NOT_FOUND' | 'TEAT.TENANT_MISMATCH';
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
      /** @description Adapter nacional sem resposta. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.QUERY_UPSTREAM_UNAVAILABLE';
            /** @constant */
            status: 503;
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
