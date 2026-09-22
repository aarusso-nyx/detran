// OrganizationFacade (contrato CTG-0002b §4.3; M9): organizacao/* e gestao L1 (as leituras L1
// são `createListFacade` nas páginas, M13). `pools` (ficha 043). Sem linha na tabela §4.2 →
// só `tick$`/`resync$`. 9 comandos M8 até R-0007 CTG-0004.
import { Injectable, inject } from '@angular/core';
import { OrgClient } from '../api/org.client';
import { WorklistClient } from '../api/worklist.client';
import { RaitClock } from '../clock';
import type {
  CommandBody,
  CreateRaitJetonSheetDto,
  CreateRaitPoolMemberDto,
  CreateRaitScheduleDto,
  CreateRaitUnitDto,
  ListQuery,
  RaitCapacityPlan,
  RaitJetonSheet,
  RaitPool,
  RaitPoolMember,
  RaitQualitySample,
  RaitSchedule,
  RaitUnit,
} from '../models';
import { createCommandRunner, type CommandOutcome } from './command';
import { createListFacade } from './list.facade';
import { bindStream } from './stream';

@Injectable({ providedIn: 'root' })
export class OrganizationFacade {
  private readonly worklist = inject(WorklistClient);
  private readonly org = inject(OrgClient);
  private readonly clock = inject(RaitClock);

  readonly pools = createListFacade<RaitPool>(
    (query) => this.worklist.listRaitPool(query),
    this.clock,
  );
  readonly command = createCommandRunner();

  constructor() {
    bindStream({ types: [], onEvent: () => undefined, slots: [this.pools] });
  }

  loadPools(query: ListQuery = {}): Promise<void> {
    return this.pools.load(query);
  }

  // --- comandos (§3.5; M8) -----------------------------------------------------------------

  publishSchedule(
    body: CreateRaitScheduleDto,
  ): Promise<CommandOutcome<RaitSchedule>> {
    return this.command.run('rait-schedule:publish', () =>
      this.worklist.publishSchedule(body),
    );
  }

  registerMandate(
    body: CreateRaitPoolMemberDto,
  ): Promise<CommandOutcome<RaitPoolMember>> {
    return this.command.run('rait-member:mandate', () =>
      this.worklist.registerMandate(body),
    );
  }

  updatePool(
    poolId: string,
    body: CommandBody & Pick<RaitPool, 'strategy' | 'active'>,
  ): Promise<CommandOutcome<RaitPool>> {
    return this.command.run('rait-pool:update', () =>
      this.worklist.updatePool(
        poolId,
        body,
        this.worklist.etagOf('pools', poolId),
      ),
    );
  }

  constituteUnit(body: CreateRaitUnitDto): Promise<CommandOutcome<RaitUnit>> {
    return this.command.run('rait-unit:constitute', () =>
      this.worklist.constituteUnit(body),
    );
  }

  activateUnit(
    unitId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitUnit>> {
    return this.command.run('rait-unit:activate', () =>
      this.worklist.activateUnit(
        unitId,
        body,
        this.worklist.etagOf('units', unitId),
      ),
    );
  }

  generateJetonSheet(
    body: CreateRaitJetonSheetDto,
  ): Promise<CommandOutcome<RaitJetonSheet>> {
    return this.command.run('rait-jeton:generate', () =>
      this.org.generateJetonSheet(body),
    );
  }

  approveJetonSheet(
    sheetId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitJetonSheet>> {
    return this.command.run('rait-jeton:approve', () =>
      this.org.approveJetonSheet(
        sheetId,
        body,
        this.org.etagOf('jeton-sheets', sheetId),
      ),
    );
  }

  publishCapacityPlan(
    planId: string,
    body: CommandBody,
  ): Promise<CommandOutcome<RaitCapacityPlan>> {
    return this.command.run('rait-capacity-plan:publish', () =>
      this.org.publishCapacityPlan(
        planId,
        body,
        this.org.etagOf('capacity-plans', planId),
      ),
    );
  }

  reviewQualitySample(
    sampleId: string,
    body: CommandBody &
      Pick<RaitQualitySample, 'finding_kind' | 'finding_note' | 'systemic'>,
  ): Promise<CommandOutcome<RaitQualitySample>> {
    return this.command.run('rait-quality-sample:review', () =>
      this.org.reviewQualitySample(
        sampleId,
        body,
        this.org.etagOf('quality-samples', sampleId),
      ),
    );
  }
}
