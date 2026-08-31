---
id: RN-RAIT-102
title: Prazo de recurso à JARI — piso de 30 dias da notificação da penalidade, coincidente com o vencimento da multa
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-918]
updated: 2026-08-24
---

**Regra.** O prazo para recorrer à JARI contra a penalidade é **o impresso na Notificação da
Penalidade** e **não pode ser inferior a 30 dias contados da data da notificação da penalidade**.
Essa mesma data é, por determinação legal, **a data de vencimento para pagamento da multa** — prazo
recursal e vencimento são um único marco temporal, não dois.

**Base legal.**

- [REF-CTB-280-290] art. 282 §4º: _"Da notificação deverá constar a data do término do prazo para
  apresentação de recurso pelo responsável pela infração, que não será inferior a trinta dias
  contados da data da notificação da penalidade."_
- [REF-CTB-280-290] art. 282 §5º: _"No caso de penalidade de multa, a data estabelecida no parágrafo
  anterior será a data para o recolhimento de seu valor."_
- [REF-CONTRAN-918] art. 12, IV: a NP deverá conter _"a data do término para apresentação de
  recurso, que será a mesma data para pagamento da multa, conforme §§ 4º e 5º do art. 282 do CTB"_.

**Verificação.** Campo único `data_limite_recurso_jari` no processo, alimentado da NP, exibido no
PORTAL simultaneamente como "prazo para recorrer" e "vencimento para pagar com desconto"
([RN-RAIT-127]). Validação de piso análoga à de [RN-RAIT-101]: `data_impressa >= data_notificacao

- 30 dias`, com alerta de conformidade se violada.

**Controvérsia/risco.** O termo inicial aqui é a **notificação** da penalidade (art. 282 §4º),
enquanto na defesa é a **expedição** da notificação da autuação (art. 281-A). A assimetria é do
texto legal e é deliberada nas RN: [RN-RAIT-104] define qual evento concreto corresponde a
"notificação" em cada canal de ciência.
