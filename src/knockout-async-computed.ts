export const asyncExtender = <T>(computed: KnockoutComputed<Promise<T>>, defaultValue: T): KnockoutObservable<T> => {
	let result: KnockoutObservable<any>;
	if (Array.isArray(defaultValue)) {
		result = ko.observableArray(defaultValue) as any;
	} else {
		result = ko.observable(defaultValue);
	}
	result["__inProgress__"] = ko.observable(false);

	let intermediatePromise: Promise<any> | null;
	let intermediatePromiseResolve;
	let intermediatePromiseReject;

	ko.computed(() => {
		if (intermediatePromise) {
			intermediatePromiseReject();
			intermediatePromise = null;
		}

		const promise = computed();

		if (promise != null) {
			if ((typeof promise.then === "function")) {
				result["__inProgress__"](true);

				intermediatePromise = new Promise((resolve, reject) => {
					intermediatePromiseResolve = resolve;
					intermediatePromiseReject = reject;
				}).then((data: any) => {
					result["__inProgress__"](false);
					result(data);
				}).catch(error => {
					// console.info("Promise rejected to ensure correct order of async calls");
				});

				promise.then(intermediatePromiseResolve);
			} else {
				result(promise);
			}
		} else {
			result(defaultValue);
		}
	});

	return result;
}