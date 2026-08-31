# Dossiê de pesquisa — TEAT (CRAWLER, 2026-08-24)

Rodada de pesquisa dedicada a fechar as lacunas legais explícitas do base TEAT já mineirado
(`inf/teat/APP.md`, `workflows/WF-TEAT-001..003`, `rules/RN-TEAT-001..006`,
`_intake/proposals.md`). Todos os downloads e REFs estão sob `refs/**`; nada foi escrito em
`inf/teat/**` além deste dossiê, por regra de fronteira.

**Achado central da rodada**: a "regulamentação definida pelo órgão máximo executivo de trânsito
da União", referida duas vezes por [REF-CONTRAN-918] art. 3º e marcada como "fonte pendente" em
praticamente todo artefato TEAT, **existe e foi localizada**: **Portaria SENATRAN nº 997/2022**.
É o achado de maior impacto — fecha ou reduz substancialmente 5 dos ~9 gaps explícitos do base.

---

## 1. Regulamentação específica do AIT/talão eletrônico

**Encontrado.** [REF-SENATRAN-997] (Portaria SENATRAN 997/2022) — regulamentação direta do art. 3º
§1º-II da Res. 918/2022. Regula: requisitos técnicos do equipamento (numeração sequencial
automática, armazenamento até transmissão, identificação do agente, impressão em duas vias,
integridade pós-lavratura, vedação de auto-preenchimento de placa não validado), homologação do
software pela SENATRAN (laudo técnico independente, renovação quadrienal, nova homologação a cada
alteração de funcionalidade), autenticação do agente (login/senha, biometria ou assinatura
digital), impressão (qualidade do papel, assinatura condicional, vias). Complementado por
[REF-CONTRAN-985-1003-MBFT] (Manual Brasileiro de Fiscalização de Trânsito — Res. 985/2022 +
1.003/2023), que fornece a doutrina de lavratura (quem é agente de trânsito, regra de uma
infração por AIT, classificação "possível sem abordagem / mediante abordagem / vide
procedimentos").

**Vigência**: SENATRAN 997/2022 vigente desde 01/09/2022, sem revogação localizada. MBFT (Res.
985/2022) vigente desde 02/01/2023, Anexo alterado pela Res. 1.003/2023 (vigente desde
02/01/2024) — risco de desatualização do Anexo baixado avaliado como baixo (a Parte Geral
utilizada, não as fichas por infração, é o conteúdo mais estável).

**Gap residual**: nenhum.

## 2. Fé pública do agente e presunção de veracidade do AIT

**Parcialmente encontrado.** O termo "fé pública" não aparece em nenhuma norma pesquisada. O que
foi encontrado é funcionalmente equivalente: [REF-CONTRAN-985-1003-MBFT] Seção 4 define, em rol
**taxativo**, quem pode legalmente lavrar AIT (agente de trânsito do órgão, PRF, PM mediante
convênio, guarda municipal, agentes Câmara/Senado mediante convênio), com exigência de
uniformização e regular exercício da função — pré-requisitos de legitimidade da autuação. CTB
art. 281 §1º, I (hipóteses de arquivamento por "inconsistente ou irregular") já estava capturado
em [REF-CTB-280-290]; o MBFT Seção 7 acrescenta a definição operacional de "em flagrante" ("está
cometendo… ou acaba de cometê-la, com ou sem abordagem"), relevante ao termo inicial de decadência
do art. 282 §6º-A.

**Vigência**: alta confiança (MBFT + CTB, ambos capturados de fonte oficial primária).

**Gap residual**: o "termo inicial da decadência nas autuações que não sejam em flagrante" (CTB
art. 282 §6º-A) **permanece sem regulamentação específica localizada** — o MBFT define o
critério de enquadramento ("em flagrante"), mas não o procedimento de contagem quando não há
flagrante. Gap reduzido, não fechado. Recomenda-se atualizar a anotação de risco correspondente
em [REF-CTB-280-290] art. 282.

## 3. Medidas administrativas (retenção/remoção/recolhimento)

**Encontrado — achado de maior ineditismo da rodada.** CTB arts. 269, 270, 271, 277 (+165, 165-A, 276) capturados verbatim em novo arquivo [REF-CTB-165-277-medidas-alcoolemia]. A resolução
regulamentadora vigente da remoção/depósito/leilão **não é mais a Res. 623/2016** hipotetizada no
briefing — foi **revogada e substituída pela Res. CONTRAN nº 1.025, de 26/06/2026**
([REF-CONTRAN-1025-2026]), publicada há menos de dois meses da data desta pesquisa. Institui o
**Sivec** (Sistema Integrado de Veículos Custodiados), o **Termo de Recolhimento do Veículo** com
conteúdo mínimo de 7 campos + objetos/estado de conservação/prazo, e uma figura totalmente nova —
a **guarda monitorada** (custódia do veículo sob responsabilidade do próprio proprietário, com
dispositivo de monitoramento homologado, como alternativa à remoção física). [REF-CONTRAN-985-1003-MBFT]
Seção 8 fornece a doutrina complementar de retenção/remoção, incluindo a hipótese de remoção por
"boa ordem administrativa" (lista fechada de artigos do CTB).

**Vigência**: **alta prioridade de reconferência** — norma publicada há ~2 meses, sem fonte
secundária de conferência disponível ainda. Conteúdo internamente consistente, extraído
diretamente do PDF do DOU.

**Gap residual**: nenhum quanto à existência da norma; recomenda-se validação jurídica humana da
Res. 1.025/2026 dado seu ineditismo antes de uso como base normativa definitiva de produto.

## 4. Fiscalização de alcoolemia

**Encontrado — cadeia completa em três níveis.** CTB arts. 165, 165-A, 276, 277 (verbatim, em
[REF-CTB-165-277-medidas-alcoolemia]) → Res. CONTRAN 432/2013 ([REF-CONTRAN-432], **ainda
vigente**, sem indício de consolidação/revogação posterior — a hipótese do briefing de "Res.
966/968" não foi confirmada) → Portaria INMETRO 369/2021 ([REF-INMETRO-369-2021], Regulamento
Técnico Metrológico consolidado para etilômetros, primeiro arquivo do novo diretório
`refs/inmetro/`). A Res. 432/2013 fornece exatamente o conteúdo que faltava: hierarquia de meios
de prova, requisitos do etilômetro, catálogo de sinais de alteração psicomotora (com exigência de
termo específico anexo ao AIT), caracterização da infração administrativa vs. do crime (limiares
distintos, 0,05 mg/L vs. 0,34 mg/L), conteúdo mínimo do AIT em caso de alcoolemia, e a base legal
direta — antes "fonte pendente" — de [RN-TEAT-005] quanto à recusa como fato gerador autônomo do
art. 165-A.

**Vigência**: alta confiança para CTB e INMETRO. Res. 432/2013 com confiança moderada apenas por
ausência de confirmação positiva de vigência recente (nenhuma revogação localizada, permanece
página oficial corrente do CONTRAN).

**Gap residual**: nenhum quanto ao procedimento em si.

## 5. Equipamentos de detecção (radar/registrador de imagem)

**Encontrado, nível de resumo conforme prioridade do briefing.** Cadeia confirmada: Res. CONTRAN
396/2011 (revogada) → Res. CONTRAN 798/2020 (vigente, revoga 396/2011 no art. 14) → Res. CONTRAN
804/2020 (altera 798/2020, ainda vigente) — [REF-CONTRAN-798-804-equipamentos]. Achado direto
relevante ao TEAT: a Res. 804/2020 passou a exigir que o **AIT e a NA contenham imagem com a
placa do veículo** quando a infração é apurada por medidor de velocidade — requisito de conteúdo
não listado em nenhum artefato TEAT existente.

**Vigência**: alta confiança.

## 6. DETRAN-AM local

**Parcialmente encontrado**, dois achados de natureza distinta: (a) o **talão eletrônico do
DETRAN-AM em produção** (fonte secundária — notícia institucional, não norma numerada),
desenvolvido pela **PRODAM**, com acesso restrito a agentes DETRAN-AM e BPTRAN, GPS,
sincronização com imutabilidade pós-envio, e — achado de maior valor prático — a resolução real
do gap de cancelamento pós-finalização de [WF-TEAT-001]: **submissão à Diretoria de
Fiscalização**; (b) **Portaria Normativa nº 003/2026-DP/DETRAN/AM**, norma **vigente e original**
sobre uso obrigatório de câmeras corporais, capturada verbatim
([REF-DETRANAM-TALAO-BODYCAM]) — achado totalmente novo, sem paralelo em nenhum artefato TEAT: a
bodycam é obrigatória em **toda interação agente↔condutor**, incluindo lavratura de AIT.

Confirmado também, por múltiplas fontes secundárias, o **convênio DETRAN-AM/BPTRAN** (Batalhão de
Trânsito da PM-AM) para fiscalização de trânsito — concretiza a hipótese de convênio da Seção 4
do MBFT.

**Gaps registrados explicitamente** (ver [REF-DETRANAM-TALAO-BODYCAM]): portaria específica do
talão eletrônico DETRAN-AM não localizada; instrumento formal do convênio DETRAN-AM/BPTRAN não
localizado; Portarias Normativas 005/2026 e 006/2026 (escala de agentes; protocolo) identificadas
na listagem oficial mas não baixadas (URL de PDF não previsível).

## 7. Outros estados como modelo

**Parcialmente encontrado.** Nenhum estado pesquisado (SP, MG, PR, ES, GO, MS) publica um manual
operacional do agente para talonário eletrônico como documento público autônomo — a Portaria
SENATRAN 997/2022 parece ser, na prática, o piso normativo comum a todos. Achado de maior valor:
**Termo de Convênio DETRAN-PR nº 224/2022** ([REF-DETRANPR-CONV-224-2022]), modelo de delegação
municipal de fiscalização que, em cláusula padrão, condiciona o uso de talão eletrônico à
comprovação de homologação SENATRAN — confirmação cruzada, em outro estado, de
[REF-SENATRAN-997], relevante ao cenário de convênio (DETRAN-AM/BPTRAN) do próprio TEAT.

---

# Mapa CONFIRMA / CONTRADIZ / ESTENDE

## APP.md

| Claim                                                                                                                    | Resultado                                                                                                                                                                                                        | Onde                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| "Requisitos específicos de fé pública do agente e formato oficial do talão eletrônico além do art. 3º: (fonte pendente)" | **ESTENDE** (gap fechado para formato/requisitos técnicos; parcialmente fechado para "fé pública" como tal)                                                                                                      | [REF-SENATRAN-997], [REF-CONTRAN-985-1003-MBFT] Seção 4              |
| Escopo "medidas administrativas (retenção, remoção, termos)"                                                             | **ESTENDE** — base legal completa agora disponível, incluindo figura nova (guarda monitorada) fora do escopo hoje descrito                                                                                       | [REF-CTB-165-277-medidas-alcoolemia], [REF-CONTRAN-1025-2026]        |
| Escopo "procedimento de etilômetro (teste, recusa, sinais psicomotores, encaminhamento)"                                 | **ESTENDE** — cadeia normativa completa agora disponível                                                                                                                                                         | [REF-CONTRAN-432], [REF-INMETRO-369-2021]                            |
| 9 papéis de RBAC, `field-agent` como categoria única                                                                     | **ESTENDE** — norma federal (MBFT) e achado local (DETRAN-AM/BPTRAN) mostram que `field-agent`, na prática do DETRAN-AM, é ocupado por servidores próprios **e** por PMs conveniados sob o mesmo papel funcional | [REF-CONTRAN-985-1003-MBFT] Seção 4, [REF-DETRANAM-TALAO-BODYCAM] §3 |
| Doutrina offline-first                                                                                                   | **CONFIRMA com base legal explícita, antes ausente** — "preenchimento on-line e off-line" é requisito normativo do talão eletrônico (Anexo I, e), não apenas escolha arquitetural                                | [REF-SENATRAN-997]                                                   |

## WF-TEAT-001 (lavratura do AIT)

| Item                                                                                                                  | Resultado                                                                                                                                                                                                                                                                              | Onde                                                             |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `CANCELADO` a partir de `FINALIZADO_LOCAL` — "(fonte pendente) condições e ator"                                      | **ESTENDE, gap reduzido mas não fechado com certeza plena** — norma federal cobre cancelamento de rascunho (agente solicita, autoridade aprova, no próprio app); achado local (DETRAN-AM, fonte secundária) cobre cancelamento pós-finalização (submissão à Diretoria de Fiscalização) | [REF-SENATRAN-997] Anexo II, k); [REF-DETRANAM-TALAO-BODYCAM] §1 |
| "(fonte pendente) requisitos legais específicos do talão eletrônico… além do art. 3º" (decisão de modelagem pendente) | **ESTENDE — fechado**                                                                                                                                                                                                                                                                  | [REF-SENATRAN-997]                                               |
| Transição `VALIDANDO → ACEITO/REJEITADO/PENDENTE_CORRECAO`                                                            | **CONFIRMA** indiretamente — doutrina do MBFT sobre "uma infração por auto" e classificação de infrações concorrentes/concomitantes/sucessivas dá critério de mérito para validação automatizada de consistência                                                                       | [REF-CONTRAN-985-1003-MBFT] Seção 7                              |

## WF-TEAT-002 (numeração)

| Item                                                                                     | Resultado                                                                                                                                                                                                                                                                   | Onde                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Reserva/faixa de numeração como controle técnico interno, "não há prazo legal aplicável" | **CONFIRMA, com upgrade de fonte:** numeração sequencial automática, pré-estabelecida e pré-carregável offline é agora **requisito normativo explícito** (não apenas prática TEAT), embora o `valid_until` da reserva em si permaneça parâmetro operacional não normatizado | [REF-SENATRAN-997] art. 3º, I; Anexo II, c) |
| Transição `ATIVA → ESGOTADA` não documentada                                             | Sem alteração — gap permanece                                                                                                                                                                                                                                               | —                                           |

