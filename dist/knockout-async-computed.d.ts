import * as ko from "knockout";
type _KoStatic = typeof ko;
export declare const computedPromise: <T>(ko: _KoStatic, computed: ko.Computed<Promise<T>>, defaultValue: T) => ko.Observable<T>;
export declare function registerAsyncComputed(ko: _KoStatic): void;
export declare const asyncComputed: <T>(getPromise: () => Promise<T>, defaultValue: T) => ko.Observable<T>;
export {};
