// Testes de `tools/contracts/check-commands.mjs` (TASK-0012, WP-T3, CTG-0005 §3 e §7).
//
// O módulo ainda não existe — TASK-0010 (Engineer) o implementa. Por isso este arquivo
// falha hoje inteiro por `ERR_MODULE_NOT_FOUND` na importação estática abaixo; é o
// vermelho esperado (CTG-0005 §7 C-5-01…C-5-16, prompt TASK-0012 item 4). Qualquer outra
// falha, depois que `check-commands.mjs` existir, é defeito do gate ou do teste.
//
// Fixtures em tools/contracts/tests/fixtures/check-commands/ (nunca os contratos reais,
// docs/meta/agents/inspector-tests.md e CTG-0005 §7). Cada caso monta um diretório
// temporário mínimo — um contrato de uma operação e um controlador de uma rota — e aponta
// o gate para ele via as opções de diretório da assinatura (CTG-0005 §3.1).
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import test from 'node:test';
import { checkCommands, collectOperations } from '../check-commands.mjs';

const exec = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const fixturesDir = join(root, 'tools/contracts/tests/fixtures/check-commands');
const gate = join(root, 'tools/contracts/check-commands.mjs');

async function readFixture(name) {
  return readFile(join(fixturesDir, name), 'utf8');
}

async function run(args) {
  try {
    const result = await exec(process.execPath, [gate, ...args], {
      cwd: root,
    });
    return { status: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return {
      status: typeof error.code === 'number' ? error.code : 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? String(error),
    };
  }
}

// Monta um diretório temporário com contractsDir/controllerRoots/catalogPath/blueprintsDir
// mínimos. `contracts` e `controllers` são mapas nome de arquivo → conteúdo; por padrão
// cada diretório recebe só a fixture base (uma operação, uma rota, ambas casando).
async function scenario({
  contracts = { 'contract.commands.openapi.json': null },
  controllers = { 'demo-items.controller.ts': null },
  catalog = null,
  blueprint = null,
} = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'detran-check-commands-'));
  const contractsDir = join(dir, 'contracts');
  const controllersDir = join(dir, 'controllers');
  const blueprintsDir = join(dir, 'blueprints');
  const catalogPath = join(dir, 'catalog.md');
  await mkdir(contractsDir, { recursive: true });
  await mkdir(controllersDir, { recursive: true });
  await mkdir(blueprintsDir, { recursive: true });
  for (const [name, content] of Object.entries(contracts)) {
    const text = content ?? (await readFixture(name));
    const target = join(contractsDir, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, 'utf8');
  }
  for (const [name, content] of Object.entries(controllers)) {
    const text = content ?? (await readFixture(name));
    const target = join(controllersDir, name);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, text, 'utf8');
  }
  await writeFile(
    catalogPath,
    catalog ?? (await readFixture('catalog.md')),
    'utf8',
  );
  await writeFile(
    join(blueprintsDir, 'BP-DEMO-001.json'),
    blueprint ?? (await readFixture('blueprints/BP-DEMO-001.json')),
    'utf8',
  );
  return {
    dir,
    contractsDir,
    controllerRoots: [controllersDir],
    catalogPath,
    blueprintsDir,
  };
}

async function cleanup(s) {
  await rm(s.dir, { recursive: true, force: true });
}

// Contrato mínimo da rota real BOAT usada pela matriz C-2-16/C-2-17. A rota,
// operationId e código pertencem ao BP-EST-CRASH-001 transcrito por TASK-0008;
// a forma inline mantém cada caso isolado do resolver de $ref do gate.
function boatContract({
  route = true,
  code = 'BOAT.CRASH_STATE_INVALID',
} = {}) {
  return `${JSON.stringify(
    {
      openapi: '3.1.0',
      info: {
        title: 'BOAT est/crash — fixture do Inspector',
        version: '1.0.0',
        'x-blueprint': 'BP-DEMO-001',
        'x-commands': true,
      },
      paths: route
        ? {
            '/v1/est/crash/records/{id}/start': {
              post: {
                operationId: 'boatCrashRecordStart',
                responses: {
                  200: { description: 'ok' },
                  400: {
                    description: 'erro',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            code: { type: 'string', enum: [code] },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          }
        : {},
      components: { schemas: {} },
    },
    null,
    2,
  )}\n`;
}

