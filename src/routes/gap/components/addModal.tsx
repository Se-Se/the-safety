import { useApi } from '@src/services/api/useApi';
import { Button, Form, Input, message, Modal, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
const { TextArea } = Input;

type GapType = {
  gapId?: string;
  propertyOrSystem?: string;
  business?: string;
  businessKinds?: string;
  part?: string;
  categorys?: string;
  theType?: string;
  editMen?: string;
  editedAt?: string | number;
  actType?: string;
  actName?: string;
  theBug?: string;
  bugName?: string;
  action?: string;
  actionName?: string;
  against?: string;
  againstName?: string;
  safetyTrade?: string;
  theBusinessId?: string;
};
type ItemType = {
  text: string | number;
  value: string | number;
};
type GapOptions = {
  id?: string;
  attackOption?: ItemType;
  bugsOption?: ItemType;
  actionOption?: ItemType;
  againstOption?: ItemType;
  safetyTrade?: string;
};

export default function AddModal(props) {
  const { update } = useApi('gap');
  const [theName, setTheName] = useState('');

  const [attackOption, setAttackOption] = useState([]);
  const [bugsOption, setBugsOption] = useState([]);
  const [actionOption, setActionOption] = useState([]);
  const [againstOption, setAgainstOption] = useState([]);

  const [attacktion, setAttacktion] = useState('');
  const [attacktionDiy, setAttacktionDiy] = useState('');
  const [attackDiyId, setAttackDiyId] = useState('');
  const [theTheBug, setTheTheBug] = useState('');
  const [bugDiy, setBugDiy] = useState('');
  const [bugDiyId, setBugDiyId] = useState('');
  const [action, setAction] = useState('');
  const [actionDiy, setActionDiy] = useState('');
  const [actionDiyId, setActionDiyId] = useState('');
  const [against, setAgainst] = useState('');
  const [againstDiy, setAgainstDiy] = useState('');
  const [againstDiyId, setAgainstDiyId] = useState('');
  const [doSave, setDoSave] = useState(false);
  const [gapOptionId, setGapOptionId] = useState('');

  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);
  // ?????? options ??????
  const getOptions = () => {
    const { getAll } = useApi('gapOptions');
    getAll()
      .then(res => {
        console.log('gapOptions', res);
        setGapOptionId(res[0].id);
        setAttackOption([...res[0].attackOption]);
        setBugsOption([...res[0].bugsOption]);
        setActionOption([...res[0].actionOption]);
        setAgainstOption([...res[0].againstOption]);
      })
      .catch(err => {
        message.error({ content: `??????${err}` });
      });
  };
  useEffect(() => {
    if (props.visible) {
      getOptions();
    }
  }, [props.visible]);

  // ??????options ??????
  const updateOption = () => {
    const { update } = useApi('gapOptions');
    let request: GapOptions = {
      id: gapOptionId,
      attackOption: checkExistOption(attackOption, attacktion, attacktionDiy, attackDiyId),
      bugsOption: checkExistOption(bugsOption, theTheBug, bugDiy, bugDiyId),
      actionOption: checkExistOption(actionOption, action, actionDiy, actionDiyId),
      againstOption: checkExistOption(againstOption, against, againstDiy, againstDiyId),
      safetyTrade: trade,
    };
    update(request)
      .then(() => {})
      .catch(err => {
        message.error({ content: `??????${err}` });
      });
  };

  const checkExistOption = (perArr: any, attr: any, newText: any, val: any) => {
    if (!perArr) {
      return;
    }
    let arr: any = [];
    if (attr !== 'diy') {
      arr = [...perArr];
    } else {
      let textArr = [];
      perArr.map(item => {
        textArr.push(item.text);
      });
      if (textArr.indexOf(newText) < 0) {
        let newArr = [...perArr];
        newArr.splice(perArr.length - 1, 0, { text: newText, value: val });
        arr = [...newArr];
      } else {
        arr = [...perArr];
      }
    }
    return arr;
  };

  const init = () => {
    setTheName('');
    setAttacktion('');
    setTheTheBug('');
    setAction('');
    setAgainst('');
    setAttacktionDiy('');
    setBugDiy('');
    setActionDiy('');
    setAgainstDiy('');
    setAttackDiyId('');
    setBugDiyId('');
    setActionDiyId('');
    setAgainstDiyId('');
    setDoSave(false);
  };
  const close = () => {
    props.close();
    init();
  };

  // ???????????????
  const handleTextAreaChange = (v, attr) => {
    attr(v);
  };

  // ???????????????????????? ??????textarea
  const showTextArea = attr => {
    if (attr === 'diy') {
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (attacktion !== 'diy') {
      setAttacktionDiy('');
    } else {
      const val = 'attacktion' + new Date().getTime();
      setAttackDiyId(val);
    }
  }, [attacktion]);

  useEffect(() => {
    if (theTheBug !== 'diy') {
      setBugDiy('');
    } else {
      const val = 'theTheBug' + new Date().getTime();
      setBugDiyId(val);
    }
  }, [theTheBug]);

  useEffect(() => {
    if (action !== 'diy') {
      setActionDiy('');
    } else {
      const val = 'action' + new Date().getTime();
      setActionDiyId(val);
    }
  }, [action]);

  useEffect(() => {
    if (against !== 'diy') {
      setAgainstDiy('');
    } else {
      const val = 'against' + new Date().getTime();
      setAgainstDiyId(val);
    }
  }, [against]);

  // ????????????
  const checkSave = () => {
    if (!attacktion) {
      return false;
    }
    if (!theTheBug) {
      return false;
    }
    if (!action) {
      return false;
    }
    if (!against) {
      return false;
    }

    if (attacktion === 'diy' && attacktionDiy.trim() === '') {
      return false;
    }
    if (theTheBug === 'diy' && bugDiy.trim() === '') {
      return false;
    }
    if (action === 'diy' && actionDiy.trim() === '') {
      return false;
    }
    if (against === 'diy' && againstDiy.trim() === '') {
      return false;
    }
    return true;
  };

  // ????????????

  const getName = (arr, attr_1, attr_2) => {
    if (!arr.length) {
      return;
    }
    let name = '';
    if (attr_1 === 'diy') {
      name = attr_2;
    } else {
      arr.map((item: any) => {
        if (item.value === attr_1) {
          name = item.text;
        }
      });
    }
    return name;
  };
  //???????????????value???
  const getOptionsId = (attr: string, diyId: string, diyVal, optionsArr: any) => {
    if (attr === 'diy') {
      let theItem = optionsArr.find(item => {
        return item.text === getName(optionsArr, attr, diyVal);
      });
      console.log(theItem);
      if (theItem === undefined) {
        return diyId;
      } else {
        return theItem.value;
      }
    } else {
      return attr;
    }
  };

  const handleSave = () => {
    setDoSave(true);

    if (!checkSave()) {
      return;
    }

    if (props.isEdit) {
      let request: GapType = {
        ...props.theData,
        editMen: 'shanehwang',
        editedAt: +new Date(),
        actType: getOptionsId(attacktion, attackDiyId, attacktionDiy, attackOption),
        actName: getName(attackOption, attacktion, attacktionDiy),
        theBug: getOptionsId(theTheBug, bugDiyId, bugDiy, bugsOption),
        bugName: getName(bugsOption, theTheBug, bugDiy),
        action: getOptionsId(action, actionDiyId, actionDiy, actionOption),
        actionName: getName(actionOption, action, actionDiy),
        against: getOptionsId(against, againstDiyId, againstDiy, againstOption),
        againstName: getName(againstOption, against, againstDiy),
      };
      update(request)
        .then(() => {
          message.success({ content: '??????' });
          updateOption();
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
      setTheName(props.theData.propertyOrSystem);
      setAttacktion(props.theData.actType);
      setTheTheBug(props.theData.theBug);
      setAction(props.theData.action);
      setAgainst(props.theData.against);

      setAttacktionDiy(props.theData.actName || '');
      setBugDiy(props.theData.bugName || '');
      setActionDiy(props.theData.actionName || '');
      setAgainstDiy(props.theData.againstName || '');
    }
  }, [props.theData]);

  return (
    <>
      <Modal
        maskClosable
        visible={props.visible}
        caption="?????????????????????"
        size="m"
        disableCloseIcon={true}
        onClose={close}
      >
        <Modal.Body>
          <Form>
            <Form.Item label="??????/???????????????" style={{ marginBottom: '20px' }}>
              <Input
                readOnly
                className="w-330"
                value={theName}
                onChange={value => {
                  setTheName(value);
                }}
                placeholder="??????/????????????"
              />
            </Form.Item>

            <Form.Item
              label="????????????"
              message={doSave ? (attacktion ? null : '?????????????????????') : null}
              status={doSave ? (attacktion ? null : 'error') : null}
            >
              <Select
                className="w-330"
                matchButtonWidth
                appearance="button"
                options={attackOption}
                value={attacktion}
                onChange={value => handleTextAreaChange(value, setAttacktion)}
                placeholder="?????????????????????"
              />
            </Form.Item>

            {showTextArea(attacktion) && (
              <Form.Item
                message={
                  showTextArea(attacktion) && doSave
                    ? attacktionDiy && attacktionDiy.trim()
                      ? null
                      : '??????????????????'
                    : null
                }
                status={
                  showTextArea(attacktion) && doSave ? (attacktionDiy && attacktionDiy.trim() ? null : 'error') : null
                }
              >
                <TextArea
                  className="w-330"
                  value={attacktionDiy}
                  onChange={value => {
                    handleTextAreaChange(value, setAttacktionDiy);
                  }}
                  placeholder="??????????????????"
                />
              </Form.Item>
            )}

            <Form.Item
              label="??????"
              message={doSave ? (theTheBug ? null : '???????????????') : null}
              status={doSave ? (theTheBug ? null : 'error') : null}
            >
              <Select
                className="w-330"
                appearance="button"
                matchButtonWidth
                options={bugsOption}
                value={theTheBug}
                onChange={value => handleTextAreaChange(value, setTheTheBug)}
                placeholder="???????????????"
              />
            </Form.Item>

            {showTextArea(theTheBug) && (
              <Form.Item
                message={showTextArea(theTheBug) && doSave ? (bugDiy && bugDiy.trim() ? null : '??????????????????') : null}
                status={showTextArea(theTheBug) && doSave ? (bugDiy && bugDiy.trim() ? null : 'error') : null}
              >
                <TextArea
                  style={{ marginTop: '20px' }}
                  className="w-330"
                  value={bugDiy}
                  onChange={value => {
                    handleTextAreaChange(value, setBugDiy);
                  }}
                  placeholder="????????????"
                />
              </Form.Item>
            )}

            <Form.Item
              label="????????????"
              message={doSave ? (action ? null : '?????????????????????') : null}
              status={doSave ? (action ? null : 'error') : null}
            >
              <Select
                className="w-330"
                appearance="button"
                matchButtonWidth
                options={actionOption}
                value={action}
                onChange={value => handleTextAreaChange(value, setAction)}
                placeholder="?????????????????????"
              />
            </Form.Item>

            {showTextArea(action) && (
              <Form.Item
                message={
                  showTextArea(action) && doSave ? (actionDiy && actionDiy.trim() ? null : '??????????????????') : null
                }
                status={showTextArea(action) && doSave ? (actionDiy && actionDiy.trim() ? null : 'error') : null}
              >
                <TextArea
                  style={{ marginTop: '20px' }}
                  className="w-330"
                  value={actionDiy}
                  onChange={value => {
                    handleTextAreaChange(value, setActionDiy);
                  }}
                  placeholder="??????????????????"
                />
              </Form.Item>
            )}

            <Form.Item
              label="????????????"
              message={doSave ? (against ? null : '?????????????????????') : null}
              status={doSave ? (against ? null : 'error') : null}
            >
              <Select
                className="w-330"
                appearance="button"
                matchButtonWidth
                options={againstOption}
                value={against}
                onChange={value => handleTextAreaChange(value, setAgainst)}
                placeholder="?????????????????????"
              />
            </Form.Item>

            {showTextArea(against) && (
              <Form.Item
                message={
                  showTextArea(against) && doSave ? (againstDiy && againstDiy.trim() ? null : '??????????????????') : null
                }
                status={showTextArea(against) && doSave ? (againstDiy && againstDiy.trim() ? null : 'error') : null}
              >
                <TextArea
                  style={{ marginTop: '20px' }}
                  className="w-330"
                  value={againstDiy}
                  onChange={value => {
                    handleTextAreaChange(value, setAgainstDiy);
                  }}
                  placeholder="??????????????????"
                />
              </Form.Item>
            )}
          </Form>
        </Modal.Body>
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
