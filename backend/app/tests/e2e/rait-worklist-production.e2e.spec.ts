import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

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
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

const NOMINAL_ROUTES = [
  ['create-schedule', '/v1/inf/rait/schedules'],
  ['publish-schedule', '/v1/inf/rait/schedules/:id/publish'],
  ['create-batch', '/v1/inf/rait/batches'],
  ['approve-batch', '/v1/inf/rait/batches/:id/approve'],
  ['accept-batch-item', '/v1/inf/rait/batches/:id/items/:caseId/accept'],
  [
    'declare-batch-item-impediment',
    '/v1/inf/rait/batches/:id/items/:caseId/impediment',
  ],
] as const;

type Route = {
  readonly method: RequestMethod;
  readonly path: string;
  readonly controller: string;
};

let app: INestApplication;
let owner: InstanceType<typeof Client>;

function pathParts(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(String)
    : [typeof value === 'string' ? value : ''];
}

function normalize(parts: readonly string[]): string {
  return `/${parts
    .flatMap((part) => part.split('/'))
    .filter(Boolean)
    .join('/')}`;
}

function routes(application: INestApplication): Route[] {
  const collected: Route[] = [];
  for (const moduleRef of application.get(ModulesContainer).values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const instance = wrapper.instance as Record<string, unknown> | undefined;
      if (!instance) continue;
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;
      const controllerPaths = pathParts(
        Reflect.getMetadata(PATH_METADATA, prototype.constructor),
      );
      for (const key of Object.getOwnPropertyNames(prototype)) {
        const handler = prototype[key];
        if (typeof handler !== 'function') continue;
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as
          RequestMethod | undefined;
        if (method === undefined) continue;
        for (const controllerPath of controllerPaths) {
          for (const handlerPath of pathParts(
            Reflect.getMetadata(PATH_METADATA, handler),
          )) {
            collected.push({
              method,
              path: normalize([controllerPath, handlerPath]),
              controller: prototype.constructor.name,
            });
          }
        }
      }
    }
  }
  return collected;
}

beforeAll(async () => {
  expect(new URL(OWNER_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
  expect(new URL(APP_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
  process.env.DATABASE_URL = APP_DATABASE_URL;
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000005';
  process.env.DETRAN_LOCAL_ROLES = 'rait-secretary';
  owner = new Client({ connectionString: OWNER_DATABASE_URL });
  await owner.connect();
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
  delete process.env.DATABASE_URL;
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ACTOR_ID;
  delete process.env.DETRAN_LOCAL_TENANT_ID;
});

describe('TASK-0060 — matriz HTTP nominal da worklist', () => {
  it('dado o app composto quando coleta as seis rotas de comando então cada rota tem exatamente um handler manuscrito e nenhum CRUD de escrita', () => {
    const posts = routes(app).filter(
      (route) => route.method === RequestMethod.POST,
    );

    for (const [command, path] of NOMINAL_ROUTES) {
      const handlers = posts.filter((route) => route.path === path);
      expect(handlers, `${command} precisa de um único POST`).toHaveLength(1);
      expect(handlers[0]?.controller).toBe('RaitWorklistCommandsController');
    }
  });
});
