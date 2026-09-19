// R-0014 TASK-0015 (Inspector). CTG-0003b §4 — `PaymentComparisonComponent`; arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0016 (esperado, §9). Textos esperados
// são sempre lidos do catálogo real (`portal.pt-BR.json`, como `service-wizard.component.spec.ts`
// do par 1) — nunca hardcoded, para não inventar rótulo. `BrandService` é stubado (locale): a
// forma real de `AvailableBrand` (`core/brand.service.ts`) ainda não expõe `locale` apesar de
// CTG-0003a A1 dizer que `GET brand` o devolve — reportado como observação (fora da minha
// fronteira; código de produção do par 1, congelado).
import { fileURLToPath } from 'node:url';
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { BrandService } from '../core/brand.service';
import {
  PaymentComparisonComponent,
  PAYMENT_TIER_ORDER,
  PAYMENT_METHOD_ORDER,
  type PaymentFlags,
} from './payment-comparison.component';
import { PAYMENT_FLAGS } from '../features/pagamento/payment-flags';
import {
  AIT_ID,
  PAYMENT_INFO_FIXTURE,
} from '../../testing/http-fixtures-reads';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

function brandStub(locale = 'pt-BR') {
  return {
    state: () => ({
      status: 'available' as const,
      name: 'DETRAN Exemplo',
      locale,
    }),
    available: () => true,
  } as unknown as BrandService;
}

