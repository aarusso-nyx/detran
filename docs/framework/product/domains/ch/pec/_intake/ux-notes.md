---
id: UX-NOTES-PEC
title: Notas de UX — PEC (prontuário eletrônico clínico, do agendamento ao encerramento)
status: draft
apps: [pec]
sources:
  - REF-CONTRAN-927-2022
  - REF-CONTRAN-923-1009-toxicologico
  - REF-CFM-1636-2002
  - REF-CFP-01-2019
  - REF-SENATRAN-PORTARIA-968-2022
  - REF-DETRANAM-PORTARIA-005-2021
  - REF-LEI-13787-2018
  - RN-PEC-001
  - RN-PEC-003
  - RN-PEC-004
  - RN-PEC-005
  - RN-PEC-006
  - WF-PEC-001
  - WF-PEC-002
  - WF-PEC-003
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o PEC. Complementa [JRN-PEC-001] a [JRN-PEC-007] —
base minerada (001-003) revisada nesta rodada e estendida (004-007). Diferente de `est/boat` e
`inf/rait`, o PEC **não tem nenhum inventário de tela confirmado** nos documentos-fonte
capturados até agora — nenhum `UX-WEB-*`/`UX-MOB-*` foi localizado na pesquisa. Todo o
inventário abaixo é, portanto, **proposta de UX**, não confirmação de artefato existente; ver
`est/boat/_intake/ux-notes.md` §a para o precedente de mascaramento LGPD adotado aqui e
`inf/rait/_intake/ux-notes.md` para o precedente de "prazo do cidadão vs. prazo do órgão"
estendido em [JRN-PEC-002]/[JRN-PEC-005].

## (a) Inventário de telas — mapeado a UC/WF ids (todas propostas, sem confirmação de tela existente)

> **PROMOVIDO (2026-08-26).** Virou [IU-PEC-001](../screens/IU-PEC-001.md), com três telas
> acrescentadas que os casos de uso exigiam (registro de restrição, retenção/eliminação de
> prontuário, exercício de direitos do titular) e a marcação de quais telas ficam bloqueadas por
> decisão pendente do Owner. As tabelas abaixo ficam como registro histórico.

**Console clínico (web) — Recepção, Técnico Biométrico, Médico, Psicólogo, Supervisor, Admin Clínica:**

| Tela proposta                                                   | Jornada(s)                   | UC / WF                                     |
| --------------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| Agenda do dia / fila de atendimento                             | [JRN-PEC-007]                | [WF-PEC-003]                                |
| Check-in biométrico (captura + validação de presença)           | [JRN-PEC-001]                | [UC-PEC-002], [RN-PEC-005]                  |
| Registro de falha + solicitação de exceção biométrica           | [JRN-PEC-003]                | [UC-PEC-003], [RN-PEC-003]                  |
| Aprovação de exceção biométrica (Supervisor)                    | [JRN-PEC-003]                | [UC-PEC-003]                                |
| Atendimento clínico — anamnese/exame médico                     | [JRN-PEC-001], [JRN-PEC-007] | [UC-PEC-002], [WF-PEC-001]                  |
| Atendimento — avaliação psicológica                             | [JRN-PEC-001], [JRN-PEC-007] | [UC-PEC-002], [WF-PEC-001]                  |
| Entrevista devolutiva (registro de que foi oferecida/realizada) | [JRN-PEC-004]                | [UC-PEC-006] — sem RN dedicada hoje, ver §b |
| Emissão e assinatura de laudo (com biometria de encerramento)   | [JRN-PEC-001], [JRN-PEC-007] | [UC-PEC-006], [RN-PEC-002], [RN-PEC-005]    |
| Solicitação/aprovação dupla de adendo (retificação)             | —                            | [UC-PEC-007], [RN-PEC-001]                  |
| Checklist de encerramento do episódio                           | [JRN-PEC-001]                | [UC-PEC-008], [RN-PEC-006]                  |
| Painel de transmissão RENACH (status ACK/erro)                  | —                            | [UC-PEC-009], [RN-PEC-008]                  |

**Console regulatório (web) — Auditor, Gestor, Gestor DETRAN, Junta, CETRAN:**

