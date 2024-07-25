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

export declare class SpamAssassinClient {
  constructor(options: Options);
  check(message: string): Promise<CheckResult>;
}

export {};
