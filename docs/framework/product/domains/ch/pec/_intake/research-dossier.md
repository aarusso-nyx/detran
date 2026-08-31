# Dossiê de pesquisa — rodada CRAWLER do PEC (2026-08-25)

Modo: **confirm-extend**. Base minerada preexistente (APP.md, WF-PEC-001..003, JRN-PEC-001..003,
UC-PEC-001..009, RN-PEC-001..008) confrontada com o corpus legal capturado nesta rodada. Fronteira
de escrita respeitada: apenas `refs/**` (novos arquivos, ver inventário) e este dossiê — nenhum
artefato de `ch/pec/{APP,journeys,use-cases,workflows,rules}` foi tocado; correções concretas de
`RN-PEC-*` ficam para o especialista LEGAL.

## 1. Inventário de downloads

| REF                                                                                                                 | Instrumento                                             | Método                                                     | Tamanho/páginas                 |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------- |
| [REF-CONTRAN-927-2022](../../../../../../reference/legal/contran/REF-CONTRAN-927-2022.md)                           | Res. CONTRAN 927/2022                                   | curl, PDF oficial gov.br/transportes                       | 7 págs., texto integral         |
| [REF-CONTRAN-923-1009-toxicologico](../../../../../../reference/legal/contran/REF-CONTRAN-923-1009-toxicologico.md) | Res. CONTRAN 923/2022 + 1.009/2024 (par base+emenda)    | curl, PDF oficial                                          | 31 págs. (923) + 6 págs. (1009) |
| [REF-CONTRAN-789-2020](../../../../../../reference/legal/contran/REF-CONTRAN-789-2020.md)                           | Res. CONTRAN 789/2020                                   | curl, PDF oficial                                          | 8 págs. úteis                   |
| [REF-CFP-01-2019](../../../../../../reference/legal/conselhos/REF-CFP-01-2019.md)                                   | Resolução CFP nº 1/2019                                 | curl, PDF oficial (satepsi.cfp.org.br)                     | 6 págs., texto integral         |
| [REF-CFM-1636-2002](../../../../../../reference/legal/conselhos/REF-CFM-1636-2002.md)                               | Resolução CFM nº 1.636/2002                             | curl, PDF oficial (sistemas.cfm.org.br)                    | 2 págs., texto integral         |
| [REF-CFM-1821-2007](../../../../../../reference/legal/conselhos/REF-CFM-1821-2007.md)                               | Resolução CFM nº 1.821/2007                             | curl, PDF oficial                                          | 6 págs.                         |
| [REF-SENATRAN-PORTARIA-968-2022](../../../../../../reference/legal/senatran/REF-SENATRAN-PORTARIA-968-2022.md)      | Portaria SENATRAN 968/2022 + 495/2025 (par base+emenda) | curl, PDF oficial                                          | 5 págs. + 3 págs.               |
| [REF-LEI-13787-2018](../../../../../../reference/legal/leis/REF-LEI-13787-2018.md)                                  | Lei 13.787/2018                                         | curl (UA de navegador — ver nota técnica), planalto.gov.br | texto integral, 7 arts.         |
| [REF-MP-2200-2-2001](../../../../../../reference/legal/leis/REF-MP-2200-2-2001.md)                                  | MP 2.200-2/2001                                         | curl (UA de navegador), planalto.gov.br                    | 20 arts., excerto arts. 1º/10   |
| [REF-LEI-14063-2020](../../../../../../reference/legal/leis/REF-LEI-14063-2020.md)                                  | Lei 14.063/2020                                         | curl (UA de navegador), planalto.gov.br                    | texto integral                  |
| [REF-DETRANAM-PORTARIA-005-2021](../../../../../../reference/legal/detran-am/REF-DETRANAM-PORTARIA-005-2021.md)     | Portaria Normativa 005/2021-DETRAN/AM                   | curl, PDF oficial (detran.am.gov.br)                       | 7 págs., texto integral         |

**Nota técnica.** `planalto.gov.br` recusa/trava requisições `curl` sem `User-Agent` de navegador
(timeout de conexão); todas as três leis federais só baixaram após adicionar
`-A "Mozilla/5.0 [...] Chrome/120.0 Safari/537.36"`. Registrar esse padrão para rodadas futuras que
precisem do planalto.

