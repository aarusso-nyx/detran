---
id: IU-RAIT-057
title: Busca de autos encerrados — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-13709-2018]
updated: 2026-09-21
---

Ficha da rota `arquivo/busca` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-024].

## 1. Identidade

- id `IU-RAIT-057`; `path`: `arquivo/busca` (route-manifest.md #62); `screen`: `—`.
- módulo `arquivo`; página `ArchiveSearchPage` (§5.3).
- nível `L2`; slug i18n `arquivo-busca`.

## 2. Acesso

- papéis: `rait-secretary`, AUDITOR (route-manifest.md linha 62).
- guardas: `raitAuthGuard`; `roleGuard(['rait-secretary', 'AUDITOR'])`.
- pré-condição: caso em `TRANSITADO`, `NAO_CONHECIDO` comunicado ou `ENCERRADO_DESISTENCIA`;
  infração em estado terminal ([UC-RAIT-024] Pré-condições).

## 3. Entrada

- chega-se pelo redirect de `/arquivo` (route-manifest.md §B) ou pela navegação.
- aceita `?q=&ordem=&filtro=` para localizar por protocolo/AIT/período.

## 4. Dados

- resolver: "autos encerrados" (route-manifest.md).
- leitura via `ArchiveFacade` sobre `rait-case` (`documents`, `events`): dossiê final consolidado
  e selado (hash) ([UC-RAIT-024] fluxo 1).
- resultado abre em `/arquivo/casos/:id` ([IU-RAIT-058]).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.

## 6. Comandos

Tela de leitura/busca. O arquivamento em si é automático no encerramento do caso
([UC-RAIT-024] fluxo 1); nenhum comando de escrita nesta tela.

## 7. Saída

- resultado da busca abre o dossiê selado em `/arquivo/casos/:id`.

## 8. Segurança e LGPD

- dado de terceiro suprimido campo a campo já na lista de resultados ([RN-RAIT-137]).
- vista/cópia do interessado é atendida sem requerimento formal e sem custo
  ([RN-PORTAL-112]; [UC-RAIT-024] fluxo 3), mas ocorre na ficha do caso ([IU-RAIT-058]).

## 9. Acessibilidade e atalhos

- `j`/`k` navega resultados; `enter` abre o dossiê; contraste AA.

## 10. Testes

- AC-RAIT-024-3 — vista sem burocracia (dado de terceiro suprimido).
- roteamento: `rait-secretary`/AUDITOR ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

Nenhum de §5.2 aplica diretamente; tabela padrão STYNX de resultados.

## Chaves i18n

- `rait.screens.arquivo-busca.title` — "Busca de autos encerrados"
- `rait.screens.arquivo-busca.empty` — "Nenhum auto encontrado"
