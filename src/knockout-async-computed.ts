import * as ko from "knockout";

export const computedPromise = <T>(ko: KnockoutStatic, computed: KnockoutComputed<Promise<T>>, defaultValue: T): KnockoutObservable<T> => {
	const innerObservable = ko.observable(defaultValue);

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
		if (latestPromiseReject)
			latestPromiseReject()

		// Wrap the source Promise, so that we can cancel it if it's still in progress when a new value becomes needed
		new Promise<T>((resolve, reject) => {
			latestPromiseReject = reject;
			const promise = evaluateComputed();
			promise.then(v => resolve(v))
			promise.catch(err => reject(err))
		})
		.then(v => innerObservable(v))
		.catch((err) => {
			latestPromiseReject = null
		})
	}
	evaluatePromise(evaluateComputed());

	computed.subscribe(p => evaluatePromise(p))

	return innerObservable;
}

const createExtender = (ko: KnockoutStatic) => <T>(computed: KnockoutComputed<Promise<T>>, defaultValue: T) => computedPromise(ko,computed,defaultValue)

// declare global {
// 	interface KnockoutExtenders {
// 		async: ReturnType<typeof createExtender>
// 	}
// }

export function registerAsyncComputed(ko: KnockoutStatic) {
	(ko.extenders as any).async = createExtender(ko)
}

export const asyncComputed = <T>(getPromise: () => Promise<T>, defaultValue: T) => computedPromise(ko, ko.computed(() => getPromise()), defaultValue)