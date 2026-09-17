---
id: IU-PORTAL-T09
title: Adesão ao SNE — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-931,
    REF-CTB-extracts-raw,
    REF-DECRETO-10543-2020,
    REF-CONTRAN-918,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-09. Fontes: [UC-PORTAL-007], [JRN-PORTAL-005], [RN-PORTAL-123],
[RN-PORTAL-124], [RN-PORTAL-128].

## 1. Identidade

- id: `T-09`; nome visível: "Adesão ao SNE".
- app: `portal`; módulo: `notificacoes` (`portal-frontends.md` §4).
- rota: `/sne` (`route-manifest.md` #23); `screen: 'T-09'`, `sheet: 'IU-PORTAL-T09'`.

## 2. Acesso

- ator: CIDADAO nível simples para acessar a tela e confirmar a adesão em si — `access` do
  manifesto é `simples` (`route-manifest.md` #23), e o corpo do ato `adesao_sne` declara nível
  **simples** em `portal-route-contract.md` §5.1. Isso diverge de [RN-PORTAL-101] linha 9
  ("Aderir ao SNE / cancelar a adesão: Avançada", por subsunção, confiança "Média") e de
  `portal-frontends.md` §4 ("simples→avançada"). Nenhuma fonte desta leitura fechada reconcilia a
  divergência explicitamente; a ficha segue o contrato de rota mais específico (§5.1) para o nível
  operacional do comando, e registra a tensão como **OD-P53** no relatório, sem decidir aqui.
- guardas: `portalAuthGuard` + `assuranceGuard('simples')`; sem `entitlement` próprio (ato de
  autocadastro, não vinculado a um AIT/processo específico); `serviceAvailabilityGuard('adesao_sne')`
  (`route-manifest.md` #23).
- pré-condição: cidadão autenticado (gov.br); cadastro com e-mail e celular válidos para
  recebimento de alertas ([REF-CONTRAN-931] art. 4º §5º; [UC-PORTAL-007] Pré-condições).

## 3. Entrada

- de onde se chega: fluxo dedicado (menu de notificações, T-12) ou oferta contextual na tela de uma
  autuação ([UC-PORTAL-007] passo 1).
- tela separada da decisão de pagamento com desconto — "aderir ao SNE" e "declarar que não vai
  recorrer" são decisões diferentes, nunca a mesma tela ([RN-PORTAL-123]; [JRN-PORTAL-005] passo 1).

## 4. Dados

- `GET /v1/portal/sne/enrollment` (`portal-route-contract.md` §6) → `{ enrolled, since, channel,
cancelable: true }`.
- `POST /v1/portal/sne/enrollment` `{ email, phone, consent{ textVersion, effectsAck: [
ciencia_ficta, canal_exclusivo, desconto_60, cancelamento ] } }` — corpo do ato `adesao_sne`
  (`portal-route-contract.md` §5.1) → `SnePort.enrollCitizen` via módulo de notificação →
  `ADERIDO_SNE` ([WF-PORTAL-003]).
- `DELETE /v1/portal/sne/enrollment` `{ reason? }` — corpo do ato `cancelamento_sne`
  (`portal-route-contract.md` §5.1).

## 5. Estados

- **carregando**: skeleton enquanto `GET sne/enrollment` resolve o estado atual (aderido/não
  aderido).
- **vazio**: não se aplica — a tela sempre mostra o estado atual da adesão, aderida ou não.
- **sem elegibilidade**: cadastro sem e-mail/celular válidos → bloqueia a adesão até completar o
  cadastro (`PORTAL.SNE_CONTACT_REQUIRED`, `missing[]`; [UC-PORTAL-007] 1a).
- **erro recuperável**: SNE nacional indisponível → pedido fica pendente, nada de prazo muda
  (`PORTAL.SNE_UPSTREAM_UNAVAILABLE`, `retryAfter`).
- **sem permissão**: não se aplica ao nível operacional adotado nesta ficha (§2); se a leitura
  conservadora de [RN-PORTAL-101] prevalecer, aplicar-se-ia o passo guiado padrão — não confirmado.
- **indisponível**: serviço `adesao_sne` marcado `unavailable` no catálogo →
  `/servico-indisponivel/adesao_sne`.
- **sucesso**: confirmação com opção de cancelamento visível a qualquer momento
  ([UC-PORTAL-007] AC-PORTAL-007-4, [REF-CONTRAN-931] art. 8º I).
- **já aderido / não aderido**: estado incompatível ao tentar aderir de novo ou cancelar sem estar
  aderido (`PORTAL.SNE_ALREADY_ENROLLED`/`PORTAL.SNE_NOT_ENROLLED`, [WF-PORTAL-003]).

## 6. Comandos

| Rótulo (chave i18n)               | Nível (§2)     | Validação de forma                                         | Idempotência | Efeito                                           |
| --------------------------------- | -------------- | ---------------------------------------------------------- | ------------ | ------------------------------------------------ |
| "Confirmar adesão" (`cmd.enroll`) | simples (§5.1) | contato obrigatório; quatro efeitos aceitos (`effectsAck`) | —            | `POST sne/enrollment` → `ADERIDO_SNE`            |
| "Cancelar adesão" (`cmd.cancel`)  | simples        | —                                                          | —            | `DELETE sne/enrollment` → aviso do §2 do art. 8º |

- os **quatro efeitos** da adesão aparecem lado a lado, não diluídos em texto corrido: ciência ficta
  em 30 dias, substituição de todas as demais formas, responsabilidade exclusiva de cadastro,
  cancelamento não retroage ([RN-PORTAL-123] tabela; [UC-PORTAL-007] AC-PORTAL-007-2).
- a tela deixa explícito que a faixa de 60% pressupõe reconhecer a infração sem defesa nem recurso —
  aderir ao SNE **não** é, por si, renunciar a nada ([UC-PORTAL-007] AC-PORTAL-007-3;
  [RN-PORTAL-128] item 4: a adesão ao SNE não oferece a faixa de 40% no mesmo passo).
- cancelamento sempre disponível e visível, com o aviso de que notificações já disponibilizadas
  permanecem válidas ([RN-PORTAL-123] item 4; [UC-PORTAL-007] 4a).
- o aceite registra qual versão do texto foi exibida (`consent.textVersion`) — prova de
  consentimento informado ([RN-PORTAL-123] verificação a).
- todo comando gera `@Audit` (`portal-route-contract.md` §1.7).

## 7. Saída

- confirmado: volta para T-12 (notificações) ou para a origem contextual (autuação).
- cancelado: permanece na própria tela com o estado atualizado.

## 8. Segurança

- vínculo: nenhum vínculo de AIT/processo — ato de autocadastro do próprio sujeito autenticado.
- e-mail/celular coletados e validados no ato da adesão ([RN-PORTAL-123] verificação b).
- nenhum token/segredo em tela/URL/log.

## 9. Acessibilidade

- os quatro efeitos exibidos com contraste AA, um por linha, nunca em bloco de texto corrido.
- botão de cancelamento acessível em no máximo dois cliques a partir do perfil
  ([RN-PORTAL-123] verificação d).
- alvo de toque ≥ 44×44px no botão de confirmar adesão.

## 10. Testes

- unitário: bloqueio sem e-mail/celular válidos; registro de `textVersion` no aceite.
- roteamento: `assuranceGuard('simples')` presente e ausente; `serviceAvailabilityGuard
('adesao_sne')` presente e ausente.
- jornada feliz: adesão com contato válido → confirmação com cancelamento visível; jornada de erro:
  contato incompleto → bloqueio explicado; jornada de negação: SNE nacional indisponível → pedido
  pendente sem alterar prazo.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                                      | Ação seguinte        |
| ----------------- | ----------------------------------------------------------------------------------------------- | -------------------- |
| carregando        | "Verificando sua adesão ao SNE..." (`state.loading`)                                            | nenhuma              |
| vazio             | não se aplica                                                                                   | —                    |
| sem elegibilidade | "Complete seu e-mail e celular para aderir ao SNE" (`state.ineligible`)                         | ir para o cadastro   |
| erro recuperável  | "O sistema nacional está indisponível agora; seus prazos não mudam" (`state.error_recoverable`) | pedido fica pendente |
| sem permissão     | não confirmado nesta leitura (ver OD-P53) — `state.forbidden` reservada                         | —                    |
| indisponível      | "Este serviço está indisponível no momento" (`state.unavailable`)                               | canal alternativo    |

## Chaves i18n

- `portal.screens.t09.title` — "Adesão ao SNE" (obrigatória)
- `portal.screens.t09.intro` — "A partir da adesão, suas notificações passam a ser só digitais."
- `portal.screens.t09.cmd.enroll` — "Confirmar adesão"
- `portal.screens.t09.cmd.cancel` — "Cancelar adesão"
- `portal.screens.t09.field.email` — "E-mail para alertas"
- `portal.screens.t09.field.phone` — "Celular para alertas"
- `portal.screens.t09.state.loading` — "Verificando sua adesão ao SNE..."
- `portal.screens.t09.state.ineligible` — "Complete seu e-mail e celular para aderir ao SNE"
- `portal.screens.t09.state.error_recoverable` — "O sistema nacional está indisponível agora; seus prazos não mudam"
- `portal.screens.t09.state.unavailable` — "Este serviço está indisponível no momento"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
