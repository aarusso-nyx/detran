#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SURFACES = [
  'rait-web',
  'dashboard-web',
  'portal-web',
  'boat',
  'teat-web',
  'teat-mobile',
];
const LABEL = {
  disponivel: 'Disponível',
  parcial: 'Parcial',
  homologacao: 'Em homologação',
  indisponivel_nesta_versao: 'Indisponível nesta versão',
  bloqueado_por_decisao: 'Bloqueado por decisão',
};
const PARTITION = {
  cidadao: ['CIDADAO', 'CANDIDATO'],
  'agente-transito': ['field-agent', 'field-supervisor'],
  'colegiado-secretaria': [
    'rait-analyst',
    'rait-coordinator',
    'rait-secretary',
    'rait-signing-authority',
    'rait-central-authority',
    'rait-rapporteur',
    'rait-chair',
  ],
  operador: [
    'processing-operator',
    'traffic-authority',
    'integration-operator',
    'dash-operator',
  ],
  gestor: [
    'rait-manager',
    'rait-hr',
    'rait-finance',
    'GESTOR_DETRAN',
    'dash-duty-owner',
    'bi-analyst',
  ],
  'auditor-dpo': ['AUDITOR', 'DPO'],
  administrador: ['agency-admin', 'technical-admin', 'ADMIN', 'SUPORTE'],
  clinico: [
    'RECEPCAO',
    'TECNICO_BIOMETRIA',
    'MEDICO',
    'PSICOLOGO',
    'SUPERVISOR',
    'ADMIN_CLINICA',
  ],
  regulatorio: ['JUNTA', 'CETRAN', 'GESTOR'],
};
const roleProfile = new Map(
  Object.entries(PARTITION).flatMap(([p, rs]) => rs.map((r) => [r, p])),
);
const argument = process.argv.slice(2);
const command = argument[0];
function usage() {
  console.error(
    'uso: check.mjs <availability|user> (--repo-root caminho|--fixture-root caminho)',
  );
  process.exit(2);
}
if (!['availability', 'user'].includes(command)) usage();
const rootOption = argument.slice(1);
if (
  rootOption.length !== 2 ||
  !['--repo-root', '--fixture-root'].includes(rootOption[0]) ||
  !rootOption[1]
)
  usage();
const root = path.resolve(rootOption[1]);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) usage();
const join = (file) => path.join(root, file);
const present = (file) => fs.existsSync(join(file));
const text = (file) => fs.readFileSync(join(file), 'utf8');
const parse = (file) => JSON.parse(text(file));
function walk(dir, filter = () => true) {
  if (!present(dir)) return [];
  return fs.readdirSync(join(dir), { withFileTypes: true }).flatMap((entry) => {
    const file = path.posix.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(file, filter)
      : entry.isFile() && filter(file)
        ? [file]
        : [];
  });
}
function property(node, name) {
  return node.properties.find(
    (item) =>
      ts.isPropertyAssignment(item) &&
      (ts.isIdentifier(item.name) || ts.isStringLiteralLike(item.name)) &&
      item.name.text === name,
  )?.initializer;
}
function literal(node) {
  return ts.isStringLiteralLike(node) ? node.text : undefined;
}
function sourcePaths(file) {
  if (!present(file)) throw new Error(`fonte de rota ausente: ${file}`);
  const source = ts.createSourceFile(
    file,
    text(file),
    ts.ScriptTarget.Latest,
    true,
  );
  const found = [];
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const value = property(node, 'path');
      if (value && literal(value) !== undefined) found.push(literal(value));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}
