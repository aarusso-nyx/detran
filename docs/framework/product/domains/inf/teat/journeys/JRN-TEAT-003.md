---
id: JRN-TEAT-003
title: Blitz de alcoolemia — etilômetro, recusa e sinais psicomotores num ponto de bloqueio noturno
status: draft
apps: [teat]
sources:
  [
    REF-CONTRAN-432,
    REF-INMETRO-369-2021,
    'REF-CTB-165-277-medidas-alcoolemia',
    REF-DETRANAM-TALAO-BODYCAM,
    'teat:docs/framework/product/blueprints/BP-AIT-LIFECYCLE-001.json',
  ]
updated: 2026-08-24
---

## Persona e contexto

Kaique é field-agent numa operação "Lei Seca" programada ([JRN-TEAT-002]), ponto de bloqueio
numa avenida de saída de Manaus, 23h de sexta-feira. Calor ainda alto, fila de carros parada,
motoristas impacientes. A operação tem um etilômetro homologado INMETRO por ponto de abordagem
([REF-CONTRAN-432] art. 4º, I) e bodycam obrigatória ligada desde o início do turno
([REF-DETRANAM-TALAO-BODYCAM] art. 5º). O maior risco de Kaique não é tecnológico — é o
confronto verbal: motorista discutindo a margem de erro do aparelho, alegando fome/remédio,
tentando negociar no local. A tela precisa dar a ele linguagem pronta, não deixar a explicação
técnica na cabeça dele sob pressão.

## Narrativa ponta-a-ponta

1. **Abordagem de rotina no bloqueio.** Kaique para o veículo, cumprimenta, pede documentos —
   interação já sob gravação de bodycam (`ait-start`). Não há sinal óbvio de alteração ainda;
   etilômetro é oferecido por padrão da operação, não por suspeita — a norma prioriza o teste de
   etilômetro sobre a simples constatação de sinais quando ambos estão disponíveis
   ([REF-CONTRAN-432] art. 3º §2º).
2. **Teste no etilômetro (`alcohol-device`).** Kaique seleciona o aparelho da lista de
   equipamentos homologados vinculados ao turno/operação (marca, modelo, nº de série já
   pré-carregados — não digitados à mão) e registra o número do teste. O condutor sopra.
3. **Resultado com margem já descontada (`alcohol-result`).** A tela mostra **dois números
   lado a lado, nunca um só**: "medição realizada" (valor bruto do aparelho) e "valor
   considerado" (após desconto da margem de tolerância metrológica, [REF-INMETRO-369-2021] /
   [REF-CONTRAN-432] art. 4º, parágrafo único, Anexo I). Um texto curto, pronto para Kaique ler
   em voz alta ao condutor, explica que a margem já foi subtraída — isso evita a discussão mais
   comum do plantão ("o aparelho erra") virando um impasse de 10 minutos na fila.
4. **Bifurcação por limiar.** Se o valor considerado ≥ 0,05 mg/L, é infração administrativa do
   art. 165 do CTB; se ≥ 0,34 mg/L, configura também o crime do art. 306 — dez vezes o limiar
   administrativo ([REF-CONTRAN-432] art. 6º, II e art. 7º, II). Acima do segundo limiar, a tela
   sinaliza claramente que o condutor será encaminhado à Polícia Judiciária junto dos elementos
   probatórios — esse encaminhamento é registrado como evento, mas o processamento em si sai do
   TEAT ([REF-CONTRAN-432] art. 7º §2º) — fronteira de escopo que o app precisa deixar visível
   para Kaique, não implícita.
5. **Recusa do condutor (`alcohol-refusal`).** Um motorista mais adiante se recusa a soprar. A
   tela distingue, com dois botões que não podem ser confundidos: **recusa** (o condutor se nega)
   vs. **impossibilidade técnica do aparelho** (falha do equipamento, sem ligação com a conduta do
   condutor) — consequência jurídica é diferente. Recusar qualquer procedimento do art. 3º gera
   automaticamente a infração do art. 165 **e**, simultaneamente, é tipificada à parte como
   infração autônoma do art. 165-A — a tela registra as duas, não uma ou outra
   ([REF-CONTRAN-432] art. 6º, parágrafo único; [RN-TEAT-005]).
