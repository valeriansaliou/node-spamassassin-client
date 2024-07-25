// spamassassin-client
// Copyright 2024, Valerian Saliou
// Author: Valerian Saliou <valerian@valeriansaliou.name>

export declare interface Options {
  host?: string;
  port?: number;
  timeout?: number;
}

export declare interface GenericResult {
  code: number;
  message: string;
}

export declare interface CheckResult extends GenericResult {
  spam: boolean;
  score: number;
}

export declare interface SymbolsResult extends CheckResult {
  symbols: Array<string>;
}

export declare interface ReportResult extends CheckResult {
  report: string;
}

export declare class SpamAssassinClient {
  constructor(options: Options);
  check(message: string): Promise<CheckResult>;
  symbols(message: string): Promise<SymbolsResult>;
  report(message: string): Promise<ReportResult>;
  ping(): Promise<GenericResult>;
}

export {};
