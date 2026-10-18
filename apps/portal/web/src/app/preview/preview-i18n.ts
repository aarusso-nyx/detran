// The isolated overlay is merged only by preview.providers.ts. Derive keys from its type:
// base-catalog source scanning stays unchanged, and preview cannot reference an absent key.
import overlay from './preview.pt-BR.json';
import {
  PREVIEW_SCREEN_STATES,
  PREVIEW_PERSONAS,
} from './preview-state.service';

type PreviewScope = 'states' | 'shell';
type NameOf<
  Key,
  Scope extends PreviewScope,
> = Key extends `portal.${Scope}.preview_${infer Name}` ? Name : never;
type PreviewName<Scope extends PreviewScope> = NameOf<
  keyof typeof overlay,
  Scope
>;

export function previewKey<Scope extends PreviewScope>(
  scope: Scope,
  name: PreviewName<Scope>,
): keyof typeof overlay {
  const key = `portal.${scope}.preview_${name}` as keyof typeof overlay;
  if (!Object.hasOwn(overlay, key))
    throw new Error(`Missing preview translation: ${key}`);
  return key;
}

/** Complete isolated-overlay key inventory, including every state and session preset. */
export const PREVIEW_USED_KEYS: readonly (keyof typeof overlay)[] = [
  previewKey('states', 'mark'),
  previewKey('states', 'not_functional'),
  previewKey('states', 'source_pending'),
  previewKey('shell', 'region'),
  previewKey('shell', 'state'),
  previewKey('shell', 'role'),
  ...PREVIEW_SCREEN_STATES.map((state) =>
    previewKey('shell', `state_${state}`),
  ),
  ...PREVIEW_PERSONAS.map((role) => previewKey('shell', `role_${role}`)),
];
