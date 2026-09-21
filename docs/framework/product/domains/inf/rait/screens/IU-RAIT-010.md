---
id: IU-RAIT-010
title: Abertura de diligência — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/diligencias` (`rait-web-frontend.md` §4; tela T-05 de [IU-RAIT-001]).
Fontes: [UC-RAIT-003], [JRN-RAIT-001], [RN-RAIT-003], [RN-RAIT-004], [RN-RAIT-005].

## 1. Identidade

- id: `IU-RAIT-010`; `path`: `casos/:id/diligencias` (`route-manifest.md` #10).
- `screen`: `T-05`; módulo: `caso` (`rait-web-frontend.md` §2).
- página: `InquiriesPage`; componentes inteligentes: `InquiryForm`, `InquiryCard`
  (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-diligencias`.

## 2. Acesso

- papéis: `rait-analyst`, `rait-rapporteur` (`route-manifest.md` #10).
- guardas: as de `/casos/:id` + `roleGuard(['rait-analyst', 'rait-rapporteur'])`.
- chaves de política: `inf:rait-case:open-inquiry`, `inf:rait-case:answer`,
  `inf:rait-case:extend` (`rait-web-frontend.md` §7).
- pré-condição: caso em `EM_INSTRUCAO` (abrir) ou `DILIGENCIA` (responder/prorrogar) ([WF-RAIT-001]).

## 3. Entrada

- de onde se chega: `/casos/:id/dossie` quando falta prova externa ([JRN-RAIT-001] passo 4/passo
  5; JW-07 passo 3).
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/diligencias`.

## 4. Dados

- resolver: "abrir/responder/prorrogar" (`route-manifest.md` #10; [UC-RAIT-003]).
- clientes: `data/api/case.client.ts` (`POST inquiries`, `PATCH inquiries/{id}`).
- calculado do backend: default de prazo de 15 dias úteis, prorrogável 1x (steering A.7;
  [WF-RAIT-001] §Prazos e timers T-DIL) — nunca digitado manualmente pelo frontend
  (`rait-web-frontend.md` §1, "nenhum prazo legal calculado no cliente").

## 5. Estados

- **carregando**: skeleton do `InquiryCard`.
- **vazio**: nenhuma diligência aberta no caso.
- **erro recuperável**: falha ao salvar; mantém o preenchido, retry.
- **sem permissão**: papel fora de `rait-analyst`/`rait-rapporteur` — `RAIT.FORBIDDEN_ACTION` (403).
- **conflito**: `RAIT.INQUIRY_ALREADY_CLOSED` (409, catálogo §3.5) — resposta a diligência
  expirada/já respondida; recarrega.
- **erro de negócio**: `RAIT.INQUIRY_ADDRESSEE_FORBIDDEN` (422, catálogo §3.5) — diligência ao
  requerente pedindo documento do órgão; `RAIT.INQUIRY_EXTENSION_LIMIT` (422) — segunda
  prorrogação.

## 6. Comandos

| Ação (`recurso:ação`)    | Papel                             | Pré-estado → pós-estado                      | Comando                                                                    | Confirmação com efeito jurídico                                                  | Erros esperados                    |
| ------------------------ | --------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------- |
| `rait.case:open-inquiry` | `rait-analyst`, `rait-rapporteur` | `EM_INSTRUCAO`→`DILIGENCIA`                  | `POST /v1/inf/rait/inquiries` (endpoint de comando: R-0007 CTG-0004)       | "O caso sai da sua mesa até a resposta ou o vencimento do prazo" (default 15 du) | `RAIT.INQUIRY_ADDRESSEE_FORBIDDEN` |
| `rait.case:answer`       | `rait-analyst`, `rait-rapporteur` | `DILIGENCIA`→`EM_INSTRUCAO`                  | `PATCH /v1/inf/rait/inquiries/{id}` (endpoint de comando: R-0007 CTG-0004) | — (resposta tempestiva retoma a instrução, AC-RAIT-003-6)                        | `RAIT.INQUIRY_ALREADY_CLOSED`      |
| `rait.case:extend`       | `rait-analyst`, `rait-rapporteur` | `DILIGENCIA` (prazo estendido, mesmo estado) | `PATCH /v1/inf/rait/inquiries/{id}` (endpoint de comando: R-0007 CTG-0004) | "Prorrogação única; nova prorrogação exige ato motivado" ([RN-RAIT-105])         | `RAIT.INQUIRY_EXTENSION_LIMIT`     |

- `If-Match` sempre exigido (`rait-web-frontend.md` §7).
- diligência sem prazo nunca é permitida ([RN-RAIT-004]; AC-RAIT-003-2); prazo expirado sem
  resposta avança automaticamente a `PRONTO_P_DECISAO`, julgando-se no estado em que se encontra —
  nunca arquiva (AC-RAIT-003-3).

## 7. Saída

- diligência aberta remove o caso da mesa do responsável até resposta ou vencimento
  ([JRN-RAIT-001] passo 4); reaparece em `/painel/retomar` (T-06, IU-RAIT-003).
- resposta tempestiva retorna a `EM_INSTRUCAO` (AC-RAIT-003-6).

## 8. Segurança e LGPD

- documento pedido ao requerente nunca é o que o órgão já possui ([RN-RAIT-003]; AC-RAIT-003-5).
- texto livre do pedido de diligência não expõe dado de terceiro além do necessário
  ([RN-RAIT-134]).

## 9. Acessibilidade e atalhos

- `d` abre esta aba a partir do layout do caso (`rait-web-frontend.md` §10).
- prazo exibido sempre com base legal ao lado, distinto da meta operacional
  ([IU-RAIT-001] §Requisitos transversais itens 1-2).

## 10. Testes

- roteamento: `rait-analyst`/`rait-rapporteur` ativam; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-003]: AC-RAIT-003-2 (prazo explícito obrigatório), AC-RAIT-003-3
  (vencimento avança, não arquiva), AC-RAIT-003-4 (prorrogação única), AC-RAIT-003-5 (nunca pede
  ao requerente o que o órgão já tem), AC-RAIT-003-6 (resposta tempestiva retoma a instrução).

## Componentes compartilhados

`InquiryForm`, `InquiryCard`, `DeadlineChip` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-diligencias.title` — "Diligências"
- `rait.screens.casos-id-diligencias.intro` — "Provas e documentos solicitados, com prazo."
- `rait.screens.casos-id-diligencias.empty` — "Nenhuma diligência aberta."
- `rait.screens.casos-id-diligencias.cmd.open` — "Abrir diligência"
- `rait.screens.casos-id-diligencias.cmd.answer` — "Registrar resposta"
- `rait.screens.casos-id-diligencias.cmd.extend` — "Prorrogar"
