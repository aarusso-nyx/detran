---
id: RN-TEAT-124
title: Retenção do veículo — saneamento no local, entrega a condutor habilitado com prazo de até 30 dias, ou remoção
status: draft
apps: [teat]
sources: [REF-CTB-165-277-medidas-alcoolemia, REF-CONTRAN-985-1003-MBFT]
updated: 2026-08-24
---

**Regra.** A retenção é a **imobilização do veículo pelo tempo necessário**, no local da abordagem
ou em local que garanta a segurança viária, para sanar irregularidade, **apenas nas infrações em
que essa medida esteja prevista**. Cadeia decisória vinculada:

1. **Irregularidade sanável no local** → veículo **liberado tão logo regularizada** a situação.
2. **Não sanável no local**, mas o veículo **oferece condições de segurança para circulação** →
   liberado e **entregue a condutor regularmente habilitado**, **mediante recolhimento do
   Certificado de Licenciamento Anual, contra apresentação de recibo**, com **prazo razoável, não
   superior a 30 (trinta) dias**, para regularizar — e o condutor é **considerado notificado na
   mesma ocasião**.
3. **Não se apresentando condutor habilitado no local** → o veículo **será removido a depósito**
   (art. 271, ver [RN-TEAT-125]).
4. **Descumprido o prazo do item 2** → **registro de restrição administrativa no Renavam** (§6º) e
   **recolhimento do veículo ao depósito** (§7º).
5. **Exceção discricionária:** a critério do agente, **não se dará a retenção imediata** de veículo
   de transporte coletivo transportando passageiros, ou transportando produto perigoso ou
   perecível, desde que ofereça condições de segurança para circulação.

**Base legal.** [REF-CTB-165-277-medidas-alcoolemia] art. 270 §§1º a 7º, verbatim:

> "§ 1º Quando a irregularidade puder ser sanada no local da infração, o veículo será liberado tão
> logo seja regularizada a situação."
>
> "§ 2º Quando não for possível sanar a falha no local da infração, o veículo, desde que ofereça
> condições de segurança para circulação, deverá ser liberado e entregue a condutor regularmente
> habilitado, mediante recolhimento do Certificado de Licenciamento Anual, contra apresentação de
> recibo, assinalando-se ao condutor prazo razoável, não superior a 30 (trinta) dias, para
> regularizar a situação, e será considerado notificado para essa finalidade na mesma ocasião."
>
> "§ 4º Não se apresentando condutor habilitado no local da infração, o veículo será removido a
> depósito, aplicando-se neste caso o disposto no art. 271."
>
> "§ 5º A critério do agente, não se dará a retenção imediata, quando se tratar de veículo de
> transporte coletivo transportando passageiros ou veículo transportando produto perigoso ou
> perecível, desde que ofereça condições de segurança para circulação em via pública."
>
> "§ 6º Não efetuada a regularização no prazo a que se refere o § 2º, será feito registro de
> restrição administrativa no Renavam […]" · "§ 7º O descumprimento das obrigações estabelecidas
> no § 2º resultará em recolhimento do veículo ao depósito, aplicando-se, nesse caso, o disposto no
> art. 271."

[REF-CONTRAN-985-1003-MBFT] Seção 8.1: _"Consiste na imobilização do veículo, pelo tempo
necessário, no local da abordagem ou em local que seja garantida a segurança viária […]"_; _"O
recolhimento do CRLV-e se dará com o lançamento, pelo órgão responsável pela fiscalização, desta
medida administrativa no cadastro do veículo junto ao Renavam."_; _"Não atendidas quaisquer das
situações previstas, o veículo deverá ser removido ao depósito."_

**Verificação.** É o **primeiro timer legal do TEAT**: até 30 dias, iniciados **no ato de campo**,
com termo inicial = data do recibo entregue pelo agente e ciência ficta na mesma ocasião. O
`AdministrativeTerm` de retenção precisa carregar: `condicoes_de_seguranca` (booleano decisório),
`condutor_habilitado_apresentado`, `recibo_id`, `prazo_regularizacao_dias` (≤30),
`data_limite_regularizacao`, `crlv_recolhido_suporte` ∈ {FISICO, DIGITAL} e o estado
`LIBERADO_COM_PRAZO` — nome canônico da sub-máquina A de [WF-TEAT-004] para esta mesma hipótese
do art.270 §2º (o veículo é liberado ao condutor, mas a medida segue pendente de regularização). O vencimento do prazo dispara duas consequências distintas na
retaguarda — restrição no Renavam e recolhimento ao depósito — que **não são a mesma coisa** e não
devem ser modeladas como um único evento.

**Controvérsia/risco.** (a) "**Prazo razoável, não superior a 30 dias**" é **teto, não prazo**: a
lei delega ao agente a fixação concreta. Parametrizar 30 dias fixos é escolha do órgão e deve ser
explícita, não default silencioso. (b) O §5º é **discricionariedade expressa do agente** — o
sistema pode oferecer a exceção, jamais aplicá-la sozinho. (c) O MBFT acrescenta ao §2º um
requisito que a lei não traz — que o veículo esteja _"devidamente licenciado"_ — restringindo a
hipótese de liberação por norma infralegal. Itens 25 e 26 de `_intake/legal-assessment.md`.
