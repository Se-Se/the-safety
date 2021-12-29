import { useApi } from '@src/services/api/useApi';
import { filterTheTrade } from '@src/utils/util';
import { Button, Form, Input, message, Modal, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';

type AppType = {
  id?: number;
  systemId?: string;
  systemName?: string;
  business?: string;
  businessKinds?: string;
  systemKinds?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  safetyTrade?: string;
};
type DataType = {
  id?: number;
  dataId?: string;
  dataName?: string;
  systemPart?: string;
  systemKinds?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  safetyTrade?: string;
};

export default function AddModal(props) {
  const { add, update } = useApi('data');
  const { getAll } = useApi('app');
  const [tableData, setTableData] = useState<AppType[]>();

  const [theName, setTheName] = useState('');
  const [belongSelect, setBelongSelect] = useState('');
  const [belongField, setBelongField] = useState('');

  const [belongOption, setBelongOption] = useState([]);
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');

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

  const getSelecOptions = data => {
    if (!data) {
      return;
    }

    const options = [];
    data.map(item => {
      const obj: any = {};
      obj.value = item.systemName;
      obj.text = item.systemName;
      options.push(obj);
    });

    setBelongOption([...options]);
  };

  // select change 事件
  const handleSelectChange = (v, attr) => {
    if (attr === 'belongSelect') {
      setBelongSelect(v);
      tableData.map(item => {
        if (item.systemName === v) {
          setBelongField(item.systemKinds);
        }
      });
    }
  };
  const init = () => {
    setTheName('');
    setBelongSelect('');
    setBelongField('');
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
        arr.push(item.dataName);
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
      return;
    }
    if (belongSelect.trim() === '') {
      return;
    }
    if (!checkSave()) {
      return;
    }
    if (props.isEdit) {
      let request: DataType = {
        ...props.theData,
        dataName: theName.trim(),
        systemPart: belongSelect.trim(),
        systemKinds: belongField.trim(),
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
      let request: DataType = {
        dataId: 'dataId' + new Date().getTime(),
        dataName: theName.trim(),
        systemPart: belongSelect.trim(),
        systemKinds: belongField.trim(),
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
      setTheName(props.theData.dataName);
      setBelongSelect(props.theData.systemPart);
      setBelongField(props.theData.systemKinds);
      setPreName(props.theData.dataName);
    }
  }, [props.theData]);

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        size="m"
        caption={props.isEdit ? '编辑数据' : '新增数据'}
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>
          <Form>
            <Form.Item
              label="数据名称"
              message={nameMessage(theName, '请输入数据名称', '数据名称已存在')}
              status={doSave ? (theName.trim() && checkSave() ? null : 'error') : null}
            >
              <Input
                className="w-330"
                value={theName}
                onChange={(value, context) => {
                  setTheName(value);
                }}
                placeholder="请输入数据名称"
              />
            </Form.Item>
            <Form.Item
              label="所属系统"
              message={doSave ? (belongSelect ? null : '请选择所属系统') : null}
              status={doSave ? (belongSelect ? null : 'error') : null}
            >
              <Select
                value={belongSelect}
                clearable
                matchButtonWidth
                appearance="button"
                placeholder="请选择所属系统"
                options={belongOption}
                onChange={value => {
                  handleSelectChange(value, 'belongSelect');
                }}
                className="w-330"
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
