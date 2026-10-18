// R-0033 TASK-0002 (Inspector). C-03 (faixa) / P-06 / P-22 / D-01 / D-02 (`frontend-preview-mode.md`
// §2, §4, §5, §9; prompt TASK-0002 item 3): `PreviewRootComponent` renderiza `rait-preview-bar`
// com `[data-detran-preview-mark="DETRAN_PREVIEW_MARK"]` e o texto de `rait.states.preview_mark`
// (catálogo real do app sobreposto por `preview.pt-BR.json`; textos esperados = tabela §4 do
// contrato, `PREVIEW_CATALOG_CONTRACT`); dois `<select>` nativos com `<label>` associado e opções
// = `PREVIEW_SCREEN_STATES` / `RAIT_ALL_ROLES`; mudança de `<select>` = navegação de documento
// (D-01) com `pv_estado`/`pv_papel` na URL; leitura inicial de `location.search` (D-02); a faixa
// continua presente após navegar para 3 rotas distintas. Adenda A5 item 3 (B3): em
// `/sem-permissao` a página roteada é provada pelo host `rait-forbidden-page` (sem `data-screen`,
// M14/C-2A-13); a faixa continua exigida em todas.
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it } from 'vitest';
import { readAppCatalog } from '../../testing/kb';
import { RAIT_ALL_ROLES, type RaitRoleCode } from '../app.route-manifest';
import {
  DETRAN_PREVIEW_MARK_ATTR,
  DETRAN_PREVIEW_MARK_VALUE,
  PREVIEW_MARK_KEY,
  PREVIEW_NOT_FUNCTIONAL_KEY,
} from './preview-mark';
import { PreviewRootComponent } from './preview-root.component';
import {
  PREVIEW_ROLE_PARAM,
  PREVIEW_SCREEN_STATES,
  PREVIEW_STATE_PARAM,
  PreviewStateService,
  type PreviewScreenState,
} from './preview-state.service';
import {
  configurePreview,
  FORBIDDEN_PAGE_SELECTOR,
  FORBIDDEN_ROUTE,
  inventoryRowOf,
  PREVIEW_CATALOG_CONTRACT,
  previewSpecContext,
  resetPreviewDocument,
  setPreviewDocument,
} from './preview.spec-helper';

const MARK_SELECTOR =
  'rait-preview-bar [data-detran-preview-mark="DETRAN_PREVIEW_MARK"]';
const STATE_LABEL = PREVIEW_CATALOG_CONTRACT['rait.shell.preview_state'];
const ROLE_LABEL = PREVIEW_CATALOG_CONTRACT['rait.shell.preview_role'];

afterEach(() => resetPreviewDocument());

async function renderRoot(
  path: string,
  role: RaitRoleCode,
  state: PreviewScreenState,
) {
  setPreviewDocument(path, role, state);
  const context = previewSpecContext();
  await configurePreview(context.providers);
  const fixture = TestBed.createComponent(PreviewRootComponent);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  return { fixture, navigate: context.navigate };
}

function bar(fixture: ComponentFixture<unknown>): HTMLElement {
  const element = (
    fixture.nativeElement as HTMLElement
  ).querySelector<HTMLElement>('rait-preview-bar');
  expect(element).not.toBeNull();
  return element as HTMLElement;
}

function labelTextOf(select: HTMLSelectElement): string {
  return [...(select.labels ?? [])]
    .map((label) => label.textContent?.trim() ?? '')
    .join(' ');
}

/** O `<select>` cujo `<label>` associado tem exatamente `label` (texto do contrato §4). */
function selectLabelled(
  fixture: ComponentFixture<unknown>,
  label: string,
): HTMLSelectElement {
  const selects = [...bar(fixture).querySelectorAll('select')].filter(
    (select) => labelTextOf(select) === label,
  );
  expect(selects).toHaveLength(1);
  return selects[0] as HTMLSelectElement;
}

