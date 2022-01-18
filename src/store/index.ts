import {  configureStore } from "@reduxjs/toolkit";
import { logger } from "./middleware";
import { AuthAction, authReducer, AuthState, HomeState, HomeAction, homeReducer } from "./reducers";


export interface AppState {
    auth: AuthState;
    home: HomeState
 
    // settings: SettingsState
    
}

 

export default configureStore<AppState, AuthAction & HomeAction >({
    reducer: {
        auth: authReducer,
        home: homeReducer,
        // settings: settingsReducer
    }, middleware: [logger]
})