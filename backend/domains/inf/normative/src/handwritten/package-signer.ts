// CTG-0003 §3 (M13, ADR-0018, R-0008, TASK-0007) — `PackageSignerPort` local.
//
// O substrato de selo real (`DocumentsFacade.seal`) é `source_pending`
// enquanto ADR-0018 não estiver ligado (OD-T16): nenhuma constante de
// certificado entra no código. Até lá o pacote sai marcado
// `kind='local-unsigned'`, que é a afirmação honesta de que aquilo **não** é
// assinatura com validade jurídica.
import { sha256Hex, type PackageSignature } from './normative-runtime.js';

export const LOCAL_PACKAGE_SIGNER_NAME = 'detran-backend-local';

/** Token de injeção da porta (a forma está em `@detran/ops-core`, §4.8). */
export const PACKAGE_SIGNER_PORT: unique symbol = Symbol('PACKAGE_SIGNER_PORT');

export class LocalPackageSigner {
  async sign(manifestHash: string): Promise<PackageSignature> {
    return {
      signature: sha256Hex(manifestHash),
      signer: LOCAL_PACKAGE_SIGNER_NAME,
      kind: 'local-unsigned',
    };
  }
}