## WF-TEAT-003 (catálogo normativo)

| Item                                                                             | Resultado                                                                                                                                                                         | Onde                             |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Rastreabilidade de versão normativa por ato legal                                | **CONFIRMA** indiretamente                                                                                                                                                        | —                                |
| (novo) Ciclo de homologação SENATRAN do software, distinto do catálogo normativo | **ACHADO NOVO, não coberto por WF-TEAT-003** — alteração de funcionalidade do app pode exigir nova homologação SENATRAN (prazo até 60 dias); risco de roadmap hoje não registrado | [REF-SENATRAN-997] Anexo VII, a) |

## RN-TEAT-001 (idempotência offline)

| Item                                                                | Resultado                                                                                                                                                                                                                                                                                                                                                                                              | Onde                            |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| "Base legal. Não há regulação explícita sobre idempotência técnica" | **ESTENDE parcialmente** — a norma não trata de idempotência de reenvio, mas traz uma regra de negócio nova e de alto risco de segurança: **sessão de agente exclusiva por dispositivo**; registros simultâneos do mesmo agente em aparelhos diferentes no mesmo intervalo **não devem ser processados** e devem ser apurados pela autoridade. Regra ausente do corpus TEAT lido — candidata a nova RN | [REF-SENATRAN-997] Anexo II, h) |

