---
id: IU-RAIT-011
title: Editor de minuta — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/minuta` (`rait-web-frontend.md` §4; tela T-07 de [IU-RAIT-001], lado
analista). Fontes: [UC-RAIT-003], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-011`; `path`: `casos/:id/minuta` (`route-manifest.md` #11).
- `screen`: `T-07`; módulo: `caso` (`rait-web-frontend.md` §2).
- página: `DraftPage`; componente inteligente: `MinutaEditor` (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-minuta`.

## 2. Acesso

- papéis: `rait-analyst` (`route-manifest.md` #11).
- guardas: as de `/casos/:id` + `roleGuard(['rait-analyst'])`.
- chave de política: `inf:rait-case:submit-draft` (`rait-web-frontend.md` §7).
- pré-condição: caso em `EM_INSTRUCAO`, instrução concluída ([UC-RAIT-003] passo 3).

## 3. Entrada

- de onde se chega: `/casos/:id/dossie` quando a instrução está completa ([JRN-RAIT-001] passo 6).
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/minuta`.

## 4. Dados

- resolver: "editor de minuta (não assina)" (`route-manifest.md` #11; [UC-RAIT-003]).
- clientes: `data/api/case.client.ts` (versões da minuta).
- calculado do backend: nenhum prazo é calculado nesta tela; o dispositivo (`acolher`|`indeferir`)
  e a fundamentação são de autoria do analista, versionados a cada envio
  (`rait-web-frontend.md` §9).

## 5. Estados

- **carregando**: skeleton do `MinutaEditor`.
- **vazio**: minuta ainda não iniciada — editor em branco.
- **erro recuperável**: falha ao salvar versão; mantém o texto digitado, retry.
- **sem permissão**: papel fora de `rait-analyst` — `RAIT.FORBIDDEN_ACTION` (403); o analista
  autor da minuta nunca pode assiná-la ([IU-RAIT-001] §3) — a UI só permite "enviar para
  assinatura", nunca concluir a decisão (AC-RAIT-016-2).
- **conflito**: `RAIT.CASE_STATE_INVALID` (409) — recarrega com a versão mais recente.
- **erro de negócio**: `RAIT.DRAFT_INCOMPLETE` (422, catálogo §3.5) — minuta sem
  fatos/fundamentos/dispositivo.

## 6. Comandos

| Ação (`recurso:ação`)    | Papel          | Pré-estado → pós-estado           | Comando                                                                              | Confirmação com efeito jurídico                                                              | Erros esperados                                    |
| ------------------------ | -------------- | --------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `rait.case:submit-draft` | `rait-analyst` | `EM_INSTRUCAO`→`PRONTO_P_DECISAO` | `POST /v1/inf/rait/cases/{id}/commands/ready` (endpoint de comando: R-0007 CTG-0004) | "A minuta segue para assinatura da autoridade; você não decide este caso" ([IU-RAIT-001] §3) | `RAIT.DRAFT_INCOMPLETE`, `RAIT.CASE_STATE_INVALID` |

- `If-Match` sempre exigido (`rait-web-frontend.md` §7).
- quem instrui não é quem assina: a tela indica explicitamente "aguardando assinatura da
  autoridade" após o envio ([IU-RAIT-001] §Requisitos transversais item 3; JW-01 passo 6).

## 7. Saída

- envio bem-sucedido muda o estado para `PRONTO_P_DECISAO` e a tela passa a exibir "aguardando
  assinatura da autoridade" (JW-01 passo 6).
- devolução com orientação da autoridade (uma vez) retorna o foco a esta tela para nova versão
  ([JRN-RAIT-001] passo 9).

## 8. Segurança e LGPD

- `MinutaEditor` não reproduz texto livre de terceiros sem necessidade ([RN-RAIT-134],
  [RN-RAIT-137]).
- autoria da minuta é explícita e não pode ser confundida com a decisão ([IU-RAIT-001] §3).

## 9. Acessibilidade e atalhos

- foco visível entre as seções fatos/fundamentos/dispositivo; risco/pendência nunca só por cor
  ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-analyst` ativa; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-003] (fluxo de instrução → minuta) e a [UC-RAIT-016] AC-RAIT-016-2
  (o revisor nunca assina; a tela só permite enviar à fila de assinatura).

## Componentes compartilhados

`MinutaEditor`, `CaseHeader` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-minuta.title` — "Minuta"
- `rait.screens.casos-id-minuta.intro` — "Redija fatos, fundamentos e dispositivo."
- `rait.screens.casos-id-minuta.state.awaiting-signature` — "Aguardando assinatura da autoridade"
- `rait.screens.casos-id-minuta.cmd.submit` — "Enviar para assinatura"
