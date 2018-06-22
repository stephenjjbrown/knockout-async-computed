const chai = require("chai");
chai.use(require("chai-as-promised"))
const expect = chai.expect; 
const ko = require("knockout");
const { asyncExtender } = require("../dist/knockout-async-computed");

// Wait for promise to resolve
const wait = (ms = 0) => new Promise(resolve => setTimeout(() => resolve(), ms))

describe("asyncExtender", () => {
	it("should return the result of a Promise", async function() {
		const computed = asyncExtender(ko, ko.computed(() => new Promise(resolve => resolve(3))), null)

		await wait()

		expect(computed()).to.equal(3)
	})

	it("should return the default value when Promise is unresolved", async function() {
		const defaultValue = "default";
		const computed = asyncExtender(ko, ko.computed(() => new Promise(resolve => {})), defaultValue)

		expect(computed()).to.equal(defaultValue)
	})

	it("should work with Promises that return arrays", async function() {
		const computed = asyncExtender(ko, ko.computed(() => new Promise(resolve => resolve([1,2,3]))), null)

		await wait()

		expect(computed()).to.deep.equal([1,2,3])
	})


})