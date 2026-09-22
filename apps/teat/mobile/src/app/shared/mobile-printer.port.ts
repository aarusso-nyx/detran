export interface PrintResult {
  readonly eventType: string;
  readonly printerIdentifier?: string;
  readonly receiptHash?: string;
  readonly failureReason?: string;
}

export abstract class MobilePrinterPort {
  abstract print(aitId: string): Promise<PrintResult>;
}

interface PrintEventClient {
  recordPrintEvent(aitId: string, event: PrintResult): Promise<unknown>;
}

export class PrinterDialog {
  constructor(
    private readonly printer: MobilePrinterPort,
    private readonly ait: PrintEventClient,
  ) {}

  async print(aitId: string): Promise<PrintResult> {
    try {
      const result = await this.printer.print(aitId);
      await this.ait.recordPrintEvent(aitId, result);
      return result;
    } catch (error) {
      const result: PrintResult = {
        eventType: 'print-failed',
        failureReason:
          error instanceof Error ? error.name : 'printer-adapter-failure',
      };
      await this.ait.recordPrintEvent(aitId, result);
      return result;
    }
  }
}
