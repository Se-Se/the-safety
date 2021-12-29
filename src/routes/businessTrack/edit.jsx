import DraggableList from '@src/components/dragbleList';
import AddPathName from '@src/routes/attackTrack/pathModal';
import { Button, Collapse, Radio } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import './edit.less';

export default function CollapsePanel(props) {
  let { name: panelName, data, highlight, currentPath } = props;

  const [checked, setChecked] = useState('');
  const [visible, setVisible] = useState(false);
  const [names, setNames] = useState([]);
  const [nodeLists, setNodeLists] = useState([]);
  const [activeOnes, setActiveOnes] = useState([]);

  const style = { marginRight: 14, marginBottom: 18 };
  const arrowDown = () => <span className="arrowIcon" />;
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  useEffect(() => {
    setChecked(highlight);
  }, [highlight]);

  useEffect(() => {
    if (data.length > 0) {
      const pathnames = data.map(elem => elem.content);
      setNames(pathnames);
      if (!!currentPath) {
        const availablePath = data.find(elem => elem.content === currentPath);
        setNodeLists([availablePath]);
        if (data.length > 0) {
          const initActive = data.map(elem => elem.content);
          setActiveOnes([...initActive]);
        }
      } else {
        setNodeLists([...data]);
        setActiveOnes([]);
      }
    }
  }, [data, currentPath]);

  const content = data => (
    <div className="op">
      {data.content !== currentPath ? (
        <div className="op-btn">
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.content, 'edit');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.content, 'delete');
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
              props.onListChange(data.content, 'save');
            }}
          >
            保存
          </Button>
          <Button
            type="link"
            style={style}
            onClick={() => {
              props.onListChange(data.content, 'undo');
            }}
          >
            取消
          </Button>
        </div>
      )}
      <DraggableList
        initial={data.initial}
        editable={data.content === currentPath}
        withIcon={false}
        onDelete={value => {
          const deletedIndex = value.id;
          props.onListChange(data.content, 'deleteNode', [deletedIndex]);
        }}
        onDrag={value => {
          if (value.destination) {
            const srcIndex = value.source.index;
            const dstIndex = value.destination.index;
            props.onListChange(data.content, 'dragNode', [srcIndex, dstIndex]);
          }
        }}
      />
    </div>
  );

  const header = id => (
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
      <span>{id}</span>
    </div>
  );

  return (
    <div className="track-panel">
      <div className="panel-header">
        <span className="header-title">{currentPath === '' ? panelName : '新建流程'}</span>
        {currentPath === '' && (
          <Button
            type="link"
            onClick={() => {
              open();
            }}
          >
            新增流程
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
          <Collapse.Panel key={data.content} id={data.content} title={header(data.content)}>
            {content(data)}
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
}
