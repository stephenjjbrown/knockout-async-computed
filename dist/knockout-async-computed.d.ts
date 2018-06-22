/// <reference types="knockout" />
export declare const asyncExtender: <T>(ko: KnockoutStatic, computed: KnockoutComputed<Promise<T>>, defaultValue: T) => KnockoutObservable<T>;
