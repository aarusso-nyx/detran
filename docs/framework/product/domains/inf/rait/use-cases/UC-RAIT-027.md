---
id: UC-RAIT-027
title: Secretaria recebe recurso destinado a outro órgão ou o redireciona ao órgão competente, com devolução de prazo
status: draft
apps: [rait, portal]
sources: [REF-CTB-280-290, REF-CONTRAN-900, REF-LEI-9784-1999]
updated: 2026-09-12
---

## Ator e objetivo

Secretaria de protocolo trata as peças que chegam ao DETRAN-AM mas pertencem a outro órgão autuador (CTB art. 287), e as peças protocoladas em órgão incompetente que chegam por redirecionamento — em ambos os sentidos, sem que o tempo de trânsito prejudique o administrado.

## Pré-condições

- Peça protocolada no balcão, postal ou Portal com AIT de outro órgão, ou peça recebida de outro órgão contra AIT do DETRAN-AM.

## Fluxo principal

1. Sistema identifica, pelo número do AIT e código RENAINF, o órgão autuador competente.
2. Peça de outro órgão: secretaria emite protocolo com identificação e assinatura do recebedor, órgão e data (900 art. 6º §2º) e remete de imediato ao órgão autuador (900 art. 6º §3º), com as cópias necessárias; a data do protocolo aqui é o marco de tempestividade lá ([RN-RAIT-106]).
3. Peça recebida de outro órgão contra AIT do DETRAN-AM: entra em `PROTOCOLADO` com a data do protocolo de origem como marco; segue [UC-RAIT-001]/[UC-RAIT-002].
4. Peça dirigida a órgão incompetente por erro do cidadão: sistema indica o órgão competente e devolve o prazo (Lei 9.784 art. 63 §1º, subsidiária — [RN-RAIT-109]), sem não conhecimento.

## Fluxos alternativos / exceções

- **2a.** AIT não localizado no RENAINF: pendência de identificação ao requerente, sem consumir prazo ([UC-RAIT-001]).
- **3a.** Protocolo de origem sem os elementos do art. 6º §2º: tempestividade calculada pela melhor evidência e caso marcado para conferência humana.

## Pós-condições

Peça encaminhada ou recebida com marco de tempestividade preservado; protocolo emitido; remessa registrada.

## Critérios de aceitação

**AC-RAIT-027-1 — o tempo de trânsito não corre contra o cidadão**

- **Dado** um recurso protocolado no órgão de domicílio em D1 e recebido aqui em D9
- **Quando** a admissibilidade é feita
- **Então** a tempestividade usa D1

**AC-RAIT-027-2 — órgão incompetente devolve prazo**

- **Dado** uma defesa protocolada por engano em outro órgão
- **Quando** a peça chega
- **Então** o prazo é devolvido e o caso não é não conhecido por esse motivo

## Regras aplicáveis

- [RN-RAIT-106] (marco por canal; art. 287)
- [RN-RAIT-109] (incompetência devolve prazo)
- [RN-RAIT-002] (conteúdo mínimo)
