# R-0018 — frente `index-state` (C-0002, ação 3: índice de ADRs racionalizado e índices de estado)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner.** Planejada em 2026-09-26
pelo Architect a partir de `work/campaigns/C-0002-consolidacao.md` §2 (fase A, segunda linha) e
das inspeções (c), (e), (f) e (g) de 2026-09-25 (`work/campaigns/C-0002-inspecao-2026-09-25/`, versionado com a campanha);
reaproveita o rascunho da revisão 1 (então R-0019), com ids, ordem, maestros e dependências
corrigidos. Nenhum `AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro os cria no
bootstrap, depois da autorização. Maestro **Opus 5.5** (Claude Code); reviewer **Sol 6** (Codex)
pela ponte (C-0002 §4, OD-C2-003); ids de CLI confirmados no bootstrap (M1; se R-0017 já os tiver
registrado, conferir e copiar). Base prevista: `origin/main` ≥ `a92ef731` **mais** o commit do
Owner que versiona a campanha C-0002, a ADR-0034 e a linha dela em `docs/meta/adr/README.md` (hoje
só no working tree do checkout principal). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/index-state`, branch `orchestra/index-state`.
**Concorrência:** nenhum upstream de código. Corre em paralelo com R-0017 `local-stack` e R-0019
`law-corpus` (fase A, locks disjuntos). Esta rodada é dona de `docs/meta/adr/**`,
`DESIGN-DECISIONS.md`, `law/adr/**`, `.gitignore`, `.prettierignore`, `tools/README.md`,
`docs/start/**`, build packs, READMEs e `model-ladder.md`; **não toca** em `law/{invariants,policy,
schemas,glossary}/**` e `product/**` (R-0019) nem em `tools/detran-stack*`, `tools/stack/**`,
`docs/dev/**`, `backend/database/**` (R-0017). Arquivos partilhados — integrar `origin/main` por
merge antes de cada PR, mantendo as linhas das duas partes: `package.json` (R-0017 acrescenta
`stack:*`/`test:stack`), `waves.md` §Histórico, `open-decisions-rait.md` (uma seção por rodada),
`work/rounds/README.md` (R-0017 e R-0019 escrevem só a própria linha). Rodada seguinte que depende
desta: R-0020 (abre após R-0018 e R-0019).
**Janelas previstas:** 2 (janela 1: bootstrap + planejamento + CTG-0001; janela 2: CTG-0002 +
CTG-0003).

## Metas

1. **Política de numeração de ADRs** (ADR nova, número conferido no bootstrap): ids **nunca
   reutilizados**; em número duplicado, a ADR que entrou **primeiro na história first-parent de
   `main`** conserva o número e a outra recebe o **próximo número livre**; o arquivo antigo vira
   **redirecionamento** (stub com `## Status` "Renumerada para ADR-nnnn", sem conteúdo normativo),
   e a tabela de aliases vive em `docs/meta/adr/README.md` §Aliases. Referências **vivas** são
   atualizadas por **script verificável** (`tools/docs/adr/renumber.mjs`, dry-run por padrão,
   lista fechada de caminhos, desambiguação pelo slug); artefatos **históricos**
   (`work/rounds/R-0001…R-0016/**`, `record/**`, `.devai/state/**`, `docs/reference/**`) nunca são
   reescritos — resolvem pelo redirecionamento. Duplicatas e medição preliminar (2026-09-26,
   `git log --first-parent --diff-filter=A`; TASK-0001 remede e decide):

   | Número | Fica (primeiro em `main`)                                | Renumerada                                                     | Arquivos que citam o número |
   | ------ | -------------------------------------------------------- | -------------------------------------------------------------- | --------------------------- |
   | 0006   | `detran-ui-kit` (`6915a9e1`, 2026-08-24 07:43)           | `ops-field-operations-port` (`902ba190`, 07:50)                | 25                          |
   | 0024   | `govbr-federation-via-cognito` (`1175f4f3`, 2026-09-16)  | `rait-legal-priority-owner-policy` (`a0f62cb6`, 2026-09-19)    | 118                         |
   | 0028   | `devai-1-5-2-attested-local-rc` (`0aea746b`, 2026-09-21) | `provisionamento-operacional-offline` (`b8920457`, 2026-09-22) | 37                          |

   Números novos: próximos livres após 0034 (ADR-0034 é de OD-C2-002), conferidos com
   `ls docs/meta/adr` antes de TASK-0004 e antes de cada PR.

