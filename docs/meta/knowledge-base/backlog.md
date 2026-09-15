# Research backlog (steering queue)

> **Pendências consolidadas vivem em [`open-issues.md`](./open-issues.md)** (72 itens, tipados e
> priorizados, exportáveis para issues com `_meta/issues-export.py`). Este arquivo continua sendo
> o diário das rodadas; o registro é a lista de trabalho.

Formato: `- [ ] <pergunta ou id> — <por quê> (added YYYY-MM-DD)`

## Prioridade 1 — trilha recurso (rait + portal)

- [x] REF-CTB-280..290 (+257, 281-A, 282-A, 289-A, 290-A) — texto verbatim via compilado planalto.gov.br (camara.leg.br falhou, 504) → [REF-CTB-extracts-raw] (2026-08-24)
- [x] CONTRAN: Res. 900/2022 e 918/2022 capturadas (PDF oficial + excertos) → [REF-CONTRAN-900], [REF-CONTRAN-918] (2026-08-24)
- [x] Regimento/composição de JARI — Res. CONTRAN 357/2010 (diretrizes nacionais) capturada na íntegra → [REF-CONTRAN-357]; regimento LOCAL da JARI-AM/CETRAN-AM segue não localizado (2026-08-24)
- [x] Prazos legais: defesa prévia (30d mín., art.281-A), recurso 1ª instância JARI (30d p/interpor, 24 meses p/julgar — art.285), 2ª instância CETRAN (30d p/interpor, 24 meses p/julgar — arts.288-289); efeito suspensivo automático (art.285) — tudo capturado verbatim em [REF-CTB-extracts-raw] (2026-08-24)
- [x] SNE — Res. CONTRAN 931/2022 (revoga 622/16 e 636/16) capturada na íntegra, texto completo → [REF-CONTRAN-931] (2026-08-24)
- [x] DETRAN/AM: 3 cartas de serviço → [REF-DETRANAM-SERVICOS]; Portaria 5046/2018 obtida via OCR (PDF escaneado) → [REF-DETRANAM-PORTARIA-5046]; regimento JARI/CETRAN-AM segue não localizado (2026-08-24)
- [x] Benchmarks MG/PR/SP → [REF-BENCH-ESTADOS]; + processo interno RS/ES/PR/SP (distribuição, relator, quorum, sustentação oral) → [REF-CETRAN-PROCESSO-INTERNO] (2026-08-24)
- [x] Indicação de condutor — base legal geral em [REF-CONTRAN-931] art.4º VII-VIII e [REF-CETRAN-PROCESSO-INTERNO] (CETRAN-PR Res.090/24, Carteira Digital de Trânsito); prazo/formulário específico já coberto por [REF-CONTRAN-918] art.5º (2026-08-24)
- [x] Leis 9.873/1999 (prescrição) e 9.784/1999 (processo administrativo subsidiário) — capturadas → [REF-LEI-9873-1999], [REF-LEI-9784-1999] (2026-08-24; caixa reconciliada 2026-08-27)

## Prioridade 2

- [ ] RENAINF: papel do registro nacional no fluxo de recurso interestadual (2026-08-24)
- [ ] BOAT: RENAEST/registro nacional de sinistros — normas de notificação de acidentes (2026-08-24)
- [ ] PEC: resoluções sobre exame de aptidão física e mental / avaliação psicológica (2026-08-24)
- [ ] TEAT: requisitos legais do talonário eletrônico (assinatura, fé pública, evidências) (2026-08-24)

## Novos (surgidos na pesquisa de 2026-08-24)

- [x] DISCREPÂNCIA: JARI-AM anuncia julgamento em '30 dias úteis'; CTB art.285 §6º fixa teto de 24 MESES — resolvido: são naturezas diferentes (SLA operacional interno vs. teto legal de decadência), não contradição real; ver [REF-CTB-extracts-raw] nota do art.285 (2026-08-24)
- [x] Portaria DETRAN-AM 5046/2018 (representação) — PDF obtido (escaneado, OCR feito) → [REF-DETRANAM-PORTARIA-5046] (2026-08-24)
- [ ] Regimento e composição JARI-AM / CETRAN-AM — URLs históricas retornam 404, sem snapshot no Wayback; pista não confirmada: Decreto Estadual nº 34.398/2014 institui o CETRAN-AM (texto integral não obtido)
- [x] Resolução específica do SNE (900 art.12 remete) — identificada: Res. CONTRAN 931/2022 → [REF-CONTRAN-931] (2026-08-24)
- [x] CTB texto integral: obtido via planalto.gov.br compilado (camara.leg.br deu 504) + excertos verbatim arts.257, 280-290-A → [REF-CTB-extracts-raw] (2026-08-24)
- [ ] NOVO — CTB art.289-A (prescrição da pretensão punitiva por inércia do órgão julgador em julgar dentro de 24 meses) e Lei 9.873/1999 art.1º §1º (prescrição por paralisação >3 anos) — nenhum REF anterior cobria esses dois relógios de extinção de punibilidade; RAIT precisa monitorá-los ativamente. PRIORITÁRIO para LEGAL/BPO.
- [ ] NOVO — possível desatualização de [REF-CONTRAN-918] arts.20-21 face à Lei 14.599/2023 (CTB art.284 §§1º/6º) quanto a exigir adesão prévia ao SNE para o desconto de 60%; não localizada resolução CONTRAN pós-2023 ajustando a matéria
- [ ] NOVO — identificar a regulamentação CONTRAN de "força maior" para suspensão de prazos processuais (CTB art.290-A remete a regulamento não localizado)
- [ ] NOVO — confirmar grafia do nome do Diretor-Presidente que assinou a Portaria 5046/2018 (OCR ambíguo) se for necessário citar formalmente
- [ ] NOVO — obter PDF original de CETRAN-RS Res.88/2014 (site cetran.rs.gov.br bloqueou curl e WebFetch; texto atual vem de agregador legisweb.com.br, não primário)

