// /veiculos (contrato CTG-0003c §6; OD-P36): os veículos do cidadão (`GET vehicles`, forma livre
// transcrita como `{ vehicleId, plate, model }`) em lista semântica (A9(b)), cada um com o link
// ao seu CRLV-e (T-17); `cachedAt` como "consultado em". Estados: carregando, vazio, erro,
// indisponível (503 nacional, com a data da consulta) e offline — sem cache próprio desta rota.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DetranEmptyStateComponent,
  DetranLoadingStateComponent,
  StynxIntlDatePipe,
  StynxTranslatePipe,
} from '@detran/ui';
import { PortalErrorBannerComponent } from '../../../core/error-banner.component';
import type { Vehicle } from '../../../data/portal-read.models';
import { DocumentosFacade } from '../documentos.facade';

const VEHICLES_ROUTE_PREFIX = '/veiculos/';
const CRLV_ROUTE_SUFFIX = '/crlv-e';

@Component({
  selector: 'portal-vehicles-page',
  imports: [
    RouterLink,
    StynxTranslatePipe,
    StynxIntlDatePipe,
    DetranEmptyStateComponent,
    DetranLoadingStateComponent,
    PortalErrorBannerComponent,
  ],
  providers: [DocumentosFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-screen': '',
    '[attr.data-status]': 'facade.vehiclesStatus()',
    '[attr.aria-busy]': 'facade.vehiclesStatus() === "loading" ? "true" : null',
  },
  template: `
    <h1 #heading tabindex="-1">
      {{ 'portal.documents.vehicles.title' | stynxTranslate }}
    </h1>

    <div
      role="status"
      class="portal-status-region"
      [attr.aria-label]="'portal.a11y.status_region' | stynxTranslate"
    >
      @if (facade.vehiclesStatus() === 'loading') {
        <detran-loading-state
          [label]="'portal.states.loading' | stynxTranslate"
        />
      }
      @if (facade.vehiclesCachedAt(); as cachedAt) {
        <p data-consulted-at>
          {{
            'portal.documents.consulta.consultedAt'
              | stynxTranslate
                : { consultedAt: (cachedAt | stynxIntlDate: dateTimeFormat) }
          }}
        </p>
      }
    </div>

    <div role="alert" class="portal-alert-region">
      @if (facade.vehiclesError(); as error) {
        <portal-error-banner [error]="error" (retry)="reload()" />
      }
    </div>

    @if (facade.vehiclesStatus() === 'empty') {
      <detran-empty-state
        [title]="'portal.documents.vehicles.empty' | stynxTranslate"
        [message]="'portal.documents.vehicles.empty' | stynxTranslate"
      />
    }

    @if (facade.vehicles().length > 0) {
      <ol data-vehicle-list class="portal-vehicle-list">
        @for (vehicle of facade.vehicles(); track vehicle.vehicleId) {
          <li [attr.data-vehicle-id]="vehicle.vehicleId">
            <dl>
              <dt>{{ 'portal.documents.vehicles.plate' | stynxTranslate }}</dt>
              <dd data-plate>{{ vehicle.plate }}</dd>
              @if (vehicle.model; as model) {
                <dt>
                  {{ 'portal.documents.vehicles.model' | stynxTranslate }}
                </dt>
                <dd data-model>{{ model }}</dd>
              }
            </dl>
            <a
              [routerLink]="crlvRoute(vehicle)"
              [attr.routerLink]="crlvRoute(vehicle)"
              >{{ 'portal.documents.crlv.title' | stynxTranslate }}</a
            >
          </li>
        }
      </ol>
    }
  `,
})
export class VehiclesPageComponent {
  readonly facade = inject(DocumentosFacade);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly dateTimeFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };

  constructor() {
    void this.facade.loadVehicles();
    afterRenderEffect(() => {
      const status = this.facade.vehiclesStatus();
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused && (status === 'ready' || status === 'empty')) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  crlvRoute(vehicle: Vehicle): string {
    return `${VEHICLES_ROUTE_PREFIX}${vehicle.vehicleId}${CRLV_ROUTE_SUFFIX}`;
  }

  reload(): void {
    void this.facade.loadVehicles();
  }
}