2. **Índices de ADR coerentes com o diretório:** `DESIGN-DECISIONS.md` (para em ADR-0022) e
   `docs/meta/adr/README.md` (omite ADR-0006-ops, ADR-0028-devai e 0029…0033; 0034 já entrou)
   cobrem todas as ADRs + as novas + os redirecionamentos; status **lido do arquivo**: ADR-0021
   está "Accepted" no arquivo e "Proposed" em `DESIGN-DECISIONS.md`; ADR-0022 segue "Proposed" no
   arquivo (governou 14 rodadas) — proposta de aceitação é **OD-R18-002**, e o índice mostra o
   status real até o Owner decidir. As ADRs 0027, 0028-prov. (`- Status:`) e 0029…0034 (prosa)
   não seguem a forma `## Status` + palavra-chave: o contrato fixa a **classificação normalizada**
   (Accepted | Proposed | Superseded | Renumbered) de cada uma, usada pelo gate, sem emendar o
   texto das ADRs aceitas.
3. **Vigência sem emenda normativa:** ADR-0006 (ui-kit) fixa Angular 21 e STYNX 1.1.1 (linhas
   16-19); ADR-0015 fixa Angular 22 / STYNX 1.3.1 e a meta DEVAI 1.4.5, superada pela
   ADR-0028-devai. O índice ganha coluna/nota "vigência parcial → ADR-nnnn"; nota de status na
   própria ADR só se o contrato provar precedente (a ADR-0006 já traz "Package pins amended by …",
   linhas 5-6). Série paralela `law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`: destino por
   **OD-R18-001** — (a) renumerar para `docs/meta/adr/` pelo próximo número livre, com
   redirecionamento em `law/adr/`; (b) manter como série DEVAI distinta, declarada nos dois
   índices com prefixo inequívoco. Em qualquer caso `law/adr/README.md` deixa de dizer
   "intentionally empty" (é falso).
4. **Gate novo `verify:state-index`** (entregável; não existe hoje em `package.json`), ligado a
   `pnpm check`, que falha quando: (a) um número de ADR em `docs/meta/adr/` aparece mais de uma vez
   sem que exatamente um dos arquivos seja redirecionamento para outro número existente; (b) uma
   ADR do diretório (ou de `law/adr/`, conforme OD-R18-001) falta em `DESIGN-DECISIONS.md` ou em
   `docs/meta/adr/README.md`, ou um índice cita ADR inexistente; (c) o status do índice diverge da
   classificação normalizada do arquivo (Meta 2); (d) um `PC-nnnn.json` de
   `record/proofs/compliance/closures/` não aparece na linha da sua rodada (`round_id`) em
   `work/rounds/README.md`, ou uma linha diz fechada sem PC, ou há PC para rodada ausente da tabela.
   R-0001/R-0002 são pré-método e aparecem como exceção declarada no próprio gate.
5. **Índices de estado sincronizados com o real** (fonte: closures, `git log --first-parent`,
   `waves.md` §Histórico):
   - `work/rounds/README.md`: "DEVAI 1.4.5" → 1.5.6; R-0007…R-0016 "planned" → estado, PC e maestro
     reais (mapa lido de `round_id`: PC-0005 R-0008, PC-0006 R-0009, PC-0007 R-0014, PC-0008 R-0010,
     PC-0009 R-0011, PC-0010 R-0012, PC-0011 R-0007, PC-0012 R-0016, PC-0013 R-0013, PC-0014
     R-0015); nota de R-0002 sem pasta; **linhas R-0017…R-0031 e S-1.5 "proposta (C-0002)"** com
     frente e maestro de C-0002 §2; seção curta **C-0002** apontando para
     `work/campaigns/C-0002-consolidacao.md` (C-0001 = R-0001…R-0016); convenção de pastas com
     `reports/` versionado e o selo (R-0020).
   - `waves.md`: linha R-0016 ("PR #103, em CI" → mesclado, PC-0012).
   - Build packs com parágrafos "pendente"/"a abrir" já resolvidos: `teat-build-pack.md` (WP-T4
     ~l. 150-155, ~l. 194-198), `rait-build-pack.md` (~l. 79-83, ~l. 156-160 e WP-0),
     `boat-build-pack.md:60-73`, `dashboard-build-pack.md:113` (WP-D5 "em CI"); cada correção
     cita commit/PR/PC do contrato.
   - `docs/start/index.md` §Status ("Phase 0 skeleton", l. 16-20); `BUILD-PLAN.md` com tabela de
     estado dos WPs. `docs/start/` é publicado: nada de link para documento `draft` ou para
     `docs/dev/` (não publicado).
