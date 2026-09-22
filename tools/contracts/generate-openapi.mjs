#!/usr/bin/env node
// Derives the REST contract of every module blueprint. The generated controller
// surface (list/get/create/update/delete per resource) is the single source of
// truth; this file must never be hand-edited. Run `pnpm contracts:openapi`.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceDir = path.resolve(root, 'docs/framework/blueprints');
const outputDir = path.resolve(root, 'docs/framework/contracts');
const checkMode = process.argv.includes('--check');

function tsType(type) {
  if (type === 'bool' || type === 'boolean') return { type: 'boolean' };
  if (/^(int|integer|bigint)/u.test(type)) return { type: 'integer' };
  if (/^(numeric|decimal)/u.test(type)) return { type: 'number' };
  if (type === 'jsonb') return { type: 'object', additionalProperties: true };
  if (type === 'uuid') return { type: 'string', format: 'uuid' };
  if (type === 'date') return { type: 'string', format: 'date' };
  if (type === 'timestamptz') return { type: 'string', format: 'date-time' };
  if (/^geometry/u.test(type)) return {};
  const varchar = /^varchar\((\d+)\)$/u.exec(type);
  if (varchar) return { type: 'string', maxLength: Number(varchar[1]) };
  return { type: 'string' };
}

function schemaForField(field) {
  if (field.jsonSchema) return JSON.parse(JSON.stringify(field.jsonSchema));
  return tsType(field.type);
}

// `state in ('A','B')` in a check constraint is the field's closed value set.
function enumsFrom(entity) {
  const found = new Map();
  for (const check of entity.checks ?? []) {
    const match =
      /^\s*(\w+)\s+in\s+\(((?:\s*'[^']*'\s*,?)+)\)\s*$/iu.exec(
        check.expression,
      ) ??
      /^\s*\w+\s+is\s+null\s+or\s+(\w+)\s+in\s+\(((?:\s*'[^']*'\s*,?)+)\)\s*$/iu.exec(
        check.expression,
      );
    if (!match) continue;
    const values = [...match[2].matchAll(/'([^']*)'/gu)].map((m) => m[1]);
    if (values.length) found.set(match[1], values);
  }
  return found;
}

function schemaFor(entity, { create }) {
  const enums = enumsFrom(entity);
  const generated = ['id', 'tenant_id', 'created_at', 'updated_at'];
  const fields = create
    ? entity.fields.filter(
        (f) => f.writable !== false && !generated.includes(f.name),
      )
    : [
        ...entity.fields,
        ...(entity.fields.some((f) => f.name === 'created_at')
          ? []
          : [{ name: 'created_at', type: 'timestamptz' }]),
        ...(entity.fields.some((f) => f.name === 'updated_at')
          ? []
          : [{ name: 'updated_at', type: 'timestamptz', nullable: true }]),
      ];
  const properties = {};
  const required = [];
  for (const field of fields) {
    const base = schemaForField(field);
    const values = enums.get(field.name);
    const property = values ? { ...base, enum: values } : { ...base };
    if (field.nullable) property.nullable = true;
    if (field.pii) property['x-pii'] = field.pii;
    if (field.retention) property['x-retention'] = field.retention;
    if (field.default !== undefined) property.default = String(field.default);
    properties[field.name] = property;
    if (!field.nullable && field.default === undefined)
      required.push(field.name);
  }
  const schema = { type: 'object', properties };
  if (required.length) schema.required = required;
  if (entity.description && !create) schema.description = entity.description;
  return schema;
}

function documentFor(bp) {
  const base = String(bp.api?.basePath ?? '/').replace(/\/$/u, '');
  const byEntity = new Map(
    (bp.api?.resources ?? []).map((resource) => [resource.entity, resource]),
  );
  const paths = {};
  const schemas = {};
  for (const entity of bp.database.entities) {
    schemas[entity.name] = schemaFor(entity, { create: false });
    schemas[`Create${entity.name}Dto`] = schemaFor(entity, { create: true });
    const resource = byEntity.get(entity.name);
    if (!resource) continue;
    const operations = new Set(
      resource.operations ?? ['list', 'get', 'create', 'update', 'delete'],
    );
    const collection = `${base}/${resource.path}`;
    const ref = `#/components/schemas/${entity.name}`;
    const createRef = `#/components/schemas/Create${entity.name}Dto`;
    const tag = resource.resource;
    const collectionOperations = {};
    if (operations.has('list'))
      collectionOperations.get = {
        tags: [tag],
        operationId: `list${entity.name}`,
        summary: `List ${entity.name} (most recent first, capped at 500)`,
        responses: {
          200: {
            description: 'ok',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: ref } },
              },
            },
          },
        },
      };
    if (operations.has('create'))
      collectionOperations.post = {
        tags: [tag],
        operationId: `create${entity.name}`,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: createRef } } },
        },
        responses: {
          201: {
            description: 'created',
            content: { 'application/json': { schema: { $ref: ref } } },
          },
        },
      };
    if (Object.keys(collectionOperations).length)
      paths[collection] = collectionOperations;
    const itemOperations = {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
    };
    if (operations.has('get'))
      itemOperations.get = {
        tags: [tag],
        operationId: `get${entity.name}`,
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: ref } } },
          },
          404: { description: 'not found' },
        },
      };
    if (operations.has('update'))
      itemOperations.patch = {
        tags: [tag],
        operationId: `update${entity.name}`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { allOf: [{ $ref: createRef }], required: [] },
            },
          },
        },
        responses: {
          200: {
            description: 'ok',
            content: { 'application/json': { schema: { $ref: ref } } },
          },
          404: { description: 'not found' },
        },
      };
    if (operations.has('delete'))
      itemOperations.delete = {
        tags: [tag],
        operationId: `remove${entity.name}`,
        responses: {
          200: { description: 'deleted' },
          404: { description: 'not found' },
        },
      };
    if (Object.keys(itemOperations).length > 1)
      paths[`${collection}/{id}`] = itemOperations;
  }
  return {
    openapi: '3.1.0',
    info: {
      title: `${bp.module.name} — ${bp.id}`,
      version: bp.module.version,
      description: bp.module.description ?? '',
      'x-blueprint': bp.id,
      'x-generated': 'tools/contracts/generate-openapi.mjs — do not hand-edit',
    },
    paths,
    components: { schemas },
  };
}

