// R-0012 TASK-0014 (Inspector, iteração restrita 3). CTG-0002b.md §6 linha 66, §8 —
// C-2B-65/67/80. Nenhuma ação. `AuditTrailPageComponent` (IU-RAIT-060) ainda não existe
// (TASK-0015): falha de módulo esperada.
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  delegateListLoad,
  listFacadeStub,
  pageProviders,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { AuditFacade } from '../../../data/facades/audit.facade';
import type { RaitCaseEvent } from '../../../data/models';

function auditFacadeStub(items: readonly RaitCaseEvent[] = []) {
  const trilha = listFacadeStub(items);
  return stubFacade<AuditFacade>()({
    trilha,
    loadTrail: delegateListLoad(trilha),
    command: commandRunnerStub(),
  });
}

async function render(facade = auditFacadeStub(), query = '') {
  const harness = await createRaitRouterHarness(
    pageProviders('AUDITOR', [{ provide: AuditFacade, useValue: facade }]),
  );
  await harness.navigateByUrl(
    `/${substituteRouteParams('auditoria/trilha')}${query}`,
  );
  return { harness, facade };
}

describe('AuditTrailPage — C-2B-65 (estados)', () => {
  it('dado trilha vazia quando renderizada então detran-empty-state', async () => {
    const { harness } = await render(auditFacadeStub([]));
    expect(
      harness.routeNativeElement?.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('AuditTrailPage — C-2B-67 (URL ↔ ListFacade)', () => {
  it('dado navegação com ?filtro=case_id:x então setQuery/load chamada', async () => {
    const { facade } = await render(auditFacadeStub(), '?filtro=case_id:x');
    const calls = [
      ...facade.trilha.loadMock.mock.calls,
      ...facade.trilha.setQueryMock.mock.calls,
    ];
    expect(calls.length).toBeGreaterThan(0);
  });
});

describe('AuditTrailPage — nenhuma ação [negativo] e a11y (C-2B-80)', () => {
  it('dado a página renderizada quando lida então nenhum [data-action], rait-event-timeline presente e nenhuma violação a11y', async () => {
    const { harness } = await render(
      auditFacadeStub([{ id: 'e1' } as unknown as RaitCaseEvent]),
    );
    expect(
      harness.routeNativeElement?.querySelectorAll('[data-action]'),
    ).toHaveLength(0);
    expect(
      harness.routeNativeElement?.querySelector('rait-event-timeline'),
    ).not.toBeNull();
    await expectA11yStateInvariants(harness.routeNativeElement as HTMLElement);
  });
});
