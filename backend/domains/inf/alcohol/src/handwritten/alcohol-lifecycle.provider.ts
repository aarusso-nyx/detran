// CTG-0004 §12 (R-0008, TASK-0009), §15.1 e §16.4 (adenda, iterações 2 e 3)
// — composição de `AlcoholCommands` no módulo gerado.
//
// `repositories` fica vazio de propósito para as tabelas do próprio pacote
// (mesmo padrão de `inf/measures/src/handwritten/measure-lifecycle.provider.ts`
// / CTG-0003 §4): toda leitura/escrita de produção acontece na transação do
// comando. A tabela metrológica e o catálogo normativo são exceção (§15.1,
// §16.4): pertencem a `inf/normative`, então a leitura vai pelos
// repositórios GERADOS daquele pacote (`NormativeMetrologicalTableRepository`,
// `NormativeCatalogRepository`), nunca por SQL cross-schema manuscrito aqui.
// `NormativeModule` não exporta os repositórios no DI (só
// `NormativeLifecycleService`, `moduleExports` do blueprint — fora do que
// este worker pode tocar em `inf/normative`), então o provider os constrói
// diretamente com os mesmos `Database`/`RequestContext` já injetados nesta
// fábrica — mesmas duas dependências dos construtores gerados, sem precisar
// do DI do Nest para essas classes.
import type { Provider } from '@nestjs/common';
import { SqlTeatEventOutbox } from '@detran/shared';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  NormativeCatalogRepository,
  NormativeMetrologicalTableRepository,
} from '@detran/inf-normative';

import type { AlcoholDeps, AlcoholRowStore } from './alcohol-runtime.js';
import { CloseProcedureCommand } from './close-procedure.command.js';
import { ForwardProcedureCommand } from './forward-procedure.command.js';
import { RecordRefusalCommand } from './record-refusal.command.js';
import { RecordSignsCommand } from './record-signs.command.js';
import { RecordTestCommand } from './record-test.command.js';
import { StartProcedureCommand } from './start-procedure.command.js';

function metrologicalTableStore(
  repository: NormativeMetrologicalTableRepository,
): AlcoholRowStore {
  return {
    list: async () => (await repository.findAll()).map((row) => ({ ...row })),
    findOne: async (id) => {
      try {
        return { ...(await repository.findOne(id)) };
      } catch {
        return undefined;
      }
    },
  };
}

/** CTG-0004 §16.4 (adenda, iteração 3) — mesmo adaptador para o catálogo. */
function normativeCatalogStore(
  repository: NormativeCatalogRepository,
): AlcoholRowStore {
  return {
    list: async () => (await repository.findAll()).map((row) => ({ ...row })),
    findOne: async (id) => {
      try {
        return { ...(await repository.findOne(id)) };
      } catch {
        return undefined;
      }
    },
  };
}

/** Bolsa dos seis comandos manuscritos de alcoolemia (CTG-0004 §12). */
export class AlcoholCommands {
  readonly start: StartProcedureCommand;
  readonly recordTest: RecordTestCommand;
  readonly recordRefusal: RecordRefusalCommand;
  readonly recordSigns: RecordSignsCommand;
  readonly forward: ForwardProcedureCommand;
  readonly close: CloseProcedureCommand;

  constructor(deps: AlcoholDeps) {
    this.start = new StartProcedureCommand(deps);
    this.recordTest = new RecordTestCommand(deps);
    this.recordRefusal = new RecordRefusalCommand(deps);
    this.recordSigns = new RecordSignsCommand(deps);
    this.forward = new ForwardProcedureCommand(deps);
    this.close = new CloseProcedureCommand(deps);
  }
}

export const ALCOHOL_LIFECYCLE_PROVIDER: Provider = {
  provide: AlcoholCommands,
  inject: [Database, RequestContext],
  useFactory: (database: Database, requestContext: RequestContext) =>
    new AlcoholCommands({
      database,
      requestContext,
      repositories: {
        metrologicalTables: metrologicalTableStore(
          new NormativeMetrologicalTableRepository(database, requestContext),
        ),
        catalogs: normativeCatalogStore(
          new NormativeCatalogRepository(database, requestContext),
        ),
      },
      outbox: new SqlTeatEventOutbox(),
      clock: { now: () => new Date().toISOString() },
    }),
};
