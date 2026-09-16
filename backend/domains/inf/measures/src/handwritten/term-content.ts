// CTG-0004 §4.4/§4.5 (R-0008, TASK-0009, RN-TEAT-126) — conteúdo mínimo do
// termo/inventário. Puro: recebe o objeto e a lista de chaves obrigatórias,
// devolve as que faltam ou estão vazias (sem transformar o valor).
export function missingKeys(
  value: Record<string, unknown> | null | undefined,
  required: readonly string[],
): string[] {
  const object = value ?? {};
  return required.filter((key) => {
    const entry = object[key];
    return entry === undefined || entry === null || entry === '';
  });
}

/** Os quatro elementos do §1º do art. 14 (RN-TEAT-126, CTG-0004 §4.4). */
export const INVENTORY_REQUIRED_KEYS = [
  'objects_left',
  'missing_mandatory_equipment',
  'body_condition',
  'withdrawal_deadline_notice',
] as const;

/** Os sete elementos do caput do art. 14 (CTG-0004 §4.5 pré-condição 2). */
export const TERM_REMOVAL_REQUIRED_KEYS = [
  'agency',
  'vehicle',
  'ait_or_order_ref',
  'place_datetime',
  'legal_basis',
  'custody_place',
  'owner_and_driver',
] as const;
