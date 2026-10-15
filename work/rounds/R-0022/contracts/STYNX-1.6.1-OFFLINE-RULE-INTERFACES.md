# R-0022 — interfaces O de regras e prazo explícito

Architect/F1, 2026-10-13. Extende095bd61d sem mover freeze, sem nova regra
de produto/TTL normativa. F3 RED antes de F2, mesmo path stynx-offline.ports.ts
e adapter handwritten já ativados. Nenhum SDK/DB executado por F1.

## Handoff e recusas

Exports fechados: `StynxOfflineItemApplier(appliers:readonly SyncEntityApplier[])`
implementa public apply(trx,item,context); `SqlStynxAitNumberingRulePort()` sem DB
próprio implementa assertAitNumbering exato095b. Entity parsers continuam os reais.

Modo/payload/UUID parcial ou malformado: code existente do destino
TEAT.SYNC_INVALID_CANONICAL_AIT ou BOAT.SYNC_INVALID_CRASH_RECORD. Details
internamente produzido inválido/maior que port JSON bound: TEAT.INTERNAL, falha
do produtor que não pode confirmar efeito sem metadata. Isso não troca code
original de falha de domínio nem inventa TEAT.INTERNAL para original ausente.
Missing numberingRules → TEAT.SYNC_DESTINATION_NOT_WIRED. SQL rule ausência/
ambiguidade/foreign tenant/device/org/entity/shift →
TEAT.NUMBERING_RESERVATION_FOREIGN_SHIFT; consumption realmente applied →
TEAT.NUMBERING_NUMBER_ALREADY_APPLIED; reserva/consumo realmente expirado/
invalidado → TEAT.NUMBERING_RESERVATION_EXPIRED. Native guards anteriores ao
apply mantêm tradução total do SDK, não são reclassificados pelo consumer port.
Rejeição tipada é requisito; TypeError arbitrário não conta como sensor positivo.

## V06 — frame de um prazo original futuro

Public1.6.1 reserveDurableNumbering exige policy.reservationTtlMs positivo antes
de usar input.validUntil. Legacy reserve usa catálogo apenas quando valid_until
ausente. Para **original deadline futuro**, é permitido fornecer o requisito
interno do SDK a partir desse próprio deadline, sem TTL fallback ou norma criada.

Exports consumidores no mesmo ports file:

- `StynxOfflinePolicyResolver(parameters:ParameterPort)` implementa public
  OfflineSyncPolicyResolver.resolve(input). ParameterPort é estrutura existente
  get(key,options); nenhuma fonte normativa/env nova.
- `StynxOfflineReservationPort(service:Pick<OfflineSyncService,
'reserveDurableNumbering'>,policies:StynxOfflinePolicyResolver,
requestContext:RequestContextPort)` com único método
  `reserve(input:CTG9ReserveNumberingInput):Promise<CTG9NumberingReservation>`.
  RequestContextPort é estrutura existente hasActiveContext/snapshot; não mock
  production context. Corpo HTTP não escolhe resolver/service/tenant/callback.

Port captura scope trusted atual e uma cópia detached do input validado; chama
o public service passando esse original inalterado. Module-private
AsyncLocalStorage frame tem tenant/orgUnit/operation reserve-numbering/original
validUntil, identidade da instância policies e token único ativo. Dados frozen,
sem caller callback/setter ou armazenamento mutable de body/global deadline.
Set/WeakMap privado controla vida do token: finally revoga mesmo em throw; uma
continuação tardia que ainda carregue ALS não conserva autorização após retorno.

Resolver confere instância/token ativo/tenant/orgUnit/operação e actual at do
public request. Para prazo explícito futuro, TTL derivado é exatamente
Date.parse(originalValidUntil)-Date.parse(input.at), finito/positivo, default
deadline resultante igual ao original. ValidUntil passa sem normalização; clock
injetado/SQL admission time não são substituídos. Sem frame/sem validUntil, caminho
normal continua catálogo com unidade/escopo/required refusal existentes. Frame
malformado/fechado/cross-instance não vira fallback para outra fonte; recusa
tipada existente TEAT.VALIDATION_FAILED, tenant mismatch TEAT.TENANT_MISMATCH.
Replay que o public service resolve antes da política permanece original e não
gera prazo/UUID novo. Nested run restaura frame externo, concurrent calls isolam.

F3 acrescenta stynx-offline.ports.spec.ts antes de implementation: explicit future
com catálogo ausente passa mesmo validUntil e TTL derivado; default usa catálogo,
default missing TTL conserva required refusal; duas chamadas concorrentes A/B e
órgãos/deadlines diferentes sem vazamento; nested restoration, wrong resolver
instance/org/tenant/operation, late continuation após success/throw, replay
inalterado e ausência de literal24h/ambiente/setter. Fixtures são TEST_ONLY.

**Gap separado:** legacy source aceita valid_until fornecido sem teste future;
SDK1.6.1 recusa explicitamente <=actual at. Frame futuro não resolve past/equal,
não muda assertion ou restringe contrato silenciosamente. Esse caso permanece
capability/parity checkpoint até solução pública real demonstrada; não fakear
now, TTL, prazo original ou public result. Não é razão para parar o resto da lane.
