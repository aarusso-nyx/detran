---
id: UC-TEAT-009
title: Agente aciona remoção do veículo e avalia guarda monitorada
status: reviewed
apps: [teat]
sources: [REF-CONTRAN-1025-2026, REF-CTB-165-277-medidas-alcoolemia]
updated: 2026-08-28
---

## Ator e objetivo

Agente de trânsito aciona a remoção do veículo (CTB art. 271) e emite o Termo de Recolhimento do
Veículo com conteúdo mínimo normatizado. Este UC também documenta a alternativa de **guarda
monitorada** ([REF-CONTRAN-1025-2026]) — passos 4, 5a, 5a-1 e os critérios de aceitação
AC-TEAT-009-5/6/7 abaixo —, mas **essa parte está fora do escopo do MVP** (decisão do Owner,
2026-08-28, `_meta/open-issues.md` DT-015): mantida como registro de desenho, não como escopo de
construção atual. No MVP, o passo 4 é pulado e toda remoção segue para `EM_DEPOSITO` (passo 5b).

## Pré-condições

- Hipótese de remoção configurada: conversão de retenção não regularizada ([UC-TEAT-008]),
  condutor habilitado ausente no local, ou remoção direta prevista em norma.
- Se avaliando guarda monitorada: dados do veículo/proprietário disponíveis para checagem dos 9
  requisitos de elegibilidade ([WF-TEAT-004] §Guarda monitorada).

## Fluxo principal

1. Agente registra a remoção (`ait-measures` → fluxo de remoção, grupo
   `medidas-administrativas`).
2. Sistema exige o preenchimento do Termo de Recolhimento do Veículo com, no mínimo: órgão
   responsável, identificação do veículo, número do AIT/ordem judicial/ato administrativo que
   determinou a remoção, local/data/hora, fundamento legal, local de guarda, identificação de
   proprietário e condutor quando possível ([REF-CONTRAN-1025-2026] art. 14, _caput_).
3. Sistema exige também: objetos deixados no veículo, equipamentos obrigatórios ausentes, estado
   geral de lataria/pintura/pneus, prazo para retirada sob pena de leilão (art. 14 §1º).
4. **[FORA DO MVP — DT-015]** Agente avalia se o caso é elegível para **guarda monitorada** em vez de remoção física —
   checagem estruturada dos 9 requisitos do art. 17 §1º (condições de segurança, ausência de
   indícios de adulteração, condutor habilitado, ausência de ocorrência criminal/restrição
   judicial, alienação fiduciária regular, licenciamento recente, ausência de descumprimento
   anterior, ausência de circunstâncias que comprometam a fiscalização).
   5a. **[FORA DO MVP — DT-015] Elegível e autorizado** (decisão do órgão — "prerrogativa", não
   direito automático do condutor): veículo permanece com o proprietário sob monitoramento
   eletrônico homologado (`GUARDA_MONITORADA`, [WF-TEAT-004]).
   5b. **No MVP, único caminho**: veículo é levado a depósito (`EM_DEPOSITO`).
5. Se proprietário/condutor presente no ato: é considerado notificado, mesmo que se recuse a
   assinar o termo ([REF-CONTRAN-1025-2026] art. 14 §2º — mesmo padrão de [RN-TEAT-005]).
   7a. Se ausente: sistema registra a pendência de notificação em até 10 dias (postal, edital, ou SNE
   — marco de exclusividade SNE a partir de 01/01/2027, art. 15 §3º).

## Fluxos alternativos / exceções

- **5a-1. [FORA DO MVP — DT-015] Violação da guarda monitorada.** Descumprimento, remoção, inutilização ou violação do
  dispositivo de monitoramento (art. 17 §3º) → dupla consequência: (a) restrição administrativa de
  circulação + remoção compulsória ao depósito, **vedada nova guarda monitorada para o mesmo fato
  gerador**; (b) autuação autônoma por CTB art. 239, de competência do próprio órgão de remoção —
  gera um **novo AIT**, entrando em [WF-TEAT-001] como qualquer outro ato (ver [WF-TEAT-004]
  §Estados sub-máquina B).
- **Restituição**: pagamento de multas/taxas/despesas de remoção e estada, mais reparo de
  condições de segurança, condiciona a liberação do veículo removido (CTB art. 271 §§1º-2º) — fora
  do ato de campo TEAT, backoffice.
