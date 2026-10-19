import { afterAll, inject } from 'vitest';

// Standalone package scripts start here. Preserve that context in each isolated
// fork as well, including source-inspection tests and existing fixture readers.
const directory = inject('scorecardPackageCwd');
if (typeof directory !== 'string')
  throw new Error('COVERAGE_PACKAGE_CONTEXT_MISSING');
const previous = process.cwd();
process.chdir(directory);
afterAll(() => process.chdir(previous));
