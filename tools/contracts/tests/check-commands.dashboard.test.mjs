// Testes de `tools/contracts/check-commands.mjs` para o catálogo `DASH.` por prefixo, as
// raízes `dashboard/*` e a correspondência rota ⇔ operação do `BP-DASH-MONITOR-001` (TASK-0008,
// R-0011, CTG-0002 §3, plan.md M24). `check-commands.mjs` já existe (WP-T3); este arquivo é
// escrito **antes** de TASK-0009 (Engineer) fechar as três lacunas do gate para o DASHBOARD:
//
//   1. raiz  — `CONTROLLER_ROOTS` não lista `backend/domains/dashboard/monitor/src/handwritten`;
//   2. app   — o filtro de `backend/app/src` (§3.2 regra 4) só aceita `teat-*`/`portal-*`, o que
//              deixa `dashboard-stream.controller.ts` fora da varredura;
//   3. catálogo — nem `ERROR_CATALOG_PATHS` nem `parseSingleCatalogByPrefix` conhecem o prefixo
//              `DASH` (`docs/framework/arch/dashboard-error-catalog.md`).
//
// Por isso os testes marcados "vermelho hoje" falham até TASK-0009 estender o gate — é o
// resultado esperado (docs/meta/agents/inspector-tests.md: um teste que falha revela um defeito
// ou uma especificação errada, nunca vira `skip`). Nunca tocar em `check-commands.mjs`.
//
// Fixtures sintéticas mínimas em tools/contracts/tests/fixtures/check-commands-dashboard/ (regra
// 2 do prompt: nunca copiar o repositório real). Cada caso usado para as lacunas 1/2 monta uma
// raiz falsa (`fakeRoot`) com a MESMA estrutura de caminhos relativos do repositório real e roda
// a CLI com `cwd: fakeRoot` e sem `--controllers` (para que `CONTROLLER_ROOTS`/o filtro de
// `backend/app/src`, resolvidos contra `process.cwd()` dentro do gate, sejam exercitados de
// verdade — o mesmo truque de `appSrcCliScenario`/`C-5-14` em check-commands.test.mjs, que este
// arquivo não importa nem modifica). Os casos da lacuna 3 (catálogo) passam `--controllers`
// explícito para isolar só o comportamento do catálogo.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import test from 'node:test';
import {
  CONTROLLER_ROOTS,
  checkCommands,
  collectOperations,
  scanControllers,
} from '../check-commands.mjs';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const gate = join(root, 'tools/contracts/check-commands.mjs');
const fixturesDir = join(
  root,
  'tools/contracts/tests/fixtures/check-commands-dashboard',
);

async function readFixture(relPath) {
  return readFile(join(fixturesDir, relPath), 'utf8');
}

