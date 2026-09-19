import fs from 'node:fs';
import path from 'node:path';

// The INF and EST lifecycle vocabularies are owned by their workflows. Their
// DDL reference tables must keep the same closed sets, or this check fails.
const root = process.cwd();
const infDdl = fs.readFileSync(
  path.join(
    root,
    'backend',
    'database',
    'ddl',
    '14-inf-lifecycle-vocabulary.sql',
  ),
  'utf8',
);
const estDdl = fs.readFileSync(
  path.join(
    root,
    'backend',
    'database',
    'ddl',
    '19-est-lifecycle-vocabulary.sql',
  ),
  'utf8',
);
const wf3 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'shared',
    'workflows',
    'WF-INF-003.md',
  ),
  'utf8',
);
const wf2 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'shared',
    'workflows',
    'WF-INF-002.md',
  ),
  'utf8',
);
const teatWf = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'domains',
    'inf',
    'teat',
    'workflows',
    'WF-TEAT-001.md',
  ),
  'utf8',
);
const boatWf1 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'domains',
    'est',
    'boat',
    'workflows',
    'WF-BOAT-001.md',
  ),
  'utf8',
);
const boatWf3 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'domains',
    'est',
    'boat',
    'workflows',
    'WF-BOAT-003.md',
  ),
  'utf8',
);

function seededBlock(ddl: string, table: string): string {
  const start = ddl.indexOf(`INSERT INTO ${table}`);
  if (start < 0) return '';
  const end = ddl.indexOf('ON CONFLICT', start);
  return ddl.slice(start, end < 0 ? undefined : end);
}