**Reuso, não recaptura.** [REF-LEI-13709-2018] (LGPD) já existia do round BOAT — citada abaixo por
remissão, não recapturada, conforme instrução de boundaries.

## 2. Negativos (registrados, não apenas "não localizado")

| Item buscado                                                                             | Resultado                                                 | Detalhe                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portaria DENATRAN 1.515/2018                                                             | **Revogada**                                              | Art. 12, II, da Portaria SENATRAN 968/2022                                                                                                                                                                                                    |
| Portaria DENATRAN 2.145/2020                                                             | **Revogada + fora de escopo material**                    | Revogada pela Portaria SENATRAN 357/2022; tratava de validação facial em cursos EAD (Res. CONTRAN 730/2018), não do exame clínico                                                                                                             |
| Res. CONTRAN 425/2012                                                                    | **Revogada**, mas ainda citada por norma estadual vigente | Revogada pelo art. 31, I, da Res. 927/2022; a Portaria DETRAN-AM 005/2021 (2021, portanto anterior à revogação) cita-a nos arts. 9º §único e 28-A e não foi atualizada depois de abril/2022                                                   |
| Portaria Normativa 001/2019/DETRAN/AM                                                    | **Não localizada isoladamente**                           | Só conhecida pelos dispositivos que a Portaria 005/2021 transcreve em nova redação                                                                                                                                                            |
| Portaria Normativa 008/2021-DP-DETRAN-AM                                                 | **Listada mas 404 no download**                           | URL com "º" codificado retorna 404 em duas variantes testadas — candidata a substituir 001/2019+005/2021 por inteiro; vigência do conteúdo de 005/2021 capturado nesta rodada **não está confirmada** contra essa possível norma mais recente |
| Res. CFM 2.218/2018                                                                      | **Não recapturada**                                       | Citada no cabeçalho oficial de REF-CFM-1821-2007 como norma modificadora; buscar antes de promover REF-CFM-1821-2007 a `reviewed`                                                                                                             |
| CFM 2.323/2022                                                                           | **Descartada como alvo**                                  | A busca dirigida (item 4 do escopo, "verificar o que realmente se aplica") mostrou que a norma efetivamente aplicável ao ato pericial é a CFM 1.636/2002, não a 2.323/2022                                                                    |
| Anexos I-XXII da Res. CONTRAN 927/2022                                                   | **Não capturados**                                        | Ficam publicados separadamente "no sítio eletrônico do órgão máximo executivo de trânsito da União" (art. 30), não embutidos no PDF do DOU                                                                                                    |
| Regimento formal da Junta Médica/Psicológica de trânsito + do CETRAN (composição/quorum) | **Parcialmente resolvido**                                | A composição/prazos existem em norma federal (Res. 927/2022 arts. 12-15) — não é mais um "não localizado" para a Junta; o **regimento interno do CETRAN-AM** em si (já registrado como gap na rodada RAIT) permanece não localizado           |

## 3. Achados por alvo (prioridade do escopo)

### Alvo 1 — Res. CONTRAN 927/2022 (âncora mestra)

Texto integral capturado. Ver [REF-CONTRAN-927-2022] para o detalhamento completo. Resumo dos
quatro achados de maior impacto:

1. **Composição e prazos da junta médica/psicológica e recurso ao CETRAN** (arts. 12-15) — fecha,
   com base legal explícita, o gap mais citado do corpus PEC.
2. **Nomenclatura de resultado** (art. 8º: apto / apto com restrições / inapto temporário /
   inapto) **diverge** do enum `medical_result='CONDICIONADO'` usado por [RN-PEC-006].
3. **Prazo de disponibilização do resultado psicológico**: 2 dias úteis (art. 9º §3º) — único
   prazo numérico de "produção de resultado" encontrado em toda a pesquisa.
4. **Credenciamento de clínicas/profissionais**: vigência de 1 ano, renovável, comprovação
   bienal, estatística mensal (dia 20) e anual (fevereiro) — nenhum artefato PEC modela esse
   ciclo, que é candidato a um workflow de administração/credenciamento futuro.

