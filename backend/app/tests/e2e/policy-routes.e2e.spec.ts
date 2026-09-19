import 'reflect-metadata';
import type { NestFactory } from '@nestjs/core';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * CTG-0004 §8 e §11 (R-0008, TASK-0008) — C-0004-47, C-0004-48 e C-0004-49:
 * matriz de política ⇔ rotas do escopo TEAT, nos dois sentidos (M18). Sobe o
 * `AppModule` real e lê, via `ModulesContainer` (`@nestjs/core`) +
 * `Reflect.getMetadata`, os mesmos `DETRAN_RESOURCE_METADATA_KEY`/
 * `DETRAN_ACTION_METADATA_KEY` que `DetranPolicyGuard` usa (mesma semântica
 * de precedência método > classe do `guard.getAllAndOverride`) — sem
 * `DiscoveryService`, que exigiria registrar `DiscoveryModule` em
 * `AppModule` (fora do que o Inspector pode tocar); `ModulesContainer` já é
 * um provider interno de todo `INestApplication` (nota do prompt: "via
 * DiscoveryService/Reflector … ou varrendo `app.getHttpAdapter()…_router`" —
 * esta é a variante por metadados, mais direta que o `_router` do Express).
 *
 * Este teste fica vermelho até TASK-0009 montar `MeasureCommandsController`,
 * `AlcoholCommandsController`, `TeatStreamController` e
 * `TeatIntegrationsController`, e até `policy.ts` ganhar `ops:stream:read` e
 * `ops:integration:{read,retry}` (regra 7 do prompt: nunca ajustar o teste).
 */

const TENANT_ID = '00000000-0000-7000-8000-00000000a001';
const ACTOR_ID = '00000000-0000-4000-8000-0000b0000001';
const BOAT_VICTIM = '00000000-0000-7000-8000-0000a3000001';
const { Client } = pg;
const auditClient = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'detran_r10',
});

let app: Awaited<ReturnType<typeof NestFactory.create>>;
/**
 * Segunda instância com `teat.speed_meters=on` (nota do maestro, item f):
 * `SpeedModule` só monta atrás da flag (default `false`), então
 * `inf:speed-{meter,meter-certificate,measurement}:*` nunca apareceriam
 * como rotas montadas na instância padrão — o sentido 2 acusaria "sem rota"
 * para sempre, mesmo depois de TASK-0009. As rotas dos dois apps são unidas
 * antes das duas asserções.
 */
let speedApp: Awaited<ReturnType<typeof NestFactory.create>>;
const previousEnv: Record<string, string | undefined> = {};

interface RouteEntry {
  key: string;
  controller: string;
  method: string;
}

/**
 * Adenda A-2 de CTG-0001: enquanto TASK-0007 não montar os comandos WP-B2,
 * o sentido 2 cobre somente as ações EST efetivamente montadas neste corte.
 * A lista é temporária e explícita: start, add-vehicle, add-person,
 * add-victim, record-duty, add-damage, add-witness, attach-sketch, link,
 * record, complement, validate, close, cancel, transmit, rectify, archive e
 * subject-request passam a fazer parte do gate quando as rotas forem montadas
 * em CTG-0002. Isto preserva o gate verde de CTG-0001 sem esconder as REDs
 * comportamentais de TASK-0006 em boat-crash-commands.e2e.spec.ts.
 */
const EST_CTG_0001_MOUNTED_KEYS = new Set([
  'est:crash-record:create',
  'est:crash-record:read',
  'est:crash-record:update',
  'est:crash-record:delete',
  ...[
    'crash-vehicle',
    'crash-person',
    'crash-victim',
    'crash-scene-duty',
    'crash-damage',
    'crash-witness',
    'crash-sketch',
    'crash-renaest-submission',
    'crash-subject-request',
  ].flatMap((resource) =>
    ['read', 'create', 'update', 'delete'].map(
      (action) => `est:${resource}:${action}`,
    ),
  ),
  // `crash-link` tem operations=[] no blueprint e nenhuma rota neste corte;
  // suas operações entram na allowlist quando CTG-0002 as montar.
]);

