# Questionário — 33 perguntas abertas (RAIT / DETRAN-AM)

Compilado em 2026-08-24, a partir de todo o corpus do repositório `detran-refs`. Reúne
perguntas que exigem resposta de uma pessoa específica — não pesquisa bibliográfica — para
destravar o desenho do RAIT e domínios correlatos (TEAT, BOAT).

**Nota.** O Owner já deu respostas provisórias de steering a todas as 33 perguntas (ver
`_meta/steering.md`), sem validação formal de especialista em nenhuma delas. Este documento
existe para levar cada pergunta à pessoa/área certa e obter uma resposta definitiva —
especialmente as jurídicas, que hoje só têm a leitura de trabalho do Owner, sem parecer.
Onde a resposta formal divergir da resposta de steering, a formal prevalece; atualizar
`_meta/steering.md` e os artifacts já propagados de acordo.

Cada pergunta cita o item correspondente em `_meta/steering.md` entre parênteses, para
rastreabilidade.

---

## 1. Perguntas técnicas (produto/arquitetura)

Direcionadas ao time técnico/produto do ecossistema DETRAN.

**T1. (A.3)** A plataforma de worklist do RAIT já suporta uma estratégia de distribuição
`round-robin` com ordem inicial aleatorizada e registro auditável do sorteio (ata de
distribuição), ou é necessário especificar um mecanismo de sorteio dedicado, fora do
worklist, para a distribuição de relator no 2º circuito (JARI/CETRAN)?

> Resposta:

**T2. (A.8)** Para assinatura de ata/decisão de sessão colegiada (JARI/CETRAN), é viável
adotar o padrão **PAdES+TSA** (já em uso em outro domínio do ecossistema, ex. laudos do PEC)
em vez de assinatura física? Há algum impedimento técnico ou de infraestrutura?

> Resposta:

**T3. (E.29)** Quando o pacote normativo instalado no dispositivo móvel do TEAT expira em
campo, sem conectividade para buscar um novo, qual deve ser o comportamento do sistema:
bloquear a lavratura de novo AIT até sincronizar, ou permitir continuidade com aviso visível
ao agente?

> Resposta:

**T4. (F.30)** O catálogo compartilhado de atores (`shared/actors.md`) deve espelhar os 9
papéis granulares de RBAC específicos do TEAT (field-agent, field-supervisor,
processing-operator, traffic-authority, agency-admin, technical-admin, auditor, bi-analyst,
integration-operator), ou é suficiente manter apenas a visão agregada multi-app já existente?

> Resposta:

**T5. (F.31)** O "parceiro conveniado" do BOAT (integração facultativa com saúde
estadual/municipal, SAMU, corpos de bombeiros, polícias civis — Res. CONTRAN 808/2020 art.
6º) é uma visão de produto para uma onda futura, ou deve ser removido do escopo/missão do
domínio por ora? Depende de adesão institucional externa — há apetite confirmado para alocar
capacidade de engenharia nesta frente?

> Resposta:

**T6. (F.32)** Os papéis de protótipo ainda sem RBAC próprio definido — Suporte técnico,
Fiscal de contrato, Encarregado de dados/DPO (distinto do papel agregado de auditoria/LGPD já
modelado) — devem entrar em ondas futuras de implementação de RBAC, ou ficam fora do
planejamento por ora?

> Resposta:

**T7. (F.33)** Os itens do protótipo UC-1.245/UC-1.246 (danos materiais e testemunhas do
sinistro) e UC-1.251 (relatório preliminar do sinistro) do BOAT merecem um caso de uso
próprio e dedicado, ou devem ser modelados como extensão de um UC já existente (ex.
UC-BOAT-002, veículos e pessoas envolvidas)?

> Resposta:

---

## 2. Perguntas jurídicas (validação legal formal)

Lista priorizada por um especialista LEGAL em `inf/rait/_intake/legal-assessment.md` §4,
ordenada por risco × custo de errar. **As cinco primeiras (L1-L5) bloqueiam decisões de
arquitetura** — recomenda-se parecer jurídico formal antes de implementar o cálculo de
prazos/prescrição do RAIT com base nelas. Direcionadas a advogado(a)/assessoria jurídica.

**L1. [BLOQUEIA] (C.13)** A Lei 9.873/1999 (prescrição administrativa, âmbito federal
expresso em seu próprio título e _caput_ do art. 1º) rege o processo administrativo de
trânsito **estadual** do DETRAN-AM? A extensão hoje vem apenas de uma resolução (Res. CONTRAN
918/2022, art. 36) sobre lei de âmbito federal. Dois dos quatro relógios de extinção da
punibilidade modelados no RAIT dependem desta resposta.

> Resposta:

