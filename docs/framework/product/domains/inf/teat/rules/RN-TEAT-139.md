---
id: RN-TEAT-139
title: AIT e NA por medidor de velocidade devem conter a imagem com a placa do veículo
status: draft
apps: [teat, rait]
sources: [REF-CONTRAN-798-804-equipamentos, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** _"Para sua consistência e regularidade"_, o **auto de infração de trânsito (AIT) e a
notificação de autuação (NA)**, além do disposto no CTB e na legislação complementar, **devem
conter a imagem com a placa do veículo** quando a infração for apurada por medidor de velocidade.
Trata-se de **requisito de consistência**, com efeito direto no juízo do art. 281 §1º, I do CTB
([RN-TEAT-119]): AIT de excesso de velocidade sem a imagem com a placa é candidato natural a
insubsistência. Obrigação acessória do órgão: **dar publicidade, em seu site, antes do início da
operação, da relação de todos os medidores de velocidade existentes em sua circunscrição**,
contendo tipo, número de série e identificação estabelecida pelo órgão — e, nos fixos, também o
local de instalação.

**Base legal.** [REF-CONTRAN-798-804-equipamentos] — Res. CONTRAN 798/2020 art. 9º, com a redação
dada pela Res. CONTRAN 804/2020, art. 2º:

> "Art. 9º Para sua consistência e regularidade, o auto de infração de trânsito (AIT) e a
> notificação de autuação (NA), além do disposto no CTB e na legislação complementar, devem conter
> a imagem com a placa do veículo.
> Parágrafo único. O órgão ou entidade com circunscrição sobre a via deve dar publicidade, por meio
> do seu site na rede mundial de computadores, antes do início de sua operação, da relação de todos
> os medidores de velocidade existentes em sua circunscrição, contendo o tipo, número de série e a
> identificação do equipamento estabelecida pelo órgão, e, no caso do tipo fixo, também o local de
> instalação do equipamento." (NR)

Res. 798/2020 art. 2º §1º define o medidor de velocidade como instrumento que indica a velocidade
medida **e** contém dispositivo registrador de imagem que comprove o cometimento da infração —
a imagem é elemento **estrutural** do equipamento, não acessório.

**Verificação.** Requisito de conteúdo **não listado** em [REF-CONTRAN-918] nem em [RN-TEAT-002].
Implementação: quando `forma_de_lavratura` envolver medidor de velocidade ([RN-TEAT-106]), a
finalização exige **pelo menos uma evidência de imagem** vinculada, com hash e cadeia de custódia
([RN-TEAT-002]), classificada como `IMAGEM_PLACA`. A mesma evidência deve compor o pacote
probatório que instrui a defesa no [WF-INF-003] — sem ela, o órgão perde o litígio por vício
formal, independentemente do mérito.

**Controvérsia/risco.** A Res. 804/2020 **substituiu integralmente** a redação do art. 9º da Res.
798/2020, que originalmente listava **nove** informações obrigatórias no AIT/NA (imagem com placa,
velocidade regulamentada, velocidade medida, velocidade considerada, local, data e hora,
identificação do equipamento, data da última verificação metrológica, registros INMETRO e série).
Após a alteração, **o único item exigido pelo art. 9º é a imagem com a placa**. Isso **não** torna
os demais dados dispensáveis — a velocidade considerada continua exigida pelo art. 8º e os dados de
identificação pelo art. 280 do CTB —, mas **a fonte da exigência mudou**, e citar "os nove incisos
do art. 9º da Res. 798/2020" é hoje citação de **redação revogada**. Este ponto foi corrigido em
[REF-CONTRAN-798-804-equipamentos] nesta rodada. Item 39 de `_intake/legal-assessment.md`.