describe('C-03 — constantes da marca (preview-mark.ts)', () => {
  it('dado preview-mark.ts quando lido então os quatro nomes têm os valores do layout fixo (M4)', () => {
    expect(DETRAN_PREVIEW_MARK_ATTR).toBe('data-detran-preview-mark');
    expect(DETRAN_PREVIEW_MARK_VALUE).toBe('DETRAN_PREVIEW_MARK');
    expect(PREVIEW_MARK_KEY).toBe('rait.states.preview_mark');
    expect(PREVIEW_NOT_FUNCTIONAL_KEY).toBe(
      'rait.states.preview_not_functional',
    );
  });

  it('dado preview-state.service.ts quando lido então PREVIEW_SCREEN_STATES na ordem loaded, empty, loading, error, forbidden e os parâmetros pv_estado/pv_papel', () => {
    expect([...PREVIEW_SCREEN_STATES]).toEqual([
      'loaded',
      'empty',
      'loading',
      'error',
      'forbidden',
    ]);
    expect(PREVIEW_STATE_PARAM).toBe('pv_estado');
    expect(PREVIEW_ROLE_PARAM).toBe('pv_papel');
  });
});

describe('C-03 — faixa no PreviewRootComponent (P-06)', () => {
  it('dado a raiz de prévia em /painel sob rait-analyst quando renderizada então rait-preview-bar tem a marca DETRAN_PREVIEW_MARK com o texto "PRÉVIA — DADOS FICTÍCIOS"', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    const mark = (fixture.nativeElement as HTMLElement).querySelector(
      MARK_SELECTOR,
    );
    expect(mark).not.toBeNull();
    expect(mark?.textContent).toContain(
      PREVIEW_CATALOG_CONTRACT['rait.states.preview_mark'],
    );
  });

  it('dado a faixa renderizada quando inspecionada então é uma section role="region" com aria-label "Controles da prévia"', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    const region = bar(fixture).querySelector('section[role="region"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-label')).toBe(
      PREVIEW_CATALOG_CONTRACT['rait.shell.preview_region'],
    );
    expect(region?.getAttribute('data-detran-preview-mark')).toBe(
      'DETRAN_PREVIEW_MARK',
    );
  });

  it('dado a faixa renderizada quando inspecionada então tem um <p role="status"> para o registro de ações', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    expect(bar(fixture).querySelector('p[role="status"]')).not.toBeNull();
  });

  const ROUTES = ['painel', 'casos/:id/dossie', FORBIDDEN_ROUTE] as const;

  it(`dado a raiz de prévia sob rait-analyst quando navegada para ${ROUTES.length} rotas distintas (inventário §3) então a faixa continua presente após cada navegação e a página roteada aparece sob ela`, async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    const router = TestBed.inject(Router);
    for (const route of ROUTES) {
      const path = inventoryRowOf(route).previewPath;
      await router.navigateByUrl(path);
      await fixture.whenStable();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector(MARK_SELECTOR), path).not.toBeNull();
      if (route === FORBIDDEN_ROUTE) {
        expect(
          root.querySelector(FORBIDDEN_PAGE_SELECTOR),
          path,
        ).not.toBeNull();
        expect(root.querySelector('[data-screen]'), path).toBeNull();
      } else {
        expect(root.querySelector('[data-screen]'), path).not.toBeNull();
      }
      expect(router.url.split('?')[0]).toBe(path);
    }
  });
});

