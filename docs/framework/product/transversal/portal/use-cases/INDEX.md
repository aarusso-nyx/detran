# use-cases/ — catálogo do corpus PORTAL

Casos de uso do cidadão em todo o catálogo de serviços do PORTAL — não apenas a trilha de multas.
Os UC-PORTAL-001..009 (trilha de apelação: defesa prévia → recurso JARI → recurso CETRAN, incl.
indicação de condutor, acompanhamento, desistência e SNE) foram escritos pelo especialista UX a
partir de `inf/rait/_intake/research-dossier.md` e dos REF-CONTRAN 900/918/931 — ver
[JRN-PORTAL-001], [JRN-PORTAL-002], [JRN-PORTAL-003] para as narrativas ponta-a-ponta e
`_intake/ux-notes.md` para o inventário de telas.

Os UC-PORTAL-010..019 foram escritos pelo especialista BPO (rodada CRAWLER→BPO, 2026-08-25) a
partir de `_intake/research-dossier.md`, cobrindo o escopo greenfield confirmado no dossiê
(consultas, documentos digitais, pagamento, sinistro, exame de aptidão, ouvidoria, avaliação, LGPD
e elevação de nível de assinatura). Instanciam o ciclo genérico de [WF-PORTAL-001] e as pontes de
[WF-PORTAL-002] (identidade/nível), [WF-PORTAL-003] (notificações) e [WF-PORTAL-004]
(ouvidoria/avaliação).

## UC completos

| id                                  | título                                                                                    | status |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| [UC-PORTAL-001](./UC-PORTAL-001.md) | Cidadão interpõe defesa da autuação (1º circuito)                                         | draft  |
| [UC-PORTAL-002](./UC-PORTAL-002.md) | Cidadão interpõe recurso à JARI (2º circuito)                                             | draft  |
| [UC-PORTAL-003](./UC-PORTAL-003.md) | Cidadão interpõe recurso ao CETRAN (2ª instância)                                         | draft  |
| [UC-PORTAL-004](./UC-PORTAL-004.md) | Proprietário indica o condutor infrator                                                   | draft  |
| [UC-PORTAL-005](./UC-PORTAL-005.md) | Cidadão acompanha o andamento de um processo em curso                                     | draft  |
| [UC-PORTAL-006](./UC-PORTAL-006.md) | Cidadão desiste de defesa ou recurso até o julgamento                                     | draft  |
| [UC-PORTAL-007](./UC-PORTAL-007.md) | Cidadão adere ao Sistema de Notificação Eletrônica (SNE)                                  | draft  |
| [UC-PORTAL-008](./UC-PORTAL-008.md) | Cidadão recebe e compreende a decisão do processo                                         | draft  |
| [UC-PORTAL-009](./UC-PORTAL-009.md) | Cidadão responde a uma diligência com documento adicional                                 | draft  |
| [UC-PORTAL-010](./UC-PORTAL-010.md) | Cidadão consulta multas, pontuação e situação da CNH                                      | draft  |
| [UC-PORTAL-011](./UC-PORTAL-011.md) | Cidadão consulta e baixa a CNH digital (CNH-e)                                            | draft  |
| [UC-PORTAL-012](./UC-PORTAL-012.md) | Proprietário consulta e emite o CRLV-e do veículo                                         | draft  |
| [UC-PORTAL-013](./UC-PORTAL-013.md) | Cidadão acessa os próprios dados de um registro de sinistro (BAT)                         | draft  |
| [UC-PORTAL-014](./UC-PORTAL-014.md) | Candidato/condutor consulta o resultado de exame de aptidão física, mental ou psicológica | draft  |
| [UC-PORTAL-015](./UC-PORTAL-015.md) | Cidadão paga uma multa (à vista com desconto, ou parcelado)                               | draft  |
| [UC-PORTAL-016](./UC-PORTAL-016.md) | Cidadão registra manifestação na ouvidoria                                                | draft  |
| [UC-PORTAL-017](./UC-PORTAL-017.md) | Cidadão avalia o serviço recebido                                                         | draft  |
| [UC-PORTAL-018](./UC-PORTAL-018.md) | Cidadão solicita acesso aos próprios dados tratados pelo DETRAN-AM (LGPD)                 | draft  |
| [UC-PORTAL-019](./UC-PORTAL-019.md) | Cidadão eleva o nível de assinatura/conta ao tentar um ato que exige nível superior       | draft  |

## Cobertura

**Trilha de apelação (001-009)**: as duas fases do lifecycle da multa que tocam o cidadão
diretamente (1º circuito — defesa; 2º circuito — recursos JARI/CETRAN), mais indicação de condutor,
adesão ao SNE e desistência.

**Catálogo ampliado (010-019)**: consultas de leitura (multas/pontuação, CNH-e, CRLV-e, BAT de
sinistro, resultado de exame de aptidão); pagamento de multa; os três pilares transversais da Lei
13.460/2017 (manifestação, avaliação — a Carta de Serviços em si é artefato de [WF-PORTAL-004], não
um UC); acesso a dados pessoais (LGPD); e o mecanismo de elevação guiada de nível de assinatura que
sustenta qualquer ato de nível avançado no catálogo, incluindo os já existentes em 001-004.

Backlog de UC não escrito nesta rodada: fluxo completo de transferência de propriedade via ATPV-e
(Res. CONTRAN 809/2020 arts.10-22) — mapeado como serviço futuro em [WF-PORTAL-001], mas fora do
escopo desta onda; recurso ao CETRAN da decisão de junta médica/psicológica do PEC (cobertura
prevista, mas [WF-PEC-002] ainda tem itens de validação jurídica pendentes — aguardar antes de UC).
