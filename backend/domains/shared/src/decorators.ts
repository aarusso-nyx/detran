import { SetMetadata } from '@nestjs/common';
export { Audit, type AuditMetadata } from '@stynx-nyx/backend';

export const DETRAN_RESOURCE_METADATA_KEY = 'detran:resource';
export const DETRAN_ACTION_METADATA_KEY = 'detran:action';
export const DETRAN_PUBLIC_METADATA_KEY = 'detran:public';

/** Resource must be namespaced as `domain:resource`; Action adds the third segment. */
export const Resource = (
  name: `${string}:${string}`,
): ClassDecorator & MethodDecorator =>
  SetMetadata(DETRAN_RESOURCE_METADATA_KEY, name);

export const Action = (name: string): MethodDecorator =>
  SetMetadata(DETRAN_ACTION_METADATA_KEY, name);

/** Public routes require their own authentication control (for example HMAC or mTLS). */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(DETRAN_PUBLIC_METADATA_KEY, true);
