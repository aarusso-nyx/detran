import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

const { Client } = pg;
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const APP_ROLE_OPTION = '-c role=role_app_backend';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

type ExpectedRoute = {
  readonly path: string;
  readonly command: string;
};
type CollectedRoute = {
  readonly method: RequestMethod;
  readonly path: string;
  readonly controller: string;
  readonly handler: string;
};

const EXPECTED_ROUTES: readonly ExpectedRoute[] = [
  { path: '/v1/inf/rait/schedules', command: 'create-schedule' },
  {
    path: '/v1/inf/rait/schedules/:id/publish',
    command: 'publish-schedule',
  },
  { path: '/v1/inf/rait/batches', command: 'create-batch' },
  {
    path: '/v1/inf/rait/batches/:id/approve',
    command: 'approve-batch',
  },
  {
    path: '/v1/inf/rait/batches/:id/items/:caseId/accept',
    command: 'accept-batch-item',
  },
  {
    path: '/v1/inf/rait/batches/:id/items/:caseId/impediment',
    command: 'declare-batch-item-impediment',
  },
  {
    path: '/v1/inf/rait/batches/:id/commands/draw',
    command: 'draw-regression',
  },
  {
    path: '/v1/inf/rait/assignments/:id/commands/reassign',
    command: 'reassign-regression',
  },
];

let app: INestApplication;
let owner: InstanceType<typeof Client>;

function requiredUrl(name: string): URL {
  const raw = process.env[name];
  if (!raw) throw new Error(`${name} is required for CTG-0002 HTTP RED`);
  return new URL(raw);
}

function normalizePath(parts: readonly string[]): string {
  return `/${parts
    .flatMap((part) => part.split('/'))
    .filter(Boolean)
    .join('/')}`;
}

function paths(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [typeof value === 'string' ? value : ''];
}

function collectRoutes(application: INestApplication): CollectedRoute[] {
  const modules = application.get(ModulesContainer);
  const routes: CollectedRoute[] = [];
  for (const moduleRef of modules.values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance as Record<string, unknown> | undefined;
      if (!instance) continue;
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;
      const controllerPaths = paths(
        Reflect.getMetadata(PATH_METADATA, prototype.constructor),
      );
      for (const handler of Object.getOwnPropertyNames(prototype)) {
        if (handler === 'constructor') continue;
        const target = prototype[handler];
        if (typeof target !== 'function') continue;
        const method = Reflect.getMetadata(METHOD_METADATA, target) as
          RequestMethod | undefined;
        if (method === undefined) continue;
        const handlerPaths = paths(Reflect.getMetadata(PATH_METADATA, target));
        for (const controllerPath of controllerPaths) {
          for (const handlerPath of handlerPaths) {
            routes.push({
              method,
              path: normalizePath([controllerPath, handlerPath]),
              controller: prototype.constructor.name,
              handler,
            });
          }
        }
      }
    }
  }
  return routes;
}

beforeAll(async () => {
  const ownerUrl = requiredUrl('STYNX_OWNER_DATABASE_URL');
  const appUrl = requiredUrl('STYNX_APP_DATABASE_URL');
  expect(ownerUrl.pathname.slice(1)).toBe(EXPECTED_DATABASE);
  expect(appUrl.pathname.slice(1)).toBe(EXPECTED_DATABASE);
  expect(ownerUrl.username).toBeTruthy();
  expect(appUrl.username).toBeTruthy();
  expect(ownerUrl.searchParams.get('options')).not.toBe(APP_ROLE_OPTION);
  expect(appUrl.searchParams.get('options')).toBe(APP_ROLE_OPTION);
  expect(ownerUrl.toString()).not.toBe(appUrl.toString());
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000005';
  process.env.DETRAN_LOCAL_ROLES = 'rait-secretary';
  owner = new Client({ connectionString: ownerUrl.toString() });
  await owner.connect();
  const ownerIdentity = await owner.query<{
    current_user_name: string;
    current_role_name: string;
  }>(
    `select current_user as current_user_name, current_role as current_role_name`,
  );
  expect(ownerIdentity.rows[0]?.current_user_name).not.toBe('role_app_backend');
  expect(ownerIdentity.rows[0]?.current_role_name).not.toBe('role_app_backend');
  const appConnection = new Client({ connectionString: appUrl.toString() });
  await appConnection.connect();
  try {
    const appIdentity = await appConnection.query<{
      current_user_name: string;
      current_role_name: string;
    }>(
      `select current_user as current_user_name, current_role as current_role_name`,
    );
    expect(appIdentity.rows[0]).toEqual({
      current_user_name: 'role_app_backend',
      current_role_name: 'role_app_backend',
    });
  } finally {
    await appConnection.end();
  }
  const fixtures = await owner.query<{ cases: string }>(
    `select count(*)::text as cases from inf.rait_case
      where tenant_id = $1
        and id::text like '00000000-0000-7000-8000-0000100000%'`,
    [TENANT],
  );
  expect(fixtures.rows[0]?.cases).toBe('20');
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  await owner?.end();
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ACTOR_ID;
  delete process.env.DETRAN_LOCAL_TENANT_ID;
});

describe('CTG-0002 worklist command HTTP ownership', () => {
  it('dado o app composto quando coleta as oito rotas de comando então há testes e nenhum caminho fica ausente', () => {
    expect(EXPECTED_ROUTES).toHaveLength(8);
    const routes = collectRoutes(app).filter(
      (route) => route.method === RequestMethod.POST,
    );

    for (const expected of EXPECTED_ROUTES) {
      expect(
        routes.filter((route) => route.path === expected.path),
        `${expected.command} não foi coletado como POST`,
      ).toHaveLength(1);
    }
  });

  it('dado comandos CTG-0002 quando o app composto coleta seus donos então cada rota é manuscrita, única e não cai no CRUD gerado', () => {
    const routes = collectRoutes(app).filter(
      (route) => route.method === RequestMethod.POST,
    );
    for (const expected of EXPECTED_ROUTES) {
      const handlers = routes.filter((route) => route.path === expected.path);
      expect(
        handlers,
        `${expected.command} não pode ter rota duplicada`,
      ).toHaveLength(1);
      expect(handlers[0]).toMatchObject({
        controller: 'RaitWorklistCommandsController',
      });
    }
  });
});
