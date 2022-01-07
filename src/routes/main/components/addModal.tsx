import PicModal from '@src/components/picModal';
import { initGapOptions, MAIN_IMAGES, TRADE_OPTIONS } from '@src/components/tableCommon/globalData';
import { useApi } from '@src/services/api/useApi';
import { Bubble, Button, Form, Icon, Input, message, Modal, Select, TextArea } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type RecordType = {
  id?: string;
  name?: string;
  theTrade?: string;
  description?: string;
  imgClass?: string;
};
export default function AddModal(props) {
  const { add, update } = useApi('trade');
  const [title, setTitle] = useState('');
  const [desText, setDesText] = useState('');
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');
  const [picName, setPicName] = useState('');
  const [showModalPic, setShowModalPic] = useState(false);
  const [theTrade, setTheTrade] = useState('');

  // 输入标题的回调
  const handleTitle = (t: string) => {
    setTitle(t);
  };
  // 输入描述的回调
  const handleDesText = (t: string) => {
    setDesText(t);
  };
  // 初始话数据
  const init = () => {
    setDesText('');
    setTitle('');
    setDoSave(false);
    setPreName('');
    setPicName('');
    setShowModalPic(false);
    setTheTrade('');
  };

  // 关闭modal的回调
  const close = () => {
    props.close();
    init();
  };

  // 名称检查
  const nameMessage = (attV, errMes, existMes): any => {
    if (doSave) {
      if (attV.trim() && checkSave()) {
        return null;
      } else {
        if (!attV.trim()) {
          return errMes;
        } else if (!checkSave()) {
          return existMes;
        }
      }
    } else {
      return null;
    }
    return '';
  };
  // 检查系统名称是否已存在
  const checkSave = () => {
    if (props.allData) {
      let containFlag = false;
      props.allData.map(item => {
        if (item.name === title.trim() && item.theTrade === theTrade) {
          containFlag = true;
        }
      });
      if (containFlag && !props.isEdit) {
        return false;
      }
      if (containFlag && props.isEdit && title !== preName) {
        return false;
      }
    }
    return true;
  };
  // 点击保存btn的执行fn
  const handleSave = () => {
    setDoSave(true);
    if (title.trim() === '') {
      return;
    }
    if (desText.trim() === '') {
      return;
    }
    if (!theTrade) {
      return;
    }

    if (picName.trim() === '') {
      return;
    }
    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: RecordType = {
        name: title.trim(),
        description: desText,
        theTrade: theTrade,
        imgClass: picName,
        id: props.theTrade.id,
      };
      update(request)
        .then(() => {
          message.success({ content: '成功' });
          props.close();
          props.save();
          init();
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    } else {
      let request: RecordType = {
        name: title.trim(),
        description: desText,
        theTrade: theTrade,
        imgClass: picName,
        id: 'trade_id' + new Date().getTime(),
      };
      add(request)
        .then(() => {
          handleAddGapOptions(request);
          message.success({ content: '成功' });
          props.close();
          props.save();
          init();
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    }
  };
  // 数据变化的回调
  useEffect(() => {
    if (props.theTrade) {
      setDesText(props.theTrade.description);
      setTitle(props.theTrade.name);
      setPreName(props.theTrade.name);
      setPicName(props.theTrade.imgClass);
      setTheTrade(props.theTrade.theTrade);
    }
  }, [props.theTrade]);

  // 点击打卡图片modal
  const openPic = () => {
    setShowModalPic(!showModalPic);
  };
  // 关闭添加图片modal的fn
  const closePic = () => {
    setShowModalPic(false);
  };
  // 点击保存图片的fn
  const handleSaveChose = data => {
    setPicName(data);
    setShowModalPic(false);
  };
  // 行业变化的fn
  const handleTradeChange = data => {
    setTheTrade(data);
  };
  // 添加行业时同时添加对应的gapOptions
  const handleAddGapOptions = (data: any) => {
    const { add, getAll } = useApi('gapOptions');
    getAll().then(res => {
      const theSafetyTrade = data.theTrade + '/' + data.name;
      let filterArr = res.filter((item: any) => {
        return item.safetyTrade === theSafetyTrade;
      });
      if (!filterArr.length) {
        let request = { ...initGapOptions };
        request.safetyTrade = theSafetyTrade;
        request.id = 'gapOptions_id' + new Date().getTime();
        add(request)
          .then(() => {})
          .catch(err => {
            console.log(err);
          });
      }
    });
  };
  return (
    <>
      <PicModal
        picV={showModalPic}
        close={closePic}
        saveChose={handleSaveChose}
        isClass={true}
        imgNames={MAIN_IMAGES}
      ></PicModal>
      <Modal
        maskClosable
        visible={props.visible}
        disableCloseIcon={true}
        caption={props.isEdit ? '编辑行业' : '新增行业'}
        size="m"
        onClose={close}
      >
        <Modal.Body>
          <Form>
            <Form.Item
              label="标题"
              message={nameMessage(title, '请输入行业名称', '行业名称已存在')}
              status={doSave ? (title.trim() && checkSave() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={title}
                onChange={value => {
                  handleTitle(value);
                }}
                placeholder="请输入行业名称"
              />
            </Form.Item>
            <Form.Item
              label="所属行业"
              message={doSave ? (theTrade ? null : '请选择所属行业') : null}
              status={doSave ? (theTrade ? null : 'error') : null}
            >
              <Select
                value={theTrade}
                clearable
                matchButtonWidth
                appearance="button"
                placeholder="请选择所属行业"
                options={TRADE_OPTIONS}
                onChange={value => {
                  handleTradeChange(value);
                }}
                className="w-330"
              />
            </Form.Item>
            <Form.Item
              label="标题图片"
              message={doSave || picName ? (picName ? '已选择图片' : '请选择标题图片') : null}
              status={doSave || picName ? (picName ? 'success' : 'error') : null}
              style={{ position: 'relative' }}
            >
              <Bubble content="添加标题图片">
                <Button type="weak" onClick={openPic}>
                  <Icon type="plus" />
                </Button>
              </Bubble>
              {picName ? (
                <div className="pic-content" style={{ position: 'absolute', left: '90px', display: 'inline-block' }}>
                  <div style={{ width: '163px', height: '30px', margin: '5px' }} className="main-card-img">
                    <img src={require(`@src/configs/image/${picName}`)} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              ) : null}
            </Form.Item>

            <Form.Item
              label="描述"
              message={doSave ? (desText ? null : '请输入行业描述') : null}
              status={doSave ? (desText ? null : 'error') : null}
            >
              <TextArea
                className="w-330"
                value={desText}
                placeholder="请输入行业描述"
                onChange={value => {
                  handleDesText(value);
                }}
              />
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
          <Button type="weak" onClick={close}>
            取消
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
