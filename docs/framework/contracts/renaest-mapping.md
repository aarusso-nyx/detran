---
id: CONTRACT-RENAEST-MAPPING
title: Mapeamento est/crash para o contrato RENAEST do adapter
status: draft
apps: [boat]
updated: 2026-09-16
---

# Mapeamento `est/crash` → `RenaestPort`

Este documento especifica a adaptação do agregado `est/crash` para as entradas
`CrashReportInput` e `CrashCorrectionInput` de `RenaestPort`. Ele descreve o
contrato atualmente exposto pelo adapter e seu mock. Não afirma que o contrato
do mock é o leiaute nacional definitivo.

## Regras de fronteira

- Toda transmissão, consulta, complemento e correção nacional passa por
  `packages/senatran-adapter` e por `RenaestPort`; aplicativo, controlador e
  domínio não fazem chamada nacional direta.
- `est.renaest.layout_version` tem proposta `mock`, `source_pending=true`, e
  decisão `OD-B08/DT-061`. O valor é usado somente pelo adapter/mock enquanto
  os Manuais RENAEST não fixarem o leiaute. Este contrato não escolhe um
  `layout_version` nacional.
- Catálogos de tipo, condições e códigos federais continuam `source_pending`
  até os Manuais RENAEST, conforme H.42. Um campo marcado **a confirmar** é
  entregue ao adapter somente na semântica do mock e não autoriza assumir o
  código ou a codificação nacional.
- `transmit` somente sai de `FECHADO`; após recibo e protocolo, o estado local
  passa a `INTEGRADO`. `rectify` só opera em `INTEGRADO` quando a situação
  nacional não é terminal. `CONSOLIDADO` é terminal e não admite correção.
- A situação nacional é espelho em `est.crash_renaest_submission`; ela não
  substitui o estado local do registro.

## Convenções da tabela

**Mapeado** identifica uma origem local nomeada nas definições BOAT e um campo
do contrato TypeScript. **A confirmar — DT-061/OD-B08** identifica uma
conversão, código federal, campo físico ou leiaute cuja definição depende dos
Manuais RENAEST. `source_pending` significa que não há valor local canônico
para preencher o campo até essa confirmação.

## `CrashReportInput`

| Propriedade do adapter | Origem `est/crash`                     | Regra de adaptação                                                                                                                               | Situação                    |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| `occurredAt`           | `crash_record.occurred_at`             | Copiar data/hora da ocorrência.                                                                                                                  | Mapeado                     |
| `state`                | `crash_record.uf`                      | Copiar UF do registro.                                                                                                                           | Mapeado                     |
| `municipalityCode`     | `crash_record.municipality_code`       | Copiar código do município.                                                                                                                      | Mapeado                     |
| `severity`             | `crash_record.severity`                | Copiar a gravidade derivada pela pior vítima; sem vítima, `SEM_VITIMA`. A representação federal permanece pendente.                              | A confirmar — DT-061/OD-B08 |
| `location`             | `crash_record.location_description`    | Copiar descrição da localização.                                                                                                                 | Mapeado                     |
| `latitude`             | `crash_record.location_json.latitude`  | Extrair latitude quando existente; ausência permanece ausente.                                                                                   | Mapeado                     |
| `longitude`            | `crash_record.location_json.longitude` | Extrair longitude quando existente; ausência permanece ausente.                                                                                  | Mapeado                     |
| `responsibleAgency`    | órgão do `RequestContext`/registro     | Converter a identificação do órgão para o código aceito nacionalmente. Não derivar valor de agência por texto livre.                             | A confirmar — DT-061/OD-B08 |
| `crashTypeCode`        | `crash_record.crash_type`              | Converter o catálogo do protótipo editável em código federal somente após o manual.                                                              | A confirmar — DT-061/OD-B08 |
| `roadConditions`       | `crash_record.road_condition`          | Converter o catálogo de condição de via.                                                                                                         | A confirmar — DT-061/OD-B08 |
| `weatherConditions`    | `crash_record.weather_condition`       | Converter o catálogo de clima.                                                                                                                   | A confirmar — DT-061/OD-B08 |
| `layoutVersion`        | `est.renaest.layout_version`           | Ler o parâmetro. Enquanto `source_pending`, o adapter/mock recebe somente o valor de proposta `mock`; nenhuma versão nacional é escolhida.       | A confirmar — DT-061/OD-B08 |
| `transmittedAt`        | submissão/outbox concluída             | Preencher com a data/hora da tentativa transmitida somente se o contrato nacional a exigir; as fontes não fixam uma coluna local correspondente. | A confirmar — DT-061/OD-B08 |
| `vehicles`             | `crash_vehicle[]`                      | Projetar a coleção conforme a tabela de veículos abaixo.                                                                                         | Mapeado                     |
| `people`               | `crash_person[]`                       | Projetar a coleção conforme a tabela de pessoas abaixo.                                                                                          | Mapeado                     |
| `victims`              | `crash_victim[]` + pessoa vinculada    | Projetar a coleção conforme a tabela de vítimas abaixo; dados de saúde preservam finalidade, RLS e auditoria.                                    | Mapeado                     |
| `evidence`             | `crash_sketch`/evidências do registro  | A materialização de arquivo, URL e taxonomia depende do contrato físico do RENAEST.                                                              | A confirmar — DT-061/OD-B08 |
| `references`           | veículos, pessoas e `crash_link`       | Projetar somente as referências definidas abaixo; não criar vínculo nacional por inferência.                                                     | A confirmar — DT-061/OD-B08 |

