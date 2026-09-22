import { expect, it } from 'vitest';
import { FixturePrinter } from '../testing/fixture-printer';

it('dado AIT finalizado no ato quando FixturePrinter imprime então gera duas vias com assinatura manual e número único', () => {
  const printer = new FixturePrinter();
  const copies = printer.print({
    aitNumber: 'AIT-0001',
    printMoment: 'at-issuance',
  });
  expect(copies).toHaveLength(2);
  expect(copies.map((copy) => copy['aitNumber'])).toEqual([
    'AIT-0001',
    'AIT-0001',
  ]);
  expect(copies.every((copy) => copy['agentSignature'] === 'manual')).toBe(
    true,
  );
});

it('dada reimpressão no mesmo dia quando FixturePrinter imprime então conserva o ato e usa identificação eletrônica', () => {
  const printer = new FixturePrinter();
  const copies = printer.print({
    aitNumber: 'AIT-0001',
    printMoment: 'reprint-same-day',
  });
  expect(copies).toHaveLength(2);
  expect(copies.every((copy) => copy['agentSignature'] === 'electronic')).toBe(
    true,
  );
  expect(copies.every((copy) => copy['duplicateLegalAct'] === 'false')).toBe(
    true,
  );
});
