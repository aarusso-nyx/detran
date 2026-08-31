---
id: REF-CONTRAN-927-2022
title: Resolução CONTRAN nº 927, de 28/03/2022 — exame de aptidão física e mental, avaliação psicológica e credenciamento de entidades/profissionais (arts. 147 e 148 do CTB)
orgao: CONTRAN (DOU 01/04/2022, ed. 63, seção 1, p. 113)
status: vigente (em vigor desde 01/04/2022; revoga expressamente as Res. 425/2012, 474/2014 e 500/2014 — art. 31)
url: 'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao9272022.pdf'
pdf: REF-CONTRAN-927-2022.pdf (+ REF-CONTRAN-927-2022.txt — texto integral via pdftotext da cópia do DOU/in.gov.br)
apps: [pec]
sources: []
updated: 2026-08-25
---

# O que este arquivo é

**A âncora mestra do domínio `ch/pec`.** Citada repetidamente em [pec:docs/framework/pec/archive-authoritative-sources.md]
como "MÓDULO 03: PERÍCIA MÉDICA — Res. CONTRAN 927/2022" e "MÓDULO 04: AVALIAÇÃO PSICOLÓGICA —
Res. 927/22 + CFP 01/2019", mas **nunca citada com excerto de artigo** em nenhum artefato do KB
até esta rodada — era o item nº 1 do backlog de pesquisa legal de `ch/pec/_intake/proposals.md`.
Regula tudo o que o PEC modela como exame médico + avaliação psicológica: procedimentos,
resultados, junta médica/psicológica, recurso ao CETRAN/CONTRANDIFE, credenciamento de clínicas e
profissionais, fiscalização. Texto integral capturado (32 artigos, 7 páginas) — não há corte.

**Achado estrutural de maior impacto**: os arts. 12-15 modelam a **composição, prazos e
instância recursal da junta médica/psicológica** com riqueza normativa que [WF-PEC-002] declara
ausente do sistema PEC ("Composição da junta — não modelada"). Fecha parcialmente esse gap: a
composição normativa existe e é federal — o PEC apenas não a implementou.

## Excertos úteis

### Art. 8º — resultados do exame de aptidão física e mental

> Art. 8º No exame de aptidão física e mental, o candidato será considerado pelo médico perito
> examinador de trânsito como: I - apto - quando não houver contraindicação para a condução de
> veículo automotor na categoria pretendida; II - apto com restrições - quando houver necessidade
> de registro na CNH de qualquer restrição referente ao condutor ou adaptação veicular; III -
> inapto temporário - quando o motivo da reprovação para a condução de veículo automotor na
> categoria pretendida for passível de tratamento ou correção; ou IV - inapto - quando o motivo da
> reprovação para a condução de veículo automotor na categoria pretendida for irreversível, não
> havendo possibilidade de tratamento ou correção.
>
> Parágrafo único. No resultado "apto com restrições" constarão da CNH as observações codificadas
> no Anexo XV.

**Anotação (contradiz nomenclatura do PEC).** A taxonomia legal é **apto / apto com restrições /
inapto temporário / inapto** — quatro valores, sem nenhum deles chamado "CONDICIONADO". [RN-PEC-006]
usa `medical_result = 'CONDICIONADO'` como o valor que dispara a exigência de restrição de CNH; a
tradução correta ao vocabulário legal é **"apto com restrições"** (não "condicionado", termo que
não aparece nesta Resolução nem na Portaria DETRAN-AM 005/2021 — ver abaixo). Risco de mapeamento
incorreto entre o schema do PEC e a nomenclatura oficial que constará da CNH. Aplica-se a:
[RN-PEC-006].

### Art. 9º — resultados da avaliação psicológica

> Art. 9º Na avaliação psicológica, o candidato será considerado pelo psicólogo perito examinador
> de trânsito como: I - apto [...]; II - inapto temporário [...], porém passível de adequação; ou
> III - inapto [...].
>
> § 1º O resultado inapto temporário constará na planilha RENACH e consignará prazo de inaptidão,
> findo o qual deverá o candidato ser submetido a nova avaliação psicológica.
>
> § 2º Quando apresentar distúrbios ou comprometimentos psicológicos que estejam temporariamente
> sob controle, o candidato será considerado apto, com diminuição do prazo de validade da
> avaliação, que constará na planilha RENACH.
>
> § 3º O resultado da avaliação psicológica deverá ser disponibilizado pelo psicólogo no prazo de
> dois dias úteis.

