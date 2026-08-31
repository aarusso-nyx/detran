---
id: RN-TEAT-140
title: Sinalização R-19 é pressuposto da fiscalização de velocidade por medidor fixo
status: draft
apps: [teat]
sources: [REF-CONTRAN-798-804-equipamentos, REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-24
---

**Regra.** Os locais em que houver fiscalização de excesso de velocidade **por medidores do tipo
fixo devem ser precedidos de sinalização com placa R-19**, na forma da Res. 798/2020 e do Manual
Brasileiro de Sinalização de Trânsito — Volume I, de modo a informar ao condutor a velocidade
máxima permitida. **Deve ser instalada placa R-19 junto a cada medidor fixo**; havendo redução de
velocidade, placas R-19 informando a redução gradual; em vias com duas ou mais faixas por sentido,
a placa deve estar afixada nos dois lados da pista ou suspensa sobre a via; havendo acesso de
outra via pública entre o acesso e o medidor, deve ser acrescida sinalização nesse trecho. **É
vedada a utilização de placa R-19 que não seja fixa** para fins de fiscalização de excesso de
velocidade. É também **vedado obstruir a ostensividade** do equipamento e de seu operador.
Combinada com a regra geral do MBFT ([RN-TEAT-102]), a consequência é direta: **sinalização
insuficiente, ilegível ou incorretamente implantada impede a lavratura do AIT**.

**Base legal.** [REF-CONTRAN-798-804-equipamentos] — Res. CONTRAN 798/2020:

> "Art. 10. Os locais em que houver fiscalização de excesso de velocidade por meio de medidores do
> tipo fixo devem ser precedidos de sinalização com placa R-19, na forma estabelecida nesta
> Resolução e no Manual Brasileiro de Sinalização de Trânsito - Volume I (MBST-I), de forma a
> garantir a segurança viária e informar aos condutores dos veículos a velocidade máxima permitida
> para o local. § 1º Onde houver redução de velocidade, deve ser observada a existência de placas
> R-19, informando a redução gradual do limite de velocidade conforme MBST-I. § 2º Deve ser
> instalada a placa R-19 junto a cada medidor de velocidade do tipo fixo."
>
> "Art. 11. […] § 1º Em vias com duas ou mais faixas de trânsito por sentido, a sinalização, por
> meio da placa de regulamentação R-19, deve estar afixada nos dois lados da pista ou suspensa
> sobre a via […] § 2º Em vias em que haja acesso de veículos por outra via pública, no trecho
> compreendido entre o acesso e o medidor de velocidade, deve ser acrescida, nesse trecho,
> sinalização por meio de placa R-19. § 3º Para fins de fiscalização do excesso de velocidade, é
> vedada a utilização de placa R-19 que não seja fixa."

[REF-CONTRAN-985-1003-MBFT] Seção 7: _"Quando a configuração de uma infração depender da existência
de sinalização específica, esta deverá revelar-se suficiente e corretamente implantada de forma
legível e visível. Caso contrário, o agente não deverá lavrar o AIT, comunicando à autoridade de
trânsito com circunscrição sobre a via a irregularidade observada."_

**Verificação.** Não é regra do dispositivo móvel do agente, e sim da **operação de fiscalização** —
mas o TEAT é o ponto em que a inconformidade se manifesta. O `Framing` de excesso de velocidade
por medidor fixo deve exigir a confirmação de sinalização ([RN-TEAT-102],
`requires_signage = true`); a resposta negativa impede a lavratura e gera comunicação de
irregularidade. Nos medidores fixos, o local sinalizado é dado de cadastro do equipamento
([RN-TEAT-138]), com Levantamento Técnico de periodicidade **bienal** (art. 6º, I) — cuja validade
vencida é sinal de risco de conformidade a expor no painel operacional.

**Controvérsia/risco.** A exigência de R-19 é literal para medidores **do tipo fixo**. Para
portáteis, móveis e estáticos — os efetivamente acoplados ao talão eletrônico do agente em campo —
a Res. 798/2020 **não impõe** sinalização prévia equivalente. Aplicar por analogia a exigência aos
portáteis restringiria a fiscalização sem base normativa; deixar de aplicá-la é a leitura textual
correta, mas é ponto historicamente litigioso. Não resolvemos por inferência. Item 40 de
`_intake/legal-assessment.md`.