## Mesclado dos _intake de mineração pec/teat/boat (2026-08-24)

### Corpus legal a capturar (ch)

- [ ] REF-CONTRAN-927 (2022) — exame médico e avaliação psicológica; âncora mestra do PEC
- [ ] REF-CONTRAN-789 (2020, consol. 2024) — etapas do processo de habilitação
- [ ] REF-CONTRAN-1009 (2024) — toxicológico C/D/E antes das demais etapas
- [ ] CFP 01/2019 — norma técnica da avaliação psicológica
- [ ] Portaria DETRAN-AM 005/2021 — sessão única / horário (escopo estadual)
- [ ] Portarias SENATRAN 968/2022, 495/2025, 1.515/2018, 2.145/2020 — biometria/presença
- [ ] Lei 13.787/2018 + Res. CFM 1.821/2007 — prontuário eletrônico
- [ ] MP 2.200-2/2001 + Lei 14.063/2020 — assinatura eletrônica qualificada
- [ ] Regimento/composição da junta médica de trânsito e CETRAN (contexto habilitação)

### Corpus legal a capturar (inf/est)

- [ ] Requisitos legais do talonário além da 918 art.3º (fé pública, formato do AIT impresso, homologação de equipamento)
- [ ] Base legal do saneamento de AIT; condições/ator de cancelamento de AIT finalizado
- [ ] Catálogo fechado de no_approach_reason (constatação sem abordagem)
- [ ] Base normativa do RENAEST (nada localizado além de contrato técnico)

### Decisões do owner

- [x] shared/actors.md: espelhar os 9 papéis granulares do TEAT ou manter visão agregada? → espelhar os 9 papéis (steering.md F.30, 2026-08-24)
- [x] "Parceiro conveniado" (BOAT): visão futura ou remover da missão? → manter como visão futura (steering.md F.31, 2026-08-24)
- [x] Papéis de protótipo sem RBAC (Suporte, Fiscal de contrato, DPO) entram em ondas futuras? → sim, ondas futuras (steering.md F.32, 2026-08-24)
- [x] UC-1.245/246 (danos materiais, testemunhas) e UC-1.251 (relatório preliminar): UC próprio ou extensão? → UC próprio e dedicado (steering.md F.33, 2026-08-24)

### Handoffs de engenharia (fora deste KB — monorepo/pec/teat)

- [ ] pec: estado CANCELLED do encounter é morto (enum sem rota que o grave)
- [ ] pec: primeiro laudo assinado força SIGNED — pode travar o segundo profissional na mesma rota
- [ ] pec: UNDER_REVIEW da junta é inatingível; junta sem composição/membros/pauta
- [ ] pec: rastreabilidade divergente (BP-juntas referencia SUC-UC-13/15 vs UC-J1/J2)
- [ ] teat: exclusão de intervalos de numeração SEM constraint de banco (só validação de app) — risco de sobreposição sob concorrência
- [ ] teat/boat: crash_record_id em medidas administrativas sem FK rígida (nota explícita nos docs)
- [ ] teat: comportamento do pacote normativo expirado offline (bloquear vs avisar) — decisão de produto

## Rodada RAIT — time multidisciplinar (2026-08-24)

Intakes completos para moderação: inf/rait/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md e transversal/portal/_intake/ux-notes.md.

### Decisões do owner (destiladas da rodada)

- [x] Validação jurídica humana: lista priorizada de 15 itens em legal-assessment.md — respondida em steering (2026-08-24), sem parecer formal: Lei 9.873 aplica ao DETRAN-AM (sim); relógio que governa o SLA = o mais curto (3 anos); recurso da autoridade contra provimento = vinculado (autoridade/prazo/contrarrazões ainda em aberto); desconto 40% pós-Lei 14.599/2023 sem SNE = aplicar mesmo assim (procedimento operacional ainda em aberto). Ver steering.md §C, itens 13-27, e aviso de risco no topo do arquivo.
- [x] Calibrar a escada de alertas de prescrição (marcos propostos em WF-RAIT-002 §4) → aprovada como proposta (steering.md A.1, 2026-08-24); nota de capacidade pendente — ver steering.md §"Pontos que a múltipla escolha não fechou"
- [x] Obter regimento interno JARI-AM/CETRAN-AM (não público; lead: Decreto Estadual 34.398/2014) → decisão: formalizar as propostas do corpus (CETRAN-ES+SP) como desenho de fato, sujeito a validação jurídica antes de `approved` (steering.md A.4, 2026-08-24)
- [x] Fornecer volumes históricos de defesas/recursos para o modelo de capacidade (bpo-notes §3) → ordens de grandeza fornecidas: 1 JARI-AM, quorum CETRAN ~8, volume >500/mês, 6-15 analistas (steering.md B.9-B.12, 2026-08-24); throughput real do colegiado ainda não perguntado
- [x] Corrigir cartas de serviço DETRAN-AM (2 exigências sem base legal: endosso cartorial ×Portaria 5046/2018 art.2º §2º; anexar parecer da JARI ×CTB 285 §4º) — mudança só de texto, alto impacto cidadão → autorizado (steering.md D.28, 2026-08-24)

## Rodada TEAT — time multidisciplinar (2026-08-24)

