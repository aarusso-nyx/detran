---
id: UX-NOTES-PORTAL
title: Notas de UX — PORTAL (trilha de apelação de multas + serviços greenfield)
status: draft
apps: [portal, rait, boat, pec, dashboard]
sources:
  [
    REF-CONTRAN-900,
    REF-CONTRAN-918,
    REF-CONTRAN-931,
    REF-CTB-extracts-raw,
    REF-BENCH-ESTADOS,
    REF-DETRANAM-SERVICOS,
    REF-DETRANAM-PORTARIA-5046,
    REF-LEI-14129-2021,
    REF-LEI-13460-2017,
    REF-DECRETO-10543-2020,
    REF-DECRETO-8936-2016,
    REF-LEI-13146-2015-acessibilidade,
    REF-DECRETO-5296-2004,
    REF-CONTRAN-809-2020,
    REF-LEI-13709-2018,
    REF-CONTRAN-808-2020,
  ]
updated: 2026-08-24
---

Notas de trabalho do especialista UX para o PORTAL. Base original (rodada RAIT) cobria só a trilha
de apelação de multas — [JRN-PORTAL-001], [JRN-PORTAL-002], [JRN-PORTAL-003] — e é preservada aqui,
revisada em lugar (ver notas de revisão nos próprios arquivos), não substituída. Esta extensão
(rodada transversal, `research-dossier.md` 2026-08-25) cobre os oito serviços greenfield
([JRN-PORTAL-004] a [JRN-PORTAL-011]) e reestrutura as notas em torno de três eixos que a pesquisa
desta rodada tornou explícitos: a Carta de Serviços como obrigação legal ativa (não página morta), a
matriz de identidade/assinatura por ato, e a acessibilidade como conformidade legal, não cortesia de
produto. Ver também `inf/rait/_intake/ux-notes.md` (inventário RAIT/bastidor), `est/boat/_intake/
ux-notes.md` (doutrina de mascaramento por identidade, reaproveitada em §h) e `ch/pec/_intake/
ux-notes.md` (vocabulário legal traduzido, reaproveitado em §c e em [JRN-PORTAL-008]).

## (a) Inventário de telas — mapeado a UC/WF

> **PROMOVIDO (2026-08-26).** Virou [IU-PORTAL-001](../screens/IU-PORTAL-001.md), com a tela de
> elevação de nível acrescentada ([UC-PORTAL-019]), acessibilidade tratada como obrigação de
> resultado e a marcação das telas dependentes de decisão. As tabelas abaixo ficam como registro
> histórico.

### Trilha de apelação de multas (base original, preservada)

| Tela                                 | UC                                     | Notas                                                                                                                            |
| ------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Detalhe da autuação (NA/NP)          | entrada de [UC-PORTAL-001]/[002]/[004] | três caminhos (defender, indicar condutor, pagar) sempre visíveis juntos, sem viés visual para pagar                             |
| Assistente de defesa prévia (wizard) | [UC-PORTAL-001]                        | formulário guiado, pré-preenchido, checklist de anexos sem documentos do próprio órgão; elevação de assinatura embutida (ver §e) |
| Assistente de recurso à JARI         | [UC-PORTAL-002]                        | mesmo padrão do wizard de defesa + banner de efeito suspensivo                                                                   |
| Assistente de recurso ao CETRAN      | [UC-PORTAL-003]                        | anexos de ofício do parecer/conclusão da JARI já visíveis, não editáveis pelo cidadão                                            |
| Assistente de indicação de condutor  | [UC-PORTAL-004]                        | dois caminhos de assinatura (remota gov.br / upload assinado), ambos em nível avançado                                           |
| "Meus processos" (lista)             | [UC-PORTAL-005]                        | status em linguagem cidadã, ordenável por urgência de prazo                                                                      |
| Detalhe do processo (linha do tempo) | [UC-PORTAL-005], [UC-PORTAL-009]       | separa "com você" de "com o órgão"; histórico de documentos sempre acessível                                                     |
| Confirmação de desistência           | [UC-PORTAL-006]                        | explica consequência antes de confirmar; não é um clique único sem contexto                                                      |
| Adesão ao SNE                        | [UC-PORTAL-007]                        | separada da decisão de pagar com 40%/60% — ver [JRN-PORTAL-005]                                                                  |
| Tela de decisão (resultado)          | [UC-PORTAL-008]                        | resultado + resumo em linguagem simples + próximo passo como ação clicável                                                       |
| Resposta a diligência (upload)       | [UC-PORTAL-009]                        | contador de prazo destacado; confirmação de recebimento imediata                                                                 |
| Caixa de entrada / notificações      | transversal a todos                    | push/e-mail/SNE; cada notificação linka direto para a tela relevante, nunca para a home genérica                                 |

