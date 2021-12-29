import { useApi } from '@src/services/api/useApi';
import { filterTheTrade } from '@src/utils/util';
import { Button, Form, Input, message, Modal, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type RecordType = {
  systemId?: string;
  systemName?: string;
  business?: string;
  businessKinds?: string;
  part?: string;
  systemKinds?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  safetyTrade?: string;
  theBusinessId?: string;
};
type Business = {
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
type GapType = {
  gapId?: string;
  propertyOrSystem?: string;
  business?: string;
  businessKinds?: string;
  part?: string;
  categorys?: string;
  theType?: string;
  editMen?: string;
  addMen?: string;
  editedAt?: string | number;
  actType?: string;
  actName?: string;
  theBug?: string;
  bugName?: string;
  action?: string;
  actionName?: string;
  against?: string;
  againstName?: string;
  editData?: string;
  safetyTrade?: string;
  theBusinessId?: string;
};

export default function AddModal(props) {
  const { add, update } = useApi('app');
  const { getAll } = useApi('business');
  const [businessData, setBusinessData] = useState<Business[]>();

  const [systemN, setSystemN] = useState('');
  const [theBusiness, setTheBusiness] = useState('');
  const [businessK, setBusinessK] = useState('');
  const [thePart, setThePart] = useState('');
  const [theBusinessId, setTheBusinessId] = useState('');
  const [systemK, setSystemK] = useState('');
  const [businessNameArr, setBusinessNameArr] = useState([]);
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');

  // 修改gap表数据
  const handleGapTable = (type, data) => {
    const { add, update, getAll } = useApi('gap');
    let request: GapType = {
      gapId: data.systemId,
      propertyOrSystem: data.systemName,
      business: data.business,
      businessKinds: data.businessKinds,
      part: data.part,
      categorys: 'system',
      theType: data.systemKinds,
      addMen: data.addMen,
      editedAt: data.createdAt,
      actType: '',
      theBug: '',
      safetyTrade: data.safetyTrade,
      theBusinessId: data.theBusinessId,
    };
    if (type === 'add') {
      add(request)
        .then(() => {
          message.success({ content: '成功' });
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    } else if (type === 'update') {
      getAll().then(res => {
        if (res) {
          res.map(item => {
            if (item.gapId === request.gapId) {
              request.actName = item.actName;
              request.actType = item.actType;
              request.action = item.action;
              request.actionName = item.actionName;
              request.against = item.against;
              request.againstName = item.againstName;
              request.theBug = item.theBug;
              request.bugName = item.bugName;
              request.editData = item.editData;
              request.editedAt = item.editedAt;
              request.editMen = item.editMen;
              update(request)
                .then(() => {
                  message.success({ content: '成功' });
                })
                .catch(err => {
                  message.error({ content: `失败${err}` });
                });
            }
          });
        }
      });
    }
  };
  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        const arr = filterTheTrade(data, 'safetyTrade', props.trade);
        getSelecOptions([...arr]);
        setBusinessData([...arr]);
      })
      .catch(() => {});
  };
  // 首次打开页面加载
  useEffect(() => {
    if (props.visible) {
      fetchList();
    }
  }, [props.visible]);
  const getSelecOptions = data => {
    if (!data) {
      return;
    }
    const theNameArr = [];
    data.map(item => {
      const obj: any = {};
      obj.value = item.businessName;
      obj.text = item.businessName;
      theNameArr.push(obj);
    });

    setBusinessNameArr([...theNameArr]);
  };
  // select change 事件
  const handleSelectChange = (v, attr) => {
    if (attr === 'theBusiness') {
      setTheBusiness(v);
      businessData.map(item => {
        if (item.businessName === v) {
          setBusinessK(item.businessKinds);
          setThePart(item.part);
          setTheBusinessId(item.businessId);
        }
      });
    }
  };
  const init = () => {
    setSystemN('');
    setTheBusiness('');
    setBusinessK('');
    setSystemK('');
    setThePart('');
    setTheBusinessId('');
    setDoSave(false);
    setPreName('');
  };
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
        arr.push(item.systemName);
      });
      if (arr.indexOf(systemN.trim()) > -1 && !props.isEdit) {
        return false;
      }
      if (arr.indexOf(systemN.trim()) > -1 && props.isEdit && systemN !== preName) {
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    setDoSave(true);
    if (systemN.trim() === '') {
      return;
    }
    if (theBusiness.trim() === '') {
      return;
    }
    if (systemK.trim() === '') {
      return;
    }
    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: RecordType = {
        ...props.theData,
        systemName: systemN.trim(),
        business: theBusiness.trim(),
        businessKinds: businessK.trim(),
        systemKinds: systemK.trim(),
        editMen: 'shanehwang',
        editedAt: +new Date(),
        theBusinessId: theBusinessId,
      };
      update(request)
        .then(() => {
          handleGapTable('update', request);
          props.close();
          props.save();
          init();
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    } else {
      let request: RecordType = {
        systemId: 'app_id' + new Date().getTime(),
        systemName: systemN.trim(),
        business: theBusiness.trim(),
        businessKinds: businessK.trim(),
        part: thePart.trim(),
        systemKinds: systemK.trim(),
        addMen: 'shanehwang',
        createdAt: +new Date(),
        safetyTrade: props.trade,
        theBusinessId: theBusinessId,
      };
      add(request)
        .then(() => {
          handleGapTable('add', request);
          props.close();
          props.save();
          init();
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    }
  };
  useEffect(() => {
    if (props.theData && props.isEdit) {
      setSystemN(props.theData.systemName);
      setTheBusiness(props.theData.business);
      setBusinessK(props.theData.businessKinds);
      setSystemK(props.theData.systemKinds);
      setThePart(props.theData.part);
      setTheBusinessId(props.theData.theBusinessId);
      setPreName(props.theData.systemName);
    }
  }, [props.theData]);

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        caption={props.isEdit ? '编辑系统' : '新增系统'}
        size="m"
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>
          <Form>
            <Form.Item
              label="系统名称"
              message={nameMessage(systemN, '请输入系统名称', '系统名称已存在')}
              status={doSave ? (systemN.trim() && checkSave() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={systemN}
                onChange={(value, context) => {
                  setSystemN(value);
                }}
                placeholder="请输入系统名称"
              />
            </Form.Item>
            <Form.Item
              label="所属业务"
              message={doSave ? (theBusiness ? null : '请选择所属业务') : null}
              status={doSave ? (theBusiness ? null : 'error') : null}
            >
              <Select
                value={theBusiness}
                clearable
                matchButtonWidth
                appearance="button"
                placeholder="请选择所属业务"
                options={businessNameArr}
                onChange={value => {
                  handleSelectChange(value, 'theBusiness');
                }}
                className="w-330"
              />
            </Form.Item>
            <Form.Item
              label="系统类型"
              message={doSave ? (systemK ? null : '请输入系统类型') : null}
              status={doSave ? (systemK ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={systemK}
                onChange={value => {
                  setSystemK(value);
                }}
                placeholder="请输入系统类型"
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
