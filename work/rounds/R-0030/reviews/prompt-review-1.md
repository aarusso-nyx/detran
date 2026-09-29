# Prompt do reviewer — modo `prompt-review` (`prompt-review` | `delivery-review`)

> Você é o **reviewer** da orquestra `user-docs` (rodada `R-0030`), modelo da família
> **oposta** à do maestro. Você não escreve código nem prompts: você julga. Papel constitucional:
> Auditor (soft gate, Constituição DEVAI Art. 18). Trabalhe somente em leitura na worktree
> `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Responda **apenas** com o JSON do §Saída, sem prosa antes ou depois.

## Contexto mínimo (leia nesta ordem)

1. `docs/meta/agents/orchestra/README.md` §4 (correção formal) e §5 (parcimônia)
2. `docs/meta/agents/README.md` §Regras comuns
3. `work/rounds/R-0030/availability-manifest.schema.md` — apenas a seção do WP `§1–§7` e o "mapa entregável → definições"
4. `work/rounds/R-0030/plan.md`
5. Modo `prompt-review`: todos os arquivos em `work/rounds/R-0030/prompts/`.
   Modo `delivery-review`: `work/rounds/R-0030/reports/*.md`, o diff anexado abaixo e os
   arquivos por ele tocados.

## Rubrica (cada item é verificável; cite arquivo e linha)

| #   | Item                                                                                                                       | Aplica a |
| --- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Papel constitucional declarado e compatível com o que a tarefa toca (Art. 6, 10)                                           | ambos    |
| 2   | Leitura obrigatória fechada e suficiente: o worker consegue executar sem procurar nada fora da lista                       | prompt   |
| 3   | Fronteira de escrita disjunta entre tarefas simultâneas; `target_modules` corretos; nada de `git` para workers             | prompt   |
| 4   | Critérios de aceitação são comandos existentes (`package.json`) ou arquivos verificáveis, com resultado esperado explícito | ambos    |
| 5   | Nenhum valor inventado: prazos, papéis, estados, erros, rótulos vêm de documento canônico ou viram `source_pending`/`OD-*` | ambos    |
| 6   | Tríade respeitada (Architect → Inspector → Engineer) e testes escritos antes da implementação                              | ambos    |
| 7   | Gates não enfraquecidos (nenhum teste relaxado, nenhum `skip`, nenhum arquivo gerado editado à mão)                        | delivery |
| 8   | Vocabulário canônico (tokens de estado, timer, papel, erro) e i18n só na camada de rótulo                                  | ambos    |
| 9   | Fronteira nacional: nada fala com SENATRAN fora de `packages/senatran-adapter` (ADR-0003)                                  | delivery |
| 10  | ADR e OD citados onde a decisão foi tomada; decisões do steering §H respeitadas, não reabertas                             | ambos    |
| 11  | Entrega completa em relação ao critério: nada "deixado para depois" sem registro em §Fora de escopo                        | delivery |
| 12  | Parcimônia: o prompt não manda ler o repositório inteiro; esforço e modelo condizem com `model-ladder.md`                  | prompt   |
| 13  | Matrizes de autorização testam grants positivos e negativas exaustivas para papéis canônicos omitidos; nada por analogia   | ambos    |

## Veredito

- **PASS**: nenhum achado de severidade `high`; achados `low` viram notas.
- **REVIEW**: pelo menos um achado `high` corrigível pelo maestro ou pelo worker sem mudar o plano.
- **FAIL**: o plano ou a entrega contradiz uma definição canônica, uma decisão do Owner, uma ADR ou
  a Constituição; ou a fronteira de escrita foi violada.

Ciclos: o **primeiro** ciclo de cada item é **exaustivo** — liste todos os achados de uma vez. Nos ciclos
seguintes do mesmo item, avalie **somente** as correções dos achados anteriores; um achado novo sobre
texto que não mudou só é admitido se for `FAIL` por definição (contradição canônica, decisão do Owner,
ADR, Constituição ou fronteira de escrita) e deve dizer explicitamente por que não foi levantado antes
(ajuste R-0006).

## Saída (JSON, e nada mais)

```json
{
  "mode": "prompt-review",
  "round": "R-0030",
  "verdict": "PASS | REVIEW | FAIL",
  "findings": [
    {
      "severity": "high | low",
      "item": 4,
      "file": "work/rounds/R-0030/prompts/TASK-0002.md",
      "line": 31,
      "claim": "critério cita `pnpm --filter @detran/rait-web test`, pacote inexistente",
      "fix": "usar `pnpm --filter @detran/ui test` até o app existir"
    }
  ],
  "notes": ["observações não bloqueantes"]
}
```

## Escopo autorizado

O Owner limitou esta sessão às ondas O1–O3, trocou maestro e workers para Codex e reviewer para Claude Code Opus 5.5 (AUTHORIZATION.md). O PR #158 segue aberto; a adenda A-C2-13 do Owner prevalece. Os cinco manifestos D estão ausentes da base; o prompt-review é único no bootstrap e as listas exatas de rotas dos manuais serão anexadas na O4 como reference-gap antes do despacho. Julgue os prompts sob essa condição, preservando fail-closed.

## Material anexado pelo maestro

<file path="work/rounds/R-0030/AUTHORIZATION.md">
# Autorização da R-0030 — `user-docs`

Em 2026-09-29, o Owner autorizou a abertura da R-0030 com o prompt desta sessão, o
`plan.md` e o anexo `availability-manifest.schema.md` de `origin/main`, limitada às
ondas **O1–O3** da seção Execução OD-C2-005. A adenda A-C2-13 do prompt do Owner é
vinculante enquanto o PR #158 não estiver mesclado.

## Troca de família autorizada pelo Owner

- Maestro: Codex Sol 6 (`gpt-6-sol`).
- Workers: Codex, pela escada de `docs/meta/agents/orchestra/model-ladder.md`;
  tarefas grandes com Sol 6, médias com Terra (`gpt-5.6-terra`) e pequenas com
  Luna (`gpt-6-luna`).
- Reviewer independente: Claude Code Opus 5.5 (`claude-opus-5-5`) pela ponte
  `tools/orchestra/bridge.sh claude`.

Esta troca prevalece sobre as atribuições Claude/Opus/Sonnet do plano e do prompt
anteriores. O branch autorizado é `orchestra/user-docs`, a partir de
`origin/main`. Ao fim de cada onda O1–O3 haverá push sem PR. Depois de O3, o
maestro registra o checkpoint de retomada e para, aguardando os manifestos da
fase D (R-0025…R-0029). Não há delivery-review, PR ou evidência nesta sessão.

As decisões OD-UD-001 e OD-UD-002 são solicitadas ao Owner na O1; até resposta,
a publicação de manuais de perfis internos segue fail-closed.

</file>

<file path="work/rounds/R-0030/plan.md">
# R-0030 — frente `user-docs` (ação 1 da C-0002: documentação de usuário por perfil, FAQ, glossário, ajuda contextual, site pt-BR)

**Status:** **proposta — C-0002 rev. 2, aguardando autorização do Owner**. Planejada em 2026-09-26
pelo Architect (`work/campaigns/C-0002-consolidacao.md` §2 fase E, §3.6). Maestro previsto:
**Opus 5.5** (Claude Code), workers pela escada Claude (Opus 5.5 grande e médio, Sonnet 5 pequeno)
por subagentes nativos; reviewer **Sol 6** pela ponte `tools/orchestra/bridge.sh codex` (OD-C2-003;
ids exatos confirmados no bootstrap). Worktree
`/Volumes/Thiamat II/stech/detran-worktrees/user-docs`, branch `orchestra/user-docs`. Nenhum
`AUTHORIZATION.md`, `tasks/` ou `compositions.json` existe: o maestro os cria no bootstrap.
Anexo normativo desta rodada, **antecipado para a fase D**: `availability-manifest.schema.md`.
**Concorrência:** o PR final espera o merge de **R-0025 `rait-web-wiring`, R-0026 `dashboard-wiring`,
R-0027 `portal-delegations`, R-0028 `boat-wiring` e R-0029 `teat-web-wiring`**; a abertura é
antecipada e o conteúdo empilhado conforme §Execução OD-C2-005 (os manuais
descrevem o comportamento já ligado; o manifesto acumulado é o índice de cobertura). Também
precisa em `main`: R-0017 `local-stack` (stack para conferir comportamento), R-0018 `index-state`
(`.gitignore` de `reports/`, índices), R-0019 `law-corpus` (`law/glossary/`), R-0024
`stynx-dedup` (shell único de `@detran/ui`: ponto de ajuda, se existir). **R-0031 `pec-web` pode
abrir em paralelo** (locks disjuntos), mas o CTG de manual PEC de R-0031 e a linha PEC de
`portal-web.availability.json` (hoje de R-0032) dependem de os CTG-0001 e CTG-0003 desta rodada
existirem no branch publicado (empilhar; o PR final deles espera o merge desta rodada), e o CTG de
telas do Portal (hoje o CTG-0004 de R-0032) empilha sobre o CTG-0004 desta rodada (ambos tocam
`apps/portal/web`).
**Janelas previstas:** 4 (1 planejamento + CTG-0001/0002; 2 manuais; 1 ajuda contextual e
fechamento). Recalibradas para ≈ 3 em §Execução OD-C2-005.

## Execução OD-C2-005 (Owner, 2026-09-27)

Esta seção aplica `work/campaigns/C-0002-consolidacao.md` §12 e **prevalece sobre qualquer menção a
um PR/merge/evidência/delivery-review por CTG neste plano**. Metas, tarefas, locks e critérios de
aceitação não mudam; muda só o momento dos gates, que rodam no fim da rodada. A exceção são os
`acceptance_commands` de cada tarefa, que continuam sendo a definição de pronto do worker.

**Ondas.** Branch única `orchestra/user-docs`, até 3 workers na mesma worktree. O maestro serializa
os commits (um por tarefa ou por CTG) e faz push sem PR ao fim de cada onda.

| Onda | Tarefas em paralelo (CTG)                                          | Fronteiras de escrita (disjuntas)                                                                                                                                                                            | Depende de                                                                   |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| O1   | TASK-0001 (CTG-0001)                                               | `docs/framework/arch/user-docs-convention.md`, `availability-manifest.schema.json`, `open-issues.md`, `work/rounds/R-0030/contracts/`                                                                        | bootstrap e prompt-review único                                              |
| O2   | TASK-0002 (CTG-0001) ∥ TASK-0005 (CTG-0002) ∥ TASK-0006 (CTG-0002) | `tools/docs/user-docs/tests/**` ∥ `docs/site/{docusaurus.config.ts,sidebars.ts,scripts/sync-docs.mjs}`, `docs/_ia/*`, `docs/adopters/index.md`, `docs/roles/index.md` ∥ `docs/adopters/manuais/glossario.md` | TASK-0001                                                                    |
| O3   | TASK-0003 (CTG-0001)                                               | `tools/docs/user-docs/check.mjs`, `package.json` (scripts)                                                                                                                                                   | TASK-0002                                                                    |
| O4   | TASK-0004 (CTG-0001)                                               | `teat-mobile.availability.json` e campos `help`/`profiles`/`evidence` dos 5 arquivos da fase D                                                                                                               | TASK-0003; **os 5 manifestos da fase D no branch** (em `main` ou empilhados) |
| O5   | TASK-0007 ∥ TASK-0008 ∥ TASK-0009 (CTG-0003)                       | `docs/adopters/manuais/{cidadao,colegiado-secretaria,agente-transito}/`                                                                                                                                      | TASK-0004, TASK-0005                                                         |
| O6   | TASK-0010 ∥ TASK-0011 ∥ TASK-0012 (CTG-0003)                       | `docs/adopters/manuais/{operador,gestor,auditor-dpo,administrador}/`                                                                                                                                         | TASK-0007; TASK-0008; TASK-0009                                              |
| O7   | TASK-0013 (CTG-0003)                                               | `docs/adopters/manuais/{index,faq}.md`                                                                                                                                                                       | TASK-0006, 0010, 0011, 0012                                                  |
| O8   | TASK-0014 (CTG-0003)                                               | `package.json` (`docs:user:check` no `check`)                                                                                                                                                                | TASK-0013                                                                    |
| O9   | TASK-0015 → TASK-0016 → TASK-0017 (CTG-0004), em série             | `contracts/CTG-0004.md` e `parameter-catalogue.md` → specs de ajuda nos 3 apps → implementação nos 3 apps e campos `help`                                                                                    | TASK-0014                                                                    |
| O10  | TASK-0018 (CTG-0005)                                               | `waves.md`, `backlog.md`, `open-issues.md`, READMEs dos apps                                                                                                                                                 | TASK-0017                                                                    |

Os pushes das ondas O4 (CTG-0001: convenção, esquema e gate) e O8 (CTG-0003: manuais e gate de
cobertura) liberam R-0031 (CTG-0006) e R-0032 (CTG-0005) para empilhar em
`origin/orchestra/user-docs`. O push da O9 (CTG-0004: ajuda contextual no Portal) libera o CTG-0004
de R-0032.

**Abertura empilhada.**

- **Abertura antecipada.** O1–O3 (convenção, esquema, gate com fixtures, site pt-BR e glossário)
  abrem sobre `origin/main` antes do merge das rodadas D. Basta ter R-0017, R-0018, R-0019 e R-0024
  em `main`; R-0024 pode vir empilhado em `origin/orchestra/stynx-dedup`.
- **Conteúdo.** Da O4 em diante, o maestro integra os branches publicados da fase D à medida que
  cada um tiver o seu `*.availability.json`, com `git merge --no-edit origin/orchestra/<frente>`:
  `rait-web-wiring`, `dashboard-wiring`, `portal-delegations`, `boat-wiring` e `teat-web-wiring`.
  Rodada já mesclada entra por `origin/main`. TASK-0004 só despacha com os 5 arquivos no branch.
- **O que espera o merge dos upstreams:** só o PR final. R-0025…R-0029 precisam estar em `main`,
  com STYNX 1.5.0 **final** herdado de R-0022. Os gates `docs:*` são refeitos sobre `main`, porque
  os manifestos das D podem mudar até o merge delas. Divergência volta à rodada dona como issue
  (§Riscos).

**Sequência final** (na ordem de C-0002 §12):

1. `git fetch -q origin` e `git merge --no-edit origin/main`, com R-0025…R-0029 já em `main`.
2. **CI local completo:**
   - `pnpm check` (com `docs:availability:check`, `docs:user:test` e `docs:user:check` encadeados);
   - `pnpm docs:availability:check`, `pnpm docs:user:check` e `pnpm docs:user:test`;
   - `npm ci --prefix docs/site && pnpm docs:check` e `pnpm docs:security`;
   - `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`,
     `pnpm verify:parameter-catalogue` e `pnpm verify:role-catalog`;
   - `pnpm --filter @detran/portal-web lint|test|build`,
     `pnpm --filter @detran/rait-web lint|test|build` e
     `pnpm --filter @detran/teat-mobile lint|test|build`;
   - `pnpm backend:test:ci` (inalterado);
   - `pnpm devai:rc:prepare`, quando aplicável.
3. **Uma delivery-review** (Sol 6) do diff inteiro (`origin/main...HEAD`), com a saída de
   `docs:user:check` e a amostra de 10 rotas por perfil. `REVIEW` admite correções restritas aos
   itens apontados, em no máximo 2 ciclos; `FAIL` → `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template, a tabela CTG → tarefas → commits e o
   resultado dos gates. O pedido de decisão sobre OD-UD-001/002 vai neste PR.
5. **CI remoto.** Falha de código volta à tarefa responsável. Merge só com CI verde e `PASS`.
6. **Publicação final:**
   - `evidence-R-0030.json` com os 5 CTGs, `devai evidence record` e `evidence verify`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` e `devai round seal`;
   - `waves.md`, `work/rounds/README.md` e backlog.

**Janelas recalibradas:** 4 → ≈ 3 de trabalho.

- 1ª janela: bootstrap, prompt-review de TASK-0001…0018 e O1–O3, em paralelo às D.
- 2ª janela: O4–O8 (manuais).
- 3ª janela: O9–O10 e a sequência final.

O calendário depende do merge da última D; a espera não está contada.

## Estado de partida (inspeção de 2026-09-25, `work/campaigns/C-0002-inspecao-2026-09-25/g-documentacao.md` §3, §7)

- **Zero documentação de usuário** para ≈ 250 rotas em 6 superfícies (PORTAL 38, RAIT 74,
  DASHBOARD 22, TEAT mobile 71 com 12 de BOAT, TEAT web 57). O maestro remede no bootstrap sobre
  os manifestos da fase D; os números acima são a linha de base da inspeção, não critério.
- `docs/roles/index.md` e `docs/adopters/index.md` são stubs. `docs/roles/` é a seção de guias de
  papel **constitucional** (Art. 6), não de perfil de usuário.
- Site Docusaurus (`docs/site/docusaurus.config.ts` `i18n.defaultLocale: 'en'`, `locales: ['en']`;
  tagline e navegação em inglês; `sidebars.ts` com 7 seções; `docs/_ia/categories.json` com
  rótulos em inglês). `pnpm docs:check` (CI `foundation`, após `npm ci --prefix docs/site`) só
  valida o conjunto publicado; `sync-docs.mjs` publica as 7 seções e exclui `draft`/`stub`.
- Ajuda in-app mínima: diálogo de atalhos do RAIT (`apps/rait/web/src/app/core/shortcut-help.component.ts`);
  "Ajuda contextual MBFT" do TEAT mobile vazia
  (`apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts` só título e
  "carregando"; ficha `IU-TEAT-context-help`, fonte MBFT, [UC-TEAT-002], [RN-TEAT-115]); três
  telas explicativas do PORTAL (`pontuacao/como-funciona`, `vinculo/por-que-nao-vejo`,
  `carta-servicos`) e `acessibilidade`. DASHBOARD, BOAT e TEAT web: nenhuma.
- Base técnica existente (97% `draft`, escrita para engenheiros): fichas `IU-*`, jornadas `JRN-*`,
  `docs/framework/arch/rait-web-journeys/JW-01…JW-12`. Três glossários desconexos
  (`docs/framework/glossary/domain.md`, `docs/framework/arch/rait-i18n-glossary.md`, `law/glossary/`
  preenchido por R-0019); siglas dos apps e termos de g §4.6 ausentes.
- Catálogos i18n pt-BR por app (`apps/*/*/src/app/i18n/*.pt-BR.json`,
  `apps/boat/mobile/src/lib/i18n/boat.pt-BR.json`) são a fonte dos textos de tela citados.

## Metas

1. **Esquema e manifesto de disponibilidade** (fixados por esta rodada, antecipados no anexo):
   `docs/framework/schemas/availability-manifest.schema.json` confirmado; arquivo
   `teat-mobile.availability.json` (única superfície sem rodada D); os arquivos da fase D
   reconciliados (`help`, `profiles`, `evidence`) até o gate passar.
2. **Convenção** `docs/framework/arch/user-docs-convention.md`: IA, perfis × papéis, anatomia da
   página de manual, âncoras, selos, regras de conteúdo, publicação, ajuda contextual. É a
   convenção que **R-0031 herda** para o manual PEC (§Convenção herdada).
3. **Manuais por perfil** em `docs/adopters/manuais/<perfil>/` (7 perfis: cidadão, agente de
   trânsito, JARI/CETRAN/secretaria, operador, gestor/painel, auditor/DPO, administrador), **FAQ**
   (`faq.md`) e **glossário de usuário** (`glossario.md`), todos em pt-BR.
4. **Site em pt-BR**: `defaultLocale`/`locales` `pt-BR`, rótulos de navegação, seção "Manuais de
   usuário" em Adotantes; publicação por perfil conforme OD-UD-002.
5. **Ajuda contextual** onde a UI já tem ponto de entrada (RAIT atalhos, PORTAL 4 páginas, TEAT
   mobile `context-help`; shell de `@detran/ui` só se R-0024 tiver entregue a posição).
6. **Gates (Inspector → Engineer)**: `docs:availability:check` (manifesto × esquema × código,
   selo × código) e `docs:user:check` (rota × manual, selo do manual × manifesto, texto citado ×
   i18n), ambos em `pnpm check`.

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço   | Lock                                                                                                  | Depende de                                 | Entrega                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------- | -------------------- | ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-arch-user-docs-convention`, `MOD-availability-schema`, `MOD-kb-open-issues`, `MOD-r30-contracts` | —                                          | `docs/framework/arch/user-docs-convention.md` (§1 IA e caminhos; §2 perfis × papéis = anexo §5; §3 anatomia: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`; bloco fixo por rota — Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo —, âncora `rota-<surface>-<slug>`; §4 selos e rótulos; §5 FAQ/glossário; §6 ajuda contextual: pontos de entrada, chave de runtime `helpBaseUrl` ausente ⇒ sem link; §7 publicação; §8 regras de conteúdo; §9 herança R-0031); transcrição do anexo §4 para `availability-manifest.schema.json` se a fase D não o fez; `contracts/CTG-0001.md` (extração de rotas por superfície, regras R1–R8 do anexo §6 e U1–U5 abaixo, formato de saída, códigos de saída, fixtures mínimas); OD-UD-001…005 em `open-issues.md` |
| TASK-0002 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-user-docs-gate-tests`                                                                            | TASK-0001                                  | `tools/docs/user-docs/tests/*.test.mjs` + `tests/fixtures/**`: um caso positivo e **um negativo por regra** R1–R8 e U1–U5; derivação perfil × papel contra `roles.ts` (36 códigos, sem sobra nem falta)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0003 | Engineer             | engineer-backend    | Opus 5.5 / médio | `MOD-user-docs-gate`, `MOD-root-scripts`                                                              | TASK-0002                                  | `tools/docs/user-docs/check.mjs` (Node puro + `typescript` da raiz para ler os `*.routes.ts`/`app.route-manifest.ts`, como `tools/contracts/check-commands.mjs`); scripts `docs:availability:check`, `docs:user:check`, `docs:user:test` (`node --test tools/docs/user-docs/tests/*.test.mjs`); `docs:availability:check` e `docs:user:test` encadeados em `pnpm check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| TASK-0004 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-availability-teat-mobile`, `MOD-availability-reconcile`                                          | TASK-0003                                  | `docs/framework/arch/availability/teat-mobile.availability.json` (rotas não `crash-*`; selo `homologacao`/`ADR-0033`, `ait-speed-measurement` `indisponivel_nesta_versao` com a OD vigente); reconciliação dos 5 arquivos da fase D (`help`, `profiles`, `evidence` — nada além, anexo §2 regra 3) com `history`; `pnpm docs:availability:check` → OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| TASK-0005 | Engineer             | engineer-frontend   | Sonnet 5 / médio | `MOD-docs-site`                                                                                       | TASK-0001                                  | `docs/site/docusaurus.config.ts` (`defaultLocale: 'pt-BR'`, `locales: ['pt-BR']`, tagline, navbar e rodapé em pt-BR, item "Manuais"); `docs/site/sidebars.ts` e `docs/_ia/categories.json` (rótulos pt-BR; categoria `adopters/manuais`); regra de publicação por perfil em `docs/_ia/publication.json` + `docs/site/scripts/sync-docs.mjs` (fail-closed até OD-UD-002); `docs/adopters/index.md` sem "Stub"; linha de ponteiro em `docs/roles/index.md`                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0006 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-user-docs-glossary`                                                                              | TASK-0001                                  | `docs/adopters/manuais/glossario.md`: termos de `law/glossary/` (R-0019) em linguagem de usuário, cada um com a fonte (`REF-*`, `RN-*` ou linha de `law/glossary`); siglas RAIT, TEAT, BOAT ("Boletim de Acidentalidade de Trânsito", `APP-BOAT`), PORTAL, DASHBOARD, PEC; termos de g §4.6 (RENAVAM, CDT, CRLV-e, CNH-e, relator, pauta, diligência, jeton, vista, banca, selo de frescor, camadas N0–N3); termo sem fonte fica fora e é listado no relatório                                                                                                                                                                                                                                                                                                                                                                          |
| TASK-0007 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-cidadao`                                                                               | TASK-0004, TASK-0005                       | `docs/adopters/manuais/cidadao/` (Portal, 38 rotas; login gov.br e níveis, defesa, indicação, recursos JARI/CETRAN, pagamento, SNE, CNH-e/CRLV-e offline, sinistros, exames e junta, ouvidoria, LGPD, acessibilidade)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| TASK-0008 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-colegiado`                                                                             | TASK-0004, TASK-0005                       | `docs/adopters/manuais/colegiado-secretaria/` (RAIT: painel, filas, caso, protocolo, assinatura, autoridade, colegiado; base JW-01…JW-08)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0009 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-agente`                                                                                | TASK-0004, TASK-0005                       | `docs/adopters/manuais/agente-transito/` (TEAT mobile e BOAT embarcado, selo "Em homologação" visível em cada rota, ADR-0033)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| TASK-0010 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-operador`                                                                              | TASK-0007                                  | `docs/adopters/manuais/operador/` (TEAT web, integrações RAIT, triagem do DASHBOARD; JW-11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| TASK-0011 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-gestor`                                                                                | TASK-0008                                  | `docs/adopters/manuais/gestor/` (RAIT gestão/organização/financeiro, DASHBOARD com camadas, frescor e teto legal × SLA, BI do TEAT; JW-09, JW-10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| TASK-0012 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / médio | `MOD-user-docs-auditor-admin`                                                                         | TASK-0009                                  | `docs/adopters/manuais/auditor-dpo/` e `docs/adopters/manuais/administrador/` (trilhas, exportações, LGPD, parâmetros, cadastros; JW-12)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| TASK-0013 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-user-docs-faq`                                                                                   | TASK-0006, TASK-0010, TASK-0011, TASK-0012 | `docs/adopters/manuais/index.md` (entrada por perfil, selos, como pedir ajuda) e `faq.md` (seções por perfil; cada resposta aponta a âncora do manual)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| TASK-0014 | Engineer             | engineer-backend    | Sonnet 5 / baixo | `MOD-root-scripts`                                                                                    | TASK-0013                                  | `docs:user:check` encadeado em `pnpm check`; `pnpm docs:user:check` → OK sobre o corpus real                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| TASK-0015 | Architect            | architect-blueprint | Opus 5.5 / alto  | `MOD-r30-contracts`, `MOD-parameter-catalogue-doc`                                                    | TASK-0014                                  | `contracts/CTG-0004.md`: pontos de entrada (tabela app × arquivo × rótulo i18n × âncora derivada), `helpBaseUrl` nos `runtime-config.ts` de portal/rait/teat-mobile, conteúdo da página MBFT (tópico do contexto + âncora do manual + referência `REF-CONTRAN-985-1003-MBFT`; texto normativo só pela fonte de OD-UD-003), shell de `@detran/ui` (se R-0024 deu posição) ou OD-UD-004; linhas de namespace i18n no `parameter-catalogue.md` §Namespaces i18n se forem necessárias (decisão OD-UD-005)                                                                                                                                                                                                                                                                                                                                   |
| TASK-0016 | Inspector            | inspector-tests     | Sonnet 5 / médio | `MOD-portal-web-help-tests`, `MOD-rait-web-help-tests`, `MOD-teat-mobile-help-tests`                  | TASK-0015                                  | specs por app: link presente só com `helpBaseUrl` configurado; `href` = base + caminho do manual + âncora do manifesto; sem link quando ausente (fail-closed); página MBFT mostra tópico e referência, nenhum texto normativo fora da fonte; axe sem `serious`/`critical`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| TASK-0017 | Engineer             | engineer-frontend   | Opus 5.5 / médio | `MOD-portal-web-help`, `MOD-rait-web-help`, `MOD-teat-mobile-help`, `MOD-availability-reconcile`      | TASK-0016                                  | implementação nos 3 apps; campos `help` dos manifestos atualizados; `docs:availability:check` e `docs:user:check` OK                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| TASK-0018 | Architect (transcr.) | transcriber-docs    | Sonnet 5 / baixo | `MOD-docs`                                                                                            | TASK-0017                                  | `docs/meta/agents/orchestra/waves.md` §Histórico, `docs/meta/knowledge-base/backlog.md`, estado das OD-UD em `open-issues.md`, linha "Manual do usuário" nos `apps/*/*/README.md` existentes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Regras U (cobertura, TASK-0001 as detalha): **U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

**CTGs (commits por CTG na branch única; um PR no fim — OD-C2-005):** CTG-0001 = 0001 → 0002 → 0003 → 0004 (convenção, esquema, gate de
disponibilidade, manifesto TEAT mobile); CTG-0002 = 0005 ∥ 0006 (site pt-BR, glossário);
CTG-0003 = 0007 ∥ 0008 ∥ 0009 → 0010 ∥ 0011 ∥ 0012 → 0013 → 0014 (manuais, FAQ, gate de cobertura;
no máximo 3 workers simultâneos); CTG-0004 = 0015 → 0016 → 0017 (ajuda contextual); CTG-0005 = 0018. Os CTGs seguintes correm na mesma branch, pelas ondas de §Execução OD-C2-005.

**Checkpoints do maestro (Engineer):** (a) bootstrap: `ls docs/framework/arch/availability/` registra
quais dos 5 arquivos da fase D já estão no branch; antes de TASK-0004 (onda O4) os 5 são
obrigatórios (em `main` ou empilhados) — falta de algum é bloqueio (§Bloqueios) com a rodada dona; (b) após
TASK-0005, `npm ci --prefix docs/site` e `pnpm docs:check`; (c) em cada lote de manuais, `pnpm
docs:user:check` rodado localmente (ainda fora do `pnpm check`) e a lista de rotas descobertas
anexada ao relatório; (d) CTG-0004: `pnpm install` só se o lockfile mudar (não deve).

## Critérios de aceitação (comandos → resultado)

- `pnpm docs:availability:check` → `OK (<n> rotas, 6 superfícies, 0 erros)`; `n` = soma das rotas
  extraídas dos `routeSources`, igual à soma das entradas dos 6 arquivos.
- `pnpm docs:user:check` → `OK (<m> rotas de tela cobertas, 7 perfis, 0 divergências de selo)`,
  com `m` = rotas `kind: tela` do manifesto (100% — C-0002 §5).
- `pnpm docs:user:test` → todos os testes verdes; ao menos um negativo por regra R1–R8 e U1–U5.
- `node -e` sobre `docs/framework/schemas/availability-manifest.schema.json`: JSON válido e
  idêntico, semanticamente, ao bloco do anexo §4.
- `grep -n "defaultLocale: 'pt-BR'" docs/site/docusaurus.config.ts` → 1 linha;
  `grep -c "Stub" docs/adopters/index.md` → 0.
- `npm ci --prefix docs/site && pnpm docs:check` → verde; `pnpm docs:security` → verde.
- `pnpm docs:kb:check`, `pnpm docs:kb:publish-check`, `pnpm format:check`,
  `pnpm verify:parameter-catalogue` (`… 0 errors`), `pnpm verify:role-catalog` → verdes.
- `pnpm --filter @detran/portal-web lint|test|build`, `pnpm --filter @detran/rait-web lint|test|build`,
  `pnpm --filter @detran/teat-mobile lint|test|build` → verdes.
- `pnpm check` → verde (com os três scripts novos encadeados); `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável                                     | Definição                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| esquema e manifestos                           | `work/rounds/R-0030/availability-manifest.schema.md`; `apps/*/web/src/app/app.route-manifest.ts`; `apps/teat/*/src/app/app*.routes.ts`, `features/*/*.routes.ts`; `backend/domains/shared/src/roles.ts`; ADR-0033                                                                                                                                                                        |
| convenção                                      | g-documentacao §7–§9; `docs/_ia/categories.json`, `docs/_ia/publication.json`; `docs/site/scripts/sync-docs.mjs`; ADR-0011 (publicação); ADR-0034 (herança PEC)                                                                                                                                                                                                                          |
| manual cidadão                                 | `docs/framework/arch/portal-frontends.md`, `portal-route-contract.md`, `portal-error-catalog.md`; fichas `docs/framework/product/transversal/portal/screens/IU-PORTAL-T*`; `apps/portal/web/src/app/i18n/portal.pt-BR.json`                                                                                                                                                              |
| manual colegiado, gestor, auditor/admin (RAIT) | `docs/framework/arch/rait-web-frontend.md`, `rait-web-journeys/JW-01…JW-12`, `rait-error-catalog.md`, `rait-i18n-glossary.md`; `apps/rait/web/src/app/i18n/rait.pt-BR.json`                                                                                                                                                                                                              |
| manual agente e operador (TEAT/BOAT)           | `docs/framework/arch/teat-frontends.md`, `teat-mobile-contract.md`, `teat-web-contract.md`, `boat-frontends.md`; fichas `IU-TEAT-*`, `IU-BOAT-*`; catálogos `teat.pt-BR.json`, `boat.pt-BR.json`                                                                                                                                                                                         |
| manual gestor (DASHBOARD)                      | `docs/framework/arch/dashboard-frontends.md`, fichas `IU-DASH-D-*`; `dashboard.pt-BR.json`                                                                                                                                                                                                                                                                                               |
| glossário                                      | `law/glossary/` (R-0019), `docs/framework/glossary/domain.md`, `docs/framework/arch/rait-i18n-glossary.md`, `APP.md` de cada app                                                                                                                                                                                                                                                         |
| ajuda contextual                               | `apps/rait/web/src/app/core/shortcut-help.component.ts`; `apps/portal/web/src/app/core/runtime-config.ts`, `apps/rait/web/src/app/core/runtime-config.ts`; `apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts`; `IU-TEAT-context-help`; `docs/reference/legal/contran/REF-CONTRAN-985-1003-MBFT.md`; `docs/framework/arch/frontend-wiring-pattern.md` (R-0024) |
| i18n                                           | `docs/framework/arch/parameter-catalogue.md` §Namespaces i18n (OD-P46)                                                                                                                                                                                                                                                                                                                   |

