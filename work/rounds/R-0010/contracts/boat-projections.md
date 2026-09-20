# Contrato de projeções BOAT — C-2-13/C-2-14

**Papel:** Architect  
**Rodada:** R-0010  
**Escopo:** `portal.crash_view`, `dashboard.crashes` e
`integration.renaest_mirror`.

Este contrato concretiza C-2-13 e C-2-14, ADR-0020 e a adenda A-1 de
CTG-0002. Cada leitura pertence ao seu consumidor, é reconstruível a partir da
outbox e não emite comando nem altera `est.*`. SSE é uma visão ao vivo dos
mesmos eventos e nunca uma fonte de reconstrução.

## 1. Evento BOAT canônico

Uma linha de `integration.outbox` é a única fonte. O evento canônico é a
combinação da linha e de seu `payload`; o projetor não lê `est.*` para completar
o envelope.

| Campo canônico            | Origem na outbox                       | Regra                                                                                                                                   |
| ------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `event.id`                | `integration.outbox.id` e `payload.id` | UUID gerado pela outbox; os dois valores devem coincidir.                                                                               |
| `event.name`              | `payload.domainEvent`                  | Token canônico de domínio, nunca `payload.type` SSE.                                                                                    |
| `event.schema_version`    | `payload.schemaVersion`                | Inteiro positivo da forma do envelope, independente do fato de domínio.                                                                 |
| `event.occurred_at`       | `payload.occurredAt`                   | Instante do fato em ISO-8601.                                                                                                           |
| `event.tenant_id`         | `integration.outbox.tenant_id`         | A fonte autorizada de tenant; `payload.tenantId`, quando presente, deve coincidir.                                                      |
| `event.aggregate.kind`    | `payload.aggregate.kind`               | `crash-record` ou `crash-renaest-submission`, conforme o evento.                                                                        |
| `event.aggregate.id`      | `payload.aggregate.id`                 | UUID do agregado.                                                                                                                       |
| `event.aggregate.version` | `payload.aggregate.version`            | Versão do agregado; não é versão de schema.                                                                                             |
| `event.payload`           | `payload.data`                         | Somente os campos mínimos da tabela seguinte; sem CPF, nome, placa, contato, endereço, coordenada, destino hospitalar ou dado de saúde. |

`payload.type` é o tipo técnico de entrega: `crash.changed` ou
`crash.renaest.changed` quando o evento também é publicado por SSE; o tópico
durável nomeado pode ser igual a `event.name`. Nem `type` nem o stream alteram
`event.name`. O consumidor valida primeiro `event.id`, tenant, nome,
`schema_version`, `aggregate.kind`, `aggregate.id` e `aggregate.version`; versão
de schema ausente, não inteira ou não suportada é rejeitada de modo controlado,
sem ledger e sem efeito de projeção.

### 1.1 Forma requerida

O contrato requerido para toda nova emissão BOAT é, em termos lógicos:

```ts
type BoatOutboxEvent = {
  id: string;
  name: string;
  schema_version: number;
  occurred_at: string;
  tenant_id: string;
  aggregate: {
    kind: 'crash-record' | 'crash-renaest-submission';
    id: string;
    version: number;
  };
  payload: Record<string, unknown>;
};
```

Os nomes acima descrevem o contrato normalizado a partir da linha da outbox e
de seu JSON. Eles não criam outra fila, outro evento ou outra fonte de dados.

### 1.2 Eventos e payload mínimo

