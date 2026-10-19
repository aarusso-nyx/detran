// Generated from docs/framework/contracts/BP-INF-RAIT-WORKLIST-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Unidade de julgamento (turma / JARI) — WF-RAIT-004 secao 7 e secao 10. Estados TURMA_* da secao 9; hoje uma unica JARI-AM (steering B.9) e coordenador exigido apenas quando houver mais de uma (Res. 357 itens 2.2-2.3). */
    RaitUnit: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'TURMA_ATIVA'
       * @enum {string}
       */
      state: 'TURMA_ATIVA' | 'TURMA_EM_CONSTITUICAO' | 'TURMA_SUSPENSA';
      /** Format: uuid */
      coordinator_member_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitUnitDto: {
      name: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'TURMA_ATIVA'
       * @enum {string}
       */
      state: 'TURMA_ATIVA' | 'TURMA_EM_CONSTITUICAO' | 'TURMA_SUSPENSA';
      /** Format: uuid */
      coordinator_member_id?: string | null;
    };
    /** @description Pool de trabalho por instancia. Owner fixou os 3 pools base, sem segmentacao adicional (steering A.2). v1.1.0: unit_id liga o pool a uma turma/JARI (WF-RAIT-004 secao 10) e priority_policy registra a ordem unica de consumo das filas (secao 2, RN-RAIT-141). v1.5.1: ADR-0047 supersedes the historical same-unit defense-pool uniqueness: multiple explicitly qualified defense pools require verified exact case routing, never first-pool fallback. Unit-null base pools and non-defense unit/instance uniqueness remain unchanged; no new pool is provisioned. */
    RaitPool: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      name: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /** @enum {string} */
      strategy: 'pull' | 'round_robin' | 'load_balanced';
      /** @default true */
      active: boolean;
      /** Format: uuid */
      unit_id?: string | null;
      /**
       * @default 'ordem_unica'
       * @enum {string}
       */
      priority_policy: 'ordem_unica';
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPoolDto: {
      name: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /** @enum {string} */
      strategy: 'pull' | 'round_robin' | 'load_balanced';
      /** @default true */
      active: boolean;
      /** Format: uuid */
      unit_id?: string | null;
      /**
       * @default 'ordem_unica'
       * @enum {string}
       */
      priority_policy: 'ordem_unica';
    };
    /** @description Membro do pool e sua situacao (WF-RAIT-002 secao 5). Mandato de 1-2 anos na JARI (RN-RAIT-116). v1.1.0: is_substitute marca o suplente (Res. 357 item 4.1.b.3, RN-RAIT-142) e jurisdiction a circunscricao da autoridade signataria (CTB art. 281; relacao das 55 autoridades pendente, steering H.48). v1.4.0 registra bloco de representacao, assento, ato e vigencia institucionais verificaveis para a composicao CETRAN de WF-RAIT-004 secoes 5 e 6. */
    RaitPoolMember: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      person_id: string;
      /** @enum {string} */
      member_role:
        | 'analista'
        | 'relator'
        | 'presidente'
        | 'coordenador'
        | 'secretaria'
        | 'autoridade';
      /**
       * @default 'ATIVO'
       * @enum {string}
       */
      status:
        | 'ATIVO'
        | 'IMPEDIDO'
        | 'ADVERTIDO'
        | 'AFASTADO_TEMP'
        | 'MANDATO_ENCERRADO';
      /** Format: date */
      mandate_starts_on?: string | null;
      /** Format: date */
      mandate_ends_on?: string | null;
      /** @default 0 */
      late_opinion_count: number;
      /** @default 0 */
      unjustified_absence_count: number;
      /** @default false */
      is_substitute: boolean;
      jurisdiction?: string | null;
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @enum {string|null} */
      representation_block?:
        | 'executivo_estadual'
        | 'municipal_rodoviario'
        | 'sociedade_civil'
        | null;
      institutional_seat_ref?: string | null;
      appointment_act_ref?: string | null;
      /** Format: date */
      institutional_valid_from?: string | null;
      /** Format: date */
      institutional_valid_to?: string | null;
      institutional_identity_hash?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPoolMemberDto: {
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      person_id: string;
      /** @enum {string} */
      member_role:
        | 'analista'
        | 'relator'
        | 'presidente'
        | 'coordenador'
        | 'secretaria'
        | 'autoridade';
      /**
       * @default 'ATIVO'
       * @enum {string}
       */
      status:
        | 'ATIVO'
        | 'IMPEDIDO'
        | 'ADVERTIDO'
        | 'AFASTADO_TEMP'
        | 'MANDATO_ENCERRADO';
      /** Format: date */
      mandate_starts_on?: string | null;
      /** Format: date */
      mandate_ends_on?: string | null;
      /** @default 0 */
      late_opinion_count: number;
      /** @default 0 */
      unjustified_absence_count: number;
      /** @default false */
      is_substitute: boolean;
      jurisdiction?: string | null;
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @enum {string|null} */
      representation_block?:
        | 'executivo_estadual'
        | 'municipal_rodoviario'
        | 'sociedade_civil'
        | null;
      institutional_seat_ref?: string | null;
      appointment_act_ref?: string | null;
      /** Format: date */
      institutional_valid_from?: string | null;
      /** Format: date */
      institutional_valid_to?: string | null;
    };
    /** @description Escala e plantao do membro — WF-RAIT-004 secao 3 e secao 10. Disponibilidade DISPONIVEL/EM_PLANTAO/AUSENTE_PROGRAMADO (secao 9); wip_limit nulo usa o parametro rait.wip.limit (ops.parameter, ADR-0021) e ausencia programada rebaixa o limite a zero. */
    RaitSchedule: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      kind:
        | 'escala_semanal'
        | 'plantao_risco'
        | 'escala_assinatura'
        | 'escala_balcao';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      wip_limit?: number | null;
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
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
    CreateRaitScheduleDto: {
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      kind:
        | 'escala_semanal'
        | 'plantao_risco'
        | 'escala_assinatura'
        | 'escala_balcao';
      /** Format: date */
      period_start: string;
      /** Format: date */
      period_end: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      wip_limit?: number | null;
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: uuid */
      published_by?: string | null;
    };
    /** @description Dia coberto pela escala — WF-RAIT-004 secao 3. Disponibilidade efetiva por dia (base de RAIT.SCHEDULE_NO_DUTY_MEMBER, que informa a data); o turno nao tem vocabulario fixado por fonte e fica como OD, por isso o grao e o dia. */
    RaitScheduleSlot: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      schedule_id: string;
      /** Format: date */
      slot_on: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitScheduleSlotDto: {
      /** Format: uuid */
      schedule_id: string;
      /** Format: date */
      slot_on: string;
      /**
       * @default 'DISPONIVEL'
       * @enum {string}
       */
      availability: 'DISPONIVEL' | 'EM_PLANTAO' | 'AUSENTE_PROGRAMADO';
      /** @enum {string|null} */
      absence_reason?: 'ferias' | 'licenca' | 'curso' | 'sessao_externa' | null;
    };
    /** @description Lote de sorteio de relator — WF-RAIT-004 secao 5 e secao 10. Estados LOTE_* da secao 9; semente e ordem auditaveis, ata do sorteio assinada pelo presidente (PAdES+TSA, steering A.8); lote semanal ou extraordinario (passos 1 e 7). */
    RaitBatch: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pool_id: string;
      /**
       * @default 'semanal'
       * @enum {string}
       */
      kind: 'semanal' | 'extraordinario';
      /** Format: date */
      week_start: string;
      /**
       * @default 'LOTE_ABERTO'
       * @enum {string}
       */
      state: 'LOTE_ABERTO' | 'LOTE_SORTEADO' | 'LOTE_ACEITO';
      seed?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: date-time */
      drawn_at?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: uuid */
      minutes_document_id?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
      /** @default 1 */
      version: number;
      approval_signature_ref?: string | null;
      approval_receipt_hash?: string | null;
      /** Format: date-time */
      approval_verified_at?: string | null;
      /** Format: uuid */
      approval_signer_person_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchDto: {
      /** Format: uuid */
      pool_id: string;
      /**
       * @default 'semanal'
       * @enum {string}
       */
      kind: 'semanal' | 'extraordinario';
      /** Format: date */
      week_start: string;
      /**
       * @default 'LOTE_ABERTO'
       * @enum {string}
       */
      state: 'LOTE_ABERTO' | 'LOTE_SORTEADO' | 'LOTE_ACEITO';
      seed?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by?: string | null;
      /** Format: date-time */
      drawn_at?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: uuid */
      minutes_document_id?: string | null;
      /** Format: date-time */
      homologated_at?: string | null;
      /** Format: uuid */
      homologated_by?: string | null;
    };
    /** @description Snapshot canônico e imutável do sorteio por lote, produzido pelo servidor antes da ata (WF-RAIT-004 secao 5; CTG-0002 adendo de confianca). */
    RaitBatchDrawSnapshot: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      batch_id: string;
      snapshot_version: string;
      snapshot: {
        [key: string]: unknown;
      };
      snapshot_hash: string;
      /** @default 'server_draw' */
      origin: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchDrawSnapshotDto: Record<string, never>;
    /** @description Manifestacao imutavel da ata de distribuicao PAdES+TSA, vinculada ao snapshot do sorteio e ao presidente (WF-RAIT-004 secao 5; CTG-0002 adendo de confianca). */
    RaitBatchMinutesManifest: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      document_id: string;
      content_hash: string;
      snapshot_hash: string;
      snapshot_version: string;
      /** @default 'BATCH_DISTRIBUTION_MINUTES' */
      document_kind: string;
      /** Format: uuid */
      expected_signer_person_id: string;
      manifest_hash?: string | null;
      manifest_version?: string | null;
      /** Format: date-time */
      prepared_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchMinutesManifestDto: Record<string, never>;
    /** @description Item do lote de sorteio — WF-RAIT-004 secao 5 passos 4-5. Posicao na ordem sorteada, relator designado, claim_due_on do T-CLAIM (rait.timer.T-CLAIM, 2 dias uteis) e recusa por impedimento ou suspeicao, que redistribui ao proximo da ordem no mesmo lote. */
    RaitBatchItem: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      case_id: string;
      position: number;
      /** Format: uuid */
      member_id?: string | null;
      /** Format: date */
      claim_due_on?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: date-time */
      declined_at?: string | null;
      /** @enum {string|null} */
      decline_kind?: 'impedimento' | 'suspeicao' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBatchItemDto: {
      /** Format: uuid */
      batch_id: string;
      /** Format: uuid */
      case_id: string;
      position: number;
      /** Format: uuid */
      member_id?: string | null;
      /** Format: date */
      claim_due_on?: string | null;
      /** Format: date-time */
      accepted_at?: string | null;
      /** Format: date-time */
      declined_at?: string | null;
      /** @enum {string|null} */
      decline_kind?: 'impedimento' | 'suspeicao' | null;
    };
    /** @description Atribuicao de caso a membro. Reatribuir preserva estado e dossie (AC-RAIT-011-1); motivo e obrigatorio e tipado (AC-RAIT-011-2). v1.1.0: claim_due_at e o vencimento do T-CLAIM e batch_id liga a atribuicao ao lote de sorteio (WF-RAIT-004 secao 5 e secao 10). */
    RaitAssignment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      assigned_at: string;
      /** Format: uuid */
      assigned_by?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitAssignmentDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      pool_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      assigned_at: string;
      /** Format: uuid */
      assigned_by?: string | null;
      /** Format: date-time */
      released_at?: string | null;
      /** @enum {string|null} */
      release_reason?:
        | 'impedimento'
        | 'afastamento'
        | 'rebalanceamento'
        | 'risco_prescricao'
        | 'concluido'
        | null;
      /** @default true */
      active: boolean;
      /** Format: date-time */
      claim_due_at?: string | null;
      /** Format: uuid */
      batch_id?: string | null;
    };
    /** @description Impedimento declarado por caso (RN-RAIT-116; CONTRAN-357 5.1.c). Impede redistribuicao ao mesmo membro (AC-RAIT-011-3). v1.1.0: kind distingue impedimento de suspeicao e legal_basis registra o artigo (Lei 9.784 arts. 18-20), com decided_by de quem decidiu a declaracao (WF-RAIT-004 secao 10). */
    RaitImpediment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      member_id: string;
      basis: string;
      /**
       * Format: date-time
       * @default now()
       */
      declared_at: string;
      /**
       * @default 'impedimento'
       * @enum {string}
       */
      kind: 'impedimento' | 'suspeicao';
      legal_basis?: string | null;
      /** Format: uuid */
      decided_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitImpedimentDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      member_id: string;
      basis: string;
      /**
       * Format: date-time
       * @default now()
       */
      declared_at: string;
      /**
       * @default 'impedimento'
       * @enum {string}
       */
      kind: 'impedimento' | 'suspeicao';
      legal_basis?: string | null;
      /** Format: uuid */
      decided_by?: string | null;
    };
    /** @description Plantao de suplencia por sessao — WF-RAIT-004 secao 3 (linha "Plantao de suplencia") e secao 6 regra (a): o suplente de plantao e convocado antes de qualquer outro quando a banca fica BANCA_INSUFICIENTE (RN-RAIT-142). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35. */
    RaitSubstituteDuty: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      designated_at: string;
      /** Format: uuid */
      designated_by?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitSubstituteDutyDto: {
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      member_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      designated_at: string;
      /** Format: uuid */
      designated_by?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
    };
    /** @description Banca da sessao — WF-RAIT-004 secao 6. Estados BANCA_* da secao 9, contagem de confirmacoes contra o quorum e paridade observada do CETRAN (parametro session.quorum.cetran_parity, ops.parameter). session_id sem FK: inf.rait_session nasce no DDL 36, posterior ao 35. */
    RaitBench: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      session_id: string;
      /**
       * @default 'BANCA_PREVISTA'
       * @enum {string}
       */
      state: 'BANCA_PREVISTA' | 'BANCA_CONFIRMADA' | 'BANCA_INSUFICIENTE';
      /** @default 0 */
      confirmed_count: number;
      parity_observed?: boolean | null;
      /** Format: date-time */
      confirmed_at?: string | null;
      /** Format: date-time */
      insufficient_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitBenchDto: {
      /** Format: uuid */
      session_id: string;
      /**
       * @default 'BANCA_PREVISTA'
       * @enum {string}
       */
      state: 'BANCA_PREVISTA' | 'BANCA_CONFIRMADA' | 'BANCA_INSUFICIENTE';
      /** @default 0 */
      confirmed_count: number;
      parity_observed?: boolean | null;
      /** Format: date-time */
      confirmed_at?: string | null;
      /** Format: date-time */
      insufficient_at?: string | null;
    };
    /** @description Relogio de extincao de punibilidade. A=decadencia 180/360d (RN-RAIT-114); B=inercia 24 meses (RN-RAIT-110/111/112); C=paralisacao 3 anos (RN-RAIT-113); D=prescricao quinquenal 60 meses, nao reinicia por movimentacao — so pelas hipoteses do art.2 da Lei 9.873/1999 (RN-RAIT-113 caput, WF-RAIT-002 4.4, Decisao do Owner DT-030 2026-08-28). Uma bandeira POR RELOGIO — nunca agregada (AC-RAIT-010-3). */
    RaitClock: {
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
      /** Format: date */
      started_on: string;
      /** Format: date */
      ceiling_on: string;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      flag_changed_at: string;
      /** Format: date-time */
      last_reset_at?: string | null;
      legal_basis: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitClockDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      clock_code: 'A' | 'B' | 'C' | 'D';
      /** Format: date */
      started_on: string;
      /** Format: date */
      ceiling_on: string;
      /**
       * @default 'SEM_RISCO'
       * @enum {string}
       */
      flag:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      flag_changed_at: string;
      /** Format: date-time */
      last_reset_at?: string | null;
      legal_basis: string;
    };
    /** @description Degrau da escada de alertas (WF-RAIT-002 secao 4/6). PRESCRITO_OPERACIONAL exige incidente documentado (AC-RAIT-010-4). */
    RaitClockAlert: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      clock_id: string;
      /** @enum {string} */
      level:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      raised_at: string;
      notified_role: string;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: uuid */
      acknowledged_by?: string | null;
      incident_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitClockAlertDto: {
      /** Format: uuid */
      clock_id: string;
      /** @enum {string} */
      level:
        | 'SEM_RISCO'
        | 'ALERTA_N1'
        | 'ALERTA_N2'
        | 'ALERTA_N3'
        | 'CRITICO'
        | 'PRESCRITO_OPERACIONAL';
      /**
       * Format: date-time
       * @default now()
       */
      raised_at: string;
      notified_role: string;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** Format: uuid */
      acknowledged_by?: string | null;
      incident_ref?: string | null;
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