Intakes para moderação: inf/teat/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] Validação jurídica humana: 15 itens priorizados em legal-assessment.md — em especial: conflito triplo sobre recolhimento do documento de habilitação (MBFT §8.3 × CTB 165/165-A × Res.432 art.10); janela de "mesmo intervalo de tempo" da sessão concorrente (997 Anexo II,h — parâmetro a definir com risco bilateral); saneamento/cancelamento pós-finalização SEM norma (997 art.3º V proíbe alteração — formalizar via portaria DETRAN-AM?)
- [ ] Bodycam: escopo MVP ou onda futura? (BPO deixou como decisão explícita); retenção/LGPD/acesso do interessado sem norma — risco jurídico-institucional
- [ ] Guarda monitorada: em vigor porém inaplicável (solução tecnológica não homologada) — posicionar roadmap
- [ ] Termo de Recolhimento: imprimir prazo de 60 dias (não 30) — corrigir template
- [ ] Res.432 remete ao art.165 pré-165-A: adotar enquadramento correto no catálogo normativo do TEAT
- [x] Propostas de glossário/atores/WF-INF-001 dos intakes propagadas aos artefatos compartilhados (2026-08-27)

### Adjacências BOAT (para a rodada BOAT)

- [ ] Bodycam em atendimento de sinistro (Portaria 003/2026 art.4º I) + câmera veicular opcional

## Rodada BOAT — time multidisciplinar (2026-08-24)

Intakes: est/boat/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] LGPD saúde da vítima: adotar posição prudencial art.11 II a/b + publicar a hipótese (dever de publicidade hoje descumprido) — item nº1 do advogado
- [ ] Definir PRAZOS DE RETENÇÃO (BAT identificado, bodycam) — nenhuma norma os fixa; modelo de duas camadas proposto em RN-BOAT-125
- [ ] Papel LGPD do DETRAN-AM (controlador?) — divergência interna da Portaria 139/2025 art.7º §3º (cita CTB 22 II/III, não IX)
- [ ] Ofício institucional DETRAN-AM→SENATRAN: Manuais RENAEST + campos mínimos do BAT + manuais de acesso (obrigações vinculadas a documentos não públicos)
- [ ] Periodicidade de transmissão RENAEST (prazo legal desaparecido — 326-A §9º remitido a regulamentação nunca editada): adotar mensal como SLA operacional?
- [ ] Derivação severity(vítima)↔gravidade(sinistro) sem fonte — definir regra própria documentada
- [ ] Veículo removido com proprietário hospitalizado: prazo de 60d do art.328 sem suspensão — posição institucional
- [ ] Correção de registro nacional CONSOLIDADO/REJEITADO: vazio normativo — proposta PENDENTE-DE-NORMA em WF-BOAT-003

## Rodada PEC — time multidisciplinar (2026-08-24)

Intakes: ch/pec/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] Regime de distribuição de exames: adotar P2 (candidato escolhe região/data, sistema sorteia clínica/perito — recomendação técnica LEGAL, converge com antifraude) ou outra posição P1-P4? CFM 1.636 art.3º expõe pessoalmente o diretor médico
- [ ] Vocabulário de resultado: eliminar CONDICIONADO do enum; adotar rótulos federais; confirmar com DETRAN-AM o mapeamento prazo(30/60/90/365)↔rótulo(5) e o que o RENACH aceita
- [ ] Retenção 20 anos (Lei 13.787 art.6º): definir RESPONSÁVEL (clínica × DETRAN × plataforma) + preservação criptográfica de longo prazo
- [x] Recuperar Portaria DETRAN-AM 008/2021 — obtida via Wayback Machine; regime CNH Social distinto da 005/2021 (2026-08-27)
- [ ] Toxicológico periódico pós-CNH (2a6m): dentro do escopo do PEC ou 100% externo?
- [ ] Junta Especial de Saúde (3ª instância): modelar como órgão distinto (hoje é só flag de assinatura CETRAN)
- [ ] Validação humana: top-10 do advogado em legal-assessment.md

### Handoffs de engenharia (pec)

- [ ] Módulo de faturamento estruturalmente errado: preço público federal indexado ao IPCA (Lei 15.428/2026, CTB 148 §7º)
- [ ] Validade do exame: implementar 10/5/3 por faixa etária (CTB 147 §2º) — NÃO os 5/3 da 789/2020
- [ ] Enum CONDICIONADO → "apto com restrições" (medical-only); nunca exibir PENDENTE/CONDICIONADO ao candidato
- [ ] Ator do SUBMITTED da junta está errado (deve ser o candidato — RN-PEC-110)

## Rodadas PORTAL + DASHBOARD — time multidisciplinar (2026-08-24)

Intakes: transversal/{portal,dashboard}/_intake/{research-dossier,legal-assessment,bpo-notes,ux-notes}.md.

### Decisões do owner (destiladas)

