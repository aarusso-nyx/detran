// Generated from docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/aits': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista autuações do sujeito (e representados) na projeção infraction_view. */
    get: operations['portalAitList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/aits/{aitId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o detalhe de uma autuação (vínculo obrigatório). */
    get: operations['portalAitGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/aits/{aitId}/points': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o status de pontuação de uma autuação (points nulo nesta rodada — OD-P34). */
    get: operations['portalAitPointsGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/points-summary': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Resumo de pontuação do sujeito (points_view). */
    get: operations['portalPointsSummaryGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/documents/cnh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê a CNH digital do sujeito (leitura nacional cacheada). */
    get: operations['portalDocumentCnhGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista os veículos do sujeito (leitura nacional cacheada, sem máscara de RENAVAM). */
    get: operations['portalVehicleList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/vehicles/{id}/clearance': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê débitos/restrições do veículo (porta sem operação nesta rodada — OD-P21). */
    get: operations['portalVehicleClearanceGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/vehicles/{id}/crlv-e': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Emite o CRLV-e (documento assinado pendente — ADR-0018). */
    post: operations['portalVehicleCrlvIssue'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/crashes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista sinistros do sujeito (projeção BOAT; produtor real R-0010). */
    get: operations['portalCrashList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/crashes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o detalhe de um sinistro (vínculo obrigatório). */
    get: operations['portalCrashGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/exams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista exames do sujeito (projeção PEC; rótulo legal, nunca CONDICIONADO). */
    get: operations['portalExamList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/exams/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o detalhe de um exame (vínculo obrigatório). */
    get: operations['portalExamGet'];
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
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  portalAitList: {
    parameters: {
      query?: {
        /** @description Placa (comparação literal com plate). */
        vehicle?: string;
        /** @description situation (fora do enum → 400 ENUM_INVALID). */
        status?: string;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Página de autuações. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [
           *         {
           *           "aitId": "00000000-0000-7000-8000-0000f0000002",
           *           "aitNumber": "FIX-0000001",
           *           "plate": "FIX2E01",
           *           "occurredAt": "2026-05-01T12:00:00-04:00",
           *           "framingLabel": "fixture",
           *           "amount": 195.23,
           *           "situation": "aguardando_defesa",
           *           "deadlines": [],
           *           "pointsStatus": "none",
           *           "actions": []
           *         }
           *       ],
           *       "total": 1,
           *       "page": 1,
           *       "pageSize": 20
           *     }
           */
          'application/json': {
            items: {
              /** Format: uuid */
              aitId?: string;
              aitNumber?: string;
              plate?: string;
              /** Format: date-time */
              occurredAt?: string;
              framingLabel?: string;
              amount?: number | null;
              /** @enum {string} */
              situation?:
                | 'aguardando_defesa'
                | 'em_defesa'
                | 'penalidade_aplicada'
                | 'em_recurso'
                | 'encerrada'
                | 'cancelada'
                | 'arquivada';
              deadlines?: {
                [key: string]: unknown;
              }[];
              /** @enum {string} */
              pointsStatus?: 'em_disputa' | 'definitivo' | 'none';
              actions?: {
                [key: string]: unknown;
              }[];
            }[];
            total: number;
            page: number;
            pageSize: number;
          };
        };
      };
      /** @description status fora do enum. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.ENUM_INVALID';
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
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.INTERNAL';
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
  portalAitGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        aitId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Detalhe da autuação. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "aitId": "00000000-0000-7000-8000-0000f0000002",
           *       "aitNumber": "FIX-0000001",
           *       "plate": "FIX2E01",
           *       "occurredAt": "2026-05-01T12:00:00-04:00",
           *       "framingLabel": "fixture",
           *       "amount": 195.23,
           *       "situation": "aguardando_defesa",
           *       "deadlines": [],
           *       "pointsStatus": "none",
           *       "actions": [],
           *       "notices": [],
           *       "payment": {
           *         "tiers": [],
           *         "paid": false,
           *         "paidTier": null
           *       },
           *       "openRequestId": null,
           *       "evidenceAvailable": false
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      /** @description aitId não é uuid. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.VALIDATION_FAILED';
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
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='ait'; sem vínculo ou linha ausente na projeção. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
            code: 'PORTAL.INTERNAL';
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
  portalAitPointsGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        aitId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description pointsStatus da projeção; points sempre null (OD-P34). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "aitId": "00000000-0000-7000-8000-0000f0000002",
           *       "pointsStatus": "none",
           *       "points": null
           *     }
           */
          'application/json': {
            /** Format: uuid */
            aitId: string;
            /** @enum {string} */
            pointsStatus: 'em_disputa' | 'definitivo' | 'none';
            points: null;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='ait'. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
            code: 'PORTAL.INTERNAL';
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
  portalPointsSummaryGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Zero pontos quando sem linha (nunca 404 — UC-PORTAL-010). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "definitivePoints": 3,
           *       "disputedPoints": 4,
           *       "byVehicle": [],
           *       "last12Months": [],
           *       "cachedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            definitivePoints: number;
            disputedPoints: number;
            byVehicle: {
              [key: string]: unknown;
            }[];
            last12Months: {
              [key: string]: unknown;
            }[];
            /** Format: date-time */
            cachedAt: string | null;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.INTERNAL';
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
  portalDocumentCnhGet: {
    parameters: {
      query?: {
        documentBytes?: 'true' | 'false';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Consulta informativa (RN-PORTAL-117), nunca o documento (category fixo). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "license": {
           *         "status": "valida"
           *       },
           *       "qrVerification": null,
           *       "documentBytes": null,
           *       "category": "C",
           *       "cachedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            license: {
              [key: string]: unknown;
            };
            qrVerification: null;
            documentBytes: null;
            /** @constant */
            category: 'C';
            /** Format: date-time */
            cachedAt: string;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'consulta_cnh'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description documentBytes=true → unavailableReason 'documento_assinado_pendente_r0014'. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.SERVICE_UNAVAILABLE';
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
            code: 'PORTAL.INTERNAL';
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
      /** @description Sem cache e CdtPort indisponível. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NATIONAL_READ_UNAVAILABLE';
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
  portalVehicleList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 1:1 do CdtPort.listCitizenVehicles (chaves OD-P36). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [],
           *       "cachedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            items: {
              [key: string]: unknown;
            }[];
            /** Format: date-time */
            cachedAt: string | null;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.INTERNAL';
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
      /** @description Sem cache e CdtPort indisponível. */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NATIONAL_READ_UNAVAILABLE';
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
  portalVehicleClearanceGet: {
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
      /** @description Forma do cache, quando houver linha (inserida por teste; sem produtor nesta rodada). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [],
           *       "restrictions": [],
           *       "suspendedEnforceability": [],
           *       "canIssue": true,
           *       "cachedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            items: {
              [key: string]: unknown;
            }[];
            restrictions: {
              [key: string]: unknown;
            }[];
            suspendedEnforceability: {
              [key: string]: unknown;
            }[];
            canIssue: boolean;
            /** Format: date-time */
            cachedAt: string;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Identidade sem claims válidas ou sem papel CIDADAO (guarda, CTG-0001 §3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.ASSURANCE_NOT_VERIFIED' | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='vehicle'; sem vínculo. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
            code: 'PORTAL.INTERNAL';
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
      /** @description Sem cache (nenhuma operação de ports.ts cobre débitos/restrições — OD-P21). */
      503: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NATIONAL_READ_UNAVAILABLE';
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
  portalVehicleCrlvIssue: {
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
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'emissao_crlv'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='vehicle'; sem vínculo. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
      /** @description unavailableReason 'documento_assinado_pendente_r0014'. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.SERVICE_UNAVAILABLE';
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
            code: 'PORTAL.INTERNAL';
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
  portalCrashList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sem produtor real nesta rodada: lista tipicamente vazia salvo linha de teste. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": []
           *     }
           */
          'application/json': {
            items: {
              /** Format: uuid */
              crashId?: string;
              stateLabel?: string;
              summary?: {
                [key: string]: unknown;
              };
              thirdPartyFieldsSuppressed?: boolean;
            }[];
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'consulta_bat'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.INTERNAL';
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
  portalCrashGet: {
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
      /** @description Detalhe (campo de terceiro suprimido, nunca a peça — RN-BOAT-126). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "crashId": "00000000-0000-7000-8000-00007ff00003",
           *       "stateLabel": "fixture",
           *       "summary": {},
           *       "thirdPartyFieldsSuppressed": true
           *     }
           */
          'application/json': {
            /** Format: uuid */
            crashId: string;
            stateLabel: string;
            summary: {
              [key: string]: unknown;
            };
            thirdPartyFieldsSuppressed: boolean;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'consulta_bat'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='crash'; sem vínculo ou linha ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
            code: 'PORTAL.INTERNAL';
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
  portalExamList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sem produtor real nesta rodada: lista tipicamente vazia salvo linha de teste. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": []
           *     }
           */
          'application/json': {
            items: {
              /** Format: uuid */
              examId?: string;
              legalLabel?: string;
              /** Format: date */
              validUntil?: string | null;
              /** Format: date */
              boardDueOn?: string | null;
            }[];
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'consulta_exame'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description Erro não catalogado. */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.INTERNAL';
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
  portalExamGet: {
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
      /** @description Detalhe do exame. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "examId": "00000000-0000-7000-8000-00007ff00002",
           *       "legalLabel": "fixture",
           *       "validUntil": null,
           *       "boardDueOn": null
           *     }
           */
          'application/json': {
            /** Format: uuid */
            examId: string;
            legalLabel: string;
            /** Format: date */
            validUntil: string | null;
            /** Format: date */
            boardDueOn: string | null;
          };
        };
      };
      /** @description Sem sessão (guarda, CTG-0001 §3). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.AUTH_REQUIRED';
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
      /** @description Nível abaixo de 'consulta_exame'. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ASSURANCE_INSUFFICIENT'
              | 'PORTAL.ASSURANCE_NOT_VERIFIED'
              | 'PORTAL.IDENTITY_NOT_CITIZEN';
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
      /** @description kind='exam'; sem vínculo ou linha ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.NOT_FOUND';
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
            code: 'PORTAL.INTERNAL';
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
