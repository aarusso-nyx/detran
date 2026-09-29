---
id: ARCH-PORTAL-BUILD-PACK
title: Pacote de construção do Portal — definições e pacotes de trabalho para a orquestra (domínio portal, projeções, PWA)
status: draft
apps: [portal]
updated: 2026-09-17
---

# Pacote de construção do Portal

Índice das definições para construir `domains/portal` (ADR-0019), as projeções (ADR-0020) e o PWA
`apps/portal/web`. Segue as regras comuns do `rait-build-pack.md` §0 e os manuais de
`docs/meta/agents/`. Fontes: [APP-PORTAL], [WF-PORTAL-001…004], [UC-PORTAL-001…019],
[RN-PORTAL-101…128], [JRN-PORTAL-001…011], [IU-PORTAL-001]; `portal-frontends.md`,
`portal-route-contract.md`, `portal-error-catalog.md`; ADR-0016…0020; portal e domínio
`appeals-administrative-appeals` do repositório de origem (somente leitura, referência).

## 1. Estado de partida (verificado em 2026-09-13)

| Item                                     | Situação                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus de produto                        | completo: trilha de apelação `approved`; 28 regras `draft`; 27 telas; catálogo de 15 serviços                                                                                                                                                                                                              |
| Backend neste monorepo                   | nenhum módulo, blueprint ou DDL do Portal; política tem só `portal:appeal:create                                                                                                                                                                                                                           | read-own` |
| Origem (`../teat`)                       | portal Angular com 27 rotas (9 telas reais, 15 stubs de catálogo, 3 estáticas/leitura), 12 endpoints `/v1/portal/*` não publicados no contrato, domínio `appeal.*` com caso próprio (a **não** portar: o caso é o do RAIT) e `portal.*`/`platform.*` (catálogo, vínculo, política de ato, marca, hostname) |
| Identidade                               | origem usa pool Cognito com grupos `citizen`/`legal-representative` e claim `custom:teat_assurance_level`; **sem gov.br**; ADR-0019 exige federação gov.br                                                                                                                                                 |
| Integrações disponíveis                  | `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), `SnePort`, `RenachPort`, RENAVAM leitura — mock-first (ADR-0008)                                                                                                                                                                               |
| Decisões abertas que condicionam módulos | DT-050 (portaria de níveis), DT-026 (renúncia 40%), DT-027 (CRLV-e × recurso), DT-031 (cartão), DT-051 (nível da ouvidoria), DT-028 (declaração WCAG, adotada na origem em 2026-08-28), DT-066 (Lei 14.129)                                                                                                |

### Estado em 2026-09-16 (R-0009)

`work/rounds/R-0009/` (frente `portal-backend`) executou WP-P0…P3. Entregue: ADR-0024 (gov.br via
Cognito); os cinco pacotes de workspace `@detran/portal-{identity,requests,inbox,citizen-service,
projections}` (`BP-PORTAL-*-001`, DDL `19-portal-platform.sql`, `61…65-portal-*.sql`, timers
`owner='portal'` no DDL `14-inf-lifecycle-vocabulary.sql`, schema `portal` em `11-auth-functions.sql`);
fixtures `70-fixtures-portal.sql` + `71-fixtures-portal-events.sql`; controladores `/v1/portal/*`
(`portal-route-contract.md` §2–§9), `RequestDelegationService`, as cinco projeções (ADR-0020) com
replay, SSE `/v1/portal/stream`, política `portal:*`; contratos
`docs/framework/contracts/BP-PORTAL-*.commands.openapi.json` (138 operações) e
`docs/framework/schemas/portal-request-draft.schema.json`. Dois PR: **#54** (CTG-0001 — identidade +
modelo + fixtures, mesclado em `1175f4f33015e6c0f389bb3e2ada2ef1ae5304c8`) e **#56** (CTG-0002 —
rotas + delegações + contratos). Ficou fora desta rodada: delegações reais de
`defesa_previa`/`recurso_jari`/`recurso_cetran`/`indicacao_condutor`/`pagamento` (R-0007 ausente de
`main`, §3), adesão real ao SNE nacional e o endpoint de privacidade/LGPD, CNH-e/CRLV-e assinados
(R-0014), `junta_medica` (delegação PEC sem comando, OD-P19) e WP-P4…P6 (telas, PWA, homologação).

## 2. Pacotes de trabalho

### WP-P0 — Identidade federada (Architect → Engineer; ADR curta)

Ler: ADR-0019 §1, [WF-PORTAL-002], `portal-rait-runtime-deployment.md` da origem, `@stynx-nyx/auth`.
Produzir: ADR "gov.br via Cognito" (IdP OIDC gov.br no pool do cidadão; mapeamento do nível de
confiabilidade gov.br → `assurance_level` simples/avançada/qualificada como claim assinada; CPF
como `sub` de negócio; grupos `CIDADAO`; representação como atributo); configuração do pool no
`backend/app`; guarda que rejeita claim ausente. Gate: e2e de login com IdP simulado;
`PORTAL.ASSURANCE_NOT_VERIFIED` fail-closed.

**Executado em R-0009** (PR #54): ADR-0024 substitui a ADR curta prevista;
`PortalCitizenGuard`/`assertActLevel` (`@detran/portal-identity`), claims locais
`DETRAN_LOCAL_ASSURANCE_LEVEL`/`DETRAN_LOCAL_CPF`, guarda fail-closed
`PORTAL.ASSURANCE_NOT_VERIFIED` provados por e2e com IdP simulado. Fora: credenciais
institucionais do IdP gov.br real (OD-P15, homologação R-0014 WP-P6).

### WP-P1 — Modelo de dados (Architect-blueprint)

| Blueprint                       | Entidades                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BP-PORTAL-IDENTITY-001`        | `portal.subject` (cpf hash, nome, nível observado, observado em), `portal.representation` (representado, instrumento, escopo, validade, estado), `portal.act_level_policy` (ato → nível, base, `enabled`, vigência), `portal.entitlement` (alvo genérico, relação, origem, validade)                                                                                 |
| `BP-PORTAL-REQUESTS-001`        | `portal.request` (máquina `WF-PORTAL-001`, `service_key`, alvo, `channel` FK canal, delegação: domínio, comando, id externo), `portal.request_draft` (jsonb versionado), `portal.request_attachment` (hash, intenção de upload), `portal.protocol` (número, data-hora, canal, hash do recibo), `portal.consequence_ack` (texto, versão, quando), `portal.evaluation` |
| `BP-PORTAL-INBOX-001`           | `portal.inbox_item` (kind, source, evento de origem, lido em), `portal.acknowledgement_evidence` (hash do exibido, quando, assinado), `portal.sne_enrollment` (estado, canal, desde, cancelado em), `portal.push_subscription`                                                                                                                                       |
| `BP-PORTAL-CITIZEN-SERVICE-001` | `portal.manifestation` (máquina `WF-PORTAL-004`, tipo, sigilo, anônimo), `portal.manifestation_extension` (justificativa), `portal.service_catalog` (11 campos, check de motivo), `portal.brand_profile`, `portal.public_hostname`                                                                                                                                   |
| projeções (ADR-0020)            | `portal.infraction_view`, `portal.process_timeline`, `portal.points_view`, `portal.crash_view` (BOAT), `portal.exam_view` (PEC)                                                                                                                                                                                                                                      |

Timers no motor de prazos (`owner='portal'`): `T-PROTOCOLO` (imediato), `T-OUV-RESPOSTA` (30+30),
`T-OUV-INFO` (20+20, interno), `T-AVAL-CONVITE`, `T-SNE-CIENCIA` (30, lido do módulo de
notificação), `T-LGPD-ACESSO` (regime público, parâmetro). Fixtures: um cidadão por nível, uma
representação, um pedido por estado, uma manifestação por estado, catálogo completo com 9
disponíveis/2 parciais/4 indisponíveis com motivo. Gate: `pnpm blueprints:check`, `pnpm verify:rls-ddl`
(exceto `brand_profile`/`public_hostname`, sem RLS por desenho), `bash backend/database/seed.sh` em banco limpo.

**Executado em R-0009** (PR #54): cinco blueprints (`BP-PORTAL-{IDENTITY,REQUESTS,INBOX,
CITIZEN-SERVICE,PROJECTIONS}-001`); DDL `19-portal-platform.sql` (plataforma, manuscrito),
`61…65-portal-*.sql` (gerado), timers `owner='portal'` em `14-inf-lifecycle-vocabulary.sql`,
schema `portal` em `install_tenant_triggers()` (`11-auth-functions.sql`); `70-fixtures-portal.sql`.
Fora: `portal/complaints` (DDL 60, PEC) mantido intacto, sem unificação com `portal.manifestation`
(M2, OD-P14).

### WP-P2 — Rotas, delegações e projeções (Engineer-backend)

Ler: `portal-route-contract.md`, `portal-error-catalog.md`, ADR-0016/0015/0018, comandos do RAIT
(`rait-build-pack.md` WP-B). Produzir: controladores `/v1/portal/*`; serviço de delegação (uma
transação: protocolo → comando do domínio dono → estado `EM_ANDAMENTO_NO_ORGAO`; falha após o
protocolo vira pendência interna, nunca perde o protocolo); projetores das cinco projeções a partir
dos eventos; evidência de ciência para itens SNE (`NOTIFICACAO_CIENCIA`); adesão/cancelamento SNE
via módulo de notificação; leituras nacionais cacheadas com `cachedAt`; SSE `/v1/portal/stream`;
regras de política `portal:*` para `CIDADAO`. Gate: `pnpm backend:test:ci` cobrindo vínculo (sem
vínculo = 404), nível (matriz por ato), idempotência com corpo diferente, protocolo imediato antes
de qualquer validação de conteúdo, projeção reconstruída por replay.

**Executado em R-0009** (PR #56): controladores `/v1/portal/*` (`portal-route-contract.md` §2–§9),
`RequestDelegationService`, projetores das cinco projeções (ADR-0020) com replay, evidência de
ciência SNE, adesão/cancelamento SNE sem envio real (OD-P16), leituras nacionais cacheadas, SSE
`/v1/portal/stream`, política `portal:*`. Fora: delegações reais de `defesa_previa`, `recurso_jari`,
`recurso_cetran`, `indicacao_condutor` e `pagamento` — R-0007 (`rait-backend`) não está em `main`
nesta rodada (M8/M23, §3): as rotas respondem `PORTAL.SERVICE_UNAVAILABLE`
`{unavailableReason:'delegacao_indisponivel_r0007'}` e o teste de delegação real fica `it.todo`
citando R-0007 (`docs/meta/knowledge-base/backlog.md` §Handoffs de engenharia).

### WP-P3 — Payloads e contrato (Transcriber-docs)

`docs/framework/contracts/BP-PORTAL-*.openapi.json` com os corpos por `serviceKey` (§5.1 do
contrato), respostas 4xx com códigos do catálogo, `Idempotency-Key` determinística documentada,
exemplos com as fixtures; `docs/framework/schemas/portal-request-draft.schema.json` por ato.
Gate: `pnpm contracts:check`; `pnpm contracts:clients` (cliente gerado compila).

**Executado em R-0009** (PR #56, TASK-0009): `docs/framework/contracts/BP-PORTAL-*.commands.openapi.json`
(138 operações) e `docs/framework/schemas/portal-request-draft.schema.json`; `pnpm contracts:clients`
rodado pelo maestro (Engineer) no checkpoint de CTG-0002.

### WP-P4 — Telas, formulários, mapa de tradução e i18n (Transcriber-docs → Engineer-frontend)

Uma ficha `IU-PORTAL-<T-nn>.md` por tela (27) no padrão de `screen-specification-standard.md` da
origem (identidade, acesso, entrada, dados, estados, comandos, saída, segurança, acessibilidade,
testes), com os estados obrigatórios (carregando, vazio, sem elegibilidade, erro recuperável, sem
permissão, indisponível) e as regras de conteúdo de [IU-PORTAL-001] §E; **mapa de tradução** de
estados internos (RAIT/PEC/BOAT/infração → situação cidadã) como tabela única em
`i18n/portal.pt-BR.json`; schemas dos 14 formulários (`portal-frontends.md` §7); textos jurídicos
versionados (consequências, quatro efeitos do SNE, renúncia 40%). Gate: `docs:kb:check`, teste que
cada tela tem ficha e rota, revisão do Owner (linguagem cidadã).

**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues fichas, mapa
de tradução, i18n e schemas. B1/M3 substitui Lighthouse por `axe-core` por rota em TestBed;
delegações ficam `delegacao_indisponivel_r0007` até R-0007; OD-P15/P16/P17/P19/P88 seguem
`source_pending`; SNE foi provado pelo mock, não por homologação real.

### WP-P5 — PWA (Engineer-frontend)

`apps/portal/web` (Angular 22, `@detran/ui` para primitivos, shell próprio, PWA com cache cifrado
só para CNH-e/CRLV-e; 13 módulos; ~40 rotas da §4; componentes da §5; guardas de nível, vínculo e
disponibilidade; `ResumeService`; a11y AA + eMAG com auditoria automática por rota). Gate:
roteamento por nível e vínculo, TestBed dos compartilhados, Lighthouse PWA e a11y ≥ 90 em CI,
`ng build`, `pnpm check`.

**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues Angular,
38 rotas, guardas, PWA/offline, SSE e push. B1/M3 mantém `axe-core` por rota em TestBed no lugar
de Lighthouse; delegações ficam `delegacao_indisponivel_r0007` até R-0007 e OD-P15/P16/P17/P19/P88
permanecem `source_pending`; SNE é mock, não homologação real.

### WP-P6 — Integração e homologação (Engineer; Inspector)

Adesão SNE real (mock → homologação), cotação/reconhecimento via `CdtPort`, CNH-e/CRLV-e reais,
push web, e2e das 11 jornadas com as fixtures; teste de que nenhum token interno aparece em
nenhuma resposta `/v1/portal/*` (lint de payload contra o vocabulário dos workflows).

**Executado em R-0014.** Rodada R-0014; PRs #60…#65 (`1396f1a`, `2888c9b`, `ddca527`,
`d2412558`, `4c3be453`, `11d939f6`); evidências generic sequence 1…6. Entregues 11 jornadas,
lint de payload e CNH-e/veículos/quitação no `senatran-mock`. Fora: homologação real de SNE e
provedores de OD-P15/P16/P17/P19/P88; delegações ficam `delegacao_indisponivel_r0007` até R-0007.
B1/M3 mantém `axe-core` por rota em TestBed, não Lighthouse.

## 3. Ordem e paralelismo

```text
WP-P0 ──► WP-P1 ──► WP-P2 ──► WP-P3 ──┐
                └──► WP-P4 ──────────────┼──► WP-P5 ──► WP-P6
```

WP-P2 depende dos comandos do RAIT (WP-B) e dos módulos de ADR-0016/0015 para as delegações de
defesa, indicação e pagamento; até lá, as rotas existem e devolvem `SERVICE_UNAVAILABLE` com
motivo (o catálogo é dado). Sonnet: WP-P3, WP-P4; Opus/Terra: WP-P0, WP-P1, WP-P2.

**Nota (R-0009):** WP-P2 foi executado sem WP-B — `rait-backend` (R-0007) não está em `main` nesta
rodada. As delegações reais de `defesa_previa`, `recurso_jari`, `recurso_cetran`,
`indicacao_condutor` e `pagamento` ficam `PORTAL.SERVICE_UNAVAILABLE`
`{unavailableReason:'delegacao_indisponivel_r0007'}` até R-0007 mesclar (M8/M23 de
`work/rounds/R-0009/plan.md`); o teste de delegação real com alvo real fica `it.todo` citando
R-0007. A adesão real ao SNE nacional (OD-P16) e o endpoint `@stynx-nyx/privacy` (OD-P17) seguem o
mesmo padrão, mas por R-0014, não por R-0007.

## 4. Questões abertas do Portal (OD-P)

| ID     | Questão                                                                             | Premissa adotada                                                                                                                                                                                                                                                                                                                        | Decisor               |
| ------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| OD-P01 | Portaria estadual de níveis de assinatura por ato (DT-050)                          | matriz do Decreto 10.543 como dados em `act_level_policy`; teto avançada — **PN DETRAN-AM 001/2025 localizada** ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]): gov.br ouro/e-Notariado/qualificada para defesas, recursos, indicação e procurações → `act_level_policy` com fonte; resta o CETRAN-AM — **H.49**: CETRAN pela mesma regra | Owner / LEGAL         |
| OD-P02 | Mapeamento dos selos gov.br (bronze/prata/ouro) → simples/avançada                  | **fechada por H.50** (Owner, R-0009): prata ou ouro = avançada; bronze = simples; sem exigir qualificada; risco registrado — PN DETRAN-AM 001/2025 art. 1º só nomeia o nível ouro, ato assinado com prata é impugnável até portaria própria (ADR-0024 §Decisão 2, §Consequências); carta a DETRAN-AM pedindo a portaria                 | Owner (fechada, H.50) |
| OD-P03 | Instrumento da renúncia na faixa de 40% (DT-026) e sua ativação (OD-003)            | declaração eletrônica versionada; faixa desligada por flag — **DT-026 respondido**: termo digital assinado no PORTAL, sem depender do SNE; ativação segue OD-003 (flag)                                                                                                                                                                 | Owner / LEGAL         |
| OD-P04 | CRLV-e com multa sob recurso suspensivo (DT-027)                                    | não bloqueia; exibido como "exigibilidade suspensa"                                                                                                                                                                                                                                                                                     | LEGAL                 |
| OD-P05 | Cartão e parcelamento (DT-031)                                                      | indisponíveis até autorização; guia PIX/boleto sempre — **DT-031 respondido**: prosseguir assumindo autorização; confirmação institucional em paralelo (DT-072) → flag `portal.card_payment` off até confirmação                                                                                                                        | Owner                 |
| OD-P06 | Nível de assinatura da ouvidoria (DT-051)                                           | nenhum (anônimo admitido); simples para acompanhar — **H.51**                                                                                                                                                                                                                                                                           | Owner                 |
| OD-P07 | Adesão do AM à Lei 14.129/2021 (DT-066)                                             | fundamentação mantida; registrar inexistência se for o caso — **DT-066 refinado**: Lei AM 6.837/2024 supre a maior parte; fundamentação dupla                                                                                                                                                                                           | LEGAL                 |
| OD-P08 | Prazo LGPD no regime público (`RN-PORTAL-120`)                                      | parâmetro `privacy.public_regime_days` sem valor exibido até decisão                                                                                                                                                                                                                                                                    | LEGAL / DPO           |
| OD-P09 | Regime jurídico da notificação de andamento (sem ciência ficta) vs. SNE             | leitura provisória de [WF-PORTAL-003]; só SNE produz ciência ficta                                                                                                                                                                                                                                                                      | LEGAL                 |
| OD-P10 | Taxonomia "solicitação" na ouvidoria (proposta operacional)                         | mantida — **H.52**                                                                                                                                                                                                                                                                                                                      | Owner                 |
| OD-P11 | Volumes (consultas, pagamentos, BAT com terceiro, meta SNE) — pedidos de capacidade | cache de leitura com TTL 15 min; gateway só guia — **H.54** vigente                                                                                                                                                                                                                                                                     | Owner                 |
| OD-P12 | `apps/portal/mobile` (shell móvel)                                                  | adiado até o runtime móvel provar-se no BOAT                                                                                                                                                                                                                                                                                            | Owner (Fase 4)        |
| OD-P13 | Uso do `@stynx-nyx/flow` para o ciclo comum de solicitação                          | **fechada** (R-0009, M7): `@stynx-nyx/flow` avaliado e descartado; máquina fixa de 13 estados em código (`REQUEST_TRANSITIONS`, `portal/requests/src/handwritten/guards/request.transitions.ts`) mantém a auditabilidade no domínio                                                                                                     | Architect (fechada)   |

### Questões levantadas na implementação (R-0009, OD-P14…P46)

Registradas por TASK-0010 (Architect, transcrição), transcritas dos relatórios de TASK-0001…0009 e
dos contratos `work/rounds/R-0009/contracts/CTG-000{1,2}.md`; nenhuma é fechada por esta tarefa
(transcrição, Art. 6/10). Formato de `docs/meta/knowledge-base/open-decisions-rait.md` §F.

| ID     | Questão                                                                                                                                                                                                                                                                                                                                   | Premissa adotada                                                                                                                                                                                                                | Decisor                              | Fonte                                 |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------- |
| OD-P14 | Unificar `portal/complaints` (PEC, DDL 60, papéis `CANDIDATO\|DPO\|AUDITOR\|GESTOR_DETRAN\|SUPORTE`) com `portal.manifestation` ([WF-PORTAL-004], Lei 13.460) — mesmo canal de reclamação em duas tabelas?                                                                                                                                | Mantidos separados nesta rodada (M2): `complaint` não é manifestação de ouvidoria; nenhuma tabela duplicada para o mesmo fato até decisão                                                                                       | Owner (após parity/freeze PEC)       | `plan.md` M2                          |
| OD-P15 | Credenciais institucionais do cliente OIDC gov.br (client id/secret, attribute mapping do pool)                                                                                                                                                                                                                                           | `source_pending`; só IdP simulado nos perfis `test`/`local` (`DetranLocalTokenVerifier`) nesta rodada                                                                                                                           | Architect (R-0014 WP-P6)             | `plan.md` M3; ADR-0024 §Consequências |
| OD-P16 | Envio real da adesão/cancelamento de SNE ao sistema nacional via `SnePort` (`packages/senatran-adapter`)                                                                                                                                                                                                                                  | Nesta rodada grava `portal.sne_enrollment`, publica `SNE_ADESAO_SOLICITADA`/`SNE_CANCELAMENTO_SOLICITADO` e responde `ADERIDO_SNE`/`NAO_ADERIDO_SNE` sem chamar o SNE nacional                                                  | Architect (R-0014 WP-P6)             | `plan.md` M8                          |
| OD-P17 | `lgpd_declaracao` delega a `@stynx-nyx/privacy` (`/privacy/exports`); módulo `privacy` do STYNX não montado no app                                                                                                                                                                                                                        | `PORTAL.SERVICE_UNAVAILABLE {unavailableReason:'privacy_endpoint_pendente'}`; catálogo marca `lgpd_declaracao` `partially_available` (só escopo `confirmacao`)                                                                  | Architect (R-0014)                   | `plan.md` M8, M12                     |
| OD-P18 | Balcão da ouvidoria: transições do órgão da manifestação (`EM_ANALISE`, `INFORMACAO_SOLICITADA_AO_AGENTE`, `DECISAO_FINAL_ELABORADA`, `CIENCIA_AO_USUARIO`) sem rota cidadã                                                                                                                                                               | Existem só como `MANIFESTATION_TRANSITIONS` e serviço interno testável; a interface do agente é do DASHBOARD                                                                                                                    | Architect (DASHBOARD R-0011)         | `plan.md` M13                         |
| OD-P19 | `junta_medica` (delegação PEC sem comando) e projetores `crash_view`/`exam_view` sem produtor real (BOAT/PEC)                                                                                                                                                                                                                             | `junta_medica` fora do catálogo de 15 serviços desta rodada (§5.1 do contrato de rotas continua listando-a com a pendência); `crash_view`/`exam_view` só tabela + projetor esqueleto (`applyEvent` registrando `last_event_id`) | Architect (R-0010/PEC)               | `plan.md` M12, M16                    |
| OD-P20 | 3 dos 15 estados de `inf.infraction_state_ref` sem rótulo cidadão em `INFRACTION_SITUATION_MAP` (`AIT_LAVRADO`, `PENALIDADE_A_APLICAR`, `AGUARDANDO_RECURSO_2A`)                                                                                                                                                                          | Evento com esses `toState` falha o projetor (`last_error='PORTAL.INTERNAL:situation:<toState>'`), nunca rótulo inventado (C-0002-46)                                                                                            | Architect / Owner (linguagem cidadã) | `plan.md` M16; CTG-0002 §7.3, §13     |
| OD-P21 | Operação de leitura nacional ausente na porta (`CdtPort`/`RenachPort`/`RenavamReadPort`, `packages/senatran-adapter/src/ports.ts`)                                                                                                                                                                                                        | Rota responde 503 `PORTAL.NATIONAL_READ_UNAVAILABLE {cachedAt:null, retryAfter}`; nunca `fetch` próprio; `retryAfter` = TTL (minutos) × 60 sem segundos documentados no catálogo de parâmetros                                  | Architect (R-0014 WP-P6)             | `plan.md` M17; CTG-0002 §15           |
| OD-P22 | Reconciliar `parameter-catalogue.md` §PORTAL (`portal.act_level_policy`/`portal.govbr_seal_mapping` como parâmetros json) com ADR-0024/M5 (tabela + attribute mapping do IdP) — duas fontes de verdade para a mesma matriz; vocabulário `advanced/simple` × tokens canônicos; intervalo de recarga do `PortalHostnameDirectory` sem fonte | Propor rebaixar as duas entradas do catálogo a documentação (sem consumidor em código) ou removê-las; vocabulário a alinhar; recarga `source_pending`                                                                           | Architect / Owner (catálogo é H.54)  | CTG-0001 §13; TASK-0001/0002          |
| OD-P23 | `portal.subject.cpf_hash` = sha256 sem chave (M6) — espaço de 10^11 CPFs torna o hash reversível por força bruta                                                                                                                                                                                                                          | Fixtures e testes desta rodada usam sha256 puro (M6); propor HMAC-SHA256 com segredo do tenant/app antes de dado real                                                                                                           | Architect / DPO (R-0014)             | CTG-0001 §13                          |
| OD-P24 | Janela do convite de avaliação (`AVALIACAO_OFERECIDA → CONCLUIDO \| ENCERRADA` "janela expira") sem valor na fonte                                                                                                                                                                                                                        | `T-AVAL-CONVITE` é imediato (disparo), não a janela; expiração não é executada nesta rodada (só a resposta do cidadão fecha)                                                                                                    | Owner                                | CTG-0001 §13                          |
| OD-P25 | Claim `govbr_level` (selo bruto) e dígito verificador do CPF — nomes/valores reais dependem do attribute mapping do pool (OD-P15)                                                                                                                                                                                                         | Nome fixo `govbr_level`, opcional, sem validação de DV nesta rodada                                                                                                                                                             | Architect (homologação R-0014)       | CTG-0001 §13                          |
| OD-P26 | Conteúdo real da Carta de Serviços (`service_catalog`) e da marca (`brand_profile`) para produção                                                                                                                                                                                                                                         | Textos de `70-fixtures-portal.sql` são fixtures (`"(fixture)"`/`'source_pending'`); carga institucional pelo agency-admin com [REF-DETRANAM-SERVICOS]                                                                           | Owner                                | CTG-0001 §13; TASK-0003               |
| OD-P27 | Ator nominal das rotas públicas do Portal (`PORTAL_PUBLIC_ACTOR_ID`, UUID nulo) e bypass de membership no interceptor de tenancy só para `/v1/portal/*` `@Public()` — o STYNX exige `actorId`/membership no `RequestContext`                                                                                                              | Bypass documentado nesta rodada (A3(b)); pedir ao STYNX suporte nativo a rotas públicas por tenant                                                                                                                              | Architect / STYNX                    | TASK-0004; `plan.md` A3(b)            |
| OD-P28 | Schemas dos eventos consumidos pelas projeções sem produtor em `main` (`NOTIFICACAO_EXPEDIDA`/`NOTIFICACAO_CIENCIA` de `inf/notification`, `PAGAMENTO_CONFIRMADO` de `inf/collection`)                                                                                                                                                    | Types e `data` mínimos propostos ao produtor (CTG-0002 §7.5); `docs/framework/schemas/events/` ganha os três                                                                                                                    | Architect (R-0007/R-0014)            | CTG-0002 §15                          |
| OD-P29 | Backfill de `portal.entitlement` quando o sujeito é criado depois dos eventos de infração (primeiro `GET me`)                                                                                                                                                                                                                             | Consultar a projeção `infraction_view` por `cpf_hash` → `entitlement origin='infraction'`                                                                                                                                       | Architect                            | CTG-0002 §15                          |
| OD-P30 | Autenticação oportunista em rota `@Public()` (`POST manifestations`, H.51 "simples para acompanhar") — extensão do guard de auth do app                                                                                                                                                                                                   | Implementada nesta rodada como extensão do STYNX (§2.8); ratificar formalmente com o STYNX junto de OD-P27                                                                                                                      | Architect / STYNX                    | CTG-0002 §15; `plan.md` A4(b)         |
| OD-P31 | Conteúdo versionado de `GET content/points-explainer` (T-15) sem fonte                                                                                                                                                                                                                                                                    | Rota não montada nesta rodada                                                                                                                                                                                                   | Owner (conteúdo institucional)       | CTG-0002 §15; `plan.md` A4(d)         |
| OD-P32 | Pré-preenchimento por serviço (`prefilled`, `RN-PORTAL-106`) depende das delegações reais                                                                                                                                                                                                                                                 | Vazio nesta rodada (R-0007 ausente)                                                                                                                                                                                             | Architect (R-0014)                   | CTG-0002 §15                          |
| OD-P33 | Versões esperadas dos textos institucionais (`consequence_ack.text_version`, `sne_enrollment.consent_text_version`, termo de desistência) sem fonte                                                                                                                                                                                       | Qualquer versão não vazia é aceita e gravada nesta rodada                                                                                                                                                                       | Owner / DPO                          | CTG-0002 §15                          |
| OD-P34 | Pontuação por AIT na projeção (`infraction_view.points`) e `disputed_points` reais                                                                                                                                                                                                                                                        | Propor coluna `points` em `BP-PORTAL-PROJECTIONS-001` v1.1 alimentada por `PENALIDADE_DEFINITIVA` e pelo enquadramento                                                                                                          | Architect                            | CTG-0002 §15                          |
| OD-P35 | Mapeamento de `CitizenLicense.license` (opaco no adapter) → campos cidadãos da CNH (status, validade, categorias, restrições)                                                                                                                                                                                                             | **Fechada em R-0014**: CTG-0004 §3 mapeia a fonte CDT/mock, inclusive A/V/S/C e restrição por texto.                                                                                                                            | Architect (fechada, R-0014)          | CTG-0004 §3; `plan.md` A14(d)         |
| OD-P36 | Identificador do veículo nas rotas `vehicles/{id}` (uuid de `entitlement` × placa) e forma tipada de `GET vehicles` (`CitizenCollection` opaco)                                                                                                                                                                                           | **Fechada em R-0014**: CTG-0004 §3 fixa UUIDv5 do chassi, placa/modelo e proíbe RENAVAM como fallback.                                                                                                                          | Architect (fechada, R-0014)          | CTG-0004 §3; `plan.md` A14(d)         |
| OD-P37 | Validação/recusa da procuração (`PROCURACAO_VALIDADA`/`RECUSADA`) sem rota cidadã; expiração em cascata dos `entitlement` `origin='representation'`                                                                                                                                                                                       | Balcão/DASHBOARD (R-0011) ou automática por documento assinado (`RN-PORTAL-104`); `validateRepresentation` interno, sem rota, responde `VALIDATION_FAILED {fields:['state']}` fora de estado                                    | Owner / Architect                    | CTG-0002 §15; TASK-0007               |
| OD-P38 | Substrato de preferências (`@stynx-nyx/preferences`) não montado no app                                                                                                                                                                                                                                                                   | `PUT preferences` responde `SERVICE_UNAVAILABLE` nesta rodada                                                                                                                                                                   | Architect (R-0014)                   | CTG-0002 §15                          |
| OD-P39 | Dono (cidadão × órgão) por timer de `inf.infraction_timer_ref` para `deadlines[].ownedBy` sem coluna                                                                                                                                                                                                                                      | Propor coluna `owned_by` no vocabulário (DDL 14, R-0007); `deadlines_json` vem `[]` do projetor nesta rodada                                                                                                                    | Architect                            | CTG-0002 §15                          |
| OD-P40 | Produtor de `portal.inbox_item` a partir de `NOTIFICACAO_EXPEDIDA` (sne/portal) e de eventos de processo, e entrega push/`@stynx-nyx/notifications`                                                                                                                                                                                       | Sexto projetor, fora de M16 nesta rodada; SSE `inbox.item` sem produtor até lá                                                                                                                                                  | Architect (R-0014)                   | CTG-0002 §15; `plan.md` A4(d)         |
| OD-P41 | `payment_json.tiers`/`refund` a partir da cotação nacional (`cdt.getPaymentQuote`) e do módulo de arrecadação; `evidenceAvailable` (`ops/evidence`)                                                                                                                                                                                       | `amount=null` (framing sem valor numérico) nesta rodada                                                                                                                                                                         | Architect (R-0007/R-0014)            | CTG-0002 §15; TASK-0008               |
| OD-P42 | Anexos: armazenamento assinado (ADR-0018) e limites de `ATTACHMENT_INVALID` (tipos, `maxBytes`) sem fonte                                                                                                                                                                                                                                 | Sem implementação de upload real nesta rodada                                                                                                                                                                                   | Architect / Owner                    | CTG-0002 §15                          |
| OD-P43 | Vocabulário de `decisionKind`/`addressee` do RAIT → `outcome` cidadão (`deferido\|indeferido\|…`) e diligências                                                                                                                                                                                                                           | Fixado por R-0007                                                                                                                                                                                                               | Architect (R-0007)                   | CTG-0002 §15                          |
| OD-P44 | Acompanhamento de manifestação anônima por protocolo sem sessão (H.51 "simples para acompanhar" × anônimo)                                                                                                                                                                                                                                | Rota `GET manifestations/by-protocol/{protocol}`? não implementada nesta rodada                                                                                                                                                 | Owner                                | CTG-0002 §15                          |
| OD-P45 | Limites de conexão do SSE (1/aba, 5/usuário → 429 `PORTAL.RATE_LIMITED`)                                                                                                                                                                                                                                                                  | Contagem não implementada nesta rodada                                                                                                                                                                                          | Architect                            | CTG-0002 §15                          |
| OD-P46 | `verify:parameter-catalogue --check-usage` acusava chaves i18n do Portal (`portal.requests.nextAction.<STATE>`, `portal.evaluations.publicIndicator`) nos clientes gerados como candidatas a parâmetro — colisão heurística (prefixo `portal.` + ≥2 pontos) × chave i18n                                                                  | **Resolvida em R-0014** (Owner, 2026-09-17; `plan.md` M10): allowlist de namespaces i18n declarada em `parameter-catalogue.md` §Namespaces i18n e lida por `verify.mjs`; exclusão por diretório (A7) removida                   | Owner (fechada, R-0014)              | `plan.md` A7                          |

### Questões levantadas na implementação (R-0014, OD-P47…P108)

| ID      | Questão                            | Premissa adotada                                                                               | Dono                            | Fonte                                   |
| ------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------- |
| OD-P47  | Logotipo ausente de `GET brand`.   | Sem `logoUrl`; usa contrato.                                                                   | Owner + Architect-backend       | `plan.md` A1                            |
| OD-P48  | Representação ativa.               | `null`; apenas lista.                                                                          | Architect                       | `plan.md` A1                            |
| OD-P49  | Link de atendimento presencial.    | `source_pending`.                                                                              | Owner + Architect               | `plan.md` A1                            |
| OD-P50  | Falha do catálogo de serviços.     | Erro recuperável, entrada gov.br preservada.                                                   | Architect                       | `plan.md` A1; CTG-0003c C-3c-69         |
| OD-P51  | Cache offline estático.            | Sem `dataGroup`; store cifrado por `sid`.                                                      | Architect                       | `plan.md` A3(a)                         |
| OD-P52  | Nível de T-08.                     | Ficha segue `simples`; decisão pendente.                                                       | Owner/LEGAL                     | `plan.md` §OD TASK-0004                 |
| OD-P53  | Nível de T-09.                     | Contrato seguido; conflito permanece.                                                          | Owner/LEGAL                     | `plan.md` §OD TASK-0004                 |
| OD-P54  | Offline operacional.               | Bateria/autenticação `source_pending`.                                                         | Architect                       | `plan.md` §OD TASK-0004                 |
| OD-P55  | Catálogo e nome de cancelamento.   | 15 serviços; nome cidadão pendente.                                                            | Owner + Architect               | `plan.md` A4                            |
| OD-P56  | `badge_of` de pedido.              | Sem correspondência, `null`.                                                                   | Owner                           | `plan.md` §OD TASK-0006                 |
| OD-P57  | Endereço/horário presencial.       | `source_pending`.                                                                              | Owner + Architect-backend       | CTG-0003a §10                           |
| OD-P58  | Chaves do par 1.                   | Lista fechada aplicada.                                                                        | Owner + transcriber             | `plan.md` A6(d); CTG-0003a §10          |
| OD-P59  | Formas 2xx ausentes.               | `source_pending`; indisponível, nunca simula.                                                  | Architect-backend               | `plan.md` A6(f); CTG-0003a §10          |
| OD-P60  | `signatureRef` gov.br.             | Não usar sem fonte.                                                                            | Architect-backend + LEGAL       | CTG-0003a §10                           |
| OD-P61  | Enum `effectsAck` × textos legais. | Fio atual mantido; alinhamento legal pendente.                                                 | Owner/LEGAL + Architect-backend | CTG-0003a §10; `plan.md` A24            |
| OD-P62  | Validação por campo.               | Só mensagem genérica.                                                                          | Owner                           | CTG-0003a §10                           |
| OD-P63  | `actions[].reason`.                | Token em `data-*`; catálogo pendente.                                                          | Architect-backend + transcriber | CTG-0003a §10                           |
| OD-P64  | `daysLeft`/`deadlines.kind`.       | Sem cálculo no cliente.                                                                        | Architect                       | CTG-0003a §10                           |
| OD-P65  | Escala de avaliação.               | Nenhuma escala inventada.                                                                      | Owner                           | CTG-0003a §10                           |
| OD-P66  | Limite e tipos de anexo.           | 10 MiB/tipos da spec; parâmetros `proposta`.                                                   | Maestro + transcriber           | `plan.md` A6(e), A25(b)                 |
| OD-P67  | Nível de diligência.               | `simples` no manifesto; conflito aberto.                                                       | Owner/LEGAL                     | CTG-0003a §10                           |
| OD-P68  | Rótulos de aviso/ack/upload.       | Chaves aplicadas.                                                                              | Owner + transcriber             | `plan.md` A7(e), A8(a)                  |
| OD-P69  | Schemas de AIT/pedido.             | Objetos livres `source_pending`.                                                               | Architect-backend               | CTG-0003b §10                           |
| OD-P70  | Chaves do par 2/fichas.            | Chaves aplicadas; fichas corrigidas no CTG-0005.                                               | Owner + transcriber             | `plan.md` A8; CTG-0003b §10             |
| OD-P71  | Dono da timeline.                  | Campo/mapa canônico pendente.                                                                  | Architect-backend + transcriber | CTG-0003b §10                           |
| OD-P72  | Formas de pedido/diligência.       | Tipos `source_pending`.                                                                        | Architect-backend               | CTG-0003b §10                           |
| OD-P73  | `targetId` de caso.                | `externalId`; nulo dá canal presencial.                                                        | Architect-backend               | CTG-0003b §10                           |
| OD-P74  | Meios/tiers de pagamento.          | Servidor prevalece; flags são fallback.                                                        | Architect-backend + maestro     | `plan.md` A10(a); CTG-0003b §10         |
| OD-P75  | Guia acessível persistente.        | Campo ausente de preferências.                                                                 | Owner + Architect-backend       | CTG-0003b §10                           |
| OD-P76  | Prorrogação de diligência.         | Sem comando/regra, não implementada.                                                           | Owner/LEGAL + Architect-backend | CTG-0003b §10                           |
| OD-P77  | Desistência pautada.               | Aguardar sinal e orientação.                                                                   | Owner + Architect-backend       | CTG-0003b §10                           |
| OD-P78  | Filtro e pontos de autos.          | Filtro servidor; formas livres não renderizadas.                                               | Transcriber + Architect-backend | CTG-0003b §10                           |
| OD-P79  | Abandono de composição.            | Sem `canDeactivate`.                                                                           | Owner                           | CTG-0003b §10                           |
| OD-P80  | Percentuais de pagamento.          | Textos aguardam linguagem cidadã.                                                              | Owner                           | CTG-0003b §10                           |
| OD-P81  | `consequenceAck`.                  | Diálogo antes de salvar; origem pendente.                                                      | Architect-backend               | `plan.md` A10(c); CTG-0003b §10         |
| OD-P82  | Chaves pré-preenchidas.            | Mapa vazio até fonte.                                                                          | Architect-backend + transcriber | CTG-0003b §10                           |
| OD-P83  | Limite de tabela STYNX.            | Listas semânticas; extensão pendente.                                                          | Architect + R-0012              | `plan.md` A9(b)                         |
| OD-P84  | Rótulo de filtro vazio.            | Sem `[value]` sem filtro.                                                                      | Owner                           | `plan.md` A9(h)                         |
| OD-P85  | Enum CNH.                          | Listas públicas aguardam enum.                                                                 | Architect-backend               | `plan.md` A9(h)                         |
| OD-P86  | `aria-describedby`.                | Diretiva preserva referência alheia.                                                           | Architect                       | `plan.md` A9(h)                         |
| OD-P87  | `If-Match` de preferências.        | Sem ETag/version; apresentar 428.                                                              | Architect-backend               | CTG-0003c §10                           |
| OD-P88  | Chave VAPID.                       | `null`; push indisponível.                                                                     | Architect + maestro             | CTG-0003c §10                           |
| OD-P89  | Chaves/correções par 3.            | **Estendida** A11/A12; fichas corrigidas aqui.                                                 | Owner + transcriber             | `plan.md` A11(e), A12(i); CTG-0003c §10 |
| OD-P90  | Conteúdo de pontuação.             | Página estática; rota pendente.                                                                | Architect-backend + Owner       | CTG-0003c §10                           |
| OD-P91  | Formas de documentos.              | **Fechada em R-0014 para os handoffs CTG-0004 §3**; demais formas livres não são fabricadas.   | Architect-backend               | CTG-0004 §3; CTG-0003c §10              |
| OD-P92  | Vocabulário exame/sinistro.        | Exibir servidor; comando pendente.                                                             | Architect-backend + PEC/BOAT    | CTG-0003c §10                           |
| OD-P93  | Rota de avaliação.                 | `POST evaluations`; manifestação inline.                                                       | Architect + Owner               | CTG-0003c §10                           |
| OD-P94  | Anexos de manifestação.            | `attachmentIds: []`; sem upload inventado.                                                     | Architect-backend               | CTG-0003c §10                           |
| OD-P95  | Privacidade/exportação.            | Ciclo comum; rota/forma pendentes.                                                             | Architect-backend + Owner       | CTG-0003c §10                           |
| OD-P96  | SSE/reconexão.                     | Transporte HttpClient; detalhes pendentes.                                                     | Architect + Architect-backend   | CTG-0003c §10                           |
| OD-P97  | Busca/resumo/download BAT.         | Filtro local; download indisponível.                                                           | Architect-backend + BOAT        | CTG-0003c §10                           |
| OD-P98  | Campos Carta de Serviços.          | Renderizar existentes; modelo pendente.                                                        | Owner + Architect-backend       | CTG-0003c §10                           |
| OD-P99  | Pendências da home.                | Só critérios expostos; limites pendentes.                                                      | Owner + Architect               | CTG-0003c §10                           |
| OD-P100 | Nível SNE.                         | Divergência permanece.                                                                         | Owner/LEGAL                     | CTG-0003c §10                           |
| OD-P101 | Locale de `Intl`.                  | Runtime i18n até `AvailableBrand`.                                                             | Architect                       | `plan.md` A9(h), A10(i)                 |
| OD-P102 | Status 0 central.                  | Aberta (unificação futura): a regra vive só no `ErrorBoundary` (A12(a)); nada a absorver hoje. | Architect                       | `plan.md` A12(a)                        |
| OD-P103 | Rótulo CNH `B`.                    | `status:null`; rótulo pendente.                                                                | Owner + Architect-backend       | CTG-0004 §10; `plan.md` A14(d)          |
| OD-P104 | Quitação/restrições/`canIssue`.    | Só multa; resto `source_pending`.                                                              | Architect-backend               | CTG-0004 §10; `plan.md` A14(d)          |
| OD-P105 | Emissão CRLV-e.                    | 422; sem bytes/QR inventados.                                                                  | Architect-backend               | CTG-0004 §10; `plan.md` A14(d)          |
| OD-P106 | Cancelamento SNE.                  | Local; `cancelNotification` não serve.                                                         | Architect-backend               | CTG-0004 §10; `plan.md` A14(b)          |
| OD-P107 | Mapa adapter → `PORTAL.*`.         | Sem mapa não vira INTERNAL.                                                                    | Architect-backend               | CTG-0004 §10; `plan.md` A14(f)          |
| OD-P108 | DELETE de push.                    | Sem rota, não implementar/testar.                                                              | Architect-backend               | CTG-0004 §10; `plan.md` A14(f)          |

### Triagem de delegações — R-0027 (TASK-0001, transcrição)

As decisões do Owner de 2026-09-26 vinculam esta rodada: **OD-R27-001 = (a)**, ator técnico `portal-delegation`, chaves de política próprias `…-portal`, cidadão como requerente e `onBehalfOf` na auditoria, prazo desde `protocolled_at`; chamada in-process sem avaliação de política é vedada. **OD-R27-002 = (b)**, `junta_medica` permanece indisponível nesta rodada e será entregue integralmente em R-0032, com contrato, vínculo, marco de ciência e prazo calculados no servidor. O fechamento registra a junta como exceção declarada ao critério C-0002 §5, nunca como PASS.

| OD     | Situação para R-0027                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-P05 | Não bloqueante para PIX/boleto; cartão e parcelamento off por `portal.card_payment=false`/`portal.installments=false`, DT-072 ainda pendente.                       |
| OD-P17 | Não bloqueante; `lgpd_declaracao` fora, 422 preservado.                                                                                                             |
| OD-P19 | Resolvida para esta rodada por OD-R27-002=b como exceção fail-closed; entrega em R-0032.                                                                            |
| OD-P28 | Bloqueante para avanço por pagamento; produtor de `PAGAMENTO_CONFIRMADO` não localizado. OD-R27-003 `source_pending`, guia pode ser emitida sem declarar pagamento. |
| OD-P32 | Não bloqueante da delegação; pré-preenchimento vazio até fonte comprovada.                                                                                          |
| OD-P41 | Bloqueante para mostrar valor/tier real se cotação nacional e collection não fornecerem fonte; nenhum `amount` inventado.                                           |
| OD-P43 | Resolvida por fonte RAIT R-0007 para vocabulário de decisão; mapeamento de diligência ainda exige teste.                                                            |
| OD-P67 | Bloqueante da resposta de diligência; OD-R27-004 segue Owner/LEGAL, manifesto atual não fecha a divergência.                                                        |
| OD-P72 | Bloqueante para forma de resposta/peça sem contrato; tipos `source_pending`.                                                                                        |
| OD-P74 | Não bloqueante de PIX/boleto com prevalência do servidor; cartão/parcelamento off.                                                                                  |
| OD-P76 | Não bloqueante: prorrogação de diligência não faz parte da resposta e permanece indisponível.                                                                       |

**ODs pendentes.** OD-R27-003 = `source_pending` para schema, produtor e correlação do evento de domínio `PAGAMENTO_CONFIRMADO` (decisor: Architect); não converter `inf.payment.confirmed` por suposição. OD-R27-004 = `source_pending`, decisão somente Owner/LEGAL sobre nível de assinatura da resposta de diligência; manter fail-closed até fonte normativa e contrato que preserve texto/anexos. OD-P01/CETRAN-AM e demais lacunas mantêm classificação e texto originais; nenhuma decisão ou valor novo é inferido. `lgpd_declaracao` e `emissao_crlv` seguem indisponíveis (#125); cartão e parcelamento seguem `false`.

## 5. Mapa entregável → definições

| Entregável            | Definições                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A (dados)             | WP-P1; ADR-0019/0018; [WF-PORTAL-001…004]; entidades `portal.*`/`platform.*` da origem como referência                 |
| B (rotas)             | `portal-route-contract.md`; delegações ADR-0016/0015/RAIT; `policy.ts` (`portal:*`)                                    |
| C (payloads)          | `portal-route-contract.md` §5.1; `rait-build-pack.md` §0; `portal-error-catalog.md`                                    |
| D (telas)             | [IU-PORTAL-001]; `portal-frontends.md` §4–§6; [JRN-PORTAL-001…011]; catálogo de telas da origem (estados obrigatórios) |
| E (formulários/gates) | `portal-frontends.md` §7; [WF-PORTAL-001/002]; [RN-PORTAL-*]; `portal-error-catalog.md`                                |
| F (hierarquia)        | `portal-frontends.md` §4, §5, §9                                                                                       |
