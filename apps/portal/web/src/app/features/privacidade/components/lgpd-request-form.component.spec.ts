// R-0014 TASK-0017 (Inspector, iteração 2). CTG-0003c §1/§3.7/§6 (T-24) —
// `LgpdRequestFormComponent`; arquivo inteiramente novo (§1: "passo 2 projetado no ServiceWizard")
// — "Cannot find module" até TASK-0018 (esperado, §9). API assumida pelo padrão real e já
// congelado do par 2 de um formulário projetado equivalente
// (`features/defesa/components/defesa-previa-form.component.ts`: `model<Record<string,unknown>|
// null>('values')`, `fields`, `disabled`, `draftRequested`) — nenhuma API nova é inventada, só o
// campo que o contrato §6 nomeia: rádios `scope` (portal.forms.meus_dados.escopo) com hint
// portal.forms.meus_dados.hint_declaracao_completa. `LgpdScope` = `PrivacidadeFacade.LgpdScope`
// (§3.7): confirmacao | declaracao_completa | correcao | eliminacao.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { LgpdRequestFormComponent } from './lgpd-request-form.component'; // §9: "Cannot find module" esperado.
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;
const SCOPES = [
  'confirmacao',
  'declaracao_completa',
  'correcao',
  'eliminacao',
] as const;

async function setup(
  inputs: {
    values?: Record<string, unknown> | null;
    fields?: readonly string[];
    disabled?: boolean;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      LgpdRequestFormComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(LgpdRequestFormComponent);
  fixture.componentRef.setInput('values', inputs.values ?? null);
  fixture.componentRef.setInput('fields', inputs.fields ?? []);
  fixture.componentRef.setInput('disabled', inputs.disabled ?? false);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('LgpdRequestFormComponent — rádios de escopo (§6 T-24; §3.7)', () => {
  it('dado o formulário então o rótulo portal.forms.meus_dados.escopo, o hint hint_declaracao_completa e um rádio por LgpdScope aparecem', async () => {
    const { element } = await setup();
    expect(element.textContent).toContain(
      catalog['portal.forms.meus_dados.escopo'],
    );
    expect(element.textContent).toContain(
      catalog['portal.forms.meus_dados.hint_declaracao_completa'],
    );
    const radios = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="scope"]'),
    );
    expect(radios.map((radio) => radio.value).sort()).toEqual(
      [...SCOPES].sort(),
    );
  });
});

describe('LgpdRequestFormComponent — emissão de valores (values model)', () => {
  it('dado o rádio declaracao_completa marcado então values() é atualizado com { scope: declaracao_completa }', async () => {
    const { fixture, element } = await setup();
    const radio = element.querySelector<HTMLInputElement>(
      'input[name="scope"][value="declaracao_completa"]',
    )!;
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    expect((fixture.componentInstance as any).values()).toEqual(
      expect.objectContaining({ scope: 'declaracao_completa' }),
    );
  });
});

describe('LgpdRequestFormComponent — erros de campo (§6; core/field-errors.directive.ts)', () => {
  it("dado fields ['scope'] então cada rádio name=scope é marcado aria-invalid pela diretiva", async () => {
    const { element } = await setup({ fields: ['scope'] });
    const radios = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[name="scope"]'),
    );
    expect(radios.length).toBeGreaterThan(0);
    for (const radio of radios) {
      expect(radio.getAttribute('aria-invalid')).toBe('true');
    }
  });
});

describe('LgpdRequestFormComponent — a11y por estado (§7.3)', () => {
  it('dado vazio então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado erro de campo então axe sem violação serious/critical', async () => {
    const { element } = await setup({ fields: ['scope'] });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado disabled (submitting) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ disabled: true });
    await expectNoSeriousA11yViolations(element);
  });
});
