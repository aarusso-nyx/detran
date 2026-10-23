# Research backlog (steering queue)

> **Current boundary — 2026-10-23:** S2 approved via #205 and implemented in
> draft #211; integration/validation incomplete. R-0025/JW-01 remain open.
> Owner approved parallel S3 packet preparation; S3 runtime and #211 merge stay paused.
> [Current RAIT schedule](rait-progress-plan-2026-10-23.md) retains all acceptance and recovery gates.
> Local, recovery and separate scorecard work remain protected.

## R-0025 — estado atual, 2026-10-23

- **Integrado:** admissibilidade #193, S1 #203 e pacote de aprovação S2 #205;
  R-0025/JW-01/CP-01 permanecem abertos, sem promoção de readiness.
- **Implementação pendente:** S3 UI/dossiê/browser e demais jornadas; restauração
  tipada dos detalhes A2 permanece obrigatória. Só preparação paralela S3 foi aprovada.
- **Aguardando integração:** risco/legado/contexto/claim atômico S2 implementado
  no PR #211, head cd2b6740; faltam reconciliação, validações, recuperação suportada
  da cadeia, revisão e autorização de merge. S2 não espera nova aprovação genérica.
- **Registros superados:** banners de candidato S1/PR203 ainda pendente e decisões
  D1–D11 abertas são históricos; decisões aprovadas não são reabertas.
- **Dependências adiadas:** bindings/identidade, ladders executáveis, inventário e
  disposições de legado, fontes relógio/calendário/incidente e qualificação real.
  Não equivalem a defaults de produção ou redução da aceitação integral.
- **Follow-up CI separado:** workflow trusted-local-RC39298941092 falhou por tag
  protegida ausente e resumo ausente; DETRAN CI39298941118 passou e publicou
  verified-local-rc via backend completo. Não declarar atestação local assinada ou
  todos os workflows verdes; tratar o fluxo de tag/resumo antes de depender dele
  como evidência de release. Sem reparo de workflow/política neste pacote.

Recibos e limites em [PR203 pós-merge](../../../work/rounds/R-0025/reports/PR203-post-merge/README.md).
Scorecard/R-0036, limiares e trabalho local permanecem separados.

## Reconciliação em 2026-10-18 — fila de execução atual

**Snapshot histórico 2026-10-18, com projeção R-0025 atualizada em2026-10-23.**
O estado atual e as autorizações acima prevalecem sobre os checkpoints datados abaixo.

**Autoridade:** Architect; reconciliação solicitada pelo Owner nesta sessão. Esta seção
separa implementação, integração, registros obsoletos e decisões; não abre rodadas, não
muda aceitação e não concede autorização de execução/publicação. As seções anteriores
cronologicamente continuam abaixo como diário de origem. Checkboxes históricos não são
um contador de funcionalidades por implementar.

### Base e regra de leitura

- `main` local e remoto: `06b4a584cb1686b647661855d379ea3161e0666e` (2026-10-17).
- DEVAI `2.2.0`, Constituição `1.0.2`, STYNX `1.5.3`; fontes: `package.json`,
  `.devai/config/project.json`, `tools/stynx-version.json` e PR #179 já mesclado.
- Heads remotos abaixo conferidos com `git ls-remote --heads origin` em 2026-10-18;
  arquivos inspecionados com `git show <head>:<path>`, sem checkout ou execução dos branches.
- GitHub consultado na mesma data: 26 issues abertas, zero PRs abertos. Issue aberta
  não prova ausência de implementação. Número de commits ausentes de `main` não mede
  trabalho único: branches empilhados compartilham commits.
- **Implementação pendente:** falta entrega funcional ou comprovação de aceitação.
  **Aguardando integração:** há material preservado fora de `main`, ainda sujeito a
  revisão, atualização de base e gates; pode ser só contrato/teste, inclusive RED.
  **Obsoleto:** texto superado por merge, fonte capturada ou decisão posterior.
  **Decisão/dependência adiada:** exige Owner, LEGAL, instituição ou provedor; não
  equivale a autorização para inventar valores ou retomar trabalho parado.
- Uma rodada pode ter as duas primeiras classes simultaneamente. `completed` descreve
  a tarefa registrada; não significa merge, jornada funcional, CI verde ou rodada fechada.
  Sem nova medição, resultados de teste no branch são evidência histórica, não PASS atual.

### Trabalho preservado aguardando integração e implementação restante

Os caminhos `work/rounds/R-nnnn/{plan.md,tasks,reports,AUTHORIZATION.md}` abaixo são
lidos **no head indicado**, não necessariamente existem em `main`. Counts incluem
somente JSONs em `tasks/`, não o trabalho futuro ainda não instanciado.

| Rodada          | Branch preservado / head                                                                             | Tarefas no branch                                           | Material aguardando avaliação/integração                                                                    | Implementação ou fechamento restante                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-0020          | `orchestra/devai-sensors` @ `ebf308e7`                                                               | 22 completed, 1 rgr_pending, 7 queued                       | Contratos/decisões A1, preflight de política de sensores e testes                                           | TASK-0013 bloqueada em RGR; TASK-0014…0020 gates CI, autoridade, documentação e testes; close/seal ausentes                                                                                                   |
| R-0020 RGR      | `rgr/TASK-0013` @ `28262392`                                                                         | 20 completed, 1 in_progress, 7 queued                       | Tentativa do wrapper de sensores e testes RED                                                               | Conciliar com o head maestro; não somar tarefas como outra rodada; verificar compatibilidade do DEVAI atual antes de reutilizar                                                                               |
| R-0022          | `codex/detran-r22-adoption-160` @ `c22ea63a`                                                         | 24 pre_merge, 1 checkpoint, 4 queued                        | Checkpoint de 85 commits ausentes de main, tenancy/SSE, contratos e preparação de assinatura/outbox/offline | **Parada**, OD-C3-001; salvamento seletivo em R-0034, não merge integral; critérios de provedor/custódia não satisfeitos                                                                                      |
| R-0022 anterior | `orchestra/stynx-sse-tenancy` @ `9af76824`                                                           | 24 pre_merge, 1 checkpoint, 4 queued                        | Linha anterior preservada; não constitui segunda entrega independente                                       | Usar o checkpoint de parada como referência de salvamento; diferenças/ancestralidade a conferir por fatia                                                                                                     |
| R-0023          | `orchestra/authz-unification` @ `9ee0deb1`                                                           | 1 completed, 1 in_progress                                  | Inventário/contrato; `tools/authz/route-role-matrix.ts` e teste e2e de matriz                               | Matriz em andamento; migração de autorização e O2–O5 restantes; não entregue em main                                                                                                                          |
| R-0024          | sem branch dedicado no inventário remoto                                                             | sem tarefas em main                                         | Plano de deduplicação                                                                                       | Kit compartilhado, padrão definitivo e dedup backend/frontend ainda por executar                                                                                                                              |
| R-0025          | `codex/r0025-p402-s1` integrado #203; checkpoint `orchestra/rait-web-wiring` @ `9e69d867` preservado | 4 completed históricas; TASK-0024…0027 completed no recorte | Matriz/contratos/ODs preservados; A-C3-01 admissibilidade integrada por #193, merge e68266a0                | Admissibilidade #193 e S1 escopo/parent/projeção/replay #203 integrados; audit exato YELLOW/43 UNKNOWN, não promove readiness. S2 aprovada #205, implementada #211 sem merge; UI/dossiê depois; rodada aberta |
| R-0026          | `orchestra/dashboard-wiring` @ `01e6afc2`                                                            | 4 pre_merge                                                 | Inventário, decisões e contratos de backend/produtores; nenhum delta de runtime                             | Console L0→L2, produtores RAIT, job, rotas GET, reconciliação policy/SSE/i18n                                                                                                                                 |
| R-0027          | `orchestra/portal-delegations` @ `d64ec29a`                                                          | 4 completed, 1 checkpoint                                   | Contratos e testes de perfis/delegações, com REDs intencionais                                              | Alvos reais, policy, formulários e jornadas; o checkpoint BANK_PORT não é solução entregue nem autorização de retomar candidato descartado                                                                    |
| R-0028          | `orchestra/boat-wiring` @ `d79b6f02`                                                                 | 4 pre_merge                                                 | Contratos e adapters de homologação: câmera, GPS, desenho, assinatura, armazenamento, attestation; testes   | Ligação de telas/gateway, jornadas reais; adapters de homologação não comprovam runtime nativo nem RENAEST produtivo                                                                                          |
| R-0029          | `orchestra/teat-web-wiring` @ `679f68db`                                                             | 2 completed                                                 | Matriz/contratos, fichas e i18n                                                                             | Páginas produtivas, facades e integração; depende do lock de shell/sinistros da R-0028                                                                                                                        |
| R-0030          | `orchestra/user-docs` @ `a9e19915`                                                                   | 5 completed, 13 queued                                      | Convenção, schema/checker de disponibilidade e testes, site pt-BR, glossário                                | Manifestos, manuais por perfil, FAQ/índices, ajuda contextual e gate final; grande parte do diff de tools são fixtures, não funcionalidade de app                                                             |
| R-0031          | `orchestra/pec-web` @ `7c0854f3`                                                                     | 10 completed, 3 checkpoint, 7 queued                        | Contratos/clientes, erros, seed/testes de integração, fichas e i18n PEC                                     | Fechar checkpoints de integração; scaffold e 19 telas, slot da stack, manifesto e aceitação; `apps/pec/web` em main só tem README                                                                             |
| R-0032          | `orchestra/portal-pec` @ `3a492978`                                                                  | 2 completed, 2 checkpoint, 10 queued                        | Contratos/fichas, caracterização de acesso e specs de telas; inclui trabalho empilhado da R-0031            | Eventos/projeções, porta do dossiê, comandos e páginas cidadãs, persona, smoke/a11y, manual/manifesto                                                                                                         |
| R-0033          | `codex/r0033-portal-preview`; checkpoint `aca40880` preservado, main integrado                       | 9 completed (W3: 0009/0007 aceitas)                         | Prévia RAIT/JW-01 e Portal integradas por #191; PC-0021, fechada e selada                                   | Pós-merge concluído; auditoria YELLOW (43 unknown, sem promoção). Dashboard/TEAT, OD-C3-009 e follow-ups preservados                                                                                          |
| R-0034 / R-0035 | somente mapa C-0003, sem pastas de rodada                                                            | não instanciadas                                            | Escopo de salvamento/costuras e hardening definido na campanha                                              | Abrir sob escopo/autorização aplicável; não presumir execução porque os IDs aparecem no mapa                                                                                                                  |

A R-0033 foi retomada por B3 e **fechada/selada em 2026-10-18, PC-0021**,
após autorização B4, merge do PR #191, evidência, auditoria exata e verbos DEVAI.
Recibo/errata: `work/rounds/R-0033/reports/W3-post-merge.md`. Auditoria Overall
YELLOW, 43 unknown e sem promoção de readiness; os follow-ups permanecem.

### Fila funcional confirmada em main

| Frente / responsável                  | Pendência e evidência atual                                                                                                                                                                                                                         | Destino                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| RAIT / Architect + Engineer           | #193 ligou F01/save/admit/reject; #203 integrou S1 escopo/projeção/parent/replay. Claim/risk/legado e demais jornadas continuam pendentes. Matriz histórica R-0025: 13 alinhados, 35 desalinhados, 16 faltantes; não é inventário atual de entregas | R-0025, issue #122; decisões D1–D11/ADR0045–49 já aprovadas; S2 aprovada #205; implementação #211 não integrada; S3 runtime pausado |
| PORTAL / Architect + Engineer         | `backend/app/src/portal-delegation.providers.ts` mantém `UnavailableDelegationTarget` e motivos de privacidade/documento assinado pendentes                                                                                                         | R-0027, #164 e #125; merge R-0007 já ocorreu e não resolve sozinho essa ligação                                                     |
| DASHBOARD / Architect + Engineer      | Console L0; exemplo `features/reports/pages/exportacoes.page.ts` inicia em `UNAVAILABLE_IN_VERSION`                                                                                                                                                 | R-0026; #123/#124/#173 agrupam a mesma frente, não três implementações; produtores #96, job #99                                     |
| TEAT/BOAT / Architect + Engineer      | Console TEAT e ligação BOAT ainda com preparações fora de main                                                                                                                                                                                      | R-0028/R-0029, #172/#174; separar do gate de produção mobile #108…#112                                                              |
| PEC / Architect + Engineer            | Domínios CH já portados; frontend PEC ainda ausente em main                                                                                                                                                                                         | R-0031/R-0032; reutilizar contratos/testes preservados antes de reimplementar                                                       |
| Docs / Architect                      | Manuais, manifestos e ajuda contextual ainda incompletos                                                                                                                                                                                            | R-0030; integrar fundação do branch antes do conteúdo restante                                                                      |
| Docs segurança / Engineer + Inspector | Exceção `braces` ainda presente em `docs/site/security/audit-exceptions.json`                                                                                                                                                                       | #186: remover exceção sem uso e detectar exceções sem uso; não alterar gates nesta reconciliação                                    |

### Entradas obsoletas ou duplicadas — disposição

