import BreadcrumbPage from '@src/components/crumb';
import DashboardPage from '@src/components/dashboard';
import { fetchData } from '@src/components/dashboard/fetch';
import { useApi } from '@src/services/api/useApi';
import { Button, Layout } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import BusinessCard from './business';
import './framework.less';
const { Body, Content } = Layout;
const crumb = [
  { name: '银行', link: '/main' },
  { name: '行业资产', link: '/framework' },
  { name: '系统架构', link: '/framework' },
];
const FrameworkContent: React.FC<{
  name?: string;
}> = props => {
  const [dataSource, setDataSource] = useState<Array<{}>>([]);
  const [groupSource, setgroupSource] = useState<Array<{}>>([]);
  const [business, setBusiness] = useState<Array<string>>([]);
  const { getAll } = useApi('data');
  const getApp = useApi('app').getAll;
  const getProperty = useApi('property').getAll;

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    getAll()
      .then(outData => {
        fetchData(outData)
          .then(([data, group]) => {
            console.log(data, group);
            setDataSource(data);
            setgroupSource(group);
          })
          .catch(() => {});
      })
      .catch(() => {});
    if (props.name) {
      selectBusiness(props.name);
    }
  }, []);

  const selectBusiness = name => {
    Promise.all([getApp(), getProperty()]).then(values => {
      const systems = values[0].filter(item => item.business == name);
      const properties = values[1].filter(item => item.business == name);
      const result = systems.map(item => item.systemName).concat(properties.map(item => item.propertyName));
      setBusiness(result);
    });
  };

  return (
    <Body>
      <Content>
        <Button
          type="primary"
          className="edit-btn"
          onClick={() => {
            window.location.href = '/edit';
          }}
        >
          编辑
        </Button>
        <Content.Header
          subtitle={
            <>
              <BreadcrumbPage crumbs={crumb} />
            </>
          }
        ></Content.Header>
        <div className="framework-content">
          <BusinessCard name={props.name} onChange={name => selectBusiness(name)} />
          <DashboardPage
            edit={false}
            group={false}
            groupSource={groupSource}
            dataSource={dataSource}
            business={business}
            onChange={() => {}}
            linkSource={[]}
            markers={[]}
          />
        </div>
      </Content>
    </Body>
  );
};

export default FrameworkContent;
