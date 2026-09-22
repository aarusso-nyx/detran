// Generated from docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/dashboard/alerts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista alertas do ciclo (CTG-0002 Sec.3.1). */
    get: operations['dashboardAlertList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Anatomia minima + ciclo + trilha de um alerta (CTG-0002 Sec.3.1, Sec.6.6). */
    get: operations['dashboardAlertGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}/incident': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Apuracao de incidente, espelho de [WF-RAIT-002] Sec.4.1 (CTG-0002 Sec.3.1, Sec.6.7). */
    get: operations['dashboardAlertIncidentGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}/ack': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reconhece o alerta (NOTIFICADO -> RECONHECIDO; CTG-0002 Sec.3.1, Sec.6.1). */
    post: operations['dashboardAlertAck'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}/treating': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Inicia tratamento (RECONHECIDO -> EM_TRATAMENTO, com verifyFromCell; CTG-0002 Sec.3.1, Sec.6.5). */
    post: operations['dashboardAlertTreat'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}/close': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Encerra o alerta (VERIFICADO -> ENCERRADO, so trilha de irregularidade; CTG-0002 Sec.3.1). */
    post: operations['dashboardAlertClose'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/alerts/{id}/root-cause': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Anota causa-raiz (nao muda estado; CTG-0002 Sec.3.1). */
    post: operations['dashboardAlertAnnotate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** As linhas de dashboard.duty com ciclo corrente (CTG-0002 Sec.3.2). */
    get: operations['dashboardDutyList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Historico de ciclos de um dever, ordenado por period desc (CTG-0002 Sec.3.2). */
    get: operations['dashboardDutyCycleList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Ciclo + evidencia + deadlineOn (CTG-0002 Sec.3.2). */
    get: operations['dashboardDutyCycleGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}/start': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Inicia apuracao (JANELA_ABERTA -> EM_APURACAO; CTG-0002 Sec.3.2). */
    post: operations['dashboardDutyCycleStart'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}/prepare': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Prepara publicacao (EM_APURACAO -> PREPARADO; CTG-0002 Sec.3.2). */
    post: operations['dashboardDutyCyclePrepare'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}/submit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Submete/publica (PREPARADO|ATRASADO -> SUBMETIDO_PUBLICADO; CTG-0002 Sec.3.2). */
    post: operations['dashboardDutyCycleSubmit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}/prove': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra comprovacao (SUBMETIDO_PUBLICADO -> COMPROVADO; CTG-0002 Sec.3.2). */
    post: operations['dashboardDutyCycleProve'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/duties/{id}/cycles/{period}/archive': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Arquiva o ciclo (COMPROVADO -> ARQUIVADO; CTG-0002 Sec.3.2). */
    post: operations['dashboardDutyCycleArchive'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/indicators': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 42 indicadores, sem valores (CTG-0002 Sec.3.3, Sec.10.1). */
    get: operations['dashboardIndicatorList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/indicators/{code}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Indicador + value + alerts abertos + meta.freshness da fonte (CTG-0002 Sec.3.3, Sec.10.1). */
    get: operations['dashboardIndicatorGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/indicator-configs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista configuracoes de indicador (CTG-0002 Sec.3.3). */
    get: operations['dashboardIndicatorConfigList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/indicator-configs/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Detalhe (ETag; CTG-0002 Sec.3.3). */
    get: operations['dashboardIndicatorConfigGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Rascunho de configuracao; publicado volta a draft (CTG-0002 Sec.3.3). */
    patch: operations['dashboardIndicatorConfigUpdate'];
    trace?: never;
  };
  '/v1/dashboard/indicator-configs/{id}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Publica configuracao (draft -> published; CTG-0002 Sec.3.3). */
    post: operations['dashboardIndicatorConfigPublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/bi-panels': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Paineis cuja visibility_profile <= camada do papel (CTG-0002 Sec.3.3). */
    get: operations['dashboardBiPanelList'];
    put?: never;
    /** Cria painel em draft (CTG-0002 Sec.3.3). */
    post: operations['dashboardBiPanelCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/bi-panels/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Detalhe de painel (ETag; CTG-0002 Sec.3.3). */
    get: operations['dashboardBiPanelGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Atualiza painel; publicado volta a draft (CTG-0002 Sec.3.3). */
    patch: operations['dashboardBiPanelUpdate'];
    trace?: never;
  };
  '/v1/dashboard/bi-panels/{id}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Publica painel (draft -> published; CTG-0002 Sec.3.3). */
    post: operations['dashboardBiPanelPublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/generated-reports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista relatorios gerados (nunca file_uri para papel abaixo da camada; CTG-0002 Sec.3.3). */
    get: operations['dashboardReportList'];
    put?: never;
    /** Solicita relatorio (processing; CTG-0002 Sec.3.3, Sec.10.7). */
    post: operations['dashboardReportRequest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/generated-reports/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Detalhe de relatorio (ETag; CTG-0002 Sec.3.3). */
    get: operations['dashboardReportGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/generated-reports/{id}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Conclui relatorio (processing -> completed; CTG-0002 Sec.3.3). */
    post: operations['dashboardReportComplete'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/generated-reports/{id}/fail': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Marca falha do relatorio (processing -> failed; CTG-0002 Sec.3.3). */
    post: operations['dashboardReportFail'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/sources': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Selo de frescor por fonte (CTG-0002 Sec.3.4, Sec.8). */
    get: operations['dashboardSourceList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/sources/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Selo + timers abertos da fonte (CTG-0002 Sec.3.4). */
    get: operations['dashboardSourceGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/exports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra exportacao com marca d'agua e supressao (CTG-0002 Sec.3.5, Sec.9). */
    post: operations['dashboardExportCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/exports/{id}/approve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Aprova exportacao volumosa (pending-approval -> approved; CTG-0002 Sec.3.5). */
    post: operations['dashboardExportApprove'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/audit-trail': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** access_log U alert_trail, sem conteudo sensivel; o proprio acesso e logado (CTG-0002 Sec.3.6). */
    get: operations['dashboardAuditTrailList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/comparisons': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Agregados por dimensao com supressao primaria e secundaria (CTG-0002 Sec.3.6, Sec.9.5). */
    get: operations['dashboardComparisonList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/transparency/checklist': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Checklist [RN-DASH-151] (sete requisitos x datasets P1/P2) + ultima auditoria do periodo (CTG-0002 Sec.3.6). */
    get: operations['dashboardTransparencyChecklistGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/transparency/audits': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registra auditoria de transparencia mensal (CTG-0002 Sec.3.6). */
    post: operations['dashboardTransparencyAuditCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/kpis': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Cobertura, MTTA, MTTR, pct deveres no prazo, frescor medio (CTG-0002 Sec.3.6, Sec.10.5). */
    get: operations['dashboardKpiGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/datasets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Metadados dos datasets abertos (CTG-0002 Sec.3.7, Sec.10.6). */
    get: operations['dashboardDatasetList'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/open-data/{dataset}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Conjunto pre-agregado publicado, sem query string (CTG-0002 Sec.3.7, Sec.10.6). */
    get: operations['dashboardOpenDataGet'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/dashboard/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** SSE de alert.changed, alert.escalated, duty.changed, source.freshness, integration.health; 429 sem envelope DetranError quando o limite de 5 conexoes simultaneas por usuario e excedido (corpo manual {status,message}, dashboard-stream.controller.ts -- nao documentado como resposta 4xx aqui por nao carregar 'code' do catalogo, CTG-0002 Sec.3.8, Sec.11). */
    get: operations['dashboardStreamGet'];
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
    FreshnessMeta: {
      /** @enum {string} */
      state: 'FRESCO' | 'ATRASADO' | 'INDISPONIVEL' | 'DESATUALIZADO_MARCADO';
      /** Format: date-time */
      asOf: string | null;
      acceptableLatency: number | null;
      /** @description source_key da pior fonte, ou 'dashboard' (estado proprio, Sec.5.5). */
      source: string;
    };
    AckAlertDto: {
      /** @enum {string} */
      channel: 'origin' | 'manual';
      note?: string;
      /** Format: uuid */
      onBehalfOf?: string;
    };
    TreatAlertDto: {
      originRef?: string;
    };
    CloseAlertDto: {
      note?: string;
    };
    RootCauseDto: {
      /** @description transport|acceptance|payload (Sec.3.1); fora do conjunto -> 400 DASH.ROOT_CAUSE_CATEGORY_INVALID, checado pelo servico antes do zod. */
      category: string;
      description?: string;
      /** @description sinonimo aceito de description (route contract Sec.3.1). */
      note?: string;
    };
    /** @description Corpo vazio (z.object({}).strict() no controller). */
    DutyCycleStartDto: Record<string, never>;
    PrepareDutyDto: {
      draftRef?: string;
      /** @description x-source-pending (A21): unico caminho de comando que tenta fixar data-limite; deveres sem prazo legal recusam com DASH.DUTY_NO_LEGAL_DEADLINE. */
      deadlineOn?: string;
    };
    SubmitDutyDto: {
      /** Format: date-time */
      submittedAt?: string;
      protocol?: string;
    };
    ProveDutyDto: {
      evidence?: {
        protocol?: string;
        captureUri?: string;
        /** @description ausente -> 422 DASH.DUTY_EVIDENCE_REQUIRED; malformado (!= ^[0-9a-f]{64}$) -> 422 DASH.DUTY_EVIDENCE_HASH_INVALID (checado pelo servico antes do zod). */
        hash?: string;
      };
    };
    ArchiveDutyDto: {
      note?: string;
    };
    Threshold: {
      /** @enum {string} */
      kind: 'target' | 'ceiling';
      metric: string;
      /** @enum {string} */
      direction: 'above' | 'below';
      levels: {
        n1?: number;
        n2?: number;
        n3?: number;
        critical?: number;
      };
    };
    /** @description Ao menos um campo (zod .refine); vazio -> 400 DASH.VALIDATION_FAILED. */
    PatchIndicatorConfigDto: {
      name?: string;
      description?: string;
      formula?: string;
      granularity?: string;
      thresholdJson?: components['schemas']['Threshold'] | null;
      acceptableLatencyMinutes?: number | null;
    };
    BiPanelDto: {
      name: string;
      description?: string;
      /**
       * @description 'N3' (aqui ou em qualquer chave layer/visibilityProfile de configJson) -> 403 DASH.LAYER_N3_NEVER antes do enum.
       * @enum {string}
       */
      visibilityProfile: 'N0' | 'N1' | 'N2';
      configJson: Record<string, never>;
    };
    /** @description Ao menos um campo (zod .refine). */
    PatchBiPanelDto: {
      name?: string;
      description?: string;
      /** @enum {string} */
      visibilityProfile?: 'N0' | 'N1' | 'N2';
      configJson?: Record<string, never>;
    };
    RequestReportDto: {
      /**
       * @description fora do conjunto -> 400 DASH.REPORT_TYPE_INVALID (fieldRule dedicada, nao ENUM_INVALID generico).
       * @enum {string}
       */
      reportType:
        | 'alerts'
        | 'duties'
        | 'indicators'
        | 'sources'
        | 'comparisons'
        | 'kpis'
        | 'audit-trail';
      filters?: Record<string, never>;
      /**
       * @description 'N3' -> 403 DASH.EXPORT_N3_FORBIDDEN (checado no corpo bruto antes do zod).
       * @enum {string}
       */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string;
    };
    CompleteReportDto: {
      /** Format: uri */
      fileUri: string;
      /** @description != ^[0-9a-f]{64}$ -> 422 DASH.REPORT_FILE_HASH_MISMATCH (checado pelo servico). */
      fileHash: string;
    };
    FailReportDto: {
      failureCode: string;
    };
    CreateExportDto: {
      /** @enum {string} */
      scope:
        | 'alerts'
        | 'duties'
        | 'indicators'
        | 'sources'
        | 'comparisons'
        | 'kpis'
        | 'audit-trail';
      /**
       * @description chaves includeHealth/includeSensitive/includeBiometrics/includeEvidence sao reservadas a N3 (examinadas no corpo bruto) -> 403 DASH.EXPORT_N3_FORBIDDEN.
       * @default {}
       */
      filters: Record<string, never>;
      /** @description validado pela regra 1 de Sec.9.1 (DASH.EXPORT_FORMAT_NOT_OPEN: so csv|json), nao por enum do zod. */
      format: string;
      purpose?: string;
      rows?: number;
    };
    ApproveExportDto: {
      justification: string;
    };
    TransparencyAuditDto: {
      /** @description fora da forma YYYY-MM -> 400 DASH.DUTY_PERIOD_INVALID (fieldRule dedicada). */
      period: string;
      checklist: Record<string, never>;
      result: string;
      notes?: string;
    };
    AlertListItem: {
      /** Format: uuid */
      id: string;
      indicatorCode: string;
      /** @enum {string} */
      track: 'extinction' | 'irregularity';
      state: string;
      severity: string;
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      sourceApp: string;
      object: {
        kind: string;
        /** @description uuid opaco da origem; null fora de N2 ou fora do escopo de dominio (redigido, alertItem em export.service.ts). */
        ref: string | null;
        /** @enum {string} */
        layer: 'N0' | 'N1' | 'N2';
      };
      ownerRole: string;
      /** @description redigido fora de N2/escopo (alertItem). */
      ownerRef?: string | null;
      governingClock?: string | null;
      /** Format: date-time */
      nextMilestoneAt?: string | null;
      /** Format: date */
      ceilingOn?: string | null;
      escalationLevel: number;
      /** @enum {string|null} */
      ackChannel?: 'origin' | 'manual' | null;
      incidentRef?: string | null;
      timestamps: {
        /** Format: date-time */
        detectedAt?: string | null;
        /** Format: date-time */
        classifiedAt?: string | null;
        /** Format: date-time */
        notifiedAt?: string | null;
        /** Format: date-time */
        acknowledgedAt?: string | null;
        /** Format: date-time */
        treatingAt?: string | null;
        /** Format: date-time */
        verifiedAt?: string | null;
        /** Format: date-time */
        closedAt?: string | null;
        /** Format: date-time */
        escalatedAt?: string | null;
        /** Format: date-time */
        criticalAt?: string | null;
        /** Format: date-time */
        incidentAt?: string | null;
      };
      version: number;
    };
    AlertTrailLine: {
      seq: number;
      fromState?: string | null;
      toState: string;
      /** @enum {string} */
      actorKind: 'user' | 'system' | 'timer';
      actorRef?: string | null;
      /** Format: date-time */
      occurredAt: string;
      note?: string | null;
      rootCauseCategory?: string | null;
      eventId?: string | null;
    };
    AlertTimer: {
      code: string;
      /** @enum {string} */
      status: 'ARMADO' | 'VENCIDO' | 'SATISFEITO' | 'CANCELADO';
      /** Format: date-time */
      startedAt: string;
      /** Format: date-time */
      dueAt?: string | null;
      /** Format: date-time */
      firedAt?: string | null;
    };
    /** @description Anatomia minima (CTG-0002 Sec.6.6); nunca nome, placa, no de processo ou atributo de saude. */
    AlertDetail: {
      /** Format: uuid */
      id: string;
      indicatorCode: string;
      /** @enum {string} */
      track: 'extinction' | 'irregularity';
      state: string;
      severity: string;
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      sourceApp: string;
      object: {
        kind: string;
        /** @description uuid opaco da origem; null fora de N2 ou fora do escopo de dominio (redigido, alertItem em export.service.ts). */
        ref: string | null;
        /** @enum {string} */
        layer: 'N0' | 'N1' | 'N2';
      };
      ownerRole: string;
      ownerRef?: string | null;
      governingClock?: string | null;
      /** Format: date-time */
      nextMilestoneAt?: string | null;
      /** Format: date */
      ceilingOn?: string | null;
      escalationLevel: number;
      ackChannel?: string | null;
      incidentRef?: string | null;
      timestamps?: {
        /** Format: date-time */
        detectedAt?: string | null;
        /** Format: date-time */
        classifiedAt?: string | null;
        /** Format: date-time */
        notifiedAt?: string | null;
        /** Format: date-time */
        acknowledgedAt?: string | null;
        /** Format: date-time */
        treatingAt?: string | null;
        /** Format: date-time */
        verifiedAt?: string | null;
        /** Format: date-time */
        closedAt?: string | null;
        /** Format: date-time */
        escalatedAt?: string | null;
        /** Format: date-time */
        criticalAt?: string | null;
        /** Format: date-time */
        incidentAt?: string | null;
      };
      trail: components['schemas']['AlertTrailLine'][];
      timers: components['schemas']['AlertTimer'][];
      version: number;
      meta: {
        freshness: components['schemas']['FreshnessMeta'];
      };
    };
    /** @description GET alerts/{id}/incident (CTG-0002 Sec.6.7); espelho de [WF-RAIT-002] Sec.4.1. */
    AlertIncidentView: {
      /** Format: uuid */
      alertId: string;
      incidentRef: string;
      /** Format: date-time */
      registeredAt: string;
      indicatorCode: string;
      governingClock?: string | null;
      /** Format: date */
      ceilingOn?: string | null;
      /** Format: date */
      ceilingReachedOn?: string | null;
      object: {
        kind: string;
        /** @description uuid opaco da origem; null fora de N2 ou fora do escopo de dominio (redigido, alertItem em export.service.ts). */
        ref: string | null;
        /** @enum {string} */
        layer: 'N0' | 'N1' | 'N2';
      };
      sourceEventId?: string | null;
      notified: {
        level?: number | null;
        role: string;
        /** Format: date-time */
        at: string;
        /** @enum {string} */
        chainStatus: 'vigente' | 'source_pending' | 'h54';
      }[];
      rootCauses: {
        category: string;
        note?: string | null;
        actorRef: string | null;
        /** Format: date-time */
        at: string;
      }[];
      trail: components['schemas']['AlertTrailLine'][];
      meta: {
        freshness: components['schemas']['FreshnessMeta'];
      };
    };
    DutyView: {
      /** Format: uuid */
      id: string;
      code: string;
      lineNo?: number | null;
      title: string;
      sourceRef: string;
      periodicity: string;
      deadlineRule?: string | null;
      deadlineKind: string;
      consequence: string;
      ruleRef: string;
      scope: string;
      ownerRole: string;
      ownerActor?: string | null;
      indicatorCode: string | null;
      mvp: boolean;
    };
    DutyCycleView: {
      /** Format: uuid */
      id: string;
      dutyCode: string;
      period: string;
      state: string;
      /** Format: date */
      deadlineOn?: string | null;
      /** Format: date-time */
      openedAt?: string | null;
      /** Format: date-time */
      startedAt?: string | null;
      /** Format: date-time */
      preparedAt?: string | null;
      /** Format: date-time */
      submittedAt?: string | null;
      /** Format: date-time */
      provedAt?: string | null;
      /** Format: date-time */
      archivedAt?: string | null;
      /** Format: date-time */
      lateAt?: string | null;
      /** Format: date-time */
      unfulfilledAt?: string | null;
      draftRef?: string | null;
      evidence?: {
        protocol?: string | null;
        captureUri?: string | null;
        hash?: string | null;
      };
      version: number;
    };
    IndicatorView: {
      /** Format: uuid */
      id: string;
      code: string;
      /** @enum {string} */
      block: 'A' | 'B' | 'C' | 'D';
      kind: string;
      name: string;
      question?: string | null;
      sourceApp: string;
      sourceRef?: string | null;
      thresholdRule?: string | null;
      ownerActor?: string | null;
      expectedAction?: string | null;
      /** @enum {string|null} */
      classification: 'P1' | 'P2' | 'P3' | null;
      latencyBand?: string | null;
      acceptableLatencyMinutes?: number | null;
      unavailableStrategy?: string | null;
      projection?: string | null;
      connected: boolean;
      /** @enum {string|null} */
      clockCode?: 'A' | 'B' | 'C' | 'D' | null;
    };
    IndicatorDetail: components['schemas']['IndicatorView'] & {
      /** @description celula agregada da projecao (Sec.10.1); null quando desconectado ou oculto (bloco A com fonte INDISPONIVEL/oculta). */
      value: unknown;
      /** @description contagem de alertas abertos por severidade (openAlertsBySeverity, catalog.service.ts) -- chaves nao detalhadas nesta leitura fechada. */
      alerts: Record<string, never>;
      meta: {
        freshness: components['schemas']['FreshnessMeta'];
      };
    };
    IndicatorConfigView: {
      /** Format: uuid */
      id: string;
      indicatorCode: string;
      code: string;
      name: string;
      description?: string | null;
      formula?: string | null;
      granularity?: string | null;
      thresholdJson?: components['schemas']['Threshold'] | null;
      acceptableLatencyMinutes?: number | null;
      /** @enum {string} */
      status: 'draft' | 'published';
      /** Format: date-time */
      publishedAt?: string | null;
      publishedBy?: string | null;
      version: number;
    };
    BiPanelView: {
      /** Format: uuid */
      id: string;
      name: string;
      description?: string | null;
      /** @enum {string} */
      visibilityProfile: 'N0' | 'N1' | 'N2';
      configJson: Record<string, never>;
      /** @enum {string} */
      status: 'draft' | 'published';
      /** Format: date-time */
      publishedAt?: string | null;
      publishedBy?: string | null;
      version: number;
    };
    GeneratedReportView: {
      /** Format: uuid */
      id: string;
      userRef: string;
      reportType: string;
      filters?: Record<string, never>;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      /** Format: date-time */
      requestedAt: string;
      /** Format: date-time */
      completedAt?: string | null;
      /** @enum {string} */
      status: 'processing' | 'completed' | 'failed';
      /** @description null para papel abaixo da camada do relatorio (reportView, mayDownload). */
      fileUri?: string | null;
      fileHash?: string | null;
      watermark?: string | null;
      failureCode?: string | null;
      version: number;
    };
    SourceView: {
      /** Format: uuid */
      id: string;
      sourceKey: string;
      app: string;
      /** @enum {string} */
      state: 'FRESCO' | 'ATRASADO' | 'INDISPONIVEL' | 'DESATUALIZADO_MARCADO';
      /** Format: date-time */
      lastSeenAt?: string | null;
      /** Format: date-time */
      lastReadAt?: string | null;
      acceptableLatencyMinutes?: number | null;
      heartbeatContract?: string | null;
      /** Format: date-time */
      staleSince?: string | null;
      hidden: boolean;
      version: number;
    };
    ExportResponse: {
      /** Format: uuid */
      id: string;
      /** @enum {string} */
      status: 'registered' | 'pending-approval' | 'approved';
      scope: string;
      format: string;
      /** @enum {string} */
      layer: 'N0' | 'N1' | 'N2';
      purpose?: string | null;
      rowCount: number;
      suppressedCells: number;
      watermark?: string | null;
      warnings: {
        /** @enum {string} */
        code?: 'DASH.CELL_SUPPRESSED';
        context?: Record<string, never>;
      }[];
      /** @description arquivo inline com marca d'agua (Sec.9.4); ausente em pending-approval (202). */
      content?: unknown;
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
  dashboardAlertList: {
    parameters: {
      query?: {
        state?: string;
        severity?: string;
        block?: 'A' | 'B' | 'C' | 'D';
        indicator?: string;
        app?: string;
        owner?: string;
        unit?: string;
        pool?: string;
        layer?: 'N1' | 'N2';
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lista ordenada por severidade combinada; camada N1 por padrao, N2 so com layer=N2. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['AlertListItem'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
              /** @constant */
              sourcePending?: 'OD-D38';
            };
          };
        };
      };
      /** @description N2: X-Purpose ausente/invalida; ou valor de enum (block/layer) fora do conjunto. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.PURPOSE_REQUIRED'
              | 'DASH.PURPOSE_INVALID'
              | 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description layer=N2 sem camada suficiente; ou N2 com app fora do dominio do gestor. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_FORBIDDEN' | 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Anatomia minima (Sec.6.6): ciclo, trilha e timers; camera = min(camada do papel, object_layer). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertDetail'];
        };
      };
      /** @description N2: X-Purpose ausente/invalida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.PURPOSE_REQUIRED' | 'DASH.PURPOSE_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Gestor de area consultando N2 de outro dominio (Sec.5.3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertIncidentGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta de Sec.6.7. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertIncidentView'];
        };
      };
      /** @description N2: X-Purpose ausente/invalida. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.PURPOSE_REQUIRED' | 'DASH.PURPOSE_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Gestor de area consultando N2 de outro dominio (Sec.5.3). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Alerta inexistente; ou estado != INCIDENTE_REGISTRADO / apuracao nao encontrada. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH' | 'DASH.ALERT_INCIDENT_NOT_FOUND';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertAck: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.alert.version>"; ausente -> 428 DASH.IF_MATCH_REQUIRED, divergente -> 412 DASH.VERSION_CONFLICT. */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "channel": "origin"
         *     }
         */
        'application/json': components['schemas']['AckAlertDto'];
      };
    };
    responses: {
      /** @description RECONHECIDO; trilha; T-DASH-ACK-* -> SATISFEITO (reason=ack). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertDetail'];
        };
      };
      /** @description onBehalfOf por quem nao e dash-operator; ou channel fora de origin|manual. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED' | 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ator sem alert.owner_role nos papeis, nao e owner_ref, nem dash-operator. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ALERT_ACK_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Alerta fora de NOTIFICADO; ou fonte INDISPONIVEL/DESATUALIZADO_MARCADO. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ALERT_STATE_INVALID' | 'DASH.ALERT_SOURCE_STALE';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description channel=manual sem note. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ALERT_ACK_MANUAL_NOTE_REQUIRED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertTreat: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.alert.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "originRef": "rait-case-fixture"
         *     }
         */
        'application/json': components['schemas']['TreatAlertDto'];
      };
    };
    responses: {
      /** @description EM_TRATAMENTO; verifyFromCell pode avancar a VERIFICADO na mesma transacao. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertDetail'];
        };
      };
      /** @description Corpo/consulta fora da forma esperada (.strict(), campo obrigatorio ausente). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description attemptedAction=treat; ator nao e dono (sem owner_role nos papeis e != owner_ref). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.FORBIDDEN_ACTION';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Alerta fora de RECONHECIDO; ou fonte instavel. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ALERT_STATE_INVALID' | 'DASH.ALERT_SOURCE_STALE';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertClose: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.alert.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "note": "verificado no protocolo de auditoria (fixture)"
         *     }
         */
        'application/json': components['schemas']['CloseAlertDto'];
      };
    };
    responses: {
      /** @description ENCERRADO; timers abertos -> CANCELADO (reason=alert_closed). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertDetail'];
        };
      };
      /** @description Corpo/consulta fora da forma esperada (.strict(), campo obrigatorio ausente). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description track=extinction (checado antes do estado); estado anterior a VERIFICADO; ou estado terminal. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.ALERT_EXTINCTION_NOT_CLOSABLE'
              | 'DASH.ALERT_CLOSE_WITHOUT_VERIFICATION'
              | 'DASH.ALERT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAlertAnnotate: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.alert.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.alert.id
         * @example 00000000-0000-7000-8000-000081000101
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "category": "transport",
         *       "description": "divergencia no protocolo de transporte do lote (fixture)"
         *     }
         */
        'application/json': components['schemas']['RootCauseDto'];
      };
    };
    responses: {
      /** @description Trilha seq+1 com from_state = to_state = state; version+1; estado inalterado. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AlertDetail'];
        };
      };
      /** @description category fora de transport|acceptance|payload (substitui ENUM_INVALID neste campo); ou forma do corpo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ROOT_CAUSE_CATEGORY_INVALID' | 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyList: {
    parameters: {
      query?: {
        scope?: string;
        mvp?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description currentCycle = ciclo de maior period nao terminal (ou nulo); camada N0. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['DutyView'][];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleList: {
    parameters: {
      query?: {
        state?: string;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Historico paginado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['DutyCycleView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period (YYYY-MM, YYYY ou YYYY-MM-DD conforme a periodicidade do dever).
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Ciclo + duty + meta.freshness (estado proprio). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo fora da periodicidade do dever. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleStart: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.duty_cycle.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period.
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /** @example {} */
        'application/json': components['schemas']['DutyCycleStartDto'];
      };
    };
    responses: {
      /** @description EM_APURACAO; started_at; version+1. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo; ou forma do corpo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Quem avanca o ciclo nao e dono do dever (Sec.7.4). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ciclo ARQUIVADO/NAO_CUMPRIDO; ou fora do pre-estado exigido. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_ALREADY_ARCHIVED' | 'DASH.DUTY_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCyclePrepare: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.duty_cycle.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period.
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "draftRef": "DRAFT-DUTY-01-2026-09"
         *     }
         */
        'application/json': components['schemas']['PrepareDutyDto'];
      };
    };
    responses: {
      /** @description PREPARADO; prepared_at; draft_ref. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo; ou forma do corpo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Quem avanca o ciclo nao e dono do dever (Sec.7.4). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ciclo ARQUIVADO/NAO_CUMPRIDO; ou fora do pre-estado exigido. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_ALREADY_ARCHIVED' | 'DASH.DUTY_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Tentativa de fixar deadlineOn em dever sem prazo legal (204/205/208). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NO_LEGAL_DEADLINE';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleSubmit: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.duty_cycle.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period.
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "submittedAt": "2026-09-20T12:00:00-04:00",
         *       "protocol": "PROT-DUTY-01-2026-09"
         *     }
         */
        'application/json': components['schemas']['SubmitDutyDto'];
      };
    };
    responses: {
      /** @description SUBMETIDO_PUBLICADO; submitted_at = submittedAt (<= now, senao 400 DASH.VALIDATION_FAILED); T-DASH-DUTY-* -> SATISFEITO. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo; ou forma do corpo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Quem avanca o ciclo nao e dono do dever (Sec.7.4). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ciclo ARQUIVADO/NAO_CUMPRIDO; ou fora do pre-estado exigido. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_ALREADY_ARCHIVED' | 'DASH.DUTY_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleProve: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.duty_cycle.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period.
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "evidence": {
         *         "protocol": "PROT-DUTY-01-2026-09",
         *         "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85"
         *       }
         *     }
         */
        'application/json': components['schemas']['ProveDutyDto'];
      };
    };
    responses: {
      /** @description COMPROVADO; proved_at; evidence_*; alimenta duty_evidence pelo evento. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Quem avanca o ciclo nao e dono do dever (Sec.7.4). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ciclo ARQUIVADO/NAO_CUMPRIDO; ou fora do pre-estado exigido. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_ALREADY_ARCHIVED' | 'DASH.DUTY_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description hash ausente/vazio (missing:['hash']); ou hash malformado (!= sha256 hex minusculo). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'DASH.DUTY_EVIDENCE_REQUIRED' | 'DASH.DUTY_EVIDENCE_HASH_INVALID';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDutyCycleArchive: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.duty_cycle.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.duty.id
         * @example 00000000-0000-7000-8000-000080001001
         */
        id: string;
        /**
         * @description dashboard.duty_cycle.period.
         * @example 2026-09
         */
        period: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /** @example {} */
        'application/json': components['schemas']['ArchiveDutyDto'];
      };
    };
    responses: {
      /** @description ARQUIVADO; archived_at (trilha actor_kind=user; OD-D19(d)). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DutyCycleView'] & {
            duty: components['schemas']['DutyView'];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Forma do periodo; ou forma do corpo. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Quem avanca o ciclo nao e dono do dever (Sec.7.4). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_NOT_OWNER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Ciclo ARQUIVADO/NAO_CUMPRIDO; ou fora do pre-estado exigido. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_ALREADY_ARCHIVED' | 'DASH.DUTY_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorList: {
    parameters: {
      query?: {
        block?: 'A' | 'B' | 'C' | 'D';
        app?: string;
        connected?: boolean;
        classification?: 'P1' | 'P2' | 'P3';
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description 42 indicadores com bloco, fonte, limiar, dono, classificacao, latencia, connected, projection. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['IndicatorView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Valor de enum fora do conjunto aceito. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description dashboard.indicator.code.
         * @example IND-DASH-101
         */
        code: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description value: null quando fonte do bloco A esta INDISPONIVEL/oculta. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IndicatorDetail'];
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description code fora dos 42 indicadores. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INDICATOR_NOT_IN_CATALOG';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Indicador sem P1/P2/P3 (defensivo). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.CLASSIFICATION_MISSING';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description panel=P-09, decision=DT-029 -- dashboard.crashes ainda bloqueado. */
      423: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.PANEL_BLOCKED_BY_DECISION';
            /** @constant */
            status: 423;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorConfigList: {
    parameters: {
      query?: {
        indicator?: string;
        status?: 'draft' | 'published';
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lista. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['IndicatorConfigView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Valor de enum fora do conjunto aceito. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorConfigGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description dashboard.indicator_config.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Detalhe. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IndicatorConfigView'] & {
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorConfigUpdate: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.indicator_config.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.indicator_config.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "acceptableLatencyMinutes": 30
         *     }
         */
        'application/json': components['schemas']['PatchIndicatorConfigDto'];
      };
    };
    responses: {
      /** @description Rascunho; published_at/by nulos se estava published; version+1. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IndicatorConfigView'];
        };
      };
      /** @description Vazio/forma; ou latencia <= 0 (context.block, range = latency_band; faixa numerica x-source-pending OD-D34). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED' | 'DASH.INDICATOR_LATENCY_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description thresholdJson.kind incompativel com o bloco (Sec.6.3). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INDICATOR_TARGET_AND_CEILING_MIXED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardIndicatorConfigPublish: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.indicator_config.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.indicator_config.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description published; published_at/by; version+1; evento dashboard.indicator-config.changed / IndicatorConfigChanged. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IndicatorConfigView'];
        };
      };
      /** @description currentState:'published' (catalogo sem codigo proprio, OD-D35); ou clock_code fora de A-D (defensivo). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              'DASH.VALIDATION_FAILED' | 'DASH.INDICATOR_CLOCK_CODE_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description code em {401,402,403,406} com threshold_json nulo ou sem levels. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INDICATOR_THRESHOLD_NOT_CALIBRATED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardBiPanelList: {
    parameters: {
      query?: {
        status?: 'draft' | 'published';
        visibilityProfile?: string;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lista. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['BiPanelView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Valor de enum fora do conjunto aceito. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description visibilityProfile=N3 em qualquer chave layer/visibilityProfile da query. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_N3_NEVER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardBiPanelCreate: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "name": "Painel de alertas por bloco (fixture)",
         *       "visibilityProfile": "N1",
         *       "configJson": {}
         *     }
         */
        'application/json': components['schemas']['BiPanelDto'];
      };
    };
    responses: {
      /** @description draft; Location; ETag. */
      201: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          Location?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiPanelView'];
        };
      };
      /** @description visibilityProfile fora de N0|N1|N2; ou name duplicado no tenant. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID' | 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description visibilityProfile:'N3' ou qualquer valor N3 em layer/visibilityProfile de configJson (checado antes do enum). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_N3_NEVER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardBiPanelGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description dashboard.bi_panel.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Detalhe. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiPanelView'] & {
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description visibility_profile do painel acima da camada do papel. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_FORBIDDEN';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardBiPanelUpdate: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.bi_panel.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.bi_panel.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "description": "ajuste de descricao (fixture)"
         *     }
         */
        'application/json': components['schemas']['PatchBiPanelDto'];
      };
    };
    responses: {
      /** @description Como PATCH indicator-configs (publicado volta a draft). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiPanelView'];
        };
      };
      /** @description visibilityProfile fora de N0|N1|N2; ou forma. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID' | 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description N3 em qualquer chave layer/visibilityProfile do corpo. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_N3_NEVER';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardBiPanelPublish: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.bi_panel.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.bi_panel.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description published. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BiPanelView'];
        };
      };
      /** @description currentState:'published' (OD-D35). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardReportList: {
    parameters: {
      query?: {
        status?: 'processing' | 'completed' | 'failed';
        reportType?: string;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lista. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['GeneratedReportView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Valor de enum fora do conjunto aceito. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardReportRequest: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "reportType": "alerts",
         *       "layer": "N1"
         *     }
         */
        'application/json': components['schemas']['RequestReportDto'];
      };
    };
    responses: {
      /** @description processing; watermark reservada (preenchida no complete); ETag. */
      201: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          Location?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GeneratedReportView'];
        };
      };
      /** @description reportType fora do catalogo; N2 sem purpose; finalidade invalida; ou layer fora de N0|N1|N2. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.REPORT_TYPE_INVALID'
              | 'DASH.EXPORT_PURPOSE_REQUIRED'
              | 'DASH.PURPOSE_INVALID'
              | 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description layer > camada do papel; ou layer:'N3' (antes do enum, checado no corpo bruto). */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.EXPORT_LAYER_EXCEEDED' | 'DASH.EXPORT_N3_FORBIDDEN';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardReportGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description dashboard.generated_report.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Detalhe. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GeneratedReportView'] & {
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Camada do relatorio acima da camada do papel. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.LAYER_FORBIDDEN';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardReportComplete: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.generated_report.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.generated_report.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "fileUri": "https://fixtures.detran-am.invalid/reports/alerts-2026-09.csv",
         *       "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85"
         *     }
         */
        'application/json': components['schemas']['CompleteReportDto'];
      };
    };
    responses: {
      /** @description completed; completed_at; file_uri/file_hash; watermark (Sec.9.4); version+1. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GeneratedReportView'];
        };
      };
      /** @description Corpo/consulta fora da forma esperada (.strict(), campo obrigatorio ausente). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description currentState != processing. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.REPORT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description fileHash != ^[0-9a-f]{64}$. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.REPORT_FILE_HASH_MISMATCH';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardReportFail: {
    parameters: {
      query?: never;
      header: {
        /** @description "<dashboard.generated_report.version>". */
        'If-Match': string;
        'Idempotency-Key'?: string;
      };
      path: {
        /** @description dashboard.generated_report.id */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "failureCode": "storage-timeout"
         *     }
         */
        'application/json': components['schemas']['FailReportDto'];
      };
    };
    responses: {
      /** @description failed; failure_code; evento dashboard.report.changed / ReportFailed (token proposto, OD-D33). */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GeneratedReportView'];
        };
      };
      /** @description Corpo/consulta fora da forma esperada (.strict(), campo obrigatorio ausente). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description currentState != processing. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.REPORT_STATE_INVALID';
            /** @constant */
            status: 409;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match divergente da versao atual. */
      412: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VERSION_CONFLICT';
            /** @constant */
            status: 412;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description If-Match ausente ou malformado. */
      428: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.IF_MATCH_REQUIRED';
            /** @constant */
            status: 428;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardSourceList: {
    parameters: {
      query?: {
        app?: string;
        state?: string;
        hidden?: boolean;
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description meta.freshness = a pior das fontes listadas (Sec.5.5). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: components['schemas']['SourceView'][];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description state fora do conjunto. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardSourceGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /**
         * @description dashboard.source.id
         * @example 00000000-0000-7000-8000-000081000401
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description timers com owner_kind='source', status='ARMADO'. */
      200: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SourceView'] & {
            timers: components['schemas']['AlertTimer'][];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardExportCreate: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "scope": "alerts",
         *       "filters": {
         *         "state": "NOTIFICADO"
         *       },
         *       "format": "csv"
         *     }
         */
        'application/json': components['schemas']['CreateExportDto'];
      };
    };
    responses: {
      /** @description registered com content (marca d'agua, Sec.9.4); warnings[] com DASH.CELL_SUPPRESSED quando houve supressao. */
      201: {
        headers: {
          /** @description "<version pos-efeito>". */
          ETag?: string;
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ExportResponse'];
        };
      };
      /** @description rows acima do limite (dashboard.export.approval_rows); export_log fica pending-approval (context: rows, limit, exportId). */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.EXPORT_VOLUME_APPROVAL_REQUIRED';
            /** @constant */
            status: 202;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description format fora de csv|json; N2 sem purpose; finalidade invalida; ou scope fora do conjunto fechado. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.EXPORT_FORMAT_NOT_OPEN'
              | 'DASH.EXPORT_PURPOSE_REQUIRED'
              | 'DASH.PURPOSE_INVALID'
              | 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description recorte so-N3 (chave reservada em filters); requiredLayer do recorte > camada do papel; ou escopo de dominio. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.EXPORT_N3_FORBIDDEN'
              | 'DASH.EXPORT_LAYER_EXCEEDED'
              | 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description dashboard.cell_threshold indefinido (parameterKey). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.CELL_THRESHOLD_UNDEFINED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardExportApprove: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path: {
        /**
         * @description dashboard.export_log.id
         * @example 00000000-0000-7000-8000-000081000501
         */
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "justification": "exportacao de alertas para auditoria trimestral (fixture)"
         *     }
         */
        'application/json': components['schemas']['ApproveExportDto'];
      };
    };
    responses: {
      /** @description approved_by=principal.id, approved_at, justification; content regenerado agora (mesmas regras de Sec.9); export_log sem version: comando sem If-Match (OD-D37). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ExportResponse'];
        };
      };
      /** @description context.currentState != pending-approval (catalogo sem codigo de estado de exportacao, OD-D35). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Recurso inexistente no tenant. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardAuditTrailList: {
    parameters: {
      query?: {
        object?: string;
        indicator?: string;
        app?: string;
        from?: string;
        to?: string;
        kind?: 'access' | 'alert';
        page?: number;
        pageSize?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description N1 por padrao; N2 com object/app. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: Record<string, never>[];
            page: number;
            pageSize: number;
            total: number;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description N2: X-Purpose; ou kind fora de access|alert. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.PURPOSE_REQUIRED'
              | 'DASH.PURPOSE_INVALID'
              | 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description app fora do dominio do gestor. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardComparisonList: {
    parameters: {
      query: {
        dimension: 'pool' | 'circuit' | 'unit' | 'clinic';
        from?: string;
        to?: string;
        orderBy?: 'count' | 'label';
        person?: boolean;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description unit/clinic sem coluna no modelo -> items: [], meta.sourcePending: 'OD-D38'. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: Record<string, never>[];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
              /** @constant */
              sourcePending?: 'OD-D38';
            };
          };
        };
      };
      /** @description dimension/orderBy fora do conjunto. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.ENUM_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description person=true ou ordenacao nominal fora de N2 com finalidade; ou dimensao de outro dominio em N2. */
      403: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code:
              | 'DASH.RANKING_OF_PERSONS_FORBIDDEN'
              | 'DASH.DOMAIN_SCOPE_MISMATCH';
            /** @constant */
            status: 403;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description dashboard.cell_threshold indefinido. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.CELL_THRESHOLD_UNDEFINED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardTransparencyChecklistGet: {
    parameters: {
      query?: {
        period?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Checklist + meta.freshness (estado proprio). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: Record<string, never>[];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
              total?: number;
            };
          };
        };
      };
      /** @description Periodo malformado. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardTransparencyAuditCreate: {
    parameters: {
      query?: never;
      header?: {
        'Idempotency-Key'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "period": "2026-09",
         *       "checklist": {},
         *       "result": "conforme"
         *     }
         */
        'application/json': components['schemas']['TransparencyAuditDto'];
      };
    };
    responses: {
      /** @description audited_by, audited_at; T-DASH-DUTY-209 do periodo -> SATISFEITO. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': Record<string, never>;
        };
      };
      /** @description Periodo fora de YYYY-MM (periodicity:'monthly'); ou periodo ja auditado (context.period; catalogo sem codigo proprio, OD-D35). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DUTY_PERIOD_INVALID' | 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardKpiGet: {
    parameters: {
      query?: {
        from?: string;
        to?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description default: mes corrente no fuso do tenant; definicoes declaradas (OD-D52). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': Record<string, never> & {
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description from/to malformados. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.VALIDATION_FAILED';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description dashboard.cell_threshold indefinido. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.CELL_THRESHOLD_UNDEFINED';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardDatasetList: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description dataset_key, name, classification, sete req_*, license, periodicity, changelog_json, published_at (chaves req_* nao detalhadas nesta leitura fechada). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            items: Record<string, never>[];
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Falha ao gravar dashboard.access_log na mesma transacao da leitura (gate.record). */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.INTERNAL';
            /** @constant */
            status: 500;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardOpenDataGet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description alerts-by-severity-month | duties-compliance-year | sources-availability-month (unicos datasets deste CTG, OD-D53). */
        dataset: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description { dataset, dictionary: [{field,type,description}], generatedAt, watermark, rows, changelog }. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            dataset: string;
            dictionary: {
              field?: string;
              type?: string;
              description?: string;
            }[];
            /** Format: date-time */
            generatedAt: string;
            watermark?: string | null;
            rows: Record<string, never>[];
            changelog?: unknown;
            meta: {
              freshness: components['schemas']['FreshnessMeta'];
            };
          };
        };
      };
      /** @description Qualquer query string (so pre-agregados). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.OPEN_DATA_PARAMETERIZED_FORBIDDEN';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description dataset inexistente ou published_at nulo. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.TENANT_MISMATCH';
            /** @constant */
            status: 404;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description missing[] -- defensivo: publicado sem um req_* (impossivel pelo check). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.DATASET_REQUIREMENTS_UNMET';
            /** @constant */
            status: 422;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
  dashboardStreamGet: {
    parameters: {
      query?: {
        /** @description Lista separada por virgula de tipos tecnicos (filtro do cliente). */
        topics?: string;
      };
      header?: {
        /** @description Retomada; janela de replay 24h (204 alem). */
        'Last-Event-ID'?: string;
        /** @description Finalidade do catalogo dashboard.purposes_n2 (Sec.5.4.1); obrigatoria quando a leitura eh servida em N2. */
        'X-Purpose'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description text/event-stream; ': connected' na abertura, ': heartbeat' a cada 20s, frames por evento; objectRef redigido sem X-Purpose valida em N2. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/event-stream': string;
        };
      };
      /** @description Last-Event-ID alem da janela de replay de 24h. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description X-Purpose invalida no handshake (N2). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.PURPOSE_INVALID';
            /** @constant */
            status: 400;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
      /** @description Sem principal autenticado (DetranPolicyGuard/gate.principalOf). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': {
            /** @enum {string} */
            code: 'DASH.AUTH_REQUIRED';
            /** @constant */
            status: 401;
            message: string;
            messageKey?: string;
            requestId?: string;
            context?: {
              [key: string]: unknown;
            };
          };
        };
      };
    };
  };
}