| Registro de origem                                                                                                                                                                                                    | Disposição e fonte que prevalece                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-0002 “nenhuma rodada foi aberta”; R-0023…0033 “proposta”                                                                                                                                                            | Histórico de planejamento, superado pelos checkpoints/autorizações acima. R-0024 continua proposta; R-0022 continua parada                                                                         |
| Dependência obrigatória R-0022→R-0023→R-0024 antes de toda fase J                                                                                                                                                     | Ordem superada por A-C2-16/C-0003 §4: prévia, depois jornadas sobre main; atualização dos contratos/locks no bootstrap continua necessária                                                         |
| R-0021 TASK-0001…0004/0015 `pre_merge`, TASK-0014 `queued`                                                                                                                                                            | Status de arquivo defasado: PC-0019, `closure.json` e waves registram conclusão/merge. TASK-0005…0013 canceladas/transferidas; não ressuscitar nem reescrever JSON histórico                       |
| R-0006 TASK-0003 `escalated`; R-0007 checkpoints/cancelamentos                                                                                                                                                        | Preservar trilha arquivística; rounds formalmente fechadas (PC-0004/PC-0011). Status isolado não cria nova fila; eventual lacuna funcional exige evidência atual própria                           |
| S-1.5 / alvo STYNX 1.5.0                                                                                                                                                                                              | Alvo numérico superado pelo pin 1.5.3 em main; publicação não comprova todos os MUST da spec upstream. Manter aceitação/capacidades em verificação por fatia, sem marcar a rodada externa entregue |
| DT-001 / #121 “registry impede construir RAIT”                                                                                                                                                                        | Bloqueador genérico obsoleto: main consome pacotes publicados STYNX 1.5.3. DT-002/evidência RC upstream é assunto separado, não comprovado encerrado pelo pin                                      |
| #185 decisão do pin / #179 aberto                                                                                                                                                                                     | #179 já mesclado; DEVAI 2.2.0 e STYNX 1.5.3 em main. Título da issue desatualizado; não encerrar outras obrigações WS-5b por inferência                                                            |
| `docs/meta/decisions/README.md`: CH/EST/PORTAL/DASHBOARD vazios                                                                                                                                                       | Descrição temporal superada pelo código em `backend/domains/{ch,est,portal,dashboard}` e fechamentos das rodadas                                                                                   |
| `apps/pec/web/README.md` / handoff original: PEC “não planejado”                                                                                                                                                      | Superado por ADR-0034 e OD-PW-001, R-0031/R-0032. README é dívida de transcrição; ausência de frontend implementado permanece verdadeira                                                           |
| Backlog: obter novamente PDF CETRAN-RS 88/2014                                                                                                                                                                        | Captura já feita: DT-067 resolvido e `docs/reference/legal/other-states/REF-CETRAN-RS-88-2014.{pdf,txt}`                                                                                           |
| Backlog: capturar 927, 789, 1009, CFP 01/2019, Portaria 005/2021, Lei 13.787, CFM 1.821, MP 2.200-2, Lei 14.063                                                                                                       | Fontes presentes em `docs/reference/legal/{contran,conselhos,detran-am,leis}`; não recapturar. Existência da fonte não fecha validação jurídica/atualidade normativa                               |
| Captura SENATRAN 968/2022, 495/2025, 1.515/2018, 2.145/2020                                                                                                                                                           | Parcial: 968/495 presentes; não encerrar o grupo inteiro nem presumir captura das outras duas                                                                                                      |
| Perguntas repetidas: bodycam, guarda monitorada, transmissão mensal, correção nacional, PEC P2, rótulo CONDICIONADO, retenção/plataforma, toxicológico, junta, termo 40%, CRLV-e, WCAG/eMAG, limiar agregado, alertas | Decisões registradas em DT-014/015/017/020…030 e ledgers por produto; não perguntar de novo. Aplicação no código, retenção/bodycam, parecer e integração continuam separados                       |
| Candidatos de recuperação: teste de serviço indisponível e checker RLS lexical                                                                                                                                        | Já integrados por #187/#188 em main; não incluir novamente como candidatos de integração                                                                                                           |
| R-0007 “precisa mesclar” / rebase anterior a sua conclusão                                                                                                                                                            | Precondição já cumprida por #69/#94, PC-0011; delegações/timers/relógios remanescentes exigem verificação própria, não nova execução da antiga rodada                                              |
| CHECKBOX “sem ação pendente além do registro” (OD-D16-018)                                                                                                                                                            | Registro já existe; não contar como implementação                                                                                                                                                  |

### Decisões e dependências adiadas — não confundir com código a escrever

| Fonte / itens                          | Estado reconciliado e próximo responsável                                                                                                                                                                                                                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DT-002, DT-003                         | Verificação externa ainda necessária: evidência RC STYNX e arquivamento da origem. Não executados nesta reconciliação; não modificar repos irmãos                                                                                                                                                                                         |
| DT-012/016/019                         | Desconto fora SNE desligado; calibração de concorrência aguarda dados; premissa de remoção já adotada, parecer ainda separado. Owner + LEGAL/instituição                                                                                                                                                                                  |
| DT-040…053                             | Pareceres/validações e publicidade/retention/LGPD; decisões H.44…H.56 já registradas não substituem parecer ou execução. DT-050 já tem norma localizada e DT-051 já tem premissa; não tratá-los como pergunta de produto sem resposta                                                                                                     |
| DT-060/061/064/066/068/069/070/071/072 | Documentos/manuais, capacidade, adesão, signatário, medidores, investidura, composição e autorização institucional; ofícios redigidos não provam envio nem resposta                                                                                                                                                                       |
| DT-080…086                             | Pesquisa/corpus ainda não encerrados no registro; conferir captura/escopo antes de novo levantamento. Não são sete features de runtime                                                                                                                                                                                                    |
| DT-104/111                             | Alegações de engenharia legadas (CANCELLED e FK crash_record_id), ainda sem diagnóstico atual conclusivo nesta reconciliação; triagem técnica antes de planejar correção                                                                                                                                                                  |
| OD-R20-004/006                         | Retenção das observações e destino da ADR-0022 continuam questões registradas; não decidir por limpeza de backlog                                                                                                                                                                                                                         |
| A1 de R-0020                           | **Decisões existentes no branch** `ebf308e7`: A1-1/A1-2 aceitas em `6c4bc3b5`, A1-3=B. Não perguntar o mesmo piso/consentimento novamente. Bloqueio histórico de enum/scorecard era do pin antigo; verificar DEVAI 2.2.0 e reaplicar gates antes de declarar resolvido ou ainda reproduzível. Consentimento CI não autoriza sensing local |
| OD-C3-007/008                          | Decididas no branch R-0033; #184 já integrou fixture parity. Jornada JW-01 reescrita/limites de papel permanecem; diagramas são follow-up                                                                                                                                                                                                 |
| OD-C3-009                              | **Aberta no branch R-0033**: divergências jornada×papel JW-02/05/08; decidir antes da respectiva jornada, sem ampliar policy por inferência                                                                                                                                                                                               |
| R-0034/R-0035                          | Provedor/confiança, amostras reais, custódia nativa e APIs upstream: requisitos sem aceitação demonstrada. QEMU parado; nenhum retry é autorizado por esta reconciliação                                                                                                                                                                  |
| Escopo futuro                          | Bodycam e modelagem de guarda monitorada adiadas; pagamentos executados, suspensão de CNH, scanning e RENAVAM mantêm limites das decisões originais. Exceção explícita: frontend PEC passou a planejado pela ADR-0034                                                                                                                     |

### Uso do diário e próximos passos

Na entrada desta reconciliação o diário tinha **183 checkboxes abertas e 77 marcadas**;
`open-issues.md` tinha **38 linhas DT sem tachado**. São populações documentais sobrepostas,
não total de entregas restantes. Os itens legados sem evidência conclusiva acima ficam em
**triagem**, não são marcados implementados, descartados ou juridicamente validados.
Entradas repetidas referem a frente/DT/OD existente; não gerar outra tarefa para cada repetição.

1. R-0033 concluída e selada (PC-0021); preservar entregas e tratar os follow-ups
   pelos destinos existentes. Nenhuma nova rodada é iniciada por este registro.
2. Seguir C-0003 §4 para jornadas e locks; conciliar os contratos/testes já iniciados
   nas branches com as costuras atuais de main antes de implementar.
3. Tratar R-0020 em continuação própria, conciliando maestro/RGR e o pin instalado;
   preservação de branch não é aprovação de sua tentativa nem resultado dos gates atuais.
4. Salvar fatias elegíveis da R-0022 em R-0034 conforme §9 da campanha; hardening
   em R-0035. Não fundir a campanha antiga inteira nem reabrir decisões fechadas.
5. Revalidar títulos duplicados/obsoletos das issues antes de eventual atualização
   no GitHub; esta mudança reconcilia os arquivos locais e não encerra issues externas.

## Follow-up R-0033 — sensor browser Portal (2026-10-18)

- [ ] Ampliar o sensor de rede browser Portal além de `/v1`, observando qualquer
      requisição fora de documentos/bundles e `assets/**` da própria origem. A restrição
      geral atual é provada pelo interceptor e pelos specs HTTP/mock/stream/auth boundary;
      browser mede somente `/v1`. Fonte: `work/rounds/R-0033/reviews/delivery-review-W3-1.json`,
      achado low 2; revisão PASS, follow-up não bloqueia abrir PR.

## Handoff R-0033 → fase J (2026-10-15)

- [x] R-0033 → R-0025: **`main.ts` com `withInterceptorsFromDi()` integrado por PR #193** — interceptors DI do kit (bearer, tenant, request-id) ativados e testados no recorte de admissibilidade (`plan.md` R-0033 A5 item 8) (added 2026-10-15)
- [ ] R-0033 → R-0025: **`Format: date` exibido um dia antes** — `stynxIntlDate` lê `AAAA-MM-DD` como meia-noite UTC e formata em America/Manaus (`due_on` 2026-09-23 → 22/09/2026 no `rait-inquiry-card` e no `rait-deadline-chip`); provável em produção (A5 item 8) (added 2026-10-15)
- [ ] R-0033 → R-0025: **chaves do kit sem tradução** — `ui.confirmDialog.cancel`, `ui.pagination.*` aparecem cruas no `rait-web` (A5 item 8) (added 2026-10-15)
- [ ] R-0033 → R-0025: **rolagem horizontal a 360 px** — `table.stynx-table` em `/fila/defesa` (433 px) e `rait-deadline-chip` do `rait-inquiry-card` (402 px); origem kit/`shared/` (A6) (added 2026-10-15)
- [ ] R-0033 → R-0025: **cabeçalhos da `rait-queue-table` com nomes de campo** (`protocol_number`, `state`, `flag`, `due_on`) — `features/queue-columns.ts`, OD-R12-028 (A6) (added 2026-10-15)
- [ ] R-0033 → R-0025: **"Autor" vazio na minuta** — `draft.page.ts` não liga `authorLabel`; texto da minuta é estado local da página, sem `source_pending` visível (A6; `reports/TASK-0004.md`) (added 2026-10-15)
- [ ] R-0033 → R-0025/R-0035: **13 violações axe `moderate`** na JW-01 — `landmark-unique` × 4 (`.detran-sidenav > nav`) e `heading-order` × 9 (`h3` dos slots vazios, `#rait-dossier-1-requerente`); kit e `shared/` (`preview/rait-web/captures/axe-report.json`) (added 2026-10-15)
- [ ] R-0033 → R-0025: **`rait-document:attach-official` sem botão** para qualquer papel — chave fora de `RAIT_COMMAND_RULES` (OD-R12-027, R-14) (added 2026-10-15)
- [ ] R-0033 → R-0025: **8 telas de leitura unitária sem slot `empty`** (`/painel`, `/assinatura/:caseId`, lote, sessão, banca, ata, radar/:caseId, arquivo/casos) — exigiria `emptyWhen` nas facades (`reports/TASK-0004.md`) (added 2026-10-15)
- [ ] R-0033 → R-0025/R-0027/R-0029: **divergências jornada × manifesto** da classe de OD-C3-007 — JW-02 passos 3–4 (`/gestao/radar*` só `rait-manager`), JW-05 passo 4 (`/gestao/incidentes` só `rait-manager`), JW-08 passo 8 (`/organizacao/jeton` sem `rait-chair`); OD proposta por TASK-0008 (`plan.md` R-0033 §Retomada) (added 2026-10-15)
- [ ] R-0033 → R-0025: **comandos citados por jornada sem método M8** — `rait-archive:seal` (JW-04) e `rait-incident:open` (JW-09) não estão entre os 64 comandos de `command-gap-analysis.md`; ficha/contrato primeiro (added 2026-10-15)
- [ ] R-0033 → R-0025: **estimativa revisada da fase J** — tabela por jornada (P/M/G) e por superfície em `work/rounds/R-0033/plan.md` §Retomada; JW-01 (M) como primeira vertical (M3) (added 2026-10-15)
- [ ] R-0033 → follow-up: **`tools/devai/verify-round-tasks.mjs` ignora R > 20** — tarefas de R-0033 validadas só por `devai check --only schema` (M5) (added 2026-10-15)
- [ ] R-0033 → R-0026/R-0029: **`serve` de `apps/{dashboard,teat}/web/angular.json`** — conferir o defeito de `buildTarget` corrigido no `rait-web` (added 2026-10-15)
- [ ] R-0033 → follow-up: **SVGs `ARCH-RAIT-WEB-j01-*.svg` divergentes** do Mermaid reescrito da JW-01 (OD-C3-007 a); não há gerador no repositório (added 2026-10-15)
- [ ] R-0033 → follow-up: **13 datas herdadas só-data em `rait-fixtures.json`** × timestamp da seed (FIX-0001) — trocar exige alterar valor existente; candidata a OD (added 2026-10-15)
- [ ] R-0033 → follow-up: **cores literais da faixa de prévia** sem tokens `--detran-*` do guia §3.6; e P-24 (`check.mjs resolve` sobre as URLs do inventário) não implementado (added 2026-10-15)

