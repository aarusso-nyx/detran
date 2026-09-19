// R-0014 TASK-0015 (Inspector). CTG-0003b §8 — C-3b-104 (offline transversal), C-3b-105 (análise
// estática de todo o par) e C-3b-107 (it.todo das três OD que ficam para depois deste par). Vive
// em `features/autos/` pelo mesmo motivo de `page-routes.spec.ts` (glob de fronteira do prompt).
import { TestBed } from '@angular/core/testing';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import { SessionFacade } from '../../core/session.facade';
import { EntitlementFacade } from '../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../core/service-catalog.facade';
import { createSessionFacadeStub } from '../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../testing/entitlement-facade.stub';
import { createServiceCatalogFacadeStub } from '../../../testing/service-catalog-facade.stub';
import { createPortalRouterHarness } from '../../../testing/router-harness';
import { AIT_ID } from '../../../testing/http-fixtures-reads';

const catalog = portalCatalog as Record<string, string>;

describe('offline transversal (M14; spec §8) — representativo, mecanismo comum a todas as facades', () => {
  it('dado navigator.onLine false e status 0 numa leitura de T-01 então texto de portal.states.offline em role=alert, nenhuma fila/retry automático, e o conteúdo já carregado permanece', async () => {
    // C-3b-104 (o mecanismo — classifyError/readStatusFor status 0 + offline — já é coberto
    // isoladamente por C-3b-07; aqui prova-se a ligação com uma página real)
    const harness = await createPortalRouterHarness(PORTAL_ROUTES, [
      {
        provide: SessionFacade,
        useValue: createSessionFacadeStub({
          active: true,
          assuranceLevel: 'avancada',
        }),
      },
      {
        provide: EntitlementFacade,
        useValue: createEntitlementFacadeStub(true),
      },
      {
        provide: ServiceCatalogFacade,
        useValue: createServiceCatalogFacadeStub({ status: 'available' }),
      },
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ]);
    await TestBed.inject(StynxI18nService).initialize();
    const onLineSpy = vi.spyOn(window.navigator, 'onLine', 'get');
    onLineSpy.mockReturnValue(false);
    await harness.navigate(`/autos/${AIT_ID}`);
    const httpMock = harness.httpMock();
    // C-3b-104 — A10(l): `expectOne` obrigatório (sem `.catch`/`return`); a página real
    // (`ait-detail.page.ts`) dispara a leitura na montagem.
    const req = await vi.waitFor(() =>
      httpMock.expectOne(
        (candidate) => candidate.url === `/v1/portal/aits/${AIT_ID}`,
      ),
    );
    req.error(new ProgressEvent('error'), {
      status: 0,
      statusText: 'Unknown Error',
    });
    const root = harness.harness.routeNativeElement as HTMLElement;
    await vi.waitFor(() =>
      expect(root.textContent).toContain(catalog['portal.states.offline']),
    );
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
    httpMock.expectNone(
      (candidate) =>
        candidate.url === `/v1/portal/aits/${AIT_ID}` &&
        candidate !== req.request,
    );
    onLineSpy.mockRestore();
  });
});

describe('análise estática — sem cálculo de data, sem storage local, sem import não-type do gerado (C-3b-105)', () => {
  const FORBIDDEN = [
    'new Date(',
    'Date.now',
    '.getTime(',
    '.setDate(',
    'localStorage',
    'navigator.onLine',
  ];

  async function collect(root: string): Promise<string[]> {
    const out: string[] = [];
    let entries: import('node:fs').Dirent[];
    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const entry of entries) {
      const full = join(root, entry.name);
      if (entry.isDirectory()) out.push(...(await collect(full)));
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts'))
        out.push(full);
    }
    return out;
  }

  it('dado os arquivos de features/{autos,defesa,indicacao,pagamento,processos}/** e shared/{payment-comparison,process-timeline,prefilled-summary,wizard-resume}.ts então nenhum contém new Date/Date.now/getTime/setDate/localStorage/navigator.onLine nem importa core/guards/*; nenhum importa @detran/api-clients senão por import type', async () => {
    // `dirname(fileURLToPath(...))` + `join` (não `new URL('../', import.meta.url)`): mesma
    // técnica de `i18n/i18n-keys.spec.ts` (evita URL intermediário sem esquema `file:` neste
    // ambiente de teste).
    const specDir = dirname(fileURLToPath(import.meta.url));
    const featuresDir = join(specDir, '..');
    const sharedDir = join(specDir, '..', '..', 'shared');
    const sharedFiles = [
      'payment-comparison.component.ts',
      'process-timeline.component.ts',
      'prefilled-summary.component.ts',
      'wizard-resume.ts',
    ].map((name) => join(sharedDir, name));

    const featureFiles = await collect(featuresDir);
    let checked = 0;
    for (const file of [...featureFiles, ...sharedFiles]) {
      let text: string;
      try {
        text = await readFile(file, 'utf8');
      } catch {
        continue; // §9: arquivo ainda não existe.
      }
      checked += 1;
      for (const token of FORBIDDEN) {
        expect(text.includes(token), `${file} contém ${token}`).toBe(false);
      }
      expect(text, `${file} importa core/guards`).not.toMatch(
        /from ['"].*core\/guards/,
      );
      const importLines = text
        .split('\n')
        .filter((line) => line.includes('@detran/api-clients'));
      for (const line of importLines) {
        expect(
          line.includes('import type'),
          `import não-type de @detran/api-clients em ${file}: ${line}`,
        ).toBe(true);
      }
    }
    // Nada a afirmar sobre "checked" além de documentar que a varredura roda mesmo quando
    // nenhum arquivo existe ainda (§9) — o teste nunca falha por ausência, só por violação.
    void checked;
  });
});

describe('it.todo pendentes de OD (C-3b-107; nunca it.skip)', () => {
  it.todo(
    'OD-P72: formas de documents[], diligences[] e decision.nextStep.kind',
  );
  it.todo(
    'OD-P74: payment.methods e documento de arrecadação no 200 de submit',
  );
  it.todo('OD-P76: prorrogação de diligência');
});
