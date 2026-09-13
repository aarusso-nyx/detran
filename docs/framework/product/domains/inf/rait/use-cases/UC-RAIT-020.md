---
id: UC-RAIT-020
title: Secretaria lavra, assina e publica a ata da sessão (marco do prazo recursal)
status: draft
apps: [rait, portal]
sources: [REF-CONTRAN-357, REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria da sessão gera a ata a partir dos registros ao vivo, colhe as assinaturas (presidente e relator) e publica as decisões — a publicação é o marco do prazo de 30 dias para recurso ao CETRAN-AM (decisão do Owner C.24).

## Pré-condições

- Sessão em `DECISAO_PROCLAMADA` ([WF-RAIT-003]); presenças, votos e resultados registrados item a item.

## Fluxo principal

1. Sistema gera a ata (pauta, presentes, quorum por item, relatoria, votos individuais, resultado, fundamentação, vistas, itens retirados) → `ATA_LAVRADA`.
2. Presidente e relatores assinam (PAdES+TSA, steering A.8) → `ATA_ASSINADA`.
3. Secretaria publica as decisões (sítio do órgão, SNE quando aderente, Portal); cada caso passa a `JULGADO_SESSAO` → `COMUNICADO`; evento `RAIT_DECISAO_PUBLICADA` com a data de publicação, que arma `T-R2` ([WF-INF-003] #21).
4. Comunicação individual ao recorrente ([UC-RAIT-007]); se provido, a autoridade centralizada é notificada ([UC-RAIT-008]).

## Fluxos alternativos / exceções

- **2a.** Relator ausente para assinar: presidente assina pelo colegiado com registro; ata não fica retida.
- **3a.** Publicação parcial (falha de canal): `T-R2` só é armado para os itens efetivamente publicados; os demais ficam em pendência visível.
- **1a.** Divergência entre registro ao vivo e memória dos membros: correção só por errata deliberada na sessão seguinte, nunca edição da ata assinada.

## Pós-condições

Ata assinada e publicada; `T-R2` armado por caso a partir da publicação; decisões visíveis ao cidadão.

## Critérios de aceitação

**AC-RAIT-020-1 — a ata nasce dos registros**

- **Dado** uma sessão encerrada
- **Quando** a ata é gerada
- **Então** todos os campos vêm do registro ao vivo; nada é digitado de memória

**AC-RAIT-020-2 — publicação é o marco**

- **Dado** uma decisão publicada em D
- **Quando** o recorrente consulta o prazo
- **Então** o Portal mostra a data-limite calculada de D + 30 dias ([RN-RAIT-103])

**AC-RAIT-020-3 — ata assinada é imutável**

- **Dado** uma ata assinada
- **Quando** alguém tenta editá-la
- **Então** o sistema só admite errata por deliberação registrada

## Regras aplicáveis

- [RN-RAIT-103] (30 dias da publicação)
- [RN-RAIT-130] (comunicação e recurso da autoridade)
- [REF-CONTRAN-357] item 8.3 (publicidade)
