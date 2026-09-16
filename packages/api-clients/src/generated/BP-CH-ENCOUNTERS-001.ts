// Generated from docs/framework/contracts/BP-CH-ENCOUNTERS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/appointments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Appointment (most recent first, capped at 500) */
    get: operations['listAppointment'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/appointments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAppointment'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/encounters': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Encounter (most recent first, capped at 500) */
    get: operations['listEncounter'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/encounters/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEncounter'];
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
    Appointment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      professional_id?: string | null;
      /** Format: date-time */
      scheduled_at: string;
      /**
       * @default 'SCHEDULED'
       * @enum {string}
       */
      status: 'SCHEDULED' | 'CHECKED_IN' | 'DONE' | 'NO_SHOW' | 'CANCELLED';
      /** Format: uuid */
      created_by?: string | null;
      /** Format: uuid */
      updated_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAppointmentDto: {
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      professional_id?: string | null;
      /** Format: date-time */
      scheduled_at: string;
    };
    Encounter: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
      renach_process_key?: string | null;
      /** @enum {string|null} */
      renach_process_type?:
        | 'FIRST_LICENSE'
        | 'RENEWAL'
        | 'CATEGORY_CHANGE'
        | 'CATEGORY_ADDITION'
        | null;
      current_category?: string | null;
      requested_category?: string | null;
      /** @default true */
      requires_medical: boolean;
      /** @default false */
      requires_psychological: boolean;
      exam_eligible?: boolean | null;
      /** @default '[]'::jsonb */
      eligibility_reasons: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      eligibility_checked_at?: string | null;
      /**
       * @default 'OPEN'
       * @enum {string}
       */
      status:
        | 'OPEN'
        | 'IN_PROGRESS'
        | 'READY_FOR_SIGNATURE'
        | 'SIGNED'
        | 'CLOSED'
        | 'CANCELLED';
      /**
       * Format: date-time
       * @default now()
       */
      started_at: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      cancelled_at?: string | null;
      cancel_reason?: string | null;
      /** Format: uuid */
      created_by?: string | null;
      /** Format: uuid */
      updated_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEncounterDto: {
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
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
  listAppointment: {
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
          'application/json': components['schemas']['Appointment'][];
        };
      };
    };
  };
  getAppointment: {
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
          'application/json': components['schemas']['Appointment'];
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
  listEncounter: {
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
          'application/json': components['schemas']['Encounter'][];
        };
      };
    };
  };
  getEncounter: {
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
          'application/json': components['schemas']['Encounter'];
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
