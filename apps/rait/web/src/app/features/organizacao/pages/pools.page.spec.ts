// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 50, §8 — C-2B-62.
// `PoolsPageComponent` (IU-RAIT-048) ainda não existe (TASK-0015): falha de módulo esperada.
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

const URL = '/v1/inf/rait/pools';

async function render() {
  const harness = await createRaitRouterHarness(
    pageProviders('rait-coordinator', [
      provideHttpClient(),
      provideHttpClientTesting(),
    ]),
  );
  const navigation = harness.navigateByUrl(
    `/${substituteRouteParams('organizacao/pools')}`,
  );
  const http = TestBed.inject(HttpTestingController);
  const req = await navigation.then(() =>
    http.expectOne({ method: 'GET', url: URL }),
  );
  return { harness, req, http };
}

describe('PoolsPage — nenhum botão, a11y', () => {
  it('dado o cliente responde [] quando renderizada então nenhum [data-action] e nenhuma violação a11y', async () => {
    const { harness, req, http } = await render();
    req.flush([]);
    harness.detectChanges();
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
    http.verify();
  });
});
