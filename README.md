# react-animated-svg-sparkline

> Responsive Animated SVG sparkline React component

## Features

- SVG Animation
- No dependencies
- Dark theme only (as shown in the preview gif)

[![NPM](https://img.shields.io/npm/v/react-animated-svg-sparkline.svg)](https://www.npmjs.com/package/react-animated-svg-sparkline) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![React Animated SVG Sparkline](./preview.gif)

## Install

```bash
yarn add react-animated-svg-sparkline
```

```bash
npm install --save react-animated-svg-sparkline
```

## Usage

```jsx
import ReactAnimatedSVGSparkline from 'react-animated-svg-sparkline';
import 'react-animated-svg-sparkline/dist/index.css';

<div style={{ background: '#000' }}>
  <ReactAnimatedSVGSparkline
    width={1900}
    height={620}
    strokeWidth={8}
    paddingY={80}
    showGrid={true}
    data={[9,10,5,1,6,5,8,1,7,15,13.2,15]}
    className="svg-style"
    tipText="123"
  />
</div>
```

## Props

| Prop | Type | Default | Note |
|---|---|---|---|
| `data` | `Array` | `[]` | Array of numbers to be plotted |
| `width` | `Number` | `800` | `<svg>` element width |
| `height` | `Number` | `400` | `<svg>` element height |
| `paddingX` | `Number` | `0` | Horizontal padding |
| `paddingY` | `Number` | `0` | Vertical padding |
| `className` | `String` | `null` | `<svg>` CSS class |
| `strokeWidth` | `Number` | `6` | Sparkline stroke width |
| `showGrid` | `Boolean` | `true` | Wheter or not show grid |
| `tipText` | `String` | `null` | Last point tool-tip content |
| `tipTextWidth` | `Number` | `120` | Last point tool-tip rectangle width |

## License

MIT © [Eduardo Lomelí](https://github.com/eduardinni)
