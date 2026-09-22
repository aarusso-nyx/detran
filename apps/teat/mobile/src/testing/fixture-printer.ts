export interface PrintCopy {
  readonly aitNumber: string;
  readonly agentSignature: 'manual' | 'electronic';
  readonly duplicateLegalAct: 'false';
}

export class FixturePrinter {
  print(input: {
    readonly aitNumber: string;
    readonly printMoment: 'at-issuance' | 'reprint-same-day';
  }): readonly PrintCopy[] {
    const agentSignature =
      input.printMoment === 'at-issuance' ? 'manual' : 'electronic';
    return [
      {
        aitNumber: input.aitNumber,
        agentSignature,
        duplicateLegalAct: 'false',
      },
      {
        aitNumber: input.aitNumber,
        agentSignature,
        duplicateLegalAct: 'false',
      },
    ];
  }
}
