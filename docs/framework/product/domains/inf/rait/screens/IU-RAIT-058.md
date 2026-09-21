---
id: IU-RAIT-058
title: Dossiê final selado — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-13709-2018]
updated: 2026-09-21
---

Ficha da rota `arquivo/casos/:id` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-024].

## 1. Identidade

- id `IU-RAIT-058`; `path`: `arquivo/casos/:id` (route-manifest.md #63); `screen`: `—`.
- módulo `arquivo`; página `SealedDossierPage`, componente inteligente `SealedDossierViewer` (§5.3).
- nível `L2`; slug i18n `arquivo-casos-id`.

## 2. Acesso

- papéis: `rait-secretary`, AUDITOR (route-manifest.md linha 63).
- guardas: `raitAuthGuard`; `roleGuard(['rait-secretary', 'AUDITOR'])`.

## 3. Entrada

- chega-se de `/arquivo/busca` ([IU-RAIT-057]); parâmetro de rota `:id`.

## 4. Dados

- resolver: "dossiê final selado, vista/cópia" (route-manifest.md).
- leitura via `ArchiveFacade`: peças, decisões, atas, comunicações com marcos, pagamentos,
  consolidados e selados por hash ([UC-RAIT-024] fluxo 1).
- localização da custódia física registrada quando o papel vai à guarda física
  ([UC-RAIT-024] fluxo 2).

## 5. Estados

- **carregando / erro recuperável / sem permissão**: padrão.
- **selo divergente**: hash do dossiê selado divergente → `RAIT.ARCHIVE_SEAL_MISMATCH` (422).
- **caso não encerrado**: tentativa de acessar como selado sem estar `TRANSITADO`/encerrado →
  `RAIT.ARCHIVE_NOT_CLOSED` (409).

## 6. Comandos

Tela essencialmente de leitura e exportação. Pedido de vista/cópia é atendido sem requerimento
formal e sem custo ([RN-PORTAL-112]; [UC-RAIT-024] AC-RAIT-024-3) como download da peça selada —
não há nome de comando de escrita sourceado em `rait-web-frontend.md` §7 para "copiar/visualizar"
(ação de leitura, não de comando de estado).

## 7. Saída

- tentativa de alterar qualquer peça é recusada e a tentativa é registrada
  ([UC-RAIT-024] AC-RAIT-024-1) — o dossiê selado é imutável.

## 8. Segurança e LGPD

- dado de terceiro suprimido campo a campo em vista/cópia ([RN-RAIT-137]).
- token interno/hash só em `title`/`data-token`, nunca em texto visível ao usuário final.

## 9. Acessibilidade e atalhos

- `SealedDossierViewer` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-024-1 — dossiê selado é imutável; tentativa de alteração recusada e registrada.
- AC-RAIT-024-3 — vista sem burocracia, terceiros suprimidos.
- roteamento: `rait-secretary`/AUDITOR ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`DossierViewer` (§5.2); `SealedDossierViewer` (§5.3, arquivo).

## Chaves i18n

- `rait.screens.arquivo-casos-id.title` — "Dossiê final selado"
- `rait.screens.arquivo-casos-id.cmd.copy` — "Solicitar cópia"
