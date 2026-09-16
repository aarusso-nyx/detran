// Generated from docs/framework/contracts/BP-INF-RAIT-SESSION-001.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/sessions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitSession (most recent first, capped at 500) */
    get: operations['listRaitSession'];
    put?: never;
    post: operations['createRaitSession'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/sessions/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitSession'];
    put?: never;
    post?: never;
    delete: operations['removeRaitSession'];
    options?: never;
    head?: never;
    patch: operations['updateRaitSession'];
    trace?: never;
  };
  '/v1/inf/rait/agenda-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitAgendaItem (most recent first, capped at 500) */
    get: operations['listRaitAgendaItem'];
    put?: never;
    post: operations['createRaitAgendaItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/agenda-items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitAgendaItem'];
    put?: never;
    post?: never;
    delete: operations['removeRaitAgendaItem'];
    options?: never;
    head?: never;
    patch: operations['updateRaitAgendaItem'];
    trace?: never;
  };
  '/v1/inf/rait/attendance': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitAttendance (most recent first, capped at 500) */
    get: operations['listRaitAttendance'];
    put?: never;
    post: operations['createRaitAttendance'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/attendance/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitAttendance'];
    put?: never;
    post?: never;
    delete: operations['removeRaitAttendance'];
    options?: never;
    head?: never;
    patch: operations['updateRaitAttendance'];
    trace?: never;
  };
  '/v1/inf/rait/votes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitVote (most recent first, capped at 500) */
    get: operations['listRaitVote'];
    put?: never;
    post: operations['createRaitVote'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/votes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitVote'];
    put?: never;
    post?: never;
    delete: operations['removeRaitVote'];
    options?: never;
    head?: never;
    patch: operations['updateRaitVote'];
    trace?: never;
  };
  '/v1/inf/rait/oral-arguments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitOralArgument (most recent first, capped at 500) */
    get: operations['listRaitOralArgument'];
    put?: never;
    post: operations['createRaitOralArgument'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/oral-arguments/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitOralArgument'];
    put?: never;
    post?: never;
    delete: operations['removeRaitOralArgument'];
    options?: never;
    head?: never;
    patch: operations['updateRaitOralArgument'];
    trace?: never;
  };
  '/v1/inf/rait/minutes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List RaitMinutes (most recent first, capped at 500) */
    get: operations['listRaitMinutes'];
    put?: never;
    post: operations['createRaitMinutes'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/minutes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get: operations['getRaitMinutes'];
    put?: never;
    post?: never;
    delete: operations['removeRaitMinutes'];
    options?: never;
    head?: never;
    patch: operations['updateRaitMinutes'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description Sessao de julgamento. Sem quorum a sessao nao abre e vai a SESSAO_ADIADA (AC-RAIT-006-1); relogios nao param (AC-RAIT-006-2). v1.1.0: modality registra presencial, virtual ou hibrida (WF-RAIT-003 secao Fundamento e WF-RAIT-004 secao 6 regra (d); habilitacao pelo parametro session.modality.virtual_enabled, OD-106) e short_notice_ack marca o reconhecimento da convocacao com menos de T-CONV (RAIT.AGENDA_SHORT_NOTICE, OD-102). */
    RaitSession: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'FORMANDO_PAUTA'
       * @enum {string}
       */
      state:
        | 'FORMANDO_PAUTA'
        | 'PAUTA_FECHADA'
        | 'CONVOCACAO_ENVIADA'
        | 'SESSAO_ABERTA'
        | 'SESSAO_ADIADA'
        | 'RELATORIA_LIDA'
        | 'SUSTENTACAO_ORAL'
        | 'VOTACAO'
        | 'DESEMPATE_PRESIDENTE'
        | 'DECISAO_PROCLAMADA'
        | 'ATA_LAVRADA'
        | 'ATA_ASSINADA';
      /** Format: date-time */
      scheduled_for?: string | null;
      /** Format: date-time */
      agenda_closed_at?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
      /** Format: date-time */
      opened_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      quorum_required: number;
      quorum_observed?: number | null;
      /** Format: uuid */
      chair_member_id?: string | null;
      adjourned_reason?: string | null;
      /** @default false */
      extraordinary: boolean;
      /** Format: uuid */
      short_notice_ack_by?: string | null;
      /**
       * @default 'presencial'
       * @enum {string}
       */
      modality: 'presencial' | 'virtual' | 'hibrida';
      /** @default false */
      short_notice_ack: boolean;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitSessionDto: {
      /** @enum {string} */
      judging_body: 'jari' | 'cetran';
      /**
       * @default 'FORMANDO_PAUTA'
       * @enum {string}
       */
      state:
        | 'FORMANDO_PAUTA'
        | 'PAUTA_FECHADA'
        | 'CONVOCACAO_ENVIADA'
        | 'SESSAO_ABERTA'
        | 'SESSAO_ADIADA'
        | 'RELATORIA_LIDA'
        | 'SUSTENTACAO_ORAL'
        | 'VOTACAO'
        | 'DESEMPATE_PRESIDENTE'
        | 'DECISAO_PROCLAMADA'
        | 'ATA_LAVRADA'
        | 'ATA_ASSINADA';
      /** Format: date-time */
      scheduled_for?: string | null;
      /** Format: date-time */
      agenda_closed_at?: string | null;
      /** Format: date-time */
      convened_at?: string | null;
      /** Format: date-time */
      opened_at?: string | null;
      /** Format: date-time */
      closed_at?: string | null;
      quorum_required: number;
      quorum_observed?: number | null;
      /** Format: uuid */
      chair_member_id?: string | null;
      adjourned_reason?: string | null;
      /** @default false */
      extraordinary: boolean;
      /** Format: uuid */
      short_notice_ack_by?: string | null;
      /**
       * @default 'presencial'
       * @enum {string}
       */
      modality: 'presencial' | 'virtual' | 'hibrida';
      /** @default false */
      short_notice_ack: boolean;
    };
    /** @description Caso em pauta. priority=true para bandeiras ALERTA_N3/CRITICO — entrada obrigatoria (AC-RAIT-005-1). So entra com parecer registrado (AC-RAIT-005-2). v1.1.0: view_requested_by e view_due_on registram o pedido de vista do item e seu prazo de devolucao (WF-RAIT-004 secao 2.3 — Res. 901/2022 Anexo 11.1; OD-103, teto por membro no parametro session.view_request.max_per_member). */
    RaitAgendaItem: {
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
      case_id: string;
      position: number;
      /** @default false */
      priority: boolean;
      /** Format: uuid */
      rapporteur_member_id: string;
      opinion_summary?: string | null;
      opinion_analysis?: string | null;
      /** @enum {string|null} */
      opinion_vote?:
        'provimento' | 'nao_provimento' | 'nao_conhecimento' | null;
      /** Format: date-time */
      opinion_registered_at?: string | null;
      /** Format: date-time */
      read_at?: string | null;
      /** Format: date-time */
      proclaimed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'provido' | 'negado' | 'nao_conhecido' | null;
      /** @default false */
      withdrawn: boolean;
      withdrawn_reason?: string | null;
      /** Format: uuid */
      view_requested_by?: string | null;
      /** Format: date */
      view_due_on?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitAgendaItemDto: {
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      case_id: string;
      position: number;
      /** @default false */
      priority: boolean;
      /** Format: uuid */
      rapporteur_member_id: string;
      opinion_summary?: string | null;
      opinion_analysis?: string | null;
      /** @enum {string|null} */
      opinion_vote?:
        'provimento' | 'nao_provimento' | 'nao_conhecimento' | null;
      /** Format: date-time */
      opinion_registered_at?: string | null;
      /** Format: date-time */
      read_at?: string | null;
      /** Format: date-time */
      proclaimed_at?: string | null;
      /** @enum {string|null} */
      outcome?: 'provido' | 'negado' | 'nao_conhecido' | null;
      /** @default false */
      withdrawn: boolean;
      withdrawn_reason?: string | null;
      /** Format: uuid */
      view_requested_by?: string | null;
      /** Format: date */
      view_due_on?: string | null;
    };
    /** @description Presenca por membro. left_at permite reverificar quorum por caso, nao so na abertura (AC-RAIT-006-3). */
    RaitAttendance: {
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
      /** @default false */
      present: boolean;
      /** @default false */
      is_chair: boolean;
      /** @default false */
      is_chair_substitute: boolean;
      /** Format: date-time */
      arrived_at?: string | null;
      /** Format: date-time */
      left_at?: string | null;
      absence_justified?: boolean | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitAttendanceDto: {
      /** Format: uuid */
      session_id: string;
      /** Format: uuid */
      member_id: string;
      /** @default false */
      present: boolean;
      /** @default false */
      is_chair: boolean;
      /** @default false */
      is_chair_substitute: boolean;
      /** Format: date-time */
      arrived_at?: string | null;
      /** Format: date-time */
      left_at?: string | null;
      absence_justified?: boolean | null;
    };
    /** @description Voto individual vinculado a membro e caso (AC-RAIT-006-5). casting_vote marca o desempate do presidente (AC-RAIT-006-6). */
    RaitVote: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      agenda_item_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      vote: 'provimento' | 'nao_provimento' | 'nao_conhecimento' | 'abstencao';
      /** @default false */
      casting_vote: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      cast_at: string;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitVoteDto: {
      /** Format: uuid */
      agenda_item_id: string;
      /** Format: uuid */
      member_id: string;
      /** @enum {string} */
      vote: 'provimento' | 'nao_provimento' | 'nao_conhecimento' | 'abstencao';
      /** @default false */
      casting_vote: boolean;
      /**
       * Format: date-time
       * @default now()
       */
      cast_at: string;
    };
    /** @description Sustentacao oral — etapa ISOLAVEL: a decisao do Owner entre prever como configuravel ou omitir segue aberta (WF-RAIT-003, tela T-12). Modelada a parte para que a decisao nao force retrabalho estrutural. */
    RaitOralArgument: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      agenda_item_id: string;
      /** Format: uuid */
      requested_by_party_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      granted?: boolean | null;
      denial_basis?: string | null;
      /** Format: date-time */
      held_at?: string | null;
      duration_minutes?: number | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitOralArgumentDto: {
      /** Format: uuid */
      agenda_item_id: string;
      /** Format: uuid */
      requested_by_party_id?: string | null;
      /**
       * Format: date-time
       * @default now()
       */
      requested_at: string;
      granted?: boolean | null;
      denial_basis?: string | null;
      /** Format: date-time */
      held_at?: string | null;
      duration_minutes?: number | null;
    };
    /** @description Ata gerada dos registros ao vivo, nunca redigida do zero (AC-RAIT-006-7). Assinatura PAdES+TSA (steering A.8). v1.1.0: published_at marca a publicacao da ata, que e o marco de T-R2 (WF-RAIT-004 secao 2.2 fila F-J-5; RN-RAIT-103) e so existe depois da assinatura (RAIT.MINUTES_SIGNERS_MISSING). */
    RaitMinutes: {
      /**
       * Format: uuid
       * @default gen_random_uuid()
       */
      id: string;
      /** Format: uuid */
      tenant_id: string;
      /** Format: uuid */
      session_id: string;
      content: {
        [key: string]: unknown;
      };
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      /** Format: date-time */
      signed_at?: string | null;
      /** Format: uuid */
      signed_by?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      document_hash?: string | null;
      /** Format: date-time */
      published_at?: string | null;
      /** Format: date-time */
      created_at: string;
      /** Format: date-time */
      updated_at?: string | null;
    };
    CreateRaitMinutesDto: {
      /** Format: uuid */
      session_id: string;
      content: {
        [key: string]: unknown;
      };
      /**
       * Format: date-time
       * @default now()
       */
      generated_at: string;
      /** Format: date-time */
      signed_at?: string | null;
      /** Format: uuid */
      signed_by?: string | null;
      signature_kind?: string | null;
      signature_ref?: string | null;
      document_hash?: string | null;
      /** Format: date-time */
      published_at?: string | null;
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
  listRaitSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSession'][];
        };
      };
    };
  };
  createRaitSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitSessionDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSession'];
        };
      };
    };
  };
  getRaitSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSession'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitSession: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitSessionDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitSession'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitAgendaItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAgendaItem'][];
        };
      };
    };
  };
  createRaitAgendaItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitAgendaItemDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAgendaItem'];
        };
      };
    };
  };
  getRaitAgendaItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAgendaItem'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitAgendaItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitAgendaItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitAgendaItemDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAgendaItem'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitAttendance: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAttendance'][];
        };
      };
    };
  };
  createRaitAttendance: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitAttendanceDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAttendance'];
        };
      };
    };
  };
  getRaitAttendance: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAttendance'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitAttendance: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitAttendance: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitAttendanceDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitAttendance'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitVote: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitVote'][];
        };
      };
    };
  };
  createRaitVote: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitVoteDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitVote'];
        };
      };
    };
  };
  getRaitVote: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitVote'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitVote: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitVote: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitVoteDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitVote'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitOralArgument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitOralArgument'][];
        };
      };
    };
  };
  createRaitOralArgument: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitOralArgumentDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitOralArgument'];
        };
      };
    };
  };
  getRaitOralArgument: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitOralArgument'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitOralArgument: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitOralArgument: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitOralArgumentDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitOralArgument'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  listRaitMinutes: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitMinutes'][];
        };
      };
    };
  };
  createRaitMinutes: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitMinutesDto'];
      };
    };
    responses: {
      /** @description created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitMinutes'];
        };
      };
    };
  };
  getRaitMinutes: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitMinutes'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  removeRaitMinutes: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description deleted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateRaitMinutes: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateRaitMinutesDto'];
      };
    };
    responses: {
      /** @description ok */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RaitMinutes'];
        };
      };
      /** @description not found */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
