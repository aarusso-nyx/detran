// Generated from docs/framework/contracts/BP-INF-NORMATIVE-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/normative/catalogs/{id}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Publica o catálogo normativo (draft/active → active). */
    post: operations['teatNormativeCatalogPublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/catalogs/{id}/retire': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retira o catálogo normativo (active → retired). */
    post: operations['teatNormativeCatalogRetire'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/generate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Gera um pacote mobile a partir do catálogo ativo. */
    post: operations['teatMobileNormativePackageGenerate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/{id}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Publica o pacote mobile (draft/published → published). */
    post: operations['teatMobileNormativePackagePublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/{id}/retire': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retira o pacote mobile (published → retired). */
    post: operations['teatMobileNormativePackageRetire'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/{id}/validate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Valida a versão e o hash de um pacote mobile (diagnóstico, idempotente). */
    post: operations['teatMobileNormativePackageValidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/{id}/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Devolve o conteúdo assinado do pacote mobile publicado. */
    get: operations['teatMobileNormativePackageContent'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/sync-metadata': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista metadados dos pacotes mobile publicados e vigentes. */
    get: operations['teatMobileNormativePackageSyncMetadata'];
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
    PublishNormativeCatalogCommandDto: {
      /** Format: date */
      published_at?: string;
    };
    RetireNormativeCatalogCommandDto: {
      /** Format: date */
      valid_to?: string;
    };
    GenerateMobileNormativePackageCommandDto: {
      /** Format: uuid */
      catalog_id: string;
      package_version: string;
      /** Format: date */
      valid_until?: string;
    };
    PublishMobileNormativePackageCommandDto: {
      package_uri?: string;
      manifest_hash?: string;
      /** Format: date */
      valid_until?: string;
    };
    RetireMobileNormativePackageCommandDto: {
      /** Format: date */
      valid_until?: string;
    };
    ValidateMobileNormativePackageCommandDto: {
      package_version: string;
      manifest_hash: string;
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
  teatNormativeCatalogPublish: {
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
        'application/json': components['schemas']['PublishNormativeCatalogCommandDto'];
      };
    };
    responses: {
      /** @description Catálogo publicado. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000e0000001",
           *       "status": "active"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            status: string;
            /** Format: date */
            published_at?: string;
            /** Format: date */
            valid_to?: string;
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
      /** @description Catálogo retirado. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.CATALOG_STATE_INVALID';
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
  teatNormativeCatalogRetire: {
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
        'application/json': components['schemas']['RetireNormativeCatalogCommandDto'];
      };
    };
    responses: {
      /** @description Catálogo retirado. */
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
            status: string;
            /** Format: date */
            published_at?: string;
            /** Format: date */
            valid_to?: string;
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
      /** @description Catálogo fora de active. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.CATALOG_STATE_INVALID';
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
  teatMobileNormativePackageGenerate: {
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
         *       "catalog_id": "00000000-0000-7000-8000-0000e0000001",
         *       "package_version": "2026.09.1"
         *     }
         */
        'application/json': components['schemas']['GenerateMobileNormativePackageCommandDto'];
      };
    };
    responses: {
      /** @description Pacote gerado em rascunho. */
      201: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "id": "00000000-0000-7000-8000-0000e7000002",
           *       "status": "draft",
           *       "package_version": "2026.09.1",
           *       "catalog_id": "00000000-0000-7000-8000-0000e0000001"
           *     }
           */
          'application/json': {
            /** Format: uuid */
            id: string;
            status: string;
            package_version?: string;
            manifest_hash?: string;
            /** Format: date-time */
            published_at?: string;
            /** Format: date */
            valid_until?: string;
            /** Format: uuid */
            catalog_id?: string;
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
      /** @description package_version já usada no órgão com manifesto diferente. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.IDEMPOTENCY_REPLAY';
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
      /** @description Catálogo não está active, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PACKAGE_CATALOG_NOT_ACTIVE';
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
  teatMobileNormativePackagePublish: {
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
        'application/json': components['schemas']['PublishMobileNormativePackageCommandDto'];
      };
    };
    responses: {
      /** @description Pacote publicado. */
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
            status: string;
            package_version?: string;
            manifest_hash?: string;
            /** Format: date-time */
            published_at?: string;
            /** Format: date */
            valid_until?: string;
            /** Format: uuid */
            catalog_id?: string;
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
      /** @description Pacote retirado. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PACKAGE_STATE_INVALID';
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
      /** @description Catálogo não ativo, ou manifest_hash informado divergente do gravado, ou replay de Idempotency-Key com corpo divergente (kernel, OD-T45). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'TEAT.PACKAGE_CATALOG_NOT_ACTIVE'
              | 'TEAT.PACKAGE_MANIFEST_MISMATCH';
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
  teatMobileNormativePackageRetire: {
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
        'application/json': components['schemas']['RetireMobileNormativePackageCommandDto'];
      };
    };
    responses: {
      /** @description Pacote retirado. */
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
            status: string;
            package_version?: string;
            manifest_hash?: string;
            /** Format: date-time */
            published_at?: string;
            /** Format: date */
            valid_until?: string;
            /** Format: uuid */
            catalog_id?: string;
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
      /** @description Pacote fora de published. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PACKAGE_STATE_INVALID';
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
  teatMobileNormativePackageValidate: {
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
        'application/json': components['schemas']['ValidateMobileNormativePackageCommandDto'];
      };
    };
    responses: {
      /** @description Diagnóstico de validade. */
      200: {
        headers: {
          /** @description "true" quando a resposta é o replay gravado pelo kernel. */
          'idempotency-replayed'?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            valid: boolean;
            /** @enum {string|null} */
            reason:
              | 'version_mismatch'
              | 'hash_mismatch'
              | 'not_published'
              | 'expired'
              | null;
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
  teatMobileNormativePackageContent: {
    parameters: {
      query?: never;
      header?: {
        /** @description Comparado ao manifest_hash gravado (RFC 9110 §13.1.2); igual → 304. */
        'If-None-Match'?: string;
      };
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Conteúdo assinado do pacote. */
      200: {
        headers: {
          /** @description "<manifest_hash>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            manifest: {
              [key: string]: unknown;
            };
            manifest_hash: string;
            signature: {
              value: string;
              signer: string;
              /** @enum {string} */
              kind: 'local-unsigned';
            };
          };
        };
      };
      /** @description Pacote sem mudança desde o If-None-Match informado (manifest_hash igual). */
      304: {
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
      /** @description Pacote fora de published. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PACKAGE_STATE_INVALID';
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
      /** @description Manifesto recomposto diverge do manifest_hash gravado. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'TEAT.PACKAGE_MANIFEST_MISMATCH';
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
  teatMobileNormativePackageSyncMetadata: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Metadados de sincronização. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            packages: {
              /** Format: uuid */
              id?: string;
              package_uri?: string;
              manifest_hash?: string;
              package_version?: string;
              /** Format: date-time */
              published_at?: string;
              /** Format: date */
              valid_until?: string;
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
