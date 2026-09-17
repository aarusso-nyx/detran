import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Idempotent } from '@stynx-nyx/idempotency';
/**
 * R-0009 CTG-0002 §4 (M9, adenda A4(a)): as rotas do Portal que assumem a
 * idempotência no handler (`PortalIdempotencyService`) anulam o `@Idempotent()`
 * herdado de `@Action` com `@NoIdempotent()` ao lado do `@Action`.
 */
export { NoIdempotent } from '@stynx-nyx/idempotency';
import { RateLimit } from '@stynx-nyx/ratelimit';
export { Audit, type AuditMetadata } from '@stynx-nyx/backend';

export const DETRAN_RESOURCE_METADATA_KEY = 'detran:resource';
export const DETRAN_ACTION_METADATA_KEY = 'detran:action';
export const DETRAN_PUBLIC_METADATA_KEY = 'detran:public';

/** Resource must be namespaced as `domain:resource`; Action adds the third segment. */
export const Resource = (
  name: `${string}:${string}`,
): ClassDecorator & MethodDecorator =>
  SetMetadata(DETRAN_RESOURCE_METADATA_KEY, name);

const READ_ACTIONS = new Set(['read', 'list']);

/**
 * Every declared mutation inherits the shared durable replay and tenant rate
 * controls. Public callbacks without @Action retain their provider-specific
 * authentication and receipt deduplication contracts.
 */
export const Action = (name: string): MethodDecorator => {
  const metadata = SetMetadata(DETRAN_ACTION_METADATA_KEY, name);
  if (READ_ACTIONS.has(name)) return metadata;
  return applyDecorators(
    metadata,
    Idempotent(),
    RateLimit({ bucket: 'tenant', scope: `detran.${name}` }),
  );
};

/** Public routes require their own authentication control (for example HMAC or mTLS). */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(DETRAN_PUBLIC_METADATA_KEY, true);
