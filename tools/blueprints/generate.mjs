#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.resolve(
  root,
  process.env.BLUEPRINTS_DIR ?? 'docs/framework/blueprints',
);
const outputDir = path.resolve(root, process.env.BLUEPRINTS_OUTPUT ?? '.');
const checkMode = process.argv.includes('--check');
const generatedTargets = new Set();

const files = fs
  .readdirSync(sourceDir)
  .filter((name) => /^BP-[A-Z0-9-]+\.json$/u.test(name))
  .sort();
if (files.length === 0)
  throw new Error(`No blueprint files found in ${sourceDir}`);

function readBlueprint(name) {
  const file = path.join(sourceDir, name);
  const raw = fs.readFileSync(file);
  const bp = JSON.parse(raw);
  if (
    bp.schemaVersion !== '1.0.0' ||
    !bp.id ||
    !bp.module?.namespace ||
    !Array.isArray(bp.database?.entities)
  ) {
    throw new Error(`${name}: invalid module-blueprint shape`);
  }
  const sha = crypto.createHash('sha256').update(raw).digest('hex');
  return { bp, sha };
}

function kebab(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
    .replace(/[^A-Za-z0-9]+/gu, '-')
    .toLowerCase();
}
function pascal(value) {
  return value
    .split(/[^A-Za-z0-9]+/u)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}
