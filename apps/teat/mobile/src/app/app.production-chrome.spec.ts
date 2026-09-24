import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it, vi } from 'vitest';
import type {
  MobileEntityDraft,
  MobileSessionContext,
} from '@stynx-nyx/mobile-runtime';
import { EncryptedStoreFixture } from '../testing/encrypted-store.fixture';
import { LocalActStore } from './data/local/local-act.store';
import { readMobileProductionSource } from '../testing/mobile-source';
import { loadMobileRuntime } from '../testing/runtime-module';
import * as printerRuntime from './shared/mobile-printer.port';

async function loadBodycamRuntime(): Promise<Record<string, unknown>> {
  return loadMobileRuntime('core/bodycam-indicator.component');
}

it('dado bootstrap de produção quando inspecionado então instala STYNX auth, HTTP, router e singleton guard context sem providers por rota', () => {
  const main = readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8');
  const routes = readMobileProductionSource('app.routes.ts');
  const bootstrap = readMobileProductionSource('core/bootstrap.store.ts');
  expect(main).toContain('provideDetranAuthenticatedApp');
  expect(main).toContain('provideHttpClient');
  expect(main).toContain('provideRouter');
  expect(main).toMatch(/sessionMode\s*:\s*['"]bearer['"]/);
  expect(main).toMatch(/loadCatalog/);
  expect(main).toContain('TEAT_GUARD_CONTEXT');
  expect(routes).not.toMatch(/providers\s*:/);
  expect(bootstrap).toContain('StynxSessionService');
  expect(bootstrap).toMatch(/cognito:groups/);
  expect(bootstrap).toMatch(/claims\[['"]roles['"]\]/);
  expect(bootstrap).not.toMatch(/roles:\s*\[\]/);
});

it('dado AppComponent quando renderizado então monta uma única FieldShell, bodycam obrigatória e RouterOutlet', () => {
  const source = readMobileProductionSource('app.component.ts');
  expect(source).toContain('FieldShell');
  expect(source).toContain('BodycamIndicator');
  expect(source).toContain('RouterOutlet');
  expect(source.match(/<teat-field-shell/g)).toHaveLength(1);
  expect(source).toMatch(/<teat-bodycam-indicator[^>]*\[state\]/);
  expect(source).toMatch(/<router-outlet\s*\/?\s*>/);
});

it('dado i18n de produção quando carregado então delega ao runtime STYNX por DI e nenhum componente instancia TeatI18n', () => {
  const service = readMobileProductionSource('core/i18n.service.ts');
  expect(service).toMatch(/@Inject\(StynxI18nService\)/);
  expect(service).toMatch(/stynx/i);
  expect(service).not.toMatch(
    /optional:\s*true|@Optional|translate:\s*\(key\)\s*=>\s*key/,
  );
  const shell = readMobileProductionSource('core/field-shell.component.ts');
  expect(shell).not.toMatch(/catch\s*\{\s*return\s*\{\s*translate/);
  const pages = readFileSync(
    resolve(process.cwd(), 'src/app/shared/mobile-page.component.ts'),
    'utf8',
  );
  expect(pages).not.toMatch(/new\s+TeatI18n\s*\(/);
  expect(service).not.toMatch(/TEAT_I18N\s*\[/);
});

it('dada porta de impressão de produção quando PrinterDialog imprime, falha e reimprime então registra o mesmo AIT sem criar outro', async () => {
  const PrinterDialog = printerRuntime.PrinterDialog;
  expect(PrinterDialog).toBeTypeOf('function');
  const session: MobileSessionContext = {
    tenantId: 'tenant-001',
    orgUnitId: 'agency-001',
    agentId: 'agent-001',
    deviceId: 'device-001',
    shiftId: 'shift-001',
    appVersion: '1.0.0',
    roles: ['field-agent'],
  };
  const draft: MobileEntityDraft<'ait'> = {
    localId: 'local-ait-001',
    entityType: 'ait',
    tenantId: session.tenantId,
    orgUnitId: session.orgUnitId,
    agentId: session.agentId,
    deviceId: session.deviceId,
    shiftId: session.shiftId,
    status: 'finalized',
    reservedNumber: 101,
    reservationId: 'reservation-001',
    idempotencyKey: 'draft-idem-001',
    normativePackageId: 'pkg-001',
    normativePackageVersion: '2026.09',
    localContentHash: 'sha256:ait-content',
    payload: {},
    location: {
      latitude: -15,
      longitude: -47,
      accuracyMeters: 3,
      capturedAt: '2026-09-22T00:00:00Z',
      source: 'gps',
    },
    evidence: [],
    createdAt: '2026-09-22T00:00:00Z',
    updatedAt: '2026-09-22T00:00:00Z',
  };
  const printReceipt = vi.fn(async () => ({
    receiptId: 'receipt-001',
    localEntityId: draft.localId,
    reservedNumber: draft.reservedNumber,
    printerAdapter: 'paired-printer',
    status: 'printed' as const,
    printedAt: '2026-09-22T00:00:01Z',
    contentHash: draft.localContentHash,
  }));
  const recordPrintEvent = vi.fn().mockResolvedValue({});
  const encrypted = new EncryptedStoreFixture();
  const dialog = new PrinterDialog(
    { adapterName: 'paired-printer', printReceipt },
    { recordPrintEvent } as never,
    new LocalActStore(encrypted),
  );
  const attempt = (eventIdempotencyKey: string) => ({
    aitId: 'ait-001',
    aitVersion: '"version-7"',
    eventIdempotencyKey,
    session,
    draft,
    contentHash: draft.localContentHash,
  });
  await expect(dialog.print(attempt('print-idem-001'))).resolves.toMatchObject({
    eventType: 'printed',
  });
  await expect(dialog.print(attempt('print-idem-002'))).resolves.toMatchObject({
    eventType: 'printed',
  });
  expect(printReceipt).toHaveBeenCalledTimes(2);
  expect(await encrypted.list('print-receipt')).toHaveLength(1);
  expect(recordPrintEvent).toHaveBeenCalledWith(
    'ait-001',
    expect.objectContaining({ event_type: 'printed' }),
    expect.objectContaining({ 'If-Match': '"version-7"' }),
  );
  printReceipt.mockRejectedValueOnce(new Error('paper-jam'));
  await expect(dialog.print(attempt('print-idem-003'))).resolves.toMatchObject({
    eventType: 'print-failed',
    failureReason: 'paper-jam',
  });
  expect(recordPrintEvent).toHaveBeenLastCalledWith(
    'ait-001',
    expect.objectContaining({
      event_type: 'print-failed',
      failure_reason: 'paper-jam',
    }),
    expect.objectContaining({ 'Idempotency-Key': 'print-idem-003' }),
  );
  expect(await encrypted.list('print-receipt')).toHaveLength(1);
});

for (const state of ['recording', 'paused-exception', 'failure'] as const) {
  it(`dado bodycam em ${state} quando o chrome é renderizado então exibe somente o estado autorizado e nunca conteúdo`, async () => {
    const runtime = await loadBodycamRuntime();
    const BodycamComponent =
      runtime['BodycamIndicator'] ?? runtime['BodycamIndicatorComponent'];
    expect(BodycamComponent).toBeTypeOf('function');
    const Host = Component({
      standalone: true,
      imports: [BodycamComponent as never],
      template: '<teat-bodycam-indicator [state]="state" />',
    })(
      class {
        readonly state = state;
      },
    );
    const fixture = TestBed.configureTestingModule({
      imports: [Host as never],
    }).createComponent(Host as never);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(state);
    expect(fixture.nativeElement.textContent).not.toMatch(
      /content|custody|video|bodycam-data/i,
    );
  });
}
