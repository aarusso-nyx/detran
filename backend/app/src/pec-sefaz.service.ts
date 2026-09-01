import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  normalizePaymentStatus,
  type PaymentStatusOutput,
  type SefazPaymentPort,
} from '@detran/sefaz-adapter';

export const PEC_SEFAZ_PORT = Symbol('PEC_SEFAZ_PORT');

export interface PecPaymentValidation {
  referenceNumber: string;
  normalizedStatus: ReturnType<typeof normalizePaymentStatus>;
  externalStatus: string;
  paidAt?: string;
  amountPaid?: number;
  receiptNumber?: string;
  providerCode?: string;
  requestId: string;
}

@Injectable()
export class PecSefazService {
  private readonly logger = new Logger(PecSefazService.name);

  constructor(
    @Inject(PEC_SEFAZ_PORT)
    private readonly adapter: Pick<SefazPaymentPort, 'getPaymentStatus'>,
  ) {}

  async validatePayment(
    referenceNumber: string,
    correlationId?: string,
  ): Promise<PecPaymentValidation> {
    this.logger.log(
      `[sefaz] validatePayment ref=${referenceNumber} correlationId=${correlationId ?? 'n/a'}`,
    );
    const result: PaymentStatusOutput =
      await this.adapter.getPaymentStatus(referenceNumber);
    return {
      referenceNumber: result.referenceNumber,
      normalizedStatus: normalizePaymentStatus(result.status),
      externalStatus: result.status,
      paidAt: result.paidAt,
      amountPaid: result.amountPaid,
      receiptNumber: result.receiptNumber,
      providerCode: result.providerCode,
      requestId: result.requestId,
    };
  }
}
