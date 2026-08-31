---
id: REF-DETRANAM-TALAO-BODYCAM
title: DETRAN-AM — talão eletrônico (PRODAM), câmeras corporais (Portaria Normativa 003/2026) e convênio com a Polícia Militar (BPTRAN)
orgao: DETRAN-AM
status: 'vigente (Portaria Normativa 003/2026 assinada 16/01/2026, publicada julho/2026); talão eletrônico operacional desde ~2017 (fonte: notícia institucional)'
url: 'Talão: https://www.detran.am.gov.br/detran-am-adota-talao-eletronico-de-multas-para-agilizar-e-da-transparencia-ao-processo-de-autuacao-de-condutores/ ; Bodycam: https://www.detran.am.gov.br/wp-content/uploads/2026/07/PORTARIA-NORMATIVA-No-003.pdf'
pdf: REF-DETRANAM-PORTARIA-003-2026-BODYCAM.pdf (txt correspondente); talão eletrônico = fonte não-original (notícia institucional), ver nota abaixo
apps: [teat, boat]
sources: [REF-SENATRAN-997, REF-CONTRAN-985-1003-MBFT, REF-LEI-13709-2018]
updated: 2026-08-24
---

# O que este arquivo é

Achados **locais** (DETRAN-AM) desta rodada de pesquisa, alvo prioridade 6 do briefing. Dois
instrumentos de natureza distinta:

1. **Talão eletrônico do DETRAN-AM** — descrição operacional do sistema **já em uso** (não é uma
   norma, é uma notícia institucional; capturada como `-extracted.md`-equivalente, sinalizada como
   **fonte não-original**), que descreve exatamente o objeto do TEAT em produção real na mesma
   organização.
2. **Portaria Normativa nº 003/2026-DP/DETRAN/AM** — norma vigente, original, baixada em PDF, que
   regulamenta o uso de câmeras corporais pelos agentes de trânsito do DETRAN-AM.

Também documentado: confirmação do convênio DETRAN-AM/Polícia Militar (BPTRAN) para fiscalização
de trânsito, relevante à composição do papel `field-agent` de [APP-TEAT].

---

## 1. Talão eletrônico do DETRAN-AM (fonte não-original — notícia institucional)

Fonte: notícia publicada em `detran.am.gov.br` (também replicada em `amazonas.am.gov.br`,
datação original ~janeiro/2017), **não é ato normativo** — não foi localizada portaria específica
de homologação/regulamentação do talão eletrônico do DETRAN-AM nesta rodada (ver "Gaps" abaixo).
Conteúdo relevante, parafraseado (fonte secundária, não citação verbatim de norma):

- O sistema foi **desenvolvido pela PRODAM** (Empresa de Processamento de Dados do Amazonas
  S.A.), empresa pública de TI do Estado do Amazonas — não por fornecedor privado de mercado.
  **Efeito no TEAT**: se aplicável ao produto atual, isso reforça a hipótese, discutida em
  [REF-SENATRAN-997], de que o parágrafo único do item VI do Anexo daquela Portaria (dispensa de
  documentação societária para "software desenvolvido pelo próprio órgão de trânsito") pode ser
  aplicável — mas não dispensa código-fonte/scripts de banco para fins de homologação SENATRAN.
- **Acesso restrito**: apenas agentes do DETRAN-AM e do **Batalhão de Trânsito (BPTRAN)** têm
  autorização para operar o aplicativo, mediante login e senha.
- **GPS/geolocalização** em tempo real do agente no momento da autuação.
- **Sincronização e imutabilidade**: concluídas as etapas do preenchimento, o agente sincroniza o
  Auto com a base do DETRAN-AM, e **deixa de ser possível reabri-lo para alterações**.
- **Cancelamento**: se necessário cancelar o Auto, **o agente deve submeter a decisão à Diretoria
  de Fiscalização do órgão**.
- Aplicativo em plataforma Android; autenticação, consulta e dados de autuação **criptografados**
  e transmitidos em protocolo seguro.

