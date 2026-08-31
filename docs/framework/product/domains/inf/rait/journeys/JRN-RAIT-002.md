---
id: JRN-RAIT-002
title: Relator prepara voto e conduz a sessão de julgamento da JARI
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-357,
    REF-CETRAN-PROCESSO-INTERNO,
    REF-CTB-extracts-raw,
    REF-CONTRAN-918,
  ]
updated: 2026-08-24
---

## Persona e contexto

Raimundo é integrante da JARI-AM (colegiado de no mínimo 3 membros — [REF-CONTRAN-357] item 4.1),
designado relator de um lote de recursos por sorteio (desenho proposto, inspirado no modelo
CETRAN-ES — [REF-CETRAN-PROCESSO-INTERNO]; o regimento interno da JARI-AM não foi localizado
publicamente, então este desenho é uma proposta a validar com o BPO/regimento local quando existir,
não uma norma confirmada). Ele concilia essa função com outra atividade no órgão — não é dedicação
exclusiva — então cada minuto de leitura precisa render.

## Narrativa ponta-a-ponta

1. **Recebimento do lote.** Raimundo vê os recursos distribuídos a ele com prazo interno de parecer
   sinalizado (proposta de desenho: 20 dias, referência CETRAN-ES; não é o teto legal — o teto legal
   real do julgamento colegiado é 24 meses, [REF-CTB-extracts-raw] art.285 §6º/art.289 — o prazo
   interno existe só para o órgão nunca chegar perto do teto). O sistema mostra, para cada processo,
   quantos dias já correram desde a interposição do recurso.
2. **Leitura do dossiê.** Cada processo chega com o parecer da autoridade de 1ª instância (quando
   aplicável), os fatos, anexos e a instrução já feita pelo analista ([JRN-RAIT-001]) — Raimundo não
   parte do zero; o dossiê é montado para leitura corrida, não uma pasta de documentos soltos.
3. **Redação do voto.** Ele registra resumo descritivo + análise fundamentada + voto (provimento /
   não provimento), no mesmo padrão estruturado para todos os relatores — facilita a leitura pelos
   demais membros na sessão.
4. **Fechamento de pauta.** A secretaria monta a pauta da sessão a partir dos votos prontos
   ([WF-RAIT-002] — marcador de backlog do BPO); Raimundo confirma disponibilidade e recebe a pauta
   com antecedência para revisão dos votos dos colegas.
5. **Sessão da JARI.** Presencial ou por videoconferência. O sistema verifica quorum antes de abrir
   (maioria simples com presença obrigatória do presidente ou suplente — [REF-CONTRAN-357] item 8.2)
   e bloqueia a abertura se não atingido, evitando decisão inválida por vício de quorum. Para cada
   processo pautado: Raimundo apresenta o voto, os demais deliberam, o resultado (provido/negado) é
   registrado ao vivo — não depois, de memória.
6. **Ata.** A ata é gerada a partir dos registros da sessão (não redigida do zero depois) — resultado
   por processo, votos, presença, ressalvas. Fundamentação e publicidade são obrigatórias
   ([REF-CONTRAN-357] item 8.3).
7. **Comunicação.** Ao encerrar a sessão, os resultados dos processos disparam a comunicação ao
   cidadão pelo PORTAL no mesmo dia ([REF-CONTRAN-918] art.17) — Raimundo não precisa de nenhuma
   ação extra para isso acontecer.

## Pontos de contato (apps/canais)

RAIT (distribuição, dossiê, voto, pauta, sessão, ata). PORTAL (destino da comunicação de decisão).
DASHBOARD (acompanhamento de prazo por relator/processo, radar de prescrição — ver [JRN-RAIT-004]).

## Métricas de sucesso

Tempo entre distribuição e voto pronto; % de sessões abertas sem retrabalho de quorum; ata publicada
no mesmo dia da sessão; zero processo pautado que não teve comunicação de resultado disparada em até
24h.

## Decisões pendentes (marcadores de backlog)

- Composição/quorum/distribuição por sorteio aqui descritos seguem [REF-CONTRAN-357] (diretriz
  nacional) e o benchmark [REF-CETRAN-PROCESSO-INTERNO] (ES) — regimento próprio da JARI-AM não
  localizado; validar com BPO/LEGAL antes de tratar como definitivo.
- [WF-RAIT-002] (distribuição/SLA) e [WF-RAIT-003] (sessões) — em elaboração pelo especialista BPO
  em paralelo; esta jornada referencia seus estados como âncora de desenho, não como fonte fechada.
