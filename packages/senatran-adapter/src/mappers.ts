import type {
  AdministrativeCase,
  Appeal,
  AppealDecisionInput,
  AppealInput,
  Applicant,
  Attachment,
  CrashCorrection,
  CrashCorrectionInput,
  CrashReport,
  CrashReportInput,
  CrashSeverity,
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
import type { ReadComponents, TransactionalComponents } from './wire.js';

type Read = ReadComponents['schemas'];
type Transactional = TransactionalComponents['schemas'];

const processTypeToWire: Record<
  DriverProcessType,
  Transactional['TipoProcesso']
> = {
  FIRST_LICENSE: 'PRIMEIRA_HABILITACAO',
  RENEWAL: 'RENOVACAO',
  CATEGORY_CHANGE: 'MUDANCA_CATEGORIA',
  CATEGORY_ADDITION: 'ADICAO_CATEGORIA',
};

const processTypeFromWire: Record<
  Transactional['TipoProcesso'],
  DriverProcessType
> = {
  PRIMEIRA_HABILITACAO: 'FIRST_LICENSE',
  RENOVACAO: 'RENEWAL',
  MUDANCA_CATEGORIA: 'CATEGORY_CHANGE',
  ADICAO_CATEGORIA: 'CATEGORY_ADDITION',
};

const applicantTypeToWire: Record<
  Applicant['type'],
  Transactional['TipoRequerente']
> = {
  OWNER: 'PROPRIETARIO',
  IDENTIFIED_DRIVER: 'CONDUTOR_IDENTIFICADO',
  LEGAL_REPRESENTATIVE: 'REPRESENTANTE_LEGAL',
};

const severityToWire: Record<
  CrashSeverity,
  Transactional['GravidadeSinistro']
> = {
  NO_VICTIMS: 'SEM_VITIMA',
  WITH_INJURED_VICTIM: 'COM_VITIMA_FERIDA',
  WITH_FATAL_VICTIM: 'COM_VITIMA_FATAL',
};

const severityFromWire = Object.fromEntries(
  Object.entries(severityToWire).map(([domain, wire]) => [wire, domain]),
) as Record<Transactional['GravidadeSinistro'], CrashSeverity>;

export function mapDriver(wire: Read['Condutor']): DriverRecord {
  return compact({
    cpf: wire.cpf,
    name: wire.nome,
    birthDate: wire.dataNascimento,
    licenseNumber: wire.numeroRegistro,
    renachFormNumber: wire.numeroFormularioRenach,
    currentCategory: wire.categoriaAtual,
    authorizedCategory: wire.categoriaAutorizada,
    licenseState: wire.ufHabilitacaoAtual,
    jurisdictionState: wire.ufDominio,
    licenseStatus: wire.situacaoCnh,
    licenseStatusDescription: wire.descricaoSituacaoCnh,
    licenseExpiresAt: wire.dataValidadeCnh,
    medicalRestrictions: wire.restricoesMedicas,
    occurrenceCount: wire.ocorrencias?.length ?? 0,
  });
}

export function mapVehicle(wire: Read['Veiculo']): VehicleRecord {
  return compact({
    plate: wire.placa,
    chassis: wire.chassi,
    renavam: wire.codigoRenavam,
    jurisdictionState: wire.ufJurisdicao,
    makeModelCode: wire.codigoMarcaModelo,
    makeModelDescription: wire.descricaoMarcaModelo,
    ownerDocument: wire.numeroIdentificacaoProprietario,
    ownerName: wire.nomeProprietario,
    stolen: wire.indicadorRouboFurto ?? false,
    judicialRestriction: wire.indicadorRestricaoRenajud ?? false,
  });
}

export function mapTrafficViolation(
  wire: Read['Infracao'],
): TrafficViolationRecord {
  return compact({
    aitNumber: wire.numeroAutoInfracao,
    renainfNumber: wire.codigoRenainf,
    agencyCode: wire.codigoOrgaoAutuador,
    agencyState: wire.ufOrgaoAutuador,
    infractionCode: wire.codigoInfracao,
    infractionDescription: wire.descricaoInfracao,
    occurredAt: wire.dataInfracao,
    plate: wire.placa,
    renavam: wire.codigoRenavam,
    municipalityCode: wire.codigoMunicipioInfracao,
    municipalityName: wire.descricaoMunicipioInfracao,
    amount: wire.valorIntegralInfracao,
    paidAmount: wire.valorPagoInfracao,
    paymentDate: wire.dataPagamentoInfracao,
  });
}

export function toOpenDriverProcess(
  input: OpenDriverProcessInput,
): Transactional['AberturaProcessoRenachRequest'] {
  return compact({
    cpf: input.cpf,
    tipoProcesso: processTypeToWire[input.processType],
    categoriaAtual: input.currentCategory,
    categoriaPretendida: input.requestedCategory,
  });
}

export function mapDriverProcess(
  wire: Transactional['ProcessoRenach'],
): DriverProcess {
  return compact({
    protocol: wire.protocolo,
    renachNumber: wire.numeroRenach,
    status: wire.situacao,
    processType: wire.tipoProcesso
      ? processTypeFromWire[wire.tipoProcesso]
      : undefined,
    currentCategory: wire.categoriaAtual,
    requestedCategory: wire.categoriaPretendida,
    driver: wire.condutor
      ? compact({
          cpf: wire.condutor.cpf,
          name: wire.condutor.nome,
          birthDate: wire.condutor.dataNascimento,
        })
      : undefined,
  });
}

export function toTrafficViolation(
  input: TrafficViolationInput,
): Transactional['AutoInfracaoRequest'] {
  return compact({
    numeroAit: input.aitNumber,
    codigoOrgaoAutuador: input.agencyCode,
    agenteAutuador: {
      cpf: input.issuingAgent.cpf,
      matricula: input.issuingAgent.registration,
    },
    dispositivo: input.device
      ? compact({
          idDispositivo: input.device.id,
          lavradoOffline: input.device.issuedOffline,
        })
      : undefined,
    infracao: {
      codigoInfracao: input.infraction.code,
      codigoDesdobramentoInfracao: input.infraction.unfoldingCode,
      descricaoInfracao: input.infraction.description,
      dataInfracao: input.infraction.occurredAt,
      codigoMunicipio: input.infraction.municipalityCode,
      local: compact({
        descricao: input.infraction.location.description,
        latitude: input.infraction.location.latitude,
        longitude: input.infraction.location.longitude,
      }),
    },
    veiculo: compact({
      placa: input.vehicle.plate,
      codigoRenavam: input.vehicle.renavam,
      uf: input.vehicle.state,
      descricaoMarcaModelo: input.vehicle.makeModelDescription,
    }),
    condutor: input.driver
      ? compact({
          abordado: input.driver.approached,
          cpf: input.driver.cpf,
          numeroRegistro: input.driver.licenseNumber,
          uf: input.driver.state,
          recusouAssinar: input.driver.refusedToSign,
        })
      : undefined,
    evidencias: input.evidence?.map((item) =>
      compact({
        tipo: item.type,
        hash: item.hash,
        tipoConteudo: item.contentType,
        urlArmazenamento: item.storageUrl,
      }),
    ),
  });
}

export function mapTransactionalTrafficViolation(
  wire: Transactional['AutoInfracao'],
): TrafficViolation {
  return compact({
    protocol: wire.protocolo,
    aitNumber: wire.numeroAit,
    status: wire.situacao,
    agencyCode: wire.codigoOrgaoAutuador,
    infractionCode: wire.codigoInfracao,
    occurredAt: wire.dataInfracao,
    plate: wire.placa,
  });
}

export function mapAdministrativeCase(
  wire: Transactional['ProcessoAdministrativo'],
): AdministrativeCase {
  return compact({
    protocol: wire.protocolo,
    caseId: wire.idProcesso,
    aitNumber: wire.numeroAit,
    status: wire.situacao,
    agencyCode: wire.codigoOrgaoAutuador,
    amount: wire.valor,
  });
}

export function toPreliminaryDefense(
  input: PreliminaryDefenseInput,
): Transactional['DefesaPreviaRequest'] {
  return compact({
    requerente: applicant(input.applicant),
    fundamentacao: input.arguments,
    anexos: attachments(input.attachments),
    dataProtocolo: input.submittedAt,
    canal: input.channel,
  });
}

export function toAppeal(input: AppealInput): Transactional['RecursoRequest'] {
  return compact({
    instancia: input.instance === 'JARI' ? 'JARI' : 'SEGUNDA_INSTANCIA',
    idRecursoAnterior: input.previousAppealId,
    requerente: applicant(input.applicant),
    fundamentacao: input.arguments,
    anexos: attachments(input.attachments),
    dataProtocolo: input.submittedAt,
    canal: input.channel,
  });
}

export function mapAppeal(wire: Transactional['Recurso']): Appeal {
  return compact({
    protocol: wire.protocolo,
    appealId: wire.idRecurso,
    caseId: wire.idProcesso,
    instance:
      wire.instancia === 'SEGUNDA_INSTANCIA'
        ? 'SECOND_INSTANCE'
        : wire.instancia,
    status: wire.situacao,
  });
}

export function toAppealDecision(
  input: AppealDecisionInput,
): Transactional['JulgamentoRecursoRequest'] {
  return compact({
    resultado: input.outcome === 'GRANTED' ? 'PROVIDO' : 'NEGADO',
    dataJulgamento: input.decidedAt,
    fundamentacao: input.reasoning,
    assinaturaDigital: input.digitalSignature
      ? compact({
          certificado: input.digitalSignature.certificate,
          hash: input.digitalSignature.hash,
          dataAssinatura: input.digitalSignature.signedAt,
        })
      : undefined,
  });
}

export function toCrashReport(
  input: CrashReportInput,
): Transactional['SinistroRequest'] {
  return compact({
    dataHoraSinistro: input.occurredAt,
    uf: input.state,
    codigoMunicipio: input.municipalityCode,
    gravidade: severityToWire[input.severity],
    local: input.location,
    orgaoResponsavel: input.responsibleAgency,
    codigoTipoSinistro: input.crashTypeCode,
    condicoesVia: input.roadConditions,
    condicoesMeteorologicas: input.weatherConditions,
    versaoLeiaute: input.layoutVersion,
    dataTransmissao: input.transmittedAt,
    veiculos: input.vehicles as Transactional['SinistroRequest']['veiculos'],
    pessoas: input.people as Transactional['SinistroRequest']['pessoas'],
    vitimas: input.victims as Transactional['SinistroRequest']['vitimas'],
    referencias: input.references
      ? compact({
          renavam: input.references.renavam,
          cpfCondutor: input.references.driverCpf,
          numeroAit: input.references.aitNumber,
        })
      : undefined,
  });
}

export function mapCrashReport(wire: Transactional['Sinistro']): CrashReport {
  return compact({
    protocol: wire.protocolo,
    crashId: wire.idSinistro,
    status: wire.situacao,
    occurredAt: wire.dataHoraSinistro,
    state: wire.uf,
    municipalityCode: wire.codigoMunicipio,
    severity: wire.gravidade ? severityFromWire[wire.gravidade] : undefined,
    location: wire.local,
    responsibleAgency: wire.orgaoResponsavel,
    references: wire.referencias
      ? compact({
          renavam: wire.referencias.renavam,
          driverCpf: wire.referencias.cpfCondutor,
          aitNumber: wire.referencias.numeroAit,
        })
      : undefined,
  });
}

export function toCrashCorrection(
  input: CrashCorrectionInput,
): Transactional['RetificacaoSinistroRequest'] {
  return compact({
    motivo: input.reason,
    versaoLeiaute: input.layoutVersion,
    gravidade: input.severity ? severityToWire[input.severity] : undefined,
    local: input.location,
    vitimas:
      input.victims as Transactional['RetificacaoSinistroRequest']['vitimas'],
    veiculos:
      input.vehicles as Transactional['RetificacaoSinistroRequest']['veiculos'],
    pessoas:
      input.people as Transactional['RetificacaoSinistroRequest']['pessoas'],
    referencias: input.references
      ? compact({
          renavam: input.references.renavam,
          cpfCondutor: input.references.driverCpf,
          numeroAit: input.references.aitNumber,
        })
      : undefined,
  });
}

export function mapCrashCorrection(
  wire: Transactional['RetificacaoResponse'],
): CrashCorrection {
  return compact({
    correctionId: wire.idRetificacao,
    crashId: wire.idSinistro,
    type:
      wire.tipo === 'COMPLEMENTO'
        ? 'COMPLEMENT'
        : wire.tipo === 'CORRECAO'
          ? 'CORRECTION'
          : undefined,
    protocol: wire.protocolo,
    status: wire.situacao,
  });
}

export function mapSneEnrollment(
  wire: Transactional['AdesaoSne'],
): SneEnrollment {
  return compact({
    plate: wire.placa,
    cpf: wire.cpf,
    agencyCode: wire.codigoOrgaoAutuador,
    enrolled: wire.aderido ?? false,
    channel: wire.canal,
  });
}

export function toSneNotification(
  input: SneNotificationInput,
): Transactional['NotificacaoSneRequest'] {
  const channel =
    input.channel === 'UNAVAILABLE' ? 'INDISPONIVEL' : input.channel;
  return compact({
    numeroAit: input.aitNumber,
    codigoOrgaoAutuador: input.agencyCode,
    idProcesso: input.caseId,
    placa: input.plate,
    cpfDestinatario: input.recipientCpf,
    canal: channel,
    dataInfracao: input.infractionDate,
    dataNotificacao: input.notificationDate,
    mensagem: input.message,
  });
}

export function mapSneNotification(
  wire: Transactional['NotificacaoSne'],
): SneNotification {
  return compact({
    protocol: wire.protocolo,
    aitNumber: wire.numeroAit,
    caseId: wire.idProcesso,
    type:
      wire.tipoNotificacao === 'AUTUACAO'
        ? 'INFRACTION_NOTICE'
        : wire.tipoNotificacao === 'PENALIDADE'
          ? 'PENALTY_NOTICE'
          : undefined,
    agencyCode: wire.codigoOrgaoAutuador,
    plate: wire.placa,
    recipientCpf: wire.cpfDestinatario,
    status: wire.situacao,
    channel: wire.canal,
    notificationDate: wire.dataNotificacao,
  });
}

export function mapPaymentQuote(
  wire: Transactional['CdtPagamento'],
): PaymentQuote {
  return compact({
    aitNumber: wire.numeroAit,
    cpf: wire.cpf,
    status: wire.situacao,
    originalAmount: wire.valorOriginal,
    discountPercent: wire.percentualDesconto,
    discountedAmount: wire.valorComDesconto,
    paymentSlipAvailable: wire.boletoDisponivel,
    digitLine: wire.linhaDigitavel,
    dueDate: wire.dataVencimento,
  });
}

export function mapRecognition(
  wire: Transactional['ReconhecimentoResponse'],
): InfractionRecognition {
  return compact({
    aitNumber: wire.numeroAit,
    status: wire.situacao,
    discountPercent: wire.percentualDesconto,
    originalAmount: wire.valorOriginal,
    discountedAmount: wire.valorComDesconto,
    paymentSlipAvailable: wire.boletoDisponivel,
    digitLine: wire.linhaDigitavel,
  });
}

function applicant(input: Applicant): {
  tipoRequerente: Transactional['TipoRequerente'];
  numeroDocumento: string;
  nome?: string;
} {
  return compact({
    tipoRequerente: applicantTypeToWire[input.type],
    numeroDocumento: input.document,
    nome: input.name,
  });
}

function attachments(
  input: Attachment[] | undefined,
): Transactional['Anexo'][] | undefined {
  return input?.map((item) =>
    compact({
      nome: item.name,
      tipoConteudo: item.contentType,
      hash: item.hash,
      urlArmazenamento: item.storageUrl,
    }),
  );
}

function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}