6. **Sinais psicomotores como via alternativa (`alcohol-signs`).** Sem etilômetro disponível (ou
   após recusa), Kaique documenta sinais de alteração da capacidade psicomotora — não é um campo
   de observação livre: é um checklist do conjunto de sinais do Anexo II da Res. 432/2013, e a
   norma exige **mais de um sinal**, nunca um isolado, para caracterizar a alteração
   ([REF-CONTRAN-432] art. 5º §1º). A tela bloqueia avanço até que o mínimo de sinais marcados
   componha um conjunto, e gera o **termo específico** exigido em anexo ao AIT (art. 5º §2º) — não
   é o campo "observações" do AIT comum.
7. **Encaminhamento a exame de sangue/laboratorial, sem travar a autuação (`alcohol-forward`).**
   Kaique registra o encaminhamento quando aplicável; a tela deixa explícito que **não é preciso
   aguardar o resultado** para finalizar o AIT — a autuação administrativa é imediata
   ([REF-CONTRAN-432] art. 3º §3º). Anti-padrão a evitar: qualquer desenho que faça o app "travar"
   à espera do exame.
8. **Medidas administrativas vinculadas.** Veículo é retido até condutor habilitado se apresentar
   (ou recolhido ao depósito se ninguém se apresentar); CNH é recolhida mediante recibo, com prazo
   próprio de 5 dias para o condutor reavê-la antes de ser encaminhada ao órgão de registro
   ([REF-CONTRAN-432] arts. 9º-10) — timer de negócio que a tela de medida deveria mostrar, não só
   registrar em silêncio.
9. **Termo de alcoolemia — conteúdo mínimo estruturado (`alcohol-term`).** Antes de finalizar,
   Kaique revisa um termo que já reúne, por campo (não por texto corrido): marca/modelo/nº de
   série do aparelho, nº do teste, medição realizada, valor considerado, limite regulamentado,
   testemunha(s) se houver, mídia complementar, flag de recusa — conteúdo mínimo exigido pelo
   art. 8º da Res. 432/2013.
10. **Assinatura/recusa/impossibilidade e finalização.** Mesmo padrão de três resultados distintos
    de [UC-TEAT-004]/[RN-TEAT-005] — assinar não é concordar com o resultado do teste, é só
    ciência. Kaique finaliza com toque explícito ([REF-SENATRAN-997] Anexo II, g); AIT entra na
    fila local até sincronizar.
11. **Fila do bloqueio segue.** Enquanto o caso de Kaique estava em instrução, mais três carros já
    esperavam — a interrupção de um caso (recusa que virou discussão) não pode travar a fila de
    abordagem do ponto; o app precisa suportar múltiplos casos em rascunho simultâneo sem perder
    contexto de nenhum.

## Pontos de contato (apps/canais)

Aplicativo mobile TEAT (`ait-start` → `alcohol-start`/`alcohol-device`/`alcohol-result`/
`alcohol-refusal`/`alcohol-signs`/`alcohol-forward`/`alcohol-links`/`alcohol-term`); etilômetro
homologado INMETRO (equipamento externo, dado consultado, não integrado por API no MVP); bodycam
([JRN-TEAT-005]); impressora Bluetooth para o termo de alcoolemia impresso.

## Métricas de sucesso

Zero termos de alcoolemia finalizados sem os campos mínimos do art. 8º; zero confusão registrada
entre recusa e impossibilidade técnica (medido por reclassificação posterior pelo
processing-operator); tempo entre resultado do etilômetro e explicação lida ao condutor (proxy de
redução de conflito no local); zero autuações atrasadas por espera de exame de sangue.
