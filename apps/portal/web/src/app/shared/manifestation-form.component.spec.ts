// R-0014 TASK-0017 (Inspector). CTG-0003c §5.6 — `ManifestationFormComponent`; arquivo
// inteiramente novo (§1) — "Cannot find module" até TASK-0018 (esperado, §9).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { ManifestationFormComponent } from './manifestation-form.component'; // §9.
import { MANIFESTATION_CREATED_FIXTURE } from '../../testing/http-fixtures-pair3';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  inputs: {
    sessionActive?: boolean;
    status?: string;
    fields?: readonly string[];
    receipt?: unknown;
  } = {},
) {
  await TestBed.configureTestingModule({
    imports: [
      ManifestationFormComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [provideRouter([{ path: '**', children: [] }])],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ManifestationFormComponent);
  fixture.componentRef.setInput('sessionActive', inputs.sessionActive ?? true);
  fixture.componentRef.setInput('status', inputs.status ?? 'idle');
  fixture.componentRef.setInput('fields', inputs.fields ?? []);
  fixture.componentRef.setInput('receipt', inputs.receipt ?? null);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('ManifestationFormComponent — anonimato forçado sem sessão (§5.6)', () => {
  it('dado sessionActive false então não há checkbox anonymous, sem AttachmentUploader no DOM [negativo] e submitted emite anonymous:true', async () => {
    // C-3c-96 (1.ª parte)
    const { fixture, element } = await setup({ sessionActive: false });
    expect(element.querySelector('input[name="anonymous"]')).toBeNull();
    expect(element.querySelector('portal-attachment-uploader')).toBeNull();
    const captured: unknown[] = [];
    (fixture.componentInstance as any).submitted.subscribe((body: unknown) =>
      captured.push(body),
    );
    const kindRadio = element.querySelector<HTMLInputElement>(
      'input[name="kind"][value="reclamacao"]',
    )!;
    kindRadio.checked = true;
    kindRadio.dispatchEvent(new Event('change', { bubbles: true }));
    const textarea = element.querySelector<HTMLTextAreaElement>(
      'textarea[name="text"]',
    )!;
    textarea.value = 'texto de fixture';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    const form = element.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(captured).toHaveLength(1);
    expect((captured[0] as { anonymous: boolean }).anonymous).toBe(true);
  });

  it('dado sessionActive true então o checkbox anonymous existe', async () => {
    // C-3c-96 (2.ª parte)
    const { element: withSession } = await setup({ sessionActive: true });
    expect(withSession.querySelector('input[name="anonymous"]')).not.toBeNull();
  });
});

describe('ManifestationFormComponent — recebimento irrecusável (§5.6; RN-109 1/2)', () => {
  it('dado kind escolhido e text vazio quando submit então submitted é emitido com o corpo tal como está; o DOM não contém campo de motivo/categoria de causa obrigatória [negativo]', async () => {
    // C-3c-97
    const { fixture, element } = await setup();
    const captured: unknown[] = [];
    (fixture.componentInstance as any).submitted.subscribe((body: unknown) =>
      captured.push(body),
    );
    const kindRadio = element.querySelector<HTMLInputElement>(
      'input[name="kind"][value="sugestao"]',
    )!;
    kindRadio.checked = true;
    kindRadio.dispatchEvent(new Event('change', { bubbles: true }));
    const form = element.querySelector('form')!;
    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    expect(captured).toHaveLength(1);
    expect(element.querySelector('[name="motivo"], [name="causa"]')).toBeNull();
  });
});

describe('ManifestationFormComponent — a11y por estado (§5.6/§7.3 — cobertura integral)', () => {
  it('dado formulário vazio (sessionActive true) então axe sem violação serious/critical', async () => {
    const { element } = await setup();
    await expectNoSeriousA11yViolations(element);
  });

  it('dado sessionActive false (anônimo forçado) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ sessionActive: false });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado erro de campo (kind inválido) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ fields: ['kind'] });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado submitting então axe sem violação serious/critical', async () => {
    const { element } = await setup({ status: 'submitting' });
    await expectNoSeriousA11yViolations(element);
  });

  it('dado comprovante (receipt) então axe sem violação serious/critical', async () => {
    const { element } = await setup({ receipt: MANIFESTATION_CREATED_FIXTURE });
    await expectNoSeriousA11yViolations(element);
  });
});
