import { InjectionToken } from '@angular/core';
import type {
  MobileEntityDraft,
  MobilePrinterPort,
  MobilePrintReceipt,
  MobileSessionContext,
} from '@stynx-nyx/mobile-runtime';
import type { AitClient } from '../data/api/ait.client.js';
import type { LocalActStore } from '../data/local/local-act.store.js';

export interface PrintResult {
  readonly eventType: 'printed' | 'print-failed';
  readonly printerIdentifier?: string;
  readonly receiptHash?: string;
  readonly failureReason?: string;
}

export interface PrintAttempt {
  readonly aitId: string;
  readonly aitVersion: string;
  readonly eventIdempotencyKey: string;
  readonly session: MobileSessionContext;
  readonly draft: MobileEntityDraft<'ait'>;
  readonly contentHash: string;
}

class UnavailableMobilePrinterAdapter implements MobilePrinterPort {
  readonly adapterName = 'teat-hardware-printer';

  printReceipt(): Promise<MobilePrintReceipt> {
    return Promise.reject(new Error('printer-hardware-source-pending'));
  }
}

export const TEAT_MOBILE_PRINTER = new InjectionToken<MobilePrinterPort>(
  'TEAT_MOBILE_PRINTER',
  {
    providedIn: 'root',
    factory: () => new UnavailableMobilePrinterAdapter(),
  },
);

export class PrinterDialog {
  constructor(
    private readonly printer: MobilePrinterPort,
    private readonly ait: AitClient,
    private readonly store: LocalActStore,
  ) {}

  print(input: PrintAttempt): Promise<PrintResult> {
    let operation: Promise<MobilePrintReceipt>;
    try {
      operation = this.printer.printReceipt({
        session: input.session,
        draft: input.draft,
        contentHash: input.contentHash,
      });
    } catch (error) {
      return this.recordFailure(input, error);
    }
    return operation.then(
      (receipt) => this.recordSuccess(input, receipt),
      (error: unknown) => this.recordFailure(input, error),
    );
  }

  private recordSuccess(
    input: PrintAttempt,
    receipt: MobilePrintReceipt,
  ): Promise<PrintResult> {
    const persistence = this.store.putPrintReceipt(receipt);
    const event = this.recordEvent(input, {
      event_type: 'printed',
      printer_identifier: receipt.printerAdapter,
      receipt_hash: receipt.contentHash,
    });
    return Promise.all([persistence, event]).then(() => ({
      eventType: 'printed' as const,
      printerIdentifier: receipt.printerAdapter,
      receiptHash: receipt.contentHash,
    }));
  }

  private recordFailure(
    input: PrintAttempt,
    error: unknown,
  ): Promise<PrintResult> {
    const failureReason =
      error instanceof Error ? error.message : 'printer-adapter-failure';
    return this.recordEvent(input, {
      event_type: 'print-failed',
      failure_reason: failureReason,
    }).then(() => ({ eventType: 'print-failed' as const, failureReason }));
  }

  private recordEvent(
    input: PrintAttempt,
    event: Readonly<Record<string, string>>,
  ): Promise<unknown> {
    return this.ait.recordPrintEvent(input.aitId, event, {
      'Idempotency-Key': input.eventIdempotencyKey,
      'If-Match': input.aitVersion,
    });
  }
}

export type { MobilePrinterPort };