async function writeRel(fakeRoot, relPath, content) {
  const target = join(fakeRoot, relPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

// Raiz falsa mínima: só o blueprint de fixture (`BP-DASH-DEMO-001`), para que
// `info['x-blueprint']` resolva sem tocar `docs/framework/blueprints` reais.
async function baseFakeRoot() {
  const fakeRoot = await mkdtemp(
    join(tmpdir(), 'detran-check-commands-dashboard-'),
  );
  await writeRel(
    fakeRoot,
    'docs/framework/blueprints/BP-DASH-DEMO-001.json',
    await readFixture('blueprints/BP-DASH-DEMO-001.json'),
  );
  return fakeRoot;
}

async function cleanup(fakeRoot) {
  await rm(fakeRoot, { recursive: true, force: true });
}

async function runInCwd(cwd, args) {
  try {
    const result = await exec(process.execPath, [gate, ...args], { cwd });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

// Contrato mínimo de uma operação `dashboardAlertAck`-shaped (forma real de
// BP-DASH-MONITOR-001.commands.openapi.json, transcrita — nunca copiada por inteiro).
function dashboardContract({
  path = '/v1/dashboard/alerts/{id}/ack',
  method = 'post',
  operationId = 'dashboardAlertAck',
  code = 'DASH.LAYER_N3_NEVER',
  includeErrorResponse = true,
  includePaths = true,
} = {}) {
  const operation = {
    operationId,
    responses: { 200: { description: 'ok (fixture).' } },
  };
  if (includeErrorResponse) {
    operation.responses['403'] = {
      description: 'erro (fixture).',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: { code: { type: 'string', enum: [code] } },
          },
        },
      },
    };
  }
  return `${JSON.stringify(
    {
      openapi: '3.1.0',
      info: {
        title: 'DASHBOARD — fixture do Inspector (TASK-0008, R-0011)',
        version: '1.0.0',
        'x-blueprint': 'BP-DASH-DEMO-001',
        'x-commands': true,
      },
      paths: includePaths ? { [path]: { [method]: operation } } : {},
      components: { schemas: {} },
    },
    null,
    2,
  )}\n`;
}

// Controlador manuscrito mínimo com uma rota; decoradores `@nestjs/common` puros (o gate só lê
// `@Controller`/`@Get`/`@Post`/`@Patch`, nunca `@Resource`/`@Action`), mesma técnica de
// `demo-items.controller.ts`.
function dashboardController({
  className = 'DashboardAckFixtureController',
  base = 'v1/dashboard/alerts',
  method = 'Post',
  sub = ':id/ack',
  methodName = 'ack',
} = {}) {
  const args = sub ? `'${sub}'` : '';
  return `import { Controller, ${method} } from '@nestjs/common';

@Controller('${base}')
export class ${className} {
  @${method}(${args})
  ${methodName}(): { ok: boolean } {
    return { ok: true };
  }
}
`;
}

// Controlador sem nenhum método decorado com rota — contribui zero rotas ao gate,
// independentemente de a pasta que o contém ser ou não varrida (usado para provar que
// `handwritten/cycle/` e `src/controllers/` nunca aportam rota nenhuma).
function emptyDashboardController({
  className = 'DashboardEmptyFixtureController',
  base = 'v1/dashboard/empty',
} = {}) {
  return `import { Controller } from '@nestjs/common';

@Controller('${base}')
export class ${className} {}
`;
}

// ---------------------------------------------------------------------------
// (a) Catálogo por prefixo — lacuna 3 (`ERROR_CATALOG_PATHS`/`ERROR_CATALOG_PREFIXES` não
// conhecem `dashboard-error-catalog.md` → prefixo `DASH`). `--controllers` explícito isola o
// caso da lacuna 1 (raiz); `--catalog` fica de fora para exercitar a resolução multi-arquivo
// real (`parseErrorCatalogsByPrefix`), a única que pode um dia aprender o prefixo `DASH` — o
// seam de arquivo único (`--catalog`, `parseSingleCatalogByPrefix`) tem `['TEAT','PORTAL','BOAT']`
// hard-coded e nunca reconhecerá `DASH`, mesmo depois de TASK-0009.
// ---------------------------------------------------------------------------

test('dado contrato dashboard cujo 4xx cita DASH.LAYER_N3_NEVER (código real do catálogo, presente em dashboard-error-catalog.md) quando checkCommands (catálogos padrão) então sem unknown-error-code (vermelho hoje: lacuna 3 — DASH ausente de ERROR_CATALOG_PATHS/ERROR_CATALOG_PREFIXES)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ code: 'DASH.LAYER_N3_NEVER' }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    await writeRel(
      fakeRoot,
      'docs/framework/arch/dashboard-error-catalog.md',
      '`DASH.LAYER_N3_NEVER`\n',
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--controllers',
      join(
        fakeRoot,
        'backend/domains/dashboard/monitor/src/handwritten/surface',
      ),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    const unknownLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('unknown-error-code'));
    assert.equal(
      unknownLines.length,
      0,
      `DASH.LAYER_N3_NEVER está no catálogo dashboard-error-catalog.md da fixture mas o gate ainda não o lê (lacuna 3): ${result.stderr}`,
    );
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado contrato dashboard cujo 4xx cita DASH.NAO_EXISTE (código fora do catálogo) quando checkCommands então exatamente um unknown-error-code citando o código e o prefixo DASH (verde hoje — já é o comportamento correto antes e depois de TASK-0009)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ code: 'DASH.NAO_EXISTE' }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    await writeRel(
      fakeRoot,
      'docs/framework/arch/dashboard-error-catalog.md',
      '`DASH.LAYER_N3_NEVER`\n',
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--controllers',
      join(
        fakeRoot,
        'backend/domains/dashboard/monitor/src/handwritten/surface',
      ),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    const unknownLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('unknown-error-code'));
    assert.equal(result.status, 1);
    assert.equal(unknownLines.length, 1, result.stderr);
    assert.match(unknownLines[0], /DASH\.NAO_EXISTE/);
    assert.match(unknownLines[0], /prefixo DASH/);
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado código PORTAL.DEMO_PRESERVED_CODE num contrato dashboard (presente só em portal-error-catalog.md, ausente de dashboard-error-catalog.md) quando checkCommands então continua julgado pelo catálogo PORTAL — comportamento atual preservado (verde hoje e depois de TASK-0009)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ code: 'PORTAL.DEMO_PRESERVED_CODE' }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    await writeRel(
      fakeRoot,
      'docs/framework/arch/portal-error-catalog.md',
      '`PORTAL.DEMO_PRESERVED_CODE`\n',
    );
    // dashboard-error-catalog.md deliberadamente ausente: prova que o código PORTAL não é
    // avaliado contra um catálogo dashboard (que nem existe aqui).
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--controllers',
      join(
        fakeRoot,
        'backend/domains/dashboard/monitor/src/handwritten/surface',
      ),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await cleanup(fakeRoot);
  }
});

