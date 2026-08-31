---
id: RN-RAIT-137
title: Direitos do titular e dever de publicidade — adotados por remissão ao bloco RN-PORTAL-118..122; o que fica sob responsabilidade própria do RAIT
status: draft
apps: [rait, portal]
sources: [REF-LEI-13709-2018]
updated: 2026-08-26
---

**Regra.** O bloco [RN-PORTAL-118] a [RN-PORTAL-122] — acesso sem máscara ao titular, canal único
de exercício dos direitos do art. 18, correção como ação de primeira classe, transparência no
ponto de coleta e revisão de decisão automatizada — já declara `rait` entre os seus `apps` e já
alcança de fato o RAIT: [RN-PORTAL-122] nomeia nominalmente a triagem de admissibilidade
([RN-RAIT-001]/[RN-RAIT-122]) ao tratar de decisão automatizada; [RN-PORTAL-121] discute
correção de dado de processo com exemplo (placa digitada com erro) aplicável ao RAIT. **Esse bloco
é adotado aqui por remissão e não é reescrito** — mesma técnica de [RN-PEC-150] em relação ao bloco
BOAT.

O que fica sob responsabilidade **específica do domínio/backend RAIT**, não do PORTAL (que é só o
canal), são três pontos que o bloco PORTAL pressupõe mas não pode garantir sozinho:

1. **Modelo de dados que distinga claramente titular de terceiro.** [RN-PORTAL-118] só consegue
   exibir o dado do requerente sem máscara e suprimir o de terceiro se o RAIT expuser essa
   distinção — hoje um caso pode conter dado de outro condutor (indicação), do procurador
   ([RN-RAIT-135]), de servidor que decidiu, e de eventual terceiro citado na exposição de fatos
   ([RN-RAIT-134]). Nenhum desses papéis está hoje modelado com granularidade suficiente para a
   regra de mascaramento por relação (`sujeito_da_sessão` × `titular_do_dado`) funcionar
   corretamente.
2. **Roteamento correto entre correção de dado e mérito do ato.** [RN-PORTAL-121] item 3 já
   distingue "corrigir CPF" de "alterar o enquadramento de uma infração" — mas a lista concreta do
   que é dado factual corrigível (endereço, CPF, placa, grafia) versus o que é mérito (o próprio
   desfecho do julgamento) é conhecimento do domínio RAIT, não do PORTAL; sem essa lista explícita,
   o roteamento depende de julgamento caso a caso do atendente.
3. **Publicar a hipótese de tratamento do RAIT (art. 23, I).** O dever de publicidade ativa —
   previsão legal, finalidade, procedimentos — já é apontado como descumprido para o BOAT
   ([RN-BOAT-126], item 3: a página institucional de LGPD do DETRAN-AM não menciona dado de saúde
   nem vítima de sinistro). O mesmo achado se estende ao RAIT: nada garante que a hipótese de
   [RN-RAIT-133] (art. 7º, II/VI) esteja publicada nesse mesmo canal institucional.

**Base legal.** [REF-LEI-13709-2018] art. 18 (direitos do titular), art. 9º e art. 23, I
(transparência e publicidade) — íntegra já transcrita e anotada em [REF-LEI-13709-2018] e
consumida pelo bloco [RN-PORTAL-118]-[RN-PORTAL-122], que esta regra referencia sem duplicar.

**Verificação.** (a) O modelo de dados do RAIT expõe papel (`requerente`, `procurador`, `terceiro
citado`, `autoridade`, `relator`) por campo, não apenas por requerimento inteiro — pré-requisito
técnico para [RN-PORTAL-118] funcionar. (b) Existe, no domínio RAIT, uma lista fechada de campos
"factuais" corrigíveis sem reabertura processual, complementar à casuística de [RN-PORTAL-121].
(c) A hipótese de [RN-RAIT-133] consta do inventário público de tratamentos do DETRAN-AM — checagem
a fazer, não assumir.

**Controvérsia/risco.** _Severidade: BAIXA_ — o mecanismo já está desenhado pelo bloco PORTAL; o
risco aqui é de **integração incompleta**, não de lacuna normativa: se o RAIT não expuser papel por
campo, a regra do PORTAL falha silenciosamente (mascaramento errado, ou ausência de máscara onde
deveria haver). Não é achado que precise de parecer jurídico — é requisito de modelagem de dados a
levar ao time técnico. Ver `_meta/lgpd-assessment.md` §RAIT.
