# 什么是浏览器热更新

看到浏览器热更新，我们很容易就想到的是`webpack` 和 `webpack-dev-server`。

问题：热更新是保存后自动编译（Auto Compile）吗？还是自动刷新浏览器（Live Reload）？还是指HMR（Hot Module Replacement，模块热替换）？

先看一下什么是浏览器的热更新。浏览器的热更新，指的是我们在本地开发的同时打开浏览器进行预览，当代码发生变化时，浏览器自动更新页面的技术。**这里的自动更新，表现上又分为自动刷新整个页面，以及页面整体无刷新而只更新页面的部分内容。**

## 热更新是保存后自动编译（Auto Compile）？

一个简单的实现是使用`webpack`提供的**watch**

```js
module.exports = {
  entry: './src/index0.js',
  mode: 'development',
  watch: true
}

// package.json
"build:watch": "webpack --config webpack.config.watch.js"
```

实现了保存后自动编译，但也有很多弊端，必须要**刷新页面**才可以看到实时的编译结果

## 热更新是自动刷新浏览器（Live Reload）？

一个简单的实现是利用`webpack-dev-server`实现一个简单的 Live Reload，其原理就是建立`websocket`长连接

```js
module.exports = {
  entry: './src/index0.js',
  mode: 'development',
  devServer: {
    contentBase: './dist',
    open: true,
  }
}

// package.json
"dev:reload": "webpack-dev-server --config webpack.config.reload.js"
```

这基本已经实现了我们预期的结果，但我们发现在它其实是每次自动帮我们刷新了页面，这样的话我们**input**框的输入内容、**model**框都在下一次编译后恢复初始。

## 热更新指的是HMR（Hot Module Replacement，模块热替换）？

一个简单的实现是利用`webpack-dev-server`实现一个简单的 HMR，其原理是通过`websocket`和新增的两个请求：**hot-update.json** 和 **hot-update.js**

```js
module.exports = {
  entry: './src/index1.js',
  mode: 'development',
  devServer: {
    contentBase: './dist',
    open: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

虽然这种方式已经可以动态更新样式，但对js的支持还是如上一种方式一样，需要刷新页面

## webpack中的热更新

下图是 webpackDevServer 中 HMR 的基本流程图，完整的 HMR 功能主要包含了三方面的技术：

1. watch 示例中体现的，对本地源代码文件内容变更的监控。
2. instant reload 示例中体现的，浏览器网页端与本地服务器端的 Websocket 通信。
3. hmr 示例中体现的，也即是最核心的，模块解析与替换功能。

![webpackDevServer HMR](./images/webpack_dev_server_hmr.jpg)

也就是说在这三种技术中，我们可以基于 Node.js 中提供的文件模块 **fs.watch** 来实现对文件和文件夹的监控，同样也可以使用 **sockjs-node** 或 socket.io 来实现 Websocket 的通信。而在这里，我们重点来看下第三种， webpack 中的模块解析与替换功能

## webpack中的打包流程

术语

- module：指的是模块化编程中我们把应用程序分割成的独立功能代码块
- chunk：指模块间按照引用关系组合成的代码块，一个**chunk**中可以包含多个**module**
- chunk group：指通过配置入口点（entry point）区分的块组，一个**chunk group**中可以包含多个**chunk**
- bundling：webpack打包的过程
- asset/bundle：打包的产物

webpack 的打包思想可以简化为 3 点：

1. 一切源代码文件均可通过各种 **Loader** 转换为 JS 模块 （module），模块之间可以互相引用。
2. webpack 通过入口点（entry point）递归处理各模块引用关系，最后输出为一个或多个产物包 js(bundle) 文件。
3. 每一个入口点都是一个块组（chunk group），在不考虑分包的情况下，一个 chunk group 中只有一个 chunk，该 chunk 包含递归分析后的所有模块。每一个 chunk 都有对应的一个打包后的输出文件（asset/bundle）。

![webpack Build](./images/webpack_build.jpg)

在上面的 hmr 示例中，从 entry 中的 './src/index1.js' 到打包产物的 dist/main.js，以模块的角度而言，其基本流程是：

1. 唯一 entry 创建一个块组（chunk group）， name 为 main，包含了 ./src/index1.js 这一个模块。
2. 在解析器中处理 ./src/index1.js 模块的代码，找到了其依赖的 './style.css'，找到匹配的 loader: css-loader 和 style-loader。
3. 首先通过 css-loader 处理，将 css-loader/dist/cjs.js!./src/style.css 模块（即把 CSS 文件内容转化为 js 可执行代码的模块，这里简称为 Content 模块）和 css-loader/dist/runtime/api.js 模块打入 chunk 中。
4. 然后通过 style-loader 处理，将 style-loader/dist/runtime/injectStylesIntoStyleTag.js 模块 （我们这里简称为 API 模块），以及处理后的 .src/style.css 模块（作用是运行时中通过 API 模块将 Content 模块内容注入 Style 标签）导入 chunk 中。
5. 依次类推，直到将所有依赖的模块均打入到 chunk 中，最后输出名为 main.js 的产物（我们称为 Asset 或 Bundle）

上述流程的结果我们可以在预览页面中控制台的 Sources 面板中看到，这里，我们重点看经过 style-loader 处理的 style.css 模块的代码：

![style CSS](./images/style_css.jpg)

## style-loader中的热替换代码

简化一下上述控制台中看到的 style-loader 处理后的模块代码，只看其热替换相关的部分。

```js
//为了清晰期间，我们将模块名称注释以及与热更新无关的逻辑省略，并将 css 内容模块路径赋值为变量 cssContentPath 以便多处引用，实际代码可从示例运行时中查看 

