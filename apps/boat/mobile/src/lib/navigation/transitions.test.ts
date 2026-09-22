import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { crashDamagesTransitions, transitions } from './transitions.js';

type Transition = {
  from: string;
  action: string;
  to: string;
  condition: string;
  type: string;
  notes: string;
};

type Matrix = { transitions: Transition[] };
type Screen = {
  id: string;
  screenId: string;
  proposal?: string;
  route: string;
  slug: string;
};

const repoRoot = path.resolve(import.meta.dirname, '../../../../../../');
const matrix = JSON.parse(
  readFileSync(
    path.join(
      repoRoot,
      'docs/framework/product/domains/inf/teat/ux-parity/mobile-matrix.json',
    ),
    'utf8',
  ),
) as Matrix;

const crashScreens = new Set([
  'crash-start',
  'crash-location',
  'crash-conditions',
  'crash-vehicles',
  'crash-people',
  'crash-victims',
  'crash-dynamics',
  'crash-sketch',
  'crash-evidence',
  'crash-ait-links',
  'crash-review',
]);

const expectedTransitions = matrix.transitions.filter(
  ({ from, to }) => crashScreens.has(from) || crashScreens.has(to),
);
const implementationTransitions = transitions as readonly Transition[];
const implementationDamagesTransitions =
  crashDamagesTransitions as readonly Transition[];

test('dado a matriz mobile quando extraio o grupo sinistros então preservo as 149 linhas na ordem', () => {
  assert.equal(expectedTransitions.length, 149);
  assert.deepEqual(implementationTransitions, expectedTransitions);
  assert.equal(implementationTransitions.length, 149);
});

test('dado a união das transições quando conto suas fronteiras então preservo origem, destino e internas', () => {
  assert.equal(
    implementationTransitions.filter(({ from }) => crashScreens.has(from))
      .length,
    94,
  );
  assert.equal(
    implementationTransitions.filter(({ to }) => crashScreens.has(to)).length,
    78,
  );
  assert.equal(
    implementationTransitions.filter(
      ({ from, to }) => crashScreens.has(from) && crashScreens.has(to),
    ).length,
    23,
  );
  assert.equal(
    new Set(
      implementationTransitions.map((transition) => JSON.stringify(transition)),
    ).size,
    149,
  );
});

test('dado S-12 quando verifico suas transições aditivas então ela entra entre S-10 e S-11 sem alterar a matriz', () => {
  const expectedDamagesTransitions: Transition[] = [
    {
      from: 'crash-ait-links',
      action: 'Continuar',
      to: 'crash-damages',
      condition: 'quando os dados mínimos da etapa estiverem completos',
      type: 'primary',
      notes: '',
    },
    {
      from: 'crash-damages',
      action: 'Continuar',
      to: 'crash-review',
      condition: 'quando os dados mínimos da etapa estiverem completos',
      type: 'primary',
      notes: '',
    },
  ];

  assert.deepEqual(
    implementationDamagesTransitions,
    expectedDamagesTransitions,
  );
  assert.equal(implementationDamagesTransitions.length, 2);
  assert.equal(
    implementationTransitions.some(
      ({ from, to }) => from === 'crash-damages' || to === 'crash-damages',
    ),
    false,
  );
});