### Serviços greenfield (esta rodada — todas propostas, sem tela existente confirmada)

| Tela proposta                                                      | Jornada                            | Notas                                                                                      |
| ------------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Minhas multas e pontuação (resposta direta + lista)                | [JRN-PORTAL-004]                   | ponto de entrada mais frequente do produto; resposta objetiva antes da tabela              |
| Como funciona a pontuação (explicativo)                            | [JRN-PORTAL-004]                   | distingue pontos definitivos de pontos em disputa                                          |
| Adesão ao SNE (configuração, neutra)                               | [JRN-PORTAL-005]                   | separada da decisão de pagamento por multa — nunca a mesma tela                            |
| Comparação de pagamento (80% mantém recurso vs. 60% abre mão dele) | [JRN-PORTAL-005], [JRN-PORTAL-010] | intercepta o clique de pagar, nunca pré-selecionada                                        |
| Meus documentos (CNH digital / CRLV-e)                             | [JRN-PORTAL-006]                   | abre offline, autenticação local, modo bateria crítica                                     |
| Buscar meu boletim de sinistro (BAT)                               | [JRN-PORTAL-007]                   | busca por vocabulário coloquial; restrita a sinistros do próprio usuário                   |
| Detalhe do sinistro (mascarado por identidade)                     | [JRN-PORTAL-007]                   | reaproveita `est/boat` — ver §h                                                            |
| Meu resultado de exame de aptidão                                  | [JRN-PORTAL-008]                   | vocabulário legal federal, nunca renomeado; ponte para entrevista devolutiva               |
| Nova manifestação (ouvidoria)                                      | [JRN-PORTAL-009]                   | nunca recusa recebimento; protocolo imediato                                               |
| Acompanhar manifestação (relógio 30+30 dias)                       | [JRN-PORTAL-009]                   | só o prazo do cidadão para o órgão, nunca o prazo interno de 20 dias do agente à ouvidoria |
| Pagar sem abrir mão do recurso                                     | [JRN-PORTAL-010]                   | rótulo explícito do botão, nunca "pagar" ambíguo                                           |
| Meus dados (LGPD)                                                  | [JRN-PORTAL-011]                   | ponto único, dado bruto completo para o titular, correção como ação de primeira classe     |
| Carta de Serviços (por serviço, com prazo e nível de assinatura)   | transversal — ver §d               | superfície de produto, não documento estático                                              |

**Total: 13 telas núcleo da trilha original (revisadas) + 13 telas propostas dos 8 serviços
greenfield** — cobertura ainda parcial do mapa de escopo do `research-dossier.md` (pagamento
avulso de taxas/serviços fora do fluxo de multa e emissão de ATPV-e continuam fora de escopo desta
rodada, registrados como backlog).

## (b) Blueprint de serviço (frontstage / backstage / sistemas) — trilha de apelação

| Fase                       | Frontstage (cidadão vê)                               | Backstage (RAIT)                                                                 | Sistemas                            |
| -------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| Autuação                   | Detalhe da autuação com prazos vivos                  | AIT lavrado, NA expedida ([WF-INF-001])                                          | TEAT → RAIT/PORTAL                  |
| Interposição               | Wizard de defesa/recurso/indicação                    | Intake multi-canal ([JRN-RAIT-003]); triagem de admissibilidade ([JRN-RAIT-001]) | PORTAL, Protocolo Virtual, Correios |
| Instrução                  | "Aguardando você" / "com o órgão" na linha do tempo   | Instrução, diligência com timer ([JRN-RAIT-001])                                 | RAIT                                |
| Julgamento 1º circuito     | Notificação de resultado                              | Minuta + assinatura da autoridade                                                | RAIT                                |
| Julgamento 2º circuito     | Notificação de pauta + resultado                      | Distribuição, voto, sessão, ata ([JRN-RAIT-002])                                 | RAIT                                |
| Decisão                    | Tela de decisão com próximo passo                     | Comunicação disparada ao assinar                                                 | RAIT → PORTAL (mesmo dia)           |
| Pós-decisão                | Restituição / pagamento / 2ª instância                | RENACH atualizado só após esgotados recursos                                     | RAIT → RENACH                       |
| Todo o ciclo (transversal) | Radar de prazo não exposto ao cidadão como número cru | Radar de prescrição ([JRN-RAIT-004])                                             | DASHBOARD                           |

