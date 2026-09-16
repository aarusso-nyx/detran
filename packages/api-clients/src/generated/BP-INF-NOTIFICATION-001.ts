// Generated from docs/framework/contracts/BP-INF-NOTIFICATION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/notification/notices': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Notice (most recent first, capped at 500) */
    get: operations['listNotice'];
    put?: never;
    post: operations['createNotice'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/notification/notices/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNotice'];
    put?: never;
    post?: never;
    delete: operations['removeNotice'];
    options?: never;
    head?: never;
    patch: operations['updateNotice'];
    trace?: never;
  };
  '/v1/inf/notification/acknowledgements': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NoticeAcknowledgement (most recent first, capped at 500) */
    get: operations['listNoticeAcknowledgement'];
    put?: never;
    post: operations['createNoticeAcknowledgement'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/notification/acknowledgements/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNoticeAcknowledgement'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/notification/delivery-attempts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List NoticeDeliveryAttempt (most recent first, capped at 500) */
    get: operations['listNoticeDeliveryAttempt'];
    put?: never;
    post: operations['createNoticeDeliveryAttempt'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/notification/delivery-attempts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getNoticeDeliveryAttempt'];
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
    /** @description Aviso expedido pelo orgao — NA, NP, decisao, diligencia ou edital (ADR-0016 Decision 1; [WF-INF-002] secao 2 P2 Notificar). Dois marcos sempre separados: expedicao (dispatched_at/dispatched_on, prazo do orgao) e ciencia (inf.notice_acknowledgement, prazo do administrado). case_id referencia inf.rait_case sem FK — outro modulo. addressee_ref e referencia opaca, sem PII. */
    Notice: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      infraction_id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      kind: 'NA' | 'NP' | 'DECISAO' | 'DILIGENCIA' | 'EDITAL';
      /** @enum {string} */
      addressee_kind:
        | 'proprietario'
        | 'principal_condutor'
        | 'condutor_identificado'
        | 'possuidor_equiparado'
        | 'embarcador'
        | 'transportador';
      /** Format: uuid */
      addressee_ref?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /** Format: date-time */
      issued_at: string;
      /** Format: date-time */
      dispatched_at?: string | null;
      /** Format: date */
      dispatched_on?: string | null;
      /** Format: date */
      printed_deadline_on?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** @enum {string} */
      status:
        | 'solicitada'
        | 'expedida'
        | 'publicada'
        | 'devolvida'
        | 'falha'
        | 'eficaz';
      /** Format: uuid */
      supersedes_notice_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNoticeDto: {
      /** Format: uuid */
      infraction_id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      kind: 'NA' | 'NP' | 'DECISAO' | 'DILIGENCIA' | 'EDITAL';
      /** @enum {string} */
      addressee_kind:
        | 'proprietario'
        | 'principal_condutor'
        | 'condutor_identificado'
        | 'possuidor_equiparado'
        | 'embarcador'
        | 'transportador';
      /** Format: uuid */
      addressee_ref?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /** Format: date-time */
      issued_at: string;
      /** Format: date-time */
      dispatched_at?: string | null;
      /** Format: date */
      dispatched_on?: string | null;
      /** Format: date */
      printed_deadline_on?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** @enum {string} */
      status:
        | 'solicitada'
        | 'expedida'
        | 'publicada'
        | 'devolvida'
        | 'falha'
        | 'eficaz';
      /** Format: uuid */
      supersedes_notice_id?: string | null;
    };
    /** @description Ciencia efetiva ou ficta de um aviso (ADR-0016 Decision 1; [RN-RAIT-104]; inf.notification_channel_ref). Uma por aviso: effective_on e o marco a partir do qual correm os prazos do administrado (T-DEF, T-NP-VENC). fictitious=true no SNE quando vale a disponibilizacao + 30 dias (T-SNE-CIENCIA). */
    NoticeAcknowledgement: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      notice_id: string;
      /** Format: date */
      effective_on: string;
      fictitious: boolean;
      /** @enum {string} */
      evidence_kind:
        | 'ar_postal'
        | 'recibo_sne'
        | 'publicacao_edital'
        | 'assinatura'
        | 'registro_balcao';
      evidence_ref?: string | null;
      /** Format: date-time */
      registered_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNoticeAcknowledgementDto: {
      /** Format: uuid */
      notice_id: string;
      /** Format: date */
      effective_on: string;
      fictitious: boolean;
      /** @enum {string} */
      evidence_kind:
        | 'ar_postal'
        | 'recibo_sne'
        | 'publicacao_edital'
        | 'assinatura'
        | 'registro_balcao';
      evidence_ref?: string | null;
      /** Format: date-time */
      registered_at: string;
    };
    /** @description Tentativa de entrega de um aviso por canal (ADR-0016 Decision 1 e 3; [WF-INF-002] secao 2: retorno da remessa entregue | devolvida | falha). Refazimento do ato gera novo aviso com supersedes_notice_id, nunca reescreve a tentativa. outbox_id liga a entrega ao envelope da integration.outbox. */
    NoticeDeliveryAttempt: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      notice_id: string;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /** Format: date-time */
      attempted_at: string;
      /** @enum {string} */
      outcome: 'entregue' | 'devolvida' | 'falha';
      provider_ref?: string | null;
      error_code?: string | null;
      /** Format: uuid */
      outbox_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNoticeDeliveryAttemptDto: {
      /** Format: uuid */
      notice_id: string;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /** Format: date-time */
      attempted_at: string;
      /** @enum {string} */
      outcome: 'entregue' | 'devolvida' | 'falha';
      provider_ref?: string | null;
      error_code?: string | null;
      /** Format: uuid */
      outbox_id?: string | null;
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
  listNotice: {
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
          'application/json': components['schemas']['Notice'][];
        };
      };
    };
  };
  createNotice: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNoticeDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Notice'];
        };
      };
    };
  };
  getNotice: {
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
          'application/json': components['schemas']['Notice'];
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
  removeNotice: {
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
  updateNotice: {
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
        'application/json': components['schemas']['CreateNoticeDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Notice'];
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
  listNoticeAcknowledgement: {
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
          'application/json': components['schemas']['NoticeAcknowledgement'][];
        };
      };
    };
  };
  createNoticeAcknowledgement: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNoticeAcknowledgementDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NoticeAcknowledgement'];
        };
      };
    };
  };
  getNoticeAcknowledgement: {
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
          'application/json': components['schemas']['NoticeAcknowledgement'];
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
  listNoticeDeliveryAttempt: {
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
          'application/json': components['schemas']['NoticeDeliveryAttempt'][];
        };
      };
    };
  };
  createNoticeDeliveryAttempt: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateNoticeDeliveryAttemptDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NoticeDeliveryAttempt'];
        };
      };
    };
  };
  getNoticeDeliveryAttempt: {
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
          'application/json': components['schemas']['NoticeDeliveryAttempt'];
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
