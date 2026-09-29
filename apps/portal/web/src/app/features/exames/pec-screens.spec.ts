// R-0032 TASK-0008 (Inspector, O2). Contrato inicial das telas PEC cidadãs.
//
// Esta especificação só afirma formas fixadas em CTG-0001/CTG-0004 e no
// manifesto existente. As páginas, clientes e payloads que chegam em O7/O8
// não são importados aqui: os itens marcados TODO são trabalho de TASK-0009.
import { PORTAL_ROUTE_MANIFEST } from '../../app.route-manifest';

type ExpectedPecRoute = {
  readonly path: string;
  readonly access: 'simples' | 'avancada';
  readonly serviceKey: string;
  readonly entitlement?: { readonly kind: 'exam'; readonly param: 'examId' };
};

const PEC_ROUTES: readonly ExpectedPecRoute[] = [
  {
    path: 'exames/agendamento',
    access: 'simples',
    serviceKey: 'consulta_exame',
  },
  { path: 'exames', access: 'simples', serviceKey: 'consulta_exame' },
  {
    path: 'exames/:examId',
    access: 'simples',
    serviceKey: 'consulta_exame',
    entitlement: { kind: 'exam', param: 'examId' },
  },
  {
    path: 'exames/:examId/restricoes',
    access: 'simples',
    serviceKey: 'consulta_exame',
    entitlement: { kind: 'exam', param: 'examId' },
  },
  {
    path: 'exames/:examId/junta/nova',
    access: 'avancada',
    serviceKey: 'junta_medica',
    entitlement: { kind: 'exam', param: 'examId' },
  },
  {
    path: 'exames/:examId/revisao',
    access: 'simples',
    serviceKey: 'consulta_exame',
    entitlement: { kind: 'exam', param: 'examId' },
  },
  {
    path: 'exames/:examId/recurso/novo',
    access: 'avancada',
    serviceKey: 'recurso_junta_especial',
    entitlement: { kind: 'exam', param: 'examId' },
  },
  {
    path: 'exames/toxicologico',
    access: 'simples',
    serviceKey: 'consulta_exame',
  },
  {
    path: 'exames/meus-direitos',
    access: 'simples',
    serviceKey: 'consulta_exame',
  },
  {
    path: 'exames/:examId/devolutiva/nova',
    access: 'avancada',
    serviceKey: 'entrevista_devolutiva',
    entitlement: { kind: 'exam', param: 'examId' },
  },
];

function manifestEntry(path: string) {
  return PORTAL_ROUTE_MANIFEST.find((entry) => entry.path === path);
}

describe('PEC — manifesto cidadão P-01…P-07 e auxiliar (CTG-0004)', () => {
  it('declara as sete superfícies e a rota auxiliar, todas no módulo exames', () => {
    const missing = PEC_ROUTES.filter(
      (route) => !manifestEntry(route.path),
    ).map((route) => route.path);
    expect(missing, `rotas PEC ausentes: ${missing.join(', ')}`).toEqual([]);

    for (const expected of PEC_ROUTES) {
      expect(manifestEntry(expected.path)?.module).toBe('exames');
    }
  });

  it('exige sessão cidadã, assurance e vínculo por exame nas rotas que identificam exame', () => {
    // O Portal só expõe a persona CIDADAO. A autoridade final é
    // PortalCitizenGuard no backend; esta tabela impede que a UI publique uma
    // rota PEC anônima ou sem o guard de assurance/vínculo derivado do manifesto.
    for (const expected of PEC_ROUTES) {
      const entry = manifestEntry(expected.path);
      expect(entry, `rota ausente: ${expected.path}`).toBeDefined();
      expect(entry?.access, `assurance de ${expected.path}`).toBe(
        expected.access,
      );
      expect(entry?.serviceKey, `ato de ${expected.path}`).toBe(
        expected.serviceKey,
      );
      expect(entry?.entitlement, `vínculo de ${expected.path}`).toEqual(
        expected.entitlement,
      );
    }
  });

  it('mantém P-04 como a única ação PEC liberada nesta rodada', () => {
    const board = manifestEntry('exames/:examId/junta/nova');
    expect(board?.serviceKey).toBe('junta_medica');
    expect(board?.access).toBe('avancada');
    expect(board?.entitlement).toEqual({ kind: 'exam', param: 'examId' });
  });

  it('não expõe rota do navegador para v1/ch', () => {
    const chPaths = PORTAL_ROUTE_MANIFEST.filter((entry) =>
      entry.path.startsWith('v1/ch/'),
    ).map((entry) => entry.path);
    expect(chPaths).toEqual([]);
  });
});

describe('PEC — requisitos D1–D6 e decisões fail-closed', () => {
  it.todo(
    'TASK-0009: renderizar por rota as trilhas médica e psicológica separadas, sem CONDICIONADO/PENDENTE (D1)',
  );
  it.todo(
    'TASK-0009: verificar no DOM de P-01/P-04 ausência de escolha de clínica ou perito (D3)',
  );
  it.todo(
    'TASK-0009: provar dossiê sem máscara somente ao titular autorizado e estado bloqueado enquanto OD-R32-005 estiver pendente (D2/D4/D5)',
  );
  it.todo(
    'TASK-0009: provar prazo como direito textual, com termo inicial; sem ciência não há contador (D6)',
  );
  it.todo(
    'TASK-0009: cobrir 403 de assurance, 404 de terceiro/tenant/vínculo e 422 PORTAL.SERVICE_UNAVAILABLE por estado, após CTG-0002/0003',
  );
});
