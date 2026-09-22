# R-0007 — frente `rait-backend` (WP-B + WP-C do RAIT: rotas de comando, motor de prazos, SSE e contratos de comando)

> CTG-0003/CTG-0004 — CONCLUÍDAS (2026-09-22): TASK-0009…0018
> materializaram os contratos, sensores, runtime, wiring oficial, SSE, sete
> contratos de comando e clientes. O inventário canônico verifica 256 operações;
> módulos focados, política, decorators, boundary, geração e gates integrais
> passaram no banco descartável autorizado `detran_r7_ctg1_a2`. Os registros
> individuais estão em `reports/TASK-0009.md`…`TASK-0018.md`. A integração
> permanece PR-only; nenhum bypass de gate é inferido por este registro.

> SYNC/READINESS CTG-0003/0004 (2026-09-19): o checkpoint aprovado de
> CTG-0001/0002 (`a72f6ce9`) foi preservado em
> `codex/r0007-ctg2-pass-20260919` e integrado localmente ao `origin/main`
> `b0df484d` pelos merges `ad243346` e `660e9e80`. `pnpm check` passou;
> backend unit/integration passou; app E2E passou 355/355 (2 todo); o sensor
> de upgrade reconciliado ao inventário atual passou 18/18; cadeia DEVAI,
> formatação e publicação documental passaram. Relatório completo em
> `reports/R-0007-SYNC-READINESS-CTG3-CTG4.md`. A worktree está pronta para
> iniciar **CTG-0003/TASK-0009**. CTG-0004 está preparada, mas preserva a
> dependência serial: TASK-0013 só é elegível após TASK-0012 concluir CTG-0003.
> Nenhum push, PR, merge em `main` ou despacho de worker foi inferido.

> CTG-0002 — CONCLUÍDA (2026-09-19): os 20 comandos,
> decisão OWNER de signatários (presidente + relatores dos itens, com ausência
> formal registrada), confiança fail-closed, blueprints, upgrade e composição
> E2E estão implementados. O primeiro gate TASK-0078 preservou FAIL com quatro
> highs e seis lows. A fatia autorizada TASK-0079 fechou os quatro highs com
> sensor estrutural em banco real 2/2; `pnpm backend:test:ci` passou em uma
> invocação integral, app E2E 125/125, upgrade 18/18, e `pnpm check` passou.
> TASK-0080 retornou REVIEW com dois resíduos high de ETag. TASK-0081 fechou
> ambos com sensor real 4/4; o runner integral passou novamente com app E2E
> 127/127 e upgrade 18/18, e `pnpm check` passou. TASK-0082 é o gate read-only
> Fable 5 sobre o terceiro candidato congelado retornou PASS válido, zero high
> e oito lows não estruturais, hash
> `066672b53ad41071a56c40b29091a24a24c0deea2cf81fe467395d36dcdfb963`.
> CTG-0002 está concluída e CTG-0003/TASK-0009 é a próxima cadeia elegível.
> Evidência DEVAI genérica sequência 36 registrada; cadeia válida no head
> `2a8c89c9e31aa9c05441f0248d58b8b524aa45e469475dfed914d95072b45dcb`.
> Nenhum commit, PR ou merge é inferido.

> TASK-0052 (2026-09-18): Architect concluiu contrato da ata de distribuição
> do lote, com manifestação imutável vinculada a snapshot/hash/documento e
> operação de confiança PAdES-B-LT/TSA/OCSP-CRL própria. Contrato e matriz
> passaram Prettier/`contracts:check`; sem blueprint/SQL/runtime alterados.
> Próxima etapa é Inspector testar contrato/schema/adapter/negativas antes de
> implementação. O serviço documental externo não está configurado nesta
> sessão; isso não autoriza validação positiva fictícia em produção. Nenhum
> approve-batch ou CTG-0002 GREEN é declarado.

> CTG-0002 CORRETIVO — CHECKPOINT WORKLIST (2026-09-18): TASK-0044
> concluiu matriz de 20 comandos/4 colisões CRUD. TASK-0045 2/2 e reparo
> TASK-0051 1/1 congelaram sensores; TASK-0046 1/2 levou unit worklist
> 57/57 e política 34/34 a GREEN, sem alterar hashes, mas **não** concluiu
> os seis comandos de produção. `approve-batch` está bloqueado: payload
> `signedMinutesRef` opaco não vincula a ata ao UUID/hash/snapshot/assinante;
> verificador compartilhado atual só valida `DECISAO_DEFESA`. Architect
> read-only confirmou necessidade de contrato de ata de distribuição e
> fronteira de confiança PAdES/TSA específica antes de homologar. Nenhuma
> prova falsa será aceita. O worker relatou 4/34 na integração completa por
> ambiente; Maestro reexecutou com URLs explícitas e obteve **34/34 PASS**
> no mesmo DB dedicado. Esse PASS de integração não resolve o gap de produção
> nem libera TASK-0008. TASK-0006 2/2 e TASK-0007 1/2 intactas.

> OWNER AUTORIZOU NOVO CICLO CORRETIVO CTG-0002 (2026-09-18): testar e
> implementar os 16 comandos restantes antes de retomar TASK-0008, sem
> zerar TASK-0006 2/2 ou TASK-0007 1/2. Sequência e limites em
> `reports/CTG-0002-CORRECTIVE-PLAN.md`: TASK-0044 Architect de propriedade
> de rotas; três fatias Inspector→Engineer TASK-0045…0050; TASK-0008 somente
> após a lógica e os sensores, para restringir CRUD gerado, conectar hooks,
> regenerar e provar HTTP. Quatro rotas POST geradas colidem com comandos de
> criação; a política atual também tem chaves de recurso/ação divergentes.
> Não há GREEN da CTG-0002, PR ou merge neste checkpoint.

> CTG-0002 CHECKPOINT (2026-09-17 local / 2026-09-18 UTC): TASK-0005 1/2
> concluiu o contrato. TASK-0006 2/2 produziu RED executável e política;
> registro `completed_incomplete` porque os sensores cobrem apenas parte da
> superfície contratada. TASK-0007 1/2 passou os sensores congelados (shared
> 170/170, worklist unit 6/6 e integração 31/31, session unit 5/5 e integração
> 9/9, decorators 857), mas implementou apenas draw/reassign/open/publish.
> A própria entrega do Engineer reconhece falta de escala, aceite/impedimento,
> pauta, voto, vista, assinatura e outros comandos de CTG-0002. GREEN desses
> sensores não é GREEN integral do contrato; TASK-0008 não é elegível.
> A TASK-0006 esgotou 2/2; antes de ampliar sensores ou redispatchar Engineer,
> requer autorização OWNER para um ciclo corretivo delimitado, com limites e
> aceite nominais. CTG-0003/0004 dependem de CTG-0002 e seguem enfileiradas.

> TASK-0022 4/4 CONCLUÍDA (2026-09-17 local / 2026-09-18 UTC): fluxo
> `backend:test:ci` reordenado para executar testes ordinários antes do upgrade
> destrutivo obrigatório final. GREEN: E2E RAIT 110/110, INF-AIT 1/1,
> upgrade 18/18, `pnpm check`, doctor, cadeia e `git diff --check` PASS.
> Base descartável restaurada fresh (um caso), scratch ausente. Revisão
> independente pós-GREEN Fable 5 válida PASS, zero high, candidato
> `2bbb7b82171b97c72803a8eadc934850b6c4966ca76263a0ce05833fcb29435c`;
> dois achados low não estruturais. Evidência em
> `reports/TASK-0022-FINAL-CI-GREEN.md` e
> `reviews/attempt-2/ctg-0001-final-delivery.{manifest,bridge,json}`.
> TASK-0005 de CTG-0002 é a próxima elegível. CTG-0002–0004 ainda estão
> enfileiradas; nenhum commit, PR ou merge é declarado. Este checkpoint
> substitui somente o estado operacional mais antigo de TASK-0022 abaixo.

> CICLO FINAL TASK-0022/0042/0043 — CHECKPOINT (2026-09-17): revisão
> independente válida PASS do SQL e dos deltas de import, harness e catálogo;
> upgrade dirigido no banco descartável `detran_r7_ctg1_a2` **18/18 PASS**,
> incluindo rollback, concorrência, preservação de legado, reaplicação e
> equivalência fresh/upgrade. `pnpm check`, `pnpm devai:doctor` e cadeia de
> evidências PASS. `pnpm backend:test:ci` **não PASS**: ao executar a integração
> completa, o teste isolado de upgrade restaura a base fresh com um caso; dois
> arquivos posteriores ainda presumem fixtures legadas e terminam com 8 RED
> por pré-condição de dados (39/47 PASS no pacote RAIT). A ordem/isolamento da
> suíte precisa de decisão e correção própria; nenhuma nova rodada corretiva,
> revisão de entrega, commit, PR ou merge foi presumida neste ciclo final.

> CICLO FINAL TASK-0042/0043 (2026-09-17): Inspector 0042 1/1 escreveu
> fixture histórica versionada de DDL05/34/35 e seed05/20 com SHA,
> preparador fail-closed e integração no sensor de upgrade. Static/typecheck
> PASS; nenhum DB apply. TASK-0042 checkpoint até revisão/DB. Architect
> 0043 1/1 recebe somente SQL manual pre/verify para reconciliar delta do
> DDL histórico, com STOP se exigisse backfill factual. Novos bytes SQL e
> harness exigem review independente antes de qualquer DB apply; review
> intermediário anterior não será repetido.

> OWNER autorizou scratch DB `detran_r7_ctg1_a2_seed_profiles` e correção
> delimitada do preparo legado (2026-09-17). Diagnóstico Inspector read-only:
> baseline historicamente fiel exige snapshots versionados de DDL05/34/35 e
> seed05/20 anteriores ao candidato; os DDLs ordinários atuais já contêm
> tabelas/colunas de prioridade, logo não provam esse upgrade. Há delta
> estrutural em relações legadas que `19-rait-priority-pre.sql` ainda não
> reconcilia; `CREATE TABLE IF NOT EXISTS` não altera constraints existentes.
> O seed05 legado também exige reconciliação explícita do parâmetro antes do
> snapshot, nunca seed global silencioso. Nenhum banco foi criado/resetado
> nesta análise. Ajuste de SQL/manual é material e requer escopo Architect e
> nova revisão dos bytes alterados antes de apply; não foi presumido pela
> autorização de fixture nem pelo waiver de review intermediário.

> TASK-0022 3/4 CHECKPOINT BLOCKED (2026-09-17): `pnpm check` integral
> PASS; duas gerações oficiais mantêm digest dos 1.126 outputs
> `0a220440fe2a2d207fb3d9855a08bc8403bb80aa4bd381bd18939e9c346e9560`;
> checks de blueprint/contrato, quatro verificadores, doctor/chain PASS.
> `backend:test:ci` não PASS: upgrade dirigido 14/18, primeira falha no
> preparo `rait-priority-upgrade.integration.spec.ts:703` porque trigger
> enforce já impede UPDATE direto de prioridade legada; três cascatas,
> `--full` não alcançado. Seed-profiles requer criar/apagar DB separado
> `detran_r7_ctg1_a2_seed_profiles`, fora da autorização existente.
> Nenhum review intermediário repetido, nenhuma alteração de trigger/SQL
> para mascarar o sensor. Exige decisão OWNER sobre scratch DB e ciclo
> corretivo de baseline legado antes de TASK-0022 4/4.

> OWNER-AUTORIZADO TASK-0022 GATE CORRECTION (2026-09-17): sem alterar
> reviews históricos, `.prettierignore` enumera exatamente 18 artefatos
> capturados; TASK-0034/35 JSON formatados. `pnpm format:check` integral
> PASS. Inspector TASK-0041 corrigiu somente a expectativa C3 de DI para
> cinco deps (inclui Clock); C3 6/6, C4 DI 1/1, unit pacote 152/152,
> typecheck/formato PASS. TASK-0022 3/4 pode reexecutar gates amplos;
> nenhum review intermediário repetido.

> TASK-0022 2/4 CHECKPOINT BLOCKED (2026-09-17): após Inspector GREEN,
> Architect Sol/Medium executou geração oficial duas vezes; 1.126 derivados
> mantiveram digest agregado `0a220440fe2a2d207fb3d9855a08bc8403bb80aa4bd381bd18939e9c346e9560`.
> Blueprints/contracts, 4 verificadores estáticos, typecheck, doctor/chain,
> RLS 3/3, integração 2/2 e E2E 98/98 passaram. `pnpm check` falha no
> Prettier de 20 artefatos históricos/preexistentes fora da allowlist;
> `pnpm backend:test:ci` falha em um sensor C3 de DI desatualizado
> (`rait-case-delivery-c3.spec.ts:20`, 4 versus 5 dependências). Nenhum
> PASS integral ou delivery-review. Preservar raw review bytes até solução
> governada; não alterar sensor pela função Architect.

> INSPECTOR 13/13 OBSERVOU GREEN (2026-09-17): mesmo candidato,
> hashes E2E/fixture/interceptor e demais sensores intactos; unit
> interceptor 3/3, app typecheck, formato e E2E 98/98 PASS com app role
> não-super/sem BYPASSRLS. TASK-0020 e TASK-0021 concluídas; TASK-0022
> elegível. Sem repetição de review intermediário; delivery-review posterior
> permanece obrigatória.

> ENGINEER 7/7 (2026-09-17): somente interceptor transacional alterado
> (`protocol` agora tem audit exclusivamente no serviço). Unit interceptor
> 3/3, typecheck e E2E integral 98/98 PASS com papel `role_app_backend`;
> hashes congelados intactos. Aguardando observação Inspector 13/13 no
> mesmo candidato antes de TASK-0022.

> INSPECTOR 12/13 (2026-09-17): dez fixtures/precondições corrigidas na
> allowlist; E2E dirigida 10/10 PASS e integral 97/98 PASS. Único RED é
> auditoria duplicada do protocolo (+2 em vez de +1). App typecheck,
> formato, DB role e hashes passaram. Engineer 7/7 elegível para correção
> de um arquivo; Inspector 13/13 observará GREEN antes de TASK-0022.

> OWNER autorizou ciclo final delimitado (2026-09-17): Inspector TASK-0020
> 12/13 corrige apenas fixtures/precondições dos dez RED classificados;
> Engineer TASK-0021 7/7 corrige apenas auditoria duplicada; Inspector
> TASK-0020 13/13 observa GREEN integral no candidato. Sem repetição do review
> intermediário. Despachar TASK-0022 somente após essa observação, mantendo
> a revisão de entrega pós-TASK-0022. Histórico e contadores não reiniciados.

> INSPECTOR 11/11 OBSERVOU RED (2026-09-17): ponte de identidade Engineer
> 6/6 passou em full-auth/runtime 24/24, contrato/comportamento 143/143,
> policy 113/113, typechecks/decorators e leitura DB app-role. Sete sensores
> congelados intactos. E2E RAIT 98 coletados/87 PASS/11 RED: auditoria
> duplicada de protocolo (produto fora da allowlist 6/6), decisão com ator
> errado na fixture, quatro bindings de admit sem pré-estado/vínculo correto,
> cinco fixtures de timer/timezone param em protocolo 400 antes do alvo.
> Não há drift de hash: o suposto conflito comparava arquivos distintos.
> TASK-0020 checkpoint 11/11, TASK-0021 checkpoint 6/6, TASK-0022
> inelegível. OWNER dispensou review intermediário repetido, não o GREEN
> observado nem delivery-review pós-TASK-0022. Ver
> `reports/TASK-0020-C4-OD-V3-CHECKPOINT-11.md`.

