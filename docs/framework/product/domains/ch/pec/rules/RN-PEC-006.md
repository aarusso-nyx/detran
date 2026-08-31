---
id: RN-PEC-006
title: Encerramento do episódio exige exames completos, laudos assinados, sem bloqueios ativos, sem junta pendente e RENACH confirmado
status: draft
apps: [pec]
sources:
  - pec:domain/encounters-clinical-encounter/api/src/encounters/encounters.service.ts
  - pec:database/ddl/80-cross-objects.sql
  - pec:docs/framework/pec/flows/encerramento-exportacao.md
  - REF-CONTRAN-927-2022
  - REF-CONTRAN-789-2020
  - REF-CTB-147-148-habilitacao
  - REF-DETRANAM-PORTARIA-005-2021
updated: 2026-08-24
---

**Regra.** Um encounter só pode ser encerrado (`status='CLOSED'`) se, simultaneamente: (1) **todos
os exames devidos naquele processo** foram realizados — o exame médico sempre; a avaliação
psicológica **apenas nas hipóteses em que é exigida** ([RN-PEC-103]); (2) os laudos correspondentes
foram assinados; (3) não há `process_blocks` ativos (ex.: pré-condição toxicológica pendente,
inconsistência de dados aberta); (4) não há caso de junta médica pendente (status diferente de
`DECIDED`); (5) se o resultado médico é **"apto com restrições"** (`CONDICIONADO` no enum interno —
ver correção abaixo), ao menos uma restrição de CNH **codificada conforme o Anexo XV** da Res.
927/2022 foi aplicada; (6) a transmissão do encounter ao RENACH já foi confirmada (`ACKED`) — o
fechamento verifica, não dispara, a publicação. Qualquer violação bloqueia o fechamento por completo
(tudo-ou-nada), listando os itens faltantes.

**⚠ Correção de nomenclatura (CONTRADIÇÃO confirmada — ver [RN-PEC-105]).** O valor
`medical_result = 'CONDICIONADO'` **não corresponde a nenhum rótulo normativo**: o termo não existe
na Res. CONTRAN 927/2022, na Portaria DETRAN-AM 005/2021 nem no CTB. O rótulo legal equivalente é
**"apto com restrições"** ([REF-CONTRAN-927-2022] art. 8º, II) — e ele existe **apenas na trilha
médica**; a avaliação psicológica tem taxonomia própria de três valores, sem equivalente. O enum
interno pode ser mantido como identificador, mas **o valor exibido, transmitido ao RENACH e impresso
em qualquer documento deve ser o rótulo legal**. Regra de mapeamento completa em [RN-PEC-105].

**Base legal.** _(Resolvida na rodada LEGAL de 2026-08-24.)_

- [REF-CONTRAN-927-2022] art. 8º, II e parágrafo único: _"apto com restrições - quando houver
  necessidade de registro na CNH de qualquer restrição referente ao condutor ou adaptação
  veicular"_; _"No resultado 'apto com restrições' constarão da CNH as observações codificadas no
  Anexo XV."_ — é o fundamento do item (5) do gate: o rótulo **existe para** carregar a codificação,
  e sem código não tem conteúdo.
- [REF-CONTRAN-927-2022] art. 9º: taxonomia da avaliação psicológica (três valores, sem "apto com
  restrições"); § 2º (apto com validade diminuída) e § 3º (resultado disponibilizado em **dois dias
  úteis**).
- [REF-CONTRAN-927-2022] art. 10, § 2º: na inaptidão (temporária ou permanente), comunicação para
  **bloqueio imediato do cadastro nacional** — ver [RN-PEC-106].
- [REF-CTB-147-148-habilitacao] art. 147, § 3º, e [REF-CONTRAN-789-2020] art. 5º, § 2º: hipóteses em
  que a avaliação psicológica é exigida — fundamento da correção do item (1).
- [REF-DETRANAM-PORTARIA-005-2021] art. 34, § 9º: vocabulário local de cinco rótulos, divergente —
  ver a controvérsia em [RN-PEC-105].

**Verificação.** `assertClosureReady()` lê `pec.v_episode_summary` e lança `BadRequestException`
listando cada pré-condição não satisfeita. Ver [WF-PEC-001] §"Gate de encerramento" e
[UC-PEC-008].

**Correções e lacunas da auditoria legal (2026-08-24).**

1. **Item (1) corrigido — gate impossível de satisfazer.** Exigir que _"exame médico **e** exame
   psicológico"_ tenham sido realizados torna o encerramento **legalmente impossível** na renovação
   de condutor **não** remunerado, hipótese em que a avaliação psicológica **não é devida**
   (CTB art. 147, § 3º). A condição passa a ser "todos os exames **devidos**", e a fonte da
   exigibilidade é o motivo do processo + o indicador de atividade remunerada ([RN-PEC-103]).
2. **Item (5) corrigido na nomenclatura** e reforçado no conteúdo: a restrição deve ser **codificada
   conforme o Anexo XV** — anexo **não capturado** (publicado separadamente, art. 30 da Res.
   927/2022), o que deixa o campo sem domínio de valores validável. Item de pesquisa prioritário.
3. **Falta um gate: o resultado de inaptidão.** Nada no gate atual reflete o **bloqueio do cadastro
   nacional** do art. 10, § 2º — que é obrigação com qualificador de urgência ("imediato") e
   destinatário próprio (setores médico e psicológico do órgão), distinto da fila genérica de
   [RN-PEC-008]. Ver [RN-PEC-106].
4. **Faltam dados obrigatórios do laudo**: prazo de inaptidão (inapto temporário, art. 9º, § 1º) e
   validade reduzida (apto com validade diminuída, art. 9º, § 2º) — sem eles o desbloqueio no
   vencimento é inoperável.
5. **Item (4) é insuficiente diante da cadeia real de três instâncias** ([RN-PEC-110]): "junta
   pendente" hoje só conhece um caso; a norma prevê Junta Médica, Junta Psicológica e Junta Especial
   de Saúde, com prazos próprios ([RN-PEC-112]).
6. **Item (6) permanece sem base normativa quanto ao SLA** — mas a **existência** da transmissão tem
   base legal (CTB art. 147, § 1º), ver [RN-PEC-008].

**Revisão (2026-08-24, especialista LEGAL).** **CONTRADIÇÃO nº 1 do dossiê corrigida** (nomenclatura
de resultado). Item (1) do gate corrigido por incompatibilidade com o CTB art. 147, § 3º. Base legal
preenchida; quatro lacunas acrescentadas.
