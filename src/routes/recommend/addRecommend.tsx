import EditorBraft from '@src/components/braft';
import { areaOptions, levelOptions } from '@src/components/tableCommon/globalData';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Button, Card, Form, Input, Justify, Layout, message, Select, Table } from '@tencent/tea-component';
import React, { useEffect, useRef, useState } from 'react';
import cookie from 'react-cookies';
import AddPic from '@src/components/formItemAddPic';

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
  const [picName, setPicName] = useState('');

  const editBaseData =
    '<p><strong>背景：</strong></p><p></p><p></p><p></p><p></p><p><strong>过程描述：</strong></p><p></p><p></p><p></p><p></p><p></p><p><strong>改进建议：</strong></p><p></p><p></p><p></p><p></p><p></p><p></p>';
  const [editData, setEditData] = useState(editBaseData);

  const history = useHistory();
  const braftRef = useRef(null);
  const [saveFlag, setSaveFlag] = useState(false);

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
    areaOptions.map(item => {
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
    }
    return true;
  };

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
    setDoSave(true);
    setSaveFlag(!saveFlag);
    console.log(doSave, editData);

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
    setEditData(data);
  };

  const handleAddPicSave = (data: any) => {
    setPicName(data);
  };
  const addPicConfig = {
    canEdit: canEdit,
    picName: picName,
    doSave: doSave,
    save: (data: any) => handleAddPicSave(data),
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
                <Form className="add-recommend">
                  <Form.Item
                    label="所属分区"
                    message={doSave ? (theArea ? null : '请选择所属分区') : null}
                    status={doSave ? (theArea ? null : 'error') : null}
                  >
                    <Select
                      disabled={!canEdit}
                      appearance="button"
                      options={areaOptions}
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
                  <AddPic {...addPicConfig}></AddPic>
                  <Form.Item
                    label="风险级别"
                    message={doSave ? (dangerLevel ? null : '请选择风险级别') : null}
                    status={doSave ? (dangerLevel ? null : 'error') : null}
                  >
                    <Select
                      disabled={!canEdit}
                      appearance="button"
                      options={levelOptions}
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