**L2. [BLOQUEIA] (C.14)** Quando os tetos do CTB somados (até 48 meses entre JARI e CETRAN,
arts. 285 §6º e 289 _caput_) excedem a prescrição por paralisação de 3 anos da Lei 9.873/1999
(art. 1º §1º), **qual relógio deve governar** o SLA institucional do RAIT? Define o teto de
SLA de todo o produto e o desenho da escada de alertas.

> Resposta:

**L3. [BLOQUEIA] (C.15)** A prescrição do art. 289-A do CTB (não julgamento do recurso em 24
meses) é **automática e declarável de ofício** pelo sistema, ou depende de ato próprio? Um
julgamento proferido **após** os 24 meses é nulo, ineficaz, ou válido?

> Resposta:

**L4. [BLOQUEIA] (C.16)** O recurso da autoridade contra decisão de **provimento** (CTB art.
288 §1º) é **discricionário ou vinculado**? Qual autoridade, dentro do DETRAN-AM, é
competente para exercê-lo, e sob que critérios? Qual o **prazo** aplicável (o art. 288
_caput_ fixa 30 dias, mas o marco de ciência da autoridade não está explicitado)? Há
**contraditório/contrarrazões** do cidadão nesse recurso?

> Resposta:

**L5. [BLOQUEIA] (C.17)** O desconto de 40% (CTB art. 284 §6º, incluído pela Lei
14.599/2023) deve ser concedido **mesmo quando o órgão não aderiu ao SNE** — como a própria
lei determina — apesar de as Res. CONTRAN 918/2022 art. 21 e 931/2022 art. 9º (anteriores à
lei) estruturarem o benefício em torno de um documento de arrecadação gerado pelo SNE? Se
sim, **qual o procedimento** para emitir esse documento fora do SNE?

> Resposta:

**L6. (C.18)** Qual é o termo inicial da decadência do direito de aplicar a penalidade (CTB
art. 282 §6º-A) nas autuações **não flagranciais** — que são a maior parte do volume em
fiscalização eletrônica — já que a "forma definida pelo Contran" prevista na lei não foi
localizada como regulamentação específica?

> Resposta:

**L7. (C.19)** A Resolução CONTRAN 357/2010 (diretrizes de composição/regimento da JARI)
segue **vigente**? Não foi localizada revogação expressa, mas também não há confirmação
positiva definitiva — deve ser confirmada junto ao CONTRAN/SIC antes de tratar a composição
formal da JARI-AM como requisito de sistema?

> Resposta:

**L8. (C.20)** Existe ou pode ser localizado o regulamento do CONTRAN que define "força
maior" para fins de suspensão de prazos processuais (CTB art. 290-A)? Enquanto não localizado,
confirma-se que a suspensão só pode existir como ato administrativo motivado e auditado,
nunca como regra automática de sistema?

> Resposta:

**L9. (C.21)** O termo inicial do prazo de defesa da autuação deve ser a **expedição** da
notificação (CTB art. 281-A) ou a **notificação** em si (Res. CONTRAN 918/2022 art. 29, que
exclui da contagem "o dia da notificação")? Os dois dispositivos usam vocábulos distintos sem
harmonizá-los expressamente.

> Resposta:

**L10. (C.22)** Cabe um canal de **revisão pós-encerramento** da instância administrativa
(fundamento subsidiário: Lei 9.784/1999 art. 65, que admite revisão a qualquer tempo diante
de fatos novos)? E, especificamente, deve haver **vedação de _reformatio in pejus_** (a
decisão de 2ª instância agravar a situação do recorrente) — o CTB é silente, só a Lei
9.784/1999 (art. 64, parágrafo único e art. 65, parágrafo único) trata do tema,
subsidiariamente?

> Resposta:

**L11. (C.23)** Qual critério deve ser aplicado à hipótese de não conhecimento por "pedido
incompatível com a situação fática" (Res. CONTRAN 900/2022 art. 4º, IV) — a única do rol que
exige juízo de conteúdo na fase de admissibilidade? Deve ser restrita à ausência **formal**
de pedido, remetendo ao mérito toda dúvida sobre compatibilidade, para não se converter em
julgamento antecipado sem colegiado?

> Resposta:

**L12. (C.24)** Quando a decisão da JARI tem **publicação** e **notificação** individual em
datas distintas, qual delas prevalece para contar o prazo de 30 dias do recurso ao CETRAN-AM
(CTB art. 288, que usa "ou" sem definir prevalência)?

> Resposta:

**L13. (C.25)** Qual **índice de correção** o DETRAN-AM aplica, na prática, para a
restituição de multa paga quando a penalidade é julgada improcedente (CTB art. 286 §2º
menciona a UFIR — indexador extinto — "ou índice legal de correção dos débitos fiscais")?
Esta é definição de legislação estadual/fazendária do Amazonas.

