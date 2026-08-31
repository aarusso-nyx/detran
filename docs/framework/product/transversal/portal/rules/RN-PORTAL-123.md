---
id: RN-PORTAL-123
title: Adesão ao SNE pelo PORTAL — consentimento informado sobre a ciência ficta, e os quatro efeitos que devem ser exibidos antes do aceite
status: draft
apps: [portal, rait]
sources: [REF-CONTRAN-931, REF-CTB-280-290, REF-LEI-13460-2017]
updated: 2026-08-24
---

**Regra.** A adesão ao SNE é oferecida pelo PORTAL sem exigir comparecimento a balcão, e é um ato de
nível avançado ([RN-PORTAL-101], linha 9). O regime jurídico do SNE já está integralmente descrito em
[RN-RAIT-124] a [RN-RAIT-126] e **não é repetido aqui**. Esta regra acrescenta apenas o **delta do
PORTAL**: o que a tela de adesão deve informar, com destaque, **antes** do aceite, porque a adesão
altera a forma como o cidadão passa a ser notificado e como os seus prazos passam a correr.

Quatro efeitos de exibição obrigatória:

| #   | Efeito                                                 | Consequência prática para o cidadão                                                                                                                                                        |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Ciência ficta em 30 dias**                           | O aderente é considerado notificado **30 dias após a inclusão da informação no sistema e o envio da mensagem** — a leitura é irrelevante. Não abrir o SNE **não** impede o prazo de correr |
| 2   | **Substituição de todas as demais formas**             | A partir da adesão, o SNE substitui qualquer outra forma de notificação para todos os efeitos legais, e dispensa o edital. Quem esperar carta registrada pode perder prazo                 |
| 3   | **Responsabilidade exclusiva de acesso e de cadastro** | O acesso é de responsabilidade exclusiva do usuário, que responde pelos atos praticados no sistema, e deve manter **e-mail e telefone celular** atualizados para os alertas                |
| 4   | **Cancelamento não retroage**                          | As notificações já disponibilizadas até o dia do cancelamento **permanecem válidas**; e o vínculo é cancelado automaticamente após comunicação de venda ou transferência do veículo        |

Duas travas de desenho:

- **Adesão e decisão de pagamento são telas distintas.** A faixa de desconto de 40%/60% pressupõe
  adesão prévia ao SNE _e_ renúncia à defesa e ao recurso ([RN-PORTAL-128]) — juntar as duas
  decisões numa só tela induz o cidadão a abrir mão do recurso por causa do desconto, sem perceber.
- **A adesão é reversível e a tela diz como.** O cancelamento por livre iniciativa do usuário é
  direito expresso; escondê-lo transformaria uma faculdade em armadilha.

**Base legal.**

- [REF-CONTRAN-931] art. 7º: _"A adesão dos proprietários e condutores ao SNE poderá ser realizada
  junto aos órgãos e entidades executivos de trânsito dos Estados e do Distrito Federal **ou via
  outros mecanismos disponibilizados**."_ — base normativa suficiente para a adesão pelo canal
  digital, sem balcão.
- [REF-CONTRAN-931] art. 8º: _"Será cancelado o acesso ao SNE: I - por livre iniciativa do usuário;
  ou II - a critério do órgão ou entidade do SNT detentor do meio tecnológico disponibilizado, desde
  que justificado."_ § 1º: cancelamento do vínculo após comunicação de venda ou transferência. § 2º:
  _"As notificações disponibilizadas no SNE até o dia do cancelamento do acesso permanecerão válidas
  para fins de comprovação da notificação do infrator."_
- [REF-CONTRAN-931] art. 4º, §§ 3º a 8º e art. 2º; [REF-CTB-280-290] art. 282-A — regime de ciência
  ficta, irrelevância da leitura e substituição, integralmente descrito em [RN-RAIT-124].
- [REF-LEI-13460-2017] art. 5º, XIV: linguagem simples e compreensível — os quatro efeitos acima têm
  de ser inteligíveis para quem não é jurista, e é isso que faz da tela de adesão um caso de
  **consentimento informado**, e não de aceite de termos.

**Verificação.** (a) A tela de adesão exibe os quatro efeitos em linguagem simples, acima do botão de
confirmação, e o aceite registra qual versão do texto foi exibida (`versao_termo`, `exibido_em`) —
prova de que o cidadão foi informado, necessária se a ciência ficta vier a ser questionada. (b) Os
campos de e-mail e celular são coletados e validados no ato da adesão, e o PORTAL alerta quando ficam
desatualizados. (c) A adesão não pode ser pré-marcada, embutida em outro fluxo, nem apresentada como
etapa obrigatória de qualquer serviço. (d) Existe caminho de cancelamento em no máximo dois cliques a
partir do perfil, com o aviso do § 2º exibido antes de confirmar.

**Delta explícito frente a [RN-RAIT-124], [RN-RAIT-125] e [RN-RAIT-126].** Aquelas três regras
definem o regime (exclusividade do meio, ciência ficta, canal de interposição, dispensa de edital,
retenção mínima de 5 anos) e valem integralmente para o PORTAL **por referência**. O que esta regra
acrescenta, e que não existe lá, é o **dever de informar antes do aceite** e a separação entre a
decisão de aderir e a decisão de pagar. Nada aqui altera aquelas regras.

**Controvérsia/risco.** (a) O SNE é sistema **da União**; o DETRAN-AM é aderente, não operador
([RN-RAIT-124], "Controvérsia"). A adesão feita pelo PORTAL depende de integração cuja
disponibilidade e latência estão fora do controle do projeto, e o momento exato em que a adesão
produz efeito — se no aceite no PORTAL, se na confirmação pelo SNE — **não está normatizado**. É
diferença juridicamente relevante: uma notificação expedida no intervalo entre o aceite e a
confirmação pode ser disputada. Recomenda-se registrar os dois carimbos de tempo e tratar como
efetiva a data de confirmação pelo SNE, informando-a ao cidadão. (b) A ciência ficta é a regra de
maior potencial de litígio de todo o corpus do PORTAL, porque produz perda de prazo sem que o cidadão
tenha lido nada. A prova de que ele foi informado dos efeitos ao aderir é, por isso, ativo de defesa
do órgão — e a razão de a verificação (a) ser obrigatória e não recomendada. Ver
`_intake/legal-assessment.md`.
