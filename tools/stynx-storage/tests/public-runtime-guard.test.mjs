// Extracted private effect/cache seam with TEST_ONLY ports. No SDK/network/SQL.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const source = () =>
  readFileSync(
    path.join(root, 'tools/stynx-storage-public-runtime-guard.mjs'),
    'utf8',
  );
function effects() {
  const s = source();
  const text = s.slice(
    s.indexOf('const deny ='),
    s.indexOf('const connectOriginal ='),
  );
  assert.ok(text.startsWith('const deny ='));
  const calls = [],
    violations = [];
  const fail = (reason) => {
    violations.push(reason);
    throw Object.assign(new Error(reason), {
      code: 'STYNX_PUBLIC_INSTALL_REFUSED',
    });
  };
  const healthy = () => {
    if (violations.length) fail('TEST_ONLY irreversible poison');
  };
  const insist = (ok, reason) => {
    if (!ok) fail(reason);
  };
  const fake = (label) =>
    new Proxy(
      {},
      {
        get(target, key) {
          return (target[key] ??= function () {
            calls.push(label + '.' + String(key));
            return 'TEST_ONLY_PORT_EFFECT';
          });
        },
      },
    );
  const dns = fake('dns');
  dns.promises = fake('dns.promises');
  const ports = {
    child: fake('child'),
    net: fake('net'),
    tls: fake('tls'),
    http: fake('http'),
    https: fake('https'),
    dgram: fake('dgram'),
    workers: fake('workers'),
    vm: fake('vm'),
    dns,
  };
  new Function(
    ...Object.keys(ports),
    'healthy',
    'fail',
    'insist',
    'settings',
    text,
  )(...Object.values(ports), healthy, fail, insist, {
    host: 'TEST_ONLY_configured_host',
    port: 5432,
  });
  return { ...ports, calls, violations, healthy };
}
test('public guard configured DNS lookup preserves genuine callback signature and other host permanently refuses', () => {
  const x = effects();
  const cb = () => {};
  assert.equal(
    x.dns.lookup('TEST_ONLY_configured_host', { all: true }, cb),
    'TEST_ONLY_PORT_EFFECT',
  );
  assert.deepEqual(x.calls, ['dns.lookup']);
  assert.throws(() => x.dns.lookup('TEST_ONLY_other_host', cb), {
    code: 'STYNX_PUBLIC_INSTALL_REFUSED',
  });
  assert.throws(() => x.healthy(), { code: 'STYNX_PUBLIC_INSTALL_REFUSED' });
});
test('public guard every DNS callback resolution variant refuses before port and irreversibly poisons', () => {
  const escaped = [];
  for (const method of [
    'resolve',
    'resolve4',
    'resolve6',
    'resolveAny',
    'resolveCname',
    'resolveMx',
    'resolveTxt',
    'resolveSrv',
    'resolveNs',
    'resolvePtr',
    'resolveNaptr',
    'resolveSoa',
    'reverse',
  ]) {
    const x = effects();
    try {
      x.dns[method]('TEST_ONLY_configured_host', () => {});
      escaped.push(method);
    } catch (error) {
      assert.equal(error.code, 'STYNX_PUBLIC_INSTALL_REFUSED');
    }
    if (x.calls.length || !x.violations.length)
      escaped.push(method + ':unpoisoned');
  }
  assert.deepEqual(escaped, []);
});
for (const promise of [false, true])
  test(
    'public guard ' +
      (promise ? 'promise ' : '') +
      'Resolver constructor gives typed permanent refusal without port',
    () => {
      const x = effects();
      const port = promise ? x.dns.promises : x.dns;
      assert.throws(() => new port.Resolver(), {
        code: 'STYNX_PUBLIC_INSTALL_REFUSED',
      });
      assert.deepEqual(x.calls, []);
      assert.ok(x.violations.length);
    },
  );
test('public guard forbidden Worker and VM constructors poison even when refusal is caught', () => {
  for (const [object, name] of [
    ['workers', 'Worker'],
    ['vm', 'Script'],
    ['vm', 'SourceTextModule'],
    ['vm', 'SyntheticModule'],
  ]) {
    const x = effects();
    assert.throws(() => new x[object][name]('TEST_ONLY'), {
      code: 'STYNX_PUBLIC_INSTALL_REFUSED',
    });
    assert.deepEqual(x.calls, []);
    assert.throws(() => x.healthy(), { code: 'STYNX_PUBLIC_INSTALL_REFUSED' });
  }
});
test('public guard poisoned cached Module load refuses before original lookup or cached object return', () => {
  const ts = createRequire(import.meta.url)(
    path.join(
      root,
      'node_modules/.pnpm/typescript@6.0.3/node_modules/typescript/lib/typescript.js',
    ),
  );
  const s = source();
  const ast = ts.createSourceFile('guard.mjs', s, ts.ScriptTarget.Latest, true);
  let body;
  function visit(n) {
    if (
      ts.isBinaryExpression(n) &&
      ts.isFunctionExpression(n.right) &&
      n.left.getText(ast) === 'modules.Module._load'
    )
      body = n.right.getText(ast);
    ts.forEachChild(n, visit);
  }
  visit(ast);
  assert.ok(body);
  let called = 0;
  const healthy = () => {
    throw Object.assign(new Error('TEST_ONLY previous violation'), {
      code: 'STYNX_PUBLIC_INSTALL_REFUSED',
    });
  };
  const lookup = () => {
    called++;
    return Object.freeze({ TEST_ONLY_cached: true });
  };
  const load = new Function(
    'healthy',
    'requireOriginal',
    'rootAnchors',
    'insist',
    'return (' + body + ');',
  )(healthy, lookup, new Map(), assert.ok);
  assert.throws(
    () => load('TEST_ONLY_cached', { filename: 'TEST_ONLY_nonseed' }, false),
    { code: 'STYNX_PUBLIC_INSTALL_REFUSED' },
  );
  assert.equal(called, 0);
});

test('public guard precommit rehash passes exact logical keys for every descriptor file', () => {
  const s = source();
  const start = s.indexOf('function rehash() {');
  const end = s.indexOf('const status = Object.freeze(', start);
  assert.ok(start > 0 && end > start);
  const calls = [];
  const descriptor = {
    files: [
      {
        packageId: 'TEST_ONLY_package',
        member: 'dist/index.js',
        bytes: 7,
        sha256: 'TEST_ONLY_digest',
        nearestManifest: { member: 'package.json' },
      },
    ],
  };
  const fileFor = (logical) => {
    assert.deepEqual(Object.keys(logical).sort(), ['member', 'packageId']);
    return 'TEST_ONLY_file';
  };
  const rehash = new Function(
    'healthy',
    'checkLayout',
    'reference',
    'root',
    'admission',
    'sourceRefs',
    'descriptor',
    'verify',
    'fileFor',
    'loaded',
    `${s.slice(start, end)}; return rehash;`,
  )(
    () => calls.push('healthy'),
    () => calls.push('layout'),
    () => calls.push('reference'),
    'TEST_ONLY_root',
    ['TEST_ONLY_admission'],
    ['TEST_ONLY_source'],
    descriptor,
    () => calls.push('verify'),
    fileFor,
    ['TEST_ONLY_loaded'],
  );
  rehash();
  assert.deepEqual(calls, [
    'healthy',
    'layout',
    'reference',
    'reference',
    'verify',
    'verify',
  ]);
});