var cssContentPath = "./node_modules/css-loader/dist/cjs.js!./src/style.css" 
var api = __webpack_require__("./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
            var content = __webpack_require__(cssContentPath);
... 
var update = api(content, options); 
... 
module.hot.accept( 
  cssContentPath, 
  function(){ 
    content = __webpack_require__(cssContentPath)
    ... 
    update(content)
  } 
) 
module.hot.dispose(function() { 
  update()
})
```

从上面的代码中我们可以看到，在运行时调用 API 实现将样式注入新生成的 style 标签，并将返回函数传递给 update 变量。然后，在 module.hot.accept 方法的回调函数中执行 update(content)，在 module.hot.dispose 中执行 update()。通过查看上述 API 的代码，可以发现 update(content) 是将新的样式内容更新到原 style 标签中，而 update() 则是移除注入的 style 标签，那么这里的 module.hot 究竟是什么呢？

## 模块热替换插件（HotModuleReplacementPlugin）

上面的 module.hot 实际上是一个来自 webpack 的基础插件 HotModuleReplacementPlugin，该插件作为热替换功能的基础插件，其 API 方法导出到了 module.hot 的属性中。

在上面代码的两个 API 中，hot.accept 方法传入依赖模块名称和回调方法，当依赖模块发生更新时，其回调方法就会被执行，而开发者就可以在回调中实现对应的替换逻辑，即上面的用更新的样式替换原标签中的样式。另一个 hot.dispose 方法则是传入一个回调，当代码上下文的模块被移除时，其回调方法就会被执行。例如当我们在源代码中移除导入的 CSS 模块时，运行时原有的模块中的 update() 就会被执行，从而在页面移除对应的 style 标签。

module.hot 中还包含了该插件提供的其他热更新相关的 API 方法，这里就不再赘述了，感兴趣的同学可以从 [官方文档](https://webpack.js.org/api/hot-module-replacement/)中进一步了解。

通过上面的分析，我们就了解了热替换的基本原理，这也解释了为什么我们替换 index1.js 中的输出文本内容时，并没有观察到热更新，而是看到了整个页面的刷新：因为代码中并未包含对热替换插件 API 的调用，代码的解析也没有配置额外能对特定代码调用热替换 API 的 Loader。所以在最后，我们就来实现下 JS 中更新文本内容的热替换。

这也就解释了为什么我们改变js代码是刷新页面而不是直接的hmr了

## js代码中的hmr

```js
import { text } from './text'

const div = document.createElement('div')
document.body.appendChild(div)
function render() {
  div.innerHTML = text
}

render()

if(module.hot) {
  module.hot.accept('./text.js', () => {
    render()
  })
}
```

在上面的代码中，我们将用于修改的文本单独作为一个 JS 模块，以便传入 hot.accept 方法。当文本发生变更时，可以观察到浏览器端显示最新内容的同时并未触发页面刷新，验证生效。此外， accept 方法也支持监控当前文件的变更，对应的 DOM 更新逻辑稍做调整也能达到无刷新效果，区别在于替换自身模块时示例中不可避免地需要更改 DOM

从上面的例子中我们可以看到，热替换的实现，既依赖 webpack 核心代码中 **HotModuleReplacementPlugin** 所提供的相关 API，也依赖在具体模块的加载器中实现相应 API 的更新替换逻辑。因此，在配置中开启 hot:true 并不意味着任何代码的变更都能实现热替换，除了示例中演示的 style-loader 外， vue-loader、 react-hot-loader 等加载器也都实现了该功能。**当开发时遇到 hmr 不生效的情况时，可以优先确认对应加载器是否支持该功能，以及是否使用了正确的配置。**
