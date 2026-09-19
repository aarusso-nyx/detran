import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../../src/app.module.js';

const APP_DATABASE_URL =
  'postgresql://aarusso@localhost/detran_r7_ctg1_a2?options=-c%20role%3Drole_app_backend';
const EXPECTED_DATABASE = 'detran_r7_ctg1_a2';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const AGENDA_ITEM = '00000000-0000-7000-8000-000031000002';
const MINUTES = '00000000-0000-7000-8000-000034000001';
const PATH_METADATA = 'path';
const METHOD_METADATA = 'method';

const ROUTES = [
  ['vote', '/v1/inf/rait/votes'],
  ['proclaim', `/v1/inf/rait/agenda-items/${AGENDA_ITEM}/commands/proclaim`],
  ['generate-minutes', '/v1/inf/rait/minutes'],
  ['sign-minutes', `/v1/inf/rait/minutes/${MINUTES}/commands/sign`],
  ['publish', `/v1/inf/rait/minutes/${MINUTES}/commands/publish`],
] as const;

const COMMAND_CONTROLLER = 'RaitSessionCommandsController';
const CRUD_CONTROLLERS = new Set([
  'RaitVoteController',
  'RaitMinutesController',
]);
const ORAL_ARGUMENTS_PATH = '/v1/inf/rait/oral-arguments';

type Route = {
  readonly method: RequestMethod;
  readonly path: string;
  readonly controller: string;
};

let app: INestApplication;

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
              controller: prototype.constructor.name,
            });
          }
        }
      }
    }
  }
  return result;
}

beforeAll(async () => {
  expect(new URL(APP_DATABASE_URL).pathname.slice(1)).toBe(EXPECTED_DATABASE);
  process.env.DATABASE_URL = APP_DATABASE_URL;
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = '00000000-0000-4000-8000-0000b0000005';
  process.env.DETRAN_LOCAL_ROLES = 'rait-chair';
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

afterAll(async () => {
  await app?.close();
  delete process.env.DATABASE_URL;
  delete process.env.DETRAN_RUNTIME_PROFILE;
  delete process.env.DETRAN_LOCAL_TENANT_ID;
  delete process.env.DETRAN_LOCAL_ACTOR_ID;
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('TASK-0064 — composição E2E de deliberação e ata', () => {
  it('dado AppModule no banco dedicado quando as cinco transições são coletadas então cada rota tem exatamente um POST do controller de comandos', () => {
    const posts = registeredRoutes(app).filter(
      (route) => route.method === RequestMethod.POST,
    );

    for (const [command, concretePath] of ROUTES) {
      const pattern = concretePath
        .replace(AGENDA_ITEM, ':id')
        .replace(MINUTES, ':id');
      const handlers = posts.filter((route) => route.path === pattern);
      expect(handlers, `${command} precisa de um único POST`).toHaveLength(1);
      expect(handlers[0]?.controller).toBe(COMMAND_CONTROLLER);
    }
  });

  it('dado AppModule no banco dedicado quando as rotas de voto, ata e sustentação oral são coletadas então CRUD concorrente e a superfície oral estão ausentes', () => {
    const routes = registeredRoutes(app);
    const competingCrudPosts = routes.filter(
      (route) =>
        route.method === RequestMethod.POST &&
        CRUD_CONTROLLERS.has(route.controller),
    );

    expect(competingCrudPosts).toHaveLength(0);
    expect(
      routes.filter((route) => route.path.startsWith(ORAL_ARGUMENTS_PATH)),
    ).toHaveLength(0);
  });
});
