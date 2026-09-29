// Generated from docs/framework/contracts/BP-CH-OPERATIONAL-CONTROLS-001.commands.openapi.json. Do not edit.
export interface paths {
  '/v1/ch/operational-controls/records': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/operational-controls/records */
    post: operations['pecPostChOperationalControlsRecords'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/operational-controls/clinic-location/validate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/operational-controls/clinic-location/validate */
    post: operations['pecPostChOperationalControlsClinicLocationValidate'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/operational-controls/dashboard': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/ch/operational-controls/dashboard */
    get: operations['pecGetChOperationalControlsDashboard'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/audit/events': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/audit/events */
    get: operations['pecGetAuditEvents'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/audit/events/export': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/audit/events/export */
    get: operations['pecGetAuditEventsExport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/admin/users/cognito */
    get: operations['pecGetAdminUsersCognito'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/groups/all': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/admin/users/cognito/groups/all */
    get: operations['pecGetAdminUsersCognitoGroupsAll'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    /** GET /v1/admin/users/cognito/{username} */
    get: operations['pecGetAdminUsersCognitoByUsername'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** PATCH /v1/admin/users/cognito/{username} */
    patch: operations['pecPatchAdminUsersCognitoByUsername'];
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/groups': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    /** GET /v1/admin/users/cognito/{username}/groups */
    get: operations['pecGetAdminUsersCognitoByUsernameGroups'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/block': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/admin/users/cognito/{username}/block */
    post: operations['pecPostAdminUsersCognitoByUsernameBlock'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/unblock': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/admin/users/cognito/{username}/unblock */
    post: operations['pecPostAdminUsersCognitoByUsernameUnblock'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/groups/{group}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
        group: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/admin/users/cognito/{username}/groups/{group} */
    post: operations['pecPostAdminUsersCognitoByUsernameGroupsByGroup'];
    /** DELETE /v1/admin/users/cognito/{username}/groups/{group} */
    delete: operations['pecDeleteAdminUsersCognitoByUsernameGroupsByGroup'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/verify': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/admin/users/cognito/{username}/verify */
    post: operations['pecPostAdminUsersCognitoByUsernameVerify'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/cognito/{username}/reset-password': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/admin/users/cognito/{username}/reset-password */
    post: operations['pecPostAdminUsersCognitoByUsernameResetPassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/admin/process-parameters': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/ch/admin/process-parameters */
    get: operations['pecGetChAdminProcessParameters'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/admin/process-parameters/{key}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        key: string;
      };
      cookie?: never;
    };
    get?: never;
    /** PUT /v1/ch/admin/process-parameters/{key} */
    put: operations['pecPutChAdminProcessParametersByKey'];
    post?: never;
    /** DELETE /v1/ch/admin/process-parameters/{key} */
    delete: operations['pecDeleteChAdminProcessParametersByKey'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/transmissions/dispatch': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/transmissions/dispatch */
    post: operations['pecPostChTransmissionsDispatch'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/transmissions/callbacks/renach': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/transmissions/callbacks/renach */
    post: operations['pecPostChTransmissionsCallbacksRenach'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/ch/transmissions/callbacks/toxicology': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** POST /v1/ch/transmissions/callbacks/toxicology */
    post: operations['pecPostChTransmissionsCallbacksToxicology'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** GET /v1/admin/users */
    get: operations['pecGetAdminUsers'];
    put?: never;
    /** POST /v1/admin/users */
    post: operations['pecPostAdminUsers'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/v1/admin/users/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** DELETE /v1/admin/users/{id} */
    delete: operations['pecDeleteAdminUsersById'];
    options?: never;
    head?: never;
    /** PATCH /v1/admin/users/{id} */
    patch: operations['pecPatchAdminUsersById'];
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
  pecPostChOperationalControlsRecords: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChOperationalControlsClinicLocationValidate: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetChOperationalControlsDashboard: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAuditEvents: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAuditEventsExport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAdminUsersCognito: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAdminUsersCognitoGroupsAll: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAdminUsersCognitoByUsername: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchAdminUsersCognitoByUsername: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAdminUsersCognitoByUsernameGroups: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsersCognitoByUsernameBlock: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsersCognitoByUsernameUnblock: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsersCognitoByUsernameGroupsByGroup: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
        group: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecDeleteAdminUsersCognitoByUsernameGroupsByGroup: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
        group: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsersCognitoByUsernameVerify: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsersCognitoByUsernameResetPassword: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        username: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetChAdminProcessParameters: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPutChAdminProcessParametersByKey: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        key: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecDeleteChAdminProcessParametersByKey: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        key: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChTransmissionsDispatch: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChTransmissionsCallbacksRenach: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostChTransmissionsCallbacksToxicology: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecGetAdminUsers: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPostAdminUsers: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecDeleteAdminUsersById: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  pecPatchAdminUsersById: {
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
      /** @description Resposta atual do controlador; corpo a caracterizar na TASK-0002 */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
}
