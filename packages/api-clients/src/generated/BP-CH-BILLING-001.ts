// Generated from docs/framework/contracts/BP-CH-BILLING-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/billing/exam-prices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List FederalExamPublicPrice (most recent first, capped at 500) */
    get: operations['listFederalExamPublicPrice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/exam-prices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getFederalExamPublicPrice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BillingItem (most recent first, capped at 500) */
    get: operations['listBillingItem'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBillingItem'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/invoices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BillingInvoice (most recent first, capped at 500) */
    get: operations['listBillingInvoice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/invoices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBillingInvoice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/divergences': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BillingDivergence (most recent first, capped at 500) */
    get: operations['listBillingDivergence'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/billing/divergences/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBillingDivergence'];
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
    FederalExamPublicPrice: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      exam_kind: 'MEDICAL' | 'PSYCH';
      amount_cents: number;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      ipca_reference_year: number;
      /** @default 'IPCA' */
      index_name: string;
      federal_source_reference: string;
      /** Format: date */
      published_at: string;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateFederalExamPublicPriceDto: {
      /** @enum {string} */
      exam_kind: 'MEDICAL' | 'PSYCH';
      amount_cents: number;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      ipca_reference_year: number;
      /** @default 'IPCA' */
      index_name: string;
      federal_source_reference: string;
      /** Format: date */
      published_at: string;
    };
    BillingItem: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      telehealth_session_id?: string | null;
      /** Format: uuid */
      federal_price_id?: string | null;
      /** @enum {string} */
      item_kind: 'PROTOCOL' | 'EXAM' | 'TELEHEALTH' | 'ADJUSTMENT';
      exam_kind?: string | null;
      /** @default 'PEC' */
      source: string;
      amount_cents: number;
      reference_number?: string | null;
      /**
       * @default 'ISSUED'
       * @enum {string}
       */
      status: 'ISSUED' | 'PAID' | 'ATTESTED' | 'DIVERGENT' | 'CANCELLED';
      /** Format: date-time */
      payment_validated_at?: string | null;
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
    CreateBillingItemDto: {
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      telehealth_session_id?: string | null;
      /** @enum {string} */
      item_kind: 'PROTOCOL' | 'EXAM' | 'TELEHEALTH' | 'ADJUSTMENT';
      exam_kind?: string | null;
      /** @default 'PEC' */
      source: string;
      reference_number?: string | null;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
    };
    BillingInvoice: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id?: string | null;
      reference_period: string;
      /**
       * @default 'OPEN'
       * @enum {string}
       */
      status: 'OPEN' | 'CLOSED' | 'ATTESTED' | 'PAID' | 'CANCELLED';
      /** @default 0 */
      total_cents: number;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      attested_at?: string | null;
      /** Format: date-time */
      paid_at?: string | null;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBillingInvoiceDto: {
      /** Format: uuid */
      clinic_id?: string | null;
      reference_period: string;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
    };
    BillingDivergence: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      invoice_id?: string | null;
      /** Format: uuid */
      item_id?: string | null;
      /**
       * @default 'OPEN'
       * @enum {string}
       */
      status: 'OPEN' | 'RESOLVED' | 'REJECTED';
      reason: string;
      resolution?: string | null;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      created_by: string;
      /** Format: uuid */
      resolved_by?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBillingDivergenceDto: {
      /** Format: uuid */
      invoice_id?: string | null;
      /** Format: uuid */
      item_id?: string | null;
      reason: string;
      /** @default '{}'::jsonb */
      payload: {
        [key: string]: unknown;
      };
    };
    BillingInvoiceItem: {
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      invoice_id: string;
      /** Format: uuid */
      item_id: string;
      /** Format: uuid */
      linked_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBillingInvoiceItemDto: {
      /** Format: uuid */
      invoice_id: string;
      /** Format: uuid */
      item_id: string;
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
  listFederalExamPublicPrice: {
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
          'application/json': components['schemas']['FederalExamPublicPrice'][];
        };
      };
    };
  };
  getFederalExamPublicPrice: {
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
          'application/json': components['schemas']['FederalExamPublicPrice'];
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
  listBillingItem: {
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
          'application/json': components['schemas']['BillingItem'][];
        };
      };
    };
  };
  getBillingItem: {
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
          'application/json': components['schemas']['BillingItem'];
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
  listBillingInvoice: {
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
          'application/json': components['schemas']['BillingInvoice'][];
        };
      };
    };
  };
  getBillingInvoice: {
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
          'application/json': components['schemas']['BillingInvoice'];
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
  listBillingDivergence: {
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
          'application/json': components['schemas']['BillingDivergence'][];
        };
      };
    };
  };
  getBillingDivergence: {
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
          'application/json': components['schemas']['BillingDivergence'];
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
