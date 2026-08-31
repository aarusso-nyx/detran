---
id: JRN-RAIT-004
title: Gestor monitora o radar de prescrição — nada pode vencer por inércia do próprio órgão
status: draft
apps: [rait, dashboard]
sources: [REF-CTB-extracts-raw, REF-LEI-9873-1999]
updated: 2026-08-24
---

## Persona e contexto

Aline é gestora do RAIT. Seu papel não é julgar nenhum caso individual — é garantir que nenhum caso
chegue perto de três relógios de extinção de punibilidade que existem por culpa exclusiva do órgão,
não do cidadão:

1. **Decadência** — se a NP não sai em 180 dias (ou 360 com defesa prévia) do cometimento, decai o
   direito de aplicar a penalidade ([REF-CTB-extracts-raw] art.282 §§6º-7º).
2. **Prescrição por inércia recursal (24 meses)** — se a JARI ou o CETRAN-AM não julgarem o recurso
   dentro de 24 meses do recebimento, **prescreve a pretensão punitiva** ([REF-CTB-extracts-raw]
   art.285 §6º, art.289 _caput_, **art.289-A**). Não é atraso administrativo: é extinção do processo.
3. **Prescrição intercorrente por paralisação (>3 anos)** — mesmo dentro do prazo total, se um
   processo ficar parado mais de 3 anos aguardando julgamento ou despacho, prescreve por esse motivo
   isolado ([REF-LEI-9873-1999] art.1º §1º).
   Para Aline, um processo prescrito por inércia do órgão não é uma métrica ruim — é uma multa que
   deixa de existir por falha do DETRAN-AM, não por decisão de mérito. É o pior desfecho possível do
   ponto de vista institucional, e o único inteiramente evitável.

## Narrativa ponta-a-ponta

1. **Abertura do dia.** A tela inicial de Aline não é uma lista de processos — é um radar. Processos
   são posicionados por proximidade ao relógio que mais os ameaça (decadência, 24 meses, ou
   paralisação), não por ordem alfabética ou numérica. Vermelho é reservado para o que está a menos
   de X% do teto legal — o desenho evita "vermelho de tudo", que treina o olho a ignorar alertas.
2. **Zoom num caso em risco.** Um processo aparece a 20 meses de um recurso à JARI parado. Aline abre
   e vê: data de recebimento pela JARI, quem é o relator designado, há quanto tempo está sem
   movimentação. A tela não pede que ela recalcule prazo de cabeça — o sistema já traduziu "20 meses"
   em "faltam 4 meses para prescrição irreversível por inércia".
3. **Ação — não é dela julgar, é dela desbloquear.** Aline não pode (nem deve) decidir o mérito. O
   que ela faz é escalar: cobrar o relator, redistribuir se necessário, verificar se falta quorum
   recorrente nas sessões. A interface separa claramente "prazo do cidadão" (que ele já cumpriu, ao
   recorrer a tempo) de "prazo do órgão" (que está em risco) — para nunca sugerir que o atraso é
   culpa de quem recorreu.
4. **O relógio dos 3 anos de paralisação é o mais traiçoeiro.** Diferente do teto de 24 meses (que é
   sobre o processo inteiro), a paralisação conta a partir do último ato/despacho — um processo pode
   estar "dentro" dos 24 meses totais e ainda assim prescrever por 3 anos de silêncio se, por
   exemplo, ficou represado numa diligência sem retomada. O painel de Aline cruza os dois relógios
   simultaneamente por processo, não só o mais óbvio.
5. **Fim do dia — nenhuma surpresa amanhã.** Aline fecha o painel só quando todos os casos no raio
   de risco têm uma ação registrada (mesmo que "aguardando resposta do relator até DD/MM"). O
   objetivo do desenho é que nunca exista um processo que prescreveu "sem ninguém ter visto vir".

## Pontos de contato (apps/canais)

DASHBOARD (radar consolidado, cross-caso). RAIT (drill-down por processo, ação de escalonamento).

## Métricas de sucesso

Zero prescrição por inércia do órgão (decadência, art.289-A, ou Lei 9.873/99) sem alerta prévio
registrado com folga mínima definida; tempo médio entre entrada em zona de risco e ação de
desbloqueio; nenhum processo tratado como "vermelho" sem que o vermelho seja, de fato, acionável.
