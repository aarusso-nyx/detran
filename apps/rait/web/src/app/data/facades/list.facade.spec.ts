// R-0012 TASK-0008 (Inspector). CTG-0002b.md §4.1, §8 (C-2B-21) — `data/facades/list.facade.ts`
// ainda não existe (TASK-0009): falha de módulo esperada.
import { createListFacade } from './list.facade';
import { createClockStub } from '../../../testing/clock.stub';

interface Item {
  readonly id: string;
  readonly state: string;
}

describe('createListFacade (C-2B-21)', () => {
  it('dado setQuery({ filtro: { state: "ADMITIDO" } }) então loader chamado com a query mesclada e page 1; dado setQuery({ page: 2 }) então page 2 mantendo filtro; dado setQuery({ q: "x" }) após page 2 então page volta a 1; items() = value()?.items ?? []', async () => {
    const clock = createClockStub();
    const calls: unknown[] = [];
    const loader = async (query: unknown) => {
      calls.push(query);
      return {
        items: [{ id: '1', state: 'ADMITIDO' }] as readonly Item[],
        total: 1,
        page: 1,
        pageSize: 50,
      };
    };
    const facade = createListFacade<Item>(loader, clock as never);

    expect(facade.items()).toEqual([]);

    await facade.setQuery({ filtro: { state: 'ADMITIDO' } });
    expect(calls.at(-1)).toMatchObject({
      filtro: { state: 'ADMITIDO' },
      page: 1,
    });
    expect(facade.items()).toEqual([{ id: '1', state: 'ADMITIDO' }]);

    await facade.setQuery({ page: 2 });
    expect(calls.at(-1)).toMatchObject({
      filtro: { state: 'ADMITIDO' },
      page: 2,
    });

    await facade.setQuery({ q: 'x' });
    expect(calls.at(-1)).toMatchObject({ q: 'x', page: 1 });
  });

  it('dado facade sem carga quando items() então [] (value() null); dado load() e refresh() então o mesmo loader é reexecutado', async () => {
    const clock = createClockStub();
    let calls = 0;
    const loader = async () => {
      calls += 1;
      return { items: [] as readonly Item[], total: 0, page: 1, pageSize: 50 };
    };
    const facade = createListFacade<Item>(loader, clock as never);
    await facade.load();
    expect(calls).toBe(1);
    await facade.refresh();
    expect(calls).toBe(2);
  });
});
