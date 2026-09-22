import { expect, it, vi } from 'vitest';
import { readCanonicalMobileMatrix } from '../testing/canonical-mobile-matrix';
import { loadMobileRuntime } from '../testing/runtime-module';

it('dadas as transições hash-validadas quando dispatchTransition navega, volta ou nega então chama somente o destino autorizado', async () => {
  const { matrix } = readCanonicalMobileMatrix();
  const runtime = await loadMobileRuntime('navigation/transitions');
  const dispatch = runtime['dispatchTransition'] as
    | ((
        input: { from: string; action: string; conditionSatisfied: boolean },
        router: { navigateByUrl: (url: string) => Promise<boolean> },
        location: { back: () => void },
      ) => Promise<unknown>)
    | undefined;
  expect(dispatch).toBeTypeOf('function');
  const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
  const location = { back: vi.fn() };
  const forward = matrix.transitions.find(
    (transition) =>
      transition.to !== '__previous__' && transition.condition === '',
  );
  expect(forward).toBeDefined();
  await expect(
    dispatch?.(
      {
        from: forward!.from,
        action: forward!.action,
        conditionSatisfied: true,
      },
      router,
      location,
    ),
  ).resolves.toEqual({ kind: 'navigated', to: forward!.to });
  expect(router.navigateByUrl).toHaveBeenCalledWith(`/${forward!.to}`);
  const conditional = matrix.transitions.find(
    (transition) => transition.condition !== '',
  );
  expect(conditional).toBeDefined();
  router.navigateByUrl.mockClear();
  location.back.mockClear();
  await expect(
    dispatch?.(
      {
        from: conditional!.from,
        action: conditional!.action,
        conditionSatisfied: false,
      },
      router,
      location,
    ),
  ).resolves.toEqual({ kind: 'denied', reason: 'condition-unsatisfied' });
  expect(router.navigateByUrl).not.toHaveBeenCalled();
  expect(location.back).not.toHaveBeenCalled();
  await expect(
    dispatch?.(
      { from: '__missing__', action: '__missing__', conditionSatisfied: true },
      router,
      location,
    ),
  ).resolves.toEqual({ kind: 'denied', reason: 'missing-transition' });

  const previous = matrix.transitions.find(
    (transition) => transition.to === '__previous__',
  );
  expect(previous).toBeDefined();
  await expect(
    dispatch?.(
      {
        from: previous!.from,
        action: previous!.action,
        conditionSatisfied: true,
      },
      router,
      location,
    ),
  ).resolves.toEqual({ kind: 'back' });
  expect(location.back).toHaveBeenCalledTimes(1);
});
