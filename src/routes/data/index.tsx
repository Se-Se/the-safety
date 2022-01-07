import BreadcrumbPage from '@src/components/crumb';
import TableCommon from '@src/components/tableCommon';
import { useApi } from '@src/services/api/useApi';
import { Button, Card, Layout, message, SearchBox } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import AddModal from './components/addModal';

const { Body, Content } = Layout;

type DataType = {
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
const crumb = [
  { name: '银行', link: '/main' },
  { name: '行业资产', link: '/business' },
  { name: '业务数据', link: '/data' },
];

const DataPage: React.FC = () => {
  const [dataList, setDataList] = useState<DataType[]>();
  const [allList, setAllList] = useState<DataType[]>();
  const { getAll, deleteRecord } = useApi('data');
  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);

  const [inputOne, setInputOne] = useState('');
  const [inputTwo, setInputTwo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [checkItem, setCheckItem] = useState([]);

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('data', data);
        setDataList([...data]);
        setAllList([...data]);
      })
      .catch(() => {});
  };

  // 首次打开页面加载 第二个参数需要是空数组保证只加载一次
  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    let arr = filterDataList(allList);
    setDataList([...arr]);
  }, [allList]);
  const handleModalClose = () => {
    setShowModal(false);
  };

  // 保存按钮的回调
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
  // 搜索框搜索
  const handleInputChange = (value, attr) => {
    if (attr === 'inputOne') {
      setInputOne(value);
    }
    if (attr === 'inputTwo') {
      setInputTwo(value);
    }
  };
  // 筛选数据
  const filterDataList = (arr: any) => {
    if (!arr) {
      return [];
    }
    if (inputOne.trim() === '' && inputTwo.trim() === '') {
      return arr;
    }
    let filterArr = [];
    let inputOneArr = filterItem(arr, 'dataName', inputOne);
    let inputTwoArr = filterItem(arr, 'systemPart', inputTwo);

    arr.map(item => {
      if (inputOneArr.indexOf(item) > -1 && inputTwoArr.indexOf(item) > -1) {
        filterArr.push(item);
      }
    });
    return filterArr;
  };

  // 筛选数据的fn
  const filterItem = (arr, attr, value) => {
    if (!arr) {
      return [];
    }
    let newArr = [];
    if (value.trim() === '' || value.trim() === 'all') {
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

  // 根据输入搜索的内容筛选数据
  useEffect(() => {
    let arr = filterDataList(allList);
    setDataList([...arr]);
  }, [inputOne, inputTwo]);

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
    recordKey: 'dataId',
    columns: [
      'dataId',
      'dataName',
      'systemPart',
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
          value={inputOne}
          className="margin-r-30"
          onChange={value => {
            handleInputChange(value, 'inputOne');
          }}
          placeholder="请输入数据名称"
        />

        <SearchBox
          value={inputTwo}
          onChange={value => {
            handleInputChange(value, 'inputTwo');
          }}
          placeholder="请输入所属系统"
        />
      </>
    ),
    left: (
      <>
        <Button type="primary" onClick={onAdd}>
          新增数据
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

export default DataPage;
