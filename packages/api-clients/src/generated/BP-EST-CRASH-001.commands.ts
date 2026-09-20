// Generated from docs/framework/contracts/BP-EST-CRASH-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/est/crash/records/{id}/start': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordStart'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/record': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordRecord'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/complement': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordComplement'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/validate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordValidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/close': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordClose'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/cancel': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordCancel'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/archive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordArchive'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/transmit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordTransmit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/renaest/{kind}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordRectify'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/renaest': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['boatCrashRecordRenaestRead'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/scene-duties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordDuty'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/{kind}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['boatCrashRecordSatelliteAdd'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}/report': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['boatCrashRecordReport'];
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
    Error400: {
      /** @enum {string} */
      code: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
      /** @constant */
      status: 400;
      message: string;
    };
    Error401: {
      /** @enum {string} */
      code: 'TEAT.AUTH_REQUIRED';
      /** @constant */
      status: 401;
      message: string;
    };
    Error403: {
      /** @enum {string} */
      code: 'TEAT.FORBIDDEN_ACTION';
      /** @constant */
      status: 403;
      message: string;
    };
    Error412: {
      /** @enum {string} */
      code: 'TEAT.VERSION_CONFLICT';
      /** @constant */
      status: 412;
      message: string;
    };
    Error428: {
      /** @enum {string} */
      code: 'TEAT.IF_MATCH_REQUIRED';
      /** @constant */
      status: 428;
      message: string;
    };
  };
  responses: {
    /** @description Comando aplicado. */
    Success: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': {
          [key: string]: unknown;
        };
      };
    };
    /** @description Payload inválido. */
    Validation: {
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
        };
      };
    };
    /** @description Autenticação ausente. */
    Auth: {
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
        };
      };
    };
    /** @description Ação não autorizada. */
    Forbidden: {
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
        };
      };
    };
    /** @description Versão divergente. */
    Conflict: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': {
          /** @enum {string} */
          code: 'TEAT.VERSION_CONFLICT';
          /** @constant */
          status: 412;
          message: string;
        };
      };
    };
    /** @description If-Match obrigatório. */
    Precondition: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': {
          /** @enum {string} */
          code: 'TEAT.IF_MATCH_REQUIRED';
          /** @constant */
          status: 428;
          message: string;
        };
      };
    };
  };
  parameters: {
    Id: string;
    Kind: string;
    IfMatch: string;
  };
  requestBodies: {
    Json: {
      content: {
        'application/json': {
          [key: string]: unknown;
        };
      };
    };
  };
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  boatCrashRecordStart: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordRecord: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['Json'];
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordComplement: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordValidate: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordClose: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordCancel: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordArchive: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordTransmit: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.TRANSMIT_NOT_CLOSED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordRectify: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
        kind: components['parameters']['Kind'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['Json'];
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID' | 'BOAT.RECTIFY_TERMINAL';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 422 do dominio BOAT. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.RECTIFY_REASON_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordRenaestRead: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordDuty: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['Json'];
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 422 do dominio BOAT. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.DUTY_REGIME_MISMATCH';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordSatelliteAdd: {
    parameters: {
      query?: never;
      header: {
        'if-match': components['parameters']['IfMatch'];
      };
      path: {
        id: components['parameters']['Id'];
        kind: components['parameters']['Kind'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['Json'];
    responses: {
      200: components['responses']['Success'];
      /** @description Erro 400 do dominio BOAT. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.ENUM_INVALID' | 'BOAT.VALIDATION_FAILED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 404 do dominio BOAT. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_NOT_FOUND';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 409 do dominio BOAT. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.CRASH_STATE_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 412 do dominio BOAT. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 428 do dominio BOAT. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  boatCrashRecordReport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: components['parameters']['Id'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Relatório preliminar. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/pdf': string;
        };
      };
      /** @description Erro 401 do dominio BOAT. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Erro 403 do dominio BOAT. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'BOAT.FORBIDDEN_ACTION';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
}
