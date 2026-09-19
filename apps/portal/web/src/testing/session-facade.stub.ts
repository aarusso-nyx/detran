// R-0014 TASK-0002 (Inspector), estendido em TASK-0008 (§4 do contrato CTG-0003a; A6(c) do
// plan.md — [DIVERGE-16]: `ActRequirement.allowed` obrigatório, ajustado aqui). Stub de
// `SessionFacade` completo: os quatro signals de M8 (`active`, `assuranceLevel`,
// `actRequirements`, `representation`) mais os novos do §4 (`account`, `representations`,
// `loading`, `loadError`, `load()`, `requirementFor()`, `canPerform()`, `requestElevation()`,
// `completeElevation()`). `import type` para a interface de produção — a classe abstrata real
// (`core/session.facade.ts`) ainda não declara os membros novos (TASK-0009); a interface do stub
// os acrescenta livremente (extensão pura, nunca remoção). Só usado por specs.
import { signal, type WritableSignal } from '@angular/core';
import { vi, type Mock } from 'vitest';
import type {
  ActRequirement,
  ElevationRequest,
  ElevationStarted,
  ExtendedClassifiedError,
  Representation,
} from './contract-types';

export type AssuranceLevel = 'simples' | 'avancada' | 'qualificada';

// Não estende `SessionFacade` (produção): a classe abstrata real ainda não declara os membros
// novos do §4 (TASK-0009) e `level` de `ActRequirement` ainda é `AssuranceLevel` sem `'none'` —
// `extends` quebraria por incompatibilidade estrutural em `actRequirements`. Os providers do
// Angular tipam `useValue` como `any` (`{ provide: SessionFacade, useValue: stub }`), então a
// injeção não exige o `extends`; o comentário documenta a decisão para o próximo leitor.
export interface SessionFacadeStub {
  readonly active: () => boolean;
  readonly account: () => unknown | null;
  readonly assuranceLevel: () => AssuranceLevel | null;
  readonly actRequirements: () => readonly ActRequirement[];
  readonly representations: () => readonly Representation[];
  readonly representation: () => Representation | null;
  readonly loading: () => boolean;
  readonly loadError: () => ExtendedClassifiedError | null;
  load(): Promise<void>;
  requirementFor(actKey: string): ActRequirement | null;
  canPerform(actKey: string): boolean;
  requestElevation(input: ElevationRequest): Promise<ElevationStarted>;
  completeElevation(elevationId: string, resumeToken: string): Promise<void>;

  readonly activeSignal: WritableSignal<boolean>;
  readonly accountSignal: WritableSignal<unknown | null>;
  readonly assuranceLevelSignal: WritableSignal<AssuranceLevel | null>;
  readonly actRequirementsSignal: WritableSignal<readonly ActRequirement[]>;
  readonly representationsSignal: WritableSignal<readonly Representation[]>;
  readonly representationSignal: WritableSignal<Representation | null>;
  readonly loadingSignal: WritableSignal<boolean>;
  readonly loadErrorSignal: WritableSignal<ExtendedClassifiedError | null>;
  readonly loadMock: Mock<() => Promise<void>>;
  readonly requestElevationMock: Mock<
    (input: ElevationRequest) => Promise<ElevationStarted>
  >;
  readonly completeElevationMock: Mock<
    (elevationId: string, resumeToken: string) => Promise<void>
  >;
}

export function createSessionFacadeStub(
  initial: {
    active?: boolean;
    account?: unknown | null;
    assuranceLevel?: AssuranceLevel | null;
    actRequirements?: readonly ActRequirement[];
    representations?: readonly Representation[];
    representation?: Representation | null;
    loading?: boolean;
    loadError?: ExtendedClassifiedError | null;
    requestElevationResult?: ElevationStarted;
  } = {},
): SessionFacadeStub {
  const activeSignal = signal(initial.active ?? false);
  const accountSignal = signal<unknown | null>(initial.account ?? null);
  const assuranceLevelSignal = signal<AssuranceLevel | null>(
    initial.assuranceLevel ?? null,
  );
  const actRequirementsSignal = signal<readonly ActRequirement[]>(
    initial.actRequirements ?? [],
  );
  const representationsSignal = signal<readonly Representation[]>(
    initial.representations ?? [],
  );
  const representationSignal = signal<Representation | null>(
    initial.representation ?? null,
  );
  const loadingSignal = signal(initial.loading ?? false);
  const loadErrorSignal = signal<ExtendedClassifiedError | null>(
    initial.loadError ?? null,
  );

  const loadMock = vi.fn<() => Promise<void>>(async () => {});
  const requestElevationMock = vi.fn<
    (input: ElevationRequest) => Promise<ElevationStarted>
  >(
    async () =>
      initial.requestElevationResult ?? {
        redirectUrl: 'https://sso.gov.br/authorize?fixture=1',
        resumeToken: 'resume-token-fixture',
        elevationId: 'elevation-fixture',
      },
  );
  const completeElevationMock = vi.fn<
    (elevationId: string, resumeToken: string) => Promise<void>
  >(async () => {});

  return {
    active: activeSignal,
    account: accountSignal,
    assuranceLevel: assuranceLevelSignal,
    actRequirements: actRequirementsSignal,
    representations: representationsSignal,
    representation: representationSignal,
    loading: loadingSignal,
    loadError: loadErrorSignal,
    load: loadMock,
    requirementFor: (actKey: string) =>
      actRequirementsSignal().find((item) => item.act === actKey) ?? null,
    canPerform: (actKey: string) =>
      (actRequirementsSignal().find((item) => item.act === actKey)?.allowed ??
        false) === true,
    requestElevation: requestElevationMock,
    completeElevation: completeElevationMock,
    activeSignal,
    accountSignal,
    assuranceLevelSignal,
    actRequirementsSignal,
    representationsSignal,
    representationSignal,
    loadingSignal,
    loadErrorSignal,
    loadMock,
    requestElevationMock,
    completeElevationMock,
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
