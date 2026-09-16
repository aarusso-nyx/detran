// Generated from docs/framework/contracts/BP-INF-AIT-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/ait/aits': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Ait (most recent first, capped at 500) */
    get: operations['listAit'];
    put?: never;
    post: operations['createAit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/aits/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAit'];
    put?: never;
    post?: never;
    delete: operations['removeAit'];
    options?: never;
    head?: never;
    patch: operations['updateAit'];
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitCancelRequest (most recent first, capped at 500) */
    get: operations['listAitCancelRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-requests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitCancelRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-request-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitCancelRequestEvent (most recent first, capped at 500) */
    get: operations['listAitCancelRequestEvent'];
    put?: never;
    post: operations['createAitCancelRequestEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/cancel-request-events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitCancelRequestEvent'];
    put?: never;
    post?: never;
    delete: operations['removeAitCancelRequestEvent'];
    options?: never;
    head?: never;
    patch: operations['updateAitCancelRequestEvent'];
    trace?: never;
  };
  '/v1/inf/ait/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitVehicle (most recent first, capped at 500) */
    get: operations['listAitVehicle'];
    put?: never;
    post: operations['createAitVehicle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/vehicles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitVehicle'];
    put?: never;
    post?: never;
    delete: operations['removeAitVehicle'];
    options?: never;
    head?: never;
    patch: operations['updateAitVehicle'];
    trace?: never;
  };
  '/v1/inf/ait/people': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitPerson (most recent first, capped at 500) */
    get: operations['listAitPerson'];
    put?: never;
    post: operations['createAitPerson'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/people/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitPerson'];
    put?: never;
    post?: never;
    delete: operations['removeAitPerson'];
    options?: never;
    head?: never;
    patch: operations['updateAitPerson'];
    trace?: never;
  };
  '/v1/inf/ait/status-history': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitStatusHistory (most recent first, capped at 500) */
    get: operations['listAitStatusHistory'];
    put?: never;
    post: operations['createAitStatusHistory'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/status-history/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitStatusHistory'];
    put?: never;
    post?: never;
    delete: operations['removeAitStatusHistory'];
    options?: never;
    head?: never;
    patch: operations['updateAitStatusHistory'];
    trace?: never;
  };
  '/v1/inf/ait/corrections': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitCorrection (most recent first, capped at 500) */
    get: operations['listAitCorrection'];
    put?: never;
    post: operations['createAitCorrection'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/corrections/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitCorrection'];
    put?: never;
    post?: never;
    delete: operations['removeAitCorrection'];
    options?: never;
    head?: never;
    patch: operations['updateAitCorrection'];
    trace?: never;
  };
  '/v1/inf/ait/signatures': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitSignature (most recent first, capped at 500) */
    get: operations['listAitSignature'];
    put?: never;
    post: operations['createAitSignature'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/signatures/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitSignature'];
    put?: never;
    post?: never;
    delete: operations['removeAitSignature'];
    options?: never;
    head?: never;
    patch: operations['updateAitSignature'];
    trace?: never;
  };
  '/v1/inf/ait/print-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AitPrintEvent (most recent first, capped at 500) */
    get: operations['listAitPrintEvent'];
    put?: never;
    post: operations['createAitPrintEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/ait/print-events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAitPrintEvent'];
    put?: never;
    post?: never;
    delete: operations['removeAitPrintEvent'];
    options?: never;
    head?: never;
    patch: operations['updateAitPrintEvent'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Ait: {
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
      executing_agency_id?: string | null;
      ait_number: string;
      /** @default '' */
      series: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      framing_id: string;
      /** Format: uuid */
      catalog_id: string;
      /** Format: date-time */
      infraction_at: string;
      /** Format: date-time */
      issued_at: string;
      issuance_mode: string;
      constatation_type: string;
      /** @default false */
      had_approach: boolean;
      no_approach_reason?: string | null;
      location_description: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      gps_accuracy_m?: number | null;
      municipality_code?: string | null;
      uf: string;
      road?: string | null;
      km?: number | null;
      direction?: string | null;
      mandatory_observation?: string | null;
      complementary_observation?: string | null;
      /**
       * @default 'RASCUNHO_OFFLINE'
       * @enum {string}
       */
      current_status:
        | 'RASCUNHO_OFFLINE'
        | 'CANCELADO_RASCUNHO'
        | 'FINALIZADO_LOCAL'
        | 'ENFILEIRADO'
        | 'TRANSMITIDO'
        | 'RECEBIDO'
        | 'SUSPEITO_CONCORRENCIA'
        | 'VALIDANDO'
        | 'ACEITO'
        | 'REJEITADO'
        | 'PENDENTE_CORRECAO'
        | 'CORRIGIDO'
        | 'INTEGRADO'
        | 'PROCESSADO'
        | 'ARQUIVADO'
        | 'SOLICITADO_CANCEL_POSFINAL'
        | 'CANCELADO_POSFINAL';
      /** @default 1 */
      version: number;
      /** Format: uuid */
      speed_measurement_id?: string | null;
      content_hash?: string | null;
      system_signature_ref?: string | null;
      receipt_protocol?: string | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      executing_agency_id?: string | null;
      ait_number: string;
      /** @default '' */
      series: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      framing_id: string;
      /** Format: uuid */
      catalog_id: string;
      /** Format: date-time */
      infraction_at: string;
      /** Format: date-time */
      issued_at: string;
      issuance_mode: string;
      constatation_type: string;
      /** @default false */
      had_approach: boolean;
      no_approach_reason?: string | null;
      location_description: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      gps_accuracy_m?: number | null;
      municipality_code?: string | null;
      uf: string;
      road?: string | null;
      km?: number | null;
      direction?: string | null;
      mandatory_observation?: string | null;
      complementary_observation?: string | null;
      /**
       * @default 'RASCUNHO_OFFLINE'
       * @enum {string}
       */
      current_status:
        | 'RASCUNHO_OFFLINE'
        | 'CANCELADO_RASCUNHO'
        | 'FINALIZADO_LOCAL'
        | 'ENFILEIRADO'
        | 'TRANSMITIDO'
        | 'RECEBIDO'
        | 'SUSPEITO_CONCORRENCIA'
        | 'VALIDANDO'
        | 'ACEITO'
        | 'REJEITADO'
        | 'PENDENTE_CORRECAO'
        | 'CORRIGIDO'
        | 'INTEGRADO'
        | 'PROCESSADO'
        | 'ARQUIVADO'
        | 'SOLICITADO_CANCEL_POSFINAL'
        | 'CANCELADO_POSFINAL';
      /** @default 1 */
      version: number;
      /** Format: uuid */
      speed_measurement_id?: string | null;
      content_hash?: string | null;
      system_signature_ref?: string | null;
      receipt_protocol?: string | null;
      location_geom?: unknown;
    };
    AitCancelRequest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id?: string | null;
      kind: string;
      target_local_act_id?: string | null;
      origin_status: string;
      addressed_to: string;
      idempotency_key?: string | null;
      justification?: string | null;
      /** Format: uuid */
      requested_by?: string | null;
      /** @default 1 */
      version: number;
      /**
       * @default 'requested'
       * @enum {string}
       */
      status: 'requested' | 'under_review' | 'approved' | 'denied';
      decision?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitCancelRequestDto: {
      /** Format: uuid */
      ait_id?: string | null;
      kind: string;
      target_local_act_id?: string | null;
      origin_status: string;
      addressed_to: string;
      idempotency_key?: string | null;
      justification?: string | null;
      /** Format: uuid */
      requested_by?: string | null;
      /** @default 1 */
      version: number;
      /**
       * @default 'requested'
       * @enum {string}
       */
      status: 'requested' | 'under_review' | 'approved' | 'denied';
      decision?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      decided_at?: string | null;
    };
    AitCancelRequestEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      cancel_request_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      actor_user_ref?: string | null;
      decision?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitCancelRequestEventDto: {
      /** Format: uuid */
      cancel_request_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      actor_user_ref?: string | null;
      decision?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
    };
    AitVehicle: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      role: string;
      /** @default false */
      visually_confirmed_by_agent: boolean;
      observed_divergence?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitVehicleDto: {
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      vehicle_snapshot_id: string;
      role: string;
      /** @default false */
      visually_confirmed_by_agent: boolean;
      observed_divergence?: string | null;
    };
    AitPerson: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      person_id: string;
      role: string;
      identified_by: string;
      /** Format: uuid */
      external_query_id?: string | null;
      /** @default false */
      signed: boolean;
      /** @default false */
      refused_signature: boolean;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitPersonDto: {
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      person_id: string;
      role: string;
      identified_by: string;
      /** Format: uuid */
      external_query_id?: string | null;
      /** @default false */
      signed: boolean;
      /** @default false */
      refused_signature: boolean;
      notes?: string | null;
    };
    AitStatusHistory: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      status: string;
      /**
       * Format: date-time
       * @default now()
       */
      changed_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      system_name?: string | null;
      reason?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitStatusHistoryDto: {
      /** Format: uuid */
      ait_id: string;
      status: string;
      /**
       * Format: date-time
       * @default now()
       */
      changed_at: string;
      /** Format: uuid */
      user_ref?: string | null;
      system_name?: string | null;
      reason?: string | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
    };
    AitCorrection: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      operator_user_ref: string;
      correction_type: string;
      changed_field?: string | null;
      previous_value?: string | null;
      new_value?: string | null;
      justification: string;
      /**
       * Format: date-time
       * @default now()
       */
      corrected_at: string;
      /** Format: uuid */
      approved_by_user_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitCorrectionDto: {
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      operator_user_ref: string;
      correction_type: string;
      changed_field?: string | null;
      previous_value?: string | null;
      new_value?: string | null;
      justification: string;
      /**
       * Format: date-time
       * @default now()
       */
      corrected_at: string;
      /** Format: uuid */
      approved_by_user_ref?: string | null;
    };
    AitSignature: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      person_id?: string | null;
      signature_type: string;
      /** Format: uuid */
      signature_evidence_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      signed_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      refusal_or_impossibility_reason?: string | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitSignatureDto: {
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      person_id?: string | null;
      signature_type: string;
      /** Format: uuid */
      signature_evidence_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      signed_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      refusal_or_impossibility_reason?: string | null;
      location_geom?: unknown;
    };
    AitPrintEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      device_id?: string | null;
      printer_identifier?: string | null;
      receipt_hash?: string | null;
      failure_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAitPrintEventDto: {
      /** Format: uuid */
      ait_id: string;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      /** Format: uuid */
      device_id?: string | null;
      printer_identifier?: string | null;
      receipt_hash?: string | null;
      failure_reason?: string | null;
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
  listAit: {
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
          'application/json': components['schemas']['Ait'][];
        };
      };
    };
  };
  createAit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ait'];
        };
      };
    };
  };
  getAit: {
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
          'application/json': components['schemas']['Ait'];
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
  removeAit: {
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
  updateAit: {
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
        'application/json': components['schemas']['CreateAitDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Ait'];
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
  listAitCancelRequest: {
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
          'application/json': components['schemas']['AitCancelRequest'][];
        };
      };
    };
  };
  getAitCancelRequest: {
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
          'application/json': components['schemas']['AitCancelRequest'];
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
  listAitCancelRequestEvent: {
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
          'application/json': components['schemas']['AitCancelRequestEvent'][];
        };
      };
    };
  };
  createAitCancelRequestEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitCancelRequestEventDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitCancelRequestEvent'];
        };
      };
    };
  };
  getAitCancelRequestEvent: {
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
          'application/json': components['schemas']['AitCancelRequestEvent'];
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
  removeAitCancelRequestEvent: {
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
  updateAitCancelRequestEvent: {
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
        'application/json': components['schemas']['CreateAitCancelRequestEventDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitCancelRequestEvent'];
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
  listAitVehicle: {
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
          'application/json': components['schemas']['AitVehicle'][];
        };
      };
    };
  };
  createAitVehicle: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitVehicleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitVehicle'];
        };
      };
    };
  };
  getAitVehicle: {
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
          'application/json': components['schemas']['AitVehicle'];
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
  removeAitVehicle: {
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
  updateAitVehicle: {
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
        'application/json': components['schemas']['CreateAitVehicleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitVehicle'];
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
  listAitPerson: {
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
          'application/json': components['schemas']['AitPerson'][];
        };
      };
    };
  };
  createAitPerson: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitPersonDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitPerson'];
        };
      };
    };
  };
  getAitPerson: {
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
          'application/json': components['schemas']['AitPerson'];
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
  removeAitPerson: {
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
  updateAitPerson: {
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
        'application/json': components['schemas']['CreateAitPersonDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitPerson'];
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
  listAitStatusHistory: {
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
          'application/json': components['schemas']['AitStatusHistory'][];
        };
      };
    };
  };
  createAitStatusHistory: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitStatusHistoryDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitStatusHistory'];
        };
      };
    };
  };
  getAitStatusHistory: {
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
          'application/json': components['schemas']['AitStatusHistory'];
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
  removeAitStatusHistory: {
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
  updateAitStatusHistory: {
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
        'application/json': components['schemas']['CreateAitStatusHistoryDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitStatusHistory'];
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
  listAitCorrection: {
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
          'application/json': components['schemas']['AitCorrection'][];
        };
      };
    };
  };
  createAitCorrection: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitCorrectionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitCorrection'];
        };
      };
    };
  };
  getAitCorrection: {
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
          'application/json': components['schemas']['AitCorrection'];
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
  removeAitCorrection: {
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
  updateAitCorrection: {
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
        'application/json': components['schemas']['CreateAitCorrectionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitCorrection'];
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
  listAitSignature: {
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
          'application/json': components['schemas']['AitSignature'][];
        };
      };
    };
  };
  createAitSignature: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitSignatureDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitSignature'];
        };
      };
    };
  };
  getAitSignature: {
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
          'application/json': components['schemas']['AitSignature'];
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
  removeAitSignature: {
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
  updateAitSignature: {
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
        'application/json': components['schemas']['CreateAitSignatureDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitSignature'];
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
  listAitPrintEvent: {
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
          'application/json': components['schemas']['AitPrintEvent'][];
        };
      };
    };
  };
  createAitPrintEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAitPrintEventDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitPrintEvent'];
        };
      };
    };
  };
  getAitPrintEvent: {
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
          'application/json': components['schemas']['AitPrintEvent'];
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
  removeAitPrintEvent: {
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
  updateAitPrintEvent: {
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
        'application/json': components['schemas']['CreateAitPrintEventDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AitPrintEvent'];
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
