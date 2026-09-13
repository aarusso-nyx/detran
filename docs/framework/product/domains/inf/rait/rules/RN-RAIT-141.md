---
id: RN-RAIT-141
title: Distribuição impessoal e auditável — ordem única de consumo das filas e sorteio registrado
status: draft
apps: [rait, dashboard]
sources:
  [
    REF-LEI-9784-1999,
    REF-LEI-13146-2015-acessibilidade,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-CONTRAN-357,
    REF-LEI-10741-2003,
  ]
updated: 2026-09-13
---

**Regra.** A escolha de quem trabalha cada caso e de qual caso é trabalhado primeiro é feita pelo
**sistema, por critério publicado e registrado**, nunca pelo interesse do requerente ou pela
preferência do servidor. A ordem de consumo de toda fila do RAIT é: (1) bandeira de risco de
prescrição; (2) prioridade legal de tramitação (pessoa com deficiência; pessoa idosa, fonte a
capturar); (3) ordem cronológica do marco de tempestividade. A designação de relator é por
**sorteio/rodízio registrado em ata** por lote, com ordem inicial aleatória e exclusão de impedidos.
Desvio da ordem exige motivo tipado e fica no histórico do caso.

**Base legal.**

- [REF-LEI-9784-1999] art. 2º (princípios da impessoalidade, moralidade, motivação e eficiência) —
  subsidiário.
- [REF-LEI-13146-2015-acessibilidade] art. 9º, VII: _"tramitação processual e procedimentos
  judiciais e administrativos em que for parte ou interessada, em todos os atos e diligências"_ —
  atendimento prioritário à pessoa com deficiência.
- [REF-LEI-10741-2003] art. 71, §§3º e 5º: prioridade estendida aos processos e procedimentos na
  Administração Pública, mediante requerimento com prova da idade; **prioridade especial para
  maiores de 80 anos** — capturado em 2026-09-13; a ordem única usa dois pesos (60+ e 80+).
- [REF-CETRAN-PROCESSO-INTERNO] CETRAN-ES art. 25 (distribuição registrada, por sorteio) — benchmark
  adotado como desenho de fato (steering A.3, A.4).
- [REF-CONTRAN-357] item 8.3 (publicidade das decisões) — a ata de distribuição é parte da
  publicidade do processo.

**Verificação.** Toda fila expõe a ordem e o critério em vigor; o "puxar próximo" entrega sempre o
primeiro elegível; o lote de sorteio guarda semente, ordem e resultado e é assinado (PAdES+TSA) pelo
presidente; o caso registra `priority_basis` quando a prioridade legal se aplica; reatribuições e
saltos de ordem exigem motivo em {`impedimento`, `afastamento`, `rebalanceamento`,
`risco_prescricao`} ([UC-RAIT-011]).

**Controvérsia/risco.** Nenhuma norma de trânsito impõe sorteio; a impessoalidade decorre de
princípio geral. A prioridade da pessoa idosa é regra de lei federal geral cuja aplicação ao
processo administrativo estadual é a leitura corrente, mas o texto não está no corpus.
