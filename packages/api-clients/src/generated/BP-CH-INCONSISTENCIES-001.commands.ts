// Generated from docs/framework/contracts/BP-CH-INCONSISTENCIES-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/inconsistencies': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/inconsistencies */
    post: operations['pecPostChInconsistencies'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/inconsistencies/{id}/notify': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/ch/inconsistencies/{id}/notify */
    patch: operations['pecPatchChInconsistenciesByIdNotify'];
    trace?: never;
  };
  '/v1/ch/inconsistencies/{id}/correct': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/ch/inconsistencies/{id}/correct */
    patch: operations['pecPatchChInconsistenciesByIdCorrect'];
    trace?: never;
  };
  '/v1/ch/inconsistencies/{id}/reprocess': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/ch/inconsistencies/{id}/reprocess */
    patch: operations['pecPatchChInconsistenciesByIdReprocess'];
    trace?: never;
  };
  '/v1/ch/inconsistencies/{id}/close': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/ch/inconsistencies/{id}/close */
    patch: operations['pecPatchChInconsistenciesByIdClose'];
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
  pecPostChInconsistencies: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChInconsistenciesByIdNotify: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChInconsistenciesByIdCorrect: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChInconsistenciesByIdReprocess: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChInconsistenciesByIdClose: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
