# Casos de uso da API SENATRAN no ecossistema DETRAN-AM

**NYX Knowledge (NYXK)** · DETRAN-AM · Processo de homologação · Agosto de 2026

Este documento relaciona, por domínio, os usos que as aplicações do ecossistema fazem — ou
precisarão fazer — das interfaces oficiais da SENATRAN. Cada linha descreve o caso de uso na
aplicação, a operação necessária em linguagem funcional, a natureza da chamada e o dispositivo
normativo que a exige.

---

## Sobre a descrição das operações

Ainda não dispomos da documentação oficial das interfaces. Por isso, as operações estão descritas
por **função pretendida** — "submissão de auto de infração", "envio de resultado de exame médico" —
e não por caminho, verbo ou esquema de dados. Onde a natureza da operação impõe requisitos técnicos
(idempotência, reenvio seguro, processamento assíncrono), isso está declarado, pois define como
construímos o cliente e como pretendemos nos comportar em produção.

O desenho atual foi validado contra uma réplica interna construída a partir das convenções públicas
conhecidas. Divergências em relação ao contrato oficial são esperadas e serão absorvidas no
adaptador, sem alteração das aplicações.

### Legenda de natureza

| Marcador      | Significado                               |
| ------------- | ----------------------------------------- |
| `consulta`    | leitura, sem efeito de estado             |
| `mutação`     | cria ou altera registro nacional          |
| `idempotente` | reenvio seguro com chave determinística   |
| `assíncrono`  | aceite com protocolo e apuração posterior |

---

## Contexto — quem consome e por quê

O ecossistema é composto por seis aplicações que cobrem, de ponta a ponta, o ciclo de vida do
trânsito no âmbito do órgão executivo estadual: lavratura em campo, processo administrativo de
infração, recursos, registro de sinistros, aptidão do condutor e atendimento ao cidadão. Nenhuma
delas conversa diretamente com a SENATRAN: todo o tráfego atravessa um adaptador único, que
concentra credenciais, política de reenvio, chaves de idempotência e trilha de auditoria.

Esse desenho tem consequência direta para a homologação: **o ponto de integração a ser homologado é
um só**, com comportamento uniforme, independentemente de quantas aplicações estejam em operação.

| Aplicação                           | Papel no ecossistema                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| **TEAT** · talonário eletrônico     | Lavratura do auto em campo, com operação offline, numeração controlada e evidências |
| **RAIT** · recursos administrativos | Defesa prévia, penalidade, JARI e CETRAN, com prazos vigiados                       |
| **BOAT** · sinistros                | Boletim de acidentalidade em campo e por instituições parceiras                     |
| **PEC** · aptidão do condutor       | Exame médico e avaliação psicológica em clínicas credenciadas                       |
| **PORTAL** · cidadão                | Consultas, adesão à notificação eletrônica, defesa, recurso e pagamento             |
| **DASHBOARD** · operação            | Vigilância de prazos legais e da saúde das integrações                              |

---

## 1. Infrações — `RENAINF`

Consumido por **TEAT · RAIT · PORTAL**

