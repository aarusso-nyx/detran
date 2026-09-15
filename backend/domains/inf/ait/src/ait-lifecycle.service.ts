import { createHash } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';
import type {
  RenainfPort,
  TrafficViolation,
  TrafficViolationInput,
} from '@detran/senatran-adapter';
import type { NormativeReferencePort } from '@detran/inf-normative';

import type { CreateAitCorrectionDto } from './dto/create-ait-correction.dto.js';
import type { CreateAitPersonDto } from './dto/create-ait-person.dto.js';
import type { CreateAitPrintEventDto } from './dto/create-ait-print-event.dto.js';
import type { CreateAitSignatureDto } from './dto/create-ait-signature.dto.js';
import type { CreateAitVehicleDto } from './dto/create-ait-vehicle.dto.js';
import type { CreateAitDto } from './dto/create-ait.dto.js';
import type { Ait } from './entities/ait.entity.js';
import type { AitCorrectionRepository } from './repositories/ait-correction.repository.js';
import type { AitPersonRepository } from './repositories/ait-person.repository.js';
import type { AitPrintEventRepository } from './repositories/ait-print-event.repository.js';
import type { AitSignatureRepository } from './repositories/ait-signature.repository.js';
import type { AitStatusHistoryRepository } from './repositories/ait-status-history.repository.js';
import type { AitVehicleRepository } from './repositories/ait-vehicle.repository.js';
import type { AitRepository } from './repositories/ait.repository.js';

export type AitStatus =
  | 'RASCUNHO_OFFLINE'
  | 'CANCELADO_RASCUNHO'
  | 'FINALIZADO_LOCAL'
  | 'ENFILEIRADO'
  | 'TRANSMITIDO'
  | 'RECEBIDO'
  | 'SUSPEITO_CONCORRENCIA'
  | 'VALIDANDO'
  | 'ACEITO'
  | 'REJEITADO'
  | 'PENDENTE_CORRECAO'
  | 'CORRIGIDO'
  | 'INTEGRADO'
  | 'PROCESSADO'
  | 'ARQUIVADO'
  | 'SOLICITADO_CANCEL_POSFINAL'
  | 'CANCELADO_POSFINAL';

export interface AitRepositories {
  ait: AitRepository;
  vehicles: AitVehicleRepository;
  people: AitPersonRepository;
  history: AitStatusHistoryRepository;
  corrections: AitCorrectionRepository;
  signatures: AitSignatureRepository;
  printEvents: AitPrintEventRepository;
}

@Injectable()
export class AitLifecycleService {
  constructor(
    private readonly repositories: AitRepositories,
    private readonly normative: NormativeReferencePort,
  ) {}

