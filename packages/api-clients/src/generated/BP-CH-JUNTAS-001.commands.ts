// Generated from docs/framework/contracts/BP-CH-JUNTAS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/juntas/cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/juntas/cases */
    post: operations['pecPostChJuntasCases'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/cases/{id}/second-board': {
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
    /** POST /v1/ch/juntas/cases/{id}/second-board */
    post: operations['pecPostChJuntasCasesByIdSecondBoard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/cases/{id}/special-board': {
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
    /** POST /v1/ch/juntas/cases/{id}/special-board */
    post: operations['pecPostChJuntasCasesByIdSpecialBoard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/boards/{id}/decisions': {
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
    /** POST /v1/ch/juntas/boards/{id}/decisions */
    post: operations['pecPostChJuntasBoardsByIdDecisions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/cases/{id}/appeals': {
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
    /** POST /v1/ch/juntas/cases/{id}/appeals */
    post: operations['pecPostChJuntasCasesByIdAppeals'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/appeals/{id}/forward': {
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
    /** PATCH /v1/ch/juntas/appeals/{id}/forward */
    patch: operations['pecPatchChJuntasAppealsByIdForward'];
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
  pecPostChJuntasCases: {
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
  pecPostChJuntasCasesByIdSecondBoard: {
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChJuntasCasesByIdSpecialBoard: {
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChJuntasBoardsByIdDecisions: {
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChJuntasCasesByIdAppeals: {
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
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChJuntasAppealsByIdForward: {
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
