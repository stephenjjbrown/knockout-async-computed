"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncExtender = function (ko, computed, defaultValue) {
    var result;
    if (Array.isArray(defaultValue)) {
        result = ko.observableArray(defaultValue);
    }
    else {
        result = ko.observable(defaultValue);
    }
    result["__inProgress__"] = ko.observable(false);
    var intermediatePromise;
    var intermediatePromiseResolve;
    var intermediatePromiseReject;
    ko.computed(function () {
        if (intermediatePromise) {
            intermediatePromiseReject();
            intermediatePromise = null;
        }
        var promise = computed();
        if (promise != null) {
            if ((typeof promise.then === "function")) {
                result["__inProgress__"](true);
                intermediatePromise = new Promise(function (resolve, reject) {
                    intermediatePromiseResolve = resolve;
                    intermediatePromiseReject = reject;
                }).then(function (data) {
                    result["__inProgress__"](false);
                    result(data);
                }).catch(function (error) {
                    //throw error;
                    //console.log("Promise rejected to ensure correct order of async calls");
                });
                promise.then(intermediatePromiseResolve);
            }
            else {
                result(promise);
            }
        }
        else {
            result(defaultValue);
        }
    });
    return result;
};
//# sourceMappingURL=knockout-async-computed.js.map