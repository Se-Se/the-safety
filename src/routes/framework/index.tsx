import { Layout } from '@tencent/tea-component';
import React from 'react';
import { Route, Router, Switch, useHistory, useParams } from 'react-router';
import FrameworkContent from './framework';
const { Body } = Layout;

const EmptyComponent: React.FC = () => {
  return <FrameworkContent />;
};

const FrameworkComponent: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  return <FrameworkContent name={name} />;
};

const FrameworkPage: React.FC = () => {
  const history = useHistory();
  return (
    <Body>
      <Router history={history}>
        <Switch>
          <Route exact path="/framework" component={EmptyComponent} />
          <Route path="/framework/:name" component={FrameworkComponent} />
        </Switch>
      </Router>
    </Body>
  );
};

export default FrameworkPage;
