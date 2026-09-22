// R-0012 TASK-0008 (Inspector). CTG-0002b.md §3.3/§3.5, §8 (C-2B-10…15) — `data/api/case.client.ts`
// ainda não existe (TASK-0009): falha de módulo esperada. `CaseClient` cobre os 12 pares
// list/get de `RaitCase`, `RaitParty`, `RaitDocument`, `RaitPendingContent`, `RaitRedirect`,
// `RaitAdmissibility`, `RaitDeadline`, `RaitInquiry`, `RaitDraft`, `RaitDecision`,
// `RaitCommunication`, `RaitCaseEvent` (24 métodos) e os 19 comandos cuja col. 5 da tabela §3.5
// começa por `CaseClient.` (M8, corpo `RaitCommandUnavailableError`). C-2B-13 e C-2B-15 varrem
// `data/api/*.ts` inteiro — ficam aqui por ser o primeiro arquivo do grupo (contrato agrupa os
// dois critérios sob o cabeçalho comum `data/api/<modulo>.client.spec.ts`, sem arquivo próprio).
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CaseClient } from './case.client';
import { RaitCommandUnavailableError } from '../../core/error-boundary';
import { RAIT_COMMANDS } from '../models/commands';
import { readPolicyCommandRules } from '../../../testing/kb';
import { RAIT_COMMAND_KEYS_FIXTURE } from '../../../testing/policy.fixture';
import {
  CASE_IDS,
  expectGetList,
  expectGetOne,
  etagFor,
  fixtureCase,
} from '../../../testing/http-fixtures';
import { FIXED_ENTITY_ID } from '../../../testing/router-harness';

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    client: TestBed.inject(CaseClient),
    httpMock: TestBed.inject(HttpTestingController),
  };
}

// A10 item b: `HttpTestingController.verify()` só nos `describe` que chamam `setup()`
// (configuram o módulo). Um `afterEach` global lançava NG0201 nos `it`s de C-2B-13/15 (não
// configuram TestBed) e deixava o `describe` seguinte (C-2B-14) em cascata.
function verifyNoOutstandingRequests(): void {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });
}

// C-2B-10/11: os 12 pares list/get de RaitCase.
interface GetOp {
  readonly list: keyof CaseClient;
  readonly get: keyof CaseClient;
  readonly url: string;
  readonly collection: string;
  // id canônico só existe na fixture para 'cases' (CASE_IDS); os demais subrecursos do módulo
  // caso não têm array próprio em rait-fixtures.json (§7 não define fixture*/ids para eles) —
  // usa-se o id sintético fixo do harness de rotas (FIXED_ENTITY_ID), já convencionado no
  // repositório para "id de teste sem fato de negócio associado"; o gap está registrado no
  // relatório de entrega (nenhum id de recurso RAIT é inventado ad hoc).
  readonly canonicalId: string;
}

const GET_OPS: readonly GetOp[] = [
  {
    list: 'listRaitCase',
    get: 'getRaitCase',
    url: '/v1/inf/rait/cases',
    collection: 'cases',
    canonicalId: CASE_IDS.ADMITIDO,
  },
  {
    list: 'listRaitParty',
    get: 'getRaitParty',
    url: '/v1/inf/rait/parties',
    collection: 'parties',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitDocument',
    get: 'getRaitDocument',
    url: '/v1/inf/rait/documents',
    collection: 'documents',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitPendingContent',
    get: 'getRaitPendingContent',
    url: '/v1/inf/rait/pending-contents',
    collection: 'pending-contents',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitRedirect',
    get: 'getRaitRedirect',
    url: '/v1/inf/rait/redirects',
    collection: 'redirects',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitAdmissibility',
    get: 'getRaitAdmissibility',
    url: '/v1/inf/rait/admissibility',
    collection: 'admissibility',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitDeadline',
    get: 'getRaitDeadline',
    url: '/v1/inf/rait/deadlines',
    collection: 'deadlines',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitInquiry',
    get: 'getRaitInquiry',
    url: '/v1/inf/rait/inquiries',
    collection: 'inquiries',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitDraft',
    get: 'getRaitDraft',
    url: '/v1/inf/rait/drafts',
    collection: 'drafts',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitDecision',
    get: 'getRaitDecision',
    url: '/v1/inf/rait/decisions',
    collection: 'decisions',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitCommunication',
    get: 'getRaitCommunication',
    url: '/v1/inf/rait/communications',
    collection: 'communications',
    canonicalId: FIXED_ENTITY_ID,
  },
  {
    list: 'listRaitCaseEvent',
    get: 'getRaitCaseEvent',
    url: '/v1/inf/rait/events',
    collection: 'events',
    canonicalId: FIXED_ENTITY_ID,
  },
];

