// R-0014 TASK-0002 (Inspector). Stub de `SessionFacade` (M8 do plan.md): `active`,
// `assuranceLevel`, `actRequirements`, `representation` como signals substituíveis por
// `useValue` (`detran-ui-guide.md` §5). `import type` para a interface de produção — nunca
// resolvido em runtime antes de TASK-0004 existir. Só usado por specs.
import { signal, type WritableSignal } from '@angular/core';
import type { SessionFacade } from '../app/core/session.facade';

export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';

export interface ActRequirement {
  readonly act: string;
  readonly level: AssuranceLevel;
}

export interface Representation {
  readonly representedCpf: string;
  readonly label: string;
}

export interface SessionFacadeStub extends SessionFacade {
  readonly activeSignal: WritableSignal<boolean>;
  readonly assuranceLevelSignal: WritableSignal<AssuranceLevel | null>;
  readonly actRequirementsSignal: WritableSignal<readonly ActRequirement[]>;
  readonly representationSignal: WritableSignal<Representation | null>;
}

export function createSessionFacadeStub(
  initial: {
    active?: boolean;
    assuranceLevel?: AssuranceLevel | null;
    actRequirements?: readonly ActRequirement[];
    representation?: Representation | null;
  } = {},
): SessionFacadeStub {
  const activeSignal = signal(initial.active ?? false);
  const assuranceLevelSignal = signal<AssuranceLevel | null>(
    initial.assuranceLevel ?? null,
  );
  const actRequirementsSignal = signal<readonly ActRequirement[]>(
    initial.actRequirements ?? [],
  );
  const representationSignal = signal<Representation | null>(
    initial.representation ?? null,
  );
  return {
    active: activeSignal,
    assuranceLevel: assuranceLevelSignal,
    actRequirements: actRequirementsSignal,
    representation: representationSignal,
    activeSignal,
    assuranceLevelSignal,
    actRequirementsSignal,
    representationSignal,
  };
}

/**
 * Personas da matriz de guardas (prompt TASK-0002 §B.3): anônima (sem sessão), `simples`,
 * `avancada`, `qualificada` (nível da claim, não persona de fixture — Regra 5 do prompt).
 */
export const SESSION_FACADE_PRESETS = {
  anonimo: () => createSessionFacadeStub({ active: false }),
  simples: () =>
    createSessionFacadeStub({ active: true, assuranceLevel: 'simples' }),
  avancada: () =>
    createSessionFacadeStub({ active: true, assuranceLevel: 'avancada' }),
  qualificada: () =>
    createSessionFacadeStub({ active: true, assuranceLevel: 'qualificada' }),
} as const;