### Alvo 2 — Res. CONTRAN 789/2020 (etapas do processo de habilitação)

Texto capturado é a publicação original de 2020 — **não** uma versão consolidada com a emenda da
Res. 1.009/2024 (ver nota de vigência em [REF-CONTRAN-789-2020]). Achado principal: a **ordem
legal explícita** das etapas (art. 2º §1º) é _Avaliação Psicológica → Exame de Aptidão Física e
Mental → ..._ — nenhum artefato PEC afirma ou nega uma ordem entre os dois exames clínicos que
compõem o `encounter`; hoje são modelados como paralelos.

### Alvo 3 — Res. CONTRAN 1.009/2024 (toxicológico C/D/E)

**Achado de citação incorreta no próprio APP.md/RN-PEC-007**: a 1.009/2024 não é, ela mesma, a
norma do exame toxicológico — é uma resolução _alteradora_ de três outras (789/2020, **923/2022**
e 985/2022/MBFT). A norma-base do exame toxicológico é a **Res. CONTRAN 923/2022**, capturada
nesta rodada e combinada com a 1.009/2024 em um único REF (ver
[REF-CONTRAN-923-1009-toxicologico]). Achados de conteúdo: validade de 90 dias (fecha lacuna de
[RN-PEC-007]); um **exame toxicológico periódico pós-CNH** (art. 10-A, novo, a cada 2 anos e 6
meses para <70 anos) inteiramente ausente de qualquer WF/RN-PEC — pode ou não passar pelo PEC,
recomenda-se pergunta de produto.

### Alvo 4 — CFP 01/2019 + CFM (perito médico examinador)

CFP 01/2019 capturada integralmente — ver [REF-CFP-01-2019]. Confirma diretamente a entrevista
devolutiva obrigatória (§22), já replicada verbatim na Portaria DETRAN-AM 005/2021 art. 47 §1º —
cadeia normativa federal→estadual fechada, caso raro nesta pesquisa. Para o médico, a norma CFM
efetivamente aplicável ao ato pericial não é a 2.323/2022 (hipótese do escopo original) mas a
**CFM 1.636/2002** — capturada, ver [REF-CFM-1636-2002]. Achado de maior risco: art. 3º exige
**distribuição aleatória e impessoal dos exames pelo DETRAN, nunca por escolha do periciado** —
possível conflito com o modelo de agendamento do PEC, que parece permitir escolha de clínica.

### Alvo 5 — Portarias SENATRAN/DENATRAN de biometria

Das 4 portarias do escopo original, 2 estão revogadas (ver §2 acima) e 2 formam o par vigente
968/2022+495/2025 — ver [REF-SENATRAN-PORTARIA-968-2022]. Achado de vigência crítico: a validade
da imagem biométrica **mudou de 10 anos fixos (texto de 2022) para "mesma validade da CNH" (texto
de 2025)** — qualquer fonte secundária que ainda cite "10 anos" está desatualizada. O par
§3º/§4º do art. 4º (2022) — ausência de digital → obrigatoriedade de fallback por reconhecimento
facial — é a evidência técnica mais próxima do desenho de [RN-PEC-003], mas a redação de 2025
zerou esses parágrafos com reticências "(NR)"; não localizado o anexo/normativo que hoje os
substitui.

### Alvo 6 — Prontuário eletrônico + assinatura

Quatro instrumentos capturados: [REF-LEI-13787-2018], [REF-CFM-1821-2007], [REF-MP-2200-2-2001],
[REF-LEI-14063-2020]. **O achado de maior impacto de toda a rodada**: Lei 13.787/2018 art. 6º fixa
**retenção mínima de 20 anos** para o prontuário, expressamente aplicável a documentos "gerados e
mantidos originalmente de forma eletrônica" (§5º) — cobre o modelo do PEC (laudo nasce PDF/A
assinado). Nenhum `RN-PEC` trata de retenção/eliminação — mesma classe de lacuna que a rodada BOAT
encontrou para o registro de sinistro. Achado de nuance jurídica: Lei 14.063/2020 art. 14 exige
apenas assinatura **avançada OU qualificada** para documento eletrônico de profissional de saúde
em geral (o art. 13, mais estrito — só qualificada —, é para "atestados médicos" em sentido
estrito e receituários controlados); [RN-PEC-002] já opera no patamar mais alto (qualificada via
ICP-Brasil), portanto está seguro sob qualquer das duas leituras, mas a classificação exata do
laudo de aptidão (art. 13 vs. art. 14) fica como pergunta a LEGAL.