6. **READMEs:** desatualizados — `apps/teat/{web,mobile}/README.md` ("placeholder", "Built in Phase
   3"), `apps/boat/mobile/README.md` (descreve app Capacitor; é biblioteca `ng-packagr` montada no
   shell de campo; sigla conforme `docs/framework/product/domains/est/boat/APP.md`),
   `backend/domains/shared/README.md` ("PEC 15 + eight TEAT + CIDADAO" = 24 → contagem lida de
   `src/roles.ts`), `backend/domains/*/README.md` (tempo futuro, sem módulos),
   `backend/database/ddl/README.md` (sem as faixas 61–80), `tools/README.md` ("Phase-2 checks";
   cita a stack de R-0017 **só se** já estiver em `main`, senão nota `pendente R-0017`),
   `docs/framework/arch/README.md` (índice). **Ausentes:** `packages/api-clients`,
   `packages/sefaz-adapter`, `backend/domains/integration` e os módulos de `backend/domains/*/*` com
   `package.json` sem README (49 em 2026-09-26; a inspeção (g) contou 55 — TASK-0006 reconta).
7. **`.gitignore`:** a linha 10 (`reports/`) deixa de esconder `work/rounds/*/reports/` (R-0007
   perdeu 24 relatórios); saídas de ferramenta continuam ignoradas; `.prettierignore` passa a
   excluir os relatórios verbatim de worker (Prettier respeita `.gitignore`: os 183 relatórios já
   versionados com `git add -f` entrariam no `format:check`).
8. **`CLAUDE.md` / `AGENTS.md`:** autoridade do Owner. A rodada **não** os edita: TASK-0005 grava
   `work/rounds/R-0018/proposals/CLAUDE.md.patch` (DEVAI 1.4.5 → 1.5.6, l. 6; papéis no Art. 7;
   `packages/` completo) e `AGENTS.md.patch` (`packages/` com `api-clients` e `sefaz-adapter`;
   `pnpm check` descrito); o maestro pede o aceite no PR do CTG-0002 (**OD-R18-003**) e só aplica
   com aceite explícito do Owner registrado em §Decisões do maestro.
9. **`model-ladder.md` com Sol 6 / Opus 5.5** (OD-C2-003): famílias e níveis (Claude: Opus 5.5
   grande e médio, Sonnet 5 pequeno; Codex: Sol 6 grande, Terra e Luna vigentes), ids de CLI
   confirmados (M1 desta rodada ou de R-0017) e o registro da troca em `waves.md` §Histórico. Se
   Sol 6 não suceder GPT-5.6 Sol, a escada Codex é revista aqui (C-0002 §7) com decisão do Owner.

## Tarefas

