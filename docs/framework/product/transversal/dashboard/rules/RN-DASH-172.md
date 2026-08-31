---
id: RN-DASH-172
title: Exportação é o ponto de fuga do painel — o arquivo sai do controle de acesso e leva a granularidade consigo
status: draft
apps: [dashboard]
sources: [REF-LEI-13709-2018, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

**Regra.** Todo o esforço de segregação de acesso ([RN-DASH-170]) e de agregação segura
([RN-DASH-160], [RN-DASH-161]) é anulado no instante em que alguém clica em "exportar". O arquivo
gerado **sai do perímetro de controle**: não tem perfil, não tem log de leitura, não expira, é
copiável, anexável e encaminhável. Por isso a exportação não é funcionalidade acessória do painel —
é a **operação de maior risco** que ele oferece, e deve ser tratada com regime próprio.

**Cinco regras de regime.**

1. **A exportação herda a camada, nunca a expande.** Quem vê N1 exporta N1. Não existe "exportar
   detalhado" a partir de uma visão agregada. O caso mais comum de violação é o inverso do esperado: o
   painel mostra um gráfico agregado e o botão exporta a **tabela de origem**.
2. **Exportação é evento auditável de primeira classe**, com registro reforçado
   ([RN-DASH-171]): quem, quando, **quais filtros**, quantas linhas, qual formato, e — para camada N2
   — **finalidade declarada** no ato. Um clique de exportação registra mais do que um clique de
   visualização, porque produz um artefato persistente.
3. **Marca d'água e cabeçalho de classificação** em todo arquivo exportado: identificação do órgão, da
   camada (N0/N1/N2), do usuário, da data-hora e do recorte aplicado. Serve a dois fins — dissuasão e
   rastreabilidade de vazamento. Um arquivo sem procedência é indefensável quando aparece fora.
4. **Vedação absoluta para dado de saúde.** Não existe exportação de camada N3 pelo DASHBOARD, em
   nenhum formato, para nenhum papel — [REF-LEI-13709-2018] art. 13, § 2º: _"não permitida, **em
   circunstância alguma**, a transferência dos dados a terceiro"_, e § 1º: a divulgação de resultados
   _"ou de qualquer excerto"_ **em nenhuma hipótese poderá revelar dados pessoais** ([RN-DASH-162]).
   Uma planilha enviada por e-mail a uma consultoria é transferência a terceiro.
5. **Limite de volume com aprovação.** Exportações acima de um limiar declarado exigem aprovação
   nominal e justificativa. Extração massiva é a assinatura tanto de vazamento quanto de tentativa de
   reidentificação por composição ([RN-DASH-161], item 5) — e é indistinguível de uso legítimo sem um
   ponto de fricção deliberado.

**Base legal.**

- [REF-LEI-13709-2018] art. 5º, X: **extração** e **transferência** são expressamente operações de
  tratamento. Exportar não é ato neutro de conveniência; é tratamento com todas as suas obrigações.
- [REF-LEI-13709-2018] art. 6º, III (necessidade) e VII (segurança); art. 46 (medidas contra acesso
  não autorizado e **comunicação ou difusão** indevidas).
- [REF-LEI-13709-2018] art. 13, §§ 1º e 2º: vedação de revelar dado pessoal em qualquer excerto e
  proibição absoluta de transferência a terceiro.
- [REF-SENATRAN-PORTARIA-139-2025] art. 17, § 2º e [RN-BOAT-132]: a **cessão de acesso a terceiros é
  vedada** sem autorização prévia e expressa da SENATRAN — o que alcança dado obtido dos sistemas
  nacionais e reexportado a partir do painel. Este é um caminho de vazamento especialmente fácil de
  não perceber, porque o dado entrou pelo canal legítimo de integração.

**Verificação.**

1. **Formato aberto para exportação em transparência** ([RN-DASH-151], requisito 1) é dever da LAI —
   mas vale para os **conjuntos públicos derivados**, não para o acervo interno. A mesma palavra
   ("exportar") designa duas operações de regimes opostos, e o produto deve nomeá-las de forma
   distinta: _publicar conjunto_ × _extrair dado interno_.
2. **Painel de exportações** — quem mais exportou no período, maiores volumes, exportações fora de
   horário. É item de revisão periódica do Encarregado, não relatório sob demanda.
3. **Sem exportação silenciosa por API interna.** Se o painel expõe endpoints consumíveis, eles estão
   sujeitos às mesmas cinco regras — inclusive a de volume. API é exportação sem botão.
4. **Impressão e captura de tela** não são controláveis tecnicamente e por isso a defesa é a de
   sempre: **não colocar na tela o que não pode sair dela**. É a razão de fundo da regra N3
   ([RN-DASH-170]) — a única proteção robusta contra a exfiltração de dado sensível de um painel é o
   dado sensível nunca ter sido servido a ele.

**Controvérsia/risco.** _Severidade: alta._ Este é o risco operacional mais provável de todo o bloco,
por três razões: é trivial de executar, tem intenção quase sempre legítima ("preciso montar a
apresentação da diretoria"), e é invisível sem instrumentação dedicada. Em painéis de gestão pública, o
vazamento típico não vem de invasão — vem de uma planilha correta, exportada por alguém autorizado,
para uma finalidade razoável, e encaminhada uma vez a mais.
