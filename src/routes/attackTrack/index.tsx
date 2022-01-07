import DashboardPage from '@src/components/dashboard';
import { fetchData } from '@src/components/dashboard/fetch';
import { useApi } from '@src/services/api/useApi';
import {
  calcElemPos,
  getElemBorderCenters,
  getQueryStringParams,
  oppositePos,
  randomString,
  setupLink,
  unique,
} from '@src/utils/util';
import { Layout } from '@tencent/tea-component';
import React, { useEffect, useMemo, useState } from 'react';
import cookie from 'react-cookies';
import { useLocation } from 'react-router-dom';
import CollapsePanel from './edit';
import './index.less';

const { Body, Content } = Layout;

// Track DB中存放格式
type TrackType = {
  scenesId?: string;
  name?: string;
  tracks?: string;
  id?: string;
};

// 路径中点坐标的定义
type Point = {
  x: number;
  y: number;
  id: string; // 相关节点 ID，方便查询
};

// 节点
type Node = {
  id: string; // 相关节点 ID
  content: string; // 节点名称
  gridContent: string; // 节点所在分区名称
  active: boolean; // 是否是高亮or编辑态
};

// 路径中全部节点（包括起止点）
export type NodeList = {
  content: string; // 路径名
  id: string; // 唯一ID
  initial: Node[];
};

// 路径中边的定义
type Edge = {
  from: Point; // 起点
  to: Point; // 终点
  active: boolean; // 是否是高亮or编辑态
  dir: number; // 即Line中提及的扫过方向，0：顺时针:1：逆时针
  type: string; // 路线类型，z字形，L字形，直线
};

type Path = {
  name: string;  // 路径名
  id: string; // 唯一ID
  edges: Edge[];
};

// 通过Dom ID查询节点的名称和所在分区名称
const getElemName = id => {
  let itemLabel, gridLabel;
  const dom: HTMLElement = document.getElementById('part_' + id);

  if (dom) {
    let grid = dom.offsetParent as HTMLElement;
    grid = grid?.children[0] as HTMLElement;
    grid = grid?.children[0] as HTMLElement;
    gridLabel = grid?.innerText;
    itemLabel = dom.children[1]?.innerHTML;

    return { itemLabel, gridLabel };
  }
  return { itemLabel, gridLabel };
};

