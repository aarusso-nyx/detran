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

// DASHBOARD lifecycle vocabulary (R-0011, plan M9 a / TASK-0011; CTG-0001.md
// §3, §7). Same pattern as INF/EST above: DDL 19-dashboard-lifecycle-vocabulary.sql
// (Architect, TASK-0001) compared against the closed state sets of
// [WF-DASH-001/002/003] (`stateDiagram-v2` tokens).
const dashboardDdl = fs.readFileSync(
  path.join(
    root,
    'backend',
    'database',
    'ddl',
    '19-dashboard-lifecycle-vocabulary.sql',
  ),
  'utf8',
);
const wfDash1 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'transversal',
    'dashboard',
    'workflows',
    'WF-DASH-001.md',
  ),
  'utf8',
);
const wfDash2 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'transversal',
    'dashboard',
    'workflows',
    'WF-DASH-002.md',
  ),
  'utf8',
);
const wfDash3 = fs.readFileSync(
  path.join(
    root,
    'docs',
    'framework',
    'product',
    'transversal',
    'dashboard',
    'workflows',
    'WF-DASH-003.md',
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

// DASHBOARD diagrams are flat `stateDiagram-v2` blocks (no nested `state "…" {`
// sub-graphs like the BOAT one above): every fenced block starting at the
// literal `stateDiagram-v2` line up to the closing ``` fence is the whole
// diagram. Same token shape as `diagramStates` above (`[A-Z_]+` left/right of
// `-->`, `[*]` excluded), TASK-0011 §Tarefa 2.
function stateDiagramTokens(markdown: string): Set<string> {
  const start = markdown.indexOf('stateDiagram-v2');
  if (start < 0) return new Set();
  const end = markdown.indexOf('```', start);
  const diagram = markdown.slice(start, end < 0 ? undefined : end);
  const tokens = new Set<string>();
  for (const match of diagram.matchAll(
    /^\s*(?:\[\*\]|([A-Z][A-Z0-9_]+))\s*-->\s*(?:\[\*\]|([A-Z][A-Z0-9_]+))/gm,
  )) {
    if (match[1]) tokens.add(match[1]);
    if (match[2]) tokens.add(match[2]);
  }
  return tokens;
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

// DASHBOARD: DDL 19-dashboard-lifecycle-vocabulary.sql vs the three closed
// vocabularies. `compareDashboardSet` reports the contract message verbatim
// (TASK-0011 prompt §Definições que valem como contrato):
// `dashboard <tabela>: DDL {…} ≠ workflow {…}` for the three state machines
// (diagram-derived) or `… ≠ catalog {…}` for the flat catalogs that have no
// `stateDiagram-v2` (severity/layer/classification/block/timer — sourced from
// CTG-0001.md §3.6–§3.10, never invented here).
function compareDashboardSet(
  table: string,
  seeded: Set<string>,
  reference: Set<string>,
  referenceLabel: 'workflow' | 'catalog',
): void {
  const same =
    seeded.size === reference.size &&
    [...seeded].every((code) => reference.has(code));
  if (!same)
    problems.push(
      `dashboard ${table}: DDL {${[...seeded].sort().join(',')}} ≠ ${referenceLabel} {${[...reference].sort().join(',')}}`,
    );
}

const dashAlertStates = seededCodes(dashboardDdl, 'dashboard.alert_state_ref');
const dashDutyStates = seededCodes(dashboardDdl, 'dashboard.duty_state_ref');
const dashFreshnessStates = seededCodes(
  dashboardDdl,
  'dashboard.freshness_state_ref',
);
const dashSeverity = seededCodes(dashboardDdl, 'dashboard.severity_ref');
const dashLayer = seededCodes(dashboardDdl, 'dashboard.layer_ref');
const dashClassification = seededCodes(
  dashboardDdl,
  'dashboard.classification_ref',
);
const dashBlock = seededCodes(dashboardDdl, 'dashboard.block_ref');
const dashTimerOwners = seededPairs(dashboardDdl, 'dashboard.timer_ref');

compareDashboardSet(
  'alert_state_ref',
  dashAlertStates,
  stateDiagramTokens(wfDash1),
  'workflow',
);
compareDashboardSet(
  'duty_state_ref',
  dashDutyStates,
  stateDiagramTokens(wfDash2),
  'workflow',
);
compareDashboardSet(
  'freshness_state_ref',
  dashFreshnessStates,
  stateDiagramTokens(wfDash3),
  'workflow',
);

// Literal closed sets, sourced (never invented) — CTG-0001.md §3.6 (severity),
// §3.7 (layer, RN-DASH-170), §3.8 (classification, RN-DASH-142), §3.9 (block,
// APP-DASHBOARD §Catálogo); none of these four has a `stateDiagram-v2`.
const DASH_SEVERITY_EXPECTED = new Set(['N1', 'N2', 'N3', 'CRITICO']);
const DASH_LAYER_EXPECTED = new Set(['N0', 'N1', 'N2', 'N3']);
const DASH_CLASSIFICATION_EXPECTED = new Set(['P1', 'P2', 'P3']);
const DASH_BLOCK_EXPECTED = new Set(['A', 'B', 'C', 'D']);
// 14 códigos — CTG-0001.md §3.10 / plan R-0011 M7, adenda A7 (fonte única;
// se o DDL ou o contrato divergirem de M7, é `reference-gap`, não escolha).
const DASH_TIMER_EXPECTED = new Set([
  'T-DASH-ACK-N1',
  'T-DASH-ACK-N2',
  'T-DASH-ACK-N3',
  'T-DASH-ACK-CRITICO',
  'T-DASH-MARCO-50',
  'T-DASH-MARCO-75',
  'T-DASH-MARCO-90',
  'T-DASH-DUTY-201',
  'T-DASH-DUTY-202',
  'T-DASH-DUTY-PNATRANS',
  'T-DASH-DUTY-206',
  'T-DASH-DUTY-207',
  'T-DASH-DUTY-209',
  'T-DASH-PENDING-FLOOR',
]);

compareDashboardSet(
  'severity_ref',
  dashSeverity,
  DASH_SEVERITY_EXPECTED,
  'catalog',
);
compareDashboardSet('layer_ref', dashLayer, DASH_LAYER_EXPECTED, 'catalog');
compareDashboardSet(
  'classification_ref',
  dashClassification,
  DASH_CLASSIFICATION_EXPECTED,
  'catalog',
);
compareDashboardSet('block_ref', dashBlock, DASH_BLOCK_EXPECTED, 'catalog');
compareDashboardSet(
  'timer_ref',
  new Set(dashTimerOwners.keys()),
  DASH_TIMER_EXPECTED,
  'catalog',
);
for (const [code, owner] of dashTimerOwners)
  if (owner !== 'dashboard')
    problems.push(
      `- dashboard timer_ref ${code}: owner is ${owner}; expected dashboard`,
    );

if (problems.length > 0) {
  console.error(
    'check-lifecycle-vocabulary: drift between INF/EST/DASHBOARD workflows and lifecycle DDL',
  );
  problems.forEach((line) => console.error(line));
  process.exitCode = 1;
} else {
  console.log(
    `check-lifecycle-vocabulary: OK (${ddlStates.size} INF states, ${ddlSubstates.size} INF substates, ${ddlTimers.size} INF timers, ${ddlAitStates.size} AIT states; ${estLocalStates.size} EST local states, ${estNationalStates.size} EST national states, ${estSeverities.size} EST severities, ${estSceneDuties.size} EST scene duties, ${estConditions.size} EST source_pending catalogs, ${estTimers.size} EST timers; ${dashAlertStates.size} DASHBOARD alert states, ${dashDutyStates.size} DASHBOARD duty states, ${dashFreshnessStates.size} DASHBOARD freshness states, ${dashSeverity.size} DASHBOARD severities, ${dashLayer.size} DASHBOARD layers, ${dashClassification.size} DASHBOARD classifications, ${dashBlock.size} DASHBOARD blocks, ${dashTimerOwners.size} DASHBOARD timers)`,
  );
}
