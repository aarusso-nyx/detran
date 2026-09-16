// Generated from docs/framework/contracts/BP-PORTAL-PROJECTIONS-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Projecao 'minhas autuacoes' (ADR-0020 Decision 2: portal.infraction_view <- INFRACAO_ESTADO_ALTERADO, NOTIFICACAO_EXPEDIDA, NOTIFICACAO_CIENCIA, PAGAMENTO_CONFIRMADO; portal-route-contract.md secao 4; plan R-0009 M16): uma linha por AIT (ait_id unico por tenant), situacao em linguagem cidada (INFRACTION_SITUATION_MAP em infraction-view.projection.ts; token sem mapa falha com PORTAL.INTERNAL — OD-P20), points_status em_disputa | definitivo | none, prazos, acoes, avisos e pagamento em jsonb; last_event_id / last_event_version para idempotencia e replay. */
    InfractionView: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      subject_cpf_hash: string;
      ait_number: string;
      plate: string;
      /** Format: date-time */
      occurred_at: string;
      framing_label: string;
      amount?: number | null;
      /** @enum {string} */
      situation:
        | 'aguardando_defesa'
        | 'em_defesa'
        | 'penalidade_aplicada'
        | 'em_recurso'
        | 'encerrada'
        | 'cancelada'
        | 'arquivada';
      deadlines_json: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      points_status: 'em_disputa' | 'definitivo' | 'none';
      actions_json: {
        [key: string]: unknown;
      };
      notices_json: {
        [key: string]: unknown;
      };
      payment_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: uuid */
      last_event_id: string;
      last_event_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInfractionViewDto: {
      /** Format: uuid */
      ait_id: string;
      subject_cpf_hash: string;
      ait_number: string;
      plate: string;
      /** Format: date-time */
      occurred_at: string;
      framing_label: string;
      amount?: number | null;
      /** @enum {string} */
      situation:
        | 'aguardando_defesa'
        | 'em_defesa'
        | 'penalidade_aplicada'
        | 'em_recurso'
        | 'encerrada'
        | 'cancelada'
        | 'arquivada';
      deadlines_json: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      points_status: 'em_disputa' | 'definitivo' | 'none';
      actions_json: {
        [key: string]: unknown;
      };
      notices_json: {
        [key: string]: unknown;
      };
      payment_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: uuid */
      last_event_id: string;
      last_event_version: number;
    };
    /** @description Projecao 'com voce' x 'com o orgao' do processo (ADR-0020 Decision 2: portal.process_timeline <- RAIT_CASO_*, RAIT_DECISAO_PUBLICADA, rait.inquiry.changed; RN-PORTAL-112; plan R-0009 M16): uma linha por caso (case_id unico por tenant; request_id nulo quando o caso nao nasceu de um pedido do portal), entries_json so com entradas visibility = citizen, deadlines_json e decision_json (nulo ate RAIT_DECISAO_PUBLICADA). */
    ProcessTimeline: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      request_id?: string | null;
      /** Format: uuid */
      case_id: string;
      entries_json: {
        [key: string]: unknown;
      };
      deadlines_json: {
        [key: string]: unknown;
      };
      decision_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: uuid */
      last_event_id: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProcessTimelineDto: {
      /** Format: uuid */
      request_id?: string | null;
      /** Format: uuid */
      case_id: string;
      entries_json: {
        [key: string]: unknown;
      };
      deadlines_json: {
        [key: string]: unknown;
      };
      decision_json?: {
        [key: string]: unknown;
      } | null;
      /** Format: uuid */
      last_event_id: string;
    };
    /** @description Projecao de pontuacao (ADR-0020 Decision 2: portal.points_view <- PENALIDADE_DEFINITIVA e leitura RENACH pelo adapter; RN-RAIT-131; plan R-0009 M16): uma linha por cidadao (subject_cpf_hash unico por tenant), pontos definitivos x em disputa, por veiculo e ultimos 12 meses em jsonb; last_event_id nulo quando so ha leitura nacional, cached_at nulo quando so ha eventos. */
    PointsView: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      subject_cpf_hash: string;
      definitive_points: number;
      disputed_points: number;
      by_vehicle_json: {
        [key: string]: unknown;
      };
      last_12_months_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id?: string | null;
      /** Format: date-time */
      cached_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePointsViewDto: {
      subject_cpf_hash: string;
      definitive_points: number;
      disputed_points: number;
      by_vehicle_json: {
        [key: string]: unknown;
      };
      last_12_months_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id?: string | null;
      /** Format: date-time */
      cached_at?: string | null;
    };
    /** @description Projecao de sinistro (BOAT) para o cidadao envolvido (ADR-0020 Decision 1; portal-route-contract.md secao 7 GET crashes/{id}; plan R-0009 M16): uma linha por sinistro (crash_id unico por tenant), rotulo de estado cidadao e resumo em jsonb com campos de terceiros suprimidos (third_party_fields_suppressed). Nesta rodada so a tabela e o projetor esqueleto (applyEvent registra last_event_id); produtor real em R-0010 (OD-P19). */
    CrashView: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      crash_id: string;
      subject_cpf_hash: string;
      state_label: string;
      summary_json: {
        [key: string]: unknown;
      };
      third_party_fields_suppressed: boolean;
      /** Format: uuid */
      last_event_id: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateCrashViewDto: {
      /** Format: uuid */
      crash_id: string;
      subject_cpf_hash: string;
      state_label: string;
      summary_json: {
        [key: string]: unknown;
      };
      third_party_fields_suppressed: boolean;
      /** Format: uuid */
      last_event_id: string;
    };
    /** @description Projecao de exame (PEC) para o cidadao (ADR-0020 Decision 1; portal-route-contract.md secao 7 GET exams/{id}; plan R-0009 M16): uma linha por exame (exam_id unico por tenant), rotulo legal, validade e prazo da junta. Nesta rodada so a tabela e o projetor esqueleto (applyEvent registra last_event_id); produtor real e do PEC (OD-P19). */
    ExamView: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      exam_id: string;
      subject_cpf_hash: string;
      legal_label: string;
      /** Format: date */
      valid_until?: string | null;
      /** Format: date */
      board_due_on?: string | null;
      /** Format: uuid */
      last_event_id: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateExamViewDto: {
      /** Format: uuid */
      exam_id: string;
      subject_cpf_hash: string;
      legal_label: string;
      /** Format: date */
      valid_until?: string | null;
      /** Format: date */
      board_due_on?: string | null;
      /** Format: uuid */
      last_event_id: string;
    };
    /** @description Livro de eventos aplicados pelos projetores (ADR-0020 Decision 1: idempotencia em event.id; plan R-0009 M16): uma linha por (tenant, event_id, projection) porque um mesmo evento pode alimentar mais de uma projecao (ex.: INFRACAO_ESTADO_ALTERADO -> infraction_view e entitlement). last_error registra a falha do projetor (PORTAL.INTERNAL, token sem mapa — OD-P20) e fica nulo apos aplicacao bem-sucedida. Replay = reaplicar a janela da outbox em ordem created_at. */
    ProjectionAppliedEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      event_id: string;
      projection: string;
      /** Format: date-time */
      applied_at: string;
      last_error?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProjectionAppliedEventDto: {
      /** Format: uuid */
      event_id: string;
      projection: string;
      /** Format: date-time */
      applied_at: string;
      last_error?: string | null;
    };
    /** @description Cache das leituras nacionais do cidadao (ADR-0020 Decision 5; portal-route-contract.md secao 7 GET documents/cnh, GET vehicles, GET vehicles/{id}/clearance; steering H.54; plan R-0009 M17): so por packages/senatran-adapter (CdtPort, RenachPort, RenavamReadPort via token PORTAL_NATIONAL_READ_PORTS), nunca fetch proprio (ADR-0003). kind cnh | vehicles | clearance; target_id nulo para cnh e vehicles, veiculo para clearance — unico por (tenant, subject, kind, coalesce(target_id)). TTL = parametro portal.read_cache_ttl_minutes; resposta sempre com cachedAt; fonte indisponivel com cache -> 200 com cachedAt antigo, sem cache -> 503 PORTAL.NATIONAL_READ_UNAVAILABLE. */
    NationalReadCache: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      kind: 'cnh' | 'vehicles' | 'clearance';
      /** Format: uuid */
      target_id?: string | null;
      payload_json: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      cached_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateNationalReadCacheDto: {
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      kind: 'cnh' | 'vehicles' | 'clearance';
      /** Format: uuid */
      target_id?: string | null;
      payload_json: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      cached_at: string;
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
