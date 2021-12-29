import { randomString } from '@src/utils/util';
import React from 'react';
import './line.less';

const GenPath = props => {
  // swipe 扫过的方向， 0顺时针， 1逆时针
  let { x0, y0, x1, y1, swipe, maximumGap, minimalGap } = props;
  const wDelta = x1 - x0;
  const hDelta = y1 - y0;
  const hGapAbs = Math.abs(hDelta);
  const wGapAbs = Math.abs(wDelta);
  let dirIn, dirOut;
  let path;

  if (wDelta < -maximumGap && hDelta < -maximumGap) {
    dirIn = swipe == 1 ? 'left' : 'up';
    dirOut = swipe == 1 ? 'up' : 'left';
    if (swipe == 1) {
      // 右上
      path = `
      M${x0},${y0}
      h${wDelta + 4}
      a4,4 0 0 1 -4,-4
      v${hDelta + 4}
    `;
    } else {
      // 左下
      path = `
      M${x0},${y0}
      v${hDelta + 4}
      a4,4 0 0 0 -4,-4
      h${wDelta + 4}
    `;
    }
  } else if (wDelta > maximumGap && hDelta > maximumGap) {
    dirIn = swipe == 1 ? 'right' : 'down';
    dirOut = swipe == 1 ? 'down' : 'right';
    if (swipe == 1) {
      // 左下
      path = `
      M${x0},${y0}
      h${wDelta - 4}
      a4,4 0 0 1 4,4
      v${hDelta - 4}
    `;
    } else {
      // 右上
      path = `
      M${x0},${y0}
      v${hDelta - 4}
      a4,4 0 0 0 4,4
      h${wDelta - 4}
    `;
    }
  } else if (wDelta > maximumGap && hDelta < -maximumGap) {
    dirIn = swipe == 1 ? 'up' : 'right';
    dirOut = swipe == 1 ? 'right' : 'up';
    if (swipe == 1) {
      // 右下
      path = `
      M${x0},${y0}
      v${hDelta + 4}
      a4,4 0 0 1 4,-4
      h${wDelta - 4}
    `;
    } else {
      // 左上
      path = `
      M${x0},${y0}
      h${wDelta - 4}
      a4,4 0 0 0 4,-4
      v${hDelta + 4}
    `;
    }
  } else if (wDelta < -maximumGap && hDelta > maximumGap) {
    dirIn = swipe == 1 ? 'left' : 'down';
    dirOut = swipe == 1 ? 'down' : 'left';
    if (swipe == 1) {
      // 左上
      path = `
      M${x0},${y0}
      h${wDelta + 4}
      a4,4 0 0 0 -4,4
      v${hDelta - 4}
    `;
    } else {
      // 右下
      path = `
      M${x0},${y0}
      v${hDelta - 4}
      a4,4 0 0 1 -4,4
      h${wDelta + 4}
    `;
    }
  } else {
    if (hGapAbs >= wGapAbs) {
      dirIn = dirOut = hDelta > 0 ? 'down' : 'up';
      if (wGapAbs < minimalGap) {
        path = `M${x0},${y0} v${hDelta}`;
      } else {
        const half = hDelta / 2;
        const gap = wDelta;
        path = `M${x0},${y0} v${half} h${gap} v${half}`;
      }
    } else {
      dirIn = dirOut = wDelta < 0 ? 'left' : 'right';
      if (hGapAbs < minimalGap) {
        path = `M${x0},${y0} h${wDelta}`;
      } else {
        const half = wDelta / 2;
        const gap = hDelta;
        path = `M${x0},${y0} h${half} v${gap} h${half}`;
      }
    }
  }

  return { path, dirIn, dirOut };
};

const Line = ({
  from,
  to,
  index,
  active,
  swipe,
  stroke = { strokeColor: '#E44345' },
  maximumGap = 50,
  minimalGap = 4,
}) => {
  const { x: x1, y: y1 } = from;
  const { x: x2, y: y2 } = to;
  const { strokeColor } = stroke;
  const { path: dpath, dirIn, dirOut } = GenPath({ x0: x1, y0: y1, x1: x2, y1: y2, swipe, maximumGap, minimalGap });
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
  const calOut = dir => {
    let offset = {};
    switch (dir) {
      case 'left':
        offset.top = y2 - 7;
        offset.left = x1;
        break;
      case 'right':
        offset.top = y2 - 7;
        offset.left = x2 - 14;
        break;
      case 'up':
        offset.top = y2;
        offset.left = x2 - 7;
        break;
      case 'down':
        offset.top = y2;
        offset.left = x2 - 7;
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
    <div className={active ? "broken-line active-line": "broken-line"}>
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
            refX="2"
            refY="6.4"
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
