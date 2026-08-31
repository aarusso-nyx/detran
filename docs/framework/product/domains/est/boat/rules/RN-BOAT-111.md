---
id: RN-BOAT-111
title: A classificação de gravidade é padrão técnico-administrativo sob competência legal da SENATRAN — não tem assento em lei
status: draft
apps: [boat]
sources: [REF-CTB-sinistro-cena-renaest, REF-CONTRAN-808-2020]
updated: 2026-08-28
---

**Regra.** A classificação de gravidade do sinistro — `SEM_VITIMA | COM_VITIMA_FERIDA |
COM_VITIMA_FATAL` no contrato de integração, `severity` no modelo local — **não é definida por lei**.
Não consta do Anexo I do CTB, nem dos arts. 19, 22, 24 ou 326-A, nem da Res. CONTRAN 808/2020.
O que existe em lei é a **competência para definir o padrão**: cabe ao órgão máximo executivo da
União _"estabelecer modelo padrão de coleta de informações sobre as ocorrências de sinistros"_
(CTB art. 19, XI) e _"estabelecer os dados mínimos que deverão compor o BAT"_ (Res. 808/2020, art.
8º, II). A resposta precisa à pergunta "é norma ou padrão técnico?" é: **é padrão
técnico-administrativo, editado no exercício de competência legal, cujo valor concreto não tem
assento em texto de lei**. Consequência de arquitetura: os rótulos e seus critérios são **dado
normativo versionado** — catálogo com vigência, não `enum` de código.

**Base legal (da competência, não do conteúdo).**

- [REF-CTB-sinistro-cena-renaest] art. 19: _"XI - estabelecer modelo padrão de coleta de informações
  sobre as ocorrências de sinistros de trânsito e as estatísticas de trânsito;"_
- [REF-CONTRAN-808-2020] art. 8º: _"Caberá ao órgão máximo executivo de trânsito da União: [...]
  II - estabelecer os dados mínimos que deverão compor o BAT; III - desenvolver e padronizar os
  procedimentos operacionais do sistema por meio dos Manuais previstos no parágrafo único do art.
  3º;"_
- [REF-CONTRAN-808-2020] art. 4º, § 1º: _"O órgão máximo executivo de trânsito da União
  estabelecerá, em normativo específico, os campos mínimos com os dados que deverão compor o BAT."_

**Achado negativo, confirmado por busca dirigida.** Nenhum dispositivo do CTB pesquisado (Anexo I,
arts. 19, 22, 24, 326-A e correlatos) define gravidade, "vítima", "ferido" ou "óbito decorrente de
sinistro" como categorias. O documento que provavelmente contém o padrão — Manual do Sistema RENAEST
/ Manual de Gestão de Estatísticas / "normativo específico" do art. 4º, § 1º — **não é público**
([RN-BOAT-103] §Controvérsia).

**Verificação.** Consequências de modelagem, todas verificáveis:

1. **Duas classificações distintas, hoje confundidas.** `CrashVictim.severity` classifica a
   **vítima** (nível pessoa); `gravidade` do payload nacional classifica o **sinistro** (nível
   evento). A regra de derivação entre elas — "um sinistro é `COM_VITIMA_FATAL` se alguma vítima é
   óbito" — é **inferência de produto sem fonte normativa**; deve ser explicitada como tal e
   configurável, não codificada como verdade. Ver auditoria de [RN-BOAT-001] e [RN-BOAT-002].
2. **Marco temporal do óbito não normatizado.** Óbito no local (`death_at_scene`) e óbito posterior
   (`death_at`) mudam a gravidade do sinistro; nenhuma norma localizada fixa a janela em que o óbito
   posterior ainda reclassifica o registro. O padrão internacional de 30 dias, citado por fonte
   secundária no `_intake/research-dossier.md` §6, **não foi confirmado em norma brasileira** e não
   deve ser adotado como se fosse.
3. Enquanto o padrão não for obtido, o catálogo local deve **espelhar o contrato nacional** e
   registrar explicitamente essa origem — evitando que o dado estadual divirja do que a base
   nacional aceita.

**Controvérsia/risco.** _Severidade: média-alta._ Uma classificação sem definição pública de
critérios produz duas exposições: (a) **inconsistência entre agentes** — "ferido" sem critério é
juízo do agente em campo, e a estatística estadual que alimenta a meta do Pnatrans depende dessa
uniformidade; (b) **risco de divergência com o padrão federal** no momento em que o Manual for
obtido, com necessidade de reclassificação retroativa do acervo. Item 5 de
`_intake/legal-assessment.md`.

**Decisão do Owner (2026-08-28, `_meta/open-issues.md` DT-018).** Quanto à regra de derivação
`severity`(vítima) ↔ `gravidade`(sinistro) do item 1 de Verificação: **o Owner autoriza a equipe
técnica a propor a regra**, sujeita à aprovação dele antes de virar comportamento de produto — não
é uma decisão final, é uma delegação. Enquanto a proposta não é apresentada e aprovada, a regra
continua **sem fonte normativa nem posição adotada** — não implementar como se já estivesse
decidida.
