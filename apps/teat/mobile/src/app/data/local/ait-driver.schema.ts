import { z } from 'zod';
const repeatedDigits = /^(\d)\1+$/;

function hasValidCpfCheckDigits(value: string): boolean {
  if (!/^\d{11}$/.test(value) || repeatedDigits.test(value)) return false;
  const digits = [...value].map(Number);
  const check = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return (remainder === 10 ? 0 : remainder) === digits[length];
  };
  return check(9) && check(10);
}

export const aitDriverSchema = z
  .object({
    condutor: z.string(),
    identified_by: z.enum(['cpf', 'cnh', 'manual']),
    abordagem: z.string().min(1),
  })
  .superRefine((value, context) => {
    const valid =
      value.identified_by === 'cpf'
        ? hasValidCpfCheckDigits(value.condutor)
        : value.identified_by === 'cnh'
          ? /^\d{11}$/.test(value.condutor) &&
            !repeatedDigits.test(value.condutor)
          : value.condutor.trim().length > 0;
    if (!valid) context.addIssue({ code: 'custom', message: 'invalid_driver' });
  });
