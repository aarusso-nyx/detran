// Generated from docs/framework/contracts/BP-OPS-BOOTSTRAP-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/mobile-bootstrap': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Snapshot de bootstrap móvel: contexto, catálogo, pacote, reservas e bloqueadores. */
    get: operations['teatMobileBootstrapRead'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/mobile-bootstrap/shifts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Abre o turno do agente no dispositivo. */
    post: operations['teatShiftOpen'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/mobile-bootstrap/shifts/{id}/close': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Fecha o turno e reconcilia as reservas de numeração. */
    post: operations['teatShiftClose'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/mobile-bootstrap/sessions/handoff': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Declara o incidente de troca de dispositivo em campo (D-01). */
    post: operations['teatSessionHandoff'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Stream SSE de eventos de domínio filtrados por papel e tenant (M17). Limite de 1 conexão por aba e 5 por usuário responde 429 sem code de catálogo (OD-T42) e por isso não entra em responses. */
    get: operations['teatOpsStreamRead'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/integrations/outbox': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista a projeção de leitura da outbox de integrações nacionais. */
    get: operations['teatIntegrationOutboxList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/integrations/outbox/{id}/retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reenvia um item de integração falho. */
    post: operations['teatIntegrationItemRetry'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/integrations/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Configuração e fila do adapter de integrações nacionais (sem chamada de rede). */
    get: operations['teatIntegrationHealth'];
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
    OpenMobileShiftDto: {
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      installation_id?: string;
      app_version: string;
      protocol_version?: string;
      /** Format: uuid */
      operational_unit_id: string;
      /** Format: uuid */
      team_id?: string;
      /** Format: uuid */
      patrol_vehicle_id?: string;
      /** Format: uuid */
      operation_id?: string;
      /** Format: date-time */
      started_at: string;
      latitude?: number;
      longitude?: number;
      accuracy_m?: number;
    };
    CloseMobileShiftDto: {
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      installation_id?: string;
      app_version: string;
      protocol_version?: string;
      /** Format: date-time */
      ended_at: string;
      latitude?: number;
      longitude?: number;
      accuracy_m?: number;
      reason?: string;
      numbering_reconciliations?: {
        /** Format: uuid */
        reservation_id: string;
        claimed_numbers: number[];
      }[];
    };
    HandoffSessionCommandDto: {
      /** Format: uuid */
      failed_device_id: string;
      reason: string;
      /** Format: uuid */
      new_device_id?: string;
      location_json?: {
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
  teatMobileBootstrapRead: {
    parameters: {
      query: {
        device_id: string;
        /** @description Convertido para sha256: antes da consulta; o valor cru nunca é persistido nem devolvido. */
        installation_id?: string;
        app_version: string;
        protocol_version?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Snapshot de bootstrap. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @constant */
            protocolVersion: 'teat-mobile-bootstrap.v1';
            requestedProtocolVersion: string;
            snapshot: {
              /** Format: date-time */
              capturedAt: string;
              /**
               * Format: date-time
               * @description source_pending (OD-T14).
               */
              validUntil?: string | null;
              /** @description source_pending (OD-T14). */
              maxAgeSeconds?: number | null;
              /** @constant */
              authority: 'server-snapshot';
            };
            context: {
              /** Format: uuid */
              tenantId: string;
              /** Format: uuid */
              trafficAgencyId: string;
              agent: {
                /** Format: uuid */
                id: string;
                /** Format: uuid */
                operationalUnitId?: string | null;
                status: string;
              };
              device: {
                /** Format: uuid */
                id: string;
                status: string;
                homologated: boolean;
                tamperDetected: boolean;
                appVersion: string;
              };
              activeShift?: {
                /** Format: uuid */
                id?: string;
                /** Format: uuid */
                operationalUnitId?: string;
                /** Format: uuid */
                teamId?: string | null;
                /** Format: uuid */
                patrolVehicleId?: string | null;
                /** Format: uuid */
                operationId?: string | null;
                /** Format: date-time */
                startedAt?: string;
                status?: string;
              } | null;
              session: {
                /** Format: uuid */
                id: string;
                /** Format: date-time */
                startedAt: string;
                exclusive: boolean;
              };
            };
            catalog: {
              operationalUnits: {
                /** Format: uuid */
                id?: string;
                label?: string;
              }[];
              teams: {
                /** Format: uuid */
                id?: string;
                label?: string;
              }[];
              patrolVehicles: {
                /** Format: uuid */
                id?: string;
                label?: string;
              }[];
              operations: {
                /** Format: uuid */
                id?: string;
                label?: string;
              }[];
              measurementInstruments: {
                /** Format: uuid */
                id?: string;
                instrumentType?: string;
                serialNumber?: string;
                brand?: string;
                model?: string;
                inmetroModelApproval?: string;
                /** Format: date */
                verificationValidUntil?: string;
                verificationValid?: boolean;
                status?: string;
              }[];
            };
            normativePackage: {
              /** Format: uuid */
              id?: string;
              /** Format: uuid */
              catalogId?: string;
              version?: string;
              manifestHash?: string;
              status?: string;
              /** Format: date-time */
              publishedAt?: string;
              /** Format: date */
              validUntil?: string | null;
              contentPath?: string;
            } | null;
            numberingReservations: {
              /** Format: uuid */
              id?: string;
              /** Format: uuid */
              rangeId?: string;
              startNumber?: number;
              endNumber?: number;
              /** Format: date-time */
              validUntil?: string | null;
              status?: string;
            }[];
            readiness: {
              preShiftReady: boolean;
              offlineReady: boolean;
              blockers: (
                | 'SESSION_NOT_EXCLUSIVE'
                | 'DEVICE_NOT_AUTHORIZED'
                | 'DEVICE_TAMPER_DETECTED'
                | 'DEVICE_NOT_HOMOLOGATED'
                | 'APP_VERSION_NOT_ALLOWED'
                | 'NORMATIVE_PACKAGE_MISSING'
                | 'NORMATIVE_PACKAGE_EXPIRED'
                | 'NUMBERING_RESERVATION_REQUIRED'
                | 'AGENT_NOT_ACTIVE'
                | 'AGENT_NOT_IN_UNIT'
                | 'SHIFT_ALREADY_OPEN_ELSEWHERE'
              )[];
              warnings: (
                'NORMATIVE_PACKAGE_EXPIRED' | 'HOMOLOGATION_RENEWAL_DUE'
              )[];
            };
            capabilities: {
              canOpenShift: boolean;
              canOperateOffline: boolean;
              canReserveNumbering: boolean;
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
      /** @description Dispositivo/instalação/tenant não conferem. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.FORBIDDEN_ACTION' | 'TEAT.MOBILE_BOOTSTRAP_SCOPE_MISMATCH';
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
      /** @description protocol_version informado diverge da constante suportada. */
      426: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PROTOCOL_VERSION_UNSUPPORTED';
            /** @constant */
            status: 426;
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
  teatShiftOpen: {
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
         *       "device_id": "00000000-0000-7000-8000-0000e4000002",
         *       "app_version": "2026.9.0",
         *       "operational_unit_id": "00000000-0000-7000-8000-0000e2100001",
         *       "started_at": "2026-09-14T08:00:00.000Z"
         *     }
         */
        'application/json': components['schemas']['OpenMobileShiftDto'];
      };
    };
    responses: {
      /** @description Turno aberto. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000e3000001",
           *       "status": "open",
           *       "agent_id": "00000000-0000-4000-8000-0000b0000001",
           *       "device_id": "00000000-0000-7000-8000-0000e4000002",
           *       "operational_unit_id": "00000000-0000-7000-8000-0000e2100001",
           *       "started_at": "2026-09-14T08:00:00.000Z"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** @constant */
            status: 'open';
            /** Format: uuid */
            agent_id: string;
            /** Format: uuid */
            device_id: string;
            /** Format: uuid */
            operational_unit_id?: string;
            /** Format: uuid */
            team_id?: string | null;
            /** Format: uuid */
            patrol_vehicle_id?: string | null;
            /** Format: uuid */
            operation_id?: string | null;
            /** Format: date-time */
            started_at?: string;
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
      /** @description Bloqueador de postura de dispositivo ou de perfil funcional (CTG-0002 §5.3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.AGENT_CREDENTIAL_EXPIRED'
              | 'TEAT.AGENT_NOT_ACTIVE'
              | 'TEAT.AGENT_NOT_IN_UNIT'
              | 'TEAT.APP_VERSION_NOT_ALLOWED'
              | 'TEAT.DEVICE_NOT_AUTHORIZED'
              | 'TEAT.DEVICE_NOT_HOMOLOGATED'
              | 'TEAT.DEVICE_TAMPER_DETECTED'
              | 'TEAT.FORBIDDEN_ACTION';
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
      /** @description Turno já aberto do agente, ou sessão não exclusiva. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.SESSION_NOT_EXCLUSIVE' | 'TEAT.SHIFT_ALREADY_OPEN';
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
      /** @description Nenhum pacote normativo publicado do órgão, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.NORMATIVE_PACKAGE_MISSING';
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
      /** @description protocol_version informado diverge da constante suportada. */
      426: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PROTOCOL_VERSION_UNSUPPORTED';
            /** @constant */
            status: 426;
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
  teatShiftClose: {
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
        'application/json': components['schemas']['CloseMobileShiftDto'];
      };
    };
    responses: {
      /** @description Turno fechado. */
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
            status: 'closed';
            /** Format: date-time */
            ended_at: string;
            reservations: {
              /** Format: uuid */
              id?: string;
              status?: string;
            }[];
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
      /** @description Turno fora de open. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.SHIFT_NOT_OPEN';
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
      /** @description Itens received pendentes sem reason, ou claimed_numbers fora de faixa, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.NUMBERING_RECONCILE_MISMATCH'
              | 'TEAT.SHIFT_CLOSE_PENDING_QUEUE';
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
  teatSessionHandoff: {
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
        'application/json': components['schemas']['HandoffSessionCommandDto'];
      };
    };
    responses: {
      /** @description Handoff registrado. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            handoff_id: string;
            /** Format: uuid */
            shift_id: string;
            /** Format: uuid */
            failed_device_id: string;
            /** Format: uuid */
            new_device_id?: string | null;
            cancelled_reservations?: string[];
            /** Format: date-time */
            handed_off_at: string;
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
      /** @description new_device_id informado e inapto. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.DEVICE_NOT_AUTHORIZED'
              | 'TEAT.DEVICE_TAMPER_DETECTED'
              | 'TEAT.FORBIDDEN_ACTION';
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
      /** @description Nenhum turno open do agente no failed_device_id. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.SHIFT_NOT_OPEN';
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
      /** @description reason ausente, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
  teatOpsStreamRead: {
    parameters: {
      query?: {
        /** @description Lista separada por vírgula dos type de CTG-0004 §7.2; default: todos os permitidos ao papel. */
        topics?: string;
      };
      header?: {
        /** @description Reenvia, em ordem, as linhas do tenant posteriores a este id, com created_at >= now() - 24h. */
        'Last-Event-ID'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Stream text/event-stream (heartbeat a cada 20s; payload por evento ≤ 8 KB). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/event-stream': string;
        };
      };
      /** @description Last-Event-ID fora da janela de replay de 24h. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
      /** @description Papel sem a chave ops:stream:read. */
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
    };
  };
  teatIntegrationOutboxList: {
    parameters: {
      query?: {
        system?: 'renainf' | 'renach' | 'renaest' | 'sne';
        status?: 'pending' | 'processing' | 'acked' | 'error';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Itens da outbox, ordem created_at desc, id. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: {
              /** Format: uuid */
              id?: string;
              topic?: string;
              aggregate_type?: string;
              /** Format: uuid */
              aggregate_id?: string;
              status?: string;
              attempts?: number;
              last_error?: string | null;
              /** Format: date-time */
              available_at?: string;
              /** Format: date-time */
              dispatched_at?: string | null;
              /** Format: date-time */
              completed_at?: string | null;
              /** Format: date-time */
              created_at?: string;
            }[];
            nextCursor?: string | null;
          };
        };
      };
      /** @description system fora dos quatro sistemas aceitos. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID';
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
  teatIntegrationItemRetry: {
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
    requestBody?: never;
    responses: {
      /** @description Item reenfileirado. */
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
            /** @constant */
            status: 'pending';
            attempts: number;
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
      /** @description Item fora de status=error. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.INTEGRATION_ITEM_NOT_FAILED';
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
  teatIntegrationHealth: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Configuração e contagem da fila. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            provider: string;
            baseUrl: string;
            systems: ('renainf' | 'renach' | 'renaest' | 'sne')[];
            queue: {
              pending?: number;
              processing?: number;
              error?: number;
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
