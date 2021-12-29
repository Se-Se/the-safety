import { useHistory } from '@tea/app';
import { Layout } from '@tencent/tea-component';
import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import AddRecommendPage from './addRecommend';
import RecommendsPage from './recommend';
const { Body } = Layout;

function AddPage() {
  return <AddRecommendPage></AddRecommendPage>;
}

function Overview() {
  return <RecommendsPage></RecommendsPage>;
}

const RecommendPage: React.FC = () => {
  const history = useHistory();
  return (
    <Body>
      <Router history={history}>
        <Switch>
          <Route exact path="/recommend" component={Overview} />
          <Route path="/recommend/:name" component={AddPage} />
        </Switch>
      </Router>
    </Body>
  );
};

export default RecommendPage;
