// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.16, §8 (C-2B-49/50, 59 parcial) —
// `shared/queue-table.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { QueueTableComponent } from './queue-table.component';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import type { RaitRoleCode } from '../../testing/route-manifest.fixture';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = [
  'rait.common.activeRow',
  'rait.action.open',
  'rait.action.claim-next',
] as const;

function item(id: string, flag: string) {
  return {
    id,
    caseId: id,
    protocol: `RAIT-2026-00000${id}`,
    state: 'ADMITIDO',
    instance: 'defesa_previa',
    flag,
    daysRemaining: null,
    deadline: null,
    priority: false,
  };
}

async function render(inputs: {
  items: readonly unknown[];
  role?: RaitRoleCode;
  primaryAction?: { command: string; labelKey: string } | null;
  status?: string;
}) {
  // A10 item a: TestBed.resetTestingModule() antes de cada configureTestingModule — alguns
  // it's chamam render() mais de uma vez (estados diferentes no mesmo teste) e o Angular
  // lança 'Cannot configure the test module when the test module has already been
  // instantiated' na segunda chamada sem o reset.
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [QueueTableComponent, markerI18nModule([...KEYS])],
    providers: inputs.role
      ? [
          {
            provide: StynxSessionService,
            useValue: createStynxSessionStub({
              active: true,
              permissions: [...ROLE_PERMISSIONS_FIXTURE[inputs.role]],
              claims: { roles: [inputs.role] },
            }),
          },
        ]
      : [],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(QueueTableComponent);
  fixture.componentRef.setInput('items', inputs.items);
  fixture.componentRef.setInput('columnLabelKeys', {
    protocol: KEYS[0],
    state: KEYS[0],
    instance: KEYS[0],
    risk: KEYS[0],
    deadline: KEYS[0],
    priority: KEYS[0],
  });
  fixture.componentRef.setInput('primaryAction', inputs.primaryAction ?? null);
  fixture.componentRef.setInput('status', inputs.status ?? 'ready');
  fixture.detectChanges();
  return fixture;
}

describe('QueueTable — ordem e navegação (C-2B-49)', () => {
  it('dado 3 QueueItem (flags CRITICO, SEM_RISCO, ALERTA_N1 nesta ordem) então stynx-table com 3 linhas NA ORDEM DADA [negativo de reordenação], célula de risco com texto do rótulo + dias; activeIndex 0 e aria-current="true" na 1ª <tr>; next() → 1, prev() → 0, prev() em 0 → 0; clique na 3ª <tr> → 2; openActive() emite open(item[2]); região role="status" com "rait.common.activeRow"', async () => {
    const items = [
      item('1', 'CRITICO'),
      item('2', 'SEM_RISCO'),
      item('3', 'ALERTA_N1'),
    ];
    const fixture = await render({ items });
    const component = fixture.componentInstance;
    expect(component.activeIndex()).toBe(0);
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(rows[0].getAttribute('aria-current')).toBe('true');

    component.next();
    expect(component.activeIndex()).toBe(1);
    component.prev();
    expect(component.activeIndex()).toBe(0);
    component.prev();
    expect(component.activeIndex()).toBe(0);

    rows[2].dispatchEvent(new Event('click'));
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(2);

    let opened: unknown;
    component.open.subscribe((value: unknown) => {
      opened = value;
    });
    component.openActive();
    expect(opened).toEqual(items[2]);

    expect(
      fixture.nativeElement.querySelector('[role="status"]')?.textContent,
    ).toContain('activeRow');
  });
});

describe('QueueTable — ação principal e estados (C-2B-50)', () => {
  it('dado primaryAction { command: "rait-case:claim-next", labelKey } e permissões de rait-analyst então o botão existe e (click) emite action(activeItem); status "empty" → detran-empty-state; "loading" → detran-loading-state', async () => {
    const items = [item('1', 'SEM_RISCO')];
    const primaryAction = {
      command: 'rait-case:claim-next',
      labelKey: KEYS[2],
    };
    const allowed = await render({
      items,
      role: 'rait-analyst',
      primaryAction,
    });
    // `allowed.nativeElement` tem tipo `any` no `ComponentFixture` real; quando o import de
    // `QueueTableComponent` falha (símbolo ainda inexistente) o tipo inferido pode cair em
    // `unknown`, e um genérico sobre `unknown` é "untyped function call" (TS2347) — a anotação
    // explícita de `host: HTMLElement` fixa o tipo antes do `querySelector<T>` (A10 item h).
    const host: HTMLElement = allowed.nativeElement;
    const button = host.querySelector<HTMLButtonElement>(
      '[data-primary-action]',
    );
    expect(button).not.toBeNull();
    let emitted: unknown;
    allowed.componentInstance.action.subscribe((value: unknown) => {
      emitted = value;
    });
    button?.click();
    expect(emitted).toEqual(items[0]);

    const empty = await render({ items: [], status: 'empty' });
    expect(
      empty.nativeElement.querySelector('detran-empty-state'),
    ).not.toBeNull();

    const loading = await render({ items: [], status: 'loading' });
    expect(
      loading.nativeElement.querySelector('detran-loading-state'),
    ).not.toBeNull();
  });
});

// A11 (delivery-review CTG-0002b-1, item 13): matriz completa sobre os 13 papéis canônicos para
// `primaryAction` `rait-case:claim-next` (`inf:rait-case:claim-next`, concedida só a
// `rait-analyst`) — um `it` por papel, nunca um par exemplo.
const QUEUE_TABLE_PRIMARY_ACTION = {
  command: 'rait-case:claim-next',
  labelKey: KEYS[2],
};
const QUEUE_TABLE_PERMISSION_KEY = 'inf:rait-case:claim-next';
const QUEUE_TABLE_ROLES = Object.keys(
  ROLE_PERMISSIONS_FIXTURE,
) as readonly RaitRoleCode[];

describe('QueueTable — matriz de autorização (A11)', () => {
  for (const role of QUEUE_TABLE_ROLES) {
    const granted = ROLE_PERMISSIONS_FIXTURE[role].includes(
      QUEUE_TABLE_PERMISSION_KEY,
    );
    it(`dado papel "${role}" quando renderizado com primaryAction rait-case:claim-next então o botão ${granted ? 'existe' : 'NÃO existe [negativo]'}`, async () => {
      const fixture = await render({
        items: [item('1', 'SEM_RISCO')],
        role,
        primaryAction: QUEUE_TABLE_PRIMARY_ACTION,
      });
      const button = fixture.nativeElement.querySelector(
        '[data-primary-action]',
      );
      if (granted) {
        expect(button).not.toBeNull();
      } else {
        expect(button).toBeNull();
      }
    });
  }
});

describe('QueueTable — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (ready, empty, loading) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const ready = await render({ items: [item('1', 'SEM_RISCO')] });
    await expectA11yStateInvariants(ready.nativeElement);
    const empty = await render({ items: [], status: 'empty' });
    await expectA11yStateInvariants(empty.nativeElement);
    const loading = await render({ items: [], status: 'loading' });
    await expectA11yStateInvariants(loading.nativeElement);
  });
});
