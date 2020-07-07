import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg width={14} height={16} viewBox="0 0 14 16" fill="none" {...props}>
      <Path
        d="M13.326 12.08c-.346.766-.511 1.108-.957 1.785-.621.945-1.496 2.123-2.581 2.133-.964.009-1.212-.627-2.52-.62-1.308.007-1.582.63-2.546.622-1.085-.01-1.914-1.073-2.536-2.02C.45 11.338.268 8.236 1.339 6.587 2.099 5.413 3.3 4.728 4.43 4.728c1.15 0 1.872.63 2.823.63.922 0 1.484-.631 2.814-.631 1.005 0 2.07.547 2.828 1.492-2.485 1.363-2.081 4.912.43 5.86zM9.603 2.699c.546-.7.96-1.689.809-2.699C9.52.061 8.479.628 7.87 1.367 7.318 2.038 6.862 3.033 7.039 4c.973.03 1.979-.551 2.564-1.301z"
        fill="#fff"
      />
    </Svg>
  );
}

export default SvgComponent;
