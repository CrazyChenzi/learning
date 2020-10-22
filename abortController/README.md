# AbortController :warning:

`AbortController`接口表示一个控制器对象，允许你根据需要中止一个或多个 Web请求。

你可以使用 [AbortController.AbortController()](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController/AbortController) 构造函数创建一个新的 `AbortController` 。使用[AbortSignal](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortSignal) 对象可以完成与与DOM请求的通信。

## 构造函数

AbortController.AbortController() 创建一个新的AbortController 对象实例。

## 属性

AbortController.signal **只读**
返回一个[AbortSignal](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortSignal)对象实例，它可以用来 with/abort 一个Web(网络)请求。

## 方法

AbortController.abort()
中止一个尚未完成的Web(网络)请求。这能够中止[fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) 请求，任何响应[Body](https://developer.mozilla.org/zh-CN/docs/Web/API/Body)的消费者和流。

## example 

[AbortController example](./index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <p>Web AbortController</p>

    <div class="controller">
      <button class="download">download video</button>
      <button class="abort">stop download network</button>
    </div>
    <script>
      const url = './sintel.mp4'
      const downloadBtn = document.querySelector('.download')
      const abortBtn = document.querySelector('.abort')

      let controller

      downloadBtn.addEventListener('click', fetchVideo)
      abortBtn.addEventListener('click', () => {
        controller.abort()
        console.log('stop download')
      })

      function fetchVideo() {
        controller = new AbortController()
        const signal = controller.signal
        fetch(url, { signal }).then((response) => {
          if (response.status === 200) {
            return response.blob()
          } else {
            throw new Error('Failed to fetch')
          }
        }).then((vBlob) => {
          console.log('----download success----')
          console.log(vBlob)
        })
      }
    </script>
  </body>
</html>
```

## 参考

[MDN AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/FetchController)
