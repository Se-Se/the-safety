import { Layout as TeaLayout, NavMenu } from '@tencent/tea-component';
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
  const isMain = history.location.pathname === '/main' ? false : true;
  const isEdit = history.location.pathname === '/edit' ? false : true;
  const val = cookie.load('safetyTrade');
  if (history.location.pathname !== '/main' && !val) {
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