function boatController({ route = true } = {}) {
  return route
    ? `import { Controller, Post } from '@nestjs/common';

@Controller('v1/est/crash')
export class BoatCrashCommandsController {
  @Post('records/:id/start')
  start(): { ok: boolean } {
    return { ok: true };
  }
}
`
    : `import { Controller } from '@nestjs/common';

@Controller('v1/est/crash')
export class BoatCrashCommandsController {}
`;
}

// (a) contrato válido + controlador com as mesmas rotas → ok: true, operations = n
test('dado contrato válido e controlador com a mesma rota quando checkCommands então ok=true, operations=1 e problems=[]', async () => {
  const s = await scenario();
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true);
    assert.equal(result.operations, 1);
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// (b) rota no contrato sem controlador → missing-route
test('dado rota no contrato sem controlador correspondente quando checkCommands então exatamente um missing-route', async () => {
  const s = await scenario({
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'missing-route');
    assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
    assert.match(
      result.problems[0].detail,
      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
    );
  } finally {
    await cleanup(s);
  }
});

// (c) rota no controlador sem contrato → missing-operation
test('dado rota no controlador sem operação correspondente quando checkCommands então exatamente um missing-operation', async () => {
  const s = await scenario({
    contracts: { 'empty-paths-contract.commands.openapi.json': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 0);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'missing-operation');
    assert.match(
      result.problems[0].detail,
      /POST.*\/v1\/demo\/items\/\{id\}\/finalize/,
    );
    assert.match(result.problems[0].file, /controller\.ts/);
  } finally {
    await cleanup(s);
  }
});

// (d) `code` 4xx fora do catálogo → unknown-error-code
test('dado código 4xx fora do catálogo quando checkCommands então exatamente um unknown-error-code citando o código', async () => {
  const baseline = JSON.parse(
    await readFixture('contract.commands.openapi.json'),
  );
  baseline.paths['/v1/demo/items/{id}/finalize'].post.responses['409'].content[
    'application/json'
  ].schema.properties.code.enum = ['TEAT.GHOST_CODE'];
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /TEAT\.GHOST_CODE/);
  } finally {
    await cleanup(s);
  }
});

// (e) `operationId` duplicado → duplicate-operation-id
test('dado o mesmo operationId em dois arquivos quando checkCommands então exatamente um duplicate-operation-id citando os dois arquivos', async () => {
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': null,
      'contract-duplicate.commands.openapi.json': null,
    },
    controllers: { 'demo-items-two-routes.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 2);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'duplicate-operation-id');
    assert.match(result.problems[0].detail, /teatDemoItemFinalize/);
    assert.match(
      result.problems[0].detail,
      /contract\.commands\.openapi\.json/,
    );
    assert.match(
      result.problems[0].detail,
      /contract-duplicate\.commands\.openapi\.json/,
    );
  } finally {
    await cleanup(s);
  }
});

// (f) `x-blueprint` inexistente → unknown-blueprint
test('dado x-blueprint que não existe em blueprintsDir quando checkCommands então há um unknown-blueprint', async () => {
  const baseline = JSON.parse(
    await readFixture('contract.commands.openapi.json'),
  );
  baseline.info['x-blueprint'] = 'BP-GHOST-001';
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    const unknownBlueprint = result.problems.filter(
      (problem) => problem.kind === 'unknown-blueprint',
    );
    assert.equal(unknownBlueprint.length, 1);
    assert.match(unknownBlueprint[0].detail, /BP-GHOST-001/);
  } finally {
    await cleanup(s);
  }
});

// (g) JSON inválido → invalid-json
test('dado contrato com JSON quebrado quando checkCommands então exatamente um invalid-json no arquivo quebrado', async () => {
  const broken = (await readFixture('contract.commands.openapi.json')).slice(
    0,
    -30,
  );
  const s = await scenario({
    contracts: { 'contract.commands.openapi.json': broken },
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.operations, 0);
    assert.equal(result.problems.length, 1);
    assert.equal(result.problems[0].kind, 'invalid-json');
    assert.match(result.problems[0].file, /contract\.commands\.openapi\.json/);
  } finally {
    await cleanup(s);
  }
});