### Elementos de `vehicles[]`

| Propriedade       | Origem `est/crash`                  | Regra                                                                                                                     | Situação                    |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `plate`           | `crash_vehicle.plate`               | Copiar quando informado, sob a retenção aplicável a PII.                                                                  | Mapeado                     |
| `renavam`         | `crash_vehicle.vehicle_snapshot_id` | Resolver somente pela referência de veículo quando ela trouxer RENAVAM autorizado; o formato nacional permanece pendente. | A confirmar — DT-061/OD-B08 |
| `involvementType` | `crash_vehicle.role`                | Converter o papel local para o domínio federal.                                                                           | A confirmar — DT-061/OD-B08 |
| `damage`          | `crash_vehicle.apparent_damage`     | Copiar a descrição disponível; taxonomia nacional não foi fixada.                                                         | A confirmar — DT-061/OD-B08 |

### Elementos de `people[]`

| Propriedade       | Origem `est/crash`             | Regra                                                                                                                            | Situação                    |
| ----------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `cpf`             | `crash_person.document_number` | Usar somente quando `document_source` identificar CPF e o acesso estiver autorizado; não reinterpretar outro documento como CPF. | A confirmar — DT-061/OD-B08 |
| `involvementType` | `crash_person.role`            | Converter condutor, passageiro, pedestre ou ciclista para o domínio federal.                                                     | A confirmar — DT-061/OD-B08 |
| `name`            | `crash_person.name`            | Copiar quando informado e autorizado.                                                                                            | Mapeado                     |

### Elementos de `victims[]`

| Propriedade       | Origem `est/crash`                                | Regra                                                                    | Situação                    |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------- |
| `cpf`             | pessoa vinculada a `crash_victim.crash_person_id` | Aplicar a mesma regra de CPF da pessoa; nunca expor no contexto de erro. | A confirmar — DT-061/OD-B08 |
| `involvementType` | pessoa vinculada a `crash_victim.crash_person_id` | Projetar o papel da pessoa vinculada.                                    | A confirmar — DT-061/OD-B08 |
| `injurySeverity`  | `crash_victim.severity`                           | Converter a classificação de saúde para a codificação nacional.          | A confirmar — DT-061/OD-B08 |
| `diedAtScene`     | `crash_victim.death_at_scene`                     | Copiar booleano quando registrado.                                       | Mapeado                     |
| `deathAt`         | `crash_victim.death_at`                           | Copiar data/hora quando registrada.                                      | Mapeado                     |

