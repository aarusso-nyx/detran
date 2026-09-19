// Generated from docs/framework/contracts/BP-CH-TELEHEALTH-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/telehealth/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List TelehealthSession (most recent first, capped at 500) */
    get: operations['listTelehealthSession'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/telehealth/sessions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getTelehealthSession'];
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
    TelehealthSession: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
      provider: string;
      external_session_id: string;
      /** @default true */
      lfd_required: boolean;
      /** @default false */
      lfd_passed: boolean;
      /**
       * @default 'STARTED'
       * @enum {string}
       */
      status: 'STARTED' | 'COMPLETED' | 'CANCELLED';
      /**
       * Format: date-time
       * @default now()
       */
      started_at: string;
      /** Format: date-time */
      completed_at?: string | null;
      /** @default '{}'::jsonb */
      conclusion: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTelehealthSessionDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
      provider: string;
      external_session_id: string;
      /** @default true */
      lfd_required: boolean;
      /** @default '{}'::jsonb */
      conclusion: {
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
  listTelehealthSession: {
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
          'application/json': components['schemas']['TelehealthSession'][];
        };
      };
    };
  };
  getTelehealthSession: {
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
          'application/json': components['schemas']['TelehealthSession'];
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