## RN-TEAT-002 (evidência/custódia)

| Item                                                                                                  | Resultado                                                                                                                                                                                                                                                                                                                                                                                          | Onde                               |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| "Base legal. (fonte pendente) — não há excerto normativo específico sobre cadeia de custódia digital" | **PARCIALMENTE ESTENDE** — ainda não localizada norma federal específica sobre cadeia de custódia digital de evidências de trânsito; mas achado local forte: Portaria Normativa DETRAN-AM 003/2026 traz regime específico de evidência (bodycam), com mesmos princípios de integridade/vedação de edição, mas para fonte de evidência **não modelada hoje** (gravação contínua, não anexo pontual) | [REF-DETRANAM-TALAO-BODYCAM] §2    |
| Conteúdo de evidência de AIT por equipamento (radar)                                                  | **ESTENDE** — imagem com placa do veículo é requisito explícito de conteúdo do AIT/NA quando apurado por medidor de velocidade                                                                                                                                                                                                                                                                     | [REF-CONTRAN-798-804-equipamentos] |

## RN-TEAT-003 (homologação de dispositivo)

| Item                                                                                                                             | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                           | Onde                       |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| "Base legal. (fonte pendente) — não há excerto normativo específico sobre homologação de equipamento… art. 3º §6º apenas define" | **ESTENDE — gap fechado**, com nuance importante: existem **dois níveis de homologação distintos** — (a) homologação do **software** pela SENATRAN (laudo técnico independente, renovação quadrienal) e (b) controle interno do órgão sobre dispositivo+versão autorizados (o que RN-TEAT-003 já modela). RN-TEAT-003 deveria passar a citar o art. 5º de [REF-SENATRAN-997] explicitamente e considerar o atributo de validade quadrienal do laudo | [REF-SENATRAN-997] art. 5º |
| "exceção/tolerância operacional não documentada" para versão sem homologação vinculada                                           | Sem alteração — gap permanece                                                                                                                                                                                                                                                                                                                                                                                                                       | —                          |

