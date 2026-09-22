// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/guards.spec.ts" (C-02-19..22; C-01-07).
// Funções de guarda de rota do Angular exigem contexto de injeção — cada avaliação roda por
// `TestBed.runInInjectionContext` (padrão dos guardas funcionais do Angular 22).
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type UrlTree } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import { authGuard, LOGIN_ROUTE } from './guards/auth.guard.js';
import { permissionGuard } from './guards/permission.guard.js';
import { layerGuard } from './guards/layer.guard.js';
import {
  DashboardSessionFacade,
  StynxDashboardSessionFacade,
} from './session.facade.js';
import { createStynxSessionStub } from '../../testing/stynx-session.stub.js';
import { DETRAN_ROLES_FIXTURE } from '../../testing/roles.fixture.js';

function setUp(stub: ReturnType<typeof createStynxSessionStub>): void {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: StynxSessionService, useValue: stub },
      {
        provide: DashboardSessionFacade,
        useClass: StynxDashboardSessionFacade,
      },
    ],
  });
}

const FAKE_ROUTE = {} as never;
const FAKE_STATE = (url: string) => ({ url }) as never;

describe('core/guards.spec.ts', () => {
  it('dado authGuard quando sessão inativa então router.parseUrl(LOGIN_ROUTE); ativa então true (C-02-19)', () => {
    setUp(createStynxSessionStub({ active: false }));
    const router = TestBed.inject(Router);
    const inactiveResult = TestBed.runInInjectionContext(() =>
      authGuard(FAKE_ROUTE, FAKE_STATE('/monitoramento')),
    );
    expect(inactiveResult).toEqual(router.parseUrl(LOGIN_ROUTE));

    setUp(createStynxSessionStub({ active: true }));
    const activeResult = TestBed.runInInjectionContext(() =>
      authGuard(FAKE_ROUTE, FAKE_STATE('/monitoramento')),
    );
    expect(activeResult).toBe(true);
  });

  it("dado permissionGuard('dashboard:alert:read') quando permissions batem então true; [] então UrlTree /sem-permissao com de=; permissionGuard(null) então UrlTree sempre (C-02-20)", () => {
    for (const permissions of [
      ['dashboard:alert:read'],
      ['*'],
      ['dashboard:alert:*'],
    ]) {
      setUp(createStynxSessionStub({ active: true, permissions }));
      const result = TestBed.runInInjectionContext(() =>
        permissionGuard('dashboard:alert:read')(
          FAKE_ROUTE,
          FAKE_STATE('/monitoramento/x'),
        ),
      );
      expect(result).toBe(true);
    }

    setUp(createStynxSessionStub({ active: true, permissions: [] }));
    const router = TestBed.inject(Router);
    const denied = TestBed.runInInjectionContext(() =>
      permissionGuard('dashboard:alert:read')(
        FAKE_ROUTE,
        FAKE_STATE('/monitoramento/x'),
      ),
    ) as UrlTree;
    expect(denied).toEqual(
      router.createUrlTree(['/monitoramento/sem-permissao'], {
        queryParams: { de: '/monitoramento/x' },
      }),
    );

    setUp(createStynxSessionStub({ active: true, permissions: ['*'] }));
    const nullPolicy = TestBed.runInInjectionContext(() =>
      permissionGuard(null)(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(nullPolicy.toString()).toContain('sem-permissao');
  });

  it("dado layerGuard('N1') quando roles [dash-operator] então true; [rait-analyst] então UrlTree; layerGuard('N2') com [technical-admin] então UrlTree (passe não alcança camada); layerGuard(null) então UrlTree; layerGuard não lê permissions (C-02-21, C-01-07)", () => {
    setUp(
      createStynxSessionStub({
        active: true,
        claims: { 'cognito:groups': ['dash-operator'] },
      }),
    );
    const allowed = TestBed.runInInjectionContext(() =>
      layerGuard('N1')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    );
    expect(allowed).toBe(true);

    setUp(
      createStynxSessionStub({
        active: true,
        claims: { 'cognito:groups': ['rait-analyst'] },
      }),
    );
    const denied = TestBed.runInInjectionContext(() =>
      layerGuard('N1')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(denied.toString()).toContain('sem-permissao');

    setUp(
      createStynxSessionStub({
        active: true,
        claims: { 'cognito:groups': ['technical-admin'] },
      }),
    );
    const deniedByLayer = TestBed.runInInjectionContext(() =>
      layerGuard('N2')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(deniedByLayer.toString()).toContain('sem-permissao');

    setUp(
      createStynxSessionStub({ active: true, permissions: ['*'], claims: {} }),
    );
    const nullAccess = TestBed.runInInjectionContext(() =>
      layerGuard(null)(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(nullAccess.toString()).toContain('sem-permissao');

    // permissions ['*'] mas roles [] em 'N1': layerGuard nunca lê permissions.
    setUp(
      createStynxSessionStub({
        active: true,
        permissions: ['*'],
        claims: { 'cognito:groups': [] },
      }),
    );
    const permissionsIgnored = TestBed.runInInjectionContext(() =>
      layerGuard('N1')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(permissionsIgnored.toString()).toContain('sem-permissao');
  });

  it.each(DETRAN_ROLES_FIXTURE)(
    "dado layerGuard('N3') quando avaliado com o papel isolado %s então UrlTree sempre (C-02-22, C-01-07)",
    (role) => {
      setUp(
        createStynxSessionStub({
          active: true,
          claims: { 'cognito:groups': [role] },
        }),
      );
      const result = TestBed.runInInjectionContext(() =>
        layerGuard('N3')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
      ) as UrlTree;
      expect(result.toString()).toContain('sem-permissao');
    },
  );

  it("dado layerGuard('N3') quando avaliado com [ADMIN, GESTOR_DETRAN, AUDITOR] então UrlTree sempre (C-02-22)", () => {
    setUp(
      createStynxSessionStub({
        active: true,
        claims: { 'cognito:groups': ['ADMIN', 'GESTOR_DETRAN', 'AUDITOR'] },
      }),
    );
    const result = TestBed.runInInjectionContext(() =>
      layerGuard('N3')(FAKE_ROUTE, FAKE_STATE('/monitoramento/x')),
    ) as UrlTree;
    expect(result.toString()).toContain('sem-permissao');
  });

  it("dado o manifesto quando lido então nenhuma entrada declara access 'N3' (C-02-22)", async () => {
    const { DASHBOARD_ROUTE_MANIFEST_FIXTURE } =
      await import('../../testing/route-manifest.fixture.js');
    expect(
      DASHBOARD_ROUTE_MANIFEST_FIXTURE.some(
        (entry) => entry.access === ('N3' as never),
      ),
    ).toBe(false);
  });
});
