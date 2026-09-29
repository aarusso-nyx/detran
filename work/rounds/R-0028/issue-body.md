# Issue da frente `boat-wiring` (R-0028) — corpo proposto

Título sugerido: **BOAT: ligar telas e portas ao backend `est/crash` (R-0028, ação 6 da C-0002)**

> Este arquivo só redige o corpo; a issue não foi criada no GitHub.

## Contexto

Handoff de ligação de R-0015: as 12 telas mobile e as 5 telas web do BOAT existem como estrutura
(fichas, schemas, transições, catálogo, rotas e componentes), mas os formulários não estão ligados
a `est/crash` e as seis portas nativas (`InjectionToken`s) não têm implementação nem consumo pelas
páginas (OD-R15-006). A frente R-0028 (`boat-wiring`) é a ação 6 da C-0002. Decisão do Owner em
2026-09-26 (OD-R28-001 = (a)): o caminho real é implementado atrás do gateway e provado na stack
local e em e2e; os hosts TEAT mantêm a homologação como padrão, as rotas levam o selo
`homologacao` e a ADR-0033 não é ampliada.

## Escopo por CTG

- **CTG-0001 — matriz e ODs:** `work/rounds/R-0028/binding-matrix.md`; desenho de
  `BoatCrashGateway` e das seis portas; ODs no registro canônico
  (`docs/framework/arch/boat-build-pack.md` §4).
- **CTG-0002 — portas:** implementação web/homologação de GPS, câmera, assinatura, croqui,
  armazenamento cifrado e atestação, sem `@capacitor/*` (#109 fora); atestação nunca `true`.
- **CTG-0003 — mobile:** 12 telas e 10 componentes ligados a schemas, gates, gateway e estados;
  hosts do TEAT mobile fornecem gateway e portas.
- **CTG-0004 — web:** 5 telas de `sinistros` (lista, detalhe, complemento, RENAEST, pedido do
  titular) ligadas, sem alterar o shell do TEAT web.
- **CTG-0005 — smoke, delta e docs:** jornadas na stack local, `boat.availability.json`, build
  pack, `boat-frontends.md`, READMEs, backlog e `waves.md`.

## Liberado agora (adenda A-C2-15)

TASK-0001 e TASK-0002 (matriz, contratos e ODs) e TASK-0003 e TASK-0004 (specs e implementação das
portas de homologação em `apps/boat/mobile/src/lib/ports/`).

## Espera R-0024 e R-0022

- **R-0024** (padrão `frontend-wiring-pattern.md`): TASK-0005…0009 (páginas, gateway, telas web).
- **R-0022** (SSE canônico): `crash.changed` em W-01…W-04 (OD-R28-015).
- **Pilha local:** TASK-0010 (smoke) e TASK-0011 (documentos) esperam TASK-0007 e TASK-0009 e
  `pnpm stack:start`/`stack:status` verdes.
- Todo contrato produzido agora é reconferido contra `origin/main` na retomada; divergência vira
  adenda numerada.

## ODs relacionadas

- Migradas de R-0015: OD-R15-003 (`screenId` de W-05), OD-R15-004 (13 textos `source_pending`),
  OD-R15-005 (`uxCode` de S-12), OD-R15-006 (portas sem implementação/consumo).
- Novas: OD-R28-001…019. Decididas pelo Owner: 001 (2026-09-26); 007, 008, 010, 011, 013, 014,
  016, 017 (2026-09-29). Do Architect: 002 e 003 fechadas; 004, 005, 006, 009, 012, 015, 018, 019
  aceitas como provisórias (015, 019 e 005 reconferidas após R-0024/R-0022).

## Rastreio

- Dentro: #118 (OD-R15-003/005), #119 (OD-R15-004).
- Fora: #120 (RENAEST real), #109 (Capacitor).