> Resposta:

**L14. (C.26)** A **desistência** da defesa prévia **restaura** o prazo original de 180 dias
de decadência (em vez do prazo estendido de 360 dias que passou a valer com a interposição da
defesa), ou o prazo estendido permanece mesmo após a desistência? O CTB (art. 282 §6º) não
regula esse ponto expressamente.

> Resposta:

**L15. (C.27)** É possível confirmar a assinatura e vigência da Portaria DETRAN-AM 5046/2018
(base normativa da representação por procuração no RAIT/PORTAL)? O nome do
Diretor-Presidente signatário está ambíguo na versão obtida por OCR — necessário para citação
formal segura.

> Resposta:

---

## 3. Processos internos do DETRAN/AM

Direcionadas ao DETRAN-AM (ou a quem tiver acesso direto/institucional à JARI-AM e ao
CETRAN-AM) — dados operacionais, regimentais e de capacidade que não estão em nenhuma fonte
pública consultada.

**D1. (A.1)** Os limiares propostos para a escada de alertas de risco de prescrição são
aceitáveis como calibração inicial? Relógio B (inércia do julgador, teto 24 meses/instância):
alertas em 12/18/21/23 meses. Relógio C (paralisação, teto 3 anos): alertas em 24/30/33 meses
sem movimentação. Relógio A (decadência, 180/360 dias): alertas em 50/75/90% do prazo.

> Resposta:

**D2. (A.2)** Quantos pools de trabalho segregados fazem sentido no volume real de casos do
DETRAN-AM? O desenho atual propõe 3 pools base (defesa prévia / recurso JARI / recurso
CETRAN), com segmentação opcional por enquadramento de infração ou por risco de prescrição —
essa segmentação adicional é necessária?

> Resposta:

**D3. (A.4)** É possível obter o **regimento interno oficial** da JARI-AM e do CETRAN-AM
(quorum, forma de convocação, admissão de sustentação oral, prazo interno de voto, regra de
desempate) por canal direto/não-público com o DETRAN-AM? Duas rodadas de pesquisa pública não
localizaram o documento (pista não confirmada: Decreto Estadual do Amazonas nº 34.398/2014).

> Resposta:

**D4. (A.5)** O regimento local da JARI-AM/CETRAN-AM prevê algum mecanismo de accountability
por atraso reiterado de relator (ex. advertência seguida de afastamento temporário, como no
modelo do CETRAN-ES)? Se sim, qual é o mecanismo exato?

> Resposta:

**D5. (A.6)** Para a contagem de prazos (prorrogação de vencimento para o 1º dia útil quando
cai em dia não útil), qual calendário de feriados deve ser usado — apenas municipal (Manaus),
apenas estadual (AM), ou a combinação de nacional + estadual?

> Resposta:

**D6. (A.7)** Existe algum prazo interno já praticado pelo DETRAN-AM para o cumprimento de
diligências (pedido de prova/documento complementar) durante a instrução de defesa/recurso?
Sem piso ou teto legal expresso, qual prazo operacional deve ser adotado?

> Resposta:

**D7. (B.9)** Existe hoje **uma única JARI-AM**, ou mais de uma (a Res. CONTRAN 357/2010
permite mais de uma JARI, com coordenador, quando o volume justificar)?

> Resposta:

**D8. (B.10)** Quantos conselheiros o CETRAN-AM tem atualmente para fins de quorum
deliberativo?

> Resposta:

**D9. (B.11)** Qual o volume mensal (ordem de grandeza é suficiente) de defesas prévias mais
recursos à JARI mais recursos ao CETRAN-AM, somados?

> Resposta:

**D10. (B.12)** Quantos analistas/revisores estão hoje alocados ao 1º circuito (defesa
prévia)?

> Resposta:

**D11. (D.28)** É possível corrigir, na prática, a linguagem das cartas de serviço
publicadas pelo DETRAN-AM? Duas exigências hoje cobradas do cidadão não têm base legal: (a)
endosso em cartório do AM para documento autenticado em cartório de outro estado (contraria a
Portaria DETRAN-AM 5046/2018, que dispensa reconhecimento cartorial); (b) juntada obrigatória
do parecer da JARI ao recorrer ao CETRAN-AM (contraria o CTB art. 285 §4º). Quem é o
responsável por atualizar esse conteúdo, e em que prazo?

> Resposta:

---

## Referência cruzada

Respostas provisórias de steering (Owner, 2026-08-24, sem validação formal): ver
`_meta/steering.md`. Pesquisa bibliográfica pendente (não coberta por este questionário): ver
`_meta/backlog.md`.