## ODs propostas (registro canônico: `docs/meta/knowledge-base/open-issues.md`, no commit do CTG-0001)

- **OD-UD-001** — lugar da seção de manuais. Padrão proposto: `docs/adopters/manuais/`, preservando
  a IA de 7 seções (DEVAI). Alternativa: 8ª seção `usuarios`.
- **OD-UD-002** — publicação dos manuais de perfis internos no site público (GitHub Pages).
  Padrão fail-closed até decisão: publicar `cidadao`, `faq` (seção cidadão) e `glossario`; os
  demais ficam versionados, cobertos pelo gate e fora do site.
- **OD-UD-003** — fonte do conteúdo da ajuda MBFT por tópico (pacote normativo ×
  `REF-CONTRAN-985-1003-MBFT`). Padrão: tópico + âncora do manual + referência; nenhum texto
  normativo transcrito sem fonte fechada (`source_pending`).
- **OD-UD-004** — ponto de ajuda em DASHBOARD, TEAT web e BOAT, que hoje não têm entrada. Padrão:
  só se o shell de R-0024 oferecer posição; senão fica fora desta rodada.
- **OD-UD-005** — namespace i18n dos rótulos de ajuda (novo `*.help` × reuso de namespaces
  existentes). Decisão do Architect em TASK-0015; linha na allowlist com esta OD.

