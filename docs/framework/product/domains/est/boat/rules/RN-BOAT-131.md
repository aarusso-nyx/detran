---
id: RN-BOAT-131
title: Anonimização de dado de sinistro — condição da conservação estatística e limite técnico real (risco de reidentificação)
status: draft
apps: [boat, dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** A anonimização é o mecanismo que permite conservar a série histórica de sinistros
indefinidamente sem manter dado pessoal ([RN-BOAT-125]) e publicar estatística sem expor vítima
([RN-BOAT-130]). Mas o conceito legal é **exigente**: dado anonimizado é aquele cujo titular **não
possa ser identificado**, considerados meios técnicos razoáveis e disponíveis; e a proteção **cai**
se o processo puder ser revertido com esforços razoáveis. No domínio do sinistro, o risco de
reidentificação é **estruturalmente alto** — evento raro, localizado, datado e associado a um veículo
com placa —, o que torna a anonimização um problema de engenharia, não uma marcação de campo.

**Base legal.**

- [REF-LEI-13709-2018] art. 12: _"Os dados anonimizados não serão considerados dados pessoais para
  os fins desta Lei, salvo quando o processo de anonimização ao qual foram submetidos for revertido,
  utilizando exclusivamente meios próprios, ou quando, com esforços razoáveis, puder ser revertido.
  § 1º A determinação do que seja razoável deve levar em consideração fatores objetivos, tais como
  custo e tempo necessários para reverter o processo de anonimização, de acordo com as tecnologias
  disponíveis, e a utilização exclusiva de meios próprios."_
- [REF-LEI-13709-2018] art. 5º, III: _"dado anonimizado: dado relativo a titular que não possa ser
  identificado, considerando a utilização de meios técnicos razoáveis e disponíveis na ocasião de
  seu tratamento"_.
- [REF-LEI-13709-2018] art. 16, IV: conservação para _"uso exclusivo do controlador, vedado seu
  acesso por terceiro, e **desde que anonimizados os dados**"_.
- [REF-SENATRAN-PORTARIA-139-2025] art. 19: _"O acesso a dados anonimizados somente será autorizado
  caso seja possível a utilização de meios técnicos razoáveis e disponíveis na ocasião de seu
  tratamento, que garantam a não identificação do titular. Parágrafo único. **A responsabilidade
  pela anonimização dos dados** de forma a atender o disposto no caput **é da Senatran**."_

**Verificação.** Critérios mínimos para que a anonimização de um registro de sinistro seja defensável
— nenhum deles é norma; são consequência técnica do art. 12:

1. **Remover identificadores diretos não basta.** Nome, CPF e documento saem; mas placa,
   data-hora exata, coordenada precisa e destino hospitalar continuam a identificar. Anonimizar
   exige **generalizar** (data → mês; coordenada → trecho/bairro; idade → faixa) e **suprimir** o
   que não generaliza.
2. **Avaliar o conjunto, não o campo.** O princípio do art. 17, § 2º da Portaria 139/2025 —
   público/restrito depende da **conjugação** de parâmetros — vale aqui integralmente.
3. **Anonimização é irreversível por definição.** Se o órgão mantém tabela de correspondência para
   poder voltar, não há anonimização: há **pseudonimização** — que a própria LGPD define em outro
   contexto (art. 13, § 4º) e que **não** afasta o regime de dado pessoal. Chamar uma de outra é o
   erro mais comum e o mais consequente.
4. A anonimização do acervo local é **responsabilidade do DETRAN-AM** como controlador
   ([RN-BOAT-127]); o art. 19 da Portaria 139/2025 atribui a responsabilidade à SENATRAN apenas
   quanto ao acesso aos **sistemas dela**.

**Controvérsia/risco.** _Severidade: média-alta._ (a) A anonimização de dados de sinistro com
utilidade estatística preservada é problema conhecidamente difícil: quanto mais útil o dado para
análise de causas (local exato, horário, dinâmica), maior o risco de reidentificação. Não há solução
normativa; há trade-off a ser decidido e documentado. (b) Se a anonimização não for tecnicamente
alcançável para um determinado conjunto, a consequência jurídica é direta: **o dado continua
pessoal** e continua sujeito a prazo de retenção e a base legal ([RN-BOAT-123], [RN-BOAT-125]) —
não se pode "declarar" anonimizado o que não está. (c) Nenhuma norma de trânsito trata de
anonimização de registro de sinistro; a matéria vem inteira da LGPD.
