[![Build Status](https://travis-ci.org/stephenjjbrown/knockout-async-computed.svg?branch=master)](https://travis-ci.org/stephenjjbrown/knockout-async-computed)
[![codecov](https://codecov.io/gh/stephenjjbrown/knockout-async-computed/branch/master/graph/badge.svg)](https://codecov.io/gh/stephenjjbrown/knockout-async-computed)
[![Wallaby.js](https://img.shields.io/badge/wallaby.js-configured-green.svg)](https://wallabyjs.com)

# Knockout Async Computed

Allows you to easily create computed observables from async functions or Promises.

Dependencies between async computeds are automatically tracked by Knockout, just like any other computed. If an older async operation takes longer than a more recent one, the older one is automatically cancelled (the Promise rejected), ensuring you always get the most current value, and at the correct time.

Combine this library with a memoize library to reduce repeat network calls to the same resource.

## Usage

### As an extender

```javascript
// Adds the extender to ko.extenders
registerAsyncComputed(ko)

// Pass async function or regular function that returns Promise
const items = ko.computed(async () => {

   // Do something here
   return fetch("/api/entities.json")
      .then(r => r.json())
      
}).extend({async: []}) //  Provide initial value. This is used until the async function is completed for the first time
```

### As a factory (recommended for Typescript)

```javascript
import { asyncComputed } from "knockout-async-computed"

// Create using factory function
// Pass async function or regular function that returns Promise
const items = asyncComputed(async () => {

   // Do something here
   return fetch("/api/entities.json")
      .then(r => r.json())
      
}, []) // Provide initial value as 2nd argument
```

## Requirements

- Requires that Promise be available in the browser. A polyfill may be needed.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details