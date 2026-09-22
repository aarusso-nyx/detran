import { expect, it } from 'vitest';
import {
  CANONICAL_MOBILE_MATRIX_SHA256,
  readCanonicalMobileMatrix,
  type CanonicalTransition,
} from '../testing/canonical-mobile-matrix';
import { loadMobileRuntime } from '../testing/runtime-module';
import { TEAT_ROUTE_FIXTURE } from '../testing/route-contract.fixture';

it('dada a matriz canônica quando carregada então mantém o hash e as 576 transições fechadas', () => {
  const { matrix, sourceHash } = readCanonicalMobileMatrix();
  expect(sourceHash).toBe(CANONICAL_MOBILE_MATRIX_SHA256);
  expect(matrix.expectedScreens).toBe(67);
  expect(matrix.expectedTransitions).toBe(576);
  expect(matrix.transitions).toHaveLength(576);
});

it('dadas as 576 transições canônicas quando importadas pelo runtime então a igualdade é ordenada e literal', async () => {
  const { matrix } = readCanonicalMobileMatrix();
  const runtime = await loadMobileRuntime('navigation/transitions');
  expect(runtime['TEAT_TRANSITIONS']).toEqual(matrix.transitions);
});

it('dada cada transição canônica quando o destino é concreto então alcança uma rota contratada', async () => {
  const { matrix } = readCanonicalMobileMatrix();
  const runtime = await loadMobileRuntime('navigation/transitions');
  const transitions = runtime[
    'TEAT_TRANSITIONS'
  ] as readonly CanonicalTransition[];
  const paths = new Set<string>(TEAT_ROUTE_FIXTURE.map((route) => route.path));
  expect(transitions).toHaveLength(576);
  for (const transition of transitions) {
    if (transition.to !== '__previous__') {
      expect(
        paths.has(transition.to),
        `destino sem rota: ${transition.to}`,
      ).toBe(true);
    }
  }
});
