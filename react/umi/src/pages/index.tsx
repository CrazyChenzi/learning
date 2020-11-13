import React, { Fragment, FC } from 'react';
import { history } from 'umi'
import { routerList } from '../router'
import { Button } from 'antd'
import './index.less'

/**
 * canvas/video/websocket
 */
const Layout: FC = (props) => {
  const jumpToRoute = (path: string) => {
    history.push(path)
  }
  return (
    <Fragment>
      <h1 className="tools-title">tools</h1>
      <div className="router-btn">
        {
          routerList.map((route) => {
            return <Button type="primary" key={ route.path } onClick={() => jumpToRoute(route.path)}>{ route.title }</Button>
          })
        }
      </div>
      <div>{ props.children }</div>
    </Fragment>
  )
}

export default Layout
