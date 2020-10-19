// fun(1)(2)(3)(4)

function add(x, y) {
  return x + y
}

console.log(add(1, 2));

function curriedAdd(x) {
  return function (y) {
    return x + y;
  };
}

console.log(curriedAdd(3)(4));

function currying(fn, ...args1) {
  return function (...args2) {
    return fn(...args1, ...args2);
  };
}

console.log(currying(add, 5)(6));

function funCurrying(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2))
      }
    }
  }

}

console.log(funCurrying(add)(2)())

function curry(fn, args) {
  var length = fn.length;

  args = args || [];

  return function () {
    var _args = args.slice(0),
      arg,
      i;

    for (i = 0; i < arguments.length; i++) {
      arg = arguments[i];

      _args.push(arg);
    }
    if (_args.length < length) {
      return curry.call(this, fn, _args);
    } else {
      return fn.apply(this, _args);
    }
  };
}

var fn = curry(add)

console.log(fn(7)(8))
