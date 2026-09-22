// RoleHomeRedirect (spec §5.1; route-manifest.md tabela B; contrato CTG-0002a §4): `/` resolve
// para a rota inicial do papel principal — o primeiro presente na ordem de `RAIT_ROLE_PRECEDENCE`
// (união de papéis, ADR-0005). `rait-chair` → `/painel` até OD-R12-002 (`:orgao` do presidente
// sem fonte). Sessão sem papel canônico → `/sem-permissao?de=/`.
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { RAIT_ROLE_PRECEDENCE, type RaitRoleCode } from '../app.route-manifest';
import { forbiddenUrlTree } from './guards/role.guard';
import { RaitSessionFacade } from './session.facade';

export const ROLE_HOME: Readonly<Record<RaitRoleCode, string>> = {
  'rait-analyst': '/painel',
  'rait-rapporteur': '/painel',
  'rait-secretary': '/protocolo',
  'rait-signing-authority': '/assinatura',
  'rait-central-authority': '/autoridade/provimentos',
  'rait-chair': '/painel',
  'rait-manager': '/gestao',
  'rait-coordinator': '/gestao',
  'rait-hr': '/organizacao/membros',
  'rait-finance': '/financeiro',
  'integration-operator': '/integracoes',
  AUDITOR: '/auditoria',
  'agency-admin': '/admin',
};

/** Rota inicial do primeiro papel de `RAIT_ROLE_PRECEDENCE` presente; `null` se nenhum. */
export function roleHomeFor(roles: readonly string[]): string | null {
  const present = new Set(roles);
  const principal = RAIT_ROLE_PRECEDENCE.find((role) => present.has(role));
  return principal ? ROLE_HOME[principal] : null;
}

const ROOT_URL = '/';

export const roleHomeRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const home = roleHomeFor(inject(RaitSessionFacade).roles());
  return home ? router.parseUrl(home) : forbiddenUrlTree(router, ROOT_URL);
};
