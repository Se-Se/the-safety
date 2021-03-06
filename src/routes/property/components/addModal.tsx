import { useApi } from '@src/services/api/useApi';
import { filterTheTrade } from '@src/utils/util';
import { Button, Cascader, Form, Input, message, Modal, Select, Bubble } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import { propertyKindsOptions } from '@src/components/tableCommon/globalData';
import AddPic from '@src/components/formItemAddPic';

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
  picName?: string;
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
  picName?: string;
};

export default function AddModal(props) {
  const { add, update } = useApi(props.comName);
  const { getAll } = useApi('business');
  const [tableData, setTableData] = useState<Business[]>();

  const [theName, setTheName] = useState('');
  const [belongSelect, setBelongSelect] = useState('');
  const [belongFieldA, setBelongFieldA] = useState('');
  const [belongFieldB, setBelongFieldB] = useState('');

  const [belongOption, setBelongOption] = useState([]);
  const [cascaderProperty, setCascaderProperty] = useState([]);
  const [theBusinessId, setTheBusinessId] = useState('');
  const [doSave, setDoSave] = useState(false);
  const [preName, setPreName] = useState('');
  const [propertyKind, setPropertyKind] = useState('');
  const [picName, setPicName] = useState('');

  // ??????gap?????????
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
      add(request, true)
        .then(() => {
          message.success({ content: '??????' });
        })
        .catch(err => {
          message.error({ content: `??????${err}` });
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
              update(request, true)
                .then(() => {
                  message.success({ content: '??????' });
                })
                .catch(err => {
                  message.error({ content: `??????${err}` });
                });
            }
          });
        }
      });
    }
  };
  // ????????????
  const fetchList = () => {
    getAll()
      .then(data => {
        const arr = filterTheTrade(data, 'safetyTrade', props.trade);
        getSelecOptions([...arr]);
        setTableData([...arr]);
      })
      .catch(() => {});
  };
  // ????????????????????????
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

    setBelongOption([...theNameArr]);
  };

  // select change ??????
  const handleSelectChange = (v, attr) => {
    if (attr === 'belongSelect') {
      setBelongSelect(v);
      tableData.map(item => {
        if (item.businessName === v) {
          setBelongFieldA(item.businessKinds);
          setBelongFieldB(item.part);
        }
      });
    } else {
      setPropertyKind(v);
    }
  };
  // ??????????????????
  const handleCascaderChange = (v): void => {
    setCascaderProperty(v);
  };
  const init = () => {
    setTheName('');
    setBelongSelect('');
    setBelongFieldA('');
    setBelongFieldB('');
    setCascaderProperty([]);
    setTheBusinessId('');
    setDoSave(false);
    setPreName('');
    setPicName('');
  };
  const close = () => {
    props.close();
    init();
  };
  // ????????????
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

  // ?????????????????????????????????
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
    if (picName.trim() === '') {
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
        picName: picName,
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
          message.error({ content: `??????${err}` });
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
        picName: picName,
      };

      add(request)
        .then(() => {
          handleGapTable('add', request);
          props.close();
          props.save();
          init();
        })
        .catch(err => {
          message.error({ content: `??????${err}` });
        });
    }
  };
  useEffect(() => {
    if (props.theData && props.isEdit) {
      setTheName(props.theData.propertyName);
      setBelongSelect(props.theData.business);
      setBelongFieldA(props.theData.businessKinds);
      setBelongFieldB(props.theData.part);
      setCascaderProperty(props.theData.propertyKind.split('/'));
      setTheBusinessId(props.theData.theBusinessId);
      setPreName(props.theData.propertyName);
      setPicName(props.theData.picName || '');
    }
  }, [props.theData]);

  const handleAddPicSave = (data: any) => {
    console.log('save', data);
    setPicName(data);
  };

  const addPicConfig = {
    canEdit: true,
    picName: picName,
    doSave: doSave,
    save: (data: any) => handleAddPicSave(data),
  };
  const templageFn = () => {
    return (
      <>
        <Form>
          <Form.Item
            label="????????????"
            message={nameMessage(theName, '?????????????????????', '?????????????????????')}
            status={doSave ? (theName.trim() && checkSave() ? null : 'error') : null}
          >
            <Input
              className="w-330"
              value={theName}
              onChange={(value, context) => {
                setTheName(value);
              }}
              placeholder="?????????????????????"
            />
          </Form.Item>
          <Form.Item
            label="????????????"
            message={doSave ? (belongSelect ? null : '?????????????????????') : null}
            status={doSave ? (belongSelect ? null : 'error') : null}
          >
            <Select
              value={belongSelect}
              clearable
              matchButtonWidth
              appearance="button"
              placeholder="?????????????????????"
              options={belongOption}
              onChange={value => {
                handleSelectChange(value, 'belongSelect');
              }}
              className="w-330"
            />
          </Form.Item>
          <Form.Item
            label={
              <Select
                value={propertyKind}
                matchButtonWidth
                appearance="button"
                placeholder="????????????"
                options={propertyKindsOptions}
                onChange={value => {
                  handleSelectChange(value, 'propertyKind');
                }}
                // className="w-330"
                size="s"
              />
            }
            message={doSave ? (cascaderProperty.length !== 0 ? null : '?????????????????????') : null}
            status={doSave ? (cascaderProperty.length !== 0 ? null : 'error') : null}
          >
            <Cascader
              className="w-330"
              value={cascaderProperty}
              clearable
              type="menu"
              placeholder="?????????????????????"
              data={props.propertyOption}
              multiple={false}
              onChange={value => {
                handleCascaderChange(value);
              }}
            />
          </Form.Item>
          <AddPic {...addPicConfig}></AddPic>
        </Form>
      </>
    );
  };

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        caption={props.isEdit ? '????????????' : '????????????'}
        size="m"
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>{templageFn()}</Modal.Body>
        <Modal.Footer>
          <Button type="primary" onClick={handleSave}>
            ??????
          </Button>
          <Button type="weak" onClick={close}>
            ??????
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
