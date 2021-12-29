import BreadcrumbPage from '@src/components/crumb';
import TableCommon from '@src/components/tableCommon';
import { systemOrPropertyOption } from '@src/components/tableCommon/globalData';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Card, Layout, message, SearchBox, Select } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import AddModal from './components/addModal';

const { Body, Content } = Layout;

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
  theBug?: string;
  safetyTrade?: string;
};
const crumb = [
  { name: '银行', link: '/main' },
  { name: '知识展示', link: '/scenes' },
  { name: '攻击手法与漏洞', link: '/gap' },
];

const GapList: React.FC = () => {
  const history = useHistory();
  const [dataList, setDataList] = useState<GapType[]>();
  const [allList, setAllList] = useState<GapType[]>();
  const { getAll } = useApi('gap');
  const val = cookie.load('safetyTrade');
  const [trade] = useState(val);

  const [inputOne, setInputOne] = useState('');
  const [inputTwo, setInputTwo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [headerSelect, setHeaderSelect] = useState('all');

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('gap', data);
        setDataList([...data]);
        setAllList([...data]);
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
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

  const handleSave = () => {
    fetchList();
  };

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
    if (inputOne.trim() === '' && inputTwo.trim() === '' && headerSelect === 'all') {
      return arr;
    }
    let filterArr = [];
    let inputOneArr = filterItem(arr, 'propertyOrSystem', inputOne);
    let inputTwoArr = filterItem(arr, 'part', inputTwo);
    let headerSelectArr = filterItem(arr, 'categorys', headerSelect);
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
  // 系统类型选择
  const handleSelectChange = (v): void => {
    setHeaderSelect(v);
  };

  // 改善建议编辑器
  const handleRecommend = data => {
    // history.push(`/gap/${data.gapId}`);
    history.push({ pathname: `/gap/${data.gapId}`, state: { from: 'gapList' } });
  };
  useEffect(() => {
    let arr = filterDataList(allList);
    setDataList([...arr]);
  }, [inputOne, inputTwo, headerSelect]);

  const propsConfig = {
    list: dataList,
    recordKey: 'gapId',
    notSelectable: true,
    columns: [
      'gapId',
      'propertyOrSystem',
      'business',
      'businessKinds',
      'part',
      'categorys',
      'theType',
      'lastEditMan',
      'editedAt',
      'actName',
      'bugName',
      'actionName',
      'againstName',
      'recommendAction',
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
          placeholder="请输入系统/资产名"
        />

        <SearchBox
          value={inputTwo}
          className="margin-r-30"
          onChange={value => {
            handleInputChange(value, 'inputTwo');
          }}
          placeholder="请输入所属部门"
        />

        <Select
          size="m"
          matchButtonWidth
          appearance="button"
          value={headerSelect}
          placeholder="分类"
          onChange={v => {
            handleSelectChange(v);
          }}
          options={systemOrPropertyOption}
        />
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
              <TableCommon {...propsConfig} recommendEdit={handleRecommend} onEdit={handleEdit}></TableCommon>
            </Card.Body>
          </Card>
        </Content.Body>
      </Content>
    </Body>
  );
};

export default GapList;