## Convenção herdada por R-0031 (manual PEC)

R-0031 **não redefine** nada disto; segue `user-docs-convention.md`:

1. Perfis `clinico` e `regulatorio` (anexo §5) ganham `docs/adopters/manuais/{clinico,regulatorio}/`;
   as telas PEC do candidato entram no manual `cidadao`; telas PEC de `GESTOR_DETRAN`, `AUDITOR`,
   `DPO`, `ADMIN`/`SUPORTE` entram nos manuais `gestor`, `auditor-dpo`, `administrador`.
2. Rotas em `pec-web.availability.json` e, para P-01…P-07, em `portal-web.availability.json`.
3. Selo `bloqueado_por_decisao` com o id DT/OD para as telas do [IU-PEC-001] §E; o manual explica o
   que o usuário pode fazer enquanto isso, sem inventar o valor pendente.
4. Requisitos de [IU-PEC-001] §D valem para o texto do manual: vocabulário legal de resultado,
   dossiê integral para o titular, nenhuma "escolha de clínica", nível de assinatura, prazo como
   direito ("até quando você pode agir").
5. `pnpm docs:user:check` com 9 perfis é critério de R-0031.

## Riscos

- **Valor normativo inventado no manual** (prazos, percentuais, códigos): regra §8 da convenção —
  número só com `REF-*` ou chave de parâmetro citada; U4 prende o texto de tela ao i18n.
