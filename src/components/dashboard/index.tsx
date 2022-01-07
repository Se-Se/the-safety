import { activeChange } from '@src/utils/util';
import cls from 'classnames';
import React, { useEffect } from 'react';
import Line from '../line/line';
import AreaCard from './area';
import GroupCard from './group';
import './index.less';

const DashboardPage: React.FC<{
  edit: boolean;
  group: boolean;
  gapBubble?: boolean;
  dataSource: Array<{}>;
  groupSource: Array<{}>;
  onChange: (type, key, value) => void;
  business?: Array<string>;
  scene?: Array<any>;
  linkSource?: Array<any>;
  markers?: Array<any>;
  stroke?: any;
  track?: Array<any>;
}> = props => {
  const width = 4000;
  const cols = 4000;

  //dataSource groupSource 变化时分区与大区高度取较大的高度
  useEffect(() => {
    setTimeout(() => {
      activeChange();
    }, 1000);
  }, [props.dataSource, props.groupSource]);
  return (
    <div className={cls('dashboard-content', { edit: props.edit, group: props.group })}>
      <AreaCard
        edit={props.edit}
        width={width}
        cols={cols}
        dataSource={props.dataSource}
        onChange={props.onChange}
        business={props.business}
        scene={props.scene}
        gapBubble={props.gapBubble}
        track={props.track}
      />
      <GroupCard
        edit={props.edit}
        width={width}
        cols={cols}
        groupSource={props.groupSource}
        onChange={props.onChange}
      />
      <div className="line-container">
        {props.linkSource.map(path => {
          return path?.edges.map((edge, index) => (
            <Line
              key={index.toString() + '_' + edge.from.id + '-' + edge.to.id}
              from={edge.from}
              to={edge.to}
              index={index.toString()}
              active={edge.active}
              swipe={edge.dir}
              stroke={props.stroke}
              type={edge.type}
            />
          ));
        })}
      </div>
      <div className="path-marker">
        {props.markers.length > 0 && <img style={props.markers[0]} src={require('@src/image/start-node.svg')} />}
        {props.markers.length > 0 && <img style={props.markers[1]} src={require('@src/image/end-node.svg')} />}
      </div>
    </div>
  );
};

export default DashboardPage;