- [ ] **Portaria do órgão fixando níveis de assinatura por serviço** — o Decreto 10.543/2020 é FEDERAL; sem ato estadual, exigir "avançada" no PORTAL é atacável (Lei 13.460 art.5º IV). Mitigação de custo baixo e efeito total (RN-PORTAL-101/102)
- [ ] Confirmar/registrar formalmente a (in)existência de adesão do AM à Lei 14.129/2021 — condiciona o fundamento de 12 regras PORTAL e do módulo público do DASHBOARD
- [ ] Renúncia ao recurso na faixa de 40% FORA do SNE (decisão de steering C.17): não há forma normativa para colher a declaração — definir instrumento antes de implementar
- [ ] CRLV-e bloqueado por multa sob recurso com efeito suspensivo: adotar a leitura de que exigibilidade suspensa não é débito (senão é coação indireta ao pagamento) — RN-PORTAL-116
- [ ] Declarar formalmente WCAG 2.1 AA + eMAG como padrão (LBI art.63 — obrigação sem cláusula de adesão, risco MP/ACP, custo quase nulo)
- [ ] **Limiar de célula para publicação agregada de sinistros** (risco ALTO de reidentificação em municípios pequenos) — exige parecer ANTES da primeira publicação (RN-DASH-161)
- [ ] Confirmar autorização do órgão máximo para pagamento com cartão/parcelamento (Res.918 art.27 §§1º-2º) — pré-condição de existência do módulo
- [ ] Calibrar os limiares das escadas de alerta do DASHBOARD (9 decisões em dashboard/_intake/bpo-notes.md)
- [ ] Validação humana: 18 itens (PORTAL) + lista DASHBOARD nos respectivos legal-assessment.md

### Pesquisa pendente (proposta pelo DASHBOARD legal)

- [ ] REF-AM-LAI-* (procedimento recursal estadual da LAI) — gap mais urgente
- [ ] REF-AM-GOVDIGITAL-* (adesão à 14.129, ou registro formal de inexistência)
- [ ] REF-CGEAM-IN-001-2020 + REF-DECRETO-AM-53273-2025 — solicitar à CGE-AM (site fora do ar: HTTP 500/TLS expirado)
- [ ] REF-CONTRAN-PNATRANS-FORMULAS (fórmulas dos indicadores)
- [x] Sincronizar REFs com textos já transcritos nas regras: LGPD art.5º X/art.11 e LAI art.32 incorporados às respectivas REFs (concluído 2026-08-27)

### Reconciliações pendentes (colisões de rodada paralela)

- [ ] Ouvidoria: LEGAL conclui "nenhum nível de assinatura exigível" (Decreto 10.543 art.2º p.ú. III exclui ouvidoria); BPO/UX assumiram "Simples" — alinhar WF-PORTAL-004, UC-PORTAL-016 e o catálogo de serviços
- [x] DASHBOARD: auditoria concluída; o BPO atual não contém referências `RN-DASH-*` futuras e o catálogo está reconciliado com RN-DASH-101..172 (2026-08-27)
- [x] Corrigir dossiê PORTAL: removido o falso teto de "até 12x"; art.27 é operação de cartão por conta e risco da instituição e o órgão recebe à vista e integral (art.24 §3º) (2026-08-27)
- [ ] RAIT: prescrição quinquenal sem escada de alerta própria; captura de `data_recebimento_cetran` ausente (gaps expostos pelo catálogo DASHBOARD)

## Rodada de endurecimento de especificação — RAIT (2026-08-26)

Corpus RAIT preparado para consumo por equipe de desenvolvimento: 68 critérios de aceitação
(AC-RAIT-*) nos 12 UCs, referências cruzadas reconciliadas, vocabulário de estados unificado,
inventário de telas promovido a [IU-RAIT-001], 27 artefatos em `approved`.

### Residual que segue com o Owner (nenhum bloqueia o início da construção)

- [ ] **Recurso da autoridade contra provimento** — autoridade competente, prazo próprio e
      contrarrazões ([RN-RAIT-130], [UC-RAIT-008]); é o único que bloqueia _modelagem completa_
      de metade do art.288 §1º
- [ ] **Art.289-A** — efeito do julgamento proferido após os 24 meses; suspensão/interrupção;
      intervalo entre instâncias ([RN-RAIT-112])
- [ ] **Sustentação oral** — prever como etapa configurável ou omitir por padrão ([WF-RAIT-003],
      tela T-12 de [IU-RAIT-001])
- [ ] **Desconto de 40% fora do SNE** — procedimento de emissão do documento de arrecadação
      ([RN-RAIT-127])
- [ ] _**Reformatio in pejus**_ em 2ª instância ([RN-RAIT-119], [RN-RAIT-132])
- [ ] **Índice de correção da restituição** (UFIR extinta) — índice fiscal do AM a identificar
      ([RN-RAIT-129])
- [ ] **Throughput real do colegiado** — fecha a nota de capacidade de `APP.md` §Volumes

### Fila de revisão do Owner (regras legais ainda em `draft`)

22 regras da série 1xx escritas pelo LEGAL e não revisadas individualmente: RN-RAIT-102, 104,
106, 107, 108, 109, 110, 115, 117, 118, 120, 124, 125, 126, 128, 130, 131, 132. Não bloqueiam
construção — todo AC que delas depende cita a regra explicitamente.

## Auditoria cruzada de referências e vocabulário (2026-08-26)

Aplicadas aos cinco apps restantes as duas classes de defeito descobertas na rodada RAIT.
Guardadas dali em diante por `_meta/check-corpus.py` (442 artefatos, 382 tokens canônicos, OK).

**Classe 1 — referência a regra por número proposto.** TEAT tinha a mesma armadilha do RAIT, e
documentada: `_intake/bpo-notes.md` §4 previa a substituição mecânica ("grep por `RN-TEAT-10`")
quando o LEGAL fechasse o catálogo — nunca executada. Oito citações apontavam para regras reais
de conteúdo alheio. Corrigidas com o mapa em §4. BOAT, PEC, PORTAL e DASHBOARD não tinham a
armadilha (citam 1xx reais).

