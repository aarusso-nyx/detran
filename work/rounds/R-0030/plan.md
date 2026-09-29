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

> **Adenda A-C2-13 (Owner, 2026-09-29; prevalece).** A rodada **abre já** sobre `origin/main` e
> executa **somente as ondas O1–O3**: convenção, esquema, gate e site pt-BR. Ao concluir a O3, o
> maestro faz push do branch (sem PR), grava checkpoint em §Retomada ("aguardando manifestos da
> fase D") e para. A O4 em diante retoma quando os branches das rodadas R-0025…R-0029 estiverem
> publicados. Nada nas O1–O3 toca `app.module.ts`, `policy.ts`, `@detran/ui` nem os apps.

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

## Bloqueios

## Triagem

## Retomada

## Leitura