Os oito serviços greenfield têm bastidores mais curtos (consulta direta ou um único ato), sem
justificar uma tabela de blueprint própria — a doutrina de linguagem simples e prazo (§c) se aplica
igualmente.

## (c) Guia de conteúdo e linguagem simples

### Mapa de estado interno → status cidadão (trilha de apelação)

| Estado interno ([WF-RAIT-001])                       | Status no PORTAL                    |
| ---------------------------------------------------- | ----------------------------------- |
| `RECEBIDO`                                           | "Protocolo recebido"                |
| `TRIAGEM(ADMISSIBILIDADE)`                           | "Em análise inicial"                |
| `DISTRIBUIDO(analista\|relator)`                     | "Em análise"                        |
| `EM_ANALISE`                                         | "Em análise"                        |
| `DILIGENCIA` (aguardando o cidadão)                  | "Aguardando você — envie até DD/MM" |
| `DILIGENCIA` (aguardando o órgão processar resposta) | "Recebemos seu envio — em análise"  |
| `PRONTO_PARA_JULGAMENTO` / `PAUTADO`                 | "Aguardando julgamento"             |
| `SESSAO_JARI`                                        | "Em sessão de julgamento"           |
| `DECIDIDO` / `DECISAO_AUTORIDADE`                    | "Decisão publicada"                 |
| `COMUNICADO`                                         | (tela de decisão — [UC-PORTAL-008]) |

Nunca expor o nome do estado interno cru na interface; o mapa acima é a fonte única de tradução —
qualquer novo estado do [WF-RAIT-001] precisa de uma entrada correspondente aqui antes de ir a
produção. O mesmo princípio, com fonte própria, rege o vocabulário de resultado do PEC (ver
[ch/pec/_intake/ux-notes.md] §c, reaproveitado integralmente em [JRN-PORTAL-008]) e o de sinistro do
BOAT (RENAEST/`pending_complement` nunca vazam cru — [JRN-PORTAL-007]).

### Princípios da carta de decisão (linguagem simples)

1. **Resultado primeiro.** A primeira frase visível é o resultado (cancelada / mantida), nunca o
   fundamento jurídico. O fundamento vem depois, resumido.
2. **Um próximo passo, não uma lista de possibilidades.** Se cabe recurso, a tela mostra UM botão de
   ação ("Recorrer ao CETRAN"), não uma explicação genérica de "vias recursais disponíveis".
3. **Nunca número sem contexto.** "24 meses" nunca aparece como prazo esperado de espera — é teto
   legal de inércia do órgão ([REF-CTB-extracts-raw] art.285 §6º/art.289-A), mostrado (se mostrado)
   só em conteúdo de ajuda/FAQ, não na tela de acompanhamento cotidiana.
4. **Distinguir sempre "prazo seu" de "prazo do órgão".** Regra transversal de todo o PORTAL,
   incluindo os serviços greenfield: o relógio de 30+30 dias da ouvidoria pertence ao cidadão, o
   relógio interno de 20 dias entre a ouvidoria e um agente público não ([JRN-PORTAL-009]).
5. **Documento formal sempre disponível, mas não é a explicação principal.** O parecer/ata original,
   o BAT, o laudo do exame — todos ficam baixáveis, mas a tela não obriga o cidadão a lê-los para
   entender o resultado ([JRN-PORTAL-007], [JRN-PORTAL-008]).
6. **Vocabulário legal se traduz, nunca se renomeia.** "Apto com restrições" explica-se; nunca vira
   um rótulo de produto novo ("elegível parcial" etc.) — doutrina herdada de `ch/pec/_intake/
ux-notes.md` §c, aplicável a qualquer vocabulário legal que o PORTAL superficiar no futuro.

### Exibição de prazos e valores

