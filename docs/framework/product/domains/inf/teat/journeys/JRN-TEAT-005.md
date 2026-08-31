---
id: JRN-TEAT-005
title: Abordagem mediada por bodycam — gravação obrigatória, ciência ao cidadão e vínculo com a evidência
status: draft
apps: [teat]
sources:
  [
    REF-DETRANAM-TALAO-BODYCAM,
    REF-CONTRAN-985-1003-MBFT,
    'teat:law/invariants/INV-EVIDENCE-001.json',
  ]
updated: 2026-08-24
---

## Persona e contexto

Wallace é field-agent no turno da tarde, calor e trânsito parado. Desde a Portaria Normativa
003/2026-DP/DETRAN/AM, sua câmera corporal precisa estar ligada durante todo o período em que
está uniformizado e escalado — não só durante a lavratura. Essa jornada é sobre o que muda na
experiência de Wallace quando cada abordagem, cada AIT, cada medida administrativa, passa a ter
uma gravação contínua correlata, e sobre o que acontece quando a câmera falha no pior momento
possível: um condutor alterado, discutindo, no meio de uma abordagem tensa.

**Nota de escopo.** [REF-DETRANAM-TALAO-BODYCAM] é achado local (norma vigente do DETRAN-AM), sem
paralelo em norma federal capturada até esta rodada. A jornada abaixo modela o comportamento
exigido pela portaria; a adoção da bodycam como **evidência formal do TEAT** (vínculo automático
a cada ato legal, sob o mesmo regime de [RN-TEAT-002]) é proposta ao BPO como candidata a nova
regra (`RN-TEAT-007`), ainda não aprovada — ver dossiê de pesquisa. Onde a narrativa recomenda uma
prática sem citar artigo específico, isso está marcado como decisão de produto, não exigência
normativa.

## Narrativa ponta-a-ponta

1. **Início do turno — câmera liga antes do primeiro ato.** Ao abrir turno ([JRN-TEAT-001] passo
   1), a tela de status precisa mostrar, de forma persistente (não um toggle discreto), que a
   bodycam está gravando — porque a obrigação é "durante todo o período de serviço operacional",
   entendido como todo o tempo uniformizado/escalado/disponível, não só durante um AIT
   ([REF-DETRANAM-TALAO-BODYCAM] art. 5º).
2. **Toda interação aciona o mesmo regime.** Wallace atende um chamado que não vira autuação
   (abordagem sem autuação, tela `approach-no-ait`) — a gravação é obrigatória do mesmo jeito, já
   que a norma cobre "toda interação entre agente de trânsito e condutor ou usuário da via"
   (art. 4º, VIII), não apenas os casos que terminam em AIT.
3. **Abordagem tensa.** Um condutor se recusa a apresentar documentos, levanta a voz, questiona a
   legitimidade da parada. Wallace sabe que está sendo gravado e mantém o tom — a bodycam
   funciona nos dois sentidos: protege o cidadão de eventual abuso e protege Wallace de alegação
   falsa depois. O app não interfere na interação humana; o papel do desenho aqui é só garantir
   que o indicador de gravação continue visível e que nada na interface sugira que Wallace pode
   pausar a câmera para "resolver informalmente" — é vedado (art. 8º, III).
4. **Vedações durante o serviço.** Wallace não pode desligar a câmera (salvo exceção prevista,
   como uso de banheiro — art. 8º, I), nem alterar configuração, metadados, hora, data,
   geolocalização, nem editar/copiar/excluir/transferir arquivos (art. 8º, II e IV) — a interface
   do TEAT não deveria oferecer nenhum atalho que pareça permitir isso, mesmo que o controle real
   da câmera seja de outro sistema.
5. **Falha do equipamento em campo.** No meio de uma abordagem, o indicador muda para "gravação
   interrompida" — bateria, memória ou falha de transmissão. Wallace precisa comunicar
   **imediatamente** a falha (art. 9º), registrada em sistema próprio ou relatório diário
   (§1º). A jornada aqui replica o mesmo princípio já usado para evidência anexada pelo agente
   ([RN-TEAT-002]): a falha **não invalida** o ato legal em curso (o AIT continua podendo ser
   lavrado e finalizado), mas gera uma pendência explícita que não pode ficar silenciosa — Wallace
   não deveria precisar "lembrar depois" de relatar; a tela deveria forçar o registro da falha
   antes de deixá-lo prosseguir sem indicador de gravação ativo.
6. **Vínculo com o ato legal.** Quando adotada como evidência formal, a gravação da janela de
   tempo da abordagem deveria se vincular automaticamente ao AIT/medida/procedimento de
   etilômetro correspondente — não como anexo pontual escolhido pelo agente (o modelo de
   `EvidenceLink` de hoje), mas como fluxo contínuo e paralelo, correlacionado por timestamp e
   identidade do agente/dispositivo. Este é o ponto de maior mudança estrutural em relação ao
   modelo de evidências atual — proposta `RN-TEAT-007`, pendente de decisão de escopo.
7. **Câmera veicular (viatura).** Quando tecnicamente viável, o mesmo regime se estende à câmera
   da viatura (art. 15) — Wallace não opera essa câmera diretamente, mas o app deveria refletir o
   status dela no mesmo painel, quando aplicável, para não criar dois lugares diferentes de
   verificação.
8. **Fim do turno.** Wallace só pode desligar a câmera ao sair de status operacional
   (`close-shift`) — o app não deveria permitir encerrar turno sem confirmar que a gravação foi
   devidamente finalizada, análogo ao encerramento de qualquer outro recurso do turno.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT (indicador persistente de gravação, tela de comunicação de falha —
possivelmente reaproveitando `support`/`diagnostics`, ver `_intake/ux-notes.md` §b); bodycam
(equipamento externo, integração não modelada no MVP); todas as jornadas de campo do TEAT
([JRN-TEAT-001], [JRN-TEAT-003], [JRN-TEAT-004]) tocam esta câmera de fundo.

## Métricas de sucesso

100% do período de serviço operacional com gravação ativa (proxy: zero janelas de tempo sem
indicador, exceto exceções previstas); 100% das falhas de gravação comunicadas no mesmo turno;
zero atos legais bloqueados por falha de bodycam (a falha gera pendência, nunca impede a
lavratura).
