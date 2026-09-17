// R-0014 TASK-0008 (Inspector). `shared/prefilled-field.component.ts` (novo, contrato
// CTG-0003a §5.5) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import { PrefilledFieldComponent } from './prefilled-field.component';

const catalog = portalCatalog as Record<string, string>;

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      PrefilledFieldComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(PrefilledFieldComponent);
}

describe('PrefilledFieldComponent', () => {
  it('dado { name, labelKey, value } então <output aria-readonly=true> com o valor, nenhum <input>, sem botão; dado correctable e correctLabelKey então botão emite correct ([RN-PORTAL-106]); dado value null então portal.states.empty', async () => {
    // C-3a-67
    const fixture = await setup();
    fixture.componentRef.setInput('name', 'placa');
    fixture.componentRef.setInput('labelKey', 'portal.screens.t02.field.facts');
    fixture.componentRef.setInput('value', 'ABC1D23');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const output = host.querySelector('output');
    expect(output).not.toBeNull();
    expect(output?.getAttribute('aria-readonly')).toBe('true');
    expect(output?.textContent).toContain('ABC1D23');
    expect(host.querySelector('input')).toBeNull();
    expect(host.querySelector('button')).toBeNull();
    await expectNoSeriousA11yViolations(host);

    fixture.componentRef.setInput('correctable', true);
    fixture.componentRef.setInput(
      'correctLabelKey',
      'portal.screens.t24.cmd.corrigir',
    );
    fixture.detectChanges();
    const button = host.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.textContent).toContain(
      catalog['portal.screens.t24.cmd.corrigir'],
    );
    const correctEmitted: void[] = [];
    (fixture.componentInstance as any).correct.subscribe(() =>
      correctEmitted.push(undefined),
    );
    button?.click();
    expect(correctEmitted).toHaveLength(1);

    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();
    expect(host.textContent).toContain(catalog['portal.states.empty']);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('PrefilledFieldComponent — a11y (C-3a-99)', () => {
  it.each([
    { label: 'valor presente', value: 'ABC1D23', correctable: false },
    { label: 'vazio (portal.states.empty)', value: null, correctable: false },
    { label: 'corrigível', value: 'ABC1D23', correctable: true },
  ])(
    'dado o estado $label então nenhuma violação axe serious/critical',
    async ({ value, correctable }) => {
      const fixture = await setup();
      fixture.componentRef.setInput('name', 'placa');
      fixture.componentRef.setInput(
        'labelKey',
        'portal.screens.t02.field.facts',
      );
      fixture.componentRef.setInput('value', value);
      fixture.componentRef.setInput('correctable', correctable);
      if (correctable) {
        fixture.componentRef.setInput(
          'correctLabelKey',
          'portal.screens.t24.cmd.corrigir',
        );
      }
      fixture.detectChanges();
      await expectNoSeriousA11yViolations(fixture.nativeElement);
    },
  );
});
