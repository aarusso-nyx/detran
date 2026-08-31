---
id: RN-RAIT-112
title: Prescrição da pretensão punitiva por não julgamento do recurso no prazo (CTB art. 289-A)
status: reviewed
apps: [rait, dashboard, portal]
sources: [REF-CTB-280-290, REF-LEI-9873-1999]
updated: 2026-08-26
---

**Regra.** O **não julgamento** do recurso nos prazos de 24 meses do art. 285 §6º (JARI) e do art.
289, _caput_ (CETRAN) **enseja a prescrição da pretensão punitiva** — extinção da punibilidade, não
mero atraso. Decomposição do suporte fático, conforme o texto:

| Elemento            | Conteúdo                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Conduta que dispara | **Ausência de decisão** do órgão julgador. Não é atraso de remessa, de instrução ou de comunicação                      |
| Prazos referidos    | Apenas dois: art. 285 §6º e art. 289 _caput_ — ambos de **24 meses**                                                    |
| Termo inicial       | **Recebimento do recurso pelo órgão julgador** — nunca a autuação, a NP ou a interposição                               |
| Efeito              | Prescrição da **pretensão punitiva** — a penalidade não pode mais ser exigida                                           |
| Escopo              | Limitado à fase **recursal**. A defesa da autuação não é "recurso"; seu relógio próprio é a decadência de [RN-RAIT-114] |

**Base legal.** [REF-CTB-280-290] art. 289-A _(Incluído pela Lei nº 14.229, de 2021)_: _"O não
julgamento dos recursos nos prazos previstos no § 6º do art. 285 e no caput do art. 289 deste Código
ensejará a prescrição da pretensão punitiva."_

**Verificação — escada de alertas (proposta de desenho, não exigência legal).** Sobre
`data_recebimento_pelo_orgao_julgador` de cada instância:

| Marco                  | Ação do sistema                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| 12 meses (50% do teto) | Sinalização no acervo do relator; processo entra em faixa "atenção"                            |
| 18 meses (75%)         | Escalada à presidência da JARI/secretaria; priorização compulsória na pauta                    |
| 21 meses (87,5%)       | Alerta crítico ao gestor do órgão; processo no topo absoluto da fila                           |
| 24 meses               | Bloqueio de novas movimentações de mérito e abertura de tarefa de **declaração de prescrição** |

Nenhum processo pode sair do estado de julgamento pendente sem decisão ou sem declaração expressa de
prescrição registrada e motivada.

**Controvérsia/risco (ALTO — o dispositivo de maior exposição institucional do corpus).**

1. **Automaticidade.** O texto não diz se a prescrição opera de pleno direito ou depende de
   declaração. A natureza do instituto e o art. 1º §1º da [REF-LEI-9873-1999] (_"cujos autos serão
   arquivados de ofício ou mediante requerimento da parte interessada"_) apontam para **automática e
   declarável de ofício** — mas isso é **construção interpretativa**, não texto expresso do art. 289-A.
2. **Julgamento tardio.** O texto não diz se decisão proferida após o teto é nula, ineficaz ou
   simplesmente irrelevante.
3. **Suspensão/interrupção.** Não há previsão específica; aplica-se [RN-RAIT-105] (não se suspendem,
   salvo força maior regulamentada — regulamento não localizado).
4. **Intervalo entre instâncias.** O período entre a decisão da JARI e o recebimento pelo CETRAN não
   é computado em nenhum dos dois tetos — lacuna do texto, não interpretação nossa.

Todos os quatro pontos estão em `_intake/legal-assessment.md` como itens de **validação jurídica
humana obrigatória**.

**Decisão.** Owner, em steering (`_meta/steering.md` C.15, 2026-08-24), sem parecer jurídico
formal: a prescrição do art. 289-A é **automática e declarável de ofício** — confirma a leitura
interpretativa do ponto 1 acima. O sistema deve declarar de ofício ao atingir o teto de 24
meses, não apenas alertar. Os pontos 2 (julgamento tardio), 3 (suspensão/interrupção) e 4
(intervalo entre instâncias) **seguem em aberto** — não cobertos pela pergunta de steering.