> TASK-0020 8/8 CHECKPOINT RED (2026-09-17): sensor de ator local por request
> 10 PASS/1 RED; fixtures de escala corrigidas, decide+claim-next 2/2 PASS;
> E2E RAIT 85/98 PASS, 13 RED concentrados em protocolo/contexto. App role e
> banco dedicado confirmados. Architect read-only identificou que o guard
> STYNX full-auth não local produz `principal.roles=[]` e o token de sessão
> não contém papéis; GREEN apenas local não basta. Preparar contrato e sensor
> de resolução server-side de papéis ativos por ator+tenant verificados, sem
> sexta DI; Engineer só após freeze. OWNER dispensou a revisão intermediária
> repetida, não o delivery-review pós-TASK-0022. TASK-0022 inelegível.

> TASK-0021 5/5 CHECKPOINT BLOCKED (2026-09-17): Engineer Terra/High
> reteve apenas correção fail-closed do Clock, sem @Optional/fallback. Policy
> 113/113, unit C4 141/141, typechecks/decorators PASS; E2E 83/98 PASS,
> 15 RED. Serviço ainda lê roles de propriedade inexistente do RequestContext;
> sexta injeção violou sensor DI de cinco providers e foi revertida. Runtime
> local fixa actor ID no import, E2E muda env por request; fixture de escala
> usa datas vencidas. Dois últimos paths/contratos excedem a allowlist
> Engineer. TASK-0020 checkpoint 7/7 e TASK-0021 checkpoint 5/5, sem reset;
> TASK-0022 inelegível, revisão independente adiada, sem PASS/commit/merge.
> Ver `reports/TASK-0021-C4-OD-V3-CHECKPOINT-5.md`.

> OWNER AUTORIZOU CONTINUAÇÕES DELIMITADAS (2026-09-17): TASK-0020
> Inspector 7/7, sem reset, corrigiu quatro sensores/fixtures (protocolo de
> 40 caracteres, caso real de admit sem mutar `protocolled_at`, dois unit specs
> com quinto Clock). Unit C4 140/140, typechecks/formato PASS; E2E 98
> coletados/83 PASS/15 RED reais. Hashes em
> `reports/TASK-0020-C4-OD-V3-CHECKPOINT-7.md`. TASK-0021 Engineer Terra/High
> 5/5 foi autorizado para remover Clock opcional/fallback e buscar GREEN
> sobre esses hashes, com prompt `TASK-0021-V3-5-GREEN.md`. Janela 21 reserva
> 60k+60k+25k tokens estimados (workers e revisão), abaixo do checkpoint.
> TASK-0022 continua inelegível até GREEN e gate independente; nenhum PASS,
> commit ou merge foi presumido.

> TASK-0021 4/4 CHECKPOINT BLOCKED (2026-09-17): a exceção OWNER de
> sequência foi usada uma vez. Engineer implementou o POST protocol e o guard
> estrito; policy congelada 113/113 PASS, negativas HTTP focadas 35/35 PASS
> (403, não 404), typechecks e `verify:decorators` PASS. Não há GREEN integral:
> o sensor `protocolBody()` envia número de 44 caracteres contra máximo 40;
> fixture compartilhada tenta atualizar `protocolled_at` imutável. Além disso,
> o Maestro identificou `@Optional()`/fallback `new RaitOperationClock()` no
> serviço, incompatível com ADR-0025. Sensores congelados não foram editados.
> TASK-0020 permanece checkpoint 6/6, TASK-0021 checkpoint 4/4 e TASK-0022
> inelegível. Corrigir exige continuação Inspector para fixtures/sensor e
> Engineer para Clock/GREEN, com limites e gate independentes explicitamente
> autorizados; a exceção de sequência não é waiver desses bloqueios. Sem
> commit/merge. Ver `reports/TASK-0021-C4-OD-V3-CHECKPOINT-4.md`.

> OWNER AUTORIZOU EXCEÇÃO DE SEQUÊNCIA (2026-09-17): após TASK-0020 6/6
> checkpoint, aceitar o 404 de POST `/v1/inf/rait/cases` **somente** como RED
> da rota ausente para despachar TASK-0021 Engineer Terra/High 4/4. Não
> considerar 44 negativas E2E como prova de 403/400/vínculo, não declarar
> TASK-0020 concluída e não alterar seus contadores. Os sensores policy/E2E
> ficam congelados nos SHA do prompt `TASK-0021-V3-4-OWNER-SEQUENCE.md`;
> Engineer implementa rota/política e busca GREEN real sem editar testes.
> TASK-0022 ainda depende do GREEN e de gates/revisão de entrega. Esta
> autorização não é waiver de testes, review, commit ou merge.

> TASK-0020 6/6 CHECKPOINT BLOCKED (2026-09-17): após PASS independente do
> preparo fresh/Clock no mesmo hash, Inspector Terra/High consumiu a única
> continuação OWNER sem reset. Policy: 120 coletados, 113 PASS/7 RED reais
> (admin e três atalhos permission). E2E: 98 coletados/47 RED; 44 novos casos
> atravessam HTTP mas param em `404 Cannot POST /v1/inf/rait/cases`, antes de
> discriminar 403/400/vínculo e efeitos. Unit C4 106/106 PASS, runtime legado
> 2/2 PASS, typecheck PASS. Sensores policy e E2E congelados com SHA
> `3fdf45f47051797ecd26f82f5e2ece9d28a8fe24dcd6fe27ea7eb5429cba9179`
> e `149d4be08a2e526b8cefb48f1df480c70bf5ff907076a4cf7d34d6d99418801c`.
> Inspector classificou **RED parcial/BLOCKED**, não RED integral; a ausência
> da rota é RED contratual, mas mascara a matriz de autorização. TASK-0020
> checkpoint 6/6, TASK-0021 queued/inelegível, TASK-0022 bloqueada. Exige
> decisão OWNER para nova iteração Inspector delimitada ou alteração explícita
> da ordem/gate; não assumir PASS por waiver de low. Ver
> `reports/TASK-0020-C4-OD-V3-CHECKPOINT-6.md`. Nenhum commit/merge.

> SPLIT FRESH/LEGACY REVISADO E TASK-0020 6/6 ELEGÍVEL (2026-09-17): nova
> direção OWNER resolveu o STOP TASK-0038 sem alterar seed20, DDL19, datas ou
> IDs legados. `seed.sh` agora tem perfil fresh padrão (uma transação, fixture
> `21-fixtures-rait-fresh.sql`) e `legacy-upgrade` explícito, que exige baseline
> de 20 casos antes de escrever. Engineer validou fresh e reaplicação em scratch:
> 1 case/1 assessment revision=1 none/0 bases, `assessed_at=protocolled_at`;
> Inspector substituiu o sensor falso de primeiro INSERT por prova integral do
> runner 1/1 PASS, URLs explícitas e cleanup seguro. Perfil legacy-upgrade
> executado no banco dedicado `detran_r7_ctg1_a2` com exit 0. Cinco hashes
> congelados em `reviews/attempt-2/ctg-0001-fresh-seed-clock-delta.prompt.md`.
> Fable 5 REVIEW inicial zero high/três low por leituras incompletas, preservado;
> revisão suplementar do mesmo candidato **PASS** zero high/três low não
> bloqueantes, JSON `ctg-0001-fresh-seed-clock-delta-review-2.json`. TASK-0020
> mantém iteration_count=5 e teto OWNER=6; prompt ativo `TASK-0020-V3-6.md`.
> TASK-0021 só se torna elegível após RED integral e hashes congelados. Nenhum
> commit/merge, nem CTG concluído.

> TASK-0038 PREPARAÇÃO DELIMITADA STOP (2026-09-17): OWNER autorizou exceção
> pré-RED para Engineer Terra/High preparar apenas Clock/seed20, seguida de
> revisão independente do delta e mais uma continuação Inspector, sem resetar
> TASK-0020 5/5. Engineer criou `rait-operation-clock.ts` (typecheck e DI 1/1
> PASS), mas ensaio em banco fresh descartável confirmou que a seed20 não é
> corrigível na allowlist: 19/20 protocolos sintéticos precedem
> `rait.priority.legal_bases.effective_from=2026-09-13`; com transação, a
> função oficial não encontra política para a data da qualificação; sem
> transação, a constraint DDL19 reprova o primeiro caso antes de qualquer
> qualificação posterior. A tentativa Engineer de mudar seed20 foi retirada;
> o diff preexistente de `document_id` foi preservado. O banco scratch foi
> removido. Não há candidato Clock+seed válido para revisão independente,
> portanto o gate não ocorreu e Inspector 6/6 **não foi despachado**.
> TASK-0020 permanece checkpoint 5/5, TASK-0021 queued/inelegível, CTG-0001
> bloqueado. Resolver exige decisão de escopo/fixture/runner sem fabricar fatos
> históricos nem relaxar DDL19. Ver `tasks/TASK-0038.json` e
> `reports/TASK-0038-CLOCK-SEED-PREP-STOP.md`. Nenhum commit/merge.

> TASK-0020 CONTINUAÇÃO 5/5 BLOCKED (2026-09-17): Fable 5 deu PASS válido ao
> delta de sequência/fixture, zero high/dois low. Inspector Terra/High obteve
> RED fresh seed20/DDL19 em transação revertida (3 coletados, 2 PASS/1 RED,
> sensor SHA `5d28ad053b130544e8362bf40e5fd95f8ac1c7a9de92f74a047663d89fbd6ca6`)
> e RED unitário DI Clock (106 coletados, 105 PASS/1 RED). Policy atual 74/74
> PASS sem a matriz V3; E2E descobriu 54 casos mas todos skipped antes de HTTP
> porque `rait-operation-clock.js` não existe. Typecheck TS2307. Logo **não há
> RED integral** e TASK-0021 permanece queued/inelegível. TASK-0020 está
> checkpoint 5/5, sem reset. A sequência aprovada exige RED integral antes do
> Engineer, mas o próprio Clock a construir pelo Engineer é pré-requisito para
> carregar o AppModule e coletar HTTP. Requer OWNER definir uma preparação
> Engineer delimitada para Clock/seed e novo limite Inspector, com revisão do
> delta antes de despacho. Não há commit/merge. Relatório
> `reports/TASK-0020-C4-OD-V3-CHECKPOINT-5.md`.

> CICLO CORRETIVO TASK-0020 AUTORIZADO (2026-09-17): OWNER autorizou a
> continuação delimitada após BLOCKED 4/4; máximo agora 5, sem reset. Antes
> de novo despacho, o Maestro confirmou o caminho de upgrade no banco
> **descartável** `detran_r7_ctg1_a2`: seed05 e 20 casos legados de seed20
> aplicados em uma transação, com somente o trigger diferido
> `rait_priority_case_complete` temporariamente desabilitado durante a carga
> e reabilitado **antes do commit**. Pós-commit: 20 cases, 1 inquiry, parâmetro
> legal presente e `tgenabled='O'`; integração existente 2/2 PASS com papel
> app explícito. Nenhum DDL ou seed do repositório foi editado, e isto **não**
> prova fresh seed20: Inspector 5/5 deve acrescentar RED separado para sua
> instalação nova; Engineer TASK-0021 corrige a seed somente após RED
> integral, sem inventar prova histórica. Prompt/PC/tarefa e reserva 10k/2k
> review + 60k/8k worker atualizados; revisão independente estruturada do
> delta: **PASS**, zero high/dois low aceitos pela direção OWNER de economia,
> JSON em `reviews/attempt-2/ctg-0001-task0020-corrective-delta-1.json`.
> O reviewer confirmou hashes dos seis insumos. TASK-0021 continua queued. O
> parecer SQL2 REVIEW e waiver do
> OWNER permanecem intactos.

> TASK-0020 CHECKPOINT BLOCKED (2026-09-17): a única iteração 4/4 foi
> despachada a Inspector Terra/High. Sensor DI permitido (SHA
> `a7718a8749b996283267c7ec0e9b6b55b6a779ee2fdfb847da6804188fe39637`)
> coletou 1/1 RED real pelo módulo Clock ausente; outros 105 testes unitários
> existentes passaram na coleta do worker. Integração coletou 2, mas o caso e
> a inquiry canônicos faltam; E2E descobriu 54, sem HTTP por módulo ausente e
> fixture ausente. A tentativa `psql --single-transaction -f seed/20` no banco
> dedicado foi totalmente revertida: o trigger diferido DDL19 exige assessment
> revision=1 por case, enquanto seed20 insere 20 cases sem assessment. Banco
> permanece com 0 rait_case/0 rait_inquiry. Não há RED integral, TASK-0021
> continua queued e TASK-0022 inelegível. Corrigir seed20/ordem da fixture é
> fronteira Engineer, mas fazê-lo antes da conclusão de TASK-0020 altera a
> sequência C4-OD; limite 4/4 esgotado. Exige reconciliação delimitada do
> contrato/prompt, revisão independente do delta e autorização OWNER para
> continuação, sem reset histórico. Relatório
> `reports/TASK-0020-C4-OD-V3-CHECKPOINT.md`. Nenhum commit/merge.

> RECONCILIAÇÃO DE DESPACHO FUTURO (2026-09-17): por direção OWNER ADR-0026,
> TASK-0005–0018 e TASK-0020–0022 usam Architect Sol/Medium e
> Inspector/Engineer Terra/High. Nenhuma chamada Astra futura está autorizada;
> o Maestro permanece Sol. Os prompts desses 17 trabalhos, seus registros
> governados, PCs ativos e reservas planejadas foram reconciliados. JSONs de
> TASK-0020/21/22 materializados, preservando 3/4, 3/4 e 1/4; não houve
> despacho nem reset. Composições anteriores e orçamento de execuções passadas
> são históricos, não instruções ativas. A passagem para cada CTG ainda exige
> gates e revisão do candidato pertinente.

> TASK-0024 → TASK-0025 SEQUÊNCIA CONCLUÍDA (2026-09-17): após a correção
> documental separada autorizada pelo OWNER, TASK-0024 passou no gate KB
> 521/446, Prettier e validação manual OpenAPI 1 path/1 operation, mantendo
> 1/1. TASK-0025, Inspector Terra/High 1/1, atualizou só o sensor AIT; banco
> dedicado com duas URLs explícitas e papel efetivo `role_app_backend` teve
> inventário 90 tenant/10 referências/17 case, cinco relações C4/C4-OD
> nominais, RLS/FORCE/policy/trigger e isolamento de AIT entre tenants. Comando
> de aceite 3/3 PASS, exit 0; ausência de cada URL bloqueia antes da coleta.
> Typecheck, Prettier e verify:rls-ddl PASS. Relatório
> `reports/TASK-0024-0025-V3-DELIVERY.md`. Nenhum commit/merge; CTG-0001 e
> R-0007 não estão encerrados.

> TASK-0024 CHECKPOINT (2026-09-17): continuação delimitada 1/1 alterou
> somente as crases de TEAT_EVIDENCE em UC-RAIT-017; Prettier PASS e piso 446
> permanece no manifesto. `pnpm docs:kb:check` falhou (exit 1) exclusivamente
> porque `docs/framework/contracts/manual/README.md` contém caminho absoluto
> desta estação, fora da allowlist de TASK-0024. Não editar README/checker por
> inferência, não declarar gate verde e não despachar TASK-0025 antes de
> correção documental autorizada, revalidação do gate e reconciliação do
> checkpoint sem zerar 1/1. Nenhum commit/merge.

