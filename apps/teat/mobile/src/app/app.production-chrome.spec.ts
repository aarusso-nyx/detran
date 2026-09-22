import { TestBed } from '@angular/core/testing';
import { expect, it, vi } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';
import * as printerRuntime from './shared/mobile-printer.port';

async function loadBodycamRuntime(): Promise<Record<string, unknown>> {
  return loadMobileRuntime('core/bodycam-indicator.component');
}

it('dada porta de impressão de produção quando PrinterDialog imprime, falha e reimprime então registra o mesmo AIT sem criar outro', async () => {
  const PrinterDialog = (printerRuntime as unknown as Record<string, unknown>)[
    'PrinterDialog'
  ] as
    | (new (
        printer: unknown,
        ait: unknown,
      ) => {
        print?: (
          aitId: string,
        ) => Promise<{ eventType: string; failureReason?: string }>;
      })
    | undefined;
  expect(PrinterDialog).toBeTypeOf('function');
  const print = vi
    .fn()
    .mockResolvedValue({ eventType: 'printed', receiptHash: 'receipt-001' });
  const recordPrintEvent = vi.fn().mockResolvedValue({});
  const dialog = new (
    PrinterDialog as new (
      printer: unknown,
      ait: unknown,
    ) => { print: (aitId: string) => Promise<{ eventType: string }> }
  )({ print }, { recordPrintEvent });
  await expect(dialog.print('ait-001')).resolves.toMatchObject({
    eventType: 'printed',
  });
  await expect(dialog.print('ait-001')).resolves.toMatchObject({
    eventType: 'printed',
  });
  expect(print).toHaveBeenCalledTimes(2);
  expect(recordPrintEvent).toHaveBeenCalledWith(
    'ait-001',
    expect.objectContaining({ eventType: 'printed' }),
  );
  print.mockResolvedValueOnce({
    eventType: 'print-failed',
    failureReason: 'paper-jam',
  });
  await expect(dialog.print('ait-001')).resolves.toMatchObject({
    failureReason: 'paper-jam',
  });
  expect(recordPrintEvent).toHaveBeenLastCalledWith(
    'ait-001',
    expect.objectContaining({ failureReason: 'paper-jam' }),
  );
});

for (const state of ['recording', 'paused-exception', 'failure'] as const) {
  it(`dado bodycam em ${state} quando o chrome é renderizado então exibe somente o estado autorizado e nunca conteúdo`, async () => {
    const runtime = await loadBodycamRuntime();
    const Component =
      runtime['BodycamIndicator'] ?? runtime['BodycamIndicatorComponent'];
    expect(Component).toBeTypeOf('function');
    const fixture = TestBed.configureTestingModule({
      imports: [Component as never],
    }).createComponent(Component as never);
    fixture.componentRef.setInput('state', state);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(state);
    expect(fixture.nativeElement.textContent).not.toMatch(
      /content|custody|video|bodycam-data/i,
    );
  });
}
