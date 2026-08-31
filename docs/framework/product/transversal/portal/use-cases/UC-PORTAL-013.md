---
id: UC-PORTAL-013
title: Cidadão acessa os próprios dados de um registro de sinistro (BAT)
status: approved
apps: [portal, boat]
sources: [REF-CONTRAN-808-2020, REF-LEI-13709-2018]
updated: 2026-08-26
---

## Ator e objetivo

Pessoa envolvida em um sinistro (condutor, proprietário do veículo, vítima ou seu representante
legal) acessa o Boletim de Atendimento de Trânsito (BAT) correspondente para fins próprios
(seguro, processo judicial, prova de atendimento), sem depender de solicitação presencial ao
DETRAN-AM.

## Pré-condições

- Cidadão identificado; nível simples quando o dado é sobre o próprio cidadão ([WF-PORTAL-002]).
- Vínculo do CPF do solicitante com o registro de sinistro (como condutor, proprietário do veículo
  envolvido, ou vítima identificada) verificado antes de exibir qualquer conteúdo.

## Fluxo principal

1. Cidadão acessa "Meus registros de sinistro" ou localiza o BAT a partir de uma notificação
   recebida (ex. veículo envolvido em ocorrência registrada por terceiro).
2. Sistema verifica o vínculo do solicitante com o registro ([WF-BOAT-001] `FECHADO`/`INTEGRADO`) e
   libera apenas os campos pertinentes à sua condição no sinistro — dado de saúde de vítima
   recebe controle de acesso reforçado ([RN-BOAT-003], princípio de minimização — Portaria SENATRAN
   139/2025 art.18).
3. Cidadão visualiza/baixa o BAT (dados do sinistro, veículos e pessoas envolvidas conforme
   autorização) e, se aplicável, o croqui anexado.
4. Sistema registra o acesso na trilha de auditoria (dado sensível envolvido).

## Fluxos alternativos / exceções

- **2a.** Registro ainda em `RASCUNHO`/`EM_ATENDIMENTO` (não fechado): sistema informa que o
  registro ainda está em elaboração, sem expor dado parcial como se fosse definitivo.
- **2b.** Solicitante sem vínculo comprovado com o sinistro: acesso negado com explicação — não
  há caminho de "solicitar acesso mesmo assim" dentro deste UC; direciona a canal formal (LGPD/
  ouvidoria) se o cidadão entender ter direito não reconhecido pelo sistema.
- **3a.** BAT com dado de saúde de vítima: campos clínicos exibidos apenas ao próprio titular ou a
  representante legal comprovado, nunca a terceiros do mesmo sinistro sem vínculo com aquela vítima
  específica.

## Pós-condições

Cidadão com cópia/visualização do BAT pertinente à sua condição no sinistro; acesso registrado em
trilha de auditoria; nenhuma alteração do registro BOAT (consulta somente leitura).

## Critérios de aceitação

**AC-PORTAL-013-1 — o titular vê o próprio dado sem máscara**

- **Dado** um envolvido consultando seu BAT
- **Quando** o registro é exibido
- **Então** seus próprios dados aparecem **sem** mascaramento ([RN-PORTAL-118]) — mascaramento é
  controle de acesso de terceiros, e aplicá-lo ao titular é o erro fácil aqui

**AC-PORTAL-013-2 — dado de saúde de terceiro permanece protegido**

- **Dado** um sinistro com outras vítimas
- **Quando** o cidadão consulta
- **Então** vê apenas o que sua condição no sinistro autoriza; dado de saúde alheio não é liberado
  ([RN-BOAT-003], [RN-BOAT-124])

**AC-PORTAL-013-3 — o acesso é auditado**

- **Dado** uma consulta a registro com dado sensível
- **Quando** ocorre
- **Então** fica na trilha de auditoria ([RN-BOAT-126])

**AC-PORTAL-013-4 — só registro fechado ou integrado é consultável**

- **Dado** um sinistro ainda em atendimento
- **Quando** o cidadão o procura
- **Então** o PORTAL não o expõe — a consulta pressupõe `FECHADO`/`INTEGRADO` ([WF-BOAT-001])

## Regras aplicáveis

- [RN-BOAT-003] (controle de acesso reforçado a dado de saúde de vítima)
- [REF-LEI-13709-2018] art.13 (tratamento de dado de saúde)
