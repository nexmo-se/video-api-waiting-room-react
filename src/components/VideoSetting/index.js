import React from 'react';

import Videocam from '@material-ui/icons/Videocam';
import Switch from '@material-ui/core/Switch';

export const VideoSettings = React.memo(
  ({ hasVideo, onVideoChange, className }) => {
    return (
      <div className={className}>
        <div>Video</div>
        <Switch
          checked={hasVideo}
          onChange={onVideoChange}
          name="VideoToggle"
        />
      </div>
    );
  }
);
