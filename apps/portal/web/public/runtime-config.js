// Configuração de runtime do Portal (portal-frontends.md §1; plan.md M4): somente três chaves,
// sem segredo. Servida fora do bundle para que cada tenant/ambiente troque o arquivo sem
// rebuild; lida por src/app/core/runtime-config.ts. Valores vazios = ambiente de desenvolvimento.
window.__DETRAN_RUNTIME_CONFIG__ = {
  tenantId: '',
  oidcAuthority: '',
  clientId: '',
};
