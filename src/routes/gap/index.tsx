import { useHistory } from '@tea/app';
import { Layout } from '@tencent/tea-component';
import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import GapList from './gapList';
import RecommendEdit from './recommendEdit';
const { Body } = Layout;

// 攻击手法与漏洞的列表
function ListPage() {
  return <GapList></GapList>;
}

// 文本编辑器
function Editview() {
  return <RecommendEdit></RecommendEdit>;
}

const GapPage: React.FC = () => {
  const history = useHistory();
  return (
    <Body>
      <Router history={history}>
        <Switch>
          <Route exact path="/gap" component={ListPage} />
          <Route path="/gap/:gapId" component={Editview} />
        </Switch>
      </Router>
    </Body>
  );
};

export default GapPage;