- **Leilão** (CTB art. 328): não reclamado no prazo legal — explicitamente **fora do escopo de
  campo** do TEAT ([WF-TEAT-004] §Escopo e fronteira de campo).

## Pós-condições

Termo de Recolhimento do Veículo emitido com conteúdo mínimo completo; veículo em um dos dois
regimes (`EM_DEPOSITO` ou `GUARDA_MONITORADA`); notificação do proprietário/condutor registrada ou
pendente com prazo ativo.

## Critérios de aceitação

**AC-TEAT-009-1 — remoção só nas hipóteses fechadas**

- **Dado** uma tentativa de acionar remoção
- **Quando** a hipótese não consta do rol normativo
- **Então** o sistema bloqueia ([RN-TEAT-125]) e registra o marco do **início da operação de
  remoção**, que é o instante a partir do qual as consequências patrimoniais correm

**AC-TEAT-009-2 — o Termo exige os 11 elementos**

- **Dado** um Termo de Recolhimento em preenchimento
- **Quando** o agente tenta emiti-lo
- **Então** o sistema exige os 7 campos do _caput_ e os 4 do §1º do art. 14 — objetos deixados,
  equipamentos obrigatórios ausentes, estado de conservação e prazo de retirada ([RN-TEAT-126])

**AC-TEAT-009-3 — presente é notificado, ainda que recuse assinar**

- **Dado** proprietário ou condutor presente no ato
- **Quando** recusa assinar o Termo
- **Então** a notificação é válida e assim registrada ([RN-TEAT-126]) — a recusa é gravada como
  recusa, não como ausência

**AC-TEAT-009-4 — ausente abre prazo de notificação de 10 dias**

- **Dado** proprietário ausente
- **Quando** o Termo é emitido
- **Então** o sistema abre pendência de notificação em até 10 dias e registra os prazos de custódia
  oponíveis desde o ato: 30 dias para edital, 60 para leilão, seis meses de diárias
  ([RN-TEAT-128])

**AC-TEAT-009-5 [FORA DO MVP — DT-015] — os nove requisitos da guarda monitorada são checados um a um**

- **Dado** a avaliação de elegibilidade
- **Quando** o agente a percorre
- **Então** o sistema exige veredito individual para cada um dos nove requisitos do art. 17 §1º
  ([RN-TEAT-127]) — nunca um único botão "elegível"

**AC-TEAT-009-6 [FORA DO MVP — DT-015] — guarda monitorada é prerrogativa do órgão, não direito do condutor**

- **Dado** um caso elegível
- **Quando** a decisão é registrada
- **Então** a autorização é ato do órgão, com responsável identificado — elegibilidade confirmada
  não concede a modalidade automaticamente

**AC-TEAT-009-7 [FORA DO MVP — DT-015] — violação da guarda produz duas consequências, não uma**

- **Dado** violação do dispositivo de monitoramento
- **Quando** é registrada
- **Então** o sistema (a) impõe remoção compulsória ao depósito e veda nova guarda monitorada para
  o mesmo fato gerador, **e** (b) abre um **novo AIT** por CTB art. 239, que entra em
  [WF-TEAT-001] como qualquer outro ([RN-TEAT-127]) — as duas, nunca só uma

**AC-TEAT-009-8 — o prazo de retirada impresso é o correto**

- **Dado** o Termo entregue ao interessado
- **Quando** ele é impresso
- **Então** exibe **60 dias** para o leilão, e não 30 — a correção registrada em `_meta/backlog.md`
  §Rodada TEAT deve estar refletida no template ([RN-TEAT-128])

## Regras aplicáveis

- [RN-TEAT-005] (notificação válida mesmo com recusa de assinatura — padrão estendido ao Termo de
  Recolhimento)
- [RN-TEAT-126] (Termo de Recolhimento do Veículo — conteúdo mínimo de 11 elementos e
  notificação válida mesmo com recusa de assinatura)
- [RN-TEAT-127] (guarda monitorada — nove requisitos cumulativos e infração autônoma na violação)
- [RN-TEAT-128] (prazos de custódia oponíveis já no ato de campo — 30 dias para o edital, 60 para
  o leilão, seis meses de diárias)
