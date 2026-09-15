export * from './decorators.js';
export * from './documents/index.js';
export * from './errors/index.js';
export * from './events/index.js';
export * from './policy.js';
export * from './policy.guard.js';
export * from './roles.js';
export * from './tenant-context.js';
// Re-exported so domain packages (`inf/ait`'s `AitCancelRequestsController`,
// M3/H.39) can read the STYNX principal from the request without adding a
// direct `@stynx-nyx/backend` dependency of their own.
export { getPrincipalFromRequest, type RequestLike } from '@stynx-nyx/backend';
