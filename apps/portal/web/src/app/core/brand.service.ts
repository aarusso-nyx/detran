// BrandService (portal-frontends.md §5.1; plan.md M7): `GET /v1/portal/brand` (público; tenant
// pelo `Host`, contrato §1.5/§2) → marca do órgão no cabeçalho do `CitizenShell`. Qualquer erro
// (404 `PORTAL.NOT_FOUND` sem linha de marca, 5xx, rede) cai no estado `unavailable` com a marca
// neutra `portal.shell.brand.neutral`, sem lançar e sem quebrar o shell.
import { Injectable, computed, inject, signal } from '@angular/core';
import { PortalClient, type BrandProfile } from '../data/portal.client';

export const NEUTRAL_BRAND_KEY = 'portal.shell.brand.neutral';

export interface AvailableBrand {
  readonly status: 'available';
  /** `displayName` do contrato (`GET brand`). */
  readonly name: string;
  readonly supportUrl?: string;
  readonly privacyUrl?: string;
  readonly accessibilityUrl?: string;
  readonly primaryColor?: string;
}

export interface UnavailableBrand {
  readonly status: 'unavailable';
  readonly neutralLabelKey: typeof NEUTRAL_BRAND_KEY;
}

export type BrandState = AvailableBrand | UnavailableBrand;

export const NEUTRAL_BRAND: UnavailableBrand = Object.freeze({
  status: 'unavailable',
  neutralLabelKey: NEUTRAL_BRAND_KEY,
});

function toBrandState(profile: BrandProfile): BrandState {
  if (!profile.displayName) return NEUTRAL_BRAND;
  return {
    status: 'available',
    name: profile.displayName,
    supportUrl: profile.supportUrl,
    privacyUrl: profile.privacyUrl,
    accessibilityUrl: profile.accessibilityUrl,
    primaryColor: profile.primaryColor,
  };
}

@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly client = inject(PortalClient);
  private readonly brand = signal<BrandState>(NEUTRAL_BRAND);

  readonly state = this.brand.asReadonly();
  readonly available = computed(() => this.brand().status === 'available');

  /** Carrega a marca uma vez no bootstrap; nunca rejeita. */
  async load(): Promise<void> {
    try {
      this.brand.set(toBrandState(await this.client.brand()));
    } catch {
      this.brand.set(NEUTRAL_BRAND);
    }
  }
}
