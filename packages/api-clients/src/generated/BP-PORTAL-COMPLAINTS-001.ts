// Generated from docs/framework/contracts/BP-PORTAL-COMPLAINTS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/portal/complaints/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Complaint (most recent first, capped at 500) */
    get: operations['listComplaint'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/portal/complaints/records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getComplaint'];
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
    Complaint: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      protocol: string;
      complainant_name?: string | null;
      contact?: string | null;
      category: string;
      /**
       * @default 'OPEN'
       * @enum {string}
       */
      status: 'OPEN' | 'TRIAGED' | 'IN_REVIEW' | 'CLOSED' | 'REJECTED';
      description: string;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      assigned_to?: string | null;
      /** Format: uuid */
      closed_by?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateComplaintDto: {
      complainant_name?: string | null;
      contact?: string | null;
      category: string;
      description: string;
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
  listComplaint: {
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
          'application/json': components['schemas']['Complaint'][];
        };
      };
    };
  };
  getComplaint: {
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
          'application/json': components['schemas']['Complaint'];
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