Modelos pela escada Claude (C-0002 §4): Opus 5.5 grande e médio; Sonnet 5 pequeno. Workers por
subagentes nativos do Claude Code.

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                                         | Depende de                 | Entrega                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | -------------------- | ------------------- | ---------------- | -------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r18-contract`, `MOD-adr-policy`                                                         | —                          | `contracts/CTG-0001.md`: inventário das ADRs (`docs/meta/adr/` + `law/adr/`) com texto de status, classificação normalizada e data first-parent; mapa de renumeração e aliases; lista fechada de caminhos vivos × históricos; critérios C-01-nn do gate (a)–(d); tabela-verdade R-0001…R-0031 × PC; texto da ADR de política                                                        |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-state-index-tests`                                                                      | TASK-0001                  | testes `node:test` com fixtures em diretório temporário: um caso por C-01-nn (duplicata sem redirect → falha; com redirect → passa; índice sem ADR; status divergente; PC sem linha; fechada sem PC; exceção R-0001/R-0002) e do script de renumeração (dry-run não escreve; histórico intocado; desambiguação por slug)                                                            |
| TASK-0003 | Engineer             | engineer-backend    | Sonnet 5 / médio | `MOD-state-index-tool`, `MOD-root-package-scripts`                                           | TASK-0002                  | `tools/docs/state-index/check.mjs`, `tools/docs/adr/renumber.mjs`; scripts `verify:state-index`, `test:state-index`, `adr:renumber` em `package.json`; os dois primeiros em `check` logo após `docs:kb:publish-check`; testes verdes                                                                                                                                                |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-adr-index`, `MOD-rounds-readme`, `MOD-open-decisions`                                   | TASK-0003 + checkpoint (a) | ADR de política; ADRs renumeradas + redirecionamentos; `DESIGN-DECISIONS.md`; `docs/meta/adr/README.md` (+ §Aliases, vigência); `law/adr/` conforme OD-R18-001 (ou nota "pendente"); `work/rounds/README.md` (Meta 5, 1º item); OD-R18-001…003 na seção R-0018 de `open-decisions-rait.md`                                                                                          |
| TASK-0006 | Architect            | architect-blueprint | Opus 5.5 / médio | `MOD-r18-contract`                                                                           | CTG-0001 mesclado          | `contracts/CTG-0002.md` (tabela-verdade por documento de estado com a fonte de cada correção; decisão `.gitignore`/`.prettierignore`; texto de `model-ladder.md`) e `contracts/CTG-0003.md` (lista recontada de READMEs; esqueleto fixo de README de módulo: propósito, blueprint, DDL, rotas/contrato, scripts, testes; fontes permitidas: `package.json`, blueprint, DDL, `src/`) |
| TASK-0005 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-build-packs`, `MOD-waves`, `MOD-start-docs`, `MOD-model-ladder`                         | TASK-0006                  | build packs, `waves.md` (linha R-0016; troca de família), `docs/start/index.md` §Status, `BUILD-PLAN.md` (tabela de estado), `model-ladder.md`, `proposals/{CLAUDE,AGENTS}.md.patch`                                                                                                                                                                                                |
| TASK-0007 | Engineer             | engineer-backend    | Sonnet 5 / baixo | `MOD-gitignore`                                                                              | TASK-0006                  | `.gitignore` e `.prettierignore` conforme o contrato; prova com `git check-ignore -v` (relatório de worker rastreável; `dist/`, `coverage/` e saídas de ferramenta seguem ignorados)                                                                                                                                                                                                |
| TASK-0008 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-readmes-stale`                                                                          | TASK-0006                  | READMEs desatualizados da Meta 6                                                                                                                                                                                                                                                                                                                                                    |
| TASK-0009 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-readmes-new-a` (`packages/*`, `backend/domains/{integration,inf,est,dashboard,portal}`) | TASK-0006                  | READMEs novos pelo esqueleto de `contracts/CTG-0003.md`                                                                                                                                                                                                                                                                                                                             |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-readmes-new-b` (`backend/domains/{ch,ops,shared}`)                                      | TASK-0006                  | READMEs novos pelo esqueleto de `contracts/CTG-0003.md`                                                                                                                                                                                                                                                                                                                             |
| TASK-0011 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-waves`, `MOD-docs`                                                                      | TASK-0008…0010             | `waves.md` §Histórico (linha R-0018), `docs/meta/knowledge-base/backlog.md`, linha R-0018 de `work/rounds/README.md`                                                                                                                                                                                                                                                                |

CTG-0001 = 0001 → 0002 → 0003 → checkpoint (a) → 0004 (tríade: o gate só entra em `check` no mesmo
commit em que os índices passam a satisfazê-lo). CTG-0002 = 0006 → 0005 ∥ 0007 → checkpoint (b).
CTG-0003 = 0008 ∥ 0009 ∥ 0010 → 0011. **Um PR por CTG.** O CTG seguinte nasce depois do merge do
anterior ou em branch empilhado; nunca commits novos no branch de um PR aberto.

**Checkpoints (maestro, Engineer):** (a) após TASK-0003: `pnpm adr:renumber` (dry-run) → revisar a
lista; `pnpm adr:renumber -- --write` → `git diff --stat` só em caminhos vivos da lista fechada;
citações sem slug em documento vivo vão para revisão manual do TASK-0004, nunca substituição cega.
(b) após TASK-0007: `git add` do grupo e comparação `find work/rounds/R-0018 -type f` ×
`git ls-files work/rounds/R-0018` (lição R-0016) e `pnpm format:check` verde.

## Critérios de aceitação (comandos → resultado)

Comandos já existentes em `package.json` (conferidos em 2026-09-26):

- `pnpm format:check` → OK; `pnpm docs:kb:check` → OK (baseline reconciliado no mesmo commit se
  alguma ADR nova contar como artefato); `pnpm docs:kb:publish-check` → OK.
- `pnpm docs:check` → OK (o site publica `meta/adr` e `start`: links para arquivos renumerados e
  redirecionamentos resolvem).
