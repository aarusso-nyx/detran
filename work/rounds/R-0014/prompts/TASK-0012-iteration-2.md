# TASK-0012 — iteração 2 (Codex Terra/alto): documentação de fechamento **completa** (A25)

> Worker da orquestra `portal-pwa`, rodada `R-0014`, CLI do Codex, worktree
> `/Volumes/Thiamat II/stech/detran/.claude/worktrees/r-0009-maestro-execution-33aaac`. Uma
> tarefa; sua **última mensagem é o relatório**. Nunca `git`, nunca instalar, nunca código/testes/
> blueprints/gerados (nem `pnpm parameters:generate` — o maestro roda), nunca `work/rounds/**` fora
> de `contracts/CTG-0003c.md` e `closure.md`. Ninguém responde durante a execução. Comandos longos
> (`pnpm check`) não são seus; os seus gates rodam em < 30 s.

Papel: **Architect (transcrição)** — transcreve decisões já tomadas; não decide. Declare-o na
primeira linha. Manual: `docs/meta/agents/transcriber-docs.md`.

## Por que esta iteração

A iteração 1 (`work/rounds/R-0014/reports/TASK-0012.md`, Luna) entregou 88 linhas: resumiu
OD-P47…P108 num parágrafo, não marcou WP-P4…P6 como executados, não tocou o método
(`orchestra/README.md`) e inventou um parâmetro sem valor. Decisão **A25** (`plan.md` §Adendas —
leia). As correções de fichas T10…T18 da it. 1 **ficam**. Tudo o mais abaixo é exigido, com os
tamanhos mínimos indicados — o reviewer confere item a item.

## Leitura obrigatória (lista fechada)

Igual à de `prompts/TASK-0012.md` (leia-o inteiro: §Leitura, §Pode tocar, §Não pode tocar, §Regras)
**mais**: `plan.md` §Adendas A25; `plan.md` §Retomada (checkpoint 8 — lições); `budget.json`
(`estimated_input_total`, `estimated_output_total`, entradas `kind: reviewer` e as notas dos
workers Codex); `docs/meta/agents/orchestra/README.md` §4 itens 13…18 e §10 (formato da entrada
R-0009 — copie a estrutura "O que custou tempo / O que funcionou / Recomendações");
`docs/framework/arch/parameter-catalogue.md` §PORTAL (tabela) e a linha de `portal.card_payment`
(exemplo de `proposta`).

## Entregáveis (cada um verificável)

1. **`portal-build-pack.md` §2**: nos blocos WP-P4, WP-P5 e WP-P6, um parágrafo "**Executado em
   R-0014**" com: rodada, PRs (#60…#65 com os SHAs de merge), evidências (generic sequence 1…6),
   o que ficou fora e por quê (B1 Lighthouse → `axe` por rota em TestBed, M3; delegações
   `delegacao_indisponivel_r0007` até R-0007; OD-P15/P16/P17/P19/P88 `source_pending`; SNE pelo mock,
   não homologação real). Fonte: `plan.md` §Retomada, `evidence-CTG-*.json`.
2. **`portal-build-pack.md` §4**: subseção "### Questões levantadas na implementação (R-0014,
   OD-P47…P108)" no **mesmo formato tabular** da subseção de R-0009 (colunas ID | Questão | Premissa
   adotada | Dono | Fonte) com **uma linha por OD, as 62** (OD-P47…OD-P108, sem pular; OD-P46
   marcada fechada na tabela existente). Fonte de cada linha: a adenda/contrato/relatório que a
   propôs (`plan.md` A1…A24 e "OD propostas por …"; `contracts/CTG-0003a.md` §10, `CTG-0003b.md`
   §10, `CTG-0003c.md` §10, `CTG-0004.md` §10; relatórios). OD fechadas na rodada (OD-P35/P36/P91
   pelo CTG-0004 §3; OD-P89 estendida A11(e)/A12(i)) com "**fechada**" e a referência.
3. **`portal-frontends.md`** §9: árvore real de `apps/portal/web/src` (do `README.md` do app —
   `app/{core,shared,forms,data,features/*,i18n,a11y,screens}`, `testing/**`) com uma linha por
   pasta; §10: dependências de backend ao fim da rodada (R-0007 delegações; OD-P15/P16/P17/P19/P88;
   o que o CTG-0004 fechou: CNH-e/veículos/quitação pelo mock, SNE via `SnePort`, push M9).
4. **`parameter-catalogue.md`** §PORTAL: as duas linhas de OD-P66 **corrigidas** conforme A25(b):
   `portal.attachment.max_size_mb` int `10`, `portal.attachment.accepted_types` json
   `["application/pdf","image/jpeg","image/png"]`, status **`proposta`**, pend. `não`, fonte
   "spec §7; A6(e); OD-P66", uso "upload de anexos (o app usa `ATTACHMENT_MAX_BYTES`/`accept` fixos
   até o parâmetro ser lido)". Nada mais no catálogo (as colunas da tabela não são reformatadas —
   se o Prettier reformatar, aceite).
