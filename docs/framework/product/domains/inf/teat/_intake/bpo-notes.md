# _intake/bpo-notes.md — notas da rodada BPO (2026-08-24)

Rodada de CONFIRMAÇÃO/EXTENSÃO do TEAT a partir do dossiê de pesquisa
(`_intake/research-dossier.md`). Revisou WF-TEAT-001..003 in loco, criou WF-TEAT-004/005 e
UC-TEAT-007..012, enriqueceu APP.md. Este arquivo reúne o que não coube nos artefatos por exigir
edição de arquivo compartilhado (`shared/**`) ou decisão de escopo do Owner — mesma disciplina de
fronteira usada por `_intake/proposals.md` (rodada de mineração) e pelo BPO do RAIT.

---

## §1 — Propostas para arquivos compartilhados (não editados por regra de fronteira)

### `shared/glossary.md` — termos a incluir

| Termo                                   | Definição curta                                                                                                                                                                                                                                                                                                                     | Fonte                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Guarda monitorada                       | custódia do veículo removido sob responsabilidade do próprio proprietário, com dispositivo de monitoramento eletrônico homologado, como alternativa à remoção física a depósito                                                                                                                                                     | [REF-CONTRAN-1025-2026] art. 17                                                           |
| Termo de Recolhimento do Veículo        | documento emitido ao aplicar a medida administrativa de remoção, com conteúdo mínimo normatizado (identificação do órgão, veículo, AIT/ato que determinou a remoção, local/data/hora, fundamento legal, local de guarda, proprietário/condutor)                                                                                     | [REF-CONTRAN-1025-2026] art. 14                                                           |
| Sivec                                   | Sistema Integrado de Veículos Custodiados — plataforma nacional de integração e governança de remoção/guarda/liberação/leilão                                                                                                                                                                                                       | [REF-CONTRAN-1025-2026] art. 1º §§1º-2º                                                   |
| Câmera corporal (bodycam)               | equipamento de gravação contínua obrigatório em toda interação agente↔condutor no DETRAN-AM, sob regime de integridade análogo à cadeia de custódia de evidência                                                                                                                                                                    | [REF-DETRANAM-TALAO-BODYCAM] (Portaria Normativa DETRAN-AM 003/2026)                      |
| Sessão exclusiva por dispositivo        | vedação normativa a que o mesmo agente esteja logado simultaneamente em mais de um equipamento; registros concorrentes não são processados e são apurados pela autoridade                                                                                                                                                           | [REF-SENATRAN-997] Anexo II, h)                                                           |
| Medida administrativa (catálogo)        | providência complementar à penalidade, de aplicação momentânea, listada em rol fechado no CTB art. 269 (retenção, remoção, recolhimento de documentos, transbordo, teste de alcoolemia, recolhimento de animais, exames de aptidão) — não se confunde com penalidade                                                                | CTB art. 269; [REF-CONTRAN-985-1003-MBFT] Seção 8                                         |
| Constatação sem abordagem — Casos 1/2/3 | classificação por enquadramento do MBFT: Caso 1 "possível sem abordagem" (sem justificativa exigida), Caso 2 "mediante abordagem" (só com abordagem), Caso 3 "vide procedimentos" (depende da situação, justificativa condicional) — substitui a definição anterior de "campo de texto livre" já registrada em `shared/glossary.md` | [REF-CONTRAN-985-1003-MBFT] Seção 7 — **atualiza entrada existente**, não apenas adiciona |
| Etilômetro — valor considerado          | resultado da medição realizada pelo aparelho, após desconto da margem de tolerância regulamentada (erro máximo admissível) — distinto do valor bruto medido; é o valor que se compara aos limiares de infração (0,05 mg/L) e crime (0,34 mg/L)                                                                                      | [REF-CONTRAN-432] art. 4º § único, art. 6º                                                |
| Diretoria de Fiscalização               | unidade organizacional do DETRAN-AM competente pela decisão de cancelamento de AIT já finalizado/sincronizado — achado de prática local, sem paralelo em norma federal                                                                                                                                                              | [REF-DETRANAM-TALAO-BODYCAM] §1                                                           |

