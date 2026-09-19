// Generated from docs/framework/contracts/BP-INF-ALCOHOL-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/alcohol/procedures': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AlcoholProcedure (most recent first, capped at 500) */
    get: operations['listAlcoholProcedure'];
    put?: never;
    post: operations['createAlcoholProcedure'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/procedures/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAlcoholProcedure'];
    put?: never;
    post?: never;
    delete: operations['removeAlcoholProcedure'];
    options?: never;
    head?: never;
    patch: operations['updateAlcoholProcedure'];
    trace?: never;
  };
  '/v1/inf/alcohol/breathalyzers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Breathalyzer (most recent first, capped at 500) */
    get: operations['listBreathalyzer'];
    put?: never;
    post: operations['createBreathalyzer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/breathalyzers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBreathalyzer'];
    put?: never;
    post?: never;
    delete: operations['removeBreathalyzer'];
    options?: never;
    head?: never;
    patch: operations['updateBreathalyzer'];
    trace?: never;
  };
  '/v1/inf/alcohol/tests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AlcoholTest (most recent first, capped at 500) */
    get: operations['listAlcoholTest'];
    put?: never;
    post: operations['createAlcoholTest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/tests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAlcoholTest'];
    put?: never;
    post?: never;
    delete: operations['removeAlcoholTest'];
    options?: never;
    head?: never;
    patch: operations['updateAlcoholTest'];
    trace?: never;
  };
  '/v1/inf/alcohol/refusals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AlcoholRefusal (most recent first, capped at 500) */
    get: operations['listAlcoholRefusal'];
    put?: never;
    post: operations['createAlcoholRefusal'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/refusals/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAlcoholRefusal'];
    put?: never;
    post?: never;
    delete: operations['removeAlcoholRefusal'];
    options?: never;
    head?: never;
    patch: operations['updateAlcoholRefusal'];
    trace?: never;
  };
  '/v1/inf/alcohol/psychomotor-signs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PsychomotorSign (most recent first, capped at 500) */
    get: operations['listPsychomotorSign'];
    put?: never;
    post: operations['createPsychomotorSign'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/psychomotor-signs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPsychomotorSign'];
    put?: never;
    post?: never;
    delete: operations['removePsychomotorSign'];
    options?: never;
    head?: never;
    patch: operations['updatePsychomotorSign'];
    trace?: never;
  };
  '/v1/inf/alcohol/forwardings': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AlcoholForwarding (most recent first, capped at 500) */
    get: operations['listAlcoholForwarding'];
    put?: never;
    post: operations['createAlcoholForwarding'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/alcohol/forwardings/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAlcoholForwarding'];
    put?: never;
    post?: never;
    delete: operations['removeAlcoholForwarding'];
    options?: never;
    head?: never;
    patch: operations['updateAlcoholForwarding'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AlcoholProcedure: {
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
      ait_id?: string | null;
      /** Format: uuid */
      measure_id?: string | null;
      /** Format: uuid */
      approach_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      driver_person_id?: string | null;
      /** Format: date-time */
      procedure_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      procedure_type: string;
      outcome: string;
      /** @default 'draft' */
      status: string;
      notes?: string | null;
      ait_local_id?: string | null;
      sign_catalog_id?: string | null;
      sign_catalog_version?: string | null;
      driver_name?: string | null;
      driver_document?: string | null;
      vehicle_plate?: string | null;
      vehicle_make?: string | null;
      refused_procedures?: boolean | null;
      driver_statement_json?: {
        [key: string]: unknown;
      } | null;
      witnesses_json?: {
        [key: string]: unknown;
      } | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlcoholProcedureDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      measure_id?: string | null;
      /** Format: uuid */
      approach_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      driver_person_id?: string | null;
      /** Format: date-time */
      procedure_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      procedure_type: string;
      outcome: string;
      /** @default 'draft' */
      status: string;
      notes?: string | null;
      ait_local_id?: string | null;
      sign_catalog_id?: string | null;
      sign_catalog_version?: string | null;
      driver_name?: string | null;
      driver_document?: string | null;
      vehicle_plate?: string | null;
      vehicle_make?: string | null;
      refused_procedures?: boolean | null;
      driver_statement_json?: {
        [key: string]: unknown;
      } | null;
      witnesses_json?: {
        [key: string]: unknown;
      } | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      location_geom?: unknown;
    };
    Breathalyzer: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      serial_number: string;
      model?: string | null;
      manufacturer?: string | null;
      /** Format: date */
      last_calibration_at?: string | null;
      /** Format: date */
      calibration_valid_until?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBreathalyzerDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      serial_number: string;
      model?: string | null;
      manufacturer?: string | null;
      /** Format: date */
      last_calibration_at?: string | null;
      /** Format: date */
      calibration_valid_until?: string | null;
      /** @default 'active' */
      status: string;
    };
    AlcoholTest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      procedure_id: string;
      /** Format: uuid */
      breathalyzer_id?: string | null;
      test_number?: string | null;
      /** Format: date-time */
      tested_at: string;
      result_mg_l?: number | null;
      considered_mg_l?: number | null;
      max_error_mg_l?: number | null;
      /** @default false */
      counterproof: boolean;
      /** Format: uuid */
      result_image_evidence_id?: string | null;
      /** @default 'recorded' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlcoholTestDto: {
      /** Format: uuid */
      procedure_id: string;
      /** Format: uuid */
      breathalyzer_id?: string | null;
      test_number?: string | null;
      /** Format: date-time */
      tested_at: string;
      result_mg_l?: number | null;
      considered_mg_l?: number | null;
      max_error_mg_l?: number | null;
      /** @default false */
      counterproof: boolean;
      /** Format: uuid */
      result_image_evidence_id?: string | null;
      /** @default 'recorded' */
      status: string;
    };
    AlcoholRefusal: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      procedure_id: string;
      /** Format: date-time */
      refused_at: string;
      /** @enum {string} */
      kind: 'refusal' | 'technical_impossibility';
      refusal_description: string;
      /** Format: uuid */
      witness_person_id?: string | null;
      /** Format: uuid */
      evidence_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlcoholRefusalDto: {
      /** Format: uuid */
      procedure_id: string;
      /** Format: date-time */
      refused_at: string;
      /** @enum {string} */
      kind: 'refusal' | 'technical_impossibility';
      refusal_description: string;
      /** Format: uuid */
      witness_person_id?: string | null;
      /** Format: uuid */
      evidence_id?: string | null;
    };
    PsychomotorSign: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      procedure_id: string;
      sign_code: string;
      description: string;
      /** @default true */
      observed: boolean;
      sign_group?: string | null;
      sign_status?: string | null;
      method?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePsychomotorSignDto: {
      /** Format: uuid */
      procedure_id: string;
      sign_code: string;
      description: string;
      /** @default true */
      observed: boolean;
      sign_group?: string | null;
      sign_status?: string | null;
      method?: string | null;
    };
    AlcoholForwarding: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      procedure_id: string;
      forwarding_type: string;
      destination: string;
      /** Format: date-time */
      forwarded_at: string;
      protocol?: string | null;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlcoholForwardingDto: {
      /** Format: uuid */
      procedure_id: string;
      forwarding_type: string;
      destination: string;
      /** Format: date-time */
      forwarded_at: string;
      protocol?: string | null;
      notes?: string | null;
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
  listAlcoholProcedure: {
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
          'application/json': components['schemas']['AlcoholProcedure'][];
        };
      };
    };
  };
  createAlcoholProcedure: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAlcoholProcedureDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholProcedure'];
        };
      };
    };
  };
  getAlcoholProcedure: {
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
          'application/json': components['schemas']['AlcoholProcedure'];
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
  removeAlcoholProcedure: {
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
  updateAlcoholProcedure: {
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
        'application/json': components['schemas']['CreateAlcoholProcedureDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholProcedure'];
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
  listBreathalyzer: {
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
          'application/json': components['schemas']['Breathalyzer'][];
        };
      };
    };
  };
  createBreathalyzer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateBreathalyzerDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Breathalyzer'];
        };
      };
    };
  };
  getBreathalyzer: {
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
          'application/json': components['schemas']['Breathalyzer'];
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
  removeBreathalyzer: {
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
  updateBreathalyzer: {
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
        'application/json': components['schemas']['CreateBreathalyzerDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Breathalyzer'];
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
  listAlcoholTest: {
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
          'application/json': components['schemas']['AlcoholTest'][];
        };
      };
    };
  };
  createAlcoholTest: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAlcoholTestDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholTest'];
        };
      };
    };
  };
  getAlcoholTest: {
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
          'application/json': components['schemas']['AlcoholTest'];
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
  removeAlcoholTest: {
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
  updateAlcoholTest: {
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
        'application/json': components['schemas']['CreateAlcoholTestDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholTest'];
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
  listAlcoholRefusal: {
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
          'application/json': components['schemas']['AlcoholRefusal'][];
        };
      };
    };
  };
  createAlcoholRefusal: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAlcoholRefusalDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholRefusal'];
        };
      };
    };
  };
  getAlcoholRefusal: {
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
          'application/json': components['schemas']['AlcoholRefusal'];
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
  removeAlcoholRefusal: {
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
  updateAlcoholRefusal: {
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
        'application/json': components['schemas']['CreateAlcoholRefusalDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholRefusal'];
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
  listPsychomotorSign: {
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
          'application/json': components['schemas']['PsychomotorSign'][];
        };
      };
    };
  };
  createPsychomotorSign: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePsychomotorSignDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PsychomotorSign'];
        };
      };
    };
  };
  getPsychomotorSign: {
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
          'application/json': components['schemas']['PsychomotorSign'];
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
  removePsychomotorSign: {
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
  updatePsychomotorSign: {
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
        'application/json': components['schemas']['CreatePsychomotorSignDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PsychomotorSign'];
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
  listAlcoholForwarding: {
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
          'application/json': components['schemas']['AlcoholForwarding'][];
        };
      };
    };
  };
  createAlcoholForwarding: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAlcoholForwardingDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholForwarding'];
        };
      };
    };
  };
  getAlcoholForwarding: {
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
          'application/json': components['schemas']['AlcoholForwarding'];
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
  removeAlcoholForwarding: {
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
  updateAlcoholForwarding: {
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
        'application/json': components['schemas']['CreateAlcoholForwardingDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlcoholForwarding'];
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
