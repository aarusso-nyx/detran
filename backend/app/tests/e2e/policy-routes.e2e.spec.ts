import 'reflect-metadata';
import type { NestFactory } from '@nestjs/core';
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
 * Escopo TEAT do teste (CTG-0004 §8, transcrito literalmente — nada além
 * dos prefixos listados entra em nenhuma das duas direções).
 */
function inScope(key: string): boolean {
  const [domain, resource] = key.split(':');
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
});

afterAll(async () => {
  await app?.close();
  await speedApp?.close();
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