// ---------------------------------------------------------------------------
// (b) Raízes `dashboard/*` — lacunas 1 (raiz) e 2 (filtro do app). Nenhum destes testes passa
// `--controllers`: a CLI usa `CONTROLLER_ROOTS` (lacuna 1) e o filtro de `backend/app/src`
// (lacuna 2), ambos resolvidos contra `process.cwd()` = `fakeRoot` dentro do gate — o mesmo
// truque de `appSrcCliScenario` em check-commands.test.mjs (arquivo não importado nem alterado).
// Todos os contratos aqui são só-200 (`includeErrorResponse: false`) para isolar as lacunas 1/2
// da lacuna 3 (catálogo).
// ---------------------------------------------------------------------------

test('dado POST v1/dashboard/alerts/:id/ack em backend/domains/dashboard/monitor/src/handwritten/surface/ (+ handwritten/cycle/ e src/controllers/ vazios, sem rota) quando checkCommands (raízes padrão, sem --controllers) então ok=true (vermelho hoje: lacuna 1 — CONTROLLER_ROOTS não lista backend/domains/dashboard/monitor/src/handwritten)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    // ruído: nenhum dos dois contribui rota (nem @Get/@Post), mesmo depois da raiz ser ligada.
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/cycle/timer.controller.ts',
      emptyDashboardController({
        className: 'DashboardTimerCycleFixtureController',
        base: 'v1/dashboard/timers',
      }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/controllers/generated-alert.controller.ts',
      emptyDashboardController({
        className: 'GeneratedAlertFixtureController',
        base: 'v1/dashboard/alerts',
      }),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    assert.equal(
      result.status,
      0,
      `raiz backend/domains/dashboard/monitor/src/handwritten ausente de CONTROLLER_ROOTS (lacuna 1): ${result.stderr}`,
    );
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado a mesma rota POST v1/dashboard/alerts/:id/ack sem operação correspondente no contrato quando checkCommands (raízes padrão) então exatamente um missing-operation (vermelho hoje: lacuna 1 — a raiz nunca é varrida, então a rota nunca é reportada)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false, includePaths: false }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    const missingOperationLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('missing-operation'));
    assert.equal(
      missingOperationLines.length,
      1,
      `raiz ausente de CONTROLLER_ROOTS (lacuna 1) impede a detecção: ${result.stderr}`,
    );
    assert.match(
      missingOperationLines[0],
      /v1\/dashboard\/alerts\/\{id\}\/ack/,
    );
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado operação dashboardAlertAck no contrato sem controlador nenhum em lugar algum quando checkCommands então exatamente um missing-route (verde hoje — independe das três lacunas: nenhum controlador existe em nenhuma raiz)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false }),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    const missingRouteLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('missing-route'));
    assert.equal(missingRouteLines.length, 1, result.stderr);
    assert.match(missingRouteLines[0], /dashboardAlertAck/);
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado GET v1/dashboard/stream em backend/app/src/dashboard-stream.controller.ts quando checkCommands (raízes padrão, sem --controllers) então ok=true (vermelho hoje: lacuna 2 — o filtro de backend/app/src só aceita teat-*/portal-*)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({
        path: '/v1/dashboard/stream',
        method: 'get',
        operationId: 'dashboardStreamGet',
        includeErrorResponse: false,
      }),
    );
    await writeRel(
      fakeRoot,
      'backend/app/src/dashboard-stream.controller.ts',
      dashboardController({
        className: 'DashboardStreamFixtureController',
        base: 'v1/dashboard/stream',
        method: 'Get',
        sub: '',
        methodName: 'stream',
      }),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    assert.equal(
      result.status,
      0,
      `filtro de backend/app/src (teat-*/portal-*) ainda exclui dashboard-stream.controller.ts (lacuna 2): ${result.stderr}`,
    );
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado a mesma rota de stream sem operação correspondente no contrato quando checkCommands (raízes padrão) então exatamente um missing-operation (vermelho hoje: lacuna 2 — o arquivo é filtrado antes de ser varrido, então a rota nunca é reportada)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false, includePaths: false }),
    );
    await writeRel(
      fakeRoot,
      'backend/app/src/dashboard-stream.controller.ts',
      dashboardController({
        className: 'DashboardStreamFixtureController',
        base: 'v1/dashboard/stream',
        method: 'Get',
        sub: '',
        methodName: 'stream',
      }),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    const missingOperationLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('missing-operation'));
    assert.equal(
      missingOperationLines.length,
      1,
      `filtro de backend/app/src (lacuna 2) impede a detecção: ${result.stderr}`,
    );
    assert.match(missingOperationLines[0], /v1\/dashboard\/stream/);
  } finally {
    await cleanup(fakeRoot);
  }
});

