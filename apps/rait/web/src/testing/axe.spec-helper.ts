// R-0012 TASK-0005 (Inspector). `axe-core` 4.13.0 no TestBed (jsdom), tags `wcag2a`, `wcag2aa`,
// `best-practice` — mesmo padrão de `apps/portal/web/src/app/a11y/axe.spec-helper.ts`. Vive em
// `src/testing/` (não em `src/app/a11y/`, fora da fronteira de escrita desta tarefa: `Pode
// tocar` só lista `src/testing/**` e `*.spec.ts` novos) — usado só por specs.
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
