---
id: JRN-DASH-005
title: Auditor reconstrói o que se sabia e quando — trilha sem exposição desnecessária de dado sensível
status: draft
apps: [dashboard, rait, boat, pec]
sources: [WF-RAIT-002, RN-BOAT-003, REF-LEI-13709-2018]
updated: 2026-08-24
---

## Persona e contexto

Beatriz é auditora — não do DETRAN-AM em si, mas do controle interno/externo que pergunta, depois
de um desfecho ruim, uma pergunta muito específica: **o órgão sabia, e quando soube?** Um processo
prescreveu por inércia (art. 289-A); um lote de sinistros ficou represado por dias sem que ninguém
agisse; um dever periódico atrasou. Em qualquer um desses casos, a pergunta de Beatriz não é sobre
o mérito do caso individual — é sobre a **cadeia de alerta e resposta**: em que momento o sistema
sinalizou risco, para quem, e o que aconteceu depois. Essa é precisamente a trilha que a escada de
alertas de [WF-RAIT-002] §6 (cadeia de notificação por nível) foi desenhada para deixar rastreável.

## Narrativa ponta-a-ponta

1. **Ponto de partida — um desfecho, não uma pessoa.** Beatriz abre a investigação a partir de um
   caso RAIT que atingiu `PRESCRITO_OPERACIONAL` — o próprio [WF-RAIT-002] §4.1 já trata esse
   estado como "falha de processo — registro de incidente, apuração de causa, comunicação ao
   LEGAL/auditoria; nunca deveria ocorrer". A trilha de auditoria é, portanto, um requisito
   embutido no desenho da escada, não um extra que Beatriz precisa pedir.
2. **A linha do tempo é reconstruída por eventos, não por opinião.** O DASHBOARD mostra, em ordem:
   quando o processo entrou em `ALERTA_N1` (12 meses), quem foi notificado, quando passou a
   `ALERTA_N2` (18 meses, coordenador), `ALERTA_N3` (21 meses, gestor), `CRITICO` (23 meses,
   presidente) — cada transição com timestamp e destinatário, exatamente a cadeia descrita em
   [WF-RAIT-002] §6. Beatriz não precisa perguntar a ninguém "quando você soube" — o sistema já
   registrou.
3. **Onde a trilha esbarra em dado sensível, ela não para — ela se adapta.** Se a investigação
   tocar um caso BOAT com dado de saúde de vítima, a trilha mostra que houve acesso ao dado bruto,
   por quem e com que finalidade declarada ([RN-BOAT-003] item de auditoria), mas **não** expande
   automaticamente o conteúdo clínico na tela de Beatriz — ela vê o fato do acesso, não o conteúdo
   acessado, a menos que a finalidade da própria investigação exija e ela declare isso
   explicitamente (mesmo princípio de "revelação auditada por identidade" de
   `est/boat/_intake/ux-notes.md` §d, aplicado agora ao papel de auditor, não só ao operador
   comum).
4. **Falha de alerta é distinta de falha de ação.** A trilha separa duas perguntas que costumam
   ser confundidas: "o sistema alertou a tempo?" (pergunta sobre o desenho do DASHBOARD/WF) e "a
   pessoa notificada agiu?" (pergunta sobre desempenho individual). Beatriz precisa das duas
   respostas separadas — se o alerta nunca chegou, a falha é do sistema; se chegou e ninguém agiu,
   é outra investigação, com outro escopo.
5. **Nenhuma reconstrução aceita "não lembro" como resposta do sistema.** Se um evento de
   notificação não tiver registro (por exemplo, uma notificação fora do sistema, por telefone), o
   DASHBOARD mostra essa lacuna como lacuna — não preenche silenciosamente com uma suposição do
   que "provavelmente" aconteceu.
6. **Fechamento — relatório de trilha, não de culpa.** O produto da investigação de Beatriz é uma
   linha do tempo verificável, entregue a quem decide a apuração de responsabilidade — o
   DASHBOARD fornece o fato, não a conclusão disciplinar, que é decisão humana fora do escopo do
   sistema.

## Pontos de contato (apps/canais)

DASHBOARD (trilha consolidada, cross-domínio); RAIT/BOAT/PEC (drill-down pontual, quando a
investigação precisa confirmar um evento na origem); canal de auditoria/LEGAL (destino do
relatório final, fora do sistema).

## Métricas de sucesso

100% das transições de nível de alerta (qualquer escada, qualquer domínio) com timestamp e
destinatário registrados; zero investigação bloqueada por falta de trilha (a lacuna, quando
existe, é visível, não motivo de impasse); zero exposição de dado clínico/sensível bruto na trilha
de auditoria sem finalidade declarada e registrada.
