---
id: RN-TEAT-126
title: Termo de Recolhimento do Veículo — conteúdo mínimo de 11 elementos e notificação válida mesmo com recusa de assinatura
status: draft
apps: [teat]
sources: [REF-CONTRAN-1025-2026, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-24
---

**Regra.** Ao aplicar a medida administrativa de remoção, o órgão **deverá emitir o Termo de
Recolhimento do Veículo** e realizar o **respectivo registro eletrônico** junto ao órgão máximo
executivo de trânsito da União. O termo contém, **no mínimo**, sete elementos do _caput_ —
(I) identificação do órgão responsável; (II) identificação do veículo; (III) número do AIT, da
ordem judicial **ou** do ato administrativo que determinou a remoção; (IV) local, data e hora da
remoção; (V) **fundamento legal** que ampara a medida; (VI) identificação do local de guarda;
(VII) identificação do proprietário e do condutor, **sempre que possível** — mais quatro do §1º:
**objetos deixados no veículo** por conveniência e inteira responsabilidade do condutor;
**equipamentos obrigatórios ausentes**; **estado geral de lataria, pintura e pneus**; e o **prazo
para retirada do veículo, sob pena de ser levado a leilão**. **Considera-se notificado o
proprietário ou condutor presente no momento do recolhimento, ainda que se recuse a assinar o
termo.**

**Base legal.** [REF-CONTRAN-1025-2026] art. 14:

> "Art. 14. Ao aplicar a medida administrativa de remoção do veículo, nos termos do art. 271 do
> Código de Trânsito Brasileiro, o órgão ou entidade responsável pela aplicação da medida
> administrativa de remoção dos veículos deverá emitir o Termo de Recolhimento do Veículo e
> realizar o respectivo registro eletrônico junto ao órgão máximo executivo de trânsito da União,
> na forma por ele estabelecida, contendo, no mínimo, as seguintes informações: I - a identificação
> do órgão ou da entidade responsável pela aplicação da medida administrativa de remoção; II - a
> identificação do veículo; III - a indicação do número do auto de infração, da ordem judicial ou
> do ato administrativo que tenha determinado a remoção; IV - o local, a data e a hora da remoção;
> V - o fundamento legal que ampara a aplicação da medida administrativa de remoção; VI - a
> identificação do local de guarda do veículo; e VII - identificação do proprietário e do condutor,
> sempre que possível."
>
> "§ 1º Devem ser registrados no Termo de Recolhimento do Veículo os objetos deixados no veículo
> por conveniência e inteira responsabilidade do condutor; os equipamentos obrigatórios ausentes; o
> estado geral da lataria, pintura e pneus e o prazo para a retirada do veículo, sob pena de ser
> levado a leilão."
>
> "§ 2º Considera-se notificado o proprietário ou o condutor presente no momento do recolhimento,
> ainda que se recuse a assinar o termo de recolhimento."

Ver [REF-CTB-165-277-medidas-alcoolemia] art. 271 §§5º a 7º (dever de notificar no ato;
notificação recusada considerada recebida).

**Verificação.** É o **conteúdo mínimo que faltava** para modelar formalmente a remoção. Três
consequências de desenho: (a) o inciso III confirma que a remoção **pode existir sem AIT**
(ordem judicial ou ato administrativo — ver [RN-TEAT-118]); (b) o inciso V exige o **fundamento
legal estruturado** de [RN-TEAT-125]; (c) os itens do §1º são **captura de estado do veículo no
ato**, com valor probatório direto contra futuras alegações de dano em depósito — devem ser
evidência com hash e cadeia de custódia ([RN-TEAT-002]), não campos de texto. O §2º é, para a
remoção, o mesmo padrão de três resultados de [RN-TEAT-005] — e explicita o efeito jurídico que a
regra genérica não explicitava: **recusa de assinatura não impede a notificação de se
perfectibilizar**.

**Controvérsia/risco.** (a) O "registro eletrônico junto ao órgão máximo executivo de trânsito da
União, **na forma por ele estabelecida**" remete a procedimento do Sivec **ainda não publicado** —
a obrigação existe, a forma de cumpri-la não. (b) O §1º manda registrar o **prazo para retirada
sob pena de leilão**, mas o prazo aplicável depende de dispositivos espalhados pela própria
Resolução ([RN-TEAT-128]); imprimir prazo errado no termo entregue em campo é vício de notificação
com efeito sobre a alienação. (c) A norma é de **26/06/2026**, com menos de dois meses de vigência
e sem fonte secundária de conferência — **validação jurídica humana obrigatória antes de tratá-la
como base definitiva de produto**. Itens 28 e 29 de `_intake/legal-assessment.md`.
