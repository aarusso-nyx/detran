// Generated from docs/framework/contracts/BP-CH-RESTRICTIONS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/restrictions/applied': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/restrictions/applied */
    post: operations['pecPostChRestrictionsApplied'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
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
  pecPostChRestrictionsApplied: {
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
}