const files = fs
  .readdirSync(sourceDir)
  .filter((name) => /^BP-[A-Z0-9-]+\.json$/u.test(name))
  .sort();
let drift = false;
const expected = new Set();
for (const name of files) {
  const bp = JSON.parse(fs.readFileSync(path.join(sourceDir, name), 'utf8'));
  if (!bp.api?.resources?.length) continue;
  const target = `${bp.id}.openapi.json`;
  expected.add(target);
  let content = `${JSON.stringify(documentFor(bp), null, 2)}\n`;
  const formatted = spawnSync(
    'pnpm',
    ['exec', 'prettier', '--stdin-filepath', target],
    { cwd: root, input: content, encoding: 'utf8' },
  );
  if (formatted.status !== 0)
    throw new Error(`Unable to format ${target}: ${formatted.stderr}`);
  content = formatted.stdout;
  const file = path.join(outputDir, target);
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (checkMode) {
    if (current !== content) {
      drift = true;
      process.stderr.write(`contract drift: ${target}\n`);
    }
    continue;
  }
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(file, content);
}
for (const name of fs
  .readdirSync(outputDir)
  // `*.commands.openapi.json` is hand-written and has its own gate
  // (tools/contracts/check-commands.mjs) — it is never generated here.
  .filter(
    (n) => n.endsWith('.openapi.json') && !n.endsWith('.commands.openapi.json'),
  ))
  if (!expected.has(name)) {
    drift = true;
    process.stderr.write(`orphan contract: ${name}\n`);
  }
if (drift) process.exit(1);
process.stdout.write(
  checkMode
    ? 'contracts are in sync with the blueprints\n'
    : `contracts written: ${expected.size}\n`,
);