**Classe 2 — vocabulário de estado cunhado fora do workflow.** TEAT: `CANCELAMENTO_SOLICITADO_POS_FINALIZACAO`
→ `SOLICITADO_CANCEL_POSFINAL`; `RETIDO_AGUARDANDO_REGULARIZACAO` → `LIBERADO_COM_PRAZO`.
PORTAL: `SESSAO_JARI` → `JULGADO_SESSAO`. DASHBOARD: `ALERTA`/`CUMPRIDO_COM_COMPROVANTE` →
`JANELA_ABERTA`/`PREPARADO`/`SUBMETIDO_PUBLICADO`/`COMPROVADO`. BOAT e PEC limpos.

**Achados avulsos corrigidos:** UC-RAIT-012 e UC-PORTAL-006 citavam [RN-RAIT-004] (diligência)
para desistência — é [RN-RAIT-123]; UC-PORTAL-014 citava [RN-PEC-106] (efeitos) para
nomenclatura — é [RN-PEC-105]; UC-PEC-002 citava [RN-PEC-005] (biometria do perito ao assinar)
para o check-in do candidato — é [RN-PEC-130]; duas referências `RN-RAIT` sem número (colchetes removidos).

## Rodada de endurecimento de especificação — TEAT (2026-08-26)

Decisão de escopo do Owner: **Opção A** — medição de velocidade com **equipamento acoplado ao talão**
(inciso II, [REF-CONTRAN-918] art. 3º §1º) entra no TEAT; **fiscalização eletrônica por equipamento
fixo** (inciso III, com referendo) fica fora, formalizando a linha que [RN-TEAT-106] já traçava.
Ver `inf/teat/APP.md` §Fronteira.

Entregue: 87 critérios de aceitação (AC-TEAT-*) em 13 casos de uso; [UC-TEAT-013] novo (medição
acoplada) com gates em [WF-TEAT-001]; **citação de regras de 17/49 para 49/49** — toda regra legal
do TEAT tem hoje um lugar operacional; [IU-TEAT-001] promovido como _registro de deltas_ sobre a
matriz oficial de 67 telas (não um inventário paralelo); [RN-DASH-173] novo no DASHBOARD para o
dever de publicidade da relação de medidores.

### Residual (detalhado em `inf/teat/APP.md` §Residual)

- [ ] **As 49 regras legais seguem em `draft`** — a lista de 15 itens de validação jurídica do TEAT
      (`_intake/legal-assessment.md`) nunca foi respondida pelo Owner, diferente da do RAIT
- [ ] Conflito triplo sobre recolhimento do documento de habilitação ([RN-TEAT-129]) — item nº 1
- [ ] Bodycam: escopo MVP × onda futura; retenção sem norma ([RN-TEAT-141], [RN-TEAT-142])
- [ ] Guarda monitorada: em vigor, tecnologia não homologada ([RN-TEAT-127])
- [ ] Saneamento/cancelamento pós-finalização sem norma federal ([RN-TEAT-119], [RN-TEAT-121])
- [ ] Janela de "mesmo intervalo" da sessão concorrente ([RN-TEAT-111])
- [ ] Parque de medidores do DETRAN-AM ([UC-TEAT-013], [RN-DASH-173])

## Rodada de endurecimento de especificação — BOAT (2026-08-26)

Entregue: 63 critérios de aceitação (AC-BOAT-*) em 12 casos de uso; **citação de regras de 18/36
para 36/36** — o bloco LGPD ([RN-BOAT-122] a [RN-BOAT-132]) e as regras de competência
([RN-BOAT-101], [RN-BOAT-107] a [RN-BOAT-113]) não tinham nenhum lugar operacional antes desta
rodada; [UC-BOAT-012] promovido de `stub` a caso de uso escrito (decisão F.33 do Owner nunca
executada); [IU-BOAT-001] promovido com 12 telas mobile + 5 web, incluindo duas novas.

Correções de consistência: [UC-BOAT-002] ainda capturava o booleano `evaded` que [UC-BOAT-007]
havia substituído pela captura estruturada dos arts. 176-178; o inventário de telas repetia o
mesmo erro.

7 artefatos `approved`, 10 `reviewed`; as 36 regras seguem `draft` — a lista jurídica do BOAT não
foi respondida, e o núcleo aberto é a base do tratamento de dado sensível de saúde.

### Achado a decidir

- [ ] **Dever de resposta ao titular ([RN-BOAT-126]) não tem caso de uso nem superfície** — a tela
      W-05 de [IU-BOAT-001] registra o gap; candidato a UC-BOAT-013, a decidir junto com a
      fronteira BOAT × PORTAL para consulta do BAT pelo cidadão ([JRN-BOAT-005])

## Rodada de endurecimento de especificação — PEC (2026-08-26)

Entregue: 70 critérios de aceitação (AC-PEC-*) em 12 casos de uso; **citação de regras de 22/36
para 36/36** — faltavam o bloco LGPD ([RN-PEC-150] a [RN-PEC-154]), o bloco de prontuário e
assinatura ([RN-PEC-140] a [RN-PEC-142]) e as regras do ato pericial ([RN-PEC-101],
[RN-PEC-104], [RN-PEC-107]); [UC-PEC-013] promovido de `stub` a caso de uso escrito, redigido
para a posição P2 recomendada pelo LEGAL com os pontos que mudam sob P1/P3 marcados;
[IU-PEC-001] promovido com 26 telas (3 novas), das quais 5 ficam bloqueadas por decisão pendente.

[UC-PEC-012] foi promovido a `reviewed` em 2026-08-31 após a reconciliação de DT-024: o PEC
recebe do RENACH, pela fronteira SENATRAN, eventos autenticados e idempotentes de resultado
toxicológico periódico; não fabrica encounter, não substitui o alerta da SENATRAN e registra de
forma imutável resultado, suspensão e eventual liberação.