## RN-TEAT-004 (imutabilidade pós-finalização)

| Item                                                                                                        | Resultado                                                                                                                                                                                                                                                            | Onde                                |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Base legal genérica (art. 3º da Res. 918)                                                                   | **CONFIRMA, com fonte mais específica e direta**: art. 3º, V e Anexo II, b) de [REF-SENATRAN-997] exigem expressamente elementos de segurança que "impeçam sua alteração após o término da lavratura do AIT" — a mesma garantia hoje implementada via `content_hash` | [REF-SENATRAN-997]                  |
| "eventual invalidação, anulação ou arquivamento do AIT não prejudicará a medida administrativa" (implícito) | **CONFIRMA com fonte doutrinária explícita e simétrica** (nos dois sentidos)                                                                                                                                                                                         | [REF-CONTRAN-985-1003-MBFT] Seção 8 |

## RN-TEAT-005 (assinatura/recusa/impossibilidade)

| Item                                                                                                                  | Resultado                                                                                                                                                                                                                                                                                                                                                                                     | Onde                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| "Base legal. (fonte pendente) — não localizado excerto específico… sobre recusa/impossibilidade de assinatura do AIT" | Permanece parcialmente pendente para o caso genérico de assinatura do AIT; **fechado especificamente para o procedimento de etilômetro** — recusa a qualquer procedimento do art. 3º da Res. 432/2013 gera automaticamente infração do art. 165 e é tipificada à parte como art. 165-A; recusa é distinta de impossibilidade técnica do aparelho, que apenas força uso de outro meio de prova | [REF-CONTRAN-432] art. 6º, parágrafo único; [REF-CTB-165-277-medidas-alcoolemia] arts. 165-A e 277 |
| "Nenhum comando de finalização exige assinatura obtida com sucesso"                                                   | Sem contradição — mesmo padrão de 3 resultados confirmado agora também para medidas administrativas de remoção (art. 14 §2º da Res. 1.025/2026)                                                                                                                                                                                                                                               | [REF-CONTRAN-1025-2026]                                                                            |

