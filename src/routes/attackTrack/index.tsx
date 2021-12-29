import DashboardPage from '@src/components/dashboard';
import { fetchData } from '@src/components/dashboard/fetch';
import { DBTableName } from '@src/services';
import {
  calcElemPos,
  getElemBorderCenters,
  getQueryStringParams,
  makeupVertex,
  oppositePos,
  unique,
} from '@src/utils/util';
import { Layout } from '@tencent/tea-component';
import React, { useEffect, useMemo, useState } from 'react';
import { useIndexedDB } from 'react-indexed-db';
import { useLocation } from 'react-router-dom';
import CollapsePanel from './edit';
import './index.less';

const { Body, Content } = Layout;

type TrackType = {
  scenesId?: string;
  name?: string;
  tracks?: string;
};

type Point = {
  x: number;
  y: number;
  id: string;
};

type Node = {
  id: string;
  content: string;
  gridContent: string;
  active: boolean;
};

export type NodeList = {
  content: string;
  initial: Node[];
};

type Edge = {
  from: Point;
  to: Point;
  active: boolean;
  dir: number;
};

type Path = {
  name: string;
  edges: Edge[];
};

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
  const [sceneID, setSceneID] = useState('');
  const [tracks, setTracks] = useState<TrackType[]>([]);
  const [tempLinks, setTempLinks] = useState<Path[]>([]);
  const [tempNodes, setTempNodes] = useState<NodeList[]>([]);
  const [activeLink, setActiveLink] = useState(''); // 当前选中路径名
  const [curPath, setCurPath] = useState(''); // 正在编辑路径
  const [dataSource, setDataSource] = useState<Array<{}>>([]);
  const [groupSource, setgroupSource] = useState<Array<{}>>([]);
  const { getAll: getTracksSource, add, update, deleteRecord: removeTrackDBRecord } = useIndexedDB(DBTableName.track);

  const maxGap = 50;

  useEffect(() => {
    const { scene } = getQueryStringParams(location.search);
    setSceneID(scene);
    fetchData()
      .then(([data, group]) => {
        addGapData(data);
        setgroupSource(group);
      })
      .then(() => console.log('Init Success'))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    if (groupSource.length > 0 && dataSource.length > 0) {
      getTracksSource().then(resp => {
        let recs: TrackType[] = resp.filter(elem => elem['sceneID'] === sceneID);
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
    const { getAll } = useIndexedDB(DBTableName.gap);
    if (!data.length) {
      return;
    }
    getAll().then(res => {
      data.map(item => {
        item.content.data.map(dItem => {
          res.map(gItem => {
            if (dItem.text === gItem.propertyOrSystem) {
              dItem['gapData'] = { ...gItem };
            }
          });
        });
      });
      console.log(data, 123);
      setDataSource([...data]);
    });
  };

  const points = useMemo(() => {
    let target = curPath !== '' ? curPath : activeLink;
    const path = tempLinks.find(elem => elem.name === target);
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

  const updateActiveLinks = (paths, target) => {
    let links = [...paths];
    links.forEach(elem => {
      elem.edges.forEach((item: Edge) => (item.active = false));
    });
    const item = links.find(elem => elem.name === target);
    if (item) {
      item.edges.forEach(item => (item.active = true));
    }
    return links;
  };

  useEffect(() => {
    const nodeLists: NodeList[] = [];
    let paths: Path[] = [];

    tracks.forEach(elem => {
      let { tracks, name } = elem;
      if (tracks === '') {
        paths.push({ edges: [], name });
        nodeLists.push({ content: name, initial: [] });
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
            } = makeupVertex(valueStart, valueEnd, maxGap);
            edges.push({
              from: { x: from.x, y: from.y, id: doms[i] },
              to: { x: to.x, y: to.y, id: doms[i + 1] },
              active: false,
              dir: dir,
            });
          }
          paths.push({ edges: edges, name });
        } else {
          paths.push({ edges: [], name });
        }
        let initial = doms.map(item => {
          const names = getElemName(item);
          return {
            id: item,
            content: names['itemLabel'],
            gridContent: names['gridLabel'],
            active: false,
          };
        });
        nodeLists.push({ content: name, initial });
      }
    });
    setTempNodes([...nodeLists]);
    paths = updateActiveLinks(paths, activeLink);
    setTempLinks([...paths]);
  }, [tracks]);

  const uids = useMemo(() => {
    let uids = [];
    let highlightPath = curPath !== '' ? curPath : activeLink;
    if (highlightPath !== '') {
      const path = tempLinks.find(elem => elem.name === highlightPath);
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
          } = makeupVertex(valueStart, valueEnd, maxGap);
          edges.push({
            from: { x: from.x, y: from.y, id: doms[i] },
            to: { x: to.x, y: to.y, id: doms[i + 1] },
            active,
            dir: dir,
          });
        }
        return { edges: edges, name: elem['content'] } as Path;
      }
      return undefined;
    });
    paths = paths.filter(elem => elem !== undefined);
    return paths;
  };

  const updateTracks = (id: string, event: string, extraUid: string[]) => {
    console.log('================>', id, event, extraUid);
    if (!id) {
      console.log('Bad param, id is empty!');
      return;
    }
    switch (event) {
      case 'save':
        {
          const trackIndex = tracks.findIndex(elem => id === elem.name);
          const nodelist = tempNodes.find(elem => elem.content === id);
          const uids = nodelist.initial.map(elem => elem.id);
          const modifiedTrack = { sceneID, name: nodelist.content, tracks: uids.join(',') };
          let origTracksDup = [...tracks];

          if (trackIndex !== -1) {
            origTracksDup.splice(trackIndex, 1, modifiedTrack);
          } else {
            origTracksDup.push(modifiedTrack);
          }
          setTracks([...origTracksDup]);
          if (trackIndex === -1) {
            add<TrackType>(modifiedTrack);
          } else {
            update<TrackType>(modifiedTrack);
          }
          setCurPath('');
        }
        break;
      case 'undo':
        {
          let index = tracks.findIndex(elem => elem.name === id);
          let backupNodeLists, backupPaths;
          if (index === -1) {
            // 未保存的数据
            backupNodeLists = [...tempNodes];
            const posN = backupNodeLists.findIndex(elem => elem.content === id);
            posN !== -1 && backupNodeLists.splice(posN, 1);

            backupPaths = [...tempLinks];
            const posT = backupPaths.findIndex(elem => elem.name === id);
            posT !== -1 && backupPaths.splice(posT, 1);
          } else {
            // 已保存的数据
            backupNodeLists = tracks.map(elem => {
              const doms = elem.tracks === '' ? [] : elem.tracks.split(',');
              let initial = doms.map(item => {
                const names = getElemName(item);
                return {
                  id: item,
                  content: names['itemLabel'],
                  gridContent: names['gridLabel'],
                  active: false,
                };
              });
              return { content: elem['name'], initial } as NodeList;
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
        setCurPath(id);
        const paths = updateActiveLinks(tempLinks, id);
        setTempLinks(paths);
        break;
      case 'delete':
        {
          let residual = tracks.filter(elem => id !== elem.name);
          setTracks([...residual]);
          removeTrackDBRecord(id);
        }
        break;
      case 'new':
        setTempNodes([...tempNodes, { content: id, initial: [] }]);
        setCurPath(id);
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
        if (extraUid && extraUid.length > 0) {
          const nodelist = tempNodes.find(elem => elem.content === id);
          const nodes = nodelist.initial;
          if (event === 'addNode') {
            const newNode = extraUid[0];
            const name = getElemName(newNode);
            const len = nodes.length;
            if ((len > 0 && nodes[len - 1].id !== newNode) || len === 0)
              nodes.push({
                id: newNode,
                content: name.itemLabel,
                gridContent: name['gridLabel'],
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
          setTempNodes([...tempNodes]);

          const index = tempLinks.findIndex(elem => elem.name === id);
          if (index !== -1) {
            const paths = nodes2Path([nodelist], true);
            if (paths.length > 0) {
              const tempLinksDup = [...tempLinks];
              tempLinksDup.splice(index, 1, paths[0]);
              setTempLinks([...tempLinksDup]);
            }
          } else {
            setTempLinks([...tempLinks, { name: id, edges: [] }]);
          }
        }
        break;
    }
  };

  const pathsFilter = () => {
    if (!!curPath) {
      const editingOne = tempLinks.find(elem => elem.name === curPath);
      return [editingOne];
    } else if (!!activeLink) {
      const highlightOne = tempLinks.find(elem => elem.name === activeLink);
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
