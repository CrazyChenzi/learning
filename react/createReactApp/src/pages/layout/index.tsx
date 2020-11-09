import React from 'react'
import { Layout, Menu } from 'antd'
import RouterApplication from '../../router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import './index.less'
// import { MenuInfo } from 'antd/node_modules/rc-menu'

const { Header, Sider, Content } = Layout

const MenuItems = () => {
  return (
    <Menu theme="light" mode="inline" defaultSelectedKeys={['1']} onClick={(item) => {
      console.log(item)
    }}>
      <Menu.Item key="1" icon={<UserOutlined />}>
        page1
      </Menu.Item>
      <Menu.Item key="2" icon={<VideoCameraOutlined />}>
        page2
      </Menu.Item>
      <Menu.Item key="3" icon={<UploadOutlined />}>
        page3
      </Menu.Item>
    </Menu>
  )
}

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  render() {
    return (
      <Layout className="layout" id="components-layout-demo-custom-trigger">
        <Sider trigger={null} collapsible collapsed={this.state.collapsed} theme={'light'}>
          <div className="logo">{'This is Demo'}</div>
          <MenuItems></MenuItems>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: this.toggle,
            })}
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
            }}
          >
            <RouterApplication></RouterApplication>
          </Content>
        </Layout>

      </Layout>
    );
  }
}

export default SiderDemo