- `pnpm check` → verde; `pnpm devai:doctor` → todos `[✓]`.

Gates novos (entregáveis desta rodada; não existem antes de TASK-0003):

- `pnpm test:state-index` → todos os casos de TASK-0002 verdes.
- `pnpm verify:state-index` → `OK` sobre `main` integrado; e **falha** (exit ≠ 0) nas fixtures
  negativas de TASK-0002 — o gate prova que detecta, não só que passa.
- `pnpm adr:renumber` (dry-run) após o `--write` → nenhuma alteração pendente.

Verificações de arquivo:

- `ls docs/meta/adr | sed -n 's/^ADR-\([0-9]*\)-.*/\1/p' | sort | uniq -d` → só números cujo par é
  redirecionamento (conferido pelo gate).
- `git grep -n '1\.4\.5' -- work/rounds/README.md docs/start/index.md BUILD-PLAN.md` → vazio
  (`CLAUDE.md` só muda pelo patch aceito; ADRs aceitas não são emendadas).
- `git grep -n 'R-0031' -- work/rounds/README.md` → uma linha; `git grep -n 'C-0002' -- work/rounds/README.md` → presente.
- `git grep -n 'Sol 6\|Opus 5.5' -- docs/meta/agents/orchestra/model-ladder.md` → presentes.
- `git check-ignore -v work/rounds/R-0018/reports/TASK-0001.md` → não ignorado;
  `git check-ignore -v dist` → ignorado.
- `git grep -n 'placeholder\|Built in Phase 3' -- apps/teat/web/README.md apps/teat/mobile/README.md` → vazio.
- `grep -c 'intentionally empty' law/adr/README.md` → 0.

## Mapa entregável → definições

| Entregável            | Definição                                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| política de numeração | `docs/meta/adr/README.md` ("supersede only by a new ADR"; nota de renumeração 0014…0021 de 2026-09-13); `git log --first-parent`                                                                      |
| índices de ADR        | `docs/meta/adr/*.md` (`## Status`, `- Status:`), `DESIGN-DECISIONS.md`, `docs/meta/adr/README.md`, `law/adr/`                                                                                         |
| vigência              | ADR-0006 (ui-kit) l. 5-6, 16-19; ADR-0015; ADR-0028-devai; ADR-0034                                                                                                                                   |
| gate                  | `record/proofs/compliance/closures/PC-*.json` (`round_id`); `work/rounds/README.md`; forma de verificador `tools/docs/kb/check.mjs`                                                                   |
| estado das rodadas    | closures PC-0001…PC-0014; `waves.md` §Histórico; `work/campaigns/C-0002-consolidacao.md` §2                                                                                                           |
| build packs e start   | `docs/framework/arch/{teat,rait,boat,dashboard}-build-pack.md`; `docs/start/index.md`; `BUILD-PLAN.md`                                                                                                |
| READMEs               | `package.json` de cada pacote; `docs/framework/blueprints/`; `backend/database/ddl/`; `backend/domains/shared/src/roles.ts`; ADR-0033 (escopo TEAT); `docs/framework/product/domains/est/boat/APP.md` |
| `.gitignore`          | `.gitignore:10-15`; `.prettierignore`; `waves.md` §Histórico linha R-0016                                                                                                                             |
| escada                | `docs/meta/agents/orchestra/model-ladder.md`; C-0002 §4 e §7; M1 de R-0017/R-0018                                                                                                                     |
| CLAUDE/AGENTS         | `CLAUDE.md:6`; `AGENTS.md`; `package.json` (`@aarusso-nyx/devai` 1.5.6)                                                                                                                               |

## Riscos

- **Renumeração com 118 arquivos citando "ADR-0024"** (37 "ADR-0028", 25 "ADR-0006"): a maioria é
  histórico. O script só toca a lista fechada de caminhos vivos e desambigua pelo slug.
- **ADR aceita não se emenda:** a renumerada é arquivo novo com conteúdo idêntico + nota de
  proveniência no topo; a vigência parcial vai ao índice.
- **Números concorrentes:** R-0017/R-0019 podem criar ADRs. Conferir o próximo livre antes de
  TASK-0004 e de cada PR.
- **Gate vermelho em `main` por outra rodada:** rodada da C-0002 que fechar sem sua linha em
  `work/rounds/README.md` quebra `pnpm check`. Mitigação: as linhas R-0017…R-0031 nascem aqui como
  "proposta"; cada prompt de maestro da C-0002 já manda atualizar a própria linha no fechamento;
  regra registrada em `waves.md`.
