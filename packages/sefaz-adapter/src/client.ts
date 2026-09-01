export type NormalizedPaymentStatus =
  'PAID' | 'PENDING' | 'NOT_FOUND' | 'EXPIRED' | 'ERROR';

export function normalizePaymentStatus(
  status: string,
): NormalizedPaymentStatus {
  if (status === 'PAID') return 'PAID';
  if (['PENDING', 'PARTIALLY_PAID', 'ISSUED'].includes(status))
    return 'PENDING';
  if (['EXPIRED', 'CANCELLED'].includes(status)) return 'EXPIRED';
  if (status === 'NOT_FOUND') return 'NOT_FOUND';
  return 'ERROR';
}
