// Generated from docs/framework/contracts/BP-CH-TOXICOLOGY-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/toxicology/results': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PeriodicToxicologyResult (most recent first, capped at 500) */
    get: operations['listPeriodicToxicologyResult'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/toxicology/results/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPeriodicToxicologyResult'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/toxicology/suspensions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ToxicologySuspension (most recent first, capped at 500) */
    get: operations['listToxicologySuspension'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/toxicology/suspensions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getToxicologySuspension'];
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
    PeriodicToxicologyResult: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      source_event_id: string;
      payload_sha256: string;
      /** Format: uuid */
      patient_id: string;
      driver_cpf: string;
      /** @enum {string} */
      category: 'C' | 'D' | 'E';
      /** @enum {string} */
      result: 'POSITIVE' | 'NEGATIVE';
      /** Format: date-time */
      collected_at: string;
      /** Format: date-time */
      valid_until: string;
      /** Format: date-time */
      occurred_at: string;
      laboratory_code: string;
      source_reference: string;
      /** @enum {string} */
      driver_alert_status: 'SENT' | 'SCHEDULED' | 'NOT_REQUIRED';
      /**
       * Format: date-time
       * @default now()
       */
      received_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePeriodicToxicologyResultDto: Record<string, never>;
    ToxicologySuspension: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      source_positive_result_id: string;
      /** Format: date-time */
      starts_at: string;
      /** Format: date-time */
      ends_at: string;
      /**
       * @default 'ACTIVE'
       * @enum {string}
       */
      status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
      /** Format: uuid */
      released_by_result_id?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateToxicologySuspensionDto: Record<string, never>;
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  listPeriodicToxicologyResult: {
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
          'application/json': components['schemas']['PeriodicToxicologyResult'][];
        };
      };
    };
  };
  getPeriodicToxicologyResult: {
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
          'application/json': components['schemas']['PeriodicToxicologyResult'];
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
  listToxicologySuspension: {
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
          'application/json': components['schemas']['ToxicologySuspension'][];
        };
      };
    };
  };
  getToxicologySuspension: {
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
          'application/json': components['schemas']['ToxicologySuspension'];
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
