// Modelos do módulo organização (contrato CTG-0002b §2): aliases de
// `BpInfRaitOrg001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfRaitOrg001 } from '@detran/api-clients';

type S = BpInfRaitOrg001.components['schemas'];

export type RaitHoliday = S['RaitHoliday'];
export type RaitSuspensionAct = S['RaitSuspensionAct'];
export type RaitJetonSheet = S['RaitJetonSheet'];
export type RaitJetonLine = S['RaitJetonLine'];
export type RaitIncident = S['RaitIncident'];
export type RaitQualitySample = S['RaitQualitySample'];
export type RaitCapacityPlan = S['RaitCapacityPlan'];
export type RaitExport = S['RaitExport'];

export type CreateRaitHolidayDto = S['CreateRaitHolidayDto'];
export type CreateRaitSuspensionActDto = S['CreateRaitSuspensionActDto'];
export type CreateRaitJetonSheetDto = S['CreateRaitJetonSheetDto'];
export type CreateRaitJetonLineDto = S['CreateRaitJetonLineDto'];
export type CreateRaitIncidentDto = S['CreateRaitIncidentDto'];
export type CreateRaitQualitySampleDto = S['CreateRaitQualitySampleDto'];
export type CreateRaitCapacityPlanDto = S['CreateRaitCapacityPlanDto'];
export type CreateRaitExportDto = S['CreateRaitExportDto'];

export type RaitHolidayScope = RaitHoliday['scope'];
export type RaitSuspensionActState = RaitSuspensionAct['state'];
export type RaitJetonSheetState = RaitJetonSheet['state'];
export type RaitFindingKind = NonNullable<RaitQualitySample['finding_kind']>;
export type RaitExportStatus = RaitExport['status'];
