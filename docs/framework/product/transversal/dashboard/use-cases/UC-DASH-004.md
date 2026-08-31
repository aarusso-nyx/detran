---
id: UC-DASH-004
title: Auditor consulta trilha agregada
status: approved
apps: [dashboard]
sources: [WF-DASH-001, WF-DASH-002, WF-DASH-003]
updated: 2026-08-31
---

## Ator e objetivo

Auditor (papel transversal "Auditor / DPO", `shared/actors.md`) quer reconstruir, para um caso,
período ou sistema específico, o histórico completo de alertas, deveres e janelas de
indisponibilidade — sem poder alterar nada, apenas ler.

## Pré-condições

- Auditor tem acesso de leitura ao DASHBOARD, sem permissão de escrita em nenhum estado.

## Fluxo principal

1. Auditor abre a trilha agregada e filtra por caso, indicador, período, ou app de origem.
2. Sistema exibe, para cada alerta ([WF-DASH-001]): timestamps de `DETECTADO`, `CLASSIFICADO`,
   `NOTIFICADO`, `RECONHECIDO`, `EM_TRATAMENTO`, `VERIFICADO`, `ENCERRADO`/`INCIDENTE_REGISTRADO`,
   e os atores envolvidos em cada transição.
3. Sistema exibe, para cada ciclo de dever periódico ([WF-DASH-002]): timestamps de
   `JANELA_ABERTA` até `ARQUIVADO`/`NAO_CUMPRIDO`, com a evidência de comprovação anexada quando
   existente.
4. Sistema exibe, para cada painel/fonte ([WF-DASH-003]): histórico de janelas
   `FRESCO`/`ATRASADO`/`INDISPONIVEL`, para que o auditor possa avaliar se um número relatado em
   determinado momento era confiável.
5. Auditor exporta o recorte consultado (formato aberto — mesma disciplina de [REF-LEI-12527]
   art. 8º §3º aplicada internamente).

## Fluxos alternativos / exceções

- **Registro de `CRITICO_EXTINCAO`/`INCIDENTE_REGISTRADO`**: aparece destacado na trilha, com
  link para o registro de incidente e apuração de causa (protocolo já descrito em
  [WF-RAIT-002] §4.1, herdado por [WF-DASH-001]).
- **Indicador nunca chegou a ter fonte conectada**: aparece na trilha como "catalogado, sem
  histórico — fonte não conectada no período consultado", não como ausência silenciosa.

## Pós-condições

- Auditor tem reconstrução completa e exportável de qualquer recorte de tempo/caso/sistema, sem
  ter alterado nenhum dado.

## Critérios de aceitação

**AC-DASH-004-1 — consultar o painel é tratamento, e fica na trilha**

- **Dado** um auditor consultando a trilha agregada
- **Quando** a consulta ocorre
- **Então** ela própria é registrada ([RN-DASH-171]) — quem consultou, o quê, quando; o painel
  audita a si mesmo

**AC-DASH-004-2 — a exportação é o ponto de fuga, e é tratada como tal**

- **Dado** um recorte exportado
- **Quando** o arquivo é gerado
- **Então** sai do controle de acesso do painel levando consigo a granularidade — por isso a
  exportação é registrada, rotulada com sua classificação, e sujeita às mesmas regras de supressão
  de célula da publicação ([RN-DASH-172], [RN-DASH-161])

**AC-DASH-004-3 — o conteúdo é classificado antes de ser exibido**

- **Dado** qualquer painel ou recorte
- **Quando** é servido
- **Então** carrega classificação — público por dever, publicável por decisão, ou interno
  ([RN-DASH-142]) — e a UI não permite exportar acima do nível do papel

**AC-DASH-004-4 — o auditor vê frescor histórico, não só o número de hoje**

- **Dado** uma investigação sobre um número relatado no passado
- **Quando** o auditor consulta
- **Então** vê o histórico de `FRESCO`/`ATRASADO`/`INDISPONIVEL` daquela fonte ([WF-DASH-003]),
  para julgar se o número era confiável **naquele momento**

**AC-DASH-004-5 — papel segrega o que se vê**

- **Dado** um painel que agrega saúde, processo e campo
- **Quando** é aberto
- **Então** cada papel vê apenas sua fatia ([RN-DASH-170]) — a agregação não é passe livre para
  ver tudo

## Regras aplicáveis

- [WF-DASH-001], [WF-DASH-002], [WF-DASH-003] (fonte de todo o histórico consultado)
