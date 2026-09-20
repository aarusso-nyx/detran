# C4-OD V2 — composição proposta para revisão; NÃO DESPACHÁVEL

Worktree exclusivo: /Volumes/Thiamat II/stech/detran-worktrees/rait-backend.
Preparação documental autorizada pelo Owner em 2026-09-16. Nenhum PASS independente,
limite novo ou dispatch decorre deste prompt. TASK-0023 1/1 e revisões inválidas
permanecem históricas; TASK-0020/21 conservam 3/4. Nunca copiar este texto como
autorização para superar orçamento ou iniciar iteração 5.

## Entrada comum e precedência

Leia AGENTS.md, CODESTYLE.md, manual Art.6 do papel, plan.md, contrato CTG-0001,
C4, C4-OD **incluindo Fechamento técnico proposto V2**, C4-BINDINGS,
C4-OD-PLAN, ADR-0024/0025, RN-RAIT-141 e catálogo de parâmetros.
C4-OD V2 prevalece sobre somente as instruções conflitantes dos prompts antigos:
cinco providers, 88/15 relações, prioridade indefinida, seed manual pelo Engineer
e ausência de via de upgrade. Nenhum outro sensor, limite ou finding é removido.
Não executar git/install/commit/push; siblings, record/ e .devai/ intocados.
Um escritor por vez; banco serializado. Sem fallback de URL ou owner no runtime.

A revisão deve aceitar/rejeitar nominalmente: relacional assessment/basis;
provas etárias apresentadas vs PCD anexado; política V1 fechada; POST existente
adaptado à action protocol já catalogada; function SECURITY DEFINER com role
NOLOGIN não owner e RLS; migração pre + pós-grants + verify em apply.sh; legado
preservado/quarentena; seis providers; população de saídas e cada fronteira abaixo.
Não trocar requisito de revisão por este autorrelato. Reviewer não executa código.
Avaliar expressamente a fronteira de ator: PolicyGuard/RequestContext autenticam
na aplicação; função SQL só verifica membership do actorId recebido. GUC tenant
não é autenticador de ator. Credencial app comprometida permite impersonação na
função; não afirmar que a proteção append-only resolve essa ameaça. Exigência
de autenticação independente no DB implica REVIEW/FAIL e novo desenho.

## Etapas e allowlists após autorização própria

1. Reconciliação Architect Astra/medium: usar esta preparação como entrada de
   TASK-0023 iteração 2 somente se sua nova execução for explicitamente liberada.
   Outputs limitados aos contratos C4/C4-OD, C4-BINDINGS e C4-OD-PLAN. Não repetir
   consumo como se esta preparação já tivesse sido uma iteração.
2. Architect Astra/medium, blueprint/SQL: BP-INF-RAIT-CASE-001.json; OpenAPI gerado
   BP-INF-RAIT-CASE-001.openapi.json; novo
   docs/framework/contracts/rait-priority-intake.commands.openapi.json;
   tools/blueprints/generated-files.json; backend/database/ddl/34-inf-rait-case.sql
   somente gerado; backend/database/apply.sh; três paths
   backend/database/migrations/20260916-rait-priority-01-pre.sql,
   backend/database/migrations/20260916-rait-priority-02-enforce.sql e
   backend/database/migrations/20260916-rait-priority-03-verify.sql.
   Saídas case: módulo/index e exatamente os 85 paths do inventário abaixo.
   Nenhum outro DDL/gerador/schema compartilhado. Preparar SQL não autoriza aplicar.
3. Architect de parâmetros Astra/medium: docs/framework/arch/parameter-catalogue.md,
   tools/parameters/parser.mjs e tools/parameters/tests/generator.test.mjs;
   gerar seed05, backend/app/src/generated/parameter-flags.ts e
   backend/domains/ops/parameter/src/generated/parameter-catalogue.ts. O parser
   atual trata JSON textual como string: alterar somente a interpretação do
   default JSON objeto desta chave, validando schema exato, com teste que outras
   chaves mantêm bytes/semântica. Não fazer JSON.parse genérico em todas as linhas.
   Nunca seed de produção com ON CONFLICT sobrescrevendo parâmetro ativo.
4. TASK-0024 Architect Astra/medium: manter prompt histórico e única allowlist
   UC-RAIT-017.md; depende da revisão válida deste delta e reconciliação. Corrigir
   somente crases TEAT_EVIDENCE; preservar baseline446 e fonte F-J-0.
