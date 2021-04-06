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
        this.onFulfilledCallbacks.shift()(value)
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

MyPromise.deferred = function() {
  var result = {}
  result.promise = new MyPromise(function(resolve, reject) {
    result.resolve = resolve
    result.reject = reject
  })
  return result
}

module.exports = MyPromise
