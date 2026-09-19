# ADR-0024: Política do Owner para prioridade de tramitação no RAIT

## Status

Aceita pelo Owner em 2026-09-16 (OD-016), para preparação e implementação.
Emendada na mesma data pela política de comprovação definitiva no protocolo,
com validação jurídica atestada pelo Owner para essas novas decisões, conforme
emenda abaixo, complementada na mesma data pela preservação do mecanismo de
alterações posteriores e pela referência de idade no ato de qualificação.
A validação jurídica da igualdade de nível PCD = 80+ foi também expressamente
atestada pelo Owner na mesma data, encerrando esse gate específico, conforme
emenda abaixo. Este registro não equivale a parecer
jurídico consultado independentemente nem libera os gates da campanha R-0007.

## Contexto e autoridade

OD-016 e RN-RAIT-141 já registram prioridade para pessoas idosas (60+ e 80+)
e RN-RAIT-141 também referencia prioridade da pessoa com deficiência. A lacuna
da campanha R-0007 é a ordem relativa entre essas categorias, o tratamento de
condições simultâneas e o significado de `legal_priority = null`.

Este ADR transcreve a decisão explícita do Owner na sessão de 2026-09-16:
"concordo com as duas recomendações. Registre-as como decisões de OWNER e
prepare o ciclo corretivo delimitado." O Architect registra a decisão; não
substitui a autoridade de produto nem a validação LEGAL.

## Decisão

Registro original, preservado como histórico; a emenda vigente abaixo delimita
`null` antes do protocolo e fixa ausência de prioridade comprovada como default
na qualificação definitiva.

- O risco de prescrição permanece o primeiro critério da ordem única.
- Após esse critério, PCD e 80+ ocupam o mesmo nível de prioridade; seguem-se
  60+ e, por último, ausência de prioridade comprovada.
- O desempate usa `protocolled_at` e depois `id`.
- Todas as bases comprovadas de prioridade devem ser preservadas; para ordenar
  um caso com múltiplas condições, usa-se o maior nível aplicável, sem apagar as
  demais bases.
- `legal_priority = null` significa **não apurado**. O caso fica excluído do
  `claim-next` automático até saneamento; `null` não equivale a ausência de
  prioridade comprovada.

A igualdade de nível entre PCD e 80+ é uma **política de produto decidida pelo
Owner**, originalmente sujeita à validação jurídica antes da entrega, agora
atestada pelo Owner na emenda específica abaixo. Não é apresentada como
uma ordenação total expressamente prescrita pelas fontes legais. A regra de
prioridade da pessoa idosa já registrada em OD-016 (requerimento com prova da
idade) permanece preservada.

## Emenda do Owner em 2026-09-16 — papéis para registrar e confirmar

Registro histórico. As emendas posteriores substituem o tratamento de casos
sem prova e condicionam o uso de revisão pós-protocolo à política vigente,
preservando sua capacidade arquitetural.

Após comparar os arranjos operacionais, o Owner decidiu explicitamente:
"Ok, eu como OWNER Decido adotar esse arranjo de menor esforço."
A emenda resolve a atribuição de papéis para prioridade de tramitação:

- `rait-secretary` registra o requerimento e a comprovação e **confirma** a
  prioridade no próprio protocolo, mediante prova válida. Registrar o pedido ou
  anexar um documento, por si só, não ativa prioridade; confirmar é a decisão
  expressa baseada na comprovação. Não há concessão automática sem prova.
- `rait-coordinator` revoga ou corrige excepcionalmente uma prioridade já
  confirmada, com motivo e nova revisão auditável. O histórico, a decisão anterior
  e suas bases permanecem preservados; ficam vedados apagamento e rebaixamento
  silencioso, inclusive por sobrescrita via CRUD genérico.
- Não há etapa ordinária de confirmação por `rait-analyst` nem fila adicional de
  verificação instituída por esta emenda. `agency-admin` permanece responsável
  pelos parâmetros, sem autoridade para decidir a prioridade de casos por este
  arranjo; `AUDITOR` permanece em leitura.