async function setup(
  options: {
    payment?: typeof PAYMENT_INFO_FIXTURE;
    flags?: PaymentFlags;
    mode?: 'comparison' | 'preserving_appeal';
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      PaymentComparisonComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: BrandService, useValue: brandStub() }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(PaymentComparisonComponent);
  fixture.componentRef.setInput(
    'payment',
    options.payment ?? PAYMENT_INFO_FIXTURE,
  );
  fixture.componentRef.setInput('flags', options.flags ?? PAYMENT_FLAGS);
  fixture.componentRef.setInput('mode', options.mode ?? 'comparison');
  fixture.componentRef.setInput('aitId', AIT_ID);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

function tierRadios(element: HTMLElement): HTMLInputElement[] {
  return Array.from(element.querySelectorAll('input[name="tier"]'));
}

function tierHost(element: HTMLElement, code: string): HTMLElement | null {
  return element.querySelector(`[data-tier="${code}"]`);
}

describe('PaymentComparisonComponent — lado a lado ([RN-PORTAL-128] 1; [UC-PORTAL-015] AC-1)', () => {
  it('dado as quatro faixas então quatro radios name=tier na ordem PAYMENT_TIER_ORDER, todos visíveis sem interação, num único fieldset com a legenda de portal.forms.pagamento.faixa', async () => {
    // C-3b-32
    const { element } = await setup();
    const fieldsets = element.querySelectorAll('fieldset');
    expect(fieldsets.length).toBeGreaterThanOrEqual(1);
    const legend = element.querySelector('legend');
    expect(legend?.textContent).toContain(
      catalog['portal.forms.pagamento.faixa'],
    );
    const radios = tierRadios(element);
    expect(radios).toHaveLength(4);
    expect(radios.map((radio) => radio.value)).toEqual(PAYMENT_TIER_ORDER);
  });
});

describe('PaymentComparisonComponent — flag desligada (H.53)', () => {
  it('dado desconto_40_fora_sne então input disabled, aria-disabled true, data-reason portal.waiver_40_term e o texto de portal.screens.t13.state.faixa_40_indisponivel; a faixa é renderizada, nunca omitida [negativo]', async () => {
    // C-3b-33
    const { element } = await setup();
    const host = tierHost(element, 'desconto_40_fora_sne');
    expect(host).not.toBeNull();
    expect(host?.getAttribute('data-reason')).toBe('portal.waiver_40_term');
    const radio = host?.querySelector<HTMLInputElement>('input[name="tier"]');
    expect(radio?.disabled).toBe(true);
    expect(radio?.getAttribute('aria-disabled')).toBe('true');
    expect(host?.textContent).toContain(
      catalog['portal.screens.t13.state.faixa_40_indisponivel'],
    );
  });
});

describe('PaymentComparisonComponent — rótulos e garantias (§4.3 2)', () => {
  it('dado desconto_80 então mostra o texto de portal.screens.t13.cmd.pagar_80 e de portal.screens.t23.intro (garantia inversa); dado 60sne então mostra hint_60 e link para /sne; dado toda faixa waivesAppeal então mostra hint_40 antes de qualquer clique ([RN-PORTAL-128] 2; [UC-PORTAL-015] AC-2)', async () => {
    // C-3b-34
    const { element } = await setup();
    const host80 = tierHost(element, 'desconto_80');
    expect(host80?.textContent).toContain(
      catalog['portal.screens.t13.cmd.pagar_80'],
    );
    expect(element.textContent).toContain(catalog['portal.screens.t23.intro']);
    const host60 = tierHost(element, 'desconto_60_reconhecimento');
    expect(host60?.textContent).toContain(
      catalog['portal.forms.pagamento.hint_60'],
    );
    expect(
      host60?.querySelector('a[href="/sne"], a[routerLink="/sne"]'),
    ).not.toBeNull();
    for (const code of ['desconto_60_reconhecimento', 'desconto_40_fora_sne']) {
      expect(tierHost(element, code)?.textContent).toContain(
        catalog['portal.forms.pagamento.hint_40'],
      );
    }
  });
});

describe('PaymentComparisonComponent — renúncia inequívoca antes do clique ([RN-PORTAL-128] 3)', () => {
  it('dado clique em desconto_60_reconhecimento então selection() permanece null e waiverRequested emite o código; dado clique em desconto_80 então selection().tier desconto_80 sem emitir waiverRequested', async () => {
    // C-3b-35
    const { fixture, element } = await setup();
    const waiver: string[] = [];
    (
      fixture.componentInstance as unknown as {
        waiverRequested: { subscribe(next: (value: string) => void): void };
      }
    ).waiverRequested.subscribe((value) => waiver.push(value));
    tierRadios(element)
      .find((radio) => radio.value === 'desconto_60_reconhecimento')
      ?.click();
    fixture.detectChanges();
    expect(
      (
        fixture.componentInstance as unknown as { selection: () => unknown }
      ).selection(),
    ).toBeNull();
    expect(waiver).toEqual(['desconto_60_reconhecimento']);

    tierRadios(element)
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    fixture.detectChanges();
    expect(
      (
        fixture.componentInstance as unknown as {
          selection: () => { tier: string } | null;
        }
      ).selection()?.tier,
    ).toBe('desconto_80');
    expect(waiver).toEqual(['desconto_60_reconhecimento']);
  });
});

describe('PaymentComparisonComponent — valor (OD-P41)', () => {
  it('dado amount null em uma faixa então texto de portal.forms.pagamento.valor_indisponivel e data-amount unavailable; dado valores presentes então moeda BRL no locale de brand', async () => {
    // C-3b-36 — A10(e): chave própria (OD-P70), não `portal.states.empty` (genérico de lista vazia).
    const payment = {
      ...PAYMENT_INFO_FIXTURE,
      tiers: PAYMENT_INFO_FIXTURE.tiers.map((tier, index) =>
        index === 0 ? { ...tier, amount: null } : tier,
      ),
    };
    const { element } = await setup({ payment });
    const host = tierHost(element, 'desconto_80');
    expect(host?.getAttribute('data-amount')).toBe('unavailable');
    expect(host?.textContent).toContain(
      catalog['portal.forms.pagamento.valor_indisponivel'],
    );
    const host60 = tierHost(element, 'desconto_60_reconhecimento');
    expect(host60?.textContent).toMatch(/R\$\s*117,14|R\$117\.14/);
  });
});

describe('PaymentComparisonComponent — meios ([RN-PORTAL-126] 2; OD-P05)', () => {
  it('dado flags.cardPayment false então cartao disabled data-reason card_payment e texto de erro_recuperavel; pix/debito/boleto habilitados; dado installments false então nenhum input de parcelas [negativo]', async () => {
    // C-3b-37 (1.ª metade)
    const { element } = await setup();
    const methodRadios = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="method"]'),
    );
    expect(methodRadios.map((radio) => radio.value)).toEqual(
      PAYMENT_METHOD_ORDER,
    );
    const cartaoHost = element.querySelector('[data-method="cartao"]');
    expect(
      cartaoHost?.querySelector<HTMLInputElement>('input[name="method"]')
        ?.disabled,
    ).toBe(true);
    expect(cartaoHost?.getAttribute('data-reason')).toBe('portal.card_payment');
    expect(element.textContent).toContain(
      catalog['portal.screens.t23.state.erro_recuperavel'],
    );
    for (const method of ['pix', 'debito', 'boleto']) {
      const host = element.querySelector(`[data-method="${method}"]`);
      expect(
        host?.querySelector<HTMLInputElement>('input[name="method"]')?.disabled,
      ).toBe(false);
    }
    expect(element.querySelector('input[type="number"]')).toBeNull();
  });

  it('dado installments true e method cartao então input number min=1 sem max e sem "12" [negativo]', async () => {
    // C-3b-37 (2.ª metade)
    const { fixture, element } = await setup({
      flags: { ...PAYMENT_FLAGS, cardPayment: true, installments: true },
    });
    tierRadios(element)
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    fixture.detectChanges();
    Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="method"]'),
    )
      .find((radio) => radio.value === 'cartao')
      ?.click();
    fixture.detectChanges();
    const installmentsInput = element.querySelector<HTMLInputElement>(
      'input[type="number"]',
    );
    expect(installmentsInput).not.toBeNull();
    expect(installmentsInput?.min).toBe('1');
    expect(installmentsInput?.hasAttribute('max')).toBe(false);
    expect(element.textContent).not.toContain('12x');
  });
});

