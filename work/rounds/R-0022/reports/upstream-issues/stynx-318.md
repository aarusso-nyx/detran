
Requisito upstream do DETRAN, campanha C-0002, rodada consumidora **R-0022** (contrato
**CTG-0006**, migração integral da assinatura). Todos os itens desta issue são **MUST**, conforme
OD-S15-01 e a adenda A1 da spec C-0002 (§8.1). Registro autorizado pelo Owner em 2026-09-29 (DETRAN
`work/rounds/R-0022/AUTHORIZATION.md`, Adenda B4). Esta issue registra o contrato de consumo;
implementação, release e governança seguem o STYNX. Não é declaração de que a lacuna continua
ausente na HEAD atual: verificar a API efetivamente publicada e anexar evidência se já atendida.

Consumidor: **R-0022 / CTG-0006**. Alvo: grupo fixo `@stynx-nyx/*` **1.5.x final** (o DETRAN fixa a
maior 1.5.x final publicada; Adenda A-C2-13). Desenvolvimento pode usar `1.5.x-rc.N`; merge DETRAN
somente com final e conformidade preenchida. MUST ausente bloqueia o CTG consumidor (OD-R22-02 (a)),
sem _shim_ nem cópia do mecanismo genérico.

Esta issue **não reabre** https://github.com/stynx-nyx/stynx/issues/305. UPS-SIG-01…04 foram
fechados em 1.5.0 com `SignatureRequest.minimumSignatureLevel`, `SignatureTrustProfile`,
`createCmsTrustVerifier`, `SignatureService.checkReadiness`, `SignatureReadinessIndicator`,
`SignatureHealthIntegration`, `SignatureCapabilityError`, `SignatureManifestService` e
`SignatureWithdrawalVerifier.verifyWithdrawalEvidence`. O próprio fechamento de #305 registrou o
desvio "o verificador `stynx-cms` **não verifica LTA** e falha fechado — perfis PAdES-B-LTA exigem
verificador do consumidor (`consumerOwnedVerifier`)". Os itens abaixo tratam desse desvio e de duas
lacunas de contrato que o DETRAN encontrou ao ler o pacote publicado.

## Contexto do consumidor DETRAN

- A plataforma DETRAN atende **vários DETRANs estaduais**, cada um com normativa própria de perfis de
  confiança (espécies documentais, nível mínimo, perfil PAdES, TSA, LTA, revogação, âncoras e
  políticas de certificado).
