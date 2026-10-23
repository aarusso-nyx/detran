import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, defer, EMPTY, Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TEAT_WEB_HOMOLOGATION } from '../shared/homologation-http.interceptor.js';
import { TEAT_WEB_HOMOLOGATION_EVENTS } from '../shared/homologation-events.port.js';
const STREAM_URL = '/v1/ops/stream';
const POLLING_INTERVAL_MS = 15_000;
let SseService = class SseService {
    constructor() {
        this.http = inject(HttpClient);
        this.homologation = inject(TEAT_WEB_HOMOLOGATION, {
            optional: true,
        });
        this.homologationEvents = inject(TEAT_WEB_HOMOLOGATION_EVENTS, {
            optional: true,
        });
        this.fallbackActive = signal(false);
        this.homologationFallbackActive = this.fallbackActive.asReadonly();
    }
    stream(options = {}) {
        if (this.homologation === true) {
            const events = this.homologationEvents;
            if (events === null)
                return EMPTY;
            return defer(() => events.stream(options)).pipe(catchError(() => {
                this.fallbackActive.set(true);
                return timer(POLLING_INTERVAL_MS, POLLING_INTERVAL_MS).pipe(switchMap(() => events.fallback?.(options) ?? EMPTY));
            }));
        }
        return new Observable((observer) => {
            const topics = options.topics ?? [];
            const streamUrl = topics.length === 0
                ? STREAM_URL
                : `${STREAM_URL}?topics=${encodeURIComponent(topics.join(','))}`;
            const fallbackUrl = options.fallbackUrl ?? STREAM_URL;
            let fallbackStarted = false;
            let pollingSubscription;
            const startPolling = () => {
                if (fallbackStarted)
                    return;
                fallbackStarted = true;
                pollingSubscription = timer(POLLING_INTERVAL_MS, POLLING_INTERVAL_MS)
                    .pipe(switchMap(() => this.http.get(fallbackUrl).pipe(catchError(() => EMPTY))))
                    .subscribe(observer);
            };
            if (typeof EventSource === 'undefined') {
                startPolling();
                return () => pollingSubscription?.unsubscribe();
            }
            const source = new EventSource(streamUrl);
            const receive = (event) => {
                const data = event.data;
                try {
                    observer.next(JSON.parse(data));
                }
                catch {
                    observer.next(data);
                }
            };
            if (topics.length === 0)
                source.onmessage = receive;
            else
                topics.forEach((topic) => source.addEventListener(topic, receive));
            source.onerror = startPolling;
            return () => {
                topics.forEach((topic) => source.removeEventListener(topic, receive));
                source.close();
                pollingSubscription?.unsubscribe();
            };
        });
    }
};
SseService = __decorate([
    Injectable({ providedIn: 'root' })
], SseService);
export { SseService };
//# sourceMappingURL=sse.service.js.map