| Nº     | Caso de uso na aplicação                               | Aplicação            | Operação necessária                                                                                                                                                                                          | Natureza                | Base normativa                                                             |
| ------ | ------------------------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | -------------------------------------------------------------------------- |
| INF-01 | Agente lavra o auto de infração em campo               | TEAT                 | **Submissão de auto de infração** lavrado em dispositivo homologado, individual ou em lote, com número de série reservado, enquadramento, local, evidências referenciadas por hash e identificação do agente | `mutação` `idempotente` | CTB art. 280-281 · Res. CONTRAN 918/2022 art. 3º · Port. SENATRAN 997/2022 |
| INF-02 | Dispositivo reserva numeração antes de sair para a rua | TEAT                 | **Reserva e sincronização de faixas de numeração de AIT**, com devolução do intervalo concedido, prazo de validade e baixa dos números efetivamente consumidos                                               | `mutação` `consulta`    | Port. SENATRAN 997/2022 — operação offline                                 |
| INF-03 | Registro e sincronização do talonário                  | TEAT                 | **Sincronização de dispositivos e sessões**: registro do par dispositivo/versão homologada, abertura e encerramento de sessão do agente, e sinalização de concorrência entre dispositivos                    | `mutação`               | Port. SENATRAN 997/2022 — sessão exclusiva por dispositivo                 |
| INF-04 | Auto lavrado com inconsistência é cancelado            | TEAT · RAIT          | **Solicitação de cancelamento de auto**, com motivo estruturado e identificação da autoridade que determinou o cancelamento                                                                                  | `mutação` `idempotente` | CTB art. 281, § 1º                                                         |
| INF-05 | Abertura e acompanhamento do processo administrativo   | RAIT                 | **Abertura de processo administrativo de infração** e consulta de sua situação, com o vínculo ao auto que lhe deu origem                                                                                     | `mutação` `consulta`    | CTB arts. 281-282 · Res. 918/2022 arts. 4º e 9º                            |
| INF-06 | Notificação da autuação é expedida                     | RAIT                 | **Registro da notificação de autuação**, com data de expedição e a data-limite de defesa que passa a correr                                                                                                  | `mutação` `idempotente` | Res. 918/2022 art. 4º — prazo de 30 dias                                   |
| INF-07 | Proprietário indica o real condutor infrator           | PORTAL → RAIT        | **Submissão de indicação de condutor**, com os dados do condutor apontado e a confirmação de aceite ou recusa, para que a indicação produza efeito e fique disponível à averiguação de reincidência          | `mutação` `idempotente` | Res. 918/2022 art. 5º e § 6º — registro no RENACH                          |
| INF-08 | Interessado apresenta defesa prévia                    | PORTAL → RAIT        | **Submissão de defesa da autuação**, com identificação do requerente, um único auto por requerimento e referência aos anexos por metadados (nome, tipo, hash) — os arquivos permanecem sob custódia do órgão | `mutação` `idempotente` | Res. CONTRAN 900/2022 · Res. 918/2022 art. 9º                              |
| INF-09 | Penalidade é aplicada e notificada                     | RAIT                 | **Registro de aplicação de penalidade** e **registro da notificação da penalidade**, com valor, data-limite de recurso e de pagamento                                                                        | `mutação` `idempotente` | Res. 918/2022 arts. 9º § 2º e 12                                           |
| INF-10 | Interessado interpõe recurso à JARI ou ao CETRAN       | PORTAL → RAIT        | **Submissão de recurso**, com a instância a que se dirige e o vínculo ao recurso anterior quando for segunda instância                                                                                       | `mutação` `idempotente` | CTB arts. 285-289 · Res. 918/2022 arts. 15-16                              |
| INF-11 | Colegiado julga e a decisão é comunicada               | RAIT                 | **Registro do julgamento do recurso**, com resultado, fundamentação e referência à decisão assinada digitalmente — e, no encerramento da instância, a liberação para registro da penalidade no prontuário    | `mutação` `idempotente` | CTB arts. 285-290 · Res. 918/2022 arts. 17-18                              |
| INF-12 | Cidadão e analista acompanham o processo               | RAIT · PORTAL        | **Consulta de processo, recurso e histórico de julgamento**, para exibir a situação real ao interessado e instruir a instância seguinte sem exigir dele documento que o órgão já possui                      | `consulta`              | CTB art. 285 § 4º · Lei 13.460/2017 art. 5º                                |
| INF-13 | Cidadão consulta e quita o débito                      | PORTAL               | **Consulta de débito da infração** e **registro do pagamento**, com a faixa de desconto aplicável e o efeito do recurso pendente sobre a exigibilidade                                                       | `consulta` `mutação`    | CTB art. 284 · Res. 918/2022 arts. 20-23                                   |
| INF-14 | Consulta de infrações por diversos critérios           | TEAT · RAIT · PORTAL | **Consulta de infrações** por número do auto, placa, CPF ou CNPJ, registro de habilitação e órgão autuador, incluindo ocorrências e pagamentos associados                                                    | `consulta`              | CTB art. 257 · Res. 918/2022                                               |
| INF-15 | Infração cometida fora da UF de registro               | RAIT                 | **Encaminhamento interestadual** de defesa ou recurso protocolado no órgão de domicílio do interessado ao órgão autuador competente                                                                          | `mutação`               | CTB art. 287 — protocolo no órgão de domicílio                             |

---

## 2. Sinistros de trânsito — `RENAEST`

Consumido por **BOAT · DASHBOARD**