## Handoff R-0022 → C-0003 (2026-10-14)

- [ ] **Salvamento do checkpoint R-0022 — R-0034:** `codex/detran-r22-adoption-160` @ `c22ea63a` (85 commits, 3 318 arquivos) é referência, não base; classificação reutilizar/adiar/descartar em `work/campaigns/C-0003-produto-primeiro.md` §9. Nada entra em bloco; cada fatia com teste próprio e lock próprio (added 2026-10-14).
- [ ] **Custódia de processo em Linux alvo — R-0034, timebox 1 janela:** duas sondas QEMU falharam `UNKNOWN_QUARANTINE` (`EROFS` em `/proc/self/stat` e `/proc/108/stat`; v15/v16, hashes conferidos). Sem retry autorizado; alternativa é ambiente nativo amd64 provisionado explicitamente. Nunca relaxar verificação de identidade nem bloquear a prévia por isso (added 2026-10-14).
- [ ] **Insumos de provedor/confiança — R-0034/R-0035:** produto/custodiante do provedor de assinatura, amostras públicas reais, piso/perfil/revisão/aprovador, âncoras signer/TSA/arquivo, algoritmo/OID/timestamp/revogação/proveniência: todos ausentes; fixtures `TEST_ONLY` não os substituem. Custodiante e data a obter do Owner (added 2026-10-14).
- [ ] **Lacunas de API pública do STYNX — R-0034/R-0023/R-0024:** ACK/proveniência atômica legada, histórico rico/SSE por escopo, deadlines explícitos, insumos C02/C03; acompanhar por issues no STYNX ou adapter DETRAN explicitamente delimitado, nunca comportamento local não documentado (added 2026-10-14).
- [ ] **Colisão ADR-0039/0040 — antes de R-0034:** PR #179 (`platform-latest`, `docs-dependency-audit`) × checkpoint (`r22-published-stynx-1-6-0-bounded-adoption`, `r22-stynx-1-6-1-forward-custody`). Decisão OD-C3-005; os do checkpoint são renumerados ao entrar (added 2026-10-14).

## Handoff R-0021 para R-0022 (2026-09-28)

- [ ] **Sensor CI stack smoke — R-0022:** jobs remotos `108792483206` (candidato) e `108793701832` (`main` STYNX 1.3.1) terminaram `stack:smoke` com exit 1, embora a reprodução isolada do SHA `2bc62e7a30270ac5c312656906e0465766811f2a` tenha passado 42/42. Primeiro reter e publicar o sumário de linhas do workflow para identificar o target que falhou; a triagem não expõe a linha/target e não autoriza alterar testes antes disso. Fonte: `work/rounds/R-0021/reports/CTG-0002-stack-smoke-triage.md` (added 2026-09-28).
- [ ] **Migrações STYNX transferidas — R-0022:** assinatura, outbox (incluindo despacho RENACH) e offline-sync aguardam suporte upstream compatível; preservar A1 e os requisitos originais ainda não cumpridos. Inventariar dependências STYNX sem import em R-0022. Notificações aguardam o produtor de OD-P40; não montar o módulo sem ele. Fonte: `work/rounds/R-0021/contracts/CTG-0001.md`, `AUTHORIZATION.md` e `work/campaigns/C-0002-stynx-upstream-spec.md` (added 2026-09-28).

> **Leitura atual:** a reconciliação de 2026-10-18 acima separa a fila de implementação e
> integração das decisões. [`open-issues.md`](./open-issues.md) retém o registro DT histórico;
> as seções seguintes são o diário das rodadas, com repetições e textos superados.

Formato: `- [ ] <pergunta ou id> — <por quê> (added YYYY-MM-DD)`

## Prioridade 1 — trilha recurso (rait + portal)

- [x] REF-CTB-280..290 (+257, 281-A, 282-A, 289-A, 290-A) — texto verbatim via compilado planalto.gov.br (camara.leg.br falhou, 504) → [REF-CTB-extracts-raw] (2026-08-24)
- [x] CONTRAN: Res. 900/2022 e 918/2022 capturadas (PDF oficial + excertos) → [REF-CONTRAN-900], [REF-CONTRAN-918] (2026-08-24)
- [x] Regimento/composição de JARI — Res. CONTRAN 357/2010 (diretrizes nacionais) capturada na íntegra → [REF-CONTRAN-357]; regimento LOCAL da JARI-AM/CETRAN-AM segue não localizado (2026-08-24)
- [x] Prazos legais: defesa prévia (30d mín., art.281-A), recurso 1ª instância JARI (30d p/interpor, 24 meses p/julgar — art.285), 2ª instância CETRAN (30d p/interpor, 24 meses p/julgar — arts.288-289); efeito suspensivo automático (art.285) — tudo capturado verbatim em [REF-CTB-extracts-raw] (2026-08-24)
- [x] SNE — Res. CONTRAN 931/2022 (revoga 622/16 e 636/16) capturada na íntegra, texto completo → [REF-CONTRAN-931] (2026-08-24)
- [x] DETRAN/AM: 3 cartas de serviço → [REF-DETRANAM-SERVICOS]; Portaria 5046/2018 obtida via OCR (PDF escaneado) → [REF-DETRANAM-PORTARIA-5046]; regimento JARI/CETRAN-AM segue não localizado (2026-08-24)
- [x] Benchmarks MG/PR/SP → [REF-BENCH-ESTADOS]; + processo interno RS/ES/PR/SP (distribuição, relator, quorum, sustentação oral) → [REF-CETRAN-PROCESSO-INTERNO] (2026-08-24)
- [x] Indicação de condutor — base legal geral em [REF-CONTRAN-931] art.4º VII-VIII e [REF-CETRAN-PROCESSO-INTERNO] (CETRAN-PR Res.090/24, Carteira Digital de Trânsito); prazo/formulário específico já coberto por [REF-CONTRAN-918] art.5º (2026-08-24)
- [x] Leis 9.873/1999 (prescrição) e 9.784/1999 (processo administrativo subsidiário) — capturadas → [REF-LEI-9873-1999], [REF-LEI-9784-1999] (2026-08-24; caixa reconciliada 2026-08-27)

## Prioridade 2

- [ ] RENAINF: papel do registro nacional no fluxo de recurso interestadual (2026-08-24)
- [ ] BOAT: RENAEST/registro nacional de sinistros — normas de notificação de acidentes (2026-08-24)
- [ ] PEC: resoluções sobre exame de aptidão física e mental / avaliação psicológica (2026-08-24)
- [ ] TEAT: requisitos legais do talonário eletrônico (assinatura, fé pública, evidências) (2026-08-24)

## Novos (surgidos na pesquisa de 2026-08-24)

- [x] DISCREPÂNCIA: JARI-AM anuncia julgamento em '30 dias úteis'; CTB art.285 §6º fixa teto de 24 MESES — resolvido: são naturezas diferentes (SLA operacional interno vs. teto legal de decadência), não contradição real; ver [REF-CTB-extracts-raw] nota do art.285 (2026-08-24)
- [x] Portaria DETRAN-AM 5046/2018 (representação) — PDF obtido (escaneado, OCR feito) → [REF-DETRANAM-PORTARIA-5046] (2026-08-24)
- [ ] Regimento e composição JARI-AM / CETRAN-AM — URLs históricas retornam 404, sem snapshot no Wayback; pista não confirmada: Decreto Estadual nº 34.398/2014 institui o CETRAN-AM (texto integral não obtido)
- [x] Resolução específica do SNE (900 art.12 remete) — identificada: Res. CONTRAN 931/2022 → [REF-CONTRAN-931] (2026-08-24)
- [x] CTB texto integral: obtido via planalto.gov.br compilado (camara.leg.br deu 504) + excertos verbatim arts.257, 280-290-A → [REF-CTB-extracts-raw] (2026-08-24)
- [ ] NOVO — CTB art.289-A (prescrição da pretensão punitiva por inércia do órgão julgador em julgar dentro de 24 meses) e Lei 9.873/1999 art.1º §1º (prescrição por paralisação >3 anos) — nenhum REF anterior cobria esses dois relógios de extinção de punibilidade; RAIT precisa monitorá-los ativamente. PRIORITÁRIO para LEGAL/BPO.
- [ ] NOVO — possível desatualização de [REF-CONTRAN-918] arts.20-21 face à Lei 14.599/2023 (CTB art.284 §§1º/6º) quanto a exigir adesão prévia ao SNE para o desconto de 60%; não localizada resolução CONTRAN pós-2023 ajustando a matéria
- [ ] NOVO — identificar a regulamentação CONTRAN de "força maior" para suspensão de prazos processuais (CTB art.290-A remete a regulamento não localizado)
- [ ] NOVO — confirmar grafia do nome do Diretor-Presidente que assinou a Portaria 5046/2018 (OCR ambíguo) se for necessário citar formalmente
- [ ] NOVO — obter PDF original de CETRAN-RS Res.88/2014 (site cetran.rs.gov.br bloqueou curl e WebFetch; texto atual vem de agregador legisweb.com.br, não primário)

## Mesclado dos _intake de mineração pec/teat/boat (2026-08-24)

### Corpus legal a capturar (ch)

- [ ] REF-CONTRAN-927 (2022) — exame médico e avaliação psicológica; âncora mestra do PEC
- [ ] REF-CONTRAN-789 (2020, consol. 2024) — etapas do processo de habilitação
- [ ] REF-CONTRAN-1009 (2024) — toxicológico C/D/E antes das demais etapas
- [ ] CFP 01/2019 — norma técnica da avaliação psicológica
- [ ] Portaria DETRAN-AM 005/2021 — sessão única / horário (escopo estadual)
- [ ] Portarias SENATRAN 968/2022, 495/2025, 1.515/2018, 2.145/2020 — biometria/presença
- [ ] Lei 13.787/2018 + Res. CFM 1.821/2007 — prontuário eletrônico
- [ ] MP 2.200-2/2001 + Lei 14.063/2020 — assinatura eletrônica qualificada
- [ ] Regimento/composição da junta médica de trânsito e CETRAN (contexto habilitação)

### Corpus legal a capturar (inf/est)

- [ ] Requisitos legais do talonário além da 918 art.3º (fé pública, formato do AIT impresso,
      critérios gerais para outros equipamentos); esta pesquisa não condiciona nem reabre a
      homologação incondicional do Gertec GMS820 decidida pelo Owner em R-0013
- [ ] Base legal do saneamento de AIT; condições/ator de cancelamento de AIT finalizado
- [ ] Catálogo fechado de no_approach_reason (constatação sem abordagem)
- [ ] Base normativa do RENAEST (nada localizado além de contrato técnico)

### Decisões do owner

- [x] shared/actors.md: espelhar os 9 papéis granulares do TEAT ou manter visão agregada? → espelhar os 9 papéis (steering.md F.30, 2026-08-24)
- [x] "Parceiro conveniado" (BOAT): visão futura ou remover da missão? → manter como visão futura (steering.md F.31, 2026-08-24)
- [x] Papéis de protótipo sem RBAC (Suporte, Fiscal de contrato, DPO) entram em ondas futuras? → sim, ondas futuras (steering.md F.32, 2026-08-24)
- [x] UC-1.245/246 (danos materiais, testemunhas) e UC-1.251 (relatório preliminar): UC próprio ou extensão? → UC próprio e dedicado (steering.md F.33, 2026-08-24)

### Handoffs de engenharia (fora deste KB — monorepo/pec/teat)

- [ ] pec: estado CANCELLED do encounter é morto (enum sem rota que o grave)
- [ ] pec: primeiro laudo assinado força SIGNED — pode travar o segundo profissional na mesma rota
- [ ] pec: UNDER_REVIEW da junta é inatingível; junta sem composição/membros/pauta
- [ ] pec: rastreabilidade divergente (BP-juntas referencia SUC-UC-13/15 vs UC-J1/J2)
- [ ] teat: exclusão de intervalos de numeração SEM constraint de banco (só validação de app) — risco de sobreposição sob concorrência
- [ ] teat/boat: crash_record_id em medidas administrativas sem FK rígida (nota explícita nos docs)
- [x] teat: comportamento do pacote normativo expirado offline (bloquear vs avisar) — E.29 confirmado pelo Owner também sob E2: aviso visível e registrado, sem bloqueio por expiração isolada após prova válida do pacote; ADR-0031 (2026-09-23)
- [ ] teat/rait: **R-0007 `rait-backend` rebaseia sobre `main` pós-CTG-0001** (`DetranError` em
      `backend/domains/shared/src/errors/`, `policy-routes.e2e.spec.ts` seção RAIT a acrescentar) e, após
      o merge de CTG-0004/CTG-0005, sobre `tools/contracts/check-commands.mjs`, `contracts:clients` e
      `packages/api-clients` (M1/M18/M19 nasceram na frente `teat-backend`, R-0008 `plan.md` §Bloqueios)
- [ ] teat: **timers de medida (`owner='medida'`) só são calculados, nunca persistidos** — `inf.infraction_timer`
      tem FK à infração, não à medida; a persistência fica para R-0007 (M14, CTG-0004 §2)
- [ ] teat: **conteúdo "assinado" do pacote normativo mobile é `sha256` local** (`signer='detran-backend-local'`,
      `signature.kind='local-unsigned'`) enquanto o substrato de assinatura (ADR-0018) não estiver ligado — OD-T16
