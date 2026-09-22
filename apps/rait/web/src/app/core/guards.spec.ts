// R-0012 TASK-0005 (Inspector). Critérios C-2A-15…24 do contrato `CTG-0002a.md` §11 sobre
// `core/guards/*.guard.ts`, `core/session.facade.ts` e `core/role-home.ts`. Falha esperada
// nesta entrega: nenhum desses arquivos de produção existe ainda (TASK-0006).
import { readFileSync } from 'node:fs';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  UrlSegment,
  type ActivatedRouteSnapshot,
  type CanActivateFn,
  type CanMatchFn,
  type Route,
  type RouterStateSnapshot,
} from '@angular/router';
import {
  STYNX_ANGULAR_AUTH_OPTIONS,
  StynxSessionService,
} from '@stynx-nyx/angular-auth';
import { describe, expect, it } from 'vitest';
import {
  ROLE_HOME_FIXTURE,
  GROUP_REDIRECT_FIXTURE,
  type RaitRoleCode,
} from '../../testing/route-manifest.fixture';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import { createSessionStub } from '../../testing/session.stub';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import {
  createRaitRouterHarness,
  substituteRouteParams,
  FIXED_ENTITY_ID,
} from '../../testing/router-harness';
import { APP_SRC_ROOT } from '../../testing/kb';
// Produção (TASK-0006): ainda não existe.
import { roleGuard, FORBIDDEN_ROUTE } from './guards/role.guard';
import { raitAuthGuard, LOGIN_ROUTE } from './guards/auth.guard';
import { caseAccessGuard } from './guards/case-access.guard';
import {
  rolesFromClaims,
  RaitSessionFacade,
  StynxRaitSessionFacade,
} from './session.facade';
import { roleHomeFor, ROLE_HOME } from './role-home';

/**
 * Providers de `StynxSessionService` (`*stynxHasPermission`, usada pelas páginas reais de
 * TASK-0015) para os `it`s de C-2A-23/24 que navegam até destinos concedidos — sem isso, a
 * página no destino final lança `NullInjectorError` ao injetar `StynxSessionService`. Permissões
 * são a união das de cada papel de `roles` (fixture); `role as RaitRoleCode` porque `Object.
 * entries`/negativos como `'DPO'` alargam o tipo para `string` (`'DPO'` não tem linha na
 * fixture — `?? []`).
 */
function stynxProviderFor(roles: readonly string[]) {
  const permissions = [
    ...new Set(
      roles.flatMap(
        (role) => ROLE_PERMISSIONS_FIXTURE[role as RaitRoleCode] ?? [],
      ),
    ),
  ];
  return {
    provide: StynxSessionService,
    useValue: createStynxSessionStub({
      active: true,
      permissions,
      claims: { roles: [...roles] },
    }),
  };
}

function runCanActivate(
  guard: CanActivateFn,
  url = '/x',
): ReturnType<CanActivateFn> {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );
}

function runCanMatch(
  guard: CanMatchFn,
  segments: UrlSegment[],
): ReturnType<CanMatchFn> {
  return TestBed.runInInjectionContext(() =>
    guard({} as Route, segments, {} as never),
  );
}

function configureWithSession(roles: readonly string[]) {
  const session = createSessionStub({ active: true, roles });
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: RaitSessionFacade, useValue: session },
    ],
  });
  return session;
}

describe('C-2A-15 — roleGuard: união de papéis (ADR-0005)', () => {
  it('dado roleGuard(["rait-chair"]) e sessão ["rait-analyst","rait-chair"] quando canActivate então true', () => {
    configureWithSession(['rait-analyst', 'rait-chair']);
    const result = runCanActivate(roleGuard(['rait-chair']) as CanActivateFn);
    expect(result).toBe(true);
  });

  it('dado roleGuard(["rait-chair"]) e sessão ["rait-analyst"] quando canActivate então UrlTree "/sem-permissao?de=/x"', () => {
    configureWithSession(['rait-analyst']);
    const router = TestBed.inject(Router);
    const result = runCanActivate(
      roleGuard(['rait-chair']) as CanActivateFn,
      '/x',
    );
    expect(result).toEqual(
      router.parseUrl(`${FORBIDDEN_ROUTE}?de=${encodeURIComponent('/x')}`),
    );
  });
});