const screens = [
  {
    id: 'S-01',
    screenId: 'crash-start',
    route: '/crash-start',
    slug: 'crash_start',
  },
  {
    id: 'S-02',
    screenId: 'crash-location',
    route: '/crash-location',
    slug: 'crash_location',
  },
  {
    id: 'S-03',
    screenId: 'crash-conditions',
    route: '/crash-conditions',
    slug: 'crash_conditions',
  },
  {
    id: 'S-04',
    screenId: 'crash-vehicles',
    route: '/crash-vehicles',
    slug: 'crash_vehicles',
  },
  {
    id: 'S-05',
    screenId: 'crash-people',
    route: '/crash-people',
    slug: 'crash_people',
  },
  {
    id: 'S-06',
    screenId: 'crash-victims',
    route: '/crash-victims',
    slug: 'crash_victims',
  },
  {
    id: 'S-07',
    screenId: 'crash-dynamics',
    route: '/crash-dynamics',
    slug: 'crash_dynamics',
  },
  {
    id: 'S-08',
    screenId: 'crash-sketch',
    route: '/crash-sketch',
    slug: 'crash_sketch',
  },
  {
    id: 'S-09',
    screenId: 'crash-evidence',
    route: '/crash-evidence',
    slug: 'crash_evidence',
  },
  {
    id: 'S-10',
    screenId: 'crash-ait-links',
    route: '/crash-ait-links',
    slug: 'crash_ait_links',
  },
  {
    id: 'S-12',
    screenId: 'crash-damages',
    route: '/crash-damages',
    slug: 'crash_damages',
  },
  {
    id: 'S-11',
    screenId: 'crash-review',
    route: '/crash-review',
    slug: 'crash_review',
  },
  {
    id: 'W-01',
    screenId: 'crashes-list',
    route: '/fiscalizacao/sinistros',
    slug: 'crash_list',
  },
  {
    id: 'W-02',
    screenId: 'crash-detail',
    route: '/fiscalizacao/sinistros/:id',
    slug: 'crash_detail',
  },
  {
    id: 'W-03',
    screenId: 'crash-complement',
    route: '/fiscalizacao/sinistros/:id/complementar',
    slug: 'crash_complement',
  },
  {
    id: 'W-04',
    screenId: 'renaest-integration',
    route: '/fiscalizacao/sinistros/:id/renaest',
    slug: 'crash_renaest',
  },
  {
    id: 'W-05',
    screenId: 'source_pending',
    proposal: 'OD-R15-003',
    route: '/fiscalizacao/sinistros/titular',
    slug: 'crash_subject_request',
  },
] satisfies readonly Screen[];

