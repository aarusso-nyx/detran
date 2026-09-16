// Generated from docs/framework/contracts/BP-CH-CLINICAL-CONTROLS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/clinical-controls/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ClinicalControlEvent (most recent first, capped at 500) */
    get: operations['listClinicalControlEvent'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/clinical-controls/events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getClinicalControlEvent'];
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
    ClinicalControlEvent: {
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
      medical_exam_id?: string | null;
      /** Format: uuid */
      psychological_exam_id?: string | null;
      /** @enum {string} */
      control_kind:
        | 'OPHTHALMOLOGY'
        | 'SLEEP'
        | 'DEVOLUTIVE'
        | 'SATISFACTION'
        | 'INTERN_DOUBLE_VALIDATION';
      /** @default 'RECORDED' */
      status: string;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      recorded_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      recorded_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateClinicalControlEventDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      medical_exam_id?: string | null;
      /** Format: uuid */
      psychological_exam_id?: string | null;
      /** @enum {string} */
      control_kind:
        | 'OPHTHALMOLOGY'
        | 'SLEEP'
        | 'DEVOLUTIVE'
        | 'SATISFACTION'
        | 'INTERN_DOUBLE_VALIDATION';
      /** @default '{}'::jsonb */
      payload: {
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
  listClinicalControlEvent: {
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
          'application/json': components['schemas']['ClinicalControlEvent'][];
        };
      };
    };
  };
  getClinicalControlEvent: {
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
          'application/json': components['schemas']['ClinicalControlEvent'];
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
