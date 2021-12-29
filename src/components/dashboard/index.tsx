import cls from 'classnames';
import React from 'react';
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
  maximumGap?: any;
  minimalGap?: any;
  track?: Array<any>;
}> = props => {
  const width = 4000;
  const cols = 4000;

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
              maximumGap={props.maximumGap}
              minimalGap={props.minimalGap}
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
