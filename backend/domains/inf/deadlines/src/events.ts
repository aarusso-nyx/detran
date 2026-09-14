// Porta de eventos do motor de prazos (work/rounds/R-0006/contracts/CTG-0001.md
// §5.2, emenda janela 2): quem consome a biblioteca injeta `DeadlineEvents`;
// esta rodada só tem a implementação em memória (sem outbox — R-0007 grava na
// mesma transação do comando). `published` preserva a ordem de publicação.
import type { DeadlineEvent, DeadlineEvents } from './types.js';

export class InMemoryDeadlineEvents implements DeadlineEvents {
  private readonly rows: DeadlineEvent[] = [];

  get published(): readonly DeadlineEvent[] {
    return this.rows;
  }

  async publish(event: DeadlineEvent): Promise<void> {
    this.rows.push(event);
  }
}
