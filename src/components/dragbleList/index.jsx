import { Button, Icon } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './index.less';

// 交换后排序
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

// 节点元素 quote:节点文字内容，editable：是否可以被编辑，决定元素显示风格
// onDelete：删除某个元素回调
const Item = ({ quote, editable, onDelete }) => {
  const style = { color: '#888888' };
  const widthStyle = { maxWidth: editable ? 100 : null };
  const marginStyle = { marginLeft: editable ? 0 : -20 };

  return (
    <div className="d-container" style={marginStyle}>
      {editable && <div className="bg"></div>}
      <div className="main-content">
        {editable && <Icon className="drag-hint" type="drop"></Icon>}
        <div className="content">
          <div className="text" style={widthStyle}>
            {quote.content}
          </div>
          {editable && (
            <Button
              className="trash-bin"
              style={style}
              type="icon"
              onClick={() => {
                onDelete(quote);
              }}
            />
          )}
        </div>
        {quote.gridContent && <div className="grid-content">{quote.gridContent}</div>}
      </div>
    </div>
  );
};

// Draggable 列表，quotes：列表数据，用于列表元素绘制，editable：是否可以被编辑，决定元素显示风格
// onDelete：删除某个元素回调
// withIcon: 列表内元素是否显示特定图标，true：显示特定图标，false：显示序号，从0开始
const ItemList = ({ quotes, editable, withIcon, onDelete }) => {
  return quotes.map((quote, index) => {
    let itemClass;
    if (withIcon) {
      itemClass = quote.active || editable ? 'item item-active' : 'item';
    } else {
      itemClass = quote.active || editable ? 'elem elem-active' : 'elem';
    }
    return (
      <Draggable draggableId={quote.id} key={quote.id + index} index={index} isDragDisabled={!editable}>
        {provided => (
          <div className={itemClass} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Item quote={quote} editable={editable} onDelete={value => onDelete(value)} />
          </div>
        )}
      </Draggable>
    );
  });
};

// 通过DnD实现的可拖拽列表，initial是初始显示列表， editable：列表是否可以被修改，会影响元素显示风格，
// onDelete：删除某个元素回调， onDrag：拖动元素后的回调
// withIcon: 列表内元素是否显示特定图标，true：显示特定图标，false：显示序号，从0开始
function DraggableList({ initial, editable, onDelete, withIcon, onDrag }) {
  const [state, setState] = useState({ quotes: [] });

  useEffect(() => {
    if (initial) {
      setState({ quotes: initial });
    }
  }, [initial]);

  function onDragEnd(result) {
    let quotes = state.quotes;
    if (result.destination && result.destination.index !== result.source.index) {
      quotes = reorder(state.quotes, result.source.index, result.destination.index);
    }

    quotes.forEach(elem => {
      elem.active = false;
    });

    setState({ quotes });
    onDrag(result);
  }

  function onDragStart() {
    const quotes = state.quotes;
    quotes.forEach(elem => {
      elem.active = true;
    });
    setState({ quotes });
  }

  return (
    <div className="container">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="list">
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="items">
              <ItemList
                quotes={state.quotes}
                editable={editable}
                withIcon={withIcon}
                onDelete={value => {
                  onDelete(value);
                }}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default DraggableList;