10 `approved`, 9 `reviewed`; as 36 regras seguem `draft` (top-10 do advogado não respondido).

### Particularidade do PEC — três itens já são DEFEITOS, não decisões

- [ ] Faturamento estruturalmente errado (preço público IPCA, Lei 15.428/2026) — DT-100
- [ ] Validade do exame 10/5/3 por faixa etária, não 5/3 da Res. 789/2020 — DT-101
- [ ] `CONDICIONADO` exposto ao candidato, rótulo inexistente em norma — DT-102, DT-022
- [ ] Implementar a Junta Especial de Saúde como colegiado distinto designado pelo CETRAN,
      substituindo no alvo a reatribuição de signatário da origem — DT-025 reconciliada em
      2026-08-31

## Rodada de endurecimento de especificação — PORTAL (2026-08-26)

**O PORTAL entrou com 0/28 regras citadas** — o caso mais extremo do programa. A rodada LEGAL
correu em paralelo à do BPO e seu resultado nunca foi incorporado: os 19 casos de uso citavam
regras do RAIT, do PEC e do BOAT, e nenhuma do próprio app. **Agora 28/28.**

Entregue: 92 critérios de aceitação (AC-PORTAL-*) em 19 casos de uso; [RN-PORTAL-108] ancorada em
[WF-PORTAL-001] (Carta de Serviços como campo de catálogo, medível item a item);
[IU-PORTAL-001] promovido com 27 telas (1 nova — elevação de nível), com acessibilidade tratada
como obrigação de resultado incidente sobre todas.

15 `approved`, 10 `reviewed`; as 28 regras seguem `draft` (18 itens jurídicos abertos).

### Duas afirmações FALSAS corrigidas — teriam virado código

- [x] [UC-PORTAL-015] dizia parcelamento "em até 12x" como regra do órgão — o art.27 da Res.918 é
      operação de cartão por conta e risco da instituição e **não fixa parcelas** ([RN-PORTAL-126];
      fecha DT-120)
- [x] [UC-PORTAL-018] aplicava os 15 dias do art.19 II da LGPD ao Poder Público — não é o prazo
      aplicável ([RN-PORTAL-120])

## Rodada de endurecimento de especificação — DASHBOARD (2026-08-31) — ÚLTIMA

Entregue: 46 critérios de aceitação (AC-DASH-*) em 8 casos de uso; **citação de regras de 0/31
para 31/31** (mesmo padrão do PORTAL — a rodada LEGAL nunca foi incorporada); [IU-DASH-001]
promovido com 9 painéis (1 novo: transparência ativa) e a hierarquia de três camadas.

### O achado: colisão de vocabulário entre a camada derivada e a fonte

- [x] **Letras dos relógios do RAIT divergiam.** O DASHBOARD usava `B1/B2/C1/C2`; o RAIT e o modelo
      de dados usam `A/B/C/D`. O `C` do painel era o `D` do RAIT e o `C2` do painel era o `C` do
      RAIT — um operador lendo "relógio C" nos dois lugares veria relógios **diferentes**, e nenhum
      valor `B1/B2/C1/C2` é gravável em `rait_clock.clock_code`. Corrigido em [RN-DASH-131], que
      agora declara explicitamente que **o RAIT é o dono das letras**; a distinção 1ª/2ª instância
      permanece como dimensão `instancia` do relógio B, não como letra nova
- [x] [RN-DASH-131] dizia "quatro relógios" no título e "os cinco relógios acima" no corpo
- [x] Inventário de telas citava [WF-RAIT-002] §4.1-4.3, anterior ao relógio D
- [x] Catálogo de deveres descrito como 13 linhas; [RN-DASH-120] tem 14

Vocabulário obsoleto das outras rodadas (`evaded`, `CONDICIONADO`, "12x") verificado e ausente.

**Seis de seis apps com rodada concluída.** Total do programa: 427 critérios de aceitação,
citação de regras fechada em cinco dos seis apps (RAIT em 32/43 — ver abaixo).

### Divergência especificação × código encontrada nesta rodada

- [ ] **O relógio D existe no código, mas não neste repositório.** `aarusso-nyx/detran` main tem a
      constraint `clock_code in ('A','B','C','D')` e o PR #20 mergeado; aqui, [WF-RAIT-002] §4.4
      ainda é "SLA operacional local" — a seção do relógio D nunca foi publicada. A regra
      [RN-DASH-131] foi ancorada no modelo de dados (verificável hoje) em vez de na seção ausente,
      e a lacuna fica registrada até que a seção seja publicada

### Único débito de cobertura remanescente

- [ ] **RAIT: 32/43 regras citadas.** Oito nunca citadas de origem + três do bloco LGPD
      ([RN-RAIT-133..138]) acrescentado depois da rodada. O RAIT foi o primeiro app e a métrica de
      cobertura só passou a ser medida a partir do TEAT — lacuna da disciplina, não do corpus

## Rodada de modelagem BPM do ciclo da infração (2026-09-12)

- [x] **Decidir a substituição de [WF-INF-001] por [WF-INF-003]** — **DECIDIDO pelo Owner em
      2026-09-12 (ADR-0014):** WF-INF-003 substitui WF-INF-001; ponteiro mantido, referências
      atualizadas, WF-INF-003 promovido a `reviewed`. Runtime: agregado da infração ainda sem
      blueprint (ver ADR-0014 §Consequências)