function tsType(type) {
  if (
    type === 'uuid' ||
    type === 'text' ||
    type.startsWith('varchar') ||
    type === 'date' ||
    type === 'timestamptz'
  )
    return 'string';
  if (type === 'bool' || type === 'boolean') return 'boolean';
  if (/^(int|integer|bigint|numeric|decimal)/u.test(type)) return 'number';
  if (type === 'jsonb') return 'Record<string, unknown>';
  if (/^geometry/u.test(type)) return 'unknown';
  return 'unknown';
}
function header(bp, sha, sql = false) {
  return `${sql ? '--' : '//'} Generated from ${bp.id} v${bp.module.version} sha256:${sha}`;
}
function write(target, content) {
  generatedTargets.add(target);
  const file = path.join(outputDir, target);
  if (checkMode) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let output = `${content.trimEnd()}\n`;
  if (/\.(json|mjs|ts)$/u.test(target)) {
    const formatted = spawnSync(
      'pnpm',
      ['exec', 'prettier', '--stdin-filepath', target],
      { cwd: root, input: output, encoding: 'utf8' },
    );
    if (formatted.status !== 0)
      throw new Error(`Unable to format ${target}: ${formatted.stderr}`);
    output = formatted.stdout;
  }
  fs.writeFileSync(file, output);
}
function entityFields(entity) {
  return [
    ...entity.fields,
    ...(entity.fields.some((f) => f.name === 'created_at')
      ? []
      : [{ name: 'created_at', type: 'timestamptz', default: 'now()' }]),
    ...(entity.fields.some((f) => f.name === 'updated_at')
      ? []
      : [{ name: 'updated_at', type: 'timestamptz', nullable: true }]),
  ];
}
function tableSql(module, entity) {
  const fields = entityFields(entity);
  const columns = fields.map(
    (field) =>
      `  ${field.name} ${field.type}${field.default === undefined ? '' : ` default ${field.default}`}${field.nullable ? '' : ' not null'}`,
  );
  const indexes = [...(entity.indexes ?? [])];
  for (const field of fields.filter(
    (f) =>
      f.name.endsWith('_id') &&
      !indexes.some((i) => i.columns.join() === f.name),
  ))
    indexes.push({ columns: [field.name] });
  return [
    `create table if not exists ${module.namespace}.${entity.table} (`,
    `${columns.join(',\n')},`,
    `  constraint pk_${entity.table} primary key (${entity.primaryKey.join(', ')})${(entity.checks ?? []).map((check) => `,\n  constraint ${check.name} check (${check.expression})`).join('')}${(entity.foreignKeys ?? []).map((foreignKey) => `,\n  constraint ${foreignKey.name} foreign key (${foreignKey.columns.join(', ')}) references ${foreignKey.references.table} (${foreignKey.references.columns.join(', ')})`).join('')}`,
    ');',
    ...indexes.map(
      (i) =>
        `create ${i.unique ? 'unique ' : ''}index if not exists ${i.name ?? `${i.unique ? 'ux' : 'ix'}_${entity.table}_${i.columns.join('_')}`} on ${module.namespace}.${entity.table}${i.method ? ` using ${i.method}` : ''} (${i.columns.join(', ')})${i.where ? ` where ${i.where}` : ''};`,
    ),
  ].join('\n');
}
function dto(bp, sha, entity) {
  const fields = entity.fields.filter(
    (f) =>
      f.writable !== false &&
      !['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at'].includes(
        f.name,
      ),
  );
  return `${header(bp, sha)}\nexport interface Create${entity.name}Dto {\n${fields.map((f) => `  ${f.name}${f.nullable || f.default !== undefined ? '?' : ''}: ${tsType(f.type)}${f.nullable ? ' | null' : ''};`).join('\n')}\n}`;
}
function entity(bp, sha, item) {
  return `${header(bp, sha)}\nexport interface ${item.name} {\n${entityFields(
    item,
  )
    .map(
      (f) =>
        `  ${f.name}${f.nullable ? '?' : ''}: ${tsType(f.type)}${f.nullable ? ' | null' : ''};`,
    )
    .join('\n')}\n}`;
}
function repository(bp, sha, entity, module) {
  const name = `${entity.name}Repository`;
  const dtoName = `Create${entity.name}Dto`;
  const writable = entity.fields
    .filter(
      (field) =>
        field.writable !== false &&
        !['id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at'].includes(
          field.name,
        ),
    )
    .map((field) => `'${field.name}'`)
    .join(', ');
  return [
    header(bp, sha),
    `import { Injectable, NotFoundException } from '@nestjs/common';`,
    `import { RequestContext } from '@stynx-nyx/core';`,
    `import { Database, type Transaction } from '@stynx-nyx/data';`,
    `import { withTenantContext } from '@detran/shared';`,
    `import type { ${dtoName} } from '../dto/create-${kebab(entity.name)}.dto.js';`,
    `import type { ${entity.name} } from '../entities/${kebab(entity.name)}.entity.js';`,
    '',
    `type SqlTransaction = Transaction & { query<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: readonly unknown[]): Promise<{ rows: T[] }> };`,
    `const WRITABLE_FIELDS = new Set<string>([${writable}]);`,
    '',
    '/** SQL-only repository. Tenant identity is injected by the kernel trigger. */',
    '@Injectable()',
    `export class ${name} {`,
    `  constructor(private readonly database: Database, private readonly requestContext: RequestContext) {}`,
    `  transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> { return withTenantContext(this.database, this.requestContext, work); }`,
    `  findAll(transaction?: Transaction): Promise<${entity.name}[]> { return this.execute(transaction, async (tx) => (await tx.query<${entity.name} & Record<string, unknown>>('select * from ${module.namespace}.${entity.table} order by created_at desc limit 500')).rows); }`,
    `  async findOne(id: string, transaction?: Transaction): Promise<${entity.name}> { const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>('select * from ${module.namespace}.${entity.table} where id = $1 limit 1', [id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
    `  create(dto: ${dtoName}, transaction?: Transaction): Promise<${entity.name}> { return this.write('insert', undefined, dto, transaction); }`,
    `  update(id: string, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { return this.write('update', id, dto, transaction); }`,
    `  async remove(id: string, transaction?: Transaction): Promise<void> { const result = await this.execute(transaction, (tx) => tx.query('delete from ${module.namespace}.${entity.table} where id = $1 returning id', [id])); if (!result.rows[0]) throw new NotFoundException('${entity.name} ' + id + ' not found'); }`,
    `  private async write(operation: 'insert' | 'update', id: string | undefined, dto: Partial<${dtoName}>, transaction?: Transaction): Promise<${entity.name}> { const entries = Object.entries(dto).filter(([, value]) => value !== undefined); if (!entries.length || entries.some(([field]) => !WRITABLE_FIELDS.has(field))) throw new Error('Invalid ${entity.name} write fields'); const columns = entries.map(([field]) => field); const values = entries.map(([, value]) => value); const insertSql = 'insert into ${module.namespace}.${entity.table} (' + columns.join(', ') + ') values (' + columns.map((_, index) => '$' + (index + 1)).join(', ') + ') returning *'; const updateSql = 'update ${module.namespace}.${entity.table} set ' + columns.map((field, index) => field + ' = $' + (index + 1)).join(', ') + ', updated_at = now() where id = $' + (columns.length + 1) + ' returning *'; const result = await this.execute(transaction, (tx) => tx.query<${entity.name} & Record<string, unknown>>(operation === 'insert' ? insertSql : updateSql, operation === 'insert' ? values : [...values, id])); const row = result.rows[0]; if (!row) throw new NotFoundException('${entity.name} ' + id + ' not found'); return row; }`,
    `  private execute<T>(transaction: Transaction | undefined, work: (transaction: SqlTransaction) => Promise<T>): Promise<T> { if (transaction) return work(transaction as SqlTransaction); return withTenantContext(this.database, this.requestContext, (tx) => work(tx as SqlTransaction)); }`,
    '}',
  ].join('\n');
}
function service(bp, sha, entity) {
  return `${header(bp, sha)}\nimport { Injectable } from '@nestjs/common';\nimport { ${entity.name}Repository } from '../repositories/${kebab(entity.name)}.repository.js';\nimport type { ${entity.name} } from '../entities/${kebab(entity.name)}.entity.js';\nimport type { Create${entity.name}Dto } from '../dto/create-${kebab(entity.name)}.dto.js';\n\n@Injectable()\nexport class ${entity.name}Service {\n  constructor(private readonly repository: ${entity.name}Repository) {}\n  findAll(): Promise<${entity.name}[]> { return this.repository.findAll(); }\n  findOne(id: string): Promise<${entity.name}> { return this.repository.findOne(id); }\n  create(dto: Create${entity.name}Dto): Promise<${entity.name}> { return this.repository.create(dto); }\n  update(id: string, dto: Partial<Create${entity.name}Dto>): Promise<${entity.name}> { return this.repository.update(id, dto); }\n  remove(id: string): Promise<void> { return this.repository.remove(id); }\n}`;
}
function controller(bp, sha, entity, module) {
  const api = (bp.api?.resources ?? []).find(
    (resource) => resource.entity === entity.name,
  );
  const operations = new Set(
    api?.operations ?? ['list', 'get', 'create', 'update', 'delete'],
  );
  const resource = `${module.namespace}:${api?.resource ?? kebab(entity.name)}`;
  const route = [
    String(bp.api?.basePath ?? '')
      .replace(/^\//u, '')
      .replace(/\/$/u, ''),
    String(api?.path ?? kebab(entity.name)).replace(/^\//u, ''),
  ]
    .filter(Boolean)
    .join('/');
  const methods = [
    operations.has('list')
      ? `  @Get() @Action('read') list() { return this.service.findAll(); }`
      : '',
    operations.has('get')
      ? `  @Get(':id') @Action('read') get(@Param('id') id: string) { return this.service.findOne(id); }`
      : '',
    operations.has('create')
      ? `  @Post() @Action('create') @Audit({ action: '${module.namespace.toUpperCase()}_${entity.table.toUpperCase()}_CREATE', entity: '${module.namespace}.${entity.table}' }) create(@Body() dto: Create${entity.name}Dto) { return this.service.create(dto); }`
      : '',
    operations.has('update')
      ? `  @Patch(':id') @Action('update') @Audit({ action: '${module.namespace.toUpperCase()}_${entity.table.toUpperCase()}_UPDATE', entity: '${module.namespace}.${entity.table}' }) update(@Param('id') id: string, @Body() dto: Partial<Create${entity.name}Dto>) { return this.service.update(id, dto); }`
      : '',
    operations.has('delete')
      ? `  @Delete(':id') @Action('delete') @Audit({ action: '${module.namespace.toUpperCase()}_${entity.table.toUpperCase()}_DELETE', entity: '${module.namespace}.${entity.table}' }) remove(@Param('id') id: string) { return this.service.remove(id); }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  return `${header(bp, sha)}\nimport { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';\nimport { Action, Audit, Resource } from '@detran/shared';\nimport type { Create${entity.name}Dto } from '../dto/create-${kebab(entity.name)}.dto.js';\nimport { ${entity.name}Service } from '../services/${kebab(entity.name)}.service.js';\n\n@Controller('${route}')\n@Resource('${resource}')\nexport class ${entity.name}Controller {\n  constructor(private readonly service: ${entity.name}Service) {}\n${methods}\n}`;
}
function moduleFile(bp, sha, module, entities) {
  const handwrittenControllers = module.handwrittenControllers ?? [];
  const handwrittenProviders = module.handwrittenProviders ?? [];
  const handwrittenImports = [
    ...handwrittenControllers,
    ...handwrittenProviders,
  ]
    .map(({ target, symbol }) => `import { ${symbol} } from './${target}.js';`)
    .join('\n');
  const controllers = [
    ...entities.map((entity) => `${entity.name}Controller`),
    ...handwrittenControllers.map(({ symbol }) => symbol),
  ];
  const providers = [
    ...entities.flatMap((entity) => [
      `${entity.name}Service`,
      `${entity.name}Repository`,
    ]),
    ...handwrittenProviders.map(({ symbol }) => symbol),
  ];
  return `${header(bp, sha)}\nimport { Module } from '@nestjs/common';\n${entities.map((e) => `import { ${e.name}Controller } from './controllers/${kebab(e.name)}.controller.js';\nimport { ${e.name}Service } from './services/${kebab(e.name)}.service.js';\nimport { ${e.name}Repository } from './repositories/${kebab(e.name)}.repository.js';`).join('\n')}\n${handwrittenImports}\n\n@Module({ controllers: [${controllers.join(', ')}], providers: [${providers.join(', ')}] })\nexport class ${pascal(module.name)}Module {}`;
}
function packageFiles(bp, sha, module, entities) {
  const base = `backend/domains/${module.namespace}/${kebab(module.name)}`;
  write(
    `${base}/package.json`,
    JSON.stringify(
      {
        name: `@detran/${module.namespace}-${kebab(module.name)}`,
        version: '0.0.1',
        private: true,
        type: 'module',
        main: './dist/index.js',
        types: './src/index.ts',
        exports: {
          '.': { types: './src/index.ts', default: './dist/index.js' },
        },
        scripts: {
          typecheck: 'tsc --noEmit',
          build: 'tsc -p tsconfig.build.json',
          test: 'vitest run --config vitest.config.ts',
          'test:unit':
            'DETRAN_TEST_TIER=unit vitest run --config vitest.config.ts',
          'test:integration':
            'DETRAN_TEST_TIER=integration vitest run --config vitest.config.ts',
          'test:e2e':
            'DETRAN_TEST_TIER=e2e vitest run --config vitest.config.ts',
          'test:real':
            'DETRAN_TEST_TIER=real vitest run --config vitest.config.ts',
        },
        dependencies: {
          '@detran/shared': 'workspace:*',
          ...(module.dependencies ?? {}),
          '@nestjs/common': '^11.1.28',
          '@stynx-nyx/core': '1.1.1',
          '@stynx-nyx/data': '1.1.1',
        },
        devDependencies: {
          '@types/node': '^24.10.1',
          typescript: '^6.0.3',
          vitest: '^4.1.7',
          ...(module.devDependencies ?? {}),
        },
      },
      null,
      2,
    ),
  );
  write(
    `${base}/src/${kebab(module.name)}.module.ts`,
    moduleFile(bp, sha, module, entities),
  );
  write(
    `${base}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2023',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          types: ['node', 'vitest/globals'],
        },
        include: ['src/**/*.ts', 'tests/**/*.ts', 'vitest.config.ts'],
      },
      null,
      2,
    ),
  );
  write(
    `${base}/tsconfig.build.json`,
    JSON.stringify(
      {
        extends: './tsconfig.json',
        compilerOptions: {
          noEmit: false,
          outDir: 'dist',
          rootDir: 'src',
          declaration: true,
        },
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.spec.ts', 'tests', 'vitest.config.ts'],
      },
      null,
      2,
    ),
  );
  write(
    `${base}/vitest.config.ts`,
    `import { fileURLToPath } from 'node:url';\nimport { defineConfig } from 'vitest/config';\nconst tier = process.env.DETRAN_TEST_TIER ?? 'unit';\nconst include: Record<string, string[]> = { unit: ['src/**/*.spec.ts', 'tests/unit/**/*.spec.ts'], integration: ['tests/integration/**/*.integration.spec.ts'], e2e: ['tests/e2e/**/*.e2e.spec.ts'], real: ['tests/real/**/*.real.spec.ts'] };\nexport default defineConfig({ resolve: { alias: { ${(module.testAliases ?? []).map((alias) => `'${alias.package}': fileURLToPath(new URL('${alias.target}', import.meta.url))`).join(', ')} } }, test: { environment: 'node', globals: true, include: include[tier], passWithNoTests: true, fileParallelism: false, testTimeout: tier === 'unit' ? 10000 : 30000 } });`,
  );
  for (const item of entities) {
    const k = kebab(item.name);
    write(`${base}/src/entities/${k}.entity.ts`, entity(bp, sha, item));
    write(`${base}/src/dto/create-${k}.dto.ts`, dto(bp, sha, item));
    write(
      `${base}/src/repositories/${k}.repository.ts`,
      repository(bp, sha, item, module),
    );
    write(`${base}/src/services/${k}.service.ts`, service(bp, sha, item));
    write(
      `${base}/src/controllers/${k}.controller.ts`,
      controller(bp, sha, item, module),
    );
  }
  write(
    `${base}/src/index.ts`,
    `${header(bp, sha)}\n${entities
      .map((item) => {
        const k = kebab(item.name);
        return `export * from './controllers/${k}.controller.js';\nexport * from './dto/create-${k}.dto.js';\nexport * from './entities/${k}.entity.js';\nexport * from './repositories/${k}.repository.js';\nexport * from './services/${k}.service.js';`;
      })
      .join(
        '\n',
      )}\nexport * from './${kebab(module.name)}.module.js';${(module.handwrittenExports ?? []).map((target) => `\nexport * from './${target}.js';`).join('')}`,
  );
  const ddl = [
    `${header(bp, sha, true)}`,
    `-- Regenerable-only DDL for ${bp.id}; request-path writes use role_app_backend.`,
    `create schema if not exists ${module.namespace};`,
    ...entities.map((e) => tableSql(module, e)),
    ...entities.map(
      (e) =>
        `select auth.create_rls_policy('${module.namespace}', '${e.table}');`,
    ),
    `select auth.install_tenant_triggers();`,
    `grant usage on schema ${module.namespace} to role_app_backend;`,
    `grant select, insert, update, delete on all tables in schema ${module.namespace} to role_app_backend;`,
    `grant usage, select on all sequences in schema ${module.namespace} to role_app_backend;`,
  ].join('\n\n');
  write(
    `backend/database/ddl/${module.ddlFile ?? `30-${module.namespace}-${kebab(module.name)}.sql`}`,
    ddl,
  );
}
for (const name of files) {
  const { bp, sha } = readBlueprint(name);
  packageFiles(bp, sha, bp.module, bp.database.entities);
}
write(
  'tools/blueprints/generated-files.json',
  JSON.stringify([...generatedTargets].sort(), null, 2),
);
if (checkMode) process.stdout.write('blueprint generation is deterministic\n');
