// R-0014 TASK-0017 (Inspector). CTG-0003c §5.2 — `SneConsentComponent`; arquivo inteiramente
// novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { SneConsentComponent } from './sne-consent.component'; // §9: "Cannot find module" esperado.
import {
  SNE_ENROLLMENT_ADERIDO_FIXTURE,
  SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE,
} from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;
const EFFECT_KEYS = [
  'portal.legal.efeitos_sne.v1.ciencia_ficta',
  'portal.legal.efeitos_sne.v1.substituicao',
  'portal.legal.efeitos_sne.v1.responsabilidade',
  'portal.legal.efeitos_sne.v1.cancelamento',
];

async function setup(
  options: {
    enrollment?: unknown;
    status?: string;
    fields?: readonly string[];
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      SneConsentComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(SneConsentComponent);
  fixture.componentRef.setInput(
    'enrollment',
    options.enrollment ?? SNE_ENROLLMENT_NAO_ADERIDO_FIXTURE,
  );
  fixture.componentRef.setInput('status', options.status ?? 'idle');
  fixture.componentRef.setInput('fields', options.fields ?? []);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

function buttonIndex(element: HTMLElement, matcher: string): number {
  const children = Array.from(element.querySelectorAll('*'));
  return children.findIndex(
    (node) => node.textContent?.includes(matcher) && node.tagName === 'BUTTON',
  );
}

function effectIndex(element: HTMLElement, key: string): number {
  const children = Array.from(element.querySelectorAll('*'));
  return children.findIndex(
    (node) => node.textContent?.trim() === catalog[key],
  );
}

describe('SneConsentComponent — quatro efeitos e formulário desabilitado (§5.2 a/c; RN-123; A5)', () => {
  it('dado enrollment não aderido então os quatro textos dos efeitos aparecem, cada um em elemento próprio, ANTES do botão no DOM, host data-text-version v1; checkbox desmarcado e botão desabilitado', async () => {
    // C-3c-85
    const { element } = await setup();
    for (const key of EFFECT_KEYS) {
      expect(element.textContent).toContain(catalog[key]);
    }
    const submitIndex = buttonIndex(
      element,
      catalog['portal.screens.t09.cmd.enroll'],
    );
    expect(submitIndex).toBeGreaterThan(-1);
    for (const key of EFFECT_KEYS) {
      expect(effectIndex(element, key)).toBeGreaterThan(-1);
      expect(effectIndex(element, key)).toBeLessThan(submitIndex);
    }
    expect(element.getAttribute('data-text-version')).toBe('v1');
    const checkbox = element.querySelector<HTMLInputElement>(
      'input[name="aceite"]',
    );
    expect(checkbox?.checked).toBe(false);
    const submitButton = element.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    );
    expect(submitButton?.disabled).toBe(true);
  });
});

describe('SneConsentComponent — enroll() emite o corpo do fio (§5.2 c; OD-P61)', () => {
  it('dado e-mail, celular e checkbox marcado quando enroll então o corpo emitido tem consent.textVersion v1 e effectsAck os 4 tokens do fio', async () => {
    // C-3c-86
    const { fixture, element } = await setup();
    const captured: unknown[] = [];
    (fixture.componentInstance as any).enroll.subscribe((body: unknown) =>
      captured.push(body),
    );
    const emailInput = element.querySelector<HTMLInputElement>(
      'input[name="email"]',
    )!;
    const phoneInput = element.querySelector<HTMLInputElement>(
      'input[name="phone"]',
    )!;
    emailInput.value = 'a@fixtures.invalid';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    phoneInput.value = '92999990000';
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    const checkbox = element.querySelector<HTMLInputElement>(
      'input[name="aceite"]',
    )!;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    const form = element.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(captured).toHaveLength(1);
    const body = captured[0] as {
      email: string;
      phone: string;
      consent: { textVersion: string; effectsAck: readonly string[] };
    };
    expect(body.consent.textVersion).toBe('v1');
    expect(body.consent.effectsAck).toEqual([
      'ciencia_ficta',
      'canal_exclusivo',
      'desconto_60',
      'cancelamento',
    ]);
  });
});

describe('SneConsentComponent — cancelamento (§5.2 d)', () => {
  it('dado enrollment aderido cancelable então o botão cancelar está visível com o aviso do efeito cancelamento ANTES dele', async () => {
    // C-3c-87 (1.ª parte)
    const { element } = await setup({
      enrollment: SNE_ENROLLMENT_ADERIDO_FIXTURE,
    });
    const cancelButton =
      element.querySelector<HTMLButtonElement>('[data-cancel]');
    expect(cancelButton).not.toBeNull();
    const cancelIndex = buttonIndex(
      element,
      catalog['portal.screens.t09.cmd.cancel'],
    );
    const cancelEffectIndex = effectIndex(
      element,
      'portal.legal.efeitos_sne.v1.cancelamento',
    );
    expect(cancelEffectIndex).toBeLessThan(cancelIndex);
  });

  it('dado enrollment aderido cancelable false então o botão cancelar está aria-disabled', async () => {
    // C-3c-87 (2.ª parte)
    const { element: notCancelable } = await setup({
      enrollment: { ...SNE_ENROLLMENT_ADERIDO_FIXTURE, cancelable: false },
    });
    expect(
      notCancelable
        .querySelector('[data-cancel]')
        ?.getAttribute('aria-disabled'),
    ).toBe('true');
  });
});

describe('SneConsentComponent — adesão ≠ decisão de pagar (§5.2 e; RN-123 trava 1) [negativo]', () => {
  it('dado o DOM então não contém 60%, 40%, renúncia/renuncia nem link a /pagamento', async () => {
    // C-3c-88
    const { element } = await setup({
      enrollment: SNE_ENROLLMENT_ADERIDO_FIXTURE,
    });
    const text = element.textContent ?? '';
    expect(text).not.toContain('60%');
    expect(text).not.toContain('40%');
    expect(/ren[úu]ncia/i.test(text)).toBe(false);
    expect(element.querySelector('a[routerLink*="pagamento"]')).toBeNull();
  });
});

describe('SneConsentComponent — a11y por estado (§5.2/§7.3 — cobertura integral)', () => {
  it('dado enrollment null (carregando) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ enrollment: null });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado não aderido então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado aderido então axe sem violação serious/critical', async () => {
    const { element } = await setup({
      enrollment: SNE_ENROLLMENT_ADERIDO_FIXTURE,
    });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado erro de campos (SNE_CONTACT_REQUIRED) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ fields: ['phone'] });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado status submitting então axe sem violação serious/critical', async () => {
    const { element } = await setup({ status: 'submitting' });
    await expectNoSeriousA11yViolations(element);
  });
});
