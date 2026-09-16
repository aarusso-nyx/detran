// Generated from docs/framework/contracts/BP-PORTAL-IDENTITY-001.openapi.json. Do not edit.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Sujeito cidadao (ADR-0019 Decision 1; plan R-0009 M6): criado sob demanda no primeiro GET me por upsert em cpf_hash (sha256 hex do CPF, unico por tenant). Guarda apenas nome e o nivel observado na ultima sessao (selo gov.br e nivel de assinatura mapeado pela ADR-0024: bronze -> simples, prata|ouro -> avancada, ICP/e-Notariado -> qualificada). O titular ve o CPF pela claim, nunca por esta tabela (RN-PORTAL-112). version para If-Match. */
    Subject: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      cpf_hash: string;
      name?: string | null;
      /** @enum {string|null} */
      govbr_level_observed?: 'bronze' | 'prata' | 'ouro' | 'qualificada' | null;
      /** @enum {string} */
      assurance_level_observed: 'simples' | 'avancada' | 'qualificada';
      /** Format: date-time */
      observed_at: string;
      /** @default 1 */
      version: number;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateSubjectDto: {
      cpf_hash: string;
      name?: string | null;
      /** @enum {string|null} */
      govbr_level_observed?: 'bronze' | 'prata' | 'ouro' | 'qualificada' | null;
      /** @enum {string} */
      assurance_level_observed: 'simples' | 'avancada' | 'qualificada';
      /** Format: date-time */
      observed_at: string;
      /** @default 1 */
      version: number;
    };
    /** @description Procuracao apresentada por um sujeito (procurador) sobre um representado ([WF-PORTAL-002] secao Estados: PROCURACAO_APRESENTADA -> PROCURACAO_VALIDADA | PROCURACAO_RECUSADA; ADR-0019 Decision 1; plan R-0009 M6). O representado e identificado por hash de CPF e nome; o instrumento e um documento (storage) referenciado por id. scope limita o alcance (ait | all); valid_until nulo = sem termo. So representacoes PROCURACAO_VALIDADA vigentes conferem vinculo (M10). */
    Representation: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      representative_subject_id: string;
      represented_cpf_hash: string;
      represented_name: string;
      /** Format: uuid */
      instrument_document_id: string;
      /** @enum {string} */
      scope: 'ait' | 'all';
      /** Format: date */
      valid_until?: string | null;
      /** @enum {string} */
      state:
        | 'PROCURACAO_APRESENTADA'
        | 'PROCURACAO_VALIDADA'
        | 'PROCURACAO_RECUSADA';
      refusal_reason?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRepresentationDto: {
      /** Format: uuid */
      representative_subject_id: string;
      represented_cpf_hash: string;
      represented_name: string;
      /** Format: uuid */
      instrument_document_id: string;
      /** @enum {string} */
      scope: 'ait' | 'all';
      /** Format: date */
      valid_until?: string | null;
      /** @enum {string} */
      state:
        | 'PROCURACAO_APRESENTADA'
        | 'PROCURACAO_VALIDADA'
        | 'PROCURACAO_RECUSADA';
      refusal_reason?: string | null;
    };
    /** @description Matriz ato -> nivel minimo de assinatura como dados (ADR-0019 Decision 1; plan R-0009 M5; Decreto 10.543/2020 art. 4; PN DETRAN-AM 001/2025; steering H.49/H.50/H.51): act_key e o serviceKey do portal-route-contract.md secao 5.1 quando existe, senao o token de M5. Lida por assertActLevel (M4): ato sem linha habilitada e vigente -> 500 PORTAL.INTERNAL (nunca liberar por ausencia); minimum_assurance = qualificada -> 500 PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED (RN-PORTAL-101). Uma linha por (tenant, act_key, effective_from). */
    ActLevelPolicy: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      act_key: string;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      legal_basis: string;
      decision_ref?: string | null;
      enabled: boolean;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateActLevelPolicyDto: {
      act_key: string;
      /** @enum {string} */
      minimum_assurance: 'none' | 'simples' | 'avancada' | 'qualificada';
      legal_basis: string;
      decision_ref?: string | null;
      enabled: boolean;
      /** Format: date */
      effective_from: string;
      /** Format: date */
      effective_to?: string | null;
    };
    /** @description Vinculo do sujeito com um alvo de outro dominio (ADR-0019 Decision 1; plan R-0009 M6 e M10; portal-route-contract.md secao 11: sucessor de portal.ait_entitlement com alvo generico). target_id e uuid sem FK (o alvo e de inf/est/ch). Toda leitura de aits/{id}, requests/{id}, vehicles/{id}/*, crashes/{id} e exams/{id} consulta esta tabela; ausencia -> 404 PORTAL.NOT_FOUND. Origem nesta rodada: fixtures e projetor de INFRACAO_ESTADO_ALTERADO (origin = infraction). */
    Entitlement: {
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
      target_kind: 'ait' | 'case' | 'vehicle' | 'license' | 'crash' | 'exam';
      /** Format: uuid */
      target_id: string;
      /** @enum {string} */
      relation: 'owner' | 'driver' | 'representative' | 'interested_party';
      /** @enum {string} */
      origin: 'renavam' | 'renach' | 'infraction' | 'representation' | 'manual';
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_until?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateEntitlementDto: {
      /** Format: uuid */
      subject_id: string;
      /** @enum {string} */
      target_kind: 'ait' | 'case' | 'vehicle' | 'license' | 'crash' | 'exam';
      /** Format: uuid */
      target_id: string;
      /** @enum {string} */
      relation: 'owner' | 'driver' | 'representative' | 'interested_party';
      /** @enum {string} */
      origin: 'renavam' | 'renach' | 'infraction' | 'representation' | 'manual';
      /** Format: date */
      valid_from: string;
      /** Format: date */
      valid_until?: string | null;
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
