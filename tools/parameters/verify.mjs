#!/usr/bin/env node
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { parseCatalogue } from './parser.mjs';
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const sourceOption = process.argv.includes('--source')
  ? process.argv[process.argv.indexOf('--source') + 1]
  : undefined;
const generatedRootOption = process.argv.includes('--generated-root')
  ? process.argv[process.argv.indexOf('--generated-root') + 1]
  : undefined;
const sourceArg =
  sourceOption ?? join(root, 'docs/framework/arch/parameter-catalogue.md');
const modelSource = process.argv.includes('--check-usage')
  ? join(root, 'docs/framework/arch/parameter-catalogue.md')
  : sourceArg;
const model = await parseCatalogue(modelSource).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
const generated = [
  generatedRootOption
    ? join(resolve(generatedRootOption), '05-parameters.sql')
    : join(root, 'backend/database/seed/05-parameters.sql'),
  generatedRootOption
    ? join(resolve(generatedRootOption), 'parameter-catalogue.ts')
    : join(
        root,
        'backend/domains/ops/parameter/src/generated/parameter-catalogue.ts',
      ),
  generatedRootOption
    ? join(resolve(generatedRootOption), 'parameter-flags.ts')
    : join(root, 'backend/app/src/generated/parameter-flags.ts'),
];

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function verifyLegalReadonly() {
  const legalEntries = model.entries.filter((entry) => entry.legal_readonly);
  if (legalEntries.length === 0) {
    console.error(
      'legal_readonly verification requires at least one legal entry',
    );
    process.exitCode = 1;
    return;
  }

  const [seedPath, cataloguePath, flagsPath] = generated;
  let seed;
  let catalogue;
  let flags;
  try {
    [seed, catalogue, flags] = await Promise.all([
      readFile(seedPath, 'utf8'),
      readFile(cataloguePath, 'utf8'),
      readFile(flagsPath, 'utf8'),
    ]);
  } catch (error) {
    console.error(
      `legal_readonly verification cannot read generated artifact: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
    return;
  }

  for (const entry of legalEntries) {
    const seedRow = `${sql(entry.key)}, ${sql(JSON.stringify(entry.value_json))}, ${sql(entry.value_type)}, ${sql(entry.status)}, ${entry.source_pending}, true, ${sql(entry.decision_ref)}`;
    if (!seed.includes(seedRow)) {
      console.error(`legal_readonly not preserved in seed: ${entry.key}`);
      process.exitCode = 1;
    }
    const key = entry.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const preservedInCatalogue = new RegExp(
      `key: '${key}'(?:(?!\\n  },)[\\s\\S])*?legal_readonly: true,`,
    );
    if (!preservedInCatalogue.test(catalogue)) {
      console.error(`legal_readonly not preserved in catalogue: ${entry.key}`);
      process.exitCode = 1;
    }
    if (flags.includes(entry.key)) {
      console.error(`legal_readonly exposed as editable flag: ${entry.key}`);
      process.exitCode = 1;
    }
  }

  const contract = await readFile(
    join(root, 'docs/framework/arch/ops-parameter-command-contract.md'),
    'utf8',
  );
  if (
    !contract.includes('legal_readonly=true') ||
    !contract.includes(
      'Linhas `legal_readonly` não são alteráveis pela API.',
    ) ||
    /\blegalReadonly\b/.test(contract)
  ) {
    console.error(
      'legal_readonly contract is missing or exposes an editable field',
    );
    process.exitCode = 1;
  }
}

if (process.argv.includes('--check-generated')) {
  const temp = await mkdtemp(join(tmpdir(), 'parameter-verify-'));
  const result = spawnSync(
    process.execPath,
    [
      join(root, 'tools/parameters/generate-seed.mjs'),
      '--source',
      sourceArg,
      '--out-dir',
      temp,
    ],
    { encoding: 'utf8' },
  );
  if (result.status !== 0) {
    console.error(result.stderr);
    process.exit(1);
  }
  for (const [index, path] of generated.entries()) {
    let actual;
    try {
      actual = await readFile(path, 'utf8');
    } catch {
      console.error(`generated missing: ${path}`);
      process.exitCode = 1;
      continue;
    }
    const expected = await readFile(
      join(
        temp,
        ['05-parameters.sql', 'parameter-catalogue.ts', 'parameter-flags.ts'][
          index
        ],
      ),
      'utf8',
    );
    if (actual !== expected) {
      console.error(`generated stale: ${path}`);
      process.exitCode = 1;
    }
  }
  await rm(temp, { recursive: true, force: true });
  await verifyLegalReadonly();
}
if (process.argv.includes('--check-usage')) {
  const target = resolve(sourceOption ?? root);
  const known = new Set(model.entries.map((entry) => entry.key));
  const prefixes = [
    'rait',
    'collection',
    'deadline',
    'session',
    'teat',
    'sync',
    'portal',
    'privacy',
    'est',
    'dashboard',
  ];
  let usageErrors = 0;

  function scriptKind(path) {
    if (path.endsWith('.tsx')) return ts.ScriptKind.TSX;
    if (path.endsWith('.jsx')) return ts.ScriptKind.JSX;
    if (path.endsWith('.ts')) return ts.ScriptKind.TS;
    return ts.ScriptKind.JS;
  }

  function propertyName(node) {
    if (ts.isIdentifier(node) || ts.isStringLiteralLike(node)) {
      return node.text;
    }
    return undefined;
  }

  function unwrapExpression(node) {
    let current = node;
    while (
      (ts.isParenthesizedExpression(current) ||
        ts.isAsExpression(current) ||
        ts.isTypeAssertionExpression(current) ||
        ts.isNonNullExpression(current) ||
        ts.isSatisfiesExpression(current)) &&
      current.expression
    ) {
      current = current.expression;
    }
    return current;
  }

  function expressionRoot(node) {
    let current = node;
    while (
      current.parent &&
      (ts.isParenthesizedExpression(current.parent) ||
        ts.isAsExpression(current.parent) ||
        ts.isTypeAssertionExpression(current.parent) ||
        ts.isNonNullExpression(current.parent) ||
        ts.isSatisfiesExpression(current.parent)) &&
      current.parent.expression === current
    ) {
      current = current.parent;
    }
    return current;
  }

  function isTypePropertyAccess(node) {
    const expression = unwrapExpression(node);
    return (
      ts.isPropertyAccessExpression(expression) &&
      expression.name.text === 'type'
    );
  }

  function isComparisonOperator(kind) {
    return [
      ts.SyntaxKind.EqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken,
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.LessThanToken,
      ts.SyntaxKind.LessThanEqualsToken,
      ts.SyntaxKind.GreaterThanToken,
      ts.SyntaxKind.GreaterThanEqualsToken,
    ].includes(kind);
  }

  function isExcludedContext(node) {
    const parent = node.parent;
    if (
      (ts.isPropertyAssignment(parent) || ts.isPropertyDeclaration(parent)) &&
      parent.initializer === node &&
      ['type', 'messageKey'].includes(propertyName(parent.name))
    ) {
      return true;
    }

    const root = expressionRoot(node);
    const comparison = root.parent;
    if (
      ts.isBinaryExpression(comparison) &&
      isComparisonOperator(comparison.operatorToken.kind)
    ) {
      const other =
        comparison.left === root ? comparison.right : comparison.left;
      return isTypePropertyAccess(other);
    }

    return false;
  }

  function verifyUsage(path, text) {
    const source = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      scriptKind(path),
    );
    const eventArgumentPositions = new Map();

    function callableName(node) {
      if (
        (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
        node.name
      ) {
        return propertyName(node.name);
      }
      return undefined;
    }

    function collectEventParameters(node) {
      const name = callableName(node);
      if (name && node.parameters) {
        const positions = node.parameters
          .map((parameter, index) =>
            ts.isIdentifier(parameter.name) &&
            ['type', 'eventType', 'topic'].includes(parameter.name.text)
              ? index
              : undefined,
          )
          .filter((index) => index !== undefined);
        if (positions.length) {
          const knownPositions = eventArgumentPositions.get(name) ?? new Set();
          for (const position of positions) knownPositions.add(position);
          eventArgumentPositions.set(name, knownPositions);
        }
      }
      ts.forEachChild(node, collectEventParameters);
    }

    collectEventParameters(source);

    function isEventArgument(node) {
      if (!ts.isCallExpression(node.parent)) return false;
      const call = node.parent;
      const index = call.arguments.indexOf(node);
      const expression = unwrapExpression(call.expression);
      const name = ts.isIdentifier(expression)
        ? expression.text
        : ts.isPropertyAccessExpression(expression)
          ? expression.name.text
          : undefined;
      return (
        name !== undefined &&
        index >= 0 &&
        eventArgumentPositions.get(name)?.has(index) === true
      );
    }

    function isEventCollectionPush(node) {
      if (!ts.isCallExpression(node.parent)) return false;
      const callTarget = unwrapExpression(node.parent.expression);
      if (
        !ts.isPropertyAccessExpression(callTarget) ||
        callTarget.name.text !== 'push'
      ) {
        return false;
      }
      const collection = unwrapExpression(callTarget.expression);
      return (
        ts.isPropertyAccessExpression(collection) &&
        ['events', 'audits'].includes(collection.name.text)
      );
    }

    function visit(node) {
      if (
        ts.isStringLiteralLike(node) &&
        !isExcludedContext(node) &&
        !isEventArgument(node) &&
        !isEventCollectionPush(node)
      ) {
        const literal = node.text;
        const parts = literal.split('.');
        if (
          !known.has(literal) &&
          parts.length >= 3 &&
          prefixes.includes(parts[0])
        ) {
          usageErrors += 1;
          const { line } = source.getLineAndCharacterOfPosition(
            node.getStart(source),
          );
          console.error(
            `${path}:${line + 1}: unknown parameter literal ${literal}`,
          );
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(source);
  }

  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      if (['tests', 'dist', 'node_modules'].includes(item.name)) continue;
      const path = join(dir, item.name);
      if (item.isDirectory()) await walk(path);
      else if (/\.(?:ts|js|mjs|tsx|jsx)$/.test(item.name)) {
        const text = await readFile(path, 'utf8');
        verifyUsage(path, text);
      }
    }
  }
  if ((await stat(target)).isDirectory()) await walk(target);
  else {
    const text = await readFile(target, 'utf8');
    verifyUsage(target, text);
  }
  if (usageErrors) process.exitCode = 1;
}
if (!process.exitCode)
  console.log(
    `verify:parameter-catalogue: OK (${model.entries.length} entries, ${model.entries.filter((entry) => entry.value_type === 'F').length} flags, 0 errors)`,
  );
