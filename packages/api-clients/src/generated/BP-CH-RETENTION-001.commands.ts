// Generated from docs/framework/contracts/BP-CH-RETENTION-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/retention/patients/{patientId}/assess': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        patientId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/retention/patients/{patientId}/assess */
    post: operations['pecPostChRetentionPatientsByPatientIdAssess'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/cases/{caseId}/holds': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        caseId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/retention/cases/{caseId}/holds */
    post: operations['pecPostChRetentionCasesByCaseIdHolds'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/holds/{holdId}/release': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        holdId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/retention/holds/{holdId}/release */
    post: operations['pecPostChRetentionHoldsByHoldIdRelease'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/cases/{caseId}/dispositions': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        caseId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/retention/cases/{caseId}/dispositions */
    post: operations['pecPostChRetentionCasesByCaseIdDispositions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/retention/dispositions/{dispositionId}/review': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        dispositionId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/retention/dispositions/{dispositionId}/review */
    post: operations['pecPostChRetentionDispositionsByDispositionIdReview'];
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
  pecPostChRetentionPatientsByPatientIdAssess: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        patientId: string;
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
  pecPostChRetentionCasesByCaseIdHolds: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        caseId: string;
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
  pecPostChRetentionHoldsByHoldIdRelease: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        holdId: string;
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
  pecPostChRetentionCasesByCaseIdDispositions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        caseId: string;
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
  pecPostChRetentionDispositionsByDispositionIdReview: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        dispositionId: string;
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