- Decisões do Owner DETRAN (`docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 —
  decisões do Owner"): **OD-R22-06 (a)** — verificador `stynx-cms` em processo (ADR-0018 §1 do
  DETRAN põe a validação de certificado no substrato); **OD-R22-13 (a)** — `StynxSignatureModule`
  **montado uma vez** no app e injetado; **OD-R22-08 (a)** — valores normativos de
  `SignatureTrustProfile` fornecidos pelo Owner, **ainda pendentes**, nada preenchido por padrão
  (fail-closed).
- Assinatura clínica: pedidos com `minimumSignatureLevel: 'QUALIFIED'` (CTG-0006 §1.1 S-03) e
  prontidão que exige PAdES, TSA, **LTA** e OCSP ou CRL
  (`backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts:93-122`,
  `checkCapabilities` rejeita com `capabilities.lta !== true`; CTG-0006 §2 linha UPS-SIG-02 e prova
  pós-migração M-06-P2: "Cada capacidade ausente (PAdES, TSA, LTA, OCSP/CRL) → rejeição e `down`").
- Estado: CTG-0006 não declarou MUST ausente por símbolo (§0); a conformidade de comportamento só é
  provada pelos casos M-06-P depois da troca, e divergência ali leva a checkpoint OD-R22-02 do
  CTG-0006 (§0). TASK-0009 aguarda ainda OD-R22-07 e OD-R22-08 (AUTHORIZATION.md Adenda B4).

## Base analisada

`@stynx-nyx/signature@1.5.0`, tarball SHA-256
`813490dd0276161e524a238523d986ea797f06de8c9c0a919eaf1cade35f158b`, em
`package/dist/signature/src/`: `cms-trust-verifier.d.ts`/`.js`, `types.d.ts`,
`signature.service.d.ts`/`.js`, `readiness.d.ts`/`.js`, `signature.module.js`. Nesta issue o `.js`
publicado **foi** lido nos pontos citados (linhas abaixo).

## Contrato e provas (resumo)

| ID         | Nível | Origem                                        | Comportamento exigido (resumo)                                                                                          |
| ---------- | ----- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| UPS-SIG-05 | MUST  | UPS-SIG-02 (e SIG-01); desvio LTA de #305      | Verificação de carimbo de arquivo (LTA / PAdES-B-LTA) no verificador `stynx-cms`, com `capabilities().lta` verdadeiro quando suportado |
| UPS-SIG-06 | MUST  | UPS-SIG-01                                     | Nível `QUALIFIED` atingível de forma declarativa e contratada (regra por OIDs de política configuráveis por perfil), além do _callback_ |
| UPS-SIG-07 | MUST  | UPS-SIG-01/02                                  | Modelo documentado e testado de vários perfis por tenant/UF e espécie num módulo montado uma vez: prontidão, _health_, âncoras e artefato de desafio |

**Por que IDs novos.** #305 foi fechada com evidência por ID e com o desvio de LTA declarado;
subitens (`UPS-SIG-02a`…) tornariam ambíguo o estado de IDs já fechados. Os IDs continuam a numeração
(a partir de 05) e declaram o ID pai.

### UPS-SIG-05 — LTA / PAdES-B-LTA no verificador `stynx-cms`

**Evidência (1.5.0 publicada).**
- `cms-trust-verifier.js:230-232`: `capabilities()` devolve `{ simulated: false, pades: true, tsa:
  true, lta: false, certificateValidation: ['ocsp', 'crl'], evidenceSource: 'stynx-cms', … }` —
  `lta: false` fixo.
- `cms-trust-verifier.js:377-381`: `padesProfile` só pode ser `PAdES-B-LT` ou `PAdES-B-T`; com
  `input.profile.requireLta || input.profile.requiredPadesProfile === 'PAdES-B-LTA'` lança
  `SignatureTrustError('Archive timestamp evidence unavailable')`.
- `signature.service.js:73`: `checkReadiness` recusa quando o perfil pede LTA e `!c.lta` →
  `SignatureCapabilityError('Required signature capability is unavailable')`.
- `types.d.ts:7-19` (`SignatureTrustProfile.requiredPadesProfile` admite `'PAdES-B-LTA'`;
  `requireLta: boolean`) e `:20-28` (`SignatureCapabilities.lta`).

**Efeito DETRAN.** Com o verificador `stynx-cms` escolhido pelo Owner (OD-R22-06), **nenhum perfil com
LTA fica pronto**: a prontidão clínica (M-06-P2, LTA exigido pelo código atual) não pode ficar verde,
o que é divergência de comportamento de UPS-SIG-02 e leva a checkpoint OD-R22-02 do CTG-0006. A via
`consumerOwnedVerifier` indicada em #305 contraria a decisão OD-R22-06 e exigiria reconstruir no
consumidor a verificação criptográfica que a A1 manda ficar no substrato.

**Comportamento exigido.**
1. O verificador `stynx-cms` verifica a evidência de arquivo exigida por PAdES-B-LTA: carimbo(s) de
   tempo de documento/arquivo sobre a revisão assinada, sua cadeia até âncora de TSA confiável do
   perfil, e a evidência de validação de longo prazo que o carimbo protege; resultado com
   `padesProfile: 'PAdES-B-LTA'` e instante do carimbo de arquivo na prova.
2. `capabilities(profile)` informa `lta: true` **somente** quando o verificador está configurado para
   verificar LTA (por exemplo âncoras de TSA de arquivo presentes) e, em produção, o desafio de
   prontidão do perfil com LTA foi verificado.
3. Falha fechada preservada: carimbo de arquivo ausente, adulterado, de TSA não confiável, fora de
   ordem temporal ou sem cobertura da revisão → `SignatureTrustError`/`SignatureTrustUnavailableError`
   tipados, sem prova positiva.

**Prova exigida.** Teste com PKI real (no padrão de `signature/test/integration/trust-gate.spec.ts`):
artefato PAdES-B-LTA válido aceito com `padesProfile: 'PAdES-B-LTA'`; artefato só B-LT recusado em
perfil que exige LTA; carimbo de arquivo adulterado, de TSA fora das âncoras do perfil ou ausente →
recusa; `checkReadiness` com perfil LTA → `ok` com verificador configurado e desafio válido, e
`SignatureCapabilityError` sem configuração; perfis sem LTA com o mesmo resultado de 1.5.0.

### UPS-SIG-06 — nível `QUALIFIED` declarativo e contratado

**Evidência (1.5.0 publicada).**
- `cms-trust-verifier.js:382-389`: `qualified = !!(options.qualifiesCertificate && await
  options.qualifiesCertificate(signer, input.profile))`; exceção do _callback_ →
  `SignatureTrustUnavailableError('Certificate qualification service unavailable')`;
  `achievedLevel = qualified ? 'QUALIFIED' : 'ADVANCED'`. Sem _callback_, o nível é sempre
  `ADVANCED`.
- `cms-trust-verifier.d.ts:26`: `qualifiesCertificate?: (certificate: pkijs.Certificate, profile) =>
  boolean | Promise<boolean>`, sem documentação de contrato.
- `signature.service.js:87-88` e `:116-118`: pedido ou perfil `QUALIFIED` com prova `ADVANCED` →
  `SignatureLevelNotMetError`.
- O verificador já lê a extensão de políticas de certificado (`2.5.29.32`, `cms-trust-verifier.js:282`) para `acceptedPolicies`
  (perfil ou opções), mas só como filtro de aceitação, não de qualificação.
- DETRAN: assinatura clínica pede `QUALIFIED` (CTG-0006 §1.1 S-03; M-06-P1 "QUALIFIED pedido e
  atingido → recibo traduzido"); a fonte normativa citada pelo DETRAN para os perfis é ICP-Brasil e a
  Lei 14.063/2020 (CTG-0006 §8, OD-R22-S03).

**Comportamento exigido.**
1. Contrato publicado do _callback_ `qualifiesCertificate`: quando é chamado, com que certificado e
   perfil, efeito de exceção/tempo esgotado, se pode ser assíncrono com rede, e como o resultado entra
   na prova.
2. Regra declarativa opcional, configurável **por perfil**: lista de OIDs de política de certificado
   que qualificam a assinatura (os valores vêm do consumidor; o STYNX não embute OIDs), avaliada sobre
   a extensão de políticas do certificado do signatário já verificado; precedência entre regra
   declarativa e _callback_ documentada.
3. A prova registra por qual regra o nível foi atingido (declarativa ou _callback_), para auditoria.

**Prova exigida.** PKI real: certificado com OID qualificante do perfil → `QUALIFIED`; sem o OID →
`ADVANCED` e pedido `QUALIFIED` recusado com `SignatureLevelNotMetError`; dois perfis com listas de
OIDs diferentes avaliam o mesmo certificado de forma diferente; _callback_ que falha → indisponível,
sem prova positiva; sem regra nem _callback_ → comportamento de 1.5.0.

### UPS-SIG-07 — vários perfis por tenant/UF e espécie num módulo montado uma vez

**Evidência (1.5.0 publicada).**
- `types.d.ts:212-225`: `StynxSignatureModuleOptions.trustProfile?: SignatureTrustProfile` (um só).
- `signature.module.js:32-40`: o _guard_ de _bootstrap_ valida verificador, _backend_ e _health
  witness_ só quando **esse** perfil é `production`.
- `readiness.js:45-48` e `readiness.d.ts:11`: `SignatureHealthIntegration.forRoot` cria **um**
  `SignatureReadinessIndicator` com `options.trustProfile`; nenhum _health_ para outros perfis.
- `signature.service.d.ts:14` / `.js:36-77`: `checkReadiness(profile)` e `sign`/`verify` aceitam
  perfil por chamada (`types.d.ts:86`, `:121`).
- `cms-trust-verifier.js:237`: âncoras efetivas = `input.profile.trustAnchorsPem` ∩
  `options.trustAnchorsPem`; `:294-295`: âncoras de TSA = (`tsaTrustAnchorsPem` ou
  `trustAnchorsPem` das opções) ∩ `input.profile.trustAnchorsPem` — a âncora de TSA também precisa
  constar das âncoras do perfil.
- `cms-trust-verifier.js:217-228`: em produção, `capabilities(profile)` exige
  `options.readinessChallenge`, cujo retorno precisa ter `profile.id`/`profile.revision` iguais aos do
  perfil e passar por `verifySignedArtifact` completo (artefato real: PDF, CMS, certificado, TSA,
  revogação); `signature.service.js:63-67`: observação com no máximo 300 s de idade em produção.
- DETRAN: módulo montado uma vez (OD-R22-13 (a)); perfis por espécie documental e por DETRAN estadual
  (OD-R22-08, valores pendentes do Owner; CTG-0006 §8 OD-R22-S03).

**Comportamento exigido (contrato documentado e testado).**
1. **Conjunto de perfis:** forma publicada de declarar N perfis (por tenant/UF e espécie) num único
   módulo, com o _guard_ de _bootstrap_ validando todos os perfis de produção.
2. **Prontidão e _health_ por perfil:** indicador que verifica cada perfil declarado, expõe o estado
   por perfil (id e revisão) nos detalhes e aplica regra de agregação documentada e configurável
   (por exemplo, um perfil fora não derruba perfis de outros tenants, ou derruba, conforme a opção).
3. **Âncoras:** documentação do modelo interseção perfil × verificador, inclusive a exigência de a
   âncora de TSA constar do perfil, e a garantia de isolamento: artefato ancorado só no perfil de um
   tenant nunca é aceito sob o perfil de outro; forma recomendada de construir o verificador único
   (união das âncoras) sem ampliar a confiança de nenhum perfil.
4. **Artefato de desafio:** o que o `readinessChallenge` deve devolver por perfil (bytes reais,
   requisitos de validade temporal e de revogação corrente), como é produzido e rotacionado quando a
   revisão do perfil muda, e se pode ser compartilhado entre perfis com as mesmas âncoras.
5. A resolução do perfil por pedido continua do consumidor (por tenant e espécie); o STYNX documenta
   os pontos de extensão.

**Prova exigida.** Dois perfis de produção com âncoras disjuntas (dois tenants): artefato de A
verificado sob o perfil de B → recusa; _health_ mostra cada perfil com seu estado; desafio inválido
em um perfil derruba só esse perfil (ou o agregado, conforme a opção documentada); mudança de
revisão sem novo desafio → perfil não pronto; _bootstrap_ recusa perfil de produção sem verificador
ou _witness_ válido.

## Compatibilidade vinculante

- **Aditivo em 1.5.x.** Assinaturas publicadas em 1.5.0 (`createCmsTrustVerifier`,
  `SignatureService.sign`/`verify`/`checkReadiness`, `SignatureTrustProfile`,
  `StynxSignatureModuleOptions.trustProfile`, `SignatureHealthIntegration.forRoot`) continuam
  válidas; o que é novo entra como opção ou campo adicional.
- **Falha fechada preservada**: nenhuma via nova declara capacidade, nível ou prontidão sem prova
  verificada; _backend_ ou verificador simulado continuam recusados em produção.
- **Sem valores normativos embutidos**: âncoras, OIDs, perfis e níveis são dados do consumidor
  (OD-R22-08); o STYNX fornece mecanismo e prova.
- Gate opt-in mantido: chamadas sem `minimumSignatureLevel` seguem o comportamento legado (desvio já
  registrado em #305).
- A via `consumerOwnedVerifier` continua existindo; ela não substitui UPS-SIG-05 para o DETRAN
  (OD-R22-06).

## Critérios de conclusão

- [ ] UPS-SIG-05 atendido por API pública e testes verificáveis com PKI real (LTA válido aceito; ausente, adulterado ou não confiável recusado; `lta: true` só quando suportado).
- [ ] UPS-SIG-06 atendido por API pública e testes verificáveis (regra declarativa por perfil e contrato do _callback_).
- [ ] UPS-SIG-07 atendido por API pública, contrato publicado e testes verificáveis (dois perfis, dois tenants, _health_ por perfil, artefato de desafio).
- [ ] Informar versão publicada, símbolos reais exportados, testes/CI e desvios da proposta para cada ID; nome de símbolo proposto pode mudar, comportamento e prova não.
- [ ] Documentar consumo e migração, incluindo restrições de contexto/tenant pertinentes; não marcar atendido somente por código local ou RC sem evidência de publicação.

## Rastreabilidade

DETRAN (`aarusso-nyx/detran`, branch `orchestra/stynx-sse-tenancy`): `work/rounds/R-0022/contracts/
CTG-0006.md` (SHA-256 `b0df64f68f895faeea0a2a5927e0378972900c7ad16dfebdc05430242accc8c6`) §0, §1.1,
§2, §5.2 (M-06-P1, M-06-P2), §8; `backend/domains/ch/clinical-reports/src/pades-signing.http-adapter.ts`
(`checkCapabilities`); `docs/meta/knowledge-base/open-decisions-rait.md` §C-0002 "R-0022 — decisões do
Owner" (OD-R22-06, -08, -13); `work/rounds/R-0022/AUTHORIZATION.md` Adenda B4; spec
`work/campaigns/C-0002-stynx-upstream-spec.md` §8.1 (SHA-256
`291f18da6d2cc9d381c855d45bca3d61da59bbb424b93523bdde195b0137383d`).

STYNX: https://github.com/stynx-nyx/stynx/issues/305 (fechada; desvio de LTA registrado); ledger
`work/rounds/R-0002/conformance-1.5.0.md`; ADR `law/adr/ADR-SIGNATURE-0001-trust-evidence.md`.

<!-- detran-c0002-upstream:R22-SIG -->

Índice: #319 · Índice anterior: https://github.com/stynx-nyx/stynx/issues/289

