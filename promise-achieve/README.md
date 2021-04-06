# Promise 完整实现

未做方法、变量私有化，未支持typescript

本文只写了最终代码，未写具体实现思路，可通过断点自行理解，或参照下面的参考

## 基础实现

[参考：从一道让我失眠的 Promise 面试题开始，深入分析 Promise 实现细节](https://juejin.cn/post/6945319439772434469)

起初看到这篇文章，就好奇点进去看了下，最后发现这道面试题大有门道，于是就想着实现以下 Promise，然后在回顾这道题看看其中门路.

```js
Promise.resolve().then(() => {
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    console.log(res)
})

Promise.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() =>{
    console.log(6);
})
```

感觉应该是输出 0，1，2，4，3，5，6。 但实际是输出0，1，2，3，4，5，6。*本文中实现的Promise仍然是按照0，1，2，4，3，5，6去输出的，不做深入追究了*

查了一些资料：

return Promise.resolve 会产生一个PromiseResolveThenableJob，这个也是一个微任务，并且这个job还会调用一次then函数来resolve promise，这个也是一次微任务.... 

> This Job uses the supplied thenable and its then method to resolve the given promise. This process must take place as a Job to ensure that the evaluation of the then method occurs after evaluation of any surrounding code has completed. [sec-promiseresolvethenablejob](https://262.ecma-international.org/7.0/#sec-promiseresolvethenablejob)

MyPromise 完全遵循 PromisesA+ 规范实现 [PromisesA+](https://promisesaplus.com/)

具体整理了一下思路: 

1. Promise 有三种状态
   1. Padding 等待
   2. Fulfilled 完成
   3. Rejected 失败
2. 在执行 Promise 这个类的时候会传入一个执行器，这个执行器是立即执行，执行器中包含 resolve、reject 方法
3. Promise 可以多层 then 链式调用，因此需要一个数组进行存储，每次 shift 出去一个进行调用
4. Promise 是一个类
   1. resolve、reject、race、all、any、allSettled 这些方法都是可以直接通过 Promise.func 出来的，因此这些都为一些静态方法
   2. then、catch、finally 这些都是实例后的的方法，并且都返回一个 Promise 对象
5. 实现异步，可以通过 [MutationObserver（浏览器环境）](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) [process.nextTick（Node环境）](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) [queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/queueMicrotask)

**具体代码实现**

```js
// 定义 promise 的三个状态
const PADDING = 'padding'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(executor) {
    try {      
      executor(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }

  status = PADDING
  value = null // 成功之后的值
  reason = null // 失败之后的原因

  onFulfilledCallbacks = [] // 存储成功回调函数
  onRejectedCallbacks = [] // 存储失败回调函数

  static resolve(parameter) {
    if (parameter instanceof MyPromise) {
      return parameter
    }

    return new MyPromise((resolve) => {
      resolve(parameter)
    })
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason)
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        try {
          MyPromise.resolve(promise).then(resolve, reject)
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }

      let count = 0
      const promiseNum = promises.length
      const resolvedValues = new Array(promiseNum)

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          count++
          resolvedValues[index] = value
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        }).catch((error) => {
          return reject(error)
        })
      })
    })
  }

  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }
      let count = 0
      const promiseNum = promises.length

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          count++
          return resolve(value)
        }).catch((error) => {
          count++
          if (count === promiseNum) {
            // TODO AggregateError 现在为实验中方法，因此暂时使用 TypeError
            return reject(new TypeError('cannotNo Promise in Promise.any was resolved'))
          }
        })
      })
    })
  }

  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }
      let count = 0
      const promiseNum = promises.length
      const resolvedValues = new Array(promiseNum)

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          resolvedValues[index] = {
            status: 'fulfilled',
            value
          }
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        }).catch((reason) => {
          resolvedValues[index] = {
            status: 'rejected',
            reason
          }
        }).finally(() => {
          count++
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        })
      })
    })
  }

  resolve = (value) => {
    if (this.status === PADDING) {
      this.status = FULLFILLED
      this.value = value
      while (this.onFulfilledCallbacks.length) {
        this.onFulfilledCallbacks.shift()(value) // 链式调用
      }
    }
  }
  reject = (reason) => {
    if (this.status === PADDING) {
      this.status = REJECTED
      this.reason = reason
      while (this.onRejectedCallbacks.length) {
        this.onRejectedCallbacks.shift()(reason)
      }
    }
  }
  then(onFulfilled, onRejected) {
    const realOnFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    const realOnRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

    const promise = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = realOnFulfilled(this.value)
            resolvePromise(promise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      const rejectedMicrotask = () => {
        queueMicrotask(() => {
          try {
            const x = realOnRejected(this.reason)
            resolvePromise(promise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      if (this.status === FULLFILLED) {
        // 创建微任务等待 promise 执行完毕
        fulfilledMicrotask()
      } else if (this.status === REJECTED) {
        rejectedMicrotask()
      } else if (this.status === PADDING) {
        // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
        // 等任务执行成功失败函数的时候再传递
        this.onFulfilledCallbacks.push(fulfilledMicrotask)
        this.onRejectedCallbacks.push(rejectedMicrotask)
      }
    })
    return promise
  }
  catch(callback) {
    return this.then(null, callback)
  }
  finally(callback) {
    let P = this.constructor
    return this.then(
      value  => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    )
  }
}

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }

  if (typeof x === 'object' || typeof x === 'function') {
    // x 为 null 则直接返回
    if (x === null) {
      return resolve(x)
    }
    let then
    try {
      then = x.then
    } catch (error) {
      return reject(error)
    }

    if (typeof then === 'function') {
      let called = false
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          y => {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量 called
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          r => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (error) {
        if (called) return
        reject(error)
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x)
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x)
  }
}

// 用于通过 PromiseA+ 进行测试
MyPromise.deferred = function() {
  var result = {}
  result.promise = new MyPromise(function(resolve, reject) {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

module.exports = MyPromise
```

### promise.prototype.catch 实现

```js
  catch(callback) {
    return this.then(null, callback)
  }
```

### promise.prototype.finally 实现

```js
  finally(callback) {
    let P = this.constructor
    return this.then(
      value  => P.resolve(callback()).then(() => value),
      reason => P.resolve(callback()).then(() => { throw reason })
    )
  }
```

### promise.race 实现

> Promise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝

```js
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        try {
          MyPromise.resolve(promise).then(resolve, reject)
        } catch (error) {
          reject(error)
        }
      })
    })
  }
```

### promise.all 实现

> Promise.all() 方法接收一个promise的iterable类型（注：Array，Map，Set都属于ES6的iterable类型）的输入，并且只返回一个Promise实例， 那个输入的所有promise的resolve回调的结果是一个数组。这个Promise的resolve回调执行是在所有输入的promise的resolve回调都结束，或者输入的iterable里没有promise了的时候。它的reject回调执行是，只要任何一个输入的promise的reject回调执行或者输入不合法的promise就会立即抛出错误，并且reject的是第一个抛出的错误信息。

```js
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }

      let count = 0
      const promiseNum = promises.length
      const resolvedValues = new Array(promiseNum)

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          count++
          resolvedValues[index] = value
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        }).catch((error) => {
          return reject(error)
        })
      })
    })
  }
```

### promise.any 实现

> Promise.any() 接收一个Promise可迭代对象，只要其中的一个 promise 成功，就返回那个已经成功的 promise 。如果可迭代对象中没有一个 promise 成功（即所有的 promises 都失败/拒绝），就返回一个失败的 promise 和AggregateError类型的实例，它是 Error 的一个子类，用于把单一的错误集合在一起。本质上，这个方法和Promise.all()是相反的。

```js
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }
      let count = 0
      const promiseNum = promises.length

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          count++
          return resolve(value)
        }).catch((error) => {
          count++
          if (count === promiseNum) {
            // TODO AggregateError 现在为实验中方法，因此暂时使用 TypeError
            return reject(new TypeError('cannotNo Promise in Promise.any was resolved'))
          }
        })
      })
    })
  }
```

### promise.allSettled 实现

> 该Promise.allSettled()方法返回一个在所有给定的promise都已经fulfilled或rejected后的promise，并带有一个对象数组，每个对象表示对应的promise结果。
> 当您有多个彼此不依赖的异步任务成功完成时，或者您总是想知道每个promise的结果时，通常使用它。
> 相比之下，Promise.all() 更适合彼此相互依赖或者在其中任何一个reject时立即结束。

```js
  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      if (promises === null || promises === undefined || typeof promises[Symbol.iterator] !== 'function') {
        reject(new TypeError('cannot read property Symbol(Symbol.iterator)'))
      }
      if (!Array.isArray(promises)) {
        resolve()
      }
      let count = 0
      const promiseNum = promises.length
      const resolvedValues = new Array(promiseNum)

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(value => {
          resolvedValues[index] = {
            status: 'fulfilled',
            value
          }
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        }).catch((reason) => {
          resolvedValues[index] = {
            status: 'rejected',
            reason
          }
        }).finally(() => {
          count++
          if (count === promiseNum) {
            return resolve(resolvedValues)
          }
        })
      })
    })
  }
```