- [ ] teat: **implementar OD-T14 / `1A-300-E2`** — linha de catálogo aprovada para 300 s de frescor
      online, e o backend já deriva `validUntil` do parâmetro válido sem fallback; o mobile ainda
      bloqueia snapshots vencidos. Integrar prova offline local real (grant, reserva e pacote)
      antes de substituir esse comportamento fail-closed. Owner selecionou Android como única
      plataforma E2 e, incondicionalmente, homologou o Gertec GMS820 como primeiro modelo.
      Perfil selecionado em ADR-0032 (status 900 s; janela 3600 s); portas, chaves públicas,
      dados e provas de execução E2 ainda pendem, sem reabrir a homologação — ADR-0029,
      R-0013 `plan.md`
- [ ] teat: **executar matriz AIT V01–V11 autorizada pelo Owner** — a matriz revisada é fonte
      executável no seu recorte, sem promover integralmente as RN `draft`. ADR-0032 escolheu
      a política de execução; faltam DSL materializada, caminhos, fatos e pacote normativo
      verificável; finalização AIT permanece bloqueada — ADR-0030,
      R-0013 `plan.md`
- [ ] teat: **`batches/{id}/retransmit` e `GET certificates`** (route contract §4.6) ficam fora por falta de
      entidade de lote de integração em `ops` e de fonte para validade mTLS — OD-T43
- [ ] portal/rait: **R-0007 `rait-backend` precisa mesclar em `main` para as delegações reais do Portal**
      (`defesa_previa`, `recurso_jari`, `recurso_cetran`, `indicacao_condutor`, `pagamento`): até lá
      `POST requests` responde `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'delegacao_indisponivel_r0007'}`
      na verificação de elegibilidade e o teste de delegação real com alvo real fica `it.todo` citando
      R-0007 (`work/rounds/R-0009/plan.md` M8/M23; `portal-build-pack.md` §3)
- [ ] portal: **adesão/cancelamento reais de SNE via `SnePort`** (`packages/senatran-adapter`) não
      implementados em R-0009: `portal.sne_enrollment` grava o pedido e publica
      `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` sem chamar o SNE nacional — OD-P16 (R-0014 WP-P6)
- [ ] portal: **`lgpd_declaracao` (escopo `declaracao_completa`/`correcao`/`eliminacao`) depende do módulo
      `@stynx-nyx/privacy` não montado no app**: rota responde `SERVICE_UNAVAILABLE` com
      `unavailableReason:'privacy_endpoint_pendente'`; catálogo marca o serviço `partially_available`
      (só `confirmacao`) — OD-P17 (R-0014)
- [ ] portal: **`junta_medica` fora do catálogo de 15 serviços** (delegação PEC sem comando) e projetores
      `crash_view`/`exam_view` só com tabela + esqueleto (`applyEvent` registrando `last_event_id`, sem
      produtor real) — OD-P19 (R-0010/PEC)
- [ ] portal: **3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão** em
      `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`): evento
      com esses estados falha o projetor (`last_error`), nunca rótulo inventado — OD-P20 (linguagem cidadã,
      LEGAL/Owner)
- [ ] portal: **CNH-e/CRLV-e assinados e credenciais institucionais do IdP gov.br real** ficam para R-0014
      WP-P6 (OD-P15, ADR-0018); nesta rodada só IdP simulado nos perfis `test`/`local`
- [x] **OD-D81 (R-0007, ensaio de upgrade)**: resolvido em 2026-09-22. A causa era usar um segundo processo `pg_dump --data-only` como observador durante a liberação da transação do ensaio concorrente; o dump também carrega estado operacional não transacional, como `setval`, e não constitui um sensor estável dessa janela. Dados de aplicação agora são comparados pelo sensor tipado `legacyRows()`, por schema/tabela/colunas/linhas ordenadas; schema, roles e globals mantêm fingerprints independentes. O normalizador de dump permanece coberto por teste, provando que mudança de linha é detectada e envelope não tabular é ignorado. (added 2026-09-22)
- [ ] teat: **`ops/field/shift-readiness.ts` lê `inf.normative_mobile_package`** fora dos limites do gate
      `verify:domain-boundaries` (R-0011, ADR-0020/M6) — dívida declarada e impressa pelo gate, nunca
      silenciosa — OD-D15 (dono do TEAT; fonte `plan.md` M6, contrato `CTG-0001.md` §8)
- [ ] dashboard: **`backend/app/src` (raiz de composição, um deployable) fica fora do gate
      `verify:domain-boundaries`** nesta rodada — OD-D16 (fonte `plan.md` M6, contrato `CTG-0001.md` §8)
- [ ] dashboard/rait: **integração do relógio do DASHBOARD ao motor de prazos (`owner='dashboard'`)
      depende de R-0007 CTG-0003 em `main`**: `dashboard.timer` e `DashboardClockService` são a ponte
      (mesmo vocabulário `ARMADO/VENCIDO/SATISFEITO/CANCELADO`) — OD-D28 (dono de R-0007/próxima rodada
      do DASHBOARD; fonte `plan.md` M15/A18, contrato `CTG-0002.md` §16)
- [ ] pec/teat/boat/portal/senatran-adapter: **cadeias de escalonamento não publicadas**:
      `dashboard.escalation_chain_ref` nasce com linhas `source_pending` (um nível, `owner_role`) até
      cada frente publicar a cadeia nomeada em códigos de `roles.ts` — OD-D29 (donos de cada app; fonte
      `plan.md` M18, contrato `CTG-0002.md` §16)
- [ ] dashboard: **seed `81-fixtures-dashboard-state.sql` sem as fontes `portal.outbox`/`dashboard` nem
      um segundo tenant com catálogo `dashboard.*`**: a suíte de ciclo e a de superfície as inserem e
      removem no `afterAll`; propor linha canônica no seed — OD-D61…D63 (dono do próximo CTG do
      DASHBOARD; fonte `plan.md` A21/A23, contrato `CTG-0002.md` §16)
- [ ] Owner: **o DASHBOARD deve ser excluído do atalho de administrador global** (`policy.ts` concede
      `'*'` a `GLOBAL_ADMIN_ROLES` em toda rota, inclusive as do DASHBOARD) **?** — OD-D76 (fonte
      `plan.md` A23(a), contrato `CTG-0002.md` §16)

## Rodada RAIT — time multidisciplinar (2026-08-24)

Intakes completos para moderação: inf/rait/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md e transversal/portal/_intake/ux-notes.md.

### Decisões do owner (destiladas da rodada)

- [x] Validação jurídica humana: lista priorizada de 15 itens em legal-assessment.md — respondida em steering (2026-08-24), sem parecer formal: Lei 9.873 aplica ao DETRAN-AM (sim); relógio que governa o SLA = o mais curto (3 anos); recurso da autoridade contra provimento = vinculado (autoridade/prazo/contrarrazões ainda em aberto); desconto 40% pós-Lei 14.599/2023 sem SNE = aplicar mesmo assim (procedimento operacional ainda em aberto). Ver steering.md §C, itens 13-27, e aviso de risco no topo do arquivo.
- [x] Calibrar a escada de alertas de prescrição (marcos propostos em WF-RAIT-002 §4) → aprovada como proposta (steering.md A.1, 2026-08-24); nota de capacidade pendente — ver steering.md §"Pontos que a múltipla escolha não fechou"
- [x] Obter regimento interno JARI-AM/CETRAN-AM (não público; lead: Decreto Estadual 34.398/2014) → decisão: formalizar as propostas do corpus (CETRAN-ES+SP) como desenho de fato, sujeito a validação jurídica antes de `approved` (steering.md A.4, 2026-08-24)
- [x] Fornecer volumes históricos de defesas/recursos para o modelo de capacidade (bpo-notes §3) → ordens de grandeza fornecidas: 1 JARI-AM, quorum CETRAN ~8, volume >500/mês, 6-15 analistas (steering.md B.9-B.12, 2026-08-24); throughput real do colegiado ainda não perguntado
- [x] Corrigir cartas de serviço DETRAN-AM (2 exigências sem base legal: endosso cartorial ×Portaria 5046/2018 art.2º §2º; anexar parecer da JARI ×CTB 285 §4º) — mudança só de texto, alto impacto cidadão → autorizado (steering.md D.28, 2026-08-24)

## Rodada TEAT — time multidisciplinar (2026-08-24)

Intakes para moderação: inf/teat/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] Validação jurídica humana: 15 itens priorizados em legal-assessment.md — em especial: conflito triplo sobre recolhimento do documento de habilitação (MBFT §8.3 × CTB 165/165-A × Res.432 art.10); janela de "mesmo intervalo de tempo" da sessão concorrente (997 Anexo II,h — parâmetro a definir com risco bilateral); saneamento/cancelamento pós-finalização SEM norma (997 art.3º V proíbe alteração — formalizar via portaria DETRAN-AM?)
- [ ] Bodycam: escopo MVP ou onda futura? (BPO deixou como decisão explícita); retenção/LGPD/acesso do interessado sem norma — risco jurídico-institucional
- [ ] Guarda monitorada: em vigor porém inaplicável (solução tecnológica não homologada) — posicionar roadmap
- [ ] Termo de Recolhimento: imprimir prazo de 60 dias (não 30) — corrigir template
- [ ] Res.432 remete ao art.165 pré-165-A: adotar enquadramento correto no catálogo normativo do TEAT
- [x] Propostas de glossário/atores/WF-INF-001 dos intakes propagadas aos artefatos compartilhados (2026-08-27)

### Adjacências BOAT (para a rodada BOAT)

- [ ] Bodycam em atendimento de sinistro (Portaria 003/2026 art.4º I) + câmera veicular opcional

## Rodada BOAT — time multidisciplinar (2026-08-24)

Intakes: est/boat/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] LGPD saúde da vítima: adotar posição prudencial art.11 II a/b + publicar a hipótese (dever de publicidade hoje descumprido) — item nº1 do advogado
- [ ] Definir PRAZOS DE RETENÇÃO (BAT identificado, bodycam) — nenhuma norma os fixa; modelo de duas camadas proposto em RN-BOAT-125
- [ ] Papel LGPD do DETRAN-AM (controlador?) — divergência interna da Portaria 139/2025 art.7º §3º (cita CTB 22 II/III, não IX)
- [ ] Ofício institucional DETRAN-AM→SENATRAN: Manuais RENAEST + campos mínimos do BAT + manuais de acesso (obrigações vinculadas a documentos não públicos)
- [ ] Periodicidade de transmissão RENAEST (prazo legal desaparecido — 326-A §9º remitido a regulamentação nunca editada): adotar mensal como SLA operacional?
- [ ] Derivação severity(vítima)↔gravidade(sinistro) sem fonte — definir regra própria documentada
- [ ] Veículo removido com proprietário hospitalizado: prazo de 60d do art.328 sem suspensão — posição institucional
- [ ] Correção de registro nacional CONSOLIDADO/REJEITADO: vazio normativo — proposta PENDENTE-DE-NORMA em WF-BOAT-003

## Rodada PEC — time multidisciplinar (2026-08-24)

Intakes: ch/pec/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] Regime de distribuição de exames: adotar P2 (candidato escolhe região/data, sistema sorteia clínica/perito — recomendação técnica LEGAL, converge com antifraude) ou outra posição P1-P4? CFM 1.636 art.3º expõe pessoalmente o diretor médico
- [ ] Vocabulário de resultado: eliminar CONDICIONADO do enum; adotar rótulos federais; confirmar com DETRAN-AM o mapeamento prazo(30/60/90/365)↔rótulo(5) e o que o RENACH aceita
- [ ] Retenção 20 anos (Lei 13.787 art.6º): definir RESPONSÁVEL (clínica × DETRAN × plataforma) + preservação criptográfica de longo prazo
- [x] Recuperar Portaria DETRAN-AM 008/2021 — obtida via Wayback Machine; regime CNH Social distinto da 005/2021 (2026-08-27)
- [ ] Toxicológico periódico pós-CNH (2a6m): dentro do escopo do PEC ou 100% externo?
- [ ] Junta Especial de Saúde (3ª instância): modelar como órgão distinto (hoje é só flag de assinatura CETRAN)
- [ ] Validação humana: top-10 do advogado em legal-assessment.md

### Handoffs de engenharia (pec)

- [ ] Módulo de faturamento estruturalmente errado: preço público federal indexado ao IPCA (Lei 15.428/2026, CTB 148 §7º)
- [ ] Validade do exame: implementar 10/5/3 por faixa etária (CTB 147 §2º) — NÃO os 5/3 da 789/2020
- [ ] Enum CONDICIONADO → "apto com restrições" (medical-only); nunca exibir PENDENTE/CONDICIONADO ao candidato
- [ ] Ator do SUBMITTED da junta está errado (deve ser o candidato — RN-PEC-110)

## Rodadas PORTAL + DASHBOARD — time multidisciplinar (2026-08-24)

