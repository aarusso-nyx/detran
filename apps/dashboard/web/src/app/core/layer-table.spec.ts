// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "core/layer-table.spec.ts" (C-02-23..24).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_LAYER_BY_ROLE,
  dashboardLayerAllows,
  dashboardLayerFor,
} from './layer-table.js';
import {
  LAYER_BY_ROLE_FIXTURE,
  layerAllowsFixture,
  layerForFixture,
} from '../../testing/layer-table.fixture.js';
import { DETRAN_ROLES_FIXTURE } from '../../testing/roles.fixture.js';
import { APP_SRC_ROOT, listAppSourceFiles } from '../../testing/kb.js';

describe('core/layer-table.ts', () => {
  it('dado DASHBOARD_LAYER_BY_ROLE quando comparado a LAYER_BY_ROLE_FIXTURE então 14 entradas iguais, nenhuma a mais (C-02-23)', () => {
    const actualEntries = Object.entries(DASHBOARD_LAYER_BY_ROLE);
    expect(actualEntries).toHaveLength(14);
    expect(DASHBOARD_LAYER_BY_ROLE).toEqual(LAYER_BY_ROLE_FIXTURE);
  });

  it.each(DETRAN_ROLES_FIXTURE)(
    'dado o papel %s quando dashboardLayerFor([papel]) então = layerForFixture([papel]) (C-02-23)',
    (role) => {
      expect(dashboardLayerFor([role])).toBe(layerForFixture([role]));
    },
  );

  it('dado [dash-operator, AUDITOR] quando dashboardLayerFor então N2 (máximo) (C-02-23)', () => {
    expect(dashboardLayerFor(['dash-operator', 'AUDITOR'])).toBe('N2');
  });
  it('dado [auditor] (alias) quando dashboardLayerFor então N2 (C-02-23)', () => {
    expect(dashboardLayerFor(['auditor'])).toBe('N2');
  });
  it('dado [] quando dashboardLayerFor então N0 (C-02-23)', () => {
    expect(dashboardLayerFor([])).toBe('N0');
  });

  it.each(['N0', 'N1', 'N2', 'N3'] as const)(
    'dado dashboardLayerAllows quando comparado a layerAllowsFixture para a camada %s então iguais para cada um dos 36 papéis (C-02-23)',
    (required) => {
      for (const role of DETRAN_ROLES_FIXTURE) {
        expect(dashboardLayerAllows([role], required)).toBe(
          layerAllowsFixture([role], required),
        );
      }
    },
  );

  it('dado dashboardLayerAllows([AUDITOR], camada) quando N2/N1/N0 então true nas três (C-02-23)', () => {
    expect(dashboardLayerAllows(['AUDITOR'], 'N2')).toBe(true);
    expect(dashboardLayerAllows(['AUDITOR'], 'N1')).toBe(true);
    expect(dashboardLayerAllows(['AUDITOR'], 'N0')).toBe(true);
  });
  it('dado dashboardLayerAllows([bi-analyst], N2) então false (C-02-23)', () => {
    expect(dashboardLayerAllows(['bi-analyst'], 'N2')).toBe(false);
  });

  it("dado o texto de core/layer-table.ts quando lido então contém 'transcrição de policy.ts' e 'OD-D16-006' e não contém 'backend/' nem '@detran/shared' (C-02-24)", () => {
    // A7(6): lido pelo caminho de `kb.ts` (`join` sobre `APP_SRC_ROOT`) — o transform JIT do
    // vitest não resolve `fileURLToPath(new URL(...))` neste arquivo.
    const path = join(APP_SRC_ROOT, 'app/core/layer-table.ts');
    const text = readFileSync(path, 'utf8');
    expect(text).toContain('transcrição de policy.ts');
    expect(text).toContain('OD-D16-006');
    expect(text).not.toContain('backend/');
    expect(text).not.toContain('@detran/shared');
  });

  it("dado listAppSourceFiles() quando varridos então nenhum importa '@detran/shared' nem caminho com 'backend/' (ADR-0001) (C-02-24)", () => {
    for (const file of listAppSourceFiles()) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from\s+['"]@detran\/shared/);
      expect(text, file).not.toMatch(/from\s+['"][^'"]*backend\//);
    }
  });
});
