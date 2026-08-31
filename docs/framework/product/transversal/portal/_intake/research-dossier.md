---
id: RESEARCH-DOSSIER-PORTAL
title: Dossiê de pesquisa CRAWLER — PORTAL (rodada transversal, 2026-08-25)
status: draft
apps: [portal]
sources:
  [
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
    REF-LEI-13146-2015-acessibilidade,
    REF-CONTRAN-809-2020,
    REF-CONTRAN-918,
    REF-LEI-14063-2020,
    REF-DETRANAM-SERVICOS,
  ]
updated: 2026-08-25
---

# Dossiê de pesquisa — PORTAL

Rodada CRAWLER da dupla transversal (PORTAL + DASHBOARD, corpus compartilhado — ver o dossiê
irmão em `transversal/dashboard/_intake/research-dossier.md`). Cobre os 7 alvos do briefing na
ordem de prioridade dada. Base já capturada e reutilizada sem novo download: [REF-LEI-13709-2018]
(LGPD), [REF-LEI-14063-2020] (assinatura eletrônica), [REF-MP-2200-2-2001] (ICP-Brasil),
[REF-LEI-13614-2018] (Pnatrans), [REF-LEI-9784-1999], [REF-CONTRAN-900]/[918]/[931]/[REF-CONTRAN-357-2010],
`refs/ctb/*`, `refs/detran-am/*`, [REF-BENCH-ESTADOS].

## 1. Lei 14.129/2021 (Governo Digital) — espinha dorsal estatutária

