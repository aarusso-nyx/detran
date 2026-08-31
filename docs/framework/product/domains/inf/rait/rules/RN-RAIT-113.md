---
id: RN-RAIT-113
title: Prescrição quinquenal e prescrição por paralisação superior a 3 anos (Lei 9.873/1999)
status: approved
apps: [rait, dashboard]
sources: [REF-LEI-9873-1999, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** Aplicam-se ao processo administrativo de infração de trânsito os prazos prescricionais da
Lei 9.873/1999, que instituem **dois relógios distintos**:

1. **Prescrição quinquenal (art. 1º, _caput_).** A ação punitiva prescreve em **5 anos contados da
   data da prática do ato** — ou, na infração permanente ou continuada, do dia em que tiver cessado.
   É interrompida pelas hipóteses do art. 2º, entre elas **a notificação do indiciado, inclusive por
   edital** (inciso I) e **a decisão condenatória recorrível** (inciso III).
2. **Prescrição intercorrente por paralisação (art. 1º §1º).** Incide a prescrição no procedimento
   **paralisado por mais de 3 anos, pendente de julgamento ou despacho**, devendo os autos ser
   **arquivados de ofício** ou a requerimento do interessado — sem prejuízo da apuração da
   responsabilidade funcional pela paralisação. Este prazo é **autônomo**: corre a partir de
   _qualquer_ paralisação e não depende de esgotado o quinquênio.

**Base legal.**

- [REF-LEI-9873-1999] art. 1º, _caput_, §1º e §2º; art. 2º, I a IV; art. 1º-A (prescrição quinquenal
  da **execução** do crédito, após constituído definitivamente); art. 5º (a lei **não** se aplica a
  infrações de natureza funcional nem a processos de natureza tributária).
- [REF-CONTRAN-918] art. 36: _"Aplicam-se a esta Resolução os prazos prescricionais previstos na Lei
  nº 9.873, de 1999."_ Parágrafo único: cabe ao órgão máximo executivo de trânsito da União definir
  os procedimentos para **aplicação uniforme** desses preceitos pelos demais órgãos do SNT.
- [REF-CONTRAN-918] art. 14: a notificação por edital deve respeitar _"os prazos prescricionais
  previstos na Lei nº 9.873"_.

**Verificação.** O RAIT mantém, por processo: (a) `data_pratica_ato` → relógio de 5 anos;
(b) `data_ultimo_ato_de_impulso` → relógio de 3 anos de paralisação, reiniciado a cada despacho,
diligência, julgamento ou ato inequívoco de apuração. O relógio (b) é **transversal a todas as
fases** — defesa, 1ª e 2ª instância — diferentemente dos tetos de [RN-RAIT-110]/[RN-RAIT-111], que
são por instância. Alerta em 24 meses de paralisação e escalada compulsória em 30 meses.

**Interação com o CTB — como os relógios convivem.** Ver a tabela consolidada em
`_intake/legal-assessment.md`. Em síntese: o **teto que primeiro vence prevalece**, porque cada um
extingue a punibilidade por fundamento próprio. Na prática o §1º (3 anos de paralisação) é **mais
apertado** que os 24 meses por instância somente quando o processo fica parado sem qualquer ato de
impulso; e é **mais frouxo** que o art. 289-A quando há atos de impulso sem julgamento — pois o
art. 289-A pune a **ausência de decisão**, não a inatividade.

**Controvérsia/risco (ALTO).**

1. **Âmbito federal.** A Lei 9.873/1999 dispõe, em seu próprio título e no _caput_ do art. 1º, sobre
   a ação punitiva da **Administração Pública Federal, direta e indireta**. O DETRAN-AM é órgão
   **estadual**. A ponte normativa é o art. 36 da Res. CONTRAN 918/2022 — uma **resolução**
   estendendo por remissão uma lei federal de âmbito expresso. A solidez dessa extensão é **questão
   jurídica aberta** que o corpus capturado não resolve, e que não pode ser resolvida por inferência
   aqui. `_intake/legal-assessment.md`, item 10 — **prioridade máxima de validação humana**.
2. **Procedimento uniforme não editado.** O parágrafo único do art. 36 atribui ao órgão máximo
   executivo da União a definição dos procedimentos de aplicação uniforme. Tal ato **não foi
   localizado** no corpus — logo, não há padrão nacional publicado sobre como contar interrupções e
   paralisações em matéria de trânsito.
3. **Interrupção pela decisão recorrível.** O art. 2º, III interrompe a prescrição pela "decisão
   condenatória recorrível". Se a NP é essa decisão, o quinquênio **reinicia** a cada penalidade
   aplicada — leitura que amplia muito a janela e que deve ser confirmada, não presumida.

**Decisão.** Owner, em steering (`_meta/steering.md` C.13, C.14, 2026-08-24), sem parecer
jurídico formal:

- **Ponto 1 (âmbito federal):** a Lei 9.873/1999 **se aplica** ao processo administrativo de
  trânsito estadual do DETRAN-AM, via a extensão do art. 36 da Res. CONTRAN 918/2022. Tratar
  como premissa de desenho confirmada — risco jurídico residual permanece até parecer formal,
  dado que é a base de dois dos quatro relógios de extinção.
- **Qual relógio governa o SLA** quando os tetos do CTB (até 48 meses somados, [RN-RAIT-111])
  excedem esta prescrição por paralisação de 3 anos: **prevalece o mais curto** — este §1º.
  Mesma decisão registrada em [RN-RAIT-111].
- **Ponto 2 (procedimento uniforme não editado) e ponto 3 (interrupção pela decisão
  recorrível)** seguem em aberto — não cobertos pela pergunta de steering.
