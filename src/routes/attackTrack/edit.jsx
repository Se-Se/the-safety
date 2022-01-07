import DraggableList from '@src/components/dragbleList';
import AddPathName from '@src/routes/attackTrack/pathModal';
import { Button, Collapse, Radio } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import './edit.less';

export default function CollapsePanel(props) {
  // name: 折叠面板名称（并非具体路线名称）
  // data: 初始全部路线数据
  // highlight：初始高亮显示路线
  // currentPath: 初始处于编辑态路线
  let { name: panelName, data, highlight, currentPath } = props;

  const [checked, setChecked] = useState(''); // 当前高亮显示路线
  const [visible, setVisible] = useState(false); // 新建路径Modal是否显示
  const [names, setNames] = useState([]); // 当前已经创建路线名，路线名在单一场景内不能重名
  const [nodeLists, setNodeLists] = useState([]); // 全部路线节点缓存
  const [activeOnes, setActiveOnes] = useState([]); // 折叠非折叠标识

  const style = { marginRight: 14, marginBottom: 10 };
  const arrowDown = () => <span className="arrowIcon" />;
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  useEffect(() => {
    setChecked(highlight);
  }, [highlight]);

  useEffect(() => {
    // 初始化本地数据
    if (data.length > 0) {
      const pathnames = data.map(elem => elem.content);
      setNames(pathnames);
      if (!!currentPath) {
        const availablePath = data.find(elem => elem.id === currentPath);
        setNodeLists([availablePath]);
        if (data.length > 0) {
          const initActive = data.map(elem => elem.content);
          setActiveOnes([...initActive]);
        }
      } else {
        setNodeLists([...data]);
        setActiveOnes([]);
      }
    } else {
      setNodeLists([]);
      setNames([]);
      setActiveOnes([]);
    }
  }, [data, currentPath]);

  const content = data => (
    <div className="op">
      {data.id !== currentPath ? (
        <div className="op-btn">
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.id, 'edit');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.id, 'delete');
            }}
          >
            删除
          </Button>
        </div>
      ) : (
        <div className="op-btn">
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.id, 'save');
            }}
          >
            保存
          </Button>
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.id, 'undo');
            }}
          >
            取消
          </Button>
        </div>
      )}
      <DraggableList
        initial={data.initial}
        editable={data.id === currentPath}
        withIcon={true}
        onDelete={value => {
          const deletedIndex = value.id;
          props.onListChange(data.id, 'deleteNode', [deletedIndex]);
        }}
        onDrag={value => {
          if (value.destination) {
            const srcIndex = value.source.index;
            const dstIndex = value.destination.index;
            props.onListChange(data.id, 'dragNode', [srcIndex, dstIndex]);
          }
        }}
      />
    </div>
  );

  const header = (id, title) => (
    <div className="header">
      <Radio
        disabled={currentPath !== ''}
        value={checked === id}
        onChange={value => {
          if (value) {
            setChecked(id);
            props.onListChange(id, 'highlight');
          }
        }}
      />
      <span>{title}</span>
    </div>
  );

  return (
    <div className="track-panel">
      <div className="panel-header">
        <span className="header-title">{currentPath === '' ? panelName : '新增路径'}</span>
        {currentPath === '' && (
          <Button
            type="link"
            onClick={() => {
              open();
            }}
          >
            新增路径
          </Button>
        )}
      </div>
      <AddPathName
        existedNames={names}
        visible={visible}
        onConfirmed={name => {
          close();
          if (name) {
            let { name: pathname } = name;
            props.onListChange(pathname, 'new');
          }
        }}
        onCancel={() => {
          close();
        }}
      />
      <Collapse
        iconPosition="right"
        activeIds={[...activeOnes]}
        icon={arrowDown}
        onActive={activeIds => {
          setActiveOnes([...activeIds]);
        }}
      >
        {nodeLists.map(data => (
          <Collapse.Panel key={data.id} id={data.content} title={header(data.id, data.content)}>
            {content(data)}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
}