## RN-TEAT-006 (saneamento)

| Item                                                                                                              | Resultado                                                                                                                                                                | Onde                                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| "Base legal. (fonte pendente) — mecânica de saneamento é doutrina operacional… não excerto de CONTRAN localizado" | Sem alteração direta — nenhuma norma sobre saneamento formal pós-lavratura localizada nesta rodada                                                                       | —                                   |
| Regra de "uma infração por AIT" / infrações concorrentes/concomitantes/sucessivas                                 | **ACHADO NOVO, não coberto por RN-TEAT-006** — doutrina explícita de consolidação de enquadramentos no MBFT, relevante à validação automatizada que precede o saneamento | [REF-CONTRAN-985-1003-MBFT] Seção 7 |

---

# _intake/proposals.md — status dos itens de backlog

| Item do backlog                                                                                                                                                      | Status após esta rodada                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "requisitos legais específicos do talão eletrônico além do art. 3º — fé pública do agente, formato mínimo do AIT impresso, exigências de homologação de equipamento" | **FECHADO** — [REF-SENATRAN-997]                                                                                                                                                                                                                                                            |
| "base legal para o mecanismo de saneamento de AIT"                                                                                                                   | **ABERTO** — nenhuma norma localizada                                                                                                                                                                                                                                                       |
| "catálogo fechado de valores de `no_approach_reason`"                                                                                                                | **FECHADO, com refinamento de modelagem** — não é catálogo de motivos, é classificação por enquadramento (Casos 1/2/3 do MBFT); campo deveria ser derivado do `Framing`, não texto livre                                                                                                    |
| "condições e ator autorizado a cancelar um AIT finalizado antes do envio"                                                                                            | **REDUZIDO** — norma federal cobre cancelamento de rascunho; achado local (DETRAN-AM, confiança moderada) cobre cancelamento pós-finalização                                                                                                                                                |
| "mecanismo de devolução de números não utilizados de reserva expirada"                                                                                               | **ABERTO** — nenhuma norma localizada                                                                                                                                                                                                                                                       |
| "comportamento do dispositivo quando o pacote normativo expira em campo sem conectividade"                                                                           | **ABERTO** — nenhuma norma localizada; é decisão de produto, não legal                                                                                                                                                                                                                      |
| "assinatura de testemunha… entidade própria no runtime oficial"                                                                                                      | **ABERTO** quanto a modelagem de dados; mas a **existência legal** de testemunha como meio de prova está confirmada em alcoolemia (Res. 432/2013 art. 3º §1º) e em remoção (art. 14, VII da Res. 1.025/2026 — identificação do condutor "sempre que possível", não testemunha propriamente) |

