// Generated from docs/framework/contracts/BP-CH-OPERATIONAL-CONTROLS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/operational-controls/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List OperationalRecord (most recent first, capped at 500) */
    get: operations['listOperationalRecord'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/operational-controls/records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getOperationalRecord'];
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
    OperationalRecord: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      record_kind:
        | 'CLINIC_INSPECTION'
        | 'CREDENTIALING_STATUS'
        | 'SANCTION'
        | 'CLINIC_LOCATION'
        | 'DASHBOARD_SNAPSHOT'
        | 'BACKUP_DRILL'
        | 'SUPPORT_TICKET'
        | 'RELEASE_WINDOW';
      subject_type: string;
      /** Format: uuid */
      subject_id?: string | null;
      /** Format: uuid */
      clinic_id?: string | null;
      status: string;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateOperationalRecordDto: {
      /** @enum {string} */
      record_kind:
        | 'CLINIC_INSPECTION'
        | 'CREDENTIALING_STATUS'
        | 'SANCTION'
        | 'CLINIC_LOCATION'
        | 'DASHBOARD_SNAPSHOT'
        | 'BACKUP_DRILL'
        | 'SUPPORT_TICKET'
        | 'RELEASE_WINDOW';
      subject_type: string;
      /** Format: uuid */
      subject_id?: string | null;
      /** Format: uuid */
      clinic_id?: string | null;
      status: string;
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
  listOperationalRecord: {
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
          'application/json': components['schemas']['OperationalRecord'][];
        };
      };
    };
  };
  getOperationalRecord: {
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
          'application/json': components['schemas']['OperationalRecord'];
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
