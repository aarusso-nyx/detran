#!/usr/bin/env node
// Gate for the hand-written `*.commands.openapi.json` command contracts
// (WP-T3, CTG-0005 §3). Checks each contract file for shape (§3.3 rule 1),
// resolves `x-blueprint` against `docs/framework/blueprints/` (rule 2), and
// cross-checks the routes it documents against the handwritten controllers
// that are actually mounted (rules 5/6), the error codes it enumerates
// against their prefix-specific error catalogues (rule 3), and `operationId` uniqueness
// (rule 4). Molde: `tools/parameters/verify.mjs` (CLI shape) and
// `tools/verify-controller-decorators.ts` (AST scan technique).
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const root = process.cwd();

export const CONTROLLER_ROOTS = [
  'backend/domains/inf/ait/src',
  'backend/domains/inf/normative/src',
  'backend/domains/inf/measures/src',
  'backend/domains/inf/alcohol/src',
  'backend/domains/ops/field/src/handwritten',
  'backend/domains/ops/offline-sync/src/handwritten',
  'backend/domains/ops/provisioning/src/handwritten',
  'backend/domains/ops/evidence/src/handwritten',
  'backend/domains/ops/snapshots/src/handwritten',
  // R-0009 (WP-P3, CTG-0002 §14 / plan.md A4(e)): the five Portal packages
  // mount hand-written citizen routes only (`operations: []`, M1).
  'backend/domains/portal/identity/src/handwritten',
  'backend/domains/portal/requests/src/handwritten',
  'backend/domains/portal/inbox/src/handwritten',
  'backend/domains/portal/citizen-service/src/handwritten',
  'backend/domains/portal/projections/src/handwritten',
  // R-0010 (WP-B2/B3): the BOAT command controller is hand-written under the
  // module source root. `findFilesBelow` deliberately skips generated and
  // legacy controller directories below this root.
  'backend/domains/est/crash/src',
  'backend/app/src',
];

// Error catalogues whose codes a command contract may enumerate (rule 3):
// TEAT (R-0008), PORTAL (R-0009), and BOAT (R-0010). `catalogPath`
// (singular) remains the test seam; when it is the default, every catalogue
// below is read independently by prefix.
export const ERROR_CATALOG_PATHS = [
  'docs/framework/arch/teat-error-catalog.md',
  'docs/framework/arch/portal-error-catalog.md',
  'docs/framework/arch/boat-error-catalog.md',
];

const ERROR_CATALOG_PREFIXES = new Map([
  ['teat-error-catalog.md', 'TEAT'],
  ['portal-error-catalog.md', 'PORTAL'],
  ['boat-error-catalog.md', 'BOAT'],
]);

// Único e nomeado (CTG-0005 §2.6, §3.2): `SpeedModule` só monta atrás da
// flag `teat.speed_meters` (default false, seed 05); a rota não está
// montada e por isso fica fora da varredura. Retirar quando a flag virar
// `true` (mesmo PR que cria BP-INF-SPEED-001.commands.openapi.json).
export const FLAG_GATED_CONTROLLERS = [
  'backend/domains/inf/speed/src/handwritten/speed-commands.controller.ts',
];