5. **`orchestra/README.md`**: §4 item 17 atualizado (allowlist i18n vive em
   `parameter-catalogue.md` §Namespaces e é lida por `tools/parameters/verify.mjs`; exclusão por
   diretório proibida — OD-P46 fechada) e item 18 estendido com as regras aplicadas em R-0014
   (nunca commits no branch de PR aberto; ler vereditos inteiros; Architect explícito por tríade;
   `typecheck` como critério do Inspector; iterações paralelas com fronteiras disjuntas — A12;
   regra transversal só no módulo dono — A12(a); asserções por conjunto de status e escapes
   condicionais vedados — A15; um app isolado por arquivo de spec — A18; nomes
   `SENATRAN_*_BASE_URL` nunca em `backend/**` — A19(c)); **§10: entrada "### R-0014 `portal-pwa`
   (Fable 5.1 → maestro Opus 5 na janela 4; workers/reviewer Codex a partir de 2026-09-19 — B3;
   PRs #60…#65)"** no formato da entrada R-0009 (≥ 25 linhas): o que custou tempo (prompt-reviews
   FAIL de estrutura; A9/A10 cobertura declarada parcial; A12 regra transversal; Codex: comandos
   > 30 s, sandbox sem `pkill`, asserções fracas, 11 iterações do Inspector), o que funcionou
   > (tríade com Architect explícito; contrato como spec; `worker.sh`; ponte com fontes — A24),
   > números do `budget.json` (totais, nº de reviews por CTG, iterações), recomendações.
6. **`waves.md` §Histórico**: linha da R-0014 com PRs, PC `PC-<pendente>`, e o ajuste "Sonnet/médio
   (ou Terra/médio) para Inspectors de matriz grande"; **`model-ladder.md`**: ids Codex confirmados
   (`gpt-5.6-sol|terra|luna`) — já feito na it. 1, confira.
7. **`engineer-frontend.md`**: seção "## Padrão de app (fixado por R-0014; R-0012 copia)" com ≥ 12
   linhas: scripts `build|test|lint|typecheck`, `vitest.config.ts` com `angularJitApplicationTransform`
   (A7a), `src/test-setup.ts`, ESLint flat + angular-eslint, `pnpm check` estendido, `@detran/ui`
   `exports["."]` (M6), i18n `{x}` (A7c), zoneless + `vi.waitFor`, `expectA11yStateInvariants` por
   estado, harness com `HttpClient`, `ErrorBoundary` como único classificador de erro/offline
   (A12(a)), `Idempotency-Key` M17, manifesto de rotas + guardas.
8. **`backlog.md`**: itens OD-P15, P16, P17, P19, P88, P61, P102, P103…P108, B1 Lighthouse, A12(j)
   (contrato 3c) — um item por linha com dono e fonte.
9. **`contracts/CTG-0003c.md`** (A12(j)): §3.8 sem o degrau `access`; critério novo em §8 para o
   banner `portal.errors.assurance_qualified_never_required`; nota em §8 sobre a heurística de
   C-3c-78 — confira o que a it. 1 fez (1 linha) e complete.
10. **`closure.md`** (≥ 40 linhas, método §10): frente; PRs com SHAs; evidências e observações
    (`EV-…` de cada merge — `record/proofs/chain.json` e os commits "observe"); gates por CTG;
    orçamento por janela (`budget.json`: totais e por CTG); desvios B0…B3 e amendments; pendências;
    lições; comando de `round close` a executar pelo maestro.

## Critérios de aceitação

- `node tools/docs/kb/check.mjs` → OK (baseline `import-manifest.json` atualizado no mesmo conjunto);
  `pnpm docs:kb:publish-check` → OK; `pnpm format:check` → OK após `prettier --write` nos tocados.
- `pnpm verify:parameter-catalogue` vai acusar "generated stale" até o maestro regenerar — **não
  é bloqueio seu**; registre a saída.
- `grep -c '^| OD-P' docs/framework/arch/portal-build-pack.md` ≥ 95 (33 de R-0009 + 62 de R-0014);
  cite o número no relatório.
- Nenhuma chave i18n citada nas fichas ausente do catálogo (comando + resultado 0).

## Entrega (última mensagem, formato da TASK-0012, "Tarefa: TASK-0012 (iteração 2)")

Inclua a lista dos 10 entregáveis com "feito / linhas" cada, as duas tabelas (OD → destino →
fonte; ficha → chave), e bloqueios (ou "nenhum").
