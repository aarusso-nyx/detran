// Generated from docs/framework/contracts/BP-CH-INCONSISTENCIES-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/inconsistencies/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Inconsistency (most recent first, capped at 500) */
    get: operations['listInconsistency'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/inconsistencies/records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getInconsistency'];
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
    Inconsistency: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id?: string | null;
      source_system: string;
      /** @enum {string} */
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      /**
       * @default 'DETECTED'
       * @enum {string}
       */
      status: 'DETECTED' | 'NOTIFIED' | 'CORRECTED' | 'REPROCESSED' | 'CLOSED';
      detection_reason: string;
      /** @default '{}'::jsonb */
      detection_payload: {
        [key: string]: unknown;
      };
      /** @default '{}'::jsonb */
      correction: {
        [key: string]: unknown;
      };
      resolution_note?: string | null;
      /** Format: date-time */
      notified_at?: string | null;
      /** Format: date-time */
      corrected_at?: string | null;
      /** Format: date-time */
      reprocessed_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      due_at: string;
      /** Format: uuid */
      created_by: string;
      /** Format: uuid */
      updated_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInconsistencyDto: {
      /** Format: uuid */
      encounter_id?: string | null;
      source_system: string;
      /** @enum {string} */
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      detection_reason: string;
      /** @default '{}'::jsonb */
      detection_payload: {
        [key: string]: unknown;
      };
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
  listInconsistency: {
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
          'application/json': components['schemas']['Inconsistency'][];
        };
      };
    };
  };
  getInconsistency: {
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
          'application/json': components['schemas']['Inconsistency'];
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