**Atualização de entrada existente**: `Homologação (dispositivo/aplicativo)` em `shared/glossary.md`
diz hoje "base legal pendente" — **não está mais pendente**: [REF-SENATRAN-997] art. 5º regula a
homologação do software perante a SENATRAN (distinta da homologação interna de
dispositivo/versão). Sugere-se atualizar a entrada para citar a fonte e mencionar os dois níveis.

### `shared/actors.md` — a reconciliar

- **Diretoria de Fiscalização** (novo, ver acima) não tem linha na tabela "Campo e operação
  (inf/est)" — sugerida como órgão superior de decisão sobre cancelamento pós-finalização,
  distinto de `Autoridade de trânsito` (que hoje aparece só como ator do rait). Mapeamento
  provisório no runtime TEAT: `traffic-authority` em nível hierárquico superior — decisão de
  escopo do Owner se merece RBAC próprio.
- **BPTRAN / Polícia Militar conveniada** — a linha "Agente de trânsito" da tabela "Campo e
  operação" deveria anotar explicitamente que, no caso concreto do DETRAN-AM, esse ator é ocupado
  tanto por servidores do órgão quanto por policiais militares do BPTRAN sob convênio (mesma
  observação já registrada em [APP-TEAT] §Atores desta revisão) — relevante porque outros apps
  (rait, boat) também herdam "Agente de trânsito" da mesma linha compartilhada.
- Item já registrado na rodada de mineração (`_intake/proposals.md`) permanece em aberto: decisão
  se `shared/actors.md` deve espelhar os 9 papéis granulares de RBAC do TEAT ou manter a visão
  agregada — não avançado nesta rodada, fora do escopo desta sessão.

### `shared/workflows/WF-INF-001.md` — pontos de encaixe propostos (não editado)

| WF-TEAT (esta revisão)                                           | Proposta de encaixe em WF-INF-001                                                                                                   |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [WF-TEAT-001] `CANCELADO_POSFINAL` (AIT já `AIT_LAVRADO`/além)   | novo estado terminal `CANCELADO_POS_INTEGRACAO`, distinto do atual `AIT_CANCELADO` (que hoje só cobre acolhimento de defesa prévia) |
| [WF-TEAT-004] `VIOLACAO_MONITORAMENTO` → novo AIT (CTB art. 239) | entra como um `[*] --> AIT_LAVRADO` comum — não precisa de estado especial, é AIT como outro qualquer                               |
| [WF-TEAT-005] `AIT_165A_LAVRADO`/`AIT_165_LAVRADO`               | idem — entram como `[*] --> AIT_LAVRADO` comum, sem necessidade de ramificação em WF-INF-001                                        |

Nenhuma dessas mudanças foi escrita diretamente em `shared/workflows/WF-INF-001.md` — fora do
escopo de escrita direta desta sessão (mesma disciplina que o BPO do RAIT seguiu para o mesmo
arquivo).

---

## §2 — Decisões de escopo do Owner

1. **Guarda monitorada no MVP?** Modalidade totalmente nova ([REF-CONTRAN-1025-2026] art. 17),
   dependente de "soluções tecnológicas previamente homologadas pelo órgão máximo executivo de
   trânsito da União" (art. 17 §4º) — dependência externa não controlada pelo TEAT. Recomenda-se
   tratar como **onda futura**, não MVP, salvo confirmação de que a solução de monitoramento já
   está disponível/homologada para o DETRAN-AM.
2. **Bodycam como evidência formal de runtime no MVP?** Achado de prática local (Portaria
   Normativa DETRAN-AM 003/2026), sem paralelo federal, com impacto potencial amplo no modelo de
   evidências (fluxo contínuo vs. anexo pontual — ver [UC-TEAT-010]). Recomenda-se decisão
   explícita do Owner antes de comprometer roadmap; ao menos o **evento de falha de gravação**
   (art. 9º da Portaria) deveria entrar cedo, por ser de baixo custo de modelagem e alto valor de
   compliance.