5. Inspector Sol/high TASK-0025: substituir expectativa antiga por 90 relações,
   case17; três adições anteriores mais assessment/basis, nominalmente. Único
   arquivo backend/domains/inf/ait/tests/integration/inf-rls.integration.spec.ts.
   Escrever sensor antes da implementação; sua execução depende do schema aplicado
   por Architect em ensaio autorizado e hardening final. Ausência de infraestrutura
   é BLOCKED, não RED. Provar RLS/FORCE/contexto para app e role writer.
6. Inspector Sol/high TASK-0020 iteração 4: allowlist D1 inalterada mais paths
   específicos C4-OD e novo case/tests/integration/rait-priority-upgrade.integration.spec.ts.
   Executar todos os 14 comandos e intake/provas/migração/clock/revisão da V2.
   Fixture não implementa SQL de produção nem prova serviço por si só.
   Congelar hashes dos sensores antes de GREEN.
7. Engineer Sol/high TASK-0021 iteração 4: allowlist D1 mais os cinco handwritten
   definidos em C4-OD V2 e seed20 restrita a fixtures próprias; nenhum sensor,
   documento, SQL de schema, blueprint ou seed05. Protocol via rota existente,
   deny-revision, tipos/validação/Clock e consumo de SQL oficial; novos providers
   além do sexto exigem STOP. Não contornar negativo com mock de DB.
8. Architect Astra/medium TASK-0022-C4: geração e gates integrais no mesmo
   candidato, com inputs revisados. Aplicação SQL somente após revisão de bytes e
   autorização de ensaio, exclusivamente detran_r7_ctg1_a2; nunca reset como prova
   de upgrade. Sem correção manual de código/testes nem alterações de budget.
9. Revisão de entrega independente permanece gate posterior distinto.

## Inventário determinístico dos gerados case

Prefixo backend/domains/inf/rait-case/src/. Nomes exatos:
rait-case, rait-party, rait-document, rait-pending-content, rait-redirect,
rait-admissibility, rait-deadline, rait-inquiry, rait-inquiry-document,
rait-pending-document, rait-withdrawal-attestation, rait-draft, rait-decision,
rait-communication, rait-case-event, rait-priority-assessment, rait-priority-basis.
Para cada nome há exatamente cinco paths: entities/<nome>.entity.ts,
dto/create-<nome>.dto.ts, repositories/<nome>.repository.ts,
services/<nome>.service.ts, controllers/<nome>.controller.ts.
São 85 paths (75 existentes + 10 novos), mais index.ts e rait-case.module.ts.
Não há wildcard autorizando outros nomes. Parâmetros/SQL fora dessa população
são apenas os paths exatos das etapas acima. Manifesto congelado pelo maestro deve
expandir esses nomes antes do dispatch e registrar hashes do candidato revisado.

## Aceitação, limites e STOP

Formato/KB sem baseline alterada; correspondência blueprint/gerados/OpenAPI;
SQL de upgrade não perde fatos, é idempotente e endurece grants **após DDL20**;
fresco e upgrade equivalentes; nenhum novo caso commita sem qualification;
SQL/repositório/CRUD não consegue escrever prioridade arbitrária ou apagar provas;
protocolled_at e id são chaves imutáveis após INSERT, inclusive legado, sem
exceção autorizada nas fontes atuais. BP marca protocolled_at writable:false,
geração o remove do DTO/WRITABLE_FIELDS e SQL BEFORE UPDATE rejeita mudança
independentemente de grants. O POST handwritten define o valor inicial, inclusive
ECT postal; qualificação da idade conserva seu instante separado. Inspector deve
provar negativas PATCH/repository.update/SQL para antecipar/postergar data e
alterar id, com papéis secretaria/coordenador, legado, rollback e ordem intacta,
inclusive após repetir apply. Revisão futura de prioridade não libera cronologia;
nenhum parâmetro abre revisão V1; idade por ato e nenhum upload etário obrigatório.
Casos legados sem prova permanecem preservados e inelegíveis. None não requer
prova negativa. Default do catálogo não é migração silenciosa de configuração.
Documentar contagens de quarentena antes de qualquer adoção em ambiente real.

Manter C4 integral: erros/envelopes/eventos/rollback/idempotência, 14 comandos,
concurrency, seis ausências DI + Database/RequestContext, Node24.15.0/STYNX1.3.1,
URLs explícitas para detran_r7_ctg1_a2 e role_app_backend, contagem positiva de
testes, todos os checks globais. Saída fora de allowlist, revisão sem PASS,
fonte ou candidato movido, budget esgotado, SQL não revisado ou novo requisito
de produto: STOP da etapa dependente. Reportar comando/resultado real e gaps.
