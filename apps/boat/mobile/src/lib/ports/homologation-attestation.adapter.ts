import type { AttestationPort } from '../ports.js';
import {
  BoatPortError,
  type BoatHomologationAdapter,
} from './boat-port-error.js';

/**
 * Atestação de homologação (OD-R28-002): nunca entrega sucesso. Toda chamada
 * rejeita com `unattested`, sem ler o dispositivo, para a UI bloquear o ato
 * que exigir atestação.
 */
export class HomologationAttestationAdapter
  implements AttestationPort, BoatHomologationAdapter
{
  readonly adapterName = 'boat-homologation-attestation';
  readonly mode = 'homologacao';
  readonly securityLevel = 'none';
  readonly attestationStatus = 'unattested';

  attest(): ReturnType<AttestationPort['attest']> {
    return Promise.reject(new BoatPortError('AttestationPort', 'unattested'));
  }
}
