// Cenários por estado, tipados por operação (R-0033 TASK-0003; `frontend-preview-mode.md` §3,
// adenda A1 item 4 de `plan.md`; P-09). O adapter produz o estado pelos MESMOS caminhos de erro do
// app: a facade classifica com `classifyError` (`core/error-boundary.ts`) e `readStatusFor`
// devolve o `ReadStatus` que `PageState` apresenta. Nunca 404 sintético; nenhum `requestId`
// sintetizado (regra 5 do §3).
//
// | estado      | lista                              | leitura unitária     |
// | ----------- | ---------------------------------- | -------------------- |
// | `loaded`    | `applyListQuery(produce(), …)`     | `produce()`          |
// | `empty`     | `applyListQuery([], …)`            | `produce()` (regra 2)|
// | `loading`   | promessa que nunca resolve         | idem                 |
// | `error`     | `HttpErrorResponse` 500 `RAIT.INTERNAL`         | idem    |
// | `forbidden` | `HttpErrorResponse` 403 `RAIT.FORBIDDEN_ACTION` | idem    |
import { HttpErrorResponse } from '@angular/common/http';
import { applyListQuery, type ListQuerySpec } from '../data/list-query';
import type { ListPage, ListQuery } from '../data/models';
import type { PreviewScreenState } from './preview-state.service';

/** `rait-error-catalog.md` §1 regra 7 (`RAIT.INTERNAL`, 500) e §3.1 (`RAIT.FORBIDDEN_ACTION`, 403). */
const INTERNAL_CODE = 'RAIT.INTERNAL';
const FORBIDDEN_CODE = 'RAIT.FORBIDDEN_ACTION';
const INTERNAL_STATUS = 500;
const FORBIDDEN_STATUS = 403;

function pending<T>(): Promise<T> {
  return new Promise<T>(() => {
    // `loading`: a promessa nunca assenta (o `ReadStatus` fica `loading`).
  });
}

/** `error`/`forbidden` → rejeição com o corpo de erro do catálogo; demais estados → `null`. */
function scenarioFailure(state: PreviewScreenState): HttpErrorResponse | null {
  if (state === 'error') {
    return new HttpErrorResponse({
      status: INTERNAL_STATUS,
      error: { code: INTERNAL_CODE },
    });
  }
  if (state === 'forbidden') {
    return new HttpErrorResponse({
      status: FORBIDDEN_STATUS,
      error: { code: FORBIDDEN_CODE },
    });
  }
  return null;
}

export function applyListScenario<T>(
  state: PreviewScreenState,
  query: ListQuery,
  spec: ListQuerySpec<T>,
  produce: () => readonly T[],
): Promise<ListPage<T>> {
  if (state === 'loading') return pending();
  const failure = scenarioFailure(state);
  if (failure) return Promise.reject(failure);
  return new Promise<ListPage<T>>((resolve) =>
    resolve(applyListQuery(state === 'empty' ? [] : produce(), query, spec)),
  );
}

export function applyReadScenario<T>(
  state: PreviewScreenState,
  produce: () => T,
): Promise<T> {
  if (state === 'loading') return pending();
  const failure = scenarioFailure(state);
  if (failure) return Promise.reject(failure);
  return new Promise<T>((resolve) => resolve(produce()));
}