| Evento `event.name`               | Origem                                 | `aggregate.kind`           | Payload mínimo canônico                                             |
| --------------------------------- | -------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| `SINISTRO_RECEBIDO_SINCRONIZACAO` | aplicador da fila TEAT                 | `crash-record`             | `state`, `localEntityId`                                            |
| `SINISTRO_INICIADO`               | rota `start`                           | `crash-record`             | `state: 'EM_ATENDIMENTO'`                                           |
| `SINISTRO_REGISTRADO`             | rota `record` ou `complement`          | `crash-record`             | `state: 'REGISTRADO'`                                               |
| `VITIMA_REGISTRADA`               | rota `add-victim`                      | `crash-record`             | `{}`; a existência da vítima não autoriza dado de saúde no envelope |
| `SINISTRO_VALIDADO`               | rota `validate`                        | `crash-record`             | `state: 'VALIDADO'`                                                 |
| `SINISTRO_FECHADO`                | rota `close`                           | `crash-record`             | `state: 'FECHADO'`                                                  |
| `SINISTRO_TRANSMISSAO_PENDENTE`   | rota/job `transmit`                    | `crash-record`             | `state: 'FECHADO'`                                                  |
| `SINISTRO_TRANSMITIDO`            | recibo de `RenaestPort.submitCrash`    | `crash-renaest-submission` | `protocol`, `nationalStatus: 'RECEBIDO'`                            |
| `SINISTRO_SITUACAO_NACIONAL`      | recibo de transmissão ou retificação   | `crash-renaest-submission` | `nationalStatus` (`RECEBIDO` ou `EM_ANALISE` emitidos hoje)         |
| `SINISTRO_RETIFICACAO_PENDENTE`   | rota `renaest/complement` ou `correct` | `crash-record`             | `kind`, sem motivo livre no evento consumidor                       |
| `SINISTRO_RETIFICADO`             | recibo de complemento/correção         | `crash-renaest-submission` | `protocol`, `kind`                                                  |
| `SINISTRO_ARQUIVADO`              | rota `archive`                         | `crash-record`             | `state: 'ARQUIVADO'`                                                |
| `PEDIDO_TITULAR_REGISTRADO`       | rota `subject-requests`                | `crash-record`             | `kind`, `status`; CPF e finalidade não entram no envelope           |

Os eventos auxiliares hoje emitidos (`SINISTRO_CONDUTA_REGISTRADA`,
`VEICULO_REGISTRADO`, `PESSOA_REGISTRADA`, `DANO_REGISTRADO`,
`TESTEMUNHA_REGISTRADA`, `CROQUI_ANEXADO` e `SINISTRO_VINCULADO`) podem ser
reproduzidos pela outbox, mas não ampliam a superfície pública nem são
necessários para formar o espelho nacional. `dashboard.crashes` pode usar os
eventos de estado que carreguem os campos agregáveis já autorizados; se um
payload não os contiver, a projeção o rejeita ou aguarda o produtor, sem buscar
o registro individual em `est.*`.

### 1.3 Divergências observadas no emissor atual

1. `TeatEventEnvelope` persiste `version` e o emissor BOAT a preenche com
   `aggregate.version`; não existe `payload.schemaVersion` separado. Isso não
   satisfaz `event.schema_version` e `event.aggregate.version` independentes.
   O projetor não pode assumir `1` nem reutilizar a versão do agregado como
   schema. O produtor deve emitir a versão de schema antes de um consumidor
   aceitar a forma canônica. O ramo de sucesso do par emitido hoje permanece
   pendência de TASK-0007; sua rejeição controlada é requisito de TASK-0014.
2. O envelope escrito usa `occurredAt`, `tenantId`, `domainEvent` e `data`,
   enquanto a linha tem `tenant_id` e `id`. A normalização descrita em §1 é a
   única interpretação autorizada; não há segundo evento derivado de SSE.
3. O fato de comando/transmissão grava duas linhas: uma com `type`/`topic`
   técnico (`crash.changed` ou `crash.renaest.changed`) e outra nomeada com
   `type`/`topic = domainEvent`; os UUIDs são diferentes apesar de
   `event.name`, agregado e versão serem os mesmos. O consumidor deduplica o
   fato por `(event.name, event.aggregate.id, event.aggregate.version)` antes
   do ledger: aceita exclusivamente a linha nomeada. A exceção é
   `SINISTRO_RECEBIDO_SINCRONIZACAO`, que o aplicador grava apenas como
   `crash.changed` e que permanece consumível nesse tópico. Assim, SSE continua
   observável, mas não duplica efeito ou contagem.