**Anotação (extend).** O §3º é o **único prazo numérico de disponibilização de resultado**
localizado nesta Resolução — dois dias úteis — e fecha uma lacuna que [WF-PEC-001] deixava em
aberto ("nenhum prazo/SLA numérico foi encontrado"). Note-se que esse prazo é da avaliação
psicológica; nenhum prazo equivalente foi localizado para o exame médico. Aplica-se a: [WF-PEC-001],
[RN-PEC-006].

### Art. 10 — responsabilidade e bloqueio de cadastro

> Art. 10. A realização e o resultado do exame de aptidão física e mental e da avaliação
> psicológica são, respectivamente, de exclusiva responsabilidade do médico perito examinador de
> trânsito e do psicólogo perito examinador de trânsito.
>
> § 1º Todos os documentos utilizados [...] deverão ser arquivados conforme determinação dos
> Conselhos Federais de Medicina e Psicologia.
>
> § 2º Na hipótese de inaptidão temporária ou inaptidão, o perito examinador de trânsito deverá
> comunicar esse resultado aos setores médicos e psicológicos do órgão [...], para imediato
> bloqueio do cadastro nacional, competindo a esse órgão o devido desbloqueio no vencimento do
> prazo.

**Anotação.** O §1º remete o prazo de arquivamento aos Conselhos Federais (CFM/CFP), não fixa um
número aqui — ver [REF-LEI-13787-2018] (20 anos) e [REF-DETRANAM-PORTARIA-005-2021] (5 anos, regra
estadual mais restritiva para a entidade credenciada) para os prazos efetivamente localizados.

### Capítulo III — Instauração de Junta Médica e Psicológica e recurso ao CETRAN/CONTRANDIFE (arts. 12-15)

> Art. 12. Independentemente do resultado do exame de aptidão física e mental e da avaliação
> psicológica, o candidato poderá requerer, **no prazo de trinta dias**, contados do seu
> conhecimento, a instauração de Junta Médica e/ou Psicológica ao órgão ou entidade executivo de
> trânsito do Estado ou do Distrito Federal, para reavaliação do resultado.
>
> § 1º A revisão do exame de aptidão física e mental ocorrerá por meio de instauração de **Junta
> Médica**, pelo órgão [...], e será **constituída por três profissionais médicos** peritos
> examinadores de trânsito ou especialistas em medicina de tráfego.
>
> § 2º A revisão da avaliação psicológica ocorrerá por meio de instauração de **Junta Psicológica**,
> [...] e será **constituída por três psicólogos** peritos examinadores de trânsito ou especialistas
> em psicologia de trânsito.
>
> Art. 13. Mantido o resultado de inaptidão permanente pela Junta Médica ou Psicológica caberá, **no
> prazo de trinta dias**, contados a partir do conhecimento do resultado da revisão, **recurso ao
> Conselho Estadual de Trânsito (CETRAN)** ou ao Conselho de Trânsito do Distrito Federal
> (CONTRANDIFE).
>
> Art. 14. O requerimento de instauração de Junta [...] e o recurso dirigido ao CETRAN [...]
> deverão ser apresentados no órgão [...] onde residir ou estiver domiciliado o interessado.
>
> § 1º O órgão [...] deverá, **no prazo de quinze dias úteis**, contados do recebimento do
> requerimento, designar Junta Médica ou Psicológica.
>
> § 2º Em se tratando de recurso, **o prazo para remessa dos documentos ao CETRAN ou ao
> CONTRANDIFE é de vinte dias úteis**, contados da data do seu recebimento.
>
> § 3º As Juntas Médicas ou Psicológicas deverão proferir o resultado **no prazo de trinta dias**,
> contados da data de sua designação.
>
> Art. 15. Para o julgamento de recurso, o Conselho de Trânsito do Estado [...] deverá designar
> **Junta Especial de Saúde**.
>
> Parágrafo único. "A Junta Especial de Saúde" deverá ser constituída por, **no mínimo, três
> médicos, sendo dois especialistas em Medicina de Tráfego**, ou, no mínimo, **três psicólogos,
> sendo dois especialistas em psicologia do trânsito**, quando for o caso.

**Anotação (extend de alto valor — resolve item de research debt de `_intake/proposals.md`).**
Este é o "regimento e composição oficial da junta médica de trânsito e do CETRAN aplicável ao
processo de habilitação" que o `proposals.md` marcava como "não encontrado em nenhum documento do
PEC". A norma federal:

