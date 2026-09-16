// CTG-0003 §5.1 e §11 (M12, R-0008, TASK-0007) — composição de
// `SNAPSHOT_QUERY_PORTS` no app.
//
// As portas são as do `packages/senatran-adapter` (ADR-0003): nenhum módulo
// de domínio fala com sistema nacional por conta própria, e `ops/snapshots`
// só conhece a fatia de leitura declarada pelo token.
import { Global, Module } from '@nestjs/common';
import { SNAPSHOT_QUERY_PORTS } from '@detran/ops-core';
import { createSenatranAdapter } from '@detran/senatran-adapter';
import type { SnapshotQueryPorts } from '@detran/ops-snapshots';

export const TEAT_SNAPSHOT_QUERY_PORTS_PROVIDER = {
  provide: SNAPSHOT_QUERY_PORTS,
  useFactory: (): SnapshotQueryPorts => {
    const { ports } = createSenatranAdapter();
    return { wsdenatranRead: ports.wsdenatranRead, renach: ports.renach };
  },
};

@Global()
@Module({
  providers: [TEAT_SNAPSHOT_QUERY_PORTS_PROVIDER],
  exports: [SNAPSHOT_QUERY_PORTS],
})
export class TeatSnapshotPortsModule {}
