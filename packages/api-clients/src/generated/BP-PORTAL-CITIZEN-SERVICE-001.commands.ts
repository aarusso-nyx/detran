// Generated from docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/manifestations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista as manifestações do sujeito da sessão. */
    get: operations['portalManifestationList'];
    put?: never;
    /** Registra manifestação (anônima ou identificada; nunca recusada — RN-PORTAL-109). */
    post: operations['portalManifestationCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/manifestations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o detalhe de uma manifestação do sujeito da sessão. */
    get: operations['portalManifestationGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/manifestations/{id}/acknowledge': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Dá ciência da decisão (CIENCIA_AO_USUARIO → ENCERRADA → AVALIACAO_OFERECIDA). */
    post: operations['portalManifestationAcknowledge'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/evaluations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Avalia um pedido ou manifestação concluídos. */
    post: operations['portalEvaluationCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/service-charter/{serviceKey}/deadline': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o prazo máximo declarado por um serviço (Lei 13.460 art. 7º §2º IV). */
    get: operations['portalServiceCharterDeadlineGet'];
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
    ManifestationCreateDto: {
      /** @enum {string} */
      kind: 'reclamacao' | 'denuncia' | 'sugestao' | 'elogio' | 'solicitacao';
      text?: string;
      confidential?: boolean;
      attachmentIds?: string[];
      anonymous?: boolean;
    };
    EvaluationCreateDto: {
      /** @enum {string} */
      subjectKind: 'request' | 'manifestation';
      /** Format: uuid */
      subjectId: string;
      scores: {
        satisfaction: number;
        quality: number;
        deadline: number;
        clarity: number;
        channel: number;
      };
      comment?: string;
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
  portalManifestationList: {
    parameters: {
      query?: {
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Manifestações do sujeito (anônimas não são listáveis). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [
           *         {
           *           "manifestationId": "00000000-0000-7000-8000-000070700008",
           *           "state": "AVALIACAO_OFERECIDA",
           *           "protocol": "AM-FIXTURES-2026-000000c",
           *           "kind": "reclamacao",
           *           "receivedAt": "2026-07-10T12:00:00-04:00",
           *           "deadlines": {
           *             "agencyDueOn": "2026-08-09",
           *             "extended": null
           *           },
           *           "decision": {
           *             "text": "fixture",
           *             "decidedAt": "2026-08-01T00:00:00-04:00"
           *           },
           *           "evaluationOffered": true,
           *           "evaluated": false
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
              manifestationId?: string;
              state?: string;
              protocol?: string;
              kind?: string;
              /** Format: date-time */
              receivedAt?: string;
              deadlines?: {
                /** Format: date */
                agencyDueOn?: string;
                extended?: Record<string, never> | null;
              };
              decision?: Record<string, never> | null;
              evaluationOffered?: boolean;
              evaluated?: boolean;
            }[];
            total: number;
            page: number;
            pageSize: number;
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
      /** @description Nível abaixo de 'acompanhar_manifestacao'. */
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
  portalManifestationCreate: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "kind": "reclamacao",
         *       "text": "Texto da manifestação (fixture)",
         *       "confidential": false,
         *       "anonymous": true
         *     }
         */
        'application/json': components['schemas']['ManifestationCreateDto'];
      };
    };
    responses: {
      /** @description Comprovante imediato (MANIFESTACAO_REGISTRADA → COMPROVANTE_EMITIDO na mesma transação). */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "manifestationId": "00000000-0000-7000-8000-000070700001",
           *       "protocol": "AM-FIXTURES-2026-000000e",
           *       "receivedAt": "2026-09-14T12:00:00-04:00",
           *       "state": "COMPROVANTE_EMITIDO",
           *       "agencyDueOn": "2026-10-14",
           *       "anonymous": true
           *     }
           */
          'application/json': {
            /** Format: uuid */
            manifestationId: string;
            protocol: string;
            /** Format: date-time */
            receivedAt: string;
            /** @constant */
            state: 'COMPROVANTE_EMITIDO';
            /** Format: date */
            agencyDueOn: string;
            anonymous: boolean;
          };
        };
      };
      /** @description kind ausente/fora da taxonomia, ou Idempotency-Key ausente. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'PORTAL.MANIFESTATION_KIND_INVALID' | 'PORTAL.VALIDATION_FAILED';
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
  portalManifestationGet: {
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
      /** @description Item da lista + text/confidential. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "manifestationId": "00000000-0000-7000-8000-000070700008",
           *       "state": "AVALIACAO_OFERECIDA",
           *       "protocol": "AM-FIXTURES-2026-000000c",
           *       "kind": "reclamacao",
           *       "receivedAt": "2026-07-10T12:00:00-04:00",
           *       "text": "Texto da manifestação (fixture)",
           *       "confidential": false
           *     }
           */
          'application/json': {
            [key: string]: unknown;
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
      /** @description Nível abaixo de 'acompanhar_manifestacao'. */
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
      /** @description kind='manifestation'. */
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
  portalManifestationAcknowledge: {
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
      /** @description Ciência registrada; avaliação oferecida. */
      200: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "manifestationId": "00000000-0000-7000-8000-000070700006",
           *       "state": "AVALIACAO_OFERECIDA",
           *       "acknowledgedAt": "2026-09-14T12:00:00-04:00",
           *       "evaluationOffered": true,
           *       "version": 2
           *     }
           */
          'application/json': {
            /** Format: uuid */
            manifestationId: string;
            /** @constant */
            state: 'AVALIACAO_OFERECIDA';
            /** Format: date-time */
            acknowledgedAt: string;
            /** @constant */
            evaluationOffered: true;
            version: number;
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
      /** @description Nível abaixo de 'acompanhar_manifestacao'. */
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
      /** @description kind='manifestation'. */
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
      /** @description Fora de CIENCIA_AO_USUARIO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.MANIFESTATION_STATE_INVALID';
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
  portalEvaluationCreate: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "subjectKind": "manifestation",
         *       "subjectId": "00000000-0000-7000-8000-000070700008",
         *       "scores": {
         *         "satisfaction": 5,
         *         "quality": 5,
         *         "deadline": 5,
         *         "clarity": 5,
         *         "channel": 5
         *       }
         *     }
         */
        'application/json': components['schemas']['EvaluationCreateDto'];
      };
    };
    responses: {
      /** @description Avaliação registrada. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "evaluationId": "00000000-0000-7000-8000-000071100002",
           *       "subjectKind": "manifestation",
           *       "subjectId": "00000000-0000-7000-8000-000070700008",
           *       "state": "AVALIADA",
           *       "submittedAt": "2026-09-14T12:00:00-04:00",
           *       "publicNotice": "portal.evaluations.publicIndicator"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            evaluationId: string;
            /** @enum {string} */
            subjectKind: 'request' | 'manifestation';
            /** Format: uuid */
            subjectId: string;
            /** @enum {string} */
            state: 'AVALIADA' | 'CONCLUIDO';
            /** Format: date-time */
            submittedAt: string;
            /** @constant */
            publicNotice: 'portal.evaluations.publicIndicator';
          };
        };
      };
      /** @description Corpo fora da forma, ou Idempotency-Key ausente. */
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
      /** @description Nível abaixo de 'avaliar'. */
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
      /** @description kind='manifestation' (ownership). */
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
      /** @description Fora de AVALIACAO_OFERECIDA, avaliação já existente, ou corpo divergente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.EVALUATION_ALREADY_SUBMITTED'
              | 'PORTAL.EVALUATION_NOT_OFFERED'
              | 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY'
              | 'PORTAL.REQUEST_STATE_INVALID';
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
  portalServiceCharterDeadlineGet: {
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
      /** @description Prazo do serviço. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "serviceKey": "consulta_multas",
           *       "legalDeadline": "source_pending (OD-P26)",
           *       "normativeReference": "source_pending (OD-P26)",
           *       "availability": "available"
           *     }
           */
          'application/json': {
            serviceKey: string;
            legalDeadline: string;
            normativeReference: string;
            /** @enum {string} */
            availability: 'available' | 'partially_available' | 'unavailable';
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
      /** @description kind='service'. */
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
