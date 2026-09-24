import { expect } from 'vitest';
import { run } from 'axe-core';

export async function expectTeatA11yState(root: HTMLElement): Promise<void> {
  expect(root.querySelectorAll('h1')).toHaveLength(1);
  expect(root.querySelector('[role="status"]')).not.toBeNull();
  const results = await run(root);
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === 'serious' || violation.impact === 'critical',
    ),
  ).toEqual([]);
}
