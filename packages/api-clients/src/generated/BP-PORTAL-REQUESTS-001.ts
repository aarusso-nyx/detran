// Generated from docs/framework/contracts/BP-PORTAL-REQUESTS-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Pedido do cidadao — maquina [WF-PORTAL-001] secao Estados (13 tokens no check de state; INELEGIVEL e resposta 422 PORTAL.INELIGIBLE sem linha persistida, M7). service_key e FK logica para portal.service_catalog.service_key (outro pacote, sem FK fisica). Delegacao (M8): delegation_domain, delegation_command (ex.: inf:rait-case:protocol), delegation_external_id, delegation_status e delegation_error; falha apos protocolo mantem o protocolo e grava delegation_status = failed (PORTAL.DELEGATION_FAILED). minimum_assurance copia o nivel exigido pela matriz no momento do pedido (M5). version para If-Match (M9); withdrawn_at em DESISTIDO. */
    Request: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      state:
        | 'IDENTIFICADO'
        | 'SERVICO_SELECIONADO'
        | 'ELEGIBILIDADE_VERIFICADA'
        | 'INELEGIVEL'
        | 'PEDIDO_EM_COMPOSICAO'
        | 'AGUARDANDO_NIVEL_ASSINATURA'
        | 'AGUARDANDO_PAGAMENTO'
        | 'PROTOCOLADO'
        | 'EM_ANDAMENTO_NO_ORGAO'
        | 'RESULTADO_DISPONIVEL'
        | 'AVALIACAO_OFERECIDA'
        | 'CONCLUIDO'
        | 'DESISTIDO';
      service_key: string;
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      target_kind: 'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
      /** Format: uuid */
      target_id?: string | null;
      /**
       * @default 'portal'
       * @enum {string}
       */
      channel: 'portal';
      delegation_domain?: string | null;
      delegation_command?: string | null;
      delegation_external_id?: string | null;
      /** @enum {string} */
      delegation_status: 'pending' | 'delegated' | 'failed' | 'not_applicable';
      delegation_error?: string | null;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      /** @default 1 */
      version: number;
      /** Format: date-time */
      withdrawn_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRequestDto: {
      /** @enum {string} */
      state:
        | 'IDENTIFICADO'
        | 'SERVICO_SELECIONADO'
        | 'ELEGIBILIDADE_VERIFICADA'
        | 'INELEGIVEL'
        | 'PEDIDO_EM_COMPOSICAO'
        | 'AGUARDANDO_NIVEL_ASSINATURA'
        | 'AGUARDANDO_PAGAMENTO'
        | 'PROTOCOLADO'
        | 'EM_ANDAMENTO_NO_ORGAO'
        | 'RESULTADO_DISPONIVEL'
        | 'AVALIACAO_OFERECIDA'
        | 'CONCLUIDO'
        | 'DESISTIDO';
      service_key: string;
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      target_kind: 'ait' | 'case' | 'vehicle' | 'exam' | 'crash' | 'none';
      /** Format: uuid */
      target_id?: string | null;
      /**
       * @default 'portal'
       * @enum {string}
       */
      channel: 'portal';
      delegation_domain?: string | null;
      delegation_command?: string | null;
      delegation_external_id?: string | null;
      /** @enum {string} */
      delegation_status: 'pending' | 'delegated' | 'failed' | 'not_applicable';
      delegation_error?: string | null;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      /** @default 1 */
      version: number;
      /** Format: date-time */
      withdrawn_at?: string | null;
    };
    /** @description Rascunho versionado do pedido em PEDIDO_EM_COMPOSICAO ([WF-PORTAL-001] secao Transicoes, PUT requests/{id}/draft com If-Match; plan R-0009 M7 e M9): cada gravacao e uma nova versao (payload_json validado por docs/framework/schemas/portal-request-draft.schema.json por ato, WP-P3). Uma linha por (tenant, request, version). */
    RequestDraft: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      request_id: string;
      version: number;
      payload_json: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      saved_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRequestDraftDto: {
      /** Format: uuid */
      request_id: string;
      version: number;
      payload_json: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      saved_at: string;
    };
    /** @description Anexo do pedido com intencao de upload ([WF-PORTAL-001] secao Transicoes, composicao do pedido; portal-build-pack.md secao 2 WP-P1: hash e intencao de upload): upload_state intended -> completed | rejected; storage_ref preenchido na conclusao; sha256 declarado pelo cliente e conferido no armazenamento. */
    RequestAttachment: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      request_id: string;
      filename: string;
      mime_type: string;
      size_bytes: number;
      sha256: string;
      /**
       * @default 'intended'
       * @enum {string}
       */
      upload_state: 'intended' | 'completed' | 'rejected';
      storage_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRequestAttachmentDto: {
      /** Format: uuid */
      request_id: string;
      filename: string;
      mime_type: string;
      size_bytes: number;
      sha256: string;
      /**
       * @default 'intended'
       * @enum {string}
       */
      upload_state: 'intended' | 'completed' | 'rejected';
      storage_ref?: string | null;
    };
    /** @description Protocolo imediato do pedido ([WF-PORTAL-001] secao Prazos, T-PROTOCOLO: imediato, sem excecao, Lei 14.129/2021 art. 27 IV; plan R-0009 M8): gravado na mesma transacao que leva o pedido a PROTOCOLADO, antes de qualquer validacao de conteudo e antes da delegacao. number = <tenant-slug-upper>-<AAAA>-<sequencial 7 digitos>, unico por tenant; um protocolo por pedido (request_id unico). receipt_hash = sha256 do JSON canonico do recibo. A sequencia portal.protocol_seq NAO e entidade deste blueprint: vive no DDL manuscrito 19-portal-platform.sql porque o gerador nao emite sequences. */
    Protocol: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      request_id: string;
      number: string;
      /** Format: date-time */
      issued_at: string;
      /**
       * @default 'portal'
       * @enum {string}
       */
      channel: 'portal';
      receipt_hash: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateProtocolDto: {
      /** Format: uuid */
      request_id: string;
      number: string;
      /** Format: date-time */
      issued_at: string;
      /**
       * @default 'portal'
       * @enum {string}
       */
      channel: 'portal';
      receipt_hash: string;
    };
    /** @description Ciencia das consequencias de um ato ([WF-PORTAL-001] secao Transicoes: desistencia, renuncia ao desconto de 40 % (H.53), indicacao de condutor e adesao ao SNE exigem ciencia explicita do texto versionado; portal-build-pack.md secao 2 WP-P1): guarda o kind, a versao do texto aceito e quando foi aceito; nunca o texto em si. */
    ConsequenceAck: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      request_id: string;
      /** @enum {string} */
      kind: 'desistencia' | 'renuncia_40' | 'indicacao' | 'sne';
      text_version: string;
      /** Format: date-time */
      accepted_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateConsequenceAckDto: {
      /** Format: uuid */
      request_id: string;
      /** @enum {string} */
      kind: 'desistencia' | 'renuncia_40' | 'indicacao' | 'sne';
      text_version: string;
      /** Format: date-time */
      accepted_at: string;
    };
    /** @description Avaliacao de satisfacao ([WF-PORTAL-001] secao Estados AVALIACAO_OFERECIDA -> CONCLUIDO e [WF-PORTAL-004] secao Estados AVALIACAO_OFERECIDA -> AVALIADA; Lei 13.460/2017 art. 23; ADR-0019 Decision 4; plan R-0009 M9 POST evaluations idempotente): subject_kind | subject_id apontam o objeto avaliado (pedido ou manifestacao, sem FK por ser polimorfico — nao confundir com portal.subject). scores_json guarda as 5 notas; uma avaliacao por objeto (unico por tenant, subject_kind, subject_id). Publica AVALIACAO_REGISTRADA (M21). */
    Evaluation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      subject_kind: 'request' | 'manifestation';
      /** Format: uuid */
      subject_id: string;
      scores_json: {
        [key: string]: unknown;
      };
      comment?: string | null;
      /** Format: date-time */
      submitted_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEvaluationDto: {
      /** @enum {string} */
      subject_kind: 'request' | 'manifestation';
      /** Format: uuid */
      subject_id: string;
      scores_json: {
        [key: string]: unknown;
      };
      comment?: string | null;
      /** Format: date-time */
      submitted_at: string;
    };
    /** @description Registro de Idempotency-Key deterministica <ato>:<alvo>:<fingerprint> (plan R-0009 M9; portal-route-contract.md secao 1): POST requests, submit, respostas de diligencia, manifestations, evaluations e sne/enrollment. Reuso com o mesmo body_sha256 devolve response_json com o mesmo status; corpo diferente -> 409 PORTAL.IDEMPOTENT_KEY_REUSE_DIFFERENT_BODY. subject_id nulo para POST manifestations anonimo (H.51). Unico por (tenant, key). */
    IdempotencyRecord: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      key: string;
      /** Format: uuid */
      subject_id?: string | null;
      route: string;
      body_sha256: string;
      response_json: {
        [key: string]: unknown;
      };
      status: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateIdempotencyRecordDto: {
      key: string;
      /** Format: uuid */
      subject_id?: string | null;
      route: string;
      body_sha256: string;
      response_json: {
        [key: string]: unknown;
      };
      status: number;
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
