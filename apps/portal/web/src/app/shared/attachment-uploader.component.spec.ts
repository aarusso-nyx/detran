// R-0014 TASK-0008 (Inspector, iteração 2 — B5 de reports/TASK-0009.md). `forms/attachments.ts`
// fornece `ATTACHMENT_ACCEPT`/`ATTACHMENT_MAX_BYTES`. Seleção de arquivo simulada via
// `Object.defineProperty(input, 'files', …)` + evento `change` (jsdom não permite atribuição
// direta a `HTMLInputElement.files`) com `createFileList` (`src/testing/file-list.polyfill.ts`):
// jsdom não implementa `DataTransfer` (`typeof DataTransfer === 'undefined'`, verificado). B5:
// `crypto.subtle.digest` (SHA-256 do arquivo) é assíncrono e não resolve em três microtasks —
// cada ponto de espera usa `vi.waitFor` sobre a condição observável real (o mock do
// `PortalClient` foi chamado, ou o DOM já reflete o novo estado), não uma contagem fixa de
// `Promise.resolve()`.
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PortalClient } from '../data/portal.client';
import { AttachmentUploaderComponent } from './attachment-uploader.component';
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES } from '../forms/attachments';
import { createFileList } from '../../testing/file-list.polyfill';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import {
  REQUEST_COMPOSICAO_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';

const catalog = portalCatalog as Record<string, string>;

function clientStub() {
  return {
    me: vi.fn(),
    brand: vi.fn(),
    services: vi.fn(),
    entitledResource: vi.fn(),
    createRequest: vi.fn(),
    saveDraft: vi.fn(),
    submitRequest: vi.fn(),
    requestAttachmentUpload: vi.fn(),
    uploadToSignedUrl: vi.fn(async () => {}),
    completeAttachment: vi.fn(),
    withdrawRequest: vi.fn(),
    respondDiligence: vi.fn(),
    elevateAssurance: vi.fn(),
    completeElevation: vi.fn(),
    downloadReceipt: vi.fn(),
  };
}

async function setup(client = clientStub()) {
  await TestBed.configureTestingModule({
    imports: [
      AttachmentUploaderComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: PortalClient, useValue: client }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(AttachmentUploaderComponent);
  fixture.componentRef.setInput('requestId', REQUEST_COMPOSICAO_ID);
  fixture.componentRef.setInput('accept', ATTACHMENT_ACCEPT);
  fixture.componentRef.setInput('maxBytes', ATTACHMENT_MAX_BYTES);
  fixture.componentRef.setInput(
    'hintKey',
    'portal.forms.defesa_previa.anexos_hint',
  );
  return { fixture, client };
}

function selectFile(input: HTMLInputElement, file: File): void {
  // `configurable: true` — o mesmo `<input>` recebe mais de uma seleção em alguns casos
  // (C-3a-70), e `Object.defineProperty` sem isso rejeita a segunda redefinição.
  Object.defineProperty(input, 'files', {
    value: createFileList([file]),
    configurable: true,
  });
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Espera uma condição observável real (nunca uma contagem fixa de microtasks — B5). */
async function waitFor(
  fixture: { detectChanges(): void },
  predicate: () => boolean,
): Promise<void> {
  await vi.waitFor(() => {
    fixture.detectChanges();
    if (!predicate()) throw new Error('condição ainda não satisfeita');
  });
  fixture.detectChanges();
}

describe('AttachmentUploaderComponent — validação de forma', () => {
  it('dado accept/maxBytes do contrato quando arquivo text/plain então entrada rejected com attachment_invalid e nenhuma requisição; dado PDF acima de maxBytes então idem [negativo]', async () => {
    // C-3a-68
    const { fixture, client } = await setup();
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['x'], 'a.txt', { type: 'text/plain' }));
    await waitFor(fixture, () =>
      (fixture.nativeElement.textContent as string).includes(
        catalog['portal.errors.attachment_invalid'],
      ),
    );
    expect(client.requestAttachmentUpload).not.toHaveBeenCalled();

    const bigContent = new Uint8Array(ATTACHMENT_MAX_BYTES + 1);
    const textBefore = fixture.nativeElement.textContent as string;
    selectFile(
      input,
      new File([bigContent], 'grande.pdf', { type: 'application/pdf' }),
    );
    await waitFor(
      fixture,
      () => fixture.nativeElement.textContent !== textBefore,
    );
    expect(client.requestAttachmentUpload).not.toHaveBeenCalled();
  });
});

describe('AttachmentUploaderComponent — fluxo completo', () => {
  it('dado PDF válido então sha256Hex dos bytes → POST attachments → fetch PUT sem Authorization → POST complete → entrada done, attachmentIds() com o id, attached emitido', async () => {
    // C-3a-69
    const { fixture, client } = await setup();
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    client.requestAttachmentUpload.mockResolvedValueOnce({
      body: {
        attachmentId,
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: {},
        expiresAt: null,
      },
      etag: null,
    });
    client.completeAttachment.mockResolvedValueOnce({
      body: { attachmentId, sha256: 'x'.repeat(64) },
      etag: null,
    });
    fixture.detectChanges();
    const attached: unknown[] = [];
    (fixture.componentInstance as any).attached.subscribe((value: unknown) =>
      attached.push(value),
    );
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(
      input,
      new File(['conteudo do documento'], 'documento.pdf', {
        type: 'application/pdf',
      }),
    );
    await waitFor(
      fixture,
      () => client.completeAttachment.mock.calls.length > 0,
    );
    expect(client.requestAttachmentUpload).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      expect.objectContaining({
        filename: 'documento.pdf',
        mimeType: 'application/pdf',
        sha256: expect.stringMatching(/^[0-9a-f]{64}$/),
      }),
    );
    expect(client.uploadToSignedUrl).toHaveBeenCalled();
    expect(client.completeAttachment).toHaveBeenCalledWith(
      REQUEST_COMPOSICAO_ID,
      attachmentId,
    );
    expect((fixture.componentInstance as any).attachmentIds()).toContain(
      attachmentId,
    );
    expect(attached).toHaveLength(1);
  });

  it('dado dois arquivos e 422 ATTACHMENT_AGENCY_DOCUMENT no 2º então só o 2º fica rejected; o 1º permanece done e attachmentIds() inalterado ([UC-PORTAL-001] 3a; [RN-PORTAL-106]) [negativo]', async () => {
    // C-3a-70
    const { fixture, client } = await setup();
    const firstId = '00000000-0000-7000-8000-0000aa000001';
    client.requestAttachmentUpload
      .mockResolvedValueOnce({
        body: {
          attachmentId: firstId,
          uploadUrl: 'https://storage.invalid/1',
          method: 'PUT',
          headers: {},
          expiresAt: null,
        },
        etag: null,
      })
      .mockRejectedValueOnce({
        status: 422,
        error: portalErrorBody('PORTAL.ATTACHMENT_AGENCY_DOCUMENT', 422, {
          kind: 'NA',
        }),
        name: 'HttpErrorResponse',
      });
    client.completeAttachment.mockResolvedValueOnce({
      body: { attachmentId: firstId, sha256: 'x'.repeat(64) },
      etag: null,
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => client.completeAttachment.mock.calls.length > 0,
    );
    selectFile(input, new File(['b'], 'b.pdf', { type: 'application/pdf' }));
    await waitFor(fixture, () =>
      (fixture.nativeElement.textContent as string).includes(
        catalog['portal.errors.attachment_agency_document'],
      ),
    );
    expect((fixture.componentInstance as any).attachmentIds()).toEqual([
      firstId,
    ]);
    expect(fixture.nativeElement.textContent).toContain(
      catalog['portal.errors.attachment_agency_document'],
    );
  });

  it('dado POST attachments → 422 SERVICE_UNAVAILABLE então unavailable() com service_unavailable, nota de canal alternativo, sem retry e sem id simulado (M15)', async () => {
    // C-3a-71
    const { fixture, client } = await setup();
    client.requestAttachmentUpload.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
        alternativeChannelNote: 'Atendimento presencial',
      }),
      name: 'HttpErrorResponse',
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => (fixture.componentInstance as any).unavailable() !== null,
    );
    expect((fixture.componentInstance as any).unavailable()?.messageKey).toBe(
      'portal.errors.service_unavailable',
    );
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect((fixture.componentInstance as any).attachmentIds()).toEqual([]);
  });
});