Intakes: transversal/{portal,dashboard}/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] **Portaria do órgão fixando níveis de assinatura por serviço** — o Decreto 10.543/2020 é FEDERAL; sem ato estadual, exigir "avançada" no PORTAL é atacável (Lei 13.460 art.5º IV). Mitigação de custo baixo e efeito total (RN-PORTAL-101/102)
- [ ] Confirmar/registrar formalmente a (in)existência de adesão do AM à Lei 14.129/2021 — condiciona o fundamento de 12 regras PORTAL e do módulo público do DASHBOARD
- [ ] Renúncia ao recurso na faixa de 40% FORA do SNE (decisão de steering C.17): não há forma normativa para colher a declaração — definir instrumento antes de implementar
- [ ] CRLV-e bloqueado por multa sob recurso com efeito suspensivo: adotar a leitura de que exigibilidade suspensa não é débito (senão é coação indireta ao pagamento) — RN-PORTAL-116
- [ ] Declarar formalmente WCAG 2.1 AA + eMAG como padrão (LBI art.63 — obrigação sem cláusula de adesão, risco MP/ACP, custo quase nulo)
- [ ] **Limiar de célula para publicação agregada de sinistros** (risco ALTO de reidentificação em municípios pequenos) — exige parecer ANTES da primeira publicação (RN-DASH-161)
- [ ] Confirmar autorização do órgão máximo para pagamento com cartão/parcelamento (Res.918 art.27 §§1º-2º) — pré-condição de existência do módulo
- [ ] Calibrar os limiares das escadas de alerta do DASHBOARD (9 decisões em dashboard/_intake/bpo-notes.md)
- [ ] Validação humana: 18 itens (PORTAL) + lista DASHBOARD nos respectivos legal-assessment.md

### Pesquisa pendente (proposta pelo DASHBOARD legal)

- [ ] REF-AM-LAI-* (procedimento recursal estadual da LAI) — gap mais urgente
- [ ] REF-AM-GOVDIGITAL-* (adesão à 14.129, ou registro formal de inexistência)
- [ ] REF-CGEAM-IN-001-2020 + REF-DECRETO-AM-53273-2025 — solicitar à CGE-AM (site fora do ar: HTTP 500/TLS expirado)
- [ ] REF-CONTRAN-PNATRANS-FORMULAS (fórmulas dos indicadores)
- [x] Sincronizar REFs com textos já transcritos nas regras: LGPD art.5º X/art.11 e LAI art.32 incorporados às respectivas REFs (concluído 2026-08-27)

### Reconciliações pendentes (colisões de rodada paralela)

- [ ] Ouvidoria: LEGAL conclui "nenhum nível de assinatura exigível" (Decreto 10.543 art.2º p.ú. III exclui ouvidoria); BPO/UX assumiram "Simples" — alinhar WF-PORTAL-004, UC-PORTAL-016 e o catálogo de serviços
- [x] DASHBOARD: auditoria concluída; o BPO atual não contém referências `RN-DASH-*` futuras e o catálogo está reconciliado com RN-DASH-101..172 (2026-08-27)
- [x] Corrigir dossiê PORTAL: removido o falso teto de "até 12x"; art.27 é operação de cartão por conta e risco da instituição e o órgão recebe à vista e integral (art.24 §3º) (2026-08-27)
- [ ] RAIT: prescrição quinquenal sem escada de alerta própria; captura de `data_recebimento_cetran` ausente (gaps expostos pelo catálogo DASHBOARD)

## Rodada de endurecimento de especificação — RAIT (2026-08-26)

Corpus RAIT preparado para consumo por equipe de desenvolvimento: 68 critérios de aceitação
(AC-RAIT-*) nos 12 UCs, referências cruzadas reconciliadas, vocabulário de estados unificado,
inventário de telas promovido a [IU-RAIT-001], 27 artefatos em `approved`.

### Residual que segue com o Owner (nenhum bloqueia o início da construção)

- [ ] **Recurso da autoridade contra provimento** — autoridade competente, prazo próprio e
      contrarrazões ([RN-RAIT-130], [UC-RAIT-008]); é o único que bloqueia _modelagem completa_
      de metade do art.288 §1º
- [ ] **Art.289-A** — efeito do julgamento proferido após os 24 meses; suspensão/interrupção;
      intervalo entre instâncias ([RN-RAIT-112])
- [ ] **Sustentação oral** — prever como etapa configurável ou omitir por padrão ([WF-RAIT-003],
      tela T-12 de [IU-RAIT-001])
- [ ] **Desconto de 40% fora do SNE** — procedimento de emissão do documento de arrecadação
      ([RN-RAIT-127])
- [ ] _**Reformatio in pejus**_ em 2ª instância ([RN-RAIT-119], [RN-RAIT-132])
- [ ] **Índice de correção da restituição** (UFIR extinta) — índice fiscal do AM a identificar
      ([RN-RAIT-129])
- [ ] **Throughput real do colegiado** — fecha a nota de capacidade de `APP.md` §Volumes

### Fila de revisão do Owner (regras legais ainda em `draft`)

22 regras da série 1xx escritas pelo LEGAL e não revisadas individualmente: RN-RAIT-102, 104,
106, 107, 108, 109, 110, 115, 117, 118, 120, 124, 125, 126, 128, 130, 131, 132. Não bloqueiam
construção — todo AC que delas depende cita a regra explicitamente.

## Auditoria cruzada de referências e vocabulário (2026-08-26)

Aplicadas aos cinco apps restantes as duas classes de defeito descobertas na rodada RAIT.
Guardadas dali em diante por `_meta/check-corpus.py` (442 artefatos, 382 tokens canônicos, OK).

**Classe 1 — referência a regra por número proposto.** TEAT tinha a mesma armadilha do RAIT, e
documentada: `_intake/bpo-notes.md` §4 previa a substituição mecânica ("grep por `RN-TEAT-10`")
quando o LEGAL fechasse o catálogo — nunca executada. Oito citações apontavam para regras reais
de conteúdo alheio. Corrigidas com o mapa em §4. BOAT, PEC, PORTAL e DASHBOARD não tinham a
armadilha (citam 1xx reais).

**Classe 2 — vocabulário de estado cunhado fora do workflow.** TEAT: `CANCELAMENTO_SOLICITADO_POS_FINALIZACAO`
→ `SOLICITADO_CANCEL_POSFINAL`; `RETIDO_AGUARDANDO_REGULARIZACAO` → `LIBERADO_COM_PRAZO`.
PORTAL: `SESSAO_JARI` → `JULGADO_SESSAO`. DASHBOARD: `ALERTA`/`CUMPRIDO_COM_COMPROVANTE` →
`JANELA_ABERTA`/`PREPARADO`/`SUBMETIDO_PUBLICADO`/`COMPROVADO`. BOAT e PEC limpos.

**Achados avulsos corrigidos:** UC-RAIT-012 e UC-PORTAL-006 citavam [RN-RAIT-004] (diligência)
para desistência — é [RN-RAIT-123]; UC-PORTAL-014 citava [RN-PEC-106] (efeitos) para
nomenclatura — é [RN-PEC-105]; UC-PEC-002 citava [RN-PEC-005] (biometria do perito ao assinar)
para o check-in do candidato — é [RN-PEC-130]; duas referências `RN-RAIT` sem número (colchetes removidos).

## Rodada de endurecimento de especificação — TEAT (2026-08-26)

Decisão de escopo do Owner: **Opção A** — medição de velocidade com **equipamento acoplado ao talão**
(inciso II, [REF-CONTRAN-918] art. 3º §1º) entra no TEAT; **fiscalização eletrônica por equipamento
fixo** (inciso III, com referendo) fica fora, formalizando a linha que [RN-TEAT-106] já traçava.
Ver `inf/teat/APP.md` §Fronteira.

Entregue: 87 critérios de aceitação (AC-TEAT-*) em 13 casos de uso; [UC-TEAT-013] novo (medição
acoplada) com gates em [WF-TEAT-001]; **citação de regras de 17/49 para 49/49** — toda regra legal
do TEAT tem hoje um lugar operacional; [IU-TEAT-001] promovido como _registro de deltas_ sobre a
matriz oficial de 67 telas (não um inventário paralelo); [RN-DASH-173] novo no DASHBOARD para o
dever de publicidade da relação de medidores.

### Residual (detalhado em `inf/teat/APP.md` §Residual)

- [ ] **As 49 regras legais seguem em `draft`** — a lista de 15 itens de validação jurídica do TEAT
      (`_intake/legal-assessment.md`) nunca foi respondida pelo Owner, diferente da do RAIT
- [ ] Conflito triplo sobre recolhimento do documento de habilitação ([RN-TEAT-129]) — item nº 1
- [ ] Bodycam: escopo MVP × onda futura; retenção sem norma ([RN-TEAT-141], [RN-TEAT-142])
- [ ] Guarda monitorada: em vigor, tecnologia não homologada ([RN-TEAT-127])
- [ ] Saneamento/cancelamento pós-finalização sem norma federal ([RN-TEAT-119], [RN-TEAT-121])
- [ ] Janela de "mesmo intervalo" da sessão concorrente ([RN-TEAT-111])
- [ ] Parque de medidores do DETRAN-AM ([UC-TEAT-013], [RN-DASH-173])

## Rodada de endurecimento de especificação — BOAT (2026-08-26)

Entregue: 63 critérios de aceitação (AC-BOAT-*) em 12 casos de uso; **citação de regras de 18/36
para 36/36** — o bloco LGPD ([RN-BOAT-122] a [RN-BOAT-132]) e as regras de competência
([RN-BOAT-101], [RN-BOAT-107] a [RN-BOAT-113]) não tinham nenhum lugar operacional antes desta
rodada; [UC-BOAT-012] promovido de `stub` a caso de uso escrito (decisão F.33 do Owner nunca
executada); [IU-BOAT-001] promovido com 12 telas mobile + 5 web, incluindo duas novas.

Correções de consistência: [UC-BOAT-002] ainda capturava o booleano `evaded` que [UC-BOAT-007]
havia substituído pela captura estruturada dos arts. 176-178; o inventário de telas repetia o
mesmo erro.

7 artefatos `approved`, 10 `reviewed`; as 36 regras seguem `draft` — a lista jurídica do BOAT não
foi respondida, e o núcleo aberto é a base do tratamento de dado sensível de saúde.

### Achado a decidir

- [ ] **Dever de resposta ao titular ([RN-BOAT-126]) não tem caso de uso nem superfície** — a tela
      W-05 de [IU-BOAT-001] registra o gap; candidato a UC-BOAT-013, a decidir junto com a
      fronteira BOAT × PORTAL para consulta do BAT pelo cidadão ([JRN-BOAT-005])

## Rodada de endurecimento de especificação — PEC (2026-08-26)

Entregue: 70 critérios de aceitação (AC-PEC-*) em 12 casos de uso; **citação de regras de 22/36
para 36/36** — faltavam o bloco LGPD ([RN-PEC-150] a [RN-PEC-154]), o bloco de prontuário e
assinatura ([RN-PEC-140] a [RN-PEC-142]) e as regras do ato pericial ([RN-PEC-101],
[RN-PEC-104], [RN-PEC-107]); [UC-PEC-013] promovido de `stub` a caso de uso escrito, redigido
para a posição P2 recomendada pelo LEGAL com os pontos que mudam sob P1/P3 marcados;
[IU-PEC-001] promovido com 26 telas (3 novas), das quais 5 ficam bloqueadas por decisão pendente.

[UC-PEC-012] foi promovido a `reviewed` em 2026-08-31 após a reconciliação de DT-024: o PEC
recebe do RENACH, pela fronteira SENATRAN, eventos autenticados e idempotentes de resultado
toxicológico periódico; não fabrica encounter, não substitui o alerta da SENATRAN e registra de
forma imutável resultado, suspensão e eventual liberação.

10 `approved`, 9 `reviewed`; as 36 regras seguem `draft` (top-10 do advogado não respondido).

### Particularidade do PEC — três itens já são DEFEITOS, não decisões

- [ ] Faturamento estruturalmente errado (preço público IPCA, Lei 15.428/2026) — DT-100
- [ ] Validade do exame 10/5/3 por faixa etária, não 5/3 da Res. 789/2020 — DT-101
- [ ] `CONDICIONADO` exposto ao candidato, rótulo inexistente em norma — DT-102, DT-022
- [ ] Implementar a Junta Especial de Saúde como colegiado distinto designado pelo CETRAN,
      substituindo no alvo a reatribuição de signatário da origem — DT-025 reconciliada em
      2026-08-31

## Rodada de endurecimento de especificação — PORTAL (2026-08-26)

**O PORTAL entrou com 0/28 regras citadas** — o caso mais extremo do programa. A rodada LEGAL
correu em paralelo à do BPO e seu resultado nunca foi incorporado: os 19 casos de uso citavam
regras do RAIT, do PEC e do BOAT, e nenhuma do próprio app. **Agora 28/28.**

Entregue: 92 critérios de aceitação (AC-PORTAL-*) em 19 casos de uso; [RN-PORTAL-108] ancorada em
[WF-PORTAL-001] (Carta de Serviços como campo de catálogo, medível item a item);
[IU-PORTAL-001] promovido com 27 telas (1 nova — elevação de nível), com acessibilidade tratada
como obrigação de resultado incidente sobre todas.

15 `approved`, 10 `reviewed`; as 28 regras seguem `draft` (18 itens jurídicos abertos).

### Duas afirmações FALSAS corrigidas — teriam virado código

- [x] [UC-PORTAL-015] dizia parcelamento "em até 12x" como regra do órgão — o art.27 da Res.918 é
      operação de cartão por conta e risco da instituição e **não fixa parcelas** ([RN-PORTAL-126];
      fecha DT-120)
- [x] [UC-PORTAL-018] aplicava os 15 dias do art.19 II da LGPD ao Poder Público — não é o prazo
      aplicável ([RN-PORTAL-120])

## Rodada de endurecimento de especificação — DASHBOARD (2026-08-31) — ÚLTIMA

Entregue: 46 critérios de aceitação (AC-DASH-*) em 8 casos de uso; **citação de regras de 0/31
para 31/31** (mesmo padrão do PORTAL — a rodada LEGAL nunca foi incorporada); [IU-DASH-001]
promovido com 9 painéis (1 novo: transparência ativa) e a hierarquia de três camadas.

