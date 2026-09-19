// R-0014 TASK-0015 (Inspector), iteração 4 — A10(j)/C-3b-103: invariantes de acessibilidade
// transversais (contrato §7 do CTG-0003b + §8 do CTG-0003a) comuns às 13 telas em CADA estado da
// tabela §7: `h1` único, região de estado (`role="status"`) com `aria-label` traduzido de
// `portal.a11y.status_region`, e — quando o estado tem um `portal-error-banner` com
// `severity:'error'` — o foco no próprio banner (o componente já o move via `afterRenderEffect`,
// `core/error-banner.component.ts`). `axe` (sem violação `serious`/`critical`) é delegado a
// `a11y/axe.spec-helper.ts`. Só usado por specs.
import { expect } from 'vitest';
import { expectNoSeriousA11yViolations } from '../app/a11y/axe.spec-helper';

export interface A11yStateExpectations {
  /**
   * O estado tem um `portal-error-banner` `role="alert"` (severity 'error') e ele deve ter
   * recebido o foco (`document.activeElement`) — estados error/unavailable/offline/not_found
   * quando modelados pelo banner de erro (`PortalErrorBannerComponent`).
   */
  readonly errorBannerFocused?: boolean;
}

export async function expectA11yStateInvariants(
  root: HTMLElement,
  catalog: Record<string, string>,
  expectations: A11yStateExpectations = {},
): Promise<void> {
  expect(root.querySelectorAll('h1')).toHaveLength(1);
  const statusRegion = root.querySelector(
    `[role="status"][aria-label="${catalog['portal.a11y.status_region']}"]`,
  );
  expect(statusRegion).not.toBeNull();
  if (expectations.errorBannerFocused) {
    const banner = root.querySelector('.portal-error-banner[role="alert"]');
    expect(banner).not.toBeNull();
    expect(document.activeElement).toBe(banner);
  }
  await expectNoSeriousA11yViolations(root);
}
