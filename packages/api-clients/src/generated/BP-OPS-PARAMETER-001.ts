// Generated from docs/framework/contracts/BP-OPS-PARAMETER-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/parameters': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Parameter (most recent first, capped at 500) */
    get: operations['listParameter'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/parameters/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getParameter'];
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
    Parameter: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id?: string | null;
      /** @enum {string} */
      scope: 'tenant' | 'agency' | 'surface';
      /** @enum {string} */
      surface: 'rait' | 'teat' | 'portal' | 'est' | 'dashboard' | 'shared';
      key: string;
      value_json: {
        [key: string]: unknown;
      };
      value_type: string;
      /** @enum {string} */
      status: 'vigente' | 'a_confirmar' | 'proposta';
      source_pending: boolean;
      legal_readonly: boolean;
      decision_ref: string;
      legal_basis?: string | null;
      reason: string;
      version: number;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      /** Format: uuid */
      changed_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateParameterDto: {
      /** Format: uuid */
      traffic_agency_id?: string | null;
      /** @enum {string} */
      scope: 'tenant' | 'agency' | 'surface';
      /** @enum {string} */
      surface: 'rait' | 'teat' | 'portal' | 'est' | 'dashboard' | 'shared';
      key: string;
      value_json: {
        [key: string]: unknown;
      };
      value_type: string;
      /** @enum {string} */
      status: 'vigente' | 'a_confirmar' | 'proposta';
      source_pending: boolean;
      legal_readonly: boolean;
      decision_ref: string;
      legal_basis?: string | null;
      reason: string;
      version: number;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      /** Format: uuid */
      changed_by: string;
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
  listParameter: {
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
          'application/json': components['schemas']['Parameter'][];
        };
      };
    };
  };
  getParameter: {
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
          'application/json': components['schemas']['Parameter'];
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
