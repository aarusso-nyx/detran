// IndicacaoCondutorForm (contrato CTG-0003b §6 T-05; [UC-PORTAL-004] AC-1/AC-2; [RN-PORTAL-104]):
// passo 2 projetado — o que o órgão já tem (`PrefilledSummary`, só leitura), os dados do condutor
// (`driver.*`, nomes como no corpo do ato), as assinaturas do proprietário e do condutor
// (caminho (a) gov.br é o padrão; (b) documento assinado é a alternativa — o próprio arquivo
// entra no passo de assinatura pelo `SignatureStep`, pois `IndicacaoCondutorSchema` é estrito e o
// rascunho não carrega `attachmentIds`) e o pedido de "continuar", que a PÁGINA intercepta para
// abrir a consequência ANTES de gravar ([DIVERGE-5]). Erros de campo (`fields[]`, ex.:
// `driver.cpf`) marcam o controle pela diretiva sem reiniciar o preenchimento. Dados do condutor
// nunca aparecem fora do ato.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalFieldErrorsDirective } from '../../../core/field-errors.directive';
import { PrefilledSummaryComponent } from '../../../shared/prefilled-summary.component';

/** Siglas das 27 unidades federativas (IBGE) — valor de `driver.cnhUf` (2 letras). */
const UFS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

/**
 * Categorias de habilitação (CTB art. 143: ACC, A, B, C, D, E; combinações A+B…A+E conforme
 * Res. CONTRAN 789/2020) — valor de `driver.category`; o servidor valida
 * (`INDICATION_DRIVER_INVALID { fields }`). Enum canônico a confirmar (ver relatório).
 */
const CNH_CATEGORIES = [
  'ACC',
  'A',
  'B',
  'C',
  'D',
  'E',
  'AB',
  'AC',
  'AD',
  'AE',
] as const;

const OWNER_SIGNATURES = ['govbr', 'upload'] as const;
const DRIVER_SIGNATURES = ['govbr', 'upload', 'pending'] as const;
type OwnerSignature = (typeof OWNER_SIGNATURES)[number];
type DriverSignature = (typeof DRIVER_SIGNATURES)[number];

export interface IndicacaoCondutorValues {
  readonly driver: {
    readonly cpf: string;
    readonly cnhNumber: string;
    readonly cnhUf: string;
    readonly category: string;
    readonly name: string;
  };
  readonly signatures: {
    readonly owner: OwnerSignature;
    readonly driver: DriverSignature;
  };
  readonly consequenceAck?: unknown;
}

type DriverField = keyof IndicacaoCondutorValues['driver'];