---

# Handoff — LEGAL

1. **Validar juridicamente a Res. CONTRAN 1.025/2026** ([REF-CONTRAN-1025-2026]) dado seu
   ineditismo (publicada há ~2 meses da pesquisa) antes de tratá-la como base normativa definitiva
   de produto — nenhuma fonte secundária de conferência disponível ainda.
2. **Avaliar se "fé pública do agente" tem tratamento normativo próprio** além do rol taxativo de
   quem pode lavrar AIT (MBFT Seção 4) — a pesquisa não encontrou o termo jurídico específico;
   pode ser conceito doutrinário (presunção de veracidade dos atos administrativos, CTB art. 281
   §1º-I) em vez de norma explícita. Merece parecer.
3. **Atualizar a anotação de risco de [REF-CTB-280-290] art. 282** com a referência ao critério de
   "em flagrante" do MBFT Seção 7 — reduz mas não fecha o gap do art. 282 §6º-A.
4. **Avaliar a arquitetura de dois níveis de homologação** (SENATRAN do software vs. controle
   interno do órgão do dispositivo/versão) quanto a consequências de compliance se o TEAT for
   comercializado/operado por múltiplos órgãos — implica documentação de código-fonte/scripts de
   BD entregável à SENATRAN (Anexo VI, i-j de [REF-SENATRAN-997]).

