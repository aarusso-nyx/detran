// R-0014 TASK-0017 (Inspector). CTG-0003c §5.1 — `NotificationListComponent`; arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9). Textos do catálogo
// real (`portal.pt-BR.json`, padrão de `payment-comparison.component.spec.ts`, par 2).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { NotificationListComponent } from './notification-list.component'; // §9: "Cannot find module" esperado.
import { INBOX_LIST_FIXTURE } from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  items: readonly unknown[] = INBOX_LIST_FIXTURE.items,
  busy = false,
) {
  await TestBed.configureTestingModule({
    imports: [
      NotificationListComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(NotificationListComponent);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('busy', busy);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('NotificationListComponent — itens de fixture (§5.1)', () => {
  it('dado os 2 itens de fixture então 2 <li> com data-kind/data-source/data-read; o item SNE mostra ciência ficta 2026-10-01; o item de processo linka /processos/…070400009; o SNE linka /autos/…0f0000002', async () => {
    // C-3c-82
    const { element } = await setup();
    const rows = Array.from(element.querySelectorAll('[data-id]'));
    expect(rows).toHaveLength(2);
    const sneRow = element.querySelector(
      `[data-id="${INBOX_LIST_FIXTURE.items[0].id}"]`,
    );
    expect(sneRow?.getAttribute('data-kind')).toBe('acao_necessaria');
    expect(sneRow?.getAttribute('data-source')).toBe('sne');
    expect(sneRow?.getAttribute('data-read')).toBe('false');
    expect(sneRow?.textContent).toContain(
      catalog['portal.notifications.ciencia_ficta'],
    );
    expect(sneRow?.querySelector('a[routerLink^="/autos/"]')).not.toBeNull();

    const processRow = element.querySelector(
      `[data-id="${INBOX_LIST_FIXTURE.items[1].id}"]`,
    );
    expect(processRow?.getAttribute('data-read')).toBe('true');
    expect(
      processRow?.querySelector('a[routerLink^="/processos/"]'),
    ).not.toBeNull();
  });
});

describe('NotificationListComponent — marcar como lida (§5.1)', () => {
  it('dado item com readOn null então o botão marcar como lida emite read(id); com readOn preenchido o botão não existe [negativo]', async () => {
    // C-3c-83
    const { fixture, element } = await setup();
    const unread = element.querySelector(
      `[data-id="${INBOX_LIST_FIXTURE.items[0].id}"]`,
    ) as HTMLElement;
    const readEvents: string[] = [];
    (fixture.componentInstance as any).read.subscribe((id: string) =>
      readEvents.push(id),
    );
    const button = unread.querySelector<HTMLButtonElement>(
      'button[data-mark-read]',
    );
    expect(button).not.toBeNull();
    button!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(readEvents).toEqual([INBOX_LIST_FIXTURE.items[0].id]);

    const read = element.querySelector(
      `[data-id="${INBOX_LIST_FIXTURE.items[1].id}"]`,
    ) as HTMLElement;
    expect(read.querySelector('button[data-mark-read]')).toBeNull();
  });
});

describe('NotificationListComponent — tokens sem literal cru (§5.1; inv. 1) [negativo]', () => {
  it('dado o DOM então nenhum texto igual a sne|portal|SNE|PROCESSO cru fora de data-*', async () => {
    // C-3c-84
    const { element } = await setup();
    const clone = element.cloneNode(true) as HTMLElement;
    for (const node of Array.from(
      clone.querySelectorAll('[data-source], [data-category]'),
    )) {
      node.removeAttribute('data-source');
      node.removeAttribute('data-category');
    }
    const text = clone.textContent ?? '';
    expect(/\bsne\b/i.test(text.replace(/SNE\)/g, ''))).toBe(false);
    expect(text).not.toMatch(/\bPROCESSO\b/);
  });
});

describe('NotificationListComponent — a11y por estado (§7.3)', () => {
  it('dado lista vazia então axe sem violação serious/critical', async () => {
    const { element } = await setup([]);
    await expectNoSeriousA11yViolations(element);
  });

  it('dado os 2 itens então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado busy (marcar como lida desabilitado) então axe sem violação serious/critical', async () => {
    const { element } = await setup(INBOX_LIST_FIXTURE.items, true);
    await expectNoSeriousA11yViolations(element);
  });
});
