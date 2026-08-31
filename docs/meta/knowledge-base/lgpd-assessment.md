---
id: LGPD-ASSESSMENT
title: Avaliação transversal de conformidade LGPD — gaps, divergências e oportunidades
status: reviewed
apps: [rait, teat, boat, pec, portal, dashboard]
sources:
  [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025, REF-CONTRAN-808-2020]
updated: 2026-08-26
---

# O que este arquivo é

Avaliação transversal (todos os domínios) de conformidade com a Lei 13.709/2018 (LGPD), rodada em
2026-08-26. Duas partes:

1. **Análise da LGPD em si** — [REF-LEI-13709-2018](../../reference/legal/leis/REF-LEI-13709-2018.md) foi lido
   por completo contra o texto oficial compilado do Planalto (`refs/leis/lei13709_plain.txt`,
   113KB, já baixado) e **ampliado** nesta rodada: cobria antes só os dispositivos necessários para
   BOAT/PORTAL/DASHBOARD (arts. 4º, 5º parcial, 6º, 7º, 9º, 11-13, 15-16, 18-20, 23, 26-27, 37-38,
   41, 46, 48); agora cobre também arts. 5º IX/X/XIX, 8º, 10, 14, 17, 33, 39, 40, 42-45, 47, 49-52
   — cada um com anotação de aplicabilidade (ou não-aplicabilidade explícita) a este corpus. Ver
   aquele arquivo para o texto verbatim; este arquivo não duplica excertos, só referencia por
   artigo.
2. **Auditoria cruzada de domínio** — cada `RN-*`, `WF-*`, `UC-*`, `APP.md` que toca dado pessoal
   foi conferido contra: (a) hipótese legal declarada (art. 7º/11), (b) classificação correta de
   dado sensível (art. 5º, II) incluindo o requisito adicional de criança/adolescente (art. 14),
   (c) minimização (art. 6º, III), (d) retenção/eliminação (art. 15-16), (e) direitos do titular
   exercíveis (art. 18) e dever de informação (art. 9º/23, I), (f) compartilhamento com terceiros
   (art. 26-27), (g) segurança/incidente/encarregado (art. 41/46/48).

**Não é uma nova rodada do zero.** O corpus já tinha tratamento LGPD maduro em BOAT
([RN-BOAT-122]–[RN-BOAT-131]), PEC ([RN-PEC-150]–[RN-PEC-154]) e PORTAL
([RN-PORTAL-118]–[RN-PORTAL-122]), e itens já rastreados em `_meta/open-issues.md` (DT-047,
DT-048, DT-049, DT-014, DT-029, DT-122). Este documento **não repete** o que já está correto —
valida essas três frentes por amostragem, e concentra achado novo em RAIT (gap estrutural
confirmado), BOAT (art. 14, achado novo), TEAT (citação de base legal ausente) e no próprio texto
da lei (mudança de nome da ANPD, dispositivos nunca antes excertados).

## Matriz de maturidade por domínio

| Domínio       | Bloco de base legal dedicado                                                               | Direitos do titular                                                     | Retenção/eliminação                                            | Achado desta rodada                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BOAT**      | ✅ [RN-BOAT-122]-[RN-BOAT-131], maduro                                                     | ✅ via [RN-BOAT-126]                                                    | ⚠ `forever` insustentável — **já rastreado** (DT-049)          | 🆕 art. 14 (crianças/adolescentes) nunca endereçado                                                                                                             |
| **PEC**       | ✅ [RN-PEC-150]-[RN-PEC-154], maduro (2 categorias simultâneas de dado sensível)           | ✅ via [RN-PEC-152]/153                                                 | ⚠ retenção de 20 anos (Lei 13.787) — **já rastreado** (DT-023) | Nenhum achado novo — auditado por amostragem, consistente                                                                                                       |
| **PORTAL**    | ✅ [RN-PORTAL-118]-[RN-PORTAL-122], maduro                                                 | ✅ núcleo do bloco                                                      | n/a (não é controlador primário)                               | Nenhum achado novo                                                                                                                                              |
| **DASHBOARD** | ✅ [RN-DASH-160]-[RN-DASH-172], framework de reidentificação maduro                        | n/a (agregado)                                                          | n/a                                                            | Confirmado: art. 20 (decisão automatizada) **não se aplica** — sem risk-scoring de indivíduo. Limiar de célula numérico ainda falta — **já rastreado** (DT-029) |
| **TEAT**      | ⚠ implícito, nunca citado para o núcleo do AIT                                             | n/a                                                                     | ⚠ bodycam sem prazo — **já rastreado** (DT-014, DT-049)        | 🆕 base legal do núcleo (CPF/CNH/placa) nunca citada — achado de forma, severidade baixa                                                                        |
| **RAIT**      | ✅ [RN-RAIT-133]-[RN-RAIT-138], desenhado 2026-08-26 — `draft`, não validado juridicamente | ✅ coberto por proxy via PORTAL, fronteira formalizada em [RN-RAIT-137] | ⚠ proposta em [RN-RAIT-136] (âncora de 5 anos), não validada   | Gap estrutural **fechado como rascunho** — ver §"Bloco LGPD do RAIT" abaixo                                                                                     |