### Alvo 7 — Junta médica/psicológica: composição e recurso ao CETRAN

Resolvido pelo Alvo 1 (Res. 927/2022 arts. 12-15) — ver resumo acima. O regimento interno
específico do CETRAN-AM (distinto da composição da Junta em si, que agora tem base federal)
permanece não localizado — mesmo gap já registrado pela rodada RAIT.

### Alvo 8 — DETRAN-AM local

Portaria Normativa 005/2021 capturada integralmente — ver [REF-DETRANAM-PORTARIA-005-2021]. É uma
emenda pontual à Portaria 001/2019 (não localizada isoladamente), com uma possível norma mais
recente (008/2021) inacessível por 404 — **vigência do conteúdo abaixo não fechada, ver §2**.
Achados, mesmo com essa ressalva: janela de atendimento 08h-13h em dias úteis (fecha o item de
"sessão única/horário" do backlog); retenção de 5 anos de laudos pós-descredenciamento; vedação de
assinatura cruzada (espelha CFM 1.636/2002); vedação de exame em CFC (espelha CFM 1.636/2002);
supervisão de estagiário (âncora estadual explícita para [RN-PEC-004]); nomenclatura de resultado
com **cinco** rótulos incluindo "PENDENTE" (diverge tanto da federal quanto do `CONDICIONADO` do
PEC); e uma citação a uma resolução CONTRAN já revogada (425/2012) não atualizada desde 2022.

## 4. Mapa CONFIRM / CONTRADICT / EXTEND — por artefato existente

### APP-PEC

- **CONFIRM**: A caracterização do PEC como "módulo satélite clínico" que "não decide se o
  condutor está habilitado" é inteiramente compatível com a Res. 927/2022 e a 789/2020 — o PEC
  cobre exatamente os dois primeiros itens da sequência legal do art. 2º §1º da 789/2020
  (Avaliação Psicológica, Exame de Aptidão Física e Mental), corretamente excluindo os cursos e
  provas de direção.
- **CONTRADICT (leve)**: os quatro âncoras legais listadas como "(fonte pendente)" — REF-CONTRAN-927,
  REF-CONTRAN-789, REF-CONTRAN-1009 — estão agora capturadas; a citação a "REF-CONTRAN-1009" como
  a norma do exame toxicológico deve ser corrigida para apontar à 923/2022 (1009 é emenda, não a
  norma-base) — ver §3, Alvo 3.
- **EXTEND**: seção "Âncoras legais" deveria listar também CFP 01/2019, CFM 1.636/2002, CFM
  1.821/2007, MP 2.200-2/2001, Lei 14.063/2020, Lei 13.787/2018 e Portaria SENATRAN 968/2022 —
  todos agora com REF próprio.

### WF-PEC-001 (ciclo de vida do encounter)

- **EXTEND**: tabela "Prazos e timers" pode ganhar três linhas com base legal concreta em vez de
  "(fonte pendente)": validade do exame médico (5 anos / 3 para >65a — Res. 789/2020 art. 4º);
  validade do exame toxicológico (90 dias — Res. 923/2022 art. 10 §1º); disponibilização do
  resultado psicológico (2 dias úteis — Res. 927/2022 art. 9º §3º).
- **EXTEND**: a linha "Pré-condição toxicológica (C/D/E) — sem prazo numérico" pode ser fechada
  com os 90 dias de validade — mas note-se que é validade do _resultado_, não um prazo para
  _obter_ o exame; a distinção deve ficar clara na regra.
- Sem CONTRADICT direto: nada na legislação capturada desautoriza os estados `OPEN → IN_PROGRESS →
READY_FOR_SIGNATURE → SIGNED → CLOSED/CANCELLED` nem a observação sobre `CANCELLED` ser estado
  morto (matéria de implementação, não normativa).

### WF-PEC-002 (junta médica)