- Prazos contam em dias corridos, prorrogados para o próximo dia útil quando o vencimento cai em
  feriado/fim de semana ([REF-CONTRAN-918] art.29; [RN-RAIT-005]) — a UI sempre mostra a data final
  já calculada e prorrogada, nunca "30 dias corridos" cru exigindo que o cidadão calcule.
- Valores de pagamento: **três ofertas distintas, nunca confundidas na mesma tela** — pagar por 80%
  mantendo o recurso (art.284 caput), pagar por 60% abrindo mão do recurso via SNE (art.284 §1º,
  [JRN-PORTAL-005]), e pagar antecipado por 80% sem prejuízo do recurso em qualquer fase
  ([REF-CONTRAN-918] art.33, [JRN-PORTAL-010]). O rótulo do botão precisa dizer a consequência
  ("pagar sem abrir mão do recurso" ≠ "pagar e encerrar"), nunca só "pagar".
- Notificação eletrônica (SNE): sempre lembrar que a ciência conta 30 dias após disponibilização +
  envio, não da leitura ([REF-CONTRAN-931] art.4º §6º) — evita a suposição de "instantâneo". A
  **adesão ao SNE em si** (ato neutro, reversível) nunca deve ser confundida, na mesma tela, com a
  **declaração de não recorrer** que dá o desconto de 40% — são decisões diferentes ([JRN-PORTAL-005]).

### Tom

Direto, sem jargão processual não explicado, sem tom punitivo mesmo em decisões desfavoráveis ao
cidadão. Frases curtas. Nunca usar linguagem que sugira culpa do cidadão pela demora do órgão. Em
conteúdo clínico ou de saúde (resultado de exame, dado de sinistro), o mesmo princípio se aplica sem
excepcionalidade: informar com clareza, nunca com alarme.

## (d) A Carta de Serviços como superfície de produto, não página morta

**Achado desta rodada: a Carta de Serviços do DETRAN-AM tem gap de conteúdo obrigatório.**
[REF-LEI-13460-2017] art.7º §2º, IV exige que cada serviço publicado traga **prazo máximo de
prestação**; o §3º exige detalhamento de tempo de espera e mecanismos de consulta de andamento por
serviço. A auditoria do dossiê de pesquisa confirma que o catálogo hoje (`detran.am.gov.br/
servicos/`) tem os serviços listados, mas não esse conteúdo mínimo. Isso não é só um problema de
conteúdo do site institucional — é uma oportunidade de produto que o PORTAL não deveria desperdiçar.

**A Carta de Serviços deveria ser gerada a partir dos mesmos dados que alimentam o PORTAL, nunca
mantida como texto solto à parte.** Cada serviço do catálogo (defesa de multa, indicação de
condutor, adesão ao SNE, emissão de CRLV-e, manifestação na ouvidoria, consulta de exame de aptidão
etc.) deveria ter, como um único registro de origem: o prazo máximo real (art.7º §2º, IV), o nível
de assinatura eletrônica exigido (art.13, II do [REF-DECRETO-10543-2020] — obrigação federal, boa
prática forte para o AM), os documentos realmente necessários (nunca os que o órgão já tem — art.5º,
XI/XV da 13.460), e o canal de acompanhamento de andamento (art.7º §3º, V). Esse registro alimenta
tanto a página pública da Carta de Serviços quanto a própria tela do serviço no PORTAL — a mesma
fonte, duas superfícies, nunca dois textos que podem divergir.

**Consequência de produto — cada wizard do PORTAL nasce com sua "ficha de carta de serviços"
preenchida antes de ir ao ar.** Nenhum serviço novo (os oito greenfield desta rodada incluídos)
deveria ser lançado sem essas quatro respostas registradas: prazo máximo, nível de assinatura,
documentos exigidos, canal de acompanhamento. Se uma dessas respostas não existe (ex.: prazo do BAT
sem base normativa confirmada — [JRN-PORTAL-007]), a tela e a Carta de Serviços dizem a mesma
verdade parcial, nunca inventam uma resposta numa e omitem na outra.

## (e) Matriz de identidade × ato, em linguagem cidadã

