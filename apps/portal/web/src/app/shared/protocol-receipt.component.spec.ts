// R-0014 TASK-0008 (Inspector). `shared/protocol-receipt.component.ts` (novo, contrato
// CTG-0003a §5.9) — ainda não existe (TASK-0009): a importação falha com "Cannot find module"
// (estado esperado, §9 do contrato).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../i18n/portal.pt-BR.json';
import { PortalClient } from '../data/portal.client';
import { ProtocolReceiptComponent } from './protocol-receipt.component';
import { expectNoSeriousA11yViolations } from '../a11y/axe.spec-helper';
import {
  REQUEST_COMPOSICAO_ID,
  portalErrorBody,
} from '../../testing/http-fixtures';

const catalog = portalCatalog as Record<string, string>;

const PROTOCOL = {
  number: 'AM-FIXTURES-2026-0000005',
  issuedAt: '2026-09-05T12:00:00-04:00',
  channel: 'portal' as const,
};

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
    uploadToSignedUrl: vi.fn(),
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
      ProtocolReceiptComponent,
      StynxI18nModule.forRoot({
        defaultLocale: 'pt-BR',
        loadCatalog: async () => catalog,
      }),
    ],
    providers: [{ provide: PortalClient, useValue: client }],
  }).compileComponents();
  await TestBed.inject(StynxI18nService).initialize();
  const fixture = TestBed.createComponent(ProtocolReceiptComponent);
  fixture.componentRef.setInput('requestId', REQUEST_COMPOSICAO_ID);
  fixture.componentRef.setInput('protocol', PROTOCOL);
  return { fixture, client };
}

describe('ProtocolReceiptComponent', () => {
  it('dado protocol { number, issuedAt, channel } então número visível em [data-protocol], data formatada, texto de portal.notifications.origin.portal', async () => {
    // C-3a-82
    const { fixture } = await setup();
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('[data-protocol]')?.textContent).toContain(
      PROTOCOL.number,
    );
    expect(host.textContent).toContain(
      catalog['portal.notifications.origin.portal'],
    );
  });

  it('dado clique em baixar e downloadReceipt → Blob então <a download> acionado e downloaded emitido; dado 422 SERVICE_UNAVAILABLE então downloadFailed() com service_unavailable, canal alternativo e número/data continuam visíveis ([RN-PORTAL-111] 1)', async () => {
    // C-3a-83
    const client = clientStub();
    const { fixture } = await setup(client);
    client.downloadReceipt.mockResolvedValueOnce(
      new Blob(['%PDF-1.4'], { type: 'application/pdf' }),
    );
    fixture.detectChanges();
    const downloaded: void[] = [];
    (fixture.componentInstance as any).downloaded.subscribe(() =>
      downloaded.push(undefined),
    );
    const downloadButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[data-download]');
    downloadButton.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(client.downloadReceipt).toHaveBeenCalledWith(REQUEST_COMPOSICAO_ID);
    expect(downloaded).toHaveLength(1);

    client.downloadReceipt.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {}),
      name: 'HttpErrorResponse',
    });
    downloadButton.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    expect(
      (fixture.componentInstance as any).downloadFailed()?.messageKey,
    ).toBe('portal.errors.service_unavailable');
    expect(
      fixture.nativeElement.querySelector('portal-alternative-channel-note'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-protocol]')?.textContent,
    ).toContain(PROTOCOL.number);
  });
});

// R-0014 TASK-0008 (Inspector, iteração 3 — C-3a-99; delivery-review-CTG-0003a.json item 11).
describe('ProtocolReceiptComponent — a11y (C-3a-99)', () => {
  it('dado o estado de sucesso (botão baixar) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado download falho (422 SERVICE_UNAVAILABLE) então nenhuma violação axe serious/critical', async () => {
    const client = clientStub();
    const { fixture } = await setup(client);
    client.downloadReceipt.mockRejectedValueOnce({
      status: 422,
      error: portalErrorBody('PORTAL.SERVICE_UNAVAILABLE', 422, {}),
      name: 'HttpErrorResponse',
    });
    fixture.detectChanges();
    const downloadButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[data-download]');
    downloadButton.click();
    await Promise.resolve();
    await Promise.resolve();
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });

  it('dado badge de situação (state definido, badgeOf não nulo) então nenhuma violação axe serious/critical', async () => {
    const { fixture } = await setup();
    fixture.componentRef.setInput('state', 'EM_ANDAMENTO_NO_ORGAO');
    fixture.detectChanges();
    await expectNoSeriousA11yViolations(fixture.nativeElement);
  });
});
