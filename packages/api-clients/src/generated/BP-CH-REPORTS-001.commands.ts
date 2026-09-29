// Generated from docs/framework/contracts/BP-CH-REPORTS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/candidate-dossier/{encounterId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        encounterId: string;
      };
      cookie?: never;
    };
    /** GET /v1/ch/candidate-dossier/{encounterId} */
    get: operations['pecGetChCandidateDossierByEncounterId'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/candidate-dossier/{encounterId}/feedback-requests': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        encounterId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/candidate-dossier/{encounterId}/feedback-requests */
    post: operations['pecPostChCandidateDossierByEncounterIdFeedbackRequests'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/candidate-dossier/feedback-requests/{id}/schedule': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/candidate-dossier/feedback-requests/{id}/schedule */
    post: operations['pecPostChCandidateDossierFeedbackRequestsByIdSchedule'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/candidate-dossier/feedback-requests/{id}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/candidate-dossier/feedback-requests/{id}/complete */
    post: operations['pecPostChCandidateDossierFeedbackRequestsByIdComplete'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/encounters/{id}/close': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/ch/encounters/{id}/close */
    patch: operations['pecPatchChEncountersByIdClose'];
    trace?: never;
  };
  '/v1/ch/reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/reports */
    post: operations['pecPostChReports'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/reports/{id}/addenda': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/reports/{id}/addenda */
    post: operations['pecPostChReportsByIdAddenda'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/reports/addenda/{id}/approvals/supervisor': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/reports/addenda/{id}/approvals/supervisor */
    post: operations['pecPostChReportsAddendaByIdApprovalsSupervisor'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/reports/addenda/{id}/approvals/clinic-admin': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/reports/addenda/{id}/approvals/clinic-admin */
    post: operations['pecPostChReportsAddendaByIdApprovalsClinicAdmin'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/reports/addenda/{id}/sign': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/reports/addenda/{id}/sign */
    post: operations['pecPostChReportsAddendaByIdSign'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  pecGetChCandidateDossierByEncounterId: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        encounterId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChCandidateDossierByEncounterIdFeedbackRequests: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        encounterId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChCandidateDossierFeedbackRequestsByIdSchedule: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChCandidateDossierFeedbackRequestsByIdComplete: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchChEncountersByIdClose: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChReports: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChReportsByIdAddenda: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChReportsAddendaByIdApprovalsSupervisor: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChReportsAddendaByIdApprovalsClinicAdmin: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChReportsAddendaByIdSign: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
