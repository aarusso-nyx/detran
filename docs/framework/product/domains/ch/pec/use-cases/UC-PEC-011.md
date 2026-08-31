---
id: UC-PEC-011
title: Registrar resultado "apto com restrições" e emitir código de restrição para a CNH
status: reviewed
apps: [pec]
sources:
  - REF-CONTRAN-927-2022
  - REF-DETRANAM-PORTARIA-005-2021
  - RN-PEC-006
  - RN-PEC-105
  - RN-PEC-106
  - WF-PEC-001
updated: 2026-08-26
---

## Ator e objetivo

Médico (ou Psicólogo, quando aplicável) registra um resultado que exige restrição/adaptação
registrada na CNH do candidato, usando a codificação oficial do Anexo XV da Res. CONTRAN
927/2022, e o sistema garante que o gate de encerramento não fecha o episódio sem essa
restrição aplicada. Origem: motivado pelo achado de nomenclatura do dossiê CRAWLER
(`_intake/research-dossier.md` §4, RN-PEC-006) — nenhuma fonte legal ou local usa o rótulo
`CONDICIONADO` do schema do PEC.

**Nota de escopo.** Este UC não resolve sozinho o mapeamento de enum — essa é matéria de correção
de [RN-PEC-006]/[RN-PEC-105], fora da fronteira de escrita deste agente (BPO); a rodada LEGAL
paralela já produziu [RN-PEC-105] (vocabulário) e [RN-PEC-106] (efeitos jurídicos do resultado),
que fixam a leitura de trabalho usada abaixo. O que este UC acrescenta é o **fluxo operacional**
em torno do resultado, hoje ausente: como o código de restrição chega da decisão clínica até o
campo que o RENACH espera.

## Vocabulário confirmado (referência, não normativo deste UC)

| Fonte                                          | Rótulos                                                                 | Prazos associados                                                                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Res. CONTRAN 927/2022 art. 8º (médico)         | apto / apto com restrições / inapto temporário / inapto                 | nenhum prazo numérico por rótulo, exceto o teto de validade do exame ([WF-PEC-001])                                                                        |
| Res. CONTRAN 927/2022 art. 9º (psicológico)    | apto / inapto temporário / inapto                                       | inapto temporário: prazo de inaptidão consignado caso a caso (§1º); apto com prazo reduzido, se distúrbio controlado (§2º)                                 |
| Portaria DETRAN-AM 005/2021 art. 34 §9º        | APTO / APTO COM RESTRIÇÕES / PENDENTE / INAPTO / INAPTO TEMPORARIAMENTE | 30 / 60 / 90 / 365 dias, respectivamente (associação exata rótulo↔prazo não está explícita no excerto capturado — **fonte pendente**, verificar com LEGAL) |
| `pec.encounters.medical_result` (schema atual) | `CONDICIONADO` (entre outros não citados no corpus)                     | —                                                                                                                                                          |

## Pré-condições

- Exame médico (ou avaliação psicológica) concluído, com achado que justifica restrição.

## Fluxo principal

1. Médico registra o resultado do exame médico como "apto com restrições" (≡ `CONDICIONADO` no
   schema atual, [RN-PEC-105]) e o(s) código(s) de restrição aplicável(is) conforme o Anexo XV da
   Res. 927/2022 (anexo não capturado nesta rodada — ver `refs/INDEX.md` §Gaps). **Este rótulo
   não existe na trilha psicológica** — o psicólogo nunca registra "apto com restrições"; o
   equivalente funcional psicológico é "apto com validade diminuída" ([RN-PEC-105] item 2).
2. Sistema grava o resultado e associa ao menos uma `pec.encounter_restrictions`.
3. Laudo é emitido e assinado normalmente ([UC-PEC-006]).
4. Gate de encerramento ([RN-PEC-006] item 5) verifica: se o resultado é o equivalente a "apto
   com restrições", exige ao menos uma restrição aplicada antes de permitir `CLOSED`.