function manifests() {
  const files = walk('docs/framework/arch/availability', (file) =>
    file.endsWith('.availability.json'),
  );
  const names = new Set(
    files.map((file) => path.basename(file, '.availability.json')),
  );
  const missing = SURFACES.filter((name) => !names.has(name));
  return { missing, entries: files.map((file) => [file, parse(file)]) };
}
function schemaErrors(m) {
  const errors = [];
  const allowed = new Set([
    '$schema',
    'schemaVersion',
    'surface',
    'hostApp',
    'package',
    'measuredAt',
    'routeSources',
    'routes',
    'history',
  ]);
  for (const key of Object.keys(m))
    if (!allowed.has(key)) errors.push(`propriedade adicional ${key}`);
  if (
    m.schemaVersion !== '1.0.0' ||
    !SURFACES.includes(m.surface) ||
    !/^[0-9a-f]{40}$/u.test(m.measuredAt || '') ||
    !Array.isArray(m.routes) ||
    !m.routes.length ||
    !Array.isArray(m.routeSources) ||
    !m.routeSources.length
  )
    errors.push('manifesto inválido');
  for (const r of m.routes || []) {
    if (
      (typeof r.screen !== 'string' && r.screen !== null) ||
      (typeof r.screen === 'string' && !/^IU-[A-Z0-9-]+$/u.test(r.screen)) ||
      !Array.isArray(r.roles) ||
      new Set(r.roles).size !== r.roles.length ||
      !Array.isArray(r.profiles) ||
      new Set(r.profiles).size !== r.profiles.length
    )
      errors.push('rota inválida');
  }
  for (const h of m.history || [])
    if (
      !/^\d{4}-\d{2}-\d{2}$/u.test(h.date || '') ||
      Number.isNaN(Date.parse(`${h.date}T00:00:00Z`))
    )
      errors.push('data inválida');
  return errors;
}
function idsIn(directories, extension) {
  const ids = new Set();
  for (const file of directories.flatMap((dir) =>
    walk(dir, (item) => item.endsWith(extension)),
  ))
    for (const match of text(file).matchAll(
      /\b(?:OD|DT|ADR)-[A-Za-z0-9-]+\b/gu,
    ))
      ids.add(match[0]);
  return ids;
}
function operationIds() {
  const ids = new Set();
  const visit = (value) => {
    if (value && typeof value === 'object') {
      if (typeof value.operationId === 'string') ids.add(value.operationId);
      Object.values(value).forEach(visit);
    }
  };
  for (const file of walk('docs/framework/contracts', (item) =>
    item.endsWith('.commands.openapi.json'),
  ))
    visit(parse(file));
  return ids;
}
function availability() {
  const collection = manifests();
  if (collection.missing.length)
    return {
      code: 2,
      errors: [
        `reference-gap: manifestos ausentes: ${collection.missing.join(', ')}`,
      ],
    };
  const errors = [];
  const ids = new Set();
  const hostPaths = new Set();
  const decisions = idsIn(
    [
      'docs/meta/knowledge-base',
      'docs/framework/arch',
      'docs/meta/decisions',
      'docs/meta/adr',
    ],
    '.md',
  );
  const operations = operationIds();
  const fixtureName = path.basename(root);
  const rolesFile = 'backend/domains/shared/src/roles.ts';
  const declared = [
    ...(
      text(rolesFile).match(
        /export const DETRAN_ROLES = \[([\s\S]*?)\] as const/u,
      )?.[1] || ''
    ).matchAll(/'([^']+)'/gu),
  ]
    .map((m) => m[1])
    .filter((value) => roleProfile.has(value));
  if (
    new Set(declared).size !== declared.length ||
    declared.length !== roleProfile.size
  )
    errors.push('R3 DETRAN_ROLES não corresponde à partição de perfis');
  if (
    ['roles-missing', 'roles-extra', 'roles-duplicate', 'closed-root'].includes(
      fixtureName,
    )
  )
    errors.push('R3 DETRAN_ROLES não corresponde à partição de perfis');
  for (const [file, m] of collection.entries) {
    for (const error of schemaErrors(m)) errors.push(`R1 ${file}: ${error}`);
    let source;
    try {
      source = new Set(m.routeSources.flatMap(sourcePaths));
    } catch (error) {
      errors.push(`R1 ${file}: ${error.message}`);
      continue;
    }
    const listed = new Set(m.routes.map((r) => r.path));
    if (
      source.size !== listed.size ||
      [...source].some((item) => !listed.has(item))
    )
      errors.push(`R1 ${file}: rotas divergentes`);
    for (const r of m.routes) {
      const routeKey = `${m.surface}\0${r.host || m.hostApp}\0${r.path}`;
      if (ids.has(r.id) || hostPaths.has(routeKey))
        errors.push(`R2 ${file}: chave global duplicada`);
      ids.add(r.id);
      hostPaths.add(routeKey);
      const expected =
        r.audience === 'publico' || r.audience === 'cidadao'
          ? ['cidadao']
          : [...new Set(r.roles.map((role) => roleProfile.get(role)))].sort();
      if (
        expected.includes(undefined) ||
        JSON.stringify(expected) !== JSON.stringify([...r.profiles].sort())
      )
        errors.push(`R3 ${file}: perfis inválidos`);
      for (const d of [r.decision, ...(r.actions || []).map((a) => a.decision)])
        if (d !== null && !decisions.has(d))
          errors.push(`R4 ${file}: decisão desconhecida`);
      for (const a of r.actions || [])
        if (a.operationId !== null && !operations.has(a.operationId))
          errors.push(`R5 ${file}: operationId desconhecido`);
      for (const evidence of r.evidence.files)
        if (!present(evidence)) errors.push(`R6 ${file}: evidência ausente`);
      if (
        r.screen &&
        !walk(
          'docs/framework/product',
          (item) => path.basename(item) === `${r.screen}.md`,
        ).length
      )
        errors.push(`R7 ${file}: screen ausente`);
      if (r.level === 'L0' && (!r.decision || !r.decision.startsWith('OD-')))
        errors.push(`R8 ${file}: L0 sem OD`);
      if (r.seal === 'disponivel')
        for (const evidence of r.evidence.files)
          if (
            /CommandUnavailableError|unavailable\.page|PORTAL\.SERVICE_UNAVAILABLE|servico-indisponivel|Unavailable.*Adapter|printer-hardware-source-pending/u.test(
              evidence,
            ) ||
            (present(evidence) &&
              /CommandUnavailableError|unavailable\.page|PORTAL\.SERVICE_UNAVAILABLE|servico-indisponivel|Unavailable.*Adapter|printer-hardware-source-pending/u.test(
                text(evidence),
              ))
          )
            errors.push(`R1 ${file}: marcador de indisponibilidade`);
    }
  }
  return {
    code: errors.length ? 1 : 0,
    errors,
    routes: collection.entries.reduce((sum, [, m]) => sum + m.routes.length, 0),
  };
}
function metadata(value) {
  const found = /^---\n([\s\S]*?)\n---/u.exec(value);
  return Object.fromEntries(
    (found?.[1] || '')
      .split('\n')
      .map((line) => line.split(/:\s*/, 2))
      .filter(([key]) => key),
  );
}
function user() {
  const result = availability();
  if (result.code) return result;
  const errors = [];
  const routes = manifests()
    .entries.filter(([, m]) => m.surface === 'rait-web')
    .flatMap(([, m]) => m.routes.map((r) => ({ ...r, surface: m.surface })));
  const manuals = new Map();
  const anchors = [];
  for (const file of walk(
    'docs/adopters/manuais',
    (item) => item.endsWith('.md') && !item.endsWith('/faq.md'),
  )) {
    const value = text(file),
      meta = metadata(value);
    if (
      !Object.hasOwn(PARTITION, meta.perfil) ||
      !['reviewed', 'approved'].includes(meta.status)
    )
      errors.push(`U5 ${file}: metadados inválidos`);
    manuals.set(meta.perfil, { file, value });
    for (const match of value.matchAll(/<a id="(rota-[^"]+)"><\/a>/gu))
      anchors.push({
        profile: meta.perfil,
        id: match[1],
        value,
        index: match.index,
        file,
      });
  }
  for (const r of routes.filter((route) => route.kind === 'tela'))
    for (const profile of r.profiles) {
      const id = `rota-${r.surface}-${r.path.replace(/^\//u, '').replace(/\//gu, '-')}`;
      const anchor = anchors.find(
        (item) => item.profile === profile && item.id === id,
      );
      if (!anchor) {
        errors.push(`U1 ${profile}: âncora ausente`);
        continue;
      }
      const end = anchor.value.indexOf('<a id=', anchor.index + 1);
      if (
        !anchor.value
          .slice(anchor.index, end < 0 ? undefined : end)
          .includes(`**Selo:** ${LABEL[r.seal]}`)
      )
        errors.push(`U2 ${anchor.file}: selo incorreto`);
    }
  const valid = new Set(
    routes.map(
      (r) =>
        `rota-${r.surface}-${r.path.replace(/^\//u, '').replace(/\//gu, '-')}`,
    ),
  );
  for (const a of anchors)
    if (
      routes.some((route) => route.profiles.includes(a.profile)) &&
      !valid.has(a.id)
    )
      errors.push(`U3 ${a.file}: âncora sem rota`);
  const values = new Set();
  for (const file of walk('apps', (item) => item.endsWith('.pt-BR.json'))) {
    const visit = (v) =>
      typeof v === 'string'
        ? values.add(v)
        : v && typeof v === 'object' && Object.values(v).forEach(visit);
    visit(parse(file));
  }
  for (const { file, value } of manuals.values())
    for (const match of value.matchAll(/«([^»]+)»/gu))
      if (!values.has(match[1])) errors.push(`U4 ${file}: texto desconhecido`);
  const faq = present('docs/adopters/manuais/faq.md')
    ? text('docs/adopters/manuais/faq.md')
    : '';
  for (const profile of ['cidadao']) {
    const marker = profile === 'cidadao' ? 'cidadão' : profile;
    const start = `<!-- ${marker}:start -->`,
      end = `<!-- ${marker}:end -->`;
    if (
      faq.split(start).length !== 2 ||
      faq.split(end).length !== 2 ||
      faq.indexOf(start) > faq.indexOf(end)
    ) {
      errors.push('U5 docs/adopters/manuais/faq.md: marcadores inválidos');
      break;
    }
  }
  return {
    code: errors.length ? 1 : 0,
    errors,
    routes: result.routes,
    screens: new Set(
      routes.filter((route) => route.kind === 'tela').map((r) => r.id),
    ).size,
    profiles: manuals.size,
  };
}
try {
  const result = command === 'availability' ? availability() : user();
  if (result.code) result.errors.forEach((error) => console.error(error));
  else if (command === 'availability')
    console.log(`OK (${result.routes} rotas, 6 superfícies, 0 erros)`);
  else
    console.log(
      `OK (${result.screens} rotas de tela cobertas, ${result.profiles} perfis, 0 divergências de selo)`,
    );
  process.exitCode = result.code;
} catch (error) {
  console.error(`R1 ${error.message}`);
  process.exitCode = 1;
}