---

## RAIT — o achado central desta rodada

**Confirmado: RAIT é o único domínio de dado pessoal do corpus sem um bloco de regras
equivalente a [RN-BOAT-122]/[RN-BOAT-123] (BOAT) ou [RN-PEC-150] (PEC).** Uma busca por "CPF",
"dado pessoal" e "dados pessoais" em todo `inf/rait/` (fora de `_intake/`) só encontra uma menção
incidental em [RN-RAIT-002]. Nenhuma regra RAIT cita [REF-LEI-13709-2018].

Isso **não** deixa o cidadão sem direitos — [RN-PORTAL-118], [RN-PORTAL-119], [RN-PORTAL-121] e
[RN-PORTAL-122] têm `apps:` incluindo `rait` e cobrem de fato acesso, correção, e revisão de
decisão automatizada da triagem de admissibilidade ([RN-RAIT-001]/[RN-RAIT-122], citados
nominalmente em [RN-PORTAL-122]). A camada de **direitos do titular está coberta por proxy**.

O que falta é a camada anterior, que BOAT e PEC resolveram primeiro: **por qual hipótese legal o
RAIT coleta e mantém** nome, CPF/CNPJ, endereço+CEP, telefone, placa e o texto livre de
"exposição de fatos e fundamentos" ([RN-RAIT-002], consumido por [UC-RAIT-001] e
[JRN-RAIT-001]). Três pontos específicos, nenhum deles endereçado hoje:

1. **Hipótese legal nunca declarada.** A resposta é quase certamente art. 7º, II (cumprimento de
   obrigação legal/regulatória — o CTB e suas resoluções exigem o processo) e, subsidiariamente,
   art. 7º, VI (exercício regular de direito em processo administrativo) — mesmo padrão de
   raciocínio que [RN-BOAT-123] já usou para o BOAT. Mas isso é uma **proposta**, não uma
   conclusão: precisa da mesma disciplina de "revisado, não validado juridicamente" que todo outro
   achado LGPD deste corpus recebeu (ver `_meta/steering.md`, aviso de risco no topo).
