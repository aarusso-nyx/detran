---
id: RN-RAIT-133
title: Base legal do tratamento do dado pessoal do requerente — competência legal e regulatória, nunca consentimento
status: draft
apps: [rait, portal]
sources: [REF-LEI-13709-2018, REF-CONTRAN-900, REF-CONTRAN-918]
updated: 2026-08-26
---

**Regra.** Todo dado pessoal coletado no processamento de defesa/recurso — identificação do
requerente, endereço+CEP, telefone, documento, CPF/CNPJ, placa, exposição de fatos e fundamentos
([RN-RAIT-002]) — é tratado com fundamento em **competência legal e regulatória**, nunca em
consentimento. O requerente não tem a opção de recusar o tratamento e ainda assim exercer o
direito de defesa/recurso: consentimento pressupõe escolha real, que não existe aqui. Nenhuma
tela do RAIT ou do PORTAL deve apresentar coleta desses campos como opcional ou condicionada a
aceite.

**Base legal.**

- [REF-LEI-13709-2018] art. 7º, II: _"para o cumprimento de obrigação legal ou regulatória pelo
  controlador"_. É a hipótese com melhor sustentação textual, e a mais forte de todo este bloco:
  [REF-CONTRAN-900] art. 3º **já é** o regulamento que impõe, nominalmente, a coleta exata desses
  campos como _"conteúdo mínimo obrigatório"_ do requerimento ([RN-RAIT-002]) — não é uma
  obrigação genérica inferida, é o próprio dispositivo regulatório que gera a obrigação de coleta.
- [REF-LEI-13709-2018] art. 7º, VI: _"para o exercício regular de direitos em processo judicial,
  administrativo ou arbitral"_. Base concorrente: o próprio requerente está exercendo, ao
  peticionar, um direito seu (defesa, CTB art. 281-A; recurso, CTB art. 285/288) — hipótese
  aplicável tanto à posição do órgão que precisa do dado para decidir quanto à do cidadão que o
  fornece para litigar.
- [REF-LEI-13709-2018] art. 23, _caput_: tratamento pelo Poder Público para _"atendimento de sua
  finalidade pública [...] executar as competências legais ou cumprir as atribuições legais do
  serviço público"_ — moldura geral que confirma a leitura acima.

**Verificação.** (a) Nenhum formulário de intake do RAIT/PORTAL apresenta checkbox de
consentimento para os campos de [RN-RAIT-002]; a ausência de aceite não impede nem atrasa o
protocolo. (b) A hipótese acima deve constar do inventário público de tratamentos do órgão
(dever de publicidade do art. 23, I) — ver [RN-RAIT-137], que trata especificamente desse dever
para o RAIT. (c) Este é o mesmo padrão de raciocínio já adotado em [RN-BOAT-123] (base legal do
sinistro) e [RN-PEC-150] (base legal do exame) — aqui aplicado ao caso, textualmente mais simples,
de dado **não sensível**.

**Controvérsia/risco.** _Severidade: BAIXA a MÉDIA_ — é a hipótese menos controversa de todo o
achado LGPD desta rodada, precisamente porque [REF-CONTRAN-900] art. 3º nomeia os campos. O
elemento de risco residual não está na escolha da hipótese, e sim no fato de que, até esta rodada,
**nenhuma regra RAIT a declarava** — o requerimento era coletado como se a base fosse óbvia demais
para citar, o que quebra o padrão de rastreabilidade `[REF-…]` do `CONVENTIONS.md` e deixa o
DETRAN-AM sem o texto pronto para cumprir o dever de publicidade do art. 23, I. Proposta de
trabalho, sujeita à mesma disciplina de "revisado, não validado juridicamente" de todo achado LGPD
deste corpus (`_meta/steering.md`, aviso de risco). Ver `_meta/lgpd-assessment.md` §RAIT.
