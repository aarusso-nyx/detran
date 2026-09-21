---
id: IU-RAIT-017
title: Histórico do caso — especificação de tela
status: draft
apps: [rait]
sources: [REF-LEI-13709-2018, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/historico` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001], aba do layout T-04). Fontes: [UC-RAIT-042], [WF-RAIT-001] §Eventos de domínio,
[RN-RAIT-134], [RN-RAIT-137].

## 1. Identidade

- id: `IU-RAIT-017`; `path`: `casos/:id/historico` (`route-manifest.md` #17).
- `screen`: `—`.
- módulo: `caso`; componente inteligente: `EventTimeline` (`rait-web-frontend.md` §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-historico`.

## 2. Acesso

- papéis: `todos` (`route-manifest.md` #17).
- guardas: as de `/casos/:id` (`raitAuthGuard`, `roleGuard`, `caseAccessGuard` pendente).
- sem chave de política própria: tela de leitura ([UC-RAIT-042] AC-RAIT-042-1 — mesmo o auditor
  não edita, só lê e exporta).

## 3. Entrada

- de onde se chega: navegação de aba a partir de `/casos/:id`.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/historico`.

## 4. Dados

- resolver: "eventos e trilha" (`route-manifest.md` #17).
- clientes: `data/api/case.client.ts` (`RaitCaseEvent`).
- calculado do backend: sequência cronológica de atores, atos e transições de estado, com hash de
  eventos ([UC-RAIT-042] passo 1); eventos de domínio publicados por [WF-RAIT-001] §Eventos
  (`RAIT_CASO_PROTOCOLADO`, `RAIT_EFEITO_SUSPENSIVO_INSTAURADO`,
  `RAIT_RECURSO_RECEBIDO_JULGADOR`, `RAIT_DECISAO_PUBLICADA`, `RAIT_CASO_TRANSITADO`,
  `RAIT_ALERTA_PRESCRICAO`) aparecem na trilha.

## 5. Estados

- **carregando**: skeleton do `EventTimeline`.
- **vazio**: não se aplica — todo caso tem ao menos o evento de protocolo.
- **erro recuperável**: falha ao carregar a trilha; retry.
- **sem permissão**: herdada do layout — `RAIT.FORBIDDEN_CASE_SCOPE` (403).
- **indisponível (parcial)**: caso anonimizado por retenção — trilha estatística disponível, dado
  pessoal indisponível por política, com registro ([UC-RAIT-042] 1a).

## 6. Comandos

Nenhum comando de mutação — é a trilha de auditoria do caso, só leitura ([UC-RAIT-042]
AC-RAIT-042-1: o auditor não edita).

## 7. Saída

- não navega a outra rota por ação própria; SSE (`case.changed`) acrescenta novos eventos à
  trilha sem reload.

## 8. Segurança e LGPD

- dados pessoais do requerente/procurador só com base legal registrada; terceiros suprimidos
  ([RN-RAIT-137]); texto livre da petição não aparece na trilha fora do contexto de instrução
  deste caso ([RN-RAIT-134]).
- exportação da trilha (fora do lote A, em `/auditoria/exportacoes`) exige finalidade e é
  assinada e registrada ([UC-RAIT-042] passo 3).

## 9. Acessibilidade e atalhos

- foco visível na navegação da linha do tempo; nenhuma informação de risco só por cor
  ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `todos` ativam a leitura (M14).
- critérios ligados a [UC-RAIT-042]: AC-RAIT-042-1 (auditor não edita, só leitura e exportação).
- estado "anonimizado por retenção" como critério de aceitação.

## Componentes compartilhados

`EventTimeline`, `CaseHeader` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-historico.title` — "Histórico do caso"
- `rait.screens.casos-id-historico.intro` — "Eventos e trilha de auditoria do caso."
- `rait.screens.casos-id-historico.state.anonymized` — "Dados pessoais indisponíveis por retenção"
