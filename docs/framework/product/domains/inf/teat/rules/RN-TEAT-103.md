---
id: RN-TEAT-103
title: Uma infração por auto — consolidação obrigatória de enquadramentos simultâneos
status: draft
apps: [teat]
sources: [REF-CONTRAN-985-1003-MBFT, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O agente **só pode registrar uma infração por AIT**. Constatadas infrações simultâneas,
aplica-se a consolidação normativa antes de decidir quantos autos lavrar:

1. **Mesma raiz de código** (três primeiros dígitos iguais) → considera-se **uma só infração**;
   as condutas adicionais vão para o campo Observações.
2. **Infrações concorrentes** (o cometimento de uma implica necessariamente o da outra) → **um
   único AIT**, pelo enquadramento que absorve.
3. **Infrações concomitantes** (independentes entre si) → **um AIT para cada** infração.
4. **Infrações continuadas** (conduta única, inalterada, ininterrupta, observada mais de uma vez)
   → **um único AIT**; a abordagem do condutor faz cessar a infração continuada.
5. **Infrações sucessivas** (condutas idênticas repetidas ao longo de um percurso, de forma
   reiterada e intermitente) → **um AIT por infração constatada**.
6. **Incompatibilidade típica**: infrações que não podem ocorrer simultaneamente (uma de
   estacionamento e outra de movimento, sem que se tenha constatado a condução) → cabe **apenas
   uma** delas. Verbos "conduzir", "dirigir", "transitar" e "circular" implicam veículo em
   movimento.
7. **Veículo estacionado irregularmente sem remoção** → **um único AIT**, independentemente do
   tempo de permanência, desde que não movimentado no período.

**Base legal.** [REF-CONTRAN-985-1003-MBFT] Seção 7:

> "O agente da autoridade só poderá registrar uma infração por auto e, no caso da constatação de
> infrações simultâneas em que os códigos infracionais possuam a mesma raiz (os três primeiros
> dígitos), considerar-se-á apenas uma infração."
>
> "Será lavrado somente um AIT quando o veículo estiver estacionado irregularmente e não for
> aplicada a medida administrativa de remoção, independentemente do tempo em que permaneça no
> local, desde que não seja movimentado nesse período."
>
> "[Concorrentes] São aquelas em que o cometimento de uma infração implica necessariamente o
> cometimento de outra. Nesses casos, será lavrado um único AIT." · "[Concomitantes] São
> concomitantes aquelas infrações que ocorrem de maneira independente umas das outras. Nesses
> casos, será lavrado AIT para cada infração constatada, na forma dos arts. 266 e 280 do CTB."
> · "[Continuadas] Caracterizam-se por uma conduta única, inalterada e ininterrupta, observada
> por mais de uma vez em momentos distintos e sequenciais. A abordagem do condutor faz cessar a
> infração continuada. Nesse caso, deverá ser lavrado um único AIT." · "[Sucessivas]
> Caracterizam-se pelo cometimento de repetidas condutas idênticas, ao longo de um percurso, de
> forma reiterada e intermitente. Nesses casos, será lavrado AIT para cada infração constatada".

**Verificação.** A regra 1 é **determinística e deve ser automatizada**: o TEAT bloqueia a
finalização de dois AITs do mesmo agente, mesmo veículo, mesmo local/data/hora, cujos códigos
compartilhem os três primeiros dígitos. A regra 6 também é automatizável a partir de um atributo
`movement_required` no `Framing` (derivável do verbo do tipo infracional). As regras 2 a 5
**não** são automatizáveis por dedução: dependem de relações entre enquadramentos que o MBFT
exemplifica sem esgotar ("os exemplos citados não esgotam as situações"). Modelagem correta: o
`NormativeCatalog` passa a carregar uma **tabela de relações entre enquadramentos**
(`concorrente_com`, `absorve`, `incompatível_com`), populada a partir das fichas do MBFT e
mantida como dado normativo versionado ([WF-TEAT-003]) — não como lógica de código. Onde a
relação não estiver cadastrada, o sistema **alerta e deixa a decisão ao agente**, registrando a
escolha; jamais consolida por conta própria.

**Controvérsia/risco.** As listas de exemplos do MBFT são expressamente **não exaustivas**. Uma
tabela de relações derivada delas é necessariamente incompleta e, se aplicada como bloqueio duro,
produzirá falsos negativos de autuação (infrações legítimas impedidas). Por isso a regra acima é
deliberadamente assimétrica: bloqueio duro apenas onde o critério é textual e objetivo (raiz de
código), alerta consultivo no resto. Registrado em `_intake/legal-assessment.md`, item 6.
