// Generated from docs/framework/contracts/BP-CH-EXAMS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/exams/psych-instruments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PsychInstrument (most recent first, capped at 500) */
    get: operations['listPsychInstrument'];
    put?: never;
    post: operations['createPsychInstrument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/exams/psych-instruments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPsychInstrument'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updatePsychInstrument'];
    trace?: never;
  };
  '/v1/ch/exams/medical': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MedicalExam (most recent first, capped at 500) */
    get: operations['listMedicalExam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/exams/medical/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMedicalExam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/exams/psychological': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PsychologicalExam (most recent first, capped at 500) */
    get: operations['listPsychologicalExam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/exams/psychological/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPsychologicalExam'];
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
    PsychInstrument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      name: string;
      version: string;
      /** @enum {string} */
      satepsi_status: 'FAVORABLE' | 'UNFAVORABLE' | 'SUSPENDED';
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      source_reference: string;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePsychInstrumentDto: {
      code: string;
      name: string;
      version: string;
      /** @enum {string} */
      satepsi_status: 'FAVORABLE' | 'UNFAVORABLE' | 'SUSPENDED';
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      source_reference: string;
      /** @default true */
      is_active: boolean;
    };
    MedicalExam: {
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
      /**
       * Format: date-time
       * @default now()
       */
      performed_at: string;
      /** Format: date */
      statutory_valid_until: string;
      /** Format: date */
      valid_until: string;
      /** Format: date */
      inaptitude_until?: string | null;
      validity_reduction_reason?: string | null;
      data: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      result: 'APTO' | 'APTO_COM_RESTRICOES' | 'INAPTO_TEMPORARIO' | 'INAPTO';
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMedicalExamDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      professional_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      performed_at: string;
      data: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      result: 'APTO' | 'APTO_COM_RESTRICOES' | 'INAPTO_TEMPORARIO' | 'INAPTO';
    };
    PsychologicalExam: {
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
      instrument_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      performed_at: string;
      /** Format: date */
      valid_until?: string | null;
      /** Format: date */
      inaptitude_until?: string | null;
      validity_reduction_reason?: string | null;
      data: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      result: 'APTO' | 'INAPTO_TEMPORARIO' | 'INAPTO';
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePsychologicalExamDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      instrument_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      performed_at: string;
      /** Format: date */
      valid_until?: string | null;
      /** Format: date */
      inaptitude_until?: string | null;
      validity_reduction_reason?: string | null;
      data: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      result: 'APTO' | 'INAPTO_TEMPORARIO' | 'INAPTO';
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
  listPsychInstrument: {
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
          'application/json': components['schemas']['PsychInstrument'][];
        };
      };
    };
  };
  createPsychInstrument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePsychInstrumentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PsychInstrument'];
        };
      };
    };
  };
  getPsychInstrument: {
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
          'application/json': components['schemas']['PsychInstrument'];
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
  updatePsychInstrument: {
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
        'application/json': components['schemas']['CreatePsychInstrumentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PsychInstrument'];
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
  listMedicalExam: {
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
          'application/json': components['schemas']['MedicalExam'][];
        };
      };
    };
  };
  getMedicalExam: {
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
          'application/json': components['schemas']['MedicalExam'];
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
  listPsychologicalExam: {
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
          'application/json': components['schemas']['PsychologicalExam'][];
        };
      };
    };
  };
  getPsychologicalExam: {
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
          'application/json': components['schemas']['PsychologicalExam'];
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
