// Generated from the in-repo SENATRAN mock contract. Do not edit.
export interface paths {
  '/renach/processos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta processos RENACH ativos por CPF
     * @description Lista os processos RENACH ativos (situação não terminal) do candidato, opcionalmente filtrados por `tipoProcesso`. Permite recuperar o `numeroRenach` do processo que motivou `RENACH.PROCESS.ALREADY_OPEN`. Extensão WSDenatran (sem equivalente no corpus canônico); ver canonical-mapping.md.
     */
    get: operations['consultarProcessosRenach'];
    put?: never;
    /**
     * Abrir processo RENACH
     * @description Abre um novo processo RENACH para o candidato e retorna o `numeroRenach` atribuído. Extensão WSDenatran (sem equivalente no corpus canônico); ver canonical-mapping.md.
     */
    post: operations['abrirProcessoRenach'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar processo RENACH */
    get: operations['getProcessoRenach'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/elegibilidadeExame': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Consultar elegibilidade para exame */
    post: operations['verificarElegibilidadeExame'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/clinicasCredenciadas': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Listar clínicas credenciadas */
    get: operations['listarClinicasCredenciadas'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/profissionaisCredenciados': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Listar profissionais credenciados */
    get: operations['listarProfissionaisCredenciados'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/agendamentos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Criar agendamento de exame */
    post: operations['criarAgendamentoExame'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/agendamentos/{idAgendamento}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Cancelar ou remarcar agendamento */
    patch: operations['alterarAgendamento'];
    trace?: never;
  };
  '/renach/agendamentos/{idAgendamento}/checkin': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Iniciar atendimento */
    post: operations['iniciarAtendimento'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/examesMedicos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar exame médico */
    post: operations['registrarExameMedico'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/avaliacoesPsicologicas': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar avaliação psicológica */
    post: operations['registrarAvaliacaoPsicologica'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/exames': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar resultados de exames */
    get: operations['consultarResultadosExames'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/exames/{idExame}/retificacoes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retificar exame */
    post: operations['retificarExame'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/encaminhamentosJunta': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Encaminhar para junta médica */
    post: operations['encaminharJuntaMedica'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renach/processos/{numeroRenach}/pareceresJunta': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar parecer de junta */
    post: operations['registrarParecerJunta'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/talonario/dispositivos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar dispositivo de talonário */
    post: operations['registrarDispositivoTalonario'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/talonario/sincronizacao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Sincronizar domínio operacional */
    get: operations['sincronizarDominioOperacional'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/talonario/faixasNumeracaoAit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reservar numeração de AIT */
    post: operations['reservarFaixaNumeracaoAit'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/autosInfracao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Criar AIT */
    post: operations['criarAutoInfracao'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/autosInfracao/lotes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Transmitir lote de AITs offline */
    post: operations['transmitirLoteAutosInfracao'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/autosInfracao/{numeroAit}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar AIT */
    get: operations['consultarAutoInfracao'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/autosInfracao/{numeroAit}/solicitacoesCancelamento': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Solicitar cancelamento do AIT */
    post: operations['solicitarCancelamentoAutoInfracao'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Abrir autuação */
    post: operations['abrirAutuacao'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/notificacoes/autuacao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Emitir notificação de autuação */
    post: operations['emitirNotificacaoAutuacao'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/indicacoesCondutor': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar indicação de condutor */
    post: operations['registrarIndicacaoCondutor'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/defesasPrevias': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Protocolar defesa prévia */
    post: operations['protocolarDefesaPrevia'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/penalidades': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Imposição de penalidade */
    post: operations['imporPenalidade'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/notificacoes/penalidade': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Emitir notificação de penalidade */
    post: operations['emitirNotificacaoPenalidade'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/recursos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Protocolar recurso JARI ou segunda instância */
    post: operations['protocolarRecurso'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/recursos/{idRecurso}/julgamento': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar julgamento de recurso */
    post: operations['registrarJulgamentoRecurso'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/debito': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar débito */
    get: operations['consultarDebito'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renainf/processosAdministrativos/{idProcesso}/pagamentos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar pagamento */
    post: operations['registrarPagamento'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/sinistros': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submeter registro de sinistro
     * @description Registra um sinistro/acidente na base nacional RENAEST e retorna o `idSinistro` e o `protocolo`. Idempotente sob `Idempotency-Key`; um reenvio da mesma tupla (uf, codigoMunicipio, dataHoraSinistro, orgaoResponsavel) sem chave resulta em `RENAEST.CRASH.DUPLICATED`.
     */
    post: operations['submeterSinistroRenaest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/sinistros/lotes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submeter lote de sinistros
     * @description Registra um lote de sinistros em uma única transação e retorna o `protocoloLote` e os `itens` criados. Idempotente sob `Idempotency-Key`.
     */
    post: operations['submeterLoteSinistrosRenaest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/sinistros/{idSinistro}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar sinistro por idSinistro */
    get: operations['consultarSinistroRenaest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/protocolos/{protocolo}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar sinistro por protocolo */
    get: operations['consultarProtocoloRenaest'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/sinistros/{idSinistro}/complementos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submeter complemento a um sinistro
     * @description Envia dados complementares vinculados a um sinistro existente. Não permitido em situação terminal (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`).
     */
    post: operations['complementarSinistroRenaest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/renaest/sinistros/{idSinistro}/correcoes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submeter correção a um sinistro
     * @description Envia uma correção vinculada ao sinistro original. Não permitida em situação terminal (`RENAEST.CRASH.CORRECTION_NOT_ALLOWED`).
     */
    post: operations['corrigirSinistroRenaest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/adesoes/veiculos/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar adesão do veículo ao SNE */
    get: operations['consultarAdesaoVeiculoSne'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/adesoes/cidadaos/{cpf}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar adesão do cidadão ao SNE */
    get: operations['consultarAdesaoCidadaoSne'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/orgaos/{codigoOrgaoAutuador}/adesao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar adesão do órgão autuador ao SNE */
    get: operations['consultarAdesaoOrgaoSne'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/notificacoes/autuacao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Notificar autuação pelo SNE
     * @description Emite uma notificação eletrônica de autuação. Exige órgão e destinatário aderentes; a notificação fora do prazo legal é recusada.
     */
    post: operations['notificarAutuacaoSne'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/notificacoes/penalidade': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Notificar penalidade pelo SNE */
    post: operations['notificarPenalidadeSne'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/notificacoes/{protocolo}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar notificação SNE por protocolo */
    get: operations['consultarNotificacaoSne'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/sne/notificacoes/{protocolo}/cancelamento': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancelar notificação SNE */
    post: operations['cancelarNotificacaoSne'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/cidadaos/{cpf}/notificacoes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Notificações visíveis ao cidadão */
    get: operations['listarNotificacoesCidadaoCdt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/cidadaos/{cpf}/infracoes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Infrações visíveis ao cidadão */
    get: operations['listarInfracoesCidadaoCdt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/cidadaos/{cpf}/veiculos': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Veículos visíveis ao cidadão */
    get: operations['listarVeiculosCidadaoCdt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/cidadaos/{cpf}/cnh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Resumo de CNH do cidadão */
    get: operations['consultarCnhCidadaoCdt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/infracoes/{numeroAit}/pagamento': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Projeção de pagamento/desconto de uma infração */
    get: operations['consultarPagamentoInfracaoCdt'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/cdt/infracoes/{numeroAit}/reconhecimento': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reconhecer infração (libera desconto por reconhecimento) */
    post: operations['reconhecerInfracaoCdt'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/renavam/consultasVeiculo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bridge — consulta de veículo (RENAVAM) pelo DETRAN estadual */
    post: operations['bridgeConsultarVeiculoDetran'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/renach/consultasCondutor': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bridge — consulta de condutor (RENACH) pelo DETRAN estadual */
    post: operations['bridgeConsultarCondutorDetran'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/renainf/autosInfracao': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bridge — envio de AIT (RENAINF) pelo DETRAN estadual */
    post: operations['bridgeEnviarAitDetran'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/renainf/autosInfracao/{numeroAit}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Bridge — consulta de AIT nacional pelo DETRAN estadual */
    get: operations['bridgeConsultarAitDetran'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/renaest/sinistros': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bridge — envio de sinistro (RENAEST) pelo DETRAN estadual */
    post: operations['bridgeEnviarSinistroDetran'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/detrans/{uf}/sne/notificacoes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Bridge — envio de notificação (SNE) pelo DETRAN estadual */
    post: operations['bridgeEnviarNotificacaoDetran'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ErrorResponse: {
      returnCode?: number;
      message?: string;
    };
    /** @enum {string} */
    TipoProcesso:
      | 'PRIMEIRA_HABILITACAO'
      | 'RENOVACAO'
      | 'MUDANCA_CATEGORIA'
      | 'ADICAO_CATEGORIA';
    /** @enum {string} */
    ResultadoExame:
      | 'APTO'
      | 'APTO_COM_RESTRICOES'
      | 'INAPTO_TEMPORARIO'
      | 'INAPTO'
      | 'ENCAMINHADO_JUNTA'
      | 'PENDENTE';
    /** @enum {string} */
    TipoRequerente:
      'PROPRIETARIO' | 'CONDUTOR_IDENTIFICADO' | 'REPRESENTANTE_LEGAL';
    /** @enum {string} */
    Instancia: 'JARI' | 'SEGUNDA_INSTANCIA';
    /**
     * @description Estado do processo RENACH na máquina de estados.
     * @enum {string}
     */
    SituacaoRenach:
      | 'ABERTO'
      | 'AGUARDANDO_MEDICO'
      | 'AGENDADO'
      | 'EM_EXAME'
      | 'EXAME_REGISTRADO'
      | 'AGUARDANDO_PSICOLOGICO'
      | 'EM_ANALISE'
      | 'APROVADO'
      | 'REJEITADO';
    /**
     * @description Estado do processo administrativo RENAINF na máquina de estados.
     * @enum {string}
     */
    SituacaoRenainf:
      | 'RASCUNHO'
      | 'EMITIDO'
      | 'ASSINADO'
      | 'TRANSMITIDO'
      | 'RECEBIDO'
      | 'VALIDADO'
      | 'REJEITADO'
      | 'AUTUACAO_ABERTA'
      | 'NOTIFICADO_AUTUACAO'
      | 'AGUARDANDO_INDICACAO_CONDUTOR'
      | 'CONDUTOR_INDICADO'
      | 'AGUARDANDO_DEFESA_PREVIA'
      | 'DEFESA_APRESENTADA'
      | 'DEFESA_ACEITA'
      | 'DEFESA_REJEITADA'
      | 'PENALIDADE_IMPOSTA'
      | 'NOTIFICADO_PENALIDADE'
      | 'RECURSO_JARI_APRESENTADO'
      | 'JARI_PROVIDO'
      | 'JARI_NEGADO'
      | 'SEGUNDA_INSTANCIA_APRESENTADA'
      | 'DECISAO_FINAL'
      | 'ARQUIVADO';
    /** @description Assinatura digital do ato. */
    AssinaturaDigital: {
      certificado?: string;
      hash?: string;
      /** Format: date-time */
      dataAssinatura?: string;
    };
    Anexo: {
      nome?: string;
      tipoConteudo?: string;
      hash?: string;
      urlArmazenamento?: string;
    };
    Restricao: {
      codigo?: string;
      descricao?: string;
    };
    /** @description Resposta de aceite assíncrono (202). Além de protocolo/situacao, carrega o identificador do recurso afetado conforme a operação. */
    AceiteAssincrono: {
      protocolo: string;
      /** @description Estado do recurso após o aceite (RENACH ou RENAINF). */
      situacao: string;
      numeroRenach?: string;
      idExame?: string;
      idJunta?: string;
      numeroAit?: string;
      quantidade?: number;
    };
    /**
     * @description Dados para abrir um novo processo RENACH.
     * @example {
     *       "cpf": "52998224725",
     *       "tipoProcesso": "RENOVACAO",
     *       "categoriaAtual": "B",
     *       "categoriaPretendida": "B"
     *     }
     */
    AberturaProcessoRenachRequest: {
      cpf: string;
      tipoProcesso: components['schemas']['TipoProcesso'];
      categoriaAtual?: string;
      categoriaPretendida?: string;
    };
    /** @description Dados para verificação de elegibilidade ao exame. */
    ElegibilidadeExameRequest: {
      tipoProcesso: components['schemas']['TipoProcesso'];
      categoriaAtual?: string;
      categoriaPretendida?: string;
    };
    AgendamentoRequest: {
      idAgendamento?: string;
      /** Format: date-time */
      dataHora: string;
      codigoClinica: string;
      cpfCondutor: string;
    };
    /** @description Cancelamento ou remarcação de agendamento. */
    AgendamentoPatchRequest: {
      /** Format: date-time */
      dataHora?: string;
      codigoClinica?: string;
      cancelar?: boolean;
      motivo?: string;
    };
    CheckinRequest: {
      cpfCondutor: string;
      /** Format: date-time */
      dataHora?: string;
      biometriaValidada?: boolean;
    };
    /** @description Registro de exame médico (portado de MedicalExamRequest). */
    ExameMedicoRequest: {
      idAgendamento: string;
      clinica: {
        codigoClinica: string;
        cnpj: string;
      };
      examinador: {
        cpf: string;
        /** @enum {string} */
        conselho: 'CRM';
        numeroConselho: string;
        uf: string;
      };
      condutor: {
        cpf: string;
        nome: string;
        /** Format: date */
        dataNascimento: string;
      };
      processo: {
        numeroRenach: string;
        tipoProcesso: components['schemas']['TipoProcesso'];
        categoriaAtual?: string;
        categoriaPretendida?: string;
      };
      exame: {
        /** Format: date-time */
        dataRealizacao: string;
        resultado: components['schemas']['ResultadoExame'];
        /** Format: date */
        dataValidade?: string;
        restricoes?: components['schemas']['Restricao'][];
        observacoes?: string;
      };
      anexos?: components['schemas']['Anexo'][];
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /** @description Registro de avaliação psicológica (portado de PsychologicalEvaluationRequest). */
    AvaliacaoPsicologicaRequest: {
      idAgendamento: string;
      clinica: {
        codigoClinica?: string;
        cnpj?: string;
      };
      examinador: {
        cpf?: string;
        /** @enum {string} */
        conselho?: 'CRP';
        numeroConselho?: string;
        uf?: string;
      };
      avaliacao: {
        /** Format: date-time */
        dataRealizacao: string;
        resultado: components['schemas']['ResultadoExame'];
        /** Format: date */
        dataValidade?: string;
        bateriaTestes?: string[];
        observacoes?: string;
      };
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /** @description Solicitação de retificação de exame. */
    RetificacaoExameRequest: {
      motivo: string;
      resultado?: components['schemas']['ResultadoExame'];
      observacoes?: string;
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /** @description Encaminhamento do processo à junta médica. */
    EncaminhamentoJuntaRequest: {
      motivo: string;
      idExame?: string;
      observacoes?: string;
    };
    /** @description Parecer da junta médica. */
    ParecerJuntaRequest: {
      resultado: components['schemas']['ResultadoExame'];
      /** Format: date-time */
      dataRealizacao?: string;
      /** Format: date */
      dataValidade?: string;
      restricoes?: components['schemas']['Restricao'][];
      observacoes?: string;
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /**
     * @example {
     *       "protocolo": "RENACH-2026-000123",
     *       "numeroRenach": "RS123456789",
     *       "situacao": "AGUARDANDO_MEDICO",
     *       "tipoProcesso": "RENOVACAO",
     *       "categoriaAtual": "B",
     *       "categoriaPretendida": "B",
     *       "condutor": {
     *         "cpf": "52998224725",
     *         "nome": "MARIA SILVA SANTOS",
     *         "dataNascimento": "1985-03-14"
     *       }
     *     }
     */
    ProcessoRenach: {
      protocolo?: string;
      numeroRenach?: string;
      situacao?: components['schemas']['SituacaoRenach'];
      tipoProcesso?: components['schemas']['TipoProcesso'];
      categoriaAtual?: string;
      categoriaPretendida?: string;
      condutor?: {
        cpf?: string;
        nome?: string;
        /** Format: date */
        dataNascimento?: string;
      };
    };
    /**
     * @example {
     *       "processos": [
     *         {
     *           "protocolo": "RENACH-2026-000123",
     *           "numeroRenach": "RS123456789",
     *           "situacao": "AGUARDANDO_MEDICO",
     *           "tipoProcesso": "RENOVACAO",
     *           "categoriaAtual": "B",
     *           "categoriaPretendida": "B",
     *           "condutor": {
     *             "cpf": "52998224725",
     *             "nome": "MARIA SILVA SANTOS",
     *             "dataNascimento": "1985-03-14"
     *           }
     *         }
     *       ]
     *     }
     */
    ProcessoRenachListResponse: {
      processos?: components['schemas']['ProcessoRenach'][];
    };
    ElegibilidadeExameResponse: {
      numeroRenach?: string;
      tipoProcesso?: components['schemas']['TipoProcesso'];
      elegivelExameMedico?: boolean;
      exigeAvaliacaoPsicologica?: boolean;
      motivos?: string[];
    };
    Agendamento: {
      protocolo?: string;
      idAgendamento?: string;
      numeroRenach?: string;
      situacao?: string;
      /** Format: date-time */
      dataHora?: string;
      codigoClinica?: string;
      cpfCondutor?: string;
    };
    /**
     * @description Exame RENACH. The list read-back (GET .../exames) echoes the recorded submission alongside the resource fields.
     * @example {
     *       "protocolo": "RENACH-EXAME-2026-000045",
     *       "idExame": "6f1c2a80-0000-4000-8000-000000000045",
     *       "numeroRenach": "RS123456789",
     *       "situacao": "EXAME_REGISTRADO",
     *       "resultado": "APTO",
     *       "dataRealizacao": "2026-07-10T09:30:00.000Z",
     *       "dataValidade": "2031-07-10",
     *       "restricoes": []
     *     }
     */
    Exame: {
      protocolo?: string;
      idExame?: string;
      numeroRenach?: string;
      situacao?: components['schemas']['SituacaoRenach'];
      resultado?: components['schemas']['ResultadoExame'];
      tipoExame?: string;
      /** Format: date-time */
      dataRealizacao?: string;
      /** Format: date */
      dataValidade?: string;
      restricoes?: components['schemas']['Restricao'][];
      idAgendamento?: string;
      idJunta?: string;
      clinica?: Record<string, never>;
      examinador?: Record<string, never>;
      condutor?: Record<string, never>;
      processo?: Record<string, never>;
      exame?: Record<string, never>;
    };
    ExameList: {
      quantidade?: number;
      exames?: components['schemas']['Exame'][];
    };
    /**
     * @example {
     *       "codigoClinica": "RS-CLINIC-0001",
     *       "cnpj": "46931757000108",
     *       "nome": "CLINICA RS-CLINIC-0001",
     *       "uf": "PR",
     *       "ativa": true
     *     }
     */
    ClinicaCredenciada: {
      codigoClinica?: string;
      cnpj?: string;
      nome?: string;
      uf?: string;
      credenciada?: boolean;
      ativa?: boolean;
    };
    ClinicaCredenciadaList: {
      clinicas?: components['schemas']['ClinicaCredenciada'][];
    };
    /**
     * @example {
     *       "cpf": "89177194659",
     *       "nome": "CARLOS PEREIRA LIMA",
     *       "conselho": "CRM",
     *       "numeroConselho": "52341",
     *       "uf": "PR",
     *       "ativo": true
     *     }
     */
    ProfissionalCredenciado: {
      cpf?: string;
      nome?: string;
      /** @enum {string} */
      conselho?: 'CRM' | 'CRP';
      numeroConselho?: string;
      uf?: string;
      codigoClinica?: string;
      credenciado?: boolean;
      ativo?: boolean;
    };
    ProfissionalCredenciadoList: {
      profissionais?: components['schemas']['ProfissionalCredenciado'][];
    };
    DispositivoTalonarioRequest: {
      idDispositivo: string;
      codigoOrgaoAutuador: string;
      descricao?: string;
      lavradoOffline?: boolean;
    };
    FaixaNumeracaoAitRequest: {
      codigoOrgaoAutuador: string;
      idDispositivo?: string;
      numeroInicial: string;
      numeroFinal: string;
    };
    /** @description Criação de auto de infração (portado de InfractionNoticeRequest). */
    AutoInfracaoRequest: {
      numeroAit: string;
      codigoOrgaoAutuador: string;
      agenteAutuador: {
        cpf: string;
        matricula: string;
      };
      dispositivo?: {
        idDispositivo?: string;
        lavradoOffline?: boolean;
      };
      infracao: {
        codigoInfracao: string;
        codigoDesdobramentoInfracao?: string;
        descricaoInfracao?: string;
        /** Format: date-time */
        dataInfracao: string;
        codigoMunicipio: string;
        local: {
          descricao?: string;
          latitude?: number;
          longitude?: number;
        };
      };
      veiculo: {
        placa: string;
        codigoRenavam?: string;
        uf?: string;
        descricaoMarcaModelo?: string;
      };
      condutor?: {
        abordado?: boolean;
        cpf?: string;
        numeroRegistro?: string;
        uf?: string;
        recusouAssinar?: boolean;
      };
      evidencias?: {
        tipo?: string;
        hash?: string;
        tipoConteudo?: string;
        urlArmazenamento?: string;
      }[];
      assinaturas?: {
        assinaturaAgente?: string;
        assinaturaCondutor?: string;
      };
    };
    /** @description Transmissão de lote de AITs lavrados offline. */
    LoteAutosInfracaoRequest: {
      idLote?: string;
      autos: components['schemas']['AutoInfracaoRequest'][];
    };
    SolicitacaoCancelamentoRequest: {
      motivo: string;
      codigoOrgaoAutuador?: string;
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /** @description Abertura de autuação (processo administrativo) a partir de um AIT. */
    ProcessoAdministrativoRequest: {
      numeroAit: string;
      codigoOrgaoAutuador?: string;
    };
    NotificacaoRequest: {
      /** Format: date-time */
      dataNotificacao: string;
      canal?: string;
      enderecoDestinatario?: string;
    };
    /** @description Indicação/identificação de condutor infrator. */
    IndicacaoCondutorRequest: {
      requerente: {
        tipoRequerente: components['schemas']['TipoRequerente'];
        numeroDocumento: string;
        nome?: string;
      };
      condutorIndicado: {
        cpf: string;
        nome?: string;
        numeroRegistro?: string;
        uf?: string;
      };
      /** Format: date-time */
      dataProtocolo: string;
      canal?: string;
      anexos?: components['schemas']['Anexo'][];
    };
    /** @description Protocolo de defesa prévia (portado de PreliminaryDefenseRequest). */
    DefesaPreviaRequest: {
      requerente: {
        tipoRequerente: components['schemas']['TipoRequerente'];
        numeroDocumento: string;
        nome?: string;
      };
      fundamentacao: string;
      anexos?: components['schemas']['Anexo'][];
      /** Format: date-time */
      dataProtocolo: string;
      canal?: string;
    };
    /** @description Imposição de penalidade. */
    PenalidadeRequest: {
      valorMulta: number;
      pontos?: number;
      /** Format: date-time */
      dataImposicao?: string;
      fundamentacao?: string;
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    /** @description Protocolo de recurso JARI ou de segunda instância (portado de AppealRequest). */
    RecursoRequest: {
      instancia: components['schemas']['Instancia'];
      idRecursoAnterior?: string;
      requerente: {
        tipoRequerente?: components['schemas']['TipoRequerente'];
        numeroDocumento?: string;
        nome?: string;
      };
      fundamentacao: string;
      anexos?: components['schemas']['Anexo'][];
      /** Format: date-time */
      dataProtocolo?: string;
      canal?: string;
    };
    /** @description Registro do julgamento de um recurso. */
    JulgamentoRecursoRequest: {
      /** @enum {string} */
      resultado: 'PROVIDO' | 'NEGADO';
      /** Format: date-time */
      dataJulgamento?: string;
      fundamentacao?: string;
      assinaturaDigital?: components['schemas']['AssinaturaDigital'];
    };
    PagamentoRequest: {
      valorPago: number;
      /** Format: date-time */
      dataPagamento: string;
      formaPagamento: string;
      numeroComprovante: string;
    };
    /**
     * @description Auto de infração. The read-back (GET .../{numeroAit}) echoes the recorded submission (veiculo/infracao/evidencias/agenteAutuador) alongside the resource fields.
     * @example {
     *       "protocolo": "RENAINF-AIT-2026-000777",
     *       "numeroAit": "A0001001",
     *       "situacao": "AUTUACAO_ABERTA",
     *       "codigoOrgaoAutuador": "204020",
     *       "codigoInfracao": "74550",
     *       "dataInfracao": "2024-03-12T14:20:00.000Z",
     *       "placa": "ABC1D23"
     *     }
     */
    AutoInfracao: {
      protocolo?: string;
      numeroAit?: string;
      situacao?: components['schemas']['SituacaoRenainf'];
      codigoOrgaoAutuador?: string;
      codigoInfracao?: string;
      /** Format: date-time */
      dataInfracao?: string;
      placa?: string;
      veiculo?: Record<string, never>;
      infracao?: Record<string, never>;
      agenteAutuador?: Record<string, never>;
      evidencias?: Record<string, never>[];
    };
    ProcessoAdministrativo: {
      protocolo?: string;
      idProcesso?: string;
      numeroAit?: string;
      situacao?: components['schemas']['SituacaoRenainf'];
      codigoOrgaoAutuador?: string;
      valor?: number;
    };
    Notificacao: {
      protocolo?: string;
      idNotificacao?: string;
      idProcesso?: string;
      situacao?: components['schemas']['SituacaoRenainf'];
      tipoNotificacao?: string;
      /** Format: date-time */
      dataNotificacao?: string;
      canal?: string;
    };
    Recurso: {
      protocolo?: string;
      idRecurso?: string;
      idProcesso?: string;
      situacao?: components['schemas']['SituacaoRenainf'];
      instancia?: components['schemas']['Instancia'];
      /** @enum {string} */
      resultado?: 'PROVIDO' | 'NEGADO' | 'PENDENTE';
    };
    Debito: {
      idProcesso?: string;
      situacaoPagamento?: string;
      valor?: number;
      valorMulta?: number;
      valorAtualizado?: number;
      /** Format: date */
      dataVencimento?: string;
      quitado?: boolean;
    };
    Pagamento: {
      protocolo?: string;
      idPagamento?: string;
      idProcesso?: string;
      situacao?: string;
      valorPago?: number;
      /** Format: date-time */
      dataPagamento?: string;
      formaPagamento?: string;
      numeroComprovante?: string;
    };
    DispositivoTalonario: {
      protocolo?: string;
      idDispositivo?: string;
      codigoOrgaoAutuador?: string;
      situacao?: string;
      ativo?: boolean;
    };
    FaixaNumeracaoAit: {
      protocolo?: string;
      idFaixa?: string;
      codigoOrgaoAutuador?: string;
      numeroInicial?: string;
      numeroFinal?: string;
      situacao?: string;
    };
    SincronizacaoTalonario: {
      /** Format: date-time */
      dataSincronizacao?: string;
      infracoes?: {
        codigoInfracao?: string;
        descricaoInfracao?: string;
      }[];
      orgaosAutuadores?: Record<string, never>[];
      municipios?: Record<string, never>[];
      /** Format: date-time */
      sincronizadoEm?: string;
    };
    /**
     * @description Gravidade do sinistro; dirige a regra de dados de vítima.
     * @enum {string}
     */
    GravidadeSinistro: 'SEM_VITIMA' | 'COM_VITIMA_FERIDA' | 'COM_VITIMA_FATAL';
    /**
     * @description Estado do registro de sinistro na máquina de estados RENAEST.
     * @enum {string}
     */
    SituacaoRenaest: 'RECEBIDO' | 'EM_ANALISE' | 'CONSOLIDADO' | 'REJEITADO';
    /** @description Vínculos opcionais com as demais bases nacionais. O mock valida apenas a forma; não resolve os identificadores contra bases reais. */
    ReferenciasSinistro: {
      renavam?: string;
      cpfCondutor?: string;
      numeroAit?: string;
    };
    /**
     * @description Dados para registrar um sinistro na base nacional RENAEST.
     * @example {
     *       "dataHoraSinistro": "2024-02-11T19:05:00.000Z",
     *       "uf": "SP",
     *       "codigoMunicipio": "3550308",
     *       "gravidade": "COM_VITIMA_FERIDA",
     *       "local": "KM 120 - via urbana",
     *       "orgaoResponsavel": "DETRAN-SP",
     *       "condicoesVia": "SECA",
     *       "condicoesMeteorologicas": "BOM",
     *       "versaoLeiaute": "1.0",
     *       "vitimas": [
     *         {
     *           "gravidadeLesao": "LEVE",
     *           "tipoEnvolvido": "CONDUTOR"
     *         }
     *       ],
     *       "referencias": {
     *         "renavam": "00123456780"
     *       }
     *     }
     */
    SinistroRequest: {
      /** Format: date-time */
      dataHoraSinistro: string;
      uf: string;
      codigoMunicipio: string;
      gravidade: components['schemas']['GravidadeSinistro'];
      local?: string;
      orgaoResponsavel?: string;
      codigoTipoSinistro?: string;
      condicoesVia?: string;
      condicoesMeteorologicas?: string;
      versaoLeiaute?: string;
      /** Format: date-time */
      dataTransmissao?: string;
      veiculos?: Record<string, never>[];
      pessoas?: Record<string, never>[];
      vitimas?: Record<string, never>[];
      referencias?: components['schemas']['ReferenciasSinistro'];
    };
    /** @description Lote de sinistros. */
    SinistroLoteRequest: {
      sinistros: components['schemas']['SinistroRequest'][];
    };
    /**
     * @description Complemento ou correção vinculado a um sinistro existente.
     * @example {
     *       "motivo": "Ajuste de gravidade da vítima",
     *       "gravidade": "COM_VITIMA_FERIDA"
     *     }
     */
    RetificacaoSinistroRequest: {
      motivo?: string;
      versaoLeiaute?: string;
      gravidade?: string;
      local?: string;
      vitimas?: Record<string, never>[];
      veiculos?: Record<string, never>[];
      pessoas?: Record<string, never>[];
      referencias?: components['schemas']['ReferenciasSinistro'];
    };
    /**
     * @description Registro de sinistro RENAEST (resposta).
     * @example {
     *       "protocolo": "RENAEST-SEED-0000000002",
     *       "idSinistro": "SN00000000002",
     *       "situacao": "RECEBIDO",
     *       "dataHoraSinistro": "2024-02-11T19:05:00.000Z",
     *       "uf": "SP",
     *       "codigoMunicipio": "3550308",
     *       "gravidade": "COM_VITIMA_FERIDA",
     *       "local": "KM 120 - via urbana",
     *       "orgaoResponsavel": "DETRAN-SP",
     *       "referencias": {
     *         "renavam": "00123456780"
     *       }
     *     }
     */
    Sinistro: {
      protocolo?: string;
      idSinistro?: string;
      situacao?: components['schemas']['SituacaoRenaest'];
      /** Format: date-time */
      dataHoraSinistro?: string;
      uf?: string;
      codigoMunicipio?: string;
      gravidade?: components['schemas']['GravidadeSinistro'];
      local?: string;
      orgaoResponsavel?: string;
      codigoTipoSinistro?: string;
      condicoesVia?: string;
      condicoesMeteorologicas?: string;
      veiculos?: Record<string, never>[];
      pessoas?: Record<string, never>[];
      vitimas?: Record<string, never>[];
      referencias?: components['schemas']['ReferenciasSinistro'];
      /** Format: date-time */
      dataTransmissao?: string;
    };
    /**
     * @example {
     *       "protocoloLote": "RENAEST-6f1b2c3d",
     *       "quantidade": 2,
     *       "situacao": "RECEBIDO",
     *       "itens": [
     *         {
     *           "idSinistro": "SN70000000001",
     *           "protocolo": "RENAEST-aa",
     *           "situacao": "RECEBIDO"
     *         }
     *       ]
     *     }
     */
    SinistroLoteResponse: {
      protocoloLote?: string;
      quantidade?: number;
      situacao?: components['schemas']['SituacaoRenaest'];
      itens?: {
        idSinistro?: string;
        protocolo?: string;
        situacao?: components['schemas']['SituacaoRenaest'];
      }[];
    };
    /**
     * @example {
     *       "idRetificacao": "8b1c0e2a-1111-4d22-9a33-abcdef012345",
     *       "idSinistro": "SN00000000007",
     *       "tipo": "CORRECAO",
     *       "protocolo": "RENAEST-9f8e7d",
     *       "situacao": "RETIFICACAO_EM_ANALISE"
     *     }
     */
    RetificacaoResponse: {
      idRetificacao?: string;
      idSinistro?: string;
      /** @enum {string} */
      tipo?: 'COMPLEMENTO' | 'CORRECAO';
      protocolo?: string;
      situacao?: string;
    };
    /** @enum {string} */
    SituacaoSne: 'ACEITA' | 'PENDENTE' | 'REJEITADA' | 'CANCELADA' | 'EXPIRADA';
    /** @enum {string} */
    CanalSne: 'APP_CDT' | 'EMAIL' | 'SMS' | 'INDISPONIVEL';
    /** @enum {string} */
    TipoNotificacaoSne: 'AUTUACAO' | 'PENALIDADE';
    /**
     * @description Situação de adesão ao SNE (veículo, cidadão ou órgão).
     * @example {
     *       "placa": "ABC1D23",
     *       "aderido": true,
     *       "canal": "APP_CDT"
     *     }
     */
    AdesaoSne: {
      placa?: string;
      cpf?: string;
      codigoOrgaoAutuador?: string;
      aderido?: boolean;
      canal?: string;
    };
    /**
     * @example {
     *       "numeroAit": "A0001001",
     *       "codigoOrgaoAutuador": "204020",
     *       "placa": "ABC1D23",
     *       "cpfDestinatario": "52998224725",
     *       "canal": "APP_CDT",
     *       "dataInfracao": "2024-05-01T00:00:00.000Z",
     *       "dataNotificacao": "2024-05-10T00:00:00.000Z"
     *     }
     */
    NotificacaoSneRequest: {
      numeroAit: string;
      codigoOrgaoAutuador: string;
      idProcesso?: string;
      placa?: string;
      cpfDestinatario?: string;
      canal?: components['schemas']['CanalSne'];
      /** Format: date-time */
      dataInfracao?: string;
      /** Format: date-time */
      dataNotificacao?: string;
      mensagem?: string;
    };
    /**
     * @description Notificação eletrônica SNE (resposta).
     * @example {
     *       "protocolo": "SNE-SEED-AUT-0001",
     *       "numeroAit": "A0001001",
     *       "tipoNotificacao": "AUTUACAO",
     *       "codigoOrgaoAutuador": "204020",
     *       "placa": "ABC1D23",
     *       "cpfDestinatario": "52998224725",
     *       "situacao": "ACEITA",
     *       "canal": "APP_CDT",
     *       "dataNotificacao": "2024-05-01T10:00:00.000Z"
     *     }
     */
    NotificacaoSne: {
      protocolo?: string;
      numeroAit?: string;
      idProcesso?: string;
      tipoNotificacao?: components['schemas']['TipoNotificacaoSne'];
      codigoOrgaoAutuador?: string;
      placa?: string;
      cpfDestinatario?: string;
      situacao?: components['schemas']['SituacaoSne'];
      canal?: components['schemas']['CanalSne'];
      /** Format: date-time */
      dataNotificacao?: string;
      /** Format: date-time */
      dataDisponibilizacao?: string;
      /** Format: date-time */
      dataCiencia?: string;
      /** Format: date-time */
      prazoLegal?: string;
      mensagem?: string;
    };
    CancelamentoSneRequest: {
      motivo?: string;
    };
    /**
     * @example {
     *       "protocolo": "SNE-SEED-AUT-0001",
     *       "situacao": "CANCELADA"
     *     }
     */
    CancelamentoSneResponse: {
      protocolo?: string;
      situacao?: string;
    };
    CdtNotificacoes: {
      cpf?: string;
      notificacoes?: Record<string, never>[];
    };
    CdtInfracoes: {
      cpf?: string;
      infracoes?: Record<string, never>[];
    };
    CdtVeiculos: {
      cpf?: string;
      veiculos?: Record<string, never>[];
    };
    CdtCnh: {
      cpf?: string;
      cnh?: Record<string, never>;
    };
    /**
     * @description Projeção de pagamento/desconto de uma infração no canal CDT.
     * @example {
     *       "numeroAit": "A0001001",
     *       "cpf": "52998224725",
     *       "situacao": "DISPONIVEL",
     *       "valorOriginal": 293.47,
     *       "percentualDesconto": 40,
     *       "valorComDesconto": 176.08,
     *       "boletoDisponivel": true,
     *       "origem": "RENAINF"
     *     }
     */
    CdtPagamento: {
      numeroAit?: string;
      cpf?: string;
      situacao?: string;
      valorOriginal?: number;
      percentualDesconto?: number;
      valorComDesconto?: number;
      boletoDisponivel?: boolean;
      linhaDigitavel?: string;
      dataVencimento?: string;
      origem?: string;
      protocoloSne?: string;
      protocoloRenainf?: string;
    };
    ReconhecimentoRequest: {
      canal?: string;
      cpf?: string;
    };
    /**
     * @example {
     *       "numeroAit": "A0001001",
     *       "situacao": "RECONHECIDA",
     *       "percentualDesconto": 40,
     *       "valorOriginal": 293.47,
     *       "valorComDesconto": 176.08,
     *       "boletoDisponivel": true
     *     }
     */
    ReconhecimentoResponse: {
      numeroAit?: string;
      situacao?: string;
      percentualDesconto?: number;
      valorOriginal?: number;
      valorComDesconto?: number;
      boletoDisponivel?: boolean;
      linhaDigitavel?: string;
    };
    /**
     * @description Requisição de bridge do DETRAN estadual. `dados` carrega o payload nacional específico; `codigoOrgao`/`versaoLeiaute` dirigem o perfil e a validação de leiaute.
     * @example {
     *       "placa": "ABC1D23",
     *       "versaoLeiaute": "1.0"
     *     }
     */
    BridgeRequest: {
      codigoOrgao?: string;
      versaoLeiaute?: string;
      placa?: string;
      renavam?: string;
      cpf?: string;
      numeroAit?: string;
      dados?: Record<string, never>;
    };
    /**
     * @description Protocolo de bridge vinculado ao protocolo da base nacional.
     * @example {
     *       "protocoloDetran": "DTR-SP-70000000001",
     *       "protocoloNacional": "RENAVAM-70000000001",
     *       "sistemaNacional": "RENAVAM",
     *       "uf": "SP",
     *       "codigoOrgao": "204020",
     *       "perfilIntegracao": "PRODUCAO",
     *       "versaoLeiaute": "1.0",
     *       "situacao": "ACEITO"
     *     }
     */
    BridgeResponse: {
      protocoloDetran?: string;
      protocoloNacional?: string;
      sistemaNacional?: string;
      uf?: string;
      codigoOrgao?: string;
      perfilIntegracao?: string;
      versaoLeiaute?: string;
      numeroAit?: string;
      situacao?: string;
      retorno?: Record<string, never>;
    };
  };
  responses: {
    /** @description Requisição inválida. A requisição não foi aceita, geralmente por falta de um parâmetro requerido. */
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Não autorizado. Problemas durante a autenticação do certificado ou do CPF do usuário. */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Requisição falhou. Os parâmetros foram validados, mas houve algum erro de negócio. */
    BusinessError: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Não encontrado. O recurso solicitado não existe. */
    NotFound: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description Erro no servidor. Ocorreu algum erro interno. */
    ServerError: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
  };
  parameters: {
    /** @description CPF do usuário que está fazendo a requisição */
    XCpfUsuario: string;
    /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
    IdempotencyKey: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  consultarProcessosRenach: {
    parameters: {
      query: {
        /** @description CPF do candidato */
        cpf: string;
        /** @description Filtra por tipo de processo */
        tipoProcesso?: components['schemas']['TipoProcesso'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Lista de processos ativos (possivelmente vazia). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoRenachListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  abrirProcessoRenach: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AberturaProcessoRenachRequest'];
      };
    };
    responses: {
      /** @description Criado. Processo RENACH aberto em situação ABERTO. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoRenach'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.ALREADY_OPEN` — já existe processo ativo para o CPF e tipo informados. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getProcessoRenach: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoRenach'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  verificarElegibilidadeExame: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ElegibilidadeExameRequest'];
      };
    };
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ElegibilidadeExameResponse'];
        };
      };
      /** @description Requisição inválida. `RENACH.EXAM.INVALID_TYPE`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.INVALID_STATUS`, `RENACH.PROCESS.BLOCKED`, `RENACH.PROCESS.EXPIRED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  listarClinicasCredenciadas: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ClinicaCredenciada'][];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  listarProfissionaisCredenciados: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProfissionalCredenciado'][];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.EXAMINER.NOT_ACCREDITED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  criarAgendamentoExame: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AgendamentoRequest'];
      };
    };
    responses: {
      /** @description Criado. Agendamento registrado com sucesso. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Agendamento'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.INVALID_STATUS`, `RENACH.CLINIC.NOT_ACCREDITED`, `RENACH.CLINIC.INACTIVE`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  alterarAgendamento: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do agendamento */
        idAgendamento: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AgendamentoPatchRequest'];
      };
    };
    responses: {
      /** @description OK. Agendamento atualizado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Agendamento'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  iniciarAtendimento: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do agendamento */
        idAgendamento: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CheckinRequest'];
      };
    };
    responses: {
      /** @description OK. Atendimento iniciado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Agendamento'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.INVALID_STATUS`, `RENACH.BIOMETRY.NOT_MATCHED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarExameMedico: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ExameMedicoRequest'];
      };
    };
    responses: {
      /** @description Criado. Exame médico registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Exame'];
        };
      };
      /** @description Requisição inválida. `RENACH.EXAM.INVALID_TYPE`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.EXAM.ALREADY_RECORDED`, `RENACH.EXAM.RESULT_NOT_ALLOWED`, `RENACH.EXAM.REQUIRES_BOARD`, `RENACH.CLINIC.NOT_ACCREDITED`, `RENACH.EXAMINER.NOT_ACCREDITED`, `RENACH.EXAMINER.NOT_LINKED_TO_CLINIC`, `RENACH.SIGNATURE.INVALID`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarAvaliacaoPsicologica: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AvaliacaoPsicologicaRequest'];
      };
    };
    responses: {
      /** @description Criado. Avaliação psicológica registrada. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Exame'];
        };
      };
      /** @description Requisição inválida. `RENACH.EXAM.INVALID_TYPE`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.EXAM.ALREADY_RECORDED`, `RENACH.EXAM.RESULT_NOT_ALLOWED`, `RENACH.EXAMINER.NOT_ACCREDITED`, `RENACH.EXAMINER.NOT_LINKED_TO_CLINIC`, `RENACH.SIGNATURE.INVALID`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarResultadosExames: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ExameList'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  retificarExame: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do exame */
        idExame: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RetificacaoExameRequest'];
      };
    };
    responses: {
      /** @description Aceito. Retificação em processamento. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AceiteAssincrono'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.RECTIFICATION.NOT_ALLOWED`, `RENACH.EXAM.RESULT_NOT_ALLOWED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  encaminharJuntaMedica: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EncaminhamentoJuntaRequest'];
      };
    };
    responses: {
      /** @description Aceito. Encaminhamento à junta em processamento. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AceiteAssincrono'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.EXAM.REQUIRES_BOARD`, `RENACH.PROCESS.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarParecerJunta: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do processo RENACH */
        numeroRenach: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ParecerJuntaRequest'];
      };
    };
    responses: {
      /** @description Criado. Parecer de junta registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Exame'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENACH.PROCESS.INVALID_STATUS`, `RENACH.EXAM.RESULT_NOT_ALLOWED`, `RENACH.SIGNATURE.INVALID`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENACH.PROCESS.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarDispositivoTalonario: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DispositivoTalonarioRequest'];
      };
    };
    responses: {
      /** @description Criado. Dispositivo de talonário registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DispositivoTalonario'];
        };
      };
      /** @description Requisição inválida. `RENAINF.AIT.INVALID_DEVICE`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.SNE.NOT_ADHERED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  sincronizarDominioOperacional: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SincronizacaoTalonario'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  reservarFaixaNumeracaoAit: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FaixaNumeracaoAitRequest'];
      };
    };
    responses: {
      /** @description Criado. Faixa de numeração de AIT reservada. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['FaixaNumeracaoAit'];
        };
      };
      /** @description Requisição inválida. `RENAINF.AIT.INVALID_NUMBER`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.AIT.OUT_OF_RANGE`, `RENAINF.AIT.INVALID_DEVICE`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  criarAutoInfracao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AutoInfracaoRequest'];
      };
    };
    responses: {
      /** @description Criado. Auto de infração registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AutoInfracao'];
        };
      };
      /** @description Requisição inválida. `RENAINF.AIT.INVALID_NUMBER`, `RENAINF.AIT.INVALID_INFRACTION_CODE`, `RENAINF.AIT.INVALID_AGENT`, `RENAINF.AIT.INVALID_DEVICE`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.AIT.DUPLICATED`, `RENAINF.AIT.OUT_OF_RANGE`, `RENAINF.AIT.EVIDENCE_REQUIRED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  transmitirLoteAutosInfracao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['LoteAutosInfracaoRequest'];
      };
    };
    responses: {
      /** @description Aceito. Lote em processamento. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AceiteAssincrono'];
        };
      };
      /** @description Requisição inválida. `RENAINF.AIT.INVALID_NUMBER`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.AIT.TRANSMISSION_EXPIRED`, `RENAINF.AIT.OUT_OF_RANGE`, `RENAINF.AIT.DUPLICATED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  consultarAutoInfracao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do auto de infração de trânsito */
        numeroAit: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AutoInfracao'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  solicitarCancelamentoAutoInfracao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Número do auto de infração de trânsito */
        numeroAit: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SolicitacaoCancelamentoRequest'];
      };
    };
    responses: {
      /** @description Aceito. Solicitação de cancelamento em análise. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AceiteAssincrono'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.AIT.CANCELLATION_NOT_ALLOWED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  abrirAutuacao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProcessoAdministrativoRequest'];
      };
    };
    responses: {
      /** @description Criado. Processo administrativo (autuação) aberto. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoAdministrativo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.CASE.INVALID_STATUS`, `RENAINF.AIT.DUPLICATED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  emitirNotificacaoAutuacao: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['NotificacaoRequest'];
      };
    };
    responses: {
      /** @description Criado. Notificação de autuação emitida. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Notificacao'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarIndicacaoCondutor: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['IndicacaoCondutorRequest'];
      };
    };
    responses: {
      /** @description Criado. Indicação de condutor registrada. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoAdministrativo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.CASE.INVALID_STATUS`, `RENAINF.NOTICE.DEADLINE_EXPIRED`, `RENAINF.DEFENSE.INVALID_ACTOR`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  protocolarDefesaPrevia: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DefesaPreviaRequest'];
      };
    };
    responses: {
      /** @description Criado. Defesa prévia protocolada. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoAdministrativo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.DEFENSE.NOT_ALLOWED`, `RENAINF.DEFENSE.LATE_SUBMISSION`, `RENAINF.DEFENSE.INVALID_ACTOR`, `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  imporPenalidade: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PenalidadeRequest'];
      };
    };
    responses: {
      /** @description Criado. Penalidade imposta. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProcessoAdministrativo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.PENALTY.ALREADY_IMPOSED`, `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  emitirNotificacaoPenalidade: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['NotificacaoRequest'];
      };
    };
    responses: {
      /** @description Criado. Notificação de penalidade emitida. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Notificacao'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.CASE.INVALID_STATUS`, `RENAINF.PENALTY.ALREADY_IMPOSED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  protocolarRecurso: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RecursoRequest'];
      };
    };
    responses: {
      /** @description Criado. Recurso protocolado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Recurso'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.APPEAL.INVALID_INSTANCE`, `RENAINF.APPEAL.PREVIOUS_INSTANCE_REQUIRED`, `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarJulgamentoRecurso: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do recurso */
        idRecurso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['JulgamentoRecursoRequest'];
      };
    };
    responses: {
      /** @description Criado. Julgamento do recurso registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Recurso'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.APPEAL.INVALID_INSTANCE`, `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarDebito: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Tudo funcionou como esperado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Debito'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  registrarPagamento: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        /** @description Identificador do processo administrativo */
        idProcesso: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PagamentoRequest'];
      };
    };
    responses: {
      /** @description Criado. Pagamento registrado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Pagamento'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAINF.PAYMENT.ALREADY_SETTLED`, `RENAINF.CASE.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAINF.CASE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  submeterSinistroRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SinistroRequest'];
      };
    };
    responses: {
      /** @description Criado. Sinistro recebido em situação RECEBIDO. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Sinistro'];
        };
      };
      /** @description Requisição inválida. `RENAEST.CRASH.INVALID_LAYOUT` — versão de leiaute não suportada; ou corpo malformado. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAEST.CRASH.DUPLICATED` (reenvio duplicado sem chave) ou `RENAEST.CRASH.INCOMPLETE_DATA` (dados de vítima/local/gravidade obrigatórios ausentes). */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  submeterLoteSinistrosRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SinistroLoteRequest'];
      };
    };
    responses: {
      /** @description Criado. Lote recebido. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SinistroLoteResponse'];
        };
      };
      /** @description Requisição inválida. `RENAEST.CRASH.INVALID_LAYOUT` em algum item do lote, ou corpo malformado. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAEST.CRASH.INCOMPLETE_DATA` ou `RENAEST.CRASH.DUPLICATED` em algum item do lote. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  consultarSinistroRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Identificador do registro de sinistro */
        idSinistro: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Registro de sinistro. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Sinistro'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENAEST.CRASH.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarProtocoloRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Protocolo de transmissão do sinistro */
        protocolo: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Registro de sinistro correspondente ao protocolo. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Sinistro'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `RENAEST.CRASH.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  complementarSinistroRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RetificacaoSinistroRequest'];
      };
    };
    responses: {
      /** @description Aceito. Complemento em análise. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RetificacaoResponse'];
        };
      };
      /** @description Requisição inválida. `RENAEST.CRASH.INVALID_LAYOUT`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAEST.CRASH.CORRECTION_NOT_ALLOWED` — registro em situação terminal. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAEST.CRASH.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  corrigirSinistroRenaest: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RetificacaoSinistroRequest'];
      };
    };
    responses: {
      /** @description Aceito. Correção em análise. */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RetificacaoResponse'];
        };
      };
      /** @description Requisição inválida. `RENAEST.CRASH.INVALID_LAYOUT`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `RENAEST.CRASH.CORRECTION_NOT_ALLOWED` — registro em situação terminal. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `RENAEST.CRASH.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarAdesaoVeiculoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        placa: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Situação de adesão do veículo. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdesaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  consultarAdesaoCidadaoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        cpf: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Situação de adesão do cidadão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdesaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  consultarAdesaoOrgaoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        codigoOrgaoAutuador: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Situação de adesão do órgão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AdesaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  notificarAutuacaoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['NotificacaoSneRequest'];
      };
    };
    responses: {
      /** @description Criada. Notificação aceita ou pendente de entrega. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NotificacaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `SNE.AGENCY.NOT_ADHERED`, `SNE.NOT_ADHERED`, `SNE.NOTICE.DEADLINE_EXPIRED` ou `SNE.NOTIFICATION.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  notificarPenalidadeSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['NotificacaoSneRequest'];
      };
    };
    responses: {
      /** @description Criada. Notificação aceita ou pendente de entrega. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NotificacaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `SNE.AGENCY.NOT_ADHERED`, `SNE.NOT_ADHERED`, `SNE.NOTICE.DEADLINE_EXPIRED` ou `SNE.NOTIFICATION.INVALID_STATUS`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  consultarNotificacaoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        protocolo: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Notificação. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['NotificacaoSne'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrada. `SNE.NOTIFICATION.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  cancelarNotificacaoSne: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        protocolo: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['CancelamentoSneRequest'];
      };
    };
    responses: {
      /** @description OK. Notificação cancelada. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CancelamentoSneResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `SNE.NOTIFICATION.INVALID_STATUS` — notificação em situação terminal. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrada. `SNE.NOTIFICATION.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  listarNotificacoesCidadaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        cpf: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Projeção de notificações do cidadão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CdtNotificacoes'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `CDT.CITIZEN.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  listarInfracoesCidadaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        cpf: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Projeção de infrações do cidadão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CdtInfracoes'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `CDT.CITIZEN.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  listarVeiculosCidadaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        cpf: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Projeção de veículos do cidadão. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CdtVeiculos'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `CDT.CITIZEN.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarCnhCidadaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        cpf: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Resumo de CNH. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CdtCnh'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      /** @description Não encontrado. `CDT.CITIZEN.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  consultarPagamentoInfracaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        numeroAit: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. Projeção de pagamento (boleto/desconto). */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CdtPagamento'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `CDT.DISCOUNT.NOT_AVAILABLE`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrada. `CDT.INFRACTION.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  reconhecerInfracaoCdt: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        numeroAit: string;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['ReconhecimentoRequest'];
      };
    };
    responses: {
      /** @description OK. Infração reconhecida; desconto aplicado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReconhecimentoResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `CDT.RECOGNITION.NOT_ALLOWED` (situação terminal) ou `CDT.DISCOUNT.NOT_AVAILABLE`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrada. `CDT.INFRACTION.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeConsultarVeiculoDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        uf: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BridgeRequest'];
      };
    };
    responses: {
      /** @description Criado. Protocolo de bridge vinculado ao protocolo nacional. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      /** @description Requisição inválida. `DETRAN.LAYOUT.INVALID`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE` ou `DETRAN.BRIDGE.REJECTED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeConsultarCondutorDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        uf: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BridgeRequest'];
      };
    };
    responses: {
      /** @description Criado. Protocolo de bridge vinculado ao protocolo nacional. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      /** @description Requisição inválida. `DETRAN.LAYOUT.INVALID`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE` ou `DETRAN.BRIDGE.REJECTED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeEnviarAitDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        uf: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BridgeRequest'];
      };
    };
    responses: {
      /** @description Criado. Protocolo de bridge vinculado ao protocolo nacional. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      /** @description Requisição inválida. `DETRAN.LAYOUT.INVALID`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE` ou `DETRAN.BRIDGE.REJECTED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeConsultarAitDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        uf: string;
        numeroAit: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK. AIT nacional com metadados de bridge. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeEnviarSinistroDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        uf: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BridgeRequest'];
      };
    };
    responses: {
      /** @description Criado. Protocolo de bridge vinculado ao protocolo nacional. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      /** @description Requisição inválida. `DETRAN.LAYOUT.INVALID`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE` ou `DETRAN.BRIDGE.REJECTED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
  bridgeEnviarNotificacaoDetran: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
        /** @description Chave de idempotência opcional. Se enviada, é honrada para deduplicar escritas; caso contrário, a deduplicação usa chaves naturais (`numeroAit`, `numeroRenach`). */
        'Idempotency-Key'?: components['parameters']['IdempotencyKey'];
      };
      path: {
        uf: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['BridgeRequest'];
      };
    };
    responses: {
      /** @description Criado. Protocolo de bridge vinculado ao protocolo nacional. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BridgeResponse'];
        };
      };
      /** @description Requisição inválida. `DETRAN.LAYOUT.INVALID`. */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      401: components['responses']['Unauthorized'];
      /** @description Erro de negócio. `DETRAN.PROFILE.INACTIVE` ou `DETRAN.BRIDGE.REJECTED`. */
      402: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      /** @description Não encontrado. `DETRAN.PROFILE.NOT_FOUND`. */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ErrorResponse'];
        };
      };
      500: components['responses']['ServerError'];
    };
  };
}
