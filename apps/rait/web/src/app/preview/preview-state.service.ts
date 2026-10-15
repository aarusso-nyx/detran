// Estado e papel da prévia (R-0033 TASK-0003; `frontend-preview-mode.md` §2, §3, D-01, D-02,
// D-09, D-10). O estado vive só na URL do documento (`?pv_estado=&pv_papel=`): é lido de
// `DOCUMENT.location.search` uma única vez, no construtor (antes da primeira navegação e das
// guardas); valor fora de `PREVIEW_SCREEN_STATES`/`RAIT_ALL_ROLES` → padrão (`loaded`,
// `rait-analyst`). Trocar estado ou papel é NAVEGAÇÃO DE DOCUMENTO (D-01, que prevalece sobre o
// `queryParamsHandling: 'merge'` do layout): com `PreviewClock` constante o cache das leituras
// nunca expira, as facades são `root` e as guardas precisam rodar de novo — só um injetor novo
// garante as três coisas sem tocar `core/`/`data/`. Os signals não mudam dentro do documento.
import { DOCUMENT } from '@angular/common';
import {
  Injectable,
  InjectionToken,
  inject,
  signal,
  type Signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { RAIT_ALL_ROLES, type RaitRoleCode } from '../app.route-manifest';

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
const DEFAULT_ROLE: RaitRoleCode = 'rait-analyst';

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

function isRole(value: string | null): value is RaitRoleCode {
  return (
    value !== null && (RAIT_ALL_ROLES as readonly string[]).includes(value)
  );
}

@Injectable({ providedIn: 'root' })
export class PreviewStateService {
  private readonly router = inject(Router);
  private readonly navigate = inject(PREVIEW_DOCUMENT_NAVIGATE);

  private readonly stateValue = signal<PreviewScreenState>(DEFAULT_STATE);
  private readonly roleValue = signal<RaitRoleCode>(DEFAULT_ROLE);

  readonly state: Signal<PreviewScreenState> = this.stateValue.asReadonly();
  readonly role: Signal<RaitRoleCode> = this.roleValue.asReadonly();

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

  /** D-01: `/?pv_papel=<papel>&pv_estado=<atual>` — o `RoleHomeRedirect` escolhe a casa do papel. */
  setRole(role: RaitRoleCode): void {
    const params = new URLSearchParams({
      [PREVIEW_ROLE_PARAM]: role,
      [PREVIEW_STATE_PARAM]: this.stateValue(),
    });
    this.navigate(`/?${params.toString()}`);
  }
}