4. `SINISTRO_REGISTRADO` e `PEDIDO_TITULAR_REGISTRADO` são exigidos pelo
   contrato de rotas, mas não são emissões literais verificáveis nas fontes de
   TASK-0007 examinadas. Nenhum projetor deve inventá-los; a cobertura do
   produtor permanece pendência de TASK-0007.
5. O recibo atual expõe `nationalStatus` e o evento de retificação pendente
   carrega `reason`. O primeiro é o token existente do recibo; o segundo não é
   campo de consumidor e não entra em `integration.renaest_mirror` nem em
   superfícies Portal/Dashboard.

## 2. Regras comuns de projeção e replay

1. Cada aplicação abre transação com tenant autorizado e RLS ativo. A
   operação insere a linha de ledger e o efeito de domínio na mesma transação;
   falha de qualquer passo reverte ambos.
2. Os dois blueprints novos usam a chave única
   `(tenant_id, projection_name, event_id)`. O Portal reutiliza
   `portal.projection_applied_event` e sua coluna existente `projection`, cuja
   chave equivalente é `(tenant_id, event_id, projection)`.
3. A seleção canônica primeiro deduplica o fato por `(event.name,
event.aggregate.id, event.aggregate.version)` e só então o ledger por
   `event_id` evita reexecução da mesma linha. Um evento novo conserva
   `event_schema_version` e `aggregate_version` em campos diferentes no efeito
   e no ledger de `dashboard.crashes` e `integration.renaest_mirror`. Portal
   não altera DDL 65: nele a separação é comportamental — schema ausente/não
   suportado é rejeitado sem reutilizar `aggregate.version` como schema, efeito
   ou ledger.
4. Replay integral seleciona os eventos canônicos de todos os tenants sob
   contexto individual e reconstrói o consumidor a partir de tabelas vazias.
   Replay incremental seleciona eventos cujo ledger daquele consumidor ainda
   não exista. Não usa cursor exclusivo de `(created_at, id)`: um evento que
   comitou tarde continua sem ledger e deve ser encontrado mesmo se seu
   `created_at` for anterior ao último evento já aplicado.
5. A rejeição de schema não suportado deixa diagnóstico controlado fora do
   ledger de sucesso e não avança cursor ou marca o evento como aplicado. A
   nova execução pode aceitá-lo somente depois de suporte explícito à versão.
6. O projetor não escreve em `est.*`; `integration.renaest_mirror` tampouco
   transiciona `FECHADO` para `INTEGRADO`. Essa transição pertence ao worker de
   origem que recebeu o protocolo.

### 2.1 Entry points verificáveis de replay

R-0009 já materializou e exportou `PortalProjectors` pelo
`BP-PORTAL-PROJECTIONS-001`: ele contém `CrashViewProjector`, o dispatcher, o
ledger `portal.projection_applied_event` e os entry points `applyEvent`,
`rebuild` e `rebuildAll`. TASK-0014 estende esses artefatos existentes; não
cria `PortalCrashProjection`, `boat-crash.projection.ts` ou
`BoatProjectionsReplayService`.

Para Portal, a aplicação unitária usa
`PortalProjectors.applyEvent(event, tx)` dentro de transação já tenant-scoped.
O replay integral de BOAT usa
`PortalProjectors.rebuild(tenantId, 'crash_view')`. TASK-0014 estende
`PROJECTOR_BY_AGGREGATE_KIND` com `crash-record` e
`crash-renaest-submission`, alinha `CRASH_AGGREGATE_KIND` a esses valores e
mantém o caso histórico `crash`. A janela preserva `inf.%`/`rait.%` e acrescenta
os tópicos reais `crash.changed`, `crash.renaest.changed` e os tokens
`SINISTRO_*`; o dispatcher consome as linhas técnicas somente na exceção de
sincronização descrita em §1.3(3), e as demais apenas no tópico nomeado.

