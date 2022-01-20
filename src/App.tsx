import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useRouteMatch,
  useLocation,
  Redirect,
} from "react-router-dom";
import './App.css';
import Auth from './pages/Auth';
import { Provider, useSelector, useDispatch } from "react-redux";




import store from "./store";
import ErrorReporter from './components/ErrorReporter';
import Home from './pages/Dashboard/Home';
import VotingCategoryPage from './pages/Dashboard/VotingCategoryPage';
import LoadingPageIndicator from './components/LoadingPageIndicator';
import {AuthState, AuthAction} from './store/reducers'


const AdminApp = () => {
 return (<Switch>
      <Route exact  path={'/'}>
         <Home />
        </Route>

        <Route exact  path={'/voting-category/:id'}>
         <VotingCategoryPage />
        </Route>
 </Switch>)
}


const StandardApp = () => {
  return (<Switch>
    <Route exact  path={'/'}>
       <p>home</p>
      </Route>

      <Route exact  path={'/become-candidate'}>
       <p>candidate</p>
      </Route>
      <Route exact  path={'/my-profile'}>
       <p>my-profile</p>
      </Route>

</Switch>)
}


const Main = () => {


  const admin = (
    <Router>
      
          
    <AdminApp />

</Router> 
  )

  const standard = (      <Router>
      
          
    <StandardApp />

</Router> )

  return (<LoadingPageIndicator />)
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
    </div>
  );
}

export default App;
// <Auth />