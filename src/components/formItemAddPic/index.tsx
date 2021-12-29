import React, { useState } from 'react';
import { Button, Form, Modal, Bubble, Icon, Card } from '@tencent/tea-component';
import { pinyin } from 'pinyin-pro';
import { imgNames } from '@src/components/tableCommon/globalData';

const AddPic: React.FC<any> = props => {
  const [choseItem, setChoseItem] = useState(null);
  const [theClick, setTheClick] = useState('');
  const [picV, setPicV] = useState(false);

  const getIcon = type => {
    if (type) {
      const typePinyin = pinyin(type, { toneType: 'none', type: 'array' }).join('').toLowerCase();
      return require('@src/image/' + typePinyin + '.svg');
    } else {
      return '';
    }
  };
  const handleSvgClick = (data: string, index: number) => {
    console.log(data);
    setTheClick(data);
    setChoseItem(index);
  };
  const handleSavePic = () => {
    props.save(theClick);
    setPicV(false);
  };
  const closePic = () => {
    setPicV(false);
    setTheClick('');
    setChoseItem(null);
  };
  const openPic = () => {
    setPicV(true);
    setTheClick('');
  };
  return (
    <>
      <Modal visible={picV} caption="选择分类图片" disableCloseIcon maskClosable onClose={closePic}>
        <Modal.Body>
          <Card>
            <Card.Body>
              <div className="recommend-svg-container">
                {(imgNames || []).map((item, index) => {
                  return (
                    <div
                      className={index === choseItem ? ' recommend-svg-item svg-chose' : 'recommend-svg-item'}
                      key={index}
                      onClick={() => handleSvgClick(item, index)}
                    >
                      <img src={getIcon(item)} className="part-icon" />
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button type="primary" onClick={handleSavePic}>
            确定
          </Button>
          <Button type="weak" onClick={closePic}>
            取消
          </Button>
        </Modal.Footer>
      </Modal>
      <Form.Item
        label="选择图标"
        message={props.doSave || props.picName ? (props.picName ? '已选择图标' : '请选择图标') : null}
        status={props.doSave || props.picName ? (props.picName ? 'success' : 'error') : null}
      >
        <Bubble content="添加图标">
          <Button type="weak" onClick={openPic} disabled={!props.canEdit}>
            <Icon type="plus" />
          </Button>
        </Bubble>
        {props.picName ? (
          <div className="pic-content" style={{ position: 'absolute', left: '90px', display: 'inline-block' }}>
            <img src={getIcon(props.picName)} className="part-icon" style={{ width: '50px', height: '30px' }} />
          </div>
        ) : null}
      </Form.Item>
    </>
  );
};
export default AddPic;
