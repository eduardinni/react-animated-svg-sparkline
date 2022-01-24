import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

const detectIE = () => {
  const ua = window.navigator.userAgent;
  // IE 10 or older || IE 11 || Edge (IE 12+)
  if (
    ua.indexOf('MSIE ') > 0 ||
    ua.indexOf('Trident/') > 0 ||
    ua.indexOf('Edge/') > 0
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * Should calculate the same value as the DOM Path.getTotalLength() method
 */
const getTotalLength = (points) => {
  if (detectIE()) {
    return 0;
  }

  return (
    points.reduce((total, point, i, points) => {
      // if this isn't the first point
      if (i) {
        return distance(points[i - 1], point) + total;
      }
      return total;
    }, 0) * 1.1
  );
};

/**
 * Calculate the distance between two points on a plane
 */
const distance = (p1, p2) => {
  const dy = p1.y - p2.y;
  const dx = p1.x - p2.x;

  // Pythagorean Theorem
  return Math.sqrt(dx * dx + dy * dy);
};

// Catmull-Rom Spline to Bezier Spline Converter
// Contact info:
// www-svg@w3.org for public comments (preferred),
// schepers@w3.org for personal comments.
// author: schepers, created: 07-09-2010
const catmullRom2bezier = (points) => {
  const crp = points.split(/[,\s]/);
  let d = '';
  for (let i = 0, iLen = crp.length; iLen - 2 > i; i += 2) {
    const p = [];
    if (i === 0) {
      p.push({ x: parseFloat(crp[i]), y: parseFloat(crp[i + 1]) });
      p.push({ x: parseFloat(crp[i]), y: parseFloat(crp[i + 1]) });
      p.push({ x: parseFloat(crp[i + 2]), y: parseFloat(crp[i + 3]) });
      p.push({ x: parseFloat(crp[i + 4]), y: parseFloat(crp[i + 5]) });
    } else if (i === iLen - 4) {
      p.push({ x: parseFloat(crp[i - 2]), y: parseFloat(crp[i - 1]) });
      p.push({ x: parseFloat(crp[i]), y: parseFloat(crp[i + 1]) });
      p.push({ x: parseFloat(crp[i + 2]), y: parseFloat(crp[i + 3]) });
      p.push({ x: parseFloat(crp[i + 2]), y: parseFloat(crp[i + 3]) });
    } else {
      p.push({ x: parseFloat(crp[i - 2]), y: parseFloat(crp[i - 1]) });
      p.push({ x: parseFloat(crp[i]), y: parseFloat(crp[i + 1]) });
      p.push({ x: parseFloat(crp[i + 2]), y: parseFloat(crp[i + 3]) });
      p.push({ x: parseFloat(crp[i + 4]), y: parseFloat(crp[i + 5]) });
    }

    // Catmull-Rom to Cubic Bezier conversion matrix
    //    0       1       0       0
    //  -1/6      1      1/6      0
    //    0      1/6      1     -1/6
    //    0       0       1       0

    const bp = [];
    bp.push({ x: p[1].x, y: p[1].y });
    bp.push({
      x: (-p[0].x + 6 * p[1].x + p[2].x) / 6,
      y: (-p[0].y + 6 * p[1].y + p[2].y) / 6,
    });
    bp.push({
      x: (p[1].x + 6 * p[2].x - p[3].x) / 6,
      y: (p[1].y + 6 * p[2].y - p[3].y) / 6,
    });
    bp.push({ x: p[2].x, y: p[2].y });

    d += `C${Math.round(bp[1].x)},${Math.round(bp[1].y)} ${Math.round(
      bp[2].x,
    )},${Math.round(bp[2].y)} ${Math.round(bp[3].x)},${Math.round(bp[3].y)}`;
  }

  return d;
};

const buildSparkline = (data, width, height, paddingX, paddingY) => {
  const dataMin = Math.min(...data);
  const dataMax = Math.max(...data, Math.abs(dataMin));
  const maxX = width - paddingX;
  const maxY = height - paddingY;

  const baseY = dataMin < 0 ? height / 2 : height - paddingY;

  const ratioX = (width - paddingX * 2 - 200) / (data.length - 1);
  const ratioY = (baseY - paddingY - 50) / dataMax;

  const pointsObj = [];
  let x = 0;
  let y = 0;
  let d = '';
  let pointsR = '';

  for (let i = 0; i < data.length; i++) {
    x = i * ratioX + paddingX;

    if (dataMin < 0) {
      y =
        data[i] === 0
          ? baseY
          : baseY - Math.abs(data[i]) * ratioY * (Math.abs(data[i]) / data[i]);
    } else {
      y = baseY - data[i] * ratioY;
    }

    if (i === 0) {
      d = `M${x},${y}`;
    }

    pointsR += `${x},${y} `;

    // array of objects of point {x,y} to be used in getTotalLength
    pointsObj.push({ x, y });
  }

  d += catmullRom2bezier(pointsR.trim());

  return {
    svgData: d,
    svgDataFill: `${d} L${maxX},${maxY + 50} L0,${maxY + 50} Z`,
    totalLength: getTotalLength(pointsObj),
    lastPoint: pointsObj[pointsObj.length - 1],
    dataMin,
    dataMax,
  };
};

const INITIAL_STATE = {
  key: 1,
  svgData: '',
  svgDataFill: '',
  lastPoint: { x: 0, y: 0 },
  totalLength: 0,
  dataMin: 0,
  dataMax: 0,
};

const ReactAnimatedSVGSparkline = ({
  data = [],
  width = 800,
  height = 400,
  paddingX = 0,
  paddingY = 40,
  className = null,
  strokeWidth = 6,
  showGrid = true,
  tipText = null,
  tipTextWidth = 120,
}) => {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (data.length > 0) {
      const newState = buildSparkline(data, width, height, paddingX, paddingY);
      setState((prevState) => ({
        ...newState,
        key: prevState.key + 1,
      }));
    }
  }, [data, width, height, paddingX, paddingY]);

  if (data.length === 0) {
    return null;
  }

  const maxX = width - paddingX;
  const maxY = height - paddingY;
  const grid = [];

  if (showGrid === true) {
    const gridSpc = Math.floor(height / 4);
    const gridVal = (state.dataMax - state.dataMin) / 4;

    for (let i = 0; i < gridSpc; i++) {
      const y = maxY - (i === 0 ? 2 : gridSpc * i);
      const t = i === 0 ? state.dataMin : Math.floor(gridVal * (i + 1));
      grid.push(<path key={`gp${i}`} d={`M${paddingX},${y} L${maxX},${y}`} />);
      grid.push(
        <text key={`gt${i}`} x={15} y={y - 10} fill='red' fontSize='13'>
          {t}
        </text>,
      );
    }
  }

  return (
    <svg
      key={state.key}
      xmlns='http://www.w3.org/2000/svg'
      className={className}
      width='100%'
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio='xMidYMid meet'
    >
      <path
        className={styles['spline-anim-glow']}
        strokeWidth={strokeWidth}
        fill='none'
        strokeLinecap='round'
        stroke='#ffffff'
        filter='url(#gauBlur)'
        d={state.svgData}
        style={{
          strokeDasharray: state.totalLength,
          strokeDashoffset: state.totalLength,
        }}
      />

      <path
        className={styles['spline-anim-eraser']}
        strokeWidth='20'
        fill='none'
        strokeLinecap='round'
        stroke='#000000'
        d={state.svgData}
        style={{
          strokeDasharray: state.totalLength,
          strokeDashoffset: state.totalLength,
        }}
      />

      {showGrid === true && (
        <g stroke='#303030' strokeWidth='1' fill='none'>
          {grid}
        </g>
      )}

      <path
        className={styles['spline-anim']}
        strokeWidth={strokeWidth - 2}
        fill='none'
        strokeLinecap='round'
        stroke='#ffffff'
        d={state.svgData}
        style={{
          stroke: 'url(#heartLineheartline)',
          strokeDasharray: state.totalLength,
          strokeDashoffset: state.totalLength,
        }}
      />

      {tipText !== null && (
        <g
          className={styles.tip}
          transform={`translate(${state.lastPoint.x - 60},${
            state.lastPoint.y - 70
          })`}
        >
          <g fill='#fff' stroke='none'>
            <rect width={tipTextWidth} height='40' rx='5' ry='5' />
            <path d='M 52 39 l 16 0 -8 9 z' />
          </g>
          <text
            x='60'
            y='21'
            className={styles['tip-text']}
            alignmentBaseline='middle'
            textAnchor='middle'
          >
            {tipText}
          </text>
        </g>
      )}

      <circle cx={state.lastPoint.x} cy={state.lastPoint.y} r='0' fill='#fff'>
        <animate
          attributeType='XML'
          attributeName='r'
          from='0'
          to='10'
          dur='0.3s'
          begin='1.5s'
          repeatCount='1'
          fill='freeze'
        />
      </circle>

      <defs>
        <filter id='gauBlur'>
          <feGaussianBlur stdDeviation='1.5' />
        </filter>
        <linearGradient
          id='heartLineheartline'
          gradientUnits='userSpaceOnUse'
          x1='0'
          y1='0'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#b721ff' />
          <stop offset='70%' stopColor='#21d4fd' />
        </linearGradient>
      </defs>
    </svg>
  );
};

ReactAnimatedSVGSparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  paddingX: PropTypes.number,
  paddingY: PropTypes.number,
  className: PropTypes.string,
  strokeWidth: PropTypes.number,
  showGrid: PropTypes.bool,
  tipText: PropTypes.string,
};

export default ReactAnimatedSVGSparkline;
