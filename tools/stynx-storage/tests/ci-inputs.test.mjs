// Inspectorbf863 package-retention admission. No SDK, database or fabricated real policy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, lstatSync, realpathSync, readlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const producer = fileURLToPath(
  new URL('../../stynx-storage-ci-inputs.mjs', import.meta.url),
);
const root = path.resolve(path.dirname(producer), '..');
const source = () => readFileSync(producer, 'utf8');
const closedReasons = new Set([
  'invalid-cli',
  'ambient-loader',
  'policy-unavailable',
  'policy-identity',
  'invalid-document',
  'input-identity',
  'archive-integrity',
  'payload-inventory',
  'path-topology',
  'toolchain-identity',
  'output-exists',
  'unavailable-input',
  'unexpected-effect',
]);
function refusal(args, environment = {}, expected) {
  const observed = spawnSync(process.execPath, [producer, ...args], {
    cwd: root,
    env: { LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', TZ: 'UTC', ...environment },
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.equal(observed.error, undefined);
  assert.equal(observed.signal, null);
  assert.notEqual(observed.status, 0);
  assert.equal(observed.stdout, '');
  const match = /^R22_CI_INPUTS_REFUSED:([a-z-]+)\s*$/u.exec(observed.stderr);
  assert(
    match,
    'Missing program/TypeError/network stack is not typed producer refusal',
  );
  assert(closedReasons.has(match[1]));
  assert.equal(match[1], expected);
}
test('portable producer program exists and has fixed policy/output discovery without top-level SDK imports', () => {
  const s = source();
  assert(s.includes('tools/stynx-storage/fixtures/ci-admission-policy.json'));
  assert(
    s.includes('scratch/r22-adoption-161/portable-ci/retention-03/inputs'),
  );
  assert(s.includes('R22_CI_INPUTS_REFUSED:'));
  assert.doesNotMatch(
    s,
    /from\s+['"]@stynx-nyx\/|import\s*\(\s*['"]@stynx-nyx\//u,
  );
  assert.doesNotMatch(
    s,
    /\b(?:new\s+Client|psql|createApplicationContext)\s*\(/u,
  );
});
for (const [name, args] of [
  ['missing root', []],
  ['extra phase selector', [root, '--project']],
  ['foreign root', ['/tmp/R22-unadmitted-ci-root']],
  ['relative root', ['.']],
  ['traversal root', [root + '/../detran']],
  ['URL root', ['file://' + root]],
])
  test(`portable producer refuses ${name} before policy/fetch`, () =>
    refusal(args, {}, 'invalid-cli'));
for (const [name, environment] of [
  ['NODE_PATH', { NODE_PATH: '/tmp/R22-unadmitted-modules' }],
  ['native forcing', { NODE_PG_FORCE_NATIVE: '1' }],
  ['ambient harmless Node option', { NODE_OPTIONS: '--trace-warnings' }],
])
  test(`portable producer refuses ${name} before policy/fetch`, () =>
    refusal([root], environment, 'ambient-loader'));

// Manufactured tar format/attack fixtures only; these do not admit package bytes or replace real archive tests.
const validationUrl = new URL(
  '../../stynx-storage-ci-validation.mjs',
  import.meta.url,
);
const { ArchiveValidationError, checkDownloaded, archivePayload } =
  await import(validationUrl);
const { gzipSync } = await import('node:zlib');
const { createHash } = await import('node:crypto');
function fixtureTar(entries) {
  const parts = [];
  for (const {
    name,
    type = '0',
    data = Buffer.from('TEST_ONLY payload'),
    prefix = '',
  } of entries) {
    const header = Buffer.alloc(512);
    header.write(name, 0, 100, 'utf8');
    header.write('0000644\0', 100);
    header.write('0000000\0', 108);
    header.write('0000000\0', 116);
    header.write(data.length.toString(8).padStart(11, '0') + '\0', 124);
    header.write('00000000000\0', 136);
    header.fill(32, 148, 156);
    header.write(type, 156);
    header.write('ustar\0', 257);
    header.write('00', 263);
    header.write(prefix, 345, 155);
    const sum = header.reduce((a, b) => a + b, 0);
    header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
    parts.push(header, data, Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  parts.push(Buffer.alloc(1024));
  return Buffer.concat(parts);
}
const typedArchiveRefusal = (fn) =>
  assert.throws(
    fn,
    (e) =>
      e instanceof ArchiveValidationError && e.reason === 'archive-integrity',
  );
test('archive parser preserves regular member bytes and mode without filesystem effects', () => {
  const bytes = Buffer.from('TEST_ONLY exact\0bytes');
  const files = archivePayload(
    gzipSync(fixtureTar([{ name: 'package/package.json', data: bytes }])),
  );
  assert.equal(files.size, 1);
  assert.deepEqual(files.get('package.json').bytes, bytes);
  assert.equal(files.get('package.json').mode, 0o644);
});
for (const [name, entries] of [
  ['absolute member', [{ name: '/package/evil' }]],
  ['dot-dot member', [{ name: 'package/../evil' }]],
  ['dot member', [{ name: 'package/./evil' }]],
  ['backslash member', [{ name: 'package/evil\\outside' }]],
  ['symlink member', [{ name: 'package/evil', type: '2' }]],
  ['hardlink member', [{ name: 'package/evil', type: '1' }]],
  ['fifo member', [{ name: 'package/evil', type: '6' }]],
  [
    'duplicate regular member',
    [{ name: 'package/package.json' }, { name: 'package/package.json' }],
  ],
  ['second root', [{ name: 'package/package.json' }, { name: 'foreign/evil' }]],
])
  test('archive parser typed-refuses ' + name, () =>
    typedArchiveRefusal(() => archivePayload(gzipSync(fixtureTar(entries)))),
  );
test('archive parser typed-refuses invalid header checksum', () => {
  const tar = fixtureTar([{ name: 'package/package.json' }]);
  tar[0] ^= 1;
  typedArchiveRefusal(() => archivePayload(gzipSync(tar)));
});
test('archive parser typed-refuses a truncated declared payload', () => {
  const tar = fixtureTar([
    { name: 'package/package.json', data: Buffer.alloc(1024) },
  ]);
  typedArchiveRefusal(() => archivePayload(gzipSync(tar.subarray(0, 700))));
});
test('archive parser typed-refuses bytes after the tar terminator', () => {
  const tar = fixtureTar([{ name: 'package/package.json' }]);
  typedArchiveRefusal(() =>
    archivePayload(
      gzipSync(Buffer.concat([tar, Buffer.from('TEST_ONLY hidden payload')])),
    ),
  );
});
test('archive parser typed-refuses non-gzip input rather than leaking zlib exception', () =>
  typedArchiveRefusal(() => archivePayload(Buffer.from('TEST_ONLY notgzip'))));
test('download byte/SHA/SRI positive preserves input and all three bindings', () => {
  const bytes = Buffer.from('TEST_ONLY actual bytes');
  const before = Buffer.from(bytes);
  checkDownloaded(bytes, {
    bytes: bytes.length,
    sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'),
    integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'),
  });
  assert.deepEqual(bytes, before);
});
for (const field of ['bytes', 'sha256', 'integrity'])
  test('download typed-refuses ' + field + ' mismatch independently', () => {
    const bytes = Buffer.from('TEST_ONLY actual bytes');
    const expected = {
      bytes: bytes.length,
      sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'),
      integrity:
        'sha512-' + createHash('sha512').update(bytes).digest('base64'),
    };
    expected[field] =
      field === 'bytes'
        ? bytes.length + 1
        : field === 'sha256'
          ? 'sha256:' + '0'.repeat(64)
          : 'sha512-' + Buffer.alloc(64).toString('base64');
    typedArchiveRefusal(() => checkDownloaded(bytes, expected));
  });

// Final after-asynchronous-retention topology must be read back, not inferred from initial creation.
test('portable producer final output inventory rechecks actual link literals and resolved identity', () => {
  const s = source();
  const at = s.indexOf('// Every produced regular file/link');
  assert(at >= 0);
  const body = s.slice(at, s.indexOf('walk(outputRoot);', at));
  assert.match(body, /links\.get\(relative\)/u);
  assert.match(body, /fs\.readlinkSync\(full\)/u);
  assert.match(body, /fs\.realpathSync\(full\)/u);
  assert.match(body, /resolvedPath/u);
});

// Actual failed-attempt01 remains immutable; output generation02 and one exact observed GitHub npm redirect.
test('portable retention generation02 uses only its new fixed exclusive output root', () => {
  const s = source();
  assert.match(
    s,
    /const OUTPUT_PATH =\s*'scratch\/r22-adoption-161\/portable-ci\/retention-03\/inputs'/u,
  );
  assert.doesNotMatch(s, /process\.env\.(?:OUTPUT_PATH|OUTPUT_ROOT)|--output/u);
});
test('portable downloader admits exact observed GitHub npm redirect without forwarding auth to it', () => {
  const s = source();
  const body = s.slice(
    s.indexOf('async function download'),
    s.indexOf('function repositoryHead'),
  );
  assert(body.includes("'pkg-npm.githubusercontent.com'"));
  assert.match(body, /\.includes\(next\.hostname\)/u);
  assert.match(body, /next\.protocol === 'https:'/u);
  assert.match(
    body,
    /if \(url\.hostname === 'npm\.pkg\.github\.com' && process\.env\.NODE_AUTH_TOKEN\)/u,
  );
  assert.doesNotMatch(body, /\.endsWith\(['"]githubusercontent\.com/u);
});

// Actual producer output only. Missing output fails; no historical local scratch fallback or conditional skip.
const actualInputs = 'scratch/r22-adoption-161/portable-ci/retention-03/inputs';
const digest = (b) => 'sha256:' + createHash('sha256').update(b).digest('hex');
function actualB3(ref) {
  assert.deepEqual(Object.keys(ref).sort(), ['bytes', 'path', 'sha256']);
  assert.equal(typeof ref.path, 'string');
  assert(
    !path.isAbsolute(ref.path) &&
      ref.path.split('/').every((x) => x && x !== '.' && x !== '..'),
  );
  const f = path.join(root, ref.path);
  assert(lstatSync(f).isFile());
  assert.equal(realpathSync(f), f);
  const b = readFileSync(f);
  assert.equal(b.length, ref.bytes);
  assert.equal(digest(b), ref.sha256);
  return b;
}
function actualRetention() {
  const policyBytes = readFileSync(
    path.join(root, 'tools/stynx-storage/fixtures/ci-admission-policy.json'),
  );
  assert.equal(
    digest(policyBytes),
    'sha256:17785709f052acff861dabe70a4a0be87786e80a3d2f9d55adadf125c3f36108',
  );
  const policy = JSON.parse(policyBytes);
  const manifest = JSON.parse(
    readFileSync(
      path.join(root, actualInputs, 'metadata/portable-input-manifest.json'),
    ),
  );
  assert.equal(manifest.kind, 'detran-stynx-portable-ci-inputs');
  assert.equal(manifest.phase, 'RETENTION_READY_FOR_GRAPH_REVIEW');
  assert.deepEqual(manifest.limits, {
    sdkExecuted: false,
    databaseAccessed: false,
    ciAcceptance: false,
    providerAdmission: false,
    approvedTrustAdmission: false,
  });
  actualB3(manifest.policy);
  assert.equal(manifest.policy.sha256, digest(policyBytes));
  assert.deepEqual(manifest.publication, policy.publication);
  assert.equal(
    manifest.publication.sha256,
    'sha256:46815c17be9dbcd2080a3a0c08db958bd42390d8766c64ef40bebd5017074318',
  );
  return { policy, manifest };
}
test('actual portable retention binds protected policy publication and canonical current observation', () => {
  const { manifest } = actualRetention();
  const canonical = (v) =>
    Array.isArray(v)
      ? '[' + v.map(canonical).join(',') + ']'
      : v && typeof v === 'object'
        ? '{' +
          Object.keys(v)
            .sort()
            .map((k) => JSON.stringify(k) + ':' + canonical(v[k]))
            .join(',') +
          '}'
        : JSON.stringify(v);
  const { recordSha256, ...body } = manifest;
  assert.equal(recordSha256, digest(Buffer.from(canonical(body))));
  assert.equal(manifest.target.packages.length, 211);
  assert.equal(manifest.prior.packages.length, 176);
  assert.equal(manifest.toolchain.version, '24.20.0');
  actualB3(manifest.toolchain.executable);
  actualB3(manifest.toolchain.loaderInventory);
});
test('actual portable retention authenticates every real archive SRI and complete member inventory', () => {
  const { policy, manifest } = actualRetention(),
    cache = new Map();
  let targetCount = 0,
    priorCount = 0;
  for (const realm of ['target', 'prior']) {
    const wrapper = JSON.parse(
      actualB3(
        policy[realm === 'target' ? 'targetRetention' : 'priorObservation'],
      ),
    );
    const expected = new Map(
      JSON.parse(actualB3(wrapper.regularInventory)).map((x) => [
        x.context + '\0' + x.path,
        x,
      ]),
    );
    for (const pkg of manifest[realm].packages) {
      const admitted = wrapper.packages.find((x) => x.context === pkg.context);
      assert(admitted);
      assert.equal(pkg.name, admitted.name);
      assert.equal(pkg.version, admitted.version);
      const bytes = actualB3(pkg.archive);
      checkDownloaded(bytes, admitted.archive);
      let payload = cache.get(admitted.archive.sha256);
      if (!payload) {
        payload = archivePayload(bytes);
        cache.set(admitted.archive.sha256, payload);
      }
      const expectedNames = [...expected.keys()].filter((k) =>
        k.startsWith(pkg.context + '\0'),
      );
      assert.equal(payload.size, expectedNames.length);
      for (const [name, v] of payload) {
        const e = expected.get(pkg.context + '\0' + name);
        assert(e);
        assert.equal(v.bytes.length, e.bytes);
        assert.equal(digest(v.bytes), e.sha256);
        if (realm === 'target') targetCount++;
        else priorCount++;
      }
      const packageJson = JSON.parse(payload.get('package.json').bytes);
      assert.equal(packageJson.name, pkg.name);
      assert.equal(packageJson.version, pkg.version);
    }
  }
  assert.equal(targetCount, 30091);
  assert.equal(priorCount, 21618);
  assert.equal(cache.size, 351);
});
test('actual portable retention checks every produced regular record and all literal resolved links', () => {
  const { manifest } = actualRetention();
  for (const realm of ['target', 'prior']) {
    for (const f of manifest[realm].files) actualB3(f);
    for (const l of manifest[realm].links) {
      const f = path.join(root, l.path);
      assert(lstatSync(f).isSymbolicLink());
      assert.equal(readlinkSync(f), l.target);
      assert.equal(realpathSync(f), path.join(root, l.resolvedPath));
    }
  }
  assert.equal(manifest.target.links.length, 9);
  assert.equal(manifest.prior.links.length, 455);
  for (const f of manifest.historicalFixtures.files) actualB3(f);
  for (const f of manifest.outputs) actualB3(f);
});
test('actual portable retention tampered genuine tar refuses even with recomputed local SHA record', () => {
  const { policy, manifest } = actualRetention();
  const pkg = manifest.target.packages.find(
    (p) => p.name === '@stynx-nyx/offline-sync',
  );
  assert(pkg);
  const wrapper = JSON.parse(actualB3(policy.targetRetention)),
    admitted = wrapper.packages.find((p) => p.context === pkg.context);
  const original = actualB3(pkg.archive),
    mutated = Buffer.from(original);
  mutated[Math.floor(mutated.length / 2)] ^= 1;
  typedArchiveRefusal(() => checkDownloaded(mutated, admitted.archive));
  const coherentLocal = {
    ...admitted.archive,
    sha256: digest(mutated),
    bytes: mutated.length,
  };
  typedArchiveRefusal(() => checkDownloaded(mutated, coherentLocal));
  assert.equal(digest(original), admitted.archive.sha256);
});

// Exact authenticated published package.json bytes retained as metadata fixture data only; no package code executes.
const packageDependencyCases = [
  {
    name: 'handlebars',
    manifestRaw:
      '{\n  "name": "handlebars",\n  "barename": "handlebars",\n  "version": "4.7.10",\n  "description": "Handlebars provides the power necessary to let you build semantic templates effectively with no frustration",\n  "homepage": "https://handlebarsjs.com/",\n  "keywords": [\n    "handlebars",\n    "mustache",\n    "template",\n    "html"\n  ],\n  "repository": {\n    "type": "git",\n    "url": "https://github.com/handlebars-lang/handlebars.js.git"\n  },\n  "author": "Yehuda Katz",\n  "license": "MIT",\n  "readmeFilename": "README.md",\n  "engines": {\n    "node": ">=0.4.7"\n  },\n  "dependencies": {\n    "minimist": "^1.2.8",\n    "neo-async": "^2.6.2",\n    "source-map": "^0.6.1",\n    "wordwrap": "^1.0.0"\n  },\n  "optionalDependencies": {\n    "uglify-js": "^3.1.4"\n  },\n  "devDependencies": {\n    "@playwright/test": "1.44.1",\n    "aws-sdk": "^2.1.49",\n    "babel-loader": "^5.0.0",\n    "babel-runtime": "^5.1.10",\n    "benchmark": "~1.0",\n    "chai": "^4.2.0",\n    "chai-diff": "^1.0.1",\n    "concurrently": "^5.0.0",\n    "dirty-chai": "^2.0.1",\n    "dustjs-linkedin": "^2.0.2",\n    "eco": "~1.1.0-rc-3",\n    "eslint": "^6.7.2",\n    "eslint-config-prettier": "^6.7.0",\n    "eslint-plugin-compat": "^3.13.0",\n    "eslint-plugin-es5": "^1.4.1",\n    "fs-extra": "^8.1.0",\n    "grunt": "1.5.3",\n    "grunt-babel": "^5.0.0",\n    "grunt-cli": "^1",\n    "grunt-contrib-clean": "^1",\n    "grunt-contrib-concat": "^1",\n    "grunt-contrib-connect": "^1",\n    "grunt-contrib-copy": "^1",\n    "grunt-contrib-requirejs": "^1",\n    "grunt-contrib-uglify": "^1",\n    "grunt-contrib-watch": "^1.1.0",\n    "grunt-shell": "^4.0.0",\n    "grunt-webpack": "^1.0.8",\n    "husky": "^3.1.0",\n    "jison": "~0.3.0",\n    "lint-staged": "^9.5.0",\n    "mocha": "^5",\n    "mock-stdin": "^0.3.0",\n    "mustache": "^2.1.3",\n    "nyc": "^14.1.1",\n    "prettier": "^1.19.1",\n    "semver": "^5.0.1",\n    "sinon": "^7.5.0",\n    "typescript": "^3.4.3",\n    "underscore": "^1.5.1",\n    "webpack": "^1.12.6",\n    "webpack-dev-server": "^1.12.1"\n  },\n  "main": "lib/index.js",\n  "types": "types/index.d.ts",\n  "browser": "./dist/cjs/handlebars.js",\n  "bin": {\n    "handlebars": "bin/handlebars"\n  },\n  "scripts": {\n    "build": "grunt build",\n    "release": "npm run build && grunt release",\n    "format": "prettier --write \'**/*.js\' && eslint --fix .",\n    "lint": "npm run lint:eslint && npm run lint:prettier && npm run lint:types",\n    "lint:eslint": "eslint --max-warnings 0 .",\n    "lint:prettier": "prettier --check \'**/*.js\'",\n    "lint:types": "tsc --noEmit --project types",\n    "test": "npm run test:mocha",\n    "test:mocha": "grunt build && grunt test",\n    "test:browser": "playwright test --config tests/browser/playwright.config.js tests/browser/spec.js",\n    "test:integration": "grunt integration-tests",\n    "test:serve": "grunt connect:server:keepalive",\n    "extensive-tests-and-publish-to-aws": "npx mocha tasks/tests/ && grunt --stack extensive-tests-and-publish-to-aws",\n    "--- combined tasks ---": "",\n    "check-before-pull-request": "concurrently --kill-others-on-fail npm:lint npm:test"\n  },\n  "jspm": {\n    "main": "handlebars",\n    "directories": {\n      "lib": "dist/amd"\n    },\n    "buildConfig": {\n      "minify": true\n    }\n  },\n  "files": [\n    "bin",\n    "dist/*.js",\n    "dist/amd/**/*.js",\n    "dist/cjs/**/*.js",\n    "lib",\n    "release-notes.md",\n    "runtime.js",\n    "types/*.d.ts",\n    "runtime.d.ts"\n  ],\n  "husky": {\n    "hooks": {\n      "pre-commit": "lint-staged"\n    }\n  },\n  "lint-staged": {\n    "*.{js,css,json}": [\n      "prettier --write",\n      "git add"\n    ],\n    "*.js": [\n      "eslint --fix",\n      "git add"\n    ]\n  }\n}\n',
    manifestSha256:
      'sha256:cf06251288836dd2ba6d8d1a83dbe4c8c944556c34e17a3263c86325115d2a3c',
    registry: {
      bytes: 5942,
      path: 'tools/stynx-storage/fixtures/publication-161/versions/handlebars-4.7.10.json',
      sha256:
        'sha256:90cff984602b0c677dd4ae4718581c2136cf6bfeba6fbc3f86509de8ac139383',
    },
  },
  {
    name: '@stynx-nyx/pdf-a',
    manifestRaw:
      '{\n  "name": "@stynx-nyx/pdf-a",\n  "version": "1.6.1",\n  "license": "BUSL-1.1",\n  "author": "Antonio Augusto Russo <aarusso@nyxk.com.br>",\n  "description": "PDF/A validation contract and stubs for stynx",\n  "main": "dist/pdf-a/src/index.js",\n  "types": "dist/pdf-a/src/index.d.ts",\n  "engines": {\n    "node": ">=24 <25"\n  },\n  "exports": {\n    ".": {\n      "types": "./dist/pdf-a/src/index.d.ts",\n      "require": "./dist/pdf-a/src/index.js",\n      "default": "./dist/pdf-a/src/index.js"\n    }\n  },\n  "files": [\n    "dist"\n  ],\n  "peerDependencies": {\n    "@stynx-nyx/logging": "^1.6.1"\n  },\n  "peerDependenciesMeta": {\n    "@stynx-nyx/logging": {\n      "optional": true\n    }\n  },\n  "devDependencies": {\n    "@types/node": "24.13.4",\n    "typescript": "^6.0.3",\n    "@stynx-nyx/logging": "1.6.1"\n  },\n  "repository": {\n    "type": "git",\n    "url": "git+https://github.com/stynx-nyx/stynx.git",\n    "directory": "packages/pdf-a"\n  },\n  "scripts": {\n    "build": "tsc -p tsconfig.json",\n    "clean": "rm -rf dist coverage",\n    "typecheck": "tsc -p tsconfig.json --noEmit",\n    "lint": "eslint --config ../../tools/eslint-config/nest.mjs \\"src/**/*.ts\\"",\n    "test": "vitest run --config ./vitest.config.ts",\n    "test:coverage": "vitest run --config ./vitest.config.ts --coverage --coverage.reporter=json --coverage.reporter=json-summary"\n  }\n}',
    manifestSha256:
      'sha256:3ef3c28c1b97a179c98a827304ec4ef34fb8e00211b5f58167f8817c8a4461a2',
    registry: {
      bytes: 8469,
      path: 'tools/stynx-storage/fixtures/publication-161/versions/stynx-nyx-pdf-a-1.6.1.json',
      sha256:
        'sha256:d648ad80b5f00fbf36fe14df8b067347bfb37480c723f70fb77483da349976c5',
    },
  },
  {
    name: '@stynx-nyx/pdf-a-vera-docker',
    manifestRaw:
      '{\n  "name": "@stynx-nyx/pdf-a-vera-docker",\n  "version": "1.6.1",\n  "license": "BUSL-1.1",\n  "author": "Antonio Augusto Russo <aarusso@nyxk.com.br>",\n  "description": "veraPDF Docker adapter for the stynx PDF/A validator contract",\n  "main": "dist/pdf-a-vera-docker/src/index.js",\n  "types": "dist/pdf-a-vera-docker/src/index.d.ts",\n  "engines": {\n    "node": ">=24 <25"\n  },\n  "exports": {\n    ".": {\n      "types": "./dist/pdf-a-vera-docker/src/index.d.ts",\n      "require": "./dist/pdf-a-vera-docker/src/index.js",\n      "default": "./dist/pdf-a-vera-docker/src/index.js"\n    }\n  },\n  "files": [\n    "dist"\n  ],\n  "dependencies": {\n    "@stynx-nyx/pdf-a": "1.6.1"\n  },\n  "peerDependencies": {\n    "@stynx-nyx/logging": "^1.6.1"\n  },\n  "peerDependenciesMeta": {\n    "@stynx-nyx/logging": {\n      "optional": true\n    }\n  },\n  "devDependencies": {\n    "@types/node": "24.13.4",\n    "typescript": "^6.0.3",\n    "@stynx-nyx/logging": "1.6.1"\n  },\n  "repository": {\n    "type": "git",\n    "url": "git+https://github.com/stynx-nyx/stynx.git",\n    "directory": "packages/pdf-a-vera-docker"\n  },\n  "scripts": {\n    "build": "tsc -p tsconfig.json",\n    "clean": "rm -rf dist coverage",\n    "typecheck": "tsc -p tsconfig.json --noEmit",\n    "lint": "eslint --config ../../tools/eslint-config/nest.mjs \\"src/**/*.ts\\"",\n    "test": "vitest run --config ./vitest.config.ts",\n    "test:int": "vitest run --config ./vitest.int.config.ts",\n    "bench": "vitest run --config ./vitest.config.ts test/bench/throughput.bench.ts",\n    "test:coverage": "vitest run --config ./vitest.coverage.config.ts --coverage --coverage.reporter=json --coverage.reporter=json-summary"\n  }\n}',
    manifestSha256:
      'sha256:118a338d0f96c2f6aaf5b2cadfc5dd324035174bbc225390b7822bc1cc210d9a',
    registry: {
      bytes: 9867,
      path: 'tools/stynx-storage/fixtures/publication-161/versions/stynx-nyx-pdf-a-vera-docker-1.6.1.json',
      sha256:
        'sha256:c34eb2996660ee1eb3d5e995e06b025ec12ad94a0b10e8aad324eddcb24d51e3',
    },
  },
];
async function metadataSeam() {
  const api = await import(validationUrl);
  assert.equal(
    typeof api.checkPackageDependencyMetadata,
    'function',
    'Prospective missing pure metadata seam RED',
  );
  assert.equal(typeof api.PackageDependencyMetadataError, 'function');
  return api;
}
function metadataFacts(name) {
  const c = packageDependencyCases.find((x) => x.name === name);
  assert(c);
  const bytes = Buffer.from(c.manifestRaw);
  assert.equal(digest(bytes), c.manifestSha256);
  return {
    manifest: JSON.parse(c.manifestRaw),
    versionRecord: JSON.parse(actualB3(c.registry)).versionRecord,
  };
}
function freezeMetadata(v) {
  if (v && typeof v === 'object') {
    for (const x of Object.values(v)) freezeMetadata(x);
    Object.freeze(v);
  }
  return v;
}
for (const name of packageDependencyCases.map((x) => x.name))
  test(
    'package metadata genuine ' +
      name +
      ' normalization preserves authenticated input facts',
    async () => {
      const { checkPackageDependencyMetadata } = await metadataSeam();
      const facts = metadataFacts(name),
        before = JSON.stringify(facts);
      freezeMetadata(facts);
      assert.equal(
        checkPackageDependencyMetadata(facts.manifest, facts.versionRecord),
        undefined,
      );
      assert.equal(JSON.stringify(facts), before);
    },
  );
for (const [label, name, mutate] of [
  [
    'required dependency drift',
    'handlebars',
    (f) => {
      f.manifest.dependencies.minimist = 'TEST_ONLY wrong required range';
    },
  ],
  [
    'optional dependency drift',
    'handlebars',
    (f) => {
      f.manifest.optionalDependencies['uglify-js'] =
        'TEST_ONLY wrong optional range';
    },
  ],
  [
    'peer dependency drift',
    '@stynx-nyx/pdf-a',
    (f) => {
      const key = Object.keys(f.manifest.peerDependencies)[0];
      assert(key);
      f.manifest.peerDependencies[key] = 'TEST_ONLY wrong peer range';
    },
  ],
  [
    'present publisher peer meta drift',
    '@stynx-nyx/pdf-a',
    (f) => {
      assert.equal(f.versionRecord.peerDependenciesMeta, undefined);
      f.versionRecord.peerDependenciesMeta = {
        '@stynx-nyx/logging': { optional: false },
      };
    },
  ],
])
  test('package metadata typed-refuses ' + label, async () => {
    const { checkPackageDependencyMetadata, PackageDependencyMetadataError } =
      await metadataSeam();
    const facts = metadataFacts(name);
    mutate(facts);
    assert.throws(
      () => checkPackageDependencyMetadata(facts.manifest, facts.versionRecord),
      (e) =>
        e instanceof PackageDependencyMetadataError &&
        e.reason === 'input-identity' &&
        e.message === 'input-identity',
    );
  });
for (const field of [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
  'peerDependenciesMeta',
])
  test(
    'package metadata typed-refuses present malformed ' + field,
    async () => {
      const { checkPackageDependencyMetadata, PackageDependencyMetadataError } =
        await metadataSeam();
      const facts = metadataFacts('handlebars');
      facts.versionRecord[field] = null;
      assert.throws(
        () =>
          checkPackageDependencyMetadata(facts.manifest, facts.versionRecord),
        (e) =>
          e instanceof PackageDependencyMetadataError &&
          e.reason === 'input-identity',
      );
    },
  );
