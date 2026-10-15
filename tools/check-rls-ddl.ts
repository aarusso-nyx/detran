import path from 'node:path';
import { checkRlsDdl } from './rls-ddl-coverage.mjs';

try {
  if (process.argv.length > 3)
    throw new Error('Expected zero or one repository root');
  const counts = checkRlsDdl(path.resolve(process.argv[2] ?? process.cwd()));
  console.log(
    `check-rls-ddl: OK (helper=${counts.helper} package=${counts.package} exempt=${counts.exempt})`,
  );
} catch (error) {
  console.error(
    `RLS DDL coverage violation: ${error instanceof Error ? error.message : 'unclassified input'}`,
  );
  process.exitCode = 1;
}
