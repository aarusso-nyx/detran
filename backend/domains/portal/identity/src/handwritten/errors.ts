// Erro de domínio do Portal (work/rounds/R-0009/contracts/CTG-0001.md §0 e §12;
// docs/framework/arch/portal-error-catalog.md). Mesmo envelope de `DetranError`
// (`@detran/shared`): `code` sempre com prefixo `PORTAL.`, `status` HTTP e
// `context` só com ids, tokens e números; `messageKey` é derivada por
// `DetranError` (`portal.errors.<código minúsculo>`), nunca tabela literal.
import { DetranError, type DetranErrorOptions } from '@detran/shared';

export type PortalErrorCode = `PORTAL.${string}`;

export class PortalError extends DetranError {
  constructor(code: PortalErrorCode, options: DetranErrorOptions) {
    super(code, options);
    this.name = 'PortalError';
  }
}
