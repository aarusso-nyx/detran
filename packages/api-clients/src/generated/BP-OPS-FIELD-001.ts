// Generated from docs/framework/contracts/BP-OPS-FIELD-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ops/field/agents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AgentProfile (most recent first, capped at 500) */
    get: operations['listAgentProfile'];
    put?: never;
    post: operations['createAgentProfile'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/agents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getAgentProfile'];
    put?: never;
    post?: never;
    delete: operations['removeAgentProfile'];
    options?: never;
    head?: never;
    patch: operations['updateAgentProfile'];
    trace?: never;
  };
  '/v1/ops/field/devices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List OperationalDevice (most recent first, capped at 500) */
    get: operations['listOperationalDevice'];
    put?: never;
    post: operations['createOperationalDevice'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/devices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getOperationalDevice'];
    put?: never;
    post?: never;
    delete: operations['removeOperationalDevice'];
    options?: never;
    head?: never;
    patch: operations['updateOperationalDevice'];
    trace?: never;
  };
  '/v1/ops/field/homologations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Homologation (most recent first, capped at 500) */
    get: operations['listHomologation'];
    put?: never;
    post: operations['createHomologation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/homologations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getHomologation'];
    put?: never;
    post?: never;
    delete: operations['removeHomologation'];
    options?: never;
    head?: never;
    patch: operations['updateHomologation'];
    trace?: never;
  };
  '/v1/ops/field/application-versions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ApplicationVersion (most recent first, capped at 500) */
    get: operations['listApplicationVersion'];
    put?: never;
    post: operations['createApplicationVersion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/application-versions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getApplicationVersion'];
    put?: never;
    post?: never;
    delete: operations['removeApplicationVersion'];
    options?: never;
    head?: never;
    patch: operations['updateApplicationVersion'];
    trace?: never;
  };
  '/v1/ops/field/device-events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List DeviceEvent (most recent first, capped at 500) */
    get: operations['listDeviceEvent'];
    put?: never;
    post: operations['createDeviceEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/device-events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getDeviceEvent'];
    put?: never;
    post?: never;
    delete: operations['removeDeviceEvent'];
    options?: never;
    head?: never;
    patch: operations['updateDeviceEvent'];
    trace?: never;
  };
  '/v1/ops/field/operations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Operation (most recent first, capped at 500) */
    get: operations['listOperation'];
    put?: never;
    post: operations['createOperation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/operations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getOperation'];
    put?: never;
    post?: never;
    delete: operations['removeOperation'];
    options?: never;
    head?: never;
    patch: operations['updateOperation'];
    trace?: never;
  };
  '/v1/ops/field/teams': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Team (most recent first, capped at 500) */
    get: operations['listTeam'];
    put?: never;
    post: operations['createTeam'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/teams/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getTeam'];
    put?: never;
    post?: never;
    delete: operations['removeTeam'];
    options?: never;
    head?: never;
    patch: operations['updateTeam'];
    trace?: never;
  };
  '/v1/ops/field/team-agents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List TeamAgent (most recent first, capped at 500) */
    get: operations['listTeamAgent'];
    put?: never;
    post: operations['createTeamAgent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/team-agents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getTeamAgent'];
    put?: never;
    post?: never;
    delete: operations['removeTeamAgent'];
    options?: never;
    head?: never;
    patch: operations['updateTeamAgent'];
    trace?: never;
  };
  '/v1/ops/field/patrol-vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List PatrolVehicle (most recent first, capped at 500) */
    get: operations['listPatrolVehicle'];
    put?: never;
    post: operations['createPatrolVehicle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/patrol-vehicles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPatrolVehicle'];
    put?: never;
    post?: never;
    delete: operations['removePatrolVehicle'];
    options?: never;
    head?: never;
    patch: operations['updatePatrolVehicle'];
    trace?: never;
  };
  '/v1/ops/field/measurement-instruments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List MeasurementInstrument (most recent first, capped at 500) */
    get: operations['listMeasurementInstrument'];
    put?: never;
    post: operations['createMeasurementInstrument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/measurement-instruments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getMeasurementInstrument'];
    put?: never;
    post?: never;
    delete: operations['removeMeasurementInstrument'];
    options?: never;
    head?: never;
    patch: operations['updateMeasurementInstrument'];
    trace?: never;
  };
  '/v1/ops/field/shifts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Shift (most recent first, capped at 500) */
    get: operations['listShift'];
    put?: never;
    post: operations['createShift'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/shifts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getShift'];
    put?: never;
    post?: never;
    delete: operations['removeShift'];
    options?: never;
    head?: never;
    patch: operations['updateShift'];
    trace?: never;
  };
  '/v1/ops/field/approaches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Approach (most recent first, capped at 500) */
    get: operations['listApproach'];
    put?: never;
    post: operations['createApproach'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/approaches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getApproach'];
    put?: never;
    post?: never;
    delete: operations['removeApproach'];
    options?: never;
    head?: never;
    patch: operations['updateApproach'];
    trace?: never;
  };
  '/v1/ops/field/session-handoffs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SessionHandoff (most recent first, capped at 500) */
    get: operations['listSessionHandoff'];
    put?: never;
    post: operations['createSessionHandoff'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ops/field/session-handoffs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSessionHandoff'];
    put?: never;
    post?: never;
    delete: operations['removeSessionHandoff'];
    options?: never;
    head?: never;
    patch: operations['updateSessionHandoff'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    AgentProfile: {
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
      operational_unit_id?: string | null;
      registration_number: string;
      credential_number?: string | null;
      /** @default 'active' */
      functional_status: string;
      /** Format: date */
      credential_valid_until?: string | null;
      /** Format: date-time */
      trained_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAgentProfileDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      user_ref: string;
      /** Format: uuid */
      operational_unit_id?: string | null;
      registration_number: string;
      credential_number?: string | null;
      /** @default 'active' */
      functional_status: string;
      /** Format: date */
      credential_valid_until?: string | null;
      /** Format: date-time */
      trained_at?: string | null;
    };
    OperationalDevice: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      hardware_identifier_hash: string;
      model?: string | null;
      manufacturer?: string | null;
      os_name: string;
      os_version?: string | null;
      /** @default 'authorized' */
      status: string;
      app_version?: string | null;
      /** Format: date-time */
      last_seen_at?: string | null;
      last_location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default false */
      tamper_flag: boolean;
      last_location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateOperationalDeviceDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      hardware_identifier_hash: string;
      model?: string | null;
      manufacturer?: string | null;
      os_name: string;
      os_version?: string | null;
      /** @default 'authorized' */
      status: string;
      app_version?: string | null;
      /** Format: date-time */
      last_seen_at?: string | null;
      last_location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default false */
      tamper_flag: boolean;
      last_location_geom?: unknown;
    };
    Homologation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      homologation_number: string;
      scope: string;
      /** Format: date */
      issued_at: string;
      /** Format: date */
      valid_until?: string | null;
      document_uri?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date */
      laudo_emitido_em?: string | null;
      /** Format: date */
      laudo_valido_ate?: string | null;
      emissor_independente?: string | null;
      /** Format: date */
      descricao_publicada_em?: string | null;
      descricao_publicacao_local?: string | null;
      /** Format: date */
      senatran_notificado_em?: string | null;
      /** Format: date */
      senatran_prazo_notificacao?: string | null;
      cancelled_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateHomologationDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      homologation_number: string;
      scope: string;
      /** Format: date */
      issued_at: string;
      /** Format: date */
      valid_until?: string | null;
      document_uri?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date */
      laudo_emitido_em?: string | null;
      /** Format: date */
      laudo_valido_ate?: string | null;
      emissor_independente?: string | null;
      /** Format: date */
      descricao_publicada_em?: string | null;
      descricao_publicacao_local?: string | null;
      /** Format: date */
      senatran_notificado_em?: string | null;
      /** Format: date */
      senatran_prazo_notificacao?: string | null;
      cancelled_reason?: string | null;
    };
    ApplicationVersion: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      app_type: string;
      version: string;
      build_number?: string | null;
      /** @default 'allowed' */
      status: string;
      /** Format: uuid */
      homologation_id?: string | null;
      /** @default false */
      altera_funcionalidade: boolean;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateApplicationVersionDto: {
      app_type: string;
      version: string;
      build_number?: string | null;
      /** @default 'allowed' */
      status: string;
      /** Format: uuid */
      homologation_id?: string | null;
      /** @default false */
      altera_funcionalidade: boolean;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
    };
    DeviceEvent: {
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
      agent_id?: string | null;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDeviceEventDto: {
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      agent_id?: string | null;
      event_type: string;
      /**
       * Format: date-time
       * @default now()
       */
      event_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      details_json?: {
        [key: string]: unknown;
      } | null;
      location_geom?: unknown;
    };
    Operation: {
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
      operation_type: string;
      description?: string | null;
      /** Format: date-time */
      planned_start_at?: string | null;
      /** Format: date-time */
      planned_end_at?: string | null;
      /** @default 'planned' */
      status: string;
      objectives?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateOperationDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      name: string;
      operation_type: string;
      description?: string | null;
      /** Format: date-time */
      planned_start_at?: string | null;
      /** Format: date-time */
      planned_end_at?: string | null;
      /** @default 'planned' */
      status: string;
      objectives?: string | null;
    };
    Team: {
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
      operational_unit_id?: string | null;
      name: string;
      /** Format: uuid */
      supervisor_agent_id?: string | null;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTeamDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      operational_unit_id?: string | null;
      name: string;
      /** Format: uuid */
      supervisor_agent_id?: string | null;
      /** @default 'active' */
      status: string;
    };
    TeamAgent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      team_id: string;
      /** Format: uuid */
      agent_id: string;
      role: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTeamAgentDto: {
      /** Format: uuid */
      team_id: string;
      /** Format: uuid */
      agent_id: string;
      role: string;
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_to?: string | null;
    };
    PatrolVehicle: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      prefix: string;
      plate: string;
      vehicle_type: string;
      /** @default 'active' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePatrolVehicleDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      prefix: string;
      plate: string;
      vehicle_type: string;
      /** @default 'active' */
      status: string;
    };
    MeasurementInstrument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      instrument_type: string;
      serial_number: string;
      brand: string;
      model: string;
      inmetro_model_approval: string;
      verification_certificate_number?: string | null;
      /** Format: date */
      initial_verification_at?: string | null;
      /** Format: date */
      last_verification_at?: string | null;
      /** Format: date */
      verification_valid_until?: string | null;
      /** @default 'approved' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateMeasurementInstrumentDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      instrument_type: string;
      serial_number: string;
      brand: string;
      model: string;
      inmetro_model_approval: string;
      verification_certificate_number?: string | null;
      /** Format: date */
      initial_verification_at?: string | null;
      /** Format: date */
      last_verification_at?: string | null;
      /** Format: date */
      verification_valid_until?: string | null;
      /** @default 'approved' */
      status: string;
    };
    Shift: {
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
      /** Format: uuid */
      operational_unit_id?: string | null;
      /** Format: uuid */
      team_id?: string | null;
      /** Format: uuid */
      patrol_vehicle_id?: string | null;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      ended_at?: string | null;
      start_location_json?: {
        [key: string]: unknown;
      } | null;
      end_location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'open' */
      status: string;
      /** @default 0 */
      offline_periods_count: number;
      start_location_geom?: unknown;
      end_location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateShiftDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      agent_id: string;
      /** Format: uuid */
      device_id: string;
      /** Format: uuid */
      operational_unit_id?: string | null;
      /** Format: uuid */
      team_id?: string | null;
      /** Format: uuid */
      patrol_vehicle_id?: string | null;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      ended_at?: string | null;
      start_location_json?: {
        [key: string]: unknown;
      } | null;
      end_location_json?: {
        [key: string]: unknown;
      } | null;
      /** @default 'open' */
      status: string;
      /** @default 0 */
      offline_periods_count: number;
      start_location_geom?: unknown;
      end_location_geom?: unknown;
    };
    Approach: {
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
      shift_id: string;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: date-time */
      approached_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      approach_type: string;
      result: string;
      notes?: string | null;
      location_geom?: unknown;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateApproachDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      operation_id?: string | null;
      /** Format: uuid */
      agent_id: string;
      /** Format: date-time */
      approached_at: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      approach_type: string;
      result: string;
      notes?: string | null;
      location_geom?: unknown;
    };
    SessionHandoff: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      from_agent_id: string;
      /** Format: uuid */
      to_agent_id: string;
      /** Format: date-time */
      handed_off_at: string;
      details_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSessionHandoffDto: {
      /** Format: uuid */
      shift_id: string;
      /** Format: uuid */
      from_agent_id: string;
      /** Format: uuid */
      to_agent_id: string;
      /** Format: date-time */
      handed_off_at: string;
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
  listAgentProfile: {
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
          'application/json': components['schemas']['AgentProfile'][];
        };
      };
    };
  };
  createAgentProfile: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateAgentProfileDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentProfile'];
        };
      };
    };
  };
  getAgentProfile: {
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
          'application/json': components['schemas']['AgentProfile'];
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
  removeAgentProfile: {
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
  updateAgentProfile: {
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
        'application/json': components['schemas']['CreateAgentProfileDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgentProfile'];
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
  listOperationalDevice: {
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
          'application/json': components['schemas']['OperationalDevice'][];
        };
      };
    };
  };
  createOperationalDevice: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateOperationalDeviceDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OperationalDevice'];
        };
      };
    };
  };
  getOperationalDevice: {
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
          'application/json': components['schemas']['OperationalDevice'];
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
  removeOperationalDevice: {
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
  updateOperationalDevice: {
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
        'application/json': components['schemas']['CreateOperationalDeviceDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OperationalDevice'];
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
  listHomologation: {
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
          'application/json': components['schemas']['Homologation'][];
        };
      };
    };
  };
  createHomologation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateHomologationDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Homologation'];
        };
      };
    };
  };
  getHomologation: {
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
          'application/json': components['schemas']['Homologation'];
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
  removeHomologation: {
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
  updateHomologation: {
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
        'application/json': components['schemas']['CreateHomologationDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Homologation'];
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
  listApplicationVersion: {
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
          'application/json': components['schemas']['ApplicationVersion'][];
        };
      };
    };
  };
  createApplicationVersion: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateApplicationVersionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ApplicationVersion'];
        };
      };
    };
  };
  getApplicationVersion: {
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
          'application/json': components['schemas']['ApplicationVersion'];
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
  removeApplicationVersion: {
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
  updateApplicationVersion: {
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
        'application/json': components['schemas']['CreateApplicationVersionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ApplicationVersion'];
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
  listDeviceEvent: {
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
          'application/json': components['schemas']['DeviceEvent'][];
        };
      };
    };
  };
  createDeviceEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateDeviceEventDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DeviceEvent'];
        };
      };
    };
  };
  getDeviceEvent: {
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
          'application/json': components['schemas']['DeviceEvent'];
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
  removeDeviceEvent: {
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
  updateDeviceEvent: {
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
        'application/json': components['schemas']['CreateDeviceEventDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DeviceEvent'];
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
  listOperation: {
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
          'application/json': components['schemas']['Operation'][];
        };
      };
    };
  };
  createOperation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateOperationDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Operation'];
        };
      };
    };
  };
  getOperation: {
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
          'application/json': components['schemas']['Operation'];
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
  removeOperation: {
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
  updateOperation: {
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
        'application/json': components['schemas']['CreateOperationDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Operation'];
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
  listTeam: {
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
          'application/json': components['schemas']['Team'][];
        };
      };
    };
  };
  createTeam: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateTeamDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Team'];
        };
      };
    };
  };
  getTeam: {
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
          'application/json': components['schemas']['Team'];
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
  removeTeam: {
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
  updateTeam: {
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
        'application/json': components['schemas']['CreateTeamDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Team'];
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
  listTeamAgent: {
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
          'application/json': components['schemas']['TeamAgent'][];
        };
      };
    };
  };
  createTeamAgent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateTeamAgentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TeamAgent'];
        };
      };
    };
  };
  getTeamAgent: {
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
          'application/json': components['schemas']['TeamAgent'];
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
  removeTeamAgent: {
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
  updateTeamAgent: {
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
        'application/json': components['schemas']['CreateTeamAgentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['TeamAgent'];
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
  listPatrolVehicle: {
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
          'application/json': components['schemas']['PatrolVehicle'][];
        };
      };
    };
  };
  createPatrolVehicle: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePatrolVehicleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PatrolVehicle'];
        };
      };
    };
  };
  getPatrolVehicle: {
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
          'application/json': components['schemas']['PatrolVehicle'];
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
  removePatrolVehicle: {
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
  updatePatrolVehicle: {
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
        'application/json': components['schemas']['CreatePatrolVehicleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PatrolVehicle'];
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
  listMeasurementInstrument: {
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
          'application/json': components['schemas']['MeasurementInstrument'][];
        };
      };
    };
  };
  createMeasurementInstrument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateMeasurementInstrumentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasurementInstrument'];
        };
      };
    };
  };
  getMeasurementInstrument: {
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
          'application/json': components['schemas']['MeasurementInstrument'];
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
  removeMeasurementInstrument: {
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
  updateMeasurementInstrument: {
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
        'application/json': components['schemas']['CreateMeasurementInstrumentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MeasurementInstrument'];
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
  listShift: {
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
          'application/json': components['schemas']['Shift'][];
        };
      };
    };
  };
  createShift: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateShiftDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Shift'];
        };
      };
    };
  };
  getShift: {
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
          'application/json': components['schemas']['Shift'];
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
  removeShift: {
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
  updateShift: {
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
        'application/json': components['schemas']['CreateShiftDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Shift'];
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
  listApproach: {
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
          'application/json': components['schemas']['Approach'][];
        };
      };
    };
  };
  createApproach: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateApproachDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Approach'];
        };
      };
    };
  };
  getApproach: {
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
          'application/json': components['schemas']['Approach'];
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
  removeApproach: {
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
  updateApproach: {
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
        'application/json': components['schemas']['CreateApproachDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Approach'];
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
  listSessionHandoff: {
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
          'application/json': components['schemas']['SessionHandoff'][];
        };
      };
    };
  };
  createSessionHandoff: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSessionHandoffDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SessionHandoff'];
        };
      };
    };
  };
  getSessionHandoff: {
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
          'application/json': components['schemas']['SessionHandoff'];
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
  removeSessionHandoff: {
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
  updateSessionHandoff: {
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
        'application/json': components['schemas']['CreateSessionHandoffDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SessionHandoff'];
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
