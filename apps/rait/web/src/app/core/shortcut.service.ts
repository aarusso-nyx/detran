// Atalhos globais (spec §5.1 e §10.4; contrato CTG-0002a §7): mapa fechado tecla → ação, um
// único listener de `keydown` em `document` (removido em `DestroyRef`). Ignora eventos com
// `ctrlKey|metaKey|altKey`, repetidos (`event.repeat`) e alvos de texto (`SHORTCUT_IGNORED_TARGETS`,
// inclusive por `closest`). `preventDefault` só quando há handler. Acorde `g` + `f|p` sem timeout:
// qualquer outra tecla cancela. `go-queue`/`go-dashboard`/`help` são registrados pelo shell; os
// demais pelas páginas (CTG-0002b) — sem handler, a tecla é ignorada.
import {
  DestroyRef,
  DOCUMENT,
  Injectable,
  inject,
  signal,
} from '@angular/core';

export const RAIT_SHORTCUTS = {
  'claim-next': ['n'],
  'go-queue': ['g', 'f'],
  'go-dashboard': ['g', 'p'],
  help: ['?'],
  'list-next': ['j'],
  'list-prev': ['k'],
  open: ['Enter'],
  triage: ['t'],
  inquiry: ['d'],
  vote: ['v'],
} as const;

export type RaitShortcutKey = keyof typeof RAIT_SHORTCUTS;

export const SHORTCUT_IGNORED_TARGETS =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

export interface RaitShortcutBinding {
  readonly key: RaitShortcutKey;
  readonly keys: readonly string[];
  readonly labelKey: string;
}

const SHORTCUT_KEYS = Object.keys(RAIT_SHORTCUTS) as readonly RaitShortcutKey[];
const CHORD_PREFIX = 'g';
const LABEL_PREFIX = 'rait.shell.shortcut_';

/** `rait.shell.shortcut_<key_snake>` (§9). */
export function shortcutLabelKey(key: RaitShortcutKey): string {
  return `${LABEL_PREFIX}${key.replace(/-/g, '_')}`;
}

/** Bindings na ordem do mapa (para o diálogo de ajuda). */
export const RAIT_SHORTCUT_BINDINGS: readonly RaitShortcutBinding[] =
  SHORTCUT_KEYS.map((key) => ({
    key,
    keys: RAIT_SHORTCUTS[key],
    labelKey: shortcutLabelKey(key),
  }));

@Injectable({ providedIn: 'root' })
export class ShortcutService {
  private readonly document = inject(DOCUMENT);
  private readonly handlers = new Map<RaitShortcutKey, () => void>();
  private readonly pendingChordState = signal<'g' | null>(null);
  private readonly listener = (event: KeyboardEvent) => this.onKeydown(event);

  /** Após `g`, aguarda `f` | `p`; qualquer outra tecla cancela (sem timeout). */
  readonly pendingChord = this.pendingChordState.asReadonly();
  readonly bindings = signal(RAIT_SHORTCUT_BINDINGS).asReadonly();

  constructor() {
    this.document.addEventListener('keydown', this.listener);
    inject(DestroyRef).onDestroy(() =>
      this.document.removeEventListener('keydown', this.listener),
    );
  }

  /** Substitui o handler anterior da mesma chave; devolve o `unregister`. */
  register(key: RaitShortcutKey, handler: () => void): () => void {
    this.handlers.set(key, handler);
    return () => {
      if (this.handlers.get(key) === handler) this.handlers.delete(key);
    };
  }

  unregister(key: RaitShortcutKey): void {
    this.handlers.delete(key);
  }

  private onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    if (isIgnoredTarget(event.target)) return;
    const pending = this.pendingChordState();
    if (pending !== null) {
      this.pendingChordState.set(null);
      this.dispatch(event, [pending, event.key]);
      return;
    }
    if (event.key === CHORD_PREFIX) {
      this.pendingChordState.set(CHORD_PREFIX);
      return;
    }
    this.dispatch(event, [event.key]);
  }

  private dispatch(event: KeyboardEvent, keys: readonly string[]): void {
    const match = SHORTCUT_KEYS.find((key) =>
      sameKeys(RAIT_SHORTCUTS[key], keys),
    );
    const handler = match ? this.handlers.get(match) : undefined;
    if (!handler) return;
    event.preventDefault();
    handler();
  }
}

function sameKeys(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((key, index) => key === b[index]);
}

function isIgnoredTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest(SHORTCUT_IGNORED_TARGETS) !== null
  );
}
