import DashboardPage from '@src/components/dashboard';
import { fetchData } from '@src/components/dashboard/fetch';
import { randomString } from '@src/utils/util';
import { Button, Icon, Layout, message } from '@tencent/tea-component';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useApi } from '@src/services/api/useApi';
import EditCard from './edit';
import './index.less';
import PartitionManagerCard from './partition';
import { useHistory } from '@tea/app';
const { Body, Content } = Layout;

const EditPage: React.FC = () => {
  const [, forceUpdate] = useState<any>({});
  const [dataSource, setDataSource] = useState<Array<{}>>([]);
  const [groupSource, setGroupSource] = useState<Array<{}>>([]);
  const [select, setSelect] = useState<number>(-1);
  const [selectData, setSelectData] = useState<any>({});
  const [group, setGroup] = useState<boolean>(false);
  const dashboardDB = useApi('dashboard');
  const getAreaIndex = useApi('area').getByIndex;
  const getProperty = useApi('property').getAll;
  const groupDB = useApi('group');
  const history = useHistory();

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchData()
      .then(([data, group]) => {
        setDataSource(data);
        setGroupSource(group);
      })
      .catch(() => {});
  }, []);

  // 保存数据
  const onSave = async () => {
    const promiseList = [];
    await groupDB.clear();
    await dashboardDB.clear();
    promiseList.push(groupDB.addAll(groupSource));
    let arr = [];
    for (let index = 0; index < dataSource.length; index++) {
      const rowData = cloneDeep(dataSource[index]);
      rowData['content'] = JSON.stringify(dataSource[index]['content']);
      arr.push(rowData);
    }
    promiseList.push(dashboardDB.addAll([...arr]));
    Promise.all(promiseList)
      .then(() => {
        message.success({ content: '保存成功' });
        history.push('/framework');
      })
      .catch(err => {
        message.error({ content: `保存失败${err}` });
      });
  };

  // 卡片编辑
  const onEditChange = (index, value) => {
    if (index < 0) {
      // group
      groupSource[select]['title'] = value;
      setGroupSource(cloneDeep(groupSource));
    } else {
      // part
      dataSource[select]['content']['data'][index]['select'] = value;
      setDataSource(cloneDeep(dataSource));
    }
  };

  // 对数据进行处理
  const dataProcessing = (key, value, data) => {
    if (key == 'add') {
      data.push(value);
    } else if (key == 'delete') {
      data.splice(value, 1);
    } else if (key == 'layout') {
      data = value;
    }
    return data;
  };

  // 分区编辑
  const partitionEdit = index => {
    const content = dataSource[index]['content'];
    Promise.all([getAreaIndex(content['id']), getProperty()])
      .then(([part, propertyData]) => {
        const systems = part['belongSystem'].map(sys => {
          return { text: sys, type: 'system' };
        });
        const properties = part['belongProperty'].map(pro => {
          return { text: pro, type: 'property' };
        });
        const subData = systems.concat(properties);
        const texts = content['data'].map(item => item['text']);
        const newData = [];

        for (let i = 0; i < subData.length; i++) {
          const curData = subData[i];
          const index = texts.indexOf(curData.text);
          if (index > -1) {
            curData['select'] = content['data'][index]['select'];
            curData['key'] = content['data'][index]['key'];
          } else {
            curData['select'] = false;
            curData['key'] = randomString(6);
          }
          if (curData['type'] == 'system') {
            curData['class'] = '系统';
          } else {
            const property = propertyData.filter(item => item['propertyName'] == curData['text']);
            curData['class'] = property && property.length ? property[0]['propertyKind'].split('/')[1] : '';
          }
          newData.push(curData);
        }
        content['data'] = newData;
        dataSource[index]['content'] = content;
        setSelect(index);
        setSelectData(content);
        forceUpdate({});
      })
      .catch(() => {});
  };

  const onComponentChange = (type, key, value) => {
    // 编辑单独处理
    if (key == 'edit') {
      if (type == 'group') {
        setSelect(value);
        setSelectData(value);
      } else {
        partitionEdit(value);
      }
    }
    // 根据类型修改数据渲染
    else {
      if (type == 'group') {
        const groups = dataProcessing(key, value, groupSource);
        setGroupSource(cloneDeep(groups));
      } else {
        const datas = dataProcessing(key, value, dataSource);
        setDataSource(cloneDeep(datas));
      }
    }
  };

  const groupChange = () => {
    setGroup(!group);
    setSelect(-1);
  };

  return (
    <Body>
      <Content>
        <div className="edit-btn">
          <Button type="primary" className="save-btn" onClick={onSave}>
            保存
          </Button>
        </div>
        <Content.Header className="edit-header">
          <Icon
            type="btnback"
            className="back-btn"
            onClick={() => {
              window.location.href = '/framework';
            }}
          />
          <h2 className="tea-h2 edit-h2">系统框架 / 编辑系统框架</h2>
        </Content.Header>
        <div className="edit-content">
          <PartitionManagerCard onGroup={groupChange} />
          <div className="edit-content-right">
            {select > -1 ? (
              <EditCard
                group={group}
                data={group ? groupSource[select] : dataSource[select]['content']}
                onChange={onEditChange}
              />
            ) : null}
            <DashboardPage
              edit={true}
              group={group}
              dataSource={dataSource}
              groupSource={groupSource}
              onChange={onComponentChange}
              linkSource={[]}
              markers={[]}
            />
          </div>
        </div>
      </Content>
    </Body>
  );
};

export default EditPage;
