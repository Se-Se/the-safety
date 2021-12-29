import { useHistory } from '@tea/app';
import { Bubble } from '@tencent/tea-component';
import { pinyin } from 'pinyin-pro';
import React, { useEffect, useState } from 'react';

export default function RecommendItem(props) {
  const [theData, setTheData] = useState({});
  const history = useHistory();
  const [hArr, setHArr] = useState([]);

  // 根据props.list更新list
  useEffect(() => {
    setTheData({ ...props.theData });
  }, [props.theData]);

  const handleItemClck = data => {
    console.log('data', data);
    history.push(`/recommend/${data.recommendId}`);
  };
  const handletitleColor = data => {
    let color = '';
    switch (data) {
      case 'low':
        color = '#69FBBB';
        break;
      case 'mid':
        color = '#FFD358';
        break;
      case 'high':
        color = '#E65C52';
        break;
      default:
        color = '#69FBBB';
    }
    return color;
  };
  useEffect(() => {
    let h = document.getElementsByClassName('cagegory-items-content');
    let arr = [];
    for (let i = 0; i < h.length; i++) {
      arr.push((h[i] as any).offsetHeight);
    }
    setHArr([...arr]);
  }, [theData]);

  useEffect(() => {}, []);
  const getIcon = type => {
    if (type) {
      const typePinyin = pinyin(type, { toneType: 'none', type: 'array' }).join('').toLowerCase();
      return require('@src/image/' + typePinyin + '.svg');
    } else {
      return '';
    }
  };
  return (
    <>
      <div className="recommend-item-border"></div>
      <div className="recommend-area-item">
        <div className="recommend-item-header">{(theData as any).theArea}</div>
        <div className="sec-rec-content">
          <div className="category-container">
            {((theData as any).categorys || []).map((item, gIndex) => {
              const len = item.recommends.length;
              let titTop = len === 0 ? '0px' : (len - 1) * 25 + 'px';
              let Top = Math.round((hArr[props.startIn + gIndex] - 30) / 2 - 20) + 'px';
              return (
                <div className="category-group" key={item.category + gIndex}>
                  <div className="category-title-group" style={{ top: Top }}>
                    <Bubble content={item.category}>
                      <div className="category-title">{item.category}</div>
                    </Bubble>
                  </div>

                  <div className="svg-content">
                    <div className="svg-item" style={{ top: titTop }}>
                      <svg width="40" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs></defs>
                        <polyline strokeWidth="2" fill="none" stroke="white" points="0,-50  30,-50" />
                      </svg>
                    </div>
                    {(item.recommends || []).map((reItem, index) => {
                      let points: any = '0,-50  90,-50';
                      let top: any = 0;

                      if (index === 0) {
                        points = '30,-50  90,-50';
                      } else {
                        points = `30,-50 30,75 90,75`;
                        top = 50 * (index - 1);
                      }

                      return (
                        <div className="svg-item" style={{ top: top }} key={reItem.recommendId}>
                          <svg width="40" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <marker
                                id="triangle"
                                viewBox="0 0 10 10"
                                refX="6"
                                refY="6"
                                markerUnits="strokeWidth"
                                markerWidth="8"
                                markerHeight="14"
                                orient="auto"
                              >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#979797" />
                              </marker>
                            </defs>
                            <polyline
                              strokeWidth="2"
                              fill="none"
                              stroke="white"
                              points={points}
                              markerEnd="url(#triangle)"
                            />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                  <div className="cagegory-items-content">
                    {(item.recommends || []).map((cItem, index) => {
                      return (
                        <section key={index}>
                          <Bubble content={cItem.theTitle}>
                            <div
                              className="cagegory-item"
                              onClick={() => {
                                handleItemClck(cItem);
                              }}
                            >
                              <div className="title-pic">
                                <img src={getIcon(cItem.picName)} className="part-icon" />
                              </div>
                              <span
                                className="title-text"
                                style={{ backgroundColor: handletitleColor(cItem.dangerLevel), padding: '0 8px' }}
                              >
                                {cItem.theTitle}
                              </span>
                            </div>
                          </Bubble>
                        </section>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
