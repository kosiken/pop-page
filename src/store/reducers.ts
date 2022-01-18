import { Action } from "@reduxjs/toolkit";

import { User } from "../models";
export interface AuthState {
  user?: User;
  token?: string;
}

export interface SettingsState {
  darkMode: boolean;
  autoPlay: boolean;
  volume: number;
}
type authActions = "login" | "logout" | "update";
type settingsActions = "change-theme" | "change-volume" | "change-autoplay";

type homeActions =  "show-error" | "load-candidates";

export interface AuthAction extends Action<authActions> {
  user?: User;
  token?: string;
  shouldSet: boolean;
}

export interface HomeAction extends Action<homeActions> {

  errorMessage?: string;
}

export interface HomeState {
  errorMessage: string;

}



export interface SettingsAction extends Action<settingsActions> {
  value: boolean | number;
}

let initalAuthState: AuthState = {
  // user: DefaultUser,
  user: undefined,
};

let initialHomeState: HomeState = {
 
  errorMessage: ""
};
// let initialSettingsState: SettingsState = {
//   darkMode: false,
//   autoPlay: false,
//   volume: 80,
// };

export function authReducer(
  state = initalAuthState,
  action: AuthAction
): AuthState {
  let returnObj = null;
  switch (action.type) {
    case "login":
      returnObj = { ...state };

      returnObj.user = action.user;
      returnObj.token = action.token;
      if (action.shouldSet) {

        localStorage.setItem("token", returnObj.token!);
        // localStorage.setItem("user", JSON.stringify(returnObj.user));
        window.location.pathname = "/";
        return returnObj;
      }
     
  

      break;
    case "logout":
      window.localStorage.removeItem("token");
      returnObj = initalAuthState;
      window.location.pathname = "/admin/auth"

      break;

    case "update":
      returnObj = { ...state };
      let user: any =  action.user!;

      returnObj.user = user;
      break;
    default:
      console.warn("unknown action " + action.type);
      break;
  }
  if (returnObj == null) return state;
  else return returnObj;
}


export function homeReducer(
  state = initialHomeState,
  action: HomeAction
): HomeState {
  let returnObj = null;
  switch (action.type) {

    
      case "show-error":
        returnObj = { ...state};
        returnObj.errorMessage = action.errorMessage!;
       
        break;
    default:
      console.warn("unknown action " + action.type);
      break;
  }
  
  if (returnObj == null) return state;

  else return returnObj;
}
