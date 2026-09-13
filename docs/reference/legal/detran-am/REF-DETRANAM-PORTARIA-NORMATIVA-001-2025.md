---
id: REF-DETRANAM-PORTARIA-NORMATIVA-001-2025
title: Portaria Normativa nº 001/2025/DP/DETRAN/AM — uso de assinaturas eletrônicas no âmbito do DETRAN-AM (gov.br nível ouro, e-Notariado, CDT; atos admitidos)
orgao: DETRAN-AM
status: vigente (assinada 18/02/2025 por David Fernandes dos Santos, Diretor-Presidente; edoc A1EB.8C7F.4112.C7D; sem indício de revogação localizado)
url: https://www.detran.am.gov.br/wp-content/uploads/2025/02/MEMO_N_159_2023_RENAVAM_DETRAN_Portaria.pdf
pdf: REF-DETRANAM-PORTARIA-NORMATIVA-001-2025.pdf (original, 4 páginas, texto nativo; REF-DETRANAM-PORTARIA-NORMATIVA-001-2025.txt via pdftotext -layout)
apps: [portal, rait, teat]
sources: [REF-DECRETO-10543-2020, REF-LEI-14063-2020, REF-DECRETO-8936-2016]
updated: 2026-09-13
---

# O que este arquivo é

O **ato institucional do DETRAN-AM sobre níveis de assinatura eletrônica**, que DT-050 e OD-P01
davam por inexistente ("portaria estadual fixando níveis de assinatura por serviço não
localizada"). Não é portaria do Governo do Estado, mas é ato normativo do próprio órgão, fundado
no art. 22, I e III do CTB e no Decreto 10.543/2020, e fixa o que o PORTAL precisa: quais
assinaturas são aceitas e para quais atos.

# Excertos verbatim

> Art. 1º. Serão aceitos, no âmbito do DETRAN/AM, documentos assinados eletronicamente através
> das plataformas gov.br, com autenticação nível comprovado (ouro), E-notariado e do aplicativo
> da Carteira Digital de Trânsito – CDT, desde que seja possível a validação eletrônica.

> Art. 2º (…) II – Tipos de assinaturas eletrônicas: simples, avançada e qualificada. (…)
> IV – Assinatura eletrônica avançada: a que utiliza certificados não emitidos pela ICP-Brasil
> ou outro meio de comprovação da autoria e da integridade (…) V – Assinatura eletrônica
> qualificada: a que utiliza Certificado Digital ICP-Brasil.

> Art. 3º. As assinaturas eletrônicas avançada, nível comprovado (ouro), e a qualificada podem
> ser utilizadas em todos os documentos endereçados a este órgão de trânsito, dentre eles:
> I – ATPV-e; II – Procuração eletrônica de venda de veículos (…); III – Procuração eletrônica
> de compra (…); IV – Procuração para os serviços relacionados ao processo de habilitação (…);
> V – Procuração utilizada para realizar procedimentos relativos a infrações de trânsito (…);
> VI – Defesas de autuação e recursos contra a imposição de penalidade, indicação de condutor
> infrator ou outros procedimentos em geral relativos a infrações de trânsito; VII – Declarações
> de residência; VIII – Requerimentos e Ofícios.
>
> Parágrafo único. O aplicativo Carteira Digital de Trânsito – CDT será utilizado,
> exclusivamente, no documento de ATPV-e.

> Art. 5º. No caso de documentos que possuam duas partes signatárias será aceita a junção da
> assinatura eletrônica avançada ou qualificada e da assinatura física com reconhecimento
> cartorário de firma por autenticidade (…).

# Leitura para o sistema

- **Nível mínimo para defesa, recurso, indicação de condutor e procuração de infrações: avançada
  (gov.br ouro) ou qualificada** (art. 3º, V e VI). A portaria só menciona o **nível ouro** do
  gov.br; **prata não está admitido** para esses atos — a premissa OD-P02 ("prata ou ouro =
  avançada") precisa ser revista para **ouro = avançada; prata e bronze = insuficientes para os
  atos do art. 3º**, salvo ato posterior.
- A portaria **não fala de assinatura simples** para nenhum ato: consultas, acompanhamento e
  ouvidoria (OD-P06) ficam fora do seu alcance e podem seguir a leitura do LEGAL (nenhum nível
  exigível para manifestação anônima; simples para acompanhar).
- Fundamenta a `act_level_policy` do PORTAL (`portal-build-pack.md` WP-P1) como **dado com fonte**,
  não mais `source_pending`: `defense=advanced`, `appeal=advanced`, `driver-indication=advanced`,
  `power-of-attorney=advanced`, `residence-declaration=advanced`, `request=advanced`,
  `atpv=advanced|cdt`.
- Continua aberto (DT-050 residual): a portaria vincula o DETRAN-AM, não o CETRAN-AM (órgão
  externo) — o recurso de 2ª instância protocolado no PORTAL segue a mesma regra por adoção
  administrativa, a confirmar com a secretaria executiva do CETRAN.

Aplica-se a: [WF-PORTAL-001], [RN-PORTAL-104], [UC-PORTAL-005], [UC-PORTAL-006], OD-P01, OD-P02,
DT-050.
