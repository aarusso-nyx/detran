---
id: WF-PORTAL-004
title: Atendimento e ouvidoria (Lei 13.460/2017) — manifestação, prazos de resposta, avaliação e Carta de Serviços
status: reviewed
apps: [portal, dashboard]
sources: [REF-LEI-13460-2017, REF-LEI-14129-2021, REF-LEI-13709-2018]
updated: 2026-09-13
---

## Escopo e fronteira (leia primeiro)

Modela o dever legal de ouvidoria da Lei 13.460/2017 (arts. 9º-17, 23) como processo do PORTAL, e
mantém a Carta de Serviços como **artefato vivo**, não como texto estático publicado uma vez.
**Taxonomia de manifestação**: a lei define "manifestações" como gênero (art.2º V — "reclamações,
denúncias, sugestões, elogios e demais pronunciamentos"), sem numerar exatamente 5 categorias
fixas. O quinto rótulo operacional usado neste corpus, **"solicitação"**, é uma leitura do "demais
pronunciamentos" residual — prática consolidada de ouvidoria pública (ex. Fala.BR/CGU), rotulada
aqui como **PROPOSTA OPERACIONAL**, não texto legal literal.

**Regra de ouro do art.11**: em nenhuma hipótese uma manifestação pode ser recusada, sob pena de
responsabilização do agente público. Nenhum estado deste workflow admite uma transição de
"rejeitada no recebimento" — a única bifurcação possível é de **mérito** (procedente/improcedente),
nunca de admissibilidade.

## Estados

`MANIFESTACAO_REGISTRADA` · `COMPROVANTE_EMITIDO` · `EM_ANALISE` ·
`INFORMACAO_SOLICITADA_AO_AGENTE` · `DECISAO_FINAL_ELABORADA` · `CIENCIA_AO_USUARIO` ·
`ENCERRADA` · `AVALIACAO_OFERECIDA` · `AVALIADA`.

## Transições e gatilhos

```mermaid
stateDiagram-v2
    [*] --> MANIFESTACAO_REGISTRADA : cidadão registra reclamação\|denúncia\|\nsugestão\|elogio\|solicitação — NUNCA recusado\nart.11 · art.2º V (taxonomia) · UC-PORTAL-016

    MANIFESTACAO_REGISTRADA --> COMPROVANTE_EMITIDO : emissão imediata de comprovante\nde recebimento — art.12 §ú, II

    COMPROVANTE_EMITIDO --> EM_ANALISE : ouvidoria recebe e analisa\nart.12 §ú, I e III

    EM_ANALISE --> INFORMACAO_SOLICITADA_AO_AGENTE : ouvidoria solicita informação\nao agente/setor de origem\nart.16 §ú (T-OUV-INFO, 20 dias)
    INFORMACAO_SOLICITADA_AO_AGENTE --> EM_ANALISE : agente responde\n(tempestivo ou após prorrogação)

    EM_ANALISE --> DECISAO_FINAL_ELABORADA : decisão administrativa final\nart.12 §ú, IV

    DECISAO_FINAL_ELABORADA --> CIENCIA_AO_USUARIO : ouvidoria encaminha decisão\nao usuário — art.16 caput\n(T-OUV-RESPOSTA, 30 dias)

    CIENCIA_AO_USUARIO --> ENCERRADA : ciência confirmada —\nart.12 §ú, V

    ENCERRADA --> AVALIACAO_OFERECIDA : convite de avaliação de\nsatisfação — art.23; mesmo\ngatilho de [WF-PORTAL-001]\nRESULTADO_DISPONIVEL→AVALIACAO_OFERECIDA
    AVALIACAO_OFERECIDA --> AVALIADA : cidadão responde à pesquisa —\nalimenta consolidação anual (art.23 §1º)\ne relatório de gestão (art.15)
    AVALIACAO_OFERECIDA --> ENCERRADA : janela de convite expira\nsem resposta — não bloqueia nada
    AVALIADA --> [*]
```

## Prazos e timers (base legal por prazo)

| Timer                 | Prazo                                                       | Gatilho                                                                           | Consequência                                                                               | Base                                              |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| T-OUV-COMPROVANTE     | imediato                                                    | manifestação registrada                                                           | comprovante de recebimento emitido                                                         | Lei 13.460/2017 art.12 §ú, II                     |
| T-OUV-INFO            | 20 dias, prorrogável 1x por igual período (teto 40 dias)    | ouvidoria solicita informação a agente público interno                            | agente responde; sem sanção automática explícita além de responsabilização geral do art.11 | Lei 13.460/2017 art.16 §ú                         |
| T-OUV-RESPOSTA        | 30 dias, prorrogável 1x por igual período (teto 60 dias)    | recebimento da manifestação                                                       | decisão administrativa final encaminhada ao usuário                                        | Lei 13.460/2017 art.16 caput                      |
| T-OUV-RELATORIO-ANUAL | anual                                                       | ano-calendário anterior                                                           | relatório de gestão da ouvidoria, publicado integralmente na internet                      | Lei 13.460/2017 art.14 II, art.15 §ú II           |
| T-AVAL-ANUAL          | mínimo anual                                                | ciclo de avaliação de satisfação                                                  | resultado publicado integralmente, incluindo ranking de reclamação                         | Lei 13.460/2017 art.23 §§1º-2º                    |
| T-LGPD-ACESSO         | imediato (simplificado) / até 15 dias (declaração completa) | requerimento de acesso a dados pessoais — canal de entrada pode ser este workflow | confirmação de existência de tratamento ou declaração completa                             | [REF-LEI-13709-2018] art.19 — ver [UC-PORTAL-018] |

A prorrogação em ambos os prazos do art.16 é **justificada** — não automática por decurso simples;
o sistema deve registrar a motivação, não apenas estender o relógio silenciosamente.

## Atores por transição

| Ator                                                    | Transições onde atua                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Cidadão / usuário do serviço                            | registra manifestação, recebe comprovante e decisão, avalia                                                              |
| Ouvidoria (DETRAN-AM)                                   | recebe, analisa, solicita informação, elabora decisão final, publica relatório anual                                     |
| Agente público / setor de origem do serviço questionado | responde à solicitação de informação da ouvidoria (T-OUV-INFO)                                                           |
| Gestor DETRAN / DPO                                     | consolida relatório anual e pesquisa de satisfação; canal de acesso a dados pessoais quando a manifestação é pedido LGPD |

## Carta de Serviços como artefato vivo (não um texto estático)

A Lei 13.460/2017 art.7º §§2º-3º exige conteúdo mínimo por serviço: serviços oferecidos,
requisitos/documentos, principais etapas, **prazo máximo de prestação**, forma de prestação, canal
de manifestação, prioridades de atendimento, tempo de espera, mecanismos de comunicação, e
mecanismos de consulta de andamento. **Achado confirmado nesta rodada**: a Carta de Serviços atual
do DETRAN-AM não publica prazo máximo por serviço nem o detalhamento do §3º — gap de conformidade
de baixo risco/alto impacto, análogo à correção já feita (steering.md D.28) para endosso cartorial e
juntada de parecer JARI.

**Proposta de correção**: a tabela "Catálogo de serviços" de [WF-PORTAL-001] já contém as colunas
serviço/domínio/nível de assinatura/workflow de destino/**prazo** — é a fonte de dados que deveria
alimentar a Carta de Serviços publicada, em vez de um texto mantido separadamente e desatualizado.
Ver `_intake/bpo-notes.md` para a proposta formal ao Owner.

## Decisões de modelagem pendentes

- **Prorrogação "justificada"** — nenhuma fonte lida define o padrão mínimo de motivação aceitável;
  proposta operacional: mesma disciplina de auditoria já usada para suspensão de prazo no RAIT
  (`_meta/steering.md` C.20) — ato motivado e registrado, nunca silencioso. Sujeito a validação de
  LEGAL antes de `approved`.
- **Integração do pedido LGPD como tipo de manifestação vs. canal próprio** — modelado aqui como
  podendo entrar por este workflow (rótulo "solicitação"), mas o roteamento interno ao DPO é
  decisão de produto ainda não fechada — ver [UC-PORTAL-018].
- **Conselhos de usuários (Lei 13.460 arts.18-22)** — órgão consultivo colegiado, não sistema de
  informação; fora de escopo deste workflow, registrado só como referência.

## Decisões

- **2026-08-24** — BPO, rodada CRAWLER→BPO (`_intake/research-dossier.md`): desenho inicial a
  partir dos arts. 9º-17 e 23 da Lei 13.460/2017, com a Carta de Serviços tratada como artefato
  vivo alimentado pela tabela de catálogo de [WF-PORTAL-001] — proposta de correção do gap de
  conformidade encaminhada ao Owner em `bpo-notes.md`.

### Decisão 2026-09-13 (steering.md H.51, H.52)

Nível de assinatura na ouvidoria: **nenhum para manifestar** (manifestação anônima admitida) e
**simples para acompanhar** a resposta. A categoria operacional "solicitação" é mantida e agrupada
com "reclamação" no relatório anual do art. 15 da Lei 13.460/2017.