// (h) arquivo sem sufixo `.commands` é ignorado
test('dado arquivo *.openapi.json sem sufixo .commands quando checkCommands então é ignorado (mesmo se ilegível como JSON)', async () => {
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': null,
      'BP-DEMO-001.openapi.json': 'isto não é JSON válido nem deveria ser lido',
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true);
    assert.equal(result.operations, 1);
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// (i) execução como CLI: sucesso e falha
test('dado o repositório fixture sem problemas quando rodar a CLI então exit 0 e "commands contracts: OK (1 operations)"', async () => {
  const s = await scenario();
  try {
    const result = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'commands contracts: OK (1 operations)\n');
  } finally {
    await cleanup(s);
  }
});

test('dado o repositório fixture com uma rota órfã quando rodar a CLI então exit 1 com a lista de problemas em stderr e stdout vazio', async () => {
  const s = await scenario({
    controllers: { 'demo-items-empty.controller.ts': null },
  });
  try {
    const result = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /^missing-route: /);
    assert.match(result.stderr, /teatDemoItemFinalize/);
  } finally {
    await cleanup(s);
  }
});

// ---------------------------------------------------------------------------
// Iteração 2 (delivery-review ciclo 1): C-5-03, C-5-05, C-5-07, C-5-08,
// C-5-12…C-5-16 (CTG-0005 §7, adenda §9.16). `scenario()`/`cleanup()`/`run()`
// acima são reutilizados sem mudança.
// ---------------------------------------------------------------------------

// Ajuda a montar variantes do path do finalize dentro do documento base sem
// duplicar o JSON inteiro em cada caso.
async function baselineContract() {
  return JSON.parse(await readFixture('contract.commands.openapi.json'));
}

test('C-5-03 — dado contrato sem x-blueprint, com x-commands ausente/false, ou com x-generated presente quando checkCommands então cada caso gera exatamente um invalid-json', async () => {
  const cases = [
    {
      label: 'x-blueprint ausente',
      mutate: (doc) => {
        delete doc.info['x-blueprint'];
      },
      match: /x-blueprint ausente/,
    },
    {
      label: 'x-commands ausente',
      mutate: (doc) => {
        delete doc.info['x-commands'];
      },
      match: /x-commands/,
    },
    {
      label: 'x-commands false',
      mutate: (doc) => {
        doc.info['x-commands'] = false;
      },
      match: /x-commands/,
    },
    {
      label: 'x-generated presente',
      mutate: (doc) => {
        doc.info['x-generated'] = true;
      },
      match: /x-generated/,
    },
  ];
  for (const { label, mutate, match } of cases) {
    const baseline = await baselineContract();
    mutate(baseline);
    const s = await scenario({
      contracts: {
        'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
      },
      controllers: { 'demo-items-empty.controller.ts': null },
    });
    try {
      const result = await checkCommands({
        contractsDir: s.contractsDir,
        controllerRoots: s.controllerRoots,
        catalogPath: s.catalogPath,
        blueprintsDir: s.blueprintsDir,
      });
      assert.equal(result.ok, false, label);
      assert.equal(
        result.problems.length,
        1,
        `${label}: ${JSON.stringify(result.problems)}`,
      );
      assert.equal(result.problems[0].kind, 'invalid-json', label);
      assert.match(result.problems[0].detail, match, label);
    } finally {
      await cleanup(s);
    }
  }
});

