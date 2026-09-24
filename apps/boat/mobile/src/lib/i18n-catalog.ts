import catalog from './i18n/boat.pt-BR.json';

export const BOAT_PT_BR_CATALOG: Readonly<Record<string, string>> = catalog;

export function translateBoat(key: string): string | undefined {
  const value = BOAT_PT_BR_CATALOG[key];
  return value?.startsWith('source_pending:') ? undefined : value;
}
