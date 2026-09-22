// Leitura de `public/runtime-config.js` (spec §12 `environments/`; plan.md M1; padrão do Portal):
// o arquivo define `window.__DETRAN_RUNTIME_CONFIG__` com exatamente três chaves, nenhuma delas
// segredo. O tenant é decidido pelo `Host` no servidor (ADR-0002/0005); `tenantId` só semeia a
// sessão (`tenancy.defaultTenantResolver`, OD-R12-009). Chave ausente ou de tipo errado → `''`.

export interface RuntimeConfig {
  readonly tenantId: string;
  readonly oidcAuthority: string;
  readonly clientId: string;
}

declare global {
  interface Window {
    __DETRAN_RUNTIME_CONFIG__?: Partial<Record<keyof RuntimeConfig, unknown>>;
  }
}

export const EMPTY_RUNTIME_CONFIG: RuntimeConfig = Object.freeze({
  tenantId: '',
  oidcAuthority: '',
  clientId: '',
});

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Lê a configuração do `window` (ou de uma fonte explícita, nos testes). */
export function readRuntimeConfig(
  source: Window['__DETRAN_RUNTIME_CONFIG__'] = typeof window === 'undefined'
    ? undefined
    : window.__DETRAN_RUNTIME_CONFIG__,
): RuntimeConfig {
  if (!source || typeof source !== 'object') return EMPTY_RUNTIME_CONFIG;
  return {
    tenantId: asString(source.tenantId),
    oidcAuthority: asString(source.oidcAuthority),
    clientId: asString(source.clientId),
  };
}
