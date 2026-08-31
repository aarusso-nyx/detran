---
id: RN-TEAT-117
title: Homologação SENATRAN do software é distinta da homologação interna de dispositivo — e é gatilhada por mudança de funcionalidade
status: draft
apps: [teat]
sources: [REF-SENATRAN-997, REF-DETRANPR-CONV-224-2022, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** O software que compõe o talão eletrônico **deve ser homologado pela SENATRAN**. O órgão
ou entidade de trânsito interessado apresenta **laudo técnico** que comprove o atendimento aos
requisitos do Anexo da Portaria; o laudo deve ser emitido por **profissional sem vínculos
laborais com o solicitante**, com certificação em auditoria de sistema, segurança da informação ou
forense computacional, **ou** por universidade/instituição a ela vinculada; e deve ser **renovado
e encaminhado à SENATRAN a cada quatro anos**. A homologação deve ser precedida da **descrição
detalhada do funcionamento**, que fica **disponível ao público na sede do órgão e junto à JARI**.
A SENATRAN tem prazo máximo de **60 dias** para notificar a viabilidade do pedido. **A cada
alteração do código que gere alteração de funcionalidade, é exigida nova homologação**; auditoria
que comprove alteração no sistema instalado **cancela automaticamente** a certificação e, com ela,
a homologação. Esta homologação **não se confunde** com o controle interno do órgão sobre
dispositivo e versão autorizados ([RN-TEAT-003]) — são dois níveis, e o TEAT precisa dos dois.

**Base legal.** [REF-SENATRAN-997] art. 5º _caput_ e §§1º a 5º:

> "Art. 5º O software que compõe o Talão Eletrônico deverá ser homologado pela Secretaria
> Nacional de Trânsito (SENATRAN). § 1º A SENATRAN, após receber requerimento devidamente
> instruído e protocolado, notificará o interessado acerca da viabilidade do pedido, no prazo
> máximo de sessenta dias. § 2º […] deverá apresentar laudo técnico que comprove o atendimento dos
> requisitos estabelecidos no Anexo desta Portaria. § 3º O laudo técnico […] deverá ser emitido por
> profissional sem vínculos laborais com o solicitante, que possua certificação em auditoria de
> sistema, segurança da informação ou forense computacional, ou por universidade ou instituição a
> ela vinculada. § 4º O laudo técnico […] deverá ser renovado e encaminhado à SENATRAN a cada
> quatro anos. § 5º A homologação do Talão Eletrônico deve ser precedida da descrição detalhada de
> seu funcionamento, ficando disponível ao público na sede do órgão ou entidade de trânsito e
> junto à respectiva Junta Administrativa de Recurso de Infração (JARI)."

[REF-SENATRAN-997] Anexo VII, a) a c):

> "a) A cada alteração do código da aplicação do talonário, que gere alteração de funcionalidade,
> será exigida nova homologação. b) No período de validade da certificação poderão ser realizadas
> auditorias no sistema instalado nos equipamentos e, caso seja comprovada a existência de
> qualquer alteração, fica automaticamente cancelada a certificação e, consequentemente, sua
> homologação. c) A SENATRAN poderá cancelar a homologação a qualquer momento, quando comprovar
> que as empresas deixaram de cumprir com as exigências desta Portaria."

[REF-SENATRAN-997] Anexo VI, i) e j) exigem **código-fonte** e **scripts de banco de dados**; o
parágrafo único daquele item dispensa apenas as alíneas "c" a "g" (documentação societária) quando
o software for desenvolvido pelo próprio órgão. [REF-DETRANPR-CONV-224-2022] confirma, em convênio
de outro estado, a homologação SENATRAN como **condição contratual** do uso do talonário.

**Verificação.** `Homologation` ([RN-TEAT-003]) deve passar a distinguir `scope` ∈
{SENATRAN_SOFTWARE, ORGAO_DISPOSITIVO_VERSAO} e, para o primeiro, carregar `laudo_emitido_em`,
`laudo_valido_ate` (= emissão + 4 anos), `emissor_independente` e `descricao_publicada_em`
(sede + JARI). `ApplicationVersion` ganha vínculo obrigatório à homologação SENATRAN vigente **e**
um marcador `altera_funcionalidade` no processo de release: marcado, a versão **não pode ser
distribuída** antes de nova homologação. Consequência de roadmap: o ciclo de release do TEAT tem
um gargalo regulatório de até 60 dias que hoje não aparece em [WF-TEAT-003] nem em nenhum
artefato de planejamento.

**Controvérsia/risco.** (a) A norma **não define** o que é "alteração de funcionalidade" — a
fronteira entre correção de defeito, ajuste de UI e mudança funcional é decisão do órgão, com o
agravante de que errar para menos **cancela a homologação** por via de auditoria (Anexo VII, b).
(b) O Anexo VII, c) fala em cancelamento quando "as **empresas**" descumprirem — redação que não
alcança literalmente o órgão que desenvolve o próprio software (caso PRODAM/DETRAN-AM,
[REF-DETRANAM-TALAO-BODYCAM]); a lacuna favorece o órgão, mas é lacuna. (c) Entrega de
**código-fonte e scripts de banco** à SENATRAN é obrigação de compliance com efeito sobre
propriedade intelectual e sobre o contrato de desenvolvimento. Itens 16 a 18 de
`_intake/legal-assessment.md`.
