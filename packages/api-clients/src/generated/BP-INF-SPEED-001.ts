// Generated from docs/framework/contracts/BP-INF-SPEED-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/speed/meters': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SpeedMeter (most recent first, capped at 500) */
    get: operations['listSpeedMeter'];
    put?: never;
    post: operations['createSpeedMeter'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/speed/meters/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSpeedMeter'];
    put?: never;
    post?: never;
    delete: operations['removeSpeedMeter'];
    options?: never;
    head?: never;
    patch: operations['updateSpeedMeter'];
    trace?: never;
  };
  '/v1/inf/speed/certificates': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SpeedMeterCertificate (most recent first, capped at 500) */
    get: operations['listSpeedMeterCertificate'];
    put?: never;
    post: operations['createSpeedMeterCertificate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/speed/certificates/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSpeedMeterCertificate'];
    put?: never;
    post?: never;
    delete: operations['removeSpeedMeterCertificate'];
    options?: never;
    head?: never;
    patch: operations['updateSpeedMeterCertificate'];
    trace?: never;
  };
  '/v1/inf/speed/measurements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List SpeedMeasurement (most recent first, capped at 500) */
    get: operations['listSpeedMeasurement'];
    put?: never;
    post: operations['createSpeedMeasurement'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/speed/measurements/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getSpeedMeasurement'];
    put?: never;
    post?: never;
    delete: operations['removeSpeedMeasurement'];
    options?: never;
    head?: never;
    patch: operations['updateSpeedMeasurement'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Medidor de velocidade operado pelo agente, acoplado ao talao. A restricao de tipo torna a fronteira de escopo executavel: o banco recusa equipamento fixo enquanto o inciso III estiver fora do portfolio. */
    SpeedMeter: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      model: string;
      serial_number: string;
      agency_identifier: string;
      /** @default 'movel_acoplado' */
      meter_type: string;
      inmetro_model_approval: string;
      /** @default true */
      has_ocr: boolean;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSpeedMeterDto: {
      model: string;
      serial_number: string;
      agency_identifier: string;
      /** @default 'movel_acoplado' */
      meter_type: string;
      inmetro_model_approval: string;
      /** @default true */
      has_ocr: boolean;
      /** @default true */
      active: boolean;
    };
    /** @description Verificacao metrologica do medidor (RN-TEAT-138): inicial e periodica. Sem certificado vigente nao ha lavratura — AC-TEAT-013-1. */
    SpeedMeterCertificate: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      meter_id: string;
      /** @enum {string} */
      kind: 'inicial' | 'periodica';
      certificate_number: string;
      issuer: string;
      /** Format: date */
      issued_on: string;
      /** Format: date */
      valid_until: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSpeedMeterCertificateDto: {
      /** Format: uuid */
      meter_id: string;
      /** @enum {string} */
      kind: 'inicial' | 'periodica';
      certificate_number: string;
      issuer: string;
      /** Format: date */
      issued_on: string;
      /** Format: date */
      valid_until: string;
    };
    /** @description Medicao individual. measured e considered sao SEMPRE dois campos (AC-TEAT-013-2); considered = measured - max_error, garantido por constraint. certificate_id congela o certificado vigente NO MOMENTO DA MEDICAO (AC-TEAT-013-5). */
    SpeedMeasurement: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      meter_id: string;
      /** Format: uuid */
      certificate_id: string;
      measured_kmh: number;
      max_error_kmh: number;
      considered_kmh: number;
      road_limit_kmh: number;
      /** Format: date-time */
      measured_at: string;
      latitude: number;
      longitude: number;
      /** Format: uuid */
      plate_image_evidence_id?: string | null;
      ocr_plate_proposed?: string | null;
      /** @default false */
      plate_validated_by_agent: boolean;
      /** Format: uuid */
      agent_id: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSpeedMeasurementDto: {
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      meter_id: string;
      /** Format: uuid */
      certificate_id: string;
      measured_kmh: number;
      max_error_kmh: number;
      considered_kmh: number;
      road_limit_kmh: number;
      /** Format: date-time */
      measured_at: string;
      latitude: number;
      longitude: number;
      /** Format: uuid */
      plate_image_evidence_id?: string | null;
      ocr_plate_proposed?: string | null;
      /** @default false */
      plate_validated_by_agent: boolean;
      /** Format: uuid */
      agent_id: string;
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
  listSpeedMeter: {
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
          'application/json': components['schemas']['SpeedMeter'][];
        };
      };
    };
  };
  createSpeedMeter: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSpeedMeterDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeter'];
        };
      };
    };
  };
  getSpeedMeter: {
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
          'application/json': components['schemas']['SpeedMeter'];
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
  removeSpeedMeter: {
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
  updateSpeedMeter: {
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
        'application/json': components['schemas']['CreateSpeedMeterDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeter'];
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
  listSpeedMeterCertificate: {
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
          'application/json': components['schemas']['SpeedMeterCertificate'][];
        };
      };
    };
  };
  createSpeedMeterCertificate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSpeedMeterCertificateDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeterCertificate'];
        };
      };
    };
  };
  getSpeedMeterCertificate: {
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
          'application/json': components['schemas']['SpeedMeterCertificate'];
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
  removeSpeedMeterCertificate: {
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
  updateSpeedMeterCertificate: {
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
        'application/json': components['schemas']['CreateSpeedMeterCertificateDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeterCertificate'];
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
  listSpeedMeasurement: {
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
          'application/json': components['schemas']['SpeedMeasurement'][];
        };
      };
    };
  };
  createSpeedMeasurement: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateSpeedMeasurementDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeasurement'];
        };
      };
    };
  };
  getSpeedMeasurement: {
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
          'application/json': components['schemas']['SpeedMeasurement'];
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
  removeSpeedMeasurement: {
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
  updateSpeedMeasurement: {
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
        'application/json': components['schemas']['CreateSpeedMeasurementDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SpeedMeasurement'];
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