2. **Dado sensível incidental em texto livre — risco específico do RAIT, sem equivalente em
   BOAT/PEC.** BOAT e PEC coletam dado de saúde em **campos estruturados** (`severity`,
   `medical_result`), o que permite marcá-los como sensíveis de antemão. RAIT tem um campo de
   texto livre ("exposição de fatos") onde um cidadão pode, sem ser solicitado, relatar uma
   condição de saúde ou deficiência como justificativa da defesa ("não vi a placa porque sou
   parcialmente cego", "estava a caminho do hospital"). O art. 11, § 1º da LGPD alcança **qualquer
   tratamento que revele dado sensível**, não só o campo desenhado para isso — nenhuma regra ou
   tela do RAIT ([RN-RAIT-002], [UC-RAIT-001], [UC-RAIT-003], [IU-RAIT-001]) trata esse caso.
3. **Dado do procurador (terceiro) nunca nomeado como titular próprio.** [RN-RAIT-121] trata a
   procuração inteiramente como questão de formalidade (validade, firma reconhecida) — nunca
   pergunta de quem é o dado de identificação/assinatura do procurador, sob que base é tratado, ou
   por quanto tempo é retido. É um segundo titular de dados que o corpus nunca nomeou como tal.

**Severidade: MÉDIA-ALTA** — volume alto (>500 casos/mês, `_meta/steering.md` B.11), dado do
processo central do domínio, e um vetor de exposição de dado sensível ativo (o texto livre) sem
mitigação. Mitigado por: PORTAL já cobrir a camada de direitos do titular.

**Ação recomendada:** DT-052 (`legal-validation`) em `_meta/open-issues.md`. O antigo DT-126
(`kb-consistency`) foi encerrado após a criação e integração do bloco de regras.

## Bloco LGPD do RAIT — desenhado (2026-08-26)

O bloco foi escrito e integrado ao corpus: [RN-RAIT-133](../../framework/product/domains/inf/rait/rules/RN-RAIT-133.md) (base
legal do dado do requerente — art. 7º II/VI, ancorada no próprio [REF-CONTRAN-900] art. 3º, a
hipótese menos controversa de toda esta avaliação), [RN-RAIT-134](../../framework/product/domains/inf/rait/rules/RN-RAIT-134.md)
(dado sensível revelado incidentalmente na "exposição de fatos" em texto livre — risco sem
precedente direto em BOAT/PEC, que usam campos estruturados), [RN-RAIT-135](../../framework/product/domains/inf/rait/rules/RN-RAIT-135.md) (o procurador como titular distinto, nunca antes nomeado como
tal), [RN-RAIT-136](../../framework/product/domains/inf/rait/rules/RN-RAIT-136.md) (retenção — proposta de ancorar a
conservação identificada nos 5 anos da prescrição quinquenal já modelada em [RN-RAIT-113], depois
anonimizar, mesmo padrão de duas camadas do BOAT), [RN-RAIT-137](../../framework/product/domains/inf/rait/rules/RN-RAIT-137.md)
(fronteira formal com o bloco de direitos do PORTAL — adoção por remissão, sem duplicar) e
[RN-RAIT-138](../../framework/product/domains/inf/rait/rules/RN-RAIT-138.md) (compartilhamento com JARI-AM/CETRAN-AM — questão
institucional em aberto, subordinada a DT-060, tratada com postura conservadora provisória).

Todas em `status: draft`, com a mesma disciplina de "revisado, não validado juridicamente" de todo
achado LGPD deste corpus. `_meta/open-issues.md` DT-052 preserva a validação jurídica residual; a
pendência de consistência sobre a existência do bloco foi encerrada.

## BOAT — art. 14 (crianças e adolescentes), achado novo

O regime LGPD do BOAT é o mais maduro do corpus para dado **sensível** (saúde da vítima), mas
nunca considerou o requisito **separado e cumulativo** do art. 14 para dado de **qualquer**
natureza de uma criança ou adolescente: consentimento específico de um responsável (§ 1º), dever
de transparência pública ampliada (§ 2º), ou o encaixe estrito na exceção de "proteção"/contato
com responsável sem repasse a terceiro (§ 3º).

`CrashPerson` ([APP-BOAT] §Modelo de dados) captura pedestres, passageiros e ciclistas envolvidos
em sinistro **sem nenhum controle de idade** — é plausível, na prática de campo, que um desses
papéis seja exercido por um menor de idade. Nenhuma regra ([RN-BOAT-003], [RN-BOAT-122],
[RN-BOAT-123]) cita o art. 14. É defensável — mas não está registrado em nenhum artefato — que a
captura em cena de sinistro se enquadre na exceção de "proteção" do § 3º, dada a impraticabilidade
de colher consentimento parental no momento do atendimento; mesmo nessa leitura, o dever de
transparência pública do § 2º e a vedação de repasse a terceiro sem consentimento (relevante à
integração de parceiros do [WF-BOAT-002] e ao envio ao RENAEST) continuam de pé e não estão
cobertos.

**Severidade: MÉDIA-ALTA.** **Ação recomendada:** DT-053 (`legal-validation`), companheiro de
DT-047/048/049 — já adicionado.

## TEAT — base legal do núcleo não citada (achado menor, forma)

O núcleo do AIT (CPF/CNH do condutor, placa do veículo) inegavelmente tem base legal — o próprio
CTB a impõe — mas **nenhuma regra TEAT cita a LGPD para o núcleo do processo**, só para a bodycam
([RN-TEAT-141], [RN-TEAT-142]). É quebra do padrão "toda afirmação tem `[REF-…]`" do
CONVENTIONS.md, não uma dúvida substantiva sobre a base em si. A lacuna de retenção da bodycam
(sem prazo definido, sem menção à LGPD na Portaria Normativa 003/2026) **já está rastreada**
(DT-014, DT-049) — não gera item novo.

**Severidade: BAIXA.** **Ação recomendada:** DT-128 (`kb-consistency`) — já adicionado.

## DASHBOARD — verificado, sem achado novo

Framework de reidentificação já maduro ([RN-DASH-160]-[RN-DASH-172]): controles de limiar de
célula, supressão secundária, generalização e proibição de consulta paramétrica livre já
especificados; só falta o **número** do limiar, que corretamente não foi inventado e já está
rastreado como DT-029 (severidade ALTA, aguardando parecer antes da 1ª publicação). Verificado
especificamente para esta rodada: **art. 20 (revisão de decisão automatizada) não se aplica** —
nenhum mecanismo de escoragem/perfilamento de indivíduo existe no DASHBOARD; as "escadas de
alerta" monitoram prazos processuais institucionais, não decidem sobre pessoas. Nenhum item novo.

## PEC e PORTAL — verificados por amostragem, sem achado novo

PEC já tem a análise mais sofisticada do corpus (duas categorias simultâneas de dado sensível —
saúde e biometria — com a "armadilha da alínea f" corretamente identificada e descartada em favor
do art. 11, II "a"). PORTAL já tem o bloco de direitos do titular mais completo. Nenhuma
divergência encontrada contra o texto integral da LGPD lido nesta rodada.

---

## Achados sobre a lei em si (não sobre um domínio específico)

1. **⚠ A ANPD mudou de nome.** O texto compilado do Planalto mostra que a **Medida Provisória nº
   1.317/2025**, confirmada pela **Lei nº 15.352/2026**, renomeou o órgão de "**Autoridade**
   Nacional de Proteção de Dados" para "**Agência** Nacional de Proteção de Dados" — a sigla ANPD
   permanece. **Todo o corpus** (este REF incluído, em citações anteriores a esta rodada) usa o
   nome antigo. Não é erro de substância, é imprecisão terminológica agora desatualizada.
   Registrado como DT-127 (`kb-consistency`, P3, escopo transversal) — não corrigido
   retroativamente citação por citação, para preservar o registro de qual redação estava vigente
   quando cada trecho foi escrito.
2. **Sanções administrativas alcançam o Poder Público, não só multa por faturamento.** O art. 52
   é lido com frequência (inclusive neste corpus, antes desta rodada) como "não se aplica a órgão
   público" porque o inciso II (multa) é redigido para pessoa jurídica de **direito privado**. Mas
   os incisos I, IV, V, VI, X, XI e XII (advertência, publicização da infração, bloqueio/eliminação
   de dados, suspensão de atividade de tratamento) **não têm essa limitação** e alcançam qualquer
   agente de tratamento. Isso eleva a régua de urgência institucional dos itens já rastreados como
   retenção indefinida (`retention: forever`, DT-049) e base legal não publicada (DT-047) — não é
   só risco de indenização civil (arts. 42-45), é risco de sanção administrativa direta contra o
   próprio órgão. Não gerou item novo — reforça a prioridade dos já existentes.
3. **DT-122 parcialmente resolvido.** O pedido de sincronizar [REF-LEI-13709-2018] com os textos
   já transcritos em RN-DASH-171/172 (art. 5º, X) e no restante do corpus (art. 11 completo) foi
   atendido nesta rodada — ambos os dispositivos agora estão no REF, verbatim. Resta apenas a
   parte de DT-122 referente à LAI (art. 32 em REF-LEI-12527-2011), fora do escopo desta avaliação
   LGPD.

## Oportunidade de maior alavancagem — ação de baixo custo, sem depender de build

O achado mais barato de corrigir de toda a avaliação **já existe** como DT-047: a LGPD art. 11,
§ 2º impõe **dever de publicidade** sempre que o Poder Público usa a dispensa de consentimento das
alíneas "a"/"b" para dado sensível — e o mesmo dever, para dado não sensível, está no art. 23, I.
Nenhum domínio deste corpus (nem BOAT, o mais maduro) confirma que essa publicidade **hoje existe**
na prática (site institucional do DETRAN-AM). É o único item desta lista inteira que **não exige
nenhuma decisão de arquitetura de sistema** — é publicar um texto. Recomenda-se tratá-lo como
prioridade P1 independente do roadmap de produto.

## Itens novos adicionados a `_meta/open-issues.md` nesta rodada

| id     | Domínio         | Tipo             | P   |
| ------ | --------------- | ---------------- | --- |
| DT-052 | rait            | legal-validation | P1  |
| DT-053 | boat            | legal-validation | P2  |
| DT-127 | — (transversal) | kb-consistency   | P3  |
| DT-128 | teat            | kb-consistency   | P3  |

DT-122 atualizado (parcialmente resolvido, LGPD fechada). Nenhum item existente (DT-014, DT-029,
DT-047, DT-048, DT-049) foi alterado em conteúdo — apenas referenciado; a análise de risco
institucional do item 2 acima os reforça sem os reabrir.
