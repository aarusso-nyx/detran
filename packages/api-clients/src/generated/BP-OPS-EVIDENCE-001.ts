// Generated from docs/framework/contracts/BP-OPS-EVIDENCE-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/evidence/evidence': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Evidence (most recent first, capped at 500) */
    get: operations['listEvidence'];
    put?: never;
    post: operations['createEvidence'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/evidence/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEvidence'];
    put?: never;
    post?: never;
    delete: operations['removeEvidence'];
    options?: never;
    head?: never;
    patch: operations['updateEvidence'];
    trace?: never;
  };
  '/v1/ops/evidence/links': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List EvidenceLink (most recent first, capped at 500) */
    get: operations['listEvidenceLink'];
    put?: never;
    post: operations['createEvidenceLink'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/links/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEvidenceLink'];
    put?: never;
    post?: never;
    delete: operations['removeEvidenceLink'];
    options?: never;
    head?: never;
    patch: operations['updateEvidenceLink'];
    trace?: never;
  };
  '/v1/ops/evidence/custody-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CustodyEvent (most recent first, capped at 500) */
    get: operations['listCustodyEvent'];
    put?: never;
    post: operations['createCustodyEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/custody-events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCustodyEvent'];
    put?: never;
    post?: never;
    delete: operations['removeCustodyEvent'];
    options?: never;
    head?: never;
    patch: operations['updateCustodyEvent'];
    trace?: never;
  };
  '/v1/ops/evidence/probative-packages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProbativePackage (most recent first, capped at 500) */
    get: operations['listProbativePackage'];
    put?: never;
    post: operations['createProbativePackage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/probative-packages/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProbativePackage'];
    put?: never;
    post?: never;
    delete: operations['removeProbativePackage'];
    options?: never;
    head?: never;
    patch: operations['updateProbativePackage'];
    trace?: never;
  };
  '/v1/ops/evidence/probative-package-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProbativePackageItem (most recent first, capped at 500) */
    get: operations['listProbativePackageItem'];
    put?: never;
    post: operations['createProbativePackageItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/probative-package-items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProbativePackageItem'];
    put?: never;
    post?: never;
    delete: operations['removeProbativePackageItem'];
    options?: never;
    head?: never;
    patch: operations['updateProbativePackageItem'];
    trace?: never;
  };
  '/v1/ops/evidence/evidence-access-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List EvidenceAccessRequest (most recent first, capped at 500) */
    get: operations['listEvidenceAccessRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/evidence-access-requests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEvidenceAccessRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/storage-intents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List StorageIntent (most recent first, capped at 500) */
    get: operations['listStorageIntent'];
    put?: never;
    post: operations['createStorageIntent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/evidence/storage-intents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getStorageIntent'];
    put?: never;
    post?: never;
    delete: operations['removeStorageIntent'];
    options?: never;
    head?: never;
    patch: operations['updateStorageIntent'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Evidence: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      evidence_type: string;
      origin: string;
      storage_uri: string;
      mime_type: string;
      size_bytes: number;
      hash_algorithm: string;
      hash_value: string;
      /** Format: uuid */
      captured_by_user_ref?: string | null;
      /** Format: uuid */
      agent_id?: string | null;
      /** Format: uuid */
      device_id?: string | null;
      /** Format: date-time */
      captured_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      /**
       * @default 'pending_upload'
       * @enum {string}
       */
      status:
        | 'pending_upload'
        | 'uploaded'
        | 'validated'
        | 'linked'
        | 'packaged'
        | 'archived'
        | 'rejected'
        | 'quarantined'
        | 'superseded';
      metadata_json?: {
        [key: string]: unknown;
      } | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEvidenceDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      evidence_type: string;
      origin: string;
      storage_uri: string;
      mime_type: string;
      size_bytes: number;
      hash_algorithm: string;
      hash_value: string;
      /** Format: uuid */
      captured_by_user_ref?: string | null;
      /** Format: uuid */
      agent_id?: string | null;
      /** Format: uuid */
      device_id?: string | null;
      /** Format: date-time */
      captured_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      /**
       * @default 'pending_upload'
       * @enum {string}
       */
      status:
        | 'pending_upload'
        | 'uploaded'
        | 'validated'
        | 'linked'
        | 'packaged'
        | 'archived'
        | 'rejected'
        | 'quarantined'
        | 'superseded';
      metadata_json?: {
        [key: string]: unknown;
      } | null;
      location_geom?: unknown;
    };
    EvidenceLink: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      evidence_id: string;
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      role: string;
      /** @default false */
      mandatory: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEvidenceLinkDto: {
      /** Format: uuid */
      evidence_id: string;
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      role: string;
      /** @default false */
      mandatory: boolean;
    };
    CustodyEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      evidence_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      system_name?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCustodyEventDto: {
      /** Format: uuid */
      evidence_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      system_name?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
    };
    ProbativePackage: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      /** Format: uuid */
      generated_by_user_ref: string;
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      manifest_hash: string;
      package_uri: string;
      purpose: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProbativePackageDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      entity_type: string;
      /** Format: uuid */
      entity_id: string;
      /** Format: uuid */
      generated_by_user_ref: string;
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      manifest_hash: string;
      package_uri: string;
      purpose: string;
    };
    ProbativePackageItem: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      package_id: string;
      item_type: string;
      /** Format: uuid */
      evidence_id?: string | null;
      entity_type?: string | null;
      /** Format: uuid */
      entity_id?: string | null;
      item_hash: string;
      sequence: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProbativePackageItemDto: {
      /** Format: uuid */
      package_id: string;
      item_type: string;
      /** Format: uuid */
      evidence_id?: string | null;
      entity_type?: string | null;
      /** Format: uuid */
      entity_id?: string | null;
      item_hash: string;
      sequence: number;
    };
    EvidenceAccessRequest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      evidence_id: string;
      requester_name: string;
      /** @enum {string} */
      requester_role:
        | 'magistrado'
        | 'ministerio-publico'
        | 'defensoria-publica'
        | 'autoridade-policial'
        | 'autoridade-administrativa';
      investigation_ref: string;
      purpose: string;
      legal_basis?: string | null;
      /**
       * @default 'requested'
       * @enum {string}
       */
      status: 'requested' | 'approved' | 'denied' | 'delivered';
      delivery_media_ref?: string | null;
      /** Format: uuid */
      decided_by_user_ref?: string | null;
      /** Format: date-time */
      delivered_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEvidenceAccessRequestDto: {
      /** Format: uuid */
      evidence_id: string;
      requester_name: string;
      /** @enum {string} */
      requester_role:
        | 'magistrado'
        | 'ministerio-publico'
        | 'defensoria-publica'
        | 'autoridade-policial'
        | 'autoridade-administrativa';
      investigation_ref: string;
      purpose: string;
      legal_basis?: string | null;
      /**
       * @default 'requested'
       * @enum {string}
       */
      status: 'requested' | 'approved' | 'denied' | 'delivered';
      delivery_media_ref?: string | null;
      /** Format: uuid */
      decided_by_user_ref?: string | null;
      /** Format: date-time */
      delivered_at?: string | null;
    };
    StorageIntent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      evidence_id: string;
      idempotency_key: string;
      /** Format: uuid */
      local_evidence_id: string;
      object_key: string;
      /** Format: date-time */
      expires_at: string;
      accepted_hash?: string | null;
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateStorageIntentDto: {
      /** Format: uuid */
      evidence_id: string;
      idempotency_key: string;
      /** Format: uuid */
      local_evidence_id: string;
      object_key: string;
      /** Format: date-time */
      expires_at: string;
      accepted_hash?: string | null;
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
  listEvidence: {
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
          'application/json': components['schemas']['Evidence'][];
        };
      };
    };
  };
  createEvidence: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateEvidenceDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Evidence'];
        };
      };
    };
  };
  getEvidence: {
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
          'application/json': components['schemas']['Evidence'];
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
  removeEvidence: {
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
  updateEvidence: {
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
        'application/json': components['schemas']['CreateEvidenceDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Evidence'];
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
  listEvidenceLink: {
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
          'application/json': components['schemas']['EvidenceLink'][];
        };
      };
    };
  };
  createEvidenceLink: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateEvidenceLinkDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EvidenceLink'];
        };
      };
    };
  };
  getEvidenceLink: {
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
          'application/json': components['schemas']['EvidenceLink'];
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
  removeEvidenceLink: {
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
  updateEvidenceLink: {
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
        'application/json': components['schemas']['CreateEvidenceLinkDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['EvidenceLink'];
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
  listCustodyEvent: {
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
          'application/json': components['schemas']['CustodyEvent'][];
        };
      };
    };
  };
  createCustodyEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCustodyEventDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CustodyEvent'];
        };
      };
    };
  };
  getCustodyEvent: {
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
          'application/json': components['schemas']['CustodyEvent'];
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
  removeCustodyEvent: {
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
  updateCustodyEvent: {
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
        'application/json': components['schemas']['CreateCustodyEventDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CustodyEvent'];
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
  listProbativePackage: {
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
          'application/json': components['schemas']['ProbativePackage'][];
        };
      };
    };
  };
  createProbativePackage: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateProbativePackageDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProbativePackage'];
        };
      };
    };
  };
  getProbativePackage: {
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
          'application/json': components['schemas']['ProbativePackage'];
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
  removeProbativePackage: {
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
  updateProbativePackage: {
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
        'application/json': components['schemas']['CreateProbativePackageDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProbativePackage'];
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
  listProbativePackageItem: {
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
          'application/json': components['schemas']['ProbativePackageItem'][];
        };
      };
    };
  };
  createProbativePackageItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateProbativePackageItemDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProbativePackageItem'];
        };
      };
    };
  };
  getProbativePackageItem: {
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
          'application/json': components['schemas']['ProbativePackageItem'];
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
  removeProbativePackageItem: {
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
  updateProbativePackageItem: {
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
        'application/json': components['schemas']['CreateProbativePackageItemDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProbativePackageItem'];
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
  listEvidenceAccessRequest: {
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
          'application/json': components['schemas']['EvidenceAccessRequest'][];
        };
      };
    };
  };
  getEvidenceAccessRequest: {
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
          'application/json': components['schemas']['EvidenceAccessRequest'];
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
  listStorageIntent: {
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
          'application/json': components['schemas']['StorageIntent'][];
        };
      };
    };
  };
  createStorageIntent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateStorageIntentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StorageIntent'];
        };
      };
    };
  };
  getStorageIntent: {
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
          'application/json': components['schemas']['StorageIntent'];
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
  removeStorageIntent: {
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
  updateStorageIntent: {
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
        'application/json': components['schemas']['CreateStorageIntentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StorageIntent'];
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
