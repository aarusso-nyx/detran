// Generated from docs/framework/contracts/BP-DASHBOARD-CRASHES-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Celula interna agregada por tenant, periodo, municipio e gravidade. Nao contem identificador de pessoa, veiculo, localizacao precisa ou dados de saude; o projetor mantem as versoes distintas do envelope e do agregado para replay auditavel. */
    CrashAggregate: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: date */
      period_start: string;
      municipality_code: string;
      severity: string;
      /** @default 0 */
      crash_count: number;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashAggregateDto: {
      /** Format: date */
      period_start: string;
      municipality_code: string;
      severity: string;
      /** @default 0 */
      crash_count: number;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Ledger idempotente de dashboard.crashes. A chave (tenant_id, projection_name, event_id) permite replay integral ou incremental sem aceitar o mesmo evento duas vezes; insercao do ledger e efeito agregado compartilham a mesma transacao sob RLS. */
    CrashProjectionAppliedEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      projection_name: string;
      /** Format: uuid */
      event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /**
       * Format: date-time
       * @default now()
       */
      applied_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashProjectionAppliedEventDto: {
      projection_name: string;
      /** Format: uuid */
      event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /**
       * Format: date-time
       * @default now()
       */
      applied_at: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
