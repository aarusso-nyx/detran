# Campanha C-0002: consolidação pós-R-0016

**Autoridade:** Architect (Constitution Article 6). Revisão 2 de 2026-09-26, com as decisões do Owner
OD-C2-001…004 incorporadas (§7).
**Status:** proposta com as decisões do Owner aplicadas. Nenhuma rodada foi aberta. O
`AUTHORIZATION.md` de cada rodada só nasce quando o Owner autoriza o respectivo `prompts/00-maestro.md`.
**Origem:** inspeção somente leitura de 2026-09-25 (relatórios (a)…(g) em `work/campaigns/C-0002-inspecao-2026-09-25/`,
versionados com a campanha; cópia dos originais em `tmp/`, ignorado pelo git). A campanha C-0001 corresponde a R-0001…R-0016 (PC-0001…PC-0014).

## 1. Objetivo e escopo

Fechar as lacunas estruturais deixadas pela C-0001. O escopo compreende as oito ações do Owner:

| Ação  | Descrição                                                                                      |
| ----- | ---------------------------------------------------------------------------------------------- |
| 1     | Documentação de usuário                                                                        |
| 2     | Corpus de `law/` e `product/`                                                                  |
| 3     | Índices de ADR e de estado                                                                     |
| 4     | Stack local versionada                                                                         |
| 5     | Sensores DEVAI com o máximo de PASS                                                            |
| 6     | Frontends ligados ao backend                                                                   |
| 7a–7d | Convergência STYNX: módulos canônicos, deduplicação, SSE/tenancy/assinatura, autorização única |
| 8     | Frontend do PEC (ADR-0034), ao final                                                           |

Cada ação continua delimitada por rodada(s) e PR(s) próprios; nenhuma rodada mistura duas ações. Pela
OD-C2-001, **a ordem de execução foi reorganizada** para reduzir o esforço e o prazo (§3).

## 2. Mapa de rodadas (ordem de execução)

A ordem abaixo substitui a da revisão 1.

