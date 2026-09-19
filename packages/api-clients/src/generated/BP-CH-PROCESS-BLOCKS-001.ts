// Generated from docs/framework/contracts/BP-CH-PROCESS-BLOCKS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/process-blocks/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProcessBlock (most recent first, capped at 500) */
    get: operations['listProcessBlock'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/process-blocks/records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProcessBlock'];
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
    ProcessBlock: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id: string;
      block_kind: string;
      /** @default 'PEC' */
      source_system: string;
      message?: string | null;
      /** @default true */
      active: boolean;
      /** Format: uuid */
      created_by: string;
      /** Format: uuid */
      resolved_by?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProcessBlockDto: {
      /** Format: uuid */
      encounter_id: string;
      block_kind: string;
      /** @default 'PEC' */
      source_system: string;
      message?: string | null;
      /** @default true */
      active: boolean;
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
  listProcessBlock: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessBlock'][];
        };
      };
    };
  };
  getProcessBlock: {
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
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessBlock'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
