import * as ko from "knockout";

type _KoStatic = typeof ko;
type _KoComputed = ReturnType<typeof ko.computed>;

export const computedPromise = <T>(ko: _KoStatic, computed: ko.Computed<Promise<T>>, defaultValue: T): ko.Observable<T> => {
	const innerObservable = ko.observable(defaultValue);
	(innerObservable as any).inProgress = ko.observable(false);

	let latestPromiseReject: ((reason?: any) => void) | null;

	const evaluateComputed = () => {
		const promise = computed();
		if (promise != null && promise.then) {
			return promise
		} else {
			throw new Error("Computed must return Promise or be async function")
		}
	}

	const evaluatePromise = (p: Promise<T>) => {
		if (latestPromiseReject) {
			latestPromiseReject();
		}

		(innerObservable as any).inProgress(true);

		// Wrap the source Promise, so that we can cancel it if it's still in progress when a new value becomes needed
		new Promise<T>((resolve, reject) => {
			latestPromiseReject = reject;
			const promise = evaluateComputed();
			promise.then(v => resolve(v))
			promise.catch(err => reject(err))
		})
			.then(v => {
				(innerObservable as any).inProgress(false);
				innerObservable(v);
			})
			.catch((err) => {
				latestPromiseReject = null
			})
	}

	evaluatePromise(evaluateComputed());
	computed.subscribe(p => evaluatePromise(p))

	return innerObservable;
}

const createExtender = (ko: _KoStatic) => <T>(computed: ko.Computed<Promise<T>>, defaultValue: T) => computedPromise(ko, computed, defaultValue)

// declare global {
// 	interface KnockoutExtenders {
// 		async: ReturnType<typeof createExtender>
// 	}
// }

export function registerAsyncComputed(ko:_KoStatic) {
	(ko.extenders as any).async = createExtender(ko)
}

export const asyncComputed = <T>(getPromise: () => Promise<T>, defaultValue: T) => computedPromise(ko, ko.computed(() => getPromise()), defaultValue)
