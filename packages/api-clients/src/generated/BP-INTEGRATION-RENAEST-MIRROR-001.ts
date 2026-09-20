// Generated from docs/framework/contracts/BP-INTEGRATION-RENAEST-MIRROR-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Espelho por sinistro do protocolo e da situacao nacional recebidos em SINISTRO_TRANSMITIDO, SINISTRO_SITUACAO_NACIONAL e SINISTRO_RETIFICADO. retifications_json conserva somente fatos de retificacao necessarios ao painel de integracao, sem dados pessoais ou de saude. */
    RenaestMirror: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_id: string;
      protocol?: string | null;
      /** @enum {string|null} */
      national_status?:
        'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO' | null;
      /** @default '[]'::jsonb */
      rectifications_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRenaestMirrorDto: {
      /** Format: uuid */
      crash_id: string;
      protocol?: string | null;
      /** @enum {string|null} */
      national_status?:
        'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO' | null;
      /** @default '[]'::jsonb */
      rectifications_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Ledger idempotente de integration.renaest_mirror. O efeito no espelho e a linha desta chave unica sao atomicos sob RLS, para replay integral e incremental sem duplicar recibo ou retificacao. */
    RenaestMirrorAppliedEvent: {
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
    CreateRenaestMirrorAppliedEventDto: {
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
