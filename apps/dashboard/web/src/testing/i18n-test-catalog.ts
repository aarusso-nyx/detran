// R-0016 TASK-0004 (Inspector). Forma de `apps/portal/web/src/testing/i18n-test-catalog.ts`:
// cada chave esperada mapeia para um marcador único, então nenhuma letra deve sobrar fora dos
// marcadores — prova de que nenhum literal escapa do catálogo real (`dashboard.pt-BR.json`) e de
// que o componente só usa as chaves declaradas (`CTG-0002.md` §10, §12).
import { TestBed } from '@angular/core/testing';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';

export function markerFor(key: string): string {
  return `MARCADOR::${key}::FIM`;
}

export function buildTestCatalog(
  keys: readonly string[],
): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, markerFor(key)]));
}

/** Remove todos os marcadores das `keys` do texto; o que sobrar não deveria conter letras. */
export function withoutMarkers(text: string, keys: readonly string[]): string {
  return keys.reduce((acc, key) => acc.split(markerFor(key)).join(''), text);
}

/** `imports:` de `StynxI18nModule.forRoot` com um catálogo de marcadores para `keys`. */
export function markerI18nModule(keys: readonly string[]) {
  const catalog = buildTestCatalog(keys);
  return StynxI18nModule.forRoot({
    defaultLocale: 'pt-BR',
    loadCatalog: async () => catalog,
  });
}

/** Chamar depois de `TestBed.configureTestingModule({ imports: [markerI18nModule(keys)] })`. */
export async function initializeMarkerI18n(): Promise<void> {
  await TestBed.inject(StynxI18nService).initialize();
}
