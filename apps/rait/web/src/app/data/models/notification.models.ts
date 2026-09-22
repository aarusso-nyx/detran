// Modelos da notificação (contrato CTG-0002b §2): aliases de
// `BpInfNotification001.components['schemas']` (ADR-0007); enums = tipos indexados.
import type { BpInfNotification001 } from '@detran/api-clients';

type S = BpInfNotification001.components['schemas'];

export type Notice = S['Notice'];
export type NoticeAcknowledgement = S['NoticeAcknowledgement'];
export type NoticeDeliveryAttempt = S['NoticeDeliveryAttempt'];

export type NoticeKind = Notice['kind'];
export type NoticeStatus = Notice['status'];
export type NoticeChannel = Notice['channel'];
