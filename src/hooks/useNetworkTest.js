import { useCallback, useEffect, useRef, useState } from 'react';
import OT from '@opentok/client';
import NetworkTest from 'opentok-network-test-js';

const networkTestVideoTimeout = 15000; // To Edit to 30s
const startTestOnLoad = true;

export const useNetworkTest = ({ apikey, sessionId, token }) => {
  /* const [otNetworkTest, setOtNetworkTest] = useState(null); */
  const otNetworkTest = useRef();
  const [runTest, setRunTest] = useState(startTestOnLoad);
  const [isRunning, setIsRunning] = useState(false);
  const [connectivityTest, setConnectivityTest] = useState({
    data: null,
    loading: true
  });
  const [qualityTest, setQualityTest] = useState({ data: null, loading: true });

  const initNetworkTest = useCallback(() => {
    otNetworkTest.current = new NetworkTest(
      OT,
      {
        apiKey: apikey,
        sessionId,
        token
      },
      { timeout: networkTestVideoTimeout }
    );
    // setOtNetworkTest(instance);
  }, [apikey, sessionId, token]);

  const runNetworkTest = useCallback(() => {
    console.log('runNetworkTest - useCallback - runTest', runTest);
    if (otNetworkTest.current && runTest && !isRunning) {
      setRunTest(false);
      setIsRunning(true);
      setConnectivityTest((state) => ({ data: state.data, loading: true }));
      setQualityTest((state) => ({ data: state.data, loading: true }));
      otNetworkTest.current
        .testConnectivity()
        .then((results) => {
          if (otNetworkTest.current) {
            console.log('OpenTok connectivity test results', results);
            setConnectivityTest((state) => ({ loading: false, data: results }));
          }
          if (otNetworkTest.current) {
            otNetworkTest.current
              .testQuality(function updateCallback(stats) {
                console.log('intermediate testQuality stats', stats);
              })
              .then((results) => {
                // This function is called when the quality test is completed.
                console.log('OpenTok quality results', results);
                if (otNetworkTest.current) {
                  setQualityTest((state) => ({
                    data: results,
                    loading: false
                  }));
                }
                setIsRunning(false);
              })
              .catch((error) => {
                console.log('OpenTok quality test error', error);
                setIsRunning(false);
              });
          }
        })
        .catch(function (error) {
          console.log('OpenTok connectivity test error', error);
          setIsRunning(false);
        });
    }
  }, [otNetworkTest, runTest, isRunning]);

  /**
   * Stop the network testConnectivity test. Pleae check limitation
   * https://github.com/opentok/opentok-network-test-js#otnetworkteststop
   */
  const stopNetworkTest = useCallback(() => {
    if (otNetworkTest.current && !runTest) {
      console.log('stopNetworkTest - useCallback STOP#2', runTest);
      otNetworkTest.current.stop();
      otNetworkTest.current = null;
      initNetworkTest();
      setRunTest(true);
      setIsRunning(false);
      setConnectivityTest({ data: null, loading: true });
      setQualityTest({ data: null, loading: true });
    }
  }, [otNetworkTest, runTest, initNetworkTest]);

  useEffect(() => {
    initNetworkTest();
  }, [initNetworkTest]);

  return {
    connectivityTest,
    qualityTest,
    initNetworkTest,
    runNetworkTest,
    stopNetworkTest,
    runTest,
    setRunTest,
    isRunning
  };
};
