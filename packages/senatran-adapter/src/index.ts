export * from './client.js';
export * from './config.js';
export * from './domain.js';
export * from './errors.js';
export * from './idempotency.js';
export * from './inbound.js';
export * from './ports.js';
export * from './transport.js';

import { SenatranClient, type SenatranClientOptions } from './client.js';
import { loadSenatranConfig, type SenatranClientConfig } from './config.js';
import { createSenatranPorts, type SenatranPorts } from './ports.js';

export interface SenatranAdapter {
  client: SenatranClient;
  ports: SenatranPorts;
}

export function createSenatranAdapter(
  config: SenatranClientConfig = loadSenatranConfig(),
  options?: SenatranClientOptions,
): SenatranAdapter {
  const client = new SenatranClient(config, options);
  return { client, ports: createSenatranPorts(client) };
}
