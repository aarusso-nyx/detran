// Generated from docs/framework/contracts/BP-PORTAL-CITIZEN-SERVICE-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Manifestacao de ouvidoria — maquina [WF-PORTAL-004] secao Estados (9 tokens no check de state; Lei 13.460/2017 arts. 10-16; plan R-0009 M13): kind reclamacao | denuncia | sugestao | elogio | solicitacao (H.52); anonymous = true exige subject_id nulo (H.51: anonimo para manifestar, simples para acompanhar). POST manifestations nunca recusa (RN-PORTAL-109) e cria MANIFESTACAO_REGISTRADA + COMPROVANTE_EMITIDO na mesma transacao. agency_due_on = received_at + 30 dias corridos (T-OUV-RESPOSTA); info_due_on = 20 dias, nulo ate INFORMACAO_SOLICITADA_AO_AGENTE (T-OUV-INFO). version para If-Match. */
    Manifestation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      state:
        | 'MANIFESTACAO_REGISTRADA'
        | 'COMPROVANTE_EMITIDO'
        | 'EM_ANALISE'
        | 'INFORMACAO_SOLICITADA_AO_AGENTE'
        | 'DECISAO_FINAL_ELABORADA'
        | 'CIENCIA_AO_USUARIO'
        | 'ENCERRADA'
        | 'AVALIACAO_OFERECIDA'
        | 'AVALIADA';
      /** @enum {string} */
      kind: 'reclamacao' | 'denuncia' | 'sugestao' | 'elogio' | 'solicitacao';
      confidential: boolean;
      anonymous: boolean;
      /** Format: uuid */
      subject_id?: string | null;
      text: string;
      protocol: string;
      /** Format: date-time */
      received_at: string;
      /** Format: date */
      agency_due_on: string;
      /** Format: date */
      info_due_on?: string | null;
      decision_text?: string | null;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateManifestationDto: {
      /** @enum {string} */
      state:
        | 'MANIFESTACAO_REGISTRADA'
        | 'COMPROVANTE_EMITIDO'
        | 'EM_ANALISE'
        | 'INFORMACAO_SOLICITADA_AO_AGENTE'
        | 'DECISAO_FINAL_ELABORADA'
        | 'CIENCIA_AO_USUARIO'
        | 'ENCERRADA'
        | 'AVALIACAO_OFERECIDA'
        | 'AVALIADA';
      /** @enum {string} */
      kind: 'reclamacao' | 'denuncia' | 'sugestao' | 'elogio' | 'solicitacao';
      confidential: boolean;
      anonymous: boolean;
      /** Format: uuid */
      subject_id?: string | null;
      text: string;
      protocol: string;
      /** Format: date-time */
      received_at: string;
      /** Format: date */
      agency_due_on: string;
      /** Format: date */
      info_due_on?: string | null;
      decision_text?: string | null;
      /** Format: date-time */
      decided_at?: string | null;
      /** Format: date-time */
      acknowledged_at?: string | null;
      /** @default 1 */
      version: number;
    };
    /** @description Prorrogacao justificada de um prazo da manifestacao ([WF-PORTAL-004] secao Prazos: T-OUV-RESPOSTA 30 + 30 e T-OUV-INFO 20 + 20, prorrogaveis uma vez por igual periodo, Lei 13.460/2017 art. 16; plan R-0009 M13): justification obrigatoria — o sistema registra a motivacao, nunca estende o relogio silenciosamente. Uma prorrogacao por timer (unico por tenant, manifestation_id, timer); timer com FK para inf.infraction_timer_ref. */
    ManifestationExtension: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      manifestation_id: string;
      /** @enum {string} */
      timer: 'T-OUV-RESPOSTA' | 'T-OUV-INFO';
      justification: string;
      /** Format: date */
      extended_on: string;
      /** Format: date */
      new_due_on: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateManifestationExtensionDto: {
      /** Format: uuid */
      manifestation_id: string;
      /** @enum {string} */
      timer: 'T-OUV-RESPOSTA' | 'T-OUV-INFO';
      justification: string;
      /** Format: date */
      extended_on: string;
      /** Format: date */
      new_due_on: string;
    };
    /** @description Carta de Servicos como dados ([WF-PORTAL-001] secao Carta de Servicos e secao Catalogo de servicos; [WF-PORTAL-004] secao Carta de Servicos como artefato vivo; Lei 13.460/2017 art. 7; RN-PORTAL-108, 11 campos; portal-route-contract.md secao 2 GET services; plan R-0009 M12): service_key unico por tenant; availability available | partially_available | unavailable com unavailable_reason obrigatorio quando unavailable (check de motivo; PORTAL.SERVICE_UNAVAILABLE 422 nunca 404). requirements_json e a lista requirements[] da rota. minimum_assurance espelha a matriz de M5 para exibicao. */
    ServiceCatalog: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      service_key: string;
      route: string;
      category: string;
      title: string;
      summary: string;
      requirements_json: {
        [key: string]: unknown;
      };
      delivery_channel: string;
      legal_deadline: string;
      cost: string;
      accessibility_note: string;
      responsible_party: string;
      normative_reference: string;
      /** @enum {string} */
      availability: 'available' | 'partially_available' | 'unavailable';
      unavailable_reason?: string | null;
      alternative_channel_note?: string | null;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      /** @default 1 */
      version: number;
      /** Format: date */
      effective_from: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateServiceCatalogDto: {
      service_key: string;
      route: string;
      category: string;
      title: string;
      summary: string;
      requirements_json: {
        [key: string]: unknown;
      };
      delivery_channel: string;
      legal_deadline: string;
      cost: string;
      accessibility_note: string;
      responsible_party: string;
      normative_reference: string;
      /** @enum {string} */
      availability: 'available' | 'partially_available' | 'unavailable';
      unavailable_reason?: string | null;
      alternative_channel_note?: string | null;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      /** @default 1 */
      version: number;
      /** Format: date */
      effective_from: string;
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
