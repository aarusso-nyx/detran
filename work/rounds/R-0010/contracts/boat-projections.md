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
   aceitar a forma canônica.
2. O envelope escrito usa `occurredAt`, `tenantId`, `domainEvent` e `data`,
   enquanto a linha tem `tenant_id` e `id`. A normalização descrita em §1 é a
   única interpretação autorizada; não há segundo evento derivado de SSE.
3. O aplicador de sincronização registra apenas `crash.changed` para
   `SINISTRO_RECEBIDO_SINCRONIZACAO`; os comandos gravam também tópico nomeado.
   O consumo usa `event.name`, portanto não depende da duplicação de tópico.
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
3. Duplicata encontra o ledger e não reaplica. Um evento novo conserva
   `event_schema_version` e `aggregate_version` em campos diferentes, tanto no
   efeito como no ledger dos novos consumidores.
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

### 2.1 Entry point verificável de replay

TASK-0014 implementa e exporta `BoatProjectionsReplayService` em
`backend/app/src/boat-projections.replay.ts`. O serviço é o único entry point
de replay que TASK-0013 invoca, pela instância Nest já autenticada ou por
injeção do provider; não há rota HTTP nova nem chamada direta a um projetor.

```ts
export type BoatProjectionsReplayMode = 'full' | 'incremental';

export type BoatProjectionsReplayResult = {
  mode: BoatProjectionsReplayMode;
  tenantId: string;
  scanned: number;
  applied: {
    portalCrashView: number;
    dashboardCrashes: number;
    renaestMirror: number;
  };
  duplicates: number;
};

export class BoatProjectionsReplayService {
  replay(input?: {
    mode?: BoatProjectionsReplayMode;
  }): Promise<BoatProjectionsReplayResult>;
}
```

`tenantId` no retorno é somente o tenant efetivo para diagnóstico de teste; o
método não aceita `tenantId` de entrada. Ele obtém o tenant e o ator do
`RequestContext` já autorizado, abre as transações com esse contexto e deixa
RLS limitar a leitura da outbox, os efeitos e os ledgers. Contexto sem tenant
falha antes de qualquer SQL com `BOAT.PROJECTIONS_TENANT_REQUIRED`.

`full` reconstrói somente as três projeções daquele tenant a partir da forma
canônica da outbox. `incremental` busca, para o mesmo tenant, eventos canônicos
sem ledger de cada consumidor; ele não avança um cursor exclusivo de
`(created_at, id)`. Assim, uma transação que comita tarde continua elegível
mesmo quando seu `created_at` é anterior ao último evento processado.

Envelope inválido falha com `BOAT.PROJECTIONS_ENVELOPE_INVALID` e schema
ausente ou não suportado com `BOAT.PROJECTIONS_SCHEMA_UNSUPPORTED`. Nenhuma
dessas falhas retorna `BoatProjectionsReplayResult`, cria ledger de sucesso,
incrementa `applied` ou deixa efeito parcial. Em particular, schema não
suportado é uma falha tipada da chamada `replay`, e não um item contado como
`rejected`; TASK-0013 deve esperar essa falha e verificar a ausência de efeito
e ledger. Falha de transação, RLS ou projetor é propagada e reverte o efeito e
o ledger daquela aplicação.

### 2.2 Leituras internas verificáveis e falha transacional

TASK-0014 exporta as leituras abaixo como providers internos, sem controller ou
rota HTTP. TASK-0013 as invoca no mesmo `RequestContext` autorizado usado para
`replay`; nenhuma recebe `tenantId`, CPF, `subject_cpf_hash` ou alegação de
titularidade como argumento.

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

```ts
export type PortalCrashCitizenRead =
  | {
      access: 'denied';
      reason: 'source_pending' | 'not_holder' | 'state_not_visible';
    }
  | {
      access: 'granted';
      state: 'FECHADO' | 'INTEGRADO';
      subject: { masked: false; summary: Record<string, unknown> };
      thirdParties: readonly {
        masked: true;
        summary: Record<string, unknown>;
      }[];
    };

export class PortalCrashProjection {
  readInternal(crashId: string): Promise<Record<string, unknown> | null>;
  readCitizen(crashId: string): Promise<PortalCrashCitizenRead>;
}
```

`PortalCrashProjection` é o provider declarado em §3.1 para
`backend/domains/portal/projections/src/handwritten/boat-crash.projection.ts`;
R-0009 continua dono do wiring no blueprint Portal. `readCitizen` resolve a
relação somente do vínculo de identidade autenticada já presente no
`RequestContext`: `source_pending` devolve `access: 'denied'`, e um CPF, hash
ou parâmetro do chamador não muda esse resultado. Quando o vínculo já for
confiável, o titular recebe seus próprios campos sem máscara e terceiros só
recebem resumos mascarados; saúde fica fora de ambos os resumos públicos.
`readInternal` não torna a projeção uma rota cidadã.

O teste de rollback usa uma linha de outbox de
`SINISTRO_SITUACAO_NACIONAL` com envelope estruturalmente válido, mas
`payload.nationalStatus` fora do conjunto permitido pelo DDL, e invoca
`replay`. O upsert em `integration.renaest_mirror` deve atingir a constraint
real `ck_integration_renaest_mirror_status`; não há flag, mock, hook ou ramo de
falha de produção. O teste observa a exceção do banco e confirma que não existe
nem efeito no espelho nem linha em
`integration.renaest_mirror_applied_event` para aquele `event_id`.

Os testes cross-tenant instalam `RequestContext` do tenant A ou B antes de cada
chamada a `replay`, `readInternal` ou `readCitizen`; não selecionam tenant por
argumento. Replay `full` reconstrói o tenant do contexto e `incremental`
reencontra evento sem ledger que tenha comitado tarde. Para schema não
suportado, o teste chama `replay` e espera
`BOAT.PROJECTIONS_SCHEMA_UNSUPPORTED`, sem resultado de replay, efeito ou
ledger.

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

R-0009 mantém o lock do blueprint e do DDL Portal. Ao liberar o wiring M24,
deve acrescentar exatamente ao `module` de
`BP-PORTAL-PROJECTIONS-001.json`:

```json
{
  "handwrittenProviders": [
    {
      "target": "handwritten/boat-crash.projection",
      "symbol": "PortalCrashProjection"
    }
  ],
  "handwrittenExports": ["handwritten/boat-crash.projection"]
}
```

O acréscimo é aditivo às listas já existentes e gera o provider/export para
`backend/domains/portal/projections/src/handwritten/boat-crash.projection.ts`.
TASK-0012 não altera o blueprint, DDL 65 ou fontes geradas do Portal.

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

TASK-0014 implementa `pnpm verify:domain-boundaries` em
`tools/domain-boundaries/verify.mjs`. O gate percorre código de backend e falha
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

Os testes cobrem C-2-13/C-2-14 por tenant: replay integral e incremental,
duplicata, versões separadas, schema incompatível sem avanço, commit tardio,
RLS entre tenants, atomicidade ledger+efeito, ausência de escrita em `est.*` e
SSE fora da reconstrução. Eles também cobrem Portal `source_pending`, a relação
titular/terceiro e estados publicados; Dashboard com ambas as supressões e P-09
fechado; Espelho sem transição BOAT; e os casos permitido/proibido do gate.

## OD

Nenhuma OD nova. Permanecem aplicáveis OD-B08/DT-061 para dados nacionais não
confirmados e OD-B09/DT-029 para o limiar já decidido.