1. Define a **composição** (3 profissionais na Junta de 1ª instância; mínimo 3, com 2
   especialistas, na Junta Especial de Saúde de 2ª instância/CETRAN) — o PEC modela `JUNTA` como
   papel RBAC monolítico sem membros individuais, o que é uma lacuna de **implementação** frente a
   uma exigência normativa **explícita**, não apenas um vazio documental.
2. Define **quatro prazos** numéricos ausentes de todo o corpus PEC: 30 dias (requerer junta), 15
   dias úteis (designar junta), 30 dias (junta decidir), 30 dias (recorrer ao CETRAN) + 20 dias
   úteis (remessa de documentos ao CETRAN).
3. Confirma **CETRAN/CONTRANDIFE como a instância recursal formal** sobre a decisão da Junta —
   exatamente como [WF-PEC-002] já descreve o papel `CETRAN`, mas agora com base legal explícita e
   prazo de 30 dias, que o workflow atual não modela (a flag `escalated_to_cetran` não tem prazo
   nem estado próprio).
4. Introduz uma **terceira instância não modelada em absolutamente nada do PEC**: a "Junta
   Especial de Saúde" que o CETRAN "deverá designar" para julgar o recurso — o PEC parece tratar
   `CETRAN` como o decisor final (reforço de assinatura na mesma linha de `pec.junta_decisions`),
   quando a norma descreve um órgão colegiado distinto e novo composto por médicos/psicólogos, não
   pelo colegiado administrativo do CETRAN em si. É uma divergência relevante de modelagem que
   [WF-PEC-002] deveria registrar como "Decisão de modelagem pendente".
   Aplica-se a: [WF-PEC-002], [UC-PEC-004], [UC-PEC-005].

### Capítulo IV — Credenciamento e instalações (arts. 16-24, seleção)

> Art. 16. As entidades, públicas ou privadas, serão credenciadas pelo órgão [...] executivo de
> trânsito do Estado [...]. [...] § 2º O **prazo de vigência do credenciamento será de um ano**,
> podendo ser renovado sucessivamente [...]. § 3º A cada **dois anos**, as entidades credenciadas
> [...] deverão comprovar o cumprimento do disposto nos arts. 17 a 24 [...].
>
> Art. 19. [...] II - O médico deve ter Título de Especialista em Medicina de Tráfego,
> reconhecido pelo Conselho Federal de Medicina (CFM), ou ter concluído o Programa de Residência
> em Medicina de Tráfego; e III - O psicólogo deve ter Título de Especialista em Psicologia do
> Trânsito, reconhecido pelo CFP. § 1º Será assegurado ao médico e psicólogo já credenciados na
> data de entrada em vigor desta Resolução o direito de continuar a exercer a função de perito
> examinador **até 12 de abril de 2024**, mesmo que não possuam a titulação de especialista [...].
>
> Art. 23. As entidades credenciadas remeterão ao órgão [...] **até o vigésimo dia do mês
> subsequente**, a estatística relativa ao mês anterior [...].
>
> Art. 24. Os órgãos [...] dos Estados [...] remeterão ao órgão máximo executivo de trânsito da
> União, **até o último dia do mês de fevereiro**, a estatística anual [...].

**Anotação.** Credenciamento tem vigência de **1 ano**, renovável, com comprovação bienal — nenhum
artefato PEC modela esse ciclo de vencimento/renovação, embora `pec.` (schema) presumivelmente
tenha uma entidade "clínica credenciada". A carência de especialista até 12/04/2024 já expirou —
qualquer credenciamento ativo hoje (2026) já deveria exigir a titulação plena. Art. 23 confirma,
em espelho estadual, o mesmo prazo do dia 20 usado pela Portaria DETRAN-AM 005/2021 art. 28-A (ver
[REF-DETRANAM-PORTARIA-005-2021]). Aplica-se a: (credenciamento — fora do escopo dos UC-PEC atuais,
relevante a um UC futuro de administração/credenciamento).

## Índice reverso (artigo → RN/WF/UC candidatos)

| Artigo                                          | RN/WF/UC                                 |
| ----------------------------------------------- | ---------------------------------------- |
| art. 8º (resultados médicos)                    | [RN-PEC-006]                             |
| art. 9º §3º (prazo psicológico 2 dias úteis)    | [WF-PEC-001], [RN-PEC-006]               |
| art. 10 §1º (arquivamento conforme CFM/CFP)     | [RN-PEC-001]                             |
| arts. 12-15 (junta, composição, prazos, CETRAN) | [WF-PEC-002], [UC-PEC-004], [UC-PEC-005] |
| arts. 16-24 (credenciamento)                    | (sem RN/UC dedicado hoje)                |
