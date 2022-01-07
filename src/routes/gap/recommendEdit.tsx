import EditorBraft from '@src/components/braft';
import BreadcrumbPage from '@src/components/crumb';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Button, Card, Layout, message } from '@tencent/tea-component';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const { Body, Content } = Layout;
const crumb = [
  { name: '攻击手法与漏洞', link: '/gap' },
  { name: '改善建议', link: '/gap/:id' },
];
const RecommendEdit: React.FC = () => {
  const { update, getAll } = useApi('gap');
  const history = useHistory();
  const { gapId }: any = useParams();
  const [editData, setEditData] = useState('');
  const [gapData, setGapData] = useState({});
  const [doSave, setDoSave] = useState(false);
  const braftRef = useRef(null);
  const [canEdit, setCanEdit] = useState(false);

  // 获取页面数据
  const fetchData = () => {
    getAll().then(res => {
      filterData(res);
    });
  };

  // 筛选数据
  const filterData = arr => {
    if (!arr.length) {
      return;
    }
    arr.map(item => {
      if (item.gapId === gapId) {
        setGapData({ ...item });
        setEditData(item.editData);
      }
    });
  };

  // 页面初次加载时执行
  useEffect(() => {
    fetchData();
    checkFrom();
  }, []);

  // editData，doSave更新时回调
  useEffect(() => {
    if (editData && doSave) {
      handleSave();
    }
  }, [editData, doSave]);

  // 判断进入页面的上一个页面fn
  const checkFrom = () => {
    if (history.location.state && history.location.state.from === 'gapList') {
      setCanEdit(true);
    } else {
      setCanEdit(false);
    }
  };

  // 保存的fn
  const handleSave = () => {
    update({ ...gapData, editData: editData })
      .then(() => {
        message.success({ content: '成功' });
        history.push('/gap');
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };
  // 编辑器执行保存时的fn
  const save = () => {
    setDoSave(true);
    setEditData(braftRef.current.getValue().toHTML());
  };
  return (
    <Body>
      <Content>
        <Content.Header
          subtitle={
            <>
              <BreadcrumbPage crumbs={crumb} notChange={true} />
            </>
          }
          operation={
            canEdit ? (
              <Button type="primary" onClick={save}>
                保存
              </Button>
            ) : null
          }
        ></Content.Header>
        <Content.Body className="common-table-content">
          <Card>
            <Card.Header></Card.Header>
            <Card.Body title="请输入改善建议" className={canEdit ? '' : 'sec-braft'}>
              <EditorBraft editData={editData} isEdit={!canEdit} ref={braftRef}></EditorBraft>
            </Card.Body>
          </Card>
        </Content.Body>
      </Content>
    </Body>
  );
};
export default RecommendEdit;
