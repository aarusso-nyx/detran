// R-0033 TASK-0007: fixed honest preview notice and labelled state/profile controls.
// frontend-preview-mode.md §4/§6/§10. Native selects mirror the RAIT preview precedent.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PREVIEW_PERSONAS, type PreviewPersona } from './preview-state.service';
import { previewKey } from './preview-i18n';
import { PreviewActionLog } from './preview-action-log';
import { PREVIEW_MARK_KEY, PREVIEW_NOT_FUNCTIONAL_KEY } from './preview-mark';
import {
  PREVIEW_SCREEN_STATES,
  PreviewStateService,
  type PreviewScreenState,
} from './preview-state.service';

const REGION_KEY = previewKey('shell', 'region');
const STATE_LABEL_KEY = previewKey('shell', 'state');
const ROLE_LABEL_KEY = previewKey('shell', 'role');

interface PreviewOption<T extends string> {
  readonly value: T;
  readonly key: string;
}

function isScreenState(value: string): value is PreviewScreenState {
  return (PREVIEW_SCREEN_STATES as readonly string[]).includes(value);
}

function isRole(value: string): value is PreviewPersona {
  return (PREVIEW_PERSONAS as readonly string[]).includes(value);
}

function selectValueOf(event: Event): string {
  const target = event.target;
  return target instanceof HTMLSelectElement ? target.value : '';
}

@Component({
  selector: 'portal-preview-bar',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .portal-preview-bar {
      box-sizing: border-box;
      max-width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1.5rem;
      padding: 0.5rem 1rem;
      background: #5c1a00;
      color: #ffffff;
      font: inherit;
      border-bottom: 3px solid #ffb000;
    }
    .portal-preview-bar__mark {
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .portal-preview-bar__field {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      max-width: 100%;
    }
    .portal-preview-bar__field select {
      min-width: 0;
      max-width: 100%;
      color: #1a1a1a;
      background: #ffffff;
    }
    /* TASK-0006: o <p role="status"> vazio (nenhuma ação ainda) mantém uma linha de altura;
       sem ela a caixa tem altura 0 e os scripts do roteiro (lib.mjs openPreview), que
       esperam o primeiro [role="status"] visível, nunca concluem a abertura da página. */
    .portal-preview-bar__status {
      margin: 0;
      flex: 1 1 16rem;
      min-width: 0;
      min-height: 1.5em;
      overflow-wrap: anywhere;
    }
    /* Responsivo básico (TASK-0004): o mesmo ponto de quebra do shell do kit
       (packages/ui/styles/index.css, max-width: 48rem), nenhum novo; abaixo dele os
       controles empilham e os <select> ocupam a largura da faixa, sem rolagem horizontal. */
    @media (max-width: 48rem) {
      .portal-preview-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }
      .portal-preview-bar__field {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
      }
      .portal-preview-bar__field select {
        width: 100%;
      }
      .portal-preview-bar__status {
        flex: none;
      }
    }
  `,
  template: `
    <section
      role="region"
      class="portal-preview-bar"
      [attr.aria-label]="regionKey | stynxTranslate"
      data-detran-preview-mark="DETRAN_PREVIEW_MARK"
    >
      <strong class="portal-preview-bar__mark">{{
        markKey | stynxTranslate
      }}</strong>
      <span class="portal-preview-bar__field">
        <label for="portal-preview-state">{{
          stateLabelKey | stynxTranslate
        }}</label>
        <select id="portal-preview-state" (change)="onStateChange($event)">
          @for (option of stateOptions; track option.value) {
            <option
              [value]="option.value"
              [selected]="option.value === preview.state()"
            >
              {{ option.key | stynxTranslate }}
            </option>
          }
        </select>
      </span>
      <span class="portal-preview-bar__field">
        <label for="portal-preview-role">{{
          roleLabelKey | stynxTranslate
        }}</label>
        <select id="portal-preview-role" (change)="onRoleChange($event)">
          @for (option of roleOptions; track option.value) {
            <option
              [value]="option.value"
              [selected]="option.value === preview.role()"
            >
              {{ option.key | stynxTranslate }}
            </option>
          }
        </select>
      </span>
      <p role="status" class="portal-preview-bar__status">
        @if (lastCommand(); as command) {
          {{ notFunctionalKey | stynxTranslate: { command: command } }}
        }
      </p>
    </section>
  `,
})
export class PreviewBarComponent {
  protected readonly preview = inject(PreviewStateService);
  private readonly log = inject(PreviewActionLog);

  protected readonly regionKey = REGION_KEY;
  protected readonly markKey = PREVIEW_MARK_KEY;
  protected readonly stateLabelKey = STATE_LABEL_KEY;
  protected readonly roleLabelKey = ROLE_LABEL_KEY;
  protected readonly notFunctionalKey = PREVIEW_NOT_FUNCTIONAL_KEY;

  protected readonly stateOptions: readonly PreviewOption<PreviewScreenState>[] =
    PREVIEW_SCREEN_STATES.map((state) => ({
      value: state,
      key: previewKey('shell', `state_${state}`),
    }));

  protected readonly roleOptions: readonly PreviewOption<PreviewPersona>[] =
    PREVIEW_PERSONAS.map((role) => ({
      value: role,
      key: previewKey('shell', `role_${role}`),
    }));

  /** Última entrada do registro (a faixa mostra só a mais recente, D-11). */
  protected readonly lastCommand = computed(
    () => this.log.entries().at(-1)?.command ?? null,
  );

  protected onStateChange(event: Event): void {
    const value = selectValueOf(event);
    if (isScreenState(value)) this.preview.setState(value);
  }

  protected onRoleChange(event: Event): void {
    const value = selectValueOf(event);
    if (isRole(value)) this.preview.setRole(value);
  }
}
