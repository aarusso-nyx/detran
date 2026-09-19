---
id: IU-PORTAL-T11
title: Resposta a diligência — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-900]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-11. Fontes: [UC-PORTAL-009], [RN-PORTAL-106], [RN-PORTAL-107].

## 1. Identidade

`T-11`, "Responder pendência do seu processo", app `portal`, rota
`processos/:requestId/diligencia/:diligenceId` (`route-manifest.md` #16), módulo `processos`,
`screen: 'T-11'`, `sheet: 'IU-PORTAL-T11'`.

## 2. Acesso

Ator CIDADAO nível simples; guarda `portalAuthGuard` + `entitlementGuard('request',
requestId)`. Pré-condição: processo em estado `DILIGENCIA` no workflow de destino ([UC-PORTAL-009]
pré-condições, token já validado em artefato `approved`), aguardando o cidadão, com prazo próprio
comunicado ([REF-CONTRAN-900] art. 9º). Sem vínculo → "por que não vejo isto", nunca tela vazia.

## 3. Entrada

Chega-se de uma notificação específica de diligência em `/notificacoes` (T-12) — distinta de
qualquer outra notificação do processo ([UC-PORTAL-009] AC-1 — passo 1) — ou de `/processos/:id`
(T-07). Parâmetros `requestId`/`diligenceId` validados contra o vínculo. Anexos em composição
ficam no rascunho do servidor (`portal/requests`), recuperáveis ao recarregar
(`portal-frontends.md` §1 "Estado").

## 4. Dados

`GET requests/{id}` (`portal-route-contract.md` §5): campo `diligences[]` traz a pendência aberta,
com o que exatamente está sendo pedido e o prazo. `POST requests/{id}/diligences/{did}/responses`
(`Idempotency-Key`): `{ text, attachmentIds[] }`. Anexos via `POST requests/{id}/attachments`
(intenção → URL assinada → `.../complete`, ADR-0018). Nenhuma fixture como fallback.

## 5. Estados

- **carregando**: esqueleto.
- **vazio**: não se aplica — a rota só existe com uma diligência aberta ou já respondida.
- **sem elegibilidade / sem permissão**: tratado pelo `entitlementGuard` (redireciona), como em
  T-10.
- **erro recuperável**: `PORTAL.DILIGENCE_NOT_OPEN` (`portal-error-catalog.md` §3) — diligência já
  respondida ou vencida ([UC-PORTAL-009] AC-5): a tela mostra o status atual, não some.
- **indisponível**: falha de rede/servidor.
- **sucesso**: confirmação de recebimento imediata e o status volta de "aguardando você" para "em
  análise" na hora ([UC-PORTAL-009] AC-4).

## 6. Comandos

"Enviar resposta" (rótulo, `Idempotency-Key`): validação de forma — anexo tipo/tamanho/hash
(`PORTAL.ATTACHMENT_INVALID`); checklist **nunca** inclui documento do próprio órgão
(`PORTAL.ATTACHMENT_AGENCY_DOCUMENT`, [RN-PORTAL-106], [RN-PORTAL-107] regra 1); efeito: `POST
.../responses` → devolve o caso ao workflow de destino ([UC-PORTAL-009] passo 4); auditoria
INF_RAIT_CASE_ANSWER_INQUIRY (delegação `inf:rait-case:answer-inquiry`, `portal-frontends.md`
§4). Um clique não muda estado jurídico só pela UI — o efeito é a delegação, não a tela.

## 7. Saída

Volta a `/processos/:requestId` (T-07). Anexo/texto ainda não enviado pede confirmação antes de
sair (perda de composição), pois o rascunho é persistido no servidor mas não submetido
(`portal-frontends.md` §1 "Estado").

## 8. Segurança

Vínculo por `portal.entitlement` (`kind: request`). Nenhum campo do formulário pede documento que
o órgão já detém ([RN-PORTAL-106] camada 1 — lei). Nada de token/segredo em tela/URL/log.

## 9. Acessibilidade

Contador de prazo destacado e associado por `aria-describedby` ao campo de resposta; mensagem de
erro de anexo associada ao campo, não só resumo no topo (`_intake/ux-notes.md` §f); foco move para
a confirmação de recebimento após o envio; alvo de toque ≥ 44×44px no botão de anexar/enviar.

## 10. Testes

Unitário: rejeição de anexo classificado como documento do órgão ([UC-PORTAL-009] AC-2).
Roteamento: acesso negado sem vínculo (presença/ausência). Jornada feliz: resposta dentro do
prazo muda o status na hora (AC-4). Jornada de erro: prazo vencido não esconde a pendência — a
tela mostra que o processo seguiu para julgamento no estado em que se encontra (AC-5).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)           | Ação seguinte                   |
| ----------------- | ------------------------------------ | ------------------------------- |
| carregando        | `portal.states.loading`              | —                               |
| vazio             | `portal.screens.t11.empty`           | volta a `/processos/:requestId` |
| sem elegibilidade | tratado pelo guarda (redireciona)    | `/vinculo/por-que-nao-vejo`     |
| erro recuperável  | `portal.screens.t11.state.encerrada` | ver status atual do processo    |
| sem permissão     | tratado pelo guarda (redireciona)    | `/vinculo/por-que-nao-vejo`     |
| indisponível      | `portal.states.service_unavailable`  | tentar mais tarde               |

## Chaves i18n

- `portal.screens.t11.title` — "Responder pendência do seu processo"
- `portal.screens.t11.intro` — "O órgão pediu um documento ou informação a mais. Veja o que falta
  e envie até o prazo." ([UC-PORTAL-009] passo 1)
- `portal.screens.t11.empty` — "Esta diligência não existe ou já foi respondida."
- `portal.screens.t11.state.encerrada` — "Esta pendência já foi respondida ou o prazo já passou —
  seu processo segue em análise." ([UC-PORTAL-009] AC-5)
- `portal.screens.t11.cmd.enviar` — "Enviar resposta"
- `portal.screens.t11.field.prazo` — "Envie até {{dueOn}}." ([UC-PORTAL-009] passo 2)
