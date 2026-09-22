import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const appRoot = resolve(process.cwd(), 'src/app');

export function readMobileProductionSource(relativePath: string): string {
  return readFileSync(resolve(appRoot, relativePath), 'utf8');
}
