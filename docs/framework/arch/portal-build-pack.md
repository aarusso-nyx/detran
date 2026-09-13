---
id: ARCH-PORTAL-BUILD-PACK
title: Pacote de construção do Portal — definições e pacotes de trabalho para a orquestra (domínio portal, projeções, PWA)
status: draft
apps: [portal]
updated: 2026-09-13
---

# Pacote de construção do Portal

Índice das definições para construir `domains/portal` (ADR-0017), as projeções (ADR-0018) e o PWA
`apps/portal/web`. Segue as regras comuns do `rait-build-pack.md` §0 e os manuais de
`docs/meta/agents/`. Fontes: [APP-PORTAL], [WF-PORTAL-001…004], [UC-PORTAL-001…019],
[RN-PORTAL-101…128], [JRN-PORTAL-001…011], [IU-PORTAL-001]; `portal-frontends.md`,
`portal-route-contract.md`, `portal-error-catalog.md`; ADR-0014…0018; portal e domínio
`appeals-administrative-appeals` do repositório de origem (somente leitura, referência).

## 1. Estado de partida (verificado em 2026-09-13)

| Item                                     | Situação                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corpus de produto                        | completo: trilha de apelação `approved`; 28 regras `draft`; 27 telas; catálogo de 15 serviços                                                                                                                                                                                                              |
| Backend neste monorepo                   | nenhum módulo, blueprint ou DDL do Portal; política tem só `portal:appeal:create                                                                                                                                                                                                                           | read-own` |
| Origem (`../teat`)                       | portal Angular com 27 rotas (9 telas reais, 15 stubs de catálogo, 3 estáticas/leitura), 12 endpoints `/v1/portal/*` não publicados no contrato, domínio `appeal.*` com caso próprio (a **não** portar: o caso é o do RAIT) e `portal.*`/`platform.*` (catálogo, vínculo, política de ato, marca, hostname) |
| Identidade                               | origem usa pool Cognito com grupos `citizen`/`legal-representative` e claim `custom:teat_assurance_level`; **sem gov.br**; ADR-0017 exige federação gov.br                                                                                                                                                 |
| Integrações disponíveis                  | `CdtPort` (multas, veículos, CNH, cotação, reconhecimento), `SnePort`, `RenachPort`, RENAVAM leitura — mock-first (ADR-0008)                                                                                                                                                                               |
| Decisões abertas que condicionam módulos | DT-050 (portaria de níveis), DT-026 (renúncia 40%), DT-027 (CRLV-e × recurso), DT-031 (cartão), DT-051 (nível da ouvidoria), DT-028 (declaração WCAG, adotada na origem em 2026-08-28), DT-066 (Lei 14.129)                                                                                                |

## 2. Pacotes de trabalho

### WP-P0 — Identidade federada (Architect → Engineer; ADR curta)

Ler: ADR-0017 §1, [WF-PORTAL-002], `portal-rait-runtime-deployment.md` da origem, `@stynx-nyx/auth`.
Produzir: ADR "gov.br via Cognito" (IdP OIDC gov.br no pool do cidadão; mapeamento do nível de
confiabilidade gov.br → `assurance_level` simples/avançada/qualificada como claim assinada; CPF
como `sub` de negócio; grupos `CIDADAO`; representação como atributo); configuração do pool no
`backend/app`; guarda que rejeita claim ausente. Gate: e2e de login com IdP simulado;
`PORTAL.ASSURANCE_NOT_VERIFIED` fail-closed.

### WP-P1 — Modelo de dados (Architect-blueprint)

