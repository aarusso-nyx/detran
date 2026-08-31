---
id: RN-BOAT-112
title: Parceiros (saúde, SAMU, bombeiros, polícia civil, DPVAT) integram o RENAEST de forma facultativa e por mediação do DETRAN estadual
status: draft
apps: [boat]
sources: [REF-CONTRAN-808-2020]
updated: 2026-08-24
---

**Regra.** A hipótese de "parceiro conveniado" da missão de [APP-BOAT] **tem base legal expressa** —
e tem também um **limite jurídico preciso**. A Res. CONTRAN 808/2020, art. 6º, § 1º, nomeia
Ministério da Saúde, secretarias de saúde estaduais/distritais/municipais, **SAMU**, polícias civis,
corpos de bombeiros militares e a **administradora do Seguro DPVAT** como entidades que **"poderão
integrar"** o RENAEST. A natureza do vínculo é **facultativa**: é faculdade da entidade, não dever;
não há norma que obrigue hospital, SAMU ou seguradora a alimentar o sistema, e nenhum dispositivo
autoriza o DETRAN-AM a exigir esse fluxo. Quando a entidade **opta** por integrar, o faz **por meio
do órgão executivo de trânsito do Estado** — isto é, o DETRAN-AM é o **ponto de entrada mediador**,
não um destinatário passivo nem um par de ligação direta com a União (regra que tem duas exceções:
Ministério da Saúde e administradora do DPVAT integram-se pela União, § 3º).

**Base legal.** [REF-CONTRAN-808-2020] art. 6º:

> "§ 1º **Poderão integrar** o RENAEST os demais órgãos e entidades que efetuam o registro de
> ocorrências de acidentes de trânsito, que apuram suas circunstâncias ou prestam atendimento às
> vítimas, entre os quais: I - o Ministério da Saúde; II - as secretarias de saúde dos Estados, do
> Distrito Federal e dos municípios; III - o Serviço de Atendimento Médico de Urgência (SAMU);
> IV - as polícias civis e os corpos de bombeiros militares dos Estados e do Distrito Federal; e
> V - a administradora do Seguro de Danos Pessoais Causados por Veículos Automotores de Via
> Terrestre (Seguro DPVAT).
>
> § 3º **Caso optem** pela integração ao RENAEST, o Ministério da Saúde e a administradora do Seguro
> DPVAT deverão se integrar por meio do órgão máximo executivo de trânsito da União.
>
> § 5º **Caso os órgãos e entidades elencados nos incisos II, III e IV do § 1º optem** pela
> integração ao RENAEST, deverão se integrar por meio do órgão ou entidade executivo de trânsito do
> Estado ou do Distrito Federal, de acordo com a respectiva circunscrição."

Complementa: art. 9º, VI — cabe ao DETRAN _"incentivar a integração dos órgãos e entidades de que
trata o art. 6º"_; art. 8º, VII — o mesmo dever, no nível federal; art. 2º — a definição do RENAEST
já alcança _"os demais órgãos e entidades que efetuam o registro de acidentes de trânsito, que
apuram suas circunstâncias ou **prestam atendimento às suas vítimas**"_.

**Verificação.** Consequências de produto, todas derivadas do caráter facultativo:

1. O intake de parceiro **não pode ser modelado como fluxo obrigatório** nem como pré-condição de
   qualquer transição de [WF-BOAT-001]. Um registro de sinistro é completo e transmissível **sem**
   qualquer dado de origem externa.
2. Não pode haver **SLA, prazo ou bloqueio** que dependa de ato de terceiro não obrigado. O sistema
   não pode "aguardar o SAMU".
3. A modelagem correta é de **conciliação/mesclagem** de registros sobre o mesmo sinistro vindos de
   fontes diferentes, com **origem** e **momento** rastreáveis — não de um campo preenchido por
   ator externo em tempo real (mesmo ponto do handoff UX nº 1 do `_intake/research-dossier.md`).
4. A adesão é **decisão institucional externa** ao DETRAN-AM: priorizar essa onda depende de
   articulação com secretaria de saúde/SAMU, não apenas de engenharia.

**Controvérsia/risco.** (a) A norma **não cria** papel de RBAC, procedimento, formato ou fluxo de
sistema — é norma de governança interinstitucional. Confirmar a hipótese "parceiro conveniado" em
direito **não** equivale a confirmar um ator de sistema; a decisão de modelá-lo continua sendo do
Owner (`_intake/proposals.md` §Atores). (b) A entrada de dados de saúde por essa via **agrava**, e
não resolve, a questão de base legal do tratamento de dado sensível: recebido do SAMU ou da
secretaria de saúde, o dado de saúde da vítima passa a ser tratado pelo DETRAN-AM sob compartilhamento
entre entes públicos (LGPD art. 26) — ver [RN-BOAT-128], que trata também da vedação específica
aplicável à administradora do DPVAT, entidade **privada**. (c) Não foi possível apurar, por norma,
se algum órgão de saúde amazonense já exerceu a opção do § 1º — é fato operacional local, a
confirmar com o órgão.
