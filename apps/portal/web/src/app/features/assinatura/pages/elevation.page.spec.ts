// R-0014 TASK-0017 (Inspector). CTG-0003c §6 T-27 (`ElevationPageComponent`); página real, ainda
// inexistente (§1) — "Cannot find module" até TASK-0018 (esperado, §9). `window.location.assign`
// substituído por um stub configurável (jsdom não permite `spyOn` direto em `Location.assign`).
import { ElevationPageComponent } from './elevation.page'; // §9.
import { TestBed } from '@angular/core/testing';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../../app.routes';
import { SessionFacade } from '../../../core/session.facade';
import { createSessionFacadeStub } from '../../../../testing/session-facade.stub';
import { createPortalRouterHarness } from '../../../../testing/router-harness';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';

const catalog = portalCatalog as Record<string, string>;

function stubLocationAssign(): { assign: ReturnType<typeof vi.fn> } {
  const assign = vi.fn();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, assign },
  });
  return { assign };
}

async function mount(
  assuranceLevel: 'simples' | 'avancada' = 'simples',
  query = '?retomar=%2Finicio',
) {
  const sessionFacade = createSessionFacadeStub({
    active: true,
    assuranceLevel,
  });
  const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
    ElevationPageComponent,
    { provide: SessionFacade, useValue: sessionFacade },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ]);
  await TestBed.inject(StynxI18nService).initialize();
  await harness.navigate(`/assinatura/elevacao${query}`);
  return { harness, sessionFacade };
}

describe('T-27 — data-screen (§1 inv.; M8)', () => {
  it('dado a rota /assinatura/elevacao então host [data-screen]="T-27"', async () => {
    // C-3c-100 (T-27)
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
  });
});

describe('T-27 — início da elevação navega para o gov.br (§3.8; UC-019 3)', () => {
  it('dado o caminho biométrico escolhido então location.assign(redirectUrl) é chamado (stub)', async () => {
    const { assign } = stubLocationAssign();
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    const biometricButton = root.querySelector<HTMLButtonElement>(
      '[data-method="biometric"]',
    );
    expect(biometricButton).not.toBeNull();
    biometricButton!.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalled());
  });
});

async function allFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await allFiles(full)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

describe('T-27 — DOM sem bronze/prata/ouro em condição (RN-102 a) [negativo]', () => {
  it('dado a página montada então o DOM não contém os atributos/condições com bronze, prata ou ouro', async () => {
    // C-3c-62 (parte de DOM)
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    for (const attribute of Array.from(root.querySelectorAll('*'))) {
      for (const name of attribute.getAttributeNames()) {
        if (name.startsWith('data-') || name.startsWith('aria-')) {
          expect(
            /bronze|prata|ouro/i.test(attribute.getAttribute(name) ?? ''),
          ).toBe(false);
        }
      }
    }
    const dir = dirname(fileURLToPath(import.meta.url));
    const files = await allFiles(dir);
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      expect(/\b(bronze|prata|ouro)\b/i.test(source), file).toBe(false);
    }
  });
});

describe('T-27 — a11y por estado (§6/§7.3 — cobertura integral: idle, carregando (starting), erro_recuperavel, indisponivel)', () => {
  it('dado o estado inicial (idle) então axe sem violação serious/critical', async () => {
    const { harness } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it('dado carregando (starting — POST elevations em curso) então axe sem violação serious/critical', async () => {
    const { harness, sessionFacade } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    sessionFacade.requestElevationMock.mockImplementationOnce(
      () => new Promise(() => {}), // nunca resolve — mantém a fase 'starting'.
    );
    const biometricButton = root.querySelector<HTMLButtonElement>(
      '[data-method="biometric"]',
    )!;
    biometricButton.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() =>
      expect(sessionFacade.requestElevationMock).toHaveBeenCalled(),
    );
    await expectA11yStateInvariants(root, catalog);
  });

  it("dado start('biometric') falhar então erro_recuperavel com os caminhos restantes oferecidos e axe sem violação serious/critical", async () => {
    const { harness, sessionFacade } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    sessionFacade.requestElevationMock.mockRejectedValueOnce(
      Object.assign(new Error('500'), {
        status: 500,
        error: { code: 'PORTAL.INTERNAL', status: 500, message: 'erro' },
      }),
    );
    const biometricButton = root.querySelector<HTMLButtonElement>(
      '[data-method="biometric"]',
    )!;
    biometricButton.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t27.state.erro_recuperavel'],
      ),
    );
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });

  it('dado 422 SERVICE_UNAVAILABLE{elevacao_govbr_pendente_r0014} então indisponivel e axe sem violação serious/critical [negativo: nenhuma navegação simulada]', async () => {
    const { assign } = stubLocationAssign();
    const { harness, sessionFacade } = await mount();
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.getAttribute('data-screen')).toBe('T-27'),
    );
    sessionFacade.requestElevationMock.mockRejectedValueOnce(
      Object.assign(new Error('422'), {
        status: 422,
        error: {
          code: 'PORTAL.SERVICE_UNAVAILABLE',
          status: 422,
          message: 'erro',
          context: { unavailableReason: 'elevacao_govbr_pendente_r0014' },
        },
      }),
    );
    const biometricButton = root.querySelector<HTMLButtonElement>(
      '[data-method="biometric"]',
    )!;
    biometricButton.dispatchEvent(new Event('click', { bubbles: true }));
    await vi.waitFor(() =>
      expect(root.textContent).toContain(
        catalog['portal.screens.t27.state.indisponivel'],
      ),
    );
    // A12(b) — metade DOM de C-3c-58: AlternativeChannelNote presente e nenhuma navegação disparada.
    expect(
      root.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(assign).not.toHaveBeenCalled();
    await expectA11yStateInvariants(root, catalog, {
      errorBannerFocused: true,
    });
  });
});
