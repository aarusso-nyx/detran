---
id: UC-PORTAL-003
title: Cidadão interpõe recurso ao CETRAN (2ª instância, última instância administrativa)
status: approved
apps: [portal, rait]
sources: [REF-CONTRAN-918, REF-CTB-extracts-raw, REF-DETRANAM-SERVICOS]
updated: 2026-08-26
---

## Ator e objetivo

Recorrente cuja penalidade foi mantida pela JARI (ou autoridade que impôs a penalidade, quando a
JARI deu provimento — legitimidade recursal bilateral) recorre ao CETRAN, última instância
administrativa.

## Pré-condições

- Decisão da JARI publicada/notificada, negando o recurso.
- Prazo de 30 dias da publicação/notificação em aberto ([REF-CTB-extracts-raw] art.288).

## Fluxo principal

1. Na tela de decisão da JARI ([UC-PORTAL-008]), cidadão vê o caminho "Recorrer ao CETRAN" já
   destacado quando o resultado é negativo.
2. Sistema exibe requerimento pré-preenchido; **anexa de ofício o parecer e a conclusão da JARI**
   ao dossiê — o cidadão não precisa reunir e reenviar o que o órgão já produziu
   ([RN-RAIT-003]; atrito hoje presente na carta de serviço atual — [REF-DETRANAM-SERVICOS]).
3. Cidadão acrescenta argumentos adicionais, se desejar; assina e protocola eletronicamente.
4. Sistema confirma protocolo e explica, em linguagem direta, que esta é a última instância
   administrativa — não caberá novo recurso administrativo após a decisão do CETRAN
   ([REF-CTB-extracts-raw] art.290).
5. Caso transiciona no [WF-RAIT-001] para 2ª instância; cidadão acompanha normalmente
   ([UC-PORTAL-005]).

## Fluxos alternativos / exceções

- **1a.** Prazo de 30 dias vencido: sistema informa o vencimento e não permite protocolo do recurso
  ao CETRAN por este caminho; orienta contato com o órgão para hipóteses excepcionais, se houver.
- **3a.** Cidadão quer apenas confirmar o parecer da JARI sem acrescentar nada: fluxo permite
  protocolar só com os documentos já anexados de ofício, sem exigir texto adicional obrigatório além
  do mínimo legal.

## Pós-condições

Caso em tramitação de 2ª instância ([WF-RAIT-001]); dossiê completo (1ª e 2ª instância) disponível
para consulta; cidadão ciente de que não há novo recurso administrativo após esta decisão.

## Critérios de aceitação

**AC-PORTAL-003-1 — parecer e conclusão da JARI vão de ofício**

- **Dado** um recurso ao CETRAN
- **Quando** o dossiê é montado
- **Então** o sistema anexa parecer e conclusão da JARI ([RN-PORTAL-106], [RN-RAIT-003]) e **em
  nenhuma tela** os pede ao cidadão — a carta de serviço atual os exige, e isso é a correção
  autorizada em steering D.28 (DT-125)

**AC-PORTAL-003-2 — o cidadão sabe que é a última instância**

- **Dado** a confirmação do protocolo
- **Quando** é exibida
- **Então** diz em linguagem direta que não caberá novo recurso administrativo ([RN-RAIT-119],
  CTB art.290)

**AC-PORTAL-003-3 — o prazo conta da publicação**

- **Dado** a decisão da JARI publicada e notificada
- **Quando** o prazo de 30 dias é calculado
- **Então** o termo inicial é o da **publicação** ([RN-RAIT-103], steering C.12) — e a tela mostra
  a data-limite resultante

## Regras aplicáveis

- [RN-RAIT-001] (admissibilidade)
- [RN-RAIT-003] (vedado exigir documento do próprio órgão — parecer/conclusão da JARI já anexados)
- [RN-RAIT-005] (contagem de prazos)