describe("C-2A-16 — roleGuard('all')", () => {
  it("dado roleGuard('all') e sessão roles ['DPO'] quando canActivate então UrlTree /sem-permissao", () => {
    configureWithSession(['DPO']);
    const router = TestBed.inject(Router);
    const result = runCanActivate(roleGuard('all') as CanActivateFn, '/x');
    expect(result).toEqual(
      router.parseUrl(`${FORBIDDEN_ROUTE}?de=${encodeURIComponent('/x')}`),
    );
  });

  it("dado roleGuard('all') e sessão roles [] quando canActivate então UrlTree /sem-permissao", () => {
    configureWithSession([]);
    const router = TestBed.inject(Router);
    const result = runCanActivate(roleGuard('all') as CanActivateFn, '/x');
    expect(result).toEqual(
      router.parseUrl(`${FORBIDDEN_ROUTE}?de=${encodeURIComponent('/x')}`),
    );
  });

  it("dado roleGuard('all') e sessão roles ['AUDITOR'] quando canActivate então true", () => {
    configureWithSession(['AUDITOR']);
    expect(runCanActivate(roleGuard('all') as CanActivateFn)).toBe(true);
  });

  it("dado roleGuard('all') e sessão roles ['agency-admin', 'DPO'] quando canActivate então true", () => {
    configureWithSession(['agency-admin', 'DPO']);
    expect(runCanActivate(roleGuard('all') as CanActivateFn)).toBe(true);
  });
});

describe('C-2A-17 — rolesFromClaims', () => {
  it('dado claims com cognito:groups e roles (com item não-string) quando rolesFromClaims então união sem repetição, não-string descartado', () => {
    expect(
      rolesFromClaims({
        'cognito:groups': ['rait-analyst', 'x'],
        roles: ['rait-chair', 'rait-analyst', 7],
      }),
    ).toEqual(['rait-analyst', 'x', 'rait-chair']);
  });

  it('dado claims { roles: "rait-chair" } (não é array) quando rolesFromClaims então []', () => {
    expect(rolesFromClaims({ roles: 'rait-chair' })).toEqual([]);
  });

  it('dado claims null quando rolesFromClaims então []', () => {
    expect(rolesFromClaims(null)).toEqual([]);
  });

  it('dado claims undefined quando rolesFromClaims então []', () => {
    expect(rolesFromClaims(undefined)).toEqual([]);
  });

  it("dado claims { 'cognito:groups': ['rait-hr'] } quando rolesFromClaims então ['rait-hr']", () => {
    expect(rolesFromClaims({ 'cognito:groups': ['rait-hr'] })).toEqual([
      'rait-hr',
    ]);
  });
});

describe('C-2A-18 — StynxRaitSessionFacade sobre StynxSessionService', () => {
  it('dado state ativo com permissions e claims quando lida então active/roles/canonicalRoles/permissions/can/hasRole corretos', () => {
    const stub = createStynxSessionStub({
      active: true,
      permissions: ['inf:rait-decision:sign'],
      claims: { 'cognito:groups': ['rait-signing-authority'] },
    });
    TestBed.configureTestingModule({
      providers: [{ provide: StynxSessionService, useValue: stub }],
    });
    const facade = TestBed.inject(RaitSessionFacade);
    expect(facade.active()).toBe(true);
    expect(facade.roles()).toEqual(['rait-signing-authority']);
    expect(facade.canonicalRoles()).toEqual(['rait-signing-authority']);
    expect(facade.permissions()).toEqual(['inf:rait-decision:sign']);
    expect(facade.can('inf:rait-decision:sign')).toBe(true);
    expect(facade.can('inf:rait-case:admit')).toBe(false);
    expect(facade.hasRole('rait-chair', 'rait-signing-authority')).toBe(true);
    stub.active.set(false);
    expect(facade.active()).toBe(false);
  });

  it('dado StynxRaitSessionFacade quando injetada então é instância de RaitSessionFacade (token abstrato)', () => {
    const stub = createStynxSessionStub();
    TestBed.configureTestingModule({
      providers: [{ provide: StynxSessionService, useValue: stub }],
    });
    const facade = TestBed.inject(RaitSessionFacade);
    expect(facade).toBeInstanceOf(StynxRaitSessionFacade);
  });
});

