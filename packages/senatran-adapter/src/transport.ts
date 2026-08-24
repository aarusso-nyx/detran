import { request as httpRequest } from 'node:http';
import { Agent as HttpsAgent, request as httpsRequest } from 'node:https';

import type { SenatranTlsConfig } from './config.js';

export interface SenatranTransportRequest {
  url: URL;
  method: 'GET' | 'POST' | 'PATCH';
  headers: Readonly<Record<string, string>>;
  body?: string;
  timeoutMs: number;
  tls?: SenatranTlsConfig;
}

export interface SenatranTransportResponse {
  status: number;
  headers: Readonly<Record<string, string | string[] | undefined>>;
  body: string;
}

export interface SenatranTransport {
  request(input: SenatranTransportRequest): Promise<SenatranTransportResponse>;
}

export class NodeSenatranTransport implements SenatranTransport {
  request(input: SenatranTransportRequest): Promise<SenatranTransportResponse> {
    return new Promise((resolve, reject) => {
      const secure = input.url.protocol === 'https:';
      const agent =
        secure && input.tls
          ? new HttpsAgent({
              cert: input.tls.cert,
              key: input.tls.key,
              ca: input.tls.ca,
              passphrase: input.tls.passphrase,
              servername: input.tls.servername,
              rejectUnauthorized: true,
            })
          : undefined;
      const request = (secure ? httpsRequest : httpRequest)(
        input.url,
        {
          method: input.method,
          headers: input.headers,
          timeout: input.timeoutMs,
          ...(agent ? { agent } : {}),
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk: Buffer | string) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          });
          response.on('end', () => {
            resolve({
              status: response.statusCode ?? 500,
              headers: response.headers,
              body: Buffer.concat(chunks).toString('utf8'),
            });
          });
        },
      );
      request.on('timeout', () => {
        request.destroy(
          new Error(`Integration request timed out after ${input.timeoutMs}ms`),
        );
      });
      request.on('error', reject);
      if (input.body !== undefined) request.write(input.body);
      request.end();
    });
  }
}
