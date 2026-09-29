import { resolve } from 'node:path';
import { verifyGuard } from './assert-archival-prompt-not-dispatchable.mjs';

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--repo-root' || !args[1]) {
  process.stderr.write(
    'usage: verify-archival-pc-guard.mjs --repo-root ROOT\n',
  );
  process.exitCode = 2;
} else {
  try {
    const manifest = await verifyGuard(resolve(args[1]));
    process.stdout.write(`verify-archival-pc-guard: OK (${manifest.status})\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