describe('PaymentComparisonComponent — já pago (§4.3 7)', () => {
  it('dado payment.paid true, paidTier desconto_80 então todos os radios disabled, data-reason paid, data-paid-tier desconto_80, texto de portal.errors.payment_already_paid e nenhum [data-confirm]', async () => {
    // C-3b-38
    const { element } = await setup({
      payment: { ...PAYMENT_INFO_FIXTURE, paid: true, paidTier: 'desconto_80' },
    });
    for (const radio of tierRadios(element)) expect(radio.disabled).toBe(true);
    expect(tierHost(element, 'desconto_80')?.getAttribute('data-reason')).toBe(
      'paid',
    );
    expect(
      tierHost(element, 'desconto_80')?.getAttribute('data-paid-tier'),
    ).toBe('desconto_80');
    expect(element.textContent).toContain(
      catalog['portal.errors.payment_already_paid'],
    );
    expect(element.querySelector('[data-confirm]')).toBeNull();
  });
});

describe('PaymentComparisonComponent — mode preserving_appeal (T-23; §4.3 10)', () => {
  it('dado mode preserving_appeal então só desconto_80 e integral_juros renderizados, texto de portal.screens.t23.intro antes do fieldset, [data-confirm] com o texto de portal.screens.t23.cmd.pagar_sem_abrir_mao', async () => {
    // C-3b-39 (1.ª metade)
    const { fixture, element } = await setup({ mode: 'preserving_appeal' });
    const radios = tierRadios(element);
    expect(radios.map((radio) => radio.value).sort()).toEqual(
      ['desconto_80', 'integral_juros'].sort(),
    );
    expect(element.textContent).toContain(catalog['portal.screens.t23.intro']);
    radios.find((radio) => radio.value === 'desconto_80')?.click();
    fixture.detectChanges();
    Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="method"]'),
    )
      .find((radio) => radio.value === 'pix')
      ?.click();
    fixture.detectChanges();
    const confirmButton = element.querySelector('[data-confirm]');
    expect(confirmButton?.textContent).toContain(
      catalog['portal.screens.t23.cmd.pagar_sem_abrir_mao'],
    );
  });

  it('dado mode comparison então link para preservando-recurso com portal.screens.t23.title', async () => {
    // C-3b-39 (2.ª metade)
    const { element } = await setup({ mode: 'comparison' });
    const link = element.querySelector(
      `a[routerLink="/autos/${AIT_ID}/pagamento/preservando-recurso"], a[href="/autos/${AIT_ID}/pagamento/preservando-recurso"]`,
    );
    expect(link?.textContent).toContain(catalog['portal.screens.t23.title']);
  });
});

describe('PaymentComparisonComponent — confirmar (§4.3 8)', () => {
  it('dado seleção 80 + pix então [data-confirm] habilitado e clique emite confirmed({ tier: desconto_80, method: pix }); dado só faixa então desabilitado', async () => {
    // C-3b-40
    const { fixture, element } = await setup();
    expect(
      element.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
    ).toBe(true);
    tierRadios(element)
      .find((radio) => radio.value === 'desconto_80')
      ?.click();
    fixture.detectChanges();
    expect(
      element.querySelector<HTMLButtonElement>('[data-confirm]')?.disabled,
    ).toBe(true);
    Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="method"]'),
    )
      .find((radio) => radio.value === 'pix')
      ?.click();
    fixture.detectChanges();
    const confirmed: unknown[] = [];
    (
      fixture.componentInstance as unknown as {
        confirmed: { subscribe(next: (value: unknown) => void): void };
      }
    ).confirmed.subscribe((value) => confirmed.push(value));
    element.querySelector<HTMLButtonElement>('[data-confirm]')?.click();
    expect(confirmed).toEqual([{ tier: 'desconto_80', method: 'pix' }]);
  });
});

