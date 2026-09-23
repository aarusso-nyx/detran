import { Injectable } from '@nestjs/common';
import { InfractionCommandService } from './infraction-command.service.js';

export interface InfractionInboundEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  version: number;
}

@Injectable()
export class InfractionEventConsumer {
  constructor(private readonly commands: InfractionCommandService) {}

  consume(event: InfractionInboundEvent) {
    if (event.type === 'NOTIFICACAO_EXPEDIDA')
      return this.commands.execute({
        command: 'issue-notice',
        infractionId: event.aggregateId,
        payload: event.payload,
        ifMatch: `"${event.version}"`,
        idempotencyKey: `event:${event.id}`,
      });
    if (event.type === 'CONDUTOR_INDICADO')
      return this.commands.execute({
        command: 'indicate-driver',
        infractionId: event.aggregateId,
        payload: event.payload,
        ifMatch: `"${event.version}"`,
        idempotencyKey: `event:${event.id}`,
      });
    throw new Error(`Unsupported infraction event: ${event.type}`);
  }
}