# Handoff — BPO

1. **Modelar formalmente a medida administrativa de remoção** com os 7+4 campos mínimos do Termo
   de Recolhimento do Veículo ([REF-CONTRAN-1025-2026] art. 14) — hoje `AdministrativeTerm` não
   tem esse detalhamento.
2. **Avaliar a adoção da "guarda monitorada"** ([REF-CONTRAN-1025-2026] art. 17) como extensão de
   escopo do módulo de medidas administrativas — modalidade nova, com 9 requisitos de elegibilidade
   e consequência de infração autônoma (art. 239 CTB) em caso de violação do monitoramento.
3. **Redesenhar o campo "constatação sem abordagem"** de texto livre para derivado do enquadramento
   (Casos 1/2/3 do MBFT), com Caso 3 exigindo justificativa apenas quando aplicável.
4. **Especificar a regra "sessão de agente exclusiva por dispositivo"** ([REF-SENATRAN-997] Anexo
   II, h) como nova RN-TEAT — é requisito normativo de segurança, não apenas boa prática técnica;
   registros concorrentes do mesmo agente devem **bloquear processamento**, não apenas gerar
   alerta.
5. **Avaliar a inclusão de bodycam como fonte de evidência formal** do TEAT ([REF-DETRANAM-TALAO-BODYCAM]),
   dado que é obrigatória, no DETRAN-AM, em toda interação agente↔condutor — impacto potencial
   amplo no modelo de evidências/custódia (fluxo contínuo, não anexo pontual).
6. **Registrar o "recolhimento do CRLV-e/CNH digital via sistema" (CTB art. 269 §5º)** como fluxo
   distinto do recolhimento físico — a medida administrativa sobre documento digital é executada
   por registro em Renach/Renavam, não por apreensão.
7. **Planejar o ciclo de homologação SENATRAN do software** ([REF-SENATRAN-997] Anexo VII, a) como
   item de roadmap: alteração de funcionalidade relevante pode exigir nova homologação, com prazo
   de até 60 dias.

# Handoff — UX

1. O campo de "constatação sem abordagem" não deveria ser um campo de texto livre isolado — a UX
   deveria refletir a classificação Caso 1 (sem abordagem, sem justificativa) / Caso 2 (só com
   abordagem) / Caso 3 (depende, exige justificativa condicional) derivada do enquadramento
   escolhido, evitando o agente ter que redigir uma justificativa quando a norma já dispensa.
2. Fluxo de cancelamento de AIT deveria ter **duas UX distintas**: cancelamento de rascunho (no
   próprio app, com justificativa, aprovação da autoridade) vs. solicitação de cancelamento
   pós-finalização (fluxo formal de submissão à Diretoria de Fiscalização — não deveria parecer
   uma ação imediata do agente).
3. Se bodycam for adotada como evidência formal, a UX de campo precisa deixar claro, em tempo
   real, o estado de gravação (ativo/pausado por exceção/falha) — a norma proíbe qualquer
   interrupção não autorizada e exige comunicação imediata de falha, o que sugere um indicador
   visual persistente, não apenas um toggle.
4. O procedimento de etilômetro precisa de uma UX que **diferencie claramente** recusa (gera
   AIT por art. 165-A) de impossibilidade técnica do aparelho (não gera art. 165-A, força outro
   meio de prova) — hoje modelado como o mesmo campo de motivo em RN-TEAT-005; a consequência
   jurídica é diferente e a interface deveria evitar erro de seleção nesse ponto específico.

---

# Inventário de downloads desta rodada

