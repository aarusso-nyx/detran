// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.6, §8 (C-2B-84/85) — `data/shell-search/case-shell-search.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. `CaseShellSearch` substitui
// `PendingShellSearch` do CTG-0002a (§5): busca por protocolo via `CaseClient.listRaitCase`.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CaseShellSearch } from '../data/shell-search/case-shell-search';
import {
  CASE_IDS,
  expectGetList,
  fixtureCase,
} from '../../testing/http-fixtures';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    search: TestBed.inject(CaseShellSearch),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
});

describe('CaseShellSearch.search (C-2B-84)', () => {
  it('dado search("RAIT-2026-000007") quando GET /v1/inf/rait/cases responde os 20 casos então { kind: "case", caseId: CASE_IDS.EM_INSTRUCAO }', async () => {
    const { search, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = search.search('RAIT-2026-000007');
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    expect(await promise).toEqual({
      kind: 'case',
      caseId: CASE_IDS.EM_INSTRUCAO,
    });
  });

  it('dado search("RAIT-9999-000000") quando o servidor responde os 20 casos então { kind: "none" }', async () => {
    const { search, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = search.search('RAIT-9999-000000');
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    expect(await promise).toEqual({ kind: 'none' });
  });

  it('dado search("") então { kind: "none" } sem requisição [negativo]', async () => {
    const { search, httpMock } = setup();
    expect(await search.search('')).toEqual({ kind: 'none' });
    httpMock.expectNone(() => true);
  });

  it('dado search("AM-2026-000001") (número de AIT) quando o servidor responde os 20 casos então { kind: "none" } (OD-R12-030: RaitCase.ait_id é uuid, busca por AIT fora desta CTG)', async () => {
    const { search, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));
    const promise = search.search('AM-2026-000001');
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    expect(await promise).toEqual({ kind: 'none' });
  });
});
