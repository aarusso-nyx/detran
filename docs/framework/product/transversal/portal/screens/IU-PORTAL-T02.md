---
id: IU-PORTAL-T02
title: Assistente de defesa prévia — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CTB-extracts-raw,
    REF-BENCH-ESTADOS,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-02. Fontes: [UC-PORTAL-001], [JRN-PORTAL-001], [RN-PORTAL-101],
[RN-PORTAL-104], [RN-PORTAL-105], [RN-PORTAL-106], [RN-PORTAL-107], [RN-PORTAL-111].

## 1. Identidade

- id: `T-02`; nome visível: "Assistente de defesa prévia".
- app: `portal`; módulo: `defesa` (`portal-frontends.md` §4).
- rota: `/autos/:aitId/defesa/nova` (`route-manifest.md` #10); `screen: 'T-02'`,
  `sheet: 'IU-PORTAL-T02'`.

## 2. Acesso

- ator: CIDADAO nível avançada — apresentar defesa exige assinatura **avançada**, nomeada
  literalmente no Decreto 10.543/2020 art. 4º, II, "h" ([RN-PORTAL-101] linha 6; [UC-PORTAL-001]
  AC-PORTAL-001-1); nenhum ato do PORTAL exige qualificada (DT-050, `steering.md` H.50).
- `access`: `avancada`; guardas `portalAuthGuard` + `assuranceGuard('avancada')` →
  `entitlementGuard('ait')` sobre `:aitId`; `serviceAvailabilityGuard('defesa_previa')`
  (`route-manifest.md` #10).
- pré-condição: AIT com prazo de defesa em aberto (mínimo 30 dias da expedição da NA —
  [REF-CONTRAN-918] art. 4º §2º; [UC-PORTAL-001] Pré-condições); nível insuficiente → passo guiado
  de elevação embutido no próprio wizard, nunca um muro antecipado (`_intake/ux-notes.md` §e;
  [JRN-PORTAL-001] passo 2).

## 3. Entrada

- de onde se chega: T-01, botão "Defender-se".
- rascunho persistido no servidor (`portal/requests` em `PEDIDO_EM_COMPOSICAO`), recuperável ao
  recarregar ou voltar depois — "rascunho é salvo e recuperável até o vencimento do prazo"
  ([UC-PORTAL-001] 5a); nunca em `localStorage` (`portal-frontends.md` §1).
- `aitId` da URL é apenas chave de busca; a autorização vem do vínculo checado no servidor.

## 4. Dados

- `POST /v1/portal/requests` `{ serviceKey: 'defesa_previa', targetKind: 'ait', targetId: aitId,
channel: 'portal' }` → `{ requestId, state: PEDIDO_EM_COMPOSICAO, prefilled{ órgão, placa,
aitNumber, dados do requerente logado }, requirements[], minimumAssurance }` ou `INELEGIVEL{
reason, alternative }` (`portal-route-contract.md` §5).
- `PUT requests/{id}/draft` `{ facts, grounds, attachmentIds[], requestType: cancelamento | outro
}` (`If-Match`) — corpo do ato `defesa_previa` (`portal-route-contract.md` §5.1).
- `POST requests/{id}/attachments` (intenção → URL assinada → `.../complete`).
- `POST requests/{id}/submit` `{ signature: { method: govbr | upload, signatureRef } }`
  (`Idempotency-Key` `defesa_previa:<aitId>:<fingerprint do corpo>` — `portal-route-contract.md`
  §1.4) → protocolo imediato → `PROTOCOLADO` → delegação síncrona `inf:rait-case:protocol`
  (`instance=defesa_previa`, `intake_channel=portal` — `portal-frontends.md` §4).
- campos pré-preenchidos são somente leitura, com "corrigir" quando permitido (`PrefilledField`,
  [RN-PORTAL-106]).

## 5. Estados

- **carregando**: skeleton do formulário enquanto `POST requests`/`GET` prefilled resolve.
- **vazio**: não se aplica — o wizard sempre parte de um AIT identificado.
- **sem elegibilidade**: `INELEGIVEL` na criação (ex.: já existe requerimento para o mesmo AIT —
  [RN-RAIT-002] citada em [UC-PORTAL-001] 1a) → `PORTAL.REQUEST_ONE_PER_AIT` ou
  `PORTAL.REQUEST_DRAFT_EXISTS`, direciona ao processo existente.
- **erro recuperável**: falha ao enviar anexo/rascunho → mantém o que já foi preenchido, retry por
  campo ([UC-PORTAL-001] 3a).
- **sem permissão**: nível insuficiente ao tentar assinar → passo guiado embutido (não navega para
  fora do wizard) — ver T-27 para o texto de explicação reutilizado.
- **indisponível**: serviço `defesa_previa` marcado `unavailable` no catálogo →
  `/servico-indisponivel/defesa_previa`, nunca 404 (`route-manifest.md`; `portal-frontends.md`
  §10).
- **sucesso**: protocolo exibido com número e data/hora ([RN-PORTAL-111] item 1).

## 6. Comandos

| Rótulo (chave i18n)             | Nível    | Validação de forma                                                                             | Idempotência                          | Efeito                                                                   |
| ------------------------------- | -------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| "Enviar defesa" (`cmd.submit`)  | avançada | um AIT por requerimento ([RN-RAIT-002]); anexo PDF/JPEG/PNG ≤ 10 MB (`portal-frontends.md` §7) | `defesa_previa:<aitId>:<fingerprint>` | `submit` → protocolo imediato → `PROTOCOLADO` → `inf:rait-case:protocol` |
| "Salvar rascunho" (`cmd.draft`) | avançada | —                                                                                              | —                                     | `compose` → rascunho no servidor                                         |

- checklist de anexos **exclui** NA/AIT/NP — o sistema os anexa de ofício ([RN-PORTAL-106];
  [UC-PORTAL-001] AC-PORTAL-001-3); anexo assinado eletronicamente presume-se autêntico, sem
  reconhecimento de firma nem autenticação cartorial ([RN-PORTAL-104]).
- checklist mostrado integralmente na entrada, não revelado passo a passo ([RN-PORTAL-107]).
- fora do prazo no momento do protocolo: sistema informa o vencimento e ainda protocola, avisando o
  efeito (`PORTAL.REQUEST_OUT_OF_DEADLINE`, aviso — [UC-PORTAL-001] 6a); "um clique não muda estado
  jurídico só pela UI" — a assinatura é etapa própria, distinta do preenchimento.
- todo comando gera `@Audit` com finalidade (`portal-route-contract.md` §1.7).

## 7. Saída

- volta para T-01 ou para T-07 (acompanhamento) após protocolar.
- abandono antes de assinar: rascunho fica salvo no servidor; ao sair sem assinar, nenhuma
  confirmação bloqueante é necessária porque nada se perde ([UC-PORTAL-001] 5a).

## 8. Segurança

- vínculo: `portal.entitlement` sobre o AIT; nível de assinatura vem da claim assinada
  `assurance_level`, nunca do corpo (`portal-route-contract.md` §1.3).
- titular sem máscara nos dados pré-preenchidos ([RN-PORTAL-118]); nenhum documento do órgão é
  reexigido ([RN-PORTAL-106]).
- nenhum token/segredo em tela/URL/log; `signatureRef` não é exibido cru.

## 9. Acessibilidade

- navegação por teclado completa no formulário mais longo do PORTAL; mensagens de erro associadas
  ao campo (`aria-describedby`), não só resumo no topo; nomes de campo que fazem sentido fora de
  contexto visual ("Data do vencimento da defesa", não "Data" solto — `_intake/ux-notes.md` §f).
- alvo de toque ≥ 44×44px no botão de assinar (momento de maior consequência).
- guia/boleto acessível mediante solicitação não se aplica a esta tela (é do módulo de pagamento,
  [RN-PORTAL-114]).

## 10. Testes

- unitário: validação de anexo (tipo/tamanho), checklist nunca lista NA/AIT/NP.
- roteamento: `assuranceGuard('avancada')` presente e ausente; `serviceAvailabilityGuard
('defesa_previa')` presente e ausente.
- jornada feliz: preencher → assinar → protocolo imediato; jornada de erro: anexo inválido não
  descarta o restante; jornada de negação: nível insuficiente → elevação guiada sem perder o
  preenchido.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                            | Ação seguinte                                   |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| carregando        | "Preparando seu requerimento..." (`state.loading`)                                    | nenhuma                                         |
| vazio             | não se aplica (wizard sempre parte de um AIT)                                         | —                                               |
| sem elegibilidade | "Já existe uma defesa em andamento para esta multa" (`state.ineligible`)              | abre o processo existente (T-07)                |
| erro recuperável  | "Não conseguimos enviar agora. Seu texto continua salvo." (`state.error_recoverable`) | tentar de novo                                  |
| sem permissão     | explicação embutida no próprio wizard, sem sair da tela (`state.forbidden`)           | passo guiado de elevação, retoma no mesmo ponto |
| indisponível      | "Este serviço está indisponível no momento" (`state.unavailable`)                     | canal presencial ([RN-PORTAL-105])              |

## Chaves i18n

- `portal.screens.t02.title` — "Assistente de defesa prévia" (obrigatória)
- `portal.screens.t02.intro` — "Conte o que aconteceu e anexe o que quiser. O órgão já tem o AIT, a NA e a NP."
- `portal.screens.t02.cmd.submit` — "Enviar defesa"
- `portal.screens.t02.cmd.draft` — "Salvar rascunho"
- `portal.screens.t02.field.facts` — "O que aconteceu"
- `portal.screens.t02.field.grounds` — "Por que a multa deveria ser cancelada"
- `portal.screens.t02.state.loading` — "Preparando seu requerimento..."
- `portal.screens.t02.state.ineligible` — "Já existe uma defesa em andamento para esta multa"
- `portal.screens.t02.state.error_recoverable` — "Não conseguimos enviar agora. Seu texto continua salvo."
- `portal.screens.t02.state.forbidden` — "Para assinar sua defesa, confirme sua identidade com um passo a mais"
- `portal.screens.t02.state.unavailable` — "Este serviço está indisponível no momento"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
