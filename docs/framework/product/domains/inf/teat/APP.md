---
id: APP-TEAT
title: TEAT — Talonário Eletrônico (agente em campo)
status: approved
apps: [teat]
sources:
  [
    REF-CONTRAN-918,
    REF-LEI-13709-2018,
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
    'teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json',
    'teat:docs/framework/product/blueprints/BP-EVIDENCE-CUSTODY-001.json',
    'teat:docs/framework/product/blueprints/BP-NORMATIVE-CATALOG-001.json',
    'teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json',
    'teat:docs/meta/eng/domain-scope.md',
    'teat:docs/meta/eng/stynx-boundary.md',
    'teat:law/invariants/INV-OFFLINE-001.json',
    'teat:law/invariants/INV-AIT-001.json',
    'teat:law/invariants/INV-EVIDENCE-001.json',
    'teat:law/invariants/INV-NORMATIVE-001.json',
  ]
updated: 2026-08-27
---

## Missão

Aplicativo móvel (e retaguarda web) do agente de trânsito para lavrar Autos de Infração de
Trânsito (AIT) em campo — o "talonário eletrônico" previsto em [REF-CONTRAN-918] art. 3º §§1º-6º
— com captura estruturada de evidências, assinatura/recusa do condutor, numeração controlada por
faixas reservadas, medidas administrativas, procedimento de etilômetro e registro de sinistros
(ver [APP-BOAT]), operando **offline-first**: o agente cria e finaliza o ato legal no dispositivo
e sincroniza depois com a retaguarda quando a conectividade retorna
("teat:docs/framework/product/workflows/phase-e-mobile.md").

## Atores (9 papéis de negócio)

TEAT define 9 papéis de domínio, declarados nos blueprints (`auth.rbac.roles`) e substanciados
pela plataforma STYNX (autenticação/sessão) — TEAT não implementa um provedor de identidade
paralelo ("teat:docs/meta/eng/stynx-boundary.md"):

| Papel                                               | Atuação central                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **field-agent** (agente de trânsito)                | lavra o AIT, registra abordagem, coleta evidências (incl. bodycam contínua — ver [UC-TEAT-010]), aplica medida administrativa, conduz procedimento de etilômetro, opera offline |
| **field-supervisor** (supervisor de campo)          | gerencia turno/equipe/viatura, reserva faixas de numeração, resolve conflitos de sincronização, libera retenção de veículo                                                      |
| **processing-operator** (operador de processamento) | tramita o AIT após recebimento (validação, solicitação de correção), acompanha medidas administrativas e evidências na retaguarda                                               |
| **traffic-authority** (autoridade de trânsito)      | aceita/rejeita o AIT, aprova correções, conclui medidas administrativas, encerra procedimento de etilômetro — inicia o ciclo [WF-INF-003]                                       |
| **agency-admin** (administrador do órgão)           | parametriza órgão/unidade/convênio/competência territorial, gerencia homologação de dispositivos e publica catálogo normativo                                                   |
| **technical-admin** (administrador técnico)         | administra sincronização offline, resolve incidentes técnicos, publica pacote normativo mobile                                                                                  |
| **auditor** (auditor/corregedor)                    | consulta trilha de auditoria, cadeia de custódia, exportações de dados; não edita                                                                                               |
| **bi-analyst** (analista de BI/inteligência)        | consome projeções e relatórios operacionais (fora do escopo direto de lavratura)                                                                                                |
| **integration-operator** (operador de integração)   | acompanha e retransmite falhas de integração com sistemas nacionais/estaduais (RENAVAM, RENACH, RENAINF, RENAEST, SNE/CDT)                                                      |