### Elementos de `evidence[]` e `references`

| Propriedade            | Origem `est/crash`                             | Regra                                                                        | Situação                    |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `evidence[].type`      | `crash_sketch.sketch_type`/evidência vinculada | Converter desenho, anexo ou mapa para o tipo nacional somente após o manual. | A confirmar — DT-061/OD-B08 |
| `evidence[].fileName`  | metadado da evidência                          | Nome físico e regra de envio não estão definidos nas fontes.                 | A confirmar — DT-061/OD-B08 |
| `evidence[].url`       | referência de armazenamento da evidência       | A URL aceita pelo RENAEST não foi definida.                                  | A confirmar — DT-061/OD-B08 |
| `evidence[].hash`      | hash da evidência                              | Algoritmo e representação nacional não foram definidos.                      | A confirmar — DT-061/OD-B08 |
| `references.renavam`   | veículo referenciado                           | Resolver apenas pela referência autorizada do veículo.                       | A confirmar — DT-061/OD-B08 |
| `references.driverCpf` | pessoa com papel de condutor                   | Aplicar a regra de CPF e a finalidade de acesso.                             | A confirmar — DT-061/OD-B08 |
| `references.aitNumber` | `crash_link` com `kind=ait`                    | Copiar `target_number` quando existir; sem FK rígida e sem criar um número.  | Mapeado                     |

## `CrashCorrectionInput`

`complementCrash` e `correctCrash` recebem a mesma projeção dos campos
alterados. `RectifyCrashCommandDto.kind` escolhe a operação: `complement` chama
`complementCrash`; `correction` chama `correctCrash`. Nenhuma delas é chamada
contra situação nacional terminal.

| Propriedade do adapter | Origem `est/crash`                     | Regra de adaptação                                                         | Situação                    |
| ---------------------- | -------------------------------------- | -------------------------------------------------------------------------- | --------------------------- |
| `reason`               | `RectifyCrashCommandDto.reason`        | Motivo é obrigatório no comando, embora opcional na interface do adapter.  | Mapeado                     |
| `layoutVersion`        | `est.renaest.layout_version`           | Aplicar a mesma regra de proposta `mock` e `source_pending` do relatório.  | A confirmar — DT-061/OD-B08 |
| `severity`             | `crash_record.severity`                | Projetar somente quando a retificação a alterar; usar a derivação vigente. | A confirmar — DT-061/OD-B08 |
| `location`             | `crash_record.location_description`    | Projetar somente quando alterada.                                          | Mapeado                     |
| `latitude`             | `crash_record.location_json.latitude`  | Projetar somente quando alterada.                                          | Mapeado                     |
| `longitude`            | `crash_record.location_json.longitude` | Projetar somente quando alterada.                                          | Mapeado                     |
| `victims`              | `crash_victim[]` + pessoa vinculada    | Usar a tabela de vítimas deste documento.                                  | Mapeado                     |
| `vehicles`             | `crash_vehicle[]`                      | Usar a tabela de veículos deste documento.                                 | Mapeado                     |
| `people`               | `crash_person[]`                       | Usar a tabela de pessoas deste documento.                                  | Mapeado                     |
| `evidence`             | `crash_sketch`/evidências do registro  | Usar a regra de evidências deste documento.                                | A confirmar — DT-061/OD-B08 |
| `references`           | veículos, pessoas e `crash_link`       | Usar a regra de referências deste documento.                               | A confirmar — DT-061/OD-B08 |

## Operações de leitura e resposta do adapter

`getCrash`, `getCrashByProtocol` e `searchCrashes` abastecem a conciliação e
atualizam somente o espelho nacional. O retorno `CrashReport.protocol` é
persistido na submissão; `status` atualiza a situação nacional espelhada. O
retorno `CrashCorrection` preserva protocolo, identificação, tipo e status da
retificação. Erros nacionais são traduzidos pelos códigos `BOAT.*` do catálogo
BOAT, sem transportar PII ou dados de vítima no contexto.