describe('C-2A-19 — raitAuthGuard', () => {
  it('dado sessão inativa quando raitAuthGuard então resultado = router.parseUrl(LOGIN_ROUTE)', () => {
    const session = createSessionStub({ active: false });
    const stynxStub = createStynxSessionStub({ active: false });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: RaitSessionFacade, useValue: session },
        { provide: StynxSessionService, useValue: stynxStub },
        {
          provide: STYNX_ANGULAR_AUTH_OPTIONS,
          useValue: { oidc: {}, loginRedirectRoute: LOGIN_ROUTE },
        },
      ],
    });
    const router = TestBed.inject(Router);
    const result = runCanActivate(raitAuthGuard as CanActivateFn);
    expect(result).toEqual(router.parseUrl(LOGIN_ROUTE));
  });

  it('dado sessão ativa quando raitAuthGuard então true', () => {
    const session = createSessionStub({
      active: true,
      roles: ['rait-analyst'],
    });
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: RaitSessionFacade, useValue: session },
        { provide: StynxSessionService, useValue: createStynxSessionStub() },
        {
          provide: STYNX_ANGULAR_AUTH_OPTIONS,
          useValue: { oidc: {}, loginRedirectRoute: LOGIN_ROUTE },
        },
      ],
    });
    expect(runCanActivate(raitAuthGuard as CanActivateFn)).toBe(true);
  });
});

describe('C-2A-20 — caseAccessGuard (todo R-0007 CTG-0004)', () => {
  it('dado caseAccessGuard quando chamado então true', () => {
    configureWithSession(['rait-analyst']);
    expect(runCanActivate(caseAccessGuard as CanActivateFn)).toBe(true);
  });

  it('dado o texto de core/guards/case-access.guard.ts quando lido então cita "todo(R-0007 CTG-0004)" e "OD-R12-005" e não contém "console." nem "HttpClient"', () => {
    const text = readFileSync(
      `${APP_SRC_ROOT}/app/core/guards/case-access.guard.ts`,
      'utf8',
    );
    expect(text).toContain('todo(R-0007 CTG-0004)');
    expect(text).toContain('OD-R12-005');
    expect(text).not.toContain('console.');
    expect(text).not.toContain('HttpClient');
  });
});

describe("C-2A-21 — roleGuard com onDeny: 'skip' (uso como CanMatchFn)", () => {
  it("dado roleGuard(['rait-chair'], { onDeny: 'skip' }) e sessão sem o papel quando canMatch então false (nunca UrlTree)", () => {
    configureWithSession(['rait-analyst']);
    const result = runCanMatch(
      roleGuard(['rait-chair'], { onDeny: 'skip' }) as CanMatchFn,
      [new UrlSegment('x', {})],
    );
    expect(result).toBe(false);
  });

  it("dado roleGuard(['rait-chair'], { onDeny: 'skip' }) e sessão com o papel quando canMatch então true", () => {
    configureWithSession(['rait-chair']);
    const result = runCanMatch(
      roleGuard(['rait-chair'], { onDeny: 'skip' }) as CanMatchFn,
      [new UrlSegment('x', {})],
    );
    expect(result).toBe(true);
  });
});

describe('C-2A-22 — aba inicial de /casos/:id por papel (RAIT_ROLE_PRECEDENCE)', () => {
  const cases: readonly { roles: readonly RaitRoleCode[]; tab: string }[] = [
    { roles: ['rait-analyst'], tab: 'triagem' },
    { roles: ['rait-signing-authority'], tab: 'decisao' },
    { roles: ['rait-rapporteur'], tab: 'dossie' },
    { roles: ['rait-secretary'], tab: 'resumo' },
    { roles: ['rait-analyst', 'rait-signing-authority'], tab: 'triagem' },
    { roles: ['rait-rapporteur', 'rait-signing-authority'], tab: 'dossie' },
  ];

  cases.forEach(({ roles, tab }) => {
    it(`dado /casos/${FIXED_ENTITY_ID} com sessão ${JSON.stringify(roles)} quando navegada então .../${tab} com <rait-case-layout-page> como host do outlet (CTG-0002b, C-2B-64)`, async () => {
      const session = createSessionStub({ active: true, roles });
      const harness = await createRaitRouterHarness([
        { provide: RaitSessionFacade, useValue: session },
      ]);
      await harness.navigateByUrl(`/casos/${FIXED_ENTITY_ID}`);
      const router = TestBed.inject(Router);
      expect(router.url).toBe(`/casos/${FIXED_ENTITY_ID}/${tab}`);
      // Seletor pela convenção comum de página do contrato §6 (`rait-<kebab>-page`), sem
      // importar `CaseLayoutPageComponent` (TASK-0015, ainda inexistente): um import — estático
      // ou dinâmico com especificador literal — de um módulo ausente quebra a transformação do
      // arquivo inteiro no Vite/Vitest (falha observada), não só este `it`; a checagem por tag
      // evita essa classe de falha e continua provando o mesmo fato (host do outlet).
      const host = harness.fixture.nativeElement.querySelector(
        'rait-case-layout-page',
      );
      expect(host).not.toBeNull();
    });
  });

  it('dado /casos/:id/prazos (aba explícita) com sessão [rait-analyst] quando navegada então permanece em prazos (deep-link não reescrito)', async () => {
    const session = createSessionStub({
      active: true,
      roles: ['rait-analyst'],
    });
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
    ]);
    await harness.navigateByUrl(`/casos/${FIXED_ENTITY_ID}/prazos`);
    const router = TestBed.inject(Router);
    expect(router.url).toBe(`/casos/${FIXED_ENTITY_ID}/prazos`);
  });
});