> TASK-0024 FOLLOW-UP AUTORIZADO (2026-09-17): OWNER autorizou correção
> documental separada no `docs/framework/contracts/manual/README.md`; os
> caminhos absolutos foram substituídos por caminho derivado da raiz, sem
> fallback nem mudança no checker. `pnpm docs:kb:check` PASS (521 artefatos,
> 446 tokens), Prettier PASS, bloco executável do guia PASS (OpenAPI 1 path/1
> operation, estrutura/referências e `contracts:check`). TASK-0024 completed
> na mesma 1/1, preservando checkpoint/falha anterior; TASK-0025 elegível em
> seguida. Nenhum commit/merge.

> CTG-0001 DB GATE (2026-09-17): TASK-0028 ensaio dedicado coletou 18/18
> PASS, exit 0, em `detran_r7_ctg1_a2` descartável. Deltas SQL de parser
> `19-pre` e `19-enforce` receberam pareceres Fable 5 estruturados válidos
> PASS, zero high; `apply.sh` também tem delta PASS. O sensor foi corrigido
> para comparar dados independentemente da ordem física do COPY, ACLs como
> conjuntos e apenas objetos estruturais de prioridade relevantes, sem omitir
> grants, rollback ou imutabilidade. Seu hash final é `50f25dc5...`; revisão
> independente delimitada do sensor deu PASS válido, candidato
> `77b0409e69d61062c19a470af1fa7efc4fba577401001b14bace98f9f368c6aa`,
> zero high/quatro low aceitos como não bloqueantes sob direção OWNER.
> Evidência DEVAI sequência 28. TASK-0028/29/30 fechadas como completed 1/1
> sem zerar contadores; TASK-0024 é a próxima ready 0/1, Architect Sol/Medium,
> com composição nova verificada. TASK-0025 continua queued 0/1,
> Inspector Terra/High, após TASK-0024. Nenhuma dessas tarefas foi despachada
> nesta atualização; CTG-0001 está desbloqueado para continuar, não concluído.
> Relatório `reports/TASK-0028-V3-DB.md`; SQL2 histórico continua REVIEW com
> dispensa OWNER restrita registrada em ADR-0026, nunca PASS independente.

> TASK-0028 SECOND DB REHEARSAL (2026-09-17): delta apply/search_path recebeu
> PASS independente (17 inputs, zero high/um low), mas teste integral voltou
> 8 PASS/10 FAIL. Primeiro erro novo no `19-rait-priority-pre.sql`: `CASE`
> não parentetizado em `ELSIF` gera syntax error no PL/pgSQL. Parênteses foram
> acrescentados; `DO` compila em transação revertida no banco descartável
> vazio. Não declarar DB PASS; o `--full` final deixou o banco vazio de novo.
> Revisão independente delimitada do novo byte SQL é obrigatória antes da
> próxima aplicação. Evidência DEVAI seq26/27; relatório TASK-0028-V3-DB.

> TASK-0028 FIRST DB REHEARSAL (2026-09-17): fixture dedicada corrigida
> auditavelmente (DEVAI seq24), mas teste integral 18 coletados, 8 PASS/10
> FAIL (DEVAI seq25). Primeiro erro: `apply.sh` exit 3 no DDL00 `pgcrypto`
> porque o preflight mantém `search_path=pg_catalog, public` até o DDL.
> Falhas posteriores por objetos ausentes são secundárias. O `--full` do
> último teste deixou o banco descartável vazio; nenhum outro banco tocado.
> Diagnóstico transacional com `public, pg_catalog` passou e foi revertido.
> TASK-0029 mesma 1/1 recebeu correção mínima de search_path; `bash -n` e
> sensor estático filtrado PASS, **não** DB PASS. Antes de novo apply/DB,
> congelar e revisar independentemente esse delta técnico. Não reexecutar
> sem a revisão e não zerar contadores. Relatório: `reports/TASK-0028-V3-DB.md`.

> OWNER WAIVER / TOKEN ECONOMY (2026-09-17): ADR-0026 registra a decisão
> expressa do OWNER de dispensar somente o high SQL2 de elegibilidade automática
> dos casos legados `NULL`/desconhecidos para avançar CTG-0001. O JSON SQL2
> permanece `REVIEW` válido, candidato `1fb5e9a0...`, nunca PASS independente;
> o gate operacional é **OWNER-ACCEPTED-WITH-WAIVER** apenas nesses bytes.
> TASK-0036/0037 foram canceladas 0/1 sem dispatch, prompt-review/SQL3 não
> serão chamados por esse achado. ADR-0024 continua normativa e a divergência
> deve constar do relatório de entrega/PR como risco aceito, não como correção.
> Fixture, aplicação transacional, RLS/ACL, autorização, imutabilidade,
> positivos de protocolo, rollback, testes DB e gates de integração não são
> dispensados. Próximo passo: preflight fresco da fixture dedicada, execução
> auditável e TASK-0028 DB integral. Até nova decisão, maestro Sol; novas
> chamadas Architect Sol, Inspector/Engineer Terra, Terra anterior Luna; sem
> Astra. Histórico/modelos/hashes anteriores ficam intactos. Reconciliar
> executor/prompt/composição das tarefas futuras somente antes do despacho,
> com escritor único e orçamento reestimado; não consumir revisões redundantes.

> SQL REVIEW 2 RESULT / AUTHORITY CHECKPOINT (2026-09-17): revisão Fable 5
> nativa estruturada válida **REVIEW**, candidato
> `1fb5e9a0ea7182d252aeb570abb18df093078a2e2d0e8fb0464725a85e9e5943`
> (213 inputs), um high/quatro low; JSON/raw/bridge/manifesto preservados em
> `reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-2.*`. High: consulta
> claim-next ainda admite `NULL`/string legada desconhecida como rank-zero,
> contra exclusão automática ADR-0024. Seed correto, sensor0028 complementado
> e TASK0034 RED→TASK0035 GREEN são evidências, não DB PASS. TASK0030 gerou
> oficialmente três derivados e segue `in_progress` 1/1; nenhum DB/fixture/
> schema aplicado. Proposta documental TASK0036/37, read-set e orçamento
> prospectivo em `reports/CTG-0001-C4-OD-V3-SQL2-ELIGIBILITY-CYCLE.md`.
> Nenhuma revisão adicional ou worker técnico novo será despachado até OWNER
> fixar nominalmente o limite extra de prompt-review/SQL3; não há reset ou
> retry implícito. O checkpoint 640.000 da janela 20 não foi alcançado pela
> estimativa atual 320.000; projeção corretiva futura +145.000 input ainda
> não reservada. Banco permanece bloqueado até SQL3 PASS nos bytes exatos.

> SQL REVIEW 1 RESULT (2026-09-16): revisão Fable 5 nativa estruturada
> válida **REVIEW**, candidato congelado
> `a889a9b7266f36e3c0194f75f838b4facc1b7ecc6bbea07f8c824c21b2c83689`
> (189 inputs), três high/dois low. Parecer/manifesto/raw/bridge preservados
> em `reviews/attempt-2/ctg-0001-c4-od-v3-review-sql-1.*`. High F1: seed
> `rait.priority.legal_bases` ainda string antiga, enquanto função exige JSON
> ADR-0024; geração TASK-0030 está depois do DB gate. High F2: sensor 0028
> não executa protocolo/qualificação positivo novo, podendo passar mesmo com
> intake inutilizável. High F3: claim-next ordena `legal_priority` como texto
> DESC e inverte a prioridade. Nenhum SQL aplicado. TASK-0029 fica checkpoint
> 1/1 após preparação, mas **sem PASS SQL**; TASK-0030 continua 0/1 e
> inelegível até o delta de sequência ser revisado.
>
> OWNER GOAL SQL1 CORRECTION (2026-09-16): OWNER confirmou prosseguir com
> correção delimitada F1–F3 sem reduzir o parecer. Janela contábil 20 aberta
> sem reset de provedor: 90.000/16.000 estimados inicialmente para coordenação,
> Architect Astra/Medium de contrato e prompt-review Fable 5; projeção completa
> 320.000/52.000 abaixo checkpoint 640.000, futuras chamadas ainda não
> reservadas. TASK-0034/0035 IDs livres antes da criação. Sequência proposta:
> adendo Architect e prompt-review → complementar sensor 0028 na mesma
> iteração checkpoint, Inspector rank RED e Engineer rank GREEN isolados →
> TASK-0030 geração oficial dos três derivados em 1/1 **in_progress** antes
> do ensaio, sem aplicar seed; conclusão só após PASS DB → SQL review2 exato
> → reconciliação auditável da fixture no banco dedicado após PASS SQL2 →
> full sensor0028 DB → fila restante. SQL19/DDL05, sensor/pareceres congelados
> do primeiro candidato não serão reescritos silenciosamente. Shared/appmodule/
> lockfile R-0010 permanecem fora desta correção.

> TASK-0029 PREPARATION RESULT (2026-09-16): Architect Astra/Medium encerrou
> a preparação estática da mesma iteração 1/1, sem DB. Todos os 96 paths
> nominais presentes: 6 autorados, 85 saídas de entidade e 5 suportes gerados;
> zero delta fora da allowlist. Duas gerações oficiais de blueprint/OpenAPI
> exit 0; segunda comparação de 1.171 arquivos com zero drift;
> `blueprints:check`, `contracts:check`, `bash -n` e gate manual OpenAPI
> (1 path/1 POST) PASS. Aggregate SHA-256 dos 96 paths
> `57c01235bf957cfdc433783b6d44d4801bd879642690715bac07dda885bb46d5`;
> dos 52 DDL `5042a60429baac6ab53ebe22962a269614f9ecd34e053739c03d56c374151124`.
> Evidência DEVAI generic sequência 16. TASK-0029 aguarda revisão
> independente dos bytes SQL/apply antes de **qualquer** aplicação ao DB.
> Orçamento estimado revisão única Fable5 60.000/8.000 na janela 19: total
> 335.000 input estimado abaixo checkpoint 640.000; não é consumo medido nem
> retry. TASK-0030 segue inelegível sem PASS DB integral. TEMP marker,
> ownership/ACL, rollback e fresh/upgrade ainda não foram provados;
> RaitOperationClock handwritten pertence a TASK-0021, sem build/runtime PASS.

> OWNER ROUND COMPLETION RESUMPTION (2026-09-16): OWNER explicitou continuar
> TASK-0029 e seguintes até finalizar R-0007, respeitando gates/revisões e
> autoridade de integração. TASK-0029 retoma a **mesma** iteração Architect
> Astra/Medium 1/1 após PASS DDL05 candidate `da9316e4...`; não há reset nem
> nova reserva da estimativa histórica 100.000/16.000 na janela 18. Fronteira
> desta etapa: apenas preparação nominal de 96 paths; 81 já estavam dirty,
> preservados. Sem colisão conhecida com lock R-0010 nesta etapa; shared
> documents/appmodule/lockfile continuam reservados para coordenação futura.
> Escritor único e locks de MOD-rait-priority-schema/MOD-bp-rait-case/
> MOD-generated-tree; SQL real exige review independente antes de DB apply.

> DDL05 DELIVERY REVIEW RESULT (2026-09-16): revisão independente Fable 5
> nativa estruturada válida **PASS**, zero high/dois low, candidato congelado
> `da9316e411aa994e3538c7ced29dcf1ee25d58c5733ead05e1fd0d3c7bf8f41a`
> (41 inputs), raw SHA-256
> `ccd05e76f7e5b0e8e700082fa7730055e82e2f7118d923fedbf133bcf4cdbd38`.
> Parecer/manifesto/bridge em
> `reviews/attempt-2/ctg-0001-c4-od-v3-review-ddl05-delivery-1.*`.
> Low de tags `planned-not-dispatched` corrigido nos registros operacionais
> após o freeze; esses três JSONs, plan e budget agora divergem do manifesto
> por atualização de estado, sem alterar DDL05/sensores/contrato revisados.
> Low restante: sensor DB futuro de inserção ausente comprova timestamps
> não nulos, mas não sua frescura; Inspector deverá fortalecer e recongelar
> antes do futuro ensaio DB sob autorização/gate próprios. Nenhum ensaio DB,
> apply, seed, SQL19 review ou retomada TASK-0029 ocorreu neste ciclo.
> TASK-0031/32/33 fechadas em 1/1; TASK-0029 permanece checkpoint 1/1.

> DDL05 DELIVERY CANDIDATE (2026-09-16): TASK-0032 Inspector Sol/High
> completou 1/1 após uma interrupção de transporte por capacidade do modelo,
> continuada na mesma instância sem reset. Sensor estático congelado
> `8b11100a794e90facf39618145772df71aadcc54415370a210dbdcdb8b06f72a`
> coletou 4 testes, 3 PASS/1 RED contratual no DDL05 original, zero skip;
> sensor PostgreSQL futuro
> `4b3cb00df7a9e71352123d50795cd8500f822721a2d34b7bae1ebf24a56bebde`
> foi apenas escrito e verificado sintaticamente, sem conexão DB. DEVAI generic
> sequência 13. TASK-0033 Architect Astra/Medium completou 1/1 com a única
> mudança autorizada no DDL05: guarda `ROW(...) IS DISTINCT FROM ROW(...)`
> dos sete campos canônicos; SHA anterior `4cf0316afdb235495420cddb7297fe20ac2d5714aa449e049cf531b2ca6124d9`,
> novo `8533a73f56608059477ff25894905c3ad9435ca42c2c6ff19686a14c978feef4`.
> Sensor estático 4/4 GREEN, `pnpm verify:role-catalog` PASS 36 papéis,
> `git diff --check` PASS. Nenhum DB apply/teste, DDL14 ou sensor 0028 alterado.
> TASK-0033 aguarda revisão independente dos bytes reais antes de eventual
> retomada da TASK-0029 checkpoint 1/1; locks de escrita liberados.

> DDL05 PROMPT-REVIEW RESULT (2026-09-16): Fable 5 nativo estruturado PASS
> válido, zero high/três low, candidato
> `b3f47879cc36e9ecea4e937a05ad801950fd005676a1babceda4f2fa770804f0`
> (82 inputs). Saída raw/schema/manifesto/bridge preservada em
> `reviews/attempt-2/ctg-0001-c4-od-v3-review-ddl05-prompt-1.*`.
> Baixas não bloqueantes: autoridade Inspector para novo
> `backend/database/tests/` deve constar como extensão OWNER no contrato;
> `git diff --check` será executado pelo Maestro, não pelo worker; citação
> da expressão SQL no contrato é especificação, não escrita de produto.
> Sem correção de prompt após freeze, sem retry/revisão extra e sem PASS DB.
> Atualização operacional plan/budget posterior ao candidato revisado.

> OWNER DDL05 CORRECTIVE CYCLE (2026-09-16): OWNER autorizou correção
> delimitada do upsert DDL05 com teste independente e revisão antes de
> retomar TASK-0029. Escopo/ordem/limites em
> `reports/CTG-0001-C4-OD-V3-DDL05-CYCLE.md`. TASK-0029 fica checkpoint 1/1;
> DDL14 e sensor 0028 congelado permanecem intocados. Prompt-review válido
> precede qualquer worker; delivery-review dos bytes reais precede retomada.
> Não aplicar SQL/DB, não executar teste mutante, não inferir merge.

