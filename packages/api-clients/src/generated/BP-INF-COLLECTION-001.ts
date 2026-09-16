// Generated from docs/framework/contracts/BP-INF-COLLECTION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/collection/collection-documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List CollectionDocument (most recent first, capped at 500) */
    get: operations['listCollectionDocument'];
    put?: never;
    post: operations['createCollectionDocument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/collection-documents/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getCollectionDocument'];
    put?: never;
    post?: never;
    delete: operations['removeCollectionDocument'];
    options?: never;
    head?: never;
    patch: operations['updateCollectionDocument'];
    trace?: never;
  };
  '/v1/inf/collection/payments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List Payment (most recent first, capped at 500) */
    get: operations['listPayment'];
    put?: never;
    post: operations['createPayment'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/payments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getPayment'];
    put?: never;
    post?: never;
    delete: operations['removePayment'];
    options?: never;
    head?: never;
    patch: operations['updatePayment'];
    trace?: never;
  };
  '/v1/inf/collection/refund-orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RefundOrder (most recent first, capped at 500) */
    get: operations['listRefundOrder'];
    put?: never;
    post: operations['createRefundOrder'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/refund-orders/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRefundOrder'];
    put?: never;
    post?: never;
    delete: operations['removeRefundOrder'];
    options?: never;
    head?: never;
    patch: operations['updateRefundOrder'];
    trace?: never;
  };
  '/v1/inf/collection/debt-handoffs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List DebtHandoff (most recent first, capped at 500) */
    get: operations['listDebtHandoff'];
    put?: never;
    post: operations['createDebtHandoff'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/debt-handoffs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getDebtHandoff'];
    put?: never;
    post?: never;
    delete: operations['removeDebtHandoff'];
    options?: never;
    head?: never;
    patch: operations['updateDebtHandoff'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Documento proprio de arrecadacao por faixa e fase — UC-RAIT-032 (fluxo 1 a 4, AC-RAIT-032-1 data-limite unica, AC-RAIT-032-3 duas casas truncadas) e ADR-0017 Decision 1. tier referencia inf.infraction_payment_tier_ref e issued_for_state a fase da infracao para a qual foi emitido (RAIT.COLLECTION_PHASE_INVALID e a guarda de comando). A faixa desconto_40_fora_sne existe no vocabulario e fica desligada pela flag collection.discount_40_outside_sne=false (steering H.53; RAIT.COLLECTION_DISCOUNT_SNE_ONLY). Estados minusculos derivados de ADR-0017 Decision 2 (emitir ou invalidar por fase) e do fluxo 3 e 4 do UC (decisao M12). */
    CollectionDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      infraction_id: string;
      /** @enum {string} */
      tier:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido';
      amount: number;
      barcode?: string | null;
      pix_reference?: string | null;
      /** Format: date */
      valid_until: string;
      /** @enum {string} */
      issued_for_state:
        | 'AIT_LAVRADO'
        | 'NOTIFICADO_AUTUACAO'
        | 'DEFESA_EM_JULGAMENTO'
        | 'PENALIDADE_A_APLICAR'
        | 'NOTIFICADO_PENALIDADE'
        | 'RECURSO_1A_INSTANCIA'
        | 'AGUARDANDO_RECURSO_2A'
        | 'RECURSO_2A_INSTANCIA'
        | 'INSTANCIA_ENCERRADA'
        | 'ARQUIVADO'
        | 'CANCELADO_POS_INTEGRACAO'
        | 'AIT_CANCELADO'
        | 'EXTINTO_DECADENCIA'
        | 'EXTINTO_PRESCRICAO'
        | 'CANCELADO_DEFINITIVO';
      /**
       * @default 'emitido'
       * @enum {string}
       */
      status: 'emitido' | 'pago' | 'vencido' | 'invalidado';
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      /** Format: uuid */
      issued_by?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** Format: uuid */
      supersedes_document_id?: string | null;
      /** Format: date-time */
      invalidated_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCollectionDocumentDto: {
      /** Format: uuid */
      infraction_id: string;
      /** @enum {string} */
      tier:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido';
      amount: number;
      barcode?: string | null;
      pix_reference?: string | null;
      /** Format: date */
      valid_until: string;
      /** @enum {string} */
      issued_for_state:
        | 'AIT_LAVRADO'
        | 'NOTIFICADO_AUTUACAO'
        | 'DEFESA_EM_JULGAMENTO'
        | 'PENALIDADE_A_APLICAR'
        | 'NOTIFICADO_PENALIDADE'
        | 'RECURSO_1A_INSTANCIA'
        | 'AGUARDANDO_RECURSO_2A'
        | 'RECURSO_2A_INSTANCIA'
        | 'INSTANCIA_ENCERRADA'
        | 'ARQUIVADO'
        | 'CANCELADO_POS_INTEGRACAO'
        | 'AIT_CANCELADO'
        | 'EXTINTO_DECADENCIA'
        | 'EXTINTO_PRESCRICAO'
        | 'CANCELADO_DEFINITIVO';
      /**
       * @default 'emitido'
       * @enum {string}
       */
      status: 'emitido' | 'pago' | 'vencido' | 'invalidado';
      /**
       * Format: date-time
       * @default now()
       */
      issued_at: string;
      /** Format: uuid */
      issued_by?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** Format: uuid */
      supersedes_document_id?: string | null;
      /** Format: date-time */
      invalidated_at?: string | null;
    };
    /** @description Pagamento vindo do retorno bancario e sua conciliacao — UC-RAIT-035 (fluxo 1 casamento por documento, valor e data; AC-RAIT-035-3 rastreabilidade) e ADR-0017 Decision 1. Retorno sem documento correspondente fica sem document_id e sem matched_at (RAIT.PAYMENT_UNMATCHED, catalogo secao 3.11); reversed_at registra o estorno que publica PAGAMENTO_ESTORNADO (ADR-0017 Decision 2). O pagamento nao muda estado da infracao: o agregado decide ([WF-INF-003] secao 2 linhas 12 a 16 e 29). */
    Payment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      document_id?: string | null;
      bank_reference: string;
      /** Format: date */
      paid_on: string;
      amount: number;
      /** @enum {string|null} */
      tier_applied?:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido'
        | null;
      /**
       * Format: date-time
       * @default now()
       */
      received_at: string;
      /** Format: date-time */
      matched_at?: string | null;
      /** Format: date-time */
      reversed_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePaymentDto: {
      /** Format: uuid */
      document_id?: string | null;
      bank_reference: string;
      /** Format: date */
      paid_on: string;
      amount: number;
      /** @enum {string|null} */
      tier_applied?:
        | 'nenhum'
        | 'desconto_80'
        | 'desconto_60_reconhecimento'
        | 'desconto_40_fora_sne'
        | 'integral_juros'
        | 'restituido'
        | null;
      /**
       * Format: date-time
       * @default now()
       */
      received_at: string;
      /** Format: date-time */
      matched_at?: string | null;
      /** Format: date-time */
      reversed_at?: string | null;
    };
    /** @description Ordem de restituicao corrigida — UC-RAIT-033 (fluxo 1 a 4, fluxo 3a dados bancarios ausentes, AC-RAIT-033-1 sem pedido do cidadao, AC-RAIT-033-2 indice visivel) e ADR-0017 Decision 1. index_key registra qual indice foi aplicado e nao tem default: o valor vigente e o parametro rait.refund.index (IPCA-E, ops.parameter; RAIT.REFUND_INDEX_PENDING quando nao parametrizado). Estados minusculos dos eventos reservados RESTITUICAO_ORDENADA e RESTITUICAO_PAGA (rait-events-sse-contract.md secao 2.5) mais a abertura por RESTITUICAO_DEVIDA (decisao M12). */
    RefundOrder: {
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
      payment_id: string;
      /** @enum {string} */
      reason:
        | 'decisao_favoravel'
        | 'extincao'
        | 'pagamento_duplicado'
        | 'pagamento_a_maior';
      base_amount: number;
      index_key: string;
      updated_amount?: number | null;
      /**
       * @default 'pendente'
       * @enum {string}
       */
      bank_data_status: 'pendente' | 'informado';
      /**
       * @default 'aberta'
       * @enum {string}
       */
      status: 'aberta' | 'ordenada' | 'paga';
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      ordered_at?: string | null;
      /** Format: date-time */
      paid_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRefundOrderDto: {
      /** Format: uuid */
      infraction_id: string;
      /** Format: uuid */
      payment_id: string;
      /** @enum {string} */
      reason:
        | 'decisao_favoravel'
        | 'extincao'
        | 'pagamento_duplicado'
        | 'pagamento_a_maior';
      base_amount: number;
      index_key: string;
      updated_amount?: number | null;
      /**
       * @default 'pendente'
       * @enum {string}
       */
      bank_data_status: 'pendente' | 'informado';
      /**
       * @default 'aberta'
       * @enum {string}
       */
      status: 'aberta' | 'ordenada' | 'paga';
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      ordered_at?: string | null;
      /** Format: date-time */
      paid_at?: string | null;
      /** Format: uuid */
      document_id?: string | null;
    };
    /** @description Encaminhamento do credito definitivo nao pago a Fazenda e a divida ativa — UC-RAIT-034 (fluxo 3 transferencia com o dossie fiscal, fluxo 2a pagamento durante a cobranca, AC-RAIT-034-2) e ADR-0017 Decision 1. Antes de INSTANCIA_ENCERRADA ou com efeito suspensivo o encaminhamento e recusado (RAIT.DEBT_HANDOFF_NOT_FINAL, guarda de comando porque depende do estado do agregado). A porta da Fazenda segue pendente de fonte (ADR-0017 tabela de ownership). */
    DebtHandoff: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      infraction_id: string;
      fazenda_reference?: string | null;
      /** Format: uuid */
      dossier_document_id?: string | null;
      /**
       * @default 'preparado'
       * @enum {string}
       */
      status: 'preparado' | 'enviado' | 'reconhecido' | 'cancelado';
      /**
       * Format: date-time
       * @default now()
       */
      prepared_at: string;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** @enum {string|null} */
      cancel_reason?: 'pagamento' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDebtHandoffDto: {
      /** Format: uuid */
      infraction_id: string;
      fazenda_reference?: string | null;
      /** Format: uuid */
      dossier_document_id?: string | null;
      /**
       * @default 'preparado'
       * @enum {string}
       */
      status: 'preparado' | 'enviado' | 'reconhecido' | 'cancelado';
      /**
       * Format: date-time
       * @default now()
       */
      prepared_at: string;
      /** Format: date-time */
      sent_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** @enum {string|null} */
      cancel_reason?: 'pagamento' | null;
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
  listCollectionDocument: {
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
          'application/json': components['schemas']['CollectionDocument'][];
        };
      };
    };
  };
  createCollectionDocument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateCollectionDocumentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionDocument'];
        };
      };
    };
  };
  getCollectionDocument: {
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
          'application/json': components['schemas']['CollectionDocument'];
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
  removeCollectionDocument: {
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
  updateCollectionDocument: {
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
        'application/json': components['schemas']['CreateCollectionDocumentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CollectionDocument'];
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
  listPayment: {
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
          'application/json': components['schemas']['Payment'][];
        };
      };
    };
  };
  createPayment: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreatePaymentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Payment'];
        };
      };
    };
  };
  getPayment: {
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
          'application/json': components['schemas']['Payment'];
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
  removePayment: {
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
  updatePayment: {
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
        'application/json': components['schemas']['CreatePaymentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Payment'];
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
  listRefundOrder: {
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
          'application/json': components['schemas']['RefundOrder'][];
        };
      };
    };
  };
  createRefundOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRefundOrderDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RefundOrder'];
        };
      };
    };
  };
  getRefundOrder: {
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
          'application/json': components['schemas']['RefundOrder'];
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
  removeRefundOrder: {
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
  updateRefundOrder: {
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
        'application/json': components['schemas']['CreateRefundOrderDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RefundOrder'];
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
  listDebtHandoff: {
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
          'application/json': components['schemas']['DebtHandoff'][];
        };
      };
    };
  };
  createDebtHandoff: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateDebtHandoffDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DebtHandoff'];
        };
      };
    };
  };
  getDebtHandoff: {
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
          'application/json': components['schemas']['DebtHandoff'];
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
  removeDebtHandoff: {
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
  updateDebtHandoff: {
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
        'application/json': components['schemas']['CreateDebtHandoffDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DebtHandoff'];
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