**Efeito no TEAT — achado de maior relevância operacional desta rodada para o gap de
cancelamento.** [WF-TEAT-001] registra como "(fonte pendente) condições e ator autorizado para
`CANCELADO`" a transição a partir de `FINALIZADO_LOCAL`. A prática real do DETRAN-AM — a mesma
organização para a qual o TEAT está sendo especificado — resolve esse caso: **cancelamento de AIT
já sincronizado/finalizado não é ato unilateral do agente; é submetido como decisão à Diretoria
de Fiscalização do órgão**. Isso é consistente com, e complementa, o achado federal de
[REF-SENATRAN-997] Anexo II, item k) (que só cobre cancelamento de **rascunho em preenchimento**,
com aprovação da "Autoridade de Trânsito" no próprio software). A leitura combinada proposta:

- Cancelamento de **rascunho não finalizado**: solicitação do agente no próprio app, aprovação da
  autoridade de trânsito, com justificativa (norma federal, [REF-SENATRAN-997]).
- Cancelamento de **AIT já finalizado/sincronizado**: submissão formal à Diretoria de
  Fiscalização (prática local DETRAN-AM) — mapeável, no desenho atual do TEAT, para
  `traffic-authority` como ator de aprovação, análogo ao fluxo de `AitCorrection`/rejeição já
  existente em [RN-TEAT-006], mas como **novo tipo de decisão** (cancelamento pós-finalização),
  não uma correção.

**Nota de fonte.** Este achado vem de notícia institucional, não de portaria numerada — **grau de
confiança moderado**; recomenda-se busca dirigida por portaria/regimento interno específico do
DETRAN-AM sobre o talão eletrônico (não localizada nesta rodada, ver "Gaps" abaixo) antes de
tratar como base normativa definitiva.

## 2. Portaria Normativa nº 003/2026-DP/DETRAN/AM — câmeras corporais

Norma **vigente e original** (assinada 16/01/2026 pelo Diretor-Presidente, publicada em
09/07/2026 no sistema e-Doc do Amazonas), regulamentando o uso obrigatório de câmeras corporais
por agentes de trânsito do DETRAN-AM. Verbatim dos trechos com maior efeito sobre TEAT:

> Art. 4º Os agentes de trânsito em serviço deverão utilizar as câmeras corporais,
> obrigatoriamente, nas seguintes situações: I - Atendimento a sinistros de trânsito; II -
> Abordagens veiculares de qualquer natureza; III - Operações de trânsito ordinárias,
> extraordinárias ou planejadas; IV - Atividades de fiscalização e vistoria técnica; […] VIII -
> Toda interação entre agente de trânsito e condutor ou usuário da via; […]
>
> Art. 5º As câmeras corporais deverão permanecer ativadas durante todo o período de serviço
> operacional, entendendo-se este como o tempo em que o agente estiver uniformizado, escalado ou
> disponível para atuação fiscalizatória.
>
> Art. 8º É vedado ao agente de trânsito: I – Desligar a câmera corporal durante o serviço, salvo
> [uso de banheiro]; II – Alterar configurações, metadados, hora, data, geolocalização ou modos de
> gravação; III – Interromper, ocultar, pausar ou obstruir a captação de imagens; IV – Manipular,
> editar, copiar, excluir ou transferir arquivos; […]
>
> Art. 9º O agente deverá comunicar imediatamente, ao início ou durante o serviço, qualquer: I –
> Mal funcionamento do equipamento; II – Falha na gravação; III – Falha de bateria, memória ou
> transmissão; IV – Impossibilidade técnica de uso. § 1º A comunicação será registrada no sistema
> próprio ou relatório diário. […]
>
> Art. 15. Aplica-se, quando tecnicamente viável, às câmeras veiculares utilizadas na fiscalização
> de trânsito deste Departamento.

