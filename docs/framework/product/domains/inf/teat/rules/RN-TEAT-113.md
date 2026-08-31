---
id: RN-TEAT-113
title: Numeração do AIT é sequencial, automática, pré-estabelecida pela autoridade e pré-carregável para uso offline
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve **receber, de forma automática e sem interferência externa,
numeração sequencial de AIT previamente estabelecida pela autoridade de trânsito**. Essa numeração
**pode estar pré-carregada no aparelho, inclusive para permitir o registro do AIT quando o
preenchimento for off-line**. Três consequências vinculantes: (a) o número **não é escolhido nem
editado** pelo agente — "sem interferência externa" veda qualquer entrada manual; (b) a faixa é
**estabelecida pela autoridade de trânsito**, não pelo dispositivo nem pelo fornecedor; (c) o
pré-carregamento offline é **expressamente autorizado** — o desenho de faixa + reserva de
[WF-TEAT-002] é cumprimento de norma, não apenas conveniência técnica.

**Base legal.**

- [REF-SENATRAN-997] art. 3º, I: o talão eletrônico deverá _"receber, de forma automática, sem
  interferência externa, numeração sequencial de AIT, estabelecida previamente pela autoridade de
  trânsito"_.
- [REF-SENATRAN-997] Anexo II, c): _"Deverá receber, de forma automática, sem interferência
  externa, numeração sequencial de AIT, estabelecida previamente pela autoridade de trânsito. Essa
  numeração pode estar pré-carregada no aparelho, inclusive para permitir o registro do AIT quando
  o preenchimento for off-line;"_

**Verificação.** `AitNumberingRange` é criada por `agency-admin`/`technical-admin` — atores que
representam a **autoridade de trânsito** no sentido da norma; a criação de faixa por qualquer
outro ator violaria o art. 3º, I. `OfflineNumberingReservation` é o pré-carregamento autorizado
pelo Anexo II, c). Nenhuma rota do TEAT pode aceitar `ait_number` fornecido pelo cliente: o número
é atribuído pelo runtime a partir da reserva ativa do dispositivo ([WF-TEAT-002]). Consequência
sobre a exclusividade de sessão: como a reserva é vinculada a `agent_id`+`device_id`, a violação
de [RN-TEAT-111] produz **dois conjuntos de números legítimos em dispositivos distintos** — razão
adicional para invalidar a reserva do dispositivo abandonado.

**Controvérsia/risco.** A norma **não trata da devolução de números não utilizados** de uma faixa
pré-carregada, nem do esgotamento de faixa em campo — gaps já registrados em [WF-TEAT-002] e que
esta rodada **confirma como lacuna normativa**, não como omissão de pesquisa. Consequência
prática: "número reservado e não usado" fica em limbo; se o órgão exigir sequência contínua sem
saltos na prestação de contas do talonário, o desenho atual (perda do intervalo) pode não ser
aceitável. Decisão do órgão, não da norma — item 12 de `_intake/legal-assessment.md`.
