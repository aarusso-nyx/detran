---
id: RN-BOAT-132
title: Acesso do DETRAN-AM aos dados do RENAEST — regime de casos de uso, grupos de informação e vedação de cessão a terceiros
status: draft
apps: [boat]
sources: [REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** **Alimentar** o RENAEST e **consultar** o RENAEST são regimes distintos. O envio decorre
de dever normativo direto ([RN-BOAT-102]); o **acesso aos dados** dos sistemas da SENATRAN — RENAEST
inclusive — é disciplinado pela Portaria 139/2025 e depende de: integração formal ao SNT, finalidade
vinculada às atribuições legais do CTB, **manuais técnico-operacionais específicos** e, para cada
**caso de uso**, a declaração de modalidade, finalidade, **hipótese legal de tratamento**, grupos de
informação e **justificativa de necessidade**. A cessão do acesso a terceiros é **vedada** sem
autorização prévia e expressa da SENATRAN.

**Base legal.** [REF-SENATRAN-PORTARIA-139-2025]:

> "Art. 2º O acesso aos dados dos sistemas e subsistemas informatizados da Senatran por órgãos e
> entidades componentes do Sistema Nacional de Trânsito será disciplinado por manuais
> técnico-operacionais específicos elaborados pela Senatran. § 1º Somente terão o acesso de que trata
> o caput os órgãos e entidades integrados ao Sistema Nacional de Trânsito, conforme disciplina o
> art. 333, § 2º, da Lei nº 9.503 [...]. § 2º O acesso de que trata o caput terá como finalidade o
> desempenho das atribuições legais definidas pelo Código de Trânsito Brasileiro. § 3º O uso dos
> dados por órgãos e entidades integrados ao Sistema Nacional de Trânsito, para o cumprimento de
> finalidades não relacionadas às atribuições legais definidas pelo Código de Trânsito Brasileiro,
> reger-se-á pelo disposto no art. 3º."
>
> "Art. 16 [...] § 3º Cada caso de uso é compreendido, minimamente, pelas seguintes informações:
> I - modalidade de acesso [...]; II - descrição clara e específica da finalidade do acesso;
> III - **hipótese legal de tratamento dos dados**; IV - grupos de informação; e V - justificativa da
> necessidade de cada grupo de informação, para atender à finalidade pretendida, obedecendo ao
> princípio da necessidade, estabelecido pelo art. 6º, inciso III, da Lei nº 13.709, de 2018.
> [...] § 7º **É vedado, a qualquer título, ceder a terceiros o acesso aos dados** de que trata o
> caput, sem prévia e expressa autorização da Senatran."
>
> "Art. 8º O uso primário dos dados restritos pela Senatran terá como finalidades específicas a
> execução de políticas públicas e o desempenho de atribuições definidas em Lei e regulamentos.
>
> Art. 9º O **uso secundário** dos dados restritos somente será permitido se observados os preceitos,
> diretrizes e procedimentos estabelecidos nesta Portaria, em consonância com a Lei nº 13.709, de 2018. Parágrafo único. O uso secundário de que trata o caput será analisado pela Senatran para cada
> caso concreto, **vedada sua aplicação com finalidades genéricas**."

Definições aplicáveis ([REF-SENATRAN-PORTARIA-139-2025] art. 6º): **uso primário** — _"tratamento
dos dados conforme as finalidades previamente estabelecidas e informadas ao titular no momento da
coleta"_; **uso secundário** — _"tratamento dos dados para finalidades distintas daquelas
originalmente informadas ao titular [...], exigindo avaliação de compatibilidade com o propósito
inicial ou nova justificativa legal"_; **grupo de informação** — _"conjunto fechado de parâmetros de
entrada e saída [...] necessários para atender a uma finalidade específica"_.

**Verificação.** Consequências para o BOAT:

1. **Toda consulta que o BOAT fizer a sistema da SENATRAN** — RENAEST, RENAVAM, RENACH
   ([RN-BOAT-107]) — pressupõe caso de uso autorizado, com finalidade e hipótese legal declaradas.
   Isso não é burocracia externa: é o **modelo de documentação** que o próprio produto deveria
   adotar internamente para seus acessos a dado sensível ([RN-BOAT-126]).
2. **A distinção uso primário × secundário deve existir no produto.** Usar o dado de sinistro para a
   finalidade do registro/estatística é primário; usá-lo para outra coisa — cruzamento com base de
   habilitação para política de fiscalização, estudo acadêmico, painel de gestão não previsto — é
   **secundário** e exige análise caso a caso, vedada finalidade genérica.
3. **A vedação de cessão a terceiros (§ 7º)** alcança fornecedores, integrações e "compartilhamento
   para desenvolvimento". É a mesma lógica da restrição de destino do dado do talão eletrônico
   ([RN-TEAT-112], Anexo V, "e" da Portaria 997/2022) e deve ser considerada na decisão de
   hospedagem e de terceirização.
4. **Retornar dado ao órgão que o originou** (município, PM) é diferente de ceder acesso a terceiro
   — mas precisa de fundamento próprio ([RN-BOAT-113], [RN-BOAT-128]).

**Controvérsia/risco.** (a) Os **manuais técnico-operacionais** que disciplinam o acesso dos órgãos
do SNT (art. 2º) **não foram localizados publicamente** — mesma lacuna dos Manuais do RENAEST
([RN-BOAT-103]) e do manual técnico do art. 21. O DETRAN-AM está sujeito a regras de acesso que não
pode ler publicamente; a via é solicitação institucional. (b) O rol de requisitos do art. 22 é
redigido para **pessoas jurídicas de direito privado**; para o órgão público, o § 3º remete a outro
instrumento: _"Os requisitos para o acesso aos dados dos sistemas e subsistemas informatizados de
trânsito, por pessoas jurídicas de direito público, observarão o disposto em normativo específico ou
manual técnico-operacional, elaborados pela Senatran, ou o disposto em acordos, convênios e demais
instrumentos de cooperação."_ — ou seja, o regime concreto aplicável ao DETRAN-AM **depende de
instrumento que também não foi localizado**. (c) O art. 24 contém **remissão possivelmente
equivocada**: fala em perda dos requisitos _"exigidos no art. 21"_, mas os requisitos de acesso estão
no **art. 22** (o art. 21 trata de especificações tecnológicas). Anotado como provável erro material
do texto publicado; não altera a substância.
