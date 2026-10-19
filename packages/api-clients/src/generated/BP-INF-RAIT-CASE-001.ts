// Generated from docs/framework/contracts/BP-INF-RAIT-CASE-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Caso RAIT — um requerimento sobre um AIT em uma instancia (RN-RAIT-002). v1.1.0: legal_priority guarda a base de prioridade legal de tramitacao da ordem unica (WF-RAIT-004 secao 2; valores no parametro rait.priority.legal_bases, OD-016 — sem check para nao congelar parametro em DDL), unit_id aponta a turma/JARI que julga (secao 7, sem FK: inf.rait_unit nasce no DDL 35, posterior ao 34) e version e o contador de ETag/If-Match. */
    RaitCase: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      origin_case_id?: string | null;
      protocol_number: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /**
       * @default 'PROTOCOLADO'
       * @enum {string}
       */
      state:
        | 'PROTOCOLADO'
        | 'TRIAGEM_ADMISSIBILIDADE'
        | 'NAO_CONHECIDO'
        | 'ADMITIDO'
        | 'AGUARDANDO_REMESSA_JARI'
        | 'DISTRIBUIDO'
        | 'EM_INSTRUCAO'
        | 'DILIGENCIA'
        | 'PRONTO_P_DECISAO'
        | 'DECIDIDO_AUTORIDADE'
        | 'PAUTADO'
        | 'JULGADO_SESSAO'
        | 'COMUNICADO'
        | 'TRANSITADO'
        | 'REMETIDO_2A_INSTANCIA'
        | 'ENCERRADO_DESISTENCIA';
      intake_channel: string;
      /** Format: date-time */
      protocolled_at: string;
      /** Format: date-time */
      admitted_at?: string | null;
      /** Format: date-time */
      judge_body_received_at?: string | null;
      /** Format: date */
      judge_body_received_on?: string | null;
      /** Format: date-time */
      cetran_received_at?: string | null;
      /** Format: date */
      cetran_received_on?: string | null;
      /** Format: date-time */
      remitted_at?: string | null;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      communicated_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** @default false */
      suspensive_effect: boolean;
      /** @default false */
      archived: boolean;
      /** @enum {string|null} */
      non_admission_reason?:
        | 'intempestivo'
        | 'ilegitimo'
        | 'sem_assinatura'
        | 'pedido_incompativel'
        | null;
      /** Format: uuid */
      withdrawal_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      last_movement_at: string;
      /** @default false */
      pending_completion: boolean;
      legal_priority?: string | null;
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCaseDto: {
      /** Format: uuid */
      ait_id: string;
      /** Format: uuid */
      origin_case_id?: string | null;
      protocol_number: string;
      /** @enum {string} */
      instance: 'defesa_previa' | 'jari' | 'cetran';
      circuit: number;
      /**
       * @default 'PROTOCOLADO'
       * @enum {string}
       */
      state:
        | 'PROTOCOLADO'
        | 'TRIAGEM_ADMISSIBILIDADE'
        | 'NAO_CONHECIDO'
        | 'ADMITIDO'
        | 'AGUARDANDO_REMESSA_JARI'
        | 'DISTRIBUIDO'
        | 'EM_INSTRUCAO'
        | 'DILIGENCIA'
        | 'PRONTO_P_DECISAO'
        | 'DECIDIDO_AUTORIDADE'
        | 'PAUTADO'
        | 'JULGADO_SESSAO'
        | 'COMUNICADO'
        | 'TRANSITADO'
        | 'REMETIDO_2A_INSTANCIA'
        | 'ENCERRADO_DESISTENCIA';
      intake_channel: string;
      /** Format: date-time */
      admitted_at?: string | null;
      /** Format: date-time */
      judge_body_received_at?: string | null;
      /** Format: date */
      judge_body_received_on?: string | null;
      /** Format: date-time */
      cetran_received_at?: string | null;
      /** Format: date */
      cetran_received_on?: string | null;
      /** Format: date-time */
      remitted_at?: string | null;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      communicated_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      /** @default false */
      suspensive_effect: boolean;
      /** @default false */
      archived: boolean;
      /** @enum {string|null} */
      non_admission_reason?:
        | 'intempestivo'
        | 'ilegitimo'
        | 'sem_assinatura'
        | 'pedido_incompativel'
        | null;
      /** Format: uuid */
      withdrawal_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      last_movement_at: string;
      /** @default false */
      pending_completion: boolean;
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: uuid */
      agency_jurisdiction_id?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Parte do caso — legitimidade ativa (RN-RAIT-120) e representacao (RN-RAIT-121). */
    RaitParty: {
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
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name: string;
      document_number: string;
      contact_email?: string | null;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
      /** Format: uuid */
      representation_document_id?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPartyDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      role: 'requerente' | 'procurador' | 'autoridade';
      /** @enum {string|null} */
      legitimacy_basis?:
        | 'proprietario'
        | 'condutor'
        | 'embarcador'
        | 'transportador'
        | 'possuidor_equiparado'
        | 'principal_condutor'
        | null;
      person_name: string;
      document_number: string;
      contact_email?: string | null;
      /** @enum {string|null} */
      representation_kind?:
        'procuracao_publica' | 'particular_firma_autenticidade' | null;
      /** @default false */
      representation_verified: boolean;
      /** Format: uuid */
      representation_document_id?: string | null;
    };
    /** @description Peca do dossie. origin='oficio' marca as pecas que o orgao junta por dever proprio (RN-RAIT-003). */
    RaitDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      storage_key: string;
      filename: string;
      content_hash: string;
      /** @default false */
      digitised_from_paper: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitDocumentDto: {
      /** Format: uuid */
      case_id: string;
      kind: string;
      /** @enum {string} */
      origin: 'requerente' | 'oficio';
      storage_key: string;
      filename: string;
      content_hash: string;
      /** @default false */
      digitised_from_paper: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by?: string | null;
    };
    /** @description ADR-0024 e CTG-0001-C4-OD V3: qualificacao no protocolo, politica e instante preservados; revision posterior reservada e vedada na politica atual. */
    RaitPriorityAssessment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      revision: number;
      /** @enum {string} */
      outcome: 'none' | 'priority';
      /** Format: date-time */
      assessed_at: string;
      /** Format: uuid */
      assessed_by: string;
      /** Format: date */
      qualification_on: string;
      timezone: string;
      /** Format: uuid */
      policy_parameter_id: string;
      policy_version: number;
      policy_snapshot: {
        [key: string]: unknown;
      };
      reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPriorityAssessmentDto: {
      /** Format: uuid */
      case_id: string;
      revision: number;
      /** @enum {string} */
      outcome: 'none' | 'priority';
      /** Format: date-time */
      assessed_at: string;
      /** Format: uuid */
      assessed_by: string;
      /** Format: date */
      qualification_on: string;
      timezone: string;
      /** Format: uuid */
      policy_parameter_id: string;
      policy_version: number;
      policy_snapshot: {
        [key: string]: unknown;
      };
      reason?: string | null;
    };
    /** @description ADR-0024 e CTG-0001-C4-OD V3: todas as provas do ato, anexo PCD obrigatorio; documento/CNH apresentado para idade sem upload obrigatorio. */
    RaitPriorityBasis: {
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
      assessment_id: string;
      /** @enum {string} */
      basis_code: 'pcd' | 'age_60_plus' | 'age_80_plus';
      /** Format: date-time */
      verified_at: string;
      /** Format: uuid */
      verified_by: string;
      /** @enum {string} */
      source_kind: 'attached_document' | 'presented_document' | 'presented_cnh';
      source_ref: string;
      /** Format: uuid */
      document_id?: string | null;
      /** Format: date */
      birth_date?: string | null;
      evidence_hash?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPriorityBasisDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      assessment_id: string;
      /** @enum {string} */
      basis_code: 'pcd' | 'age_60_plus' | 'age_80_plus';
      /** Format: date-time */
      verified_at: string;
      /** Format: uuid */
      verified_by: string;
      /** @enum {string} */
      source_kind: 'attached_document' | 'presented_document' | 'presented_cnh';
      source_ref: string;
      /** Format: uuid */
      document_id?: string | null;
      /** Format: date */
      birth_date?: string | null;
      evidence_hash?: string | null;
    };
    /** @description Pendencia de conteudo minimo aberta no protocolo — UC-RAIT-028 fluxos 1-3. Registra os itens ausentes (RN-RAIT-002), o prazo interno ao requerente e o desfecho; pendencia nao e recusa de protocolo (AC-RAIT-028-1) e nao consome o prazo do requerente (AC-RAIT-028-2). Exigencia de uma so vez: no maximo uma pendencia aberta por caso (RN-PORTAL-107). */
    RaitPendingContent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      missing_items: {
        [key: string]: unknown;
      };
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPendingContentDto: {
      /** Format: uuid */
      case_id: string;
      missing_items: {
        [key: string]: unknown;
      };
      /** Format: date */
      due_on: string;
      /**
       * Format: date-time
       * @default now()
       */
      opened_at: string;
      /** Format: uuid */
      opened_by: string;
      /** Format: date-time */
      closed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'atendida' | 'nao_atendida' | null;
    };
    /** @description Redirecionamento de intake entre orgaos — UC-RAIT-027 fluxos 2-4. Peca de outro orgao autuador remetida de imediato (Res. 900 art. 6 paragrafos 2 e 3) ou recebida de outro orgao, com o protocolo de origem como marco de tempestividade (AC-RAIT-027-1, RN-RAIT-106) e devolucao de prazo quando o orgao era incompetente (Lei 9.784 art. 63 paragrafo 1, RN-RAIT-109). case_id nulo quando a peca pertence a outro orgao e nao gera caso aqui. */
    RaitRedirect: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      /** @enum {string} */
      reason: 'outro_orgao_autuador' | 'orgao_incompetente';
      protocol_number: string;
      ait_number?: string | null;
      counterpart_agency: string;
      counterpart_renainf_code?: string | null;
      /** Format: date */
      origin_protocolled_on?: string | null;
      /** @default false */
      deadline_restored: boolean;
      /** Format: uuid */
      receipt_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
      /** Format: uuid */
      redirected_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitRedirectDto: {
      /** Format: uuid */
      case_id?: string | null;
      /** @enum {string} */
      direction: 'entrada' | 'saida';
      /** @enum {string} */
      reason: 'outro_orgao_autuador' | 'orgao_incompetente';
      protocol_number: string;
      ait_number?: string | null;
      counterpart_agency: string;
      counterpart_renainf_code?: string | null;
      /** Format: date */
      origin_protocolled_on?: string | null;
      /** @default false */
      deadline_restored: boolean;
      /** Format: uuid */
      receipt_document_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      redirected_at: string;
      /** Format: uuid */
      redirected_by: string;
    };
    /** @description Um veredito por criterio do art.4 da Res.900/2022 — AC-RAIT-002-3 exige os quatro registrados individualmente. */
    RaitAdmissibility: {
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
      criterion:
        'tempestividade' | 'legitimidade' | 'assinatura' | 'pedido_compativel';
      verdict: boolean;
      reason?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      evaluated_at: string;
      /** Format: uuid */
      evaluated_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitAdmissibilityDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      criterion:
        'tempestividade' | 'legitimidade' | 'assinatura' | 'pedido_compativel';
      verdict: boolean;
      reason?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      evaluated_at: string;
      /** Format: uuid */
      evaluated_by: string;
    };
    /** @description Motor de prazos unico (RN-RAIT-005). due_on ja vem prorrogado ao 1o dia util (CONTRAN-918 art.29). */
    RaitDeadline: {
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
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
      legal_basis: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitDeadlineDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      timer_code:
        | 'T-REM10'
        | 'T-DIL'
        | 'T-R2'
        | 'T-JUL-24M'
        | 'T-PAR-3A'
        | 'T-DEC'
        | 'T-VOTO'
        | 'T-CONV';
      start_basis: string;
      /** Format: date */
      started_on: string;
      /** Format: date */
      raw_due_on: string;
      /** Format: date */
      due_on: string;
      /** @default false */
      business_days: boolean;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      satisfied_at?: string | null;
      /** Format: uuid */
      suspended_by_act_id?: string | null;
      legal_basis: string;
    };
    /** @description Diligencia (RN-RAIT-004). Expirar avanca o caso a PRONTO_P_DECISAO; nunca arquiva. */
    RaitInquiry: {
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
      addressee: 'requerente' | 'orgao_autuador';
      subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: uuid */
      requested_by: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitInquiryDto: {
      /** Format: uuid */
      case_id: string;
      /** @enum {string} */
      addressee: 'requerente' | 'orgao_autuador';
      subject: string;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      /** Format: uuid */
      requested_by: string;
      /** Format: date */
      due_on: string;
      /** @default 0 */
      extension_count: number;
      /** Format: date-time */
      answered_at?: string | null;
      /** Format: date */
      answered_on?: string | null;
      /** @enum {string|null} */
      outcome?: 'respondida' | 'expirada' | null;
    };
    /** @description Relacao interna entre resposta de diligencia e documento existente; sem CRUD HTTP. */
    RaitInquiryDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      inquiry_id: string;
      /** Format: uuid */
      document_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitInquiryDocumentDto: {
      /** Format: uuid */
      inquiry_id: string;
      /** Format: uuid */
      document_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by: string;
    };
    /** @description Relacao interna entre resolucao de pendencia e documento existente; sem CRUD HTTP. */
    RaitPendingDocument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      pending_id: string;
      /** Format: uuid */
      document_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitPendingDocumentDto: {
      /** Format: uuid */
      pending_id: string;
      /** Format: uuid */
      document_id: string;
      /**
       * Format: date-time
       * @default now()
       */
      attached_at: string;
      /** Format: uuid */
      attached_by: string;
    };
    /** @description Atestado interno verificavel do termo de desistência fisico ou digital; sem CRUD HTTP. */
    RaitWithdrawalAttestation: {
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
      document_id: string;
      /** Format: uuid */
      signer_party_id: string;
      /** @enum {string} */
      verification_method: 'physical_verified' | 'digital_verified';
      evidence_ref: string;
      /** Format: date-time */
      verified_at: string;
      /** Format: uuid */
      recorded_by: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitWithdrawalAttestationDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      document_id: string;
      /** Format: uuid */
      signer_party_id: string;
      /** @enum {string} */
      verification_method: 'physical_verified' | 'digital_verified';
      evidence_ref: string;
      /** Format: date-time */
      verified_at: string;
      /** Format: uuid */
      recorded_by: string;
    };
    /** @description Minuta de decisao versionada — WF-RAIT-004 secao 4 passos 3, 5 e 6. Uma linha por versao da minuta do caso, com autor, documento na fachada de documentos (ADR-0018, sem FK), hash de conteudo e status; a autoridade signataria pode devolver a minuta com orientacao uma unica vez, sem sair de PRONTO_P_DECISAO (secao 4 passo 5). */
    RaitDraft: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      version: number;
      /** Format: uuid */
      author_id: string;
      /** Format: uuid */
      document_id?: string | null;
      content_hash: string;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      return_guidance?: string | null;
      /** @default 0 */
      return_count: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitDraftDto: {
      /** Format: uuid */
      case_id: string;
      version: number;
      /** Format: uuid */
      author_id: string;
      /** Format: uuid */
      document_id?: string | null;
      content_hash: string;
      /**
       * @default 'rascunho'
       * @enum {string}
       */
      status: 'rascunho' | 'submetida' | 'devolvida' | 'assinada';
      /** Format: date-time */
      submitted_at?: string | null;
      /** Format: date-time */
      returned_at?: string | null;
      return_guidance?: string | null;
      /** @default 0 */
      return_count: number;
    };
    /** @description Decisao do caso. session_id referencia inf.rait_session sem FK — a sessao e criada em DDL posterior (36). */
    RaitDecision: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      grounds: string;
      /** Format: uuid */
      decided_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: uuid */
      session_id?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitDecisionDto: {
      /** Format: uuid */
      case_id: string;
      circuit: number;
      /** @enum {string} */
      decision_kind:
        'acolhida' | 'indeferida' | 'provido' | 'negado' | 'nao_conhecido';
      grounds: string;
      /** Format: uuid */
      decided_by: string;
      /**
       * Format: date-time
       * @default now()
       */
      decided_at: string;
      /** Format: uuid */
      session_id?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      /** Format: date-time */
      published_at?: string | null;
    };
    /** @description Comunicacao do resultado (RN-RAIT-130). effective_on e a ciencia — no SNE, sent_at+30d (RN-RAIT-124). */
    RaitCommunication: {
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
      decision_id?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
      /** @default false */
      authority_appeal_notice: boolean;
      enclosed_document_ids?: {
        [key: string]: unknown;
      } | null;
      content_ref: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCommunicationDto: {
      /** Format: uuid */
      case_id: string;
      /** Format: uuid */
      decision_id?: string | null;
      /** @enum {string} */
      channel: 'sne' | 'postal' | 'pessoal' | 'edital' | 'portal' | 'balcao';
      /**
       * Format: date-time
       * @default now()
       */
      sent_at: string;
      /** Format: date */
      effective_on?: string | null;
      /** Format: date */
      next_deadline_on?: string | null;
      /** @default false */
      authority_appeal_notice: boolean;
      enclosed_document_ids?: {
        [key: string]: unknown;
      } | null;
      content_ref: string;
    };
    /** @description Trilha de movimentacao e eventos de dominio publicados (WF-RAIT-001 secao Eventos). Toda linha reinicia o relogio C. */
    RaitCaseEvent: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
      payload?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCaseEventDto: {
      /** Format: uuid */
      case_id: string;
      event_type: string;
      from_state?: string | null;
      to_state?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      occurred_at: string;
      /** Format: uuid */
      actor_id?: string | null;
      payload?: {
        [key: string]: unknown;
      } | null;
    };
    /** @description ADR-0046/0047, P4-02-S1: explicit role-purpose read containment for WF-RAIT-001/002. Owner-qualified provisioning only; no public API. Unit/pool tenant FKs installed by supporting post-table DDL; role/duty/action remain independently required. */
    RaitCaseReadScope: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      actor_id: string;
      /** @enum {string} */
      role:
        | 'rait-coordinator'
        | 'AUDITOR'
        | 'rait-secretary'
        | 'rait-chair'
        | 'rait-central-authority'
        | 'rait-manager';
      /** Format: uuid */
      unit_id?: string | null;
      /** Format: uuid */
      pool_id?: string | null;
      /** @default false */
      active: boolean;
      authorization_ref: string;
      /**
       * Format: date-time
       * @default now()
       */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCaseReadScopeDto: Record<string, never>;
    /** @description ADR-0047, WF-RAIT-001/002 and P4-02-S1: exact tenant-case-pool containment with verified operational provenance; no first-pool/unit-wide fallback, no public CRUD, seed or historical backfill. Missing routing never invalidates legal protocol/admission. */
    RaitCasePoolScopeRecord: {
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
      /** @default false */
      active: boolean;
      authorization_ref: string;
      source_ref: string;
      /**
       * Format: date-time
       * @default now()
       */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitCasePoolScopeRecordDto: Record<string, never>;
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
