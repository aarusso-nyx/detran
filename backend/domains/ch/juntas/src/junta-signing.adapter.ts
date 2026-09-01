import { Injectable } from '@nestjs/common';
import { PadesSigningHttpAdapter } from '@detran/ch-clinical-reports';

/** Dedicated injection boundary for signed collegiate decisions. */
@Injectable()
export class JuntaSigningAdapter extends PadesSigningHttpAdapter {}
