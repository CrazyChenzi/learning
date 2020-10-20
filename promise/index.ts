// TODO 🚦 pause

/**
 * promise三种状态 pendding, onFulfilled, onRejected
 * @param fn 
 */

class promiseCopy {
  private info = {
    status: 'pending',
    value: ''
  }
  private onFulfilledArr = [] // then函数里面第一个回调函数的集合
  private onRejectedArr = []  // then函数里面第二个回调函数的集合
  constructor(fn) {}
  public resolve(value) {
    
  }
  public reject(value) {}
}