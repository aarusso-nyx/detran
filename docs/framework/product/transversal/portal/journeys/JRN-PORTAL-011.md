---
id: JRN-PORTAL-011
title: Cidadão acessa os próprios dados guardados pelo DETRAN-AM — o titular vê tudo do que é seu
status: draft
apps: [portal]
sources: [REF-LEI-13709-2018, REF-LEI-14129-2021]
updated: 2026-08-24
---

## Persona e contexto

Dona Iracema quer entender que dados o DETRAN-AM guarda sobre ela — motivada por desconfiança geral
sobre uso de dados públicos, não por um incidente específico. Esta jornada é a aplicação, no PORTAL,
do mesmo princípio já fixado duas vezes no corpus: o titular vendo o próprio dado é a **exceção
confirmatória** ao mascaramento por padrão, nunca um caso à parte a reinventar — mesmo padrão de
[JRN-BOAT-005] passo 4 (vítima vendo seu próprio caso) e de `ch/pec/_intake/ux-notes.md` §d.2
(candidato vendo o próprio dossiê clínico integral).

## Narrativa ponta-a-ponta

1. **Um só lugar, não uma busca por app.** Iracema encontra "Meus dados" como item de primeira
   classe no PORTAL, não escondido em configurações avançadas — reflete o direito de confirmação de
   tratamento e acesso do art.18, I-II da LGPD, e o dever do Poder Público de informar de forma clara
   como trata os dados (art.23, I).
2. **Panorama por domínio, não uma exportação técnica ilegível.** A tela organiza por área de
   contato de Iracema com o DETRAN-AM — infrações/processos (RAIT), sinistros em que ela conste como
   envolvida (BOAT, com o mesmo mascaramento por identidade de [JRN-PORTAL-007] quando o caso envolve
   terceiros — mas os próprios dados dela sempre visíveis por completo), exames de aptidão se
   aplicável (PEC), cadastro e histórico de contato (PORTAL) — cada seção linkando para a tela
   funcional correspondente ([JRN-PORTAL-004], [JRN-PORTAL-007], [JRN-PORTAL-008]) em vez de duplicar
   o conteúdo numa página morta.
3. **O titular vê o dado bruto, não o resumo mascarado que um terceiro veria.** Onde qualquer outra
   pessoa consultando um caso de Iracema veria só um resumo validado (ex.: "atendimento médico:
   sim/não" no BOAT, dado clínico resumido no PEC), Iracema, sendo a própria titular, vê o conteúdo
   completo do que é dela — mascarar o próprio dado do titular seria inverter o princípio de
   minimização, não aplicá-lo (mesma regra explícita em `ch/pec/_intake/ux-notes.md` §d.2).
4. **Pedido de correção como ação de primeira classe, com prazo de resposta visível.** O direito de
   correção de dado incompleto, inexato ou desatualizado (LGPD art.18, III) aparece como um botão
   junto a cada seção, não como um formulário genérico de "fale conosco" desconectado do dado
   específico que Iracema quer corrigir.
5. **O que não pode ser apagado, explicado sem jargão — nunca escondido atrás de "solicitação
   negada".** Se Iracema pedir eliminação de um dado sujeito a prazo legal de retenção (ex.: laudo
   clínico do PEC, retido por determinação legal específica — `ch/pec/_intake/ux-notes.md` §d.6), a
   tela explica o motivo em linguagem simples ("este registro precisa ser mantido por [prazo], por
   determinação legal — depois disso, você pode pedir a eliminação novamente"), nunca um "não
   autorizado" sem contexto.
6. **Nenhuma base legal de tratamento afirmada com falsa certeza.** Se a tela precisa citar o
   fundamento LGPD do tratamento de algum dado sensível (ex.: saúde), usa linguagem genérica de
   proteção de dados até que exista confirmação jurídica da hipótese exata aplicável — mesmo cuidado
   já fixado em `est/boat/_intake/ux-notes.md` §d.6 e `ch/pec/_intake/ux-notes.md` §d.5, agora
   estendido à superfície onde o titular efetivamente lê essa informação.
7. **Prazos e procedimentos de exercício do direito perante o Poder Público, sem inventar um SLA
   próprio sem base.** O §3º do art.23 da LGPD remete a legislação específica (Lei 9.507/1997 —
   habeas data; Lei 9.784/1999) para os prazos de resposta do Poder Público — a tela não promete um
   prazo numérico que não tenha confirmação normativa; mostra o canal de solicitação e, quando o
   prazo aplicável for confirmado por LEGAL, passa a exibi-lo com a mesma disciplina de "nunca
   inventar prazo" já adotada em todo o PORTAL.

## Pontos de contato (apps/canais)

PORTAL ("Meus dados", ponto único de acesso e correção). RAIT, BOAT, PEC (fontes de dado por
domínio, cada um aplicando sua própria doutrina de mascaramento — exceto para o próprio titular).

## Métricas de sucesso

% de solicitações de correção resolvidas sem contato humano fora do canal; zero caso de dado do
próprio titular mascarado para o próprio titular; zero recusa de eliminação sem explicação em
linguagem simples do prazo legal aplicável; zero afirmação de base legal específica sem confirmação
jurídica.
