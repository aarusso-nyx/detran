import { expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  type CanMatchFn,
  type Route,
  type UrlSegment,
} from '@angular/router';
import {
  BOAT_ROUTE_PATHS,
  D05_ROUTE_PATH,
} from '../testing/route-contract.fixture';
import * as routesRuntime from './app.routes';
import { loadConcreteRoutes } from '../testing/concrete-routes';
import {
  fixtureBootstrapReady,
  guardContextPort,
} from '../testing/guard-fixtures';
import { TEAT_GUARD_CONTEXT } from './core/bootstrap.store';
import { TEAT_BOAT_EXTENSION } from './navigation/guards/readiness.guard';

type BoatExtension = {
  installed: () => boolean;
  load: (route: string) => Promise<unknown>;
};

const runtime = routesRuntime as unknown as Record<string, unknown>;
const resolveBoatRoute = runtime['resolveBoatRoute'] as
  ((path: string, extension: BoatExtension) => Promise<unknown>) | undefined;
const resolveDisabledRoute = runtime['resolveDisabledRoute'] as
  ((path: string) => unknown) | undefined;

for (const path of BOAT_ROUTE_PATHS) {
  it(`dada extensão BOAT instalada quando resolve ${path} então chama load uma vez e retorna seu componente`, async () => {
    expect(resolveBoatRoute).toBeTypeOf('function');
    const component = { route: path };
    const extension: BoatExtension = {
      installed: vi.fn().mockReturnValue(true),
      load: vi.fn().mockResolvedValue(component),
    };
    await expect(resolveBoatRoute?.(path, extension)).resolves.toEqual({
      kind: 'loaded',
      component,
    });
    expect(extension.load).toHaveBeenCalledTimes(1);
    expect(extension.load).toHaveBeenCalledWith(path);
  });

  it(`dada extensão BOAT ausente quando resolve ${path} então não carrega e retorna unavailable`, async () => {
    expect(resolveBoatRoute).toBeTypeOf('function');
    const extension: BoatExtension = {
      installed: vi.fn().mockReturnValue(false),
      load: vi.fn(),
    };
    await expect(resolveBoatRoute?.(path, extension)).resolves.toEqual({
      kind: 'unavailable',
    });
    expect(extension.load).not.toHaveBeenCalled();
  });
}

it('dado path não-BOAT quando resolve então não consulta nem carrega extensão e retorna unavailable', async () => {
  expect(resolveBoatRoute).toBeTypeOf('function');
  const extension: BoatExtension = { installed: vi.fn(), load: vi.fn() };
  await expect(resolveBoatRoute?.('home', extension)).resolves.toEqual({
    kind: 'unavailable',
  });
  expect(extension.installed).not.toHaveBeenCalled();
  expect(extension.load).not.toHaveBeenCalled();
});

it('dada rejeição do adaptador BOAT quando instalado então a rejeição propaga sem placeholder', async () => {
  expect(resolveBoatRoute).toBeTypeOf('function');
  const failure = new Error('adapter failed');
  const extension: BoatExtension = {
    installed: vi.fn().mockReturnValue(true),
    load: vi.fn().mockRejectedValue(failure),
  };
  await expect(resolveBoatRoute?.(BOAT_ROUTE_PATHS[0], extension)).rejects.toBe(
    failure,
  );
});

it('dado D-05 quando resolve rota disabled então retorna unavailable sem loader/client; outro path é not-disabled', async () => {
  expect(resolveDisabledRoute).toBeTypeOf('function');
  expect(resolveDisabledRoute?.(`/${D05_ROUTE_PATH}`)).toEqual({
    kind: 'unavailable',
  });
  expect(resolveDisabledRoute?.('/home')).toEqual({ kind: 'not-disabled' });
  const d05 = (await loadConcreteRoutes()).find(
    (route) => route.path === D05_ROUTE_PATH,
  );
  expect(d05?.loadComponent).toBeUndefined();
  expect(d05?.data).toMatchObject({
    featureEnabled: false,
    state: 'unavailable',
  });
});

it('dadas rotas BOAT quando registradas então navegação direta usa canMatch de extensão e fallback acessível, sem placeholder TEAT', async () => {
  const routes = await loadConcreteRoutes();
  for (const path of BOAT_ROUTE_PATHS) {
    const route = routes.find((candidate) => candidate.path === path);
    const guard = route?.canMatch?.find(
      (candidate) =>
        typeof candidate === 'function' && candidate.name === 'readinessGuard',
    ) as CanMatchFn | undefined;
    expect(guard).toBeTypeOf('function');
    const invoke = (installed: boolean) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          {
            provide: TEAT_GUARD_CONTEXT,
            useValue: guardContextPort(fixtureBootstrapReady()),
          },
          {
            provide: TEAT_BOAT_EXTENSION,
            useValue: { installed: () => installed, load: vi.fn() },
          },
        ],
      });
      return TestBed.runInInjectionContext(() =>
        guard?.(
          route as Route,
          [] as UrlSegment[],
          {} as Parameters<CanMatchFn>[2],
        ),
      );
    };
    expect(invoke(false)).not.toBe(true);
    expect(invoke(true)).toBe(true);
    expect(route?.data).toMatchObject({
      boatExtension: true,
      state: 'unavailable',
    });
  }
});
