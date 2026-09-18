// R-0014 TASK-0008 (Inspector). `shared/consequence-dialog.component.ts` (novo, contrato
// CTG-0003a §5.7) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato). `core/clock.ts` (`PortalClock`, também novo) substituído
// por `useValue` com o relógio fixo do §9 (`2026-09-14T12:00:00-04:00`).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PortalClock } from '../core/clock';
import { ConsequenceDialogComponent } from './consequence-dialog.component';
import { FIXED_CLOCK_DATE } from '../../testing/http-fixtures';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

// C-3a-75 fixa o literal '2026-09-14T16:00:00.000Z' — `PortalClock.now().toISOString()`
// converte o relógio fixo (2026-09-14T12:00:00-04:00) para UTC.
const FIXED_CLOCK_ACCEPTED_AT = '2026-09-14T16:00:00.000Z';

const catalog = portalCatalog as Record<string, string>;

const fixedClock = { now: () => FIXED_CLOCK_DATE };

async function setup() {
  await TestBed.configureTestingModule({
    imports: [
      ConsequenceDialogComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: PortalClock, useValue: fixedClock }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  return TestBed.createComponent(ConsequenceDialogComponent);
}

describe('ConsequenceDialogComponent — textos legais', () => {
  it('dado document consequencias_desistencia e open true então texto de portal.legal.consequencias_desistencia.v1 e data-text-version="v1"; dado efeitos_sne então os quatro textos por nome (A5)', async () => {
    // C-3a-74
    const fixture = await setup();
    fixture.componentRef.setInput('document', 'consequencias_desistencia');
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'ackLabelKey',
      'portal.forms.desistencia.confirmacao',
    );
    fixture.componentRef.setInput(
      'confirmLabelKey',
      'portal.screens.t08.cmd.confirm',
    );
    fixture.componentRef.setInput(
      'cancelLabelKey',
      'portal.screens.t08.cmd.cancel',
    );
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      catalog['portal.legal.consequencias_desistencia.v1'],
    );
    expect(host.querySelector('[data-text-version="v1"]')).not.toBeNull();

    fixture.componentRef.setInput('document', 'efeitos_sne');
    fixture.detectChanges();
    expect(host.textContent).toContain(catalog['portal.legal.efeitos_sne.v1']);
    for (const efeito of [
      'ciencia_ficta',
      'substituicao',
      'responsabilidade',
      'cancelamento',
    ]) {
      expect(host.textContent).toContain(
        catalog[`portal.legal.efeitos_sne.v1.${efeito}`],
      );
    }
  });
});

describe('ConsequenceDialogComponent — confirmação por escrito', () => {
  it('dado ackLabelKey então confirmar desabilitado até marcar; ao marcar e confirmar então confirmed com textVersion v1 e acceptedAt do relógio fixo; cancelar ou Escape então cancelled sem confirmed', async () => {
    // C-3a-75
    const fixture = await setup();
    fixture.componentRef.setInput('document', 'consequencias_desistencia');
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'ackLabelKey',
      'portal.forms.desistencia.confirmacao',
    );
    fixture.componentRef.setInput(
      'confirmLabelKey',
      'portal.screens.t08.cmd.confirm',
    );
    fixture.componentRef.setInput(
      'cancelLabelKey',
      'portal.screens.t08.cmd.cancel',
    );
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const confirmed: unknown[] = [];
    const cancelled: void[] = [];
    (fixture.componentInstance as any).confirmed.subscribe((value: unknown) =>
      confirmed.push(value),
    );
    (fixture.componentInstance as any).cancelled.subscribe(() =>
      cancelled.push(undefined),
    );

    const confirmButton: HTMLButtonElement =
      host.querySelector('[data-confirm]')!;
    expect(confirmButton.disabled).toBe(true);

    const checkbox: HTMLInputElement = host.querySelector(
      'input[type="checkbox"]',
    )!;
    checkbox.click();
    fixture.detectChanges();
    expect(confirmButton.disabled).toBe(false);
    confirmButton.click();
    expect(confirmed).toEqual([
      { textVersion: 'v1', acceptedAt: FIXED_CLOCK_ACCEPTED_AT },
    ]);

    const cancelButton: HTMLButtonElement =
      host.querySelector('[data-cancel]')!;
    cancelButton.click();
    expect(cancelled).toHaveLength(1);
    expect(confirmed).toHaveLength(1);
  });
});

