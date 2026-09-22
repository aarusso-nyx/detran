// Generated from docs/framework/contracts/BP-OPS-PROVISIONING-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/provisioning/device-keys': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List DeviceKey (most recent first, capped at 500) */
    get: operations['listDeviceKey'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/device-keys/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getDeviceKey'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/grants': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List OfflineAuthorizationGrant (most recent first, capped at 500) */
    get: operations['listOfflineAuthorizationGrant'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/grants/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getOfflineAuthorizationGrant'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/packages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProvisioningPackage (most recent first, capped at 500) */
    get: operations['listProvisioningPackage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/packages/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProvisioningPackage'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/receipts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ProvisioningReceipt (most recent first, capped at 500) */
    get: operations['listProvisioningReceipt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/receipts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProvisioningReceipt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/device-revocations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List DeviceRevocation (most recent first, capped at 500) */
    get: operations['listDeviceRevocation'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/device-revocations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getDeviceRevocation'];
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
    DeviceKey: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      device_id: string;
      key_fingerprint: string;
      public_key: string;
      attestation_evidence_json: {
        [key: string]: unknown;
      };
      /** @default 'source_pending' */
      key_algorithm: string;
      /** @default 'source_pending' */
      wire_format: string;
      /** @default 'registered' */
      status: string;
      /** @default 1 */
      version: number;
      /**
       * Format: date-time
       * @default now()
       */
      registered_at: string;
      /** Format: date-time */
      revoked_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDeviceKeyDto: {
      /** Format: uuid */
      device_id: string;
      key_fingerprint: string;
      public_key: string;
      attestation_evidence_json: {
        [key: string]: unknown;
      };
      /** @default 'source_pending' */
      key_algorithm: string;
      /** @default 'source_pending' */
      wire_format: string;
      /** @default 'registered' */
      status: string;
      /** @default 1 */
      version: number;
      /**
       * Format: date-time
       * @default now()
       */
      registered_at: string;
      /** Format: date-time */
      revoked_at?: string | null;
    };
    OfflineAuthorizationGrant: {
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
      device_key_fingerprint: string;
      authorized_agents_json: {
        /** Format: uuid */
        agent_id: string;
        registration_number: string;
        roles: ('field-agent' | 'field-supervisor')[];
        permissions: string[];
      }[];
      /** Format: date-time */
      valid_from: string;
      /** Format: date-time */
      valid_until: string;
      maximum_offline_seconds: number;
      maximum_acts: number;
      revocation_epoch: number;
      policy_version: string;
      /** Format: uuid */
      normative_package_id: string;
      numbering_reservation_ids_json: string[];
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      issued_by_subject: string;
      key_id: string;
      /** @default '1.0' */
      schema_version: string;
      manifest_digest: string;
      /** @default 'issued' */
      status: string;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      revoked_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateOfflineAuthorizationGrantDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      device_id: string;
      device_key_fingerprint: string;
      authorized_agents_json: {
        /** Format: uuid */
        agent_id: string;
        registration_number: string;
        roles: ('field-agent' | 'field-supervisor')[];
        permissions: string[];
      }[];
      /** Format: date-time */
      valid_from: string;
      /** Format: date-time */
      valid_until: string;
      maximum_offline_seconds: number;
      maximum_acts: number;
      revocation_epoch: number;
      policy_version: string;
      /** Format: uuid */
      normative_package_id: string;
      numbering_reservation_ids_json: string[];
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      issued_by_subject: string;
      key_id: string;
      /** @default '1.0' */
      schema_version: string;
      manifest_digest: string;
      /** @default 'issued' */
      status: string;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      revoked_at?: string | null;
    };
    ProvisioningPackage: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      /** @default '1.0' */
      schema_version: string;
      manifest_digest: string;
      artifact_digests_json: {
        [key: string]: unknown;
      };
      trust_chain_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      normative_package_id: string;
      numbering_policy_json: {
        [key: string]: unknown;
      };
      envelope_uri: string;
      signature_key_id: string;
      /** @default 'source_pending' */
      signature_algorithm: string;
      /** @default 'source_pending' */
      envelope_algorithm: string;
      /** @default 'source_pending' */
      wire_format: string;
      /** @default 'issued' */
      status: string;
      /** @default 1 */
      version: number;
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      /** Format: date-time */
      expires_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProvisioningPackageDto: {
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      /** @default '1.0' */
      schema_version: string;
      manifest_digest: string;
      artifact_digests_json: {
        [key: string]: unknown;
      };
      trust_chain_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      normative_package_id: string;
      numbering_policy_json: {
        [key: string]: unknown;
      };
      envelope_uri: string;
      signature_key_id: string;
      /** @default 'source_pending' */
      signature_algorithm: string;
      /** @default 'source_pending' */
      envelope_algorithm: string;
      /** @default 'source_pending' */
      wire_format: string;
      /** @default 'issued' */
      status: string;
      /** @default 1 */
      version: number;
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      /** Format: date-time */
      expires_at?: string | null;
    };
    ProvisioningReceipt: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      package_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      receipt_type: string;
      idempotency_key: string;
      manifest_digest: string;
      device_attestation_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      occurred_at: string;
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
    CreateProvisioningReceiptDto: {
      /** Format: uuid */
      package_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      receipt_type: string;
      idempotency_key: string;
      manifest_digest: string;
      device_attestation_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      occurred_at: string;
      /**
       * Format: date-time
       * @default now()
       */
      received_at: string;
    };
    DeviceRevocation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      grant_id?: string | null;
      revocation_epoch: number;
      reason_code: string;
      decision_by_subject: string;
      /** Format: date-time */
      decided_at: string;
      /**
       * Format: date-time
       * @default now()
       */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDeviceRevocationDto: {
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      grant_id?: string | null;
      revocation_epoch: number;
      reason_code: string;
      decision_by_subject: string;
      /** Format: date-time */
      decided_at: string;
    };
    ProvisioningCommandIdempotency: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      command_name: string;
      idempotency_key: string;
      request_digest: string;
      response_body_json: {
        [key: string]: unknown;
      };
      response_etag: string;
      /**
       * Format: date-time
       * @default now()
       */
      completed_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProvisioningCommandIdempotencyDto: {
      command_name: string;
      idempotency_key: string;
      request_digest: string;
      response_body_json: {
        [key: string]: unknown;
      };
      response_etag: string;
      /**
       * Format: date-time
       * @default now()
       */
      completed_at: string;
    };
    ProvisioningReconciliation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      reconciliation_digest: string;
      /** @default 0 */
      accepted_act_count: number;
      /** @default 0 */
      rejected_act_count: number;
      /** @default 0 */
      unresolved_act_count: number;
      reconciled_by_subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      reconciled_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProvisioningReconciliationDto: {
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      reconciliation_digest: string;
      /** @default 0 */
      accepted_act_count: number;
      /** @default 0 */
      rejected_act_count: number;
      /** @default 0 */
      unresolved_act_count: number;
      reconciled_by_subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      reconciled_at: string;
    };
    ProvisioningGrantReservationBinding: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      reservation_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      authorized_agent_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      bound_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProvisioningGrantReservationBindingDto: {
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      reservation_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      authorized_agent_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      bound_at: string;
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
  listDeviceKey: {
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
          'application/json': components['schemas']['DeviceKey'][];
        };
      };
    };
  };
  getDeviceKey: {
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
          'application/json': components['schemas']['DeviceKey'];
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
  listOfflineAuthorizationGrant: {
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
          'application/json': components['schemas']['OfflineAuthorizationGrant'][];
        };
      };
    };
  };
  getOfflineAuthorizationGrant: {
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
          'application/json': components['schemas']['OfflineAuthorizationGrant'];
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
  listProvisioningPackage: {
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
          'application/json': components['schemas']['ProvisioningPackage'][];
        };
      };
    };
  };
  getProvisioningPackage: {
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
          'application/json': components['schemas']['ProvisioningPackage'];
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
  listProvisioningReceipt: {
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
          'application/json': components['schemas']['ProvisioningReceipt'][];
        };
      };
    };
  };
  getProvisioningReceipt: {
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
          'application/json': components['schemas']['ProvisioningReceipt'];
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
  listDeviceRevocation: {
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
          'application/json': components['schemas']['DeviceRevocation'][];
        };
      };
    };
  };
  getDeviceRevocation: {
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
          'application/json': components['schemas']['DeviceRevocation'];
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
