var { expect } = require("chai");
var ko = require("knockout");
var { asyncExtender } = require("../dist/knockout-async-computed");

// Wait for promise to resolve
const wait = (ms = 0) => new Promise(resolve => setTimeout(() => resolve(), ms))

describe("asyncExtender", () => {
	it("should return the result of a promise", async function() {
		const computed = asyncExtender(ko, ko.computed(() => new Promise(resolve => resolve(3))), null)

		await wait()

		expect(computed()).to.equal(3)
	})
})