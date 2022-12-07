import * as ko from "knockout";
type _KoStatic = typeof ko;
interface AsyncExtended<T> {
    getter: ko.Computed<Promise<T>>;
    inProgress: ko.Observable<boolean>;
    dispose: () => void;
}
export declare const computedPromise: <T>(ko: _KoStatic, getter: ko.Computed<Promise<T>>, defaultValue: T) => ko.Observable<T> | AsyncExtended<T>;
export declare function registerAsyncComputed(ko: _KoStatic): void;
export declare const asyncComputed: <T>(getPromise: () => Promise<T>, defaultValue: T) => ko.Observable<T> | AsyncExtended<T>;
export {};