const AttackPathPage: React.FC = () => {
  const location = useLocation() as any;
  const [sceneID, setSceneID] = useState(''); // 场景ID，过滤数据用
  const [tracks, setTracks] = useState<TrackType[]>([]); // 路径缓存，用于更新后台数据
  const [tempLinks, setTempLinks] = useState<Path[]>([]); // 路径缓存，用户绘制具体路径
  const [tempNodes, setTempNodes] = useState<NodeList[]>([]); // 节点缓存，用于列表区域绘制
  const [activeLink, setActiveLink] = useState(''); // 当前选中路径名
  const [curPath, setCurPath] = useState(''); // 正在编辑路径
  const [dataSource, setDataSource] = useState<Array<{}>>([]); // 系统架构数据节点数据缓存
  const [groupSource, setgroupSource] = useState<Array<{}>>([]); // 系统架构数据分区数据缓存
  const { getAll: getTracksSource, add, update, deleteRecord: removeTrackDBRecord } = useApi('track');
  const business = cookie.load('safetyTrade'); // cookie读取当前行业，更新数据时需要
  const maxGap = 4; // 节点关系判断时临界值

  useEffect(() => {
    const { scene } = getQueryStringParams(location.search);// 获取当前场景ID
    setSceneID(scene);
    // 请求系统架构数据
    fetchData()
      .then(([data, group]) => {
        addGapData(data);
        setgroupSource(group);
      })
      .then(() => console.log('Init Success'))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    // 获取系统架构后再进行路径绘制
    if (groupSource.length > 0 && dataSource.length > 0) {
      getTracksSource().then(resp => {
        // 过滤数据
        let recs: TrackType[] = resp.filter(elem => elem.sceneID === sceneID);
        recs.forEach((elem, index) => {
          console.log('Track ' + index + ':' + JSON.stringify(elem));
        });
        setTracks([...recs]);
      });
    }
  }, [groupSource, dataSource]);

  const onUpdate = (type, key, value) => {
    if (key == 'select' && type == 'data') {
      if (curPath !== '') {
        updateTracks(curPath, 'addNode', [value]);
      }
    }
  };

  // 添加 gap 信息
  const addGapData = (data: any) => {
    const { getAll } = useApi('gap');
    if (!data.length) {
      return;
    }
    getAll().then(res => {
      data.map(item => {
        item.content.data.map(dItem => {
          res.map(gItem => {
            if (dItem.text === gItem.propertyOrSystem) {
              dItem.gapData = { ...gItem };
            }
          });
        });
      });
      console.log(data, 123);
      setDataSource([...data]);
    });
  };

  // 计算当前（高亮或者编辑态）路径的起止点，用于图标显示定位
  const points = useMemo(() => {
    let target = curPath !== '' ? curPath : activeLink;
    const path = tempLinks.find(elem => elem.id === target);
    if (path && path.edges?.length > 0) {
      const lastSeg = path.edges[path.edges.length - 1];
      const firstSeq = path.edges[0];
      const startDom = document.getElementById('part_' + firstSeq.from.id);
      const endDom = document.getElementById('part_' + lastSeg.to.id);
      const start = getElemBorderCenters(calcElemPos(startDom));
      const end = getElemBorderCenters(calcElemPos(endDom));
      const dirIn = oppositePos({
        box: start,
        point: { x: firstSeq.from.x, y: firstSeq.from.y },
      });
      const dirOut = oppositePos({
        box: end,
        point: { x: lastSeg.to.x, y: lastSeg.to.y },
      });

      const startIcon = { left: start[dirIn].x, top: start[dirIn].y };
      const endIcon = { left: end[dirOut].x, top: end[dirOut].y };
      return [startIcon, endIcon];
    }
    return [];
  }, [activeLink, curPath, tempLinks]);

  // 切换高亮路径
  const updateActiveLinks = (paths, target) => {
    let links = [...paths];
    links.forEach(elem => {
      elem.edges.forEach((item: Edge) => (item.active = false));
    });
    const item = links.find(elem => elem.id === target);
    if (item) {
      item.edges.forEach(item => (item.active = true));
    }
    return links;
  };

  // 当track数据更新时，重新计算Tracks和Nodes，用于刷新显示
  useEffect(() => {
    const nodeLists: NodeList[] = [];
    let paths: Path[] = [];

    tracks.forEach(elem => {
      let { tracks, name, id } = elem;
      if (tracks === '') {
        paths.push({ edges: [], name, id });
        nodeLists.push({ content: name, initial: [], id });
      } else {
        const doms = elem.tracks.split(',');
        if (doms?.length > 1) {
          const edges: Array<Edge> = [];
          for (let i = 0; i < doms.length - 1; i++) {
            let domStart = document.getElementById('part_' + doms[i]);
            let domEnd = document.getElementById('part_' + doms[i + 1]);
            const valueStart = calcElemPos(domStart);
            const valueEnd = calcElemPos(domEnd);
            const {
              vertex: [from, to],
              dir,
              type,
            } = setupLink(valueStart, valueEnd, maxGap);
            edges.push({
              from: { x: from.x, y: from.y, id: doms[i] },
              to: { x: to.x, y: to.y, id: doms[i + 1] },
              active: false,
              dir,
              type,
            });
          }
          paths.push({ edges: edges, name, id });
        } else {
          paths.push({ edges: [], name, id });
        }
        let initial = doms.map(item => {
          const names = getElemName(item);
          return {
            id: item,
            content: names.itemLabel,
            gridContent: names.gridLabel,
            active: false,
          };
        });
        nodeLists.push({ content: name, initial, id });
      }
    });
    setTempNodes([...nodeLists]);
    paths = updateActiveLinks(paths, activeLink);
    setTempLinks([...paths]);
  }, [tracks]);

  // 高亮/编辑态路径上节点统计，用于边框CSS风格指定
  const uids = useMemo(() => {
    let uids = [];
    let highlightPath = curPath !== '' ? curPath : activeLink;
    if (highlightPath !== '') {
      const path = tempLinks.find(elem => elem.id === highlightPath);
      if (path) {
        path.edges.forEach(elem => {
          uids.push(elem.from.id);
          uids.push(elem.to.id);
        });
      }
    } else {
      tempNodes.forEach(elem => {
        return elem.initial.forEach(item => {
          uids.push(item.id);
        });
      });
    }

    return unique(uids);
  }, [activeLink, curPath, tempLinks]);

  // 节点集合转换成对应路径集合
  const nodes2Path = (nodeColls: NodeList[], active) => {
    let paths = nodeColls.map(elem => {
      const doms = elem.initial.map(elem => elem.id);
      if (doms?.length > 1) {
        const edges: Array<Edge> = [];
        for (let i = 0; i < doms.length - 1; i++) {
          let domStart = document.getElementById('part_' + doms[i]);
          let domEnd = document.getElementById('part_' + doms[i + 1]);
          const valueStart = calcElemPos(domStart);
          const valueEnd = calcElemPos(domEnd);
          const {
            vertex: [from, to],
            dir,
            type,
          } = setupLink(valueStart, valueEnd, maxGap);
          edges.push({
            from: { x: from.x, y: from.y, id: doms[i] },
            to: { x: to.x, y: to.y, id: doms[i + 1] },
            active,
            dir,
            type,
          });
        }
        return { edges: edges, name: elem.content, id: elem.id } as Path;
      }
      return undefined;
    });
    paths = paths.filter(elem => elem !== undefined);
    return paths;
  };

  // 对应路径列表增删改查操作
  const updateTracks = (id: string, event: string, extraUid: string[]) => {
    console.log('================>', id, event, extraUid);
    if (!id) {
      console.log('Bad param, id is empty!');
      return;
    }
    switch (event) {
      case 'save':
        {
          // 区分新增路径和既有路径两种情况，刷新tracks缓存用于显示更新，调用后台接口用于更新，并且移除当前编辑态路径标识
          // 并不刷新节点缓存，因为它已经在新增节点过程中刷新
          const trackIndex = tracks.findIndex(elem => id === elem.id);
          const nodelist = tempNodes.find(elem => elem.id === id);
          const uids = nodelist.initial.map(elem => elem.id);
          const modifiedTrack = { sceneID, name: nodelist.content, tracks: uids.join(','), id: nodelist.id  };
          let origTracksDup = [...tracks];

          if (trackIndex !== -1) {
            origTracksDup.splice(trackIndex, 1, modifiedTrack);
          } else {
            origTracksDup.push(modifiedTrack);
          }
          setTracks([...origTracksDup]);
          if (trackIndex === -1) {
            add(modifiedTrack);
          } else {
            update({ ...modifiedTrack, safetyTrade: business });
          }
          setCurPath('');
        }
        break;
      case 'undo':
        {
          // 回滚当前操作
          let index = tracks.findIndex(elem => elem.id === id);
          let backupNodeLists, backupPaths;
          if (index === -1) {
            // 未保存的数据（新增路径后），移除新增数据
            backupNodeLists = [...tempNodes];
            const posN = backupNodeLists.findIndex(elem => elem.id === id);
            posN !== -1 && backupNodeLists.splice(posN, 1);

            backupPaths = [...tempLinks];
            const posT = backupPaths.findIndex(elem => elem.id === id);
            posT !== -1 && backupPaths.splice(posT, 1);
          } else {
            // 已保存的数据，利用tracks覆盖修改后数据
            backupNodeLists = tracks.map(elem => {
              const doms = elem.tracks === '' ? [] : elem.tracks.split(',');
              let initial = doms.map(item => {
                const names = getElemName(item);
                return {
                  id: item,
                  content: names.itemLabel,
                  gridContent: names.gridLabel,
                  active: false,
                };
              });
              return { content: elem.name, initial, id: elem.id } as NodeList;
            });
            backupPaths = nodes2Path(backupNodeLists, false);
            backupPaths = updateActiveLinks(backupPaths, '');
          }
          setTempLinks([...backupPaths]);
          setTempNodes([...backupNodeLists]);
          setCurPath('');
        }
        break;
      case 'edit':
        // 更新编辑态标识，同时刷新该路径节点的编辑态标识（用户UI风格指定）
        setCurPath(id);
        const paths = updateActiveLinks(tempLinks, id);
        setTempLinks(paths);
        break;
      case 'delete':
        {
          // 删除改条数据对应track，利用UseEffect更新tracks和nodelists缓存
          let residual = tracks.filter(elem => id !== elem.id);
          setTracks([...residual]);
          removeTrackDBRecord([id]);
        }
        break;
      case 'new':
        // 新增时仅增加nodelists缓存记录，此时无法绘制路径（所以不更新），没有 确定保存，所以也不增加tracks记录
        const _id = id + randomString();
        setTempNodes([...tempNodes, { content: id, initial: [], id: _id }]);
        setCurPath(_id);
        break;
      case 'highlight':
        if (id !== activeLink) {
          setActiveLink(id);
          const paths = updateActiveLinks(tempLinks, id);
          setTempLinks(paths);
        } else {
          setActiveLink('');
          const paths = updateActiveLinks(tempLinks, '');
          setTempLinks(paths);
        }
        break;
      default:
        // 这里区分出3种情况，新增节点，删除节点，拖动节点
        if (extraUid && extraUid.length > 0) {
          const nodelist = tempNodes.find(elem => elem.id === id);
          const nodes = [...nodelist.initial];
          if (event === 'addNode') {
            const newNode = extraUid[0];
            const name = getElemName(newNode);
            const len = nodes.length;
            // to是否与from重叠
            if ((len > 0 && nodes[len - 1].id !== newNode) || len === 0)
              nodes.push({
                id: newNode,
                content: name.itemLabel,
                gridContent: name.gridLabel,
                active: false,
              });
          } else if (event === 'dragNode') {
            const srcIndex = parseInt(extraUid[0]);
            const dstIndex = parseInt(extraUid[1]);
            nodes.splice(dstIndex, 1, ...nodes.splice(srcIndex, 1, nodes[dstIndex]));
          } else {
            const deletedIndex = nodes.findIndex(elem => elem.id === extraUid[0]);
            deletedIndex !== -1 && nodes.splice(deletedIndex, 1);
          }
          nodelist.initial = nodes;
          setTempNodes([...tempNodes]);

          // 更新tracks缓存
          const index = tempLinks.findIndex(elem => elem.id === id);
          if (index !== -1) {
            const alteredPath = nodes2Path([nodelist], true);
            const tempLinksDup = [...tempLinks];
            if (alteredPath && alteredPath.length > 0) {
              tempLinksDup.splice(index, 1, alteredPath[0]);
            } else {
              tempLinksDup.splice(index, 1);
            }
            setTempLinks([...tempLinksDup]);
          } else {
            // 没找到，要么是新增路线，要么是删除节点（仅剩0/1个）导致
            if (nodelist.initial.length > 1) {
              const alteredPath = nodes2Path([nodelist], true);
              setTempLinks([...tempLinks, { name: nodelist.content, edges: [...alteredPath[0].edges], id }]);
            } else {
              setTempLinks([...tempLinks, { name: nodelist.content, edges: [], id}]);
            }
          }
        }
        break;
    }
  };

  // 过滤高亮/编辑态/初始路径，若存在编辑态路径，返回该路径，否则机型查找高亮态路径，如果不存在上述情况，返回全部路径
  const pathsFilter = () => {
    if (!!curPath) {
      const editingOne = tempLinks.find(elem => elem.id === curPath);
      return [editingOne];
    } else if (!!activeLink) {
      const highlightOne = tempLinks.find(elem => elem.id === activeLink);
      return [highlightOne];
    } else {
      return tempLinks;
    }
  };

  return (
    <Body>
      <Content>
        <Content.Header title="攻击场景展示"></Content.Header>
        <div className="track-content">
          <DashboardPage
            edit={false}
            group={false}
            gapBubble={curPath === ''}
            groupSource={groupSource}
            dataSource={dataSource}
            onChange={onUpdate}
            scene={[curPath !== '', activeLink === '', uids]}
            linkSource={pathsFilter()}
            markers={points}
          />
          <div className="path-panel">
            <CollapsePanel
              name="攻击路径"
              data={tempNodes}
              highlight={activeLink}
              currentPath={curPath}
              onListChange={updateTracks}
            />
          </div>
        </div>
      </Content>
    </Body>
  );
};

export default AttackPathPage;
