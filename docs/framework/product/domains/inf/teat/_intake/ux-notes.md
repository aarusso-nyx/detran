---
id: UX-NOTES-TEAT
title: Notas de UX — TEAT (aplicativo móvel do agente de campo)
status: draft
apps: [teat]
sources:
  [
    REF-SENATRAN-997,
    REF-CONTRAN-432,
    REF-INMETRO-369-2021,
    'REF-CTB-165-277-medidas-alcoolemia',
    REF-CONTRAN-1025-2026,
    REF-DETRANAM-TALAO-BODYCAM,
    REF-CONTRAN-985-1003-MBFT,
  ]
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o aplicativo móvel do agente de trânsito (field-agent,
field-supervisor) em campo. Complementa [JRN-TEAT-001] a [JRN-TEAT-006]. O inventário de telas de
referência é `teat:docs/framework/product/ux-parity/mobile-matrix.json` (67 telas mapeadas em
`inf/teat/use-cases/INDEX.md` §"Paridade oficial Web/Mobile") — este documento registra o que
muda ou se soma a esse inventário a partir dos novos achados legais, não substitui a matriz
oficial de paridade.

## (a) Regras de conteúdo de ergonomia de campo

O agente opera em pé, muitas vezes com uma das mãos ocupada (documento do condutor, lanterna,
sinalização de trânsito), sob sol direto de Manaus, chuva repentina, ou de noite numa blitz de
alcoolemia. As regras abaixo valem para toda tela nova ou revisada por esta rodada:

1. **Uma mão só.** Ações primárias (finalizar AIT, confirmar assinatura, avançar etapa) precisam
   estar alcançáveis por polegar em modo de uso de uma mão só — a outra mão frequentemente está
   ocupada. Nunca colocar a ação principal de uma tela apenas no topo, fora do alcance do
   polegar.
2. **Legibilidade sob sol direto.** Contraste alto, nunca depender de tons de cinza sutis;
   telas testadas em brilho máximo simulando sol do meio-dia (contexto de [JRN-TEAT-004]) —
   texto claro sobre fundo escuro ou vice-versa, nunca cinza-sobre-branco de baixo contraste.
3. **Modo noturno em operações noturnas.** Blitze de alcoolemia ([JRN-TEAT-003]) ocorrem à noite;
   tema escuro deveria ser o padrão nesse contexto, não só para conforto — evita ofuscar a visão
   noturna do agente ao se aproximar de um veículo, e evita que a tela vire fonte de luz que
   atrapalha a abordagem.
4. **Toque com luva.** Alvos de toque dimensionados para dedo com luva/uniforme de proteção
   (mínimo recomendado ≥48dp) — gestos de precisão (pinça, multitoque) nunca como única forma de
   completar uma ação obrigatória.
5. **Tela molhada.** Em chuva (comum em Manaus), o toque capacitivo perde precisão — ações
   críticas (finalizar, confirmar recusa) precisam de alvo grande e confirmação clara, nunca de
   um gesto sutil (deslizar fino, toque duplo rápido).
6. **Brevidade em interação hostil.** Qualquer texto que o agente precise ler em voz alta para um
   condutor tenso — explicação da margem de erro do etilômetro ([JRN-TEAT-003] passo 3), aviso de
   que a recusa de assinatura não invalida o termo ([JRN-TEAT-004] passo 6) — precisa ser curto,
   pronto, e redigido de antemão. O agente sob pressão não deveria precisar compor a explicação
   na hora; é a interface que carrega a frase certa.
7. **Resiliência a interrupção.** Nenhuma tela pode perder estado se o agente for interrompido no
   meio (outro carro parando, chamado de rádio, situação de risco) — rascunhos precisam
   sobreviver a troca de app, bloqueio de tela, e retomada minutos ou horas depois, sem perder o
   que já foi preenchido.
8. **Nunca bloquear em rede.** Nenhuma ação de campo pode ficar girando um spinner esperando
   rede — toda escrita é local-first; sincronização é processo de fundo, nunca interrompe o
   trabalho seguinte do agente ([RN-TEAT-001]).

## (b) Inventário de telas — deltas vs. a matriz oficial (67 telas mobile)

