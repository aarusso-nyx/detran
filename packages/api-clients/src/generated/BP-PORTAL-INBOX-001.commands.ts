// Generated from docs/framework/contracts/BP-PORTAL-INBOX-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/inbox': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista a caixa do cidadão. */
    get: operations['portalInboxList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/inbox/{id}/read': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Marca um item da caixa como lido (evidência de ciência para itens SNE). */
    post: operations['portalInboxItemRead'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/sne/enrollment': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê a adesão ao SNE do sujeito da sessão. */
    get: operations['portalSneEnrollmentGet'];
    put?: never;
    /** Adere ao SNE (requer nível avançado, e-mail ou celular). */
    post: operations['portalSneEnrollmentCreate'];
    /** Cancela a adesão ao SNE. */
    delete: operations['portalSneEnrollmentDelete'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/push-subscriptions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra uma assinatura Web Push do sujeito. */
    post: operations['portalPushSubscriptionCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Fluxo SSE de eventos do sujeito da sessão (inbox.item, request.changed, decision.published, payment.confirmed); replay 24h por Last-Event-ID (CTG-0002 §2.7, §9). */
    get: operations['portalStreamRead'];
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
    SneEnrollmentCreateDto: {
      /** Format: email */
      email?: string;
      phone?: string;
      /** @enum {string} */
      channel?: 'push' | 'email' | 'sne';
      consent: {
        textVersion: string;
        effectsAck: (
          'ciencia_ficta' | 'canal_exclusivo' | 'desconto_60' | 'cancelamento'
        )[];
      };
    };
    SneEnrollmentCancelDto: {
      reason?: string;
    };
    PushSubscriptionCreateDto: {
      /** Format: uri */
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
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
  portalInboxList: {
    parameters: {
      query?: {
        kind?: 'acao_necessaria' | 'informativo';
        read?: 'true' | 'false';
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Página de itens da caixa. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [
           *         {
           *           "id": "00000000-0000-7000-8000-000070c00001",
           *           "kind": "acao_necessaria",
           *           "category": "SNE",
           *           "source": "sne",
           *           "subject": "Notificação de autuação disponível",
           *           "summary": "fixture",
           *           "aitId": "00000000-0000-7000-8000-0000f0000002",
           *           "requestId": null,
           *           "availableOn": "2026-09-01",
           *           "readOn": null,
           *           "fictitiousAcknowledgementOn": "2026-10-01",
           *           "deadline": {
           *             "dueOn": "2026-10-01",
           *             "ownedBy": "citizen"
           *           }
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
              id?: string;
              /** @enum {string} */
              kind?: 'acao_necessaria' | 'informativo';
              /** @enum {string} */
              category?: 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';
              /** @enum {string} */
              source?: 'sne' | 'portal';
              subject?: string;
              summary?: string;
              /** Format: uuid */
              aitId?: string | null;
              /** Format: uuid */
              requestId?: string | null;
              /** Format: date */
              availableOn?: string;
              /** Format: date */
              readOn?: string | null;
              /** Format: date */
              fictitiousAcknowledgementOn?: string | null;
              deadline?: {
                /** Format: date */
                dueOn?: string;
                /** @enum {string} */
                ownedBy?: 'citizen' | 'agency';
              } | null;
            }[];
            total: number;
            page: number;
            pageSize: number;
          };
        };
      };
      /** @description kind ou read fora do enum. */
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
  portalInboxItemRead: {
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
      /** @description Leitura registrada (idempotente). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-000070c00001",
           *       "readOn": "2026-09-14",
           *       "acknowledgementEvidence": {
           *         "acknowledgedAt": "2026-09-14T12:00:00-04:00",
           *         "displayedSha256": "0000000000000000000000000000000000000000000000000000000000000000"
           *       }
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: date */
            readOn: string;
            acknowledgementEvidence: {
              /** Format: date-time */
              acknowledgedAt?: string;
              displayedSha256?: string;
            } | null;
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
      /** @description kind='inbox_item'; de outro sujeito ou inexistente. */
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
  portalSneEnrollmentGet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Estado da adesão (enrolled=false com valores nulos quando sem linha). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "enrolled": true,
           *       "since": "2026-08-01T12:00:00-04:00",
           *       "channel": "email",
           *       "cancelable": true
           *     }
           */
          'application/json': {
            enrolled: boolean;
            /** Format: date-time */
            since: string | null;
            /** @enum {string|null} */
            channel: 'push' | 'email' | 'sne' | null;
            cancelable: boolean;
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
  portalSneEnrollmentCreate: {
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
         *       "email": "prata@fixtures.invalid",
         *       "channel": "email",
         *       "consent": {
         *         "textVersion": "1",
         *         "effectsAck": [
         *           "ciencia_ficta",
         *           "canal_exclusivo",
         *           "desconto_60",
         *           "cancelamento"
         *         ]
         *       }
         *     }
         */
        'application/json': components['schemas']['SneEnrollmentCreateDto'];
      };
    };
    responses: {
      /** @description Aderido. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "enrolled": true,
           *       "since": "2026-08-01T12:00:00-04:00",
           *       "channel": "email",
           *       "cancelable": true
           *     }
           */
          'application/json': {
            /** @constant */
            enrolled: true;
            /** Format: date-time */
            since: string;
            channel: string | null;
            /** @constant */
            cancelable: true;
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
      /** @description Nível abaixo de 'avancada'. */
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
      /** @description Já aderido, ou corpo divergente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY'
              | 'PORTAL.SNE_ALREADY_ENROLLED';
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
      /** @description email e phone ambos ausentes. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.SNE_CONTACT_REQUIRED';
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
  portalSneEnrollmentDelete: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: {
      content: {
        /** @example {} */
        'application/json': components['schemas']['SneEnrollmentCancelDto'];
      };
    };
    responses: {
      /** @description Cancelado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "enrolled": false,
           *       "since": null,
           *       "channel": "email",
           *       "cancelable": false,
           *       "cancelledAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            /** @constant */
            enrolled: false;
            since: null;
            channel: string | null;
            /** @constant */
            cancelable: false;
            /** Format: date-time */
            cancelledAt: string;
          };
        };
      };
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
      /** @description Nível abaixo de 'avancada'. */
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
      /** @description Sem linha ou já NAO_ADERIDO_SNE. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.SNE_NOT_ENROLLED';
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
  portalPushSubscriptionCreate: {
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
         *       "endpoint": "https://push.fixtures.invalid/endpoint-1",
         *       "keys": {
         *         "p256dh": "fixture-p256dh",
         *         "auth": "fixture-auth"
         *       }
         *     }
         */
        'application/json': components['schemas']['PushSubscriptionCreateDto'];
      };
    };
    responses: {
      /** @description Assinatura registrada (upsert por endpoint). */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-000071400001",
           *       "endpoint": "https://push.fixtures.invalid/endpoint-1",
           *       "createdAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            endpoint: string;
            /** Format: date-time */
            createdAt: string;
          };
        };
      };
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
  portalStreamRead: {
    parameters: {
      query?: {
        /** @description Lista separada por vírgula ⊆ PORTAL_STREAM_TYPES (inbox.item, request.changed, decision.published, payment.confirmed); tipo desconhecido é ignorado. */
        topics?: string;
      };
      header?: {
        /** @description Reenvia, em ordem, os eventos do escopo do sujeito posteriores a este id, com created_at >= now() - 24h (rait-events-sse-contract.md §1). */
        'Last-Event-ID'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Stream text/event-stream (envelope de rait-events-sse-contract.md §1; escopo = cpf_hash + subject.id do sujeito da sessão; heartbeat periódico). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/event-stream': string;
        };
      };
      /** @description Last-Event-ID existe e está fora da janela de replay de 24h (id anterior a now() - 24h). */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
}
