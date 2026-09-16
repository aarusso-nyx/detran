// Generated from docs/framework/contracts/BP-EST-CRASH-001.openapi.json. Do not edit.
export interface paths {
  '/v1/est/crash/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashRecord (most recent first, capped at 500) */
    get: operations['listCrashRecord'];
    put?: never;
    post: operations['createCrashRecord'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/records/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashRecord'];
    put?: never;
    post?: never;
    delete: operations['removeCrashRecord'];
    options?: never;
    head?: never;
    patch: operations['updateCrashRecord'];
    trace?: never;
  };
  '/v1/est/crash/vehicles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashVehicle (most recent first, capped at 500) */
    get: operations['listCrashVehicle'];
    put?: never;
    post: operations['createCrashVehicle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/vehicles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashVehicle'];
    put?: never;
    post?: never;
    delete: operations['removeCrashVehicle'];
    options?: never;
    head?: never;
    patch: operations['updateCrashVehicle'];
    trace?: never;
  };
  '/v1/est/crash/people': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashPerson (most recent first, capped at 500) */
    get: operations['listCrashPerson'];
    put?: never;
    post: operations['createCrashPerson'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/people/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashPerson'];
    put?: never;
    post?: never;
    delete: operations['removeCrashPerson'];
    options?: never;
    head?: never;
    patch: operations['updateCrashPerson'];
    trace?: never;
  };
  '/v1/est/crash/victims': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashVictim (most recent first, capped at 500) */
    get: operations['listCrashVictim'];
    put?: never;
    post: operations['createCrashVictim'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/victims/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashVictim'];
    put?: never;
    post?: never;
    delete: operations['removeCrashVictim'];
    options?: never;
    head?: never;
    patch: operations['updateCrashVictim'];
    trace?: never;
  };
  '/v1/est/crash/scene-duties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashSceneDuty (most recent first, capped at 500) */
    get: operations['listCrashSceneDuty'];
    put?: never;
    post: operations['createCrashSceneDuty'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/scene-duties/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashSceneDuty'];
    put?: never;
    post?: never;
    delete: operations['removeCrashSceneDuty'];
    options?: never;
    head?: never;
    patch: operations['updateCrashSceneDuty'];
    trace?: never;
  };
  '/v1/est/crash/damages': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashDamage (most recent first, capped at 500) */
    get: operations['listCrashDamage'];
    put?: never;
    post: operations['createCrashDamage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/damages/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashDamage'];
    put?: never;
    post?: never;
    delete: operations['removeCrashDamage'];
    options?: never;
    head?: never;
    patch: operations['updateCrashDamage'];
    trace?: never;
  };
  '/v1/est/crash/witnesses': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashWitness (most recent first, capped at 500) */
    get: operations['listCrashWitness'];
    put?: never;
    post: operations['createCrashWitness'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/witnesses/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashWitness'];
    put?: never;
    post?: never;
    delete: operations['removeCrashWitness'];
    options?: never;
    head?: never;
    patch: operations['updateCrashWitness'];
    trace?: never;
  };
  '/v1/est/crash/sketches': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashSketch (most recent first, capped at 500) */
    get: operations['listCrashSketch'];
    put?: never;
    post: operations['createCrashSketch'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/sketches/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashSketch'];
    put?: never;
    post?: never;
    delete: operations['removeCrashSketch'];
    options?: never;
    head?: never;
    patch: operations['updateCrashSketch'];
    trace?: never;
  };
  '/v1/est/crash/renaest-submissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashRenaestSubmission (most recent first, capped at 500) */
    get: operations['listCrashRenaestSubmission'];
    put?: never;
    post: operations['createCrashRenaestSubmission'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/renaest-submissions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashRenaestSubmission'];
    put?: never;
    post?: never;
    delete: operations['removeCrashRenaestSubmission'];
    options?: never;
    head?: never;
    patch: operations['updateCrashRenaestSubmission'];
    trace?: never;
  };
  '/v1/est/crash/subject-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CrashSubjectRequest (most recent first, capped at 500) */
    get: operations['listCrashSubjectRequest'];
    put?: never;
    post: operations['createCrashSubjectRequest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/est/crash/subject-requests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCrashSubjectRequest'];
    put?: never;
    post?: never;
    delete: operations['removeCrashSubjectRequest'];
    options?: never;
    head?: never;
    patch: operations['updateCrashSubjectRequest'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    CrashRecord: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      traffic_agency_id: string;
      crash_type: string;
      severity: string;
      /**
       * @default 'RASCUNHO'
       * @enum {string}
       */
      state:
        | 'RASCUNHO'
        | 'EM_ATENDIMENTO'
        | 'REGISTRADO'
        | 'PENDENTE_COMPLEMENTO'
        | 'VALIDADO'
        | 'FECHADO'
        | 'INTEGRADO'
        | 'ARQUIVADO'
        | 'CANCELADO';
      /** @enum {string|null} */
      national_status?:
        'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO' | null;
      /** Format: date-time */
      occurred_at: string;
      /** Format: date-time */
      recorded_at: string;
      location_description: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      location_reference?: string | null;
      municipality_code: string;
      uf: string;
      road?: string | null;
      km?: string | null;
      direction?: string | null;
      road_condition: string;
      weather_condition: string;
      lighting_condition: string;
      signage_condition: string;
      dynamics_description?: string | null;
      /** Format: uuid */
      shift_id?: string | null;
      device_id?: string | null;
      /** Format: uuid */
      operation_id?: string | null;
      source_system?: string | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashRecordDto: {
      /** Format: uuid */
      traffic_agency_id: string;
      crash_type: string;
      severity: string;
      /**
       * @default 'RASCUNHO'
       * @enum {string}
       */
      state:
        | 'RASCUNHO'
        | 'EM_ATENDIMENTO'
        | 'REGISTRADO'
        | 'PENDENTE_COMPLEMENTO'
        | 'VALIDADO'
        | 'FECHADO'
        | 'INTEGRADO'
        | 'ARQUIVADO'
        | 'CANCELADO';
      /** Format: date-time */
      occurred_at: string;
      /** Format: date-time */
      recorded_at: string;
      location_description: string;
      location_json?: {
        [key: string]: unknown;
      } | null;
      location_reference?: string | null;
      municipality_code: string;
      uf: string;
      road?: string | null;
      km?: string | null;
      direction?: string | null;
      road_condition: string;
      weather_condition: string;
      lighting_condition: string;
      signage_condition: string;
      dynamics_description?: string | null;
      /** Format: uuid */
      shift_id?: string | null;
      device_id?: string | null;
      /** Format: uuid */
      operation_id?: string | null;
      source_system?: string | null;
      source_local_id?: string | null;
      source_idempotency_key?: string | null;
      source_payload_hash?: string | null;
      /** @default 1 */
      version: number;
    };
    CrashVehicle: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      vehicle_snapshot_id?: string | null;
      plate?: string | null;
      role: string;
      sequence: number;
      apparent_damage?: string | null;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashVehicleDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      vehicle_snapshot_id?: string | null;
      plate?: string | null;
      role: string;
      sequence: number;
      apparent_damage?: string | null;
      notes?: string | null;
    };
    CrashPerson: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      person_id?: string | null;
      name?: string | null;
      document_number?: string | null;
      document_source?: string | null;
      /** Format: uuid */
      crash_vehicle_id?: string | null;
      /** @enum {string} */
      role: 'condutor' | 'passageiro' | 'pedestre' | 'ciclista';
      used_seatbelt_or_helmet?: boolean | null;
      /** @default false */
      refused_data: boolean;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashPersonDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      person_id?: string | null;
      name?: string | null;
      document_number?: string | null;
      document_source?: string | null;
      /** Format: uuid */
      crash_vehicle_id?: string | null;
      /** @enum {string} */
      role: 'condutor' | 'passageiro' | 'pedestre' | 'ciclista';
      used_seatbelt_or_helmet?: boolean | null;
      /** @default false */
      refused_data: boolean;
      notes?: string | null;
    };
    CrashVictim: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      crash_person_id: string;
      severity: string;
      death_at_scene?: boolean | null;
      medical_care?: boolean | null;
      hospital_destination?: string | null;
      /** Format: date-time */
      death_at?: string | null;
      health_notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashVictimDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** Format: uuid */
      crash_person_id: string;
      severity: string;
      death_at_scene?: boolean | null;
      medical_care?: boolean | null;
      hospital_destination?: string | null;
      /** Format: date-time */
      death_at?: string | null;
      health_notes?: string | null;
    };
    CrashSceneDuty: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      regime: 'art176' | 'art177' | 'art178';
      duty_code: string;
      /** Format: uuid */
      crash_person_id?: string | null;
      /** Format: uuid */
      crash_vehicle_id?: string | null;
      complied: boolean;
      note?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashSceneDutyDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      regime: 'art176' | 'art177' | 'art178';
      duty_code: string;
      /** Format: uuid */
      crash_person_id?: string | null;
      /** Format: uuid */
      crash_vehicle_id?: string | null;
      complied: boolean;
      note?: string | null;
    };
    CrashDamage: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      asset_kind: string;
      description: string;
      responsible_identified?: boolean | null;
      notify_road_owner?: boolean | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashDamageDto: {
      /** Format: uuid */
      crash_record_id: string;
      asset_kind: string;
      description: string;
      responsible_identified?: boolean | null;
      notify_road_owner?: boolean | null;
    };
    CrashWitness: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      name: string;
      contact?: string | null;
      /** @default false */
      refused: boolean;
      statement_summary?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashWitnessDto: {
      /** Format: uuid */
      crash_record_id: string;
      name: string;
      contact?: string | null;
      /** @default false */
      refused: boolean;
      statement_summary?: string | null;
    };
    CrashSketch: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      sketch_type: 'desenho' | 'anexo' | 'mapa';
      /** Format: uuid */
      evidence_id?: string | null;
      drawing_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashSketchDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      sketch_type: 'desenho' | 'anexo' | 'mapa';
      /** Format: uuid */
      evidence_id?: string | null;
      drawing_json?: {
        [key: string]: unknown;
      } | null;
    };
    CrashLink: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      kind: 'ait' | 'measure';
      /** Format: uuid */
      target_id: string;
      target_number?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashLinkDto: {
      /** Format: uuid */
      crash_record_id: string;
      /** @enum {string} */
      kind: 'ait' | 'measure';
      /** Format: uuid */
      target_id: string;
      target_number?: string | null;
    };
    CrashRenaestSubmission: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id: string;
      protocol?: string | null;
      /** @enum {string} */
      national_status: 'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO';
      layout_version?: string | null;
      /** Format: date-time */
      submitted_at?: string | null;
      /** @enum {string|null} */
      rectification_kind?: 'complement' | 'correction' | null;
      rectification_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashRenaestSubmissionDto: {
      /** Format: uuid */
      crash_record_id: string;
      protocol?: string | null;
      /** @enum {string} */
      national_status: 'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO';
      layout_version?: string | null;
      /** Format: date-time */
      submitted_at?: string | null;
      /** @enum {string|null} */
      rectification_kind?: 'complement' | 'correction' | null;
      rectification_reason?: string | null;
    };
    CrashSubjectRequest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_record_id?: string | null;
      /** @enum {string} */
      kind: 'acesso' | 'correcao' | 'eliminacao';
      subject_cpf: string;
      purpose: string;
      /** @default 'REGISTRADO' */
      status: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashSubjectRequestDto: {
      /** Format: uuid */
      crash_record_id?: string | null;
      /** @enum {string} */
      kind: 'acesso' | 'correcao' | 'eliminacao';
      subject_cpf: string;
      purpose: string;
      /** @default 'REGISTRADO' */
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
  listCrashRecord: {
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
          'application/json': components['schemas']['CrashRecord'][];
        };
      };
    };
  };
  createCrashRecord: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashRecordDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashRecord'];
        };
      };
    };
  };
  getCrashRecord: {
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
          'application/json': components['schemas']['CrashRecord'];
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
  removeCrashRecord: {
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
  updateCrashRecord: {
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
        'application/json': components['schemas']['CreateCrashRecordDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashRecord'];
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
  listCrashVehicle: {
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
          'application/json': components['schemas']['CrashVehicle'][];
        };
      };
    };
  };
  createCrashVehicle: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashVehicleDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashVehicle'];
        };
      };
    };
  };
  getCrashVehicle: {
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
          'application/json': components['schemas']['CrashVehicle'];
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
  removeCrashVehicle: {
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
  updateCrashVehicle: {
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
        'application/json': components['schemas']['CreateCrashVehicleDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashVehicle'];
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
  listCrashPerson: {
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
          'application/json': components['schemas']['CrashPerson'][];
        };
      };
    };
  };
  createCrashPerson: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashPersonDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashPerson'];
        };
      };
    };
  };
  getCrashPerson: {
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
          'application/json': components['schemas']['CrashPerson'];
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
  removeCrashPerson: {
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
  updateCrashPerson: {
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
        'application/json': components['schemas']['CreateCrashPersonDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashPerson'];
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
  listCrashVictim: {
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
          'application/json': components['schemas']['CrashVictim'][];
        };
      };
    };
  };
  createCrashVictim: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashVictimDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashVictim'];
        };
      };
    };
  };
  getCrashVictim: {
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
          'application/json': components['schemas']['CrashVictim'];
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
  removeCrashVictim: {
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
  updateCrashVictim: {
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
        'application/json': components['schemas']['CreateCrashVictimDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashVictim'];
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
  listCrashSceneDuty: {
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
          'application/json': components['schemas']['CrashSceneDuty'][];
        };
      };
    };
  };
  createCrashSceneDuty: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashSceneDutyDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSceneDuty'];
        };
      };
    };
  };
  getCrashSceneDuty: {
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
          'application/json': components['schemas']['CrashSceneDuty'];
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
  removeCrashSceneDuty: {
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
  updateCrashSceneDuty: {
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
        'application/json': components['schemas']['CreateCrashSceneDutyDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSceneDuty'];
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
  listCrashDamage: {
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
          'application/json': components['schemas']['CrashDamage'][];
        };
      };
    };
  };
  createCrashDamage: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashDamageDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashDamage'];
        };
      };
    };
  };
  getCrashDamage: {
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
          'application/json': components['schemas']['CrashDamage'];
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
  removeCrashDamage: {
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
  updateCrashDamage: {
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
        'application/json': components['schemas']['CreateCrashDamageDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashDamage'];
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
  listCrashWitness: {
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
          'application/json': components['schemas']['CrashWitness'][];
        };
      };
    };
  };
  createCrashWitness: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashWitnessDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashWitness'];
        };
      };
    };
  };
  getCrashWitness: {
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
          'application/json': components['schemas']['CrashWitness'];
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
  removeCrashWitness: {
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
  updateCrashWitness: {
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
        'application/json': components['schemas']['CreateCrashWitnessDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashWitness'];
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
  listCrashSketch: {
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
          'application/json': components['schemas']['CrashSketch'][];
        };
      };
    };
  };
  createCrashSketch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashSketchDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSketch'];
        };
      };
    };
  };
  getCrashSketch: {
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
          'application/json': components['schemas']['CrashSketch'];
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
  removeCrashSketch: {
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
  updateCrashSketch: {
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
        'application/json': components['schemas']['CreateCrashSketchDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSketch'];
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
  listCrashRenaestSubmission: {
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
          'application/json': components['schemas']['CrashRenaestSubmission'][];
        };
      };
    };
  };
  createCrashRenaestSubmission: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashRenaestSubmissionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashRenaestSubmission'];
        };
      };
    };
  };
  getCrashRenaestSubmission: {
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
          'application/json': components['schemas']['CrashRenaestSubmission'];
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
  removeCrashRenaestSubmission: {
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
  updateCrashRenaestSubmission: {
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
        'application/json': components['schemas']['CreateCrashRenaestSubmissionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashRenaestSubmission'];
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
  listCrashSubjectRequest: {
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
          'application/json': components['schemas']['CrashSubjectRequest'][];
        };
      };
    };
  };
  createCrashSubjectRequest: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCrashSubjectRequestDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSubjectRequest'];
        };
      };
    };
  };
  getCrashSubjectRequest: {
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
          'application/json': components['schemas']['CrashSubjectRequest'];
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
  removeCrashSubjectRequest: {
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
  updateCrashSubjectRequest: {
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
        'application/json': components['schemas']['CreateCrashSubjectRequestDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CrashSubjectRequest'];
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
