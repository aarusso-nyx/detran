import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const generator = path.join(root, 'tools/blueprints/generate.mjs');
const template = path.join(
  root,
  'tools/blueprints/templates/portal-requests.vitest.ts',
);
const approvedConfigSha =
  '18ea54558c7715e306b386a7f4b6d426ad6996caa9622e97efb992c972986c17';
const aliasMarker = '/* DETRAN_PORTAL_REQUESTS_TEST_ALIASES */';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

function canonicalAliases() {
  return JSON.parse(
    fs.readFileSync(
      path.join(root, 'docs/framework/blueprints/BP-PORTAL-REQUESTS-001.json'),
      'utf8',
    ),
  ).module.testAliases;
}

function generate(script, blueprints, output) {
  const result = spawnSync(process.execPath, [script], {
    cwd: root,
    env: {
      ...process.env,
      BLUEPRINTS_DIR: blueprints,
      BLUEPRINTS_OUTPUT: output,
    },
    encoding: 'utf8',
  });
  assert.equal(
    result.status,
    0,
    `actual generator failed: ${result.stderr || result.stdout}`,
  );
}

function generatedFiles(output) {
  return JSON.parse(
    fs.readFileSync(
      path.join(output, 'tools/blueprints/generated-files.json'),
      'utf8',
    ),
  );
}

