import { Button, Card, Modal } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

const PicModal: React.FC<any> = props => {
  const [show, setShow] = useState(false);
  const [choseItem, setChoseItem] = useState(null);
  const [theClick, setTheClick] = useState('');

  const handleItemClick = (data: string, index: number) => {
    setTheClick(data);
    setChoseItem(index);
  };

  const handleSavePic = () => {
    setShow(false);
    props.saveChose(theClick);
  };

  const closePic = () => {
    setShow(false);
    setTheClick('');
    setChoseItem(null);
    props.close();
  };
  useEffect(() => {
    setShow(props.picV);
  }, [props.picV]);
  return (
    <>
      <Modal visible={show} size="l" caption="选择分类图片" disableCloseIcon maskClosable onClose={closePic}>
        <Modal.Body>
          <Card>
            <Card.Body>
              <div className="pic-modal-container">
                {(props.imgNames || []).map((item, index) => {
                  return (
                    <div
                      className={index === choseItem ? ' recommend-svg-item svg-chose' : 'recommend-svg-item'}
                      key={index}
                      onClick={() => handleItemClick(item, index)}
                    >
                      {props.isClass ? (
                        <div
                          style={{ width: '325px', height: '60px', margin: '5px' }}
                          className={`main-card-img ${item}`}
                        >
                          <img src={require(`@src/configs/image/${item}`)} style={{ width: '100%', height: '100%' }} />
                        </div>
                      ) : (
                        <img src={item} className="part-icon" />
                      )}
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
    </>
  );
};

export default PicModal;
