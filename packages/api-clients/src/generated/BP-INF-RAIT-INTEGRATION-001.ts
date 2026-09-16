// Generated from docs/framework/contracts/BP-INF-RAIT-INTEGRATION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/reconciliations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitReconciliation (most recent first, capped at 500) */
    get: operations['listRaitReconciliation'];
    put?: never;
    post: operations['createRaitReconciliation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/reconciliations/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitReconciliation'];
    put?: never;
    post?: never;
    delete: operations['removeRaitReconciliation'];
    options?: never;
    head?: never;
    patch: operations['updateRaitReconciliation'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Conciliacao por sistema e janela — UC-RAIT-031 fluxo 3 (compara estado local e nacional, aplica a precedencia e registra a conciliacao; AC-RAIT-031-2) e fluxo 3a (divergencia que altera sujeito passivo ou pontuacao nunca e automatica: escala ao gestor), aberta pela divergencia de UC-RAIT-029 fluxo 3. divergences_count e o par de RAIT.RECONCILIATION_DIVERGENCE (catalogo secao 3.11); report_document_id e o relatorio da conciliacao pela fachada de documentos (ADR-0018 Decision 1) e nao tem FK porque nao existe tabela de documento. Estados minusculos derivados do UC (decisao M12). */
    RaitReconciliation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      system: 'renainf' | 'renach' | 'sne';
      /** Format: date */
      window_from: string;
      /** Format: date */
      window_to: string;
      /** Format: uuid */
      requested_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /**
       * @default 'solicitada'
       * @enum {string}
       */
      status: 'solicitada' | 'conciliada' | 'escalada';
      /** @default 0 */
      divergences_count: number;
      /** Format: uuid */
      report_document_id?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitReconciliationDto: {
      /** @enum {string} */
      system: 'renainf' | 'renach' | 'sne';
      /** Format: date */
      window_from: string;
      /** Format: date */
      window_to: string;
      /** Format: uuid */
      requested_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /**
       * @default 'solicitada'
       * @enum {string}
       */
      status: 'solicitada' | 'conciliada' | 'escalada';
      /** @default 0 */
      divergences_count: number;
      /** Format: uuid */
      report_document_id?: string | null;
      /** Format: date-time */
      resolved_at?: string | null;
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
  listRaitReconciliation: {
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
          'application/json': components['schemas']['RaitReconciliation'][];
        };
      };
    };
  };
  createRaitReconciliation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitReconciliationDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitReconciliation'];
        };
      };
    };
  };
  getRaitReconciliation: {
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
          'application/json': components['schemas']['RaitReconciliation'];
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
  removeRaitReconciliation: {
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
  updateRaitReconciliation: {
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
        'application/json': components['schemas']['CreateRaitReconciliationDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitReconciliation'];
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