/**
 * Escopo CTG-0004 §8, com a transição EST limitada pela adenda A-2 acima, e o
 * escopo `portal:*` de R-0009 CTG-0002 §10.2 (M19, TASK-0006): todo recurso
 * `portal` exceto `complaint` (PEC, M2) entra nos dois sentidos — sentido 1
 * inclui `POST manifestations` (rota `@Public()` COM `@Resource/@Action`,
 * A4(b)); rotas públicas sem metadados (`GET brand`, `GET services[/{key}]`)
 * não têm `@Action` e nunca entram na coleta. Nenhuma exceção nova; o escopo
 * TEAT permanece intacto.
 */
function inScope(key: string): boolean {
  const [domain, resource] = key.split(':');
  if (domain === 'portal') return resource !== 'complaint';
  if (domain === 'est') return EST_CTG_0001_MOUNTED_KEYS.has(key);
  if (domain === 'ops') return resource !== 'parameter';
  if (domain !== 'inf') return false;
  if (resource.startsWith('rait-')) return false;
  const exactOrHyphenPrefix = (base: string): boolean =>
    resource === base || resource.startsWith(`${base}-`);
  return (
    exactOrHyphenPrefix('ait') ||
    exactOrHyphenPrefix('normative') ||
    exactOrHyphenPrefix('mobile-normative-package') ||
    exactOrHyphenPrefix('administrative-measure') ||
    exactOrHyphenPrefix('measure') ||
    exactOrHyphenPrefix('alcohol') ||
    exactOrHyphenPrefix('speed') ||
    resource === 'framing' ||
    resource === 'validation-rule' ||
    resource === 'agency-parameter' ||
    resource === 'document-template' ||
    resource === 'signature-policy' ||
    exactOrHyphenPrefix('tow-provider') ||
    resource === 'yard' ||
    resource === 'breathalyzer' ||
    resource === 'psychomotor-sign' ||
    resource === 'vehicle-inventory'
  );
}

/**
 * Exceção declarada pelo contrato (§8): `ops:evidence-access-request:update`
 * "casa pelo sentido 1" (rota → regra). Na leitura de hoje,
 * `evidence-access-request.controller.ts` (gerado) só monta `read`
 * (list/get) — CTG-0002 §13.1 restringiu `operations` a `['list','get']` —
 * então a exceção é um no-op sobre a base de código atual; mantida como
 * allowlist do sentido 2 para não regredir se o gerador voltar a emitir
 * `update` (o texto do contrato já previa essa forma).
 */
const SENTIDO_2_ALLOWLIST = new Set(['ops:evidence-access-request:update']);

/** Chaves cuja remoção já foi pedida em CTG-0002 §8 / CTG-0003 §7 (C-0004-49). */
const REMOVED_KEYS = [
  // R-0009 CTG-0002 §10.1 (M19, ADR-0019): substituídas por portal:request:*
  'portal:appeal:create',
  'portal:appeal:read-own',
  'ops:offline-numbering-reservation:reserve',
  'ops:offline-numbering-reservation:cancel',
  'ops:snapshot-person:read',
  'ops:snapshot-person:create',
  'ops:snapshot-vehicle:read',
  'ops:snapshot-vehicle:create',
];

