---
id: RN-DASH-135
title: O alerta é prova de diligência, não substituto do ato — anatomia mínima, escalonamento e imutabilidade da trilha
status: draft
apps: [dashboard, rait, teat, boat, pec]
sources: [REF-LEI-13709-2018, REF-LEI-9873-1999]
updated: 2026-08-24
---

**Regra.** Um alerta emitido pelo DASHBOARD produz **dois efeitos jurídicos assimétricos**, e o
produto precisa ser desenhado sabendo dos dois:

- **A favor do órgão**: constitui evidência de que o órgão **monitorava, sabia e avisou** — é o
  material com que se demonstra diligência quando um prazo é perdido apesar do sistema.
- **Contra o órgão**: constitui evidência de que o órgão **sabia e não agiu**, quando o alerta foi
  emitido, entregue e ignorado.

Não há como ter o primeiro sem o segundo. Por isso o alerta **não pode ser tratado como funcionalidade
de conveniência**: sua emissão, entrega, leitura e reconhecimento são **registro auditável**, e sua
supressão, silenciamento ou reconfiguração retroativa são atos que **destroem prova**.

**Base legal.**

- [REF-LEI-13709-2018] art. 6º, X: _"responsabilização e prestação de contas: **demonstração**, pelo
  agente, da adoção de medidas eficazes e capazes de comprovar a observância e o cumprimento das
  normas [...] e, inclusive, da **eficácia dessas medidas**"_.
- [REF-LEI-13709-2018] art. 37: _"O controlador e o operador devem **manter registro das operações de
  tratamento** de dados pessoais que realizarem"_.
- [REF-LEI-9873-1999] art. 1º, § 1º: prescrição intercorrente incide _"sem prejuízo da **apuração da
  responsabilidade funcional** decorrente da paralisação"_ — o alerta ignorado é o insumo natural
  dessa apuração ([RN-RAIT-113]).

**Anatomia mínima de um alerta.** Um alerta sem qualquer destes campos não é alerta — é notificação
decorativa:

| Campo                                | Regra                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `regra_origem`                       | id da regra-teto ([RN-RAIT-112], [RN-TEAT-117], …). Alerta sem fonte normativa não entra no painel |
| `objeto`                             | identificador estável do processo, registro ou equipamento vigiado                                 |
| `degrau`                             | verde / amarelo / laranja / vermelho / **vencido**                                                 |
| `emitido_em`                         | data-hora de emissão, imutável                                                                     |
| `destinatário`                       | **papel humano nomeado**, não "a equipe"                                                           |
| `entregue_em`                        | comprovação de entrega no canal (não presumida)                                                    |
| `reconhecido_por` / `reconhecido_em` | quem deu ciência e quando — **e nada além disso**                                                  |
| `encerrado_por_estado`               | referência ao evento **no app de origem** que tornou o alerta obsoleto                             |

**Cinco princípios de operação.**

1. **Reconhecer não resolve.** O _ack_ registra ciência. O alerta só encerra quando o **estado
   subjacente muda no app de origem** — o processo foi julgado, o certificado foi renovado, o registro
   foi transmitido. Permitir encerramento manual converte o painel em teatro de conformidade
   ([RN-DASH-101]).
2. **Escalonamento é obrigatório e hierárquico.** Cada degrau tem destinatário distinto e mais alto.
   Um alerta que grita quatro vezes para a mesma pessoa que já não pôde agir não é diligência.
3. **Trilha imutável.** Alertas emitidos não são apagados, editados nem recalculados retroativamente
   quando os limiares mudam. Mudança de calibração vale **do momento da mudança em diante**, e a
   calibração anterior fica registrada com sua vigência — do contrário, a série histórica deixa de ser
   prova.
4. **Silenciamento é ato nominado.** Suprimir uma família de alertas exige responsável, motivo e
   prazo de validade, e o silenciamento em si aparece no painel. Alerta desligado sem registro é a
   forma mais eficiente de transformar o DASHBOARD em passivo.
5. **Fadiga de alerta é risco de conformidade.** Um painel que emite alerta insanável (marco vencido
   em 2022) ou ruidoso treina o operador a ignorar tudo — e a ignorância treinada é exatamente o que a
   trilha vai documentar. Alertas insanáveis migram para **conformidade estrutural**
   ([RN-DASH-130], princípio 4).

**Verificação.**

1. **Indicador de segunda ordem obrigatório**: _tempo médio entre emissão do alerta e o ato corretivo
   no app de origem_, por família. É a medida real da eficácia do monitoramento — e é o número que
   responde, sozinho, à pergunta de controle externo sobre diligência.
2. **Taxa de alertas vermelhos que evoluíram para perda efetiva** (prescrição consumada, certificado
   vencido com autuações lavradas, prazo de ouvidoria estourado). Meta é zero; o valor real é o
   diagnóstico do órgão.
3. **Relatório periódico de alertas ignorados**, por destinatário e por família — insumo direto da
   apuração de responsabilidade funcional prevista na Lei 9.873/1999.
4. **Retenção da trilha de alertas** dimensionada pelos prazos que ela vigia: um alerta sobre relógio
   de 5 anos precisa sobreviver mais de 5 anos para ser útil como prova. Retenção "conforme padrão do
   sistema" não serve.

**Controvérsia/risco.** _Severidade: média-alta._ A trilha de alertas contém identificação de
servidores (destinatários, reconhecimentos, omissões) — é **dado pessoal de agente público** tratado
para finalidade de controle. Deve constar do registro de operações de tratamento
([REF-LEI-13709-2018] art. 37), ter acesso segregado ([RN-DASH-170]) e **não** ser publicado em
transparência ativa em nível individual ([RN-DASH-142]). Ranking nominal de servidores em painel
público é uso que a Lei 13.460/2017 não autoriza — o art. 23, § 2º manda publicar ranking **de
entidades**, não de pessoas.
