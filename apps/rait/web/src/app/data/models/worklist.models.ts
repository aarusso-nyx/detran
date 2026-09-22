// Modelos do módulo worklist (contrato CTG-0002b §2): aliases de
// `BpInfRaitWorklist001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfRaitWorklist001 } from '@detran/api-clients';

type S = BpInfRaitWorklist001.components['schemas'];

export type RaitUnit = S['RaitUnit'];
export type RaitPool = S['RaitPool'];
export type RaitPoolMember = S['RaitPoolMember'];
export type RaitSchedule = S['RaitSchedule'];
export type RaitScheduleSlot = S['RaitScheduleSlot'];
export type RaitBatch = S['RaitBatch'];
export type RaitBatchDrawSnapshot = S['RaitBatchDrawSnapshot'];
export type RaitBatchMinutesManifest = S['RaitBatchMinutesManifest'];
export type RaitBatchItem = S['RaitBatchItem'];
export type RaitAssignment = S['RaitAssignment'];
export type RaitImpediment = S['RaitImpediment'];
export type RaitSubstituteDuty = S['RaitSubstituteDuty'];
export type RaitBench = S['RaitBench'];
export type RaitClock = S['RaitClock'];
export type RaitClockAlert = S['RaitClockAlert'];

export type CreateRaitUnitDto = S['CreateRaitUnitDto'];
export type CreateRaitPoolDto = S['CreateRaitPoolDto'];
export type CreateRaitPoolMemberDto = S['CreateRaitPoolMemberDto'];
export type CreateRaitScheduleDto = S['CreateRaitScheduleDto'];
export type CreateRaitScheduleSlotDto = S['CreateRaitScheduleSlotDto'];
export type CreateRaitBatchDto = S['CreateRaitBatchDto'];
export type CreateRaitBatchItemDto = S['CreateRaitBatchItemDto'];
export type CreateRaitAssignmentDto = S['CreateRaitAssignmentDto'];
export type CreateRaitImpedimentDto = S['CreateRaitImpedimentDto'];
export type CreateRaitSubstituteDutyDto = S['CreateRaitSubstituteDutyDto'];
export type CreateRaitBenchDto = S['CreateRaitBenchDto'];
export type CreateRaitClockDto = S['CreateRaitClockDto'];
export type CreateRaitClockAlertDto = S['CreateRaitClockAlertDto'];

export type RaitUnitState = RaitUnit['state'];
export type RaitPoolStrategy = RaitPool['strategy'];
export type RaitMemberRole = RaitPoolMember['member_role'];
export type RaitMemberStatus = RaitPoolMember['status'];
export type RaitScheduleKind = RaitSchedule['kind'];
export type RaitAvailability = RaitSchedule['availability'];
export type RaitAbsenceReason = NonNullable<RaitSchedule['absence_reason']>;
export type RaitBatchKind = RaitBatch['kind'];
export type RaitBatchState = RaitBatch['state'];
export type RaitDeclineKind = NonNullable<RaitBatchItem['decline_kind']>;
export type RaitReleaseReason = NonNullable<RaitAssignment['release_reason']>;
export type RaitImpedimentKind = RaitImpediment['kind'];
export type RaitBenchState = RaitBench['state'];
export type RaitClockCode = RaitClock['clock_code'];
/** 'SEM_RISCO' | 'ALERTA_N1' | 'ALERTA_N2' | 'ALERTA_N3' | 'CRITICO' | 'PRESCRITO_OPERACIONAL'. */
export type RaitRiskFlag = RaitClock['flag'];
export type RaitRepresentationBlock = NonNullable<
  RaitPoolMember['representation_block']
>;
