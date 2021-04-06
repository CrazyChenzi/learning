const MyPromise = require('../promise')

const promise1 = MyPromise.resolve(3);
const promise2 = new MyPromise((resolve, reject) => setTimeout(reject, 100, 'foo'));
const promises = [promise1, promise2];

MyPromise.allSettled(promises).
  then((results) => console.log(results)).catch(() => {console.log('---')});