> TASK-0029 DDL05 REFERENCE-GAP CHECKPOINT (2026-09-16): retomada Owner da
> mesma iteração 1/1 parou **sem escrever** após scan read-only de 49 DDLs.
> `05-role-catalog.sql` atualiza `auth.role_catalog.updated_at` com
> `clock_timestamp()` em todo apply, contradizendo o sensor congelado que
> compara todos os dados legados após primeiro upgrade e reaplicação.
> DDL05 está fora da allowlist TASK-0029; não mascarar via snapshot/restore,
> não pular o arquivo nem enfraquecer sensor. DDL14 tem dez upserts
> determinísticos, com risco condicional se catálogo legado divergir.
> Relatório `reports/TASK-0029-V3-DDL05-REFERENCE-GAP.md` delimita a
> decisão/correção necessária. Locks liberados; orçamento e contador não
> reiniciados; nenhum SQL19, BP, gerado, JSON manual, DB apply/seed/teste ou
> revisão SQL ocorreu. OWNER deve autorizar fronteira própria de idempotência
> DDL05 e gate independente antes de retomar preparação 0029.

> OWNER TASK-0029 RESUMPTION (2026-09-16): OWNER autorizou retomar a mesma
> tentativa Architect Astra/Medium **1/1** após PASS válido do delta manual
> OpenAPI candidato `14fe64e29e3b0acfd85b7ea0636fcfbd05f47fcc2731acadad563e4924aa7481`.
> Reservada permanece a entrada histórica TASK-0029-V3-1 100.000/16.000 na
> janela 18 (585.000 input estimado); janela 19 65.000/11.000 documentais
> não é novo orçamento de worker. Escritor global único e locks dos módulos
> TASK-0029 ativos durante a preparação. Sensor 0028
> `aab9bde147c33fd047ee9e8fa5f1d7b4a9acb8298a34bc5d6d05dadc7d6e9577`
> intacto. Banco dedicado `detran_r7_ctg1_a2` identificado read-only;
> `role_app_backend` NOLOGIN, sem superuser/BYPASSRLS, novo writer ausente.
> Preparação/geração/validação manual somente; nenhum apply/seed/teste DB,
> nem correção dos três lows do reviewer. SQL real requer revisão independente
> antes de qualquer aplicação; PASS DB integral 0028 precede 0030.

> OWNER MANUAL-OPENAPI DELTA AUTHORIZATION (2026-09-16): OWNER autorizou
> separar o contrato OpenAPI manual em diretório próprio, reconciliar
> paths/prompts/allowlists e submetê-lo a **uma** revisão independente
> antes de retomar TASK-0029. O validador gerado
> `tools/contracts/generate-openapi.mjs` fica intocado e
> `pnpm contracts:check` continua obrigatório. A validação manual futura
> deverá usar comando OpenAPI executável real e referência de path exata,
> não somente esconder o arquivo da varredura. Preflight encontrou
> `openapi-typescript` instalado em `@detran/senatran-adapter`; comando com
> path absoluto de contrato existente exit 0 em modo sem escrita, usando
> Redocly para parse/resolução. O uso contra o arquivo manual futuro
> depende de ele existir e ser validado; não há PASS antecipado. Janela
> contábil 18 fica em 585.000 input estimado; reserva Architect 30.000/5.000
> e Auditor 35.000/6.000 seria 650.000, acima do checkpoint 640.000,
> portanto passam à janela 19 com 65.000/11.000 estimados, sem reset de
> tarefas ou do provedor. TASK-0029 permanece checkpoint 1/1, sem
> despacho, produto/SQL/sensor/DB neste delta. Escritor único documental.

> RESOLUÇÃO OPERACIONAL DO DELTA MANUAL: o futuro contrato autorizado será
> `docs/framework/contracts/manual/rait-priority-intake.commands.openapi.json`.
> O path diretamente em `contracts/` citado no checkpoint abaixo é o candidato
> histórico rejeitado, não uma instrução ativa. Antes de concluir TASK-0029
> e em cada gate posterior, executar a validação estrutural/refs/superfície
> fail-closed de `docs/framework/contracts/manual/README.md` sobre o arquivo
> existente, mais `pnpm contracts:check` sem alteração do checker. Nenhum
> PASS da validação manual existe nesta preparação. A revisão independente
> documental deve avaliar esses bytes antes de retomar a mesma iteração 1/1.

> RESULTADO DA REVISÃO MANUAL-OPENAPI (2026-09-16): revisão Fable 5 nativa
> estruturada válida **PASS**, zero high e três low, candidato congelado
> `14fe64e29e3b0acfd85b7ea0636fcfbd05f47fcc2731acadad563e4924aa7481`
> (113 inputs). Raw, schema, manifesto e bridge estão em
> `work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v3-review-manual-openapi-delta-1.*`.
> Lows não bloqueantes: path absoluto local no bloco README manual, hash SHA
> exigido em prosa mas sem comando no bloco, e nomes root-level de comandos
> em Metas históricas adiante. Essas observações ficam abertas para revisão
> futura delimitada; **não** corrigir silenciosamente o candidato aprovado.
> Este registro operacional posterior ao freeze altera somente plan/budget e
> não é parte dos 113 bytes revisados, preservados integralmente no `.inputs.json`.
> Não houve retomada TASK-0029, JSON manual, SQL ou DB neste delta.

> TASK-0029 TOOLING REFERENCE-GAP (2026-09-16): autorização OWNER do novo
> role técnico permanece válida, mas Architect parou de novo **antes de
> escrever** na mesma iteração 1/1. O contrato exige
> `docs/framework/contracts/rait-priority-intake.commands.openapi.json`;
> `tools/contracts/generate-openapi.mjs` admite somente outputs
> `${bp.id}.openapi.json` e acusa qualquer outro `.openapi.json` como órfão.
> Baseline `pnpm contracts:check` PASS; reprodução read-only do nome futuro
> acusa `orphan contract`. O checker está fora da allowlist TASK-0029.
> Nenhum produto/SQL/gerado/DB foi alterado; locks liberados, DEVAI generic
> R-0007 sequência 8. Precisa de decisão OWNER sobre fronteira do contrato
> manual e validação explícita, seguida de reconciliação/review cabíveis;
> não enfraquecer checker nem renomear só para ocultar do gate. Risco de
> ownership fresh/upgrade, SQL-review antes de apply e PASS DB integral
> antes de TASK-0030 seguem pendentes.

> OWNER ROLE DECISION (2026-09-16, posterior ao reference-gap): OWNER
> autorizou **exatamente** criar `role_rait_priority_writer` com NOLOGIN,
> NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE e NOREPLICATION,
> sem membership ao app e sem modificar quaisquer outros roles. Criação e
> permissões integram a mesma transação DDL revisada; **nenhum SQL é aplicado
> antes do PASS da revisão independente dos bytes exatos**. Role existente
> incompatível causa STOP, sem correção silenciosa. Esta decisão específica
> supera apenas a proibição anterior para este novo role técnico; não altera
> política legal, Clock, `role_app_backend` ou outras fronteiras. Consulta
> read-only confirma o role ainda ausente. TASK-0029 retoma a **mesma
> iteração 1/1**, escritor único/locks originais, sem nova reserva ou reset;
> continua só preparação/geração, sem conexão/apply/seed DB.

> TASK-0029 REFERENCE-GAP CHECKPOINT (2026-09-16): Architect Astra/Medium
> leu o prompt e parou **antes de qualquer escrita**. Contrato C4-OD exige
> `role_rait_priority_writer` global, com criação em enforce; adendo final
> de sequência e autorização do banco dedicado vedam mudanças de roles
> globais. Consulta read-only confirmou que o role está ausente. TASK-0029
> permanece checkpoint na mesma iteração 1/1, sem reset, geração, SQL ou DB;
> locks globais/de módulo liberados. Evidência DEVAI generic R-0007 sequência 7. Precisa de decisão OWNER delimitada antes de retomar. Risco adicional
> de ownership postgres (baseline) versus aarusso (admin autorizado) deve ser
> resolvido pelo Architect sem enfraquecer equivalência fresh/upgrade.
> Revisão SQL independente antes de apply e PASS DB integral de TASK-0028
> antes de TASK-0030 continuam obrigatórios; não há nova revisão autorizada
> neste checkpoint.

> PREPARATION DISPATCH 0029 (2026-09-16): TASK-0028 mantém checkpoint 1/1;
> sensor completo congelado SHA-256
> `aab9bde147c33fd047ee9e8fa5f1d7b4a9acb8298a34bc5d6d05dadc7d6e9577`,
> 12 testes coletados, RED estático genuíno 1 FAIL/11 DB filtrados,
> typecheck/Prettier PASS e zero DB conexões; DEVAI generic sequência 6.
> Preflight DB/role dedicado e PASS do delta documental confirmados. TASK-0029
> Architect Astra/Medium despachada **só PREPARAÇÃO** 1/1, escritor único,
> locks `MOD-rait-priority-schema`, `MOD-bp-rait-case`, `MOD-generated-tree`,
> reserva estimada 100.000/16.000: janela 18 585.000/109.000, abaixo do
> checkpoint 640.000. Nenhum apply/seed/teste DB nesta etapa. O baseline DB
> tem ownership postgres, conexão admin autorizada aarusso; Architect deve
> resolver no desenho/allowlist ou reportar reference-gap, sem alterar role
> global ou afrouxar sensor. Revisão SQL byte-a-byte independente antes de
> qualquer apply permanece obrigatória.

> OWNER EXECUTION CONTINUATION (2026-09-16): OWNER autorizou prosseguir
> depois do PASS do delta. TASK-0028 retoma **a mesma iteração 1/1** para
> completar apenas seu sensor; escritor único, lock
> `MOD-rait-priority-upgrade-tests`, sem nova reserva/limite. Preflight
> read-only confirmou sensor parcial SHA `6f34cb98928ee061e5ecaa828ec6eef8160fef66d4b1bb8c275fb9c3202b78f9`,
> prompt ativo SHA `23aa34fa720a27b5609b7b2dc0ac073bb7a2be388803d4d55a9f116f6108ffe9`,
> DB exclusivo `detran_r7_ctg1_a2`, 20 casos fixture, `role_app_backend`
> NOLOGIN/não-superuser/sem BYPASSRLS e impersonação SQL transacional
> confirmada. Sem DB apply neste estágio. TASK-0029 continua queued até
> sensor completo/freeze, RED estático e preflight; revisão SQL independente
> continua mandatória antes de qualquer apply.

> SEQUENCE-DELTA REVIEW RESULT (2026-09-16): revisão independente Fable 5
> estruturada válida **PASS**, zero high e um low, no candidato congelado
> SHA-256 `d09cfd5917e6610bbb524d8c6d4ee5c2629144c9a3a46b86bcae28a8c15260a2`
> (105 inputs). Raw, manifesto, JSON e bridge em `reviews/attempt-2/`;
> evidência DEVAI generic R-0007 sequência 5. O low aponta a asserção exata
> de 49 DDLs em `isolatedCopy(true)` do sensor parcial; corrigi-la **antes**
> do freeze, na mesma continuação 0028 1/1, para operar pré/pós-SQL, é parte
> do trabalho já exigido. Nenhum sensor completo/RED DB/PASS DB, SQL ou
> TASK-0029 foi despachado por este parecer. Próximo gate: completar e
> congelar 0028, reproduzir RED estático e confirmar identidade dedicada;
> só então considerar 0029 PREPARAÇÃO, com revisão SQL futura antes de apply.

> SEQUENCE-DELTA PREPARATION CHECKPOINT (2026-09-16): Architect Astra/Medium
> separado concluiu somente o adendo final do contrato C4-OD e do plano OD;
> Sol/Medium harmonizou índice, prompts 0028/0029/0030, matriz, registros e
> PCs ativos. O candidato aguarda preflight independente e revisão Fable 5
> **não despachada**. TASK-0028 segue checkpoint 1/1 e sensor incompleto;
> TASK-0029/0030 seguem queued 0/1. Nenhum SQL, produto, geração, DB apply,
> commit ou publicação ocorreu nesta preparação. Reserva do reviewer é
> estimativa, não consumo medido nem PASS antecipado.

> OWNER SEQUENCE-DELTA AUTHORIZATION (2026-09-16): OWNER autorizou corrigir
> a dependência documental TASK-0028/0029/0030 e submetê-la a **uma** revisão
> independente antes de qualquer despacho TASK-0029. Sol/Medium coordena,
> Architect Astra/Medium separado corrige contrato/plano com escritor único,
> Auditor Fable 5 fará revisão estruturada após preflight do supervisor.
> Reserva estimada adicional janela 18: Architect 30.000/5.000 e reviewer
> 35.000/6.000; total janela 18 485.000/93.000, abaixo do checkpoint
> 640.000. Sem reset de TASK-0028 (1/1 checkpoint), sem worker de produto,
> SQL, DB apply, commit ou publicação neste escopo. A revisão aprovada V3
> permanece histórica para seus próprios hashes; este delta exige novo PASS.

> CHECKPOINT OPERACIONAL 5 (2026-09-16): mesma iteração TASK-0028 1/1,
> sem reserva extra. Sensor revisado SHA-256
> `6f34cb98928ee061e5ecaa828ec6eef8160fef66d4b1bb8c275fb9c3202b78f9`;
> teste estático pré-SQL executado: 1 FAIL contratual porque o `apply.sh`
> vigente não usa `--single-transaction`, 8 DB filtrados, zero conexão DB.
> Typecheck, Prettier e coleta de 9 testes PASS. Isto **não satisfaz** o
> gate DB integral de TASK-0028 nem habilita TASK-0029 sob os prompts V3
> aprovados. Três SQL futuros ausentes; equivalência fresh/upgrade e fixture
> explícita de string legada desconhecida ainda não escritas. Evidência DEVAI
> generic R-0007 sequência 4. Trava de escritor liberada; fila suspensa até
> decisão OWNER sobre delta de dependência e revisão independente desse delta.

> OWNER DB AUTHORIZATION (2026-09-16, posterior ao checkpoint 4): OWNER
> confirmou `detran_r7_ctg1_a2` dedicado, descartável e recriável para os
> testes; conexão administrativa explícita
> `postgresql://aarusso@localhost/detran_r7_ctg1_a2`, sem senha. Esta
> autorização resolve o bloqueio de ensaio desse banco específico, não autoriza
> alterar roles globais, usar admin como identidade de aplicação, aplicar SQL
> de produção antes da revisão prevista, nem tocar outro banco. Preflight de
> leitura confirmou `role_app_backend` NOLOGIN, não-superuser e sem BYPASSRLS;
> `SET LOCAL ROLE role_app_backend` em transação produz o principal de app
> sem modificar role global. A TASK-0028 retoma o mesmo checkpoint 1/1,
> sem reinício de limite ou reserva adicional, para fechar sensor e obter RED
> válido pré-0029; os três SQL manuais ainda não existem.

> CHECKPOINT OPERACIONAL 4 (2026-09-16): TASK-0028 Inspector Sol/High
> consumiu a iteração de autoria 1/1 e entregou sensor de upgrade com nove
> testes coletados, typecheck e formatação PASS; SHA-256
> `4026f11c9c839f63ee2245938d5ee1edb5e00ba10ae1e2b821c63b452822bde6`.
> Nenhum teste DB/apply/conexão foi executado. Resultado **BLOCKED**, não RED:
> faltam URLs explícitas `DETRAN_TEST_DATABASE_URL` e
> `STYNX_APP_DATABASE_URL`, prova de banco dedicado
> `detran_r7_ctg1_a2`/`role_app_backend`/isolamento e autorização específica
> de ensaio. Evidência DEVAI generic R-0007 sequência 3. TASK-0029 permanece
> inelegível até RED válido do mesmo sensor e gate DB; sem novo worker ou
> consumo de reserva para 0029. O lock de escritor foi liberado após a autoria.

