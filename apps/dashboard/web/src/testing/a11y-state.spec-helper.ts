// R-0016 TASK-0004 (Inspector). Invariantes de acessibilidade transversais (`CTG-0002.md` §12;
// `engineer-frontend.md` §Padrão de app 10): `h1` único nas páginas (nenhum nos componentes
// isolados de `shared/`, `options.component = true`), região `[role="status"]` com
// `aria-label` = `dashboard.a11y.live_region` traduzido nas páginas, e `axe-core` 4.13.0 sem
// violação `serious`/`critical` (tags `wcag2a`, `wcag2aa`, `best-practice`) em **light e dark**
// (`setDetranTheme`, `@detran/ui`) — forma de `apps/portal/web/src/testing/a11y-state.spec-helper.ts`
// + `apps/portal/web/src/app/a11y/axe.spec-helper.ts`, fundidos aqui num único arquivo de
// `src/testing/` (a lista fechada de §12 não prevê um segundo arquivo em `src/app/a11y/`).
import axe from 'axe-core';
import { expect } from 'vitest';
import { setDetranTheme } from '@detran/ui';

export interface A11yStateExpectations {
  /** `true` para componentes isolados de `shared/` (sem `h1` próprio, sem região de página). */
  readonly component?: boolean;
  /**
   * `true` para páginas fora de `dash-screen-frame` (`core/pages/forbidden.page.ts`,
   * `core/pages/auth-callback.page.ts`, `CTG-0002.md` §3): têm `h1` mas não a região
   * `[role="status"]` de `dashboard.a11y.live_region` (essa região é definida só para
   * `ScreenFrameComponent`, o shell e os componentes de `shared/` que a declaram, §5/§8/§9).
   */
  readonly skipLiveRegion?: boolean;
}

async function expectNoSeriousA11yViolations(element: Element): Promise<void> {
  const results = await axe.run(element, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice'],
    },
  });
  const serious = results.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );
  if (serious.length === 0) return;
  const details = serious
    .map((violation) => {
      const targets = violation.nodes
        .map((node) => node.target.join(' '))
        .join('; ');
      return `${violation.id} (${violation.impact}): ${targets}`;
    })
    .join('\n');
  throw new Error(
    `violações de acessibilidade serious/critical (wcag2a, wcag2aa, best-practice):\n${details}`,
  );
}

export async function expectA11yStateInvariants(
  root: HTMLElement,
  catalog: Record<string, string>,
  options: A11yStateExpectations = {},
): Promise<void> {
  if (options.component) {
    expect(root.querySelectorAll('h1')).toHaveLength(0);
  } else {
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    if (!options.skipLiveRegion) {
      const statusRegion = root.querySelector(
        `[role="status"][aria-label="${catalog['dashboard.a11y.live_region']}"]`,
      );
      expect(statusRegion).not.toBeNull();
    }
  }
  try {
    setDetranTheme('light');
    await expectNoSeriousA11yViolations(root);
    setDetranTheme('dark');
    await expectNoSeriousA11yViolations(root);
  } finally {
    setDetranTheme('light');
  }
}