test('C-5-05 — dado contrato cujo nome de arquivo não corresponde a nenhum blueprint mas cujo x-blueprint existe quando checkCommands então ok=true (resolução por x-blueprint, nunca pelo nome do arquivo)', async () => {
  const baseline = await readFixture('contract.commands.openapi.json'); // info['x-blueprint'] = 'BP-DEMO-001'
  const s = await scenario({
    // O nome do arquivo sugere um blueprint que não existe (`BP-GHOST-001`);
    // só o campo `x-blueprint` (BP-DEMO-001, existente) importa — é o mesmo
    // caso real de BP-OPS-BOOTSTRAP-001 (CTG-0005 §2.1).
    contracts: { 'BP-GHOST-001.commands.openapi.json': baseline },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.equal(result.operations, 1);
  } finally {
    await cleanup(s);
  }
});

test('C-5-07 — dado resposta 4xx sem properties.code.enum quando checkCommands então um unknown-error-code; dada a mesma resposta com x-kernel idempotency então ok=true', async () => {
  const missingEnum = await baselineContract();
  delete missingEnum.paths['/v1/demo/items/{id}/finalize'].post.responses['409']
    .content['application/json'].schema.properties.code.enum;
  const s1 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(missingEnum, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s1.contractsDir,
      controllerRoots: s1.controllerRoots,
      catalogPath: s1.catalogPath,
      blueprintsDir: s1.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /sem properties\.code\.enum/);
  } finally {
    await cleanup(s1);
  }

  const withKernel = await baselineContract();
  delete withKernel.paths['/v1/demo/items/{id}/finalize'].post.responses['409']
    .content['application/json'].schema.properties.code.enum;
  withKernel.paths['/v1/demo/items/{id}/finalize'].post.responses['409'][
    'x-kernel'
  ] = 'idempotency';
  const s2 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(withKernel, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s2.contractsDir,
      controllerRoots: s2.controllerRoots,
      catalogPath: s2.catalogPath,
      blueprintsDir: s2.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
  } finally {
    await cleanup(s2);
  }
});

test('C-5-08 — dado enum de error_code (recibo de sincronização) com código fora do catálogo quando checkCommands então um unknown-error-code', async () => {
  const baseline = await baselineContract();
  const successSchema =
    baseline.paths['/v1/demo/items/{id}/finalize'].post.responses['200']
      .content['application/json'].schema;
  // Forma de backend/domains/ops/offline-sync (receipts[].error_code,
  // CTG-0005 §2.2/§3.3 regra 3b): array de itens com error_code nullable.
  successSchema.properties.receipts = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        error_code: {
          type: ['string', 'null'],
          enum: ['TEAT.GHOST_RECEIPT_CODE'],
        },
      },
    },
  };
  const s = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'unknown-error-code');
    assert.match(result.problems[0].detail, /TEAT\.GHOST_RECEIPT_CODE/);
  } finally {
    await cleanup(s);
  }
});

