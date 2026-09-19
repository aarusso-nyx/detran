// Generated from docs/framework/contracts/BP-OPS-EVIDENCE-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/evidence/upload-intents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Inicia o upload de uma evidência (pending_upload). */
    post: operations['teatEvidenceInitiateUpload'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/{id}/complete-upload': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Completa o upload da evidência (pending_upload → uploaded). */
    post: operations['teatEvidenceCompleteUpload'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/{id}/validate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Valida (ou rejeita) a evidência enviada. */
    post: operations['teatEvidenceValidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/{id}/links': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Vincula a evidência a uma entidade. */
    post: operations['teatEvidenceLink'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/{id}/custody-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra um evento de custódia da evidência. */
    post: operations['teatEvidenceCustodyEventAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/probative-packages/generate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Gera o pacote probatório de uma entidade. */
    post: operations['teatProbativePackageGenerate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/maintenance/purge-expired-unverified': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Purga evidências pending_upload com intenção expirada (job). */
    post: operations['teatEvidencePurgeUnverified'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/evidence': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista evidências (projeção de bodycam aplicada). */
    get: operations['teatEvidenceList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/evidence/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lê uma evidência por id (projeção de bodycam aplicada). */
    get: operations['teatEvidenceGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence-access-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cria um pedido de acesso a conteúdo de evidência restrita. */
    post: operations['teatEvidenceAccessRequestCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence-access-requests/{id}/approve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Aprova o pedido de acesso (requested → approved). */
    post: operations['teatEvidenceAccessRequestApprove'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence-access-requests/{id}/deny': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Nega o pedido de acesso (requested → denied). */
    post: operations['teatEvidenceAccessRequestDeny'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence-access-requests/{id}/deliver': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra a entrega da mídia (approved → delivered). */
    post: operations['teatEvidenceAccessRequestDeliver'];
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
    InitiateEvidenceUploadDto: {
      /** Format: uuid */
      traffic_agency_id?: string;
      /** Format: uuid */
      local_evidence_id: string;
      idempotency_key: string;
      /** @constant */
      entity_type: 'ait';
      /** Format: uuid */
      entity_id: string;
      evidence_type: string;
      origin: string;
      /** @enum {string} */
      mime_type: 'image/jpeg' | 'image/png' | 'application/pdf' | 'video/mp4';
      size_bytes: number;
      /** @constant */
      hash_algorithm: 'sha256';
      hash_value: string;
      filename: string;
      /** Format: uuid */
      captured_by_user_ref?: string;
      /** Format: uuid */
      agent_id?: string;
      /** Format: uuid */
      device_id?: string;
      /** Format: date-time */
      captured_at?: string;
      location_json?: {
        [key: string]: unknown;
      };
      metadata_json?: {
        [key: string]: unknown;
      };
    };
    CompleteEvidenceUploadDto: {
      /** Format: uuid */
      storage_intent_id: string;
      idempotency_key: string;
      /** @constant */
      entity_type: 'ait';
      /** Format: uuid */
      entity_id: string;
      accepted_hash: string;
    };
    ValidateEvidenceDto: {
      /** Format: uuid */
      user_ref?: string;
      reason?: string;
      /**
       * @default valid
       * @enum {string}
       */
      decision: 'valid' | 'invalid';
    };
    LinkEvidenceDto: {
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      role: string;
      /** @default false */
      mandatory: boolean;
      /** Format: uuid */
      user_ref?: string;
    };
    CreateCustodyEventCommandDto: {
      /**
       * @description Vocabulário de modelagem fixado em CTG-0003 §4.5/§4.10 — não é token canônico.
       * @enum {string}
       */
      event_type:
        | 'uploaded'
        | 'validated'
        | 'rejected'
        | 'linked'
        | 'packaged'
        | 'access_approved'
        | 'access_denied'
        | 'access_delivered'
        | 'purged_unverified'
        | 'quarantined'
        | 'restored';
      /** Format: date-time */
      event_at?: string;
      /** Format: uuid */
      user_ref?: string;
      system_name?: string;
      details_json?: {
        [key: string]: unknown;
      };
    };
    GenerateProbativePackageDto: {
      /** Format: uuid */
      traffic_agency_id?: string;
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      /** Format: uuid */
      generated_by_user_ref: string;
      purpose: string;
    };
    PurgeUnverifiedDto: {
      /** @default 200 */
      limit: number;
    };
    CreateEvidenceAccessRequestDto: {
      /** Format: uuid */
      evidence_id: string;
      requester_name: string;
      /** @enum {string} */
      requester_role:
        | 'magistrado'
        | 'ministerio-publico'
        | 'defensoria-publica'
        | 'autoridade-policial'
        | 'autoridade-administrativa';
      purpose: string;
      investigation_ref: string;
      legal_basis?: string;
    };
    DecideEvidenceAccessRequestDto: {
      /** Format: uuid */
      user_ref?: string;
      legal_basis?: string;
      reason?: string;
    };
    DeliverEvidenceAccessRequestDto: {
      delivery_media_ref: string;
      /** Format: uuid */
      user_ref?: string;
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
  teatEvidenceInitiateUpload: {
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
        'application/json': components['schemas']['InitiateEvidenceUploadDto'];
      };
    };
    responses: {
      /** @description Intenção de upload criada. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "storage_intent_id": "00000000-0000-7000-8000-0000ef100001",
           *       "evidence_id": "00000000-0000-7000-8000-0000ef000001",
           *       "upload_url": "local://evidence/00000000-0000-7000-8000-00000000a001/0000000000007000800000000000ef000001",
           *       "expires_at": "2026-09-14T13:00:00.000Z"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            storage_intent_id: string;
            upload_url: string;
            /** Format: date-time */
            expires_at: string;
            /** Format: uuid */
            evidence_id: string;
          };
        };
      };
      /** @description hash_value ausente. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.ENUM_INVALID'
              | 'TEAT.EVIDENCE_HASH_REQUIRED'
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
      /** @description AIT ainda não aplicado, ou idempotency_key já usada com corpo diferente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.EVIDENCE_ENTITY_NOT_APPLIED' | 'TEAT.IDEMPOTENCY_REPLAY';
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
      /** @description evidence_type fora do catálogo, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_TYPE_NOT_IN_CATALOG';
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
  teatEvidenceCompleteUpload: {
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
        'application/json': components['schemas']['CompleteEvidenceUploadDto'];
      };
    };
    responses: {
      /** @description Upload completado; vínculo inicial criado. */
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
            status: 'uploaded';
            storage_uri: string;
            /** Format: uuid */
            link_id?: string;
            /** Format: uuid */
            custody_event_id?: string;
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
      /** @description entity_type/entity_id divergentes da intenção, evidência em quarentena, ou idempotency_key divergente da intenção. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.EVIDENCE_ENTITY_NOT_APPLIED'
              | 'TEAT.EVIDENCE_QUARANTINED'
              | 'TEAT.IDEMPOTENCY_REPLAY';
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
      /** @description storage_intent expirado. */
      410: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_INTENT_EXPIRED';
            /** @constant */
            status: 410;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description accepted_hash divergente do declarado, ou evidência fora de pending_upload, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_HASH_MISMATCH' | 'TEAT.VALIDATION_FAILED';
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
  teatEvidenceValidate: {
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
        'application/json': components['schemas']['ValidateEvidenceDto'];
      };
    };
    responses: {
      /** @description Evidência validada/rejeitada. */
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
            /** @enum {string} */
            status: 'validated' | 'rejected';
            /** Format: uuid */
            custody_event_id?: string;
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
      /** @description Evidência em quarentena. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_QUARANTINED';
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
      /** @description Evidência fora de uploaded, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
  teatEvidenceLink: {
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
        'application/json': components['schemas']['LinkEvidenceDto'];
      };
    };
    responses: {
      /** @description Vínculo criado. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000ef200001",
           *       "evidence_id": "00000000-0000-7000-8000-0000ef000001",
           *       "entity_type": "ait",
           *       "entity_id": "00000000-0000-7000-8000-0000f0000001",
           *       "role": "bodycam",
           *       "mandatory": false
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            evidence_id: string;
            entity_type: string;
            /** Format: uuid */
            entity_id: string;
            role: string;
            mandatory?: boolean;
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
      /** @description Entidade não aplicada, ou evidência em quarentena. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'TEAT.EVIDENCE_ENTITY_NOT_APPLIED' | 'TEAT.EVIDENCE_QUARANTINED';
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
      /** @description Evidência fora de uploaded/validated, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
  teatEvidenceCustodyEventAdd: {
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
        'application/json': components['schemas']['CreateCustodyEventCommandDto'];
      };
    };
    responses: {
      /** @description Evento de custódia registrado. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000ef300001",
           *       "evidence_id": "00000000-0000-7000-8000-0000ef000001",
           *       "event_type": "linked"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            evidence_id: string;
            event_type: string;
            /** Format: date-time */
            event_at?: string;
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
      /** @description event_type fora do vocabulário desta rodada, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.ENUM_INVALID';
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
  teatProbativePackageGenerate: {
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
        'application/json': components['schemas']['GenerateProbativePackageDto'];
      };
    };
    responses: {
      /** @description Pacote probatório gerado. */
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
            manifest_hash: string;
            package_uri: string;
            items: {
              sequence?: number;
              /** Format: uuid */
              evidence_id?: string;
              item_hash?: string;
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
      /** @description Alguma evidência incluída está em quarentena. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_QUARANTINED';
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
      /** @description Nenhuma evidência validated/linked encontrada para a entidade, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PROBATIVE_PACKAGE_INCOMPLETE';
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
  teatEvidencePurgeUnverified: {
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
        'application/json': components['schemas']['PurgeUnverifiedDto'];
      };
    };
    responses: {
      /** @description Resumo da purga. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            purged: number;
            skippedBodycam: number;
            examined: number;
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
  teatEvidenceList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Evidências do tenant. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': ({
            /** Format: uuid */
            id?: string;
            evidence_type?: string;
            status?: string;
            storage_uri?: string | null;
            location_json?: Record<string, never> | null;
          } & {
            [key: string]: unknown;
          })[];
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
      /** @description Reservado para a rota de conteúdo de bodycam que venha a existir (RN-TEAT-142). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.EVIDENCE_BODYCAM_CONTENT_RESTRICTED'
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
  teatEvidenceGet: {
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
      /** @description Evidência. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** Format: uuid */
            id?: string;
            evidence_type?: string;
            status?: string;
            storage_uri?: string | null;
            location_json?: Record<string, never> | null;
          } & {
            [key: string]: unknown;
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
      /** @description Reservado para a rota de conteúdo de bodycam que venha a existir (RN-TEAT-142). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.EVIDENCE_BODYCAM_CONTENT_RESTRICTED'
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
  teatEvidenceAccessRequestCreate: {
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
        'application/json': components['schemas']['CreateEvidenceAccessRequestDto'];
      };
    };
    responses: {
      /** @description Pedido criado. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000ef400001",
           *       "evidence_id": "00000000-0000-7000-8000-0000ef000001",
           *       "status": "requested",
           *       "requester_role": "autoridade-policial",
           *       "investigation_ref": "IP-2026-0001"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            evidence_id: string;
            /** @constant */
            status: 'requested';
            requester_role: string;
            investigation_ref: string;
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
      /** @description requester_role fora do rol do art. 13, ou forma do payload inválida, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.EVIDENCE_ACCESS_REQUESTER_NOT_IN_ROL'
              | 'TEAT.VALIDATION_FAILED';
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
  teatEvidenceAccessRequestApprove: {
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
        'application/json': components['schemas']['DecideEvidenceAccessRequestDto'];
      };
    };
    responses: {
      /** @description Pedido aprovado. */
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
            status: 'approved';
            /** Format: uuid */
            decided_by_user_ref?: string;
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
      /** @description Pedido fora de requested. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID';
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
      /** @description legal_basis ausente (a aprovação é motivada), ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
  teatEvidenceAccessRequestDeny: {
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
        'application/json': components['schemas']['DecideEvidenceAccessRequestDto'];
      };
    };
    responses: {
      /** @description Pedido negado. */
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
            status: 'denied';
            /** Format: uuid */
            decided_by_user_ref?: string;
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
      /** @description Pedido fora de requested. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID';
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
      /** @description Forma do payload inválida, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
  teatEvidenceAccessRequestDeliver: {
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
        'application/json': components['schemas']['DeliverEvidenceAccessRequestDto'];
      };
    };
    responses: {
      /** @description Mídia entregue. */
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
            status: 'delivered';
            delivery_media_ref: string;
            /** Format: date-time */
            delivered_at: string;
            /** Format: uuid */
            custody_event_id?: string;
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
      /** @description Pedido fora de approved. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.EVIDENCE_ACCESS_STATE_INVALID';
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
      /** @description delivery_media_ref ausente, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
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
}
