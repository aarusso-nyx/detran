// R-0033 TASK-0007: PortalClient boundary only. Fixture source map: ../preview-fixtures.ts.
// No superclass method is called: production commands perform HTTP and must remain unreachable.
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { PortalClient, type EntitlementKind } from '../../data/portal.client';
import { PreviewFixtures } from '../preview-fixtures';
import { PreviewStateService } from '../preview-state.service';
import { PreviewActionLog } from '../preview-action-log';

@Injectable()
export class PreviewPortalClient extends PortalClient {
  private readonly fixtures = inject(PreviewFixtures);
  private readonly preview = inject(PreviewStateService);
  private readonly log = inject(PreviewActionLog);

  private async read<T>(name: string, list = false): Promise<T> {
    const state = this.preview.state();
    if (state === 'loading') return new Promise<T>(() => {});
    if (state === 'error' || state === 'forbidden')
      throw new HttpErrorResponse({
        status: state === 'error' ? 500 : 403,
        error: {
          code:
            state === 'error'
              ? 'PORTAL.INTERNAL'
              : 'PORTAL.ENTITLEMENT_REQUIRED',
        },
      });
    const value = await this.fixtures.read<T>(name);
    if (state !== 'empty' || !list) return value;
    if (Array.isArray(value)) return [] as T;
    return {
      ...value,
      items: [],
      ...('total' in (value as object) ? { total: 0 } : {}),
    };
  }

  private unavailable(
    command: string,
    unavailableReason?: string,
  ): Promise<never> {
    this.log.record(command);
    return Promise.reject(
      new HttpErrorResponse({
        status: 422,
        error: {
          code: 'PORTAL.SERVICE_UNAVAILABLE',
          context: unavailableReason ? { unavailableReason } : {},
        },
      }),
    );
  }