**Achado central: CONFIRMADO E ELEVADO.** O art. 3º, XIII ("vedação de exigência de prova de fato
já comprovado pela apresentação de documento ou de informação válida") é a formulação legal do
princípio do "uso único" que hoje só existe, no corpus RAIT, em nível de resolução CONTRAN (base
indireta de [RN-RAIT-003]). Isso é lei federal ordinária — potencialmente eleva [RN-RAIT-003] de
"boa prática" para "dever estatutário", **condicionado** a um requisito de ativação que este
briefing não antecipava.

**Vigência/aplicabilidade — ressalva crítica encontrada nesta rodada.** O art. 2º, III da própria
lei só a estende a Estados/DF/Municípios **"desde que adotem os comandos desta Lei por meio de
atos normativos próprios"** (§ 2º repete a condição). Esta pesquisa **não localizou** decreto ou
lei estadual do Amazonas formalizando essa adesão. Enquanto não confirmada, a Lei 14.129/2021 vale
para o DETRAN-AM como **parâmetro fortemente recomendável e alinhado ao art. 37 CF/88**, não como
obrigação estatutária automática. **É o item de validação jurídica de maior prioridade desta
rodada** — decide se [RN-RAIT-003] pode subir de nível de confiança.

Achados adicionais de alto valor (verbatim completo em [REF-LEI-14129-2021]):

- **Arts. 20-22**: checklist funcional quase literal do PORTAL — identificação do serviço e
  etapas, solicitação digital, agendamento, acompanhamento, avaliação de satisfação, perfil,
  notificação, **pagamento digital**, nível de segurança compatível com criticidade, acesso a
  info de tratamento de dados (LGPD), **ouvidoria**. Painel de monitoramento (art. 22) com
  volume/tempo médio/satisfação por serviço — âncora legal do módulo espelho no DASHBOARD.
- **Art. 26**: presunção de autenticidade de documento assinado eletronicamente — reforça
  [REF-LEI-14063-2020] para o fluxo de upload do PORTAL.
- **Art. 27**: direitos do usuário na prestação digital — gratuidade de acesso, atendimento
  conforme Carta de Serviços, protocolo sempre emitido, canal preferencial de comunicação.
- **Art. 28**: CPF como identificador único suficiente em toda a administração — convergente com
  o art. 10-A da Lei 13.460/2017 (item 2, abaixo).

## 2. Lei 13.460/2017 (direitos do usuário de serviços públicos)

**Achado central: a Carta de Serviços do DETRAN-AM está incompleta face ao conteúdo mínimo
obrigatório do art. 7º.** Auditoria rápida da página `detran.am.gov.br/servicos/` (WebFetch,
2026-08-25) confirma catálogo extenso de serviços (100+), pesquisa de satisfação e ouvidoria
presentes — mas **sem prazo máximo de prestação por serviço** (art. 7º § 2º, IV) nem detalhamento
de tempo de espera/mecanismos de consulta de andamento por serviço (§ 3º). Mesmo padrão de
"omissão de conteúdo obrigatório" já achado para outros pontos de [REF-DETRANAM-SERVICOS]
(endosso cartorial, parecer JARI — já corrigidos por decisão de steering C.28). Recomenda-se novo
item de conformidade de baixo risco/alto impacto no mesmo espírito.

Achados que confirmam artefatos existentes:

- **Art. 5º, IX**: "autenticação de documentos pelo próprio agente público [...], vedada a
  exigência de reconhecimento de firma, salvo em caso de dúvida de autenticidade" — confirma o
  padrão de upload sem reconhecimento de firma já assumido pelo PORTAL (ver ux-notes.md, wizard
  de indicação de condutor).
- **Art. 10-A** (incluído pela Lei 14.129/2021): CPF como identificador suficiente para acesso a
  qualquer serviço público federal/estadual/municipal.

Achado de alto valor para o DASHBOARD (não repetido aqui — ver dossiê irmão): arts. 15-16
(relatório anual de ouvidoria + relógio de resposta 30+30 dias) e art. 23 (pesquisa de satisfação
anual + ranking público).

## 3. Identidade digital gov.br — qual nível cada ato exige (a pergunta central do briefing)

**Correção de premissa importante.** O Decreto 10.543/2020 **não** define os níveis bronze/prata/
ouro da conta gov.br — define os níveis de **assinatura eletrônica por ato** (simples/avançada/
qualificada, espelhando [REF-LEI-14063-2020]). Os níveis bronze/prata/ouro são uma classificação
**operacional da própria Plataforma gov.br**, publicada institucionalmente
(`gov.br/governodigital/.../niveis-da-conta-govbr`) **sem indicar um Decreto/Portaria/IN específico
como fundamento formal** — tratamento equivalente ao dado ao gov.br Design System: padrão técnico,
não instrumento normativo autônomo.

**Resposta à pergunta do briefing — matriz "ato → nível mínimo exigido":**

| Ato do PORTAL                  | Nível de assinatura mínimo (Decreto 10.543/2020, art. 4º)                                                                                                          | Nível de conta gov.br tipicamente necessário (achado operacional, não normativo)         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Consultar multas/pontuação/CNH | **Simples** (art. 4º, I, "b" — acesso a sítio com info de interesse particular)                                                                                    | Bronze é suficiente para a maioria das consultas básicas                                 |
| Aderir ao SNE                  | Simples a Avançada (autocadastro, art. 4º, II, "d")                                                                                                                | Prata (validação de identidade reforçada recomendável, dado o efeito jurídico da adesão) |
| Indicar condutor               | **Avançada** (declaração que constitui reconhecimento de fato/assunção de obrigação, art. 4º, II, "f")                                                             | Prata ou Ouro (assinatura de documento com efeito jurídico direto sobre terceiro)        |
| Protocolar defesa/recurso      | **Avançada, expressamente** (art. 4º, II, "h" — "apresentação de defesa e interposição de recursos administrativos")                                               | Prata                                                                                    |
| Pagar (multas/taxas)           | Simples para a solicitação de guia; nível de segurança da transação em si é regido por padrões do meio de pagamento (SPB/PIX/cartão), fora do escopo deste Decreto | Bronze/Prata a depender do canal de pagamento                                            |

**Confiança da resposta: média-alta.** A coluna de assinatura eletrônica é normativa e verbatim
(Decreto 10.543/2020 art. 4º, incisos I-III). A coluna de nível de conta gov.br é **inferência
razoável, não normativa** — nenhuma norma localizada cruza explicitamente "nível de conta" com
"tipo de ato do trânsito". Recomenda-se validação com LEGAL antes de travar essa matriz em UX.

Achado complementar: [REF-DECRETO-8936-2016] (Plataforma gov.br) confirma a arquitetura de conta
única e lista, desde 2016, o mesmo checklist funcional que a Lei 14.129/2021 depois detalha —
inclui "ferramenta de meios de pagamentos digitais" (art. 3º, VIII) e "mecanismo para assinaturas
eletrônicas" (art. 3º, IX, ponte direta para o Decreto 10.543/2020).

## 4. Acessibilidade

**Achado direto, LBI art. 63 + Decreto 5.296/2004 art. 47 — obrigação vinculante confirmada.**
Ambos exigem acessibilidade de sítios governamentais "conforme as melhores práticas e diretrizes
[...] adotadas internacionalmente" — comando de resultado, sem definir o padrão técnico. O padrão
técnico de referência (eMAG 3.1, baseado em WCAG 2.0/2.1; gov.br Design System) é
**institucionalizado por Portaria de 2007 como obrigatório apenas no âmbito do SISP federal** —
não vincula automaticamente o DETRAN-AM (autarquia estadual). Recomendação: adotar WCAG 2.1 AA +
eMAG como critério técnico de conformidade por boa prática defensável, não como norma autônoma
vinculante. Ver texto completo em [REF-LEI-13146-2015-acessibilidade].

Achado correlato: art. 62 da LBI — direito a receber contas/boletos/cobranças em formato
acessível, mediante solicitação — aplica-se diretamente ao módulo de pagamento (item 6).

## 5. CNH digital / CDT / documentos digitais

**Achado de alto valor e inesperado: legislação muito recente (2026).** O CTB art. 159 tem
**redação dada pela Lei nº 15.428/2026** — mais recente que a maioria das fontes secundárias
consultadas. A redação de 2026 estabelece **paridade jurídica plena** entre CNH física e digital
("poderá ser emitida em meio físico ou digital, a critério do candidato ou do condutor" — inciso
I; "terá fé pública e equivalerá a documento de identidade" — inciso III), indo além da mera
dispensa de porte já trazida pela Lei 14.071/2020 (§ 1º-A).

**CRLV-e**: Res. CONTRAN 809/2020, texto integral obtido e lido (PDF original do DOU). Institui o
CRLV-e (unifica CRV+CLA) e a ATPV-e (transferência digital de propriedade). Achado de acoplamento
funcional: **o CRLV-e só é emitido após quitação de débitos** (art. 4º) — liga diretamente o item
5 (documentos digitais) ao item 6 (pagamento): no PORTAL, a tela de emissão do CRLV-e depende
funcionalmente do módulo de pagamento estar íntegro.

**Achado de pesquisa (negativo, documentado).** Não foi localizada, nesta rodada, uma resolução ou
portaria específica e autônoma dedicada à "Carteira Digital de Trânsito"/app "CNH do Brasil"
enquanto sistema técnico — fontes de imprensa atribuem a base a "Res. CONTRAN 809/2020", mas o
texto integral lido trata exclusivamente de CRLV-e/ATPV-e. É provável confusão de fontes
secundárias. Há indícios (não confirmados textualmente) de atos mais recentes — Res. CONTRAN
1.020/2025 e 1.027/2026 — citados por imprensa especializada como relacionados a documentos
unificados/CNH; recomenda-se busca dirigida em rodada futura.

## 6. Pagamento de multas ao cidadão

[REF-CONTRAN-918] arts. 20-27 (já capturado, reconferido nesta rodada): desconto de 80%/60%
conforme momento do pagamento (arts. 20-21), juros SELIC pós-vencimento (arts. 22-23), e
**operação de cartão de crédito/débito em parcelas mensais**, conforme o plano comercial da
credenciadora, sem teto normativo de parcelas, com liberação imediata do veículo e emissão do
CRLV-e (art. 27, §§1º-15) — inclusive dever de **relatório mensal ao órgão máximo**
sobre valores arrecadados por cartão (art. 27 § 6º), com possibilidade de suspensão da autorização
por falta de prestação de contas (§ 7º). Pesquisa dirigida por instrumento específico de PIX não
localizou resolução CONTRAN nomeando PIX — o texto normativo fala genericamente em "cartões de
débito ou crédito" e "instituições integrantes do Sistema de Pagamentos Brasileiro (SPB)" (art. 24
§3º), o que **tecnicamente comporta PIX** (que é parte do SPB) mas não o nomeia. **Gap de
nomeação**, não necessariamente gap de cobertura jurídica.

