#!/usr/bin/env node
// Uso: node tools/orchestra/validate-blueprints.mjs [BP-….json …]
// Valida os blueprints (todos de docs/framework/blueprints, ou os informados) contra
// docs/framework/blueprints/module-blueprint.schema.json (JSON Schema 2020-12), com o AJV já
// instalado no workspace (@redocly/ajv, dependência transitiva). Sai 0 só se todos forem válidos.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = process.cwd();
const dir = path.join(root, 'docs/framework/blueprints');
const store = path.join(root, 'node_modules/.pnpm');
const pkg = fs
  .readdirSync(store)
  .find((name) => name.startsWith('@redocly+ajv@'));
if (!pkg) {
  console.error(
    'validate-blueprints: @redocly/ajv não encontrado em node_modules/.pnpm',
  );
  process.exit(2);
}
const require = createRequire(import.meta.url);
const Ajv = require(
  path.join(store, pkg, 'node_modules/@redocly/ajv/dist/2020'),
).default;
const ajv = new Ajv({ strict: false, allErrors: true });
const validate = ajv.compile(
  JSON.parse(
    fs.readFileSync(path.join(dir, 'module-blueprint.schema.json'), 'utf8'),
  ),
);
const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((file) => path.basename(file))
  : fs.readdirSync(dir).filter((name) => /^BP-[A-Z0-9-]+\.json$/u.test(name));
let failed = 0;
for (const file of files.sort()) {
  const ok = validate(
    JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')),
  );
  if (!ok) {
    failed += 1;
    for (const error of validate.errors ?? [])
      console.error(`${file}: ${error.instancePath || '/'} ${error.message}`);
  }
}
if (failed) process.exit(1);
console.log(`validate-blueprints: OK (${files.length} blueprint(s))`);
