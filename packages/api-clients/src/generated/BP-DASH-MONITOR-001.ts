// Generated from docs/framework/contracts/BP-DASH-MONITOR-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Estado proprio do ciclo do alerta (WF-DASH-001 secao Estados e secao Transicoes e gatilhos; dashboard-route-contract secao 2; plan R-0011 M4). track in {extinction, irregularity} (WF-DASH-001 secao Por que duas trilhas); state in dashboard.alert_state_ref; severity in dashboard.severity_ref (matriz de severidade); block in dashboard.block_ref; objeto opaco por camada = object_kind + object_ref + object_layer (RN-DASH-170: N3 nunca entra, so N0..N2); dono = owner_role + owner_ref; governing_clock in {A,B,C,D} nulo (RN-DASH-131, so RAIT); next_milestone_at e ceiling_on sao gravados a partir do app de origem, nunca calculados aqui (RN-DASH-131 verificacao 4; RN-DASH-101). CRITICO_EXTINCAO e INCIDENTE_REGISTRADO so na trilha de extincao (check); bloco B pode gerar alerta de extincao (IND-DASH-202, WF-DASH-002 nota de leitura), por isso nao ha check bloco x trilha. ack_channel in {origin, manual} (dashboard-route-contract secao 2, ack) obrigatorio quando acknowledged_at existe. Nenhum dado pessoal, placa, numero de processo ou atributo de saude em coluna alguma (RN-DASH-170 N3). */
    Alert: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      indicator_code: string;
      /** @enum {string} */
      track: 'extinction' | 'irregularity';
      /** @enum {string} */
      state:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO';
      /** @enum {string} */
      severity: 'N1' | 'N2' | 'N3' | 'CRITICO';
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      /** @enum {string} */
      source_app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      object_kind: string;
      object_ref: string;
      /** @enum {string} */
      object_layer: 'N0' | 'N1' | 'N2';
      owner_role: string;
      /** Format: uuid */
      owner_ref?: string | null;
      /** @enum {string|null} */
      governing_clock?: 'A' | 'B' | 'C' | 'D' | null;
      /** Format: date-time */
      next_milestone_at?: string | null;
      /** Format: date */
      ceiling_on?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      detected_at: string;
      /** Format: date-time */
      classified_at?: string | null;
      /** Format: date-time */
      notified_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: date-time */
      treating_at?: string | null;
      /** Format: date-time */
      verified_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      escalated_at?: string | null;
      /** Format: date-time */
      critical_at?: string | null;
      /** Format: date-time */
      incident_at?: string | null;
      ack_channel?: string | null;
      /** @default 0 */
      escalation_level: number;
      incident_ref?: string | null;
      /** Format: uuid */
      source_event_id?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlertDto: {
      indicator_code: string;
      /** @enum {string} */
      track: 'extinction' | 'irregularity';
      /** @enum {string} */
      state:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO';
      /** @enum {string} */
      severity: 'N1' | 'N2' | 'N3' | 'CRITICO';
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      /** @enum {string} */
      source_app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      object_kind: string;
      object_ref: string;
      /** @enum {string} */
      object_layer: 'N0' | 'N1' | 'N2';
      owner_role: string;
      /** Format: uuid */
      owner_ref?: string | null;
      /** @enum {string|null} */
      governing_clock?: 'A' | 'B' | 'C' | 'D' | null;
      /** Format: date-time */
      next_milestone_at?: string | null;
      /** Format: date */
      ceiling_on?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      detected_at: string;
      /** Format: date-time */
      classified_at?: string | null;
      /** Format: date-time */
      notified_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: date-time */
      treating_at?: string | null;
      /** Format: date-time */
      verified_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date-time */
      escalated_at?: string | null;
      /** Format: date-time */
      critical_at?: string | null;
      /** Format: date-time */
      incident_at?: string | null;
      ack_channel?: string | null;
      /** @default 0 */
      escalation_level: number;
      incident_ref?: string | null;
      /** Format: uuid */
      source_event_id?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Trilha imutavel do alerta (WF-DASH-001 secao Transicoes e gatilhos; RN-DASH-131 "trilha imutavel de emissao, entrega e reconhecimento"; RN-DASH-135; dashboard-route-contract secao 2, root-cause e GET alerts/{id}): uma linha por transicao ou anotacao, seq crescente por alerta, from_state/to_state in dashboard.alert_state_ref (anotacao sem transicao repete o estado), actor_kind in {system, user, timer} (envelope rait-events-sse-contract secao 1), root_cause_category in {transport, acceptance, payload} (dashboard-route-contract secao 2, DASH.ROOT_CAUSE_CATEGORY_INVALID), event_id = evento de origem que causou a transicao. note nunca carrega dado pessoal (RN-DASH-170 N3). */
    AlertTrail: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      alert_id: string;
      seq: number;
      /** @enum {string|null} */
      from_state?:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO'
        | null;
      /** @enum {string} */
      to_state:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO';
      /** @enum {string} */
      actor_kind: 'system' | 'user' | 'timer';
      actor_ref?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      note?: string | null;
      /** @enum {string|null} */
      root_cause_category?: 'transport' | 'acceptance' | 'payload' | null;
      /** Format: uuid */
      event_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAlertTrailDto: {
      /** Format: uuid */
      alert_id: string;
      seq: number;
      /** @enum {string|null} */
      from_state?:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO'
        | null;
      /** @enum {string} */
      to_state:
        | 'DETECTADO'
        | 'CLASSIFICADO'
        | 'NOTIFICADO'
        | 'RECONHECIDO'
        | 'EM_TRATAMENTO'
        | 'VERIFICADO'
        | 'ENCERRADO'
        | 'ESCALONADO'
        | 'CRITICO_EXTINCAO'
        | 'INCIDENTE_REGISTRADO';
      /** @enum {string} */
      actor_kind: 'system' | 'user' | 'timer';
      actor_ref?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      note?: string | null;
      /** @enum {string|null} */
      root_cause_category?: 'transport' | 'acceptance' | 'payload' | null;
      /** Format: uuid */
      event_id?: string | null;
    };
    /** @description Catalogo dos deveres periodicos por tenant: as 15 linhas da tabela-mestra de RN-DASH-120 (1..14 + linha "+" Pnatrans, plan R-0011 A4 / OD-D14), com os cinco campos da tabela (RN-DASH-120 verificacao 1: title, source_ref, periodicity, consequence, rule_ref) verbatim. deadline_rule = regra de data-limite verbatim da fonte que a fixa (WF-DASH-002 secao Prazos; dashboard-route-contract secao 3; parameter-catalogue dashboard.duty.*), nula = "sem prazo definido" (RN-DASH-113). deadline_kind classifica a regra (CTG-0001 secao 2). scope in {estadual, federal, historico} (RN-DASH-120 conclusao 3). owner_role = dash-duty-owner (H.38, OD-D01); owner_actor verbatim da coluna Dono de APP-DASHBOARD secao Catalogo quando ha indicador, nulo = source_pending. indicator_code liga a linha ao indicador de bloco B/C quando RN-DASH-120 e o catalogo coincidem (CTG-0001 secao 5). mvp = linhas 1, 2, 8, 9, 10, 11, 13 e 14 (RN-DASH-120 verificacao 3). */
    Duty: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      line_no?: number | null;
      title: string;
      source_ref: string;
      periodicity: string;
      deadline_rule?: string | null;
      /** @enum {string} */
      deadline_kind:
        | 'fixed_day'
        | 'monthly'
        | 'annual_date'
        | 'continuous'
        | 'per_event'
        | 'undefined'
        | 'historical';
      consequence: string;
      rule_ref: string;
      /** @enum {string} */
      scope: 'estadual' | 'federal' | 'historico';
      /** @default 'dash-duty-owner' */
      owner_role: string;
      owner_actor?: string | null;
      indicator_code?: string | null;
      /** @default false */
      mvp: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDutyDto: {
      code: string;
      line_no?: number | null;
      title: string;
      source_ref: string;
      periodicity: string;
      deadline_rule?: string | null;
      /** @enum {string} */
      deadline_kind:
        | 'fixed_day'
        | 'monthly'
        | 'annual_date'
        | 'continuous'
        | 'per_event'
        | 'undefined'
        | 'historical';
      consequence: string;
      rule_ref: string;
      /** @enum {string} */
      scope: 'estadual' | 'federal' | 'historico';
      /** @default 'dash-duty-owner' */
      owner_role: string;
      owner_actor?: string | null;
      indicator_code?: string | null;
      /** @default false */
      mvp: boolean;
    };
    /** @description Instancia do ciclo recorrente de um dever (WF-DASH-002 secao Estados e secao Transicoes e gatilhos; dashboard-route-contract secao 3): uma linha por (duty_code, period); period texto YYYY-MM (mensal), YYYY (anual) ou YYYY-MM-DD (por evento/marco) com check de formato; state in dashboard.duty_state_ref; deadline_on nula = "sem prazo definido" (RN-DASH-113; DASH.DUTY_NO_LEGAL_DEADLINE); carimbos por transicao; evidencia = protocol + capture_uri + hash (WF-DASH-002 SUBMETIDO_PUBLICADO -> COMPROVADO; DASH.DUTY_EVIDENCE_REQUIRED, DASH.DUTY_EVIDENCE_HASH_INVALID): COMPROVADO/ARQUIVADO exigem evidence_hash (check); draft_ref = minuta de PREPARADO (dashboard-route-contract secao 3, prepare). */
    DutyCycle: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      duty_code: string;
      period: string;
      /** @enum {string} */
      state:
        | 'JANELA_ABERTA'
        | 'EM_APURACAO'
        | 'PREPARADO'
        | 'SUBMETIDO_PUBLICADO'
        | 'COMPROVADO'
        | 'ARQUIVADO'
        | 'ATRASADO'
        | 'NAO_CUMPRIDO';
      /** Format: date */
      deadline_on?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      started_at?: string | null;
      /** Format: date-time */
      prepared_at?: string | null;
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      proved_at?: string | null;
      /** Format: date-time */
      archived_at?: string | null;
      /** Format: date-time */
      late_at?: string | null;
      /** Format: date-time */
      unfulfilled_at?: string | null;
      draft_ref?: string | null;
      evidence_protocol?: string | null;
      evidence_capture_uri?: string | null;
      evidence_hash?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDutyCycleDto: {
      duty_code: string;
      period: string;
      /** @enum {string} */
      state:
        | 'JANELA_ABERTA'
        | 'EM_APURACAO'
        | 'PREPARADO'
        | 'SUBMETIDO_PUBLICADO'
        | 'COMPROVADO'
        | 'ARQUIVADO'
        | 'ATRASADO'
        | 'NAO_CUMPRIDO';
      /** Format: date */
      deadline_on?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: date-time */
      started_at?: string | null;
      /** Format: date-time */
      prepared_at?: string | null;
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      proved_at?: string | null;
      /** Format: date-time */
      archived_at?: string | null;
      /** Format: date-time */
      late_at?: string | null;
      /** Format: date-time */
      unfulfilled_at?: string | null;
      draft_ref?: string | null;
      evidence_protocol?: string | null;
      evidence_capture_uri?: string | null;
      evidence_hash?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Catalogo dos 42 indicadores por tenant (APP-DASHBOARD secao Catalogo de indicadores, tabelas A..D, verbatim: name, question, source_ref, threshold_rule, owner_actor, expected_action; plan R-0011 M4/M8; dashboard-route-contract secao 4 GET indicators). block in dashboard.block_ref e kind = block_ref.kind (check de coerencia); source_app normaliza o prefixo da coluna Fonte; classification default P3 (RN-DASH-142 verificacao 1: todo indicador nasce P3); latency_band = faixa do bloco (WF-DASH-003 secao Latencia aceitavel, DT-030) e acceptable_latency_minutes nula = source_pending (plan M13); unavailable_strategy nula = default do bloco (WF-DASH-003 secao Duas estrategias: ocultar A, marcar B/C/D), parametrizavel por indicador; projection = nome da projecao (CTG-0001 secao 4.2) ou nula; connected = existe produtor em main dos eventos consumidos (plan M5, OD-P28); clock_code in {A,B,C,D} so para os relogios do RAIT (RN-DASH-131). */
    Indicator: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      code: string;
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      /** @enum {string} */
      kind:
        | 'legal-ceiling'
        | 'dever-periodico'
        | 'sla-operacional'
        | 'saude-tecnica';
      name: string;
      question: string;
      /** @enum {string} */
      source_app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      source_ref: string;
      threshold_rule: string;
      owner_actor: string;
      expected_action: string;
      /**
       * @default 'P3'
       * @enum {string}
       */
      classification: 'P1' | 'P2' | 'P3';
      latency_band: string;
      acceptable_latency_minutes?: number | null;
      /** @enum {string|null} */
      unavailable_strategy?: 'hide' | 'mark' | null;
      /** @enum {string|null} */
      projection?:
        | 'dashboard.prescription_risk'
        | 'dashboard.production'
        | 'dashboard.integration_health'
        | 'dashboard.pec_deadlines'
        | 'dashboard.teat_measures'
        | 'dashboard.portal_service_metrics'
        | 'dashboard.duty_evidence'
        | 'dashboard.source_freshness'
        | 'dashboard.crashes'
        | null;
      /** @default false */
      connected: boolean;
      /** @enum {string|null} */
      clock_code?: 'A' | 'B' | 'C' | 'D' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateIndicatorDto: {
      code: string;
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      /** @enum {string} */
      kind:
        | 'legal-ceiling'
        | 'dever-periodico'
        | 'sla-operacional'
        | 'saude-tecnica';
      name: string;
      question: string;
      /** @enum {string} */
      source_app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      source_ref: string;
      threshold_rule: string;
      owner_actor: string;
      expected_action: string;
      /**
       * @default 'P3'
       * @enum {string}
       */
      classification: 'P1' | 'P2' | 'P3';
      latency_band: string;
      acceptable_latency_minutes?: number | null;
      /** @enum {string|null} */
      unavailable_strategy?: 'hide' | 'mark' | null;
      /** @enum {string|null} */
      projection?:
        | 'dashboard.prescription_risk'
        | 'dashboard.production'
        | 'dashboard.integration_health'
        | 'dashboard.pec_deadlines'
        | 'dashboard.teat_measures'
        | 'dashboard.portal_service_metrics'
        | 'dashboard.duty_evidence'
        | 'dashboard.source_freshness'
        | 'dashboard.crashes'
        | null;
      /** @default false */
      connected: boolean;
      /** @enum {string|null} */
      clock_code?: 'A' | 'B' | 'C' | 'D' | null;
    };
    /** @description Configuracao de indicador portada de BP-BI-REPORTING-001 (origem TEAT, entidade IndicatorConfig: code, name, description, formula, granularity, status) sem traffic_agency_id (plan R-0011 M4; OD-D13), ligada ao catalogo por indicator_code. Ciclo rascunho -> vigente (dashboard-route-contract secao 4: PATCH indicator-configs/{id} = draft, POST .../publish = published, evento IndicatorConfigChanged no CTG-0002). threshold_json = limiar calibrado (DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED, DT-030) e acceptable_latency_minutes por painel (DASH.INDICATOR_LATENCY_INVALID; valor exato source_pending, M13). */
    IndicatorConfig: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      indicator_code: string;
      code: string;
      name: string;
      description?: string | null;
      formula: string;
      granularity: string;
      threshold_json?: {
        [key: string]: unknown;
      } | null;
      acceptable_latency_minutes?: number | null;
      /**
       * @default 'draft'
       * @enum {string}
       */
      status: 'draft' | 'published';
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateIndicatorConfigDto: {
      indicator_code: string;
      code: string;
      name: string;
      description?: string | null;
      formula: string;
      granularity: string;
      threshold_json?: {
        [key: string]: unknown;
      } | null;
      acceptable_latency_minutes?: number | null;
      /**
       * @default 'draft'
       * @enum {string}
       */
      status: 'draft' | 'published';
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Painel de BI portado de BP-BI-REPORTING-001 (origem TEAT, entidade BiPanel: name, description, visibility_profile, config_json, status) sem traffic_agency_id (plan R-0011 M4; OD-D13, telas de apoio D-14/D-16). visibility_profile vira camada N0/N1/N2 de RN-DASH-170 e nunca N3 (dashboard-route-contract secao 8.3; config_json nunca referencia N3). Ciclo rascunho -> publicado (dashboard-route-contract secao 4, POST bi-panels/{id}/publish). */
    BiPanel: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      description?: string | null;
      /** @enum {string} */
      visibility_profile: 'N0' | 'N1' | 'N2';
      config_json: {
        [key: string]: unknown;
      };
      /**
       * @default 'draft'
       * @enum {string}
       */
      status: 'draft' | 'published';
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateBiPanelDto: {
      name: string;
      description?: string | null;
      /** @enum {string} */
      visibility_profile: 'N0' | 'N1' | 'N2';
      config_json: {
        [key: string]: unknown;
      };
      /**
       * @default 'draft'
       * @enum {string}
       */
      status: 'draft' | 'published';
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Relatorio gerado por job, portado de BP-BI-REPORTING-001 (origem TEAT, entidade GeneratedReport: user_ref, report_type, filters_json, requested_at, completed_at, status, file_uri, file_hash) sem traffic_agency_id (plan R-0011 M4). status in {processing, completed, failed} (dashboard-route-contract secao 4: request/complete/fail; DASH.REPORT_STATE_INVALID); completed exige file_uri e file_hash (DASH.REPORT_FILE_HASH_MISMATCH); layer in N0..N2 e purpose (N2) porque o arquivo herda a camada e leva marca d agua (RN-DASH-172 regras 1..3; watermark preenchida no CTG-0002). */
    GeneratedReport: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      user_ref: string;
      report_type: string;
      filters_json?: {
        [key: string]: unknown;
      } | null;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      completed_at?: string | null;
      /**
       * @default 'processing'
       * @enum {string}
       */
      status: 'processing' | 'completed' | 'failed';
      file_uri?: string | null;
      file_hash?: string | null;
      watermark?: string | null;
      failure_code?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateGeneratedReportDto: {
      /** Format: uuid */
      user_ref: string;
      report_type: string;
      filters_json?: {
        [key: string]: unknown;
      } | null;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      completed_at?: string | null;
      /**
       * @default 'processing'
       * @enum {string}
       */
      status: 'processing' | 'completed' | 'failed';
      file_uri?: string | null;
      file_hash?: string | null;
      watermark?: string | null;
      failure_code?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Registro de exportacao (RN-DASH-172 cinco regras; RN-DASH-171 conteudo minimo do registro de acesso: quem = user_ref + user_role, quando, o que = scope + filters_json, granularidade = layer, volume = row_count, origem, finalidade = purpose; dashboard-route-contract secao 4 POST exports / approve; plan R-0011 M4). layer in N0..N2 (regra 1 herda a camada; regra 4 veda N3); purpose obrigatoria em N2 (regra 2; DASH.EXPORT_PURPOSE_REQUIRED); watermark (regra 3); status in {registered, pending-approval, approved, rejected} - acima de dashboard.export.approval_rows fica pending-approval e approved exige approved_by nominal (regra 5; DASH.EXPORT_VOLUME_APPROVAL_REQUIRED); suppressed_cells = celulas suprimidas (RN-DASH-161; DASH.CELL_SUPPRESSED). */
    ExportLog: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      user_ref: string;
      user_role: string;
      scope: string;
      filters_json: {
        [key: string]: unknown;
      };
      format: string;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      row_count: number;
      /**
       * @default 'registered'
       * @enum {string}
       */
      status: 'registered' | 'pending-approval' | 'approved' | 'rejected';
      justification?: string | null;
      /** Format: uuid */
      approved_by?: string | null;
      /** Format: date-time */
      approved_at?: string | null;
      watermark?: string | null;
      /** @default 0 */
      suppressed_cells: number;
      origin?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateExportLogDto: {
      /** Format: uuid */
      user_ref: string;
      user_role: string;
      scope: string;
      filters_json: {
        [key: string]: unknown;
      };
      format: string;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      row_count: number;
      /**
       * @default 'registered'
       * @enum {string}
       */
      status: 'registered' | 'pending-approval' | 'approved' | 'rejected';
      justification?: string | null;
      /** Format: uuid */
      approved_by?: string | null;
      /** Format: date-time */
      approved_at?: string | null;
      watermark?: string | null;
      /** @default 0 */
      suppressed_cells: number;
      origin?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
    };
    /** @description Selo de frescor por fonte (WF-DASH-003 secao Estados; dashboard-route-contract secao 4 GET sources; plan R-0011 M4/M5): source_key unica por tenant, app de origem, state in dashboard.freshness_state_ref, last_seen_at = ultimo heartbeat/evento, last_read_at = ultima leitura de fallback, acceptable_latency_minutes nula = source_pending (M13), heartbeat_contract = type do evento de heartbeat (OD-D07: source.heartbeat) - nula = fonte sem contrato, que nunca fica FRESCO (DASH.SOURCE_HEARTBEAT_UNDEFINED; "fonte desconectada" = indicator.connected = false + INDISPONIVEL), stale_since obrigatoria em DESATUALIZADO_MARCADO, hidden = estrategia ocultar aplicada (WF-DASH-003 secao Duas estrategias; OD-D06 apos dashboard.stale_hide_multiplier). Atualizada pelo projetor source-freshness (last_event_id) e pelo servico de frescor do CTG-0002. */
    Source: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      source_key: string;
      /** @enum {string} */
      app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      /** @enum {string} */
      state: 'FRESCO' | 'ATRASADO' | 'INDISPONIVEL' | 'DESATUALIZADO_MARCADO';
      /** Format: date-time */
      last_seen_at?: string | null;
      /** Format: date-time */
      last_read_at?: string | null;
      acceptable_latency_minutes?: number | null;
      heartbeat_contract?: string | null;
      /** Format: date-time */
      stale_since?: string | null;
      /** @default false */
      hidden: boolean;
      /** Format: uuid */
      last_event_id?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSourceDto: {
      source_key: string;
      /** @enum {string} */
      app:
        | 'rait'
        | 'pec'
        | 'boat'
        | 'teat'
        | 'portal'
        | 'senatran-adapter'
        | 'dashboard'
        | 'institucional'
        | 'benchmark'
        | 'interno'
        | 'todos';
      /** @enum {string} */
      state: 'FRESCO' | 'ATRASADO' | 'INDISPONIVEL' | 'DESATUALIZADO_MARCADO';
      /** Format: date-time */
      last_seen_at?: string | null;
      /** Format: date-time */
      last_read_at?: string | null;
      acceptable_latency_minutes?: number | null;
      heartbeat_contract?: string | null;
      /** Format: date-time */
      stale_since?: string | null;
      /** @default false */
      hidden: boolean;
      /** Format: uuid */
      last_event_id?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Ciclo mensal de auditoria da transparencia ativa (IND-DASH-209; APP-DASHBOARD secao Catalogo B; WF-DASH-002 secao Prazos linha 209; dashboard.transparency.audit_period = monthly, DT-030; dashboard-route-contract secao 4 GET transparency/checklist, POST transparency/audits): period YYYY-MM unico por tenant, checklist_json = itens do checklist tecnico de RN-DASH-151 / LAI art. 8 par. 3 (RN-DASH-140), result = resultado textual (vocabulario fechado pendente, CTG-0001 secao 8), audited_by = quem auditou (papel technical-admin/agency-admin). */
    TransparencyAudit: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      period: string;
      checklist_json: {
        [key: string]: unknown;
      };
      result: string;
      /** Format: uuid */
      audited_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      audited_at: string;
      notes?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTransparencyAuditDto: {
      period: string;
      checklist_json: {
        [key: string]: unknown;
      };
      result: string;
      /** Format: uuid */
      audited_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      audited_at: string;
      notes?: string | null;
    };
    /** @description Conjunto de dados publicavel (RN-DASH-151 sete requisitos cumulativos como colunas booleanas req_*; verificacoes 2..6: dicionario, historico, ressalva de qualidade, periodicidade declarada, licenca; RN-DASH-142 verificacoes 1, 4 e 5: nasce P3, promocao a P1/P2 e ato explicito com responsavel, data e fundamento, conjunto derivado versionado; dashboard-route-contract secao 4 GET datasets, GET /open-data/{dataset}; DASH.DATASET_REQUIREMENTS_UNMET). Publicado exige classification in {P1, P2}, os sete requisitos e suppression_applied (RN-DASH-161; DASH.CELL_THRESHOLD_UNDEFINED). changelog_json = historico mantido (requisito 4, verificacao 3). */
    Dataset: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      dataset_key: string;
      name: string;
      description?: string | null;
      /**
       * @default 'P3'
       * @enum {string}
       */
      classification: 'P1' | 'P2' | 'P3';
      /** @default false */
      req_open_format: boolean;
      /** @default false */
      req_machine_readable: boolean;
      /** @default false */
      req_data_dictionary: boolean;
      /** @default false */
      req_periodic_update_history: boolean;
      /** @default false */
      req_authenticity_integrity: boolean;
      /** @default false */
      req_searchable: boolean;
      /** @default false */
      req_accessible: boolean;
      license?: string | null;
      periodicity?: string | null;
      quality_note?: string | null;
      /** @default '[]'::jsonb */
      changelog_json: {
        [key: string]: unknown;
      };
      /** @default false */
      suppression_applied: boolean;
      /** Format: uuid */
      promoted_by?: string | null;
      /** Format: date-time */
      promoted_at?: string | null;
      promotion_basis?: string | null;
      /** Format: date-time */
      published_at?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDatasetDto: {
      dataset_key: string;
      name: string;
      description?: string | null;
      /**
       * @default 'P3'
       * @enum {string}
       */
      classification: 'P1' | 'P2' | 'P3';
      /** @default false */
      req_open_format: boolean;
      /** @default false */
      req_machine_readable: boolean;
      /** @default false */
      req_data_dictionary: boolean;
      /** @default false */
      req_periodic_update_history: boolean;
      /** @default false */
      req_authenticity_integrity: boolean;
      /** @default false */
      req_searchable: boolean;
      /** @default false */
      req_accessible: boolean;
      license?: string | null;
      periodicity?: string | null;
      quality_note?: string | null;
      /** @default '[]'::jsonb */
      changelog_json: {
        [key: string]: unknown;
      };
      /** @default false */
      suppression_applied: boolean;
      /** Format: uuid */
      promoted_by?: string | null;
      /** Format: date-time */
      promoted_at?: string | null;
      promotion_basis?: string | null;
      /** Format: date-time */
      published_at?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Ledger idempotente unico das oito projecoes deste pacote (ADR-0020 Decisao 1; plan R-0011 M4/M5; padrao de dashboard.crash_projection_applied_event de BP-DASHBOARD-CRASHES-001). A chave (tenant_id, projection_name, event_id) permite replay integral ou incremental sem aceitar o mesmo evento duas vezes; a insercao do ledger e o efeito na tabela de projecao compartilham a mesma transacao sob RLS (CTG-0001 secao 4.3). projection_name in os oito nomes dashboard.<projecao>; event_type = type tecnico ou domainEvent consumido; occurred_at do envelope permite medir o atraso de consumo (IND-DASH-401, CTG-0002). */
    MonitorProjectionAppliedEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      projection_name:
        | 'dashboard.prescription_risk'
        | 'dashboard.production'
        | 'dashboard.integration_health'
        | 'dashboard.pec_deadlines'
        | 'dashboard.teat_measures'
        | 'dashboard.portal_service_metrics'
        | 'dashboard.duty_evidence'
        | 'dashboard.source_freshness';
      /** Format: uuid */
      event_id: string;
      event_type: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      occurred_at: string;
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
    CreateMonitorProjectionAppliedEventDto: {
      /** @enum {string} */
      projection_name:
        | 'dashboard.prescription_risk'
        | 'dashboard.production'
        | 'dashboard.integration_health'
        | 'dashboard.pec_deadlines'
        | 'dashboard.teat_measures'
        | 'dashboard.portal_service_metrics'
        | 'dashboard.duty_evidence'
        | 'dashboard.source_freshness';
      /** Format: uuid */
      event_id: string;
      event_type: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      occurred_at: string;
      /**
       * Format: date-time
       * @default now()
       */
      applied_at: string;
    };
    /** @description Projecao dashboard.prescription_risk (ADR-0020 Decisao 2; dashboard-route-contract secao 6; RN-DASH-131; IND-DASH-101..105): uma celula por (case_id, clock_code) - o processo do RAIT e opaco (uuid, camada N2, RN-DASH-170), nunca numero de processo. flag = toFlag de rait.clock.flag-changed (token do RAIT, sem check), days_remaining e ceiling_on gravados do evento, nunca calculados (RN-DASH-131 verificacao 4); instance/case_state/received_on de rait.case.changed e rait.case.received; timer_code/ceiling_effect/extinct_state de inf.timer.expired e inf.infraction.changed (teto atingido, EXTINTO_*); pool_id de rait.assignment.changed. indicator_code derivado de clock_code + instance (CTG-0001 secao 4.1). Idempotente por event.id via monitor_projection_applied_event; event_schema_version e aggregate_version guardadas por linha. */
    PrescriptionRisk: {
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
      clock_code: 'A' | 'B' | 'C' | 'D';
      indicator_code: string;
      /** Format: uuid */
      clock_id?: string | null;
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | null;
      flag?: string | null;
      days_remaining?: number | null;
      /** Format: date */
      ceiling_on?: string | null;
      /** Format: date */
      received_on?: string | null;
      case_state?: string | null;
      /** Format: uuid */
      pool_id?: string | null;
      timer_code?: string | null;
      ceiling_effect?: string | null;
      /** Format: date */
      ceiling_reached_on?: string | null;
      extinct_state?: string | null;
      /** Format: date-time */
      flag_changed_at?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePrescriptionRiskDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      clock_code: 'A' | 'B' | 'C' | 'D';
      indicator_code: string;
      /** Format: uuid */
      clock_id?: string | null;
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | null;
      flag?: string | null;
      days_remaining?: number | null;
      /** Format: date */
      ceiling_on?: string | null;
      /** Format: date */
      received_on?: string | null;
      case_state?: string | null;
      /** Format: uuid */
      pool_id?: string | null;
      timer_code?: string | null;
      ceiling_effect?: string | null;
      /** Format: date */
      ceiling_reached_on?: string | null;
      extinct_state?: string | null;
      /** Format: date-time */
      flag_changed_at?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.production (ADR-0020 Decisao 2: tempo por fase, SLA-30, taxa de provimento; dashboard-route-contract secao 6; IND-DASH-304/305): uma celula por caso do RAIT (case_id opaco, N2): instance, current_state/from_state/state_changed_at de rait.case.changed, received_on de rait.case.received, decision_kind/decided_on/decision_published_on de rait.decision.published (sem produtor em main) e rait.minutes.published (RAIT_DECISAO_PUBLICADA por item), session_id/agenda_outcome de rait.session.changed e rait.agenda-item.changed, period_start = mes de state_changed_at para agregacao N0. Nenhum enquadramento (nao publicado) - taxa de provimento por instancia e decision_kind. Idempotente por event.id via monitor_projection_applied_event. */
    Production: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | 'defesa' | null;
      /** Format: date */
      period_start: string;
      from_state?: string | null;
      current_state: string;
      /** Format: date-time */
      state_changed_at: string;
      /** Format: date */
      received_on?: string | null;
      decision_kind?: string | null;
      /** Format: date */
      decided_on?: string | null;
      /** Format: date */
      decision_published_on?: string | null;
      /** Format: uuid */
      session_id?: string | null;
      agenda_outcome?: string | null;
      /** @default 0 */
      transitions: number;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProductionDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string|null} */
      instance?: 'jari' | 'cetran' | 'defesa' | null;
      /** Format: date */
      period_start: string;
      from_state?: string | null;
      current_state: string;
      /** Format: date-time */
      state_changed_at: string;
      /** Format: date */
      received_on?: string | null;
      decision_kind?: string | null;
      /** Format: date */
      decided_on?: string | null;
      /** Format: date */
      decision_published_on?: string | null;
      /** Format: uuid */
      session_id?: string | null;
      agenda_outcome?: string | null;
      /** @default 0 */
      transitions: number;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.integration_health (ADR-0020 Decisao 2: filas, falhas, recibos por sistema; dashboard-route-contract secao 6; IND-DASH-401..403): uma celula por (period_start dia, system_key, metric) com metric_value e sample_count; hoje alimentada so pelos recibos da sincronizacao offline do TEAT (sync.batch.received: receiptStatus, errorCode) - status da outbox, UPSTREAM_* e telemetria do adapter nao sao eventos publicados (CTG-0001 secao 4.1/4.2, connected = false; OD-D04 fixa so os limiares). Idempotente por event.id via monitor_projection_applied_event. */
    IntegrationHealth: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: date */
      period_start: string;
      system_key: string;
      metric: string;
      /** @default 0 */
      metric_value: number;
      /** @default 0 */
      sample_count: number;
      last_error_code?: string | null;
      /** Format: date-time */
      last_seen_at?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateIntegrationHealthDto: {
      /** Format: date */
      period_start: string;
      system_key: string;
      metric: string;
      /** @default 0 */
      metric_value: number;
      /** @default 0 */
      sample_count: number;
      last_error_code?: string | null;
      /** Format: date-time */
      last_seen_at?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.pec_deadlines (dashboard-route-contract secao 6, nova; IND-DASH-106/107/306..309; RN-PEC-112 via APP-DASHBOARD secao Catalogo): o PEC nao publica eventos - a projecao nasce com consumedEvents do contrato de dado proposto em WP-D3 (dashboard-build-pack secao WP-D3: {indicador_id, caso_id, estado_anterior, estado_novo, timestamp, base_legal}; type proposto pec.deadline.changed) e connected = false (plan M5). Uma celula por (case_id opaco, indicator_code); from_state/to_state sao tokens do PEC (sem check), legal_basis verbatim do feed; due_on so quando o feed a carregar (CTG-0001 secao 8). Idempotente por event.id via monitor_projection_applied_event. */
    PecDeadlines: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      indicator_code: string;
      from_state?: string | null;
      to_state: string;
      /** Format: date-time */
      changed_at: string;
      /** Format: date */
      due_on?: string | null;
      legal_basis?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePecDeadlinesDto: {
      /** Format: uuid */
      case_id: string;
      indicator_code: string;
      from_state?: string | null;
      to_state: string;
      /** Format: date-time */
      changed_at: string;
      /** Format: date */
      due_on?: string | null;
      legal_basis?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.teat_measures (dashboard-route-contract secao 6, nova; IND-DASH-108..111, 311..314, 404..407; teat-route-contract secao 8; schemas/events do TEAT): uma celula por (indicator_code, object_kind, object_ref) onde object_kind = aggregate.kind do evento (administrative-measure, alcohol-procedure, ait, evidence, normative-package, operational-device) e object_ref = aggregate.id opaco (N2; nunca placa, AIT ou dado de saude - RN-DASH-170). state = toState/currentStatus/eventType do evento (tokens do TEAT, sem check), started_at/ended_at/deadline_at gravados dos campos do evento (TERMO_EMITIDO withdrawalDeadlineAt/ctbDeadlineAt, package.published validUntil), integrity_ok para IND-DASH-404 (custody.event eventType), detail_json com os demais campos primitivos do data. Idempotente por event.id via monitor_projection_applied_event. */
    TeatMeasures: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      indicator_code: string;
      /** @enum {string} */
      object_kind:
        | 'administrative-measure'
        | 'alcohol-procedure'
        | 'ait'
        | 'evidence'
        | 'normative-package'
        | 'operational-device'
        | 'numbering-reservation';
      object_ref: string;
      state?: string | null;
      /** Format: date-time */
      started_at?: string | null;
      /** Format: date-time */
      ended_at?: string | null;
      /** Format: date-time */
      deadline_at?: string | null;
      integrity_ok?: boolean | null;
      /** @default '{}'::jsonb */
      detail_json: {
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
    CreateTeatMeasuresDto: {
      indicator_code: string;
      /** @enum {string} */
      object_kind:
        | 'administrative-measure'
        | 'alcohol-procedure'
        | 'ait'
        | 'evidence'
        | 'normative-package'
        | 'operational-device'
        | 'numbering-reservation';
      object_ref: string;
      state?: string | null;
      /** Format: date-time */
      started_at?: string | null;
      /** Format: date-time */
      ended_at?: string | null;
      /** Format: date-time */
      deadline_at?: string | null;
      integrity_ok?: boolean | null;
      /** @default '{}'::jsonb */
      detail_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.portal_service_metrics (dashboard-route-contract secao 6, nova; IND-DASH-206..209, 301..303; portal-route-contract secao 10): uma celula por (indicator_code, object_kind, object_ref) com object_kind in {request, manifestation, evaluation} e object_ref = aggregate.id opaco (N2; nunca CPF ou nome - RN-DASH-170): service_key, state, opened_at/closed_at, due_on e extended vindos do evento quando publicados (campos de data do Portal source_pending, CTG-0001 secao 4.1), score para avaliacoes (AVALIACAO_REGISTRADA), period_start = mes de opened_at para agregacao N0. Idempotente por event.id via monitor_projection_applied_event. */
    PortalServiceMetrics: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      indicator_code: string;
      /** @enum {string} */
      object_kind: 'request' | 'manifestation' | 'evaluation';
      object_ref: string;
      service_key?: string | null;
      state?: string | null;
      /** Format: date */
      period_start: string;
      /** Format: date-time */
      opened_at: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date */
      due_on?: string | null;
      /** @default false */
      extended: boolean;
      score?: number | null;
      /** @default '{}'::jsonb */
      detail_json: {
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
    CreatePortalServiceMetricsDto: {
      indicator_code: string;
      /** @enum {string} */
      object_kind: 'request' | 'manifestation' | 'evaluation';
      object_ref: string;
      service_key?: string | null;
      state?: string | null;
      /** Format: date */
      period_start: string;
      /** Format: date-time */
      opened_at: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** Format: date */
      due_on?: string | null;
      /** @default false */
      extended: boolean;
      score?: number | null;
      /** @default '{}'::jsonb */
      detail_json: {
        [key: string]: unknown;
      };
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Projecao dashboard.duty_evidence (dashboard-route-contract secao 6, nova; IND-DASH-201..209; WF-DASH-002): historico agregavel (N0) dos ciclos de dever alimentado pelos eventos proprios do DASHBOARD (DEVER_JANELA_ABERTA, DEVER_ATRASADO, DEVER_COMPROVADO - type proposto dashboard.duty.changed, publicado so a partir do CTG-0002, connected = false no CTG-0001) e por eventos de publicacao quando existirem. Uma celula por (duty_code, period): state, deadline_on, proved_at, late = comprovado depois da data-limite, evidence_hash (nunca a captura). Idempotente por event.id via monitor_projection_applied_event. */
    DutyEvidence: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      duty_code: string;
      period: string;
      indicator_code?: string | null;
      /** @enum {string} */
      state:
        | 'JANELA_ABERTA'
        | 'EM_APURACAO'
        | 'PREPARADO'
        | 'SUBMETIDO_PUBLICADO'
        | 'COMPROVADO'
        | 'ARQUIVADO'
        | 'ATRASADO'
        | 'NAO_CUMPRIDO';
      /** Format: date */
      deadline_on?: string | null;
      /** Format: date-time */
      opened_at?: string | null;
      /** Format: date-time */
      proved_at?: string | null;
      /** @default false */
      late: boolean;
      evidence_hash?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateDutyEvidenceDto: {
      duty_code: string;
      period: string;
      indicator_code?: string | null;
      /** @enum {string} */
      state:
        | 'JANELA_ABERTA'
        | 'EM_APURACAO'
        | 'PREPARADO'
        | 'SUBMETIDO_PUBLICADO'
        | 'COMPROVADO'
        | 'ARQUIVADO'
        | 'ATRASADO'
        | 'NAO_CUMPRIDO';
      /** Format: date */
      deadline_on?: string | null;
      /** Format: date-time */
      opened_at?: string | null;
      /** Format: date-time */
      proved_at?: string | null;
      /** @default false */
      late: boolean;
      evidence_hash?: string | null;
      /** Format: uuid */
      last_event_id: string;
      event_schema_version: number;
      aggregate_version: number;
    };
    /** @description Timer armado pelo relogio proprio do DASHBOARD (plan R-0011 M15, via M7/A3 da Emenda 2 de AUTHORIZATION.md; contrato work/rounds/R-0011/contracts/CTG-0002.md secao 2.1 e secao 13). code e um codigo de dashboard.timer_ref (19-dashboard-lifecycle-vocabulary.sql, M7/A7; o check repete o mesmo conjunto de 14 codigos); owner_kind in {alert, duty_cycle, source} com owner_id = id da linha dona; started_at = marco de contagem; due_at = vencimento calculado pelo DashboardClockService com Calendar/Clock de @detran/inf-deadlines em leitura (horas_uteis pelo calendario; imediato -> due_at = started_at; nulo enquanto o marco nao e calculavel, ex. T-DASH-MARCO-* sem ceiling_on); status in {ARMADO, VENCIDO, SATISFEITO, CANCELADO}; fired_at = instante em que o sweeper venceu o timer (DashboardClockSweeper.runDue(now)). Unico em (tenant_id, owner_kind, owner_id, code, started_at): idempotencia do sweeper e do arm (M15). Integracao ao motor de prazos com owner = dashboard fica para depois de R-0007 CTG-0003 (OD-D28). Nenhum dado pessoal (RN-DASH-170 N3). */
    Timer: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      owner_kind: 'alert' | 'duty_cycle' | 'source';
      /** Format: uuid */
      owner_id: string;
      /** @enum {string} */
      code:
        | 'T-DASH-ACK-N1'
        | 'T-DASH-ACK-N2'
        | 'T-DASH-ACK-N3'
        | 'T-DASH-ACK-CRITICO'
        | 'T-DASH-MARCO-50'
        | 'T-DASH-MARCO-75'
        | 'T-DASH-MARCO-90'
        | 'T-DASH-DUTY-201'
        | 'T-DASH-DUTY-202'
        | 'T-DASH-DUTY-PNATRANS'
        | 'T-DASH-DUTY-206'
        | 'T-DASH-DUTY-207'
        | 'T-DASH-DUTY-209'
        | 'T-DASH-PENDING-FLOOR';
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      due_at?: string | null;
      /**
       * @default 'ARMADO'
       * @enum {string}
       */
      status: 'ARMADO' | 'VENCIDO' | 'SATISFEITO' | 'CANCELADO';
      /** Format: date-time */
      fired_at?: string | null;
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: date-time */
      cancelled_at?: string | null;
      reason?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateTimerDto: {
      /** @enum {string} */
      owner_kind: 'alert' | 'duty_cycle' | 'source';
      /** Format: uuid */
      owner_id: string;
      /** @enum {string} */
      code:
        | 'T-DASH-ACK-N1'
        | 'T-DASH-ACK-N2'
        | 'T-DASH-ACK-N3'
        | 'T-DASH-ACK-CRITICO'
        | 'T-DASH-MARCO-50'
        | 'T-DASH-MARCO-75'
        | 'T-DASH-MARCO-90'
        | 'T-DASH-DUTY-201'
        | 'T-DASH-DUTY-202'
        | 'T-DASH-DUTY-PNATRANS'
        | 'T-DASH-DUTY-206'
        | 'T-DASH-DUTY-207'
        | 'T-DASH-DUTY-209'
        | 'T-DASH-PENDING-FLOOR';
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      due_at?: string | null;
      /**
       * @default 'ARMADO'
       * @enum {string}
       */
      status: 'ARMADO' | 'VENCIDO' | 'SATISFEITO' | 'CANCELADO';
      /** Format: date-time */
      fired_at?: string | null;
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: date-time */
      cancelled_at?: string | null;
      reason?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Trilha de acesso do proprio DASHBOARD (RN-DASH-171 tabela "Conteudo minimo de cada registro de acesso"; RN-DASH-170 camadas; RN-DASH-172 regra 2 registro reforcado da exportacao; dashboard-route-contract secao 1 regra 4 e GET audit-trail; plan R-0011 M16/M17; contrato CTG-0002 secao 2.2 e secao 5). Append-only: log imutavel e segregado (RN-DASH-171 verificacao 1). Mapeamento dos sete campos: quem = user_ref + user_role (papel efetivo no momento do acesso); quando = at (timestamptz, fonte confiavel = Clock injetado); o que = resource (rota/painel/indicador) + filters_json (filtros e recortes aplicados); granularidade = layer in {N0, N1, N2} (camada efetivamente servida; N3 nunca e servida, RN-DASH-170); volume = row_count; origem = origin (dispositivo/rede, quando disponivel); finalidade = purpose (obrigatoria quando layer = N2, catalogo dashboard.purposes_n2; DASH.PURPOSE_REQUIRED / DASH.PURPOSE_INVALID). export_id liga o acesso ao export_log quando o acesso e uma exportacao. Nunca conteudo de resposta, nunca dado pessoal, placa, numero de processo ou atributo de saude (RN-DASH-170 N3). O acesso a propria trilha (GET audit-trail) tambem e registrado (RN-DASH-171 verificacao 2). */
    AccessLog: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      user_ref: string;
      user_role: string;
      /**
       * Format: date-time
       * @default now()
       */
      at: string;
      resource: string;
      /** @default '{}'::jsonb */
      filters_json: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      /** @default 0 */
      row_count: number;
      origin?: string | null;
      purpose?: string | null;
      /** Format: uuid */
      export_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAccessLogDto: {
      /** Format: uuid */
      user_ref: string;
      user_role: string;
      /**
       * Format: date-time
       * @default now()
       */
      at: string;
      resource: string;
      /** @default '{}'::jsonb */
      filters_json: {
        [key: string]: unknown;
      };
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      /** @default 0 */
      row_count: number;
      origin?: string | null;
      purpose?: string | null;
      /** Format: uuid */
      export_id?: string | null;
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
