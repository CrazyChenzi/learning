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
