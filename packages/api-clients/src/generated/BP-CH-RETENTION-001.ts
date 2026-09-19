// Generated from docs/framework/contracts/BP-CH-RETENTION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/retention/cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RetentionCase (most recent first, capped at 500) */
    get: operations['listRetentionCase'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/cases/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRetentionCase'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/holds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RetentionHold (most recent first, capped at 500) */
    get: operations['listRetentionHold'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/holds/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRetentionHold'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/dispositions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RetentionDisposition (most recent first, capped at 500) */
    get: operations['listRetentionDisposition'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/dispositions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRetentionDisposition'];
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
    RetentionCase: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      patient_id: string;
      custodian: string;
      /** Format: date-time */
      last_record_at: string;
      /** Format: date */
      eligible_after: string;
      /** @enum {string} */
      preservation_status: 'PAdES_LTA_REQUIRED' | 'PAdES_LTA_READY';
      /** @enum {string} */
      status: 'RETAINED' | 'LEGAL_REVIEW' | 'ELIGIBLE_BLOCKED';
      block_reasons: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      assessed_by: string;
      /** Format: date-time */
      assessed_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRetentionCaseDto: {
      /** Format: uuid */
      patient_id: string;
    };
    RetentionHold: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      retention_case_id: string;
      reason: string;
      /** @enum {string} */
      status: 'ACTIVE' | 'RELEASED';
      /** Format: uuid */
      imposed_by: string;
      /** Format: uuid */
      released_by?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRetentionHoldDto: {
      /** Format: uuid */
      retention_case_id: string;
      reason: string;
    };
    RetentionDisposition: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      retention_case_id: string;
      /** @enum {string} */
      destination: 'RETURN' | 'EXTEND' | 'DELETE';
      /** @enum {string} */
      status: 'PROPOSED' | 'DPO_REVIEWED' | 'BLOCKED';
      justification: string;
      /** Format: uuid */
      proposed_by: string;
      /** Format: date-time */
      proposed_at: string;
      /** Format: date-time */
      return_offered_at: string;
      /** Format: uuid */
      reviewed_by?: string | null;
      /** Format: date-time */
      reviewed_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRetentionDispositionDto: {
      /** Format: uuid */
      retention_case_id: string;
      /** @enum {string} */
      destination: 'RETURN' | 'EXTEND' | 'DELETE';
      justification: string;
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
  listRetentionCase: {
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
          'application/json': components['schemas']['RetentionCase'][];
        };
      };
    };
  };
  getRetentionCase: {
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
          'application/json': components['schemas']['RetentionCase'];
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
  listRetentionHold: {
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
          'application/json': components['schemas']['RetentionHold'][];
        };
      };
    };
  };
  getRetentionHold: {
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
          'application/json': components['schemas']['RetentionHold'];
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
  listRetentionDisposition: {
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
          'application/json': components['schemas']['RetentionDisposition'][];
        };
      };
    };
  };
  getRetentionDisposition: {
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
          'application/json': components['schemas']['RetentionDisposition'];
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
