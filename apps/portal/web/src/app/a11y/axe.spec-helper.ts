// R-0014 TASK-0002 (Inspector, plan.md M3/B1). Helper de a11y automática por rota:
// `axe-core` 4.13.0 no TestBed (jsdom), tags `wcag2a`, `wcag2aa`, `best-practice`. Substitui
// Lighthouse CI (exige Chrome headless/serviço externo — não roda no runner, §Bloqueios B1).
// Só usado por specs (fronteira de TASK-0002: `src/app/a11y/axe.spec-helper.ts`).
import axe from 'axe-core';

export async function expectNoSeriousA11yViolations(
  element: Element,
): Promise<void> {
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
