import * as ko from "knockout";

type _KoStatic = typeof ko;

interface AsyncExtended<T> {
	getter: ko.Computed<Promise<T>>;
	inProgress: ko.Observable<boolean>;
	dispose: () => void;
}

export const computedPromise = <T>(ko: _KoStatic, getter: ko.Computed<Promise<T>>, defaultValue: T): ko.Observable<T> | AsyncExtended<T> => {
	const innerObservable = ko.observable(defaultValue);
	(innerObservable as any).inProgress = ko.observable(false);
	(innerObservable as any).getter = getter;

	let existingPromiseReject: ((reason?: any) => void) | null;

	const runGetterAndEnsureIsPromise = () => {
		const promise = getter();
		if (promise != null && promise.then) {
			return promise
		} else {
			throw new Error("Computed must return Promise or be async function")
		}
	}

	const rejectAndGetValue = () => {
		if (existingPromiseReject) {
			existingPromiseReject();
		}

		(innerObservable as any).inProgress(true);

		const promise = runGetterAndEnsureIsPromise();

		// Wrap the source Promise, so that we can cancel it if it's still in progress when a new value becomes needed
		new Promise<T>((resolve, reject) => {
			existingPromiseReject = reject;
			
			promise.then(v => resolve(v))
			promise.catch(err => reject(err))
		})
			.then(v => {
				(innerObservable as any).inProgress(false);
				innerObservable(v);
				existingPromiseReject = null
			})
			.catch((err) => {
				existingPromiseReject = null
			})
	}

	rejectAndGetValue();
	const subscription = getter.subscribe(p => {
		return rejectAndGetValue()
	});

	(innerObservable as any).dispose = () => {
		subscription.dispose();
		existingPromiseReject?.();
		getter.dispose();
	}

	return innerObservable;
}

const createExtender = (ko: _KoStatic) => <T>(computed: ko.Computed<Promise<T>>, defaultValue: T) => computedPromise(ko, computed, defaultValue)


export function registerAsyncComputed(ko:_KoStatic) {
	(ko.extenders as any).async = createExtender(ko)
}

export const asyncComputed = <T>(getPromise: () => Promise<T>, defaultValue: T) => computedPromise(ko, ko.computed(() => getPromise()), defaultValue)