| Blueprint                       | Entidades                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BP-PORTAL-IDENTITY-001`        | `portal.subject` (cpf hash, nome, nível observado, observado em), `portal.representation` (representado, instrumento, escopo, validade, estado), `portal.act_level_policy` (ato → nível, base, `enabled`, vigência), `portal.entitlement` (alvo genérico, relação, origem, validade)                                                                                 |
| `BP-PORTAL-REQUESTS-001`        | `portal.request` (máquina `WF-PORTAL-001`, `service_key`, alvo, `channel` FK canal, delegação: domínio, comando, id externo), `portal.request_draft` (jsonb versionado), `portal.request_attachment` (hash, intenção de upload), `portal.protocol` (número, data-hora, canal, hash do recibo), `portal.consequence_ack` (texto, versão, quando), `portal.evaluation` |
| `BP-PORTAL-INBOX-001`           | `portal.inbox_item` (kind, source, evento de origem, lido em), `portal.acknowledgement_evidence` (hash do exibido, quando, assinado), `portal.sne_enrollment` (estado, canal, desde, cancelado em), `portal.push_subscription`                                                                                                                                       |
| `BP-PORTAL-CITIZEN-SERVICE-001` | `portal.manifestation` (máquina `WF-PORTAL-004`, tipo, sigilo, anônimo), `portal.manifestation_extension` (justificativa), `portal.service_catalog` (11 campos, check de motivo), `portal.brand_profile`, `portal.public_hostname`                                                                                                                                   |
| projeções (ADR-0018)            | `portal.infraction_view`, `portal.process_timeline`, `portal.points_view`, `portal.crash_view` (BOAT), `portal.exam_view` (PEC)                                                                                                                                                                                                                                      |

Timers no motor de prazos (`owner='portal'`): `T-PROTOCOLO` (imediato), `T-OUV-RESPOSTA` (30+30),
`T-OUV-INFO` (20+20, interno), `T-AVAL-CONVITE`, `T-SNE-CIENCIA` (30, lido do módulo de
notificação), `T-LGPD-ACESSO` (regime público, parâmetro). Fixtures: um cidadão por nível, uma
representação, um pedido por estado, uma manifestação por estado, catálogo completo com 9
disponíveis/2 parciais/4 indisponíveis com motivo. Gate: `blueprints:check`, `verify:rls-ddl`
(exceto `brand_profile`/`public_hostname`, sem RLS por desenho), seeds em banco limpo.

### WP-P2 — Rotas, delegações e projeções (Engineer-backend)

Ler: `portal-route-contract.md`, `portal-error-catalog.md`, ADR-0014/0015/0018, comandos do RAIT
(`rait-build-pack.md` WP-B). Produzir: controladores `/v1/portal/*`; serviço de delegação (uma
transação: protocolo → comando do domínio dono → estado `EM_ANDAMENTO_NO_ORGAO`; falha após o
protocolo vira pendência interna, nunca perde o protocolo); projetores das cinco projeções a partir
dos eventos; evidência de ciência para itens SNE (`NOTIFICACAO_CIENCIA`); adesão/cancelamento SNE
via módulo de notificação; leituras nacionais cacheadas com `cachedAt`; SSE `/v1/portal/stream`;
regras de política `portal:*` para `CIDADAO`. Gate: testes de vínculo (sem vínculo = 404), nível
(matriz por ato), idempotência com corpo diferente, protocolo imediato antes de qualquer validação
de conteúdo, projeção reconstruída por replay.

### WP-P3 — Payloads e contrato (Transcriber-docs)

`docs/framework/contracts/BP-PORTAL-*.openapi.json` com os corpos por `serviceKey` (§5.1 do
contrato), respostas 4xx com códigos do catálogo, `Idempotency-Key` determinística documentada,
exemplos com as fixtures; `docs/framework/schemas/portal-request-draft.schema.json` por ato.
Gate: `contracts:check`; cliente gerado compila.

### WP-P4 — Telas, formulários, mapa de tradução e i18n (Transcriber-docs → Engineer-frontend)

Uma ficha `IU-PORTAL-<T-nn>.md` por tela (27) no padrão de `screen-specification-standard.md` da
origem (identidade, acesso, entrada, dados, estados, comandos, saída, segurança, acessibilidade,
testes), com os estados obrigatórios (carregando, vazio, sem elegibilidade, erro recuperável, sem
permissão, indisponível) e as regras de conteúdo de [IU-PORTAL-001] §E; **mapa de tradução** de
estados internos (RAIT/PEC/BOAT/infração → situação cidadã) como tabela única em
`i18n/portal.pt-BR.json`; schemas dos 14 formulários (`portal-frontends.md` §7); textos jurídicos
versionados (consequências, quatro efeitos do SNE, renúncia 40%). Gate: `docs:kb:check`, teste que
cada tela tem ficha e rota, revisão do Owner (linguagem cidadã).

### WP-P5 — PWA (Engineer-frontend)

`apps/portal/web` (Angular 22, `@detran/ui` para primitivos, shell próprio, PWA com cache cifrado
só para CNH-e/CRLV-e; 13 módulos; ~40 rotas da §4; componentes da §5; guardas de nível, vínculo e
disponibilidade; `ResumeService`; a11y AA + eMAG com auditoria automática por rota). Gate:
roteamento por nível e vínculo, TestBed dos compartilhados, Lighthouse PWA e a11y ≥ 90 em CI,
`ng build`, `pnpm check`.

### WP-P6 — Integração e homologação (Engineer; Inspector)

Adesão SNE real (mock → homologação), cotação/reconhecimento via `CdtPort`, CNH-e/CRLV-e reais,
push web, e2e das 11 jornadas com as fixtures; teste de que nenhum token interno aparece em
nenhuma resposta `/v1/portal/*` (lint de payload contra o vocabulário dos workflows).

## 3. Ordem e paralelismo

```text
WP-P0 ──► WP-P1 ──► WP-P2 ──► WP-P3 ──┐
                └──► WP-P4 ──────────────┼──► WP-P5 ──► WP-P6
```

WP-P2 depende dos comandos do RAIT (WP-B) e dos módulos de ADR-0014/0015 para as delegações de
defesa, indicação e pagamento; até lá, as rotas existem e devolvem `SERVICE_UNAVAILABLE` com
motivo (o catálogo é dado). Sonnet: WP-P3, WP-P4; Opus/Terra: WP-P0, WP-P1, WP-P2.

## 4. Questões abertas do Portal (OD-P)

| ID     | Questão                                                                             | Premissa adotada                                                                                                                                                                                                                                                                                                                        | Decisor           |
| ------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| OD-P01 | Portaria estadual de níveis de assinatura por ato (DT-050)                          | matriz do Decreto 10.543 como dados em `act_level_policy`; teto avançada — **PN DETRAN-AM 001/2025 localizada** ([REF-DETRANAM-PORTARIA-NORMATIVA-001-2025]): gov.br ouro/e-Notariado/qualificada para defesas, recursos, indicação e procurações → `act_level_policy` com fonte; resta o CETRAN-AM — **H.49**: CETRAN pela mesma regra | Owner / LEGAL     |
| OD-P02 | Mapeamento dos selos gov.br (bronze/prata/ouro) → simples/avançada                  | prata ou ouro = avançada; bronze = simples; sem exigir qualificada — **revisar**: a PN 001/2025 só admite **nível ouro**; prata/bronze insuficientes para os atos do art. 3º — **H.50**: prata aceito desde já (decisão do Owner contra a PN 001/2025; portaria pedida)                                                                 | Architect / LEGAL |
| OD-P03 | Instrumento da renúncia na faixa de 40% (DT-026) e sua ativação (OD-003)            | declaração eletrônica versionada; faixa desligada por flag — **DT-026 respondido**: termo digital assinado no PORTAL, sem depender do SNE; ativação segue OD-003 (flag)                                                                                                                                                                 | Owner / LEGAL     |
| OD-P04 | CRLV-e com multa sob recurso suspensivo (DT-027)                                    | não bloqueia; exibido como "exigibilidade suspensa"                                                                                                                                                                                                                                                                                     | LEGAL             |
| OD-P05 | Cartão e parcelamento (DT-031)                                                      | indisponíveis até autorização; guia PIX/boleto sempre — **DT-031 respondido**: prosseguir assumindo autorização; confirmação institucional em paralelo (DT-072) → flag `portal.card_payment` off até confirmação                                                                                                                        | Owner             |
| OD-P06 | Nível de assinatura da ouvidoria (DT-051)                                           | nenhum (anônimo admitido); simples para acompanhar — **H.51**                                                                                                                                                                                                                                                                           | Owner             |
| OD-P07 | Adesão do AM à Lei 14.129/2021 (DT-066)                                             | fundamentação mantida; registrar inexistência se for o caso — **DT-066 refinado**: Lei AM 6.837/2024 supre a maior parte; fundamentação dupla                                                                                                                                                                                           | LEGAL             |
| OD-P08 | Prazo LGPD no regime público (`RN-PORTAL-120`)                                      | parâmetro `privacy.public_regime_days` sem valor exibido até decisão                                                                                                                                                                                                                                                                    | LEGAL / DPO       |
| OD-P09 | Regime jurídico da notificação de andamento (sem ciência ficta) vs. SNE             | leitura provisória de [WF-PORTAL-003]; só SNE produz ciência ficta                                                                                                                                                                                                                                                                      | LEGAL             |
| OD-P10 | Taxonomia "solicitação" na ouvidoria (proposta operacional)                         | mantida — **H.52**                                                                                                                                                                                                                                                                                                                      | Owner             |
| OD-P11 | Volumes (consultas, pagamentos, BAT com terceiro, meta SNE) — pedidos de capacidade | cache de leitura com TTL 15 min; gateway só guia — **H.54** vigente                                                                                                                                                                                                                                                                     | Owner             |
| OD-P12 | `apps/portal/mobile` (shell móvel)                                                  | adiado até o runtime móvel provar-se no BOAT                                                                                                                                                                                                                                                                                            | Owner (Fase 4)    |
| OD-P13 | Uso do `@stynx-nyx/flow` para o ciclo comum de solicitação                          | máquina fixa de 13 estados em código; `flow` avaliado em WP-P1                                                                                                                                                                                                                                                                          | Architect         |

## 5. Mapa entregável → definições

| Entregável            | Definições                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A (dados)             | WP-P1; ADR-0017/0018; [WF-PORTAL-001…004]; entidades `portal.*`/`platform.*` da origem como referência                 |
| B (rotas)             | `portal-route-contract.md`; delegações ADR-0014/0015/RAIT; `policy.ts` (`portal:*`)                                    |
| C (payloads)          | `portal-route-contract.md` §5.1; `rait-build-pack.md` §0; `portal-error-catalog.md`                                    |
| D (telas)             | [IU-PORTAL-001]; `portal-frontends.md` §4–§6; [JRN-PORTAL-001…011]; catálogo de telas da origem (estados obrigatórios) |
| E (formulários/gates) | `portal-frontends.md` §7; [WF-PORTAL-001/002]; [RN-PORTAL-*]; `portal-error-catalog.md`                                |
| F (hierarquia)        | `portal-frontends.md` §4, §5, §9                                                                                       |
