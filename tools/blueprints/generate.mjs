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
  if (type === 'bool') return 'boolean';
  if (type === 'int') return 'number';
  if (type === 'jsonb') return 'Record<string, unknown>';
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
      : [{ name: 'created_at', type: 'timestamptz' }]),
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
    `  constraint pk_${entity.table} primary key (${entity.primaryKey.join(', ')})`,
    ');',
    ...indexes.map(
      (i) =>
        `create ${i.unique ? 'unique ' : ''}index if not exists ${i.unique ? 'ux' : 'ix'}_${entity.table}_${i.columns.join('_')} on ${module.namespace}.${entity.table} (${i.columns.join(', ')});`,
    ),
  ].join('\n');
}
function dto(bp, sha, entity) {
  const fields = entity.fields.filter(
    (f) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(f.name),
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
  return `${header(bp, sha)}\nimport { Injectable } from '@nestjs/common';\nimport { withTenantContext } from '@detran/shared';\n\n/** Database port intentionally has no optional or in-memory implementation. */\nexport interface ${module.name}Database { tx<T>(work: (transaction: unknown) => Promise<T>, options: { role: 'app' }): Promise<T>; }\nexport interface ${module.name}RequestContext { hasActiveContext(): boolean; snapshot(): { tenantId?: string; actorId?: string }; }\n\n@Injectable()\nexport class ${name} {\n  constructor(private readonly database: ${module.name}Database, private readonly requestContext: ${module.name}RequestContext) {}\n\n  findAll(): Promise<unknown[]> { return withTenantContext(this.database as never, this.requestContext as never, async (tx) => (await (tx as { query(sql: string): Promise<{ rows: unknown[] }> }).query('select * from ${module.namespace}.${entity.table} order by created_at desc limit 500')).rows); }\n}`;
}
function service(bp, sha, entity) {
  return `${header(bp, sha)}\nimport { Injectable } from '@nestjs/common';\nimport { ${entity.name}Repository } from '../repositories/${kebab(entity.name)}.repository.js';\nimport type { ${entity.name} } from '../entities/${kebab(entity.name)}.entity.js';\nimport type { Create${entity.name}Dto } from '../dto/create-${kebab(entity.name)}.dto.js';\n\n@Injectable()\nexport class ${entity.name}Service {\n  constructor(private readonly repository: ${entity.name}Repository) {}\n  findAll(): Promise<unknown[]> { return this.repository.findAll(); }\n  create(_dto: Create${entity.name}Dto): Promise<${entity.name}> { throw new Error('create is generated as a domain port and must be implemented with a tenant transaction'); }\n}`;
}
function controller(bp, sha, entity, module) {
  const resource = `${module.namespace}:${kebab(entity.name)}`;
  return `${header(bp, sha)}\nimport { Controller, Get } from '@nestjs/common';\nimport { Action, Resource } from '@detran/shared';\nimport { ${entity.name}Service } from '../services/${kebab(entity.name)}.service.js';\n\n@Controller('${kebab(entity.name)}')\n@Resource('${resource}')\nexport class ${entity.name}Controller {\n  constructor(private readonly service: ${entity.name}Service) {}\n  @Get()\n  @Action('read')\n  list() { return this.service.findAll(); }\n}`;
}
function moduleFile(bp, sha, module, entities) {
  return `${header(bp, sha)}\nimport { Module } from '@nestjs/common';\n${entities.map((e) => `import { ${e.name}Controller } from './controllers/${kebab(e.name)}.controller.js';\nimport { ${e.name}Service } from './services/${kebab(e.name)}.service.js';\nimport { ${e.name}Repository } from './repositories/${kebab(e.name)}.repository.js';`).join('\n')}\n\n@Module({ controllers: [${entities.map((e) => `${e.name}Controller`).join(', ')}], providers: [${entities.flatMap((e) => [`${e.name}Service`, `${e.name}Repository`]).join(', ')}] })\nexport class ${pascal(module.name)}Module {}`;
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
        dependencies: {
          '@detran/shared': 'workspace:*',
          '@nestjs/common': '^11.1.28',
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
  const ddl = [
    `${header(bp, sha, true)}`,
    `-- Regenerable-only DDL for ${bp.id}; request-path writes use role_app_backend.`,
    `create schema if not exists ${module.namespace};`,
    ...entities.map((e) => tableSql(module, e)),
    ...entities.map(
      (e) =>
        `select auth.create_rls_policy('${module.namespace}', '${e.table}');`,
    ),
  ].join('\n\n');
  write(
    `backend/database/ddl/30-${module.namespace}-${kebab(module.name)}.sql`,
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
