// Generated from docs/framework/contracts/BP-CH-SCHEDULING-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/scheduling/professional-schedules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProfessionalSchedule (most recent first, capped at 500) */
    get: operations['listProfessionalSchedule'];
    put?: never;
    post: operations['createProfessionalSchedule'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/scheduling/professional-schedules/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProfessionalSchedule'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updateProfessionalSchedule'];
    trace?: never;
  };
  '/v1/ch/scheduling/assignment-draws': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AppointmentAssignmentDraw (most recent first, capped at 500) */
    get: operations['listAppointmentAssignmentDraw'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/scheduling/assignment-draws/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAppointmentAssignmentDraw'];
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
    ProfessionalSchedule: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      clinic_id: string;
      weekday: string;
      start_time: string;
      end_time: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProfessionalScheduleDto: {
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      clinic_id: string;
      weekday: string;
      start_time: string;
      end_time: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default true */
      is_active: boolean;
    };
    AppointmentAssignmentDraw: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      appointment_id: string;
      /** @enum {string} */
      track: 'MEDICAL' | 'PSYCH';
      region_code: string;
      /** Format: date-time */
      requested_at: string;
      seed_hex: string;
      considered_pool: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      selected_clinic_id: string;
      /** Format: uuid */
      selected_professional_id: string;
      /** Format: uuid */
      reroll_of?: string | null;
      reroll_reason?: string | null;
      /** Format: date-time */
      superseded_at?: string | null;
      /** Format: uuid */
      drawn_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAppointmentAssignmentDrawDto: {
      /** Format: uuid */
      appointment_id: string;
      /** @enum {string} */
      track: 'MEDICAL' | 'PSYCH';
      region_code: string;
      /** Format: date-time */
      requested_at: string;
      /** Format: uuid */
      reroll_of?: string | null;
      reroll_reason?: string | null;
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
  listProfessionalSchedule: {
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
          'application/json': components['schemas']['ProfessionalSchedule'][];
        };
      };
    };
  };
  createProfessionalSchedule: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateProfessionalScheduleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProfessionalSchedule'];
        };
      };
    };
  };
  getProfessionalSchedule: {
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
          'application/json': components['schemas']['ProfessionalSchedule'];
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
  updateProfessionalSchedule: {
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
        'application/json': components['schemas']['CreateProfessionalScheduleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProfessionalSchedule'];
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
  listAppointmentAssignmentDraw: {
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
          'application/json': components['schemas']['AppointmentAssignmentDraw'][];
        };
      };
    };
  };
  getAppointmentAssignmentDraw: {
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
          'application/json': components['schemas']['AppointmentAssignmentDraw'];
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