test('C-5-12 — dado :id no controlador e {id} no contrato quando checkCommands então ok=true (normalização :id ↔ {id}); dado {aitId} no contrato contra :id no controlador então um missing-route e um missing-operation', async () => {
  // A normalização já é exercida pela fixture base inteira (controlador
  // ':id/finalize', contrato '{id}/finalize').
  const s1 = await scenario();
  try {
    const result = await checkCommands({
      contractsDir: s1.contractsDir,
      controllerRoots: s1.controllerRoots,
      catalogPath: s1.catalogPath,
      blueprintsDir: s1.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
  } finally {
    await cleanup(s1);
  }

  const renamed = await baselineContract();
  const operation = renamed.paths['/v1/demo/items/{id}/finalize'];
  delete renamed.paths['/v1/demo/items/{id}/finalize'];
  renamed.paths['/v1/demo/items/{aitId}/finalize'] = operation;
  const s2 = await scenario({
    contracts: {
      'contract.commands.openapi.json': `${JSON.stringify(renamed, null, 2)}\n`,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s2.contractsDir,
      controllerRoots: s2.controllerRoots,
      catalogPath: s2.catalogPath,
      blueprintsDir: s2.blueprintsDir,
    });
    assert.equal(result.ok, false);
    const kinds = result.problems.map((problem) => problem.kind).sort();
    assert.deepEqual(kinds, ['missing-operation', 'missing-route']);
  } finally {
    await cleanup(s2);
  }
});

test('C-5-13 — dado controlador sob src/controllers/ ou src/generated/, ou arquivo *.spec.ts, quando checkCommands então a rota não é varrida (sem missing-operation)', async () => {
  const s = await scenario({
    controllers: {
      'demo-items.controller.ts': null,
      'controllers/generated-crud.controller.ts': null,
      'generated/another-generated.controller.ts': null,
      'demo-items.spec.controller.ts': null,
    },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

// C-5-14 exercises `check-commands.mjs`'s `backend/app/src` special case
// (§3.2 rule 4), which compares the scanned root against
// `path.resolve(process.cwd(), 'backend/app/src')` — i.e. it only fires when
// a controllerRoots entry resolves to that exact relative path under the
// *running process's* cwd. A fixture directory passed by absolute path never
// matches it, so this case needs the CLI spawned with `cwd` pointed at a
// scratch root that has its own `backend/app/src`, and `--controllers`
// passed as the relative string `backend/app/src` (same trick as
// `generate-clients.test.mjs`'s `cliScenario`).
async function appSrcCliScenario() {
  const fakeRoot = await mkdtemp(
    join(tmpdir(), 'detran-check-commands-appsrc-'),
  );
  const contractsDir = join(fakeRoot, 'contracts');
  const controllersDir = join(fakeRoot, 'backend/app/src');
  const blueprintsDir = join(fakeRoot, 'blueprints');
  const catalogPath = join(fakeRoot, 'catalog.md');
  await mkdir(contractsDir, { recursive: true });
  await mkdir(controllersDir, { recursive: true });
  await mkdir(blueprintsDir, { recursive: true });
  await writeFile(
    join(contractsDir, 'empty-paths-contract.commands.openapi.json'),
    await readFixture('empty-paths-contract.commands.openapi.json'),
    'utf8',
  );
  await writeFile(
    join(controllersDir, 'teat-x.controller.ts'),
    await readFixture('teat-x.controller.ts'),
    'utf8',
  );
  await writeFile(
    join(controllersDir, 'outro.controller.ts'),
    await readFixture('outro.controller.ts'),
    'utf8',
  );
  await writeFile(catalogPath, await readFixture('catalog.md'), 'utf8');
  await writeFile(
    join(blueprintsDir, 'BP-DEMO-001.json'),
    await readFixture('blueprints/BP-DEMO-001.json'),
    'utf8',
  );
  return { fakeRoot, contractsDir, blueprintsDir, catalogPath };
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

test('C-5-14 — dado backend/app/src (truque de cwd) quando rodar a CLI então só teat-x.controller.ts é varrido; outro.controller.ts (sem prefixo teat-) é ignorado', async () => {
  const s = await appSrcCliScenario();
  try {
    const result = await runInCwd(s.fakeRoot, [
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      'backend/app/src',
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(result.status, 1);
    const missingOperationLines = result.stderr
      .split('\n')
      .filter((line) => line.startsWith('missing-operation'));
    assert.equal(missingOperationLines.length, 1, result.stderr);
    assert.match(missingOperationLines[0], /teat-x\.controller\.ts/);
    assert.doesNotMatch(result.stderr, /outro\.controller\.ts/);
  } finally {
    await rm(s.fakeRoot, { recursive: true, force: true });
  }
});

test('C-5-15 — dado um decorador de rota com argumento não literal quando checkCommands então um invalid-json citando classe e método; e a CLI sai com exit 1', async () => {
  const s = await scenario({
    contracts: { 'empty-paths-contract.commands.openapi.json': null },
    controllers: { 'demo-items-dynamic-route.controller.ts': null },
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.equal(result.problems.length, 1, JSON.stringify(result.problems));
    assert.equal(result.problems[0].kind, 'invalid-json');
    assert.match(result.problems[0].detail, /DemoItemsDynamicRouteController/);
    assert.match(result.problems[0].detail, /dynamic/);

    const cli = await run([
      '--contracts-dir',
      s.contractsDir,
      '--controllers',
      s.controllerRoots[0],
      '--catalog',
      s.catalogPath,
      '--blueprints',
      s.blueprintsDir,
    ]);
    assert.equal(cli.status, 1);
  } finally {
    await cleanup(s);
  }
});

// R-0013: 100 operações do TEAT (R-0008 + BP-OPS-PROVISIONING-001) + 47 do
// Portal (BP-PORTAL-*.commands.openapi.json, CTG-0002 §2 + stream §9) + 13
// do BOAT (BP-EST-CRASH-001.commands.openapi.json) = 160.
test('C-5-16 — dado o repositório real (sem flags) quando checkCommands então ok=true e operations=160', async () => {
  const result = checkCommands();
  assert.equal(result.ok, true, JSON.stringify(result.problems, null, 2));
  assert.equal(result.operations, 160);
});

// ---------------------------------------------------------------------------
// TASK-0011 — Inspector REDs para CTG-0002 C-2-01, C-2-16 e C-2-17.
// Os casos abaixo usam a CLI em um root efêmero para que os dois catálogos
// sejam resolvidos por seus nomes canônicos, sem unir seus códigos.
// ---------------------------------------------------------------------------

async function catalogMatrixScenario({
  code,
  boatCatalog = '',
  teatCatalog = '',
}) {
  const fakeRoot = await mkdtemp(join(tmpdir(), 'detran-check-commands-c2-'));
  const contractsDir = join(fakeRoot, 'contracts');
  const controllersDir = join(fakeRoot, 'controllers');
  const blueprintsDir = join(fakeRoot, 'blueprints');
  await mkdir(contractsDir, { recursive: true });
  await mkdir(controllersDir, { recursive: true });
  await mkdir(blueprintsDir, { recursive: true });
  await mkdir(join(fakeRoot, 'docs/framework/arch'), { recursive: true });
  await writeFile(
    join(contractsDir, 'BP-DEMO-001.commands.openapi.json'),
    boatContract({ code }),
    'utf8',
  );
  await writeFile(
    join(controllersDir, 'boat-commands.controller.ts'),
    boatController(),
    'utf8',
  );
  await writeFile(
    join(blueprintsDir, 'BP-DEMO-001.json'),
    await readFixture('blueprints/BP-DEMO-001.json'),
    'utf8',
  );
  await writeFile(
    join(fakeRoot, 'docs/framework/arch/boat-error-catalog.md'),
    boatCatalog,
    'utf8',
  );
  await writeFile(
    join(fakeRoot, 'docs/framework/arch/teat-error-catalog.md'),
    teatCatalog,
    'utf8',
  );
  return { fakeRoot, contractsDir, controllersDir, blueprintsDir };
}

test('C-2-16 — dado código BOAT presente somente no catálogo BOAT quando rodar o gate então passa; código BOAT ausente do catálogo BOAT falha', async () => {
  const cases = [
    {
      label: 'BOAT no catálogo BOAT',
      code: 'BOAT.CRASH_STATE_INVALID',
      boatCatalog: '`BOAT.CRASH_STATE_INVALID`',
      expectedStatus: 0,
    },
    {
      label: 'BOAT ausente do catálogo BOAT',
      code: 'BOAT.CRASH_STATE_INVALID',
      teatCatalog: '`BOAT.CRASH_STATE_INVALID`',
      expectedStatus: 1,
    },
    {
      label: 'TEAT no catálogo TEAT',
      code: 'TEAT.AUTH_REQUIRED',
      teatCatalog: '`TEAT.AUTH_REQUIRED`',
      expectedStatus: 0,
    },
    {
      label: 'TEAT ausente do catálogo TEAT',
      code: 'TEAT.AUTH_REQUIRED',
      boatCatalog: '`TEAT.AUTH_REQUIRED`',
      expectedStatus: 1,
    },
    {
      label: 'prefixo não catalogado',
      code: 'MYSTERY.AUTH_REQUIRED',
      boatCatalog: '`MYSTERY.AUTH_REQUIRED`',
      teatCatalog: '`MYSTERY.AUTH_REQUIRED`',
      expectedStatus: 1,
    },
  ];
  for (const current of cases) {
    const s = await catalogMatrixScenario(current);
    try {
      const result = await runInCwd(s.fakeRoot, [
        '--contracts-dir',
        s.contractsDir,
        '--controllers',
        s.controllersDir,
        '--blueprints',
        s.blueprintsDir,
      ]);
      assert.equal(result.status, current.expectedStatus, current.label);
      if (current.expectedStatus === 1)
        assert.match(result.stderr, /unknown-error-code/);
    } finally {
      await rm(s.fakeRoot, { recursive: true, force: true });
    }
  }
});

test('C-2-16 — dado resposta 4xx BOAT e recibo com error_code BOAT quando checkCommands então ambos consultam o catálogo BOAT', async () => {
  const baseline = JSON.parse(boatContract());
  const response =
    baseline.paths['/v1/est/crash/records/{id}/start'].post.responses['400'];
  response.content['application/json'].schema.properties.code.enum = [
    'BOAT.CRASH_STATE_INVALID',
  ];
  baseline.paths['/v1/est/crash/records/{id}/start'].post.responses['200'] = {
    description: 'ok',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            receipts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  error_code: {
                    type: 'string',
                    enum: ['BOAT.SYNC_INVALID_CRASH_RECORD'],
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  const s = await scenario({
    contracts: {
      'boat.commands.openapi.json': `${JSON.stringify(baseline, null, 2)}\n`,
    },
    controllers: { 'boat-commands.controller.ts': boatController() },
    catalog: '`BOAT.CRASH_STATE_INVALID`\n`BOAT.SYNC_INVALID_CRASH_RECORD`\n',
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
    assert.deepEqual(result.problems, []);
  } finally {
    await cleanup(s);
  }
});

test('C-2-17 — dado rota BOAT no contrato e controlador correspondente quando checkCommands então passa; sem controlador então há missing-route', async () => {
  const present = await scenario({
    contracts: { 'boat.commands.openapi.json': boatContract() },
    controllers: { 'boat-commands.controller.ts': boatController() },
    catalog: '`BOAT.CRASH_STATE_INVALID`',
  });
  try {
    const result = await checkCommands({
      contractsDir: present.contractsDir,
      controllerRoots: present.controllerRoots,
      catalogPath: present.catalogPath,
      blueprintsDir: present.blueprintsDir,
    });
    assert.equal(result.ok, true, JSON.stringify(result.problems));
  } finally {
    await cleanup(present);
  }

  const absent = await scenario({
    contracts: { 'boat.commands.openapi.json': boatContract() },
    controllers: {
      'boat-commands-empty.controller.ts': boatController({ route: false }),
    },
    catalog: '`BOAT.CRASH_STATE_INVALID`',
  });
  try {
    const result = await checkCommands({
      contractsDir: absent.contractsDir,
      controllerRoots: absent.controllerRoots,
      catalogPath: absent.catalogPath,
      blueprintsDir: absent.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.problems.some((problem) => problem.kind === 'missing-route'),
    );
  } finally {
    await cleanup(absent);
  }
});

test('C-2-17 — dado controlador BOAT sem operação correspondente quando checkCommands então há missing-operation', async () => {
  const s = await scenario({
    contracts: { 'empty-paths-contract.commands.openapi.json': null },
    controllers: { 'boat-commands.controller.ts': boatController() },
    catalog: '`BOAT.CRASH_STATE_INVALID`',
  });
  try {
    const result = await checkCommands({
      contractsDir: s.contractsDir,
      controllerRoots: s.controllerRoots,
      catalogPath: s.catalogPath,
      blueprintsDir: s.blueprintsDir,
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.problems.some((problem) => problem.kind === 'missing-operation'),
    );
  } finally {
    await cleanup(s);
  }
});

test('C-2-16 — dado o conjunto de contratos reais quando coletar operações então as 100 operações TEAT permanecem presentes', async () => {
  const { operations, problems } = collectOperations(
    join(root, 'docs/framework/contracts'),
    join(root, 'docs/framework/blueprints'),
  );
  assert.deepEqual(problems, []);
  const teatOperations = operations.filter((entry) =>
    /\/BP-(?:INF|OPS)-/.test(entry.file),
  );
  assert.equal(teatOperations.length, 100);
  assert.equal(
    new Set(teatOperations.map((entry) => entry.operationId)).size,
    100,
  );
});