- [ ] **Reconciliar a escada do relógio B** — [RN-RAIT-112] (4 degraus, crítico em 21 meses) ×
      [WF-RAIT-002] §4.1 (5 degraus, crítico em 23 meses, aprovado em steering A.1) (added 2026-09-12)
- [ ] **Desfecho de `T-NA-IND` vencido** (NA ao condutor indicado não expedida em 30 dias do protocolo
      da indicação) — a norma dá o termo inicial, não a consequência; proposta em [WF-INF-002]
      §Decisões pendentes, validar com LEGAL (added 2026-09-12)

## Rodada de organização do trabalho RAIT (2026-09-12)

- [ ] **Estatuto da Pessoa Idosa (Lei 10.741/2003) art. 71** — prioridade de tramitação; capturar
      para ativar a prioridade legal na ordem de consumo das filas ([RN-RAIT-141]) (added 2026-09-12)
- [ ] **Escala de assinatura das 55 autoridades investidas** — ato de investidura/delegação e
      divisão de circunscrições ([RN-RAIT-143], [WF-RAIT-004] §3) — `institutional-ask` (added 2026-09-12)
- [ ] **Taxa de recurso à JARI/CETRAN e throughput de sessão** (DT-064) — fecha o dimensionamento
      de [WF-RAIT-004] §8 e o gatilho de nova turma ([RN-RAIT-139]) (added 2026-09-12)
- [ ] **Blueprint BP-INF-RAIT-WORKLIST-001** — deltas de modelo de dados propostos em
      [WF-RAIT-004] §10 (unidade/turma, escala, lote de sorteio, suplência, tipo de impedimento,
      banca) — decisão do Architect (added 2026-09-12)

## Rodada de definições para a orquestra de agentes — RAIT (2026-09-12)

- [x] **Adoção de STYNX 1.3.1 / Angular 22 / DEVAI 1.4.5** — decidida pelo Owner (steering G.34; ADR-0015);
      migração dos pins no WP-0 de `docs/framework/arch/rait-build-pack.md`
- [x] **Catálogo canônico de papéis estendido** com a família `rait-*` (steering G.35): `roles.ts`,
      `policy.ts`, `05-role-catalog.sql`, `shared/actors.md`; gate `verify:role-catalog`
- [x] **Vocabulário de [WF-INF-003] persistido** (`14-inf-lifecycle-vocabulary.sql`; steering G.36); gate
      `verify:lifecycle-vocabulary`
- [ ] **Questões pendentes compiladas** em `docs/meta/knowledge-base/open-decisions-rait.md` (OD-001…OD-308) —
      cada uma com premissa de desenho; fechar por Owner / regimentos / LEGAL (added 2026-09-12)
- [x] **`apply.sh` não lista os DDL gerados 34…37** — corrigido em 2026-09-13 junto com `seed.sh` e as
      fixtures canônicas (validado em banco limpo)
- [x] **Suporte à orquestra (2026-09-13)**: manuais por perfil (`docs/meta/agents/`, `.claude/agents/`),
      `CODESTYLE.md`, template de PR, estratégia de testes, fixtures canônicas + `seed.sh`, motor de
      prazos, contrato de eventos/SSE, guia do kit, glossário i18n + `rait.pt-BR.json`, roteiro WP-0
- [ ] **Angular 22 — mudanças específicas** ainda não verificadas contra o guia oficial de atualização;
      registrar em `wp0-stynx-1-3-1-migration.md` §7 durante o WP-0 (added 2026-09-13)
- [ ] **Calendário de feriados 2026 (AM + Manaus)** das fixtures é referência de teste; validar com ato
      oficial antes de virar parâmetro (added 2026-09-13)
- [x] **Aceitar as ADRs de fronteira 0016…0020** (numeradas 0014…0018 até a fusão com `main`) — aceitas pelo Owner em 2026-09-13 (steering G.37)
- [x] **Pacote TEAT (2026-09-13)**: `teat-frontends.md`, `teat-route-contract.md`, `teat-error-catalog.md`,
      `teat-build-pack.md` (WP-T0…T6; 12 questões OD-T01…T12)
- [x] **Defeitos de base do TEAT** (WP-T0, 2026-09-13, branch `fix/wp-t0-base-defects`; ver `teat-build-pack.md` §WP-T0): prefixo de rota do gerador (`v1/inf/aitaits`), `AitModule` sem os
      comandos, entidades de auditoria do `ops`, política × rotas — corrigir antes de gerar clientes (added 2026-09-13)
- [ ] **Reconciliar `use-cases/INDEX.md` do TEAT** (status dos UCs e ausência do UC-TEAT-013) e a contagem
      de regras (49 × 50) em `APP.md` (added 2026-09-13)
- [x] **Pacote PORTAL (2026-09-13)**: `portal-frontends.md`, `portal-route-contract.md`, `portal-error-catalog.md`,
      `portal-build-pack.md` (WP-P0…P6; 13 questões OD-P01…P13)
- [ ] **Reconciliar `use-cases/INDEX.md` do PORTAL** (marca todos como `draft`; arquivos são `approved`/`reviewed`)
      e registrar uma RN dedicada ao ato de adesão ao SNE (UC-PORTAL-007 cita "backlog BPO/LEGAL") (added 2026-09-13)
- [x] **Pacote BOAT (2026-09-13)**: `boat-frontends.md`, `boat-route-contract.md`, `boat-error-catalog.md`,
      `boat-build-pack.md` (WP-B0…B5; 13 questões OD-B01…B13)