test('actual blueprint generator preserves the approved Portal metadata config and the unrelated generic population', (t) => {
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), 'detran-portal-blueprint-contract-'),
  );
  try {
    const blueprints = path.join(temporary, 'blueprints');
    fs.mkdirSync(blueprints);
    for (const [id, namespace, name] of [
      ['BP-PORTAL-REQUESTS-001', 'portal', 'Requests'],
      ['BP-PORTAL-CONTROL-001', 'portal', 'Control'],
      ['BP-INF-REQUESTS-001', 'inf', 'Requests'],
    ]) {
      fs.writeFileSync(
        path.join(blueprints, `${id}.json`),
        `${JSON.stringify({
          schemaVersion: '1.0.0',
          id,
          module: {
            namespace,
            name,
            version: '1.0.0',
            ...(id === 'BP-PORTAL-REQUESTS-001'
              ? { testAliases: canonicalAliases() }
              : {}),
          },
          database: { entities: [] },
        })}\n`,
      );
    }
    const approved = fs.readFileSync(
      path.join(root, 'backend/domains/portal/requests/vitest.config.ts'),
    );
    assert.equal(hash(approved), approvedConfigSha);
    assert.equal(
      hash(fs.readFileSync(template)),
      '95df74e27d673e5d6910d52ff9942ad6ce6e77f91318c6b3320ea23fdda82cae',
    );
    assert.equal(
      fs.readFileSync(template, 'utf8').split(aliasMarker).length,
      2,
    );

    const source = fs.readFileSync(generator, 'utf8');
    const dispatch =
      /bp\.id === 'BP-PORTAL-REQUESTS-001'\s*\? portalRequestsVitestConfig\(module\)\s*:\s*(?=`import \{ fileURLToPath \})/gu;
    assert.equal([...source.matchAll(dispatch)].length, 1);
    // This isolated counterfactual removes only the new dispatch. The original
    // generic literal and every other producer statement remain byte exact.
    const withoutDispatch = source.replace(dispatch, '');
    const counterfactual = path.join(temporary, 'without-portal-dispatch.mjs');
    fs.writeFileSync(counterfactual, withoutDispatch);
    const original = path.join(temporary, 'original-generic-output');
    const current = path.join(temporary, 'current-output');
    generate(counterfactual, blueprints, original);
    generate(generator, blueprints, current);

    const target = 'backend/domains/portal/requests/vitest.config.ts';
    const originalPortal = fs.readFileSync(path.join(original, target));
    assert.notDeepEqual(originalPortal, approved);
    // Execute the exact byte acceptance assertion against the actual generated
    // counterfactual, keeping this deliberate rejection inside the test process.
    let rejection;
    assert.throws(
      () => assert.deepEqual(originalPortal, approved),
      (error) => {
        rejection = error;
        return error.code === 'ERR_ASSERTION';
      },
    );
    t.diagnostic(
      JSON.stringify({
        counterfactual:
          'only Portal dispatch omitted in external generator copy',
        generatorSha256: hash(Buffer.from(source)),
        counterfactualGeneratorSha256: hash(Buffer.from(withoutDispatch)),
        generatedGenericPortalSha256: hash(originalPortal),
        approvedPortalSha256: approvedConfigSha,
        rejectionCode: rejection.code,
        rejectionMessage: rejection.message,
      }),
    );
    assert.deepEqual(fs.readFileSync(path.join(current, target)), approved);
    assert.deepEqual(generatedFiles(current), generatedFiles(original));
    for (const relative of generatedFiles(current)) {
      if (relative === target) continue;
      assert.deepEqual(
        fs.readFileSync(path.join(current, relative)),
        fs.readFileSync(path.join(original, relative)),
        `unrelated generated output changed: ${relative}`,
      );
    }
    const portalFile = path.join(blueprints, 'BP-PORTAL-REQUESTS-001.json');
    const changedBlueprint = JSON.parse(fs.readFileSync(portalFile, 'utf8'));
    assert.deepEqual(changedBlueprint.module.testAliases, canonicalAliases());
    const originalAlias = changedBlueprint.module.testAliases[0].target;
    const changedAlias = '../../shared/src/fixture-alias-change.ts';
    changedBlueprint.module.testAliases[0].target = changedAlias;
    fs.writeFileSync(portalFile, `${JSON.stringify(changedBlueprint)}\n`);
    const changedOutput = path.join(temporary, 'changed-canonical-alias');
    generate(generator, blueprints, changedOutput);
    const changedConfig = fs.readFileSync(path.join(changedOutput, target));
    assert.notDeepEqual(changedConfig, approved);
    assert.match(changedConfig.toString(), /fixture-alias-change\.ts/u);
    assert.equal(changedConfig.toString().includes(originalAlias), false);
    assert.match(changedConfig.toString(), /createNestMetadataPlugin/u);

    for (const relative of [
      'backend/domains/portal/control/vitest.config.ts',
      'backend/domains/inf/requests/vitest.config.ts',
    ]) {
      const content = fs.readFileSync(path.join(current, relative), 'utf8');
      assert.doesNotMatch(content, /createNestMetadataPlugin/u);
      assert.match(content, /passWithNoTests: true/u);
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});

test('actual Portal producer refuses missing or duplicate canonical alias markers', () => {
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), 'detran-portal-blueprint-marker-'),
  );
  try {
    // The isolated source root uses the same installed formatter/configuration;
    // no producer or repository source is rewritten to exercise these inputs.
    fs.mkdirSync(path.join(temporary, 'tools/blueprints/templates'), {
      recursive: true,
    });
    fs.copyFileSync(
      path.join(root, 'tools/stynx-version.json'),
      path.join(temporary, 'tools/stynx-version.json'),
    );
    fs.copyFileSync(
      path.join(root, 'package.json'),
      path.join(temporary, 'package.json'),
    );
    fs.copyFileSync(
      path.join(root, '.prettierrc'),
      path.join(temporary, '.prettierrc'),
    );
    fs.symlinkSync(
      path.join(root, 'node_modules'),
      path.join(temporary, 'node_modules'),
      'dir',
    );
    const blueprints = path.join(temporary, 'blueprints');
    fs.mkdirSync(blueprints);
    fs.writeFileSync(
      path.join(blueprints, 'BP-PORTAL-REQUESTS-001.json'),
      JSON.stringify({
        schemaVersion: '1.0.0',
        id: 'BP-PORTAL-REQUESTS-001',
        module: {
          namespace: 'portal',
          name: 'Requests',
          version: '1.0.0',
          testAliases: canonicalAliases(),
        },
        database: { entities: [] },
      }),
    );
    const originalTemplate = fs.readFileSync(template, 'utf8');
    for (const [name, content] of [
      ['missing', originalTemplate.replace(aliasMarker, '')],
      [
        'duplicate',
        originalTemplate.replace(aliasMarker, `${aliasMarker}${aliasMarker}`),
      ],
    ]) {
      fs.writeFileSync(
        path.join(
          temporary,
          'tools/blueprints/templates/portal-requests.vitest.ts',
        ),
        content,
      );
      const output = path.join(temporary, name);
      // Catch only at the external harness boundary so genuine producer refusal
      // is observable without an uncaught-exception process-shutdown dependency.
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          "import { pathToFileURL } from 'node:url'; try { await import(pathToFileURL(process.argv[1]).href); } catch (error) { process.stderr.write(error.message); process.exitCode = 1; }",
          generator,
        ],
        {
          cwd: temporary,
          env: {
            ...process.env,
            BLUEPRINTS_DIR: blueprints,
            BLUEPRINTS_OUTPUT: output,
          },
          encoding: 'utf8',
        },
      );
      assert.equal(result.status, 1, result.stderr || result.stdout);
      assert.match(result.stderr, /requires exactly one alias marker/u);
      assert.equal(
        fs.existsSync(
          path.join(output, 'backend/domains/portal/requests/vitest.config.ts'),
        ),
        false,
      );
    }
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
