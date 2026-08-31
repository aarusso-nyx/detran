---
id: RN-PEC-106
title: Efeitos jurídicos do resultado — bloqueio imediato do cadastro nacional na inaptidão, prazo de inaptidão na planilha RENACH e restrição codificada na CNH
status: draft
apps: [pec, portal]
sources: [REF-CONTRAN-927-2022, REF-CTB-147-148-habilitacao]
updated: 2026-08-24
---

**Regra.** O resultado não é apenas um dado registrado: **cada valor dispara um ato administrativo
distinto**, e três deles saem do perímetro do PEC.

1. **Inapto temporário ou inapto (médico ou psicológico):** o perito examinador **deve comunicar o
   resultado aos setores médico e psicológico do órgão executivo de trânsito** para **bloqueio
   imediato do cadastro nacional**. O **desbloqueio compete ao órgão**, no vencimento do prazo —
   nunca à clínica nem ao perito.
2. **Inapto temporário (psicológico):** o resultado **consigna prazo de inaptidão na planilha
   RENACH**, findo o qual o candidato deve ser submetido a **nova avaliação**.
3. **Apto com restrições (médico):** as observações **codificadas no Anexo XV** da Res. 927/2022
   constam da CNH.
4. **Apto com validade diminuída (psicológico):** o prazo reduzido **consta da planilha RENACH**
   ([RN-PEC-103]).

A comunicação do item 1 é **obrigação do perito**, com qualificador de urgência no texto
("imediato bloqueio") — é o único ato do corpus PEC com esse qualificador e o único cujo
destinatário é um setor interno do órgão, distinto do fluxo geral de transmissão de eventos de
[RN-PEC-008].

**Base legal.**

- [REF-CONTRAN-927-2022] art. 10, § 2º: _"Na hipótese de inaptidão temporária ou inaptidão, o
  perito examinador de trânsito deverá comunicar esse resultado aos setores médicos e psicológicos
  do órgão [...], para imediato bloqueio do cadastro nacional, competindo a esse órgão o devido
  desbloqueio no vencimento do prazo."_
- [REF-CONTRAN-927-2022] art. 9º, § 1º: _"O resultado inapto temporário constará na planilha
  RENACH e consignará prazo de inaptidão, findo o qual deverá o candidato ser submetido a nova
  avaliação psicológica."_
- [REF-CONTRAN-927-2022] art. 8º, parágrafo único (códigos do Anexo XV na CNH).
- [REF-CTB-147-148-habilitacao] art. 147, § 1º (registro de resultado e examinador no RENACH).

**Verificação.**

1. **O bloqueio é um evento de saída distinto.** [RN-PEC-008] modela uma fila única
   (`integration.renach_outbox`) com janela de até 15 minutos e ACK assíncrono. Um resultado de
   inaptidão exige **comunicação imediata** com destinatário próprio (setores médico e psicológico
   do DETRAN-AM). Tratá-lo como mais uma linha da fila genérica é uma **decisão de arquitetura que
   a norma não autoriza expressamente** — no mínimo, exige prioridade e evidência de entrega
   próprias. Ver auditoria de [RN-PEC-008].
2. **O desbloqueio não é operação do PEC.** Nenhum papel da matriz RBAC ([APP-PEC] §Atores) pode
   receber essa capacidade: a norma a atribui ao órgão. Se o PEC expuser desbloqueio a Gestor
   DETRAN, isso é implementação de competência do órgão dentro do sistema — legítimo, mas deve ser
   explicitado e auditado, nunca disponível a papel de clínica.
3. **O prazo de inaptidão é dado obrigatório do laudo de inapto temporário** — sem ele, o
   desbloqueio no vencimento (§ 2º) é impossível de operar. Hoje nenhum artefato PEC descreve esse
   campo.
4. **O gate de encerramento precisa refletir o bloqueio.** Um episódio cujo resultado é inapto
   (temporário ou não) não pode encerrar-se como se o processo seguisse: [RN-PEC-006] verifica
   ausência de `process_blocks`, mas o bloqueio aqui é **do cadastro nacional**, não do episódio —
   são objetos diferentes e o corpus não os distingue.
5. **Nova avaliação após o prazo é um novo `encounter`**, não a reabertura do anterior — coerente
   com a imutabilidade de [RN-PEC-001].

**Controvérsia/risco.** O art. 10, § 2º põe a comunicação a cargo do **perito**, pessoa física, e
não da entidade credenciada nem do sistema. Se o PEC automatiza essa comunicação, ele **executa um
dever pessoal do profissional** — o que é útil, mas desloca a evidência de cumprimento: em caso de
falha de transmissão, quem responde é o perito, e ele precisa poder demonstrar que comunicou. Isso
exige que o comprovante de comunicação seja **acessível ao próprio perito**, não apenas ao acervo
de auditoria do órgão. Item 12 de `_intake/legal-assessment.md`.
