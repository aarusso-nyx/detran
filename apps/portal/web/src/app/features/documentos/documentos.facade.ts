// DocumentosFacade (contrato CTG-0003c §3.3; T-16, /veiculos, T-17; [RN-PORTAL-115/116/117];
// [UC-PORTAL-011/012]; M14): a CNH (consulta informativa, categoria C nesta rodada — [DIVERGE-8]),
// os veículos (forma OD-P36) e a quitação + emissão do CRLV-e. Offline (status 0 sem rede,
// classificado pelo `ErrorBoundary`): T-16 tenta `OfflineDocumentStore.get('cnh-e')` e T-17
// `get('crlv-e')` do MESMO `vehicleId` ([DIVERGE-13]) antes de mostrar `portal.states.offline`.
// `put` só com `validUntil` DO SERVIDOR e categoria A (documento com QR) — nunca calculado.
// `canIssue` do servidor decide o botão; o cliente não soma `blocking`, não trata multa sob
// recurso como débito (DT-027) e reconsulta a quitação após qualquer resposta da emissão
// ([UC-PORTAL-012] 3a). `503 NATIONAL_READ_UNAVAILABLE` mantém o último dado com `cachedAt`.
// O store é resolvido na primeira necessidade (como o `HttpClient` no `PortalClient`).
import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import {
  presentError,
  type ErrorPresentation,
} from '../../core/error-boundary';
import { OfflineDocumentStore } from '../../core/offline-document.store';
import { PortalClient } from '../../data/portal.client';
import type {
  CnhLicense,
  CnhRead,
  CrlvIssued,
  Vehicle,
  VehicleClearance,
} from '../../data/portal-read.models';
import { readStatusFor, type ReadStatus } from '../../data/read-status';
import type { CommandStatus } from '../processos/processos.facade';

export type { CommandStatus } from '../processos/processos.facade';

/** De onde veio o documento exibido. */
export type DocumentSource = 'network' | 'offline';

