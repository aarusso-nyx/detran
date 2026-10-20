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
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

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
          module: { namespace, name, version: '1.0.0' },
          database: { entities: [] },
        })}\n`,
      );
    }
    const approved = fs.readFileSync(
      path.join(root, 'backend/domains/portal/requests/vitest.config.ts'),
    );
    assert.equal(hash(approved), approvedConfigSha);
    assert.equal(hash(fs.readFileSync(template)), approvedConfigSha);
    assert.deepEqual(fs.readFileSync(template), approved);

    const source = fs.readFileSync(generator, 'utf8');
    const dispatch =
      /bp\.id === 'BP-PORTAL-REQUESTS-001'\s*\? fs\.readFileSync\([\s\S]*?'utf8',\s*\)\s*:\s*(?=`import \{ fileURLToPath \})/gu;
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
