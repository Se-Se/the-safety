import { areaOptions } from '@src/components/tableCommon/globalData';
import { useApi } from '@src/services/api/useApi';
import { useHistory } from '@tea/app';
import { Button, Layout } from '@tencent/tea-component';
import React, { useEffect, useState } from 'react';
import RecommendItem from './components/recommendItem';
const { Body, Content } = Layout;
const RecommendsPage: React.FC = () => {
  const [dataList, setDataList] = useState([]);
  const { getAll } = useApi('recommend');
  const history = useHistory();
  const [hArr, setHArr] = useState([]);

  // 拉取数据
  const fetchList = () => {
    getAll()
      .then(data => {
        console.log('recommend', data);
        let newArr = formatterData(data);
        setDataList([...newArr]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchList();
  }, []);

  const formatterData = (data: any) => {
    if (!data) {
      return;
    }
    let areaArr = [];
    data.map(item => {
      if (areaArr.indexOf(item.areaName) < 0) {
        areaArr.push(item.areaName);
      }
    });
    let newArr = [];
    areaArr.map(item => {
      let obj: any = {};
      obj.theArea = item;

      let categorys = [];
      data.map(dItem => {
        if (dItem.areaName === item) {
          if (categorys.indexOf(dItem.category) < 0) {
            categorys.push(dItem.category);
          }
        }
      });
      let recommends = [];
      categorys.map(cItem => {
        let cObj: any = {};
        cObj.category = cItem;
        let arr = [];
        data.map(dItem => {
          if (dItem.areaName === item && dItem.category === cItem) {
            arr.push(dItem);
          }
        });
        cObj.recommends = [...arr];
        const lastLen = cObj.recommends.length - 1;
        cObj.picName = cObj.recommends[lastLen].picName;
        recommends.push({ ...cObj });
      });
      obj.categorys = [...recommends];
      newArr.push({ ...obj });
    });

    let orderArr = [];
    areaOptions.map(item => {
      newArr.map(nItem => {
        if (item.text === nItem.theArea) {
          orderArr.push(nItem);
        }
      });
    });
    return orderArr;
  };
  const onAdd = () => {
    history.push('/recommend/add');
  };
  return (
    <Body>
      <Content className="sec-recommend">
        <Content.Header className="sec-recommend-title" title="改进建议"></Content.Header>
        <Content.Body className="recommend-content-body">
          <Button
            type="primary"
            className="recommend-add-btn"
            style={{ marginBottom: '10px', width: '112px' }}
            onClick={onAdd}
          >
            新增改进建议
          </Button>

          <div className="recommend-wrap">
            {(dataList || []).map((item: any, index: any) => {
              let start = 0;
              dataList.map((dItem, dIndex) => {
                if (dIndex < index) {
                  start += dItem.categorys.length;
                }
              });
              return (
                <div key={index} className="recommend-area-wrap">
                  <div className="recommend-wrap-inner">
                    <RecommendItem theData={item} startIn={start} topArr={hArr} />
                  </div>
                </div>
              );
            })}
          </div>
        </Content.Body>
      </Content>
    </Body>
  );
};

export default RecommendsPage;
