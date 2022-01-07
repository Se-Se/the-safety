import { api } from '@src/services/api/apis';
import { useApi } from '@src/services/api/useApi';
import { activeChange, randomString } from '@src/utils/util';
import { Collapse } from '@tencent/tea-component';
import cls from 'classnames';
import React, { useEffect, useState } from 'react';
import './partition.less';

const PartitionManagerCard: React.FC<{
  onGroup: () => void;
}> = props => {
  const [partition, setPartition] = useState<Array<{}>>([]);
  const [group, setGroup] = useState<string>('1');
  const getArea = useApi('area').getAll;
  const getProperty = useApi('property').getAll;
  const [dragId, setDragId] = useState<number>(-1);

  useEffect(() => {
    (api.defaults.headers as any).allow = true;
    Promise.all([getArea(), getProperty()])
      .then(([data, property]) => {
        (api.defaults.headers as any).allow = false;
        for (let index = 0; index < data.length; index++) {
          const systemData = data[index].belongSystem.map(item => {
            return {
              text: item,
              type: 'system',
              class: '系统',
            };
          });
          const propertyData = data[index].belongProperty.map(item => {
            const curProperty = property.filter(it => it.propertyName == item);
            return {
              text: item,
              type: 'property',
              class: curProperty && curProperty.length ? curProperty[0].propertyKind.split('/')[1] : '',
            };
          });
          data[index].systemProperty = systemData.concat(propertyData);
        }
        setPartition(data);
      })
      .catch(() => {})
      .finally(() => {
        (api.defaults.headers as any).allow = false;
      });
  }, []);

  // 切换变更状态
  const changeStatus = activeId => {
    let curGroup = '';
    console.log(activeId);
    if (!activeId.length) {
      curGroup = group == '1' ? '2' : '1';
    } else {
      curGroup = activeId[0];
    }
    activeChange();
    setGroup(curGroup);
    props.onGroup();
  };

  return (
    <div className="partition-manager">
      <Collapse
        accordion
        activeIds={[group]}
        icon={<img className="arrow-icon" src={require('@src/image/arrowdown.svg')} />}
        iconPosition="right"
        onActive={activeId => changeStatus(activeId)}
      >
        <Collapse.Panel id="1" title="分区">
          <div className="manager-body">
            <a className="manager-right" href="/area">
              管理
            </a>
            {partition.map((item: any, index) => {
              return (
                <div
                  className={cls('manager-card', { drag: dragId == index })}
                  key={index}
                  draggable={true}
                  onDragStart={event => {
                    setDragId(index);
                    event.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({
                        id: item.areaId,
                        key: randomString(4),
                        title: item.areaName,
                        data: item.systemProperty.map(d => {
                          return {
                            select: true,
                            key: randomString(6),
                            ...d,
                          };
                        }),
                      }),
                    );
                  }}
                  onDragEnd={() => {
                    setDragId(-1);
                  }}
                >
                  <img className="card-icon" src={require('@src/image/partition.svg')}></img>
                  <span className="card-text">{item.areaName}</span>
                </div>
              );
            })}
          </div>
        </Collapse.Panel>
        <Collapse.Panel id="2" title="大区">
          <div className="manager-body group-body">
            <div className="manager-card" draggable={true}>
              <img className="card-icon" src={require('@src/image/group.svg')}></img>
              <span className="card-text">大区划分</span>
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default PartitionManagerCard;