- **Exposição pública de manuais internos** (procedimentos de julgamento e auditoria): OD-UD-002
  fail-closed.
- **Manifesto da fase D divergente do código**: corrigido aqui como `reference-gap`, só nos campos
  permitidos (anexo §2 regra 3); divergência de selo ou de nível volta à rodada dona como issue.
- **Volume** (≈ 250 rotas): 6 tarefas de manual em lotes de 3; escrever por módulo, não rota a rota
  isolada; FAQ só depois dos manuais.
- **`law/glossary/` em formato desconhecido** até R-0019 mesclar: TASK-0006 lê o formato real.
- **Build do site**: `docs:check` com `onBrokenLinks: 'throw'` quebra com âncora inexistente — as
  âncoras são geradas pela convenção e conferidas por U1.
- **TEAT/BOAT em homologação** (ADR-0033): o manual do agente não pode prometer uso em campo.

## Lições aplicadas (C-0001 e método §4)

- Relatórios de worker versionados em `work/rounds/R-0030/reports/`; após cada `git add` de grupo,
  `find <dir> -type f` × `git ls-files <dir>` antes do push (lição R-0016: `.gitignore` esconde de
  git e do Prettier).
- Critérios de aceitação imutáveis: mudança só por adenda numerada com decisão do Owner; critério
  substituído vai ao `closure.json` como não cumprido (nada de trocas como R-0013/R-0014).
- ODs no registro canônico no mesmo PR que as cita (`open-issues.md`); nenhuma OD vive só em
  `contracts/`.
- Âncora da prova: `devai evidence record` por CTG, `evidence verify`, `audit observe` no SHA exato
  do merge, `round close` e `round seal` (DEVAI 1.5.6).
- `budget.json` obrigatório; ao atingir 80% da janela, checkpoint e parada.
- Caracterização antes de troca: a ajuda contextual não altera comportamento existente; specs dos
  três apps rodam antes e depois (TASK-0016 registra a linha de base).
- Nenhum worker escreve o teste do próprio artefato: gate → Inspector; manuais → gate `docs:user:check`.
- Transcrição (manuais, glossário, FAQ, manifesto) é ato de Architect por `transcriber-docs`.
- Chave i18n nova entra na allowlist (OD-P46) antes de entrar em código; nunca exclusão por
  diretório.

## Decisões do maestro

### M1 — bootstrap e troca de família (Owner, 2026-09-29)

O prompt desta sessão autoriza somente O1–O3 sobre `origin/main`, no branch
`orchestra/user-docs`; prevalece sobre as atribuições de família no cabeçalho,
na tabela de tarefas e no prompt anterior. Maestro **Codex Sol 6**
(`gpt-6-sol`); workers Codex **Sol 6** (`gpt-6-sol`) para Architect/tarefas
grandes, **Terra** (`gpt-5.6-terra`) para nível médio e **Luna**
(`gpt-6-luna`) para nível pequeno; reviewer independente **Claude Code Opus
5.5** (`claude-opus-5-5`) por `tools/orchestra/bridge.sh claude`. Os comandos
`codex --help` e `claude --help` confirmaram, respectivamente, as opções `-m`
e `--model`; os IDs exatos seguem a escada `model-ladder.md`, previamente
testada em R-0018. As versões locais são `codex-cli 0.157.1` e Claude Code
`2.1.283` (doctor). O PR #158 da adenda A-C2-13 estava aberto no bootstrap;
o texto do Owner nesta sessão aplica a adenda. O checkout inicial e
`origin/main` estavam em `c325f9b540e0b6696395f3442d7f920909ca3b76`,
limpos. Worktree gerenciada criada em
`/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`.

Não se executa `pnpm check` completo no bootstrap, por OD-C2-005 §12; os
`acceptance_commands` por tarefa e o prompt-review único continuam. A sessão
encerra após O3, com push sem PR ao fim de cada onda e checkpoint em §Retomada.

## Concorrência

Em `origin/main` no bootstrap: R-0017 (`local-stack`), R-0018
(`index-state`) e R-0019 (`law-corpus`) já integradas. R-0024 (`stynx-dedup`)
e R-0025…R-0029 ainda não estão em `main`; não há
`docs/framework/arch/availability/` no branch base. O1–O3 estão liberadas
pela adenda A-C2-13 sem esses manifestos. O4 e TASK-0004 esperam os cinco
arquivos da fase D no branch. R-0031 `pec-web` tem branch local em outra
worktree, com locks disjuntos; o manual PEC e R-0032 dependem do branch
publicado desta rodada conforme §Execução OD-C2-005. Locks partilhados:
`package.json`, `parameter-catalogue.md`, `open-issues.md` e `waves.md`;
integrar `origin/main` por merge antes do PR final, sem rebase após o push.

## Bloqueios

## Triagem

## Retomada

## Leitura

