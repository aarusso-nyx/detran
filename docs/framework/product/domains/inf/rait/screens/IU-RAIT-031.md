---
id: IU-RAIT-031
title: Colegiado — redação do parecer e voto — especificação de tela
status: draft
apps: [rait]
sources: [REF-CONTRAN-357, REF-CETRAN-PROCESSO-INTERNO]
updated: 2026-09-21
---

Ficha da rota `/colegiado/:orgao/relatoria/:caseId/voto` (`rait-web-frontend.md` §4; tela
T-10 de [IU-RAIT-001]).
Fontes: [UC-RAIT-004], [JRN-RAIT-002], [RN-RAIT-004], [RN-RAIT-116], [RN-RAIT-117].

## 1. Identidade

- id: `IU-RAIT-031`; rota: `/colegiado/:orgao/relatoria/:caseId/voto`
  (`route-manifest.md` #31); `screen: 'T-10'`.
- módulo: `colegiado` (`rait-web-frontend.md` §2).
- página: `OpinionPage`; componente inteligente: `OpinionEditor` (§5.2, também listado como
  compartilhado).
- nível: `L2` (`route-manifest.md` #31).
- slug i18n: `colegiado-orgao-relatoria-caseId-voto` (`route-manifest.md` §A).

## 2. Acesso

- papel: `rait-rapporteur` (`route-manifest.md` #31).
- guardas: `raitAuthGuard` + `roleGuard(['rait-rapporteur'])` (M4).
- chave de política: `inf:rait-opinion:register` (§7).
- pré-condição: caso em `EM_INSTRUCAO`/`PRONTO_P_DECISAO`, `instancia` ∈ {`jari`, `cetran`};
  relator sorteado/distribuído sem impedimento declarado ([UC-RAIT-004] Pré-condições).

## 3. Entrada

- de onde se chega: `/colegiado/:orgao/relatoria` (após aceitar o lote) ou
  `/casos/:id/dossie` (leitura do dossiê); [JRN-RAIT-002] passo 3; JW-07 passo 4.
- parâmetros de rota: `:orgao`, `:caseId`.
- deep-link canônico: `/colegiado/jari/relatoria/:caseId/voto`.

## 4. Dados

- resolver: "redação do parecer e voto" (`route-manifest.md` #31).
- cliente gerado: `data/api/worklist.client.ts` (`PATCH /v1/inf/rait/agenda-items/{id}`, §7).
- campos exibidos: dossiê completo instruído ([UC-RAIT-004] Fluxo 3), resumo descritivo, análise
  fundamentada, voto conclusivo ∈ {provimento, não-provimento, não-conhecimento}
  (`rait-web-frontend.md` §9).
- calculado do backend: prazo interno de elaboração de voto (`T-VOTO`, proposta 20 dias —
  `WF-RAIT-003`, `pendente regimento JARI-AM/CETRAN-AM` na fonte original, tratado como
  premissa vigente por steering §H item 57) — exibido, nunca recalculado no cliente.

## 5. Estados

- carregando: skeleton do editor.
- vazio: não se aplica — formulário sobre um caso identificado.
- erro recuperável: falha transitória ao salvar — mantém o texto digitado, retry.
- sem permissão: 403 `RAIT.FORBIDDEN_ORGAO`/`RAIT.FORBIDDEN_ACTION` → banner "sem permissão para
  esta ação".
- conflito: `RAIT.CASE_STATE_INVALID` (409) — comando incompatível com o estado do caso
  (`rait-error-catalog.md` §3.5) → recarrega e reabre com os dados atuais.
- indisponível: não se aplica (`L2`).

## 6. Comandos

| Ação (`recurso:ação`)   | Papel             | Pré-estado → pós-estado             | Comando (§7)                           | Confirmação com efeito jurídico                                                                | Erros esperados                                                                      |
| ----------------------- | ----------------- | ----------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `rait.opinion:register` | `rait-rapporteur` | `EM_INSTRUCAO` → `PRONTO_P_DECISAO` | `PATCH /v1/inf/rait/agenda-items/{id}` | "Ao registrar o voto, o caso aguarda inclusão em pauta; o parecer não pode mais ser retirado." | `RAIT.DRAFT_INCOMPLETE`, `RAIT.DECISION_GROUNDS_REQUIRED`, `RAIT.CASE_STATE_INVALID` |

Endpoint de comando: R-0007 CTG-0004 (`rait-web-frontend.md` §11). `If-Match` sempre exigido.

## 7. Saída

- registrado: caso passa a `PRONTO_P_DECISAO`, aguarda inclusão em pauta
  ([UC-RAIT-004] Pós-condições) — volta a `/colegiado/:orgao/relatoria`.
- se necessário, retorna a `/casos/:id/diligencias` para abrir diligência complementar antes do
  voto ([UC-RAIT-004] Fluxo 3).
- prazo `T-VOTO` vencido sem parecer: atraso registrado no perfil do relator
  (`ADVERTIDO`, `WF-RAIT-002` §5), sinalizado ao coordenador, sempre rotulado como meta
  operacional, nunca como teto legal ([UC-RAIT-004] AC-RAIT-004-4).

## 8. Segurança e LGPD

- as três partes do voto são exigidas — parecer sem conclusão explícita não é aceito
  ([UC-RAIT-004] AC-RAIT-004-3).
- texto livre da petição acessível ao relator para instrução, mas nunca exportado para telas de
  terceiros sem contexto de instrução do caso ([RN-RAIT-134]).
- nenhum segredo em URL/log.

## 9. Acessibilidade e atalhos

- registro de voto operável sem mouse (`rait-web-frontend.md` §10, item 5; `IU-RAIT-001` §5).
- prazo interno (`T-VOTO`) sempre distinto visualmente do teto legal de 24 meses
  ([IU-RAIT-001] §2; [UC-RAIT-004] AC-RAIT-004-4).
- foco visível; erro de forma (parecer incompleto) associado ao campo.

## 10. Testes

- unitário: o voto tem as três partes exigidas ([UC-RAIT-004] AC-RAIT-004-3); prazo interno de
  voto é medido e distinto do teto legal (AC-RAIT-004-4); atraso que ameaça relógio de
  prescrição escala a reatribuição obrigatória (AC-RAIT-004-5).
- roteamento: `rait-rapporteur` ativa; demais papéis → `/sem-permissao`.
- estados: `RAIT.DRAFT_INCOMPLETE`; conflito de estado.

## Componentes compartilhados

`OpinionEditor`, `DossierViewer`, `DeadlineChip`, `LegalBasisTooltip`.

## Chaves i18n

- `rait.screens.colegiado-orgao-relatoria-caseId-voto.title` — "Parecer e voto"
- `rait.screens.colegiado-orgao-relatoria-caseId-voto.cmd.register` — "Registrar voto"
- `rait.screens.colegiado-orgao-relatoria-caseId-voto.field.summary` — "Resumo descritivo"
- `rait.screens.colegiado-orgao-relatoria-caseId-voto.field.analysis` — "Análise fundamentada"
- `rait.screens.colegiado-orgao-relatoria-caseId-voto.field.vote` — "Voto conclusivo"