  // Guard/control reads stay independent of representative screen scenarios.
  override brand(): ReturnType<PortalClient['brand']> {
    return Promise.resolve({});
  }
  override me(): ReturnType<PortalClient['me']> {
    return this.fixtures.read('ME_RESPONSE_FIXTURE');
  }
  override services(): ReturnType<PortalClient['services']> {
    return this.fixtures.read('PORTAL_SERVICE_CATALOG_FIXTURE');
  }
  override async entitledResource(
    kind: EntitlementKind,
    id: string,
  ): Promise<unknown> {
    const names = {
      ait: 'AIT_ID',
      request: 'REQUEST_EM_ANDAMENTO_ID',
      vehicle: 'VEHICLE_ID',
      crash: 'CRASH_ID',
      exam: 'EXAM_ID',
      manifestation: 'MANIFESTATION_EM_ANALISE_ID',
    };
    if (id === (await this.fixtures.read<string>(names[kind]))) return { id };
    // Only a canonical resource establishes a synthetic fixture entitlement.
    throw new HttpErrorResponse({
      status: 404,
      error: { code: 'PORTAL.NOT_FOUND' },
    });
  }
  override async getService(
    serviceKey: string,
  ): ReturnType<PortalClient['getService']> {
    const services = await this.services();
    const item = services.find((item) => item.serviceKey === serviceKey);
    if (item) return item;
    throw new HttpErrorResponse({
      status: 422,
      error: { code: 'PORTAL.SERVICE_UNAVAILABLE' },
    });
  }
  override listAits(
    ..._args: Parameters<PortalClient['listAits']>
  ): ReturnType<PortalClient['listAits']> {
    return this.read('AIT_LIST_PAGE_FIXTURE', true);
  }
  override getAit(
    ..._args: Parameters<PortalClient['getAit']>
  ): ReturnType<PortalClient['getAit']> {
    return this.read('AIT_DETAIL_FIXTURE', false);
  }
  override getAitPoints(
    ..._args: Parameters<PortalClient['getAitPoints']>
  ): ReturnType<PortalClient['getAitPoints']> {
    return this.read('AIT_POINTS_FIXTURE', false);
  }
  override getPointsSummary(
    ..._args: Parameters<PortalClient['getPointsSummary']>
  ): ReturnType<PortalClient['getPointsSummary']> {
    return this.read('POINTS_SUMMARY_FIXTURE', false);
  }
  override listRequests(
    ..._args: Parameters<PortalClient['listRequests']>
  ): ReturnType<PortalClient['listRequests']> {
    return this.read('REQUEST_LIST_PAGE_FIXTURE', true);
  }
  override getDecision(
    ..._args: Parameters<PortalClient['getDecision']>
  ): ReturnType<PortalClient['getDecision']> {
    return this.read('DECISION_DEFERIDO_FIXTURE', false);
  }
  override listInbox(
    ..._args: Parameters<PortalClient['listInbox']>
  ): ReturnType<PortalClient['listInbox']> {
    return this.read('INBOX_LIST_FIXTURE', true);
  }
  override getSneEnrollment(
    ..._args: Parameters<PortalClient['getSneEnrollment']>
  ): ReturnType<PortalClient['getSneEnrollment']> {
    return this.read('SNE_ENROLLMENT_ADERIDO_FIXTURE', false);
  }
  override getCnh(
    ..._args: Parameters<PortalClient['getCnh']>
  ): ReturnType<PortalClient['getCnh']> {
    return this.read('CNH_READ_FIXTURE', false);
  }
  override listVehicles(
    ..._args: Parameters<PortalClient['listVehicles']>
  ): ReturnType<PortalClient['listVehicles']> {
    return this.read('VEHICLE_LIST_FIXTURE', true);
  }
  override getVehicleClearance(
    ..._args: Parameters<PortalClient['getVehicleClearance']>
  ): ReturnType<PortalClient['getVehicleClearance']> {
    return this.read('VEHICLE_CLEARANCE_BLOCKED_FIXTURE', false);
  }
  override listCrashes(
    ..._args: Parameters<PortalClient['listCrashes']>
  ): ReturnType<PortalClient['listCrashes']> {
    return this.read('CRASH_LIST_FIXTURE', true);
  }
  override getCrash(
    ..._args: Parameters<PortalClient['getCrash']>
  ): ReturnType<PortalClient['getCrash']> {
    return this.read('CRASH_DETAIL_FIXTURE', false);
  }
  override listExams(
    ..._args: Parameters<PortalClient['listExams']>
  ): ReturnType<PortalClient['listExams']> {
    return this.read('EXAM_LIST_FIXTURE', true);
  }
  override getExam(
    ..._args: Parameters<PortalClient['getExam']>
  ): ReturnType<PortalClient['getExam']> {
    return this.read('EXAM_DETAIL_FIXTURE', false);
  }
  override listManifestations(
    ..._args: Parameters<PortalClient['listManifestations']>
  ): ReturnType<PortalClient['listManifestations']> {
    return this.read('MANIFESTATION_LIST_FIXTURE', true);
  }
  override getManifestation(
    ..._args: Parameters<PortalClient['getManifestation']>
  ): ReturnType<PortalClient['getManifestation']> {
    return this.read('MANIFESTATION_EM_ANALISE_FIXTURE', false);
  }
  override async getRequest(
    ..._args: Parameters<PortalClient['getRequest']>
  ): ReturnType<PortalClient['getRequest']> {
    return {
      body: await this.read('REQUEST_DETAIL_WITH_DILIGENCE_FIXTURE'),
      etag: null,
    };
  }
  override async getServiceCharterDeadline(
    ...args: Parameters<PortalClient['getServiceCharterDeadline']>
  ): ReturnType<PortalClient['getServiceCharterDeadline']> {
    const item = await this.getService(args[0]);
    if (
      !item.serviceKey ||
      !item.legalDeadline ||
      !item.normativeReference ||
      !item.availability
    ) {
      throw new Error('source_pending: service charter');
    }
    return {
      serviceKey: item.serviceKey,
      legalDeadline: item.legalDeadline,
      normativeReference: item.normativeReference,
      availability: item.availability,
    };
  }
  override createRequest(
    ..._args: Parameters<PortalClient['createRequest']>
  ): ReturnType<PortalClient['createRequest']> {
    const body = _args[0];
    const delegated = [
      'defesa_previa',
      'recurso_jari',
      'recurso_cetran',
    ].includes(body.serviceKey);
    return this.unavailable(
      'createRequest',
      delegated ? 'delegacao_indisponivel_r0007' : undefined,
    );
  }
  override saveDraft(
    ..._args: Parameters<PortalClient['saveDraft']>
  ): ReturnType<PortalClient['saveDraft']> {
    return this.unavailable('saveDraft');
  }
  override requestAttachmentUpload(
    ..._args: Parameters<PortalClient['requestAttachmentUpload']>
  ): ReturnType<PortalClient['requestAttachmentUpload']> {
    return this.unavailable('requestAttachmentUpload');
  }
  override uploadToSignedUrl(
    ..._args: Parameters<PortalClient['uploadToSignedUrl']>
  ): ReturnType<PortalClient['uploadToSignedUrl']> {
    return this.unavailable('uploadToSignedUrl');
  }
  override completeAttachment(
    ..._args: Parameters<PortalClient['completeAttachment']>
  ): ReturnType<PortalClient['completeAttachment']> {
    return this.unavailable('completeAttachment');
  }
  override submitRequest(
    ..._args: Parameters<PortalClient['submitRequest']>
  ): ReturnType<PortalClient['submitRequest']> {
    return this.unavailable('submitRequest');
  }
  override withdrawRequest(
    ..._args: Parameters<PortalClient['withdrawRequest']>
  ): ReturnType<PortalClient['withdrawRequest']> {
    return this.unavailable('withdrawRequest');
  }
  override respondDiligence(
    ..._args: Parameters<PortalClient['respondDiligence']>
  ): ReturnType<PortalClient['respondDiligence']> {
    return this.unavailable('respondDiligence');
  }
  override elevateAssurance(
    ..._args: Parameters<PortalClient['elevateAssurance']>
  ): ReturnType<PortalClient['elevateAssurance']> {
    return this.unavailable(
      'elevateAssurance',
      'elevacao_govbr_pendente_r0014',
    );
  }
  override completeElevation(
    ..._args: Parameters<PortalClient['completeElevation']>
  ): ReturnType<PortalClient['completeElevation']> {
    return this.unavailable(
      'completeElevation',
      'elevacao_govbr_pendente_r0014',
    );
  }
  override downloadReceipt(
    ..._args: Parameters<PortalClient['downloadReceipt']>
  ): ReturnType<PortalClient['downloadReceipt']> {
    return this.unavailable('downloadReceipt');
  }
  override markInboxRead(
    ..._args: Parameters<PortalClient['markInboxRead']>
  ): ReturnType<PortalClient['markInboxRead']> {
    return this.unavailable('markInboxRead');
  }
  override enrollSne(
    ..._args: Parameters<PortalClient['enrollSne']>
  ): ReturnType<PortalClient['enrollSne']> {
    return this.unavailable('enrollSne');
  }
  override cancelSne(
    ..._args: Parameters<PortalClient['cancelSne']>
  ): ReturnType<PortalClient['cancelSne']> {
    return this.unavailable('cancelSne');
  }
  override createPushSubscription(
    ..._args: Parameters<PortalClient['createPushSubscription']>
  ): ReturnType<PortalClient['createPushSubscription']> {
    return this.unavailable('createPushSubscription');
  }
  override updatePreferences(
    ..._args: Parameters<PortalClient['updatePreferences']>
  ): ReturnType<PortalClient['updatePreferences']> {
    return this.unavailable('updatePreferences');
  }
  override downloadCnhDocument(
    ..._args: Parameters<PortalClient['downloadCnhDocument']>
  ): ReturnType<PortalClient['downloadCnhDocument']> {
    return this.unavailable(
      'downloadCnhDocument',
      'documento_assinado_pendente_r0014',
    );
  }
  override issueCrlv(
    ..._args: Parameters<PortalClient['issueCrlv']>
  ): ReturnType<PortalClient['issueCrlv']> {
    return this.unavailable('issueCrlv');
  }
  override createManifestation(
    ..._args: Parameters<PortalClient['createManifestation']>
  ): ReturnType<PortalClient['createManifestation']> {
    return this.unavailable('createManifestation');
  }
  override acknowledgeManifestation(
    ..._args: Parameters<PortalClient['acknowledgeManifestation']>
  ): ReturnType<PortalClient['acknowledgeManifestation']> {
    return this.unavailable('acknowledgeManifestation');
  }
  override createEvaluation(
    ..._args: Parameters<PortalClient['createEvaluation']>
  ): ReturnType<PortalClient['createEvaluation']> {
    return this.unavailable('createEvaluation');
  }
}
