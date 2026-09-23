// R-0012 TASK-0014 (Inspector; adenda A9 — atribuído ao par 2 porque só os specs de página o
// consomem). Stubs de slots/listas/comando de facade e `pageProviders(papel)` para os 50 specs de
// página do CTG-0002b-2 (contrato §7). Nenhum destes stubs faz requisição HTTP: cada slot é
// gravável diretamente pelo teste (`set`), e os comandos rejeitam por padrão com
// `RaitCommandUnavailableError` (M8) — o mesmo comportamento que as facades reais têm hoje.
// Padrão dos stubs de leitura de `apps/portal/web/src/testing/*.stub.ts`.
import { provideLocationMocks } from '@angular/common/testing';
import {
  computed,
  signal,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { vi, type Mock } from 'vitest';
import {
  classifyError,
  RaitCommandUnavailableError,
  type ClassifiedError,
} from '../app/core/error-boundary';
import { RaitSessionFacade } from '../app/core/session.facade';
import { RaitStreamTransport } from '../app/core/stream-transport';
import { RaitClock } from '../app/data/clock';
import type {
  CommandOutcome,
  CommandRunner,
  CommandStatus,
} from '../app/data/facades/command';
import type { ListFacade } from '../app/data/facades/list.facade';
import type { ReadSlot, ReadStatus } from '../app/data/facades/read-store';
import {
  LIST_PAGE_SIZE_DEFAULT,
  type CommandResult,
  type ListPage,
  type ListQuery,
  type RaitCommand,
} from '../app/data/models';
import { createClockStub } from './clock.stub';
import { ROLE_PERMISSIONS_FIXTURE } from './policy.fixture';
import type { RaitRoleCode } from './route-manifest.fixture';
import { createSessionStub, SESSION_PRESETS } from './session.stub';
import { createStreamTransportStub } from './stream-transport.stub';
import { createStynxSessionStub } from './stynx-session.stub';

// --- readSlotStub -----------------------------------------------------------------------------

export interface ReadSlotSet<T> {
  readonly status?: ReadStatus;
  readonly value?: T | null;
  readonly error?: ClassifiedError | null;
  readonly key?: string | null;
  readonly loadedAt?: number | null;
}

/**
 * Estrutural com `ReadStore<T>` (não só `ReadSlot<T>`): a maioria dos slots de uma facade real é
 * o retorno de `createReadStore` (`ReadStore`, com `load`/`invalidate`/`refresh`/`reset`); um
 * stub que só implementasse `ReadSlot` não seria atribuível a essas propriedades. `load`/
 * `refresh` aqui são no-op (o teste grava o estado com `set`, nunca dispara requisição).
 */
export interface ReadSlotStub<T> {
  readonly status: ReadSlot<T>['status'];
  readonly error: ReadSlot<T>['error'];
  readonly value: ReadSlot<T>['value'];
  readonly key: ReadSlot<T>['key'];
  readonly loadedAt: ReadSlot<T>['loadedAt'];
  load(key: string, loader: () => Promise<T>): Promise<void>;
  invalidate(key?: string): void;
  refresh(): Promise<void>;
  reset(): void;
  set(patch: ReadSlotSet<T>): void;
}

/** Slot de leitura gravável diretamente pelo teste — nenhum `load()` real. */
export function readSlotStub<T>(initial: ReadSlotSet<T> = {}): ReadSlotStub<T> {
  const status = signal<ReadStatus>(initial.status ?? 'idle');
  const error = signal<ClassifiedError | null>(initial.error ?? null);
  const value = signal<T | null>(initial.value ?? null);
  const key = signal<string | null>(initial.key ?? null);
  const loadedAt = signal<number | null>(initial.loadedAt ?? null);
  return {
    status: computed(() => status()),
    error: computed(() => error()),
    value: computed(() => value()),
    key: computed(() => key()),
    loadedAt: computed(() => loadedAt()),
    async load(): Promise<void> {},
    invalidate(): void {},
    async refresh(): Promise<void> {},
    reset(): void {
      status.set('idle');
      error.set(null);
      value.set(null);
      key.set(null);
      loadedAt.set(null);
    },
    set(patch: ReadSlotSet<T>): void {
      if (patch.status !== undefined) status.set(patch.status);
      if ('value' in patch) value.set(patch.value ?? null);
      if ('error' in patch) error.set(patch.error ?? null);
      if ('key' in patch) key.set(patch.key ?? null);
      if ('loadedAt' in patch) loadedAt.set(patch.loadedAt ?? null);
    },
  };
}

// --- listFacadeStub ----------------------------------------------------------------------------

export interface ListFacadeSet<T> {
  readonly status?: ReadStatus;
  readonly items?: readonly T[];
  readonly total?: number;
  readonly error?: ClassifiedError | null;
}

export interface ListFacadeStub<T> extends ListFacade<T> {
  set(patch: ListFacadeSet<T>): void;
  readonly loadMock: Mock<(query?: ListQuery) => Promise<void>>;
  readonly setQueryMock: Mock<(patch: Partial<ListQuery>) => Promise<void>>;
}

/**
 * Lista gravável diretamente pelo teste. `items` inicial (padrão `[]`) já define `status`
 * ('empty' quando vazia, 'ready' senão — mesma regra de `emptyWhen` do contrato §4.1); `load`/
 * `setQuery` são mocks que só atualizam `query()` (nunca disparam requisição).
 */
export function listFacadeStub<T>(items: readonly T[] = []): ListFacadeStub<T> {
  const initialPage: ListPage<T> = {
    items,
    total: items.length,
    page: 1,
    pageSize: LIST_PAGE_SIZE_DEFAULT,
  };
  const status = signal<ReadStatus>(items.length === 0 ? 'empty' : 'ready');
  const error = signal<ClassifiedError | null>(null);
  const value = signal<ListPage<T> | null>(initialPage);
  const key = signal<string | null>('stub');
  const loadedAt = signal<number | null>(0);
  const query = signal<ListQuery>({});

  const loadMock = vi.fn(async (nextQuery?: ListQuery): Promise<void> => {
    if (nextQuery !== undefined) query.set(nextQuery);
  });
  const setQueryMock = vi.fn(
    async (patch: Partial<ListQuery>): Promise<void> => {
      query.update((current) => ({ ...current, ...patch }));
    },
  );

  return {
    status: computed(() => status()),
    error: computed(() => error()),
    value: computed(() => value()),
    key: computed(() => key()),
    loadedAt: computed(() => loadedAt()),
    query: computed(() => query()),
    items: computed(() => value()?.items ?? []),
    load: loadMock,
    setQuery: setQueryMock,
    async refresh(): Promise<void> {},
    invalidate(): void {},
    set(patch: ListFacadeSet<T>): void {
      const { status: explicitStatus } = patch;
      const hasExplicitStatus = explicitStatus !== undefined;
      if (hasExplicitStatus) status.set(explicitStatus);
      if ('error' in patch) error.set(patch.error ?? null);
      if (patch.items !== undefined) {
        const total = patch.total ?? patch.items.length;
        value.set({
          items: patch.items,
          total,
          page: 1,
          pageSize: LIST_PAGE_SIZE_DEFAULT,
        });
        if (!hasExplicitStatus) {
          status.set(patch.items.length === 0 ? 'empty' : 'ready');
        }
      }
    },
    loadMock,
    setQueryMock,
  };
}

// --- commandRunnerStub -------------------------------------------------------------------------

export interface CommandRunnerStub extends CommandRunner {
  readonly runMock: Mock<
    (
      command: RaitCommand,
      exec: () => Promise<CommandResult<unknown>>,
    ) => Promise<CommandOutcome<unknown>>
  >;
}

/**
 * `run` sempre resolve `{ ok: false, error: classifyError(new RaitCommandUnavailableError(command)) }`
 * (M8, mesmo comportamento das facades reais nesta rodada) — nunca chama `exec`.
 */
export function commandRunnerStub(): CommandRunnerStub {
  const status = signal<CommandStatus>('idle');
  const error = signal<ClassifiedError | null>(null);

  const runMock = vi.fn(
    async (
      command: RaitCommand,
      _exec: () => Promise<CommandResult<unknown>>,
    ): Promise<CommandOutcome<unknown>> => {
      status.set('submitting');
      const classified = classifyError(
        new RaitCommandUnavailableError(command),
      );
      error.set(classified);
      status.set('error');
      return { ok: false, error: classified };
    },
  );

  return {
    status: computed(() => status()),
    error: computed(() => error()),
    run: runMock as CommandRunner['run'],
    clearError(): void {
      error.set(null);
      if (status() === 'error') status.set('idle');
    },
    runMock,
  };
}

// --- stubFacade ----------------------------------------------------------------------------------

/** Prefixo dos métodos de leitura da facade (contrato §4.3) — nunca fazem requisição no stub. */
const LOAD_METHOD_PATTERN = /^(load|find)/;

/**
 * Monta o objeto de uma facade a partir dos slots/comandos já preenchidos por
 * `readSlotStub`/`listFacadeStub`/`commandRunnerStub` (`shape`) e sintetiza, por `Proxy`, os
 * métodos que o `shape` não lista explicitamente:
 * - `load*`/`find*` (§4.3, ex. `loadIntake`, `findCaseByProtocol`): no-op que resolve
 *   `undefined` sem tocar nos slots — a página lê o estado que o teste já gravou via
 *   `slot.set(...)` antes de renderizar, nunca um novo carregamento.
 * - qualquer outro método (presumido comando, §3.5, ex. `protocol`, `admit`, `reassign`):
 *   delega a `shape.command.run(nomeDoMétodo, …)`, preservando `command.runMock` para as
 *   asserções de clique/confirmação — o `commandRunnerStub()` sempre resolve `unavailable`
 *   (M8), então o nome exato do comando não precisa ser adivinhado pelo stub.
 * Sinais computados que a página lê como valor (não como comando), como `casosDaFila` ou
 * `provimentosDecisao`, **não** são sintetizados aqui (não têm o padrão `load*`/`find*` nem são
 * comandos) — o `shape` precisa listá-los explicitamente (ex.: `casosDaFila: () => new Map()`).
 * Propriedades do `shape` (slots, sinais, `command`) nunca passam pelo `Proxy`: são devolvidas
 * como estão, preservando `.set()`/`.loadMock`/`.runMock` para as asserções do teste.
 */
// `stubFacade<F>()` é chamado com um único argumento de tipo (a facade real, ex.
// `stubFacade<CaseFacade>()`) e devolve uma função que recebe o `shape` — a curried porque, com
// um único `stubFacade<F, S extends Partial<F> = Partial<F>>(shape: S)`, o TypeScript infere `S`
// a partir do *default* (`Partial<F>`) em vez do literal `shape` sempre que `F` é dado
// explicitamente (perde `.set()`/`.loadMock`/`.runMock`/`.setQueryMock` no tipo devolvido, mesmo
// eles existindo em runtime). Com a currying, `S` só aparece no tipo da função interna, sem
// default, então a única fonte de inferência é o argumento `shape` — preservando os tipos ricos
// de `readSlotStub`/`listFacadeStub`/`commandRunnerStub` para as asserções do teste, e ainda
// satisfazendo `F` (o tipo da facade real) para o `useValue` do provider (`S extends Partial<F>`).
// Uso: `stubFacade<CaseFacade>()({ … })`.
export function stubFacade<F>() {
  return function stubFacadeShape<S extends Partial<F>>(shape: S): S & F {
    const target = shape as Record<string, unknown>;
    const synthesized = new Map<string, (...args: unknown[]) => unknown>();
    return new Proxy(target, {
      get(obj, prop, receiver): unknown {
        if (typeof prop !== 'string' || prop in obj) {
          return Reflect.get(obj, prop, receiver);
        }
        const cached = synthesized.get(prop);
        if (cached) return cached;
        const method = LOAD_METHOD_PATTERN.test(prop)
          ? async (): Promise<void> => undefined
          : (..._args: unknown[]): unknown => {
              const command = obj['command'] as CommandRunner | undefined;
              if (!command) return Promise.resolve(undefined);
              return command.run(prop as RaitCommand, () =>
                Promise.reject(
                  new Error(`stubFacade: comando não simulado: ${prop}`),
                ),
              );
            };
        synthesized.set(prop, method);
        return method;
      },
    }) as S & F;
  };
}

/**
 * Delega explicitamente um método de comando (§3.5) ao `command.run(m8, …)` do
 * `CommandRunnerStub` já criado (`command`), com o NOME REAL do comando M8 (ex.
 * `'rait-case:admit'`) — sem isso, o fallback genérico de `stubFacade` para métodos que não são
 * `load*`/`find*` usa o NOME DO MÉTODO (`admit`) como comando, porque o `Proxy` não tem como
 * saber o M8 real sem uma tabela de mapeamento (documentado em `stubFacade`, nunca adivinhado).
 * Adenda A15 (delivery-review CTG-0002b-2, achado 11, C-2B-71): os testes de confirmação que
 * verificam o comando M8 exato (`facade.command.runMock.mock.calls[0]?.[0]`) precisam do nome
 * real, não do nome do método — uso: `stubFacade<CaseFacade>()({ admit: commandMethod('rait-
 * case:admit', command), …, command })`. Retorno `never` (como `radarCasos: (() => new Map())
 * as never` em outros stubs): a assinatura real de cada método de comando difere por facade
 * (parâmetros/`CommandOutcome<T>` específico) e este stub nunca resolve de verdade (M8, `run`
 * sempre rejeita), então o tipo exato não importa — só que seja atribuível a qualquer membro de
 * `S`.
 */
export function commandMethod(
  command: RaitCommand,
  runner: Pick<CommandRunner, 'run'>,
): never {
  return ((..._args: unknown[]): Promise<unknown> =>
    runner.run(command, () =>
      Promise.reject(new Error(`stubFacade: comando não simulado: ${command}`)),
    )) as never;
}

/**
 * Delega explicitamente um método `load<Recurso>(query)` (ou `load<Recurso>(orgao, query)`,
 * quando o método real da facade toma o órgão como primeiro argumento — o stub ignora esse
 * argumento, já que `pageProviders`/`stubFacade` não modelam filtro por órgão) ao `.load` do
 * `ListFacadeStub` correspondente (contrato §4.3) — sem isso, o fallback genérico de
 * `stubFacade` para métodos `load*` seria um no-op que nunca chama `slot.load`, e os testes de
 * C-2B-67 (URL ↔ ListFacade) não veriam `loadMock`/`setQueryMock` registrar a chamada. Uso:
 * `stubFacade<ProtocolFacade>({ intake, loadIntake: delegateListLoad(intake), ... })`.
 */
export function delegateListLoad<T>(
  slot: Pick<ListFacadeStub<T>, 'load'>,
): (...args: unknown[]) => Promise<void> {
  return (...args: unknown[]): Promise<void> => {
    const query = args.length > 1 ? args[1] : args[0];
    return slot.load(query as never);
  };
}

// --- pageProviders -------------------------------------------------------------------------------

/**
 * Providers comuns de um spec de página (contrato §7): sessão RAIT (`RaitSessionFacade`, para
 * `canonicalRoles`/`can`) e sessão STYNX (`StynxSessionService`, para `*stynxHasPermission`) com
 * as permissões de `ROLE_PERMISSIONS_FIXTURE[papel]`, transporte SSE stub (nenhuma conexão real),
 * relógio fixo e um roteador vazio (a página é montada isolada via `TestBed.createComponent`, não
 * pelo harness de rotas) — `extra` acrescenta os providers específicos da página (as facades
 * stub).
 */
export function pageProviders(
  role: RaitRoleCode,
  extra: readonly (Provider | EnvironmentProviders)[] = [],
): Provider[] {
  // `provideRouter`/`provideLocationMocks` devolvem `EnvironmentProviders`, aceitos em runtime
  // pelo `providers` do `TestBed`/`createRaitRouterHarness` junto de `Provider`s comuns, mas
  // fora do tipo `Provider[]` declarado por `createRaitRouterHarness` (`router-harness.ts`, fora
  // da fronteira de escrita desta tarefa) — o cast documenta essa forma mista, já usada pelo
  // próprio harness internamente.
  return [
    {
      provide: RaitSessionFacade,
      useValue: createSessionStub({
        ...SESSION_PRESETS[role],
        permissions: [...ROLE_PERMISSIONS_FIXTURE[role]],
      }),
    },
    {
      provide: StynxSessionService,
      useValue: createStynxSessionStub({
        active: true,
        permissions: [...ROLE_PERMISSIONS_FIXTURE[role]],
        claims: { roles: [role] },
      }),
    },
    { provide: RaitStreamTransport, useValue: createStreamTransportStub() },
    { provide: RaitClock, useValue: createClockStub() },
    provideRouter([]),
    provideLocationMocks(),
    ...extra,
  ] as Provider[];
}
