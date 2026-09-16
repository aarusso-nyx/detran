// Generated from docs/framework/contracts/BP-CH-JUNTAS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/juntas/cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List JuntaCase (most recent first, capped at 500) */
    get: operations['listJuntaCase'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/cases/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getJuntaCase'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/boards': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List JuntaBoard (most recent first, capped at 500) */
    get: operations['listJuntaBoard'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/boards/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getJuntaBoard'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/board-members': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List JuntaBoardMember (most recent first, capped at 500) */
    get: operations['listJuntaBoardMember'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/board-members/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getJuntaBoardMember'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/decisions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List JuntaDecision (most recent first, capped at 500) */
    get: operations['listJuntaDecision'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/decisions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getJuntaDecision'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/appeals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List JuntaAppeal (most recent first, capped at 500) */
    get: operations['listJuntaAppeal'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/juntas/appeals/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getJuntaAppeal'];
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
    JuntaCase: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      applicant_patient_id: string;
      /** @enum {string} */
      track: 'MEDICAL' | 'PSYCH';
      /** @enum {string} */
      reason_code:
        | 'RESULT_DISAGREEMENT'
        | 'PERMANENT_INAPTITUDE'
        | 'CLINICAL_DIVERGENCE'
        | 'OTHER_DOCUMENTED';
      reason_detail?: string | null;
      /** Format: date-time */
      result_known_at: string;
      /** Format: date-time */
      requested_at: string;
      /** Format: date-time */
      request_deadline_at: string;
      /**
       * @default 'SUBMITTED'
       * @enum {string}
       */
      status:
        | 'SUBMITTED'
        | 'UNDER_REVIEW'
        | 'AWAITING_COMPLEMENT'
        | 'DECIDED'
        | 'APPEALED'
        | 'FINAL_DECIDED';
      /** Format: uuid */
      submitted_by: string;
      /** Format: date-time */
      finalized_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateJuntaCaseDto: {
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      applicant_patient_id: string;
      /** @enum {string} */
      track: 'MEDICAL' | 'PSYCH';
      /** @enum {string} */
      reason_code:
        | 'RESULT_DISAGREEMENT'
        | 'PERMANENT_INAPTITUDE'
        | 'CLINICAL_DIVERGENCE'
        | 'OTHER_DOCUMENTED';
      reason_detail?: string | null;
      /** Format: date-time */
      result_known_at: string;
      /** Format: date-time */
      requested_at: string;
    };
    JuntaBoard: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      instance: 'SECOND' | 'SPECIAL';
      designated_by: string;
      /** Format: date-time */
      designated_at: string;
      designation_deadline_rule?: string | null;
      /** Format: date-time */
      designation_deadline_at?: string | null;
      /** Format: date-time */
      decision_deadline_at?: string | null;
      /**
       * @default 'DESIGNATED'
       * @enum {string}
       */
      status: 'DESIGNATED' | 'DECIDED';
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateJuntaBoardDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      instance: 'SECOND' | 'SPECIAL';
      designated_by: string;
      /** Format: date-time */
      designated_at: string;
      designation_deadline_rule?: string | null;
      /** Format: date-time */
      designation_deadline_at?: string | null;
      /** Format: date-time */
      decision_deadline_at?: string | null;
    };
    JuntaBoardMember: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      board_id: string;
      /** Format: uuid */
      professional_id: string;
      /**
       * @default 'MEMBER'
       * @enum {string}
       */
      role: 'CHAIR' | 'MEMBER';
      /** @default false */
      specialist: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateJuntaBoardMemberDto: {
      /** Format: uuid */
      board_id: string;
      /** Format: uuid */
      professional_id: string;
      /**
       * @default 'MEMBER'
       * @enum {string}
       */
      role: 'CHAIR' | 'MEMBER';
      /** @default false */
      specialist: boolean;
    };
    JuntaDecision: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      board_id: string;
      /** @enum {string} */
      outcome: 'REVERSED' | 'UPHELD' | 'COMPLEMENT_REQUIRED';
      rationale: string;
      content_sha256: string;
      /** Format: uuid */
      storage_document_id: string;
      artifact_sha256: string;
      signature_level: string;
      signature_format: string;
      /** Format: date-time */
      signed_at: string;
      /** Format: date-time */
      tsa_time: string;
      certificate_validation_source: string;
      certificate_validation_status: string;
      /** Format: date-time */
      certificate_validated_at: string;
      /** Format: date-time */
      decided_at: string;
      /** Format: uuid */
      recorded_by: string;
      /** @default false */
      administrative_exhausted: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateJuntaDecisionDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      board_id: string;
      /** @enum {string} */
      outcome: 'REVERSED' | 'UPHELD' | 'COMPLEMENT_REQUIRED';
      rationale: string;
    };
    JuntaAppeal: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      source_decision_id: string;
      /** Format: uuid */
      applicant_patient_id: string;
      /** Format: date-time */
      result_known_at: string;
      /** Format: date-time */
      filed_at: string;
      /** Format: date-time */
      filing_deadline_at: string;
      /** Format: date-time */
      forwarded_at?: string | null;
      /** @default '20_BUSINESS_DAYS' */
      forwarding_deadline_rule: string;
      /** Format: date-time */
      forwarding_deadline_at?: string | null;
      /**
       * @default 'FILED'
       * @enum {string}
       */
      status: 'FILED' | 'FORWARDED' | 'DESIGNATED' | 'DECIDED';
      /** Format: uuid */
      filed_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateJuntaAppealDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      source_decision_id: string;
      /** Format: uuid */
      applicant_patient_id: string;
      /** Format: date-time */
      result_known_at: string;
      /** Format: date-time */
      filed_at: string;
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
  listJuntaCase: {
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
          'application/json': components['schemas']['JuntaCase'][];
        };
      };
    };
  };
  getJuntaCase: {
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
          'application/json': components['schemas']['JuntaCase'];
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
  listJuntaBoard: {
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
          'application/json': components['schemas']['JuntaBoard'][];
        };
      };
    };
  };
  getJuntaBoard: {
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
          'application/json': components['schemas']['JuntaBoard'];
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
  listJuntaBoardMember: {
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
          'application/json': components['schemas']['JuntaBoardMember'][];
        };
      };
    };
  };
  getJuntaBoardMember: {
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
          'application/json': components['schemas']['JuntaBoardMember'];
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
  listJuntaDecision: {
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
          'application/json': components['schemas']['JuntaDecision'][];
        };
      };
    };
  };
  getJuntaDecision: {
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
          'application/json': components['schemas']['JuntaDecision'];
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
  listJuntaAppeal: {
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
          'application/json': components['schemas']['JuntaAppeal'][];
        };
      };
    };
  };
  getJuntaAppeal: {
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
          'application/json': components['schemas']['JuntaAppeal'];
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
