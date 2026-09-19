// Relógio do pacote (plan R-0009 adenda A1(g); CTG-0001 §4): provider
// `@Injectable()` declarado pelo bloco `module` de BP-PORTAL-IDENTITY-001 que
// expõe `Clock` de `@detran/inf-deadlines`. É o único ponto do pacote que lê o
// instante real (`new Date()`): `PortalIdentityService`, `assertActLevel` e os
// controladores só consomem `now()`/`today()`; o perfil de teste substitui a
// classe por `FixedClock` (2026-09-14) via `{ provide: PortalClock, useValue }`.
import { Injectable } from '@nestjs/common';
import type { Clock, LocalDate } from '@detran/inf-deadlines';

/**
 * Fuso da data civil do Portal quando o chamador não informa o do tenant
 * (CTG-0001 §4: `today = 'YYYY-MM-DD' em America/Manaus`; §0: "hoje" das
 * fixtures em America/Manaus). O fuso por tenant (`auth.tenants.timezone`,
 * `portal.brand_profile.time_zone`) é lido pelos comandos de CTG-0002.
 */
export const PORTAL_DEFAULT_TIME_ZONE = 'America/Manaus';

/** Forma mínima de relógio que o pacote consome (subconjunto de `Clock`). */
export interface PortalClockLike {
  now(): Date;
  today(tenantTz?: string): LocalDate;
}

@Injectable()
export class PortalClock implements Clock, PortalClockLike {
  /** Único `new Date()` sancionado do pacote (CODESTYLE §TypeScript). */
  now(): Date {
    return new Date();
  }

  /** Data civil `YYYY-MM-DD` de `now()` no fuso informado. */
  today(tenantTz: string = PORTAL_DEFAULT_TIME_ZONE): LocalDate {
    return localDateOf(this.now(), tenantTz);
  }
}

/** `YYYY-MM-DD` de um instante num fuso IANA (formato `en-CA` = ISO por dia). */
export function localDateOf(instant: Date, timeZone: string): LocalDate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}
