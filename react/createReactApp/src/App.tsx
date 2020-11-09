import React, { FC } from 'react'
import ReactDOM from 'react-dom'
import './App.less'
import Layout from './pages/layout'

const App: FC<{}> = () => {
  return <Layout></Layout>
}

ReactDOM.render(
  <App></App>,
  document.getElementById('root')
)