Base normativa: [REF-DECRETO-10543-2020] art.4º (níveis de assinatura eletrônica por ato — piso
federal, boa prática fortemente recomendável para o AM). Distinção que o PORTAL preserva
internamente mas nunca expõe em jargão: **nível de assinatura** (o que a lei exige por tipo de ato)
não é o mesmo eixo que **nível de conta gov.br** (bronze/prata/ouro — classificação operacional da
Plataforma, sem norma própria confirmada). O cidadão nunca vê "assinatura avançada" nem
"bronze/prata/ouro" nas telas — vê a explicação abaixo, no momento em que precisa.

| Ato no PORTAL                                         | Nível exigido (base legal)                                                                                              | Frase para o cidadão                                                                                                                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Consultar multas, pontuação, CNH, sinistro, exame     | Simples (Decreto 10.543/2020 art.4º, I "b")                                                                             | (nenhuma — login básico já é suficiente, nenhuma tela pede confirmação extra)                                                                                        |
| Aderir ao SNE (só a adesão, sem decisão de pagamento) | Simples a avançada (autocadastro, art.4º, II "d")                                                                       | "Isso não muda seu direito de recorrer — é só sobre como você recebe notificações."                                                                                  |
| Protocolar defesa ou recurso (JARI/CETRAN)            | Avançada, expressamente (art.4º, II "h")                                                                                | "Para assinar seu recurso, você precisa confirmar sua identidade com um passo a mais — leva menos de dois minutos."                                                  |
| Indicar condutor                                      | Avançada (declaração com efeito sobre terceiro, art.4º, II "f")                                                         | "Como essa indicação transfere a responsabilidade para outra pessoa, pedimos uma confirmação extra da sua identidade — e da identidade de quem você está indicando." |
| Pagar (qualquer regime)                               | Simples para solicitar a guia; segurança da transação em si é do meio de pagamento (PIX/cartão/SPB), fora deste Decreto | (nenhuma — a segurança do pagamento em si é do meio escolhido, não um passo extra do PORTAL)                                                                         |

**A elevação, quando necessária, é um passo guiado dentro da própria tarefa, nunca um muro
antecipado.** O momento certo de pedir confirmação extra de identidade é o momento em que o ato que
exige isso está prestes a acontecer (assinar a defesa, confirmar a indicação) — nunca como
pré-requisito de cadastro genérico que interrompe Maria, Carlos ou Josué antes mesmo de saberem
por que precisam disso. Ver [JRN-PORTAL-001] passo 2 e [JRN-PORTAL-002] passo 3 para o desenho
completo desse momento guiado, reaproveitado em toda tela que exija assinatura avançada.

## (f) Acessibilidade como conformidade legal — não cortesia de produto

**A obrigação é vinculante, não uma boa prática opcional.** [REF-LEI-13146-2015-acessibilidade]
(LBI) art.63 exige acessibilidade em sítios de governo "conforme as melhores práticas [...]
adotadas internacionalmente"; o [REF-DECRETO-5296-2004] art.47 repete o comando desde 2004 (prazo
histórico já exaurido — a obrigação é permanente e imediatamente exigível). O padrão técnico de
referência (WCAG 2.1 AA / eMAG / gov.br Design System) não é, ele mesmo, norma vinculante ao
DETRAN-AM — é a **evidência técnica de cumprimento** do comando de resultado que a lei já impõe.
Tratar acessibilidade como "melhoria futura" é, juridicamente, tratar uma obrigação legal ativa como
opcional — o vocabulário certo em qualquer discussão de priorização é "conformidade pendente", não
"nice to have".

**Casos reais, não checklist abstrato:**

- **Leitor de tela no wizard de recurso.** O formulário mais longo e mais consequente do PORTAL
  ([JRN-PORTAL-001]) precisa de navegação por teclado completa, mensagens de erro associadas ao
  campo (não só resumo no topo), e nomes de campo que fazem sentido lidos em voz alta fora de
  contexto visual ("Data do vencimento da defesa", não "Data" solto). Um cidadão cego perdendo o
  prazo de defesa por um formulário inacessível não é um problema de usabilidade — é a lei
  falhando silenciosamente para quem ela deveria proteger com mais força.
- **Contraste sob sol.** Grande parte do uso do PORTAL no Amazonas acontece ao ar livre, em telas de
  celular sob luz direta — o contraste mínimo AA precisa ser testado nessa condição real, não só em
  ambiente de escritório; banners de prazo/urgência nunca dependem só de vermelho/laranja (ícone +
  texto sempre).
