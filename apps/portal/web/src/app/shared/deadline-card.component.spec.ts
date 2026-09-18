// R-0014 TASK-0008 (Inspector). `shared/deadline-card.component.ts` (novo, contrato CTG-0003a
// §5.2) — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado
// esperado, §9 do contrato; nenhum teste deste arquivo roda até lá, inclusive a varredura de
// código-fonte de C-3a-50).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import { DeadlineCardComponent } from './deadline-card.component';

const catalog = portalCatalog as Record<string, string>;
const specDir = dirname(fileURLToPath(import.meta.url));

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      DeadlineCardComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(DeadlineCardComponent);
}

describe('DeadlineCardComponent', () => {
  it('dado { dueOn, ownedBy: citizen, labelKey } então texto de portal.situation.deadline.citizen e a data formatada; ownedBy agency então .deadline.agency; data-owned-by', async () => {
    // C-3a-49
    const fixture = await setup();
    fixture.componentRef.setInput('dueOn', '2026-10-14');
    fixture.componentRef.setInput('ownedBy', 'citizen');
    fixture.componentRef.setInput('labelKey', 'portal.screens.t11.field.prazo');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      catalog['portal.situation.deadline.citizen'],
    );
    expect(host.getAttribute('data-owned-by')).toBe('citizen');
    expect(host.textContent).toMatch(/2026|14\/10|out/i);
    await expectNoSeriousA11yViolations(host);

    fixture.componentRef.setInput('ownedBy', 'agency');
    fixture.detectChanges();
    expect(host.textContent).toContain(
      catalog['portal.situation.deadline.agency'],
    );
    expect(host.getAttribute('data-owned-by')).toBe('agency');
  });

  it('dado daysLeft null então nenhum [data-days-left]; dado daysLeft 7 então [data-days-left]="7"; o arquivo não contém new Date/Date.now/getTime ([RN-RAIT-005], [DIVERGE-10])', async () => {
    // C-3a-50
    const fixture = await setup();
    fixture.componentRef.setInput('dueOn', '2026-10-14');
    fixture.componentRef.setInput('ownedBy', 'citizen');
    fixture.componentRef.setInput('labelKey', 'portal.screens.t11.field.prazo');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-days-left]')).toBeNull();

    fixture.componentRef.setInput('daysLeft', 7);
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('[data-days-left]')
        ?.getAttribute('data-days-left'),
    ).toBe('7');

    const source = readFileSync(
      join(specDir, 'deadline-card.component.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/new Date\s*\(/);
    expect(source).not.toMatch(/Date\.now\s*\(/);
    expect(source).not.toMatch(/\.getTime\s*\(/);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99: axe em cada estado que o componente expõe;
// delivery-review-CTG-0003a.json item 11). `DeadlineCardComponent` não tem estados de
// carregamento/erro (só exibe o que o servidor mandou), então os "estados" são as combinações de
// input reais: `ownedBy` citizen/agency × `daysLeft` presente/ausente.
describe('DeadlineCardComponent — a11y (C-3a-99)', () => {
  it.each([
    { ownedBy: 'citizen' as const, daysLeft: null },
    { ownedBy: 'agency' as const, daysLeft: null },
    { ownedBy: 'citizen' as const, daysLeft: 7 },
    { ownedBy: 'agency' as const, daysLeft: 3 },
  ])(
    'dado ownedBy=$ownedBy e daysLeft=$daysLeft então nenhuma violação axe serious/critical',
    async ({ ownedBy, daysLeft }) => {
      const fixture = await setup();
      fixture.componentRef.setInput('dueOn', '2026-10-14');
      fixture.componentRef.setInput('ownedBy', ownedBy);
      fixture.componentRef.setInput(
        'labelKey',
        'portal.screens.t11.field.prazo',
      );
      fixture.componentRef.setInput('daysLeft', daysLeft);
      fixture.detectChanges();
      await expectNoSeriousA11yViolations(fixture.nativeElement);
    },
  );
});
