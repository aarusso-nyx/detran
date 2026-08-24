// Generated from the in-repo SENATRAN mock contract. Do not edit.
export interface paths {
  '/autorizacoesAlteracaoVeiculo/alteracoesPermitidas': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta alterações permitidas
     * @description Consulta os tipos de alterações que são permitidas nos veículos.
     */
    get: operations['getAlteracoesPermitidas'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/cpf/{cpf}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por CPF
     * @description Consulta de condutores por CPF.
     */
    get: operations['getCondutoresByCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/cpf/{cpf}/registroCnh/{numeroRegistroCnh}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por CPF e registro CNH
     * @description Consulta de condutores por CPF e número de registro da CNH.
     */
    get: operations['getCondutoresByCpfAndRegistroCnh'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/formularioRenach/{formularioRenach}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por formulário RENACH
     * @description Consulta de condutores por número do formulário RENACH.
     */
    get: operations['getCondutoresByFormularioRenach'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/imagens/cpf/{cpf}/registroCnh/{numeroRegistro}/segurancaCnh/{numeroSeguranca}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta validade do número de segurança da CNH (imagens)
     * @description Consulta validade do número de segurança da CNH, retornando imagens biométricas.
     */
    get: operations['getCondutorImagensByCpfRegistroCnhSeguranca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/impedimento/{impedimento}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por impedimento
     * @description Consulta de condutores por número do documento gerador do impedimento.
     */
    get: operations['getCondutoresByImpedimento'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/infracoes/registroCnh/{numeroRegistroCnh}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta extrato de infrações pela CNH do condutor
     * @description Consulta extrato de infrações pelo registro da Carteira Nacional de Habilitação do condutor.
     */
    get: operations['getCondutorInfracoesByRegistroCnh'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/nomeCondutor/{nomeCondutor}/dataNascimento/{dataNascimento}/nomeMae/{nomeMae}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consultar condutor por dados identificatórios
     * @description Consulta de condutores por Nome, Data de Nascimento e Nome da mãe.
     */
    get: operations['getCondutoresByDadosIdentificatorios'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/pgu/{pgu}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por PGU
     * @description Consulta de condutores por número do Prontuário Geral Unificado (PGU).
     */
    get: operations['getCondutoresByPgu'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/pid/{pid}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por PID
     * @description Consulta de condutores por PID.
     */
    get: operations['getCondutoresByPid'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/registroCnh/{numeroRegistroCnh}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta condutores por registro
     * @description Consulta de condutores por número de registro da CNH.
     */
    get: operations['getCondutoresByRegistroCnh'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/retrato/cpf/{cpf}/registroCnh/{numeroRegistro}/segurancaCnh/{numeroSeguranca}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta validade do número de segurança da CNH (retrato)
     * @description Consulta validade do número de segurança da CNH, retornando o retrato do condutor.
     */
    get: operations['getCondutorRetratoByCpfRegistroCnhSeguranca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/condutores/validacao/cpf/{cpf}/registroCnh/{numeroRegistro}/segurancaCnh/{numeroSeguranca}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta validade do número de segurança da CNH (validação)
     * @description Consulta validade do número de segurança da CNH.
     */
    get: operations['getCondutorValidacaoByCpfRegistroCnhSeguranca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ConsultaCSV/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta CSVIntegrador por chassi
     * @description Consulta CSVIntegrador por chassi.
     */
    get: operations['getConsultaCsvByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/ConsultaCSV/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta CSVIntegrador por placa
     * @description Consulta CSVIntegrador por placa.
     */
    get: operations['getConsultaCsvByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/alarme/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de alarme por chassi
     * @description Informa da existência ou não de alarme sobre um veículo.
     */
    get: operations['getIndicadorAlarmeByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/alarme/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de alarme por placa
     * @description Informa da existência ou não de alarme sobre um veículo.
     */
    get: operations['getIndicadorAlarmeByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/restricaoJudicial/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de restrição judicial por chassi
     * @description Informa da existência ou não de indicadores judiciais sobre um veículo.
     */
    get: operations['getIndicadorRestricaoJudicialByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/restricaoJudicial/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de restrição judicial por placa
     * @description Informa da existência ou não de indicadores judiciais sobre um veículo.
     */
    get: operations['getIndicadorRestricaoJudicialByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/rouboFurto/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de roubo/furto por chassi
     * @description Informa da existência ou não de roubo e furto sobre um veículo.
     */
    get: operations['getIndicadorRouboFurtoByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/rouboFurto/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de roubo/furto por placa
     * @description Informa da existência ou não de roubo e furto sobre um veículo.
     */
    get: operations['getIndicadorRouboFurtoByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/sinistro/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de sinistro por chassi
     * @description Informa da existência ou não de indicadores de sinistro sobre um veículo.
     */
    get: operations['getIndicadorSinistroByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/indicadores/sinistro/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta indicador de sinistro por placa
     * @description Informa da existência ou não de indicadores de sinistro sobre um veículo.
     */
    get: operations['getIndicadorSinistroByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/ait/{autoInfracao}/orgaoAutuador/{orgao}/infracao/{codigoInfracao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações por AIT, infração e órgão autuador
     * @description Consulta de infrações por Auto de Infração de Trânsito, código da infração e órgão autuador.
     */
    get: operations['getInfracoesByAit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/cnpj/{cnpj}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações pelo CNPJ do condutor/proprietário
     * @description Consulta de infrações pelo CNPJ do condutor/proprietário.
     */
    get: operations['getInfracoesByCnpj'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/cpf/{cpf}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações pelo CPF do condutor/proprietário
     * @description Consulta de infrações pelo CPF do condutor/proprietário.
     */
    get: operations['getInfracoesByCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/habilitacaoEstrangeira/{identificacao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações por habilitação estrangeira
     * @description Consulta de infrações pela identificação da habilitação estrangeira do condutor/proprietário.
     */
    get: operations['getInfracoesByHabilitacaoEstrangeira'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/ocorrencias/ait/{autoInfracao}/orgaoAutuador/{orgao}/infracao/{codigoInfracao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta ocorrências de infrações pelo AIT
     * @description Consulta ocorrências de infrações através do auto de infração de trânsito.
     */
    get: operations['getInfracaoOcorrenciasByAit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/pagamentos/ait/{autoInfracao}/orgaoAutuador/{orgao}/infracao/{codigoInfracao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta pagamentos de infrações pelo AIT
     * @description Consulta pagamentos de infrações através do auto de infração de trânsito.
     */
    get: operations['getInfracaoPagamentosByAit'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/pgu/{pgu}/uf/{uf}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações pelo CNH modelo antigo do condutor/proprietário
     * @description Consulta de infrações pelo modelo antigo de carteira nacional de habilitação do condutor/proprietário.
     */
    get: operations['getInfracoesByPguAndUf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/placa/{placa}/exigibilidade/{situacaoExigibilidade}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações por placa e exigibilidade
     * @description Consulta de infrações pela placa do veículo e situação de exigibilidade.
     */
    get: operations['getInfracoesByPlacaAndExigibilidade'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/registroCnh/{cnh}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações pelo CNH do condutor/proprietário
     * @description Consulta de infrações pelo registro da CNH do condutor/proprietário.
     */
    get: operations['getInfracoesByRegistroCnh'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/infracoes/renainf/{numeroRenainf}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de infrações por RENAINF
     * @description Consulta de infrações pelo número RENAINF.
     */
    get: operations['getInfracoesByRenainf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/restricoesJudiciaisAtivas/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de restrições judiciais ativas pela placa
     * @description Consulta de restrições judiciais ativas pela placa do veículo.
     */
    get: operations['getRestricoesJudiciaisAtivasByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/restricoesJudiciaisAtivas/placa/{placa}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de restrições judiciais ativas pela placa e Renavam
     * @description Consulta de restrições judiciais ativas pela placa e Renavam do veículo.
     */
    get: operations['getRestricoesJudiciaisAtivasByPlacaAndRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/rouboFurto/emAberto/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta Roubo e Furto em aberto por chassi
     * @description Consulta ocorrências policiais de roubo e furto em aberto (declaração com ou sem recuperação, porém sem devolução) ou alarme ativo registrado para o veículo do chassi informado.
     */
    get: operations['getRouboFurtoEmAbertoByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/rouboFurto/emAberto/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta Roubo e Furto em aberto por placa
     * @description Consulta ocorrências policiais de roubo e furto em aberto (declaração com ou sem recuperação, porém sem devolução) ou alarme ativo registrado para o veículo da placa informada.
     */
    get: operations['getRouboFurtoEmAbertoByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/cambio/{cambio}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por câmbio
     * @description Consulta de veículo por câmbio.
     */
    get: operations['getVeiculoByCambio'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por chassi
     * @description Consulta de veículo por chassi.
     */
    get: operations['getVeiculoByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/codigoSegurancaCrv/{codigoSegurancaCrv}/cnpj/{cnpj}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta validade número de segurança CRV
     * @description Consulta validade do número de segurança CRV pelo CNPJ do proprietário, Renavam e placa.
     */
    get: operations['getVeiculoCodigoSegurancaCrvByCnpj'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/codigoSegurancaCrv/{codigoSegurancaCrv}/cpf/{cpf}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta validade número de segurança CRV
     * @description Consulta validade do número de segurança CRV pelo CPF do proprietário, Renavam e placa.
     */
    get: operations['getVeiculoCodigoSegurancaCrvByCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/comunicacaoVenda/cnpj/{cnpj}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta comunicação de venda do veículo
     * @description Consulta comunicação de venda do veículo com a placa, Renavam e proprietário informado.
     */
    get: operations['getComunicacaoVendaByCnpj'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/comunicacaoVenda/cpf/{cpf}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta comunicação de venda do veículo
     * @description Consulta comunicação de venda do veículo com a placa, Renavam e proprietário informado.
     */
    get: operations['getComunicacaoVendaByCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/enderecoPossuidor/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta do endereço do possuidor do veículo por placa
     * @description Consulta do endereço do possuidor informando somente a placa.
     */
    get: operations['getEnderecoPossuidorByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/enderecoPossuidor/placa/{placa}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta do endereço do possuidor do veículo
     * @description Consulta do endereço do possuidor do veículo com a placa e Renavam informados.
     */
    get: operations['getEnderecoPossuidorByPlacaAndRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/motor/{motor}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por motor
     * @description Consulta de veículo por motor.
     */
    get: operations['getVeiculoByMotor'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/multaInterestadual/cnpj/{cnpj}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta multas interestaduais do proprietário do veículo
     * @description Consulta multas interestaduais do proprietário do veículo com a placa, Renavam e proprietário informado.
     */
    get: operations['getMultaInterestadualByCnpj'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/multaInterestadual/cpf/{cpf}/renavam/{renavam}/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta multas interestaduais do proprietário do veículo
     * @description Consulta multas interestaduais do proprietário do veículo com a placa, Renavam e proprietário informado.
     */
    get: operations['getMultaInterestadualByCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/placa/{placa}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por placa
     * @description Consulta de veículo por placa.
     */
    get: operations['getVeiculoByPlaca'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cnpj/{cnpj}/chassi/{chassi}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário, chassi e renavam
     * @description Consulta veículo por proprietário (CNPJ), chassi e renavam.
     */
    get: operations['getVeiculoByProprietarioCnpjChassiRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cnpj/{cnpj}/placa/{placa}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário, placa e renavam
     * @description Consulta veículo por proprietário (CNPJ), placa e renavam.
     */
    get: operations['getVeiculoByProprietarioCnpjPlacaRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cnpj/{identificacao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário
     * @description Consulta de veículo pela identificação única do proprietário pessoa jurídica.
     */
    get: operations['getVeiculosByProprietarioCnpj'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cpf/{cpf}/chassi/{chassi}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário, chassi e renavam
     * @description Consulta veículo por proprietário (CPF), chassi e renavam.
     */
    get: operations['getVeiculoByProprietarioCpfChassiRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cpf/{cpf}/placa/{placa}/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário, placa e renavam
     * @description Consulta veículo por proprietário (CPF), placa e renavam.
     */
    get: operations['getVeiculoByProprietarioCpfPlacaRenavam'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/proprietario/cpf/{identificacao}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por proprietário
     * @description Consulta de veículo pela identificação única do proprietário pessoa física.
     */
    get: operations['getVeiculosByProprietarioCpf'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/recall/chassi/{chassi}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta de recalls em aberto do veículo
     * @description Consulta de recalls em aberto do veículo com o chassi informado.
     */
    get: operations['getVeiculoRecallByChassi'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/veiculos/renavam/{renavam}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Consulta veículo por RENAVAM
     * @description Consulta de veículo por RENAVAM.
     */
    get: operations['getVeiculoByRenavam'];
    put?: never;
    post?: never;
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
    AlteracaoPermitida: {
      mapeamentoAutomatico?: boolean;
      codigoTipoAlteracao?: string;
      codigoAlteracao?: string;
      descricaoAlteracao?: string;
      codigoSistema?: number;
    };
    AlteracaoPermitidaList: components['schemas']['AlteracaoPermitida'][];
    CondutorOcorrencia: {
      mapeamentoAutomatico?: boolean;
      ufDetranBloqueio?: string;
      /** Format: date-time */
      dataImpedimentoBloqueio?: string;
      motivoImpedimentoBloqueio?: string;
      descricaoMotivoImpedimentoBloqueio?: string;
      orgaoResponsavelImpedimentoBloqueio?: number;
      documentoGeradorImpedimentoBloqueio?: string;
      /** Format: date-time */
      dataInicioImpedimentoBloqueio?: string;
      /** Format: date-time */
      dataTerminoImpedimentoBloqueio?: string;
      decricaoBloqueio?: string;
      tipoDecisaoBloqueio?: number;
      descricaoDecisaoBloqueio?: string;
      recolhimentoCnhBloqueada?: boolean;
      getrequisitosLiberacaoBloqueio?: string;
      prazoPenalBloqueio?: number;
      tipoPrazoPenalBloqueio?: number;
      prazoPenalTotalBloqueio?: number;
      tipoPrazoTotalBloqueio?: number;
      descricaoPrazoTotalBloqueio?: string;
      descricaoPrazoBloqueio?: string;
    };
    Condutor: {
      mapeamentoAutomatico?: boolean;
      ufDominio?: string;
      numeroFormularioRenach?: string;
      numeroRegistro?: string;
      numeroFormularioCnh?: string;
      numeroListaImpedimento?: string;
      nome?: string;
      /** Format: date-time */
      dataNascimento?: string;
      sexo?: number;
      nomeMae?: string;
      nomePai?: string;
      tipoDocumento?: number;
      numeroDocumento?: string;
      orgaoExpedidorDocumento?: string;
      ufExpedidorDocumento?: string;
      cpf?: string;
      localidadeNascimento?: string;
      descricaoLocalidadeNascimento?: string;
      nacionalidade?: number;
      /** Format: date-time */
      dataCadastramento?: string;
      enderecoLogradouro?: string;
      enderecoNumero?: string;
      enderecoComplemento?: string;
      enderecoBairro?: string;
      enderecoCep?: string;
      enderecoMunicipio?: string;
      descricaoEnderecoMunicipio?: string;
      enderecoUf?: string;
      numeroPgu?: string;
      motivoRequerimento1?: string;
      motivoRequerimento2?: string;
      motivoRequerimento3?: string;
      motivoRequerimento4?: string;
      /** Format: date-time */
      dataPrimeiraHabilitacao?: string;
      ufPrimeiraHabilitacao?: string;
      categoriaAtual?: string;
      categoriaRebaixada?: string;
      categoriaAutorizada?: string;
      /** Format: date-time */
      dataValidadeCnh?: string;
      ufHabilitacaoAtual?: string;
      quadroObservacoesCnh?: string;
      ufSolicitanteTransferencia?: string;
      situacaoCnh?: string;
      situacaoCnhAnterior?: string;
      permissionario?: number;
      cancelamento?: string;
      /** Format: date-time */
      dataUltimaEmissaoHistorico?: string;
      codigoTransacaoUltimaAtualizacao?: number;
      /** Format: date-time */
      dataTransacaoUltimaAtualizacao?: string;
      classificacaoCursoTpp?: string;
      ufCursoTpp?: string;
      /** Format: date-time */
      dataCursoTpp?: string;
      classificacaoCursoTe?: string;
      ufCursoTe?: string;
      /** Format: date-time */
      dataCursoTe?: string;
      classificacaoCursoTcp?: string;
      ufCursoTcp?: string;
      /** Format: date-time */
      dataCursoTcp?: string;
      classificacaoCursoTve?: string;
      ufCursoTve?: string;
      /** Format: date-time */
      dataCursoTve?: string;
      classificacaoCursoTci?: string;
      ufCursoTci?: string;
      /** Format: date-time */
      dataCursoTci?: string;
      classificacaoCursoTmt?: string;
      ufCursoTmt?: string;
      /** Format: date-time */
      dataCursoTmt?: string;
      classificacaoCursoTmf?: string;
      ufCursoTmf?: string;
      /** Format: date-time */
      dataCursoTmf?: string;
      ufCursoReciclagemInfrator?: string;
      /** Format: date-time */
      dataCursoReciclagemInfrator?: string;
      modalidadeCursoReciclagemInfrator?: string;
      ufCursoAtualizacaoRenovacaoCnh?: string;
      /** Format: date-time */
      dataCursoAtualizacaoRenovacaoCnh?: string;
      modalidadeCursoAtualizacaoRenovacaoCnh?: string;
      registroNacionalEstrangeiro?: string;
      paisOrigemHabilitacaoEstrangeira?: string;
      descricaoPaisOrigemHabilitacaoEstrangeira?: string;
      identificacaoHabilitacaoEstrangeira?: string;
      /** Format: date-time */
      dataValidadeHabilitacaoEstrangeira?: string;
      numeroFormularioPid?: string;
      /** Format: date-time */
      dataValidadePid?: string;
      ufExpedicaoPid?: string;
      numeroFormularioCnhBasePid?: string;
      motivoRequerimentoPid1?: string;
      motivoRequerimentoPid2?: string;
      motivoRequerimentoPid3?: string;
      motivoRequerimentoPid4?: string;
      situacaoPid?: string;
      restricoesMedicas?: string;
      quantidadeOcorrenciasImpedimentos?: number;
      ocorrencias?: components['schemas']['CondutorOcorrencia'][];
      descricaoSexo?: string;
      descricaoDocumento?: string;
      descricaoSituacaoCnh?: string;
      descricaoMotivoRequerimento1?: string;
      descricaoMotivoRequerimento2?: string;
      descricaoMotivoRequerimento3?: string;
      descricaoMotivoRequerimento4?: string;
      descricaoMotivoRequerimentoPid1?: string;
      descricaoMotivoRequerimentoPid2?: string;
      descricaoMotivoRequerimentoPid3?: string;
      descricaoMotivoRequerimentoPid4?: string;
      descricaoSituacaoCnhAnterior?: string;
      descricaoNacionalidade?: string;
      descricaoClassificacaoCursoTve?: string;
      descricaoClassificacaoCursoTpp?: string;
      descricaoClassificacaoCursoTmt?: string;
      descricaoClassificacaoCursoTmf?: string;
      descricaoClassificacaoCursoTcp?: string;
      descricaoClassificacaoCursoTci?: string;
      descricaoClassificacaoCursoTe?: string;
      descricaoModalidadeCursoAtualizacaoRenovacaoCnh?: string;
      descricaoModalidadeCursoReciclagemInfrator?: string;
    };
    /**
     * @example {
     *       "condutores": [
     *         {
     *           "cpf": "52998224725",
     *           "nome": "MARIA SILVA SANTOS",
     *           "nomeMae": "JOANA SILVA",
     *           "numeroRegistro": "01234567890",
     *           "situacaoCnh": "A",
     *           "descricaoSituacaoCnh": "ATIVA",
     *           "categoriaAtual": "AB",
     *           "dataValidadeCnh": "2027-05-10T00:00:00.000Z",
     *           "enderecoUf": "RS",
     *           "enderecoMunicipio": "4314902",
     *           "descricaoEnderecoMunicipio": "Porto Alegre",
     *           "ufPrimeiraHabilitacao": "RS"
     *         }
     *       ]
     *     }
     */
    CondutorListResponse: {
      condutores?: components['schemas']['Condutor'][];
    };
    CondutorImagemDigital: {
      motivoAusencia?: number;
      imagem?: string[];
    };
    CondutorImagem: {
      mapeamentoAutomatico?: boolean;
      nomeMae?: string;
      /** Format: date-time */
      dataEmissao?: string;
      nomeCondutor?: string;
      numeroRegistro?: string;
      numeroFormularioCnh?: string;
      /** Format: date-time */
      dataValidade?: string;
      categoria?: string;
      numeroSeguranca?: string;
      numeroFormularioRenach?: string;
      /** Format: date-time */
      dataNascimento?: string;
      codigoNacionalidade?: string;
      descricaoNacionalidade?: string;
      nomePai?: string;
      enderecoLogradouro?: string;
      enderecoNumero?: string;
      enderecoComplemento?: string;
      enderecoBairro?: string;
      enderecoCep?: string;
      enderecoCodigoMunicipio?: string;
      enderecoDescricaoMunicipio?: string;
      enderecoUf?: string;
      /** Format: date-time */
      dataPrimeiraHabilitacao?: string;
      ufPrimeiraHabilitacao?: string;
      ufHabilitacaoAtual?: string;
      ufDominio?: string;
      indicadorInfracoesNoUltimoAno?: boolean;
      retrato?: string[];
      assinatura?: string[];
      polegarDireito?: components['schemas']['CondutorImagemDigital'];
      indicadorDireito?: components['schemas']['CondutorImagemDigital'];
      medioDireito?: components['schemas']['CondutorImagemDigital'];
      anelarDireito?: components['schemas']['CondutorImagemDigital'];
      minimoDireito?: components['schemas']['CondutorImagemDigital'];
      polegarEsquerdo?: components['schemas']['CondutorImagemDigital'];
      indicadorEsquerdo?: components['schemas']['CondutorImagemDigital'];
      medioEsquerdo?: components['schemas']['CondutorImagemDigital'];
      anelarEsquerdo?: components['schemas']['CondutorImagemDigital'];
      minimoEsquerdo?: components['schemas']['CondutorImagemDigital'];
      situacao?: string;
    };
    CondutorInfracaoExtratoItem: {
      mapeamentoAutomatico?: boolean;
      codigoInfracao?: number;
      descricaoAutoInfracao?: string;
      quantidadeInfracao?: number;
      gravidadeInfracao?: number;
      descricaoGravidadeInfracao?: string;
      quantidadeAdvertenciasPorEscrito?: number;
    };
    CondutorInfracaoExtrato: {
      quantidade?: number;
      quantidadeReal?: number;
      ocorrencias?: components['schemas']['CondutorInfracaoExtratoItem'][];
    };
    Infracao: {
      mapeamentoAutomatico?: boolean;
      codigoInfracao?: string;
      codigoDesdobramentoInfracao?: string;
      descricaoInfracao?: string;
      codigoRenainf?: string;
      /** Format: date-time */
      dataCadastroInfracao?: string;
      ufOrgaoAutuador?: string;
      placa?: string;
      codigoRenavam?: string;
      codigoMarcaModelo?: string;
      descricaoMarcaModelo?: string;
      codigoTipoVeiculo?: number;
      descricaoTipoVeiculo?: string;
      codigoCorVeiculo?: number;
      descricaoCorVeiculo?: string;
      codigoEspecieVeiculo?: number;
      descricaoEspecieVeiculo?: string;
      codigoCarroceriaVeiculo?: number;
      descricaoCarroceriaVeiculo?: string;
      codigoCategoriaVeiculo?: number;
      descricaoCategoriaVeiculo?: string;
      getufJurisdicaoVeiculo?: string;
      getufEmplacamentoInformada?: string;
      codigoMunicipioEmplacamento?: string;
      descricaoMunicipioEmplacamento?: string;
      codigoPaisVeiculo?: number;
      descricaoPaisVeiculo?: string;
      codigoRestricao1?: number;
      descricaoRestricao1?: string;
      codigoRestricao2?: number;
      descricaoRestricao2?: string;
      codigoRestricao3?: number;
      descricaoRestricao3?: string;
      codigoRestricao4?: number;
      descricaoRestricao4?: string;
      indicadorRestricaoRenajud?: boolean;
      indicadorRestricaoRenavam?: boolean;
      indicadorRouboFurtoRenavam?: boolean;
      codigoOrgaoAutuador?: string;
      descricaoOrgaoAutuador?: string;
      numeroAutoInfracao?: string;
      indicadorAssinaturaAuto?: number;
      descricaoAssinaturaAuto?: string;
      modeloCnhCondutor?: number;
      descricaoModeloCnhCondutor?: string;
      numeroRegistroCnhCondutor?: string;
      ufExpedicaoCnhCondutor?: string;
      /** Format: date-time */
      dataInfracao?: string;
      horaInfracao?: string;
      localOcorrenciaInfracao?: string;
      codigoMunicipioInfracao?: string;
      descricaoMunicipioInfracao?: string;
      tipoAuto?: number;
      descricaoTipoAuto?: string;
      numeroDocumentoCondutorNaoHabilitado?: string;
      tipoDocumentoCondutorNaoHabilitado?: number;
      descricaoTipoDocumentoCondutorNaoHabilitado?: string;
      medicaoReal?: number;
      limitePermitido?: number;
      medicaoConsiderada?: number;
      unidadeMedida?: number;
      descricaoUnidadeMedida?: string;
      valorIntegralInfracao?: number;
      origemPossuidorVeiculo?: number;
      descricaoOrigemPossuidorVeiculo?: string;
      tipoDocumentoPossuidor?: number;
      descricaoTipoDocumentoPossuidor?: string;
      numeroIdentificacaoPossuidor?: string;
      nomePossuidor?: string;
      /** Format: date-time */
      dataEmissaoNotificacaoAutuacao?: string;
      /** Format: date-time */
      dataLimiteDefesaAutuacao?: string;
      /** Format: date-time */
      dataAceiteUfJurisdicaoAutuacao?: string;
      indicadorNotificacaoEditalAutuacao?: boolean;
      /** Format: date-time */
      dataNotificacaoEditalAutuacao?: string;
      numeroNotificacaoPenalidade?: string;
      /** Format: date-time */
      dataEmissaoNotificacaoPenalidade?: string;
      /** Format: date-time */
      dataVencimentoNotificacaoPenalidade?: string;
      indicadorNotificacaoEditalPenalidade?: boolean;
      /** Format: date-time */
      dataNotificacaoEditalPenalidade?: string;
      /** Format: date-time */
      dataAceiteUfJurisdicaoPenalidade?: string;
      tipoPenalidade?: number;
      descricaoPenalidade?: string;
      nomeRealInfrator?: string;
      modeloCnhRealInfrator?: number;
      descricaoModeloCnhRealInfrator?: string;
      numeroRegistroCnhRealInfrator?: string;
      ufExpedicaoCnhRealCondutor?: string;
      /** Format: date-time */
      dataApresentacao?: string;
      indicadorStatusAnalisePontuacao?: string;
      descricaoStatusAnalisePontuacao?: string;
      codigoModeloCnhPontuada?: number;
      descricaoModeloCnhPontuada?: string;
      numeroRegistroCnhPontuada?: string;
      ufExpedicaoCnhPontuada?: string;
      /** Format: date-time */
      dataInclusaoExclusaoLote?: string;
      ufOrigemDesvinculacao?: string;
      indicadorMotivoDesvinculacao?: number;
      descricaoMotivoDesvinculacao?: string;
      /** Format: date-time */
      dataSolicitacaoDesvinculacao?: string;
      /** Format: date-time */
      dataAceiteUfRelacionada?: string;
      indicadorExigibilidade?: number;
      descricaoIndicadorExigibilidade?: string;
      ufPagamento?: string;
      /** Format: date-time */
      dataPagamentoInfracao?: string;
      valorPagoInfracao?: number;
      /** Format: date-time */
      dataRegistroPagamento?: string;
      quantidadePagamentos?: number;
      tipoOcorrencia?: number;
      descricaoTipoOcorrencia?: string;
      origemOcorrencia?: number;
      descricaoOrigemOcorrencia?: string;
      numeroProcesso?: string;
      /** Format: date-time */
      dataOcorrencia?: string;
      /** Format: date-time */
      dataRegistroOcorrencia?: string;
    };
    /**
     * @example {
     *       "quantidadeInfracoes": 1,
     *       "quantidadeInfracoesReal": 1,
     *       "idUltimoRegistro": 1,
     *       "infracoes": [
     *         {
     *           "placa": "ABC1D23",
     *           "numeroAutoInfracao": "A0001001",
     *           "codigoInfracao": "74550",
     *           "descricaoInfracao": "TRANSITAR EM VELOCIDADE SUPERIOR A MAXIMA",
     *           "descricaoOrgaoAutuador": "DER/SP",
     *           "ufOrgaoAutuador": "SP",
     *           "dataInfracao": "2024-03-12T14:20:00.000Z",
     *           "codigoMunicipioInfracao": "4106902",
     *           "descricaoMunicipioInfracao": "Curitiba",
     *           "valorIntegralInfracao": 130.16,
     *           "medicaoReal": 101,
     *           "limitePermitido": 60
     *         }
     *       ]
     *     }
     */
    InfracaoListResponse: {
      quantidadeInfracoes?: number;
      quantidadeInfracoesReal?: number;
      /** Format: int64 */
      idUltimoRegistro?: number;
      infracoes?: components['schemas']['Infracao'][];
    };
    InfracaoOcorrencia: {
      mapeamentoAutomatico?: boolean;
      ufOcorrencia?: string;
      tipoOcorrencia?: number;
      descricaoTipoOcorrencia?: string;
      origemOcorrencia?: string;
      descricaoOrigemOcorrencia?: string;
      /** Format: date-time */
      dataOcorrencia?: string;
      numeroProcesso?: string;
      /** Format: date-time */
      dataRegistroOcorrencia?: string;
      /** Format: date-time */
      dataAceiteUfRelacionada?: string;
      indicadorRegistroCancelamento?: number;
      descricaoIndicadorRegistroCancelamento?: string;
      /** Format: date-time */
      dataCancelamentoRegistro?: string;
      /** Format: date-time */
      dataAceiteUfRelacionada2?: string;
      indicadorRegistroReativacao?: number;
      descricaoIndicadorRegistroReativacao?: string;
      /** Format: date-time */
      dataRegistroReativacao?: string;
      /** Format: date-time */
      dataAceiteUfJurisdicao?: string;
    };
    InfracaoOcorrenciaResponse: {
      quantidade?: number;
      quantidadeReal?: number;
      ocorrencias?: components['schemas']['InfracaoOcorrencia'][];
    };
    InfracaoPagamento: {
      mapeamentoAutomatico?: boolean;
      ufPagamento?: string;
      numeroDocumentoArrecadacao?: string;
      /** Format: date-time */
      dataPagamentoInfracao?: string;
      valorPago?: number;
      codigoBanco?: number;
      codigoAgencia?: string;
      numeroTerminal?: number;
      numeroAutenticacao?: number;
      /** Format: date-time */
      dataCredito?: string;
      valorRepasse?: number;
      /** Format: date-time */
      dataRegistroPagamento?: string;
      /** Format: date-time */
      dataLancamentoPagamento?: string;
      indicadorRegistroCancelamento?: number;
      descricaoIndicadorRegistroCancelamento?: string;
      /** Format: date-time */
      dataCancelamentoPagamento?: string;
      /** Format: date-time */
      dataCancelamentoAceitePagamento?: string;
    };
    InfracaoPagamentoResponse: {
      quantidade?: number;
      quantidadeReal?: number;
      pagamentos?: components['schemas']['InfracaoPagamento'][];
    };
    IndicadorRestricaoJudicial: {
      indicadorTransferencia?: boolean;
      indicadorLicenciamento?: boolean;
      indicadorCirculacao?: boolean;
      indicadorPenhora?: boolean;
    };
    IndicadorSinistro: {
      indicadorMediaMonta?: boolean;
      indicadorGrandeMonta?: boolean;
      indicadorRecuperado?: boolean;
    };
    RestricaoJudicialItem: {
      mapeamentoAutomatico?: boolean;
      codigoTipoRestricao?: string;
      descricaoRestricao?: string;
      /** Format: date-time */
      dataInclusaoRestricao?: string;
      horaInclusaoRestricao?: string;
    };
    RestricaoJudicialProcesso: {
      mapeamentoAutomatico?: boolean;
      codigoTribunal?: string;
      nomeTribunal?: string;
      codigoOrgaoJudicial?: string;
      nomeOrgaoJudicial?: string;
      numeroProcesso?: string;
      enderecoLogradouro?: string;
      enderecoNumero?: string;
      enderecoComplemento?: string;
      enderecoBairrro?: string;
      enderecoMunicipio?: string;
      descricaoEnderecoMunicipio?: string;
      enderecoUf?: string;
      enderecoCep?: string;
      dddTelefone1?: string;
      telefone1?: string;
      dddTelefone2?: string;
      telefone2?: string;
      quantidadeRestricoesAtiva?: number;
      quantidadeRestricoesAtivas?: number;
      restricoesJudiciais?: components['schemas']['RestricaoJudicialItem'][];
    };
    RestricaoJudicialResponse: {
      quantidadeRetornada?: number;
      quantidadeReal?: number;
      /** Format: int64 */
      idUltimoRegistro?: number;
      processos?: components['schemas']['RestricaoJudicialProcesso'][];
    };
    RouboFurtoOcorrencia: {
      mapeamentoAutomatico?: boolean;
      chassi?: string;
      placa?: string;
      ufJurisdicao?: string;
      municipioEmplacamento?: string;
      marcaModelo?: string;
      cor?: string;
      anoModelo?: number;
      anoFabricacao?: number;
      codigoCategoriaOcorrencia?: string;
      descricaoCategoriaOcorrencia?: string;
      ufboletimOcorrencia?: string;
      codigoorgaoSeguranca?: string;
      descricaoorgaoSeguranca?: string;
      numeroboletimOcorrencia?: string;
      anoboletimOcorrencia?: number;
      codigomunicipioOcorrencia?: string;
      descricaomunicipioOcorrencia?: string;
      tipoDeclaracao?: string;
      descricaoTipoDeclaracao?: string;
      /** Format: date-time */
      dataOcorrencia?: string;
      tipoDocumentoInformante?: string;
      descricaoTipoDocumentoInformante?: string;
      numeroIdentificacaoInformante?: string;
      dddTelefoneContato?: string;
      numeroTelefoneContato?: string;
      ramalTelefoneContato?: string;
      nomeInformante?: string;
      numeroCentralAlarme?: number;
      /** Format: date-time */
      dataRegistroAlarme?: string;
      horaRegistroAlarme?: string;
    };
    RouboFurtoResponse: {
      quantidadeRetornada?: number;
      quantidadeReal?: number;
      /** Format: int64 */
      idUltimoRegistro?: number;
      ocorrenciasRouboFurto?: components['schemas']['RouboFurtoOcorrencia'][];
    };
    Veiculo: {
      mapeamentoAutomatico?: boolean;
      chassi?: string;
      placa?: string;
      codigoRenavam?: string;
      situacao?: string;
      codigoMunicipioEmplacamento?: string;
      descricaoMunicipioEmplacamento?: string;
      ufJurisdicao?: string;
      codigoRemarcacaoChassi?: string;
      descricaoRemarcacaoChassi?: string;
      codigoTipoVeiculo?: string;
      descricaoTipoVeiculo?: string;
      codigoMarcaModelo?: string;
      descricaoMarcaModelo?: string;
      codigoEspecieVeiculo?: string;
      descricaoEspecieVeiculo?: string;
      codigoTipoCarroceria?: string;
      descricaoTipoCarroceria?: string;
      codigoCor?: string;
      descricaoCor?: string;
      codigoCategoria?: string;
      descricaoCategoria?: string;
      anoModelo?: number;
      anoFabricacao?: number;
      potencia?: number;
      cilindradas?: number;
      codigoCombustivel?: string;
      descricaoCombustivel?: string;
      numeroMotor?: string;
      cmt?: number;
      pbt?: number;
      cmc?: number;
      procedencia?: string;
      numeroCambio?: string;
      codigoTipoProprietario?: string;
      descricaoTipoProprietario?: string;
      numeroIdentificacaoProprietario?: string;
      numeroCarroceria?: string;
      codigoRestricao1?: string;
      descricaoRestricao1?: string;
      codigoRestricao2?: string;
      descricaoRestricao2?: string;
      codigoRestricao3?: string;
      descricaoRestricao3?: string;
      codigoRestricao4?: string;
      descricaoRestricao4?: string;
      qtdEixos?: number;
      numeroEixoTraseiro?: string;
      numeroEixoAuxiliar?: string;
      nomeProprietario?: string;
      lotacao?: number;
      /** Format: date-time */
      dataEmissaoCrv?: string;
      naturezaImportacao?: string;
      descricaoDocImportador?: string;
      numeroIdImportador?: string;
      codigoOrgaoRfb?: string;
      descricaoOrgaoRfb?: string;
      registroAduaneiro?: string;
      numeroDeclaracaoImportacao?: string;
      /** Format: date-time */
      dataDistImportacao?: string;
      naturezaFaturamento?: string;
      tipoDocFaturado?: string;
      numeroIdFaturamento?: string;
      ufFaturado?: string;
      /** Format: date-time */
      dataLimite?: string;
      /** Format: date-time */
      dataUltimaAtualizacaoImportacao?: string;
      codigoTipoImportacao?: string;
      descricaoTipoImportacao?: string;
      numeroProcessoImportacao?: string;
      /** Format: date-time */
      dataBaixaImportacao?: string;
      codigoPaisTransferencia?: string;
      descricaoPaisTransferencia?: string;
      indicadorMultaRenainf?: boolean;
      indicadorComunicacaoVenda?: boolean;
      indicadorPendenciaEmissao?: boolean;
      indicadorRestricaoRenajud?: boolean;
      indicadorRecall1?: boolean;
      indicadorRecall2?: boolean;
      indicadorRecall3?: boolean;
      indicadorRecall4?: boolean;
      tipoDocProprietarioIndicado?: string;
      descricaoDocProprietarioIndicado?: string;
      numeroDocProprietarioIndicado?: string;
      /** Format: date-time */
      dataAtualizacaoMre?: string;
      indicadorSiniav?: boolean;
      codigoOrigemPropriedade?: string;
      indicadorRestricaoRfb?: string;
      descricaoRestricaoRfb?: string;
      indicadorLeilao?: boolean;
      indicadorRouboFurto?: boolean;
      indicadorAlarme?: boolean;
      codigoTipoArrendatario?: string;
      descricaoTipoArrendatario?: string;
      numeroIdentificacaoArrendatario?: string;
      nomeArrendatario?: string;
    };
    /**
     * @example {
     *       "quantidadeVeiculo": 1,
     *       "quantidadeVeiculoReal": 1,
     *       "idUltimoRegistro": 1,
     *       "veiculo": [
     *         {
     *           "placa": "ABC1D23",
     *           "chassi": "9BWZZZ377VT004251",
     *           "codigoRenavam": "00123456780",
     *           "anoFabricacao": 2018,
     *           "anoModelo": 2019,
     *           "codigoCor": "6",
     *           "descricaoCor": "PRATA",
     *           "codigoMarcaModelo": "852005",
     *           "descricaoMarcaModelo": "TOYOTA/COROLLA",
     *           "codigoMunicipioEmplacamento": "4314902",
     *           "descricaoMunicipioEmplacamento": "Porto Alegre",
     *           "ufJurisdicao": "RS",
     *           "nomeProprietario": "MARIA SILVA SANTOS",
     *           "indicadorAlarme": false,
     *           "situacao": "CIRCULACAO"
     *         }
     *       ]
     *     }
     */
    VeiculoListResponse: {
      quantidadeVeiculo?: number;
      quantidadeVeiculoReal?: number;
      /** Format: int64 */
      idUltimoRegistro?: number;
      veiculo?: components['schemas']['Veiculo'][];
    };
    CodigoSegurancaCrv: {
      mapeamentoAutomatico?: boolean;
      numeroSegurancaCrv?: number;
      viaDocumento?: string;
      codigoRenavam?: string;
      nomeProprietario?: string;
      codigoTipoProprietario?: string;
      descricaoTipoProprietario?: string;
      numeroIdentificacaoProprietario?: string;
      placa?: string;
      chassi?: string;
      codigoEspecieVeiculo?: string;
      descricaoEspecieVeiculo?: string;
      codigoTipoVeiculo?: string;
      descricaoTipoVeiculo?: string;
      codigoCombustivel?: string;
      descricaoCombustivel?: string;
      codigoMarcaModelo?: string;
      descricaoMarcaModelo?: string;
      anoFabricacao?: number;
      anoModelo?: number;
      codigoCor?: string;
      descricaoCor?: string;
      ufExpedidora?: string;
      codigoMunicipio?: string;
      descricaoMunicipio?: string;
      /** Format: date-time */
      dataEmissaoCrv?: string;
      codigoRestricao1?: string;
      descricaoRestricao1?: string;
      codigoRestricao2?: string;
      descricaoRestricao2?: string;
      codigoRestricao3?: string;
      descricaoRestricao3?: string;
      codigoRestricao4?: string;
      descricaoRestricao4?: string;
      indicadorComunicacaoVenda?: boolean;
      indicadorRestricaoRenajud?: boolean;
      indicadorInfracaoInterestadual?: boolean;
      indicadorRouboFurto?: boolean;
      indicadorAlarme?: boolean;
    };
    ComunicacaoVenda: {
      mapeamentoAutomatico?: boolean;
      placa?: string;
      renavam?: string;
      numeroIdentificacaoProprietario?: string;
      /** Format: date-time */
      dataVenda?: string;
      /** Format: date-time */
      dataRegistroVenda?: string;
      tipoIdentificacaoComprador?: string;
      numeroIdentificacaoComprador?: string;
      nomeComprador?: string;
    };
    EnderecoPossuidor: {
      mapeamentoAutomatico?: boolean;
      origemPossuidor?: string;
      descricaoOrigemPossuidor?: string;
      tipoDocumentoPossuidor?: string;
      descricaoDocumentoPosssuidor?: string;
      numeroDocumentoPossuidor?: string;
      nomePossuidor?: string;
      enderecoLogradouro?: string;
      enderecoNumero?: string;
      enderecoComplemento?: string;
      enderecoBairrro?: string;
      enderecoMunicipio?: string;
      descricaoEnderecoMunicipio?: string;
      enderecoUf?: string;
      enderecoCep?: string;
    };
    MultaInterestadual: {
      mapeamentoAutomatico?: boolean;
      placa?: string;
      renavam?: string;
      numeroIdentificacaoProprietario?: string;
      codigoOrgaoAutuador?: string;
      descricaoOrgaoAutuador?: string;
      numeroAutoInfracao?: string;
      codigoInfracao?: string;
      codigoDesdobramentoInfracao?: string;
      descricaoInfracao?: string;
      /** Format: date-time */
      dataInfracao?: string;
      horaInfracao?: string;
      localOcorrenciaInfracao?: string;
      codigoRenainf?: string;
      valorMulta?: number;
      /** Format: date-time */
      dataVencimento?: string;
    };
    MultaInterestadualResponse: {
      quantidade?: number;
      quantidadeReal?: number;
      multas?: components['schemas']['MultaInterestadual'][];
    };
    Recall: {
      mapeamentoAutomatico?: boolean;
      nome?: string;
      descricao?: string;
      /** Format: date-time */
      dataRegistro?: string;
    };
    RecallResponse: {
      quantidade?: number;
      quantidadeReal?: number;
      recalls?: components['schemas']['Recall'][];
    };
    ConsultaCsv: {
      numeroCertificado?: string;
      indicadorCSVLegado?: number;
      indicadorStatusCSVLegado?: string;
      indicadorAutorizado?: string;
      dataHoraRecepcao?: string;
      nomeTipoCSV?: string;
      indicadorAprovadoCSV?: string;
      registroCSV?: string;
      inspecaoCSV?: string;
      validadeCSV?: string;
      indicadorCancelamentoSISCSV?: number;
      dataHoraCancelamentoSISCV?: string;
      motivoCancelamento?: string;
      descricaoMotivoCancelamento?: string;
      dataHoraCancelamentoRenavam?: string;
      identificacaoUnicaRenavam?: string;
      chassi?: string;
      placa?: string;
      ufJurisdicao?: string;
      codigoRenavam?: string;
      chassiOrigem?: string;
      placaOrigem?: string;
      numeroSeqDocCRVOrigem?: string;
      chassiCSV?: string;
      codigoMarcaModeloCSV?: string;
      codigoTipoVeiculoCSV?: string;
      codigoTipoCarroceriaCSV?: string;
      potenciaCSV?: number;
      cilindradasCSV?: number;
      lotacaoCSV?: number;
      codigoCombustivel?: string;
      codigoCorVeiculoCSV?: string;
      pbtCSV?: number;
      cmcCSV?: number;
      cmtCSV?: number;
      numeroIdentificacaoProprietarioCSV?: string;
      codigoMunicipioProprietarioCSV?: string;
      ufMunicipioProprietarioCSV?: string;
      numeroSequencialCRVAlteracao?: string;
      dataHoraRegistroCRV?: string;
      indicadorUtilizadorRENAVAM?: number;
      numeroEscopo1?: string;
      numeroEscopo2?: string;
      numeroEscopo3?: string;
      numeroEscopo4?: string;
      numeroEscopo5?: string;
      numeroEscopo6?: string;
      numeroEscopo7?: string;
      numeroEscopo8?: string;
      numeroEscopo9?: string;
      numeroEscopo10?: string;
      numeroAutorizacao1?: string;
      numeroAutorizacao2?: string;
      numeroAutorizacao3?: string;
      numeroAutorizacao4?: string;
      numeroAutorizacao5?: string;
      numeroAutorizacao6?: string;
      numeroAutorizacao7?: string;
      numeroAutorizacao8?: string;
      numeroAutorizacao9?: string;
      numeroAutorizacao10?: string;
    };
    ConsultaCsvList: components['schemas']['ConsultaCsv'][];
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
    /** @description Consulta é feita a partir do registro com o id informado nesse campo */
    IdUltimoRegistro: number;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  getAlteracoesPermitidas: {
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
          'application/json': components['schemas']['AlteracaoPermitidaList'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByCpf: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Consulta condutores por CPF */
        cpf: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByCpfAndRegistroCnh: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Consulta condutores por CPF */
        cpf: string;
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistroCnh: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByFormularioRenach: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do formulário RENACH */
        formularioRenach: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutorImagensByCpfRegistroCnhSeguranca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Consulta condutores por CPF */
        cpf: string;
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistro: string;
        /** @description Número gerado a partir de algoritmo específico e de propriedade do DENATRAN, composto pelos dados individuais de cada CNH, permitindo a validação da CNH emitida */
        numeroSeguranca: string;
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
          'application/json': components['schemas']['CondutorImagem'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByImpedimento: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do documento gerador do impedimento */
        impedimento: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutorInfracoesByRegistroCnh: {
    parameters: {
      query?: {
        /** @description Data inicial em que pode ter ocorrido a infração de trânsito. */
        dataInicio?: string;
        /** @description Data final em que pode ter ocorrido a infração de trânsito. */
        dataFim?: string;
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistroCnh: string;
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
          'application/json': components['schemas']['CondutorInfracaoExtrato'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByDadosIdentificatorios: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Nome do condutor */
        nomeCondutor: string;
        /** @description Data de nascimento do condutor */
        dataNascimento: string;
        /** @description Nome da mãe do condutor */
        nomeMae: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByPgu: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do Prontuário Geral Unificado */
        pgu: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByPid: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do PID (Permissão Internacional para Dirigir) */
        pid: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutoresByRegistroCnh: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistroCnh: string;
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
          'application/json': components['schemas']['CondutorListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutorRetratoByCpfRegistroCnhSeguranca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Consulta condutores por CPF */
        cpf: string;
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistro: string;
        /** @description Número gerado a partir de algoritmo específico e de propriedade do DENATRAN, composto pelos dados individuais de cada CNH, permitindo a validação da CNH emitida */
        numeroSeguranca: string;
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
          'application/json': components['schemas']['CondutorImagem'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getCondutorValidacaoByCpfRegistroCnhSeguranca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Consulta condutores por CPF */
        cpf: string;
        /** @description Número gerado pela BINCO para identificar o condutor */
        numeroRegistro: string;
        /** @description Número gerado a partir de algoritmo específico e de propriedade do DENATRAN, composto pelos dados individuais de cada CNH, permitindo a validação da CNH emitida */
        numeroSeguranca: string;
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
          'application/json': components['schemas']['CondutorImagem'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getConsultaCsvByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['ConsultaCsvList'];
        };
      };
      /** @description Sem conteúdo. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getConsultaCsvByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['ConsultaCsvList'];
        };
      };
      /** @description Sem conteúdo. */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorAlarmeByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': boolean;
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorAlarmeByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': boolean;
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorRestricaoJudicialByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['IndicadorRestricaoJudicial'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorRestricaoJudicialByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['IndicadorRestricaoJudicial'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorRouboFurtoByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': boolean;
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorRouboFurtoByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': boolean;
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorSinistroByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['IndicadorSinistro'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getIndicadorSinistroByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['IndicadorSinistro'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByAit: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código do órgão autuador */
        orgao: string;
        /** @description Número do auto de Infração. */
        autoInfracao: string;
        /** @description Código da infração */
        codigoInfracao: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByCnpj: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CNPJ do condutor/proprietário */
        cnpj: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByCpf: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CPF do condutor/proprietário */
        cpf: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByHabilitacaoEstrangeira: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Identificação da habilitação estrangeira */
        identificacao: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracaoOcorrenciasByAit: {
    parameters: {
      query?: {
        /** @description Data inicial em que pode ter ocorrido a infração de trânsito. */
        dataInicio?: string;
        /** @description Data final em que pode ter ocorrido a infração de trânsito. */
        dataFim?: string;
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código do órgão autuador */
        orgao: string;
        /** @description Número do auto de Infração. */
        autoInfracao: string;
        /** @description Código da infração */
        codigoInfracao: string;
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
          'application/json': components['schemas']['InfracaoOcorrenciaResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracaoPagamentosByAit: {
    parameters: {
      query?: {
        /** @description Data inicial em que pode ter ocorrido o pagamento da infração de trânsito. */
        dataInicio?: string;
        /** @description Data final em que pode ter ocorrido o pagamento da infração de trânsito. */
        dataFim?: string;
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código do órgão autuador */
        orgao: string;
        /** @description Número do auto de Infração. */
        autoInfracao: string;
        /** @description Código da infração */
        codigoInfracao: string;
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
          'application/json': components['schemas']['InfracaoPagamentoResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByPguAndUf: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do Prontuário Geral Unificado */
        pgu: string;
        /** @description Unidade da Federação */
        uf: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByPlacaAndExigibilidade: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Situação de exigibilidade da infração */
        situacaoExigibilidade: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByRegistroCnh: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número gerado pela BINCO para identificar o condutor */
        cnh: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getInfracoesByRenainf: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número RENAINF da infração */
        numeroRenainf: string;
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
          'application/json': components['schemas']['InfracaoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getRestricoesJudiciaisAtivasByPlaca: {
    parameters: {
      query?: {
        /** @description Data inicial da inclusão da restrição judicial */
        dataInicio?: string;
        /** @description Data final da inclusão da restrição judicial */
        dataFim?: string;
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['RestricaoJudicialResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getRestricoesJudiciaisAtivasByPlacaAndRenavam: {
    parameters: {
      query?: {
        /** @description Data inicial da inclusão da restrição judicial */
        dataInicio?: string;
        /** @description Data final da inclusão da restrição judicial */
        dataFim?: string;
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['RestricaoJudicialResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getRouboFurtoEmAbertoByChassi: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['RouboFurtoResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getRouboFurtoEmAbertoByPlaca: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['RouboFurtoResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByCambio: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do câmbio do veículo */
        cambio: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByChassi: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoCodigoSegurancaCrvByCnpj: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número de segurança CRV que será validado */
        codigoSegurancaCrv: string;
        /** @description Número do CNPJ do proprietário */
        cnpj: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['CodigoSegurancaCrv'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoCodigoSegurancaCrvByCpf: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número de segurança CRV que será validado */
        codigoSegurancaCrv: string;
        /** @description Número do CPF do proprietário */
        cpf: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['CodigoSegurancaCrv'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getComunicacaoVendaByCnpj: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CNPJ do proprietário */
        cnpj: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['ComunicacaoVenda'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getComunicacaoVendaByCpf: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CPF do proprietário */
        cpf: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['ComunicacaoVenda'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getEnderecoPossuidorByPlaca: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['EnderecoPossuidor'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getEnderecoPossuidorByPlacaAndRenavam: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['EnderecoPossuidor'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByMotor: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do motor do veículo */
        motor: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getMultaInterestadualByCnpj: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CNPJ do proprietário */
        cnpj: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['MultaInterestadualResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getMultaInterestadualByCpf: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CPF do proprietário */
        cpf: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['MultaInterestadualResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByPlaca: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByProprietarioCnpjChassiRenavam: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CNPJ do proprietário */
        cnpj: string;
        /** @description Chassi do veículo */
        chassi: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['Veiculo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByProprietarioCnpjPlacaRenavam: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CNPJ do proprietário */
        cnpj: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['Veiculo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculosByProprietarioCnpj: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Identificação única do proprietário (CNPJ) */
        identificacao: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByProprietarioCpfChassiRenavam: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CPF do proprietário */
        cpf: string;
        /** @description Chassi do veículo */
        chassi: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['Veiculo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByProprietarioCpfPlacaRenavam: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Número do CPF do proprietário */
        cpf: string;
        /** @description Código que identifica externamente um veículo (a nível nacional) */
        placa: string;
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['Veiculo'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculosByProprietarioCpf: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Identificação única do proprietário (CPF) */
        identificacao: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoRecallByChassi: {
    parameters: {
      query?: never;
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Chassi do veículo */
        chassi: string;
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
          'application/json': components['schemas']['RecallResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
  getVeiculoByRenavam: {
    parameters: {
      query?: {
        /** @description Consulta é feita a partir do registro com o id informado nesse campo */
        idUltimoRegistro?: components['parameters']['IdUltimoRegistro'];
      };
      header: {
        /** @description CPF do usuário que está fazendo a requisição */
        'x-cpf-usuario': components['parameters']['XCpfUsuario'];
      };
      path: {
        /** @description Código que identifica a inscrição no Registro Nacional de Veículos Automotores */
        renavam: string;
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
          'application/json': components['schemas']['VeiculoListResponse'];
        };
      };
      400: components['responses']['BadRequest'];
      401: components['responses']['Unauthorized'];
      402: components['responses']['BusinessError'];
      404: components['responses']['NotFound'];
      500: components['responses']['ServerError'];
    };
  };
}
