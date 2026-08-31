---
id: REF-LEI-13146-2015-acessibilidade
title: Lei nº 13.146/2015 (LBI/Estatuto da Pessoa com Deficiência) art. 63 e correlatos + Decreto nº 5.296/2004 art. 47 — acessibilidade de sítios eletrônicos governamentais
orgao: Presidência da República (textos compilados, planalto.gov.br)
status: vigente (LBI sem alteração relevante nos artigos 62-67; Decreto 5.296/2004 vigente, prazo do art. 47 já exaurido em 2004-2005)
url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm ; https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/decreto/d5296.htm'
pdf: 'REF-LEI-13146-2015.html (lei13146_plain.txt) ; REF-DECRETO-5296-2004.html (decreto5296_plain.txt)'
apps: [portal]
sources: []
updated: 2026-08-25
---

# O que este arquivo é

Item nº 4 do briefing PORTAL. Reúne os dois instrumentos normativos (lei + decreto) que obrigam a
acessibilidade digital em sítios governamentais, e distingue esse comando **vinculante** do padrão
técnico **não-vinculante** (eMAG / gov.br Design System / WCAG 2.1 AA) que operacionaliza como
cumpri-lo.

## Excertos úteis — Lei 13.146/2015 (LBI)

### Art. 63 — obrigatoriedade de acessibilidade em sítios de internet

> Art. 63. É obrigatória a acessibilidade nos sítios da internet mantidos por empresas com sede ou
> representação comercial no País ou por órgãos de governo, para uso da pessoa com deficiência,
> garantindo-lhe acesso às informações disponíveis, conforme as melhores práticas e diretrizes de
> acessibilidade adotadas internacionalmente.
> § 1º Os sítios devem conter símbolo de acessibilidade em destaque.
> § 2º Telecentros comunitários que receberem recursos públicos federais para seu custeio ou sua
> instalação e lan houses devem possuir equipamentos e instalações acessíveis.
> § 3º Os telecentros e as lan houses de que trata o § 2º deste artigo devem garantir, no mínimo,
> 10% (dez por cento) de seus computadores com recursos de acessibilidade para pessoa com
> deficiência visual [...]

**Achado direto — a obrigação é de resultado, remetida a padrão externo.** A lei não define
"melhores práticas e diretrizes de acessibilidade adotadas internacionalmente" — remete
implicitamente ao padrão técnico vigente, hoje o **WCAG 2.1 nível AA** (adotado como referência
pelo próprio governo federal no eMAG e no Design System gov.br — ver anotação abaixo). Isso
significa que, juridicamente, o comando vinculante é o art. 63 (lei), e o WCAG/eMAG/Design System
são **evidência técnica de cumprimento**, não normas autônomas com força de lei própria.

### Art. 62 — formato acessível de cobranças (correlato, menor relevância direta)

> Art. 62. É assegurado à pessoa com deficiência, mediante solicitação, o recebimento de contas,
> boletos, recibos, extratos e cobranças de tributos em formato acessível.

Aplica-se a: PORTAL — módulo de pagamento de multas/taxas (item nº 6 do briefing) deve prever
emissão de boleto/guia em formato acessível mediante solicitação.

### Art. 64 — condicionante de financiamento público

> Art. 64. A acessibilidade nos sítios da internet de que trata o art. 63 desta Lei deve ser
> observada para obtenção do financiamento de que trata o inciso III do art. 54 desta Lei.

## Excertos úteis — Decreto nº 5.296/2004

### Art. 47 — prazo (histórico) e símbolo de acessibilidade

> Art. 47. No prazo de até doze meses a contar da data de publicação deste Decreto, será
> obrigatória a acessibilidade nos portais e sítios eletrônicos da administração pública na rede
> mundial de computadores (internet), para o uso das pessoas portadoras de deficiência visual,
> garantindo-lhes o pleno acesso às informações disponíveis.
> § 1º Nos portais e sítios de grande porte, desde que seja demonstrada a inviabilidade técnica de
> se concluir os procedimentos para alcançar integralmente a acessibilidade, o prazo definido no
> caput será estendido por igual período.
> § 2º Os sítios eletrônicos acessíveis às pessoas portadoras de deficiência conterão símbolo que
> represente a acessibilidade na rede mundial de computadores (internet), a ser adotado nas
> respectivas páginas de entrada.

**Anotação de vigência.** O prazo do caput (12 meses a contar de 02/12/2004, com possível extensão
de mais 12 meses pelo §1º) está **exaurido desde 2005-2006** — a obrigação hoje é permanente e
imediatamente exigível, o prazo só tem valor histórico. O §2º (símbolo de acessibilidade na página
de entrada) é o mesmo comando do art. 63 §1º da LBI — dois instrumentos, um requisito.

### Art. 48 — condicionante de financiamento (espelha o art. 64 da LBI)

> Art. 48. Após doze meses da edição deste Decreto, a acessibilidade nos portais e sítios
> eletrônicos de interesse público na rede mundial de computadores (internet), deverá ser
> observada para obtenção do financiamento de que trata o inciso III do art. 2º.

## Anotação — o padrão técnico não-vinculante (eMAG / gov.br Design System / WCAG)

Pesquisa dirigida (WebSearch, 2026-08-25) confirma: o **eMAG (Modelo de Acessibilidade em Governo
Eletrônico)**, hoje na versão 3.1, foi **institucionalizado pela Portaria nº 3, de 07/05/2007**, do
então Comitê Executivo do Governo Eletrônico, como referência **obrigatória no âmbito do SISP**
(Sistema de Administração dos Recursos de Tecnologia da Informação do Poder Executivo federal) —
ou seja, é vinculante para órgãos **federais**, mas não automaticamente para o DETRAN-AM (autarquia
estadual, fora do SISP federal). O eMAG é construído sobre o **WCAG 2.0/2.1** do W3C. O **gov.br
Design System** ("Padrão Digital de Governo") é um conjunto de diretrizes de identidade visual e
usabilidade, também federal, sem força normativa própria fora da esfera federal.

**Recomendação para o PORTAL:** tratar WCAG 2.1 AA + eMAG como **padrão técnico de referência a
adotar por boa prática e por ser o critério objetivo mais defensável para provar cumprimento do
art. 63 da LBI e do art. 47 do Decreto 5.296/2004** perante fiscalização/Ministério Público — não
como norma diretamente vinculante ao DETRAN-AM por si mesma. É o mesmo tratamento dado ao Design
System: padrão técnico, não instrumento normativo autônomo (conforme a instrução do briefing desta
rodada).

## Índice reverso — artigo → aplicação

| Artigo                                                    | Aplica-se a                                                                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| LBI art. 63, §1º                                          | Obrigação vinculante de acessibilidade em sítios + símbolo de acessibilidade — checklist de conformidade PORTAL |
| LBI art. 62                                               | Formato acessível de boleto/guia de pagamento (item 6 do briefing PORTAL)                                       |
| Decreto 5.296/2004 art. 47, §2º                           | Mesmo comando de símbolo de acessibilidade, redação de 2004 — reforça a obrigação da LBI                        |
| (não-normativo) eMAG / gov.br Design System / WCAG 2.1 AA | Padrão técnico de referência para prova de cumprimento — não vinculante ao DETRAN-AM por si só                  |
