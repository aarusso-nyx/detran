---
id: RN-DASH-110
title: Relógio mensal do FUNSET — prestar informações de arrecadação até o 20º dia do mês subsequente
status: draft
apps: [dashboard, rait]
sources: [REF-CONTRAN-918, REF-CTB-280-290]
updated: 2026-08-24
---

**Regra.** O DETRAN-AM, na condição de **órgão arrecadador de multas de trânsito e recolhedor de
valores à conta do FUNSET**, deve **prestar informações ao órgão máximo executivo de trânsito da
União até o 20º (vigésimo) dia do mês subsequente ao da arrecadação**. É o **relógio periódico mais
duro e mais claramente aplicável ao órgão estadual** de todo o corpus: periodicidade mensal, dia
numérico certo, destinatário nomeado, sujeito ativo inequívoco.

**Base legal.** [REF-CONTRAN-918] art. 26 _(verbatim)_:

> Art. 26. Os demais órgãos, arrecadadores de multas de trânsito, de sua competência ou de
> terceiros, e recolhedores de valores à conta do FUNSET deverão prestar informações ao órgão máximo
> executivo de trânsito da União **até o 20º (vigésimo) dia do mês subsequente ao da arrecadação**,
> na forma disciplinada pelo órgão máximo executivo de trânsito da União.

Contexto de sujeição — [REF-CONTRAN-918] art. 24, _caput_ e § 1º _(verbatim)_:

> Art. 24. Os órgãos e entidades executivos de trânsito e executivos rodoviários dos Estados, do
> Distrito Federal e dos Municípios, integrantes do SNT, para arrecadarem multas de trânsito de sua
> competência ou de terceiros, deverão utilizar o documento próprio de arrecadação de multas de
> trânsito estabelecido pelo órgão máximo executivo de trânsito da União, com vistas a garantir o
> repasse automático dos valores relativos ao FUNSET.
> § 1º O recolhimento do percentual de 5% (cinco por cento) do valor arrecadado com as multas de
> trânsito à conta do FUNSET **é de responsabilidade do órgão de trânsito arrecadador**.

**Periodicidade / prazo.** Mensal, **vencimento no dia 20** do mês seguinte ao mês de competência da
arrecadação. O termo inicial do período de apuração é o **mês da arrecadação** — não o mês da
autuação, nem o do julgamento, nem o do repasse financeiro.

**Consequência do descumprimento.** **Não localizada expressamente no art. 26.** O artigo é
puramente impositivo, sem cominação. O risco real é indireto e cumulativo: (i) inconsistência na
conciliação do FUNSET com a União, cuja responsabilidade de recolhimento é nominalmente do órgão
arrecadador (art. 24, § 1º); (ii) achado de controle externo (TCE-AM) por descumprimento de norma
federal de arrecadação vinculada; (iii) contaminação do dever vizinho do art. 27, § 6º, esse sim com
sanção expressa ([RN-DASH-111]). Registrar a ausência de sanção **como ausência**, não presumir
sanção que a norma não prevê.

**O que o DASHBOARD deve exibir para provar cumprimento.**

1. **Relógio por competência**: uma linha por mês de arrecadação, com estado
   `aberto → em apuração → transmitido → confirmado`, e a **data-limite dia 20** materializada como
   data, não como texto.
2. **Escada de alerta** no padrão já aprovado para o RAIT ([WF-RAIT-002] §4, steering A.1),
   calibrada em dias corridos até o dia 20 — sugestão: D-10 (verde→amarelo), D-5 (amarelo→laranja),
   D-1 (vermelho), D+1 (**vencido**, com destaque permanente até regularização).
3. **Evidência de transmissão**, e não apenas marcação manual: identificador do envio, data-hora,
   responsável, e valor total informado. Sem evidência anexada, o estado máximo é `transmitido
(não comprovado)`.
4. **Reconciliação exibida**: valor arrecadado no período × valor informado × 5% recolhido ao FUNSET.
   Divergência não é erro do painel — é achado, e deve ser exibida como tal ([RN-DASH-112]).
5. **Série histórica de 12 meses** com pontualidade por competência — é o artefato que o órgão
   apresenta a controle externo para demonstrar regularidade, e é a razão de o histórico não poder ser
   sobrescrito quando um mês é regularizado com atraso.

**Controvérsia/risco.** _Severidade: média._ A expressão _"na forma disciplinada pelo órgão máximo
executivo de trânsito da União"_ remete o **conteúdo e o meio** do envio a normativo SENATRAN não
identificado nesta rodada. O DASHBOARD pode monitorar a **tempestividade** com segurança; a
**suficiência do conteúdo** transmitido depende desse normativo. Item para o orquestrador — ver
`_intake/legal-assessment.md`.
