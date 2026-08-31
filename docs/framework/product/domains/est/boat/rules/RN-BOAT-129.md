---
id: RN-BOAT-129
title: Bodycam no atendimento a sinistro — obrigatória por Portaria DETRAN-AM 003/2026, com agravamento do risco de dado sensível
status: draft
apps: [boat, teat]
sources: [REF-DETRANAM-TALAO-BODYCAM, REF-LEI-13709-2018]
updated: 2026-08-24
---

**Regra.** O **atendimento a sinistros de trânsito** é a **primeira hipótese** de uso obrigatório de
câmera corporal pelos agentes do DETRAN-AM (Portaria Normativa 003/2026, art. 4º, I). Em
consequência, **todo atendimento de sinistro em campo tem, por norma, uma gravação correlata** — o
que vale para o BOAT exatamente como já foi estabelecido para o TEAT. O regime completo (gravação
contínua e íntegra, vedações ao agente, comunicação de falha, acesso restrito por requisição, limites
de divulgação, ausência de prazo de retenção) **não é reescrito aqui**: está em [RN-TEAT-141] e
[RN-TEAT-142], e esta regra apenas o **estende ao domínio do sinistro** e registra o que muda quando
o objeto filmado é uma vítima.

**Base legal.** [REF-DETRANAM-TALAO-BODYCAM] §2 — Portaria Normativa nº 003/2026-DP/DETRAN/AM:

> "Art. 4º Os agentes de trânsito em serviço deverão utilizar as câmeras corporais,
> obrigatoriamente, nas seguintes situações: **I - Atendimento a sinistros de trânsito**; [...]
> VIII - Toda interação entre agente de trânsito e condutor ou usuário da via; [...]"
>
> "Art. 14. A divulgação ou compartilhamento de registros não poderá comprometer: I – O direito de
> imagem dos envolvidos, **especialmente em situações constrangedoras ou que exponham sua
> integridade física**; II – A proteção de crianças e adolescentes."

Complementa: [REF-LEI-13709-2018] art. 5º, II (dado referente à saúde é dado sensível — e a imagem
de pessoa ferida, socorrida ou morta **revela** dado de saúde) e art. 11, § 1º (_"Aplica-se o
disposto neste artigo a qualquer tratamento de dados pessoais que **revele** dados pessoais sensíveis
e que possa causar dano ao titular"_).

**Verificação.** O que muda em relação ao regime já modelado no TEAT:

1. **A gravação de sinistro contém, tipicamente, dado sensível de saúde de terceiro** — imagem de
   pessoa ferida, procedimento de socorro, óbito. Pelo art. 11, § 1º da LGPD, o regime do dado
   sensível alcança **qualquer tratamento que revele** dado sensível: a gravação de uma cena de
   sinistro é, juridicamente, tratamento de dado de saúde, e não apenas de imagem.
2. O art. 14, I da Portaria — proteção reforçada em _"situações constrangedoras ou que exponham sua
   integridade física"_ — descreve **precisamente** a cena de sinistro. É o dispositivo da Portaria
   mais diretamente aplicável ao BOAT.
3. Vale integralmente a modelagem de [RN-TEAT-141]: correlação por **janela temporal** (dispositivo,
   início/fim do atendimento, agente, geolocalização), **nunca** anexação de arquivo; nenhuma função
   de cópia, exclusão ou transferência exposta ao `field-agent`; comunicação de falha como evento de
   primeira classe.
4. Vale integralmente o regime de acesso de [RN-TEAT-142]: **não** é consulta livre de papel de
   RBAC; é requisição formal de autoridade qualificada, com finalidade declarada e entrega
   controlada.
5. **Recomendação mantida da rodada TEAT, reforçada aqui:** enquanto não houver Portaria
   complementar (art. 16, "casos omissos") com prazo de retenção e base legal de tratamento, **não
   integrar o acervo de bodycam ao BOAT como fonte de evidência consultável** — apenas registrar a
   existência da gravação e sua janela.

**Controvérsia/risco.** _Severidade: alta._ As três lacunas de [RN-TEAT-142] — ausência de prazo de
retenção, ausência do interessado no rol de acesso, e **a LGPD não mencionada uma única vez** na
Portaria — **agravam-se** no contexto do sinistro, porque aqui o material gravado é dado sensível de
saúde de terceiro que não é parte de nenhum processo e nunca consentiu em nada. Some-se que a
Portaria **não prevê tratamento diferenciado para a cena de sinistro**, apesar de listá-la como
primeira hipótese de gravação obrigatória. É matéria que cabe expressamente nos casos omissos do
art. 16 e que deve constar da consulta ao Encarregado e ao CPPD do DETRAN-AM. Item 6 de
`_intake/legal-assessment.md`; handoff BPO nº 4 do `_intake/research-dossier.md`.
