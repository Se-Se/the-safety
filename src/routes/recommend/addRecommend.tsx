import EditorBraft from '@src/components/braft';
import { AREA_OPTIONS, IMG_NAMES, LEVEL_OPTIONS } from '@src/components/tableCommon/globalData';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import {
  Bubble,
  Button,
  Card,
  Form,
  Icon,
  Input,
  Justify,
  Layout,
  message,
  Modal,
  Select,
  Table,
} from '@tencent/tea-component';
import { pinyin } from 'pinyin-pro';
import React, { useEffect, useRef, useState } from 'react';
import cookie from 'react-cookies';

const { Body, Content } = Layout;

type RecommendType = {
  recommendId?: string;
  theArea?: string;
  areaName?: string;
  category?: string;
  picName?: string;
  dangerLevel?: string;
  theTitle?: string;
  editHtml?: string;
  safetyTrade?: string;
  createdAt?: string | number;
};

const AddRecommendPage: React.FC = () => {
  const { getByIndex } = useApi('recommend');
  const [isAdd, setIsAdd] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const [category, setCategory] = useState('');
  const [dangerLevel, setDangerLevel] = useState('');
  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);

  const [theTitle, setTheTitle] = useState('');
  const [theRecommendId, setTheRecommendId] = useState('');
  const [theArea, setTheArea] = useState('');

  const [doSave, setDoSave] = useState(false);
  const [picV, setPicV] = useState(false);
  const [picName, setPicName] = useState('');
  const [choseItem, setChoseItem] = useState(null);
  const [theClick, setTheClick] = useState('');
  const [saveFlag, setSaveFlag] = useState(false);

  // 文本编辑器默认初始话内容
  const editBaseData =
    '<p><strong>背景：</strong></p><p></p><p></p><p></p><p></p><p><strong>过程描述：</strong></p><p></p><p></p><p></p><p></p><p></p><p><strong>改进建议：</strong></p><p></p><p></p><p></p><p></p><p></p><p></p>';
  const [editData, setEditData] = useState(editBaseData);

  const history = useHistory();
  const braftRef = useRef(null);

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    if (history.location.pathname === '/recommend/add') {
      setIsAdd(true);
      setCanEdit(true);
    } else {
      setCanEdit(false);
      const theId = history.location.pathname.substring(11).trim().toString();
      setTheRecommendId(theId);

      getByIndex(theId).then(res => {
        initData(res);
      });
      setIsAdd(false);
    }
  }, []);

  // 初始话数据
  const initData = (data: any) => {
    setTheArea(data.theArea);
    setCategory(data.category);
    setDangerLevel(data.dangerLevel);
    setTheTitle(data.theTitle);
    setEditData(data.editHtml);
    setPicName(data.picName);
    setDoSave(false);
  };

  // 获取select选择的名称
  const getAreaName = () => {
    let name = '';
    AREA_OPTIONS.map(item => {
      if (item.value === theArea) {
        name = item.text;
      }
    });
    return name;
  };
  // select 选择
  const handleValueChange = (v: any, setAttr: any) => {
    setAttr(v);
  };

  // 返回按钮
  const goback = () => {
    history.push('/recommend');
  };

  // 提交验证
  const checkSave = () => {
    if (theArea.trim() === '') {
      return false;
    } else if (category.trim() === '') {
      return false;
    } else if (dangerLevel.trim() === '') {
      return false;
    } else if (picName.trim() === '') {
      return false;
    } else if (theTitle.trim() === '') {
      return false;
    }
    return true;
  };

  // editData, doSave, saveFlag 变化时执行的回调
  useEffect(() => {
    if (editData && doSave) {
      handleSave();
    }
  }, [editData, doSave, saveFlag]);

  // editData 保存后调添加 跟新方法
  const handleSave = () => {
    if (!checkSave()) {
      return;
    }
    const { add, update } = useApi('recommend');
    const request: RecommendType = {
      recommendId: 'recommend_id' + new Date().getTime(),
      theArea: theArea,
      areaName: getAreaName(),
      category: category.trim(),
      dangerLevel: dangerLevel,
      theTitle: theTitle.trim(),
      picName: picName,
      editHtml: editData,
      safetyTrade: trade,
      createdAt: +new Date(),
    };
    if (isAdd) {
      add(request)
        .then(() => {
          message.success({ content: '成功' });
          history.push('/recommend');
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    } else {
      request.recommendId = theRecommendId;
      update(request)
        .then(() => {
          message.success({ content: '成功' });
          history.push('/recommend');
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    }
  };
  // 点击保存按钮
  const save = () => {
    setSaveFlag(!saveFlag);
    setDoSave(true);

    handleEditSave(braftRef.current.getValue().toHTML());
  };

  // 点击删除
  const handleDelete = () => {
    const { deleteRecord } = useApi('recommend');
    deleteRecord([theRecommendId])
      .then(() => {
        message.success({ content: '成功' });
        history.push('/recommend');
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };
  // 点击编辑按钮
  const edit = () => {
    setCanEdit(true);
  };

  // 文本编辑器 cirl + s 保存的回调
  const handleEditSave = (data: any) => {
    console.log(data, 12321);
    setEditData(data);
  };
  // 点击打卡添加图片
  const openPic = () => {
    setPicV(true);
    setTheClick('');
  };
  // 添加图片modal关闭的回调
  const closePic = () => {
    setPicV(false);
    setTheClick('');
    setChoseItem(null);
  };

  // 获取icon fn
  const getIcon = type => {
    if (type) {
      const typePinyin = pinyin(type, { toneType: 'none', type: 'array' }).join('').toLowerCase();
      return require('@src/image/' + typePinyin + '.svg');
    } else {
      return '';
    }
  };
  // 点击svgicon的fn
  const handleSvgClick = (data: string, index: number) => {
    console.log(data);
    setTheClick(data);
    setChoseItem(index);
  };

  // 保存图片的回调
  const handleSavePic = () => {
    setPicName(theClick);
    setPicV(false);
  };

  return (
    <Layout>
      <Body>
        <Content>
          <Content.Header title="改进建议"></Content.Header>
          <Content.Body className="common-table-content">
            <Table.ActionPanel>
              <Justify
                left={
                  <>
                    <Button className="margin-r-30" type="weak" onClick={goback}>
                      返回
                    </Button>
                    <Button type="primary" onClick={save}>
                      保存
                    </Button>
                    {isAdd ? null : (
                      <Button type="primary" onClick={handleDelete}>
                        删除
                      </Button>
                    )}
                  </>
                }
                right={
                  isAdd ? null : (
                    <Button type="primary" onClick={edit}>
                      编辑
                    </Button>
                  )
                }
              />
            </Table.ActionPanel>
            <Card>
              <Card.Body>
                <Modal visible={picV} caption="选择分类图片" disableCloseIcon maskClosable onClose={closePic}>
                  <Modal.Body>
                    <Card>
                      <Card.Body>
                        <div className="recommend-svg-container">
                          {(IMG_NAMES || []).map((item, index) => {
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
                <Form className="add-recommend">
                  <Form.Item
                    label="所属分区"
                    message={doSave ? (theArea ? null : '请选择所属分区') : null}
                    status={doSave ? (theArea ? null : 'error') : null}
                  >
                    <Select
                      disabled={!canEdit}
                      appearance="button"
                      options={AREA_OPTIONS}
                      value={theArea}
                      onChange={value => handleValueChange(value, setTheArea)}
                      placeholder="请选择所属分区"
                      className="w-330"
                      matchButtonWidth
                    />
                  </Form.Item>

                  <Form.Item
                    label="所属分类"
                    message={doSave ? (category ? null : '请输入所属分类') : null}
                    status={doSave ? (category ? null : 'error') : null}
                  >
                    <Input
                      disabled={!canEdit}
                      className="w-330"
                      value={category}
                      onChange={value => {
                        setCategory(value);
                      }}
                      placeholder="请输入所属分类"
                    />
                  </Form.Item>
                  <Form.Item
                    label="选择图标"
                    message={doSave || picName ? (picName ? '已选择图标' : '请选择图标') : null}
                    status={doSave || picName ? (picName ? 'success' : 'error') : null}
                  >
                    <Bubble content="添加图标">
                      <Button type="weak" onClick={openPic} disabled={!canEdit}>
                        <Icon type="plus" />
                      </Button>
                    </Bubble>
                    {picName ? (
                      <div
                        className="pic-content"
                        style={{ position: 'absolute', left: '90px', display: 'inline-block' }}
                      >
                        <img src={getIcon(picName)} className="part-icon" style={{ width: '50px', height: '30px' }} />
                      </div>
                    ) : null}
                  </Form.Item>
                  <Form.Item
                    label="风险级别"
                    message={doSave ? (dangerLevel ? null : '请选择风险级别') : null}
                    status={doSave ? (dangerLevel ? null : 'error') : null}
                  >
                    <Select
                      disabled={!canEdit}
                      appearance="button"
                      options={LEVEL_OPTIONS}
                      value={dangerLevel}
                      onChange={value => handleValueChange(value, setDangerLevel)}
                      placeholder="请选择风险级别"
                      className="w-330"
                      matchButtonWidth
                    />
                  </Form.Item>
                </Form>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header></Card.Header>
              <Card.Body title="请输入标题">
                <Form className="add-remcommend-title">
                  <Form.Item
                    message={doSave ? (theTitle ? null : '请输入标题') : null}
                    status={doSave ? (theTitle ? null : 'error') : null}
                  >
                    <Input
                      className="w-330"
                      disabled={!canEdit}
                      value={theTitle}
                      onChange={value => {
                        setTheTitle(value);
                      }}
                      placeholder="请输入标题"
                    />
                  </Form.Item>
                </Form>
              </Card.Body>
              <EditorBraft ref={braftRef} isEdit={!canEdit} editData={editData} />
            </Card>
          </Content.Body>
        </Content>
      </Body>
    </Layout>
  );
};

export default AddRecommendPage;
