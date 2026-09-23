# R-0015 — frente `boat-mobile` (WP-B4, WP-B5 do BOAT: fichas, formulários, i18n, biblioteca de sinistro mobile e módulo web)

**Status:** aberto em 2026-09-22 pelo maestro GPT-5.6 Sol, papel Architect nesta fase
(`prompts/00-maestro.md`). Workers: GPT-5.6 Terra/Luna por subagentes nativos. Reviewer: `claude
opus` via `tools/orchestra/bridge.sh claude` (troca Fable → Sol decidida pelo Owner em 2026-09-21
e formalizada em `AUTHORIZATION.md`).
**Entrada:** branch `orchestra/boat-mobile`, HEAD e `origin/main`
`77ad8d64a7a896068341dfe509bd665da5065432`, árvore limpa antes da autorização; DEVAI 1.5.6.
**Concorrência:** CTG-0001 (17 fichas, i18n, transições) está livre. CTG-0002 (biblioteca mobile,
módulo `sinistros` web, formulários) tem R-0010/PC-0008 em `main`, mas continua bloqueado pela
entrega não publicada de R-0013 CTG-0004. O worktree de R-0013 contém trabalho local não
publicado e é estritamente fora da fronteira desta rodada. Após o merge de CTG-0001, empilhar em
`orchestra/teat-frontends` somente quando o upstream existir remotamente; caso contrário, gravar
checkpoint.
**Janelas previstas:** 3.

## Metas

1. **Fichas** (WP-B4): `docs/framework/product/domains/est/boat/screens/IU-BOAT-S-nn.md` (12
   mobile) e `IU-BOAT-W-nn.md` (5 web) — 17 fichas no padrão da origem, com os estados obrigatórios,
   a regra de acesso a vítimas (perfil + finalidade + auditoria) e os textos fixos ("sinistro" nunca
   "acidente"; "fotografar a cena, não o sofrimento"; "registro nacional definitivo, sem correção").
   Baseline do KB sobe em 17.
2. **Formulários, transições e i18n**: `apps/boat/mobile/src/lib/forms/*.schema.ts` (14 formulários
   por tela em 15 linhas de gate, pois W-04 ocupa duas linhas em `boat-frontends.md` §8);
   `transitions.ts` com as 149 transições + S-12; `i18n/boat.pt-BR.json`
   (estados, regimes 176/177/178 em linguagem simples, catálogos de condição — valores do protótipo
   `source_pending` H.42 —, erros).
3. **Biblioteca mobile** (WP-B5): `apps/boat/mobile` (`@detran/boat-mobile`) como biblioteca de
   features carregada pelo `FieldShell` do TEAT (pontos de extensão definidos em R-0013): 12 telas,
   componentes §6, `victimAccessGuard`, editor de croqui, GPS/câmera/assinatura via Capacitor,
   armazenamento cifrado e atestação de dispositivo (portas com fixtures nos testes).
4. **Módulo web** `sinistros` em `apps/teat/web` (5 telas, `boat-frontends.md` §5); Portal T-18/T-19
   já entregues em R-0014 (projeção `portal.crash_view`).
5. Documentação: `boat-build-pack.md` §WP-B4/B5 executados (gates reais); `boat-frontends.md` §9/§10;
   backlog (homologação RENAEST mock → real como passo institucional).

## Tarefas