O incremental vivo é o `PortalProjectors.tick`, não um método paralelo.
TASK-0014 substitui `LAST_APPLIED_SQL` e `WINDOW_SINCE_SQL`, que usam
`max(applied_at)` e `created_at > ...`, por seleção com anti-join ao ledger:
para cada candidato BOAT de `crash_view`, `not exists` em
`portal.projection_applied_event` com o mesmo `event_id` e
`projection = 'crash_view'`. A seleção canônica ocorre antes desse anti-join.
O mesmo princípio vale para os demais consumidores da janela, preservando
`inf.*`/`rait.*`. Um evento que comita tarde permanece candidato. O método
recebe o tenant somente no modo de job já previsto pelo serviço e, em
request/teste com contexto ativo, preserva o tenant do `RequestContext` e RLS.

Dashboard e espelho mantêm entry points de aplicação e replay nos seus próprios
providers manuscritos. Cada entry point recebe o contexto autenticado ou de job
já autorizado, não aceita CPF, hash de CPF ou alegação de titularidade para
escolher tenant, e reporta somente o resultado do seu consumidor. Não há um
coordenador de replay Portal paralelo.

Envelope inválido ou schema ausente/não suportado falha de modo tipado antes de
ledger ou efeito. A implementação deve reutilizar os códigos já expostos pelo
consumidor quando existirem; não cria `BOAT.PROJECTIONS_*` apenas para esta
rodada. Falha de transação, RLS ou projetor é propagada e reverte o efeito e o
ledger daquela aplicação.

### 2.2 Leituras internas verificáveis e falha transacional

TASK-0014 exporta a leitura Dashboard abaixo como provider interno, sem
controller ou rota HTTP. TASK-0013 a invoca no mesmo `RequestContext`
autorizado usado pelo replay; ela não recebe `tenantId`, CPF,
`subject_cpf_hash` ou alegação de titularidade como argumento.

```ts
export type DashboardCrashCell = {
  periodStart: string;
  municipalityCode: string;
  severity: string;
  count: number | null;
  suppression: 'none' | 'primary' | 'secondary';
};

export type DashboardCrashesRead = {
  cells: readonly DashboardCrashCell[];
  total: number | null;
  totalSuppressed: boolean;
  publicationStatus: 'blocked';
};

export class DashboardCrashesProjection {
  readInternal(input: {
    periodStart: string;
    periodEnd: string;
  }): Promise<DashboardCrashesRead>;
}
```

`DashboardCrashesProjection` permanece em
`backend/domains/dashboard/crashes/src/handwritten/dashboard-crashes.projection.ts`.
`readInternal` é uma leitura de agregados internos, mas aplica o limiar vigente
`dashboard.cell_threshold=10`, supressão primária e secundária antes de expor
`cells` ou `total`: valor suprimido é `null`, nunca `0`; `publicationStatus` é
sempre `blocked`. Portanto os testes podem demonstrar célula com `n < 10`, a
célula/total secundário que evitaria subtração e a impossibilidade de publicar
P-09, sem criar superfície pública.

Não há API `PortalCrashProjection.readCitizen`. A superfície cidadã é a já
materializada `PortalCrashesController`, guardada por identidade e entitlement.
TASK-0014 estende `CrashViewProjector` e, se a regra de visibilidade exigir
filtro adicional, o controlador existente. Enquanto a fonte canônica não
carregar vínculo de titularidade autorizado, `CrashViewProjector` não cria uma
linha publicável; CPF ou hash fornecido pela requisição não completa o evento.
Com vínculo canônico autorizado, o controlador existente preserva a relação
autenticada, limita a exposição a `FECHADO`/`INTEGRADO`, mantém terceiros
mascarados e exclui saúde do resumo. Nenhum provider paralelo é criado para
simular essa decisão.

