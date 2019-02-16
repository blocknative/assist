(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.assist = factory());
}(this, (function () { 'use strict';

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  !(function(global) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = module.exports;

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    runtime.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    runtime.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    runtime.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return runtime.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          if (delegate.iterator.return) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined;
        }

        return ContinueSentinel;
      }
    };
  })(
    // In sloppy mode, unbound `this` refers to the global object, fallback to
    // Function constructor if we're in global strict mode. That is sadly a form
    // of indirect eval which violates Content Security Policy.
    (function() {
      return this || (typeof self === "object" && self);
    })() || Function("return this")()
  );
  });

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  // This method of obtaining a reference to the global object needs to be
  // kept identical to the way it is obtained in runtime.js
  var g = (function() {
    return this || (typeof self === "object" && self);
  })() || Function("return this")();

  // Use `getOwnPropertyNames` because not all browsers support calling
  // `hasOwnProperty` on the global `self` object in a worker. See #183.
  var hadRuntime = g.regeneratorRuntime &&
    Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

  // Save the old regeneratorRuntime in case it needs to be restored later.
  var oldRuntime = hadRuntime && g.regeneratorRuntime;

  // Force reevalutation of runtime.js.
  g.regeneratorRuntime = undefined;

  var runtimeModule = runtime;

  if (hadRuntime) {
    // Restore the original runtime.
    g.regeneratorRuntime = oldRuntime;
  } else {
    // Remove the global property added by runtime.js.
    try {
      delete g.regeneratorRuntime;
    } catch(e) {
      g.regeneratorRuntime = undefined;
    }
  }

  var regenerator = runtimeModule;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

  function _typeof(obj) {
    if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return _typeof2(obj);
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.6.2' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');
  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];
  var TPL = ('' + $toString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return $toString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || $toString.call(this);
  });
  });

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // extend global
      if (target) _redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) _hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  _global.core = _core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  var max = Math.max;
  var min = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  };

  // 7.1.15 ToLength

  var min$1 = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min$1(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
    var O = _toObject(this);
    var len = _toLength(O.length);
    var to = _toAbsoluteIndex(target, len);
    var from = _toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  };

  var _library = false;

  var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode: 'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = _wks('unscopables');
  var ArrayProto = Array.prototype;
  if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
  var _addToUnscopables = function (key) {
    ArrayProto[UNSCOPABLES][key] = true;
  };

  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)


  _export(_export.P, 'Array', { copyWithin: _arrayCopyWithin });

  _addToUnscopables('copyWithin');

  var _arrayFill = function fill(value /* , start = 0, end = @length */) {
    var O = _toObject(this);
    var length = _toLength(O.length);
    var aLen = arguments.length;
    var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  };

  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


  _export(_export.P, 'Array', { fill: _arrayFill });

  _addToUnscopables('fill');

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  var SPECIES = _wks('species');

  var _arraySpeciesConstructor = function (original) {
    var C;
    if (_isArray(original)) {
      C = original.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
      if (_isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    } return C === undefined ? Array : C;
  };

  // 9.4.2.3 ArraySpeciesCreate(originalArray, length)


  var _arraySpeciesCreate = function (original, length) {
    return new (_arraySpeciesConstructor(original))(length);
  };

  // 0 -> Array#forEach
  // 1 -> Array#map
  // 2 -> Array#filter
  // 3 -> Array#some
  // 4 -> Array#every
  // 5 -> Array#find
  // 6 -> Array#findIndex





  var _arrayMethods = function (TYPE, $create) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    var create = $create || _arraySpeciesCreate;
    return function ($this, callbackfn, that) {
      var O = _toObject($this);
      var self = _iobject(O);
      var f = _ctx(callbackfn, that, 3);
      var length = _toLength(self.length);
      var index = 0;
      var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var val, res;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP) result[index] = res;   // map
          else if (res) switch (TYPE) {
            case 3: return true;             // some
            case 5: return val;              // find
            case 6: return index;            // findIndex
            case 2: result.push(val);        // filter
          } else if (IS_EVERY) return false; // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };

  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

  var $find = _arrayMethods(5);
  var KEY = 'find';
  var forced = true;
  // Shouldn't skip holes
  if (KEY in []) Array(1)[KEY](function () { forced = false; });
  _export(_export.P + _export.F * forced, 'Array', {
    find: function find(callbackfn /* , that = undefined */) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });
  _addToUnscopables(KEY);

  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)

  var $find$1 = _arrayMethods(6);
  var KEY$1 = 'findIndex';
  var forced$1 = true;
  // Shouldn't skip holes
  if (KEY$1 in []) Array(1)[KEY$1](function () { forced$1 = false; });
  _export(_export.P + _export.F * forced$1, 'Array', {
    findIndex: function findIndex(callbackfn /* , that = undefined */) {
      return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });
  _addToUnscopables(KEY$1);

  // call something on iterator step with safe closing on error

  var _iterCall = function (iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  };

  var _iterators = {};

  // check on default Array iterator

  var ITERATOR = _wks('iterator');
  var ArrayProto$1 = Array.prototype;

  var _isArrayIter = function (it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR] === it);
  };

  var _createProperty = function (object, index, value) {
    if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
    else object[index] = value;
  };

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG = _wks('toStringTag');
  // ES3 wrong here
  var ARG = _cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof(O)
      // ES3 arguments fallback
      : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var ITERATOR$1 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$1]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  var ITERATOR$2 = _wks('iterator');
  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$2]();
    riter['return'] = function () { SAFE_CLOSING = true; };
  } catch (e) { /* empty */ }

  var _iterDetect = function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;
    try {
      var arr = [7];
      var iter = arr[ITERATOR$2]();
      iter.next = function () { return { done: safe = true }; };
      arr[ITERATOR$2] = function () { return iter; };
      exec(arr);
    } catch (e) { /* empty */ }
    return safe;
  };

  _export(_export.S + _export.F * !_iterDetect(function (iter) { }), 'Array', {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
      var O = _toObject(arrayLike);
      var C = typeof this == 'function' ? this : Array;
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var index = 0;
      var iterFn = core_getIteratorMethod(O);
      var length, result, step, iterator;
      if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
      // if object isn't iterable or it's array with default iterator - use simple case
      if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
          _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
        }
      } else {
        length = _toLength(O.length);
        for (result = new C(length); length > index; index++) {
          _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
        }
      }
      result.length = index;
      return result;
    }
  });

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  // https://github.com/tc39/Array.prototype.includes

  var $includes = _arrayIncludes(true);

  _export(_export.P, 'Array', {
    includes: function includes(el /* , fromIndex = 0 */) {
      return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  _addToUnscopables('includes');

  var _iterStep = function (done, value) {
    return { value: value, done: !!done };
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  var def = _objectDp.f;

  var TAG$1 = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR$3 = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR$3] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
        // fix for some old engines
        if (!_library && typeof IteratorPrototype[ITERATOR$3] != 'function') _hide(IteratorPrototype, ITERATOR$3, returnThis);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR$3])) {
      _hide(proto, ITERATOR$3, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }
    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  _iterators.Arguments = _iterators.Array;

  _addToUnscopables('keys');
  _addToUnscopables('values');
  _addToUnscopables('entries');

  // WebKit Array.of isn't generic
  _export(_export.S + _export.F * _fails(function () {
    function F() { /* empty */ }
    return !(Array.of.call(F) instanceof F);
  }), 'Array', {
    // 22.1.2.3 Array.of( ...items)
    of: function of(/* ...args */) {
      var index = 0;
      var aLen = arguments.length;
      var result = new (typeof this == 'function' ? this : Array)(aLen);
      while (aLen > index) _createProperty(result, index, arguments[index++]);
      result.length = aLen;
      return result;
    }
  });

  var SPECIES$1 = _wks('species');

  var _setSpecies = function (KEY) {
    var C = _global[KEY];
    if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
      configurable: true,
      get: function () { return this; }
    });
  };

  _setSpecies('Array');

  var NUMBER = 'number';

  var _dateToPrimitive = function (hint) {
    if (hint !== 'string' && hint !== NUMBER && hint !== 'default') throw TypeError('Incorrect hint');
    return _toPrimitive(_anObject(this), hint != NUMBER);
  };

  var TO_PRIMITIVE = _wks('toPrimitive');
  var proto = Date.prototype;

  if (!(TO_PRIMITIVE in proto)) _hide(proto, TO_PRIMITIVE, _dateToPrimitive);

  var HAS_INSTANCE = _wks('hasInstance');
  var FunctionProto = Function.prototype;
  // 19.2.3.6 Function.prototype[@@hasInstance](V)
  if (!(HAS_INSTANCE in FunctionProto)) _objectDp.f(FunctionProto, HAS_INSTANCE, { value: function (O) {
    if (typeof this != 'function' || !_isObject(O)) return false;
    if (!_isObject(this.prototype)) return O instanceof this;
    // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
    while (O = _objectGpo(O)) if (this.prototype === O) return true;
    return false;
  } });

  var dP$1 = _objectDp.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // 19.2.4.2 name
  NAME in FProto || _descriptors && dP$1(FProto, NAME, {
    configurable: true,
    get: function () {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var _redefineAll = function (target, src, safe) {
    for (var key in src) _redefine(target, key, src[key], safe);
    return target;
  };

  var _anInstance = function (it, Constructor, name, forbiddenField) {
    if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
      throw TypeError(name + ': incorrect invocation!');
    } return it;
  };

  var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};
  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
    // fast case for arrays with default iterator
    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };
  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
  });

  var _meta = createCommonjsModule(function (module) {
  var META = _uid('meta');


  var setDesc = _objectDp.f;
  var id = 0;
  var isExtensible = Object.isExtensible || function () {
    return true;
  };
  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });
  var setMeta = function (it) {
    setDesc(it, META, { value: {
      i: 'O' + ++id, // object ID
      w: {}          // weak collections IDs
    } });
  };
  var fastKey = function (it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMeta(it);
    // return object ID
    } return it[META].i;
  };
  var getWeak = function (it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMeta(it);
    // return hash weak collections IDs
    } return it[META].w;
  };
  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };
  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };
  });
  var _meta_1 = _meta.KEY;
  var _meta_2 = _meta.NEED;
  var _meta_3 = _meta.fastKey;
  var _meta_4 = _meta.getWeak;
  var _meta_5 = _meta.onFreeze;

  var _validateCollection = function (it, TYPE) {
    if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
    return it;
  };

  var dP$2 = _objectDp.f;









  var fastKey = _meta.fastKey;

  var SIZE = _descriptors ? '_s' : 'size';

  var getEntry = function (that, key) {
    // fast case
    var index = fastKey(key);
    var entry;
    if (index !== 'F') return that._i[index];
    // frozen object case
    for (entry = that._f; entry; entry = entry.n) {
      if (entry.k == key) return entry;
    }
  };

  var _collectionStrong = {
    getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        _anInstance(that, C, NAME, '_i');
        that._t = NAME;         // collection type
        that._i = _objectCreate(null); // index
        that._f = undefined;    // first entry
        that._l = undefined;    // last entry
        that[SIZE] = 0;         // size
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
      });
      _redefineAll(C.prototype, {
        // 23.1.3.1 Map.prototype.clear()
        // 23.2.3.2 Set.prototype.clear()
        clear: function clear() {
          for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
            entry.r = true;
            if (entry.p) entry.p = entry.p.n = undefined;
            delete data[entry.i];
          }
          that._f = that._l = undefined;
          that[SIZE] = 0;
        },
        // 23.1.3.3 Map.prototype.delete(key)
        // 23.2.3.4 Set.prototype.delete(value)
        'delete': function (key) {
          var that = _validateCollection(this, NAME);
          var entry = getEntry(that, key);
          if (entry) {
            var next = entry.n;
            var prev = entry.p;
            delete that._i[entry.i];
            entry.r = true;
            if (prev) prev.n = next;
            if (next) next.p = prev;
            if (that._f == entry) that._f = next;
            if (that._l == entry) that._l = prev;
            that[SIZE]--;
          } return !!entry;
        },
        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
        forEach: function forEach(callbackfn /* , that = undefined */) {
          _validateCollection(this, NAME);
          var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
          var entry;
          while (entry = entry ? entry.n : this._f) {
            f(entry.v, entry.k, this);
            // revert to the last existing entry
            while (entry && entry.r) entry = entry.p;
          }
        },
        // 23.1.3.7 Map.prototype.has(key)
        // 23.2.3.7 Set.prototype.has(value)
        has: function has(key) {
          return !!getEntry(_validateCollection(this, NAME), key);
        }
      });
      if (_descriptors) dP$2(C.prototype, 'size', {
        get: function () {
          return _validateCollection(this, NAME)[SIZE];
        }
      });
      return C;
    },
    def: function (that, key, value) {
      var entry = getEntry(that, key);
      var prev, index;
      // change existing entry
      if (entry) {
        entry.v = value;
      // create new entry
      } else {
        that._l = entry = {
          i: index = fastKey(key, true), // <- index
          k: key,                        // <- key
          v: value,                      // <- value
          p: prev = that._l,             // <- previous entry
          n: undefined,                  // <- next entry
          r: false                       // <- removed
        };
        if (!that._f) that._f = entry;
        if (prev) prev.n = entry;
        that[SIZE]++;
        // add to index
        if (index !== 'F') that._i[index] = entry;
      } return that;
    },
    getEntry: getEntry,
    setStrong: function (C, NAME, IS_MAP) {
      // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
      _iterDefine(C, NAME, function (iterated, kind) {
        this._t = _validateCollection(iterated, NAME); // target
        this._k = kind;                     // kind
        this._l = undefined;                // previous
      }, function () {
        var that = this;
        var kind = that._k;
        var entry = that._l;
        // revert to the last existing entry
        while (entry && entry.r) entry = entry.p;
        // get next entry
        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
          // or finish the iteration
          that._t = undefined;
          return _iterStep(1);
        }
        // return step by kind
        if (kind == 'keys') return _iterStep(0, entry.k);
        if (kind == 'values') return _iterStep(0, entry.v);
        return _iterStep(0, [entry.k, entry.v]);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

      // add [@@species], 23.1.2.2, 23.2.2.2
      _setSpecies(NAME);
    }
  };

  var f$1 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$1
  };

  var gOPD = Object.getOwnPropertyDescriptor;

  var f$2 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };

  var _objectGopd = {
  	f: f$2
  };

  // Works with __proto__ only. Old v8 can't work with null proto objects.
  /* eslint-disable no-proto */


  var check = function (O, proto) {
    _anObject(O);
    if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
  };
  var _setProto = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
      function (test, buggy, set) {
        try {
          set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
          set(test, []);
          buggy = !(test instanceof Array);
        } catch (e) { buggy = true; }
        return function setPrototypeOf(O, proto) {
          check(O, proto);
          if (buggy) O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }({}, false) : undefined),
    check: check
  };

  var setPrototypeOf = _setProto.set;
  var _inheritIfRequired = function (that, target, C) {
    var S = target.constructor;
    var P;
    if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
      setPrototypeOf(that, P);
    } return that;
  };

  var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = _global[NAME];
    var C = Base;
    var ADDER = IS_MAP ? 'set' : 'add';
    var proto = C && C.prototype;
    var O = {};
    var fixMethod = function (KEY) {
      var fn = proto[KEY];
      _redefine(proto, KEY,
        KEY == 'delete' ? function (a) {
          return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'has' ? function has(a) {
          return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'get' ? function get(a) {
          return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
          : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
      );
    };
    if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
      new C().entries().next();
    }))) {
      // create collection constructor
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      _redefineAll(C.prototype, methods);
      _meta.NEED = true;
    } else {
      var instance = new C();
      // early implementations not supports chaining
      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      var THROWS_ON_PRIMITIVES = _fails(function () { instance.has(1); });
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      var ACCEPT_ITERABLES = _iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      var BUGGY_ZERO = !IS_WEAK && _fails(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C();
        var index = 5;
        while (index--) $instance[ADDER](index, index);
        return !$instance.has(-0);
      });
      if (!ACCEPT_ITERABLES) {
        C = wrapper(function (target, iterable) {
          _anInstance(target, C, NAME);
          var that = _inheritIfRequired(new Base(), target, C);
          if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
          return that;
        });
        C.prototype = proto;
        proto.constructor = C;
      }
      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
        fixMethod('delete');
        fixMethod('has');
        IS_MAP && fixMethod('get');
      }
      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
      // weak collections should not contains .clear method
      if (IS_WEAK && proto.clear) delete proto.clear;
    }

    _setToStringTag(C, NAME);

    O[NAME] = C;
    _export(_export.G + _export.W + _export.F * (C != Base), O);

    if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

    return C;
  };

  var MAP = 'Map';

  // 23.1 Map Objects
  var es6_map = _collection(MAP, function (get) {
    return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
  }, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function get(key) {
      var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function set(key, value) {
      return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
    }
  }, _collectionStrong, true);

  // 20.2.2.20 Math.log1p(x)
  var _mathLog1p = Math.log1p || function log1p(x) {
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
  };

  // 20.2.2.3 Math.acosh(x)


  var sqrt = Math.sqrt;
  var $acosh = Math.acosh;

  _export(_export.S + _export.F * !($acosh
    // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
    && Math.floor($acosh(Number.MAX_VALUE)) == 710
    // Tor Browser bug: Math.acosh(Infinity) -> NaN
    && $acosh(Infinity) == Infinity
  ), 'Math', {
    acosh: function acosh(x) {
      return (x = +x) < 1 ? NaN : x > 94906265.62425156
        ? Math.log(x) + Math.LN2
        : _mathLog1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
    }
  });

  // 20.2.2.5 Math.asinh(x)

  var $asinh = Math.asinh;

  function asinh(x) {
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
  }

  // Tor Browser bug: Math.asinh(0) -> -0
  _export(_export.S + _export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', { asinh: asinh });

  // 20.2.2.7 Math.atanh(x)

  var $atanh = Math.atanh;

  // Tor Browser bug: Math.atanh(-0) -> 0
  _export(_export.S + _export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
    atanh: function atanh(x) {
      return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
    }
  });

  // 20.2.2.28 Math.sign(x)
  var _mathSign = Math.sign || function sign(x) {
    // eslint-disable-next-line no-self-compare
    return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
  };

  // 20.2.2.9 Math.cbrt(x)



  _export(_export.S, 'Math', {
    cbrt: function cbrt(x) {
      return _mathSign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
    }
  });

  // 20.2.2.11 Math.clz32(x)


  _export(_export.S, 'Math', {
    clz32: function clz32(x) {
      return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
    }
  });

  // 20.2.2.12 Math.cosh(x)

  var exp = Math.exp;

  _export(_export.S, 'Math', {
    cosh: function cosh(x) {
      return (exp(x = +x) + exp(-x)) / 2;
    }
  });

  // 20.2.2.14 Math.expm1(x)
  var $expm1 = Math.expm1;
  var _mathExpm1 = (!$expm1
    // Old FF bug
    || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
    // Tor Browser bug
    || $expm1(-2e-17) != -2e-17
  ) ? function expm1(x) {
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
  } : $expm1;

  // 20.2.2.14 Math.expm1(x)



  _export(_export.S + _export.F * (_mathExpm1 != Math.expm1), 'Math', { expm1: _mathExpm1 });

  // 20.2.2.16 Math.fround(x)

  var pow = Math.pow;
  var EPSILON = pow(2, -52);
  var EPSILON32 = pow(2, -23);
  var MAX32 = pow(2, 127) * (2 - EPSILON32);
  var MIN32 = pow(2, -126);

  var roundTiesToEven = function (n) {
    return n + 1 / EPSILON - 1 / EPSILON;
  };

  var _mathFround = Math.fround || function fround(x) {
    var $abs = Math.abs(x);
    var $sign = _mathSign(x);
    var a, result;
    if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    // eslint-disable-next-line no-self-compare
    if (result > MAX32 || result != result) return $sign * Infinity;
    return $sign * result;
  };

  // 20.2.2.16 Math.fround(x)


  _export(_export.S, 'Math', { fround: _mathFround });

  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])

  var abs = Math.abs;

  _export(_export.S, 'Math', {
    hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
      var sum = 0;
      var i = 0;
      var aLen = arguments.length;
      var larg = 0;
      var arg, div;
      while (i < aLen) {
        arg = abs(arguments[i++]);
        if (larg < arg) {
          div = larg / arg;
          sum = sum * div * div + 1;
          larg = arg;
        } else if (arg > 0) {
          div = arg / larg;
          sum += div * div;
        } else sum += arg;
      }
      return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
    }
  });

  // 20.2.2.18 Math.imul(x, y)

  var $imul = Math.imul;

  // some WebKit versions fails with big numbers, some has wrong arity
  _export(_export.S + _export.F * _fails(function () {
    return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
  }), 'Math', {
    imul: function imul(x, y) {
      var UINT16 = 0xffff;
      var xn = +x;
      var yn = +y;
      var xl = UINT16 & xn;
      var yl = UINT16 & yn;
      return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
    }
  });

  // 20.2.2.20 Math.log1p(x)


  _export(_export.S, 'Math', { log1p: _mathLog1p });

  // 20.2.2.21 Math.log10(x)


  _export(_export.S, 'Math', {
    log10: function log10(x) {
      return Math.log(x) * Math.LOG10E;
    }
  });

  // 20.2.2.22 Math.log2(x)


  _export(_export.S, 'Math', {
    log2: function log2(x) {
      return Math.log(x) / Math.LN2;
    }
  });

  // 20.2.2.28 Math.sign(x)


  _export(_export.S, 'Math', { sign: _mathSign });

  // 20.2.2.30 Math.sinh(x)


  var exp$1 = Math.exp;

  // V8 near Chromium 38 has a problem with very small numbers
  _export(_export.S + _export.F * _fails(function () {
    return !Math.sinh(-2e-17) != -2e-17;
  }), 'Math', {
    sinh: function sinh(x) {
      return Math.abs(x = +x) < 1
        ? (_mathExpm1(x) - _mathExpm1(-x)) / 2
        : (exp$1(x - 1) - exp$1(-x - 1)) * (Math.E / 2);
    }
  });

  // 20.2.2.33 Math.tanh(x)


  var exp$2 = Math.exp;

  _export(_export.S, 'Math', {
    tanh: function tanh(x) {
      var a = _mathExpm1(x = +x);
      var b = _mathExpm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
    }
  });

  // 20.2.2.34 Math.trunc(x)


  _export(_export.S, 'Math', {
    trunc: function trunc(it) {
      return (it > 0 ? Math.floor : Math.ceil)(it);
    }
  });

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
  	f: f$3
  };

  var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var space = '[' + _stringWs + ']';
  var non = '\u200b\u0085';
  var ltrim = RegExp('^' + space + space + '*');
  var rtrim = RegExp(space + space + '*$');

  var exporter = function (KEY, exec, ALIAS) {
    var exp = {};
    var FORCE = _fails(function () {
      return !!_stringWs[KEY]() || non[KEY]() != non;
    });
    var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
    if (ALIAS) exp[ALIAS] = fn;
    _export(_export.P + _export.F * FORCE, 'String', exp);
  };

  // 1 -> String#trimLeft
  // 2 -> String#trimRight
  // 3 -> String#trim
  var trim = exporter.trim = function (string, TYPE) {
    string = String(_defined(string));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };

  var _stringTrim = exporter;

  var gOPN = _objectGopn.f;
  var gOPD$1 = _objectGopd.f;
  var dP$3 = _objectDp.f;
  var $trim = _stringTrim.trim;
  var NUMBER$1 = 'Number';
  var $Number = _global[NUMBER$1];
  var Base = $Number;
  var proto$1 = $Number.prototype;
  // Opera ~12 has broken Object#toString
  var BROKEN_COF = _cof(_objectCreate(proto$1)) == NUMBER$1;
  var TRIM = 'trim' in String.prototype;

  // 7.1.3 ToNumber(argument)
  var toNumber = function (argument) {
    var it = _toPrimitive(argument, false);
    if (typeof it == 'string' && it.length > 2) {
      it = TRIM ? it.trim() : $trim(it, 3);
      var first = it.charCodeAt(0);
      var third, radix, maxCode;
      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
          case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
          default: return +it;
        }
        for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
          code = digits.charCodeAt(i);
          // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols
          if (code < 48 || code > maxCode) return NaN;
        } return parseInt(digits, radix);
      }
    } return +it;
  };

  if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
    $Number = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var that = this;
      return that instanceof $Number
        // check on 1..constructor(foo) case
        && (BROKEN_COF ? _fails(function () { proto$1.valueOf.call(that); }) : _cof(that) != NUMBER$1)
          ? _inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
    };
    for (var keys = _descriptors ? gOPN(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), j = 0, key; keys.length > j; j++) {
      if (_has(Base, key = keys[j]) && !_has($Number, key)) {
        dP$3($Number, key, gOPD$1(Base, key));
      }
    }
    $Number.prototype = proto$1;
    proto$1.constructor = $Number;
    _redefine(_global, NUMBER$1, $Number);
  }

  // 20.1.2.1 Number.EPSILON


  _export(_export.S, 'Number', { EPSILON: Math.pow(2, -52) });

  // 20.1.2.2 Number.isFinite(number)

  var _isFinite = _global.isFinite;

  _export(_export.S, 'Number', {
    isFinite: function isFinite(it) {
      return typeof it == 'number' && _isFinite(it);
    }
  });

  // 20.1.2.3 Number.isInteger(number)

  var floor$1 = Math.floor;
  var _isInteger = function isInteger(it) {
    return !_isObject(it) && isFinite(it) && floor$1(it) === it;
  };

  // 20.1.2.3 Number.isInteger(number)


  _export(_export.S, 'Number', { isInteger: _isInteger });

  // 20.1.2.4 Number.isNaN(number)


  _export(_export.S, 'Number', {
    isNaN: function isNaN(number) {
      // eslint-disable-next-line no-self-compare
      return number != number;
    }
  });

  // 20.1.2.5 Number.isSafeInteger(number)


  var abs$1 = Math.abs;

  _export(_export.S, 'Number', {
    isSafeInteger: function isSafeInteger(number) {
      return _isInteger(number) && abs$1(number) <= 0x1fffffffffffff;
    }
  });

  // 20.1.2.6 Number.MAX_SAFE_INTEGER


  _export(_export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });

  // 20.1.2.10 Number.MIN_SAFE_INTEGER


  _export(_export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });

  var $parseFloat = _global.parseFloat;
  var $trim$1 = _stringTrim.trim;

  var _parseFloat = 1 / $parseFloat(_stringWs + '-0') !== -Infinity ? function parseFloat(str) {
    var string = $trim$1(String(str), 3);
    var result = $parseFloat(string);
    return result === 0 && string.charAt(0) == '-' ? -0 : result;
  } : $parseFloat;

  // 20.1.2.12 Number.parseFloat(string)
  _export(_export.S + _export.F * (Number.parseFloat != _parseFloat), 'Number', { parseFloat: _parseFloat });

  var $parseInt = _global.parseInt;
  var $trim$2 = _stringTrim.trim;

  var hex = /^[-+]?0[xX]/;

  var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
    var string = $trim$2(String(str), 3);
    return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
  } : $parseInt;

  // 20.1.2.13 Number.parseInt(string, radix)
  _export(_export.S + _export.F * (Number.parseInt != _parseInt), 'Number', { parseInt: _parseInt });

  var f$4 = Object.getOwnPropertySymbols;

  var _objectGops = {
  	f: f$4
  };

  // 19.1.2.1 Object.assign(target, source, ...)





  var $assign = Object.assign;

  // should work with symbols and should have deterministic property order (V8 bug)
  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) { B[k] = k; });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = _toObject(target);
    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;
    while (aLen > index) {
      var S = _iobject(arguments[index++]);
      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    } return T;
  } : $assign;

  // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

  // Forced replacement prototype accessors methods
  var _objectForcedPam = _library || !_fails(function () {
    var K = Math.random();
    // In FF throws only define methods
    // eslint-disable-next-line no-undef, no-useless-call
    __defineSetter__.call(null, K, function () { /* empty */ });
    delete _global[K];
  });

  // B.2.2.2 Object.prototype.__defineGetter__(P, getter)
  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __defineGetter__: function __defineGetter__(P, getter) {
      _objectDp.f(_toObject(this), P, { get: _aFunction(getter), enumerable: true, configurable: true });
    }
  });

  // B.2.2.3 Object.prototype.__defineSetter__(P, setter)
  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __defineSetter__: function __defineSetter__(P, setter) {
      _objectDp.f(_toObject(this), P, { set: _aFunction(setter), enumerable: true, configurable: true });
    }
  });

  var isEnum = _objectPie.f;
  var _objectToArray = function (isEntries) {
    return function (it) {
      var O = _toIobject(it);
      var keys = _objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;
      while (length > i) if (isEnum.call(O, key = keys[i++])) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      } return result;
    };
  };

  // https://github.com/tc39/proposal-object-values-entries

  var $entries = _objectToArray(true);

  _export(_export.S, 'Object', {
    entries: function entries(it) {
      return $entries(it);
    }
  });

  // most Object methods by ES6 should accept primitives



  var _objectSap = function (KEY, exec) {
    var fn = (_core.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);
    _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
  };

  // 19.1.2.5 Object.freeze(O)

  var meta = _meta.onFreeze;

  _objectSap('freeze', function ($freeze) {
    return function freeze(it) {
      return $freeze && _isObject(it) ? $freeze(meta(it)) : it;
    };
  });

  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)

  var $getOwnPropertyDescriptor = _objectGopd.f;

  _objectSap('getOwnPropertyDescriptor', function () {
    return function getOwnPropertyDescriptor(it, key) {
      return $getOwnPropertyDescriptor(_toIobject(it), key);
    };
  });

  // all object keys, includes non-enumerable and symbols



  var Reflect$1 = _global.Reflect;
  var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
    var keys = _objectGopn.f(_anObject(it));
    var getSymbols = _objectGops.f;
    return getSymbols ? keys.concat(getSymbols(it)) : keys;
  };

  // https://github.com/tc39/proposal-object-getownpropertydescriptors






  _export(_export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = _toIobject(object);
      var getDesc = _objectGopd.f;
      var keys = _ownKeys(O);
      var result = {};
      var i = 0;
      var key, desc;
      while (keys.length > i) {
        desc = getDesc(O, key = keys[i++]);
        if (desc !== undefined) _createProperty(result, key, desc);
      }
      return result;
    }
  });

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

  var gOPN$1 = _objectGopn.f;
  var toString$1 = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN$1(it);
    } catch (e) {
      return windowNames.slice();
    }
  };

  var f$5 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
  };

  var _objectGopnExt = {
  	f: f$5
  };

  // 19.1.2.7 Object.getOwnPropertyNames(O)
  _objectSap('getOwnPropertyNames', function () {
    return _objectGopnExt.f;
  });

  // 19.1.2.9 Object.getPrototypeOf(O)



  _objectSap('getPrototypeOf', function () {
    return function getPrototypeOf(it) {
      return _objectGpo(_toObject(it));
    };
  });

  var getOwnPropertyDescriptor = _objectGopd.f;

  // B.2.2.4 Object.prototype.__lookupGetter__(P)
  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = _toObject(this);
      var K = _toPrimitive(P, true);
      var D;
      do {
        if (D = getOwnPropertyDescriptor(O, K)) return D.get;
      } while (O = _objectGpo(O));
    }
  });

  var getOwnPropertyDescriptor$1 = _objectGopd.f;

  // B.2.2.5 Object.prototype.__lookupSetter__(P)
  _descriptors && _export(_export.P + _objectForcedPam, 'Object', {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = _toObject(this);
      var K = _toPrimitive(P, true);
      var D;
      do {
        if (D = getOwnPropertyDescriptor$1(O, K)) return D.set;
      } while (O = _objectGpo(O));
    }
  });

  // 19.1.2.15 Object.preventExtensions(O)

  var meta$1 = _meta.onFreeze;

  _objectSap('preventExtensions', function ($preventExtensions) {
    return function preventExtensions(it) {
      return $preventExtensions && _isObject(it) ? $preventExtensions(meta$1(it)) : it;
    };
  });

  // 7.2.9 SameValue(x, y)
  var _sameValue = Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };

  // 19.1.3.10 Object.is(value1, value2)

  _export(_export.S, 'Object', { is: _sameValue });

  // 19.1.2.12 Object.isFrozen(O)


  _objectSap('isFrozen', function ($isFrozen) {
    return function isFrozen(it) {
      return _isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
    };
  });

  // 19.1.2.13 Object.isSealed(O)


  _objectSap('isSealed', function ($isSealed) {
    return function isSealed(it) {
      return _isObject(it) ? $isSealed ? $isSealed(it) : false : true;
    };
  });

  // 19.1.2.11 Object.isExtensible(O)


  _objectSap('isExtensible', function ($isExtensible) {
    return function isExtensible(it) {
      return _isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
    };
  });

  // 19.1.2.14 Object.keys(O)



  _objectSap('keys', function () {
    return function keys(it) {
      return _objectKeys(_toObject(it));
    };
  });

  // 19.1.2.17 Object.seal(O)

  var meta$2 = _meta.onFreeze;

  _objectSap('seal', function ($seal) {
    return function seal(it) {
      return $seal && _isObject(it) ? $seal(meta$2(it)) : it;
    };
  });

  // https://github.com/tc39/proposal-object-values-entries

  var $values = _objectToArray(false);

  _export(_export.S, 'Object', {
    values: function values(it) {
      return $values(it);
    }
  });

  // 7.3.20 SpeciesConstructor(O, defaultConstructor)


  var SPECIES$2 = _wks('species');
  var _speciesConstructor = function (O, D) {
    var C = _anObject(O).constructor;
    var S;
    return C === undefined || (S = _anObject(C)[SPECIES$2]) == undefined ? D : _aFunction(S);
  };

  // fast apply, http://jsperf.lnkit.com/fast-apply/5
  var _invoke = function (fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0: return un ? fn()
                        : fn.call(that);
      case 1: return un ? fn(args[0])
                        : fn.call(that, args[0]);
      case 2: return un ? fn(args[0], args[1])
                        : fn.call(that, args[0], args[1]);
      case 3: return un ? fn(args[0], args[1], args[2])
                        : fn.call(that, args[0], args[1], args[2]);
      case 4: return un ? fn(args[0], args[1], args[2], args[3])
                        : fn.call(that, args[0], args[1], args[2], args[3]);
    } return fn.apply(that, args);
  };

  var process$1 = _global.process;
  var setTask = _global.setImmediate;
  var clearTask = _global.clearImmediate;
  var MessageChannel = _global.MessageChannel;
  var Dispatch = _global.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;
  var run = function () {
    var id = +this;
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };
  var listener = function (event) {
    run.call(event.data);
  };
  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
      var args = [];
      var i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        _invoke(typeof fn == 'function' ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearTask = function clearImmediate(id) {
      delete queue[id];
    };
    // Node.js 0.8-
    if (_cof(process$1) == 'process') {
      defer = function (id) {
        process$1.nextTick(_ctx(run, id, 1));
      };
    // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(_ctx(run, id, 1));
      };
    // Browsers with MessageChannel, includes WebWorkers
    } else if (MessageChannel) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = _ctx(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
      defer = function (id) {
        _global.postMessage(id + '', '*');
      };
      _global.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in _domCreate('script')) {
      defer = function (id) {
        _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
          _html.removeChild(this);
          run.call(id);
        };
      };
    // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(_ctx(run, id, 1), 0);
      };
    }
  }
  var _task = {
    set: setTask,
    clear: clearTask
  };

  var macrotask = _task.set;
  var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
  var process$2 = _global.process;
  var Promise$1 = _global.Promise;
  var isNode = _cof(process$2) == 'process';

  var _microtask = function () {
    var head, last, notify;

    var flush = function () {
      var parent, fn;
      if (isNode && (parent = process$2.domain)) parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (e) {
          if (head) notify();
          else last = undefined;
          throw e;
        }
      } last = undefined;
      if (parent) parent.enter();
    };

    // Node.js
    if (isNode) {
      notify = function () {
        process$2.nextTick(flush);
      };
    // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
      var toggle = true;
      var node = document.createTextNode('');
      new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
      notify = function () {
        node.data = toggle = !toggle;
      };
    // environments with maybe non-completely correct, but existent Promise
    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      var promise = Promise$1.resolve(undefined);
      notify = function () {
        promise.then(flush);
      };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
    } else {
      notify = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(_global, flush);
      };
    }

    return function (fn) {
      var task = { fn: fn, next: undefined };
      if (last) last.next = task;
      if (!head) {
        head = task;
        notify();
      } last = task;
    };
  };

  // 25.4.1.5 NewPromiseCapability(C)


  function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = _aFunction(resolve);
    this.reject = _aFunction(reject);
  }

  var f$6 = function (C) {
    return new PromiseCapability(C);
  };

  var _newPromiseCapability = {
  	f: f$6
  };

  var _perform = function (exec) {
    try {
      return { e: false, v: exec() };
    } catch (e) {
      return { e: true, v: e };
    }
  };

  var navigator$1 = _global.navigator;

  var _userAgent = navigator$1 && navigator$1.userAgent || '';

  var _promiseResolve = function (C, x) {
    _anObject(C);
    if (_isObject(x) && x.constructor === C) return x;
    var promiseCapability = _newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var task = _task.set;
  var microtask = _microtask();




  var PROMISE = 'Promise';
  var TypeError$1 = _global.TypeError;
  var process$3 = _global.process;
  var versions = process$3 && process$3.versions;
  var v8 = versions && versions.v8 || '';
  var $Promise = _global[PROMISE];
  var isNode$1 = _classof(process$3) == 'process';
  var empty = function () { /* empty */ };
  var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
  var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

  var USE_NATIVE = !!function () {
    try {
      // correct subclassing with @@species support
      var promise = $Promise.resolve(1);
      var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
        exec(empty, empty);
      };
      // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      return (isNode$1 || typeof PromiseRejectionEvent == 'function')
        && promise.then(empty) instanceof FakePromise
        // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0
        && _userAgent.indexOf('Chrome/66') === -1;
    } catch (e) { /* empty */ }
  }();

  // helpers
  var isThenable = function (it) {
    var then;
    return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };
  var notify = function (promise, isReject) {
    if (promise._n) return;
    promise._n = true;
    var chain = promise._c;
    microtask(function () {
      var value = promise._v;
      var ok = promise._s == 1;
      var i = 0;
      var run = function (reaction) {
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;
        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2) onHandleUnhandled(promise);
              promise._h = 1;
            }
            if (handler === true) result = value;
            else {
              if (domain) domain.enter();
              result = handler(value); // may throw
              if (domain) {
                domain.exit();
                exited = true;
              }
            }
            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (e) {
          if (domain && !exited) domain.exit();
          reject(e);
        }
      };
      while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h) onUnhandled(promise);
    });
  };
  var onUnhandled = function (promise) {
    task.call(_global, function () {
      var value = promise._v;
      var unhandled = isUnhandled(promise);
      var result, handler, console;
      if (unhandled) {
        result = _perform(function () {
          if (isNode$1) {
            process$3.emit('unhandledRejection', value, promise);
          } else if (handler = _global.onunhandledrejection) {
            handler({ promise: promise, reason: value });
          } else if ((console = _global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
      } promise._a = undefined;
      if (unhandled && result.e) throw result.v;
    });
  };
  var isUnhandled = function (promise) {
    return promise._h !== 1 && (promise._a || promise._c).length === 0;
  };
  var onHandleUnhandled = function (promise) {
    task.call(_global, function () {
      var handler;
      if (isNode$1) {
        process$3.emit('rejectionHandled', promise);
      } else if (handler = _global.onrejectionhandled) {
        handler({ promise: promise, reason: promise._v });
      }
    });
  };
  var $reject = function (value) {
    var promise = this;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    promise._v = value;
    promise._s = 2;
    if (!promise._a) promise._a = promise._c.slice();
    notify(promise, true);
  };
  var $resolve = function (value) {
    var promise = this;
    var then;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");
      if (then = isThenable(value)) {
        microtask(function () {
          var wrapper = { _w: promise, _d: false }; // wrap
          try {
            then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({ _w: promise, _d: false }, e); // wrap
    }
  };

  // constructor polyfill
  if (!USE_NATIVE) {
    // 25.4.3.1 Promise(executor)
    $Promise = function Promise(executor) {
      _anInstance(this, $Promise, PROMISE, '_h');
      _aFunction(executor);
      Internal.call(this);
      try {
        executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    };
    // eslint-disable-next-line no-unused-vars
    Internal = function Promise(executor) {
      this._c = [];             // <- awaiting reactions
      this._a = undefined;      // <- checked in isUnhandled reactions
      this._s = 0;              // <- state
      this._d = false;          // <- done
      this._v = undefined;      // <- value
      this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
      this._n = false;          // <- notify
    };
    Internal.prototype = _redefineAll($Promise.prototype, {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode$1 ? process$3.domain : undefined;
        this._c.push(reaction);
        if (this._a) this._a.push(reaction);
        if (this._s) notify(this, false);
        return reaction.promise;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      this.promise = promise;
      this.resolve = _ctx($resolve, promise, 1);
      this.reject = _ctx($reject, promise, 1);
    };
    _newPromiseCapability.f = newPromiseCapability = function (C) {
      return C === $Promise || C === Wrapper
        ? new OwnPromiseCapability(C)
        : newGenericPromiseCapability(C);
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
  _setToStringTag($Promise, PROMISE);
  _setSpecies(PROMISE);
  Wrapper = _core[PROMISE];

  // statics
  _export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
    // 25.4.4.5 Promise.reject(r)
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      var $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }
  });
  _export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
    // 25.4.4.6 Promise.resolve(x)
    resolve: function resolve(x) {
      return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
    }
  });
  _export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    // 25.4.4.1 Promise.all(iterable)
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = _perform(function () {
        var values = [];
        var index = 0;
        var remaining = 1;
        _forOf(iterable, false, function (promise) {
          var $index = index++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.e) reject(result.v);
      return capability.promise;
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;
      var result = _perform(function () {
        _forOf(iterable, false, function (promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });
      if (result.e) reject(result.v);
      return capability.promise;
    }
  });

  _export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
    var C = _speciesConstructor(this, _core.Promise || _global.Promise);
    var isFunction = typeof onFinally == 'function';
    return this.then(
      isFunction ? function (x) {
        return _promiseResolve(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return _promiseResolve(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  } });

  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)



  var rApply = (_global.Reflect || {}).apply;
  var fApply = Function.apply;
  // MS Edge argumentsList argument is optional
  _export(_export.S + _export.F * !_fails(function () {
    rApply(function () { /* empty */ });
  }), 'Reflect', {
    apply: function apply(target, thisArgument, argumentsList) {
      var T = _aFunction(target);
      var L = _anObject(argumentsList);
      return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
    }
  });

  var arraySlice = [].slice;
  var factories = {};

  var construct = function (F, len, args) {
    if (!(len in factories)) {
      for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
      // eslint-disable-next-line no-new-func
      factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
    } return factories[len](F, args);
  };

  var _bind = Function.bind || function bind(that /* , ...args */) {
    var fn = _aFunction(this);
    var partArgs = arraySlice.call(arguments, 1);
    var bound = function (/* args... */) {
      var args = partArgs.concat(arraySlice.call(arguments));
      return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
    };
    if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
    return bound;
  };

  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])







  var rConstruct = (_global.Reflect || {}).construct;

  // MS Edge supports only 2 arguments and argumentsList argument is optional
  // FF Nightly sets third argument as `new.target`, but does not create `this` from it
  var NEW_TARGET_BUG = _fails(function () {
    function F() { /* empty */ }
    return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
  });
  var ARGS_BUG = !_fails(function () {
    rConstruct(function () { /* empty */ });
  });

  _export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
    construct: function construct(Target, args /* , newTarget */) {
      _aFunction(Target);
      _anObject(args);
      var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
      if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
      if (Target == newTarget) {
        // w/o altered newTarget, optimization for 0-4 arguments
        switch (args.length) {
          case 0: return new Target();
          case 1: return new Target(args[0]);
          case 2: return new Target(args[0], args[1]);
          case 3: return new Target(args[0], args[1], args[2]);
          case 4: return new Target(args[0], args[1], args[2], args[3]);
        }
        // w/o altered newTarget, lot of arguments case
        var $args = [null];
        $args.push.apply($args, args);
        return new (_bind.apply(Target, $args))();
      }
      // with altered newTarget, not support built-in constructors
      var proto = newTarget.prototype;
      var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);
      var result = Function.apply.call(Target, instance, args);
      return _isObject(result) ? result : instance;
    }
  });

  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)





  // MS Edge has broken Reflect.defineProperty - throwing instead of returning false
  _export(_export.S + _export.F * _fails(function () {
    // eslint-disable-next-line no-undef
    Reflect.defineProperty(_objectDp.f({}, 1, { value: 1 }), 1, { value: 2 });
  }), 'Reflect', {
    defineProperty: function defineProperty(target, propertyKey, attributes) {
      _anObject(target);
      propertyKey = _toPrimitive(propertyKey, true);
      _anObject(attributes);
      try {
        _objectDp.f(target, propertyKey, attributes);
        return true;
      } catch (e) {
        return false;
      }
    }
  });

  // 26.1.4 Reflect.deleteProperty(target, propertyKey)

  var gOPD$2 = _objectGopd.f;


  _export(_export.S, 'Reflect', {
    deleteProperty: function deleteProperty(target, propertyKey) {
      var desc = gOPD$2(_anObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    }
  });

  // 26.1.6 Reflect.get(target, propertyKey [, receiver])







  function get(target, propertyKey /* , receiver */) {
    var receiver = arguments.length < 3 ? target : arguments[2];
    var desc, proto;
    if (_anObject(target) === receiver) return target[propertyKey];
    if (desc = _objectGopd.f(target, propertyKey)) return _has(desc, 'value')
      ? desc.value
      : desc.get !== undefined
        ? desc.get.call(receiver)
        : undefined;
    if (_isObject(proto = _objectGpo(target))) return get(proto, propertyKey, receiver);
  }

  _export(_export.S, 'Reflect', { get: get });

  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)




  _export(_export.S, 'Reflect', {
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
      return _objectGopd.f(_anObject(target), propertyKey);
    }
  });

  // 26.1.8 Reflect.getPrototypeOf(target)




  _export(_export.S, 'Reflect', {
    getPrototypeOf: function getPrototypeOf(target) {
      return _objectGpo(_anObject(target));
    }
  });

  // 26.1.9 Reflect.has(target, propertyKey)


  _export(_export.S, 'Reflect', {
    has: function has(target, propertyKey) {
      return propertyKey in target;
    }
  });

  // 26.1.10 Reflect.isExtensible(target)


  var $isExtensible = Object.isExtensible;

  _export(_export.S, 'Reflect', {
    isExtensible: function isExtensible(target) {
      _anObject(target);
      return $isExtensible ? $isExtensible(target) : true;
    }
  });

  // 26.1.11 Reflect.ownKeys(target)


  _export(_export.S, 'Reflect', { ownKeys: _ownKeys });

  // 26.1.12 Reflect.preventExtensions(target)


  var $preventExtensions = Object.preventExtensions;

  _export(_export.S, 'Reflect', {
    preventExtensions: function preventExtensions(target) {
      _anObject(target);
      try {
        if ($preventExtensions) $preventExtensions(target);
        return true;
      } catch (e) {
        return false;
      }
    }
  });

  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])









  function set(target, propertyKey, V /* , receiver */) {
    var receiver = arguments.length < 4 ? target : arguments[3];
    var ownDesc = _objectGopd.f(_anObject(target), propertyKey);
    var existingDescriptor, proto;
    if (!ownDesc) {
      if (_isObject(proto = _objectGpo(target))) {
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = _propertyDesc(0);
    }
    if (_has(ownDesc, 'value')) {
      if (ownDesc.writable === false || !_isObject(receiver)) return false;
      if (existingDescriptor = _objectGopd.f(receiver, propertyKey)) {
        if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
        existingDescriptor.value = V;
        _objectDp.f(receiver, propertyKey, existingDescriptor);
      } else _objectDp.f(receiver, propertyKey, _propertyDesc(0, V));
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }

  _export(_export.S, 'Reflect', { set: set });

  // 26.1.14 Reflect.setPrototypeOf(target, proto)



  if (_setProto) _export(_export.S, 'Reflect', {
    setPrototypeOf: function setPrototypeOf(target, proto) {
      _setProto.check(target, proto);
      try {
        _setProto.set(target, proto);
        return true;
      } catch (e) {
        return false;
      }
    }
  });

  // 7.2.8 IsRegExp(argument)


  var MATCH = _wks('match');
  var _isRegexp = function (it) {
    var isRegExp;
    return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
  };

  // 21.2.5.3 get RegExp.prototype.flags

  var _flags = function () {
    var that = _anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var dP$4 = _objectDp.f;
  var gOPN$2 = _objectGopn.f;


  var $RegExp = _global.RegExp;
  var Base$1 = $RegExp;
  var proto$2 = $RegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g;
  // "new" creates a new object, old webkit buggy here
  var CORRECT_NEW = new $RegExp(re1) !== re1;

  if (_descriptors && (!CORRECT_NEW || _fails(function () {
    re2[_wks('match')] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
  }))) {
    $RegExp = function RegExp(p, f) {
      var tiRE = this instanceof $RegExp;
      var piRE = _isRegexp(p);
      var fiU = f === undefined;
      return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
        : _inheritIfRequired(CORRECT_NEW
          ? new Base$1(piRE && !fiU ? p.source : p, f)
          : Base$1((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f)
        , tiRE ? this : proto$2, $RegExp);
    };
    var proxy = function (key) {
      key in $RegExp || dP$4($RegExp, key, {
        configurable: true,
        get: function () { return Base$1[key]; },
        set: function (it) { Base$1[key] = it; }
      });
    };
    for (var keys$1 = gOPN$2(Base$1), i = 0; keys$1.length > i;) proxy(keys$1[i++]);
    proto$2.constructor = $RegExp;
    $RegExp.prototype = proto$2;
    _redefine(_global, 'RegExp', $RegExp);
  }

  _setSpecies('RegExp');

  // 21.2.5.3 get RegExp.prototype.flags()
  if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: _flags
  });

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var at = _stringAt(true);

   // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex
  var _advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? at(S, index).length : 1);
  };

  var builtinExec = RegExp.prototype.exec;

   // `RegExpExec` abstract operation
  // https://tc39.github.io/ecma262/#sec-regexpexec
  var _regexpExecAbstract = function (R, S) {
    var exec = R.exec;
    if (typeof exec === 'function') {
      var result = exec.call(R, S);
      if (typeof result !== 'object') {
        throw new TypeError('RegExp exec method returned something other than an Object or null');
      }
      return result;
    }
    if (_classof(R) !== 'RegExp') {
      throw new TypeError('RegExp#exec called on incompatible receiver');
    }
    return builtinExec.call(R, S);
  };

  var nativeExec = RegExp.prototype.exec;
  // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.
  var nativeReplace = String.prototype.replace;

  var patchedExec = nativeExec;

  var LAST_INDEX = 'lastIndex';

  var UPDATES_LAST_INDEX_WRONG = (function () {
    var re1 = /a/,
        re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
  })();

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

      match = nativeExec.call(re, str);

      if (UPDATES_LAST_INDEX_WRONG && match) {
        re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        // eslint-disable-next-line no-loop-func
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var _regexpExec = patchedExec;

  _export({
    target: 'RegExp',
    proto: true,
    forced: _regexpExec !== /./.exec
  }, {
    exec: _regexpExec
  });

  var SPECIES$3 = _wks('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;
    re.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };
    return ''.replace(re, '$<a>') !== '7';
  });

  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length === 2 && result[0] === 'a' && result[1] === 'b';
  })();

  var _fixReWks = function (KEY, length, exec) {
    var SYMBOL = _wks(KEY);

    var DELEGATES_TO_SYMBOL = !_fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;
      re.exec = function () { execCalled = true; return null; };
      if (KEY === 'split') {
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};
        re.constructor[SPECIES$3] = function () { return re; };
      }
      re[SYMBOL]('');
      return !execCalled;
    }) : undefined;

    if (
      !DELEGATES_TO_SYMBOL ||
      !DELEGATES_TO_EXEC ||
      (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
      (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
    ) {
      var nativeRegExpMethod = /./[SYMBOL];
      var fns = exec(
        _defined,
        SYMBOL,
        ''[KEY],
        function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
          if (regexp.exec === _regexpExec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              // The native String method already delegates to @@method (this
              // polyfilled function), leasing to infinite recursion.
              // We avoid it by directly calling the native @@method method.
              return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
            }
            return { done: true, value: nativeMethod.call(str, regexp, arg2) };
          }
          return { done: false };
        }
      );
      var strfn = fns[0];
      var rxfn = fns[1];

      _redefine(String.prototype, KEY, strfn);
      _hide(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return rxfn.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return rxfn.call(string, this); }
      );
    }
  };

  // @@match logic
  _fixReWks('match', 1, function (defined, MATCH, $match, maybeCallNative) {
    return [
      // `String.prototype.match` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.match
      function match(regexp) {
        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[MATCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
      },
      // `RegExp.prototype[@@match]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
      function (regexp) {
        var res = maybeCallNative($match, regexp, this);
        if (res.done) return res.value;
        var rx = _anObject(regexp);
        var S = String(this);
        if (!rx.global) return _regexpExecAbstract(rx, S);
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        var result;
        while ((result = _regexpExecAbstract(rx, S)) !== null) {
          var matchStr = String(result[0]);
          A[n] = matchStr;
          if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
          n++;
        }
        return n === 0 ? null : A;
      }
    ];
  });

  var max$1 = Math.max;
  var min$2 = Math.min;
  var floor$2 = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  };

  // @@replace logic
  _fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
    return [
      // `String.prototype.replace` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = defined(this);
        var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
        return fn !== undefined
          ? fn.call(searchValue, O, replaceValue)
          : $replace.call(String(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
      function (regexp, replaceValue) {
        var res = maybeCallNative($replace, regexp, this, replaceValue);
        if (res.done) return res.value;

        var rx = _anObject(regexp);
        var S = String(this);
        var functionalReplace = typeof replaceValue === 'function';
        if (!functionalReplace) replaceValue = String(replaceValue);
        var global = rx.global;
        if (global) {
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
        }
        var results = [];
        while (true) {
          var result = _regexpExecAbstract(rx, S);
          if (result === null) break;
          results.push(result);
          if (!global) break;
          var matchStr = String(result[0]);
          if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
        }
        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];
          var matched = String(result[0]);
          var position = max$1(min$2(_toInteger(result.index), S.length), 0);
          var captures = [];
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = [matched].concat(captures, position, S);
            if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
            var replacement = String(replaceValue.apply(undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + S.slice(nextSourcePosition);
      }
    ];

      // https://tc39.github.io/ecma262/#sec-getsubstitution
    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== undefined) {
        namedCaptures = _toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return $replace.call(replacement, symbols, function (match, ch) {
        var capture;
        switch (ch.charAt(0)) {
          case '$': return '$';
          case '&': return matched;
          case '`': return str.slice(0, position);
          case "'": return str.slice(tailPos);
          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;
          default: // \d\d?
            var n = +ch;
            if (n === 0) return match;
            if (n > m) {
              var f = floor$2(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === undefined ? '' : capture;
      });
    }
  });

  var $min = Math.min;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX$1 = 'lastIndex';

  // eslint-disable-next-line no-empty
  var SUPPORTS_Y = !!(function () { try { return new RegExp('x', 'y'); } catch (e) {} })();

  // @@split logic
  _fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
      'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
      'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
      '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
      '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
      ''[$SPLIT](/.?/)[LENGTH]
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!_isRegexp(separator)) return $split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = _regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy[LAST_INDEX$1];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
      };
    } else {
      internalSplit = $split;
    }

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = defined(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
        if (res.done) return res.value;

        var rx = _anObject(regexp);
        var S = String(this);
        var C = _speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                      (rx.multiline ? 'm' : '') +
                      (rx.unicode ? 'u' : '') +
                      (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? 0xffffffff : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = _advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  });

  // @@search logic
  _fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
    return [
      // `String.prototype.search` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.search
      function search(regexp) {
        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[SEARCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
      },
      // `RegExp.prototype[@@search]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
      function (regexp) {
        var res = maybeCallNative($search, regexp, this);
        if (res.done) return res.value;
        var rx = _anObject(regexp);
        var S = String(this);
        var previousLastIndex = rx.lastIndex;
        if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
        var result = _regexpExecAbstract(rx, S);
        if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
        return result === null ? -1 : result.index;
      }
    ];
  });

  var TO_STRING = 'toString';
  var $toString = /./[TO_STRING];

  var define = function (fn) {
    _redefine(RegExp.prototype, TO_STRING, fn, true);
  };

  // 21.2.5.14 RegExp.prototype.toString()
  if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
    define(function toString() {
      var R = _anObject(this);
      return '/'.concat(R.source, '/',
        'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
    });
  // FF44- RegExp#toString has a wrong name
  } else if ($toString.name != TO_STRING) {
    define(function toString() {
      return $toString.call(this);
    });
  }

  var SET = 'Set';

  // 23.2 Set Objects
  var es6_set = _collection(SET, function (get) {
    return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
  }, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function add(value) {
      return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
    }
  }, _collectionStrong);

  var f$7 = _wks;

  var _wksExt = {
  	f: f$7
  };

  var defineProperty = _objectDp.f;
  var _wksDefine = function (name) {
    var $Symbol = _core.Symbol || (_core.Symbol = _global.Symbol || {});
    if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
  };

  // all enumerable object keys, includes symbols



  var _enumKeys = function (it) {
    var result = _objectKeys(it);
    var getSymbols = _objectGops.f;
    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = _objectPie.f;
      var i = 0;
      var key;
      while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
    } return result;
  };

  // ECMAScript 6 symbols shim





  var META = _meta.KEY;



















  var gOPD$3 = _objectGopd.f;
  var dP$5 = _objectDp.f;
  var gOPN$3 = _objectGopnExt.f;
  var $Symbol = _global.Symbol;
  var $JSON = _global.JSON;
  var _stringify = $JSON && $JSON.stringify;
  var PROTOTYPE$2 = 'prototype';
  var HIDDEN = _wks('_hidden');
  var TO_PRIMITIVE$1 = _wks('toPrimitive');
  var isEnum$1 = {}.propertyIsEnumerable;
  var SymbolRegistry = _shared('symbol-registry');
  var AllSymbols = _shared('symbols');
  var OPSymbols = _shared('op-symbols');
  var ObjectProto$1 = Object[PROTOTYPE$2];
  var USE_NATIVE$1 = typeof $Symbol == 'function';
  var QObject = _global.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDesc = _descriptors && _fails(function () {
    return _objectCreate(dP$5({}, 'a', {
      get: function () { return dP$5(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD$3(ObjectProto$1, key);
    if (protoDesc) delete ObjectProto$1[key];
    dP$5(it, key, D);
    if (protoDesc && it !== ObjectProto$1) dP$5(ObjectProto$1, key, protoDesc);
  } : dP$5;

  var wrap = function (tag) {
    var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
    sym._k = tag;
    return sym;
  };

  var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return it instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
    _anObject(it);
    key = _toPrimitive(key, true);
    _anObject(D);
    if (_has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!_has(it, HIDDEN)) dP$5(it, HIDDEN, _propertyDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
        D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
      } return setSymbolDesc(it, key, D);
    } return dP$5(it, key, D);
  };
  var $defineProperties = function defineProperties(it, P) {
    _anObject(it);
    var keys = _enumKeys(P = _toIobject(P));
    var i = 0;
    var l = keys.length;
    var key;
    while (l > i) $defineProperty(it, key = keys[i++], P[key]);
    return it;
  };
  var $create = function create(it, P) {
    return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
  };
  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum$1.call(this, key = _toPrimitive(key, true));
    if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
    return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };
  var $getOwnPropertyDescriptor$1 = function getOwnPropertyDescriptor(it, key) {
    it = _toIobject(it);
    key = _toPrimitive(key, true);
    if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
    var D = gOPD$3(it, key);
    if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
    return D;
  };
  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN$3(_toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
    } return result;
  };
  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto$1;
    var names = gOPN$3(IS_OP ? OPSymbols : _toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
    } return result;
  };

  // 19.4.1.1 Symbol([description])
  if (!USE_NATIVE$1) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
      var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
      var $set = function (value) {
        if (this === ObjectProto$1) $set.call(OPSymbols, value);
        if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, _propertyDesc(1, value));
      };
      if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
      return wrap(tag);
    };
    _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
      return this._k;
    });

    _objectGopd.f = $getOwnPropertyDescriptor$1;
    _objectDp.f = $defineProperty;
    _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
    _objectPie.f = $propertyIsEnumerable;
    _objectGops.f = $getOwnPropertySymbols;

    if (_descriptors && !_library) {
      _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    _wksExt.f = function (name) {
      return wrap(_wks(name));
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Symbol: $Symbol });

  for (var es6Symbols = (
    // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), j$1 = 0; es6Symbols.length > j$1;)_wks(es6Symbols[j$1++]);

  for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

  _export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return _has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = $Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
      for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
    },
    useSetter: function () { setter = true; },
    useSimple: function () { setter = false; }
  });

  _export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor$1,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // 24.3.2 JSON.stringify(value [, replacer [, space]])
  $JSON && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
    var S = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols
    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;
      while (arguments.length > i) args.push(arguments[i++]);
      $replacer = replacer = args[1];
      if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!_isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON, args);
    }
  });

  // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
  $Symbol[PROTOTYPE$2][TO_PRIMITIVE$1] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE$1, $Symbol[PROTOTYPE$2].valueOf);
  // 19.4.3.5 Symbol.prototype[@@toStringTag]
  _setToStringTag($Symbol, 'Symbol');
  // 20.2.1.9 Math[@@toStringTag]
  _setToStringTag(Math, 'Math', true);
  // 24.3.3 JSON[@@toStringTag]
  _setToStringTag(_global.JSON, 'JSON', true);

  _wksDefine('asyncIterator');

  var quot = /"/g;
  // B.2.3.2.1 CreateHTML(string, tag, attribute, value)
  var createHTML = function (string, tag, attribute, value) {
    var S = String(_defined(string));
    var p1 = '<' + tag;
    if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
    return p1 + '>' + S + '</' + tag + '>';
  };
  var _stringHtml = function (NAME, exec) {
    var O = {};
    O[NAME] = exec(createHTML);
    _export(_export.P + _export.F * _fails(function () {
      var test = ''[NAME]('"');
      return test !== test.toLowerCase() || test.split('"').length > 3;
    }), 'String', O);
  };

  // B.2.3.2 String.prototype.anchor(name)
  _stringHtml('anchor', function (createHTML) {
    return function anchor(name) {
      return createHTML(this, 'a', 'name', name);
    };
  });

  // B.2.3.3 String.prototype.big()
  _stringHtml('big', function (createHTML) {
    return function big() {
      return createHTML(this, 'big', '', '');
    };
  });

  // B.2.3.4 String.prototype.blink()
  _stringHtml('blink', function (createHTML) {
    return function blink() {
      return createHTML(this, 'blink', '', '');
    };
  });

  // B.2.3.5 String.prototype.bold()
  _stringHtml('bold', function (createHTML) {
    return function bold() {
      return createHTML(this, 'b', '', '');
    };
  });

  var $at = _stringAt(false);
  _export(_export.P, 'String', {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: function codePointAt(pos) {
      return $at(this, pos);
    }
  });

  // helper for String#{startsWith, endsWith, includes}



  var _stringContext = function (that, searchString, NAME) {
    if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
    return String(_defined(that));
  };

  var MATCH$1 = _wks('match');
  var _failsIsRegexp = function (KEY) {
    var re = /./;
    try {
      '/./'[KEY](re);
    } catch (e) {
      try {
        re[MATCH$1] = false;
        return !'/./'[KEY](re);
      } catch (f) { /* empty */ }
    } return true;
  };

  var ENDS_WITH = 'endsWith';
  var $endsWith = ''[ENDS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(ENDS_WITH), 'String', {
    endsWith: function endsWith(searchString /* , endPosition = @length */) {
      var that = _stringContext(this, searchString, ENDS_WITH);
      var endPosition = arguments.length > 1 ? arguments[1] : undefined;
      var len = _toLength(that.length);
      var end = endPosition === undefined ? len : Math.min(_toLength(endPosition), len);
      var search = String(searchString);
      return $endsWith
        ? $endsWith.call(that, search, end)
        : that.slice(end - search.length, end) === search;
    }
  });

  // B.2.3.6 String.prototype.fixed()
  _stringHtml('fixed', function (createHTML) {
    return function fixed() {
      return createHTML(this, 'tt', '', '');
    };
  });

  // B.2.3.7 String.prototype.fontcolor(color)
  _stringHtml('fontcolor', function (createHTML) {
    return function fontcolor(color) {
      return createHTML(this, 'font', 'color', color);
    };
  });

  // B.2.3.8 String.prototype.fontsize(size)
  _stringHtml('fontsize', function (createHTML) {
    return function fontsize(size) {
      return createHTML(this, 'font', 'size', size);
    };
  });

  var fromCharCode = String.fromCharCode;
  var $fromCodePoint = String.fromCodePoint;

  // length should be 1, old FF problem
  _export(_export.S + _export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
      var res = [];
      var aLen = arguments.length;
      var i = 0;
      var code;
      while (aLen > i) {
        code = +arguments[i++];
        if (_toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    }
  });

  var INCLUDES = 'includes';

  _export(_export.P + _export.F * _failsIsRegexp(INCLUDES), 'String', {
    includes: function includes(searchString /* , position = 0 */) {
      return !!~_stringContext(this, searchString, INCLUDES)
        .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // B.2.3.9 String.prototype.italics()
  _stringHtml('italics', function (createHTML) {
    return function italics() {
      return createHTML(this, 'i', '', '');
    };
  });

  var $at$1 = _stringAt(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at$1(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  // B.2.3.10 String.prototype.link(url)
  _stringHtml('link', function (createHTML) {
    return function link(url) {
      return createHTML(this, 'a', 'href', url);
    };
  });

  var _stringRepeat = function repeat(count) {
    var str = String(_defined(this));
    var res = '';
    var n = _toInteger(count);
    if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
    for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
    return res;
  };

  // https://github.com/tc39/proposal-string-pad-start-end




  var _stringPad = function (that, maxLength, fillString, left) {
    var S = String(_defined(that));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);
    var intMaxLength = _toLength(maxLength);
    if (intMaxLength <= stringLength || fillStr == '') return S;
    var fillLen = intMaxLength - stringLength;
    var stringFiller = _stringRepeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
    return left ? stringFiller + S : S + stringFiller;
  };

  // https://github.com/tc39/proposal-string-pad-start-end




  // https://github.com/zloirock/core-js/issues/280
  _export(_export.P + _export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(_userAgent), 'String', {
    padStart: function padStart(maxLength /* , fillString = ' ' */) {
      return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
    }
  });

  // https://github.com/tc39/proposal-string-pad-start-end




  // https://github.com/zloirock/core-js/issues/280
  _export(_export.P + _export.F * /Version\/10\.\d+(\.\d+)? Safari\//.test(_userAgent), 'String', {
    padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
      return _stringPad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
    }
  });

  _export(_export.S, 'String', {
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function raw(callSite) {
      var tpl = _toIobject(callSite.raw);
      var len = _toLength(tpl.length);
      var aLen = arguments.length;
      var res = [];
      var i = 0;
      while (len > i) {
        res.push(String(tpl[i++]));
        if (i < aLen) res.push(String(arguments[i]));
      } return res.join('');
    }
  });

  _export(_export.P, 'String', {
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: _stringRepeat
  });

  // B.2.3.11 String.prototype.small()
  _stringHtml('small', function (createHTML) {
    return function small() {
      return createHTML(this, 'small', '', '');
    };
  });

  var STARTS_WITH = 'startsWith';
  var $startsWith = ''[STARTS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
    startsWith: function startsWith(searchString /* , position = 0 */) {
      var that = _stringContext(this, searchString, STARTS_WITH);
      var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
      var search = String(searchString);
      return $startsWith
        ? $startsWith.call(that, search, index)
        : that.slice(index, index + search.length) === search;
    }
  });

  // B.2.3.12 String.prototype.strike()
  _stringHtml('strike', function (createHTML) {
    return function strike() {
      return createHTML(this, 'strike', '', '');
    };
  });

  // B.2.3.13 String.prototype.sub()
  _stringHtml('sub', function (createHTML) {
    return function sub() {
      return createHTML(this, 'sub', '', '');
    };
  });

  // B.2.3.14 String.prototype.sup()
  _stringHtml('sup', function (createHTML) {
    return function sup() {
      return createHTML(this, 'sup', '', '');
    };
  });

  var TYPED = _uid('typed_array');
  var VIEW = _uid('view');
  var ABV = !!(_global.ArrayBuffer && _global.DataView);
  var CONSTR = ABV;
  var i$1 = 0;
  var l = 9;
  var Typed;

  var TypedArrayConstructors = (
    'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
  ).split(',');

  while (i$1 < l) {
    if (Typed = _global[TypedArrayConstructors[i$1++]]) {
      _hide(Typed.prototype, TYPED, true);
      _hide(Typed.prototype, VIEW, true);
    } else CONSTR = false;
  }

  var _typed = {
    ABV: ABV,
    CONSTR: CONSTR,
    TYPED: TYPED,
    VIEW: VIEW
  };

  // https://tc39.github.io/ecma262/#sec-toindex


  var _toIndex = function (it) {
    if (it === undefined) return 0;
    var number = _toInteger(it);
    var length = _toLength(number);
    if (number !== length) throw RangeError('Wrong length!');
    return length;
  };

  var _typedBuffer = createCommonjsModule(function (module, exports) {











  var gOPN = _objectGopn.f;
  var dP = _objectDp.f;


  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length!';
  var WRONG_INDEX = 'Wrong index!';
  var $ArrayBuffer = _global[ARRAY_BUFFER];
  var $DataView = _global[DATA_VIEW];
  var Math = _global.Math;
  var RangeError = _global.RangeError;
  // eslint-disable-next-line no-shadow-restricted-names
  var Infinity = _global.Infinity;
  var BaseBuffer = $ArrayBuffer;
  var abs = Math.abs;
  var pow = Math.pow;
  var floor = Math.floor;
  var log = Math.log;
  var LN2 = Math.LN2;
  var BUFFER = 'buffer';
  var BYTE_LENGTH = 'byteLength';
  var BYTE_OFFSET = 'byteOffset';
  var $BUFFER = _descriptors ? '_b' : BUFFER;
  var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
  var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

  // IEEE754 conversions based on https://github.com/feross/ieee754
  function packIEEE754(value, mLen, nBytes) {
    var buffer = new Array(nBytes);
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var i = 0;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    var e, m, c;
    value = abs(value);
    // eslint-disable-next-line no-self-compare
    if (value != value || value === Infinity) {
      // eslint-disable-next-line no-self-compare
      m = value != value ? 1 : 0;
      e = eMax;
    } else {
      e = floor(log(value) / LN2);
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
    buffer[--i] |= s * 128;
    return buffer;
  }
  function unpackIEEE754(buffer, mLen, nBytes) {
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = eLen - 7;
    var i = nBytes - 1;
    var s = buffer[i--];
    var e = s & 127;
    var m;
    s >>= 7;
    for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    } return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function unpackI32(bytes) {
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }
  function packI8(it) {
    return [it & 0xff];
  }
  function packI16(it) {
    return [it & 0xff, it >> 8 & 0xff];
  }
  function packI32(it) {
    return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
  }
  function packF64(it) {
    return packIEEE754(it, 52, 8);
  }
  function packF32(it) {
    return packIEEE754(it, 23, 4);
  }

  function addGetter(C, key, internal) {
    dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
  }

  function get(view, bytes, index, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = store.slice(start, start + bytes);
    return isLittleEndian ? pack : pack.reverse();
  }
  function set(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = conversion(+value);
    for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
  }

  if (!_typed.ABV) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = _toIndex(length);
      this._b = _arrayFill.call(new Array(byteLength), 0);
      this[$LENGTH] = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      _anInstance(this, $DataView, DATA_VIEW);
      _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = buffer[$LENGTH];
      var offset = _toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
      byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
      this[$BUFFER] = buffer;
      this[$OFFSET] = offset;
      this[$LENGTH] = byteLength;
    };

    if (_descriptors) {
      addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
      addGetter($DataView, BUFFER, '_b');
      addGetter($DataView, BYTE_LENGTH, '_l');
      addGetter($DataView, BYTE_OFFSET, '_o');
    }

    _redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1]));
      },
      getUint32: function getUint32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
      },
      getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
      },
      setInt8: function setInt8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
        set(this, 8, byteOffset, packF64, value, arguments[2]);
      }
    });
  } else {
    if (!_fails(function () {
      $ArrayBuffer(1);
    }) || !_fails(function () {
      new $ArrayBuffer(-1); // eslint-disable-line no-new
    }) || _fails(function () {
      new $ArrayBuffer(); // eslint-disable-line no-new
      new $ArrayBuffer(1.5); // eslint-disable-line no-new
      new $ArrayBuffer(NaN); // eslint-disable-line no-new
      return $ArrayBuffer.name != ARRAY_BUFFER;
    })) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer);
        return new BaseBuffer(_toIndex(length));
      };
      var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
      for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
        if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
      }
      ArrayBufferProto.constructor = $ArrayBuffer;
    }
    // iOS Safari 7.x bug
    var view = new $DataView(new $ArrayBuffer(2));
    var $setInt8 = $DataView[PROTOTYPE].setInt8;
    view.setInt8(0, 2147483648);
    view.setInt8(1, 2147483649);
    if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
      setInt8: function setInt8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      }
    }, true);
  }
  _setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  _setToStringTag($DataView, DATA_VIEW);
  _hide($DataView[PROTOTYPE], _typed.VIEW, true);
  exports[ARRAY_BUFFER] = $ArrayBuffer;
  exports[DATA_VIEW] = $DataView;
  });

  var ArrayBuffer = _global.ArrayBuffer;

  var $ArrayBuffer = _typedBuffer.ArrayBuffer;
  var $DataView = _typedBuffer.DataView;
  var $isView = _typed.ABV && ArrayBuffer.isView;
  var $slice = $ArrayBuffer.prototype.slice;
  var VIEW$1 = _typed.VIEW;
  var ARRAY_BUFFER = 'ArrayBuffer';

  _export(_export.G + _export.W + _export.F * (ArrayBuffer !== $ArrayBuffer), { ArrayBuffer: $ArrayBuffer });

  _export(_export.S + _export.F * !_typed.CONSTR, ARRAY_BUFFER, {
    // 24.1.3.1 ArrayBuffer.isView(arg)
    isView: function isView(it) {
      return $isView && $isView(it) || _isObject(it) && VIEW$1 in it;
    }
  });

  _export(_export.P + _export.U + _export.F * _fails(function () {
    return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
  }), ARRAY_BUFFER, {
    // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
    slice: function slice(start, end) {
      if ($slice !== undefined && end === undefined) return $slice.call(_anObject(this), start); // FF fix
      var len = _anObject(this).byteLength;
      var first = _toAbsoluteIndex(start, len);
      var fin = _toAbsoluteIndex(end === undefined ? len : end, len);
      var result = new (_speciesConstructor(this, $ArrayBuffer))(_toLength(fin - first));
      var viewS = new $DataView(this);
      var viewT = new $DataView(result);
      var index = 0;
      while (first < fin) {
        viewT.setUint8(index++, viewS.getUint8(first++));
      } return result;
    }
  });

  _setSpecies(ARRAY_BUFFER);

  var _typedArray = createCommonjsModule(function (module) {
  if (_descriptors) {
    var global = _global;
    var fails = _fails;
    var $export = _export;
    var $typed = _typed;
    var $buffer = _typedBuffer;
    var ctx = _ctx;
    var anInstance = _anInstance;
    var propertyDesc = _propertyDesc;
    var hide = _hide;
    var redefineAll = _redefineAll;
    var toInteger = _toInteger;
    var toLength = _toLength;
    var toIndex = _toIndex;
    var toAbsoluteIndex = _toAbsoluteIndex;
    var toPrimitive = _toPrimitive;
    var has = _has;
    var classof = _classof;
    var isObject = _isObject;
    var toObject = _toObject;
    var isArrayIter = _isArrayIter;
    var create = _objectCreate;
    var getPrototypeOf = _objectGpo;
    var gOPN = _objectGopn.f;
    var getIterFn = core_getIteratorMethod;
    var uid = _uid;
    var wks = _wks;
    var createArrayMethod = _arrayMethods;
    var createArrayIncludes = _arrayIncludes;
    var speciesConstructor = _speciesConstructor;
    var ArrayIterators = es6_array_iterator;
    var Iterators = _iterators;
    var $iterDetect = _iterDetect;
    var setSpecies = _setSpecies;
    var arrayFill = _arrayFill;
    var arrayCopyWithin = _arrayCopyWithin;
    var $DP = _objectDp;
    var $GOPD = _objectGopd;
    var dP = $DP.f;
    var gOPD = $GOPD.f;
    var RangeError = global.RangeError;
    var TypeError = global.TypeError;
    var Uint8Array = global.Uint8Array;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var PROTOTYPE = 'prototype';
    var ArrayProto = Array[PROTOTYPE];
    var $ArrayBuffer = $buffer.ArrayBuffer;
    var $DataView = $buffer.DataView;
    var arrayForEach = createArrayMethod(0);
    var arrayFilter = createArrayMethod(2);
    var arraySome = createArrayMethod(3);
    var arrayEvery = createArrayMethod(4);
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var arrayIncludes = createArrayIncludes(true);
    var arrayIndexOf = createArrayIncludes(false);
    var arrayValues = ArrayIterators.values;
    var arrayKeys = ArrayIterators.keys;
    var arrayEntries = ArrayIterators.entries;
    var arrayLastIndexOf = ArrayProto.lastIndexOf;
    var arrayReduce = ArrayProto.reduce;
    var arrayReduceRight = ArrayProto.reduceRight;
    var arrayJoin = ArrayProto.join;
    var arraySort = ArrayProto.sort;
    var arraySlice = ArrayProto.slice;
    var arrayToString = ArrayProto.toString;
    var arrayToLocaleString = ArrayProto.toLocaleString;
    var ITERATOR = wks('iterator');
    var TAG = wks('toStringTag');
    var TYPED_CONSTRUCTOR = uid('typed_constructor');
    var DEF_CONSTRUCTOR = uid('def_constructor');
    var ALL_CONSTRUCTORS = $typed.CONSTR;
    var TYPED_ARRAY = $typed.TYPED;
    var VIEW = $typed.VIEW;
    var WRONG_LENGTH = 'Wrong length!';

    var $map = createArrayMethod(1, function (O, length) {
      return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
    });

    var LITTLE_ENDIAN = fails(function () {
      // eslint-disable-next-line no-undef
      return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    });

    var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
      new Uint8Array(1).set({});
    });

    var toOffset = function (it, BYTES) {
      var offset = toInteger(it);
      if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
      return offset;
    };

    var validate = function (it) {
      if (isObject(it) && TYPED_ARRAY in it) return it;
      throw TypeError(it + ' is not a typed array!');
    };

    var allocate = function (C, length) {
      if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
        throw TypeError('It is not a typed array constructor!');
      } return new C(length);
    };

    var speciesFromList = function (O, list) {
      return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
    };

    var fromList = function (C, list) {
      var index = 0;
      var length = list.length;
      var result = allocate(C, length);
      while (length > index) result[index] = list[index++];
      return result;
    };

    var addGetter = function (it, key, internal) {
      dP(it, key, { get: function () { return this._d[internal]; } });
    };

    var $from = function from(source /* , mapfn, thisArg */) {
      var O = toObject(source);
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iterFn = getIterFn(O);
      var i, length, values, result, step, iterator;
      if (iterFn != undefined && !isArrayIter(iterFn)) {
        for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
          values.push(step.value);
        } O = values;
      }
      if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
      for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }
      return result;
    };

    var $of = function of(/* ...items */) {
      var index = 0;
      var length = arguments.length;
      var result = allocate(this, length);
      while (length > index) result[index] = arguments[index++];
      return result;
    };

    // iOS Safari 6.x fails here
    var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

    var $toLocaleString = function toLocaleString() {
      return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
    };

    var proto = {
      copyWithin: function copyWithin(target, start /* , end */) {
        return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
      },
      every: function every(callbackfn /* , thisArg */) {
        return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
        return arrayFill.apply(validate(this), arguments);
      },
      filter: function filter(callbackfn /* , thisArg */) {
        return speciesFromList(this, arrayFilter(validate(this), callbackfn,
          arguments.length > 1 ? arguments[1] : undefined));
      },
      find: function find(predicate /* , thisArg */) {
        return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      findIndex: function findIndex(predicate /* , thisArg */) {
        return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      forEach: function forEach(callbackfn /* , thisArg */) {
        arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      indexOf: function indexOf(searchElement /* , fromIndex */) {
        return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      includes: function includes(searchElement /* , fromIndex */) {
        return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      join: function join(separator) { // eslint-disable-line no-unused-vars
        return arrayJoin.apply(validate(this), arguments);
      },
      lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
        return arrayLastIndexOf.apply(validate(this), arguments);
      },
      map: function map(mapfn /* , thisArg */) {
        return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduce.apply(validate(this), arguments);
      },
      reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduceRight.apply(validate(this), arguments);
      },
      reverse: function reverse() {
        var that = this;
        var length = validate(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;
        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        } return that;
      },
      some: function some(callbackfn /* , thisArg */) {
        return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      sort: function sort(comparefn) {
        return arraySort.call(validate(this), comparefn);
      },
      subarray: function subarray(begin, end) {
        var O = validate(this);
        var length = O.length;
        var $begin = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
          O.buffer,
          O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
          toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
        );
      }
    };

    var $slice = function slice(start, end) {
      return speciesFromList(this, arraySlice.call(validate(this), start, end));
    };

    var $set = function set(arrayLike /* , offset */) {
      validate(this);
      var offset = toOffset(arguments[1], 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError(WRONG_LENGTH);
      while (index < len) this[offset + index] = src[index++];
    };

    var $iterators = {
      entries: function entries() {
        return arrayEntries.call(validate(this));
      },
      keys: function keys() {
        return arrayKeys.call(validate(this));
      },
      values: function values() {
        return arrayValues.call(validate(this));
      }
    };

    var isTAIndex = function (target, key) {
      return isObject(target)
        && target[TYPED_ARRAY]
        && typeof key != 'symbol'
        && key in target
        && String(+key) == String(key);
    };
    var $getDesc = function getOwnPropertyDescriptor(target, key) {
      return isTAIndex(target, key = toPrimitive(key, true))
        ? propertyDesc(2, target[key])
        : gOPD(target, key);
    };
    var $setDesc = function defineProperty(target, key, desc) {
      if (isTAIndex(target, key = toPrimitive(key, true))
        && isObject(desc)
        && has(desc, 'value')
        && !has(desc, 'get')
        && !has(desc, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable
        && (!has(desc, 'writable') || desc.writable)
        && (!has(desc, 'enumerable') || desc.enumerable)
      ) {
        target[key] = desc.value;
        return target;
      } return dP(target, key, desc);
    };

    if (!ALL_CONSTRUCTORS) {
      $GOPD.f = $getDesc;
      $DP.f = $setDesc;
    }

    $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
      getOwnPropertyDescriptor: $getDesc,
      defineProperty: $setDesc
    });

    if (fails(function () { arrayToString.call({}); })) {
      arrayToString = arrayToLocaleString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var $TypedArrayPrototype$ = redefineAll({}, proto);
    redefineAll($TypedArrayPrototype$, $iterators);
    hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
    redefineAll($TypedArrayPrototype$, {
      slice: $slice,
      set: $set,
      constructor: function () { /* noop */ },
      toString: arrayToString,
      toLocaleString: $toLocaleString
    });
    addGetter($TypedArrayPrototype$, 'buffer', 'b');
    addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
    addGetter($TypedArrayPrototype$, 'byteLength', 'l');
    addGetter($TypedArrayPrototype$, 'length', 'e');
    dP($TypedArrayPrototype$, TAG, {
      get: function () { return this[TYPED_ARRAY]; }
    });

    // eslint-disable-next-line max-statements
    module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
      CLAMPED = !!CLAMPED;
      var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + KEY;
      var SETTER = 'set' + KEY;
      var TypedArray = global[NAME];
      var Base = TypedArray || {};
      var TAC = TypedArray && getPrototypeOf(TypedArray);
      var FORCED = !TypedArray || !$typed.ABV;
      var O = {};
      var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
      var getter = function (that, index) {
        var data = that._d;
        return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
      };
      var setter = function (that, index, value) {
        var data = that._d;
        if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
        data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
      };
      var addElement = function (that, index) {
        dP(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true
        });
      };
      if (FORCED) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME, '_d');
          var index = 0;
          var offset = 0;
          var buffer, byteLength, length, klass;
          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new $ArrayBuffer(byteLength);
          } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            buffer = data;
            offset = toOffset($offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - offset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (TYPED_ARRAY in data) {
            return fromList(TypedArray, data);
          } else {
            return $from.call(TypedArray, data);
          }
          hide(that, '_d', {
            b: buffer,
            o: offset,
            l: byteLength,
            e: length,
            v: new $DataView(buffer)
          });
          while (index < length) addElement(that, index++);
        });
        TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
        hide(TypedArrayPrototype, 'constructor', TypedArray);
      } else if (!fails(function () {
        TypedArray(1);
      }) || !fails(function () {
        new TypedArray(-1); // eslint-disable-line no-new
      }) || !$iterDetect(function (iter) {
        new TypedArray(); // eslint-disable-line no-new
        new TypedArray(null); // eslint-disable-line no-new
        new TypedArray(1.5); // eslint-disable-line no-new
        new TypedArray(iter); // eslint-disable-line no-new
      }, true)) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME);
          var klass;
          // `ws` module bug, temporarily remove validation length for Uint8Array
          // https://github.com/websockets/ws/pull/645
          if (!isObject(data)) return new Base(toIndex(data));
          if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            return $length !== undefined
              ? new Base(data, toOffset($offset, BYTES), $length)
              : $offset !== undefined
                ? new Base(data, toOffset($offset, BYTES))
                : new Base(data);
          }
          if (TYPED_ARRAY in data) return fromList(TypedArray, data);
          return $from.call(TypedArray, data);
        });
        arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
          if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
        });
        TypedArray[PROTOTYPE] = TypedArrayPrototype;
        TypedArrayPrototype.constructor = TypedArray;
      }
      var $nativeIterator = TypedArrayPrototype[ITERATOR];
      var CORRECT_ITER_NAME = !!$nativeIterator
        && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
      var $iterator = $iterators.values;
      hide(TypedArray, TYPED_CONSTRUCTOR, true);
      hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
      hide(TypedArrayPrototype, VIEW, true);
      hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

      if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
        dP(TypedArrayPrototype, TAG, {
          get: function () { return NAME; }
        });
      }

      O[NAME] = TypedArray;

      $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

      $export($export.S, NAME, {
        BYTES_PER_ELEMENT: BYTES
      });

      $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
        from: $from,
        of: $of
      });

      if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

      $export($export.P, NAME, proto);

      setSpecies(NAME);

      $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

      $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

      if (TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

      $export($export.P + $export.F * fails(function () {
        new TypedArray(1).slice();
      }), NAME, { slice: $slice });

      $export($export.P + $export.F * (fails(function () {
        return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
      }) || !fails(function () {
        TypedArrayPrototype.toLocaleString.call([1, 2]);
      })), NAME, { toLocaleString: $toLocaleString });

      Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
      if (!CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
    };
  } else module.exports = function () { /* empty */ };
  });

  _typedArray('Int8', 1, function (init) {
    return function Int8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8ClampedArray(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  }, true);

  _typedArray('Int16', 2, function (init) {
    return function Int16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint16', 2, function (init) {
    return function Uint16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Int32', 4, function (init) {
    return function Int32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint32', 4, function (init) {
    return function Uint32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Float32', 4, function (init) {
    return function Float32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Float64', 8, function (init) {
    return function Float64Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  var getWeak = _meta.getWeak;







  var arrayFind = _arrayMethods(5);
  var arrayFindIndex = _arrayMethods(6);
  var id$1 = 0;

  // fallback for uncaught frozen keys
  var uncaughtFrozenStore = function (that) {
    return that._l || (that._l = new UncaughtFrozenStore());
  };
  var UncaughtFrozenStore = function () {
    this.a = [];
  };
  var findUncaughtFrozen = function (store, key) {
    return arrayFind(store.a, function (it) {
      return it[0] === key;
    });
  };
  UncaughtFrozenStore.prototype = {
    get: function (key) {
      var entry = findUncaughtFrozen(this, key);
      if (entry) return entry[1];
    },
    has: function (key) {
      return !!findUncaughtFrozen(this, key);
    },
    set: function (key, value) {
      var entry = findUncaughtFrozen(this, key);
      if (entry) entry[1] = value;
      else this.a.push([key, value]);
    },
    'delete': function (key) {
      var index = arrayFindIndex(this.a, function (it) {
        return it[0] === key;
      });
      if (~index) this.a.splice(index, 1);
      return !!~index;
    }
  };

  var _collectionWeak = {
    getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        _anInstance(that, C, NAME, '_i');
        that._t = NAME;      // collection type
        that._i = id$1++;      // collection id
        that._l = undefined; // leak store for uncaught frozen objects
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
      });
      _redefineAll(C.prototype, {
        // 23.3.3.2 WeakMap.prototype.delete(key)
        // 23.4.3.3 WeakSet.prototype.delete(value)
        'delete': function (key) {
          if (!_isObject(key)) return false;
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME))['delete'](key);
          return data && _has(data, this._i) && delete data[this._i];
        },
        // 23.3.3.4 WeakMap.prototype.has(key)
        // 23.4.3.4 WeakSet.prototype.has(value)
        has: function has(key) {
          if (!_isObject(key)) return false;
          var data = getWeak(key);
          if (data === true) return uncaughtFrozenStore(_validateCollection(this, NAME)).has(key);
          return data && _has(data, this._i);
        }
      });
      return C;
    },
    def: function (that, key, value) {
      var data = getWeak(_anObject(key), true);
      if (data === true) uncaughtFrozenStore(that).set(key, value);
      else data[that._i] = value;
      return that;
    },
    ufstore: uncaughtFrozenStore
  };

  var es6_weakMap = createCommonjsModule(function (module) {
  var each = _arrayMethods(0);







  var WEAK_MAP = 'WeakMap';
  var getWeak = _meta.getWeak;
  var isExtensible = Object.isExtensible;
  var uncaughtFrozenStore = _collectionWeak.ufstore;
  var tmp = {};
  var InternalMap;

  var wrapper = function (get) {
    return function WeakMap() {
      return get(this, arguments.length > 0 ? arguments[0] : undefined);
    };
  };

  var methods = {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function get(key) {
      if (_isObject(key)) {
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(_validateCollection(this, WEAK_MAP)).get(key);
        return data ? data[this._i] : undefined;
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function set(key, value) {
      return _collectionWeak.def(_validateCollection(this, WEAK_MAP), key, value);
    }
  };

  // 23.3 WeakMap Objects
  var $WeakMap = module.exports = _collection(WEAK_MAP, wrapper, methods, _collectionWeak, true, true);

  // IE11 WeakMap frozen keys fix
  if (_fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
    InternalMap = _collectionWeak.getConstructor(wrapper, WEAK_MAP);
    _objectAssign(InternalMap.prototype, methods);
    _meta.NEED = true;
    each(['delete', 'has', 'get', 'set'], function (key) {
      var proto = $WeakMap.prototype;
      var method = proto[key];
      _redefine(proto, key, function (a, b) {
        // store frozen objects on internal weakmap shim
        if (_isObject(a) && !isExtensible(a)) {
          if (!this._f) this._f = new InternalMap();
          var result = this._f[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      });
    });
  }
  });

  var WEAK_SET = 'WeakSet';

  // 23.4 WeakSet Objects
  _collection(WEAK_SET, function (get) {
    return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
  }, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function add(value) {
      return _collectionWeak.def(_validateCollection(this, WEAK_SET), value, true);
    }
  }, _collectionWeak, false, true);

  // ie9- setTimeout & setInterval additional parameters fix



  var slice = [].slice;
  var MSIE = /MSIE .\./.test(_userAgent); // <- dirty ie9- check
  var wrap$1 = function (set) {
    return function (fn, time /* , ...args */) {
      var boundArgs = arguments.length > 2;
      var args = boundArgs ? slice.call(arguments, 2) : false;
      return set(boundArgs ? function () {
        // eslint-disable-next-line no-new-func
        (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
      } : fn, time);
    };
  };
  _export(_export.G + _export.B + _export.F * MSIE, {
    setTimeout: wrap$1(_global.setTimeout),
    setInterval: wrap$1(_global.setInterval)
  });

  _export(_export.G + _export.B, {
    setImmediate: _task.set,
    clearImmediate: _task.clear
  });

  var ITERATOR$4 = _wks('iterator');
  var TO_STRING_TAG = _wks('toStringTag');
  var ArrayValues = _iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = _objectKeys(DOMIterables), i$2 = 0; i$2 < collections.length; i$2++) {
    var NAME$1 = collections[i$2];
    var explicit = DOMIterables[NAME$1];
    var Collection = _global[NAME$1];
    var proto$3 = Collection && Collection.prototype;
    var key$1;
    if (proto$3) {
      if (!proto$3[ITERATOR$4]) _hide(proto$3, ITERATOR$4, ArrayValues);
      if (!proto$3[TO_STRING_TAG]) _hide(proto$3, TO_STRING_TAG, NAME$1);
      _iterators[NAME$1] = ArrayValues;
      if (explicit) for (key$1 in es6_array_iterator) if (!proto$3[key$1]) _redefine(proto$3, key$1, es6_array_iterator[key$1], true);
    }
  }

  var runtime$1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var regeneratorRuntime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList)
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports
  ));
  });

  var bluebird = createCommonjsModule(function (module, exports) {
  /* @preserve
   * The MIT License (MIT)
   * 
   * Copyright (c) 2013-2018 Petka Antonov
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   * 
   */
  /**
   * bluebird build version 3.5.3
   * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
  */
  !function(e){module.exports=e();}(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
  module.exports = function(Promise) {
  var SomePromiseArray = Promise._SomePromiseArray;
  function any(promises) {
      var ret = new SomePromiseArray(promises);
      var promise = ret.promise();
      ret.setHowMany(1);
      ret.setUnwrap();
      ret.init();
      return promise;
  }

  Promise.any = function (promises) {
      return any(promises);
  };

  Promise.prototype.any = function () {
      return any(this);
  };

  };

  },{}],2:[function(_dereq_,module,exports){
  var firstLineError;
  try {throw new Error(); } catch (e) {firstLineError = e;}
  var schedule = _dereq_("./schedule");
  var Queue = _dereq_("./queue");
  var util = _dereq_("./util");

  function Async() {
      this._customScheduler = false;
      this._isTickUsed = false;
      this._lateQueue = new Queue(16);
      this._normalQueue = new Queue(16);
      this._haveDrainedQueues = false;
      this._trampolineEnabled = true;
      var self = this;
      this.drainQueues = function () {
          self._drainQueues();
      };
      this._schedule = schedule;
  }

  Async.prototype.setScheduler = function(fn) {
      var prev = this._schedule;
      this._schedule = fn;
      this._customScheduler = true;
      return prev;
  };

  Async.prototype.hasCustomScheduler = function() {
      return this._customScheduler;
  };

  Async.prototype.enableTrampoline = function() {
      this._trampolineEnabled = true;
  };

  Async.prototype.disableTrampolineIfNecessary = function() {
      if (util.hasDevTools) {
          this._trampolineEnabled = false;
      }
  };

  Async.prototype.haveItemsQueued = function () {
      return this._isTickUsed || this._haveDrainedQueues;
  };


  Async.prototype.fatalError = function(e, isNode) {
      if (isNode) {
          process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
              "\n");
          process.exit(2);
      } else {
          this.throwLater(e);
      }
  };

  Async.prototype.throwLater = function(fn, arg) {
      if (arguments.length === 1) {
          arg = fn;
          fn = function () { throw arg; };
      }
      if (typeof setTimeout !== "undefined") {
          setTimeout(function() {
              fn(arg);
          }, 0);
      } else try {
          this._schedule(function() {
              fn(arg);
          });
      } catch (e) {
          throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
  };

  function AsyncInvokeLater(fn, receiver, arg) {
      this._lateQueue.push(fn, receiver, arg);
      this._queueTick();
  }

  function AsyncInvoke(fn, receiver, arg) {
      this._normalQueue.push(fn, receiver, arg);
      this._queueTick();
  }

  function AsyncSettlePromises(promise) {
      this._normalQueue._pushOne(promise);
      this._queueTick();
  }

  if (!util.hasDevTools) {
      Async.prototype.invokeLater = AsyncInvokeLater;
      Async.prototype.invoke = AsyncInvoke;
      Async.prototype.settlePromises = AsyncSettlePromises;
  } else {
      Async.prototype.invokeLater = function (fn, receiver, arg) {
          if (this._trampolineEnabled) {
              AsyncInvokeLater.call(this, fn, receiver, arg);
          } else {
              this._schedule(function() {
                  setTimeout(function() {
                      fn.call(receiver, arg);
                  }, 100);
              });
          }
      };

      Async.prototype.invoke = function (fn, receiver, arg) {
          if (this._trampolineEnabled) {
              AsyncInvoke.call(this, fn, receiver, arg);
          } else {
              this._schedule(function() {
                  fn.call(receiver, arg);
              });
          }
      };

      Async.prototype.settlePromises = function(promise) {
          if (this._trampolineEnabled) {
              AsyncSettlePromises.call(this, promise);
          } else {
              this._schedule(function() {
                  promise._settlePromises();
              });
          }
      };
  }

  function _drainQueue(queue) {
      while (queue.length() > 0) {
          _drainQueueStep(queue);
      }
  }

  function _drainQueueStep(queue) {
      var fn = queue.shift();
      if (typeof fn !== "function") {
          fn._settlePromises();
      } else {
          var receiver = queue.shift();
          var arg = queue.shift();
          fn.call(receiver, arg);
      }
  }

  Async.prototype._drainQueues = function () {
      _drainQueue(this._normalQueue);
      this._reset();
      this._haveDrainedQueues = true;
      _drainQueue(this._lateQueue);
  };

  Async.prototype._queueTick = function () {
      if (!this._isTickUsed) {
          this._isTickUsed = true;
          this._schedule(this.drainQueues);
      }
  };

  Async.prototype._reset = function () {
      this._isTickUsed = false;
  };

  module.exports = Async;
  module.exports.firstLineError = firstLineError;

  },{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
  var calledBind = false;
  var rejectThis = function(_, e) {
      this._reject(e);
  };

  var targetRejected = function(e, context) {
      context.promiseRejectionQueued = true;
      context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
  };

  var bindingResolved = function(thisArg, context) {
      if (((this._bitField & 50397184) === 0)) {
          this._resolveCallback(context.target);
      }
  };

  var bindingRejected = function(e, context) {
      if (!context.promiseRejectionQueued) this._reject(e);
  };

  Promise.prototype.bind = function (thisArg) {
      if (!calledBind) {
          calledBind = true;
          Promise.prototype._propagateFrom = debug.propagateFromFunction();
          Promise.prototype._boundValue = debug.boundValueFunction();
      }
      var maybePromise = tryConvertToPromise(thisArg);
      var ret = new Promise(INTERNAL);
      ret._propagateFrom(this, 1);
      var target = this._target();
      ret._setBoundTo(maybePromise);
      if (maybePromise instanceof Promise) {
          var context = {
              promiseRejectionQueued: false,
              promise: ret,
              target: target,
              bindingPromise: maybePromise
          };
          target._then(INTERNAL, targetRejected, undefined, ret, context);
          maybePromise._then(
              bindingResolved, bindingRejected, undefined, ret, context);
          ret._setOnCancel(maybePromise);
      } else {
          ret._resolveCallback(target);
      }
      return ret;
  };

  Promise.prototype._setBoundTo = function (obj) {
      if (obj !== undefined) {
          this._bitField = this._bitField | 2097152;
          this._boundTo = obj;
      } else {
          this._bitField = this._bitField & (~2097152);
      }
  };

  Promise.prototype._isBound = function () {
      return (this._bitField & 2097152) === 2097152;
  };

  Promise.bind = function (thisArg, value) {
      return Promise.resolve(value).bind(thisArg);
  };
  };

  },{}],4:[function(_dereq_,module,exports){
  var old;
  if (typeof Promise !== "undefined") old = Promise;
  function noConflict() {
      try { if (Promise === bluebird) Promise = old; }
      catch (e) {}
      return bluebird;
  }
  var bluebird = _dereq_("./promise")();
  bluebird.noConflict = noConflict;
  module.exports = bluebird;

  },{"./promise":22}],5:[function(_dereq_,module,exports){
  var cr = Object.create;
  if (cr) {
      var callerCache = cr(null);
      var getterCache = cr(null);
      callerCache[" size"] = getterCache[" size"] = 0;
  }

  module.exports = function(Promise) {
  var util = _dereq_("./util");
  var canEvaluate = util.canEvaluate;
  var isIdentifier = util.isIdentifier;
  var getGetter;

  function ensureMethod(obj, methodName) {
      var fn;
      if (obj != null) fn = obj[methodName];
      if (typeof fn !== "function") {
          var message = "Object " + util.classString(obj) + " has no method '" +
              util.toString(methodName) + "'";
          throw new Promise.TypeError(message);
      }
      return fn;
  }

  function caller(obj) {
      var methodName = this.pop();
      var fn = ensureMethod(obj, methodName);
      return fn.apply(obj, this);
  }
  Promise.prototype.call = function (methodName) {
      var args = [].slice.call(arguments, 1);    args.push(methodName);
      return this._then(caller, undefined, undefined, args, undefined);
  };

  function namedGetter(obj) {
      return obj[this];
  }
  function indexedGetter(obj) {
      var index = +this;
      if (index < 0) index = Math.max(0, index + obj.length);
      return obj[index];
  }
  Promise.prototype.get = function (propertyName) {
      var isIndex = (typeof propertyName === "number");
      var getter;
      if (!isIndex) {
          if (canEvaluate) {
              var maybeGetter = getGetter(propertyName);
              getter = maybeGetter !== null ? maybeGetter : namedGetter;
          } else {
              getter = namedGetter;
          }
      } else {
          getter = indexedGetter;
      }
      return this._then(getter, undefined, undefined, propertyName, undefined);
  };
  };

  },{"./util":36}],6:[function(_dereq_,module,exports){
  module.exports = function(Promise, PromiseArray, apiRejection, debug) {
  var util = _dereq_("./util");
  var tryCatch = util.tryCatch;
  var errorObj = util.errorObj;
  var async = Promise._async;

  Promise.prototype["break"] = Promise.prototype.cancel = function() {
      if (!debug.cancellation()) return this._warn("cancellation is disabled");

      var promise = this;
      var child = promise;
      while (promise._isCancellable()) {
          if (!promise._cancelBy(child)) {
              if (child._isFollowing()) {
                  child._followee().cancel();
              } else {
                  child._cancelBranched();
              }
              break;
          }

          var parent = promise._cancellationParent;
          if (parent == null || !parent._isCancellable()) {
              if (promise._isFollowing()) {
                  promise._followee().cancel();
              } else {
                  promise._cancelBranched();
              }
              break;
          } else {
              if (promise._isFollowing()) promise._followee().cancel();
              promise._setWillBeCancelled();
              child = promise;
              promise = parent;
          }
      }
  };

  Promise.prototype._branchHasCancelled = function() {
      this._branchesRemainingToCancel--;
  };

  Promise.prototype._enoughBranchesHaveCancelled = function() {
      return this._branchesRemainingToCancel === undefined ||
             this._branchesRemainingToCancel <= 0;
  };

  Promise.prototype._cancelBy = function(canceller) {
      if (canceller === this) {
          this._branchesRemainingToCancel = 0;
          this._invokeOnCancel();
          return true;
      } else {
          this._branchHasCancelled();
          if (this._enoughBranchesHaveCancelled()) {
              this._invokeOnCancel();
              return true;
          }
      }
      return false;
  };

  Promise.prototype._cancelBranched = function() {
      if (this._enoughBranchesHaveCancelled()) {
          this._cancel();
      }
  };

  Promise.prototype._cancel = function() {
      if (!this._isCancellable()) return;
      this._setCancelled();
      async.invoke(this._cancelPromises, this, undefined);
  };

  Promise.prototype._cancelPromises = function() {
      if (this._length() > 0) this._settlePromises();
  };

  Promise.prototype._unsetOnCancel = function() {
      this._onCancelField = undefined;
  };

  Promise.prototype._isCancellable = function() {
      return this.isPending() && !this._isCancelled();
  };

  Promise.prototype.isCancellable = function() {
      return this.isPending() && !this.isCancelled();
  };

  Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
      if (util.isArray(onCancelCallback)) {
          for (var i = 0; i < onCancelCallback.length; ++i) {
              this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
          }
      } else if (onCancelCallback !== undefined) {
          if (typeof onCancelCallback === "function") {
              if (!internalOnly) {
                  var e = tryCatch(onCancelCallback).call(this._boundValue());
                  if (e === errorObj) {
                      this._attachExtraTrace(e.e);
                      async.throwLater(e.e);
                  }
              }
          } else {
              onCancelCallback._resultCancelled(this);
          }
      }
  };

  Promise.prototype._invokeOnCancel = function() {
      var onCancelCallback = this._onCancel();
      this._unsetOnCancel();
      async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
  };

  Promise.prototype._invokeInternalOnCancel = function() {
      if (this._isCancellable()) {
          this._doInvokeOnCancel(this._onCancel(), true);
          this._unsetOnCancel();
      }
  };

  Promise.prototype._resultCancelled = function() {
      this.cancel();
  };

  };

  },{"./util":36}],7:[function(_dereq_,module,exports){
  module.exports = function(NEXT_FILTER) {
  var util = _dereq_("./util");
  var getKeys = _dereq_("./es5").keys;
  var tryCatch = util.tryCatch;
  var errorObj = util.errorObj;

  function catchFilter(instances, cb, promise) {
      return function(e) {
          var boundTo = promise._boundValue();
          predicateLoop: for (var i = 0; i < instances.length; ++i) {
              var item = instances[i];

              if (item === Error ||
                  (item != null && item.prototype instanceof Error)) {
                  if (e instanceof item) {
                      return tryCatch(cb).call(boundTo, e);
                  }
              } else if (typeof item === "function") {
                  var matchesPredicate = tryCatch(item).call(boundTo, e);
                  if (matchesPredicate === errorObj) {
                      return matchesPredicate;
                  } else if (matchesPredicate) {
                      return tryCatch(cb).call(boundTo, e);
                  }
              } else if (util.isObject(e)) {
                  var keys = getKeys(item);
                  for (var j = 0; j < keys.length; ++j) {
                      var key = keys[j];
                      if (item[key] != e[key]) {
                          continue predicateLoop;
                      }
                  }
                  return tryCatch(cb).call(boundTo, e);
              }
          }
          return NEXT_FILTER;
      };
  }

  return catchFilter;
  };

  },{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
  module.exports = function(Promise) {
  var longStackTraces = false;
  var contextStack = [];

  Promise.prototype._promiseCreated = function() {};
  Promise.prototype._pushContext = function() {};
  Promise.prototype._popContext = function() {return null;};
  Promise._peekContext = Promise.prototype._peekContext = function() {};

  function Context() {
      this._trace = new Context.CapturedTrace(peekContext());
  }
  Context.prototype._pushContext = function () {
      if (this._trace !== undefined) {
          this._trace._promiseCreated = null;
          contextStack.push(this._trace);
      }
  };

  Context.prototype._popContext = function () {
      if (this._trace !== undefined) {
          var trace = contextStack.pop();
          var ret = trace._promiseCreated;
          trace._promiseCreated = null;
          return ret;
      }
      return null;
  };

  function createContext() {
      if (longStackTraces) return new Context();
  }

  function peekContext() {
      var lastIndex = contextStack.length - 1;
      if (lastIndex >= 0) {
          return contextStack[lastIndex];
      }
      return undefined;
  }
  Context.CapturedTrace = null;
  Context.create = createContext;
  Context.deactivateLongStackTraces = function() {};
  Context.activateLongStackTraces = function() {
      var Promise_pushContext = Promise.prototype._pushContext;
      var Promise_popContext = Promise.prototype._popContext;
      var Promise_PeekContext = Promise._peekContext;
      var Promise_peekContext = Promise.prototype._peekContext;
      var Promise_promiseCreated = Promise.prototype._promiseCreated;
      Context.deactivateLongStackTraces = function() {
          Promise.prototype._pushContext = Promise_pushContext;
          Promise.prototype._popContext = Promise_popContext;
          Promise._peekContext = Promise_PeekContext;
          Promise.prototype._peekContext = Promise_peekContext;
          Promise.prototype._promiseCreated = Promise_promiseCreated;
          longStackTraces = false;
      };
      longStackTraces = true;
      Promise.prototype._pushContext = Context.prototype._pushContext;
      Promise.prototype._popContext = Context.prototype._popContext;
      Promise._peekContext = Promise.prototype._peekContext = peekContext;
      Promise.prototype._promiseCreated = function() {
          var ctx = this._peekContext();
          if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
      };
  };
  return Context;
  };

  },{}],9:[function(_dereq_,module,exports){
  module.exports = function(Promise, Context) {
  var getDomain = Promise._getDomain;
  var async = Promise._async;
  var Warning = _dereq_("./errors").Warning;
  var util = _dereq_("./util");
  var es5 = _dereq_("./es5");
  var canAttachTrace = util.canAttachTrace;
  var unhandledRejectionHandled;
  var possiblyUnhandledRejection;
  var bluebirdFramePattern =
      /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
  var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
  var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
  var stackFramePattern = null;
  var formatStack = null;
  var indentStackFrames = false;
  var printWarning;
  var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
                          (true ||
                           util.env("BLUEBIRD_DEBUG") ||
                           util.env("NODE_ENV") === "development"));

  var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
      (debugging || util.env("BLUEBIRD_WARNINGS")));

  var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
      (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

  var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
      (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

  Promise.prototype.suppressUnhandledRejections = function() {
      var target = this._target();
      target._bitField = ((target._bitField & (~1048576)) |
                        524288);
  };

  Promise.prototype._ensurePossibleRejectionHandled = function () {
      if ((this._bitField & 524288) !== 0) return;
      this._setRejectionIsUnhandled();
      var self = this;
      setTimeout(function() {
          self._notifyUnhandledRejection();
      }, 1);
  };

  Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
      fireRejectionEvent("rejectionHandled",
                                    unhandledRejectionHandled, undefined, this);
  };

  Promise.prototype._setReturnedNonUndefined = function() {
      this._bitField = this._bitField | 268435456;
  };

  Promise.prototype._returnedNonUndefined = function() {
      return (this._bitField & 268435456) !== 0;
  };

  Promise.prototype._notifyUnhandledRejection = function () {
      if (this._isRejectionUnhandled()) {
          var reason = this._settledValue();
          this._setUnhandledRejectionIsNotified();
          fireRejectionEvent("unhandledRejection",
                                        possiblyUnhandledRejection, reason, this);
      }
  };

  Promise.prototype._setUnhandledRejectionIsNotified = function () {
      this._bitField = this._bitField | 262144;
  };

  Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
      this._bitField = this._bitField & (~262144);
  };

  Promise.prototype._isUnhandledRejectionNotified = function () {
      return (this._bitField & 262144) > 0;
  };

  Promise.prototype._setRejectionIsUnhandled = function () {
      this._bitField = this._bitField | 1048576;
  };

  Promise.prototype._unsetRejectionIsUnhandled = function () {
      this._bitField = this._bitField & (~1048576);
      if (this._isUnhandledRejectionNotified()) {
          this._unsetUnhandledRejectionIsNotified();
          this._notifyUnhandledRejectionIsHandled();
      }
  };

  Promise.prototype._isRejectionUnhandled = function () {
      return (this._bitField & 1048576) > 0;
  };

  Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
      return warn(message, shouldUseOwnTrace, promise || this);
  };

  Promise.onPossiblyUnhandledRejection = function (fn) {
      var domain = getDomain();
      possiblyUnhandledRejection =
          typeof fn === "function" ? (domain === null ?
                                              fn : util.domainBind(domain, fn))
                                   : undefined;
  };

  Promise.onUnhandledRejectionHandled = function (fn) {
      var domain = getDomain();
      unhandledRejectionHandled =
          typeof fn === "function" ? (domain === null ?
                                              fn : util.domainBind(domain, fn))
                                   : undefined;
  };

  var disableLongStackTraces = function() {};
  Promise.longStackTraces = function () {
      if (async.haveItemsQueued() && !config.longStackTraces) {
          throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      if (!config.longStackTraces && longStackTracesIsSupported()) {
          var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
          var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
          var Promise_dereferenceTrace = Promise.prototype._dereferenceTrace;
          config.longStackTraces = true;
          disableLongStackTraces = function() {
              if (async.haveItemsQueued() && !config.longStackTraces) {
                  throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
              }
              Promise.prototype._captureStackTrace = Promise_captureStackTrace;
              Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
              Promise.prototype._dereferenceTrace = Promise_dereferenceTrace;
              Context.deactivateLongStackTraces();
              async.enableTrampoline();
              config.longStackTraces = false;
          };
          Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
          Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
          Promise.prototype._dereferenceTrace = longStackTracesDereferenceTrace;
          Context.activateLongStackTraces();
          async.disableTrampolineIfNecessary();
      }
  };

  Promise.hasLongStackTraces = function () {
      return config.longStackTraces && longStackTracesIsSupported();
  };

  var fireDomEvent = (function() {
      try {
          if (typeof CustomEvent === "function") {
              var event = new CustomEvent("CustomEvent");
              util.global.dispatchEvent(event);
              return function(name, event) {
                  var eventData = {
                      detail: event,
                      cancelable: true
                  };
                  es5.defineProperty(
                      eventData, "promise", {value: event.promise});
                  es5.defineProperty(eventData, "reason", {value: event.reason});
                  var domEvent = new CustomEvent(name.toLowerCase(), eventData);
                  return !util.global.dispatchEvent(domEvent);
              };
          } else if (typeof Event === "function") {
              var event = new Event("CustomEvent");
              util.global.dispatchEvent(event);
              return function(name, event) {
                  var domEvent = new Event(name.toLowerCase(), {
                      cancelable: true
                  });
                  domEvent.detail = event;
                  es5.defineProperty(domEvent, "promise", {value: event.promise});
                  es5.defineProperty(domEvent, "reason", {value: event.reason});
                  return !util.global.dispatchEvent(domEvent);
              };
          } else {
              var event = document.createEvent("CustomEvent");
              event.initCustomEvent("testingtheevent", false, true, {});
              util.global.dispatchEvent(event);
              return function(name, event) {
                  var domEvent = document.createEvent("CustomEvent");
                  domEvent.initCustomEvent(name.toLowerCase(), false, true,
                      event);
                  return !util.global.dispatchEvent(domEvent);
              };
          }
      } catch (e) {}
      return function() {
          return false;
      };
  })();

  var fireGlobalEvent = (function() {
      if (util.isNode) {
          return function() {
              return process.emit.apply(process, arguments);
          };
      } else {
          if (!util.global) {
              return function() {
                  return false;
              };
          }
          return function(name) {
              var methodName = "on" + name.toLowerCase();
              var method = util.global[methodName];
              if (!method) return false;
              method.apply(util.global, [].slice.call(arguments, 1));
              return true;
          };
      }
  })();

  function generatePromiseLifecycleEventObject(name, promise) {
      return {promise: promise};
  }

  var eventToObjectGenerator = {
      promiseCreated: generatePromiseLifecycleEventObject,
      promiseFulfilled: generatePromiseLifecycleEventObject,
      promiseRejected: generatePromiseLifecycleEventObject,
      promiseResolved: generatePromiseLifecycleEventObject,
      promiseCancelled: generatePromiseLifecycleEventObject,
      promiseChained: function(name, promise, child) {
          return {promise: promise, child: child};
      },
      warning: function(name, warning) {
          return {warning: warning};
      },
      unhandledRejection: function (name, reason, promise) {
          return {reason: reason, promise: promise};
      },
      rejectionHandled: generatePromiseLifecycleEventObject
  };

  var activeFireEvent = function (name) {
      var globalEventFired = false;
      try {
          globalEventFired = fireGlobalEvent.apply(null, arguments);
      } catch (e) {
          async.throwLater(e);
          globalEventFired = true;
      }

      var domEventFired = false;
      try {
          domEventFired = fireDomEvent(name,
                      eventToObjectGenerator[name].apply(null, arguments));
      } catch (e) {
          async.throwLater(e);
          domEventFired = true;
      }

      return domEventFired || globalEventFired;
  };

  Promise.config = function(opts) {
      opts = Object(opts);
      if ("longStackTraces" in opts) {
          if (opts.longStackTraces) {
              Promise.longStackTraces();
          } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
              disableLongStackTraces();
          }
      }
      if ("warnings" in opts) {
          var warningsOption = opts.warnings;
          config.warnings = !!warningsOption;
          wForgottenReturn = config.warnings;

          if (util.isObject(warningsOption)) {
              if ("wForgottenReturn" in warningsOption) {
                  wForgottenReturn = !!warningsOption.wForgottenReturn;
              }
          }
      }
      if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
          if (async.haveItemsQueued()) {
              throw new Error(
                  "cannot enable cancellation after promises are in use");
          }
          Promise.prototype._clearCancellationData =
              cancellationClearCancellationData;
          Promise.prototype._propagateFrom = cancellationPropagateFrom;
          Promise.prototype._onCancel = cancellationOnCancel;
          Promise.prototype._setOnCancel = cancellationSetOnCancel;
          Promise.prototype._attachCancellationCallback =
              cancellationAttachCancellationCallback;
          Promise.prototype._execute = cancellationExecute;
          propagateFromFunction = cancellationPropagateFrom;
          config.cancellation = true;
      }
      if ("monitoring" in opts) {
          if (opts.monitoring && !config.monitoring) {
              config.monitoring = true;
              Promise.prototype._fireEvent = activeFireEvent;
          } else if (!opts.monitoring && config.monitoring) {
              config.monitoring = false;
              Promise.prototype._fireEvent = defaultFireEvent;
          }
      }
      return Promise;
  };

  function defaultFireEvent() { return false; }

  Promise.prototype._fireEvent = defaultFireEvent;
  Promise.prototype._execute = function(executor, resolve, reject) {
      try {
          executor(resolve, reject);
      } catch (e) {
          return e;
      }
  };
  Promise.prototype._onCancel = function () {};
  Promise.prototype._setOnCancel = function (handler) { };
  Promise.prototype._attachCancellationCallback = function(onCancel) {
  };
  Promise.prototype._captureStackTrace = function () {};
  Promise.prototype._attachExtraTrace = function () {};
  Promise.prototype._dereferenceTrace = function () {};
  Promise.prototype._clearCancellationData = function() {};
  Promise.prototype._propagateFrom = function (parent, flags) {
  };

  function cancellationExecute(executor, resolve, reject) {
      var promise = this;
      try {
          executor(resolve, reject, function(onCancel) {
              if (typeof onCancel !== "function") {
                  throw new TypeError("onCancel must be a function, got: " +
                                      util.toString(onCancel));
              }
              promise._attachCancellationCallback(onCancel);
          });
      } catch (e) {
          return e;
      }
  }

  function cancellationAttachCancellationCallback(onCancel) {
      if (!this._isCancellable()) return this;

      var previousOnCancel = this._onCancel();
      if (previousOnCancel !== undefined) {
          if (util.isArray(previousOnCancel)) {
              previousOnCancel.push(onCancel);
          } else {
              this._setOnCancel([previousOnCancel, onCancel]);
          }
      } else {
          this._setOnCancel(onCancel);
      }
  }

  function cancellationOnCancel() {
      return this._onCancelField;
  }

  function cancellationSetOnCancel(onCancel) {
      this._onCancelField = onCancel;
  }

  function cancellationClearCancellationData() {
      this._cancellationParent = undefined;
      this._onCancelField = undefined;
  }

  function cancellationPropagateFrom(parent, flags) {
      if ((flags & 1) !== 0) {
          this._cancellationParent = parent;
          var branchesRemainingToCancel = parent._branchesRemainingToCancel;
          if (branchesRemainingToCancel === undefined) {
              branchesRemainingToCancel = 0;
          }
          parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
      }
      if ((flags & 2) !== 0 && parent._isBound()) {
          this._setBoundTo(parent._boundTo);
      }
  }

  function bindingPropagateFrom(parent, flags) {
      if ((flags & 2) !== 0 && parent._isBound()) {
          this._setBoundTo(parent._boundTo);
      }
  }
  var propagateFromFunction = bindingPropagateFrom;

  function boundValueFunction() {
      var ret = this._boundTo;
      if (ret !== undefined) {
          if (ret instanceof Promise) {
              if (ret.isFulfilled()) {
                  return ret.value();
              } else {
                  return undefined;
              }
          }
      }
      return ret;
  }

  function longStackTracesCaptureStackTrace() {
      this._trace = new CapturedTrace(this._peekContext());
  }

  function longStackTracesAttachExtraTrace(error, ignoreSelf) {
      if (canAttachTrace(error)) {
          var trace = this._trace;
          if (trace !== undefined) {
              if (ignoreSelf) trace = trace._parent;
          }
          if (trace !== undefined) {
              trace.attachExtraTrace(error);
          } else if (!error.__stackCleaned__) {
              var parsed = parseStackAndMessage(error);
              util.notEnumerableProp(error, "stack",
                  parsed.message + "\n" + parsed.stack.join("\n"));
              util.notEnumerableProp(error, "__stackCleaned__", true);
          }
      }
  }

  function longStackTracesDereferenceTrace() {
      this._trace = undefined;
  }

  function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                                 parent) {
      if (returnValue === undefined && promiseCreated !== null &&
          wForgottenReturn) {
          if (parent !== undefined && parent._returnedNonUndefined()) return;
          if ((promise._bitField & 65535) === 0) return;

          if (name) name = name + " ";
          var handlerLine = "";
          var creatorLine = "";
          if (promiseCreated._trace) {
              var traceLines = promiseCreated._trace.stack.split("\n");
              var stack = cleanStack(traceLines);
              for (var i = stack.length - 1; i >= 0; --i) {
                  var line = stack[i];
                  if (!nodeFramePattern.test(line)) {
                      var lineMatches = line.match(parseLinePattern);
                      if (lineMatches) {
                          handlerLine  = "at " + lineMatches[1] +
                              ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                      }
                      break;
                  }
              }

              if (stack.length > 0) {
                  var firstUserLine = stack[0];
                  for (var i = 0; i < traceLines.length; ++i) {

                      if (traceLines[i] === firstUserLine) {
                          if (i > 0) {
                              creatorLine = "\n" + traceLines[i - 1];
                          }
                          break;
                      }
                  }

              }
          }
          var msg = "a promise was created in a " + name +
              "handler " + handlerLine + "but was not returned from it, " +
              "see http://goo.gl/rRqMUw" +
              creatorLine;
          promise._warn(msg, true, promiseCreated);
      }
  }

  function deprecated(name, replacement) {
      var message = name +
          " is deprecated and will be removed in a future version.";
      if (replacement) message += " Use " + replacement + " instead.";
      return warn(message);
  }

  function warn(message, shouldUseOwnTrace, promise) {
      if (!config.warnings) return;
      var warning = new Warning(message);
      var ctx;
      if (shouldUseOwnTrace) {
          promise._attachExtraTrace(warning);
      } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
          ctx.attachExtraTrace(warning);
      } else {
          var parsed = parseStackAndMessage(warning);
          warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
      }

      if (!activeFireEvent("warning", warning)) {
          formatAndLogError(warning, "", true);
      }
  }

  function reconstructStack(message, stacks) {
      for (var i = 0; i < stacks.length - 1; ++i) {
          stacks[i].push("From previous event:");
          stacks[i] = stacks[i].join("\n");
      }
      if (i < stacks.length) {
          stacks[i] = stacks[i].join("\n");
      }
      return message + "\n" + stacks.join("\n");
  }

  function removeDuplicateOrEmptyJumps(stacks) {
      for (var i = 0; i < stacks.length; ++i) {
          if (stacks[i].length === 0 ||
              ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
              stacks.splice(i, 1);
              i--;
          }
      }
  }

  function removeCommonRoots(stacks) {
      var current = stacks[0];
      for (var i = 1; i < stacks.length; ++i) {
          var prev = stacks[i];
          var currentLastIndex = current.length - 1;
          var currentLastLine = current[currentLastIndex];
          var commonRootMeetPoint = -1;

          for (var j = prev.length - 1; j >= 0; --j) {
              if (prev[j] === currentLastLine) {
                  commonRootMeetPoint = j;
                  break;
              }
          }

          for (var j = commonRootMeetPoint; j >= 0; --j) {
              var line = prev[j];
              if (current[currentLastIndex] === line) {
                  current.pop();
                  currentLastIndex--;
              } else {
                  break;
              }
          }
          current = prev;
      }
  }

  function cleanStack(stack) {
      var ret = [];
      for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          var isTraceLine = "    (No stack trace)" === line ||
              stackFramePattern.test(line);
          var isInternalFrame = isTraceLine && shouldIgnore(line);
          if (isTraceLine && !isInternalFrame) {
              if (indentStackFrames && line.charAt(0) !== " ") {
                  line = "    " + line;
              }
              ret.push(line);
          }
      }
      return ret;
  }

  function stackFramesAsArray(error) {
      var stack = error.stack.replace(/\s+$/g, "").split("\n");
      for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
              break;
          }
      }
      if (i > 0 && error.name != "SyntaxError") {
          stack = stack.slice(i);
      }
      return stack;
  }

  function parseStackAndMessage(error) {
      var stack = error.stack;
      var message = error.toString();
      stack = typeof stack === "string" && stack.length > 0
                  ? stackFramesAsArray(error) : ["    (No stack trace)"];
      return {
          message: message,
          stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
      };
  }

  function formatAndLogError(error, title, isSoft) {
      if (typeof console !== "undefined") {
          var message;
          if (util.isObject(error)) {
              var stack = error.stack;
              message = title + formatStack(stack, error);
          } else {
              message = title + String(error);
          }
          if (typeof printWarning === "function") {
              printWarning(message, isSoft);
          } else if (typeof console.log === "function" ||
              typeof console.log === "object") {
              console.log(message);
          }
      }
  }

  function fireRejectionEvent(name, localHandler, reason, promise) {
      var localEventFired = false;
      try {
          if (typeof localHandler === "function") {
              localEventFired = true;
              if (name === "rejectionHandled") {
                  localHandler(promise);
              } else {
                  localHandler(reason, promise);
              }
          }
      } catch (e) {
          async.throwLater(e);
      }

      if (name === "unhandledRejection") {
          if (!activeFireEvent(name, reason, promise) && !localEventFired) {
              formatAndLogError(reason, "Unhandled rejection ");
          }
      } else {
          activeFireEvent(name, promise);
      }
  }

  function formatNonError(obj) {
      var str;
      if (typeof obj === "function") {
          str = "[function " +
              (obj.name || "anonymous") +
              "]";
      } else {
          str = obj && typeof obj.toString === "function"
              ? obj.toString() : util.toString(obj);
          var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
          if (ruselessToString.test(str)) {
              try {
                  var newStr = JSON.stringify(obj);
                  str = newStr;
              }
              catch(e) {

              }
          }
          if (str.length === 0) {
              str = "(empty array)";
          }
      }
      return ("(<" + snip(str) + ">, no stack trace)");
  }

  function snip(str) {
      var maxChars = 41;
      if (str.length < maxChars) {
          return str;
      }
      return str.substr(0, maxChars - 3) + "...";
  }

  function longStackTracesIsSupported() {
      return typeof captureStackTrace === "function";
  }

  var shouldIgnore = function() { return false; };
  var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
  function parseLineInfo(line) {
      var matches = line.match(parseLineInfoRegex);
      if (matches) {
          return {
              fileName: matches[1],
              line: parseInt(matches[2], 10)
          };
      }
  }

  function setBounds(firstLineError, lastLineError) {
      if (!longStackTracesIsSupported()) return;
      var firstStackLines = firstLineError.stack.split("\n");
      var lastStackLines = lastLineError.stack.split("\n");
      var firstIndex = -1;
      var lastIndex = -1;
      var firstFileName;
      var lastFileName;
      for (var i = 0; i < firstStackLines.length; ++i) {
          var result = parseLineInfo(firstStackLines[i]);
          if (result) {
              firstFileName = result.fileName;
              firstIndex = result.line;
              break;
          }
      }
      for (var i = 0; i < lastStackLines.length; ++i) {
          var result = parseLineInfo(lastStackLines[i]);
          if (result) {
              lastFileName = result.fileName;
              lastIndex = result.line;
              break;
          }
      }
      if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
          firstFileName !== lastFileName || firstIndex >= lastIndex) {
          return;
      }

      shouldIgnore = function(line) {
          if (bluebirdFramePattern.test(line)) return true;
          var info = parseLineInfo(line);
          if (info) {
              if (info.fileName === firstFileName &&
                  (firstIndex <= info.line && info.line <= lastIndex)) {
                  return true;
              }
          }
          return false;
      };
  }

  function CapturedTrace(parent) {
      this._parent = parent;
      this._promisesCreated = 0;
      var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
      captureStackTrace(this, CapturedTrace);
      if (length > 32) this.uncycle();
  }
  util.inherits(CapturedTrace, Error);
  Context.CapturedTrace = CapturedTrace;

  CapturedTrace.prototype.uncycle = function() {
      var length = this._length;
      if (length < 2) return;
      var nodes = [];
      var stackToIndex = {};

      for (var i = 0, node = this; node !== undefined; ++i) {
          nodes.push(node);
          node = node._parent;
      }
      length = this._length = i;
      for (var i = length - 1; i >= 0; --i) {
          var stack = nodes[i].stack;
          if (stackToIndex[stack] === undefined) {
              stackToIndex[stack] = i;
          }
      }
      for (var i = 0; i < length; ++i) {
          var currentStack = nodes[i].stack;
          var index = stackToIndex[currentStack];
          if (index !== undefined && index !== i) {
              if (index > 0) {
                  nodes[index - 1]._parent = undefined;
                  nodes[index - 1]._length = 1;
              }
              nodes[i]._parent = undefined;
              nodes[i]._length = 1;
              var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

              if (index < length - 1) {
                  cycleEdgeNode._parent = nodes[index + 1];
                  cycleEdgeNode._parent.uncycle();
                  cycleEdgeNode._length =
                      cycleEdgeNode._parent._length + 1;
              } else {
                  cycleEdgeNode._parent = undefined;
                  cycleEdgeNode._length = 1;
              }
              var currentChildLength = cycleEdgeNode._length + 1;
              for (var j = i - 2; j >= 0; --j) {
                  nodes[j]._length = currentChildLength;
                  currentChildLength++;
              }
              return;
          }
      }
  };

  CapturedTrace.prototype.attachExtraTrace = function(error) {
      if (error.__stackCleaned__) return;
      this.uncycle();
      var parsed = parseStackAndMessage(error);
      var message = parsed.message;
      var stacks = [parsed.stack];

      var trace = this;
      while (trace !== undefined) {
          stacks.push(cleanStack(trace.stack.split("\n")));
          trace = trace._parent;
      }
      removeCommonRoots(stacks);
      removeDuplicateOrEmptyJumps(stacks);
      util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
      util.notEnumerableProp(error, "__stackCleaned__", true);
  };

  var captureStackTrace = (function stackDetection() {
      var v8stackFramePattern = /^\s*at\s*/;
      var v8stackFormatter = function(stack, error) {
          if (typeof stack === "string") return stack;

          if (error.name !== undefined &&
              error.message !== undefined) {
              return error.toString();
          }
          return formatNonError(error);
      };

      if (typeof Error.stackTraceLimit === "number" &&
          typeof Error.captureStackTrace === "function") {
          Error.stackTraceLimit += 6;
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          var captureStackTrace = Error.captureStackTrace;

          shouldIgnore = function(line) {
              return bluebirdFramePattern.test(line);
          };
          return function(receiver, ignoreUntil) {
              Error.stackTraceLimit += 6;
              captureStackTrace(receiver, ignoreUntil);
              Error.stackTraceLimit -= 6;
          };
      }
      var err = new Error();

      if (typeof err.stack === "string" &&
          err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
          stackFramePattern = /@/;
          formatStack = v8stackFormatter;
          indentStackFrames = true;
          return function captureStackTrace(o) {
              o.stack = new Error().stack;
          };
      }

      var hasStackAfterThrow;
      try { throw new Error(); }
      catch(e) {
          hasStackAfterThrow = ("stack" in e);
      }
      if (!("stack" in err) && hasStackAfterThrow &&
          typeof Error.stackTraceLimit === "number") {
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          return function captureStackTrace(o) {
              Error.stackTraceLimit += 6;
              try { throw new Error(); }
              catch(e) { o.stack = e.stack; }
              Error.stackTraceLimit -= 6;
          };
      }

      formatStack = function(stack, error) {
          if (typeof stack === "string") return stack;

          if ((typeof error === "object" ||
              typeof error === "function") &&
              error.name !== undefined &&
              error.message !== undefined) {
              return error.toString();
          }
          return formatNonError(error);
      };

      return null;

  })([]);

  if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
      printWarning = function (message) {
          console.warn(message);
      };
      if (util.isNode && process.stderr.isTTY) {
          printWarning = function(message, isSoft) {
              var color = isSoft ? "\u001b[33m" : "\u001b[31m";
              console.warn(color + message + "\u001b[0m\n");
          };
      } else if (!util.isNode && typeof (new Error().stack) === "string") {
          printWarning = function(message, isSoft) {
              console.warn("%c" + message,
                          isSoft ? "color: darkorange" : "color: red");
          };
      }
  }

  var config = {
      warnings: warnings,
      longStackTraces: false,
      cancellation: false,
      monitoring: false
  };

  if (longStackTraces) Promise.longStackTraces();

  return {
      longStackTraces: function() {
          return config.longStackTraces;
      },
      warnings: function() {
          return config.warnings;
      },
      cancellation: function() {
          return config.cancellation;
      },
      monitoring: function() {
          return config.monitoring;
      },
      propagateFromFunction: function() {
          return propagateFromFunction;
      },
      boundValueFunction: function() {
          return boundValueFunction;
      },
      checkForgottenReturns: checkForgottenReturns,
      setBounds: setBounds,
      warn: warn,
      deprecated: deprecated,
      CapturedTrace: CapturedTrace,
      fireDomEvent: fireDomEvent,
      fireGlobalEvent: fireGlobalEvent
  };
  };

  },{"./errors":12,"./es5":13,"./util":36}],10:[function(_dereq_,module,exports){
  module.exports = function(Promise) {
  function returner() {
      return this.value;
  }
  function thrower() {
      throw this.reason;
  }

  Promise.prototype["return"] =
  Promise.prototype.thenReturn = function (value) {
      if (value instanceof Promise) value.suppressUnhandledRejections();
      return this._then(
          returner, undefined, undefined, {value: value}, undefined);
  };

  Promise.prototype["throw"] =
  Promise.prototype.thenThrow = function (reason) {
      return this._then(
          thrower, undefined, undefined, {reason: reason}, undefined);
  };

  Promise.prototype.catchThrow = function (reason) {
      if (arguments.length <= 1) {
          return this._then(
              undefined, thrower, undefined, {reason: reason}, undefined);
      } else {
          var _reason = arguments[1];
          var handler = function() {throw _reason;};
          return this.caught(reason, handler);
      }
  };

  Promise.prototype.catchReturn = function (value) {
      if (arguments.length <= 1) {
          if (value instanceof Promise) value.suppressUnhandledRejections();
          return this._then(
              undefined, returner, undefined, {value: value}, undefined);
      } else {
          var _value = arguments[1];
          if (_value instanceof Promise) _value.suppressUnhandledRejections();
          var handler = function() {return _value;};
          return this.caught(value, handler);
      }
  };
  };

  },{}],11:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL) {
  var PromiseReduce = Promise.reduce;
  var PromiseAll = Promise.all;

  function promiseAllThis() {
      return PromiseAll(this);
  }

  function PromiseMapSeries(promises, fn) {
      return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
  }

  Promise.prototype.each = function (fn) {
      return PromiseReduce(this, fn, INTERNAL, 0)
                ._then(promiseAllThis, undefined, undefined, this, undefined);
  };

  Promise.prototype.mapSeries = function (fn) {
      return PromiseReduce(this, fn, INTERNAL, INTERNAL);
  };

  Promise.each = function (promises, fn) {
      return PromiseReduce(promises, fn, INTERNAL, 0)
                ._then(promiseAllThis, undefined, undefined, promises, undefined);
  };

  Promise.mapSeries = PromiseMapSeries;
  };


  },{}],12:[function(_dereq_,module,exports){
  var es5 = _dereq_("./es5");
  var Objectfreeze = es5.freeze;
  var util = _dereq_("./util");
  var inherits = util.inherits;
  var notEnumerableProp = util.notEnumerableProp;

  function subError(nameProperty, defaultMessage) {
      function SubError(message) {
          if (!(this instanceof SubError)) return new SubError(message);
          notEnumerableProp(this, "message",
              typeof message === "string" ? message : defaultMessage);
          notEnumerableProp(this, "name", nameProperty);
          if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
          } else {
              Error.call(this);
          }
      }
      inherits(SubError, Error);
      return SubError;
  }

  var _TypeError, _RangeError;
  var Warning = subError("Warning", "warning");
  var CancellationError = subError("CancellationError", "cancellation error");
  var TimeoutError = subError("TimeoutError", "timeout error");
  var AggregateError = subError("AggregateError", "aggregate error");
  try {
      _TypeError = TypeError;
      _RangeError = RangeError;
  } catch(e) {
      _TypeError = subError("TypeError", "type error");
      _RangeError = subError("RangeError", "range error");
  }

  var methods = ("join pop push shift unshift slice filter forEach some " +
      "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

  for (var i = 0; i < methods.length; ++i) {
      if (typeof Array.prototype[methods[i]] === "function") {
          AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
      }
  }

  es5.defineProperty(AggregateError.prototype, "length", {
      value: 0,
      configurable: false,
      writable: true,
      enumerable: true
  });
  AggregateError.prototype["isOperational"] = true;
  var level = 0;
  AggregateError.prototype.toString = function() {
      var indent = Array(level * 4 + 1).join(" ");
      var ret = "\n" + indent + "AggregateError of:" + "\n";
      level++;
      indent = Array(level * 4 + 1).join(" ");
      for (var i = 0; i < this.length; ++i) {
          var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
          var lines = str.split("\n");
          for (var j = 0; j < lines.length; ++j) {
              lines[j] = indent + lines[j];
          }
          str = lines.join("\n");
          ret += str + "\n";
      }
      level--;
      return ret;
  };

  function OperationalError(message) {
      if (!(this instanceof OperationalError))
          return new OperationalError(message);
      notEnumerableProp(this, "name", "OperationalError");
      notEnumerableProp(this, "message", message);
      this.cause = message;
      this["isOperational"] = true;

      if (message instanceof Error) {
          notEnumerableProp(this, "message", message.message);
          notEnumerableProp(this, "stack", message.stack);
      } else if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
      }

  }
  inherits(OperationalError, Error);

  var errorTypes = Error["__BluebirdErrorTypes__"];
  if (!errorTypes) {
      errorTypes = Objectfreeze({
          CancellationError: CancellationError,
          TimeoutError: TimeoutError,
          OperationalError: OperationalError,
          RejectionError: OperationalError,
          AggregateError: AggregateError
      });
      es5.defineProperty(Error, "__BluebirdErrorTypes__", {
          value: errorTypes,
          writable: false,
          enumerable: false,
          configurable: false
      });
  }

  module.exports = {
      Error: Error,
      TypeError: _TypeError,
      RangeError: _RangeError,
      CancellationError: errorTypes.CancellationError,
      OperationalError: errorTypes.OperationalError,
      TimeoutError: errorTypes.TimeoutError,
      AggregateError: errorTypes.AggregateError,
      Warning: Warning
  };

  },{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
  var isES5 = (function(){
      return this === undefined;
  })();

  if (isES5) {
      module.exports = {
          freeze: Object.freeze,
          defineProperty: Object.defineProperty,
          getDescriptor: Object.getOwnPropertyDescriptor,
          keys: Object.keys,
          names: Object.getOwnPropertyNames,
          getPrototypeOf: Object.getPrototypeOf,
          isArray: Array.isArray,
          isES5: isES5,
          propertyIsWritable: function(obj, prop) {
              var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
              return !!(!descriptor || descriptor.writable || descriptor.set);
          }
      };
  } else {
      var has = {}.hasOwnProperty;
      var str = {}.toString;
      var proto = {}.constructor.prototype;

      var ObjectKeys = function (o) {
          var ret = [];
          for (var key in o) {
              if (has.call(o, key)) {
                  ret.push(key);
              }
          }
          return ret;
      };

      var ObjectGetDescriptor = function(o, key) {
          return {value: o[key]};
      };

      var ObjectDefineProperty = function (o, key, desc) {
          o[key] = desc.value;
          return o;
      };

      var ObjectFreeze = function (obj) {
          return obj;
      };

      var ObjectGetPrototypeOf = function (obj) {
          try {
              return Object(obj).constructor.prototype;
          }
          catch (e) {
              return proto;
          }
      };

      var ArrayIsArray = function (obj) {
          try {
              return str.call(obj) === "[object Array]";
          }
          catch(e) {
              return false;
          }
      };

      module.exports = {
          isArray: ArrayIsArray,
          keys: ObjectKeys,
          names: ObjectKeys,
          defineProperty: ObjectDefineProperty,
          getDescriptor: ObjectGetDescriptor,
          freeze: ObjectFreeze,
          getPrototypeOf: ObjectGetPrototypeOf,
          isES5: isES5,
          propertyIsWritable: function() {
              return true;
          }
      };
  }

  },{}],14:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL) {
  var PromiseMap = Promise.map;

  Promise.prototype.filter = function (fn, options) {
      return PromiseMap(this, fn, options, INTERNAL);
  };

  Promise.filter = function (promises, fn, options) {
      return PromiseMap(promises, fn, options, INTERNAL);
  };
  };

  },{}],15:[function(_dereq_,module,exports){
  module.exports = function(Promise, tryConvertToPromise, NEXT_FILTER) {
  var util = _dereq_("./util");
  var CancellationError = Promise.CancellationError;
  var errorObj = util.errorObj;
  var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);

  function PassThroughHandlerContext(promise, type, handler) {
      this.promise = promise;
      this.type = type;
      this.handler = handler;
      this.called = false;
      this.cancelPromise = null;
  }

  PassThroughHandlerContext.prototype.isFinallyHandler = function() {
      return this.type === 0;
  };

  function FinallyHandlerCancelReaction(finallyHandler) {
      this.finallyHandler = finallyHandler;
  }

  FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
      checkCancel(this.finallyHandler);
  };

  function checkCancel(ctx, reason) {
      if (ctx.cancelPromise != null) {
          if (arguments.length > 1) {
              ctx.cancelPromise._reject(reason);
          } else {
              ctx.cancelPromise._cancel();
          }
          ctx.cancelPromise = null;
          return true;
      }
      return false;
  }

  function succeed() {
      return finallyHandler.call(this, this.promise._target()._settledValue());
  }
  function fail(reason) {
      if (checkCancel(this, reason)) return;
      errorObj.e = reason;
      return errorObj;
  }
  function finallyHandler(reasonOrValue) {
      var promise = this.promise;
      var handler = this.handler;

      if (!this.called) {
          this.called = true;
          var ret = this.isFinallyHandler()
              ? handler.call(promise._boundValue())
              : handler.call(promise._boundValue(), reasonOrValue);
          if (ret === NEXT_FILTER) {
              return ret;
          } else if (ret !== undefined) {
              promise._setReturnedNonUndefined();
              var maybePromise = tryConvertToPromise(ret, promise);
              if (maybePromise instanceof Promise) {
                  if (this.cancelPromise != null) {
                      if (maybePromise._isCancelled()) {
                          var reason =
                              new CancellationError("late cancellation observer");
                          promise._attachExtraTrace(reason);
                          errorObj.e = reason;
                          return errorObj;
                      } else if (maybePromise.isPending()) {
                          maybePromise._attachCancellationCallback(
                              new FinallyHandlerCancelReaction(this));
                      }
                  }
                  return maybePromise._then(
                      succeed, fail, undefined, this, undefined);
              }
          }
      }

      if (promise.isRejected()) {
          checkCancel(this);
          errorObj.e = reasonOrValue;
          return errorObj;
      } else {
          checkCancel(this);
          return reasonOrValue;
      }
  }

  Promise.prototype._passThrough = function(handler, type, success, fail) {
      if (typeof handler !== "function") return this.then();
      return this._then(success,
                        fail,
                        undefined,
                        new PassThroughHandlerContext(this, type, handler),
                        undefined);
  };

  Promise.prototype.lastly =
  Promise.prototype["finally"] = function (handler) {
      return this._passThrough(handler,
                               0,
                               finallyHandler,
                               finallyHandler);
  };


  Promise.prototype.tap = function (handler) {
      return this._passThrough(handler, 1, finallyHandler);
  };

  Promise.prototype.tapCatch = function (handlerOrPredicate) {
      var len = arguments.length;
      if(len === 1) {
          return this._passThrough(handlerOrPredicate,
                                   1,
                                   undefined,
                                   finallyHandler);
      } else {
           var catchInstances = new Array(len - 1),
              j = 0, i;
          for (i = 0; i < len - 1; ++i) {
              var item = arguments[i];
              if (util.isObject(item)) {
                  catchInstances[j++] = item;
              } else {
                  return Promise.reject(new TypeError(
                      "tapCatch statement predicate: "
                      + "expecting an object but got " + util.classString(item)
                  ));
              }
          }
          catchInstances.length = j;
          var handler = arguments[i];
          return this._passThrough(catchFilter(catchInstances, handler, this),
                                   1,
                                   undefined,
                                   finallyHandler);
      }

  };

  return PassThroughHandlerContext;
  };

  },{"./catch_filter":7,"./util":36}],16:[function(_dereq_,module,exports){
  module.exports = function(Promise,
                            apiRejection,
                            INTERNAL,
                            tryConvertToPromise,
                            Proxyable,
                            debug) {
  var errors = _dereq_("./errors");
  var TypeError = errors.TypeError;
  var util = _dereq_("./util");
  var errorObj = util.errorObj;
  var tryCatch = util.tryCatch;
  var yieldHandlers = [];

  function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
      for (var i = 0; i < yieldHandlers.length; ++i) {
          traceParent._pushContext();
          var result = tryCatch(yieldHandlers[i])(value);
          traceParent._popContext();
          if (result === errorObj) {
              traceParent._pushContext();
              var ret = Promise.reject(errorObj.e);
              traceParent._popContext();
              return ret;
          }
          var maybePromise = tryConvertToPromise(result, traceParent);
          if (maybePromise instanceof Promise) return maybePromise;
      }
      return null;
  }

  function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
      if (debug.cancellation()) {
          var internal = new Promise(INTERNAL);
          var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
          this._promise = internal.lastly(function() {
              return _finallyPromise;
          });
          internal._captureStackTrace();
          internal._setOnCancel(this);
      } else {
          var promise = this._promise = new Promise(INTERNAL);
          promise._captureStackTrace();
      }
      this._stack = stack;
      this._generatorFunction = generatorFunction;
      this._receiver = receiver;
      this._generator = undefined;
      this._yieldHandlers = typeof yieldHandler === "function"
          ? [yieldHandler].concat(yieldHandlers)
          : yieldHandlers;
      this._yieldedPromise = null;
      this._cancellationPhase = false;
  }
  util.inherits(PromiseSpawn, Proxyable);

  PromiseSpawn.prototype._isResolved = function() {
      return this._promise === null;
  };

  PromiseSpawn.prototype._cleanup = function() {
      this._promise = this._generator = null;
      if (debug.cancellation() && this._finallyPromise !== null) {
          this._finallyPromise._fulfill();
          this._finallyPromise = null;
      }
  };

  PromiseSpawn.prototype._promiseCancelled = function() {
      if (this._isResolved()) return;
      var implementsReturn = typeof this._generator["return"] !== "undefined";

      var result;
      if (!implementsReturn) {
          var reason = new Promise.CancellationError(
              "generator .return() sentinel");
          Promise.coroutine.returnSentinel = reason;
          this._promise._attachExtraTrace(reason);
          this._promise._pushContext();
          result = tryCatch(this._generator["throw"]).call(this._generator,
                                                           reason);
          this._promise._popContext();
      } else {
          this._promise._pushContext();
          result = tryCatch(this._generator["return"]).call(this._generator,
                                                            undefined);
          this._promise._popContext();
      }
      this._cancellationPhase = true;
      this._yieldedPromise = null;
      this._continue(result);
  };

  PromiseSpawn.prototype._promiseFulfilled = function(value) {
      this._yieldedPromise = null;
      this._promise._pushContext();
      var result = tryCatch(this._generator.next).call(this._generator, value);
      this._promise._popContext();
      this._continue(result);
  };

  PromiseSpawn.prototype._promiseRejected = function(reason) {
      this._yieldedPromise = null;
      this._promise._attachExtraTrace(reason);
      this._promise._pushContext();
      var result = tryCatch(this._generator["throw"])
          .call(this._generator, reason);
      this._promise._popContext();
      this._continue(result);
  };

  PromiseSpawn.prototype._resultCancelled = function() {
      if (this._yieldedPromise instanceof Promise) {
          var promise = this._yieldedPromise;
          this._yieldedPromise = null;
          promise.cancel();
      }
  };

  PromiseSpawn.prototype.promise = function () {
      return this._promise;
  };

  PromiseSpawn.prototype._run = function () {
      this._generator = this._generatorFunction.call(this._receiver);
      this._receiver =
          this._generatorFunction = undefined;
      this._promiseFulfilled(undefined);
  };

  PromiseSpawn.prototype._continue = function (result) {
      var promise = this._promise;
      if (result === errorObj) {
          this._cleanup();
          if (this._cancellationPhase) {
              return promise.cancel();
          } else {
              return promise._rejectCallback(result.e, false);
          }
      }

      var value = result.value;
      if (result.done === true) {
          this._cleanup();
          if (this._cancellationPhase) {
              return promise.cancel();
          } else {
              return promise._resolveCallback(value);
          }
      } else {
          var maybePromise = tryConvertToPromise(value, this._promise);
          if (!(maybePromise instanceof Promise)) {
              maybePromise =
                  promiseFromYieldHandler(maybePromise,
                                          this._yieldHandlers,
                                          this._promise);
              if (maybePromise === null) {
                  this._promiseRejected(
                      new TypeError(
                          "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
                          "From coroutine:\u000a" +
                          this._stack.split("\n").slice(1, -7).join("\n")
                      )
                  );
                  return;
              }
          }
          maybePromise = maybePromise._target();
          var bitField = maybePromise._bitField;
          if (((bitField & 50397184) === 0)) {
              this._yieldedPromise = maybePromise;
              maybePromise._proxy(this, null);
          } else if (((bitField & 33554432) !== 0)) {
              Promise._async.invoke(
                  this._promiseFulfilled, this, maybePromise._value()
              );
          } else if (((bitField & 16777216) !== 0)) {
              Promise._async.invoke(
                  this._promiseRejected, this, maybePromise._reason()
              );
          } else {
              this._promiseCancelled();
          }
      }
  };

  Promise.coroutine = function (generatorFunction, options) {
      if (typeof generatorFunction !== "function") {
          throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var yieldHandler = Object(options).yieldHandler;
      var PromiseSpawn$ = PromiseSpawn;
      var stack = new Error().stack;
      return function () {
          var generator = generatorFunction.apply(this, arguments);
          var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                        stack);
          var ret = spawn.promise();
          spawn._generator = generator;
          spawn._promiseFulfilled(undefined);
          return ret;
      };
  };

  Promise.coroutine.addYieldHandler = function(fn) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util.classString(fn));
      }
      yieldHandlers.push(fn);
  };

  Promise.spawn = function (generatorFunction) {
      debug.deprecated("Promise.spawn()", "Promise.coroutine()");
      if (typeof generatorFunction !== "function") {
          return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var spawn = new PromiseSpawn(generatorFunction, this);
      var ret = spawn.promise();
      spawn._run(Promise.spawn);
      return ret;
  };
  };

  },{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
  module.exports =
  function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
           getDomain) {
  var util = _dereq_("./util");
  var canEvaluate = util.canEvaluate;
  var tryCatch = util.tryCatch;
  var errorObj = util.errorObj;

  Promise.join = function () {
      var last = arguments.length - 1;
      var fn;
      if (last > 0 && typeof arguments[last] === "function") {
          fn = arguments[last];
          if (false) {
              {
                  var ret;
              }
          }
      }
      var args = [].slice.call(arguments);    if (fn) args.pop();
      var ret = new PromiseArray(args).promise();
      return fn !== undefined ? ret.spread(fn) : ret;
  };

  };

  },{"./util":36}],18:[function(_dereq_,module,exports){
  module.exports = function(Promise,
                            PromiseArray,
                            apiRejection,
                            tryConvertToPromise,
                            INTERNAL,
                            debug) {
  var getDomain = Promise._getDomain;
  var util = _dereq_("./util");
  var tryCatch = util.tryCatch;
  var errorObj = util.errorObj;
  var async = Promise._async;

  function MappingPromiseArray(promises, fn, limit, _filter) {
      this.constructor$(promises);
      this._promise._captureStackTrace();
      var domain = getDomain();
      this._callback = domain === null ? fn : util.domainBind(domain, fn);
      this._preservedValues = _filter === INTERNAL
          ? new Array(this.length())
          : null;
      this._limit = limit;
      this._inFlight = 0;
      this._queue = [];
      async.invoke(this._asyncInit, this, undefined);
  }
  util.inherits(MappingPromiseArray, PromiseArray);

  MappingPromiseArray.prototype._asyncInit = function() {
      this._init$(undefined, -2);
  };

  MappingPromiseArray.prototype._init = function () {};

  MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
      var values = this._values;
      var length = this.length();
      var preservedValues = this._preservedValues;
      var limit = this._limit;

      if (index < 0) {
          index = (index * -1) - 1;
          values[index] = value;
          if (limit >= 1) {
              this._inFlight--;
              this._drainQueue();
              if (this._isResolved()) return true;
          }
      } else {
          if (limit >= 1 && this._inFlight >= limit) {
              values[index] = value;
              this._queue.push(index);
              return false;
          }
          if (preservedValues !== null) preservedValues[index] = value;

          var promise = this._promise;
          var callback = this._callback;
          var receiver = promise._boundValue();
          promise._pushContext();
          var ret = tryCatch(callback).call(receiver, value, index, length);
          var promiseCreated = promise._popContext();
          debug.checkForgottenReturns(
              ret,
              promiseCreated,
              preservedValues !== null ? "Promise.filter" : "Promise.map",
              promise
          );
          if (ret === errorObj) {
              this._reject(ret.e);
              return true;
          }

          var maybePromise = tryConvertToPromise(ret, this._promise);
          if (maybePromise instanceof Promise) {
              maybePromise = maybePromise._target();
              var bitField = maybePromise._bitField;
              if (((bitField & 50397184) === 0)) {
                  if (limit >= 1) this._inFlight++;
                  values[index] = maybePromise;
                  maybePromise._proxy(this, (index + 1) * -1);
                  return false;
              } else if (((bitField & 33554432) !== 0)) {
                  ret = maybePromise._value();
              } else if (((bitField & 16777216) !== 0)) {
                  this._reject(maybePromise._reason());
                  return true;
              } else {
                  this._cancel();
                  return true;
              }
          }
          values[index] = ret;
      }
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= length) {
          if (preservedValues !== null) {
              this._filter(values, preservedValues);
          } else {
              this._resolve(values);
          }
          return true;
      }
      return false;
  };

  MappingPromiseArray.prototype._drainQueue = function () {
      var queue = this._queue;
      var limit = this._limit;
      var values = this._values;
      while (queue.length > 0 && this._inFlight < limit) {
          if (this._isResolved()) return;
          var index = queue.pop();
          this._promiseFulfilled(values[index], index);
      }
  };

  MappingPromiseArray.prototype._filter = function (booleans, values) {
      var len = values.length;
      var ret = new Array(len);
      var j = 0;
      for (var i = 0; i < len; ++i) {
          if (booleans[i]) ret[j++] = values[i];
      }
      ret.length = j;
      this._resolve(ret);
  };

  MappingPromiseArray.prototype.preservedValues = function () {
      return this._preservedValues;
  };

  function map(promises, fn, options, _filter) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util.classString(fn));
      }

      var limit = 0;
      if (options !== undefined) {
          if (typeof options === "object" && options !== null) {
              if (typeof options.concurrency !== "number") {
                  return Promise.reject(
                      new TypeError("'concurrency' must be a number but it is " +
                                      util.classString(options.concurrency)));
              }
              limit = options.concurrency;
          } else {
              return Promise.reject(new TypeError(
                              "options argument must be an object but it is " +
                               util.classString(options)));
          }
      }
      limit = typeof limit === "number" &&
          isFinite(limit) && limit >= 1 ? limit : 0;
      return new MappingPromiseArray(promises, fn, limit, _filter).promise();
  }

  Promise.prototype.map = function (fn, options) {
      return map(this, fn, options, null);
  };

  Promise.map = function (promises, fn, options, _filter) {
      return map(promises, fn, options, _filter);
  };


  };

  },{"./util":36}],19:[function(_dereq_,module,exports){
  module.exports =
  function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
  var util = _dereq_("./util");
  var tryCatch = util.tryCatch;

  Promise.method = function (fn) {
      if (typeof fn !== "function") {
          throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
      }
      return function () {
          var ret = new Promise(INTERNAL);
          ret._captureStackTrace();
          ret._pushContext();
          var value = tryCatch(fn).apply(this, arguments);
          var promiseCreated = ret._popContext();
          debug.checkForgottenReturns(
              value, promiseCreated, "Promise.method", ret);
          ret._resolveFromSyncValue(value);
          return ret;
      };
  };

  Promise.attempt = Promise["try"] = function (fn) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util.classString(fn));
      }
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      ret._pushContext();
      var value;
      if (arguments.length > 1) {
          debug.deprecated("calling Promise.try with more than 1 argument");
          var arg = arguments[1];
          var ctx = arguments[2];
          value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                    : tryCatch(fn).call(ctx, arg);
      } else {
          value = tryCatch(fn)();
      }
      var promiseCreated = ret._popContext();
      debug.checkForgottenReturns(
          value, promiseCreated, "Promise.try", ret);
      ret._resolveFromSyncValue(value);
      return ret;
  };

  Promise.prototype._resolveFromSyncValue = function (value) {
      if (value === util.errorObj) {
          this._rejectCallback(value.e, false);
      } else {
          this._resolveCallback(value, true);
      }
  };
  };

  },{"./util":36}],20:[function(_dereq_,module,exports){
  var util = _dereq_("./util");
  var maybeWrapAsError = util.maybeWrapAsError;
  var errors = _dereq_("./errors");
  var OperationalError = errors.OperationalError;
  var es5 = _dereq_("./es5");

  function isUntypedError(obj) {
      return obj instanceof Error &&
          es5.getPrototypeOf(obj) === Error.prototype;
  }

  var rErrorKey = /^(?:name|message|stack|cause)$/;
  function wrapAsOperationalError(obj) {
      var ret;
      if (isUntypedError(obj)) {
          ret = new OperationalError(obj);
          ret.name = obj.name;
          ret.message = obj.message;
          ret.stack = obj.stack;
          var keys = es5.keys(obj);
          for (var i = 0; i < keys.length; ++i) {
              var key = keys[i];
              if (!rErrorKey.test(key)) {
                  ret[key] = obj[key];
              }
          }
          return ret;
      }
      util.markAsOriginatingFromRejection(obj);
      return obj;
  }

  function nodebackForPromise(promise, multiArgs) {
      return function(err, value) {
          if (promise === null) return;
          if (err) {
              var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
              promise._attachExtraTrace(wrapped);
              promise._reject(wrapped);
          } else if (!multiArgs) {
              promise._fulfill(value);
          } else {
              var args = [].slice.call(arguments, 1);            promise._fulfill(args);
          }
          promise = null;
      };
  }

  module.exports = nodebackForPromise;

  },{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
  module.exports = function(Promise) {
  var util = _dereq_("./util");
  var async = Promise._async;
  var tryCatch = util.tryCatch;
  var errorObj = util.errorObj;

  function spreadAdapter(val, nodeback) {
      var promise = this;
      if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
      var ret =
          tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }

  function successAdapter(val, nodeback) {
      var promise = this;
      var receiver = promise._boundValue();
      var ret = val === undefined
          ? tryCatch(nodeback).call(receiver, null)
          : tryCatch(nodeback).call(receiver, null, val);
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }
  function errorAdapter(reason, nodeback) {
      var promise = this;
      if (!reason) {
          var newReason = new Error(reason + "");
          newReason.cause = reason;
          reason = newReason;
      }
      var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }

  Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                       options) {
      if (typeof nodeback == "function") {
          var adapter = successAdapter;
          if (options !== undefined && Object(options).spread) {
              adapter = spreadAdapter;
          }
          this._then(
              adapter,
              errorAdapter,
              undefined,
              this,
              nodeback
          );
      }
      return this;
  };
  };

  },{"./util":36}],22:[function(_dereq_,module,exports){
  module.exports = function() {
  var makeSelfResolutionError = function () {
      return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
  };
  var reflectHandler = function() {
      return new Promise.PromiseInspection(this._target());
  };
  var apiRejection = function(msg) {
      return Promise.reject(new TypeError(msg));
  };
  function Proxyable() {}
  var UNDEFINED_BINDING = {};
  var util = _dereq_("./util");

  var getDomain;
  if (util.isNode) {
      getDomain = function() {
          var ret = process.domain;
          if (ret === undefined) ret = null;
          return ret;
      };
  } else {
      getDomain = function() {
          return null;
      };
  }
  util.notEnumerableProp(Promise, "_getDomain", getDomain);

  var es5 = _dereq_("./es5");
  var Async = _dereq_("./async");
  var async = new Async();
  es5.defineProperty(Promise, "_async", {value: async});
  var errors = _dereq_("./errors");
  var TypeError = Promise.TypeError = errors.TypeError;
  Promise.RangeError = errors.RangeError;
  var CancellationError = Promise.CancellationError = errors.CancellationError;
  Promise.TimeoutError = errors.TimeoutError;
  Promise.OperationalError = errors.OperationalError;
  Promise.RejectionError = errors.OperationalError;
  Promise.AggregateError = errors.AggregateError;
  var INTERNAL = function(){};
  var APPLY = {};
  var NEXT_FILTER = {};
  var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
  var PromiseArray =
      _dereq_("./promise_array")(Promise, INTERNAL,
                                 tryConvertToPromise, apiRejection, Proxyable);
  var Context = _dereq_("./context")(Promise);
   /*jshint unused:false*/
  var createContext = Context.create;
  var debug = _dereq_("./debuggability")(Promise, Context);
  var CapturedTrace = debug.CapturedTrace;
  var PassThroughHandlerContext =
      _dereq_("./finally")(Promise, tryConvertToPromise, NEXT_FILTER);
  var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
  var nodebackForPromise = _dereq_("./nodeback");
  var errorObj = util.errorObj;
  var tryCatch = util.tryCatch;
  function check(self, executor) {
      if (self == null || self.constructor !== Promise) {
          throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      if (typeof executor !== "function") {
          throw new TypeError("expecting a function but got " + util.classString(executor));
      }

  }

  function Promise(executor) {
      if (executor !== INTERNAL) {
          check(this, executor);
      }
      this._bitField = 0;
      this._fulfillmentHandler0 = undefined;
      this._rejectionHandler0 = undefined;
      this._promise0 = undefined;
      this._receiver0 = undefined;
      this._resolveFromExecutor(executor);
      this._promiseCreated();
      this._fireEvent("promiseCreated", this);
  }

  Promise.prototype.toString = function () {
      return "[object Promise]";
  };

  Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
      var len = arguments.length;
      if (len > 1) {
          var catchInstances = new Array(len - 1),
              j = 0, i;
          for (i = 0; i < len - 1; ++i) {
              var item = arguments[i];
              if (util.isObject(item)) {
                  catchInstances[j++] = item;
              } else {
                  return apiRejection("Catch statement predicate: " +
                      "expecting an object but got " + util.classString(item));
              }
          }
          catchInstances.length = j;
          fn = arguments[i];
          return this.then(undefined, catchFilter(catchInstances, fn, this));
      }
      return this.then(undefined, fn);
  };

  Promise.prototype.reflect = function () {
      return this._then(reflectHandler,
          reflectHandler, undefined, this, undefined);
  };

  Promise.prototype.then = function (didFulfill, didReject) {
      if (debug.warnings() && arguments.length > 0 &&
          typeof didFulfill !== "function" &&
          typeof didReject !== "function") {
          var msg = ".then() only accepts functions but was passed: " +
                  util.classString(didFulfill);
          if (arguments.length > 1) {
              msg += ", " + util.classString(didReject);
          }
          this._warn(msg);
      }
      return this._then(didFulfill, didReject, undefined, undefined, undefined);
  };

  Promise.prototype.done = function (didFulfill, didReject) {
      var promise =
          this._then(didFulfill, didReject, undefined, undefined, undefined);
      promise._setIsFinal();
  };

  Promise.prototype.spread = function (fn) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util.classString(fn));
      }
      return this.all()._then(fn, undefined, undefined, APPLY, undefined);
  };

  Promise.prototype.toJSON = function () {
      var ret = {
          isFulfilled: false,
          isRejected: false,
          fulfillmentValue: undefined,
          rejectionReason: undefined
      };
      if (this.isFulfilled()) {
          ret.fulfillmentValue = this.value();
          ret.isFulfilled = true;
      } else if (this.isRejected()) {
          ret.rejectionReason = this.reason();
          ret.isRejected = true;
      }
      return ret;
  };

  Promise.prototype.all = function () {
      if (arguments.length > 0) {
          this._warn(".all() was passed arguments but it does not take any");
      }
      return new PromiseArray(this).promise();
  };

  Promise.prototype.error = function (fn) {
      return this.caught(util.originatesFromRejection, fn);
  };

  Promise.getNewLibraryCopy = module.exports;

  Promise.is = function (val) {
      return val instanceof Promise;
  };

  Promise.fromNode = Promise.fromCallback = function(fn) {
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                           : false;
      var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
      if (result === errorObj) {
          ret._rejectCallback(result.e, true);
      }
      if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
      return ret;
  };

  Promise.all = function (promises) {
      return new PromiseArray(promises).promise();
  };

  Promise.cast = function (obj) {
      var ret = tryConvertToPromise(obj);
      if (!(ret instanceof Promise)) {
          ret = new Promise(INTERNAL);
          ret._captureStackTrace();
          ret._setFulfilled();
          ret._rejectionHandler0 = obj;
      }
      return ret;
  };

  Promise.resolve = Promise.fulfilled = Promise.cast;

  Promise.reject = Promise.rejected = function (reason) {
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      ret._rejectCallback(reason, true);
      return ret;
  };

  Promise.setScheduler = function(fn) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util.classString(fn));
      }
      return async.setScheduler(fn);
  };

  Promise.prototype._then = function (
      didFulfill,
      didReject,
      _,    receiver,
      internalData
  ) {
      var haveInternalData = internalData !== undefined;
      var promise = haveInternalData ? internalData : new Promise(INTERNAL);
      var target = this._target();
      var bitField = target._bitField;

      if (!haveInternalData) {
          promise._propagateFrom(this, 3);
          promise._captureStackTrace();
          if (receiver === undefined &&
              ((this._bitField & 2097152) !== 0)) {
              if (!((bitField & 50397184) === 0)) {
                  receiver = this._boundValue();
              } else {
                  receiver = target === this ? undefined : this._boundTo;
              }
          }
          this._fireEvent("promiseChained", this, promise);
      }

      var domain = getDomain();
      if (!((bitField & 50397184) === 0)) {
          var handler, value, settler = target._settlePromiseCtx;
          if (((bitField & 33554432) !== 0)) {
              value = target._rejectionHandler0;
              handler = didFulfill;
          } else if (((bitField & 16777216) !== 0)) {
              value = target._fulfillmentHandler0;
              handler = didReject;
              target._unsetRejectionIsUnhandled();
          } else {
              settler = target._settlePromiseLateCancellationObserver;
              value = new CancellationError("late cancellation observer");
              target._attachExtraTrace(value);
              handler = didReject;
          }

          async.invoke(settler, target, {
              handler: domain === null ? handler
                  : (typeof handler === "function" &&
                      util.domainBind(domain, handler)),
              promise: promise,
              receiver: receiver,
              value: value
          });
      } else {
          target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
      }

      return promise;
  };

  Promise.prototype._length = function () {
      return this._bitField & 65535;
  };

  Promise.prototype._isFateSealed = function () {
      return (this._bitField & 117506048) !== 0;
  };

  Promise.prototype._isFollowing = function () {
      return (this._bitField & 67108864) === 67108864;
  };

  Promise.prototype._setLength = function (len) {
      this._bitField = (this._bitField & -65536) |
          (len & 65535);
  };

  Promise.prototype._setFulfilled = function () {
      this._bitField = this._bitField | 33554432;
      this._fireEvent("promiseFulfilled", this);
  };

  Promise.prototype._setRejected = function () {
      this._bitField = this._bitField | 16777216;
      this._fireEvent("promiseRejected", this);
  };

  Promise.prototype._setFollowing = function () {
      this._bitField = this._bitField | 67108864;
      this._fireEvent("promiseResolved", this);
  };

  Promise.prototype._setIsFinal = function () {
      this._bitField = this._bitField | 4194304;
  };

  Promise.prototype._isFinal = function () {
      return (this._bitField & 4194304) > 0;
  };

  Promise.prototype._unsetCancelled = function() {
      this._bitField = this._bitField & (~65536);
  };

  Promise.prototype._setCancelled = function() {
      this._bitField = this._bitField | 65536;
      this._fireEvent("promiseCancelled", this);
  };

  Promise.prototype._setWillBeCancelled = function() {
      this._bitField = this._bitField | 8388608;
  };

  Promise.prototype._setAsyncGuaranteed = function() {
      if (async.hasCustomScheduler()) return;
      this._bitField = this._bitField | 134217728;
  };

  Promise.prototype._receiverAt = function (index) {
      var ret = index === 0 ? this._receiver0 : this[
              index * 4 - 4 + 3];
      if (ret === UNDEFINED_BINDING) {
          return undefined;
      } else if (ret === undefined && this._isBound()) {
          return this._boundValue();
      }
      return ret;
  };

  Promise.prototype._promiseAt = function (index) {
      return this[
              index * 4 - 4 + 2];
  };

  Promise.prototype._fulfillmentHandlerAt = function (index) {
      return this[
              index * 4 - 4 + 0];
  };

  Promise.prototype._rejectionHandlerAt = function (index) {
      return this[
              index * 4 - 4 + 1];
  };

  Promise.prototype._boundValue = function() {};

  Promise.prototype._migrateCallback0 = function (follower) {
      var bitField = follower._bitField;
      var fulfill = follower._fulfillmentHandler0;
      var reject = follower._rejectionHandler0;
      var promise = follower._promise0;
      var receiver = follower._receiverAt(0);
      if (receiver === undefined) receiver = UNDEFINED_BINDING;
      this._addCallbacks(fulfill, reject, promise, receiver, null);
  };

  Promise.prototype._migrateCallbackAt = function (follower, index) {
      var fulfill = follower._fulfillmentHandlerAt(index);
      var reject = follower._rejectionHandlerAt(index);
      var promise = follower._promiseAt(index);
      var receiver = follower._receiverAt(index);
      if (receiver === undefined) receiver = UNDEFINED_BINDING;
      this._addCallbacks(fulfill, reject, promise, receiver, null);
  };

  Promise.prototype._addCallbacks = function (
      fulfill,
      reject,
      promise,
      receiver,
      domain
  ) {
      var index = this._length();

      if (index >= 65535 - 4) {
          index = 0;
          this._setLength(0);
      }

      if (index === 0) {
          this._promise0 = promise;
          this._receiver0 = receiver;
          if (typeof fulfill === "function") {
              this._fulfillmentHandler0 =
                  domain === null ? fulfill : util.domainBind(domain, fulfill);
          }
          if (typeof reject === "function") {
              this._rejectionHandler0 =
                  domain === null ? reject : util.domainBind(domain, reject);
          }
      } else {
          var base = index * 4 - 4;
          this[base + 2] = promise;
          this[base + 3] = receiver;
          if (typeof fulfill === "function") {
              this[base + 0] =
                  domain === null ? fulfill : util.domainBind(domain, fulfill);
          }
          if (typeof reject === "function") {
              this[base + 1] =
                  domain === null ? reject : util.domainBind(domain, reject);
          }
      }
      this._setLength(index + 1);
      return index;
  };

  Promise.prototype._proxy = function (proxyable, arg) {
      this._addCallbacks(undefined, undefined, arg, proxyable, null);
  };

  Promise.prototype._resolveCallback = function(value, shouldBind) {
      if (((this._bitField & 117506048) !== 0)) return;
      if (value === this)
          return this._rejectCallback(makeSelfResolutionError(), false);
      var maybePromise = tryConvertToPromise(value, this);
      if (!(maybePromise instanceof Promise)) return this._fulfill(value);

      if (shouldBind) this._propagateFrom(maybePromise, 2);

      var promise = maybePromise._target();

      if (promise === this) {
          this._reject(makeSelfResolutionError());
          return;
      }

      var bitField = promise._bitField;
      if (((bitField & 50397184) === 0)) {
          var len = this._length();
          if (len > 0) promise._migrateCallback0(this);
          for (var i = 1; i < len; ++i) {
              promise._migrateCallbackAt(this, i);
          }
          this._setFollowing();
          this._setLength(0);
          this._setFollowee(promise);
      } else if (((bitField & 33554432) !== 0)) {
          this._fulfill(promise._value());
      } else if (((bitField & 16777216) !== 0)) {
          this._reject(promise._reason());
      } else {
          var reason = new CancellationError("late cancellation observer");
          promise._attachExtraTrace(reason);
          this._reject(reason);
      }
  };

  Promise.prototype._rejectCallback =
  function(reason, synchronous, ignoreNonErrorWarnings) {
      var trace = util.ensureErrorObject(reason);
      var hasStack = trace === reason;
      if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
          var message = "a promise was rejected with a non-error: " +
              util.classString(reason);
          this._warn(message, true);
      }
      this._attachExtraTrace(trace, synchronous ? hasStack : false);
      this._reject(reason);
  };

  Promise.prototype._resolveFromExecutor = function (executor) {
      if (executor === INTERNAL) return;
      var promise = this;
      this._captureStackTrace();
      this._pushContext();
      var synchronous = true;
      var r = this._execute(executor, function(value) {
          promise._resolveCallback(value);
      }, function (reason) {
          promise._rejectCallback(reason, synchronous);
      });
      synchronous = false;
      this._popContext();

      if (r !== undefined) {
          promise._rejectCallback(r, true);
      }
  };

  Promise.prototype._settlePromiseFromHandler = function (
      handler, receiver, value, promise
  ) {
      var bitField = promise._bitField;
      if (((bitField & 65536) !== 0)) return;
      promise._pushContext();
      var x;
      if (receiver === APPLY) {
          if (!value || typeof value.length !== "number") {
              x = errorObj;
              x.e = new TypeError("cannot .spread() a non-array: " +
                                      util.classString(value));
          } else {
              x = tryCatch(handler).apply(this._boundValue(), value);
          }
      } else {
          x = tryCatch(handler).call(receiver, value);
      }
      var promiseCreated = promise._popContext();
      bitField = promise._bitField;
      if (((bitField & 65536) !== 0)) return;

      if (x === NEXT_FILTER) {
          promise._reject(value);
      } else if (x === errorObj) {
          promise._rejectCallback(x.e, false);
      } else {
          debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
          promise._resolveCallback(x);
      }
  };

  Promise.prototype._target = function() {
      var ret = this;
      while (ret._isFollowing()) ret = ret._followee();
      return ret;
  };

  Promise.prototype._followee = function() {
      return this._rejectionHandler0;
  };

  Promise.prototype._setFollowee = function(promise) {
      this._rejectionHandler0 = promise;
  };

  Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
      var isPromise = promise instanceof Promise;
      var bitField = this._bitField;
      var asyncGuaranteed = ((bitField & 134217728) !== 0);
      if (((bitField & 65536) !== 0)) {
          if (isPromise) promise._invokeInternalOnCancel();

          if (receiver instanceof PassThroughHandlerContext &&
              receiver.isFinallyHandler()) {
              receiver.cancelPromise = promise;
              if (tryCatch(handler).call(receiver, value) === errorObj) {
                  promise._reject(errorObj.e);
              }
          } else if (handler === reflectHandler) {
              promise._fulfill(reflectHandler.call(receiver));
          } else if (receiver instanceof Proxyable) {
              receiver._promiseCancelled(promise);
          } else if (isPromise || promise instanceof PromiseArray) {
              promise._cancel();
          } else {
              receiver.cancel();
          }
      } else if (typeof handler === "function") {
          if (!isPromise) {
              handler.call(receiver, value, promise);
          } else {
              if (asyncGuaranteed) promise._setAsyncGuaranteed();
              this._settlePromiseFromHandler(handler, receiver, value, promise);
          }
      } else if (receiver instanceof Proxyable) {
          if (!receiver._isResolved()) {
              if (((bitField & 33554432) !== 0)) {
                  receiver._promiseFulfilled(value, promise);
              } else {
                  receiver._promiseRejected(value, promise);
              }
          }
      } else if (isPromise) {
          if (asyncGuaranteed) promise._setAsyncGuaranteed();
          if (((bitField & 33554432) !== 0)) {
              promise._fulfill(value);
          } else {
              promise._reject(value);
          }
      }
  };

  Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
      var handler = ctx.handler;
      var promise = ctx.promise;
      var receiver = ctx.receiver;
      var value = ctx.value;
      if (typeof handler === "function") {
          if (!(promise instanceof Promise)) {
              handler.call(receiver, value, promise);
          } else {
              this._settlePromiseFromHandler(handler, receiver, value, promise);
          }
      } else if (promise instanceof Promise) {
          promise._reject(value);
      }
  };

  Promise.prototype._settlePromiseCtx = function(ctx) {
      this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
  };

  Promise.prototype._settlePromise0 = function(handler, value, bitField) {
      var promise = this._promise0;
      var receiver = this._receiverAt(0);
      this._promise0 = undefined;
      this._receiver0 = undefined;
      this._settlePromise(promise, handler, receiver, value);
  };

  Promise.prototype._clearCallbackDataAtIndex = function(index) {
      var base = index * 4 - 4;
      this[base + 2] =
      this[base + 3] =
      this[base + 0] =
      this[base + 1] = undefined;
  };

  Promise.prototype._fulfill = function (value) {
      var bitField = this._bitField;
      if (((bitField & 117506048) >>> 16)) return;
      if (value === this) {
          var err = makeSelfResolutionError();
          this._attachExtraTrace(err);
          return this._reject(err);
      }
      this._setFulfilled();
      this._rejectionHandler0 = value;

      if ((bitField & 65535) > 0) {
          if (((bitField & 134217728) !== 0)) {
              this._settlePromises();
          } else {
              async.settlePromises(this);
          }
          this._dereferenceTrace();
      }
  };

  Promise.prototype._reject = function (reason) {
      var bitField = this._bitField;
      if (((bitField & 117506048) >>> 16)) return;
      this._setRejected();
      this._fulfillmentHandler0 = reason;

      if (this._isFinal()) {
          return async.fatalError(reason, util.isNode);
      }

      if ((bitField & 65535) > 0) {
          async.settlePromises(this);
      } else {
          this._ensurePossibleRejectionHandled();
      }
  };

  Promise.prototype._fulfillPromises = function (len, value) {
      for (var i = 1; i < len; i++) {
          var handler = this._fulfillmentHandlerAt(i);
          var promise = this._promiseAt(i);
          var receiver = this._receiverAt(i);
          this._clearCallbackDataAtIndex(i);
          this._settlePromise(promise, handler, receiver, value);
      }
  };

  Promise.prototype._rejectPromises = function (len, reason) {
      for (var i = 1; i < len; i++) {
          var handler = this._rejectionHandlerAt(i);
          var promise = this._promiseAt(i);
          var receiver = this._receiverAt(i);
          this._clearCallbackDataAtIndex(i);
          this._settlePromise(promise, handler, receiver, reason);
      }
  };

  Promise.prototype._settlePromises = function () {
      var bitField = this._bitField;
      var len = (bitField & 65535);

      if (len > 0) {
          if (((bitField & 16842752) !== 0)) {
              var reason = this._fulfillmentHandler0;
              this._settlePromise0(this._rejectionHandler0, reason, bitField);
              this._rejectPromises(len, reason);
          } else {
              var value = this._rejectionHandler0;
              this._settlePromise0(this._fulfillmentHandler0, value, bitField);
              this._fulfillPromises(len, value);
          }
          this._setLength(0);
      }
      this._clearCancellationData();
  };

  Promise.prototype._settledValue = function() {
      var bitField = this._bitField;
      if (((bitField & 33554432) !== 0)) {
          return this._rejectionHandler0;
      } else if (((bitField & 16777216) !== 0)) {
          return this._fulfillmentHandler0;
      }
  };

  function deferResolve(v) {this.promise._resolveCallback(v);}
  function deferReject(v) {this.promise._rejectCallback(v, false);}

  Promise.defer = Promise.pending = function() {
      debug.deprecated("Promise.defer", "new Promise");
      var promise = new Promise(INTERNAL);
      return {
          promise: promise,
          resolve: deferResolve,
          reject: deferReject
      };
  };

  util.notEnumerableProp(Promise,
                         "_makeSelfResolutionError",
                         makeSelfResolutionError);

  _dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
      debug);
  _dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
  _dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
  _dereq_("./direct_resolve")(Promise);
  _dereq_("./synchronous_inspection")(Promise);
  _dereq_("./join")(
      Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
  Promise.Promise = Promise;
  Promise.version = "3.5.3";
  _dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
  _dereq_('./call_get.js')(Promise);
  _dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
  _dereq_('./timers.js')(Promise, INTERNAL, debug);
  _dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
  _dereq_('./nodeify.js')(Promise);
  _dereq_('./promisify.js')(Promise, INTERNAL);
  _dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
  _dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
  _dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
  _dereq_('./settle.js')(Promise, PromiseArray, debug);
  _dereq_('./some.js')(Promise, PromiseArray, apiRejection);
  _dereq_('./filter.js')(Promise, INTERNAL);
  _dereq_('./each.js')(Promise, INTERNAL);
  _dereq_('./any.js')(Promise);
                                                           
      util.toFastProperties(Promise);                                          
      util.toFastProperties(Promise.prototype);                                
      function fillTypes(value) {                                              
          var p = new Promise(INTERNAL);                                       
          p._fulfillmentHandler0 = value;                                      
          p._rejectionHandler0 = value;                                        
          p._promise0 = value;                                                 
          p._receiver0 = value;                                                
      }                                                                        
      // Complete slack tracking, opt out of field-type tracking and           
      // stabilize map                                                         
      fillTypes({a: 1});                                                       
      fillTypes({b: 2});                                                       
      fillTypes({c: 3});                                                       
      fillTypes(1);                                                            
      fillTypes(function(){});                                                 
      fillTypes(undefined);                                                    
      fillTypes(false);                                                        
      fillTypes(new Promise(INTERNAL));                                        
      debug.setBounds(Async.firstLineError, util.lastLineError);               
      return Promise;                                                          

  };

  },{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL, tryConvertToPromise,
      apiRejection, Proxyable) {
  var util = _dereq_("./util");
  var isArray = util.isArray;

  function toResolutionValue(val) {
      switch(val) {
      case -2: return [];
      case -3: return {};
      case -6: return new Map();
      }
  }

  function PromiseArray(values) {
      var promise = this._promise = new Promise(INTERNAL);
      if (values instanceof Promise) {
          promise._propagateFrom(values, 3);
      }
      promise._setOnCancel(this);
      this._values = values;
      this._length = 0;
      this._totalResolved = 0;
      this._init(undefined, -2);
  }
  util.inherits(PromiseArray, Proxyable);

  PromiseArray.prototype.length = function () {
      return this._length;
  };

  PromiseArray.prototype.promise = function () {
      return this._promise;
  };

  PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
      var values = tryConvertToPromise(this._values, this._promise);
      if (values instanceof Promise) {
          values = values._target();
          var bitField = values._bitField;
          this._values = values;

          if (((bitField & 50397184) === 0)) {
              this._promise._setAsyncGuaranteed();
              return values._then(
                  init,
                  this._reject,
                  undefined,
                  this,
                  resolveValueIfEmpty
             );
          } else if (((bitField & 33554432) !== 0)) {
              values = values._value();
          } else if (((bitField & 16777216) !== 0)) {
              return this._reject(values._reason());
          } else {
              return this._cancel();
          }
      }
      values = util.asArray(values);
      if (values === null) {
          var err = apiRejection(
              "expecting an array or an iterable object but got " + util.classString(values)).reason();
          this._promise._rejectCallback(err, false);
          return;
      }

      if (values.length === 0) {
          if (resolveValueIfEmpty === -5) {
              this._resolveEmptyArray();
          }
          else {
              this._resolve(toResolutionValue(resolveValueIfEmpty));
          }
          return;
      }
      this._iterate(values);
  };

  PromiseArray.prototype._iterate = function(values) {
      var len = this.getActualLength(values.length);
      this._length = len;
      this._values = this.shouldCopyValues() ? new Array(len) : this._values;
      var result = this._promise;
      var isResolved = false;
      var bitField = null;
      for (var i = 0; i < len; ++i) {
          var maybePromise = tryConvertToPromise(values[i], result);

          if (maybePromise instanceof Promise) {
              maybePromise = maybePromise._target();
              bitField = maybePromise._bitField;
          } else {
              bitField = null;
          }

          if (isResolved) {
              if (bitField !== null) {
                  maybePromise.suppressUnhandledRejections();
              }
          } else if (bitField !== null) {
              if (((bitField & 50397184) === 0)) {
                  maybePromise._proxy(this, i);
                  this._values[i] = maybePromise;
              } else if (((bitField & 33554432) !== 0)) {
                  isResolved = this._promiseFulfilled(maybePromise._value(), i);
              } else if (((bitField & 16777216) !== 0)) {
                  isResolved = this._promiseRejected(maybePromise._reason(), i);
              } else {
                  isResolved = this._promiseCancelled(i);
              }
          } else {
              isResolved = this._promiseFulfilled(maybePromise, i);
          }
      }
      if (!isResolved) result._setAsyncGuaranteed();
  };

  PromiseArray.prototype._isResolved = function () {
      return this._values === null;
  };

  PromiseArray.prototype._resolve = function (value) {
      this._values = null;
      this._promise._fulfill(value);
  };

  PromiseArray.prototype._cancel = function() {
      if (this._isResolved() || !this._promise._isCancellable()) return;
      this._values = null;
      this._promise._cancel();
  };

  PromiseArray.prototype._reject = function (reason) {
      this._values = null;
      this._promise._rejectCallback(reason, false);
  };

  PromiseArray.prototype._promiseFulfilled = function (value, index) {
      this._values[index] = value;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          this._resolve(this._values);
          return true;
      }
      return false;
  };

  PromiseArray.prototype._promiseCancelled = function() {
      this._cancel();
      return true;
  };

  PromiseArray.prototype._promiseRejected = function (reason) {
      this._totalResolved++;
      this._reject(reason);
      return true;
  };

  PromiseArray.prototype._resultCancelled = function() {
      if (this._isResolved()) return;
      var values = this._values;
      this._cancel();
      if (values instanceof Promise) {
          values.cancel();
      } else {
          for (var i = 0; i < values.length; ++i) {
              if (values[i] instanceof Promise) {
                  values[i].cancel();
              }
          }
      }
  };

  PromiseArray.prototype.shouldCopyValues = function () {
      return true;
  };

  PromiseArray.prototype.getActualLength = function (len) {
      return len;
  };

  return PromiseArray;
  };

  },{"./util":36}],24:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL) {
  var THIS = {};
  var util = _dereq_("./util");
  var nodebackForPromise = _dereq_("./nodeback");
  var withAppended = util.withAppended;
  var maybeWrapAsError = util.maybeWrapAsError;
  var canEvaluate = util.canEvaluate;
  var TypeError = _dereq_("./errors").TypeError;
  var defaultSuffix = "Async";
  var defaultPromisified = {__isPromisified__: true};
  var noCopyProps = [
      "arity",    "length",
      "name",
      "arguments",
      "caller",
      "callee",
      "prototype",
      "__isPromisified__"
  ];
  var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

  var defaultFilter = function(name) {
      return util.isIdentifier(name) &&
          name.charAt(0) !== "_" &&
          name !== "constructor";
  };

  function propsFilter(key) {
      return !noCopyPropsPattern.test(key);
  }

  function isPromisified(fn) {
      try {
          return fn.__isPromisified__ === true;
      }
      catch (e) {
          return false;
      }
  }

  function hasPromisified(obj, key, suffix) {
      var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                              defaultPromisified);
      return val ? isPromisified(val) : false;
  }
  function checkValid(ret, suffix, suffixRegexp) {
      for (var i = 0; i < ret.length; i += 2) {
          var key = ret[i];
          if (suffixRegexp.test(key)) {
              var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
              for (var j = 0; j < ret.length; j += 2) {
                  if (ret[j] === keyWithoutAsyncSuffix) {
                      throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                          .replace("%s", suffix));
                  }
              }
          }
      }
  }

  function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
      var keys = util.inheritedDataKeys(obj);
      var ret = [];
      for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var value = obj[key];
          var passesDefaultFilter = filter === defaultFilter
              ? true : defaultFilter(key, value, obj);
          if (typeof value === "function" &&
              !isPromisified(value) &&
              !hasPromisified(obj, key, suffix) &&
              filter(key, value, obj, passesDefaultFilter)) {
              ret.push(key, value);
          }
      }
      checkValid(ret, suffix, suffixRegexp);
      return ret;
  }

  var escapeIdentRegex = function(str) {
      return str.replace(/([$])/, "\\$");
  };

  var makeNodePromisifiedEval;

  function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
      var defaultThis = (function() {return this;})();
      var method = callback;
      if (typeof method === "string") {
          callback = fn;
      }
      function promisified() {
          var _receiver = receiver;
          if (receiver === THIS) _receiver = this;
          var promise = new Promise(INTERNAL);
          promise._captureStackTrace();
          var cb = typeof method === "string" && this !== defaultThis
              ? this[method] : callback;
          var fn = nodebackForPromise(promise, multiArgs);
          try {
              cb.apply(_receiver, withAppended(arguments, fn));
          } catch(e) {
              promise._rejectCallback(maybeWrapAsError(e), true, true);
          }
          if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
          return promise;
      }
      util.notEnumerableProp(promisified, "__isPromisified__", true);
      return promisified;
  }

  var makeNodePromisified = canEvaluate
      ? makeNodePromisifiedEval
      : makeNodePromisifiedClosure;

  function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
      var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
      var methods =
          promisifiableMethods(obj, suffix, suffixRegexp, filter);

      for (var i = 0, len = methods.length; i < len; i+= 2) {
          var key = methods[i];
          var fn = methods[i+1];
          var promisifiedKey = key + suffix;
          if (promisifier === makeNodePromisified) {
              obj[promisifiedKey] =
                  makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
          } else {
              var promisified = promisifier(fn, function() {
                  return makeNodePromisified(key, THIS, key,
                                             fn, suffix, multiArgs);
              });
              util.notEnumerableProp(promisified, "__isPromisified__", true);
              obj[promisifiedKey] = promisified;
          }
      }
      util.toFastProperties(obj);
      return obj;
  }

  function promisify(callback, receiver, multiArgs) {
      return makeNodePromisified(callback, receiver, undefined,
                                  callback, null, multiArgs);
  }

  Promise.promisify = function (fn, options) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util.classString(fn));
      }
      if (isPromisified(fn)) {
          return fn;
      }
      options = Object(options);
      var receiver = options.context === undefined ? THIS : options.context;
      var multiArgs = !!options.multiArgs;
      var ret = promisify(fn, receiver, multiArgs);
      util.copyDescriptors(fn, ret, propsFilter);
      return ret;
  };

  Promise.promisifyAll = function (target, options) {
      if (typeof target !== "function" && typeof target !== "object") {
          throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      options = Object(options);
      var multiArgs = !!options.multiArgs;
      var suffix = options.suffix;
      if (typeof suffix !== "string") suffix = defaultSuffix;
      var filter = options.filter;
      if (typeof filter !== "function") filter = defaultFilter;
      var promisifier = options.promisifier;
      if (typeof promisifier !== "function") promisifier = makeNodePromisified;

      if (!util.isIdentifier(suffix)) {
          throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }

      var keys = util.inheritedDataKeys(target);
      for (var i = 0; i < keys.length; ++i) {
          var value = target[keys[i]];
          if (keys[i] !== "constructor" &&
              util.isClass(value)) {
              promisifyAll(value.prototype, suffix, filter, promisifier,
                  multiArgs);
              promisifyAll(value, suffix, filter, promisifier, multiArgs);
          }
      }

      return promisifyAll(target, suffix, filter, promisifier, multiArgs);
  };
  };


  },{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
  module.exports = function(
      Promise, PromiseArray, tryConvertToPromise, apiRejection) {
  var util = _dereq_("./util");
  var isObject = util.isObject;
  var es5 = _dereq_("./es5");
  var Es6Map;
  if (typeof Map === "function") Es6Map = Map;

  var mapToEntries = (function() {
      var index = 0;
      var size = 0;

      function extractEntry(value, key) {
          this[index] = value;
          this[index + size] = key;
          index++;
      }

      return function mapToEntries(map) {
          size = map.size;
          index = 0;
          var ret = new Array(map.size * 2);
          map.forEach(extractEntry, ret);
          return ret;
      };
  })();

  var entriesToMap = function(entries) {
      var ret = new Es6Map();
      var length = entries.length / 2 | 0;
      for (var i = 0; i < length; ++i) {
          var key = entries[length + i];
          var value = entries[i];
          ret.set(key, value);
      }
      return ret;
  };

  function PropertiesPromiseArray(obj) {
      var isMap = false;
      var entries;
      if (Es6Map !== undefined && obj instanceof Es6Map) {
          entries = mapToEntries(obj);
          isMap = true;
      } else {
          var keys = es5.keys(obj);
          var len = keys.length;
          entries = new Array(len * 2);
          for (var i = 0; i < len; ++i) {
              var key = keys[i];
              entries[i] = obj[key];
              entries[i + len] = key;
          }
      }
      this.constructor$(entries);
      this._isMap = isMap;
      this._init$(undefined, isMap ? -6 : -3);
  }
  util.inherits(PropertiesPromiseArray, PromiseArray);

  PropertiesPromiseArray.prototype._init = function () {};

  PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
      this._values[index] = value;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          var val;
          if (this._isMap) {
              val = entriesToMap(this._values);
          } else {
              val = {};
              var keyOffset = this.length();
              for (var i = 0, len = this.length(); i < len; ++i) {
                  val[this._values[i + keyOffset]] = this._values[i];
              }
          }
          this._resolve(val);
          return true;
      }
      return false;
  };

  PropertiesPromiseArray.prototype.shouldCopyValues = function () {
      return false;
  };

  PropertiesPromiseArray.prototype.getActualLength = function (len) {
      return len >> 1;
  };

  function props(promises) {
      var ret;
      var castValue = tryConvertToPromise(promises);

      if (!isObject(castValue)) {
          return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      } else if (castValue instanceof Promise) {
          ret = castValue._then(
              Promise.props, undefined, undefined, undefined, undefined);
      } else {
          ret = new PropertiesPromiseArray(castValue).promise();
      }

      if (castValue instanceof Promise) {
          ret._propagateFrom(castValue, 2);
      }
      return ret;
  }

  Promise.prototype.props = function () {
      return props(this);
  };

  Promise.props = function (promises) {
      return props(promises);
  };
  };

  },{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
  function arrayMove(src, srcIndex, dst, dstIndex, len) {
      for (var j = 0; j < len; ++j) {
          dst[j + dstIndex] = src[j + srcIndex];
          src[j + srcIndex] = void 0;
      }
  }

  function Queue(capacity) {
      this._capacity = capacity;
      this._length = 0;
      this._front = 0;
  }

  Queue.prototype._willBeOverCapacity = function (size) {
      return this._capacity < size;
  };

  Queue.prototype._pushOne = function (arg) {
      var length = this.length();
      this._checkCapacity(length + 1);
      var i = (this._front + length) & (this._capacity - 1);
      this[i] = arg;
      this._length = length + 1;
  };

  Queue.prototype.push = function (fn, receiver, arg) {
      var length = this.length() + 3;
      if (this._willBeOverCapacity(length)) {
          this._pushOne(fn);
          this._pushOne(receiver);
          this._pushOne(arg);
          return;
      }
      var j = this._front + length - 3;
      this._checkCapacity(length);
      var wrapMask = this._capacity - 1;
      this[(j + 0) & wrapMask] = fn;
      this[(j + 1) & wrapMask] = receiver;
      this[(j + 2) & wrapMask] = arg;
      this._length = length;
  };

  Queue.prototype.shift = function () {
      var front = this._front,
          ret = this[front];

      this[front] = undefined;
      this._front = (front + 1) & (this._capacity - 1);
      this._length--;
      return ret;
  };

  Queue.prototype.length = function () {
      return this._length;
  };

  Queue.prototype._checkCapacity = function (size) {
      if (this._capacity < size) {
          this._resizeTo(this._capacity << 1);
      }
  };

  Queue.prototype._resizeTo = function (capacity) {
      var oldCapacity = this._capacity;
      this._capacity = capacity;
      var front = this._front;
      var length = this._length;
      var moveItemsCount = (front + length) & (oldCapacity - 1);
      arrayMove(this, 0, this, oldCapacity, moveItemsCount);
  };

  module.exports = Queue;

  },{}],27:[function(_dereq_,module,exports){
  module.exports = function(
      Promise, INTERNAL, tryConvertToPromise, apiRejection) {
  var util = _dereq_("./util");

  var raceLater = function (promise) {
      return promise.then(function(array) {
          return race(array, promise);
      });
  };

  function race(promises, parent) {
      var maybePromise = tryConvertToPromise(promises);

      if (maybePromise instanceof Promise) {
          return raceLater(maybePromise);
      } else {
          promises = util.asArray(promises);
          if (promises === null)
              return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
      }

      var ret = new Promise(INTERNAL);
      if (parent !== undefined) {
          ret._propagateFrom(parent, 3);
      }
      var fulfill = ret._fulfill;
      var reject = ret._reject;
      for (var i = 0, len = promises.length; i < len; ++i) {
          var val = promises[i];

          if (val === undefined && !(i in promises)) {
              continue;
          }

          Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
      }
      return ret;
  }

  Promise.race = function (promises) {
      return race(promises, undefined);
  };

  Promise.prototype.race = function () {
      return race(this, undefined);
  };

  };

  },{"./util":36}],28:[function(_dereq_,module,exports){
  module.exports = function(Promise,
                            PromiseArray,
                            apiRejection,
                            tryConvertToPromise,
                            INTERNAL,
                            debug) {
  var getDomain = Promise._getDomain;
  var util = _dereq_("./util");
  var tryCatch = util.tryCatch;

  function ReductionPromiseArray(promises, fn, initialValue, _each) {
      this.constructor$(promises);
      var domain = getDomain();
      this._fn = domain === null ? fn : util.domainBind(domain, fn);
      if (initialValue !== undefined) {
          initialValue = Promise.resolve(initialValue);
          initialValue._attachCancellationCallback(this);
      }
      this._initialValue = initialValue;
      this._currentCancellable = null;
      if(_each === INTERNAL) {
          this._eachValues = Array(this._length);
      } else if (_each === 0) {
          this._eachValues = null;
      } else {
          this._eachValues = undefined;
      }
      this._promise._captureStackTrace();
      this._init$(undefined, -5);
  }
  util.inherits(ReductionPromiseArray, PromiseArray);

  ReductionPromiseArray.prototype._gotAccum = function(accum) {
      if (this._eachValues !== undefined && 
          this._eachValues !== null && 
          accum !== INTERNAL) {
          this._eachValues.push(accum);
      }
  };

  ReductionPromiseArray.prototype._eachComplete = function(value) {
      if (this._eachValues !== null) {
          this._eachValues.push(value);
      }
      return this._eachValues;
  };

  ReductionPromiseArray.prototype._init = function() {};

  ReductionPromiseArray.prototype._resolveEmptyArray = function() {
      this._resolve(this._eachValues !== undefined ? this._eachValues
                                                   : this._initialValue);
  };

  ReductionPromiseArray.prototype.shouldCopyValues = function () {
      return false;
  };

  ReductionPromiseArray.prototype._resolve = function(value) {
      this._promise._resolveCallback(value);
      this._values = null;
  };

  ReductionPromiseArray.prototype._resultCancelled = function(sender) {
      if (sender === this._initialValue) return this._cancel();
      if (this._isResolved()) return;
      this._resultCancelled$();
      if (this._currentCancellable instanceof Promise) {
          this._currentCancellable.cancel();
      }
      if (this._initialValue instanceof Promise) {
          this._initialValue.cancel();
      }
  };

  ReductionPromiseArray.prototype._iterate = function (values) {
      this._values = values;
      var value;
      var i;
      var length = values.length;
      if (this._initialValue !== undefined) {
          value = this._initialValue;
          i = 0;
      } else {
          value = Promise.resolve(values[0]);
          i = 1;
      }

      this._currentCancellable = value;

      if (!value.isRejected()) {
          for (; i < length; ++i) {
              var ctx = {
                  accum: null,
                  value: values[i],
                  index: i,
                  length: length,
                  array: this
              };
              value = value._then(gotAccum, undefined, undefined, ctx, undefined);
          }
      }

      if (this._eachValues !== undefined) {
          value = value
              ._then(this._eachComplete, undefined, undefined, this, undefined);
      }
      value._then(completed, completed, undefined, value, this);
  };

  Promise.prototype.reduce = function (fn, initialValue) {
      return reduce(this, fn, initialValue, null);
  };

  Promise.reduce = function (promises, fn, initialValue, _each) {
      return reduce(promises, fn, initialValue, _each);
  };

  function completed(valueOrReason, array) {
      if (this.isFulfilled()) {
          array._resolve(valueOrReason);
      } else {
          array._reject(valueOrReason);
      }
  }

  function reduce(promises, fn, initialValue, _each) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util.classString(fn));
      }
      var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
      return array.promise();
  }

  function gotAccum(accum) {
      this.accum = accum;
      this.array._gotAccum(accum);
      var value = tryConvertToPromise(this.value, this.array._promise);
      if (value instanceof Promise) {
          this.array._currentCancellable = value;
          return value._then(gotValue, undefined, undefined, this, undefined);
      } else {
          return gotValue.call(this, value);
      }
  }

  function gotValue(value) {
      var array = this.array;
      var promise = array._promise;
      var fn = tryCatch(array._fn);
      promise._pushContext();
      var ret;
      if (array._eachValues !== undefined) {
          ret = fn.call(promise._boundValue(), value, this.index, this.length);
      } else {
          ret = fn.call(promise._boundValue(),
                                this.accum, value, this.index, this.length);
      }
      if (ret instanceof Promise) {
          array._currentCancellable = ret;
      }
      var promiseCreated = promise._popContext();
      debug.checkForgottenReturns(
          ret,
          promiseCreated,
          array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
          promise
      );
      return ret;
  }
  };

  },{"./util":36}],29:[function(_dereq_,module,exports){
  var util = _dereq_("./util");
  var schedule;
  var noAsyncScheduler = function() {
      throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
  };
  var NativePromise = util.getNativePromise();
  if (util.isNode && typeof MutationObserver === "undefined") {
      var GlobalSetImmediate = commonjsGlobal.setImmediate;
      var ProcessNextTick = process.nextTick;
      schedule = util.isRecentNode
                  ? function(fn) { GlobalSetImmediate.call(commonjsGlobal, fn); }
                  : function(fn) { ProcessNextTick.call(process, fn); };
  } else if (typeof NativePromise === "function" &&
             typeof NativePromise.resolve === "function") {
      var nativePromise = NativePromise.resolve();
      schedule = function(fn) {
          nativePromise.then(fn);
      };
  } else if ((typeof MutationObserver !== "undefined") &&
            !(typeof window !== "undefined" &&
              window.navigator &&
              (window.navigator.standalone || window.cordova))) {
      schedule = (function() {
          var div = document.createElement("div");
          var opts = {attributes: true};
          var toggleScheduled = false;
          var div2 = document.createElement("div");
          var o2 = new MutationObserver(function() {
              div.classList.toggle("foo");
              toggleScheduled = false;
          });
          o2.observe(div2, opts);

          var scheduleToggle = function() {
              if (toggleScheduled) return;
              toggleScheduled = true;
              div2.classList.toggle("foo");
          };

          return function schedule(fn) {
              var o = new MutationObserver(function() {
                  o.disconnect();
                  fn();
              });
              o.observe(div, opts);
              scheduleToggle();
          };
      })();
  } else if (typeof setImmediate !== "undefined") {
      schedule = function (fn) {
          setImmediate(fn);
      };
  } else if (typeof setTimeout !== "undefined") {
      schedule = function (fn) {
          setTimeout(fn, 0);
      };
  } else {
      schedule = noAsyncScheduler;
  }
  module.exports = schedule;

  },{"./util":36}],30:[function(_dereq_,module,exports){
  module.exports =
      function(Promise, PromiseArray, debug) {
  var PromiseInspection = Promise.PromiseInspection;
  var util = _dereq_("./util");

  function SettledPromiseArray(values) {
      this.constructor$(values);
  }
  util.inherits(SettledPromiseArray, PromiseArray);

  SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
      this._values[index] = inspection;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          this._resolve(this._values);
          return true;
      }
      return false;
  };

  SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
      var ret = new PromiseInspection();
      ret._bitField = 33554432;
      ret._settledValueField = value;
      return this._promiseResolved(index, ret);
  };
  SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
      var ret = new PromiseInspection();
      ret._bitField = 16777216;
      ret._settledValueField = reason;
      return this._promiseResolved(index, ret);
  };

  Promise.settle = function (promises) {
      debug.deprecated(".settle()", ".reflect()");
      return new SettledPromiseArray(promises).promise();
  };

  Promise.prototype.settle = function () {
      return Promise.settle(this);
  };
  };

  },{"./util":36}],31:[function(_dereq_,module,exports){
  module.exports =
  function(Promise, PromiseArray, apiRejection) {
  var util = _dereq_("./util");
  var RangeError = _dereq_("./errors").RangeError;
  var AggregateError = _dereq_("./errors").AggregateError;
  var isArray = util.isArray;
  var CANCELLATION = {};


  function SomePromiseArray(values) {
      this.constructor$(values);
      this._howMany = 0;
      this._unwrap = false;
      this._initialized = false;
  }
  util.inherits(SomePromiseArray, PromiseArray);

  SomePromiseArray.prototype._init = function () {
      if (!this._initialized) {
          return;
      }
      if (this._howMany === 0) {
          this._resolve([]);
          return;
      }
      this._init$(undefined, -5);
      var isArrayResolved = isArray(this._values);
      if (!this._isResolved() &&
          isArrayResolved &&
          this._howMany > this._canPossiblyFulfill()) {
          this._reject(this._getRangeError(this.length()));
      }
  };

  SomePromiseArray.prototype.init = function () {
      this._initialized = true;
      this._init();
  };

  SomePromiseArray.prototype.setUnwrap = function () {
      this._unwrap = true;
  };

  SomePromiseArray.prototype.howMany = function () {
      return this._howMany;
  };

  SomePromiseArray.prototype.setHowMany = function (count) {
      this._howMany = count;
  };

  SomePromiseArray.prototype._promiseFulfilled = function (value) {
      this._addFulfilled(value);
      if (this._fulfilled() === this.howMany()) {
          this._values.length = this.howMany();
          if (this.howMany() === 1 && this._unwrap) {
              this._resolve(this._values[0]);
          } else {
              this._resolve(this._values);
          }
          return true;
      }
      return false;

  };
  SomePromiseArray.prototype._promiseRejected = function (reason) {
      this._addRejected(reason);
      return this._checkOutcome();
  };

  SomePromiseArray.prototype._promiseCancelled = function () {
      if (this._values instanceof Promise || this._values == null) {
          return this._cancel();
      }
      this._addRejected(CANCELLATION);
      return this._checkOutcome();
  };

  SomePromiseArray.prototype._checkOutcome = function() {
      if (this.howMany() > this._canPossiblyFulfill()) {
          var e = new AggregateError();
          for (var i = this.length(); i < this._values.length; ++i) {
              if (this._values[i] !== CANCELLATION) {
                  e.push(this._values[i]);
              }
          }
          if (e.length > 0) {
              this._reject(e);
          } else {
              this._cancel();
          }
          return true;
      }
      return false;
  };

  SomePromiseArray.prototype._fulfilled = function () {
      return this._totalResolved;
  };

  SomePromiseArray.prototype._rejected = function () {
      return this._values.length - this.length();
  };

  SomePromiseArray.prototype._addRejected = function (reason) {
      this._values.push(reason);
  };

  SomePromiseArray.prototype._addFulfilled = function (value) {
      this._values[this._totalResolved++] = value;
  };

  SomePromiseArray.prototype._canPossiblyFulfill = function () {
      return this.length() - this._rejected();
  };

  SomePromiseArray.prototype._getRangeError = function (count) {
      var message = "Input array must contain at least " +
              this._howMany + " items but contains only " + count + " items";
      return new RangeError(message);
  };

  SomePromiseArray.prototype._resolveEmptyArray = function () {
      this._reject(this._getRangeError(0));
  };

  function some(promises, howMany) {
      if ((howMany | 0) !== howMany || howMany < 0) {
          return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var ret = new SomePromiseArray(promises);
      var promise = ret.promise();
      ret.setHowMany(howMany);
      ret.init();
      return promise;
  }

  Promise.some = function (promises, howMany) {
      return some(promises, howMany);
  };

  Promise.prototype.some = function (howMany) {
      return some(this, howMany);
  };

  Promise._SomePromiseArray = SomePromiseArray;
  };

  },{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
  module.exports = function(Promise) {
  function PromiseInspection(promise) {
      if (promise !== undefined) {
          promise = promise._target();
          this._bitField = promise._bitField;
          this._settledValueField = promise._isFateSealed()
              ? promise._settledValue() : undefined;
      }
      else {
          this._bitField = 0;
          this._settledValueField = undefined;
      }
  }

  PromiseInspection.prototype._settledValue = function() {
      return this._settledValueField;
  };

  var value = PromiseInspection.prototype.value = function () {
      if (!this.isFulfilled()) {
          throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      return this._settledValue();
  };

  var reason = PromiseInspection.prototype.error =
  PromiseInspection.prototype.reason = function () {
      if (!this.isRejected()) {
          throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      return this._settledValue();
  };

  var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
      return (this._bitField & 33554432) !== 0;
  };

  var isRejected = PromiseInspection.prototype.isRejected = function () {
      return (this._bitField & 16777216) !== 0;
  };

  var isPending = PromiseInspection.prototype.isPending = function () {
      return (this._bitField & 50397184) === 0;
  };

  var isResolved = PromiseInspection.prototype.isResolved = function () {
      return (this._bitField & 50331648) !== 0;
  };

  PromiseInspection.prototype.isCancelled = function() {
      return (this._bitField & 8454144) !== 0;
  };

  Promise.prototype.__isCancelled = function() {
      return (this._bitField & 65536) === 65536;
  };

  Promise.prototype._isCancelled = function() {
      return this._target().__isCancelled();
  };

  Promise.prototype.isCancelled = function() {
      return (this._target()._bitField & 8454144) !== 0;
  };

  Promise.prototype.isPending = function() {
      return isPending.call(this._target());
  };

  Promise.prototype.isRejected = function() {
      return isRejected.call(this._target());
  };

  Promise.prototype.isFulfilled = function() {
      return isFulfilled.call(this._target());
  };

  Promise.prototype.isResolved = function() {
      return isResolved.call(this._target());
  };

  Promise.prototype.value = function() {
      return value.call(this._target());
  };

  Promise.prototype.reason = function() {
      var target = this._target();
      target._unsetRejectionIsUnhandled();
      return reason.call(target);
  };

  Promise.prototype._value = function() {
      return this._settledValue();
  };

  Promise.prototype._reason = function() {
      this._unsetRejectionIsUnhandled();
      return this._settledValue();
  };

  Promise.PromiseInspection = PromiseInspection;
  };

  },{}],33:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL) {
  var util = _dereq_("./util");
  var errorObj = util.errorObj;
  var isObject = util.isObject;

  function tryConvertToPromise(obj, context) {
      if (isObject(obj)) {
          if (obj instanceof Promise) return obj;
          var then = getThen(obj);
          if (then === errorObj) {
              if (context) context._pushContext();
              var ret = Promise.reject(then.e);
              if (context) context._popContext();
              return ret;
          } else if (typeof then === "function") {
              if (isAnyBluebirdPromise(obj)) {
                  var ret = new Promise(INTERNAL);
                  obj._then(
                      ret._fulfill,
                      ret._reject,
                      undefined,
                      ret,
                      null
                  );
                  return ret;
              }
              return doThenable(obj, then, context);
          }
      }
      return obj;
  }

  function doGetThen(obj) {
      return obj.then;
  }

  function getThen(obj) {
      try {
          return doGetThen(obj);
      } catch (e) {
          errorObj.e = e;
          return errorObj;
      }
  }

  var hasProp = {}.hasOwnProperty;
  function isAnyBluebirdPromise(obj) {
      try {
          return hasProp.call(obj, "_promise0");
      } catch (e) {
          return false;
      }
  }

  function doThenable(x, then, context) {
      var promise = new Promise(INTERNAL);
      var ret = promise;
      if (context) context._pushContext();
      promise._captureStackTrace();
      if (context) context._popContext();
      var synchronous = true;
      var result = util.tryCatch(then).call(x, resolve, reject);
      synchronous = false;

      if (promise && result === errorObj) {
          promise._rejectCallback(result.e, true, true);
          promise = null;
      }

      function resolve(value) {
          if (!promise) return;
          promise._resolveCallback(value);
          promise = null;
      }

      function reject(reason) {
          if (!promise) return;
          promise._rejectCallback(reason, synchronous, true);
          promise = null;
      }
      return ret;
  }

  return tryConvertToPromise;
  };

  },{"./util":36}],34:[function(_dereq_,module,exports){
  module.exports = function(Promise, INTERNAL, debug) {
  var util = _dereq_("./util");
  var TimeoutError = Promise.TimeoutError;

  function HandleWrapper(handle)  {
      this.handle = handle;
  }

  HandleWrapper.prototype._resultCancelled = function() {
      clearTimeout(this.handle);
  };

  var afterValue = function(value) { return delay(+this).thenReturn(value); };
  var delay = Promise.delay = function (ms, value) {
      var ret;
      var handle;
      if (value !== undefined) {
          ret = Promise.resolve(value)
                  ._then(afterValue, null, null, ms, undefined);
          if (debug.cancellation() && value instanceof Promise) {
              ret._setOnCancel(value);
          }
      } else {
          ret = new Promise(INTERNAL);
          handle = setTimeout(function() { ret._fulfill(); }, +ms);
          if (debug.cancellation()) {
              ret._setOnCancel(new HandleWrapper(handle));
          }
          ret._captureStackTrace();
      }
      ret._setAsyncGuaranteed();
      return ret;
  };

  Promise.prototype.delay = function (ms) {
      return delay(ms, this);
  };

  var afterTimeout = function (promise, message, parent) {
      var err;
      if (typeof message !== "string") {
          if (message instanceof Error) {
              err = message;
          } else {
              err = new TimeoutError("operation timed out");
          }
      } else {
          err = new TimeoutError(message);
      }
      util.markAsOriginatingFromRejection(err);
      promise._attachExtraTrace(err);
      promise._reject(err);

      if (parent != null) {
          parent.cancel();
      }
  };

  function successClear(value) {
      clearTimeout(this.handle);
      return value;
  }

  function failureClear(reason) {
      clearTimeout(this.handle);
      throw reason;
  }

  Promise.prototype.timeout = function (ms, message) {
      ms = +ms;
      var ret, parent;

      var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
          if (ret.isPending()) {
              afterTimeout(ret, message, parent);
          }
      }, ms));

      if (debug.cancellation()) {
          parent = this.then();
          ret = parent._then(successClear, failureClear,
                              undefined, handleWrapper, undefined);
          ret._setOnCancel(handleWrapper);
      } else {
          ret = this._then(successClear, failureClear,
                              undefined, handleWrapper, undefined);
      }

      return ret;
  };

  };

  },{"./util":36}],35:[function(_dereq_,module,exports){
  module.exports = function (Promise, apiRejection, tryConvertToPromise,
      createContext, INTERNAL, debug) {
      var util = _dereq_("./util");
      var TypeError = _dereq_("./errors").TypeError;
      var inherits = _dereq_("./util").inherits;
      var errorObj = util.errorObj;
      var tryCatch = util.tryCatch;
      var NULL = {};

      function thrower(e) {
          setTimeout(function(){throw e;}, 0);
      }

      function castPreservingDisposable(thenable) {
          var maybePromise = tryConvertToPromise(thenable);
          if (maybePromise !== thenable &&
              typeof thenable._isDisposable === "function" &&
              typeof thenable._getDisposer === "function" &&
              thenable._isDisposable()) {
              maybePromise._setDisposable(thenable._getDisposer());
          }
          return maybePromise;
      }
      function dispose(resources, inspection) {
          var i = 0;
          var len = resources.length;
          var ret = new Promise(INTERNAL);
          function iterator() {
              if (i >= len) return ret._fulfill();
              var maybePromise = castPreservingDisposable(resources[i++]);
              if (maybePromise instanceof Promise &&
                  maybePromise._isDisposable()) {
                  try {
                      maybePromise = tryConvertToPromise(
                          maybePromise._getDisposer().tryDispose(inspection),
                          resources.promise);
                  } catch (e) {
                      return thrower(e);
                  }
                  if (maybePromise instanceof Promise) {
                      return maybePromise._then(iterator, thrower,
                                                null, null, null);
                  }
              }
              iterator();
          }
          iterator();
          return ret;
      }

      function Disposer(data, promise, context) {
          this._data = data;
          this._promise = promise;
          this._context = context;
      }

      Disposer.prototype.data = function () {
          return this._data;
      };

      Disposer.prototype.promise = function () {
          return this._promise;
      };

      Disposer.prototype.resource = function () {
          if (this.promise().isFulfilled()) {
              return this.promise().value();
          }
          return NULL;
      };

      Disposer.prototype.tryDispose = function(inspection) {
          var resource = this.resource();
          var context = this._context;
          if (context !== undefined) context._pushContext();
          var ret = resource !== NULL
              ? this.doDispose(resource, inspection) : null;
          if (context !== undefined) context._popContext();
          this._promise._unsetDisposable();
          this._data = null;
          return ret;
      };

      Disposer.isDisposer = function (d) {
          return (d != null &&
                  typeof d.resource === "function" &&
                  typeof d.tryDispose === "function");
      };

      function FunctionDisposer(fn, promise, context) {
          this.constructor$(fn, promise, context);
      }
      inherits(FunctionDisposer, Disposer);

      FunctionDisposer.prototype.doDispose = function (resource, inspection) {
          var fn = this.data();
          return fn.call(resource, resource, inspection);
      };

      function maybeUnwrapDisposer(value) {
          if (Disposer.isDisposer(value)) {
              this.resources[this.index]._setDisposable(value);
              return value.promise();
          }
          return value;
      }

      function ResourceList(length) {
          this.length = length;
          this.promise = null;
          this[length-1] = null;
      }

      ResourceList.prototype._resultCancelled = function() {
          var len = this.length;
          for (var i = 0; i < len; ++i) {
              var item = this[i];
              if (item instanceof Promise) {
                  item.cancel();
              }
          }
      };

      Promise.using = function () {
          var len = arguments.length;
          if (len < 2) return apiRejection(
                          "you must pass at least 2 arguments to Promise.using");
          var fn = arguments[len - 1];
          if (typeof fn !== "function") {
              return apiRejection("expecting a function but got " + util.classString(fn));
          }
          var input;
          var spreadArgs = true;
          if (len === 2 && Array.isArray(arguments[0])) {
              input = arguments[0];
              len = input.length;
              spreadArgs = false;
          } else {
              input = arguments;
              len--;
          }
          var resources = new ResourceList(len);
          for (var i = 0; i < len; ++i) {
              var resource = input[i];
              if (Disposer.isDisposer(resource)) {
                  var disposer = resource;
                  resource = resource.promise();
                  resource._setDisposable(disposer);
              } else {
                  var maybePromise = tryConvertToPromise(resource);
                  if (maybePromise instanceof Promise) {
                      resource =
                          maybePromise._then(maybeUnwrapDisposer, null, null, {
                              resources: resources,
                              index: i
                      }, undefined);
                  }
              }
              resources[i] = resource;
          }

          var reflectedResources = new Array(resources.length);
          for (var i = 0; i < reflectedResources.length; ++i) {
              reflectedResources[i] = Promise.resolve(resources[i]).reflect();
          }

          var resultPromise = Promise.all(reflectedResources)
              .then(function(inspections) {
                  for (var i = 0; i < inspections.length; ++i) {
                      var inspection = inspections[i];
                      if (inspection.isRejected()) {
                          errorObj.e = inspection.error();
                          return errorObj;
                      } else if (!inspection.isFulfilled()) {
                          resultPromise.cancel();
                          return;
                      }
                      inspections[i] = inspection.value();
                  }
                  promise._pushContext();

                  fn = tryCatch(fn);
                  var ret = spreadArgs
                      ? fn.apply(undefined, inspections) : fn(inspections);
                  var promiseCreated = promise._popContext();
                  debug.checkForgottenReturns(
                      ret, promiseCreated, "Promise.using", promise);
                  return ret;
              });

          var promise = resultPromise.lastly(function() {
              var inspection = new Promise.PromiseInspection(resultPromise);
              return dispose(resources, inspection);
          });
          resources.promise = promise;
          promise._setOnCancel(resources);
          return promise;
      };

      Promise.prototype._setDisposable = function (disposer) {
          this._bitField = this._bitField | 131072;
          this._disposer = disposer;
      };

      Promise.prototype._isDisposable = function () {
          return (this._bitField & 131072) > 0;
      };

      Promise.prototype._getDisposer = function () {
          return this._disposer;
      };

      Promise.prototype._unsetDisposable = function () {
          this._bitField = this._bitField & (~131072);
          this._disposer = undefined;
      };

      Promise.prototype.disposer = function (fn) {
          if (typeof fn === "function") {
              return new FunctionDisposer(fn, this, createContext());
          }
          throw new TypeError();
      };

  };

  },{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
  var es5 = _dereq_("./es5");
  var canEvaluate = typeof navigator == "undefined";

  var errorObj = {e: {}};
  var tryCatchTarget;
  var globalObject = typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window :
      typeof commonjsGlobal !== "undefined" ? commonjsGlobal :
      this !== undefined ? this : null;

  function tryCatcher() {
      try {
          var target = tryCatchTarget;
          tryCatchTarget = null;
          return target.apply(this, arguments);
      } catch (e) {
          errorObj.e = e;
          return errorObj;
      }
  }
  function tryCatch(fn) {
      tryCatchTarget = fn;
      return tryCatcher;
  }

  var inherits = function(Child, Parent) {
      var hasProp = {}.hasOwnProperty;

      function T() {
          this.constructor = Child;
          this.constructor$ = Parent;
          for (var propertyName in Parent.prototype) {
              if (hasProp.call(Parent.prototype, propertyName) &&
                  propertyName.charAt(propertyName.length-1) !== "$"
             ) {
                  this[propertyName + "$"] = Parent.prototype[propertyName];
              }
          }
      }
      T.prototype = Parent.prototype;
      Child.prototype = new T();
      return Child.prototype;
  };


  function isPrimitive(val) {
      return val == null || val === true || val === false ||
          typeof val === "string" || typeof val === "number";

  }

  function isObject(value) {
      return typeof value === "function" ||
             typeof value === "object" && value !== null;
  }

  function maybeWrapAsError(maybeError) {
      if (!isPrimitive(maybeError)) return maybeError;

      return new Error(safeToString(maybeError));
  }

  function withAppended(target, appendee) {
      var len = target.length;
      var ret = new Array(len + 1);
      var i;
      for (i = 0; i < len; ++i) {
          ret[i] = target[i];
      }
      ret[i] = appendee;
      return ret;
  }

  function getDataPropertyOrDefault(obj, key, defaultValue) {
      if (es5.isES5) {
          var desc = Object.getOwnPropertyDescriptor(obj, key);

          if (desc != null) {
              return desc.get == null && desc.set == null
                      ? desc.value
                      : defaultValue;
          }
      } else {
          return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
      }
  }

  function notEnumerableProp(obj, name, value) {
      if (isPrimitive(obj)) return obj;
      var descriptor = {
          value: value,
          configurable: true,
          enumerable: false,
          writable: true
      };
      es5.defineProperty(obj, name, descriptor);
      return obj;
  }

  function thrower(r) {
      throw r;
  }

  var inheritedDataKeys = (function() {
      var excludedPrototypes = [
          Array.prototype,
          Object.prototype,
          Function.prototype
      ];

      var isExcludedProto = function(val) {
          for (var i = 0; i < excludedPrototypes.length; ++i) {
              if (excludedPrototypes[i] === val) {
                  return true;
              }
          }
          return false;
      };

      if (es5.isES5) {
          var getKeys = Object.getOwnPropertyNames;
          return function(obj) {
              var ret = [];
              var visitedKeys = Object.create(null);
              while (obj != null && !isExcludedProto(obj)) {
                  var keys;
                  try {
                      keys = getKeys(obj);
                  } catch (e) {
                      return ret;
                  }
                  for (var i = 0; i < keys.length; ++i) {
                      var key = keys[i];
                      if (visitedKeys[key]) continue;
                      visitedKeys[key] = true;
                      var desc = Object.getOwnPropertyDescriptor(obj, key);
                      if (desc != null && desc.get == null && desc.set == null) {
                          ret.push(key);
                      }
                  }
                  obj = es5.getPrototypeOf(obj);
              }
              return ret;
          };
      } else {
          var hasProp = {}.hasOwnProperty;
          return function(obj) {
              if (isExcludedProto(obj)) return [];
              var ret = [];

              /*jshint forin:false */
              enumeration: for (var key in obj) {
                  if (hasProp.call(obj, key)) {
                      ret.push(key);
                  } else {
                      for (var i = 0; i < excludedPrototypes.length; ++i) {
                          if (hasProp.call(excludedPrototypes[i], key)) {
                              continue enumeration;
                          }
                      }
                      ret.push(key);
                  }
              }
              return ret;
          };
      }

  })();

  var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
  function isClass(fn) {
      try {
          if (typeof fn === "function") {
              var keys = es5.names(fn.prototype);

              var hasMethods = es5.isES5 && keys.length > 1;
              var hasMethodsOtherThanConstructor = keys.length > 0 &&
                  !(keys.length === 1 && keys[0] === "constructor");
              var hasThisAssignmentAndStaticMethods =
                  thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

              if (hasMethods || hasMethodsOtherThanConstructor ||
                  hasThisAssignmentAndStaticMethods) {
                  return true;
              }
          }
          return false;
      } catch (e) {
          return false;
      }
  }

  function toFastProperties(obj) {
      return obj;
      eval(obj);
  }

  var rident = /^[a-z$_][a-z$_0-9]*$/i;
  function isIdentifier(str) {
      return rident.test(str);
  }

  function filledRange(count, prefix, suffix) {
      var ret = new Array(count);
      for(var i = 0; i < count; ++i) {
          ret[i] = prefix + i + suffix;
      }
      return ret;
  }

  function safeToString(obj) {
      try {
          return obj + "";
      } catch (e) {
          return "[no string representation]";
      }
  }

  function isError(obj) {
      return obj instanceof Error ||
          (obj !== null &&
             typeof obj === "object" &&
             typeof obj.message === "string" &&
             typeof obj.name === "string");
  }

  function markAsOriginatingFromRejection(e) {
      try {
          notEnumerableProp(e, "isOperational", true);
      }
      catch(ignore) {}
  }

  function originatesFromRejection(e) {
      if (e == null) return false;
      return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
          e["isOperational"] === true);
  }

  function canAttachTrace(obj) {
      return isError(obj) && es5.propertyIsWritable(obj, "stack");
  }

  var ensureErrorObject = (function() {
      if (!("stack" in new Error())) {
          return function(value) {
              if (canAttachTrace(value)) return value;
              try {throw new Error(safeToString(value));}
              catch(err) {return err;}
          };
      } else {
          return function(value) {
              if (canAttachTrace(value)) return value;
              return new Error(safeToString(value));
          };
      }
  })();

  function classString(obj) {
      return {}.toString.call(obj);
  }

  function copyDescriptors(from, to, filter) {
      var keys = es5.names(from);
      for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (filter(key)) {
              try {
                  es5.defineProperty(to, key, es5.getDescriptor(from, key));
              } catch (ignore) {}
          }
      }
  }

  var asArray = function(v) {
      if (es5.isArray(v)) {
          return v;
      }
      return null;
  };

  if (typeof Symbol !== "undefined" && Symbol.iterator) {
      var ArrayFrom = typeof Array.from === "function" ? function(v) {
          return Array.from(v);
      } : function(v) {
          var ret = [];
          var it = v[Symbol.iterator]();
          var itResult;
          while (!((itResult = it.next()).done)) {
              ret.push(itResult.value);
          }
          return ret;
      };

      asArray = function(v) {
          if (es5.isArray(v)) {
              return v;
          } else if (v != null && typeof v[Symbol.iterator] === "function") {
              return ArrayFrom(v);
          }
          return null;
      };
  }

  var isNode = typeof process !== "undefined" &&
          classString(process).toLowerCase() === "[object process]";

  var hasEnvVariables = typeof process !== "undefined" &&
      typeof process.env !== "undefined";

  function env(key) {
      return hasEnvVariables ? process.env[key] : undefined;
  }

  function getNativePromise() {
      if (typeof Promise === "function") {
          try {
              var promise = new Promise(function(){});
              if ({}.toString.call(promise) === "[object Promise]") {
                  return Promise;
              }
          } catch (e) {}
      }
  }

  function domainBind(self, cb) {
      return self.bind(cb);
  }

  var ret = {
      isClass: isClass,
      isIdentifier: isIdentifier,
      inheritedDataKeys: inheritedDataKeys,
      getDataPropertyOrDefault: getDataPropertyOrDefault,
      thrower: thrower,
      isArray: es5.isArray,
      asArray: asArray,
      notEnumerableProp: notEnumerableProp,
      isPrimitive: isPrimitive,
      isObject: isObject,
      isError: isError,
      canEvaluate: canEvaluate,
      errorObj: errorObj,
      tryCatch: tryCatch,
      inherits: inherits,
      withAppended: withAppended,
      maybeWrapAsError: maybeWrapAsError,
      toFastProperties: toFastProperties,
      filledRange: filledRange,
      toString: safeToString,
      canAttachTrace: canAttachTrace,
      ensureErrorObject: ensureErrorObject,
      originatesFromRejection: originatesFromRejection,
      markAsOriginatingFromRejection: markAsOriginatingFromRejection,
      classString: classString,
      copyDescriptors: copyDescriptors,
      hasDevTools: typeof chrome !== "undefined" && chrome &&
                   typeof chrome.loadTimes === "function",
      isNode: isNode,
      hasEnvVariables: hasEnvVariables,
      env: env,
      global: globalObject,
      getNativePromise: getNativePromise,
      domainBind: domainBind
  };
  ret.isRecentNode = ret.isNode && (function() {
      var version = process.versions.node.split(".").map(Number);
      return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
  })();

  if (ret.isNode) ret.toFastProperties(process);

  try {throw new Error(); } catch (e) {ret.lastLineError = e;}
  module.exports = ret;

  },{"./es5":13}]},{},[4])(4)
  });if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
  });
  var bluebird_1 = bluebird.promisify;

  var state = {
    version: null,
    validApiKey: 'unknown',
    supportedNetwork: 'unknown',
    config: null,
    userAgent: null,
    mobileDevice: null,
    validBrowser: null,
    legacyWeb3: null,
    modernWeb3: null,
    web3Version: null,
    web3Instance: null,
    currentProvider: null,
    web3Wallet: null,
    legacyWallet: null,
    modernWallet: null,
    accessToAccounts: null,
    accountAddress: null,
    walletLoggedIn: null,
    walletEnabled: null,
    walletEnableCalled: null,
    walletEnableCanceled: null,
    accountBalance: null,
    minimumBalance: null,
    correctNetwork: null,
    userCurrentNetworkId: null,
    socket: null,
    pendingSocketConnection: null,
    socketConnection: null,
    transactionQueue: [],
    transactionAwaitingApproval: false,
    iframe: null,
    iframeDocument: null,
    iframeWindow: null,
    connectionId: null
  };
  function updateState(newState) {
    state = Object.assign({}, state, newState);
  }

  function getItem(item) {
    var storageItem;

    try {
      storageItem = window.localStorage && window.localStorage.getItem(item);
    } catch (errorObj) {
      return 'null';
    }

    return storageItem;
  }
  function storeItem(item, value) {
    try {
      window.localStorage && window.localStorage.setItem(item, value);
    } catch (errorObj) {
      return 'null';
    }

    return 'success';
  }
  function removeItem(item) {
    try {
      window.localStorage && window.localStorage.removeItem(item);
    } catch (errorObj) {
      return 'null';
    }

    return 'success';
  }
  function storeTransactionQueue() {
    var transactionQueue = state.transactionQueue;

    if (transactionQueue.length > 0) {
      var filteredQueue = transactionQueue.filter(function (txObj) {
        return txObj.transaction.txSent;
      });
      storeItem('transactionQueue', JSON.stringify(filteredQueue));
    }
  }
  function getTransactionQueueFromStorage() {
    var transactionQueue = getItem('transactionQueue');

    if (transactionQueue) {
      var parsedQueue = JSON.parse(transactionQueue);
      var filteredQueue = parsedQueue.filter(function (txObj) {
        return Date.now() - txObj.transaction.startTime < 150000;
      });
      updateState({
        transactionQueue: [].concat(toConsumableArray(filteredQueue), toConsumableArray(state.transactionQueue))
      });
      removeItem('transactionQueue');
    }
  }

  function addTransactionToQueue(txObject) {
    var transactionQueue = state.transactionQueue;
    return [].concat(toConsumableArray(transactionQueue), [txObject]);
  }
  function removeTransactionFromQueue(txNonce) {
    var transactionQueue = state.transactionQueue;
    return transactionQueue.filter(function (txObj) {
      return txObj.transaction.nonce !== txNonce;
    });
  }
  function checkTransactionQueue(txNonce) {
    var transactionQueue = state.transactionQueue;
    return transactionQueue.find(function (txObj) {
      return txObj.transaction.nonce === txNonce;
    });
  }
  function getTransactionObj(txHash) {
    var transactionQueue = state.transactionQueue;
    return transactionQueue.find(function (txObj) {
      return txObj.transaction.hash === txHash;
    });
  }
  function nowInTxPool(txHash) {
    var transactionQueue = state.transactionQueue;
    var txObj = transactionQueue.find(function (txObj) {
      return txObj.transaction.hash === txHash;
    });
    txObj.transaction.inTxPool = true;
  }
  function isDuplicateTransaction(txObject) {
    var transactionQueue = state.transactionQueue;
    return transactionQueue.filter(function (txObj) {
      return txObj.transaction.value === txObject.value && txObj.transaction.to === txObject.to;
    })[0];
  } // Nice time format

  function formatTime(number) {
    var time = new Date(number);
    return time.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }
  function timeString(time) {
    var seconds = Math.floor(time / 1000);
    return seconds >= 60 ? "".concat(Math.floor(seconds / 60), " min") : "".concat(seconds, " sec");
  }
  function separateArgs(args) {
    var argsCopy = toConsumableArray(args);

    var callbackIndex = argsCopy.findIndex(function (arg) {
      return typeof arg === 'function';
    });
    var callback = callbackIndex > -1 && argsCopy.splice(callbackIndex, 1)[0];
    var txObjectIndex = argsCopy.findIndex(function (arg) {
      return _typeof_1(arg) === 'object';
    });
    var txObject = txObjectIndex > -1 ? argsCopy.splice(txObjectIndex, 1)[0] : undefined;
    return {
      callback: callback,
      args: argsCopy,
      txObject: txObject
    };
  }
  function assistLog(log) {
    console.log('Assist:', log); // eslint-disable-line no-console
  }
  function handleError(categoryCode, propagateError) {
    return function (errorObj) {
      var message = errorObj.message;
      handleEvent({
        eventCode: 'errorLog',
        categoryCode: categoryCode,
        reason: message || errorObj
      });
      propagateError && propagateError(errorObj);
    };
  }
  function capitalize(str) {
    var first = str.slice(0, 1);
    var rest = str.slice(1);
    return "".concat(first.toUpperCase()).concat(rest);
  }
  function formatNumber(num) {
    var numString = String(num);

    if (numString.includes('+')) {
      var exponent = numString.split('+')[1];
      var precision = Number(exponent) + 1;
      return num.toPrecision(precision);
    }

    return num;
  }
  function extractMessageFromError(message) {
    var str = message.split('"message":')[1];
    return str.split('"')[1];
  }
  function eventCodeToType(eventCode) {
    switch (eventCode) {
      case 'txPending':
      case 'txSent':
        return 'progress';

      case 'txSendFail':
      case 'txStall':
      case 'txFailed':
      case 'nsfFail':
      case 'txRepeat':
      case 'txAwaitingApproval':
      case 'txConfirmReminder':
        return 'failed';

      case 'txConfirmed':
      case 'txConfirmedClient':
        return 'complete';

      default:
        return undefined;
    }
  }
  function eventCodeToStep(eventCode) {
    switch (eventCode) {
      case 'mobileBlocked':
        return 'mobile';

      case 'browserFail':
        return 'browser';

      case 'welcomeUser':
        return 0;

      case 'walletFail':
        return 1;

      case 'walletLogin':
      case 'walletLoginEnable':
        return 2;

      case 'walletEnable':
        return 3;

      case 'networkFail':
        return 4;

      case 'nsfFail':
        return 5;

      case 'newOnboardComplete':
        return 6;

      default:
        return undefined;
    }
  }
  function networkName(id) {
    switch (Number(id)) {
      case 1:
        return 'main';

      case 3:
        return 'ropsten';

      case 4:
        return 'rinkeby';

      case 42:
        return 'kovan';

      case 'localhost':
        return 'localhost';

      default:
        return 'local';
    }
  }
  var timeouts = {
    checkSocketConnection: 250,
    waitForResponse: 100,
    txConfirmReminder: 20000,
    txStall: 30000,
    changeUI: 305,
    localhostNetworkCheck: 300,
    removeElement: 300,
    endOfEventQueue: 0,
    hideElement: 200,
    showElement: 120,
    autoRemoveNotification: 4000,
    pollForReceipt: 1000
  };
  function stepToImageKey(step) {
    switch (step) {
      case 0:
        return 'welcome';

      case 6:
        return 'complete';

      default:
        return null;
    }
  }

  var notSupported = {
    mobileNotSupported: {
      heading: 'Mobile Not Supported',
      description: function description() {
        return 'Our distributed application does not support mobile browsers. Please visit our site on a desktop browser. Thank you!';
      }
    },
    browserNotSupported: {
      heading: 'This Browser is Not Supported',
      description: function description() {
        return "This Dapp is not supported in ".concat(state.userAgent.browser.name, ". Please visit us in one of the following browsers. Thank You!");
      }
    }
  };
  var onboardHeading = {
    '0': {
      basic: 'Let’s Get You Started'
    },
    '1': {
      basic: 'Install MetaMask'
    },
    '2': {
      basic: 'MetaMask Login',
      advanced: 'Login to MetaMask'
    },
    '3': {
      basic: 'MetaMask Connect',
      advanced: 'Connect MetaMask'
    },
    '4': {
      basic: 'Join the Correct Network',
      advanced: 'Wrong Network'
    },
    '5': {
      basic: 'Get Some Ether',
      advanced: 'Get Some ETH'
    },
    '6': {
      basic: 'Ready to Go'
    }
  };
  var onboardDescription = {
    '0': {
      basic: function basic() {
        return 'To use this feature you’ll need to be set up and ready to use the blockchain. This onboarding guide will walk you through each step of the process. It won’t take long and at any time you can come back and pick up where you left off.';
      }
    },
    '1': {
      basic: function basic() {
        return 'We use a product called MetaMask to manage everything you need to interact with a blockchain application like this one. MetaMask is free, installs right into your browser, hyper secure, and can be used for any other blockchain application you may want to use. <a href="https://metamask.io/" target="_blank">Get MetaMask now</a>';
      }
    },
    '2': {
      basic: function basic() {
        return 'Now you have MetaMask installed, you’ll need to log into it. The first time you use it, you may need to set up an account with MetaMask which you can do right from the extension. When you’ve got that set up and you’re logged into MetaMask, let us know.';
      },
      advanced: function advanced() {
        return 'We’ve detected you are not logged into MetaMask. Please log in to continue using the blockchain enabled features of this application.';
      }
    },
    '3': {
      basic: function basic() {
        return 'Please allow connection to your wallet';
      },
      advanced: function advanced() {
        return 'Connect your wallet to interact with this Dapp';
      }
    },
    '4': {
      basic: function basic() {
        return "Blockchain applications have different networks they can work on. Think of this like making sure you\u2019re on Netflix vs Hulu to watch your favorite show. We\u2019ve detected that you need to be on the ".concat(networkName(state.config.networkId) || 'mainnet', " network for this application but you have MetaMask set to ").concat(networkName(state.userCurrentNetworkId), ". Switch the network name in MetaMask and you\u2019ll be ready to go.");
      },
      advanced: function advanced() {
        return "We\u2019ve detected that you need to be on the ".concat(networkName(state.config.networkId) || 'mainnet', " network for this application but you have MetaMask set to ").concat(networkName(state.userCurrentNetworkId), ". Please switch to the correct network.");
      }
    },
    '5': {
      basic: function basic() {
        return "Blockchain applications sometimes require Ether to perform various functions. You\u2019ll need at least ".concat(state.config.minimumBalance / 1000000000000000000, " Ether (ETH) for this application.");
      },
      advanced: function advanced() {
        return "Blockchain applications sometimes require Ether to perform various functions. You\u2019ll need at least ".concat(state.config.minimumBalance / 1000000000000000000, " Ether (ETH) for this application.");
      }
    },
    '6': {
      basic: function basic() {
        return 'You have successfully completed all the steps necessary to use this application. Welcome to the world of blockchain.';
      }
    }
  };
  var onboardButton = {
    '0': {
      basic: 'I’M READY'
    },
    '1': {
      basic: 'CHECK THAT I HAVE METAMASK'
    },
    '2': {
      basic: 'CHECK THAT I’M LOGGED IN',
      advanced: 'CHECK THAT I’M LOGGED IN'
    },
    '3': {
      basic: "CHECK THAT I'M CONNECTED",
      advanced: "CHECK THAT I'M CONNECTED"
    },
    '4': {
      basic: 'CHECK THAT I’M ON THE RIGHT NETWORK',
      advanced: 'CHECK MY NETWORK'
    },
    '5': {
      basic: 'CHECK THAT I HAVE ETHER',
      advanced: 'I HAVE ENOUGH ETH'
    },
    '6': {
      basic: 'BACK TO THE APP'
    }
  };
  function onboardWarningMsg(type) {
    switch (type) {
      case 'loggedIn':
        return 'You are not currently logged in to MetaMask.';

      case 'enabled':
        return 'You have not yet approved the Connect request in MetaMask.';

      case 'network':
        return "You currently have MetaMask set to the ".concat(capitalize(networkName(state.userCurrentNetworkId)), " ").concat(state.userCurrentNetworkId === '1' ? 'Ethereum' : 'Test', " Network.");

      case 'minimumBalance':
        return "Your current MetaMask account has less than the necessary minimum balance of\n        ".concat(state.config.minimumBalance / 1000000000000000000, " ").concat(capitalize(networkName(state.userCurrentNetworkId)), " ").concat(state.userCurrentNetworkId === '1' ? 'Ethereum' : 'Test', " Network Ether (ETH).");

      default:
        return undefined;
    }
  }
  var imageSrc = {
    blockNativeLogo: {
      src: 'https://s3.amazonaws.com/bnc-assist/images/fJxOtIj.png',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/UhcCuKF.png 2x'
    },
    mobile: {
      src: 'https://s3.amazonaws.com/bnc-assist/images/EcUxQVJ.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/GS6owd9.jpg 2x'
    },
    browser: {
      src: 'https://s3.amazonaws.com/bnc-assist/images/riXzN0X.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/xpWtOVX.jpg 2x'
    },
    chromeLogo: {
      src: 'https://s3.amazonaws.com/bnc-assist/images/XAwAAmL.png',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/maxXVIH.png 2x'
    },
    firefoxLogo: {
      src: 'https://s3.amazonaws.com/bnc-assist/images/WjOSJTh.png',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/kodZvyO.png 2x'
    },
    '0': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/XUPOg7L.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/s8euD9T.jpg 2x'
    },
    '1': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/EgcXT0z.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/4zplgXa.jpg 2x'
    },
    '2': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/tKkRH5L.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/BEhzPx6.jpg 2x'
    },
    '3': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/HuDHbXP.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/XLBqwPO.jpg 2x'
    },
    '4': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/0VBtqGV.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/t7WS9Sc.jpg 2x'
    },
    '5': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/1TWEHRY.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/jfdXqIU.jpg 2x'
    },
    '6': {
      src: 'https://s3.amazonaws.com/bnc-assist/images/8ptZott.jpg',
      srcset: 'https://s3.amazonaws.com/bnc-assist/images/elR9xQ8.jpg 2x'
    }
  };
  var transactionMsgs = {
    txPending: function txPending(_ref) {
      var transaction = _ref.transaction;
      return "Your transaction ID: ".concat(transaction.nonce, " has started");
    },
    txSent: function txSent(_ref2) {
      var transaction = _ref2.transaction;
      return "Your transaction ID: ".concat(transaction.nonce, " has been sent to the network");
    },
    txSendFail: function txSendFail() {
      return "You rejected the transaction";
    },
    txStall: function txStall(_ref3) {
      var transaction = _ref3.transaction;
      return "Your transaction ID: ".concat(transaction.nonce, " has stalled");
    },
    txFailed: function txFailed(_ref4) {
      var transaction = _ref4.transaction;
      return "Your transaction ID: ".concat(transaction.nonce, " has failed");
    },
    nsfFail: function nsfFail() {
      return 'You have insufficient funds to complete this transaction';
    },
    txRepeat: function txRepeat() {
      return 'This could be a repeat transaction';
    },
    txAwaitingApproval: function txAwaitingApproval() {
      return 'You have a previous transaction awaiting approval';
    },
    txConfirmReminder: function txConfirmReminder() {
      return 'Please confirm your transaction to continue (hint: the transaction window may be behind your browser)';
    },
    txConfirmed: function txConfirmed(_ref5) {
      var transaction = _ref5.transaction;
      return "Your transaction ID: ".concat(transaction.nonce, " has succeeded");
    }
  };

  function createIframe(browserDocument, style) {
    var initialIframeContent = "\n    <html>\n      <head>\n        <style>\n          ".concat(style, "\n        </style>\n      </head>\n      <body></body>\n    </html>\n  ");
    var iframe = browserDocument.createElement('iframe');
    browserDocument.body.appendChild(iframe);
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.height = '100vh';
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.pointerEvents = 'none';
    iframe.style['z-index'] = 999;
    var iWindow = iframe.contentWindow;
    var iDocument = iWindow.document;
    iDocument.open();
    iDocument.write(initialIframeContent);
    iDocument.close();
    updateState({
      iframe: iframe,
      iframeDocument: iDocument,
      iframeWindow: iWindow
    });
  }
  function setupIframe(notificationsList) {
    state.iframe.style.top = '';
    state.iframe.style.left = '';
    state.iframe.style.bottom = '0px';
    state.iframe.style.right = '0px';
    state.iframe.style.height = "".concat(Number(notificationsList.clientHeight) + Number(getById('bn-transaction-branding').clientHeight) + 7 + // for some reason the bn-logo clips if this is not included
    40 // this is the height of the progress-tooltip
    , "px");
    state.iframe.style.width = "".concat(notificationsList.clientWidth + 17 // 17px is the width of the scrollbar
    , "px");
    state.iframe.style.pointerEvents = 'all';
  } // Set the iframe to the size of the notification list

  function resizeIframe() {
    var notificationsContainer = getById('blocknative-notifications');

    if (notificationsContainer) {
      state.iframe.style.height = "".concat(notificationsContainer.clientHeight, "px");
      state.iframe.style.width = "".concat(notificationsContainer.clientWidth, "px");
      state.iframe.style.pointerEvents = 'all';
    }
  }
  function resetIframe() {
    state.iframe.style.top = '0px';
    state.iframe.style.left = '0px';
    state.iframe.style.bottom = '';
    state.iframe.style.right = '';
    state.iframe.style.height = '100vh';
    state.iframe.style.width = '100%';
    state.iframe.style.pointerEvents = 'none';
  }

  function createElementString(type, className, innerHTML) {
    return "\n\t  <".concat(type, " class=\"").concat(className, "\">\n\t    ").concat(innerHTML, "\n\t  </").concat(type, ">\n\t");
  }
  function createElement(el, className, children, id) {
    var element = state.iframeDocument.createElement(el);
    element.className = className || '';

    if (children && typeof children === 'string') {
      element.innerHTML = children;
    }

    if (children && _typeof_1(children) === 'object') {
      element.appendChild(children);
    }

    if (id) {
      element.id = id;
    }

    return element;
  }
  function closeModal() {
    var modal = state.iframeDocument.querySelector('.bn-onboard-modal-shade');
    modal.style.opacity = '0';
    state.iframe.style.pointerEvents = 'none';
    setTimeout(function () {
      state.iframeDocument.body.removeChild(modal);
      var notificationsList = getByQuery('.bn-notifications');

      if (notificationsList) {
        setupIframe(notificationsList);
      }
    }, timeouts.removeElement);
  }
  function openModal(modal) {
    var handlers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var onClick = handlers.onClick,
        onClose = handlers.onClose;
    resetIframe();
    state.iframe.style.pointerEvents = 'all';
    state.iframeDocument.body.appendChild(modal);
    var closeButton = state.iframeDocument.querySelector('.bn-onboard-close');

    closeButton.onclick = function () {
      onClose && onClose();
      closeModal();
    };

    var completeStepButton = modal.querySelector('.bn-btn');

    if (completeStepButton) {
      completeStepButton.onclick = function () {
        onClick && onClick();
      };
    }

    setTimeout(function () {
      modal.style.opacity = '1';
    }, timeouts.endOfEventQueue);
  }
  function notSupportedImage(type) {
    var imageUrl = imageSrc[type];
    return "\n\t  <img\n\t    src=\"".concat(imageUrl.src, "\"\n\t    alt =\"").concat(capitalize(type), "Not Supported\"\n\t    srcset=\"").concat(imageUrl.srcset, "\" />\n  ");
  }
  function browserLogos() {
    var chromeLogo = imageSrc.chromeLogo,
        firefoxLogo = imageSrc.firefoxLogo;
    return "\n    <p>\n      <a href=\"https://www.google.com/chrome/\" target=\"_blank\" class=\"bn-btn bn-btn-primary bn-btn-outline text-center\">\n      <img\n        src=\"".concat(chromeLogo.src, "\" \n        alt=\"Chrome Logo\" \n        srcset=\"").concat(chromeLogo.srcset, "\" />\n      <br>\n      Chrome\n      </a>\n      <a href=\"https://www.mozilla.org/en-US/firefox/\" target=\"_blank\" class=\"bn-btn bn-btn-primary bn-btn-outline text-center\">\n      <img\n        src=\"").concat(firefoxLogo.src, "\" \n        alt=\"Firefox Logo\" \n        srcset=\"").concat(firefoxLogo.src, "\" />\n      <br>\n      Firefox\n      </a>\n    </p>\n  ");
  }
  function onboardBranding() {
    var blockNativeLogo = imageSrc.blockNativeLogo;
    return "\n    <div class=\"bn-onboarding-branding\">\n      <p>Powered by\n      <a href=\"https://www.blocknative.com/\" target=\"_blank\">\n      <img\n        src=\"".concat(blockNativeLogo.src, "\" \n        alt=\"Blocknative\" \n        srcset=\"").concat(blockNativeLogo.srcset, "\" />\n      </a>\n      </p>\n    </div>\n  ");
  }
  function notSupportedModal(type) {
    var info = notSupported["".concat(type, "NotSupported")];
    return "\n    <div id=\"bn-".concat(type, "-not-supported\" class=\"bn-onboard\">\n      <div class=\"bn-onboard-modal bn-onboard-alert\">\n        <a href=\"#\" class=\"bn-onboard-close\">\n          <span class=\"bn-onboard-close-x\"></span>\n        </a>\n        ").concat(notSupportedImage(type), "\n        <br><br>\n        <h1 class=\"h4\">").concat(info.heading, "</h1>\n        <p>").concat(info.description(), "</p>\n        <br>\n        ").concat(type === 'browser' ? "".concat(browserLogos(), "<br>") : '', "\n        ").concat(onboardBranding(), "\n      </div>\n    </div>\n  ");
  }
  function onboardSidebar(step) {
    return "\n    <div class=\"bn-onboard-sidebar\">\n      <h4>Setup Tasks</h4>\n      <ul class=\"bn-onboard-list\">\n        <li class=".concat(step < 1 ? 'bn-inactive' : step > 1 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[1].basic, "\n        </li>\n        <li class=").concat(step < 2 ? 'bn-inactive' : step > 2 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[2].basic, "\n        </li>\n        <li class=").concat(step < 3 ? 'bn-inactive' : step > 3 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[3].basic, "\n        </li>\n        <li class=").concat(step < 4 ? 'bn-inactive' : step > 4 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[4].basic, "\n        </li>\n        <li class=").concat(step < 5 ? 'bn-inactive' : step > 5 ? 'bn-check' : 'bn-active', ">\n          <span class=\"bn-onboard-list-sprite\"></span> ").concat(onboardHeading[5].basic, "\n        </li>\n      </ul>\n      ").concat(onboardBranding(), "\n    </div>\n  ");
  }
  function onboardMain(type, step) {
    var heading = onboardHeading[step][type];
    var description = onboardDescription[step][type]();
    var buttonText = typeof onboardButton[step][type] === 'function' ? onboardButton[step][type]() : onboardButton[step][type];
    var defaultImages = imageSrc[step];
    var images = state.config.images;
    var stepKey = stepToImageKey(step);
    var devImages = images && images[stepKey];
    return "\n    <img\n      src=\"".concat(devImages && devImages.src || defaultImages.src, "\" \n      class=\"bn-onboard-img\" \n      alt=\"Blocknative\" \n      srcset=\"").concat(devImages && devImages.srcset && "".concat(devImages.srcset, " 2x") || defaultImages.srcset, "\"/>\n    <br>\n    <h1 class=\"h4\">").concat(heading, "</h1>\n    <p>").concat(description, "</p>\n    <br>\n    <br>\n    <p class=\"bn-onboard-button-section\">\n      <a href=\"#\"\n         class=\"bn-btn bn-btn-primary bn-btn-outline\">").concat(buttonText, "\n      </a>\n    </p>\n  ");
  }
  function onboardModal(type, step) {
    return "\n    <div id=\"bn-user-".concat(type, "\" class=\"bn-onboard\">\n      <div class=\"bn-onboard-modal bn-onboard-").concat(type, " ").concat(type === 'basic' ? 'clearfix' : '', "\">\n        <a href=\"#\" class=\"bn-onboard-close\">\n          <span class=\"bn-onboard-close-x\"></span>\n        </a>\n        ").concat(type === 'basic' ? onboardSidebar(step) : '', "\n\t\t\t\t").concat(type === 'basic' ? createElementString('div', 'bn-onboard-main', onboardMain(type, step)) : onboardMain(type, step), "\n        ").concat(type === 'advanced' ? "<br>".concat(onboardBranding()) : '', "\n      </div>\n    </div>\n  ");
  }
  function addOnboardWarning(msgType) {
    var existingWarning = getByQuery('.bn-onboard-warning');

    if (existingWarning) {
      return;
    }

    var warning = createElement('span', 'bn-onboard-warning', onboardWarningMsg(msgType));
    var spacer = createElement('br');
    var basicModal = getByQuery('.bn-onboard-main');

    if (basicModal) {
      basicModal.appendChild(spacer);
      basicModal.appendChild(warning);
    } else {
      var modal = getByQuery('.bn-onboard-modal');
      var branding = modal.querySelector('.bn-onboarding-branding');
      modal.insertBefore(warning, branding);
    }
  }
  function getById(id) {
    return state.iframeDocument.getElementById(id);
  }
  function getByQuery(query) {
    return state.iframeDocument.querySelector(query);
  }
  function createTransactionBranding() {
    var blockNativeBrand = createElement('a', null, null, 'bn-transaction-branding');
    blockNativeBrand.href = 'https://www.blocknative.com/';
    blockNativeBrand.target = '_blank';
    return blockNativeBrand;
  }
  function notificationContent(type, message) {
    var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var showTime = time.showTime,
        startTime = time.startTime,
        timeStamp = time.timeStamp;
    var elapsedTime = timeString(Date.now() - startTime);
    return "\n\t\t<span class=\"bn-status-icon\">\n\t\t\t".concat(type === 'progress' ? "<div class=\"progress-tooltip\">\n\t\t\t\t<div class=\"progress-tooltip-inner\">\n\t\t\t\t\tYou will be notified when this transaction is completed.\n\t\t\t\t</div>\n\t\t\t</div>" : '', "\n\t\t</span>\n\t\t<div class=\"bn-notification-info\">\n\t\t\t<p>").concat(message, "</p>\n\t\t\t<p class=\"bn-notification-meta\">\n\t\t\t\t<a href=\"#\" class=\"bn-timestamp\">").concat(timeStamp, "</a>\n\t\t\t\t<span class=\"bn-duration").concat(showTime ? '' : ' bn-duration-hidden', "\"> - \n\t\t\t\t\t<i class=\"bn-clock\"></i>\n\t\t\t\t\t<span class=\"bn-duration-time\">").concat(elapsedTime, "</span>\n\t\t\t\t</span>\n\t\t\t</p>\n\t\t</div>\n\t");
  } // Start clock

  function startTimerInterval(notificationId, startTime) {
    var notification = getById(notificationId);

    if (!notification) {
      return null;
    }

    var intervalId = setInterval(function () {
      var timeContainer = notification.querySelector('.bn-duration');

      if (timeContainer.classList.contains('bn-duration-hidden')) {
        timeContainer.classList.remove('bn-duration-hidden');
      }

      var durationContainer = timeContainer.querySelector('.bn-duration-time');
      var elapsedTime = timeString(Date.now() - startTime);
      durationContainer.innerHTML = "".concat(elapsedTime);
    }, 1000);
    return intervalId;
  }
  function showElement(element, timeout) {
    setTimeout(function () {
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    }, timeout);
  }
  function hideElement(element) {
    setTimeout(function () {
      element.style.transform = 'translateX(600px)';
      element.style.opacity = '0';
    }, timeouts.hideElement);
  }
  function removeElement(parent, element) {
    setTimeout(function () {
      if (parent.contains(element)) {
        parent.removeChild(element);
        resizeIframe();

        if (parent !== state.iframeDocument.body) {
          checkIfNotifications();
        }
      }
    }, timeouts.removeElement);
  } // Remove notification from DOM

  function removeNotification(notification) {
    var notificationsList = getByQuery('.bn-notifications');
    hideElement(notification);
    removeElement(notificationsList, notification);
  }
  function removeAllNotifications(queries) {
    var notificationsToRemove = queries.reduce(function (allNotifications, query) {
      if (query) {
        var newNotifications = Array.from(state.iframeDocument.querySelectorAll(query));
        return [].concat(toConsumableArray(allNotifications), toConsumableArray(newNotifications));
      }

      return allNotifications;
    }, []);

    if (notificationsToRemove.length > 0) {
      notificationsToRemove.forEach(function (notification) {
        if (notification) {
          setTimeout(function () {
            removeNotification(notification);
          }, timeouts.removeElement);
        }
      });
    }
  }
  function checkIfNotifications() {
    var notificationsList = getByQuery('.bn-notifications');
    var allNotifications = Array.from(notificationsList.querySelectorAll('.bn-notification'));
    var visibleNotifications = allNotifications.filter(function (notification) {
      return notification.style.opacity !== '0';
    });

    if (visibleNotifications.length === 0) {
      removeContainer();
    } else {
      setContainerHeight();
    }
  } // Remove notification container from DOM

  function removeContainer() {
    var notificationsContainer = getById('blocknative-notifications');
    hideElement(notificationsContainer);
    removeElement(state.iframeDocument.body, notificationsContainer);
    resetIframe();
  }
  function setContainerHeight() {
    var scrollContainer = getByQuery('.bn-notifications-scroll');
    var maxHeight = Number(window.innerHeight) - Number(getById('bn-transaction-branding').clientHeight) - 13; // needed to have some padding on the top

    var listHeight = Number(getByQuery('.bn-notifications').clientHeight);

    if (listHeight > maxHeight) {
      scrollContainer.style.height = maxHeight;
    } else {
      scrollContainer.style.height = 'auto';
    }
  }

  var eventToUI = {
    initialize: {
      mobileBlocked: notSupportedUI
    },
    onboard: {
      browserFail: notSupportedUI,
      mobileBlocked: notSupportedUI,
      welcomeUser: onboardingUI,
      walletFail: onboardingUI,
      walletLogin: onboardingUI,
      walletLoginEnable: onboardingUI,
      walletEnable: onboardingUI,
      networkFail: onboardingUI,
      nsfFail: onboardingUI,
      newOnboardComplete: onboardingUI
    },
    activePreflight: {
      mobileBlocked: notSupportedUI,
      welcomeUser: onboardingUI,
      walletFail: onboardingUI,
      walletLogin: onboardingUI,
      walletLoginEnable: onboardingUI,
      walletEnable: onboardingUI,
      networkFail: onboardingUI,
      nsfFail: notificationsUI,
      newOnboardComplete: onboardingUI,
      txRepeat: notificationsUI
    },
    activeTransaction: {
      txAwaitingApproval: notificationsUI,
      txSent: notificationsUI,
      txPending: notificationsUI,
      txSendFail: notificationsUI,
      txConfirmReminder: notificationsUI,
      txConfirmed: notificationsUI,
      txConfirmedClient: notificationsUI,
      txStall: notificationsUI,
      txFailed: notificationsUI
    },
    activeContract: {
      contractQueryFail: onboardingUI,
      txAwaitingApproval: notificationsUI,
      txSent: notificationsUI,
      txPending: notificationsUI,
      txSendFail: notificationsUI,
      txConfirmReminder: notificationsUI,
      txConfirmed: notificationsUI,
      txConfirmedClient: notificationsUI,
      txStall: notificationsUI,
      txFailed: notificationsUI
    }
  };

  function notSupportedUI(eventObj, handlers) {
    var eventCode = eventObj.eventCode;
    var modal = createElement('div', 'bn-onboard-modal-shade', notSupportedModal(eventCodeToStep(eventCode)));
    openModal(modal, handlers);
  }

  function onboardingUI(eventObj, handlers) {
    var existingModal = state.iframeDocument.querySelector('.bn-onboard-modal-shade');

    if (existingModal) {
      return;
    }

    var eventCode = eventObj.eventCode;
    var newUser = getItem('_assist_newUser') === 'true';
    var type = newUser ? 'basic' : 'advanced';
    var modal = createElement('div', 'bn-onboard-modal-shade', onboardModal(type, eventCodeToStep(eventCode)));
    openModal(modal, handlers);
  }

  var notificationsNoRepeat = ['nsfFail', 'txSendFail', 'txStall', 'txRepeat', 'txAwaitingApproval', 'txConfirmReminder'];

  function notificationsUI(eventObj) {
    var _eventObj$transaction = eventObj.transaction,
        transaction = _eventObj$transaction === void 0 ? {} : _eventObj$transaction,
        _eventObj$contract = eventObj.contract,
        contract = _eventObj$contract === void 0 ? {} : _eventObj$contract;
    var eventCode = eventObj.eventCode; // replace eventCode to get the same messages if it's a client confirm

    if (eventCode === 'txConfirmedClient') {
      eventCode = 'txConfirmed';
    }

    var type = eventCodeToType(eventCode);
    var id = transaction && transaction.hash || eventCode;
    var timeStamp = formatTime(Date.now());
    var message = state.config.messages && typeof state.config.messages[eventCode] === 'function' && state.config.messages[eventCode]({
      transaction: transaction,
      contract: contract
    }) ? state.config.messages[eventCode]({
      transaction: transaction,
      contract: contract
    }) : transactionMsgs[eventCode]({
      transaction: transaction,
      contract: contract
    });
    var startTime = transaction && transaction.startTime;
    var hasTimer = eventCode === 'txPending' || eventCode === 'txSent' || eventCode === 'txStall';
    var showTime = hasTimer || eventCode === 'txConfirmed' || eventCode === 'txFailed';
    var blockNativeBrand;
    var existingNotifications;
    var notificationsList;
    var notificationsScroll;
    var notificationsContainer = getById('blocknative-notifications');

    if (notificationsContainer) {
      existingNotifications = true;
      notificationsList = getByQuery('.bn-notifications');
      var pendingNotificationToRemove = getById("".concat(id, "-progress")); // if pending notification with the same id, we can remove it to be replaced with new status

      if (pendingNotificationToRemove) {
        removeNotification(pendingNotificationToRemove);
      } // remove all notifications we don't want to repeat


      removeAllNotifications(notificationsNoRepeat.map(function (eventCode) {
        return ".bn-".concat(eventCode);
      }));
    } else {
      existingNotifications = false;
      notificationsContainer = createElement('div', null, null, 'blocknative-notifications');
      blockNativeBrand = createTransactionBranding();
      notificationsList = createElement('ul', 'bn-notifications');
      notificationsScroll = createElement('div', 'bn-notifications-scroll');
    }

    var notification = createElement('li', "bn-notification bn-".concat(type, " bn-").concat(eventCode), notificationContent(type, message, {
      startTime: startTime,
      showTime: showTime,
      timeStamp: timeStamp
    }), "".concat(id, "-").concat(type));
    notificationsList.appendChild(notification);

    if (!existingNotifications) {
      notificationsScroll.appendChild(notificationsList);
      notificationsContainer.appendChild(notificationsScroll);
      notificationsContainer.appendChild(blockNativeBrand);
      state.iframeDocument.body.appendChild(notificationsContainer);
      showElement(notificationsContainer, timeouts.showElement);
    }

    setupIframe(notificationsList);
    setContainerHeight();
    showElement(notification, timeouts.showElement);
    var intervalId;

    if (hasTimer) {
      setTimeout(function () {
        intervalId = startTimerInterval("".concat(id, "-").concat(type), startTime);
      }, timeouts.changeUI);
    }

    var dismissButton = notification.querySelector('.bn-status-icon');

    dismissButton.onclick = function () {
      intervalId && clearInterval(intervalId);
      removeNotification(notification);
    };

    if (type === 'complete') {
      setTimeout(function () {
        return removeNotification(notification);
      }, timeouts.autoRemoveNotification);
    }
  }

  function openWebsocketConnection() {
    updateState({
      pendingSocketConnection: true
    });
    var socket;

    try {
      socket = new WebSocket('wss://api.blocknative.com/v0');
    } catch (errorObj) {
      assistLog(errorObj);
    }

    socket.addEventListener('message', handleSocketMessage);
    socket.addEventListener('close', function () {
      return updateState({
        socketConnection: false
      });
    });
    socket.addEventListener('error', function () {
      updateState({
        pendingSocketConnection: false
      });
    });
    socket.addEventListener('open', function () {
      updateState({
        socket: socket,
        socketConnection: true,
        pendingSocketConnection: false
      });
      handleEvent({
        categoryCode: 'initialize',
        eventCode: 'checkDappId',
        connectionId: getItem('connectionId')
      });
    });
  } // Handle in coming socket messages

  function handleSocketMessage(msg) {
    var _JSON$parse = JSON.parse(msg.data),
        status = _JSON$parse.status,
        reason = _JSON$parse.reason,
        event = _JSON$parse.event,
        connectionId = _JSON$parse.connectionId;

    var validApiKey = state.validApiKey,
        supportedNetwork = state.supportedNetwork;

    if (!validApiKey || !supportedNetwork) {
      return;
    } // handle any errors from the server


    if (status === 'error') {
      if (reason.includes('not a valid API key') && event.eventCode !== 'initFail') {
        updateState({
          validApiKey: false
        });
        handleEvent({
          eventCode: 'initFail',
          categoryCode: 'initialize',
          reason: reason
        });
        var errorObj = new Error(reason);
        errorObj.eventCode = 'initFail';
        throw errorObj;
      }

      if (reason.includes('network not supported') && event.eventCode !== 'initFail') {
        updateState({
          supportedNetwork: false
        });
        handleEvent({
          eventCode: 'initFail',
          categoryCode: 'initialize',
          reason: reason
        });

        var _errorObj = new Error(reason);

        _errorObj.eventCode = 'initFail';
        throw _errorObj;
      }
    }

    if (status === 'ok' && event && event.eventCode === 'checkDappId') {
      handleEvent({
        eventCode: 'initSuccess',
        categoryCode: 'initialize'
      });
      updateState({
        validApiKey: true,
        supportedNetwork: true
      });
    }

    if (connectionId && (!state.connectionId || connectionId !== state.connectionId)) {
      storeItem('connectionId', connectionId);
      updateState({
        connectionId: connectionId
      });
    }

    if (event && event.transaction) {
      var transaction = event.transaction;

      if (transaction.status) {
        var txObj = getTransactionObj(transaction.hash);

        switch (transaction.status) {
          case 'pending':
            nowInTxPool(transaction.hash);
            handleEvent({
              eventCode: 'txPending',
              categoryCode: 'activeTransaction',
              transaction: txObj.transaction,
              contract: txObj.contract
            });
            break;

          case 'confirmed':
            handleEvent({
              eventCode: 'txConfirmed',
              categoryCode: 'activeTransaction',
              transaction: txObj.transaction,
              contract: txObj.contract
            });
            updateState({
              transactionQueue: removeTransactionFromQueue(txObj.transaction.nonce)
            });
            break;

          case 'failed':
            handleEvent({
              eventCode: 'txFailed',
              categoryCode: 'activeTransaction',
              transaction: txObj.transaction,
              contract: txObj.contract
            });
            break;

          default:
        }
      }
    }
  }

  function handleEvent(eventObj, clickHandlers) {
    var eventCode = eventObj.eventCode,
        categoryCode = eventObj.categoryCode;
    var serverEvent = eventCode === 'txPending' || eventCode === 'txConfirmed' || eventCode === 'txFailed'; // If not a server event then log it

    !serverEvent && lib.logEvent(eventObj); // if the tx is not in the queue then it has been previously confirmed
    // so just return and don't show UI

    if (eventCode === 'txConfirmed' || eventCode === 'txConfirmedClient') {
      var inTxQueue = getTransactionObj(eventObj.transaction.hash);

      if (!inTxQueue) {
        return;
      }
    } // Show UI


    if (state.config && !state.config.headlessMode) {
      eventToUI[categoryCode] && eventToUI[categoryCode][eventCode] && eventToUI[categoryCode][eventCode](eventObj, clickHandlers);
    }
  } // Create event log to be sent to server

  function createEventLog(eventObj) {
    var _state$config = state.config,
        dappId = _state$config.dappId,
        networkId = _state$config.networkId,
        headlessMode = _state$config.headlessMode;
    var userAgent = state.userAgent,
        version = state.version;
    var newUser = getItem('_assist_newUser') === 'true';
    return JSON.stringify(Object.assign({}, {
      timeStamp: new Date(),
      dappId: dappId,
      version: version,
      userAgent: userAgent,
      newUser: newUser,
      headlessMode: headlessMode,
      blockchain: {
        system: 'ethereum',
        network: networkName(networkId)
      }
    }, eventObj));
  } // Log events to server

  function logEvent(eventObj) {
    var eventLog = createEventLog(eventObj);
    var socket = state.socket,
        socketConnection = state.socketConnection;
    socketConnection && socket.send(eventLog); // Need to check if connection dropped
    // as we don't know until after we try to send a message

    setTimeout(function () {
      if (!state.socketConnection) {
        if (!state.pendingSocketConnection) {
          openWebsocketConnection();
        }

        setTimeout(function () {
          logEvent(eventObj);
        }, timeouts.checkSocketConnection);
      }
    }, timeouts.checkSocketConnection);
  }
  var lib = {
    handleEvent: handleEvent,
    createEventLog: createEventLog,
    logEvent: logEvent
  };

  var es5 = createCommonjsModule(function (module, exports) {
  !function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n});},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0});},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=70)}({18:function(e,t,r){var n,i,s;i=[e],void 0===(s="function"==typeof(n=function(e){var t=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),r=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}return t(e,null,[{key:"getFirstMatch",value:function(e,t){var r=t.match(e);return r&&r.length>0&&r[1]||""}},{key:"getSecondMatch",value:function(e,t){var r=t.match(e);return r&&r.length>1&&r[2]||""}},{key:"matchAndReturnConst",value:function(e,t,r){if(e.test(t))return r}},{key:"getWindowsVersionName",value:function(e){switch(e){case"NT":return "NT";case"XP":return "XP";case"NT 5.0":return "2000";case"NT 5.1":return "XP";case"NT 5.2":return "2003";case"NT 6.0":return "Vista";case"NT 6.1":return "7";case"NT 6.2":return "8";case"NT 6.3":return "8.1";case"NT 10.0":return "10";default:return}}},{key:"getVersionPrecision",value:function(e){return e.split(".").length}},{key:"compareVersions",value:function(t,r){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=e.getVersionPrecision(t),s=e.getVersionPrecision(r),o=Math.max(i,s),a=0,u=e.map([t,r],function(t){var r=o-e.getVersionPrecision(t),n=t+new Array(r+1).join(".0");return e.map(n.split("."),function(e){return new Array(20-e.length).join("0")+e}).reverse()});for(n&&(a=o-Math.min(i,s)),o-=1;o>=a;){if(u[0][o]>u[1][o])return 1;if(u[0][o]===u[1][o]){if(o===a)return 0;o-=1;}else if(u[0][o]<u[1][o])return -1}}},{key:"map",value:function(e,t){var r=[],n=void 0;if(Array.prototype.map)return Array.prototype.map.call(e,t);for(n=0;n<e.length;n+=1)r.push(t(e[n]));return r}}]),e}();e.exports=r;})?n.apply(t,i):n)||(e.exports=s);},65:function(e,t,r){var n,i,s;i=[t,r(18)],void 0===(s="function"==typeof(n=function(t,r){Object.defineProperty(t,"__esModule",{value:!0}),t.default=[{test:function(e){return "microsoft edge"===e.getBrowserName(!0)},describe:function(e){var t=(0, r.getFirstMatch)(/edge\/(\d+(\.?_?\d+)+)/i,e);return {name:"EdgeHTML",version:t}}},{test:[/trident/i],describe:function(e){var t={name:"Trident"},n=(0, r.getFirstMatch)(/trident\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){return e.test(/presto/i)},describe:function(e){var t={name:"Presto"},n=(0, r.getFirstMatch)(/presto\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){var t=e.test(/gecko/i),r=e.test(/like gecko/i);return t&&!r},describe:function(e){var t={name:"Gecko"},n=(0, r.getFirstMatch)(/gecko\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/(apple)?webkit\/537\.36/i],describe:function(){return {name:"Blink"}}},{test:[/(apple)?webkit/i],describe:function(e){var t={name:"WebKit"},n=(0, r.getFirstMatch)(/webkit\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}}],e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},66:function(e,t,r){var n,i,s;i=[t,r(18)],void 0===(s="function"==typeof(n=function(t,r){Object.defineProperty(t,"__esModule",{value:!0});var n={tablet:"tablet",mobile:"mobile",desktop:"desktop"};t.default=[{test:[/nexus\s*(?:7|8|9|10).*/i],describe:function(){return {type:n.tablet,vendor:"Nexus"}}},{test:[/ipad/i],describe:function(){return {type:n.tablet,vendor:"Apple",model:"iPad"}}},{test:[/kftt build/i],describe:function(){return {type:n.tablet,vendor:"Amazon",model:"Kindle Fire HD 7"}}},{test:[/silk/i],describe:function(){return {type:n.tablet,vendor:"Amazon"}}},{test:[/tablet/i],describe:function(){return {type:n.tablet}}},{test:function(e){var t=e.test(/ipod|iphone/i),r=e.test(/like (ipod|iphone)/i);return t&&!r},describe:function(e){var t=(0, r.getFirstMatch)(/(ipod|iphone)/i,e);return {type:n.mobile,vendor:"Apple",model:t}}},{test:[/nexus\s*[0-6].*/i,/galaxy nexus/i],describe:function(){return {type:n.mobile,vendor:"Nexus"}}},{test:[/[^-]mobi/i],describe:function(){return {type:n.mobile}}},{test:function(e){return "blackberry"===e.getBrowserName(!0)},describe:function(){return {type:n.mobile,vendor:"BlackBerry"}}},{test:function(e){return "bada"===e.getBrowserName(!0)},describe:function(){return {type:n.mobile}}},{test:function(e){return "windows phone"===e.getBrowserName()},describe:function(){return {type:n.mobile,vendor:"Microsoft"}}},{test:function(e){var t=Number(String(e.getOSVersion()).split(".")[0]);return "android"===e.getOSName(!0)&&t>=3},describe:function(){return {type:n.tablet}}},{test:function(e){return "android"===e.getOSName(!0)},describe:function(){return {type:n.mobile}}},{test:function(e){return "macos"===e.getOSName(!0)},describe:function(){return {type:n.desktop,vendor:"Apple"}}},{test:function(e){return "windows"===e.getOSName(!0)},describe:function(){return {type:n.desktop}}},{test:function(e){return "linux"===e.getOSName(!0)},describe:function(){return {type:n.desktop}}}],e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},67:function(e,t,r){var n,i,s;i=[t,r(18)],void 0===(s="function"==typeof(n=function(t,r){Object.defineProperty(t,"__esModule",{value:!0}),t.default=[{test:[/windows phone/i],describe:function(e){var t=(0, r.getFirstMatch)(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i,e);return {name:"Windows Phone",version:t}}},{test:[/windows/i],describe:function(e){var t=(0, r.getFirstMatch)(/Windows ((NT|XP)( \d\d?.\d)?)/i,e),n=(0, r.getWindowsVersionName)(t);return {name:"Windows",version:t,versionName:n}}},{test:[/macintosh/i],describe:function(e){var t=(0, r.getFirstMatch)(/mac os x (\d+(\.?_?\d+)+)/i,e).replace(/[_\s]/g,".");return {name:"macOS",version:t}}},{test:[/(ipod|iphone|ipad)/i],describe:function(e){var t=(0, r.getFirstMatch)(/os (\d+([_\s]\d+)*) like mac os x/i,e).replace(/[_\s]/g,".");return {name:"iOS",version:t}}},{test:function(e){var t=!e.test(/like android/i),r=e.test(/android/i);return t&&r},describe:function(e){var t=(0, r.getFirstMatch)(/android[\s/-](\d+(\.\d+)*)/i,e);return {name:"Android",version:t}}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t=(0, r.getFirstMatch)(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i,e),n={name:"WebOS"};return t&&t.length&&(n.version=t),n}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t=(0, r.getFirstMatch)(/rim\stablet\sos\s(\d+(\.\d+)*)/i,e)||(0, r.getFirstMatch)(/blackberry\d+\/(\d+([_\s]\d+)*)/i,e)||(0, r.getFirstMatch)(/\bbb(\d+)/i,e);return {name:"BlackBerry",version:t}}},{test:[/bada/i],describe:function(e){var t=(0, r.getFirstMatch)(/bada\/(\d+(\.\d+)*)/i,e);return {name:"Bada",version:t}}},{test:[/tizen/i],describe:function(e){var t=(0, r.getFirstMatch)(/tizen[/\s](\d+(\.\d+)*)/i,e);return {name:"Tizen",version:t}}},{test:[/linux/i],describe:function(){return {name:"Linux"}}}],e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},68:function(e,t,r){var n,i,s;i=[t,r(18)],void 0===(s="function"==typeof(n=function(t,r){Object.defineProperty(t,"__esModule",{value:!0});var n=/version\/(\d+(\.?_?\d+)+)/i,i=[{test:[/opera/i],describe:function(e){var t={name:"Opera"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/opr\/|opios/i],describe:function(e){var t={name:"Opera"},i=(0, r.getFirstMatch)(/(?:opr|opios)[\s/](\S+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/SamsungBrowser/i],describe:function(e){var t={name:"Samsung Internet for Android"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/Whale/i],describe:function(e){var t={name:"NAVER Whale Browser"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:whale)[\s/](\d+(?:\.\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/MZBrowser/i],describe:function(e){var t={name:"MZ Browser"},i=(0, r.getFirstMatch)(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/focus/i],describe:function(e){var t={name:"Focus"},i=(0, r.getFirstMatch)(/(?:focus)[\s/](\d+(?:\.\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/swing/i],describe:function(e){var t={name:"Swing"},i=(0, r.getFirstMatch)(/(?:swing)[\s/](\d+(?:\.\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/coast/i],describe:function(e){var t={name:"Opera Coast"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/yabrowser/i],describe:function(e){var t={name:"Yandex Browser"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/ucbrowser/i],describe:function(e){var t={name:"UC Browser"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/Maxthon|mxios/i],describe:function(e){var t={name:"Maxthon"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/epiphany/i],describe:function(e){var t={name:"Epiphany"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/puffin/i],describe:function(e){var t={name:"Puffin"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/sleipnir/i],describe:function(e){var t={name:"Sleipnir"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/k-meleon/i],describe:function(e){var t={name:"K-Meleon"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/msie|trident/i],describe:function(e){var t={name:"Internet Explorer"},n=(0, r.getFirstMatch)(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/edg([ea]|ios)/i],describe:function(e){var t={name:"Microsoft Edge"},n=(0, r.getSecondMatch)(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/vivaldi/i],describe:function(e){var t={name:"Vivaldi"},n=(0, r.getFirstMatch)(/vivaldi\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/seamonkey/i],describe:function(e){var t={name:"SeaMonkey"},n=(0, r.getFirstMatch)(/seamonkey\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/sailfish/i],describe:function(e){var t={name:"Sailfish"},n=(0, r.getFirstMatch)(/sailfish\s?browser\/(\d+(\.\d+)?)/i,e);return n&&(t.version=n),t}},{test:[/silk/i],describe:function(e){var t={name:"Amazon Silk"},n=(0, r.getFirstMatch)(/silk\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/phantom/i],describe:function(e){var t={name:"PhantomJS"},n=(0, r.getFirstMatch)(/phantomjs\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/slimerjs/i],describe:function(e){var t={name:"SlimerJS"},n=(0, r.getFirstMatch)(/slimerjs\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t={name:"BlackBerry"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t={name:"WebOS Browser"},i=(0, r.getFirstMatch)(n,e)||(0, r.getFirstMatch)(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i,e);return i&&(t.version=i),t}},{test:[/bada/i],describe:function(e){var t={name:"Bada"},n=(0, r.getFirstMatch)(/dolfin\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/tizen/i],describe:function(e){var t={name:"Tizen"},i=(0, r.getFirstMatch)(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/qupzilla/i],describe:function(e){var t={name:"QupZilla"},i=(0, r.getFirstMatch)(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/firefox|iceweasel|fxios/i],describe:function(e){var t={name:"Firefox"},n=(0, r.getFirstMatch)(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/chromium/i],describe:function(e){var t={name:"Chromium"},i=(0, r.getFirstMatch)(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/chrome|crios|crmo/i],describe:function(e){var t={name:"Chrome"},n=(0, r.getFirstMatch)(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){var t=!e.test(/like android/i),r=e.test(/android/i);return t&&r},describe:function(e){var t={name:"Android Browser"},i=(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/safari|applewebkit/i],describe:function(e){var t={name:"Safari"},i=(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/googlebot/i],describe:function(e){var t={name:"Googlebot"},i=(0, r.getFirstMatch)(/googlebot\/(\d+(\.\d+))/i,e)||(0, r.getFirstMatch)(n,e);return i&&(t.version=i),t}},{test:[/.*/i],describe:function(e){return {name:(0, r.getFirstMatch)(/^(.*)\/(.*) /,e),version:(0, r.getSecondMatch)(/^(.*)\/(.*) /,e)}}}];t.default=i,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},69:function(e,t,r){var n,i,s;i=[t,r(68),r(67),r(66),r(65),r(18)],void 0===(s="function"==typeof(n=function(t,r,n,i,s,o){Object.defineProperty(t,"__esModule",{value:!0});var a=f(r),u=f(n),c=f(i),d=f(s);function f(e){return e&&e.__esModule?e:{default:e}}var l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},v=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),p=function(){function e(t){var r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),void 0===t||null===t||""===t)throw new Error("UserAgent parameter can't be empty");this._ua=t,this.parsedResult={},!0!==r&&this.parse();}return v(e,[{key:"getUA",value:function(){return this._ua}},{key:"test",value:function(e){return e.test(this._ua)}},{key:"parseBrowser",value:function(){var e=this;this.parsedResult.browser={};var t=a.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.browser=t.describe(this.getUA())),this.parsedResult.browser}},{key:"getBrowser",value:function(){return this.parsedResult.browser?this.parsedResult.browser:this.parseBrowser()}},{key:"getBrowserName",value:function(e){return e?String(this.getBrowser().name).toLowerCase()||"":this.getBrowser().name||""}},{key:"getBrowserVersion",value:function(){return this.getBrowser().version}},{key:"getOS",value:function(){return this.parsedResult.os?this.parsedResult.os:this.parseOS()}},{key:"parseOS",value:function(){var e=this;this.parsedResult.os={};var t=u.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.os=t.describe(this.getUA())),this.parsedResult.os}},{key:"getOSName",value:function(e){var t=this.getOS(),r=t.name;return e?String(r).toLowerCase()||"":r||""}},{key:"getOSVersion",value:function(){return this.getOS().version}},{key:"getPlatform",value:function(){return this.parsedResult.platform?this.parsedResult.platform:this.parsePlatform()}},{key:"getPlatformType",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=this.getPlatform(),r=t.type;return e?String(r).toLowerCase()||"":r||""}},{key:"parsePlatform",value:function(){var e=this;this.parsedResult.platform={};var t=c.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.platform=t.describe(this.getUA())),this.parsedResult.platform}},{key:"getEngine",value:function(){return this.parsedResult.engine?this.parsedResult.engine:this.parseEngine()}},{key:"parseEngine",value:function(){var e=this;this.parsedResult.engine={};var t=d.default.find(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some(function(t){return e.test(t)});throw new Error("Browser's test function is not valid")});return t&&(this.parsedResult.engine=t.describe(this.getUA())),this.parsedResult.engine}},{key:"parse",value:function(){return this.parseBrowser(),this.parseOS(),this.parsePlatform(),this.parseEngine(),this}},{key:"getResult",value:function(){return this.parsedResult}},{key:"satisfies",value:function(e){var t=this,r={},n=0,i={},s=0,o=Object.keys(e);if(o.forEach(function(t){var o=e[t];"string"==typeof o?(i[t]=o,s+=1):"object"===(void 0===o?"undefined":l(o))&&(r[t]=o,n+=1);}),n>0){var a=Object.keys(r),u=a.find(function(e){return t.isOS(e)});if(u){var c=this.satisfies(r[u]);if(void 0!==c)return c}var d=a.find(function(e){return t.isPlatform(e)});if(d){var f=this.satisfies(r[d]);if(void 0!==f)return f}}if(s>0){var v=Object.keys(i),p=v.find(function(e){return t.isBrowser(e)});if(void 0!==p)return this.compareVersion(i[p])}}},{key:"isBrowser",value:function(e){return this.getBrowserName(!0)===String(e).toLowerCase()}},{key:"compareVersion",value:function(e){var t=0,r=e,n=!1,i=this.getBrowserVersion();if("string"==typeof i)return ">"===e[0]?(t=1,r=e.substr(1)):"<"===e[0]?(t=-1,r=e.substr(1)):"="===e[0]?r=e.substr(1):"~"===e[0]&&(n=!0,r=e.substr(1)),(0, o.compareVersions)(i,r,n)===t}},{key:"isOS",value:function(e){return this.getOSName(!0)===String(e).toLowerCase()}},{key:"isPlatform",value:function(e){return this.getPlatformType(!0)===String(e).toLowerCase()}},{key:"is",value:function(e){return this.isBrowser(e)||this.isOS(e)||this.isPlatform(e)}},{key:"some",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return t.some(function(t){return e.is(t)})}}]),e}();t.default=p,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);},70:function(e,t,r){var n,i,s;i=[t,r(69)],void 0===(s="function"==typeof(n=function(t,r){Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e&&e.__esModule?e:{default:e}}(r),i=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),s=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e);}return i(e,null,[{key:"getParser",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if("string"!=typeof e)throw new Error("UserAgent should be a string");return new n.default(e,t)}},{key:"parse",value:function(e){return new n.default(e).getResult()}}]),e}();t.default=s,e.exports=t.default;})?n.apply(t,i):n)||(e.exports=s);}})});
  });

  var bowser = unwrapExports(es5);
  var es5_1 = es5.bowser;

  function getUserAgent() {
    var browser = bowser.getParser(window.navigator.userAgent);
    var userAgent = browser.parse().parsedResult;
    updateState({
      userAgent: userAgent,
      mobileDevice: userAgent.platform.type !== 'desktop'
    });
  } // Check if valid browser

  function checkValidBrowser() {
    var browser = bowser.getParser(window.navigator.userAgent);
    var validBrowser = browser.satisfies({
      desktop: {
        chrome: '>49',
        firefox: '>52',
        opera: '>36'
      }
    });
    updateState({
      validBrowser: validBrowser
    });
  }

  var errorObj = new Error('undefined version of web3');
  errorObj.eventCode = 'initFail';
  var web3Functions = {
    networkId: function networkId(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.version.getNetwork);

        case '1.0':
          return state.web3Instance.eth.net.getId;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    nonce: function nonce(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.eth.getTransactionCount);

        case '1.0':
          return state.web3Instance.eth.getTransactionCount;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    bigNumber: function bigNumber(version) {
      switch (version) {
        case '0.2':
          return function (value) {
            return Promise.resolve(state.web3Instance.toBigNumber(formatNumber(value)));
          };

        case '1.0':
          return function (value) {
            return Promise.resolve(state.web3Instance.utils.toBN(formatNumber(value)));
          };

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    gasPrice: function gasPrice(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.eth.getGasPrice);

        case '1.0':
          return state.web3Instance.eth.getGasPrice;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    contractGas: function contractGas(version) {
      switch (version) {
        case '0.2':
          return function (contractMethod, parameters, txObject) {
            return bluebird_1(contractMethod.estimateGas).apply(void 0, toConsumableArray(parameters).concat([txObject]));
          };

        case '1.0':
          return function (contractMethod, parameters, txObject) {
            return contractMethod.apply(void 0, toConsumableArray(parameters)).estimateGas(txObject);
          };

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    transactionGas: function transactionGas(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.eth.estimateGas);

        case '1.0':
          return state.web3Instance.eth.estimateGas;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    balance: function balance(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.eth.getBalance);

        case '1.0':
          return state.web3Instance.eth.getBalance;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    },
    accounts: function accounts(version) {
      switch (version) {
        case '0.2':
          return bluebird_1(state.web3Instance.eth.getAccounts);

        case '1.0':
          return state.web3Instance.eth.getAccounts;

        default:
          return function () {
            return Promise.reject(errorObj);
          };
      }
    }
  };
  function configureWeb3(web3) {
    if (!web3) {
      web3 = window.web3; // eslint-disable-line prefer-destructuring
    } // If web3 has been prefaced with the default property, re-assign it


    if (web3.default) {
      web3 = web3.default;
    } // Check which version of web3 we are working with


    var legacyWeb3;
    var modernWeb3;
    var web3Version;

    if (web3.version.api && typeof web3.version.api === 'string') {
      legacyWeb3 = true;
      modernWeb3 = false;
      web3Version = web3.version.api;
    } else if (web3.version && typeof web3.version === 'string') {
      legacyWeb3 = false;
      modernWeb3 = true;
      web3Version = web3.version;
    } else {
      legacyWeb3 = false;
      modernWeb3 = false;
      web3Version = undefined;
    } // Update the state


    updateState({
      legacyWeb3: legacyWeb3,
      modernWeb3: modernWeb3,
      web3Version: web3Version,
      web3Instance: web3
    });
  }
  function checkForWallet() {
    if (window.ethereum) {
      updateState({
        currentProvider: getCurrentProvider(),
        validBrowser: true,
        web3Wallet: true,
        legacyWallet: false,
        modernWallet: true
      });
    } else if (window.web3) {
      updateState({
        currentProvider: getCurrentProvider(),
        validBrowser: true,
        web3Wallet: true,
        legacyWallet: true,
        modernWallet: false
      });
    } else {
      updateState({
        web3Wallet: false,
        accessToAccounts: false,
        walletLoggedIn: false,
        walletEnabled: false
      });
    }
  }
  function getNetworkId() {
    var version = state.web3Version && state.web3Version.slice(0, 3);
    return web3Functions.networkId(version)();
  }
  function getNonce(address) {
    var version = state.web3Version && state.web3Version.slice(0, 3);
    return web3Functions.nonce(version)(address);
  }
  function hasSufficientBalance() {
    var txObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var contractMethod = arguments.length > 1 ? arguments[1] : undefined;
    var methodArgs = arguments.length > 2 ? arguments[2] : undefined;
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee(resolve, reject) {
        var version, transactionValue, gasPrice, gas, transactionFee, buffer, totalTransactionCost, balance, accountBalance, sufficientBalance, transactionParams;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                version = state.web3Version && state.web3Version.slice(0, 3);

                if (!txObject.value) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return web3Functions.bigNumber(version)(txObject.value).catch(handleError('web3', reject));

              case 4:
                _context.t0 = _context.sent;
                _context.next = 10;
                break;

              case 7:
                _context.next = 9;
                return web3Functions.bigNumber(version)('0').catch(handleError('web3', reject));

              case 9:
                _context.t0 = _context.sent;

              case 10:
                transactionValue = _context.t0;

                if (!txObject.gasPrice) {
                  _context.next = 17;
                  break;
                }

                _context.next = 14;
                return web3Functions.bigNumber(version)(txObject.gasPrice).catch(handleError('web3', reject));

              case 14:
                _context.t1 = _context.sent;
                _context.next = 25;
                break;

              case 17:
                _context.t2 = web3Functions.bigNumber(version);
                _context.next = 20;
                return web3Functions.gasPrice(version)().catch(handleError('web3', reject));

              case 20:
                _context.t3 = _context.sent;
                _context.t4 = handleError('web3', reject);
                _context.next = 24;
                return (0, _context.t2)(_context.t3).catch(_context.t4);

              case 24:
                _context.t1 = _context.sent;

              case 25:
                gasPrice = _context.t1;

                if (!contractMethod) {
                  _context.next = 37;
                  break;
                }

                _context.t6 = web3Functions.bigNumber(version);
                _context.next = 30;
                return web3Functions.contractGas(version)(contractMethod, methodArgs.parameters, txObject).catch(handleError('web3', reject));

              case 30:
                _context.t7 = _context.sent;
                _context.t8 = handleError('web3', reject);
                _context.next = 34;
                return (0, _context.t6)(_context.t7).catch(_context.t8);

              case 34:
                _context.t5 = _context.sent;
                _context.next = 45;
                break;

              case 37:
                _context.t9 = web3Functions.bigNumber(version);
                _context.next = 40;
                return web3Functions.transactionGas(version)(txObject).catch(handleError('web3', reject));

              case 40:
                _context.t10 = _context.sent;
                _context.t11 = handleError('web3', reject);
                _context.next = 44;
                return (0, _context.t9)(_context.t10).catch(_context.t11);

              case 44:
                _context.t5 = _context.sent;

              case 45:
                gas = _context.t5;
                transactionFee = gas.mul(gasPrice);
                _context.t12 = transactionFee;
                _context.next = 50;
                return web3Functions.bigNumber(version)('10').catch(handleError('web3', reject));

              case 50:
                _context.t13 = _context.sent;
                buffer = _context.t12.div.call(_context.t12, _context.t13);
                totalTransactionCost = transactionFee.add(transactionValue).add(buffer);
                _context.next = 55;
                return getAccountBalance().catch(handleError('web3', reject));

              case 55:
                balance = _context.sent;
                _context.next = 58;
                return web3Functions.bigNumber(version)(balance).catch(handleError('web3', reject));

              case 58:
                accountBalance = _context.sent;
                sufficientBalance = accountBalance.gt(totalTransactionCost);
                transactionParams = {
                  value: transactionValue.toString(),
                  gas: gas.toString(),
                  gasPrice: gasPrice.toString(),
                  to: txObject.to
                };
                resolve({
                  transactionParams: transactionParams,
                  sufficientBalance: sufficientBalance
                });

              case 62:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  }
  function getAccountBalance() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee2(resolve, reject) {
        var accounts, version, balance;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return getAccounts().catch(handleError('web3', reject));

              case 2:
                accounts = _context2.sent;
                updateState({
                  accountAddress: accounts[0]
                });
                version = state.web3Version && state.web3Version.slice(0, 3);
                balance = web3Functions.balance(version)(accounts[0]).catch(handleError('web3', reject));
                resolve(balance);

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }
  function getAccounts() {
    var version = state.web3Version && state.web3Version.slice(0, 3);
    return web3Functions.accounts(version)();
  }
  function checkUnlocked() {
    return window.ethereum._metamask.isUnlocked();
  }
  function requestLoginEnable() {
    return window.ethereum.enable();
  }
  function getCurrentProvider() {
    var web3 = state.web3Instance || window.web3;

    if (web3.currentProvider.isMetaMask) {
      return 'metamask';
    }

    if (web3.currentProvider.isTrust) {
      return 'trust';
    }

    if (typeof window.SOFA !== 'undefined') {
      return 'toshi';
    }

    if (typeof window.__CIPHER__ !== 'undefined') {
      return 'cipher';
    }

    if (web3.currentProvider.constructor.name === 'EthereumProvider') {
      return 'mist';
    }

    if (web3.currentProvider.constructor.name === 'Web3FrameProvider') {
      return 'parity';
    }

    if (web3.currentProvider.host && web3.currentProvider.host.indexOf('infura') !== -1) {
      return 'infura';
    }

    if (web3.currentProvider.host && web3.currentProvider.host.indexOf('localhost') !== -1) {
      return 'localhost';
    }

    if (web3.currentProvider.connection) {
      return 'Infura Websocket';
    }

    return undefined;
  } // Poll for a tx receipt

  function waitForTransactionReceipt(txHash) {
    var web3 = state.web3Instance || window.web3;
    return new Promise(function (resolve, reject) {
      function checkForReceipt() {
        web3.eth.getTransactionReceipt(txHash, function (err, res) {
          if (err) {
            return reject(err);
          }

          if (res === null) {
            return setTimeout(function () {
              return checkForReceipt();
            }, timeouts.pollForReceipt);
          }

          return resolve(res);
        });
      }

      checkForReceipt();
    });
  }

  function checkUserEnvironment() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee(resolve, reject) {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                checkValidBrowser();
                checkForWallet();

                if (state.web3Wallet) {
                  _context.next = 6;
                  break;
                }

                storeItem('_assist_newUser', 'true');
                resolve();
                return _context.abrupt("return");

              case 6:
                if (!state.web3Instance) {
                  configureWeb3();
                }

                _context.next = 9;
                return checkAccountAccess();

              case 9:
                _context.next = 11;
                return checkNetwork().catch(reject);

              case 11:
                if (!(state.accessToAccounts && state.correctNetwork)) {
                  _context.next = 14;
                  break;
                }

                _context.next = 14;
                return checkMinimumBalance();

              case 14:
                resolve();

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  } // Prepare for transaction

  function prepareForTransaction(categoryCode, originalResolve) {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee2(resolve, reject) {
        var previouslyWelcomed;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                originalResolve = originalResolve || resolve;
                _context2.next = 3;
                return checkUserEnvironment().catch(reject);

              case 3:
                if (!(state.mobileDevice && state.config.mobileBlocked)) {
                  _context2.next = 6;
                  break;
                }

                handleEvent({
                  eventCode: 'mobileBlocked',
                  categoryCode: categoryCode
                }, {
                  onClose: function onClose() {
                    return setTimeout(function () {
                      var errorObj = new Error('User is on mobile device');
                      errorObj.eventCode = 'mobileBlocked';
                      reject(errorObj);
                    }, timeouts.changeUI);
                  }
                });
                return _context2.abrupt("return");

              case 6:
                if (!(getItem('_assist_newUser') === 'true')) {
                  _context2.next = 31;
                  break;
                }

                if (state.validBrowser) {
                  _context2.next = 10;
                  break;
                }

                handleEvent({
                  eventCode: 'browserFail',
                  categoryCode: categoryCode
                }, {
                  onClose: function onClose() {
                    return setTimeout(function () {
                      var errorObj = new Error('User has an invalid browser');
                      errorObj.eventCode = 'browserFail';
                      reject(errorObj);
                    }, timeouts.changeUI);
                  }
                });
                return _context2.abrupt("return");

              case 10:
                previouslyWelcomed = getItem('_assist_welcomed');

                if (!(previouslyWelcomed !== 'true' && previouslyWelcomed !== 'null')) {
                  _context2.next = 21;
                  break;
                }

                _context2.prev = 12;
                _context2.next = 15;
                return welcomeUser(categoryCode);

              case 15:
                _context2.next = 21;
                break;

              case 17:
                _context2.prev = 17;
                _context2.t0 = _context2["catch"](12);
                reject(_context2.t0);
                return _context2.abrupt("return");

              case 21:
                if (state.web3Wallet) {
                  _context2.next = 31;
                  break;
                }

                _context2.prev = 22;
                _context2.next = 25;
                return getWeb3Wallet(categoryCode);

              case 25:
                _context2.next = 31;
                break;

              case 27:
                _context2.prev = 27;
                _context2.t1 = _context2["catch"](22);
                reject(_context2.t1);
                return _context2.abrupt("return");

              case 31:
                if (!state.web3Instance) {
                  configureWeb3();
                }

                if (!(state.legacyWallet && !state.accessToAccounts)) {
                  _context2.next = 42;
                  break;
                }

                _context2.prev = 33;
                _context2.next = 36;
                return legacyAccountAccess(categoryCode, originalResolve);

              case 36:
                _context2.next = 42;
                break;

              case 38:
                _context2.prev = 38;
                _context2.t2 = _context2["catch"](33);
                reject(_context2.t2);
                return _context2.abrupt("return");

              case 42:
                if (!(state.modernWallet && !state.accessToAccounts)) {
                  _context2.next = 52;
                  break;
                }

                _context2.prev = 43;
                _context2.next = 46;
                return modernAccountAccess(categoryCode, originalResolve);

              case 46:
                _context2.next = 52;
                break;

              case 48:
                _context2.prev = 48;
                _context2.t3 = _context2["catch"](43);
                reject(_context2.t3);
                return _context2.abrupt("return");

              case 52:
                if (state.correctNetwork) {
                  _context2.next = 62;
                  break;
                }

                _context2.prev = 53;
                _context2.next = 56;
                return getCorrectNetwork(categoryCode);

              case 56:
                _context2.next = 62;
                break;

              case 58:
                _context2.prev = 58;
                _context2.t4 = _context2["catch"](53);
                reject(_context2.t4);
                return _context2.abrupt("return");

              case 62:
                _context2.next = 64;
                return checkMinimumBalance();

              case 64:
                if (state.minimumBalance) {
                  _context2.next = 74;
                  break;
                }

                _context2.prev = 65;
                _context2.next = 68;
                return getMinimumBalance(categoryCode, originalResolve);

              case 68:
                _context2.next = 74;
                break;

              case 70:
                _context2.prev = 70;
                _context2.t5 = _context2["catch"](65);
                reject(_context2.t5);
                return _context2.abrupt("return");

              case 74:
                if (!(getItem('_assist_newUser') === 'true')) {
                  _context2.next = 78;
                  break;
                }

                _context2.next = 77;
                return newOnboardComplete(categoryCode);

              case 77:
                storeItem('_assist_newUser', 'false');

              case 78:
                resolve('User is ready to transact');
                originalResolve && originalResolve('User is ready to transact');

              case 80:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[12, 17], [22, 27], [33, 38], [43, 48], [53, 58], [65, 70]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }

  function welcomeUser(categoryCode) {
    return new Promise(function (resolve, reject) {
      handleEvent({
        eventCode: 'welcomeUser',
        categoryCode: categoryCode
      }, {
        onClose: function onClose() {
          return setTimeout(function () {
            var errorObj = new Error('User is being welcomed');
            errorObj.eventCode = 'welcomeUser';
            reject(errorObj);
          }, timeouts.changeUI);
        },
        onClick: function onClick() {
          storeItem('_assist_welcomed', 'true');
          closeModal();
          setTimeout(resolve, timeouts.changeUI);
        }
      });
    });
  }

  function getWeb3Wallet(categoryCode) {
    return new Promise(function (resolve, reject) {
      handleEvent({
        eventCode: 'walletFail',
        categoryCode: categoryCode,
        wallet: {
          provider: state.currentProvider
        }
      }, {
        onClose: function onClose() {
          return setTimeout(function () {
            var errorObj = new Error('User does not have a web3 wallet installed');
            errorObj.eventCode = 'walletFail';
            reject(errorObj);
          }, timeouts.changeUI);
        },
        onClick: function onClick() {
          window.location.reload();
        }
      });
    });
  }

  function checkAccountAccess() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref3 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee3(resolve) {
        var accounts, loggedIn;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return getAccounts().catch(resolve);

              case 2:
                accounts = _context3.sent;

                if (!(accounts && accounts[0])) {
                  _context3.next = 7;
                  break;
                }

                updateState({
                  accessToAccounts: true,
                  accountAddress: accounts[0],
                  walletLoggedIn: true,
                  walletEnabled: true
                });
                _context3.next = 16;
                break;

              case 7:
                if (!state.modernWallet) {
                  _context3.next = 13;
                  break;
                }

                _context3.next = 10;
                return checkUnlocked().catch(resolve);

              case 10:
                _context3.t0 = _context3.sent;
                _context3.next = 14;
                break;

              case 13:
                _context3.t0 = false;

              case 14:
                loggedIn = _context3.t0;
                updateState({
                  accessToAccounts: false,
                  walletLoggedIn: loggedIn,
                  walletEnabled: state.modernWallet ? false : null,
                  minimumBalance: null
                });

              case 16:
                resolve();

              case 17:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function (_x5) {
        return _ref3.apply(this, arguments);
      };
    }());
  }

  function checkNetwork() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref4 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee4(resolve, reject) {
        var networkId;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return getNetworkId().catch(handleError('web3', reject));

              case 2:
                networkId = _context4.sent;
                updateState({
                  correctNetwork: Number(networkId) === (Number(state.config.networkId) || 1),
                  userCurrentNetworkId: networkId
                });
                resolve && resolve();

              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function (_x6, _x7) {
        return _ref4.apply(this, arguments);
      };
    }());
  }

  function checkMinimumBalance() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref5 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee5(resolve, reject) {
        var web3Version, version, minimum, account, minimumBalance, accountBalance, sufficientBalance;
        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return checkAccountAccess();

              case 2:
                if (!state.accessToAccounts) {
                  resolve();
                }

                web3Version = state.web3Version;
                version = web3Version && web3Version.slice(0, 3);
                minimum = state.config.minimumBalance || 0;
                _context5.next = 8;
                return getAccountBalance().catch(resolve);

              case 8:
                account = _context5.sent;
                _context5.next = 11;
                return web3Functions.bigNumber(version)(minimum).catch(reject);

              case 11:
                minimumBalance = _context5.sent;
                _context5.next = 14;
                return web3Functions.bigNumber(version)(account).catch(reject);

              case 14:
                accountBalance = _context5.sent;
                sufficientBalance = accountBalance.gte(minimumBalance);
                updateState({
                  accountBalance: accountBalance.toString(),
                  minimumBalance: sufficientBalance
                });
                resolve();

              case 18:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function (_x8, _x9) {
        return _ref5.apply(this, arguments);
      };
    }());
  }

  function legacyAccountAccess(categoryCode, originalResolve) {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref6 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee8(resolve, reject) {
        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                handleEvent({
                  eventCode: 'walletLogin',
                  categoryCode: categoryCode,
                  wallet: {
                    provider: state.currentProvider
                  }
                }, {
                  onClose: function onClose() {
                    return setTimeout(function () {
                      var errorObj = new Error('User needs to login to their account');
                      errorObj.eventCode = 'walletLogin';
                      reject(errorObj);
                    }, timeouts.changeUI);
                  },
                  onClick: function () {
                    var _onClick = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee7() {
                      return regenerator.wrap(function _callee7$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              if (state.accessToAccounts) {
                                closeModal();
                                setTimeout(
                                /*#__PURE__*/
                                asyncToGenerator(
                                /*#__PURE__*/
                                regenerator.mark(function _callee6() {
                                  return regenerator.wrap(function _callee6$(_context6) {
                                    while (1) {
                                      switch (_context6.prev = _context6.next) {
                                        case 0:
                                          _context6.next = 2;
                                          return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                                        case 2:
                                          resolve();

                                        case 3:
                                        case "end":
                                          return _context6.stop();
                                      }
                                    }
                                  }, _callee6, this);
                                })), timeouts.changeUI);
                              } else {
                                addOnboardWarning('loggedIn');
                              }

                            case 1:
                            case "end":
                              return _context7.stop();
                          }
                        }
                      }, _callee7, this);
                    }));

                    function onClick() {
                      return _onClick.apply(this, arguments);
                    }

                    return onClick;
                  }()
                });

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function (_x10, _x11) {
        return _ref6.apply(this, arguments);
      };
    }());
  }

  function enableWallet(categoryCode, originalResolve) {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref8 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee15(resolve, reject) {
        return regenerator.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return checkAccountAccess();

              case 2:
                if (!state.walletEnabled) {
                  _context15.next = 5;
                  break;
                }

                resolve();
                return _context15.abrupt("return");

              case 5:
                if (state.accessToAccounts) {
                  if (state.walletEnableCalled) {
                    // the popup dialog has been called
                    if (state.walletEnableCanceled) {
                      // the user has cancelled the dialog, but we have access to accounts
                      // so we just resolve
                      resolve();
                    } else {
                      // The user must have missed the connect dialog or closed it without confirming or
                      // cancelling, so we show enable account UI
                      handleEvent({
                        eventCode: 'walletEnable',
                        categoryCode: categoryCode,
                        wallet: {
                          provider: state.currentProvider
                        }
                      }, {
                        onClose: function onClose() {
                          return setTimeout(function () {
                            var errorObj = new Error('User needs to enable wallet');
                            errorObj.eventCode = 'walletEnable';
                            reject(errorObj);
                          }, timeouts.changeUI);
                        },
                        onClick: function () {
                          var _onClick2 = asyncToGenerator(
                          /*#__PURE__*/
                          regenerator.mark(function _callee10() {
                            return regenerator.wrap(function _callee10$(_context10) {
                              while (1) {
                                switch (_context10.prev = _context10.next) {
                                  case 0:
                                    _context10.next = 2;
                                    return checkAccountAccess();

                                  case 2:
                                    if (!(state.accessToAccounts || !state.walletLoggedIn)) {
                                      _context10.next = 7;
                                      break;
                                    }

                                    closeModal();
                                    setTimeout(
                                    /*#__PURE__*/
                                    asyncToGenerator(
                                    /*#__PURE__*/
                                    regenerator.mark(function _callee9() {
                                      return regenerator.wrap(function _callee9$(_context9) {
                                        while (1) {
                                          switch (_context9.prev = _context9.next) {
                                            case 0:
                                              _context9.next = 2;
                                              return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                                            case 2:
                                              resolve();

                                            case 3:
                                            case "end":
                                              return _context9.stop();
                                          }
                                        }
                                      }, _callee9, this);
                                    })), timeouts.changeUI);
                                    _context10.next = 10;
                                    break;

                                  case 7:
                                    addOnboardWarning('enabled');
                                    _context10.next = 10;
                                    return enableWallet(categoryCode, originalResolve).catch(reject);

                                  case 10:
                                  case "end":
                                    return _context10.stop();
                                }
                              }
                            }, _callee10, this);
                          }));

                          function onClick() {
                            return _onClick2.apply(this, arguments);
                          }

                          return onClick;
                        }()
                      });
                    }
                  } else {
                    // wallet enable hasn't been called, but we have access to accounts so it doesn't matter
                    resolve();
                  }
                } else if (!state.walletEnableCalled || state.walletEnableCalled && state.walletEnableCanceled) {
                  // if enable popup has been called and canceled, or hasn't been called yet then,
                  // show metamask login and connect dialog popup
                  requestLoginEnable().then(function (accounts) {
                    updateState({
                      accountAddress: accounts[0],
                      walletLoggedIn: true,
                      walletEnabled: true,
                      accessToAccounts: true
                    });
                  }).catch(function () {
                    updateState({
                      walletEnableCanceled: true,
                      walletEnabled: false,
                      accessToAccounts: false
                    });
                  });
                  updateState({
                    walletEnableCalled: true,
                    walletEnableCanceled: false
                  }); // Show UI to inform user to connect

                  handleEvent({
                    eventCode: 'walletEnable',
                    categoryCode: categoryCode,
                    wallet: {
                      provider: state.currentProvider
                    }
                  }, {
                    onClose: function onClose() {
                      return setTimeout(function () {
                        var errorObj = new Error('User needs to enable wallet');
                        errorObj.eventCode = 'walletEnable';
                        reject(errorObj);
                      }, timeouts.changeUI);
                    },
                    onClick: function () {
                      var _onClick3 = asyncToGenerator(
                      /*#__PURE__*/
                      regenerator.mark(function _callee12() {
                        return regenerator.wrap(function _callee12$(_context12) {
                          while (1) {
                            switch (_context12.prev = _context12.next) {
                              case 0:
                                _context12.next = 2;
                                return checkAccountAccess();

                              case 2:
                                if (!(state.accessToAccounts || !state.walletLoggedIn)) {
                                  _context12.next = 7;
                                  break;
                                }

                                closeModal();
                                setTimeout(
                                /*#__PURE__*/
                                asyncToGenerator(
                                /*#__PURE__*/
                                regenerator.mark(function _callee11() {
                                  return regenerator.wrap(function _callee11$(_context11) {
                                    while (1) {
                                      switch (_context11.prev = _context11.next) {
                                        case 0:
                                          _context11.next = 2;
                                          return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                                        case 2:
                                          resolve();

                                        case 3:
                                        case "end":
                                          return _context11.stop();
                                      }
                                    }
                                  }, _callee11, this);
                                })), timeouts.changeUI);
                                _context12.next = 10;
                                break;

                              case 7:
                                addOnboardWarning('enabled');
                                _context12.next = 10;
                                return enableWallet(categoryCode, originalResolve).catch(reject);

                              case 10:
                              case "end":
                                return _context12.stop();
                            }
                          }
                        }, _callee12, this);
                      }));

                      function onClick() {
                        return _onClick3.apply(this, arguments);
                      }

                      return onClick;
                    }()
                  });
                } else {
                  // Wallet enable has been called but not canceled, so popup window must have been closed
                  // Call wallet enable again
                  requestLoginEnable().then(function (accounts) {
                    if (accounts && accounts[0]) {
                      updateState({
                        accountAddress: accounts[0],
                        walletLoggedIn: true,
                        walletEnabled: true,
                        accessToAccounts: true
                      });
                    }
                  }).catch(function () {
                    updateState({
                      walletEnableCanceled: true,
                      walletEnabled: false,
                      accessToAccounts: false
                    });
                  });
                  updateState({
                    walletEnableCalled: true,
                    walletEnableCanceled: false
                  }); // Show UI to inform user to connect

                  handleEvent({
                    eventCode: 'walletEnable',
                    categoryCode: categoryCode,
                    wallet: {
                      provider: state.currentProvider
                    }
                  }, {
                    onClose: function onClose() {
                      return setTimeout(function () {
                        var errorObj = new Error('User needs to enable wallet');
                        errorObj.eventCode = 'walletEnable';
                        reject(errorObj);
                      }, timeouts.changeUI);
                    },
                    onClick: function () {
                      var _onClick4 = asyncToGenerator(
                      /*#__PURE__*/
                      regenerator.mark(function _callee14() {
                        return regenerator.wrap(function _callee14$(_context14) {
                          while (1) {
                            switch (_context14.prev = _context14.next) {
                              case 0:
                                _context14.next = 2;
                                return checkAccountAccess();

                              case 2:
                                if (!(state.accessToAccounts || !state.walletLoggedIn)) {
                                  _context14.next = 7;
                                  break;
                                }

                                closeModal();
                                setTimeout(
                                /*#__PURE__*/
                                asyncToGenerator(
                                /*#__PURE__*/
                                regenerator.mark(function _callee13() {
                                  return regenerator.wrap(function _callee13$(_context13) {
                                    while (1) {
                                      switch (_context13.prev = _context13.next) {
                                        case 0:
                                          _context13.next = 2;
                                          return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                                        case 2:
                                          resolve();

                                        case 3:
                                        case "end":
                                          return _context13.stop();
                                      }
                                    }
                                  }, _callee13, this);
                                })), timeouts.changeUI);
                                _context14.next = 10;
                                break;

                              case 7:
                                addOnboardWarning('enabled');
                                _context14.next = 10;
                                return enableWallet(categoryCode, originalResolve).catch(reject);

                              case 10:
                              case "end":
                                return _context14.stop();
                            }
                          }
                        }, _callee14, this);
                      }));

                      function onClick() {
                        return _onClick4.apply(this, arguments);
                      }

                      return onClick;
                    }()
                  });
                }

              case 6:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));

      return function (_x12, _x13) {
        return _ref8.apply(this, arguments);
      };
    }());
  }

  function unlockWallet(categoryCode, originalResolve) {
    return new Promise(function (resolve, reject) {
      requestLoginEnable().then(function (accounts) {
        updateState({
          accountAddress: accounts[0],
          walletLoggedIn: true,
          walletEnabled: true,
          accessToAccounts: true
        });
      }).catch(function () {
        updateState({
          walletEnableCanceled: true,
          walletEnabled: false,
          accessToAccounts: false
        });
      });
      updateState({
        walletEnableCalled: true,
        walletEnableCanceled: false
      }); // Show onboard login UI

      handleEvent({
        eventCode: 'walletLoginEnable',
        categoryCode: categoryCode,
        wallet: {
          provider: state.currentProvider
        }
      }, {
        onClose: function onClose() {
          return setTimeout(function () {
            var errorObj = new Error('User needs to login to wallet');
            errorObj.eventCode = 'walletLoginEnable';
            reject(errorObj);
          }, timeouts.changeUI);
        },
        onClick: function () {
          var _onClick5 = asyncToGenerator(
          /*#__PURE__*/
          regenerator.mark(function _callee18() {
            return regenerator.wrap(function _callee18$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _context18.next = 2;
                    return checkAccountAccess();

                  case 2:
                    if (!state.walletLoggedIn) {
                      _context18.next = 7;
                      break;
                    }

                    closeModal();
                    setTimeout(
                    /*#__PURE__*/
                    asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee16() {
                      return regenerator.wrap(function _callee16$(_context16) {
                        while (1) {
                          switch (_context16.prev = _context16.next) {
                            case 0:
                              _context16.next = 2;
                              return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                            case 2:
                              resolve();

                            case 3:
                            case "end":
                              return _context16.stop();
                          }
                        }
                      }, _callee16, this);
                    })), timeouts.changeUI);
                    _context18.next = 13;
                    break;

                  case 7:
                    addOnboardWarning('loggedIn');
                    _context18.next = 10;
                    return unlockWallet(categoryCode, originalResolve).catch(reject);

                  case 10:
                    updateState({
                      walletLoggedIn: true
                    });
                    closeModal();
                    setTimeout(
                    /*#__PURE__*/
                    asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee17() {
                      return regenerator.wrap(function _callee17$(_context17) {
                        while (1) {
                          switch (_context17.prev = _context17.next) {
                            case 0:
                              _context17.next = 2;
                              return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                            case 2:
                              resolve();

                            case 3:
                            case "end":
                              return _context17.stop();
                          }
                        }
                      }, _callee17, this);
                    })), timeouts.changeUI);

                  case 13:
                  case "end":
                    return _context18.stop();
                }
              }
            }, _callee18, this);
          }));

          function onClick() {
            return _onClick5.apply(this, arguments);
          }

          return onClick;
        }()
      });
    });
  }

  function modernAccountAccess(categoryCode, originalResolve) {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref14 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee19(resolve, reject) {
        return regenerator.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                if (!state.walletLoggedIn) {
                  _context19.next = 12;
                  break;
                }

                _context19.prev = 1;
                _context19.next = 4;
                return enableWallet(categoryCode, originalResolve);

              case 4:
                resolve();
                _context19.next = 10;
                break;

              case 7:
                _context19.prev = 7;
                _context19.t0 = _context19["catch"](1);
                reject(_context19.t0);

              case 10:
                _context19.next = 31;
                break;

              case 12:
                _context19.prev = 12;
                _context19.next = 15;
                return unlockWallet(categoryCode, originalResolve);

              case 15:
                _context19.next = 21;
                break;

              case 17:
                _context19.prev = 17;
                _context19.t1 = _context19["catch"](12);
                reject(_context19.t1);
                return _context19.abrupt("return");

              case 21:
                _context19.prev = 21;
                _context19.next = 24;
                return enableWallet(categoryCode, originalResolve);

              case 24:
                _context19.next = 30;
                break;

              case 26:
                _context19.prev = 26;
                _context19.t2 = _context19["catch"](21);
                reject(_context19.t2);
                return _context19.abrupt("return");

              case 30:
                resolve();

              case 31:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this, [[1, 7], [12, 17], [21, 26]]);
      }));

      return function (_x14, _x15) {
        return _ref14.apply(this, arguments);
      };
    }());
  }

  function getCorrectNetwork(categoryCode) {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref15 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee21(resolve, reject) {
        return regenerator.wrap(function _callee21$(_context21) {
          while (1) {
            switch (_context21.prev = _context21.next) {
              case 0:
                handleEvent({
                  eventCode: 'networkFail',
                  categoryCode: categoryCode,
                  walletNetworkID: state.userCurrentNetworkId,
                  walletName: state.currentProvider
                }, {
                  onClose: function onClose() {
                    return setTimeout(function () {
                      var errorObj = new Error('User is on the wrong network');
                      errorObj.eventCode = 'networkFail';
                      reject(errorObj);
                    }, timeouts.changeUI);
                  },
                  onClick: function () {
                    var _onClick6 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee20() {
                      return regenerator.wrap(function _callee20$(_context20) {
                        while (1) {
                          switch (_context20.prev = _context20.next) {
                            case 0:
                              _context20.next = 2;
                              return checkNetwork();

                            case 2:
                              if (!state.correctNetwork) {
                                addOnboardWarning('network');
                              }

                            case 3:
                            case "end":
                              return _context20.stop();
                          }
                        }
                      }, _callee20, this);
                    }));

                    function onClick() {
                      return _onClick6.apply(this, arguments);
                    }

                    return onClick;
                  }()
                });

              case 1:
              case "end":
                return _context21.stop();
            }
          }
        }, _callee21, this);
      }));

      return function (_x16, _x17) {
        return _ref15.apply(this, arguments);
      };
    }());
  }

  function getMinimumBalance(categoryCode, originalResolve) {
    return new Promise(function (resolve, reject) {
      handleEvent({
        eventCode: 'nsfFail',
        categoryCode: categoryCode,
        wallet: {
          balance: state.accountBalance,
          minimum: state.minimumBalance,
          provider: state.currentProvider,
          address: state.accountAddress
        }
      }, {
        onClose: function onClose() {
          return setTimeout(function () {
            var errorObj = new Error('User does not have the minimum balance specified in the config');
            errorObj.eventCode = 'nsfFail';
            reject(errorObj);
          }, timeouts.changeUI);
        },
        onClick: function () {
          var _onClick7 = asyncToGenerator(
          /*#__PURE__*/
          regenerator.mark(function _callee23() {
            return regenerator.wrap(function _callee23$(_context23) {
              while (1) {
                switch (_context23.prev = _context23.next) {
                  case 0:
                    _context23.next = 2;
                    return checkMinimumBalance();

                  case 2:
                    if (state.minimumBalance || !state.accessToAccounts) {
                      closeModal();
                      setTimeout(
                      /*#__PURE__*/
                      asyncToGenerator(
                      /*#__PURE__*/
                      regenerator.mark(function _callee22() {
                        return regenerator.wrap(function _callee22$(_context22) {
                          while (1) {
                            switch (_context22.prev = _context22.next) {
                              case 0:
                                _context22.next = 2;
                                return prepareForTransaction(categoryCode, originalResolve).catch(reject);

                              case 2:
                                resolve();

                              case 3:
                              case "end":
                                return _context22.stop();
                            }
                          }
                        }, _callee22, this);
                      })), timeouts.changeUI);
                    } else {
                      addOnboardWarning('minimumBalance');
                    }

                  case 3:
                  case "end":
                    return _context23.stop();
                }
              }
            }, _callee23, this);
          }));

          function onClick() {
            return _onClick7.apply(this, arguments);
          }

          return onClick;
        }()
      });
    });
  }

  function newOnboardComplete(categoryCode) {
    return new Promise(function (resolve) {
      handleEvent({
        eventCode: 'newOnboardComplete',
        categoryCode: categoryCode
      }, {
        onClose: resolve,
        onClick: function onClick() {
          closeModal();
          resolve();
        }
      });
    });
  }

  function inferNonce() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee(resolve, reject) {
        var currentNonce, pendingTransactions;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return getNonce(state.accountAddress).catch(handleError('web3', reject));

              case 2:
                currentNonce = _context.sent;
                pendingTransactions = state.transactionQueue && state.transactionQueue.length || 0;
                resolve(pendingTransactions + currentNonce);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  }

  function sendTransaction(categoryCode) {
    var txObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var sendTransactionMethod = arguments.length > 2 ? arguments[2] : undefined;
    var callback = arguments.length > 3 ? arguments[3] : undefined;
    var contractMethod = arguments.length > 4 ? arguments[4] : undefined;
    var contractEventObj = arguments.length > 5 ? arguments[5] : undefined;
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee8(resolve, reject) {
        var _ref3, sufficientBalance, transactionParams, errorObj, duplicateTransaction, txPromise, rejected, confirmed;

        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return prepareForTransaction('activePreflight');

              case 3:
                _context8.next = 9;
                break;

              case 5:
                _context8.prev = 5;
                _context8.t0 = _context8["catch"](0);
                reject(_context8.t0);
                return _context8.abrupt("return");

              case 9:
                // make sure that we have from address in txObject
                if (!txObject.from) {
                  txObject.from = state.accountAddress;
                } // Get the total transaction cost and see if there is enough balance


                _context8.next = 12;
                return hasSufficientBalance(txObject, contractMethod, contractEventObj).catch(reject);

              case 12:
                _ref3 = _context8.sent;
                sufficientBalance = _ref3.sufficientBalance;
                transactionParams = _ref3.transactionParams;

                if (sufficientBalance) {
                  _context8.next = 21;
                  break;
                }

                handleEvent({
                  eventCode: 'nsfFail',
                  categoryCode: 'activePreflight',
                  transaction: transactionParams,
                  wallet: {
                    provider: state.currentProvider,
                    address: state.accountAddress,
                    balance: state.accountBalance,
                    minimum: state.config.minimumBalance
                  }
                });
                errorObj = new Error('User has insufficient funds to complete transaction');
                errorObj.eventCode = 'nsfFail';
                reject(errorObj);
                return _context8.abrupt("return");

              case 21:
                duplicateTransaction = isDuplicateTransaction(transactionParams);

                if (duplicateTransaction) {
                  handleEvent(addContractEventObj({
                    eventCode: 'txRepeat',
                    categoryCode: 'activePreflight',
                    transaction: transactionParams,
                    wallet: {
                      provider: state.currentProvider,
                      address: state.accountAddress,
                      balance: state.accountBalance,
                      minimum: state.config.minimumBalance
                    }
                  }, contractEventObj));
                }

                if (state.transactionAwaitingApproval) {
                  handleEvent(addContractEventObj({
                    eventCode: 'txAwaitingApproval',
                    categoryCode: 'activePreflight',
                    transaction: transactionParams,
                    wallet: {
                      provider: state.currentProvider,
                      address: state.accountAddress,
                      balance: state.accountBalance,
                      minimum: state.config.minimumBalance
                    }
                  }, contractEventObj));
                }

                if (state.legacyWeb3) {
                  if (contractEventObj) {
                    txPromise = sendTransactionMethod.apply(void 0, toConsumableArray(contractEventObj.parameters).concat([txObject]));
                  } else {
                    txPromise = sendTransactionMethod(txObject);
                  }
                } else {
                  txPromise = sendTransactionMethod(txObject);
                }

                resolve({
                  txPromise: txPromise
                });
                handleEvent(addContractEventObj({
                  eventCode: 'txRequest',
                  categoryCode: categoryCode,
                  transaction: transactionParams,
                  wallet: {
                    provider: state.currentProvider,
                    address: state.accountAddress,
                    balance: state.accountBalance,
                    minimum: state.config.minimumBalance
                  }
                }, contractEventObj));
                updateState({
                  transactionAwaitingApproval: true
                });
                // Check if user has confirmed transaction after 20 seconds
                setTimeout(
                /*#__PURE__*/
                asyncToGenerator(
                /*#__PURE__*/
                regenerator.mark(function _callee2() {
                  var nonce;
                  return regenerator.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return inferNonce().catch(reject);

                        case 2:
                          nonce = _context2.sent;

                          if (!checkTransactionQueue(nonce) && !rejected && !confirmed) {
                            handleEvent(addContractEventObj({
                              eventCode: 'txConfirmReminder',
                              categoryCode: categoryCode,
                              transaction: transactionParams,
                              wallet: {
                                provider: state.currentProvider,
                                address: state.accountAddress,
                                balance: state.accountBalance,
                                minimum: state.config.minimumBalance
                              }
                            }, contractEventObj));
                          }

                        case 4:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2, this);
                })), timeouts.txConfirmReminder);

                if (state.legacyWeb3) {
                  txPromise.then(
                  /*#__PURE__*/
                  function () {
                    var _ref5 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee3(txHash) {
                      return regenerator.wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              confirmed = handleTxHash(txHash, {
                                transactionParams: transactionParams,
                                categoryCode: categoryCode,
                                contractEventObj: contractEventObj
                              }, reject, callback);
                              waitForTransactionReceipt(txHash).then(function (receipt) {
                                handleTxReceipt(receipt, {
                                  transactionParams: transactionParams,
                                  categoryCode: categoryCode,
                                  contractEventObj: contractEventObj
                                }, reject, callback);
                              });

                            case 2:
                            case "end":
                              return _context3.stop();
                          }
                        }
                      }, _callee3, this);
                    }));

                    return function (_x5) {
                      return _ref5.apply(this, arguments);
                    };
                  }()).catch(
                  /*#__PURE__*/
                  function () {
                    var _ref6 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee4(errorObj) {
                      return regenerator.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              rejected = handleTxError(errorObj, {
                                transactionParams: transactionParams,
                                categoryCode: categoryCode,
                                contractEventObj: contractEventObj
                              }, reject, callback);

                            case 1:
                            case "end":
                              return _context4.stop();
                          }
                        }
                      }, _callee4, this);
                    }));

                    return function (_x6) {
                      return _ref6.apply(this, arguments);
                    };
                  }());
                } else {
                  txPromise.on('transactionHash',
                  /*#__PURE__*/
                  function () {
                    var _ref7 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee5(txHash) {
                      return regenerator.wrap(function _callee5$(_context5) {
                        while (1) {
                          switch (_context5.prev = _context5.next) {
                            case 0:
                              confirmed = handleTxHash(txHash, {
                                transactionParams: transactionParams,
                                categoryCode: categoryCode,
                                contractEventObj: contractEventObj
                              }, reject, callback);

                            case 1:
                            case "end":
                              return _context5.stop();
                          }
                        }
                      }, _callee5, this);
                    }));

                    return function (_x7) {
                      return _ref7.apply(this, arguments);
                    };
                  }()).on('receipt',
                  /*#__PURE__*/
                  function () {
                    var _ref8 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee6(receipt) {
                      return regenerator.wrap(function _callee6$(_context6) {
                        while (1) {
                          switch (_context6.prev = _context6.next) {
                            case 0:
                              handleTxReceipt(receipt, {
                                transactionParams: transactionParams,
                                categoryCode: categoryCode,
                                contractEventObj: contractEventObj
                              }, reject, callback);

                            case 1:
                            case "end":
                              return _context6.stop();
                          }
                        }
                      }, _callee6, this);
                    }));

                    return function (_x8) {
                      return _ref8.apply(this, arguments);
                    };
                  }()).on('error',
                  /*#__PURE__*/
                  function () {
                    var _ref9 = asyncToGenerator(
                    /*#__PURE__*/
                    regenerator.mark(function _callee7(errorObj) {
                      return regenerator.wrap(function _callee7$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              rejected = handleTxError(errorObj, {
                                transactionParams: transactionParams,
                                categoryCode: categoryCode,
                                contractEventObj: contractEventObj
                              }, reject, callback);

                            case 1:
                            case "end":
                              return _context7.stop();
                          }
                        }
                      }, _callee7, this);
                    }));

                    return function (_x9) {
                      return _ref9.apply(this, arguments);
                    };
                  }());
                }

              case 30:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 5]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }

  function handleTxHash(_x10, _x11, _x12, _x13) {
    return _handleTxHash.apply(this, arguments);
  }

  function _handleTxHash() {
    _handleTxHash = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee9(txHash, meta, reject, callback) {
      var nonce, transactionParams, categoryCode, contractEventObj;
      return regenerator.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return inferNonce().catch(reject);

            case 2:
              nonce = _context9.sent;
              transactionParams = meta.transactionParams, categoryCode = meta.categoryCode, contractEventObj = meta.contractEventObj;
              onResult(transactionParams, nonce, categoryCode, contractEventObj, txHash);
              callback && callback(null, txHash);
              return _context9.abrupt("return", true);

            case 7:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));
    return _handleTxHash.apply(this, arguments);
  }

  function handleTxReceipt(_x14, _x15, _x16, _x17) {
    return _handleTxReceipt.apply(this, arguments);
  }

  function _handleTxReceipt() {
    _handleTxReceipt = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee10(receipt, meta, reject, callback) {
      var transactionHash, txObj, nonce, transactionParams, categoryCode, contractEventObj;
      return regenerator.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              transactionHash = receipt.transactionHash;
              txObj = getTransactionObj(transactionHash);
              _context10.next = 4;
              return inferNonce().catch(reject);

            case 4:
              nonce = _context10.sent;
              transactionParams = meta.transactionParams, categoryCode = meta.categoryCode, contractEventObj = meta.contractEventObj;
              handleEvent(addContractEventObj({
                eventCode: 'txConfirmedClient',
                categoryCode: categoryCode,
                transaction: txObj && txObj.transaction || Object.assign({}, transactionParams, {
                  hash: transactionHash,
                  nonce: nonce
                }),
                wallet: {
                  provider: state.currentProvider,
                  address: state.accountAddress,
                  balance: state.accountBalance,
                  minimum: state.config.minimumBalance
                }
              }, contractEventObj));
              callback && callback(null, receipt);
              updateState({
                transactionQueue: removeTransactionFromQueue(txObj && txObj.transaction.nonce || nonce)
              });

            case 9:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));
    return _handleTxReceipt.apply(this, arguments);
  }

  function handleTxError(_x18, _x19, _x20, _x21) {
    return _handleTxError.apply(this, arguments);
  }

  function _handleTxError() {
    _handleTxError = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee11(error, meta, reject, callback) {
      var message, errorMsg, nonce, transactionParams, categoryCode, contractEventObj, errorObj;
      return regenerator.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              message = error.message;

              try {
                errorMsg = extractMessageFromError(message);
              } catch (error) {
                errorMsg = 'User denied transaction signature';
              }

              _context11.next = 4;
              return inferNonce().catch(reject);

            case 4:
              nonce = _context11.sent;
              transactionParams = meta.transactionParams, categoryCode = meta.categoryCode, contractEventObj = meta.contractEventObj;
              handleEvent(addContractEventObj({
                eventCode: errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail',
                categoryCode: categoryCode,
                transaction: Object.assign({}, transactionParams, {
                  nonce: nonce
                }),
                reason: 'User denied transaction signature',
                wallet: {
                  provider: state.currentProvider,
                  address: state.accountAddress,
                  balance: state.accountBalance,
                  minimum: state.config.minimumBalance
                }
              }, contractEventObj));
              updateState({
                transactionAwaitingApproval: false
              });
              errorObj = new Error(errorMsg === 'transaction underpriced' ? 'Transaction is underpriced' : 'User denied transaction signature');
              errorObj.eventCode = errorMsg === 'transaction underpriced' ? 'txUnderpriced' : 'txSendFail';
              callback && callback(errorObj);
              reject(errorObj);
              return _context11.abrupt("return", true);

            case 13:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));
    return _handleTxError.apply(this, arguments);
  }

  function addContractEventObj(eventObj, contractEventObj) {
    if (contractEventObj) {
      return Object.assign({}, eventObj, {
        contract: contractEventObj
      });
    }

    return eventObj;
  } // On result handler


  function onResult(transactionParams, nonce, categoryCode, contractEventObj, hash) {
    var transaction = Object.assign({}, transactionParams, {
      hash: hash,
      nonce: nonce,
      startTime: Date.now(),
      txSent: true,
      inTxPool: false
    });
    handleEvent(addContractEventObj({
      eventCode: 'txSent',
      categoryCode: categoryCode,
      transaction: transaction,
      wallet: {
        provider: state.currentProvider,
        address: state.accountAddress,
        balance: state.accountBalance,
        minimum: state.config.minimumBalance
      }
    }, contractEventObj));
    updateState({
      transactionQueue: addTransactionToQueue({
        contract: contractEventObj,
        transaction: transaction
      }),
      transactionAwaitingApproval: false
    }); // Check if transaction is in txPool

    setTimeout(function () {
      var transactionObj = getTransactionObj(transaction.hash);

      if (transactionObj && !transactionObj.transaction.inTxPool && state.socketConnection) {
        handleEvent(addContractEventObj({
          eventCode: 'txStall',
          categoryCode: categoryCode,
          transaction: transaction,
          wallet: {
            provider: state.currentProvider,
            address: state.accountAddress,
            balance: state.accountBalance,
            minimum: state.config.minimumBalance
          }
        }, contractEventObj));
      }
    }, timeouts.txStall);
  }

  function modernMethod(method, methodABI, allArgs) {
    var name = methodABI.name,
        constant = methodABI.constant; // Get callback from args if there is one present

    var _separateArgs = separateArgs(allArgs),
        callback = _separateArgs.callback,
        args = _separateArgs.args;

    var returnObject = method.apply(void 0, toConsumableArray(args));
    var key = constant ? 'call' : 'send';
    var returnObjectMethod = returnObject[key];

    returnObject[key] = function () {
      for (var _len = arguments.length, innerArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        innerArgs[_key] = arguments[_key];
      }

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = asyncToGenerator(
        /*#__PURE__*/
        regenerator.mark(function _callee2(resolve, reject) {
          var txPromise, txPromiseObj;
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(key === 'call')) {
                    _context2.next = 6;
                    break;
                  }

                  if (!(state.mobileDevice && state.config.mobileBlocked)) {
                    _context2.next = 4;
                    break;
                  }

                  handleEvent({
                    eventCode: 'mobileBlocked',
                    categoryCode: 'activePreflight'
                  }, {
                    onClose: function onClose() {
                      var errorObj = new Error('User is on a mobile device');
                      errorObj.eventCode = 'mobileBlocked';
                      reject(errorObj);
                    }
                  });
                  return _context2.abrupt("return");

                case 4:
                  txPromise = returnObjectMethod.apply(void 0, innerArgs);
                  txPromise.then(function (result) {
                    handleEvent({
                      eventCode: 'contractQuery',
                      categoryCode: 'activeContract',
                      contract: {
                        methodName: name,
                        parameters: args,
                        result: JSON.stringify(result)
                      }
                    });
                    callback && callback(null, result);
                    resolve(result);
                  }).catch(function () {
                    handleEvent({
                      eventCode: 'contractQueryFail',
                      categoryCode: 'activeContract',
                      contract: {
                        methodName: name,
                        parameters: args
                      },
                      reason: 'User is on the incorrect network'
                    }, {
                      onClose: function onClose() {
                        return setTimeout(function () {
                          var errorObj = new Error('User is on the wrong network');
                          errorObj.eventCode = 'networkFail';
                          reject(errorObj);
                        }, timeouts.changeUI);
                      },
                      onClick: function () {
                        var _onClick = asyncToGenerator(
                        /*#__PURE__*/
                        regenerator.mark(function _callee() {
                          return regenerator.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  _context.next = 2;
                                  return checkNetwork();

                                case 2:
                                  if (!state.correctNetwork) {
                                    addOnboardWarning('network');
                                  }

                                case 3:
                                case "end":
                                  return _context.stop();
                              }
                            }
                          }, _callee, this);
                        }));

                        function onClick() {
                          return _onClick.apply(this, arguments);
                        }

                        return onClick;
                      }()
                    });
                  });

                case 6:
                  if (!(key === 'send')) {
                    _context2.next = 11;
                    break;
                  }

                  _context2.next = 9;
                  return sendTransaction('activeContract', innerArgs[0], returnObjectMethod, callback, method, {
                    methodName: name,
                    parameters: args
                  }).catch(reject);

                case 9:
                  txPromiseObj = _context2.sent;
                  resolve(txPromiseObj);

                case 11:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    };

    return returnObject;
  }
  function legacyMethod(_x3, _x4, _x5) {
    return _legacyMethod.apply(this, arguments);
  }

  function _legacyMethod() {
    _legacyMethod = asyncToGenerator(
    /*#__PURE__*/
    regenerator.mark(function _callee3(method, methodABI, allArgs) {
      var _separateArgs2, callback, txObject, args, name, constant, result;

      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _separateArgs2 = separateArgs(allArgs), callback = _separateArgs2.callback, txObject = _separateArgs2.txObject, args = _separateArgs2.args;
              name = methodABI.name, constant = methodABI.constant;

              if (!constant) {
                _context3.next = 10;
                break;
              }

              _context3.next = 5;
              return bluebird_1(method.call).apply(void 0, toConsumableArray(args)).catch(function (errorObj) {
                return callback && callback(errorObj);
              });

            case 5:
              result = _context3.sent;
              handleEvent({
                eventCode: 'contractQuery',
                categoryCode: 'activeContract',
                contract: {
                  methodName: name,
                  parameters: args,
                  result: JSON.stringify(result)
                }
              });
              callback && callback(null, result);
              _context3.next = 12;
              break;

            case 10:
              _context3.next = 12;
              return sendTransaction('activeContract', txObject, bluebird_1(method.sendTransaction), callback, method, {
                methodName: name,
                parameters: args
              }).catch(function (errorObj) {
                return callback && callback(errorObj);
              });

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));
    return _legacyMethod.apply(this, arguments);
  }

  var styles = "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n\n\t1. Reset\n\t2. Fonts\n\t3. Onboarding\n\t4. Notifications\n\t5. Tooltips\n\t6. Buttons\n*/\n\nhtml,\nbody,\ndiv,\nspan,\napplet,\nobject,\niframe,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nblockquote,\npre,\na,\nabbr,\nacronym,\naddress,\nbig,\ncite,\ncode,\ndel,\ndfn,\nem,\nimg,\nins,\nkbd,\nq,\ns,\nsamp,\nsmall,\nstrike,\nstrong,\nsub,\nsup,\ntt,\nb,\nu,\ni,\ncenter,\ndl,\ndt,\ndd,\nol,\nul,\nli,\nfieldset,\nform,\nlabel,\nlegend,\ntable,\ncaption,\ntbody,\ntfoot,\nthead,\ntr,\nth,\ntd,\narticle,\naside,\ncanvas,\ndetails,\nembed,\nfigure,\nfigcaption,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\noutput,\nruby,\nsection,\nsummary,\ntime,\nmark,\naudio,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol,\nul {\n  list-style: none;\n}\nblockquote,\nq {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n\n/* Colors and Fonts \n\nRed:#FF3F4A;\nYellow:;#FFC137\nGreen:#7ED321;\n\nFont sizes based on https://www.modularscale.com/?16&px&1.125\n\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nul,\nol {\n  color: #4a4a4a;\n  font-family: 'Source Sans Pro', 'Open Sans', 'Helvetica Neue', Arial,\n    sans-serif;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-weight: bold;\n  margin-bottom: 10px;\n}\n\nh1,\n.h1 {\n  font-size: 2.281em;\n  line-height: 1.266em;\n}\nh2,\n.h2 {\n  font-size: 1.802em;\n  line-height: 1.125em;\n}\nh3,\n.h3 {\n  font-size: 1.602em;\n  line-height: 1.266em;\n}\nh4,\n.h4 {\n  font-size: 1.266em;\n  line-height: 1.266em;\n}\nh5,\n.h5 {\n  font-size: 1.125em;\n  line-height: 1.125em;\n}\nh6,\n.h6 {\n  font-size: 1em;\n  line-height: 1em;\n}\np {\n  font-size: 1em;\n  line-height: 1.266em;\n}\n\na {\n  color: #4a90e2;\n  text-decoration: none;\n}\na:hover,\na:active {\n  color: #4a90e2;\n}\n\nstrong,\nb {\n  font-weight: bold;\n}\n\n.clearfix::after {\n  display: block;\n  content: '';\n  clear: both;\n}\n\n/* Onboarding */\n\n.bn-onboard-modal-shade {\n  background: rgba(0, 0, 0, 0.2);\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 9999;\n  width: 100%;\n  height: 100vh;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  font-family: 'Source Sans Pro', 'Open Sans', 'Helvetica Neue', Arial,\n    sans-serif;\n  opacity: 0;\n  transition: opacity 150ms ease-in-out;\n}\n\n.bn-onboard {\n  padding: 10px;\n}\n\n.bn-onboard-modal {\n  background: #fff;\n  border-radius: 2px;\n  border: 1px solid #efefef;\n  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);\n  box-sizing: border-box;\n  position: relative;\n}\n\n.bn-onboard-modal ul li,\n.bn-onboard-modal ol li {\n  margin-top: 15px;\n}\n\n.bn-onboard-basic {\n  padding: 0px;\n  max-width: 720px;\n  display: flex;\n  margin: 0 auto;\n}\n\n.bn-onboard-basic .bn-onboard-main {\n  padding: 15px 20px;\n  background: #fff;\n  -webkit-flex-grow: 1;\n  flex-grow: 1;\n}\n\n.bn-onboard-basic .bn-onboard-sidebar {\n  padding: 15px 20px;\n  width: 34%;\n  background: #eeeeee;\n  -webkit-flex-shrink: 0;\n  flex-shrink: 0;\n}\n.bn-onboard-advanced {\n  padding: 15px 20px;\n  max-width: 416px;\n  margin: 0 auto;\n}\n\n.bn-onboard-alert {\n  padding: 15px 20px;\n  max-width: 416px;\n  margin: 0 auto;\n  text-align: center;\n}\n.bn-onboard-list {\n  list-style: none;\n}\n.bn-inactive {\n  font-weight: normal;\n  color: #9b9b9b;\n}\n.bn-active {\n  font-weight: bold;\n  color: #4a4a4a;\n}\n.bn-check {\n  font-weight: normal;\n  text-decoration: line-through;\n  color: #9b9b9b;\n}\n\n.bn-onboard-list-sprite {\n  width: 16px;\n  height: 16px;\n  display: inline-block;\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png');\n  vertical-align: sub;\n}\n\n.bn-active .bn-onboard-list-sprite {\n  background-position: -16px 0px;\n}\n.bn-check .bn-onboard-list-sprite {\n  background-position: -32px 0px;\n}\n\nimg.bn-onboard-img {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n\n.bn-onboard-close {\n  background: #ededed;\n  border-radius: 100px;\n  width: 28px;\n  height: 28px;\n  position: absolute;\n  top: -9px;\n  right: -9px;\n}\n.bn-onboard-close-x {\n  width: 16px;\n  height: 16px;\n  display: block;\n  margin: 6px;\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png');\n  background-position: -49px 0px;\n}\n\n.bn-onboard-close:hover {\n  background: #bbbbbb;\n}\n\n.bn-onboard-warning {\n  color: #d43f3a;\n  padding: 1rem 0;\n}\n\n.bn-onboarding-branding {\n  margin-top: 10px;\n  font-size: 0.79em;\n}\n\n.bn-onboard-basic .bn-onboarding-branding {\n  position: absolute;\n  bottom: 15px;\n}\n.bn-onboard-basic .bn-onboarding-branding img {\n  margin-top: 5px;\n}\n\n.bn-onboard-advanced .bn-onboarding-branding {\n  text-align: center;\n}\n\n.bn-onboarding-branding img {\n  vertical-align: middle;\n}\n\n@media (max-width: 768px) {\n  .bn-onboard-basic .bn-onboard-sidebar {\n    width: 34%;\n  }\n}\n@media (max-width: 576px) {\n  .bn-onboard-basic {\n    display: inherit;\n  }\n  .bn-onboard-basic .bn-onboard-main {\n    display: block;\n    width: 100%;\n  }\n  /* Make the sidebar take the entire width of the screen */\n  .bn-onboard-basic .bn-onboard-sidebar {\n    display: block;\n    width: 100%;\n  }\n\n  .bn-onboard-basic .bn-onboarding-branding {\n    position: inherit;\n    margin-top: 20px;\n  }\n}\n\n/* Notifications */\n\n#blocknative-notifications {\n  position: fixed;\n  z-index: 999;\n  bottom: 10px;\n  right: 10px;\n  opacity: 0;\n  transform: translateX(600px);\n  transition: opacity 150ms ease-in-out, transform 300ms ease-in-out;\n}\n\n::-webkit-scrollbar {\n  display: none;\n}\n\n.bn-notifications-scroll {\n  overflow-y: scroll;\n  overflow-x: hidden;\n  padding-top: 3rem;\n}\n\n.bn-notification {\n  background: #fff;\n  border-left: 2px solid transparent;\n  border-radius: 2px;\n  padding: 13px 10px;\n  text-align: left;\n  margin-bottom: 5px;\n  box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.1);\n  width: 320px; /* something to consider (changed from max-width) */\n  margin-left: 10px; /* keeps notification from bumping edge on mobile.*/\n  transform: translateX(600px);\n  opacity: 0;\n  transition: transform 350ms ease-in-out, opacity 300ms linear;\n  font-family: 'Source Sans Pro', 'Open Sans', 'Helvetica Neue', Arial,\n    sans-serif;\n}\n\n.bn-notification.bn-progress {\n  border-left: 2px solid #ffc137;\n}\n.bn-notification.bn-complete {\n  border-left: 2px solid #7ed321;\n}\n.bn-notification.bn-failed {\n  border-left: 2px solid #ff3f4a;\n}\n\n.bn-status-icon {\n  float: left;\n  width: 18px;\n  height: 18px;\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png');\n}\n\n.bn-progress .bn-status-icon {\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/mqCAjXV.gif');\n  background-size: 18px 18px;\n}\n.bn-complete .bn-status-icon {\n  background-position: -54px 55px;\n}\n.bn-failed .bn-status-icon {\n  background-position: -36px 55px;\n}\n\n.bn-notification:hover .bn-status-icon {\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png') !important;\n  background-size: 82px 36px;\n  background-position: 0px 19px !important;\n}\n.bn-notification:hover .bn-status-icon:hover {\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png') !important;\n  background-size: 82px 36px;\n  background-position: -18px 19px !important;\n  cursor: pointer;\n}\n\n.bn-duration-hidden {\n  visibility: hidden;\n}\n\n.bn-clock {\n  width: 15px;\n  height: 16px;\n  display: inline-block;\n  background-image: url('https://s3.amazonaws.com/bnc-assist/images/jJu8b0B.png');\n  background-position: -66px 0px;\n  vertical-align: sub;\n}\n\n.bn-notification-info {\n  margin-left: 30px;\n}\n.bn-notification-meta {\n  color: #aeaeae;\n  font-size: 0.79em;\n  margin-top: 5px;\n}\n.bn-notification-meta a {\n  color: #aeaeae;\n}\n\na#bn-transaction-branding {\n  float: right;\n  margin-right: 10px;\n  padding-top: 10px;\n  display: inline-block;\n  width: 18px;\n  height: 25px;\n  background: transparent url('https://s3.amazonaws.com/bnc-assist/images/fJxOtIj.png') no-repeat\n    center left;\n  -webkit-transition: width 0.2s ease-out;\n  -moz-transition: width 0.2s ease-out;\n  -o-transition: width 0.2s ease-out;\n  transition: width 0.2s ease-out;\n}\n\na#bn-transaction-branding:hover {\n  width: 75px;\n}\n\n/* Retina Settings */\n/* http://miekd.com/articles/using-css-sprites-to-optimize-your-website-for-retina-displays/*/\n@media only screen and (-webkit-min-device-pixel-ratio: 2),\n  only screen and (min-device-pixel-ratio: 2) {\n  .bn-status-icon,\n  .bn-onboard-list-sprite,\n  .bn-onboard-close-x,\n  .bn-clock {\n    background-image: url('https://s3.amazonaws.com/bnc-assist/images/6mvOkII.png');\n    /* Translate the @2x sprite's dimensions back to 1x */\n    background-size: 82px 36px;\n  }\n  .bn-progress .bn-status-icon {\n    background-image: url('https://s3.amazonaws.com/bnc-assist/images/joHkLGC.gif');\n    background-size: 18px 18px;\n  }\n  .bn-notification:hover .bn-status-icon {\n    background-image: url('https://s3.amazonaws.com/bnc-assist/images/6mvOkII.png') !important;\n    background-size: 82px 36px;\n  }\n\n  a#bn-transaction-branding {\n    background-image: url('https://s3.amazonaws.com/bnc-assist/images/UhcCuKF.png');\n    background-size: 75px 25px;\n  }\n}\n\n/* Tooltips */\n\n.bn-status-icon {\n  position: relative;\n}\n\n.progress-tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: none;\n  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\n  font-style: normal;\n  font-weight: normal;\n  letter-spacing: normal;\n  line-break: auto;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  white-space: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  font-size: 12px;\n  opacity: 0;\n  filter: alpha(opacity=0);\n  bottom: 21px;\n  width: 190px;\n  -webkit-transition: opacity 0.25s ease-out 100ms;\n  -moz-transition: opacity 0.25s ease-out 100ms;\n  -o-transition: opacity 0.25s ease-out 100ms;\n  transition: opacity 0.25s ease-out 100ms;\n}\n\n.progress-tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #ffffff;\n  text-align: center;\n  background-color: #000000;\n  border-radius: 4px;\n}\n\n.progress-tooltip::after {\n  bottom: 0;\n  left: 10px;\n  margin-left: -5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-top-color: #000;\n  border-style: solid;\n  content: '';\n}\n\n.bn-status-icon:hover .progress-tooltip {\n  opacity: 1;\n  filter: alpha(opacity=1);\n  display: block;\n}\n\n/* Buttons */\n\n.bn-btn {\n  display: inline-block;\n  margin-bottom: 0;\n  font-weight: normal;\n  text-align: center;\n  vertical-align: middle;\n  -ms-touch-action: manipulation;\n  touch-action: manipulation;\n  cursor: pointer;\n  background-image: none;\n  border: 1px solid transparent;\n  white-space: nowrap;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  border-radius: 4px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.bn-btn:focus,\n.bn-btn:active:focus,\n.bn-btn.active:focus,\n.bn-btn.focus,\n.bn-btn:active.focus,\n.bn-btn.active.focus {\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.bn-btn:hover,\n.bn-btn:focus,\n.bn-btn.focus {\n  color: #333333;\n  text-decoration: none;\n}\n.bn-btn:active,\n.bn-btn.active {\n  outline: 0;\n  background-image: none;\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n}\n.bn-btn.disabled,\n.bn-btn[disabled],\nfieldset[disabled] .bn-btn {\n  cursor: not-allowed;\n  opacity: 0.65;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\na.bn-btn.disabled,\nfieldset[disabled] a.bn-btn {\n  pointer-events: none;\n}\n.bn-btn-default {\n  color: #333333;\n  background-color: #ffffff;\n  border-color: #cccccc;\n}\n.bn-btn-default:focus,\n.bn-btn-default.focus {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #8c8c8c;\n}\n.bn-btn-default:hover {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.bn-btn-default:active,\n.bn-btn-default.active,\n.open > .dropdown-toggle.bn-btn-default {\n  color: #333333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.bn-btn-default:active:hover,\n.bn-btn-default.active:hover,\n.open > .dropdown-toggle.bn-btn-default:hover,\n.bn-btn-default:active:focus,\n.bn-btn-default.active:focus,\n.open > .dropdown-toggle.bn-btn-default:focus,\n.bn-btn-default:active.focus,\n.bn-btn-default.active.focus,\n.open > .dropdown-toggle.bn-btn-default.focus {\n  color: #333333;\n  background-color: #d4d4d4;\n  border-color: #8c8c8c;\n}\n.bn-btn-default:active,\n.bn-btn-default.active,\n.open > .dropdown-toggle.bn-btn-default {\n  background-image: none;\n}\n.bn-btn-default.disabled:hover,\n.bn-btn-default[disabled]:hover,\nfieldset[disabled] .bn-btn-default:hover,\n.bn-btn-default.disabled:focus,\n.bn-btn-default[disabled]:focus,\nfieldset[disabled] .bn-btn-default:focus,\n.bn-btn-default.disabled.focus,\n.bn-btn-default[disabled].focus,\nfieldset[disabled] .bn-btn-default.focus {\n  background-color: #ffffff;\n  border-color: #cccccc;\n}\n.bn-btn-default .badge {\n  color: #ffffff;\n  background-color: #333333;\n}\n.bn-btn-primary {\n  color: #ffffff;\n  background-color: #337ab7;\n  border-color: #2e6da4;\n}\n.bn-btn-primary:focus,\n.bn-btn-primary.focus {\n  color: #ffffff;\n  background-color: #286090;\n  border-color: #122b40;\n}\n.bn-btn-primary:hover {\n  color: #ffffff;\n  background-color: #286090;\n  border-color: #204d74;\n}\n.bn-btn-primary:active,\n.bn-btn-primary.active,\n.open > .dropdown-toggle.bn-btn-primary {\n  color: #ffffff;\n  background-color: #286090;\n  border-color: #204d74;\n}\n.bn-btn-primary:active:hover,\n.bn-btn-primary.active:hover,\n.open > .dropdown-toggle.bn-btn-primary:hover,\n.bn-btn-primary:active:focus,\n.bn-btn-primary.active:focus,\n.open > .dropdown-toggle.bn-btn-primary:focus,\n.bn-btn-primary:active.focus,\n.bn-btn-primary.active.focus,\n.open > .dropdown-toggle.bn-btn-primary.focus {\n  color: #ffffff;\n  background-color: #204d74;\n  border-color: #122b40;\n}\n.bn-btn-primary:active,\n.bn-btn-primary.active,\n.open > .dropdown-toggle.bn-btn-primary {\n  background-image: none;\n}\n.bn-btn-primary.disabled:hover,\n.bn-btn-primary[disabled]:hover,\nfieldset[disabled] .bn-btn-primary:hover,\n.bn-btn-primary.disabled:focus,\n.bn-btn-primary[disabled]:focus,\nfieldset[disabled] .bn-btn-primary:focus,\n.bn-btn-primary.disabled.focus,\n.bn-btn-primary[disabled].focus,\nfieldset[disabled] .bn-btn-primary.focus {\n  background-color: #337ab7;\n  border-color: #2e6da4;\n}\n.bn-btn-primary .badge {\n  color: #337ab7;\n  background-color: #ffffff;\n}\n.bn-btn-success {\n  color: #ffffff;\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.bn-btn-success:focus,\n.bn-btn-success.focus {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #255625;\n}\n.bn-btn-success:hover {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.bn-btn-success:active,\n.bn-btn-success.active,\n.open > .dropdown-toggle.bn-btn-success {\n  color: #ffffff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.bn-btn-success:active:hover,\n.bn-btn-success.active:hover,\n.open > .dropdown-toggle.bn-btn-success:hover,\n.bn-btn-success:active:focus,\n.bn-btn-success.active:focus,\n.open > .dropdown-toggle.bn-btn-success:focus,\n.bn-btn-success:active.focus,\n.bn-btn-success.active.focus,\n.open > .dropdown-toggle.bn-btn-success.focus {\n  color: #ffffff;\n  background-color: #398439;\n  border-color: #255625;\n}\n.bn-btn-success:active,\n.bn-btn-success.active,\n.open > .dropdown-toggle.bn-btn-success {\n  background-image: none;\n}\n.bn-btn-success.disabled:hover,\n.bn-btn-success[disabled]:hover,\nfieldset[disabled] .bn-btn-success:hover,\n.bn-btn-success.disabled:focus,\n.bn-btn-success[disabled]:focus,\nfieldset[disabled] .bn-btn-success:focus,\n.bn-btn-success.disabled.focus,\n.bn-btn-success[disabled].focus,\nfieldset[disabled] .bn-btn-success.focus {\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.bn-btn-success .badge {\n  color: #5cb85c;\n  background-color: #ffffff;\n}\n.bn-btn-info {\n  color: #ffffff;\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.bn-btn-info:focus,\n.bn-btn-info.focus {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #1b6d85;\n}\n.bn-btn-info:hover {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.bn-btn-info:active,\n.bn-btn-info.active,\n.open > .dropdown-toggle.bn-btn-info {\n  color: #ffffff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.bn-btn-info:active:hover,\n.bn-btn-info.active:hover,\n.open > .dropdown-toggle.bn-btn-info:hover,\n.bn-btn-info:active:focus,\n.bn-btn-info.active:focus,\n.open > .dropdown-toggle.bn-btn-info:focus,\n.bn-btn-info:active.focus,\n.bn-btn-info.active.focus,\n.open > .dropdown-toggle.bn-btn-info.focus {\n  color: #ffffff;\n  background-color: #269abc;\n  border-color: #1b6d85;\n}\n.bn-btn-info:active,\n.bn-btn-info.active,\n.open > .dropdown-toggle.bn-btn-info {\n  background-image: none;\n}\n.bn-btn-info.disabled:hover,\n.bn-btn-info[disabled]:hover,\nfieldset[disabled] .bn-btn-info:hover,\n.bn-btn-info.disabled:focus,\n.bn-btn-info[disabled]:focus,\nfieldset[disabled] .bn-btn-info:focus,\n.bn-btn-info.disabled.focus,\n.bn-btn-info[disabled].focus,\nfieldset[disabled] .bn-btn-info.focus {\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.bn-btn-info .badge {\n  color: #5bc0de;\n  background-color: #ffffff;\n}\n.bn-btn-warning {\n  color: #ffffff;\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.bn-btn-warning:focus,\n.bn-btn-warning.focus {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #985f0d;\n}\n.bn-btn-warning:hover {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.bn-btn-warning:active,\n.bn-btn-warning.active,\n.open > .dropdown-toggle.bn-btn-warning {\n  color: #ffffff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.bn-btn-warning:active:hover,\n.bn-btn-warning.active:hover,\n.open > .dropdown-toggle.bn-btn-warning:hover,\n.bn-btn-warning:active:focus,\n.bn-btn-warning.active:focus,\n.open > .dropdown-toggle.bn-btn-warning:focus,\n.bn-btn-warning:active.focus,\n.bn-btn-warning.active.focus,\n.open > .dropdown-toggle.bn-btn-warning.focus {\n  color: #ffffff;\n  background-color: #d58512;\n  border-color: #985f0d;\n}\n.bn-btn-warning:active,\n.bn-btn-warning.active,\n.open > .dropdown-toggle.bn-btn-warning {\n  background-image: none;\n}\n.bn-btn-warning.disabled:hover,\n.bn-btn-warning[disabled]:hover,\nfieldset[disabled] .bn-btn-warning:hover,\n.bn-btn-warning.disabled:focus,\n.bn-btn-warning[disabled]:focus,\nfieldset[disabled] .bn-btn-warning:focus,\n.bn-btn-warning.disabled.focus,\n.bn-btn-warning[disabled].focus,\nfieldset[disabled] .bn-btn-warning.focus {\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.bn-btn-warning .badge {\n  color: #f0ad4e;\n  background-color: #ffffff;\n}\n.bn-btn-danger {\n  color: #ffffff;\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.bn-btn-danger:focus,\n.bn-btn-danger.focus {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #761c19;\n}\n.bn-btn-danger:hover {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.bn-btn-danger:active,\n.bn-btn-danger.active,\n.open > .dropdown-toggle.bn-btn-danger {\n  color: #ffffff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.bn-btn-danger:active:hover,\n.bn-btn-danger.active:hover,\n.open > .dropdown-toggle.bn-btn-danger:hover,\n.bn-btn-danger:active:focus,\n.bn-btn-danger.active:focus,\n.open > .dropdown-toggle.bn-btn-danger:focus,\n.bn-btn-danger:active.focus,\n.bn-btn-danger.active.focus,\n.open > .dropdown-toggle.bn-btn-danger.focus {\n  color: #ffffff;\n  background-color: #ac2925;\n  border-color: #761c19;\n}\n.bn-btn-danger:active,\n.bn-btn-danger.active,\n.open > .dropdown-toggle.bn-btn-danger {\n  background-image: none;\n}\n.bn-btn-danger.disabled:hover,\n.bn-btn-danger[disabled]:hover,\nfieldset[disabled] .bn-btn-danger:hover,\n.bn-btn-danger.disabled:focus,\n.bn-btn-danger[disabled]:focus,\nfieldset[disabled] .bn-btn-danger:focus,\n.bn-btn-danger.disabled.focus,\n.bn-btn-danger[disabled].focus,\nfieldset[disabled] .bn-btn-danger.focus {\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.bn-btn-danger .badge {\n  color: #d9534f;\n  background-color: #ffffff;\n}\n.bn-btn-link {\n  color: #337ab7;\n  font-weight: normal;\n  border-radius: 0;\n}\n.bn-btn-link,\n.bn-btn-link:active,\n.bn-btn-link.active,\n.bn-btn-link[disabled],\nfieldset[disabled] .bn-btn-link {\n  background-color: transparent;\n  -webkit-box-shadow: none;\n  box-shadow: none;\n}\n.bn-btn-link,\n.bn-btn-link:hover,\n.bn-btn-link:focus,\n.bn-btn-link:active {\n  border-color: transparent;\n}\n.bn-btn-link:hover,\n.bn-btn-link:focus {\n  color: #23527c;\n  text-decoration: underline;\n  background-color: transparent;\n}\n.bn-btn-link[disabled]:hover,\nfieldset[disabled] .bn-btn-link:hover,\n.bn-btn-link[disabled]:focus,\nfieldset[disabled] .bn-btn-link:focus {\n  color: #777777;\n  text-decoration: none;\n}\n.bn-btn-lg {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.bn-btn-sm {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.bn-btn-xs {\n  padding: 1px 5px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.bn-btn-block {\n  display: block;\n  width: 100%;\n}\n.bn-btn-block + .bn-btn-block {\n  margin-top: 5px;\n}\ninput[type='submit'].bn-btn-block,\ninput[type='reset'].bn-btn-block,\ninput[type='button'].bn-btn-block {\n  width: 100%;\n}\n\n.bn-btn-outline {\n  background-color: transparent;\n  color: inherit;\n  transition: all 0.5s;\n}\n\n.bn-btn-primary.bn-btn-outline {\n  color: #428bca;\n}\n\n.bn-btn-success.bn-btn-outline {\n  color: #5cb85c;\n}\n\n.bn-btn-info.bn-btn-outline {\n  color: #5bc0de;\n}\n\n.bn-btn-warning.bn-btn-outline {\n  color: #f0ad4e;\n}\n\n.bn-btn-danger.bn-btn-outline {\n  color: #d9534f;\n}\n\n.bn-btn-primary.bn-btn-outline:hover,\n.bn-btn-success.bn-btn-outline:hover,\n.bn-btn-info.bn-btn-outline:hover,\n.bn-btn-warning.bn-btn-outline:hover,\n.bn-btn-danger.bn-btn-outline:hover {\n  color: #fff;\n}\n";

  var version = '0.3.2';

  function init(config) {
    updateState({
      version: version
    });
    openWebsocketConnection(); // Make sure we have a config object

    if (!config || _typeof_1(config) !== 'object') {
      var reason = 'A config object is needed to initialize assist';
      handleEvent({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason: reason
      });
      var errorObj = new Error(reason);
      errorObj.eventCode = 'initFail';
      throw errorObj;
    } else {
      updateState({
        config: config
      });
    }

    var web3 = config.web3,
        dappId = config.dappId,
        mobileBlocked = config.mobileBlocked; // Check that an api key has been provided to the config object

    if (!dappId) {
      handleEvent({
        eventCode: 'initFail',
        categoryCode: 'initialize',
        reason: 'No API key provided to init function'
      });
      updateState({
        validApiKey: false
      });

      var _errorObj = new Error('API key is required');

      _errorObj.eventCode = 'initFail';
      throw _errorObj;
    }

    if (web3) {
      configureWeb3(web3);
    } // Get browser info


    getUserAgent(); // Commit a cardinal sin and create an iframe (to isolate the CSS)

    if (!state.iframe) {
      createIframe(document, styles);
    } // Check if on mobile and mobile is blocked


    if (state.mobileDevice && mobileBlocked) {
      handleEvent({
        eventCode: 'mobileBlocked',
        categoryCode: 'initialize'
      });
      updateState({
        validBrowser: false
      });
    } // Get transactionQueue from storage if it exists


    getTransactionQueueFromStorage(); // Add unload event listener

    window.addEventListener('unload', storeTransactionQueue); // Public API to expose

    var intializedAssist = {
      onboard: onboard,
      Contract: Contract,
      Transaction: Transaction,
      getState: getState // return the API

    };
    return intializedAssist; // ========== API FUNCTIONS ========== //
    // ONBOARD FUNCTION //

    function onboard() {
      if (state.config.headlessMode) {
        return new Promise(
        /*#__PURE__*/
        function () {
          var _ref = asyncToGenerator(
          /*#__PURE__*/
          regenerator.mark(function _callee(resolve, reject) {
            var error, _error, _error2, _error3, _error4, _error5, _error6, _error7;

            return regenerator.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return checkUserEnvironment().catch(reject);

                  case 2:
                    if (state.mobileDevice) {
                      error = new Error('User is on a mobile device');
                      error.eventCode = 'mobileBlocked';
                      reject(error);
                    }

                    if (!state.validBrowser) {
                      _error = new Error('User has an invalid browser');
                      _error.eventCode = 'browserFail';
                      reject(_error);
                    }

                    if (!state.web3Wallet) {
                      _error2 = new Error('User does not have a web3 wallet installed');
                      _error2.eventCode = 'walletFail';
                      reject(_error2);
                    }

                    if (!state.accessToAccounts) {
                      if (state.legacyWallet) {
                        _error3 = new Error('User needs to login to their account');
                        _error3.eventCode = 'walletLogin';
                        reject(_error3);
                      }

                      if (state.modernWallet) {
                        if (!state.walletLoggedIn) {
                          _error4 = new Error('User needs to login to wallet');
                          _error4.eventCode = 'walletLoginEnable';
                          reject(_error4);
                        }

                        if (!state.walletEnabled) {
                          _error5 = new Error('User needs to enable wallet');
                          _error5.eventCode = 'walletEnable';
                          reject(_error5);
                        }
                      }
                    }

                    if (!state.correctNetwork) {
                      _error6 = new Error('User is on the wrong network');
                      _error6.eventCode = 'networkFail';
                      reject(_error6);
                    }

                    if (!state.minimumBalance) {
                      _error7 = new Error('User does not have the minimum balance specified in the config');
                      _error7.eventCode = 'nsfFail';
                      reject(_error7);
                    }

                    resolve('User is ready to transact');

                  case 9:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        }());
      }

      if (!state.validApiKey) {
        var _errorObj2 = new Error('Your api key is not valid');

        _errorObj2.eventCode = 'initFail';
        return Promise.reject(_errorObj2);
      }

      if (!state.supportedNetwork) {
        var _errorObj3 = new Error('This network is not supported');

        _errorObj3.eventCode = 'initFail';
        return Promise.reject(_errorObj3);
      } // If user is on mobile, warn that it isn't supported


      if (state.mobileDevice) {
        return new Promise(function (resolve, reject) {
          handleEvent({
            eventCode: 'mobileBlocked',
            categoryCode: 'onboard'
          }, {
            onClose: function onClose() {
              var errorObj = new Error('User is on a mobile device');
              errorObj.eventCode = 'mobileBlocked';
              reject(errorObj);
            }
          });
          updateState({
            validBrowser: false
          });
        });
      }

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = asyncToGenerator(
        /*#__PURE__*/
        regenerator.mark(function _callee2(resolve, reject) {
          var ready;
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return prepareForTransaction('onboard').catch(reject);

                case 2:
                  ready = _context2.sent;
                  resolve(ready);

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    } // CONTRACT FUNCTION //


    function Contract(contractObj) {
      if (!state.validApiKey) {
        var _errorObj4 = new Error('Your API key is not valid');

        _errorObj4.eventCode = 'initFail';
        throw _errorObj4;
      }

      if (!state.supportedNetwork) {
        var _errorObj5 = new Error('This network is not supported');

        _errorObj5.eventCode = 'initFail';
        throw _errorObj5;
      } // if user is on mobile, and mobile is allowed by Dapp then just pass the contract back


      if (state.mobileDevice && !config.mobileBlocked) {
        return contractObj;
      } // Check if we have an instance of web3


      if (!state.web3Instance) {
        if (window.web3) {
          configureWeb3();
        } else {
          var _errorObj6 = new Error('A web3 instance is needed to decorate contract');

          _errorObj6.eventCode = 'initFail';
          throw _errorObj6;
        }
      }

      var legacyWeb3 = state.legacyWeb3;
      var abi = contractObj.abi || contractObj._jsonInterface;
      var modifiedContractObject = abi.reduce(function (originalContract, methodABI) {
        var name = methodABI.name,
            type = methodABI.type; // If the method is not a function then do nothing to it

        if (type !== 'function') {
          return originalContract;
        } // Save the original method to a variable


        var method = legacyWeb3 ? originalContract[name] : originalContract.methods[name]; // Replace the methods with our decorated ones

        if (legacyWeb3) {
          originalContract[name] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return legacyMethod(method, methodABI, args);
          };

          originalContract[name].call =
          /*#__PURE__*/
          asyncToGenerator(
          /*#__PURE__*/
          regenerator.mark(function _callee3() {
            var _len2,
                allArgs,
                _key2,
                _separateArgs,
                callback,
                args,
                result,
                _args3 = arguments;

            return regenerator.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    for (_len2 = _args3.length, allArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      allArgs[_key2] = _args3[_key2];
                    }

                    _separateArgs = separateArgs(allArgs), callback = _separateArgs.callback, args = _separateArgs.args;
                    _context3.next = 4;
                    return bluebird_1(method.call).apply(void 0, toConsumableArray(args)).catch(function (errorObj) {
                      return callback && callback(errorObj);
                    });

                  case 4:
                    result = _context3.sent;

                    if (result) {
                      callback && callback(null, result);
                    }

                    handleEvent({
                      eventCode: 'contractQuery',
                      categoryCode: 'activeContract',
                      contract: {
                        methodName: name,
                        parameters: args,
                        result: JSON.stringify(result)
                      }
                    });

                  case 7:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));
          originalContract[name].sendTransaction =
          /*#__PURE__*/
          asyncToGenerator(
          /*#__PURE__*/
          regenerator.mark(function _callee4() {
            var _len3,
                allArgs,
                _key3,
                _separateArgs2,
                callback,
                txObject,
                args,
                _args4 = arguments;

            return regenerator.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    for (_len3 = _args4.length, allArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                      allArgs[_key3] = _args4[_key3];
                    }

                    _separateArgs2 = separateArgs(allArgs), callback = _separateArgs2.callback, txObject = _separateArgs2.txObject, args = _separateArgs2.args;
                    _context4.next = 4;
                    return sendTransaction('activeContract', txObject, bluebird_1(method.sendTransaction), callback, method, {
                      methodName: name,
                      parameters: args
                    }).catch(function (errorObj) {
                      return callback && callback(errorObj);
                    });

                  case 4:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));
          originalContract[name].getData = method.getData;
        } else {
          originalContract.methods[name] = function () {
            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            return modernMethod(method, methodABI, args);
          };
        }

        return originalContract;
      }, contractObj);
      return modifiedContractObject;
    } // TRANSACTION FUNCTION //


    function Transaction(txObject, callback) {
      if (!state.validApiKey) {
        var _errorObj7 = new Error('Your api key is not valid');

        _errorObj7.eventCode = 'initFail';
        return Promise.reject(_errorObj7);
      }

      if (!state.supportedNetwork) {
        var _errorObj8 = new Error('This network is not supported');

        _errorObj8.eventCode = 'initFail';
        return Promise.reject(_errorObj8);
      } // Check if we have an instance of web3


      if (!state.web3Instance) {
        configureWeb3();
      } // if user is on mobile, and mobile is allowed by Dapp just put the transaction through


      if (state.mobileDevice && !state.config.mobileBlocked) {
        return state.web3Instance.eth.sendTransaction(txObject);
      }

      var sendMethod = state.legacyWeb3 ? bluebird_1(state.web3Instance.eth.sendTransaction) : state.web3Instance.eth.sendTransaction;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = asyncToGenerator(
        /*#__PURE__*/
        regenerator.mark(function _callee5(resolve, reject) {
          var txPromiseObj;
          return regenerator.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return sendTransaction('activeTransaction', txObject, sendMethod, callback).catch(function (errorObj) {
                    reject(errorObj);
                    callback && callback(errorObj);
                  });

                case 2:
                  txPromiseObj = _context5.sent;
                  resolve(txPromiseObj);

                case 4:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, this);
        }));

        return function (_x5, _x6) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  } // GETSTATE FUNCTION //


  function getState() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref6 = asyncToGenerator(
      /*#__PURE__*/
      regenerator.mark(function _callee6(resolve, reject) {
        return regenerator.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return checkUserEnvironment().catch(reject);

              case 2:
                resolve(state);

              case 3:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function (_x7, _x8) {
        return _ref6.apply(this, arguments);
      };
    }());
  }

  var index = {
    init: init
  };

  return index;

})));
