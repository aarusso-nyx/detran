---
id: IU-RAIT-018
title: Conta — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `conta` (`rait-web-frontend.md` §4; sem tela própria em [IU-RAIT-001]). Fontes:
herdadas de [IU-RAIT-001] (inventário do console) — tela puramente técnica, sem caso de uso ou
jornada de produto dedicados nesta rodada.

## 1. Identidade

- id: `IU-RAIT-018`; `path`: `conta` (`route-manifest.md` #72).
- `screen`: `—`.
- módulo: `conta` (`rait-web-frontend.md` §2); componente inteligente: ações de topo do
  `RaitShellComponent` (busca por protocolo/AIT, tema, conta — `rait-web-frontend.md` §5.1).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `conta`.

## 2. Acesso

- papéis: `todos` (`route-manifest.md` #72).
- guardas: `raitAuthGuard` apenas — sem `roleGuard` restritivo, é acessível a qualquer sessão
  autenticada.
- sem chave de política própria: perfil e preferência de tema não são recursos protegidos por
  `inf:rait-*`.

## 3. Entrada

- de onde se chega: ação de topo do shell (`RaitShellComponent`), disponível em qualquer tela.
- parâmetros de rota: nenhum.
- deep-link canônico: `/conta`.

## 4. Dados

- resolver: "perfil, papéis ativos, tema" (`route-manifest.md` #72).
- clientes: `data/api/session.client.ts` (claims da sessão STYNX: `cognito:groups`/`roles`,
  `StynxSessionService.state().claims` — mesma fonte do backend, `rait-web-frontend.md` M4 do
  `plan.md`).
- calculado do backend: papéis ativos são a união das claims da sessão; não há edição de papel
  nesta tela (atribuição de papel é administrativa, fora do escopo do console RAIT).

## 5. Estados

- **carregando**: skeleton do perfil.
- **vazio**: não se aplica — a sessão sempre tem ao menos um papel canônico (senão o `roleGuard`
  de outras rotas já teria redirecionado a `/sem-permissao`).
- **erro recuperável**: falha ao carregar claims; retry.
- **sem permissão**: não se aplica — a rota é `todos`.
- **conflito**: não se aplica (sem comando de mutação).

## 6. Comandos

| Ação          | Papel   | Pré-estado → pós-estado                    | Comando                                                                                        | Confirmação | Erros esperados |
| ------------- | ------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------- | --------------- |
| alternar tema | `todos` | preferência local (inalterado no servidor) | `setDetranTheme` — persistida em `localStorage` do usuário (`rait-web-frontend.md` §10 item 7) | —           | —               |

- não há comando de mutação de servidor nesta tela; alteração de papel é administrativa e fica
  fora do escopo do console RAIT.

## 7. Saída

- não navega a outra rota por ação própria; a preferência de tema se aplica imediatamente ao
  shell.

## 8. Segurança e LGPD

- exibe apenas dados da própria sessão (nome, papéis ativos); nenhum dado de terceiro.
- nenhum token/segredo em tela, URL ou log.

## 9. Acessibilidade e atalhos

- contraste AA mantido em ambos os temas (light/dark); foco visível no seletor de tema.

## 10. Testes

- roteamento: qualquer sessão autenticada ativa a rota (M14); sem sessão → redireciona ao login.
- persistência da preferência de tema em `localStorage` como critério de aceitação.

## Componentes compartilhados

Ações de topo do `RaitShellComponent` (`rait-web-frontend.md` §5.1).

## Chaves i18n

- `rait.screens.conta.title` — "Conta"
- `rait.screens.conta.intro` — "Perfil, papéis ativos e preferência de tema."
- `rait.screens.conta.field.theme` — "Tema"