**Efeito no TEAT — extensão material do modelo de evidências, não coberta por [RN-TEAT-002].**
Isto é achado **novo e específico do DETRAN-AM**, sem paralelo em norma federal capturada nesta
rodada: bodycam é **obrigatória em toda interação agente↔condutor** (art. 4º, VIII), o que abrange
a própria lavratura do AIT, medidas administrativas e o procedimento de etilômetro — ou seja,
**todo ato legal do TEAT deveria, na operação real do DETRAN-AM, ter uma gravação de bodycam
correlata**, hoje inexistente como conceito em [APP-TEAT]/[RN-TEAT-002] (que trata apenas de
evidência anexada pelo agente, não de gravação contínua e automática). Pontos de maior impacto de
produto:

- **Vedação de edição/exclusão** (art. 8º, IV) é o mesmo princípio de "cadeia de custódia
  íntegra e apensa" de [RN-TEAT-002] — mas aplicado a um fluxo de captura **contínuo e paralelo**
  ao AIT, não a um anexo pontual.
- **Falha de gravação deve ser comunicada e registrada** (art. 9º) — paralelo direto ao já
  existente "falha de transmissão de evidência não apaga o ato legal associado, mas mantém
  pendência explícita" de [RN-TEAT-002], mas para uma fonte de evidência que hoje não está
  modelada.
- Art. 15 estende (facultativamente) o mesmo regime às **câmeras veiculares**, ampliando ainda
  mais a superfície de evidência associada a uma operação de fiscalização.

**Recomendação de artefato**: este achado sustentou, na revisão LEGAL de 2026-08-24, duas regras —
[RN-TEAT-141] (gravação obrigatória, integridade, comunicação de falha) e [RN-TEAT-142] (acesso,
divulgação e retenção) — cujo **escopo no MVP** permanece decisão de produto/BPO.

### 2.1 Acionamento, acesso, divulgação e sanção _(acrescentado na revisão LEGAL de 2026-08-24)_

A captura original transcreveu os arts. 4º, 5º, 8º, 9º e 15. Faltavam os dispositivos que definem
**quem pode ver a gravação e sob que condições** — matéria de maior sensibilidade jurídica do
instrumento. Verbatim:

> Art. 7º A gravação das câmeras corporais ocorrerá nas seguintes modalidades: I. Acionamento
> automático, quando: a) A gravação inicia-se desde a retirada até a devolução do equipamento;
> b) A gravação é ativada por ação, evento, sinal específico ou geolocalização; II – Acionamento
> remoto, iniciado por autoridade competente; III – Acionamento manual, realizado pelo agente
> somente nos casos autorizados nesta portaria. § 1º todas as situações operacionais deverão ser
> gravadas, independentemente do modo de acionamento. § 2º qualquer vedação ou restrição deverá ser
> fundamentada pelo coordenador geral de fiscalização.
>
> Art. 6º A câmera corporal somente poderá ser removida durante o uso de banheiro, devendo ser
> imediatamente recolocada e reativada após deixar o local. Parágrafo único. O uso sem câmera,
> quando tecnicamente possível, caracteriza falha funcional.
>
> Art. 12. O acesso observará a Lei nº 12.527/2011 (Lei de Acesso à Informação).
>
> Art. 13. O acesso ocorrerá mediante requisição de Magistrados, membros do Ministério Público, da
> Defensoria Pública, ou autoridades policiais/administrativas responsáveis por investigações
> formais. § 1º O uso dos registros deverá observar a finalidade da requisição, sob pena de
> responsabilização civil, penal e administrativa. § 2º O acesso será realizado por meio de entrega
> de mídia específica.
>
> Art. 14. A divulgação ou compartilhamento de registros não poderá comprometer: I – O direito de
> imagem dos envolvidos, especialmente em situações constrangedoras ou que exponham sua integridade
> física; II – A proteção de crianças e adolescentes.
>
> Art. 16. Os casos omissos serão disciplinados por Portaria complementar.
>
> Art. 17. O descumprimento das disposições ora estabelecidas nesta Portaria, poderá ensejar a
> instauração de PAD - Procedimento Administrativo Disciplinar.

