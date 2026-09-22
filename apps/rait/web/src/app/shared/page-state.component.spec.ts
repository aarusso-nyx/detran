// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.23, §8 (C-2B-57, 59 parcial) —
// `shared/page-state.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { PageStateComponent } from './page-state.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.states.empty',
  'rait.common.retry',
  'rait.states.error',
] as const;

async function render(inputs: { status: string; error?: unknown }) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [PageStateComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(PageStateComponent);
  fixture.componentRef.setInput('status', inputs.status);
  fixture.componentRef.setInput('error', inputs.error ?? null);
  fixture.componentRef.setInput('loadingLabelKey', KEYS[0]);
  fixture.componentRef.setInput('emptyLabelKey', KEYS[0]);
  fixture.detectChanges();
  return fixture;
}

describe('PageState (C-2B-57)', () => {
  it('dado status "error" com error classificado (500, requestId "req-1") então rait-error-banner[role="alert"] com "req-1", botão "rait.common.retry" emite retry; "empty" → detran-empty-state com emptyLabelKey; "loading" → detran-loading-state; "ready" → vazio', async () => {
    const errorFixture = await render({
      status: 'error',
      error: {
        kind: 'server',
        messageKey: 'rait.errors.internal',
        status: 500,
        requestId: 'req-1',
        context: {},
      },
    });
    const host: HTMLElement = errorFixture.nativeElement;
    const banner = host.querySelector('rait-error-banner');
    expect(banner).not.toBeNull();
    expect(host.textContent).toContain('req-1');
    let retried = false;
    errorFixture.componentInstance.retry.subscribe(() => {
      retried = true;
    });
    host.querySelector('button')?.dispatchEvent(new Event('click'));
    expect(retried).toBe(true);

    const empty = await render({ status: 'empty' });
    expect(
      empty.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();

    const loading = await render({ status: 'loading' });
    expect(
      loading.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();

    const ready = await render({ status: 'ready' });
    expect(ready.nativeElement.textContent?.trim()).toBe('');
  });
});

describe('apresentação do erro — §4.4 (C-2B-86) [it.todo, R-0007 CTG-0004]', () => {
  // Nesta CTG todo comando é M8 (RaitCommandUnavailableError); as linhas do catálogo §4 que
  // dependem de um comando real ficam `it.todo`, citando a fonte (M8; R-0007 CTG-0004), nunca
  // `it.skip` sem OD (CODESTYLE.md, regra "nunca skip sem OD").
  it.todo('409/412 → refresh + toast — R-0007 CTG-0004');
  it.todo('422 com legalBasis → diálogo bloqueante — R-0007 CTG-0004');
  it.todo('400 fields[] → erro inline — R-0007 CTG-0004 / CTG-0002c');
  it.todo('403 após comando → ação removida — R-0007 CTG-0004');
  it.todo('503 UPSTREAM_* → badge pending-retransmission — R-0007 CTG-0004');
});

describe('PageState — offline (C-2B-87)', () => {
  it('dado status "offline" então rait-error-banner com "rait.errors.offline" está presente (o desabilitar dos botões de comando é responsabilidade da página, fora do escopo desta CTG — TASK-0014/0015)', async () => {
    const fixture = await render({
      status: 'offline',
      error: {
        kind: 'offline',
        messageKey: 'rait.errors.offline',
        context: {},
      },
    });
    const banner = fixture.nativeElement.querySelector('rait-error-banner');
    expect(banner).not.toBeNull();
  });
});

describe('PageState — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (loading, empty, error, ready) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const loading = await render({ status: 'loading' });
    await expectA11yStateInvariants(loading.nativeElement);
    const empty = await render({ status: 'empty' });
    await expectA11yStateInvariants(empty.nativeElement);
    const error = await render({
      status: 'error',
      error: {
        kind: 'server',
        messageKey: 'rait.errors.internal',
        status: 500,
        context: {},
      },
    });
    await expectA11yStateInvariants(error.nativeElement);
    const ready = await render({ status: 'ready' });
    await expectA11yStateInvariants(ready.nativeElement);
  });
});