> CHECKPOINT OPERACIONAL 3 (2026-09-16): TASK-0027 Engineer Sol/High
> concluiu GREEN `pnpm parameters:test` (26/26, zero skip), parser SHA-256
> `cd3d7319ccef36c2ac6ce4ffa912ddf05dff7bb668bd7d37145ed2f3af9b865c`,
> sensor 0026 inalterado; evidência DEVAI generic R-0007 sequência 2.
> TASK-0028 Inspector Sol/High despachada 1/1 **somente para autoria do sensor**,
> escritor único/lock `MOD-rait-priority-upgrade-tests`, reserva estimada
> 60.000/10.000; janela 18 agora 420.000/82.000 estimados. Sem URL
> dedicada, papel e isolamento comprovados, ensaio DB e RED contratual ficam
> BLOCKED; TASK-0029 não é elegível nessa condição.

> CHECKPOINT OPERACIONAL 2 (2026-09-16): TASK-0026 Inspector Sol/High
> completou o RED contratual (26 coletados, 19 PASS, 7 FAIL esperados, zero
> skip); sensor congelado SHA-256 `ae5fc14de2fb8afb3b0157e25ddcc3164729ddefb68da81d5b0eb90103f50916`.
> Evidência DEVAI generic R-0007 sequência 1. TASK-0027 Engineer Sol/High
> despachada 1/1 contra esse sensor, com lock `MOD-parameter-parser`, escritor
> único e reserva estimada 50.000/8.000. Janela 18: 360.000/72.000 estimados.
> Banco permanece sem URLs/identidade explícitas; sem ensaio DB autorizado.

> RETOMADA OPERACIONAL (2026-09-16): após o PASS documental V3, o OWNER
> autorizou executar as tarefas planejadas. TASK-0026 foi despachada para
> Inspector Sol/High, iteração 1/1, com reserva estimada 50.000/8.000 na
> janela 18 (total 310.000/64.000). Escritor único da worktree e lock
> `MOD-parameter-sensors`; etapas seguintes mantêm seus gates e terão
> orçamento/locks registrados antes de cada despacho. Nenhum teste de banco,
> aplicação SQL, geração, commit, push, PR ou merge foi autorizado por este
> checkpoint. Este bloco operacional prevalece sobre os estados históricos
> abaixo, sem alterar o candidato documental revisado.

> FECHAMENTO V3: pacote documental aprovado pelo Auditor Fable 5. REVIEW-1:
> PASS, F1–F8 fechados, dois lows de locks. Ambos corrigidos sem ampliar escopo;
> REVIEW-2: **PASS, zero findings**. Candidato final:
> `e47bedefc83f297b04e661a251d1032355dbaffb550df52f967f55fb94305052`.
> Manifesto, snapshots integrais, raw e bridge em `reviews/attempt-2/`;
> relatório `reports/CTG-0001-C4-OD-V3-CLOSURE.md`. TASK-0023 concluída
> documentalmente em 2/2; TASK-0020/21 preservadas em 3/4. Próxima tarefa
> elegível: TASK-0026, ainda queued e não despachada. Encerrado o escopo Owner
> de preparação/aprovação; código, SQL, geração e banco não foram executados.
> Este estado final prevalece sobre os checkpoints históricos abaixo.

> Estado vigente V3: OWNER autorizou implementar o plano de fechamento dos oito
> achados até PASS documental independente. Coordenação Sol/Medium, continuação
> TASK-0023 Architect Astra/Medium e Auditor Fable 5. Uma execução adicional de
> TASK-0023, uma revisão substantiva, uma correção/revisão adicional se necessária
> e um retry técnico sobre candidato idêntico estão delimitados no budget.
> Janela contábil 18: 260.000/56.000 tokens estimados reservados; janela 17
> preservada em 590.000. Não representa reset de limite do provedor. O escopo
> termina no pacote aprovado; SQL, geração e workers de implementação são futuros.
> Os blocos de estado V2/C4 abaixo são históricos quando conflitarem com este.

> Execução da preparação V3: TASK-0023 consumiu a única continuação corretiva
> autorizada, agora 2/2, em instância Architect Astra/Medium separada. Quatro
> documentos de contrato/relatório foram reconciliados; a primeira execução
> `completed_incomplete` permanece no histórico. O estado do registro é
> `awaiting_human_review` conforme schema DEVAI, sem alegar PASS. O índice
> ativo é `prompts/C4-OD-V3-INDEX.md`, com matriz F1–F8 e allowlists nominais
> em `reports/CTG-0001-C4-OD-V3-*.md`; TASK-0026–0030 são futuras e
> `queued`. O gate pós-TASK-0023 é a revisão independente do candidato V3
> inteiro. A reserva de revisão já consta do budget; não há despacho de
> implementação nem teste DB executado nesta preparação.

> Retomada C4-OD (2026-09-16): Owner decidiu a política de prioridade e o sexto
> provider Clock; decidiu também `rait-secretary` para confirmar no protocolo
> mediante prova e `rait-coordinator` para correção/revogação excepcional.
> Emenda posterior do Owner fixou prova por documento/CNH (idade), documento
> validado pela secretaria (PCD), `none` default ao protocolo e qualificação
> definitiva, sem prova/invalidação posterior. A correção/revogação que mudaria
> o ordenamento fica superada. Validação jurídica dessas novas decisões foi
> atestada pelo Owner. O Owner também atestou a validação jurídica da
> equiparação PCD = 80+, encerrando esse gate específico; não há parecer
> consultado independentemente nem liberação técnica por essa atestação.
> Complemento vigente preserva o mecanismo auditável de revisão excepcional
> para eventual portaria futura, sem liberar seu uso sob a política atual.
> A idade é calculada no ato de qualificação, inclusive no fluxo postal;
> postagem ECT segue como marco cronológico/de tempestividade.
> Decisões registradas em ADR-0024/0025 e OD-016. O adendo
> `contracts/CTG-0001-C4-OD.md` e `reports/CTG-0001-C4-OD-PLAN.md` são
> **preparação proposta, não dispatch**. TASK-0023 permanece 1/1 incompleta;
> delta-review e retry são invalid-output, sem veredito. Nenhum limite foi
> reiniciado, nenhum worker corretivo foi iniciado e merge segue bloqueado.

> Preparação C4-OD V2 (2026-09-16): fechados para **revisão documental** o
> modelo assessment/basis, intake qualificado atomicamente no POST existente,
> política de revisão V1 vedada com capacidade futura preservada, upgrade
> incremental pre-DDL/pós-grants/verify, quarentena do legado, sexto Clock,
> transcrição RN-RAIT-141 e composição de prompts
> `prompts/C4-OD-V2-PROPOSED.md`. O detalhe técnico está na seção final de
> `contracts/CTG-0001-C4-OD.md`; partes anteriores permanecem históricas.
> **Nenhuma migração/geração/banco ou RED/GREEN ocorreu.** Há drift esperado entre
> catálogo de parâmetros transcrito e seed/derivados ainda não gerados.
> O pacote está sendo congelado para solicitar revisão independente, não para
> despachar workers: TASK-0023 1/1, delta-review inválido e budget permanecem.

> Autorização Owner posterior: exatamente uma revisão independente C4-OD-V2-1
> pelo Fable 5, reserva estimada 45.000/6.000 registrada antes da chamada em
> `budget.json`, na janela 17. Janela 16 permanece checkpoint histórico em
> 605.000/800.000 estimados; janela 17 passa a 545.000/800.000 nominalmente,
> incluindo linhas futuras ainda planejadas. Nenhum retry ou worker adicional
> foi autorizado. O veredito deve vir da ponte JSON válida e hashes conferidos;
> autorização não é PASS antecipado.

> Resultado da única revisão C4-OD-V2-1: ponte `claude-fable-5` exit 4 por
> JSON inválido. Nenhum veredito/bridge record foi produzido. O trecho de erro
> indica possível bypass de ordenamento via UPDATE de `protocolled_at`, mas não
> substitui revisão íntegra. Tentativa registrada como `invalid-output`; sem
> retry automático, worker, SQL ou RED/GREEN liberado. Novo envio exige decisão
> Owner e hashes atualizados.
> A pista sobre `protocolled_at` foi confirmada localmente no repositório gerado;
> o contrato/prompt V2 agora exigem imutabilidade no blueprint e no SQL e
> negativas HTTP/repositório/SQL. Essa correção posterior não recebeu revisão
> independente e invalida os hashes do prompt usado na tentativa anterior.

> Exceção ad hoc do Owner: executar uma revisão independente C4-OD-V2-SOL-1 com
> Sol/alto, apesar da regra ordinária de reviewer da família oposta. Esta exceção
> é somente desta chamada, após Fable 5 `invalid-output`; não altera a política
> geral nem ratifica o output inválido. Reserva 45.000/6.000 estimados registrada
> na janela 17 antes da chamada; total nominal da janela 590.000/800.000.
> Exigir saída JSON única validada por schema e checagem local antes de aceitar
> veredito. Nenhum worker ou merge liberado antecipadamente.

> Resultado C4-OD-V2-SOL-1: execução única `gpt-5.6-sol`/`high`, somente leitura,
> concluída com JSON válido no schema e veredito **FAIL**, oito achados `high`.
> Saída e identidade da chamada em `reviews/attempt-2/ctg-0001-c4-od-v2-sol-1.json`
> e `.record.md`. O candidato V2 não está despachável. O FAIL decorre, entre
> outros, da fronteira de SQL manual, da tríade em parser/testes e da ausência
> de barreira fail-closed verificável no upgrade. Não consumir nova revisão,
> iniciar workers, SQL ou merge por inferência; correções e novo gate exigem
> planejamento/autorizações próprios.

> Status vigente C4 (2026-09-16): Owner autorizou quarto ciclo, max_iterations=4.
> O bloco C3 abaixo é histórico. Dispatch vinculante: contracts/CTG-0001-C4.md;
> revisão independente de prompts → TASK-0023 Architect → revisão de delta →
> TASK-0024 documentação → TASK-0025 RLS → preflight → TASK-0020 iteração 4 →
> hashes → TASK-0021 iteração 4 → TASK-0022 → delivery-review independente.
> Sem PASS presumido. Janelas 16/17 reservadas C4; demais CTGs continuam bloqueados.
> Revisão C4-1: REVIEW, oito highs; preparação corrigida, aprovação ainda pendente.
> Revisão C4-2: REVIEW, oito highs técnicos fechados, mas a segunda revisão válida
> ocorreu sem autorização específica contabilizada previamente. Registrada no budget
> como governance-hold; não é PASS e não libera TASK-0023. Decisão Owner pendente.
> Decisão Owner de 2026-09-16: autoriza exatamente uma revisão substantiva C4-3,
> com reserva 45.000/6.000 tokens registrada antes da chamada; C4-2 continua
> REVIEW histórico. A revisão de delta pós-TASK-0023 mantém sua reserva própria.
> Revisão C4-3: PASS íntegro, sem achados, hashes do bridge verificados. Libera
> apenas TASK-0023 Architect; não autoriza RED/GREEN nem dispensa delta-review.
> TASK-0023 concluiu a matriz documental (1/1) e marcou B-LEGAL-PRIORITY e
> B-CLOCK-WIRING BLOCKED. Revisão independente do delta ainda pendente; RED
> e entrega C4 seguem bloqueados. TASK-0024/25 não resolvem esses bindings.
> Primeiro delta-review de TASK-0023 produziu JSON inválido (bridge exit 4), sem
> veredito. Um único retry técnico do mesmo prompt usa a reserva já planejada;
> a matriz e os bloqueios não foram alterados.
> O retry técnico também falhou por JSON inválido (bridge exit 4); ambos os
> outputs foram rejeitados antes de veredito/bridge record. Limite de retry
> esgotado. TASK-0024/25 e RED permanecem sem liberação; nova revisão ou
> correção de TASK-0023 1/1 exige decisão expressa do Owner.
> TASK-0024 limita-se à notação em prosa no UC draft, sem editar workflow/baseline.
> Clock permanece nos cinco providers; binding inviável bloqueia antes do RED.

## Decisions Ledger — C4-OD (Owner, 2026-09-16)

| ID                                 | Decisão vinculante                                                                                                                                                                                                                                             | Implicação e gate                                                                                                                                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-016 / ADR-0024                  | Após risco, PCD = 80+ > 60+ > ausência comprovada; desempate `protocolled_at`, `id`; bases comprovadas preservadas e maior nível usado. `legal_priority = null` é não apurado e excluído do `claim-next` até saneamento.                                       | A política é Owner, não conclusão legal. Parecer jurídico sobre precedência e `null` obrigatório antes de entrega/merge. Persistência multibase, provas, parâmetro e migração ainda precisam de desenho/revisão; não inferir fatos dos dados legados. |
| OD-016 / ADR-0024 — papéis         | `rait-secretary` registra requerimento/prova e confirma no protocolo mediante prova válida; `rait-coordinator` corrige ou revoga excepcionalmente com motivo e revisão auditável. Sem etapa ordinária do analyst nem ativação por mero anexo.                  | Gate jurídico inclui adequação dos papéis. Critérios de prova e tratamento de prova posterior ainda pendentes; nenhum CRUD genérico pode contornar confirmação/histórico. Não cria endpoint, grant ou fila.                                           |
| OD-016 / ADR-0024 — emenda vigente | Idade por data de nascimento em documento/CNH; PCD por documento anexado e validado pela secretaria no protocolo; sem comprovação = `none` default após protocolo. Não há prova nova/invalidação posterior nem requalificação do ordenamento pelo coordenador. | Owner atesta validação jurídica desta emenda. `null` só não apurado antes do protocolo; precedência PCD = 80+ ainda exige gate próprio. Fechar idade no fluxo postal, persistência, migração e proteção pós-protocolo antes de execução.              |
| OD-016 / ADR-0024 — complemento    | Preservar mecanismo auditável de correção/revogação excepcional pelo coordenador para eventual portaria, mas vedar requalificação pós-protocolo sob a política atual. Idade calculada no ato de qualificação, inclusive postal.                                | Ativação futura exige norma e política autorizada/versionada; não presumir portaria. ECT segue como marco cronológico/tempestividade. Fechar controle técnico da política, persistência e migração.                                                   |
| OD-016 / ADR-0024 — jurídico       | Owner atesta que o jurídico validou a igualdade de nível PCD = 80+.                                                                                                                                                                                            | Gate jurídico específico encerrado por atestação do Owner; não equivale a parecer consultado independentemente, não fecha outros gates LEGAL e não libera dispatch técnico.                                                                           |
| OD-R7-CLOCK-001 / ADR-0025         | Sexto provider explícito de Clock pelo blueprint/geração oficial; um instante por operação e dia civil derivado do fuso IANA do tenant; mesma captura no motor e comandos; falta de provider/fuso válido falha antes de escrita.                               | Substitui apenas a restrição anterior de cinco providers. Revisar bindings, allowlists e DI negativa de seis; não editar gerado manualmente nem usar relógio ambiente nos serviços.                                                                   |
| OD-R7-SQL2-WAIVER / ADR-0026       | Dispensa de entrega apenas para o high SQL2 de elegibilidade legada em `claim-next`; parecer SQL2 permanece REVIEW. TASK-0036/37 canceladas sem dispatch. Escala futura: maestro Sol, Architect Sol, Inspector/Engineer Terra, Terra anterior Luna; sem Astra. | Avanço é OWNER-ACCEPTED-WITH-WAIVER nos bytes SQL2, não PASS independente nem conformidade com ADR-0024. Fixture/DB/segurança/integração continuam obrigatórios; registrar risco residual no delivery-review/PR.                                      |

