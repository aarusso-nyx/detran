---
id: RN-TEAT-002
title: Evidência só existe com hash verificável e evento de custódia — cadeia íntegra e apensa
status: draft
apps: [teat]
sources:
  [
    'teat:law/invariants/INV-EVIDENCE-001.json',
    'teat:docs/framework/product/blueprints/BP-EVIDENCE-CUSTODY-001.json',
    'teat:docs/framework/product/workflows/evidence-custody.md',
    'teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md',
    REF-SENATRAN-997,
    REF-CONTRAN-798-804-equipamentos,
    REF-DETRANAM-TALAO-BODYCAM,
  ]
updated: 2026-08-24
---

> **Nota de revisão (2026-08-24, especialista LEGAL).** Regra **confirmada** e **parcialmente
> ancorada**. Permanece verdadeiro que **não existe norma federal específica de cadeia de custódia
> digital de evidências de trânsito** — o "(fonte pendente)" não foi fechado. Mas três âncoras
> parciais foram acrescentadas: integridade/criptografia/auditoria do talão eletrônico
> ([REF-SENATRAN-997]), imagem com a placa como conteúdo obrigatório do AIT por medidor de
> velocidade ([REF-CONTRAN-798-804-equipamentos]) e um regime local de evidência audiovisual
> contínua ([REF-DETRANAM-TALAO-BODYCAM]) que **não cabe** no modelo atual de anexo pontual.

**Regra.** A API de evidências só persiste metadados de evidência quando: o hash de conteúdo
submetido (`hash_algorithm`+`hash_value`, sha256 na prática) está presente; a referência de
armazenamento de objeto está vinculada a um ato legal ou pacote probatório (`EvidenceLink`); e um
evento de custódia é apensado (`CustodyEvent`) na mesma operação. Eventos de custódia são
**somente apensáveis** — nunca editados ou removidos. Evidência não pode ser fisicamente
apagada pelo agente: invalidação ou substituição segue fluxo formal, preservando o registro
original. Um `ProbativePackage` reúne evidências, hashes, assinaturas, logs e protocolos de um
ato e torna-se **imutável** assim que seu `manifest_hash` é gerado.

**Base legal.** **Gap parcialmente fechado.** Não há, ainda, excerto normativo federal específico
sobre **cadeia de custódia digital de evidências de trânsito**: a mecânica de `CustodyEvent`/
`ProbativePackage` continua decorrendo da exigência de defensabilidade probatória do
AIT/medida/sinistro perante defesa e recurso (alimenta [WF-INF-003] e o julgamento no rait).
Âncoras normativas parciais agora disponíveis:

- **Integridade e criptografia da evidência em trânsito e em repouso** — [REF-SENATRAN-997] Anexo
  II, b) e e): _"Deverá ser dotado de elementos de segurança que garantam a fidelidade e
  integridade dos dados registrados e impeçam sua alteração após o término da lavratura do AIT"_;
  _"Quando os dados forem lidos, gravados e transmitidos estes devem ser criptografados"_. Ver
  [RN-TEAT-112].
- **Trilha de auditoria mínima** — [REF-SENATRAN-997] Anexo II, j): registro das operações com
  _"no mínimo, data e hora, agente de trânsito, veículo, local e número do aparelho utilizado para
  permitir a realização de auditorias"_. O **número do aparelho** é atributo exigido por norma e
  deve constar do evento de custódia.
- **Imagem como conteúdo obrigatório do auto** — [REF-CONTRAN-798-804-equipamentos] (Res.
  798/2020 art. 9º, red. Res. 804/2020): _"o auto de infração de trânsito (AIT) e a notificação de
  autuação (NA) […] devem conter a imagem com a placa do veículo"_ quando a apuração é por medidor
  de velocidade. Aqui a evidência não é acessória: é **elemento de consistência** do auto — ver
  [RN-TEAT-139].
- **Evidência audiovisual contínua (DETRAN-AM)** — [REF-DETRANAM-TALAO-BODYCAM] §2, Portaria
  Normativa 003/2026, art. 8º, IV: é vedado ao agente _"Manipular, editar, copiar, excluir ou
  transferir arquivos"_ — mesmo princípio de integridade desta regra, aplicado a fonte **não
  modelada** aqui. Ver [RN-TEAT-141] e [RN-TEAT-142].

**Verificação.** [INV-EVIDENCE-001] (severidade `hard-fail`): API rejeita persistência sem hash,
vínculo e evento de custódia. Evidência capturada offline permanece cifrada até a transmissão;
falha de transmissão de evidência não apaga o ato legal associado, mas mantém pendência explícita
(corpus de protótipo: RN-EVD-001/003/004/005/009/010/012). Evidência não pode ser vinculada a um
ato legal já finalizado a menos que esteja no estado `validated`.

**Limite conhecido do modelo.** O desenho atual pressupõe evidência **pontual, escolhida e anexada
pelo agente**. A Portaria Normativa DETRAN-AM 003/2026 impõe uma segunda fonte, de natureza
diferente: gravação **contínua e automática** de toda interação agente↔condutor, sobre a qual o
agente **não tem** — e por norma não pode ter — qualquer poder de cópia, exclusão ou transferência.
Essa fonte não se anexa: **correlaciona-se por janela temporal**. Enquanto não for modelada
([RN-TEAT-141]), existe, na operação real do órgão-cliente, evidência juridicamente relevante de
todo ato de campo que o TEAT não conhece. Ver também [RN-TEAT-142] quanto ao regime de acesso, que
**não** admite consulta ordinária por nenhum papel de RBAC do TEAT.
