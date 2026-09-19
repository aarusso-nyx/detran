// R-0014 TASK-0008 (Inspector). `core/offline-document.store.ts` (contrato CTG-0003a §7: "API
// inalterada") — o módulo JÁ implementa a API completa; estes são testes REAIS (não módulo
// ausente). `crypto.subtle`/`sessionStorage` do jsdom/node (M3); `StynxSessionService`
// substituído por `src/testing/stynx-session.stub.ts`.
import { TestBed } from '@angular/core/testing';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { OfflineDocumentStore } from './offline-document.store';
import { createStynxSessionStub } from '../../testing/stynx-session.stub';
import { FIXED_CLOCK_ISO } from '../../testing/http-fixtures';

function setup(sid: string | null) {
  const stynxStub = createStynxSessionStub({ sid });
  TestBed.configureTestingModule({
    providers: [{ provide: StynxSessionService, useValue: stynxStub }],
  });
  return {
    store: TestBed.inject(OfflineDocumentStore),
    stynxStub,
  };
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('OfflineDocumentStore.put()/get() — sem sid', () => {
  it('dado sid ausente quando put então sessionStorage vazio e get devolve null', async () => {
    // C-3a-87
    const { store } = setup(null);
    await store.put('cnh-e', { numero: '123' }, '2027-01-01T00:00:00-04:00');
    expect(sessionStorage.length).toBe(0);
    expect(await store.get('cnh-e')).toBeNull();
  });
});

describe('OfflineDocumentStore.put()/get() — round-trip cifrado', () => {
  it('dado sid sid-a quando put e get antes de validUntil então devolve o documento; o valor bruto em sessionStorage é { iv, payload } e não contém o JSON do documento em claro', async () => {
    // C-3a-88
    const { store } = setup('sid-a');
    const document = { numero: 'CNH-123456', categoria: 'B' };
    await store.put('cnh-e', document, '2027-01-01T00:00:00-04:00');
    const result = await store.get<typeof document>(
      'cnh-e',
      new Date('2026-09-14T12:00:00-04:00'),
    );
    expect(result?.document).toEqual(document);

    const raw = sessionStorage.getItem('portal-offline-document:cnh-e');
    expect(raw).not.toBeNull();
    expect(raw).not.toContain('CNH-123456');
    const envelope = JSON.parse(raw as string) as {
      iv: string;
      payload: string;
    };
    expect(envelope.iv).toEqual(expect.any(String));
    expect(envelope.payload).toEqual(expect.any(String));
    expect(JSON.stringify(envelope)).not.toContain(JSON.stringify(document));
  });
});

describe('OfflineDocumentStore.get() — validade', () => {
  it('dado put com validUntil = now então get devolve null e a entrada é removida (validade retornada, nunca calculada)', async () => {
    // C-3a-89
    const { store } = setup('sid-a');
    await store.put('cnh-e', { numero: '1' }, FIXED_CLOCK_ISO);
    const result = await store.get('cnh-e', new Date(FIXED_CLOCK_ISO));
    expect(result).toBeNull();
    expect(sessionStorage.getItem('portal-offline-document:cnh-e')).toBeNull();
  });
});

describe('OfflineDocumentStore.get() — chave por sid', () => {
  it('dado put com sid sid-a e depois sessão com sid sid-b então get devolve null e a entrada é removida', async () => {
    // C-3a-90
    const { store, stynxStub } = setup('sid-a');
    await store.put('cnh-e', { numero: '1' }, '2027-01-01T00:00:00-04:00');
    stynxStub.state.set({
      ...stynxStub.state(),
      sid: 'sid-b',
    });
    const result = await store.get(
      'cnh-e',
      new Date('2026-09-14T12:00:00-04:00'),
    );
    expect(result).toBeNull();
    expect(sessionStorage.getItem('portal-offline-document:cnh-e')).toBeNull();
  });
});

describe('OfflineDocumentStore.clear()', () => {
  it('dado duas entradas quando clear() então ambas removidas; um novo put após clear com o mesmo sid volta a funcionar (chave rederivada)', async () => {
    // C-3a-91
    const { store } = setup('sid-a');
    await store.put('cnh-e', { numero: '1' }, '2027-01-01T00:00:00-04:00');
    await store.put(
      'crlv-e',
      { placa: 'ABC1D23' },
      '2027-01-01T00:00:00-04:00',
    );
    store.clear();
    expect(sessionStorage.getItem('portal-offline-document:cnh-e')).toBeNull();
    expect(sessionStorage.getItem('portal-offline-document:crlv-e')).toBeNull();

    await store.put('cnh-e', { numero: '2' }, '2027-01-01T00:00:00-04:00');
    const result = await store.get<{ numero: string }>(
      'cnh-e',
      new Date('2026-09-14T12:00:00-04:00'),
    );
    expect(result?.document.numero).toBe('2');
  });
});

describe('OfflineDocumentStore — modo bateria crítica', () => {
  it.todo('OD-P54: modo bateria crítica'); // C-3a-92
});