O teste de rollback usa uma linha de outbox de
`SINISTRO_SITUACAO_NACIONAL` com envelope estruturalmente válido, mas
`payload.nationalStatus` fora do conjunto permitido pelo DDL, e invoca
`replay`. O upsert em `integration.renaest_mirror` deve atingir a constraint
real `ck_integration_renaest_mirror_status`; não há flag, mock, hook ou ramo de
falha de produção. O teste observa a exceção do banco e confirma que não existe
nem efeito no espelho nem linha em
`integration.renaest_mirror_applied_event` para aquele `event_id`.

Os testes cross-tenant instalam `RequestContext` do tenant A ou B antes de cada
aplicação ou leitura; não selecionam tenant por argumento de superfície
cidadã. Eles exercitam `PortalProjectors` para Portal e os providers próprios
para Dashboard/Espelho. Replay `full` reconstrói o consumidor no tenant
autorizado e o incremental reencontra evento sem ledger que tenha comitado
tarde. Para schema não suportado, cada teste espera o erro tipado já definido
pelo consumidor, sem resultado de sucesso, efeito ou ledger.

## 3. Consumidores

### 3.1 Portal — `portal.crash_view`

O Portal é dono da vista cidadã e do ledger existente no DDL 65. Enquanto o
vínculo de titularidade autenticada estiver `source_pending`, a projeção pode
existir apenas para processamento interno: nenhuma rota cidadã, CPF informado
ou hash de CPF prova titularidade. Quando existir vínculo confiável, a leitura
limita-se a `FECHADO` e `INTEGRADO`; o titular vê seu próprio dado sem máscara,
terceiros veem os campos de terceiros mascarados e dados de saúde jamais entram
no envelope público. Isso aplica RN-PORTAL-118 sem converter a projeção em
prova de identidade.

R-0009 já concluiu o wiring M24: o blueprint registra `PortalProjectors`,
`ProjectionsModule` o exporta e `handwritten/index.ts` já exporta
`CrashViewProjector`. TASK-0014 altera somente os arquivos manuscritos
existentes `projectors.service.ts`, `crash-view.projection.ts` e, se o filtro de
visibilidade o exigir, `crashes.controller.ts`. Não altera blueprint, DDL 65,
fontes geradas nem cria outro provider/export Portal.

### 3.2 Dashboard — `dashboard.crashes`

`BP-DASHBOARD-CRASHES-001` cria `dashboard.crash_aggregate` e
`dashboard.crash_projection_applied_event`. É uma agregação interna por
período, município e gravidade, sem pessoa, veículo, placa, localização precisa
ou saúde. `DashboardCrashesProjection` é o provider e export manuscrito em
`handwritten/dashboard-crashes.projection`.

Qualquer leitura ou exportação aplica antes da resposta
`dashboard.cell_threshold=10`, supressão primária e supressão secundária (ou
supressão do total) quando a diferença permitir recuperar uma célula. P-09 fica
fechado até haver os cinco controles de RN-DASH-161 — limiar, supressão
secundária, generalização onde possível, teste contra informação pública e
nenhuma consulta livre — e a anonimização verificável de RN-BOAT-131.

### 3.3 Espelho — `integration.renaest_mirror`

`BP-INTEGRATION-RENAEST-MIRROR-001` cria
`integration.renaest_mirror` e `integration.renaest_mirror_applied_event`.
Ele é o pacote físico `backend/domains/integration/renaest-mirror`, com
propriedade lógica do adapter conforme a emenda de ADR-0001 e ADR-0020. O
provider/export é `RenaestMirrorProjection` em
`handwritten/renaest-mirror.projection`.

