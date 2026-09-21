---
id: IU-RAIT-041
title: Produção e metas — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-DETRANAM-SERVICOS, REF-LEI-13460-2017]
updated: 2026-09-21
---

Ficha da rota `gestao/producao` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-040], [JRN-RAIT-004].

## 1. Identidade

- id `IU-RAIT-041`; `path`: `gestao/producao` (route-manifest.md #42); `screen`: `—`.
- módulo `gestao`; página `ProductionPage` (§5.3).
- nível `L1` — lista/leitura pelos clientes CRUD existentes de `BP-INF-RAIT-WORKLIST-001`
  (route-manifest.md, M13); slug i18n `gestao-producao`.

## 2. Acesso

- papéis: `rait-manager`, `rait-coordinator` (route-manifest.md linha 42).
- guardas: `raitAuthGuard`; `roleGuard(['rait-manager', 'rait-coordinator'])`.
- tela de leitura; nenhuma chave de comando própria.

## 3. Entrada

- chega-se pela navegação do módulo `gestao` ou pelo redirect de `/gestao` para
  `rait-coordinator` (route-manifest.md §B).
- aceita `?q=&ordem=&filtro=` para período e unidade.

## 4. Dados

- resolver: "produção, metas, taxa de provimento" (route-manifest.md).
- leitura pelo cliente CRUD do worklist (`worklist.client.ts`), nível L1 — sem facade dedicada
  nesta rodada.
- indicadores ([UC-RAIT-040] fluxo 1): tempo por fase (mediana, p90), backlog por fila com idade,
  casos por revisor/relator, aderência ao SLA local (30 dias), % em risco por relógio, sessões
  realizadas/adiadas, taxa de provimento por enquadramento, achados de qualidade ([UC-RAIT-025]).
- meta operacional (SLA 30 dias) e teto legal são indicadores **distintos**, nunca no mesmo
  componente com a mesma ênfase ([UC-RAIT-040] AC-RAIT-040-1; [IU-RAIT-001] §2).

## 5. Estados

- **carregando**: esqueleto dos `KpiTile`.
- **vazio**: "sem dados de produção no período" (`rait.screens.gestao-producao.empty`).
- **erro recuperável**: retry.
- **sem permissão**: banner `rait.errors.forbidden`.

## 6. Comandos

Tela de leitura. O "relatório de problemas sistemáticos ao TEAT" ([UC-RAIT-040] AC-RAIT-040-2)
não tem nome de comando nem endpoint no catálogo `rait-web-frontend.md` §7 — proposto
**OD-R12-015**: nomear o comando/endpoint que gera e envia esse relatório.

## 7. Saída

- comparação de períodos/unidades permanece na mesma tela (estado local de filtro na URL).

## 8. Segurança e LGPD

- produtividade individual só visível ao coordenador e ao próprio membro; comparação nominal
  entre membros só em nível de gestão, com finalidade registrada ([UC-RAIT-040] 1a; LGPD).

## 9. Acessibilidade e atalhos

- `KpiTile`/`TrendChart` com texto explícito, não só cor; contraste AA.

## 10. Testes

- AC-RAIT-040-1 — meta operacional e teto legal como indicadores distintos.
- AC-RAIT-040-2 — relatório de problemas sistemáticos gerado por trimestre com enquadramento/AITs.
- AC-RAIT-040-3 — prazo publicado usa a mesma definição de início/fim do indicador medido.
- roteamento: `rait-manager` e `rait-coordinator` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`KpiTile`, `TrendChart` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.gestao-producao.title` — "Produção e metas"
- `rait.screens.gestao-producao.empty` — "Sem dados de produção no período"