test('dado backend/app/src/other-thing.controller.ts (sem prefixo teat-/portal-/dashboard-) quando checkCommands (raízes padrão) então continua ignorado, sem nenhum problema (verde hoje e depois de TASK-0009 — comportamento do filtro do app não muda para arquivos sem prefixo reconhecido)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false, includePaths: false }),
    );
    await writeRel(
      fakeRoot,
      'backend/app/src/other-thing.controller.ts',
      dashboardController({
        className: 'OtherThingFixtureController',
        base: 'v1/dashboard/other-thing',
        method: 'Get',
        sub: '',
        methodName: 'other',
      }),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'commands contracts: OK (0 operations)\n');
  } finally {
    await cleanup(fakeRoot);
  }
});

// ---------------------------------------------------------------------------
// (d) CLI — mesma fixture válida de (b) (raiz dashboard/monitor com POST alerts/:id/ack),
// checando a mensagem de sucesso exata da CLI (vermelho hoje: lacuna 1).
// ---------------------------------------------------------------------------

test('dado node tools/contracts/check-commands.mjs na fixture (b) válida (POST v1/dashboard/alerts/:id/ack em handwritten/surface/) então exit 0 e "commands contracts: OK (1 operations)" (vermelho hoje: lacuna 1 — raiz ausente de CONTROLLER_ROOTS)', async () => {
  const fakeRoot = await baseFakeRoot();
  try {
    await writeRel(
      fakeRoot,
      'docs/framework/contracts/BP-DASH-DEMO-001.commands.openapi.json',
      dashboardContract({ includeErrorResponse: false }),
    );
    await writeRel(
      fakeRoot,
      'backend/domains/dashboard/monitor/src/handwritten/surface/alerts.controller.ts',
      dashboardController(),
    );
    const result = await runInCwd(fakeRoot, [
      '--contracts-dir',
      join(fakeRoot, 'docs/framework/contracts'),
      '--blueprints',
      join(fakeRoot, 'docs/framework/blueprints'),
    ]);
    assert.equal(
      result.status,
      0,
      `raiz ausente de CONTROLLER_ROOTS (lacuna 1): ${result.stderr}`,
    );
    assert.equal(result.stdout, 'commands contracts: OK (1 operations)\n');
  } finally {
    await cleanup(fakeRoot);
  }
});

// ---------------------------------------------------------------------------
// (c) Bidirecionalidade sobre o repositório real (sem fixtures): `checkCommands()` com todos os
// parâmetros padrão, exatamente como `pnpm contracts:check` roda. As 43 rotas abaixo são a
// transcrição literal de CTG-0002 §3.1…§3.8 (sete controllers manuscritos de
// backend/domains/dashboard/monitor/src/handwritten/surface/ + o stream de
// backend/app/src/dashboard-stream.controller.ts), cruzada com
// docs/framework/contracts/BP-DASH-MONITOR-001.commands.openapi.json (43 operationId únicos,
// confirmados por leitura). Vermelho hoje: lacunas 1 e 2 (a raiz dashboard/monitor nunca é
// varrida e o stream é filtrado), então nenhuma das 43 rotas aparece no lado "varrido" — e a
// lacuna 3 também aparece aqui (os DASH.* citados pelo contrato ficam unknown-error-code).
// ---------------------------------------------------------------------------

