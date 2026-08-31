# use-cases/ — catálogo do corpus de sinistro (BOAT)

Este índice cataloga o corpus de UCs de sinistro/acidente identificado no repositório `teat`
(fonte do domínio, ver [APP-BOAT]): grupo **O — Sinistros/acidentes de trânsito**, UC-1.226 a
UC-1.254 (29 casos), em
`teat:docs/meta/prototypes/docs/UC-1-mobile.md` (protótipo, evidência de UX — não autoridade de
runtime), mais o grupo de telas oficiais `sinistros` da matriz de paridade mobile
(`teat:docs/framework/product/ux-parity/mobile-matrix.json`) e o grupo `crashes` da matriz web.

**Aviso de fonte:** cada UC do grupo O segue um template genérico no protótipo (mesmo fluxo
principal de 7 passos, mesmas pós-condições, só o título muda) — não há narrativa de negócio
específica por caso nessa fonte. A substância de regra de negócio real está em
`teat:docs/meta/prototypes/docs/RN-1_Regras_de_Negocio_Talonario_Eletronico.md` §Sinistros
(RN-SIN-_), citada nos UCs completos abaixo e nas regras [RN-BOAT-_].

## Grupo O — UC-1.226 a UC-1.254 (temas)

| Faixa          | Tema                                                                       | UC completo correspondente                                                                                                                               |
| -------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC-1.226–1.229 | Início, classificação, data/hora e local georreferenciado do sinistro      | [UC-BOAT-001](./UC-BOAT-001.md)                                                                                                                          |
| UC-1.230–1.234 | Condições de via, clima, iluminação, sinalização e dinâmica preliminar     | [UC-BOAT-001](./UC-BOAT-001.md)                                                                                                                          |
| UC-1.235–1.239 | Veículos, condutores, passageiros, pedestres e ciclistas envolvidos        | [UC-BOAT-002](./UC-BOAT-002.md)                                                                                                                          |
| UC-1.240–1.244 | Vítimas, gravidade, óbito no local, atendimento médico, remoção hospitalar | [UC-BOAT-003](./UC-BOAT-003.md)                                                                                                                          |
| UC-1.245–1.246 | Danos materiais e testemunhas do sinistro                                  | [UC-BOAT-012](./UC-BOAT-012.md) — **Decisão do Owner (2026-08-24, steering.md F.33): UC próprio e dedicado**, não extensão de UC existente (stub criado) |
| UC-1.247–1.250 | Fotos, croqui simples, associação a AITs e medidas administrativas         | [UC-BOAT-004](./UC-BOAT-004.md)                                                                                                                          |
| UC-1.251–1.254 | Relatório preliminar, transmissão, complementação e encerramento           | [UC-BOAT-005](./UC-BOAT-005.md)                                                                                                                          |

Lista completa dos 29 títulos (fonte: `UC-1-mobile.md` tabela de grupo O):
UC-1.226 Iniciar registro de sinistro · UC-1.227 Classificar tipo de sinistro · UC-1.228
Registrar data e hora · UC-1.229 Registrar local georreferenciado · UC-1.230 Condições da via ·
UC-1.231 Condições climáticas · UC-1.232 Iluminação do local · UC-1.233 Sinalização existente ·
UC-1.234 Dinâmica preliminar · UC-1.235 Veículos envolvidos · UC-1.236 Condutores envolvidos ·
UC-1.237 Passageiros envolvidos · UC-1.238 Pedestres envolvidos · UC-1.239 Ciclistas envolvidos ·
UC-1.240 Registrar vítimas · UC-1.241 Classificar gravidade da vítima · UC-1.242 Óbito no local ·
UC-1.243 Atendimento médico · UC-1.244 Remoção hospitalar · UC-1.245 Danos materiais · UC-1.246
Testemunhas · UC-1.247 Capturar fotos · UC-1.248 Capturar croqui simples · UC-1.249 Associar
infrações · UC-1.250 Associar medidas administrativas · UC-1.251 Gerar relatório preliminar ·
UC-1.252 Transmitir registro · UC-1.253 Complementar registro · UC-1.254 Encerrar registro.

