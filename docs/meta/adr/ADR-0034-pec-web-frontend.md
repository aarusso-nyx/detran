# ADR-0034: PEC ganha frontend web

## Status

**Decisão do Owner em 2026-09-26 (OD-C2-002, campanha C-0002).** O Architect propõe e o Owner aceita.
Esta ADR supersede a regra "no frontend planned" de `apps/pec/web/README.md` (Orchestration rule 7,
"deferred by decision"). A implementação é a **última rodada** da campanha C-0002
(`work/campaigns/C-0002-consolidacao.md`).

## Contexto

- O PEC (Prontuário Eletrônico do Condutor) foi portado em Phase 6 como backend puro: são 17 módulos
  em `backend/domains/ch/*`, com paridade fechada pela ADR-0012 e pela ADR-0013. O slot
  `apps/pec/web` ficou reservado e vazio.
- [IU-PEC-001] (status `reviewed`) propõe 26 telas em três superfícies:
  - A — console clínico (12 telas);
  - B — console regulatório (7 telas);
  - C — portal do candidato (7 telas).
    O documento declara que nenhuma dessas telas existe como artefato de origem.
- A inspeção de 2026-09-25 constatou três problemas:
  - A decisão de não haver frontend não estava registrada em ADR.
  - Várias rotas manuscritas do PEC não têm contrato OpenAPI.
  - O PEC não tem fixtures e não tem testes de integração com Postgres.

## Decisão

1. **Consoles A e B em `apps/pec/web`.** O pacote é `@detran/pec-web`, com Angular 22 sobre o
   substrato STYNX vigente na data da rodada e `@detran/ui`. Segue o padrão de scaffold dos apps
   existentes (`apps/rait/web`, R-0012; `apps/portal/web`, R-0014), já consolidado pela campanha
   C-0002 (SSE, autorização e shell canônicos).
2. **Superfície C dentro do Portal.** As telas P-01…P-07 são entregues em `apps/portal/web`, na
   área autenticada do cidadão, como módulo de funcionalidade PEC. O cidadão tem uma única porta de
   entrada, e [IU-PEC-001] já declara `apps: [pec, portal]`. Não se cria um terceiro app para o
   candidato.
3. **Contratos antes das telas.** Toda rota do PEC consumida pelo frontend precisa de contrato de
   comando/consulta versionado em `docs/framework/contracts/` e de cliente gerado em
   `packages/api-clients`. Não se consome rota sem contrato.
4. **Requisitos transversais vinculantes.** São os de [IU-PEC-001] §D:
   - vocabulário legal de resultado;
   - dossiê não mascarado para o titular;
   - nenhuma escolha de clínica ou perito;
   - nível de assinatura visível;
   - todo dado tratado como sensível;
   - prazo mostrado como direito.
5. **Telas condicionadas por autoridade externa** ([IU-PEC-001] §E: P-01 forma final, R-07, P-07,
   rótulos de C-12) nascem no estado "bloqueado por decisão", referindo DT-021, DT-022 e DT-023. Os
   valores não são inventados.
6. **Fronteiras preservadas:**
   - Assinatura de laudo pelo substrato de documentos (ADR-0018), fail-closed enquanto não houver
     PAdES real.
   - Captura biométrica por porta de dispositivo, com implementação de homologação explícita. O
     driver real fica fora do escopo.
   - RENACH somente via `senatran-adapter` (ADR-0003).
7. **Sem app mobile PEC.** Um app mobile exigiria uma nova ADR.

## Consequências

- `apps/pec/web/README.md` é reescrito pela rodada de implementação.
- Nova frente `pec-web` na campanha C-0002, após a documentação de usuário. O manual dos perfis
  clínico, regulatório e candidato é entregue pela própria rodada.
- Nova família de papéis de UI PEC, derivada do catálogo existente em
  `backend/domains/shared/src/roles.ts`; papel novo só por OD.
- O custo inclui fechar a dívida de testes de integração e de fixtures do PEC antes das telas que
  dependem dela.
