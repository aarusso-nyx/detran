// Forma zod → 400 `PORTAL.VALIDATION_FAILED { fields[] }` (work/rounds/R-0009/
// contracts/CTG-0002.md §0): `fields` são os caminhos das issues (ponto
// separado); chave desconhecida em `strictObject` vira o nome da chave.
import type { z } from 'zod';

import { PortalError } from './errors.js';

export function portalValidationFailed(fields: readonly string[]): PortalError {
  return new PortalError('PORTAL.VALIDATION_FAILED', {
    status: 400,
    context: { fields: [...new Set(fields)] },
  });
}

export function parsePortalBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body ?? {});
  if (parsed.success) return parsed.data;
  throw portalValidationFailed(
    parsed.error.issues.map((issue) => {
      if (issue.path.length > 0) return issue.path.map(String).join('.');
      const keys = (issue as { keys?: string[] }).keys;
      return keys && keys.length > 0 ? keys.join(',') : 'body';
    }),
  );
}
