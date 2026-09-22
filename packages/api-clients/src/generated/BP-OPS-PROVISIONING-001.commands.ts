// Generated from docs/framework/contracts/BP-OPS-PROVISIONING-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/provisioning/devices/{deviceId}/key-challenges': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cria challenge de enrollment para uma chave não exportável. */
    post: operations['opsProvisioningCreateKeyChallenge'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/devices/{deviceId}/keys': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra chave pública e evidência de attestation; a chave privada nunca é enviada. */
    post: operations['opsProvisioningRegisterDeviceKey'];
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
    get?: never;
    put?: never;
    /** Emite grant e pacote provisionável dentro da unidade transacional lógica de numeração. */
    post: operations['opsProvisioningIssuePackage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/packages/{id}/content': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Baixa o envelope do pacote para o dispositivo vinculado. */
    get: operations['opsProvisioningDownloadPackageContent'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/packages/{id}/receipts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra receipt idempotente de exportação, instalação ou ativação. */
    post: operations['opsProvisioningRecordReceipt'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/devices/{deviceId}/readiness': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Avalia se grant, pacote, catálogo, numeração e revogação permitem operação offline. */
    get: operations['opsProvisioningReadiness'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/grants/{id}/revoke': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Revoga grant ou dispositivo por decisão auditada; não renumera atos formalizados. */
    post: operations['opsProvisioningRevokeGrant'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/provisioning/grants/{id}/reconcile': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reconcilia atos offline, recibos e consumo sem trocar numeração formalizada. */
    post: operations['opsProvisioningReconcileGrant'];
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
    KeyChallengeResponse: {
      /** Format: uuid */
      challenge_id: string;
      /** Format: uuid */
      device_id: string;
      /** @description Opaque challenge; production wire format remains source_pending. */
      challenge: string;
      /** Format: date-time */
      expires_at: string;
    };
    RegisterDeviceKeyResponse: {
      /** Format: uuid */
      device_key_id: string;
      /** Format: uuid */
      device_id: string;
      key_fingerprint: string;
      status: string;
    };
    IssueProvisioningPackageResponse: {
      /** Format: uuid */
      package_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      manifest_digest: string;
      envelope_uri: string;
      /** Format: date-time */
      expires_at: string;
    };
    DownloadProvisioningPackageResponse: {
      /** Format: uuid */
      package_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      manifest_digest: string;
      envelope_uri: string;
      signature_key_id: string;
      schema_version: string;
    };
    ProvisioningReceiptResponse: {
      /** Format: uuid */
      receipt_id: string;
      /** Format: uuid */
      package_id: string;
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      /** @enum {string} */
      receipt_type: 'exported' | 'installed' | 'activated';
      /** Format: date-time */
      received_at: string;
    };
    ProvisioningReadinessResponse: {
      /** Format: uuid */
      device_id: string;
      ready: boolean;
      /** @description maximum_acts menos consumos persistidos das reservas vinculadas ao grant. */
      remaining_acts: number;
      /** @description Números ainda utilizáveis nas reservas vinculadas, após numbering_consumption persistido. */
      remaining_numbering_count: number;
      blockers: {
        code: string;
        resource: string;
      }[];
      /** Format: date-time */
      evaluated_at: string;
    };
    RevokeGrantResponse: {
      /** Format: uuid */
      grant_id: string;
      /** Format: uuid */
      device_id: string;
      revocation_epoch: number;
      /** Format: date-time */
      revoked_at: string;
    };
    ReconcileGrantResponse: {
      /** Format: uuid */
      grant_id: string;
      accepted_count: number;
      rejected_count: number;
      unresolved_count: number;
      reconciliation_digest: string;
      /** Format: date-time */
      reconciled_at: string;
    };
    KeyChallengeRequest: {
      idempotency_key: string;
    };
    RegisterDeviceKeyRequest: {
      idempotency_key: string;
      /** Format: uuid */
      challenge_id: string;
      /** @description Wire format source_pending. */
      challenge_proof: string;
      /** @description Public material only; private keys are forbidden. */
      public_key: string;
      key_fingerprint: string;
      attestation_evidence: {
        [key: string]: unknown;
      };
    };
    IssueProvisioningPackageRequest: {
      idempotency_key: string;
      /** Format: uuid */
      device_id: string;
      /** @description Destinatários operacionais persistidos no grant; não representa o emissor autenticado, que vem do RequestContext. */
      authorized_agents: components['schemas']['AuthorizedAgent'][];
      /** Format: date-time */
      valid_from: string;
      /** Format: date-time */
      valid_until: string;
      maximum_offline_seconds: number;
      maximum_acts: number;
      policy_version: string;
      /** Format: uuid */
      normative_package_id: string;
      /** @description Cada reserva deve ser vinculada no mesmo tenant, órgão e dispositivo a um agent_id dos destinatários persistidos. */
      numbering_reservation_ids: string[];
    };
    AuthorizedAgent: {
      /** Format: uuid */
      agent_id: string;
      registration_number: string;
      roles: ('field-agent' | 'field-supervisor')[];
      permissions: string[];
    };
    ProvisioningReceiptRequest: {
      idempotency_key: string;
      /** @enum {string} */
      receipt_type: 'exported' | 'installed' | 'activated';
      manifest_digest: string;
      /** Format: date-time */
      occurred_at: string;
      device_attestation?: {
        [key: string]: unknown;
      };
    };
    RevokeGrantRequest: {
      idempotency_key: string;
      reason_code: string;
      revocation_epoch: number;
      /** Format: date-time */
      decided_at: string;
    };
    ReconcileGrantRequest: {
      idempotency_key: string;
      acts: components['schemas']['OfflineOriginatedAct'][];
    };
    OfflineOriginatedAct: {
      idempotency_key: string;
      reserved_numbering_context: {
        [key: string]: unknown;
      };
      local_content_hash: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: date-time */
      occurred_at: string;
      location_context: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      normative_package_id: string;
    };
  };
  responses: never;
  parameters: {
    IfMatch: string;
    IdempotencyKey: string;
    DeviceId: string;
    PackageId: string;
    GrantId: string;
  };
  requestBodies: {
    KeyChallengeRequest: {
      content: {
        'application/json': components['schemas']['KeyChallengeRequest'];
      };
    };
    RegisterDeviceKeyRequest: {
      content: {
        'application/json': components['schemas']['RegisterDeviceKeyRequest'];
      };
    };
    IssueProvisioningPackageRequest: {
      content: {
        'application/json': components['schemas']['IssueProvisioningPackageRequest'];
      };
    };
    ProvisioningReceiptRequest: {
      content: {
        'application/json': components['schemas']['ProvisioningReceiptRequest'];
      };
    };
    RevokeGrantRequest: {
      content: {
        'application/json': components['schemas']['RevokeGrantRequest'];
      };
    };
    ReconcileGrantRequest: {
      content: {
        'application/json': components['schemas']['ReconcileGrantRequest'];
      };
    };
  };
  headers: {
    /** @description Versão opaca do recurso para a próxima precondição If-Match. */
    ETag: string;
  };
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  opsProvisioningCreateKeyChallenge: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path: {
        deviceId: components['parameters']['DeviceId'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['KeyChallengeRequest'];
    responses: {
      /** @description Challenge emitido. */
      201: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['KeyChallengeResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Conflito de idempotência. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description Versão do dispositivo divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
  opsProvisioningRegisterDeviceKey: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path: {
        deviceId: components['parameters']['DeviceId'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['RegisterDeviceKeyRequest'];
    responses: {
      /** @description Chave pública registrada. */
      201: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RegisterDeviceKeyResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Fingerprint ou idempotência conflita. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description ETag do challenge ou dispositivo divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description Challenge ou attestation recusado. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
  opsProvisioningIssuePackage: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: components['requestBodies']['IssueProvisioningPackageRequest'];
    responses: {
      /** @description Pacote emitido. */
      201: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IssueProvisioningPackageResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Conflito de idempotência ou reserva. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description Readiness do dispositivo divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description Dispositivo ou política não está pronto. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
  opsProvisioningDownloadPackageContent: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: components['parameters']['PackageId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Envelope do pacote. */
      200: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DownloadProvisioningPackageResponse'];
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Pacote ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.TENANT_MISMATCH';
          };
        };
      };
      /** @description Pacote não utilizável. */
      410: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VALIDATION_FAILED';
          };
        };
      };
    };
  };
  opsProvisioningRecordReceipt: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path: {
        id: components['parameters']['PackageId'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['ProvisioningReceiptRequest'];
    responses: {
      /** @description Receipt registrado. */
      201: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProvisioningReceiptResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Idempotência conflita. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description Versão do pacote divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description Prova do dispositivo recusada. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
  opsProvisioningReadiness: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        deviceId: components['parameters']['DeviceId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Readiness calculada. */
      200: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProvisioningReadinessResponse'];
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Dispositivo ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.TENANT_MISMATCH';
          };
        };
      };
    };
  };
  opsProvisioningRevokeGrant: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path: {
        id: components['parameters']['GrantId'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['RevokeGrantRequest'];
    responses: {
      /** @description Revogação registrada. */
      200: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RevokeGrantResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Grant ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.TENANT_MISMATCH';
          };
        };
      };
      /** @description Epoch conflita. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description Versão do grant divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
  opsProvisioningReconcileGrant: {
    parameters: {
      query?: never;
      header: {
        'If-Match': components['parameters']['IfMatch'];
        'Idempotency-Key': components['parameters']['IdempotencyKey'];
      };
      path: {
        id: components['parameters']['GrantId'];
      };
      cookie?: never;
    };
    requestBody: components['requestBodies']['ReconcileGrantRequest'];
    responses: {
      /** @description Reconciliação aceita ou encaminhada para análise. */
      200: {
        headers: {
          ETag: components['headers']['ETag'];
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReconcileGrantResponse'];
        };
      };
      /** @description Entrada inválida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.ENUM_INVALID' | 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description Não autenticado. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.AUTH_REQUIRED';
          };
        };
      };
      /** @description Não autorizado. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.FORBIDDEN_ACTION';
          };
        };
      };
      /** @description Grant ausente. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.TENANT_MISMATCH';
          };
        };
      };
      /** @description Conflito de número, hash ou idempotência. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IDEMPOTENCY_REPLAY';
          };
        };
      };
      /** @description Versão do grant divergiu. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VERSION_CONFLICT';
          };
        };
      };
      /** @description Ato offline incompleto. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.VALIDATION_FAILED';
          };
        };
      };
      /** @description If-Match obrigatório. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code?: 'TEAT.IF_MATCH_REQUIRED';
          };
        };
      };
    };
  };
}