const ROUTE_DECORATORS = new Set([
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'All',
  'Head',
  'Options',
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function relFromRoot(absolute) {
  return toPosix(path.relative(root, absolute));
}

function normalizeRoute(base, sub) {
  const joined = [base, sub]
    .map((segment) => segment.replace(/^\/+|\/+$/gu, ''))
    .filter((segment) => segment.length > 0)
    .join('/');
  return `/${joined}`.replace(/:([A-Za-z0-9_]+)/gu, '{$1}');
}

function decoratorsOf(node) {
  return ts.canHaveDecorators(node) ? (ts.getDecorators(node) ?? []) : [];
}

function decoratorInfo(decorator) {
  const expression = decorator.expression;
  const isCall = ts.isCallExpression(expression);
  const callee = isCall ? expression.expression : expression;
  const name = ts.isIdentifier(callee)
    ? callee.text
    : ts.isPropertyAccessExpression(callee)
      ? callee.name.text
      : undefined;
  const args = isCall ? expression.arguments : [];
  return { name, args };
}

function findFilesBelow(directory) {
  if (!fs.existsSync(directory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (
        entry.name === 'controllers' ||
        entry.name === 'generated' ||
        entry.name === 'tests'
      )
        continue;
      results.push(...findFilesBelow(path.join(directory, entry.name)));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.controller.ts')) continue;
    if (entry.name.includes('.spec.')) continue;
    results.push(path.join(directory, entry.name));
  }
  return results;
}

/**
 * Scans `controllerRoots` (repo-relative or absolute) for `@Controller`
 * classes and route-decorated methods, returning the normalized route
 * surface (CTG-0005 §3.2). A route whose decorator argument is present but
 * not a string literal is reported as a `problems` entry with kind
 * `invalid-json` (fail-closed: the surface is not derivable from source).
 */
export function scanControllers(controllerRoots) {
  const routes = [];
  const problems = [];
  const flagGated = new Set(
    FLAG_GATED_CONTROLLERS.map((entry) => toPosix(path.resolve(root, entry))),
  );
  for (const rawRoot of controllerRoots) {
    const absoluteRoot = path.isAbsolute(rawRoot)
      ? rawRoot
      : path.resolve(root, rawRoot);
    const isAppSrc =
      toPosix(absoluteRoot) === toPosix(path.resolve(root, 'backend/app/src'));
    for (const file of findFilesBelow(absoluteRoot)) {
      // App-level composition controllers: TEAT (R-0008) and Portal (R-0009,
      // `portal-stream.controller.ts`); everything else under backend/app/src
      // (PEC webhooks, runtime) is documented elsewhere.
      if (
        isAppSrc &&
        !path.basename(file).startsWith('teat-') &&
        !path.basename(file).startsWith('portal-')
      )
        continue;
      if (flagGated.has(toPosix(file))) continue;
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      source.forEachChild((node) => {
        if (!ts.isClassDeclaration(node)) return;
        const classDecorators = decoratorsOf(node);
        const controllerDecorator = classDecorators.find(
          (decorator) => decoratorInfo(decorator).name === 'Controller',
        );
        if (!controllerDecorator) return;
        const { args: controllerArgs } = decoratorInfo(controllerDecorator);
        let base = '';
        if (controllerArgs.length > 0) {
          if (!ts.isStringLiteralLike(controllerArgs[0])) {
            problems.push({
              kind: 'invalid-json',
              file: relFromRoot(file),
              detail: `rota não estática em ${node.name?.text ?? '<anonymous>'} (decorador @Controller); a superfície não é derivável do código-fonte`,
            });
            return;
          }
          base = controllerArgs[0].text;
        }
        const className = node.name?.text ?? '<anonymous>';
        for (const member of node.members) {
          if (!ts.isMethodDeclaration(member)) continue;
          const methodDecorators = decoratorsOf(member);
          const routeDecorator = methodDecorators.find((decorator) =>
            ROUTE_DECORATORS.has(decoratorInfo(decorator).name ?? ''),
          );
          if (!routeDecorator) continue;
          const { name: decoratorName, args: routeArgs } =
            decoratorInfo(routeDecorator);
          const methodName = member.name.getText(source);
          const line =
            source.getLineAndCharacterOfPosition(member.name.getStart(source))
              .line + 1;
          let sub = '';
          if (routeArgs.length > 0) {
            if (!ts.isStringLiteralLike(routeArgs[0])) {
              problems.push({
                kind: 'invalid-json',
                file: relFromRoot(file),
                detail: `rota não estática em ${className}.${methodName}; a superfície não é derivável do código-fonte`,
              });
              continue;
            }
            sub = routeArgs[0].text;
          }
          routes.push({
            method: (decoratorName ?? '').toUpperCase(),
            path: normalizeRoute(base, sub),
            file: relFromRoot(file),
            line,
          });
        }
      });
    }
  }
  return { routes, problems };
}

/**
 * Todo código catalogado em `catalogPath` (crases ou prosa), como um Set.
 *
 * The optional prefix keeps the public single-file test seam intact while
 * allowing the real gate to load each authoritative catalogue independently.
 */
export function parseErrorCatalog(catalogPath, prefix = undefined) {
  const text = fs.readFileSync(catalogPath, 'utf8');
  const codes = new Set();
  const expression = prefix
    ? new RegExp(`${prefix}\\.[A-Z0-9_]+`, 'gu')
    : /(?:TEAT|PORTAL|BOAT)\.[A-Z0-9_]+/gu;
  for (const match of text.matchAll(expression)) codes.add(match[0]);
  return codes;
}

/** União dos catálogos existentes entre `paths` (public compatibility seam). */
export function parseErrorCatalogs(paths) {
  const codes = new Set();
  for (const candidate of paths) {
    if (!fs.existsSync(candidate)) continue;
    for (const code of parseErrorCatalog(candidate)) codes.add(code);
  }
  return codes;
}

function parseErrorCatalogsByPrefix(paths) {
  const catalogs = new Map([
    ['TEAT', new Set()],
    ['PORTAL', new Set()],
    ['BOAT', new Set()],
  ]);
  for (const candidate of paths) {
    if (!fs.existsSync(candidate)) continue;
    const prefix = ERROR_CATALOG_PREFIXES.get(path.basename(candidate));
    if (!prefix) continue;
    catalogs.set(prefix, parseErrorCatalog(candidate, prefix));
  }
  return catalogs;
}

function parseSingleCatalogByPrefix(catalogPath) {
  return new Map(
    ['TEAT', 'PORTAL', 'BOAT'].map((prefix) => [
      prefix,
      parseErrorCatalog(catalogPath, prefix),
    ]),
  );
}

function errorSchemaEnumsIn(document) {
  // Toda resposta 4xx/5xx com schema de erro inline (§1.2 item 8), e todo
  // `enum` de uma propriedade `error_code` em qualquer schema do documento
  // (recibos de sincronização por item, §2.2/§3.3 regra 3b).
  const found = [];
  const visitSchemaForErrorCode = (schema, pathLabel) => {
    if (!schema || typeof schema !== 'object') return;
    if (
      schema.properties &&
      typeof schema.properties === 'object' &&
      schema.properties.error_code &&
      Array.isArray(schema.properties.error_code.enum)
    ) {
      found.push({
        enum: schema.properties.error_code.enum,
        label: `${pathLabel} propriedade error_code`,
        exempt: false,
      });
    }
    for (const [key, value] of Object.entries(schema.properties ?? {})) {
      visitSchemaForErrorCode(value, `${pathLabel}.${key}`);
    }
    if (schema.items) visitSchemaForErrorCode(schema.items, `${pathLabel}[]`);
  };
  for (const [routePath, methods] of Object.entries(document.paths ?? {})) {
    if (!methods || typeof methods !== 'object') continue;
    for (const [method, operation] of Object.entries(methods)) {
      if (!operation || typeof operation !== 'object' || !operation.operationId)
        continue;
      for (const [status, response] of Object.entries(
        operation.responses ?? {},
      )) {
        const numericStatus = Number(status);
        const schema =
          response?.content?.['application/json']?.schema ?? undefined;
        if (numericStatus >= 400) {
          const enumValues = schema?.properties?.code?.enum;
          const isIdempotencyKernel = response?.['x-kernel'] === 'idempotency';
          if (!Array.isArray(enumValues)) {
            if (!isIdempotencyKernel) {
              found.push({
                enum: [],
                missing: true,
                label: `${operation.operationId} resposta ${status}`,
              });
            }
            continue;
          }
          found.push({
            enum: enumValues,
            label: `${operation.operationId} resposta ${status}`,
          });
        }
        if (schema) visitSchemaForErrorCode(schema, `${routePath} ${method}`);
      }
      for (const [name, schema] of Object.entries(
        document.components?.schemas ?? {},
      )) {
        visitSchemaForErrorCode(schema, `components.schemas.${name}`);
      }
    }
  }
  return found;
}

/**
 * Lê todo `*.commands.openapi.json` de `contractsDir` (arquivos sem o
 * sufixo `.commands` são ignorados — são saída do gerador, §0). Valida a
 * forma mínima (regra 1) e o `x-blueprint` (regra 2), e devolve as
 * operações válidas junto com os problemas encontrados nesse primeiro
 * passo.
 */
export function collectOperations(
  contractsDir,
  blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
) {
  const problems = [];
  const operations = [];
  if (!fs.existsSync(contractsDir)) return { operations, problems };
  const files = fs
    .readdirSync(contractsDir)
    .filter((name) => name.endsWith('.commands.openapi.json'))
    .sort();
  const blueprintIds = new Set(
    fs.existsSync(blueprintsDir)
      ? fs
          .readdirSync(blueprintsDir)
          .filter((name) => name.endsWith('.json'))
          .map((name) => name.slice(0, -'.json'.length))
      : [],
  );
  for (const name of files) {
    const filePath = path.join(contractsDir, name);
    const relFile = relFromRoot(filePath);
    const raw = fs.readFileSync(filePath, 'utf8');
    let document;
    try {
      document = JSON.parse(raw);
    } catch {
      problems.push({
        kind: 'invalid-json',
        file: relFile,
        detail: `${name} não é JSON válido`,
      });
      continue;
    }
    const info = document.info;
    const shapeProblem = (() => {
      if (!info) return 'documento sem info';
      if (!info['x-blueprint']) return 'info.x-blueprint ausente';
      if (info['x-commands'] !== true) return 'info.x-commands !== true';
      if (info['x-generated'] !== undefined)
        return 'info.x-generated presente (marcador de arquivo gerado)';
      if (typeof info.version !== 'string' || info.version.length === 0)
        return 'info.version ausente ou vazia';
      if (!document.paths || typeof document.paths !== 'object')
        return 'documento sem paths, ou paths não é objeto';
      return null;
    })();
    if (shapeProblem) {
      problems.push({
        kind: 'invalid-json',
        file: relFile,
        detail: shapeProblem,
      });
      continue;
    }
    if (!blueprintIds.has(info['x-blueprint'])) {
      problems.push({
        kind: 'unknown-blueprint',
        file: relFile,
        detail: `x-blueprint ${info['x-blueprint']} não existe em docs/framework/blueprints`,
      });
      continue;
    }
    for (const [routePath, methods] of Object.entries(document.paths)) {
      if (!methods || typeof methods !== 'object') continue;
      for (const [method, operation] of Object.entries(methods)) {
        if (!operation || typeof operation !== 'object') continue;
        if (!operation.operationId) continue;
        operations.push({
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path: routePath,
          file: relFile,
          document,
          operation,
        });
      }
    }
  }
  return { operations, problems };
}

/**
 * Confere os `*.commands.openapi.json` contra os controladores
 * manuscritos montados e o catálogo de erros (CTG-0005 §3).
 */
export function checkCommands({
  contractsDir = path.resolve(root, 'docs/framework/contracts'),
  controllerRoots = CONTROLLER_ROOTS,
  catalogPath = undefined,
  blueprintsDir = path.resolve(root, 'docs/framework/blueprints'),
} = {}) {
  const problems = [];

  // 1 + 2: forma e x-blueprint, por arquivo.
  const { operations, problems: shapeProblems } = collectOperations(
    contractsDir,
    blueprintsDir,
  );
  problems.push(...shapeProblems);

  // 3: códigos de erro fora do catálogo.
  const catalogs = catalogPath
    ? fs.existsSync(catalogPath)
      ? parseSingleCatalogByPrefix(catalogPath)
      : new Map([
          ['TEAT', new Set()],
          ['PORTAL', new Set()],
          ['BOAT', new Set()],
        ])
    : parseErrorCatalogsByPrefix(
        ERROR_CATALOG_PATHS.map((entry) => path.resolve(root, entry)),
      );
  const seenUnknown = new Set();
  for (const entry of operations) {
    for (const found of errorSchemaEnumsIn(entry.document)) {
      if (found.missing) {
        const key = `missing:${found.label}`;
        if (seenUnknown.has(key)) continue;
        seenUnknown.add(key);
        problems.push({
          kind: 'unknown-error-code',
          file: entry.file,
          detail: `${found.label}: resposta sem properties.code.enum`,
        });
        continue;
      }
      for (const code of found.enum) {
        const prefix = typeof code === 'string' ? code.split('.', 1)[0] : '';
        if (catalogs.get(prefix)?.has(code)) continue;
        const key = `${entry.file}:${found.label}:${code}`;
        if (seenUnknown.has(key)) continue;
        seenUnknown.add(key);
        problems.push({
          kind: 'unknown-error-code',
          file: entry.file,
          detail: `${found.label}: código ${code} não está no catálogo de erros do prefixo ${prefix || '<ausente>'}`,
        });
      }
    }
  }

  // 4: operationId duplicado.
  const byOperationId = new Map();
  for (const entry of operations) {
    if (!byOperationId.has(entry.operationId))
      byOperationId.set(entry.operationId, []);
    byOperationId.get(entry.operationId).push(entry);
  }
  for (const [operationId, entries] of byOperationId) {
    const files = [...new Set(entries.map((entry) => entry.file))];
    if (entries.length <= 1) continue;
    const [fileA, fileB] = files.length > 1 ? files : [files[0], files[0]];
    problems.push({
      kind: 'duplicate-operation-id',
      file: fileA,
      detail: `${operationId} aparece em ${fileA} e ${fileB}`,
    });
  }

  // Varredura dos controladores manuscritos montados.
  const { routes: scannedRoutes, problems: scanProblems } =
    scanControllers(controllerRoots);
  problems.push(...scanProblems);

  const routeKey = (method, routePath) => `${method} ${routePath}`;
  const scannedKeys = new Map();
  for (const route of scannedRoutes) {
    const key = routeKey(route.method, route.path);
    if (!scannedKeys.has(key)) scannedKeys.set(key, []);
    scannedKeys.get(key).push(route);
  }
  const operationKeys = new Set(
    operations.map((entry) => routeKey(entry.method, entry.path)),
  );

  // 5: contrato → código.
  const seenMissingRoute = new Set();
  for (const entry of operations) {
    const key = routeKey(entry.method, entry.path);
    if (scannedKeys.has(key)) continue;
    if (seenMissingRoute.has(key)) continue;
    seenMissingRoute.add(key);
    problems.push({
      kind: 'missing-route',
      file: entry.file,
      detail: `${entry.operationId} (${entry.method} ${entry.path}) não tem controlador manuscrito montado`,
    });
  }

  // 6: código → contrato.
  for (const route of scannedRoutes) {
    const key = routeKey(route.method, route.path);
    if (operationKeys.has(key)) continue;
    problems.push({
      kind: 'missing-operation',
      file: route.file,
      detail: `${route.method} ${route.path} (${route.file}:${route.line}) não tem operação em nenhum *.commands.openapi.json`,
    });
  }

  return { ok: problems.length === 0, operations: operations.length, problems };
}

function parseCliArgs(argv) {
  const options = {};
  const controllerRoots = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--contracts-dir') options.contractsDir = argv[++i];
    else if (arg === '--controllers') controllerRoots.push(argv[++i]);
    else if (arg === '--catalog') options.catalogPath = argv[++i];
    else if (arg === '--blueprints') options.blueprintsDir = argv[++i];
  }
  if (controllerRoots.length > 0) options.controllerRoots = controllerRoots;
  return options;
}

function runCli() {
  const options = parseCliArgs(process.argv.slice(2));
  const result = checkCommands(options);
  if (result.ok) {
    process.stdout.write(
      `commands contracts: OK (${result.operations} operations)\n`,
    );
    process.exit(0);
  }
  for (const problem of result.problems) {
    process.stderr.write(
      `${problem.kind}: ${problem.file} — ${problem.detail}\n`,
    );
  }
  process.exit(1);
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) runCli();
