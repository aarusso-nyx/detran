// INV-DDL05-001/002/003: independent, database-free sensor for the manual DDL05.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ddl = await readFile(
  resolve(root, 'backend/database/ddl/05-role-catalog.sql'),
  'utf8',
);
const fields = [
  'family',
  'name',
  'description',
  'apps',
  'is_staff',
  'source',
  'introduced_on',
];
const keys = [
  'ADMIN',
  'ADMIN_CLINICA',
  'MEDICO',
  'PSICOLOGO',
  'RECEPCAO',
  'TECNICO_BIOMETRIA',
  'AUDITOR',
  'GESTOR',
  'SUPERVISOR',
  'GESTOR_DETRAN',
  'JUNTA',
  'CETRAN',
  'DPO',
  'SUPORTE',
  'CANDIDATO',
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'bi-analyst',
  'integration-operator',
  'rait-analyst',
  'rait-coordinator',
  'rait-secretary',
  'rait-signing-authority',
  'rait-central-authority',
  'rait-rapporteur',
  'rait-chair',
  'rait-manager',
  'rait-hr',
  'rait-finance',
  'dash-operator',
  'dash-duty-owner',
  'CIDADAO',
];

const inserts = [
  ...ddl.matchAll(
    /INSERT\s+INTO\s+auth\.role_catalog\s*\(\s*key\s*,\s*family\s*,\s*name\s*,\s*description\s*,\s*apps\s*,\s*is_staff\s*,\s*source\s*,\s*introduced_on\s*\)\s+VALUES\s*([\s\S]*?)\s+ON\s+CONFLICT\s*\(key\)\s+DO\s+UPDATE\s+SET\s*([\s\S]*?);/gi,
  ),
];

test('dado DDL05 quando localiza upsert então existe um conflito por key', () => {
  assert.equal(inserts.length, 1, 'one executable role-catalog upsert');
  assert.equal(
    [...ddl.matchAll(/^INSERT\s+INTO\s+auth\.role_catalog\b/gm)].length,
    1,
  );
  assert.equal([...ddl.matchAll(/\bON\s+CONFLICT\s*\(/gi)].length, 1);
});

test('dado catálogo canônico quando lê VALUES então preserva 36 chaves e valores literais', () => {
  assert.equal(inserts.length, 1);
  const values = inserts[0][1];
  const actualKeys = [
    ...values.matchAll(
      /^\s*\('([^']+)',\s*'(?:pec|teat|rait|dashboard|citizen)'/gm,
    ),
  ].map((match) => match[1]);
  assert.equal(actualKeys.length, 36);
  assert.deepEqual(actualKeys, keys);
  assert.equal(new Set(actualKeys).size, 36);
  assert.equal(
    createHash('sha256').update(values).digest('hex'),
    '4cc02a80c0cae4747c3cf3f51a8eb54c0d8943f267227856a6dc8fe91a62e9cd',
    'the complete literal VALUES block, including all eight attributes per row, must remain byte-identical',
  );
});

test('dado conflito quando atualiza então SET conserva exatamente sete EXCLUDED e clock', () => {
  assert.equal(inserts.length, 1);
  const body = inserts[0][2];
  const set = body.split(/\bWHERE\b/i)[0];
  const assignments = set
    .replace(/--[^\n]*/g, '')
    .split(',')
    .map((value) => value.trim().replace(/\s+/g, ' '));
  assert.deepEqual(assignments, [
    ...fields.map((field) => `${field} = EXCLUDED.${field}`),
    'updated_at = clock_timestamp()',
  ]);
  assert.doesNotMatch(set, /\bcreated_at\b/i);
});

test('dado linha igual quando avalia conflito então guarda ROW null-safe usa somente os sete pares posicionais', () => {
  assert.equal(inserts.length, 1);
  const body = inserts[0][2].replace(/--[^\n]*/g, '');
  const where = body.match(/\bWHERE\b([\s\S]*)$/i);
  assert.ok(
    where,
    'INV-DDL05-001: missing seven-field null-safe conflict guard',
  );
  const columnList = fields.join(',');
  const actual = where[1].replace(/\s+/g, '').toLowerCase();
  const expected = `row(${fields.map((field) => `role_catalog.${field}`).join(',')})isdistinctfromrow(${fields.map((field) => `excluded.${field}`).join(',')})`;
  assert.equal(actual, expected, `guard must compare exactly ${columnList}`);
  assert.doesNotMatch(where[1], /\b(?:created_at|updated_at)\b/i);
});
