// CTG-0002 §4.8 e §11 (R-0008, TASK-0005) — composição das portas do protocolo
// de sincronização no app.
//
// `SYNC_ENTITY_APPLIERS` carrega os destinos montados nesta rodada: só o
// applier `ait` (M7). Os demais tipos suportados (medida administrativa, termo
// de sinais de álcool, pedidos de cancelamento e `crash-record`) ficam **sem**
// destino e, por isso, recebem `TEAT.SYNC_DESTINATION_NOT_WIRED` — o item
// permanece `received` e nada de domínio é tocado (M5).
//
// O módulo é `@Global()` porque quem consome as portas é `OfflineSyncModule`,
// que não importa o app; sem isso a lista não chegaria ao protocolo.
import { Global, Module } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  APPLIED_ENTITY_PORTS,
  SYNC_ENTITY_APPLIERS,
  asQueryable,
  systemOpsClock,
  type AppliedEntityPort,
  type SyncEntityApplier,
} from '@detran/ops-core';
import { AitSyncApplier } from '@detran/inf-ait';
import { SqlTeatEventOutbox } from '@detran/shared';

/** Porta "a entidade já foi aplicada?" do AIT, consumida por CTG-0003. */
export class AitAppliedEntityPort implements AppliedEntityPort {
  readonly entityType = 'ait';

  async isApplied(entityId: string, tx: Transaction): Promise<boolean> {
    const queryable = asQueryable(tx);
    if (!queryable) return false;
    const result = await queryable.query<{ id: string }>(
      `select id from inf.ait_ait
        where id = $1 and current_status not in ('RASCUNHO_OFFLINE', 'CANCELADO_RASCUNHO')
        limit 1`,
      [entityId],
    );
    return result.rows.length > 0;
  }
}

export const TEAT_SYNC_APPLIERS_PROVIDER = {
  provide: SYNC_ENTITY_APPLIERS,
  inject: [Database, RequestContext],
  useFactory: (
    database: Database,
    requestContext: RequestContext,
  ): readonly SyncEntityApplier[] => [
    new AitSyncApplier({
      database,
      requestContext,
      outbox: new SqlTeatEventOutbox(),
      clock: systemOpsClock,
    }),
  ],
};

export const TEAT_APPLIED_ENTITY_PORTS_PROVIDER = {
  provide: APPLIED_ENTITY_PORTS,
  useFactory: (): readonly AppliedEntityPort[] => [new AitAppliedEntityPort()],
};

@Global()
@Module({
  providers: [
    TEAT_SYNC_APPLIERS_PROVIDER,
    TEAT_APPLIED_ENTITY_PORTS_PROVIDER,
    AitAppliedEntityPort,
  ],
  exports: [SYNC_ENTITY_APPLIERS, APPLIED_ENTITY_PORTS, AitAppliedEntityPort],
})
export class TeatSyncModule {}