> **PROMOVIDO (2026-08-26).** Estes deltas viraram artefato próprio em
> [IU-TEAT-001](../screens/IU-TEAT-001.md), acrescidos do delta de escopo da medição de velocidade
> acoplada e ancorados nas regras legais e nos critérios de aceitação. As tabelas abaixo ficam como
> registro histórico do intake.

As jornadas desta rodada não substituem a matriz de paridade oficial, mas revelam telas novas
propostas e conteúdo/comportamento a alterar em telas já existentes. Nenhuma das telas novas
abaixo está hoje no inventário oficial — são propostas de produto a validar com BPO/engenharia.

### Telas novas propostas (4)

| Tela proposta                                                             | Grupo sugerido                                                | Jornada de origem                                                           | Por quê não existe hoje                                                                                                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declarar falha de dispositivo / handoff de sessão                         | autenticacao-e-turno (ou sincronizacao-suporte-e-diagnostico) | [JRN-TEAT-006]                                                              | Nenhuma tela hoje captura o evento de troca de aparelho em campo — sem ele, a retaguarda não distingue handoff autorizado de sessão concorrente anômala ([REF-SENATRAN-997] Anexo II, h) |
| Checklist de elegibilidade — guarda monitorada                            | medidas-administrativas                                       | [JRN-TEAT-004]                                                              | Modalidade inteiramente nova ([REF-CONTRAN-1025-2026] art. 17); os 9 requisitos do §1º não têm tela hoje                                                                                 |
| Ativação de guarda monitorada (vínculo do dispositivo de monitoramento)   | medidas-administrativas                                       | [JRN-TEAT-004]                                                              | Consequência direta da elegibilidade confirmada; sem paralelo nas 7 telas atuais do grupo (todas assumem remoção física)                                                                 |
| Solicitação de cancelamento pós-finalização (à Diretoria de Fiscalização) | ait-completo (ou sincronizacao-suporte-e-diagnostico)         | achado local [REF-DETRANAM-TALAO-BODYCAM] §1, referenciado em [WF-TEAT-001] | Hoje só existe (na norma federal) cancelamento de rascunho não finalizado; cancelamento pós-finalização é fluxo formal distinto, sem tela própria                                        |

### Telas existentes com delta de conteúdo/comportamento (9)

| Tela (uxCode)                                   | Delta exigido                                                                                                                                    | Jornada/fonte                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `alcohol-result` (UX-MOB-052)                   | Mostrar **dois campos sempre juntos** — medição realizada e valor considerado (pós-margem) — nunca um valor único                                | [JRN-TEAT-003]; [REF-CONTRAN-432] art. 4º §único                               |
| `alcohol-refusal` (UX-MOB-053)                  | Separar visualmente **recusa** de **impossibilidade técnica do aparelho** — consequência jurídica distinta, hoje mesmo campo                     | [JRN-TEAT-003]; [REF-CONTRAN-432] art. 6º §único; handoff UX do dossiê, item 4 |
| `alcohol-signs` (UX-MOB-054)                    | Checklist estruturado do Anexo II com **exigência de conjunto** (não um sinal isolado); gera termo específico anexo, não texto livre             | [JRN-TEAT-003]; [REF-CONTRAN-432] art. 5º §1º-2º                               |
| `alcohol-forward` (UX-MOB-055)                  | Mensagem explícita de que finalizar o AIT **não espera** resultado de exame de sangue/laboratorial                                               | [JRN-TEAT-003]; [REF-CONTRAN-432] art. 3º §3º                                  |
| `alcohol-term` (UX-MOB-057)                     | Conteúdo mínimo estruturado por campo (aparelho, nº teste, medição, valor considerado, limite, testemunha, mídia, recusa)                        | [JRN-TEAT-003]; [REF-CONTRAN-432] art. 8º                                      |
| `ait-frame`/`ait-frame-detail` (UX-MOB-023/024) | "Constatação sem abordagem" deixa de ser texto livre; deriva-se do enquadramento (Casos 1/2/3 do MBFT), com justificativa só quando o caso exige | handoff UX do dossiê, item 1; [REF-CONTRAN-985-1003-MBFT] Seção 7              |
| `removal` (UX-MOB-042)                          | Oferecer guarda monitorada como ramo **antes** de acionar reboque, quando elegível                                                               | [JRN-TEAT-004]; [REF-CONTRAN-1025-2026] art. 17                                |
| `inventory` (UX-MOB-043)                        | Adicionar os 4 campos do §1º do art. 14 (objetos deixados, equipamento ausente, estado de conservação, prazo de retirada)                        | [JRN-TEAT-004]; [REF-CONTRAN-1025-2026] art. 14 §1º                            |
| `measure-term` (UX-MOB-045)                     | Conteúdo mínimo dos 7 campos do _caput_ do art. 14; mensagem de que recusa de assinatura não invalida a notificação                              | [JRN-TEAT-004]; [REF-CONTRAN-1025-2026] art. 14 §2º                            |

