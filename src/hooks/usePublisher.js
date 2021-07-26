import React, { useCallback, useRef, useState } from 'react';
import OT from '@opentok/client';
import { DEVICE_ACCESS_STATUS } from './../components/constants';
import useDevices from '../hooks/useDevices';

export function usePublisher() {
  const [isPublishing, setIsPublishing] = useState(false);
  let [logLevel, setLogLevel] = useState(0);
  const [pubInitialised, setPubInitialised] = useState(false);
  const [accessAllowed, setAccessAllowed] = useState(
    DEVICE_ACCESS_STATUS.PENDING
  );
  const publisherRef = useRef();
  const { deviceInfo, getDevices } = useDevices();

  const streamCreatedListener = React.useCallback(({ stream }) => {}, []);

  const calculateAudioLevel = React.useCallback((event) => {
    let movingAvg = null;
    if (movingAvg === null || movingAvg <= event.audioLevel) {
      movingAvg = event.audioLevel;
    } else {
      movingAvg = 0.8 * movingAvg + 0.2 * event.audioLevel;
    }
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const currentLogLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    setLogLevel(Math.min(Math.max(currentLogLevel, 0), 1) * 100);
  }, []);

  const streamDestroyedListener = useCallback(({ stream }) => {
    publisherRef.current = null;
    setPubInitialised(false);
    setIsPublishing(false);
  }, []);

  const accessDeniedListener = useCallback(() => {
    publisherRef.current = null;
    console.log('UsePublisher - accessDeniedListener');
    setAccessAllowed(DEVICE_ACCESS_STATUS.REJECTED);
    setPubInitialised(false);
  }, []);

  const accessAllowedListener = useCallback(() => {
    console.log('UsePublisher - accessAllowedListener');
    getDevices();
    setAccessAllowed(DEVICE_ACCESS_STATUS.ACCEPTED);
  }, [getDevices]);

  const initPublisher = useCallback(
    (containerId, publisherOptions) => {
      console.log('UsePublisher - initPublisher');
      if (publisherRef.current) {
        console.log('UsePublisher - Already initiated');
        return;
      }
      if (!containerId) {
        console.log('UsePublisher - Container not available');
      }
      const finalPublisherOptions = Object.assign({}, publisherOptions, {
        insertMode: 'append',
        width: '100%',
        height: '100%',
        style: {
          buttonDisplayMode: 'off',
          nameDisplayMode: 'on'
        },
        showControls: false
      });
      console.log('usePublisher finalPublisherOptions', finalPublisherOptions);
      publisherRef.current = OT.initPublisher(
        containerId,
        finalPublisherOptions,
        (err) => {
          if (err) {
            console.log('[usePublisher]', err);
            publisherRef.current = null;
          }
          console.log('Publisher Created');
          setPubInitialised(true);
        }
      );
      publisherRef.current.on('accessAllowed', accessAllowedListener);
      publisherRef.current.on('accessDenied', accessDeniedListener);
      publisherRef.current.on('streamCreated', streamCreatedListener);
      publisherRef.current.on('streamDestroyed', streamDestroyedListener);
      publisherRef.current.on('audioLevelUpdated', calculateAudioLevel);
    },
    [
      streamCreatedListener,
      streamDestroyedListener,
      accessDeniedListener,
      accessAllowedListener,
      calculateAudioLevel
    ]
  );

  const destroyPublisher = useCallback(() => {
    if (!publisherRef.current) {
      return;
    }
    publisherRef.current.on('destroyed', () => {
      console.log('publisherRef.current Destroyed');
    });
    publisherRef.current.destroy();
  }, []);

  return {
    publisher: publisherRef.current,
    initPublisher,
    destroyPublisher,
    pubInitialised,
    accessAllowed,
    logLevel,
    deviceInfo
  };
}
