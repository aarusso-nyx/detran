---
id: JRN-BOAT-003
title: Parceiro hospitalar registra atendimento de vítima — intake facultativo, dados mínimos de saúde, LGPD-consciente
status: draft
apps: [boat]
sources:
  [
    'REF-CONTRAN-808-2020',
    'REF-SENATRAN-PORTARIA-139-2025',
    'RN-BOAT-002',
    'RN-BOAT-003',
    'APP-BOAT',
  ]
updated: 2026-08-24
---

## Persona e contexto

Cleuza é técnica administrativa do setor de urgência de um hospital de referência em Manaus que
recebeu, algumas horas atrás, o motociclista da jornada [JRN-BOAT-001]. O DETRAN-AM e a secretaria
estadual de saúde firmaram, numa onda futura de produto, a integração facultativa prevista em
[REF-CONTRAN-808-2020] art. 6º, §1º, III (SAMU) — o hospital passou a poder complementar o
atendimento de vítimas de sinistro diretamente, em vez de depender só do que o agente de campo
capturou no minuto de estresse da cena.

**Nota de escopo — esta jornada descreve uma proposta de produto, não um fluxo confirmado no
corpus lido.** Nenhuma fonte examinada (`teat`/`senatran`) define um ator "parceiro conveniado"
com RBAC próprio; a Resolução CONTRAN 808/2020 confirma a **existência legal** da integração de
saúde/SAMU ao RENAEST, mas a integração é **facultativa** ("poderão integrar" — art. 6º, §1º) e,
quando exercida, ocorre **através do órgão estadual de trânsito** (§5º) — não é ligação direta
hospital↔União, nem obrigação de o hospital operar um sistema do DETRAN-AM. Tudo abaixo é
**candidato a onda futura**, registrado aqui como jornada foundational porque BOAT ainda não tinha
nenhuma — decisão de priorização cabe ao Owner. Onde a narrativa propõe uma tela específica sem
base normativa direta, isso está marcado como decisão de produto.

## Narrativa ponta-a-ponta

1. **Entrada não é "criar um novo sinistro".** Cleuza não abre um `CrashRecord` do zero — ela
   busca, por chave natural compatível com a já usada na submissão RENAEST (uf, município, data/
   hora aproximada do sinistro, e idealmente o nome/documento da vítima), o registro que Yasmin já
   iniciou em campo. **Decisão de produto central desta jornada**: o hospital nunca é a origem
   primária de um sinistro no BOAT — ele **conciliação/complementa** um registro já existente vindo
   do agente de trânsito. Sem correspondência encontrada, a tela sinaliza claramente "nenhum
   sinistro correspondente localizado" em vez de deixar Cleuza criar um registro solto, órfão.
2. **Dados mínimos, não o prontuário inteiro.** Ao localizar o registro, Cleuza só complementa os
   campos que o BOAT já modela para vítima — gravidade final observada, se houve óbito, se houve
   atendimento médico, destino/alta — nunca um campo de texto livre espelhando prontuário clínico
   completo. Isso segue o princípio de minimização reforçada de dado sensível
   ([REF-SENATRAN-PORTARIA-139-2025] art. 18: "evitar a inclusão de dados sensíveis [...] priorizar
   a validação de dados"): o hospital confirma/ajusta o que já existe, não despeja um novo
   conjunto de dados de saúde no sistema.
3. **Sem tempo real, sem urgência artificial.** Diferente do agente de campo, Cleuza não está sob
   pressão de cena viva — ela pode revisar com calma, no fim do plantão, os casos pendentes de
   complemento vindos da equipe de trânsito. A tela dela não deveria simular urgência de
   atendimento ao vivo (nenhum timer, nenhum "responda em X minutos"); é fluxo de conciliação
   administrativa, no ritmo do hospital, não do trânsito.
4. **Ela não vê o sinistro inteiro — só a parte que lhe cabe.** Cleuza não tem motivo para ver
   dinâmica do sinistro, croqui, evidências fotográficas ou dados de outros envolvidos que não a
   vítima que seu hospital atendeu. A tela do parceiro hospitalar é uma superfície reduzida,
   deliberadamente menor que o console interno do processing-operator — mostra só o que é
   necessário para a finalidade de saúde, mesmo princípio de minimização do passo 2, aplicado agora
   à própria superfície de tela, não só ao conteúdo do campo.
5. **Confirmação, não edição livre de gravidade.** Se a gravidade que o agente registrou em campo
   (ex.: `COM_VITIMA_FERIDA`) já corresponde ao desfecho clínico, Cleuza confirma. Se o desfecho
   mudou — por exemplo, óbito hospitalar horas depois, quando o agente só pôde registrar "ferida"
   no local —, ela registra a atualização como complemento datado, não como sobrescrita silenciosa
   do que Yasmin viu na cena; o histórico de quem registrou o quê, e quando, se preserva.
6. **Acesso reforçado desde o primeiro toque, não como camada extra depois.** Antes mesmo de ver
   qualquer dado, Cleuza passa por controle de acesso reforçado consistente com [RN-BOAT-003] —
   os mesmos campos de alta sensibilidade (`hospital_destination`, `health_notes`) que já exigem
   esse controle para o processing-operator interno exigem o mesmo padrão para ela, **sem
   relaxamento** só porque ela é a fonte natural do dado de saúde; ser hospital não é uma exceção à
   regra de acesso, é a razão pela qual a regra existe.
7. **Nenhuma promessa de integração automática nacional.** Cleuza não submete nada diretamente à
   RENAEST — o envio nacional continua sendo feito pelo DETRAN-AM, através do fluxo já existente
   ([WF-BOAT-001], [UC-BOAT-005]), depois que o registro volta a `recorded`/`validated`. A tela
   deveria deixar isso explícito para não sugerir a Cleuza um vínculo direto hospital↔RENAEST que a
   norma não prevê (art. 6º §5º exige passagem pelo DETRAN estadual).
8. **Encerramento do complemento não é encerramento do registro.** Quando Cleuza termina, o
   `CrashRecord` volta ao estado `pending_complement`/`recorded` do TEAT ([WF-BOAT-001]) — ela não
   tem papel de encerrar (`close`) nem validar (`validate`) o registro; isso permanece com
   field-supervisor/traffic-authority/processing-operator, mantendo a fronteira entre "quem
   completa o dado de saúde" e "quem decide que o registro está pronto".

## Pontos de contato (apps/canais)

Console web de parceiro conveniado (proposta — não confundir com o console `crashes` do
processing-operator/traffic-authority, [UC-BOAT-005]); TEAT/BOAT mobile (origem do registro,
[JRN-BOAT-001]); RENAEST (destino final, via DETRAN-AM, fora do alcance direto de Cleuza).

## Métricas de sucesso

% de vítimas com destino hospitalar cujo desfecho final foi confirmado/atualizado pelo hospital
(quando a onda estiver ativa); zero acesso de parceiro hospitalar a dados de sinistro fora do
escopo da vítima que seu hospital atendeu; zero campo de texto livre clínico despejado sem
correspondência a um campo modelado do BOAT; tempo entre alta/óbito hospitalar e complemento do
registro (quando aplicável).