### O achado: colisão de vocabulário entre a camada derivada e a fonte

- [x] **Letras dos relógios do RAIT divergiam.** O DASHBOARD usava `B1/B2/C1/C2`; o RAIT e o modelo
      de dados usam `A/B/C/D`. O `C` do painel era o `D` do RAIT e o `C2` do painel era o `C` do
      RAIT — um operador lendo "relógio C" nos dois lugares veria relógios **diferentes**, e nenhum
      valor `B1/B2/C1/C2` é gravável em `rait_clock.clock_code`. Corrigido em [RN-DASH-131], que
      agora declara explicitamente que **o RAIT é o dono das letras**; a distinção 1ª/2ª instância
      permanece como dimensão `instancia` do relógio B, não como letra nova
- [x] [RN-DASH-131] dizia "quatro relógios" no título e "os cinco relógios acima" no corpo
- [x] Inventário de telas citava [WF-RAIT-002] §4.1-4.3, anterior ao relógio D
- [x] Catálogo de deveres descrito como 13 linhas; [RN-DASH-120] tem 14

Vocabulário obsoleto das outras rodadas (`evaded`, `CONDICIONADO`, "12x") verificado e ausente.

**Seis de seis apps com rodada concluída.** Total do programa: 427 critérios de aceitação,
citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo).

### Divergência especificação × código encontrada nesta rodada

- [ ] **O relógio D existe no código, mas não neste repositório.** `aarusso-nyx/detran` main tem a
      constraint `clock_code in ('A','B','C','D')` e o PR #20 mergeado; aqui, [WF-RAIT-002] §4.4
      ainda é "SLA operacional local" — a seção do relógio D nunca foi publicada. A regra
      [RN-DASH-131] foi ancorada no modelo de dados (verificável hoje) em vez de na seção ausente,
      e a lacuna fica registrada até que a seção seja publicada

### Único débito de cobertura remanescente

- [ ] **RAIT: 32/43 regras citadas.** Oito nunca citadas de origem + três do bloco LGPD
      ([RN-RAIT-133..138]) acrescentado depois da rodada. O RAIT foi o primeiro app e a métrica de
      cobertura só passou a ser medida a partir do TEAT — lacuna da disciplina, não do corpus

## Rodada de modelagem BPM do ciclo da infração (2026-09-12)

