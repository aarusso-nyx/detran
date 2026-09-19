// R-0014 TASK-0008 (Inspector, iteração 2 — B12 de reports/TASK-0009.md). O clique num
// `<a routerLink>` dispara navegação real pelo `Router`; `provideRouter([])` não casa nenhuma
// rota e a navegação rejeita com `NavigationError`, que sobra como rejeição não tratada depois
// do teardown (exit 1 do vitest mesmo com os testes verdes). Uma rota coringa (`path: '**'`) sem
// componente — só `children: []`, um passa-through válido no Router — faz toda navegação casar
// e resolver, sem precisar renderizar nada.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import {
  ActionTripletComponent,
  type AitAction,
} from './action-triplet.component';

const catalog = portalCatalog as Record<string, string>;
const AIT_ID = '00000000-0000-7000-8000-0000f0000002';

const THREE_ACTIONS: readonly AitAction[] = [
  { key: 'defend', available: true, minimumAssurance: 'avancada' },
  { key: 'indicate_driver', available: true, minimumAssurance: 'avancada' },
  { key: 'pay', available: true, minimumAssurance: 'simples' },
];

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      ActionTripletComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(ActionTripletComponent);
}

describe('ActionTripletComponent', () => {
  it('dado as três ações disponíveis então exatamente três, na ordem defend·indicate·pay, com textos das chaves e routerLink para as rotas do manifesto (#10/#11/#12)', async () => {
    // C-3a-51
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', THREE_ACTIONS);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const links = Array.from(host.querySelectorAll('a[href]'));
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute('href')).toBe(`/autos/${AIT_ID}/defesa/nova`);
    expect(links[0].textContent).toContain(
      catalog['portal.screens.t01.cmd.defend'],
    );
    expect(links[1].getAttribute('href')).toBe(
      `/autos/${AIT_ID}/condutor/nova`,
    );
    expect(links[1].textContent).toContain(
      catalog['portal.screens.t01.cmd.indicate'],
    );
    expect(links[2].getAttribute('href')).toBe(`/autos/${AIT_ID}/pagamento`);
    expect(links[2].textContent).toContain(
      catalog['portal.screens.t01.cmd.pay'],
    );
    await expectNoSeriousA11yViolations(host);
  });

  it("dado pay indisponível com reason 'r' então aria-disabled, data-reason, clique não emite nem navega; dado defend disponível então clique emite selected('defend')", async () => {
    // C-3a-52
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', [
      THREE_ACTIONS[0],
      THREE_ACTIONS[1],
      {
        key: 'pay',
        available: false,
        reason: 'r',
        minimumAssurance: 'simples',
      },
    ]);
    const emitted: string[] = [];
    (fixture.componentInstance as any).selected.subscribe((key: string) =>
      emitted.push(key),
    );
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const payElement = Array.from(host.querySelectorAll('[data-reason]'))[0];
    expect(payElement.getAttribute('aria-disabled')).toBe('true');
    expect(payElement.getAttribute('data-reason')).toBe('r');
    (payElement as HTMLElement).click();
    expect(emitted).not.toContain('pay');

    const defendLink = host.querySelector('a[href]') as HTMLElement;
    defendLink.click();
    expect(emitted).toContain('defend');
  });

  it('dado actions sem pay então a terceira ação ainda é renderizada como indisponível (nunca oculta); nenhuma tem classe/variante de destaque distinta ([RN-PORTAL-127])', async () => {
    // C-3a-53
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', [
      THREE_ACTIONS[0],
      THREE_ACTIONS[1],
    ]);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const items = host.querySelectorAll('[data-reason], a[href]');
    expect(items).toHaveLength(3);
    const classNames = new Set(Array.from(items).map((item) => item.className));
    expect(classNames.size).toBeLessThanOrEqual(1);
  });

  it('dado actions com appeal_jari então não é renderizado (T-07, par 2)', async () => {
    // C-3a-54
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', [
      ...THREE_ACTIONS,
      {
        key: 'appeal_jari',
        available: true,
        minimumAssurance: 'avancada',
      } as unknown as AitAction,
    ]);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('a[href], [data-reason]')).toHaveLength(3);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99/100; delivery-review-CTG-0003a.json item 11).
describe('ActionTripletComponent — a11y (C-3a-99)', () => {
  it('dado uma ação indisponível (pay, reason r) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', [
      THREE_ACTIONS[0],
      THREE_ACTIONS[1],
      {
        key: 'pay',
        available: false,
        reason: 'r',
        minimumAssurance: 'simples',
      },
    ]);
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});

describe('ActionTripletComponent — ordem de tabulação (C-3a-100)', () => {
  it('dado as três ações então alcançáveis por Tab na ordem defend·indicate·pay (DOM/foco), disponível ou não', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('aitId', AIT_ID);
    fixture.componentRef.setInput('actions', [
      THREE_ACTIONS[0],
      THREE_ACTIONS[1],
      {
        key: 'pay',
        available: false,
        reason: 'r',
        minimumAssurance: 'simples',
      },
    ]);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const items = Array.from(
      host.querySelectorAll<HTMLElement>('[data-action]'),
    );
    // Ordem do DOM = ordem de tabulação para elementos sem tabindex explícito fora de 0/-1
    // (defend/indicate são <a href>, tabstop natural; pay indisponível é <a role="link"
    // tabindex="0">, tabstop explícito — nenhum tem tabindex negativo).
    expect(items.map((item) => item.getAttribute('data-action'))).toEqual([
      'defend',
      'indicate_driver',
      'pay',
    ]);
    for (const item of items) {
      item.focus();
      expect(document.activeElement).toBe(item);
      expect(item.getAttribute('tabindex')).not.toBe('-1');
    }
  });
});
