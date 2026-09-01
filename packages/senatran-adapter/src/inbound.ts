export interface PeriodicToxicologyEvent {
  driverCpf: string;
  category: 'C' | 'D' | 'E';
  result: 'POSITIVE' | 'NEGATIVE';
  collectedAt: string;
  validUntil: string;
  occurredAt: string;
  laboratoryCode: string;
  sourceReference: string;
  driverAlertStatus: 'SENT' | 'SCHEDULED' | 'NOT_REQUIRED';
}

const CPF = /^[0-9]{11}$/u;
const CODE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/u;

function requiredString(
  source: Record<string, unknown>,
  field: string,
): string {
  const value = source[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`RENACH toxicology field ${field} is required`);
  }
  return value.trim();
}

function isoInstant(source: Record<string, unknown>, field: string): string {
  const value = requiredString(source, field);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error(
      `RENACH toxicology field ${field} must be an ISO-8601 instant`,
    );
  }
  return parsed.toISOString();
}

/** Validates and normalizes the RENACH wire event at the sole SENATRAN boundary. */
export function parsePeriodicToxicologyEvent(
  input: unknown,
): PeriodicToxicologyEvent {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('RENACH toxicology payload must be an object');
  }
  const source = input as Record<string, unknown>;
  const driverCpf = requiredString(source, 'driverCpf');
  const category = requiredString(source, 'category');
  const result = requiredString(source, 'result');
  const laboratoryCode = requiredString(source, 'laboratoryCode');
  const sourceReference = requiredString(source, 'sourceReference');
  const driverAlertStatus = requiredString(source, 'driverAlertStatus');
  if (!CPF.test(driverCpf)) throw new Error('RENACH toxicology CPF is invalid');
  if (!['C', 'D', 'E'].includes(category)) {
    throw new Error('RENACH toxicology category must be C, D or E');
  }
  if (!['POSITIVE', 'NEGATIVE'].includes(result)) {
    throw new Error('RENACH toxicology result is unsupported');
  }
  if (!CODE.test(laboratoryCode) || !CODE.test(sourceReference)) {
    throw new Error('RENACH toxicology provenance code is invalid');
  }
  if (!['SENT', 'SCHEDULED', 'NOT_REQUIRED'].includes(driverAlertStatus)) {
    throw new Error('RENACH toxicology alert status is unsupported');
  }
  const collectedAt = isoInstant(source, 'collectedAt');
  const validUntil = isoInstant(source, 'validUntil');
  const occurredAt = isoInstant(source, 'occurredAt');
  const expectedValidity = new Date(collectedAt);
  expectedValidity.setUTCDate(expectedValidity.getUTCDate() + 90);
  if (new Date(validUntil).getTime() !== expectedValidity.getTime()) {
    throw new Error(
      'RENACH toxicology validity must be 90 days from collection',
    );
  }
  if (new Date(occurredAt) < new Date(collectedAt)) {
    throw new Error('RENACH toxicology occurrence precedes collection');
  }
  return {
    driverCpf,
    category: category as PeriodicToxicologyEvent['category'],
    result: result as PeriodicToxicologyEvent['result'],
    collectedAt,
    validUntil,
    occurredAt,
    laboratoryCode,
    sourceReference,
    driverAlertStatus:
      driverAlertStatus as PeriodicToxicologyEvent['driverAlertStatus'],
  };
}
