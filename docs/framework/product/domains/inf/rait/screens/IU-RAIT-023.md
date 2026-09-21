---
id: IU-RAIT-023
title: Protocolo — redirecionamentos entre órgãos — especificação de tela
status: draft
apps: [rait]
sources: [REF-CTB-280-290, REF-CONTRAN-900, REF-LEI-9784-1999]
updated: 2026-09-21
---

Ficha da rota `/protocolo/redirecionamentos` (`rait-web-frontend.md` §4; sem tela própria em
[IU-RAIT-001]).
Fontes: [UC-RAIT-027], [RN-RAIT-002], [RN-RAIT-106], [RN-RAIT-109].

## 1. Identidade

- id: `IU-RAIT-023`; rota: `/protocolo/redirecionamentos` (`route-manifest.md` #22);
  `screen: '—'`.
- módulo: `protocolo` (`rait-web-frontend.md` §2).
- página: `RedirectsPage` (`rait-web-frontend.md` §5.3).
- nível: `L2` (`route-manifest.md` #22).
- slug i18n: `protocolo-redirecionamentos` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-secretary` (`route-manifest.md` #22).
- guardas: `raitAuthGuard` + `roleGuard(['rait-secretary'])` (M4).
- chave de política: `inf:rait-case:redirect` (JW-03 passo 4, notação análoga ao §7).
- pré-condição: peça protocolada com AIT de outro órgão, ou peça recebida de outro órgão contra
  AIT do DETRAN-AM ([UC-RAIT-027] Pré-condições).

## 3. Entrada

- de onde se chega: `/protocolo` (peça identificada como de outro órgão); JW-03 passo 4.
- parâmetros de rota: nenhum; lista aceita `?q=&ordem=&filtro=`.
- deep-link canônico: `/protocolo/redirecionamentos` sem parâmetros.

## 4. Dados

- resolver: "peças de/para outro órgão" (`route-manifest.md` #22).
- cliente gerado: `data/api/case.client.ts`.
- campos exibidos: órgão autuador competente (identificado por AIT + código RENAINF —
  [UC-RAIT-027] Fluxo 1), protocolo de origem (identificação/assinatura do recebedor, órgão,
  data — [RN-RAIT-106]), sentido do redirecionamento (recebido de/enviado a outro órgão).
- calculado do backend: marco de tempestividade preservado pelo protocolo de origem
  ([UC-RAIT-027] AC-RAIT-027-1) — a tela exibe a data usada, não recalcula.

## 5. Estados

- carregando: skeleton da lista.
- vazio: "nenhum redirecionamento pendente".
- erro recuperável: falha transitória — retry.
- sem permissão: 403 → banner "sem permissão para esta ação".
- conflito: `RAIT.REDIRECT_SAME_BODY` (422) — redirecionamento para o próprio órgão
  (`rait-error-catalog.md` §3.3) → diálogo bloqueante com a base legal.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`) | Papel            | Pré-estado → pós-estado                                                                               | Comando (§7, proposto) | Confirmação com efeito jurídico                                                                               | Erros esperados           |
| --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `rait.case:redirect`  | `rait-secretary` | caso protocolado no órgão errado → caso encerrado por redirecionamento, ofício gerado (JW-03 passo 4) | `rait-case:redirect`   | "Ao redirecionar, o protocolo aqui vale como marco de tempestividade lá; o prazo do requerente é preservado." | `RAIT.REDIRECT_SAME_BODY` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- peça de outro órgão: protocolo emitido, remessa imediata ao órgão autuador competente
  ([UC-RAIT-027] Fluxo 2).
- peça recebida de outro órgão contra AIT do DETRAN-AM: entra em `PROTOCOLADO` com a data do
  protocolo de origem, segue a [UC-RAIT-001]/[UC-RAIT-002] (triagem).
- órgão incompetente por erro do cidadão: sistema indica o órgão competente e devolve o prazo,
  sem não conhecimento ([UC-RAIT-027] Fluxo 4; [RN-RAIT-109]).

## 8. Segurança e LGPD

- dados do requerente exibidos conforme papel; terceiros suprimidos ([RN-RAIT-137]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- `j/k`/`enter` para navegar e abrir o redirecionamento.
- data de tempestividade usada sempre exibida com a fonte ao lado (origem do protocolo,
  [IU-RAIT-001] §1).
- foco visível; erro de mesmo órgão sinalizado por texto no diálogo bloqueante.

## 10. Testes

- unitário: o tempo de trânsito não corre contra o cidadão — tempestividade usa a data do
  protocolo de origem ([UC-RAIT-027] AC-RAIT-027-1); órgão incompetente devolve o prazo, sem
  não conhecimento (AC-RAIT-027-2).
- roteamento: `rait-secretary` ativa; demais papéis → `/sem-permissao`.
- estados: conflito `RAIT.REDIRECT_SAME_BODY`; vazio.

## Componentes compartilhados

`QueueTable`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.protocolo-redirecionamentos.title` — "Redirecionamentos"
- `rait.screens.protocolo-redirecionamentos.intro` — "Peças de ou para outro órgão autuador"
- `rait.screens.protocolo-redirecionamentos.empty` — "Nenhum redirecionamento pendente"
- `rait.screens.protocolo-redirecionamentos.cmd.redirect` — "Redirecionar"
- `rait.screens.protocolo-redirecionamentos.field.target_body` — "Órgão de destino"
