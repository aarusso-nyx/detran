---
id: IU-RAIT-009
title: Dossiê do caso / instrução — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/dossie` (`rait-web-frontend.md` §4; tela T-04 de [IU-RAIT-001]).
Fontes: [UC-RAIT-003], [JRN-RAIT-001], [RN-RAIT-003].

## 1. Identidade

- id: `IU-RAIT-009`; `path`: `casos/:id/dossie` (`route-manifest.md` #9).
- `screen`: `T-04`; módulo: `caso` (`rait-web-frontend.md` §2).
- página: `DossierPage`; componentes inteligentes: `DossierViewer`, `DocumentUploader`
  (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-dossie`.

## 2. Acesso

- papéis: `todos` (`route-manifest.md` #9).
- guardas: as de `/casos/:id` (`raitAuthGuard`, `roleGuard`, `caseAccessGuard` pendente).
- chave de política: `inf:rait-case:*` para "anexar de ofício" (`POST documents`, origem
  `oficio`) restrita a quem instrui o caso (`rait-analyst`, `rait-rapporteur`); demais papéis
  visualizam.
- pré-condição: caso em `EM_INSTRUCAO` (ou qualquer estado ativo para leitura, JW-07 passo 3).
- é a aba inicial para `rait-rapporteur` quando a URL termina em `/casos/:id` (`route-manifest.md`
  §C).

## 3. Entrada

- de onde se chega: `/casos/:id/triagem` após admissão ([JRN-RAIT-001] passo 4); aba inicial do
  layout para `rait-rapporteur` (leitura, JW-07 passo 3).
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/dossie`.

## 4. Dados

- resolver: "documentos, evidências, peças" (`route-manifest.md` #9; [UC-RAIT-003]).
- clientes: `data/api/case.client.ts` (`RaitDocument`); upload por URL assinada do storage do
  kernel (`rait-web-frontend.md` §8).
- calculado do backend: hash do documento exibido para conferência ([UC-RAIT-001]); origem
  (`requerente` × `oficio`) determinada pelo backend, não editável após anexação.

## 5. Estados

- **carregando**: skeleton do `DossierViewer`.
- **vazio**: dossiê sem documentos além da petição inicial — mensagem, sem bloquear instrução.
- **erro recuperável**: falha ao carregar/enviar arquivo; mantém o que já foi selecionado, retry.
- **sem permissão**: ação "anexar de ofício" oculta para quem não instrui o caso.
- **conflito**: `RAIT.CASE_STATE_INVALID` (409) — recarrega o dossiê.
- **erro de negócio**: `RAIT.CASE_OFFICIAL_DOCUMENT_REQUIRED` (422, catálogo §3.5) — pedido ao
  requerente de documento que o órgão detém; `RAIT.DOCUMENT_HASH_MISMATCH` (422) — hash declarado
  diverge do conteúdo; `RAIT.FILE_TYPE_UNSUPPORTED` / `RAIT.FILE_TOO_LARGE` (400, catálogo §3.2).

## 6. Comandos

| Ação (`recurso:ação`) | Papel                             | Pré-estado → pós-estado         | Comando                                                                   | Confirmação                                           | Erros esperados                                                                    |
| --------------------- | --------------------------------- | ------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| anexar de ofício      | `rait-analyst`, `rait-rapporteur` | inalterado (dossiê enriquecido) | `POST documents` (origem `oficio`) — endpoint de comando: R-0007 CTG-0004 | — (documento do próprio órgão, sem pedido ao cidadão) | `RAIT.DOCUMENT_HASH_MISMATCH`, `RAIT.FILE_TYPE_UNSUPPORTED`, `RAIT.FILE_TOO_LARGE` |

- `If-Match` sempre exigido nos comandos de mutação (`rait-web-frontend.md` §7).
- documento que o próprio órgão já possui (AIT, NA, NP, evidências do TEAT) é sempre anexado de
  ofício, nunca pedido ao requerente ([RN-RAIT-003]; AC-RAIT-003-5, JW-01 passo 5).

## 7. Saída

- instrução completa segue a `/casos/:id/minuta` (analista) ou à relatoria/voto (relator, fora do
  lote A) ([JRN-RAIT-001] passo 6).
- falta de prova externa abre diligência em `/casos/:id/diligencias`.

## 8. Segurança e LGPD

- `DossierViewer` trata o requerimento como potencialmente sensível quando há dado revelado
  incidentalmente na exposição de fatos ([RN-RAIT-134]); exibição do texto livre restrita ao
  contexto de instrução deste caso, nunca em telas de terceiros.
- terceiros citados suprimidos campo a campo em cópia/exportação ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- caso digitalizado tem a mesma forma do nativo — PDF anexado sem campos extraídos não satisfaz a
  tela ([IU-RAIT-001] §Requisitos transversais item 6; AC-RAIT-001-5).
- foco visível no visualizador; contraste AA no hash exibido.

## 10. Testes

- roteamento: `todos` ativam a leitura; ação de anexar de ofício restrita a quem instrui (M14).
- critérios ligados a [UC-RAIT-003] (AC-RAIT-003-5 — não se exige do requerente o que o órgão já
  tem) e a [UC-RAIT-001] (AC-RAIT-001-5 — caso digitalizado com a mesma forma do nativo).

## Componentes compartilhados

`DossierViewer`, `DocumentUploader`, `CaseHeader` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-dossie.title` — "Dossiê do caso"
- `rait.screens.casos-id-dossie.intro` — "Documentos, evidências e peças do caso."
- `rait.screens.casos-id-dossie.empty` — "Nenhum documento além da petição inicial."
- `rait.screens.casos-id-dossie.cmd.attach-official` — "Anexar de ofício"
