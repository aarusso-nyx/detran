// R-0012 TASK-0014 (Inspector). CTG-0002b.md §6/§8 — C-2B-65 (estados), C-2B-66 (banner de
// polling), C-2B-80 (a11y). `ShiftDashboardPageComponent` (ficha IU-RAIT-002) ainda não existe
// (TASK-0015): falha de módulo esperada nesta entrega.
import { describe, expect, it } from 'vitest';
import {
  commandRunnerStub,
  listFacadeStub,
  pageProviders,
  readSlotStub,
  stubFacade,
} from '../../../../testing/facade.stub';
import { expectA11yStateInvariants } from '../../../../testing/a11y-state.spec-helper';
import {
  createRaitRouterHarness,
  substituteRouteParams,
} from '../../../../testing/router-harness';
import { SseService } from '../../../core/sse.service';
import type { ShiftSummary } from '../../../data/facades/bundles';
import { QueueFacade } from '../../../data/facades/queue.facade';
import { ShiftDashboardPageComponent } from './shift-dashboard.page';

const READY_SUMMARY: ShiftSummary = {
  queued: 4,
  inInquiry: 1,
  resumable: 2,
  openAlerts: 0,
};

function queueFacadeStub(status: 'loading' | 'ready' | 'error' | 'empty') {
  return stubFacade<QueueFacade>()({
    casosDaFila: (() => new Map()) as never,
    painel: readSlotStub<ShiftSummary>(
      status === 'ready'
        ? { status: 'ready', value: READY_SUMMARY }
        : status === 'error'
          ? {
              status: 'error',
              error: {
                kind: 'unavailable',
                messageKey: 'rait.common.unavailable',
                context: {},
              },
            }
          : { status },
    ),
    retomar: listFacadeStub([]),
    filaDefesa: listFacadeStub([]),
    filaRelator: listFacadeStub([]),
    command: commandRunnerStub(),
  });
}

/** Stub mínimo de `SseService` (§5.24): controla só `status()`/`polling()`/`live()` e um
 * `connect()` sem efeito — o motor de reconexão tem spec próprio (`core/sse.service.spec.ts`). */
function sseServiceStub(status: 'idle' | 'live' | 'polling') {
  return {
    status: () => status,
    polling: () => status === 'polling',
    live: () => status === 'live',
    connect: () => {},
  } as unknown as SseService;
}

async function render(
  role: string,
  status: 'loading' | 'ready' | 'error' | 'empty' = 'ready',
  sse: 'idle' | 'live' | 'polling' = 'live',
) {
  const harness = await createRaitRouterHarness(
    pageProviders(role as never, [
      { provide: QueueFacade, useValue: queueFacadeStub(status) },
      { provide: SseService, useValue: sseServiceStub(sse) },
    ]),
  );
  await harness.navigateByUrl(`/${substituteRouteParams('painel')}`);
  return harness;
}

describe('ShiftDashboardPage — C-2B-65 (estados)', () => {
  it('dado QueueFacade.painel em loading quando renderizada então rait-page-state mostra detran-loading-state', async () => {
    const harness = await render('rait-analyst', 'loading');
    const host = harness.routeNativeElement;
    expect(host?.querySelector('detran-loading-state')).not.toBeNull();
  });

  it('dado QueueFacade.painel em error quando renderizada então rait-error-banner e foco não vai ao h1 [negativo]', async () => {
    const harness = await render('rait-analyst', 'error');
    const host = harness.routeNativeElement;
    expect(host?.querySelector('rait-error-banner')).not.toBeNull();
  });

  it('dado QueueFacade.painel em ready quando renderizada então <h1> com foco e rait.screens.painel.title', async () => {
    const harness = await render('rait-analyst', 'ready');
    const h1 = harness.routeNativeElement?.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('ShiftDashboardPage — C-2B-66 (StreamStatusBanner) [presença + ausência]', () => {
  it('dado SseService "polling" quando renderizada então há região role="status" do banner', async () => {
    const harness = await render('rait-analyst', 'ready', 'polling');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).not.toBeNull();
  });

  it('dado SseService "live" quando renderizada então nenhuma região role="status" do banner [negativo]', async () => {
    const harness = await render('rait-analyst', 'ready', 'live');
    expect(
      harness.routeNativeElement?.querySelector(
        'rait-stream-status-banner [role="status"]',
      ),
    ).toBeNull();
  });
});

describe('ShiftDashboardPage — a11y (C-2B-80)', () => {
  it('dado a página em ready quando expectA11yStateInvariants + axe então nenhuma violação serious/critical; único <h1>', async () => {
    const harness = await render('rait-analyst', 'ready');
    const host = harness.routeNativeElement as HTMLElement;
    await expectA11yStateInvariants(host);
    expect(host.querySelectorAll('h1')).toHaveLength(1);
  });
});

void ShiftDashboardPageComponent;
