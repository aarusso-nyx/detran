---
id: JRN-BOAT-005
title: Condutor envolvido consulta/obtém seu BAT — o toque cidadão, com dados de terceiros sempre mascarados
status: draft
apps: [boat]
sources:
  [
    'REF-CTB-sinistro-cena-renaest',
    'REF-CONTRAN-808-2020',
    'REF-SENATRAN-PORTARIA-139-2025',
    'RN-BOAT-003',
    'APP-BOAT',
  ]
updated: 2026-08-24
---

## Persona e contexto

Fábio é o condutor do carro envolvido no sinistro de [JRN-BOAT-001] — o motociclista foi levado
pelo SAMU, e agora, dois dias depois, a seguradora de Fábio pede o boletim do sinistro para abrir o
sinistro do seguro. Fábio nunca precisou disso antes; ele não sabe se existe um "BAT" (Boletim de
Ocorrência de Acidente de Trânsito, nome usado pela Res. CONTRAN 808/2020) do jeito que sabe o que
é uma multa. Essa jornada é o único ponto de contato direto do cidadão com o BOAT — todas as outras
jornadas são de agente, hospital ou coordenador.

**Nota de escopo — jornada especulativa, marcada como proposta.** Nenhuma fonte primária lida
confirma, para o DETRAN-AM especificamente, um canal público de autoatendimento para obtenção do
BAT (o modelo mais próximo encontrado, BATEU-PR, é de outro estado, fonte secundária apenas — ver
`_intake/research-dossier.md` §5). Também não foi localizado prazo legal de disponibilização
aplicável ao DETRAN-AM (o único prazo encontrado — 5 dias úteis, prorrogável por mais 5 — é do
modelo BAT/e-DAT da PRF, rodovias **federais**, fonte secundária, não confirmado como aplicável ao
sinistro estadual). Por regra de fronteira desta rodada (write-only em `est/boat/**`), os artefatos
de tela descritos abaixo como pertencentes ao PORTAL são **propostas registradas em
`_intake/ux-notes.md`**, não implementações — nenhum arquivo foi escrito em `transversal/portal/**`
por este trabalho.

## Narrativa ponta-a-ponta

1. **Fábio não sabe o nome certo do documento.** Ele procura "boletim de acidente", "boletim de
   ocorrência de trânsito", "sinistro carro batida" — a busca (proposta de tela em PORTAL) precisa
   reconhecer todos esses termos coloquiais, porque "BAT" e "sinistro de trânsito" são vocabulário
   técnico que só a Lei 14.599/2023 formalizou; ninguém fora do órgão fala assim no dia a dia.
2. **Identificação do sinistro, não busca livre por qualquer sinistro do estado.** Fábio só pode
   localizar sinistros em que ele conste como envolvido (condutor, proprietário do veículo,
   vítima) — nunca uma busca aberta por data/local que exponha sinistros de terceiros. A chave de
   busca (CPF/CNH + dado do veículo, ou número de protocolo se ele já tiver recebido um) é
   deliberadamente estreita.
3. **O que Fábio vê é diferente do que Yasmin registrou.** O sinistro tem dois condutores e uma
   vítima. Fábio, como um dos condutores, vê: dados do próprio veículo e de si mesmo, dados
   objetivos do sinistro (local, data/hora, dinâmica, croqui, classificação de gravidade) — mas
   **não** vê `hospital_destination` nem `health_notes` da vítima, nem os dados pessoais completos
   do outro condutor além do estritamente necessário para o seguro (ex.: placa e seguradora do
   outro veículo, não CPF/endereço). O controle de acesso reforçado de [RN-BOAT-003] não é uma
   regra só para telas internas — aqui ela decide o que aparece ou não na tela do próprio cidadão
   envolvido, aplicando o mesmo princípio de minimização do art. 18 da
   [REF-SENATRAN-PORTARIA-139-2025] a um público que nem é servidor do órgão.
4. **Vítima consultando seu próprio caso é caso diferente.** Se fosse o motociclista (ou seu
   representante legal, no caso de incapacidade) consultando, ele veria seus próprios dados de
   saúde — o mascaramento é por identidade do titular, não por campo fixo; a mesma tela precisa
   saber "de quem" é a sessão para decidir o que revelar, não aplicar uma máscara genérica igual
   para todo mundo.
5. **Documento formal disponível, mas a tela não obriga a lê-lo.** Igual ao princípio já
   estabelecido para decisões de recurso em `transversal/portal/_intake/ux-notes.md` §c, a versão
   "documento oficial" do BAT fica disponível para download (útil para Fábio entregar à seguradora
   tal como está), mas a tela de consulta em si mostra um resumo em linguagem simples primeiro —
   Fábio não precisa decifrar jargão técnico-administrativo só para saber que o sinistro foi
   registrado e onde está o protocolo.
6. **Prazo de disponibilização — informado com a incerteza que existe, não inventado.** Se Fábio
   consulta poucas horas depois do sinistro, e o registro do agente ainda está `in_attendance`/
   `recorded` (não `validated`/`closed`), a tela não promete uma data certa de disponibilização —
   nenhum prazo legal confirmado existe para o caso estadual. Ela mostra o status real do registro
   (ex.: "em andamento — aguardando finalização pelo órgão") em vez de simular um prazo que não tem
   base normativa verificada. Anti-padrão a evitar: copiar o prazo de 5 dias úteis da PRF sem
   confirmação de que se aplica ao DETRAN-AM — isso criaria uma expectativa legal que o órgão pode
   não conseguir cumprir.
7. **Sinistro ainda em `pending_complement`.** Nesse caso específico, o registro de Yasmin está
   pendente de dado de vítima (o motociclista saiu antes da captura completa — [JRN-BOAT-001]).
   Fábio não vê esse detalhe interno ("pendente de complemento de vítima" é vocabulário de
   bastidor); ele só vê "sinistro registrado — em processamento", sem alarme, sem prazo inventado.
8. **Encerramento e transmissão — Fábio não precisa entender RENAEST.** Quando o registro é
   finalmente `integrated`, com protocolo nacional gerado, isso pode aparecer para Fábio como
   simples confirmação de que o registro está "concluído e arquivado" — o nome RENAEST, os estados
   internos `RECEBIDO`/`CONSOLIDADO`, a máquina de três níveis, tudo isso é vocabulário de bastidor
   que nunca deveria vazar cru para a tela do cidadão, mesmo princípio já estabelecido para o
   PORTAL de infrações em `transversal/portal/_intake/ux-notes.md` §c.

## Pontos de contato (apps/canais)

PORTAL (proposta — nenhum artefato escrito neste trabalho; telas descritas registradas como
proposta em `_intake/ux-notes.md`); BOAT/RENAEST como fonte de dado (via API, não diretamente pelo
cidadão); seguradora de Fábio (fora do sistema, apenas destinatário do documento baixado).

## Métricas de sucesso

Zero exposição de dado sensível de terceiro (saúde de vítima, PII de outro envolvido) na consulta
cidadã; zero prazo de disponibilização exibido sem base normativa confirmada; % de consultas que
terminam em download do documento sem necessidade de contato humano com o órgão; zero vocabulário
de estado interno (RENAEST, `pending_complement` etc.) exposto cru na tela do cidadão.