- **Prettier × `.gitignore`** (lição R-0016): sem `.prettierignore` o CI quebra ao liberar os
  relatórios.
- **Insumos do Owner fora do git** (campanha, ADR-0034): sem o commit do Owner, o índice citaria
  arquivo ausente e o gate falharia — é pré-condição do prompt.

## Lições aplicadas (C-0001; C-0002 §4; `waves.md` §Histórico)

- **Relatórios versionados:** `git add -f work/rounds/R-0018/reports/` até o merge do CTG-0002;
  depois de cada `git add`, `find` × `git ls-files`.
- **Critérios imutáveis:** mudança vira adenda numerada neste `plan.md` com decisão do Owner; o
  critério substituído aparece no `closure.json` como **não cumprido**, nunca PASS.
- **ODs no registro canônico:** OD-R18-001…003 (e novas) em
  `docs/meta/knowledge-base/open-decisions-rait.md`, seção da rodada, no mesmo PR que as cita.
- **Âncora da prova na cadeia:** `devai evidence record` por CTG, `evidence verify --scope chain` e
  âncora em `record/proofs/chain.json`; conflito em `chain.json` → aceitar `main` e regravar pelo
  verbo (merge `9ac6dd55` apagou âncoras de R-0007).
- **Orçamento:** `budget.json` obrigatório; a 80 % da janela o maestro grava checkpoint e para.
- **Caracterização antes de troca:** o gate roda primeiro em modo relatório sobre `main` (lista de
  divergências anexada ao contrato) antes de qualquer correção de índice.
- O closure não afirma checks obrigatórios além dos 5 da proteção de `main`.
- Transcrição é ato de Architect (`transcriber-docs`); nenhum Engineer ou transcriber escreve o
  teste do próprio artefato (o gate é testado pelo Inspector).
- `CLAUDE.md` e `AGENTS.md` só por patch aceito pelo Owner.

## Adendas

(vazio)

## Decisões do maestro

- **M0 — autorização (2026-09-26).** O Owner autorizou explicitamente a abertura de R-0018 na
  sessão do maestro; registrada em `AUTHORIZATION.md`.