Grupo adjacente **P — Evidências digitais e cadeia de custódia** (UC-1.255–1.270) é compartilhado
com o núcleo TEAT — ver [UC-TEAT-003] em `inf/teat/use-cases/`.

## Telas oficiais (paridade Web/Mobile)

**Mobile — grupo `sinistros`, 11 telas** (UX-MOB-060 a UX-MOB-070): Novo sinistro; Local e
horário; Condições; Veículos envolvidos; Pessoas envolvidas; Vítimas; Dinâmica; Croqui;
Evidências do sinistro; AITs vinculados; Revisão do sinistro. Fonte:
`teat:docs/framework/product/ux-parity/mobile-matrix.json`.

**Web — grupo `crashes`, 4 telas** (UX-WEB-060 a UX-WEB-063): Lista de sinistros; Detalhe de
sinistro; Complementação de sinistro; Integração RENAEST. Fonte:
`teat:docs/framework/product/ux-parity/web-matrix.json`.

Jornada oficial `crash-record` (`ux-parity/journeys.json`) liga as 11 telas mobile às 4 telas web
ponta-a-ponta.

## UC completos (núcleo)

| id                              | título                                                   | status |
| ------------------------------- | -------------------------------------------------------- | ------ |
| [UC-BOAT-001](./UC-BOAT-001.md) | Agente inicia e classifica o registro de sinistro        | draft  |
| [UC-BOAT-002](./UC-BOAT-002.md) | Agente registra veículos e pessoas envolvidas            | draft  |
| [UC-BOAT-003](./UC-BOAT-003.md) | Agente registra vítimas e classifica gravidade           | draft  |
| [UC-BOAT-004](./UC-BOAT-004.md) | Agente captura croqui, evidências e associa AITs/medidas | draft  |
| [UC-BOAT-005](./UC-BOAT-005.md) | Registro é transmitido, complementado e encerrado        | draft  |

## UC completos — rodada BPO 2026-08-24 (confirm-extend sobre pesquisa RENAEST/808-2020)

| id                              | título                                                                                      | status | ver também                                                                                                                                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [UC-BOAT-006](./UC-BOAT-006.md) | Agente registra sinistro com vítima em via com remoção                                      | draft  | [WF-TEAT-004] (remoção, reuso por referência)                                                                                                                                                                                        |
| [UC-BOAT-007](./UC-BOAT-007.md) | Agente captura as três condutas de cena estruturadas (arts. 176-178), substituindo `evaded` | draft  | refinamento de produto mais consequente da rodada — ver `_intake/bpo-notes.md`                                                                                                                                                       |
| [UC-BOAT-008](./UC-BOAT-008.md) | Parceiro de saúde credenciado submete dado de sinistro/vítima                               | draft  | [WF-BOAT-002]                                                                                                                                                                                                                        |
| [UC-BOAT-009](./UC-BOAT-009.md) | Coordenador de RENAEST valida e retifica em nível municipal/estadual                        | draft  | [WF-BOAT-003]                                                                                                                                                                                                                        |
| [UC-BOAT-010](./UC-BOAT-010.md) | Bodycam no atendimento a sinistro                                                           | draft  | reuso integral de [UC-TEAT-010], não remodelado                                                                                                                                                                                      |
| [UC-BOAT-011](./UC-BOAT-011.md) | Sistema transmite à RENAEST e acompanha pendência de validação                              | draft  | estende [UC-BOAT-005] com visão de acompanhamento                                                                                                                                                                                    |
| [UC-BOAT-012](./UC-BOAT-012.md) | Agente registra danos materiais e testemunhas do sinistro                                   | stub   | **Decisão do Owner (2026-08-24, steering.md F.33):** UC próprio e dedicado para UC-1.245/1.246, não extensão de [UC-BOAT-002]; UC-1.251 (relatório preliminar) permanece candidato a dobrar/desdobrar aqui, avaliar em rodada futura |

Backlog de UCs não escritos (relatório preliminar como documento próprio — UC-1.251): ver
`_intake/proposals.md`. Danos materiais e testemunhas (UC-1.245/1.246) agora têm UC dedicado —
[UC-BOAT-012](./UC-BOAT-012.md), stub (decisão do Owner, steering.md F.33).
