---
id: RN-TEAT-128
title: Prazos de custódia oponíveis já no ato de campo — 30 dias para o edital, 60 dias para o leilão, seis meses de diárias
status: draft
apps: [teat]
sources: [REF-CONTRAN-1025-2026, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** Embora depósito, guarda e leilão estejam fora do escopo operacional do TEAT, três
prazos da custódia **nascem do ato de campo** e precisam ser corretamente informados no Termo de
Recolhimento ([RN-TEAT-126] §1º):

1. **60 dias contados da data do recolhimento** — veículo removido a qualquer título e **não
   reclamado** nesse prazo **será levado a leilão**. Considera-se não reclamado o veículo cujo
   proprietário/interessado deixe de promover **simultaneamente** (a) a regularização das
   pendências que motivaram a retenção ou remoção **e** (b) a retirada do veículo.
2. **30 dias da remoção** — pode ser promovida **notificação por edital** para cientificar
   proprietário e interessados sob pena de leilão, e pode ser **iniciada a preparação para o
   leilão**.
3. **10 dias da remoção** — prazo para notificar o proprietário quando ele não estiver presente no
   ato ([RN-TEAT-125], art. 271 §6º do CTB; art. 15 da Res. 1.025/2026), preferencialmente pelo
   **SNE**; **a partir de 1º de janeiro de 2027, exclusivamente pelo SNE**.

Cobrança: as **diárias de guarda** correspondem a períodos de 24 horas contados da entrada no
centro de custódia e ficam **limitadas ao período máximo de seis meses**, devidas por quem
promover a retirada, independentemente de ser o proprietário ou de ter dado causa ao recolhimento.
A **liberação** depende de prévia quitação dos débitos e da regularização das condições que
motivaram a remoção.

**Base legal.** [REF-CONTRAN-1025-2026]:

> "Art. 25. O veículo removido a qualquer título e não reclamado pelo proprietário ou interessado,
> no prazo de sessenta dias contado da data do recolhimento, será levado a leilão […] § 1º
> Considera-se não reclamado o veículo cujo proprietário ou interessado, dentro do prazo legal,
> deixe de promover simultaneamente: I - a regularização das pendências que motivaram sua retenção
> ou remoção; e II - sua retirada do centro de custódia."
>
> "Art. 26. Decorridos trinta dias da remoção do veículo, sem que tenha ocorrido sua regularização
> e retirada, poderá ser promovida notificação por edital […]" · "Art. 27. Decorrido o prazo de
> trinta dias contado da data do recolhimento do veículo, poderá ser iniciado o procedimento de
> preparação para o leilão […]"
>
> "Art. 21 § 1º A cobrança pela guarda do veículo será efetuada por diárias, correspondentes a
> períodos de vinte e quatro horas, contadas da entrada do veículo no centro de custódia […] § 2º A
> cobrança das diárias de guarda fica limitada ao período máximo de seis meses, sendo seu pagamento
> devido por quem promover a retirada do veículo, independentemente de ser o proprietário ou de ter
> dado causa ao seu recolhimento."
>
> "Art. 23. A liberação do veículo dependerá da prévia quitação dos débitos incidentes e da
> regularização das condições que motivaram sua remoção […]"
>
> "Art. 15 § 3º A partir de 1º de janeiro de 2027, as notificações de que trata o caput serão
> realizadas exclusivamente por meio do SNE […]"

Ver [REF-CTB-165-277-medidas-alcoolemia] art. 271 §10 (despesas limitadas a 6 meses) e §13
(devolução de quantias quando comprovado recolhimento indevido).

**Verificação.** O único campo que o TEAT precisa acertar em campo é o **prazo para retirada sob
pena de leilão** impresso no Termo de Recolhimento: são **60 dias contados do recolhimento**, e
não 30 (que é o marco do edital e da preparação do leilão, não o do vencimento do direito do
proprietário). Esse prazo deve ser **calculado pelo sistema** a partir da data/hora da remoção, não
digitado. Os demais prazos alimentam a retaguarda e o SIVEC — candidato a nova integração nacional
em [APP-TEAT], hoje não listada.

**Controvérsia/risco.** O art. 271 §10 do CTB limita **as despesas de remoção e estada** a seis
meses; o art. 21 §2º da Res. 1.025/2026 limita **a cobrança das diárias** ao mesmo período — mas o
art. 25 manda leiloar em 60 dias. Um veículo que permaneça seis meses em depósito só é possível
fora do fluxo ordinário (restrição judicial, litígio). Não é conflito, é convivência de prazos
com finalidades distintas — mas é fonte previsível de erro de cálculo na retaguarda. Item 31 de
`_intake/legal-assessment.md`.
