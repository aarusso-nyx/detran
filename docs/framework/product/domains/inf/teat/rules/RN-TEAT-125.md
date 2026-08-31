---
id: RN-TEAT-125
title: Remoção do veículo — hipóteses fechadas, limite do §9º e o marco do início da operação de remoção
status: draft
apps: [teat]
sources:
  [
    REF-CTB-165-277-medidas-alcoolemia,
    REF-CONTRAN-985-1003-MBFT,
    REF-CONTRAN-1025-2026,
  ]
updated: 2026-08-24
---

**Regra.** A remoção desloca o veículo para depósito fixado pelo órgão com circunscrição sobre a
via. **Não cabe remoção nos casos em que a irregularidade for sanada no local da infração.** Não
sendo possível sanar no local, e desde que o veículo ofereça condições de segurança para
circulação, ele **será liberado e entregue a condutor regularmente habilitado, mediante
recolhimento do CLA, contra recibo, com prazo não superior a 15 (quinze) dias** — ressalvadas as
infrações do art. 230, V e do art. 231, VIII, às quais essa liberação **não se aplica**. Falhando
essas alternativas, o veículo será removido. As hipóteses de remoção ao depósito são três:
(I) irregularidade não sanada, sem condutor habilitado e sem condições de trânsito seguro;
(II) veículo não registrado e não licenciado; (III) **quando necessário à boa ordem
administrativa** — hipótese **discricionária motivada**, para infrações em que, embora a
irregularidade possa ter cessado com a abordagem, seja necessário garantir que a conduta não se
repita. A remoção **não se aplica** se o condutor habilitado retirar o veículo **antes do início
da operação de remoção**, ou se o agente avaliar que a remoção trará mais prejuízo à segurança ou
fluidez — e o Manual define o marco exato: considera-se **iniciada** a operação quando o guincho
está no local **e** já se iniciou qualquer procedimento mecânico de guinchamento.

**Base legal.** [REF-CTB-165-277-medidas-alcoolemia] art. 271:

> "Art. 271. O veículo será removido, nos casos previstos neste Código, para o depósito fixado
> pelo órgão ou entidade competente, com circunscrição sobre a via."
>
> "§ 5º O proprietário ou o condutor deverá ser notificado, no ato de remoção do veículo, sobre as
> providências necessárias à sua restituição e sobre o disposto no art. 328, conforme
> regulamentação do CONTRAN." · "§ 6º Caso o proprietário ou o condutor não esteja presente no
> momento da remoção do veículo, a autoridade de trânsito, no prazo de 10 (dez) dias contado da
> data da remoção, deverá expedir ao proprietário a notificação prevista no § 5º […]" · "§ 7º A
> notificação devolvida por desatualização do endereço do proprietário do veículo ou por recusa
> desse de recebê-la será considerada recebida para todos os efeitos."
>
> "§ 9º Não caberá remoção nos casos em que a irregularidade for sanada no local da infração." ·
> "§ 9º-A. Quando não for possível sanar a irregularidade no local da infração, o veículo, desde
> que ofereça condições de segurança para circulação, será liberado e entregue a condutor
> regularmente habilitado, mediante recolhimento do Certificado de Licenciamento Anual, contra a
> apresentação de recibo, e prazo razoável, não superior a 15 (quinze) dias […]" · "§ 9º-B. O
> disposto no § 9º-A deste artigo não se aplica às infrações previstas no inciso V do caput do art.
> 230 e no inciso VIII do caput do art. 231 deste Código." · "§ 9º-C […] restrição administrativa
> no Renavam […]" · "§ 9º-D. O descumprimento da obrigação estabelecida no § 9º-A […] resultará em
> recolhimento do veículo ao depósito".

[REF-CONTRAN-985-1003-MBFT] Seção 8.2:

> "O veículo será removido ao depósito nos seguintes casos: I. quando a irregularidade não for
> sanada e não se apresentar o condutor regularmente habilitado e o veículo não reunir condições
> para transitar com segurança; II. quando o veículo não estiver devidamente registrado e
> licenciado; III. quando necessário à boa ordem administrativa. IV. O atendimento à boa ordem
> administrativa se dará nas infrações em que, embora a irregularidade possa ter cessado em razão
> da abordagem, seja necessário garantir que a conduta não será praticada novamente […] V. São
> exemplos de infrações que ensejam o recolhimento do veículo ao depósito, quando necessário à boa
> ordem administrativa: arts. 173; 174; 175; 210; 230, I; 231, VIII; 239; 253; e 253-A."
>
> "Considera-se iniciada a operação de remoção quando o veículo destinado para a remoção (guincho)
> se encontrar no local da infração e o responsável pelo guincho já tiver iniciado qualquer
> procedimento mecânico de guinchamento, tais como, destravamento do sistema de transmissão ou de
> frenagem, amarração de rodas, veículo sobre ao menos um dos patins, colocação de veículo na lança
> do guincho, ou, subida de veículo, ainda que parcial, na plataforma do guincho […]"
>
> "O veículo em estado de abandono ou acidentado poderá ser removido […] independentemente da
> existência de infração à legislação de trânsito."

**Verificação.** `AdministrativeTerm` de remoção exige **fundamento estruturado**
`fundamento_remocao` ∈ {IRREGULARIDADE_NAO_SANADA, NAO_REGISTRADO_LICENCIADO,
BOA_ORDEM_ADMINISTRATIVA, ABANDONO, ACIDENTADO, ORDEM_JUDICIAL, ATO_ADMINISTRATIVO} — exigido
tanto pelo MBFT quanto pelo art. 14, V da Res. 1.025/2026 ([RN-TEAT-126]), e **hoje inexistente**
no modelo. O marco de "operação iniciada" precisa ser um **evento registrado com timestamp**
(quem, quando, qual procedimento mecânico), porque é ele que separa "veículo retirado pelo
condutor, sem remoção" de "remoção consumada, com custos devidos" — fronteira de cobrança e de
litígio. Ver [RN-TEAT-126] (termo), [RN-TEAT-127] (guarda monitorada) e [RN-TEAT-128] (prazos).

**Controvérsia/risco.** Dois prazos distintos convivem e são frequentemente confundidos: **15
dias** de regularização quando a retenção/remoção é substituída por entrega ao condutor (art. 271
§9º-A) e **30 dias** na hipótese equivalente do art. 270 §2º. São dispositivos diferentes para
situações diferentes; usar um pelo outro produz notificação com prazo errado. O MBFT reproduz a
mesma dualidade (Seções 8.1 e 8.2). Item 27 de `_intake/legal-assessment.md`.
