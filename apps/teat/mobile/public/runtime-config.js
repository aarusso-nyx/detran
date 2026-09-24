// Configuração de runtime do TEAT mobile: somente três chaves sem segredo.
// O deploy substitui estes valores sem rebuild; vazio é rejeitado fail-closed pelo bootstrap.
window.__DETRAN_RUNTIME_CONFIG__ = {
  tenantId: '',
  oidcAuthority: '',
  clientId: '',
};
