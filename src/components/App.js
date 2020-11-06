import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import * as duckAuth from '../duckAuth.js';
import { getToken } from '../utils/token';
import Ducks from './Ducks.js';
import Login from './Login.js';
import MyProfile from './MyProfile.js';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register.js';
import './styles/App.css';

class ___App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      loggedIn: false
    }
    this.tokenCheck = this.tokenCheck.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    this.tokenCheck();
  };


  handleLogin(userData) {
    this.setState({
      loggedIn: true,
      userData,
    })
  }

  tokenCheck = () => {
    const { location } = this.props;
    if (localStorage.getItem('jwt')){
      let jwt = localStorage.getItem('jwt');
      duckAuth.getContent(jwt).then((res) => {
        if (res){
          let userData = {
            username: res.username,
            email: res.email
          }
          this.setState({
            loggedIn: true,
            userData
          }, () => {
            this.props.history.push(location.path);
          });
        }
      });
    }
  }

  render(){
    return (
      <Switch>
        <ProtectedRoute path="/ducks" loggedIn={this.state.loggedIn} component={Ducks} />
        <ProtectedRoute path="/my-profile" loggedIn={this.state.loggedIn} userData={this.state.userData} component={MyProfile} />
        <Route path="/login">
          <div className="loginContainer">
            <Login handleLogin={this.handleLogin} tokenCheck={this.tokenCheck} />
          </div>
        </Route>
        <Route path="/register" component={() => import('./Register')}/>
        <Route>
          {this.state.loggedIn ? <Redirect to="/ducks" /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    )
  }
}

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ username: '', email: ''});
  const history = useHistory();

  const handleLogin = (userData) => {
    setUserData(userData);
    setLoggedIn(true);
  }

  const tokenCheck = () => {
    const jwt = getToken();

    if (!jwt) {
      return;
    }

    duckAuth.getContent(jwt).then((res) => {
      if (res) {
        const userData = {
          username: res.username,
          email: res.email
        }
        setLoggedIn(true);
        setUserData(userData);
        history.push('/ducks')
      }
    });
  }

    useEffect(() => {
      tokenCheck();
  }, []);

    return (
      <Switch>
        <ProtectedRoute path="/ducks" loggedIn={loggedIn} component={Ducks} />
        <ProtectedRoute path="/my-profile" loggedIn={loggedIn} userData={userData} component={MyProfile} />
        <Route path="/login">
          <div className="loginContainer">
            <Login handleLogin={handleLogin} />
          </div>
        </Route>
        <Route path="/register">
          <div className="registerContainer">
            <Register />
          </div>
        </Route>
        <Route>
          {loggedIn ? <Redirect to="/ducks" /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    )
}

export default App;
