---
id: IU-RAIT-019
title: Protocolo — lista de intake do dia — especificação de tela
status: draft
apps: [rait]
sources:
  [
    REF-CONTRAN-900,
    REF-DETRANAM-SERVICOS,
    REF-DETRANAM-PORTARIA-5046,
    REF-CETRAN-PROCESSO-INTERNO,
  ]
updated: 2026-09-21
---

Ficha da rota `/protocolo` (`rait-web-frontend.md` §4; tela T-08 de [IU-RAIT-001]).
Fontes: [UC-RAIT-001], [JRN-RAIT-003], [RN-RAIT-002], [RN-RAIT-106].

## 1. Identidade

- id: `IU-RAIT-019`; rota: `/protocolo` (`route-manifest.md` #18); `screen: 'T-08'`.
- módulo: `protocolo` — "intake físico e digitalização (T-08), pendências, remessas,
  redirecionamentos, desistências (T-17)" (`rait-web-frontend.md` §2).
- página: `IntakeListPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #18).
- slug i18n: `protocolo` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #18).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4); esta rota não é "todos com
  acesso" — sem `caseAccessGuard`.
- chave de política: a lista é só leitura; a ação "novo intake" avalia
  `inf:rait-case:protocol` na tela de destino (`/protocolo/novo`, §7).
- pré-condição de estado: nenhuma — lista casos em `PROTOCOLADO` ([WF-RAIT-001]) aguardando
  digitalização/triagem, fila F-DP-0 (`WF-RAIT-004` §2.1).

## 3. Entrada

- de onde se chega: `RoleHomeRedirect` a partir de `/` para `rait-secretary`
  (`route-manifest.md` tabela B); [JRN-RAIT-003] passo 1; JW-03 passo 1.
- parâmetros de rota: nenhum.
- lista: `?q=&ordem=&filtro=` sincronizados com o estado da tabela (`rait-web-frontend.md` §4).
- deep-link canônico: `/protocolo` sem parâmetros.

## 4. Dados

- resolver: "lista de intake do dia" (`route-manifest.md` #18); `GET cases?state=PROTOCOLADO`
  (JW-03 passo 1).
- cliente gerado: `data/api/case.client.ts` (`rait-web-frontend.md` §8), recurso
  `/v1/inf/rait/cases`.
- campos exibidos: protocolo, canal de entrada, requerente, AIT, `instancia`/`circuito`
  ([UC-RAIT-001] AC-RAIT-001-4), data/hora de protocolo, pendência aberta (se houver).
- calculado do backend: `data_marco_tempestividade`, distinta de `data_recebimento_interno`
  ([RN-RAIT-106]) — o cliente nunca recalcula a data do marco.

## 5. Estados

- carregando: skeleton da tabela.
- vazio: "nenhum caso protocolado hoje" (`rait.common.*` da semente).
- erro recuperável: falha transitória de leitura — retry, mantém o filtro aplicado.
- sem permissão: 403 `RAIT.FORBIDDEN_ACTION` → banner "sem permissão para esta ação"
  (`rait-error-catalog.md` §4).
- conflito: não se aplica — tela de leitura, sem comando próprio.
- indisponível: não se aplica (`L2`, sem dependência da §11).

## 6. Comandos

Tela de leitura. A única ação é navegar a `/protocolo/novo`; os comandos de protocolo ficam na
ficha daquela rota (IU-RAIT-020). Nenhum comando de mudança de estado é disparado aqui.

## 7. Saída

- ação "novo intake" leva a `/protocolo/novo`.
- linha da lista abre o caso em `/casos/:id/resumo` (aba herdada, todos os papéis têm acesso).
- SSE: `case.changed` (`rait-web-frontend.md` §8) atualiza a lista quando um caso é protocolado
  por outro canal (Portal).

## 8. Segurança e LGPD

- dados do requerente exibidos conforme o papel; texto livre da petição ("exposição de fatos")
  nunca aparece na lista ([RN-RAIT-134]).
- terceiro citado na petição é suprimido na lista ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k` navega a lista, `enter` abre o caso (`rait-web-frontend.md` §10).
- foco visível na linha ativa; `aria-live` anuncia atualização da lista por SSE.
- pendência aberta nunca só por cor — rótulo textual "pendência aberta" ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-secretary` ativa a rota; demais papéis canônicos → `/sem-permissao` (M14).
- estados: vazio, erro recuperável, sem permissão — critérios ligados a [UC-RAIT-001].
- SSE: entrada de novo caso pelo Portal atualiza a lista sem recarregar a página.

## Componentes compartilhados

`QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.protocolo.title` — "Protocolo — intake do dia"
- `rait.screens.protocolo.intro` — "Casos protocolados hoje, aguardando digitalização ou triagem"
- `rait.screens.protocolo.empty` — "Nenhum caso protocolado hoje"
- `rait.screens.protocolo.cmd.new` — "Novo intake"
