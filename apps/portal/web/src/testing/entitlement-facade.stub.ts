// R-0014 TASK-0002 (Inspector, iteração 2 — adenda A2). Stub de `EntitlementFacade.check(kind,
// id)` (M8). Só usado por specs; `import type` evita resolução em runtime antes de TASK-0004.
// `ReturnType<typeof vi.fn>` é `Mock<Procedure | Constructable>` sob vitest 4 (sem assinatura
// de chamada): tipamos com `Mock<EntitlementFacade['check']>` (plan.md §Adendas A2).
import { vi, type Mock } from 'vitest';
import type { EntitlementFacade } from '../app/core/entitlement.facade';
import type { EntitlementKind } from './route-manifest.fixture';

export interface EntitlementFacadeStub extends EntitlementFacade {
  readonly check: Mock<EntitlementFacade['check']>;
}

export function createEntitlementFacadeStub(
  result: boolean | ((kind: EntitlementKind, id: string) => boolean) = true,
): EntitlementFacadeStub {
  const check = vi.fn<EntitlementFacade['check']>(
    async (kind: EntitlementKind, id: string): Promise<boolean> =>
      typeof result === 'function' ? result(kind, id) : result,
  );
  return { check };
}