- [x] **Decidir a substituição de [WF-INF-001] por [WF-INF-003]** — **DECIDIDO pelo Owner em
      2026-09-12 (ADR-0014):** WF-INF-003 substitui WF-INF-001; ponteiro mantido, referências
      atualizadas, WF-INF-003 promovido a `reviewed`. Runtime: agregado da infração com blueprint
      `BP-INF-INFRACTION-001` desde R-0006 (CTG-0001, PR #39; ver ADR-0014 §Consequências)
- [ ] **Reconciliar a escada do relógio B** — [RN-RAIT-112] (4 degraus, crítico em 21 meses) ×
      [WF-RAIT-002] §4.1 (5 degraus, crítico em 23 meses, aprovado em steering A.1) (added 2026-09-12)
- [ ] **Desfecho de `T-NA-IND` vencido** (NA ao condutor indicado não expedida em 30 dias do protocolo
      da indicação) — a norma dá o termo inicial, não a consequência; proposta em [WF-INF-002]
      §Decisões pendentes, validar com LEGAL (added 2026-09-12)

## Rodada de organização do trabalho RAIT (2026-09-12)

- [ ] **Estatuto da Pessoa Idosa (Lei 10.741/2003) art. 71** — prioridade de tramitação; capturar
      para ativar a prioridade legal na ordem de consumo das filas ([RN-RAIT-141]) (added 2026-09-12)
- [ ] **Escala de assinatura das 55 autoridades investidas** — ato de investidura/delegação e
      divisão de circunscrições ([RN-RAIT-143], [WF-RAIT-004] §3) — `institutional-ask` (added 2026-09-12)
- [ ] **Taxa de recurso à JARI/CETRAN e throughput de sessão** (DT-064) — fecha o dimensionamento
      de [WF-RAIT-004] §8 e o gatilho de nova turma ([RN-RAIT-139]) (added 2026-09-12)
- [x] **Blueprint BP-INF-RAIT-WORKLIST-001** — deltas de modelo de dados propostos em
      [WF-RAIT-004] §10 (unidade/turma, escala, lote de sorteio, suplência, tipo de impedimento,
      banca) — entregue em R-0006 (CTG-0002, TASK-0004; PR #43, `PC-0004`, 2026-09-15) (added 2026-09-12)

## Rodada de definições para a orquestra de agentes — RAIT (2026-09-12)

- [x] **Adoção de STYNX 1.3.1 / Angular 22 / DEVAI 1.4.5** — decidida pelo Owner (steering G.34; ADR-0015);
      migração dos pins no WP-0 de `docs/framework/arch/rait-build-pack.md`
- [x] **Catálogo canônico de papéis estendido** com a família `rait-*` (steering G.35): `roles.ts`,
      `policy.ts`, `05-role-catalog.sql`, `shared/actors.md`; gate `verify:role-catalog`
- [x] **Vocabulário de [WF-INF-003] persistido** (`14-inf-lifecycle-vocabulary.sql`; steering G.36); gate
      `verify:lifecycle-vocabulary`
- [ ] **Questões pendentes compiladas** em `docs/meta/knowledge-base/open-decisions-rait.md` (OD-001…OD-308) —
      cada uma com premissa de desenho; fechar por Owner / regimentos / LEGAL (added 2026-09-12)
- [x] **`apply.sh` não lista os DDL gerados 34…37** — corrigido em 2026-09-13 junto com `seed.sh` e as
      fixtures canônicas (validado em banco limpo)
- [x] **Suporte à orquestra (2026-09-13)**: manuais por perfil (`docs/meta/agents/`, `.claude/agents/`),
      `CODESTYLE.md`, template de PR, estratégia de testes, fixtures canônicas + `seed.sh`, motor de
      prazos, contrato de eventos/SSE, guia do kit, glossário i18n + `rait.pt-BR.json`, roteiro WP-0
- [ ] **Angular 22 — mudanças específicas** ainda não verificadas contra o guia oficial de atualização;
      registrar em `wp0-stynx-1-3-1-migration.md` §7 durante o WP-0 (added 2026-09-13)
- [ ] **Calendário de feriados 2026 (AM + Manaus)** das fixtures é referência de teste; validar com ato
      oficial antes de virar parâmetro (added 2026-09-13)
- [x] **Aceitar as ADRs de fronteira 0016…0020** (numeradas 0014…0018 até a fusão com `main`) — aceitas pelo Owner em 2026-09-13 (steering G.37)
- [x] **Pacote TEAT (2026-09-13)**: `teat-frontends.md`, `teat-route-contract.md`, `teat-error-catalog.md`,
      `teat-build-pack.md` (WP-T0…T6; 12 questões OD-T01…T12)
- [x] **Defeitos de base do TEAT** (WP-T0, 2026-09-13, branch `fix/wp-t0-base-defects`; ver `teat-build-pack.md` §WP-T0): prefixo de rota do gerador (`v1/inf/aitaits`), `AitModule` sem os
      comandos, entidades de auditoria do `ops`, política × rotas — corrigir antes de gerar clientes (added 2026-09-13)
- [ ] **Reconciliar `use-cases/INDEX.md` do TEAT** (status dos UCs e ausência do UC-TEAT-013) e a contagem
      de regras (49 × 50) em `APP.md` (added 2026-09-13)
- [x] **Pacote PORTAL (2026-09-13)**: `portal-frontends.md`, `portal-route-contract.md`, `portal-error-catalog.md`,
      `portal-build-pack.md` (WP-P0…P6; 13 questões OD-P01…P13)
- [ ] **Reconciliar `use-cases/INDEX.md` do PORTAL** (marca todos como `draft`; arquivos são `approved`/`reviewed`)
      e registrar uma RN dedicada ao ato de adesão ao SNE (UC-PORTAL-007 cita "backlog BPO/LEGAL") (added 2026-09-13)
- [x] **`portal-backend` R-0009 (2026-09-16, PR #54/#56)**: WP-P0…P3 — ADR-0024 (gov.br via Cognito);
      cinco pacotes `@detran/portal-{identity,requests,inbox,citizen-service,projections}` (DDL
      19/61…65/14/11); rotas `/v1/portal/*`, projeções (ADR-0020), SSE, política `portal:*`; contratos
      `BP-PORTAL-*.commands.openapi.json` (138 operações). OD-P02 e OD-P13 fechadas (ver
      `decision-closure-plan.md` §PORTAL); OD-P14…P46 abertas na implementação
      (`portal-build-pack.md` §4)
- [x] **Pacote BOAT (2026-09-13)**: `boat-frontends.md`, `boat-route-contract.md`, `boat-error-catalog.md`,
      `boat-build-pack.md` (WP-B0…B5; 13 questões OD-B01…B13)
- [x] **BOAT — reconciliar `policy.ts` (`est:crash-record:*`) com o corpus e criar UC-BOAT-013** (dever de
      resposta ao titular, tela W-05); atualizar `use-cases/INDEX.md` (R-0010 TASK-0001/0004; prazo e procedimento permanecem `source_pending`)
- [x] **BOAT R-0010 — WP-B0…B3 na parte comprovada** (PRs #55/#71; PC-0008):
      BP-EST-CRASH-001, DDL `70-est-crash.sql`, comandos, sincronização, mapeamento RENAEST
      provisório, projeções e contratos foram entregues; `T-BOAT-TRANSM` executa mensalmente com
      descoberta estreita autorizada de tenants e RLS. O Default D1 entregou relatório preliminar
      PDF/A-2b validado, sem alegar BAT oficial; não houve produção/homologação RENAEST real.
- [ ] **BOAT — DT-061/OD-B08**: obter os Manuais RENAEST e campos mínimos do BAT; até a carta institucional,
      `layout_version` e campos nacionais permanecem `source_pending` (R-0010 confirmou apenas o contrato do mock).
- [x] **Pacote DASHBOARD (2026-09-13)**: `dashboard-frontends.md`, `dashboard-route-contract.md`,
      `dashboard-error-catalog.md`, `dashboard-build-pack.md` (WP-D0…D5; 13 questões OD-D01…D13)
- [x] **DASHBOARD — papéis `dash-operator`/`dash-duty-owner`, política para alertas/deveres/exportação**
      (WP-D0, `R-0003`/`dash-roles`, concluída 2026-09-14; OD-D01) (added 2026-09-13)
- [ ] **DASHBOARD — promoção dos ids de tela D-01…D-18 ao corpus** (WP-D4, ainda aberta) (added 2026-09-13)
- [ ] **Portão de implementação (2026-09-13)**: `implementation-gate-2026-09-13.md` consolida os pontos de atenção das
      cinco superfícies e as 7 decisões que bloqueiam o início; fechar pelo Owner na ordem sugerida
- [x] **Plano de fechamento em três vias (2026-09-13)**: `decision-closure-plan.md`, `parameter-catalogue.md`,
      ADR-0021 (`ops.parameter`), 8 cédulas em `owner-ballots/`, carta-modelo; pesquisa da via A capturou 8 REFs
      (PN DETRAN-AM 001/2025 assinaturas; portarias LGPD 2026; CSAD; STJ Temas 1.293/1.294; ANPD; DETRAN-DF TTD;
      Lei 10.741; calendário 2026) e reconciliou as respostas DT-010…031 nos registros OD
- [x] **Owner respondeu as cédulas 01–08** em prompt interativo (steering §H.38–57, 2026-09-13)
- [ ] **Owner assina e envia os seis ofícios** de `owner-ballots/letters/` (DETRAN-AM gabinete, CETRAN-AM, CSAD/CPPD,
      SENATRAN, PGE-AM, Diretoria Técnica); registrar datas no `letters/README.md` (added 2026-09-13)
- [ ] **Propagar H.38–57 ao código**: papéis `dash-*`, atributo `decision_body`, `ops/agency`, seeds do catálogo com
      `status=vigente`, `teat.homologation.expired_behavior=warn`, retenção 5/5/10 (added 2026-09-13)
- [ ] **Repetir Wayback para o Decreto AM 34.398/2014** (`Regimento-Interno-Cetran.pdf`, 404 no site, 429 no
      archive.org em 2026-09-13) e capturar o Decreto Manaus 4.922/2020 (JARI do IMMU) como benchmark (added 2026-09-13)
- [x] **WP-A — parameter store compartilhado**: `BP-OPS-PARAMETER-001`, DDL
      `15-ops-parameter.sql`, seed gerado do catálogo e gate `verify:parameter-catalogue`
      concluídos por R-0004 / PR #37 (`PC-0002`, 2026-09-14) (ADR-0021) (added 2026-09-13)
- [ ] **WP-A — view de compatibilidade de `inf.normative_agency_parameter`** sobre
      `ops.parameter` permanece para a regeneração do módulo normativo; não integra R-0004
      (ADR-0021 Decisão 6) (added 2026-09-13)
- [x] **WP-T1/T2 — achados do WP-T0** (fechado em R-0008, 2026-09-15/16): `ops/*` (field, offline-sync,
      evidence, snapshots) ganharam módulo Nest com serviços injetáveis (CTG-0002/0003, PRs #48/#49);
      `MeasureLifecycleService`/`AlcoholLifecycleService` e seus comandos montados (CTG-0004, PR #50); as
      sete entidades da origem (item 6 de `teat-route-contract.md` §9) fechadas no WP-T1 (ver
      `teat-route-contract.md` §9 "Estado após R-0008"); `ops:evidence:complete-upload|validate` de volta
      com rotas (M11, CTG-0003 §4) (added 2026-09-13)
- [x] **WP-T2/WP-T3 do TEAT concluídos (R-0008, 2026-09-15/16)**: rotas e comandos de AIT, campo,
      sincronização, evidência, normativo, medidas, alcoolemia, SSE e integrações montados e testados
      (CTG-0001…0004, PRs #47…#50); contratos de comando WP-T3 (CTG-0005: nove `*.commands.openapi.json`,
      92 operações, três schemas e 16 schemas de evento, `check-commands.mjs`, `generate-clients.mjs`,
      `packages/api-clients`) entregues (TASK-0010/0012/0013), commit/PR #51 do maestro; ver
      `teat-build-pack.md` §2 WP-T2/WP-T3 "Executado" e `docs/meta/knowledge-base/open-decisions-rait.md`
      §F (OD-T13…T73) para o que ficou `source_pending` ou registrado como pergunta aberta
- [x] **Meta-orquestração definida (2026-09-14, ADR-0022)**: método em `docs/meta/agents/orchestra/`, escada de
      modelos, plano de ondas (14 frentes, R-0003…R-0016), templates de maestro/reviewer/worker, ponte
      `tools/orchestra/bridge.sh`; R-0003 (`dash-roles`) e R-0004 (`param-store`) concluídas
- [x] **Frente `dash-roles` (`R-0003`) concluída em 2026-09-14 pelo PR #32 e fechada como
      `PC-0001`**: WP-D0 executado
      (papéis, política `dashboard:*`, camadas N0…N3; merge
      `cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e`; ver backlog DASHBOARD acima e
      `dashboard-build-pack.md`)
- [x] **Onda 1 concluída**: R-0003 (`dash-roles`) fechada como `PC-0001` e R-0004
      (`param-store`) fechada como `PC-0002`, ambas mescladas em 2026-09-14 (added 2026-09-14)
- [ ] **Corrigir gates dos build packs** que citam comandos inexistentes (`orchestra/README.md` §9) antes da onda 2 (added 2026-09-14)
- [x] **Rodadas R-0005…R-0016 instanciadas (2026-09-14)**: `work/rounds/R-00nn/{plan.md,prompts/00-maestro.md}` para as
      doze frentes restantes de `waves.md` (ondas 2–7), com metas, tríades, critérios em comandos existentes, numeração
      real de DDL (ver `orchestra/README.md` §9) e ajuste do baseline do KB nas frentes que criam fichas de tela
- [x] **Onda 2 concluída**: `ops-agency` R-0005 fechada como `PC-0003` e `rait-model` R-0006 fechada como `PC-0004`
      (PR #39 CTG-0001, 2026-09-14; PR #43 CTG-0002, 2026-09-15); rotas, jobs e projeções do RAIT seguem para R-0007 / WP-P;
      a partir da onda 3, abrir a próxima frente de uma família quando a anterior daquela família mesclar (added 2026-09-14)
- [x] **WP-T2 + WP-T3 teat-backend (R-0008)**: comandos manuscritos de AIT, bootstrap/turno/handoff, numeração e sincronização, evidência, snapshots, normativo, medidas, alcoolemia, velocidade, SSE e integrações (CTG-0001…0004, PRs #47–#50, 2026-09-15/16), contratos de comando + gate + clientes tipados + schemas + docs (CTG-0005, PR #51) e fechamento `PC-0005` em 2026-09-16; OD-T13…OD-T73 em `open-decisions-rait.md` §F; status HTTP divergentes (OD-T70/T71), enum do recibo (OD-T72), `integration.item.changed` (OD-T73) e `BP-INF-SPEED-001.commands` (OD-T66) roteados a rodadas futuras.
- [x] **R-0010 `boat-backend` fechada como `PC-0008`** (PR #55 CTG-0001, 2026-09-16; PR #71 WP-B2/WP-B3, 2026-09-20; PR #72
      fechamento): política `est:*`, `UC-BOAT-013`, `BP-EST-CRASH-001` (DDL 70), comandos, fila, RENAEST, job mensal aprovado pelo Owner
- [x] **R-0014 `portal-pwa` fechada como `PC-0007`** (PRs #60…#67, 2026-09-17/19): primeiro app do repositório (`apps/portal/web`,
      padrão de scaffold), allowlist de namespaces i18n (OD-P46), 27 fichas, PWA, WP-P6 no mock; workers/reviewer Codex por
      autorização do Owner (B3); handoffs OD-P15/16/17/19/88 e delegações reais para R-0007
- [x] **R-0007 `rait-backend` fechada (2026-09-22)**: CTG-0001 (`DetranError`, case) e CTG-0002 (worklist/sessão) entraram em
      `main` pelo PR #69; CTG-0003 fechou comandos, consumidores e timers da infração; CTG-0004 fechou organização,
      arrecadação, integrações, SSE, sete contratos canônicos e clientes gerados. A adoção DEVAI/evidência local foi integrada
      antes do fechamento; os consumidores R-0011/R-0012 podem usar as superfícies publicadas.
- [x] **R-0013 `teat-frontends` fechada como `PC-0013` (2026-09-24)**: CTG-0001/PR #70,
      CTG-0002/PR #73 (incluindo 126 fichas, i18n e transições), CTG-0003/PR #82 e
      CTG-0004a/b/5/PR #113 (merge `646c6c28`) estão em `main`. Os seis REDs AIT foram
      resolvidos na trilha explícita de **homologação de UI e workflows** definida pelo Owner
      e ADR-0033, com negativos produtivos preservados, review independente PASS e sete
      checks CI verdes. A observação do merge é `EV-33ead2fd8120f724`; o fechamento não
      representa app de campo nem implantação. Produção mobile requer round próprio posterior
      (R-0017 apenas candidato), nas issues
      [#108](https://github.com/aarusso-nyx/detran/issues/108),
      [#109](https://github.com/aarusso-nyx/detran/issues/109),
      [#110](https://github.com/aarusso-nyx/detran/issues/110),
      [#111](https://github.com/aarusso-nyx/detran/issues/111) e
      [#112](https://github.com/aarusso-nyx/detran/issues/112). GMS820 permanece
      homologado como equipamento; integração do app nele não foi provada.
- [x] **R-0011 `dashboard-backend` fechada como `PC-0009`** (2026-09-22; Fable, troca Sol → Fable, Owner 2026-09-21): CTG-0001
      (`BP-DASH-MONITOR-001`, projeções, seeds, gate `verify:domain-boundaries`, PR #83) e CTG-0002 (ciclo do alerta, deveres,
      frescor, exportação, SSE, contratos, PR #87); fechamento PR #88; handoffs OD-D17/D33/D35/D50/D58 no PR #101 (issues #96…#100)
- [x] **R-0015 `boat-mobile` fechada como `PC-0014` (Sol/Codex)**: CTG-0001 (17 fichas, i18n e
      transições) entrou em `main` pelo PR #107; CTG-0002 entregou `@detran/boat-mobile`, as 12
      boundaries BOAT do TEAT mobile e as cinco páginas `sinistros` do TEAT web pelo PR #116,
      merge `50626da5` e observação `EV-3f6a7b6febe2d92a` (updated 2026-09-24)
- [x] **Estado da campanha em 2026-09-24**: 14 de 14 rodadas fechadas (R-0003…R-0016).
      Depois dessas rodadas, a onda de integração real (SSE,
      impressora, provisionamento em dispositivo, homologação RENAEST/SNE/gov.br) e os handoffs
      OD-R12-_, OD-D_, OD-P15/16/17 seguem em `§Handoffs` (updated 2026-09-22)
- [x] **R-0012 `rait-web` fechada como `PC-0010`** (2026-09-22; Fable): CTG-0001 (63 fichas IU-RAIT-002…064 e manifesto de rotas,
      PR #79), CTG-0002a (núcleo: 74 rotas, guardas, shell, SSE, error boundary, i18n + allowlist `rait.*`, PR #81), CTG-0002b-1
      (8 clientes, 11 facades, 26 componentes, PR #85), CTG-0002b-2 (50 páginas, rotas por módulo, matriz ação × papel, PR #90),
      CTG-0002c (16 schemas de formulário, gates de transição, regras ESLint locais, docs de fechamento, PR #92); fechamento PR #93,
      observação PR #95. Ficou fora, com `todo` citando R-0007 CTG-0004 (agora em `main`): comandos reais `POST …/commands/*`,
      `caseAccessGuard` real, endpoint SSE; L0 de organização/escala e jeton, integrações, financeiro, admin, auditoria/exportações;
      `e2e/` Playwright não criado. OD-R12-001…054 em `open-decisions-rait.md` §G
- [ ] **RAIT-WEB OD-R12-005 — `caseAccessGuard` real**: endpoint de verificação de acesso ao caso (pool/unidade/circunscrição) não existe; guarda retorna `true`; dono Architect (R-0007 CTG-0004); fonte `contracts/CTG-0002a.md` §12.
- [ ] **RAIT-WEB OD-R12-007 — tolerância de heartbeat do SSE**: `HEARTBEAT_STALE_FACTOR = 2` (40 s) sem fonte no contrato §3; dono Architect (R-0007); fonte `contracts/CTG-0002a.md` §12.
- [ ] **RAIT-WEB OD-R12-018 — listas sem query/envelope**: os 49 `list*` de `BP-INF-RAIT-*` não aceitam `?q=&ordem=&filtro=&pagina=` nem devolvem `{items,total,page,pageSize}`; estreitamento/paginação hoje no cliente; dono Architect (R-0007; ADR-0009); fonte `contracts/CTG-0002b.md` §9.3.
- [ ] **RAIT-WEB OD-R12-022 — dias restantes ausentes**: `RaitClock`/`RaitDeadline` não trazem `days_remaining`; UI só mostra o que o servidor envia; dono Architect (R-0007); fonte `contracts/CTG-0002b.md` §9.3.
- [ ] **RAIT-WEB OD-R12-023 — storage de documentos sem URL assinada**: `DossierViewer`/`DocumentUploader` sem contrato de upload/download; dono Architect (R-0007; ADR-0018 Decisão 1); fonte `contracts/CTG-0002b.md` §9.3.
- [ ] **RAIT-WEB OD-R12-031 — resumo do turno sem endpoint agregado**: painel usa contagens de listas (cap 500) em vez de `GET /v1/inf/rait/dashboard/shift`; dono Architect (R-0007); fonte `contracts/CTG-0002b.md` §9.3.
- [ ] **RAIT-WEB OD-R12-035 — `RaitMinutes.content` sem schema**: ata não renderiza o conteúdo, só metadados/hash; dono Architect (R-0007); fonte `contracts/CTG-0002b.md` §9.3.
- [ ] **RAIT-WEB OD-R12-037 — vocabulário do canal de intake**: `intake_channel` é string livre no DTO; UI usa `RAIT_COMMUNICATION_CHANNELS`; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-038/041 — campos sem transporte no DTO**: resolução placa+AIT→`ait_id` e `applicant.address` ficam no schema sem envio; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-043 — assinatura PAdES indisponível**: `context.signatureAvailable=false` até o kernel de assinatura existir; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-046 — campos sem transporte (`manualExclusions`, `caseIds`)**: no schema, sem envio; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-048/050 — escala e exportação sem contrato de forma**: `ESCALA_GATE` com `postState: null`; `RaitExport.scope` com forma proposta; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-052 — sem comando para iniciar triagem**: `PROTOCOLADO → TRIAGEM_ADMISSIBILIDADE` sem M8; dono Architect (R-0007); fonte `contracts/CTG-0002c.md` §9.2.
- [ ] **RAIT-WEB OD-R12-054 — facades sem pool/joins/query por órgão**: `QueueFacade`/`SessionFacade` sem `defesa_previa`, joins de relógios/casos e `load*(orgao)`; `claimNext` sem `pool_id`; ratificado como default até R-0007 CTG-0004; dono Architect (R-0007); fonte `reports/TASK-0015.md`; `plan.md` A14.
- [x] **WP-T1 ops-agency (R-0005)**: agência, modelos ops, deltas inf e fixtures entregues nos CTG-0001/0002 (PRs #40/#41, 2026-09-14), CTG-0003 (PR #42), documentação final (PR #44) e fechamento `PC-0003` em 2026-09-15; `shift.status`, demais vocabulários source-pending e provisioning (R-0013/WP-T5) permanecem roteados a WP-T2+.
- [x] **R-0015 `boat-mobile` — CTG-0001 e CTG-0002 integrados (2026-09-24)**: TASK-0009 comprovou a biblioteca `@detran/boat-mobile` e sua carga pelo shell TEAT; TASK-0010 comprovou o módulo web `sinistros` e os 14 schemas/15 gates; TASK-0008 revisou rotas, segurança e a11y focal. PR #116 verde e integrado como `50626da5`. Permanecem fora: hardware real, release de campo e homologação real RENAEST/SNE/gov.br. Handoffs explícitos: `OD-R15-003` (W-05), `OD-R15-004` (13 marcadores `source_pending`), `OD-R15-005` (uxCode/S-12) e `OD-R15-006` (consumidores de portas nativas por tela).
- [ ] **PORTAL OD-P15 — gov.br real**: credenciais e retorno institucional; dono Architect-backend/Owner; fonte `plan.md` A14 e CTG-0004 §10.
- [ ] **PORTAL OD-P16 — SNE real**: homologar `SnePort` além do mock; dono Architect-backend; fonte `plan.md` A14 e CTG-0004 §10.
- [ ] **PORTAL OD-P17 — privacy**: montar `@stynx-nyx/privacy`; dono Architect-backend/Owner; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P19 — junta médica**: produtor PEC/BOAT e comando; dono PEC/BOAT; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P61 — enum legal SNE**: reconciliar enum do fio e textos legais; dono Owner/LEGAL + Architect-backend; fonte `plan.md` A24.
- [ ] **PORTAL OD-P88 — VAPID**: fonte auditável de `applicationServerKey`; dono Architect + maestro; fonte CTG-0003c §10.
- [ ] **PORTAL OD-P102 — ErrorBoundary**: acompanhar unificação futura, sem regra duplicada; dono Architect; fonte `plan.md` A12(a).
- [ ] **PORTAL OD-P103 — CNH B**: rótulo cidadão de BLOQUEADA; dono Owner + Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P104 — quitação**: fonte de restrições, suspensão e `canIssue`; dono Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P105 — CRLV-e**: porta, bytes, QR e emissão; dono Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P106 — cancelamento SNE**: operação cidadã no adapter; dono Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P107 — adapter → PORTAL**: mapa completo de erros; dono Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL OD-P108 — DELETE push**: rota canônica; dono Architect-backend; fonte CTG-0004 §10.
- [ ] **PORTAL B1 — Lighthouse CI**: somente ferramenta offline/instalável; até lá `axe` por rota; dono maestro; fonte `plan.md` B1/M3.
- [ ] **PORTAL A12(j) — elevação**: manter contrato sem degrau `access`, banner de qualificada e heurística C-3c-78; dono Architect/transcriber; fonte `contracts/CTG-0003c.md` §3.8, §8.
- [ ] **DASHBOARD OD-D16-001 — rota de leitura das exportações**: D-17 sem `GET exports` no contrato de rotas §4 nem chave `dashboard:export:read` em `policy.ts`; provisório executado `dashboard:audit-trail:read` (N1); dono Architect / R-0011; fonte `contracts/CTG-0001.md` §5, `route-manifest.md` §F.
- [ ] **DASHBOARD OD-D16-002 — leitura própria dos radares e de P-09**: D-03/D-04/D-05 (radares) e D-13 (P-09) leem projeções (`prescription_risk`, `pec_deadlines`, `teat_measures`, `crashes`) sem rota `GET` própria no contrato §4 nem chave de leitura própria; provisório `dashboard:alert:read` (radares) e `dashboard:comparison:read` (D-13); dono Architect / R-0011; fonte `contracts/CTG-0001.md` §5, `route-manifest.md` §F.
- [ ] **DASHBOARD OD-D16-003 — `dashboard-frontends.md` §3 × `policy.ts`**: agency-admin sem `source:read` (P-04), bi-analyst sem `transparency-audit:read` (P-08), technical-admin com `alert:read` (P-01…P-03); vale `policy.ts` (adotado); dono Architect; fonte `contracts/CTG-0001.md` §5.
- [ ] **DASHBOARD OD-D16-004 — contrato de rotas × `policy.ts`**: `GET sources`, `GET kpis`, `GET transparency/checklist`, `GET alerts/{id}/incident`, `POST exports` com papéis divergentes entre `dashboard-route-contract.md` §2–§4 e `policy.ts`; vale `policy.ts` (adotado); dono Architect; fonte `contracts/CTG-0001.md` §5.
- [ ] **DASHBOARD OD-D16-005 — passe global × camadas do DASHBOARD**: `GLOBAL_ADMIN_ROLES` (ADMIN, GESTOR_DETRAN, SUPORTE, technical-admin) alcança `dashboard:*` por `isDetranActionAllowed`, abrindo rotas contra [RN-DASH-170] verificação 3 (technical-admin em D-10/D-13/D-17/D-18; ADMIN/SUPORTE em D-12/D-13/D-15/D-18); decidir se o DASHBOARD deve ser excluído do atalho de administrador global; dono Owner / Engineer-backend; fonte `contracts/CTG-0001.md` §5, `route-manifest.md` §E/§F.
- [ ] **DASHBOARD OD-D16-006 — origem da camada do usuário no app**: `@detran/shared` só exporta `.` (arrasta `@nestjs/*`); decidir entre subpath export `@detran/shared/policy` ou `GET /v1/dashboard/me`; provisório executado: `core/layer-table.ts` transcreve `DASHBOARD_LAYER_BY_ROLE` literalmente, provado por transcrição independente do Inspector; dono Architect / Engineer-backend; fonte `contracts/CTG-0002.md` §Decisões 4, §14.1.
- [ ] **DASHBOARD OD-D16-007 — rótulos dos relógios A e D**: nenhuma fonte da lista fechada nomeia os relógios `a`/`d` (só `b`="24 meses" e `c`="paralisação" em [JRN-DASH-002]); dono Architect (lê [RN-DASH-131]); fonte `contracts/CTG-0001.md` §5.
- [ ] **DASHBOARD OD-D16-008 — tokens das 6 finalidades N2**: `dashboard.purposes_n2` (OD-D08/H.54) só tem nomes, não tokens; provisório executado `supervisao`, `auditoria`, `apuracao`, `resposta_ao_titular`, `estatistica`, `suporte`; dono Architect / R-0011 (seed); fonte `contracts/CTG-0001.md` §5.
- [ ] **DASHBOARD OD-D16-009 — vocabulário de formas do `SeverityChip`**: nenhuma fonte fixa a forma por nível de severidade; provisório executado (`contracts/CTG-0002.md` §Decisões 2): círculo/quadrado/triângulo/losango/octógono; as 5 chaves `dashboard.severity.shape.*` ficam ausentes da semente até fechar; dono Owner (UX); fonte `contracts/CTG-0001.md` §5, `contracts/CTG-0002.md` §Decisões 2.
- [ ] **DASHBOARD OD-D16-010 — rotas `GET` de relatórios gerados**: D-16 lista e acompanha `generated-reports`, mas o contrato de rotas §4 só documenta `POST generated-reports` e `POST …/complete|fail`; faltam `GET generated-reports` e `GET generated-reports/{id}`; dono Architect / R-0011; fonte `reports/TASK-0002.md`, `contracts/CTG-0001.md` §5.
- [ ] **DASHBOARD OD-D16-011 — evidência do `prove` do dever (D-09)**: `dashboard-frontends.md` §7 pedia "evidência completa" e o contrato de rotas fixava `hash` sem opcional, contra [UC-DASH-003] AC-DASH-003-1 (protocolo, captura **ou** hash); `dashboard-frontends.md` §7 corrigida por esta tarefa (R-0016) e já aplicada em `contracts/CTG-0002.md` §Decisões 3/§11; falta alinhar o contrato de rotas de R-0011; dono R-0011; fonte `contracts/CTG-0001.md` §5, `contracts/CTG-0002.md` §Decisões 3.
- [ ] **DASHBOARD OD-D16-012 — chaves i18n que o produto pede e a semente (307) não tem**: rótulos da anatomia mínima do `AlertCard`, cabeçalhos do `SourceStatusTable`, nomes dos 5 KPIs (D-18), dimensões do `DistributionChart`, status do relatório (D-16), botão "aprovar exportação" (D-17), `dashboard.states.offline`/`not_found`, rótulos dos dois conjuntos de deveres (D-08/D-14); proposta: acrescentar em `dashboard.common`/`dashboard.states` por adenda do Architect (namespaces já allowlistados, OD-P46); dono Architect + Owner (textos); fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-013 — protocolo do stream além do contrato §5**: prefixo do `event:` (`dashboard.` opcional), forma de `data` por tipo, presença de `aggregate.version`, heartbeat/backoff reaproveitados de R-0012 (OD-R12-007); dono Architect de R-0011 (`BP-DASH-MONITOR-001` / contrato §5); fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-014 — menu por camada × `DetranNavItem` sem grupo**: `packages/ui` não agrupa itens de navegação; provisório executado: o shell passa `navigation: []` ao kit e renderiza a navegação agrupada no slot `[detran-sidenav-footer]`; proposta: ADR curta acrescentando `group?` a `DetranNavItem`; dono Architect + Owner; fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-015 — `*stynxHasPermission` × passe global `'*'`/`'<recurso>:*'`**: semântica do wildcard na diretiva do kit não verificada na lista fechada; troca pré-autorizada para `*dashCan` (`core/can.directive.ts`) já aplicada por TASK-0005; dono Architect (conferir `@stynx-nyx/angular-auth`); fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-016 — ordem dos interceptors HTTP**: `provideHttpClient(withInterceptors([freshnessInterceptor]))` × os interceptors de `provideDetranAuthenticatedApp`/`provideStynxDefaults` — coexistência não verificada na lista fechada; provisório executado: mesma posição do Portal; dono Engineer-frontend / Architect; fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-017 — formatos de campos de view-model `source_pending`**: `remaining`, `acceptableLatency`, `threshold`, rótulo das linhas da tabela-mestra sem IND, `candidateDeadline` (D-04) sem forma fixada; provisório executado: string exibida como token em `<code>`, nunca calculada; dono R-0011 (`BP-DASH-MONITOR-001`); fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-018 — campo `parent` em `DashboardRouteEntry`**: necessário para manter as filhas de detalhe (D-14/D-16) dentro do manifesto sem estourar a contagem de 18 fichas; ratificado pelo maestro (precedente `level`, R-0012 `CTG-0002a.md` §2); sem ação pendente além do registro; dono Architect (ratificado); fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD OD-D16-019 — fichas × semente i18n, `intro`/`empty` divergentes**: `dashboard.screens.<slug_>.intro`/`.empty` divergem em 34 dos 36 textos entre as 18 fichas §12 e a semente (títulos iguais 18/18) porque TASK-0002 (fichas) e TASK-0003 (i18n) transcreveram em paralelo a partir do mesmo contrato; a semente prevalece no app (M5); falta alinhar as fichas ao texto da semente (ou o Owner escolhe o texto e a semente é corrigida por adenda); dono Architect (transcr.) / Owner; fonte `contracts/CTG-0002.md` §14.1.
- [ ] **DASHBOARD frente — subida do console de L0 a L2**: `apps/dashboard/web` foi entregue em nível L0 nesta rodada (R-0016, PR #103); a subida a L2 exige facades e `<feature>.client.ts` sobre os clientes gerados de `BP-DASH-MONITOR-001` (upstream já em `main`, R-0011 CTG-0002 mesclado durante esta rodada, PC-0009), dados reais nas 18 telas e teste de supressão secundária ponta a ponta (D-13); dono Architect / próxima rodada; fonte `plan.md` A5, `dashboard-build-pack.md` §WP-D5.
- [x] **R-0017 `local-stack` — ação 4 fechada (PC-0017), selo corretivo PC-0018**: stack local com quatro frontends, mock SEFAZ de seis rotas, adapters CH explicitamente off, runbook e job manual `workflow_dispatch`; denúncia sintética determinística somente em `detran_local_stack`. CTG-0001/0002/0003 mesclados nos PRs #133, #143 e #144, com CI e reviews verdes; ODs OD-R17-001…004 preservadas. PC-0018 supersede PC-0017 sob OD-R17-005 e sela R-0017 sem apagar as quatro falhas históricas. Fora do escopo: integrações reais e PEC.
- [ ] **R-0017 `local-stack` — reparar `serve.buildTarget` do RAIT**: `apps/rait/web/angular.json` ainda referencia `portal-web:build:production` e `portal-web:build:development`; CTG-0001 aplicou o workaround no tooling, mas o app permanece incorreto. Dono Architect / Engineer-frontend, em rodada futura a planejar; fonte `plan.md` §RAIT serve.
- [ ] **R-0017 `local-stack` — ADR própria para `packages/sefaz-adapter`**: a ADR própria do adaptador ainda está ausente; o risco foi registrado como fora do escopo de R-0017. Dono Architect, em rodada futura a planejar; fonte `plan.md` §Riscos.
- [x] **R-0018 `index-state` — CTG-0001, CTG-0002 e CTG-0003 integrados (2026-09-26)**: numeração de ADRs racionalizada (ADR-0035…0038, redirecionamentos, §Aliases) e gate `verify:state-index`; índices de estado (build packs, `waves.md`, `docs/start/index.md`, `BUILD-PLAN.md`, `work/rounds/README.md`) sincronizados com os closures; relatórios de worker versionados; `model-ladder.md` com Sol 6 / Opus 5.5; 52 READMEs novos e 12 atualizados. Todas as ODs de R-0018 decididas pelo Owner em 2026-09-27 (OD-R18-001 opção b, OD-R18-002, OD-R18-003, OD-R18-004 e OD-R18-005).
- [x] **OD-R18-005 — `backend/database/ddl/README.md` desatualizado**: resolvido no CTG-0004 de R-0018 (pós-fechamento, `plan.md` M9) depois do merge de R-0017 (#133): o README lista os 66 `*.sql` na ordem de `apply.sh`; `tools/README.md` recontado (42 scripts) e com a stack local; fontes `work/rounds/R-0018/contracts/CTG-0003.md` §4 e `CTG-0004.md` §1-§2.
- [x] **R-0019 `law-corpus` — fechada (PC-0016)**: CTG-0001 integrado pelo PR #132 (`968f0729`); CTG-0002 recebeu aceite explícito do Owner e foi integrado pelo PR #137 (`2804b079`); CTG-0003 integrou os índices pelo PR #139 (`673934fc`). Os três grupos passaram por review cross-family, gates locais, CI e observação DEVAI no SHA exato. OD-R19-001…006 continuam registradas para decisões futuras; R-0020 fará o selo da rodada.
