import { randomString } from '@src/utils/util';
import { useHistory } from '@tea/app';
import { Bubble, Row, Tooltip } from '@tencent/tea-component';
import cls from 'classnames';
import { pinyin } from 'pinyin-pro';
import React, { useEffect, useState } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './index.less';

const PartitionCard: React.FC<{
  cols: number;
  data: any;
  edit: boolean;
  gapBubble?: boolean;
  business: Array<string>;
  onClick: (key?: string) => void;
  onSelect?: (dom) => void;
  scene: Array<any>;
}> = props => {
  const partData = props.data;
  const scene = props.scene;
  let joinBusiness = [];
  if (props.business) {
    joinBusiness = partData.data.filter(d => {
      return d['select'] && props.business.indexOf(d['text']) > -1;
    });
  }
  const history = useHistory();
  const [isGap, setIsGap] = useState(false);
  const [showAgainst, setShowAgainst] = useState('');
  const [showGap, setShowGap] = useState('');
  useEffect(() => {
    if (history.location.pathname === '/tracks') {
      setIsGap(true);
    } else {
      setIsGap(false);
    }
  }, []);

  const getIcon = type => {
    if (type) {
      const typePinyin = pinyin(type, { toneType: 'none', type: 'array' }).join('').toLowerCase();
      return require('@src/image/' + typePinyin + '.svg');
    } else {
      return '';
    }
  };

  // 每一个系统/资产
  const partUnit = index => {
    const unit = partData.data[index];
    return (
      <div className="part-unit" key={index}>
        <div
          id={'part_' + unit.key}
          className={cls('unit-box', {
            'not-select': props.business && props.business.length && props.business.indexOf(unit.text) == -1, // 选中业务，未包含节点透明
            scene: scene && scene[0], // 编辑态hover高亮
            'not-scene-select': scene && !scene[0] && !scene[0] && scene[2].indexOf(unit.key) == -1, // 非编辑态未包含节点透明
            last: scene && scene[0] && scene[2] && scene[2].length && scene[2][scene[2].length - 1] == unit.key, // 编辑态尾元素高亮
          })}
          onClick={() => {
            props.onSelect(unit.key);
          }}
        >
          <img src={getIcon(unit.class)} className="part-icon" />
          <div className="part-text" title={unit.text}>
            {unit.text}
          </div>
        </div>
      </div>
    );
  };

  const handleAgainstShow = gId => {
    if (showAgainst) {
      setShowAgainst('');
    } else {
      setShowAgainst(gId);
    }
  };
  const handleGoToRecomend = gId => {
    history.push(`/gap/${gId}`);
  };

  const handleOutClick = () => {
    const btn = document.getElementById('root');
    btn.addEventListener(
      'click',
      function () {
        setShowGap('');
      },
      false,
    );
  };
  useEffect(() => {
    handleOutClick();
  }, []);

  return (
    <div
      id={'area_' + partData.key}
      key={randomString(4)}
      className={cls('partition-content', {
        business: props.business && props.business.length && !joinBusiness.length,
      })}
      onClick={() => {
        props.onClick(partData.key);
      }}
    >
      <div
        className={cls('part-title', {
          scene: scene && !scene[0] && !scene[1],
        })}
      >
        {partData.title}
      </div>
      <Row className="part-content">
        {isGap
          ? partData.data.map((item, index) => {
              if (props.gapBubble && item.gapData) {
                return (
                  <div
                    key={index}
                    onClick={ev => {
                      setShowGap(item.gapData.gapId);
                    }}
                  >
                    <Bubble
                      visible={showGap === item.gapData.gapId}
                      trigger="click"
                      placement="bottom-start"
                      content={
                        <>
                          <div className="gap-content">
                            <div className="act-p">
                              <span>攻击手法：</span>
                              {item.gapData.actName}
                            </div>
                            <div className="act-p">
                              <span>漏洞：</span>
                              {item.gapData.bugName}
                            </div>
                            <div className="act-p">
                              <span>执行动作：</span>
                              {item.gapData.actionName}
                            </div>
                            <div className="against-part">
                              <div
                                className="hide-title"
                                onClick={ev => {
                                  handleAgainstShow(item.gapData.gapId);
                                }}
                              >
                                <span className="title-text">点击展开对抗措施 </span>
                                <span>
                                  <img
                                    src={require('@src/image/arrowdownblue.svg')}
                                    className={`arrow-icon ${showAgainst === item.gapData.gapId ? 'up' : ''}`}
                                  />
                                </span>
                              </div>
                              {showAgainst === item.gapData.gapId ? (
                                <div className="hide-text">{item.gapData.againstName}</div>
                              ) : null}
                            </div>
                            <div
                              className="gap-footer"
                              onClick={() => {
                                handleGoToRecomend(item.gapData.gapId);
                              }}
                            >
                              查看详情
                            </div>
                          </div>
                        </>
                      }
                    >
                      {partUnit(index)}
                    </Bubble>
                  </div>
                );
              } else {
                return <div key={index}>{partUnit(index)}</div>;
              }
            })
          : partData.data.map((item, index) => {
              if (item.select) {
                if (item['data'] && item['data'].length) {
                  return (
                    <Tooltip
                      title={
                        <div className="data-content">
                          {item['data'].map(it => {
                            return (
                              <div className="data-unit">
                                <img src={require('@src/image/data.svg')} className="data-icon" />
                                <span className="data-text">{it}</span>
                              </div>
                            );
                          })}
                        </div>
                      }
                    >
                      {partUnit(index)}
                    </Tooltip>
                  );
                } else {
                  return partUnit(index);
                }
              } else {
                return null;
              }
            })}
      </Row>
    </div>
  );
};

export default PartitionCard;