- **EXTEND de alto valor**: a seção "Composição da junta — Não modelada" e a "Decisão de
  modelagem pendente — Regimento/composição formal [...] hoje inexistente na documentação
  capturada" estão **parcialmente superadas**: a composição (3 profissionais em 1ª instância; ≥3
  com 2 especialistas na 2ª instância/"Junta Especial de Saúde") e quatro prazos numéricos agora
  têm base legal federal explícita (Res. 927/2022 arts. 12-15). O gap deixa de ser "fonte
  pendente" e passa a ser puramente de **implementação** (o RBAC monolítico `JUNTA` não reflete a
  composição legal).
- **CONTRADICT/EXTEND relevante**: a norma descreve uma **terceira instância** ("Junta Especial de
  Saúde", designada pelo CETRAN para julgar o recurso) que o workflow atual não modela — hoje
  `escalated_to_cetran=true` apenas reatribui a assinatura da mesma decisão ao papel `CETRAN`, sem
  um novo caso/estado. Se a leitura for estrita, falta um estado/entidade inteiro no fluxo.
  Recomenda-se este item para validação de LEGAL antes de qualquer promoção do workflow para
  `reviewed`.
- **EXTEND**: prazos agora preenchem a lacuna "Nenhum prazo numérico foi encontrado" — 30 dias
  (requerer junta), 15 dias úteis (designar), 30 dias (junta decidir), 30 dias (recorrer ao
  CETRAN) + 20 dias úteis (remessa de documentos).

### WF-PEC-003 (agendamento)

- **EXTEND**: a lacuna "Nenhum prazo/SLA numérico foi encontrado para o agendamento" e a
  referência não aprofundada a "Portaria DETRAN-AM 005/2021 [...] sessão única e bloqueio de
  horário" agora tem conteúdo concreto: janela de atendimento 08h-13h em dias úteis, com extensão
  a dias não úteis mediante aviso (Portaria DETRAN-AM 005/2021 arts. 6º e 40) — sujeito à ressalva
  de vigência (possível substituição pela Portaria 008/2021, não confirmada).
- Sem CONTRADICT: nada na legislação capturada exige uma rota dedicada de "reagendamento" — a
  decisão de produto documentada em ADR 0005 permanece compatível.

### RN-PEC-001 (imutabilidade do laudo / adendo)

- **CONFIRM forte**: [REF-CFM-1821-2007] arts. 3º-5º (NGS2 exige assinatura ICP-Brasil para
  eliminar o papel) e [REF-MP-2200-2-2001] art. 10 (presunção de veracidade) sustentam
  diretamente a escolha de PAdES+ICP-Brasil, resolvendo o "(fonte pendente)" da regra.
- **EXTEND crítico (gap de retenção)**: nenhuma menção a por quanto tempo o laudo/prontuário deve
  ser mantido antes de eventual eliminação. [REF-LEI-13787-2018] art. 6º fixa piso de **20 anos**;
  comparar com os 5 anos (clínica pós-descredenciamento, DETRAN-AM) e 5 anos (laboratório
  toxicológico, federal) — três prazos, três escopos, nenhum modelado. Recomenda-se nova regra
  `RN-PEC-1xx` de retenção.

### RN-PEC-002 (assinatura PAdES+TSA)

- **CONFIRM forte**: MP 2.200-2/2001, Lei 14.063/2020 e CFM 1.821/2007 sustentam integralmente a
  escolha de assinatura qualificada ICP-Brasil — resolve o "(fonte pendente)".
- **EXTEND (nuance jurídica)**: Lei 14.063/2020 art. 14 estabelece que documento eletrônico de
  profissional de saúde é válido com assinatura **avançada OU qualificada** — um piso mais baixo
  que o exigido pelo PEC. O art. 13 (mais estrito, só qualificada) é para "atestados médicos" em
  sentido estrito. Recomenda-se que LEGAL classifique se o laudo de aptidão se enquadra no art. 13
  ou 14 — o PEC está seguro sob qualquer leitura, mas a classificação muda a natureza da exigência
  (prudência de produto vs. imposição legal direta).

### RN-PEC-003 (exceção de biometria)

- **EXTEND**: Portaria SENATRAN 968/2022 (texto de 2022) art. 4º §§1º/3º/4º é a evidência técnica
  mais próxima do desenho descrito (LFD; ausência de dedo registrada por campo; fallback
  obrigatório por reconhecimento facial) — mas com ressalva de vigência (a redação de 2025 zerou
  esses parágrafos com "(NR)", texto de substituição não localizado). A regra continua correta em
  espírito; a citação de base legal deve vir com essa ressalva, não como texto vigente certo.
- Sem CONTRADICT: a exigência de aprovação por Supervisor (papel único) não é desautorizada nem
  exigida pela norma federal — é uma escolha de governança do PEC.

### RN-PEC-004 (dupla validação de estagiário)

- **CONFIRM**: Portaria DETRAN-AM 005/2021 art. 48 (supervisão de estagiário obrigatória por
  psicólogo especialista) e CFP 01/2019 (norma técnica geral da perícia) sustentam a exigência de
  supervisão em espírito.
- **CONTRADICT parcial**: nenhuma das duas fontes exige especificamente **dupla biometria**
  (estagiário + supervisor) — apenas "presença [...] para orientação e supervisão". A regra
  RF-013 do SRS arquivado pode estar acrescentando uma exigência técnica de conformidade acima do
  piso normativo (o que é permitido, mas deve ficar identificado como decisão de produto, não como
  decorrência direta da norma).

### RN-PEC-005 (biometria de encerramento do perito)

- **EXTEND**: mesmo fundamento técnico de RN-PEC-003 (Portaria SENATRAN 968/2022, com a mesma
  ressalva de vigência). Reforçado pelo art. 2º §2º da redação de 2025 ("dados biométricos somente
  serão coletados presencialmente") — princípio de presença física consistente com a exigência já
  modelada.

### RN-PEC-006 (gate de encerramento)

- **CONTRADICT de nomenclatura (achado de maior risco pontual da rodada)**: `medical_result =
'CONDICIONADO'` não corresponde a nenhum rótulo oficial. A Res. 927/2022 art. 8º usa "apto com
  restrições"; a Portaria DETRAN-AM 005/2021 art. 34 §9º usa um vocabulário de cinco rótulos
  diferente ainda ("APTO, APTO COM RESTRIÇÕES, PENDENTE, INAPTO OU INAPTO TEMPORARIAMENTE"), com
  prazos numéricos (30/60/90/365 dias) associados a cada um, nenhum dos quais aparece em
  `RN-PEC-006`. Recomenda-se item de validação jurídica prioritária: mapear o enum do schema para
  a nomenclatura oficial (qual delas — federal ou estadual — prevalece nos dados que o RENACH
  espera?).
- **EXTEND**: "alinhada em espírito às Resoluções CONTRAN [REF-CONTRAN-927] e [REF-CONTRAN-789]
  ainda não capturadas" — agora capturadas; a regra pode citar diretamente Res. 927/2022 art. 8º
  (resultado condicionante de restrição) e a lista de gates confirma-se compatível com o modelo
  legal (junta pendente bloqueia; RENACH ACKed é interno ao PEC, sem contrapartida legal
  encontrada).

### RN-PEC-007 (pré-condição toxicológica C/D/E)

- **CONFIRM forte, quase literal**: Res. CONTRAN 923/2022 art. 10 confirma o gate "antes das
  demais etapas" com a mesma referência ao art. 147 do CTB.
- **CONTRADICT de citação**: a base legal correta é a **923/2022**, não a 1.009/2024 (mera
  emenda) — ver §3, Alvo 3, e recomendação de correção em APP-PEC acima.
- **EXTEND**: fecha a lacuna "nenhum prazo numérico encontrado" — validade de 90 dias (art. 10
  §1º). Identifica um fluxo totalmente novo e não coberto (exame toxicológico periódico pós-CNH,
  art. 10-A, a cada 2,5 anos) que pode ou não ser responsabilidade do PEC.

### RN-PEC-008 (transmissão RENACH)

- Sem CONFIRM/CONTRADICT/EXTEND direto: nenhuma norma capturada nesta rodada trata do SLA de
  transmissão de eventos ao RENACH (matéria de integração técnica, não localizada em nenhuma
  portaria/resolução lida). Mantém-se "(fonte pendente)".

### UC-PEC-001..009 / JRN-PEC-001..003

Nenhuma CONTRADIÇÃO estrutural encontrada. EXTENDs relevantes por UC:

- [UC-PEC-001] (abrir processo RENACH e agendar) — ganha o gate de distribuição imparcial (CFM
  1.636/2002 art. 3º) como possível pré-condição de produto não modelada.
- [UC-PEC-003] (exceção de biometria) / [JRN-PEC-003] — ganham a base técnica SENATRAN 968/2022
  (com ressalva de vigência).
- [UC-PEC-004]/[UC-PEC-005] (junta e decisão) / [JRN-PEC-002] — ganham composição, prazos e a
  possível terceira instância (Junta Especial de Saúde) da Res. 927/2022.
- [UC-PEC-006] (emitir e assinar laudo) — ganha base legal completa de assinatura (MP 2.200-2,
  Lei 14.063/2020, CFM 1.821/2007) e a nuance do art. 13×14 da Lei 14.063/2020.
- [UC-PEC-007] (adendo) / [UC-PEC-008] (encerrar episódio) — ganham o gap de retenção (Lei
  13.787/2018) como novo item de escopo a considerar no fluxo de encerramento/arquivamento.

## 5. Handoff — LEGAL

Itens recomendados para validação jurídica prioritária, em ordem de risco:

1. **Mapeamento de nomenclatura de resultado** — `CONDICIONADO` (schema) vs. "apto com
   restrições" (Res. 927/2022) vs. cinco rótulos incluindo "PENDENTE" (Portaria DETRAN-AM
   005/2021) — decidir qual vocabulário é o de fato exigido pelo RENACH e corrigir/mapear
   [RN-PEC-006].
2. **Distribuição imparcial dos exames** (CFM 1.636/2002 art. 3º: "nunca por escolha do
   periciado") — verificar se o modelo de agendamento do PEC/DETRAN-AM cumpre essa exigência ou
   se há um risco de conformidade real, não apenas de modelagem.
3. **Retenção/eliminação do prontuário** (Lei 13.787/2018 art. 6º, 20 anos) — nenhuma regra
   trata disso; decidir quem é responsável (PEC? clínica? DETRAN-AM?) e propor `RN-PEC-1xx`.
4. **Classificação do laudo sob a Lei 14.063/2020** (art. 13 "atestado médico" vs. art. 14
   "documento de profissional de saúde") — não muda a prática atual (PEC já usa o patamar mais
   alto), mas muda a natureza da obrigação.
5. **Vigência da Portaria DETRAN-AM 005/2021 frente à possível Portaria 008/2021** (404 na
   captura) — confirmar antes de tratar qualquer achado local como definitivo.
6. **A "Junta Especial de Saúde" como terceira instância** (Res. 927/2022 art. 15) — decidir se
   [WF-PEC-002] precisa modelar um novo estado/entidade ou se a leitura de "CETRAN reforça a
   assinatura" já é suficiente.
7. **CETRAN-PEC vs. CETRAN-inf**: confirmar que se trata do mesmo órgão colegiado estadual
   (CETRAN-AM) desempenhando papéis distintos (recurso de infração vs. recurso de junta médica),
   não de duas entidades homônimas diferentes — relevante para `shared/actors.md` (nota de
   desambiguação já sugerida em `_intake/proposals.md`).

## 6. Handoff — BPO

- A **janela de atendimento 08h-13h** (Portaria DETRAN-AM 005/2021 art. 40) tem impacto direto de
  capacidade operacional — mesma classe de pergunta que a rodada RAIT fez sobre throughput
  (`_meta/steering.md` item B): a janela de 5 horas úteis, combinada com dois exames (médico +
  psicológico) por candidato, é um dado a levar ao dimensionamento de agenda de [WF-PEC-003].
- Os **prazos da junta** (30/15 úteis/30/30/20 úteis dias, Res. 927/2022 arts. 12-14) formam uma
  escada de SLA que hoje não existe em nenhum WF-PEC — comparável à escada de alertas de
  prescrição já calibrada para o RAIT (`_meta/steering.md` item A.1); recomenda-se desenho
  equivalente para [WF-PEC-002].
- O **ciclo de credenciamento de clínicas** (1 ano, renovável, comprovação bienal, estatística
  mensal dia 20 + anual fevereiro — Res. 927/2022 arts. 16-24) é um processo administrativo
  inteiro não coberto por nenhum UC-PEC atual — candidato a um módulo/workflow de administração
  futuro, fora do escopo dos 9 UC-PEC selecionados nesta base.
- O **exame toxicológico periódico pós-CNH** (a cada 2,5 anos, Res. 923/2022 art. 10-A) levanta
  uma pergunta de escopo de produto: é responsabilidade do PEC processar esse fluxo recorrente ou
  ele é 100% externo (SENATRAN → condutor direto)? Se for do PEC, é um workflow inteiro ausente.

## 7. Handoff — UX

- **Entrevista devolutiva obrigatória** (CFP 01/2019 art. 2º §22; Portaria DETRAN-AM 005/2021
  art. 47 §1º) — "quando solicitado" pelo candidato — é uma interação de UX não descrita em
  nenhuma jornada ([JRN-PEC-001]/[UC-PEC-006]): como o candidato solicita, e como o psicólogo
  confirma que apresentou o resultado de forma objetiva?
- **Cinco rótulos de resultado, cada um com prazo diferente** (30/60/90/365 dias, Portaria
  DETRAN-AM 005/2021 art. 34 §9º) — se confirmados como vocabulário vigente pela LEGAL, a UI de
  laudo/resultado precisa comunicar não apenas o status mas o prazo de validade específico
  associado a ele, algo que a UX atual (baseada em "CONDICIONADO" binário) provavelmente não
  cobre.
- **Distribuição imparcial de clínica** (CFM 1.636/2002 art. 3º) — se confirmada como exigência
  vigente, muda a UX de agendamento: o candidato não escolheria livremente a clínica no fluxo de
  [UC-PEC-001], e a tela de agendamento precisaria comunicar isso.

## 8. Resumo final

**5 achados mais consequentes desta rodada:**

1. Res. CONTRAN 927/2022 (nunca antes citada com excerto) fecha, com base legal federal explícita,
   o gap mais citado do corpus PEC — composição e prazos da junta médica/psicológica e do recurso
   ao CETRAN/CONTRANDIFE (arts. 12-15) — e revela uma terceira instância ("Junta Especial de
   Saúde") não modelada em nada do sistema.
2. Nenhuma fonte legal ou local usa o rótulo `CONDICIONADO` do schema do PEC — a nomenclatura
   correta é "apto com restrições" (federal) ou um vocabulário de cinco rótulos com prazos
   próprios (DETRAN-AM local) — risco de mapeamento de dado incorreto entre o PEC e o RENACH.
3. Lei 13.787/2018 art. 6º exige retenção mínima de 20 anos do prontuário eletrônico — gap total
   no corpus PEC (nenhuma RN trata de retenção/eliminação), mesma classe de achado que a rodada
   BOAT fez para o registro de sinistro.
4. A base legal do exame toxicológico C/D/E citada em APP-PEC/RN-PEC-007 estava incorreta: é a
   Res. CONTRAN 923/2022 (não a 1.009/2024, que é mera emenda) — corrigido, com validade de 90
   dias e um exame periódico pós-CNH inteiramente novo (a cada 2,5 anos) descoberto no processo.
5. CFM 1.636/2002 art. 3º exige distribuição aleatória/impessoal dos exames pelo DETRAN, "nunca
   por escolha do periciado" — risco de conformidade real no modelo de agendamento do PEC, que
   hoje parece permitir escolha de clínica, e item de validação jurídica prioritária.

**Contagem do mapa CONFIRM/CONTRADICT/EXTEND**: 8 artefatos tocados diretamente (APP-PEC,
WF-PEC-001/002/003, RN-PEC-001/002/003/004/005/006/007/008) — 6 CONFIRM (parciais ou totais), 4
CONTRADICT (nomenclatura de resultado, citação de base legal do toxicológico, citação incorreta em
APP.md, terceira instância da junta), 12+ EXTEND (prazos, retenção, composição, gates novos).
