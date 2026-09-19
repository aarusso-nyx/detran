---
id: IU-PORTAL-T04
title: Assistente de recurso ao CETRAN — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-918,
    REF-CTB-extracts-raw,
    REF-DETRANAM-SERVICOS,
    REF-CONTRAN-900,
    REF-CONTRAN-931,
    REF-BENCH-ESTADOS,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-04. Fontes: [UC-PORTAL-003], [JRN-PORTAL-001], [RN-PORTAL-101],
[RN-PORTAL-105], [RN-PORTAL-106], [RN-PORTAL-111].

## 1. Identidade

- id: `T-04`; nome visível: "Assistente de recurso ao CETRAN".
- app: `portal`; módulo: `defesa` (`portal-frontends.md` §4).
- rota: `/processos/:requestId/cetran/nova` (`route-manifest.md` #20); `screen: 'T-04'`,
  `sheet: 'IU-PORTAL-T04'`.

## 2. Acesso

- ator: CIDADAO nível avançada — mesma matriz de defesa/recurso ([RN-PORTAL-101] linha 6).
- `access`: `avancada`; guardas `portalAuthGuard` + `assuranceGuard('avancada')` →
  `entitlementGuard('request')` sobre `:requestId`; `serviceAvailabilityGuard('recurso_cetran')`
  (`route-manifest.md` #20).
- pré-condição: decisão da JARI publicada/notificada negando o recurso; prazo de 30 dias da
  publicação/notificação em aberto ([REF-CTB-extracts-raw] art. 288; [UC-PORTAL-003]
  Pré-condições).

## 3. Entrada

- de onde se chega: T-10 (tela de decisão da JARI), com o caminho "Recorrer ao CETRAN" já destacado
  quando o resultado é negativo ([UC-PORTAL-003] passo 1).
- rascunho persistido no servidor por `requestId`.

## 4. Dados

- `POST /v1/portal/requests` `{ serviceKey: 'recurso_cetran', targetKind: 'case', targetId: <case
do recurso JARI de origem>, channel: 'portal' }` → `{ requestId, state:
PEDIDO_EM_COMPOSICAO, prefilled{ parecer e conclusão da JARI já anexados }, requirements[],
minimumAssurance }`.
- `PUT requests/{id}/draft` `{ additionalText?, attachmentIds[] }` — parecer e conclusão da JARI
  anexados **de ofício pelo servidor**, não editáveis pelo cidadão (`portal-route-contract.md` §5.1;
  [IU-PORTAL-001] nota T-04).
- `POST requests/{id}/submit` `{ signature }` (`Idempotency-Key`
  `recurso_cetran:<requestId>:<fingerprint>`) → `PROTOCOLADO` → delegação `inf:rait-case:protocol`
  (`instance=cetran`, origem = caso JARI).

## 5. Estados

- **carregando**: skeleton, incluindo o carregamento do parecer anexado de ofício.
- **vazio**: não se aplica.
- **sem elegibilidade**: janela de 30 dias vencida → `PORTAL.APPEAL_CETRAN_WINDOW_CLOSED` (`dueOn`)
  — sistema informa o vencimento e não permite o protocolo por este caminho, orientando contato com
  o órgão para hipóteses excepcionais ([UC-PORTAL-003] 1a).
- **erro recuperável**: falha transitória ao carregar o dossiê anexado de ofício → retry.
- **sem permissão**: nível insuficiente ao assinar → passo guiado embutido.
- **indisponível**: serviço `recurso_cetran` `unavailable` → `/servico-indisponivel/recurso_cetran`.
- **sucesso**: confirmação explica, em linguagem direta, que esta é a **última instância
  administrativa** — não caberá novo recurso administrativo ([UC-PORTAL-003] AC-PORTAL-003-2,
  CTB art. 290).

## 6. Comandos

| Rótulo (chave i18n)             | Nível    | Validação de forma                                    | Idempotência                               | Efeito                                                                  |
| ------------------------------- | -------- | ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| "Enviar recurso" (`cmd.submit`) | avançada | texto adicional opcional; parecer da JARI obrigatório | `recurso_cetran:<requestId>:<fingerprint>` | `submit` → `PROTOCOLADO` → `inf:rait-case:protocol` (`instance=cetran`) |
| "Salvar rascunho" (`cmd.draft`) | avançada | —                                                     | —                                          | `compose`                                                               |

- parecer e conclusão da JARI vão **de ofício** — em nenhuma tela são pedidos ao cidadão
  ([RN-PORTAL-106]; [UC-PORTAL-003] AC-PORTAL-003-1).
- cidadão pode protocolar apenas com os documentos já anexados de ofício, sem texto adicional
  obrigatório além do mínimo legal ([UC-PORTAL-003] 3a).
- todo comando gera `@Audit` (`portal-route-contract.md` §1.7).

## 7. Saída

- volta para T-07 (acompanhamento) após protocolar.
- desistência do rascunho: nada perdido antes de assinar.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o `request` de origem.
- documentos de ofício (parecer/conclusão) não editáveis pelo cidadão — íntegros, sem risco de
  adulteração pela UI.
- nenhum token/segredo em tela/URL/log.

## 9. Acessibilidade

- mesmo padrão de T-02/T-03; o dossiê anexado de ofício tem link de download acessível.
- foco no aviso de "última instância administrativa" ao exibir a confirmação.

## 10. Testes

- unitário: parecer/conclusão da JARI presentes e não editáveis no formulário.
- roteamento: `assuranceGuard('avancada')` e `entitlementGuard('request')` presentes e ausentes;
  bloqueio de protocolo após os 30 dias.
- jornada feliz: recurso tempestivo com dossiê de ofício → confirmação de última instância; jornada
  de erro: janela fechada → bloqueio com orientação; jornada de negação: nível insuficiente →
  elevação guiada.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                         | Ação seguinte                     |
| ----------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| carregando        | "Preparando seu recurso ao CETRAN..." (`state.loading`)                            | nenhuma                           |
| vazio             | não se aplica                                                                      | —                                 |
| sem elegibilidade | "O prazo para recorrer ao CETRAN para esta multa já terminou" (`state.ineligible`) | orientação de contato com o órgão |
| erro recuperável  | "Não conseguimos carregar seu dossiê agora." (`state.error_recoverable`)           | tentar de novo                    |
| sem permissão     | explicação embutida no wizard (`state.forbidden`)                                  | passo guiado de elevação          |
| indisponível      | "Este serviço está indisponível no momento" (`state.unavailable`)                  | canal presencial                  |

## Chaves i18n

- `portal.screens.t04.title` — "Assistente de recurso ao CETRAN" (obrigatória)
- `portal.screens.t04.intro` — "O parecer e a conclusão da JARI já estão anexados. Você não precisa reenviá-los."
- `portal.screens.t04.cmd.submit` — "Enviar recurso"
- `portal.screens.t04.cmd.draft` — "Salvar rascunho"
- `portal.screens.t04.field.additionalText` — "Argumentos adicionais (opcional)"
- `portal.screens.t04.state.loading` — "Preparando seu recurso ao CETRAN..."
- `portal.screens.t04.state.ineligible` — "O prazo para recorrer ao CETRAN para esta multa já terminou"
- `portal.screens.t04.state.error_recoverable` — "Não conseguimos carregar seu dossiê agora."
- `portal.screens.t04.state.forbidden` — "Para assinar seu recurso, confirme sua identidade com um passo a mais"
- `portal.screens.t04.state.unavailable` — "Este serviço está indisponível no momento"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
