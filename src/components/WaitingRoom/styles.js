import { makeStyles } from '@material-ui/core/styles';
import { green, red } from '@material-ui/core/colors';
export default makeStyles((theme) => ({
  waitingRoomContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  waitingRoomTests: {
    display: 'flex',
    flexDirection: 'row',
    '& > *': {
      flex: '1 1 0px'
    }
  },
  featureCheck: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '15px',
    padding: '5px 15px',
    background: '#f3f3f3'
  },
  waitingRoomTitle: {
    fontSize: '24px',
    fontWeight: 500,
    marginLeft: '15px',
    display: 'flex',
    alignItems: 'center'
  },
  waitingRoomButtons: {
    display: 'flex',
    flexDirection: 'row'
  },
  waitingRoomVideoPreview: {
    width: '360px',
    height: '264px'
  },
  deviceContainer: {
    display: 'flex',
    flexDirection: 'column',
    margin: '10px 5px'
  },
  deviceSettings: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  networkTestContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  flex: {
    display: 'flex'
  },
  flexCentered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  green: {
    color: green[600]
  },
  red: {
    color: red[600]
  },
  networkTest: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '3px'
  }
}));