3. **Comportamento de UX do gate de sessão exclusiva** ([UC-TEAT-012]): a norma não define se o
   bootstrap deve **bloquear** a nova autenticação ou **forçar o encerramento** da sessão anterior
   — ambos atendem "não logado simultaneamente em mais de um equipamento", com trade-offs de UX
   operacional distintos (bloqueio pode deixar agente sem acesso em campo se o dispositivo antigo
   estiver inacessível/perdido). Decisão de produto do Owner.
4. **Validação bloqueante de certificado metrológico do etilômetro** ([WF-TEAT-005] §Guard): a
   norma exige aparelho aprovado/verificado, mas não descreve o comportamento do software de
   fiscalização diante de um aparelho vencido. Proposta do BPO: bloquear ou, no mínimo, alertar de
   forma bloqueante — decisão do Owner antes de implementar.
5. **Cancelamento pós-finalização** ([UC-TEAT-011]): fluxo inteiro construído sobre fonte
   secundária (notícia institucional, não portaria numerada) — confiança moderada. Recomenda-se
   ao Owner solicitar, por canal direto com o DETRAN-AM, a portaria/regimento interno que
   formalize a competência da Diretoria de Fiscalização antes de tratar este fluxo como definitivo
   de produto (mesma recomendação já no handoff LEGAL do dossiê de pesquisa).
6. **Res. CONTRAN 1.025/2026** — publicada há ~2 meses da pesquisa original, sem fonte secundária
   de conferência disponível. WF-TEAT-004 inteiro depende dela para o desenho de remoção/guarda
   monitorada — recomenda-se validação jurídica humana antes de tratar como base normativa
   definitiva de produto (herdado do handoff LEGAL do dossiê).

## §3 — Roadmap / compliance (não são itens de negócio de campo, registrados aqui como ponte)

- **Ciclo de homologação SENATRAN do software** ([WF-TEAT-003] §Ciclo de homologação, nova seção
  desta revisão): qualquer alteração de funcionalidade do app pode exigir nova homologação, com
  até 60 dias de espera regulatória, e a homologação exige código-fonte e scripts de banco de
  dados entregáveis à SENATRAN (mesmo se o software for desenvolvido pelo próprio órgão —
  dispensa de documentação societária, não de código-fonte). Recomenda-se um checklist de release
  management que classifique cada mudança como "altera funcionalidade" ou não, com gate de revisão
  antes de deploys que se enquadrem no primeiro caso.
- **Sivec** ([REF-CONTRAN-1025-2026] art. 1º §§1º-2º) — candidata a nova integração nacional
  auditada, análoga em natureza a RENAVAM/RENACH/RENAINF já listadas; ainda não modelada como
  adaptador de integração no TEAT.
- **Marco 01/01/2027** ([REF-CONTRAN-1025-2026] art. 15 §3º): notificações de remoção passam a
  ser exclusivamente via SNE — prazo regulatório duro, relevante ao roadmap conjunto TEAT/RAIT/
  PORTAL, hoje não registrado em nenhum artefato lido antes desta rodada.

## §4 — Numeração proposta de RN-TEAT-1xx (para confirmação do LEGAL)