## 7. DETRAN-AM canais digitais

Confirmado (WebFetch + WebSearch, 2026-08-25): DETRAN-AM opera **Protocolo Virtual** (login por
certificado digital ou cadastro Nota Fiscal Amazonense), **Detran Digital** (`digital.detran.am.gov.br`,
com consulta de situação de protocolo), **Portal de Serviços para Empresas**
(`empresas.detran.am.gov.br`), e app oficial (Android/iOS) com login gov.br para consulta de multas
e agendamento. Carta de Serviços publicada, mas com o gap de conteúdo já registrado no item 2.

## Mapa CONFIRMA / ESTENDE contra os artefatos PORTAL existentes

| Artefato existente                                                    | Achado desta rodada                                                                                                  | Efeito                                                                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [RN-RAIT-003] (uso único, base indireta)                              | Lei 14.129/2021 art. 3º, XIII formaliza o princípio em lei federal                                                   | **ESTENDE** — eleva de prática recomendada a possível dever estatutário, **condicionado** à adesão formal do AM (não confirmada) |
| UC-PORTAL-004 (indicação de condutor)                                 | Decreto 10.543/2020 art. 4º, II, "f" classifica esse ato como exigindo assinatura avançada                           | **CONFIRMA e detalha** — parâmetro técnico de nível de assinatura para o fluxo já desenhado                                      |
| UC-PORTAL-001/002/003 (defesa/recursos)                               | Decreto 10.543/2020 art. 4º, II, "h" nomeia expressamente "defesa e recurso administrativo" como assinatura avançada | **CONFIRMA** o nível já implícito no wizard de defesa/recurso (ux-notes.md)                                                      |
| ux-notes.md, wizard de indicação (upload sem reconhecimento de firma) | Lei 13.460/2017 art. 5º, IX confirma a vedação de exigir reconhecimento de firma salvo dúvida                        | **CONFIRMA**                                                                                                                     |
| APP-PORTAL "primeira entrega" (trilha de recurso)                     | Lei 14.129/2021 arts. 20-22 fornecem checklist funcional quase idêntico ao já modelado                               | **CONFIRMA** desenho geral, adiciona exigência explícita de painel de monitoramento (dashboard-facing)                           |
| [REF-DETRANAM-SERVICOS]                                               | Lei 13.460/2017 art. 7º revela gap de prazo/detalhamento por serviço na Carta                                        | **ESTENDE** — novo achado de conformidade, não coberto pela captura original                                                     |

