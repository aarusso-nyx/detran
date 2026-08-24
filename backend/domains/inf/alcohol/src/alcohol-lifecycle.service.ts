import { BadRequestException, Injectable } from '@nestjs/common';
import type { Transaction } from '@stynx-nyx/data';

import type { AlcoholProcedure } from './entities/alcohol-procedure.entity.js';
import type { AlcoholForwardingRepository } from './repositories/alcohol-forwarding.repository.js';
import type { AlcoholProcedureRepository } from './repositories/alcohol-procedure.repository.js';
import type { AlcoholRefusalRepository } from './repositories/alcohol-refusal.repository.js';
import type { AlcoholTestRepository } from './repositories/alcohol-test.repository.js';
import type { PsychomotorSignRepository } from './repositories/psychomotor-sign.repository.js';

type AlcoholStatus =
  | 'draft'
  | 'in_progress'
  | 'recorded'
  | 'refused'
  | 'forwarded'
  | 'closed'
  | 'cancelled'
  | 'invalid';

export interface AlcoholRepositories {
  procedures: AlcoholProcedureRepository;
  tests: AlcoholTestRepository;
  refusals: AlcoholRefusalRepository;
  signs: PsychomotorSignRepository;
  forwardings: AlcoholForwardingRepository;
}

@Injectable()
export class AlcoholLifecycleService {
  constructor(private readonly repositories: AlcoholRepositories) {}

  start(id: string, reason?: string) {
    return this.repositories.procedures.transaction(async (tx) => {
      const procedure = await this.requireStatus(id, ['draft'], tx);
      return this.repositories.procedures.update(
        id,
        { status: 'in_progress', notes: reason ?? procedure.notes ?? null },
        tx,
      );
    });
  }

  recordTest(
    id: string,
    dto: {
      breathalyzer_id?: string;
      test_number?: string;
      tested_at?: string;
      result_mg_l?: number;
      counterproof?: boolean;
      result_image_evidence_id?: string;
      outcome?: string;
    },
  ) {
    return this.repositories.procedures.transaction(async (tx) => {
      await this.requireStatus(id, ['draft', 'in_progress'], tx);
      const test = await this.repositories.tests.create(
        {
          procedure_id: id,
          breathalyzer_id: dto.breathalyzer_id ?? null,
          test_number: dto.test_number ?? null,
          tested_at: dto.tested_at ?? new Date().toISOString(),
          result_mg_l: dto.result_mg_l ?? null,
          counterproof: dto.counterproof ?? false,
          result_image_evidence_id: dto.result_image_evidence_id ?? null,
          status: 'recorded',
        },
        tx,
      );
      await this.repositories.procedures.update(
        id,
        { status: 'recorded', outcome: dto.outcome ?? 'test_recorded' },
        tx,
      );
      return test;
    });
  }

  recordRefusal(
    id: string,
    dto: {
      refused_at?: string;
      refusal_description: string;
      witness_person_id?: string;
      evidence_id?: string;
    },
  ) {
    return this.repositories.procedures.transaction(async (tx) => {
      await this.requireStatus(id, ['draft', 'in_progress'], tx);
      const refusal = await this.repositories.refusals.create(
        {
          procedure_id: id,
          refused_at: dto.refused_at ?? new Date().toISOString(),
          refusal_description: dto.refusal_description,
          witness_person_id: dto.witness_person_id ?? null,
          evidence_id: dto.evidence_id ?? null,
        },
        tx,
      );
      await this.repositories.procedures.update(
        id,
        { status: 'refused', outcome: 'refusal' },
        tx,
      );
      return refusal;
    });
  }

  recordSigns(
    id: string,
    signs: Array<{
      sign_code: string;
      description: string;
      observed?: boolean;
    }>,
  ) {
    return this.repositories.procedures.transaction(async (tx) => {
      const procedure = await this.requireStatus(
        id,
        ['draft', 'in_progress', 'recorded', 'refused'],
        tx,
      );
      const records = [];
      for (const sign of signs)
        records.push(
          await this.repositories.signs.create(
            { procedure_id: id, ...sign, observed: sign.observed ?? true },
            tx,
          ),
        );
      if (procedure.status === 'draft')
        await this.repositories.procedures.update(
          id,
          { status: 'in_progress' },
          tx,
        );
      return records;
    });
  }

  forward(
    id: string,
    dto: {
      forwarding_type: string;
      destination: string;
      forwarded_at?: string;
      protocol?: string;
      notes?: string;
    },
  ) {
    return this.repositories.procedures.transaction(async (tx) => {
      await this.requireStatus(id, ['recorded', 'refused'], tx);
      const forwarding = await this.repositories.forwardings.create(
        {
          procedure_id: id,
          forwarding_type: dto.forwarding_type,
          destination: dto.destination,
          forwarded_at: dto.forwarded_at ?? new Date().toISOString(),
          protocol: dto.protocol ?? null,
          notes: dto.notes ?? null,
        },
        tx,
      );
      await this.repositories.procedures.update(
        id,
        { status: 'forwarded' },
        tx,
      );
      return forwarding;
    });
  }

  close(id: string, outcome?: string) {
    return this.repositories.procedures.transaction(async (tx) => {
      const procedure = await this.requireStatus(
        id,
        ['recorded', 'refused', 'forwarded'],
        tx,
      );
      const [tests, refusals, forwardings] = await Promise.all([
        this.repositories.tests.findAll(tx),
        this.repositories.refusals.findAll(tx),
        this.repositories.forwardings.findAll(tx),
      ]);
      if (
        ![tests, refusals, forwardings].some((items) =>
          items.some((item) => item.procedure_id === id),
        )
      )
        throw new BadRequestException(
          'Alcohol procedure requires a test, refusal, or forwarding',
        );
      return this.repositories.procedures.update(
        id,
        { status: 'closed', outcome: outcome ?? procedure.outcome },
        tx,
      );
    });
  }

  private async requireStatus(
    id: string,
    allowed: AlcoholStatus[],
    tx: Transaction,
  ): Promise<AlcoholProcedure> {
    const procedure = await this.repositories.procedures.findOne(id, tx);
    if (!allowed.includes(procedure.status as AlcoholStatus))
      throw new BadRequestException(
        `Alcohol procedure ${id} is ${procedure.status}; expected ${allowed.join(', ')}`,
      );
    return procedure;
  }
}
