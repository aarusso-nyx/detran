// Generated from docs/framework/contracts/BP-INF-NORMATIVE-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/normative/catalogs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeCatalog (most recent first, capped at 500) */
    get: operations['listNormativeCatalog'];
    put?: never;
    post: operations['createNormativeCatalog'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/catalogs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeCatalog'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeCatalog'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeCatalog'];
    trace?: never;
  };
  '/v1/inf/normative/framings': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeFraming (most recent first, capped at 500) */
    get: operations['listNormativeFraming'];
    put?: never;
    post: operations['createNormativeFraming'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/framings/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeFraming'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeFraming'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeFraming'];
    trace?: never;
  };
  '/v1/inf/normative/metrological-tables': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeMetrologicalTable (most recent first, capped at 500) */
    get: operations['listNormativeMetrologicalTable'];
    put?: never;
    post: operations['createNormativeMetrologicalTable'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/metrological-tables/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeMetrologicalTable'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeMetrologicalTable'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeMetrologicalTable'];
    trace?: never;
  };
  '/v1/inf/normative/validation-rules': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeValidationRule (most recent first, capped at 500) */
    get: operations['listNormativeValidationRule'];
    put?: never;
    post: operations['createNormativeValidationRule'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/validation-rules/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeValidationRule'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeValidationRule'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeValidationRule'];
    trace?: never;
  };
  '/v1/inf/normative/agency-parameters': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeAgencyParameter (most recent first, capped at 500) */
    get: operations['listNormativeAgencyParameter'];
    put?: never;
    post: operations['createNormativeAgencyParameter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/agency-parameters/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeAgencyParameter'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeAgencyParameter'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeAgencyParameter'];
    trace?: never;
  };
  '/v1/inf/normative/document-templates': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NormativeDocumentTemplate (most recent first, capped at 500) */
    get: operations['listNormativeDocumentTemplate'];
    put?: never;
    post: operations['createNormativeDocumentTemplate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/document-templates/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNormativeDocumentTemplate'];
    put?: never;
    post?: never;
    delete: operations['removeNormativeDocumentTemplate'];
    options?: never;
    head?: never;
    patch: operations['updateNormativeDocumentTemplate'];
    trace?: never;
  };
  '/v1/inf/normative/signature-policies': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SignaturePolicy (most recent first, capped at 500) */
    get: operations['listSignaturePolicy'];
    put?: never;
    post: operations['createSignaturePolicy'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/signature-policies/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSignaturePolicy'];
    put?: never;
    post?: never;
    delete: operations['removeSignaturePolicy'];
    options?: never;
    head?: never;
    patch: operations['updateSignaturePolicy'];
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MobileNormativePackage (most recent first, capped at 500) */
    get: operations['listMobileNormativePackage'];
    put?: never;
    post: operations['createMobileNormativePackage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/normative/mobile-packages/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMobileNormativePackage'];
    put?: never;
    post?: never;
    delete: operations['removeMobileNormativePackage'];
    options?: never;
    head?: never;
    patch: operations['updateMobileNormativePackage'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    NormativeCatalog: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id?: string | null;
      name: string;
      catalog_type: string;
      version: string;
      /** Format: date */
      published_at?: string | null;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'draft' */
      status: string;
      normative_source?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeCatalogDto: {
      /** Format: uuid */
      traffic_agency_id?: string | null;
      name: string;
      catalog_type: string;
      version: string;
      /** Format: date */
      published_at?: string | null;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'draft' */
      status: string;
      normative_source?: string | null;
    };
    NormativeFraming: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      catalog_id: string;
      framing_code: string;
      article?: string | null;
      clause?: string | null;
      description: string;
      severity?: string | null;
      penalty?: string | null;
      administrative_measure_summary?: string | null;
      /** @enum {string} */
      approach_class: 'caso_1' | 'caso_2' | 'caso_3';
      required_fields?: {
        [key: string]: unknown;
      } | null;
      /** @default false */
      required_instrument: boolean;
      points_label?: string | null;
      /** @default false */
      requires_observation: boolean;
      /** @default false */
      requires_equipment: boolean;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeFramingDto: {
      /** Format: uuid */
      catalog_id: string;
      framing_code: string;
      article?: string | null;
      clause?: string | null;
      description: string;
      severity?: string | null;
      penalty?: string | null;
      administrative_measure_summary?: string | null;
      /** @enum {string} */
      approach_class: 'caso_1' | 'caso_2' | 'caso_3';
      required_fields?: {
        [key: string]: unknown;
      } | null;
      /** @default false */
      required_instrument: boolean;
      points_label?: string | null;
      /** @default false */
      requires_observation: boolean;
      /** @default false */
      requires_equipment: boolean;
      /** @default 'active' */
      status: string;
    };
    NormativeMetrologicalTable: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      catalog_id: string;
      table_name: string;
      version: string;
      table_json: {
        [key: string]: unknown;
      };
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeMetrologicalTableDto: {
      /** Format: uuid */
      catalog_id: string;
      table_name: string;
      version: string;
      table_json: {
        [key: string]: unknown;
      };
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'active' */
      status: string;
    };
    NormativeValidationRule: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      catalog_id: string;
      /** Format: uuid */
      framing_id?: string | null;
      rule_code: string;
      description: string;
      rule_type: string;
      expression_json?: {
        [key: string]: unknown;
      } | null;
      user_message?: string | null;
      severity: string;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeValidationRuleDto: {
      /** Format: uuid */
      catalog_id: string;
      /** Format: uuid */
      framing_id?: string | null;
      rule_code: string;
      description: string;
      rule_type: string;
      expression_json?: {
        [key: string]: unknown;
      } | null;
      user_message?: string | null;
      severity: string;
      /** @default 'active' */
      status: string;
    };
    NormativeAgencyParameter: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      key: string;
      value_json: {
        [key: string]: unknown;
      };
      value_type: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeAgencyParameterDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      key: string;
      value_json: {
        [key: string]: unknown;
      };
      value_type: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** @default 'active' */
      status: string;
    };
    NormativeDocumentTemplate: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      document_kind: string;
      /** @default 'inf' */
      domain_scope: string;
      name: string;
      version: string;
      template_body: string;
      /** Format: date */
      valid_from: string;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNormativeDocumentTemplateDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      document_kind: string;
      /** @default 'inf' */
      domain_scope: string;
      name: string;
      version: string;
      template_body: string;
      /** Format: date */
      valid_from: string;
      /** @default 'active' */
      status: string;
    };
    SignaturePolicy: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      document_kind: string;
      required_signers_json: {
        [key: string]: unknown;
      };
      pades_level: string;
      /** @default false */
      tsa_required: boolean;
      /** @default false */
      pdfa_required: boolean;
      govbr_level?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSignaturePolicyDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      document_kind: string;
      required_signers_json: {
        [key: string]: unknown;
      };
      pades_level: string;
      /** @default false */
      tsa_required: boolean;
      /** @default false */
      pdfa_required: boolean;
      govbr_level?: string | null;
      /** @default 'active' */
      status: string;
    };
    MobileNormativePackage: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      catalog_id: string;
      package_version: string;
      manifest_hash: string;
      package_uri: string;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: date */
      valid_until?: string | null;
      /** @default 'draft' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMobileNormativePackageDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      catalog_id: string;
      package_version: string;
      manifest_hash: string;
      package_uri: string;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: date */
      valid_until?: string | null;
      /** @default 'draft' */
      status: string;
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
  listNormativeCatalog: {
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
          'application/json': components['schemas']['NormativeCatalog'][];
        };
      };
    };
  };
  createNormativeCatalog: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeCatalogDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeCatalog'];
        };
      };
    };
  };
  getNormativeCatalog: {
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
          'application/json': components['schemas']['NormativeCatalog'];
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
  removeNormativeCatalog: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeCatalog: {
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
        'application/json': components['schemas']['CreateNormativeCatalogDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeCatalog'];
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
  listNormativeFraming: {
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
          'application/json': components['schemas']['NormativeFraming'][];
        };
      };
    };
  };
  createNormativeFraming: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeFramingDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeFraming'];
        };
      };
    };
  };
  getNormativeFraming: {
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
          'application/json': components['schemas']['NormativeFraming'];
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
  removeNormativeFraming: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeFraming: {
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
        'application/json': components['schemas']['CreateNormativeFramingDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeFraming'];
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
  listNormativeMetrologicalTable: {
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
          'application/json': components['schemas']['NormativeMetrologicalTable'][];
        };
      };
    };
  };
  createNormativeMetrologicalTable: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeMetrologicalTableDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeMetrologicalTable'];
        };
      };
    };
  };
  getNormativeMetrologicalTable: {
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
          'application/json': components['schemas']['NormativeMetrologicalTable'];
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
  removeNormativeMetrologicalTable: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeMetrologicalTable: {
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
        'application/json': components['schemas']['CreateNormativeMetrologicalTableDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeMetrologicalTable'];
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
  listNormativeValidationRule: {
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
          'application/json': components['schemas']['NormativeValidationRule'][];
        };
      };
    };
  };
  createNormativeValidationRule: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeValidationRuleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeValidationRule'];
        };
      };
    };
  };
  getNormativeValidationRule: {
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
          'application/json': components['schemas']['NormativeValidationRule'];
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
  removeNormativeValidationRule: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeValidationRule: {
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
        'application/json': components['schemas']['CreateNormativeValidationRuleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeValidationRule'];
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
  listNormativeAgencyParameter: {
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
          'application/json': components['schemas']['NormativeAgencyParameter'][];
        };
      };
    };
  };
  createNormativeAgencyParameter: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeAgencyParameterDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeAgencyParameter'];
        };
      };
    };
  };
  getNormativeAgencyParameter: {
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
          'application/json': components['schemas']['NormativeAgencyParameter'];
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
  removeNormativeAgencyParameter: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeAgencyParameter: {
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
        'application/json': components['schemas']['CreateNormativeAgencyParameterDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeAgencyParameter'];
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
  listNormativeDocumentTemplate: {
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
          'application/json': components['schemas']['NormativeDocumentTemplate'][];
        };
      };
    };
  };
  createNormativeDocumentTemplate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNormativeDocumentTemplateDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeDocumentTemplate'];
        };
      };
    };
  };
  getNormativeDocumentTemplate: {
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
          'application/json': components['schemas']['NormativeDocumentTemplate'];
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
  removeNormativeDocumentTemplate: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateNormativeDocumentTemplate: {
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
        'application/json': components['schemas']['CreateNormativeDocumentTemplateDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NormativeDocumentTemplate'];
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
  listSignaturePolicy: {
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
          'application/json': components['schemas']['SignaturePolicy'][];
        };
      };
    };
  };
  createSignaturePolicy: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSignaturePolicyDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SignaturePolicy'];
        };
      };
    };
  };
  getSignaturePolicy: {
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
          'application/json': components['schemas']['SignaturePolicy'];
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
  removeSignaturePolicy: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateSignaturePolicy: {
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
        'application/json': components['schemas']['CreateSignaturePolicyDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SignaturePolicy'];
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
  listMobileNormativePackage: {
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
          'application/json': components['schemas']['MobileNormativePackage'][];
        };
      };
    };
  };
  createMobileNormativePackage: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMobileNormativePackageDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MobileNormativePackage'];
        };
      };
    };
  };
  getMobileNormativePackage: {
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
          'application/json': components['schemas']['MobileNormativePackage'];
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
  removeMobileNormativePackage: {
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
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  updateMobileNormativePackage: {
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
        'application/json': components['schemas']['CreateMobileNormativePackageDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MobileNormativePackage'];
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
