/// <reference types="knockout" />
export declare const asyncExtender: <T>(computed: KnockoutComputed<Promise<T>>, defaultValue: T) => KnockoutObservable<T>;
