// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.2, §8 (C-2B-06/07) — `data/api/etag-store.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. Unidade direta de `EtagStore`,
// complementar ao exercício via `RaitHttp` de `rait-http.spec.ts`.
import { TestBed } from '@angular/core/testing';
import { EtagStore } from './etag-store';

function setup(): EtagStore {
  TestBed.configureTestingModule({});
  return TestBed.inject(EtagStore);
}

describe('EtagStore (C-2B-06/07)', () => {
  it('dado set("cases", id, \'"1"\') quando get("cases", id) então \'"1"\' (guardado por id, nunca inventado)', () => {
    const store = setup();
    store.set('cases', 'id-1', '"1"');
    expect(store.get('cases', 'id-1')).toBe('"1"');
  });

  it('dado nenhuma escrita para o id quando get então null [negativo]', () => {
    const store = setup();
    expect(store.get('cases', 'id-desconhecido')).toBeNull();
  });

  it('dado set("cases", id, null) quando get então null (apaga a entrada)', () => {
    const store = setup();
    store.set('cases', 'id-1', '"1"');
    store.set('cases', 'id-1', null);
    expect(store.get('cases', 'id-1')).toBeNull();
  });

  it('dado entradas em duas coleções quando clear("cases") então só "cases" é apagada [negativo]', () => {
    const store = setup();
    store.set('cases', 'id-1', '"1"');
    store.set('sessions', 'id-2', '"1"');
    store.clear('cases');
    expect(store.get('cases', 'id-1')).toBeNull();
    expect(store.get('sessions', 'id-2')).toBe('"1"');
  });

  it('dado entradas em várias coleções quando clear() sem argumento então todas apagadas', () => {
    const store = setup();
    store.set('cases', 'id-1', '"1"');
    store.set('sessions', 'id-2', '"1"');
    store.clear();
    expect(store.get('cases', 'id-1')).toBeNull();
    expect(store.get('sessions', 'id-2')).toBeNull();
  });
});