Consome `SINISTRO_TRANSMITIDO`, `SINISTRO_SITUACAO_NACIONAL` e
`SINISTRO_RETIFICADO`; mantém protocolo, situação e fatos de retificação sem
motivo livre, PII ou saúde. Não chama SENATRAN: toda chamada externa segue
exclusiva em `packages/senatran-adapter`.

## 4. Fronteira entre domínios

TASK-0014 implementa `tools/domain-boundaries/verify.mjs`. Enquanto R-0007
retiver o `package.json` raiz, o comando verificável é
`node tools/domain-boundaries/verify.mjs`; o maestro registra o script
`verify:domain-boundaries` no manifesto raiz somente após a liberação. O gate
percorre código de backend e falha
para SQL ou acesso de repository que nomeie schema de outro domínio. A exceção
é estrita: o arquivo deve terminar em `*.projection.ts` e declarar no próprio
módulo uma lista não vazia, literal e exportada:

```ts
export const consumedEvents = ['SINISTRO_FECHADO'] as const;
```

Essa exceção permite ao projetor ler a outbox de `integration` para os eventos
que declarou. Ela não permite SQL para `est.*`, escrita em outro schema, nem
consulta cruzada em controller, service, repository ou arquivo com outro sufixo.
O caso permitido de TASK-0013 é um `*.projection.ts` com `consumedEvents` que
lê `integration.outbox`; o proibido é um service/repository comum que lê
`est.crash_record` ou qualquer schema de outro domínio. O gate falha se a lista
estiver ausente, vazia, dinâmica ou se o nome do evento consumido não for um dos
tokens deste contrato.

## 5. Ordem de DDL e geração

`backend/database/apply.sh` aplica arquivos numerados em ordem lexical. A base
`04-integration-storage.sql` já fornece `integration.outbox`; a ordem relevante
é `65-portal-projections.sql` (R-0009), `70-est-crash.sql`,
`71-dashboard-crashes.sql` e `72-integration-renaest-mirror.sql`.

O maestro executa `pnpm blueprints:generate` para o diretório inteiro e exige
diff vazio em `docs/framework/blueprints/BP-PORTAL-PROJECTIONS-001.json`,
`backend/database/ddl/65-portal-projections.sql` e
`backend/domains/portal/projections/**`, depois `pnpm blueprints:check` verde.
Os arquivos esperados dos novos blueprints são os pacotes gerados
`backend/domains/dashboard/crashes/**` e
`backend/domains/integration/renaest-mirror/**`, os DDLs 71/72, seus contratos
OpenAPI e `tools/blueprints/generated-files.json`. Nenhum desses artefatos foi
gerado por esta tarefa.

## 6. Verificação exigida em TASK-0013/0014

Os testes cobrem C-2-13/C-2-14 por tenant: replay integral, `tick` incremental,
efeito/ledger único para duas linhas **canônicas** do mesmo fato com
`schemaVersion` suportado na fixture, commit tardio, RLS entre tenants,
atomicidade ledger+efeito, ausência de escrita em `est.*` e SSE fora da
reconstrução. Em cenário separado, o par tal como emitido hoje, sem
`schemaVersion`, prova rejeição controlada tipada sem efeito nem ledger: é RED
legítimo da ausência de TASK-0014, entra na contagem e deve ficar verde. Só o
ramo de sucesso desse par legado permanece pendência de TASK-0007 e fora do
conjunto verde. Portal prova separação de versão por comportamento;
Dashboard/Espelho a persistem em campos distintos. Eles também cobrem Portal
`source_pending`; o ramo cidadão positivo permanece `source_pending` até existir
vínculo canônico, sem fixture de CPF/hash. Dashboard cobre ambas as supressões e
P-09 fechado; Espelho não transiciona BOAT; o gate tem casos permitido/proibido.

## OD

Nenhuma OD nova. Permanecem aplicáveis OD-B08/DT-061 para dados nacionais não
confirmados e OD-B09/DT-029 para o limiar já decidido.