## Mapa de escopo greenfield — serviços que o PORTAL deve eventualmente cobrir

Com base nos alvos desta rodada e na Carta de Serviços do DETRAN-AM:

| Domínio de serviço                                | Status no PORTAL hoje                                 | Base legal já capturada                                                     |
| ------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Trilha de apelação de multas (defesa/JARI/CETRAN) | **Coberto** (JRN-PORTAL-001..003, UC-PORTAL-001..009) | REF-CTB-280-290, REF-CONTRAN-900/918/931                                    |
| Consulta de multas/pontuação/CNH                  | Greenfield                                            | Lei 14.129/2021 arts. 20-21 (checklist funcional); CTB art. 159 (CNH-e)     |
| Adesão ao SNE                                     | Greenfield                                            | REF-CONTRAN-931 (já capturado)                                              |
| Indicação de condutor (fora do fluxo de defesa)   | Greenfield                                            | REF-CONTRAN-918 art. 5º; Decreto 10.543/2020 art. 4º, II "f"                |
| Acesso ao BAT de sinistro                         | Greenfield                                            | REF-CONTRAN-808-2020 (BOAT); LGPD art. 13 (dado de saúde)                   |
| Resultado de exame de aptidão (PEC)               | Greenfield                                            | REF-CONTRAN-927-2022, REF-LEI-14063-2020 (PEC, já capturado)                |
| Pagamento (multas/taxas/serviços)                 | Greenfield                                            | REF-CONTRAN-918 arts. 20-27; Res. 809/2020 art. 4º (pré-condição do CRLV-e) |
| Identidade digital (onboarding gov.br)            | Greenfield, transversal a todos                       | Decreto 8.936/2016; Decreto 10.543/2020                                     |
| Emissão de CRLV-e / ATPV-e                        | Greenfield                                            | REF-CONTRAN-809-2020 (novo, esta rodada)                                    |