### Delta de chrome global (não é uma tela isolada)

Indicador persistente de gravação de bodycam (ativo/pausado por exceção/falha) — visível em toda
tela durante o período de serviço operacional, não apenas nas telas de AIT. Reaproveita
`support`/`diagnostics` (UX-MOB-084/083) para o registro formal de falha, mas o indicador em si
precisa estar sempre visível, não escondido dentro de um menu ([JRN-TEAT-005]).

**Contagem total do delta desta rodada:** 4 telas novas propostas + 9 telas existentes com
conteúdo/comportamento alterado + 1 elemento de chrome global = **14 pontos de UX** tocados,
sobre um inventário oficial de 67 telas mobile.

## (c) Pontos de contato com o cidadão na via

O TEAT não é citizen-facing como o PORTAL, mas o agente **é** o ponto de contato humano do órgão
com o cidadão no momento mais tenso do processo — a via pública. Ver
`transversal/portal/_intake/ux-notes.md` §c para o guia de linguagem simples do lado digital
(PORTAL); aqui, o que o agente entrega/diz no local:

- **Via impressa do AIT.** Duas vias, impressas em tempo real quando aplicável, com qualidade de
  papel que garanta legibilidade por pelo menos 2 anos e aviso de que a presença do código
  RENAINF é obrigatória para a validade da multa ([REF-SENATRAN-997] Anexo III, a/d/g). Campo de
  assinatura do infrator presente na via impressa (Anexo III, f).
- **QR code na via impressa — proposta de produto, sem base normativa localizada.** Nenhuma das
  fontes lidas exige QR code no AIT em si (o QR Code encontrado no corpus, [REF-CONTRAN-985-1003-MBFT],
  refere-se à placa do veículo — Res. CONTRAN 969/2022 —, não ao documento do AIT). Sugestão de
  UX, marcada explicitamente como decisão de produto a validar com BPO: um QR na via impressa
  levando ao andamento do caso no PORTAL evitaria o cidadão precisar digitar número de AIT
  manualmente depois — não é exigência legal, é conveniência.
- **Roteiro de assinatura/ciência.** Frase pronta, curta, para o agente usar ao oferecer a
  assinatura: assinar é **ciência do ato, não concordância com o mérito** — mesmo padrão em AIT
  ([RN-TEAT-005]), termo de medida administrativa e termo de alcoolemia. Reduz a recusa "por
  princípio" de condutores que temem que assinar seja admitir culpa.
- **Roteiro de recusa que não invalida.** Ao recolher veículo, a norma já resolve a disputa mais
  comum no local: presença no momento do recolhimento conta como notificação **mesmo com
  recusa de assinatura** ([REF-CONTRAN-1025-2026] art. 14 §2º) — o agente não precisa (nem
  deveria) insistir ou negociar a assinatura; só registrar e seguir.
- **Roteiro de bodycam — transparência como prática, não exigência normativa localizada.**
  Nenhuma das fontes lidas ([REF-DETRANAM-TALAO-BODYCAM]) impõe dever explícito de avisar o
  cidadão que a gravação está em curso. Recomenda-se, como prática de transparência (marcada como
  decisão de produto), disponibilizar ao agente uma frase curta e opcional de aviso — sem
  transformar isso em passo obrigatório que atrase a abordagem.
- **Margem de erro do etilômetro.** Explicação pronta de que o valor considerado já descontou a
  margem de tolerância metrológica — ver [JRN-TEAT-003] passo 3; é o ponto de maior potencial de
  conflito verbal do procedimento.

## (d) Princípios de interação com segurança em primeiro lugar

1. **Minimizar tempo de tela em exposição ao tráfego.** Ações rápidas e essenciais na frente;
   preenchimento detalhado (observações longas, revisão fina) pode esperar o agente estar em
   posição segura, fora do fluxo de veículos.
