import BreadcrumbPage from '@src/components/crumb';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Button, Layout, message } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import AddModal from './components/addModal';
import CardListPage from './components/cardList';

const { Body, Content } = Layout;

type ScenesType = {
  scenesId?: string;
  sceneName?: string;
  strategy?: string;
  attackObject?: string;
  loseEffect?: string;
  safetyTrade?: string;
};
const crumb = [
  { name: '银行', link: '/main' },
  { name: '知识展示', link: '/scenes' },
  { name: '攻击场景', link: '/scenes' },
];

const ScenesPage: React.FC = () => {
  const [dataList, setDataList] = useState<ScenesType[]>();
  const { getAll, deleteRecord } = useApi('scenes');
  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState(null);
  const history = useHistory();

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('scenes', data);
        setDataList([...data]);
      })
      .catch(() => {});
  };

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchList();
  }, []);

  // 添加modal关闭的回调
  const handleModalClose = () => {
    setShowModal(false);
  };

  // 保存的回调
  const handleSave = () => {
    fetchList();
  };

  // 点击添加按钮
  const onAdd = () => {
    setIsEdit(false);
    setShowModal(true);
  };

  // 点击编辑按钮
  const handleEdit = data => {
    setModalData({ ...data });
    setIsEdit(true);
    setShowModal(true);
  };

  // 删除button
  const handleDelete = (data): void => {
    deleteRecord([data.scenesId])
      .then(() => {
        message.success({ content: '成功' });
        fetchList();
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };

  return (
    <Body className="clear-tea-h2">
      <Content>
        <Content.Header
          subtitle={
            <>
              <BreadcrumbPage crumbs={crumb} />
            </>
          }
        ></Content.Header>
        <>
          <div className="seces-wrap-outer">
            <AddModal
              close={handleModalClose}
              isEdit={isEdit}
              save={handleSave}
              theData={modalData}
              allData={dataList}
              visible={showModal}
              comName={'scenes'}
              trade={trade}
            />

            <Button type="primary" onClick={onAdd} style={{ margin: '20px 20px 10px 20px' }}>
              新增攻击场景
            </Button>

            <CardListPage
              list={dataList}
              handleDelete={handleDelete}
              onEdit={handleEdit}
              showTrack={value => {
                history.push({
                  pathname: '/tracks',
                  search: `?scene=${value.scenesId}`, // query string
                });
              }}
            ></CardListPage>
          </div>
        </>
      </Content>
    </Body>
  );
};

export default ScenesPage;
