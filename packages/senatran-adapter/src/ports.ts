import type { IntegrationContext } from '@stynx-nyx/integration-adapter';

import { SenatranClient } from './client.js';
import type {
  AdministrativeCase,
  Appeal,
  AppealSearchFilters,
  AppealSearchResult,
  AppealDecisionInput,
  AppealInput,
  CitizenCollection,
  CitizenLicense,
  CrashCorrection,
  CrashCorrectionInput,
  CrashReport,
  CrashReportInput,
  CrashSearchFilters,
  CrashSearchResult,
  DriverLicenseValidation,
  DriverLicenseValidationInput,
  DriverProcess,
  DriverProcessType,
  DriverRecord,
  InfractionRecognition,
  OpenDriverProcessInput,
  PaymentQuote,
  PreliminaryDefenseInput,
  SneEnrollment,
  SneNotification,
  SneNotificationInput,
  TrafficViolation,
  TrafficViolationInput,
  TrafficViolationRecord,
  VehicleRecord,
} from './domain.js';
import { SenatranAdapterError } from './errors.js';
import {
  mapAdministrativeCase,
  mapAppeal,
  mapCrashCorrection,
  mapCrashReport,
  mapDriver,
  mapDriverProcess,
  mapPaymentQuote,
  mapRecognition,
  mapSneEnrollment,
  mapSneNotification,
  mapTrafficViolation,
  mapTransactionalTrafficViolation,
  mapVehicle,
  toAppeal,
  toAppealDecision,
  toCrashCorrection,
  toCrashReport,
  toOpenDriverProcess,
  toPreliminaryDefense,
  toSneNotification,
  toTrafficViolation,
} from './mappers.js';
import type {
  ReadComponents,
  ReadPaths,
  TransactionalComponents,
} from './wire.js';

type Read = ReadComponents['schemas'];
type Transactional = TransactionalComponents['schemas'];
type ReadPath = keyof ReadPaths & string;
type ReadGet<Path extends ReadPath> = ReadPaths[Path] extends {
  get: infer Operation;
}
  ? Operation
  : never;
export type WsdenatranReadParameters<Path extends ReadPath> =
  ReadGet<Path> extends {
    parameters: infer Parameters;
  }
    ? (Parameters extends { path?: infer PathParameters }
        ? PathParameters
        : object) &
        (Parameters extends { query?: infer QueryParameters }
          ? QueryParameters
          : object)
    : never;
export type WsdenatranReadResponse<Path extends ReadPath> =
  ReadGet<Path> extends {
    responses: {
      200: { content: { 'application/json': infer Response } };
    };
  }
    ? Response
    : never;

