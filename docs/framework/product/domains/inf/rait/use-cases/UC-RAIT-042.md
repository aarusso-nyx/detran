---
id: UC-RAIT-042
title: Auditor consulta a trilha de auditoria e exporta decisões com controle LGPD
status: draft
apps: [rait, dashboard]
sources: [REF-LEI-13709-2018, REF-CONTRAN-357]
updated: 2026-09-12
---

## Ator e objetivo

Auditor/corregedor (papel `auditor`) consulta a trilha completa de um caso ou de um período — distribuição, escalas, sorteios, atas, votos, comunicações, pagamentos, integrações — e exporta decisões e estatísticas com finalidade registrada e minimização de dados.

## Pré-condições

- Perfil `auditor` sem permissão de edição; finalidade da consulta informada.

## Fluxo principal

1. Auditor localiza o caso ou o recorte (período, unidade, membro) e vê a trilha cronológica com atores, atos e hashes.
2. Verifica a impessoalidade da distribuição (ata do sorteio, escala vigente, motivos de reatribuição) e a regularidade das sessões (quorum por item, impedimentos, assinaturas).
3. Exporta decisões e estatísticas: dados pessoais do requerente/procurador só com base legal registrada; terceiros suprimidos; exportação assinada e registrada.
4. Achados geram tarefas ao gestor ou comunicação à corregedoria; nenhuma decisão é alterada pelo auditor.

## Fluxos alternativos / exceções

- **3a.** Pedido de exportação nominal em massa: exige finalidade e aprovação do DPO ([RN-RAIT-137]).
- **1a.** Caso anonimizado por retenção: trilha estatística disponível; dados pessoais indisponíveis por política, com registro.

## Pós-condições

Trilha verificada; exportações registradas; achados encaminhados.

## Critérios de aceitação

**AC-RAIT-042-1 — o auditor não edita**

- **Dado** um auditor na trilha de um caso
- **Quando** tenta qualquer alteração
- **Então** o sistema recusa; só leitura e exportação

**AC-RAIT-042-2 — cada exportação tem finalidade e assinatura**

- **Dado** uma exportação de decisões
- **Quando** é gerada
- **Então** fica registrada com finalidade, escopo, solicitante e hash

## Regras aplicáveis

- [RN-RAIT-133]…[RN-RAIT-138] (LGPD do RAIT)
- [RN-RAIT-141] (auditabilidade da distribuição)
