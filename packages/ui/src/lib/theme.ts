/** DETRAN CSS token values. Import `@detran/ui/styles` once from each application root. */
export const DETRAN_THEME_TOKENS = {
  primary: '#005ca9',
  primaryStrong: '#003f73',
  accent: '#f6c900',
  surface: '#ffffff',
  surfaceMuted: '#f3f6f8',
  text: '#172b3a',
  danger: '#b42318',
} as const;

export type DetranTheme = 'light' | 'dark';

/** Sets the documented theme selector without coupling the kit to an app's persistence choice. */
export function setDetranTheme(
  theme: DetranTheme,
  documentRef: Document = document,
): void {
  documentRef.documentElement.dataset['detranTheme'] = theme;
}
