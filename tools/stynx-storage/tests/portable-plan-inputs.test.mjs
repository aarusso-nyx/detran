import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { readHistoricalPlanInput } from '../../stynx-storage-portable-plan-inputs.mjs';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const relative = 'tools/stynx-storage/consumer-fixtures/historical-plans';
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, relative, 'manifest.json')),
);
const selected = manifest.files[0].original;
const selectedRef = { path: selected.path, sha256: selected.sha256 };
const unselected = manifest.files.find(
  ({ retained }) => retained.sha256 !== selected.sha256,
).retained;

function isolated(run) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'detran-historical-'));
  try {
    fs.mkdirSync(path.join(copy, path.dirname(relative)), { recursive: true });
    fs.cpSync(path.join(root, relative), path.join(copy, relative), {
      recursive: true,
    });
    run(copy);
  } finally {
    fs.rmSync(copy, { recursive: true, force: true });
  }
}

test('historical map rejects tampered unrequested retained bytes', () =>
  isolated((copy) => {
    const file = path.join(copy, unselected.path);
    const bytes = fs.readFileSync(file);
    bytes[0] ^= 1;
    fs.writeFileSync(file, bytes);
    assert.throws(
      () => readHistoricalPlanInput(copy, selectedRef),
      historicalRefusal,
    );
  }));

test('historical map rejects an unrequested symlink', () =>
  isolated((copy) => {
    const file = path.join(copy, unselected.path);
    fs.rmSync(file);
    fs.symlinkSync(path.join(copy, manifest.files[0].retained.path), file);
    assert.throws(
      () => readHistoricalPlanInput(copy, selectedRef),
      historicalRefusal,
    );
  }));

test('historical logical ref refuses accessors before evaluation', () => {
  let evaluated = false;
  const ref = Object.defineProperties(
    {},
    {
      path: {
        enumerable: true,
        get() {
          evaluated = true;
          return selected.path;
        },
      },
      sha256: { enumerable: true, value: selected.sha256 },
    },
  );
  assert.throws(() => readHistoricalPlanInput(root, ref), historicalRefusal);
  assert.equal(evaluated, false);
});

// Inspector positive control for the exact immutable historical record; not current runtime admission.
test('historical mapped logical ref returns exact genuine selected bytes without current scratch access', () =>
  isolated((copy) => {
    assert.equal(fs.existsSync(path.join(copy, 'scratch')), false);
    const actual = readHistoricalPlanInput(copy, selectedRef);
    assert.deepEqual(
      actual,
      fs.readFileSync(path.join(root, manifest.files[0].retained.path)),
    );
  }));

test('historical map rejects a same-name unrequested directory', () =>
  isolated((copy) => {
    const file = path.join(copy, unselected.path);
    fs.rmSync(file);
    fs.mkdirSync(file);
    assert.throws(
      () => readHistoricalPlanInput(copy, selectedRef),
      historicalRefusal,
    );
  }));

test('historical logical ref refuses an own symbol key', () => {
  const ref = { ...selectedRef, [Symbol('TEST_ONLY-extra')]: true };
  assert.throws(() => readHistoricalPlanInput(root, ref), historicalRefusal);
});

test('historical logical ref refuses a hidden extra own key', () => {
  const ref = Object.defineProperty({ ...selectedRef }, 'TEST_ONLY-extra', {
    value: true,
  });
  assert.throws(() => readHistoricalPlanInput(root, ref), historicalRefusal);
});

function historicalRefusal(error) {
  return (
    error instanceof Error &&
    !(error instanceof TypeError) &&
    /Historical|historical/u.test(error.message)
  );
}
