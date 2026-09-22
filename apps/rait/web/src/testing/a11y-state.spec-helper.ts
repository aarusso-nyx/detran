// R-0012 TASK-0005 (Inspector). Invariante transversal de acessibilidade usado pelos specs de
// páginas do núcleo (C-2A-63/64) e de componentes (C-2A-30/50): `axe` sem violação
// serious/critical (wcag2a, wcag2aa, best-practice). Diferente de
// `apps/portal/web/src/testing/a11y-state.spec-helper.ts`, o catálogo i18n do núcleo do RAIT
// (`CTG-0002a.md` §9) não define uma chave equivalente a `portal.a11y.status_region`
// (região `role="status"` obrigatória) nem um contrato de "h1 único por tela" — nenhuma dessas
// fontes existe para o RAIT nesta CTG, então esta função não inventa essas invariantes (regra
// "nenhum valor sem fonte"); registrado como pendência no relatório de entrega, não como OD (não
// depende de decisão de negócio, só de uma futura CTG que cite a fonte).
import { expect } from 'vitest';
import { expectNoSeriousA11yViolations } from './axe.spec-helper';

export interface A11yStateExpectations {
  /**
   * O estado tem um `rait-error-banner[role="alert"]` (kind ≠ 'unavailable', catálogo §4) e ele
   * deve ter recebido o foco (`document.activeElement`).
   */
  readonly errorBannerFocused?: boolean;
}

export async function expectA11yStateInvariants(
  root: HTMLElement,
  expectations: A11yStateExpectations = {},
): Promise<void> {
  if (expectations.errorBannerFocused) {
    const banner = root.querySelector('rait-error-banner[role="alert"]');
    expect(banner).not.toBeNull();
    expect(document.activeElement).toBe(banner);
  }
  await expectNoSeriousA11yViolations(root);
}
