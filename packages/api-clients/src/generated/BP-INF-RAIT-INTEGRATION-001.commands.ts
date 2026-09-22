// Generated from docs/framework/contracts/BP-INF-RAIT-INTEGRATION-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/integrations/outbox': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['raitIntegrationOutboxList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/integrations/outbox/{id}/retry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitIntegrationOutboxRetry'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/integrations/reconciliations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitIntegrationReconcile'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['raitStreamRead'];
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
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  raitIntegrationOutboxList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Outbox listado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitIntegrationOutboxRetry: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Retry solicitado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitIntegrationReconcile: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Conciliação solicitada */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitStreamRead: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Fluxo SSE */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Cursor expirado */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
