---
id: IU-RAIT-049
title: Folha de jeton (remuneração por sessão) — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022, REF-JARI-ORGANIZACAO-BENCHMARK]
updated: 2026-09-21
---

Ficha da rota `organizacao/jeton` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-036], [JRN-RAIT-003].

## 1. Identidade

- id `IU-RAIT-049`; `path`: `organizacao/jeton` (route-manifest.md #51); `screen`: `—`.
- módulo `organizacao`; página `JetonPage`, componente inteligente `JetonSheet` (§5.3).
- nível `L0`; slug i18n `organizacao-jeton`.

## 2. Acesso

- papéis: `rait-secretary`, `rait-hr` (route-manifest.md linha 51).
- guardas: `raitAuthGuard`; `roleGuard(['rait-secretary', 'rait-hr'])`.
- chave de política: `inf:rait-jeton:generate`, `inf:rait-jeton:approve` (`rait-web-frontend.md` §7).

## 3. Entrada

- chega-se pelo redirect de `/organizacao` para `rait-secretary` (route-manifest.md §B) ou pela
  navegação.

## 4. Dados

- resolver da rota: "folha de remuneração por sessão — §11 linha 8 (jeton pendente)"
  (route-manifest.md).
- dependência: `rait-web-frontend.md` §11 linha 8 — "Jeton (folha) e exportações assinadas" —
  módulo FE `organizacao`/`auditoria` — situação **pendente**; "regra local do AM sem fonte".
- regra local de jeton (valor, teto mensal, condições) **fonte pendente** — legislação/regimento
  do AM não localizados; benchmark em [REF-JARI-ORGANIZACAO-BENCHMARK] ([UC-RAIT-036]
  Pré-condições); **OD-012** (`open-decisions-rait.md` §A) e steering item 57 ("jeton permanece
  pendente de fonte").
- desenho pretendido: consolidação por membro (sessões com presença válida, itens relatados,
  votos, faltas), regra parametrizada (valor por sessão, teto mensal, relatoria mínima) — memória
  de cálculo por membro ([UC-RAIT-036] fluxo 1-3).

## 5. Estados

- **indisponível nesta versão** (`rait.states.unavailable_in_version`) citando
  `rait-web-frontend.md` §11 linha 8 — sem mock silencioso.
- **parâmetro sem fonte bloqueia**: mesmo com a dependência resolvida, folha não é gerada com
  valores até o parâmetro ser cadastrado ([UC-RAIT-036] AC-RAIT-036-3; `RAIT.PARAMETER_SOURCE_PENDING`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel            | Pré-estado → pós-estado                     | Comando                                         | Confirmação                                                                                          | Erros esperados               |
| --------------------- | ---------------- | ------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------- |
| `rait.jeton:generate` | `rait-secretary` | sessões com ata assinada → folha do período | `POST /v1/inf/rait/jeton-sheets` (pendente, §7) | "cada linha aponta as sessões, presenças e relatorias que a sustentam" ([UC-RAIT-036] AC-RAIT-036-1) | `RAIT.JETON_MINUTES_UNSIGNED` |
| `rait.jeton:approve`  | `rait-chair`     | folha gerada → folha homologada             | `POST /v1/inf/rait/jeton-sheets` (pendente, §7) | —                                                                                                    | `RAIT.JETON_ALREADY_APPROVED` |

- `endpoint de comando: R-0007 CTG-0004`, **além** da dependência de §11 linha 8.
- teto mensal aplicado automaticamente ([UC-RAIT-036] AC-RAIT-036-2); sessão além do teto marcada
  não remunerada com anuência prévia registrada ([UC-RAIT-036] 2a → [UC-RAIT-021] 2a).

## 7. Saída

- folha enviada ao RH/financeiro por integração ou arquivo assinado; eventos de pagamento
  retornam para conciliação ([UC-RAIT-036] fluxo 4).
- contestação do membro: retificação com nova homologação, histórico preservado
  ([UC-RAIT-036] 3a).

## 8. Segurança e LGPD

- memória de cálculo é auditável, sem exposição de dado de terceiro ao requerente/procurador.

## 9. Acessibilidade e atalhos

- `JetonSheet` navegável por teclado; contraste AA.

## 10. Testes

- AC-RAIT-036-1 — folha nasce dos registros de sessão.
- AC-RAIT-036-2 — teto mensal aplicado automaticamente.
- AC-RAIT-036-3 — parâmetro sem fonte bloqueia a geração de valores.
- roteamento: `rait-secretary`/`rait-hr` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`JetonSheet` (§5.3, organizacao); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.organizacao-jeton.title` — "Folha de jeton"
- `rait.screens.organizacao-jeton.cmd.generate` — "Gerar folha do período"
- `rait.screens.organizacao-jeton.cmd.approve` — "Homologar folha"