- **Alvo de toque.** Formulários preenchidos no celular, muitas vezes por quem tem menos prática com
  telas pequenas (público mais velho, primeira vez usando um serviço digital do governo) — alvos de
  toque generosos (mínimo 44×44px efetivo) em qualquer botão de ação, especialmente nos momentos de
  maior consequência (assinar, confirmar pagamento, confirmar desistência).
- **Libras onde há atendimento.** Nos poucos pontos em que o PORTAL abre canal de atendimento humano
  (ouvidoria com necessidade de esclarecimento, entrevista devolutiva do PEC referenciada em
  [JRN-PORTAL-008]), a disponibilidade de Libras/comunicação acessível não é um extra — sem ela, o
  próprio ato pode não ser válido para quem precisa dele (mesmo princípio já fixado em
  `ch/pec/_intake/ux-notes.md` §f para a entrevista devolutiva).

**Formato acessível de cobrança, sob solicitação.** LBI art.62 garante o direito a boleto/guia em
formato acessível mediante solicitação — o módulo de pagamento ([JRN-PORTAL-010]) precisa oferecer
essa opção de forma explícita, não só como exportação PDF padrão indistinta.

**Linguagem simples é também acessibilidade cognitiva** — não apenas estilo de redação (ver §c).

## (g) Mobile-first e a realidade amazonense

O público majoritário do PORTAL no Amazonas acessa por celular, com conectividade intermitente
(especialmente fora da capital), dados móveis caros, e frequentemente um **aparelho compartilhado ou
familiar**, não um dispositivo pessoal exclusivo. Três implicações concretas, já expressas nas
jornadas greenfield desta rodada:

1. **Documentos que precisam abrir sem sinal — não "seria bom", é o cenário mais comum.**
   [JRN-PORTAL-006] (CNH digital/CRLV-e numa fiscalização) modela o caso extremo (sem sinal, bateria
   crítica) porque é o caso real de estrada no interior, não uma borda rara. Qualquer tela que
   dependa de "carregando..." no momento de uso mais crítico já falhou o desenho.
2. **Dados caros mudam o que "carregar em segundo plano" significa.** Sincronizar documentos
   proativamente (§ acima) precisa ser econômico em dados — payloads pequenos, sem recarregar imagem
   pesada a cada abertura, com controle claro de quando a sincronização usa dados móveis versus
   Wi-Fi.
