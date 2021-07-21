import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import { WaitingRoom } from './components/WaitingRoom';
import { Home } from './components/Home';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/waiting-room" component={WaitingRoom} />
        <Route path="/">
          <Redirect to="/waiting-room" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
