const MyPromise = require('../promise')

const pErr = new MyPromise((resolve, reject) => {
  console.log('---')
  reject("总是失败");
});

const pSlow = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    console.log('1')
    resolve(2) 
  }, 500);
});

const pFast = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, "很快完成");
});

MyPromise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value);
})

const pErr2 = new MyPromise((resolve, reject) => {
  reject('总是失败');
});

MyPromise.any([pErr2]).catch((err) => {
  console.log(err);
})