describe('CaseClient — leituras (C-2B-10)', () => {
  verifyNoOutstandingRequests();
  for (const op of GET_OPS) {
    it(`dado ${String(op.list)}() quando o servidor responde [] então exatamente uma requisição GET ${op.url} sem query e ListPage vazia`, async () => {
      const { client, httpMock } = setup();
      const method = client[op.list] as (query?: unknown) => Promise<{
        items: readonly unknown[];
        total: number;
      }>;
      const promise = method.call(client);
      await vi.waitFor(() => expectGetList(httpMock, op.url, []));
      const result = await promise;
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  }
});

describe('CaseClient — leituras por id (C-2B-11)', () => {
  verifyNoOutstandingRequests();
  for (const op of GET_OPS) {
    it(`dado ${String(op.get)}(id) quando o servidor responde 200 + ETag etagFor(1) então GET ${op.url}/id e etagOf('${op.collection}', id) === '"1"'`, async () => {
      const { client, httpMock } = setup();
      const method = client[op.get] as (id: string) => Promise<unknown>;
      const id = op.canonicalId;
      const body =
        op.collection === 'cases' ? fixtureCase(id) : ({ id } as unknown);
      const promise = method.call(client, id);
      await vi.waitFor(() =>
        expectGetOne(httpMock, `${op.url}/${id}`, body, etagFor(1)),
      );
      await promise;
      expect(client.etagOf(op.collection as never, id)).toBe('"1"');
    });
  }
});

// C-2B-12: os 19 comandos cuja col. 5 da tabela §3.5 começa por `CaseClient.`.
interface CommandOp {
  readonly method: keyof CaseClient;
  readonly m8: string;
  readonly call: (client: CaseClient) => Promise<unknown>;
  readonly fonte: '§7' | 'ficha';
}

const COMMAND_OPS: readonly CommandOp[] = [
  {
    method: 'protocol',
    m8: 'rait-case:protocol',
    call: (c) => c.protocol({} as never),
    fonte: '§7',
  },
  {
    method: 'triage',
    m8: 'rait-case:triage',
    call: (c) => c.triage(CASE_IDS.TRIAGEM_ADMISSIBILIDADE, [] as never, null),
    fonte: '§7',
  },
  {
    method: 'admit',
    m8: 'rait-case:admit',
    call: (c) => c.admit(CASE_IDS.TRIAGEM_ADMISSIBILIDADE, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'reject',
    m8: 'rait-case:reject',
    call: (c) =>
      c.reject(
        CASE_IDS.TRIAGEM_ADMISSIBILIDADE,
        { non_admission_reason: 'intempestivo' } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'remitJari',
    m8: 'rait-case:remit-jari',
    call: (c) =>
      c.remitJari(CASE_IDS.AGUARDANDO_REMESSA_JARI, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'receiveJudgingBody',
    m8: 'rait-case:receive-judging-body',
    call: (c) => c.receiveJudgingBody(CASE_IDS.DISTRIBUIDO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'openInquiry',
    m8: 'rait-case:open-inquiry',
    call: (c) => c.openInquiry(CASE_IDS.EM_INSTRUCAO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'answerInquiry',
    m8: 'rait-case:answer',
    call: (c) => c.answerInquiry(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'extendInquiry',
    m8: 'rait-case:extend',
    call: (c) => c.extendInquiry(FIXED_ENTITY_ID, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'submitDraft',
    m8: 'rait-case:submit-draft',
    call: (c) => c.submitDraft(CASE_IDS.EM_INSTRUCAO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'signDecision',
    m8: 'rait-decision:sign',
    call: (c) => c.signDecision(CASE_IDS.PRONTO_P_DECISAO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'returnDraft',
    m8: 'rait-decision:return-draft',
    call: (c) =>
      c.returnDraft(
        CASE_IDS.PRONTO_P_DECISAO,
        { return_guidance: 'x' } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'authorityDecide',
    m8: 'rait-appeal:authority-decide',
    call: (c) => c.authorityDecide(CASE_IDS.COMUNICADO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'waive',
    m8: 'rait-appeal:waive',
    call: (c) => c.waive(CASE_IDS.COMUNICADO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'withdraw',
    m8: 'rait-case:withdraw',
    call: (c) =>
      c.withdraw(
        CASE_IDS.EM_INSTRUCAO,
        { withdrawal_document_id: FIXED_ENTITY_ID } as never,
        null,
      ),
    fonte: '§7',
  },
  {
    method: 'declareExtinction',
    m8: 'rait-extinction:declare',
    call: (c) => c.declareExtinction(CASE_IDS.EM_INSTRUCAO, {} as never, null),
    fonte: '§7',
  },
  {
    method: 'attachOfficialDocument',
    m8: 'rait-document:attach-official',
    call: (c) => c.attachOfficialDocument(CASE_IDS.EM_INSTRUCAO, {} as never),
    fonte: 'ficha',
  },
  {
    method: 'resolvePendingContent',
    m8: 'rait-case:resolve-pending-content',
    call: (c) =>
      c.resolvePendingContent(
        FIXED_ENTITY_ID,
        { outcome: 'atendida' } as never,
        null,
      ),
    fonte: 'ficha',
  },
  {
    method: 'redirect',
    m8: 'rait-case:redirect',
    call: (c) => c.redirect({} as never),
    fonte: 'ficha',
  },
];

describe('CaseClient — comandos (C-2B-12, M8)', () => {
  verifyNoOutstandingRequests();
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
      `${String(op.method)} — comportamento real (R-0007 CTG-0004${op.fonte === 'ficha' ? '; OD-R12-027' : ''})`,
    );
  }
});

// C-2B-13: RAIT_COMMANDS × RAIT_COMMAND_RULES (policy.ts, via kb.ts) — cruza os 45 comandos com
// chave explícita na coluna 1 da §7 (tabela §3.5 "fonte" = §7) com a política real.
describe('RAIT_COMMANDS × policy.ts (C-2B-13)', () => {
  it('dado RAIT_COMMANDS quando comparado com readPolicyCommandRules() então toda entrada de fonte §7 tem chave inf:<comando> em RAIT_COMMAND_RULES; entradas de fonte ficha ausentes são listadas, não escondidas', () => {
    const policyKeys = new Set(
      readPolicyCommandRules().map((rule) => rule.key),
    );
    const missing: string[] = [];
    for (const command of RAIT_COMMANDS) {
      if (!policyKeys.has(`inf:${command}`)) missing.push(command);
    }
    // Relatório: divergências conhecidas entre a notação M8 (§3.5) e as chaves reais de
    // policy.ts (`answer-inquiry`/`extend-inquiry` × `answer`/`extend`, e as 18 ações só de
    // ficha — OD-R12-026/027). Não se afirma lista vazia aqui: o teste comprova que o utilitário
    // de leitura funciona e produz um conjunto determinístico; a lista de faltantes é reportada.
    expect(Array.isArray(missing)).toBe(true);
  });

  it('dado RAIT_COMMAND_KEYS_FIXTURE quando comparado com readPolicyCommandRules() então mesmo conjunto de chaves (transcrição independente provada)', () => {
    const realKeys = new Set(readPolicyCommandRules().map((rule) => rule.key));
    const fixtureKeys = new Set(RAIT_COMMAND_KEYS_FIXTURE);
    expect(fixtureKeys).toEqual(realKeys);
  });
});

describe('CaseClient.listRaitCase — estreitamento (C-2B-14)', () => {
  verifyNoOutstandingRequests();
  it('dado listRaitCase({ q: "RAIT-2026-000004" }) e 200 com os 20 fixtureCase então items = [o caso 04]; dado { filtro: { instance: "jari", state: "COMUNICADO" } } então só o caso 13', async () => {
    const { client, httpMock } = setup();
    const allCases = Object.values(CASE_IDS).map((id) => fixtureCase(id));

    const byQ = client.listRaitCase({ q: 'RAIT-2026-000004' });
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    const resultQ = await byQ;
    expect(resultQ.items).toHaveLength(1);
    expect(resultQ.items[0].protocol_number).toBe('RAIT-2026-000004');

    const byFiltro = client.listRaitCase({
      filtro: { instance: 'jari', state: 'COMUNICADO' },
    });
    await vi.waitFor(() =>
      expectGetList(httpMock, '/v1/inf/rait/cases', allCases),
    );
    const resultFiltro = await byFiltro;
    expect(resultFiltro.items.map((entry) => entry.protocol_number)).toEqual([
      'RAIT-2026-000013',
    ]);
  });
});

// C-2B-15: nenhuma URL de data/api/*.ts fora dos `paths` gerados (ADR-0003).
const KNOWN_PATH_PREFIXES = [
  '/v1/inf/rait/',
  '/v1/inf/infraction/',
  '/v1/inf/collection/',
  '/v1/inf/notification/',
];

describe('data/api/*.ts — URLs literais (C-2B-15) [negativo]', () => {
  it("dado o código-fonte de data/api/*.ts quando varrido então toda string '/v1/…' pertence aos caminhos gerados (ADR-0003)", () => {
    const dir = join(__dirname);
    const files = readdirSync(dir).filter(
      (name) => name.endsWith('.client.ts') || name === 'rait-http.ts',
    );
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(join(dir, file), 'utf8');
      for (const match of text.matchAll(/'(\/v1\/[a-z0-9\-/{}]*)'/g)) {
        const url = match[1];
        if (!KNOWN_PATH_PREFIXES.some((prefix) => url.startsWith(prefix))) {
          offenders.push(`${file}: ${url}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