Base lida: `c325f9b540e0b6696395f3442d7f920909ca3b76` (`origin/main`).
Leituras de bootstrap: `AGENTS.md`, `CODESTYLE.md`,
`docs/meta/agents/{README.md,orchestra/README.md,orchestra/model-ladder.md,orchestra/waves.md}`;
`work/campaigns/C-0002-consolidacao.md` §12 e §14 (adenda A-C2-13 suprida
pelo prompt do Owner enquanto #158 está aberto);
`work/rounds/R-0030/{plan.md,availability-manifest.schema.md,prompts/00-maestro.md}`;
`docs/meta/adr/ADR-0011-phase-6-documentation-publication.md`,
`ADR-0033-teat-ui-workflow-homologation-scope.md`,
`ADR-0034-pec-web-frontend.md`; IA, publicação e site em
`docs/_ia/{categories,publication}.json` e `docs/site/`;
`backend/domains/shared/src/roles.ts`, `tools/contracts/check-commands.mjs`,
`docs/framework/arch/parameter-catalogue.md` §Namespaces i18n,
`docs/meta/knowledge-base/{decision-closure-plan,steering,open-issues}.md`
e os cinco manuais de papel de `docs/meta/agents/`. O
`frontend-wiring-pattern.md` de R-0024 e os cinco manifestos da fase D ainda
não existem na base, conforme §Concorrência.

</file>

<file path="work/rounds/R-0030/availability-manifest.schema.md">
# Anexo de R-0030 — esquema do manifesto de disponibilidade (versão 1.0.0)

**Autoridade:** Architect (Constitution Art. 6), 2026-09-26, campanha C-0002 rev. 2 §3.5–§3.6.
**Status:** **normativo para R-0025…R-0029 e R-0031** a partir da autorização do Owner da campanha.
Este anexo **antecipa** o esquema que R-0030 fixa: as rodadas da fase D rodam antes de R-0030, e
cada uma entrega o delta do manifesto das suas rotas (um arquivo) já nesta forma. R-0030 transcreve
o bloco JSON Schema do §4 sem alteração semântica para
`docs/framework/schemas/availability-manifest.schema.json` e entrega o gate que o executa (§6).
Mudança no esquema depois da autorização só por adenda numerada neste anexo, com decisão do Owner.

## 1. Caminhos canônicos

| Artefato                                     | Caminho                                                                                                   | Dono                                                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Esquema (JSON Schema 2020-12)                | `docs/framework/schemas/availability-manifest.schema.json`                                                | a **primeira** rodada da fase D a mesclar transcreve o §4 literalmente; as demais reutilizam; R-0030 o confirma |
| Manifesto por superfície                     | `docs/framework/arch/availability/<surface>.availability.json`                                            | a rodada da tabela §2                                                                                           |
| Convenção de manuais que consome o manifesto | `docs/framework/arch/user-docs-convention.md`                                                             | R-0030 (TASK-0001)                                                                                              |
| Gate                                         | `tools/docs/user-docs/check.mjs` (scripts `docs:availability:check`, `docs:user:check`, `docs:user:test`) | R-0030                                                                                                          |

Nenhum outro caminho é aceito (nem `work/rounds/*/route-manifest.md`, que continua sendo
artefato de trabalho da rodada). O manifesto descreve **o código mesclado**, não a intenção.

## 2. Superfícies e donos

| `surface`       | App hospedeiro (`hostApp`)                                    | Fonte de rotas no código (`routeSources`)                                                                                                       | Rodada dona                                                     |
| --------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `rait-web`      | `apps/rait/web`                                               | `apps/rait/web/src/app/app.route-manifest.ts`                                                                                                   | R-0025                                                          |
| `dashboard-web` | `apps/dashboard/web`                                          | `apps/dashboard/web/src/app/app.route-manifest.ts`                                                                                              | R-0026                                                          |
| `portal-web`    | `apps/portal/web`                                             | `apps/portal/web/src/app/app.route-manifest.ts`                                                                                                 | R-0027 (R-0031 acrescenta as rotas PEC P-01…P-07)               |
| `boat`          | `apps/teat/mobile` e `apps/teat/web` (por rota, campo `host`) | páginas `boat-crash-*` montadas nas rotas `crash-*` do TEAT mobile; `apps/teat/web/src/app/features/sinistros/sinistros.routes.ts`              | R-0028                                                          |
| `teat-web`      | `apps/teat/web`                                               | `apps/teat/web/src/app/app.routes.ts`, `app.homologation.routes.ts`, `features/*/*.routes.ts` (exceto `sinistros`, que é de `boat`)             | R-0029                                                          |
| `teat-mobile`   | `apps/teat/mobile`                                            | `apps/teat/mobile/src/app/app.routes.ts`, `app.homologation.routes.ts`, `features/*/*.routes.ts` (exceto as rotas `crash-*`, que são de `boat`) | R-0030 (nenhuma rodada da fase D liga o TEAT mobile; C-0002 §6) |
| `pec-web`       | `apps/pec/web`                                                | `apps/pec/web/src/app/app.route-manifest.ts` (a criar)                                                                                          | R-0031                                                          |

Regras de posse:

1. Cada rota do código aparece em **exatamente um** arquivo. A rota pertence à superfície da
   rodada que a ligou; `host` registra o app que a monta quando difere de `hostApp`.
2. Se `app.route-manifest.ts` mudar de forma ou de lugar por R-0024 (kit de app único), a rodada
   aponta `routeSources` para o novo arquivo; o gate lê o que está listado.
3. Uma rodada posterior só altera o arquivo de outra superfície pelo próprio lock declarado no
   `plan.md` e acrescenta uma linha em `history`. R-0030 pode alterar apenas `help` e completar
   `profiles`/`evidence` faltantes (triagem `reference-gap`, nunca reabre a rodada dona).

## 3. Forma do arquivo

```json
{
  "$schema": "../../schemas/availability-manifest.schema.json",
  "schemaVersion": "1.0.0",
  "surface": "rait-web",
  "hostApp": "apps/rait/web",
  "package": "@detran/rait-web",
  "measuredAt": "<sha-40 do main integrado em que o código foi medido>",
  "routeSources": ["apps/rait/web/src/app/app.route-manifest.ts"],
  "routes": [
    {
      "id": "rait-web:painel",
      "path": "painel",
      "kind": "tela",
      "screen": "IU-RAIT-T01",
      "module": "painel",
      "audience": "interno",
      "roles": ["rait-analyst", "rait-coordinator"],
      "profiles": ["colegiado-secretaria"],
      "level": "L2",
      "seal": "disponivel",
      "decision": null,
      "actions": [
        {
          "id": "claim-next",
          "operationId": "<operationId do contrato>",
          "seal": "disponivel",
          "decision": null
        }
      ],
      "help": { "entry": "atalhos", "key": null },
      "evidence": {
        "files": ["apps/rait/web/src/app/features/painel/pages/<pagina>.ts"],
        "tests": [
          "apps/rait/web/src/app/features/painel/pages/<pagina>.spec.ts"
        ]
      }
    }
  ],
  "history": [
    { "round": "R-0025", "date": "AAAA-MM-DD", "note": "arquivo criado" }
  ]
}
```

Os valores entre `<…>` do exemplo são marcadores deste anexo, não valores a copiar.

- `id` = `<surface>:<path>`; `path` exatamente como no roteador, sem barra inicial (`""` = raiz).
- `kind`: `tela` (exige manual) ou `auxiliar` (callback, sem permissão, não encontrado,
  indisponível genérico; aparece no manifesto e fica fora da cobertura de manual).
- `screen`: id da ficha `IU-*` ou `null`; `module`: pasta de feature ou `core`.
- `audience`: `publico` (sem login), `cidadao` (login gov.br) ou `interno`. `roles` são códigos
  exatos de `backend/domains/shared/src/roles.ts` (`DETRAN_ROLES`) que **abrem** a rota pelas
  guardas vigentes; vazio só para `publico`.
- `profiles`: perfis de manual, **derivados** de `roles` pela tabela do §5 (o gate recalcula e
  compara). Para `publico`/`cidadao` o perfil é `cidadao`.
- `level`: nível do código (`L0` página "indisponível nesta versão", `L1` leitura sem ação,
  `L2` ligada). Superfícies sem campo de nível no manifesto de código declaram o nível medido.
- `actions`: comandos que a tela expõe (opcional para telas só de leitura); `operationId` do
  contrato `docs/framework/contracts/*.commands.openapi.json`.
- `help.entry`: `nenhum` | `atalhos` | `pagina` | `link`; `help.key`: chave i18n do rótulo ou
  `null`. As rodadas D declaram o que existe; R-0030 atualiza ao ligar a ajuda contextual.
- `evidence.files`: componentes/páginas/clientes que implementam a rota (existem no repositório);
  `evidence.tests`: specs que provam o nível e o selo.

## 4. JSON Schema (transcrever literalmente)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://detran.example.invalid/schemas/availability-manifest.schema.json",
  "title": "Availability Manifest",
  "description": "Manifesto de disponibilidade por superfície (C-0002; work/rounds/R-0030/availability-manifest.schema.md). Descreve o código mesclado; o gate tools/docs/user-docs/check.mjs confere rota × código × selo × manual.",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schemaVersion",
    "surface",
    "hostApp",
    "package",
    "measuredAt",
    "routeSources",
    "routes",
    "history"
  ],
  "properties": {
    "$schema": { "type": "string" },
    "schemaVersion": { "const": "1.0.0" },
    "surface": {
      "enum": [
        "rait-web",
        "dashboard-web",
        "portal-web",
        "boat",
        "teat-web",
        "teat-mobile",
        "pec-web"
      ]
    },
    "hostApp": { "type": "string", "pattern": "^apps/[a-z]+/(web|mobile)$" },
    "package": { "type": "string", "pattern": "^@detran/[a-z-]+$" },
    "measuredAt": { "type": "string", "pattern": "^[0-9a-f]{40}$" },
    "routeSources": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string" }
    },
    "routes": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/route" }
    },
    "history": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["round", "date", "note"],
        "properties": {
          "round": { "type": "string", "pattern": "^R-[0-9]{4}$" },
          "date": { "type": "string", "format": "date" },
          "note": { "type": "string", "minLength": 1 }
        }
      }
    }
  },
  "$defs": {
    "seal": {
      "enum": [
        "disponivel",
        "parcial",
        "homologacao",
        "indisponivel_nesta_versao",
        "bloqueado_por_decisao"
      ]
    },
    "decision": {
      "type": ["string", "null"],
      "pattern": "^(OD|DT|ADR)-[A-Za-z0-9-]+$"
    },
    "profile": {
      "enum": [
        "cidadao",
        "agente-transito",
        "colegiado-secretaria",
        "operador",
        "gestor",
        "auditor-dpo",
        "administrador",
        "clinico",
        "regulatorio"
      ]
    },
    "route": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "path",
        "kind",
        "screen",
        "module",
        "audience",
        "roles",
        "profiles",
        "level",
        "seal",
        "decision",
        "help",
        "evidence"
      ],
      "properties": {
        "id": { "type": "string", "pattern": "^[a-z-]+:.*$" },
        "path": { "type": "string" },
        "host": { "type": "string", "pattern": "^apps/[a-z]+/(web|mobile)$" },
        "kind": { "enum": ["tela", "auxiliar"] },
        "screen": { "type": ["string", "null"], "pattern": "^IU-[A-Z0-9-]+$" },
        "module": { "type": "string", "minLength": 1 },
        "audience": { "enum": ["publico", "cidadao", "interno"] },
        "roles": {
          "type": "array",
          "uniqueItems": true,
          "items": { "type": "string" }
        },
        "profiles": {
          "type": "array",
          "uniqueItems": true,
          "items": { "$ref": "#/$defs/profile" }
        },
        "level": { "enum": ["L0", "L1", "L2"] },
        "seal": { "$ref": "#/$defs/seal" },
        "decision": { "$ref": "#/$defs/decision" },
        "actions": {
          "type": "array",
          "items": {
            "type": "object",
            "additionalProperties": false,
            "required": ["id", "operationId", "seal", "decision"],
            "properties": {
              "id": { "type": "string", "minLength": 1 },
              "operationId": { "type": ["string", "null"] },
              "seal": { "$ref": "#/$defs/seal" },
              "decision": { "$ref": "#/$defs/decision" }
            }
          }
        },
        "help": {
          "type": "object",
          "additionalProperties": false,
          "required": ["entry", "key"],
          "properties": {
            "entry": { "enum": ["nenhum", "atalhos", "pagina", "link"] },
            "key": { "type": ["string", "null"] }
          }
        },
        "evidence": {
          "type": "object",
          "additionalProperties": false,
          "required": ["files", "tests"],
          "properties": {
            "files": {
              "type": "array",
              "minItems": 1,
              "items": { "type": "string" }
            },
            "tests": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    }
  }
}
```

## 5. Perfis de manual × papéis (derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

## 6. Selos e coerência selo × código (regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### 6.1 Marcadores de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

## 7. Obrigações das rodadas da fase D (até o gate existir)

1. Entregar o arquivo da sua superfície no CTG de documentação, medido sobre o `main` integrado
   (`measuredAt`), com `history` iniciado.
2. O Inspector da rodada prova R1 e R3 por teste do próprio app (rotas do código × arquivo) e o
   maestro valida o JSON (`node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <arquivo>`)
   e confere manualmente os enums deste anexo; divergência encontrada depois por R-0030 é
   `reference-gap` corrigido por R-0030, nunca motivo para reabrir a rodada dona.
3. Não escrever manual de usuário (C-0002 §3.5); `help.entry` descreve só o que o código já tem.
4. Se a rodada for a primeira a mesclar, transcrever o §4 para
   `docs/framework/schemas/availability-manifest.schema.json` e acrescentar a linha na tabela de
   `docs/framework/schemas/README.md`.

</file>

<file path="work/rounds/R-0030/prompts/TASK-0001.md">
# Prompt de worker — `TASK-0001` (`architect-blueprint`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/architect-blueprint.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0001; dependências: nenhuma. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/architect-blueprint.md`
- `docs/_ia/categories.json`
- `docs/_ia/publication.json`
- `docs/site/scripts/sync-docs.mjs`
- `docs/meta/adr/ADR-0011-phase-6-documentation-publication.md`
- `docs/meta/adr/ADR-0033-teat-ui-workflow-homologation-scope.md`
- `docs/meta/adr/ADR-0034-pec-web-frontend.md`
- `backend/domains/shared/src/roles.ts`
- `docs/meta/knowledge-base/open-issues.md`
- `tools/contracts/check-commands.mjs`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/schemas/availability-manifest.schema.json`
- `work/rounds/R-0030/contracts/CTG-0001.md`
- `docs/meta/knowledge-base/open-issues.md`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva a convenção nas nove seções do plano; transcreva literalmente o JSON Schema do anexo §4 se ausente; feche CTG-0001 com extração AST por superfície, R1–R8, U1–U5, saída/códigos e fixtures; registre OD-UD-001…005 no registro canônico.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm format:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm docs:kb:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `node -e "JSON.parse(require('fs').readFileSync('docs/framework/schemas/availability-manifest.schema.json','utf8'))"` → JSON válido e semanticamente idêntico ao anexo §4.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0001
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0002.md">
# Prompt de worker — `TASK-0002` (`inspector-tests`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/inspector-tests.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0001; dependências: TASK-0001. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0030/contracts/CTG-0001.md`
- `backend/domains/shared/src/roles.ts`
- `tools/contracts/check-commands.mjs`
- `docs/framework/schemas/availability-manifest.schema.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `tools/docs/user-docs/tests/*.test.mjs`
- `tools/docs/user-docs/tests/fixtures/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Crie testes e fixtures positivos e negativos para cada R1–R8 e U1–U5. Teste a derivação dos 36 papéis de roles.ts sem sobra, falta ou repetição. Entregue sensores RED quando o gate ainda não existir; não implemente check.mjs.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm format:check` → PASS, 0 erros; na tríade Inspector a ausência temporária de implementação é RED esperado e deve ser registrada
- `node --test tools/docs/user-docs/tests/*.test.mjs` → sensores podem ficar RED antes de TASK-0003; relatar cada falha esperada e nenhum falso verde.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Inspector
Tarefa: TASK-0002
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0003.md">
# Prompt de worker — `TASK-0003` (`engineer-backend`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/engineer-backend.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0001; dependências: TASK-0002. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/engineer-backend.md`
- `work/rounds/R-0030/contracts/CTG-0001.md`
- `tools/docs/user-docs/tests/*.test.mjs`
- `tools/docs/user-docs/tests/fixtures/**`
- `tools/contracts/check-commands.mjs`
- `package.json`
- `backend/domains/shared/src/roles.ts`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `tools/docs/user-docs/check.mjs`
- `package.json`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Implemente check.mjs em Node puro com TypeScript AST para rotas; satisfaça os testes do Inspector. Adicione docs:availability:check, docs:user:check, docs:user:test no package.json e encadeie availability e user:test em check; user:check só em TASK-0014.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:test` → PASS para positivos e negativos de fixtures R1–R8 e U1–U5, 0 falhas.
- `pnpm docs:availability:check` → **reference-gap esperado nesta sessão A-C2-13**: falha explícita pelos cinco manifestos da fase D ausentes. O gate jamais dá PASS vazio. O resultado final `OK (<n> rotas, 6 superfícies, 0 erros)` fica diferido até O4/TASK-0004, sem alterar o critério imutável do plano. Registre a saída literal.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Engineer
Tarefa: TASK-0003
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0004.md">
# Prompt de worker — `TASK-0004` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0001; dependências: TASK-0003. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/*.availability.json`
- `apps/teat/mobile/src/app/app.routes.ts`
- `apps/teat/mobile/src/app/app.homologation.routes.ts`
- `apps/teat/mobile/src/app/features/*/*.routes.ts`
- `docs/meta/adr/ADR-0033-teat-ui-workflow-homologation-scope.md`
- `backend/domains/shared/src/roles.ts`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/framework/arch/availability/teat-mobile.availability.json`
- `docs/framework/arch/availability/{rait-web,dashboard-web,portal-web,boat,teat-web}.availability.json (somente help/profiles/evidence/history)`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Crie o manifesto teat-mobile para todas as rotas exceto crash-*; homologacao/ADR-0033, ait-speed-measurement indisponivel_nesta_versao com OD vigente. Reconcilie exclusivamente help/profiles/evidence e history nos cinco manifestos D. Só iniciar com os cinco manifestos presentes.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:availability:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Pré-condição: os cinco manifestos da fase D estão presentes e reconciliáveis; falta → bloqueio, sem escrita especulativa.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0004
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0005.md">
# Prompt de worker — `TASK-0005` (`engineer-frontend`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/engineer-frontend.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0002; dependências: TASK-0001. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/engineer-frontend.md`
- `docs/site/docusaurus.config.ts`
- `docs/site/sidebars.ts`
- `docs/site/scripts/sync-docs.mjs`
- `docs/_ia/categories.json`
- `docs/_ia/publication.json`
- `docs/adopters/index.md`
- `docs/roles/index.md`
- `docs/framework/arch/user-docs-convention.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/site/docusaurus.config.ts`
- `docs/site/sidebars.ts`
- `docs/site/scripts/sync-docs.mjs`
- `docs/_ia/categories.json`
- `docs/_ia/publication.json`
- `docs/adopters/index.md`
- `docs/roles/index.md`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Converta o site, navegação, rodapé, sidebars e IA para pt-BR; adicione Manuais em Adotantes; publique fail-closed só cidadao, FAQ cidadão e glossário até OD-UD-002; retire Stub de adopters e deixe ponteiro em roles.

