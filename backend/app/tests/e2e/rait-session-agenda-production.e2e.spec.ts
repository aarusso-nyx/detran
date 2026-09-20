import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import { AppModule } from '../../src/app.module.js';

const { Client } = pg;

function requiredUrl(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for CTG-0002 e2e`);
  return value;
}

const OWNER_DATABASE_URL = requiredUrl('STYNX_OWNER_DATABASE_URL');
const APP_DATABASE_URL = requiredUrl('STYNX_APP_DATABASE_URL');
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const SESSION = '00000000-0000-7000-8000-000030000003';
const AGENDA_ITEM = '00000000-0000-7000-8000-000031000002';
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

const ROUTES = [
  ['close-agenda', `/v1/inf/rait/sessions/${SESSION}/commands/close-agenda`],
  ['open', `/v1/inf/rait/sessions/${SESSION}/commands/open`],
  ['adjourn', `/v1/inf/rait/sessions/${SESSION}/commands/adjourn`],
  [
    'convene-extraordinary',
    `/v1/inf/rait/sessions/${SESSION}/commands/convene-extraordinary`,
  ],
  ['read', `/v1/inf/rait/agenda-items/${AGENDA_ITEM}/commands/read`],
  ['view', `/v1/inf/rait/agenda-items/${AGENDA_ITEM}/commands/view`],
  ['withdraw', `/v1/inf/rait/agenda-items/${AGENDA_ITEM}/commands/withdraw`],
] as const;

type Route = { readonly method: RequestMethod; readonly path: string };

let app: INestApplication;
let owner: InstanceType<typeof Client>;

function parts(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(String)
    : [typeof value === 'string' ? value : ''];
}

function normalized(...segments: readonly string[]): string {
  return `/${segments
    .flatMap((segment) => segment.split('/'))
    .filter(Boolean)
    .join('/')}`;
}

function registeredRoutes(application: INestApplication): Route[] {
  const result: Route[] = [];
  for (const moduleRef of application.get(ModulesContainer).values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance as Record<string, unknown> | undefined;
      if (!instance) continue;
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;
      for (const key of Object.getOwnPropertyNames(prototype)) {
        const handler = prototype[key];
        const method =
          typeof handler === 'function'
            ? (Reflect.getMetadata(METHOD_METADATA, handler) as
                RequestMethod | undefined)
            : undefined;
        if (method === undefined) continue;
        for (const controllerPath of parts(
          Reflect.getMetadata(PATH_METADATA, prototype.constructor),
        )) {
          for (const handlerPath of parts(
            Reflect.getMetadata(PATH_METADATA, handler as object),
          )) {
            result.push({
              method,
              path: normalized(controllerPath, handlerPath),
            });
          }
        }
      }
    }
  }
  return result;
}

beforeAll(async () => {
  expect(new URL(OWNER_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
  expect(new URL(APP_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
  process.env.DATABASE_URL = APP_DATABASE_URL;
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000005';
  process.env.DETRAN_LOCAL_ROLES = 'rait-chair';
  owner = new Client({ connectionString: OWNER_DATABASE_URL });
  await owner.connect();
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

beforeEach(async () => {
  await owner.query('begin');
  await owner.query('set local role role_app_backend');
  await owner.query(`select set_config('app.tenant_id', $1, true)`, [TENANT]);
});

afterEach(async () => owner.query('rollback'));

afterAll(async () => {
  await app?.close();
  await owner?.end();
  delete process.env.DATABASE_URL;
  delete process.env.DETRAN_RUNTIME_PROFILE;
  delete process.env.DETRAN_LOCAL_TENANT_ID;
  delete process.env.DETRAN_LOCAL_ACTOR_ID;
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('TASK-0047 — composição HTTP de sessão e pauta', () => {
  it.each(ROUTES)(
    'dado AppModule e banco dedicado sob rollback quando POST %s é feito então o caminho é um comando HTTP registrado, não 404',
    async (_command, path) => {
      const response = await request(app.getHttpServer())
        .post(path)
        .set('If-Match', 'W/"fixture-version"')
        .set('Idempotency-Key', `task-0047-${path}`)
        .send({});

      expect(response.status).not.toBe(404);
    },
  );

  it('dado o app composto quando as sete rotas são coletadas então cada transição nominal tem exatamente um POST', () => {
    const posts = registeredRoutes(app).filter(
      (route) => route.method === RequestMethod.POST,
    );

    for (const [_command, concretePath] of ROUTES) {
      const pattern = concretePath
        .replace(SESSION, ':id')
        .replace(AGENDA_ITEM, ':id');
      expect(posts.filter((route) => route.path === pattern)).toHaveLength(1);
    }
  });
});
