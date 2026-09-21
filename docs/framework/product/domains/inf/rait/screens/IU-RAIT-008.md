---
id: IU-RAIT-008
title: Triagem de admissibilidade — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-918, REF-CTB-extracts-raw]
updated: 2026-09-21
---

Ficha da rota `casos/:id/triagem` (`rait-web-frontend.md` §4; tela T-03 de [IU-RAIT-001]).
Fontes: [UC-RAIT-002], [JRN-RAIT-001], [RN-RAIT-001], [RN-RAIT-005], [RN-RAIT-120], [RN-RAIT-122].

## 1. Identidade

- id: `IU-RAIT-008`; `path`: `casos/:id/triagem` (`route-manifest.md` #8).
- `screen`: `T-03`; módulo: `caso` (`rait-web-frontend.md` §2).
- página: `TriagePage`; componente inteligente: `AdmissibilityChecklist` (`rait-web-frontend.md`
  §5.2, §5.3).
- nível: `L2` (`route-manifest.md`).
- slug i18n: `casos-id-triagem`.

## 2. Acesso

- papéis: `rait-analyst`, `rait-secretary` (`route-manifest.md` #8).
- guardas: as de `/casos/:id` (`raitAuthGuard`, `roleGuard(['rait-analyst', 'rait-secretary'])`,
  `caseAccessGuard` pendente) + `roleGuard` próprio desta aba.
- chaves de política: `inf:rait-case:triage` (registrar os 4 vereditos), `inf:rait-case:admit` /
  `inf:rait-case:reject` (concluir) (`rait-web-frontend.md` §7).
- pré-condição: caso em `PROTOCOLADO` (para iniciar a triagem) ou `TRIAGEM_ADMISSIBILIDADE`
  ([WF-RAIT-001]; [UC-RAIT-002] Pré-condições).
- é a aba inicial para `rait-analyst` quando a URL termina em `/casos/:id` (`route-manifest.md`
  §C; escolha só por papel via `canMatch`, sem depender do `state` do caso — dependência de
  `state` fica `OD-R12-004`, já registrada pelo TASK-0001).

## 3. Entrada

- de onde se chega: `/fila/defesa` após "puxar próximo" ([JRN-RAIT-001] passo 2); aba inicial do
  layout para `rait-analyst`.
- parâmetros de rota: `:id` (herdado do layout).
- deep-link canônico: `/casos/:id/triagem`.

## 4. Dados

- resolver: "4 critérios de admissibilidade" (`route-manifest.md` #8; [UC-RAIT-002]).
- clientes: `data/api/case.client.ts` (`RaitCase`, admissibilidade).
- calculado do backend: veredito de tempestividade produzido pelo motor de prazos único
  ([RN-RAIT-005]), com termo inicial, prazo aplicável e vencimento visíveis, sem campo editável
  (AC-RAIT-002-1); vencimento em dia não útil já prorrogado antes do juízo (AC-RAIT-002-2).
- demais critérios são julgamento humano registrado pelo analista/secretaria: legitimidade
  ([RN-RAIT-120]), assinatura, pedido compatível ([RN-RAIT-001]).

## 5. Estados

- **carregando**: skeleton do `AdmissibilityChecklist`.
- **vazio**: não se aplica — o caso sempre existe (resolvido pelo layout).
- **erro recuperável**: falha ao salvar veredito parcial; mantém o preenchido, retry.
- **sem permissão**: papel fora de `rait-analyst`/`rait-secretary` — `RAIT.FORBIDDEN_ACTION` (403).
- **conflito**: `RAIT.CASE_STATE_INVALID` (409) — caso já triado por outro agente; recarrega com
  os dados atuais.
- **erro de negócio**: `RAIT.TRIAGE_TIMELINESS_READONLY` (422, catálogo §3.5) — tentativa de
  editar o veredito de tempestividade calculado; `RAIT.PROCURATION_UNVERIFIED` (422, catálogo
  §3.3) — procurador sem instrumento verificado.

## 6. Comandos

| Ação (`recurso:ação`) | Papel                            | Pré-estado → pós-estado                                    | Comando                                                                                      | Confirmação com efeito jurídico                                                       | Erros esperados                                                  |
| --------------------- | -------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `rait.case:triage`    | `rait-analyst`, `rait-secretary` | `TRIAGEM_ADMISSIBILIDADE` (checklist salvo, sem transição) | `POST /v1/inf/rait/cases/{id}/admissibility` (endpoint de comando: R-0007 CTG-0004)          | — (registro do checklist, sem efeito jurídico próprio)                                | `RAIT.TRIAGE_TIMELINESS_READONLY`, `RAIT.PROCURATION_UNVERIFIED` |
| `rait.case:admit`     | `rait-analyst`                   | `TRIAGEM_ADMISSIBILIDADE`→`ADMITIDO`                       | `POST /v1/inf/rait/cases/{id}/commands/admit` (endpoint de comando: R-0007 CTG-0004)         | "Ao admitir, o efeito suspensivo é instaurado" ([RN-RAIT-108]; AC-RAIT-002-6)         | `RAIT.TRIAGE_INCOMPLETE`                                         |
| `rait.case:reject`    | `rait-analyst`                   | `TRIAGEM_ADMISSIBILIDADE`→`NAO_CONHECIDO`                  | `POST /v1/inf/rait/cases/{id}/commands/non-admission` (endpoint de comando: R-0007 CTG-0004) | "Ao não conhecer, o caso é comunicado ao requerente com o fundamento" ([RN-RAIT-109]) | `RAIT.TRIAGE_INCOMPLETE`, `RAIT.NON_ADMISSION_REASON_REQUIRED`   |

- `If-Match` sempre exigido (`rait-web-frontend.md` §7).
- documento do próprio órgão (NA/NP/AIT) nunca reprova a admissibilidade — o sistema recusa esse
  motivo e abre tarefa de anexação de ofício (AC-RAIT-002-4; [RN-RAIT-003]).
- intempestivo em `instancia=jari`: arquivado, sem efeito suspensivo desde a interposição
  (AC-RAIT-002-5; [RN-RAIT-109]).
- órgão incompetente: abre tarefa de redirecionamento com devolução do prazo, não gera não
  conhecimento (AC-RAIT-002-7; [RN-RAIT-122]).

## 7. Saída

- "admitir" bem-sucedido segue para instrução (`/casos/:id/dossie`), com o caso em
  `AGUARDANDO_REMESSA_JARI` (`instancia=jari`) ou `DISTRIBUIDO` direto (`defesa_previa`/`cetran`)
  (`rait-web-frontend.md` §6.6).
- "não conhecer" segue para comunicação ao requerente ([UC-RAIT-002] passo 6).

## 8. Segurança e LGPD

- o checklist não exibe o texto livre da petição fora do contexto de instrução deste caso
  específico ([RN-RAIT-134]).
- dados de terceiro citados na exposição de fatos ficam suprimidos ([RN-RAIT-137]).

## 9. Acessibilidade e atalhos

- `t` abre esta aba a partir do layout do caso (`rait-web-frontend.md` §10).
- vereditos exigidos individualmente, com foco no primeiro pendente; risco/motivo nunca só por
  cor ([IU-RAIT-001] §4).

## 10. Testes

- roteamento: `rait-analyst`/`rait-secretary` ativam; demais papéis → `/sem-permissao` (M14).
- critérios ligados a [UC-RAIT-002]: AC-RAIT-002-1 (tempestividade calculada, não editável),
  AC-RAIT-002-2 (prorrogação a dia útil antes do juízo), AC-RAIT-002-3 (4 vereditos individuais),
  AC-RAIT-002-4 (documento do órgão nunca reprova), AC-RAIT-002-5 (intempestivo arquivado sem
  efeito suspensivo), AC-RAIT-002-6 (admissão instaura efeito suspensivo), AC-RAIT-002-7 (órgão
  incompetente devolve prazo).
- estados carregando/conflito/erro de negócio como critérios.

## Componentes compartilhados

`AdmissibilityChecklist`, `DeadlineChip`, `LegalBasisTooltip` (`rait-web-frontend.md` §5.2).

## Chaves i18n

- `rait.screens.casos-id-triagem.title` — "Triagem de admissibilidade"
- `rait.screens.casos-id-triagem.intro` — "Confira os quatro critérios antes de admitir ou não conhecer."
- `rait.screens.casos-id-triagem.field.tempestividade` — "Tempestividade"
- `rait.screens.casos-id-triagem.field.legitimidade` — "Legitimidade"
- `rait.screens.casos-id-triagem.field.assinatura` — "Assinatura"
- `rait.screens.casos-id-triagem.field.pedido` — "Pedido compatível com os fatos"
- `rait.screens.casos-id-triagem.cmd.admit` — "Admitir"
- `rait.screens.casos-id-triagem.cmd.reject` — "Não conhecer"
