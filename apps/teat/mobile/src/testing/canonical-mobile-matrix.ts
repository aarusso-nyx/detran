import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface CanonicalTransition {
  readonly from: string;
  readonly action: string;
  readonly to: string;
  readonly condition: string;
  readonly type: string;
  readonly notes: string;
}

interface CanonicalMatrix {
  readonly expectedScreens: number;
  readonly expectedTransitions: number;
  readonly screens: readonly { readonly screenId: string }[];
  readonly transitions: readonly CanonicalTransition[];
}

export const CANONICAL_MOBILE_MATRIX_SHA256 =
  'a3175e63c270cff8757953b8a9d7ffe82c69e618b5cec25abf33a0d247d71013';

const matrixPath = resolve(
  process.cwd(),
  '../../../docs/framework/product/domains/inf/teat/ux-parity/mobile-matrix.json',
);

export function readCanonicalMobileMatrix(): {
  readonly sourceHash: string;
  readonly matrix: CanonicalMatrix;
} {
  const source = readFileSync(matrixPath, 'utf8');
  return {
    sourceHash: createHash('sha256').update(source).digest('hex'),
    matrix: JSON.parse(source) as CanonicalMatrix,
  };
}