Fonte primária: `auth.rbac.roles` agregados de todos os blueprints de produto TEAT (união produz
exatamente os 9 papéis acima); prosa equivalente em AGENTS.md §RBAC ("agent, supervisor,
processing operator, authority, auditor, BI analyst and technical administrator"). O corpus de
protótipo (`docs/meta/prototypes/docs/AJ-1_Atores_e_Jornadas_Talonario_Eletronico.md`) descreve
12 atores humanos internos como evidência de UX — não é fonte de autoridade de papéis
("teat:docs/framework/product/README.md" declara protótipo como evidência, não autoridade); os
adicionais (suporte técnico, gestor de contratos, DPO) não têm papel de RBAC próprio no MVP.

**`field-agent` não é um único vínculo empregatício.** O Manual Brasileiro de Fiscalização de
Trânsito (MBFT — [REF-CONTRAN-985-1003-MBFT] Seção 4) define, em rol taxativo, quem pode
legalmente lavrar AIT: agente do próprio órgão, PRF, PM mediante convênio, guarda municipal (Lei
13.022/2014) ou agentes da Câmara/Senado mediante convênio. Na prática confirmada do DETRAN-AM,
`field-agent` é ocupado tanto por servidores próprios quanto por policiais militares do **BPTRAN**
(Batalhão de Trânsito da PM-AM) operando o mesmo aplicativo, sob convênio DETRAN-AM/PM-AM
([REF-DETRANAM-TALAO-BODYCAM] §3) — mesmo papel funcional, origens organizacionais distintas.
Requisito de legitimidade adicional (não modelado hoje como validação em nenhuma RN-TEAT): agente
deve estar **devidamente uniformizado** e em **regular exercício da função**; o veículo usado na
fiscalização deve estar caracterizado conforme padrão institucional (MBFT Seção 4).

Um novo ator organizacional aparece na prática local, ainda sem papel de RBAC formal: a
**Diretoria de Fiscalização**, competente pela decisão de cancelamento de AIT já
finalizado/sincronizado — ver [UC-TEAT-011] e [WF-TEAT-001]. Mapeamento provisório para
`traffic-authority` em nível hierárquico superior; decisão de escopo do Owner (ver
`_intake/bpo-notes.md` §Atores).

## Escopo (dentro / fora)

**Dentro:** lavratura de AIT (rascunho → finalização → fila → sincronização → recibo);
constatação com ou sem abordagem (classificação por enquadramento — Casos 1/2/3 do MBFT, não
catálogo de motivos em texto livre); evidências e cadeia de custódia, incl. gravação contínua de
bodycam quando exigida ([UC-TEAT-010], escopo a confirmar — ver `_intake/bpo-notes.md`);
assinatura/ciência/recusa do condutor; numeração controlada por faixas reservadas ao
dispositivo/agente, com sessão de agente exclusiva por dispositivo ([UC-TEAT-012]); medidas
administrativas — catálogo fechado do CTB art. 269 (retenção, remoção **com alternativa de guarda
monitorada**, recolhimento físico ou digital de documento, transbordo, teste de alcoolemia,
recolhimento de animais) — ver [WF-TEAT-004]; procedimento de etilômetro (teste, recusa, sinais
psicomotores, encaminhamento) — ver [WF-TEAT-005]; registro de sinistro (ver [APP-BOAT]); catálogo
normativo e pacote normativo mobile; contexto de turno/operação/equipe/viatura; homologação de
dispositivo e versão de aplicativo, distinta da homologação SENATRAN do software como um todo
(ver [WF-TEAT-003]); cancelamento pós-finalização via Diretoria de Fiscalização ([UC-TEAT-011]);
integrações com bases nacionais/estaduais (RENAVAM, RENACH, RENAINF, RENAEST, SNE/CDT) como
consultas/envios auditados, com o **Sivec** (Sistema Integrado de Veículos Custodiados,
[REF-CONTRAN-1025-2026]) como candidata a nova integração.

Também **dentro**: lavratura de AIT por **medição de velocidade com equipamento acoplado ao
talão eletrônico** — a hipótese do inciso II do art. 3º §1º da [REF-CONTRAN-918], em que o agente
opera o medidor em campo e o próprio talão lavra o auto ([UC-TEAT-013], [RN-TEAT-138]).

**Fora:** julgamento de defesa prévia e recursos administrativos (rait); cálculo/cobrança de
multa e indicação de condutor pelo proprietário (portal); emissão da Notificação da Autuação/
Penalidade (retaguarda do órgão, fora do MVP TEAT); exame de aptidão física/mental (pec);
**fiscalização eletrônica por equipamento fixo provido de registrador de imagem** — a hipótese do
**inciso III**, que exige referendo de autoridade e processamento em retaguarda (ver §Fronteira
abaixo).

## Fronteira com a fiscalização eletrônica (incisos II × III)

Decisão do Owner (2026-08-26), formalizando a linha que [RN-TEAT-106] já traçava. O art. 3º §1º da
[REF-CONTRAN-918] prevê três formas de lavratura com regimes de validação **diferentes**, e o TEAT
ocupa exatamente uma delas:

| Inciso | Forma                                                                                                      | Referendo                                                                         | No TEAT?                                    |
| ------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| I      | anotação em documento próprio (talão de papel)                                                             | não                                                                               | não — é o processo que o TEAT substitui     |
| **II** | **registro em talão eletrônico, isolado ou acoplado a equipamento de detecção**                            | **não** — o agente é o autor do ato, identificado eletronicamente ([RN-TEAT-110]) | **sim — é o TEAT**                          |
| III    | registro em sistema eletrônico de processamento de dados, com equipamento provido de registrador de imagem | **sim**, por autoridade ou agente identificado no AIT                             | não — retaguarda de fiscalização eletrônica |

Consequências da fronteira para as regras de medidor de velocidade:

- [RN-TEAT-138] (validade metrológica como precondição da prova) **incide no TEAT** na hipótese
  acoplada: sem modelo aprovado e verificação vigente, não há lavratura ([UC-TEAT-013]).
- [RN-TEAT-139] tem duas metades: a **imagem com a placa** incide sobre qualquer AIT de velocidade,
  inclusive o acoplado; a **publicidade da relação de medidores** no site do órgão é dever
  institucional periódico, monitorado pelo DASHBOARD ([RN-DASH-173]), não ato de campo.
- [RN-TEAT-140] (sinalização R-19) governa **medidor fixo** — fora do TEAT. Fica registrada aqui
  como regra de fronteira: se o órgão trouxer a fiscalização eletrônica para dentro do portfólio,
  ela é pressuposto de lavratura e exige um registro consultável de sinalização, não um documento.

Trazer o inciso III para dentro do portfólio seria uma aplicação nova, não uma funcionalidade do
TEAT — fila de referendo, ingestão de imagens do operador contratado, triagem em lote e registro
de sinalização. Se a decisão mudar, reabrir [RN-TEAT-106] com fundamentação, não estender este app.

## Numeração (faixas) e evidência — conceitos centrais

- **Faixa de numeração (`AitNumberingRange` / DD-ENT-074 `FAIXA_NUMERACAO_AIT`):** intervalo
  `[start_number, end_number]` por série, com `next_number` e `status` (`active` por padrão),
  único por tenant+órgão+série ("teat:docs/framework/product/blueprints/BP-OFFLINE-SYNC-001.json").
- **Reserva offline (`OfflineNumberingReservation` / DD-ENT-075 `RESERVA_NUMERACAO_OFFLINE`):**
  o backend aloca atomicamente um subintervalo `[start_number, end_number]` da faixa ativa para um
  par agente+dispositivo, com `valid_until` e estados `reserved → consumed → expired → cancelled`;
  reservas não podem se sobrepor dentro do mesmo tenant/órgão/série. Ver [WF-TEAT-002].
- **Evidência (`Evidence`/`evidence_evidence`):** hash obrigatório (`hash_algorithm`+`hash_value`),
  vínculo a um ato legal (`EvidenceLink`), evento de custódia (`CustodyEvent`, apêndice apenas —
  nunca editado) e, quando reunida para fins probatórios, um `ProbativePackage` imutável após
  gerado o `manifest_hash` — ver [INV-EVIDENCE-001] em [RN-TEAT-002].

## Offline-first — doutrina

O ato legal (AIT, medida administrativa, procedimento de etilômetro, sinistro) pode ser criado e
**finalizado no dispositivo**, sem conectividade. `apps/mobile/src/app/mobile-runtime.ts` isola a
semântica do domínio TEAT dos adaptadores nativos por meio de portas (`MobileEncryptedStorePort`,
`MobileBackendClientPort`, `MobileStynxSessionPort`, `MobilePrinterPort`, `MobileCryptoPort`,
`MobileClockPort`, `MobileIdPort`); STYNX permanece autoridade de identidade/sessão/token
("teat:docs/framework/product/workflows/phase-e-mobile.md"). Jornada de referência: bootstrap de
sessão STYNX → verificação de postura do dispositivo → instalação do pacote normativo ativo →
reserva de numeração → rascunho offline com chave de idempotência, hash de conteúdo local,
identidade do dispositivo/agente, timestamp, localização e identificador do pacote normativo →
anexação de evidência com hash sha256 → finalização local (**sempre ação explícita do agente,
nunca automática ao fim do preenchimento** — [REF-SENATRAN-997] Anexo II, g) → fila local cifrada
→ envio via `POST /v1/offline-sync/sync-batches` → recibo impresso simulado → resolução de
conflito (`device-wins`) → remote wipe preservando recibo de limpeza. Base normativa (regra de
sistema): [INV-OFFLINE-001] — nenhum ato legal offline é aceito sem chave de idempotência, faixa
reservada, hash local, identidade de dispositivo/agente, timestamp, localização e versão
normativa. Ver [RN-TEAT-001] e [WF-TEAT-001].

**Sessão exclusiva por dispositivo** — requisito normativo de segurança, não apenas boa prática:
"o agente de trânsito não poderá estar logado simultaneamente em mais de um equipamento"
([REF-SENATRAN-997] Anexo II, h). Quando a transmissão revela registros do mesmo agente
originados em dispositivos diferentes no mesmo intervalo de tempo, esses registros **não devem
ser processados** e o fato deve ser apurado pela autoridade — gate duplo (bootstrap +
sincronização), ver [UC-TEAT-012] e [WF-TEAT-001] estado `SUSPEITO_CONCORRENCIA`.

## Catálogo normativo — conceito

`NormativeCatalog` versiona enquadramentos (`Framing`: artigo, inciso, gravidade, penalidade,
`allows_no_approach`, `requires_observation`, `requires_equipment`), regras de validação e
modelos de documento; publicado (`draft → active`) por `agency-admin`/`technical-admin`. Um
**pacote normativo mobile** (`MobileNormativePackage`) é derivado do catálogo ativo, versionado e
distribuído por manifesto (`manifest_hash`, `package_uri`, `valid_until`) através de
`GET /v1/normative-catalog/mobile-normative-packages/sync-metadata`; todo ato legal registra qual
pacote normativo o gerou ([INV-NORMATIVE-001], ver [RN-TEAT-004]). Ver [WF-TEAT-003].

## Homologação de dispositivo

Dispositivo e aplicativo móvel só operam sob homologação vigente: `Homologation`
(`ops_homologation`, DD-ENT-018) registra `homologation_number`, `scope`, `issued_at`,
`valid_until`, `document_uri`, `status`; `ApplicationVersion.homologation_id` vincula cada versão
de app homologada. `OperationalDevice.status` (`authorized` por padrão) e `tamper_flag` compõem a
verificação de postura do dispositivo antes de qualquer criação de ato legal
("teat:docs/framework/product/blueprints/BP-MOBILE-OPERATIONS-001.json"). Ver [RN-TEAT-003].

## Âncoras legais

[REF-CONTRAN-918] art. 3º — lavratura do AIT, incl. §1º-II talão eletrônico isolado ou acoplado a
equipamento, §2º dispensa de assinatura da autoridade quando impresso, §4º identificação do
condutor quando possível, §5º AIT valendo como NA, §6º definição de talão eletrônico como sistema
informatizado.

**Requisitos específicos do talão eletrônico além do art. 3º — GAP FECHADO** (rodada de pesquisa
2026-08-24): [REF-SENATRAN-997] é a regulamentação específica remetida duas vezes pelo art. 3º
§1º-II — requisitos técnicos do equipamento, homologação do software pela SENATRAN (art. 5º,
distinta da homologação de dispositivo interna, [RN-TEAT-003]/[WF-TEAT-003]), procedimento de
uso, impressão. "Fé pública do agente" como termo jurídico próprio não foi localizada — o
equivalente funcional é o rol taxativo de quem pode legalmente lavrar AIT
([REF-CONTRAN-985-1003-MBFT] Seção 4, ver §Atores acima); avaliação jurídica desse ponto
permanece com o especialista LEGAL.

[REF-CTB-165-277-medidas-alcoolemia] arts. 165, 165-A, 269-271, 276-277 — medidas administrativas
e alcoolemia. [REF-CONTRAN-1025-2026] — remoção, guarda monitorada, Sivec. [REF-CONTRAN-432] +
[REF-INMETRO-369-2021] — procedimento e regime metrológico do etilômetro.
[REF-DETRANAM-TALAO-BODYCAM] — bodycam (Portaria Normativa DETRAN-AM 003/2026) e prática local de
cancelamento pós-finalização.

## KPIs operacionais

Indicadores propostos para acompanhamento operacional do TEAT em campo — não são requisitos
normativos, são propostas de calibração do Owner/gestor de operação, a confirmar em conjunto com
`dashboard`:

| KPI                                        | O que mede                                                                                                             | Por que importa                                                                                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Produção por turno/agente                  | nº de AITs finalizados por agente/viatura/turno                                                                        | eficiência operacional, base de metas de fiscalização                                                                                             |
| % constatação sem abordagem                | proporção de AITs `had_approach=false` sobre o total, por enquadramento                                                | acompanha o uso do Caso 1/3 do MBFT (ver [UC-TEAT-002]); desvio alto num enquadramento Caso 2 é sinal de erro de uso                              |
| % recusa etilômetro                        | proporção de procedimentos [WF-TEAT-005] que terminam em `RECUSA_REGISTRADA` sobre o total de procedimentos oferecidos | indicador de comportamento de risco; também sinaliza necessidade de reforço de equipamento (se correlacionado com `IMPOSSIBILIDADE_TECNICA` alta) |
| Volume de medidas administrativas por tipo | contagem de `AdministrativeTerm` por tipo (retenção/remoção/guarda monitorada/recolhimento) — [WF-TEAT-004]            | dimensiona depósito/guarda monitorada, acompanha adoção da nova modalidade                                                                        |
| Taxa de conformidade de bodycam            | % de atos legais com evidência de bodycam vinculada, entre os que a norma exige ([UC-TEAT-010]) — se adotado no MVP    | compliance com Portaria 003/2026; sinaliza falhas de equipamento não comunicadas                                                                  |
| Latência de sincronização                  | tempo entre `FINALIZADO_LOCAL` e `RECEBIDO` ([WF-TEAT-001])                                                            | saúde da conectividade em campo; insumo para dimensionar reservas de numeração ([WF-TEAT-002])                                                    |
| Taxa de suspeita de concorrência de sessão | nº de lotes movidos a `SUSPEITO_CONCORRENCIA` sobre o total                                                            | indicador de segurança/fraude — meta é próximo de zero; qualquer volume sustentado é sinal de investigação                                        |

**Volume real observado (resposta institucional, Sub Gerência de Infração/DETRAN-AM,
2026-08-27/28).** Autuações lavradas: **7.739 em julho** — ponto único no tempo, não é média
anual; útil como ordem de grandeza para dimensionar numeração/sincronização/produção por turno da
tabela acima, mas não deve ser tratado como sazonalmente representativo sem mais meses de dado.

## Interfaces com outros apps/domínios

AIT finalizado e aceito alimenta [WF-INF-003] (ciclo de vida da infração, retaguarda/rait/
portal); AIT gerado por violação de guarda monitorada (CTB art. 239, [WF-TEAT-004]) entra pelo
mesmo caminho. Sinistros registrados alimentam [APP-BOAT] e a base nacional RENAEST. Consultas de
veículo/condutor e envios usam adaptadores de integração auditados para RENAVAM, RENACH,
RENAINF, RENAEST e SNE/CDT ([INV-INTEGRATION-001]); **Sivec** ([REF-CONTRAN-1025-2026]) é
candidata a nova integração auditada, para o registro eletrônico de remoção/guarda/liberação/
leilão — ainda não implementada, ver `_intake/bpo-notes.md` §1.

## Residual aberto após a rodada de endurecimento (2026-08-26)

**As 49 regras legais deste app seguem em `draft`, deliberadamente.** Diferente do RAIT, cujos 15
itens de validação jurídica o Owner respondeu em steering (2026-08-24), a lista equivalente do TEAT
(`_intake/legal-assessment.md`) **não foi respondida**. Os casos de uso `approved` carregam
comportamento acordado e testável; a regra legal sob eles pode ainda ser refinada por parecer
humano. Essa assimetria é intencional e deve ser lida assim: **critério de aceitação é contrato de
implementação; regra em `draft` é fundamentação ainda sujeita a revisão jurídica.**

| Item                                                                                                              | Onde                                                       | Efeito                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Conflito triplo sobre recolhimento do documento de habilitação** — MBFT §8.3 × CTB 165/165-A × Res. 432 art. 10 | [RN-TEAT-129], [UC-TEAT-008]                               | é o item nº 1 do advogado; o sistema hoje aplica a posição de [RN-TEAT-129] com a divergência visível                                                                                                                                                                                      |
| **Bodycam: escopo MVP ou onda futura**; retenção sem norma                                                        | [RN-TEAT-141], [RN-TEAT-142], [UC-TEAT-010]                | o chrome global é barato e vale de todo modo; o regime de acesso e retenção depende da decisão                                                                                                                                                                                             |
| **Guarda monitorada em vigor, tecnologia não homologada**                                                         | [RN-TEAT-127], [UC-TEAT-009]                               | posicionamento de roadmap: modelar agora, ativar quando homologada                                                                                                                                                                                                                         |
| **Saneamento e cancelamento pós-finalização sem norma federal**                                                   | [RN-TEAT-119], [RN-TEAT-121], [UC-TEAT-006], [UC-TEAT-011] | Res. 997 art. 3º V veda alteração pós-lavratura; formalizar por portaria DETRAN-AM                                                                                                                                                                                                         |
| **Janela de "mesmo intervalo" da sessão concorrente**                                                             | [RN-TEAT-111], AC-TEAT-012-5                               | risco bilateral: janela curta deixa passar fraude, longa bloqueia agente legítimo                                                                                                                                                                                                          |
| ~~Parque de medidores de velocidade do DETRAN-AM~~                                                                | [UC-TEAT-013], [RN-DASH-173]                               | **RESOLVIDO (2026-08-27/28, Sub Gerência de Infração/DETRAN-AM):** medidores móveis **não são utilizados hoje** pelos agentes; implantação **prevista**, sem data. [UC-TEAT-013] (hipótese acoplada de [RN-TEAT-138]) fica **fora do MVP** por ora — item de roadmap, não de escopo atual. |
| **Res. 432 remete ao art. 165 anterior ao 165-A**                                                                 | [RN-TEAT-134]                                              | adotar o enquadramento correto no catálogo normativo                                                                                                                                                                                                                                       |

Nenhum deles bloqueia o início da construção: o núcleo de lavratura, evidência, sincronização,
numeração e concorrência está `approved` e não depende de nenhum.
