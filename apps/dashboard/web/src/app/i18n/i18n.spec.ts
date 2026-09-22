// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "src/app/i18n/i18n.spec.ts" (C-02-74..77).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  listAppSourceFiles,
  readAppCatalog,
  readSeedCatalog,
} from '../../testing/kb.js';
import { DASHBOARD_ROUTE_MANIFEST_FIXTURE } from '../../testing/route-manifest.fixture.js';
import { readSheet } from '../../testing/kb.js';

const NAMESPACES = [
  'a11y',
  'alert_states',
  'blocks',
  'classification',
  'clocks',
  'common',
  'duty_states',
  'errors',
  'forms',
  'freshness',
  'indicators',
  'layers',
  'screens',
  'severity',
  'shell',
  'states',
] as const;

// Prefixos de composição terminados em ponto e os 11 namespaces de tokenKey (§10 proibição) —
// exceções à busca de literais fora da semente (C-02-75).
const COMPOSITION_PREFIXES = [
  'dashboard.indicators.',
  'dashboard.errors.',
  'dashboard.alert_states.',
  'dashboard.duty_states.',
  'dashboard.severity.',
  'dashboard.freshness.',
  'dashboard.blocks.',
  'dashboard.layers.',
  'dashboard.classification.',
  'dashboard.screens.',
  'dashboard.shell.',
];