As menções a gate jurídico pendente nas linhas anteriores deste ledger registram
o estado da respectiva emenda; a linha jurídica mais recente prevalece para
PCD = 80+. O fechamento não altera bloqueios técnicos ou limites de execução.

O preparo técnico candidato propõe duas relações de apuração/bases, mas está
**não despachável**: a proposta de revisões deve preservar capacidade futura
sem liberar seu uso sob a política atual. O boundary de protocolo, enforcement
da vedação vigente e via oficial de upgrade ainda não estão delimitados. Se adotado,
o inventário RLS candidato muda de 88 para 90; a expectativa 88 continua
vigente até revisão explícita do modelo e do sensor. O budget atual não inclui
nem autoriza o incremento futuro estimado no relatório C4-OD. A autorização de
preparo não autoriza elevar TASK-0023 de 1 para 2, nova revisão independente,
RED/GREEN, commit, PR ou merge.

**Status vigente:** Owner autorizou terceiro ciclo de TASK-0020/TASK-0021 após aceitação parcial
da iteração 2. CTG §10.10 prepara Inspector Sol/high → recongelamento → Engineer Sol/high →
TASK-0022 Astra/medium → delivery-review. max_iterations=3; histórico de duas iterações preservado.
Nenhuma terceira execução é declarada por esta preparação. O Owner fechou
`RG-FJ0-EMPTY` por
`OD-R7-FJ0-001`: F-J-0 é fail-closed, exige ao menos uma evidência TEAT válida e todas as
`mandatory=true`; ausência total bloqueia `remit`. Histórico de tentativas/reviews preservado.
Não houve commit/PR/merge desta CTG.
Reviewer: Opus 5 via `tools/orchestra/bridge.sh claude`.
**Concorrência:** abre com `origin/main` ≥ 80d705a; merge por grupo acoplado — CTG-0001 (`DetranError` e case): nenhum upstream — mesclar cedo, R-0008 o consome. CTG-0002 (worklist/session) e CTG-0004 (org/collection/integrations/SSE/contratos): `rait-model` R-0006 (`orchestra/rait-model`). CTG-0003 (infração, consumidores, timers): R-0006 e `ops-agency` R-0005 (`orchestra/ops-agency`, evento `AIT_INTEGRADO`).
**Janelas previstas:** 15 (planejamento/review original, execução e escaladas históricas, uma janela
de recuperação C3 de CTG-0001 e três janelas posteriores de entrega;
cada grupo acoplado é um PR).

## Metas

1. **Comandos por módulo** em `src/handwritten/` (rait-build-pack WP-B, tabela por módulo):
   - `rait-case`: `POST cases/{id}/commands/{admit|non-admission|remit|receive|ready|decide|return-draft|withdraw|redirect|resolve-pending}`;
     `POST pools/{id}/claim-next`; `POST inquiries/{id}/commands/{answer|extend|expire}`.
   - `rait-worklist`: `POST batches`, `…/draw`, `…/approve`, `…/items/{caseId}/{accept|impediment}`;
     `POST assignments/{id}/commands/reassign`; `PATCH clock-alerts/{id}`; `POST schedules` + `…/publish`;
     `POST units` + `…/activate`.
   - `rait-session`: `POST sessions/{id}/commands/{close-agenda|open|adjourn|convene-extraordinary}`;
     `POST agenda-items/{id}/commands/{read|view|withdraw|proclaim}`; `POST votes`; `POST minutes`, `…/sign`, `…/publish`.
   - `infraction`: `POST infractions/{id}/commands/{issue-notice|indicate-driver|declare-extinction|authority-appeal|waive-appeal}`;
     consumidores de eventos (`AIT_INTEGRADO`, `RAIT_*`, `PAGAMENTO_CONFIRMADO`); **motor de timers**
     (job idempotente sobre `@detran/inf-deadlines`, calendário, `rait-deadline-engine.md`).
   - `org`/`finance`: `POST suspension-acts`; `POST jeton-sheets` + `…/approve`; `POST exports` + `…/approve`;
     `POST collection-documents`; `POST payments/reconcile`; `POST refund-orders`; `POST debt-handoffs`
     (`PUT parameters/{key}` já existe desde R-0004 em `ops/parameter`).
   - `integrations`: `GET integrations/outbox`, `POST integrations/outbox/{id}/retry`, `POST integrations/reconciliations`.
   - `stream`: `GET /v1/inf/rait/stream` (SSE; eventos de `rait-events-sse-contract.md`).
     Cada endpoint: `@Resource('inf:rait-<recurso>') @Action('<verbo>') @Audit(...)`, guarda de estado
     (`infraction_transition_ref` / tabela de transições do caso), `If-Match`/`ETag`, `Idempotency-Key`,
     erros do `rait-error-catalog.md`, envelope `StynxError` → `DetranError` compartilhado com prefixo
     por app (`backend/domains/shared/src/errors/`; o TEAT reutiliza em R-0008).
2. **Política**: `RAIT_COMMAND_RULES` cobre 100 % dos pares recurso/ação acima; teste
   `policy-routes.e2e.spec.ts` (rota ⇔ regra, nos dois sentidos) em `backend/app/tests/e2e/`.
3. **Contratos de comando** (WP-C), com os ids canônicos dos blueprints existentes:
   `BP-INF-RAIT-CASE-001.commands.openapi.json`, `BP-INF-RAIT-WORKLIST-001.commands.openapi.json`,
   `BP-INF-RAIT-SESSION-001.commands.openapi.json`, `BP-INF-INFRACTION-001.commands.openapi.json`,
   `BP-INF-RAIT-ORG-001.commands.openapi.json`, `BP-INF-COLLECTION-001.commands.openapi.json` e
   `BP-INF-RAIT-INTEGRATION-001.commands.openapi.json`,
   com `requestBody` (schema, obrigatoriedade, enums por FK de referência), `responses` (200 recurso +
   `events[]`; 4xx com `code` enumerado do catálogo), headers, exemplos válidos e inválidos (ids das fixtures).
4. **Gates novos** (fecham as lacunas de `orchestra/README.md` §9): `tools/contracts/check-commands.mjs`
   (valida os `.commands.openapi.json` contra os controladores manuscritos e o catálogo de erros) ligado
   a `pnpm contracts:check`; script `contracts:clients` (`openapi-typescript` como devDependency
   raiz, saída em `packages/api-clients/` ou pasta equivalente decidida na TASK-0001) que gera sem erro.
5. Documentação: `rait-build-pack.md` §WP-B/§WP-C executados (gates reescritos com os comandos reais);
   `rait-web-frontend.md` §11 (pré-requisitos de release) atualizado; backlog.

## Tarefas

### Recuperação de entrega C3 — decomposição ativa de CTG-0001

Aliases de arquivo D1 mapeiam a IDs válidos do schema DEVAI 1.4.5: TASK-0001-D1 = TASK-0019;
TASK-0002-D1 = TASK-0020; TASK-0003-D1 = TASK-0021; TASK-0004-D1 = TASK-0022. Filenames pedidos
permanecem; id/upstream_task_id e compositions usam IDs numéricos. Schema proíbe sufixos no ID.

Esta seção é o dispatch vigente após o FAIL de entrega. TASK-0001…0004 e tarefas S* abaixo
permanecem histórico; os CTGs posteriores preservam seu escopo, mas só desbloqueiam quando
TASK-0004-D1, delivery-review e merge de CTG-0001 estiverem concluídos. Não recriar/apagar histórico.

| Tarefa       | Papel                      | Fronteira                                                                                            | Dependência                   | Saída verificável                                                                    |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| TASK-0001-D1 | Architect                  | CTG-0001.md                                                                                          | audit do FAIL                 | contrato §10 fechado e lacunas delimitadas; DI/modelo/precedência/documentos/eventos |
| PREP-CTG1-D1 | Maestro Architect/Engineer | BP-INF-RAIT-CASE-001 e gerados/DB dedicado                                                           | D1 + prompt-review            | modelo aditivo exato §10.3, conexões STYNX reais e prova de role                     |
| TASK-0002-D1 | Inspector                  | sensores case/shared/app e fixtures de teste especificados no prompt                                 | PREP                          | RED por finding, PostgreSQL role_app_backend e HTTP com política real                |
| TASK-0003-D1 | Engineer                   | fontes handwritten/shared e adapters app, com composição limitada aos registros explícitos do prompt | D2 com hashes recongelados    | runtime integral sem fail-open; sensores intactos                                    |
| TASK-0004-D1 | Architect                  | hooks/descrição/versionamento blueprint e gerados oficiais                                           | D3 integral + gaps resolvidos | candidato com gates completos, pronto para delivery-review independente              |

Por decisão do Owner, as próximas chamadas usam Sol/alto para Inspector e Engineer e Astra/médio
para Architect; TASK-0019 permanece Terra/alto como histórico concluído. Nenhum worker escreve em
paralelo com outro nem com PREP. `iteration_count=0` identifica tarefa nova, não reinicia limites
de reviews/campanha. Maestro atualiza budget/contadores conforme autorização vigente; esta
materialização não os altera. Relatório: `reports/CTG-0001-C3-PLAN.md`.

PREP incrementa patch, descreve versão vigente, adiciona answered_on/dias de recebimento,
relações inquiry/document e pending/document e atestado de withdrawal exatamente em CTG §10.3;
não adiciona CRUD/grants para tabelas internas. Roda geradores oficiais, sincroniza lock somente
se manifesto realmente exigir e prepara banco dedicado com fixture sem backfill inventado.
Workers não instalam dependências. Nenhum serviço pode executar em owner. DETRAN_TEST_DATABASE_URL
sozinho não configura o app: STYNX_OWNER/APP/READER_DATABASE_URL e DATABASE_URL devem ser explícitos,
com current_database/current_role demonstrados pelo sensor que chama o comando.

OD-R7-FJ0-001 fecha RG-FJ0-EMPTY: o Inspector deve provar ausência total, um vínculo válido,
obrigatório ausente/inválido e múltiplos obrigatórios; o Engineer implementa o mesmo comportamento
fail-closed. `mandatory=false` não torna conjunto vazio completo. UC-RAIT-017 e steering §H.58
registram a autoridade; prompts/hashes C3 foram recompostos antes do prompt-review.

### Decomposição anterior e demais CTGs

A tabela abaixo registra a decomposição do reinício e os CTGs posteriores. Para CTG-0001, a
recuperação C3 acima prevalece sobre instruções antigas de recriação ou dispatch.

| Tarefa       | CTG      | Papel     | Perfil              | Modelo/esforço | Locks                                                                                                                                                                                  | Depende de                                   | Entrega                                                                                                                        |
| ------------ | -------- | --------- | ------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| TASK-0001    | CTG-0001 | Architect | architect-blueprint | Terra / alto   | `MOD-contract-case`                                                                                                                                                                    | —                                            | contrato `DetranError`, comandos/guardas do caso e formato de OpenAPI/checker/client; descreve hooks, mas não altera blueprint |
| TASK-0002    | CTG-0001 | Inspector | inspector-tests     | Terra / alto   | `MOD-rait-case-tests`, `MOD-shared-policy-tests`, `MOD-shared-document-tests`                                                                                                          | TASK-0001 + PREP-CTG1-DEPS + PREP-CTG1-MODEL | sensores executáveis para toda guarda/efeito/DI/SQL/confiança documental e matriz de política                                  |
| TASK-0003    | CTG-0001 | Engineer  | engineer-backend    | Terra / alto   | `MOD-shared-errors`, `MOD-shared-documents`, `MOD-rait-case`, `MOD-shared-policy`, `MOD-root-scripts`                                                                                  | TASK-0002                                    | `DetranError`, confiança documental fail-closed, runtime transacional, política e gate raiz                                    |
| TASK-0004    | CTG-0001 | Architect | architect-blueprint | Luna / baixo   | `MOD-bp-rait-case`, `MOD-generated-tree`                                                                                                                                               | TASK-0003                                    | aplica somente os hooks contratados de `BP-INF-RAIT-CASE-001`, regenera e prova typecheck/gates                                |
| TASK-0004-S1 | CTG-0001 | Inspector | inspector-tests     | Terra / alto   | `MOD-parameter-verifier-tests`                                                                                                                                                         | TASK-0004                                    | regressão sintática do verificador preserva desconhecido fail-closed e exclui evento/i18n                                      |
| TASK-0004-S2 | CTG-0001 | Engineer  | engineer-tooling    | Terra / alto   | `MOD-parameter-verifier`, `MOD-parameter-catalogue-contract`                                                                                                                           | TASK-0004-S1                                 | classificador sintático corrige falsos positivos sem allowlist nem relaxamento global                                          |
| TASK-0005    | CTG-0002 | Architect | architect-blueprint | Sol / médio    | `MOD-contract-worklist-session`                                                                                                                                                        | CTG-0001                                     | contratos e guardas de worklist/session; descreve hooks, sem alterar blueprints                                                |
| TASK-0006    | CTG-0002 | Inspector | inspector-tests     | Terra / alto   | `MOD-rait-worklist-tests`, `MOD-rait-session-tests`, `MOD-shared-policy-tests`                                                                                                         | TASK-0005                                    | testes de distribuição/sessão e matriz positiva/negativa em `policy.spec.ts`                                                   |
| TASK-0007    | CTG-0002 | Engineer  | engineer-backend    | Terra / alto   | `MOD-rait-worklist`, `MOD-rait-session`, `MOD-shared-policy`, `MOD-root-scripts`                                                                                                       | TASK-0006                                    | arquivos manuscritos, política e inclusão de worklist/session no gate raiz                                                     |
| TASK-0008    | CTG-0002 | Architect | architect-blueprint | Sol / médio    | `MOD-bp-rait-worklist`, `MOD-bp-rait-session`, `MOD-generated-tree`                                                                                                                    | TASK-0007                                    | aplica hooks contratados dos dois blueprints, regenera e prova typecheck/gates                                                 |
| TASK-0009    | CTG-0003 | Architect | architect-blueprint | Sol / médio    | `MOD-contract-infraction`                                                                                                                                                              | CTG-0002                                     | contrato da máquina, comandos, consumidores e timers; descreve hooks sem alterar blueprint                                     |
| TASK-0010    | CTG-0003 | Inspector | inspector-tests     | Terra / alto   | `MOD-inf-infraction-tests`, `MOD-inf-deadlines-tests`, `MOD-shared-policy-tests`                                                                                                       | TASK-0009                                    | testes de comandos, eventos, sweep e matriz positiva/negativa da infração                                                      |
| TASK-0011    | CTG-0003 | Engineer  | engineer-backend    | Terra / alto   | `MOD-inf-infraction`, `MOD-inf-deadlines`, `MOD-shared-policy`, `MOD-root-scripts`                                                                                                     | TASK-0010                                    | arquivos manuscritos, consumidores, timer job, política e gate de integração                                                   |
| TASK-0012    | CTG-0003 | Architect | architect-blueprint | Sol / médio    | `MOD-bp-infraction`, `MOD-generated-tree`                                                                                                                                              | TASK-0011                                    | aplica hooks de `BP-INF-INFRACTION-001`, regenera e prova typecheck/gates                                                      |
| TASK-0013    | CTG-0004 | Architect | architect-blueprint | Sol / médio    | `MOD-contract-org-collection-integration`                                                                                                                                              | CTG-0003                                     | contratos org/collection/integration/SSE; descreve hooks sem alterar blueprints                                                |
| TASK-0014    | CTG-0004 | Inspector | inspector-tests     | Terra / alto   | `MOD-rait-org-tests`, `MOD-collection-tests`, `MOD-rait-integration-tests`, `MOD-rait-stream-tests`, `MOD-shared-policy-tests`, `MOD-policy-routes-tests`, `MOD-command-checker-tests` | TASK-0013                                    | testes funcionais; `policy.spec.ts`; `policy-routes.e2e.spec.ts`; sensores fail-closed do checker/client                       |
| TASK-0015    | CTG-0004 | Engineer  | engineer-backend    | Terra / alto   | `MOD-rait-org`, `MOD-collection`, `MOD-rait-integration`, `MOD-rait-stream`, `MOD-shared-policy`, `MOD-app-wiring`, `MOD-root-scripts`                                                 | TASK-0014 + PREP-WIRING                      | arquivos manuscritos, SSE, política e wiring completo do app/gates                                                             |
| TASK-0016    | CTG-0004 | Architect | architect-blueprint | Sol / médio    | `MOD-bp-rait-org`, `MOD-bp-collection`, `MOD-bp-rait-integration`, `MOD-generated-tree`                                                                                                | TASK-0015                                    | aplica hooks dos três blueprints, regenera e prova typecheck/gates                                                             |
| TASK-0017    | CTG-0004 | Engineer  | engineer-backend    | Terra / alto   | `MOD-contracts-commands`, `MOD-tools-contracts`, `MOD-api-clients`, `MOD-package-json`                                                                                                 | TASK-0016 + PREP-DEPS                        | sete contratos canônicos, checker e clientes; passa TASK-0014 sem editar testes/lockfile                                       |
| TASK-0018    | CTG-0004 | Architect | transcriber-docs    | Sol / médio    | `MOD-docs`                                                                                                                                                                             | TASK-0017                                    | transcrição de fechamento no build pack, frontend §11 e backlog                                                                |