- [ ] **BOAT — reconciliar `policy.ts` (`est:crash-record:*`) com o corpus e criar UC-BOAT-013** (dever de
      resposta ao titular, tela W-05); atualizar `use-cases/INDEX.md` (added 2026-09-13)
- [x] **Pacote DASHBOARD (2026-09-13)**: `dashboard-frontends.md`, `dashboard-route-contract.md`,
      `dashboard-error-catalog.md`, `dashboard-build-pack.md` (WP-D0…D5; 13 questões OD-D01…D13)
- [x] **DASHBOARD — papéis `dash-operator`/`dash-duty-owner`, política para alertas/deveres/exportação**
      (WP-D0, `R-0003`/`dash-roles`, concluída 2026-09-14; OD-D01) (added 2026-09-13)
- [ ] **DASHBOARD — promoção dos ids de tela D-01…D-18 ao corpus** (WP-D4, ainda aberta) (added 2026-09-13)
- [ ] **Portão de implementação (2026-09-13)**: `implementation-gate-2026-09-13.md` consolida os pontos de atenção das
      cinco superfícies e as 7 decisões que bloqueiam o início; fechar pelo Owner na ordem sugerida
- [x] **Plano de fechamento em três vias (2026-09-13)**: `decision-closure-plan.md`, `parameter-catalogue.md`,
      ADR-0021 (`ops.parameter`), 8 cédulas em `owner-ballots/`, carta-modelo; pesquisa da via A capturou 8 REFs
      (PN DETRAN-AM 001/2025 assinaturas; portarias LGPD 2026; CSAD; STJ Temas 1.293/1.294; ANPD; DETRAN-DF TTD;
      Lei 10.741; calendário 2026) e reconciliou as respostas DT-010…031 nos registros OD
- [x] **Owner respondeu as cédulas 01–08** em prompt interativo (steering §H.38–57, 2026-09-13)
- [ ] **Owner assina e envia os seis ofícios** de `owner-ballots/letters/` (DETRAN-AM gabinete, CETRAN-AM, CSAD/CPPD,
      SENATRAN, PGE-AM, Diretoria Técnica); registrar datas no `letters/README.md` (added 2026-09-13)
- [ ] **Propagar H.38–57 ao código**: papéis `dash-*`, atributo `decision_body`, `ops/agency`, seeds do catálogo com
      `status=vigente`, `teat.homologation.expired_behavior=warn`, retenção 5/5/10 (added 2026-09-13)
- [ ] **Repetir Wayback para o Decreto AM 34.398/2014** (`Regimento-Interno-Cetran.pdf`, 404 no site, 429 no
      archive.org em 2026-09-13) e capturar o Decreto Manaus 4.922/2020 (JARI do IMMU) como benchmark (added 2026-09-13)
- [x] **WP-A — parameter store compartilhado**: `BP-OPS-PARAMETER-001`, DDL
      `15-ops-parameter.sql`, seed gerado do catálogo e gate `verify:parameter-catalogue`
      concluídos por R-0004 / PR #37 (`PC-0002`, 2026-09-14) (ADR-0021) (added 2026-09-13)
- [ ] **WP-A — view de compatibilidade de `inf.normative_agency_parameter`** sobre
      `ops.parameter` permanece para a regeneração do módulo normativo; não integra R-0004
      (ADR-0021 Decisão 6) (added 2026-09-13)
- [ ] **WP-T1/T2 — achados do WP-T0**: `ops/*` (operations, evidence-custody, snapshots) sem módulo Nest e com serviços
      não injetáveis; `MeasureLifecycleService`/`AlcoholLifecycleService` e seus comandos ainda não montados; as sete
      entidades da origem (item 6 de `teat-route-contract.md` §9); `ops:evidence:complete-upload|validate` voltam com rotas (added 2026-09-13)
- [x] **Meta-orquestração definida (2026-09-14, ADR-0022)**: método em `docs/meta/agents/orchestra/`, escada de
      modelos, plano de ondas (14 frentes, R-0003…R-0016), templates de maestro/reviewer/worker, ponte
      `tools/orchestra/bridge.sh`; R-0003 (`dash-roles`) e R-0004 (`param-store`) concluídas
- [x] **Frente `dash-roles` (`R-0003`) concluída em 2026-09-14 pelo PR #32 e fechada como
      `PC-0001`**: WP-D0 executado
      (papéis, política `dashboard:*`, camadas N0…N3; merge
      `cf8f475eaf1951fa2ebb3c42d24f725c6581ea0e`; ver backlog DASHBOARD acima e
      `dashboard-build-pack.md`)
- [x] **Onda 1 concluída**: R-0003 (`dash-roles`) fechada como `PC-0001` e R-0004
      (`param-store`) fechada como `PC-0002`, ambas mescladas em 2026-09-14 (added 2026-09-14)
- [ ] **Corrigir gates dos build packs** que citam comandos inexistentes (`orchestra/README.md` §9) antes da onda 2 (added 2026-09-14)
- [x] **Rodadas R-0005…R-0016 instanciadas (2026-09-14)**: `work/rounds/R-00nn/{plan.md,prompts/00-maestro.md}` para as
      doze frentes restantes de `waves.md` (ondas 2–7), com metas, tríades, critérios em comandos existentes, numeração
      real de DDL (ver `orchestra/README.md` §9) e ajuste do baseline do KB nas frentes que criam fichas de tela
- [ ] **Abrir a onda 2** (`ops-agency` R-0005 em Codex/Sol, `rait-model` R-0006 em Claude/Fable) assim que a onda 1
      estiver em `main`; a partir da onda 3, abrir a próxima frente de uma família quando a anterior daquela família mesclar (added 2026-09-14)
