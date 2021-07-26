import React from 'react';

import Switch from '@material-ui/core/Switch';

export const AudioSettings = React.memo(
  ({ hasAudio, onAudioChange, className }) => {
    return (
      <div className={className}>
        <div>Microphone</div>
        <Switch
          checked={hasAudio}
          onChange={onAudioChange}
          name="AudioToggle"
        />
      </div>
    );
  }
);
