// Generated from docs/framework/contracts/BP-CH-RESTRICTIONS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/restrictions/codes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RestrictionCode (most recent first, capped at 500) */
    get: operations['listRestrictionCode'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/restrictions/codes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRestrictionCode'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/restrictions/applied': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List EncounterRestriction (most recent first, capped at 500) */
    get: operations['listEncounterRestriction'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/restrictions/applied/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEncounterRestriction'];
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
    RestrictionCode: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      legal_label: string;
      annex_version: string;
      source_reference: string;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRestrictionCodeDto: {
      code: string;
      legal_label: string;
      annex_version: string;
      source_reference: string;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      /** @default true */
      is_active: boolean;
    };
    EncounterRestriction: {
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
      report_id?: string | null;
      /** Format: uuid */
      restriction_code_id: string;
      /** Format: uuid */
      prescribed_by: string;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEncounterRestrictionDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      report_id?: string | null;
      /** Format: uuid */
      restriction_code_id: string;
      notes?: string | null;
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
  listRestrictionCode: {
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
          'application/json': components['schemas']['RestrictionCode'][];
        };
      };
    };
  };
  getRestrictionCode: {
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
          'application/json': components['schemas']['RestrictionCode'];
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
  listEncounterRestriction: {
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
          'application/json': components['schemas']['EncounterRestriction'][];
        };
      };
    };
  };
  getEncounterRestriction: {
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
          'application/json': components['schemas']['EncounterRestriction'];
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
