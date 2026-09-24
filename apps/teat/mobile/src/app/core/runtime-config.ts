export interface TeatRuntimeConfig {
  readonly tenantId: string;
  readonly oidcAuthority: string;
  readonly clientId: string;
}

declare global {
  interface Window {
    __DETRAN_RUNTIME_CONFIG__?: Partial<TeatRuntimeConfig>;
  }
}

export function readRuntimeConfig(): TeatRuntimeConfig {
  const value = window.__DETRAN_RUNTIME_CONFIG__;
  const tenantId = value?.tenantId;
  const oidcAuthority = value?.oidcAuthority;
  const clientId = value?.clientId;
  if (
    typeof tenantId !== 'string' ||
    tenantId.trim() === '' ||
    typeof oidcAuthority !== 'string' ||
    oidcAuthority.trim() === '' ||
    typeof clientId !== 'string' ||
    clientId.trim() === ''
  ) {
    throw new Error('teat-runtime-config-invalid');
  }
  return { tenantId, oidcAuthority, clientId };
}
