---
id: IU-RAIT-021
title: Protocolo — pendências de conteúdo mínimo — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CTB-280-290]
updated: 2026-09-21
---

Ficha da rota `/protocolo/pendencias` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001]).
Fontes: [UC-RAIT-028], [JRN-RAIT-003], [RN-RAIT-002], [RN-RAIT-003], [RN-PORTAL-107].

## 1. Identidade

- id: `IU-RAIT-021`; rota: `/protocolo/pendencias` (`route-manifest.md` #20); `screen: '—'`.
- módulo: `protocolo` (`rait-web-frontend.md` §2).
- página: `PendingContentPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #20).
- slug i18n: `protocolo-pendencias` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #20).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4).
- chave de política: `inf:rait-case:resolve-pending-content` (JW-03 passo 3, análoga à notação
  `recurso:ação` do §7).
- pré-condição: caso `PROTOCOLADO` com item do conteúdo mínimo ausente que não seja documento do
  próprio órgão ([UC-RAIT-028] Pré-condições).

## 3. Entrada

- de onde se chega: `/protocolo` (indicador de pendência na lista); [JRN-RAIT-003] passo 2; JW-03
  passo 3.
- parâmetros de rota: nenhum; lista aceita `?q=&ordem=&filtro=` (`rait-web-frontend.md` §4).
- deep-link canônico: `/protocolo/pendencias` sem parâmetros.

## 4. Dados

- resolver: "pendências de conteúdo mínimo" (`route-manifest.md` #20).
- cliente gerado: `data/api/case.client.ts`, recurso `/v1/inf/rait/cases` filtrado por pendência
  aberta.
- campos exibidos: itens ausentes listados pelo sistema no ato do protocolo, prazo interno de
  saneamento (proposta: 10 dias — [UC-RAIT-028] fluxo 1, sem confirmação em outra fonte além da
  proposta do próprio UC), juntadas datadas.
- calculado do backend: prazo da pendência não consome a tempestividade original do requerente
  ([UC-RAIT-028] AC-RAIT-028-2) — a tela exibe, não recalcula.

## 5. Estados

- carregando: skeleton da lista de pendências.
- vazio: "nenhuma pendência aberta".
- erro recuperável: falha transitória ao carregar/juntar documento — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.PENDING_CONTENT_EXPIRED` (409) — juntada após o prazo da pendência
  (`rait-error-catalog.md` §3.3) → recarrega, reabre a tela com os dados atuais.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`)                       | Papel            | Pré-estado → pós-estado                                              | Comando (§7, proposto)              | Confirmação com efeito jurídico                                                          | Erros esperados                |
| ------------------------------------------- | ---------------- | -------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------ |
| `rait.case:resolve-pending-content` (JW-03) | `rait-secretary` | `PROTOCOLADO` (pendência aberta) → `PROTOCOLADO` (pendência fechada) | `rait-case:resolve-pending-content` | "Ao encerrar a pendência, o caso segue para triagem sem consumir o prazo do requerente." | `RAIT.PENDING_CONTENT_EXPIRED` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11 — endpoints de comando pendentes
para todos os módulos). `If-Match` sempre exigido na juntada/encerramento da pendência.

## 7. Saída

- pendência encerrada: caso segue a `TRIAGEM_ADMISSIBILIDADE` ([UC-RAIT-028] Fluxo principal 3).
- pendência não atendida: caso vai à triagem no estado em que se encontra — "documento faltante"
  não é hipótese de não conhecimento ([UC-RAIT-028] Fluxo 2a; [RN-PORTAL-107]).
- documentos do próprio órgão ausentes: anexados de ofício, nunca pedidos ao requerente
  ([RN-RAIT-003]).

## 8. Segurança e LGPD

- checklist de anexos nunca inclui documento emitido pelo próprio DETRAN-AM ([RN-RAIT-003]).
- dados do requerente exibidos conforme papel; terceiros suprimidos ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir a pendência (`rait-web-frontend.md` §10).
- prazo da pendência sempre com base legal/proposta ao lado, nunca isolado ([IU-RAIT-001] §1).
- foco visível; erros de juntada associados ao campo.

## 10. Testes

- unitário: pendência não é recusa — protocolo emitido no ato ([UC-RAIT-028] AC-RAIT-028-1); o
  prazo do requerente não é consumido pela pendência (AC-RAIT-028-2).
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.
- estados: conflito por prazo expirado; vazio; erro recuperável.

## Componentes compartilhados

`QueueTable`, `DocumentUploader`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.protocolo-pendencias.title` — "Pendências de conteúdo mínimo"
- `rait.screens.protocolo-pendencias.intro` — "Peças protocoladas com item ausente, aguardando juntada"
- `rait.screens.protocolo-pendencias.empty` — "Nenhuma pendência aberta"
- `rait.screens.protocolo-pendencias.cmd.resolve` — "Encerrar pendência"
- `rait.screens.protocolo-pendencias.field.missing` — "Itens ausentes"
