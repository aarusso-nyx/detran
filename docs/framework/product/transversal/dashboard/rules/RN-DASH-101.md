---
id: RN-DASH-101
title: Vedação de fronteira — o DASHBOARD observa, não decide: nenhum ato de negócio nasce no painel
status: draft
apps: [dashboard, rait, teat, boat, pec]
sources: [REF-CTB-280-290, REF-CONTRAN-918, REF-SENATRAN-997, REF-LEI-9784-1999]
updated: 2026-08-24
---

**Regra.** O DASHBOARD **não lavra, não julga, não homologa, não notifica, não arquiva e não
decide**. Toda a sua função é _observação de segunda ordem_: ler estado produzido por outro
aplicativo do ecossistema e exibi-lo. Nenhuma tela do DASHBOARD pode conter um comando cujo efeito
seja um **ato administrativo** — nem mesmo os aparentemente inócuos ("declarar prescrito",
"arquivar de ofício", "reabrir prazo", "reprocessar AIT bloqueado", "aprovar exceção").

Esta não é uma preferência arquitetural: é consequência do fato de que **todo ato de negócio do
domínio tem competência nominada em norma**. A lavratura do AIT é do agente e da autoridade de
trânsito ([RN-TEAT-104]); o julgamento da defesa é da autoridade de trânsito ([RN-RAIT-115]); o
julgamento do recurso é da JARI e do CETRAN ([RN-RAIT-110], [RN-RAIT-111]); a reavaliação do exame é
da Junta designada ([RN-PEC-110], [RN-PEC-111]); a validação do dado de sinistro é do órgão executivo
estadual e do coordenador de RENAEST ([RN-BOAT-104], [RN-BOAT-105]). Um painel de monitoramento
**não está em nenhum desses róis**. Ato praticado por quem não tem competência é ato viciado, e o
vício de competência é insanável por conveniência de produto.

**Base legal.**

- [REF-CONTRAN-918] art. 2º, IV: _"órgão autuador: órgão ou entidade competente para autuar o
  proprietário ou condutor pelo cometimento de infração de trânsito, **julgar a defesa da autuação**
  e aplicar as penalidade de multa de trânsito"_ — a competência é do órgão autuador definido em
  norma, exercida pela autoridade de trânsito, não por sistema de apoio.
- [REF-CTB-280-290] art. 285 e art. 289: o recurso é julgado **pela JARI** e **pelo CETRAN** — órgãos
  colegiados com composição normativa.
- [REF-LEI-9784-1999] art. 2º, parágrafo único, e arts. 11-12: a competência administrativa é
  irrenunciável e exercida pelos órgãos a que foi atribuída, admitida delegação **por ato formal e
  publicado** — nunca por implementação de software.
- [REF-SENATRAN-997] Anexo II, h): registros de sessão concorrente _"não devem ser processados"_ e o
  fato _"deve ser apurado pela autoridade de trânsito"_ — mesmo o **bloqueio** normativo tem
  autoridade destinatária nomeada. Ver [RN-TEAT-111].

**Verificação.**

1. **Teste da tela.** Toda ação disponível no DASHBOARD deve caber em um destes quatro verbos:
   _ver, filtrar, exportar, notificar-um-humano_. Qualquer verbo fora disso (aprovar, cancelar,
   liberar, declarar, corrigir, encerrar) é violação desta regra.
2. **Deep-link, não delegação.** Quando o painel mostra algo que exige ação, ele **encaminha ao app
   competente** (link para o processo no RAIT, para o registro no BOAT), preservando ali a
   autenticação, a competência e a trilha próprias daquele app. O ato é praticado no app de origem,
   por quem tem competência, com o registro que a norma exige.
3. **Nenhuma escrita no domínio.** O acesso do DASHBOARD às bases dos demais apps é somente-leitura
   por construção (não por convenção de código). A única escrita legítima do DASHBOARD é em seu
   **próprio** acervo: configuração de painel, reconhecimento de alerta (_acknowledge_) e trilha de
   acesso ([RN-DASH-171]).
4. **Reconhecer alerta não é decidir.** O "ack" de um alerta registra que um humano viu — é evidência
   de diligência ([RN-DASH-135]), não ato de saneamento. Ele não pode alterar prazo, estado
   processual ou classificação de risco no app de origem.

**Controvérsia/risco.** _Severidade: média-alta._ O risco não é jurídico-abstrato, é de deriva: um
painel de operação que exibe filas e prazos **atrai** pedidos de "botão de ação daqui mesmo",
especialmente em casos de urgência (processo prestes a prescrever). A pressão será real e recorrente.
A resposta é sempre a mesma: o botão existe — **no app competente** —, e o painel leva até ele.
Registrar esta regra como fronteira explícita no charter do produto ([APP-DASHBOARD], escopo "Fora:
qualquer ação de negócio") evita ter que redecidir isso a cada sprint.
