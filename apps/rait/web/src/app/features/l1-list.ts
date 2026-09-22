// Apoio às páginas L1 (plan.md M13; contrato CTG-0002b §1 item 3 e §6 "Páginas L1"): lista/leitura
// pelos clientes CRUD com `createListFacade(query => client.list…(query), clock)` na própria
// página, `<stynx-table>` + `<stynx-pagination>` do kit, `?q=&filtro=&pagina=` e NENHUM botão de
// comando (as chaves `cmd.*` das fichas L1 ficam sem uso — OD-R12-034). Cabeçalhos = nomes dos
// campos do contrato (OD-R12-028, precedente do par 1). Só em contexto de injeção.
import { computed, inject, type Signal } from '@angular/core';
import { StynxI18nService, StynxIntlDatePipe } from '@detran/ui';
import { RaitClock } from '../data/clock';
import { createListFacade, type ListFacade } from '../data/facades/list.facade';
import type { ListPage, ListQuery } from '../data/models';
import type { TableColumn } from '../shared/table-column';
import { connectListToUrl, type ListUrlSync } from './list-url-sync';

export interface L1Row extends Record<string, unknown> {
  readonly id: string;
}

export interface L1List<T, R extends L1Row> {
  readonly facade: ListFacade<T>;
  readonly list: ListUrlSync;
  readonly rows: Signal<R[]>;
  readonly columns: TableColumn<R>[];
  readonly trackRow: (row: R) => string;
  reload(): void;
}

export interface L1Formatters {
  readonly date: (value: string | null | undefined) => string;
  readonly bool: (value: boolean | null | undefined) => string;
  readonly text: (value: string | number | null | undefined) => string;
  readonly translate: (key: string) => string;
}

const YES_KEY = 'rait.common.yes';
const NO_KEY = 'rait.common.no';

/** Formatadores de célula (texto já traduzido; o kit renderiza só texto). */
export function l1Formatters(): L1Formatters {
  const i18n = inject(StynxI18nService);
  const datePipe = inject(StynxIntlDatePipe);
  return {
    date: (value) => (value ? datePipe.transform(value) : ''),
    bool: (value) =>
      value === null || value === undefined
        ? ''
        : i18n.translate(value ? YES_KEY : NO_KEY),
    text: (value) =>
      value === null || value === undefined ? '' : String(value),
    translate: (key) => i18n.translate(key),
  };
}

export function createL1List<T, R extends L1Row>(options: {
  readonly load: (query: ListQuery) => Promise<ListPage<T>>;
  readonly columns: readonly (keyof R & string)[];
  readonly toRow: (item: T) => R;
}): L1List<T, R> {
  const facade = createListFacade<T>(options.load, inject(RaitClock));
  const list = connectListToUrl({ load: (query) => facade.load(query) });
  return {
    facade,
    list,
    rows: computed(() => facade.items().map(options.toRow)),
    columns: options.columns.map((key) => ({ key, label: key })),
    trackRow: (row) => row.id,
    reload: () => void facade.load(list.query()),
  };
}
