---
id: RN-DASH-171
title: Trilha de auditoria do próprio DASHBOARD — consultar é operação de tratamento, e consulta não registrada é inauditável
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-997, REF-TCEAM-MANUAL-AUDITORIA-TI]
updated: 2026-08-24
---

**Regra.** O DASHBOARD **não pratica ato de negócio** ([RN-DASH-101]), mas **pratica tratamento de
dados pessoais** — porque _consultar_ é tratamento, pela definição da própria LGPD (art. 5º, X:
tratamento é _"toda operação realizada com dados pessoais, como as que se referem a coleta, produção,
recepção, classificação, utilização, **acesso**, reprodução, transmissão, distribuição,
processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação,
modificação, comunicação, transferência, difusão ou extração"_). Consequência direta e frequentemente
ignorada: **o DASHBOARD tem trilha de auditoria própria, distinta das trilhas dos apps de origem**, e
ela registra **acessos**, não apenas alterações.

Um painel somente-leitura sem log de acesso é, do ponto de vista de proteção de dados, o **pior
componente do ecossistema**: concentra dado de todos os domínios e não deixa rastro de quem viu o quê.

**Conteúdo mínimo de cada registro de acesso:**

| Campo           | Observação                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `quem`          | identidade do usuário **e papel efetivo** no momento do acesso                                                  |
| `quando`        | data-hora com fuso, de fonte confiável                                                                          |
| `o quê`         | painel/indicador, **filtros e recortes aplicados** — o recorte é o que define a sensibilidade ([RN-DASH-161])   |
| `granularidade` | camada N0-N3 efetivamente servida ([RN-DASH-170])                                                               |
| `volume`        | número de registros retornados — um acesso que retorna 40.000 linhas não é o mesmo evento que um que retorna 12 |
| `origem`        | dispositivo/rede, quando disponível                                                                             |
| `finalidade`    | quando o acesso for a camada N2 ou superior, **finalidade declarada** pelo usuário                              |

**Base legal.**

- [REF-LEI-13709-2018] art. 37 _(verbatim)_: _"O controlador e o operador devem **manter registro das
  operações de tratamento** de dados pessoais que realizarem, especialmente quando baseado no legítimo
  interesse."_
- [REF-LEI-13709-2018] art. 46 _(verbatim)_: _"Os agentes de tratamento devem adotar **medidas de
  segurança, técnicas e administrativas** aptas a proteger os dados pessoais de **acessos não
  autorizados** e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou
  qualquer forma de tratamento inadequado ou ilícito."_
- [REF-LEI-13709-2018] art. 6º, X: **responsabilização e prestação de contas** — _"demonstração"_ das
  medidas e de sua **eficácia**. Um controle sem log não é demonstrável, logo não cumpre o inciso.
- [REF-LEI-13709-2018] art. 48: dever de **comunicar incidente** de segurança à autoridade nacional e
  ao titular — e não se detecta incidente de acesso indevido sem trilha de acesso.
- [REF-SENATRAN-997] Anexo II, i): precedente setorial de granularidade — a norma do talão eletrônico
  já exige registrar as operações com data, hora, agente, veículo, local e número do aparelho _"para
  permitir auditorias"_ ([RN-TEAT-112]). O padrão do ecossistema é rastreabilidade nominal.

**Verificação.**

1. **Log de acesso é imutável e segregado.** Quem opera o painel não administra seu log; quem
   administra a plataforma não altera registros. Trilha alterável por quem ela vigia não é trilha.
2. **A trilha do DASHBOARD é acessível ao `auditor`/DPO** ([RN-DASH-170]) — e o **acesso à própria
   trilha também é logado**. Sem isso, existe um nível de acesso invisível no sistema.
3. **Detecção de padrão anômalo**, não apenas registro: exportações fora do horário, volume atípico,
   varredura sequencial de recortes pequenos (a assinatura clássica de tentativa de reidentificação
   por composição de consultas — [RN-DASH-161], item 5), acesso a domínio fora da lotação do usuário.
   Registrar sem monitorar cumpre o art. 37 e falha o art. 46.
4. **Retenção dimensionada pelo uso probatório**, não pelo padrão do sistema. A trilha precisa
   sobreviver ao prazo do fato que ela documenta — inclusive aos relógios de 5 anos do RAIT
   ([RN-DASH-131]) e ao prazo de guarda de trilhas dos apps de origem. Retenção curta demais destrói a
   prova; longa demais acumula dado pessoal sem necessidade (art. 6º, III). A definição do prazo é
   decisão documentada.
5. **Registro de operações de tratamento (art. 37) é documento, não log.** São coisas distintas e
   ambas obrigatórias: o _log_ é o rastro técnico; o _registro de operações_ é o inventário
   documental — quais tratamentos o DASHBOARD realiza, com que finalidade, base legal, categorias de
   dado, compartilhamentos e salvaguardas. Este último precisa existir **antes** de o painel entrar em
   produção.
6. **Incidente tem procedimento** (art. 48): quem detecta, quem avalia risco, quem comunica ao
   Encarregado, prazo interno, e critério de comunicação à ANPD e ao titular.

**Controvérsia/risco.** _Severidade: média-alta._ **Não existe norma estadual específica e vinculante
de governança/auditoria de TI aplicável ao DETRAN-AM** — achado confirmado e documentado
([REF-TCEAM-MANUAL-AUDITORIA-TI]). O que há é (a) a competência **genérica** de auditoria operacional
do TCE-AM (Regimento Interno, art. 5º, VII, cuja extensão a TI é interpretativa, apoiada em
INTOSAI/ISSAI 5300) e (b) a base federal/genérica da LGPD (arts. 37, 46, 48). A **IN CGE/AM nº
001/2020** e o **Decreto AM nº 53.273/2025** (Sistema de Controle Interno, sistema "Apoena") são os
candidatos mais prováveis a norma vinculante, mas **seus textos não foram obtidos** — o portal
`cge.am.gov.br` esteve indisponível (HTTP 500 e certificado TLS expirado). Portanto: esta regra é
ancorada na LGPD, que vincula, e **não** no Manual do TCE-AM, que é material técnico interno do
Tribunal. Ver `_intake/legal-assessment.md` — é gap de pesquisa prioritário, e pode acrescentar linhas
à tabela de deveres periódicos ([RN-DASH-120]) se o Apoena impuser reporte periódico.