- **M1 — ids de CLI (2026-09-26, confirmados nesta rodada; R-0017 ainda não os registrou).**
  Provas com `codex exec -m <id> "responda ok"` e `claude -p --model <id> "responda ok"`:

  | Família | Nível   | Nome     | Id de CLI         | Resultado                                                                              |
  | ------- | ------- | -------- | ----------------- | -------------------------------------------------------------------------------------- |
  | Codex   | grande  | Sol 6    | `gpt-6-sol`       | `ok` com `codex-cli` 0.157.1; ponte provada (`bridge.sh codex gpt-6-sol`, `{ok:true}`) |
  | Codex   | médio   | Terra    | `gpt-5.6-terra`   | `ok`; `gpt-6-terra` responde "not supported when using Codex with a ChatGPT account"   |
  | Codex   | pequeno | Luna     | `gpt-6-luna`      | `ok` (0.157.1); `gpt-5.6-luna` também responde                                         |
  | Claude  | grande  | Opus 5.5 | `claude-opus-5-5` | `ok` (`claude` 2.1.283)                                                                |
  | Claude  | pequeno | Sonnet 5 | `claude-sonnet-5` | `ok`                                                                                   |

  Sol 6 é o sucessor de GPT-5.6 Sol (mesma linha `gpt-*-sol`). `codex-cli` 0.151.0 rejeitava
  `gpt-6-sol`/`gpt-6-luna` ("not supported") e `gpt-6-astra` ("requires a newer version of
  Codex"); o maestro atualizou o CLI global para 0.157.1 (`npm i -g @openai/codex@0.157.1`), que
  `devai doctor` confirma em `llm-bridges`. Insumo de `model-ladder.md` (Meta 9, TASK-0005): a
  escada Codex fica Sol 6 / Terra (`gpt-5.6-terra`, sem sucessor 6 disponível) / Luna
  (`gpt-6-luna`).

- **M2 — worktree.** O volume `/Volumes/Thiamat II` não está montado nesta máquina; a worktree foi
  criada no caminho da convenção do método (`orchestra/README.md` §1, `../detran-worktrees/<frente>`):
  `/Users/aarusso/Development/detran-worktrees/index-state`, branch `orchestra/index-state` a
  partir de `origin/main` `220a4020`. Todo prompt desta rodada usa esse caminho.
- **M3 — scaffold.** `devai round plan --scaffold` responde `ROUND_ALREADY_EXISTS` (o `plan.md`
  já está versionado em `main`); nada a criar. `devai doctor`: todos `[✓]`. Linha de base
  `pnpm check` em `220a4020`: exit 0.
- **M4 — adenda de caracterização (prompt-review-1, achado 8).** Entre TASK-0003 e o checkpoint
  (a), o maestro (Architect) transcreve a lista integral de `pnpm verify:state-index` em modo
  relatório sobre a worktree (relatório de TASK-0003) como adenda numerada em
  `contracts/CTG-0001.md` §Caracterização; só então roda o checkpoint (a) e libera TASK-0004.
- **M5 — CTG-0001 entregue (2026-09-26).** Tríade + transcrição concluídas com adendas A1–A4 e
  iterações restritas (T1–T7); `pnpm verify:state-index` → `OK: 39 ADRs, 3 redirecionamentos, 33
rodadas, 14 closures`; `pnpm test:state-index` → 98/98; `pnpm check` e `pnpm docs:check` verdes;
  delivery-review PASS no ciclo 3. OD-R18-001, OD-R18-002 e OD-R18-004 **pendentes** (pedidas ao Owner
  no PR do CTG-0001); OD-R18-003 no CTG-0002.

## Concorrência

Registrado no bootstrap (2026-09-26, `origin/main` `220a4020`):

- `git log --oneline -30 origin/main`: último merge #127 (campanha C-0002 + ADR-0034). Nenhum
  commit de R-0017 ou R-0019 em `main`.
- `gh pr list --state open`: vazio. `git ls-remote --heads origin`: nenhum `orchestra/*` (nem
  `orchestra/local-stack`, nem `orchestra/law-corpus`).
- **CTG-0001:** sem upstream — liberado para merge. **CTG-0002:** sem upstream; nasce após o merge
  do CTG-0001 (ou empilhado). **CTG-0003:** após o CTG-0002; `tools/README.md` cita a stack só se
  `orchestra/local-stack` estiver em `main` no momento da tarefa (hoje não está).
- Próximo número livre de ADR: **0035** (`docs/meta/adr` vai até 0034). Reconferir antes de
  TASK-0004 e de cada PR.
- `law/invariants/` só tem `README.md` (sem `INV-*`): `target_invariants` = `[]` em todas as
  tarefas.

## Bloqueios

- **B1 — prompt-review-1 FAIL (2026-09-26, `codex gpt-6-sol`).** Oito achados `high`, todos
  estruturais e corrigíveis sem mudar o plano: (1–4) leitura sem `AGENTS.md`/`CODESTYLE.md` antes
  do manual; (5) `waves.md` fora da leitura de TASK-0001; (6) fronteira de TASK-0004 contraditória
  para citações sem slug fora de `docs/meta/**`; (7) `node --test` com diretórios em
  `TASK-0003.json`; (8) caracterização sem passo que a leve ao contrato. Nenhum achado de
  contradição canônica ou decisão do Owner. Correções aplicadas nos prompts, na tarefa e em M4.
  Pelo §5 do prompt do maestro, FAIL → parar e reportar ao humano; ciclo 2 (restrito aos itens
  corrigidos) só com decisão do Owner.
- **B2 — `devai round seal` recusado (2026-09-27).** `devai round seal --round R-0018` →
  `{"code":"ROUND_ARCHIVE_RECORD_MISSING","operation":"seal","exit":2}`. Pré-requisito ainda não
  entregue (registro de arquivamento/fluxo de selo: R-0020, C-0002 §4). Não contornado: o selo de
  R-0018 fica para R-0020, que sela R-0003…R-0019. O fechamento emitido é **PC-0015**
  (`record/proofs/compliance/closures/PC-0015.json`).

## Triagem

- **T1 (TASK-0004, `reference-gap`).** `DESIGN-DECISIONS.md:15` com `` `mock\|real` `` (literal do §9.1)
  × `split('|')` do §6.5 → C-01-15 falso. Adenda A2 + C-01-36; iteração 1 de TASK-0002 (teste) e de
  TASK-0003 (desescape).
- **T2 (TASK-0004, `reference-gap`).** Ilustração `[ADR-nnnn](…)` na ADR-0035 reprova
  `docs:kb:check`. Adenda A3; iteração 1 de TASK-0004.
- **T3 (TASK-0004, omissão do prompt).** Nota de status da ADR-0006 (contrato §9) fora da fronteira
  de TASK-0004. Adenda A4; iteração 1 de TASK-0004.
- **T4 (TASK-0004, `sensor-error`).** `docs:check` sem dependências em `docs/site`; o maestro rodou
  `npm ci` em `docs/site` (ambiente, sem mudança versionada).
- **T5 (`pnpm check`, `sensor-error`).** `verify:parameter-catalogue` varreu `docs/site/build/` (saída
  local do `docs:check`, ignorada pelo git, inexistente no CI); o maestro apagou a saída de build.
  Também `format:check` pegou `prompts/TASK-0006.md` sem Prettier (erro do maestro; formatado).
- **T6 (delivery-review-CTG-0001, REVIEW, 3 achados `high` de detecção do gate).** Iteração 2 do
  Inspector (8 negativos) e do Engineer; rotulagem do id exibido divergente = C-01-09 (decisão do
  Architect, leitura literal §6.5/§7.2; iteração 2b retirou do comentário uma OD inexistente).
- **T7 (delivery-review-CTG-0001-2, REVIEW, 1 achado parcial: §Aliases só na 1ª linha por stub).**
  Dois ciclos esgotados → escalada (método §6; `AUTHORIZATION.md` Emenda 2): iteração 3 do Inspector
  (4 negativos) e do Engineer em **Opus 5.5**; delivery-review-CTG-0001-3 → **PASS**.
- **T8 (CTG-0002 × CTG-0003, `policy-issue` — erro do maestro).** O maestro despachou TASK-0008/0009/0010
  (CTG-0003) enquanto TASK-0005 (CTG-0002) ainda rodava na mesma worktree. Ao conferir a própria
  fronteira, TASK-0005 tomou os READMEs dos outros workers por efeito colateral do `pnpm check` e os
  apagou com `git checkout --`/`rm` — escrita `git` vedada ao worker. Entregas de TASK-0005 conformes;
  as de TASK-0008/0009/0010 perdidas (relatórios preservados como `*-tentativa1.md`). Correção: o
  CTG-0002 é fechado e commitado primeiro; TASK-0008/0009/0010 são redespachados de forma idêntica
  (mesmo `PC-`, sem contar iteração) num branch próprio; **regra adotada: nunca workers de dois CTGs
  simultâneos na mesma worktree** (recomendação ao método).

## Retomada

**Rodada fechada — 2026-09-27.** CTG-0001 (PR #128, `289a072f`), CTG-0002 (PR #129, `681e8d65`) e
CTG-0003 (PR #130, `4bd1d553`) mesclados e observados; closure **PC-0015**; `round seal` recusado
(B2, fica para R-0020). Pendências do Owner: OD-R18-001…005 (OD-R18-003 = aplicar os patches de
`CLAUDE.md`/`AGENTS.md`). Nada a retomar nesta rodada além dessas decisões.

## Leitura

Hash: `220a4020` (`origin/main`, worktree `orchestra/index-state`). Lido pelo maestro, uma vez,
nesta ordem: `AGENTS.md`, `CLAUDE.md`, `CODESTYLE.md`, `docs/meta/agents/README.md`;
`docs/meta/agents/orchestra/{README,model-ladder,waves,task.template.json,worker-prompt.template,reviewer-prompt.template}.md`;
`work/campaigns/C-0002-consolidacao.md`; `DESIGN-DECISIONS.md`, `docs/meta/adr/README.md`, o
status de cada `docs/meta/adr/ADR-*.md` e `law/adr/ADR-0001-devai-1.4.5-stynx-1.1.1-adoption.md`,
`law/adr/README.md`, `work/rounds/README.md`, `record/proofs/compliance/closures/PC-*.json`
(`round_id`, `closed_at`, `merged_as`), `tools/docs/kb/check.mjs` (cabeçalho), `.gitignore`,
`.prettierignore`; `docs/meta/knowledge-base/steering.md` §H,
`docs/meta/knowledge-base/open-decisions-rait.md` (cabeçalho, §A, §F), índice de
`decision-closure-plan.md`; `docs/meta/agents/{architect-blueprint,engineer-backend,inspector-tests,transcriber-docs}.md`;
este `plan.md`; `task.schema.json` 2.0.0 (campos e enums); `work/rounds/R-0015/{AUTHORIZATION.md,compositions.json,tasks/TASK-0001.json}` (forma).
