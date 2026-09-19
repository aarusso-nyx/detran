// CTG-0002 §8 e §14 (R-0009, TASK-0008; plan M16, M17, adenda A5(e)) —
// composição no app das portas e parâmetros que `@detran/portal-projections`
// consome, no padrão de `teat-snapshots.providers.ts`.
//
// As portas nacionais são as do `packages/senatran-adapter` (ADR-0003):
// nenhum módulo de domínio fala com sistema nacional por conta própria, e
// `portal/projections` só conhece as fatias estruturais declaradas pelo token
// `PORTAL_NATIONAL_READ_PORTS`. `PORTAL_PARAMETER_READER` é o
// `OpsParameterService` (`ParameterModule` não é `@Global` e
// `ProjectionsModule` não o importa — §14). `PORTAL_PROJECTION_POLLER` é a
// porta do poller das projeções (mesma `TeatStreamPoller`; a fábrica padrão é
// a única chamadora de `setInterval`). Módulo `@Global()` porque os
// consumidores vivem em `ProjectionsModule`, importado pelo `AppModule`.
import { Global, Module } from '@nestjs/common';
import { ParameterModule, OpsParameterService } from '@detran/ops-parameter';
import {
  PORTAL_NATIONAL_READ_PORTS,
  PORTAL_PARAMETER_READER,
  PORTAL_PROJECTION_POLLER,
  type PortalNationalReadPorts,
  type PortalParameterReader,
  type PortalProjectionPoller,
} from '@detran/portal-projections';
import { PORTAL_SNE_PORT, type PortalSnePort } from '@detran/portal-inbox';
import { createSenatranAdapter } from '@detran/senatran-adapter';

import { createDefaultTeatStreamPoller } from './teat-stream.service.js';

export const PORTAL_NATIONAL_READ_PORTS_PROVIDER = {
  provide: PORTAL_NATIONAL_READ_PORTS,
  useFactory: (): PortalNationalReadPorts => {
    const { ports } = createSenatranAdapter();
    return {
      cdt: ports.cdt,
      renach: ports.renach,
      wsdenatranRead: ports.wsdenatranRead,
    };
  },
};

export const PORTAL_SNE_PORT_PROVIDER = {
  provide: PORTAL_SNE_PORT,
  useFactory: (): PortalSnePort => createSenatranAdapter().ports.sne,
};

export const PORTAL_PARAMETER_READER_PROVIDER = {
  provide: PORTAL_PARAMETER_READER,
  useFactory: (service: OpsParameterService): PortalParameterReader => service,
  inject: [OpsParameterService],
};

export const PORTAL_PROJECTION_POLLER_PROVIDER = {
  provide: PORTAL_PROJECTION_POLLER,
  useFactory: (): PortalProjectionPoller => createDefaultTeatStreamPoller(),
};

@Global()
@Module({
  imports: [ParameterModule],
  providers: [
    PORTAL_NATIONAL_READ_PORTS_PROVIDER,
    PORTAL_SNE_PORT_PROVIDER,
    PORTAL_PARAMETER_READER_PROVIDER,
    PORTAL_PROJECTION_POLLER_PROVIDER,
  ],
  exports: [
    PORTAL_NATIONAL_READ_PORTS,
    PORTAL_SNE_PORT,
    PORTAL_PARAMETER_READER,
    PORTAL_PROJECTION_POLLER,
  ],
})
export class PortalNationalReadPortsModule {}
