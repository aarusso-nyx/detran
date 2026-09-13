---
id: REF-DETRANAM-PORTARIA-NORMATIVA-015-2026
title: Portaria Normativa nº 015/2026-DETRAN/AM/DP — institui a Comissão Setorial de Avaliação de Documentos (CSAD) e atribui a ela o Plano de Classificação e a Tabela de Temporalidade das atividades-fim
orgao: DETRAN-AM
status: vigente (assinada 08/07/2026 por Marcos Janio da Silva Costa, Diretor-Presidente; edoc 31AD.C1B0.A89F.024B)
url: https://www.detran.am.gov.br/wp-content/uploads/2026/07/PORTARIA-NORMATIVA-No-015.pdf
pdf: REF-DETRANAM-PORTARIA-NORMATIVA-015-2026.pdf (original, 3 páginas, texto nativo; .txt via pdftotext -layout)
apps: [boat, rait, teat, pec]
sources: [REF-LEI-13709-2018]
updated: 2026-09-13
---

# O que este arquivo é

O ato que diz **quem fixa os prazos de guarda** dos documentos do DETRAN-AM (DT-049): a CSAD,
com aprovação do Arquivo Público do Estado do Amazonas (APEAM), sob o SAGED-AM (Decreto estadual
37.899/2017). Confirma que **não existe ainda** tabela de temporalidade das atividades-fim do
órgão (art. 3º, II manda elaborá-la; art. 3º, III prevê Plano de Destinação excepcional "quando
não houver PCD e TTD relativos às atividades-fim").

# Excertos verbatim

> Art. 3º Compete à CSAD/DETRAN-AM: I – Promover a divulgação e orientar a aplicação do Plano de
> Classificação de Documentos (PCD) e da Tabela de Temporalidade de Documentos (TTD) relativos
> às atividades-fim aprovados pelo Arquivo Público do Estado do Amazonas (APEAM); II – Elaborar
> e divulgar o Plano de Classificação de Documentos e a Tabela de Temporalidade de Documentos de
> Arquivo relativos às atividades-fim do DETRAN-AM, bem como promover sua atualização, quando
> necessário, revisando prazos de guarda e destinação final e encaminhando-os para aprovação do
> APEAM; III – Elaborar, excepcionalmente, Plano de Destinação de Documentos (PDD), quando os
> conjuntos documentais não constarem no PCD e na TTD relativos às atividades-fim ou quando não
> houver PCD e TTD relativos às atividades-fim; IV – Aplicar os procedimentos para eliminação de
> documentos de arquivo no âmbito do DETRAN-AM, observada a legislação vigente;

> Art. 4º (…) § 1º A CSAD contará com um presidente, cinco membros titulares e respectivos
> suplentes. § 2º Poderão integrar a Comissão representantes das seguintes unidades
> organizacionais: I – DAF; II – Diretoria Técnica; III – GECAR; IV – GGP; V – GTI; VI – Gerência
> de Veículos; e VII – AJUR. § 3º O mandato dos membros da CSAD será de dois anos (…)

# Leitura para o sistema

- **DT-049 muda de natureza**: deixa de ser "nenhuma norma fixa" e passa a ser "o órgão tem a
  comissão e o dever de fixar; a tabela ainda não existe". A pergunta ao Owner vira: pedir à CSAD
  um **Plano de Destinação (art. 3º, III)** para BAT, dado de saúde de vítima, bodycam e autos
  encerrados, com os prazos de referência do benchmark DETRAN-DF ([REF-DETRANDF-INSTRUCAO-146-2023-TTD]).
- Até lá, `est.retention.*`, `rait.retention.*` e `teat.bodycam.retention_days` seguem
  `source_pending`, com **destinatário institucional nomeado** (CSAD, via GTI/AJUR que já a
  integram).
- A eliminação exige listagem e edital de ciência (art. 3º, V–VI): o comando de anonimização/
  eliminação do RAIT (`/arquivo/retencao`, OD-018) precisa gerar a **listagem de eliminação** como
  saída, não apenas executar.

Aplica-se a: [RN-BOAT-125], [RN-RAIT-136], [RN-TEAT-141], [RN-TEAT-142], DT-049, OD-018, OD-B02,
OD-T08.
