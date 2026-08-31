---
id: UC-BOAT-012
title: Agente registra danos materiais e testemunhas do sinistro
status: approved
apps: [boat]
sources: [REF-CONTRAN-808-2020, REF-CTB-sinistro-cena-renaest]
updated: 2026-08-26
---

## Ator e objetivo

Agente de trânsito (field-agent), durante ou logo após o atendimento de campo, registra os **danos
materiais** decorrentes do sinistro — bens de terceiros, mobiliário urbano, sinalização — e
identifica as **testemunhas presenciais**, com o mínimo necessário para posterior localização.

Cobre UC-1.245 (danos materiais) e UC-1.246 (testemunhas) do grupo O do protótipo. **Decisão do
Owner (steering.md F.33, 2026-08-24):** UC próprio e dedicado, não extensão de [UC-BOAT-002].
Escrito nesta rodada (2026-08-26), que o promoveu de `stub`.

## Pré-condições

`CrashRecord` em `EM_ATENDIMENTO`, `REGISTRADO` ou `PENDENTE_COMPLEMENTO`, com ao menos um veículo
ou pessoa registrado ([UC-BOAT-002]).

## Fluxo principal

1. Agente registra cada **dano material** observado: natureza do bem (veículo de terceiro não
   envolvido, mobiliário urbano, sinalização, edificação, outro), descrição do dano, e — quando
   identificável — o responsável pelo bem.
2. Para dano a **equipamento viário** (sinalização, poste, defensa, semáforo), o sistema sinaliza a
   necessidade de comunicação ao responsável pela via, como pendência operacional do registro.
3. Agente registra cada **testemunha presencial**: identificação, forma de contato e relato
   sumário, quando a pessoa concorda em prestá-lo.
4. Testemunha é registrada como entidade **distinta** de `CrashPerson` — não é envolvida no
   sinistro, e o papel de envolvido não se aplica a ela.
5. Dano a veículo **envolvido** permanece em `CrashVehicle.apparent_damage` ([UC-BOAT-002]); este
   UC trata do que está **fora** dos veículos envolvidos.

## Fluxos alternativos / exceções

- **1a. Responsável pelo bem não identificado.** Dano é registrado sem responsável; a ausência não
  bloqueia o encerramento.
- **3a. Testemunha recusa identificar-se.** Registra-se a existência da testemunha e a recusa —
  nunca dados colhidos sem consentimento da pessoa, que não é parte obrigada do ato.
- **3b. Acordo particular entre condutores.** Fora do escopo: o BOAT não registra conteúdo,
  valores ou termos de composição privada entre envolvidos — não é dado do BAT.
- **Relatório preliminar do sinistro** (UC-1.251) segue como item a avaliar em rodada futura,
  conforme `_intake/proposals.md` — pode ser dobrado aqui ou desdobrado em UC próprio.

## Pós-condições

`CrashRecord` com danos materiais e testemunhas registrados como entidades próprias, distintas dos
veículos e pessoas envolvidas; pendência de comunicação ao responsável pela via aberta quando
houver dano a equipamento viário.

## Critérios de aceitação

**AC-BOAT-012-1 — dano material é do sinistro, não do acordo entre condutores**

- **Dado** um sinistro sem vítima com dano material
- **Quando** o agente registra
- **Então** captura o dano observado; **nenhum campo** registra conteúdo de acordo particular entre
  condutores — isso não é dado do BAT e não pertence ao registro público

**AC-BOAT-012-2 — testemunha é registro próprio, com dado mínimo**

- **Dado** uma testemunha identificada na cena
- **Quando** é registrada
- **Então** ocupa registro próprio, distinto de `CrashPerson` envolvida, com o mínimo necessário à
  posterior localização — testemunha não é envolvida, e confundi-las corrompe a estatística

**AC-BOAT-012-3 — dano aparente do veículo permanece separado do dano material geral**

- **Dado** dano a veículo envolvido e dano a bem de terceiro (muro, poste, sinalização)
- **Quando** ambos são registrados
- **Então** ocupam campos distintos — `apparent_damage` do `CrashVehicle` não absorve dano a
  patrimônio de terceiro

**AC-BOAT-012-4 — dano a equipamento público aciona a comunicação devida**

- **Dado** dano a sinalização, poste ou equipamento viário
- **Quando** é registrado
- **Então** o sistema abre a pendência de comunicação ao responsável pela via — sem inventar prazo
  normativo, que não existe

**AC-BOAT-012-5 — testemunha que recusa identificar-se é registrada como recusa**

- **Dado** uma testemunha que não quer se identificar
- **Quando** o agente prossegue
- **Então** registra-se a existência e a recusa, e o sistema **não** oferece campo para dados
  colhidos sem consentimento — a testemunha não é sujeito obrigado do ato

**AC-BOAT-012-6 — dado de testemunha é dado pessoal comum, com retenção definida**

- **Dado** os dados de contato de uma testemunha
- **Quando** são persistidos
- **Então** têm política de retenção explícita — não são dado sensível de saúde ([RN-BOAT-122] não
  os alcança), mas tampouco podem ficar sem prazo ([RN-BOAT-125])

## Regras aplicáveis

- [RN-BOAT-103] (os quatro grupos de dados do BAT — o dano material integra o grupo do sinistro)
- [RN-BOAT-004] (dados mínimos para encerramento — dano e testemunha não são mínimos)
- [RN-BOAT-125] (toda retenção tem prazo)
- [RN-BOAT-122] (a marcação de dado sensível alcança vítima, não testemunha)
