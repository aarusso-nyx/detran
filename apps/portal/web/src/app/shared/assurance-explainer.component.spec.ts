// R-0014 TASK-0008 (Inspector). `shared/assurance-explainer.component.ts` (novo, contrato
// CTG-0003a §5.11) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import { AssuranceExplainerComponent } from './assurance-explainer.component';

const catalog = portalCatalog as Record<string, string>;

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      AssuranceExplainerComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(AssuranceExplainerComponent);
}

describe('AssuranceExplainerComponent', () => {
  it('dado required avancada, current simples, actKey defesa_previa então data-required/data-current, três rádios sob a legenda portal.forms.elevacao.caminho; selecionar emite methodSelected; methods [] então state.sem_elegibilidade', async () => {
    // C-3a-86
    const fixture = await setup();
    fixture.componentRef.setInput('required', 'avancada');
    fixture.componentRef.setInput('current', 'simples');
    fixture.componentRef.setInput('actKey', 'defesa_previa');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('data-required')).toBe('avancada');
    expect(host.getAttribute('data-current')).toBe('simples');
    const radios = host.querySelectorAll('input[type="radio"]');
    expect(radios).toHaveLength(3);
    const values = Array.from(radios).map(
      (radio) => (radio as HTMLInputElement).value,
    );
    expect(values).toEqual(['biographic', 'biometric', 'icp']);
    expect(host.textContent).toContain(
      catalog['portal.forms.elevacao.caminho'],
    );
    await expectNoSeriousA11yViolations(host);

    const methodSelected: unknown[] = [];
    (fixture.componentInstance as any).methodSelected.subscribe(
      (value: unknown) => methodSelected.push(value),
    );
    (radios[1] as HTMLInputElement).click();
    expect(methodSelected).toEqual(['biometric']);

    fixture.componentRef.setInput('methods', []);
    fixture.detectChanges();
    expect(host.textContent).toContain(
      catalog['portal.screens.t27.state.sem_elegibilidade'],
    );
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('AssuranceExplainerComponent — a11y (C-3a-99)', () => {
  it('dado methods vazio (sem_elegibilidade, sem rádios) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setup();
    fixture.componentRef.setInput('required', 'avancada');
    fixture.componentRef.setInput('current', null);
    fixture.componentRef.setInput('actKey', 'defesa_previa');
    fixture.componentRef.setInput('methods', []);
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
