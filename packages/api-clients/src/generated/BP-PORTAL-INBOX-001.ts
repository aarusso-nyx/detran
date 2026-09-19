// Generated from docs/framework/contracts/BP-PORTAL-INBOX-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Item da caixa do cidadao ([WF-PORTAL-003] secao Estados: por notificacao GERADA -> DISPONIBILIZADA -> LIDA_EFETIVA | CIENCIA_FICTA; ADR-0019 Decision 3; plan R-0009 M15): kind acao_necessaria | informativo, source sne | portal, source_event_id unico por tenant (idempotencia da projecao). fictitious_acknowledgement_on so para source = sne (available_on + 30 dias, timer T-SNE-CIENCIA lido de inf.infraction_timer_ref, nunca duplicado). ait_id referencia inf sem FK; request_id referencia portal.request. Adenda A1(e) R-0009: kind = ADR-0019 §3 (SNE|PROCESSO|OUVIDORIA|SISTEMA); action_required deriva o kind cidadao (acao_necessaria|informativo) de portal-route-contract.md §6; deadline_owned_by ∈ citizen|agency (route contract §5 nextAction.by). */
    InboxItem: {
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
      kind: 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';
      /** @default false */
      action_required: boolean;
      /** @enum {string} */
      source: 'sne' | 'portal';
      /** Format: uuid */
      source_event_id: string;
      subject_line: string;
      summary: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      request_id?: string | null;
      /** Format: date */
      available_on: string;
      /** Format: date */
      read_on?: string | null;
      /** Format: date */
      fictitious_acknowledgement_on?: string | null;
      /** Format: date */
      deadline_due_on?: string | null;
      /** @enum {string|null} */
      deadline_owned_by?: 'citizen' | 'agency' | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateInboxItemDto: {
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      kind: 'SNE' | 'PROCESSO' | 'OUVIDORIA' | 'SISTEMA';
      /** @default false */
      action_required: boolean;
      /** @enum {string} */
      source: 'sne' | 'portal';
      /** Format: uuid */
      source_event_id: string;
      subject_line: string;
      summary: string;
      /** Format: uuid */
      ait_id?: string | null;
      /** Format: uuid */
      request_id?: string | null;
      /** Format: date */
      available_on: string;
      /** Format: date */
      read_on?: string | null;
      /** Format: date */
      fictitious_acknowledgement_on?: string | null;
      /** Format: date */
      deadline_due_on?: string | null;
      /** @enum {string|null} */
      deadline_owned_by?: 'citizen' | 'agency' | null;
    };
    /** @description Evidencia de ciencia do que o cidadao viu ([WF-PORTAL-003] secao Estados LIDA_EFETIVA / CIENCIA_COMPROVADA; ADR-0019 Decision 3; plan R-0009 M15): displayed_sha256 do conteudo exibido, acknowledged_at e signature_ref opcional. Uma evidencia por item (unico por tenant, inbox_item_id): a segunda leitura nao duplica evidencia nem evento NOTIFICACAO_CIENCIA. */
    AcknowledgementEvidence: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      inbox_item_id: string;
      displayed_sha256: string;
      /** Format: date-time */
      acknowledged_at: string;
      signature_ref?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateAcknowledgementEvidenceDto: {
      /** Format: uuid */
      inbox_item_id: string;
      displayed_sha256: string;
      /** Format: date-time */
      acknowledged_at: string;
      signature_ref?: string | null;
    };
    /** @description Adesao do cidadao ao SNE ([WF-PORTAL-003] secao Estados: macro-estado NAO_ADERIDO_SNE | ADERIDO_SNE; [UC-PORTAL-007]; plan R-0009 M8 e M15): uma linha por sujeito (unico por tenant, subject_id). effects_ack guarda a ciencia dos quatro efeitos da adesao (jsonb), consent_text_version a versao do termo aceito, since / cancelled_at / cancel_reason o historico do vinculo. O envio real ao SNE nacional via packages/senatran-adapter e OD-P16 (source_pending): nesta rodada so grava e publica SNE_ADESAO_SOLICITADA / SNE_CANCELAMENTO_SOLICITADO. */
    SneEnrollment: {
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
      state: 'NAO_ADERIDO_SNE' | 'ADERIDO_SNE';
      /** @enum {string|null} */
      channel?: 'push' | 'email' | 'sne' | null;
      email?: string | null;
      phone?: string | null;
      consent_text_version?: string | null;
      effects_ack?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      since?: string | null;
      /** Format: date-time */
      cancelled_at?: string | null;
      cancel_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSneEnrollmentDto: {
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      state: 'NAO_ADERIDO_SNE' | 'ADERIDO_SNE';
      /** @enum {string|null} */
      channel?: 'push' | 'email' | 'sne' | null;
      email?: string | null;
      phone?: string | null;
      consent_text_version?: string | null;
      effects_ack?: {
        [key: string]: unknown;
      } | null;
      /** Format: date-time */
      since?: string | null;
      /** Format: date-time */
      cancelled_at?: string | null;
      cancel_reason?: string | null;
    };
    /** @description Assinatura Web Push do cidadao ([WF-PORTAL-003] secao Estados PREFERENCIAS_CONFIGURADAS; plan R-0009 M15 e M19 portal:push-subscription:create): endpoint unico por tenant, keys_json com as chaves do navegador. Entrega usa @stynx-nyx/notifications (ADR-0019 Decision 3). */
    PushSubscription: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      subject_id: string;
      endpoint: string;
      keys_json: {
        [key: string]: unknown;
      };
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreatePushSubscriptionDto: {
      /** Format: uuid */
      subject_id: string;
      endpoint: string;
      keys_json: {
        [key: string]: unknown;
      };
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
