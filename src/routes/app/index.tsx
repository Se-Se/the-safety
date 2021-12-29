import BreadcrumbPage from '@src/components/crumb';
import TableCommon from '@src/components/tableCommon';
import { useApi } from '@src/services/api/useApi';
import { Button, Card, Layout, message, SearchBox, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import AddModal from './components/addModal';
const { Body, Content } = Layout;
type RecordType = {
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
  theBusinessId?: string;
};
const crumb = [
  { name: '银行', link: '/main' },
  { name: '行业资产', link: '/business' },
  { name: '应用系统', link: '/app' },
];

const AppPage: React.FC = () => {
  const [dataList, setDataList] = useState<RecordType[]>();
  const [allList, setAllList] = useState<RecordType[]>();
  const { getAll, deleteRecord } = useApi('app');
  const val = cookie.load('safetyTrade');
  const [trade, setTrade] = useState(val);

  const [inputOne, setInputOne] = useState('');
  const [inputTwo, setInputTwo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [checkItem, setCheckItem] = useState([]);
  const [inputThree, setInputThree] = useState('');

  // 修改gap表数据
  const handleGapTable = (ids: any) => {
    const { deleteRecord } = useApi('gap');
    deleteRecord(ids)
      .then(() => {})
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };
  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('app', data);
        setDataList([...data]);
        setAllList([...data]);
      })
      .catch(() => {});
  };

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchList();
  }, []);

  const handleModalClose = () => {
    setShowModal(false);
    // setTradeData(null);
  };

  const handleSave = () => {
    fetchList();
  };

  useEffect(() => {
    let arr = filterDataList(allList);
    setDataList([...arr]);
  }, [allList]);
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

  // 搜索框搜索
  const handleInputChange = (value, attr) => {
    attr(value);
  };
  // 筛选数据
  const filterDataList = (arr: any) => {
    if (!arr) {
      return [];
    }
    if (inputOne.trim() === '' && inputTwo.trim() === '' && inputThree.trim() === '') {
      return arr;
    }
    let filterArr = [];
    let inputOneArr = filterItem(arr, 'systemName', inputOne);
    let inputTwoArr = filterItem(arr, 'business', inputTwo);
    let headerSelectArr = filterItem(arr, 'systemKinds', inputThree);
    arr.map(item => {
      if (inputOneArr.indexOf(item) > -1 && inputTwoArr.indexOf(item) > -1 && headerSelectArr.indexOf(item) > -1) {
        filterArr.push(item);
      }
    });
    return filterArr;
  };
  const filterItem = (arr, attr, value) => {
    if (!arr) {
      return [];
    }
    let newArr = [];
    if (value.trim() === '') {
      newArr = [...arr];
    } else {
      arr.map(item => {
        if (item[attr].indexOf(value) > -1) {
          newArr.push(item);
        }
      });
    }
    return newArr;
  };

  useEffect(() => {
    let arr = filterDataList(allList);
    setDataList([...arr]);
  }, [inputOne, inputTwo, inputThree]);

  //表格checkbox被选中
  const handleSelectItems = data => {
    setCheckItem(data);
  };

  // 删除button
  const handleDelete = (): void => {
    if (checkItem.length) {
      deleteRecord(checkItem)
        .then(() => {
          console.log(123);
          handleGapTable(checkItem);
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
    recordKey: 'systemId',
    columns: [
      'systemId',
      'systemName',
      'business',
      'businessKinds',
      'systemKinds',
      'addMen',
      'createdAt',
      'editMen',
      'editedAt',
      'action',
    ],
    right: (
      <>
        <SearchBox
          size="m"
          value={inputOne}
          className="margin-r-30"
          onChange={value => {
            handleInputChange(value, setInputOne);
          }}
          placeholder="请输入系统名称"
        />

        <SearchBox
          size="m"
          value={inputTwo}
          className="margin-r-30"
          onChange={value => {
            handleInputChange(value, setInputTwo);
          }}
          placeholder="请输入所属业务"
        />
        <SearchBox
          size="m"
          value={inputThree}
          className="margin-r-30"
          onChange={value => {
            handleInputChange(value, setInputThree);
          }}
          placeholder="请输入系统类型"
        />
      </>
    ),
    left: (
      <>
        <Button type="primary" onClick={onAdd}>
          新增系统
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
                allData={allList}
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

export default AppPage;