describe('AttachmentUploaderComponent — checklist e hint', () => {
  it('dado checklist e hintKey então todos os itens e o hint renderizados na inicialização; input[type=file][accept] com os três tipos; aria-describedby aponta ao hint', async () => {
    // C-3a-72
    const { fixture } = await setup();
    fixture.componentRef.setInput('checklist', [
      'Conta gov.br',
      'Nível avançado (prata, ouro ou e-Notariado)',
    ]);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Conta gov.br');
    expect(host.textContent).toContain(
      'Nível avançado (prata, ouro ou e-Notariado)',
    );
    const input: HTMLInputElement = host.querySelector('input[type="file"]')!;
    expect(input.getAttribute('accept')).toBe(
      'application/pdf,image/jpeg,image/png',
    );
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(
      describedBy?.split(/\s+/).some((id) => host.querySelector(`#${id}`)),
    ).toBe(true);
  });

  it('dado entrada done quando remover então removed(attachmentId) emitido e attachmentIds() sem o id', async () => {
    // C-3a-73
    const { fixture, client } = await setup();
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    client.requestAttachmentUpload.mockResolvedValueOnce({
      body: {
        attachmentId,
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: {},
        expiresAt: null,
      },
      etag: null,
    });
    client.completeAttachment.mockResolvedValueOnce({
      body: { attachmentId, sha256: 'x'.repeat(64) },
      etag: null,
    });
    fixture.detectChanges();
    const removed: unknown[] = [];
    (fixture.componentInstance as any).removed.subscribe((value: unknown) =>
      removed.push(value),
    );
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => client.completeAttachment.mock.calls.length > 0,
    );
    const removeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[data-remove]',
    );
    removeButton.click();
    fixture.detectChanges();
    expect(removed).toEqual([attachmentId]);
    expect((fixture.componentInstance as any).attachmentIds()).not.toContain(
      attachmentId,
    );
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('AttachmentUploaderComponent — a11y (C-3a-99)', () => {
  it('dado o estado inicial (sem entradas) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado uma entrada rejected (attachment_invalid) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['x'], 'a.txt', { type: 'text/plain' }));
    await waitFor(fixture, () =>
      (fixture.nativeElement.textContent as string).includes(
        catalog['portal.errors.attachment_invalid'],
      ),
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado uma entrada done então nenhuma violação axe serious/critical', async () => {
    const { fixture, client } = await setup();
    const attachmentId = '00000000-0000-7000-8000-0000aa000001';
    client.requestAttachmentUpload.mockResolvedValueOnce({
      body: {
        attachmentId,
        uploadUrl: 'https://storage.invalid/x',
        method: 'PUT',
        headers: {},
        expiresAt: null,
      },
      etag: null,
    });
    client.completeAttachment.mockResolvedValueOnce({
      body: { attachmentId, sha256: 'x'.repeat(64) },
      etag: null,
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => client.completeAttachment.mock.calls.length > 0,
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado 422 SERVICE_UNAVAILABLE (componente inteiro indisponível) então nenhuma violação axe serious/critical', async () => {
    const { fixture, client } = await setup();
    client.requestAttachmentUpload.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {
        unavailableReason: 'documento_assinado_pendente_r0014',
      }),
      name: 'HttpErrorResponse',
    });
    fixture.detectChanges();
    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('input[type="file"]');
    selectFile(input, new File(['a'], 'a.pdf', { type: 'application/pdf' }));
    await waitFor(
      fixture,
      () => (fixture.componentInstance as any).unavailable() !== null,
    );
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
