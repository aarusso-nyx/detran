// Generated from docs/framework/contracts/BP-PORTAL-REQUESTS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista os pedidos do sujeito da sessão. */
    get: operations['portalRequestList'];
    put?: never;
    /** Abre um pedido (verifica catálogo, alvo da delegação e vínculo). */
    post: operations['portalRequestCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Grava (nova versão de) o rascunho do ato em PEDIDO_EM_COMPOSICAO. */
    put: operations['portalRequestDraftUpdate'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/attachments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Inicia o upload assinado de um anexo do rascunho. */
    post: operations['portalRequestAttachmentCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/attachments/{attachmentId}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Confirma a conclusão do upload de um anexo. */
    post: operations['portalRequestAttachmentComplete'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/submit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Protocola imediatamente e delega o pedido ao domínio dono (M8). */
    post: operations['portalRequestSubmit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/withdraw': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Desiste do pedido antes do protocolo, ou em pendência interna. */
    post: operations['portalRequestWithdraw'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê o detalhe do pedido (timeline, prazos, ações disponíveis). */
    get: operations['portalRequestGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/receipt': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Recibo do protocolo em PDF assinado (pendente, ADR-0018). */
    get: operations['portalRequestReceiptGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/decision': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê a decisão publicada para o pedido (projeção process_timeline). */
    get: operations['portalRequestDecisionGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/diligences/{did}/responses': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Responde a uma diligência do caso RAIT (delegação R-0007). */
    post: operations['portalRequestDiligenceRespond'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/requests/{id}/evaluation': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Avalia o atendimento do pedido concluído. */
    post: operations['portalRequestEvaluate'];
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
    RequestCreateDto: {
      serviceKey: string;
      /** @enum {string} */
      targetKind: 'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
      /** Format: uuid */
      targetId?: string;
      /** @constant */
      channel: 'portal';
    };
    /** @description Corpo do ato por serviceKey (portal-route-contract.md §5.1; ver docs/framework/schemas/portal-request-draft.schema.json). */
    RequestDraftUpdateDto:
      | {
          facts: string;
          grounds: string;
          attachmentIds: string[];
          /** @enum {string} */
          requestType: 'cancelamento' | 'outro';
        }
      | {
          grounds: string;
          attachmentIds: string[];
        }
      | {
          additionalText?: string;
          attachmentIds: string[];
        }
      | {
          driver: {
            cpf: string;
            cnhNumber: string;
            cnhUf: string;
            category: string;
            name: string;
          };
          signatures: {
            /** @enum {string} */
            owner: 'govbr' | 'upload';
            /** @enum {string} */
            driver: 'govbr' | 'upload' | 'pending';
          };
          consequenceAck: {
            textVersion: string;
            /** Format: date-time */
            acceptedAt: string;
          };
        }
      | {
          /** @enum {string} */
          tier:
            | 'desconto_80'
            | 'desconto_60_reconhecimento'
            | 'desconto_40_fora_sne'
            | 'integral_juros';
          /** @enum {string} */
          method: 'pix' | 'debito' | 'boleto' | 'cartao';
          installments?: number;
          waiverAck?: {
            textVersion?: string;
            /** Format: date-time */
            acceptedAt?: string;
          };
        }
      | {
          /** Format: email */
          email?: string;
          phone?: string;
          consent: {
            textVersion: string;
            effectsAck: (
              | 'ciencia_ficta'
              | 'canal_exclusivo'
              | 'desconto_60'
              | 'cancelamento'
            )[];
          };
        }
      | {
          reason?: string;
        }
      | {
          /** Format: uuid */
          examId: string;
          reason: string;
          attachmentIds: string[];
        }
      | {
          /** @enum {string} */
          scope:
            'confirmacao' | 'declaracao_completa' | 'correcao' | 'eliminacao';
          fields?: string[];
        }
      | Record<string, never>
      | Record<string, never>
      | Record<string, never>
      | Record<string, never>
      | Record<string, never>;
    RequestAttachmentCreateDto: {
      filename: string;
      mimeType: string;
      sizeBytes: number;
      sha256: string;
    };
    RequestSubmitDto: {
      signature: {
        /** @enum {string} */
        method: 'govbr' | 'upload';
        signatureRef: string;
      };
      consequenceAck?: {
        textVersion: string;
        /** Format: date-time */
        acceptedAt: string;
      };
    };
    RequestWithdrawDto: {
      /** @constant */
      confirm: true;
      reason?: string;
    };
    RequestDiligenceRespondDto: {
      text: string;
      attachmentIds: string[];
    };
    RequestEvaluateDto: {
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
  portalRequestList: {
    parameters: {
      query?: {
        /** @description Um dos 13 tokens de WF-PORTAL-001. */
        state?: string;
        /** @description serviceKey (literal). */
        kind?: string;
        /** @description 'YYYY-MM-DD,YYYY-MM-DD' no fuso do tenant. */
        period?: string;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Página de pedidos. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "items": [
           *         {
           *           "requestId": "00000000-0000-7000-8000-000070400009",
           *           "protocol": "AM-FIXTURES-2026-0000002",
           *           "serviceKey": "adesao_sne",
           *           "targetLabel": null,
           *           "situation": "EM_ANDAMENTO_NO_ORGAO",
           *           "nextAction": {
           *             "by": "agency",
           *             "label": "portal.requests.nextAction.EM_ANDAMENTO_NO_ORGAO",
           *             "dueOn": null
           *           },
           *           "updatedAt": "2026-09-14T12:00:00-04:00"
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
              requestId?: string;
              protocol?: string | null;
              serviceKey?: string | null;
              targetLabel?: string | null;
              situation?: string;
              nextAction?: {
                /** @enum {string} */
                by?: 'citizen' | 'agency' | 'none';
                label?: string;
                /** Format: date */
                dueOn?: string | null;
              };
              /** Format: date-time */
              updatedAt?: string;
            }[];
            total: number;
            page: number;
            pageSize: number;
          };
        };
      };
      /** @description state fora do enum, ou period malformado. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.ENUM_INVALID' | 'PORTAL.VALIDATION_FAILED';
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
  portalRequestCreate: {
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
         *       "serviceKey": "consulta_multas",
         *       "targetKind": "none",
         *       "channel": "portal"
         *     }
         */
        'application/json': components['schemas']['RequestCreateDto'];
      };
    };
    responses: {
      /** @description Pedido criado em PEDIDO_EM_COMPOSICAO. */
      201: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "requestId": "00000000-0000-7000-8000-000070400005",
           *       "state": "PEDIDO_EM_COMPOSICAO",
           *       "prefilled": {},
           *       "requirements": [
           *         "Conta gov.br"
           *       ],
           *       "minimumAssurance": "avancada",
           *       "version": 1
           *     }
           */
          'application/json': {
            /** Format: uuid */
            requestId: string;
            /** @constant */
            state: 'PEDIDO_EM_COMPOSICAO';
            prefilled: {
              [key: string]: unknown;
            };
            requirements: string[];
            /** @enum {string} */
            minimumAssurance: 'none' | 'simples' | 'avancada' | 'qualificada';
            /** @constant */
            version: 1;
          };
        };
      };
      /** @description Corpo fora da forma, Idempotency-Key ausente, ou targetId ausente/presente incoerente com targetKind. */
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
      /** @description kind='service' (catálogo) ou kind=targetKind (vínculo). */
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
      /** @description Corpo divergente para a mesma chave, ou já existe rascunho aberto do mesmo ato/alvo. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY'
              | 'PORTAL.REQUEST_DRAFT_EXISTS';
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
      /** @description Serviço indisponível/com rota própria, ou alvo sem vínculo comprovável. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.ENTITLEMENT_REQUIRED'
              | 'PORTAL.INELIGIBLE'
              | 'PORTAL.SERVICE_UNAVAILABLE';
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
  portalRequestDraftUpdate: {
    parameters: {
      query?: never;
      header: {
        /** @description "<portal.request.version>"; ausente → 428; divergente → 412. */
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
        /** @example {} */
        'application/json': components['schemas']['RequestDraftUpdateDto'];
      };
    };
    responses: {
      /** @description Rascunho gravado. */
      200: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "requestId": "00000000-0000-7000-8000-000070400005",
           *       "version": 2,
           *       "savedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            requestId: string;
            version: number;
            /** Format: date-time */
            savedAt: string;
          };
        };
      };
      /** @description Corpo fora da forma do ato. */
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
      /** @description kind='request'; de outro sujeito ou inexistente. */
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
      /** @description Pedido fora de PEDIDO_EM_COMPOSICAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.REQUEST_STATE_INVALID';
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
      /** @description If-Match divergente. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.VERSION_CONFLICT';
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
  portalRequestAttachmentCreate: {
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
         *       "filename": "documento.pdf",
         *       "mimeType": "application/pdf",
         *       "sizeBytes": 102400,
         *       "sha256": "0000000000000000000000000000000000000000000000000000000000000000"
         *     }
         */
        'application/json': components['schemas']['RequestAttachmentCreateDto'];
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
      /** @description kind='request'. */
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
      /** @description Pedido fora de PEDIDO_EM_COMPOSICAO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.REQUEST_STATE_INVALID';
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
  portalRequestAttachmentComplete: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        id: string;
        attachmentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description attachmentId não é uuid. */
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
      /** @description kind='request'. */
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
  portalRequestSubmit: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
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
         *       "signature": {
         *         "method": "govbr",
         *         "signatureRef": "fixture-signature-ref"
         *       },
         *       "consequenceAck": {
         *         "textVersion": "1",
         *         "acceptedAt": "2026-09-14T12:00:00-04:00"
         *       }
         *     }
         */
        'application/json': components['schemas']['RequestSubmitDto'];
      };
    };
    responses: {
      /** @description Protocolado e delegado (ou RESULTADO_DISPONIVEL/AVALIACAO_OFERECIDA para alvos de leitura). */
      200: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "requestId": "00000000-0000-7000-8000-00007040000c",
           *       "state": "EM_ANDAMENTO_NO_ORGAO",
           *       "protocol": {
           *         "number": "AM-FIXTURES-2026-0000005",
           *         "issuedAt": "2026-09-05T12:00:00-04:00",
           *         "channel": "portal",
           *         "receiptHash": "0000000000000000000000000000000000000000000000000000000000000000"
           *       },
           *       "delegation": {
           *         "status": "delegated",
           *         "externalId": "00000000-0000-7000-8000-000070e00001"
           *       },
           *       "version": 2
           *     }
           */
          'application/json': {
            /** Format: uuid */
            requestId: string;
            /** @enum {string} */
            state: 'EM_ANDAMENTO_NO_ORGAO' | 'AVALIACAO_OFERECIDA';
            protocol: {
              number?: string;
              /** Format: date-time */
              issuedAt?: string;
              /** @constant */
              channel?: 'portal';
              receiptHash?: string;
            };
            delegation: {
              /** @enum {string} */
              status?: 'delegated' | 'not_applicable';
              externalId?: string | null;
            };
            version: number;
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
      /** @description Nível insuficiente (estado persistido). */
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
      /** @description kind='request'. */
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
      /** @description Pedido fora de PEDIDO_EM_COMPOSICAO/AGUARDANDO_NIVEL_ASSINATURA, ou corpo divergente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
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
      /** @description Ato com consequência sem consequenceAck (ex.: adesao_sne). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.REQUEST_CONSEQUENCE_ACK_REQUIRED';
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
      /** @description Domínio dono recusou; protocolo mantido (M8). */
      502: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.DELEGATION_FAILED';
            /** @constant */
            status: 502;
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
  portalRequestWithdraw: {
    parameters: {
      query?: never;
      header: {
        /** @description "<portal.request.version>"; ausente → 428; divergente → 412. */
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
         *       "confirm": true
         *     }
         */
        'application/json': components['schemas']['RequestWithdrawDto'];
      };
    };
    responses: {
      /** @description Pedido desistido. */
      200: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "requestId": "00000000-0000-7000-8000-00007040000c",
           *       "state": "DESISTIDO",
           *       "withdrawnAt": "2026-09-10T12:00:00-04:00",
           *       "version": 2
           *     }
           */
          'application/json': {
            /** Format: uuid */
            requestId: string;
            /** @constant */
            state: 'DESISTIDO';
            /** Format: date-time */
            withdrawnAt: string;
            version: number;
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
      /** @description kind='request'. */
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
      /** @description Pedido fora de PEDIDO_EM_COMPOSICAO/AGUARDANDO_NIVEL_ASSINATURA/AGUARDANDO_PAGAMENTO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.REQUEST_STATE_INVALID';
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
      /** @description If-Match divergente. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'PORTAL.VERSION_CONFLICT';
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
  portalRequestGet: {
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
      /** @description Detalhe do pedido. */
      200: {
        headers: {
          /** @description "<request.version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "request": {
           *         "requestId": "00000000-0000-7000-8000-000070400009",
           *         "state": "EM_ANDAMENTO_NO_ORGAO",
           *         "serviceKey": "adesao_sne",
           *         "targetKind": "none",
           *         "targetId": null,
           *         "channel": "portal",
           *         "minimumAssurance": "avancada",
           *         "delegation": {
           *           "status": "delegated",
           *           "domain": "portal",
           *           "command": "portal:sne-enrollment:enroll",
           *           "externalId": "00000000-0000-7000-8000-000070e00001",
           *           "error": null
           *         },
           *         "protocol": {
           *           "number": "AM-FIXTURES-2026-0000002",
           *           "issuedAt": "2026-09-02T12:00:00-04:00",
           *           "channel": "portal",
           *           "receiptHash": "0000000000000000000000000000000000000000000000000000000000000000"
           *         },
           *         "draft": null,
           *         "withdrawnAt": null,
           *         "createdAt": "2026-09-02T12:00:00-04:00",
           *         "updatedAt": "2026-09-02T12:00:00-04:00",
           *         "version": 1
           *       },
           *       "timeline": [],
           *       "deadlines": [],
           *       "documents": [],
           *       "diligences": [],
           *       "decision": null,
           *       "actions": {
           *         "canRespondDiligence": false,
           *         "canWithdraw": false,
           *         "withdrawalBlockedReason": "estado_nao_admite",
           *         "canAppeal": false,
           *         "nextInstanceServiceKey": null
           *       }
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
      /** @description kind='request'. */
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
  portalRequestReceiptGet: {
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
      /** @description kind='request' ou kind='protocol'. */
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
  portalRequestDecisionGet: {
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
      /** @description Decisão 1:1 da projeção. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "outcome": "deferido",
           *       "summary": null,
           *       "publishedOn": "2026-09-10",
           *       "documentUrl": null,
           *       "nextStep": {
           *         "kind": "none",
           *         "serviceKey": null,
           *         "dueOn": null
           *       },
           *       "refundDue": false,
           *       "finalInstance": true
           *     }
           */
          'application/json': {
            outcome?: string;
            summary?: null;
            /** Format: date */
            publishedOn?: string;
            documentUrl?: null;
            nextStep?: {
              [key: string]: unknown;
            };
            refundDue?: boolean;
            finalInstance?: boolean;
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
      /** @description kind='decision'; ausente ou decision_json null. */
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
  portalRequestDiligenceRespond: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
      };
      path: {
        id: string;
        did: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "text": "Resposta (fixture)",
         *       "attachmentIds": []
         *     }
         */
        'application/json': components['schemas']['RequestDiligenceRespondDto'];
      };
    };
    responses: {
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
      /** @description kind='request'. */
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
      /** @description Pedido fora de EM_ANDAMENTO_NO_ORGAO, ou corpo divergente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
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
      /** @description unavailableReason 'delegacao_indisponivel_r0007' (inf:rait-case:answer-inquiry). */
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
  portalRequestEvaluate: {
    parameters: {
      query?: never;
      header: {
        'Idempotency-Key': string;
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
         *       "scores": {
         *         "satisfaction": 5,
         *         "quality": 5,
         *         "deadline": 5,
         *         "clarity": 5,
         *         "channel": 5
         *       }
         *     }
         */
        'application/json': components['schemas']['RequestEvaluateDto'];
      };
    };
    responses: {
      /** @description Avaliação registrada; pedido concluído. */
      201: {
        headers: {
          /** @description "<version>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "evaluationId": "00000000-0000-7000-8000-000071100001",
           *       "requestId": "00000000-0000-7000-8000-00007040000b",
           *       "state": "CONCLUIDO",
           *       "submittedAt": "2026-09-14T12:00:00-04:00"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            evaluationId: string;
            /** Format: uuid */
            requestId: string;
            /** @constant */
            state: 'CONCLUIDO';
            /** Format: date-time */
            submittedAt: string;
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
      /** @description kind='request'. */
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
      /** @description Pedido fora de AVALIACAO_OFERECIDA, avaliação já existente, ou corpo divergente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'PORTAL.EVALUATION_ALREADY_SUBMITTED'
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
}
