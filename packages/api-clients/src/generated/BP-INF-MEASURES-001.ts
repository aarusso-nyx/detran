// Generated from docs/framework/contracts/BP-INF-MEASURES-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/measures/types': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MeasureType (most recent first, capped at 500) */
    get: operations['listMeasureType'];
    put?: never;
    post: operations['createMeasureType'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/types/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMeasureType'];
    put?: never;
    post?: never;
    delete: operations['removeMeasureType'];
    options?: never;
    head?: never;
    patch: operations['updateMeasureType'];
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AdministrativeMeasure (most recent first, capped at 500) */
    get: operations['listAdministrativeMeasure'];
    put?: never;
    post: operations['createAdministrativeMeasure'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/administrative-measures/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAdministrativeMeasure'];
    put?: never;
    post?: never;
    delete: operations['removeAdministrativeMeasure'];
    options?: never;
    head?: never;
    patch: operations['updateAdministrativeMeasure'];
    trace?: never;
  };
  '/v1/inf/measures/terms': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AdministrativeTerm (most recent first, capped at 500) */
    get: operations['listAdministrativeTerm'];
    put?: never;
    post: operations['createAdministrativeTerm'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/terms/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAdministrativeTerm'];
    put?: never;
    post?: never;
    delete: operations['removeAdministrativeTerm'];
    options?: never;
    head?: never;
    patch: operations['updateAdministrativeTerm'];
    trace?: never;
  };
  '/v1/inf/measures/retentions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MeasureRetention (most recent first, capped at 500) */
    get: operations['listMeasureRetention'];
    put?: never;
    post: operations['createMeasureRetention'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/retentions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMeasureRetention'];
    put?: never;
    post?: never;
    delete: operations['removeMeasureRetention'];
    options?: never;
    head?: never;
    patch: operations['updateMeasureRetention'];
    trace?: never;
  };
  '/v1/inf/measures/removals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MeasureRemoval (most recent first, capped at 500) */
    get: operations['listMeasureRemoval'];
    put?: never;
    post: operations['createMeasureRemoval'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/removals/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMeasureRemoval'];
    put?: never;
    post?: never;
    delete: operations['removeMeasureRemoval'];
    options?: never;
    head?: never;
    patch: operations['updateMeasureRemoval'];
    trace?: never;
  };
  '/v1/inf/measures/vehicle-inventories': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List VehicleInventory (most recent first, capped at 500) */
    get: operations['listVehicleInventory'];
    put?: never;
    post: operations['createVehicleInventory'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/vehicle-inventories/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getVehicleInventory'];
    put?: never;
    post?: never;
    delete: operations['removeVehicleInventory'];
    options?: never;
    head?: never;
    patch: operations['updateVehicleInventory'];
    trace?: never;
  };
  '/v1/inf/measures/tow-providers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List TowProvider (most recent first, capped at 500) */
    get: operations['listTowProvider'];
    put?: never;
    post: operations['createTowProvider'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/tow-providers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getTowProvider'];
    put?: never;
    post?: never;
    delete: operations['removeTowProvider'];
    options?: never;
    head?: never;
    patch: operations['updateTowProvider'];
    trace?: never;
  };
  '/v1/inf/measures/yards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Yard (most recent first, capped at 500) */
    get: operations['listYard'];
    put?: never;
    post: operations['createYard'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/yards/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getYard'];
    put?: never;
    post?: never;
    delete: operations['removeYard'];
    options?: never;
    head?: never;
    patch: operations['updateYard'];
    trace?: never;
  };
  '/v1/inf/measures/status-history': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MeasureStatusHistory (most recent first, capped at 500) */
    get: operations['listMeasureStatusHistory'];
    put?: never;
    post: operations['createMeasureStatusHistory'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/measures/status-history/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMeasureStatusHistory'];
    put?: never;
    post?: never;
    delete: operations['removeMeasureStatusHistory'];
    options?: never;
    head?: never;
    patch: operations['updateMeasureStatusHistory'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    MeasureType: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      name: string;
      description?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMeasureTypeDto: {
      code: string;
      name: string;
      description?: string | null;
      /** @default 'active' */
      status: string;
    };
    AdministrativeMeasure: {
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
      measure_type_id: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      crash_record_id?: string | null;
      /** Format: uuid */
      approach_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      ended_at?: string | null;
      location_json?: {
        [key: string]: unknown;
      } | null;
      reason: string;
      /**
       * @default 'RETIDO'
       * @enum {string}
       */
      current_status:
        | 'RETIDO'
        | 'LIBERADO_LOCAL'
        | 'LIBERADO_COM_PRAZO'
        | 'REGULARIZADO'
        | 'CONVERTIDO_REMOCAO'
        | 'REMOVIDO'
        | 'EM_DEPOSITO'
        | 'GUARDA_MONITORADA'
        | 'VIOLACAO_MONITORAMENTO'
        | 'NOTIFICADO'
        | 'RESTITUIDO'
        | 'LEILAO';
      notes?: string | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAdministrativeMeasureDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      measure_type_id: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      crash_record_id?: string | null;
      /** Format: uuid */
      approach_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      ended_at?: string | null;
      location_json?: {
        [key: string]: unknown;
      } | null;
      reason: string;
      /**
       * @default 'RETIDO'
       * @enum {string}
       */
      current_status:
        | 'RETIDO'
        | 'LIBERADO_LOCAL'
        | 'LIBERADO_COM_PRAZO'
        | 'REGULARIZADO'
        | 'CONVERTIDO_REMOCAO'
        | 'REMOVIDO'
        | 'EM_DEPOSITO'
        | 'GUARDA_MONITORADA'
        | 'VIOLACAO_MONITORAMENTO'
        | 'NOTIFICADO'
        | 'RESTITUIDO'
        | 'LEILAO';
      notes?: string | null;
      location_geom?: unknown;
    };
    AdministrativeTerm: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      measure_id: string;
      term_type: string;
      term_number: string;
      content_hash: string;
      /** Format: uuid */
      file_evidence_id?: string | null;
      /** Format: date-time */
      issued_at: string;
      /** Format: uuid */
      signed_by_person_id?: string | null;
      signer_name?: string | null;
      /** Format: date-time */
      withdrawal_deadline_at?: string | null;
      /** Format: date-time */
      ctb_deadline_at?: string | null;
      field_details_json?: {
        [key: string]: unknown;
      } | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      /** @default 'issued' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAdministrativeTermDto: {
      /** Format: uuid */
      measure_id: string;
      term_type: string;
      term_number: string;
      content_hash: string;
      /** Format: uuid */
      file_evidence_id?: string | null;
      /** Format: date-time */
      issued_at: string;
      /** Format: uuid */
      signed_by_person_id?: string | null;
      signer_name?: string | null;
      /** Format: date-time */
      withdrawal_deadline_at?: string | null;
      /** Format: date-time */
      ctb_deadline_at?: string | null;
      field_details_json?: {
        [key: string]: unknown;
      } | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      /** @default 'issued' */
      status: string;
    };
    MeasureRetention: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      retention_reason: string;
      /** Format: date-time */
      regularization_deadline_at?: string | null;
      regularization_deadline_days?: number | null;
      /** Format: date-time */
      regularized_at?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** Format: uuid */
      release_user_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMeasureRetentionDto: {
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      retention_reason: string;
      /** Format: date-time */
      regularization_deadline_at?: string | null;
      regularization_deadline_days?: number | null;
      /** Format: date-time */
      regularized_at?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** Format: uuid */
      release_user_ref?: string | null;
    };
    MeasureRemoval: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      /** Format: uuid */
      tow_provider_id?: string | null;
      /** Format: uuid */
      yard_id?: string | null;
      /** Format: date-time */
      requested_at?: string | null;
      /** Format: date-time */
      tow_arrived_at?: string | null;
      /** Format: date-time */
      delivered_at?: string | null;
      /** Format: date-time */
      regularization_deadline_at?: string | null;
      regularization_deadline_days?: number | null;
      destination_description?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMeasureRemovalDto: {
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      /** Format: uuid */
      tow_provider_id?: string | null;
      /** Format: uuid */
      yard_id?: string | null;
      /** Format: date-time */
      requested_at?: string | null;
      /** Format: date-time */
      tow_arrived_at?: string | null;
      /** Format: date-time */
      delivered_at?: string | null;
      /** Format: date-time */
      regularization_deadline_at?: string | null;
      regularization_deadline_days?: number | null;
      destination_description?: string | null;
    };
    VehicleInventory: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      inventory_json: {
        [key: string]: unknown;
      };
      damage_description?: string | null;
      /** Format: uuid */
      signed_by_person_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateVehicleInventoryDto: {
      /** Format: uuid */
      measure_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      inventory_json: {
        [key: string]: unknown;
      };
      damage_description?: string | null;
      /** Format: uuid */
      signed_by_person_id?: string | null;
    };
    TowProvider: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      name: string;
      document_number?: string | null;
      contact_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTowProviderDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      name: string;
      document_number?: string | null;
      contact_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'active' */
      status: string;
    };
    Yard: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      name: string;
      address?: string | null;
      location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'active' */
      status: string;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateYardDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      name: string;
      address?: string | null;
      location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'active' */
      status: string;
      location_geom?: unknown;
    };
    MeasureStatusHistory: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      measure_id: string;
      status: string;
      /**
       * Format: date-time
       * @default now()
       */
      changed_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      reason?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMeasureStatusHistoryDto: {
      /** Format: uuid */
      measure_id: string;
      status: string;
      /**
       * Format: date-time
       * @default now()
       */
      changed_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      reason?: string | null;
      details_json?: {
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
  listMeasureType: {
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
          'application/json': components['schemas']['MeasureType'][];
        };
      };
    };
  };
  createMeasureType: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMeasureTypeDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureType'];
        };
      };
    };
  };
  getMeasureType: {
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
          'application/json': components['schemas']['MeasureType'];
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
  removeMeasureType: {
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
  updateMeasureType: {
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
        'application/json': components['schemas']['CreateMeasureTypeDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureType'];
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
  listAdministrativeMeasure: {
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
          'application/json': components['schemas']['AdministrativeMeasure'][];
        };
      };
    };
  };
  createAdministrativeMeasure: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAdministrativeMeasureDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdministrativeMeasure'];
        };
      };
    };
  };
  getAdministrativeMeasure: {
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
          'application/json': components['schemas']['AdministrativeMeasure'];
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
  removeAdministrativeMeasure: {
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
  updateAdministrativeMeasure: {
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
        'application/json': components['schemas']['CreateAdministrativeMeasureDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdministrativeMeasure'];
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
  listAdministrativeTerm: {
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
          'application/json': components['schemas']['AdministrativeTerm'][];
        };
      };
    };
  };
  createAdministrativeTerm: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAdministrativeTermDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdministrativeTerm'];
        };
      };
    };
  };
  getAdministrativeTerm: {
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
          'application/json': components['schemas']['AdministrativeTerm'];
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
  removeAdministrativeTerm: {
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
  updateAdministrativeTerm: {
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
        'application/json': components['schemas']['CreateAdministrativeTermDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdministrativeTerm'];
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
  listMeasureRetention: {
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
          'application/json': components['schemas']['MeasureRetention'][];
        };
      };
    };
  };
  createMeasureRetention: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMeasureRetentionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureRetention'];
        };
      };
    };
  };
  getMeasureRetention: {
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
          'application/json': components['schemas']['MeasureRetention'];
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
  removeMeasureRetention: {
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
  updateMeasureRetention: {
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
        'application/json': components['schemas']['CreateMeasureRetentionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureRetention'];
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
  listMeasureRemoval: {
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
          'application/json': components['schemas']['MeasureRemoval'][];
        };
      };
    };
  };
  createMeasureRemoval: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMeasureRemovalDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureRemoval'];
        };
      };
    };
  };
  getMeasureRemoval: {
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
          'application/json': components['schemas']['MeasureRemoval'];
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
  removeMeasureRemoval: {
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
  updateMeasureRemoval: {
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
        'application/json': components['schemas']['CreateMeasureRemovalDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureRemoval'];
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
  listVehicleInventory: {
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
          'application/json': components['schemas']['VehicleInventory'][];
        };
      };
    };
  };
  createVehicleInventory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateVehicleInventoryDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleInventory'];
        };
      };
    };
  };
  getVehicleInventory: {
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
          'application/json': components['schemas']['VehicleInventory'];
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
  removeVehicleInventory: {
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
  updateVehicleInventory: {
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
        'application/json': components['schemas']['CreateVehicleInventoryDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleInventory'];
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
  listTowProvider: {
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
          'application/json': components['schemas']['TowProvider'][];
        };
      };
    };
  };
  createTowProvider: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateTowProviderDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TowProvider'];
        };
      };
    };
  };
  getTowProvider: {
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
          'application/json': components['schemas']['TowProvider'];
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
  removeTowProvider: {
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
  updateTowProvider: {
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
        'application/json': components['schemas']['CreateTowProviderDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TowProvider'];
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
  listYard: {
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
          'application/json': components['schemas']['Yard'][];
        };
      };
    };
  };
  createYard: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateYardDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Yard'];
        };
      };
    };
  };
  getYard: {
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
          'application/json': components['schemas']['Yard'];
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
  removeYard: {
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
  updateYard: {
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
        'application/json': components['schemas']['CreateYardDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Yard'];
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
  listMeasureStatusHistory: {
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
          'application/json': components['schemas']['MeasureStatusHistory'][];
        };
      };
    };
  };
  createMeasureStatusHistory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMeasureStatusHistoryDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureStatusHistory'];
        };
      };
    };
  };
  getMeasureStatusHistory: {
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
          'application/json': components['schemas']['MeasureStatusHistory'];
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
  removeMeasureStatusHistory: {
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
  updateMeasureStatusHistory: {
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
        'application/json': components['schemas']['CreateMeasureStatusHistoryDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasureStatusHistory'];
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
