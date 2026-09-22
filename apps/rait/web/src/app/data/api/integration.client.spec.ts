// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…12) —
// `data/api/integration.client.ts` ainda não existe (TASK-0009): falha de módulo esperada.
// `IntegrationClient` cobre 1 par list/get (2 métodos) e 2 comandos.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { IntegrationClient } from './integration.client';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import {
  expectGetList,
  expectGetOne,
  etagFor,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(IntegrationClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('IntegrationClient — leituras (C-2B-10/11)', () => {
  it('dado listRaitReconciliation() quando o servidor responde [] então exatamente uma requisição GET /v1/inf/rait/reconciliations sem query e ListPage vazia', async () => {
    const { client, httpMock } = setup();
    const promise = client.listRaitReconciliation();
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/reconciliations', []),
    );
    const result = await promise;
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('dado getRaitReconciliation(id) quando o servidor responde 200 + ETag etagFor(1) então GET /v1/inf/rait/reconciliations/id e etagOf("reconciliations", id) === \'"1"\'', async () => {
    const { client, httpMock } = setup();
    const id = FIXED_ENTITY_ID;
    const promise = client.getRaitReconciliation(id);
    await vi.waitFor(() =>
      expectGetOne(
        httpMock,
        `/v1/inf/rait/reconciliations/${id}`,
        { id },
        etagFor(1),
      ),
    );
    await promise;
    expect(client.etagOf('reconciliations', id)).toBe('"1"');
  });
});

interface CommandOp {
  readonly method: keyof IntegrationClient;
  readonly m8: string;
  readonly call: (client: IntegrationClient) => Promise<unknown>;
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'retry',
    m8: 'rait-integration:retry',
    call: (c) => c.retry(FIXED_ENTITY_ID, {} as never, null),
  },
  {
    method: 'reconcile',
    m8: 'rait-integration:reconcile',
    call: (c) => c.reconcile(FIXED_ENTITY_ID, {} as never, null),
  },
];

describe('IntegrationClient — comandos (C-2B-12, M8)', () => {
  it('dado cada método de comando da tabela §3.5 do cliente quando chamado com argumentos mínimos então rejeita com RaitCommandUnavailableError cujo command === M8 da linha e nenhuma requisição HTTP é feita', async () => {
    const { client, httpMock } = setup();
    for (const op of COMMAND_OPS) {
      await expect(op.call(client)).rejects.toBeInstanceOf(
        RaitCommandUnavailableError,
      );
      try {
        await op.call(client);
      } catch (error) {
        expect((error as RaitCommandUnavailableError).command).toBe(op.m8);
      }
    }
    httpMock.expectNone(() => true);
  });

  for (const op of COMMAND_OPS) {
    it.todo(
      `${String(op.method)} — comportamento real (R-0007 CTG-0004; OD-R12-027)`,
    );
  }
});