| Nº     | Caso de uso na aplicação                | Aplicação        | Operação necessária                                                                                                                                                                                                           | Natureza                             | Base normativa                                         |
| ------ | --------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| EST-01 | Agente registra o sinistro na cena      | BOAT             | **Submissão de boletim de sinistro**, com local, dinâmica, veículos, pessoas e vítimas, classificado por gravidade, individual ou em lote — a submissão pode ocorrer horas após o fato, por indisponibilidade de rede na cena | `mutação` `idempotente` `assíncrono` | CTB art. 326-A · Res. CONTRAN 808/2020                 |
| EST-02 | Dados chegam depois do registro inicial | BOAT             | **Complementação de sinistro já submetido**, para o caso em que a informação só existe depois: identificação de envolvido, evolução do quadro de uma vítima, laudo posterior                                                  | `mutação` `idempotente`              | Res. 808/2020 — consolidação estadual                  |
| EST-03 | Erro material é corrigido               | BOAT             | **Correção de sinistro**, preservando o registro original e a autoria da correção                                                                                                                                             | `mutação` `idempotente`              | Res. 808/2020 art. 4º § 3º — atestação de consistência |
| EST-04 | Coordenador acompanha a validação       | BOAT · DASHBOARD | **Consulta de sinistro por identificador ou protocolo**, com a situação na cadeia de validação e o motivo em caso de rejeição                                                                                                 | `consulta`                           | Res. 808/2020 arts. 8º-9º — validação em três níveis   |
| EST-05 | Busca operacional de sinistros          | BOAT · DASHBOARD | **Consulta de sinistros por critérios** — placa, CPF de condutor, período, órgão — para reconciliar pendências e evitar registro duplicado                                                                                    | `consulta`                           | Res. 808/2020 — estatística e gestão                   |
| EST-06 | Verificação de histórico do veículo     | BOAT · TEAT      | **Consulta de indicador de sinistro** por placa ou chassi, para checar antecedente relevante ao atendimento                                                                                                                   | `consulta`                           | Res. 808/2020                                          |

---

## 3. Condutor e habilitação — `RENACH`

Consumido por **PEC · PORTAL**

| Nº    | Caso de uso na aplicação                    | Aplicação    | Operação necessária                                                                                                                                                                                                                                              | Natureza                | Base normativa                              |
| ----- | ------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| CH-01 | Abertura do processo de habilitação         | PEC          | **Abertura de processo de habilitação** para o candidato, com o tipo de processo, e recuperação do número do processo quando ele já existir — hoje tratamos a reabertura como retorno idempotente, não como erro                                                 | `mutação` `idempotente` | CTB art. 147 · Res. CONTRAN 789/2020        |
| CH-02 | Verificação de elegibilidade antes do exame | PEC          | **Consulta de elegibilidade para exame**, indicando se a etapa é devida, se há impedimento e se o exame toxicológico exigido está válido                                                                                                                         | `consulta`              | Res. CONTRAN 927/2022 · Res. 923/2022       |
| CH-03 | Distribuição do candidato à clínica         | PEC          | **Consulta de clínicas e profissionais credenciados**, com situação do credenciamento e especialidade — é o insumo do sorteio imparcial exigido pela norma do conselho                                                                                           | `consulta`              | Res. 927/2022 · Res. CFM 1.636/2002 art. 3º |
| CH-04 | Agendamento e comparecimento                | PEC          | **Registro de agendamento e de check-in** do candidato na clínica, com data, unidade e profissional responsável                                                                                                                                                  | `mutação` `idempotente` | Res. 927/2022                               |
| CH-05 | Perito conclui o exame médico               | PEC          | **Envio de resultado de exame médico**, com o resultado no vocabulário oficial — apto, apto com restrições, inapto temporário ou inapto —, os códigos de restrição aplicáveis e a referência ao laudo assinado digitalmente, que permanece sob custódia do órgão | `mutação` `idempotente` | CTB art. 147 · Res. 927/2022 arts. 8º-9º    |
| CH-06 | Psicólogo conclui a avaliação               | PEC          | **Envio de resultado de avaliação psicológica**, no mesmo formato de resultado e com a mesma referência ao laudo assinado                                                                                                                                        | `mutação` `idempotente` | Res. 927/2022 · Res. CFP 01/2019            |
| CH-07 | Laudo é retificado por adendo               | PEC          | **Envio de retificação de resultado**, que referencia o resultado original sem apagá-lo — o laudo é imutável e a correção se faz por adendo                                                                                                                      | `mutação` `idempotente` | Res. CFM 1.636/2002 · Lei 13.787/2018       |
| CH-08 | Candidato recorre à junta                   | PEC          | **Encaminhamento à junta** e **envio do parecer da junta**, identificando a instância — junta local, instância recursal e junta especial de saúde — e o resultado que prevalece                                                                                  | `mutação` `idempotente` | Res. 927/2022 arts. 12-15 — três instâncias |
| CH-09 | Identificação do condutor no atendimento    | PEC · PORTAL | **Consulta de condutor e de habilitação** por CPF, registro, PGU ou número do formulário, incluindo situação da CNH e impedimentos                                                                                                                               | `consulta`              | CTB art. 147 § 1º — pessoalidade do ato     |
| CH-10 | Validação de presença do candidato          | PEC          | **Consulta de imagem e de dados biométricos do condutor** e **validação de segurança da habilitação**, para confirmar que quem se apresenta é quem diz ser antes de iniciar o exame                                                                              | `consulta`              | Port. SENATRAN 968/2022 e 495/2025          |

