'use strict';

export interface ShouldRetry$ExpBack {
    (err: any): boolean;
}

export interface Opts$ExpBack {
    shouldRetry?: ShouldRetry$ExpBack,
    maxRetries?: number
}

export type FnExpBack = (...args: any[]) => Promise<any>;

export function ApplyExpBack<Fn extends FnExpBack>(fn: Fn, opts?: Opts$ExpBack) {
    if (!opts) opts = {};
    if (!opts.shouldRetry) opts.shouldRetry = () => true;
    if (!opts.maxRetries) opts.maxRetries = 3;

    let nRetries = 0;

    async function expBackRecursive(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
        try {
            return await fn(...args);
        } catch (err) {
            if (!opts.shouldRetry(err)) throw err;
            if (nRetries > opts.maxRetries - 1) throw err;
            
            const jitter = Math.random()*3*1000;
            const waitMs = 2**nRetries*1000 + jitter;
            nRetries++;

            return await new Promise<Awaited<ReturnType<Fn>>>((resolve) => {
                setTimeout(() => { resolve(expBackRecursive(...args)) }, waitMs);
            });
        }
    }
    return expBackRecursive;
}
