// Modelos da cobrança (contrato CTG-0002b §2): aliases de
// `BpInfCollection001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfCollection001 } from '@detran/api-clients';

type S = BpInfCollection001.components['schemas'];

export type CollectionDocument = S['CollectionDocument'];
export type Payment = S['Payment'];
export type RefundOrder = S['RefundOrder'];
export type DebtHandoff = S['DebtHandoff'];

export type CreateCollectionDocumentDto = S['CreateCollectionDocumentDto'];
export type CreatePaymentDto = S['CreatePaymentDto'];
export type CreateRefundOrderDto = S['CreateRefundOrderDto'];
export type CreateDebtHandoffDto = S['CreateDebtHandoffDto'];

export type CollectionDocumentStatus = CollectionDocument['status'];
export type RefundOrderStatus = RefundOrder['status'];
export type DebtHandoffStatus = DebtHandoff['status'];