function seededCodes(ddl: string, table: string): Set<string> {
  const block = seededBlock(ddl, table);
  return new Set(
    [...block.matchAll(/^\s*\('([^']+)'/gm)].map((match) => match[1] ?? ''),
  );
}

function seededTerminality(ddl: string, table: string): Map<string, boolean> {
  const block = seededBlock(ddl, table);
  return new Map(
    [...block.matchAll(/^\s*\('([^']+)',\s*\d+,\s*(true|false),/gm)].map(
      (match) => [match[1] ?? '', match[2] === 'true'],
    ),
  );
}

function seededStateTerminality(ddl: string): Map<string, boolean> {
  const block = seededBlock(ddl, 'est.crash_state_ref');
  return new Map(
    [
      ...block.matchAll(/^\s*\('([^']+)',\s*'[^']+',\s*\d+,\s*(true|false),/gm),
    ].map((match) => [match[1] ?? '', match[2] === 'true']),
  );
}

function seededPairs(ddl: string, table: string): Map<string, string> {
  const block = seededBlock(ddl, table);
  return new Map(
    [...block.matchAll(/^\s*\('([^']+)',\s*'([^']+)'/gm)].map((match) => [
      match[1] ?? '',
      match[2] ?? '',
    ]),
  );
}

function section(
  markdown: string,
  heading: string,
  nextHeading: string,
): string {
  const start = markdown.indexOf(heading);
  if (start < 0) return '';
  const end = markdown.indexOf(nextHeading, start + heading.length);
  return markdown.slice(start, end < 0 ? undefined : end);
}

function diagramStates(markdown: string, openingLine: string): Set<string> {
  const start = markdown.indexOf(openingLine);
  if (start < 0) return new Set();
  const end = markdown.indexOf('    }', start + openingLine.length);
  const diagram = markdown.slice(start, end < 0 ? undefined : end);
  const states = new Set<string>();
  for (const match of diagram.matchAll(
    /^\s*(?:\[\*\]|([A-Z][A-Z0-9_]+))\s*-->\s*(?:\[\*\]|([A-Z][A-Z0-9_]+))/gm,
  )) {
    if (match[1]) states.add(match[1]);
    if (match[2]) states.add(match[2]);
  }
  return states;
}

const statesSection = section(wf3, '## §1 — Estados', '## §2');
const docStates = new Set(
  [...statesSection.matchAll(/`([A-Z][A-Z0-9_]{3,})`/g)]
    .map((match) => match[1] ?? '')
    .filter(
      (token) =>
        !/^(INDICACAO_EM_PROCESSAMENTO|EM_ADMISSIBILIDADE_1A|EM_REMESSA_JARI|EM_JULGAMENTO_JARI|PROVIDO_1A|NEGADO_1A|EM_ADMISSIBILIDADE_2A|EM_JULGAMENTO_CETRAN|PENDENTE_PAGAMENTO|QUITADA|EM_COBRANCA)$/.test(
          token,
        ),
    )
    .filter((token) => !/^T-/.test(token)),
);
const docSubstates = new Set(
  [
    'INDICACAO_EM_PROCESSAMENTO',
    'EM_ADMISSIBILIDADE_1A',
    'EM_REMESSA_JARI',
    'EM_JULGAMENTO_JARI',
    'PROVIDO_1A',
    'NEGADO_1A',
    'EM_ADMISSIBILIDADE_2A',
    'EM_JULGAMENTO_CETRAN',
    'PENDENTE_PAGAMENTO',
    'QUITADA',
    'EM_COBRANCA',
  ].filter((token) => statesSection.includes(`\`${token}\``)),
);
const timersSection = section(
  wf2,
  '### 9.2 Timers do ciclo da infração',
  '### 9.3',
);
const docTimers = new Set(
  [...timersSection.matchAll(/^\| `(T-[A-Z0-9-]+)`/gm)].map(
    (match) => match[1] ?? '',
  ),
);

const ddlStates = seededCodes(infDdl, 'inf.infraction_state_ref');
const ddlSubstates = seededCodes(infDdl, 'inf.infraction_substate_ref');
const ddlTimers = seededCodes(infDdl, 'inf.infraction_timer_ref');

const aitStatesSection = section(teatWf, '## Estados', '## Transições');
const workflowAitStates = new Set<string>();
for (const match of aitStatesSection.matchAll(
  /^\s*([A-Z][A-Z0-9_]+)\s+-->\s+([A-Z][A-Z0-9_]+)/gm,
)) {
  if (match[1] && match[1] !== 'AIT') workflowAitStates.add(match[1]);
  if (match[2] && match[2] !== 'AIT') workflowAitStates.add(match[2]);
}
const ddlAitStates = seededCodes(infDdl, 'inf.ait_state_ref');
const ddlAitTerminality = seededTerminality(infDdl, 'inf.ait_state_ref');
const workflowAitTerminalStates = new Set([
  'CANCELADO_RASCUNHO',
  'ARQUIVADO',
  'CANCELADO_POSFINAL',
]);

const problems: string[] = [];
const compare = (
  label: string,
  doc: Set<string>,
  seeded: Set<string>,
  docOnlyIsError = true,
) => {
  for (const code of doc)
    if (!seeded.has(code))
      problems.push(`- ${label} ${code}: in the workflow but not seeded`);
  if (docOnlyIsError)
    for (const code of seeded)
      if (!doc.has(code))
        problems.push(`- ${label} ${code}: seeded but not in the workflow`);
};

const comparePairs = (
  label: string,
  expected: Map<string, string>,
  actual: Map<string, string>,
) => {
  compare(label, new Set(expected.keys()), new Set(actual.keys()));
  for (const [code, value] of expected)
    if (actual.get(code) !== value)
      problems.push(
        `- ${label} ${code}: expected ${value}; found ${String(actual.get(code))}`,
      );
};

const requireWorkflowText = (workflow: string, label: string, text: string) => {
  if (!workflow.includes(text))
    problems.push(`- ${label}: required workflow text is missing (${text})`);
};

compare('state', docStates, ddlStates);
compare(
  'substate',
  docSubstates,
  new Set([...ddlSubstates].filter((code) => code !== 'PRAZO_DEFESA_ABERTO')),
);
compare('timer', docTimers, ddlTimers, false);
compare('AIT state', workflowAitStates, ddlAitStates);
for (const code of workflowAitStates) {
  const expected = workflowAitTerminalStates.has(code);
  const actual = ddlAitTerminality.get(code);
  if (actual !== expected)
    problems.push(
      `- AIT state ${code}: is_terminal is ${String(actual)}; expected ${String(expected)}`,
    );
}

const workflowLocalStates = diagramStates(
  boatWf1,
  '    state "Registro local (BOAT/CrashRecord)" as Local {',
);
const workflowNationalStates = diagramStates(
  boatWf1,
  '    state "Registro nacional (RENAEST)" as Nacional {',
);
const estStates = seededCodes(estDdl, 'est.crash_state_ref');
const estStateScopes = seededPairs(estDdl, 'est.crash_state_ref');
const estStateTerminality = seededStateTerminality(estDdl);
const estLocalStates = new Set([
  'RASCUNHO',
  'EM_ATENDIMENTO',
  'REGISTRADO',
  'PENDENTE_COMPLEMENTO',
  'VALIDADO',
  'FECHADO',
  'INTEGRADO',
  'ARQUIVADO',
  'CANCELADO',
]);
const estNationalStates = new Set([
  'RECEBIDO',
  'EM_ANALISE',
  'CONSOLIDADO',
  'REJEITADO',
]);
const estStateScopesExpected = new Map([
  ...[...estLocalStates].map((code) => [code, 'local'] as [string, string]),
  ...[...estNationalStates].map(
    (code) => [code, 'national'] as [string, string],
  ),
]);
const estTerminalStates = new Set([
  'ARQUIVADO',
  'CANCELADO',
  'CONSOLIDADO',
  'REJEITADO',
]);

compare('EST local state', estLocalStates, workflowLocalStates);
compare('EST national state', estNationalStates, workflowNationalStates);
compare('EST state', new Set(estStateScopesExpected.keys()), estStates);
comparePairs('EST state scope', estStateScopesExpected, estStateScopes);
for (const code of estStateScopesExpected.keys()) {
  const expectedTerminality = estTerminalStates.has(code);
  if (estStateTerminality.get(code) !== expectedTerminality)
    problems.push(
      `- EST state ${code}: is_terminal is ${String(estStateTerminality.get(code))}; expected ${String(expectedTerminality)}`,
    );
}

const estSeverities = seededTerminality(estDdl, 'est.crash_severity_ref');
const estSeveritiesExpected = new Map([
  ['SEM_VITIMA', false],
  ['COM_VITIMA_FERIDA', true],
  ['COM_VITIMA_FATAL', true],
]);
comparePairs(
  'EST severity requires_victim',
  new Map(
    [...estSeveritiesExpected].map(([code, requiresVictim]) => [
      code,
      String(requiresVictim),
    ]),
  ),
  new Map(
    [...estSeverities].map(([code, requiresVictim]) => [
      code,
      String(requiresVictim),
    ]),
  ),
);
requireWorkflowText(boatWf1, 'WF-BOAT-001 severity', 'COM_VITIMA_FERIDA');
requireWorkflowText(boatWf1, 'WF-BOAT-001 severity', 'COM_VITIMA_FATAL');
requireWorkflowText(boatWf1, 'WF-BOAT-001 severity', 'sem vítima');

const estSceneDuties = seededPairs(estDdl, 'est.scene_duty_ref');
const estSceneDutiesExpected = new Map([
  ['176_I', 'art176'],
  ['176_II', 'art176'],
  ['176_III', 'art176'],
  ['176_IV', 'art176'],
  ['176_V', 'art176'],
  ['177', 'art177'],
  ['178', 'art178'],
]);
comparePairs('EST scene duty regime', estSceneDutiesExpected, estSceneDuties);
for (const article of ['art. 176', 'art. 177', 'art. 178'])
  requireWorkflowText(boatWf1, 'WF-BOAT-001 scene duty', article);

const estConditions = seededCodes(estDdl, 'est.crash_condition_ref');
const estConditionsExpected = new Set([
  'crash_type',
  'road_condition',
  'weather_condition',
  'lighting_condition',
  'signage_condition',
]);
compare('EST source_pending catalog', estConditionsExpected, estConditions);
for (const requiredDdlFragment of [
  "values_json jsonb NOT NULL DEFAULT '[]'::jsonb",
  'source_pending boolean NOT NULL DEFAULT true',
  "editable_by varchar(40) NOT NULL DEFAULT 'agency-admin'",
  "decision_ref text NOT NULL DEFAULT 'H.42'",
  'source_pending = true',
  "editable_by = 'agency-admin'",
  "decision_ref = 'H.42'",
])
  if (!estDdl.includes(requiredDdlFragment))
    problems.push(
      `- EST source_pending catalog: required DDL fragment is missing (${requiredDdlFragment})`,
    );

const estTimers = seededCodes(estDdl, 'est.crash_timer_ref');
compare('EST timer', new Set(['T-BOAT-TRANSM']), estTimers);
const timerRow =
  /\('T-BOAT-TRANSM',\s*'FECHADO',\s*'est\.renaest\.transmit_period',\s*'monthly',\s*'sinistro',\s*'vigente',\s*'OD-B04\/DT-017'\)/.test(
    seededBlock(estDdl, 'est.crash_timer_ref'),
  );
if (!timerRow)
  problems.push(
    '- EST timer T-BOAT-TRANSM: trigger, parameter, period, owner, status, or decision drifted',
  );
requireWorkflowText(boatWf1, 'WF-BOAT-001 timer', 'T-BOAT-TRANSM');
requireWorkflowText(boatWf1, 'WF-BOAT-001 timer', 'periodicidade **mensal**');
requireWorkflowText(boatWf1, 'WF-BOAT-001 timer', 'move a `closed`');
requireWorkflowText(
  boatWf3,
  'WF-BOAT-003 terminal national state',
  '`CONSOLIDADO`/`REJEITADO` é **definitivo**',
);

if (problems.length > 0) {
  console.error(
    'check-lifecycle-vocabulary: drift between INF/EST workflows and lifecycle DDL',
  );
  problems.forEach((line) => console.error(line));
  process.exitCode = 1;
} else {
  console.log(
    `check-lifecycle-vocabulary: OK (${ddlStates.size} INF states, ${ddlSubstates.size} INF substates, ${ddlTimers.size} INF timers, ${ddlAitStates.size} AIT states; ${estLocalStates.size} EST local states, ${estNationalStates.size} EST national states, ${estSeverities.size} EST severities, ${estSceneDuties.size} EST scene duties, ${estConditions.size} EST source_pending catalogs, ${estTimers.size} EST timers)`,
  );
}