> **RESOLVIDO (2026-08-26).** A substituição mecânica prevista abaixo ("grep por `RN-TEAT-10`")
> **nunca foi executada** quando o LEGAL entregou RN-TEAT-101..143: os números propostos aqui
> foram todos ocupados por regras de conteúdo diferente, e os UCs/WFs ficaram apontando para a
> regra errada. Corrigido na rodada de auditoria cruzada de 2026-08-26 com o mapa abaixo. A
> tabela de propostas que segue é **registro histórico — não usar para navegação**.
>
> | id proposto (obsoleto)                                  | regra real no catálogo LEGAL                         |
> | ------------------------------------------------------- | ---------------------------------------------------- |
> | RN-TEAT-101 sessão exclusiva por dispositivo            | **[RN-TEAT-111]**                                    |
> | RN-TEAT-102 bodycam obrigatória                         | **[RN-TEAT-141]** (+ [RN-TEAT-142] acesso/retenção)  |
> | RN-TEAT-103 cancelamento pós-finalização                | **[RN-TEAT-121]** (+ [RN-TEAT-120] em preenchimento) |
> | RN-TEAT-104 catálogo de medidas / Termo de Recolhimento | **[RN-TEAT-122]** + **[RN-TEAT-126]**                |
> | RN-TEAT-105 guarda monitorada                           | **[RN-TEAT-127]**                                    |
> | RN-TEAT-106 recusa de alcoolemia → art. 165-A           | **[RN-TEAT-134]**                                    |
> | RN-TEAT-107 constatação Caso 1/2/3                      | **[RN-TEAT-108]**                                    |
> | RN-TEAT-108 uma infração por AIT                        | **[RN-TEAT-103]**                                    |
> | RN-TEAT-109 vedação de autopreenchimento de placa       | **[RN-TEAT-115]**                                    |
> | RN-TEAT-110 finalização nunca automática                | **[RN-TEAT-114]**                                    |
>
> Lição de processo: quando uma rodada BPO cita regras legais por número **proposto**, a rodada
> que fecha o catálogo tem de executar a substituição — ou o forward-reference vira referência
> silenciosamente errada. Ver `_meta/backlog.md` §Auditoria cruzada.

O especialista LEGAL escreve RN-TEAT-1xx em paralelo a esta sessão (forward-reference sancionado
pelo brief). Todos os UCs/WFs desta rodada citam as RNs abaixo **por número proposto**, seguindo o
mesmo padrão de bloco 1xx usado pelo RAIT (RN-RAIT-101..132) para distinguir regras
ancoradas em achados desta rodada das RN-TEAT-001..006 pré-existentes. **Números não são
definitivos** — o LEGAL pode renumerar; os UCs/WFs foram escritos para que a substituição seja
mecânica (grep por `RN-TEAT-10`).

| id proposto | Regra                                                                                                                                                            | Fonte                                             | Onde é citada                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- |
| RN-TEAT-101 | Sessão de agente exclusiva por dispositivo; concorrência bloqueia processamento e aciona apuração                                                                | [REF-SENATRAN-997] Anexo II, h)                   | [UC-TEAT-012], [WF-TEAT-001]                                                       |
| RN-TEAT-102 | Bodycam como fonte de evidência obrigatória em toda interação agente↔condutor, mesmo regime de custódia de [RN-TEAT-002]                                         | [REF-DETRANAM-TALAO-BODYCAM]                      | [UC-TEAT-010], [WF-TEAT-001]                                                       |
| RN-TEAT-103 | Cancelamento pós-finalização via Diretoria de Fiscalização — prática-pendente-de-norma                                                                           | [REF-DETRANAM-TALAO-BODYCAM] §1                   | [UC-TEAT-011], [WF-TEAT-001]                                                       |
| RN-TEAT-104 | Catálogo fechado de tipos de medida administrativa (CTB art. 269); conteúdo mínimo do Termo de Recolhimento do Veículo; fluxo físico vs. digital para documentos | CTB art. 269 §5º; [REF-CONTRAN-1025-2026] art. 14 | [UC-TEAT-008], [UC-TEAT-009], [WF-TEAT-004]                                        |
| RN-TEAT-105 | Elegibilidade (9 requisitos) e violação de guarda monitorada — gera AIT autônomo (CTB art. 239)                                                                  | [REF-CONTRAN-1025-2026] art. 17                   | [UC-TEAT-009], [WF-TEAT-004]                                                       |
| RN-TEAT-106 | Recusa a qualquer procedimento de alcoolemia gera automaticamente art. 165 + art. 165-A; impossibilidade técnica não gera 165-A                                  | [REF-CONTRAN-432] art. 6º § único; CTB art. 165-A | [UC-TEAT-007], [WF-TEAT-005]                                                       |
| RN-TEAT-107 | Classificação Caso 1/2/3 de constatação sem/com abordagem, derivada do enquadramento, não campo de texto livre                                                   | [REF-CONTRAN-985-1003-MBFT] Seção 7               | [UC-TEAT-002] (candidata a atualização futura)                                     |
| RN-TEAT-108 | Uma infração por AIT; mesma raiz de código = uma só infração; regra de consolidação de enquadramentos concorrentes/concomitantes/sucessivos                      | [REF-CONTRAN-985-1003-MBFT] Seção 7               | `NormativeCatalog`/`Framing` (referenciada em [WF-TEAT-001] contexto de validação) |
| RN-TEAT-109 | Vedação de auto-preenchimento de campos de identificação do veículo a partir de leitura de placa sem validação do agente                                         | [REF-SENATRAN-997] art. 3º, VI; Anexo II, d)      | roadmap — só se ativa se TEAT integrar OCR/ANPR                                    |
| RN-TEAT-110 | Finalização do AIT nunca pode ser automática — exige indicação explícita do agente                                                                               | [REF-SENATRAN-997] Anexo II, g)                   | [WF-TEAT-001]                                                                      |