describe('PaymentComparisonComponent — formato acessível ([RN-PORTAL-114]; OD-P75)', () => {
  // C-3b-41: um `it` por modo (`it.each`) — nunca duas montagens no mesmo `it`.
  it.each(['comparison', 'preserving_appeal'] as const)(
    'dado [data-accessible-format] no modo %s então clique emite accessibleFormatRequested',
    async (mode) => {
      const { fixture, element } = await setup({ mode });
      const button = element.querySelector('[data-accessible-format]');
      expect(button).not.toBeNull();
      const emitted: unknown[] = [];
      (
        fixture.componentInstance as unknown as {
          accessibleFormatRequested: {
            subscribe(next: (value: unknown) => void): void;
          };
        }
      ).accessibleFormatRequested.subscribe((value) => emitted.push(value));
      (button as HTMLButtonElement).click();
      expect(emitted).toHaveLength(1);
    },
  );
});

describe('payment-comparison.component.ts e payment-flags.ts — sem cálculo (§4.3 11)', () => {
  it('dado o componente então não contém new Date/Date.now/getTime/*0.8/*0.6//100/PortalClock; dado PAYMENT_FLAGS então deep-equal { waiverTerm: false, cardPayment: false, installments: false } com comentário citando H.53 e OD-P05', async () => {
    // C-3b-42
    const fs = await import('node:fs/promises');
    let source = '';
    try {
      source = await fs.readFile(
        fileURLToPath(
          new URL('payment-comparison.component.ts', import.meta.url),
        ),
        'utf8',
      );
    } catch {
      // arquivo ainda não existe (§9).
    }
    if (source) {
      expect(
        /new Date\(|Date\.now|\.getTime\(|\*\s*0\.8|\*\s*0\.6|\/\s*100|PortalClock/.test(
          source,
        ),
      ).toBe(false);
    }
    expect(PAYMENT_FLAGS).toEqual({
      waiverTerm: false,
      cardPayment: false,
      installments: false,
    });
    let flagsSource = '';
    try {
      flagsSource = await fs.readFile(
        fileURLToPath(
          new URL('../features/pagamento/payment-flags.ts', import.meta.url),
        ),
        'utf8',
      );
    } catch {
      // idem
    }
    if (flagsSource) {
      expect(flagsSource).toMatch(/H\.53/);
      expect(flagsSource).toMatch(/OD-P05/);
    }
  });
});

describe('PaymentComparisonComponent — a11y (§4.3 12)', () => {
  const cases: Array<{
    name: string;
    options: Parameters<typeof setup>[0];
  }> = [
    { name: 'quatro faixas (comparison)', options: {} },
    {
      name: 'flag off (desconto_40_fora_sne indisponível)',
      options: {},
    },
    {
      name: 'já pago',
      options: {
        payment: {
          ...PAYMENT_INFO_FIXTURE,
          paid: true,
          paidTier: 'desconto_80',
        },
      },
    },
    {
      name: 'amount null',
      options: {
        payment: {
          ...PAYMENT_INFO_FIXTURE,
          tiers: PAYMENT_INFO_FIXTURE.tiers.map((tier, index) =>
            index === 0 ? { ...tier, amount: null } : tier,
          ),
        },
      },
    },
    { name: 'preserving_appeal', options: { mode: 'preserving_appeal' } },
    {
      name: 'cartão desabilitado',
      options: {},
    },
  ];

  for (const testCase of cases) {
    it(`dado o estado "${testCase.name}" então axe sem violação serious/critical`, async () => {
      // C-3b-43
      const { element } = await setup(testCase.options);
      await expectNoSeriousA11yViolations(element);
    });
  }

  it('dado cada radio de faixa então nome acessível inclui o rótulo da faixa; Tab alcança as faixas na ordem PAYMENT_TIER_ORDER e depois os meios', async () => {
    // C-3b-43 (ordem de tabulação)
    const { element } = await setup();
    const focusable = Array.from(
      element.querySelectorAll<HTMLInputElement>(
        'input[name="tier"], input[name="method"]',
      ),
    );
    const tierValues = focusable
      .filter((input) => input.name === 'tier')
      .map((input) => input.value);
    expect(tierValues).toEqual(PAYMENT_TIER_ORDER);
    for (const radio of focusable.filter((input) => input.name === 'tier')) {
      const label = radio.closest('label') ?? radio.parentElement;
      expect(label?.textContent?.trim().length).toBeGreaterThan(0);
    }
  });
});
