// Modelos do módulo colegiado (contrato CTG-0002b §2): aliases de
// `BpInfRaitSession001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfRaitSession001 } from '@detran/api-clients';

type S = BpInfRaitSession001.components['schemas'];

export type RaitSession = S['RaitSession'];
export type RaitAgendaItem = S['RaitAgendaItem'];
export type RaitAttendance = S['RaitAttendance'];
export type RaitVote = S['RaitVote'];
export type RaitOralArgument = S['RaitOralArgument'];
export type RaitMinutes = S['RaitMinutes'];
export type RaitSessionMinutesSnapshot = S['RaitSessionMinutesSnapshot'];
export type RaitSessionMinutesManifest = S['RaitSessionMinutesManifest'];
export type RaitMinutesRequiredSigner = S['RaitMinutesRequiredSigner'];
export type RaitMinutesSignatureReceipt = S['RaitMinutesSignatureReceipt'];

export type CreateRaitSessionDto = S['CreateRaitSessionDto'];
export type CreateRaitAgendaItemDto = S['CreateRaitAgendaItemDto'];
export type CreateRaitAttendanceDto = S['CreateRaitAttendanceDto'];
export type CreateRaitVoteDto = S['CreateRaitVoteDto'];
export type CreateRaitOralArgumentDto = S['CreateRaitOralArgumentDto'];
export type CreateRaitMinutesDto = S['CreateRaitMinutesDto'];

export type RaitSessionState = RaitSession['state'];
export type RaitJudgingBody = RaitSession['judging_body'];
export type RaitSessionModality = RaitSession['modality'];
export type RaitOpinionVote = NonNullable<RaitAgendaItem['opinion_vote']>;
export type RaitAgendaOutcome = NonNullable<RaitAgendaItem['outcome']>;
export type RaitVoteValue = RaitVote['vote'];
export type RaitMembershipKind = NonNullable<RaitAttendance['membership_kind']>;
export type RaitMinutesSignerRole = RaitMinutesRequiredSigner['signer_role'];
