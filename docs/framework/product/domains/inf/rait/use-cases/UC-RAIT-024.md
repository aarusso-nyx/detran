---
id: UC-RAIT-024
title: Secretaria arquiva os autos julgados, mantém a custódia e aplica a retenção
status: draft
apps: [rait]
sources: [REF-CONTRAN-900, REF-CONTRAN-931, REF-LEI-13709-2018]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria do órgão (ou da JARI) arquiva o processo encerrado, mantém a custódia digital e física, atende pedidos de vista e cópia, e aplica a política de retenção e anonimização.

## Pré-condições

- Caso em `TRANSITADO`, `NAO_CONHECIDO` comunicado ou `ENCERRADO_DESISTENCIA`; infração em estado terminal ([WF-INF-003]).

## Fluxo principal

1. Sistema consolida o dossiê final (peças, decisões, atas, comunicações com marcos, pagamentos) e o sela (hash).
2. Secretaria arquiva: os autos permanecem com o órgão autuador ou sua JARI, inclusive de veículos de outra UF (900 arts. 7-8); papel vai à custódia física com localização registrada.
3. Pedidos de vista/cópia do interessado são atendidos sem requerimento formal e sem custo ([RN-PORTAL-112]); dado de terceiro é suprimido campo a campo.
4. Ao fim do prazo de retenção identificado (proposta: 5 anos após o encerramento — [RN-RAIT-136]; piso de 5 anos para dados de notificação eletrônica, 931 art. 12), o sistema anonimiza o caso mantendo a camada estatística.

## Fluxos alternativos / exceções

- **4a.** Processo com cobrança em curso ou ação judicial: retenção prorrogada enquanto durar a exigibilidade, com registro.
- **2a.** Recurso de outra UF: arquivo permanece aqui; cópia integral disponibilizada ao órgão de registro se requisitada.

## Pós-condições

Autos selados e custodiados; retenção e anonimização aplicadas; acessos registrados.

## Critérios de aceitação

**AC-RAIT-024-1 — o dossiê selado é imutável**

- **Dado** um caso arquivado
- **Quando** alguém tenta alterar uma peça
- **Então** o sistema recusa e registra a tentativa

**AC-RAIT-024-2 — retenção é política, não decisão caso a caso**

- **Dado** um caso encerrado há 5 anos sem cobrança
- **Quando** o job de retenção roda
- **Então** o caso é anonimizado e o evento fica na trilha

**AC-RAIT-024-3 — vista sem burocracia**

- **Dado** um interessado autenticado
- **Quando** pede cópia dos autos
- **Então** recebe imediatamente, com dados de terceiros suprimidos

## Regras aplicáveis

- [RN-RAIT-136] (retenção)
- [RN-RAIT-137] (papéis LGPD por campo)
- [RN-PORTAL-112] (vista dos autos)