---

## 4. Notificação eletrônica — `SNE`

Consumido por **PORTAL · RAIT**

| Nº     | Caso de uso na aplicação                  | Aplicação     | Operação necessária                                                                                                                                              | Natureza                | Base normativa                             |
| ------ | ----------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------ |
| SNE-01 | Verificar se há adesão antes de notificar | RAIT · PORTAL | **Consulta de adesão** por veículo, cidadão ou órgão — define se a notificação seguirá por meio eletrônico ou postal                                             | `consulta`              | Res. CONTRAN 931/2022                      |
| SNE-02 | Cidadão adere pelo portal                 | PORTAL        | **Registro de adesão do cidadão** e seu cancelamento, com a data de vigência a partir da qual a ciência eletrônica passa a valer                                 | `mutação` `idempotente` | Res. 931/2022 · CTB art. 282-A             |
| SNE-03 | Notificação enviada por meio eletrônico   | RAIT          | **Envio de notificação de autuação e de penalidade pelo canal eletrônico**, com retorno do protocolo que comprova a expedição e dispensa a publicação por edital | `mutação` `idempotente` | Res. 931/2022 · Res. 918/2022 art. 14 § 4º |
| SNE-04 | Comprovar a ciência em processo           | RAIT          | **Consulta de notificação por protocolo**, para instruir o processo com a data de ciência efetiva ou ficta, da qual dependem todos os prazos seguintes           | `consulta`              | Res. 931/2022 — ciência em 30 dias         |
| SNE-05 | Notificação indevida é cancelada          | RAIT          | **Cancelamento de notificação eletrônica**, com motivo, quando o ato que a originou é desfeito                                                                   | `mutação` `idempotente` | Res. 931/2022                              |

---

## 5. Canal do cidadão — `CDT`

Consumido por **PORTAL**

| Nº     | Caso de uso na aplicação                               | Aplicação | Operação necessária                                                                                                                                                                                                                                                                                                                                     | Natureza                | Base normativa                            |
| ------ | ------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| CDT-01 | Cidadão vê sua situação consolidada                    | PORTAL    | **Consulta consolidada do cidadão**: notificações pendentes, infrações, veículos vinculados e situação da habilitação, a partir do CPF autenticado                                                                                                                                                                                                      | `consulta`              | Lei 13.460/2017 · Lei 14.129/2021         |
| CDT-02 | Cidadão consulta valor a pagar                         | PORTAL    | **Consulta de pagamento da infração**, com valor com e sem desconto, vencimento e disponibilidade de documento de arrecadação                                                                                                                                                                                                                           | `consulta`              | CTB art. 284 · Res. 918/2022 arts. 20-21  |
| CDT-03 | Cidadão reconhece a infração para obter desconto       | PORTAL    | **Registro do reconhecimento da infração** — ato que concede a faixa de desconto e implica renúncia à defesa e ao recurso, e que por isso precisa ser registrado de forma inequívoca e rastreável                                                                                                                                                       | `mutação` `idempotente` | CTB art. 284 § 1º · Res. 918/2022 art. 21 |
| CDT-04 | Cidadão protocola defesa ou recurso pelo canal digital | PORTAL    | **Submissão de defesa ou recurso originada no canal do cidadão.** _Necessidade identificada:_ a norma admite o protocolo eletrônico e remete o rito via notificação eletrônica a regulamentação específica; caso a interface oficial não ofereça essa entrada, o protocolo permanecerá no canal do órgão e apenas o resultado será refletido ao cidadão | `mutação` `idempotente` | Res. 900/2022 arts. 6º § 4º e 12          |

---

## 6. Consultas de base — `WSDenatran`

Consumido por **todas as aplicações**

