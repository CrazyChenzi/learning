const MyPromise = require('../promise')

const promise1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 500)
})

const promise2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(2)
  }, 100)
})

const promise3 = new MyPromise((resolve, reject) => {
  reject(3)
})

MyPromise.race([promise1, promise2, promise3]).then((value) => {
  console.log(value)
}).catch((err) => {
  console.error(err, '---')
}).finally(() => {
  console.log('000000')
})