5. Evento de transmissão ao RENACH inclui o código de restrição.
6. Se, em vez disso, o resultado for "inapto" ou "inapto temporário" (médico ou psicológico):
   [RN-PEC-106] exige comunicação **imediata** do perito aos setores médico/psicológico do
   DETRAN-AM para bloqueio do cadastro nacional — fluxo distinto deste UC, não coberto aqui (ver
   nota em [WF-PEC-001] §"Decisões de modelagem pendentes").

## Fluxos alternativos / exceções

- **Resultado "inapto temporário" ou equivalente com prazo de validade**: o prazo de inaptidão
  precisa ser consignado (art. 9º §1º) e comunicado ao candidato — nenhuma tela/campo dedicado
  confirmado nos documentos de implementação capturados; candidato a gap de UX (ver
  `_intake/research-dossier.md` §7).
- **Resultado sem código de restrição aplicável mas marcado como "com restrições"**: bloqueado
  pelo gate de encerramento — força a correção antes do fechamento.
- **Divergência de vocabulário não resolvida**: enquanto [RN-PEC-006] não for corrigida por
  LEGAL, o mapeamento entre `CONDICIONADO` e o rótulo legal correto ("apto com restrições") é
  uma tradução manual/documental, não uma correspondência de enum garantida pelo sistema — risco
  operacional a comunicar às equipes que preenchem o resultado.

## Pós-condições

- Resultado registrado com código(s) de restrição, quando aplicável.
- Restrição refletida no laudo assinado e no evento transmitido ao RENACH.

## Critérios de aceitação

**AC-PEC-011-1 — o vocabulário exposto é o legal**

- **Dado** um resultado com restrições
- **Quando** é exibido ou transmitido
- **Então** usa os rótulos federais — apto, apto com restrições, inapto temporário, inapto
  ([RN-PEC-105]); `CONDICIONADO` **não existe em norma alguma** e não pode aparecer em nenhuma
  superfície voltada ao candidato (DT-102)

**AC-PEC-011-2 — "apto com restrições" não existe na trilha psicológica**

- **Dado** uma avaliação psicológica
- **Quando** o resultado é registrado
- **Então** o rótulo não é oferecido; o equivalente funcional é "apto com validade diminuída"
  ([RN-PEC-105] item 2) — as duas taxonomias são distintas e o sistema não as mistura

**AC-PEC-011-3 — restrição declarada exige código aplicado**

- **Dado** um resultado marcado com restrições
- **Quando** o encerramento é tentado
- **Então** ao menos um código do Anexo XV da Res. 927/2022 está aplicado ([RN-PEC-006] item 5)

**AC-PEC-011-4 — inapto temporário consigna o prazo**

- **Dado** um resultado de inaptidão temporária
- **Quando** é registrado
- **Então** o prazo é consignado e comunicado ao candidato (art. 9º §1º) — hoje não há campo
  dedicado confirmado, e o gap é de UX, não de norma

**AC-PEC-011-5 — inaptidão dispara comunicação imediata para bloqueio**

- **Dado** um resultado inapto ou inapto temporário
- **Quando** é assinado
- **Então** o sistema comunica imediatamente os setores médico/psicológico do DETRAN-AM para
  bloqueio do cadastro nacional ([RN-PEC-106]) — é fluxo próprio, e sua ausência é gap de produto

**AC-PEC-011-6 — o candidato tem direito à devolutiva**

- **Dado** um resultado desfavorável
- **Quando** o candidato o consulta
- **Então** tem acesso ao próprio dossiê e à entrevista devolutiva com o perito ([RN-PEC-153]) —
  a superfície é do PORTAL, mas o direito nasce aqui

## Regras aplicáveis

- [RN-PEC-006] (gate de encerramento — item 5, exige restrição quando o resultado a demanda)
- [RN-PEC-105] (vocabulário legal do resultado — correção de enum já formalizada)
- [RN-PEC-106] (efeitos jurídicos do resultado — bloqueio de cadastro, prazo de inaptidão,
  restrição codificada na CNH)