Definições relevantes do art. 3º: _"IV. Gravação de pré-evento: recurso que registra período
anterior ao acionamento efetivo"_; _"IX. Registro audiovisual: informação audiovisual utilizável
como prova"_. Entre os objetivos do art. 2º: _"V. Qualificar a produção de provas materiais,
assegurando a cadeia de custódia"_ e _"VIII. Assegurar a disponibilidade, integridade,
confidencialidade e autenticidade das informações coletadas"_.

**Anotação LEGAL — três lacunas materiais do instrumento.**

1. **Não há prazo de retenção nem política de expurgo.** A Portaria não fixa por quanto tempo os
   registros são guardados, nem quando são eliminados. É omissão relevante em ambas as direções:
   descarte precoce destrói prova de defesa e de acusação; guarda indefinida contradiz a limitação
   temporal do tratamento de dados pessoais.
2. **O cidadão gravado e o autuado não constam do rol de acesso do art. 13.** O rol é fechado em
   Magistrados, MP, Defensoria e autoridades policiais/administrativas em investigação formal. O
   **interessado no processo administrativo de trânsito** — que pode precisar da gravação para
   instruir defesa ou recurso ([WF-INF-001]) — não é legitimado. O art. 12 remete à LAI, mas vídeo
   com terceiros identificáveis é justamente hipótese de acesso restrito nela. Tensão real com o
   contraditório e a ampla defesa, não resolvida no texto.
3. **A LGPD (Lei 13.709/2018) não é mencionada.** A Portaria invoca apenas a LAI, cita "respeito à
   privacidade" entre seus valores (art. 1º, III) e o direito de imagem (art. 14), mas **não
   estabelece base legal de tratamento, papel de controlador, prazo de retenção nem canal de
   exercício de direitos do titular** — para um tratamento **contínuo, sistemático e em larga
   escala** de imagem e voz de terceiros em via pública, com **gravação de pré-evento** e
   acionamento por geolocalização. É a lacuna mais relevante do instrumento, e cabe expressamente
   nos "casos omissos" do art. 16, cuja Portaria complementar **não foi localizada**.
4. **A Portaria não altera o regime de validade do AIT.** Ausência de gravação é **falha
   funcional** (art. 6º, parágrafo único) e enseja **PAD** (art. 17) — sanção disciplinar do
   agente. **Nenhum dispositivo declara inválido o auto lavrado sem bodycam.** Tratar a gravação
   como condição de validade seria criar requisito inexistente.

Ver [RN-TEAT-141], [RN-TEAT-142] e `inf/teat/_intake/legal-assessment.md`, itens 41 a 43.

## 3. Convênio DETRAN-AM / Polícia Militar (BPTRAN)

Confirmado por múltiplas fontes secundárias (notícias institucionais DETRAN-AM e PM-AM, não
normas): o DETRAN-AM mantém convênio com a Polícia Militar do Amazonas, operacionalizado pelo
**Batalhão de Trânsito (BPTRAN)**, para "ação conjunta… conjunção de recursos técnicos, humanos e
financeiros para execução de fiscalização e autuação das infrações de trânsito de competência do
Estado do Amazonas". A notícia sobre o talão eletrônico (seção 1 acima) já confirma
operacionalmente que **agentes do BPTRAN têm acesso autorizado ao mesmo aplicativo** usado pelos
agentes do DETRAN-AM.