const CNH_NOT_FOUND_CODE = 'PORTAL.CNH_NOT_FOUND';
const CNH_CLEARANCE_PENDING_CODE = 'PORTAL.CNH_CLEARANCE_PENDING';
const SERVICE_UNAVAILABLE_CODE = 'PORTAL.SERVICE_UNAVAILABLE';
/** T-16 pendência: o passo "pagar" leva à lista de autos do app — a rota do servidor é ignorada. */
const AUTOS_ROUTE = '/autos';
/** Categoria de documento (RN-117 A): só ela vai ao cache offline. */
const DOCUMENT_CATEGORY = 'A';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function stringList(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** `license` livre (OD-P35) → `CnhLicense` por asserção; campos ausentes → `null`/`[]`. */
function toLicense(license: unknown): CnhLicense {
  const record = isRecord(license) ? license : {};
  const status = record['status'];
  return {
    status:
      status === 'valida' ||
      status === 'vencida' ||
      status === 'suspensa' ||
      status === 'cassada'
        ? status
        : null,
    validUntil: stringOrNull(record['validUntil']),
    categories: stringList(record['categories']),
    restrictions: stringList(record['restrictions']),
  };
}

function commandStatusOf(presentation: ErrorPresentation): CommandStatus {
  if (presentation.code === SERVICE_UNAVAILABLE_CODE) return 'unavailable';
  const status = readStatusFor(presentation);
  if (status === 'unavailable') return 'unavailable';
  return status === 'offline' ? 'offline' : 'error';
}

@Injectable()
export class DocumentosFacade {
  private readonly client = inject(PortalClient);
  private readonly injector = inject(Injector);
  private store: OfflineDocumentStore | null = null;

  // T-16
  private readonly cnhStatusState = signal<ReadStatus>('idle');
  private readonly cnhState = signal<CnhRead | null>(null);
  private readonly cnhErrorState = signal<ErrorPresentation | null>(null);
  private readonly cnhSourceState = signal<DocumentSource | null>(null);
  private readonly cnhDocumentStatusState = signal<CommandStatus>('idle');
  private readonly cnhDocumentErrorState = signal<ErrorPresentation | null>(
    null,
  );
  // /veiculos
  private readonly vehiclesStatusState = signal<ReadStatus>('idle');
  private readonly vehiclesState = signal<readonly Vehicle[]>([]);
  private readonly vehiclesCachedAtState = signal<string | null>(null);
  private readonly vehiclesErrorState = signal<ErrorPresentation | null>(null);
  // T-17
  private readonly clearanceStatusState = signal<ReadStatus>('idle');
  private readonly clearanceState = signal<VehicleClearance | null>(null);
  private readonly clearanceErrorState = signal<ErrorPresentation | null>(null);
  private readonly crlvStatusState = signal<CommandStatus>('idle');
  private readonly crlvState = signal<CrlvIssued | null>(null);
  private readonly crlvSourceState = signal<DocumentSource | null>(null);
  private readonly crlvErrorState = signal<ErrorPresentation | null>(null);
  private cnhSequence = 0;
  private vehiclesSequence = 0;
  private clearanceSequence = 0;

  readonly cnhStatus = this.cnhStatusState.asReadonly();
  readonly cnh = this.cnhState.asReadonly();
  /** `cnh()?.license` por asserção (OD-P35). */
  readonly cnhLicense = computed<CnhLicense | null>(() => {
    const cnh = this.cnhState();
    return cnh ? toLicense(cnh.license) : null;
  });
  readonly cnhError = this.cnhErrorState.asReadonly();
  readonly cnhSource = this.cnhSourceState.asReadonly();
  readonly cnhDocumentStatus = this.cnhDocumentStatusState.asReadonly();
  readonly cnhDocumentError = this.cnhDocumentErrorState.asReadonly();
  readonly vehiclesStatus = this.vehiclesStatusState.asReadonly();
  readonly vehicles = this.vehiclesState.asReadonly();
  readonly vehiclesCachedAt = this.vehiclesCachedAtState.asReadonly();
  readonly vehiclesError = this.vehiclesErrorState.asReadonly();
  readonly clearanceStatus = this.clearanceStatusState.asReadonly();
  readonly clearance = this.clearanceState.asReadonly();
  readonly clearanceError = this.clearanceErrorState.asReadonly();
  readonly crlvStatus = this.crlvStatusState.asReadonly();
  readonly crlv = this.crlvState.asReadonly();
  readonly crlvSource = this.crlvSourceState.asReadonly();
  readonly crlvError = this.crlvErrorState.asReadonly();

  /** GET documents/cnh; categoria A com validade → `put('cnh-e')` (nesta rodada nunca); offline → `get('cnh-e')`. */
  async loadCnh(): Promise<void> {
    this.cnhStatusState.set('loading');
    this.cnhErrorState.set(null);
    const sequence = ++this.cnhSequence;
    try {
      const cnh = await this.client.getCnh();
      if (sequence !== this.cnhSequence) return;
      this.cnhState.set(cnh);
      this.cnhSourceState.set('network');
      this.cnhStatusState.set('ready');
      const validUntil = toLicense(cnh.license).validUntil;
      if ((cnh.category as string) === DOCUMENT_CATEGORY && validUntil) {
        await this.offlineStore.put('cnh-e', cnh, validUntil);
      }
    } catch (error: unknown) {
      if (sequence !== this.cnhSequence) return;
      const presentation = presentError(error);
      const status = readStatusFor(presentation);
      if (status === 'offline') {
        const cached = await this.offlineStore.get<CnhRead>('cnh-e');
        if (sequence !== this.cnhSequence) return;
        if (cached) {
          this.cnhState.set(cached.document);
          this.cnhSourceState.set('offline');
          this.cnhErrorState.set(presentation);
          this.cnhStatusState.set('ready');
          return;
        }
      }
      this.cnhErrorState.set(
        presentation.code === CNH_CLEARANCE_PENDING_CODE
          ? { ...presentation, nextStepRoute: AUTOS_ROUTE }
          : presentation,
      );
      if (presentation.code === CNH_NOT_FOUND_CODE) {
        this.cnhState.set(null);
        this.cnhStatusState.set('empty');
        return;
      }
      // 503 nacional mantém o último dado lido (RN-117 C); os demais limpam.
      if (status !== 'unavailable') this.cnhState.set(null);
      this.cnhStatusState.set(status);
    }
  }

  /** GET documents/cnh?documentBytes=true → Blob; 422 → 'unavailable' (documento_assinado_pendente_r0014). */
  async downloadCnh(): Promise<Blob | null> {
    this.cnhDocumentStatusState.set('submitting');
    this.cnhDocumentErrorState.set(null);
    try {
      const blob = await this.client.downloadCnhDocument();
      this.cnhDocumentStatusState.set('done');
      return blob;
    } catch (error: unknown) {
      const presentation = presentError(error);
      this.cnhDocumentErrorState.set(presentation);
      this.cnhDocumentStatusState.set(commandStatusOf(presentation));
      return null;
    }
  }

  /** GET vehicles; `empty` quando `items.length === 0`. */
  async loadVehicles(): Promise<void> {
    this.vehiclesStatusState.set('loading');
    this.vehiclesErrorState.set(null);
    const sequence = ++this.vehiclesSequence;
    try {
      const page = await this.client.listVehicles();
      if (sequence !== this.vehiclesSequence) return;
      this.vehiclesState.set(page.items ?? []);
      this.vehiclesCachedAtState.set(page.cachedAt ?? null);
      this.vehiclesStatusState.set(
        (page.items ?? []).length === 0 ? 'empty' : 'ready',
      );
    } catch (error: unknown) {
      if (sequence !== this.vehiclesSequence) return;
      const presentation = presentError(error);
      this.vehiclesErrorState.set(presentation);
      this.vehiclesStatusState.set(readStatusFor(presentation));
    }
  }

  /** GET vehicles/{id}/clearance (quitação ANTES da tentativa); depois `get('crlv-e')` do mesmo veículo. */
  async loadClearance(vehicleId: string): Promise<void> {
    this.clearanceStatusState.set('loading');
    this.clearanceErrorState.set(null);
    const sequence = ++this.clearanceSequence;
    try {
      const clearance = await this.client.getVehicleClearance(vehicleId);
      if (sequence !== this.clearanceSequence) return;
      this.clearanceState.set(clearance);
      this.clearanceStatusState.set('ready');
    } catch (error: unknown) {
      if (sequence !== this.clearanceSequence) return;
      const presentation = presentError(error, {
        entitlement: { kind: 'vehicle', id: vehicleId },
      });
      const status = readStatusFor(presentation);
      this.clearanceErrorState.set(presentation);
      // 503 nacional mantém a última quitação lida com `cachedAt` (RN-117 C).
      if (status !== 'unavailable') this.clearanceState.set(null);
      this.clearanceStatusState.set(status);
    }
    await this.restoreOfflineCrlv(vehicleId, sequence);
  }

  /** POST vehicles/{id}/crlv-e; 2xx com validade → `put('crlv-e')`; reconsulta a quitação depois. */
  async issueCrlv(vehicleId: string): Promise<CrlvIssued | null> {
    this.crlvStatusState.set('submitting');
    this.crlvErrorState.set(null);
    let issued: CrlvIssued | null = null;
    try {
      const result = await this.client.issueCrlv(vehicleId);
      issued = { ...(result.body ?? {}), vehicleId } as CrlvIssued;
      this.crlvState.set(issued);
      this.crlvSourceState.set('network');
      this.crlvStatusState.set('done');
      if (issued.qrVerification !== null && issued.validUntil) {
        await this.offlineStore.put('crlv-e', issued, issued.validUntil);
      }
    } catch (error: unknown) {
      const presentation = presentError(error, {
        entitlement: { kind: 'vehicle', id: vehicleId },
      });
      this.crlvErrorState.set(presentation);
      this.crlvStatusState.set(commandStatusOf(presentation));
    }
    void this.loadClearance(vehicleId);
    return issued;
  }

  /** `get('crlv-e')` só vale para o MESMO `vehicleId` ([DIVERGE-13]); outro veículo ou nada → sem documento. */
  private async restoreOfflineCrlv(
    vehicleId: string,
    sequence: number,
  ): Promise<void> {
    const cached = await this.offlineStore.get<CrlvIssued>('crlv-e');
    if (sequence !== this.clearanceSequence) return;
    if (cached && cached.document.vehicleId === vehicleId) {
      if (this.crlvState() === null) {
        this.crlvState.set(cached.document);
        this.crlvSourceState.set('offline');
      }
      return;
    }
    if (this.crlvSourceState() === 'offline') {
      this.crlvState.set(null);
      this.crlvSourceState.set(null);
    }
  }

  private get offlineStore(): OfflineDocumentStore {
    this.store ??= this.injector.get(OfflineDocumentStore);
    return this.store;
  }
}
