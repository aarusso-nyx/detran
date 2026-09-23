// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 72, §8 — C-2B-74/80.
// Sem HTTP (RaitSessionFacade, sem cliente); tema por `setDetranTheme` +
// `localStorage['rait.theme']` (mesma regra do shell, `core/rait-shell.component.ts`
// `THEME_STORAGE_KEY`). `AccountPageComponent` (IU-RAIT-018) ainda não existe (TASK-0015): falha
// de módulo esperada.
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import { pageProviders } from '../../../../testing/facade.stub';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';

const THEME_STORAGE_KEY = 'rait.theme';

async function render(role: string) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      provideHttpClient(),
      provideHttpClientTesting(),
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('conta')}`);
  return harness;
}

describe('AccountPage — C-2B-74 (papéis, tema, sem HTTP) [negativo]', () => {
  it("dado pageProviders('rait-chair') quando renderizada então lista o papel como rait.role.rait-chair, nenhuma requisição HTTP, e o botão field.theme alterna data-detran-theme e grava localStorage['rait.theme']", async () => {
    const harness = await render('rait-chair');
    const host = harness.routeNativeElement as HTMLElement;
    expect(host.textContent ?? '').toContain('rait.role.rait-chair');

    const before = document.documentElement.dataset['detranTheme'];
    host
      .querySelector<HTMLButtonElement>('[data-field="theme"]')
      ?.dispatchEvent(new Event('click'));
    harness.detectChanges();
    const after = document.documentElement.dataset['detranTheme'];
    expect(after).not.toBe(before);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(after);

    const http = TestBed.inject(HttpTestingController);
    http.expectNone(() => true);
  });
});

describe('AccountPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const harness = await render('rait-analyst');
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
