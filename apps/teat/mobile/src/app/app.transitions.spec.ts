import { expect, it, vi } from 'vitest';
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

it('seleciona cada ramo duplicado por índice exato sem colapsar from/action', async () => {
  const { matrix } = readCanonicalMobileMatrix();
  const runtime = await loadMobileRuntime('navigation/transitions');
  const dispatch = runtime['dispatchTransition'] as (
    input: {
      from: string;
      action: string;
      conditionSatisfied: boolean;
      transitionIndex?: number;
    },
    router: { navigateByUrl(url: string): Promise<boolean> },
    location: { back(): void },
  ) => Promise<{ kind: string; to?: string; reason?: string }>;
  const duplicated = matrix.transitions
    .map((transition, index) => ({ ...transition, index }))
    .filter((transition, _, all) =>
      all.some(
        (other) =>
          other.index !== transition.index &&
          other.from === transition.from &&
          other.action === transition.action,
      ),
    );
  expect(duplicated).toHaveLength(9);
  for (const transition of duplicated) {
    const navigateByUrl = vi.fn(async () => true);
    const result = await dispatch(
      {
        from: transition.from,
        action: transition.action,
        conditionSatisfied: true,
        transitionIndex: transition.index,
      },
      { navigateByUrl },
      { back: vi.fn() },
    );
    expect(result).toEqual({ kind: 'navigated', to: transition.to });
    expect(navigateByUrl).toHaveBeenCalledWith(`/${transition.to}`);
  }
  const navigateByUrl = vi.fn(async () => true);
  expect(
    await dispatch(
      {
        from: 'auth-login',
        action: 'Entrar',
        conditionSatisfied: true,
        transitionIndex: duplicated.find(
          (transition) => transition.from === 'vehicle-search',
        )?.index,
      },
      { navigateByUrl },
      { back: vi.fn() },
    ),
  ).toEqual({ kind: 'denied', reason: 'missing-transition' });
  expect(navigateByUrl).not.toHaveBeenCalled();
});

it('não relata sucesso quando Router rejeita a navegação', async () => {
  const runtime = await loadMobileRuntime('navigation/transitions');
  const dispatch = runtime['dispatchTransition'] as (
    input: { from: string; action: string; conditionSatisfied: boolean },
    router: { navigateByUrl(url: string): Promise<boolean> },
    location: { back(): void },
  ) => Promise<{ kind: string; reason?: string }>;
  const navigateByUrl = vi.fn(async () => false);
  expect(
    await dispatch(
      { from: 'ait-vehicle', action: 'Continuar', conditionSatisfied: true },
      { navigateByUrl },
      { back: vi.fn() },
    ),
  ).toEqual({ kind: 'denied', reason: 'navigation-rejected' });
  expect(navigateByUrl).toHaveBeenCalledWith('/ait-driver');
});
