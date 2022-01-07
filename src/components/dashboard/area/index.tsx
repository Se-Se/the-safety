import cls from 'classnames';
import React, { useRef, useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import PartitionCard from '../partition';
import './index.less';
import { calcWH } from './util';

const BaseItemSize = [102, 130, 20, 60];
const LayoutMargin: [number, number] = [5, 5];
const LayoutRowHeight = 1;

const AreaCard: React.FC<{
  edit: boolean;
  width: number;
  cols: number;
  gapBubble?: boolean;
  dataSource: Array<{}>;
  business?: Array<string>;
  scene?: Array<any>;
  track?: Array<any>;
  onChange: (type, key, value) => void;
}> = props => {
  const [, forceUpdate] = useState<any>({});
  const [select, setSelect] = useState<number>(-1);
  const dataSource = props.dataSource;
  const scaleRef = useRef([-1, 0, 0]); // [操作 index, x比例, y比例, x 偏移, 偏移]

  // 根据拖拽和内容情况，重置大小
  const resizeArea = newItem => {
    const container = document.getElementById(getCardItemId(newItem.i));
    if (!container) {
      return;
    }
    const [idx, xOffset, YOffset] = scaleRef.current;
    const contentLength = (dataSource[idx] as any).content.data.filter(item => item.select).length;

    const { width } = container.getBoundingClientRect();
    // 计算宽度可以放几个
    let colCount = Math.floor((width - xOffset) / BaseItemSize[0]) || 1;
    if (colCount > contentLength) {
      colCount = contentLength;
    }

    const rows = Math.ceil(contentLength / colCount);
    const [newWidth, newHeight] = [colCount * BaseItemSize[0] + xOffset, rows * BaseItemSize[1] + YOffset];
    return calcWH(
      {
        cols: props.cols,
        margin: LayoutMargin,
        maxRows: Infinity,
        rowHeight: LayoutRowHeight,
        containerPadding: LayoutMargin,
        containerWidth: props.width,
      },
      newWidth,
      newHeight,
      newItem.x,
      newItem.y,
    );
  };

  const onLayoutChange = layout => {
    for (let index = 0; index < layout.length; index++) {
      const element = layout[index];
      if (index < dataSource.length) {
        if (index == scaleRef.current?.[0]) {
          const { w, h } = resizeArea(element);
          if (w < BaseItemSize[0]) {
            element.w = BaseItemSize[0];
          } else {
            element.w = w;
          }
          element.h = h;
        }
        ['x', 'y', 'w', 'h'].forEach(item => {
          dataSource[index][item] = element[item];
        });
        (dataSource[index] as any).minW = BaseItemSize[0];
      }
    }
    forceUpdate({}); // 强制渲染子组件
    props.onChange('data', 'layout', dataSource);
  };

  // 存在拖出界特别窄的问题，有待修正
  const drag = (_, layoutItem, event) => {
    const info = JSON.parse(event.dataTransfer.getData('text/plain'));
    const [newWidth, newHeight] = [
      info.data.length * BaseItemSize[0] + BaseItemSize[2],
      1 * BaseItemSize[1] + BaseItemSize[3],
    ];
    const { w, h } = calcWH(
      {
        cols: props.cols,
        margin: LayoutMargin,
        maxRows: Infinity,
        rowHeight: LayoutRowHeight,
        containerPadding: LayoutMargin,
        containerWidth: props.width,
      },
      newWidth,
      newHeight,
      layoutItem.x,
      layoutItem.y,
    );
    const data = {
      content: info,
      x: layoutItem.x,
      y: layoutItem.y,
      w,
      h,
      id: 'dashboard_id' + new Date().getTime(),
      minW: BaseItemSize[0],
    };
    props.onChange('data', 'add', data);
  };

  // 拖拽开始，记录拖拽的分区及对应的横纵比
  const onResizeStart = (_layout, oldItem) => {
    // 这里依赖初始宽度是准的
    // const [xOffset, YOffset] = [width % BaseItemSize[0], height % BaseItemSize[1]];
    const [xOffset, YOffset] = [BaseItemSize[2], BaseItemSize[3]];

    scaleRef.current = [parseInt(oldItem.i), xOffset, YOffset];
  };
  console.log(props.track);
  const renderPartition = () => {
    return props.dataSource.map((item: any, index) => {
      const position: any = { static: !props.edit, isDraggable: props.edit };
      ['x', 'y', 'w', 'h', 'minW'].forEach(k => {
        position[k] = item[k];
      });
      return (
        <div
          id={getCardItemId(index)}
          key={index}
          className={cls('partition', {
            edit: props.edit,
            select: select == index,
            track: props.track,
            'track-edit': props.track && props.track[0] && props.track[2].indexOf(item.content.key) == -1,
            'track-highlight': props.track && props.track[2].indexOf(item.content.key) > -1,
            scene: props.scene,
            last: props.track && !props.track[0] && props.track[1] && props.track[1].id == item.content.key,
          })}
          data-grid={position}
        >
          {props.edit ? (
            <div
              className="delete-icon"
              onClick={() => {
                props.onChange('data', 'delete', index);
              }}
            >
              <img src={require('@src/image/delete.svg')} />
            </div>
          ) : null}
          <PartitionCard
            key={index}
            gapBubble={props.gapBubble}
            cols={position.w}
            data={item.content}
            edit={props.edit}
            business={props.business}
            scene={props.scene}
            onSelect={dom => {
              props.onChange('data', 'select', dom);
            }}
            onClick={(key?) => {
              if (props.edit) {
                setSelect(index);
                props.onChange('data', 'edit', index);
                forceUpdate({});
              } else {
                props.onChange('btrack', 'select', key);
              }
            }}
          />
        </div>
      );
    });
  };
  return (
    <div className="area-content" style={{ width: props.width }}>
      <GridLayout
        onLayoutChange={onLayoutChange}
        className="layout"
        layout={dataSource}
        isDraggable={props.edit}
        isResizable={props.edit}
        cols={props.cols}
        width={props.width}
        isDroppable={true}
        onDrop={drag}
        margin={LayoutMargin}
        verticalCompact={false}
        rowHeight={LayoutRowHeight}
        onResizeStart={onResizeStart}
        preventCollision={true}
        onDragStop={(_layout: any, _oldItem: any, newItem: any, _placeholder: any, _e: any, element: any) => {
          let theKey = '';
          element.childNodes.forEach(item => {
            if (item.className === 'partition-content') {
              theKey = item.id.substring(5);
            }
          });
          if (props.edit) {
            setSelect(Number(newItem.i));
            props.onChange('data', 'edit', Number(newItem.i));
          } else {
            props.onChange('btrack', 'select', theKey);
          }
        }}
      >
        {renderPartition()}
      </GridLayout>
    </div>
  );
};

export default AreaCard;

const getCardItemId = (idx: number) => `grid_area_${idx}`;
