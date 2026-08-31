---
id: RN-BOAT-126
title: Acesso, auditoria, transparência e direitos do titular — o que o BOAT deve implementar por força da LGPD
status: draft
apps: [boat, portal]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** O tratamento de dado de vítima pelo DETRAN-AM sujeita o órgão a um conjunto de deveres
positivos que **não dependem** de qual hipótese legal se adote ([RN-BOAT-123]) e que o sistema
precisa suportar: (a) **registro das operações de tratamento**; (b) **acesso com finalidade
declarada e trilha auditável**; (c) **publicidade** das hipóteses de tratamento e da dispensa de
consentimento; (d) **canal de exercício dos direitos do titular**; (e) **encarregado** identificado;
(f) **comunicação de incidente**. Nenhum deles é opcional, e nenhum deles está hoje descrito nos
artefatos BOAT.

**Base legal.** [REF-LEI-13709-2018]:

> "Art. 23. O tratamento de dados pessoais pelas pessoas jurídicas de direito público [...] deverá
> ser realizado para o atendimento de sua finalidade pública, na persecução do interesse público, com
> o objetivo de executar as competências legais ou cumprir as atribuições legais do serviço público,
> desde que: I - **sejam informadas as hipóteses em que, no exercício de suas competências, realizam
> o tratamento de dados pessoais**, fornecendo informações claras e atualizadas sobre a previsão
> legal, a finalidade, os procedimentos e as práticas utilizadas para a execução dessas atividades,
> em veículos de fácil acesso, preferencialmente em seus sítios eletrônicos; [...] III - seja
> indicado um encarregado quando realizarem operações de tratamento de dados pessoais [...]"
>
> "Art. 18. O titular dos dados pessoais tem direito a obter do controlador [...]: I - confirmação
> da existência de tratamento; II - acesso aos dados; III - correção de dados incompletos, inexatos
> ou desatualizados; IV - anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou
> tratados em desconformidade [...]"
>
> "Art. 37. O controlador e o operador devem manter registro das operações de tratamento de dados
> pessoais que realizarem [...]"
>
> "Art. 41. O controlador deverá indicar encarregado pelo tratamento de dados pessoais. § 1º A
> identidade e as informações de contato do encarregado deverão ser divulgadas publicamente [...]"
>
> "Art. 46. Os agentes de tratamento devem adotar medidas de segurança, técnicas e administrativas
> aptas a proteger os dados pessoais de acessos não autorizados [...]"
>
> "Art. 48. O controlador deverá comunicar à autoridade nacional e ao titular a ocorrência de
> incidente de segurança que possa acarretar risco ou dano relevante aos titulares."

Complementa: [REF-LEI-13709-2018] art. 11, § 2º (publicidade da dispensa de consentimento);
[REF-SENATRAN-PORTARIA-139-2025] art. 16, § 3º (todo caso de uso declara modalidade, finalidade,
**hipótese legal**, grupos de informação e justificativa de necessidade).

**Verificação.** Requisitos concretos, todos derivados de dispositivo acima:

1. **Acesso a dado de vítima é evento auditável de primeira classe** — quem, quando, qual registro,
   **com que finalidade declarada**. Não basta log técnico: a finalidade é elemento do registro
   (art. 37 c/c art. 6º, I). O padrão já existe no corpus: `RN-AUD-005` do protótipo TEAT ("acesso a
   dados sensíveis deve ser auditado com finalidade") e o `CustodyEvent` de acesso de
   [RN-TEAT-142] — **reaproveitar, não reinventar**.
2. **Papel `auditor` precisa ser delimitado.** Consulta somente-leitura ampla ([APP-BOAT] §Atores)
   é incompatível com minimização quando o objeto é dado de saúde: o `auditor` deve enxergar
   **metadados e trilha**, e o dado bruto sensível só por acesso excepcional justificado
   ([RN-BOAT-124]) — exatamente a limitação já adotada para bodycam em [RN-TEAT-142].
3. **Publicidade ativa.** O DETRAN-AM deve publicar as hipóteses de tratamento do registro de
   sinistro, com previsão legal e finalidade (art. 23, I) e dar publicidade à dispensa de
   consentimento (art. 11, § 2º). Hoje a página institucional de LGPD do órgão **não menciona** dado
   de saúde nem vítima de sinistro (`_intake/research-dossier.md` §7).
4. **Canal do titular.** Vítima, familiar ou representante deve poder exercer os direitos do art. 18
   — inclusive **correção** de dado de saúde errado, hipótese concreta e frequente (destino
   hospitalar equivocado, gravidade registrada incorretamente). O canal natural é o portal
   ([APP-PORTAL]), articulado com o Encarregado do órgão; nenhum artefato BOAT o prevê.
5. **Incidente.** Vazamento de dado de vítima é incidente com risco relevante quase por definição —
   art. 48 impõe comunicação à ANPD **e ao titular**. O plano de resposta é do órgão; o sistema
   precisa poder **identificar quais titulares** foram afetados, o que exige granularidade de log
   por registro.

**Controvérsia/risco.** (a) Os prazos e procedimentos do exercício de direitos perante o Poder
Público remetem, por força do art. 23, § 3º, à Lei do Habeas Data, à Lei 9.784/1999 e à LAI —
**três regimes distintos**, e nenhum deles é o prazo genérico de 15 dias que a LGPD prevê para o
controlador privado. Qual prazo o DETRAN-AM deve praticar é questão aberta que merece definição
formal do órgão. (b) O acesso do **próprio autuado ou interessado** ao registro de sinistro que
instrui um AIT contra ele — necessário ao contraditório ([WF-INF-001]) — colide com a proteção do
dado de saúde de **terceiro** (a vítima) contido no mesmo registro. É a mesma tensão já identificada
para a bodycam (item 43 de `inf/teat/_intake/legal-assessment.md`), aqui agravada por ser dado
sensível. **Solução de trabalho:** fornecer o registro com **supressão dos campos de saúde de
terceiros**, salvo requisição de autoridade; não negar o acesso ao registro inteiro. Item 4 de
`_intake/legal-assessment.md`.