3. **Aparelho compartilhado é uma questão de privacidade, não só de UX.** Se o celular usado para
   acessar o PORTAL é da família (comum em domicílios de baixa renda), qualquer notificação com
   prévia visível na tela de bloqueio (resultado de exame, resultado de multa, conteúdo de sinistro)
   pode expor informação sensível a quem não é o titular — a mesma regra já fixada para o PEC
   ("nenhum resultado em painel público/monitor compartilhado", `ch/pec/_intake/ux-notes.md` §b) se
   estende à tela de bloqueio do próprio celular: notificações neutras ("seu resultado está
   disponível"), conteúdo sensível só dentro do app autenticado, nunca na prévia. Sessão com logout
   automático razoável e fácil de fazer, para quem empresta o aparelho a outra pessoa da casa depois
   de consultar algo sensível.

## (h) Mascaramento e revelação por identidade (titular × terceiro)

Doutrina herdada integralmente de `est/boat/_intake/ux-notes.md` §d e `ch/pec/_intake/ux-notes.md`
§d — não reinventada aqui, aplicada à superfície onde o cidadão de fato a encontra pela primeira
vez no PORTAL:

1. **A máscara depende de quem está pedindo e por quê, não de uma lista fixa de campos
   públicos/privados.** [JRN-PORTAL-007]: o que Fábio vê do próprio sinistro é diferente do que a
   vítima veria consultando o mesmo caso — cada um vê seus próprios dados sensíveis por completo e
   os dados de terceiros só no estritamente necessário (placa/seguradora, nunca CPF/endereço de
   outro envolvido).
2. **O titular vendo o próprio dado é a exceção confirmatória ao mascaramento, nunca um caso à
   parte.** [JRN-PORTAL-008] (resultado clínico) e [JRN-PORTAL-011] ("Meus dados", LGPD): onde
   qualquer outro papel veria um resumo validado, o próprio titular vê o conteúdo completo —
   mascarar o dado do próprio dono seria inverter minimização, não aplicá-la.
3. **Nenhum resultado sensível em painel público, notificação com prévia, ou lugar compartilhado** —
   ver §g.3.
4. **Nenhuma base legal de tratamento LGPD afirmada com falsa certeza.** Se a tela precisa citar
   fundamento (dado de saúde, dado de sinistro), usa linguagem genérica até confirmação jurídica da
   hipótese exata — mesmo cuidado de `est/boat` §d.6 e `ch/pec` §d.5, estendido a [JRN-PORTAL-011].
5. **Vocabulário de bastidor nunca vaza para a tela do cidadão** — nomes de estado interno
   (RENAEST, `pending_complement`, `CONDICIONADO`) são sempre traduzidos antes de chegar à tela,
   nunca expostos crus (ver §c).

## (i) Anti-padrões a evitar (aprendidos da operação atual do AM, de outros estados, e desta rodada)

1. **Formulário PDF para preencher à mão como único meio** — prática atual da defesa prévia no
   AM ([REF-DETRANAM-SERVICOS]); o PORTAL deve tratar o formulário digital como a via primária, não
   um espelho de um PDF.
2. **Exigir endosso cartorial para documento de fora do estado** — a Portaria DETRAN-AM 5046/2018
   art.2º §2º já permite reconhecimento de firma por autenticidade no próprio balcão/atendimento,
   sem cartório; a carta de serviço atual sugere cartório além do necessário — não repetir esse
   atrito na linguagem do PORTAL.
3. **Canais paralelos sem estado unificado** — risco identificado no modelo PR se mal integrado
   ([REF-BENCH-ESTADOS]); o PORTAL é a única fonte de verdade do status do cidadão, mesmo quando o
   caso nasceu no balcão ou pelos Correios ([JRN-RAIT-003]).
4. **Confundir teto legal de julgamento (24 meses) com SLA de atendimento** — nunca apresentar como
   "tempo normal de espera"; SLA operacional real (30 dias úteis, meta interna) é o número relevante
   para a experiência cotidiana.
5. **Pedir de volta documento que o órgão já tem** (NA/AIT/NP, parecer da JARI) — vedado por
   [REF-CONTRAN-900] art.5º § único, agora também por [REF-LEI-14129-2021] art.3º XIII/art.26
   (condicionado à confirmação de adesão do AM — ver [JRN-PORTAL-001]); qualquer checklist de
   anexos que inclua esses documentos é bug de conteúdo, não apenas uma escolha de copywriting.
6. **Confundir "aderir ao SNE" com "abrir mão do recurso".** São duas decisões diferentes — a
   primeira é neutra e reversível, a segunda tem consequência jurídica real. Uma tela que as
   apresenta juntas, ou que rotula um botão só como "pagar" sem dizer qual das três ofertas é, gera
   exatamente a confusão que [JRN-PORTAL-005] e [JRN-PORTAL-010] existem para evitar.
7. **Elevação de identidade como muro antecipado.** Pedir confirmação extra de identidade como
   pré-requisito genérico de cadastro, antes de o cidadão saber por que precisa disso, em vez de
   como passo guiado embutido no momento exato do ato que exige o nível mais alto — ver §e.
8. **Renomear ou inventar um rótulo de resultado legal.** "Apto com restrições" se explica, nunca
   vira um termo de produto novo; nomes internos de schema (`CONDICIONADO`, `pending_complement`)
   nunca aparecem crus — ver §c e §h.
9. **Prazo inventado quando não há base normativa confirmada.** O BAT do sinistro ([JRN-PORTAL-007])
   e o exercício de direitos LGPD perante o Poder Público ([JRN-PORTAL-011]) são os dois casos mais
   claros desta rodada: mostrar status honesto ("em andamento") é sempre preferível a inventar uma
   data que o órgão pode não cumprir.
10. **Notificação com prévia sensível na tela de bloqueio de um aparelho possivelmente
    compartilhado** — ver §g.3.
11. **Vender a versão digital de um documento (CNH-e, CRLV-e) como "a forma certa" e a impressa
    como residual.** Ambas têm o mesmo valor legal ([REF-CONTRAN-809-2020]; CTB art.159, I); a
    escolha é do condutor, sem hierarquia visual — ver [JRN-PORTAL-006].
