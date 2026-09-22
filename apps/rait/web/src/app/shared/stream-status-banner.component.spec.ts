// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.24, §8 (C-2B-58, 59 parcial) —
// `shared/stream-status-banner.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada. `SseService` real com `createStreamTransportStub` (mesmo padrão de
// `core/sse.service.spec.ts`): duas falhas do transporte em 60 s levam a `polling()` true.
import { TestBed } from '@angular/core/testing';
import { StreamStatusBannerComponent } from './stream-status-banner.component';
import { RaitStreamTransport } from '../core/stream-transport';
import { POLLING_INTERVAL_MS } from '../core/sse.service';
import { createStreamTransportStub } from '../../testing/stream-transport.stub';
import {
  buildTestCatalog,
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = ['rait.states.stream_unavailable'] as const;

async function render() {
  const transport = createStreamTransportStub();
  TestBed.configureTestingModule({
    imports: [StreamStatusBannerComponent, markerI18nModule([...KEYS])],
    providers: [{ provide: RaitStreamTransport, useValue: transport }],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(StreamStatusBannerComponent);
  fixture.detectChanges();
  return { fixture, transport };
}

describe('StreamStatusBanner (C-2B-58)', () => {
  it('dado SseService em "polling" (duas falhas em 60 s) então stynx-banner role="status" com "rait.states.stream_unavailable" {seconds: 15}; em "live" nada [negativo]', async () => {
    const { fixture, transport } = await render();
    expect(fixture.nativeElement.querySelector('stynx-banner')).toBeNull();

    vi.useFakeTimers();
    transport.current()?.error(new Error('falha 1'));
    vi.advanceTimersByTime(1_000);
    transport.current()?.error(new Error('falha 2'));
    vi.useRealTimers();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('stynx-banner');
    expect(banner).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[role="status"]'),
    ).not.toBeNull();
    // Com `markerI18nModule` o catálogo devolve só o marcador da chave (sem o template
    // "{seconds}" real) — afirma-se o marcador, não o número '15' literal (A10 item g). O
    // parâmetro passado (`seconds: POLLING_INTERVAL_MS / 1000`) fica documentado aqui como
    // fonte, já que o helper de marcadores não expõe os parâmetros recebidos por `translate`.
    expect(fixture.nativeElement.textContent).toContain(
      buildTestCatalog([...KEYS])['rait.states.stream_unavailable'],
    );
    expect(POLLING_INTERVAL_MS / 1000).toBe(15);
  });
});

describe('StreamStatusBanner — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (live, sem banner) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const { fixture } = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
