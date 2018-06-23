/// <reference types="knockout" />
export declare const computedPromise: <T>(ko: KnockoutStatic, computed: KnockoutComputed<Promise<T>>, defaultValue: T) => KnockoutObservable<T>;
export declare function registerAsyncComputed(ko: KnockoutStatic): void;
export declare const asyncComputed: <T>(getPromise: () => Promise<T>, defaultValue: T) => KnockoutObservable<T>;
