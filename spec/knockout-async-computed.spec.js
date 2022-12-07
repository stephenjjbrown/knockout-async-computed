const chai = require("chai");
chai.use(require("chai-as-promised"))
const expect = chai.expect; 
const ko = require("knockout");
const { computedPromise, registerAsyncComputed, asyncComputed} = require("../dist/knockout-async-computed");

// Wait for promise to resolve
const wait = (ms = 0) => new Promise(resolve => setTimeout(() => resolve(), ms))

describe("asyncExtender", () => {
	it("should return the result of a Promise", async function() {
		const computed = computedPromise(ko, ko.computed(() => new Promise(resolve => resolve(3))), null)

		await wait()

		expect(computed()).to.equal(3)
	})

	it("should return the default value when Promise is unresolved", async function() {
		const defaultValue = "default";
		const computed = computedPromise(ko, ko.computed(() => new Promise(resolve => {})), defaultValue)

		expect(computed()).to.equal(defaultValue)
	})

	it("should track dependencies", async function() {
		const computed = computedPromise(ko, ko.computed(() => new Promise(resolve => {
			setTimeout(() => resolve("first"), 1)
		})), "")

		let c2 = 0;
		const computed2 = computedPromise(ko, ko.computed(() => new Promise(resolve => {
			const c = computed()
			c2++;
			setTimeout(() => resolve(c + " second"), 1)
		})), "")

		const computed3 = computedPromise(ko, ko.computed(() => new Promise(resolve => {
			const c = computed2()
			setTimeout(() => resolve(c + " third"), 1)
		})), "")

		await wait(10)

		expect(computed3()).to.equal("first second third")
		computed("newfirst")

		await wait(10);

		expect(computed3()).to.equal("newfirst second third")
		expect(c2).to.equal(3) // Was invoked 3 times, first upon creation, second when computed3 requested its value, and third when computed was updated
	})

	it("should track dependencies with async functions", async function() {
		const computed = computedPromise(ko, ko.computed(async () => {
			await wait(1)
			return "first"
		}), "")

		let c2 = 0;
		const computed2 = computedPromise(ko, ko.computed(async () => {
			const c = computed()
			c2++;
			await wait(1);
			return c + " second";
		}), "")

		const computed3 = computedPromise(ko, ko.computed(async () => {
			const c = computed2()
			await wait(1);
			return c + " third"
		}), "")

		await wait(10)

		expect(computed3()).to.equal("first second third")
		computed("newfirst")

		await wait(10);

		expect(computed3()).to.equal("newfirst second third")
		expect(c2).to.equal(3) // Was invoked 3 times, first upon creation, second when computed3 requested its value, and third when computed was updated
	})

	it("should return Promises in correct order", async () => {
		const time = ko.observable(6);
		const computed = computedPromise(ko, ko.computed(() => {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve(time())
				}, time())
			})
		}), null)

		computed() //?
		time(3) // Trigger a second, but quicker async call
		await wait(7)
		
		// i will be 2 when 
		computed() //?
		expect(computed()).to.equal(3);
	})

	it("should work with Promises that return arrays if default value is array", async function() {
		const computed = computedPromise(ko, ko.computed(() => new Promise(resolve => resolve([1,2,3]))), [])

		await wait()

		expect(computed()).to.deep.equal([1,2,3])
	})
	
	it("should accept an async function", async () => {
		const computed = computedPromise(ko, ko.computed(async () => 3), -1)

		await wait()

		expect(computed()).to.equal(3)
	})

	it("should throw error if non-Promise function supplied", async () => {
		expect(() => computedPromise(ko, ko.computed(() => 3), -1)).to.throw()
	})

	it("can be used as extender", async () => {
		registerAsyncComputed(ko)

		const computed = ko.computed(async () => {
			await wait(2)
			return 3;
		}).extend({async: -1})

		expect(computed()).to.equal(-1)
		await wait(3)

		expect(computed()).to.equal(3)
	})

	it("can be used as factory", async () => {
		registerAsyncComputed(ko)

		const computed = asyncComputed(async () => {
			await wait(2)
			return 3;
		}, -1)

		expect(computed()).to.equal(-1)
		await wait(3)

		expect(computed()).to.equal(3)
	})

	it("should dispose getter computed", async () => {
		registerAsyncComputed(ko)

		// Serves as dependency that would make computed evaluate
		const observable = ko.observable(0);

		let m = 0; // Confirms whether computed was called

		const computed = asyncComputed(async () => {
			m = observable();
			return;
		}, -1)
		await wait(1);

		computed.dispose();

		observable(1); // This would normally make computed getter run again
		await wait(1);

		expect(m).to.equal(0);
	});

	it("should dispose inner getter subscription", async () => {
		registerAsyncComputed(ko)

		const observable = ko.observable(0);

		const computed = asyncComputed(async () => {
			return observable();
		}, -1);
		await wait(1);

		computed.dispose();

		observable(1);// This would normally make computed's subscriptions fire
		await wait(1);

		expect(computed()).to.equal(0);
	});

	it("should reject promise if disposed", async () => {
		registerAsyncComputed(ko)

		const observable = ko.observable(0);

		const computed = asyncComputed(async () => {
			return observable();
		}, -1);

		computed.dispose();
		await wait(1);

		expect(computed()).to.equal(-1);
	});
})