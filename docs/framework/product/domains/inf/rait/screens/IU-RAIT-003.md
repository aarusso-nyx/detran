---
id: IU-RAIT-003
title: Bandeja "prontos para retomar" — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `painel/retomar` (`rait-web-frontend.md` §4; tela T-06 de [IU-RAIT-001]).
Fontes: [UC-RAIT-003], [JRN-RAIT-001].

## 1. Identidade

- id: `IU-RAIT-003`; `path`: `painel/retomar` (`route-manifest.md` #3).
- `screen`: `T-06`; módulo: `painel` (`rait-web-frontend.md` §2).
- página: `ResumeTrayPage`; componente inteligente: `ResumeTrayList` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `painel-retomar`.

## 2. Acesso

- papéis: `rait-analyst`, `rait-rapporteur` (`route-manifest.md` #3).
- guardas: `raitAuthGuard` + `roleGuard(['rait-analyst', 'rait-rapporteur'])`.
- sem chave de política própria de comando: a bandeja é leitura; a retomada em si abre a tela do
  caso (`/casos/:id/dossie`), onde as ações de instrução ficam sujeitas às chaves `inf:rait-case:*`.
- pré-condição: caso em `DILIGENCIA` com resposta anexada ou com `T-DIL` vencido ([RN-RAIT-004]),
  ou caso em `EM_INSTRUCAO` interrompido cuja leitura o responsável retoma ([JRN-RAIT-001] passo 5).

## 3. Entrada

- de onde se chega: cartão do `/painel` ("prontos para retomar"); notificação lateral quando uma
  diligência de outro caso responde, empilhada nesta bandeja sem forçar troca de contexto
  ([JRN-RAIT-001] passo 5).
- parâmetros de rota: nenhum.
- `?q=&ordem=&filtro=`: aceita filtro por motivo de retomada (resposta recebida × prazo vencido),
  sincronizado com o estado da tabela (`rait-web-frontend.md` §4).
- deep-link canônico: `/painel/retomar`.

## 4. Dados

- resolver: "bandeja 'prontos para retomar'" (`route-manifest.md` #3; [UC-RAIT-003]).
- clientes: `data/api/case.client.ts`, `data/api/worklist.client.ts` (fila `F-DP-4`,
  [WF-RAIT-004] §2.1).
- calculado do backend: motivo de retomada (resposta tempestiva × `T-DIL` vencido) e ordem única
  (risco → prioridade legal → cronológica, [RN-RAIT-141]) — nunca recalculados no cliente.

## 5. Estados

- **carregando**: skeleton da lista.
- **vazio**: nenhum caso pronto para retomar no momento — mensagem, sem bloquear navegação.
- **erro recuperável**: falha ao carregar a bandeja; retry.
- **sem permissão**: papel fora de `rait-analyst`/`rait-rapporteur` não acessa a rota — resolvido
  pelo `roleGuard` (`UrlTree('/sem-permissao')`, `rait.errors.forbidden`).
- **conflito**: item retomado por engano após já ter avançado de estado — `RAIT.CASE_STATE_INVALID`
  (409, catálogo §3.5): recarrega a bandeja.

## 6. Comandos

| Ação                 | Papel                             | Pré-estado → pós-estado                                                                               | Comando                                                             | Confirmação              | Erros esperados |
| -------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------ | --------------- |
| abrir caso (retomar) | `rait-analyst`, `rait-rapporteur` | `DILIGENCIA`→`EM_INSTRUCAO` ou `PRONTO_P_DECISAO` conforme o vencimento (`rait-web-frontend.md` §6.6) | navegação a `/casos/:id/dossie` (sem comando de mutação nesta tela) | nenhuma (é só navegação) | —               |

- não há comando de mutação disparado por esta tela; a decisão sobre o caso ocorre nas abas do
  caso (dossiê, diligências, minuta), cada uma com o próprio `If-Match`.

## 7. Saída

- clique num item navega a `/casos/:id/dossie` mantendo o contexto do caso; o item sai da bandeja
  quando o responsável reabre e avança o caso.

## 8. Segurança e LGPD

- lista não exibe texto livre da petição ([RN-RAIT-134]); mostra apenas identificação do caso,
  motivo de retomada e prazo.

## 9. Acessibilidade e atalhos

- `j`/`k` navegam a lista; `enter` abre o item selecionado (`rait-web-frontend.md` §10).
- risco de prazo comunicado por rótulo textual, nunca só por cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-analyst`/`rait-rapporteur` ativam; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-003] (AC-RAIT-003-3, diligência vencida avança sem arquivar;
  AC-RAIT-003-6, resposta tempestiva retoma a instrução).
- estados vazio/carregando/erro/conflito como critérios de aceitação.

## Componentes compartilhados

`ResumeTrayList`, `DeadlineChip`, `RiskFlag` (`rait-web-frontend.md` §5.2, §5.3).

## Chaves i18n

- `rait.screens.painel-retomar.title` — "Prontos para retomar"
- `rait.screens.painel-retomar.intro` — "Casos que responderam à diligência ou cujo prazo venceu."
- `rait.screens.painel-retomar.empty` — "Nenhum caso pronto para retomar."
