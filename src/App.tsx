import React from 'react';

import './App.css';
import Auth from './pages/Auth';
import { Provider } from "react-redux";

import store from "./store";
import ErrorReporter from './components/ErrorReporter';






function App() {

  React.useEffect(() => {


  }, [])
  return (
    <div className="App" >
      <Provider store={store}>
        <Auth />
        <ErrorReporter />
      </Provider>
    </div>
  );
}

export default App;