| Arquivo                                                     | Tamanho | Tipo     |
| ----------------------------------------------------------- | ------- | -------- |
| `refs/senatran/REF-SENATRAN-PORTARIA-997-2022.pdf`          | 129 KB  | original |
| `refs/contran/REF-CONTRAN-985-2022.pdf`                     | 53 KB   | original |
| `refs/contran/REF-CONTRAN-1003-2023.pdf`                    | 1,4 MB  | original |
| `refs/contran/REF-CONTRAN-985-2022-MBFT-ANEXO.pdf`          | 17 MB   | original |
| `refs/contran/REF-CONTRAN-432-2013.pdf`                     | 51 KB   | original |
| `refs/contran/REF-CONTRAN-798-2020.pdf`                     | 141 KB  | original |
| `refs/contran/REF-CONTRAN-804-2020.pdf`                     | 69 KB   | original |
| `refs/contran/REF-CONTRAN-1025-2026.pdf`                    | 494 KB  | original |
| `refs/inmetro/REF-INMETRO-PORTARIA-369-2021.pdf`            | 169 KB  | original |
| `refs/detran-am/REF-DETRANAM-PORTARIA-003-2026-BODYCAM.pdf` | 400 KB  | original |
| `refs/other-states/REF-DETRANPR-CONV-224-2022.pdf`          | 2,7 MB  | original |

Todos os `.txt` correspondentes (extração `pdftotext -layout`) foram gerados junto e mantidos ao
lado dos PDFs. Nenhum conteúdo foi capturado via WebFetch/extraído sem original (todas as normas
citadas verbatim têm PDF oficial baixado); os únicos achados de fonte secundária (notícias
institucionais, sem PDF/HTML original salvo) estão explicitamente marcados como tal em
[REF-DETRANAM-TALAO-BODYCAM] §1/§3 e [REF-DETRANPR-CONV-224-2022] (nota final).

---

# Resumo executivo

**Contagem**: 11 instrumentos novos capturados (7 CONTRAN/SENATRAN/INMETRO federais, 1 CTB novo
extrato, 1 DETRAN-AM, 1 outro estado, mais o dossiê). Dos itens do mapa CONFIRMA/CONTRADIZ/ESTENDE:
**0 CONTRADIZ** nenhum artefato TEAT existente; **~14 ESTENDE** (a maioria); **~6 CONFIRMA** com
fonte mais forte/específica. Nenhuma contradição frontal encontrada — a mineração original do
TEAT estava correta em tudo que afirmou, apenas incompleta nos pontos já marcados como "fonte
pendente".

## 5 achados mais consequentes

1. **Portaria SENATRAN 997/2022** é a regulamentação específica buscada há duas rodadas — fecha o
   gap mais citado do corpus TEAT (homologação de software, requisitos técnicos do talão
   eletrônico, base legal para a doutrina offline-first) e revela uma regra de segurança de alto
   risco hoje ausente do produto: **sessão de agente exclusiva por dispositivo**, com bloqueio de
   processamento em caso de concorrência.
2. **Resolução CONTRAN 1.025/2026** (publicada há ~2 meses) substitui a Res. 623/2016 e cria a
   **guarda monitorada** — modalidade de medida administrativa inteiramente nova, fora do escopo
   hoje descrito para TEAT, com potencial de extensão de produto relevante.
3. **Cadeia normativa completa de alcoolemia** (CTB → Res. 432/2013 → Portaria INMETRO 369/2021)
   fecha a base legal de [RN-TEAT-005] quanto à recusa como fato gerador autônomo (art. 165-A) e
   fornece o conteúdo mínimo estruturado do AIT de alcoolemia.
4. **Portaria Normativa DETRAN-AM 003/2026 (bodycam)** — achado local sem paralelo federal:
   gravação obrigatória em toda interação agente↔condutor, com regime de integridade análogo ao
   de evidência digital, mas para uma fonte de evidência (vídeo contínuo) hoje não modelada no
   TEAT.
5. **Prática real do talão eletrônico DETRAN-AM** (PRODAM, acesso BPTRAN, cancelamento
   pós-finalização via Diretoria de Fiscalização) — mesma organização-alvo do TEAT, resolve
   operacionalmente o gap de cancelamento de AIT finalizado, com confiança moderada (fonte
   secundária) mas alto valor prático por ser a própria operação real do órgão-cliente.
