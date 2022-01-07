import BreadcrumbPage from '@src/components/crumb';
import TableCommon from '@src/components/tableCommon';
import { useApi } from '@src/services/api/useApi';
import { Button, Card, Layout, message } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import AddModal from './components/addModal';

const { Body, Content } = Layout;

type FrameType = {
  id?: number;
  areaId?: string;
  areaName?: string;
  belongSystem?: string;
  belongProperty?: string;
  systemAndProperty?: string;
  addMen?: string;
  createdAt?: string | number;
  editMen?: string;
  editedAt?: string | number;
  safetyTrade?: string;
};
const crumb = [
  { name: '银行', link: '/main' },
  { name: '行业资产', link: '/business' },
  { name: '分区管理', link: '/area' },
];

const AreaPage: React.FC = () => {
  const [dataList, setDataList] = useState<FrameType[]>();
  const { getAll, deleteRecord } = useApi('area');
  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [checkItem, setCheckItem] = useState([]);

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('area', data);
        setDataList([...data]);
      })
      .catch(() => {});
  };

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchList();
  }, []);

  // 添加分区modal关闭时的回调
  const handleModalClose = () => {
    setShowModal(false);
  };

  // 添加分区modal保存时的回调
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

  //表格checkbox被选中
  const handleSelectItems = data => {
    setCheckItem(data);
  };

  // 删除button
  const handleDelete = (): void => {
    if (checkItem.length) {
      deleteRecord(checkItem)
        .then(() => {
          message.success({ content: '成功' });
          fetchList();
        })
        .catch(err => {
          message.error({ content: `失败${err}` });
        });
    }
  };

  const propsConfig = {
    list: dataList,
    recordKey: 'areaId',
    columns: ['areaId', 'areaName', 'systemAndProperty', 'addMen', 'createdAt', 'editMen', 'editedAt', 'action'], //列表所需展示的字段
    left: (
      <>
        <Button type="primary" onClick={onAdd}>
          新增分区
        </Button>
        <Button type="weak" onClick={handleDelete}>
          删除
        </Button>
      </>
    ),
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
        <Content.Body className="common-table-content">
          <Card>
            <Card.Body>
              <AddModal
                close={handleModalClose}
                isEdit={isEdit}
                save={handleSave}
                theData={modalData}
                allData={dataList}
                visible={showModal}
                trade={trade}
              />
              <TableCommon {...propsConfig} onEdit={handleEdit} selectItems={handleSelectItems}></TableCommon>
            </Card.Body>
          </Card>
        </Content.Body>
      </Content>
    </Body>
  );
};

export default AreaPage;
