// R-0012 TASK-0008 (Inspector). CTG-0002b.md §5.12, §8 (C-2B-45, 59 parcial) —
// `shared/signature-dialog.component.ts` ainda não existe (TASK-0009): falha de módulo esperada.
import { TestBed } from '@angular/core/testing';
import { SignatureDialogComponent } from './signature-dialog.component';
import {
  markerI18nModule,
  initializeMarkerI18n,
} from '../../testing/i18n-test-catalog';
import { expectA11yStateInvariants } from '../../testing/a11y-state.spec-helper';

const KEYS = ['rait.action.sign', 'rait.common.signatureUnavailable'] as const;

async function render(open: boolean) {
  TestBed.configureTestingModule({
    imports: [SignatureDialogComponent, markerI18nModule([...KEYS])],
  });
  await initializeMarkerI18n();
  const fixture = TestBed.createComponent(SignatureDialogComponent);
  fixture.componentRef.setInput('open', open);
  fixture.componentRef.setInput('titleKey', KEYS[0]);
  fixture.componentRef.setInput('messageKey', KEYS[0]);
  fixture.detectChanges();
  return fixture;
}

describe('SignatureDialog (C-2B-45)', () => {
  it('dado open true então stynx-confirm-dialog aberto com title/message dos inputs, texto "rait.common.signatureUnavailable" em role="status"; confirm emite confirmed; dismiss emite dismissed e open false; nenhum signature_ref simulado [negativo]', async () => {
    const fixture = await render(true);
    const host: HTMLElement = fixture.nativeElement;
    const dialog = host.querySelector('stynx-confirm-dialog');
    expect(dialog).not.toBeNull();
    expect(host.querySelector('[role="status"]')?.textContent).toBeTruthy();
    expect(host.textContent).not.toMatch(/signature_ref/);

    let confirmed = false;
    fixture.componentInstance.confirmed.subscribe(() => {
      confirmed = true;
    });
    let dismissed = false;
    fixture.componentInstance.dismissed.subscribe(() => {
      dismissed = true;
    });

    dialog?.dispatchEvent(new CustomEvent('confirm'));
    expect(confirmed).toBe(true);

    // O output do `StynxConfirmDialogComponent` (kit) é `dismissed`, não `dismiss` (A10 item f).
    dialog?.dispatchEvent(new CustomEvent('dismissed'));
    expect(dismissed).toBe(true);
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});

describe('SignatureDialog — a11y (C-2B-59)', () => {
  it('dado o componente renderizado (aberto) quando expectA11yStateInvariants + axe então nenhuma violação serious/critical', async () => {
    const fixture = await render(true);
    await expectA11yStateInvariants(fixture.nativeElement);
  });
});