| Tarefa    | Papel                | Perfil              | Modelo/esforço | Lock                                                    | Depende de                          | Entrega                                                                                                                                      |
| --------- | -------------------- | ------------------- | -------------- | ------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-0001 | Architect            | architect-blueprint | Terra / alto   | `MOD-boat-mobile-arch`, `MOD-parameter-catalogue-doc`   | —                                   | manifesto tela → ficha → rota, contrato CTG-0001/CTG-0002, decisões e allowlist `boat.*`; nenhum código de feature                           |
| TASK-0002 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-product-boat-screens`, `MOD-kb-manifest`           | TASK-0001                           | 17 fichas; `artifactIdCount` +17 no mesmo conjunto de entrega                                                                                |
| TASK-0003 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-boat-i18n`                                         | TASK-0001                           | `docs/framework/arch/i18n/boat.pt-BR.json`, somente chaves fechadas pelo contrato                                                            |
| TASK-0004 | Inspector            | inspector-tests     | Luna / médio   | `MOD-parameter-catalogue-tests`                         | TASK-0001                           | testes fail-closed para namespace/chave i18n `boat.*`, sem ampliar prefixos de parâmetros                                                    |
| TASK-0005 | Engineer             | engineer-frontend   | Terra / baixo  | `MOD-tools-parameters`                                  | TASK-0004                           | implementar `boat.*` no parser de namespaces e no verificador de uso i18n; parâmetros BOAT permanecem `est.*`                                |
| TASK-0006 | Inspector            | inspector-tests     | Luna / médio   | `MOD-boat-transition-tests`, `MOD-package-json`         | TASK-0002 + TASK-0003               | testes node:test+tsx e typecheck da união de 149, S-12 e cobertura 17/17; script integrado a `pnpm check`                                    |
| TASK-0007 | Engineer             | engineer-frontend   | Terra / médio  | `MOD-boat-transitions`                                  | TASK-0006                           | `apps/boat/mobile/src/lib/navigation/transitions.ts`: as 149 linhas canônicas + as transições S-10 → S-12 → S-11; testes do Inspector verdes |
| TASK-0008 | Inspector            | inspector-tests     | Luna / alto    | `MOD-boat-mobile-tests`, `MOD-teat-web-sinistros-tests` | CTG-0001 + upstream R-0013 CTG-0004 | testes de `victimAccessGuard`, 14 schemas, compartilhados, portas nativas, rotas mobile/web e a11y                                           |
| TASK-0009 | Engineer             | engineer-frontend   | Terra / alto   | `MOD-boat-mobile-lib`, `MOD-package-json`               | TASK-0008                           | biblioteca `@detran/boat-mobile`, 12 telas, guardas, croqui e portas nativas; integração no shell do TEAT                                    |
| TASK-0010 | Engineer             | engineer-frontend   | Luna / alto    | `MOD-teat-web-sinistros`, `MOD-boat-mobile-forms`       | TASK-0008                           | módulo `sinistros` com 5 telas; 14 schemas por tela cobrindo as 15 linhas de gate da §8                                                      |
| TASK-0011 | Architect (transcr.) | transcriber-docs    | Luna / baixo   | `MOD-docs`                                              | TASK-0009 + TASK-0010               | build pack/frontends/backlog e `waves.md`: coluna Maestro = Sol e histórico da troca Fable → Sol decidida em 2026-09-21                      |

CTG-0001 = TASK-0001…TASK-0007. CTG-0002 = TASK-0008…TASK-0011. Um PR por CTG. O limite
operacional é sete workers ativos por janela; nesta janela, apenas os sete do CTG-0001 podem ser
despachados.

**Checkpoint de dependências:** o maestro não cria nem integra o pacote antes de R-0013 CTG-0004.
Quando o upstream estiver publicado, cria uma base empilhada a partir de
`orchestra/teat-frontends`, copia o scaffold de `apps/portal/web`, roda `pnpm install`, guarda o
lockfile e só então libera TASK-0008. Antes de cada PR, integra `origin/main` por merge explícito.

## Critérios de aceitação (comandos → resultado)

- `node tools/docs/kb/check.mjs` → `baselines.artifactIdCount` 756 → 773,
  `baselines.canonicalWorkflowTokenCount` permanece 446 e nenhum finding; `pnpm docs:kb:publish-check` → OK.
- `pnpm --filter @detran/boat-mobile typecheck|test|build|lint` → verdes; `pnpm --filter @detran/teat-mobile build`
  carrega a biblioteca (teste de integração do shell); `pnpm --filter @detran/teat-web test|build` → verdes com o módulo `sinistros`.
- teste tela ↔ ficha ↔ rota: 17/17; transições: 149 + S-12 verdes; a11y de campo (axe) sem `serious`/`critical`.
- `pnpm check` → verde; `pnpm backend:test:ci` inalterado.

## Mapa entregável → definições

| Entregável  | Definição                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| fichas      | [IU-BOAT-001]; `boat-frontends.md` §4–§7; matriz `crash-*` da origem; [JRN-BOAT-001…005]; `portal-frontends.md` T-18/T-19 |
| formulários | `boat-frontends.md` §8; [RN-BOAT-*]; `boat-error-catalog.md`; [WF-BOAT-001…003]                                           |
| hierarquia  | `boat-frontends.md` §1–§3, §9–§10; `teat-frontends.md` §10 (shell de campo)                                               |
| LGPD        | `open-issues.md` DT-047/DT-049; `lgpd-assessment.md`; S-06/W-05                                                           |
| catálogos   | `owner-ballots/ballot-03-boat-catalogos.md` H.42 (`est.crash_condition_ref`, `source_pending`)                            |

## Riscos

- `apps/teat/web` e `apps/teat/mobile` são de R-0013: esta frente só abre depois do merge; edita
  apenas o módulo `sinistros` e o registro da biblioteca no shell.
