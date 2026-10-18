// Generated from docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseProtocol'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/admit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Existing admit guard: four criteria, signature and server timeliness. No state shortcut. */
    post: operations['raitCaseAdmit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/non-admission': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Existing reject guard: canonical reason must match a false criterion; legalBasis is operator text. */
    post: operations['raitCaseNonAdmission'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/remit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseRemit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/receive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseReceive'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/ready': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseReady'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/decide': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseDecide'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/return-draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseReturnDraft'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/withdraw': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseWithdraw'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/redirect': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseRedirect'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/resolve-pending': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitCaseResolvePending'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pools/{id}/claim-next': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitPoolClaimNext'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/inquiries/{id}/commands/answer': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitInquiryAnswer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/inquiries/{id}/commands/extend': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitInquiryExtend'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/inquiries/{id}/commands/expire': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitInquiryExpire'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}/commands/triage': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description PROTOCOLADO to TRIAGEM_ADMISSIBILIDADE; server deadlines engine persists the read-only timeliness criterion. */
    post: operations['raitCaseTriage'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/admissibility': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** @description Upsert one human criterion by tenant/case/criterion; server actor/time and recomputed timeliness. No generated PATCH/DELETE write bypass. */
    post: operations['createRaitAdmissibility'];
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
    RaitCaseTriageInput: Record<string, never>;
    SaveRaitAdmissibilityInput: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      criterion: 'legitimidade' | 'assinatura' | 'pedido_compativel';
      verdict: boolean;
      reason?: string | null;
    };
    RaitCaseAdmitInput: Record<string, never>;
    RaitCaseNonAdmissionInput: {
      /** @enum {string} */
      reason:
        'intempestivo' | 'ilegitimo' | 'sem_assinatura' | 'pedido_incompativel';
      /** @description Operator-entered nonAdmissionGrounds; no legal text inferred from the reason code. */
      legalBasis: string;
    };
    /** @description Caso RAIT — um requerimento sobre um AIT em uma instancia (RN-RAIT-002). v1.1.0: legal_priority guarda a base de prioridade legal de tramitacao da ordem unica (WF-RAIT-004 secao 2; valores no parametro rait.priority.legal_bases, OD-016 — sem check para nao congelar parametro em DDL), unit_id aponta a turma/JARI que julga (secao 7, sem FK: inf.rait_unit nasce no DDL 35, posterior ao 34) e version e o contador de ETag/If-Match. */
    RaitCase: {
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
      origin_case_id?: string | null;
      protocol_number: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /**
       * @default 'PROTOCOLADO'
       * @enum {string}
       */
      state:
        | 'PROTOCOLADO'
        | 'TRIAGEM_ADMISSIBILIDADE'
        | 'NAO_CONHECIDO'
        | 'ADMITIDO'
        | 'AGUARDANDO_REMESSA_JARI'
        | 'DISTRIBUIDO'
        | 'EM_INSTRUCAO'
        | 'DILIGENCIA'
        | 'PRONTO_P_DECISAO'
        | 'DECIDIDO_AUTORIDADE'
        | 'PAUTADO'
        | 'JULGADO_SESSAO'
        | 'COMUNICADO'
        | 'TRANSITADO'
        | 'REMETIDO_2A_INSTANCIA'
        | 'ENCERRADO_DESISTENCIA';
      intake_channel: string;
      /** Format: date-time */
      protocolled_at: string;
      /** Format: date-time */
      admitted_at?: string | null;
      /** Format: date-time */
      judge_body_received_at?: string | null;
      /** Format: date */
      judge_body_received_on?: string | null;
      /** Format: date-time */
      cetran_received_at?: string | null;
      /** Format: date */
      cetran_received_on?: string | null;
      /** Format: date-time */
      remitted_at?: string | null;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      communicated_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** @default false */
      suspensive_effect: boolean;
      /** @default false */
      archived: boolean;
      /** @enum {string|null} */
      non_admission_reason?:
        | 'intempestivo'
        | 'ilegitimo'
        | 'sem_assinatura'
        | 'pedido_incompativel'
        | null;
      /** Format: uuid */
      withdrawal_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      last_movement_at: string;
      /** @default false */
      pending_completion: boolean;
      legal_priority?: string | null;
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    /** @description Um veredito por criterio do art.4 da Res.900/2022 — AC-RAIT-002-3 exige os quatro registrados individualmente. */
    RaitAdmissibility: {
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
      criterion:
        'tempestividade' | 'legitimidade' | 'assinatura' | 'pedido_compativel';
      verdict: boolean;
      reason?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      evaluated_at: string;
      /** Format: uuid */
      evaluated_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
  };
  responses: never;
  parameters: {
    RaitCaseId: string;
    /** @description ETag of the parent case read from server. Missing 428; stale version 412. */
    RaitCaseIfMatch: string;
    /** @description Stable key per action/target/body; same fingerprint replays without duplicate effects, divergent reuse 409. */
    RaitCommandIdempotencyKey: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  raitCaseProtocol: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Caso protocolado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseAdmit: {
    parameters: {
      query?: never;
      header: {
        /** @description ETag of the parent case read from server. Missing 428; stale version 412. */
        'If-Match': components['parameters']['RaitCaseIfMatch'];
        /** @description Stable key per action/target/body; same fingerprint replays without duplicate effects, divergent reuse 409. */
        'Idempotency-Key': components['parameters']['RaitCommandIdempotencyKey'];
      };
      path: {
        id: components['parameters']['RaitCaseId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RaitCaseAdmitInput'];
      };
    };
    responses: {
      /** @description Persisted result or exact idempotent replay. */
      200: {
        headers: {
          /** @description ETag of the persisted parent case version, also for admissibility saves. */
          ETag: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            data: components['schemas']['RaitCase'];
            /** @description Existing transactional case event records; no client-supplied event. */
            events: {
              [key: string]: unknown;
            }[];
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VALIDATION_FAILED' | 'RAIT.ENUM_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. Local test profile does not prove external JWT/IdP behavior. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.FORBIDDEN_ACTION' | 'RAIT.FORBIDDEN_CASE_SCOPE';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.TENANT_MISMATCH';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.CASE_STATE_INVALID' | 'RAIT.IDEMPOTENCY_REPLAY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'RAIT.TRIAGE_INCOMPLETE'
              | 'RAIT.TRIAGE_TIMELINESS_READONLY'
              | 'RAIT.INTAKE_SIGNATURE_MISSING'
              | 'RAIT.PARAMETER_SOURCE_PENDING';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
    };
  };
  raitCaseNonAdmission: {
    parameters: {
      query?: never;
      header: {
        /** @description ETag of the parent case read from server. Missing 428; stale version 412. */
        'If-Match': components['parameters']['RaitCaseIfMatch'];
        /** @description Stable key per action/target/body; same fingerprint replays without duplicate effects, divergent reuse 409. */
        'Idempotency-Key': components['parameters']['RaitCommandIdempotencyKey'];
      };
      path: {
        id: components['parameters']['RaitCaseId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RaitCaseNonAdmissionInput'];
      };
    };
    responses: {
      /** @description Persisted result or exact idempotent replay. */
      200: {
        headers: {
          /** @description ETag of the persisted parent case version, also for admissibility saves. */
          ETag: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            data: components['schemas']['RaitCase'];
            /** @description Existing transactional case event records; no client-supplied event. */
            events: {
              [key: string]: unknown;
            }[];
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VALIDATION_FAILED' | 'RAIT.ENUM_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. Local test profile does not prove external JWT/IdP behavior. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.FORBIDDEN_ACTION' | 'RAIT.FORBIDDEN_CASE_SCOPE';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.TENANT_MISMATCH';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.CASE_STATE_INVALID' | 'RAIT.IDEMPOTENCY_REPLAY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'RAIT.TRIAGE_INCOMPLETE' | 'RAIT.NON_ADMISSION_REASON_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
    };
  };
  raitCaseRemit: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Caso remetido */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseReceive: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Caso recebido */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseReady: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Minuta pronta */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseDecide: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Decisão assinada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseReturnDraft: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Minuta devolvida */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseWithdraw: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Desistência registrada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseRedirect: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Caso redirecionado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseResolvePending: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pendência resolvida */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitPoolClaimNext: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Próximo caso atribuído */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitInquiryAnswer: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Diligência respondida */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitInquiryExtend: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Diligência prorrogada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitInquiryExpire: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Diligência vencida */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitCaseTriage: {
    parameters: {
      query?: never;
      header: {
        /** @description ETag of the parent case read from server. Missing 428; stale version 412. */
        'If-Match': components['parameters']['RaitCaseIfMatch'];
        /** @description Stable key per action/target/body; same fingerprint replays without duplicate effects, divergent reuse 409. */
        'Idempotency-Key': components['parameters']['RaitCommandIdempotencyKey'];
      };
      path: {
        id: components['parameters']['RaitCaseId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RaitCaseTriageInput'];
      };
    };
    responses: {
      /** @description Persisted result or exact idempotent replay. */
      200: {
        headers: {
          /** @description ETag of the persisted parent case version, also for admissibility saves. */
          ETag: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            data: components['schemas']['RaitCase'];
            /** @description Existing transactional case event records; no client-supplied event. */
            events: {
              [key: string]: unknown;
            }[];
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VALIDATION_FAILED' | 'RAIT.ENUM_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. Local test profile does not prove external JWT/IdP behavior. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.FORBIDDEN_ACTION' | 'RAIT.FORBIDDEN_CASE_SCOPE';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.TENANT_MISMATCH';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.CASE_STATE_INVALID' | 'RAIT.IDEMPOTENCY_REPLAY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'RAIT.PARAMETER_SOURCE_PENDING'
              | 'RAIT.TRIAGE_TIMELINESS_READONLY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
    };
  };
  createRaitAdmissibility: {
    parameters: {
      query?: never;
      header: {
        /** @description ETag of the parent case read from server. Missing 428; stale version 412. */
        'If-Match': components['parameters']['RaitCaseIfMatch'];
        /** @description Stable key per action/target/body; same fingerprint replays without duplicate effects, divergent reuse 409. */
        'Idempotency-Key': components['parameters']['RaitCommandIdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SaveRaitAdmissibilityInput'];
      };
    };
    responses: {
      /** @description Persisted result or exact idempotent replay. */
      200: {
        headers: {
          /** @description ETag of the persisted parent case version, also for admissibility saves. */
          ETag: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            data: components['schemas']['RaitAdmissibility'];
            /** @description Existing transactional case event records; no client-supplied event. */
            events: {
              [key: string]: unknown;
            }[];
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VALIDATION_FAILED' | 'RAIT.ENUM_INVALID';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. Local test profile does not prove external JWT/IdP behavior. */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.AUTH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.FORBIDDEN_ACTION' | 'RAIT.FORBIDDEN_CASE_SCOPE';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.TENANT_MISMATCH';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.CASE_STATE_INVALID' | 'RAIT.IDEMPOTENCY_REPLAY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.VERSION_CONFLICT';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'RAIT.PARAMETER_SOURCE_PENDING'
              | 'RAIT.TRIAGE_TIMELINESS_READONLY';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
      /** @description Catalogued RAIT error response; code and status remain authoritative. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'RAIT.IF_MATCH_REQUIRED';
            message?: string;
            context?: {
              [key: string]: unknown;
            };
            requestId?: string;
          };
        };
      };
    };
  };
}