## Definições vinculantes

Padrão OD-UD-002: publicar somente cidadão, FAQ da seção cidadão e glossário; todos os demais manuais permanecem versionados e cobertos pelo gate, mas fora do site público até decisão do Owner. A IA mantém sete seções.

## Critérios de aceitação

- `pnpm docs:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm docs:security` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Engineer
Tarefa: TASK-0005
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0006.md">
# Prompt de worker — `TASK-0006` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0002; dependências: TASK-0001. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `law/glossary/**`
- `docs/framework/glossary/domain.md`
- `docs/framework/arch/rait-i18n-glossary.md`
- `apps/boat/mobile/README.md`
- `docs/framework/arch/user-docs-convention.md`
- `work/campaigns/C-0002-inspecao-2026-09-25/g-documentacao.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/glossario.md`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Redija glossário em linguagem de usuário, cada termo com REF-_, RN-_ ou linha de law/glossary. Cubra siglas e termos do plano; se faltar fonte, omita e relate.

## Definições vinculantes

Termos mandatórios com fonte: RAIT, TEAT, BOAT (Boletim de Acidentalidade de Trânsito, APP-BOAT), PORTAL, DASHBOARD, PEC, RENAVAM, CDT, CRLV-e, CNH-e, relator, pauta, diligência, jeton, vista, banca, selo de frescor, camadas N0–N3. Omitir e listar termos sem fonte.

## Critérios de aceitação

