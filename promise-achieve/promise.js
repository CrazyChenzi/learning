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
  vaule = null // 成功之后的值
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