function collectMountedRoutes(
  modulesContainer: Iterable<{
    controllers: Map<unknown, { metatype?: unknown }>;
  }>,
  DETRAN_RESOURCE_METADATA_KEY: string,
  DETRAN_ACTION_METADATA_KEY: string,
  policyKey: (resource: string, action: string) => string,
): RouteEntry[] {
  const routes: RouteEntry[] = [];
  for (const module of modulesContainer) {
    for (const wrapper of module.controllers.values()) {
      const metatype = wrapper.metatype as
        (Function & { name: string }) | undefined;
      if (!metatype) continue;
      const classResource = Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        metatype,
      ) as string | undefined;
      const prototype = (metatype as unknown as { prototype: object })
        .prototype;
      for (const methodName of Object.getOwnPropertyNames(prototype)) {
        if (methodName === 'constructor') continue;
        const handler = (prototype as Record<string, unknown>)[methodName];
        if (typeof handler !== 'function') continue;
        const action = Reflect.getMetadata(
          DETRAN_ACTION_METADATA_KEY,
          handler,
        ) as string | undefined;
        if (!action) continue;
        const methodResource = Reflect.getMetadata(
          DETRAN_RESOURCE_METADATA_KEY,
          handler,
        ) as string | undefined;
        const resource = methodResource ?? classResource;
        if (!resource) continue;
        try {
          routes.push({
            key: policyKey(resource, action),
            controller: metatype.name,
            method: methodName,
          });
        } catch {
          // resource mal formado (sem "domain:resource"); ignorado — não é
          // escopo deste teste (verify-controller-decorators.ts já cobre a
          // forma dos decoradores em todo o repositório).
        }
      }
    }
  }
  return routes;
}

beforeAll(async () => {
  for (const key of [
    'DETRAN_RUNTIME_PROFILE',
    'DETRAN_LOCAL_TENANT_ID',
    'DETRAN_LOCAL_ACTOR_ID',
    'DETRAN_LOCAL_ROLES',
  ]) {
    previousEnv[key] = process.env[key];
  }
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_TENANT_ID = TENANT_ID;
  process.env.DETRAN_LOCAL_ACTOR_ID = ACTOR_ID;
  process.env.DETRAN_LOCAL_ROLES = 'field-agent';

  await auditClient.connect();
  await auditClient.query(`select set_config('app.role', 'owner', false)`);

  const { NestFactory: factory } = await import('@nestjs/core');
  const { AppModule } = await import('../../src/app.module.js');
  app = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();

  const previousSpeedFlag = process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
  process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = 'on';
  speedApp = await factory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await speedApp.init();
  if (previousSpeedFlag === undefined)
    delete process.env.DETRAN_FEATURE_TEAT_SPEED_METERS;
  else process.env.DETRAN_FEATURE_TEAT_SPEED_METERS = previousSpeedFlag;
}, 30000);

