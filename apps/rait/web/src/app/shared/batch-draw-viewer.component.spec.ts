// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.17, §8 (C-2B-51, 59 parcial) —
// `shared/batch-draw-viewer.component.ts` ainda não existe (TASK-0009): falha de módulo
// esperada.
import { TestBed } from '@angular/core/testing';
import { BatchDrawViewerComponent } from './batch-draw-viewer.component';
import { tokenKey } from '../core/i18n-token-key';
import {
  fixtureBatch,
  fixtureBatchItem,
  fixtureCase,
  CASE_IDS,
} from '../../testing/http-fixtures';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  tokenKey('orgState', 'LOTE_ABERTO'),
  'rait.common.pendingSource',
  'rait.common.declined',
  'rait.common.decline_impedimento',
] as const;

async function render() {
  const batch = fixtureBatch('00000000-0000-7000-8000-000028000001');
  const items = [
    fixtureBatchItem('00000000-0000-7000-8000-000028010001'),
    fixtureBatchItem('00000000-0000-7000-8000-000028010002'),
  ];
  const cases = new Map([
    [CASE_IDS.EM_INSTRUCAO, fixtureCase(CASE_IDS.EM_INSTRUCAO)],
  ]);
  TestBed.configureTestingModule({
    imports: [BatchDrawViewerComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(BatchDrawViewerComponent);
  fixture.componentRef.setInput('batch', batch);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('cases', cases);
  fixture.componentRef.setInput('impediments', []);
  fixture.detectChanges();
  return fixture;
}

describe('BatchDrawViewer (C-2B-51)', () => {
  it('dado fixtureBatch(LOTE_ABERTO) + 2 itens + cases então seed null → "rait.common.pendingSource", tokenKey("orgState","LOTE_ABERTO"), 2 linhas com protocolo e position na ordem recebida; item com declined_at e decline_kind "impedimento" → "rait.common.declined" + "rait.common.decline_impedimento"', async () => {
    const fixture = await render();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('pendingSource');
    expect(host.textContent).toContain('LOTE_ABERTO');
    expect(
      host.querySelectorAll('tbody tr, [data-batch-item]').length,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('BatchDrawViewer — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, único estado) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render();
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});

// P4-02-S1-A2: approved temporary omission is visible, never invented detail.
describe('S1-A2 bounded batch projection', () => {
  it('preserves server item order and labels omitted position, deadline and acceptance unavailable', async () => {
    const fixture = await render();
    const first = fixtureBatchItem('00000000-0000-7000-8000-000028010001');
    const second = fixtureBatchItem('00000000-0000-7000-8000-000028010002');
    const project = (item: typeof first) => ({
      id: item.id,
      batch_id: item.batch_id,
      case_id: item.case_id,
      member_id: item.member_id,
    });
    fixture.componentRef.setInput('items', [project(second), project(first)]);
    fixture.detectChanges();
    const rows = fixture.componentInstance.rows();
    expect(rows.map((row) => row.id)).toEqual([second.id, first.id]);
    for (const row of rows) {
      expect(row.position).toContain('rait.common.unavailable');
      expect(row.claimDueOn).toContain('rait.common.unavailable');
      expect(row.acceptance).toContain('rait.common.unavailable');
    }
    expect(fixture.nativeElement.textContent).not.toContain('undefined');
  });
});
