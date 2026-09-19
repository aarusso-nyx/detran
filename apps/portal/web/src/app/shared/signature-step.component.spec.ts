// R-0014 TASK-0008 (Inspector). `shared/signature-step.component.ts` (novo, contrato
// CTG-0003a §5.8) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato).
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { SessionFacade } from '../core/session.facade';
import { createSessionFacadeStub } from '../../testing/session-facade.stub';
import { SignatureStepComponent } from './signature-step.component';
import { AttachmentUploaderComponent } from './attachment-uploader.component';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';

const catalog = portalCatalog as Record<string, string>;

async function setup(
  assuranceLevel: 'simples' | 'avancada' | 'qualificada' | null,
) {
  const session = createSessionFacadeStub({ active: true, assuranceLevel });
  await TestBed.configureTestingModule({
    imports: [
      SignatureStepComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: SessionFacade, useValue: session }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(SignatureStepComponent);
  fixture.componentRef.setInput('actKey', 'defesa_previa');
  fixture.componentRef.setInput('resumeRoute', '/autos/x/defesa/nova');
  return { fixture, session };
}

describe('SignatureStepComponent — nível insuficiente', () => {
  it('dado required avancada e nível simples então portal-assurance-explainer com textos t27; ao escolher biometric e clicar então SessionFacade.requestElevation e elevationRequested com o resultado', async () => {
    // C-3a-77
    const { fixture, session } = await setup('simples');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const explainer = host.querySelector('portal-assurance-explainer');
    expect(explainer).not.toBeNull();
    expect(host.textContent).toContain(catalog['portal.screens.t27.intro']);
    expect(host.textContent).toContain(
      catalog['portal.screens.t27.field.nivel_faltante'],
    );
    expect(host.textContent).toContain(
      catalog['portal.screens.t27.cmd.elevar'],
    );

    const elevationRequested: unknown[] = [];
    (fixture.componentInstance as any).elevationRequested.subscribe(
      (value: unknown) => elevationRequested.push(value),
    );
    const radio: HTMLInputElement = host.querySelector(
      'input[type="radio"][value="biometric"]',
    )!;
    radio.click();
    fixture.detectChanges();
    const elevarButton: HTMLButtonElement = host.querySelector(
      'button[data-elevar]',
    )!;
    elevarButton.click();
    await Promise.resolve();
    expect(session.requestElevationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        targetLevel: 'avancada',
        method: 'biometric',
        resumeRoute: '/autos/x/defesa/nova',
      }),
    );
    expect(elevationRequested).toHaveLength(1);
  });
});

describe('SignatureStepComponent — nível suficiente', () => {
  it('dado required avancada e nível avancada então nenhum explainer; govbr com govbrSignatureRef então signed govbr; upload com uploadRequestId então attachment-uploader e signed upload no attached ([RN-PORTAL-104])', async () => {
    // C-3a-78
    const { fixture } = await setup('avancada');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.componentRef.setInput('govbrSignatureRef', 'ref-govbr');
    fixture.componentRef.setInput(
      'uploadRequestId',
      '00000000-0000-7000-8000-000070400005',
    );
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('portal-assurance-explainer')).toBeNull();

    const signed: unknown[] = [];
    (fixture.componentInstance as any).signed.subscribe((value: unknown) =>
      signed.push(value),
    );
    const govbrButton: HTMLButtonElement = host.querySelector(
      'button[data-method="govbr"]',
    )!;
    govbrButton.click();
    expect(signed).toEqual([{ method: 'govbr', signatureRef: 'ref-govbr' }]);

    const uploadButton: HTMLButtonElement = host.querySelector(
      'button[data-method="upload"]',
    )!;
    uploadButton.click();
    fixture.detectChanges();
    const uploaderDebug = fixture.debugElement.query(
      By.directive(AttachmentUploaderComponent),
    );
    expect(uploaderDebug).not.toBeNull();
    const uploaderInstance =
      uploaderDebug.componentInstance as AttachmentUploaderComponent;
    uploaderInstance.attached.emit({
      localId: 'x',
      filename: 'a.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1,
      sha256: 'x'.repeat(64),
      attachmentId: 'attachment-fixture',
      status: 'done',
      error: null,
    });
    expect(signed).toContainEqual({
      method: 'upload',
      signatureRef: 'attachment-fixture',
    });
  });
});

describe('SignatureStepComponent — required none e qualificada', () => {
  it('dado required none então habilitada com qualquer nível', async () => {
    // C-3a-79 (parte 1)
    const { fixture } = await setup(null);
    fixture.componentRef.setInput('required', 'none');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-assurance-explainer'),
    ).toBeNull();
  });

  it('dado required qualificada então banner assurance_qualified_never_required e nenhum caminho de elevação ([RN-PORTAL-101] c) [negativo]', async () => {
    // C-3a-79 (parte 2)
    const { fixture } = await setup('avancada');
    fixture.componentRef.setInput('required', 'qualificada');
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain(
      catalog['portal.errors.assurance_qualified_never_required'],
    );
    expect(host.querySelector('portal-assurance-explainer')).toBeNull();
    expect(host.querySelector('button[data-elevar]')).toBeNull();
  });
});

describe('SignatureStepComponent — ordem ASSURANCE_ORDER', () => {
  it('dado nível qualificada e required avancada então suficiente; o arquivo não contém tabela ato → nível (o nível vem do input required)', async () => {
    // C-3a-80
    const { fixture } = await setup('qualificada');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('portal-assurance-explainer'),
    ).toBeNull();
  });

  it.todo('OD-P60: origem de signatureRef para method govbr'); // C-3a-81
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('SignatureStepComponent — a11y (C-3a-99)', () => {
  it('dado nível insuficiente (explainer) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup('simples');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado nível suficiente (métodos govbr/upload) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup('avancada');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.componentRef.setInput('govbrSignatureRef', 'ref-govbr');
    fixture.componentRef.setInput(
      'uploadRequestId',
      '00000000-0000-7000-8000-000070400005',
    );
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado o caminho upload escolhido (AttachmentUploader embutido) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup('avancada');
    fixture.componentRef.setInput('required', 'avancada');
    fixture.componentRef.setInput(
      'uploadRequestId',
      '00000000-0000-7000-8000-000070400005',
    );
    fixture.detectChanges();
    const uploadButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[data-method="upload"]',
    );
    uploadButton.click();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado required none então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup(null);
    fixture.componentRef.setInput('required', 'none');
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado required qualificada (banner assurance_qualified_never_required) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup('avancada');
    fixture.componentRef.setInput('required', 'qualificada');
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