const expectedI18nKeys = {
  'boat.screens': [
    'boat.screens.crash_start.title',
    'boat.screens.crash_location.title',
    'boat.screens.crash_conditions.title',
    'boat.screens.crash_vehicles.title',
    'boat.screens.crash_people.title',
    'boat.screens.crash_victims.title',
    'boat.screens.crash_dynamics.title',
    'boat.screens.crash_sketch.title',
    'boat.screens.crash_evidence.title',
    'boat.screens.crash_ait_links.title',
    'boat.screens.crash_damages.title',
    'boat.screens.crash_review.title',
    'boat.screens.crash_list.title',
    'boat.screens.crash_detail.title',
    'boat.screens.crash_complement.title',
    'boat.screens.crash_renaest.title',
    'boat.screens.crash_subject_request.title',
  ],
  'boat.forms': [
    'boat.forms.crash_start.title',
    'boat.forms.crash_location.title',
    'boat.forms.crash_conditions.title',
    'boat.forms.crash_vehicles.title',
    'boat.forms.crash_people.title',
    'boat.forms.crash_victims.title',
    'boat.forms.crash_dynamics.title',
    'boat.forms.crash_sketch.title',
    'boat.forms.crash_evidence.title',
    'boat.forms.crash_damages.title',
    'boat.forms.crash_review.title',
    'boat.forms.crash_complement.title',
    'boat.forms.crash_renaest.title',
    'boat.forms.crash_subject_request.title',
  ],
  'boat.states': [
    'boat.states.RASCUNHO',
    'boat.states.EM_ATENDIMENTO',
    'boat.states.REGISTRADO',
    'boat.states.PENDENTE_COMPLEMENTO',
    'boat.states.VALIDADO',
    'boat.states.FECHADO',
    'boat.states.INTEGRADO',
    'boat.states.ARQUIVADO',
    'boat.states.CANCELADO',
    'boat.states.RECEBIDO',
    'boat.states.EM_ANALISE',
    'boat.states.CONSOLIDADO',
    'boat.states.REJEITADO',
    'boat.states.regime_176',
    'boat.states.regime_177',
    'boat.states.regime_178',
    'boat.states.condition_road',
    'boat.states.condition_weather',
    'boat.states.condition_lighting',
    'boat.states.condition_signage',
  ],
  'boat.errors': [
    'boat.errors.BOAT.ARCHIVE_NOT_TERMINAL',
    'boat.errors.BOAT.AUTH_REQUIRED',
    'boat.errors.BOAT.CANCEL_ONLY_DRAFT',
    'boat.errors.BOAT.CLOSE_REQUIRES_REVIEW',
    'boat.errors.BOAT.CONDITIONS_INCOMPLETE',
    'boat.errors.BOAT.CRASH_NOT_FOUND',
    'boat.errors.BOAT.CRASH_STATE_INVALID',
    'boat.errors.BOAT.CRASH_TERM_ACIDENTE_FORBIDDEN',
    'boat.errors.BOAT.CRASH_TYPE_NOT_IN_CATALOG',
    'boat.errors.BOAT.DAMAGE_ASSET_KIND_INVALID',
    'boat.errors.BOAT.DUTY_177_REQUIRES_DISTINCT_SUBJECT',
    'boat.errors.BOAT.DUTY_CODE_INVALID',
    'boat.errors.BOAT.DUTY_REGIME_MISMATCH',
    'boat.errors.BOAT.ENUM_INVALID',
    'boat.errors.BOAT.EVADED_FIELD_FORBIDDEN',
    'boat.errors.BOAT.FORBIDDEN_ACTION',
    'boat.errors.BOAT.IDEMPOTENCY_REPLAY',
    'boat.errors.BOAT.IF_MATCH_REQUIRED',
    'boat.errors.BOAT.INTERNAL',
    'boat.errors.BOAT.LINK_TARGET_NOT_FOUND',
    'boat.errors.BOAT.LOCATION_REQUIRED',
    'boat.errors.BOAT.MINIMUM_DATA_MISSING',
    'boat.errors.BOAT.OCCURRED_AFTER_RECORDED',
    'boat.errors.BOAT.PARTNER_INTAKE_DISABLED',
    'boat.errors.BOAT.PERSON_ROLE_INVALID',
    'boat.errors.BOAT.PUBLICATION_CELL_BELOW_THRESHOLD',
    'boat.errors.BOAT.PUBLICATION_INDIVIDUAL_FORBIDDEN',
    'boat.errors.BOAT.RECTIFY_REASON_REQUIRED',
    'boat.errors.BOAT.RECTIFY_TERMINAL',
    'boat.errors.BOAT.RENAEST_REJECTED',
    'boat.errors.BOAT.RENAEST_UNAVAILABLE',
    'boat.errors.BOAT.RETENTION_UNDEFINED',
    'boat.errors.BOAT.SEVERITY_INVALID',
    'boat.errors.BOAT.SEVERITY_REQUIRES_VICTIMS',
    'boat.errors.BOAT.SKETCH_TYPE_INVALID',
    'boat.errors.BOAT.SUBJECT_ERASURE_BLOCKED',
    'boat.errors.BOAT.SUBJECT_NOT_INVOLVED',
    'boat.errors.BOAT.SUBJECT_REQUEST_KIND_INVALID',
    'boat.errors.BOAT.SYNC_DUPLICATE_NATURAL_KEY',
    'boat.errors.BOAT.SYNC_EVIDENCE_PENDING',
    'boat.errors.BOAT.SYNC_INVALID_CRASH_RECORD',
    'boat.errors.BOAT.SYNC_LINK_UNRESOLVED',
    'boat.errors.BOAT.SYNC_VICTIMS_INCONSISTENT',
    'boat.errors.BOAT.TENANT_MISMATCH',
    'boat.errors.BOAT.THIRD_PARTY_DATA_MASKED',
    'boat.errors.BOAT.TRANSMIT_DUPLICATED',
    'boat.errors.BOAT.TRANSMIT_INCOMPLETE_DATA',
    'boat.errors.BOAT.TRANSMIT_LAYOUT_UNSUPPORTED',
    'boat.errors.BOAT.TRANSMIT_NOT_CLOSED',
    'boat.errors.BOAT.VALIDATION_FAILED',
    'boat.errors.BOAT.VALIDATION_LEVEL_INVALID',
    'boat.errors.BOAT.VEHICLE_LINK_INVALID',
    'boat.errors.BOAT.VERSION_CONFLICT',
    'boat.errors.BOAT.VICTIM_ACCESS_FORBIDDEN',
    'boat.errors.BOAT.VICTIM_DEATH_INCONSISTENT',
    'boat.errors.BOAT.VICTIM_NOTES_TOO_LONG',
    'boat.errors.BOAT.VICTIM_PERSON_REQUIRED',
    'boat.errors.BOAT.VICTIM_PURPOSE_REQUIRED',
    'boat.errors.BOAT.VICTIM_SEVERITY_REQUIRED',
    'boat.errors.BOAT.VICTIMS_WITHOUT_SEVERITY',
    'boat.errors.BOAT.WITNESS_IS_INVOLVED',
  ],
  'boat.legal': [
    'boat.legal.photo_scene_not_suffering',
    'boat.legal.national_record_final_no_correction',
  ],
} as const;