---

## §5 — Itens boat-adjacentes (flagados, não escritos em `est/boat/**`)

- **Bodycam também cobre atendimento a sinistro** (Portaria Normativa DETRAN-AM 003/2026 art. 4º,
  inciso I — "atendimento a sinistros de trânsito"): se TEAT adotar bodycam como evidência formal
  ([UC-TEAT-010]), o mesmo regime se aplica à captura de cena de sinistro em [APP-BOAT], hoje sem
  menção alguma a bodycam em `est/boat/**`. Sugerido ao especialista BOAT avaliar como item de
  pesquisa/backlog próprio — não escrito aqui por regra de fronteira desta sessão.
- **Câmeras veiculares** (Portaria 003/2026 art. 15, aplicação facultativa): mesma observação —
  se ativado, amplia a superfície de evidência tanto de TEAT quanto de BOAT (viaturas
  frequentemente atendem sinistro e fiscalização de rotina).
- Nenhum outro achado desta rodada (medidas administrativas, alcoolemia, sessão exclusiva,
  cancelamento pós-finalização, ciclo de homologação SENATRAN) tem efeito direto identificado
  sobre o domínio de sinistros — são específicos ao ato de autuação/medida em campo.

---

## §6 — Itens da rodada de mineração (`_intake/proposals.md`) resolvidos ou parcialmente resolvidos por esta rodada

Referência cruzada — não duplica o conteúdo já detalhado em `research-dossier.md` §Mapa
CONFIRMA/ESTENDE, apenas confirma quais viraram artefato nesta rodada BPO:

| Item de `_intake/proposals.md`                                                           | Status após rodada BPO                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "requisitos legais específicos do talão eletrônico"                                      | **FECHADO em [APP.md]** §Âncoras legais                                                                                                                                                                                                                                              |
| "condições e ator autorizado a cancelar um AIT finalizado"                               | **FECHADO em [WF-TEAT-001]** (`CANCELADO_POSFINAL`) + [UC-TEAT-011] — marcado prática-pendente-de-norma                                                                                                                                                                              |
| "catálogo fechado de valores de `no_approach_reason`"                                    | **Referenciado** em [UC-TEAT-002] via nota; refinamento pleno (Caso 1/2/3) fica para quando RN-TEAT-107 for formalizada pelo LEGAL — UC-TEAT-002 não foi reescrito nesta rodada (fora do escopo desta sessão focar revisão profunda de UCs já existentes além dos pontos mandatados) |
| "sessão de agente exclusiva por dispositivo"                                             | **FECHADO** — [UC-TEAT-012], [WF-TEAT-001] `SUSPEITO_CONCORRENCIA`                                                                                                                                                                                                                   |
| "mecanismo de devolução de números não utilizados de reserva expirada"                   | **Permanece aberto** — nenhuma norma localizada, WF-TEAT-002 mantém a nota                                                                                                                                                                                                           |
| "comportamento do dispositivo quando pacote normativo expira em campo sem conectividade" | **Permanece aberto** — decisão de produto, não legal                                                                                                                                                                                                                                 |
| "constraints de exclusão de intervalo em nível de banco de dados" (risco técnico)        | **Permanece aberto**, sem alteração — [WF-TEAT-002] mantém a nota conforme mandato                                                                                                                                                                                                   |
