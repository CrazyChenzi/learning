基于[create-react-app](https://zh-hans.reactjs.org/docs/create-a-new-react-app.html#create-react-app)

## Props State

React为向下数据流(因此我们可以将父组件的state传递到子组件)，因此可以状态提升(状态提升就是把子组件的state提升到父组件)

**Props**

用来父子间传递数据，`function`下可直接 (props) => props[key] || props."key"，`class`下需要this.props[key] || this.props."key"

**State**

不要直接修改State，修改State最好使用`setState()`进行修改，否则页面可能不会刷新

State的更新可能是异步的，React出于性能考虑，会把多个`setState`合并为一个调用，因此State更新可能是异步的，如何让其能快速更新到dom呢？

[State](https://zh-hans.reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous)

State的更新会被合并

## 列表 key 类似Vue v-for key

## Fragments 类似Vue Template

> React 中的一个常见模式是一个组件返回多个元素。Fragments 允许你将子列表分组，而无需向 DOM 添加额外节点。

**使用**

```jsx
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
    </React.Fragment>
  );
}
```

*短语法*不支持`key`属性

```jsx
class Columns extends React.Component {
  render() {
    return (
      <>
        <td>Hello</td>
        <td>World</td>
      </>
    );
  }
}
```

[Fragments](https://zh-hans.reactjs.org/docs/fragments.html)

## React.lazy

[React lazy](https://zh-hans.reactjs.org/docs/code-splitting.html#reactlazy)

像渲染常规组件一样处理动态引入的(组件)

```ts
import React, { Suspense } from 'React'
const OntherComponent = React.lazy(() => import('./OtherComponent'))

function MyComponent() {
  return (
    <div>
      <Suspense fallback={ <div>Loading...</div> }>
        <OtherComponent />
      </Suspense>
    </div>
  )
}
```

## React.createContext

类似Vue中的provide inject吧，但是React中就没有那么好用了...，如果在不需要监听器变化的情况下，声明外部变量感觉更好用一点。

[文档地址](https://zh-hans.reactjs.org/docs/context.html)

## 错误辩解 Error Boundaries

React16之后引入，目的是捕获并打印发生在其子组件树任何位置的JavaScript错误，并且，渲染备用UI

[文档链接](https://zh-hans.reactjs.org/docs/error-boundaries.html)

> 无法捕获时间处理、异步代码、服务端渲染以及其自身抛出的错误

如果一个 class 组件中定义了 static getDerivedStateFromError() 或 componentDidCatch() 这两个生命周期方法中的任意一个（或两个）时，那么它就变成一个错误边界。当抛出错误后，请使用 static getDerivedStateFromError() 渲染备用 UI ，使用 componentDidCatch() 打印错误信息。

ErrorBoundary

```ts
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}
```

## Refs

🙁感觉不会经常用到

## HOC 高阶组件

🙁

**不要在render中使用 Refs不会被传递**

## JSX

组件名大写  JSX不能是一个表达式  Boolean、Null、Undefined将被忽略不会渲染

```ts
function Story(props) {
  // 错误！JSX 类型不能是一个表达式。
  return <components[props.storyType] story={props.story} />;
}

function Story(props) {
  // 正确！JSX 类型可以是大写字母开头的变量。
  const SpecificStory = components[props.storyType];
  return <SpecificStory story={props.story} />;
}

<div />

<div></div>

<div>{false}</div>

<div>{null}</div>

<div>{undefined}</div>

<div>{true}</div>
```

## Portals

Portal提供了一种将子节点渲染到父节点以外的DOM节点的方案

```ts
ReactDOM.createPortal(child, container) // 语法

// example
render() {
  // React 并*没有*创建一个新的 div。它只是把子元素渲染到 `domNode` 中。
  // `domNode` 是一个可以在任何位置的有效 DOM 节点。
  return ReactDOM.createPortal(
    this.props.children,
    domNode
  );
}
```

child是任何可渲染的React子元素，container是一个DOM元素


## Profiler 

Profiler 测量渲染一个 React 应用多久渲染一次以及渲染一次的“代价”。 它的目的是识别出应用中渲染较慢的部分，只能应用于**开发环境**

[React Profiler](https://zh-hans.reactjs.org/docs/profiler.html)

## StrictMode 

严格模式，只能应用于**开发环境**

[React StrictMode](https://zh-hans.reactjs.org/docs/strict-mode.html)

## React 生命周期

[React 生命周期](https://zh-hans.reactjs.org/docs/react-component.html)

**挂载**

当组件实例被创建并插入 DOM 中时，其生命周期调用顺序如下：

- [**`constructor()`**](https://zh-hans.reactjs.org/docs/react-component.html#constructor)
- [`static getDerivedStateFromProps()`](https://zh-hans.reactjs.org/docs/react-component.html#static-getderivedstatefromprops)
- [**`render()`**](https://zh-hans.reactjs.org/docs/react-component.html#render)
- [**`componentDidMount()`**](https://zh-hans.reactjs.org/docs/react-component.html#componentdidmount)

**更新**

当组件的 props 或 state 发生变化时会触发更新。组件更新的生命周期调用顺序如下：

- [`static getDerivedStateFromProps()`](https://zh-hans.reactjs.org/docs/react-component.html#static-getderivedstatefromprops)
- [`shouldComponentUpdate()`](https://zh-hans.reactjs.org/docs/react-component.html#shouldcomponentupdate)
- [**`render()`**](https://zh-hans.reactjs.org/docs/react-component.html#render)
- [`getSnapshotBeforeUpdate()`](https://zh-hans.reactjs.org/docs/react-component.html#getsnapshotbeforeupdate)
- [**`componentDidUpdate()`**](https://zh-hans.reactjs.org/docs/react-component.html#componentdidupdate)

#### 卸载

当组件从 DOM 中移除时会调用如下方法：

- [**`componentWillUnmount()`**](https://zh-hans.reactjs.org/docs/react-component.html#componentwillunmount)

#### 错误处理

当渲染过程，生命周期，或子组件的构造函数中抛出错误时，会调用如下方法：

- [`static getDerivedStateFromError()`](https://zh-hans.reactjs.org/docs/react-component.html#static-getderivedstatefromerror)
- [`componentDidCatch()`](https://zh-hans.reactjs.org/docs/react-component.html#componentdidcatch)

### 其他 APIs

组件还提供了一些额外的 API：

- [`setState()`](https://zh-hans.reactjs.org/docs/react-component.html#setstate)
- [`forceUpdate()`](https://zh-hans.reactjs.org/docs/react-component.html#forceupdate)

### class 属性

- [`defaultProps`](https://zh-hans.reactjs.org/docs/react-component.html#defaultprops)
- [`displayName`](https://zh-hans.reactjs.org/docs/react-component.html#displayname)

### 实例属性

- [`props`](https://zh-hans.reactjs.org/docs/react-component.html#props)
- [`state`](https://zh-hans.reactjs.org/docs/react-component.html#state)

<iframe src="https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/" width="665px" height="600px"></iframe>

## ReactDOM

- render 渲染元素
- hydrate 与render相同
- unmountComponentAtNode 从DOM中卸载组件，会一并清除state
- findDOMNode 如果组件已经被渲染在DOM上，返回响应的原生DOM元素
- findDOMNode 创建portal Portal提供了一种将子节点渲染到父节点以外的DOM节点的方案

[ReactDOM](https://zh-hans.reactjs.org/docs/react-dom.html)

## ReactDOMServer

ReactDOMServer 对象允许你将组件渲染成静态标记。通常，它被使用在 Node 服务端上

## DOM

**dangerouslySetInnerHTML**

> dangerouslySetInnerHTML 是 React 为浏览器 DOM 提供 innerHTML 的替换方案。通常来讲，使用代码直接设置 HTML 存在风险，因为很容易无意中使用户暴露于跨站脚本（XSS）的攻击。因此，你可以直接在 React 中设置 HTML，但当你想设置 dangerouslySetInnerHTML 时，需要向其传递包含 key 为 __html 的对象，以此来警示你。例如：

```ts
function createMarkup() {
  return {__html: 'First &middot; Second'};
}

function MyComponent() {
  return <div dangerouslySetInnerHTML={createMarkup()} />;
}
```

**htmlFor** 由于 for 在 JavaScript 中是保留字，所以 React 元素中使用了 htmlFor 来代替。

**suppressContentEditableWarning**

> 通常，当拥有子节点的元素被标记为 contentEditable 时，React 会发出一个警告，因为这不会生效。该属性将禁止此警告。尽量不要使用该属性，除非你要构建一个类似 Draft.js 的手动管理 contentEditable 属性的库。

**suppressHydrationWarning**

>如果你使用 React 服务端渲染，通常会在当服务端与客户端渲染不同的内容时发出警告。但是，在一些极少数的情况下，很难甚至于不可能保证内容的一致性。例如，在服务端和客户端上，时间戳通常是不同的。
如果设置 suppressHydrationWarning 为 true，React 将不会警告你属性与元素内容不一致。它只会对元素一级深度有效，并且打算作为应急方案。因此不要过度使用它。你可以在 ReactDOM.hydrate() 文档 中了解更多关于 hydration 的信息

**React采用小驼峰式命名**，多DOM的支持有

```
accept acceptCharset accessKey action allowFullScreen alt async autoComplete
autoFocus autoPlay capture cellPadding cellSpacing challenge charSet checked
cite classID className colSpan cols content contentEditable contextMenu controls
controlsList coords crossOrigin data dateTime default defer dir disabled
download draggable encType form formAction formEncType formMethod formNoValidate
formTarget frameBorder headers height hidden high href hrefLang htmlFor
httpEquiv icon id inputMode integrity is keyParams keyType kind label lang list
loop low manifest marginHeight marginWidth max maxLength media mediaGroup method
min minLength multiple muted name noValidate nonce open optimum pattern
placeholder poster preload profile radioGroup readOnly rel required reversed
role rowSpan rows sandbox scope scoped scrolling seamless selected shape size
sizes span spellCheck src srcDoc srcLang srcSet start step style summary
tabIndex target title type useMap value width wmode wrap
```

## 合成事件

SyntheticEvent 实例将被传递给你的事件处理函数，它是浏览器的原生事件的跨浏览器包装器。除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括 stopPropagation() 和 preventDefault()。

[合成事件](https://zh-hans.reactjs.org/docs/events.html)

## Hook 简介

在Function中使用一些Class中拥有的属性

每个组件间的 state 是完全独立的。Hook 是一种复用状态逻辑的方式，它不复用 state 本身。事实上 Hook 的每次调用都有一个完全独立的 state —— 因此你可以在单个组件中多次调用同一个自定义 Hook。

自定义 Hook 更像是一种约定而不是功能。如果函数的名字以 “use” 开头并调用其他 Hook，我们就说这是一个自定义 Hook。

[Hook 简介](https://zh-hans.reactjs.org/docs/hooks-intro.html)

[Hook Api索引](https://zh-hans.reactjs.org/docs/hooks-reference.html)

## Hook 概览

### useState

[State Hook](https://zh-hans.reactjs.org/docs/hooks-overview.html#state-hook)

[useState](https://zh-hans.reactjs.org/docs/hooks-state.html)

```ts
import React, { useState } from 'react';

function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**惰性初始state**

`initialState` 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用

```ts
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});

```

### useEffect

useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 **componentDidMount、componentDidUpdate** 和 **componentWillUnmount** 具有相同的用途，只不过被合并成了一个 API。（我们会在使用 Effect Hook 里展示对比 useEffect 和这些方法的例子。）

[Effect Hook](https://zh-hans.reactjs.org/docs/hooks-overview.html#effect-hook)

[useEffect](https://zh-hans.reactjs.org/docs/hooks-effect.html)

```ts
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

**第二个参数** effect所依赖的数值，只有当这个值变化时才会更新

```ts
useEffect(
  () => {
    const subscription = props.source.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  },
  [props.source],
);

useEffect(..., []) // 这将只在组件挂载和卸载时执行
```

### useContext

useContext 让你不使用组件嵌套就可以订阅 React 的 Context。

接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值。当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定

[useContext](https://zh-hans.reactjs.org/docs/hooks-reference.html#usecontext)

```ts
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

### useReducer

useReducer 可以让你通过 reducer 来管理组件本地的复杂 state

useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。

[useReducer](https://zh-hans.reactjs.org/docs/hooks-reference.html#usereducer)

### useCallback

[useCallback](https://zh-hans.reactjs.org/docs/hooks-reference.html#usecallback)

### useMemo

[useMemo](https://zh-hans.reactjs.org/docs/hooks-reference.html#usememo)

### useRef

[useRef](https://zh-hans.reactjs.org/docs/hooks-reference.html#useref)

### useImperativeHandle

[useImperativeHandle](https://zh-hans.reactjs.org/docs/hooks-reference.html#useimperativehandle)

### useLayoutEffect

[useLayoutEffect](https://zh-hans.reactjs.org/docs/hooks-reference.html#uselayouteffect)

### useDebugValue

[useDebugValue](https://zh-hans.reactjs.org/docs/hooks-reference.html#usedebugvalue)

### Hook使用规则

1. 只能在**函数最外层**调用Hook，不要在循环、条件判断或者子函数中调用
2. 只能在**React的函数组件**中调用Hook。不要在其他JavaScript函数中调用。

[Hook 使用规则](https://zh-hans.reactjs.org/docs/hooks-overview.html#rules-of-hooks)

[Hook 规则](https://zh-hans.reactjs.org/docs/hooks-rules.html)
