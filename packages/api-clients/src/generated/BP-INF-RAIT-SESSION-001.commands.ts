// Generated from docs/framework/contracts/BP-INF-RAIT-SESSION-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/inf/rait/sessions/{id}/commands/close-agenda': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitSessionCloseAgenda'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/sessions/{id}/commands/open': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitSessionOpen'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/sessions/{id}/commands/adjourn': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitSessionAdjourn'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/sessions/{id}/commands/convene-extraordinary': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitSessionConveneExtraordinary'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/agenda-items/{id}/commands/read': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitAgendaItemRead'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/agenda-items/{id}/commands/view': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitAgendaItemView'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/agenda-items/{id}/commands/withdraw': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitAgendaItemWithdraw'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/votes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitVoteCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/agenda-items/{id}/commands/proclaim': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitAgendaItemProclaim'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/minutes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitMinutesCreate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/minutes/{id}/commands/sign': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitMinutesSign'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/inf/rait/minutes/{id}/commands/publish': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['raitMinutesPublish'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: never;
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  raitSessionCloseAgenda: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pauta fechada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitSessionOpen: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessão aberta */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitSessionAdjourn: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessão adiada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitSessionConveneExtraordinary: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessão extraordinária convocada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitAgendaItemRead: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Relatoria lida */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitAgendaItemView: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Vista registrada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitAgendaItemWithdraw: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Item retirado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitVoteCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Voto registrado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitAgendaItemProclaim: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resultado proclamado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitMinutesCreate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Ata preparada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitMinutesSign: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Ata assinada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  raitMinutesPublish: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Ata publicada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