CTG-0001 = TASK-0001…0004; CTG-0002 = TASK-0005…0008; CTG-0003 = TASK-0009…0012;
CTG-0004 = TASK-0013…0018. Cada CTG mantém Architect → Inspector → Engineer; a última tarefa
`architect-blueprint` é apenas integração mecânica dos hooks já contratados, depois que seus alvos
manuscritos existem. Só então o grupo roda os gates integrais, passa por delivery-review, commit,
evidência, PR e merge. Tarefas que compartilham `MOD-generated-tree`, `MOD-shared-policy-tests`,
`MOD-shared-policy` ou `MOD-root-scripts` nunca rodam em paralelo.

### Preparação exclusiva do maestro — `PREP-DEPS`

Após TASK-0016 e antes de TASK-0017, o maestro atua como Engineer e:

1. consulta o registry autenticado para resolver uma versão exata vigente de `openapi-typescript`,
   registra versão e evidência no relatório/checkpoint e não inventa pin;
2. executa `pnpm add -D -w openapi-typescript@<versão-exata>` e deixa exclusivamente o pnpm
   atualizar `package.json` e `pnpm-lock.yaml`;
3. roda `pnpm install --frozen-lockfile`, `pnpm check` e os sensores do checker;
4. faz commit `chore(deps)` separado dentro de CTG-0004. Workers continuam proibidos de instalar
   pacotes e TASK-0017 não toca `pnpm-lock.yaml`.

### Preparação exclusiva do maestro — `PREP-CTG1-DEPS`

Após TASK-0001 e antes de TASK-0002, o maestro atua como Architect/Engineer e:

1. acrescenta em `docs/framework/blueprints/BP-INF-RAIT-CASE-001.json`, de forma blueprint-first,
   `@detran/inf-deadlines: workspace:*` em `module.dependencies` e o testAlias
   `@detran/inf-deadlines -> ../deadlines/src/index.ts` em `module.testAliases`;
2. incrementa patch do blueprint, formata-o e roda `pnpm blueprints:generate` e
   `pnpm contracts:openapi`; somente os geradores atualizam manifesto, `vitest.config.ts`, contrato
   OpenAPI e demais saídas registradas;
3. executa `pnpm install` para o pnpm atualizar apenas `pnpm-lock.yaml` e links, seguido de
   `pnpm install --frozen-lockfile`, `pnpm blueprints:check`, `pnpm contracts:check` e typecheck do
   pacote;
4. preserva a mudança para o commit de CTG-0001. TASK-0002 recebe o alias fonte e TASK-0003 recebe a
   dependência pronta; ambos continuam proibidos de instalar pacotes, tocar o blueprint/gerados ou
   reimplementar cálculo de prazo.

### Preparação exclusiva do maestro — `PREP-CTG1-MODEL`

Após a emenda de TASK-0001 receber `PASS` do reviewer e antes de reabrir TASK-0002, o maestro atua
como Architect/Engineer e aplica somente os deltas de modelo expressamente contratados:

1. `BP-INF-RAIT-CASE-001`: aplica literalmente CTG-0001 §8 — `agency_jurisdiction_id` no caso,
   constraints estruturais da minuta submetida e constraints de assinatura da decisão, além das
   dependências/aliases fechadas; a evidência PAdES/TSA continua externa e é verificada pela porta
   documental concreta, não por tabela inventada;
2. `BP-INF-RAIT-WORKLIST-001`: inclui o token canônico `autoridade` em `member_role`, acrescenta
   `agency_jurisdiction_id uuid` com FK e obrigatoriedade condicional, e mantém `jurisdiction`
   textual somente por compatibilidade; a lista nominal das 55 autoridades continua dado cadastral
   pendente, não fixture inventada;
3. incrementa patch dos blueprints, formata e roda `pnpm blueprints:generate` e
   `pnpm contracts:openapi`; somente o gerador altera DDL, código e OpenAPI gerados;
4. executa `pnpm install` para resolver manifesto/lockfile e links workspace, seguido de
   `pnpm install --frozen-lockfile`;
5. aplica os DDLs vigentes a um banco de teste dedicado, roda checks de blueprint/contratos,
   typecheck de case/worklist e integração. Nenhuma migração destrutiva é autorizada.

`claim-next` é exceção explícita a `If-Match`: `rait_pool` não possui `version`; concorrência é
serializada pelo ledger de idempotência e seleção `FOR UPDATE SKIP LOCKED`, e a resposta usa o ETag
do caso selecionado pós-mutação.

### Ciclo corretivo autorizado — `CTG-0001-C2`

- O reset humano zera `iteration_count` e `max_iterations` operacionais de TASK-0002/TASK-0003;
  relatórios, triagem e artefatos anteriores permanecem como evidência histórica.
- TASK-0002 deve substituir cobertura aparente por sensores comportamentais: cada linha da tabela do
  contrato CTG-0001 precisa de sucesso, guardas negativas, efeito atômico, cardinalidade de outbox e
  auditoria, além de DI Nest concreta, RLS e semântica SQL/ordenação de `claim-next`.
- TASK-0003 deve usar `@Injectable()`, `Database`, `RequestContext`, `Transaction` e
  `withTenantContext`; interfaces TypeScript apagadas em runtime não são tokens de DI. Autorização
  estática fica no `PolicyGuard`/decorators e nenhum papel, ator ou tenant vem do payload.
- SQL deve seguir literalmente DDL 04, 12, 34 e 35. `claim-next` resolve e bloqueia primeiro o item
  elegível do pool, só então o caso selecionado; nunca interpreta `poolId` como `caseId`.
- PREP-CTG1-DEPS ocorre antes do Inspector e materializa dependência e alias via blueprint/gerador.
- `T-REM10` e `T-DIL` são calculados/alterados exclusivamente por `@detran/inf-deadlines`, via
  adaptadores transacionais reais. Nenhuma aritmética de prazo local é permitida.
- O prompt-review corretivo é gate obrigatório antes do novo dispatch. Um teste verde que não
  exercite a guarda/effecto não satisfaz o contrato.
- Prompt-review corretivo ciclo 1: `REVIEW`; corrigidos dependência gerada e alias Vitest ao mover
  PREP-CTG1-DEPS para antes do Inspector e torná-lo blueprint-first.
- Prompt-review corretivo ciclo 2: `PASS`; PREP-CTG1-DEPS executado com blueprint v1.1.1,
  dependência/alias gerados, OpenAPI sincronizado, lockfile resolvido e gates do PREP verdes.
- TASK-0002 corretiva tentativa 1: dois sensores válidos adicionados, mas somente 36 casos unitários
  e a matriz integral de guardas/efeitos permaneceu ausente; `sensor-error`, retry 1 aberto sem
  liberar o Engineer.
- TASK-0002 corretiva retry 1: 91 sensores foram adicionados, mas cenários distintos reutilizam
  entradas/respostas idênticas e exigem erros incompatíveis; cardinalidade de eventos e metadata de
  DI também contradizem o contrato. `sensor-error`; escalada Astra/alto aberta para corrigir os
  cenários sem reduzir cobertura.
- TASK-0002 corretiva escalada 1: os cenários falsos foram removidos/corrigidos, mas a inspeção
  encontrou seis lacunas upstream no contrato/modelo; encerrada como `reference-gap`, sem liberar
  TASK-0003. TASK-0001 foi reaberta e PREP-CTG1-MODEL passa a anteceder o novo Inspector.

### Preparação exclusiva do maestro — `PREP-WIRING`

Após TASK-0014 e antes de TASK-0015, o maestro atua como Engineer e:

1. adiciona ao importer `backend/app` exclusivamente as dependências workspace
   `@detran/inf-infraction`, `@detran/inf-deadlines`, `@detran/inf-notification`,
   `@detran/inf-rait-org`, `@detran/inf-collection` e `@detran/inf-rait-integration`, todas com
   protocolo literal `workspace:*`, por comando `pnpm --filter @detran/app add`;
2. deixa exclusivamente o pnpm atualizar `backend/app/package.json`, `pnpm-lock.yaml` e os links
   do workspace; não altera `AppModule`, aliases Vitest ou código de produto;
3. roda `pnpm install --frozen-lockfile` e confirma resolução dos seis pacotes;
4. faz commit `chore(deps)` separado dentro de CTG-0004. TASK-0015 recebe os links prontos e
   continua proibida de instalar pacotes ou tocar o lockfile.

### Regras obrigatórias para recompor tasks e prompts

- **Gerados:** cada Architect pode tocar somente os blueprints de seu CTG e os resultados produzidos
  pelos comandos de geração. A seção `Não pode tocar` declara explicitamente essa exceção; ninguém
  edita `index.ts`, `*.module.ts`, controllers, services, repositories, DDL ou OpenAPI gerado à mão.
- **Hooks just-in-time:** o primeiro Architect do CTG apenas contrata os hooks; o Engineer cria
  seus alvos manuscritos; o segundo Architect aplica a mudança mínima de blueprint e regenera.
  `pnpm blueprints:check`, typecheck do pacote e `pnpm check` fecham o grupo.
- **Sensores de política:** somente Inspector escreve `backend/domains/shared/src/policy.spec.ts` e
  `backend/app/tests/e2e/policy-routes.e2e.spec.ts`; cada par testa todos os grants positivos e a negativa
  de cada papel canônico omitido, preservando literalmente OD-309.
- **Implementação:** Engineers escrevem `policy.ts` e runtime, nunca os sensores. Cada prompt lista
  caminhos reais completos; expressões como `src/controllers gerados` não são fronteiras válidas.
- **Wiring:** PREP-WIRING atualiza manifest/lockfile e materializa os links workspace antes de
  TASK-0015; TASK-0015 inclui aliases Vitest, `AppModule` e scripts raiz, fechando typecheck/build e
  testes diretos. TASK-0016 aplica os hooks e então fecha e2e do app, `pnpm backend:test:ci` e
  `pnpm check`, sem tolerar teste vermelho intermediário como PASS.
- **Contratos:** os nomes são os sete ids canônicos da Meta 3. TASK-0014 escreve primeiro os testes
  do checker/client; TASK-0017 implementa e não cria nem altera `policy-routes.e2e.spec.ts`.
- **Relatórios:** TASK-0018 só referencia relatórios já produzidos; o maestro deve gravá-los antes
  de seu dispatch.

## Critérios de aceitação (comandos → resultado)

- `pnpm verify:decorators` → OK (todo comando com `@Resource/@Action/@Audit`).
- `pnpm --filter @detran/shared test` → verde, incluindo `policy.spec.ts` escrito pelos Inspectors
  com 100 % dos pares `inf:rait-*:<verbo>`, grants positivos e negativas para todo papel omitido;
  `pnpm backend:test:e2e` inclui `policy-routes.e2e.spec.ts` bidirecional escrito por Inspector.
- Testes unitários e de integração dos sete módulos → verdes; o script raiz
  `backend:test:integration` enumera case, worklist, session, infraction, org, collection e
  rait-integration; `pnpm backend:test:ci` prova todos os tiers.
- `pnpm contracts:check` → OK com os `.commands.openapi.json`; `pnpm contracts:clients` → gera sem erro.
- `pnpm --filter @detran/app typecheck` e `pnpm --filter @detran/app build` → verdes em TASK-0015;
  `pnpm --filter @detran/app test:e2e` e `pnpm backend:test:ci` → verdes após TASK-0016 aplicar
  os hooks gerados.
- `pnpm verify:senatran-boundary` → OK (integrações só via `packages/senatran-adapter`).
- `pnpm check` → verde; `node tools/docs/kb/check.mjs` → 521/446.

## Mapa entregável → definições

| Entregável | Definição                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| comandos   | `rait-web-frontend.md` §7 (33 ações) e §11; [UC-RAIT-001…043]; [WF-RAIT-001] (caso), [WF-RAIT-003] (sessão), [WF-RAIT-004] (organização) |
| infração   | [WF-INF-003] §2 (`infraction_transition_ref`); [WF-INF-002] §9.2; ADR-0014/0016                                                          |
| prazos     | `rait-deadline-engine.md`; steering H.46/H.47; `parameter-catalogue.md`                                                                  |
| financeiro | ADR-0017; UC-RAIT-032…035; H.53                                                                                                          |
| erros      | `rait-error-catalog.md` (§1 envelope, §3–§4 por comando)                                                                                 |
| SSE        | `rait-events-sse-contract.md`                                                                                                            |
| payloads   | `rait-build-pack.md` §0 "Convenções de payload"; contratos OpenAPI gerados em `docs/framework/contracts/`                                |
| política   | `policy.ts` `RAIT_COMMAND_RULES`/`RAIT_SURFACE_RULES`; ADR-0015                                                                          |

## Riscos

- Frente longa: cada CTG é um PR mesclável por si; o maestro grava `checkpoint` ao fim de cada janela.
- `policy.ts` é lock com `teat-backend` (R-0008, onda 3): as duas frentes só tocam blocos distintos
  (`RAIT_*` × `TEAT_RULES`/`OPS_SURFACE_RULES`); a segunda a mesclar rebaseia.
- `DetranError` nasce aqui e é consumido por R-0008: publicar em `@detran/shared` no CTG-0001 e
  mesclar cedo.
