import axe from 'axe-core';
import { expect } from 'vitest';

export async function expectTeatA11yState(root: HTMLElement): Promise<void> {
  expect(root.querySelectorAll('h1')).toHaveLength(1);
  expect(root.querySelector('[role="status"]')).not.toBeNull();
  const result = await axe.run(root, {
    resultTypes: ['violations'],
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  });
  expect(
    result.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? ''),
    ),
  ).toEqual([]);
}
