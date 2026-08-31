---
id: RN-TEAT-127
title: Guarda monitorada — modalidade nova de cumprimento da remoção, com nove requisitos cumulativos e infração autônoma na violação
status: draft
apps: [teat]
sources: [REF-CONTRAN-1025-2026, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-28
---

**Regra.** O órgão competente **poderá autorizar** o cumprimento da medida administrativa de
remoção mediante **guarda monitorada** — custódia do veículo sob responsabilidade do próprio
proprietário ou possuidor legítimo, com dispositivo de monitoramento, como alternativa ao
recolhimento físico a depósito. A autorização é **prerrogativa do órgão** (nunca direito subjetivo
do administrado, nunca decisão do agente em campo) e **somente pode ser concedida quando atendidos
todos os nove requisitos**: (I) veículo com condições de segurança para circulação; (II) sem
indícios de adulteração de placa, chassi, motor e demais sinais identificadores; (III) retirada por
condutor regularmente habilitado; (IV) sem registro ativo de furto, roubo, apropriação indébita ou
outra ocorrência criminal; (V) sem restrições judiciais; (VI) veículo com alienação fiduciária não
sob execução extrajudicial; (VII) licenciado em pelo menos um dos três últimos exercícios;
(VIII) proprietário/possuidor que **não** tenha descumprido o prazo do art. 271 §9º-A do CTB,
verificado por restrição administrativa registrada no veículo; (IX) inexistência de circunstâncias
que comprometam o acompanhamento, a fiscalização ou a efetividade da guarda. A medida **não afasta
as demais medidas administrativas e penalidades**. **O descumprimento das condições — inclusive
remoção, inutilização ou violação do dispositivo de monitoramento — acarreta restrição
administrativa de circulação, sujeita o veículo à remoção e ao recolhimento, veda nova guarda
monitorada para o mesmo fato gerador e caracteriza a infração do art. 239 do CTB**, cuja autuação
compete ao próprio órgão responsável pela remoção. A guarda monitorada só é viabilizada por
**soluções tecnológicas previamente homologadas** pelo órgão máximo executivo da União, e os custos
de remoção e guarda são suportados pelo proprietário **inclusive nessa modalidade**.

**Base legal.** [REF-CONTRAN-1025-2026] art. 17 _caput_ e §§1º a 7º:

> "Art. 17. O órgão ou entidade competente poderá autorizar o cumprimento da medida administrativa
> de remoção mediante guarda monitorada do veículo sob responsabilidade de seu proprietário ou
> possuidor legítimo, observados os requisitos estabelecidos nesta Resolução."
>
> "§ 1º A autorização prevista no caput constitui prerrogativa do órgão ou entidade competente, e
> somente poderá ser concedida quando atendidos os seguintes requisitos: [I a IX, verbatim em
> [REF-CONTRAN-1025-2026]]"
>
> "§ 2º A aplicação da medida de que trata o caput não afasta a aplicação das demais medidas
> administrativas e penalidades previstas na legislação de trânsito."
>
> "§ 3º O descumprimento das condições da guarda monitorada, inclusive mediante remoção,
> inutilização ou violação do dispositivo de monitoramento, acarretará a imposição de restrição
> administrativa de circulação do veículo, sujeitando-o à remoção e ao recolhimento ao local de
> guarda indicado pelo órgão ou entidade competente, vedada a concessão de nova guarda monitorada
> para o mesmo fato gerador, caracterizando-se como infração prevista no art. 239 do Código de
> Trânsito Brasileiro, cuja autuação compete ao órgão ou entidade responsável pela aplicação da
> medida administrativa de remoção do veículo."
>
> "§ 4º A guarda monitorada […] será viabilizada por soluções tecnológicas previamente homologadas
> pelo órgão máximo executivo de trânsito da União, que estabelecerá os requisitos técnicos, os
> critérios de interoperabilidade, os mecanismos de rastreabilidade, monitoramento e segurança da
> informação, bem como os procedimentos operacionais aplicáveis."
>
> "§ 7º A adoção da medida prevista neste artigo observará critérios de eficiência administrativa,
> racionalização da utilização dos serviços de remoção e otimização da capacidade dos locais de
> guarda de veículos."

[REF-CONTRAN-1025-2026] art. 21: _"Os custos dos serviços de remoção e guarda do veículo serão
suportados pelo proprietário ou interessado […] inclusive na modalidade de guarda monitorada de
que trata o art. 17."_

**Verificação.** Modalidade **fora do escopo hoje descrito** em [APP-TEAT]. Se adotada pelo
DETRAN-AM, o TEAT precisa: (a) registrar a **avaliação dos nove requisitos** como checklist
auditável, com a fonte de cada verificação (bases nacionais para IV, V, VI, VII, VIII — portanto
**dependente de conectividade**, o que a torna estruturalmente incompatível com decisão puramente
offline); (b) tratar a autorização como **ato da autoridade**, não do agente; (c) modelar o caso —
raro e notável — de uma **medida administrativa que gera um novo AIT** (art. 239 do CTB na
violação do monitoramento), invertendo a direção usual AIT → medida de [RN-TEAT-118].

**Controvérsia/risco.** (a) O requisito IX ("inexistem circunstâncias que comprometam […] a
efetividade da guarda") é **cláusula aberta**: não é verificável por sistema e não pode ser
automatizada — é juízo motivado da autoridade. (b) As **soluções tecnológicas homologadas** do §4º
**ainda não existem**: a norma remete a requisitos técnicos, interoperabilidade e procedimentos
que o órgão máximo "estabelecerá" — futuro. Sem eles, a guarda monitorada é **inaplicável na
prática**, por mais que esteja em vigor. (c) A norma tem menos de dois meses e nenhuma fonte
secundária de conferência. Item 30 de `_intake/legal-assessment.md`, entre os prioritários para o
advogado humano.

**Decisão do Owner (2026-08-28, `_meta/open-issues.md` DT-015).** Guarda monitorada fica **fora
do MVP** — e a decisão vai além de só adiar a _ativação_: a própria **modelagem detalhada** (o
checklist dos nove requisitos, os estados `GUARDA_MONITORADA`/`VIOLACAO_MONITORAMENTO` em
[WF-TEAT-004], as telas D-02/D-03 de [IU-TEAT-001], os passos correspondentes de [UC-TEAT-009])
fica represada para uma onda futura — o Owner rejeitou explicitamente a recomendação anterior
deste corpus de "modelar agora, ativar quando homologada". O conteúdo já escrito é mantido como
registro (não apagado), mas marcado como fora de escopo do MVP nos artefatos correspondentes.
