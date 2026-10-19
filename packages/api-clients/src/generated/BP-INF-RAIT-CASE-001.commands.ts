// Generated from docs/framework/contracts/BP-INF-RAIT-CASE-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/cases': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitCase'];
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
    get: operations['listRaitAdmissibility'];
    put?: never;
    /** @description Upsert one human criterion by tenant/case/criterion; server actor/time and recomputed timeliness. No generated PATCH/DELETE write bypass. */
    post: operations['createRaitAdmissibility'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/cases/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitCase'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/parties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitParty'];
    put?: never;
    post: operations['createRaitParty'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/parties/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitParty'];
    put?: never;
    post?: never;
    /** @description Only unreferenced ordinary party metadata under the existing technical-admin action and independently complete case purpose; referenced authority/evidence, lifecycle or audit rows cannot be deleted. */
    delete: operations['removeRaitParty'];
    options?: never;
    head?: never;
    patch: operations['updateRaitParty'];
    trace?: never;
  };
  '/v1/inf/rait/documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitDocument'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitDocument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/documents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitDocument'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch: operations['updateRaitDocument'];
    trace?: never;
  };
  '/v1/inf/rait/pending-contents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitPendingContent'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitPendingContent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/pending-contents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitPendingContent'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitPendingContent'];
    trace?: never;
  };
  '/v1/inf/rait/redirects': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitRedirect'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitRedirect'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/redirects/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitRedirect'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitRedirect'];
    trace?: never;
  };
  '/v1/inf/rait/admissibility/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitAdmissibility'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/deadlines': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitDeadline'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitDeadline'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/deadlines/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitDeadline'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitDeadline'];
    trace?: never;
  };
  '/v1/inf/rait/inquiries': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitInquiry'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitInquiry'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/inquiries/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitInquiry'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitInquiry'];
    trace?: never;
  };
  '/v1/inf/rait/drafts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitDraft'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitDraft'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/drafts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitDraft'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitDraft'];
    trace?: never;
  };
  '/v1/inf/rait/decisions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitDecision'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitDecision'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/decisions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitDecision'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitDecision'];
    trace?: never;
  };
  '/v1/inf/rait/communications': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitCommunication'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitCommunication'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/communications/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitCommunication'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitCommunication'];
    trace?: never;
  };
  '/v1/inf/rait/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['listRaitCaseEvent'];
    put?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    post: operations['createRaitCaseEvent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/events/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['getRaitCaseEvent'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** @description Retained implemented validation boundary; closed generic writable set has no viable mutation. Existing owner commands remain the only positive lifecycle path. No success/no-op result. */
    patch: operations['updateRaitCaseEvent'];
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
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: date-time */
      protocolled_at: string;
      /** @default 1 */
      version: number;
      intake_channel: string;
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
      archived: boolean;
      /** @default false */
      pending_completion: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      last_movement_at: string;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: date-time */
      protocolled_at: string;
      /** @default 1 */
      version: number;
      /**
       * Format: date-time
       * @default now()
       */
      last_movement_at: string;
      /** @default false */
      pending_completion: boolean;
      /** @default false */
      archived: boolean;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: date-time */
      protocolled_at: string;
      /** @default 1 */
      version: number;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      origin_case_id?: string | null;
      intake_channel: string;
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
      agency_jurisdiction_id?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: date-time */
      protocolled_at: string;
      /** @default 1 */
      version: number;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      origin_case_id?: string | null;
      intake_channel: string;
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
      agency_jurisdiction_id?: string | null;
    };
    /** @description T0 T purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseTRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      protocol_number: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
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
      /** Format: date-time */
      protocolled_at: string;
      /** @default 1 */
      version: number;
      /** @default false */
      suspensive_effect: boolean;
      /** Format: uuid */
      unit_id?: string | null;
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPartySRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPartyMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name: string;
      document_number: string;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
      /** Format: uuid */
      representation_document_id?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPartyJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name: string;
      document_number: string;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
      /** Format: uuid */
      representation_document_id?: string | null;
    };
    /** @description T0 T purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPartyTRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      person_name: string;
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
      /** Format: uuid */
      representation_document_id?: string | null;
    };
    CreateRaitPartyScopedInput: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name: string;
      document_number: string;
      contact_email?: string | null;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
    };
    UpdateRaitPartyScopedInput: {
      /** Format: uuid */
      case_id?: string;
      /** @enum {string} */
      role?: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name?: string;
      document_number?: string;
      contact_email?: string | null;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDocumentSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDocumentMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      filename: string;
      content_hash: string;
      /** @default false */
      digitised_from_paper: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDocumentJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      filename: string;
      content_hash: string;
      /** @default false */
      digitised_from_paper: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
    };
    /** @description T0 T purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDocumentTRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** @default false */
      digitised_from_paper: boolean;
    };
    CreateRaitDocumentScopedInput: Record<string, never>;
    UpdateRaitDocumentScopedInput: {
      filename?: string;
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPendingContentSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPendingContentORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPendingContentMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitPendingContentJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
    };
    CreateRaitPendingContentScopedInput: Record<string, never>;
    UpdateRaitPendingContentScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitRedirectSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      protocol_number: string;
      counterpart_agency: string;
      /** Format: date */
      origin_protocolled_on?: string | null;
      /** @default false */
      deadline_restored: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitRedirectORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      protocol_number: string;
      /** @default false */
      deadline_restored: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitRedirectMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      /** @enum {string} */
      reason: 'outro_orgao_autuador' | 'orgao_incompetente';
      protocol_number: string;
      ait_number?: string | null;
      counterpart_agency: string;
      counterpart_renainf_code?: string | null;
      /** Format: date */
      origin_protocolled_on?: string | null;
      /** @default false */
      deadline_restored: boolean;
      /** Format: uuid */
      receipt_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
      /** Format: uuid */
      redirected_by: string;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitRedirectJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      /** @enum {string} */
      reason: 'outro_orgao_autuador' | 'orgao_incompetente';
      protocol_number: string;
      ait_number?: string | null;
      counterpart_agency: string;
      counterpart_renainf_code?: string | null;
      /** Format: date */
      origin_protocolled_on?: string | null;
      /** @default false */
      deadline_restored: boolean;
      /** Format: uuid */
      receipt_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
      /** Format: uuid */
      redirected_by: string;
    };
    CreateRaitRedirectScopedInput: Record<string, never>;
    UpdateRaitRedirectScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAdmissibilitySRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      criterion:
        'tempestividade' | 'legitimidade' | 'assinatura' | 'pedido_compativel';
      verdict: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      evaluated_at: string;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAdmissibilityMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAdmissibilityJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    };
    /** @description T0 T purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitAdmissibilityTRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
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
    };
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDeadlineSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      legal_basis: string;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDeadlineORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      legal_basis: string;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDeadlineMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      legal_basis: string;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDeadlineJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      legal_basis: string;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
    };
    /** @description T0 T purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDeadlineTRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      legal_basis: string;
    };
    CreateRaitDeadlineScopedInput: Record<string, never>;
    UpdateRaitDeadlineScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitInquirySRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitInquiryORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitInquiryMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      addressee: 'requerente' | 'orgao_autuador';
      subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: uuid */
      requested_by: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitInquiryJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      addressee: 'requerente' | 'orgao_autuador';
      subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: uuid */
      requested_by: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
    };
    CreateRaitInquiryScopedInput: Record<string, never>;
    UpdateRaitInquiryScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDraftSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      version: number;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      /** @default 0 */
      return_count: number;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDraftORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      version: number;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      /** @default 0 */
      return_count: number;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDraftMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      version: number;
      /** Format: uuid */
      author_id: string;
      /** Format: uuid */
      document_id?: string | null;
      content_hash: string;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      return_guidance?: string | null;
      /** @default 0 */
      return_count: number;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDraftJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      version: number;
      /** Format: uuid */
      author_id: string;
      /** Format: uuid */
      document_id?: string | null;
      content_hash: string;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      return_guidance?: string | null;
      /** @default 0 */
      return_count: number;
    };
    CreateRaitDraftScopedInput: Record<string, never>;
    UpdateRaitDraftScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDecisionSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: date-time */
      published_at?: string | null;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDecisionORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: date-time */
      published_at?: string | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDecisionMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      grounds: string;
      /** Format: uuid */
      decided_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: uuid */
      session_id?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      /** Format: date-time */
      published_at?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitDecisionJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      grounds: string;
      /** Format: uuid */
      decided_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: uuid */
      session_id?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      /** Format: date-time */
      published_at?: string | null;
    };
    CreateRaitDecisionScopedInput: Record<string, never>;
    UpdateRaitDecisionScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCommunicationSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
      /** @default false */
      authority_appeal_notice: boolean;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCommunicationORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCommunicationMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
      /** @default false */
      authority_appeal_notice: boolean;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCommunicationJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
      /** @default false */
      authority_appeal_notice: boolean;
    };
    CreateRaitCommunicationScopedInput: Record<string, never>;
    UpdateRaitCommunicationScopedInput: Record<string, never>;
    /** @description T0 S purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseEventSRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
    };
    /** @description T0 O purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseEventORead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
    };
    /** @description T0 M purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseEventMRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
    };
    /** @description T0 J purpose projection. Server-authorized complete purpose only; parent checks before SQL pagination and count. No tenant, storage, arbitrary payload or unqualified reference disclosure. */
    RaitCaseEventJRead: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
    };
    CreateRaitCaseEventScopedInput: Record<string, never>;
    UpdateRaitCaseEventScopedInput: Record<string, never>;
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
  listRaitCase: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitCaseSRead']
            | components['schemas']['RaitCaseORead']
            | components['schemas']['RaitCaseMRead']
            | components['schemas']['RaitCaseJRead']
            | components['schemas']['RaitCaseTRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
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
  listRaitAdmissibility: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitAdmissibilitySRead']
            | components['schemas']['RaitAdmissibilityMRead']
            | components['schemas']['RaitAdmissibilityJRead']
            | components['schemas']['RaitAdmissibilityTRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
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
  getRaitCase: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitCaseSRead']
            | components['schemas']['RaitCaseORead']
            | components['schemas']['RaitCaseMRead']
            | components['schemas']['RaitCaseJRead']
            | components['schemas']['RaitCaseTRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitParty: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitPartySRead']
            | components['schemas']['RaitPartyMRead']
            | components['schemas']['RaitPartyJRead']
            | components['schemas']['RaitPartyTRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitParty: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitPartyScopedInput'];
      };
    };
    responses: {
      /** @description Scoped ordinary metadata mutation; current action permission, complete parent purpose and verified-representation invariants required. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitPartySRead']
            | components['schemas']['RaitPartyMRead']
            | components['schemas']['RaitPartyJRead']
            | components['schemas']['RaitPartyTRead'];
        };
      };
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitParty: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitPartySRead']
            | components['schemas']['RaitPartyMRead']
            | components['schemas']['RaitPartyJRead']
            | components['schemas']['RaitPartyTRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitParty: {
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
      /** @description Unreferenced scoped ordinary metadata removed; empty body */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Immutable/referenced record; no effects */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitParty: {
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
        'application/json': components['schemas']['UpdateRaitPartyScopedInput'];
      };
    };
    responses: {
      /** @description Scoped ordinary metadata mutation; current action permission, complete parent purpose and verified-representation invariants required. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitPartySRead']
            | components['schemas']['RaitPartyMRead']
            | components['schemas']['RaitPartyJRead']
            | components['schemas']['RaitPartyTRead'];
        };
      };
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitDocument: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitDocumentSRead']
            | components['schemas']['RaitDocumentMRead']
            | components['schemas']['RaitDocumentJRead']
            | components['schemas']['RaitDocumentTRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitDocument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitDocumentScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitDocument: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitDocumentSRead']
            | components['schemas']['RaitDocumentMRead']
            | components['schemas']['RaitDocumentJRead']
            | components['schemas']['RaitDocumentTRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitDocument: {
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
        'application/json': components['schemas']['UpdateRaitDocumentScopedInput'];
      };
    };
    responses: {
      /** @description Scoped ordinary metadata mutation; current action permission, complete parent purpose and verified-representation invariants required. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitDocumentSRead']
            | components['schemas']['RaitDocumentMRead']
            | components['schemas']['RaitDocumentJRead']
            | components['schemas']['RaitDocumentTRead'];
        };
      };
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitPendingContent: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitPendingContentSRead']
            | components['schemas']['RaitPendingContentORead']
            | components['schemas']['RaitPendingContentMRead']
            | components['schemas']['RaitPendingContentJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitPendingContent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitPendingContentScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitPendingContent: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitPendingContentSRead']
            | components['schemas']['RaitPendingContentORead']
            | components['schemas']['RaitPendingContentMRead']
            | components['schemas']['RaitPendingContentJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitPendingContent: {
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
        'application/json': components['schemas']['UpdateRaitPendingContentScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitRedirect: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitRedirectSRead']
            | components['schemas']['RaitRedirectORead']
            | components['schemas']['RaitRedirectMRead']
            | components['schemas']['RaitRedirectJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitRedirect: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitRedirectScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitRedirect: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitRedirectSRead']
            | components['schemas']['RaitRedirectORead']
            | components['schemas']['RaitRedirectMRead']
            | components['schemas']['RaitRedirectJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitRedirect: {
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
        'application/json': components['schemas']['UpdateRaitRedirectScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitAdmissibility: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitAdmissibilitySRead']
            | components['schemas']['RaitAdmissibilityMRead']
            | components['schemas']['RaitAdmissibilityJRead']
            | components['schemas']['RaitAdmissibilityTRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitDeadline: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitDeadlineSRead']
            | components['schemas']['RaitDeadlineORead']
            | components['schemas']['RaitDeadlineMRead']
            | components['schemas']['RaitDeadlineJRead']
            | components['schemas']['RaitDeadlineTRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitDeadline: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitDeadlineScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitDeadline: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitDeadlineSRead']
            | components['schemas']['RaitDeadlineORead']
            | components['schemas']['RaitDeadlineMRead']
            | components['schemas']['RaitDeadlineJRead']
            | components['schemas']['RaitDeadlineTRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitDeadline: {
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
        'application/json': components['schemas']['UpdateRaitDeadlineScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitInquiry: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitInquirySRead']
            | components['schemas']['RaitInquiryORead']
            | components['schemas']['RaitInquiryMRead']
            | components['schemas']['RaitInquiryJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitInquiry: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitInquiryScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitInquiry: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitInquirySRead']
            | components['schemas']['RaitInquiryORead']
            | components['schemas']['RaitInquiryMRead']
            | components['schemas']['RaitInquiryJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitInquiry: {
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
        'application/json': components['schemas']['UpdateRaitInquiryScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitDraft: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitDraftSRead']
            | components['schemas']['RaitDraftORead']
            | components['schemas']['RaitDraftMRead']
            | components['schemas']['RaitDraftJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitDraft: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitDraftScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitDraft: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitDraftSRead']
            | components['schemas']['RaitDraftORead']
            | components['schemas']['RaitDraftMRead']
            | components['schemas']['RaitDraftJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitDraft: {
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
        'application/json': components['schemas']['UpdateRaitDraftScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitDecision: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitDecisionSRead']
            | components['schemas']['RaitDecisionORead']
            | components['schemas']['RaitDecisionMRead']
            | components['schemas']['RaitDecisionJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitDecision: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitDecisionScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitDecision: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitDecisionSRead']
            | components['schemas']['RaitDecisionORead']
            | components['schemas']['RaitDecisionMRead']
            | components['schemas']['RaitDecisionJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitDecision: {
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
        'application/json': components['schemas']['UpdateRaitDecisionScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitCommunication: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitCommunicationSRead']
            | components['schemas']['RaitCommunicationORead']
            | components['schemas']['RaitCommunicationMRead']
            | components['schemas']['RaitCommunicationJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitCommunication: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitCommunicationScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitCommunication: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitCommunicationSRead']
            | components['schemas']['RaitCommunicationORead']
            | components['schemas']['RaitCommunicationMRead']
            | components['schemas']['RaitCommunicationJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitCommunication: {
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
        'application/json': components['schemas']['UpdateRaitCommunicationScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitCaseEvent: {
    parameters: {
      query?: {
        case_id?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': (
            | components['schemas']['RaitCaseEventSRead']
            | components['schemas']['RaitCaseEventORead']
            | components['schemas']['RaitCaseEventMRead']
            | components['schemas']['RaitCaseEventJRead']
          )[];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  createRaitCaseEvent: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitCaseEventScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  getRaitCaseEvent: {
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
      /** @description Authorized purpose-projected result; collections retain bare array shape and contain only scoped rows. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json':
            | components['schemas']['RaitCaseEventSRead']
            | components['schemas']['RaitCaseEventORead']
            | components['schemas']['RaitCaseEventMRead']
            | components['schemas']['RaitCaseEventJRead'];
        };
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitCaseEvent: {
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
        'application/json': components['schemas']['UpdateRaitCaseEventScopedInput'];
      };
    };
    responses: {
      /** @description VALIDATION_FAILED: protected/unknown fields, invalid references or empty/no-op raw mutation; no row/version/event/audit effect */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Action not permitted; no scope or candidate disclosure */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Missing or unauthorized parent/resource */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
