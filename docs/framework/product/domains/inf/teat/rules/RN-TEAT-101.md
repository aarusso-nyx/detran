---
id: RN-TEAT-101
title: Conteúdo mínimo do AIT — rol do art. 280 do CTB é piso, não teto
status: draft
apps: [teat]
sources:
  [REF-CTB-280-290, REF-CONTRAN-918, REF-SENATRAN-997, REF-LEI-13709-2018]
updated: 2026-08-27
---

**Regra.** Nenhum AIT pode ser finalizado sem os seis elementos do _caput_ do art. 280 do CTB —
tipificação; local, data e hora; caracteres da placa, marca e espécie do veículo; prontuário do
condutor _sempre que possível_; identificação do órgão e da autoridade/agente/equipamento
autuador; assinatura do infrator _sempre que possível_. Esse rol é **piso**: regulamentação
específica acrescenta elementos por modalidade de lavratura (alcoolemia — [RN-TEAT-136]; medidor
de velocidade — [RN-TEAT-139]). Dois dos seis incisos são qualificados por "sempre que possível"
(IV e VI) e, portanto, **não bloqueiam a finalização**; os outros quatro são incondicionais e
bloqueiam.

**Base legal.**

- [REF-CTB-280-290] art. 280 _caput_: _"Ocorrendo infração prevista na legislação de trânsito,
  lavrar-se-á auto de infração, do qual constará: I - tipificação da infração; II - local, data e
  hora do cometimento da infração; III - caracteres da placa de identificação do veículo, sua
  marca e espécie, e outros elementos julgados necessários à sua identificação; IV - o prontuário
  do condutor, sempre que possível; V - identificação do órgão ou entidade e da autoridade ou
  agente autuador ou equipamento que comprovar a infração; VI - assinatura do infrator, sempre
  que possível, valendo esta como notificação do cometimento da infração."_
- [REF-CTB-280-290] art. 280 §2º: _"A infração deverá ser comprovada por declaração da autoridade
  ou do agente da autoridade de trânsito, por aparelho eletrônico ou por equipamento audiovisual,
  reações químicas ou qualquer outro meio tecnologicamente disponível, previamente regulamentado
  pelo CONTRAN."_
- [REF-CONTRAN-918] art. 3º _caput_: o AIT _"deverá conter os dados mínimos definidos pelo art.
  280 do CTB e em regulamentação específica"_.
- [REF-SENATRAN-997] art. 4º: _"O AIT lavrado no Talão Eletrônico deverá conter os dados mínimos
  definidos no art. 280 do Código de Trânsito Brasileiro (CTB) e em regulamentação específica."_
- [REF-CONTRAN-985-1003-MBFT] Seção 7: o AIT deve ser _"preenchido de acordo com as disposições
  contidas no artigo 280 do CTB e demais normas regulamentares, com o registro do fato que
  fundamentou sua lavratura."_

**Verificação.** O `Framing` do `NormativeCatalog` publica, por enquadramento, o conjunto de
campos exigidos = rol incondicional do art. 280 ∪ acréscimos da regulamentação específica do
enquadramento. `POST /v1/ait-lifecycle/aits/:id/finalize` rejeita a finalização com ausência de
qualquer campo incondicional; campos qualificados por "sempre que possível" exigem apenas que o
resultado esteja **registrado** (obtido / não obtido com motivo — [RN-TEAT-105] e [RN-TEAT-005]),
nunca que estejam preenchidos. O checklist do art. 280 é o mesmo que a autoridade aplica ao julgar
a consistência do auto ([RN-TEAT-119]) e que o julgador da defesa reexamina ([RN-RAIT-115]) —
deve ser um único artefato versionado, não duas listas.

O tratamento dos identificadores pessoais e veiculares necessários a esse conteúdo mínimo segue
[RN-TEAT-144]: decorre de obrigação legal/regulatória, não de consentimento do autuado.

**Controvérsia/risco.** O inciso III termina em _"e outros elementos julgados necessários à sua
identificação"_ — cláusula aberta cujo preenchimento é juízo do agente. Não há norma que a feche.
O sistema não deve tentar torná-la obrigatória por catálogo; deve oferecê-la como campo opcional
estruturado e registrar o que foi informado. Registrado em `_intake/legal-assessment.md`, item 2.