- `pnpm docs:kb:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm format:check` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0006
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0007.md">
# Prompt de worker — `TASK-0007` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0004, TASK-0005. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/portal-web.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/portal-frontends.md`
- `docs/framework/arch/portal-route-contract.md`
- `docs/framework/arch/portal-error-catalog.md`
- `apps/portal/web/src/app/i18n/portal.pt-BR.json`
- `docs/framework/product/transversal/portal/screens/IU-PORTAL-T*`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/cidadao/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manual do cidadão para cada rota de tela do perfil no manifesto portal-web, incluindo login, defesa, indicação, recursos, pagamento, SNE, documentos offline, sinistros, exames, ouvidoria, LGPD e acessibilidade apenas se o código e fontes confirmarem.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0007
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0008.md">
# Prompt de worker — `TASK-0008` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0004, TASK-0005. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/rait-web.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/rait-web-frontend.md`
- `docs/framework/arch/rait-web-journeys/JW-01-analista.md`
- `docs/framework/arch/rait-web-journeys/JW-02-coordenador.md`
- `docs/framework/arch/rait-web-journeys/JW-03-secretaria-protocolo.md`
- `docs/framework/arch/rait-web-journeys/JW-04-secretaria-colegiado.md`
- `docs/framework/arch/rait-web-journeys/JW-05-autoridade-signataria.md`
- `docs/framework/arch/rait-web-journeys/JW-06-autoridade-centralizada.md`
- `docs/framework/arch/rait-web-journeys/JW-07-relator.md`
- `docs/framework/arch/rait-web-journeys/JW-08-presidente.md`
- `docs/framework/arch/rait-error-catalog.md`
- `apps/rait/web/src/app/i18n/rait.pt-BR.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/colegiado-secretaria/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manual colegiado-secretaria cobrindo cada rota de tela RAIT cujo profiles contém o perfil, com JW-01…JW-08 e evidência de código.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0008
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0009.md">
# Prompt de worker — `TASK-0009` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0004, TASK-0005. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/teat-mobile.availability.json`
- `docs/framework/arch/availability/boat.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/teat-frontends.md`
- `docs/framework/arch/teat-mobile-contract.md`
- `docs/framework/arch/boat-frontends.md`
- `apps/teat/mobile/src/app/i18n/teat.pt-BR.json`
- `apps/boat/mobile/src/lib/i18n/boat.pt-BR.json`
- `docs/meta/adr/ADR-0033-teat-ui-workflow-homologation-scope.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/agente-transito/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manual agente-transito cobrindo cada rota de tela teat-mobile e boat cujo profiles contém o perfil. Exiba Em homologação em cada bloco pertinente, conforme ADR-0033.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0009
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0010.md">
# Prompt de worker — `TASK-0010` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0007, TASK-0008, TASK-0009. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/teat-web.availability.json`
- `docs/framework/arch/availability/rait-web.availability.json`
- `docs/framework/arch/availability/dashboard-web.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/teat-frontends.md`
- `docs/framework/arch/teat-web-contract.md`
- `docs/framework/arch/rait-web-journeys/JW-11-operador-integracao.md`
- `apps/teat/web/src/app/i18n/teat.pt-BR.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/operador/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manual operador cobrindo cada rota de tela teat-web, rait-web e dashboard-web cujo profiles contém o perfil; use JW-11.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0010
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0011.md">
# Prompt de worker — `TASK-0011` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0007, TASK-0008, TASK-0009. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/rait-web.availability.json`
- `docs/framework/arch/availability/dashboard-web.availability.json`
- `docs/framework/arch/availability/teat-web.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/rait-web-journeys/JW-09-gestor.md`
- `docs/framework/arch/rait-web-journeys/JW-10-rh-financeiro.md`
- `docs/framework/arch/dashboard-frontends.md`
- `apps/dashboard/web/src/app/i18n/dashboard.pt-BR.json`
- `apps/rait/web/src/app/i18n/rait.pt-BR.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/gestor/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manual gestor cobrindo cada rota de tela RAIT, DASHBOARD e TEAT web cujo profiles contém o perfil; distinga teto legal de SLA e cite fontes para camadas/frescor.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0011
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0012.md">
# Prompt de worker — `TASK-0012` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0007, TASK-0008, TASK-0009. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/availability/rait-web.availability.json`
- `docs/framework/arch/availability/dashboard-web.availability.json`
- `docs/framework/arch/availability/portal-web.availability.json`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/rait-web-journeys/JW-12-auditor-admin.md`
- `docs/framework/arch/rait-web-frontend.md`
- `apps/rait/web/src/app/i18n/rait.pt-BR.json`
- `apps/dashboard/web/src/app/i18n/dashboard.pt-BR.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/auditor-dpo/**`
- `docs/adopters/manuais/administrador/**`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Escreva manuais auditor-dpo e administrador, cada um cobrindo suas rotas de tela em todos os manifestos aplicáveis. Inclua trilhas, exportações, LGPD, parâmetros e cadastros só se as fontes/código sustentarem.

## Definições vinculantes

### Anatomia e corpus

Anatomia obrigatória de cada página: front matter `id: MAN-<PERFIL>-<n>`, `status`, `perfil`, `superficies`, `updated`. Para cada rota de tela do perfil, cabeçalho com âncora `rota-<surface>-<slug>` e blocos **Para que serve · Quem acessa · Como fazer · Estados e mensagens · Prazos (como direito) · Selo**. `slug` é derivado do `path` do manifesto, segundo a convenção. Selo escrito = rótulo exato do manifesto. Texto de tela citado entre `«…»` deve ser valor literal do catálogo pt-BR da superfície. Números normativos só com REF-* ou chave do catálogo de parâmetros citada; caso contrário `source_pending`/OD no relatório. Não descreva ação parcial, bloqueada ou L0 como disponível. Cada rota `kind: tela` exige bloco em cada perfil de `profiles`; `auxiliar` não exige bloco. Rotas sem manifesto são proibidas.

OD-C2-005 e A-C2-13: os cinco manifestos da fase D estão ausentes no bootstrap; portanto a lista de rotas deste prompt é **vazia/condicional agora**, e isto não autoriza escrever manual vazio. Na O4, depois de integrar os cinco manifestos e concluir TASK-0004, o maestro anexa a este prompt o inventário fechado do perfil em `id | path | screen | seal | decision` (cada rota `kind=tela`, `profiles` contendo o perfil). Esse anexo é a resolução do `reference-gap` de bootstrap, sem segundo prompt-review conforme direção do Owner. O anexo traz linhas exatas do manifesto, não instruções abertas; o maestro atualiza o hash e `prompt_composition_id` após anexá-lo, antes do despacho. Antes de receber esse inventário, pare; não use as contagens da inspeção como rotas presumidas. No relatório, reproduza a tabela exata e prove cobertura 100% dela.

### Selos

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- Inventário por perfil `id | path | screen | seal | decision` no relatório; `pnpm docs:user:check` → cobertura 100% do lote quando os demais lotes prontos; registrar falhas temporárias de outros perfis sem editar seus arquivos.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0012
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0013.md">
# Prompt de worker — `TASK-0013` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0006, TASK-0010, TASK-0011, TASK-0012. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/framework/arch/user-docs-convention.md`
- `docs/adopters/manuais/cidadao/*.md`
- `docs/adopters/manuais/agente-transito/*.md`
- `docs/adopters/manuais/colegiado-secretaria/*.md`
- `docs/adopters/manuais/operador/*.md`
- `docs/adopters/manuais/gestor/*.md`
- `docs/adopters/manuais/auditor-dpo/*.md`
- `docs/adopters/manuais/administrador/*.md`
- `docs/adopters/manuais/glossario.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/adopters/manuais/index.md`
- `docs/adopters/manuais/faq.md`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Crie índice por sete perfis com selos e orientação de ajuda e FAQ por perfil; cada resposta aponta uma âncora existente de manual.

## Definições vinculantes

O índice lista os sete perfis de R-0030, seus selos e o caminho de ajuda. O FAQ tem seção por perfil e cada resposta contém link para uma âncora de rota realmente presente nos manuais concluídos. Consulte apenas as páginas fechadas na lista de leitura; não crie rota nem resposta sem fonte. R-0031 adiciona perfis PEC depois desta rodada. OD-UD-002 mantém publicação pública fail-closed para cidadão, FAQ cidadão e glossário até decisão do Owner.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0013
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0014.md">
# Prompt de worker — `TASK-0014` (`engineer-backend`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/engineer-backend.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0003; dependências: TASK-0013. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/engineer-backend.md`
- `package.json`
- `tools/docs/user-docs/check.mjs`
- `docs/adopters/manuais/index.md`
- `docs/adopters/manuais/faq.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `package.json (somente script check)`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Encadeie docs:user:check em pnpm check após o corpus estar completo; não altere o gate ou os manuais para fazê-lo passar.

## Definições vinculantes

A definição vinculante é a entrega da linha desta tarefa no plan.md, com os caminhos e restrições abaixo. Sem valor normativo inventado.

## Critérios de aceitação

- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Engineer
Tarefa: TASK-0014
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0015.md">
# Prompt de worker — `TASK-0015` (`architect-blueprint`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/architect-blueprint.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0004; dependências: TASK-0014. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/architect-blueprint.md`
- `docs/framework/arch/user-docs-convention.md`
- `docs/framework/arch/parameter-catalogue.md`
- `docs/framework/arch/frontend-wiring-pattern.md`
- `docs/reference/legal/contran/REF-CONTRAN-985-1003-MBFT.md`
- `apps/rait/web/src/app/core/shortcut-help.component.ts`
- `apps/portal/web/src/app/core/runtime-config.ts`
- `apps/rait/web/src/app/core/runtime-config.ts`
- `apps/teat/mobile/src/app/core/runtime-config.ts`
- `apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts`
- `docs/framework/arch/availability/*.availability.json`
- `docs/meta/knowledge-base/open-issues.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `work/rounds/R-0030/contracts/CTG-0004.md`
- `docs/framework/arch/parameter-catalogue.md (§Namespaces i18n somente)`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Feche CTG-0004 com tabela app × arquivo × rótulo i18n × âncora, helpBaseUrl fail-closed, MBFT tópico/âncora/REF-CONTRAN-985-1003-MBFT; resolva OD-UD-004/005 conforme fonte, editando apenas linhas de namespace se necessário.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.
Ajuda contextual: runtime helpBaseUrl ausente → nenhum link. MBFT: tópico do contexto + âncora do manual + REF-CONTRAN-985-1003-MBFT; nenhum texto normativo sem fonte fechada. O ponto de ajuda no shell @detran/ui só se R-0024 tiver entregue posição.

## Critérios de aceitação

- `pnpm verify:parameter-catalogue` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm format:check` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0015
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0016.md">
# Prompt de worker — `TASK-0016` (`inspector-tests`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Inspector**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/inspector-tests.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0004; dependências: TASK-0015. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/inspector-tests.md`
- `work/rounds/R-0030/contracts/CTG-0004.md`
- `apps/portal/web/src/app/core/runtime-config.ts`
- `apps/rait/web/src/app/core/runtime-config.ts`
- `apps/teat/mobile/src/app/core/runtime-config.ts`
- `apps/rait/web/src/app/core/shortcut-help.component.ts`
- `apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts`
- `docs/framework/arch/availability/*.availability.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `apps/portal/web/src/**/*.spec.ts`
- `apps/rait/web/src/**/*.spec.ts`
- `apps/teat/mobile/src/**/*.spec.ts`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Crie specs nos três apps: link somente com helpBaseUrl, href base+caminho+âncora do manifesto, ausência sem base, MBFT sem texto normativo sem fonte, axe sem serious/critical. Caracterize comportamento antes da troca.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.
Ajuda contextual: runtime helpBaseUrl ausente → nenhum link. MBFT: tópico do contexto + âncora do manual + REF-CONTRAN-985-1003-MBFT; nenhum texto normativo sem fonte fechada. O ponto de ajuda no shell @detran/ui só se R-0024 tiver entregue posição.

## Critérios de aceitação

- `pnpm --filter @detran/portal-web test` → após adicionar os sensores, apenas os novos casos da ajuda devem ficar RED pela implementação ausente; registre os nomes e saídas. Casos preexistentes permanecem verdes. A suíte ficará integralmente PASS após TASK-0017.
- `pnpm --filter @detran/rait-web test` → após adicionar os sensores, apenas os novos casos da ajuda devem ficar RED pela implementação ausente; registre os nomes e saídas. Casos preexistentes permanecem verdes. A suíte ficará integralmente PASS após TASK-0017.
- `pnpm --filter @detran/teat-mobile test` → após adicionar os sensores, apenas os novos casos da ajuda devem ficar RED pela implementação ausente; registre os nomes e saídas. Casos preexistentes permanecem verdes. A suíte ficará integralmente PASS após TASK-0017.

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Inspector
Tarefa: TASK-0016
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0017.md">
# Prompt de worker — `TASK-0017` (`engineer-frontend`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Engineer**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/engineer-frontend.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0004; dependências: TASK-0016. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/engineer-frontend.md`
- `work/rounds/R-0030/contracts/CTG-0004.md`
- `apps/portal/web/src/app/core/runtime-config.ts`
- `apps/rait/web/src/app/core/runtime-config.ts`
- `apps/teat/mobile/src/app/core/runtime-config.ts`
- `apps/rait/web/src/app/core/shortcut-help.component.ts`
- `apps/teat/mobile/src/app/features/complementares/pages/context-help.page.ts`
- `docs/framework/arch/availability/*.availability.json`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `apps/portal/web/src/** (exceto *.spec.ts)`
- `apps/rait/web/src/** (exceto *.spec.ts)`
- `apps/teat/mobile/src/** (exceto *.spec.ts)`
- `docs/framework/arch/availability/{portal-web,rait-web,teat-mobile}.availability.json (somente help/history)`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Implemente ajuda nos três apps conforme CTG-0004 e testes do Inspector; atualize só help/history nos manifestos pertinentes. Preserve comportamento existente; compare as suítes antes e depois.

