---
id: RN-BOAT-115
title: Cena do sinistro, regime 2 — recusa de socorro por condutor solicitado pela autoridade (CTB art. 177), infração autônoma e de sujeito distinto
status: draft
apps: [boat, teat]
sources: [REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** É infração **grave**, autônoma, deixar **o condutor** — qualquer condutor, **não
necessariamente envolvido** no sinistro — de prestar socorro à vítima **quando solicitado pela
autoridade e seus agentes**. É regime distinto do art. 176: muda o **sujeito** (condutor terceiro,
que passava pelo local), muda o **fato gerador** (existe uma solicitação expressa da autoridade,
que não é elemento do art. 176) e muda a **penalidade** (grave, multa, sem suspensão do direito de
dirigir e sem medida administrativa).

**Base legal.** [REF-CTB-sinistro-cena-renaest] art. 177:

> "Art. 177. Deixar o condutor de prestar socorro à vítima de sinistro de trânsito quando solicitado
> pela autoridade e seus agentes: _(Redação dada pela Lei nº 14.599, de 2023)_
>
> Infração - grave; Penalidade - multa."

Contraste deliberado com o art. 176, I (_"Deixar o condutor **envolvido** em sinistro com vítima:
I - de prestar ou providenciar socorro à vítima, **podendo fazê-lo**"_) — [RN-BOAT-114].

**Verificação.** Consequências de captura, todas ausentes do modelo atual:

1. O sujeito do art. 177 **pode não ser parte do sinistro** — não é `CrashVehicle` nem
   `CrashPerson` no sentido do registro; é terceiro convocado. O modelo de dados hoje não tem onde
   registrá-lo, porque só conhece pessoas _envolvidas_.
2. O fato gerador é a **solicitação da autoridade**: para que o auto se sustente, o registro do
   sinistro precisa documentar **que houve solicitação, por quem, a quem e quando** — é o elemento
   probatório do enquadramento, e ele nasce no atendimento (BOAT), não na lavratura (TEAT).
3. A distinção 176 × 177 tem efeito direto sobre a penalidade aplicada — confundir os dois produz
   **erro de enquadramento** com efeito sobre suspensão do direito de dirigir e sobre o
   recolhimento do documento de habilitação, que só existem no art. 176.

**Controvérsia/risco.** A redação do art. 177 é literalmente aberta quanto ao sujeito ("o condutor",
sem qualificação), o que sustenta a leitura de que alcança **também o condutor envolvido** que se
recuse após solicitação — hipótese em que haveria concurso com o art. 176, I. Nenhuma norma
localizada disciplina esse concurso (a classificação de infrações concorrentes/concomitantes do MBFT
— [REF-CONTRAN-985-1003-MBFT] Seção 6, base de [RN-TEAT-103] — não trata expressamente destes
tipos). **Leitura de trabalho adotada, rotulada como interpretação:** para o condutor **envolvido**,
a omissão de socorro é o art. 176, I, ainda que precedida de solicitação — o art. 177 é a hipótese
do **não envolvido**, cuja única fonte de dever é a convocação da autoridade. É interpretação sobre
silêncio; item 19 de `_intake/legal-assessment.md`.
