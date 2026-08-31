---
id: RN-TEAT-112
title: Integridade, criptografia, retenção e trilha de auditoria são requisitos normativos do talão eletrônico
status: draft
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

**Regra.** O talão eletrônico deve, cumulativamente:

1. ser dotado de elementos de segurança que garantam **fidelidade e integridade** dos dados e
   **impeçam sua alteração após o término da lavratura** do AIT;
2. **armazenar os AIT até sua transmissão** ao órgão ou entidade de trânsito;
3. **criptografar** os dados quando lidos, gravados e transmitidos;
4. **registrar as operações** envolvendo as autuações realizadas, indicando **no mínimo** data e
   hora, agente de trânsito, veículo, local e **número do aparelho utilizado**, para permitir
   auditorias;
5. **identificar o equipamento e impedir sua instalação ou uso não autorizado**.

**Base legal.** [REF-SENATRAN-997] art. 3º, II e V; Anexo II, b), e), f), i), j):

> art. 3º "V - ser dotado de elementos de segurança que garantam a fidelidade e integridade dos
> dados registrados e impeçam sua alteração após o término da lavratura do AIT"
>
> Anexo II "e) Quando os dados forem lidos, gravados e transmitidos estes devem ser
> criptografados;" · "f) Deverá armazenar os AIT até a sua transmissão ao órgão ou entidade de
> trânsito;" · "i) O software deverá identificar o equipamento e impedir sua instalação ou uso não
> autorizado;" · "j) Deverá ser efetuado o registro das operações envolvendo as autuações
> realizadas, indicando no mínimo, data e hora, agente de trânsito, veículo, local e número do
> aparelho utilizado para permitir a realização de auditorias;"
>
> Anexo V, e) "Os dados dos AIT somente poderão ser enviados e armazenados no banco de dados do
> órgão autuador."

**Verificação.** Confirma e **ancora normativamente** três invariantes que o corpus TEAT
sustentava por inferência: `content_hash`/imutabilidade ([RN-TEAT-004], [INV-AIT-001]) ← art. 3º,
V; fila local cifrada (`MobileEncryptedStorePort`) ← Anexo II, e) e f); postura e identificação
do dispositivo ([RN-TEAT-003]) ← Anexo II, i). Acrescenta um requisito **não coberto**: a trilha
de auditoria do Anexo II, j) exige o **número do aparelho** em cada operação — atributo que deve
constar do registro de auditoria do ato, não apenas do cadastro de `OperationalDevice`. O Anexo
V, e) impõe **restrição de destino do dado**: AIT só pode ser enviado e armazenado no banco do
**órgão autuador** — restrição de arquitetura multi-tenant que o TEAT precisa observar caso venha
a ser operado como serviço compartilhado entre órgãos.

**Controvérsia/risco.** "Somente poderão ser enviados e armazenados no banco de dados do órgão
autuador" (Anexo V, e) é literal e não ressalva processadores, nuvem contratada, réplicas de
contingência ou backup fora do domínio do órgão. Interpretado ao pé da letra, restringe modelos de
hospedagem hoje usuais. Como a norma é de 2022 e não trata de computação em nuvem, a leitura de
trabalho é que a vedação alcança **destino de dados** (não pode ir para banco de outro órgão ou de
terceiro como titular), não **infraestrutura contratada pelo próprio órgão**. É interpretação —
item 11 de `_intake/legal-assessment.md`, com efeito direto sobre decisão de arquitetura.
