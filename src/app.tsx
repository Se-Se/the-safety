import '@src/configs/css/index.css';
// 导入依赖
import { app } from '@tea/app';
// 导入样式
import '@tencent/tea-component/lib/tea.css';
import 'core-js/stable';
import React from 'react';
import { Redirect } from 'react-router';
import 'regenerator-runtime/runtime';
import './app.less';
// 导入导航配置
import { menu } from './configs/menu';
// 导入组件
import AppPage from './routes/app';
import AreaPage from './routes/area';
import AttackPathPage from './routes/attackTrack';
import BusinessPage from './routes/business';
import BusinessTrackPage from './routes/businessTrack';
import DataPage from './routes/data';
import EditPage from './routes/edit';
import FrameworkPage from './routes/framework';
import GapPage from './routes/gap';
import MainPage from './routes/main';
import PropertyPage from './routes/property';
import RecommendPage from './routes/recommend';
import ScenesPage from './routes/scenes';
import { initAppDefaultDisplay, initDatabase } from './services/db';

// 初始化本地数据库结构
initDatabase();
// 按需初始化数据
setTimeout(() => {
  initAppDefaultDisplay(true);
}, 100);

// 路由表，一个路由对应一个组件
const routes = {
  '/': () => <Redirect to="/main" />,
  '/business': BusinessPage,
  '/app': AppPage,
  '/data': DataPage,
  '/framework': FrameworkPage,
  '/scenes': ScenesPage,
  '/gap': GapPage,
  '/recommend': RecommendPage,
  '/main': MainPage,
  '/property': PropertyPage,
  '/area': AreaPage,
  '/edit': EditPage,
  '/tracks': AttackPathPage,
  '/topology': BusinessTrackPage,
};

// 注册路由表/左侧菜单
app.routes(routes, menu);
