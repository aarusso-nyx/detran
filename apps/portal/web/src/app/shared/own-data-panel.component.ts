// OwnDataPanel (contrato CTG-0003c §5.5; [RN-PORTAL-118]; [RN-PORTAL-121]; [RN-PORTAL-117]):
// os dados que o órgão tem sobre o titular, por seção (cadastro, infrações, sinistros, exames),
// cada valor exibido POR INTEIRO em `<dd>` — o titular vê o próprio dado sem máscara; máscara é
// decisão de quem olha × de quem é o dado, feita no servidor, e este componente não contém
// lógica alguma de ocultação. Categoria documental (A/B/C) e origem como rótulos; botão de
// correção AO LADO de cada dado `correctable` (emite `correctRequested`); supressão de dado de
// terceiro anunciada com motivo visível; cada seção linka a tela funcional em vez de duplicar.
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';

/** spec §5.2; RN-PORTAL-117 A/B/C. */
export type OwnDataCategory = 'documento' | 'copia' | 'consulta';

export interface OwnDataField {
  /** ex.: 'cpf', 'name'. */
  readonly name: string;
  /** OD-P89: `portal.forms.meus_dados.campo.cpf` | `.nome`. */
  readonly labelKey: string;
  /** SEM máscara (titular). */
  readonly value: string | null;
  readonly category: OwnDataCategory;
  /** Origem (texto do servidor; ex.: 'RENACH'); `null` → não renderiza. */
  readonly source: string | null;
  readonly correctable: boolean;
  /** Padrão `portal.screens.t24.cmd.corrigir`. */
  readonly correctLabelKey?: string;
}

export interface OwnDataSection {
  /** 'cadastro' | 'infracoes' | 'sinistros' | 'exames' → `data-section`. */
  readonly key: string;
  readonly titleKey: string;
  /** Tela funcional ([JRN-PORTAL-011] 2). */
  readonly route: string | null;
  readonly fields: readonly OwnDataField[];
  /** `portal.errors.crash_third_party_data_restricted` quando houver supressão anunciada. */
  readonly suppressedNoticeKey?: string;
}

export interface CorrectRequest {
  readonly section: string;
  readonly field: string;
}

const DEFAULT_CORRECT_LABEL_KEY = 'portal.screens.t24.cmd.corrigir';

const CATEGORY_LABEL_KEY: Readonly<Record<OwnDataCategory, string>> = {
  documento: 'portal.documents.category.documento',
  copia: 'portal.documents.category.copia',
  consulta: 'portal.documents.consulta.notDocument',
};

@Component({
  selector: 'portal-own-data-panel',
  imports: [RouterLink, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-sections]': 'sections().length' },
  template: `
    @for (section of sections(); track section.key) {
      <section
        class="portal-own-data-section"
        [attr.data-section]="section.key"
        [attr.aria-labelledby]="sectionTitleId(section)"
      >
        <h3 [id]="sectionTitleId(section)">
          {{ section.titleKey | stynxTranslate }}
        </h3>
        @if (section.suppressedNoticeKey; as noticeKey) {
          <p role="status" data-suppressed-notice>
            {{ noticeKey | stynxTranslate }}
          </p>
        }
        @if (section.fields.length > 0) {
          <dl class="portal-own-data-fields">
            @for (field of section.fields; track field.name) {
              <div
                class="portal-own-data-field"
                [attr.data-name]="field.name"
                [attr.data-category]="field.category"
              >
                <dt>{{ field.labelKey | stynxTranslate }}</dt>
                <dd [attr.data-field]="field.name">{{ field.value ?? '' }}</dd>
                <dd class="portal-own-data-meta">
                  <span data-category-label>{{
                    categoryKey(field.category) | stynxTranslate
                  }}</span>
                  @if (field.source; as source) {
                    <span data-source>{{
                      'portal.documents.consulta.source'
                        | stynxTranslate: { source }
                    }}</span>
                  }
                  @if (field.correctable) {
                    <button
                      type="button"
                      data-correct
                      [attr.data-field]="field.name"
                      (click)="
                        correctRequested.emit({
                          section: section.key,
                          field: field.name,
                        })
                      "
                    >
                      {{
                        field.correctLabelKey ?? defaultCorrectLabelKey
                          | stynxTranslate
                      }}
                    </button>
                  }
                </dd>
              </div>
            }
          </dl>
        }
        @if (section.route; as route) {
          <p>
            <a
              [routerLink]="route"
              [attr.routerLink]="route"
              data-section-link
              >{{ section.titleKey | stynxTranslate }}</a
            >
          </p>
        }
      </section>
    }
  `,
})
export class OwnDataPanelComponent {
  readonly sections = input.required<readonly OwnDataSection[]>();
  readonly correctRequested = output<CorrectRequest>();

  readonly defaultCorrectLabelKey = DEFAULT_CORRECT_LABEL_KEY;

  categoryKey(category: OwnDataCategory): string {
    return CATEGORY_LABEL_KEY[category];
  }

  sectionTitleId(section: OwnDataSection): string {
    return `portal-own-data-${section.key}-title`;
  }
}
