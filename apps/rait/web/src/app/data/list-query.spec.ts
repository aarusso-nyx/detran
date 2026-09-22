// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.2, §8 — `data/list-query.ts` ainda não existe
// (TASK-0009): falha de módulo esperada nesta entrega.
import {
  applyListQuery,
  listQueryToParams,
  parseListQuery,
} from './list-query';
import { LIST_PAGE_SIZE_DEFAULT, LIST_PAGE_SIZE_MAX } from './models/list-page';
import type { ListQuerySpec } from './list-query';

interface Item {
  readonly id: string;
  readonly state: string;
  readonly protocol_number: string;
}

function item(id: string, state: string, protocol: string): Item {
  return { id, state, protocol_number: protocol };
}

describe('applyListQuery — filtro (C-2B-01)', () => {
  it('dado 3 itens e query { filtro: { state: "ADMITIDO" } } com spec.filtro ["state"] quando applyListQuery então items = só os ADMITIDO, total = sua contagem, page 1, pageSize 50; dado filtro fora de spec.filtro então ignorado [negativo]', () => {
    const items = [
      item('1', 'ADMITIDO', 'RAIT-2026-000001'),
      item('2', 'PROTOCOLADO', 'RAIT-2026-000002'),
      item('3', 'ADMITIDO', 'RAIT-2026-000003'),
    ];
    const spec: ListQuerySpec<Item> = { q: [], filtro: ['state'] };

    const filtered = applyListQuery(
      items,
      { filtro: { state: 'ADMITIDO' } },
      spec,
    );
    expect(filtered.items.map((entry) => entry.id)).toEqual(['1', '3']);
    expect(filtered.total).toBe(2);
    expect(filtered.page).toBe(1);
    expect(filtered.pageSize).toBe(LIST_PAGE_SIZE_DEFAULT);

    // campo fora de spec.filtro é ignorado — nenhum estreitamento [negativo]
    const ignored = applyListQuery(
      items,
      { filtro: { protocol_number: 'RAIT-2026-000001' } },
      spec,
    );
    expect(ignored.items).toHaveLength(3);
  });
});

describe('applyListQuery — q (C-2B-02)', () => {
  it('dado protocol_number "RAIT-2026-000001"/"…02" e query { q: "rait-2026-0000" } com spec.q ["protocol_number"] quando applyListQuery então ambos; dado q sem ocorrência então total 0; dado q só de espaços então nenhum estreitamento', () => {
    const items = [
      item('1', 'ADMITIDO', 'RAIT-2026-000001'),
      item('2', 'ADMITIDO', 'RAIT-2026-000002'),
    ];
    const spec: ListQuerySpec<Item> = { q: ['protocol_number'], filtro: [] };

    const both = applyListQuery(items, { q: 'rait-2026-0000' }, spec);
    expect(both.items.map((entry) => entry.id)).toEqual(['1', '2']);

    const none = applyListQuery(items, { q: 'RAIT-9999' }, spec);
    expect(none.total).toBe(0);

    const blank = applyListQuery(items, { q: '   ' }, spec);
    expect(blank.items).toHaveLength(2);
  });
});

describe('applyListQuery — ordem (C-2B-03)', () => {
  it('dado itens em ordem [c, a, b] e query { ordem: "padrao" } ou { ordem: "qualquer" } quando applyListQuery então items na ordem [c, a, b] (nunca ordena; RN-RAIT-141) [negativo]', () => {
    const items = [
      item('c', 'ADMITIDO', 'RAIT-2026-000003'),
      item('a', 'ADMITIDO', 'RAIT-2026-000001'),
      item('b', 'ADMITIDO', 'RAIT-2026-000002'),
    ];
    const spec: ListQuerySpec<Item> = { q: [], filtro: [] };

    const padrao = applyListQuery(items, { ordem: 'padrao' }, spec);
    expect(padrao.items.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);

    const qualquer = applyListQuery(
      items,
      { ordem: 'qualquer' as never },
      spec,
    );
    expect(qualquer.items.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('applyListQuery — paginação (C-2B-04)', () => {
  it('dado 120 itens e query { page: 3, pageSize: 50 } quando applyListQuery então items = os 20 últimos, total 120; dado pageSize 500 então pageSize = 50 (LIST_PAGE_SIZE_MAX); dado page 0 então page 1', () => {
    const items = Array.from({ length: 120 }, (_, index) =>
      item(String(index), 'ADMITIDO', `RAIT-2026-${index}`),
    );
    const spec: ListQuerySpec<Item> = { q: [], filtro: [] };

    const page3 = applyListQuery(items, { page: 3, pageSize: 50 }, spec);
    expect(page3.items).toHaveLength(20);
    expect(page3.total).toBe(120);

    const clamped = applyListQuery(items, { pageSize: 500 }, spec);
    expect(clamped.pageSize).toBe(LIST_PAGE_SIZE_MAX);

    const zero = applyListQuery(items, { page: 0 }, spec);
    expect(zero.page).toBe(1);
  });
});

describe('parseListQuery / listQueryToParams (C-2B-05)', () => {
  it('dado ParamMap { q, ordem: "padrao", filtro: "state:ADMITIDO;instance:jari", pagina: "2" } quando parseListQuery então { q, ordem: "padrao", filtro: {...}, page: 2 }; dado ordem "abc" e pagina "z" então ausentes; dado listQueryToParams do resultado então o mesmo ParamMap (round-trip; page 1 omitida)', () => {
    const params = new Map([
      ['q', 'x'],
      ['ordem', 'padrao'],
      ['filtro', 'state:ADMITIDO;instance:jari'],
      ['pagina', '2'],
    ]);
    const paramMap = {
      get: (key: string) => params.get(key) ?? null,
    } as unknown as import('@angular/router').ParamMap;

    const parsed = parseListQuery(paramMap);
    expect(parsed).toEqual({
      q: 'x',
      ordem: 'padrao',
      filtro: { state: 'ADMITIDO', instance: 'jari' },
      page: 2,
    });

    const invalidParams = new Map([
      ['ordem', 'abc'],
      ['pagina', 'z'],
    ]);
    const invalidMap = {
      get: (key: string) => invalidParams.get(key) ?? null,
    } as unknown as import('@angular/router').ParamMap;
    const invalidParsed = parseListQuery(invalidMap);
    expect(invalidParsed.ordem).toBeUndefined();
    expect(invalidParsed.page).toBeUndefined();

    const roundTrip = listQueryToParams(parsed);
    expect(roundTrip).toEqual({
      q: 'x',
      ordem: 'padrao',
      filtro: 'state:ADMITIDO;instance:jari',
      pagina: '2',
    });
  });
});
