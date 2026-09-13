export type PaymentStatus =
  | 'OPEN'
  | 'ISSUED'
  | 'PENDING'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NOT_FOUND';

export interface DebtItem {
  debtId: string;
  year?: number;
  amount: number;
  status: string;
  description?: string;
}
export interface DebtLookupInput {
  cpf?: string;
  renachNumber?: string;
  processNumber?: string;
  clinicId?: string;
  taxType?: string;
  requestId?: string;
}
export interface DebtLookupOutput {
  debts: DebtItem[];
  inActiveDebt: boolean;
  requestId: string;
}
export interface IssueGuideInput {
  debtId: string;
  cpf?: string;
  renachNumber?: string;
  amount?: number;
  requestId?: string;
}
export interface IssueGuideOutput {
  guideId: string;
  referenceNumber: string;
  amount: number;
  expiresAt: string;
  status: PaymentStatus;
  barcode?: string;
  pix?: { emv: string };
  requestId: string;
}
export interface PaymentStatusOutput {
  referenceNumber: string;
  status: PaymentStatus;
  paidAt?: string;
  amountPaid?: number;
  receiptNumber?: string;
  providerCode?: string;
  providerMessage?: string;
  requestId: string;
}
export interface RectificationInput {
  referenceNumber: string;
  reason: string;
  originalPayment: { amount: number; paidAt: string };
  requestId?: string;
}
export interface RectificationOutput {
  rectificationId: string;
  status: PaymentStatus;
  requestId: string;
}
export interface RefundInput {
  referenceNumber: string;
  reason?: string;
  requestId?: string;
}
export interface RefundOutput {
  refundId: string;
  status: PaymentStatus;
  requestId: string;
}
export interface RefundStatusOutput {
  refundId: string;
  status: PaymentStatus;
  approvedAt?: string;
  rejectedAt?: string;
  requestId: string;
}

export interface SefazPaymentPort {
  lookupDebt(input: DebtLookupInput): Promise<DebtLookupOutput>;
  issueGuide(input: IssueGuideInput): Promise<IssueGuideOutput>;
  getPaymentStatus(referenceNumber: string): Promise<PaymentStatusOutput>;
  submitRectification(input: RectificationInput): Promise<RectificationOutput>;
  submitRefundRequest(input: RefundInput): Promise<RefundOutput>;
  getRefundStatus(refundId: string): Promise<RefundStatusOutput>;
}
