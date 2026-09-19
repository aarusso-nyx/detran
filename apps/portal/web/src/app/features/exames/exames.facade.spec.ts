// R-0014 TASK-0017 (Inspector). CTG-0003c §3.5 — `ExamesFacade`; arquivo inteiramente novo (§1)
// — "Cannot find module" até TASK-0018 (esperado, §9). C-3c-39/40 provam a fidelidade do dado
// entregue por `items()` (sem transformação); a renderização (link condicionado a `boardDueOn`)
// é reprovada de novo no DOM por `exam-list.page.spec.ts`. C-3c-41 é análise estática de
// `features/exames/**` e `shared/**` inteiros (§3.5; UC-014 AC-1).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExamesFacade } from './exames.facade'; // §9: "Cannot find module" esperado.
import { EXAM_ID } from '../../../testing/http-fixtures-pair3';

function setup() {
  TestBed.configureTestingModule({
    providers: [ExamesFacade, provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    // ExamesFacade ainda não existe (§9); cast documenta a assinatura assumida (§3.5).
    facade: TestBed.inject(ExamesFacade) as any,
    httpMock: TestBed.inject(HttpTestingController),
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } catch {
    // nada pendente.
  }
});

describe('ExamesFacade — loadList() sem link de junta quando boardDueOn null (§3.5; RN-PEC-105; UC-014 4a) [negativo]', () => {
  it("dado item { legalLabel:'apto com restrições', validUntil:'2031-05-01', boardDueOn:null } então items()[0] preserva o texto e a data tal como recebidos, sem boardDueOn", async () => {
    // C-3c-39
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
    );
    req.flush({
      items: [
        {
          examId: EXAM_ID,
          legalLabel: 'apto com restrições',
          validUntil: '2031-05-01',
          boardDueOn: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    await promise;
    expect(facade.items()[0].legalLabel).toBe('apto com restrições');
    expect(facade.items()[0].validUntil).toBe('2031-05-01');
    expect(facade.items()[0].boardDueOn).toBeNull();
  });
});

describe('ExamesFacade — loadList() com boardDueOn presente (§3.5; UC-014 AC-4)', () => {
  it("dado item { legalLabel:'inapto', boardDueOn:'2026-10-14' } então items()[0].boardDueOn é '2026-10-14' tal como recebido", async () => {
    // C-3c-40
    const { facade, httpMock } = setup();
    const promise = facade.loadList();
    const req = await vi.waitFor(() =>
      httpMock.expectOne((candidate) => candidate.url === '/v1/portal/exams'),
    );
    req.flush({
      items: [
        {
          examId: EXAM_ID,
          legalLabel: 'inapto',
          validUntil: null,
          boardDueOn: '2026-10-14',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    await promise;
    expect(facade.items()[0].boardDueOn).toBe('2026-10-14');
  });
});

async function allFiles(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await allFiles(full)));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

describe('Análise estática — features/exames/** e shared/* sem CONDICIONADO/PENDENTE (§3.5; UC-014 AC-1; JRN-008 1) [negativo]', () => {
  it('dado o código de produção do par 3 então nenhum arquivo contém os literais CONDICIONADO nem PENDENTE', async () => {
    // C-3c-41
    const dir = dirname(fileURLToPath(import.meta.url));
    const examesDir = join(dir, '..', 'exames');
    const sharedDir = join(dir, '..', '..', 'shared');
    const files = [
      ...(await allFiles(examesDir)),
      ...(await allFiles(sharedDir)),
    ];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      expect(source.includes('CONDICIONADO'), file).toBe(false);
      expect(source.includes('PENDENTE'), file).toBe(false);
    }
  });
});
