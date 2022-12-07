"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncComputed = exports.registerAsyncComputed = exports.computedPromise = void 0;
var ko = require("knockout");
var computedPromise = function (ko, getter, defaultValue) {
    var innerObservable = ko.observable(defaultValue);
    innerObservable.inProgress = ko.observable(false);
    innerObservable.getter = getter;
    var existingPromiseReject;
    var runGetterAndEnsureIsPromise = function () {
        var promise = getter();
        if (promise != null && promise.then) {
            return promise;
        }
        else {
            throw new Error("Computed must return Promise or be async function");
        }
    };
    var rejectAndGetValue = function () {
        if (existingPromiseReject) {
            existingPromiseReject();
        }
        innerObservable.inProgress(true);
        var promise = runGetterAndEnsureIsPromise();
        // Wrap the source Promise, so that we can cancel it if it's still in progress when a new value becomes needed
        new Promise(function (resolve, reject) {
            existingPromiseReject = reject;
            promise.then(function (v) { return resolve(v); });
            promise.catch(function (err) { return reject(err); });
        })
            .then(function (v) {
            innerObservable.inProgress(false);
            innerObservable(v);
            existingPromiseReject = null;
        })
            .catch(function (err) {
            existingPromiseReject = null;
        });
    };
    rejectAndGetValue();
    var subscription = getter.subscribe(function (p) {
        return rejectAndGetValue();
    });
    innerObservable.dispose = function () {
        subscription.dispose();
        existingPromiseReject === null || existingPromiseReject === void 0 ? void 0 : existingPromiseReject();
        getter.dispose();
    };
    return innerObservable;
};
exports.computedPromise = computedPromise;
var createExtender = function (ko) { return function (computed, defaultValue) { return (0, exports.computedPromise)(ko, computed, defaultValue); }; };
function registerAsyncComputed(ko) {
    ko.extenders.async = createExtender(ko);
}
exports.registerAsyncComputed = registerAsyncComputed;
var asyncComputed = function (getPromise, defaultValue) { return (0, exports.computedPromise)(ko, ko.computed(function () { return getPromise(); }), defaultValue); };
exports.asyncComputed = asyncComputed;
//# sourceMappingURL=knockout-async-computed.js.map