// Generated from docs/framework/contracts/BP-CH-REPORTS-001.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Report (most recent first, capped at 500) */
    get: operations['listReport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/reports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getReport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/report-addenda': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ReportAddendum (most recent first, capped at 500) */
    get: operations['listReportAddendum'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/report-addenda/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getReportAddendum'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/report-addendum-approvals': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ReportAddendumApproval (most recent first, capped at 500) */
    get: operations['listReportAddendumApproval'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/report-addendum-approvals/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getReportAddendumApproval'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/registration-block-notices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RegistrationBlockNotice (most recent first, capped at 500) */
    get: operations['listRegistrationBlockNotice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/registration-block-notices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRegistrationBlockNotice'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/feedback-requests': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List FeedbackRequest (most recent first, capped at 500) */
    get: operations['listFeedbackRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/feedback-requests/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getFeedbackRequest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/episode-exports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List EpisodeExport (most recent first, capped at 500) */
    get: operations['listEpisodeExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/episode-exports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getEpisodeExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List ClinicalDocument (most recent first, capped at 500) */
    get: operations['listClinicalDocument'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/documents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getClinicalDocument'];
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
    Report: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id: string;
      /** @enum {string} */
      kind: 'MEDICAL' | 'PSYCH';
      /** Format: uuid */
      source_exam_id: string;
      content_sha256: string;
      /** Format: uuid */
      storage_document_id: string;
      artifact_sha256: string;
      /** Format: uuid */
      signer_professional_id: string;
      signer_name: string;
      signer_council: string;
      /** @enum {string} */
      signature_level: 'ADVANCED' | 'QUALIFIED';
      signature_format: string;
      /** Format: date-time */
      signed_at: string;
      /** Format: date-time */
      tsa_time: string;
      /** @enum {string} */
      certificate_validation_source: 'OCSP' | 'CRL';
      certificate_validation_status: string;
      /** Format: date-time */
      certificate_validated_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateReportDto: {
      /** Format: uuid */
      encounter_id: string;
      /** @enum {string} */
      kind: 'MEDICAL' | 'PSYCH';
      /** Format: uuid */
      source_exam_id: string;
    };
    ReportAddendum: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      report_id: string;
      reason: string;
      content: {
        [key: string]: unknown;
      };
      content_sha256: string;
      /**
       * @default 'REQUESTED'
       * @enum {string}
       */
      status: 'REQUESTED' | 'APPROVED' | 'SIGNED' | 'REJECTED';
      /** Format: uuid */
      requested_by: string;
      /** Format: uuid */
      approved_by?: string | null;
      /** Format: date-time */
      approved_at?: string | null;
      /** Format: uuid */
      storage_document_id?: string | null;
      artifact_sha256?: string | null;
      /** Format: date-time */
      signed_at?: string | null;
      /** Format: date-time */
      tsa_time?: string | null;
      certificate_validation_source?: string | null;
      certificate_validation_status?: string | null;
      /** Format: date-time */
      certificate_validated_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateReportAddendumDto: {
      /** Format: uuid */
      report_id: string;
      reason: string;
      content: {
        [key: string]: unknown;
      };
    };
    ReportAddendumApproval: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      report_addendum_id: string;
      /** @enum {string} */
      approval_role: 'SUPERVISOR' | 'ADMIN_CLINICA';
      /** Format: uuid */
      approved_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      approved_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateReportAddendumApprovalDto: Record<string, never>;
    RegistrationBlockNotice: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      report_id: string;
      /** Format: uuid */
      source_addendum_id?: string | null;
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      professional_id: string;
      /** @enum {string} */
      track: 'MEDICAL' | 'PSYCH';
      /** @enum {string} */
      result: 'INAPTO_TEMPORARIO' | 'INAPTO';
      legal_result_label: string;
      /** Format: date */
      inaptitude_until?: string | null;
      /** @default '["MEDICAL_SECTOR","PSYCHOLOGICAL_SECTOR"]'::jsonb */
      recipients: {
        [key: string]: unknown;
      };
      /** @default 'INTERNAL_CASE_INBOX' */
      channel: string;
      /** @default 'DELIVERED' */
      status: string;
      /**
       * Format: date-time
       * @default now()
       */
      delivered_at: string;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRegistrationBlockNoticeDto: Record<string, never>;
    FeedbackRequest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      report_id: string;
      /** Format: uuid */
      encounter_id: string;
      /** Format: uuid */
      patient_id: string;
      /** Format: uuid */
      professional_id: string;
      /** Format: uuid */
      requested_by: string;
      legal_result_label: string;
      /**
       * @default 'REQUESTED'
       * @enum {string}
       */
      status: 'REQUESTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      scheduled_at?: string | null;
      /** Format: date-time */
      completed_at?: string | null;
      completion_summary?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateFeedbackRequestDto: Record<string, never>;
    EpisodeExport: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id: string;
      content_sha256: string;
      /** Format: uuid */
      storage_document_id: string;
      artifact_sha256: string;
      /** Format: uuid */
      signer_professional_id: string;
      signer_name: string;
      signer_council: string;
      /** @enum {string} */
      signature_level: 'ADVANCED' | 'QUALIFIED';
      signature_format: string;
      /** Format: date-time */
      signed_at: string;
      /** Format: date-time */
      tsa_time: string;
      /** @enum {string} */
      certificate_validation_source: 'OCSP' | 'CRL';
      certificate_validation_status: string;
      /** Format: date-time */
      certificate_validated_at: string;
      /** Format: uuid */
      created_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEpisodeExportDto: Record<string, never>;
    ClinicalDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      patient_id: string;
      kind: string;
      /** Format: uuid */
      storage_document_id: string;
      content_type: string;
      sha256: string;
      size_bytes: number;
      /** Format: uuid */
      uploaded_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateClinicalDocumentDto: {
      /** Format: uuid */
      encounter_id?: string | null;
      /** Format: uuid */
      patient_id: string;
      kind: string;
      /** Format: uuid */
      storage_document_id: string;
      content_type: string;
      sha256: string;
      size_bytes: number;
      /** Format: uuid */
      uploaded_by: string;
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
  listReport: {
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
          'application/json': components['schemas']['Report'][];
        };
      };
    };
  };
  getReport: {
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
          'application/json': components['schemas']['Report'];
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
  listReportAddendum: {
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
          'application/json': components['schemas']['ReportAddendum'][];
        };
      };
    };
  };
  getReportAddendum: {
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
          'application/json': components['schemas']['ReportAddendum'];
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
  listReportAddendumApproval: {
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
          'application/json': components['schemas']['ReportAddendumApproval'][];
        };
      };
    };
  };
  getReportAddendumApproval: {
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
          'application/json': components['schemas']['ReportAddendumApproval'];
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
  listRegistrationBlockNotice: {
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
          'application/json': components['schemas']['RegistrationBlockNotice'][];
        };
      };
    };
  };
  getRegistrationBlockNotice: {
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
          'application/json': components['schemas']['RegistrationBlockNotice'];
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
  listFeedbackRequest: {
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
          'application/json': components['schemas']['FeedbackRequest'][];
        };
      };
    };
  };
  getFeedbackRequest: {
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
          'application/json': components['schemas']['FeedbackRequest'];
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
  listEpisodeExport: {
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
          'application/json': components['schemas']['EpisodeExport'][];
        };
      };
    };
  };
  getEpisodeExport: {
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
          'application/json': components['schemas']['EpisodeExport'];
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
  listClinicalDocument: {
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
          'application/json': components['schemas']['ClinicalDocument'][];
        };
      };
    };
  };
  getClinicalDocument: {
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
          'application/json': components['schemas']['ClinicalDocument'];
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
