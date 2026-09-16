// Generated from docs/framework/contracts/BP-OPS-SNAPSHOTS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/snapshots/people': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Person (most recent first, capped at 500) */
    get: operations['listPerson'];
    put?: never;
    post: operations['createPerson'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/people/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPerson'];
    put?: never;
    post?: never;
    delete: operations['removePerson'];
    options?: never;
    head?: never;
    patch: operations['updatePerson'];
    trace?: never;
  };
  '/v1/ops/snapshots/person-documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PersonDocument (most recent first, capped at 500) */
    get: operations['listPersonDocument'];
    put?: never;
    post: operations['createPersonDocument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/person-documents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPersonDocument'];
    put?: never;
    post?: never;
    delete: operations['removePersonDocument'];
    options?: never;
    head?: never;
    patch: operations['updatePersonDocument'];
    trace?: never;
  };
  '/v1/ops/snapshots/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Vehicle (most recent first, capped at 500) */
    get: operations['listVehicle'];
    put?: never;
    post: operations['createVehicle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/vehicles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getVehicle'];
    put?: never;
    post?: never;
    delete: operations['removeVehicle'];
    options?: never;
    head?: never;
    patch: operations['updateVehicle'];
    trace?: never;
  };
  '/v1/ops/snapshots/external-queries': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ExternalQuery (most recent first, capped at 500) */
    get: operations['listExternalQuery'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/external-queries/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getExternalQuery'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/vehicle-snapshots': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List VehicleSnapshot (most recent first, capped at 500) */
    get: operations['listVehicleSnapshot'];
    put?: never;
    post: operations['createVehicleSnapshot'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/snapshots/vehicle-snapshots/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getVehicleSnapshot'];
    put?: never;
    post?: never;
    delete: operations['removeVehicleSnapshot'];
    options?: never;
    head?: never;
    patch: operations['updateVehicleSnapshot'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Person: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      person_type: string;
      name?: string | null;
      cpf?: string | null;
      cnpj?: string | null;
      /** Format: date */
      birth_date?: string | null;
      mother_name?: string | null;
      source: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePersonDto: {
      person_type: string;
      name?: string | null;
      cpf?: string | null;
      cnpj?: string | null;
      /** Format: date */
      birth_date?: string | null;
      mother_name?: string | null;
      source: string;
    };
    PersonDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      person_id: string;
      document_type: string;
      document_number: string;
      issuing_uf?: string | null;
      /** Format: date */
      valid_until?: string | null;
      license_category?: string | null;
      status?: string | null;
      source: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePersonDocumentDto: {
      /** Format: uuid */
      person_id: string;
      document_type: string;
      document_number: string;
      issuing_uf?: string | null;
      /** Format: date */
      valid_until?: string | null;
      license_category?: string | null;
      status?: string | null;
      source: string;
    };
    Vehicle: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      plate: string;
      renavam?: string | null;
      chassis?: string | null;
      uf?: string | null;
      municipality_code?: string | null;
      make_model?: string | null;
      species?: string | null;
      category?: string | null;
      color?: string | null;
      source: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateVehicleDto: {
      plate: string;
      renavam?: string | null;
      chassis?: string | null;
      uf?: string | null;
      municipality_code?: string | null;
      make_model?: string | null;
      species?: string | null;
      category?: string | null;
      color?: string | null;
      source: string;
    };
    ExternalQuery: {
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
      user_ref: string;
      /** Format: uuid */
      agent_id?: string | null;
      /** Format: uuid */
      device_id?: string | null;
      /** Format: uuid */
      external_system_id: string;
      query_type: string;
      parameters_hash: string;
      purpose: string;
      /**
       * Format: date-time
       * @default now()
       */
      queried_at: string;
      status: string;
      protocol?: string | null;
      result_summary?: string | null;
      result_snapshot_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateExternalQueryDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      user_ref: string;
      /** Format: uuid */
      agent_id?: string | null;
      /** Format: uuid */
      device_id?: string | null;
      /** Format: uuid */
      external_system_id: string;
      query_type: string;
      parameters_hash: string;
      purpose: string;
      /**
       * Format: date-time
       * @default now()
       */
      queried_at: string;
      status: string;
      protocol?: string | null;
      result_summary?: string | null;
      result_snapshot_json?: {
        [key: string]: unknown;
      } | null;
    };
    VehicleSnapshot: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      vehicle_id?: string | null;
      plate_snapshot: string;
      renavam_snapshot?: string | null;
      make_model_snapshot?: string | null;
      species_snapshot?: string | null;
      category_snapshot?: string | null;
      color_snapshot?: string | null;
      data_source: string;
      /** Format: uuid */
      external_query_id?: string | null;
      /** @default false */
      divergence_recorded: boolean;
      payload_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateVehicleSnapshotDto: {
      /** Format: uuid */
      vehicle_id?: string | null;
      plate_snapshot: string;
      renavam_snapshot?: string | null;
      make_model_snapshot?: string | null;
      species_snapshot?: string | null;
      category_snapshot?: string | null;
      color_snapshot?: string | null;
      data_source: string;
      /** Format: uuid */
      external_query_id?: string | null;
      /** @default false */
      divergence_recorded: boolean;
      payload_json?: {
        [key: string]: unknown;
      } | null;
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
  listPerson: {
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
          'application/json': components['schemas']['Person'][];
        };
      };
    };
  };
  createPerson: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePersonDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Person'];
        };
      };
    };
  };
  getPerson: {
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
          'application/json': components['schemas']['Person'];
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
  removePerson: {
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
  updatePerson: {
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
        'application/json': components['schemas']['CreatePersonDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Person'];
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
  listPersonDocument: {
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
          'application/json': components['schemas']['PersonDocument'][];
        };
      };
    };
  };
  createPersonDocument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePersonDocumentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PersonDocument'];
        };
      };
    };
  };
  getPersonDocument: {
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
          'application/json': components['schemas']['PersonDocument'];
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
  removePersonDocument: {
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
  updatePersonDocument: {
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
        'application/json': components['schemas']['CreatePersonDocumentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PersonDocument'];
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
  listVehicle: {
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
          'application/json': components['schemas']['Vehicle'][];
        };
      };
    };
  };
  createVehicle: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateVehicleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
        };
      };
    };
  };
  getVehicle: {
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
          'application/json': components['schemas']['Vehicle'];
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
  removeVehicle: {
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
  updateVehicle: {
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
        'application/json': components['schemas']['CreateVehicleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
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
  listExternalQuery: {
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
          'application/json': components['schemas']['ExternalQuery'][];
        };
      };
    };
  };
  getExternalQuery: {
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
          'application/json': components['schemas']['ExternalQuery'];
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
  listVehicleSnapshot: {
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
          'application/json': components['schemas']['VehicleSnapshot'][];
        };
      };
    };
  };
  createVehicleSnapshot: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateVehicleSnapshotDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleSnapshot'];
        };
      };
    };
  };
  getVehicleSnapshot: {
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
          'application/json': components['schemas']['VehicleSnapshot'];
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
  removeVehicleSnapshot: {
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
  updateVehicleSnapshot: {
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
        'application/json': components['schemas']['CreateVehicleSnapshotDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleSnapshot'];
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
