// R-0014 TASK-0007 (Inspector). Contrato do mapa de tradução (plan.md M9; prompts/TASK-0007.md
// §Tarefa item 3). Listas fechadas em src/testing/kb.ts, fonte em comentário — nenhum valor
// inventado aqui: as constantes vêm de INFRACTION_SITUATION_MAP, REQUEST_TRANSITIONS e
// PROCESS_TIMELINE_DOMAIN_EVENTS, transcritas por TASK-0006 e copiadas ao prompt de TASK-0007.
//
// `badge_of`: o maestro confirmou (relatório de entrega, atualização de 2026-09-17, com base nos
// relatórios TASK-0006/TASK-0006-iteration-2 e na adenda OD-P56 de plan.md) que o catálogo real
// só define `badge_of` para os 4 estados com correspondência inequívoca na fonte — o critério
// aqui é "chaves ⊆ 13 estados e valores ⊆ 5 badges", não completude sobre os 13 estados.
import {
  BADGES,
  INFRACTION_SITUATIONS,
  readCatalog,
  readErrorCatalogCodes,
  REQUEST_STATES,
  TIMELINE_EVENTS,
} from '../../testing/kb';

function keysWithPrefix(
  catalog: Record<string, string>,
  prefix: string,
): string[] {
  return Object.keys(catalog)
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
}

describe('contrato do mapa de tradução (M9)', () => {
  const catalog = readCatalog();

  it('dado o catálogo quando portal.situation.infraction.* é lido então tem exatamente as 7 situações', () => {
    const found = keysWithPrefix(
      catalog,
      'portal.situation.infraction.',
    ).sort();
    expect(found).toEqual([...INFRACTION_SITUATIONS].sort());
  });

  it('dado o catálogo quando portal.situation.request.* é lido então tem exatamente os 13 estados', () => {
    const found = keysWithPrefix(catalog, 'portal.situation.request.').sort();
    expect(found).toEqual([...REQUEST_STATES].sort());
  });

  it('dado o catálogo quando portal.situation.badge.* é lido então tem exatamente os 5 badges', () => {
    const found = keysWithPrefix(catalog, 'portal.situation.badge.').sort();
    expect(found).toEqual([...BADGES].sort());
  });

  it('dado o catálogo quando portal.situation.badge_of.* é lido então as chaves ⊆ 13 estados e os valores ⊆ 5 badges', () => {
    const entries = Object.entries(catalog).filter(([key]) =>
      key.startsWith('portal.situation.badge_of.'),
    );
    expect(entries.length).toBeGreaterThan(0);
    const badStates = entries
      .map(([key]) => key.slice('portal.situation.badge_of.'.length))
      .filter(
        (state) => !(REQUEST_STATES as readonly string[]).includes(state),
      );
    expect(badStates, `estados fora dos 13: ${badStates.join(', ')}`).toEqual(
      [],
    );
    const badValues = entries
      .map(([, value]) => value)
      .filter((value) => !(BADGES as readonly string[]).includes(value));
    expect(
      badValues,
      `valores fora dos 5 badges: ${badValues.join(', ')}`,
    ).toEqual([]);
  });

  it('dado o catálogo quando portal.situation.event.* é lido então tem exatamente os 7 eventos', () => {
    const found = keysWithPrefix(catalog, 'portal.situation.event.').sort();
    expect(found).toEqual([...TIMELINE_EVENTS].sort());
  });

  it('dado o catálogo quando portal.requests.nextAction.* é lido então tem exatamente os 13 estados', () => {
    const found = keysWithPrefix(catalog, 'portal.requests.nextAction.').sort();
    expect(found).toEqual([...REQUEST_STATES].sort());
  });

  it('dado o catálogo quando portal.evaluations.publicIndicator é lido então existe e não é vazio', () => {
    expect(
      catalog['portal.evaluations.publicIndicator']?.length,
    ).toBeGreaterThan(0);
  });

  it('dado todo valor do catálogo quando inspecionado então nenhum casa ^[A-Z][A-Z_0-9]{3,}$ (token interno não vaza)', () => {
    const leaked = Object.entries(catalog).filter(([, value]) =>
      /^[A-Z][A-Z_0-9]{3,}$/.test(value),
    );
    expect(
      leaked.map(([key]) => key),
      `valores que vazam token interno: ${leaked.map(([key, value]) => `${key}=${value}`).join(', ')}`,
    ).toEqual([]);
  });

  it('dado todo valor do catálogo quando inspecionado então nenhum contém "acesso negado"', () => {
    const offenders = Object.entries(catalog).filter(([, value]) =>
      /acesso negado/i.test(value),
    );
    expect(
      offenders.map(([key]) => key),
      `chaves com "acesso negado": ${offenders.map(([key]) => key).join(', ')}`,
    ).toEqual([]);
  });

  it('dado o catálogo de erros (portal-error-catalog.md) quando comparado a portal.errors.* então a correspondência é bidirecional', () => {
    const errorCodes = readErrorCatalogCodes();
    const errorKeys = Object.keys(catalog).filter((key) =>
      key.startsWith('portal.errors.'),
    );
    const keysWithoutCode = errorKeys.filter(
      (key) =>
        !errorCodes.has(key.slice('portal.errors.'.length).toUpperCase()),
    );
    expect(
      keysWithoutCode,
      `chaves portal.errors.* sem código no catálogo: ${keysWithoutCode.join(', ')}`,
    ).toEqual([]);

    const keySet = new Set(
      errorKeys.map((key) => key.slice('portal.errors.'.length).toUpperCase()),
    );
    const codesWithoutKey = [...errorCodes].filter((code) => !keySet.has(code));
    expect(
      codesWithoutKey,
      `códigos do catálogo sem chave portal.errors.*: ${codesWithoutKey.join(', ')}`,
    ).toEqual([]);
  });
});