## Gaps explícitos desta rodada

1. **Adesão formal do Estado do Amazonas à Lei 14.129/2021** (art. 2º, III) — não localizada.
   Condiciona toda a elevação estatutária do item 1. **Prioridade máxima de validação jurídica.**
2. **Matriz "ato → nível de conta gov.br" (bronze/prata/ouro)** — inferência razoável, não
   normativa. Nenhuma norma cruza esse eixo com atos específicos de trânsito.
3. **Instrumento técnico específico da Carteira Digital de Trânsito/app "CNH do Brasil"** — não
   localizado; possível confusão de fonte secundária com Res. CONTRAN 809/2020 (que é sobre
   CRLV-e). Res. CONTRAN 1.020/2025 e 1.027/2026 são pistas não confirmadas.
4. **Nomeação explícita de PIX em norma CONTRAN de pagamento de multas** — não localizada; a
   cobertura via "SPB" é tecnicamente ampla o suficiente, mas sem nomeação expressa.
5. **Conteúdo obrigatório ausente na Carta de Serviços do DETRAN-AM** (prazo máximo por serviço,
   Lei 13.460/2017 art. 7º § 2º, IV) — achado de conformidade, recomenda-se ação de baixo
   risco/alto impacto análoga à decisão de steering C.28.

## Handoff — LEGAL

- Validar se o Amazonas aderiu formalmente à Lei 14.129/2021 (decreto ou lei estadual). Sem essa
  confirmação, tratar os arts. 3º/20-28 como "melhor prática fortemente recomendada", não como
  "dever estatutário direto" em qualquer RN que vier a citá-los.
- Confirmar a matriz "ato → nível de assinatura eletrônica" (item 3) com um jurista antes de
  travá-la em UX — é inferência, não trecho normativo único.
- Avaliar se a Lei 15.428/2026 (nova redação do CTB art. 159) tem impacto em outros artefatos do
  corpus RAIT/PORTAL que citam a CNH (ex.: identificação do condutor) — texto muito recente, pode
  não ter sido considerado em análises anteriores.

## Handoff — BPO

- Priorizar correção do conteúdo da Carta de Serviços do DETRAN-AM (prazo máximo por serviço) como
  ação de conformidade de baixo risco/alto impacto, no mesmo padrão da decisão C.28 do steering.
- Confirmar com o DETRAN-AM se o app oficial hoje ("Detran Digital"/CDT) cobre CNH digital e
  CRLV-e, e se há integração com a Plataforma gov.br para reaproveitar a conta única (evitar
  cadastro paralelo no PORTAL).

## Handoff — UX

- Usar o checklist funcional dos arts. 20-21 da Lei 14.129/2021 como base de aceitação para os
  UCs greenfield (consulta, adesão, indicação de condutor fora do fluxo de defesa, pagamento).
- Tratar o CRLV-e como "documento condicionado" na UX: a tela de emissão deve refletir
  explicitamente o estado de quitação de débitos (Res. 809/2020 art. 4º) antes de permitir a
  emissão — não apenas mostrar erro genérico se bloqueado.
- Formato acessível de boleto/guia (LBI art. 62) deve estar disponível por solicitação explícita
  no módulo de pagamento, não apenas como padrão de exportação PDF comum.