- Vítimas: tela liberada para produção por H.44, mas retenção e finalidade vêm do backend (R-0010);
  nada de acesso sem `purpose`.
- Nativos (câmera, GPS, assinatura, atestação): portas com fixtures; hardware real fora da rodada.
- Em CTG-0001, `apps/boat/mobile` ainda não é pacote do workspace. O script do Inspector executa
  `tsc --noEmit` com tsconfig próprio e depois `node:test` via `tsx`; lint/build completos só se
  tornam gates em CTG-0002, depois do scaffold autorizado.

## Lições aplicadas (método §4.8–§4.18, `waves.md` §Histórico)

- Transcrição de fichas, contratos, i18n e docs é ato de **Architect** (`transcriber-docs`); tarefas assim aparecem como "Architect (transcr.)".
- Nenhum Engineer ou transcriber entrega o teste do próprio artefato: contratos → `contracts:test` pelo Inspector; fichas/i18n → teste tela ↔ ficha ↔ rota pelo Inspector.
- Ciclos de review a partir do segundo restritos aos itens corrigidos; contradições contrato × código resolvidas pelo Architect por adenda numerada em `plan.md` antes de redespachar.
- O CTG seguinte só começa a escrever depois do merge do anterior ou nasce em branch empilhado; nunca commits novos no branch de um PR aberto; integrar `main` por merge, nunca `--force`.
- Listas de leitura dos workers fechadas e completas (DDL gerado, blueprint, `seed.sh`, fixtures, specs de referência como `backend/app/tests/e2e/policy-routes.e2e.spec.ts`); lacuna aqui foi `reference-gap` em R-0010.
- Padrão de app (R-0014, `apps/portal/web`): copiar scripts, `angular.json`, `eslint.config.js`, `tsconfig.*`, `vitest.config.ts` com `angularJitApplicationTransform` e a árvore de pastas; `pnpm check` recebe a tripla `lint|test|build` da biblioteca.
- Pacote de workspace novo: o maestro roda `pnpm install`, guarda o `pnpm-lock.yaml` para o commit do grupo e só então libera o Inspector (CI é `--frozen-lockfile`).
- Chaves i18n não são parâmetros (OD-P46): allowlist já existe; acrescentar as linhas `boat.<namespace>` antes de `i18n/boat.pt-BR.json` entrar em código; placeholders `{x}`.
- Testes de roteamento cobrem papéis com e sem acesso (presença e ausência), não só o papel mínimo.

## Decisões do maestro — abertura 2026-09-22

- **M1 — identidade:** a rodada parte do SHA exato
  `77ad8d64a7a896068341dfe509bd665da5065432`, igual a `origin/main` na abertura. Nenhuma evidência
  de outro checkout vale para esta worktree.
- **M2 — famílias:** maestro GPT-5.6 Sol; workers Terra/Luna; reviewer `claude opus`. O reviewer é
  de outra família e não atua como worker.
- **M3 — contagem canônica:** a fonte é
  `docs/framework/product/domains/inf/teat/ux-parity/mobile-matrix.json`. O grupo `sinistros` tem
  11 telas existentes; há 94 transições cuja origem é `crash-*`, 78 cujo destino é `crash-*`, 23
  internas e **149 na união** `origem ∪ destino`, sem duplicar as internas.
- **M4 — S-12:** `crash-damages` é a 12ª tela mobile nova e entra no assistente entre
  `crash-ait-links` (S-10) e `crash-review` (S-11). As transições novas são aditivas e ficam fora
  da contagem das 149 transcritas da matriz.
- **M5 — autoridade:** campos, enums, textos e gates vêm apenas das fontes fechadas do corpus.
  Ausência ou contradição vira `OD-R15-nnn` proposta; worker não decide nem preenche por analogia.
- **M6 — artefatos do KB:** cada uma das 17 fichas incrementa `artifactIdCount` no mesmo commit do
  CTG-0001; não há atualização desacoplada do manifesto.
- **M7 — isolamento:** o worktree de R-0013 e todos os siblings são somente leitura. A existência
  de diretórios `apps/teat/*` em `main` não prova que CTG-0004 foi entregue.
- **M8 — disciplina de teste:** somente Inspector escreve ou altera testes. Não se aceitam
  asserções por conjuntos de status, escapes condicionais, `skip`, relaxamento de expectativa ou
  teste escrito pelo implementador.
- **M9 — review:** a ponte pode devolver JSON em cercas Markdown ou ecoar veredito anterior; o
  maestro extrai e valida o último objeto que contém `mode` e `verdict`. Ciclos após o primeiro
  ficam restritos aos achados anteriores.