## Definições vinculantes

### Perfis × papéis (anexo §5)

(derivação fechada)

Cada código de `DETRAN_ROLES` (36) pertence a **um** perfil. O gate lê `roles.ts` e falha se um
código faltar, sobrar ou repetir. Papel novo só por OD (ADR-0034, Consequências).

| Perfil (`profile`)     | Rótulo no site                       | Papéis                                                                                                                                    |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `cidadao`              | Cidadão                              | `CIDADAO`, `CANDIDATO`                                                                                                                    |
| `agente-transito`      | Agente de trânsito                   | `field-agent`, `field-supervisor`                                                                                                         |
| `colegiado-secretaria` | JARI, CETRAN e secretaria            | `rait-analyst`, `rait-coordinator`, `rait-secretary`, `rait-signing-authority`, `rait-central-authority`, `rait-rapporteur`, `rait-chair` |
| `operador`             | Operador                             | `processing-operator`, `traffic-authority`, `integration-operator`, `dash-operator`                                                       |
| `gestor`               | Gestor e painel de monitoramento     | `rait-manager`, `rait-hr`, `rait-finance`, `GESTOR_DETRAN`, `dash-duty-owner`, `bi-analyst`                                               |
| `auditor-dpo`          | Auditor e encarregado de dados (DPO) | `AUDITOR`, `DPO`                                                                                                                          |
| `administrador`        | Administrador                        | `agency-admin`, `technical-admin`, `ADMIN`, `SUPORTE`                                                                                     |
| `clinico`              | Clínica credenciada (PEC)            | `RECEPCAO`, `TECNICO_BIOMETRIA`, `MEDICO`, `PSICOLOGO`, `SUPERVISOR`, `ADMIN_CLINICA`                                                     |
| `regulatorio`          | Junta e CETRAN (PEC)                 | `JUNTA`, `CETRAN`, `GESTOR`                                                                                                               |

Os perfis `clinico` e `regulatorio` só ganham manual em R-0031; até lá nenhuma rota os usa.

### Selos e R1–R8 (anexo §6)

(regras que o gate executa)

| Selo                        | Rótulo no manual          | Exige `decision`                | Coerência exigida com o código                                                                                                     |
| --------------------------- | ------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `disponivel`                | Disponível                | não (`null`)                    | `level = L2`; toda ação `disponivel`; nenhum arquivo de `evidence.files` contém marcador de indisponibilidade da superfície (§6.1) |
| `parcial`                   | Parcial                   | sim                             | `level ∈ {L1, L2}` e ao menos uma ação não `disponivel` (ou `L1` sem ações)                                                        |
| `homologacao`               | Em homologação            | sim (`ADR-0033` para TEAT/BOAT) | a rota só existe nas rotas de homologação (`app.homologation.routes.ts`) ou o app é de escopo de homologação pela ADR citada       |
| `indisponivel_nesta_versao` | Indisponível nesta versão | sim (OD)                        | `level = L0`; a rota resolve para a página de indisponível da superfície                                                           |
| `bloqueado_por_decisao`     | Bloqueado por decisão     | sim (DT/OD)                     | tela construída que renderiza o estado "bloqueado por decisão" citando o mesmo id                                                  |

Regras adicionais: **R1** conjunto de `path` do arquivo = conjunto de rotas extraído de
`routeSources` (sem faltar nem sobrar); **R2** unicidade global de `id` e de (host, path) entre
arquivos; **R3** `profiles` = derivação do §5 sobre `roles`; **R4** todo `decision` não nulo
existe como id num registro canônico (`docs/meta/knowledge-base/open-decisions-rait.md`,
`docs/meta/knowledge-base/open-issues.md`, `docs/framework/arch/*-build-pack.md`,
`docs/meta/decisions/*.md` ou `docs/meta/adr/`); **R5** todo `operationId` não nulo existe num
`*.commands.openapi.json`; **R6** todo caminho de `evidence` existe; **R7** `screen` não nulo
existe como ficha em `docs/framework/product/**/screens/`; **R8** nenhuma página `L0` sem OD
(C-0002 §5).

### Marcadores

de indisponibilidade (lista inicial; R-0030 fecha a lista na convenção)

- RAIT e DASHBOARD: `CommandUnavailableError` (qualquer prefixo), página `unavailable.page`.
- PORTAL: `PORTAL.SERVICE_UNAVAILABLE`, rota `servico-indisponivel/:serviceKey`.
- TEAT/BOAT: adaptadores `Unavailable*Adapter` e o erro `printer-hardware-source-pending`.
- PEC: a definir por R-0031 no mesmo formato, antes das telas.

### U1–U5

**U1** toda rota `kind: tela` do manifesto tem o
cabeçalho com a âncora `rota-<surface>-<slug>` no manual de **cada** perfil de `profiles`; **U2** o
selo escrito no bloco da rota é o rótulo do selo do manifesto (anexo §6); **U3** nenhuma âncora de
rota no manual sem rota no manifesto; **U4** todo texto de tela citado entre `«…»` existe como
valor no catálogo pt-BR da superfície; **U5** página de manual sem `status` publicável ou sem
`perfil` válido é erro.
Ajuda contextual: runtime helpBaseUrl ausente → nenhum link. MBFT: tópico do contexto + âncora do manual + REF-CONTRAN-985-1003-MBFT; nenhum texto normativo sem fonte fechada. O ponto de ajuda no shell @detran/ui só se R-0024 tiver entregue posição.

## Critérios de aceitação

- `pnpm docs:availability:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm docs:user:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm --filter @detran/portal-web test` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm --filter @detran/rait-web test` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm --filter @detran/teat-mobile test` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Engineer
Tarefa: TASK-0017
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>

<file path="work/rounds/R-0030/prompts/TASK-0018.md">
# Prompt de worker — `TASK-0018` (`transcriber-docs`)

> Worker da frente `user-docs`, rodada `R-0030`, na worktree `/Users/aarusso/.codex/worktrees/user-docs-r0030/detran`. Execute uma tarefa. O maestro é Codex, o reviewer é Claude Opus 5.5. Este prompt só pode ser despachado após prompt-review `PASS` e dependências concluídas. Nunca execute Git, instale pacotes, edite gerados manualmente ou enfraqueça testes.

## Papel

Papel constitucional (Art. 6): **Architect**. Declare-o na primeira linha da resposta. Manual: `docs/meta/agents/transcriber-docs.md`.

## Contexto da frente

C-0002 ação user-docs: convenção, manifestos, site pt-BR, sete manuais por perfil, FAQ, glossário e ajuda contextual. Branch única `orchestra/user-docs`, até três workers em paralelo com locks disjuntos. OD-C2-005 reserva gates completos, delivery-review e PR para o fim. A tarefa pertence a CTG-0005; dependências: TASK-0017. Se houver dependências, não comece antes de todas estarem concluídas. Siblings em `../` são somente leitura.

## Leitura obrigatória fechada

- `AGENTS.md`
- `CODESTYLE.md`
- `work/rounds/R-0030/plan.md`
- `work/rounds/R-0030/availability-manifest.schema.md`
- `docs/meta/agents/transcriber-docs.md`
- `docs/meta/agents/orchestra/waves.md`
- `docs/meta/knowledge-base/backlog.md`
- `docs/meta/knowledge-base/open-issues.md`
- `apps/portal/web/README.md`
- `apps/rait/web/README.md`
- `apps/teat/mobile/README.md`
- `apps/teat/web/README.md`
- `apps/dashboard/web/README.md`
- `apps/boat/mobile/README.md`
- `docs/framework/arch/user-docs-convention.md`

Globs acima permitem apenas os arquivos que correspondem ao padrão e só para leitura. Arquivo de fase D ausente bloqueia somente tarefas que o exigem: O4 em diante; O1–O3 seguem pela autorização A-C2-13.

## Pode tocar

- `docs/meta/agents/orchestra/waves.md`
- `docs/meta/knowledge-base/backlog.md`
- `docs/meta/knowledge-base/open-issues.md`
- `apps/portal/web/README.md`
- `apps/rait/web/README.md`
- `apps/teat/mobile/README.md`
- `apps/teat/web/README.md`
- `apps/dashboard/web/README.md`
- `apps/boat/mobile/README.md`

## Não pode tocar

Qualquer caminho fora de “Pode tocar”; `record/**`, `.devai/**`, `docs/framework/product/**`, `docs/meta/adr/**`, `pnpm-lock.yaml`, arquivos gerados e arquivos de teste fora da tarefa Inspector. Não altere critérios do plan.md, AUTHORIZATION.md, waves de outra rodada ou código de sibling. Em manifestos de outra superfície, os campos permitidos prevalecem sobre o arquivo inteiro.

## Tarefa

Atualize histórico em waves, backlog, estado OD-UD no registro canônico e linha Manual do usuário nos READMEs existentes. Não feche OD sem decisão do Owner.

## Definições vinculantes

OD-UD-001/002 aguardam decisão do Owner no PR. Não marque como encerradas por inferência.

## Critérios de aceitação

- `pnpm docs:kb:check` → PASS, 0 erros; registrar contagens/resultados relevantes
- `pnpm format:check` → PASS, 0 erros; registrar contagens/resultados relevantes

## Regras sem exceção

1. Fonte canônica para cada prazo, papel, estado, erro, rótulo, número e parâmetro. Lacuna → `source_pending` ou OD no relatório, sem constante inventada.
2. Nenhum teste é enfraquecido para passar. Inspector escreve sensores antes do Engineer; Engineer não edita sensores.
3. Nenhuma chamada direta a SENATRAN fora de `packages/senatran-adapter` (ADR-0003).
4. Caracterize a suíte do app antes e depois de ajuda contextual quando aplicável; divergência é FAIL.
5. Formate somente arquivos tocados com `node_modules/.bin/prettier --write <arquivos>` antes da entrega.
6. Não use Git. O maestro faz commits, instalação, evidência e PR.

## Entrega

Responda somente em Markdown neste formato:

```markdown
Papel: Architect
Tarefa: TASK-0018
Arquivos criados/alterados: <caminhos exatos>
Comandos executados e saída resumida: <um por linha>
Critérios de aceitação: <cada um PASS/FAIL, com justificativa>
Inventário de rotas por perfil: <id | path | screen | seal | decision; quando aplicável>
Fora do escopo / deixado: <o quê e por quê>
OD tocadas ou propostas: <ids, ou nenhuma>
Bloqueios: <ou nenhum>
```

</file>
