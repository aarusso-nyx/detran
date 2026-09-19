---
id: IU-PORTAL-T03
title: Assistente de recurso à JARI — especificação de tela
status: draft
apps: [portal]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CTB-extracts-raw,
    REF-CONTRAN-931,
    REF-BENCH-ESTADOS,
    REF-DECRETO-10543-2020,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
  ]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-03. Fontes: [UC-PORTAL-002], [JRN-PORTAL-001], [JRN-PORTAL-010],
[RN-PORTAL-101], [RN-PORTAL-105], [RN-PORTAL-106], [RN-PORTAL-111], [RN-PORTAL-127].

## 1. Identidade

- id: `T-03`; nome visível: "Assistente de recurso à JARI".
- app: `portal`; módulo: `defesa` (`portal-frontends.md` §4).
- rota: `/processos/:requestId/jari/nova` (`route-manifest.md` #19); `screen: 'T-03'`,
  `sheet: 'IU-PORTAL-T03'`.

## 2. Acesso

- ator: CIDADAO nível avançada — recurso exige assinatura avançada, nomeada literalmente
  ([RN-PORTAL-101] linha 6, Decreto 10.543/2020 art. 4º, II, "h").
- `access`: `avancada`; guardas `portalAuthGuard` + `assuranceGuard('avancada')` →
  `entitlementGuard('request')` sobre `:requestId`; `serviceAvailabilityGuard('recurso_jari')`
  (`route-manifest.md` #19).
- pré-condição: NP visível com prazo de recurso em aberto (data-limite = data-limite de pagamento —
  [REF-CONTRAN-918] art. 12); defesa (se houve) já julgada e indeferida, ou não apresentada no prazo
  ([UC-PORTAL-002] Pré-condições).

## 3. Entrada

- de onde se chega: T-10 (tela de decisão da defesa, quando negativa) ou T-07 (processo).
- rascunho persistido no servidor por `requestId`, vinculado ao AIT/NP de origem — um recurso por
  AIT ([UC-PORTAL-002] passo 2).
- procurador sem habilitação válida: bloqueado no protocolo, orientado a anexar instrumento válido
  ([UC-PORTAL-002] 4a).

## 4. Dados

- `POST /v1/portal/requests` `{ serviceKey: 'recurso_jari', targetKind: 'case', targetId: <case
derivado do requestId de origem>, channel: 'portal' }` → `{ requestId, state:
PEDIDO_EM_COMPOSICAO, prefilled{…}, requirements[], minimumAssurance }`.
- `PUT requests/{id}/draft` `{ grounds, attachmentIds[] }` — corpo do ato `recurso_jari`
  (`portal-route-contract.md` §5.1).
- `POST requests/{id}/submit` `{ signature }` (`Idempotency-Key`
  `recurso_jari:<requestId>:<fingerprint>`) → protocolo imediato → `PROTOCOLADO` → delegação
  `inf:rait-case:protocol` (`instance=jari`).
- checklist de anexos exclui documentos que o órgão já tem ([RN-PORTAL-106]; [UC-PORTAL-002] passo 3).

## 5. Estados

- **carregando**: skeleton do formulário.
- **vazio**: não se aplica — parte sempre de um processo identificado.
- **sem elegibilidade**: já existe recurso em curso para o mesmo AIT → `PORTAL.REQUEST_ONE_PER_AIT`,
  direciona ao processo existente ([UC-PORTAL-002] AC-PORTAL-002-2).
- **erro recuperável**: falha transitória ao enviar → mantém o preenchido, retry.
- **sem permissão**: nível insuficiente ao assinar → passo guiado embutido (mesmo padrão de T-02).
- **indisponível**: serviço `recurso_jari` `unavailable` → `/servico-indisponivel/recurso_jari`.
- **sucesso**: confirmação com destaque explícito de efeito suspensivo automático — "enquanto seu
  recurso tramita, nenhuma restrição de licenciamento ou transferência incide sobre o veículo"
  ([UC-PORTAL-002] AC-PORTAL-002-1, citando [RN-RAIT-108]/CONTRAN-918 art.13).

## 6. Comandos

| Rótulo (chave i18n)             | Nível    | Validação de forma                                              | Idempotência                             | Efeito                                                                |
| ------------------------------- | -------- | --------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| "Enviar recurso" (`cmd.submit`) | avançada | um AIT por requerimento; já pago não bloqueia ([RN-PORTAL-127]) | `recurso_jari:<requestId>:<fingerprint>` | `submit` → `PROTOCOLADO` → `inf:rait-case:protocol` (`instance=jari`) |
| "Salvar rascunho" (`cmd.draft`) | avançada | —                                                               | —                                        | `compose`                                                             |

- recorrer não exige recolher a multa — nenhum viés visual para "pagar antes" ([RN-PORTAL-127]
  verificação a; [UC-PORTAL-002] AC-PORTAL-002-4).
- fora do prazo: sistema informa que o recurso intempestivo não tem efeito suspensivo e será
  arquivado, mas ainda permite protocolar para registro formal, com aviso claro
  (`PORTAL.REQUEST_OUT_OF_DEADLINE`, aviso — [UC-PORTAL-002] 1a).
- todo comando gera `@Audit` (`portal-route-contract.md` §1.7).

## 7. Saída

- volta para T-07 (acompanhamento) após protocolar.
- desistência do rascunho antes de assinar: nada é perdido, rascunho persiste no servidor.

## 8. Segurança

- vínculo: `portal.entitlement` sobre o `request`/caso de origem; nível vem da claim assinada, nunca
  do corpo.
- titular sem máscara; nenhum dado de terceiro nesta tela.
- nenhum token/segredo em tela/URL/log.

## 9. Acessibilidade

- mesmo padrão de T-02: navegação por teclado completa, erros associados ao campo, nomes de campo
  autoexplicativos fora de contexto visual.
- banner de efeito suspensivo com ícone + texto, nunca só cor.

## 10. Testes

- unitário: bloqueio de segundo recurso para o mesmo AIT; prazo mostrado como data-limite calculada,
  não "30 dias" cru ([UC-PORTAL-002] AC-PORTAL-002-3).
- roteamento: `assuranceGuard('avancada')` e `entitlementGuard('request')` presentes e ausentes.
- jornada feliz: recurso tempestivo → confirmação com efeito suspensivo; jornada de erro: recurso
  intempestivo → aviso sem bloquear o protocolo; jornada de negação: procurador sem habilitação →
  bloqueio com orientação.

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)                                                            | Ação seguinte                    |
| ----------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| carregando        | "Preparando seu recurso..." (`state.loading`)                                         | nenhuma                          |
| vazio             | não se aplica                                                                         | —                                |
| sem elegibilidade | "Já existe um recurso em andamento para esta multa" (`state.ineligible`)              | abre o processo existente (T-07) |
| erro recuperável  | "Não conseguimos enviar agora. Seu texto continua salvo." (`state.error_recoverable`) | tentar de novo                   |
| sem permissão     | explicação embutida no wizard (`state.forbidden`)                                     | passo guiado de elevação         |
| indisponível      | "Este serviço está indisponível no momento" (`state.unavailable`)                     | canal presencial                 |

## Chaves i18n

- `portal.screens.t03.title` — "Assistente de recurso à JARI" (obrigatória)
- `portal.screens.t03.intro` — "Enquanto seu recurso tramita, nenhuma restrição incide sobre o veículo."
- `portal.screens.t03.cmd.submit` — "Enviar recurso"
- `portal.screens.t03.cmd.draft` — "Salvar rascunho"
- `portal.screens.t03.field.grounds` — "Por que a multa deveria ser cancelada"
- `portal.screens.t03.state.loading` — "Preparando seu recurso..."
- `portal.screens.t03.state.ineligible` — "Já existe um recurso em andamento para esta multa"
- `portal.screens.t03.state.error_recoverable` — "Não conseguimos enviar agora. Seu texto continua salvo."
- `portal.screens.t03.state.forbidden` — "Para assinar seu recurso, confirme sua identidade com um passo a mais"
- `portal.screens.t03.state.unavailable` — "Este serviço está indisponível no momento"

Rótulos de estado interno (`portal.situation.*`), erros (`portal.errors.*`) e textos jurídicos
(`portal.legal.*`) são referenciados por TASK-0006, não redefinidos aqui.