describe('C-03/C-05 — seletores nativos de estado e papel', () => {
  it('dado a faixa quando inspecionada então exatamente dois <select>, cada um com <label> associado ("Estado da tela", "Papel da sessão")', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    expect(bar(fixture).querySelectorAll('select')).toHaveLength(2);
    expect(selectLabelled(fixture, STATE_LABEL)).toBeInstanceOf(
      HTMLSelectElement,
    );
    expect(selectLabelled(fixture, ROLE_LABEL)).toBeInstanceOf(
      HTMLSelectElement,
    );
  });

  it('dado o seletor de estado quando inspecionado então as opções são PREVIEW_SCREEN_STATES na ordem, com os rótulos rait.shell.preview_state_<estado>', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    const options = [...selectLabelled(fixture, STATE_LABEL).options];
    expect(options.map((option) => option.value)).toEqual([
      ...PREVIEW_SCREEN_STATES,
    ]);
    expect(options.map((option) => option.textContent?.trim())).toEqual(
      PREVIEW_SCREEN_STATES.map(
        (state) =>
          PREVIEW_CATALOG_CONTRACT[`rait.shell.preview_state_${state}`],
      ),
    );
  });

  it('dado o seletor de papel quando inspecionado então as opções são RAIT_ALL_ROLES na ordem, com os rótulos rait.role.<código> do catálogo do app', async () => {
    const { fixture } = await renderRoot('/painel', 'rait-analyst', 'loaded');
    const catalog = readAppCatalog();
    const options = [...selectLabelled(fixture, ROLE_LABEL).options];
    expect(options.map((option) => option.value)).toEqual([...RAIT_ALL_ROLES]);
    expect(options.map((option) => option.textContent?.trim())).toEqual(
      RAIT_ALL_ROLES.map((role) => catalog[`rait.role.${role}`]),
    );
  });

  it('dado location.search com pv_estado=error e pv_papel=AUDITOR quando a prévia inicia então PreviewStateService.state()="error", role()="AUDITOR" e os <select> refletem os dois (D-02)', async () => {
    const { fixture } = await renderRoot('/conta', 'AUDITOR', 'error');
    const service = TestBed.inject(PreviewStateService);
    expect(service.state()).toBe('error');
    expect(service.role()).toBe('AUDITOR');
    expect(selectLabelled(fixture, STATE_LABEL).value).toBe('error');
    expect(selectLabelled(fixture, ROLE_LABEL).value).toBe('AUDITOR');
  });

  it('dado location.search com pv_estado e pv_papel fora dos catálogos quando a prévia inicia então os padrões loaded e rait-analyst (D-02) [negativo]', async () => {
    window.history.replaceState(
      null,
      '',
      `/painel?${PREVIEW_STATE_PARAM}=desconhecido&${PREVIEW_ROLE_PARAM}=DPO`,
    );
    await configurePreview(previewSpecContext().providers);
    const service = TestBed.inject(PreviewStateService);
    expect(service.state()).toBe('loaded');
    expect(service.role()).toBe('rait-analyst');
  });

  it('dado /painel em loaded quando o <select> de estado muda para forbidden então PREVIEW_DOCUMENT_NAVIGATE recebe a URL atual com pv_estado=forbidden mesclado (D-01)', async () => {
    const { fixture, navigate } = await renderRoot(
      '/painel',
      'rait-analyst',
      'loaded',
    );
    await TestBed.inject(Router).navigateByUrl(
      inventoryRowOf('painel').previewUrl,
    );
    await fixture.whenStable();
    const select = selectLabelled(fixture, STATE_LABEL);
    select.value = 'forbidden';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledTimes(1);
    const target = new URL(navigate.mock.calls[0]?.[0] ?? '', 'http://x');
    expect(target.pathname).toBe('/painel');
    expect(target.searchParams.get(PREVIEW_STATE_PARAM)).toBe('forbidden');
    expect(target.searchParams.get(PREVIEW_ROLE_PARAM)).toBe('rait-analyst');
  });

  it('dado /painel sob rait-analyst em error quando o <select> de papel muda para rait-secretary então PREVIEW_DOCUMENT_NAVIGATE recebe /?pv_papel=rait-secretary&pv_estado=error (D-01)', async () => {
    const { fixture, navigate } = await renderRoot(
      '/painel',
      'rait-analyst',
      'error',
    );
    const select = selectLabelled(fixture, ROLE_LABEL);
    select.value = 'rait-secretary';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledTimes(1);
    const target = new URL(navigate.mock.calls[0]?.[0] ?? '', 'http://x');
    expect(target.pathname).toBe('/');
    expect(target.searchParams.get(PREVIEW_ROLE_PARAM)).toBe('rait-secretary');
    expect(target.searchParams.get(PREVIEW_STATE_PARAM)).toBe('error');
  });
});
