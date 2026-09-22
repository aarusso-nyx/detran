// Generated from docs/framework/contracts/BP-INF-COLLECTION-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/collection/collection-documents': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['collectionDocumentIssue'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/payments/reconcile': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['collectionPaymentReconcile'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/refund-orders': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['collectionRefundOrder'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/collection/debt-handoffs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['collectionDebtHandoff'];
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
  collectionDocumentIssue: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Documento emitido */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  collectionPaymentReconcile: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pagamento conciliado */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  collectionRefundOrder: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Restituição ordenada */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  collectionDebtHandoff: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Dívida encaminhada */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
