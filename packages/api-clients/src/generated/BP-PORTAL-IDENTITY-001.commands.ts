// Generated from docs/framework/contracts/BP-PORTAL-IDENTITY-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/identity/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê a conta do cidadão (upsert do sujeito) e os requisitos de nível por ato. */
    get: operations['portalMeGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/identity/assurance/elevations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Inicia a elevação de nível de assinatura (redirect gov.br). */
    post: operations['portalAssuranceElevationCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/identity/assurance/elevations/{id}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Completa a elevação de nível a partir do retorno gov.br. */
    post: operations['portalAssuranceElevationComplete'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/identity/representations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista as representações apresentadas pelo sujeito da sessão. */
    get: operations['portalRepresentationList'];
    put?: never;
    /** Registra procuração/representação apresentada pelo cidadão. */
    post: operations['portalRepresentationCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/identity/representations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revoga (não apaga) uma representação do sujeito da sessão. */
    delete: operations['portalRepresentationDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/identity/preferences': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Atualiza preferências de canal (push/email/sne). */
    put: operations['portalPreferencesUpdate'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/brand': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê a marca do tenant resolvido pelo Host (rota pública). */
    get: operations['portalBrandGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/services': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista a Carta de Serviços do tenant (rota pública). */
    get: operations['portalServiceList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/services/{serviceKey}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê um serviço da Carta de Serviços (rota pública). */
    get: operations['portalServiceGet'];
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
    AssuranceElevationCreateDto: {
      /** @constant */
      targetLevel: 'avancada';
      /** @enum {string} */
      method: 'biographic' | 'biometric' | 'icp';
      resumeRoute: string;
    };
    AssuranceElevationCompleteDto: {
      resumeToken: string;
    };
    RepresentationCreateDto: {
      representedCpf: string;
      representedName: string;
      /** Format: uuid */
      instrumentDocumentId: string;
      /** @enum {string} */
      scope: 'ait' | 'all';
      /** Format: date */
      validUntil?: string;
    };
    PreferencesUpdateDto: {
      /** @enum {string} */
      channel: 'push' | 'email' | 'sne';
      pushSubscription?: {
        /** Format: uri */
        endpoint?: string;
        keys?: {
          p256dh?: string;
          auth?: string;
        };
      };
    };
    ServiceCatalogItem: {
      serviceKey?: string;
      route?: string;
      category?: string;
      title?: string;
      summary?: string;
      requirements?: string[];
      deliveryChannel?: string;
      legalDeadline?: string;
      cost?: string;
      accessibilityNote?: string;
      responsibleParty?: string;
      normativeReference?: string;
      /** @enum {string} */
      availability?: 'available' | 'partially_available' | 'unavailable';
      unavailableReason?: string;
      alternativeChannelNote?: string | null;
      /** @enum {string} */
      minimumAssurance?: 'none' | 'simples' | 'avancada' | 'qualificada';
      version?: number;
      /** Format: date */
      effectiveFrom?: string;
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
  portalMeGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Conta do cidadão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "subjectId": "00000000-0000-7000-8000-000070000005",
           *       "cpf": "55555555555",
           *       "name": "Procurador (fixture)",
           *       "assuranceLevel": "avancada",
           *       "govbrLevelObservedAt": "2026-09-14T12:00:00-04:00",
           *       "actRequirements": [
           *         {
           *           "actKey": "consulta_multas",
           *           "minimumAssurance": "simples",
           *           "allowed": true
           *         },
           *         {
           *           "actKey": "defesa_previa",
           *           "minimumAssurance": "avancada",
           *           "allowed": true
           *         }
           *       ],
           *       "representations": [
           *         {
           *           "id": "00000000-0000-7000-8000-000070100001",
           *           "representedName": "Cidadã Prata (fixture)",
           *           "scope": "ait",
           *           "validUntil": "2027-09-14"
           *         }
           *       ],
           *       "preferences": null,
           *       "heldDataSummary": []
           *     }
           */
          'application/json': {
            /** Format: uuid */
            subjectId: string;
            cpf: string;
            name: string | null;
            /** @enum {string} */
            assuranceLevel: 'simples' | 'avancada' | 'qualificada';
            /** Format: date-time */
            govbrLevelObservedAt: string;
            actRequirements: {
              actKey: string;
              /** @enum {string} */
              minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
              allowed: boolean;
              reason?: string;
            }[];
            representations: {
              /** Format: uuid */
              id?: string;
              representedName?: string;
              /** @enum {string} */
              scope?: 'ait' | 'all';
              /** Format: date */
              validUntil?: string | null;
            }[];
            /** @description x-source-pending: @stynx-nyx/preferences não montado (CTG-0002 PUT preferences). */
            preferences: null;
            heldDataSummary: {
              [key: string]: unknown;
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
  portalAssuranceElevationCreate: {
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
         *       "targetLevel": "avancada",
         *       "method": "biographic",
         *       "resumeRoute": "/portal/requests"
         *     }
         */
        'application/json': components['schemas']['AssuranceElevationCreateDto'];
      };
    };
    responses: {
      /** @description Corpo fora da forma. */
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
      /** @description unavailableReason 'elevacao_govbr_pendente_r0014' (OD-P15). */
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
  portalAssuranceElevationComplete: {
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
         *       "resumeToken": "fixture-resume-token"
         *     }
         */
        'application/json': components['schemas']['AssuranceElevationCompleteDto'];
      };
    };
    responses: {
      /** @description id não é uuid, ou corpo fora da forma. */
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
      /** @description unavailableReason 'elevacao_govbr_pendente_r0014' (OD-P15). */
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
  portalRepresentationList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Representações do sujeito (todos os estados). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example [
           *       {
           *         "id": "00000000-0000-7000-8000-000070100001",
           *         "representedName": "Cidadã Prata (fixture)",
           *         "scope": "ait",
           *         "validUntil": "2027-09-14",
           *         "state": "PROCURACAO_VALIDADA",
           *         "refusalReason": null
           *       }
           *     ]
           */
          'application/json': {
            /** Format: uuid */
            id?: string;
            representedName?: string;
            /** @enum {string} */
            scope?: 'ait' | 'all';
            /** Format: date */
            validUntil?: string | null;
            /** @enum {string} */
            state?:
              | 'PROCURACAO_APRESENTADA'
              | 'PROCURACAO_VALIDADA'
              | 'PROCURACAO_RECUSADA';
            refusalReason?: string | null;
          }[];
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
  portalRepresentationCreate: {
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
         *       "representedCpf": "22222222222",
         *       "representedName": "Cidadã Prata (fixture)",
         *       "instrumentDocumentId": "00000000-0000-7000-8000-00007ff90001",
         *       "scope": "ait",
         *       "validUntil": "2027-09-14"
         *     }
         */
        'application/json': components['schemas']['RepresentationCreateDto'];
      };
    };
    responses: {
      /** @description Procuração apresentada (aguarda validação interna, OD-P37). */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-000070100001",
           *       "representedName": "Cidadã Prata (fixture)",
           *       "scope": "ait",
           *       "validUntil": "2027-09-14",
           *       "state": "PROCURACAO_APRESENTADA"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            representedName: string;
            /** @enum {string} */
            scope: 'ait' | 'all';
            /** Format: date */
            validUntil: string | null;
            /** @constant */
            state: 'PROCURACAO_APRESENTADA';
          };
        };
      };
      /** @description Corpo fora da forma, representedCpf = cpf do próprio sujeito, ou validUntil no passado. */
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
      /** @description Nível abaixo do exigido por 'procuracao'. */
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
  portalRepresentationDelete: {
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
      /** @description Representação revogada (valid_until = ontem). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-000070100001",
           *       "state": "PROCURACAO_VALIDADA",
           *       "validUntil": "2026-09-13"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            state: string;
            /** Format: date */
            validUntil: string;
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
      /** @description kind='representation'; id inexistente ou de outro sujeito. */
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
  portalPreferencesUpdate: {
    parameters: {
      query?: never;
      header: {
        /** @description "<portal.subject.version>"; ausente → 428 PORTAL.IF_MATCH_REQUIRED. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "channel": "email"
         *     }
         */
        'application/json': components['schemas']['PreferencesUpdateDto'];
      };
    };
    responses: {
      /** @description Corpo fora da forma. */
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
      /** @description unavailableReason 'preferences_substrato_pendente' (OD-P38). */
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
      /** @description If-Match ausente. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.IF_MATCH_REQUIRED';
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
  portalBrandGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Marca do tenant. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "displayName": "Portal DETRAN-AM (fixture)",
           *       "shortName": "DETRAN-AM",
           *       "legalName": "Departamento Estadual de Trânsito do Amazonas (fixture)",
           *       "primaryColor": "#0a5b8c",
           *       "supportUrl": "https://portal.detran-am.fixtures.invalid/suporte",
           *       "privacyUrl": "https://portal.detran-am.fixtures.invalid/privacidade",
           *       "accessibilityUrl": "https://portal.detran-am.fixtures.invalid/acessibilidade",
           *       "serviceContact": "atendimento@detran-am.fixtures.invalid",
           *       "locale": "pt-BR",
           *       "timeZone": "America/Manaus"
           *     }
           */
          'application/json': {
            displayName?: string;
            shortName?: string;
            legalName?: string;
            primaryColor?: string;
            supportUrl?: string;
            privacyUrl?: string;
            accessibilityUrl?: string;
            serviceContact?: string;
            locale?: string;
            timeZone?: string;
          };
        };
      };
      /** @description kind='brand'; tenant sem linha de marca. */
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
  portalServiceList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Carta de Serviços (15 na fixture: 9 available, 2 partially_available, 4 unavailable). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example [
           *       {
           *         "serviceKey": "consulta_multas",
           *         "route": "/servicos/consulta-multas",
           *         "category": "inf",
           *         "title": "Consulta de multas (fixture)",
           *         "summary": "Consulta de multas (fixture)",
           *         "requirements": [
           *           "Conta gov.br"
           *         ],
           *         "deliveryChannel": "portal",
           *         "legalDeadline": "source_pending (OD-P26)",
           *         "cost": "gratuito",
           *         "accessibilityNote": "Conforme declaração de acessibilidade (RN-PORTAL-113)",
           *         "responsibleParty": "DETRAN-AM",
           *         "normativeReference": "source_pending (OD-P26)",
           *         "availability": "available",
           *         "minimumAssurance": "simples",
           *         "version": 1,
           *         "effectiveFrom": "2026-01-01"
           *       }
           *     ]
           */
          'application/json': components['schemas']['ServiceCatalogItem'][];
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
  portalServiceGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        serviceKey: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Um serviço. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "serviceKey": "defesa_previa",
           *       "route": "/servicos/defesa-previa",
           *       "category": "inf",
           *       "title": "Defesa prévia (fixture)",
           *       "summary": "Defesa prévia (fixture)",
           *       "requirements": [
           *         "Conta gov.br",
           *         "Nível avançado (prata, ouro ou e-Notariado)"
           *       ],
           *       "deliveryChannel": "portal",
           *       "legalDeadline": "source_pending (OD-P26)",
           *       "cost": "gratuito",
           *       "accessibilityNote": "Conforme declaração de acessibilidade (RN-PORTAL-113)",
           *       "responsibleParty": "DETRAN-AM",
           *       "normativeReference": "source_pending (OD-P26)",
           *       "availability": "unavailable",
           *       "unavailableReason": "delegacao_indisponivel_r0007",
           *       "alternativeChannelNote": "Atendimento presencial ([REF-DETRANAM-SERVICOS])",
           *       "minimumAssurance": "avancada",
           *       "version": 1,
           *       "effectiveFrom": "2026-01-01"
           *     }
           */
          'application/json': components['schemas']['ServiceCatalogItem'];
        };
      };
      /** @description kind='service'; serviceKey inexistente no tenant. */
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
