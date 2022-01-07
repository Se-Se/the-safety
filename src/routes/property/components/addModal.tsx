import { useApi } from '@src/services/api/useApi';
import { filterTheTrade } from '@src/utils/util';
import { Button, Cascader, Form, Input, message, Modal, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type PropertyType = {
  propertyId?: string;
  propertyName?: string;
  business?: string;
  businessKinds?: string;
  part?: string;
  propertyKind?: string;
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
  const { add, update } = useApi(props.comName);
  const { getAll } = useApi('business');
  const [tableData, setTableData] = useState<Business[]>();

  const [theName, setTheName] = useState('');
  const [belongSelect, setBelongSelect] = useState('');
  const [belongFieldA, setBelongFieldA] = useState('');
  const [belongFieldB, setBelongFieldB] = useState('');
  const [kindOption, setKindOption] = useState('');
  const [belongOption, setBelongOption] = useState([]);
  const [cascaderProperty, setCascaderProperty] = useState([]);
  const [theBusinessId, setTheBusinessId] = useState('');
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');

  // 修改gap表数据
  const handleGapTable = (type, data) => {
    const { add, update, getAll } = useApi('gap');
    let request: GapType = {
      gapId: data.propertyId,
      propertyOrSystem: data.propertyName,
      business: data.business,
      businessKinds: data.businessKinds,
      part: data.part,
      categorys: 'property',
      theType: data.propertyKind,
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
        setTableData([...arr]);
      })
      .catch(() => {});
  };
  // 首次打开页面加载
  useEffect(() => {
    if (props.visible) {
      fetchList();
    }
  }, [props.visible]);

  // 将资产和业务转换成下拉框数组fn
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

    setBelongOption([...theNameArr]);
  };

  // select change 事件
  const handleSelectChange = (v, attr) => {
    if (attr === 'belongSelect') {
      setBelongSelect(v);
      tableData.map(item => {
        if (item.businessName === v) {
          setBelongFieldA(item.businessKinds);
          setBelongFieldB(item.part);
        }
      });
    }
    if (attr === 'kindOption') {
      setKindOption(v);
    }
  };
  // 资产类型选择
  const handleCascaderChange = (v): void => {
    setCascaderProperty(v);
  };

  // 初始化数据
  const init = () => {
    setTheName('');
    setBelongSelect('');
    setBelongFieldA('');
    setBelongFieldB('');
    setKindOption('');
    setCascaderProperty([]);
    setTheBusinessId('');
    setDoSave(false);
    setPreName('');
  };
  // 添加modal关闭时的回调
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
        arr.push(item.propertyName);
      });
      if (arr.indexOf(theName.trim()) > -1 && !props.isEdit) {
        return false;
      }
      if (arr.indexOf(theName.trim()) > -1 && props.isEdit && theName !== preName) {
        return false;
      }
    }
    return true;
  };

  // 保存时执行的回调
  const handleSave = () => {
    setDoSave(true);
    if (theName.trim() === '') {
      return false;
    }
    if (belongSelect.trim() === '') {
      return false;
    }
    if (props.comName === 'property' && cascaderProperty.join('/').trim() === '') {
      return false;
    }
    if (kindOption.trim() === '' && props.comName !== 'property') {
      return false;
    }
    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: PropertyType = {
        ...props.theData,
        propertyName: theName.trim(),
        business: belongSelect.trim(),
        businessKinds: belongFieldA.trim(),
        part: belongFieldB.trim(),
        propertyKind: cascaderProperty.join('/').trim(),
        editMen: 'shanehwang',
        editedAt: +new Date(),
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
      let request: PropertyType = {
        propertyId: 'property_id' + new Date().getTime(),
        propertyName: theName.trim(),
        business: belongSelect.trim(),
        businessKinds: belongFieldA.trim(),
        part: belongFieldB.trim(),
        propertyKind: cascaderProperty.join('/').trim(),
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

  // 数据更新时的回调
  useEffect(() => {
    if (props.theData && props.isEdit) {
      setTheName(props.theData.propertyName);
      setBelongSelect(props.theData.business);
      setBelongFieldA(props.theData.businessKinds);
      setBelongFieldB(props.theData.part);
      setCascaderProperty(props.theData.propertyKind.split('/'));
      setTheBusinessId(props.theData.theBusinessId);
      setPreName(props.theData.propertyName);
    }
  }, [props.theData]);

  // 返回页面dom节点
  const templageFn = () => {
    return (
      <>
        <Form>
          <Form.Item
            label="资产名称"
            message={nameMessage(theName, '请输入资产名称', '资产名称已存在')}
            status={doSave ? (theName.trim() && checkSave() ? null : 'error') : null}
          >
            <Input
              className="w-330"
              value={theName}
              onChange={value => {
                setTheName(value);
              }}
              placeholder="请输入资产名称"
            />
          </Form.Item>
          <Form.Item
            label="所属业务"
            message={doSave ? (belongSelect ? null : '请选择所属业务') : null}
            status={doSave ? (belongSelect ? null : 'error') : null}
          >
            <Select
              value={belongSelect}
              clearable
              matchButtonWidth
              appearance="button"
              placeholder="请选择所属业务"
              options={belongOption}
              onChange={value => {
                handleSelectChange(value, 'belongSelect');
              }}
              className="w-330"
            />
          </Form.Item>
          <Form.Item
            label="资产类型"
            message={doSave ? (cascaderProperty.length !== 0 ? null : '请选择资产类型') : null}
            status={doSave ? (cascaderProperty.length !== 0 ? null : 'error') : null}
          >
            <Cascader
              className="w-330"
              value={cascaderProperty}
              clearable
              type="menu"
              placeholder="请选择资产类型"
              data={props.propertyOption}
              multiple={false}
              onChange={value => {
                handleCascaderChange(value);
              }}
            />
          </Form.Item>
        </Form>
      </>
    );
  };

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        caption={props.isEdit ? '编辑资产' : '新增资产'}
        size="m"
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>{templageFn()}</Modal.Body>
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
