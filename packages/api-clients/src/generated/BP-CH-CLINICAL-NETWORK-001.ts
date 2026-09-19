// Generated from docs/framework/contracts/BP-CH-CLINICAL-NETWORK-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/clinical-network/clinics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Clinic (most recent first, capped at 500) */
    get: operations['listClinic'];
    put?: never;
    post: operations['createClinic'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/clinical-network/clinics/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getClinic'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updateClinic'];
    trace?: never;
  };
  '/v1/ch/clinical-network/professionals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Professional (most recent first, capped at 500) */
    get: operations['listProfessional'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/clinical-network/professionals/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getProfessional'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/clinical-network/biometric-stations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List BiometricStation (most recent first, capped at 500) */
    get: operations['listBiometricStation'];
    put?: never;
    post: operations['createBiometricStation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/clinical-network/biometric-stations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getBiometricStation'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updateBiometricStation'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Clinic: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      cnpj: string;
      name: string;
      legal_name?: string | null;
      municipality_code?: string | null;
      region_code: string;
      address?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateClinicDto: {
      code: string;
      cnpj: string;
      name: string;
      legal_name?: string | null;
      municipality_code?: string | null;
      region_code: string;
      address?: string | null;
      contact_email?: string | null;
      contact_phone?: string | null;
      /** @default true */
      is_active: boolean;
    };
    Professional: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      user_id?: string | null;
      person_name: string;
      document_cpf?: string | null;
      /** @enum {string} */
      professional_kind:
        | 'MEDICO'
        | 'PSICOLOGO'
        | 'TECNICO_BIOMETRIA'
        | 'SUPERVISOR'
        | 'RECEPCAO';
      /** @enum {string|null} */
      council_type?: 'CRM' | 'CRP' | 'OUTRO' | null;
      council_number?: string | null;
      council_state?: string | null;
      email?: string | null;
      phone?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProfessionalDto: {
      /** Format: uuid */
      clinic_id: string;
      /** Format: uuid */
      user_id?: string | null;
      person_name: string;
      document_cpf?: string | null;
      /** @enum {string} */
      professional_kind:
        | 'MEDICO'
        | 'PSICOLOGO'
        | 'TECNICO_BIOMETRIA'
        | 'SUPERVISOR'
        | 'RECEPCAO';
      /** @enum {string|null} */
      council_type?: 'CRM' | 'CRP' | 'OUTRO' | null;
      council_number?: string | null;
      council_state?: string | null;
      email?: string | null;
      phone?: string | null;
      /** @default true */
      is_active: boolean;
    };
    BiometricStation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clinic_id: string;
      name: string;
      fingerprint_hash: string;
      camera_serial?: string | null;
      provider_code: string;
      device_certificate_fingerprint: string;
      /** @default true */
      lfd_capable: boolean;
      ip_address?: string | null;
      location_hint?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      last_seen_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiometricStationDto: {
      /** Format: uuid */
      clinic_id: string;
      name: string;
      fingerprint_hash: string;
      camera_serial?: string | null;
      provider_code: string;
      device_certificate_fingerprint: string;
      /** @default true */
      lfd_capable: boolean;
      ip_address?: string | null;
      location_hint?: string | null;
      /** @default true */
      is_active: boolean;
      /** Format: date-time */
      last_seen_at?: string | null;
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
  listClinic: {
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
          'application/json': components['schemas']['Clinic'][];
        };
      };
    };
  };
  createClinic: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateClinicDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Clinic'];
        };
      };
    };
  };
  getClinic: {
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
          'application/json': components['schemas']['Clinic'];
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
  updateClinic: {
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
        'application/json': components['schemas']['CreateClinicDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Clinic'];
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
  listProfessional: {
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
          'application/json': components['schemas']['Professional'][];
        };
      };
    };
  };
  getProfessional: {
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
          'application/json': components['schemas']['Professional'];
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
  listBiometricStation: {
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
          'application/json': components['schemas']['BiometricStation'][];
        };
      };
    };
  };
  createBiometricStation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateBiometricStationDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiometricStation'];
        };
      };
    };
  };
  getBiometricStation: {
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
          'application/json': components['schemas']['BiometricStation'];
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
  updateBiometricStation: {
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
        'application/json': components['schemas']['CreateBiometricStationDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiometricStation'];
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