afterAll(async () => {
  await app?.close();
  await speedApp?.close();
  await auditClient.end();
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('CTG-0004 §8 — política ⇔ rotas do escopo TEAT (M18)', () => {
  it('C-0004-47/48 — toda rota do escopo tem chave na matriz, e toda chave do escopo tem rota', async () => {
    const { ModulesContainer } = await import('@nestjs/core');
    const {
      DETRAN_RESOURCE_METADATA_KEY,
      DETRAN_ACTION_METADATA_KEY,
      DETRAN_POLICY_MATRIX,
      policyKey,
    } = (await import('@detran/shared')) as unknown as {
      DETRAN_RESOURCE_METADATA_KEY: string;
      DETRAN_ACTION_METADATA_KEY: string;
      DETRAN_POLICY_MATRIX: Record<string, readonly string[]>;
      policyKey: (resource: string, action: string) => string;
    };
    const modulesContainer = app.get(ModulesContainer);
    const speedModulesContainer = speedApp.get(ModulesContainer);
    const routesByKey = new Map<string, RouteEntry>();
    for (const container of [modulesContainer, speedModulesContainer]) {
      for (const route of collectMountedRoutes(
        container.values(),
        DETRAN_RESOURCE_METADATA_KEY,
        DETRAN_ACTION_METADATA_KEY,
        policyKey,
      )) {
        if (inScope(route.key)) routesByKey.set(route.key, route);
      }
    }
    const routes = [...routesByKey.values()];

    // Sentido 1 — rota → regra.
    const missingRules = routes.filter(
      (route) => !(route.key in DETRAN_POLICY_MATRIX),
    );

    // Sentido 2 — regra → rota.
    const mountedKeys = new Set(routes.map((route) => route.key));
    const matrixKeysInScope = Object.keys(DETRAN_POLICY_MATRIX).filter(
      (key) => inScope(key) && !SENTIDO_2_ALLOWLIST.has(key),
    );
    const missingRoutes = matrixKeysInScope.filter(
      (key) => !mountedKeys.has(key),
    );

    // Uma única asserção com as duas listas, para que a mensagem de falha
    // imprima as diferenças nos dois sentidos ao mesmo tempo (item (e) das
    // notas do maestro), em vez de parar na primeira.
    expect(
      { missingRules, missingRoutes },
      [
        'Rotas do escopo TEAT sem chave em DETRAN_POLICY_MATRIX (sentido 1):',
        ...missingRules.map(
          (route) => `  ${route.key} (${route.controller}.${route.method})`,
        ),
        'Chaves do escopo TEAT em DETRAN_POLICY_MATRIX sem rota correspondente (sentido 2):',
        ...missingRoutes.map((key) => `  ${key}`),
      ].join('\n'),
    ).toEqual({ missingRules: [], missingRoutes: [] });
  });

  it('C-0002-84 (R-0009 CTG-0002 §10.2) — toda rota @Resource/@Action de domínio portal (exceto complaint) tem regra, inclusive POST manifestations (@Public); toda regra portal:* tem rota; rotas @Public sem metadados não entram', async () => {
    const { ModulesContainer } = await import('@nestjs/core');
    const {
      DETRAN_RESOURCE_METADATA_KEY,
      DETRAN_ACTION_METADATA_KEY,
      DETRAN_PUBLIC_METADATA_KEY,
      DETRAN_POLICY_MATRIX,
      policyKey,
    } = (await import('@detran/shared')) as unknown as {
      DETRAN_RESOURCE_METADATA_KEY: string;
      DETRAN_ACTION_METADATA_KEY: string;
      DETRAN_PUBLIC_METADATA_KEY: string;
      DETRAN_POLICY_MATRIX: Record<string, readonly string[]>;
      policyKey: (resource: string, action: string) => string;
    };
    const routes = collectMountedRoutes(
      app.get(ModulesContainer).values(),
      DETRAN_RESOURCE_METADATA_KEY,
      DETRAN_ACTION_METADATA_KEY,
      policyKey,
    ).filter((route) => route.key.startsWith('portal:') && inScope(route.key));

    const missingRules = routes.filter(
      (route) => !(route.key in DETRAN_POLICY_MATRIX),
    );
    const mountedKeys = new Set(routes.map((route) => route.key));
    const missingRoutes = Object.keys(DETRAN_POLICY_MATRIX).filter(
      (key) =>
        key.startsWith('portal:') && inScope(key) && !mountedKeys.has(key),
    );
    expect(
      { missingRules, missingRoutes },
      [
        'Rotas portal:* sem chave em DETRAN_POLICY_MATRIX (sentido 1):',
        ...missingRules.map(
          (route) => `  ${route.key} (${route.controller}.${route.method})`,
        ),
        'Chaves portal:* em DETRAN_POLICY_MATRIX sem rota (sentido 2):',
        ...missingRoutes.map((key) => `  ${key}`),
      ].join('\n'),
    ).toEqual({ missingRules: [], missingRoutes: [] });

    // sentido 1 inclui a rota pública com metadados (POST manifestations → portal:manifestation:manifest)
    const manifest = routes.find(
      (route) => route.key === 'portal:manifestation:manifest',
    );
    expect(
      manifest,
      'POST manifestations montada com @Resource/@Action',
    ).toBeDefined();
    const controllers = [...app.get(ModulesContainer).values()].flatMap(
      (module) => [...module.controllers.values()],
    );
    const manifestController = controllers.find(
      (wrapper) =>
        (wrapper.metatype as { name?: string } | undefined)?.name ===
        manifest!.controller,
    );
    const handler = (
      manifestController!.metatype as unknown as {
        prototype: Record<string, unknown>;
      }
    ).prototype[manifest!.method];
    expect(
      Reflect.getMetadata(DETRAN_PUBLIC_METADATA_KEY, handler as object),
    ).toBeTruthy();

    // sentido 2: as 29 chaves de CTG-0002 §10.1 estão todas montadas (nenhuma exceção declarada)
    expect(mountedKeys.size).toBe(29);
    expect([...mountedKeys].sort()).toEqual(
      Object.keys(DETRAN_POLICY_MATRIX)
        .filter((key) => key.startsWith('portal:') && inScope(key))
        .sort(),
    );
  });

  it('C-0004-49 — as chaves de alias removidas (CTG-0002 §8, CTG-0003 §7) não existem mais na matriz', async () => {
    const { DETRAN_POLICY_MATRIX } =
      (await import('@detran/shared')) as unknown as {
        DETRAN_POLICY_MATRIX: Record<string, unknown>;
      };
    const stillPresent = REMOVED_KEYS.filter(
      (key) => key in DETRAN_POLICY_MATRIX,
    );
    expect(
      stillPresent,
      `Chaves que deveriam ter sido removidas mas ainda existem: ${stillPresent.join(', ')}`,
    ).toEqual([]);
  });
});

describe('CTG-0001 — acesso BOAT a vítima', () => {
  function boatHeaders(role: string): Record<string, string> {
    process.env.DETRAN_LOCAL_ROLES = role;
    return {
      authorization: 'Bearer local',
      'x-tenant-id': TENANT_ID,
      'idempotency-key': `boat-${role}-${Date.now()}`,
    };
  }

  it('dada vítima de fixture quando lida sem purpose então C-1-13 recusa e com purpose audita a finalidade', async () => {
    const withoutPurpose = await request(app.getHttpServer())
      .get(`/v1/est/crash/victims/${BOAT_VICTIM}`)
      .set(boatHeaders('field-agent'));
    expect(withoutPurpose.status, JSON.stringify(withoutPurpose.body)).toBe(
      400,
    );
    expect(withoutPurpose.body.code).toBe('BOAT.VICTIM_PURPOSE_REQUIRED');

    const withPurpose = await request(app.getHttpServer())
      .get(`/v1/est/crash/victims/${BOAT_VICTIM}`)
      .query({ purpose: 'revisao do atendimento de sinistro' })
      .set(boatHeaders('field-agent'));
    expect(withPurpose.status, JSON.stringify(withPurpose.body)).toBe(200);

    const audit = await auditClient.query<{ count: string }>(
      `select count(*)::text as count
         from audit.events
        where tenant_id = $1
          and entity = 'est.crash_victim'
          and details->'metadata'->>'purpose' = 'revisao do atendimento de sinistro'`,
      [TENANT_ID],
    );
    expect(Number(audit.rows[0]?.count ?? 0)).toBeGreaterThan(0);
  });

  it('dada coleção de vítimas quando lida sem purpose então C-1-13 recusa e com purpose audita a finalidade', async () => {
    const withoutPurpose = await request(app.getHttpServer())
      .get('/v1/est/crash/victims')
      .set(boatHeaders('field-agent'));
    expect(withoutPurpose.status, JSON.stringify(withoutPurpose.body)).toBe(
      400,
    );
    expect(withoutPurpose.body.code).toBe('BOAT.VICTIM_PURPOSE_REQUIRED');

    const purpose = 'consulta de vitimas do sinistro';
    const withPurpose = await request(app.getHttpServer())
      .get('/v1/est/crash/victims')
      .query({ purpose })
      .set(boatHeaders('field-agent'));
    expect(withPurpose.status, JSON.stringify(withPurpose.body)).toBe(200);

    const audit = await auditClient.query<{ count: string }>(
      `select count(*)::text as count
         from audit.events
        where tenant_id = $1
          and entity = 'est.crash_victim'
          and entity_id is null
          and details->'metadata'->>'purpose' = $2`,
      [TENANT_ID, purpose],
    );
    expect(Number(audit.rows[0]?.count ?? 0)).toBeGreaterThan(0);
  });
});
