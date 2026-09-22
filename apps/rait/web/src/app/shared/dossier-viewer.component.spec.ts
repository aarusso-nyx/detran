// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.6, §8 (C-2B-39, 59 parcial) —
// `shared/dossier-viewer.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { DossierViewerComponent } from './dossier-viewer.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.originRequester',
  'rait.common.originOfficial',
  'rait.states.empty',
] as const;

function document(origin: 'requerente' | 'oficio', filename: string) {
  return {
    id: filename,
    origin,
    filename,
    content_hash: `hash-${filename}`,
    attached_at: '2026-09-14T12:00:00-04:00',
    digitised_from_paper: false,
    kind: 'requerimento',
  };
}

async function render(inputs: {
  documents: readonly unknown[];
  documentUrlOf?: ((doc: unknown) => string | null) | null;
  status?: string;
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [DossierViewerComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(DossierViewerComponent);
  fixture.componentRef.setInput('documents', inputs.documents);
  fixture.componentRef.setInput('documentUrlOf', inputs.documentUrlOf ?? null);
  fixture.componentRef.setInput('status', inputs.status ?? 'ready');
  fixture.detectChanges();
  return fixture;
}

describe('DossierViewer (C-2B-39)', () => {
  it('dado 2 documentos (origin requerente/oficio) então 2 seções rotuladas, filename, content_hash em <code>, sem <iframe>/<img> quando documentUrlOf null [negativo]; dado documentUrlOf que devolve URL então <iframe title=filename>; dado status "loading" então detran-loading-state; (click) numa linha emite select', async () => {
    const documents = [
      document('requerente', 'a.pdf'),
      document('oficio', 'b.pdf'),
    ];
    const fixture = await render({ documents });
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('section').length).toBeGreaterThanOrEqual(2);
    expect(host.textContent).toContain('a.pdf');
    expect(host.querySelector('code')?.textContent).toContain('hash-a.pdf');
    expect(host.querySelector('iframe')).toBeNull();
    expect(host.querySelector('img')).toBeNull();

    // A10 item a: assina o output e dispara o clique ANTES de chamar render() de novo — a
    // próxima chamada reseta o TestBed (destrói este fixture) e uma assinatura tardia lança
    // NG0953 "Unexpected subscription to destroyed OutputRef".
    let selected: unknown;
    fixture.componentInstance.select.subscribe((value: unknown) => {
      selected = value;
    });
    host
      .querySelector('[data-document-row]')
      ?.dispatchEvent(new Event('click'));
    expect(selected).toBeDefined();

    const withUrl = await render({
      documents,
      documentUrlOf: () => 'https://example.invalid/a.pdf',
    });
    expect(
      withUrl.nativeElement.querySelector('iframe')?.getAttribute('title'),
    ).toBe('a.pdf');

    const loading = await render({ documents: [], status: 'loading' });
    expect(
      loading.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });

  it('dado documents vazio e status "ready" então detran-empty-state "rait.states.empty"', async () => {
    const fixture = await render({ documents: [] });
    expect(
      fixture.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();
  });
});

describe('DossierViewer — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, empty, loading) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const ready = await render({
      documents: [document('requerente', 'a.pdf')],
    });
    await expectA11yStateInvariants(ready.nativeElement);
    const empty = await render({ documents: [] });
    await expectA11yStateInvariants(empty.nativeElement);
    const loading = await render({ documents: [], status: 'loading' });
    await expectA11yStateInvariants(loading.nativeElement);
  });
});
