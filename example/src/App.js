import React from 'react';

import ReactAnimatedSVGSparkline from 'react-animated-svg-sparkline';
import 'react-animated-svg-sparkline/dist/index.css';

const App = () => {
  return (
    <div style={{ background: '#000' }}>
      <ReactAnimatedSVGSparkline
        width={1600}
        height={800}
        strokeWidth={8}
        paddingY={80}
        showGrid={true}
        data={[9,10,5,1,6,5,8,1,7,15,13,10]}
        className="svg-style"
        tipText="123"
      />
    </div>
  )
}

export default App
