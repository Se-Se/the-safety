import { randomString } from '@src/utils/util';
import React from 'react';
import './line.less';

const GenPath = props => {
  // swipe 扫过的方向， 0顺时针， 1逆时针
  // type 连线的形态
  // (x0, y0) -> (x1, y1), 起点->终点
  let { x0, y0, x1, y1, swipe, type } = props;
  const wDelta = x1 - x0;
  const hDelta = y1 - y0;
  // 给出入边和出边的方向，方便起止点条件其它图标
  let dirIn, dirOut;
  let path;
  const threshold = 0.5;
  const minimalGap = 4;

  if (type == 'l-link') {
    // L-型连接，转角是圆角，通过arc命令绘制
    if (wDelta < -threshold && hDelta < -threshold) {
      dirIn = swipe == 0 ? 'left' : 'up';
      dirOut = swipe == 0 ? 'up' : 'left';
      if (swipe == 0) {
        // 转角在右上
        path = `
        M${x0},${y0}
        h${wDelta + 4}
        a4,4 0 0 1 -4,-4
        v${hDelta + 4}
      `;
      } else {
        // 转角在左下
        path = `
        M${x0},${y0}
        v${hDelta + 4}
        a4,4 0 0 0 -4,-4
        h${wDelta + 4}
      `;
      }
    } else if (wDelta > threshold && hDelta > threshold) {
      dirIn = swipe == 0 ? 'right' : 'down';
      dirOut = swipe == 0 ? 'down' : 'right';
      if (swipe == 0) {
        // 转角在左下
        path = `
        M${x0},${y0}
        h${wDelta - 4}
        a4,4 0 0 1 4,4
        v${hDelta - 4}
      `;
      } else {
        // 转角在右上
        path = `
        M${x0},${y0}
        v${hDelta - 4}
        a4,4 0 0 0 4,4
        h${wDelta - 4}
      `;
      }
    } else if (wDelta > threshold && hDelta < -threshold) {
      dirIn = swipe == 0 ? 'up' : 'right';
      dirOut = swipe == 0 ? 'right' : 'up';
      if (swipe == 0) {
        // 转角在右下
        path = `
        M${x0},${y0}
        v${hDelta + 4}
        a4,4 0 0 1 4,-4
        h${wDelta - 4}
      `;
      } else {
        // 转角在左上
        path = `
        M${x0},${y0}
        h${wDelta - 4}
        a4,4 0 0 0 4,-4
        v${hDelta + 4}
      `;
      }
    } else if (wDelta < -threshold && hDelta > threshold) {
      dirIn = swipe == 1 ? 'left' : 'down';
      dirOut = swipe == 1 ? 'down' : 'left';
      if (swipe == 1) {
        // 转角在左上
        path = `
        M${x0},${y0}
        h${wDelta + 4}
        a4,4 0 0 0 -4,4
        v${hDelta - 4}
      `;
      } else {
        // 转角在右下
        path = `
        M${x0},${y0}
        v${hDelta - 4}
        a4,4 0 0 1 -4,4
        h${wDelta + 4}
      `;
      }
    }
  } else {
    if (minimalGap >= Math.abs(wDelta)) {
      // straight-line
      path = `M${x0},${y0} v${hDelta}`;
      dirOut = dirIn = hDelta > 0 ? 'down' : 'up';
    } else if (minimalGap >= Math.abs(hDelta)) {
      // straight-line
      path = `M${x0},${y0} h${wDelta}`;
      dirOut = dirIn = wDelta > 0 ? 'right' : 'left';
    } else {
      // z-path
      if ((wDelta < -threshold && hDelta < -threshold) || (wDelta > threshold && hDelta > threshold)) {
        if (swipe == 0) {
          path = `M${x0},${y0} h${wDelta / 2} v${hDelta} h${wDelta / 2}`;
          dirOut = dirIn = wDelta > 0 ? 'right' : 'left';
        } else {
          path = `M${x0},${y0} v${hDelta / 2} h${wDelta} v${hDelta / 2}`;
          dirOut = dirIn = hDelta > 0 ? 'down' : 'up';
        }
      } else if ((wDelta > threshold && hDelta < -threshold) || (wDelta < -threshold && hDelta > threshold)) {
        if (swipe == 0) {
          path = `M${x0},${y0} v${hDelta / 2} h${wDelta} v${hDelta / 2}`;
          dirOut = dirIn = hDelta > 0 ? 'down' : 'up';
        } else {
          path = `M${x0},${y0} h${wDelta / 2} v${hDelta} h${wDelta / 2}`;
          dirOut = dirIn = wDelta > 0 ? 'right' : 'left';
        }
      }
    }
  }

  return { path, dirIn, dirOut };
};

const Line = ({ from, to, index, active, swipe, stroke = { strokeColor: '#E44345' }, type }) => {
  const { x: x1, y: y1 } = from;
  const { x: x2, y: y2 } = to;
  const { strokeColor } = stroke;
  const { path: dpath, dirIn } = GenPath({ x0: x1, y0: y1, x1: x2, y1: y2, swipe, type });
  const pathID = randomString(8);
  const calcIn = dir => {
    let offset = {};
    switch (dir) {
      case 'left':
        offset.top = y1 - 7;
        offset.left = x1 - 7;
        break;
      case 'right':
        offset.top = y1 - 7;
        offset.left = x1 - 7;
        break;
      case 'up':
        offset.top = y1 - 7;
        offset.left = x1 - 7;
        break;
      case 'down':
        offset.top = y1 - 7;
        offset.left = x1 - 7;
        break;
      default:
        // unexpected
        console.error('unexpected situation!');
    }
    return offset;
  };
  const { left, top } = calcIn(dirIn);
  const posStyle = { top, left, zIndex: 99 };

  return (
    <div className={active ? 'broken-line active-line' : 'broken-line'}>
      {active && (
        <svg viewBox="0 0 6 6" width={14} height={14} style={posStyle}>
          <circle cx="3" cy="3" r="3" stroke="none" fill={strokeColor} />
          <text
            x="0"
            y="0"
            dx="3"
            dy="3.3"
            fill={strokeColor !== 'white' ? 'white' : 'black'}
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="4px"
          >
            {index}
          </text>
        </svg>
      )}
      <svg width="100%" height="100%" className="svg-line">
        <defs>
          <marker
            id="markerArrow"
            viewBox="0 0 12 12"
            markerWidth="14"
            markerHeight="14"
            refX="8"
            refY="6.5"
            orient="auto"
            fill={strokeColor}
            markerUnits="userSpaceOnUse"
          >
            <path d="M2,2 L2,11 L10,6 L2,2" />
          </marker>
        </defs>
        <path
          d={dpath}
          fill="none"
          stroke={strokeColor}
          className={active ? 'svg-line-marker active' : 'svg-line-marker'}
          pathLength="1"
          id={pathID}
        />
        {active && (
          <circle r="4" fill={strokeColor}>
            <animateMotion dur="3s" repeatCount="indefinite">
              <mpath href={`#${pathID}`} />
            </animateMotion>
          </circle>
        )}
      </svg>
    </div>
  );
};

export default Line;