  createDraft(dto: CreateAitDto): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      await this.normative.assertActive(dto.catalog_id, dto.framing_id, tx);
      return this.repositories.ait.create(
        { ...dto, current_status: 'RASCUNHO_OFFLINE', content_hash: null },
        tx,
      );
    });
  }

  addVehicle(aitId: string, dto: Omit<CreateAitVehicleDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
      return this.repositories.vehicles.create({ ...dto, ait_id: aitId }, tx);
    });
  }

  addPerson(aitId: string, dto: Omit<CreateAitPersonDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      await this.requireStatus(aitId, ['RASCUNHO_OFFLINE'], tx);
      return this.repositories.people.create({ ...dto, ait_id: aitId }, tx);
    });
  }

  addCorrection(aitId: string, dto: Omit<CreateAitCorrectionDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      await this.requireStatus(aitId, ['PENDENTE_CORRECAO'], tx);
      return this.repositories.corrections.create(
        { ...dto, ait_id: aitId },
        tx,
      );
    });
  }

  recordScience(aitId: string, dto: Omit<CreateAitSignatureDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        aitId,
        ['RASCUNHO_OFFLINE', 'FINALIZADO_LOCAL'],
        tx,
      );
      const signature = await this.repositories.signatures.create(
        { ...dto, ait_id: aitId },
        tx,
      );
      await this.recordHistory(
        ait,
        ait.current_status as AitStatus,
        'AIT science recorded',
        tx,
      );
      return signature;
    });
  }

  recordPrint(aitId: string, dto: Omit<CreateAitPrintEventDto, 'ait_id'>) {
    return this.repositories.ait.transaction(async (tx) => {
      await this.requireStatus(aitId, ['FINALIZADO_LOCAL', 'ENFILEIRADO'], tx);
      return this.repositories.printEvents.create(
        { ...dto, ait_id: aitId },
        tx,
      );
    });
  }

  finalize(id: string, actorId?: string): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(id, ['RASCUNHO_OFFLINE'], tx);
      const contentHash = contentHashForAit(ait);
      return this.transition(
        ait,
        'FINALIZADO_LOCAL',
        'AIT finalized',
        tx,
        actorId,
        {
          content_hash: contentHash,
          system_signature_ref: `sha256:${contentHash}`,
        },
      );
    });
  }

  queueTransmission(id: string, actorId?: string): Promise<Ait> {
    return this.transitionFrom(
      id,
      ['FINALIZADO_LOCAL'],
      'ENFILEIRADO',
      'AIT queued for transmission',
      actorId,
    );
  }

  receiveProtocol(
    id: string,
    receiptProtocol: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        id,
        ['ENFILEIRADO', 'TRANSMITIDO'],
        tx,
      );
      return this.transition(
        ait,
        'RECEBIDO',
        'RENAINF protocol received',
        tx,
        actorId,
        {
          receipt_protocol: receiptProtocol,
        },
      );
    });
  }

  requestCorrection(
    id: string,
    reason: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.transitionFrom(
      id,
      ['VALIDANDO', 'REJEITADO'],
      'PENDENTE_CORRECAO',
      reason,
      actorId,
    );
  }

  approveCorrection(
    id: string,
    correctionId: string,
    actorId: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(
        id,
        ['PENDENTE_CORRECAO', 'CORRIGIDO'],
        tx,
      );
      const correction = await this.repositories.corrections.findOne(
        correctionId,
        tx,
      );
      if (correction.ait_id !== id)
        throw new BadRequestException('Correction does not belong to AIT');
      await this.repositories.corrections.update(
        correctionId,
        { approved_by_user_ref: actorId },
        tx,
      );
      return this.transition(
        ait,
        'CORRIGIDO',
        correction.justification,
        tx,
        actorId,
      );
    });
  }

  accept(id: string, actorId?: string): Promise<Ait> {
    // TODO(Phase 3 W3.3 RAIT): accepted AITs become the source for defesa/recurso case intake.
    return this.transitionFrom(
      id,
      ['RECEBIDO', 'VALIDANDO', 'CORRIGIDO'],
      'ACEITO',
      'AIT accepted',
      actorId,
    );
  }

  reject(
    id: string,
    reason: string,
    actorIdOrLegacyFlag?: string | boolean,
    legacyActorId?: string,
  ): Promise<Ait> {
    const actorId =
      typeof actorIdOrLegacyFlag === 'string'
        ? actorIdOrLegacyFlag
        : legacyActorId;
    return this.transitionFrom(
      id,
      ['RECEBIDO', 'VALIDANDO', 'PENDENTE_CORRECAO'],
      'REJEITADO',
      reason,
      actorId,
    );
  }

  /** Sole national-system seam. Controllers never construct an HTTP client. */
  publishViaRenainf(
    port: Pick<RenainfPort, 'createTrafficViolation'>,
    input: TrafficViolationInput,
    context?: Parameters<RenainfPort['createTrafficViolation']>[1],
  ): Promise<TrafficViolation> {
    // TODO(Phase 3 outbox): invoke this adapter port from @stynx-nyx/outbox after publication.
    return port.createTrafficViolation(input, context);
  }

  private transitionFrom(
    id: string,
    allowed: AitStatus[],
    target: AitStatus,
    reason: string,
    actorId?: string,
  ): Promise<Ait> {
    return this.repositories.ait.transaction(async (tx) => {
      const ait = await this.requireStatus(id, allowed, tx);
      return this.transition(ait, target, reason, tx, actorId);
    });
  }

  private async requireStatus(
    id: string,
    allowed: AitStatus[],
    tx: Transaction,
  ): Promise<Ait> {
    const ait = await this.repositories.ait.findOne(id, tx);
    if (!allowed.includes(ait.current_status as AitStatus))
      throw new BadRequestException(
        `AIT ${id} is ${ait.current_status}; expected ${allowed.join(', ')}`,
      );
    return ait;
  }

  private async transition(
    ait: Ait,
    target: AitStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
    patch: Partial<CreateAitDto> = {},
  ): Promise<Ait> {
    await this.recordHistory(ait, target, reason, tx, actorId);
    return this.repositories.ait.update(
      ait.id,
      { ...patch, current_status: target },
      tx,
    );
  }

  private recordHistory(
    ait: Ait,
    status: AitStatus,
    reason: string,
    tx: Transaction,
    actorId?: string,
  ) {
    return this.repositories.history.create(
      {
        ait_id: ait.id,
        status,
        user_ref: actorId ?? null,
        system_name: 'detran-backend',
        reason,
      },
      tx,
    );
  }
}

export function contentHashForAit(ait: Ait): string {
  const legalContent = Object.fromEntries(
    Object.entries(ait)
      .filter(
        ([key]) =>
          ![
            'updated_at',
            'content_hash',
            'system_signature_ref',
            'receipt_protocol',
          ].includes(key),
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return createHash('sha256').update(stableJson(legalContent)).digest('hex');
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(',')}}`;
}