const CTG_0002_ROUTES = [
  'GET /v1/dashboard/alerts',
  'GET /v1/dashboard/alerts/{id}',
  'POST /v1/dashboard/alerts/{id}/ack',
  'POST /v1/dashboard/alerts/{id}/treating',
  'POST /v1/dashboard/alerts/{id}/close',
  'POST /v1/dashboard/alerts/{id}/root-cause',
  'GET /v1/dashboard/alerts/{id}/incident',
  'GET /v1/dashboard/duties',
  'GET /v1/dashboard/duties/{id}/cycles',
  'GET /v1/dashboard/duties/{id}/cycles/{period}',
  'POST /v1/dashboard/duties/{id}/cycles/{period}/start',
  'POST /v1/dashboard/duties/{id}/cycles/{period}/prepare',
  'POST /v1/dashboard/duties/{id}/cycles/{period}/submit',
  'POST /v1/dashboard/duties/{id}/cycles/{period}/prove',
  'POST /v1/dashboard/duties/{id}/cycles/{period}/archive',
  'GET /v1/dashboard/indicators',
  'GET /v1/dashboard/indicators/{code}',
  'GET /v1/dashboard/indicator-configs',
  'GET /v1/dashboard/indicator-configs/{id}',
  'PATCH /v1/dashboard/indicator-configs/{id}',
  'POST /v1/dashboard/indicator-configs/{id}/publish',
  'GET /v1/dashboard/bi-panels',
  'GET /v1/dashboard/bi-panels/{id}',
  'POST /v1/dashboard/bi-panels',
  'PATCH /v1/dashboard/bi-panels/{id}',
  'POST /v1/dashboard/bi-panels/{id}/publish',
  'GET /v1/dashboard/generated-reports',
  'GET /v1/dashboard/generated-reports/{id}',
  'POST /v1/dashboard/generated-reports',
  'POST /v1/dashboard/generated-reports/{id}/complete',
  'POST /v1/dashboard/generated-reports/{id}/fail',
  'GET /v1/dashboard/sources',
  'GET /v1/dashboard/sources/{id}',
  'POST /v1/dashboard/exports',
  'POST /v1/dashboard/exports/{id}/approve',
  'GET /v1/dashboard/audit-trail',
  'GET /v1/dashboard/comparisons',
  'GET /v1/dashboard/transparency/checklist',
  'POST /v1/dashboard/transparency/audits',
  'GET /v1/dashboard/kpis',
  'GET /v1/dashboard/datasets',
  'GET /v1/dashboard/open-data/{dataset}',
  'GET /v1/dashboard/stream',
];

test('dado o repositório real (checkCommands() com opções padrão, forma de pnpm contracts:check) então ok=true (vermelho hoje: as três lacunas — raiz, filtro do app, catálogo)', () => {
  const result = checkCommands();
  assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
});

test('dado os contratos e controladores reais quando comparados então o conjunto de rotas do BP-DASH-MONITOR-001 é exatamente as 43 rotas de CTG-0002 §3 (sete controllers + stream), com operationId únicos (vermelho hoje: lacunas 1 e 2 — nenhuma rota dashboard é varrida pelas raízes padrão)', () => {
  const { operations, problems } = collectOperations(
    resolve(root, 'docs/framework/contracts'),
    resolve(root, 'docs/framework/blueprints'),
  );
  assert.deepEqual(problems, []);
  const dashboardOps = operations.filter((entry) =>
    entry.file.endsWith('BP-DASH-MONITOR-001.commands.openapi.json'),
  );
  assert.equal(
    dashboardOps.length,
    43,
    `esperadas 43 operações em BP-DASH-MONITOR-001.commands.openapi.json, achadas ${dashboardOps.length}`,
  );
  const contractRouteSet = [
    ...new Set(dashboardOps.map((entry) => `${entry.method} ${entry.path}`)),
  ].sort();
  assert.deepEqual(contractRouteSet, [...CTG_0002_ROUTES].sort());
  assert.equal(
    new Set(dashboardOps.map((entry) => entry.operationId)).size,
    dashboardOps.length,
    'operationId deve ser único por rota',
  );

  const { routes } = scanControllers(CONTROLLER_ROOTS);
  const scannedDashboardRoutes = [
    ...new Set(
      routes
        .filter((route) => route.path.startsWith('/v1/dashboard'))
        .map((route) => `${route.method} ${route.path}`),
    ),
  ].sort();
  assert.deepEqual(
    scannedDashboardRoutes,
    [...CTG_0002_ROUTES].sort(),
    'raiz backend/domains/dashboard/monitor/src/handwritten ausente de CONTROLLER_ROOTS (lacuna 1) e/ou filtro de backend/app/src (lacuna 2) impedem a varredura completa',
  );
});