2. **De-escalada antes de confronto.** Guarda monitorada oferecida antes de acionar reboque
   ([JRN-TEAT-004]) é, além de conveniência legal, uma escolha de segurança — menos tempo de
   espera tenso na via.
3. **Gravação como proteção mútua, não vigilância.** O indicador persistente de bodycam
   ([JRN-TEAT-005]) comunica ao próprio agente, visualmente, que a interação está documentada —
   reforço de conduta profissional sob pressão, e prova em caso de alegação futura.
4. **Integridade de sessão é segurança jurídica do agente, não só do sistema.** A troca de
   dispositivo mal declarada ([JRN-TEAT-006]) pode colocar o próprio agente sob apuração por algo
   que não é fraude — a UX de declarar o incidente existe para proteger Régis tanto quanto o
   sistema.
5. **Nunca travar o agente num formulário em situação de risco.** Todo fluxo precisa suportar
   "sair agora, retomar depois" sem perda de dado — um agente não pode ficar preso numa tela
   enquanto uma situação na via exige atenção imediata.
6. **Fila nunca serializada por um único caso difícil.** Um caso complicado (recusa,
   discussão, espera de reboque) não pode bloquear o agente de abrir e trabalhar outro caso em
   paralelo ([JRN-TEAT-003] passo 11; [JRN-TEAT-004] passo 4).

## (e) Notas de acessibilidade

- Alvo de toque mínimo compatível com uso de luva (ver §a.4); nunca depender só de gesto fino.
- Contraste AA como piso, testado em condições de sol direto e de tema escuro noturno — a
  legibilidade sob sol forte de Manaus é, na prática, um requisito de acessibilidade situacional
  tão relevante quanto contraste para baixa visão.
- Informação crítica (falha de bodycam, sessão concorrente, prazo de 5 dias para reaver CNH em
  alcoolemia) nunca só por cor — sempre rótulo textual explícito, mesmo padrão adotado pelo
  console do RAIT (`inf/rait/_intake/ux-notes.md` §d).
- Checklists estruturados (sinais psicomotores, elegibilidade de guarda monitorada, campos
  mínimos de termo) reduzem carga cognitiva sob estresse — mesma lógica de acessibilidade
  cognitiva usada no PORTAL (`transversal/portal/_intake/ux-notes.md` §d), adaptada ao contexto de
  campo em vez de formulário longo.
- Campos de texto longo (observações) deveriam suportar preenchimento por voz-para-texto como
  alternativa ao teclado — proposta de produto para reduzir tempo de tela e erro de digitação com
  luva ou sob chuva; sem base normativa localizada, é decisão de UX.
- Nenhuma fonte lida trata de requisito multilíngue para o aplicativo do agente — fora de escopo
  desta rodada.

## (f) Anti-padrões a evitar

1. **Deixar o agente compor, na hora, a explicação de um conceito técnico ao condutor** (margem de
   erro, recusa vs. impossibilidade, recolhimento válido mesmo com recusa de assinatura) — a
   interface carrega a frase pronta; ver §a.6 e §c.
2. **Tratar recusa e impossibilidade técnica como o mesmo campo** — consequência jurídica
   diferente em alcoolemia ([RN-TEAT-005], [REF-CONTRAN-432] art. 6º) exige UX que force a
   distinção, nunca infira por padrão.
3. **Logar em dispositivo reserva sem declarar o incidente** — risco de apuração indevida sobre
   AITs legítimos ([JRN-TEAT-006]); a UX de declaração de incidente precisa existir antes de
   qualquer atalho de "trocar de aparelho".
4. **Bloquear a lavratura por falha de bodycam ou de evidência anexada** — falha gera pendência
   registrada, nunca impede o ato legal ([RN-TEAT-002], estendido por analogia em
   [JRN-TEAT-005]).
5. **Oferecer guarda monitorada, remoção ou qualquer medida como texto de lei para o agente
   interpretar no local** — sempre checklist objetivo de sim/não, nunca artigo cru na tela de
   campo.
6. **Misturar a homologação SENATRAN do software com a homologação de dispositivo do supervisor**
   na mesma tela/checklist — são dois atos de governança distintos, com donos distintos
   ([JRN-TEAT-002]).
