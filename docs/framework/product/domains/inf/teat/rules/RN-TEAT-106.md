---
id: RN-TEAT-106
title: Referendo é exigência do registro por equipamento de imagem (inciso III), não do talão eletrônico (inciso II)
status: draft
apps: [teat]
sources: [REF-CONTRAN-918, REF-CONTRAN-798-804-equipamentos]
updated: 2026-08-24
---

**Regra.** O CTB e a Res. 918/2022 preveem três formas de lavratura, com regimes de validação
**diferentes**: (I) anotação em documento próprio; (II) registro em **talão eletrônico**, isolado
ou acoplado a equipamento de detecção; (III) registro em **sistema eletrônico de processamento de
dados**, quando a infração for comprovada por equipamento de detecção provido de registrador de
imagem. **Somente o inciso III exige referendo** por autoridade de trânsito ou seu agente, que
será identificado no AIT. O AIT lavrado em talão eletrônico (inciso II) **não passa por
referendo**: nele o agente é o próprio autor do ato, identificado eletronicamente
([RN-TEAT-110]). Consequência direta de escopo: o fluxo de referendo **não pertence ao TEAT** —
pertence à retaguarda de processamento de fiscalização eletrônica.

**Base legal.** [REF-CONTRAN-918] art. 3º:

> "§ 1º O AIT de que trata o caput poderá ser lavrado pela autoridade de trânsito ou por seu
> agente: I - por anotação em documento próprio; II - por registro em talão eletrônico isolado ou
> acoplado a equipamento de detecção de infração regulamentado pelo CONTRAN, atendido o
> procedimento definido pelo órgão máximo executivo de trânsito da União; ou III - por registro em
> sistema eletrônico de processamento de dados, quando a infração for comprovada por equipamento
> de detecção provido de registrador de imagem, regulamentado pelo CONTRAN."
>
> "§ 3º O registro da infração, referido no inciso III do § 1º será referendado por autoridade de
> trânsito, ou seu agente, que será identificado no AIT."

**Verificação.** O ato legal do TEAT carrega um atributo obrigatório `forma_de_lavratura` ∈
{inciso II, inciso III}, derivado do contexto de criação e **não editável** após a finalização
([RN-TEAT-004]). O valor governa: (a) a exigência de referendo (só III); (b) o conteúdo mínimo
adicional quando houver medidor de velocidade envolvido ([RN-TEAT-139]); (c) qual identificação
consta do campo do art. 280, V — agente autuador (II) ou equipamento + agente referendador (III).
Um AIT do inciso III **recebido** pela retaguarda sem identificação do referendador é
inconsistente ([RN-TEAT-119]).

**Controvérsia/risco.** O inciso II admite talão eletrônico **acoplado a equipamento de detecção**
— híbrido em que a infração é comprovada por equipamento, mas o auto é lavrado por agente
presente. O texto normativo **não diz** se, nessa configuração, incide o referendo do §3º (que
literalmente só alcança o inciso III) ou se a presença do agente o dispensa. Leitura de trabalho
adotada: **não incide**, porque o §3º remete expressamente ao inciso III e porque o agente
presente já é a autoridade que constata. É interpretação sobre silêncio do texto — item 7 de
`_intake/legal-assessment.md`.
