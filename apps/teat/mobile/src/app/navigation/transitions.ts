import matrix from '../../../../../../docs/framework/product/domains/inf/teat/ux-parity/mobile-matrix.json';

interface Transition {
  readonly from: string;
  readonly action: string;
  readonly to: string;
  readonly condition: string;
  readonly type: string;
  readonly notes: string;
}

type DispatchResult =
  | Readonly<{ kind: 'navigated'; to: string }>
  | Readonly<{ kind: 'back' }>
  | Readonly<{
      kind: 'denied';
      reason:
        | 'missing-transition'
        | 'condition-unsatisfied'
        | 'unregistered-destination'
        | 'unsafe-previous';
    }>;

interface NavigationHistory {
  previousScreen(): string | undefined;
  isEditableActScreen(screenId: string): boolean;
}

export const TEAT_TRANSITIONS_SOURCE_SHA256 =
  'a3175e63c270cff8757953b8a9d7ffe82c69e618b5cec25abf33a0d247d71013';

const TRANSITION_KEYS = [
  'action',
  'condition',
  'from',
  'notes',
  'to',
  'type',
] as const;

function validateMatrix(): readonly Transition[] {
  if (
    matrix.expectedScreens !== 67 ||
    matrix.expectedTransitions !== 576 ||
    matrix.screens.length !== matrix.expectedScreens ||
    matrix.transitions.length !== matrix.expectedTransitions
  ) {
    throw new Error('mobile-transition-cardinality-mismatch');
  }
  const destinations = new Set(matrix.screens.map((screen) => screen.screenId));
  for (const transition of matrix.transitions) {
    const keys = Object.keys(transition).sort();
    if (
      keys.length !== TRANSITION_KEYS.length ||
      !TRANSITION_KEYS.every((key, index) => keys[index] === key) ||
      typeof transition.from !== 'string' ||
      typeof transition.action !== 'string' ||
      typeof transition.to !== 'string' ||
      typeof transition.condition !== 'string' ||
      typeof transition.type !== 'string' ||
      typeof transition.notes !== 'string' ||
      (transition.to !== '__previous__' && !destinations.has(transition.to))
    ) {
      throw new Error('mobile-transition-contract-invalid');
    }
  }
  return Object.freeze(matrix.transitions.map((entry) => Object.freeze(entry)));
}

const REGISTERED_DESTINATIONS = new Set(
  matrix.screens.map((screen) => screen.screenId),
);

export const TEAT_TRANSITIONS = validateMatrix();

export async function dispatchTransition(
  input: Readonly<{
    from: string;
    action: string;
    conditionSatisfied: boolean;
  }>,
  router: { navigateByUrl(url: string): Promise<boolean> },
  location: { back(): void },
  history?: NavigationHistory,
): Promise<DispatchResult> {
  const transition = TEAT_TRANSITIONS.find(
    (candidate) =>
      candidate.from === input.from && candidate.action === input.action,
  );
  if (transition === undefined) {
    return { kind: 'denied', reason: 'missing-transition' };
  }
  if (transition.condition !== '' && !input.conditionSatisfied) {
    return { kind: 'denied', reason: 'condition-unsatisfied' };
  }
  if (transition.to === '__previous__') {
    if (input.from === 'ait-done') {
      const previous = history?.previousScreen();
      if (
        previous === undefined ||
        history?.isEditableActScreen(previous) !== false
      ) {
        return { kind: 'denied', reason: 'unsafe-previous' };
      }
    }
    location.back();
    return { kind: 'back' };
  }
  if (!REGISTERED_DESTINATIONS.has(transition.to)) {
    return { kind: 'denied', reason: 'unregistered-destination' };
  }
  await router.navigateByUrl(`/${transition.to}`);
  return { kind: 'navigated', to: transition.to };
}
