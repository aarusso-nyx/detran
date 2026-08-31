---
id: RN-DASH-133
title: Vigilância das obrigações do BOAT/RENAEST — conformidade estrutural e latência, num domínio sem relógio legal
status: draft
apps: [dashboard, boat]
sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest]
updated: 2026-08-24
---

**Regra.** O BOAT é o caso invertido do RAIT: **deveres fortes, relógios ausentes**. Há obrigação
expressa e incondicional de alimentar o RENAEST ([RN-BOAT-102]), responsável nominal designado
([RN-BOAT-105]), integração institucional obrigatória e **vencida desde 04/01/2022** ([RN-BOAT-108]) —
e **nenhum prazo vigente de transmissão por registro** ([RN-BOAT-106]). O DASHBOARD, portanto,
**não monitora prazo neste domínio**: monitora **conformidade estrutural** (binária) e **latência**
(tendência). Tratar isso como relógio produziria um semáforo sem fundamento — precisamente o que
[RN-BOAT-106] proíbe.

**O que deve ser monitorado — quatro camadas.**

1. **Conformidade estrutural (binária, permanente).** Quatro perguntas que o órgão precisa saber
   responder de imediato a controle externo:
   - Integração ao RENAEST ativa? (dever vencido em 04/01/2022 — [RN-BOAT-108])
   - Coordenador de RENAEST designado, **nominalmente identificado** e vigente? ([RN-BOAT-105])
   - Última reunião periódica com os órgãos integrados em nível estadual — quando? (art. 9º, VIII)
   - Manuais operacionais vigentes aplicados na validação? (art. 9º, I e IV)
2. **Fluxo e latência (tendência, sem semáforo).** Mediana e p95 do intervalo entre o registro do
   sinistro no BOAT e a confirmação de aceite pelo RENAEST. Sem prazo legal, a métrica defensável é a
   **variação** — degradação da mediana é achado; um valor absoluto não é.
3. **Backlog de exceção (o que realmente cria risco).** Registros não transmitidos, rejeitados pelo
   RENAEST, ou pendentes de validação estadual — **por idade**. Um registro rejeitado há oito meses é
   um problema real ainda que nenhum prazo tenha sido violado.
4. **Completude multi-fonte da consolidação estadual** (CTB art. 326-A, § 10): PRF e órgão rodoviário
   federal; PM e órgão rodoviário estadual; municípios integrados; municípios **não** integrados, cuja
   validação é do DETRAN-AM ([RN-BOAT-104]). A falha típica é **uma fonte inteira ausente**, não
   registros esparsos — o painel deve mostrar presença/ausência por fonte, por período. Este é o
   insumo direto do índice do Pnatrans ([RN-DASH-114]).

**Consequência legal da perda.** **Nenhuma sanção localizada** em nenhuma das camadas — nem na Res.
CONTRAN 808/2020, nem no art. 326-A do CTB. As consequências reais são três, todas indiretas:
(a) distorção do **índice do Pnatrans** do Amazonas, que é público, anual e comparativo entre Estados
(CTB art. 326-A, § 12); (b) **descumprimento continuado** de obrigação já vencida (art. 16), que é
achado de controle externo disponível a qualquer momento; (c) degradação da base nacional que
subsidia _"estudos, pesquisas e ações que visem à melhoria da segurança no trânsito"_ (art. 2º,
parágrafo único da Res. 808/2020).

**Alerta mínimo para demonstrar diligência.**

- **Conformidade estrutural**: alerta **permanente e não silenciável** enquanto a integração estiver
  pendente — porém classificado como _conformidade_, fora da fila operacional de urgência
  ([RN-DASH-130], princípio 4). Alerta insanável na fila de urgência treina o operador a ignorar
  alertas.
- **Backlog**: escada por **idade do registro pendente**, com marcos internos declarados como internos
  (ex.: 7 / 15 / 30 dias), rotulados _"meta interna do DETRAN-AM — sem prazo legal vigente"_.
- **Latência**: alerta por **variação relativa** (ex.: mediana 50% acima da média móvel de 90 dias),
  não por limiar absoluto.
- **Completude**: alerta quando uma fonte do § 10 não envia nada em um período de referência — é o
  sinal mais precoce de que a consolidação anual estará incompleta em 30 de abril.

**Verificação.**

1. Todo indicador deste bloco carrega rótulo explícito de **"sem prazo legal vigente"** quando for o
   caso ([RN-DASH-113]) — o verde significa _"sem divergência"_, nunca _"dentro do prazo"_.
2. **Nenhum registro individual de sinistro é exibido no painel** por padrão. O BOAT trata dado
   pessoal **sensível de saúde** de vítima ([RN-BOAT-123], [RN-BOAT-124]); o DASHBOARD trabalha com
   contagens e estados. O acesso ao registro individual, quando necessário à apuração de uma falha de
   transmissão, é feito **no BOAT**, por papel autorizado, com registro de acesso
   ([RN-DASH-170], [RN-DASH-171]).
3. **Consulta ao RENAEST é regime distinto de alimentação** ([RN-BOAT-132]): se o painel consumir dados
   _de volta_ da SENATRAN para conciliação, isso é **caso de uso de acesso** sujeito à Portaria
   139/2025 — com finalidade, hipótese legal e justificativa de necessidade declaradas. Não é
   subproduto técnico da integração de envio.

**Controvérsia/risco.** _Severidade: média._ Adotar meta interna de transmissão é recomendável, mas
existe um risco de longo prazo: se o CONTRAN vier a editar a regulamentação delegada pelo art. 326-A,
§ 9º, o prazo legal poderá **conflitar** com a meta interna já consolidada na operação. O painel deve
manter os dois conceitos separados desde já — `meta_interna` e `prazo_legal` como campos distintos,
sendo o segundo hoje nulo —, para que a chegada da norma seja configuração e não refatoração.
