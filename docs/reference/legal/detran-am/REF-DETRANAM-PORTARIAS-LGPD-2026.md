---
id: REF-DETRANAM-PORTARIAS-LGPD-2026
title: Portarias Normativas DETRAN-AM de 2026 sobre LGPD — nº 002/2026 (compartilhamento de dados pessoais), nº 016/2026 (Comitê de Privacidade e Proteção de Dados) e nº 018/2026 (responsabilidades no tratamento e segurança da informação)
orgao: DETRAN-AM
status: vigentes (002/2026 publicada jul/2026; 016/2026 assinada 27/07/2026, revoga a PN 006/2023; 018/2026 assinada 13/08/2026)
url: https://www.detran.am.gov.br/acesso-informacao/publicacoes/portarias/portarias-normativas/
pdf: PORTARIA-NORMATIVA-002-2026-COMPARTILHAMENTO.pdf (19 p.), PORTARIA-NORMATIVA-016-2026-CPPD.pdf (3 p.), PORTARIA-NORMATIVA-018-2026-LGPD.pdf (6 p.) — originais com texto nativo
apps: [boat, portal, dashboard, rait, teat]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-09-13
---

# O que este arquivo é

Três atos do próprio DETRAN-AM que a rodada de 2026-08 não conhecia e que mudam o quadro de
DT-047 (hipótese legal do dado de saúde), DT-048 (papel LGPD do DETRAN-AM) e DT-049 (retenção):
o órgão **já se declara controlador**, **já tem Encarregado designado** (Portaria 319/2023 e
substituto pela Portaria 841/2025), **já tem Comitê de Privacidade** (CPPD) e **já regula o
compartilhamento** com órgãos públicos e entes privados, inclusive de dados sensíveis, com
inventário de bases e prazos de retenção como dever do órgão.

# Portaria Normativa nº 002/2026 — compartilhamento

- Art. 1º regulamenta as condições para tratamento e compartilhamento de dados pessoais sob a
  guarda do DETRAN-AM; art. 2º, II define **dado pessoal sensível** (inclui saúde).
- Arts. 3º–6º: acesso concedido por requerimento; compartilhamento com órgãos públicos (art. 4º)
  e com entes privados (arts. 5º–6º) só nas hipóteses da LGPD.
- Arts. 7º–11: requerimento formal (formulário anexo com campo "( ) Dados pessoais sensíveis"),
  análise pelo **CPPD** (art. 16), classificação dos dados (art. 15), autorização por instrumento
  próprio (art. 18).
- Art. 19: compartilhamento preferencialmente automatizado, com conservação dos registros "pelo
  prazo mínimo necessário"; arts. 20–23: obrigações do recebedor, **restituição ou eliminação ao
  final do prazo**, registro de todas as operações (art. 21), rastreabilidade (art. 23).
- **Art. 28: o DETRAN-AM manterá inventário atualizado de suas bases de dados**, incluindo
  "III – prazos de retenção e destinação final".

# Portaria Normativa nº 016/2026 — CPPD

- Designa a composição do Comitê de Privacidade e Proteção de Dados (presidente: Assessoria
  Jurídica), em substituição à PN 006/2023, como boa prática de governança (LGPD art. 50).

# Portaria Normativa nº 018/2026 — responsabilidades e segurança

- Art. 4º, II define dado sensível (saúde); art. 5º princípios (finalidade, necessidade e
  minimização, transparência e prestação de contas, segurança, prevenção).
- Art. 8º: controles mínimos "conforme diretrizes da ANPD e guias oficiais": controle de acesso
  por perfis, **registro de logs de tratamento**, **criptografia de dados sensíveis**, backup,
  gestão de incidentes com notificação à ANPD; parágrafo único remete a normativo complementar.
- Art. 10: Encarregado e substituto publicamente identificados (LGPD art. 41); art. 11:
  registro das atividades de tratamento e notificação de incidentes.

# Leitura para o sistema

- **DT-048 (papel LGPD)**: o órgão atua como controlador nos três atos; a divergência com a
  Portaria SENATRAN 139/2025 art. 7º §3º permanece só para os dados dos sistemas nacionais.
- **DT-047 (hipótese legal do dado de saúde da vítima)**: o dever de publicar a hipótese continua
  descumprido — nenhum dos atos publica hipóteses por base de dados; mas o **inventário do art. 28
  da PN 002/2026 é o veículo institucional** para publicá-las. A cédula do Owner passa a pedir
  "incluir o BAT no inventário do art. 28 com hipótese art. 11, II, a/b e prazo de retenção".
- **DT-049 (retenção)**: a PN 015/2026 (CSAD) e o art. 28 da PN 002/2026 criam a obrigação de
  fixar prazos por base; o valor continua inexistente → `est.retention.*` segue `source_pending`,
  mas com **dono institucional identificado** (CSAD + CPPD).
- Requisitos técnicos do art. 8º da PN 018/2026 já são atendidos pelo desenho (perfis, auditoria,
  criptografia de campos sensíveis, trilha); citar nas RN LGPD de cada app.
- Exportações e compartilhamentos do DASHBOARD ([RN-DASH-172]) e do PORTAL (terceiros) precisam
  do rito da PN 002/2026 quando o destinatário é externo.

Aplica-se a: [RN-BOAT-122]…[RN-BOAT-126], [RN-RAIT-133]…[RN-RAIT-138], [RN-TEAT-144],
[RN-DASH-171], [RN-DASH-172], DT-047, DT-048, DT-049, OD-B01, OD-B02, OD-B03.
