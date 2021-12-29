import { tradeOptions } from '@src/components/tableCommon/globalData';
import MainModal from '@src/routes/main/components/addModal';
import { useApi } from '@src/services/api/useApi';
import { initTheDbData } from '@src/utils/util';
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
  const { getAll, deleteRecord, login, getByIndex } = useApi('trade');
  const [showModal, setShowModal] = useState(false);
  const [dataList, setDataList] = useState<RecordType[]>();
  const [tradeData, setTradeData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [allData, setAllData] = useState([]);
  const history = useHistory();

  const handleLogin = () => {
    login({ userName: 'beyond', password: '123456' })
      .then((res: any) => {
        console.log(res);
        cookie.save('sec_token', res.token);
      })
      .catch(err => {
        console.log(err);
      });
  };

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

  const formatterList = arr => {
    if (!arr.length) {
      return [];
    }
    let vals = tradeOptions.map(item => {
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

  useEffect(() => {
    fetchList();
  }, []);

  const onAdd = () => {
    setIsEdit(false);
    setShowModal(true);
  };
  const handleModalClose = () => {
    setShowModal(false);
    setTradeData(null);
  };
  const handleSave = () => {
    fetchList();
  };
  const handleEdit = (data: any) => {
    setTradeData(data);
    setShowModal(true);
    setIsEdit(true);
  };
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

  const choseTrade = (data: any) => {
    cookie.save('safetyTrade', data);
    history.push('/business');
  };
  const addData = () => {
    initTheDbData('dashboard');
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
              <Button type="primary" onClick={handleLogin}>
                登录
              </Button>
              {/* <Button type="primary" onClick={addData}>
                添加数据
              </Button> */}
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
