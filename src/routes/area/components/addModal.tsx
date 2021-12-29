import { useApi } from '@src/services/api/useApi';
import { Button, Form, Input, message, Modal, SelectMultiple } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type AreaType = {
  areaId?: string;
  areaName?: string;
  belongSystem?: string[];
  belongProperty?: string[];
  systemAndProperty?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  safetyTrade?: string;
};

export default function AddModal(props) {
  const { add, update } = useApi('area');
  const getUseDb = () => {
    return useApi('app');
  };
  const { getAll } = getUseDb();

  const [theName, setTheName] = useState('');
  const [belongSelect, setBelongSelect] = useState([]);
  const [belongOption, setBelongOption] = useState([]);
  const [propertyName, setPropertyName] = useState([]);
  const [propertyNameOption, setPropertyNameOption] = useState([]);
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');

  // 获取所有网络资产数据
  const getPropertys = () => {
    const { getAll } = useApi('property');
    getAll()
      .then(data => {
        getSelecOptions([...data], 'propertyNameOption');
      })
      .catch(() => {});
  };
  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        getSelecOptions([...data], 'belongOption');
      })
      .catch(() => {});
    getPropertys();
  };
  // 首次打开页面加载
  useEffect(() => {
    if (props.visible) {
      fetchList();
    }
  }, [props.visible]);

  const getSelecOptions = (data, attr) => {
    if (!data) {
      return;
    }

    const theNameArr = [];
    data.map(item => {
      const obj: any = {};
      if (attr === 'propertyNameOption') {
        obj.value = item.propertyName;
        obj.text = item.propertyName;
      } else {
        obj.value = item.systemName;
        obj.text = item.systemName;
      }

      theNameArr.push(obj);
    });
    if (attr === 'propertyNameOption') {
      setPropertyNameOption([...theNameArr]);
    } else {
      setBelongOption([...theNameArr]);
    }
  };

  // select change 事件
  const handleSelectChange = (v, attr) => {
    if (attr === 'belongSelect') {
      if (v) {
        setBelongSelect(v);
      } else {
        setBelongSelect([]);
      }
    }
    if (attr === 'propertyName') {
      if (v) {
        setPropertyName(v);
      } else {
        setPropertyName([]);
      }
    }
  };
  // 资产类型选择

  const init = () => {
    setTheName('');
    setBelongSelect([]);
    setPropertyName([]);
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
        arr.push(item.areaName);
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

  const handleSave = () => {
    setDoSave(true);
    if (theName.trim() === '') {
      return false;
    }
    if (belongSelect.length === 0 && propertyName.length === 0) {
      return false;
    }

    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: AreaType = {
        ...props.theData,
        areaName: theName.trim(),
        belongSystem: belongSelect,
        belongProperty: propertyName,
        systemAndProperty: belongSelect.join('/') + '/' + propertyName.join('/'),
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
      let request: AreaType = {
        areaId: 'area_id' + new Date().getTime(),
        areaName: theName.trim(),
        belongSystem: belongSelect,
        belongProperty: propertyName,
        systemAndProperty: belongSelect.join('/') + '/' + propertyName.join('/'),
        addMen: 'shanehwang',
        createdAt: +new Date(),
        safetyTrade: props.trade,
      };

      add(request)
        .then(() => {
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
  useEffect(() => {
    if (props.theData && props.isEdit) {
      setTheName(props.theData.areaName);
      setBelongSelect(props.theData.belongSystem);
      setPropertyName(props.theData.belongProperty);
      setPreName(props.theData.areaName);
    }
  }, [props.theData]);
  const templageFn = () => {
    return (
      <Form>
        <Form.Item
          label="分区名称"
          message={nameMessage(theName, '请输入分区名称', '分区名称已存在')}
          status={doSave ? (theName.trim() && checkSave() ? null : 'error') : null}
        >
          <Input
            className="w-330"
            value={theName}
            onChange={(value, context) => {
              setTheName(value);
            }}
            placeholder="请输入分区名称"
          />
        </Form.Item>
        <Form.Item
          label="包含系统"
          message={doSave ? (propertyName.length !== 0 || belongSelect.length !== 0 ? null : '请选择包含系统') : null}
          status={doSave ? (propertyName.length !== 0 || belongSelect.length !== 0 ? null : 'error') : null}
        >
          <SelectMultiple
            value={belongSelect}
            appearance="button"
            placeholder="请选择包含系统"
            options={belongOption}
            onChange={value => {
              handleSelectChange(value, 'belongSelect');
            }}
            className="w-330"
            matchButtonWidth
          />
        </Form.Item>
        <Form.Item
          label="包含网络资产"
          message={doSave ? (propertyName.length !== 0 || belongSelect.length !== 0 ? null : '请选择包含系统') : null}
          status={doSave ? (propertyName.length !== 0 || belongSelect.length !== 0 ? null : 'error') : null}
        >
          <SelectMultiple
            value={propertyName}
            appearance="button"
            placeholder="请选择网络资产"
            options={propertyNameOption}
            onChange={value => {
              handleSelectChange(value, 'propertyName');
            }}
            className="w-330"
            matchButtonWidth
          />
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        size="m"
        caption={props.isEdit ? '编辑分区' : '新增分区'}
        disableCloseIcon={true}
        onClose={close}
        className="table-modal"
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