describe('i18n.spec.ts (C-02-74)', () => {
  it('dado readSeedCatalog() quando comparado a readAppCatalog() então mesmas chaves, mesma ordem e valores idênticos; nenhum {{; todo placeholder casa {x}', () => {
    const seed = readSeedCatalog();
    const app = readAppCatalog();
    expect(Object.keys(app)).toEqual(Object.keys(seed));
    expect(app).toEqual(seed);
    for (const [key, value] of Object.entries(app)) {
      expect(value, key).not.toContain('{{');
      const placeholders = [...value.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
      for (const placeholder of placeholders) {
        expect(placeholder, `${key}: {${placeholder}}`).toMatch(
          /^[a-z][a-z0-9_]*$/,
        );
      }
    }
  });

  it('dado a semente quando as chaves são lidas então todas com prefixo de um dos 16 namespaces (M5)', () => {
    const seed = readSeedCatalog();
    for (const key of Object.keys(seed)) {
      const ns = key.split('.')[1];
      expect(NAMESPACES, key).toContain(ns);
    }
  });
});

describe('i18n.spec.ts (C-02-75)', () => {
  it('dado listAppSourceFiles() quando varridos então todo literal dashboard.<ns...> com ≥2 pontos existe no catálogo, exceto prefixos e namespaces de composição', () => {
    const catalog = readAppCatalog();
    const literalPattern = /['"`](dashboard\.[a-z0-9_.]+)['"`]/g;
    for (const file of listAppSourceFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(literalPattern)) {
        const literal = match[1];
        const dots = literal.split('.').length - 1;
        if (dots < 2) continue;
        if (COMPOSITION_PREFIXES.some((prefix) => literal === prefix)) continue;
        if (literal.endsWith('.')) continue;
        expect(catalog, `${literal} em ${file}`).toHaveProperty(literal);
      }
    }
  });

  // A7(8): o título não cita os literais contíguos (senão este próprio arquivo, ao ser
  // varrido por severity-chip.component.spec.ts/clock-governor-badge.component.spec.ts,
  // falharia contra si mesmo); os literais em si só existem montados por concatenação abaixo.
  it('dado listAppSourceFiles() quando varridos então nenhum literal de forma de severidade (A4) nem das letras A/D de relógio (OD-D16-007)', () => {
    const forbidden = [
      ['dashboard', 'severity', 'shape'].join('.'),
      ['dashboard', 'clocks', 'a'].join('.'),
      ['dashboard', 'clocks', 'd'].join('.'),
    ];
    for (const file of listAppSourceFiles()) {
      if (file.endsWith('i18n/i18n.spec.ts')) continue;
      if (file.includes('severity-chip.component.spec.ts')) continue;
      if (file.includes('clock-governor-badge.component.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      for (const literal of forbidden) {
        expect(text, `${literal} em ${file}`).not.toContain(literal);
      }
    }
  });
});

describe('i18n.spec.ts (C-02-76)', () => {
  const STATIC_KEYS = [
    'dashboard.shell.brand',
    'dashboard.a11y.skip_to_content',
    'dashboard.a11y.nav_main',
    'dashboard.a11y.live_region',
    'dashboard.common.action.logout',
    'dashboard.states.unavailable',
    'dashboard.shell.title.sem_permissao',
    'dashboard.states.forbidden',
    'dashboard.errors.forbidden_action',
    'dashboard.common.action.back',
    'dashboard.shell.title.auth_callback',
    'dashboard.states.loading',
    'dashboard.states.error',
    'dashboard.states.conflict',
    'dashboard.states.empty',
    'dashboard.states.blocked_by_decision',
    'dashboard.states.unavailable_in_version',
    'dashboard.errors.panel_blocked_by_decision',
    'dashboard.common.action.retry',
    'dashboard.freshness.fresco',
    'dashboard.freshness.atrasado',
    'dashboard.freshness.indisponivel',
    'dashboard.freshness.desatualizado_marcado',
    'dashboard.states.stale',
    'dashboard.common.as_of',
    'dashboard.errors.cell_suppressed',
    'dashboard.errors.cell_threshold_undefined',
    'dashboard.errors.classification_missing',
    'dashboard.errors.duty_evidence_required',
    'dashboard.errors.duty_evidence_hash_invalid',
    'dashboard.errors.export_format_not_open',
    'dashboard.errors.export_volume_approval_required',
    'dashboard.common.deep_link',
    'dashboard.common.manual',
  ];

  it.each(STATIC_KEYS)(
    'dado a chave estática %s então existe no catálogo do app',
    (key) => {
      expect(readAppCatalog()).toHaveProperty(key);
    },
  );

  it('dado ALERT_STATES/DUTY_STATES/SEVERITY_LEVELS/FRESHNESS_STATES/blocos/camadas/classificações/indicadores/erros quando compostos então as chaves existem', async () => {
    const catalog = readAppCatalog();
    const { ALERT_STATES, DUTY_STATES, SEVERITY_LEVELS, FRESHNESS_STATES } =
      await import('../shared/models.js');
    for (const state of ALERT_STATES) {
      expect(catalog).toHaveProperty(
        `dashboard.alert_states.${state.toLowerCase()}`,
      );
    }
    for (const state of DUTY_STATES) {
      expect(catalog).toHaveProperty(
        `dashboard.duty_states.${state.toLowerCase()}`,
      );
    }
    for (const level of SEVERITY_LEVELS) {
      expect(catalog).toHaveProperty(
        `dashboard.severity.${level.toLowerCase()}`,
      );
    }
    for (const state of FRESHNESS_STATES) {
      expect(catalog).toHaveProperty(
        `dashboard.freshness.${state.toLowerCase()}`,
      );
    }
    for (const block of ['a', 'b', 'c', 'd']) {
      expect(catalog).toHaveProperty(`dashboard.blocks.${block}`);
    }
    for (const layer of ['n0', 'n1', 'n2', 'n3']) {
      expect(catalog).toHaveProperty(`dashboard.layers.${layer}`);
    }
    for (const classification of ['p1', 'p2', 'p3']) {
      expect(catalog).toHaveProperty(
        `dashboard.classification.${classification}`,
      );
    }
    for (let i = 101; i <= 111; i += 1) {
      expect(catalog).toHaveProperty(`dashboard.indicators.ind_dash_${i}`);
    }
    for (let i = 201; i <= 209; i += 1) {
      expect(catalog).toHaveProperty(`dashboard.indicators.ind_dash_${i}`);
    }
    for (let i = 301; i <= 314; i += 1) {
      expect(catalog).toHaveProperty(`dashboard.indicators.ind_dash_${i}`);
    }
    for (let i = 401; i <= 408; i += 1) {
      expect(catalog).toHaveProperty(`dashboard.indicators.ind_dash_${i}`);
    }
    const { DASH_ERROR_CODES } = await import('../core/error-boundary.js');
    for (const code of DASH_ERROR_CODES) {
      expect(catalog).toHaveProperty(
        `dashboard.errors.${code.replace('DASH.', '').toLowerCase()}`,
      );
    }
  });
});

describe('i18n.spec.ts (C-02-77)', () => {
  const TOP_LEVEL = DASHBOARD_ROUTE_MANIFEST_FIXTURE.filter(
    (entry) => entry.parent === null,
  );
  const PAGES = TOP_LEVEL.filter((entry) => entry.sheet !== null);

  it.each(TOP_LEVEL)(
    'dado o slug $slug então dashboard.shell.title.<slug_> existe (20 slugs)',
    (entry) => {
      const catalog = readAppCatalog();
      const segment = entry.slug.replace(/-/g, '_');
      expect(catalog).toHaveProperty(`dashboard.shell.title.${segment}`);
    },
  );

  it.each(PAGES)(
    'dado a rota com ficha $sheet então dashboard.screens.<slug_>.{title,intro,empty} existem (54) e title bate com a ficha (C-01-03)',
    (entry) => {
      const catalog = readAppCatalog();
      const segment = entry.slug.replace(/-/g, '_');
      expect(catalog).toHaveProperty(`dashboard.screens.${segment}.title`);
      expect(catalog).toHaveProperty(`dashboard.screens.${segment}.intro`);
      expect(catalog).toHaveProperty(`dashboard.screens.${segment}.empty`);
      const sheet = readSheet(entry.sheet as string);
      expect(catalog[`dashboard.screens.${segment}.title`]).toBe(sheet.title);
    },
  );

  it('dado o catálogo do app quando lido então nenhuma outra chave dashboard.screens.* além das 54', () => {
    const catalog = readAppCatalog();
    const screenKeys = Object.keys(catalog).filter((key) =>
      key.startsWith('dashboard.screens.'),
    );
    expect(screenKeys).toHaveLength(54);
  });
});