- **M10 — publicação:** CTG-0001 e CTG-0002 têm PRs separados. A rodada não avança ao CTG-0002
  enquanto o upstream requerido não estiver publicado e estável; o estado correto nesse caso é
  checkpoint, não implementação especulativa.
- **M11 — prefixo i18n BOAT:** a autorização do Owner exige namespaces `boat.*`. O contrato atual
  permite somente `est.*`; TASK-0001 registra `boat.` como exceção i18n da superfície BOAT,
  TASK-0004 prova o comportamento fail-closed e TASK-0005 altera o parser. As chaves de parâmetros
  BOAT permanecem `est.*`; a extensão não autoriza parâmetros `boat.*`.
- **M12 — vermelho esperado:** entre TASK-0001 e TASK-0005, `verify:parameter-catalogue` e a suíte
  integral `parameters:test` falham apenas porque o catálogo já contém `boat.*` e parser/verifier
  ainda não. TASK-0004 roda isoladamente o novo teste vermelho. TASK-0005 fecha parser, verifier,
  gerados e suíte integral; qualquer falha diferente é bloqueio.
- **M13 — formulários:** `boat-frontends.md` §8 possui 15 linhas de gate para 14 formulários por
  tela; W-04 ocupa duas linhas (fechar/transmitir e retificar). A implementação preserva ambas as
  linhas sem inventar um 15º formulário.

## Adendas numeradas de correção

- **A1 — TASK-0001, delivery-review ciclo 1:** a fonte fechada
  `docs/framework/product/domains/inf/teat/ux-parity/web-matrix.json` fixa W-01 como
  `screenId: crashes-list` (UX-WEB-060), identidade repetida em
  `docs/framework/product/domains/inf/teat/screens/IU-TEAT-crashes-list.md`. Portanto,
  `OD-R15-001` está encerrada por fonte e foi removida das propostas; somente `OD-R15-002`
  (papéis W-01) e `OD-R15-003` (screenId W-05) continuam propostas. O catálogo i18n do CTG-0001
  permanece em `docs/framework/arch/i18n/boat.pt-BR.json`; eventual mudança para a árvore do app
  pertence ao CTG-0002. O contrato de 114 chaves exige literal pt-BR não vazio nas 101 entradas
  com texto fechado. `OD-R15-004` registra as 13 lacunas exatas — quatro grupos de condição de
  H.42 e nove erros genéricos da §6 — com o marcador único `source_pending:OD-R15-004`, que é
  proposta rastreável e não tradução; nenhuma outra chave usa marcador ou string vazia. O
  `pnpm check` integral do candidato anterior a esta adenda terminou com exit 0 em 2026-09-22;
  este registro não afirma novo veredito do reviewer.

## Concorrência

- `R-0010`/BOAT backend: em `main` como PC-0008; satisfaz parte do CTG-0002.
- `R-0013`/TEAT frontends: CTG-0001 e CTG-0003 em `main`; CTG-0004 ainda não está publicado. O
  branch remoto `orchestra/teat-frontends` não contém a entrega local em curso.
- `R-0016`: em curso e também altera `docs/meta/knowledge-base/import-manifest.json`; por isso o
  merge de `origin/main` é obrigatório imediatamente antes do PR de cada CTG.
- Liberado agora: CTG-0001 sobre `orchestra/boat-mobile`.
- Bloqueado agora: CTG-0002. Base futura: `orchestra/teat-frontends` depois que R-0013 publicar
  CTG-0004; se não ocorrer nesta janela, checkpoint após CTG-0001.

## Bloqueios

- CTG-0002 — `R-0013 CTG-0004` ainda não publicado; não despachar TASK-0008…TASK-0011.

## Triagem

- `sensor-error` — a checagem focada pós-review passou `05-parameters.sql` diretamente ao
  Prettier, que não possui parser SQL neste repositório. O arquivo é gerado e foi validado por
  `parameters:generate`/`verify:parameter-catalogue`; a repetição correta exclui o SQL da chamada
  direta e mantém `pnpm format:check` como gate integral.
- `sensor-error` — a primeira invocação do delivery-review ciclo 2 codificou o objeto JSON inteiro
  em base64; a ponte recusou a saída e não criou JSON normalizado nem `.bridge.json`. O maestro
  decodificou somente para recuperar o residual anterior de S-02, o Architect corrigiu a ordem e a
  repetição continua sendo o mesmo ciclo 2 restrito.
