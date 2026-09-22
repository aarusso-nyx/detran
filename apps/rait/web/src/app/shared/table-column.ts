// Forma da coluna do `StynxTableComponent` (`StynxTableColumn` de `@stynx-nyx/angular-ui` 1.3.1:
// `{ key: keyof TRecord & string; label: string }`), declarada estruturalmente porque `@detran/ui`
// reexporta o componente mas não o tipo (OD-R12-025 registra a lacuna de reexports do kit).
export interface TableColumn<TRecord extends Record<string, unknown>> {
  readonly key: keyof TRecord & string;
  readonly label: string;
}
