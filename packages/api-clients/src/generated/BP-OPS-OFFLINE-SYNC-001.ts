// Generated from docs/framework/contracts/BP-OPS-OFFLINE-SYNC-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/offline-sync/numbering-ranges': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitNumberingRange (most recent first, capped at 500) */
    get: operations['listAitNumberingRange'];
    put?: never;
    post: operations['createAitNumberingRange'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/numbering-ranges/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitNumberingRange'];
    put?: never;
    post?: never;
    delete: operations['removeAitNumberingRange'];
    options?: never;
    head?: never;
    patch: operations['updateAitNumberingRange'];
    trace?: never;
  };
  '/v1/ops/offline-sync/numbering-reservations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NumberingReservation (most recent first, capped at 500) */
    get: operations['listNumberingReservation'];
    put?: never;
    post: operations['createNumberingReservation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/numbering-reservations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNumberingReservation'];
    put?: never;
    post?: never;
    delete: operations['removeNumberingReservation'];
    options?: never;
    head?: never;
    patch: operations['updateNumberingReservation'];
    trace?: never;
  };
  '/v1/ops/offline-sync/numbering-consumptions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NumberingConsumption (most recent first, capped at 500) */
    get: operations['listNumberingConsumption'];
    put?: never;
    post: operations['createNumberingConsumption'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/numbering-consumptions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNumberingConsumption'];
    put?: never;
    post?: never;
    delete: operations['removeNumberingConsumption'];
    options?: never;
    head?: never;
    patch: operations['updateNumberingConsumption'];
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-batches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SyncBatch (most recent first, capped at 500) */
    get: operations['listSyncBatch'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-batches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSyncBatch'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-queue-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SyncQueueItem (most recent first, capped at 500) */
    get: operations['listSyncQueueItem'];
    put?: never;
    post: operations['createSyncQueueItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-queue-items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSyncQueueItem'];
    put?: never;
    post?: never;
    delete: operations['removeSyncQueueItem'];
    options?: never;
    head?: never;
    patch: operations['updateSyncQueueItem'];
    trace?: never;
  };
  '/v1/ops/offline-sync/receipts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SyncReceipt (most recent first, capped at 500) */
    get: operations['listSyncReceipt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-conflicts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SyncConflict (most recent first, capped at 500) */
    get: operations['listSyncConflict'];
    put?: never;
    post: operations['createSyncConflict'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/offline-sync/sync-conflicts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSyncConflict'];
    put?: never;
    post?: never;
    delete: operations['removeSyncConflict'];
    options?: never;
    head?: never;
    patch: operations['updateSyncConflict'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AitNumberingRange: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      series: string;
      start_number: number;
      end_number: number;
      next_number: number;
      /** @default 'active' */
      status: string;
      usage_mode: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitNumberingRangeDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      series: string;
      start_number: number;
      end_number: number;
      next_number: number;
      /** @default 'active' */
      status: string;
      usage_mode: string;
    };
    NumberingReservation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      range_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      shift_id?: string | null;
      idempotency_key?: string | null;
      start_number: number;
      end_number: number;
      /**
       * Format: date-time
       * @default now()
       */
      reserved_at: string;
      /** Format: date-time */
      valid_until: string;
      /** @default 'reserved' */
      status: string;
      reconciliation_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNumberingReservationDto: {
      /** Format: uuid */
      range_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      shift_id?: string | null;
      idempotency_key?: string | null;
      start_number: number;
      end_number: number;
      /**
       * Format: date-time
       * @default now()
       */
      reserved_at: string;
      /** Format: date-time */
      valid_until: string;
      /** @default 'reserved' */
      status: string;
      reconciliation_json?: {
        [key: string]: unknown;
      } | null;
    };
    NumberingConsumption: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      reservation_id: string;
      /** Format: uuid */
      range_id: string;
      number: number;
      /** Format: uuid */
      local_entity_id?: string | null;
      idempotency_key?: string | null;
      /** Format: uuid */
      server_entity_id?: string | null;
      /** Format: date-time */
      finalized_at?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      reconciled_at: string;
      /** @default 'applied' */
      status: string;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNumberingConsumptionDto: {
      /** Format: uuid */
      reservation_id: string;
      /** Format: uuid */
      range_id: string;
      number: number;
      /** Format: uuid */
      local_entity_id?: string | null;
      idempotency_key?: string | null;
      /** Format: uuid */
      server_entity_id?: string | null;
      /** Format: date-time */
      finalized_at?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      reconciled_at: string;
      /** @default 'applied' */
      status: string;
      details_json?: {
        [key: string]: unknown;
      } | null;
    };
    SyncBatch: {
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
      agent_id: string;
      /** Format: uuid */
      device_id: string;
      device_batch_id: string;
      batch_sequence?: number | null;
      /**
       * Format: date-time
       * @default now()
       */
      submitted_at: string;
      /** @default 0 */
      accepted_items: number;
      receipts_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSyncBatchDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      device_id: string;
      device_batch_id: string;
      batch_sequence?: number | null;
      /**
       * Format: date-time
       * @default now()
       */
      submitted_at: string;
      /** @default 0 */
      accepted_items: number;
      receipts_json?: {
        [key: string]: unknown;
      } | null;
    };
    SyncQueueItem: {
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
      device_id: string;
      /** Format: uuid */
      agent_id: string;
      entity_type: string;
      /** Format: uuid */
      local_entity_id: string;
      /** Format: uuid */
      server_entity_id?: string | null;
      /** @default 'pending' */
      status: string;
      /** @default 0 */
      attempts: number;
      /** Format: date-time */
      created_locally_at: string;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: date-time */
      received_at?: string | null;
      idempotency_key: string;
      payload_hash: string;
      payload_json: {
        [key: string]: unknown;
      };
      error_code?: string | null;
      error_message?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSyncQueueItemDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      agent_id: string;
      entity_type: string;
      /** Format: uuid */
      local_entity_id: string;
      /** Format: uuid */
      server_entity_id?: string | null;
      /** @default 'pending' */
      status: string;
      /** @default 0 */
      attempts: number;
      /** Format: date-time */
      created_locally_at: string;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: date-time */
      received_at?: string | null;
      idempotency_key: string;
      payload_hash: string;
      payload_json: {
        [key: string]: unknown;
      };
      error_code?: string | null;
      error_message?: string | null;
    };
    SyncReceipt: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      sync_queue_item_id: string;
      idempotency_key: string;
      entity_type: string;
      /** Format: uuid */
      local_entity_id: string;
      /** Format: uuid */
      server_entity_id?: string | null;
      accepted_hash: string;
      status: string;
      reason_code?: string | null;
      /** Format: date-time */
      applied_at?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSyncReceiptDto: {
      /** Format: uuid */
      sync_queue_item_id: string;
      idempotency_key: string;
      entity_type: string;
      /** Format: uuid */
      local_entity_id: string;
      /** Format: uuid */
      server_entity_id?: string | null;
      accepted_hash: string;
      status: string;
      reason_code?: string | null;
      /** Format: date-time */
      applied_at?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
    };
    SyncConflict: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      sync_queue_item_id: string;
      conflict_type: string;
      /** @default 'SYNC_CONFLICT' */
      reason_code: string;
      /** @default 'Divergência de negócio requer análise.' */
      safe_message: string;
      /** @default gen_random_uuid()::text */
      correlation_id: string;
      local_hash?: string | null;
      server_hash?: string | null;
      /** @default false */
      retryable: boolean;
      /** @default '[]'::jsonb */
      allowed_resolution_actions: {
        [key: string]: unknown;
      };
      description: string;
      /** @default 'open' */
      status: string;
      /** Format: uuid */
      resolved_by_user_ref?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
      resolution_action?: string | null;
      resolution_details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSyncConflictDto: {
      /** Format: uuid */
      sync_queue_item_id: string;
      conflict_type: string;
      /** @default 'SYNC_CONFLICT' */
      reason_code: string;
      /** @default 'Divergência de negócio requer análise.' */
      safe_message: string;
      /** @default gen_random_uuid()::text */
      correlation_id: string;
      local_hash?: string | null;
      server_hash?: string | null;
      /** @default false */
      retryable: boolean;
      /** @default '[]'::jsonb */
      allowed_resolution_actions: {
        [key: string]: unknown;
      };
      description: string;
      /** @default 'open' */
      status: string;
      /** Format: uuid */
      resolved_by_user_ref?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
      resolution_action?: string | null;
      resolution_details_json?: {
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
  listAitNumberingRange: {
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
          'application/json': components['schemas']['AitNumberingRange'][];
        };
      };
    };
  };
  createAitNumberingRange: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitNumberingRangeDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitNumberingRange'];
        };
      };
    };
  };
  getAitNumberingRange: {
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
          'application/json': components['schemas']['AitNumberingRange'];
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
  removeAitNumberingRange: {
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
  updateAitNumberingRange: {
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
        'application/json': components['schemas']['CreateAitNumberingRangeDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitNumberingRange'];
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
  listNumberingReservation: {
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
          'application/json': components['schemas']['NumberingReservation'][];
        };
      };
    };
  };
  createNumberingReservation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNumberingReservationDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NumberingReservation'];
        };
      };
    };
  };
  getNumberingReservation: {
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
          'application/json': components['schemas']['NumberingReservation'];
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
  removeNumberingReservation: {
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
  updateNumberingReservation: {
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
        'application/json': components['schemas']['CreateNumberingReservationDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NumberingReservation'];
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
  listNumberingConsumption: {
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
          'application/json': components['schemas']['NumberingConsumption'][];
        };
      };
    };
  };
  createNumberingConsumption: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNumberingConsumptionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NumberingConsumption'];
        };
      };
    };
  };
  getNumberingConsumption: {
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
          'application/json': components['schemas']['NumberingConsumption'];
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
  removeNumberingConsumption: {
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
  updateNumberingConsumption: {
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
        'application/json': components['schemas']['CreateNumberingConsumptionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NumberingConsumption'];
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
  listSyncBatch: {
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
          'application/json': components['schemas']['SyncBatch'][];
        };
      };
    };
  };
  getSyncBatch: {
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
          'application/json': components['schemas']['SyncBatch'];
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
  listSyncQueueItem: {
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
          'application/json': components['schemas']['SyncQueueItem'][];
        };
      };
    };
  };
  createSyncQueueItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSyncQueueItemDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SyncQueueItem'];
        };
      };
    };
  };
  getSyncQueueItem: {
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
          'application/json': components['schemas']['SyncQueueItem'];
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
  removeSyncQueueItem: {
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
  updateSyncQueueItem: {
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
        'application/json': components['schemas']['CreateSyncQueueItemDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SyncQueueItem'];
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
  listSyncReceipt: {
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
          'application/json': components['schemas']['SyncReceipt'][];
        };
      };
    };
  };
  listSyncConflict: {
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
          'application/json': components['schemas']['SyncConflict'][];
        };
      };
    };
  };
  createSyncConflict: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSyncConflictDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SyncConflict'];
        };
      };
    };
  };
  getSyncConflict: {
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
          'application/json': components['schemas']['SyncConflict'];
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
  removeSyncConflict: {
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
  updateSyncConflict: {
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
        'application/json': components['schemas']['CreateSyncConflictDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SyncConflict'];
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
