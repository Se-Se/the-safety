import { TRADE_OPTIONS } from '@src/components/tableCommon/globalData';
import MainModal from '@src/routes/main/components/addModal';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Button, Layout, message } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import cookie from 'react-cookies';
import ManiItem from './components/mainItem';

const { Body, Content } = Layout;

type RecordType = {
  id?: number;
  tradeN?: string;
  description?: string;
  createdAt?: string | number;
};

const MainPage: React.FC = () => {
  const { getAll, deleteRecord, getByIndex } = useApi('trade');
  const [showModal, setShowModal] = useState(false);
  const [dataList, setDataList] = useState<RecordType[]>();
  const [tradeData, setTradeData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [allData, setAllData] = useState([]);
  const history = useHistory();

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        setAllData([...data]);
        console.log('main', data);
        let arr = formatterList(data);
        setDataList([...arr]);
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };

  // 把数据格式话成页面所需的形式fn
  const formatterList = arr => {
    if (!arr.length) {
      return [];
    }
    let vals = TRADE_OPTIONS.map(item => {
      return item.value;
    });
    let result = [];
    vals.map(item => {
      let obj: any = {
        theTrade: '',
        tradArr: [],
      };
      arr.map(aItem => {
        if (item === aItem.theTrade) {
          obj.theTrade = aItem.theTrade;
          obj.tradArr.push(aItem);
        }
      });
      if (obj.theTrade) {
        result.push({ ...obj });
      }
    });
    return result;
  };

  // 页面初次载入时的回调
  useEffect(() => {
    fetchList();
  }, []);

  // 点击添加行业按钮fn
  const onAdd = () => {
    setIsEdit(false);
    setShowModal(true);
  };
  // 关闭添加行业modal的回调
  const handleModalClose = () => {
    setShowModal(false);
    setTradeData(null);
  };
  // 点击保存btn的回调
  const handleSave = () => {
    fetchList();
  };
  // 点击编辑btn的执行fn
  const handleEdit = (data: any) => {
    setTradeData(data);
    setShowModal(true);
    setIsEdit(true);
  };
  // 关闭modal页面的回调
  const handleClose = async data => {
    let theSafetyTrade = '';
    await getByIndex(data.id).then((res: any) => {
      theSafetyTrade = res.theTrade + '/' + res.name;
    });
    deleteRecord([data.id])
      .then(() => {
        deleteOptions(theSafetyTrade);
        message.success({ content: '成功' });
        fetchList();
      })
      .catch(err => {
        message.error({ content: `失败${err}` });
      });
  };
  // 删除 行业的 gapOptions数据
  const deleteOptions = (data: any) => {
    const { getAll, deleteRecord } = useApi('gapOptions');
    getAll().then(res => {
      if (res.length) {
        let theId = res.filter(item => {
          return item.safetyTrade === data;
        })[0]?.id;
        deleteRecord([theId]).catch(() => {});
      }
    });
  };

  // 点击行业卡片的回调
  const choseTrade = (data: any) => {
    cookie.save('safetyTrade', data);
    history.push('/business');
  };

  return (
    <Body>
      <Content>
        <Content.Header
          title="请选择相关行业"
          subtitle={
            <>
              <Button type="primary" onClick={onAdd}>
                新增行业
              </Button>
            </>
          }
        ></Content.Header>
        <Content.Body className="main-content-body">
          <MainModal
            close={handleModalClose}
            isEdit={isEdit}
            save={handleSave}
            theTrade={tradeData}
            allData={allData}
            visible={showModal}
          />
          <div>
            <div className="main-card-body">
              {(dataList || []).map((item: any, index: any) => {
                return (
                  <div key={index}>
                    <div className="main-trade-name">{item.theTrade}</div>
                    <div className="trade-group">
                      {item.tradArr.map(aItem => {
                        return (
                          <div key={aItem.name}>
                            <ManiItem
                              name={aItem.name}
                              description={aItem.description}
                              imgClass={aItem.imgClass}
                              theTrade={aItem.theTrade}
                              edit={() => {
                                handleEdit(aItem);
                              }}
                              close={() => {
                                handleClose(aItem);
                              }}
                              itemClick={choseTrade}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Content.Body>
        <Content.Footer></Content.Footer>
      </Content>
    </Body>
  );
};
export default MainPage;
