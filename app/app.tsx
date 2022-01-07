import { ConfigProvider } from '@tencent/tea-component';
import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import { HistoryContext } from './history-context';
import { AppMenu, AppRouteMap } from './types';

const history = createBrowserHistory();

interface AppProps {
  routes: AppRouteMap;
  menu: AppMenu;
}

function App({ routes, menu }: AppProps) {
  if (Object.entries(routes).find(([path]) => path.split('/').filter(Boolean).length > 1)) {
    throw new Error(
      '`app.routes()` 只允许注册一级路由\n\n更多级路由请使用模块内路由方式配置：http://tapd.oa.com/tcp_access/markdown_wikis/show/#1220399462000785707',
    );
  }
  return (
    <Router history={history}>
      <HistoryContext.Provider value={{ history }}>
        <ConfigProvider>
          <Layout menu={menu}>
            <Switch>
              {Object.entries(routes).map(([path, route]) => {
                const routeProps = { path, key: path, exact: path === '/' };
                if (typeof route === 'object') {
                  if ('render' in route) {
                    return <Route {...routeProps} render={route.render} />;
                  }
                  if ('component' in route) {
                    return <Route {...routeProps} component={route.component} />;
                  }
                }
                return <Route {...routeProps} component={route as React.ComponentType<any>} />;
              })}
              <Route path="*">
                <Redirect to="/" />
              </Route>
            </Switch>
          </Layout>
        </ConfigProvider>
      </HistoryContext.Provider>
    </Router>
  );
}

export async function routes(appRoutes: AppRouteMap, appMenu: AppMenu) {
  ReactDOM.render(<App routes={appRoutes} menu={appMenu} />, document.querySelector('#root'));
}
