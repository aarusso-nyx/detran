// R-0012 TASK-0011 (Inspector). Matriz de autorização dos 25 gates (contrato CTG-0002c §8
// C-2C-82…85; adenda A11 do `plan.md`): 25 gates × 13 papéis canônicos = 325 `it` gerados de
// `ROLE_PERMISSIONS_FIXTURE` — nunca por analogia nem por par de exemplo. Os gates de produção
// ainda não existem (TASK-0012): as importações falham com "Cannot find module" (estado
// esperado, contrato §1). A fixture (`gates.fixture.ts`) é transcrição independente do §5 e a
// coincidência com `policy.ts` é provada por `readPolicyCommandRules()` (`kb.ts`).
import { INTAKE_FISICO_GATE } from './intake-fisico.schema';
import {
  TRIAGEM_ADMIT_GATE,
  TRIAGEM_GATE,
  TRIAGEM_REJECT_GATE,
} from './triagem.schema';
import {
  DILIGENCIA_ANSWER_GATE,
  DILIGENCIA_EXTEND_GATE,
  DILIGENCIA_GATE,
} from './diligencia.schema';
import { MINUTA_GATE } from './minuta.schema';
import {
  DECISAO_AUTORIDADE_GATE,
  DECISAO_AUTORIDADE_RETURN_GATE,
} from './decisao-autoridade.schema';
import { PARECER_VOTO_GATE } from './parecer-voto.schema';
import {
  LOTE_SORTEIO_APPROVE_GATE,
  LOTE_SORTEIO_DRAW_GATE,
  LOTE_SORTEIO_GATE,
} from './lote-sorteio.schema';
import { PAUTA_GATE } from './pauta.schema';
import {
  SESSAO_AO_VIVO_CASTING_VOTE_GATE,
  SESSAO_AO_VIVO_GATE,
  SESSAO_AO_VIVO_OPEN_GATE,
} from './sessao-ao-vivo.schema';
import { DESISTENCIA_GATE } from './desistencia.schema';
import { ESCALA_GATE } from './escala.schema';
import { MANDATO_GATE } from './mandato.schema';
import { REATRIBUICAO_GATE } from './reatribuicao.schema';
import { ATO_SUSPENSAO_GATE } from './ato-suspensao.schema';
import { PARAMETRO_GATE } from './parametro.schema';
import { EXPORTACAO_GATE } from './exportacao.schema';
import { RAIT_ALL_ROLES, type RaitRoleCode } from '../app.route-manifest';
import { RAIT_COMMANDS, type RaitCommand } from '../data/models/commands';
import { readPolicyCommandRules } from '../../testing/kb';
import { ROLE_PERMISSIONS_FIXTURE } from '../../testing/policy.fixture';
import {
  COMMAND_POLICY_KEY_FIXTURE,
  GATE_POLICY_KEY_FIXTURE,
  GATES_FIXTURE,
} from '../../testing/gates.fixture';

interface GateLike {
  readonly roles: readonly string[];
  readonly command: string;
}

/** Nome do export → gate real (os 25 do §5.1, na ordem da tabela). */
const GATES: Readonly<Record<string, GateLike>> = {
  INTAKE_FISICO_GATE,
  TRIAGEM_GATE,
  TRIAGEM_ADMIT_GATE,
  TRIAGEM_REJECT_GATE,
  DILIGENCIA_GATE,
  DILIGENCIA_ANSWER_GATE,
  DILIGENCIA_EXTEND_GATE,
  MINUTA_GATE,
  DECISAO_AUTORIDADE_GATE,
  DECISAO_AUTORIDADE_RETURN_GATE,
  PARECER_VOTO_GATE,
  LOTE_SORTEIO_GATE,
  LOTE_SORTEIO_DRAW_GATE,
  LOTE_SORTEIO_APPROVE_GATE,
  PAUTA_GATE,
  SESSAO_AO_VIVO_GATE,
  SESSAO_AO_VIVO_CASTING_VOTE_GATE,
  SESSAO_AO_VIVO_OPEN_GATE,
  DESISTENCIA_GATE,
  ESCALA_GATE,
  MANDATO_GATE,
  REATRIBUICAO_GATE,
  ATO_SUSPENSAO_GATE,
  PARAMETRO_GATE,
  EXPORTACAO_GATE,
};

const GATE_NAMES = Object.keys(GATES);

/** As 3 chaves de `policy.ts` sem comando M8 (§3, últimas linhas da tabela). */
const POLICY_KEYS_WITHOUT_COMMAND = [
  'inf:rait-incident:open',
  'inf:rait-archive:seal',
  'inf:rait-archive:apply-retention',
];

/** Os 7 comandos M8 sem chave de política (fail-closed; §3 e C-2C-83). */
const COMMANDS_WITHOUT_POLICY_KEY: readonly RaitCommand[] = [
  'rait-document:attach-official',
  'rait-impediment:decide',
  'rait-attendance:confirm',
  'rait-attendance:summon-substitute',
  'rait-session:register-view-vote',
  'rait-pool:update',
  'rait-calendar:update',
];

