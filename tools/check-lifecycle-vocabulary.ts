import fs from 'node:fs';
import path from 'node:path';

// The infraction lifecycle vocabulary is owned by WF-INF-003 (states) and
// WF-INF-002 §9.2 (timers). 14-inf-lifecycle-vocabulary.sql seeds the same
// codes as reference tables; this check fails when either side drifts.
const root = process.cwd();
const ddl = fs.readFileSync(
  path.join(
    root,
    'backend',
    'database',
    'ddl',
    '14-inf-lifecycle-vocabulary.sql',
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

function seededCodes(table: string): Set<string> {
  const start = ddl.indexOf(`INSERT INTO ${table}`);
  if (start < 0) return new Set();
  const end = ddl.indexOf('ON CONFLICT', start);
  const block = ddl.slice(start, end);
  return new Set(
    [...block.matchAll(/^\s*\('([^']+)'/gm)].map((match) => match[1] ?? ''),
  );
}

function section(
  markdown: string,
  heading: string,
  nextHeading: string,
): string {
  const start = markdown.indexOf(heading);
  const end = markdown.indexOf(nextHeading, start + heading.length);
  return markdown.slice(start, end < 0 ? undefined : end);
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

const ddlStates = seededCodes('inf.infraction_state_ref');
const ddlSubstates = seededCodes('inf.infraction_substate_ref');
const ddlTimers = seededCodes('inf.infraction_timer_ref');

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
compare('state', docStates, ddlStates);
compare(
  'substate',
  docSubstates,
  new Set([...ddlSubstates].filter((code) => code !== 'PRAZO_DEFESA_ABERTO')),
);
compare('timer', docTimers, ddlTimers, false);

if (problems.length > 0) {
  console.error(
    'check-lifecycle-vocabulary: drift between WF-INF-003/WF-INF-002 and 14-inf-lifecycle-vocabulary.sql',
  );
  problems.forEach((line) => console.error(line));
  process.exitCode = 1;
} else {
  console.log(
    `check-lifecycle-vocabulary: OK (${ddlStates.size} states, ${ddlSubstates.size} substates, ${ddlTimers.size} timers)`,
  );
}