- Casos sem prova permanecem `legal_priority = null`, não apurados e excluídos do
  `claim-next` automático. A ausência de prova não autoriza convertê-los
  automaticamente em "ausência de prioridade comprovada".

A opção reduz etapas operacionais e concentra recebimento e validação na
secretaria. Na data desta emenda histórica, a adequação jurídica dessa atribuição,
a precedência PCD = 80+ > 60+ e a política de `null` integravam o gate jurídico
antes da entrega/merge; as atestações posteriores abaixo atualizam seu alcance.

**Pendências delimitadas:** os critérios de prova válida para PCD, 60+, 80+ e
para a conclusão "ausência de prioridade comprovada" ainda precisam ser
definidos. O tratamento de prova apresentada após o protocolo também não foi
decidido: o ciclo deve parar antes de implementar esse fluxo e obter a definição
do Owner. Não se infere desta emenda uma fila, um endpoint ou autoridade para a
secretaria rever prioridade já confirmada.

## Emenda do Owner em 2026-09-16 — comprovação definitiva no protocolo

Registro complementado pela emenda seguinte: a definitividade é a política
vigente do órgão, sem eliminar o mecanismo de alterações posteriores.

O Owner decidiu expressamente e declarou: "Essas decisões JÁ foram devidamente
validadas pelo jurídico". Registra-se essa atestação como autoridade para as
decisões abaixo; o Architect não consultou um parecer jurídico independente.

- A prova de idade é a data de nascimento da pessoa, comprovada por documento
  ou CNH, para qualificação das faixas 60+ e 80+ no protocolo.
- A prova de PCD é documento anexado e validado pelo `rait-secretary` no ato
  do protocolo. O anexo isolado não dispensa essa validação.
- "Ausência de prioridade comprovada" é o estado default da qualificação
  concluída no protocolo. Não exige prova negativa específica.
- Não são admitidas provas apresentadas após o protocolo nem invalidações
  de provas após o protocolo para essa qualificação. O momento do protocolo
  é definitivo na qualificação do ordenamento.
- `null` continua significando não apurado antes do protocolo, sem consumo
  automático por `claim-next`. Após o protocolo, ausência de comprovação
  corresponde ao default acima, semanticamente `none`, e não a `null`.
  O literal persistido de `none` ainda deve ser reconciliado no contrato.

Esta emenda resolve as pendências de comprovação e apresentação posterior da
emenda anterior. Pela política vigente, o `rait-coordinator` não pode
revogar/corrigir posteriormente a prioridade para modificar a qualificação
definitiva do ordenamento; a emenda seguinte preserva esse mecanismo para
mudança normativa futura. Permanecem a secretaria no protocolo, `agency-admin` nos
parâmetros, `AUDITOR` em leitura, a ausência de confirmação ordinária por
`rait-analyst`, a preservação das bases comprovadas e o histórico auditável.
Permanecem risco de prescrição primeiro, PCD = 80+ > 60+ > ausência de prioridade
comprovada e desempate por `protocolled_at` e `id`.

A atestação jurídica abrange esta política de comprovação, default e
definitividade, incluindo a validação de PCD pela secretaria no protocolo.
Esta atestação, isoladamente, não quitava por inferência o gate anterior de
precedência entre categorias; a emenda específica abaixo registra a confirmação
expressa posterior do Owner para PCD = 80+. Outras pendências jurídicas do corpus
não são abrangidas.

O contrato deve distinguir o ato de qualificação no recebimento/protocolo da
data cronológica usada no desempate: UC-RAIT-001 admite data de postagem ECT
para o protocolo postal. Esta emenda não inventa validação retroativa de prova
nem redefine esse marco. A referência temporal de cálculo da idade foi
resolvida pelo Owner na emenda seguinte.

## Emenda vigente do Owner em 2026-09-16 — revisões preservadas e marco da idade

O Owner determinou: "mantenha a possibilidade de de alterações posteriores
como está. A definitividade é hoje, por decisão do órgão, mas esse mecanismo
pode ser alterado por portaria." Também fixou: "A referencia do calculo de
idade no protocolo é pelo ato de qualificação."

