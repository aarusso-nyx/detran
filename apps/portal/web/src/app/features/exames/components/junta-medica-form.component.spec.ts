// R-0014 TASK-0017 (Inspector, iteração 2). CTG-0003c §1/§6 (junta médica) —
// `JuntaMedicaFormComponent`; arquivo inteiramente novo (§1: "passo 2 projetado no ServiceWizard")
// — "Cannot find module" até TASK-0018 (esperado, §9). API assumida pelo padrão real e já
// congelado do par 2 de um formulário projetado equivalente
// (`features/defesa/components/defesa-previa-form.component.ts`: `model<Record<string,unknown>|
// null>('values')`, `fields`, `disabled`, `requestId`, `requirements`, `draftRequested`) — nenhuma
// API nova é inventada aqui, só os dois campos que o contrato §6 nomeia para este formulário:
// `reason` (portal.forms.junta_medica.motivo + hint portal.forms.junta_medica.hint) e o
// `AttachmentUploader` com `hintKey="portal.forms.junta_medica.anexos"`.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../../i18n/portal.pt-BR.json';
import { JuntaMedicaFormComponent } from './junta-medica-form.component'; // §9: "Cannot find module" esperado.
import { expectNoSeriousA11yViolations } from '../../../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  inputs: {
    values?: Record<string, unknown> | null;
    fields?: readonly string[];
    requestId?: string | null;
    disabled?: boolean;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      JuntaMedicaFormComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(JuntaMedicaFormComponent);
  fixture.componentRef.setInput('values', inputs.values ?? null);
  fixture.componentRef.setInput('fields', inputs.fields ?? []);
  fixture.componentRef.setInput('requestId', inputs.requestId ?? null);
  fixture.componentRef.setInput('disabled', inputs.disabled ?? false);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('JuntaMedicaFormComponent — campo reason (§6 junta médica)', () => {
  it('dado o formulário então o campo reason tem o rótulo portal.forms.junta_medica.motivo e o hint portal.forms.junta_medica.hint', async () => {
    const { element } = await setup();
    expect(element.textContent).toContain(
      catalog['portal.forms.junta_medica.motivo'],
    );
    expect(element.textContent).toContain(
      catalog['portal.forms.junta_medica.hint'],
    );
    expect(element.querySelector('[name="reason"]')).not.toBeNull();
  });
});

describe('JuntaMedicaFormComponent — emissão de valores (values model)', () => {
  it('dado texto digitado em reason então values() é atualizado com { reason }', async () => {
    const { fixture, element } = await setup();
    const field =
      element.querySelector<HTMLTextAreaElement>('[name="reason"]')!;
    field.value = 'motivo de fixture';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect((fixture.componentInstance as any).values()).toEqual(
      expect.objectContaining({ reason: 'motivo de fixture' }),
    );
  });
});

describe('JuntaMedicaFormComponent — erros de campo (§6)', () => {
  it("dado fields ['reason'] então o campo é marcado pela diretiva de erros", async () => {
    const { element } = await setup({ fields: ['reason'] });
    const field = element.querySelector('[name="reason"]');
    expect(field?.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('JuntaMedicaFormComponent — anexos com requestId (AttachmentUploader; portal.forms.junta_medica.anexos)', () => {
  it('dado requestId presente então portal-attachment-uploader aparece com o hint de anexos', async () => {
    const { element } = await setup({ requestId: 'r-1' });
    expect(element.querySelector('portal-attachment-uploader')).not.toBeNull();
    expect(element.textContent).toContain(
      catalog['portal.forms.junta_medica.anexos'],
    );
  });

  it('dado sem requestId então portal-attachment-uploader não aparece [negativo]', async () => {
    const { element: withoutRequest } = await setup({ requestId: null });
    expect(
      withoutRequest.querySelector('portal-attachment-uploader'),
    ).toBeNull();
  });
});

describe('JuntaMedicaFormComponent — a11y por estado (§7.3)', () => {
  it('dado vazio então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado erro de campo então axe sem violação serious/critical', async () => {
    const { element } = await setup({ fields: ['reason'] });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado disabled (submitting) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ disabled: true });
    await expectNoSeriousA11yViolations(element);
  });
});
