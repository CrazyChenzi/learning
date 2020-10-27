let mathArr = [5, 1, 10, 3, 6, 5]

// Math.min()是Js数学库中的函数没用于将所有传递的值中的最小值返回
const min = Math.min(...mathArr)
console.log(`最小值：Math.min(...mathArr) = ${min}`)

// Math.max()将所有传递值中的最大值返回
const max = Math.max(...mathArr)
console.log(`最大值：Math.max(...mathArr) = ${max}`)

// Math.round返回一个数字四舍五入后最接近的整数
const round = Math.round(4.5)
console.log(`四舍五入：Math.round(4.5) = ${round}`)

// Math.sqrt()返回一个数的平方根
const sqrt = Math.sqrt(4)
console.log(`平方根：Math.sqrt(4) = ${sqrt}`)

// Math.pow()函数返回基数(base)的指数(exponent)次幂
const pow = Math.pow(2, 3)
console.log(`基数的指数次幂：Math.pow(2, 3) = ${pow}`)

// Math.floor()返回小于或等于一个给定数字的最大整数
const floor = Math.floor(4.9)
console.log(`小于给定数字的最大整数：Math.floor(4.9) = ${floor}`)

// Math.random()函数返回一个浮点,  伪随机数在范围从0到小于1，也就是说，从0（包括0）往上，但是不包括1（排除1），然后你可以缩放到所需的范围。实现将初始种子选择到随机数生成算法;它不能被用户选择或重置。
const random = Math.random()
console.log(`随机数：Math.random() = ${random}`)

// Math.cos() 返回一个数值的余弦值
const cos = Math.cos(180)
console.log(`余弦值：Math.cos(180) = ${cos}`)

// Math.sin() 返回一个函数的正弦值
const sin = Math.sin(90)
console.log(`正弦值：Math.sin(90) = ${sin}`)

// Math.ceil() 返回大于或等于一个更定数字的最小整数
const ceil = Math.ceil(4.1)
console.log(`大于或等于一个给定数字的最小整数：Math.ceil(4.1) = ${ceil}`)