**Efeito no TEAT — CONFIRMA e concretiza a Seção 4 do MBFT** ([REF-CONTRAN-985-1003-MBFT], "III -
policiais militares do serviço ativo, quando firmado convênio"). No caso concreto do DETRAN-AM,
`field-agent` em [APP-TEAT] não é um papel de RBAC hospedado por um único vínculo empregatício —
é ocupado tanto por servidores do próprio DETRAN-AM quanto por policiais militares do BPTRAN
operando o mesmo aplicativo sob o mesmo papel funcional. Isso é relevante para a modelagem de
identidade/autenticação (STYNX, fora do escopo de domínio do TEAT) e para a governança de
homologação de dispositivo — se os PMs usam equipamento próprio da corporação, a homologação
(SENATRAN + [RN-TEAT-003]) precisa cobrir também esse parque de dispositivos.

---

# Gaps (não localizados nesta rodada)

- **Portaria/regimento específico do DETRAN-AM sobre o talão eletrônico** (regulamentação local,
  homologação perante a SENATRAN, requisitos específicos) — não localizada. O achado da seção 1
  vem de notícia institucional, não de ato normativo numerado.
- **Instrumento formal do convênio DETRAN-AM/BPTRAN** (número, data, vigência, cláusulas) — não
  localizado nesta rodada; apenas confirmação por notícias institucionais.
- **Portaria Normativa nº 005/2026-DETRAN/AM/DA/DP** (escala especial de trabalho dos agentes de
  trânsito) e **nº 006/2026-DETRAN/AM/DA/DP** (procedimentos de protocolo do agente) — **identificadas
  na listagem oficial de portarias normativas do DETRAN-AM, mas não baixadas nesta rodada** (URL
  de PDF não localizada por padrão previsível; requer nova busca dirigida). Potencialmente
  relevantes ao conceito de "turno/operação/equipe/viatura" em [APP-TEAT].

---

# Achados de conferência

Portaria Normativa 003/2026 extraída via `pdftotext -layout` do PDF oficial assinado
digitalmente (verificável em `edoc.amazonas.am.gov.br`); conteúdo íntegro, sem inconsistências
internas. Achados da seção 1 e 3 são de fonte secundária (notícias institucionais) — marcados
como tal, não citados como texto normativo verbatim.

# Índice reverso — achado → artefato TEAT (e BOAT)

| Achado                                                                                                    | Artefato                                                                    | Efeito                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Art. 4º, I — "Atendimento a sinistros de trânsito" é a primeira hipótese de gravação obrigatória**      | **[RN-BOAT-129]**, [RN-TEAT-141]                                            | _(acrescentado na revisão LEGAL da rodada BOAT, 2026-08-24)_ alcança o domínio do sinistro: **todo atendimento de sinistro em campo tem gravação correlata por norma**                       |
| **Art. 14, I — proteção reforçada em "situações constrangedoras ou que exponham sua integridade física"** | **[RN-BOAT-129]**, [RN-TEAT-142]                                            | descreve precisamente a cena de sinistro; a imagem de vítima ferida/socorrida **revela dado de saúde** ([REF-LEI-13709-2018] art. 11, § 1º), agravando as três lacunas materiais já anotadas |
| Cancelamento de AIT finalizado → Diretoria de Fiscalização                                                | [WF-TEAT-001] `CANCELADO` (gap), [RN-TEAT-121]                              | **prática**, não norma — confiança moderada (fonte secundária); a via legal disponível é o art. 281 §1º, I do CTB                                                                            |
| Bodycam obrigatória em toda interação agente↔condutor (arts. 4º-9º)                                       | [RN-TEAT-141], [RN-TEAT-002]                                                | EXTENDE — fonte de evidência contínua, não modelada                                                                                                                                          |
| Acesso restrito por requisição; sem prazo de retenção; LGPD ausente (arts. 12-14, 16)                     | [RN-TEAT-142]                                                               | EXTENDE — regime de acesso e **três lacunas materiais**                                                                                                                                      |
| Falha de gravação → PAD, **não** invalidade do AIT (arts. 6º p.ú., 17)                                    | [RN-TEAT-141]                                                               | delimita: bodycam **não** é condição de validade do auto                                                                                                                                     |
| BPTRAN opera o mesmo aplicativo que agentes DETRAN-AM                                                     | [APP-TEAT] papel `field-agent`; [RN-TEAT-104], [RN-TEAT-143], [RN-TEAT-003] | CONFIRMA/EXTENDE — múltiplas origens organizacionais sob um só papel funcional; **instrumento de convênio não localizado**                                                                   |