describe('ConsequenceDialogComponent — acessibilidade do diálogo', () => {
  it('dado open true então role dialog, aria-modal true, aria-labelledby válido, foco dentro do diálogo; ao fechar o foco volta ao elemento que abriu; Tab não sai do diálogo (§8)', async () => {
    // C-3a-76
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = await setup();
    fixture.componentRef.setInput('document', 'consequencias_desistencia');
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput(
      'ackLabelKey',
      'portal.forms.desistencia.confirmacao',
    );
    fixture.componentRef.setInput(
      'confirmLabelKey',
      'portal.screens.t08.cmd.confirm',
    );
    fixture.componentRef.setInput(
      'cancelLabelKey',
      'portal.screens.t08.cmd.cancel',
    );
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog?.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(`#${labelledBy}`),
    ).not.toBeNull();
    expect(dialog?.contains(document.activeElement)).toBe(true);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});

async function setupOpen(
  document_:
    'consequencias_desistencia' | 'efeitos_sne' = 'consequencias_desistencia',
) {
  const fixture = await setup();
  fixture.componentRef.setInput('document', document_);
  fixture.componentRef.setInput('open', true);
  fixture.componentRef.setInput(
    'ackLabelKey',
    'portal.forms.desistencia.confirmacao',
  );
  fixture.componentRef.setInput(
    'confirmLabelKey',
    'portal.screens.t08.cmd.confirm',
  );
  fixture.componentRef.setInput(
    'cancelLabelKey',
    'portal.screens.t08.cmd.cancel',
  );
  fixture.detectChanges();
  return fixture;
}

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('ConsequenceDialogComponent — a11y (C-3a-99)', () => {
  it('dado aberto sem marcar o checkbox então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado aberto com o checkbox marcado (confirmar habilitado) então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen();
    const checkbox: HTMLInputElement = fixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    );
    checkbox.click();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado document efeitos_sne aberto então nenhuma violação axe serious/critical', async () => {
    const fixture = await setupOpen('efeitos_sne');
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-100; delivery-review-CTG-0003a.json item 11).
// jsdom não avança o foco sozinho ao pressionar Tab (sem comportamento nativo de navegação
// sequencial); o teste posiciona o foco manualmente (como se o Tab anterior já tivesse chegado
// ali) e despacha o `KeyboardEvent` real que `ConsequenceDialogComponent.onKeydown` intercepta
// (`(keydown)` no painel, evento com `bubbles: true` para subir do controle até o host).
describe('ConsequenceDialogComponent — ciclo de Tab (C-3a-100)', () => {
  function tab(
    target: HTMLElement,
    options: { shiftKey?: boolean } = {},
  ): void {
    target.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: options.shiftKey ?? false,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  it('dado foco no primeiro controle (checkbox, confirmar desabilitado) quando Shift+Tab então o foco vai ao último (cancelar)', async () => {
    const fixture = await setupOpen();
    const host: HTMLElement = fixture.nativeElement;
    const checkbox: HTMLInputElement = host.querySelector(
      'input[type="checkbox"]',
    )!;
    const cancelButton: HTMLButtonElement =
      host.querySelector('[data-cancel]')!;
    checkbox.focus();
    expect(document.activeElement).toBe(checkbox);
    tab(checkbox, { shiftKey: true });
    expect(document.activeElement).toBe(cancelButton);
  });

  it('dado foco no último controle (confirmar, habilitado) quando Tab então o foco volta ao primeiro (checkbox)', async () => {
    const fixture = await setupOpen();
    const host: HTMLElement = fixture.nativeElement;
    const checkbox: HTMLInputElement = host.querySelector(
      'input[type="checkbox"]',
    )!;
    checkbox.click();
    fixture.detectChanges();
    const confirmButton: HTMLButtonElement =
      host.querySelector('[data-confirm]')!;
    confirmButton.focus();
    expect(document.activeElement).toBe(confirmButton);
    tab(confirmButton);
    expect(document.activeElement).toBe(checkbox);
  });

  it('dado Escape com o foco dentro do diálogo então cancelled emitido e o foco volta ao elemento que abriu', async () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const fixture = await setupOpen();
    const cancelled: void[] = [];
    (fixture.componentInstance as any).cancelled.subscribe(() =>
      cancelled.push(undefined),
    );
    const dialog: HTMLElement =
      fixture.nativeElement.querySelector('[role="dialog"]');
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(cancelled).toHaveLength(1);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });
});
