import React from 'react';
import GridLayout from 'react-grid-layout';
import './index.less';

const GroupCard: React.FC<{
  edit: boolean;
  width: number;
  cols: number;
  groupSource: Array<any>;
  onChange: (type, key, value) => void;
}> = props => {
  const groupSource = props.groupSource;

  const onLayoutChange = layout => {
    for (let index = 0; index < layout.length; index++) {
      const element = layout[index];
      if (index < groupSource.length) {
        ['x', 'y', 'w', 'h'].forEach(item => {
          groupSource[index][item] = element[item];
        });
      }
    }
    props.onChange('group', 'layout', groupSource);
  };

  const renderGroup = () => {
    return groupSource.map((item, index) => {
      const position = { minW: 1, minH: 1 };
      ['x', 'y', 'w', 'h'].forEach(k => {
        position[k] = item[k];
      });
      return (
        <div key={index} data-grid={position}>
          <div className="group-unit">
            <div
              className="delete-icon"
              onClick={() => {
                props.onChange('group', 'delete', index);
              }}
            >
              <img src={require('@src/image/delete.svg')} />
            </div>
            <div
              className="group-title"
              onClick={() => {
                props.onChange('group', 'edit', index);
              }}
            >
              {item.title}
            </div>
          </div>
        </div>
      );
    });
  };

  const drag = (_, layoutItem) => {
    const data = {
      x: layoutItem.x,
      y: layoutItem.y,
      w: 200,
      h: 6,
      title: '大区标题',
      id: 'group_id' + new Date().getTime(),
    };
    props.onChange('group', 'add', data);
  };

  return (
    <div className="group-content" style={{ width: props.width }}>
      <GridLayout
        onLayoutChange={onLayoutChange}
        className="layout"
        layout={groupSource}
        isDraggable={props.edit}
        isResizable={props.edit}
        cols={props.cols}
        width={props.width}
        isDroppable={true}
        margin={[5, 5]}
        onDrop={drag}
        verticalCompact={false}
        rowHeight={1}
        preventCollision={true}
      >
        {renderGroup()}
      </GridLayout>
    </div>
  );
};

export default GroupCard;
