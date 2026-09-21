// Ambiente de TestBed único para todos os specs (plan.md R-0014 M3). Componentes usam
// template/styles inline: o compilador JIT resolve tudo em memória no jsdom.
import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { afterEach, beforeAll } from 'vitest';

beforeAll(() =>
  TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()),
);
afterEach(() => TestBed.resetTestingModule());