- Preserva-se o mecanismo de correção/revogação excepcional pelo
  `rait-coordinator`, com motivo, nova revisão auditável e preservação da
  decisão anterior, suas bases e histórico. A definitividade atual não deve
  ser convertida em remoção dessa capacidade arquitetural.
- Continua vigente a decisão do órgão de não admitir prova nova nem
  invalidação posterior para modificar a qualificação do ordenamento. O uso
  futuro do mecanismo depende da alteração normativa por portaria e da
  correspondente política autorizada pelo Owner, versionada e auditável;
  esta emenda não autoriza requalificação pós-protocolo sob a política atual.
- A idade para as faixas 60+ e 80+ é calculada no **ato de qualificação**, a
  partir da data de nascimento comprovada por documento/CNH. No protocolo
  postal, a postagem ECT não é a referência para esse cálculo. Permanece o
  marco postal preexistente para cronologia e tempestividade de UC-RAIT-001,
  sem validação retroativa de prova ou recálculo automático posterior.

Esta emenda supera a interpretação anterior de eliminação do mecanismo de
revisões e encerra a pendência de decisão sobre o marco da idade. Registra-se
decisão de Owner; não se presume portaria já editada nem nova validação
jurídica independente. A atestação jurídica anterior conserva seu alcance.
O contrato deve explicitar como a política vigente controla o uso do
mecanismo preservado, mantendo vedadas sobrescritas silenciosas por CRUD.

## Emenda do Owner em 2026-09-16 — validação jurídica de PCD = 80+

O Owner esclareceu expressamente: "O gate jurídico já validou PCD = 80."
No contexto da decisão de ordenação acima, a declaração confirma a igualdade
de nível entre PCD e a faixa 80+, sem alterar o limiar etário para idade
exatamente igual a 80 anos. Registra-se a atestação do Owner de que essa
validação jurídica já ocorreu; o Architect não examinou um parecer
jurídico independente.

Encerra-se o gate jurídico específico da igualdade de nível PCD = 80+.
Ficam superadas as indicações anteriores de que essa validação permanecia
pendente. Preservam-se a ordem aprovada, os critérios de comprovação, os
papéis, a política vigente de definitividade, o mecanismo de revisões e o
cálculo de idade no ato de qualificação. A confirmação não encerra outras
pendências LEGAL não abrangidas nem demonstra prontidão técnica para despacho.

## Consequências e fronteira

O ciclo corretivo deve reconciliar contrato, referências e matriz de bindings
com esta decisão e explicitar vocabulário canônico, validação e migração dos
dados existentes, preservação das bases e casos de teste de ordenação e
exclusão de não apurados. Este ADR não escolhe novos valores persistidos para
o vocabulário nem declara migração ou implementação concluída.

A escolha da ordenação, a política de comprovação, a definitividade vigente,
a preservação de revisões para mudança normativa e o marco da idade no ato
de qualificação estão resolvidos pelo Owner. O gate jurídico específico de
PCD = 80+ está encerrado pela atestação expressa acima; permanecem os requisitos
técnicos de contrato, revisão e despacho da campanha R-0007.
Casos legados com `null` exigem migração definida e auditável antes do consumo
automático; a decisão de default no protocolo não autoriza inventar dados ou
converter indiscriminadamente o acervo não apurado em `none`.

O parâmetro preexistente `rait.priority.legal_bases`, referenciado pela descrição
de `legal_priority` no blueprint, contém na seed um placeholder textual em JSONB
(`"[{60+:1},{80+:2}] + PcD"`), não um objeto de ordenação consumível pelo motor.
Sua reconciliação no catálogo, seed, validação e dados é requisito do ciclo de
implementação e de seus gates; não se presume um default a partir desse texto.

## Referências

- [OD-016](../knowledge-base/open-decisions-rait.md).
- [RN-RAIT-141](../../framework/product/domains/inf/rait/rules/RN-RAIT-141.md)
  e suas fontes capturadas REF-LEI-10741-2003 e
  REF-LEI-13146-2015-acessibilidade.
- Campanha R-0007, CTG-0001 C4, ciclo corretivo de TASK-0023.
