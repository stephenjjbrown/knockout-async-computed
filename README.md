[![Build Status](https://travis-ci.org/stephenjjbrown/knockout-async-computed.svg?branch=master)](https://travis-ci.org/stephenjjbrown/knockout-async-computed)
[![codecov](https://codecov.io/gh/stephenjjbrown/knockout-async-computed/branch/master/graph/badge.svg)](https://codecov.io/gh/stephenjjbrown/knockout-async-computed)
[![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-green.svg)](https://wallabyjs.com)

# Knockout Async Computed

A Knockout extender that allows you to easily wrap a promise as a computed observable.

## Usage

### As an extender

```typescript
// Registers the extender on global ko object
registerAsyncComputed(ko)

// Pass async function as computed getter
// or pass in regular function that returns Promise
const computed = ko.computed(async () => {

	// Do something here
	return fetch("/api/entities.json")
		.then(r => r.json())
		
}).extend({async: []}) //  Provide initial value. This is used until the async function is completed for the first time

computed() // Returns [], since fetch has not yet finished

computed.subscribe(value => {
	console.log(value) // Returns result of async function
})
```

### As a factory (recommended for Typescript)

```typescript
import {asyncComputed} from "knockout-async-computed"

// Create using factory function
// Pass async function or regular function that returns Promise
const observable = asyncComputed(async () => {

	// Do something here
	return fetch("/api/entities.json")
		.then(r => r.json()) as Entity[]
		
}, []) // Provide initial value as 2nd argument

// Correctly typed as KnockoutObservable<Entity[]>
observable() // Returns [], since fetch has not yet finished

observable.subscribe(value => {
	console.log(value) // Returns result of async function
})
```

## Requirements

- Requires that Promise be available in the browser. A polyfill may be needed.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details