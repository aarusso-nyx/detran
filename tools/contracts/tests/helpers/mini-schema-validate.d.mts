// Declaração de tipos de `mini-schema-validate.mjs` (CTG-0005 §7 C-5-23/24/
// 25/26, adenda §9.16) — só para o `tsc --noEmit` dos pacotes TEAT que
// importam o helper de `src/handwritten/events.schema.spec.ts` (C-5-25′,
// adenda §9 item 19; TS7016 sem esta declaração). Assinatura real do único
// export do `.mjs` — `validate(schema, instance, root?, path?)` — sem
// tipar a forma interna de JSON Schema (o helper aceita qualquer schema/
// instância e não depende de um tipo de schema específico).
export function validate(
  schema: unknown,
  instance: unknown,
  root?: unknown,
  path?: string,
): { valid: boolean; errors: string[] };
