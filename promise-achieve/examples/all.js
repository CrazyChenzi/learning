const MyPromise = require('../promise')

const promise1 = MyPromise.resolve(3)
const promise2 = 42
const promise3 = new MyPromise((resolve, reject) => {
  setTimeout(reject, 100, 'foo')
})

MyPromise.all([promise1, promise2, promise3]).then(values => {
  console.log(values)
}).catch((err) => {console.log(err)}).finally(() => {console.log('000000')})