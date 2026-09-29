// Generated from docs/framework/contracts/BP-CH-TELEHEALTH-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/telehealth/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/telehealth/sessions */
    post: operations['pecPostChTelehealthSessions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/telehealth/sessions/{id}/conclude': {
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
    /** PATCH /v1/ch/telehealth/sessions/{id}/conclude */
    patch: operations['pecPatchChTelehealthSessionsByIdConclude'];
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
  pecPostChTelehealthSessions: {
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
  pecPatchChTelehealthSessionsByIdConclude: {
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