export interface RenachPort {
  findDriverByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined>;
  findDriverByLicense(
    licenseNumber: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined>;
  validateDriverLicense(
    input: DriverLicenseValidationInput,
    context?: IntegrationContext,
  ): Promise<DriverLicenseValidation>;
  listProcesses(
    filters?: { cpf?: string; processType?: DriverProcessType },
    context?: IntegrationContext,
  ): Promise<DriverProcess[]>;
  getProcess(
    renachNumber: string,
    context?: IntegrationContext,
  ): Promise<DriverProcess>;
  openProcess(
    input: OpenDriverProcessInput,
    context?: IntegrationContext,
  ): Promise<DriverProcess>;
}

export interface RenainfPort {
  findInfractionsByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolationRecord[]>;
  findInfractionByRenainf(
    renainfNumber: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolationRecord | undefined>;
  getTrafficViolation(
    aitNumber: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolation>;
  createTrafficViolation(
    input: TrafficViolationInput,
    context?: IntegrationContext,
  ): Promise<TrafficViolation>;
  openAdministrativeCase(
    aitNumber: string,
    agencyCode?: string,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase>;
  submitPreliminaryDefense(
    caseId: string,
    input: PreliminaryDefenseInput,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase>;
  submitAppeal(
    caseId: string,
    input: AppealInput,
    context?: IntegrationContext,
  ): Promise<Appeal>;
  recordAppealDecision(
    appealId: string,
    input: AppealDecisionInput,
    context?: IntegrationContext,
  ): Promise<Appeal>;
  getDebt(
    caseId: string,
    context?: IntegrationContext,
  ): Promise<Transactional['Debito']>;
  getAppeal(appealId: string, context?: IntegrationContext): Promise<Appeal>;
  listAppeals(
    filters?: AppealSearchFilters,
    context?: IntegrationContext,
  ): Promise<AppealSearchResult>;
}

export interface RenaestPort {
  submitCrash(
    input: CrashReportInput,
    context?: IntegrationContext,
  ): Promise<CrashReport>;
  submitCrashBatch(
    inputs: CrashReportInput[],
    context?: IntegrationContext,
  ): Promise<Transactional['SinistroLoteResponse']>;
  getCrash(crashId: string, context?: IntegrationContext): Promise<CrashReport>;
  getCrashByProtocol(
    protocol: string,
    context?: IntegrationContext,
  ): Promise<CrashReport>;
  searchCrashes(
    filters?: CrashSearchFilters,
    context?: IntegrationContext,
  ): Promise<CrashSearchResult>;
  complementCrash(
    crashId: string,
    input: CrashCorrectionInput,
    context?: IntegrationContext,
  ): Promise<CrashCorrection>;
  correctCrash(
    crashId: string,
    input: CrashCorrectionInput,
    context?: IntegrationContext,
  ): Promise<CrashCorrection>;
}

export interface SnePort {
  getVehicleEnrollment(
    plate: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment>;
  getCitizenEnrollment(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment>;
  enrollCitizen(
    input: { cpf: string; channel?: string },
    context?: IntegrationContext,
  ): Promise<SneEnrollment>;
  getAgencyEnrollment(
    agencyCode: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment>;
  notifyInfraction(
    input: SneNotificationInput,
    context?: IntegrationContext,
  ): Promise<SneNotification>;
  notifyPenalty(
    input: SneNotificationInput,
    context?: IntegrationContext,
  ): Promise<SneNotification>;
  getNotification(
    protocol: string,
    context?: IntegrationContext,
  ): Promise<SneNotification>;
  cancelNotification(
    protocol: string,
    reason?: string,
    context?: IntegrationContext,
  ): Promise<Pick<SneNotification, 'protocol' | 'status'>>;
}

export interface CdtPort {
  listCitizenNotifications(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>>;
  listCitizenInfractions(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>>;
  listCitizenVehicles(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>>;
  getCitizenLicense(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenLicense>;
  getPaymentQuote(
    aitNumber: string,
    context?: IntegrationContext,
  ): Promise<PaymentQuote>;
  recognizeInfraction(
    aitNumber: string,
    input?: { channel?: string; cpf?: string },
    context?: IntegrationContext,
  ): Promise<InfractionRecognition>;
  submitCitizenPreliminaryDefense(
    cpf: string,
    aitNumber: string,
    input: PreliminaryDefenseInput,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase>;
  submitCitizenAppeal(
    cpf: string,
    aitNumber: string,
    input: AppealInput,
    context?: IntegrationContext,
  ): Promise<Appeal>;
}

/** Exact generated typing for every one of the 60 read-contract operations. */
export interface WsdenatranReadPort {
  read<Path extends ReadPath>(
    path: Path,
    parameters: WsdenatranReadParameters<Path>,
    context?: IntegrationContext,
  ): Promise<WsdenatranReadResponse<Path>>;
  findVehicleByPlate(
    plate: string,
    context?: IntegrationContext,
  ): Promise<VehicleRecord | undefined>;
  findVehicleByRenavam(
    renavam: string,
    context?: IntegrationContext,
  ): Promise<VehicleRecord | undefined>;
  findDriverByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined>;
}

export interface SenatranPorts {
  renainf: RenainfPort;
  renaest: RenaestPort;
  renach: RenachPort;
  sne: SnePort;
  cdt: CdtPort;
  wsdenatranRead: WsdenatranReadPort;
}

export function createSenatranPorts(client: SenatranClient): SenatranPorts {
  const wsdenatranRead = new WsdenatranReadHttpPort(client);
  return {
    renainf: new RenainfHttpPort(client),
    renaest: new RenaestHttpPort(client),
    renach: new RenachHttpPort(client),
    sne: new SneHttpPort(client),
    cdt: new CdtHttpPort(client),
    wsdenatranRead,
  };
}

class RenachHttpPort implements RenachPort {
  constructor(private readonly client: SenatranClient) {}

  async findDriverByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined> {
    const response = await this.client.request<Read['CondutorListResponse']>(
      readRequest(
        'renach',
        'find-driver-by-cpf',
        `/v1/condutores/cpf/${segment(cpf)}`,
      ),
      context,
    );
    return response.condutores?.[0]
      ? mapDriver(response.condutores[0])
      : undefined;
  }

  async findDriverByLicense(
    licenseNumber: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined> {
    const response = await this.client.request<Read['CondutorListResponse']>(
      readRequest(
        'renach',
        'find-driver-by-license',
        `/v1/condutores/registroCnh/${segment(licenseNumber)}`,
      ),
      context,
    );
    return response.condutores?.[0]
      ? mapDriver(response.condutores[0])
      : undefined;
  }

  async validateDriverLicense(
    input: DriverLicenseValidationInput,
    context?: IntegrationContext,
  ): Promise<DriverLicenseValidation> {
    const response = await this.client.request<Read['CondutorImagem']>(
      readRequest(
        'renach',
        'validate-driver-license',
        `/v1/condutores/validacao/cpf/${segment(input.cpf)}/registroCnh/${segment(input.licenseNumber)}/segurancaCnh/${segment(input.securityNumber)}`,
      ),
      context,
    );
    return {
      valid: true,
      driver: {
        cpf: input.cpf,
        name: response.nomeCondutor,
        birthDate: response.dataNascimento,
        licenseNumber: response.numeroRegistro,
        currentCategory: response.categoria,
        licenseState: response.ufHabilitacaoAtual,
        jurisdictionState: response.ufDominio,
        licenseStatus: response.situacao,
        licenseExpiresAt: response.dataValidade,
        occurrenceCount: response.indicadorInfracoesNoUltimoAno ? 1 : 0,
      },
    };
  }

  async listProcesses(
    filters: { cpf?: string; processType?: DriverProcessType } = {},
    context?: IntegrationContext,
  ): Promise<DriverProcess[]> {
    const wireType = filters.processType
      ? toOpenDriverProcess({
          cpf: filters.cpf ?? '00000000000',
          processType: filters.processType,
        }).tipoProcesso
      : undefined;
    const response = await this.client.request<
      Transactional['ProcessoRenachListResponse']
    >(
      {
        surface: 'renach',
        operation: 'list-processes',
        method: 'GET',
        path: '/v1/renach/processos',
        query: { cpf: filters.cpf, tipoProcesso: wireType },
      },
      context,
    );
    return (response.processos ?? []).map(mapDriverProcess);
  }

  async getProcess(
    renachNumber: string,
    context?: IntegrationContext,
  ): Promise<DriverProcess> {
    const response = await this.client.request<Transactional['ProcessoRenach']>(
      readRequest(
        'renach',
        'get-process',
        `/v1/renach/processos/${segment(renachNumber)}`,
      ),
      context,
    );
    return mapDriverProcess(response);
  }

  async openProcess(
    input: OpenDriverProcessInput,
    context?: IntegrationContext,
  ): Promise<DriverProcess> {
    const body = toOpenDriverProcess(input);
    try {
      const response = await this.client.request<
        Transactional['ProcessoRenach']
      >(
        writeRequest('renach', 'open-process', '/v1/renach/processos', body),
        context,
      );
      return { ...mapDriverProcess(response), openingResult: 'OPENED' };
    } catch (error) {
      if (
        error instanceof SenatranAdapterError &&
        error.providerCode === 'RENACH.PROCESS.ALREADY_OPEN'
      ) {
        const existing = await this.listProcesses(
          { cpf: input.cpf, processType: input.processType },
          context,
        );
        if (existing[0]?.renachNumber) {
          return { ...existing[0], openingResult: 'ALREADY_OPEN' };
        }
      }
      throw error;
    }
  }
}

class RenainfHttpPort implements RenainfPort {
  constructor(private readonly client: SenatranClient) {}

  async findInfractionsByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolationRecord[]> {
    const response = await this.client.request<Read['InfracaoListResponse']>(
      readRequest(
        'renainf',
        'find-infractions-by-cpf',
        `/v1/infracoes/cpf/${segment(cpf)}`,
      ),
      context,
    );
    return (response.infracoes ?? []).map(mapTrafficViolation);
  }

  async findInfractionByRenainf(
    renainfNumber: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolationRecord | undefined> {
    const response = await this.client.request<Read['InfracaoListResponse']>(
      readRequest(
        'renainf',
        'find-infraction-by-renainf',
        `/v1/infracoes/renainf/${segment(renainfNumber)}`,
      ),
      context,
    );
    return response.infracoes?.[0]
      ? mapTrafficViolation(response.infracoes[0])
      : undefined;
  }

  async getTrafficViolation(
    aitNumber: string,
    context?: IntegrationContext,
  ): Promise<TrafficViolation> {
    const response = await this.client.request<Transactional['AutoInfracao']>(
      readRequest(
        'renainf',
        'get-traffic-violation',
        `/v1/renainf/autosInfracao/${segment(aitNumber)}`,
      ),
      context,
    );
    return mapTransactionalTrafficViolation(response);
  }

  async createTrafficViolation(
    input: TrafficViolationInput,
    context?: IntegrationContext,
  ): Promise<TrafficViolation> {
    const response = await this.client.request<Transactional['AutoInfracao']>(
      writeRequest(
        'renainf',
        'create-traffic-violation',
        '/v1/renainf/autosInfracao',
        toTrafficViolation(input),
      ),
      context,
    );
    return mapTransactionalTrafficViolation(response);
  }

  async openAdministrativeCase(
    aitNumber: string,
    agencyCode?: string,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase> {
    const response = await this.client.request<
      Transactional['ProcessoAdministrativo']
    >(
      writeRequest(
        'renainf',
        'open-administrative-case',
        '/v1/renainf/processosAdministrativos',
        {
          numeroAit: aitNumber,
          ...(agencyCode ? { codigoOrgaoAutuador: agencyCode } : {}),
        },
      ),
      context,
    );
    return mapAdministrativeCase(response);
  }

  async submitPreliminaryDefense(
    caseId: string,
    input: PreliminaryDefenseInput,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase> {
    const response = await this.client.request<
      Transactional['ProcessoAdministrativo']
    >(
      writeRequest(
        'renainf',
        'submit-preliminary-defense',
        `/v1/renainf/processosAdministrativos/${segment(caseId)}/defesasPrevias`,
        toPreliminaryDefense(input),
      ),
      context,
    );
    return mapAdministrativeCase(response);
  }

  async submitAppeal(
    caseId: string,
    input: AppealInput,
    context?: IntegrationContext,
  ): Promise<Appeal> {
    const response = await this.client.request<Transactional['Recurso']>(
      writeRequest(
        'renainf',
        'submit-appeal',
        `/v1/renainf/processosAdministrativos/${segment(caseId)}/recursos`,
        toAppeal(input),
      ),
      context,
    );
    return mapAppeal(response);
  }

  async recordAppealDecision(
    appealId: string,
    input: AppealDecisionInput,
    context?: IntegrationContext,
  ): Promise<Appeal> {
    const response = await this.client.request<Transactional['Recurso']>(
      writeRequest(
        'renainf',
        'record-appeal-decision',
        `/v1/renainf/recursos/${segment(appealId)}/julgamento`,
        toAppealDecision(input),
      ),
      context,
    );
    return mapAppeal(response);
  }

  getDebt(
    caseId: string,
    context?: IntegrationContext,
  ): Promise<Transactional['Debito']> {
    return this.client.request(
      readRequest(
        'renainf',
        'get-debt',
        `/v1/renainf/processosAdministrativos/${segment(caseId)}/debito`,
      ),
      context,
    );
  }

  async getAppeal(
    appealId: string,
    context?: IntegrationContext,
  ): Promise<Appeal> {
    const response = await this.client.request<Transactional['Recurso']>(
      readRequest(
        'renainf',
        'get-appeal',
        `/v1/renainf/recursos/${segment(appealId)}`,
      ),
      context,
    );
    return mapAppeal(response);
  }

  async listAppeals(
    filters: AppealSearchFilters = {},
    context?: IntegrationContext,
  ): Promise<AppealSearchResult> {
    const response = await this.client.request<{
      quantidade?: number;
      recursos?: Transactional['Recurso'][];
      idUltimoRegistro?: string | null;
    }>(
      readRequest('renainf', 'list-appeals', '/v1/renainf/recursos', {
        orgaoAutuador: filters.agencyCode,
        situacao: filters.status,
        instancia:
          filters.instance === 'SECOND_INSTANCE'
            ? 'SEGUNDA_INSTANCIA'
            : filters.instance,
        dataInicio: filters.startedAt,
        dataFim: filters.endedAt,
        quantidadeRegistros: filters.limit,
        idUltimoRegistro: filters.after,
      }),
      context,
    );
    return {
      count: response.quantidade ?? response.recursos?.length ?? 0,
      appeals: (response.recursos ?? []).map(mapAppeal),
      ...(response.idUltimoRegistro
        ? { nextAfter: response.idUltimoRegistro }
        : {}),
    };
  }
}

class RenaestHttpPort implements RenaestPort {
  constructor(private readonly client: SenatranClient) {}

  async submitCrash(
    input: CrashReportInput,
    context?: IntegrationContext,
  ): Promise<CrashReport> {
    const response = await this.client.request<Transactional['Sinistro']>(
      writeRequest(
        'renaest',
        'submit-crash',
        '/v1/renaest/sinistros',
        toCrashReport(input),
      ),
      context,
    );
    return mapCrashReport(response);
  }

  submitCrashBatch(
    inputs: CrashReportInput[],
    context?: IntegrationContext,
  ): Promise<Transactional['SinistroLoteResponse']> {
    return this.client.request(
      writeRequest(
        'renaest',
        'submit-crash-batch',
        '/v1/renaest/sinistros/lotes',
        {
          sinistros: inputs.map(toCrashReport),
        },
      ),
      context,
    );
  }

  async getCrash(
    crashId: string,
    context?: IntegrationContext,
  ): Promise<CrashReport> {
    const response = await this.client.request<Transactional['Sinistro']>(
      readRequest(
        'renaest',
        'get-crash',
        `/v1/renaest/sinistros/${segment(crashId)}`,
      ),
      context,
    );
    return mapCrashReport(response);
  }

  async getCrashByProtocol(
    protocol: string,
    context?: IntegrationContext,
  ): Promise<CrashReport> {
    const response = await this.client.request<Transactional['Sinistro']>(
      readRequest(
        'renaest',
        'get-crash-by-protocol',
        `/v1/renaest/protocolos/${segment(protocol)}`,
      ),
      context,
    );
    return mapCrashReport(response);
  }

  async searchCrashes(
    filters: CrashSearchFilters = {},
    context?: IntegrationContext,
  ): Promise<CrashSearchResult> {
    const response = await this.client.request<{
      quantidade?: number;
      sinistros?: Transactional['Sinistro'][];
      idUltimoRegistro?: string | null;
    }>(
      readRequest('renaest', 'search-crashes', '/v1/renaest/sinistros', {
        placa: filters.plate,
        cpfCondutor: filters.driverCpf,
        dataInicio: filters.startedAt,
        dataFim: filters.endedAt,
        orgaoResponsavel: filters.responsibleAgency,
        quantidadeRegistros: filters.limit,
        idUltimoRegistro: filters.after,
      }),
      context,
    );
    return {
      count: response.quantidade ?? response.sinistros?.length ?? 0,
      crashes: (response.sinistros ?? []).map(mapCrashReport),
      ...(response.idUltimoRegistro
        ? { nextAfter: response.idUltimoRegistro }
        : {}),
    };
  }

  complementCrash(
    crashId: string,
    input: CrashCorrectionInput,
    context?: IntegrationContext,
  ): Promise<CrashCorrection> {
    return this.correct(
      'complementos',
      'complement-crash',
      crashId,
      input,
      context,
    );
  }

  correctCrash(
    crashId: string,
    input: CrashCorrectionInput,
    context?: IntegrationContext,
  ): Promise<CrashCorrection> {
    return this.correct('correcoes', 'correct-crash', crashId, input, context);
  }

  private async correct(
    action: 'complementos' | 'correcoes',
    operation: string,
    crashId: string,
    input: CrashCorrectionInput,
    context?: IntegrationContext,
  ): Promise<CrashCorrection> {
    const response = await this.client.request<
      Transactional['RetificacaoResponse']
    >(
      writeRequest(
        'renaest',
        operation,
        `/v1/renaest/sinistros/${segment(crashId)}/${action}`,
        toCrashCorrection(input),
      ),
      context,
    );
    return mapCrashCorrection(response);
  }
}

class SneHttpPort implements SnePort {
  constructor(private readonly client: SenatranClient) {}

  async getVehicleEnrollment(
    plate: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment> {
    return this.enrollment(
      'vehicle-enrollment',
      `/v1/sne/adesoes/veiculos/${segment(plate)}`,
      context,
    );
  }

  async getCitizenEnrollment(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment> {
    return this.enrollment(
      'citizen-enrollment',
      `/v1/sne/adesoes/cidadaos/${segment(cpf)}`,
      context,
    );
  }

  async enrollCitizen(
    input: { cpf: string; channel?: string },
    context?: IntegrationContext,
  ): Promise<SneEnrollment> {
    const response = await this.client.request<Transactional['AdesaoSne']>(
      writeRequest('sne', 'enroll-citizen', '/v1/sne/adesoes/cidadaos', {
        cpf: input.cpf,
        ...(input.channel ? { canal: input.channel } : {}),
      }),
      context,
    );
    return mapSneEnrollment(response);
  }

  async getAgencyEnrollment(
    agencyCode: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment> {
    return this.enrollment(
      'agency-enrollment',
      `/v1/sne/orgaos/${segment(agencyCode)}/adesao`,
      context,
    );
  }

  notifyInfraction(
    input: SneNotificationInput,
    context?: IntegrationContext,
  ): Promise<SneNotification> {
    return this.notify('autuacao', 'notify-infraction', input, context);
  }

  notifyPenalty(
    input: SneNotificationInput,
    context?: IntegrationContext,
  ): Promise<SneNotification> {
    return this.notify('penalidade', 'notify-penalty', input, context);
  }

  async getNotification(
    protocol: string,
    context?: IntegrationContext,
  ): Promise<SneNotification> {
    const response = await this.client.request<Transactional['NotificacaoSne']>(
      readRequest(
        'sne',
        'get-notification',
        `/v1/sne/notificacoes/${segment(protocol)}`,
      ),
      context,
    );
    return mapSneNotification(response);
  }

  async cancelNotification(
    protocol: string,
    reason?: string,
    context?: IntegrationContext,
  ): Promise<Pick<SneNotification, 'protocol' | 'status'>> {
    const response = await this.client.request<
      Transactional['CancelamentoSneResponse']
    >(
      writeRequest(
        'sne',
        'cancel-notification',
        `/v1/sne/notificacoes/${segment(protocol)}/cancelamento`,
        {
          ...(reason ? { motivo: reason } : {}),
        },
      ),
      context,
    );
    return { protocol: response.protocolo, status: response.situacao };
  }

  private async enrollment(
    operation: string,
    path: string,
    context?: IntegrationContext,
  ): Promise<SneEnrollment> {
    const response = await this.client.request<Transactional['AdesaoSne']>(
      readRequest('sne', operation, path),
      context,
    );
    return mapSneEnrollment(response);
  }

  private async notify(
    type: 'autuacao' | 'penalidade',
    operation: string,
    input: SneNotificationInput,
    context?: IntegrationContext,
  ): Promise<SneNotification> {
    const response = await this.client.request<Transactional['NotificacaoSne']>(
      writeRequest(
        'sne',
        operation,
        `/v1/sne/notificacoes/${type}`,
        toSneNotification(input),
      ),
      context,
    );
    return mapSneNotification(response);
  }
}

class CdtHttpPort implements CdtPort {
  constructor(private readonly client: SenatranClient) {}

  listCitizenNotifications(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>> {
    return this.collection('notifications', 'notificacoes', cpf, context);
  }

  listCitizenInfractions(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>> {
    return this.collection('infractions', 'infracoes', cpf, context);
  }

  listCitizenVehicles(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>> {
    return this.collection('vehicles', 'veiculos', cpf, context);
  }

  async getCitizenLicense(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenLicense> {
    const response = await this.client.request<Transactional['CdtCnh']>(
      readRequest(
        'cdt',
        'citizen-license',
        `/v1/cdt/cidadaos/${segment(cpf)}/cnh`,
      ),
      context,
    );
    return { cpf: response.cpf, license: response.cnh ?? {} };
  }

  async getPaymentQuote(
    aitNumber: string,
    context?: IntegrationContext,
  ): Promise<PaymentQuote> {
    const response = await this.client.request<Transactional['CdtPagamento']>(
      readRequest(
        'cdt',
        'payment-quote',
        `/v1/cdt/infracoes/${segment(aitNumber)}/pagamento`,
      ),
      context,
    );
    return mapPaymentQuote(response);
  }

  async recognizeInfraction(
    aitNumber: string,
    input: { channel?: string; cpf?: string } = {},
    context?: IntegrationContext,
  ): Promise<InfractionRecognition> {
    const response = await this.client.request<
      Transactional['ReconhecimentoResponse']
    >(
      writeRequest(
        'cdt',
        'recognize-infraction',
        `/v1/cdt/infracoes/${segment(aitNumber)}/reconhecimento`,
        {
          ...(input.channel ? { canal: input.channel } : {}),
          ...(input.cpf ? { cpf: input.cpf } : {}),
        },
      ),
      context,
    );
    return mapRecognition(response);
  }

  async submitCitizenPreliminaryDefense(
    cpf: string,
    aitNumber: string,
    input: PreliminaryDefenseInput,
    context?: IntegrationContext,
  ): Promise<AdministrativeCase> {
    const response = await this.client.request<
      Transactional['ProcessoAdministrativo']
    >(
      writeRequest(
        'cdt',
        'submit-citizen-preliminary-defense',
        `/v1/cdt/cidadaos/${segment(cpf)}/infracoes/${segment(aitNumber)}/defesas`,
        toPreliminaryDefense(input),
      ),
      context,
    );
    return mapAdministrativeCase(response);
  }

  async submitCitizenAppeal(
    cpf: string,
    aitNumber: string,
    input: AppealInput,
    context?: IntegrationContext,
  ): Promise<Appeal> {
    const response = await this.client.request<Transactional['Recurso']>(
      writeRequest(
        'cdt',
        'submit-citizen-appeal',
        `/v1/cdt/cidadaos/${segment(cpf)}/infracoes/${segment(aitNumber)}/recursos`,
        toAppeal(input),
      ),
      context,
    );
    return mapAppeal(response);
  }

  private async collection(
    operation: string,
    resource: 'notificacoes' | 'infracoes' | 'veiculos',
    cpf: string,
    context?: IntegrationContext,
  ): Promise<CitizenCollection<Record<string, unknown>>> {
    const response = await this.client.request<Record<string, unknown>>(
      readRequest(
        'cdt',
        `citizen-${operation}`,
        `/v1/cdt/cidadaos/${segment(cpf)}/${resource}`,
      ),
      context,
    );
    const items = response[resource];
    return {
      cpf: typeof response.cpf === 'string' ? response.cpf : undefined,
      items: Array.isArray(items)
        ? (items as Array<Record<string, unknown>>)
        : [],
    };
  }
}

class WsdenatranReadHttpPort implements WsdenatranReadPort {
  constructor(private readonly client: SenatranClient) {}

  read<Path extends ReadPath>(
    path: Path,
    parameters: WsdenatranReadParameters<Path>,
    context?: IntegrationContext,
  ): Promise<WsdenatranReadResponse<Path>> {
    const values = parameters as Record<
      string,
      string | number | boolean | undefined
    >;
    const materialized = path.replace(
      /\{([^}]+)\}/gu,
      (_match, key: string) => {
        const value = values[key];
        if (value === undefined)
          throw new Error(`Missing WSDenatran path parameter ${key}`);
        return segment(String(value));
      },
    );
    const pathKeys = new Set(
      [...path.matchAll(/\{([^}]+)\}/gu)].map((match) => match[1]),
    );
    const query = Object.fromEntries(
      Object.entries(values).filter(([key]) => !pathKeys.has(key)),
    );
    return this.client.request(
      {
        surface: 'wsdenatran-read',
        operation: `read:${path}`,
        method: 'GET',
        path: `/v1${materialized}`,
        query,
      },
      context,
    );
  }

  async findVehicleByPlate(
    plate: string,
    context?: IntegrationContext,
  ): Promise<VehicleRecord | undefined> {
    const response = await this.client.request<Read['VeiculoListResponse']>(
      readRequest(
        'wsdenatran-read',
        'find-vehicle-by-plate',
        `/v1/veiculos/placa/${segment(plate)}`,
      ),
      context,
    );
    return response.veiculo?.[0] ? mapVehicle(response.veiculo[0]) : undefined;
  }

  async findVehicleByRenavam(
    renavam: string,
    context?: IntegrationContext,
  ): Promise<VehicleRecord | undefined> {
    const response = await this.client.request<Read['VeiculoListResponse']>(
      readRequest(
        'wsdenatran-read',
        'find-vehicle-by-renavam',
        `/v1/veiculos/renavam/${segment(renavam)}`,
      ),
      context,
    );
    return response.veiculo?.[0] ? mapVehicle(response.veiculo[0]) : undefined;
  }

  async findDriverByCpf(
    cpf: string,
    context?: IntegrationContext,
  ): Promise<DriverRecord | undefined> {
    const response = await this.client.request<Read['CondutorListResponse']>(
      readRequest(
        'wsdenatran-read',
        'find-driver-by-cpf',
        `/v1/condutores/cpf/${segment(cpf)}`,
      ),
      context,
    );
    return response.condutores?.[0]
      ? mapDriver(response.condutores[0])
      : undefined;
  }
}

function readRequest(
  surface: 'renainf' | 'renaest' | 'renach' | 'sne' | 'cdt' | 'wsdenatran-read',
  operation: string,
  path: string,
  query?: Readonly<Record<string, string | number | boolean | undefined>>,
) {
  return { surface, operation, method: 'GET' as const, path, query };
}

function writeRequest<T>(
  surface: 'renainf' | 'renaest' | 'renach' | 'sne' | 'cdt',
  operation: string,
  path: string,
  body: T,
) {
  return {
    surface,
    operation,
    method: 'POST' as const,
    path,
    body,
    write: true,
  };
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
