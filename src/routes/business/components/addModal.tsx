import { useApi } from '@src/services/api/useApi';
import { Button, Form, Input, message, Modal } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type RecordType = {
  businessId?: string;
  businessName?: string;
  part?: string;
  businessKinds?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  businessPic?: string;
  safetyTrade?: string;
};
export default function AddModal(props) {
  const { add, update } = useApi('business');

  const [businessN, setBusinessN] = useState('');
  const [thePart, setThePart] = useState('');
  const [businessK, setBusinessK] = useState('');
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');

  // 初始话数据
  const init = () => {
    setBusinessN('');
    setThePart('');
    setBusinessK('');
    setDoSave(false);
    setPreName('');
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
      let arr = [];
      props.allData.map(item => {
        arr.push(item.businessName);
      });
      if (arr.indexOf(businessN.trim()) > -1 && !props.isEdit) {
        return false;
      }
      if (arr.indexOf(businessN.trim()) > -1 && props.isEdit && businessN !== preName) {
        return false;
      }
    }
    return true;
  };

  // 保存按钮执行的fn
  const handleSave = () => {
    setDoSave(true);
    if (businessN.trim() === '') {
      return;
    }
    if (thePart.trim() === '') {
      return;
    }
    if (businessK.trim() === '') {
      return;
    }
    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: RecordType = {
        ...props.theData,
        businessName: businessN.trim(),
        part: thePart.trim(),
        businessKinds: businessK.trim(),
        editMen: 'shanehwang',
        editedAt: +new Date(),
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
        businessId: 'business_id' + new Date().getTime(),
        businessName: businessN.trim(),
        part: thePart.trim(),
        businessKinds: businessK.trim(),
        addMen: 'shanehwang',
        createdAt: +new Date(),
        safetyTrade: props.trade,
      };
      add(request)
        .then(res => {
          console.log('addres', res);
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

  // 数据更新的回调
  useEffect(() => {
    if (props.theData && props.isEdit) {
      setBusinessN(props.theData.businessName);
      setThePart(props.theData.part);
      setBusinessK(props.theData.businessKinds);
      setPreName(props.theData.businessName);
    }
  }, [props.theData]);

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        caption={props.isEdit ? '编辑业务' : '新增业务'}
        size="m"
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>
          <Form>
            <Form.Item
              label="业务名称"
              message={nameMessage(businessN, '请输入业务名称', '业务名称已存在')}
              status={doSave ? (businessN.trim() && checkSave() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={businessN}
                onChange={value => {
                  setBusinessN(value);
                }}
                placeholder="请输入业务名称"
              />
            </Form.Item>
            <Form.Item
              label="所属部门"
              message={doSave ? (thePart.trim() ? null : '请输入所属部门') : null}
              status={doSave ? (thePart.trim() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={thePart}
                onChange={value => {
                  setThePart(value);
                }}
                placeholder="请输入所属部门"
              />
            </Form.Item>
            <Form.Item
              label="业务大类"
              message={doSave ? (businessK.trim() ? null : '请输入业务大类') : null}
              status={doSave ? (businessK.trim() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={businessK}
                onChange={value => {
                  setBusinessK(value);
                }}
                placeholder="请输入业务大类"
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
