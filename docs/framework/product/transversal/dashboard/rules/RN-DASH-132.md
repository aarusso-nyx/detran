---
id: RN-DASH-132
title: Vigilância da escada de revisão do PEC — cinco prazos, dois preclusivos do candidato e três do órgão sem sanção
status: draft
apps: [dashboard, pec]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** A cadeia de revisão do exame de aptidão física e mental e da avaliação psicológica tem
**três instâncias** ([RN-PEC-110]) e **cinco prazos numéricos** ([RN-PEC-112]), com uma assimetria que
governa todo o desenho do monitoramento: **os prazos do administrado são preclusivos** (vencidos,
extinguem o direito de provocar a instância) e **os prazos do órgão não têm sanção cominada**. O
DASHBOARD deve monitorar os dois grupos, mas por razões opostas — os primeiros para **não induzir o
cidadão a perder direito**, os segundos porque são **SLA legal sem consequência**, e portanto os que
mais silenciosamente se degradam.

| #   | Ato                                              | Prazo             | Termo inicial                            | Sujeito   | Natureza             |
| --- | ------------------------------------------------ | ----------------- | ---------------------------------------- | --------- | -------------------- |
| 1   | Requerer instauração de Junta Médica/Psicológica | **30 dias**       | conhecimento do resultado pelo candidato | candidato | **preclusivo**       |
| 2   | Designar a Junta                                 | **15 dias úteis** | recebimento do requerimento              | **órgão** | SLA legal sem sanção |
| 3   | Junta proferir o resultado                       | **30 dias**       | data da designação                       | **Junta** | SLA legal sem sanção |
| 4   | Recorrer ao CETRAN/CONTRANDIFE                   | **30 dias**       | conhecimento do resultado da revisão     | candidato | **preclusivo**       |
| 5   | Remeter os documentos ao CETRAN                  | **20 dias úteis** | recebimento do recurso                   | **órgão** | SLA legal sem sanção |

Detalhe que o painel precisa modelar corretamente: os prazos 2 e 5 são em **dias úteis**; os demais em
**dias corridos**. Misturar as duas contagens é o erro clássico deste domínio, e ele produz alerta
sistematicamente errado — usar o calendário nacional + estadual (AM) já aprovado em steering A.6.

**O que deve ser monitorado.**

1. **Prazos 2, 3 e 5 (do órgão), por episódio de revisão**, com idade e vencimento. São os únicos sobre
   os quais o órgão pode agir, e os únicos cuja degradação é responsabilidade sua.
2. **Composição do colegiado como precondição de validade** — três profissionais na 2ª instância; no
   mínimo três, sendo **dois especialistas**, na Junta Especial de Saúde ([RN-PEC-111]). A composição é
   **requisito de validade da decisão**, não detalhe organizacional: uma junta que decidiu com
   composição irregular produziu decisão viciada. O painel deve exibir **quantas designações do período
   atenderam à composição mínima**, e não pressupor conformidade.
3. **Estoque de requerimentos aguardando designação** — o gargalo do prazo 2 é de disponibilidade de
   perito, e é previsível pela fila.
4. **Prazos 1 e 4 (do candidato)** apenas como **janela informativa agregada**: quantos resultados
   foram comunicados na semana e, portanto, quantas janelas de 30 dias estão abertas. Serve para
   dimensionar demanda futura — **não** para acompanhar candidato individualmente no painel interno.

**Consequência legal da perda.** Para o candidato: **preclusão** — extinção do direito de provocar a
instância. Para o órgão: **nenhuma sanção cominada**. Registrar isso com honestidade é importante,
porque é o mesmo padrão já identificado no domínio `inf` (`inf/rait/_intake/legal-assessment.md`
§ 1.2, item 4) e porque a tentação de inventar consequência ("gera nulidade") não tem base localizada.
O risco real do estouro dos prazos 2, 3 e 5 é **de segunda ordem e é grave**: o candidato fica com a
habilitação represada por prazo indeterminado, o que gera contencioso individual e, no agregado,
reclamação de ouvidoria ([RN-DASH-116]) e queda no indicador público de qualidade ([RN-DASH-117]).

**Alerta mínimo para demonstrar diligência.**

- Degraus em **50% / 75% / 90%** do prazo, coerentes com a calibração de prazos curtos já aprovada
  para o relógio A do RAIT (steering A.1) — prazos de 15 a 30 dias não comportam escada de meses.
- **Destinatário por prazo**: prazo 2 e 5 escalam para a administração do órgão (é ato administrativo
  de designação e de remessa); prazo 3 escala para a coordenação da Junta.
- **Alerta de composição** no momento da designação, não depois da decisão — corrigir composição antes
  de decidir é saneamento; depois é anulação.

**Verificação.**

1. Painel de **episódios de revisão em aberto**, por instância, ordenado por idade.
2. **Percentual de designações dentro de 15 dias úteis** e **de resultados dentro de 30 dias** — série
   mensal. São métricas publicáveis em agregado ([RN-DASH-117], art. 23, III).
3. **Nenhum dado clínico no painel.** O DASHBOARD monitora **estados e prazos** do episódio de revisão
   (requerido, designado, decidido, remetido), **nunca** resultado, diagnóstico, restrição ou
   justificativa clínica. Dado de saúde é sensível ([REF-LEI-13709-2018] art. 5º, II) e sua exibição em
   painel de gestão não tem necessidade demonstrável — ver [RN-DASH-162] e [RN-DASH-170].
4. Contagem em **dias úteis** para os prazos 2 e 5, com o calendário de feriados explicitamente
   configurado e exibível.

**Controvérsia/risco.** _Severidade: média._ A composição das juntas não está modelada hoje no PEC
(`shared/actors.md` registra "composição não modelada hoje (backlog)"), o que significa que o item 2
acima **não tem dado de origem** até que o app o produza. Enquanto isso, o indicador de composição deve
aparecer como **"não instrumentado"** — estado explícito, no mesmo espírito de [RN-DASH-113] —, jamais
como conformidade presumida.
