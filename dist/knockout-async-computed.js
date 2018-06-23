"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncExtender = function (ko, computed, defaultValue) {
    var innerObservable = ko.observable(defaultValue);
    var latestPromiseReject;
    var evaluateComputed = function () {
        var promise = computed();
        if (promise != null && promise.then) {
            return promise;
        }
        else {
            throw new Error("Computed must return Promise or be async function");
        }
    };
    var evaluatePromise = function (p) {
        if (latestPromiseReject)
            latestPromiseReject();
        // Wrap the source Promise, so that we can cancel it if it's still in progress when a new value becomes needed
        new Promise(function (resolve, reject) {
            latestPromiseReject = reject;
            var promise = evaluateComputed();
            promise.then(function (v) { return resolve(v); });
            promise.catch(function (err) { return reject(err); });
        })
            .then(function (v) { return innerObservable(v); })
            .catch(function (err) {
            latestPromiseReject = null;
        });
    };
    evaluatePromise(evaluateComputed());
    computed.subscribe(function (p) { return evaluatePromise(p); });
    return innerObservable;
};
//# sourceMappingURL=knockout-async-computed.js.map