const pendingI18nKeys = [
  'boat.states.condition_road',
  'boat.states.condition_weather',
  'boat.states.condition_lighting',
  'boat.states.condition_signage',
  'boat.errors.BOAT.AUTH_REQUIRED',
  'boat.errors.BOAT.ENUM_INVALID',
  'boat.errors.BOAT.FORBIDDEN_ACTION',
  'boat.errors.BOAT.IDEMPOTENCY_REPLAY',
  'boat.errors.BOAT.IF_MATCH_REQUIRED',
  'boat.errors.BOAT.INTERNAL',
  'boat.errors.BOAT.TENANT_MISMATCH',
  'boat.errors.BOAT.VALIDATION_FAILED',
  'boat.errors.BOAT.VERSION_CONFLICT',
] as const;

test('dado o catálogo i18n BOAT quando verifico as chaves então preservo exatamente a ordem e as contagens por namespace', () => {
  const i18n = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'docs/framework/arch/i18n/boat.pt-BR.json'),
      'utf8',
    ),
  ) as Record<string, string>;

  for (const [namespace, expected] of Object.entries(expectedI18nKeys)) {
    const actual = Object.keys(i18n).filter((key) =>
      key.startsWith(`${namespace}.`),
    );
    assert.deepEqual(actual, expected);
    assert.equal(actual.length, expected.length);
  }
  assert.equal(Object.keys(i18n).length, 114);
});

test('dado o catálogo de erros BOAT quando comparo a fonte normativa então os 61 códigos são exatamente iguais', () => {
  const i18n = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'docs/framework/arch/i18n/boat.pt-BR.json'),
      'utf8',
    ),
  ) as Record<string, string>;
  const errorCatalog = readFileSync(
    path.join(repoRoot, 'docs/framework/arch/boat-error-catalog.md'),
    'utf8',
  );
  const catalogCodes = [...errorCatalog.matchAll(/BOAT\.[A-Z0-9_]+/g)].map(
    ([code]) => `boat.errors.${code}`,
  );
  assert.deepEqual(
    [...catalogCodes].sort(),
    [...expectedI18nKeys['boat.errors']].sort(),
  );
  assert.deepEqual(
    Object.keys(i18n).filter((key) => key.startsWith('boat.errors.')),
    expectedI18nKeys['boat.errors'],
  );
  assert.equal(catalogCodes.length, 61);
});

test('dado o catálogo i18n BOAT quando verifico os valores então há 13 pendências exatas e nenhum valor vazio', () => {
  const i18n = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'docs/framework/arch/i18n/boat.pt-BR.json'),
      'utf8',
    ),
  ) as Record<string, string>;
  assert.deepEqual(
    Object.keys(i18n).filter((key) => i18n[key].startsWith('source_pending:')),
    pendingI18nKeys,
  );
  assert.equal(pendingI18nKeys.length, 13);
  for (const [key, value] of Object.entries(i18n)) {
    assert.notEqual(value, '');
    if (!pendingI18nKeys.includes(key as (typeof pendingI18nKeys)[number]))
      assert.doesNotMatch(value, /^source_pending:/);
  }
});

test('dado as 17 fichas quando verifico identidade rota e i18n então cada par do contrato existe', () => {
  const i18n = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'docs/framework/arch/i18n/boat.pt-BR.json'),
      'utf8',
    ),
  ) as Record<string, string>;

  assert.equal(screens.length, 17);
  for (const { id, screenId, proposal, route, slug } of screens) {
    const ficha = readFileSync(
      path.join(
        repoRoot,
        `docs/framework/product/domains/est/boat/screens/IU-BOAT-${id}.md`,
      ),
      'utf8',
    );
    if (proposal) {
      assert.equal(screenId, 'source_pending');
      assert.match(ficha, new RegExp(proposal));
    } else {
      assert.match(ficha, new RegExp(`Identidade: screenId ${screenId}[,.]`));
    }
    assert.match(ficha, new RegExp(`Rota: ${route.replaceAll('/', '\\/')}`));
    assert.match(ficha, new RegExp(`Slug/i18n: ${slug}[;.]`));
    assert.ok(`boat.screens.${slug}.title` in i18n);
  }
});