| Tela proposta                                                                                                  | Jornada(s)                   | UC / WF                                                               |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| Fila/montagem de dossiê para submissão à junta                                                                 | [JRN-PEC-002], [JRN-PEC-005] | [UC-PEC-004]                                                          |
| Dossiê do caso + registro de parecer (Junta)                                                                   | [JRN-PEC-002], [JRN-PEC-005] | [UC-PEC-005], [WF-PEC-002]                                            |
| Escalonamento a CETRAN / Junta Especial de Saúde                                                               | [JRN-PEC-005]                | proposta — entidade hoje inexistente no sistema, ver [WF-PEC-002]     |
| Escada de prazos do caso (30/15 úteis/30/30/20 úteis dias)                                                     | [JRN-PEC-002], [JRN-PEC-005] | proposta nova desta rodada                                            |
| Painel de credenciamento de clínicas/profissionais (ciclo 1 ano, comprovação bienal, estatística mensal/anual) | —                            | fora do escopo dos UC-PEC atuais — [REF-CONTRAN-927-2022] arts. 16-24 |
| Relatórios regulatórios / trilha de auditoria (Auditor, DPO)                                                   | —                            | somente-leitura, RBAC já define o papel                               |

**Portal do candidato — nenhum artefato de tela confirmado nas fontes lidas; todas propostas:**

| Tela proposta                                                              | Jornada(s)                   | Observação                                                  |
| -------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------- |
| Meu agendamento (ver, não escolher clínica livremente)                     | [JRN-PEC-001]                | ver §e — pendência de conformidade (CFM 1.636/2002 art. 3º) |
| Meu resultado / meu dossiê (acesso integral, não mascarado)                | [JRN-PEC-001], [JRN-PEC-004] | ver §d                                                      |
| Entender minha restrição ("apto com restrições")                           | [JRN-PEC-004]                | conteúdo limitado pelo Anexo XV não capturado               |
| Solicitar Junta Médica/Psicológica (exercer o prazo de 30 dias)            | [JRN-PEC-005]                | item de produto em aberto — ver [JRN-PEC-005] passo 2       |
| Acompanhar meu recurso (prazos como direitos, não como jargão de processo) | [JRN-PEC-002], [JRN-PEC-005] |                                                             |
| Meu calendário de exame toxicológico periódico                             | [JRN-PEC-006]                | condicional à decisão de escopo (PEC participa ou não)      |

Total: **11 telas de console clínico + 6 de console regulatório + 6 de portal candidato**,
todas propostas — nenhuma confirmada como artefato de tela existente nos documentos-fonte do
PEC lidos até esta rodada.

## (b) Ergonomia do ambiente clínico

- **Privacidade na recepção.** A simples presença de um candidato numa clínica credenciada já
  revela algo sensível — está sendo avaliado clinicamente para dirigir, pode estar em uma
  categoria C/D/E sujeita a exame toxicológico. A tela/processo de check-in não deveria chamar
  o candidato em voz alta com detalhe do motivo do atendimento, nem exibir em painel público
  qualquer status que revele algo além de "próximo a ser chamado" — mesmo padrão de qualquer
  ambiente de saúde, tratado aqui com a mesma prioridade que uma clínica médica comum trataria.
- **Momento de captura biométrica é um momento de vulnerabilidade, não de suspeita.** Uma falha
  de captura (curativo, lesão, ausência permanente de dedo — ver [JRN-PEC-003]) não deveria
  gerar, na experiência do candidato, qualquer sinal de "algo está errado com você". A
  linguagem de exceção ([RN-PEC-003]) é processo normal, não incidente. Importante: a mensagem
  de "tentativa de fraude" que [RN-PEC-005] gera é sobre a biometria **do profissional** no
  momento de assinar — nunca deveria aparecer, sob nenhuma circunstância, em qualquer tela
  voltada ao candidato/paciente.
- **Entrega de um resultado inapto/inapto temporário/restrição — a entrevista devolutiva é o
  momento humano do processo, não deveria ter mais fricção que o resto do fluxo.**
  [REF-CFP-01-2019] art. 2º §22 obriga o psicólogo a realizar a entrevista devolutiva "quando
  solicitado", apresentando o resultado "de forma objetiva" — [REF-DETRANAM-PORTARIA-005-2021]
  art. 47 §1º replica essa obrigação para todos os candidatos, sempre que solicitado. A tela que
  registra essa entrevista (se o psicólogo confirmou que ofereceu/realizou) deveria ser rápida
  de preencher — não transformar um momento de cuidado humano numa tarefa burocrática extra
  que desincentiva o profissional a oferecê-la de bom grado.
- **Nenhum resultado em painel público/monitor compartilhado.** Nem "apto", nem "inapto", nem
  qualquer variação — resultado é sempre entregue em canal privado (contato direto,
  atendimento reservado), nunca por lista visível a outros pacientes na sala de espera.
