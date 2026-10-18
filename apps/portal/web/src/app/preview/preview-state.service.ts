// R-0033 TASK-0007: immutable state/profile per document, frontend-preview-mode.md D-01.
// Profiles transcribe SESSION_FACADE_PRESETS; changing a selector reloads to re-run real guards.
import { DOCUMENT } from '@angular/common';
import {
  Injectable,
  Injector,
  InjectionToken,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import { Router } from '@angular/router';
// Source: src/testing/session-facade.stub.ts SESSION_FACADE_PRESETS.
export const PREVIEW_PERSONAS = [
  'anonimo',
  'simples',
  'avancada',
  'qualificada',
] as const;
export type PreviewPersona = (typeof PREVIEW_PERSONAS)[number];

export type PreviewScreenState =
  'loaded' | 'empty' | 'loading' | 'error' | 'forbidden';

/** Ordem do seletor (contrato §2/§3). */
export const PREVIEW_SCREEN_STATES: readonly PreviewScreenState[] = [
  'loaded',
  'empty',
  'loading',
  'error',
  'forbidden',
];

export const PREVIEW_STATE_PARAM = 'pv_estado';
export const PREVIEW_ROLE_PARAM = 'pv_papel';

const DEFAULT_STATE: PreviewScreenState = 'loaded';
const DEFAULT_ROLE: PreviewPersona = 'avancada';

/** D-01: navegação de documento; os specs substituem o token. */
export const PREVIEW_DOCUMENT_NAVIGATE = new InjectionToken<
  (url: string) => void
>('PREVIEW_DOCUMENT_NAVIGATE', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return (url: string) => document.location.assign(url);
  },
});

function isScreenState(value: string | null): value is PreviewScreenState {
  return (
    value !== null &&
    (PREVIEW_SCREEN_STATES as readonly string[]).includes(value)
  );
}

function isRole(value: string | null): value is PreviewPersona {
  return (
    value !== null && (PREVIEW_PERSONAS as readonly string[]).includes(value)
  );
}

@Injectable({ providedIn: 'root' })
export class PreviewStateService {
  private readonly injector = inject(Injector);
  private get router(): Router {
    return this.injector.get(Router);
  }
  private readonly navigate = inject(PREVIEW_DOCUMENT_NAVIGATE);

  private readonly stateValue = signal<PreviewScreenState>(DEFAULT_STATE);
  private readonly roleValue = signal<PreviewPersona>(DEFAULT_ROLE);

  readonly state: Signal<PreviewScreenState> = this.stateValue.asReadonly();
  readonly role: Signal<PreviewPersona> = this.roleValue.asReadonly();

  constructor() {
    const params = new URLSearchParams(inject(DOCUMENT).location.search);
    const state = params.get(PREVIEW_STATE_PARAM);
    const role = params.get(PREVIEW_ROLE_PARAM);
    if (isScreenState(state)) this.stateValue.set(state);
    if (isRole(role)) this.roleValue.set(role);
  }

  /** D-01: URL atual (`Router.url`) com `pv_estado` (e o papel corrente) mesclados. */
  setState(state: PreviewScreenState): void {
    const tree = this.router.parseUrl(this.router.url);
    tree.queryParams = {
      ...tree.queryParams,
      [PREVIEW_ROLE_PARAM]: this.roleValue(),
      [PREVIEW_STATE_PARAM]: state,
    };
    this.navigate(this.router.serializeUrl(tree));
  }

  /** D-01: `/?pv_papel=<papel>&pv_estado=<atual>` — entrada pública do Portal. */
  setRole(role: PreviewPersona): void {
    const params = new URLSearchParams({
      [PREVIEW_ROLE_PARAM]: role,
      [PREVIEW_STATE_PARAM]: this.stateValue(),
    });
    this.navigate(`/?${params.toString()}`);
  }
}
