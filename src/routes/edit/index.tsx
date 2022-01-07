import DashboardPage from '@src/components/dashboard';
import { fetchData } from '@src/components/dashboard/fetch';
import { useApi } from '@src/services/api/useApi';
import { randomString } from '@src/utils/util';
import { useHistory } from '@tea/app';
import { Alert, Button, Icon, Layout, List, message } from '@tencent/tea-component';
import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import EditCard from './edit';
import './index.less';
import PartitionManagerCard from './partition';
const { Body, Content } = Layout;

const EditPage: React.FC = () => {
  const [, forceUpdate] = useState<any>({});
  const [dataSource, setDataSource] = useState<Array<{}>>([]);
  const [groupSource, setGroupSource] = useState<Array<{}>>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [topologies, setTopologies] = useState<any[]>([]);
  const [select, setSelect] = useState<number>(-1);
  const [, setSelectData] = useState<any>({});
  const [group, setGroup] = useState<boolean>(false);
  const [dependentTrackNames, setDependentTrackNames] = useState([]); // 依赖当前节点的路径名集合
  const [dependentTopologyNames, setDependentTopologyNames] = useState([]); // 依赖当前节点的拓扑链接名集合
  const [groupOnClicked, setGroupOnClicked] = useState(false); // 删除分区还是隐藏节点
  const [alertVisible, setAlertVisible] = useState(false); // 展示删除约束提示
  const dashboardDB = useApi('dashboard');
  const getAreaIndex = useApi('area').getByIndex;
  const getProperty = useApi('property').getAll;
  const groupDB = useApi('group');
  const history = useHistory();
  const getSceneIndices = useApi('scenes').getAll;
  const getTracks = useApi('track').getAll;
  const getTopologies = useApi('bTrack').getAll;

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchData()
      .then(([data, group]) => {
        setDataSource(data);
        setGroupSource(group);
      })
      .catch(() => {});
    Promise.all([getTracks(), getTopologies()])
      .then(([tracksData, topologiesData]) => {
        setTopologies([...topologiesData]);
        setTracks([...tracksData]);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  // 保存数据
  const onSave = async () => {
    const promiseList = [];
    await groupDB.clear();
    await dashboardDB.clear();
    promiseList.push(groupDB.addAll(groupSource));
    let arr = [];
    for (let index = 0; index < dataSource.length; index++) {
      const rowData: any = cloneDeep(dataSource[index]);
      rowData.content = JSON.stringify((dataSource[index] as any).content);
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

  // 返回错误提示内容，[0]: prefix, [1]: postfix, trackOnly: true：停用节点，false:删除分区
  const errTip = trackOnly => {
    return trackOnly
      ? [
          '节点停用失败，以下攻击路线依赖这个节点：',
          '如果确实需要停用，请在"攻击场景" -> "攻击路径" 编辑模式下，先移除依赖该节点的路径',
        ]
      : [
          '分区删除失败，以下拓扑路线/攻击路线依赖该分区：',
          '如果确实需要删除，请在"业务拓扑" -> "业务流程" 和 "攻击场景" -> "攻击路径" 的编辑模式下，先移除该依赖该分区的路径',
        ];
  };

  // 判断当前节点是否被任何攻击路径依赖
  const canNodeRemove = node => {
    const { key } = node;
    let dataInUse = false;
    let trackNames = [];
    const nodeLists = tracks.map(elem => {
      return { name: elem.name, tracks: elem.tracks.split(',') };
    });
    nodeLists.forEach(elem => {
      const { tracks, name } = elem;
      if (tracks.findIndex(item => item === key) !== -1) {
        trackNames.push(name);
      }
    });
    if (trackNames.length > 0) {
      dataInUse = true;
      setDependentTrackNames([...trackNames]);
    } else {
      setDependentTrackNames([]);
    }

    return dataInUse;
  };

  // 判断当前分区是否被任何拓扑路径/攻击路径依赖
  const canGroupRemove = node => {
    const {
      content: { key },
    } = node;
    let groupInUse = false;
    let topologyNames = [];
    let dataInUse = false;
    let trackNames = [];

    const nodeLists = tracks.map(elem => {
      return { name: elem.name, tracks: elem.tracks.split(',') };
    });

    const groupNodeLists = topologies.map(elem => {
      return { name: elem.name, tracks: elem.tracks.split(',') };
    });

    groupNodeLists.forEach(elem => {
      const { tracks, name } = elem;
      if (tracks.findIndex(item => item === key) !== -1) {
        topologyNames.push(name);
      }
    });

    const nodeInGroup = node.content ? node.content.data : [];
    const aList = nodeInGroup.map(elem => elem.key);
    nodeLists.forEach(elem => {
      const { tracks, name } = elem;
      const bSet = new Set(tracks);
      let intersection = Array.from(new Set(aList.filter(v => bSet.has(v))));
      if (intersection.length > 0) {
        trackNames.push(name);
      }
    });
    dataInUse = trackNames.length > 0;
    groupInUse = topologyNames.length > 0;

    if (dataInUse || groupInUse) {
      setDependentTrackNames([...trackNames]);
      setDependentTopologyNames([...topologyNames]);
    } else {
      setDependentTrackNames([]);
      setDependentTopologyNames([]);
    }

    return dataInUse || groupInUse;
  };

  // 卡片编辑
  const onEditChange = (index, value) => {
    if (index < 0) {
      // group
      (groupSource[select] as any).title = value;
      setGroupSource(cloneDeep(groupSource));
    } else {
      // part
      setGroupOnClicked(false);
      const data = (dataSource[select] as any).content.data[index];
      // 能否隐藏
      if (canNodeRemove(data)) {
        setAlertVisible(true);
      } else {
        setAlertVisible(false);
        data.select = value;
        setDataSource(cloneDeep(dataSource));
      }
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
    const content = (dataSource[index] as any).content;
    Promise.all([getAreaIndex(content.id), getProperty()])
      .then(([part, propertyData]) => {
        const systems = (part as any).belongSystem.map(sys => {
          return { text: sys, type: 'system' };
        });
        const properties = (part as any).belongProperty.map(pro => {
          return { text: pro, type: 'property' };
        });
        const subData = systems.concat(properties);
        const texts = content.data.map(item => item.text);
        const newData = [];

        for (let i = 0; i < subData.length; i++) {
          const curData = subData[i];
          const index = texts.indexOf(curData.text);
          if (index > -1) {
            curData.select = content.data[index].select;
            curData.key = content.data[index].key;
          } else {
            curData.select = false;
            curData.key = randomString(6);
          }
          if (curData.type == 'system') {
            curData.class = '系统';
          } else {
            const property = propertyData.filter(item => item.propertyName == curData.text);
            curData.class = property && property.length ? property[0].propertyKind.split('/')[1] : '';
          }
          newData.push(curData);
        }
        content.data = newData;
        (dataSource[index] as any).content = content;
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
    } else {
      // 根据类型修改数据渲染
      if (type == 'group') {
        const groups = dataProcessing(key, value, groupSource);
        setGroupSource(cloneDeep(groups));
      } else {
        // 查找是否被占用
        setGroupOnClicked(true);
        // 是否可以删除
        if (key == 'delete' && canGroupRemove(dataSource[value])) {
          setAlertVisible(true);
        } else {
          setAlertVisible(false);
          const datas = dataProcessing(key, value, dataSource);
          setDataSource(cloneDeep(datas));
        }
      }
    }
  };

  const groupChange = () => {
    setGroup(!group);
    setSelect(-1);
  };

  return (
    <Body>
      <Alert type="warning" className="deactive-alert" visible={alertVisible} onClose={() => setAlertVisible(false)}>
        <p>{errTip(!groupOnClicked)[0]}</p>
        <List type="bullet">
          {dependentTrackNames.map(elem => (
            <List.Item key={elem}>{elem}</List.Item>
          ))}
        </List>
        <List type="bullet">
          {dependentTopologyNames.map(elem => (
            <List.Item key={elem}>{elem}</List.Item>
          ))}
        </List>
        <br />
        <p>{errTip(!groupOnClicked)[1]}</p>
      </Alert>
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
            {select > -1 && (group ? select < groupSource.length : select < dataSource.length) ? (
              <EditCard
                group={group}
                data={group ? groupSource[select] : (dataSource[select] as any).content}
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
