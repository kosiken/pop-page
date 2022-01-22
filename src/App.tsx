import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import Auth from './pages/Auth';
import { Provider, useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";

import { AppState } from "./store";

import Typography from '@mui/material/Typography';

import store from "./store";
import ErrorReporter from './components/ErrorReporter';
import Home from './pages/Dashboard/Home';
import VotingCategoryPage from './pages/Dashboard/VotingCategoryPage';
import LoadingPageIndicator from './components/LoadingPageIndicator';
import {  AuthAction } from './store/reducers'
import { LionAppDb } from './firebaseObjects';
import { User } from './models';
import VotingHome from './pages/Standard/VotingHome';
import Profile from './pages/Profile';
import VotingCategoryUserPage from './pages/Standard/VoteForCandidate';
import LogOut from './pages/LogOut';
import Spacer from './components/Spacer';
import ViewUser from './pages/ViewUser';


const AdminApp = () => {
  return (<Switch>
    <Route exact path={'/'}>
      <Home />
    </Route>

    <Route exact path={'/voting-category/:id'}>
      <VotingCategoryPage />
    </Route>
    <Route exact path={'/view-user/:id'}>
      <ViewUser />
    </Route>
    <Route exact path={'/my-profile'}>
      <Profile />
    </Route>
    <Route exact path={'/log-out'}>
      <LogOut />
    </Route>
  </Switch>)
}


const StandardApp = () => {
  return (
  
  <Switch>
    <Route exact path={'/'}>
      <VotingHome />
    </Route>
    <Route exact path={'/view-user/:id'}>
      <ViewUser />
    </Route>
    <Route exact path={'/voting-category/:id'}>
      <VotingCategoryUserPage />
    </Route>
    <Route exact path={'/log-out'}>
      <LogOut />
    </Route>
    <Route exact path={'/my-profile'}>
      <Profile />
    </Route>

  </Switch>)
}


const Main = () => {

  let user = useSelector((state: AppState) => state.auth.user);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();


  useEffect(() => {
    const check = async() => {
    let token = window.localStorage.getItem("token");
    if(token) {
      if(token !== "NONE") {
        const userRef = doc(LionAppDb, "app-users", token);
        const userDoc = await getDoc(userRef);
        if(userDoc.exists()) {
          let toCreate: any  = userDoc.data();
          toCreate.id = token;
          if(!toCreate.picUrl) toCreate.picUrl = ''
          const theUser = new User(toCreate);
          dispatch<AuthAction>({ type: "login", user: theUser, token: theUser.id, shouldSet: false })
          setAuthenticated(true)
 
        }
      }
   
    } 
    setLoading(false);
  }
  check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {

    if (!!user) {

      setAuthenticated(true);
    }
    else {
      setAuthenticated(false);
    }

  }, [user])

  const admin = (
    <Router>


      <AdminApp />

    </Router>
  )

  const standard = (<Router>


    <StandardApp />

  </Router>)

  if (loading) return (<LoadingPageIndicator />)
  else if (authenticated) return !!user ? (user.isAdmin ? admin : standard) : <LoadingPageIndicator />
  return <Auth />
}


function App() {

  React.useEffect(() => {


  }, [])
  return (
    <div className="App" >
      <Provider store={store}>

        <Main />

        <ErrorReporter />
      </Provider>

<Spacer />
<Spacer />
      <Typography variant="body2" gutterBottom>
        &copy; 2022 KRC Media
      </Typography>
    </div>
  );
}

export default App;
// <Auth />