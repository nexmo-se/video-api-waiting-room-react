import React, { useContext, useEffect, useRef, useState } from 'react';
import OT from '@opentok/client';
import { useHistory } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckBox from '@material-ui/icons/CheckBox';
import Error from '@material-ui/icons/Error';
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@material-ui/core';
import { usePublisher } from '../../hooks/usePublisher';
import { AudioSettings } from '../AudioSetting';
import { VideoSettings } from '../VideoSetting';
import { useNetworkTest } from '../../hooks/useNetworkTest';
import useStyles from './styles';
import { DEVICE_ACCESS_STATUS } from './../constants';
import LockIcon from '@material-ui/icons/Lock';
import ExtensionIcon from '@material-ui/icons/Extension';
import WifiIcon from '@material-ui/icons/Wifi';
import VideocamIcon from '@material-ui/icons/Videocam';
import Mic from '@material-ui/icons/Mic';

const defaultLocalAudio = true;
const defaultLocalVideo = true;

export function WaitingRoom() {
  const classes = useStyles();
  const { push } = useHistory();
  // LocalAudio and localVideo are used in the toggle function
  const [localAudio, setLocalAudio] = useState(defaultLocalAudio);
  const [localVideo, setLocalVideo] = useState(defaultLocalVideo);
  const [networkTestRunning, setNetworkTestRunning] = useState(false);
  /* const [showQualityDialog, setShowQualityDialog] = useState(false); */ //todo add the qualitt results
  const waitingRoomVideoContainer = useRef();

  // setAudioDevice and setVideoDevice are used in the Select Menu
  let [audioDevice, setAudioDevice] = useState('');
  let [videoDevice, setVideoDevice] = useState('');

  const {
    publisher,
    initPublisher,
    destroyPublisher,
    accessAllowed,
    logLevel,
    deviceInfo,
    pubInitialised
  } = usePublisher();

  const {
    connectivityTest,
    qualityTest,
    runNetworkTest,
    stopNetworkTest,
    isRunning
  } = useNetworkTest({
    apikey: process.env.REACT_APP_VIDEO_NETWORKTEST_API_KEY,
    sessionId: process.env.REACT_APP_VIDEO_NETWORKTEST_SESSION,
    token: process.env.REACT_APP_VIDEO_NETWORKTEST_TOKEN
  });

  const handleAudioChange = React.useCallback((e) => {
    setLocalAudio(e.target.checked);
  }, []);

  const handleVideoChange = React.useCallback((e) => {
    setLocalVideo(e.target.checked);
  }, []);

  const handleJoinClick = () => {
    stopNetworkTest(); // Stop network test
  };

  const handleVideoSource = React.useCallback(
    (e) => {
      const videoDeviceId = e.target.value;
      setVideoDevice(e.target.value);
      publisher.setVideoSource(videoDeviceId);
      // setLocalVideo(videoDeviceId);
    },
    [publisher, setVideoDevice]
  );

  const handleAudioSource = React.useCallback(
    (e) => {
      const audioDeviceLabel = e.target.value;
      if (deviceInfo && deviceInfo.audioInputDevices) {
        const audioDevices = deviceInfo.audioInputDevices;

        const deviceId = audioDevices.find(
          (e) => e.label === audioDeviceLabel
        )?.deviceId;

        if (deviceId != null) {
          publisher.setAudioSource(deviceId);
          setAudioDevice(audioDeviceLabel);
          // setLocalAudio(audioDeviceLabel);
        }
      }
    },
    [publisher, setAudioDevice, deviceInfo]
  );

  const toggleNetworkTest = React.useCallback(
    (e) => {
      // todo if it's running, don't re-run.
      if (isRunning) {
        stopNetworkTest();
      } else {
        runNetworkTest();
      }
    },
    [isRunning, runNetworkTest, stopNetworkTest]
  );

  /*  useEffect(() => {
    if (isRunning !== networkTestRunning) {
      setNetworkTestRunning(isRunning);
    }
  }, [isRunning, networkTestRunning]); */

  useEffect(() => {
    console.log('Waiting room - Mount');
    const publisherOptions = {
      publishAudio: defaultLocalAudio,
      publishVideo: defaultLocalVideo
    };
    if (waitingRoomVideoContainer.current) {
      initPublisher(waitingRoomVideoContainer.current.id, publisherOptions);
    }
  }, [initPublisher]);

  useEffect(() => {
    console.log('UseEffect - localAudio');
    if (publisher) {
      publisher.publishAudio(localAudio);
    }
  }, [localAudio, publisher]);

  useEffect(() => {
    console.log('UseEffect - LocalVideo');
    if (publisher) {
      publisher.publishVideo(localVideo);
    }
  }, [localVideo, publisher]);

  useEffect(() => {
    console.log('Effect Quality Test', qualityTest);
    if (!qualityTest.loading) {
      // TODO add it here setShowQualityDialog(true);
    }
  }, [qualityTest]);


  useEffect(() => {
    return () => {
      console.log('useEffect destroyPublisher Unmount');
      destroyPublisher();
    };
  }, [destroyPublisher]);

  useEffect(() => {
    if (publisher && pubInitialised && deviceInfo) {
      const currentAudioDevice = publisher.getAudioSource();
      const currentVideoDevice = publisher.getVideoSource();
      if (currentAudioDevice && currentAudioDevice.label) {
        setAudioDevice(currentAudioDevice.label);
      }
      if (currentVideoDevice && currentVideoDevice.deviceId) {
        setVideoDevice(currentVideoDevice.deviceId);
      }
    }
  }, [deviceInfo, pubInitialised, setAudioDevice, setVideoDevice, publisher]);

  return (
    <div className={classes.waitingRoomContainer}>
      <div className={classes.waitingRoomTests}>
        <div className={classes.featureCheck}>
          <div className={classes.waitingRoomTitle}>
            <LockIcon />
            <span>Camera and Microphone Permissions</span>
          </div>
          <div>
            <div className={classes.flexCentered}>
              <h5>Device Permissions: </h5>

              {accessAllowed === DEVICE_ACCESS_STATUS.PENDING ? (
                <CircularProgress size={30} />
              ) : accessAllowed === DEVICE_ACCESS_STATUS.ACCEPTED ? (
                <CheckBox className={classes.green}></CheckBox>
              ) : (
                <Error className={classes.red} />
              )}
            </div>
          </div>
        </div>
        <div className={classes.featureCheck}>
          <div className={classes.waitingRoomTitle}>
            <ExtensionIcon />
            <span>Browser Checks</span>
          </div>

          {OT.checkSystemRequirements() ? (
            <div className={classes.flexCentered}>
              <h5>The browser is supported </h5>
              <CheckBox className={classes.green}></CheckBox>
            </div>
          ) : (
            <Error className={classes.red} />
          )}
        </div>
        <div className={classes.featureCheck}>
          <div className={classes.networkTestContainer}>
            <div className={classes.waitingRoomTitle}>
              <WifiIcon />
              <span>Connectivity Test</span>
            </div>
            <div className={classes.flex}>
              <div>Connectivity Test </div>
              <div>
                {connectivityTest.loading ? (
                  <CircularProgress size={20} />
                ) : connectivityTest.data && connectivityTest.data.success ? (
                  <CheckBox className={classes.green}></CheckBox>
                ) : (
                  <Error className={classes.red} />
                )}
              </div>
            </div>
            <div className={classes.flex}>
              <div>Quality Test:</div>
              <div>
                {qualityTest.loading ? (
                  <CircularProgress size={20} />
                ) : qualityTest.data ? (
                  <CheckBox className={classes.green}></CheckBox>
                ) : (
                  <Error className={classes.red} />
                )}
              </div>
            </div>
            {/* <QualityTestDialog
            selectedValue={qualityTest}
            open={showQualityDialog}
            onClose={handleQualityTestDialogClose}
          ></QualityTestDialog> */}
          </div>
        </div>
        <div className={classes.featureCheck}>
          <div className={classes.waitingRoomTitle}>
            <VideocamIcon />
            <span>Camera</span>
          </div>
          <div
            id="waiting-room-video-container"
            className={classes.waitingRoomVideoPreview}
            ref={waitingRoomVideoContainer}
          ></div>
          <div className={classes.deviceContainer}>
            {deviceInfo && pubInitialised && (
              <FormControl>
                <span id="video">Select Video Source</span>
                {deviceInfo.videoInputDevices && (
                  <Select
                    labelId="video"
                    id="demo-simple-select"
                    value={videoDevice}
                    onChange={handleVideoSource}
                  >
                    {deviceInfo.videoInputDevices.map((device) => (
                      <MenuItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            )}
            <VideoSettings
              className={classes.deviceSettings}
              hasVideo={localVideo}
              onVideoChange={handleVideoChange}
            />
          </div>
          <div>
            <div className={classes.waitingRoomTitle}>
              <Mic />
              <span>Microphone</span>
            </div>
            <AudioSettings
              className={classes.deviceSettings}
              hasAudio={localAudio}
              onAudioChange={handleAudioChange}
            />
            <LinearProgress variant="determinate" value={logLevel} />
            {deviceInfo && pubInitialised && (
              <FormControl>
                <span>Select Audio Source</span>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={audioDevice}
                  onChange={handleAudioSource}
                >
                  {deviceInfo.audioInputDevices.map((device) => (
                    <MenuItem key={device.label} value={device.label}>
                      {device.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        </div>
      </div>
      <div className={classes.waitingRoomButtons}>
        <Grid container justify="center" alignItems="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={toggleNetworkTest}
          >
            {isRunning ? 'Stop Test' : 'Run Test'}
          </Button>
          <Button variant="contained" color="primary" onClick={handleJoinClick}>
            Join Call
          </Button>
        </Grid>
      </div>
    </div>
  );
}