describe('gates — estrutura idêntica à fixture do §5 (C-2C-82)', () => {
  it('dado GATES_FIXTURE então tem 25 entradas e os mesmos nomes dos 25 exports reais', () => {
    // C-2C-82 (parte 1)
    expect(Object.keys(GATES_FIXTURE).sort()).toEqual([...GATE_NAMES].sort());
    expect(GATE_NAMES).toHaveLength(25);
  });

  it.each(GATE_NAMES)(
    'dado o gate %s então toEqual à entrada homônima de GATES_FIXTURE (deep-equal, ordem dos arrays incluída)',
    (gateName) => {
      // C-2C-82 (parte 2)
      expect(GATES[gateName]).toEqual(GATES_FIXTURE[gateName]);
    },
  );
});

describe('mapa comando M8 → chave de política (C-2C-83)', () => {
  const policyKeys = new Set(readPolicyCommandRules().map((rule) => rule.key));

  it('dado COMMAND_POLICY_KEY_FIXTURE então cobre os 64 comandos de RAIT_COMMANDS', () => {
    // C-2C-83 (parte 1)
    expect(Object.keys(COMMAND_POLICY_KEY_FIXTURE).sort()).toEqual(
      [...RAIT_COMMANDS].sort(),
    );
    expect(RAIT_COMMANDS).toHaveLength(64);
  });

  it.each(RAIT_COMMANDS)(
    'dado o comando %s então a chave mapeada existe em RAIT_COMMAND_RULES, ou é null e nenhuma chave inf:<comando> existe',
    (command) => {
      // C-2C-83 (parte 2)
      const key = COMMAND_POLICY_KEY_FIXTURE[command];
      if (key === null) {
        expect(policyKeys.has(`inf:${command}`)).toBe(false);
      } else {
        expect(policyKeys.has(key)).toBe(true);
      }
    },
  );

  it('dado as 7 ações sem chave então COMMAND_POLICY_KEY_FIXTURE mapeia exatamente essas para null (fail-closed)', () => {
    // C-2C-83 (parte 3)
    const nullCommands = Object.entries(COMMAND_POLICY_KEY_FIXTURE)
      .filter(([, key]) => key === null)
      .map(([command]) => command)
      .sort();
    expect(nullCommands).toEqual([...COMMANDS_WITHOUT_POLICY_KEY].sort());
  });

  it('dado as 3 chaves de policy.ts sem comando M8 então existem em RAIT_COMMAND_RULES e não são valor de nenhuma linha do mapa', () => {
    // C-2C-83 (parte 4)
    const mapped = new Set(Object.values(COMMAND_POLICY_KEY_FIXTURE));
    for (const key of POLICY_KEYS_WITHOUT_COMMAND) {
      expect(policyKeys.has(key)).toBe(true);
      expect(mapped.has(key)).toBe(false);
    }
  });

  it('dado as duas renomeações conhecidas (OD-R12-026) então answer → answer-inquiry e extend → extend-inquiry, afirmadas e não deduzidas', () => {
    // C-2C-83 (parte 5)
    expect(COMMAND_POLICY_KEY_FIXTURE['rait-case:answer']).toBe(
      'inf:rait-case:answer-inquiry',
    );
    expect(COMMAND_POLICY_KEY_FIXTURE['rait-case:extend']).toBe(
      'inf:rait-case:extend-inquiry',
    );
    expect(policyKeys.has('inf:rait-case:answer')).toBe(false);
    expect(policyKeys.has('inf:rait-case:extend')).toBe(false);
  });
});

describe('matriz de autorização: 25 gates × 13 papéis (C-2C-84; A11)', () => {
  const cases: {
    gateName: string;
    role: RaitRoleCode;
    granted: boolean;
  }[] = [];
  for (const gateName of GATE_NAMES) {
    const policyKey = GATE_POLICY_KEY_FIXTURE[gateName];
    for (const role of RAIT_ALL_ROLES) {
      cases.push({
        gateName,
        role,
        granted: ROLE_PERMISSIONS_FIXTURE[role].includes(policyKey),
      });
    }
  }

  it('dado a matriz então tem 325 casos (25 × 13)', () => {
    expect(cases).toHaveLength(325);
  });

  it.each(
    cases.map((entry) => [
      entry.gateName,
      entry.role,
      entry.granted ? 'contém' : 'não contém',
      entry.granted,
    ]),
  )('dado %s quando papel %s então %s', (gateName, role, _effect, granted) => {
    // C-2C-84
    const gate = GATES[gateName as string];
    expect(gate.roles.includes(role as string)).toBe(granted as boolean);
  });
});

describe('gates — roles coincidem com policy.ts (C-2C-85)', () => {
  const rulesByKey = new Map(
    readPolicyCommandRules().map((rule) => [rule.key, rule.roles]),
  );

  it.each(GATE_NAMES)(
    'dado o gate %s então roles deep-equal (como conjunto) à linha de RAIT_COMMAND_RULES da chave mapeada',
    (gateName) => {
      // C-2C-85
      const policyKey = GATE_POLICY_KEY_FIXTURE[gateName];
      const roles = rulesByKey.get(policyKey);
      expect(roles, `${policyKey} ausente de RAIT_COMMAND_RULES`).toBeDefined();
      expect(new Set(GATES[gateName].roles)).toEqual(new Set(roles ?? []));
    },
  );
});
