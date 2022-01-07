import { toLogout } from '@src/utils/util';
import { Layout as TeaLayout, List, NavMenu } from '@tencent/tea-component';
import React from 'react';
import cookie from 'react-cookies';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { AppMenu } from '../types';
import Menu from './Menu';
import './menu.less';

const { Header, Body, Sider } = TeaLayout;

interface LayoutProps extends RouteComponentProps<any> {
  menu: AppMenu;
}

export default withRouter<LayoutProps, React.ComponentType<LayoutProps>>(function Layout({ history, menu, children }) {
  const { pathname } = history.location;
  const isMain = pathname === '/main' ? false : true;
  const isEdit = pathname === '/edit' ? false : true;
  const val = cookie.load('safetyTrade');
  const userName = cookie.load('u_name');

  if (pathname === '/403') {
    return <>{children}</>;
  }

  if (!val && '/main' !== pathname) {
    history.push('/main');
  }

  return (
    <TeaLayout>
      <Header>
        <NavMenu
          left={
            <div className="nav-menu" onClick={() => history.push('/')}>
              <img className="menu-logo" src={require('./logo.png')} alt="logo" />
              <span className="menu-title">{menu.title}</span>
            </div>
          }
          right={
            <NavMenu.Item
              type="dropdown"
              overlay={close => (
                <List type="option">
                  <List.Item
                    onClick={() => {
                      close();
                      toLogout();
                    }}
                  >
                    退出
                  </List.Item>
                </List>
              )}
            >
              {userName || ''}
            </NavMenu.Item>
          }
        />
      </Header>
      <Body>
        {menu && isMain && isEdit && (
          <Sider>
            <Menu menu={menu} />
          </Sider>
        )}
        {children}
      </Body>
    </TeaLayout>
  );
});
