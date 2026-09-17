---
id: IU-PORTAL-T16
title: Meus documentos — CNH digital — especificação de tela
status: draft
apps: [portal]
sources: [REF-CONTRAN-809-2020]
updated: 2026-09-17
---

Ficha de [IU-PORTAL-001] T-16. Fontes: [UC-PORTAL-011], [RN-PORTAL-115], [RN-PORTAL-117].

## 1. Identidade

`T-16`, "Minha CNH digital", app `portal`, rota `documentos/cnh-digital` (`route-manifest.md`
#24), módulo `documentos`, `screen: 'T-16'`, `sheet: 'IU-PORTAL-T16'`.

## 2. Acesso

Ator CIDADAO nível simples ([UC-PORTAL-011] pré-condições, Decreto 10.543/2020 art.4º I, "b");
guarda `portalAuthGuard`, sem `entitlementGuard` de alvo (é sempre a própria CNH do sujeito da
sessão); `serviceAvailabilityGuard('consulta_cnh')`.

## 3. Entrada

Acessível a partir de "Meus documentos" no `CitizenShell` (`portal-frontends.md` §5.1). Sem
parâmetro de rota. Documento cacheado localmente para uso offline ([UC-PORTAL-011] passo 4, M14
`portal-frontends.md` §1) — a tela recupera o documento do cache cifrado quando não há rede.

## 4. Dados

`GET documents/cnh` (`portal-route-contract.md` §7): `{ status: valida | vencida | suspensa |
cassada, validUntil, categories[], restrictions[], documentBytes (PDF/A assinado),
qrVerification, cachedAt }` — leitura via `RenachPort`/`CdtPort.getCitizenLicense` (cache TTL).
Offline: `OfflineDocumentStore` cifra o documento com chave derivada por sessão, nunca persistida
em claro (`plan.md` M14). Nenhuma fixture como fallback.

## 5. Estados

- **carregando**: esqueleto do documento.
- **vazio**: `PORTAL.CNH_NOT_FOUND` — sem CNH registrada.
- **sem elegibilidade**: `PORTAL.CNH_NOT_VALID_FOR_DIGITAL` — CNH em situação que impede o
  documento digital ([UC-PORTAL-011] alt. 2a): explica o motivo e o caminho de regularização.
- **erro recuperável**: `PORTAL.CNH_CLEARANCE_PENDING` — pendência de quitação (CTB art. 159 §8º)
  com link direto ao módulo de pagamento ([UC-PORTAL-011] alt. 2b).
- **sem permissão**: não se aplica — é sempre a própria CNH.
- **indisponível**: `PORTAL.NATIONAL_READ_UNAVAILABLE` — dado em cache exibido com a data da
  consulta ([RN-PORTAL-117] categoria A/C).
- **sucesso**: documento com validade calculada (data final, nunca "10 anos desde a emissão"),
  verificável por QR Code, disponível offline ([UC-PORTAL-011] AC-2/AC-3/AC-4).

## 6. Comandos

"Exibir/baixar" e "compartilhar/imprimir" ([UC-PORTAL-011] passo 4) — não são comandos de
mutação, apenas leitura/exportação. Modo offline e autenticação local antes de exibir o documento
offline são citados em [IU-PORTAL-001] T-16 e no `plan.md` M14 sem especificação operacional
(limiar de bateria crítica, mecanismo de autenticação local) — **fonte insuficiente para
detalhar; marcado `source_pending`, OD-P54 proposta** (renumerada pelo Architect: OD-P52/P53 são de T-08/T-09).

## 7. Saída

Volta para a lista de documentos do `CitizenShell`. Nada a salvar (tela só-leitura + exportação).

## 8. Segurança

O PORTAL nunca rotula a versão digital como "cópia" ou "espelho" ([RN-PORTAL-115] item 2). Cache
cifrado com `AES-GCM`, chave derivada por sessão, nunca persistida em claro (`plan.md` M14,
Riscos). Nada de token/segredo em tela/URL/log; documento categoria A ([RN-PORTAL-117]) exige QR
de verificação — nenhum PDF sem ele é rotulado como CNH-e.

## 9. Acessibilidade

Validade lida como data, não como duração ([UC-PORTAL-011] AC-2); aviso de porte obrigatório e de
quitação de débitos ([RN-PORTAL-115] item 3) em texto claro antes de qualquer ação; alvo de toque
≥ 44×44px em "baixar"/"compartilhar".

## 10. Testes

Unitário: validade exibida como data final calculada, nunca duração crua (AC-2). Roteamento:
`serviceAvailabilityGuard` bloqueia quando `consulta_cnh` está `unavailable`. Jornada feliz:
documento abre e é verificável sem rede (AC-4). Jornada de pendência: quitação pendente explica o
motivo com link de pagamento antes de negar a emissão (alt. 2b).

## Estados obrigatórios

| Estado            | Texto cidadão (chave i18n)            | Ação seguinte                                        |
| ----------------- | ------------------------------------- | ---------------------------------------------------- |
| carregando        | `portal.states.loading`               | —                                                    |
| vazio             | `portal.screens.t16.empty`            | orientação de emissão da CNH                         |
| sem elegibilidade | `portal.screens.t16.state.nao_valida` | caminho de regularização ([UC-PORTAL-011] alt. 2a)   |
| erro recuperável  | `portal.screens.t16.state.pendencia`  | ir ao módulo de pagamento                            |
| sem permissão     | n/a — é sempre a própria CNH          | —                                                    |
| indisponível      | `portal.states.unavailable`           | dado em cache com data da consulta ([RN-PORTAL-117]) |

## Chaves i18n

- `portal.screens.t16.title` — "Minha CNH digital"
- `portal.screens.t16.empty` — "Não encontramos uma CNH registrada para você."
- `portal.screens.t16.state.nao_valida` — "Sua CNH não está em situação de gerar o documento
  digital agora." ([UC-PORTAL-011] alt. 2a)
- `portal.screens.t16.state.pendencia` — "Há uma pendência de quitação antes de emitir." (CTB
  art. 159 §8º)
- `portal.screens.t16.cmd.baixar` — "Baixar/exibir"
- `portal.screens.t16.field.validade` — "Válida até {{validUntil}}." ([UC-PORTAL-011] AC-2)
