---
id: JRN-PORTAL-007
title: Condutor obtém o BAT do próprio sinistro — dados de terceiros sempre mascarados
status: draft
apps: [portal, boat]
sources: [REF-CONTRAN-808-2020, REF-SENATRAN-PORTARIA-139-2025]
updated: 2026-08-24
---

## Persona e contexto

Esta jornada implementa no PORTAL, como proposta de tela, o que [JRN-BOAT-005] especificou como
"o único ponto de contato direto do cidadão com o BOAT". Fábio, condutor envolvido num sinistro dois
dias atrás, precisa do boletim para abrir o sinistro do seguro. Ele não sabe que o documento se
chama "BAT" — procura "boletim de acidente", "boletim de ocorrência de trânsito". Nada nesta
jornada é reescrito do zero: a doutrina de mascaramento por identidade, o vocabulário de busca e o
tratamento de prazo sem base normativa confirmada vêm todos de [JRN-BOAT-005] e de
`est/boat/_intake/ux-notes.md` §d — esta jornada é a versão PORTAL desse mesmo desenho.

**Nota de escopo.** Como em [JRN-BOAT-005], não há confirmação de canal público de autoatendimento
específico do DETRAN-AM nem prazo legal de disponibilização aplicável ao estado (o modelo mais
próximo, BATEU-PR, é de outro estado; o prazo de 5 dias úteis é do modelo BAT/e-DAT da PRF, rodovias
federais, não confirmado como aplicável aqui). Esta jornada é proposta, não implementação.

## Narrativa ponta-a-ponta

1. **Busca por vocabulário coloquial, não pelo nome técnico.** A busca no PORTAL reconhece "boletim
   de acidente", "sinistro carro batida", "boletim de ocorrência de trânsito" e "BAT" como o mesmo
   pedido — ninguém fora do órgão usa a nomenclatura formal da Lei 14.599/2023 no dia a dia.
2. **Localização restrita a sinistros em que Fábio consta como envolvido.** Nunca uma busca aberta
   por data/local que exponha sinistro de terceiros — a chave de busca (CPF/CNH + dado do veículo, ou
   protocolo já recebido) é deliberadamente estreita, mesmo padrão de [JRN-BOAT-005] passo 2.
3. **O que Fábio vê depende de quem ele é no sinistro, não de um campo fixo.** Como um dos condutores
   envolvidos, Fábio vê dados do próprio veículo, dados objetivos do sinistro (local, data/hora,
   dinâmica, croqui, classificação de gravidade) — mas **não** vê `hospital_destination` nem
   `health_notes` da vítima, nem os dados pessoais completos do outro condutor além do estritamente
   necessário para o seguro (placa e seguradora, não CPF/endereço). Se fosse a própria vítima
   consultando, ela veria seus próprios dados de saúde — a máscara é por identidade do titular
   consultando, nunca por uma lista estática de campos públicos/privados ([JRN-BOAT-005] passo 4;
   `est/boat/_intake/ux-notes.md` §d.3).
4. **Resumo em linguagem simples primeiro, documento oficial disponível, nunca obrigatório de ler.**
   A tela de consulta mostra um resumo direto (sinistro registrado, protocolo, data) antes de
   qualquer coisa; o BAT oficial fica disponível para download, útil para Fábio entregar à seguradora
   tal como está — mesmo princípio já fixado para decisões de recurso em
   `transversal/portal/_intake/ux-notes.md` §c.
5. **Status honesto quando o registro ainda não está fechado, sem prazo inventado.** Se o registro
   do agente ainda está em andamento (não validado/fechado), a tela mostra "em andamento — aguardando
   finalização pelo órgão", nunca uma data de disponibilização inventada — nenhum prazo legal
   confirmado existe para o caso estadual, e prometer um prazo sem base cria uma expectativa que o
   órgão pode não conseguir cumprir ([JRN-BOAT-005] passo 6).
6. **Vocabulário de bastidor nunca vaza.** "Pendente de complemento de vítima", `pending_complement`,
   RENAEST, os estados internos `RECEBIDO`/`CONSOLIDADO` — nada disso aparece cru para Fábio; ele vê
   "sinistro registrado — em processamento" e, quando concluído, "concluído e arquivado" ([JRN-BOAT-005]
   passos 7-8).
7. **Encaminhamento direto à seguradora, sem passo extra do cidadão.** Depois de baixado, o documento
   está pronto para anexar ao pedido de sinistro do seguro de Fábio — o PORTAL não exige que ele
   volte ao balcão físico para autenticar nada além do que já está assinado digitalmente pelo agente
   que registrou o BAT.

## Pontos de contato (apps/canais)

PORTAL (busca, consulta, download). BOAT/RENAEST (fonte de dado, via API — nunca acesso direto do
cidadão ao sistema interno). Seguradora de Fábio (fora do sistema, apenas destinatária do
documento).

## Métricas de sucesso

Zero exposição de dado sensível de terceiro (saúde de vítima, PII de outro envolvido) na consulta
cidadã; zero prazo de disponibilização exibido sem base normativa confirmada; % de consultas que
terminam em download sem contato humano com o órgão; zero vocabulário de estado interno exposto cru
na tela do cidadão — os mesmos quatro critérios já fixados por [JRN-BOAT-005], agora medidos do lado
PORTAL.
