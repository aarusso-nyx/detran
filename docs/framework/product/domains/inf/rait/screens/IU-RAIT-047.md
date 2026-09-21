---
id: IU-RAIT-047
title: Membros, mandatos e posse — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CONTRAN-901-2022]
updated: 2026-09-21
---

Ficha da rota `organizacao/membros` (`rait-web-frontend.md` §4).
Fontes: [UC-RAIT-037].

## 1. Identidade

- id `IU-RAIT-047`; `path`: `organizacao/membros` (route-manifest.md #49); `screen`: `—`.
- módulo `organizacao`; página `MembersPage`, componente inteligente `MandateForm` (§5.3).
- nível `L1` — lista/leitura pelo cliente CRUD de `BP-INF-RAIT-ORG-001` (route-manifest.md, M13);
  slug i18n `organizacao-membros`.

## 2. Acesso

- papéis: `rait-hr`, `rait-chair` (route-manifest.md linha 49).
- guardas: `raitAuthGuard`; `roleGuard(['rait-hr', 'rait-chair'])`.
- chave de política: `inf:rait-member:mandate` (`rait-web-frontend.md` §7).
- pré-condição: ato de nomeação/designação publicado (JARI: 357 item 6.2; CETRAN: 901 Anexo 7;
  [UC-RAIT-037] Pré-condições).

## 3. Entrada

- chega-se pelo redirect de `/organizacao` para `rait-hr` (route-manifest.md §B) ou pela
  navegação.

## 4. Dados

- resolver: "membros, mandatos, posse, perda" (route-manifest.md).
- leitura pelo cliente CRUD de organização (`org.client.ts`): membro, representação,
  titular/suplente, `mandate_starts_on`/`mandate_ends_on`, estado de accountability
  ([UC-RAIT-037] fluxo 1-2).
- alertas de fim de mandato (proposta: 90, 60 e 30 dias) ao gabinete e ao presidente
  ([UC-RAIT-037] fluxo 3).

## 5. Estados

- **carregando / vazio / erro recuperável / sem permissão**: padrão.
- **vaga sem indicação**: substituição por servidor habilitado registrada como excepcionalidade
  ([UC-RAIT-037] 1a).

## 6. Comandos

| Ação (`recurso:ação`) | Papel     | Pré-estado → pós-estado                                                | Comando                                       | Confirmação                                                   | Erros esperados                                                                                                  |
| --------------------- | --------- | ---------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `rait.member:mandate` | `rait-hr` | — → membro `ATIVO` a partir da posse; ou `ATIVO` → `MANDATO_ENCERRADO` | `POST`/`PATCH /v1/inf/rait/pool-members` (§7) | "sem posse não há distribuição" ([UC-RAIT-037] AC-RAIT-037-1) | `RAIT.MANDATE_ACT_REQUIRED`, `RAIT.MANDATE_DUAL_BODY`, `RAIT.MANDATE_OVERLAP`, `RAIT.MANDATE_ACTIVE_ASSIGNMENTS` |

- `endpoint de comando: R-0007 CTG-0004`; `If-Match` sempre.
- membro do CETRAN-AM cadastrado na JARI (ou vice-versa) é recusado ([UC-RAIT-037]
  AC-RAIT-037-3; 357 item 4.1.c; 901 Anexo 5.4).
- término sem recondução encerra o mandato na data e redistribui os casos abertos em lote
  ([UC-RAIT-037] fluxo 4 → [UC-RAIT-011] 1a).

## 7. Saída

- membro `MANDATO_ENCERRADO`: casos abertos entram em reatribuição
  ([UC-RAIT-037] AC-RAIT-037-2).
- perda de mandato contestada: membro fica `AFASTADO_TEMP` até decisão com ampla defesa
  ([UC-RAIT-037] 4a).

## 8. Segurança e LGPD

- dado do membro é interno (representação, mandato), sem dado sensível do requerente.

## 9. Acessibilidade e atalhos

- `MandateForm` navegável por teclado, erros associados ao campo.

## 10. Testes

- AC-RAIT-037-1 — sem posse, sem elegibilidade em sorteio.
- AC-RAIT-037-2 — mandato vencido encerra a elegibilidade no dia.
- AC-RAIT-037-3 — dupla composição JARI × CETRAN é recusada.
- roteamento: `rait-hr`/`rait-chair` ativam; demais papéis → `/sem-permissao`.

## Componentes compartilhados

`MandateForm` (§5.3, organizacao); nenhum de §5.2 aplica diretamente.

## Chaves i18n

- `rait.screens.organizacao-membros.title` — "Membros, mandatos e posse"
- `rait.screens.organizacao-membros.cmd.mandate` — "Registrar ato de mandato"
