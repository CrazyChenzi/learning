# Source Map

## 什么是 Source Map

在日常开发过程中，我们编写的源代码通过多重处理（编译，封装，压缩...），最后形成的产物代码，在浏览器中调试时，我们会发现代码变得面目全非，根本没办法调试。

因此，我们需要一种将产物代码回溯到源代码的功能，**Source Map**就是实现这一功能的工具。

**Source Map**的基本原理是，在编译过程中，在生成产物代码的同时也生成基于源代码的一份映射关系表。有了这张映射关系表，我们就可以通过 chrome 控制台中的“Enable JavaScript source map”来实现调试时的显示与定位源代码的功能。

生成**Source Map**的方式有很多种，他们的**构建速度、质量**（反解代码与源代码的接近程度以及调试时行号等辅助信息的对应情况）、**访问方式**（在产物文件中或单独生成 source map）、文件大小都各不相同。在开发和生成环境下我们对 source map 的期望也有所不同。

- 在开发环境中，我们更关心构建速度、质量，以便于提升开发效率，而不关心文件大小与访问方式
- 在生产环境中，我们更关注的是，是否需要开启 source map，生成文件的大小和访问方式是否对页面性能造成影响，其次才是质量和构建速度。

## webpack 中 source map 的预设

在**webpack**中，通过设置 devtool 来选择 source map 的预设类型，它提供了[20 多种](https://webpack.js.org/configuration/devtool/#devtool)source map 的预设。

这些预设通常包含了**eval、cheap、module、inline、hidden、nosource、source-map**等关键字组合。

```js
// TODO webpack/lib/WebpackOptionsApply.js:232

if (options.devtool.includes("source-map")) {
  const hidden = options.devtool.includes("hidden");
  const inline = options.devtool.includes("inline");
  const evalWrapped = options.devtool.includes("eval");
  const cheap = options.devtool.includes("cheap");
  const moduleMaps = options.devtool.includes("module");
  const noSources = options.devtool.includes("nosources");
  const Plugin = evalWrapped
    ? require("./EvalSourceMapDevToolPlugin")
    : require("./SourceMapDevToolPlugin");
  new Plugin({
    filename: inline ? null : options.output.sourceMapFilename,
    moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
    fallbackModuleFilenameTemplate:
      options.output.devtoolFallbackModuleFilenameTemplate,
    append: hidden ? false : undefined,
    module: moduleMaps ? true : cheap ? false : true,
    columns: cheap ? false : true,
    noSources: noSources,
    namespace: options.output.devtoolNamespace,
  }).apply(compiler);
} else if (options.devtool.includes("eval")) {
  const EvalDevToolModulePlugin = require("./EvalDevToolModulePlugin");
  new EvalDevToolModulePlugin({
    moduleFilenameTemplate: options.output.devtoolModuleFilenameTemplate,
    namespace: options.output.devtoolNamespace,
  }).apply(compiler);
}
```

_devtool 的值匹配并非精确匹配，某个关键字只要包含在赋值中即可获得匹配，例如：'foo-eval-bar' 等同于 'eval'，'cheapfoo-source-map' 等同于 'cheap-source-map'。_

## Source Map 名称关键字

- false：即不开启 source map 功能，其他不符合上述规则的赋值也等价于 false。
- eval：是指在编译器中使用 EvalDevToolModulePlugin 作为 source map 的处理插件。
  [xxx-...]source-map：根据 devtool 对应值中是否有 **eval** 关键字来决定使用 EvalSourceMapDevToolPlugin 或 SourceMapDevToolPlugin 作为 source map 的处理插件，其余关键字则决定传入到插件的相关字段赋值。
- inline：决定是否传入插件的 filename 参数，作用是决定单独生成 source map 文件还是在行内显示，**该参数在 eval- 参数存在时无效**。
- hidden：决定传入插件 append 的赋值，作用是判断是否添加 SourceMappingURL 的注释，**该参数在 eval- 参数存在时无效**。
- module：为 true 时传入插件的 module 为 true ，作用是为加载器（Loaders）生成 source map。
- cheap：这个关键字有两处作用。首先，当 module 为 false 时，它决定插件 module 参数的最终取值，最终取值与 cheap 相反。其次，它决定插件 columns 参数的取值，作用是决定生成的 source map 中是否包含列信息，在不包含列信息的情况下，调试时只能定位到指定代码所在的行而定位不到所在的列。
- nosource：nosource 决定了插件中 noSource 变量的取值，作用是决定生成的 source map 中是否包含源代码信息，不包含源码情况下只能显示调用堆栈信息。

## Source Map 处理插件

从上面的规则中我们还可以看到，根据不同规则，实际上 Webpack 是从三种插件中选择其一作为 source map 的处理插件。

- [EvalDevToolModulePlugin](https://github.com/webpack/webpack/blob/master/lib/EvalDevToolModulePlugin.js)：模块代码后添加 sourceURL=webpack:///+ 模块引用路径，不生成 source map 内容，模块产物代码通过 eval() 封装。
- [EvalSourceMapDevToolPlugin](https://github.com/webpack/webpack/blob/master/lib/EvalSourceMapDevToolPlugin.js)：生成 base64 格式的 source map 并附加在模块代码之后， source map 后添加 sourceURL=webpack:///+ 模块引用路径，不单独生成文件，模块产物代码通过 eval() 封装。
- [SourceMapDevToolPlugin](https://github.com/webpack/webpack/blob/master/lib/SourceMapDevToolPlugin.js)：生成单独的 .map 文件，模块产物代码不通过 eval 封装。

通过上面的代码分析，我们了解了不同参数在 Webpack 运行时起到的作用。那么这些不同参数组合下的各种预设对我们的 source map 生成又各自会产生什么样的效果呢？

## 不同预设的结果对比

| devtool 类型                   | 大小（KB）注 1 | 时间（ms）注 2          | 质量（代码可读性）       | 附加内容                                                                                                                      | 调试效果                                                                                                                                 |
| ------------------------------ | -------------- | ----------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| none                           | 1553           | 3803/41（最快/最快）    | 打包后产物代码（地）     | -                                                                                                                             | 无                                                                                                                                       |
| eval                           | 1597           | 3798/42（最快/最快）    | 生成后产物代码（低）     | 每个模块代码后添加 sourceURL=webpack:///./...                                                                                 | 能定位到具体源文件名，但是现实内容为生成后代码，相比于 none 只是多了 eval()以及 sourceURL 指向                                           |
| eval-source-map                | 5496           | 5915/89（最慢 ⬇/快）    | 源代码（最高 ⬆）         | 每个模块代码后添加 sourceURL=[module]\n//#sourceMappingURL=...Base64 data                                                     | 能定位到源文件名，且显示内容为源代码。点击调试点能定位到具体行与列                                                                       |
| eval-cheap-source-map          | 3753           | 3862/64（快/更快）      | loader 处理后代码（中）  | 同上                                                                                                                          | 能定位到源文件名，显示内容为经过 babel-loader 转换后的代码，点击调试能定位到行但缺少列信息，只能跳转到行首                               |
| eval-cheap-module-source-map   | 4023           | 4197/81（慢/更快）      | 缺少列信息的源代码（高） | 同上                                                                                                                          | 能定位到原文件名，切显示内容为源代码，点击调试能定位到行但缺少列信息，只能跳转到行首                                                     |
| source-map                     | 1554/2836      | 5833/1721（最慢/最慢）⬇ | 源代码（最高 ⬆）         | 单独生成.map 后缀的 sourcemap 文件，在产物代码末尾生成一个 sourceMappingURL=xxx.map                                           | 与 eval-source-map 效果相同                                                                                                              |
| cheap-source-map               | 1554/1595      | 4099/122（快/慢）       | loader 转换后代码（中）  | 同上                                                                                                                          | 与 eval-cheap-source-map 效果相同                                                                                                        |
| cheap-module-source-map        | 1554/1794      | 4052/176（慢/更慢）     | 缺少列信息的源代码（高） | 同上                                                                                                                          | 与 eval-cheap-module-source-map 相同                                                                                                     |
| inline-source-map              | 5336           | 5247/1543（最慢/最慢）⬇ | 源代码（最高 ⬆）         | 在产物代码末尾生成一个 sourceMappingURL=...Base64 data                                                                        | 与 eval-source-map 相同，**通常应用在第三方代码中**                                                                                      |
| inline-cheap-source-map        | 3682           | 3785/131（快/慢）       | loader 转换后代码（中）  | 同上                                                                                                                          | 与 eval-cheap-source-map 效果相同                                                                                                        |
| inline-cheap-module-source-map | 3947           | 4146/185（慢/更慢）     | 缺少列信息的源代码（高） | 同上                                                                                                                          | 与 eval-cheap-module-source-map 相同                                                                                                     |
| hidden-source-map              | 1554/2836      | 5871/1569（最慢/最慢）⬇ | 源代码（最高 ⬆）         | 单独生成.map 后缀的 sourcemap 文件，产物代码末尾不添加 sourceMappingURL，即起到隐藏的作用，**通常用于错误报告工具中定位使用** | 外部访问不带 sourceMappingURL 的产物文件，而生成的 sourcemap 文件仅用于错误报告工具等特殊情况下生成和使用，**通常不上传到 web 服务器中** |
| nosources-source-map           | 1554/1173      | 5270/1568（最慢/最慢）⬇ | 无法显示代码（最低 ⬇）   | 与 source-map 相同                                                                                                            | 用于在报错信息上传于调试时显示堆栈信息，而无法查看源码                                                                                   |

*注 1：“/”前后分别表示产物 js 大小和对应 .map 大小。
*注 2：“/”前后分别表示初次构建时间和开启 watch 模式下 rebuild 时间。对应统计的都是 development 模式下的笔者机器环境下几次构建时间的平均值，只作为相对快慢与量级的比较。

选择不同的devtool会产生不同的效果

- 质量：souce-map = eval-source-map > cheap-module- > cheap- > eval = none > nosource-
- 构建速度：再次构建速度都大于第一次构建速度
  - 在开发环境下：一直开着 devServer，再次构建的速度对我们的效率影响远大于初次构建的速度。从结果中可以看到，eval- 对应的 EvalSourceMapDevToolPlugin 整体要快于不带 eval- 的 SourceMapDevToolPlugin。尤其在质量最佳的配置下，eval-source-map 的再次构建速度要远快于其他几种。而同样插件配置下，不同质量配置与构建速度成反比，但差异程度有限，更多是看具体项目的大小而定。
  - 在生产环境下：通常不会开启再次构建，因此相比再次构建，初次构建的速度更值得关注，甚至对构建速度以外因素的考虑要优先于对构建速度的考虑。
- 包的大小和生成方式：在开发环境下我们并不需要关注这些因素，**正如开发环境下也通常不考虑使用分包等优化方式**。我们需要关注速度和质量来保证我们的开发体验。

## 开发环境下Source Map推荐预设

- 如果在调试时，需要通过source map来快速定位源代码，优先考虑使用**eval-cheap-module-source-map**
- 或者使用**eval-source-map** **eval-cheap-source-map**
- 或者通过**EvalSourceMapDevToolPlugin EvalDevToolModulePlugin**插件

## reference👍

[浏览器工具是如何将 source map 内容映射回源文件](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)

> 在控制台的网络面板中通常看不到 source map 文件的请求，其原因是出于安全考虑 Chrome 隐藏了 source map 的请求，需要通过 [net-log](chrome://net-export/) 来查询。
