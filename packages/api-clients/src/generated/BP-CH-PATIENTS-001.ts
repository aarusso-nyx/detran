// Generated from docs/framework/contracts/BP-CH-PATIENTS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/patients': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Patient (most recent first, capped at 500) */
    get: operations['listPatient'];
    put?: never;
    post: operations['createPatient'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/patients/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPatient'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updatePatient'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Patient: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id?: string | null;
      /** Format: uuid */
      user_id?: string | null;
      national_id: string;
      name: string;
      social_name?: string | null;
      /** Format: date */
      birth_date?: string | null;
      /** @enum {string|null} */
      gender?: 'M' | 'F' | 'O' | null;
      mother_name?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
      address?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePatientDto: {
      /** Format: uuid */
      clinic_id?: string | null;
      /** Format: uuid */
      user_id?: string | null;
      national_id: string;
      name: string;
      social_name?: string | null;
      /** Format: date */
      birth_date?: string | null;
      /** @enum {string|null} */
      gender?: 'M' | 'F' | 'O' | null;
      mother_name?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
      address?: string | null;
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
  listPatient: {
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
          'application/json': components['schemas']['Patient'][];
        };
      };
    };
  };
  createPatient: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePatientDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Patient'];
        };
      };
    };
  };
  getPatient: {
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
          'application/json': components['schemas']['Patient'];
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
  updatePatient: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePatientDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Patient'];
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
