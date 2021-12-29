import { formatDate } from '@src/utils/util';
import { Button, Icon, Justify, Table } from '@tencent/tea-component';
import React, { useState } from 'react';
const { pageable, selectable } = Table.addons;

type RecordType = {
  id?: number;
  businessId?: string;
  businessName?: string;
  part?: string;
  businessKinds?: string;
  process?: string;
  dataProcess?: string;
  addMen?: string;
  createdAt?: string | number;
};

const TableCommon: React.FC<any> = props => {
  const getColumns = (columns: any) => {
    const allColumns = [
      // business
      {
        key: 'businessId',
        header: '业务ID',
      },
      {
        key: 'businessName',
        header: '业务名称',
      },
      {
        key: 'businessKinds',
        header: '业务大类',
      },
      {
        key: 'businessPic',
        header: '业务资产图',
      },

      //////////////////////////////
      // app

      {
        key: 'systemName',
        header: '系统名称',
      },

      {
        key: 'business',
        header: '所属业务',
      },

      // /////////////////////////////////////////
      // data
      {
        key: 'dataId',
        header: '数据id',
      },
      {
        key: 'dataName',
        header: '数据名称',
      },
      {
        key: 'systemPart',
        header: '所属系统',
      },
      // perproty
      {
        key: 'propertyId',
        header: '资产id',
      },
      {
        key: 'propertyName',
        header: '资产名称',
      },
      {
        key: 'propertyKind',
        header: '资产类型',
      },
      // frame
      {
        key: 'areaId',
        header: '分区ID',
      },
      {
        key: 'areaName',
        header: '分区名称',
      },
      {
        key: 'relationArea',
        header: '相关分区',
      },
      {
        key: 'systemAndProperty',
        header: '包含系统/资产',
      },

      // scenes
      {
        key: 'scenesId',
        header: '攻击场景id',
      },
      {
        key: 'sceneName',
        header: '场景名称',
      },
      {
        key: 'strategy',
        header: '行动策略',
      },
      {
        key: 'attackObject',
        header: '攻击目标',
      },
      {
        key: 'loseEffect',
        header: '损失影响',
      },
      // gap
      {
        key: 'gapId',
        header: '攻击手法与漏洞id',
      },
      {
        key: 'propertyOrSystem',
        header: '资产/系统名称',
      },
      {
        key: 'categorys',
        header: '分类',
      },
      {
        key: 'theType',
        header: '类型',
      },
      {
        key: 'actName',
        header: '攻击手法',
      },
      {
        key: 'bugName',
        header: '漏洞',
      },
      {
        key: 'actionName',
        header: '执行动作',
      },
      {
        key: 'againstName',
        header: '对抗措施',
      },
      {
        key: 'lastEditMan',
        header: '修改人',
      },
      {
        key: 'recommendAction',
        header: '改善建议',
      },
      //recommend
      {
        key: 'recommendName',
        header: '建议名称',
      },
      {
        key: 'category_1',
        header: '一级分类',
      },
      {
        key: 'category_2',
        header: '二级分类',
      },
      {
        key: 'describe',
        header: '详细描述',
      },

      /////////////////////////////////////////////////////// common
      {
        key: 'systemKinds',
        header: ' 系统类型',
      },
      {
        key: 'systemId',
        header: '系统ID',
      },
      {
        key: 'area',
        header: '所属分区',
      },
      {
        key: 'part',
        header: '所属部门',
      },
      {
        key: 'addMen',
        header: '添加人',
      },
      {
        key: 'createdAt',
        header: '添加时间',
      },
      {
        key: 'editMen',
        header: '修改人',
      },
      {
        key: 'editedAt',
        header: '最后修改时间',
      },
      {
        key: 'action',
        header: '操作',
      },
      {
        key: 'show',
        header: '查看攻击路线图',
      },
      ///////////////////////////////////////////////////
    ];
    let arr = [];
    columns.map(item => {
      allColumns.map(column => {
        if (item === column.key) {
          arr.push(column);
        }
      });
    });

    arr.map(item => {
      if (item.key === 'action') {
        item.render = (record: any, key: any, index: any) => (
          <>
            <Button
              type="link"
              onClick={ev => {
                ev.stopPropagation();
                props.onEdit(record);
              }}
            >
              编辑
            </Button>
          </>
        );
      }
      if (item.key === 'recommendAction') {
        item.render = (record: any, key: any, index: any) => (
          <>
            <Button
              type="link"
              onClick={ev => {
                ev.stopPropagation();
                props.recommendEdit(record);
              }}
            >
              编辑
            </Button>
          </>
        );
      }

      if (item.key === 'businessPic') {
        item.render = record => {
          return (
            <Button
              type="link"
              onClick={ev => {
                ev.stopPropagation();
                props.showPic(record);
              }}
            >
              查看
            </Button>
          );
        };
      }
      if (item.key === 'show') {
        item.render = record => {
          return (
            <Button
              type="link"
              style={{ marginLeft: '30px' }}
              onClick={ev => {
                ev.stopPropagation();
                props.show(record);
              }}
            >
              查看
            </Button>
          );
        };
      }

      if (item.key === 'createdAt') {
        item.render = record => formatDate(record.createdAt);
      }
      if (item.key === 'editedAt') {
        item.render = record => formatDate(record.editedAt);
      }
      if (item.key === 'categorys') {
        item.render = record => {
          if (record.categorys === 'property') {
            return '资产';
          } else {
            return '应用系统';
          }
        };
      }
      if (item.key === 'lastEditMan') {
        item.render = record => {
          return record.editMen || record.addMen;
        };
      }
    });
    return arr;
  };

  const arr = getColumns(props.columns);
  const [selectedKeys, setSelectedKeys] = useState([]);

  return (
    <>
      <Table.ActionPanel>
        <Justify left={props.left} right={props.right} />
      </Table.ActionPanel>
      <Table<RecordType>
        verticalTop
        records={props.list || []}
        recordKey={props.recordKey}
        bordered
        columns={arr}
        addons={[
          pageable(),
          !props.notSelectable &&
            selectable({
              value: selectedKeys,
              onChange: (keys, context) => {
                console.log(keys, context);
                props.selectItems(keys);
                setSelectedKeys(keys);
              },
              rowSelect: true,
              render: (element, { disabled }) => {
                return disabled ? <Icon type="loading" /> : element;
              },
            }),
        ]}
        className="common-table"
      />
    </>
  );
};

export default TableCommon;
