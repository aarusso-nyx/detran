---
id: RN-DASH-134
title: Vigilância do TEAT — requisitos de validade que caducam: homologação, verificação metrológica, sessão exclusiva e prazos de custódia
status: draft
apps: [dashboard, teat]
sources: [REF-SENATRAN-997, REF-CONTRAN-1025-2026, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** No TEAT, o objeto da vigilância **não é prazo processual** — é **precondição de validade
do ato com data de expiração**. A diferença é decisiva: no RAIT o risco é perder um processo; no TEAT
o risco é **produzir em massa atos inválidos sem perceber**, porque um certificado venceu ou uma
homologação caducou. O prejuízo é retroativo e silencioso: descobre-se em contencioso, meses depois,
sobre um lote inteiro de autuações.

**O que deve ser monitorado — cinco famílias.**

| #   | Objeto                                                               | O que expira/quebra                                                                                                                                                                                       | Efeito                                                                             | Regra-teto                                  |
| --- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | **Homologação SENATRAN do software** do talão eletrônico             | laudo técnico a renovar **a cada 4 anos**; nova homologação exigida **a cada alteração de código que altere funcionalidade**; auditoria que comprove alteração **cancela automaticamente** a certificação | talão sem homologação vigente — vício no instrumento de lavratura                  | [RN-TEAT-117]                               |
| 2   | **Verificação metrológica** de etilômetro e de medidor de velocidade | Certificado de Verificação com **data de validade**; verificação periódica **a cada 12 meses**; selo de interdição em caso de reprovação                                                                  | aparelho sem certificado vigente **não produz prova válida**                       | [RN-TEAT-135], [RN-TEAT-138]                |
| 3   | **Sessão exclusiva do agente** por dispositivo                       | registros concorrentes do mesmo agente em aparelhos diferentes no mesmo intervalo                                                                                                                         | registros **não devem ser processados** + **apuração obrigatória** pela autoridade | [RN-TEAT-111]                               |
| 4   | **Integridade e trilha do talão**                                    | falha de criptografia, de registro de operações, de identificação de equipamento, ou alteração após o término da lavratura                                                                                | requisito normativo do talão descumprido; auditabilidade comprometida              | [RN-TEAT-112]                               |
| 5   | **Prazos de custódia** nascidos do ato de campo                      | **10 dias** para notificar proprietário ausente; **30 dias** para edital; **60 dias** para leilão; **6 meses** de limite de diárias; **30 dias** de entrega a condutor habilitado                         | perda de marco de custódia, cobrança indevida de diárias, leilão viciado           | [RN-TEAT-124], [RN-TEAT-125], [RN-TEAT-128] |

**Consequência legal da perda.** Não é extinção de processo — é **invalidade do ato ou da prova**.
Nas famílias 1 e 2, o vício atinge **todos os autos produzidos no período de irregularidade**, o que
transforma um lapso administrativo em passivo de contencioso de volume. Na família 3, a norma é
categórica: os registros **não devem ser processados** e o fato **deve ser apurado pela autoridade de
trânsito** — bloqueio, não alerta, e apuração obrigatória, não facultativa ([RN-TEAT-111]). Na família
5, o vício atinge a custódia e a cobrança, com repercussão patrimonial direta sobre o administrado.

**Alerta mínimo para demonstrar diligência.**

- **Famílias 1 e 2 — alerta por antecedência, obrigatoriamente.** Um certificado que vence amanhã e é
  avisado amanhã já custou um dia de autuações potencialmente inválidas. Degraus sugeridos: **D-90 /
  D-30 / D-7 / vencido**, com o degrau D-90 escalando para quem **contrata** a verificação, não para
  quem opera o aparelho — o tempo de reação é administrativo, não operacional.
- **Inventário como base do alerta.** Não se pode alertar sobre o que não se inventaria: o painel
  precisa da lista de **equipamentos e versões de software em uso em campo**, com validade por
  exemplar. Equipamento ativo em campo **sem certificado registrado** é o pior estado possível — e deve
  ser exibido como incidente, não como dado faltante.
- **Família 3 — contador de eventos de concorrência**, com evidência de que (i) os registros foram
  bloqueados e (ii) a apuração foi aberta. Detectar sem apurar é descumprir metade da norma.
- **Família 4 — indicadores de saúde da trilha**: percentual de AIT com registro completo de operações
  (data-hora, agente, veículo, local, **número do aparelho**), falhas de transmissão, tentativas de
  alteração pós-lavratura. Qualquer valor diferente de 100% no primeiro é achado.
- **Família 5 — relógio por veículo em custódia**, com os quatro marcos, e alerta específico para o
  limite de **seis meses de diárias**, que é teto de cobrança e não marco de processo.

**Verificação.**

1. **Percentual de AIT lavrados sob equipamento/versão com validade comprovada**, por dia. Este é o
   indicador-síntese do módulo TEAT do DASHBOARD; qualquer coisa abaixo de 100% é passivo em formação.
2. **Alerta de mudança de versão de software em campo sem homologação correspondente** — o gatilho de
   [RN-TEAT-117] é _alteração de funcionalidade_, e essa é uma informação que só o processo de release
   possui. O painel deve exibir a versão em campo × a versão homologada; divergência é bloqueio.
3. **Nenhuma ação corretiva a partir do painel** ([RN-DASH-101]): interditar aparelho, cancelar AIT,
   liberar retenção e abrir apuração são atos das autoridades e papéis competentes do TEAT
   (`agency-admin`, `traffic-authority`), praticados no TEAT.
4. **Bodycam**: o painel pode monitorar **disponibilidade e integridade** da gravação obrigatória
   ([RN-TEAT-141]), mas **jamais exibe conteúdo** — o acesso ao registro é restrito e por requisição
   ([RN-TEAT-142]), e cai integralmente sob [RN-DASH-170].
5. **Estado "não instrumentado" explícito** para famílias cujo dado o TEAT ainda não produza — nunca
   conformidade presumida.

**Controvérsia/risco.** _Severidade: alta._ Esta é a família de vigilância com **maior razão
impacto/esforço** de todo o DASHBOARD: os dados de origem são pequenos (um inventário de equipamentos
com datas de validade), o alerta é trivial de calcular, e a consequência de não tê-lo é a produção
massiva e invisível de atos viciados. Se apenas um módulo derivado for construído no primeiro
incremento, deve ser este.