- **Sessão única / janela de 08h-13h como piso real de desenho, não como detalhe.** Ver
  [JRN-PEC-007] — a tela de trabalho do profissional clínico precisa refletir a pressão real de
  uma janela de cinco horas, sem sugerir folga que não existe, mas também sem transformar isso
  num cronômetro visível de pressão sobre o profissional (mesmo princípio já fixado por
  `est/boat/_intake/ux-notes.md` §b para o agente de campo — velocidade vem de um fluxo bem
  desenhado, não de um contador ansiogênico).

## (c) Mapa de linguagem simples — vocabulário LEGAL de resultado (nunca inventar, sempre explicar)

Três vocabulários distintos coexistem no corpus capturado — nenhum artefato de UI deveria
unificá-los silenciosamente; a divergência é, ela mesma, um item de validação jurídica
prioritária do dossiê de pesquisa (handoff LEGAL item 1).

| Fonte                                                   | Vocabulário                                                             | Prazos associados                                                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [REF-CONTRAN-927-2022] art. 8º (médico)                 | apto / apto com restrições / inapto temporário / inapto                 | nenhum prazo numérico de validade fixado no artigo em si                                                                             |
| [REF-CONTRAN-927-2022] art. 9º (psicológico)            | apto / inapto temporário / inapto                                       | inapto temporário consigna prazo próprio na planilha RENACH (§1º); apto com comprometimento sob controle tem validade reduzida (§2º) |
| [REF-DETRANAM-PORTARIA-005-2021] art. 34 §9º (estadual) | APTO / APTO COM RESTRIÇÕES / PENDENTE / INAPTO / INAPTO TEMPORARIAMENTE | 30/60/90/365 dias — mapeamento exato rótulo→prazo não está explícito no texto capturado                                              |
| `pec.encounters.medical_result` (schema)                | inclui `'CONDICIONADO'`                                                 | — não corresponde a nenhum rótulo das duas fontes legais acima                                                                       |

