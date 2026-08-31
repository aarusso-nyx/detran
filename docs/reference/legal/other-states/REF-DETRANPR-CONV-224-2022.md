---
id: REF-DETRANPR-CONV-224-2022
title: Termo de Convênio DETRAN-PR nº 224/2022 (Município de União da Vitória-PR) — delegação de fiscalização de trânsito; cláusula de talonário eletrônico
orgao: DETRAN-PR
status: instrumento bilateral específico (um convênio entre muitos do mesmo modelo padrão do DETRAN-PR); vigência do convênio individual não conferida
url: https://www.detran.pr.gov.br/sites/default/arquivos_restritos/files/documento/2022-11/224.2022_-_fiscalizacao_de_transito_m2_-_19.433.691-8.pdf
pdf: REF-DETRANPR-CONV-224-2022.pdf (txt correspondente)
apps: [teat]
sources: [REF-SENATRAN-997]
updated: 2026-08-24
---

# O que este arquivo é

Modelo de **processo de outro estado** (alvo prioridade 7 do briefing) — não um manual técnico
completo do agente (não localizado, nenhum estado publica manual operacional detalhado de uso do
talonário eletrônico como documento público autônomo, apenas notícias institucionais e a própria
norma federal), mas um **instrumento de delegação municipal** do DETRAN-PR que, em cláusula
padrão, condiciona o uso de talão eletrônico à homologação SENATRAN — confirmando, num contexto
estadual diferente do Amazonas, a aplicação prática de [REF-SENATRAN-997].

## Cláusula relevante (verbatim, plano de trabalho do convênio)

> 6. Quando utilizado TALONÁRIO ELETRÔNICO aprovado pela SENATRAN, [o Município conveniado deverá
>    comprovar] documentação referente a homologação do equipamento e do respectivo software;
>
> 7. Integrar-se a outros órgãos e entidades do SISTEMA NACIONAL DE TRÂNSITO […] quando da
>    utilização de aparelhos, equipamentos ou qualquer dispositivo eletrônico para fins de autuação e
>    imposição de penalidades […]

**Efeito no TEAT — confirmação cruzada (não do DETRAN-AM, mas de outro órgão estadual) de
[REF-SENATRAN-997].** Mostra que a exigência de homologação SENATRAN do talão eletrônico
(art. 5º daquela Portaria) é **condição contratual explícita** quando o órgão executor não é o
próprio DETRAN estadual, mas um município conveniado — reforça que, para o TEAT operar sob
convênio (cenário já mapeado para o DETRAN-AM/BPTRAN, ver `refs/detran-am/`), a cadeia de
homologação (SENATRAN → dispositivo/versão → agente conveniado) precisa ser auditável ponta a
ponta, e não apenas para agentes do quadro próprio do órgão.

## Outros achados de contexto (não verbatim, estrutura do convênio)

O convênio segue um modelo padrão do DETRAN-PR (mesmo texto reaparece, com pequenas variações,
em outros convênios municipais do estado — não conferido exaustivamente): exige do município
conveniado, entre outras obrigações, "utilizar os Sistemas Informatizados do DETRAN/PR,
exclusivamente" para o registro de infrações, e "anexar no Sistema de Gestão de Infrações,
utilizado pelo DETRAN/PR" os dados de autuação — ou seja, mesmo com talonário eletrônico próprio
do município (se houver), o dado final converge para o sistema estadual central. É um modelo de
integração centralizada análogo, em espírito, ao papel do backend TEAT/retaguarda do DETRAN-AM.

---

# Achados de conferência

Extração via `pdftotext -layout`; documento é anexo de processo administrativo (protocolo
19.433.691-8), com marca d'água de inserção ao protocolo — autenticidade verificável via
`eprotocolo.pr.gov.br`. Não foi conferida a vigência atual deste convênio específico (2022) nem
localizado documento equivalente mais recente; captura tem valor de **modelo de processo**, não de
norma vigente a ser citada como base legal.

# Nota sobre outros estados pesquisados (sem download — apenas achados de busca, não confirmados)

- **DETRAN-MS**: notícia institucional (`detran.ms.gov.br`) relata redução de 70% em erros com
  talonário eletrônico; sem norma/manual localizado.
- **DETRAN-GO**: aplicativo de talonário eletrônico mencionado em página de política de
  privacidade (`goias.gov.br/detran`); sem norma/manual localizado.
- **DETRAN-SP**: página de "Portarias Normativas" (`detran.sp.gov.br`) não carregou conteúdo
  estático via fetch (site com renderização client-side) — não foi possível localizar portaria
  específica nesta rodada.
- Nenhum estado pesquisado publica, como documento público autônomo, um "manual operacional do
  agente para talonário eletrônico" equivalente em detalhe ao MBFT federal — a Portaria SENATRAN
  997/2022 parece ser, na prática, o piso normativo comum a todos.
