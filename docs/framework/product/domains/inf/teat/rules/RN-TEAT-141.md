---
id: RN-TEAT-141
title: Bodycam é obrigatória em toda interação agente↔condutor — gravação contínua, íntegra e não interrompível
status: draft
apps: [teat]
sources: [REF-DETRANAM-TALAO-BODYCAM]
updated: 2026-08-28
---

**Regra (DETRAN-AM).** Os agentes de trânsito em serviço **deverão utilizar câmeras corporais,
obrigatoriamente**, entre outras hipóteses, em **abordagens veiculares de qualquer natureza**,
**atividades de fiscalização e vistoria técnica**, **atendimento a sinistros** e — cláusula de
alcance máximo — **toda interação entre agente de trânsito e condutor ou usuário da via**. As
câmeras **deverão permanecer ativadas durante todo o período de serviço operacional**, entendido
como o tempo em que o agente estiver uniformizado, escalado ou disponível para atuação
fiscalizatória; **todas as situações operacionais deverão ser gravadas, independentemente do modo
de acionamento**. É **vedado** ao agente: desligar a câmera durante o serviço (salvo uso de
banheiro); **alterar configurações, metadados, hora, data, geolocalização ou modos de gravação**;
interromper, ocultar, pausar ou obstruir a captação; **manipular, editar, copiar, excluir ou
transferir arquivos**; e posicionar o equipamento de forma que prejudique a gravação. O agente
**deverá comunicar imediatamente** mau funcionamento, falha de gravação, falha de
bateria/memória/transmissão ou impossibilidade técnica de uso, com **registro em sistema próprio
ou relatório diário**; a omissão pode acarretar responsabilização administrativa. **Consequência
para o TEAT: todo ato legal lavrado em campo no DETRAN-AM tem, por norma, uma gravação correlata.**

**Base legal.** [REF-DETRANAM-TALAO-BODYCAM] §2 — Portaria Normativa nº 003/2026-DP/DETRAN/AM:

> "Art. 4º Os agentes de trânsito em serviço deverão utilizar as câmeras corporais,
> obrigatoriamente, nas seguintes situações: I - Atendimento a sinistros de trânsito; II -
> Abordagens veiculares de qualquer natureza; III - Operações de trânsito ordinárias,
> extraordinárias ou planejadas; IV - Atividades de fiscalização e vistoria técnica; […] VIII -
> Toda interação entre agente de trânsito e condutor ou usuário da via; […]"
>
> "Art. 5º As câmeras corporais deverão permanecer ativadas durante todo o período de serviço
> operacional, entendendo-se este como o tempo em que o agente estiver uniformizado, escalado ou
> disponível para atuação fiscalizatória."
>
> "Art. 7º […] § 1º todas as situações operacionais deverão ser gravadas, independentemente do modo
> de acionamento. § 2º qualquer vedação ou restrição deverá ser fundamentada pelo coordenador geral
> de fiscalização."
>
> "Art. 8º É vedado ao agente de trânsito: I – Desligar a câmera corporal durante o serviço, salvo
> no caso previsto no art. 6º; II – Alterar configurações, metadados, hora, data, geolocalização ou
> modos de gravação; III – Interromper, ocultar, pausar ou obstruir a captação de imagens; IV –
> Manipular, editar, copiar, excluir ou transferir arquivos; V – Posicionar o equipamento de forma
> que prejudique a gravação."
>
> "Art. 9º O agente deverá comunicar imediatamente, ao início ou durante o serviço, qualquer: I –
> Mal funcionamento do equipamento; II – Falha na gravação; III – Falha de bateria, memória ou
> transmissão; IV – Impossibilidade técnica de uso. § 1º A comunicação será registrada no sistema
> próprio ou relatório diário. § 2º A omissão na comunicação poderá acarretar responsabilização
> administrativa."
>
> "Art. 15. Aplica-se, quando tecnicamente viável, às câmeras veiculares utilizadas na fiscalização
> de trânsito deste Departamento."

**Verificação.** Fonte de evidência **estruturalmente distinta** da modelada em [RN-TEAT-002]:
fluxo **contínuo e automático**, não anexo pontual escolhido pelo agente. Modelagem mínima: o ato
legal referencia a **janela temporal** da gravação (device de bodycam, timestamp de início/fim da
interação) em vez de "anexar o vídeo"; a correlação é por tempo + agente + geolocalização, não por
upload. As vedações do art. 8º, IV são o mesmo princípio de custódia íntegra e apensa de
[RN-TEAT-002] — o TEAT **não** deve, em hipótese alguma, oferecer ao `field-agent` qualquer função
de cópia, exclusão ou transferência de arquivo de bodycam. A comunicação de falha do art. 9º
mapeia ao padrão já existente de "pendência explícita sem apagar o ato legal" e deve ser um evento
de primeira classe, com indicador de estado de gravação persistente na UI de campo.

**Controvérsia/risco.** (a) A Portaria **não altera o regime de validade do AIT**: ausência de
gravação é **falha funcional do agente** (art. 6º, parágrafo único) e enseja PAD (art. 17), mas
**não há norma que declare inválido o auto lavrado sem bodycam**. Tratar a gravação como condição
de validade seria criar requisito inexistente; tratá-la como irrelevante ignora seu peso
probatório na defesa. (b) A obrigação de gravar **todo o período de serviço** — e não apenas as
interações — levanta questão de proporcionalidade e de proteção de dados que a Portaria não
endereça ([RN-TEAT-142]). Itens 41 e 42 de `_intake/legal-assessment.md`.

**Decisão do Owner (2026-08-28, `_meta/open-issues.md` DT-014).** Bodycam fica em **onda
futura**, fora do escopo do MVP do TEAT. O indicador persistente de gravação (chrome global, ver
[IU-TEAT-001] §C) continua valendo a pena manter — é barato e não depende da decisão — mas a
obrigatoriedade em si, a modelagem completa desta regra e o regime de acesso de [RN-TEAT-142] só
entram em uma onda posterior ao MVP.