- Nunca calcular prazo fora de `@detran/inf-deadlines` ([RN-RAIT-005]).

## Concorrência

Bootstrap de 2026-09-15 em `df1e1769941e527a07b6db7550aee84068f3a872`:

- R-0006/`rait-model` está integralmente em `main` por PRs #39, #43 e fechamento #46.
- `ops-agency` está integralmente em `main` até o PR #45; `AIT_INTEGRADO` está disponível.
- CTG-0001, CTG-0002, CTG-0003 e CTG-0004 estão liberados; nenhuma base empilhada é necessária.
- A frente vizinha `teat-backend` pode tocar `policy.ts`; esta frente mantém o bloco `RAIT_*`,
  integra avanços de `main` antes de cada PR e repete os gates do grupo.
- Worktree reutilizável/criado em `/Volumes/Thiamat II/stech/detran-worktrees/rait-backend`, branch
  ainda não publicada `orchestra/rait-backend`, baseada no `origin/main` exato acima.

## Bloqueios

**Falha histórica corrigida no plano, ainda não revalidada.** O gate Opus válido em
`reviews/prompt-review-1-retry.json` levantou oito achados `high`:

1. `policy-routes.spec.ts` foi atribuído ao Engineer TASK-0010, violando a tríade; deve nascer
   em tarefa Inspector.
2. TASK-0001 contradiz a própria fronteira ao permitir regeneração e proibir `backend/**`.
3. Hooks manuscritos de CTGs futuros em TASK-0001 quebrariam o typecheck/mesclabilidade de CTG-0001;
   cada CTG precisa de etapa Architect antes do respectivo Engineer.
4. Nenhum Inspector pode escrever a matriz exaustiva em
   `backend/domains/shared/src/policy.spec.ts`.
5. TASK-0009 não inclui `backend/app/package.json` e `backend/app/vitest.config.ts` para montar
   os novos módulos nem exige o typecheck do app.
6. TASK-0010 exige `openapi-typescript` ausente, mas proíbe instalação; instalação/lockfile precisa
   ficar no maestro ou ser excepcionalmente autorizada.
7. Os nomes canônicos são `BP-INF-INFRACTION-001.commands.openapi.json` e
   `BP-INF-COLLECTION-001.commands.openapi.json`, não as variantes RAIT/FINANCE.
8. `backend:test:integration` não inclui case/worklist/session; a tarefa de wiring precisa ajustar
   o script antes de afirmar `backend:test:ci`.

Os oito itens estão endereçados pela nova decomposição, por `PREP-DEPS` e pelas regras obrigatórias
acima. Isso remove o bloqueio de desenho, mas não substitui o próximo prompt-review: nenhum worker
pode ser disparado até o novo conjunto receber `PASS`. Nenhum arquivo de produto foi alterado.

**Bloqueio superado por autorização humana.** A emenda de `reference-gap` recebeu
`REVIEW` nos ciclos 1 e 2. O ciclo 2 confirmou os oito achados anteriores como fechados e encontrou
um único high novo: a conversão de negativa no `PolicyGuard` havia sido ampliada indevidamente a
todos os domínios. O contrato e os prompts já foram corrigidos para aplicar
`RAIT.FORBIDDEN_ACTION` somente a recursos `inf:rait-*`, preservar os demais domínios e cobrir isso
em `policy.guard.spec.ts`. O Owner autorizou explicitamente o terceiro ciclo e reiniciou seu limite;
PREP-CTG1-MODEL e o dispatch do Inspector continuam condicionados ao `PASS` desse gate.

## Retomada

Checkpoint histórico de 2026-09-15, janela 12, anterior à adjudicação §10.9:

- delivery-review técnico de CTG-0001 = `FAIL`; 15 highs e oito gaps adicionais foram preservados
  nos relatórios, sem commit;
- OD-R7-FJ0-001 fechou RG-FJ0-EMPTY com semântica fail-closed literal;
- recuperação C3 materializada em TASK-0019…TASK-0022; C3-1 = `REVIEW`, C3-2 = `PASS` sem high;
- janela 9 encerrada em 600k/800k; janelas 10/11 históricas não serão reutilizadas; janela 12 está
  em 80k/800k antes de TASK-0019;
- campanha em 5.310k de entrada e 696k de saída estimadas, igual à soma nominal do budget;
- TASK-0019, PREP-CTG1-D1 e TASK-0020 concluídos; blueprint 1.1.5, geração e banco dedicado
  passaram; sensores reais estão congelados em `reports/TASK-0020-D1.md`;
- próximo passo: implementar TASK-0021, fechar TASK-0022 e
  repetir delivery-review/gates;
- após CTG-0001, CTG-0002, CTG-0003 e CTG-0004 foram realocados para janelas 13, 14 e 15.

## Triagem

- TASK-0002 tentativa 1: `sensor-error` — os testes novos inspecionavam substrings de fonte e
  materializavam apenas sete casos próprios, sem executar a matriz comportamental exaustiva do
  contrato; retry 1 solicitado ao Inspector, sem autorização para tocar runtime.
- TASK-0003 tentativa 1: `plant-bug` — controllers contratados ausentes e serviços implementados
  com estado global/mapas por UUID/sufixo de fixtures, em vez de portas transacionais e persistência
  RLS; retry 1 solicitado ao Engineer, mantendo sensores imutáveis.
- TASK-0003 retry 1: serviço de case migrou parcialmente para SQL e controllers nasceram incompletos,
  mas inquiry ainda reteve estado em memória e unit ficou vermelho; escalada da mesma família para
  Terra/médio aberta, sem ampliar a fronteira de escrita.
- TASK-0003 escalada: runtime passou a SQL fail-closed, mas revelou que os mocks da TASK-0002 nunca
  devolvem linhas de caso/inquiry; atender o esperado exigiria hardcode proibido. TASK-0002 foi
  reaberta em escalada Inspector Terra/médio para corrigir as portas de teste, mantendo produção
  imutável. Janela 2 fechada em 610k estimados; continuação na janela 3.
- TASK-0002 escalada: fake SQL corrigido e sensor preexistente CETRAN preservado; 13 falhas unitárias
  agora isolam assinatura/entidade/id de auditoria e cardinalidade de eventos do runtime. Achados
  devolvidos à continuação da escalada Engineer da TASK-0003.
- TASK-0003 escalada final: gates unit/typecheck/shared/decorators ficaram verdes após os achados do
  Inspector, mas revisão substantiva do maestro encontrou implementação incompleta e DI inválida
  para produção; `claim-next` usa poolId como caseId e guardas vinculantes seguem ausentes. Status
  `escalated`; TASK-0004 e toda a cadeia posterior permanecem bloqueadas.
- Autorização humana corretiva: limites de tentativa, retry e escalada de TASK-0002/TASK-0003 foram
  reiniciados. A nova decomposição acrescenta PREP-CTG1-DEPS, eleva os dois workers a Terra/alto e
  transforma as lacunas acima em critérios explícitos de teste/implementação; o histórico não foi
  apagado nem reclassificado.
- CTG-0001 reference-gap prompt-review ciclo 1: `reference-gap` — oito inconsistências high entre
  plano, contrato, DDL e prompts; todas corrigidas antes do ciclo 2.
- CTG-0001 reference-gap prompt-review ciclo 2: `policy-issue` — a tentativa de uniformizar o
  envelope do `PolicyGuard` contaminava recursos não RAIT e quebrava sensor preexistente. Correção
  local pronta; limite de dois ciclos consumido, escalado ao humano sem disparar worker.
- PREP-CTG1-MODEL integração inicial: `sensor-error` ambiental — foi usada `DATABASE_URL`, mas o
  sensor lê `DETRAN_TEST_DATABASE_URL`, caindo no banco `detran` legado; repetição contra o banco
  dedicado discriminou o ambiente.
- PREP-CTG1-MODEL seed inicial: `reference-gap` de fixture — a nova constraint corretamente rejeitou
  três minutas não-rascunho sem `document_id`. O seed foi alinhado aos IDs documentais canônicos já
  existentes dos mesmos casos; nova aplicação e integração ficaram verdes em 24/24.
- TASK-0004: hooks, geração, contratos e typecheck passaram; `pnpm check` revelou `sensor-error` no
  `verify:parameter-catalogue`, cujo scanner textual classifica eventos `rait.*` e `messageKey` i18n
  como parâmetros. A correção foi decomposta em TASK-0004-S1 Inspector e TASK-0004-S2 Engineer;
  nenhum evento será contorcido e nenhum prefixo será globalmente liberado.
- TASK-0004-S1 fixou o vermelho contratual; TASK-0004-S2 passou 18/18 ao migrar para AST, mas
  encerrou `reference-gap`: quatro eventos estavam em mapa sem propriedade `type`, e a documentação
  normativa alterada exige regenerar três derivados pelo hash. O retry S2-R1 inclui somente essa
  normalização semântica e os derivados mecânicos, mantendo o desconhecido fail-closed.

Checkpoint de 2026-09-15, fim da janela 8: 600k/800k estimados; CTG-0001 segue sem commit, com
TASK-0001, PREP, TASK-0002-C3 e TASK-0003-C2 concluídos, TASK-0004 estruturalmente verde e correção
do sensor em retry. `origin/main` avançou para `397cb033ce2da549e2922d307c28b6b81e5d5070` pelo merge
de R-0008; sua colisão em shared/policy/lockfile será integrada somente após delivery-review e commit
local recuperável, seguida por repetição integral dos gates.

- Reprodução de grupo na janela 9: unit e integração integrais passaram, mas o e2e do app falhou na
  coleta por ausência dos aliases source de `inf-deadlines`, `inf-infraction` e `inf-notification`
  transitivos de RAIT Case. Classificação `plant-bug`; TASK-0004-S3 limita-se ao config Vitest e
  repete `app test:e2e`, `backend:test:ci` e `pnpm check` sem tocar sensores.
- TASK-0004-S3 adicionou os três aliases e avançou a coleta e2e, revelando `plant-bug` de DI: o
  blueprint registrava `RaitDocumentTrustVerifier` sem o concreto `DocumentTrustHttpAdapter`.
  TASK-0004-S4 cria somente o reexport local; TASK-0004-S5 registra o provider no blueprint,
  regenera e repete os gates integrais. Nenhum módulo gerado será editado à mão.
- Delivery-review CTG-0001: primeira saída foi tecnicamente inválida; retry técnico válido recebeu
  `FAIL` com 15 highs. Achados abrangem fail-open `compatibility`, metadata DI mutável, recurso de
  policy incorreto, marcos não persistidos, F-J-0 incompleto, WIP/escopo de claim-next, inquiry,
  precedência, identidade fora de RequestContext, payload documental e ausência de integração real.
  Nenhum commit foi liberado. Escalada `CTG-0001-DELIVERY-FAIL-AUDIT` deve reconciliar cada finding
  com contrato/DDL/corpus e recompor Inspector real → Engineer → Architect, sem alterar sensores
  existentes para fazê-los passar.
- `CTG-0001-DELIVERY-FAIL-AUDIT` confirmou materialmente os 15 highs e oito achados adicionais.
  Dois pontos exigem PREP de modelo (resposta documental/data civil e juntadas de
  withdraw/resolve-pending); os demais são correções de DI, segurança, SQL, política, estados,
  eventos e sensores. Não há nova decisão humana obrigatória se a emenda preservar vias já
  aprovadas e permanecer fail-closed diante de dados reais source_pending. Abriu-se C3 com uma
  única emenda Architect, PREP blueprint-first, Inspector PostgreSQL/HTTP real, Engineer com
  sensores congelados e Architect final de geração.

Checkpoint de 2026-09-15, encerramento da janela 9: 600k/800k estimados. O prompt-review C3-1
retornou `REVIEW` por quatro highs corrigíveis: relatório histórico contraditório, predicado de
evidência válido incompleto, caso único `mandatory=false` ambíguo e lote sem linhas nominais de
budget. OD-R7-FJ0-001 foi explicitada sem ampliar a decisão: ao menos um vínculo válido, inclusive
um único não obrigatório; todos os obrigatórios válidos; vazio, nenhum válido ou obrigatório
inválido falha fechado. As janelas 10 e 11 continuam reservadas aos CTG-0003/CTG-0004 planejados;
a janela 12 foi aberta para C3-2 e TASK-0019…TASK-0022, em 80k/800k antes do veredito C3-2.

## Adjudicação C3 após TASK-0021 iteração 1

Contrato §10.9 e relatório CTG-0001-C3-ADJUDICATION fecham as fronteiras de DI/sensores,
auditoria transacional, filtro de erro e binding de tempestividade. Estado desta emenda:
preparação do retry, nenhum retry/review adicional executado. Preservar contadores vigentes.
Próxima sequência: revisão do delta dentro do limite autorizado → Inspector TASK-0020 Sol/high
→ relatório e novos hashes → Engineer TASK-0021 Sol/high → hashes confirmados → TASK-0022
Astra/medium → delivery-review. Nenhum GREEN parcial libera a sequência. Bindings ambíguos
falham fechado e são relatados; não autorizados grants, produto, node_modules ou siblings.

### Stop pós-iteração 2 de TASK-0021

Auditoria independente rejeitou “produto concluído”: permanecem highs de codec civil em
resolve-pending, autoridade temporal de expire e boundary de policy guard/filtro, além de gaps de
sensores/fixtures. TASK-0020 e TASK-0021 alcançaram `max_iterations=2`; TASK-0022 fica bloqueada
até decisão Owner explícita reiniciar/estender limites e adjudicar a boundary.

### Stop pós-TASK-0022 do terceiro ciclo

TASK-0022 reproduziu suites específicas verdes, mas emitiu FAIL integral: permanecem defects de
Clock/DATE/eventos/escopo/fila/fallbacks e lacunas de prova; `pnpm check` e `backend:test:ci`
falham em boundaries não autorizadas. O terceiro ciclo autorizado foi consumido. Novo ciclo
corretivo requer autorização Owner e decomposição explícita antes de qualquer escrita adicional.

## Leitura

Leitura do Architect concluída sobre `df1e1769941e527a07b6db7550aee84068f3a872` em 2026-09-15:

- `AGENTS.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`;
- `docs/meta/agents/orchestra/{README,model-ladder,waves}.md` e templates de tarefa, worker,
  reviewer e maestro;
- `docs/framework/arch/rait-build-pack.md` inteiro e seu mapa: `rait-web-frontend.md` §7–§11,
  `rait-error-catalog.md`, `rait-test-strategy.md`, `rait-fixtures.md`,
  `rait-deadline-engine.md`, `rait-events-sse-contract.md`, `rait-i18n-glossary.md`;
- [WF-RAIT-001…004], [WF-INF-003] §1–§6, [WF-INF-002] §9.2 e UC-RAIT-001…043;
- `parameter-catalogue.md`, `decision-closure-plan.md`, `steering.md` §H,
  `open-decisions-rait.md` (incluindo OD-301…309);
- ADR-0014…0017, DDL 14, os sete blueprints-alvo e contratos OpenAPI gerados atuais;
- manuais `architect-blueprint`, `engineer-backend`, `engineer-frontend`, `inspector-tests` e
  `transcriber-docs`; plano desta rodada e scripts de aceitação dos manifests.

Baseline pós-rebase: `pnpm install --frozen-lockfile`, `pnpm check` e
`pnpm exec devai doctor --repo-root . --format human` verdes. O scaffold devolveu
`ROUND_ALREADY_EXISTS`, pois R-0007 já estava instanciada; nenhum segundo scaffold foi criado.