| Fase | Rodada | Ação             | Frente (`orchestra/<frente>`) | Escopo                                                                                                                                                                                                                                                                                                | Abre após (merge)                          | Maestro             |
| ---- | ------ | ---------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------- |
| A    | R-0017 | 4                | `local-stack`                 | `tools/detran-stack.sh` e `stack:*` versionados; mocks faltantes (SEFAZ) ou flags; perfis de seed; `stack:smoke`; runbook                                                                                                                                                                             | —                                          | Sol 6               |
| A    | R-0018 | 3                | `index-state`                 | Índice de ADRs racionalizado (duplicatas 0006/0024/0028, 0029–0033 fora do índice, série `law/adr`, status); índices de estado (`work/rounds/README.md`, `waves.md`, build packs, READMEs, versão DEVAI); `.gitignore` de `reports/`; `model-ladder.md` com Sol 6 / Opus 5.5; gate índice × realidade | —                                          | Opus 5.5            |
| A    | R-0019 | 2                | `law-corpus`                  | `law/invariants`, `law/policy`, `law/schemas`, `law/glossary` e `product/` nos esquemas DEVAI, com rastreabilidade ao corpus                                                                                                                                                                          | —                                          | Sol 6               |
| B    | R-0020 | 5                | `devai-sensors`               | `round seal` R-0003…R-0019; reparo das âncoras da cadeia; sensores ligados; tarefas válidas; gates DEVAI no CI; hooks                                                                                                                                                                                 | R-0018, R-0019                             | Opus 5.5            |
| C    | S-1.5  | 7b/7c (upstream) | _repositório STYNX_           | Release **STYNX 1.5.0** (próxima minor, OD-C2-004): SSE backend e Angular, hook de tenancy para rotas públicas, lacunas de assinatura e autorização, genéricos elegíveis. Especificação em `work/campaigns/C-0002-stynx-upstream-spec.md`                                                             | — (paralela à fase A)                      | governança do STYNX |
| C    | R-0021 | 7a               | `stynx-canonical`             | Pin 1.3.1 → 1.4.0; PAdES/assinatura, outbox, offline-sync e notificações trocados por `@stynx-nyx/*`                                                                                                                                                                                                  | R-0017                                     | Sol 6               |
| C    | R-0022 | 7c               | `stynx-sse-tenancy`           | Pin → 1.5.0; SSE com fonte única (backend e apps); fim do monkey-patch de tenancy; assinatura final                                                                                                                                                                                                   | S-1.5 publicado; R-0021                    | Opus 5.5            |
| C    | R-0023 | 7d               | `authz-unification`           | `StynxAuthorizationModule` como fonte única; `DetranPolicyGuard` removido; `policy.ts` como dados; matriz papel × rota idêntica                                                                                                                                                                       | R-0022                                     | Sol 6               |
| C    | R-0024 | 7b               | `stynx-dedup`                 | Remoção das duplicações restantes; `@detran/ui` como kit de app (shell, error boundary, cliente de comando e costura SSE únicos); i18n STYNX mesclado                                                                                                                                                 | R-0022 (CTG backend após R-0023)           | Opus 5.5            |
| D    | R-0025 | 6                | `rait-web-wiring`             | 64 comandos ligados, `caseAccessGuard`, formulários, rotas L0 (#122)                                                                                                                                                                                                                                  | R-0024                                     | Sol 6               |
| D    | R-0026 | 6                | `dashboard-wiring`            | Console L0 → L2 sobre `BP-DASH-MONITOR-001` (#123, #124)                                                                                                                                                                                                                                              | R-0024                                     | Opus 5.5            |
| D    | R-0027 | 6                | `portal-delegations`          | Delegações de defesa, recursos, indicação, pagamento, junta e diligência religadas; telas do Portal                                                                                                                                                                                                   | R-0024                                     | Sol 6               |
| D    | R-0028 | 6                | `boat-wiring`                 | Telas BOAT ligadas a `est/crash`; portas nativas atrás de interfaces                                                                                                                                                                                                                                  | R-0024                                     | Opus 5.5            |
| D    | R-0029 | 6                | `teat-web-wiring`             | TEAT web produtivo no lugar da página genérica JSON                                                                                                                                                                                                                                                   | R-0024                                     | Sol 6               |
| E    | R-0030 | 1                | `user-docs`                   | Manuais por perfil, FAQ, glossário de usuário, ajuda contextual, site pt-BR, gate de cobertura rota × manual                                                                                                                                                                                          | R-0025…R-0029                              | Opus 5.5            |
| F    | R-0031 | 8                | `pec-web`                     | ADR-0034: contratos e fixtures PEC (incluindo rotas `ch` do candidato), consoles clínico e regulatório em `apps/pec/web`, manual PEC                                                                                                                                                                  | R-0030 (pode abrir junto, locks disjuntos) | Sol 6               |
| F    | R-0032 | 8                | `portal-pec`                  | Módulo cidadão/PEC no Portal (P-01…P-07): vínculo cidadão→candidato, projeções de metadados, porta do dossiê do titular, comandos pela delegação do Portal, telas, manual do cidadão (OD-PW-001)                                                                                                      | CTG-0001 de R-0031                         | Opus 5.5            |

Ids R-0017…R-0032 são **propostos**. A ADR-0033 citava "R-0017" apenas como candidato para o TEAT
mobile produtivo, sem reservar o número. Antes de abrir cada rodada, o maestro confere se o número
ainda está livre (`ls work/rounds`). S-1.5 é uma rodada do repositório STYNX, com numeração e
governança próprias; esta campanha não a abre (Art. 6).

## 3. Racional da ordem (OD-C2-001)

1. **Fundação primeiro e em paralelo (fase A).**
   - A stack local dá a todas as rodadas seguintes um ambiente de smoke idêntico.
   - Os índices corrigidos e o `.gitignore` de `reports/` evitam a perda de evidência já na campanha.
   - O corpus de `law/` alimenta os sensores.
   - As três rodadas têm locks disjuntos (`tools/`; `docs/meta` e índices; `law/` e `product/`) e
     correm juntas.
2. **Governança antes do volume (fase B).** Selar a C-0001 e ligar os sensores antes das 12 rodadas
   de código faz toda a campanha nascer medida. Sem isso, cada rodada repetiria a dívida de âncoras
   e de tarefas inválidas.
3. **Plataforma antes dos frontends (fase C antes de D).** Esta é a principal economia.
   - Na ordem original, os cinco frontends seriam ligados sobre a costura local de SSE e de
     autorização e depois migrados de novo ao STYNX, somando 5 apps × 2 migrações.
   - Invertendo, cada app é ligado **uma única vez**, já sobre SSE, autorização, shell e cliente de
     comando canônicos, entregues por R-0022…R-0024.
   - A deduplicação (7b) vem depois do SSE e da autorização, porque essas duas rodadas removem a
     maior parte das duplicações e o saldo fica menor e mais preciso.
4. **Upstream STYNX em paralelo.**
   - S-1.5 começa na fase A. A especificação única (`C-0002-stynx-upstream-spec.md`) junta os
     candidatos de 7b e 7c numa só release 1.5.0.
   - R-0021 (7a) não depende da 1.5.0: usa a 1.4.0, já publicada, e corre enquanto a 1.5.0 é
     produzida.
   - O caminho crítico passa por S-1.5 → R-0022.
5. **Frontends em paralelo (fase D).**
   - Cinco frentes com locks por app, no máximo 3 simultâneas (orçamento), alternando famílias.
   - Um lock compartilhado exige serialização: `MOD-shared-policy` e o backend RAIT para comandos
     sem chave de política (R-0025) e para as delegações do Portal (R-0027). Os CTGs que tocam esse
     lock são serializados; os demais correm livres.
   - O BOAT web é o módulo `sinistros` dentro de `apps/teat/web`. Por isso, R-0028 e R-0029
     compartilham os locks `MOD-teat-web-sinistros` e `MOD-teat-web-shell`: o CTG web de R-0028
     precede qualquer mudança de shell ou de rotas de R-0029.
   - Cada rodada entrega apenas o **delta do manifesto de disponibilidade** das suas rotas, em
     `docs/framework/arch/availability/<surface>.availability.json`, no esquema fixado em
     `work/rounds/R-0030/availability-manifest.schema.md`. Não entrega manuais. Os selos são os
     definidos nesse esquema.
6. **Documentação de usuário uma única vez (fase E).** Os manuais descrevem o comportamento real,
   já ligado. Na ordem original, seriam escritos antes da ligação e reescritos cinco vezes. O
   manifesto acumulado na fase D é o índice de cobertura do gate.
7. **PEC ao final (fase F, OD-C2-002).**
   - Nasce sobre a plataforma consolidada e com o padrão de ligação já provado cinco vezes.
   - Entrega o próprio manual, pela convenção de R-0030.
   - Pode abrir em paralelo a R-0030, porque os locks são disjuntos.

**Caminho crítico estimado, em janelas de maestro:**

| Etapa                                                           | Janelas       |
| --------------------------------------------------------------- | ------------- |
| Fase A (em paralelo)                                            | 2             |
| R-0020                                                          | 2             |
| Fase C: R-0021 ∥ S-1.5, depois R-0022 → R-0023 → R-0024         | 2 + 3 + 2 + 2 |
| Fase D (3 em paralelo, 2 ondas)                                 | ≈ 6           |
| R-0030 (4) ∥ R-0031 (5) ∥ R-0032 (4, após o CTG-0001 de R-0031) | ≈ 6           |

O total fica em ≈ 25 janelas no caminho crítico, contra ≈ 34 na ordem original, sem contar o
retrabalho evitado. Os números são estimativas e são recalibrados no bootstrap de cada rodada.

## 4. Convenções comuns a todas as rodadas

- **Maestros (OD-C2-003): Sol 6 e Opus 5.5, alternados.**
  - Reviewer sempre da outra família, nível grande, pela ponte `tools/orchestra/bridge.sh`:
    - maestro Sol 6 → reviewer Opus 5.5 (Claude Code);
    - maestro Opus 5.5 → reviewer Sol 6 (Codex).
  - Workers pela escada da família do maestro, conforme `model-ladder.md`:
    - família Claude: Opus 5.5 grande e médio, Sonnet 5 pequeno;
    - família Codex: Sol 6 grande, e Terra e Luna vigentes nos níveis médio e pequeno.
  - Os ids exatos da CLI são confirmados com `codex --help` e `claude --help` no bootstrap.
    `model-ladder.md` é atualizado em R-0018.
- **Método orquestra (ADR-0022).**
  - Prompt de maestro instanciado de `docs/meta/agents/orchestra/maestro-prompt.template.md`.
  - Tríades Architect → Inspector → Engineer; transcrição por `transcriber-docs`.
  - Um PR por CTG; merge somente com CI verde e PASS do reviewer.
- **DEVAI 1.5.6.**
  - `devai evidence record` por CTG e `devai audit observe` no merge.
  - Fechamento com `devai round close` e, a partir de R-0020 (inclusive), `devai round seal`.
  - Nenhuma rodada fecha com prova sem âncora na cadeia.
- **Evidência versionada.** Relatórios de worker em `reports/` versionados. Até R-0018 corrigir o
  `.gitignore`, usar `git add -f`; R-0007 perdeu 24 relatórios por esse motivo.
- **Critérios de aceitação imutáveis.**
  - Qualquer mudança é adenda numerada no `plan.md` com decisão do Owner.
  - Critério substituído aparece no closure como não cumprido, nunca como PASS.
  - Proibido reproduzir as substituições de R-0013 e R-0014 (Lighthouse trocado por axe; suíte
    integral trocada por testes focais) e o waiver SQL2 de R-0007.
- **Testes de caracterização antes de toda troca de implementação** (fase C). A matriz papel × rota
  e os negativos de RLS e tenancy são gerados e versionados antes e depois; divergência é FAIL.
- **Orçamento.** `budget.json` obrigatório. Ao estourar, o maestro grava checkpoint e para, sem
  dispensa implícita.
- **Decisões de Owner.** Toda OD nova vai para o registro canônico no mesmo PR:
  `docs/meta/knowledge-base/open-decisions-rait.md` ou o build pack do app. OD que vive só em
  `contracts/` não conta.
- **Proibições.**
  - Nenhuma integração externa real (SENATRAN, gov.br, SNE, banco, PAdES/TSA, RENAEST, VAPID,
    biometria); tudo segue por mock ou porta, nos termos da #125 e da #126.
  - Nenhum valor normativo inventado (`source_pending`).
  - Nenhum `--force` e nenhuma edição de arquivo gerado.
- **Padrão de ligação (fase D, R-0031 e R-0032).** R-0024 entrega um contrato de ligação único em
  `docs/framework/arch/frontend-wiring-pattern.md`, e as rodadas de ligação o aplicam sem variantes:
  - cliente de comando gerado;
  - If-Match e Idempotency-Key;
  - mapeamento de erros;
  - estados de tela;
  - SSE canônico;
  - guardas por política.

## 5. Critério de sucesso da campanha

- `pnpm stack:start` sobe a stack completa num clone limpo, e `pnpm stack:smoke` passa. Há runbook
  versionado.
- Índice de ADR e índices de estado coerentes, verificados por gate.
- `law/*` e `product/` válidos contra os esquemas DEVAI.
- `devai` com R-0003…R-0032 seladas, cadeia sem provas órfãs e sensores com PASS medido; a meta é
  fixada em R-0020 a partir da linha de base.
- **Plataforma:**
  - Nenhuma reimplementação local de módulo oferecido pelo STYNX.
  - SSE, tenancy e autorização com fonte única.
  - Pin STYNX 1.5.0 em todos os manifestos.
- **Frontends:**
  - RAIT, DASHBOARD, PORTAL, BOAT, TEAT web e PEC sem stubs de comando: nenhum
    `*CommandUnavailableError`, nenhum `SERVICE_UNAVAILABLE` de delegação disponível.
  - Nenhuma página L0 sem OD que a justifique.
- **Documentação de usuário:**
  - Manual por perfil em pt-BR.
  - Cobertura de 100% das rotas do manifesto, cada uma com selo de disponibilidade coerente com o
    código.

## 6. Fora de escopo (registrado)

- TEAT mobile produtivo (#108–#112).
- Camada nativa Capacitor/Android de BOAT e TEAT (#109).
- Homologações externas (#120, #125).
- Decisões jurídicas e institucionais (#126).
- App mobile do PEC (ADR-0034 §7).

## 7. Decisões do Owner (2026-09-26)

| OD        | Decisão                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-C2-001 | Antecipar e reordenar conforme necessário. Aplicada em §2 e §3.                                                                              |
| OD-C2-002 | PEC terá frontend. ADR-0034 (`docs/meta/adr/ADR-0034-pec-web-frontend.md`); rodadas R-0031 (consoles) e R-0032 (cidadão no Portal) ao final. |
| OD-C2-003 | Maestros Sol 6 e Opus 5.5 (§4).                                                                                                              |
| OD-C2-004 | STYNX alvo: próxima minor, **1.5.0**. O workspace STYNX está em 1.4.0; o pin atual aqui é 1.3.1. R-0021 usa 1.4.0 e R-0022 fixa 1.5.0.       |

Pendência derivada: o nome e o id de CLI de "Sol 6" devem ser confirmados no bootstrap de R-0017.
Se "Sol 6" for o sucessor de GPT-5.6 Sol, a escada Codex (Terra e Luna) é revista em R-0018.

## 8. Adendas de harmonização (Architect, 2026-09-26)

Ajustes feitos ao consolidar os planos R-0017…R-0031. Todos são vinculantes.

- **A1. Manifesto de disponibilidade.**
  - Caminho canônico: `docs/framework/arch/availability/<surface>.availability.json`.
  - Esquema: `docs/framework/schemas/availability-manifest.schema.json`, definido por
    `work/rounds/R-0030/availability-manifest.schema.md`.
  - Superfícies: `rait-web`, `dashboard-web`, `portal-web`, `boat`, `teat-web`, `teat-mobile`,
    `pec-web`.
  - OD-R25-005 e OD-R26-005 ficam **resolvidas** por esta adenda.
- **A2. Relatórios de inspeção versionados.** Os relatórios de inspeção foram versionados em
  `work/campaigns/C-0002-inspecao-2026-09-25/`, para que existam nas worktrees. Todas as referências
  dos planos apontam para lá.
- **A3. `dashCan` sai da R-0023 e vai para a R-0024.** O ajuste mantém disjuntos os locks das duas
  rodadas. `C-0002-stynx-upstream-spec.md` §2 é lido com esta adenda.
- **A4. Contagens corrigidas pela verificação dos agentes.**
  - O pin do STYNX aparece em 59 manifestos de fonte, não em 69.
  - O PEC tem 17 módulos em `backend/domains/ch`.
  - O RAIT tem 53 operações de comando: o número 256 do diagnóstico corresponde a rotas HTTP.
- **A5. STYNX 1.4.0.** A 1.4.0 tem a mesma API da 1.3.1. R-0021 faz o bump apenas para alinhar a
  versão e troca por `@stynx-nyx/*` só o que a 1.3.1 já oferecia. O outbox do STYNX atualiza a mensagem
  de cada agregado em vez de acrescentar um registro novo; por isso R-0021 troca apenas o despacho
  RENACH, e o log de eventos para SSE fica em R-0022 (OD-R21-02, OD-R22-01).
- **A6. TEAT web × ADR-0033.** A ADR-0033 também restringe o TEAT web à homologação. Sem decisão
  OD-R29-001, R-0029 executa só o CTG-0001. O Architect recomenda decidir OD-R28-001 e OD-R29-001 em
  conjunto, pela opção (a): caminho real atrás da gateway, homologação como padrão e rotas marcadas
  como `homologacao`.
- **A7. Pré-condição de abertura.** Esta campanha, a ADR-0034 (com a linha no índice de ADRs), a
  especificação STYNX, os relatórios de inspeção e os planos R-0017…R-0032 precisam estar em
  `origin/main` antes de abrir qualquer rodada, porque os maestros leem de worktrees.

### ODs que bloqueiam a abertura ou um CTG

Nenhuma desde 2026-09-26: a OD-S15-01 foi decidida (§10).

As demais ODs, com a recomendação do Architect para cada uma, estão nos respectivos `plan.md`.

## 9. Decisões do Owner de 2026-09-26 (segunda leva) e adendas

| OD                      | Decisão                                                                               | Efeito                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| OD-R28-001 + OD-R29-001 | Decididas juntas, opção (a)                                                           | Caminho real atrás do gateway; homologação continua sendo o padrão; selo `homologacao`; R-0029 liberada                         |
| OD-PW-001               | Plano completo do módulo cidadão/PEC no Portal                                        | Nova rodada **R-0032 `portal-pec`**; a R-0031 perde a superfície C (19 fichas, 5 janelas)                                       |
| OD-R20-003              | Autoria por caminho                                                                   | Aplicada em R-0020, CTG-0005                                                                                                    |
| OD-R20-005              | Adotar a Constituição 1.0.1                                                           | `devai init bind --constitution` em R-0020                                                                                      |
| OD-R27-001              | (a) ator técnico `portal-delegation`, com o cidadão como `onBehalfOf` e parte do caso | Chaves `…-portal`; padrão estendido aos comandos cidadãos da R-0032                                                             |
| OD-R27-002              | (b) junta fechada na R-0027                                                           | Entregue inteira pela R-0032; exceção declarada no fechamento da R-0027                                                         |
| OD-R32-001              | (C) híbrida                                                                           | Vínculo por `portal.entitlement` a partir do evento `ch`, projeções só com metadados, porta do dossiê, sem papel novo, ADR nova |
| A9                      | Confirmada pelo Owner                                                                 | A identidade da OD-R27-001 vale para a R-0032                                                                                   |

- **A8.** A superfície do candidato (P-01…P-07) passa a pertencer à R-0032. As menções que ainda
  atribuem essa superfície à R-0031 leem-se como R-0032. Isso vale para o plano de R-0027
  (OD-R27-002) e para o esquema de R-0030 (a superfície `portal-web` recebe as entradas PEC pela
  R-0032).
- **A9.** A escolha na OD-R27-001 define também o padrão dos comandos do cidadão na R-0032, que usam a
  delegação do Portal. As duas decisões precisam ser coerentes.
- **A10.** Os critérios de aceitação de R-0025 foram revistos antes da autorização da rodada, como
  consequência da OD-R25-001. Não se trata de reescrita durante a execução (§4).

## 10. OD-S15-01 decidida pelo Owner (2026-09-26)

- **Escopo: todos os 15 candidatos (U1–U15) são obrigatórios na 1.5.0.** Todo requisito `UPS-*` de
  U1–U15 passa a ser **MUST** para a conformidade da release, inclusive os que a especificação
  classificava como SHOULD/MAY e P2/P3: TEN, SSE, NGSSE, AUTHZ, SES, JOB, TXN, IFM, NGERR, SHELL,
  TEST, HOOK, CAL, NGIDEM e CLI. A regra de consumo (§7) vale para todos: item ausente leva o CTG
  consumidor a checkpoint e parada (OD-R22-02), sem _shim_ nem cópia. As candidatas UPS-SIG, UPS-OBX
  e UPS-OFS continuam dependentes da confirmação de R-0021 por adenda (§8), com nível fixado nessa
  adenda e aprovado pelo Owner.
- **Consumo por release candidate.** R-0022 (e as rodadas seguintes) pode desenvolver e testar sobre
  `1.5.0-rc.N`, mas o merge em `main` só ocorre com o pin `1.5.0` final e a tabela de conformidade
  (§7) preenchida. Nenhum PR mescla com pin de RC.
- **UPS-TEN-01 = opção (b).** O core abre o escopo de `RequestContext` num **middleware** que roda
  antes de qualquer guard ou interceptor, e a tenancy apenas o enriquece. A ordem de registro deixa de
  importar. A opção (a) fica descartada.
- **UPS-TEN-02, conflito Host × `X-Tenant-Id`: rejeitar.** Em rota pública com tenant, um cabeçalho
  divergente do tenant resolvido pelo Host é rejeitado (fail-closed, com código documentado). O
  tenant nunca é escolhido silenciosamente.
- **Efeito no prazo.** S-1.5 cresce (P2/P3, CLI incluído). O caminho crítico é mitigado pelo consumo
  por RC. A estimativa da campanha é recalibrada no bootstrap de S-1.5.

Efeitos:

- **R-0022:** consumo por RC; middleware de contexto; negativo de conflito Host × cabeçalho.
- **R-0023:** o CTG de sessão passa a ser incondicional.
- **R-0024:** adota U8–U15 sem exceção, incluindo a avaliação e a migração do gerador de blueprints
  para `stynx generate module`.
- **S-1.5:** escopo máximo, com estimativa recalibrada no seu bootstrap.

## 11. Adenda A-C2-11: abertura antecipada por caracterização (Owner, 2026-09-27)

A regra da orquestra (`waves.md`) permite abrir uma frente sobre base empilhada: o que depende do
upstream é o **merge**, não a abertura. Os CTG-0001 de R-0022 e de R-0023 são caracterização pura,
sem troca de implementação, e passam a poder abrir antes do merge da rodada anterior:

| Rodada | CTG antecipado                                 | Pode abrir                                                                                  | PR só depois de | Regra de integração                                                                                                                             |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| R-0022 | CTG-0001 (caracterização de tenancy/RLS e SSE) | em paralelo a R-0021, empilhado em `orchestra/stynx-canonical`                              | merge de R-0021 | a caracterização roda de novo sobre `main`; mudança de teste só por adenda do Architect atribuída a R-0021                                      |
| R-0023 | CTG-0001 (matriz papel × rota × método)        | em paralelo a R-0022, sobre `main` com R-0021 ou empilhado em `orchestra/stynx-sse-tenancy` | merge de R-0022 | a matriz é regenerada sobre `main`; cada linha de diff é atribuída a uma mudança documentada de R-0022, e linha sem atribuição bloqueia o merge |

- **Efeito:** o caminho crítico da fase C encurta em ≈ 1–2 janelas.
- **O que não muda:**
  - a ordem de merge (R-0021 → R-0022 → R-0023);
  - a exigência de STYNX 1.5.0 final para os CTGs de troca;
  - a regra "caracterização mescla antes de qualquer troca".
- **Detalhes:** estão em `plan.md` §Adendas de R-0022 e de R-0023, e no §0 dos respectivos
  `prompts/00-maestro.md`.

## 12. OD-C2-005: fluxo de rodada contínuo, sem PRs nem checks intermediários (Owner, 2026-09-27)

**Decisão do Owner.** A diretriz é o **menor tempo de conclusão**. Nas rodadas **R-0022…R-0032**, os
CTGs são implementados em sequência direta, ou em paralelo quando possível, numa branch única por
rodada. O CI local, o PR, o CI remoto e a publicação final acontecem **uma única vez, no fim da
rodada**. Esta decisão prevalece sobre o que dizem §4 ("um PR por CTG", "delivery-review por CTG")
e os planos e prompts das rodadas afetadas.

**Durante a rodada**

- **Branch única** `orchestra/<frente>`, com um commit por tarefa ou por CTG. Os commits seguem
  `CODESTYLE.md` e a autoria por caminho (OD-R20-003).
- **Entre CTGs não há:**
  - PR, CI remoto, merge em `main`;
  - `devai evidence record`, `devai audit observe`;
  - `pnpm check` completo;
  - delivery-review.
- **Mantidos:**
  - os `acceptance_commands` de cada tarefa, que são a definição de pronto do worker na tríade;
  - a triagem de falha por tarefa;
  - **um** ciclo de prompt-review no bootstrap, sobre o plano e os prompts de todos os CTGs.
- **Paralelismo de CTGs.** CTGs sem dependência de tarefa entre si e com locks disjuntos correm em
  paralelo, com até 3 workers simultâneos na mesma worktree e fronteiras de escrita disjuntas. O
  maestro serializa os commits. Cada plano traz a seção §Execução OD-C2-005 com as ondas.
- **Push sem PR.** O branch é publicado (`git push -u`) ao fim de cada onda, para que as rodadas
  dependentes possam empilhar sobre ele.

**Fim da rodada**, na ordem:

1. Integrar `origin/main` por merge, nunca rebase de branch publicado. Todos os upstreams da rodada
   precisam estar em `main`.
2. **CI local completo:**
   - `pnpm check`;
   - os tiers de teste do plano (`pnpm backend:test:ci` e os dos apps);
   - o RC local atestado (`pnpm devai:rc:prepare`) quando aplicável.
3. **Uma delivery-review** do reviewer da outra família sobre o diff inteiro da rodada.
   - `REVIEW`: correções restritas aos itens apontados, com no máximo 2 ciclos.
   - `FAIL`: `escalated`.
4. **Um PR** contra `main`, com o corpo pelo template. O corpo traz a tabela CTG → tarefas → commits
   e o resultado dos gates.
5. **CI remoto**. Falha de código volta à tarefa responsável. Merge somente com CI verde e PASS.
6. **Publicação final:**
   - um `evidence-<round>.json` com todos os CTGs;
   - `devai evidence record`;
   - `devai audit observe` no SHA do merge;
   - `closure.json`, `devai round close` e `devai round seal`;
   - `waves.md` e `backlog.md` atualizados.

**Entre rodadas: abertura empilhada.** Uma rodada pode **abrir e trabalhar** sobre o branch
publicado do upstream (`origin/orchestra/<upstream>`), integrando as revisões dele por merge. O
**PR final** só abre depois do merge do upstream em `main`, e o CI local é refeito sobre `main`.
A adenda A-C2-11 (§11) fica subsumida por esta regra.

**Nenhum caminho novo para pular gates.** Continuam valendo:

- STYNX 1.5.0 **final** para o merge das rodadas que trocam implementação (OD-S15-01);
- recibos do Owner para as ações proibidas;
- critérios de aceitação imutáveis;
- ODs no registro canônico;
- nenhum `--force`;
- nenhuma edição de arquivo gerado.

**Risco aceito pelo Owner.** Uma falha só detectada no fim custa mais retrabalho. A mitigação é
manter os comandos de aceitação por tarefa e o prompt-review inicial.

**Locks partilhados da fase D.** Os locks `MOD-shared-policy` e `apps/teat/web` deixam de
serializar PRs por CTG. O conflito vira de merge no fim da rodada: a rodada que mesclar depois
integra `main`, mantém os dois blocos em `policy.ts` e roda de novo `pnpm --filter @detran/shared
test` e `policy-routes.e2e`.

### Adenda A-C2-12: esclarecimentos da OD-C2-005 (Architect, 2026-09-27)

- **PR de publicação.** A publicação final (`audit observe` no SHA do merge, `closure.json`,
  `round close`, `round seal` e índices) só pode ser feita depois do merge. Ela sai num **segundo e
  último PR por rodada**, `chore(round): close R-00nn`, que contém só `record/`, `work/rounds/R-00nn/`
  e índices, sem código. É a única exceção ao "um PR por rodada", como em R-0017 (#144/#145). A
  evidência do conteúdo (`evidence record`) segue no PR principal.
- **Decisões do Owner sem esperar o PR.** O maestro pede ao Owner, na própria sessão, a decisão de
  cada OD assim que ela surgir. O registro canônico continua no PR final, e os padrões fail-closed
  valem até a decisão.
- **R-0031 × R-0030.** O manual PEC dos consoles sai de R-0031 e vai para R-0032, que já espera
  R-0030. O PR final de R-0031 deixa de esperar R-0030 e passa a depender só de R-0022, R-0023 e
  R-0024 (detalhe nos `plan.md` de R-0031 e de R-0032).
- **Referências a SHA de merge de CTG.** Em critérios que citavam o SHA do merge de um CTG
  (ex.: R-0023 CTG-0001), vale o SHA do commit do CTG na branch única ou da última regeneração
  atribuída. O texto do critério não muda.
