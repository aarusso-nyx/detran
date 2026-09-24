import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PendingTasks,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { dispatchTransition } from '../navigation/transitions.js';
import { TeatI18n } from '../core/i18n.service.js';
import {
  HOMOLOGATION_AIT_STEPS,
  TEAT_HOMOLOGATION_AIT,
} from './homologation-ait.port.js';

/** Forms for intermediate AIT steps, mounted only by the homologation root. */
@Component({
  selector: 'teat-homologation-ait-workflow',
  standalone: true,
  template: `
    @if (step()) {
      <form
        [attr.data-homologation-workflow-step]="step()"
        (submit)="onSubmit($event)"
      >
        <fieldset>
          <legend>
            {{ stepTitle() }} — {{ labels['teat.forms.homologationAit.step'] }}
          </legend>
          @switch (step()) {
            @case ('ait-vehicle') {
              <label
                >{{ labels['teat.forms.homologationAit.plate'] }}
                <input name="placa"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.visualConfirmation'] }}
                <input name="visually_confirmed_by_agent" type="checkbox"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.divergence'] }}
                <input name="divergencia" type="checkbox"
              /></label>
            }
            @case ('ait-driver') {
              <label
                >{{ labels['teat.forms.homologationAit.identifiedBy'] }}
                <select name="identified_by">
                  <option value="manual">
                    {{ labels['teat.forms.homologationAit.manual'] }}
                  </option>
                  <option value="cpf">
                    {{ labels['teat.forms.homologationAit.cpf'] }}
                  </option>
                  <option value="cnh">
                    {{ labels['teat.forms.homologationAit.cnh'] }}
                  </option>
                </select></label
              >
              <label
                >{{ labels['teat.forms.homologationAit.driver'] }}
                <input name="condutor"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.driverApproach'] }}
                <input name="abordagem"
              /></label>
            }
            @case ('ait-frame') {
              <label
                >{{ labels['teat.forms.homologationAit.frame'] }}
                <input name="enquadramento"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.approachClass'] }}
                <select name="approach_class">
                  <option value="caso_1">
                    {{ labels['teat.forms.homologationAit.caseOne'] }}
                  </option>
                  <option value="caso_3">
                    {{ labels['teat.forms.homologationAit.caseThree'] }}
                  </option>
                </select></label
              >
              <label
                >{{ labels['teat.forms.homologationAit.requiredFields'] }}
                <input name="required_fields"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.requiresEquipment'] }}
                <input name="requires_equipment" type="checkbox"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.equipmentId'] }}
                <input name="equipment_id"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.justification'] }}
                <input name="justificativa"
              /></label>
            }
            @case ('ait-location') {
              <label
                >{{ labels['teat.forms.homologationAit.location'] }}
                <input name="local"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.state'] }}
                <input name="uf"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.municipality'] }}
                <input name="municipio"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.gpsAccuracy'] }}
                <input name="gps_accuracy_m" type="number"
              /></label>
              <label
                >{{ labels['teat.forms.homologationAit.manualEdition'] }}
                <input name="manual_edition" type="checkbox"
              /></label>
            }
            @case ('ait-evidence') {
              <label
                >{{ labels['teat.forms.homologationAit.type'] }}
                <select name="tipo">
                  <option value="photo">
                    {{ labels['teat.forms.homologationAit.photo'] }}
                  </option>
                  <option value="video">
                    {{ labels['teat.forms.homologationAit.video'] }}
                  </option>
                  <option value="audio">
                    {{ labels['teat.forms.homologationAit.audio'] }}
                  </option>
                  <option value="document">
                    {{ labels['teat.forms.homologationAit.document'] }}
                  </option>
                </select></label
              >
              <label
                >{{ labels['teat.forms.homologationAit.syntheticHash'] }}
                <input name="hash"
              /></label>
            }
            @case ('ait-signature') {
              <label
                >{{ labels['teat.forms.homologationAit.result'] }}
                <select name="resultado">
                  <option value="assinado">
                    {{ labels['teat.forms.homologationAit.signed'] }}
                  </option>
                  <option value="recusa">
                    {{ labels['teat.forms.homologationAit.refusal'] }}
                  </option>
                  <option value="impossibilidade">
                    {{ labels['teat.forms.homologationAit.impossibility'] }}
                  </option>
                </select></label
              >
              <label
                >{{ labels['teat.forms.homologationAit.reason'] }}
                <input name="motivo"
              /></label>
            }
            @default {
              <label
                >{{ labels['teat.forms.homologationAit.confirmStep'] }}
                <input name="confirm" type="checkbox"
              /></label>
            }
          }
          <button type="submit">
            {{ labels['teat.forms.homologationAit.continue'] }}
          </button>
        </fieldset>
        @if (error()) {
          <p role="alert">{{ error() }}</p>
        }
      </form>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomologationAitWorkflowComponent {
  private readonly i18n = inject(TeatI18n);
  readonly labels = new Proxy({} as Readonly<Record<string, string>>, {
    get: (_target, key) => this.i18n.translate(String(key)),
  });
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly port = inject(TEAT_HOMOLOGATION_AIT);
  readonly step = signal(this.resolveStep(this.router.url));
  readonly error = signal('');

  stepTitle(): string {
    const step = this.step();
    return step === undefined
      ? ''
      : this.i18n.translate(`teat.screens.${step}.title`);
  }

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.step.set(this.resolveStep(event.urlAfterRedirects));
        this.error.set('');
      });
  }

  private resolveStep(url: string): string | undefined {
    const id = url.split(/[/?#]/)[1];
    return id !== undefined &&
      HOMOLOGATION_AIT_STEPS.includes(
        id as (typeof HOMOLOGATION_AIT_STEPS)[number],
      ) &&
      id !== 'ait-start' &&
      id !== 'ait-review'
      ? id
      : undefined;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const screenId = this.step();
    if (screenId === undefined) return;
    const value = (name: string): string =>
      (
        form.elements.namedItem(name) as
          HTMLInputElement | HTMLSelectElement | null
      )?.value ?? '';
    const checked = (name: string): boolean =>
      (form.elements.namedItem(name) as HTMLInputElement | null)?.checked ===
      true;
    let input: Record<string, unknown>;
    switch (screenId) {
      case 'ait-vehicle':
        input = {
          placa: value('placa'),
          visually_confirmed_by_agent: checked('visually_confirmed_by_agent'),
          divergencia: checked('divergencia'),
        };
        break;
      case 'ait-driver':
        input = {
          identified_by: value('identified_by'),
          condutor: value('condutor'),
          abordagem: value('abordagem'),
        };
        break;
      case 'ait-frame':
        input = {
          enquadramento: value('enquadramento'),
          approach_class: value('approach_class'),
          required_fields: value('required_fields')
            ? value('required_fields')
                .split(',')
                .map((part) => part.trim())
            : [],
          requires_equipment: checked('requires_equipment'),
          ...(value('equipment_id')
            ? { equipment_id: value('equipment_id') }
            : {}),
          ...(value('justificativa')
            ? { justificativa: value('justificativa') }
            : {}),
        };
        break;
      case 'ait-location':
        input = {
          local: value('local'),
          uf: value('uf'),
          municipio: value('municipio'),
          gps_accuracy_m:
            value('gps_accuracy_m').trim() === ''
              ? Number.NaN
              : Number(value('gps_accuracy_m')),
          manual_edition: checked('manual_edition'),
        };
        break;
      case 'ait-evidence':
        input = { tipo: value('tipo'), hash: value('hash') };
        break;
      case 'ait-signature':
        input = {
          resultado: value('resultado'),
          ...(value('motivo') ? { motivo: value('motivo') } : {}),
        };
        break;
      default:
        input = { confirm: checked('confirm') };
        break;
    }
    void this.pendingTasks.run(async () => {
      try {
        if (this.port.saveStep === undefined)
          throw new Error('scenario-step-unavailable');
        await this.port.saveStep(screenId, input);
        const result = await dispatchTransition(
          { from: screenId, action: 'Continuar', conditionSatisfied: true },
          this.router,
          this.location,
        );
        if (result.kind !== 'navigated') throw new Error('transition-denied');
      } catch {
        this.error.set(
          this.i18n.translate('teat.forms.homologationAit.invalidStep'),
        );
      }
    });
  }
}
