// Generated from docs/framework/contracts/BP-CH-BIOMETRICS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/biometrics/references': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BiometricReference (most recent first, capped at 500) */
    get: operations['listBiometricReference'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/references/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBiometricReference'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/finger-conditions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BiometricFingerCondition (most recent first, capped at 500) */
    get: operations['listBiometricFingerCondition'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/finger-conditions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBiometricFingerCondition'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/checks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BiometricCheck (most recent first, capped at 500) */
    get: operations['listBiometricCheck'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/checks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBiometricCheck'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/exceptions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BiometricException (most recent first, capped at 500) */
    get: operations['listBiometricException'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/biometrics/exceptions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBiometricException'];
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
    BiometricReference: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      patient_id: string;
      /** @enum {string} */
      kind: 'FACE' | 'FINGERPRINT' | 'SIGNATURE';
      provider_code: string;
      provider_reference: string;
      /** Format: uuid */
      storage_document_id: string;
      sha256: string;
      quality_score?: number | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiometricReferenceDto: {
      /** Format: uuid */
      patient_id: string;
      /** @enum {string} */
      kind: 'FACE' | 'FINGERPRINT' | 'SIGNATURE';
      provider_code: string;
      provider_reference: string;
      /** Format: uuid */
      storage_document_id: string;
      sha256: string;
      quality_score?: number | null;
    };
    BiometricFingerCondition: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      patient_id: string;
      /** @enum {string} */
      finger_code:
        'LT' | 'LI' | 'LM' | 'LR' | 'LL' | 'RT' | 'RI' | 'RM' | 'RR' | 'RL';
      /** @enum {string} */
      condition: 'AVAILABLE' | 'TEMP_UNAVAILABLE' | 'PERMANENT_ABSENT';
      reason?: string | null;
      /** Format: uuid */
      recorded_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiometricFingerConditionDto: {
      /** Format: uuid */
      patient_id: string;
      /** @enum {string} */
      finger_code:
        'LT' | 'LI' | 'LM' | 'LR' | 'LL' | 'RT' | 'RI' | 'RM' | 'RR' | 'RL';
      /** @enum {string} */
      condition: 'AVAILABLE' | 'TEMP_UNAVAILABLE' | 'PERMANENT_ABSENT';
      reason?: string | null;
      /** Format: uuid */
      recorded_by: string;
    };
    BiometricCheck: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      station_id: string;
      /** Format: uuid */
      subject_patient_id?: string | null;
      /** Format: uuid */
      subject_professional_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      performed_at: string;
      /** @enum {string} */
      kind: 'CHECKIN' | 'MEDICAL' | 'PSYCH';
      /** @enum {string} */
      modality: 'FINGERPRINT' | 'FACE';
      score?: number | null;
      lfd_score?: number | null;
      passed: boolean;
      /** Format: uuid */
      evidence_document_id: string;
      evidence_sha256: string;
      reason?: string | null;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiometricCheckDto: {
      /** Format: uuid */
      appointment_id?: string | null;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      station_id: string;
      /** Format: uuid */
      subject_patient_id?: string | null;
      /** Format: uuid */
      subject_professional_id?: string | null;
      /** @enum {string} */
      kind: 'CHECKIN' | 'MEDICAL' | 'PSYCH';
      /** @enum {string} */
      modality: 'FINGERPRINT' | 'FACE';
    };
    BiometricException: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      appointment_id?: string | null;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      station_id: string;
      /** Format: uuid */
      biometric_check_id: string;
      scope: string;
      /** Format: uuid */
      requested_by: string;
      reason: string;
      justification?: string | null;
      /** @default '[]'::jsonb */
      attachment_document_ids: {
        [key: string]: unknown;
      };
      /**
       * @default 'REQUESTED'
       * @enum {string}
       */
      status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
      /** Format: uuid */
      approved_by?: string | null;
      /** Format: date-time */
      approved_at?: string | null;
      /** Format: date-time */
      expires_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiometricExceptionDto: {
      /** Format: uuid */
      appointment_id?: string | null;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      station_id: string;
      /** Format: uuid */
      biometric_check_id: string;
      scope: string;
      reason: string;
      justification?: string | null;
      /** @default '[]'::jsonb */
      attachment_document_ids: {
        [key: string]: unknown;
      };
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
  listBiometricReference: {
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
          'application/json': components['schemas']['BiometricReference'][];
        };
      };
    };
  };
  getBiometricReference: {
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
          'application/json': components['schemas']['BiometricReference'];
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
  listBiometricFingerCondition: {
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
          'application/json': components['schemas']['BiometricFingerCondition'][];
        };
      };
    };
  };
  getBiometricFingerCondition: {
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
          'application/json': components['schemas']['BiometricFingerCondition'];
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
  listBiometricCheck: {
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
          'application/json': components['schemas']['BiometricCheck'][];
        };
      };
    };
  };
  getBiometricCheck: {
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
          'application/json': components['schemas']['BiometricCheck'];
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
  listBiometricException: {
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
          'application/json': components['schemas']['BiometricException'][];
        };
      };
    };
  };
  getBiometricException: {
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
          'application/json': components['schemas']['BiometricException'];
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