**Regra de produto para qualquer tela**: usar sempre o rótulo legal federal ("apto com
restrições", nunca "condicionado") como texto voltado ao candidato; se o valor interno do
schema for `CONDICIONADO`, isso é um detalhe de armazenamento a traduzir na camada de
apresentação, nunca a exibir cru. O rótulo "PENDENTE" da nomenclatura estadual **não deveria
aparecer a candidato** até que LEGAL confirme seu significado e sua relação com os quatro
rótulos federais — hoje não há evidência suficiente para explicá-lo com segurança (ver
[JRN-PEC-004] para o mesmo princípio aplicado a "apto com restrições").

**Explicações em linguagem simples (traduzir, nunca renomear):**

- **Apto** — pode dirigir, sem nenhuma condição registrada.
- **Apto com restrições** — pode dirigir; um código específico é registrado na CNH (ex.: uso
  de lentes, adaptação veicular); o significado detalhado de cada código vem do Anexo XV da
  Resolução 927/2022, **não capturado nesta pesquisa** — nenhuma tela deveria inventar o
  significado de um código sem essa fonte.
- **Inapto temporário** — não pode dirigir agora; o motivo é considerado tratável/corrigível;
  há um prazo (consignado no RENACH) após o qual uma nova avaliação é feita.
- **Inapto** — não pode dirigir; o motivo é considerado irreversível para a categoria
  pretendida.

## (d) Regras de UI orientadas por LGPD

Adota a mesma doutrina de mascaramento-por-padrão já estabelecida em
`est/boat/_intake/ux-notes.md` §d, com uma inversão importante para o PEC: o titular do dado
(o próprio candidato) é também o principal usuário final de autoatendimento do sistema
([APP-PEC] — "único ator que se autentica como usuário final do próprio processo").

1. **Mascarar dado clínico sensível por padrão para todo papel que não seja o profissional
   responsável, a própria pessoa titular, ou DPO/Auditor com finalidade declarada.** Anamnese
   detalhada, escores brutos de teste psicológico, substância detectada em exame toxicológico:
   a visão padrão de qualquer console interno (Admin Clínica, Recepção, Gestor) mostra um
   resumo validado ("exame realizado: sim/não"; "dentro do prazo: sim/não"), nunca o dado
   clínico bruto. [APP-PEC] já define Recepção como "sem acesso a conteúdo clínico" — a UI
   nunca deveria violar essa fronteira de RBAC visualmente, mesmo em telas agregadas/listas.
2. **O candidato vendo o próprio dossiê é a exceção confirmatória, não um caso à parte a
   inventar.** Diferente de terceiros, Elza/Diego/Jorge acessando seu próprio prontuário
   deveriam ver o conteúdo **integral**, não mascarado — a base é dupla: o princípio geral de
   acesso do titular já adotado nesta base de conhecimento (reuso de LGPD, [REF-LEI-13709-2018],
   herdado da rodada BOAT) e, mais especificamente para prontuário clínico,
   [REF-LEI-13787-2018] — uma lei cujo próprio objeto é o prontuário do paciente, e que prevê
   inclusive a devolução do prontuário ao paciente como alternativa à eliminação (art. 6º §2º).
   Mascarar o próprio prontuário do titular seria uma inversão do princípio de minimização, não
   uma aplicação dele.
3. **Toxicológico é o dado mais sensível do corpus PEC — máscara mais estrita, nunca em fila
   compartilhada.** Ver [JRN-PEC-006] passo 4 — revela uso de substância, com estigma e
   consequência direta sobre a renda de um motorista profissional. Regra: zero exibição de
   resultado toxicológico em painel/fila compartilhada, mesmo agregado.
4. **Auditoria de toda revelação de dado bruto**, com papel e finalidade declarada — mesmo
   padrão do BOAT (RN-AUD equivalente ainda não localizada no corpus PEC como regra dedicada,
   mas o princípio de auditoria já existe em [RN-PEC-003]/[RN-PEC-005] para eventos
   biométricos; estender à revelação de dado clínico).
5. **Nenhuma base legal de tratamento (art. 11 LGPD) exibida com falsa certeza** — mesmo
   achado do dossiê de pesquisa BOAT, replicado aqui: nenhuma fonte capturada confirma a
   hipótese exata aplicável ao dado de saúde do PEC; se a interface precisar citar fundamento,
   usar linguagem genérica de proteção de dados até LEGAL resolver.
6. **Retenção — três prazos distintos, nenhum ainda modelado em regra, mas já visível o
   suficiente para orientar a UI de arquivamento.** [REF-LEI-13787-2018] art. 6º: 20 anos
   (prontuário, geral); [REF-DETRANAM-PORTARIA-005-2021] art. 21 § único: 5 anos (laudo na
   entidade credenciada, após descredenciamento); [REF-CONTRAN-923-1009-toxicologico] art. 9º
   §§1º-2º: 5 anos (laudo/material biológico do toxicológico, no laboratório). Nenhuma tela
   deveria oferecer "excluir prontuário" como ação disponível ao candidato ou a qualquer papel
   interno antes desses prazos — mesmo que a regra de retenção (`RN-PEC-1xx`, recomendada pelo
   dossiê de pesquisa) ainda não exista formalmente.

## (e) Distribuição de clínica — pendência de conformidade que a UX não deveria reforçar visualmente

[REF-CFM-1636-2002] art. 3º exige distribuição "equitativa obrigatória, aleatória e impessoal"
dos exames pelo DETRAN, "nunca por escolha do periciado". O modelo de agendamento do PEC, como
documentado ([WF-PEC-003], [UC-PEC-001]), não modela esse mecanismo — parece pressupor escolha
de clínica pela recepção/candidato. Esta é uma pendência de validação jurídica prioritária
(handoff LEGAL do dossiê de pesquisa), não uma decisão fechada. Enquanto não resolvida:

- Nenhuma tela de agendamento (interna ou de portal futuro) deveria apresentar a escolha de
  clínica como um recurso de conveniência do candidato ("escolha a clínica mais perto de
  você") — mesmo que seja tecnicamente o que o sistema faz hoje, reforçar essa moldura em UI
  aprofunda o risco de conformidade em vez de deixá-lo neutro para uma decisão futura.
- Se/quando LEGAL confirmar que a distribuição deve ser aleatória e feita pelo DETRAN, a
  jornada de agendamento de [JRN-PEC-001] muda de forma material — este item já está sinalizado
  ali como nota de revisão a acompanhar.

## (f) Notas de acessibilidade

- **Candidatos com deficiência SÃO os usuários centrais desta aplicação — o próprio exame
  avalia aptidão física e mental, o que exige um cuidado que vai além de WCAG genérico.** A
  acessibilidade da interface não pode ser confundida com o resultado clínico que está sendo
  avaliado: um candidato com mobilidade reduzida navegando o sistema não deveria encontrar
  nenhuma barreira de interface que pareça, ainda que involuntariamente, parte do próprio
  exame.
- **Ausência permanente de dedo (biometria) precisa de um caminho estável, não de uma
  "exceção" reincidente.** Ver [JRN-PEC-003] — o desenho técnico de exceção biométrica (com
  fallback por reconhecimento facial, base em [REF-SENATRAN-PORTARIA-968-2022] art. 4º
  §§3º-4º, texto de 2022) já existe; o que falta é reconhecer, na experiência de tela, que uma
  condição permanente não deveria reiniciar o mesmo processo de justificativa/aprovação a cada
  visita como se fosse uma novidade.
- **Interpretação em Libras/comunicação acessível na entrevista devolutiva e na avaliação
  psicológica.** [REF-CFP-01-2019] art. 2º §9º exige entrevista individual obrigatória; para um
  candidato surdo ou com necessidade de comunicação alternativa, a disponibilidade de
  intérprete/recurso de comunicação não é um extra — é condição para que o próprio ato
  pericial (entrevista, entrevista devolutiva) seja válido e justo. Fora do escopo de código
  desta base de conhecimento, mas registrado como nota de produto para o processo clínico em
  si, não apenas para a tela.
- **Nunca comunicar resultado só por cor.** "Apto com restrições"/"inapto"/"inapto temporário"
  sempre com rótulo textual explícito, nunca só uma badge colorida — mesmo princípio já adotado
  pelo RAIT para o radar de prescrição (`inf/rait/_intake/ux-notes.md` §d).
- **Console clínico de uso profissional intensivo** (Médico, Psicólogo, dentro da janela de
  08h-13h de [JRN-PEC-007]): eficiência de teclado e navegação sem mouse reduzem fricção numa
  manhã de atendimentos sequenciais — mesma prioridade dada ao console de coordenação do BOAT e
  ao console do RAIT.
- Padrão geral: WCAG 2.1 AA como piso, alinhado ao já adotado por `transversal/portal`.

## (g) Anti-padrões a evitar

1. **Inventar ou renomear rótulo de resultado.** "Apto com restrições" se explica, nunca se
   traduz para um termo de produto novo — ver §c.
2. **Unificar os três vocabulários (federal médico, federal psicológico, estadual) num único
   enum de UI sem decisão de LEGAL.** Ver §c — item de validação jurídica prioritária ainda
   aberto.
3. **Vazar `CONDICIONADO` (nome interno de schema) ou "PENDENTE" (nomenclatura estadual não
   confirmada) para qualquer tela voltada ao candidato.**
4. **Tratar ausência permanente de dedo como "exceção" reincidente** em vez de acomodação
   estável — ver §f.
5. **Exibir resultado (qualquer um) em painel público ou fila compartilhada visível a outros
   candidatos.** Ver §b.
6. **Mostrar mensagem de "tentativa de fraude" (evento de [RN-PEC-005], sobre a biometria do
   profissional) em qualquer tela voltada ao candidato.** É log interno de staff.
7. **Deixar a entrevista devolutiva ([REF-CFP-01-2019] art. 2º §22) como ação escondida ou
   burocraticamente pesada de registrar.** Ver §b.
8. **Mascarar o próprio prontuário do candidato quando ele mesmo o acessa.** O mascaramento
   por padrão é para outros papéis, não para o titular dos dados — ver §d item 2.
9. **Afirmar uma base legal LGPD específica (consentimento, tutela da vida etc.) sem
   fundamento confirmado por LEGAL.** Ver §d item 5.
10. **Apresentar a escolha de clínica como conveniência do candidato** enquanto a pendência de
    conformidade do art. 3º da [REF-CFM-1636-2002] (distribuição aleatória e impessoal) não é
    resolvida — ver §e.
11. **Contador de prazo falso.** Mesma regra fixada pelo BOAT — só exibir prazo com base legal
    confirmada. Diferente do round anterior do PEC, agora existem vários prazos confirmados a
    exibir de verdade: 2 dias úteis (resultado psicológico), 90 dias (validade toxicológica),
    30/15 úteis/30/30/20 úteis dias (escada da junta), 30 dias de antecedência (alerta do
    toxicológico periódico) — não exibi-los quando existem é tão errado quanto inventar um que
    não existe.
12. **Confundir prazo do candidato com prazo do órgão em qualquer tela de acompanhamento de
    junta/recurso.** Ver [JRN-PEC-002]/[JRN-PEC-005] — o erro mais grave que essas duas
    jornadas podem cometer.
13. **Atribuir uma decisão de recurso ao "CETRAN" quando, normativamente, quem decide é a
    Junta Especial de Saúde por ele designada.** Ver [JRN-PEC-005] passo 7 — item de maior
    risco de comunicação incorreta identificado nesta rodada.
14. **Cronômetro visível de pressão sobre o profissional clínico** durante a janela de
    08h-13h — velocidade vem de fluxo bem desenhado, não de contador ansiogênico. Ver
    [JRN-PEC-007] e o mesmo anti-padrão já fixado pelo BOAT para o agente de campo.