describe('C-2A-23 — roleHomeFor / roleHomeRedirectGuard', () => {
  Object.entries(ROLE_HOME_FIXTURE).forEach(([role, home]) => {
    it(`dado "/" com sessão só ${role} quando navegada então URL final = ${home}`, async () => {
      const session = createSessionStub({ active: true, roles: [role] });
      const harness = await createRaitRouterHarness([
        { provide: RaitSessionFacade, useValue: session },
        stynxProviderFor([role]),
      ]);
      await harness.navigateByUrl('/');
      const router = TestBed.inject(Router);
      expect(router.url).toBe(home);
    });
  });

  it("dado ['rait-hr', 'rait-analyst'] quando roleHomeFor então '/painel' (analyst precede hr)", () => {
    expect(roleHomeFor(['rait-hr', 'rait-analyst'])).toBe('/painel');
  });

  it("dado ['rait-finance', 'rait-manager'] quando roleHomeFor então '/gestao' (manager precede finance)", () => {
    expect(roleHomeFor(['rait-finance', 'rait-manager'])).toBe(
      ROLE_HOME['rait-manager'],
    );
  });

  it("dado ['rait-finance', 'rait-manager'] quando navegada '/' então URL final '/gestao/radar' (raiz de grupo resolvida)", async () => {
    const session = createSessionStub({
      active: true,
      roles: ['rait-finance', 'rait-manager'],
    });
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
      stynxProviderFor(['rait-finance', 'rait-manager']),
    ]);
    await harness.navigateByUrl('/');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/gestao/radar');
  });

  it("dado ['DPO'] quando navegada '/' então URL final '/sem-permissao?de=/'", async () => {
    const session = createSessionStub({ active: true, roles: ['DPO'] });
    const harness = await createRaitRouterHarness([
      { provide: RaitSessionFacade, useValue: session },
      stynxProviderFor(['DPO']),
    ]);
    await harness.navigateByUrl('/');
    const router = TestBed.inject(Router);
    expect(router.url).toBe(`/sem-permissao?de=${encodeURIComponent('/')}`);
  });

  it('dado roleHomeFor(["DPO"]) quando chamado então null (nenhum papel canônico)', () => {
    expect(roleHomeFor(['DPO'])).toBeNull();
  });
});

describe('C-2A-24 — groupRedirectGuard × GROUP_REDIRECT_FIXTURE', () => {
  // A7(c): raiz de grupo negada → UrlTree `/sem-permissao` COM `?de=<url pedida>` (contrato §4);
  // `GROUP_REDIRECT_FIXTURE` mantém `'/sem-permissao'` como marcador do caso negado — o `it`
  // compara o pathname e o query param `de` separadamente nesse caso.
  GROUP_REDIRECT_FIXTURE.forEach(({ path, role, target }) => {
    it(`dado a raiz "${path}" com sessão só ${role} quando navegada então URL final = ${target}`, async () => {
      const session = createSessionStub({ active: true, roles: [role] });
      const harness = await createRaitRouterHarness([
        { provide: RaitSessionFacade, useValue: session },
        stynxProviderFor([role]),
      ]);
      const requestedUrl = `/${substituteRouteParams(path)}`;
      await harness.navigateByUrl(requestedUrl);
      const router = TestBed.inject(Router);
      if (target === '/sem-permissao') {
        const url = new URL(router.url, 'http://localhost');
        expect(url.pathname).toBe('/sem-permissao');
        expect(url.searchParams.get('de')).toBe(requestedUrl);
      } else {
        expect(router.url).toBe(target);
      }
    });
  });
});
