---
id: IU-RAIT-033
title: Colegiado — calendário e lista de sessões — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/sessoes` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001] — antecede T-12).
Fontes: [JRN-RAIT-002], [RN-RAIT-139], [RN-RAIT-142].

## 1. Identidade

- id: `IU-RAIT-033`; rota: `/colegiado/:orgao/sessoes` (`route-manifest.md` #33);
  `screen: '—'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `SessionsPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #33).
- slug i18n: `colegiado-orgao-sessoes` (`route-manifest.md` §A).

## 2. Acesso

- papéis: `rait-chair`, `rait-secretary`, `rait-rapporteur` (`route-manifest.md` #33).
- guardas: `raitAuthGuard` +
  `roleGuard(['rait-chair', 'rait-secretary', 'rait-rapporteur'])` (M4).
- chave de política: tela de leitura, sem chave própria — ações de comando ficam nas sub-rotas
  (`/sessoes/:id`, `/sessoes/:id/banca`, `/sessoes/:id/ata`).
- pré-condição: nenhuma além da sessão STYNX ativa; calendário publicado com antecedência pelo
  presidente e pela secretaria (`WF-RAIT-004` §3).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/pauta` (após fechar pauta); JW-04 passo 6; JW-08 passo 3.
- parâmetros de rota: `:orgao`.
- lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/colegiado/jari/sessoes`.

## 4. Dados

- resolver: "calendário e lista de sessões" (`route-manifest.md` #33).
- cliente gerado: `data/api/session.client.ts`.
- campos exibidos: data/hora, estado da sessão (`FORMANDO_PAUTA` · `PAUTA_FECHADA` ·
  `CONVOCACAO_ENVIADA` · `SESSAO_ABERTA` · `SESSAO_ADIADA` · ... — `WF-RAIT-003` §Estados),
  ordinária/extraordinária, banca prevista.
- calculado do backend: nenhum cálculo local de data ou prazo — calendário e estado vêm do
  backend (`rait-web-frontend.md` §1, "não recalcula prazo legal").

## 5. Estados

- carregando: skeleton do calendário/lista.
- vazio: "nenhuma sessão agendada".
- erro recuperável: falha transitória — retry.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO` → banner "sem permissão para esta ação".
- conflito: não se aplica (tela de leitura).
- indisponível: não se aplica (`L2`).

## 6. Comandos

Tela de leitura. Os comandos de sessão (`rait-session:open`/`adjourn`) ficam na ficha
`/colegiado/:orgao/sessoes/:id` (IU-RAIT-034); os de banca, em IU-RAIT-035; os de ata, em
IU-RAIT-036. Nenhum comando de mudança de estado é disparado aqui.

## 7. Saída

- linha da sessão abre `/colegiado/:orgao/sessoes/:id`.
- SSE: `session.changed` (`rait-web-frontend.md` §8) atualiza a lista quando uma sessão muda de
  estado (ex.: `CONVOCACAO_ENVIADA` → `SESSAO_ABERTA`).

## 8. Segurança e LGPD

- lista não expõe conteúdo de pauta além do necessário à navegação; texto livre da petição nunca
  aparece aqui ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir a sessão (`rait-web-frontend.md` §10).
- foco visível; sessões adiadas sinalizadas por rótulo textual, não só cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-chair`/`rait-secretary`/`rait-rapporteur` ativam; demais papéis canônicos →
  `/sem-permissao` (M14).
- estados: vazio; erro recuperável.
- SSE: atualização de estado da sessão sem recarregar a página.

## Componentes compartilhados

`QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-sessoes.title` — "Sessões"
- `rait.screens.colegiado-orgao-sessoes.intro` — "Calendário e lista de sessões do colegiado"
- `rait.screens.colegiado-orgao-sessoes.empty` — "Nenhuma sessão agendada"
