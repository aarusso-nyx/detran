---
id: UC-DASH-007
title: Publicação de dados abertos / transparência ativa
status: reviewed
apps: [dashboard, portal]
sources: [WF-DASH-002, REF-LEI-12527-2011, REF-LEI-14129-2021]
updated: 2026-08-31
---

## Ator e objetivo

Administração técnica / Gestor DETRAN quer garantir que o módulo de transparência do DASHBOARD
mantém, de forma contínua, o checklist técnico exigido pela LAI — busca, exportação em formato
aberto, API legível por máquina, changelog, acessibilidade — e que os indicadores de serviço
espelham o padrão nacional (volume, tempo médio, satisfação).

## Pré-condições

- IND-DASH-209 (transparência ativa) está catalogado e conectado a [WF-DASH-002].

## Fluxo principal

1. Sistema abre o ciclo de auditoria periódica do checklist (proposta: mensal — decisão do
   Owner pendente, ver `_intake/bpo-notes.md`).
2. Administração técnica verifica cada item do checklist: mecanismo de busca funcional,
   exportação disponível em formato aberto, API respondendo, changelog atualizado desde a última
   publicação, conformidade de acessibilidade.
3. Administração técnica corrige itens ausentes/quebrados antes do fechamento do ciclo.
4. Sistema publica os indicadores de serviço por app (volume de solicitações, tempo médio de
   atendimento, grau de satisfação — [REF-LEI-14129] art. 22), padronizados para permitir
   comparação entre entes.
5. Ciclo é comprovado e arquivado ([WF-DASH-002]).

## Fluxos alternativos / exceções

- **Estatística agregada envolvendo dado de saúde de vítima de sinistro**: antes de qualquer
  publicação, o módulo exige camada de agregação/anonimização documentada — piso legal
  [REF-LEI-13709] (LGPD) art. 13, já referenciado como pré-condição de exposição de indicadores
  de BOAT no dossiê de pesquisa (`_intake/research-dossier.md` §3) — a publicação é bloqueada
  sem essa camada, não apenas alertada.
- **Item do checklist falha na auditoria periódica**: ciclo entra em `ATRASADO` até correção;
  gera alerta na trilha de irregularidade de [WF-DASH-001].
- **Granularidade de dado agregado permite reidentificação**: publicação é suspensa até
  reagregação — mesmo princípio anti-reidentificação citado no dossiê (§3, referência a
  [REF-SENATRAN-PORTARIA-139-2025] art. 17 §2º).

## Pós-condições

- Checklist de transparência ativa mantido em conformidade contínua; indicadores de serviço
  publicados e comparáveis; nenhuma publicação de dado agregado de sinistro sem camada de
  anonimização documentada.

## Critérios de aceitação

**AC-DASH-007-1 — o rol mínimo da transparência ativa é checklist, não texto**

- **Dado** o ciclo de auditoria de transparência
- **Quando** é executado
- **Então** cada item do art. 8º §1º e do checklist técnico do §3º é verificado individualmente
  ([RN-DASH-140]) — busca funcional, formato aberto, API, changelog, acessibilidade

**AC-DASH-007-2 — o SIC não pode exigir motivo**

- **Dado** um pedido de acesso
- **Quando** é recebido
- **Então** nenhum campo de motivo é obrigatório, e a negativa, se houver, é fundamentada com
  indicação de recurso ([RN-DASH-141])

**AC-DASH-007-3 — o relógio da LAI é imediato-ou-20-dias**

- **Dado** um pedido de acesso
- **Quando** o prazo é calculado
- **Então** resposta imediata quando possível; caso contrário 20 dias, prorrogáveis uma vez com
  justificativa ([RN-DASH-118])

**AC-DASH-007-4 — dataset aberto tem requisitos verificáveis**

- **Dado** um conjunto publicado
- **Quando** é auditado
- **Então** cumpre formato, metadados, periodicidade declarada e histórico ([RN-DASH-151]) — um CSV
  solto sem metadado nem periodicidade não é dado aberto

**AC-DASH-007-5 — a supressão de célula vale também na publicação**

- **Dado** um agregado a publicar
- **Quando** contém recortes pequenos
- **Então** o limiar de supressão é aplicado **antes da primeira publicação** ([RN-DASH-161]) —
  publicar e corrigir depois não desfaz reidentificação

**AC-DASH-007-6 — norma federal sobre autarquia estadual tem alcance declarado**

- **Dado** um requisito vindo de normativo federal de dados abertos ou governo digital
- **Quando** é aplicado
- **Então** o painel registra em que medida alcança uma autarquia estadual ([RN-DASH-150]) — a
  adesão do AM à Lei 14.129/2021 segue pendente (DT-066) e condiciona parte do módulo

**AC-DASH-007-7 — a avaliação de satisfação é publicada por inteiro**

- **Dado** o resultado da pesquisa anual
- **Quando** é divulgado
- **Então** a publicação é integral ([RN-DASH-117]) — publicar só o favorável descumpre a obrigação

## Regras aplicáveis

- [WF-DASH-002] (ciclo do dever periódico)
- [REF-LEI-12527-2011] art. 8º §3º
- [REF-LEI-14129-2021] arts. 22, 29-32
- Handoff LGPD art. 13 sobre estatística de sinistro — ver `_intake/research-dossier.md` §3