/** Caminho (a) gov.br é o padrão ([RN-PORTAL-104]); (b) upload é a alternativa. */
const EMPTY_VALUES: IndicacaoCondutorValues = {
  driver: { cpf: '', cnhNumber: '', cnhUf: '', category: '', name: '' },
  signatures: { owner: OWNER_SIGNATURES[0], driver: DRIVER_SIGNATURES[0] },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asValues(
  value: Record<string, unknown> | null,
): IndicacaoCondutorValues {
  const raw = value ?? {};
  return {
    ...EMPTY_VALUES,
    ...raw,
    driver: {
      ...EMPTY_VALUES.driver,
      ...(isRecord(raw['driver']) ? raw['driver'] : {}),
    },
    signatures: {
      ...EMPTY_VALUES.signatures,
      ...(isRecord(raw['signatures']) ? raw['signatures'] : {}),
    },
  } as IndicacaoCondutorValues;
}

@Component({
  selector: 'portal-indicacao-condutor-form',
  imports: [
    StynxTranslatePipe,
    PortalFieldErrorsDirective,
    PrefilledSummaryComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-request-id]': 'requestId()' },
  template: `
    <portal-prefilled-summary [prefilled]="prefilled()" />
    <form
      class="portal-indicacao-form"
      [portalFieldErrors]="fields()"
      (submit)="$event.preventDefault()"
    >
      <fieldset [disabled]="disabled()" data-driver>
        <label>
          <span>{{
            'portal.forms.indicacao_condutor.cpf' | stynxTranslate
          }}</span>
          <input
            type="text"
            name="driver.cpf"
            inputmode="numeric"
            autocomplete="off"
            [value]="current().driver.cpf"
            (input)="patchDriver('cpf', $event)"
          />
        </label>
        <label>
          <span>{{
            'portal.forms.indicacao_condutor.nome' | stynxTranslate
          }}</span>
          <input
            type="text"
            name="driver.name"
            autocomplete="off"
            [value]="current().driver.name"
            (input)="patchDriver('name', $event)"
          />
        </label>
        <label>
          <span>{{
            'portal.forms.indicacao_condutor.cnh' | stynxTranslate
          }}</span>
          <input
            type="text"
            name="driver.cnhNumber"
            inputmode="numeric"
            autocomplete="off"
            [value]="current().driver.cnhNumber"
            (input)="patchDriver('cnhNumber', $event)"
          />
        </label>
        <label>
          <span>{{
            'portal.forms.indicacao_condutor.uf' | stynxTranslate
          }}</span>
          <select
            name="driver.cnhUf"
            [value]="current().driver.cnhUf"
            (change)="patchDriver('cnhUf', $event)"
          >
            <option value=""></option>
            @for (uf of ufs; track uf) {
              <option [value]="uf">{{ uf }}</option>
            }
          </select>
        </label>
        <label>
          <span>{{
            'portal.forms.indicacao_condutor.categoria' | stynxTranslate
          }}</span>
          <select
            name="driver.category"
            [value]="current().driver.category"
            (change)="patchDriver('category', $event)"
          >
            <option value=""></option>
            @for (category of categories; track category) {
              <option [value]="category">{{ category }}</option>
            }
          </select>
        </label>
      </fieldset>

      <p [id]="signatureHintId">
        {{ 'portal.forms.indicacao_condutor.assinatura_hint' | stynxTranslate }}
      </p>
      <fieldset
        [disabled]="disabled()"
        [attr.aria-labelledby]="signatureHintId"
        data-signatures="owner"
      >
        @for (method of ownerSignatures; track method) {
          <label>
            <input
              type="radio"
              name="signatures.owner"
              [value]="method"
              [checked]="current().signatures.owner === method"
              (change)="patchSignature('owner', method)"
            />
            <span>{{ signatureKey(method) | stynxTranslate }}</span>
          </label>
        }
      </fieldset>
      <fieldset
        [disabled]="disabled()"
        [attr.aria-labelledby]="signatureHintId"
        data-signatures="driver"
      >
        @for (method of driverSignatures; track method) {
          <label>
            <input
              type="radio"
              name="signatures.driver"
              [value]="method"
              [checked]="current().signatures.driver === method"
              (change)="patchSignature('driver', method)"
            />
            <span>{{ signatureKey(method) | stynxTranslate }}</span>
          </label>
        }
      </fieldset>

      <div class="portal-indicacao-actions">
        <button
          type="button"
          data-draft
          [disabled]="disabled()"
          (click)="draftRequested.emit()"
        >
          {{ 'portal.screens.t05.cmd.draft' | stynxTranslate }}
        </button>
        <button
          type="button"
          data-continue
          [disabled]="disabled()"
          (click)="continueRequested.emit()"
        >
          {{ 'portal.common.action.continue' | stynxTranslate }}
        </button>
      </div>
    </form>
  `,
})
export class IndicacaoCondutorFormComponent {
  readonly prefilled = input<Readonly<Record<string, unknown>>>({});
  readonly requestId = input<string | null>(null);
  readonly fields = input<readonly string[]>([]);
  readonly disabled = input(false);
  readonly values = model<Record<string, unknown> | null>(null);
  readonly draftRequested = output<void>();
  /** A página abre o `ConsequenceDialog` antes de gravar ([DIVERGE-5]). */
  readonly continueRequested = output<void>();

  readonly ufs = UFS;
  readonly categories = CNH_CATEGORIES;
  readonly ownerSignatures = OWNER_SIGNATURES;
  readonly driverSignatures = DRIVER_SIGNATURES;
  readonly signatureHintId = 'portal-indicacao-signature-hint';
  readonly current = computed(() => asValues(this.values()));

  signatureKey(method: OwnerSignature | DriverSignature): string {
    return `portal.forms.indicacao_condutor.assinatura.${method}`;
  }

  patchDriver(field: DriverField, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    const current = this.current();
    this.values.set({
      ...current,
      driver: { ...current.driver, [field]: value },
    });
  }

  patchSignature(
    party: 'owner' | 'driver',
    method: OwnerSignature | DriverSignature,
  ): void {
    const current = this.current();
    this.values.set({
      ...current,
      signatures: { ...current.signatures, [party]: method },
    });
  }
}
