import { Bubble, Button, Card } from '@tencent/tea-component';
import React from 'react';

export default function ManiItem(props) {
  const edit = (ev: any) => {
    ev.stopPropagation();
    props.edit();
  };

  const close = (ev: any) => {
    ev.stopPropagation();
    props.close();
  };
  return (
    <div
      onClick={() => {
        props.itemClick(`${props.theTrade}/${props.name}`);
      }}
    >
      <Card bordered className="main-card-item">
        <Card.Body className={`main-card-img ${props.imgClass}`}>
          <img src={require(`@src/configs/image/${props.imgClass}`)} style={{ width: '100%', height: '100%' }} />
        </Card.Body>
        <Card.Body className="main-item-body" title={props.name}>
          <div className="des-content">
            <Bubble content={props.description}>{props.description}</Bubble>
          </div>
        </Card.Body>
        <Card.Footer>
          <Button
            className="main-item-edit-btn main-edit-btn"
            type="link"
            onClick={ev => {
              edit(ev);
            }}
          >
            编辑
          </Button>
          <Button
            className="main-item-edit-btn delete"
            type="link"
            onClick={ev => {
              close(ev);
            }}
          >
            删除
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