- `process-error` — a primeira invocação pós-merge de `devai audit observe` recebeu o SHA correto,
  mas o worktree ainda estava no pai do merge e falhou fechada com
  `AUDIT_OBSERVE_EXACT_HEAD_REQUIRED`. Após provar que HEAD era ancestral de `origin/main`, a branch
  avançou somente por fast-forward ao merge exato e a mesma observação concluiu.
- `process-error` contido — TASK-0003 criou inicialmente um arquivo não rastreado no checkout raiz,
  fora do worktree autorizado. O maestro comparou os bytes com a cópia do worktree, removeu apenas
  esse arquivo acidental e revalidou que os caminhos envolvidos no checkout raiz estavam limpos;
  nenhuma alteração rastreada ou de sibling foi feita fora deste worktree.

## Retomada

**Checkpoint 1 — janela 1 (2026-09-22, maestro GPT-5.6 Sol).** O orçamento estimado atingiu
795.000/800.000 tokens de entrada (limiar 640.000), então a janela para no ponto natural posterior
ao CTG-0001. A rodada permanece aberta e nenhum worker de CTG-0002 foi despachado.

- **Concluídas:** TASK-0001…TASK-0007: contrato/manifesto, 17 fichas IU-BOAT-S/W, catálogo i18n
  de 114 chaves (101 literais + 13 marcadores `source_pending:OD-R15-004`), allowlist `boat.*`,
  parser/verificador/gerados e máquina de transições com S-12. O manifesto de conhecimento subiu
  de 756 para 773 no mesmo commit das fichas.
- **Reviews:** prompt-review ciclo 4 = PASS; delivery-review CTG-0001 ciclo 1 = REVIEW, correções e
  escalada de TASK-0002 para Luna/médio, ciclo 2 restrito = PASS. Último veredito: PASS, sem
  findings.
- **Publicação CTG-0001:** commits de conteúdo `3080f5b8`, merge explícito de `origin/main`
  `fda0f653` e evidência `6c76971d`; `generic sequence 1`, head
  `98a55808e1d5b4bb38d63466719d91022b8bb51919918d7dd70bb157b53eff72`. PR #107 teve 7/7
  checks verdes e foi mesclado em `main` como
  `1dc8b630582cfc2fe34e8a0c1e30a7694505831d`.
- **Observação pós-merge:** `audit observe` no SHA exato concluiu como `EV-c0590734c54263e9`,
  `readiness_promoting=false`; cadeia sequence 84, head
  `678d657cdd848af04c02cb93a8d44371451598656c62d94e1b16387db3cf52b1`.
- **Bloqueadas/pedentes:** TASK-0008…TASK-0011 (CTG-0002). Revalidação após o merge encontrou
  R-0013 somente até CTG-0003; CTG-0004 e `apps/teat/{mobile,web}` ainda não existem em `main`.
  Não criar scaffold antecipado nem inventar substituto.
- **Próximos passos do maestro que retoma:** (1) confirmar R-0013 CTG-0004 em `main` e a existência
  dos dois apps; (2) integrar `origin/main` por merge e empilhar a base de
  `orchestra/teat-frontends` somente conforme §Concorrência; (3) executar o checkpoint de scaffold
  copiando `apps/portal/web`, instalar e atualizar o lockfile antes de TASK-0008; (4) seguir
  Inspector → Engineers → documentação, incluindo em TASK-0011 a troca Fable → Sol na coluna
  Maestro e no §Histórico de `waves.md`; (5) delivery-review, gates, evidência, PR CTG-0002,
  merge, observação e só então fechamento da rodada.

## Leitura

- `AGENTS.md`; `CODESTYLE.md`; `README.md`; `law/constitution.md`; `.devai/config/project.json`.
- `docs/meta/agents/README.md` (inclusive §4 itens 13–18 e §10), `model-ladder.md`,
  `orchestra/README.md`, `orchestra/waves.md` e os cinco manuais de perfil usados nesta rodada.
- `work/rounds/R-0015/prompts/00-maestro.md` e este plano, integralmente.
- `docs/framework/arch/boat-build-pack.md`, `boat-frontends.md`, `boat-route-contract.md`,
  `boat-error-catalog.md`, `teat-frontends.md`, `portal-frontends.md`,
  `parameter-catalogue.md` e `decision-closure-plan.md`.
- `docs/framework/product/domains/est/boat/screens/IU-BOAT-001.md`; JRN-BOAT-001…005;
  RN-BOAT-001…004 e RN-BOAT-101…132.
- As 13 fichas `IU-TEAT-crash-*`; a matriz mobile canônica completa; steering §H; scaffold
  `apps/portal/web`; e os artefatos de R-0016 usados apenas como forma de orquestração.