| Nº     | Caso de uso na aplicação                          | Aplicação         | Operação necessária                                                                                                                                                     | Natureza             | Base normativa                                |
| ------ | ------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------- |
| BAS-01 | Agente identifica o veículo abordado              | TEAT · BOAT       | **Consulta de veículo** por placa, chassi, RENAVAM ou motor, com característica, situação e dados do proprietário — insumo obrigatório do auto e do boletim de sinistro | `consulta`           | CTB art. 280 — dados mínimos do auto          |
| BAS-02 | Agente verifica alerta antes da abordagem         | TEAT · BOAT       | **Consulta de indicadores do veículo**: roubo e furto, restrição judicial, alarme e sinistro — decisão operacional que antecede o contato com o condutor                | `consulta`           | segurança da operação em campo                |
| BAS-03 | Agente identifica o condutor                      | TEAT              | **Consulta de condutor e de habilitação** por CPF ou registro, com situação, categoria, validade e impedimentos                                                         | `consulta`           | CTB art. 280, IV · Res. 918/2022 art. 3º § 4º |
| BAS-04 | Cidadão consulta sua pontuação                    | PORTAL            | **Consulta de infrações do condutor** pelo registro de habilitação, para exibir a pontuação e o efeito de cada processo em curso                                        | `consulta`           | CTB art. 259 · Lei 13.460/2017                |
| BAS-05 | Verificação de titularidade e de venda comunicada | RAIT              | **Consulta de comunicação de venda e de endereço do possuidor**, que define a quem a notificação deve ser dirigida e quem responde pela infração                        | `consulta`           | Res. 918/2022 arts. 6º e 32                   |
| BAS-06 | Roteamento de operação para outra UF              | RAIT · BOAT · PEC | **Encaminhamento por unidade federativa** das operações que envolvem veículo ou condutor registrado em outro órgão executivo estadual                                   | `consulta` `mutação` | CTB art. 287                                  |

---

## Requisitos transversais — como pretendemos nos comportar em produção

Os itens abaixo não são pedidos de funcionalidade: são compromissos de comportamento do nosso
cliente de integração, que submetemos à avaliação porque afetam diretamente a carga e a integridade
dos dados na base nacional.

**Idempotência em toda mutação.** Cada operação que cria ou altera registro nacional carrega chave
determinística derivada do ato de origem. Um reenvio após falha de rede não gera duplicidade;
quando o registro já existe, tratamos como sucesso e recuperamos o identificador, sem repetir o
efeito.

**Reenvio contido.** Retentativa com espera progressiva e disjuntor por superfície: falhas
sucessivas interrompem o envio em vez de amplificar a carga. Nada é reenviado indefinidamente.

**Publicação transacional.** O envio à base nacional é decidido na mesma transação do ato local que
o originou, com fila própria e ordem preservada — não há ato local sem contrapartida registrada,
nem envio de ato que não se consumou.

**Operação offline no campo.** Agentes operam sem rede por períodos longos. A submissão ocorre na
sincronização, com o momento real do fato preservado — daí a importância da numeração previamente
reservada.

**Credenciamento e trilha.** Certificado do órgão e identificação do operador em cada chamada, com
registro auditável de quem originou o ato, quando e sob qual sessão de dispositivo.

**Ambiente de homologação.** Solicitamos ambiente com dados fictícios para exercitar os fluxos de
ponta a ponta, incluindo os caminhos de erro. Hoje usamos réplica interna; ela não substitui a
validação oficial.

> **Volumetria.** A ordem de grandeza depende de dados operacionais do DETRAN-AM — efetivo de
> agentes em campo, autos por mês, exames por mês e base de veículos e condutores do estado. Será
> consolidada com o órgão e apresentada antes dos testes de homologação, junto às janelas de maior
> concentração de tráfego (turnos de fiscalização e fechamento mensal de arrecadação).

---

## Delimitação — o que não estamos solicitando

A delimitação faz parte do pedido. Requisitamos o acesso mínimo necessário aos processos que o
órgão executivo estadual conduz — e nada além disso.

- **Alteração de registro de veículo (RENAVAM).** O domínio está previsto na arquitetura, mas
  nenhuma operação de escrita sobre o registro veicular é solicitada nesta homologação.
- **Extração de base para análise.** Não pedimos acesso em massa nem cargas completas: as consultas
  são pontuais e vinculadas a um atendimento, processo ou ato em curso.
- **Dados de saúde de terceiros.** No domínio de sinistros, tratamos dado de vítima estritamente no
  que a submissão exige; no domínio clínico, o dado é do próprio candidato atendido.
- **Arquivos de documentos.** Anexos de defesa, recurso, laudos e evidências permanecem sob custódia
  do órgão; ao registro nacional trafegam apenas metadados e resumo criptográfico.
- **Operações de outras UFs.** Fora do que o próprio processo interestadual exigir, na forma do
  art. 287 do CTB.

---

**NYX Knowledge (NYXK)** · Antonio Augusto Russo · aarusso@nyxk.com.br

Documento elaborado para o processo de homologação junto à SENATRAN — agosto de 2026. As operações
estão descritas por função pretendida; a nomenclatura, os caminhos e os esquemas de dados serão
ajustados ao contrato oficial quando disponibilizado, sem impacto nas aplicações, por estarem
isolados no adaptador de integração.
